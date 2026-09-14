import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
  Truck,
  Users,
  Waves,
} from "lucide-react";

import { useApp } from "../../state/AppContext";
import { cityData } from "../../data/mockData";
import {
  CitizenReport,
  getCitizenReports,
  updateCitizenReportStatus,
  verifyCitizenReport,
} from "../../data/api";

type ResponseStatus =
  | "Awaiting dispatch"
  | "Team assigned"
  | "En route"
  | "On site"
  | "Resolved";

type Priority = "CRITICAL" | "HIGH" | "MODERATE";

interface ResponseItem {
  id: string;
  reportId?: number;
  location: string;
  zone: string;
  priority: Priority;
  cause: string;
  predictedDepth?: number;
  onset?: number;
  team: string;
  status: ResponseStatus;
  source: "Model forecast" | "Citizen report";
  modelRelevant?: boolean;
}

const priorityStyles: Record<Priority, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const statusStyles: Record<ResponseStatus, string> = {
  "Awaiting dispatch": "bg-gray-100 text-gray-700",
  "Team assigned": "bg-blue-100 text-blue-800",
  "En route": "bg-orange-100 text-orange-800",
  "On site": "bg-purple-100 text-purple-800",
  Resolved: "bg-green-100 text-green-800",
};

function normalizePriority(severity?: string): Priority {
  switch ((severity ?? "").toUpperCase()) {
    case "CRITICAL":
      return "CRITICAL";
    case "HIGH":
      return "HIGH";
    default:
      return "MODERATE";
  }
}

function getModelResponseItems(city: any): ResponseItem[] {
  if (!city?.hotspots) return [];

  return city.hotspots
    .filter((hotspot: any) =>
      ["CRITICAL", "HIGH", "MODERATE"].includes(
        String(hotspot.risk ?? "").toUpperCase()
      )
    )
    .map((hotspot: any, index: number) => ({
      id: `model-${index}-${hotspot.id ?? hotspot.name ?? "hotspot"}`,
      location: hotspot.name ?? hotspot.location ?? "Priority flood location",
      zone: hotspot.zone ?? "Model forecast zone",
      priority: normalizePriority(hotspot.risk),
      cause:
        hotspot.cause ??
        hotspot.reason ??
        "Forecast rainfall and drainage stress",
      predictedDepth:
        typeof hotspot.predictedDepth === "number"
          ? hotspot.predictedDepth
          : undefined,
      onset:
        typeof hotspot.onset === "number" ? hotspot.onset : undefined,
      team: hotspot.assignedTeam ?? "Unassigned",
      status: hotspot.status ?? "Awaiting dispatch",
      source: "Model forecast",
    }));
}

function mapCitizenReport(
  report: CitizenReport,
  localStatus?: ResponseStatus
): ResponseItem {
  let status: ResponseStatus;

  if (localStatus) {
    status = localStatus;
  } else if (report.status.toLowerCase() === "resolved") {
    status = "Resolved";
  } else if (report.assigned_team) {
    status = "Team assigned";
  } else {
    status = "Awaiting dispatch";
  }

  return {
    id: `report-${report.id}`,
    reportId: report.id,
    location: report.location,
    zone: "Citizen-reported location",
    priority: normalizePriority(report.severity),
    cause:
      report.description?.trim() ||
      `${report.issue_type} reported by citizen`,
    team: report.assigned_team || "Unassigned",
    status,
    source: "Citizen report",
    modelRelevant: report.model_relevant,
  };
}

