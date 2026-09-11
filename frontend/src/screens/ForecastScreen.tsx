import { useApp } from "../state/AppContext";
import { cityData } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import { CloudRain, Waves, Activity, Clock } from "lucide-react";

function SVGBarChart({ values, labels, color, unit, maxVal }: {
  values: number[];
  labels: string[];
  color: string;
  unit: string;
  maxVal: number;
}) {
  const w = 680;
  const h = 160;
  const padL = 50;
  const padB = 30;
  const padT = 20;
  const barW = (w - padL - 20) / values.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Y axis lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = padT + (1 - f) * (h - padT - padB);
        return (
          <g key={f}>
            <line x1={padL} x2={w - 10} y1={y} y2={y} stroke="#E5E0DA" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#8C867E" fontFamily="DM Mono, monospace">{Math.round(f * maxVal)}</text>
          </g>
        );
      })}
      {/* Bars */}
      {values.map((v, i) => {
        const barH = ((v / maxVal) * (h - padT - padB));
        const x = padL + 10 + i * ((w - padL - 20) / values.length);
        const y = h - padB - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.85" />
            <text x={x + barW / 2} y={h - padB + 14} textAnchor="middle" fontSize="9" fill="#6B6560" fontFamily="DM Mono, monospace">{labels[i]}</text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#4A4540" fontFamily="DM Mono, monospace" fontWeight="500">{v}{unit}</text>
          </g>
        );
      })}
      <text x={w - 10} y={padT - 6} textAnchor="end" fontSize="9" fill="#8C867E" fontFamily="DM Mono, monospace">{unit}</text>
    </svg>
  );
}

