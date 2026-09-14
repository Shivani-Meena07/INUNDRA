import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle,
  Clock,
  CloudRain,
  Droplets,
  Gauge,
  GitBranch,
  Info,
  MapPin,
  Radio,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Waves,
} from "lucide-react";

import { useApp } from "../../state/AppContext";
import { cityData, RiskLevel } from "../../data/mockData";

const riskStyles: Record<
  RiskLevel,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  CRITICAL: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-600",
  },
  HIGH: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  MODERATE: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  LOW: {
    bg: "bg-lime-50",
    text: "text-lime-800",
    border: "border-lime-200",
    dot: "bg-lime-600",
  },
  SAFE: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    dot: "bg-green-600",
  },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-warm-200 bg-white px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-500">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-bold tracking-tight text-warm-900">
            {value}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-warm-500">
            {detail}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-warm-200 bg-warm-50 text-maroon-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ModelStage({
  number,
  icon: Icon,
  title,
  description,
  status,
  accent,
}: {
  number: string;
  icon: typeof Activity;
  title: string;
  description: string;
  status: string;
  accent: "blue" | "orange" | "red" | "maroon";
}) {
  const accentStyles = {
    blue: {
      wrapper: "border-blue-200 bg-blue-50/60",
      icon: "text-blue-700",
      number: "text-blue-700",
      status: "text-blue-700",
    },
    orange: {
      wrapper: "border-orange-200 bg-orange-50/60",
      icon: "text-orange-700",
      number: "text-orange-700",
      status: "text-orange-700",
    },
    red: {
      wrapper: "border-red-200 bg-red-50/60",
      icon: "text-red-700",
      number: "text-red-700",
      status: "text-red-700",
    },
    maroon: {
      wrapper: "border-maroon-200 bg-maroon-50",
      icon: "text-maroon-700",
      number: "text-maroon-700",
      status: "text-maroon-700",
    },
  };

  const styles = accentStyles[accent];

  return (
    <div
      className={`relative border p-3.5 ${styles.wrapper}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] font-semibold ${styles.number}`}
        >
          STEP {number}
        </span>

        <Icon className={`h-4 w-4 ${styles.icon}`} />
      </div>

      <h3 className="mt-2 text-sm font-semibold text-warm-900">
        {title}
      </h3>

      <p className="mt-1 text-[11px] leading-4.5 text-warm-600">
        {description}
      </p>

      <div
        className={`mt-3 flex items-center gap-1.5 text-[10px] font-semibold ${styles.status}`}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {status}
      </div>
    </div>
  );
}