export default function FieldResponseScreen() {
  const { state } = useApp();

  const city = cityData[state.city];

  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<
    Record<number, ResponseStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReports(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const reports = await getCitizenReports();

      setCitizenReports(reports);
    } catch (err) {
      console.error("Failed to load citizen reports:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load citizen reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReports();

    const interval = window.setInterval(() => {
      loadReports();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const modelItems = useMemo(
    () => getModelResponseItems(city),
    [city]
  );

  const citizenItems = useMemo(() => {
    return citizenReports
      .filter((report) => {
        const status = report.status.toLowerCase();

        return (
          status === "confirmed" ||
          status === "assigned" ||
          status === "resolved" ||
          Boolean(report.assigned_team)
        );
      })
      .map((report) =>
        mapCitizenReport(report, localStatuses[report.id])
      );
  }, [citizenReports, localStatuses]);

  const responseItems = useMemo(
    () => [...modelItems, ...citizenItems],
    [modelItems, citizenItems]
  );

  useEffect(() => {
    if (!selectedId && responseItems.length > 0) {
      setSelectedId(responseItems[0].id);
    }

    if (
      selectedId &&
      responseItems.length > 0 &&
      !responseItems.some((item) => item.id === selectedId)
    ) {
      setSelectedId(responseItems[0].id);
    }
  }, [responseItems, selectedId]);

  const selectedItem = responseItems.find(
    (item) => item.id === selectedId
  );

  const criticalItems = responseItems.filter(
    (item) => item.priority === "CRITICAL"
  );

  const activeItems = responseItems.filter(
    (item) =>
      item.status === "Team assigned" ||
      item.status === "En route" ||
      item.status === "On site"
  );

  const teamsDeployed = responseItems.filter(
    (item) =>
      item.status === "En route" || item.status === "On site"
  ).length;

  function setLocalStatus(id: string, status: ResponseStatus) {
    const item = responseItems.find((entry) => entry.id === id);

    if (!item?.reportId) return;

    setLocalStatuses((current) => ({
      ...current,
      [item.reportId!]: status,
    }));
  }

  async function handleAssign(item: ResponseItem) {
    if (!item.reportId) {
      setLocalStatus(item.id, "Team assigned");
      return;
    }

    try {
      setError(null);

      const report = citizenReports.find(
        (entry) => entry.id === item.reportId
      );

      await verifyCitizenReport(item.reportId, {
        verified: true,
        model_relevant: report?.model_relevant ?? false,
        assigned_team:
          item.team !== "Unassigned"
            ? item.team
            : "Rapid Response Team",
      });

      await updateCitizenReportStatus(item.reportId, "Assigned");

      await loadReports(true);
    } catch (err) {
      console.error("Failed to assign response team:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign response team."
      );
    }
  }

  function handleDispatch(item: ResponseItem) {
    if (item.reportId) {
      setLocalStatus(item.id, "En route");
      return;
    }

    setLocalStatus(item.id, "En route");
  }

  function handleOnSite(item: ResponseItem) {
    if (item.reportId) {
      setLocalStatus(item.id, "On site");
      return;
    }

    setLocalStatus(item.id, "On site");
  }

  async function handleResolve(item: ResponseItem) {
    if (!item.reportId) {
      setLocalStatus(item.id, "Resolved");
      return;
    }

    try {
      setError(null);

      await updateCitizenReportStatus(item.reportId, "Resolved");

      setLocalStatuses((current) => {
        const next = { ...current };
        delete next[item.reportId!];
        return next;
      });

      await loadReports(true);
    } catch (err) {
      console.error("Failed to resolve report:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resolve citizen report."
      );
    }
  }

  function renderActionButton(item: ResponseItem) {
    switch (item.status) {
      case "Awaiting dispatch":
        return (
          <button
            onClick={() => handleAssign(item)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Users className="h-4 w-4" />
            Assign Response Team
          </button>
        );

      case "Team assigned":
        return (
          <button
            onClick={() => handleDispatch(item)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Truck className="h-4 w-4" />
            Dispatch Team
          </button>
        );

      case "En route":
        return (
          <button
            onClick={() => handleOnSite(item)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <MapPin className="h-4 w-4" />
            Mark On Site
          </button>
        );

      case "On site":
        return (
          <button
            onClick={() => handleResolve(item)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Resolved
          </button>
        );

      case "Resolved":
        return (
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Incident resolved
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f1] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#8f1d2c]" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f1d2c]">
                Authority Operations
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Field Response
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Detect → Prioritize → Assign → Dispatch → Verify → Resolve
            </p>
          </div>

          <button
            onClick={() => loadReports(true)}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Backend state */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Backend connection issue</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Priority locations
              </span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {responseItems.length}
            </div>
          </div>

          <div className="border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Critical
              </span>
              <Waves className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {criticalItems.length}
            </div>
          </div>

          <div className="border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Active responses
              </span>
              <Truck className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {activeItems.length}
            </div>
          </div>

          <div className="border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Teams deployed
              </span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {teamsDeployed}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="border border-gray-200 bg-white p-10 text-center">
            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-gray-500" />
            <p className="text-sm text-gray-600">
              Loading field response queue…
            </p>
          </div>
        ) : responseItems.length === 0 ? (
          <div className="border border-gray-200 bg-white p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-green-600" />
            <h2 className="font-semibold text-gray-900">
              No locations requiring field response
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Verified citizen reports and model priority locations will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Queue */}
            <section className="border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Response Queue
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Model signals and verified citizen reports requiring action.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {responseItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`block w-full p-5 text-left transition hover:bg-gray-50 ${
                      selectedId === item.id ? "bg-[#faf7f3]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-bold tracking-wide ${
                              priorityStyles[item.priority]
                            }`}
                          >
                            {item.priority}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                              statusStyles[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {item.location}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.zone}
                        </p>
                      </div>

                      {item.source === "Citizen report" ? (
                        <div className="shrink-0 rounded border border-[#d9b7bd] bg-[#fbf0f2] px-2 py-1 text-[10px] font-semibold text-[#8f1d2c]">
                          Citizen report
                        </div>
                      ) : (
                        <div className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-600">
                          Model forecast
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400">Depth / report</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {item.predictedDepth != null
                            ? `${item.predictedDepth} cm`
                            : "Field report"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Onset</p>
                        <p className="mt-1 font-medium text-gray-800">
                          {item.onset != null
                            ? `${item.onset} min`
                            : "Reported now"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Selected incident */}
            <section className="border border-gray-200 bg-white">
              {selectedItem ? (
                <>
                  <div className="border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Selected response
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-gray-900">
                          {selectedItem.location}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[selectedItem.status]
                        }`}
                      >
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 p-5">
                    {/* Source */}
                    <div className="flex items-start gap-3 border-b border-gray-100 pb-5">
                      {selectedItem.source === "Citizen report" ? (
                        <MapPin className="mt-0.5 h-5 w-5 text-[#8f1d2c]" />
                      ) : (
                        <Waves className="mt-0.5 h-5 w-5 text-blue-600" />
                      )}

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedItem.source}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {selectedItem.cause}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Priority</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.priority}
                        </p>
                      </div>

                      <div className="border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Response team</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.team}
                        </p>
                      </div>

                      <div className="border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Predicted depth
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.predictedDepth != null
                            ? `${selectedItem.predictedDepth} cm`
                            : "Not available"}
                        </p>
                      </div>

                      <div className="border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Expected onset
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedItem.onset != null
                            ? `${selectedItem.onset} min`
                            : "Not available"}
                        </p>
                      </div>
                    </div>

                    {/* Workflow */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Response workflow
                      </p>

                      <div className="space-y-3">
                        {[
                          ["Detect", true],
                          [
                            "Prioritize",
                            selectedItem.priority !== "MODERATE",
                          ],
                          [
                            "Assign",
                            selectedItem.status !== "Awaiting dispatch",
                          ],
                          [
                            "Dispatch",
                            ["En route", "On site", "Resolved"].includes(
                              selectedItem.status
                            ),
                          ],
                          [
                            "On site",
                            ["On site", "Resolved"].includes(
                              selectedItem.status
                            ),
                          ],
                          ["Resolve", selectedItem.status === "Resolved"],
                        ].map(([label, complete]) => (
                          <div
                            key={String(label)}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                complete
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {complete ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Clock3 className="h-4 w-4" />
                              )}
                            </div>

                            <span
                              className={`text-sm ${
                                complete
                                  ? "font-medium text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="border-t border-gray-100 pt-5">
                      {renderActionButton(selectedItem)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  Select a response location.
                </div>
              )}
            </section>
          </div>
        )}

        {/* Prototype note */}
        <div className="mt-6 border border-gray-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#8f1d2c]" />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Operational data status
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Citizen report verification, team assignment and resolution are
                persisted through the FastAPI backend. Dispatch and on-site
                states are currently local prototype state and reset on refresh.
                Model forecast response locations remain demonstration model
                data until the full operational dispatch integration is added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}