import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";

import ModelIntelligenceScreen from "./ModelIntelligenceScreen";
import AuthorityIncidentsScreen from "./IncidentsScreen";
import DrainageScreen from "./DrainageScreen";
import FieldResponseScreen from "./FieldResponseScreen";

import { cityData, RiskLevel } from "../../data/mockData";

type AuthorityPage =
  | "overview"
  | "incidents"
  | "drainage"
  | "field-response"
  | "model-intelligence";

const authorityNavItems: {
  id: AuthorityPage;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "incidents",
    label: "Incidents",
  },
  {
    id: "drainage",
    label: "Drainage",
  },
  {
    id: "field-response",
    label: "Field Response",
  },
  {
    id: "model-intelligence",
    label: "Model Intelligence",
  },
];

const riskStyles: Record<
  RiskLevel,
  {
    text: string;
    bg: string;
    border: string;
  }
> = {
  CRITICAL: {
    text: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  HIGH: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  MODERATE: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  LOW: {
    text: "text-lime-700",
    bg: "bg-lime-50",
    border: "border-lime-200",
  },
  SAFE: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
};

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
      className={`rounded-xl border bg-white p-5 ${
        alert ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {label}
        </p>

        {alert && (
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
        )}
      </div>

      <div className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
        {value}
      </div>

      <p className="mt-1 text-xs text-stone-500">{detail}</p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-stone-900">{title}</h2>

      <p className="mt-1 text-xs text-stone-500">{description}</p>
    </div>
  );
}

function PlaceholderAuthorityPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-700">
          Authority Operations
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          {description}
        </p>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Module under development
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            This authority module will be connected to the flood intelligence
            backend in the next implementation step.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AuthorityDashboard() {
  const { state, dispatch } = useApp();

  const [activeAuthorityPage, setActiveAuthorityPage] =
    useState<AuthorityPage>("overview");

  /*
   * IMPORTANT:
   * The application state uses `state.city`.
   * Do not use `state.selectedCity` here because that property
   * does not exist in the current AppState.
   */
  const city = cityData[state.city];

  const criticalNodes = useMemo(
    () =>
      city.drainageNodes.filter(
        (node) =>
          node.status === "Overloaded" ||
          node.status === "Blocked" ||
          node.status === "Backflow"
      ),
    [city]
  );

  const priorityIncidents = useMemo(
    () =>
      state.incidents
        .filter(
          (incident) =>
            incident.severity === "CRITICAL" ||
            incident.severity === "HIGH"
        )
        .slice(0, 5),
    [state.incidents]
  );

  const affectedRoads = useMemo(
    () =>
      city.hotspots.filter(
        (hotspot) =>
          hotspot.risk === "CRITICAL" || hotspot.risk === "HIGH"
      ),
    [city]
  );

  const currentStep = city.timeSteps[0];

  const cityRisk = riskStyles[city.alertLevel];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* =====================================================
          AUTHORITY HEADER
          ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-bold tracking-tight text-stone-900">
                INUNDRA
              </div>

              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
                Authority Command Centre
              </div>
            </div>

            <div className="hidden h-7 w-px bg-stone-200 sm:block" />

            <div className="hidden text-sm text-stone-600 sm:block">
              {city.name}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-stone-800">
                Operations Desk
              </div>

              <div className="text-[11px] text-stone-500">
                Prototype authority session
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "AUTH_LOGOUT",
                })
              }
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          AUTHORITY NAVIGATION
          ===================================================== */}

      <nav className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max items-center gap-1">
            {authorityNavItems.map((item) => {
              const active = activeAuthorityPage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveAuthorityPage(item.id)}
                  className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-red-800 text-red-800"
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* =====================================================
          INCIDENT MANAGEMENT
          ===================================================== */}

      {activeAuthorityPage === "incidents" && (
        <AuthorityIncidentsScreen />
      )}

      {/* =====================================================
          DRAINAGE OPERATIONS
          ===================================================== */}

      {activeAuthorityPage === "drainage" && <DrainageScreen />}

      {/* =====================================================
          FIELD RESPONSE
          ===================================================== */}

      {activeAuthorityPage === "field-response" && <FieldResponseScreen />}

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
        <main className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8">
          {/* ===================================================
              TITLE / CITY STATUS
              =================================================== */}

          <section className="mb-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                  Flood operations
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                  City Command Centre
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Monitor flood risk, rainfall, drainage stress, incidents
                  and field response from one operational view.
                </p>
              </div>

              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${cityRisk.bg} ${cityRisk.border}`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${
                    city.alertLevel === "CRITICAL" ||
                    city.alertLevel === "HIGH"
                      ? "bg-red-600"
                      : "bg-amber-500"
                  }`}
                />

                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wide ${cityRisk.text}`}
                  >
                    {city.alertLevel} alert
                  </div>

                  <div className="mt-0.5 text-xs text-stone-600">
                    {city.alertMessage}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              CITY METRICS
              =================================================== */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
              value={String(state.incidents.length)}
              detail="Citizen reports in workspace"
            />
          </section>

          {/* ===================================================
              OPERATIONAL GRID
              =================================================== */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            {/* FLOOD SITUATION */}

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <SectionHeader
                title="Flood situation"
                description="Current model view of rainfall, water depth and drainage stress."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="text-xs font-semibold text-stone-500">
                    Rainfall
                  </div>

                  <div className="mt-2 text-xl font-bold text-stone-900">
                    {currentStep.rainfall} mm/h
                  </div>

                  <div className="mt-1 text-xs text-stone-500">
                    Current timestep
                  </div>
                </div>

                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="text-xs font-semibold text-stone-500">
                    Water depth
                  </div>

                  <div className="mt-2 text-xl font-bold text-stone-900">
                    {currentStep.waterDepth} cm
                  </div>

                  <div className="mt-1 text-xs text-stone-500">
                    Modelled surface depth
                  </div>
                </div>

                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="text-xs font-semibold text-stone-500">
                    Drainage utilisation
                  </div>

                  <div className="mt-2 text-xl font-bold text-stone-900">
                    {currentStep.drainageUtil}%
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          currentStep.drainageUtil,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Model explanation
                    </div>

                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      {currentStep.explanation}
                    </p>
                  </div>

                  <div
                    className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                      riskStyles[currentStep.riskLevel].bg
                    } ${riskStyles[currentStep.riskLevel].text}`}
                  >
                    {currentStep.riskLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* PRIORITY HOTSPOTS */}

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <SectionHeader
                title="Priority hotspots"
                description="Locations requiring operational attention."
              />

              <div className="space-y-3">
                {city.hotspots.slice(0, 5).map((hotspot) => {
                  const style = riskStyles[hotspot.risk];

                  return (
                    <div
                      key={hotspot.id}
                      className="rounded-lg border border-stone-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-stone-900">
                            {hotspot.label}
                          </div>

                          <div className="mt-1 text-xs text-stone-500">
                            {hotspot.zone}
                          </div>
                        </div>

                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-bold ${style.bg} ${style.text}`}
                        >
                          {hotspot.risk}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-stone-400">Depth</div>

                          <div className="mt-0.5 font-semibold text-stone-700">
                            {hotspot.depthMin}–{hotspot.depthMax} cm
                          </div>
                        </div>

                        <div>
                          <div className="text-stone-400">Onset</div>

                          <div className="mt-0.5 font-semibold text-stone-700">
                            {hotspot.onset} min
                          </div>
                        </div>

                        <div>
                          <div className="text-stone-400">Confidence</div>

                          <div className="mt-0.5 font-semibold text-stone-700">
                            {hotspot.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ===================================================
              SECOND OPERATIONAL ROW
              =================================================== */}

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* DRAINAGE OPERATIONS */}

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <SectionHeader
                title="Drainage operations"
                description="Network nodes currently showing hydraulic stress."
              />

              <div className="space-y-3">
                {criticalNodes.slice(0, 5).map((node) => {
                  const statusClass =
                    node.status === "Backflow"
                      ? "text-red-800 bg-red-50"
                      : node.status === "Blocked"
                        ? "text-red-700 bg-red-50"
                        : "text-amber-700 bg-amber-50";

                  return (
                    <div
                      key={node.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-stone-900">
                          {node.label}
                        </div>

                        <div className="mt-1 text-xs text-stone-500">
                          Flow {node.flow} / {node.designCapacity} m³/s
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-bold ${statusClass}`}
                        >
                          {node.status}
                        </span>

                        <div className="mt-1 text-[11px] text-stone-500">
                          {Math.round(
                            (node.flow / node.designCapacity) * 100
                          )}
                          % capacity
                        </div>
                      </div>
                    </div>
                  );
                })}

                {criticalNodes.length === 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    No critical drainage nodes in the current prototype
                    dataset.
                  </div>
                )}
              </div>
            </div>

            {/* INCIDENT MANAGEMENT */}

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <SectionHeader
                title="Incident management"
                description="Citizen reports requiring verification or response."
              />

              <div className="space-y-3">
                {priorityIncidents.map((incident) => {
                  const style = riskStyles[incident.severity];

                  return (
                    <div
                      key={incident.id}
                      className="rounded-lg border border-stone-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-stone-900">
                            {incident.location}
                          </div>

                          <div className="mt-1 text-xs text-stone-500">
                            {incident.type}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${style.bg} ${style.text}`}
                        >
                          {incident.severity}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">
                          {incident.status}
                        </span>

                        <span className="font-medium text-stone-600">
                          {incident.reportedAt}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {priorityIncidents.length === 0 && (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                    No high-priority incidents currently reported.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===================================================
              RESPONSE OVERVIEW
              =================================================== */}

          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
            <SectionHeader
              title="Field response priorities"
              description="Locations that may require physical inspection or emergency response."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {affectedRoads.slice(0, 4).map((hotspot) => {
                const style = riskStyles[hotspot.risk];

                return (
                  <div
                    key={hotspot.id}
                    className={`rounded-lg border p-4 ${style.border}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-stone-900">
                        {hotspot.label}
                      </span>

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          hotspot.risk === "CRITICAL"
                            ? "bg-red-700"
                            : "bg-red-500"
                        }`}
                      />
                    </div>

                    <div className="mt-2 text-xs leading-5 text-stone-600">
                      {hotspot.cause}
                    </div>

                    <div className="mt-3 text-xs font-semibold text-stone-700">
                      Predicted depth: {hotspot.depthMax} cm
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===================================================
              DISCLAIMER
              =================================================== */}

          <div className="mt-6 border-t border-stone-200 pb-8 pt-5">
            <p className="text-xs leading-5 text-stone-400">
              Prototype authority dashboard. Current city, drainage,
              rainfall, hotspot and incident values are demonstration data.
              Production deployment will connect authenticated authority
              accounts to live data, verified GIS assets, model outputs and
              operational response workflows.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}