import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  UserRound,
  Radio,
  ShieldAlert,
} from "lucide-react";

import { useApp } from "../../state/AppContext";
import { cityData, RiskLevel } from "../../data/mockData";

type ResponseStatus =
  | "Awaiting dispatch"
  | "Team assigned"
  | "En route"
  | "On site"
  | "Resolved";

type Priority = "CRITICAL" | "HIGH" | "MODERATE";

interface ResponseItem {
  id: string;
  location: string;
  zone: string;
  priority: Priority;
  cause: string;
  predictedDepth: number;
  onset: number;
  team: string;
  status: ResponseStatus;
  source: "Model forecast" | "Citizen report";
}

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
    text: "text-lime-700",
    bg: "bg-lime-50",
    border: "border-lime-200",
    dot: "bg-lime-600",
  },
  SAFE: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-600",
  },
};

const priorityStyles: Record<
  Priority,
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
      <h2 className="text-base font-bold text-stone-900">
        {title}
      </h2>

      <p className="mt-1 text-xs text-stone-500">
        {description}
      </p>
    </div>
  );
}

function getInitialResponseItems(
  city: typeof cityData[keyof typeof cityData],
): ResponseItem[] {
  return city.hotspots
    .filter(
      (hotspot) =>
        hotspot.risk === "CRITICAL" ||
        hotspot.risk === "HIGH" ||
        hotspot.risk === "MODERATE",
    )
    .slice(0, 6)
    .map((hotspot, index) => ({
      id: `response-${hotspot.id}`,
      location: hotspot.label,
      zone: hotspot.zone,
      priority:
        hotspot.risk === "CRITICAL"
          ? "CRITICAL"
          : hotspot.risk === "HIGH"
            ? "HIGH"
            : "MODERATE",
      cause: hotspot.cause,
      predictedDepth: hotspot.depthMax,
      onset: hotspot.onset,
      team:
        index === 0
          ? "Rapid Response Team A"
          : index === 1
            ? "Drainage Team B"
            : "Unassigned",
      status:
        index === 0
          ? "Team assigned"
          : index === 1
            ? "En route"
            : "Awaiting dispatch",
      source:
        index % 2 === 0
          ? "Model forecast"
          : "Citizen report",
    }));
}

