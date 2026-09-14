import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import { cityData } from "../../data/mockData";
import {
  CitizenReport,
  getCitizenReports,
  verifyCitizenReport,
  updateCitizenReportStatus,
} from "../../data/api";

type IncidentStatus =
  | "Under verification"
  | "Verified"
  | "Assigned"
  | "Resolved";

type IncidentSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

type AuthorityIncident = {
  reportId: number;
  id: string;
  title: string;
  description: string;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  source: "Citizen";
  assignedTeam?: string;
  modelRelevant: boolean;
};

const severityConfig: Record<
  IncidentSeverity,
  {
    label: string;
    className: string;
  }
> = {
  CRITICAL: {
    label: "Critical",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  MODERATE: {
    label: "Moderate",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  LOW: {
    label: "Low",
    className: "bg-lime-100 text-lime-800 border-lime-200",
  },
};

const statusConfig: Record<
  IncidentStatus,
  {
    label: string;
    className: string;
  }
> = {
  "Under verification": {
    label: "Under verification",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  Verified: {
    label: "Verified",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  Assigned: {
    label: "Assigned",
    className: "bg-orange-50 text-orange-800 border-orange-200",
  },
  Resolved: {
    label: "Resolved",
    className: "bg-green-50 text-green-800 border-green-200",
  },
};

function normalizeSeverity(value: string): IncidentSeverity {
  switch (value.toUpperCase()) {
    case "CRITICAL":
      return "CRITICAL";
    case "HIGH":
      return "HIGH";
    case "MODERATE":
    case "MEDIUM":
      return "MODERATE";
    case "LOW":
      return "LOW";
    default:
      return "LOW";
  }
}

function normalizeStatus(value: string): IncidentStatus {
  switch (value.toLowerCase()) {
    case "confirmed":
      return "Verified";
    case "assigned":
      return "Assigned";
    case "resolved":
    case "closed":
      return "Resolved";
    case "rejected":
      return "Resolved";
    case "under verification":
    default:
      return "Under verification";
  }
}

function issueTitle(issueType: string): string {
  switch (issueType) {
    case "Blocked Drain":
      return "Possible blocked drainage inlet";
    case "Waterlogging":
      return "Waterlogging reported";
    case "Drain Overflow":
      return "Drain overflow reported";
    case "Damaged Drain":
      return "Damaged drainage infrastructure";
    default:
      return "Citizen flood observation";
  }
}

function formatReportedAt(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapReportToIncident(
  report: CitizenReport,
): AuthorityIncident {
  return {
    reportId: report.id,
    id: `IN-${String(report.id).padStart(4, "0")}`,
    title: issueTitle(report.issue_type),
    description:
      report.description ||
      "No additional description was provided by the citizen.",
    location: report.location,
    severity: normalizeSeverity(report.severity),
    status: normalizeStatus(report.status),
    reportedAt: formatReportedAt(report.created_at),
    source: "Citizen",
    assignedTeam: report.assigned_team ?? undefined,
    modelRelevant: report.model_relevant,
  };
}

function SeverityBadge({
  severity,
}: {
  severity: IncidentSeverity;
}) {
  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: IncidentStatus;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function IncidentCard({
  incident,
  onSelect,
}: {
  incident: AuthorityIncident;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full border-b border-slate-100 p-5 text-left transition hover:bg-slate-50"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {incident.id}
            </span>

            <SeverityBadge severity={incident.severity} />

            <StatusBadge status={incident.status} />

            {incident.modelRelevant && (
              <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800">
                Model relevant
              </span>
            )}
          </div>

          <h3 className="mt-3 text-base font-bold text-slate-900">
            {incident.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {incident.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>📍 {incident.location}</span>
            <span>🕒 {incident.reportedAt}</span>
            <span>Source: {incident.source}</span>

            {incident.assignedTeam && (
              <span>
                Team: {incident.assignedTeam}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#7f1d1d]">
          Review
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </button>
  );
}

function IncidentDetailPanel({
  incident,
  onClose,
  onUpdated,
}: {
  incident: AuthorityIncident;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [team, setTeam] = useState(
    incident.assignedTeam ?? "",
  );

  const [modelRelevant, setModelRelevant] =
    useState(incident.modelRelevant);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentStatus, setCurrentStatus] =
    useState<IncidentStatus>(incident.status);

  const saveUpdate = async () => {
    setSaving(true);
    setError("");

    try {
      /*
       * Verification endpoint controls whether the report is
       * confirmed/rejected, model relevance and team assignment.
       */
      if (
        currentStatus === "Verified" ||
        currentStatus === "Assigned"
      ) {
        await verifyCitizenReport(
          incident.reportId,
          {
            verified: true,
            model_relevant: modelRelevant,
            assigned_team: team || null,
          },
        );
      }

      /*
       * Once verified, operational status can move through
       * Assigned / Resolved.
       */
      if (
        currentStatus === "Assigned" ||
        currentStatus === "Resolved"
      ) {
        await updateCitizenReportStatus(
          incident.reportId,
          currentStatus,
        );
      }

      await onUpdated();
      onClose();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to save the operational update.",
      );
    } finally {
      setSaving(false);
    }
  };

  const rejectReport = async () => {
    setSaving(true);
    setError("");

    try {
      await verifyCitizenReport(
        incident.reportId,
        {
          verified: false,
          model_relevant: false,
          assigned_team: null,
        },
      );

      await onUpdated();
      onClose();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to reject the report.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-3000 flex items-end justify-center bg-black/30 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full overflow-y-auto bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7f1d1d]">
              Incident review
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {incident.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close incident"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <div className="flex flex-wrap gap-2">
              <SeverityBadge
                severity={incident.severity}
              />

              <StatusBadge status={currentStatus} />

              {modelRelevant && (
                <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800">
                  Model relevant
                </span>
              )}
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              {incident.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {incident.description}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Location
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {incident.location}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reported
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {incident.reportedAt}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                Citizen report
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Coordinates
              </p>

              <p className="mt-2 text-xs font-mono text-slate-700">
                {incident.reportId}
              </p>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-slate-900">
              Verification & response
            </h3>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Incident status
                </span>

                <select
                  value={currentStatus}
                  onChange={(event) =>
                    setCurrentStatus(
                      event.target
                        .value as IncidentStatus,
                    )
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#7f1d1d] disabled:bg-slate-50"
                >
                  <option value="Under verification">
                    Under verification
                  </option>

                  <option value="Verified">
                    Verified
                  </option>

                  <option value="Assigned">
                    Assigned
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Response team
                </span>

                <select
                  value={team}
                  onChange={(event) =>
                    setTeam(event.target.value)
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#7f1d1d] disabled:bg-slate-50"
                >
                  <option value="">
                    Not assigned
                  </option>

                  <option value="Drainage Response Team">
                    Drainage Response Team
                  </option>

                  <option value="Field Inspection Team">
                    Field Inspection Team
                  </option>

                  <option value="Emergency Response Team">
                    Emergency Response Team
                  </option>

                  <option value="Traffic Management Team">
                    Traffic Management Team
                  </option>
                </select>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <input
                  type="checkbox"
                  checked={modelRelevant}
                  onChange={(event) =>
                    setModelRelevant(
                      event.target.checked,
                    )
                  }
                  disabled={saving}
                  className="mt-1 h-4 w-4 accent-[#7f1d1d]"
                />

                <span>
                  <span className="block text-sm font-semibold text-purple-900">
                    Mark as model-relevant
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-purple-800">
                    Use this when the verified observation
                    provides useful evidence about drainage,
                    water accumulation or infrastructure
                    condition.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">
              Model feedback loop
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Marking a report as model-relevant persists that
              operational decision in the backend. The current
              prototype does not automatically modify or
              recalibrate the SWMM model from this action.
            </p>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                Update failed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={rejectReport}
              disabled={saving}
              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Reject report"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveUpdate}
                disabled={saving}
                className="rounded-xl bg-[#7f1d1d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#681818] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save operational update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthorityIncidentsScreen() {
  const { state } = useApp();

  const city = cityData[state.city];

  const [reports, setReports] = useState<CitizenReport[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState<
    "ALL" | IncidentStatus
  >("ALL");

  const [selectedIncident, setSelectedIncident] =
    useState<AuthorityIncident | null>(null);

  const loadReports = async () => {
    try {
      setError("");

      const data = await getCitizenReports();

      setReports(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load citizen reports.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();

    const interval = window.setInterval(() => {
      void loadReports();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const incidents = useMemo(
    () =>
      reports.map((report) =>
        mapReportToIncident(report),
      ),
    [reports],
  );

  const filteredIncidents = useMemo(() => {
    if (filter === "ALL") {
      return incidents;
    }

    return incidents.filter(
      (incident) => incident.status === filter,
    );
  }, [filter, incidents]);

  const counts = useMemo(
    () => ({
      total: incidents.length,

      verification: incidents.filter(
        (incident) =>
          incident.status ===
          "Under verification",
      ).length,

      active: incidents.filter(
        (incident) =>
          incident.status === "Verified" ||
          incident.status === "Assigned",
      ).length,

      critical: incidents.filter(
        (incident) =>
          incident.severity === "CRITICAL" &&
          incident.status !== "Resolved",
      ).length,
    }),
    [incidents],
  );

  return (
    <div className="min-h-screen bg-warm-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7f1d1d]">
              INUNDRA
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight">
              Incident Management
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Authority operations • {city.name}
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Operational queue
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {loading ? "Loading..." : `${counts.total} reports`}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
              Backend connection error
            </p>

            <p className="mt-2 text-sm font-semibold text-red-950">
              Unable to load citizen reports.
            </p>

            <p className="mt-1 text-sm text-red-800">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadReports();
              }}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              Retry
            </button>
          </section>
        )}

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
                Priority response
              </p>

              <h2 className="mt-2 text-xl font-bold text-red-950">
                {counts.critical > 0
                  ? `${counts.critical} critical incident${
                      counts.critical > 1
                        ? "s"
                        : ""
                    } require attention`
                  : "No critical incidents require attention"}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-red-800">
                Review incoming citizen reports, verify
                them against available flood intelligence,
                and assign the appropriate response team.
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">
                Verification queue
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {counts.verification}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total incidents"
            value={counts.total}
            detail="Backend citizen reports"
          />

          <SummaryCard
            label="Needs verification"
            value={counts.verification}
            detail="Reports awaiting review"
          />

          <SummaryCard
            label="Active response"
            value={counts.active}
            detail="Verified or assigned"
          />

          <SummaryCard
            label="Critical"
            value={counts.critical}
            detail="Requires priority action"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Incident queue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Live citizen reports from the FastAPI
                  backend.
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    ["ALL", "All"],
                    [
                      "Under verification",
                      "Verification",
                    ],
                    ["Verified", "Verified"],
                    ["Assigned", "Assigned"],
                    ["Resolved", "Resolved"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      filter === value
                        ? "border-[#7f1d1d] bg-[#7f1d1d] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="p-10 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#7f1d1d]" />

                <p className="mt-3 font-semibold text-slate-700">
                  Loading reports...
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Fetching citizen observations from the
                  backend.
                </p>
              </div>
            ) : filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onSelect={() =>
                    setSelectedIncident(incident)
                  }
                />
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="font-semibold text-slate-700">
                  No incidents match this filter.
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try another operational status.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7f1d1d]">
              Response workflow
            </p>

            <div className="mt-5 space-y-4">
              {[
                [
                  "01",
                  "Receive",
                  "Citizen report enters the backend queue.",
                ],
                [
                  "02",
                  "Verify",
                  "Compare report with available flood intelligence.",
                ],
                [
                  "03",
                  "Assign",
                  "Send the appropriate field team.",
                ],
                [
                  "04",
                  "Resolve",
                  "Close the incident after field confirmation.",
                ],
              ].map(
                ([number, title, description]) => (
                  <div
                    key={number}
                    className="flex gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7f1d1d] text-xs font-bold text-white">
                      {number}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7f1d1d]">
              Model feedback
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Reports can improve the next forecast
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Verified reports such as blocked inlets,
              drainage surcharge, or unexpected water
              accumulation can be marked as model-relevant
              evidence. The current prototype persists that
              decision but does not yet automatically
              recalibrate the flood model.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-lg bg-slate-100 px-3 py-2">
                Citizen report
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                Verification
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-800">
                Model feedback
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-red-50 px-3 py-2 text-red-800">
                Future recalibration
              </span>
            </div>
          </div>
        </section>

        <p className="mt-6 pb-8 text-xs leading-5 text-slate-400">
          BACKEND CONNECTED · Incident records, verification,
          team assignment and status updates are persisted
          through the FastAPI report API. Automatic flood-model
          recalibration from verified reports remains a future
          integration step.
        </p>
      </main>

      {selectedIncident && (
        <IncidentDetailPanel
          incident={selectedIncident}
          onClose={() =>
            setSelectedIncident(null)
          }
          onUpdated={loadReports}
        />
      )}
    </div>
  );
}