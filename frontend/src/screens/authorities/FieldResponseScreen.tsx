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
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

type Priority =
  | "CRITICAL"
  | "HIGH"
  | "MODERATE";

type ResponseSource =
  | "Model forecast"
  | "Citizen report";

type ResponseItem = {
  id: string;
  reportId?: string;
  location: string;
  zone: string;
  priority: Priority;
  cause: string;
  predictedDepth: number;
  onset: string | null;
  team: string;
  status: ResponseStatus;
  source: ResponseSource;
  modelRelevant: boolean;
};

const priorityStyles: Record<
  Priority,
  {
    text: string;
    bg: string;
    border: string;
    dot: string;
  }
> = {
  CRITICAL: {
    text: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-600",
  },
  HIGH: {
    text: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  MODERATE: {
    text: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

const statusStyles: Record<
  ResponseStatus,
  {
    text: string;
    bg: string;
    border: string;
  }
> = {
  "Awaiting dispatch": {
    text: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  "Team assigned": {
    text: "text-maroon-700",
    bg: "bg-maroon-50",
    border: "border-maroon-200",
  },
  "En route": {
    text: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  "On site": {
    text: "text-green-800",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  Resolved: {
    text: "text-warm-700",
    bg: "bg-warm-100",
    border: "border-warm-200",
  },
};

function normalizePriority(value: unknown): Priority {
  const normalized = String(value ?? "").toUpperCase();

  if (normalized === "CRITICAL") {
    return "CRITICAL";
  }

  if (normalized === "HIGH") {
    return "HIGH";
  }

  return "MODERATE";
}

function getPriorityRank(priority: Priority) {
  if (priority === "CRITICAL") {
    return 3;
  }

  if (priority === "HIGH") {
    return 2;
  }

  return 1;
}

function getModelResponseItems(
  city: any
): ResponseItem[] {
  const hotspots = city?.hotspots ?? [];

  return hotspots
    .filter((hotspot: any) => {
      const risk = String(
        hotspot?.risk ??
          hotspot?.riskLevel ??
          hotspot?.severity ??
          hotspot?.level ??
          "MODERATE"
      ).toUpperCase();

      return (
        risk === "CRITICAL" ||
        risk === "HIGH" ||
        risk === "MODERATE"
      );
    })
    .map(
      (
        hotspot: any,
        index: number
      ) => {
        const risk = normalizePriority(
          hotspot?.risk ??
            hotspot?.riskLevel ??
            hotspot?.severity ??
            hotspot?.level ??
            "MODERATE"
        );

        const location =
          hotspot?.location ??
          hotspot?.name ??
          hotspot?.zone ??
          `Priority zone ${index + 1}`;

        const zone =
          hotspot?.zone ??
          hotspot?.area ??
          hotspot?.locality ??
          "Delhi operational zone";

        const cause =
          hotspot?.cause ??
          hotspot?.reason ??
          hotspot?.driver ??
          "Forecast flood risk";

        const depth = Number(
          hotspot?.depthMax ??
            hotspot?.predictedDepth ??
            hotspot?.depth ??
            0
        );

        const onset =
          hotspot?.onset ??
          hotspot?.onsetTime ??
          hotspot?.expectedOnset ??
          null;

        return {
          id: `model-${hotspot?.id ?? index}`,
          location: String(location),
          zone: String(zone),
          priority: risk,
          cause: String(cause),
          predictedDepth: Number.isFinite(
            depth
          )
            ? depth
            : 0,
          onset:
            onset === null ||
            onset === undefined
              ? null
              : String(onset),
          team: "Unassigned",
          status: "Awaiting dispatch",
          source: "Model forecast",
          modelRelevant: true,
        };
      }
    );
}

function mapCitizenReport(
  report: CitizenReport,
  localStatus?: ResponseStatus
): ResponseItem {
  const reportAny = report as any;

  const severity =
    reportAny?.severity ??
    reportAny?.priority ??
    reportAny?.risk ??
    "MODERATE";

  const location =
    reportAny?.location ??
    reportAny?.address ??
    reportAny?.description ??
    "Citizen-reported location";

  const zone =
    reportAny?.zone ??
    reportAny?.area ??
    reportAny?.ward ??
    "Delhi operational zone";

  const cause =
    reportAny?.cause ??
    reportAny?.category ??
    reportAny?.issue_type ??
    "Citizen-reported flooding";

  const depth = Number(
    reportAny?.predicted_depth ??
      reportAny?.predictedDepth ??
      reportAny?.water_depth ??
      reportAny?.depth ??
      0
  );

  const assignedTeam =
    reportAny?.assigned_team ??
    reportAny?.assignedTeam ??
    "Unassigned";

  const backendStatus =
    reportAny?.status ??
    reportAny?.operational_status ??
    reportAny?.response_status ??
    "Awaiting dispatch";

  const normalizedBackendStatus =
    String(backendStatus).toLowerCase();

  let status: ResponseStatus =
    "Awaiting dispatch";

  if (
    normalizedBackendStatus.includes(
      "resolved"
    )
  ) {
    status = "Resolved";
  } else if (
    normalizedBackendStatus.includes(
      "site"
    )
  ) {
    status = "On site";
  } else if (
    normalizedBackendStatus.includes(
      "en route"
    ) ||
    normalizedBackendStatus.includes(
      "en_route"
    )
  ) {
    status = "En route";
  } else if (
    normalizedBackendStatus.includes(
      "assigned"
    )
  ) {
    status = "Team assigned";
  }

  if (localStatus) {
    status = localStatus;
  }

  const reportId =
    reportAny?.id ??
    reportAny?.report_id;

  return {
    id: `report-${reportId}`,
    reportId:
      reportId === undefined ||
      reportId === null
        ? undefined
        : String(reportId),
    location: String(location),
    zone: String(zone),
    priority: normalizePriority(
      severity
    ),
    cause: String(cause),
    predictedDepth: Number.isFinite(
      depth
    )
      ? depth
      : 0,
    onset:
      reportAny?.onset ??
      reportAny?.reported_at ??
      reportAny?.created_at ??
      null,
    team: String(assignedTeam),
    status,
    source: "Citizen report",
    modelRelevant: Boolean(
      reportAny?.model_relevant ??
        reportAny?.modelRelevant ??
        false
    ),
  };
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  alert = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={`border bg-white p-4 ${
        alert
          ? "border-red-200"
          : "border-warm-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-warm-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-warm-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-warm-500">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
            alert
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-warm-200 bg-warm-50 text-warm-600"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const style =
    priorityStyles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.border} ${style.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ResponseStatus;
}) {
  const style =
    statusStyles[status];

  return (
    <span
      className={`border px-2 py-1 text-[10px] font-semibold ${style.bg} ${style.border} ${style.text}`}
    >
      {status}
    </span>
  );
}

export default function AuthorityFieldResponseScreen() {
  const { state } = useApp();

  const city = cityData[
    state.city
  ] as any;

  const [
    citizenReports,
    setCitizenReports,
  ] = useState<CitizenReport[]>([]);

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(
    null
  );

  const [
    localStatuses,
    setLocalStatuses,
  ] = useState<
    Record<string, ResponseStatus>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const modelItems = useMemo(
    () =>
      getModelResponseItems(city),
    [city]
  );

  const loadReports = async (
    showRefreshState = false
  ) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const reports =
        await getCitizenReports();

      setCitizenReports(
        Array.isArray(reports)
          ? reports
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load citizen response reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadReports();

    const interval =
      window.setInterval(() => {
        void loadReports();
      }, 30000);

    return () =>
      window.clearInterval(interval);
  }, []);

  const citizenItems = useMemo(
    () =>
      citizenReports.map(
        (report) => {
          const reportId = String(
            (report as any)?.id ??
              (report as any)
                ?.report_id ??
              ""
          );

          return mapCitizenReport(
            report,
            localStatuses[
              `report-${reportId}`
            ]
          );
        }
      ),
    [
      citizenReports,
      localStatuses,
    ]
  );

  const responseItems = useMemo(() => {
    const combined = [
      ...modelItems,
      ...citizenItems,
    ];

    return [...combined].sort(
      (a, b) => {
        const priorityDifference =
          getPriorityRank(
            b.priority
          ) -
          getPriorityRank(
            a.priority
          );

        if (
          priorityDifference !== 0
        ) {
          return priorityDifference;
        }

        const statusRank: Record<
          ResponseStatus,
          number
        > = {
          "Awaiting dispatch": 0,
          "Team assigned": 1,
          "En route": 2,
          "On site": 3,
          Resolved: 4,
        };

        return (
          statusRank[a.status] -
          statusRank[b.status]
        );
      }
    );
  }, [
    modelItems,
    citizenItems,
  ]);

  useEffect(() => {
    if (
      responseItems.length === 0
    ) {
      setSelectedId(null);
      return;
    }

    if (
      selectedId &&
      responseItems.some(
        (item) =>
          item.id === selectedId
      )
    ) {
      return;
    }

    setSelectedId(
      responseItems[0].id
    );
  }, [
    responseItems,
    selectedId,
  ]);

  const selectedItem = useMemo(
    () =>
      responseItems.find(
        (item) =>
          item.id === selectedId
      ) ?? null,
    [
      responseItems,
      selectedId,
    ]
  );

  const criticalItems =
    responseItems.filter(
      (item) =>
        item.priority ===
          "CRITICAL" &&
        item.status !==
          "Resolved"
    ).length;

  const activeItems =
    responseItems.filter(
      (item) =>
        item.status ===
          "Team assigned" ||
        item.status ===
          "En route" ||
        item.status ===
          "On site"
    ).length;

  const teamsDeployed =
    responseItems.filter(
      (item) =>
        item.status ===
          "En route" ||
        item.status ===
          "On site"
    ).length;

  const awaitingDispatch =
    responseItems.filter(
      (item) =>
        item.status ===
        "Awaiting dispatch"
    ).length;

  const setLocalStatus = (
    id: string,
    status: ResponseStatus
  ) => {
    setLocalStatuses(
      (current) => ({
        ...current,
        [id]: status,
      })
    );
  };

  const handleAssign =
    async () => {
      if (!selectedItem) {
        return;
      }

      if (!selectedItem.reportId) {
        setLocalStatus(
          selectedItem.id,
          "Team assigned"
        );

        return;
      }

      try {
        setRefreshing(true);
        setError(null);

        /*
         * The existing API accepts:
         * verifyCitizenReport(reportId, verified)
         *
         * Keep the API contract unchanged.
         */
        await verifyCitizenReport(Number(selectedItem.reportId), {
        verified: true,
        model_relevant: selectedItem.modelRelevant,
        assigned_team: selectedItem.team || null,
        });
        
        await updateCitizenReportStatus(
          Number(
            selectedItem.reportId
          ),
          "Assigned"
        );

        setLocalStatus(
          selectedItem.id,
          "Team assigned"
        );

        await loadReports(true);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to assign the response team."
        );
      } finally {
        setRefreshing(false);
      }
    };

  const handleDispatch =
    async () => {
      if (!selectedItem) {
        return;
      }

      setLocalStatus(
        selectedItem.id,
        "En route"
      );
    };

  const handleOnSite =
    async () => {
      if (!selectedItem) {
        return;
      }

      setLocalStatus(
        selectedItem.id,
        "On site"
      );
    };

  const handleResolve =
    async () => {
      if (!selectedItem) {
        return;
      }

      if (!selectedItem.reportId) {
        setLocalStatus(
          selectedItem.id,
          "Resolved"
        );

        return;
      }

      try {
        setRefreshing(true);
        setError(null);

        await updateCitizenReportStatus(
          Number(
            selectedItem.reportId
          ),
          "Resolved"
        );

        setLocalStatuses(
          (current) => {
            const next = {
              ...current,
            };

            delete next[
              selectedItem.id
            ];

            return next;
          }
        );

        await loadReports(true);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to mark the incident as resolved."
        );
      } finally {
        setRefreshing(false);
      }
    };

  const actionLabel = useMemo(
    () => {
      if (!selectedItem) {
        return null;
      }

      switch (
        selectedItem.status
      ) {
        case "Awaiting dispatch":
          return "Assign team";

        case "Team assigned":
          return "Dispatch team";

        case "En route":
          return "Mark on site";

        case "On site":
          return "Resolve incident";

        case "Resolved":
          return null;

        default:
          return null;
      }
    },
    [selectedItem]
  );

  const handlePrimaryAction =
    async () => {
      if (!selectedItem) {
        return;
      }

      if (
        selectedItem.status ===
        "Awaiting dispatch"
      ) {
        await handleAssign();
        return;
      }

      if (
        selectedItem.status ===
        "Team assigned"
      ) {
        await handleDispatch();
        return;
      }

      if (
        selectedItem.status ===
        "En route"
      ) {
        await handleOnSite();
        return;
      }

      if (
        selectedItem.status ===
        "On site"
      ) {
        await handleResolve();
      }
    };

  return (
    <main className="min-h-full bg-warm-50">
      <div className="mx-auto max-w-360 px-4 py-5 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <section className="border-b border-warm-200 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-maroon-700">
                <Radio className="h-3.5 w-3.5" />
                Authority operations
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-warm-900 sm:text-3xl">
                Field Response
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-warm-600">
                Coordinate response teams
                against model-predicted
                flood risk and verified
                citizen incidents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border border-warm-200 bg-white px-3 py-2 text-xs text-warm-600">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Response network active
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadReports(
                    true
                  )
                }
                disabled={refreshing}
                className="inline-flex min-h-9 items-center gap-2 border border-warm-300 bg-white px-3 text-xs font-semibold text-warm-700 transition hover:border-maroon-300 hover:text-maroon-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-4 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-semibold">
                Response data unavailable
              </p>

              <p className="mt-0.5 text-xs">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* METRICS */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Critical response"
            value={String(
              criticalItems
            )}
            detail="Requires immediate attention"
            icon={
              <AlertTriangle className="h-4 w-4" />
            }
            alert={
              criticalItems > 0
            }
          />

          <MetricCard
            label="Active incidents"
            value={String(
              activeItems
            )}
            detail="Teams assigned or deployed"
            icon={
              <Truck className="h-4 w-4" />
            }
          />

          <MetricCard
            label="Teams deployed"
            value={String(
              teamsDeployed
            )}
            detail="En route or on site"
            icon={
              <Users className="h-4 w-4" />
            }
          />

          <MetricCard
            label="Awaiting dispatch"
            value={String(
              awaitingDispatch
            )}
            detail="Pending operational action"
            icon={
              <Clock3 className="h-4 w-4" />
            }
            alert={
              awaitingDispatch > 0
            }
          />
        </section>

        {/* PRIORITY BANNER */}
        {criticalItems > 0 && (
          <section className="mt-5 border border-red-200 bg-red-50">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-red-100 text-red-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-900">
                    {criticalItems} critical
                    response{" "}
                    {criticalItems ===
                    1
                      ? "item"
                      : "items"}{" "}
                    require attention
                  </p>

                  <p className="mt-0.5 text-xs text-red-700">
                    Review the
                    highest-priority
                    incidents before
                    routine field work.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wide text-red-700">
                Priority queue
              </span>
            </div>
          </section>
        )}

        {/* MAIN OPERATIONAL AREA */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">

          {/* RESPONSE QUEUE */}
          <div className="min-w-0 border border-warm-200 bg-white">
            <div className="flex items-center justify-between border-b border-warm-200 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-maroon-700" />

                  <h2 className="text-sm font-bold text-warm-900">
                    Response queue
                  </h2>
                </div>

                <p className="mt-0.5 text-xs text-warm-500">
                  Model priorities and
                  citizen incidents
                </p>
              </div>

              <span className="font-mono text-xs text-warm-500">
                {responseItems.length}{" "}
                items
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-warm-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading response data...
                </div>
              </div>
            ) : responseItems.length ===
              0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />

                <p className="mt-3 text-sm font-semibold text-warm-800">
                  No active response
                  items
                </p>

                <p className="mt-1 max-w-sm text-xs text-warm-500">
                  No model-priority or
                  citizen-reported
                  incidents currently
                  require field action.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-warm-100">
                {responseItems.map(
                  (item) => {
                    const selected =
                      item.id ===
                      selectedId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            item.id
                          )
                        }
                        className={`w-full text-left transition ${
                          selected
                            ? "bg-maroon-50/60"
                            : "bg-white hover:bg-warm-50"
                        }`}
                      >
                        <div className="flex gap-3 px-4 py-3.5">
                          <div className="flex shrink-0 flex-col items-center pt-1">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                priorityStyles[
                                  item
                                    .priority
                                ].dot
                              }`}
                            />

                            {item.status !==
                              "Resolved" && (
                              <span className="mt-1 h-full w-px bg-warm-200" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-warm-900">
                                  {
                                    item.location
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-warm-500">
                                  {
                                    item.zone
                                  }
                                </p>
                              </div>

                              <PriorityBadge
                                priority={
                                  item.priority
                                }
                              />
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="inline-flex items-center gap-1 text-[11px] text-warm-600">
                                <Waves className="h-3 w-3" />

                                {item.predictedDepth.toFixed(
                                  2
                                )}{" "}
                                m
                              </span>

                              <span className="text-warm-300">
                                •
                              </span>

                              <span className="text-[11px] text-warm-600">
                                {
                                  item.source
                                }
                              </span>

                              <span className="text-warm-300">
                                •
                              </span>

                              <StatusBadge
                                status={
                                  item.status
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* SELECTED INCIDENT */}
          <aside className="min-w-0 border border-warm-200 bg-white">
            <div className="border-b border-warm-200 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-maroon-700">
                Selected response
              </p>

              <h2 className="mt-1 text-base font-bold text-warm-900">
                Operational details
              </h2>
            </div>

            {!selectedItem ? (
              <div className="flex min-h-72 items-center justify-center px-6 text-center text-xs text-warm-500">
                Select an item from
                the response queue.
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold tracking-tight text-warm-900">
                      {
                        selectedItem.location
                      }
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-warm-500">
                      <MapPin className="h-3 w-3" />

                      {
                        selectedItem.zone
                      }
                    </p>
                  </div>

                  <PriorityBadge
                    priority={
                      selectedItem.priority
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-px border border-warm-200 bg-warm-200">
                  <div className="bg-warm-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-warm-500">
                      Predicted depth
                    </p>

                    <p className="mt-1 text-sm font-bold text-warm-900">
                      {selectedItem.predictedDepth.toFixed(
                        2
                      )}{" "}
                      m
                    </p>
                  </div>

                  <div className="bg-warm-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-warm-500">
                      Expected onset
                    </p>

                    <p className="mt-1 text-sm font-bold text-warm-900">
                      {selectedItem.onset ??
                        "Not available"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border border-warm-200">
                  <div className="border-b border-warm-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-500">
                      Incident assessment
                    </p>
                  </div>

                  <div className="space-y-3 p-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-500">
                        Primary cause
                      </p>

                      <p className="mt-1 text-xs font-medium text-warm-800">
                        {
                          selectedItem.cause
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-500">
                        Response source
                      </p>

                      <p className="mt-1 text-xs font-medium text-warm-800">
                        {
                          selectedItem.source
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-warm-500">
                        Model relevance
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {selectedItem.modelRelevant ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />

                            <span className="text-xs font-medium text-green-700">
                              Relevant to model
                              response
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />

                            <span className="text-xs font-medium text-amber-700">
                              Not yet linked
                              to model output
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border border-warm-200">
                  <div className="border-b border-warm-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-500">
                      Team assignment
                    </p>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-warm-500" />

                        <span className="text-xs font-semibold text-warm-800">
                          {
                            selectedItem.team
                          }
                        </span>
                      </div>

                      <StatusBadge
                        status={
                          selectedItem.status
                        }
                      />
                    </div>
                  </div>
                </div>

                {actionLabel && (
                  <button
                    type="button"
                    onClick={() =>
                      void handlePrimaryAction()
                    }
                    disabled={refreshing}
                    className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 bg-maroon-700 px-4 text-sm font-bold text-white transition hover:bg-maroon-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : selectedItem.status ===
                      "Awaiting dispatch" ? (
                      <Users className="h-4 w-4" />
                    ) : selectedItem.status ===
                      "Team assigned" ? (
                      <Truck className="h-4 w-4" />
                    ) : selectedItem.status ===
                      "En route" ? (
                      <MapPin className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    {actionLabel}
                  </button>
                )}

                {selectedItem.status ===
                  "Resolved" && (
                  <div className="mt-4 flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-3 text-xs font-semibold text-green-800">
                    <CheckCircle2 className="h-4 w-4" />

                    Response marked
                    as resolved.
                  </div>
                )}
              </div>
            )}
          </aside>
        </section>

        {/* RESPONSE WORKFLOW */}
        <section className="mt-5 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-maroon-700" />

              <h2 className="text-sm font-bold text-warm-900">
                Response workflow
              </h2>
            </div>

            <p className="mt-0.5 text-xs text-warm-500">
              Standard operational progression
              for field incidents.
            </p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-warm-200 md:grid-cols-5">
            {[
              {
                step: "01",
                title: "Identify",
                text: "Model or citizen signal",
              },
              {
                step: "02",
                title: "Assign",
                text: "Confirm response team",
              },
              {
                step: "03",
                title: "Dispatch",
                text: "Team moves to zone",
              },
              {
                step: "04",
                title: "On site",
                text: "Field assessment",
              },
              {
                step: "05",
                title: "Resolve",
                text: "Close response",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="p-4"
              >
                <p className="font-mono text-[10px] text-maroon-700">
                  {step.step}
                </p>

                <p className="mt-2 text-xs font-bold text-warm-900">
                  {step.title}
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-warm-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PROTOTYPE NOTE */}
        <section className="mt-5 border border-warm-200 bg-warm-100">
          <div className="flex items-start gap-3 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

            <div>
              <p className="text-xs font-bold text-warm-800">
                Operational prototype
              </p>

              <p className="mt-1 max-w-4xl text-[11px] leading-relaxed text-warm-600">
                Model-generated response
                items are based on the
                current demonstration city
                dataset. Citizen reports use
                the live reporting API when
                available. Team movement for
                model-only incidents is
                maintained locally in this
                prototype and does not
                represent a live municipal
                dispatch system.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}