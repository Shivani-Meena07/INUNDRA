import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import { cityData, RiskLevel } from "../../data/mockData";

type IncidentStatus =
  | "Under verification"
  | "Verified"
  | "Assigned"
  | "Resolved";

type IncidentSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

type AuthorityIncident = {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  source: "Citizen" | "Authority";
  assignedTeam?: string;
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

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: IncidentStatus }) {
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
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
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
}: {
  incident: AuthorityIncident;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [team, setTeam] = useState(incident.assignedTeam ?? "");

  const handleStatusChange = (nextStatus: IncidentStatus) => {
    setStatus(nextStatus);
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
            className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close incident"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={status} />
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
                {incident.source}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Severity
              </p>
              <div className="mt-2">
                <SeverityBadge severity={incident.severity} />
              </div>
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
                  value={status}
                  onChange={(event) =>
                    handleStatusChange(
                      event.target.value as IncidentStatus,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#7f1d1d]"
                >
                  <option value="Under verification">
                    Under verification
                  </option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Response team
                </span>

                <select
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#7f1d1d]"
                >
                  <option value="">Not assigned</option>
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
            </div>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">
              Model feedback loop
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              A verified drainage-related incident can become model feedback
              in the production system. This prototype records the operational
              decision locally; it does not yet recalibrate the flood model.
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#7f1d1d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#681818]"
            >
              Save operational update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthorityIncidentsScreen() {
  const { state } = useApp();

  const city = cityData[state.city];

  /*
   * Prototype incident queue.
   *
   * Production version:
   * - Load incidents from the backend.
   * - Verify reports against sensor/model/GIS evidence.
   * - Persist status and team assignment.
   * - Feed confirmed drainage incidents back into the model.
   */
  const incidents = useMemo<AuthorityIncident[]>(
    () => [
      {
        id: "INC-1042",
        title: "Water accumulation reported near major junction",
        description:
          "Citizen report indicates rapidly rising water and reduced road passability.",
        location: city.name,
        severity: "CRITICAL",
        status: "Under verification",
        reportedAt: "12 min ago",
        source: "Citizen",
      },
      {
        id: "INC-1041",
        title: "Possible blocked drainage inlet",
        description:
          "Standing water persists despite rainfall intensity beginning to decline.",
        location: city.name,
        severity: "HIGH",
        status: "Verified",
        reportedAt: "27 min ago",
        source: "Citizen",
        assignedTeam: "Drainage Response Team",
      },
      {
        id: "INC-1039",
        title: "Road inundation affecting local traffic",
        description:
          "Flood depth is increasing along a low-lying road segment.",
        location: city.name,
        severity: "HIGH",
        status: "Assigned",
        reportedAt: "41 min ago",
        source: "Authority",
        assignedTeam: "Traffic Management Team",
      },
      {
        id: "INC-1037",
        title: "Drainage node showing elevated stress",
        description:
          "Model indicates high hydraulic utilization around the affected area.",
        location: city.name,
        severity: "MODERATE",
        status: "Verified",
        reportedAt: "58 min ago",
        source: "Authority",
        assignedTeam: "Field Inspection Team",
      },
      {
        id: "INC-1032",
        title: "Minor waterlogging reported",
        description:
          "Low-severity citizen observation with limited road impact.",
        location: city.name,
        severity: "LOW",
        status: "Resolved",
        reportedAt: "1 hr ago",
        source: "Citizen",
      },
    ],
    [city.name],
  );

  const [filter, setFilter] = useState<"ALL" | IncidentStatus>("ALL");
  const [selectedIncident, setSelectedIncident] =
    useState<AuthorityIncident | null>(null);

  const filteredIncidents = useMemo(() => {
    if (filter === "ALL") {
      return incidents;
    }

    return incidents.filter((incident) => incident.status === filter);
  }, [filter, incidents]);

  const counts = useMemo(
    () => ({
      total: incidents.length,
      verification: incidents.filter(
        (incident) => incident.status === "Under verification",
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
              {counts.total} reports
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
                Priority response
              </p>

              <h2 className="mt-2 text-xl font-bold text-red-950">
                {counts.critical > 0
                  ? `${counts.critical} critical incident${
                      counts.critical > 1 ? "s" : ""
                    } require attention`
                  : "No critical incidents require attention"}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-red-800">
                Review incoming reports, verify them against available flood
                intelligence, and assign the appropriate response team.
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
            detail="Current prototype queue"
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
                  Review citizen and authority reports by operational status.
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    ["ALL", "All"],
                    ["Under verification", "Verification"],
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
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onSelect={() => setSelectedIncident(incident)}
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
                ["01", "Receive", "Citizen or authority report enters queue."],
                ["02", "Verify", "Compare report with available flood intelligence."],
                ["03", "Assign", "Send the appropriate field team."],
                ["04", "Resolve", "Close the incident after field confirmation."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-4">
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
              ))}
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
              In the production system, verified reports such as blocked
              inlets, drainage surcharge, or unexpected water accumulation
              become additional evidence for recalibrating flood risk.
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
                Updated risk
              </span>
            </div>
          </div>
        </section>

        <p className="mt-6 pb-8 text-xs leading-5 text-slate-400">
          Prototype interface — incident records, assignments, and verification
          actions are currently mock/local data. Production deployment will
          connect these actions to the FastAPI backend and persistent database.
        </p>
      </main>

      {selectedIncident && (
        <IncidentDetailPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}