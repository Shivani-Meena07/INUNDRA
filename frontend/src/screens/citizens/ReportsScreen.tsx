import { useState } from "react";
import {
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldAlert,
  Activity,
  ArrowRight,
  MapPin,
  RefreshCw,
  Droplets,
} from "lucide-react";
import { useApp } from "../../state/AppContext";
import {
  cityData,
  Incident,
  IncidentType,
  RiskLevel,
  IncidentStatus,
} from "../../data/mockData";
import StatusBadge from "../../components/ui/StatusBadge";

const FILTERS = [
  "All",
  "CRITICAL",
  "HIGH",
  "MODERATE",
  "LOW",
];

const typeIcon: Record<string, string> = {
  "Blocked Drain": "🔧",
  Waterlogging: "💧",
  "Drain Overflow": "⚠",
  "Damaged Drain": "🔨",
  Other: "📋",
};

const statusMeta: Record<
  IncidentStatus,
  {
    icon: typeof Clock;
    color: string;
    bg: string;
    border: string;
  }
> = {
  Confirmed: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  "Under verification": {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  Resolved: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  Closed: {
    icon: CheckCircle,
    color: "text-warm-400",
    bg: "bg-warm-50",
    border: "border-warm-200",
  },
};

function IncidentRow({
  incident,
  expanded,
  onToggle,
}: {
  incident: Incident;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = statusMeta[incident.status];
  const StatusIcon = meta.icon;

  const affectsModel =
    incident.type === "Blocked Drain" ||
    incident.type === "Drain Overflow" ||
    incident.type === "Waterlogging";

  return (
    <div
      className={`border-b border-warm-50 transition-colors ${
        expanded
          ? "bg-warm-50/50"
          : "hover:bg-warm-50/30"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <div className="shrink-0 w-5 text-base leading-none">
          {typeIcon[incident.type] ?? "📋"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-warm-400">
              {incident.id}
            </span>

            <span className="text-sm font-medium text-warm-900 truncate">
              {incident.location}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-warm-500">
              {incident.type}
            </span>

            <span className="text-warm-300">·</span>

            <span className="text-[11px] font-mono text-warm-400">
              {incident.reportedAt}
            </span>

            {affectsModel && (
              <>
                <span className="text-warm-300">·</span>

                <span className="text-[9px] font-mono uppercase text-maroon-700">
                  Model relevant
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge
            level={incident.severity}
          />

          <div className="hidden items-center gap-1 sm:flex">
            <StatusIcon
              size={13}
              className={meta.color}
            />

            <span className="text-[10px] text-warm-500 font-mono hidden md:block">
              {incident.status}
            </span>
          </div>

          {expanded ? (
            <ChevronUp
              size={14}
              className="text-warm-400"
            />
          ) : (
            <ChevronDown
              size={14}
              className="text-warm-400"
            />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-[10px] font-mono text-warm-400 mb-0.5">
                STATUS
              </div>

              <div className="flex items-center gap-1.5">
                <StatusIcon
                  size={13}
                  className={meta.color}
                />

                <span className="text-xs text-warm-700">
                  {incident.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-warm-400 mb-0.5">
                IMPACT
              </div>

              <div className="text-xs text-warm-700">
                {incident.impact}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-warm-400 mb-0.5">
                MODEL RELEVANCE
              </div>

              <div
                className={`text-xs font-medium ${
                  affectsModel
                    ? "text-maroon-700"
                    : "text-warm-500"
                }`}
              >
                {affectsModel
                  ? "Potential drainage impact"
                  : "Observation only"}
              </div>
            </div>
          </div>

          {incident.description && (
            <div className="bg-white border border-warm-200 rounded-sm px-3 py-2.5 text-xs text-warm-600 leading-relaxed">
              {incident.description}
            </div>
          )}

          {incident.status === "Confirmed" &&
            affectsModel && (
              <div className="mt-3 bg-maroon-50 border border-maroon-200 px-3 py-3">
                <div className="flex items-start gap-2">
                  <RefreshCw
                    size={14}
                    className="text-maroon-700 mt-0.5 shrink-0"
                  />

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wide text-maroon-700">
                      Model feedback
                    </div>

                    <p className="text-xs text-maroon-900 mt-1 leading-relaxed">
                      This confirmed incident can be used
                      as an infrastructure condition input
                      when the drainage model is recalibrated.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function ReportModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { dispatch, state } = useApp();

  const [type, setType] =
    useState<IncidentType>("Blocked Drain");

  const [location, setLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [severity, setSeverity] =
    useState<RiskLevel>("MODERATE");

  const [submitted, setSubmitted] =
    useState<string | null>(null);

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!location.trim()) return;

    const refId = `IN-2026-${Math.floor(
      Math.random() * 900 + 100
    )}`;

    const incident: Incident = {
      id: refId,
      location: location.trim(),
      type,
      severity,
      reportedAt:
        new Date().toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
      status: "Under verification",
      impact: "Pending assessment",
      description:
        description.trim(),
    };

    dispatch({
      type: "ADD_INCIDENT",
      incident,
    });

    setSubmitted(refId);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-warm-200 rounded-sm p-8 max-w-sm w-full text-center shadow-xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle
              size={24}
              className="text-green-600"
            />
          </div>

          <div className="text-lg font-bold text-warm-900 mb-1">
            Report Received
          </div>

          <div className="text-sm text-warm-500 mb-4">
            Your observation has been added to the
            incident feed.
          </div>

          <div className="bg-warm-50 border border-warm-200 rounded-sm px-4 py-3 mb-4">
            <div className="text-[11px] font-mono text-warm-400 mb-0.5">
              REFERENCE
            </div>

            <div className="font-mono font-bold text-maroon-700 text-base">
              {submitted}
            </div>

            <div className="text-xs text-warm-500 mt-1">
              Status: Under verification
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-3 py-3 mb-5 text-left">
            <div className="flex items-start gap-2">
              <Activity
                size={14}
                className="text-blue-600 mt-0.5 shrink-0"
              />

              <p className="text-[11px] text-blue-800 leading-relaxed">
                The report can be cross-referenced with
                drainage conditions and other observations.
                Confirmed infrastructure issues can become
                inputs to the flood-model feedback loop.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-sm hover:bg-maroon-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white border border-warm-200 rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
          <div>
            <div className="text-base font-bold text-warm-900">
              Report an Issue
            </div>

            <div className="text-xs text-warm-400">
              {cityData[state.city].name} · Add a real-world
              observation to the incident feed
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-warm-400 hover:text-warm-700"
            aria-label="Close report form"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4"
        >
          {/* Issue type */}
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">
              Issue Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as IncidentType
                )
              }
              className="w-full border border-warm-200 rounded-sm px-3 py-2 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
            >
              {(
                [
                  "Blocked Drain",
                  "Waterlogging",
                  "Drain Overflow",
                  "Damaged Drain",
                  "Other",
                ] as IncidentType[]
              ).map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">
              Location{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
              />

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder={`e.g. Ring Road near ${cityData[state.city].name} Gate 3`}
                className="w-full border border-warm-200 rounded-sm pl-9 pr-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:border-maroon-600 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">
              Severity
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  "LOW",
                  "MODERATE",
                  "HIGH",
                  "CRITICAL",
                ] as RiskLevel[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setSeverity(item)
                  }
                  className={`py-2 text-xs font-medium rounded-sm border transition-colors ${
                    severity === item
                      ? item === "CRITICAL"
                        ? "bg-red-600 text-white border-red-600"
                        : item === "HIGH"
                        ? "bg-orange-600 text-white border-orange-600"
                        : item === "MODERATE"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-green-600 text-white border-green-600"
                      : "text-warm-600 border-warm-200 hover:bg-warm-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">
              Description{" "}
              <span className="text-warm-400 font-normal">
                (optional)
              </span>
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={4}
              placeholder="Describe what you observed — water depth, blockage, affected road, overflow..."
              className="w-full border border-warm-200 rounded-sm px-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:border-maroon-600 focus:outline-none resize-none"
            />
          </div>

          {/* Workflow explanation */}
          <div className="bg-warm-50 border border-warm-200 px-3 py-3">
            <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500 mb-2">
              What happens next
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                "Report",
                "Verify",
                "Confirm",
                "Model feedback",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`px-2 py-1 text-[9px] font-mono ${
                      index === 0
                        ? "bg-maroon-700 text-white"
                        : "bg-white border border-warm-200 text-warm-500"
                    }`}
                  >
                    {step}
                  </span>

                  {index < 3 && (
                    <ArrowRight
                      size={11}
                      className="text-warm-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-warm-200 text-sm text-warm-600 rounded-sm hover:bg-warm-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-sm hover:bg-maroon-800 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReportsScreen() {
  const { state, dispatch } = useApp();

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const incidents = state.incidents;
  const filter = state.incidentFilter;

  const filtered =
    filter === "All"
      ? incidents
      : incidents.filter(
          (incident) =>
            incident.severity === filter
        );

  const counts: Record<
    string,
    number
  > = {
    All: incidents.length,
  };

  (
    [
      "CRITICAL",
      "HIGH",
      "MODERATE",
      "LOW",
    ] as RiskLevel[]
  ).forEach((level) => {
    counts[level] = incidents.filter(
      (incident) =>
        incident.severity === level
    ).length;
  });

  const statusCounts = {
    verification: incidents.filter(
      (incident) =>
        incident.status ===
        "Under verification"
    ).length,

    confirmed: incidents.filter(
      (incident) =>
        incident.status === "Confirmed"
    ).length,

    resolved: incidents.filter(
      (incident) =>
        incident.status === "Resolved" ||
        incident.status === "Closed"
    ).length,
  };

  const modelRelevantReports =
    incidents.filter(
      (incident) =>
        incident.type ===
          "Blocked Drain" ||
        incident.type ===
          "Drain Overflow" ||
        incident.type ===
          "Waterlogging"
    ).length;

  const priorityReports =
    incidents.filter(
      (incident) =>
        incident.severity ===
          "CRITICAL" ||
        incident.severity === "HIGH"
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-warm-500 mb-1">
            Citizen intelligence
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-warm-900">
            Reports & Incidents —{" "}
            {cityData[state.city].name}
          </h1>

          <p className="text-sm text-warm-500 mt-1">
            Real-world observations that can
            strengthen flood nowcasting
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-sm hover:bg-maroon-800 transition-colors shrink-0"
        >
          <Plus size={14} />
          Report an Issue
        </button>
      </div>

      {/* Incident overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Total reports
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {incidents.length}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Recorded incidents
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock
              size={14}
              className="text-amber-500"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Verification
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-amber-700">
            {statusCounts.verification}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Awaiting confirmation
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert
              size={14}
              className="text-red-500"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Confirmed
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-red-700">
            {statusCounts.confirmed}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Verified incidents
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity
              size={14}
              className="text-maroon-600"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Model relevant
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-maroon-700">
            {modelRelevantReports}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Potential flood-model inputs
          </div>
        </div>
      </div>

      {/* Feedback loop */}
      <div className="bg-white border border-warm-200 mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <RefreshCw
              size={15}
              className="text-maroon-700"
            />

            <div>
              <div className="text-sm font-semibold text-warm-900">
                Citizen-to-model feedback loop
              </div>

              <div className="text-[11px] text-warm-400 font-mono mt-0.5">
                How field observations improve flood intelligence
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              {
                number: "01",
                title: "Observe",
                description:
                  "Citizen or field team reports a condition.",
              },
              {
                number: "02",
                title: "Verify",
                description:
                  "Authority checks the reported incident.",
              },
              {
                number: "03",
                title: "Confirm",
                description:
                  "Verified blockage or flooding becomes trusted input.",
              },
              {
                number: "04",
                title: "Recalculate",
                description:
                  "Drainage and flood models can incorporate the condition.",
              },
              {
                number: "05",
                title: "Update",
                description:
                  "Forecast and routing intelligence can change.",
              },
            ].map((step, index, array) => (
              <div
                key={step.number}
                className="relative"
              >
                <div className="border border-warm-200 bg-warm-50 p-3 h-full">
                  <div className="text-[9px] font-mono text-warm-400 mb-2">
                    {step.number}
                  </div>

                  <div className="text-xs font-semibold text-warm-900">
                    {step.title}
                  </div>

                  <p className="text-[10px] text-warm-500 leading-relaxed mt-1.5">
                    {step.description}
                  </p>
                </div>

                {index <
                  array.length - 1 && (
                  <ArrowRight
                    size={13}
                    className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-warm-300 z-10"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority incidents */}
      {priorityReports.length > 0 && (
        <div className="border border-red-200 bg-red-50 mb-6">
          <div className="px-4 py-3 border-b border-red-100">
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={15}
                className="text-red-600"
              />

              <div>
                <div className="text-sm font-semibold text-red-900">
                  Priority incidents
                </div>

                <div className="text-[11px] text-red-700 font-mono mt-0.5">
                  High-severity reports requiring attention
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-red-100">
            {priorityReports
              .slice(0, 3)
              .map((incident) => (
                <button
                  key={incident.id}
                  onClick={() =>
                    setExpandedId(
                      incident.id
                    )
                  }
                  className="w-full text-left px-4 py-3 hover:bg-red-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-base">
                      {typeIcon[
                        incident.type
                      ] ?? "📋"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-red-700">
                        {incident.id}
                      </div>

                      <div className="text-sm font-medium text-red-950 truncate">
                        {incident.location}
                      </div>

                      <div className="text-[10px] text-red-700 mt-0.5">
                        {incident.type} ·{" "}
                        {incident.status}
                      </div>
                    </div>

                    <StatusBadge
                      level={
                        incident.severity
                      }
                    />
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter
          size={13}
          className="text-warm-400"
        />

        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() =>
              dispatch({
                type: "SET_INCIDENT_FILTER",
                filter: item,
              })
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
              filter === item
                ? "bg-maroon-700 text-white border-maroon-700"
                : "text-warm-600 border-warm-200 hover:bg-warm-50"
            }`}
          >
            {item}{" "}
            {counts[item] !==
            undefined ? (
              <span className="opacity-70">
                ({counts[item]})
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Incidents list */}
      <div className="bg-white border border-warm-200">
        <div className="px-4 py-2.5 border-b border-warm-100 bg-warm-50">
          <div className="grid grid-cols-[1.5rem_1fr_auto] gap-3 text-[10px] font-mono text-warm-400 uppercase tracking-wide">
            <span />

            <span>
              Incident · Location
            </span>

            <span>
              Severity · Status
            </span>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-warm-400 text-sm">
            No incidents matching this
            filter.
          </div>
        )}

        {filtered.map((incident) => (
          <IncidentRow
            key={incident.id}
            incident={incident}
            expanded={
              expandedId === incident.id
            }
            onToggle={() =>
              setExpandedId(
                expandedId === incident.id
                  ? null
                  : incident.id
              )
            }
          />
        ))}
      </div>

      {/* Reporting guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="bg-blue-50 border border-blue-200 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Droplets
              size={15}
              className="text-blue-600 mt-0.5 shrink-0"
            />

            <div>
              <div className="text-xs font-semibold text-blue-900">
                What to report
              </div>

              <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                Blocked drains, sudden waterlogging,
                overflowing drains, damaged drainage
                infrastructure, and unusually deep water
                are especially useful observations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-warm-50 border border-warm-200 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Activity
              size={15}
              className="text-warm-500 mt-0.5 shrink-0"
            />

            <div>
              <div className="text-xs font-semibold text-warm-900">
                Why reports matter
              </div>

              <p className="text-[11px] text-warm-600 mt-1 leading-relaxed">
                Field observations provide a second source
                of evidence alongside rainfall, terrain and
                drainage-model information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model disclaimer */}
      <div className="mt-4 px-3 py-2.5 border border-warm-200 bg-white">
        <p className="text-[10px] text-warm-400 font-mono leading-relaxed">
          PROTOTYPE WORKFLOW · Reports currently update the
          frontend incident state. Backend verification,
          drainage-condition updates and automatic model
          recalibration will be connected in the integration
          phase.
        </p>
      </div>

      {modalOpen && (
        <ReportModal
          onClose={() =>
            setModalOpen(false)
          }
        />
      )}
    </div>
  );
}