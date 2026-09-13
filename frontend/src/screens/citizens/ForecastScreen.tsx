import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  getFloodStatus,
  getLiveWeather,
  FloodStatusResponse,
  LiveWeatherResponse,
} from "../../data/api";
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
  RefreshCw,
  Database,
} from "lucide-react";

type UiRisk =
  | "CRITICAL"
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | "SAFE";

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

  if (!values.length) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-warm-400 font-mono">
        No forecast data available
      </div>
    );
  }

  const safeMax = Math.max(maxVal, 1);

  const barW =
    (w - padL - 20) / values.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
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
              {Math.round(f * safeMax)}
            </text>
          </g>
        );
      })}

      {values.map((v, i) => {
        const barH =
          (Math.max(v, 0) / safeMax) *
          (h - padT - padB);

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
              width={Math.max(barW, 4)}
              height={Math.max(barH, 1)}
              fill={color}
              rx="2"
              opacity="0.85"
            />

            <text
              x={x + Math.max(barW, 4) / 2}
              y={h - padB + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#6B6560"
              fontFamily="DM Mono, monospace"
            >
              {labels[i]}
            </text>

            <text
              x={x + Math.max(barW, 4) / 2}
              y={Math.max(y - 4, 10)}
              textAnchor="middle"
              fontSize="9"
              fill="#4A4540"
              fontFamily="DM Mono, monospace"
              fontWeight="500"
            >
              {v.toFixed(1)}
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

  if (!values.length) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-warm-400 font-mono">
        No forecast data available
      </div>
    );
  }

  const safeMax = Math.max(maxVal, 1);

  const step =
    values.length > 1
      ? (w - padL - 20) / (values.length - 1)
      : 0;

  const points = values
    .map((v, i) => {
      const x = padL + 10 + i * step;

      const y =
        padT +
        (1 - Math.max(v, 0) / safeMax) *
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
        (1 - Math.max(v, 0) / safeMax) *
          (h - padT - padB);

      return `${x},${y}`;
    }),
    `${
      padL +
      10 +
      (values.length - 1) * step
    },${h - padB}`,
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
              {Math.round(f * safeMax)}
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
          (1 - Math.max(v, 0) / safeMax) *
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

function getRiskDescription(level: string) {
  switch (level.toUpperCase()) {
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
      return "Forecast status available";
  }
}

function getRiskAccent(level: string) {
  switch (level.toUpperCase()) {
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

function normalizeRisk(
  value?: string | null
): UiRisk {
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

function formatForecastLabel(time: string) {
  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPeakTime(
  time?: string | null
) {
  if (!time) {
    return "Unavailable";
  }

  const date = new Date(
    time.replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function getModelRiskExplanation(
  floodStatus: FloodStatusResponse
) {
  const risk = normalizeRisk(
    floodStatus.overall_risk
  );

  if (risk === "CRITICAL") {
    return "The current flood model indicates critical conditions. Review critical and flooded nodes immediately.";
  }

  if (risk === "HIGH") {
    return "The current flood model indicates significant flood risk within the forecast window.";
  }

  if (risk === "MODERATE") {
    return "The current flood model indicates a possibility of localized waterlogging.";
  }

  if (risk === "LOW") {
    return "The current flood model indicates limited flood impact under the available rainfall and drainage conditions.";
  }

  return "The current flood model does not indicate significant flooding under the available forecast conditions.";
}

export default function ForecastScreen() {
  const { state } = useApp();

  const [weather, setWeather] =
    useState<LiveWeatherResponse | null>(
      null
    );

  const [floodStatus, setFloodStatus] =
    useState<FloodStatusResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const [selectedForecastIndex, setSelectedForecastIndex] =
    useState(0);

  async function loadForecast() {
    try {
      setLoading(true);
      setError(null);

      const [
        weatherResponse,
        floodResponse,
      ] = await Promise.all([
        getLiveWeather(),
        getFloodStatus({
          includeAiSummary: false,
        }),
      ]);

      setWeather(weatherResponse);
      setFloodStatus(floodResponse);
      setLastUpdated(new Date());
      setSelectedForecastIndex(0);
    } catch (err) {
      console.error(
        "Failed to load forecast data:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load forecast data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecast();

    const interval = window.setInterval(
      loadForecast,
      5 * 60 * 1000
    );

    return () =>
      window.clearInterval(interval);
  }, []);

  const rainfallForecast =
    weather?.forecast ?? [];

  const selectedForecast =
    rainfallForecast[
      selectedForecastIndex
    ] ?? null;

  const riskLevel = normalizeRisk(
    floodStatus?.overall_risk
  );

  const confidence =
    typeof floodStatus?.confidence ===
    "number"
      ? Math.round(
          floodStatus.confidence * 100
        )
      : null;

  const peakDepthCm =
    typeof floodStatus?.peak_depth_m ===
    "number"
      ? floodStatus.peak_depth_m * 100
      : null;

  const maxRainfall = useMemo(() => {
    if (!rainfallForecast.length) {
      return 1;
    }

    return Math.max(
      ...rainfallForecast.map(
        (point) => point.rainfall_mm
      ),
      1
    );
  }, [rainfallForecast]);

  const rainfallLabels =
    rainfallForecast.map((point) =>
      formatForecastLabel(point.time)
    );

  const rainfallValues =
    rainfallForecast.map(
      (point) => point.rainfall_mm
    );

  const selectedRainfallRate =
    selectedForecast?.rainfall_rate_mm_hr ??
    null;

  const selectedRainfall =
    selectedForecast?.rainfall_mm ?? null;

  const criticalNodes =
    floodStatus?.critical_nodes ?? [];

  const floodedNodes =
    floodStatus?.flooded_nodes ?? [];

  const modelNodes =
    floodStatus?.nodes ?? [];

  const isFlooding =
    floodedNodes.length > 0;

  const hasForecast =
    rainfallForecast.length > 0;

  const updatedText = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  loading
                    ? "bg-amber-500"
                    : error
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              />

              <span className="text-[10px] font-mono uppercase tracking-wider text-warm-500">
                {loading
                  ? "Updating nowcast"
                  : error
                  ? "Backend unavailable"
                  : "Live nowcast"}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-warm-900">
              Flood Forecast —{" "}
              {state.city}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              Rainfall and drainage-coupled
              flood intelligence
              {lastUpdated
                ? ` · Updated ${updatedText}`
                : ""}
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-[10px] uppercase tracking-wide font-mono text-warm-400">
              Forecast confidence
            </div>

            <div className="text-xl font-bold font-mono text-warm-900">
              {confidence !== null
                ? `${confidence}%`
                : "—"}
            </div>
          </div>

        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 mb-6">
          <div className="flex items-start gap-3">

            <AlertTriangle
              size={17}
              className="text-red-700 mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <div className="text-sm font-semibold text-red-900">
                Forecast backend could not be reached
              </div>

              <div className="text-xs text-red-800 mt-1">
                {error}
              </div>

              <button
                onClick={loadForecast}
                className="mt-3 inline-flex items-center gap-2 border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50"
              >
                <RefreshCw size={12} />
                Retry
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Forecast status banner */}
      <div
        className={`border px-4 py-4 mb-6 ${getRiskAccent(
          riskLevel
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
                  Model status
                </span>

                <StatusBadge
                  level={riskLevel}
                  size="md"
                />

              </div>

              <div className="font-semibold text-warm-900 mt-1">
                {loading
                  ? "Loading current flood model..."
                  : floodStatus
                  ? getRiskDescription(
                      riskLevel
                    )
                  : "Forecast status unavailable"}
              </div>

              <p className="text-xs text-warm-600 mt-1 max-w-2xl">
                {floodStatus
                  ? getModelRiskExplanation(
                      floodStatus
                    )
                  : "Connect the backend to view the current rainfall and flood-model assessment."}
              </p>

            </div>
          </div>

          {isFlooding && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-700 shrink-0">
              <TrendingUp size={14} />
              Flooded nodes detected
            </div>
          )}

        </div>
      </div>

      {/* Backend source indicator */}
      <div className="flex items-center justify-between gap-3 mb-6 border border-warm-200 bg-white px-4 py-3">

        <div className="flex items-center gap-2">

          <Database
            size={14}
            className="text-warm-500"
          />

          <div>

            <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Data source
            </div>

            <div className="text-xs text-warm-700 mt-0.5">
              Live backend weather + flood model
            </div>

          </div>
        </div>

        <button
          onClick={loadForecast}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-warm-200 px-3 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </button>

      </div>

      {/* Time selector */}
      <div className="mb-6">

        <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500 mb-2">
          Rainfall forecast timeline
        </div>

        <div className="flex overflow-x-auto border border-warm-200 rounded-sm bg-white">

          {hasForecast ? (
            rainfallForecast.map(
              (point, i) => (
                <button
                  key={`${point.time}-${i}`}
                  onClick={() =>
                    setSelectedForecastIndex(
                      i
                    )
                  }
                  className={`flex-1 min-w-28 px-4 py-3 text-left border-r border-warm-200 last:border-r-0 transition-colors ${
                    selectedForecastIndex ===
                    i
                      ? "bg-maroon-700 text-white"
                      : "text-warm-600 hover:bg-warm-50"
                  }`}
                >

                  <div className="text-[10px] font-mono opacity-80">
                    {formatForecastLabel(
                      point.time
                    )}
                  </div>

                  <div className="font-bold font-mono text-sm mt-1">
                    {point.rainfall_rate_mm_hr.toFixed(
                      1
                    )}{" "}
                    mm/hr
                  </div>

                  <div
                    className={`text-[10px] font-medium mt-1 ${
                      selectedForecastIndex ===
                      i
                        ? "text-white"
                        : "text-blue-700"
                    }`}
                  >
                    {point.rainfall_mm.toFixed(
                      1
                    )}{" "}
                    mm
                  </div>

                </button>
              )
            )
          ) : (
            <div className="px-4 py-4 text-xs text-warm-400 font-mono">
              Rainfall forecast unavailable
            </div>
          )}

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
              Current backend model inputs and outputs
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

          {[
            {
              icon: CloudRain,
              label: "Rainfall",
              value:
                selectedRainfallRate !==
                null
                  ? `${selectedRainfallRate.toFixed(
                      1
                    )} mm/hr`
                  : "—",
              note: "Forecast rainfall rate",
            },
            {
              icon: Activity,
              label: "Drainage",
              value: "—",
              note: "Utilization not provided by API",
            },
            {
              icon: Waves,
              label: "Water depth",
              value:
                peakDepthCm !== null
                  ? `${peakDepthCm.toFixed(
                      1
                    )} cm`
                  : "—",
              note: "Model peak depth",
            },
            {
              icon: AlertTriangle,
              label: "Risk",
              value: floodStatus
                ? riskLevel
                : "—",
              note: "Current model risk",
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
          Selected rainfall forecast
          {selectedForecast
            ? ` — ${formatForecastLabel(
                selectedForecast.time
              )}`
            : ""}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[
            {
              icon: CloudRain,
              label: "Rainfall Rate",
              value:
                selectedRainfallRate !==
                null
                  ? selectedRainfallRate.toFixed(
                      1
                    )
                  : "—",
              unit: "mm/hr",
              color:
                "text-blue-700",
            },
            {
              icon: CloudRain,
              label: "Rainfall Amount",
              value:
                selectedRainfall !== null
                  ? selectedRainfall.toFixed(
                      1
                    )
                  : "—",
              unit: "mm",
              color:
                "text-blue-700",
            },
            {
              icon: Waves,
              label: "Peak Water Depth",
              value:
                peakDepthCm !== null
                  ? peakDepthCm.toFixed(1)
                  : "—",
              unit: "cm",
              color:
                peakDepthCm !== null &&
                peakDepthCm >= 20
                  ? "text-red-700"
                  : peakDepthCm !== null &&
                    peakDepthCm >= 8
                  ? "text-amber-700"
                  : "text-warm-800",
            },
            {
              icon: Clock,
              label: "Flood Risk Level",
              value: floodStatus
                ? riskLevel
                : "—",
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

                {unit === "" &&
                value !== "—" ? (
                  <StatusBadge
                    level={value}
                    size="md"
                  />
                ) : (
                  <div
                    className={`text-2xl font-bold font-mono ${color}`}
                  >
                    {value}

                    {unit && (
                      <span className="text-sm font-normal text-warm-400 ml-1">
                        {unit}
                      </span>
                    )}
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

            <Clock
              size={15}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Model peak time
            </span>

          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {formatPeakTime(
              floodStatus?.time_to_peak
            )}
          </div>

          <div className="text-xs text-warm-500 mt-1">
            Backend-provided forecast timestamp
          </div>

        </div>

        <div className="bg-white border border-warm-200 p-4">

          <div className="flex items-center gap-2 mb-3">

            <Waves
              size={15}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Peak predicted depth
            </span>

          </div>

          <div className="text-2xl font-bold font-mono text-red-700">

            {peakDepthCm !== null
              ? peakDepthCm.toFixed(1)
              : "—"}

            {peakDepthCm !== null && (
              <span className="text-sm font-normal text-warm-400 ml-1">
                cm
              </span>
            )}

          </div>

          <div className="text-xs text-warm-500 mt-1">
            Maximum depth reported by flood model
          </div>

        </div>

        <div className="bg-white border border-warm-200 p-4">

          <div className="flex items-center gap-2 mb-3">

            <Gauge
              size={15}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Drainage utilization
            </span>

          </div>

          <div className="text-2xl font-bold font-mono text-warm-700">
            —
          </div>

          <div className="text-xs text-warm-500 mt-1">
            Not currently exposed by backend API
          </div>

        </div>

      </div>

      {/* Model explanation + confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

        <div className="bg-warm-50 border border-warm-200 p-4">

          <div className="flex items-center gap-2 mb-2">

            <AlertTriangle
              size={15}
              className="text-warm-500"
            />

            <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Why this forecast
            </div>

          </div>

          <p className="text-sm text-warm-800 leading-relaxed">

            {floodStatus
              ? getModelRiskExplanation(
                  floodStatus
                )
              : "The backend flood model explanation is unavailable."}

          </p>

          {floodStatus?.reason && (
            <p className="text-xs text-warm-500 mt-3">
              Model reason:{" "}
              {floodStatus.reason}
            </p>
          )}

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
              {confidence !== null
                ? `${confidence}%`
                : "—"}
            </div>

            <span className="text-[10px] font-mono text-warm-400">
              Backend model confidence
            </span>

          </div>

          <div className="h-2 bg-warm-100 overflow-hidden mb-4">

            <div
              className="h-full bg-maroon-700 transition-all"
              style={{
                width: `${
                  confidence ?? 0
                }%`,
              }}
            />

          </div>

          <div className="space-y-2 text-xs">

            <div className="flex items-center justify-between">

              <span className="text-warm-600">
                Weather forecast
              </span>

              <span className="font-mono text-warm-700">
                Available
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-warm-600">
                Drainage model
              </span>

              <span className="font-mono text-warm-700">
                {floodStatus
                  ? "Available"
                  : "Unavailable"}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-warm-600">
                Confidence source
              </span>

              <span className="font-mono text-warm-700">
                Backend
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Critical / flooded nodes */}
      <div className="bg-white border border-warm-200 mb-8">

        <div className="px-4 py-3 border-b border-warm-100">

          <div className="flex items-center justify-between">

            <div>

              <div className="text-sm font-semibold text-warm-900">
                Model priority nodes
              </div>

              <div className="text-[11px] text-warm-400 font-mono">
                Drainage nodes returned by the flood model
              </div>

            </div>

            <MapPin
              size={15}
              className="text-warm-400"
            />

          </div>

        </div>

        <div className="p-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="border border-warm-200 p-4">

              <div className="text-[9px] uppercase font-mono text-warm-400">
                Critical nodes
              </div>

              {criticalNodes.length >
              0 ? (
                <div className="flex flex-wrap gap-2 mt-2">

                  {criticalNodes.map(
                    (node) => (
                      <span
                        key={node}
                        className="inline-flex items-center border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-mono text-amber-800"
                      >
                        Node {node}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <div className="text-sm text-warm-400 mt-2">
                  No critical nodes reported
                </div>
              )}

            </div>

            <div className="border border-warm-200 p-4">

              <div className="text-[9px] uppercase font-mono text-warm-400">
                Flooded nodes
              </div>

              {floodedNodes.length >
              0 ? (
                <div className="flex flex-wrap gap-2 mt-2">

                  {floodedNodes.map(
                    (node) => (
                      <span
                        key={node}
                        className="inline-flex items-center border border-red-200 bg-red-50 px-2 py-1 text-xs font-mono text-red-800"
                      >
                        Node {node}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <div className="text-sm text-warm-400 mt-2">
                  No flooded nodes reported
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* Node-level model results */}
      <div className="bg-white border border-warm-200 mb-8">

        <div className="px-4 py-3 border-b border-warm-100">

          <div className="text-sm font-semibold text-warm-900">
            Node-level flood model
          </div>

          <div className="text-[11px] text-warm-400 font-mono mt-0.5">
            Hydraulic model results returned by the backend
          </div>

        </div>

        {modelNodes.length > 0 ? (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-warm-100 bg-warm-50">

                  {[
                    "Node",
                    "Maximum Depth",
                    "Risk",
                    "Flooding",
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

                {modelNodes.map(
                  (node) => (
                    <tr
                      key={node.node}
                      className="border-b border-warm-50"
                    >

                      <td className="px-4 py-2.5 font-mono text-xs text-warm-700 font-medium">
                        {node.node}
                      </td>

                      <td
                        className={`px-4 py-2.5 font-mono text-xs ${
                          node.max_depth_m *
                            100 >=
                          20
                            ? "text-red-700 font-medium"
                            : node.max_depth_m *
                                100 >=
                              8
                            ? "text-amber-700"
                            : "text-warm-700"
                        }`}
                      >
                        {(
                          node.max_depth_m *
                          100
                        ).toFixed(1)}{" "}
                        cm
                      </td>

                      <td className="px-4 py-2.5">

                        <StatusBadge
                          level={normalizeRisk(
                            node.risk
                          )}
                        />

                      </td>

                      <td className="px-4 py-2.5">

                        <span
                          className={`text-xs font-mono ${
                            node.flooding
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {node.flooding
                            ? "Yes"
                            : "No"}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="p-4 text-xs text-warm-400 font-mono">
            No node-level model results available.
          </div>
        )}

      </div>

      {/* Rainfall chart */}
      <div className="bg-white border border-warm-200 rounded-sm mb-6">

        <div className="px-4 pt-4 pb-2 border-b border-warm-100">

          <div className="text-sm font-semibold text-warm-900">
            Rainfall Forecast
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            Forecast precipitation · backend weather service
          </div>

        </div>

        <div className="p-4">

          {hasForecast ? (
            <SVGBarChart
              values={rainfallValues}
              labels={rainfallLabels}
              color="#2563EB"
              unit=""
              maxVal={
                Math.ceil(
                  maxRainfall
                ) + 1
              }
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-warm-400 font-mono">
              Rainfall forecast unavailable
            </div>
          )}

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

          <div className="h-32 flex items-center justify-center border border-dashed border-warm-200 bg-warm-50">

            <div className="text-center">

              <Activity
                size={18}
                className="mx-auto text-warm-400 mb-2"
              />

              <div className="text-xs font-medium text-warm-600">
                Not available from current API
              </div>

              <div className="text-[10px] font-mono text-warm-400 mt-1">
                Per-timestep drainage utilization is not currently exposed
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Water depth progression */}
      <div className="bg-white border border-warm-200 rounded-sm mb-6">

        <div className="px-4 pt-4 pb-2 border-b border-warm-100">

          <div className="text-sm font-semibold text-warm-900">
            Predicted Water Depth
          </div>

          <div className="text-[11px] text-warm-400 font-mono">
            cm · backend peak depth
          </div>

        </div>

        <div className="p-4">

          {peakDepthCm !== null ? (
            <SVGLineChart
              values={[
                0,
                peakDepthCm,
              ]}
              labels={[
                "Start",
                "Peak",
              ]}
              color="#DC2626"
              maxVal={Math.max(
                peakDepthCm,
                1
              )}
              unit="cm"
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-warm-400 font-mono">
              Peak depth unavailable
            </div>
          )}

        </div>

        <div className="px-4 pb-4">

          <div className="border border-warm-200 bg-warm-50 p-3 text-xs text-warm-600">
            The current API provides peak water depth, but does not yet provide
            a per-timestep water-depth series. The chart therefore shows only
            the available start-to-peak model information.
          </div>

        </div>

      </div>

      {/* Timeline summary */}
      <div className="bg-white border border-warm-200 rounded-sm">

        <div className="px-4 py-3 border-b border-warm-100">

          <div className="text-sm font-semibold text-warm-900">
            Forecast Summary
          </div>

          <div className="text-[11px] text-warm-400 font-mono mt-0.5">
            Select any rainfall timestep to update the forecast view
          </div>

        </div>

        <div className="overflow-x-auto">

          {hasForecast ? (
            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-warm-100 bg-warm-50">

                  {[
                    "Time",
                    "Rainfall",
                    "Rate",
                    "Drainage",
                    "Model Risk",
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

                {rainfallForecast.map(
                  (point, i) => (
                    <tr
                      key={`${point.time}-${i}`}
                      onClick={() =>
                        setSelectedForecastIndex(
                          i
                        )
                      }
                      className={`border-b border-warm-50 cursor-pointer transition-colors ${
                        selectedForecastIndex ===
                        i
                          ? "bg-maroon-50"
                          : "hover:bg-warm-50"
                      }`}
                    >

                      <td className="px-4 py-2.5 font-mono text-xs text-warm-700 font-medium">
                        {formatForecastLabel(
                          point.time
                        )}
                      </td>

                      <td className="px-4 py-2.5 font-mono text-xs text-blue-700">
                        {point.rainfall_mm.toFixed(
                          1
                        )}{" "}
                        mm
                      </td>

                      <td className="px-4 py-2.5 font-mono text-xs text-blue-700">
                        {point.rainfall_rate_mm_hr.toFixed(
                          1
                        )}{" "}
                        mm/hr
                      </td>

                      <td className="px-4 py-2.5 font-mono text-xs text-warm-400">
                        —
                      </td>

                      <td className="px-4 py-2.5">

                        <StatusBadge
                          level={
                            floodStatus
                              ? riskLevel
                              : "SAFE"
                          }
                        />

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          ) : (
            <div className="p-4 text-xs text-warm-400 font-mono">
              Forecast timeline unavailable.
            </div>
          )}

        </div>

      </div>

      {/* Model footer */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-[10px] text-warm-400 font-mono">

        <span>
          Forecast confidence:{" "}
          {confidence !== null
            ? `${confidence}%`
            : "—"}
        </span>

        <span className="hidden md:inline">
          ·
        </span>

        <span>
          Model: Backend rainfall + drainage
          flood model
        </span>

        <span className="hidden md:inline">
          ·
        </span>

        <span>
          Updated: {updatedText}
        </span>

      </div>

    </div>
  );
}