export default function ModelIntelligenceScreen() {
  const { state } = useApp();

  /*
   * AppContext uses state.city.
   */
  const city = cityData[state.city];

  /*
   * Keep the data safe if a city is temporarily unavailable.
   */
  const hotspots = city?.hotspots ?? [];

  /*
   * Calculate model metrics from the current city's hotspots.
   */
  const metrics = useMemo(() => {
    const criticalHotspots = hotspots.filter(
      (hotspot) => hotspot.risk === "CRITICAL"
    );

    const highestDepth = hotspots.reduce(
      (max, hotspot) =>
        Math.max(max, hotspot.depthMax ?? 0),
      0
    );

    const earliestOnset = hotspots.reduce<number | null>(
      (earliest, hotspot) => {
        if (hotspot.onset == null) {
          return earliest;
        }

        if (earliest == null) {
          return hotspot.onset;
        }

        return hotspot.onset < earliest
          ? hotspot.onset
          : earliest;
      },
      null
    );

    return {
      hotspotCount: hotspots.length,
      criticalCount: criticalHotspots.length,
      highestDepth,
      earliestOnset,
    };
  }, [hotspots]);

  /*
   * CityData uses alertLevel as the overall city risk.
   */
  const overallRisk = (city?.alertLevel ?? "SAFE") as RiskLevel;

  const overallRiskStyle = riskStyles[overallRisk];

  /*
   * Safe confidence fallback for the UI.
   */
  const forecastConfidence = city?.forecastConfidence ?? 0;

  /*
   * If city data is unavailable, fail safely.
   */
  if (!city) {
    return (
      <div className="min-h-full bg-warm-50 p-4 sm:p-5">
        <div className="mx-auto max-w-7xl">
          <div className="border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

              <div>
                <h2 className="text-sm font-bold text-red-900">
                  Model data unavailable
                </h2>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  No flood model data is available for the selected city.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-warm-50">
      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="border-b border-warm-200 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center bg-maroon-700 text-white">
                  <BrainCircuit className="h-3.5 w-3.5" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-maroon-700">
                  Authority / Model Intelligence
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-warm-900 sm:text-2xl">
                  Model Intelligence
                </h1>

                <span className="border border-warm-200 bg-white px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-warm-500">
                  Decision support
                </span>
              </div>

              <p className="mt-1 text-xs text-warm-500 sm:text-sm">
                Operational flood-prediction view for{" "}
                <span className="font-semibold text-warm-700">
                  {city.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 border border-green-200 bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold text-green-800">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600" />
                MODEL ACTIVE
              </div>

              <div className="hidden items-center gap-1.5 font-mono text-[10px] text-warm-500 sm:flex">
                <RefreshCw className="h-3.5 w-3.5" />
                PROTOTYPE RUN
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CURRENT ASSESSMENT
        ===================================================== */}

        <section
          className={`mt-3 border ${overallRiskStyle.border} ${overallRiskStyle.bg}`}
        >
          <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <ShieldAlert
                className={`mt-0.5 h-5 w-5 shrink-0 ${overallRiskStyle.text}`}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-warm-500">
                    Current model assessment
                  </p>

                  <span
                    className={`flex items-center gap-1.5 border px-2 py-0.5 text-[9px] font-bold ${overallRiskStyle.border} ${overallRiskStyle.bg} ${overallRiskStyle.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${overallRiskStyle.dot}`}
                    />
                    {overallRisk}
                  </span>
                </div>

                <h2 className="mt-1 text-base font-bold text-warm-900 sm:text-lg">
                  {overallRisk} flood risk
                </h2>

                <p className="mt-0.5 max-w-3xl text-xs leading-4.5 text-warm-600">
                  Current assessment combines rainfall conditions,
                  drainage stress and predicted surface-water
                  accumulation.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 border border-warm-200 bg-white px-2.5 py-1.5 font-mono text-[10px] font-semibold text-warm-700">
              <Radio className="h-3.5 w-3.5 text-maroon-700" />
              0–3 HR NOWCAST
            </div>
          </div>
        </section>

        {/* =====================================================
            MODEL OUTPUT
        ===================================================== */}

        <section className="mt-4">
          <div className="mb-2.5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-warm-900 sm:text-base">
                Model output
              </h2>

              <p className="mt-0.5 text-[11px] text-warm-500 sm:text-xs">
                Key indicators used by the authority decision layer.
              </p>
            </div>

            <span className="hidden font-mono text-[9px] uppercase tracking-wide text-warm-400 sm:block">
              LIVE ASSESSMENT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <MetricCard
              icon={Droplets}
              label="Peak water depth"
              value={`${metrics.highestDepth} cm`}
              detail="Maximum predicted hotspot depth"
            />

            <MetricCard
              icon={MapPin}
              label="Flood hotspots"
              value={`${metrics.hotspotCount}`}
              detail={`${metrics.criticalCount} currently critical`}
            />

            <MetricCard
              icon={Clock}
              label="Earliest onset"
              value={
                metrics.earliestOnset != null
                  ? `${metrics.earliestOnset} min`
                  : "—"
              }
              detail="Predicted first inundation"
            />

            <MetricCard
              icon={Gauge}
              label="Model confidence"
              value={`${forecastConfidence}%`}
              detail="Current prediction confidence"
            />
          </div>
        </section>

        {/* =====================================================
            PREDICTION CHAIN
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-maroon-700" />

              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Flood prediction chain
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  Rainfall forcing → drainage response → surface
                  accumulation → operational risk.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-warm-200 md:grid-cols-4">
            <ModelStage
              number="01"
              icon={CloudRain}
              title="Rainfall"
              description="Short-horizon rainfall forcing enters the nowcast."
              status="Input available"
              accent="blue"
            />

            <ModelStage
              number="02"
              icon={Waves}
              title="Drainage"
              description="Network capacity and node stress influence runoff routing."
              status="Network evaluated"
              accent="orange"
            />

            <ModelStage
              number="03"
              icon={Droplets}
              title="Surface flooding"
              description="Terrain and drainage response indicate where water can accumulate."
              status="Depth estimated"
              accent="red"
            />

            <ModelStage
              number="04"
              icon={ShieldAlert}
              title="Risk"
              description="Predicted depth and operational factors become actionable risk levels."
              status="Decision layer ready"
              accent="maroon"
            />
          </div>
        </section>

        {/* =====================================================
            EXPLANATION + CONFIDENCE
        ===================================================== */}

        <section className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Why risk */}
          <div className="border border-warm-200 bg-white">
            <div className="border-b border-warm-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-maroon-700" />

                <div>
                  <h2 className="text-sm font-bold text-warm-900">
                    Why the model is predicting risk
                  </h2>

                  <p className="mt-0.5 text-[11px] text-warm-500">
                    Main factors contributing to the current assessment.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-warm-100">
              <div className="flex gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                <div>
                  <p className="text-xs font-semibold text-warm-800">
                    Rainfall forcing
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4.5 text-warm-500">
                    Short-duration rainfall can generate rapid runoff
                    before drainage capacity recovers.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />

                <div>
                  <p className="text-xs font-semibold text-warm-800">
                    Drainage stress
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4.5 text-warm-500">
                    High network utilization increases the probability
                    of surcharge and slower surface drainage.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />

                <div>
                  <p className="text-xs font-semibold text-warm-800">
                    Local accumulation
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4.5 text-warm-500">
                    Low-lying or highly impervious areas can accumulate
                    water faster than it can leave the surface.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="border border-warm-200 bg-white">
            <div className="border-b border-warm-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-maroon-700" />

                <div>
                  <h2 className="text-sm font-bold text-warm-900">
                    Prediction confidence
                  </h2>

                  <p className="mt-0.5 text-[11px] text-warm-500">
                    Current estimate from the prototype model.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold tracking-tight text-warm-900">
                  {forecastConfidence}%
                </span>

                <span className="font-mono text-[9px] uppercase tracking-wide text-warm-400">
                  Current estimate
                </span>
              </div>

              <div className="mt-2.5 h-2 overflow-hidden bg-warm-100">
                <div
                  className="h-full bg-maroon-700 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(forecastConfidence, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-start gap-2 border border-warm-200 bg-warm-50 p-3">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warm-500" />

                <p className="text-[10px] leading-4.5 text-warm-600">
                  Confidence represents the current prototype model
                  assessment. In the operational system, this score
                  should incorporate forecast uncertainty, sensor
                  quality, drainage-data quality and field
                  verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRIORITY HOTSPOTS
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-maroon-700" />

              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Priority model hotspots
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  Areas requiring attention based on predicted flood
                  conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-warm-100">
            {hotspots.slice(0, 6).map((hotspot) => {
              const style =
                riskStyles[hotspot.risk as RiskLevel];

              return (
                <div
                  key={hotspot.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center border ${style.bg} ${style.border}`}
                    >
                      <MapPin
                        className={`h-3.5 w-3.5 ${style.text}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-warm-900">
                          {hotspot.label}
                        </p>

                        <span
                          className={`flex items-center gap-1.5 border px-1.5 py-0.5 text-[9px] font-bold ${style.bg} ${style.border} ${style.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {hotspot.risk}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[10px] text-warm-500">
                        {hotspot.zone}
                      </p>

                      <p className="mt-0.5 text-[11px] text-warm-600">
                        Driver: {hotspot.cause}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 border-t border-warm-100 pt-2 sm:border-t-0 sm:pt-0">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-wide text-warm-400">
                        Peak depth
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-warm-800">
                        {hotspot.depthMax} cm
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-wide text-warm-400">
                        Onset
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-warm-800">
                        {hotspot.onset} min
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {hotspots.length === 0 && (
              <div className="px-4 py-5 text-xs text-warm-500">
                No model hotspots are available for the current city.
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            FEEDBACK LOOP
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-maroon-700" />

              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Model feedback loop
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  Intended workflow for continuously improving the
                  flood forecast.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-warm-200 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                ["01", "Citizen / field report"],
                ["02", "Incident verification"],
                ["03", "Drainage condition update"],
                ["04", "Model recalibration"],
                ["05", "Updated flood forecast"],
              ] as const
            ).map(([number, label]) => (
              <div
                key={number}
                className="bg-white px-3 py-3"
              >
                <p className="font-mono text-[9px] font-bold text-maroon-700">
                  {number}
                </p>

                <p className="mt-1.5 text-[11px] font-medium leading-4 text-warm-800">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />

              <p className="text-[10px] leading-4.5 text-amber-900">
                <strong>Prototype:</strong>{" "}
                this screen visualizes the intended operational
                feedback loop. Automatic recalibration from verified
                citizen reports is part of the planned backend
                architecture and is not claimed as fully implemented
                here.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PIPELINE STATUS
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-maroon-700" />

              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Model pipeline status
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  Current state of the prediction pipeline.
                </p>
              </div>
            </div>
          </div>

          <div className="grid divide-y divide-warm-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {(
              [
                ["Rainfall input", "Available", "text-blue-700"],
                ["Drainage network", "Evaluated", "text-orange-700"],
                ["Flood depth", "Estimated", "text-red-700"],
                ["Risk classification", "Active", "text-green-700"],
              ] as const
            ).map(([label, status, textClass]) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-[11px] text-warm-600">
                  {label}
                </span>

                <span
                  className={`flex items-center gap-1.5 text-[10px] font-semibold ${textClass}`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            PROTOTYPE NOTICE
        ===================================================== */}

        <div className="mt-4 flex items-start gap-2 border border-warm-200 bg-warm-100 px-4 py-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warm-500" />

          <p className="text-[10px] leading-4.5 text-warm-600">
            <strong className="text-warm-700">
              Prototype data notice:
            </strong>{" "}
            current predictions and drainage conditions are
            demonstration outputs. Production deployment requires
            validated city DEM, surveyed drainage assets, live
            rainfall/radar feeds, calibrated hydraulic models and
            verified field observations.
          </p>
        </div>
      </main>
    </div>
  );
}