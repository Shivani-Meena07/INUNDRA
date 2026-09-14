import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  Info,
  Network,
  Waves,
} from "lucide-react";

import { useApp } from "../../state/AppContext";
import { cityData } from "../../data/mockData";

type DrainageFilter =
  | "All"
  | "Normal"
  | "Warning"
  | "Overloaded"
  | "Blocked"
  | "Backflow";

const statusStyles: Record<
  Exclude<DrainageFilter, "All">,
  {
    text: string;
    bg: string;
    border: string;
    dot: string;
  }
> = {
  Normal: {
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-600",
  },
  Warning: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  Overloaded: {
    text: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Blocked: {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-600",
  },
  Backflow: {
    text: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-800",
  },
};

function getStatusStyle(status: string) {
  if (status in statusStyles) {
    return statusStyles[
      status as Exclude<DrainageFilter, "All">
    ];
  }

  return statusStyles.Normal;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  alert = false,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  detail: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`border bg-white px-4 py-3.5 ${
        alert
          ? "border-red-200"
          : "border-warm-200"
      }`}
    >
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

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center border ${
            alert
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-warm-200 bg-warm-50 text-maroon-700"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function AuthorityDrainageScreen() {
  const { state } = useApp();

  const city = cityData[state.city];

  const [filter, setFilter] =
    useState<DrainageFilter>("All");

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(
      city.drainageNodes[0]?.id ?? null
    );

  const nodes = city.drainageNodes;
  const edges = city.drainageEdges;

  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) => node.id === selectedNodeId
      ) ?? null,
    [nodes, selectedNodeId]
  );

  const statusCounts = useMemo(
    () => ({
      Normal: nodes.filter(
        (node) => node.status === "Normal"
      ).length,

      Warning: nodes.filter(
        (node) => node.status === "Warning"
      ).length,

      Overloaded: nodes.filter(
        (node) => node.status === "Overloaded"
      ).length,

      Blocked: nodes.filter(
        (node) => node.status === "Blocked"
      ).length,

      Backflow: nodes.filter(
        (node) => node.status === "Backflow"
      ).length,
    }),
    [nodes]
  );

  const filteredNodes = useMemo(() => {
    if (filter === "All") {
      return nodes;
    }

    return nodes.filter(
      (node) => node.status === filter
    );
  }, [nodes, filter]);

  const highestStressNode = useMemo(() => {
    if (nodes.length === 0) {
      return null;
    }

    return [...nodes].sort((a, b) => {
      const stressA =
        a.designCapacity > 0
          ? a.flow / a.designCapacity
          : 0;

      const stressB =
        b.designCapacity > 0
          ? b.flow / b.designCapacity
          : 0;

      return stressB - stressA;
    })[0];
  }, [nodes]);

  const averageUtilization = useMemo(() => {
    if (nodes.length === 0) {
      return 0;
    }

    const total = nodes.reduce(
      (sum, node) => {
        if (node.designCapacity <= 0) {
          return sum;
        }

        return (
          sum +
          (node.flow / node.designCapacity) * 100
        );
      },
      0
    );

    return Math.round(total / nodes.length);
  }, [nodes]);

  const totalFlow = useMemo(
    () =>
      nodes.reduce(
        (sum, node) => sum + node.flow,
        0
      ),
    [nodes]
  );

  const criticalCount =
    statusCounts.Overloaded +
    statusCounts.Blocked +
    statusCounts.Backflow;

  const filterItems: DrainageFilter[] = [
    "All",
    "Normal",
    "Warning",
    "Overloaded",
    "Blocked",
    "Backflow",
  ];

  return (
    <main className="min-h-full bg-warm-50">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 sm:py-4 lg:px-6">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="border-b border-warm-200 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center bg-maroon-700 text-white">
                  <Network className="h-3.5 w-3.5" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-maroon-700">
                  Authority / Drainage Operations
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-warm-900 sm:text-2xl">
                  Drainage Network Operations
                </h1>

                <span className="border border-warm-200 bg-white px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-warm-500">
                  {city.name}
                </span>
              </div>

              <p className="mt-1 max-w-3xl text-xs text-warm-500 sm:text-sm">
                Monitor network utilization, hydraulic stress,
                blocked nodes and potential backflow requiring
                operational attention.
              </p>
            </div>

            <div
              className={`flex items-center gap-2 border px-3 py-2 ${
                criticalCount > 0
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  criticalCount > 0
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-warm-500">
                  Network status
                </p>

                <p
                  className={`mt-0.5 text-xs font-semibold ${
                    criticalCount > 0
                      ? "text-red-800"
                      : "text-green-800"
                  }`}
                >
                  {criticalCount > 0
                    ? "Operational stress detected"
                    : "Within normal range"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            NETWORK METRICS
        ===================================================== */}

        <section className="mt-4">
          <div className="mb-2.5 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-warm-900 sm:text-base">
                Network overview
              </h2>

              <p className="mt-0.5 text-[11px] text-warm-500">
                Current hydraulic state across monitored drainage
                nodes.
              </p>
            </div>

            <span className="hidden font-mono text-[9px] uppercase tracking-wide text-warm-400 sm:block">
              LIVE NETWORK STATE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-5">
            <MetricCard
              icon={Gauge}
              label="Average utilization"
              value={`${averageUtilization}%`}
              detail="Across monitored nodes"
              alert={averageUtilization >= 80}
            />

            <MetricCard
              icon={Network}
              label="Network nodes"
              value={String(nodes.length)}
              detail={`${edges.length} connected segments`}
            />

            <MetricCard
              icon={AlertTriangle}
              label="Critical nodes"
              value={String(criticalCount)}
              detail="Overloaded / blocked / backflow"
              alert={criticalCount > 0}
            />

            <MetricCard
              icon={Waves}
              label="Total flow"
              value={`${totalFlow.toFixed(1)} m³/s`}
              detail="Current prototype network flow"
            />

            <MetricCard
              icon={Droplets}
              label="Highest stress"
              value={
                highestStressNode
                  ? `${Math.round(
                      (highestStressNode.flow /
                        highestStressNode.designCapacity) *
                        100
                    )}%`
                  : "—"
              }
              detail={
                highestStressNode
                  ? highestStressNode.label
                  : "No monitored nodes"
              }
              alert={
                highestStressNode
                  ? highestStressNode.flow >=
                    highestStressNode.designCapacity
                  : false
              }
            />
          </div>
        </section>

        {/* =====================================================
            NETWORK CONDITION
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Network condition
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  Select a condition to filter monitored drainage
                  nodes.
                </p>
              </div>

              <span className="hidden font-mono text-[9px] uppercase tracking-wide text-warm-400 sm:block">
                NODE STATUS
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-warm-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {filterItems.map((item) => {
              const count =
                item === "All"
                  ? nodes.length
                  : statusCounts[item];

              const active = filter === item;

              const style =
                item === "All"
                  ? {
                      text: "text-warm-700",
                      bg: "bg-warm-100",
                      border: "border-warm-300",
                      dot: "bg-warm-600",
                    }
                  : statusStyles[item];

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`bg-white p-3 text-left transition hover:bg-warm-50 ${
                    active
                      ? "bg-maroon-50 ring-1 ring-inset ring-maroon-700"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${style.dot}`}
                      />

                      <span
                        className={`text-[11px] font-semibold ${
                          active
                            ? "text-maroon-800"
                            : style.text
                        }`}
                      >
                        {item}
                      </span>
                    </div>

                    <span
                      className={`text-base font-bold ${
                        active
                          ? "text-maroon-800"
                          : "text-warm-900"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            CRITICAL ALERT
        ===================================================== */}

        {criticalCount > 0 && (
          <section className="mt-3 border border-red-200 bg-red-50">
            <div className="flex items-start gap-3 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-red-900">
                    Drainage stress requires attention
                  </p>

                  <span className="border border-red-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-700">
                    {criticalCount} CRITICAL
                  </span>
                </div>

                <p className="mt-0.5 text-[11px] leading-4.5 text-red-800">
                  {criticalCount} monitored node
                  {criticalCount === 1 ? "" : "s"} currently
                  show{criticalCount === 1 ? "s" : ""} overloaded,
                  blocked or backflow conditions in the
                  prototype network.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            OPERATIONAL GRID
        ===================================================== */}

        <section className="mt-4 grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">

          {/* ===================================================
              NETWORK SCHEMATIC
          =================================================== */}

          <div className="border border-warm-200 bg-white">
            <div className="border-b border-warm-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-maroon-700" />

                <div>
                  <h2 className="text-sm font-bold text-warm-900">
                    Network schematic
                  </h2>

                  <p className="mt-0.5 text-[11px] text-warm-500">
                    Simplified operational view of monitored nodes
                    and connected drainage segments.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="relative min-h-95 overflow-hidden border border-warm-200 bg-warm-50 sm:min-h-105">

                {/* Background grid */}

                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(120,113,108,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.12) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Network */}

                <div className="absolute inset-0">
                  {edges.map((edge, index) => {
                    const fromNode = nodes.find(
                      (node) => node.id === edge.from
                    );

                    const toNode = nodes.find(
                      (node) => node.id === edge.to
                    );

                    if (!fromNode || !toNode) {
                      return null;
                    }

                    const fromIndex = nodes.findIndex(
                      (node) => node.id === edge.from
                    );

                    const toIndex = nodes.findIndex(
                      (node) => node.id === edge.to
                    );

                    if (
                      fromIndex === -1 ||
                      toIndex === -1
                    ) {
                      return null;
                    }

                    const fromX =
                      12 +
                      ((fromIndex * 17) % 72);

                    const fromY =
                      20 +
                      ((fromIndex * 29) % 60);

                    const toX =
                      12 +
                      ((toIndex * 17) % 72);

                    const toY =
                      20 +
                      ((toIndex * 29) % 60);

                    const dx = toX - fromX;
                    const dy = toY - fromY;

                    const length =
                      Math.sqrt(dx * dx + dy * dy);

                    const angle =
                      (Math.atan2(dy, dx) * 180) /
                      Math.PI;

                    const fromUtilization =
                      fromNode.designCapacity > 0
                        ? fromNode.flow /
                          fromNode.designCapacity
                        : 0;

                    const toUtilization =
                      toNode.designCapacity > 0
                        ? toNode.flow /
                          toNode.designCapacity
                        : 0;

                    const edgeStress =
                      (fromUtilization +
                        toUtilization) /
                      2;

                    const stressed =
                      edgeStress >= 0.8;

                    return (
                      <div
                        key={`${edge.from}-${edge.to}-${index}`}
                        className="absolute origin-left"
                        style={{
                          left: `${fromX}%`,
                          top: `${fromY}%`,
                          width: `${length}%`,
                          transform: `rotate(${angle}deg)`,
                        }}
                      >
                        <div
                          className={`h-0.5 w-full ${
                            stressed
                              ? "bg-red-400"
                              : "bg-warm-300"
                          }`}
                        />

                        <div
                          className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 text-[10px] ${
                            stressed
                              ? "text-red-600"
                              : "text-warm-400"
                          }`}
                        >
                          ›
                        </div>
                      </div>
                    );
                  })}

                  {nodes.map((node, index) => {
                    const x =
                      12 +
                      ((index * 17) % 72);

                    const y =
                      20 +
                      ((index * 29) % 60);

                    const style = getStatusStyle(
                      node.status
                    );

                    const selected =
                      selectedNodeId === node.id;

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() =>
                          setSelectedNodeId(node.id)
                        }
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                        title={node.label}
                      >
                        <span
                          className={`block h-5 w-5 rounded-full border-2 border-white ${style.dot} ${
                            selected
                              ? "ring-4 ring-maroon-200"
                              : ""
                          }`}
                        />

                        <span
                          className={`absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap border border-warm-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold ${
                            selected
                              ? "text-maroon-800"
                              : "text-warm-600"
                          }`}
                        >
                          {node.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}

                <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] border border-warm-200 bg-white/95 p-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-warm-500">
                    Node status
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                    {(
                      [
                        "Normal",
                        "Warning",
                        "Overloaded",
                        "Blocked",
                        "Backflow",
                      ] as const
                    ).map((status) => (
                      <div
                        key={status}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyles[status].dot}`}
                        />

                        <span className="text-[9px] text-warm-600">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              SELECTED NODE
          =================================================== */}

          <div className="border border-warm-200 bg-white">
            <div className="border-b border-warm-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-maroon-700" />

                <div>
                  <h2 className="text-sm font-bold text-warm-900">
                    Selected node
                  </h2>

                  <p className="mt-0.5 text-[11px] text-warm-500">
                    Operational details for the selected drainage
                    asset.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              {selectedNode ? (
                <div>
                  <div className="border border-warm-200 bg-warm-50 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-warm-900">
                          {selectedNode.label}
                        </div>

                        <div className="mt-0.5 font-mono text-[9px] text-warm-500">
                          NODE {selectedNode.id}
                        </div>
                      </div>

                      {(() => {
                        const style =
                          getStatusStyle(
                            selectedNode.status
                          );

                        return (
                          <span
                            className={`flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[9px] font-bold ${style.bg} ${style.border} ${style.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />

                            {selectedNode.status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-warm-100 border-y border-warm-100">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[11px] text-warm-500">
                        Current flow
                      </span>

                      <span className="text-xs font-semibold text-warm-800">
                        {selectedNode.flow} m³/s
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[11px] text-warm-500">
                        Design capacity
                      </span>

                      <span className="text-xs font-semibold text-warm-800">
                        {selectedNode.designCapacity} m³/s
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[11px] text-warm-500">
                        Utilization
                      </span>

                      <span className="text-xs font-semibold text-warm-800">
                        {selectedNode.designCapacity > 0
                          ? Math.round(
                              (selectedNode.flow /
                                selectedNode.designCapacity) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-warm-500">
                        Capacity utilization
                      </span>

                      <span className="font-mono text-[10px] font-semibold text-warm-800">
                        {selectedNode.designCapacity > 0
                          ? Math.round(
                              (selectedNode.flow /
                                selectedNode.designCapacity) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden bg-warm-100">
                      <div
                        className={`h-full ${
                          selectedNode.flow >=
                          selectedNode.designCapacity
                            ? "bg-red-600"
                            : selectedNode.designCapacity >
                                  0 &&
                                selectedNode.flow /
                                  selectedNode.designCapacity >=
                                  0.8
                            ? "bg-amber-500"
                            : "bg-green-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            selectedNode.designCapacity > 0
                              ? (selectedNode.flow /
                                  selectedNode.designCapacity) *
                                  100
                              : 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {(selectedNode.status ===
                    "Blocked" ||
                    selectedNode.status ===
                      "Backflow" ||
                    selectedNode.status ===
                      "Overloaded") && (
                    <div className="mt-4 border border-red-200 bg-red-50 p-3.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-700" />

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-red-800">
                            Operational attention
                          </div>

                          <p className="mt-1 text-[11px] leading-4.5 text-red-700">
                            This node is currently showing a
                            condition that may contribute to
                            reduced drainage performance and
                            localized flooding.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-warm-200 bg-warm-50 p-4 text-xs text-warm-600">
                  Select a node from the network schematic to
                  inspect its operational status.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            NODE TABLE
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Monitored drainage nodes
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  {filteredNodes.length} node
                  {filteredNodes.length === 1
                    ? ""
                    : "s"} shown
                  {filter !== "All"
                    ? ` with ${filter.toLowerCase()} status`
                    : ""}
                  .
                </p>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-wide text-warm-400">
                {filter === "All"
                  ? "ALL NODES"
                  : `${filter.toUpperCase()} FILTER`}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50">
                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Node
                  </th>

                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Status
                  </th>

                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Flow
                  </th>

                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Capacity
                  </th>

                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Utilization
                  </th>

                  <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-warm-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredNodes.map((node) => {
                  const style = getStatusStyle(
                    node.status
                  );

                  const utilization =
                    node.designCapacity > 0
                      ? Math.round(
                          (node.flow /
                            node.designCapacity) *
                            100
                        )
                      : 0;

                  return (
                    <tr
                      key={node.id}
                      className="border-b border-warm-100 last:border-0 hover:bg-warm-50"
                    >
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNodeId(node.id)
                          }
                          className="text-left"
                        >
                          <div className="text-xs font-semibold text-warm-800 hover:text-maroon-800">
                            {node.label}
                          </div>

                          <div className="mt-0.5 font-mono text-[9px] text-warm-400">
                            {node.id}
                          </div>
                        </button>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-bold ${style.bg} ${style.border} ${style.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />

                          {node.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-xs text-warm-700">
                        {node.flow} m³/s
                      </td>

                      <td className="px-3 py-3 text-xs text-warm-700">
                        {node.designCapacity} m³/s
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex min-w-28 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden bg-warm-100">
                            <div
                              className={`h-full ${
                                utilization >= 100
                                  ? "bg-red-600"
                                  : utilization >= 80
                                  ? "bg-amber-500"
                                  : "bg-green-600"
                              }`}
                              style={{
                                width: `${Math.min(
                                  utilization,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="font-mono text-[10px] font-semibold text-warm-700">
                            {utilization}%
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNodeId(node.id)
                          }
                          className="text-[10px] font-bold uppercase tracking-wide text-maroon-800 hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredNodes.length === 0 && (
            <div className="m-4 border border-warm-200 bg-warm-50 p-4 text-xs text-warm-600">
              No drainage nodes match the selected condition.
            </div>
          )}
        </section>

        {/* =====================================================
            OPERATIONAL INTERPRETATION
        ===================================================== */}

        <section className="mt-4 border border-warm-200 bg-white">
          <div className="border-b border-warm-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-maroon-700" />

              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Operational interpretation
                </h2>

                <p className="mt-0.5 text-[11px] text-warm-500">
                  How the current drainage state should be
                  interpreted by an authority operator.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-warm-200 md:grid-cols-3">
            <div className="bg-white p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-orange-600" />

                <div className="text-[10px] font-bold uppercase tracking-wide text-warm-500">
                  Hydraulic stress
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-warm-700">
                Rising utilization indicates that available
                drainage capacity is being consumed by the
                current rainfall and runoff conditions.
              </p>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />

                <div className="text-[10px] font-bold uppercase tracking-wide text-warm-500">
                  Blockage risk
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-warm-700">
                Blocked or highly stressed nodes can reduce
                downstream conveyance and increase localized
                surface-water accumulation.
              </p>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-3.5 w-3.5 text-blue-600" />

                <div className="text-[10px] font-bold uppercase tracking-wide text-warm-500">
                  Flood connection
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-warm-700">
                Drainage stress becomes an important input when
                interpreting predicted inundation hotspots and
                prioritizing field inspection.
              </p>
            </div>
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
            current node, segment, flow and capacity values are
            demonstration data. Production deployment will
            connect this module to verified drainage GIS assets,
            hydraulic model outputs and live operational
            observations.
          </p>
        </div>

        <div className="h-4" />
      </div>
    </main>
  );
}