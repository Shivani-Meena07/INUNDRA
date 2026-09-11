import { useApp } from "../state/AppContext";
import { cityData, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import { AlertTriangle, CheckCircle } from "lucide-react";

const riskBar: Record<RiskLevel, { width: string; color: string }> = {
  CRITICAL: { width: "w-full", color: "bg-red-500" },
  HIGH: { width: "w-4/5", color: "bg-amber-500" },
  MODERATE: { width: "w-3/5", color: "bg-yellow-500" },
  LOW: { width: "w-2/5", color: "bg-green-500" },
  SAFE: { width: "w-1/5", color: "bg-green-400" },
};

const confBar: Record<string, string> = {
  High: "w-4/5 bg-green-500",
  Medium: "w-3/5 bg-amber-500",
  Low: "w-2/5 bg-red-400",
};

export default function RiskAnalysisScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];

  const overallRisk = data.alertLevel;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-warm-900">Risk Analysis — {data.name}</h1>
        <p className="text-sm text-warm-500 mt-1">Causal flood risk breakdown · {data.timeSteps[state.timeStep].label}</p>
      </div>

      {/* Overall risk banner */}
      <div className={`border rounded-[3px] px-4 py-4 mb-8 flex items-start gap-3 ${
        overallRisk === "CRITICAL" ? "bg-red-50 border-red-200" :
        overallRisk === "HIGH" ? "bg-amber-50 border-amber-200" :
        "bg-yellow-50 border-yellow-200"
      }`}>
        <AlertTriangle size={20} className={overallRisk === "CRITICAL" ? "text-red-600 shrink-0 mt-0.5" : "text-amber-600 shrink-0 mt-0.5"} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-warm-900">Overall Flood Risk</span>
            <StatusBadge level={overallRisk} size="md" />
          </div>
          <p className="text-sm text-warm-700">{data.alertMessage}</p>
        </div>
      </div>

      {/* Risk factors */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Contributing Risk Factors</div>
        </div>
        <div className="divide-y divide-warm-50">
          {data.riskFactors.map(rf => {
            const bar = riskBar[rf.severity];
            return (
              <div key={rf.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-warm-900">{rf.label}</span>
                      <StatusBadge level={rf.severity} />
                    </div>
                    <div className="font-mono text-base font-bold text-warm-800">{rf.value}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-warm-100 rounded-full mb-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${bar.width} ${bar.color}`} />
                </div>
                <p className="text-xs text-warm-500">{rf.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why this area is at risk */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Why This Area Is at Risk</div>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-warm-700 leading-relaxed">{data.whyAtRisk}</p>
        </div>
      </div>

      {/* Causal chain diagram */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Causal Chain</div>
          <div className="text-[11px] text-warm-400 font-mono">How factors combine to produce flood prediction</div>
        </div>
        <div className="px-4 py-5">
          <div className="flex flex-col gap-0">
            {[
              { label: "Rainfall", detail: `${data.timeSteps[state.timeStep].rainfall} mm/hr`, color: "border-blue-300 bg-blue-50 text-blue-800" },
              { label: "High imperviousness (≥72%)", detail: "Near-total surface runoff", color: "border-amber-300 bg-amber-50 text-amber-800" },
              { label: "Low-lying terrain", detail: "Surface accumulation potential", color: "border-amber-300 bg-amber-50 text-amber-800" },
              { label: "Drainage at capacity", detail: `${data.timeSteps[state.timeStep].drainageUtil}% utilization`, color: "border-red-300 bg-red-50 text-red-800" },
              { label: "Downstream restriction", detail: "Confirmed blockage", color: "border-red-300 bg-red-50 text-red-800" },
              { label: "Predicted inundation", detail: `${data.timeSteps[state.timeStep].waterDepth > 0 ? data.timeSteps[state.timeStep].waterDepth : data.hotspots[0]?.depthMin ?? "—"}–${data.hotspots[0]?.depthMax ?? "—"} cm depth`, color: "border-maroon-200 bg-maroon-50 text-maroon-800" },
            ].map((item, i, arr) => (
              <div key={i} className="flex flex-col items-start">
                <div className={`border rounded-[3px] px-3 py-2 text-xs font-medium self-stretch ${item.color}`}>
                  <span className="font-mono text-[10px] opacity-70 mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                  <span className="ml-2 opacity-70">{item.detail}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="ml-4 w-0.5 h-4 bg-warm-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast confidence */}
      <div className="bg-white border border-warm-200 rounded-[3px]">
        <div className="px-4 py-3 border-b border-warm-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-warm-900">Forecast Confidence</div>
          <div className="font-mono text-xl font-bold text-warm-800">{data.forecastConfidence}%</div>
        </div>
        <div className="divide-y divide-warm-50">
          {data.confidenceFactors.map(cf => (
            <div key={cf.label} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className={cf.level === "High" ? "text-green-500" : cf.level === "Medium" ? "text-amber-500" : "text-red-400"} />
                <span className="text-xs text-warm-700">{cf.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${confBar[cf.level]}`} />
                </div>
                <span className={`text-[11px] font-mono ${cf.level === "High" ? "text-green-700" : cf.level === "Medium" ? "text-amber-700" : "text-red-600"}`}>
                  {cf.level}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-warm-50 border-t border-warm-100">
          <p className="text-[11px] text-warm-500">Confidence reflects agreement between radar observation, terrain model accuracy, freshness of drainage telemetry, and corroborating citizen reports.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => dispatch({ type: "SET_TAB", tab: "drainage" })}
          className="px-4 py-2 text-xs font-medium text-maroon-700 border border-maroon-200 rounded-[3px] hover:bg-maroon-50 transition-colors"
        >
          Inspect Drainage Network →
        </button>
        <button
          onClick={() => dispatch({ type: "SET_TAB", tab: "route" })}
          className="px-4 py-2 text-xs font-medium text-white bg-maroon-700 rounded-[3px] hover:bg-maroon-800 transition-colors"
        >
          Find Safe Route →
        </button>
      </div>
    </div>
  );
}
