import { useApp } from "../state/AppContext";
import { cityData, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import {
  CloudRain,
  Waves,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Gauge,
  ArrowRight,
} from "lucide-react";

function SVGBarChart({
  values,
  labels,
  color,
  unit,
  maxVal,
}: {
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
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = padT + (1 - f) * (h - padT - padB);

        return (
          <g key={f}>
            <line
              x1={padL}
              x2={w - 10}
              y1={y}
              y2={y}
              stroke="#E5E0DA"
              strokeWidth="1"
            />

            <text
              x={padL - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#8C867E"
              fontFamily="DM Mono, monospace"
            >
              {Math.round(f * maxVal)}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const barH = (v / maxVal) * (h - padT - padB);
        const x =
          padL +
          10 +
          i * ((w - padL - 20) / values.length);
        const y = h - padB - barH;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              rx="2"
              opacity="0.85"
            />

            <text
              x={x + barW / 2}
              y={h - padB + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#6B6560"
              fontFamily="DM Mono, monospace"
            >
              {labels[i]}
            </text>

            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#4A4540"
              fontFamily="DM Mono, monospace"
              fontWeight="500"
            >
              {v}
              {unit}
            </text>
          </g>
        );
      })}

      <text
        x={w - 10}
        y={padT - 6}
        textAnchor="end"
        fontSize="9"
        fill="#8C867E"
        fontFamily="DM Mono, monospace"
      >
        {unit}
      </text>
    </svg>
  );
}