export default function FieldResponseScreen() {
  const { state } = useApp();

  const city = cityData[state.city];

  const [items, setItems] = useState<ResponseItem[]>(() =>
    getInitialResponseItems(city),
  );

  const [filter, setFilter] = useState<
    "All" | "CRITICAL" | "HIGH" | "MODERATE"
  >("All");

  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null,
  );

  const selectedItem = useMemo(
    () =>
      items.find((item) => item.id === selectedId) ??
      null,
    [items, selectedId],
  );

  const filteredItems = useMemo(() => {
    if (filter === "All") {
      return items;
    }

    return items.filter(
      (item) => item.priority === filter,
    );
  }, [items, filter]);

  const criticalItems = items.filter(
    (item) => item.priority === "CRITICAL",
  );

  const activeItems = items.filter(
    (item) =>
      item.status !== "Resolved",
  );

  const teamsDeployed = items.filter(
    (item) =>
      item.status === "En route" ||
      item.status === "On site",
  ).length;

  const handleDispatch = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "En route",
              team:
                item.team === "Unassigned"
                  ? "Rapid Response Team"
                  : item.team,
            }
          : item,
      ),
    );
  };

  const handleAssign = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Team assigned",
              team:
                item.team === "Unassigned"
                  ? "Rapid Response Team"
                  : item.team,
            }
          : item,
      ),
    );
  };

  const handleOnSite = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "On site",
            }
          : item,
      ),
    );
  };

  const handleResolve = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Resolved",
            }
          : item,
      ),
    );
  };

  const statusLabel = (status: ResponseStatus) => {
    switch (status) {
      case "Awaiting dispatch":
        return "Awaiting dispatch";

      case "Team assigned":
        return "Team assigned";

      case "En route":
        return "En route";

      case "On site":
        return "On site";

      case "Resolved":
        return "Resolved";

      default:
        return status;
    }
  };

  return (
    <main className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="mb-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
              Emergency operations
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Field Response
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Prioritize flood locations, assign response teams and
              track operational action from forecast to field response.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Response status
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  criticalItems.length > 0
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              />

              <span className="text-sm font-semibold text-stone-800">
                {criticalItems.length > 0
                  ? "Priority response required"
                  : "No critical response pending"}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          RESPONSE METRICS
          ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <MetricCard
          label="Active priorities"
          value={String(activeItems.length)}
          detail="Locations requiring action"
          alert={activeItems.length > 0}
        />

        <MetricCard
          label="Critical"
          value={String(criticalItems.length)}
          detail="Immediate field attention"
          alert={criticalItems.length > 0}
        />

        <MetricCard
          label="Teams deployed"
          value={String(teamsDeployed)}
          detail="Currently en route / on site"
        />

        <MetricCard
          label="Awaiting dispatch"
          value={String(
            items.filter(
              (item) =>
                item.status === "Awaiting dispatch",
            ).length,
          )}
          detail="No field team assigned"
        />

        <MetricCard
          label="Resolved"
          value={String(
            items.filter(
              (item) => item.status === "Resolved",
            ).length,
          )}
          detail="Closed response items"
        />

      </section>

      {/* =====================================================
          CRITICAL RESPONSE ALERT
          ===================================================== */}

      {criticalItems.length > 0 && (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <ShieldAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-700"
            />

            <div>
              <div className="text-sm font-bold text-red-900">
                Critical field response required
              </div>

              <p className="mt-1 text-sm leading-6 text-red-800">
                {criticalItems.length} critical location
                {criticalItems.length === 1 ? "" : "s"} currently
                require immediate operational attention.
              </p>
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          FILTER
          ===================================================== */}

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">

        <div className="mb-4">
          <h2 className="text-base font-bold text-stone-900">
            Response queue
          </h2>

          <p className="mt-1 text-xs text-stone-500">
            Prioritized locations generated from the current
            prototype flood intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {(
            [
              "All",
              "CRITICAL",
              "HIGH",
              "MODERATE",
            ] as const
          ).map((item) => {

            const active = filter === item;

            const count =
              item === "All"
                ? items.length
                : items.filter(
                    (response) =>
                      response.priority === item,
                  ).length;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-red-800 bg-red-50 text-red-800"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {item}

                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          MAIN RESPONSE GRID
          ===================================================== */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

        {/* ===================================================
            RESPONSE LIST
            =================================================== */}

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <SectionHeader
            title="Priority locations"
            description="Locations ranked for field inspection or emergency response."
          />

          <div className="space-y-3">

            {filteredItems.map((item) => {

              const priority =
                priorityStyles[item.priority];

              const selected =
                selectedId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedId(item.id)
                  }
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selected
                      ? "border-red-300 bg-red-50/40"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${priority.dot}`}
                        />

                        <span className="truncate text-sm font-bold text-stone-900">
                          {item.location}
                        </span>

                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                        <MapPin size={11} />
                        {item.zone}
                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <span
                        className={`rounded-md border px-2 py-1 text-[10px] font-bold ${priority.bg} ${priority.text} ${priority.border}`}
                      >
                        {item.priority}
                      </span>

                      <span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600">
                        {statusLabel(item.status)}
                      </span>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-stone-400">
                        Depth
                      </div>

                      <div className="mt-1 text-sm font-bold text-stone-800">
                        {item.predictedDepth} cm
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-stone-400">
                        Onset
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-sm font-bold text-stone-800">
                        <Clock size={12} />
                        {item.onset} min
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-stone-400">
                        Team
                      </div>

                      <div className="mt-1 truncate text-sm font-semibold text-stone-800">
                        {item.team}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-stone-400">
                        Source
                      </div>

                      <div className="mt-1 text-xs font-semibold text-stone-700">
                        {item.source}
                      </div>
                    </div>

                  </div>

                </button>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
                No response locations match the selected priority.
              </div>
            )}

          </div>
        </div>

        {/* ===================================================
            SELECTED RESPONSE
            =================================================== */}

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <SectionHeader
            title="Response action"
            description="Operational controls for the selected priority location."
          />

          {selectedItem ? (
            <div>

              <div
                className={`rounded-lg border p-4 ${
                  priorityStyles[selectedItem.priority].border
                } ${
                  priorityStyles[selectedItem.priority].bg
                }`}
              >

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <div className="text-base font-bold text-stone-900">
                      {selectedItem.location}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-600">
                      <MapPin size={11} />
                      {selectedItem.zone}
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                      priorityStyles[
                        selectedItem.priority
                      ].text
                    } ${
                      priorityStyles[
                        selectedItem.priority
                      ].bg
                    }`}
                  >
                    {selectedItem.priority}
                  </span>

                </div>

              </div>

              {/* Situation */}

              <div className="mt-5">

                <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Situation
                </div>

                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {selectedItem.cause}
                </p>

              </div>

              {/* Metrics */}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="text-blue-600">
                      <MapPin size={12} />
                    </span>
                    Predicted depth
                  </div>

                  <div className="mt-1 text-lg font-bold text-stone-900">
                    {selectedItem.predictedDepth} cm
                  </div>
                </div>

                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock size={12} />
                    Expected onset
                  </div>

                  <div className="mt-1 text-lg font-bold text-stone-900">
                    {selectedItem.onset} min
                  </div>
                </div>

              </div>

              {/* Team */}

              <div className="mt-5 rounded-lg border border-stone-200 p-4">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                      Assigned team
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-800">
                      <UserRound size={14} />
                      {selectedItem.team}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
                      Status
                    </div>

                    <div className="mt-1 text-xs font-semibold text-stone-700">
                      {selectedItem.status}
                    </div>
                  </div>

                </div>

              </div>

              {/* Action buttons */}

              <div className="mt-5 space-y-2">

                {selectedItem.status ===
                  "Awaiting dispatch" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAssign(selectedItem.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900"
                  >
                    <UserRound size={15} />
                    Assign Response Team
                  </button>
                )}

                {selectedItem.status ===
                  "Team assigned" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDispatch(selectedItem.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900"
                  >
                    <Radio size={15} />
                    Dispatch Team
                  </button>
                )}

                {selectedItem.status ===
                  "En route" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOnSite(selectedItem.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900"
                  >
                    <MapPin size={15} />
                    Mark Team On Site
                  </button>
                )}

                {selectedItem.status ===
                  "On site" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleResolve(selectedItem.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    <CheckCircle size={15} />
                    Mark Response Resolved
                  </button>
                )}

                {selectedItem.status ===
                  "Resolved" && (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                    <CheckCircle size={15} />
                    Response resolved
                  </div>
                )}

              </div>

              {/* Operational note */}

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">

                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <p className="text-xs leading-5 text-amber-800">
                  Predicted conditions support prioritization.
                  Field teams should verify actual road and
                  drainage conditions before taking operational action.
                </p>

              </div>

            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
              Select a response location to inspect its
              operational details.
            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          RESPONSE WORKFLOW
          ===================================================== */}

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">

        <SectionHeader
          title="Field response workflow"
          description="Operational progression from model signal to verified field action."
        />

        <div className="grid gap-3 md:grid-cols-5">

          {[
            {
              title: "Detect",
              description: "Flood risk identified",
              icon: <AlertTriangle size={16} />,
            },
            {
              title: "Prioritize",
              description: "Location ranked",
              icon: <ShieldAlert size={16} />,
            },
            {
              title: "Assign",
              description: "Team selected",
              icon: <UserRound size={16} />,
            },
            {
              title: "Dispatch",
              description: "Team sent",
              icon: <Radio size={16} />,
            },
            {
              title: "Verify",
              description: "Field condition confirmed",
              icon: <CheckCircle size={16} />,
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-lg border border-stone-200 p-4"
            >

              <div className="flex items-center gap-2 text-red-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                  {step.icon}
                </span>

                <span className="text-sm font-bold text-stone-900">
                  {index + 1}. {step.title}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-stone-500">
                {step.description}
              </p>

            </div>
          ))}

        </div>

      </section>

      {/* =====================================================
          IMPORTANT DISTINCTION
          ===================================================== */}

      <section className="mt-6 grid gap-6 md:grid-cols-2">

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <div className="flex items-center gap-2">
            <AlertTriangle
              size={16}
              className="text-red-700"
            />

            <h2 className="text-sm font-bold text-stone-900">
              Model signal
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Predicted flood depth, onset and risk are used to
            prioritize where authorities should consider sending
            field resources.
          </p>

        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <div className="flex items-center gap-2">
            <CheckCircle
              size={16}
              className="text-green-700"
            />

            <h2 className="text-sm font-bold text-stone-900">
              Field verification
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Actual road, drainage and water conditions should be
            verified by field teams before an incident is treated
            as confirmed operational ground truth.
          </p>

        </div>

      </section>

      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <div className="mt-6 border-t border-stone-200 pt-5 pb-8">

        <p className="text-xs leading-5 text-stone-400">
          Prototype field response module. Team assignments,
          response states and operational actions are local
          demonstration state. Production deployment will connect
          this workflow to authenticated authority accounts,
          dispatch systems, verified incidents, live GIS data and
          field-team updates.
        </p>

      </div>

    </main>
  );
}