function SVGLineChart({ values, labels, color, maxVal, unit }: {
  values: number[];
  labels: string[];
  color: string;
  maxVal: number;
  unit: string;
}) {
  const w = 680;
  const h = 120;
  const padL = 50;
  const padB = 28;
  const padT = 16;
  const step = (w - padL - 20) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padL + 10 + i * step;
    const y = padT + (1 - v / maxVal) * (h - padT - padB);
    return `${x},${y}`;
  }).join(" ");

  const fillPoints = [
    `${padL + 10},${h - padB}`,
    ...values.map((v, i) => {
      const x = padL + 10 + i * step;
      const y = padT + (1 - v / maxVal) * (h - padT - padB);
      return `${x},${y}`;
    }),
    `${padL + 10 + (values.length - 1) * step},${h - padB}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 0.5, 1].map(f => {
        const y = padT + (1 - f) * (h - padT - padB);
        return (
          <g key={f}>
            <line x1={padL} x2={w - 10} y1={y} y2={y} stroke="#E5E0DA" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#8C867E" fontFamily="DM Mono, monospace">{Math.round(f * maxVal)}</text>
          </g>
        );
      })}
      <polygon points={fillPoints} fill={color} opacity="0.1" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = padL + 10 + i * step;
        const y = padT + (1 - v / maxVal) * (h - padT - padB);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="1.5" />
            <text x={x} y={h - padB + 14} textAnchor="middle" fontSize="9" fill="#6B6560" fontFamily="DM Mono, monospace">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ForecastScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const ts = data.timeSteps[state.timeStep];
  const labels = data.timeSteps.map(s => s.label);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-warm-900">Flood Forecast — {data.name}</h1>
        <p className="text-sm text-warm-500 mt-1">0–3 hour nowcast · Updated 2 min ago</p>
      </div>

      {/* Time selector */}
      <div className="flex gap-0 mb-8 border border-warm-200 rounded-[4px] overflow-hidden w-fit">
        {data.timeSteps.map((step, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: "SET_TIME_STEP", step: i })}
            className={`px-4 py-2 text-xs font-mono border-r border-warm-200 last:border-r-0 transition-colors ${
              state.timeStep === i
                ? "bg-maroon-700 text-white"
                : "bg-white text-warm-600 hover:bg-warm-50"
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Key metrics for selected time */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: CloudRain, label: "Rainfall Intensity", value: `${ts.rainfall}`, unit: "mm/hr", color: "text-blue-700" },
          { icon: Activity, label: "Drainage Utilization", value: `${ts.drainageUtil}`, unit: "%", color: ts.drainageUtil >= 90 ? "text-red-700" : ts.drainageUtil >= 75 ? "text-amber-700" : "text-warm-800" },
          { icon: Waves, label: "Predicted Water Depth", value: `${ts.waterDepth}`, unit: "cm", color: ts.waterDepth >= 20 ? "text-red-700" : ts.waterDepth >= 8 ? "text-amber-700" : "text-warm-800" },
          { icon: Clock, label: "Flood Risk Level", value: ts.riskLevel, unit: "", color: "text-warm-800" },
        ].map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="bg-white border border-warm-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-warm-400" />
              <span className="text-[11px] text-warm-500 uppercase tracking-wide font-mono">{label}</span>
            </div>
            {unit === "" ? (
              <StatusBadge level={value} size="md" />
            ) : (
              <div className={`text-2xl font-bold font-mono ${color}`}>
                {value}<span className="text-sm font-normal text-warm-400 ml-1">{unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="bg-warm-50 border border-warm-200 rounded-[3px] px-4 py-3 mb-8">
        <div className="text-[10px] font-mono text-warm-500 uppercase tracking-wide mb-1">Forecast Narrative — {ts.label}</div>
        <p className="text-sm text-warm-800">{ts.explanation}</p>
      </div>

      {/* Rainfall chart */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Rainfall Intensity Forecast</div>
          <div className="text-[11px] text-warm-400 font-mono">mm/hr · 0–3 hr nowcast</div>
        </div>
        <div className="p-4">
          <SVGBarChart
            values={data.timeSteps.map(s => s.rainfall)}
            labels={labels}
            color="#2563EB"
            unit=""
            maxVal={Math.ceil(Math.max(...data.timeSteps.map(s => s.rainfall)) / 20) * 20 + 20}
          />
        </div>
      </div>

      {/* Drainage utilization chart */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Drainage Utilization</div>
          <div className="text-[11px] text-warm-400 font-mono">% of design capacity</div>
        </div>
        <div className="p-4">
          <SVGLineChart
            values={data.timeSteps.map(s => s.drainageUtil)}
            labels={labels}
            color="#D97706"
            maxVal={100}
            unit="%"
          />
        </div>
      </div>

      {/* Water depth progression */}
      <div className="bg-white border border-warm-200 rounded-[3px] mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Predicted Water Depth</div>
          <div className="text-[11px] text-warm-400 font-mono">cm · hotspot average</div>
        </div>
        <div className="p-4">
          <SVGLineChart
            values={data.timeSteps.map(s => s.waterDepth)}
            labels={labels}
            color="#DC2626"
            maxVal={Math.ceil(Math.max(...data.timeSteps.map(s => s.waterDepth)) / 10) * 10 + 10}
            unit="cm"
          />
        </div>
      </div>

      {/* Timeline summary table */}
      <div className="bg-white border border-warm-200 rounded-[3px]">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">Forecast Summary</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50">
                {["Time", "Rainfall", "Drainage", "Water Depth", "Risk"].map(col => (
                  <th key={col} className="text-left px-4 py-2.5 text-[11px] font-mono text-warm-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.timeSteps.map((step, i) => (
                <tr
                  key={i}
                  onClick={() => dispatch({ type: "SET_TIME_STEP", step: i })}
                  className={`border-b border-warm-50 cursor-pointer transition-colors ${state.timeStep === i ? "bg-maroon-50" : "hover:bg-warm-50"}`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-warm-700 font-medium">{step.label}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-700">{step.rainfall} mm/hr</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{step.drainageUtil}%</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{step.waterDepth} cm</td>
                  <td className="px-4 py-2.5"><StatusBadge level={step.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-warm-400 font-mono">
        <span>Forecast confidence: {data.forecastConfidence}%</span>
        <span>·</span>
        <span>Model: Drainage-Rainfall Coupled Nowcast v2.1</span>
        <span>·</span>
        <span>Updated: 2 min ago</span>
      </div>
    </div>
  );
}
