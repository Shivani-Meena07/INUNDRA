import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import StatusBadge from "../../components/ui/StatusBadge";
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
  RefreshCw,
  Database,
  AlertCircle,
} from "lucide-react";
import {
  FloodStatusResponse,
  getFloodStatus,
  getLiveWeather,
  LiveWeatherResponse,
} from "../../data/api";

type UiRisk =
  | "CRITICAL"
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | "SAFE";

function normalizeRisk(value?: string | null): UiRisk {
  switch ((value ?? "").toLowerCase()) {
    case "critical":
      return "CRITICAL";
    case "high":
      return "HIGH";
    case "moderate":
    case "medium":
      return "MODERATE";
    case "low":
      return "LOW";
    case "safe":
      return "SAFE";
    default:
      return "LOW";
  }
}

const riskBar: Record<
  UiRisk,
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

function getRiskBackground(level: UiRisk) {
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

function getRiskText(level: UiRisk) {
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

function getRiskIconColor(level: UiRisk) {
  switch (level) {
    case "CRITICAL":
      return "text-red-600";
    case "HIGH":
      return "text-orange-600";
    case "MODERATE":
      return "text-amber-600";
    case "LOW":
      return "text-lime-600";
    case "SAFE":
      return "text-green-600";
    default:
      return "text-warm-500";
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

function formatPeakTime(value?: string | null) {
  if (!value) return "Not available";

  const parsed = new Date(value.replace(" ", "T"));

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getModelExplanation(
  floodStatus: FloodStatusResponse
) {
  const risk = normalizeRisk(floodStatus.overall_risk);
  const rainfall = floodStatus.forecast_rainfall_mm;
  const depth = floodStatus.peak_depth_m;

  if (risk === "CRITICAL") {
    return "The backend flood model indicates severe conditions. Immediate attention is required.";
  }

  if (risk === "HIGH") {
    return "The model indicates a significant flood threat based on forecast rainfall and drainage-system response.";
  }

  if (risk === "MODERATE") {
    return "The model indicates that localized flooding may occur if rainfall continues and drainage capacity becomes constrained.";
  }

  if (risk === "SAFE") {
    return "Current model conditions do not indicate significant flood impact.";
  }

  if (
    typeof rainfall === "number" &&
    typeof depth === "number"
  ) {
    return `Current model output indicates limited flood impact, with approximately ${rainfall.toFixed(
      1
    )} mm forecast rainfall and a peak simulated depth of ${(
      depth * 100
    ).toFixed(1)} cm.`;
  }

  return "Current model conditions indicate limited flood impact.";
}

export default function RiskAnalysisScreen() {
  const { state, dispatch } = useApp();

  const [floodStatus, setFloodStatus] =
    useState<FloodStatusResponse | null>(null);

  const [weather, setWeather] =
    useState<LiveWeatherResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [flood, liveWeather] =
        await Promise.all([
          getFloodStatus({
            includeAiSummary: false,
          }),
          getLiveWeather(),
        ]);

      setFloodStatus(flood);
      setWeather(liveWeather);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Risk analysis API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load flood risk data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = window.setInterval(
      loadData,
      5 * 60 * 1000
    );

    return () => window.clearInterval(interval);
  }, [loadData]);

  const overallRisk = normalizeRisk(
    floodStatus?.overall_risk
  );

  const rainfall =
    weather?.weather?.precipitation ??
    null;

  const rainfallForecast =
    floodStatus?.forecast_rainfall_mm ??
    null;

  const peakDepthCm =
    typeof floodStatus?.peak_depth_m === "number"
      ? floodStatus.peak_depth_m * 100
      : null;

  const confidence =
    typeof floodStatus?.confidence === "number"
      ? Math.round(
          floodStatus.confidence <= 1
            ? floodStatus.confidence * 100
            : floodStatus.confidence
        )
      : null;

  const nodeCount =
    floodStatus?.nodes?.length ?? 0;

  const floodedNodes =
    floodStatus?.flooded_nodes ?? [];

  const criticalNodes =
    floodStatus?.critical_nodes ?? [];

  const highestRiskNode = useMemo(() => {
    if (!floodStatus?.nodes?.length) {
      return null;
    }

    return [...floodStatus.nodes].sort(
      (a, b) =>
        b.max_depth_m - a.max_depth_m
    )[0];
  }, [floodStatus]);

  const currentForecastRainfall =
    floodStatus?.forecast?.[0]?.rainfall_mm ??
    weather?.forecast?.[0]?.rainfall_mm ??
    null;

  const nextForecastRainfall =
    floodStatus?.forecast?.[1]?.rainfall_mm ??
    weather?.forecast?.[1]?.rainfall_mm ??
    undefined;

  const rainfallTrend =
    typeof currentForecastRainfall === "number"
      ? getTrend(
          currentForecastRainfall,
          nextForecastRainfall
        )
      : {
          label: "Unavailable",
          icon: Minus,
          color: "text-warm-400",
        };

  const modelExplanation =
    floodStatus
      ? getModelExplanation(floodStatus)
      : "Loading current backend flood-model assessment.";

  const cityLabel = state.city;

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
              Risk Analysis — {cityLabel}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              Why flooding is expected · backend model assessment
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && !loading && (
              <div className="font-mono text-[10px] text-warm-400">
                Updated{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-warm-700 border border-warm-200 bg-white hover:bg-warm-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && !floodStatus && (
        <div className="border border-warm-200 bg-white px-4 py-4 mb-6 flex items-center gap-3">
          <RefreshCw
            size={16}
            className="animate-spin text-maroon-700"
          />

          <div>
            <div className="text-sm font-medium text-warm-800">
              Loading flood model
            </div>

            <div className="text-[11px] font-mono text-warm-400 mt-0.5">
              Fetching current rainfall and drainage-model output
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-4 mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="text-red-600 mt-0.5 shrink-0"
            />

            <div>
              <div className="text-sm font-semibold text-red-900">
                Risk data unavailable
              </div>

              <div className="text-xs text-red-700 mt-1">
                {error}
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="shrink-0 text-xs font-medium text-red-700 border border-red-200 bg-white px-3 py-2 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overall risk */}
      {floodStatus && (
        <div
          className={`border px-4 py-4 mb-6 ${getRiskBackground(
            overallRisk
          )}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className={`shrink-0 mt-0.5 ${getRiskIconColor(
                  overallRisk
                )}`}
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

                <p className="text-xs text-warm-600 mt-1 max-w-2xl">
                  {modelExplanation}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0">
              <div className="text-[9px] uppercase font-mono text-warm-500">
                Forecast horizon
              </div>

              <div className="text-lg font-bold font-mono text-warm-900">
                {floodStatus.forecast_hours ??
                  "—"}{" "}
                hr
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current risk drivers */}
      <div className="mb-8">
        <div className="mb-3">
          <div className="text-sm font-semibold text-warm-900">
            What is driving the risk now?
          </div>

          <div className="text-[11px] font-mono text-warm-400">
            Live weather and flood-model indicators
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Rainfall */}
          <div className="bg-white border border-warm-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CloudRain
                  size={15}
                  className="text-warm-400"
                />

                <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Rainfall
                </span>
              </div>

              {(() => {
                const TrendIcon =
                  rainfallTrend.icon;

                return (
                  <TrendIcon
                    size={14}
                    className={
                      rainfallTrend.color
                    }
                  />
                );
              })()}
            </div>

            <div className="text-xl font-bold font-mono text-warm-900">
              {typeof rainfall === "number"
                ? `${rainfall.toFixed(1)} mm`
                : "—"}
            </div>

            <div className="text-[10px] font-mono mt-1 text-warm-400">
              {rainfall !== null
                ? "Current precipitation"
                : "Unavailable"}
            </div>
          </div>

          {/* Forecast rainfall */}
          <div className="bg-white border border-warm-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity
                  size={15}
                  className="text-warm-400"
                />

                <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Forecast rainfall
                </span>
              </div>

              <Database
                size={13}
                className="text-warm-300"
              />
            </div>

            <div className="text-xl font-bold font-mono text-warm-900">
              {rainfallForecast !== null
                ? `${rainfallForecast.toFixed(1)} mm`
                : "—"}
            </div>

            <div className="text-[10px] font-mono mt-1 text-warm-400">
              Backend flood-model input
            </div>
          </div>

          {/* Water depth */}
          <div className="bg-white border border-warm-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Waves
                  size={15}
                  className="text-warm-400"
                />

                <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Peak water depth
                </span>
              </div>

              <Minus
                size={14}
                className="text-warm-400"
              />
            </div>

            <div className="text-xl font-bold font-mono text-warm-900">
              {peakDepthCm !== null
                ? `${peakDepthCm.toFixed(1)} cm`
                : "—"}
            </div>

            <div className="text-[10px] font-mono mt-1 text-warm-400">
              Simulated model peak
            </div>
          </div>
        </div>
      </div>

      {/* Model output */}
      {floodStatus && (
        <div className="bg-white border border-warm-200 mb-6">
          <div className="px-4 py-3 border-b border-warm-100">
            <div className="flex items-center gap-2">
              <Database
                size={15}
                className="text-warm-400"
              />

              <div>
                <div className="text-sm font-semibold text-warm-900">
                  Backend Flood Model Output
                </div>

                <div className="text-[11px] text-warm-400 font-mono mt-0.5">
                  Current drainage-network simulation
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-warm-100">
            <div className="p-4">
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Confidence
              </div>

              <div className="text-lg font-bold font-mono text-warm-900 mt-1">
                {confidence !== null
                  ? `${confidence}%`
                  : "—"}
              </div>
            </div>

            <div className="p-4">
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Model nodes
              </div>

              <div className="text-lg font-bold font-mono text-warm-900 mt-1">
                {nodeCount}
              </div>
            </div>

            <div className="p-4">
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Flooded nodes
              </div>

              <div className="text-lg font-bold font-mono text-warm-900 mt-1">
                {floodedNodes.length}
              </div>
            </div>

            <div className="p-4">
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Peak time
              </div>

              <div className="text-sm font-bold font-mono text-warm-900 mt-1">
                {formatPeakTime(
                  floodStatus.time_to_peak
                )}
              </div>
            </div>
          </div>

          {/* Critical nodes */}
          {(criticalNodes.length > 0 ||
            floodedNodes.length > 0) && (
            <div className="border-t border-warm-100 px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] uppercase font-mono text-warm-400 mb-2">
                    Critical nodes
                  </div>

                  {criticalNodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {criticalNodes.map(
                        (node) => (
                          <span
                            key={node}
                            className="text-[10px] font-mono px-2 py-1 border border-amber-200 bg-amber-50 text-amber-800"
                          >
                            Node {node}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-warm-400">
                      None reported
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[9px] uppercase font-mono text-warm-400 mb-2">
                    Flooded nodes
                  </div>

                  {floodedNodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {floodedNodes.map(
                        (node) => (
                          <span
                            key={node}
                            className="text-[10px] font-mono px-2 py-1 border border-red-200 bg-red-50 text-red-700"
                          >
                            Node {node}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-warm-400">
                      No flooded nodes reported
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Highest simulated node */}
      {highestRiskNode && (
        <div className="bg-white border border-warm-200 mb-6">
          <div className="px-4 py-3 border-b border-warm-100">
            <div className="text-sm font-semibold text-warm-900">
              Highest Simulated Node Depth
            </div>

            <div className="text-[11px] text-warm-400 font-mono mt-0.5">
              Direct output from the drainage model
            </div>
          </div>

          <div className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Node
              </div>

              <div className="text-lg font-bold font-mono text-warm-900">
                {highestRiskNode.node}
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Maximum depth
              </div>

              <div className="text-lg font-bold font-mono text-warm-900">
                {(
                  highestRiskNode.max_depth_m *
                  100
                ).toFixed(1)}{" "}
                cm
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Model risk
              </div>

              <StatusBadge
                level={normalizeRisk(
                  highestRiskNode.risk
                )}
              />
            </div>

            <div>
              <div className="text-[9px] uppercase font-mono text-warm-400">
                Flooding
              </div>

              <div
                className={`text-xs font-semibold ${
                  highestRiskNode.flooding
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {highestRiskNode.flooding
                  ? "Detected"
                  : "Not detected"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Causal mechanism */}
      <div className="bg-white border border-warm-200 mb-6">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="text-sm font-semibold text-warm-900">
            How the flood develops
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            Rainfall → runoff → drainage response → surface accumulation
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {[
              {
                icon: CloudRain,
                number: "01",
                label: "Rainfall",
                value:
                  rainfallForecast !== null
                    ? `${rainfallForecast.toFixed(
                        1
                      )} mm`
                    : "—",
                description:
                  "Forecast precipitation enters the flood model.",
              },
              {
                icon: Mountain,
                number: "02",
                label: "Terrain",
                value: "Surface routing",
                description:
                  "Terrain determines how runoff can accumulate and move.",
              },
              {
                icon: Activity,
                number: "03",
                label: "Drainage",
                value:
                  nodeCount > 0
                    ? `${nodeCount} nodes`
                    : "—",
                description:
                  "The drainage network is simulated as connected model nodes.",
              },
              {
                icon: ArrowDown,
                number: "04",
                label: "Accumulation",
                value:
                  peakDepthCm !== null
                    ? `${peakDepthCm.toFixed(
                        1
                      )} cm`
                    : "—",
                description:
                  "Modelled water depth indicates potential surface accumulation.",
              },
              {
                icon: Waves,
                number: "05",
                label: "Inundation",
                value: overallRisk,
                description:
                  "The combined model output produces the current flood-risk level.",
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
              {modelExplanation}
            </p>

            {floodStatus?.reason && (
              <div className="mt-3 px-3 py-3 bg-warm-50 border border-warm-100">
                <div className="text-[9px] uppercase font-mono text-warm-400 mb-1">
                  Model note
                </div>

                <p className="text-xs text-warm-600">
                  {floodStatus.reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expected impact */}
        <div className="bg-white border border-warm-200">
          <div className="px-4 py-3 border-b border-warm-100">
            <div className="text-sm font-semibold text-warm-900">
              Expected Impact
            </div>
          </div>

          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-warm-500">
                Predicted peak depth
              </span>

              <span className="font-mono text-sm font-bold text-warm-800">
                {peakDepthCm !== null
                  ? `${peakDepthCm.toFixed(
                      1
                    )} cm`
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-warm-500">
                Flooded drainage nodes
              </span>

              <span className="font-mono text-sm font-bold text-warm-800">
                {floodedNodes.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-warm-500">
                Flood-risk level
              </span>

              <StatusBadge
                level={overallRisk}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-warm-500">
                Model peak
              </span>

              <span className="font-mono text-xs font-bold text-warm-800">
                {formatPeakTime(
                  floodStatus?.time_to_peak
                )}
              </span>
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
                Confidence returned by the backend flood model
              </div>
            </div>
          </div>

          <div className="font-mono text-xl font-bold text-warm-800">
            {confidence !== null
              ? `${confidence}%`
              : "—"}
          </div>
        </div>

        <div className="p-4">
          {confidence !== null && (
            <div className="h-2 bg-warm-100 overflow-hidden mb-4">
              <div
                className="h-full bg-maroon-700 transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(confidence, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          )}

          <div className="divide-y divide-warm-50">
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={13}
                  className="text-green-500"
                />

                <span className="text-xs text-warm-700">
                  Live rainfall input
                </span>
              </div>

              <span className="text-[11px] font-mono text-green-700">
                Connected
              </span>
            </div>

            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={13}
                  className="text-green-500"
                />

                <span className="text-xs text-warm-700">
                  Drainage simulation
                </span>
              </div>

              <span className="text-[11px] font-mono text-green-700">
                {nodeCount > 0
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={13}
                  className="text-green-500"
                />

                <span className="text-xs text-warm-700">
                  Model confidence
                </span>
              </div>

              <span className="text-[11px] font-mono text-warm-700">
                {confidence !== null
                  ? `${confidence}% returned`
                  : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="mt-3 px-3 py-3 bg-warm-50 border border-warm-100">
            <p className="text-[11px] text-warm-500 leading-relaxed">
              This confidence value is the backend model output.
              It should not be interpreted as a formal probability
              of flooding.
            </p>
          </div>
        </div>
      </div>

      {/* Prototype / data note */}
      <div className="border border-warm-200 bg-warm-50 px-4 py-3 mb-6">
        <div className="flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-warm-500 mt-0.5 shrink-0"
          />

          <p className="text-[11px] text-warm-500 leading-relaxed">
            Risk values, rainfall inputs, simulated depths and
            drainage-node outputs shown above come from the current
            backend prototype. The drainage network is a demonstration
            model and should not be treated as surveyed municipal
            infrastructure.
          </p>
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