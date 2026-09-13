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
  }
> = {
  CRITICAL: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  HIGH: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  MODERATE: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  LOW: {
    bg: "bg-lime-50",
    text: "text-lime-800",
    border: "border-lime-200",
  },
  SAFE: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
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
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-stone-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {detail}
          </p>
        </div>

        <div className="rounded-lg bg-stone-100 p-2 text-stone-700">
          <Icon className="h-5 w-5" />
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
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    orange: "border-orange-200 bg-orange-50 text-orange-800",
    red: "border-red-200 bg-red-50 text-red-800",
    maroon: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className="relative flex-1">
      <div
        className={`h-full rounded-xl border p-4 ${accentStyles[accent]}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide opacity-70">
            Step {number}
          </span>

          <Icon className="h-5 w-5" />
        </div>

        <h3 className="mt-3 font-semibold text-stone-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-stone-600">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium">
          <CheckCircle className="h-4 w-4" />
          {status}
        </div>
      </div>
    </div>
  );
}

export default function ModelIntelligenceScreen() {
  const { state } = useApp();

  /*
   * AppContext uses state.city.
   * The project does not have state.selectedCity.
   */
  const city = cityData[state.city];

  /*
   * Keep the data safe if a city is temporarily unavailable.
   */
  const hotspots = city?.hotspots ?? [];

  /*
   * Calculate model metrics from the current city's hotspots.
   *
   * IMPORTANT:
   * hotspot.onset is a number in the current Hotspot type.
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
   * It does not contain an overallRisk property.
   */
  const overallRisk = (city?.alertLevel ?? "SAFE") as RiskLevel;

  const overallRiskStyle = riskStyles[overallRisk];

  /*
   * Safe confidence fallback for the UI.
   */
  const forecastConfidence = city?.forecastConfidence ?? 0;

  /*
   * If the city key is unexpectedly unavailable, show a safe
   * fallback instead of crashing the entire authority dashboard.
   */
  if (!city) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" />

              <div>
                <h2 className="font-bold text-red-900">
                  Model data unavailable
                </h2>

                <p className="mt-1 text-sm text-red-700">
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
    <div className="min-h-screen bg-stone-50">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-red-800" />

                <h1 className="text-xl font-bold text-stone-900">
                  Model Intelligence
                </h1>

                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                  Decision Support
                </span>
              </div>

              <p className="mt-1 text-sm text-stone-500">
                Operational view of the flood prediction pipeline for{" "}
                <span className="font-medium text-stone-700">
                  {city.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Model active
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <RefreshCw className="h-4 w-4" />
                Prototype run
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            STATUS
            ===================================================== */}

        <section
          className={`rounded-xl border p-5 ${overallRiskStyle.bg} ${overallRiskStyle.border}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-800" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Current model assessment
                </p>

                <h2 className="mt-1 text-xl font-bold text-stone-900">
                  {overallRisk} flood risk
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-stone-600">
                  The current assessment combines rainfall conditions,
                  drainage stress and predicted surface-water accumulation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold text-stone-800">
              <Radio className="h-4 w-4" />
              0–3 hour nowcast
            </div>
          </div>
        </section>

        {/* =====================================================
            MODEL OUTPUT
            ===================================================== */}

        <section>
          <div className="mb-3">
            <h2 className="text-base font-bold text-stone-900">
              Model output
            </h2>

            <p className="text-sm text-stone-500">
              Key indicators used by the authority decision layer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            FLOOD PREDICTION CHAIN
            ===================================================== */}

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-red-800" />

              <h2 className="font-bold text-stone-900">
                Flood prediction chain
              </h2>
            </div>

            <p className="mt-1 text-sm text-stone-500">
              The system connects rainfall forcing with drainage response
              and surface-water risk.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
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
            WHY FLOOD RISK
            ===================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-800" />

              <h2 className="font-bold text-stone-900">
                Why the model is predicting risk
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />

                <div>
                  <p className="font-medium text-stone-800">
                    Rainfall forcing
                  </p>

                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    Short-duration rainfall can generate rapid runoff before
                    drainage capacity recovers.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />

                <div>
                  <p className="font-medium text-stone-800">
                    Drainage stress
                  </p>

                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    High network utilization increases the probability of
                    surcharge and slower surface drainage.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />

                <div>
                  <p className="font-medium text-stone-800">
                    Local accumulation
                  </p>

                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    Low-lying or highly impervious areas can accumulate water
                    faster than it can leave the surface.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              CONFIDENCE
              =================================================== */}

          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-800" />

              <h2 className="font-bold text-stone-900">
                Prediction confidence
              </h2>
            </div>

            <div className="mt-5">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-stone-900">
                  {forecastConfidence}%
                </span>

                <span className="text-sm text-stone-500">
                  Current estimate
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-red-800"
                  style={{
                    width: `${Math.min(
                      Math.max(forecastConfidence, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-stone-50 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />

                <p className="text-xs leading-5 text-stone-600">
                  Confidence represents the current prototype model
                  assessment. In the operational system, this score should
                  incorporate forecast uncertainty, sensor quality,
                  drainage-data quality and field verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HOTSPOTS
            ===================================================== */}

        <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-800" />

              <h2 className="font-bold text-stone-900">
                Priority model hotspots
              </h2>
            </div>

            <p className="mt-1 text-sm text-stone-500">
              Areas requiring attention based on predicted flood conditions.
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {hotspots.slice(0, 6).map((hotspot) => {
              const style =
                riskStyles[hotspot.risk as RiskLevel];

              return (
                <div
                  key={hotspot.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 rounded-lg border p-2 ${style.bg} ${style.border}`}
                    >
                      <MapPin
                        className={`h-4 w-4 ${style.text}`}
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-stone-900">
                        {hotspot.label}
                      </p>

                      <p className="mt-0.5 text-xs text-stone-500">
                        {hotspot.zone}
                      </p>

                      <p className="mt-1 text-sm text-stone-600">
                        Driver: {hotspot.cause}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 sm:justify-end">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-stone-400">
                        Peak depth
                      </p>

                      <p className="font-semibold text-stone-800">
                        {hotspot.depthMax} cm
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-stone-400">
                        Onset
                      </p>

                      <p className="font-semibold text-stone-800">
                        {hotspot.onset} min
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.border} ${style.text}`}
                    >
                      {hotspot.risk}
                    </span>
                  </div>
                </div>
              );
            })}

            {hotspots.length === 0 && (
              <div className="p-5 text-sm text-stone-500">
                No model hotspots are available for the current city.
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            FEEDBACK LOOP
            ===================================================== */}

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-red-800" />

            <h2 className="font-bold text-stone-900">
              Model feedback loop
            </h2>
          </div>

          <p className="mt-1 text-sm text-stone-500">
            Designed operational workflow for continuously improving the
            flood forecast.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
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
                className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              >
                <p className="text-xs font-bold text-red-800">
                  {number}
                </p>

                <p className="mt-2 text-sm font-medium leading-5 text-stone-800">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

            <p className="text-xs leading-5 text-amber-900">
              <strong>Prototype:</strong>{" "}
              this screen visualizes the intended operational feedback loop.
              Automatic recalibration from verified citizen reports is part
              of the planned backend architecture and is not claimed as fully
              implemented here.
            </p>
          </div>
        </section>

        {/* =====================================================
            TECHNICAL STATUS
            ===================================================== */}

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-red-800" />

            <h2 className="font-bold text-stone-900">
              Model pipeline status
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                className="flex items-center justify-between rounded-lg border border-stone-200 p-3"
              >
                <span className="text-sm text-stone-600">
                  {label}
                </span>

                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${textClass}`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />

                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            DISCLAIMER
            ===================================================== */}

        <div className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-100 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />

          <p className="text-xs leading-5 text-stone-600">
            <strong className="text-stone-700">
              Prototype data notice:
            </strong>{" "}
            current predictions and drainage conditions are demonstration
            outputs. Production deployment requires validated city DEM,
            surveyed drainage assets, live rainfall/radar feeds, calibrated
            hydraulic models and verified field observations.
          </p>
        </div>
      </main>
    </div>
  );
}