function SVGLineChart({
  values,
  labels,
  color,
  maxVal,
  unit,
}: {
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
  const step =
    values.length > 1
      ? (w - padL - 20) / (values.length - 1)
      : 0;

  const points = values
    .map((v, i) => {
      const x = padL + 10 + i * step;
      const y =
        padT +
        (1 - v / maxVal) *
          (h - padT - padB);

      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = [
    `${padL + 10},${h - padB}`,
    ...values.map((v, i) => {
      const x = padL + 10 + i * step;
      const y =
        padT +
        (1 - v / maxVal) *
          (h - padT - padB);

      return `${x},${y}`;
    }),
    `${padL + 10 + (values.length - 1) * step},${h - padB}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 0.5, 1].map((f) => {
        const y =
          padT +
          (1 - f) * (h - padT - padB);

        return (
          <g key={f}>
            <line
              x1={padL}
              x2={w - 10}
              y1={y}
              y2={y}
              stroke="#E5E0DA"
              strokeWidth="1"
            />

            <text
              x={padL - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#8C867E"
              fontFamily="DM Mono, monospace"
            >
              {Math.round(f * maxVal)}
            </text>
          </g>
        );
      })}

      <polygon
        points={fillPoints}
        fill={color}
        opacity="0.1"
      />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {values.map((v, i) => {
        const x = padL + 10 + i * step;
        const y =
          padT +
          (1 - v / maxVal) *
            (h - padT - padB);

        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
            />

            <text
              x={x}
              y={h - padB + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#6B6560"
              fontFamily="DM Mono, monospace"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function getRiskDescription(level: RiskLevel) {
  switch (level) {
    case "CRITICAL":
      return "Severe inundation conditions expected";
    case "HIGH":
      return "Significant flooding likely";
    case "MODERATE":
      return "Localized waterlogging possible";
    case "LOW":
      return "Limited flood impact expected";
    case "SAFE":
      return "No significant flooding expected";
    default:
      return "Forecast available";
  }
}

function getRiskAccent(level: RiskLevel) {
  switch (level) {
    case "CRITICAL":
      return "border-red-300 bg-red-50";
    case "HIGH":
      return "border-orange-300 bg-orange-50";
    case "MODERATE":
      return "border-amber-300 bg-amber-50";
    case "LOW":
      return "border-lime-300 bg-lime-50";
    case "SAFE":
      return "border-green-300 bg-green-50";
    default:
      return "border-warm-200 bg-warm-50";
  }
}

export default function ForecastScreen() {
  const { state, dispatch } = useApp();

  const data = cityData[state.city];
  const ts = data.timeSteps[state.timeStep];
  const labels = data.timeSteps.map((s) => s.label);

  const maxRainfall = Math.max(
    ...data.timeSteps.map((s) => s.rainfall)
  );

  const maxDepth = Math.max(
    ...data.timeSteps.map((s) => s.waterDepth)
  );

  const peakHotspot = [...data.hotspots].sort(
    (a, b) => b.depthMax - a.depthMax
  )[0];

  const earliestOnset = [...data.hotspots].sort(
    (a, b) => a.onset - b.onset
  )[0];

  const isEscalating =
    state.timeStep > 0 &&
    ts.riskLevel !==
      data.timeSteps[state.timeStep - 1].riskLevel;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-600" />

              <span className="text-[10px] font-mono uppercase tracking-wider text-warm-500">
                Live nowcast
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-warm-900">
              Flood Forecast — {data.name}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              0–3 hour urban flood nowcast · Updated 2 min ago
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-[10px] uppercase tracking-wide font-mono text-warm-400">
              Forecast confidence
            </div>

            <div className="text-xl font-bold font-mono text-warm-900">
              {data.forecastConfidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Forecast status banner */}
      <div
        className={`border px-4 py-4 mb-6 ${getRiskAccent(
          ts.riskLevel
        )}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-warm-700 mt-0.5 shrink-0"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Forecast status
                </span>

                <StatusBadge
                  level={ts.riskLevel}
                  size="md"
                />
              </div>

              <div className="font-semibold text-warm-900 mt-1">
                {getRiskDescription(ts.riskLevel)}
              </div>

              <p className="text-xs text-warm-600 mt-1 max-w-2xl">
                {ts.explanation}
              </p>
            </div>
          </div>

          {isEscalating && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-700 shrink-0">
              <TrendingUp size={14} />
              Risk changing
            </div>
          )}
        </div>
      </div>

      {/* Time selector */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500 mb-2">
          Forecast timeline
        </div>

        <div className="flex overflow-x-auto border border-warm-200 rounded-sm bg-white">
          {data.timeSteps.map((step, i) => (
            <button
              key={i}
              onClick={() =>
                dispatch({
                  type: "SET_TIME_STEP",
                  step: i,
                })
              }
              className={`flex-1 min-w-25 px-4 py-3 text-left border-r border-warm-200 last:border-r-0 transition-colors ${
                state.timeStep === i
                  ? "bg-maroon-700 text-white"
                  : "text-warm-600 hover:bg-warm-50"
              }`}
            >
              <div className="text-[10px] font-mono opacity-80">
                {step.label}
              </div>

              <div className="font-bold font-mono text-sm mt-1">
                {step.rainfall} mm/hr
              </div>

              <div
                className={`text-[10px] font-medium mt-1 ${
                  state.timeStep === i
                    ? "text-white"
                    : step.riskLevel === "CRITICAL"
                    ? "text-red-700"
                    : step.riskLevel === "HIGH"
                    ? "text-orange-700"
                    : step.riskLevel === "MODERATE"
                    ? "text-amber-700"
                    : "text-green-700"
                }`}
              >
                {step.riskLevel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NOWCAST CHAIN */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-warm-900">
              Nowcast chain
            </div>

            <div className="text-[11px] text-warm-400 font-mono">
              How current conditions translate into flood risk
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            {
              icon: CloudRain,
              label: "Rainfall",
              value: `${ts.rainfall} mm/hr`,
              note: "Incoming precipitation",
            },
            {
              icon: Activity,
              label: "Drainage",
              value: `${ts.drainageUtil}%`,
              note: "Design capacity used",
            },
            {
              icon: Waves,
              label: "Water depth",
              value: `${ts.waterDepth} cm`,
              note: "Predicted accumulation",
            },
            {
              icon: AlertTriangle,
              label: "Risk",
              value: ts.riskLevel,
              note: "Current forecast",
            },
          ].map(
            ({
              icon: Icon,
              label,
              value,
              note,
            }) => (
              <div
                key={label}
                className="relative bg-white border border-warm-200 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon
                    size={14}
                    className="text-warm-400"
                  />

                  <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                    {label}
                  </span>
                </div>

                <div className="text-xl font-bold font-mono text-warm-900">
                  {value}
                </div>

                <div className="text-[10px] text-warm-400 mt-1">
                  {note}
                </div>

                {label !== "Risk" && (
                  <ArrowRight
                    size={14}
                    className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-warm-300 z-10"
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Selected-time metrics */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-warm-900 mb-3">
          Selected forecast — {ts.label}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: CloudRain,
              label: "Rainfall Intensity",
              value: `${ts.rainfall}`,
              unit: "mm/hr",
              color: "text-blue-700",
            },
            {
              icon: Activity,
              label: "Drainage Utilization",
              value: `${ts.drainageUtil}`,
              unit: "%",
              color:
                ts.drainageUtil >= 90
                  ? "text-red-700"
                  : ts.drainageUtil >= 75
                  ? "text-amber-700"
                  : "text-warm-800",
            },
            {
              icon: Waves,
              label: "Predicted Water Depth",
              value: `${ts.waterDepth}`,
              unit: "cm",
              color:
                ts.waterDepth >= 20
                  ? "text-red-700"
                  : ts.waterDepth >= 8
                  ? "text-amber-700"
                  : "text-warm-800",
            },
            {
              icon: Clock,
              label: "Flood Risk Level",
              value: ts.riskLevel,
              unit: "",
              color: "text-warm-800",
            },
          ].map(
            ({
              icon: Icon,
              label,
              value,
              unit,
              color,
            }) => (
              <div
                key={label}
                className="bg-white border border-warm-200 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    size={14}
                    className="text-warm-400"
                  />

                  <span className="text-[11px] text-warm-500 uppercase tracking-wide font-mono">
                    {label}
                  </span>
                </div>

                {unit === "" ? (
                  <StatusBadge
                    level={value}
                    size="md"
                  />
                ) : (
                  <div
                    className={`text-2xl font-bold font-mono ${color}`}
                  >
                    {value}

                    <span className="text-sm font-normal text-warm-400 ml-1">
                      {unit}
                    </span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Onset / peak intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-warm-400" />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Earliest flood onset
            </span>
          </div>

          {earliestOnset ? (
            <>
              <div className="text-2xl font-bold font-mono text-warm-900">
                {earliestOnset.onset}
                <span className="text-sm font-normal text-warm-400 ml-1">
                  min
                </span>
              </div>

              <div className="text-xs text-warm-500 mt-1">
                {earliestOnset.label}
              </div>
            </>
          ) : (
            <div className="text-sm text-warm-400">
              No hotspot data
            </div>
          )}
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Waves size={15} className="text-warm-400" />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Peak predicted depth
            </span>
          </div>

          {peakHotspot ? (
            <>
              <div className="text-2xl font-bold font-mono text-red-700">
                {peakHotspot.depthMax}
                <span className="text-sm font-normal text-warm-400 ml-1">
                  cm
                </span>
              </div>

              <div className="text-xs text-warm-500 mt-1">
                {peakHotspot.label}
              </div>
            </>
          ) : (
            <div className="text-sm text-warm-400">
              No hotspot data
            </div>
          )}
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={15} className="text-warm-400" />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Maximum drainage stress
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-amber-700">
            {Math.max(
              ...data.timeSteps.map(
                (step) => step.drainageUtil
              )
            )}
            <span className="text-sm font-normal text-warm-400 ml-1">
              %
            </span>
          </div>

          <div className="text-xs text-warm-500 mt-1">
            Forecast maximum utilization
          </div>
        </div>
      </div>

      {/* Why this forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-warm-50 border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              size={15}
              className="text-warm-500"
            />

            <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Why this area is at risk
            </div>
          </div>

          <p className="text-sm text-warm-800 leading-relaxed">
            {data.whyAtRisk}
          </p>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck
              size={15}
              className="text-warm-500"
            />

            <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Forecast confidence
            </div>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div className="text-2xl font-bold font-mono text-warm-900">
              {data.forecastConfidence}%
            </div>

            <span className="text-[10px] font-mono text-warm-400">
              Model confidence
            </span>
          </div>

          <div className="h-2 bg-warm-100 overflow-hidden mb-4">
            <div
              className="h-full bg-maroon-700"
              style={{
                width: `${data.forecastConfidence}%`,
              }}
            />
          </div>

          <div className="space-y-2">
            {data.confidenceFactors.map(
              (factor) => (
                <div
                  key={factor.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-warm-600">
                    {factor.label}
                  </span>

                  <span
                    className={`font-mono ${
                      factor.level === "High"
                        ? "text-green-700"
                        : factor.level === "Medium"
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    {factor.level}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Priority hotspots */}
      <div className="bg-white border border-warm-200 mb-8">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-warm-900">
                Priority forecast hotspots
              </div>

              <div className="text-[11px] text-warm-400 font-mono">
                Areas requiring attention during the nowcast window
              </div>
            </div>

            <MapPin
              size={15}
              className="text-warm-400"
            />
          </div>
        </div>

        <div className="divide-y divide-warm-100">
          {data.hotspots
            .slice()
            .sort((a, b) => b.depthMax - a.depthMax)
            .slice(0, 5)
            .map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() =>
                  dispatch({
                    type: "SELECT_HOTSPOT",
                    id: hotspot.id,
                  })
                }
                className="w-full text-left px-4 py-3 hover:bg-warm-50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="md:col-span-2">
                    <div className="font-medium text-sm text-warm-900">
                      {hotspot.label}
                    </div>

                    <div className="text-[10px] font-mono text-warm-400 mt-0.5">
                      {hotspot.zone}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-mono text-warm-400">
                      Risk
                    </div>

                    <div className="mt-1">
                      <StatusBadge
                        level={hotspot.risk}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-mono text-warm-400">
                      Depth
                    </div>

                    <div className="font-mono text-xs text-red-700 mt-1">
                      {hotspot.depthMin}–{hotspot.depthMax} cm
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-mono text-warm-400">
                      Onset
                    </div>

                    <div className="font-mono text-xs text-warm-700 mt-1">
                      {hotspot.onset} min
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-mono text-warm-400">
                      Confidence
                    </div>

                    <div className="font-mono text-xs text-warm-700 mt-1">
                      {hotspot.confidence}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-warm-50 border border-warm-200 rounded-sm px-4 py-3 mb-8">
        <div className="text-[10px] font-mono text-warm-500 uppercase tracking-wide mb-1">
          Forecast Narrative — {ts.label}
        </div>

        <p className="text-sm text-warm-800">
          {ts.explanation}
        </p>
      </div>

      {/* Rainfall chart */}
      <div className="bg-white border border-warm-200 rounded-sm mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            Rainfall Intensity Forecast
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            mm/hr · 0–3 hr nowcast
          </div>
        </div>

        <div className="p-4">
          <SVGBarChart
            values={data.timeSteps.map(
              (s) => s.rainfall
            )}
            labels={labels}
            color="#2563EB"
            unit=""
            maxVal={
              Math.ceil(maxRainfall / 20) * 20 + 20
            }
          />
        </div>
      </div>

      {/* Drainage utilization chart */}
      <div className="bg-white border border-warm-200 rounded-sm mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            Drainage Utilization
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            % of design capacity
          </div>
        </div>

        <div className="p-4">
          <SVGLineChart
            values={data.timeSteps.map(
              (s) => s.drainageUtil
            )}
            labels={labels}
            color="#D97706"
            maxVal={100}
            unit="%"
          />
        </div>
      </div>

      {/* Water depth progression */}
      <div className="bg-white border border-warm-200 rounded-sm mb-6">
        <div className="px-4 pt-4 pb-2 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            Predicted Water Depth
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            cm · hotspot average
          </div>
        </div>

        <div className="p-4">
          <SVGLineChart
            values={data.timeSteps.map(
              (s) => s.waterDepth
            )}
            labels={labels}
            color="#DC2626"
            maxVal={
              Math.ceil(maxDepth / 10) * 10 + 10
            }
            unit="cm"
          />
        </div>
      </div>

      {/* Timeline summary */}
      <div className="bg-white border border-warm-200 rounded-sm">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            Forecast Summary
          </div>

          <div className="text-[11px] text-warm-400 font-mono mt-0.5">
            Select any timestep to update the forecast view
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50">
                {[
                  "Time",
                  "Rainfall",
                  "Drainage",
                  "Water Depth",
                  "Risk",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-2.5 text-[11px] font-mono text-warm-500 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.timeSteps.map(
                (step, i) => (
                  <tr
                    key={i}
                    onClick={() =>
                      dispatch({
                        type: "SET_TIME_STEP",
                        step: i,
                      })
                    }
                    className={`border-b border-warm-50 cursor-pointer transition-colors ${
                      state.timeStep === i
                        ? "bg-maroon-50"
                        : "hover:bg-warm-50"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-warm-700 font-medium">
                      {step.label}
                    </td>

                    <td className="px-4 py-2.5 font-mono text-xs text-blue-700">
                      {step.rainfall} mm/hr
                    </td>

                    <td
                      className={`px-4 py-2.5 font-mono text-xs ${
                        step.drainageUtil >= 90
                          ? "text-red-700 font-medium"
                          : step.drainageUtil >= 75
                          ? "text-amber-700"
                          : "text-warm-700"
                      }`}
                    >
                      {step.drainageUtil}%
                    </td>

                    <td
                      className={`px-4 py-2.5 font-mono text-xs ${
                        step.waterDepth >= 20
                          ? "text-red-700 font-medium"
                          : step.waterDepth >= 8
                          ? "text-amber-700"
                          : "text-warm-700"
                      }`}
                    >
                      {step.waterDepth} cm
                    </td>

                    <td className="px-4 py-2.5">
                      <StatusBadge
                        level={step.riskLevel}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model footer */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-[10px] text-warm-400 font-mono">
        <span>
          Forecast confidence:{" "}
          {data.forecastConfidence}%
        </span>

        <span className="hidden md:inline">·</span>

        <span>
          Model: Drainage-Rainfall Coupled Nowcast
          v2.1
        </span>

        <span className="hidden md:inline">·</span>

        <span>Updated: 2 min ago</span>
      </div>
    </div>
  );
}