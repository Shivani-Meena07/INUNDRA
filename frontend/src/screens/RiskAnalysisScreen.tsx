import { useApp } from "../state/AppContext";
import { cityData, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  CloudRain,
  Mountain,
  Activity,
  Waves,
  ArrowDown,
  Gauge,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const riskBar: Record<
  RiskLevel,
  { width: string; color: string }
> = {
  CRITICAL: {
    width: "w-full",
    color: "bg-red-600",
  },
  HIGH: {
    width: "w-4/5",
    color: "bg-orange-500",
  },
  MODERATE: {
    width: "w-3/5",
    color: "bg-amber-500",
  },
  LOW: {
    width: "w-2/5",
    color: "bg-lime-500",
  },
  SAFE: {
    width: "w-1/5",
    color: "bg-green-500",
  },
};

const confBar: Record<string, string> = {
  High: "w-4/5 bg-green-500",
  Medium: "w-3/5 bg-amber-500",
  Low: "w-2/5 bg-red-400",
};

function getRiskBackground(level: RiskLevel) {
  switch (level) {
    case "CRITICAL":
      return "bg-red-50 border-red-200";
    case "HIGH":
      return "bg-orange-50 border-orange-200";
    case "MODERATE":
      return "bg-amber-50 border-amber-200";
    case "LOW":
      return "bg-lime-50 border-lime-200";
    case "SAFE":
      return "bg-green-50 border-green-200";
    default:
      return "bg-warm-50 border-warm-200";
  }
}

function getRiskText(level: RiskLevel) {
  switch (level) {
    case "CRITICAL":
      return "Severe flood conditions expected";
    case "HIGH":
      return "Significant flooding likely";
    case "MODERATE":
      return "Localized flooding possible";
    case "LOW":
      return "Limited flood impact expected";
    case "SAFE":
      return "No significant flood impact expected";
    default:
      return "Forecast condition available";
  }
}

function getTrend(
  current: number,
  previous: number | undefined
) {
  if (previous === undefined) {
    return {
      label: "Baseline",
      icon: Minus,
      color: "text-warm-400",
    };
  }

  if (current > previous) {
    return {
      label: "Increasing",
      icon: TrendingUp,
      color: "text-red-600",
    };
  }

  if (current < previous) {
    return {
      label: "Decreasing",
      icon: TrendingDown,
      color: "text-green-600",
    };
  }

  return {
    label: "Stable",
    icon: Minus,
    color: "text-warm-500",
  };
}

export default function RiskAnalysisScreen() {
  const { state, dispatch } = useApp();

  const data = cityData[state.city];
  const currentStep = data.timeSteps[state.timeStep];
  const previousStep =
    state.timeStep > 0
      ? data.timeSteps[state.timeStep - 1]
      : undefined;

  const overallRisk = data.alertLevel;

  const rainfallTrend = getTrend(
    currentStep.rainfall,
    previousStep?.rainfall
  );

  const drainageTrend = getTrend(
    currentStep.drainageUtil,
    previousStep?.drainageUtil
  );

  const depthTrend = getTrend(
    currentStep.waterDepth,
    previousStep?.waterDepth
  );

  const highestRiskFactor = [...data.riskFactors].sort(
    (a, b) => {
      const order: Record<RiskLevel, number> = {
        CRITICAL: 5,
        HIGH: 4,
        MODERATE: 3,
        LOW: 2,
        SAFE: 1,
      };

      return (
        order[b.severity] -
        order[a.severity]
      );
    }
  )[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-wider text-warm-500 mb-1">
          Causal flood intelligence
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-warm-900">
              Risk Analysis — {data.name}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              Why flooding is expected ·{" "}
              {currentStep.label}
            </p>
          </div>

          <div className="font-mono text-xs text-warm-400">
            Forecast confidence:{" "}
            <span className="font-bold text-warm-800">
              {data.forecastConfidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Overall risk */}
      <div
        className={`border px-4 py-4 mb-6 ${getRiskBackground(
          overallRisk
        )}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className={`shrink-0 mt-0.5 ${
                overallRisk === "CRITICAL"
                  ? "text-red-600"
                  : overallRisk === "HIGH"
                  ? "text-orange-600"
                  : "text-amber-600"
              }`}
            />

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-warm-900">
                  Overall Flood Risk
                </span>

                <StatusBadge
                  level={overallRisk}
                  size="md"
                />
              </div>

              <div className="text-sm font-medium text-warm-800">
                {getRiskText(overallRisk)}
              </div>

              <p className="text-xs text-warm-600 mt-1">
                {data.alertMessage}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-[9px] uppercase font-mono text-warm-500">
              Current timestep
            </div>

            <div className="text-lg font-bold font-mono text-warm-900">
              {currentStep.label}
            </div>
          </div>
        </div>
      </div>

      {/* Current risk drivers */}
      <div className="mb-8">
        <div className="mb-3">
          <div className="text-sm font-semibold text-warm-900">
            What is driving the risk now?
          </div>

          <div className="text-[11px] font-mono text-warm-400">
            Current conditions compared with the previous forecast step
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: CloudRain,
              label: "Rainfall",
              value: `${currentStep.rainfall} mm/hr`,
              trend: rainfallTrend,
            },
            {
              icon: Activity,
              label: "Drainage stress",
              value: `${currentStep.drainageUtil}%`,
              trend: drainageTrend,
            },
            {
              icon: Waves,
              label: "Water depth",
              value: `${currentStep.waterDepth} cm`,
              trend: depthTrend,
            },
          ].map(
            ({
              icon: Icon,
              label,
              value,
              trend,
            }) => {
              const TrendIcon = trend.icon;

              return (
                <div
                  key={label}
                  className="bg-white border border-warm-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={15}
                        className="text-warm-400"
                      />

                      <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                        {label}
                      </span>
                    </div>

                    <TrendIcon
                      size={14}
                      className={trend.color}
                    />
                  </div>

                  <div className="text-xl font-bold font-mono text-warm-900">
                    {value}
                  </div>

                  <div
                    className={`text-[10px] font-mono mt-1 ${trend.color}`}
                  >
                    {trend.label}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Risk factors */}
      <div className="bg-white border border-warm-200 mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            Contributing Risk Factors
          </div>

          <div className="text-[11px] text-warm-400 font-mono mt-0.5">
            Environmental and infrastructure conditions influencing the forecast
          </div>
        </div>

        <div className="divide-y divide-warm-50">
          {data.riskFactors.map((rf) => {
            const bar = riskBar[rf.severity];

            return (
              <div
                key={rf.id}
                className="px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-warm-900">
                        {rf.label}
                      </span>

                      <StatusBadge
                        level={rf.severity}
                      />
                    </div>

                    <div className="font-mono text-base font-bold text-warm-800">
                      {rf.value}
                    </div>
                  </div>

                  {highestRiskFactor?.id === rf.id && (
                    <span className="text-[9px] font-mono uppercase text-red-600 border border-red-200 bg-red-50 px-2 py-1">
                      Major driver
                    </span>
                  )}
                </div>

                <div className="h-1.5 bg-warm-100 mb-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${bar.width} ${bar.color}`}
                  />
                </div>

                <p className="text-xs text-warm-500 leading-relaxed">
                  {rf.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Causal mechanism */}
      <div className="bg-white border border-warm-200 mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            How the flood develops
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            Rainfall → runoff → drainage stress → surface accumulation
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {[
              {
                icon: CloudRain,
                number: "01",
                label: "Rainfall",
                value: `${currentStep.rainfall} mm/hr`,
                description:
                  "Incoming precipitation increases surface runoff.",
              },
              {
                icon: Mountain,
                number: "02",
                label: "Terrain",
                value: "Low-lying areas",
                description:
                  "Local topography concentrates runoff.",
              },
              {
                icon: Activity,
                number: "03",
                label: "Drainage",
                value: `${currentStep.drainageUtil}%`,
                description:
                  "Network capacity becomes increasingly constrained.",
              },
              {
                icon: ArrowDown,
                number: "04",
                label: "Accumulation",
                value: `${currentStep.waterDepth} cm`,
                description:
                  "Excess runoff begins accumulating on the surface.",
              },
              {
                icon: Waves,
                number: "05",
                label: "Inundation",
                value: overallRisk,
                description:
                  "Combined conditions produce the flood-risk level.",
              },
            ].map((item, i, arr) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="relative"
                >
                  <div className="border border-warm-200 bg-warm-50 p-3 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-mono text-warm-400">
                        {item.number}
                      </span>

                      <Icon
                        size={15}
                        className="text-warm-500"
                      />
                    </div>

                    <div className="text-xs font-semibold text-warm-900">
                      {item.label}
                    </div>

                    <div className="font-mono text-sm font-bold text-warm-800 mt-1">
                      {item.value}
                    </div>

                    <p className="text-[10px] text-warm-500 leading-relaxed mt-2">
                      {item.description}
                    </p>
                  </div>

                  {i < arr.length - 1 && (
                    <ArrowRight
                      size={13}
                      className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-warm-300 z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why this area is at risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-warm-200">
          <div className="px-4 py-3 border-b border-warm-100">
            <div className="text-sm font-semibold text-warm-900">
              Why This Area Is at Risk
            </div>
          </div>

          <div className="px-4 py-4">
            <p className="text-sm text-warm-700 leading-relaxed">
              {data.whyAtRisk}
            </p>
          </div>
        </div>

        {/* Immediate impact */}
        <div className="bg-white border border-warm-200">
          <div className="px-4 py-3 border-b border-warm-100">
            <div className="text-sm font-semibold text-warm-900">
              Expected Impact
            </div>
          </div>

          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-warm-500">
                Predicted water depth
              </span>

              <span className="font-mono text-sm font-bold text-red-700">
                {currentStep.waterDepth} cm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-warm-500">
                Drainage utilization
              </span>

              <span className="font-mono text-sm font-bold text-amber-700">
                {currentStep.drainageUtil}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-warm-500">
                Flood-risk level
              </span>

              <StatusBadge
                level={currentStep.riskLevel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Forecast confidence */}
      <div className="bg-white border border-warm-200 mb-6">
        <div className="px-4 py-3 border-b border-warm-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={15}
              className="text-warm-400"
            />

            <div>
              <div className="text-sm font-semibold text-warm-900">
                Forecast Confidence
              </div>

              <div className="text-[10px] font-mono text-warm-400">
                Confidence supporting this risk assessment
              </div>
            </div>
          </div>

          <div className="font-mono text-xl font-bold text-warm-800">
            {data.forecastConfidence}%
          </div>
        </div>

        <div className="p-4">
          <div className="h-2 bg-warm-100 overflow-hidden mb-4">
            <div
              className="h-full bg-maroon-700"
              style={{
                width: `${data.forecastConfidence}%`,
              }}
            />
          </div>

          <div className="divide-y divide-warm-50">
            {data.confidenceFactors.map(
              (cf) => (
                <div
                  key={cf.label}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={13}
                      className={
                        cf.level === "High"
                          ? "text-green-500"
                          : cf.level === "Medium"
                          ? "text-amber-500"
                          : "text-red-400"
                      }
                    />

                    <span className="text-xs text-warm-700">
                      {cf.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 bg-warm-100 overflow-hidden">
                      <div
                        className={`h-full ${confBar[cf.level]}`}
                      />
                    </div>

                    <span
                      className={`text-[11px] font-mono ${
                        cf.level === "High"
                          ? "text-green-700"
                          : cf.level === "Medium"
                          ? "text-amber-700"
                          : "text-red-600"
                      }`}
                    >
                      {cf.level}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-3 px-3 py-3 bg-warm-50 border border-warm-100">
            <p className="text-[11px] text-warm-500 leading-relaxed">
              Confidence reflects agreement between radar
              observation, terrain model accuracy, freshness
              of drainage telemetry, and corroborating citizen
              reports.
            </p>
          </div>
        </div>
      </div>

      {/* Action links */}
      <div className="border-t border-warm-200 pt-5">
        <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-3">
          Investigate further
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              dispatch({
                type: "SET_TAB",
                tab: "drainage",
              })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-maroon-700 border border-maroon-200 rounded-sm hover:bg-maroon-50 transition-colors"
          >
            <Gauge size={14} />
            Inspect Drainage Network
          </button>

          <button
            onClick={() =>
              dispatch({
                type: "SET_TAB",
                tab: "route",
              })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-maroon-700 rounded-sm hover:bg-maroon-800 transition-colors"
          >
            Find Safe Route
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}