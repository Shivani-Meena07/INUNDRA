import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";

import AuthorityGlobalHeader, {
  type AuthorityPage,
} from "../../components/layout/AuthorityGlobalHeader";

import ModelIntelligenceScreen from "./ModelIntelligenceScreen";
import AuthorityIncidentsScreen from "./IncidentsScreen";
import DrainageScreen from "./DrainageScreen";
import FieldResponseScreen from "./FieldResponseScreen";

import { cityData, RiskLevel } from "../../data/mockData";

/* ===========================================================
   RISK STYLES
=========================================================== */

const riskStyles: Record<
  RiskLevel,
  {
    text: string;
    bg: string;
    border: string;
    dot: string;
  }
> = {
  CRITICAL: {
    text: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-700",
  },

  HIGH: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-600",
  },

  MODERATE: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },

  LOW: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-600",
  },

  SAFE: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-600",
  },
};

/* ===========================================================
   METRIC CARD
=========================================================== */

function MetricCard({
  label,
  value,
  detail,
  alert = false,
}: {
  label: string;
  value: string;
  detail: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`border bg-white p-4 ${
        alert ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
          {label}
        </p>

        {alert && (
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
        )}
      </div>

      <div className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
        {value}
      </div>

      <p className="mt-1 text-xs text-stone-500">
        {detail}
      </p>
    </div>
  );
}

/* ===========================================================
   SECTION HEADER
=========================================================== */

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-stone-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-stone-500">
          {description}
        </p>
      </div>

      {action && (
        <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-widest text-stone-400 sm:block">
          {action}
        </span>
      )}
    </div>
  );
}

/* ===========================================================
   STATUS LABEL
=========================================================== */

function StatusLabel({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "critical" | "warning" | "safe" | "neutral";
}) {
  const styles = {
    critical: "bg-red-50 text-red-800",
    warning: "bg-amber-50 text-amber-700",
    safe: "bg-green-50 text-green-700",
    neutral: "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/* ===========================================================
   OPERATIONAL ROW
=========================================================== */

function OperationalRow({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "critical" | "warning" | "safe" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 py-3 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-stone-800">
          {label}
        </div>

        <div className="mt-0.5 text-xs text-stone-500">
          {detail}
        </div>
      </div>

      <StatusLabel tone={tone}>
        {value}
      </StatusLabel>
    </div>
  );
}

/* ===========================================================
   AUTHORITY DASHBOARD
=========================================================== */

export default function AuthorityDashboard() {
  const { state } = useApp();

  /*
   * Authority page is controlled locally by the
   * AuthorityGlobalHeader.
   */
  const [activeAuthorityPage, setActiveAuthorityPage] =
    useState<AuthorityPage>("overview");

  /*
   * IMPORTANT:
   * The application state uses `state.city`.
   * Do not use `state.selectedCity`.
   */
  const city = cityData[state.city];

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const criticalNodes = useMemo(
    () =>
      city.drainageNodes.filter(
        (node) =>
          node.status === "Overloaded" ||
          node.status === "Blocked" ||
          node.status === "Backflow",
      ),
    [city],
  );

  const priorityIncidents = useMemo(
    () =>
      state.incidents
        .filter(
          (incident) =>
            incident.severity === "CRITICAL" ||
            incident.severity === "HIGH",
        )
        .slice(0, 5),
    [state.incidents],
  );

  const affectedRoads = useMemo(
    () =>
      city.hotspots.filter(
        (hotspot) =>
          hotspot.risk === "CRITICAL" ||
          hotspot.risk === "HIGH",
      ),
    [city],
  );

  const currentStep = city.timeSteps[0];

  const cityRisk = riskStyles[city.alertLevel];

  const highRiskHotspots = city.hotspots.filter(
    (hotspot) =>
      hotspot.risk === "CRITICAL" ||
      hotspot.risk === "HIGH",
  );

  const activeIncidentCount = state.incidents.filter(
    (incident) => incident.status !== "Resolved",
  ).length;

  const criticalIncidentCount = state.incidents.filter(
    (incident) => incident.severity === "CRITICAL",
  ).length;

  const operationalTone =
    city.alertLevel === "CRITICAL" ||
    city.alertLevel === "HIGH"
      ? "critical"
      : city.alertLevel === "MODERATE"
        ? "warning"
        : "safe";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-warm-50">
      {/* =====================================================
          AUTHORITY GLOBAL HEADER
          Same visual structure as Citizen GlobalHeader
      ===================================================== */}

      <AuthorityGlobalHeader
        activePage={activeAuthorityPage}
        onPageChange={setActiveAuthorityPage}
      />

      {/* =====================================================
          INCIDENT MANAGEMENT
      ===================================================== */}

      {activeAuthorityPage === "incidents" && (
        <AuthorityIncidentsScreen />
      )}

      {/* =====================================================
          DRAINAGE OPERATIONS
      ===================================================== */}

      {activeAuthorityPage === "drainage" && (
        <DrainageScreen />
      )}

      {/* =====================================================
          FIELD RESPONSE
      ===================================================== */}

      {activeAuthorityPage === "field-response" && (
        <FieldResponseScreen />
      )}

      {/* =====================================================
          MODEL INTELLIGENCE
      ===================================================== */}

      {activeAuthorityPage === "model-intelligence" && (
        <ModelIntelligenceScreen />
      )}

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      {activeAuthorityPage === "overview" && (
        <main className="mx-auto max-w-360 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <section className="mb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-maroon-700" />

                  <p className="text-[10px] font-bold uppercase tracking-widest text-maroon-700">
                    Flood operations
                  </p>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-warm-900 sm:text-3xl">
                  City Command Centre
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-warm-600">
                  Operational overview of flood risk, rainfall,
                  drainage stress, incidents and field response for{" "}
                  {city.name}.
                </p>
              </div>

              {/* Current city status */}

              <div
                className={`flex items-center gap-3 border px-4 py-3 ${cityRisk.bg} ${cityRisk.border}`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${cityRisk.dot}`}
                />

                <div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest ${cityRisk.text}`}
                  >
                    {city.alertLevel} alert
                  </div>

                  <div className="mt-0.5 max-w-sm text-xs text-warm-600">
                    {city.alertMessage}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              KEY METRICS
          ================================================= */}

          <section className="grid grid-cols-2 gap-px border border-warm-200 bg-warm-200 sm:grid-cols-3 xl:grid-cols-5">
            <MetricCard
              label="Current rainfall"
              value={`${city.currentRainfall} mm/h`}
              detail="Latest prototype observation"
            />

            <MetricCard
              label="Forecast risk"
              value={city.alertLevel}
              detail={`Confidence ${city.forecastConfidence}%`}
              alert={
                city.alertLevel === "CRITICAL" ||
                city.alertLevel === "HIGH"
              }
            />

            <MetricCard
              label="Active hotspots"
              value={String(city.hotspots.length)}
              detail="Priority inundation locations"
              alert={city.hotspots.length > 0}
            />

            <MetricCard
              label="Critical drainage"
              value={String(criticalNodes.length)}
              detail="Overloaded / blocked / backflow"
              alert={criticalNodes.length > 0}
            />

            <MetricCard
              label="Open incidents"
              value={String(activeIncidentCount)}
              detail={`${state.incidents.length} total reports`}
              alert={criticalIncidentCount > 0}
            />
          </section>

          {/* =================================================
              ALERT STRIP
          ================================================= */}

          {(city.alertLevel === "CRITICAL" ||
            city.alertLevel === "HIGH" ||
            criticalNodes.length > 0 ||
            criticalIncidentCount > 0) && (
            <section className="mt-5 border-l-4 border-red-700 bg-red-50 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-red-800">
                    Priority operational attention
                  </div>

                  <p className="mt-1 text-xs leading-5 text-red-700">
                    {criticalIncidentCount > 0
                      ? `${criticalIncidentCount} critical incident${
                          criticalIncidentCount > 1
                            ? "s"
                            : ""
                        } require${
                          criticalIncidentCount === 1
                            ? "s"
                            : ""
                        } review.`
                      : criticalNodes.length > 0
                        ? `${criticalNodes.length} drainage node${
                            criticalNodes.length > 1
                              ? "s"
                              : ""
                          } are showing hydraulic stress.`
                        : "Current flood conditions require operational monitoring."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveAuthorityPage(
                      criticalIncidentCount > 0
                        ? "incidents"
                        : "drainage",
                    )
                  }
                  className="self-start border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-800 transition hover:bg-red-100 sm:self-auto"
                >
                  Review now
                </button>
              </div>
            </section>
          )}

          {/* =================================================
              PRIMARY OPERATIONAL GRID
          ================================================= */}

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
            {/* FLOOD SITUATION */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Flood situation"
                description="Current model state across rainfall, surface depth and drainage utilisation."
                action="Current timestep"
              />

              <div className="grid gap-px border border-warm-200 bg-warm-200 sm:grid-cols-3">
                <div className="bg-warm-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-warm-500">
                    Rainfall
                  </div>

                  <div className="mt-2 text-xl font-bold text-warm-900">
                    {currentStep.rainfall} mm/h
                  </div>

                  <div className="mt-1 text-xs text-warm-500">
                    Current timestep
                  </div>
                </div>

                <div className="bg-warm-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-warm-500">
                    Water depth
                  </div>

                  <div className="mt-2 text-xl font-bold text-warm-900">
                    {currentStep.waterDepth} cm
                  </div>

                  <div className="mt-1 text-xs text-warm-500">
                    Modelled surface depth
                  </div>
                </div>

                <div className="bg-warm-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-warm-500">
                    Drainage utilisation
                  </div>

                  <div className="mt-2 text-xl font-bold text-warm-900">
                    {currentStep.drainageUtil}%
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden bg-warm-200">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          currentStep.drainageUtil,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 border border-warm-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-warm-500">
                      Model explanation
                    </div>

                    <p className="mt-2 text-sm leading-6 text-warm-700">
                      {currentStep.explanation}
                    </p>
                  </div>

                  <StatusLabel
                    tone={
                      currentStep.riskLevel === "CRITICAL" ||
                      currentStep.riskLevel === "HIGH"
                        ? "critical"
                        : currentStep.riskLevel === "MODERATE"
                          ? "warning"
                          : "safe"
                    }
                  >
                    {currentStep.riskLevel}
                  </StatusLabel>
                </div>
              </div>
            </div>

            {/* OPERATIONAL STATUS */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Operational status"
                description="Quick assessment of the city's current response posture."
              />

              <div>
                <OperationalRow
                  label="Flood alert"
                  value={city.alertLevel}
                  detail={`Forecast confidence ${city.forecastConfidence}%`}
                  tone={operationalTone}
                />

                <OperationalRow
                  label="Priority hotspots"
                  value={String(highRiskHotspots.length)}
                  detail="High and critical risk locations"
                  tone={
                    highRiskHotspots.length > 0
                      ? "critical"
                      : "safe"
                  }
                />

                <OperationalRow
                  label="Drainage stress"
                  value={String(criticalNodes.length)}
                  detail="Nodes requiring attention"
                  tone={
                    criticalNodes.length > 0
                      ? "warning"
                      : "safe"
                  }
                />

                <OperationalRow
                  label="Open incidents"
                  value={String(activeIncidentCount)}
                  detail={`${criticalIncidentCount} critical`}
                  tone={
                    criticalIncidentCount > 0
                      ? "critical"
                      : activeIncidentCount > 0
                        ? "warning"
                        : "safe"
                  }
                />
              </div>

              <div className="mt-4 border-t border-warm-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAuthorityPage("field-response")
                  }
                  className="w-full border border-maroon-700 bg-maroon-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-maroon-800"
                >
                  Open field response
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              HOTSPOTS + DRAINAGE
          ================================================= */}

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* PRIORITY HOTSPOTS */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Priority hotspots"
                description="Locations requiring operational attention based on current model output."
                action="Top 5"
              />

              <div className="divide-y divide-warm-100">
                {city.hotspots.slice(0, 5).map((hotspot) => {
                  const style = riskStyles[hotspot.risk];

                  return (
                    <div
                      key={hotspot.id}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-warm-900">
                            {hotspot.label}
                          </div>

                          <div className="mt-0.5 text-xs text-warm-500">
                            {hotspot.zone}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}
                        >
                          {hotspot.risk}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-warm-400">
                            Depth
                          </div>

                          <div className="mt-0.5 text-xs font-semibold text-warm-700">
                            {hotspot.depthMin}–{hotspot.depthMax} cm
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-warm-400">
                            Onset
                          </div>

                          <div className="mt-0.5 text-xs font-semibold text-warm-700">
                            {hotspot.onset} min
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-warm-400">
                            Confidence
                          </div>

                          <div className="mt-0.5 text-xs font-semibold text-warm-700">
                            {hotspot.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {city.hotspots.length === 0 && (
                  <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    No priority hotspots in the current prototype
                    dataset.
                  </div>
                )}
              </div>
            </div>

            {/* DRAINAGE OPERATIONS */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Drainage operations"
                description="Network nodes currently showing hydraulic stress."
                action="Priority nodes"
              />

              <div className="divide-y divide-warm-100">
                {criticalNodes.slice(0, 5).map((node) => {
                  const statusTone =
                    node.status === "Backflow" ||
                    node.status === "Blocked"
                      ? "critical"
                      : "warning";

                  return (
                    <div
                      key={node.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-warm-900">
                          {node.label}
                        </div>

                        <div className="mt-0.5 text-xs text-warm-500">
                          Flow {node.flow} /{" "}
                          {node.designCapacity} m³/s
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <StatusLabel tone={statusTone}>
                          {node.status}
                        </StatusLabel>

                        <div className="mt-1 text-[10px] text-warm-500">
                          {Math.round(
                            (node.flow /
                              node.designCapacity) *
                              100,
                          )}
                          % capacity
                        </div>
                      </div>
                    </div>
                  );
                })}

                {criticalNodes.length === 0 && (
                  <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    No critical drainage nodes in the current
                    prototype dataset.
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-warm-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAuthorityPage("drainage")
                  }
                  className="w-full border border-warm-300 bg-white px-4 py-2.5 text-xs font-semibold text-warm-700 transition hover:bg-warm-50"
                >
                  Open drainage operations
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              INCIDENTS + FIELD RESPONSE
          ================================================= */}

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* INCIDENT MANAGEMENT */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Incident management"
                description="Citizen reports requiring verification or response."
                action="Priority queue"
              />

              <div className="divide-y divide-warm-100">
                {priorityIncidents.map((incident) => {
                  const style = riskStyles[incident.severity];

                  return (
                    <div
                      key={incident.id}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-warm-900">
                            {incident.location}
                          </div>

                          <div className="mt-0.5 text-xs text-warm-500">
                            {incident.type}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}
                        >
                          {incident.severity}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[10px]">
                        <span className="text-warm-500">
                          {incident.status}
                        </span>

                        <span className="font-medium text-warm-600">
                          {incident.reportedAt}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {priorityIncidents.length === 0 && (
                  <div className="border border-warm-200 bg-warm-50 p-4 text-sm text-warm-600">
                    No high-priority incidents currently reported.
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-warm-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAuthorityPage("incidents")
                  }
                  className="w-full border border-warm-300 bg-white px-4 py-2.5 text-xs font-semibold text-warm-700 transition hover:bg-warm-50"
                >
                  Open incident management
                </button>
              </div>
            </div>

            {/* FIELD RESPONSE */}

            <div className="border border-warm-200 bg-white p-5">
              <SectionHeader
                title="Field response priorities"
                description="Locations that may require physical inspection or emergency response."
                action="Top 4"
              />

              <div className="divide-y divide-warm-100">
                {affectedRoads.slice(0, 4).map((hotspot) => {
                  const style = riskStyles[hotspot.risk];

                  return (
                    <div
                      key={hotspot.id}
                      className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                          />

                          <span className="truncate text-sm font-semibold text-warm-900">
                            {hotspot.label}
                          </span>
                        </div>

                        <div className="mt-1 text-xs leading-5 text-warm-500">
                          {hotspot.cause}
                        </div>

                        <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-warm-600">
                          Predicted depth {hotspot.depthMax} cm
                        </div>
                      </div>

                      <StatusLabel
                        tone={
                          hotspot.risk === "CRITICAL"
                            ? "critical"
                            : "warning"
                        }
                      >
                        {hotspot.risk}
                      </StatusLabel>
                    </div>
                  );
                })}

                {affectedRoads.length === 0 && (
                  <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    No high-priority field response locations
                    currently identified.
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-warm-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAuthorityPage("field-response")
                  }
                  className="w-full border border-maroon-700 bg-maroon-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-maroon-800"
                >
                  Open field response
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              MODEL SNAPSHOT
          ================================================= */}

          <section className="mt-5 border border-warm-200 bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-maroon-700">
                  Model intelligence
                </div>

                <h2 className="mt-1 text-base font-bold text-warm-900">
                  Forecast confidence and decision support
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-warm-500">
                  Review the prediction chain, confidence, priority
                  hotspots and model feedback workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveAuthorityPage(
                    "model-intelligence",
                  )
                }
                className="border border-warm-300 bg-white px-4 py-2.5 text-xs font-semibold text-warm-700 transition hover:bg-warm-50"
              >
                Open model intelligence
              </button>
            </div>

            <div className="grid grid-cols-2 border-t border-warm-200 sm:grid-cols-4">
              <div className="border-b border-warm-200 p-4 sm:border-b-0 sm:border-r">
                <div className="text-[10px] uppercase tracking-widest text-warm-500">
                  Confidence
                </div>

                <div className="mt-1 text-xl font-bold text-warm-900">
                  {city.forecastConfidence}%
                </div>
              </div>

              <div className="border-b border-warm-200 p-4 sm:border-b-0 sm:border-r">
                <div className="text-[10px] uppercase tracking-widest text-warm-500">
                  Risk level
                </div>

                <div
                  className={`mt-1 text-sm font-bold ${cityRisk.text}`}
                >
                  {city.alertLevel}
                </div>
              </div>

              <div className="border-r border-warm-200 p-4">
                <div className="text-[10px] uppercase tracking-widest text-warm-500">
                  Hotspots
                </div>

                <div className="mt-1 text-xl font-bold text-warm-900">
                  {city.hotspots.length}
                </div>
              </div>

              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-warm-500">
                  Current timestep
                </div>

                <div className="mt-1 text-sm font-bold text-warm-900">
                  {currentStep.rainfall} mm/h
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PROTOTYPE NOTE
          ================================================= */}

          <footer className="mt-6 border-t border-warm-200 pb-8 pt-4">
            <p className="max-w-5xl text-[11px] leading-5 text-warm-400">
              Prototype authority dashboard. Current city, drainage,
              rainfall, hotspot and incident values are demonstration
              data. Production deployment will connect authenticated
              authority accounts to live data, verified GIS assets,
              model outputs and operational response workflows.
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}