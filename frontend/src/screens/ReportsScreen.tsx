import { useState } from "react";
import { Plus, Filter, ChevronDown, ChevronUp, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useApp } from "../state/AppContext";
import { cityData, Incident, IncidentType, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";

const FILTERS = ["All", "CRITICAL", "HIGH", "MODERATE", "LOW"];

const typeIcon: Record<string, string> = {
  "Blocked Drain": "🔧",
  "Waterlogging": "💧",
  "Drain Overflow": "⚠",
  "Damaged Drain": "🔨",
  "Other": "📋",
};

function IncidentRow({ incident, expanded, onToggle }: {
  incident: Incident;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusIcon = {
    "Confirmed": <AlertCircle size={13} className="text-red-500" />,
    "Under verification": <Clock size={13} className="text-amber-500" />,
    "Resolved": <CheckCircle size={13} className="text-green-500" />,
    "Closed": <CheckCircle size={13} className="text-warm-400" />,
  }[incident.status];

  return (
    <div className={`border-b border-warm-50 transition-colors ${expanded ? "bg-warm-50/50" : "hover:bg-warm-50/30"}`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <div className="shrink-0 w-5 text-base leading-none">{typeIcon[incident.type] ?? "📋"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-warm-400">{incident.id}</span>
            <span className="text-sm font-medium text-warm-900 truncate">{incident.location}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-warm-500">{incident.type}</span>
            <span className="text-warm-300">·</span>
            <span className="text-[11px] font-mono text-warm-400">{incident.reportedAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge level={incident.severity} />
          <div className="hidden items-center gap-1 sm:flex">
            {statusIcon}
            <span className="text-[10px] text-warm-500 font-mono hidden md:block">{incident.status}</span>
          </div>
          {expanded ? <ChevronUp size={14} className="text-warm-400" /> : <ChevronDown size={14} className="text-warm-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-12">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[10px] font-mono text-warm-400 mb-0.5">STATUS</div>
              <div className="flex items-center gap-1.5">
                {statusIcon}
                <span className="text-xs text-warm-700">{incident.status}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-warm-400 mb-0.5">IMPACT</div>
              <div className="text-xs text-warm-700">{incident.impact}</div>
            </div>
          </div>
          {incident.description && (
            <div className="bg-white border border-warm-200 rounded-[3px] px-3 py-2.5 text-xs text-warm-600">
              {incident.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportModal({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useApp();
  const [type, setType] = useState<IncidentType>("Blocked Drain");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<RiskLevel>("MODERATE");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    const refId = `IN-2026-0${Math.floor(Math.random() * 50 + 148)}`;
    const incident: Incident = {
      id: refId,
      location: location.trim(),
      type,
      severity,
      reportedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "Under verification",
      impact: "Pending assessment",
      description: description.trim(),
    };
    dispatch({ type: "ADD_INCIDENT", incident });
    setSubmitted(refId);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-warm-200 rounded-[4px] p-8 max-w-sm w-full text-center shadow-xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div className="text-lg font-bold text-warm-900 mb-1">Report Received</div>
          <div className="text-sm text-warm-500 mb-4">Your report has been submitted successfully.</div>
          <div className="bg-warm-50 border border-warm-200 rounded-[3px] px-4 py-3 mb-4">
            <div className="text-[11px] font-mono text-warm-400 mb-0.5">REFERENCE</div>
            <div className="font-mono font-bold text-maroon-700 text-base">{submitted}</div>
            <div className="text-xs text-warm-500 mt-1">Status: Under verification</div>
          </div>
          <p className="text-xs text-warm-500 mb-6">Your report will be cross-referenced with drainage telemetry. Model recalibration will occur automatically if the blockage is confirmed.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-[3px] hover:bg-maroon-800 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white border border-warm-200 rounded-[4px] w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
          <div>
            <div className="text-base font-bold text-warm-900">Report an Issue</div>
            <div className="text-xs text-warm-400">{cityData[state.city].name} · Your report will update the drainage model</div>
          </div>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-700"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">Issue Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as IncidentType)}
              className="w-full border border-warm-200 rounded-[3px] px-3 py-2 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
            >
              {(["Blocked Drain", "Waterlogging", "Drain Overflow", "Damaged Drain", "Other"] as IncidentType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={`e.g. Ring Road near ${cityData[state.city].name} Gate 3`}
              className="w-full border border-warm-200 rounded-[3px] px-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:border-maroon-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">Severity</label>
            <div className="flex gap-2">
              {(["LOW", "MODERATE", "HIGH", "CRITICAL"] as RiskLevel[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-[3px] border transition-colors ${
                    severity === s
                      ? s === "CRITICAL" ? "bg-red-600 text-white border-red-600" :
                        s === "HIGH" ? "bg-amber-600 text-white border-amber-600" :
                        s === "MODERATE" ? "bg-yellow-500 text-white border-yellow-500" :
                        "bg-green-600 text-white border-green-600"
                      : "text-warm-600 border-warm-200 hover:bg-warm-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what you observed — water depth, blockage type, affected road..."
              className="w-full border border-warm-200 rounded-[3px] px-3 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:border-maroon-600 focus:outline-none resize-none"
            />
          </div>
          <div className="pt-1 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-warm-200 text-sm text-warm-600 rounded-[3px] hover:bg-warm-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-[3px] hover:bg-maroon-800 transition-colors">
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const incidents = state.incidents;
  const filter = state.incidentFilter;

  const filtered = filter === "All" ? incidents : incidents.filter(i => i.severity === filter);

  const counts: Record<string, number> = { All: incidents.length };
  ["CRITICAL", "HIGH", "MODERATE", "LOW"].forEach(f => {
    counts[f] = incidents.filter(i => i.severity === f).length;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-warm-900">Reports & Incidents — {cityData[state.city].name}</h1>
          <p className="text-sm text-warm-500 mt-1">{incidents.length} incident{incidents.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-maroon-700 text-white text-sm font-medium rounded-[3px] hover:bg-maroon-800 transition-colors shrink-0"
        >
          <Plus size={14} />
          Report an Issue
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter size={13} className="text-warm-400" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => dispatch({ type: "SET_INCIDENT_FILTER", filter: f })}
            className={`px-3 py-1 text-xs font-medium rounded-[3px] border transition-colors ${
              filter === f
                ? "bg-maroon-700 text-white border-maroon-700"
                : "text-warm-600 border-warm-200 hover:bg-warm-50"
            }`}
          >
            {f} {counts[f] !== undefined ? <span className="opacity-70">({counts[f]})</span> : null}
          </button>
        ))}
      </div>

      {/* Incidents list */}
      <div className="bg-white border border-warm-200 rounded-[3px]">
        <div className="px-4 py-2.5 border-b border-warm-100 bg-warm-50">
          <div className="grid grid-cols-[1.5rem_1fr_auto] gap-3 text-[10px] font-mono text-warm-400 uppercase tracking-wide">
            <span />
            <span>Incident · Location</span>
            <span>Severity · Status</span>
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-warm-400 text-sm">No incidents matching this filter.</div>
        )}
        {filtered.map(incident => (
          <IncidentRow
            key={incident.id}
            incident={incident}
            expanded={expandedId === incident.id}
            onToggle={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
          />
        ))}
      </div>

      {/* Context note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-[3px] px-4 py-3 flex items-start gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
        <p className="text-xs text-blue-800">
          Citizen and authority reports are cross-referenced with drainage telemetry. Confirmed blockages trigger automatic drainage model recalibration, updating flood risk forecasts and safe route recommendations.
        </p>
      </div>

      {modalOpen && <ReportModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
