import { useMemo, useState } from "react";
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
        alert
          ? "border-red-200"
          : "border-stone-200"
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

      <p className="mt-1 text-xs text-stone-500">
        {detail}
      </p>
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
    <main className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="mb-6">

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
              Drainage operations
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Drainage Network Operations
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Monitor network utilization, hydraulic stress,
              blocked nodes and potential backflow requiring
              operational attention.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">

            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Network status
            </div>

            <div className="mt-1 flex items-center gap-2">

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  criticalCount > 0
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              />

              <span className="text-sm font-semibold text-stone-800">
                {criticalCount > 0
                  ? "Operational stress detected"
                  : "Within normal range"}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          NETWORK METRICS
          ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <MetricCard
          label="Average utilization"
          value={`${averageUtilization}%`}
          detail="Across monitored nodes"
          alert={averageUtilization >= 80}
        />

        <MetricCard
          label="Network nodes"
          value={String(nodes.length)}
          detail={`${edges.length} connected segments`}
        />

        <MetricCard
          label="Critical nodes"
          value={String(criticalCount)}
          detail="Overloaded / blocked / backflow"
          alert={criticalCount > 0}
        />

        <MetricCard
          label="Total flow"
          value={`${totalFlow.toFixed(1)} m³/s`}
          detail="Current prototype network flow"
        />

        <MetricCard
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

      </section>

      {/* =====================================================
          STATUS DISTRIBUTION
          ===================================================== */}

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">

        <div className="mb-4">

          <h2 className="text-base font-bold text-stone-900">
            Network condition
          </h2>

          <p className="mt-1 text-xs text-stone-500">
            Select a condition to filter the monitored drainage nodes.
          </p>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          {filterItems.map((item) => {

            const count =
              item === "All"
                ? nodes.length
                : statusCounts[item];

            const active = filter === item;

            const style =
              item === "All"
                ? {
                    text: "text-stone-700",
                    bg: "bg-stone-100",
                    border: "border-stone-300",
                    dot: "bg-stone-600",
                  }
                : statusStyles[item];

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-red-800 bg-red-50"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >

                <div className="flex items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                    />

                    <span
                      className={`text-xs font-semibold ${style.text}`}
                    >
                      {item}
                    </span>

                  </div>

                  <span className="text-lg font-bold text-stone-900">
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
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-700" />

            <div>

              <div className="text-sm font-bold text-red-900">
                Drainage stress requires attention
              </div>

              <p className="mt-1 text-sm leading-6 text-red-800">
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

        {/* ===================================================
            NETWORK SCHEMATIC
            =================================================== */}

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <div className="mb-5">

            <h2 className="text-base font-bold text-stone-900">
              Network schematic
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Simplified operational view of monitored nodes
              and connected drainage segments.
            </p>

          </div>

          <div className="relative min-h-105 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">

            {/* Background grid */}

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(120,113,108,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.12) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Flow network */}

            <div className="absolute inset-0">

              {edges.map((edge, index) => {

                /*
                 * DrainageEdge only contains:
                 * { from: string; to: string }
                 *
                 * Therefore we derive segment stress from
                 * the two connected drainage nodes instead
                 * of reading nonexistent edge.flow,
                 * edge.capacity or edge.id properties.
                 */

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

                /*
                 * The current mock data defines flow and
                 * designCapacity on nodes, not segments.
                 *
                 * For this schematic we estimate the segment
                 * stress using the average utilization of the
                 * two connected nodes.
                 */

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
                          : "bg-stone-300"
                      }`}
                    />

                    <div
                      className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 text-[10px] ${
                        stressed
                          ? "text-red-600"
                          : "text-stone-400"
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
                      className={`block h-5 w-5 rounded-full border-2 border-white shadow-sm ${style.dot} ${
                        selected
                          ? "ring-4 ring-red-200"
                          : ""
                      }`}
                    />

                    <span
                      className={`absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${
                        selected
                          ? "text-red-800"
                          : "text-stone-600"
                      }`}
                    >
                      {node.label}
                    </span>

                  </button>
                );
              })}

            </div>

            {/* Legend */}

            <div className="absolute bottom-3 left-3 rounded-lg border border-stone-200 bg-white/95 p-3 shadow-sm">

              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                Node status
              </div>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">

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
                      className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`}
                    />

                    <span className="text-[10px] text-stone-600">
                      {status}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            SELECTED NODE
            =================================================== */}

        <div className="rounded-xl border border-stone-200 bg-white p-5">

          <div className="mb-5">

            <h2 className="text-base font-bold text-stone-900">
              Selected node
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Operational details for the selected drainage asset.
            </p>

          </div>

          {selectedNode ? (
            <div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <div className="text-base font-bold text-stone-900">
                      {selectedNode.label}
                    </div>

                    <div className="mt-1 text-xs text-stone-500">
                      Node {selectedNode.id}
                    </div>

                  </div>

                  {(() => {

                    const style = getStatusStyle(
                      selectedNode.status
                    );

                    return (
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${style.bg} ${style.text}`}
                      >
                        {selectedNode.status}
                      </span>
                    );

                  })()}

                </div>

              </div>

              <div className="mt-4 space-y-3">

                <div className="flex items-center justify-between border-b border-stone-100 pb-3">

                  <span className="text-xs text-stone-500">
                    Current flow
                  </span>

                  <span className="text-sm font-semibold text-stone-800">
                    {selectedNode.flow} m³/s
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-stone-100 pb-3">

                  <span className="text-xs text-stone-500">
                    Design capacity
                  </span>

                  <span className="text-sm font-semibold text-stone-800">
                    {selectedNode.designCapacity} m³/s
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-stone-100 pb-3">

                  <span className="text-xs text-stone-500">
                    Utilization
                  </span>

                  <span className="text-sm font-semibold text-stone-800">

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

              <div className="mt-5">

                <div className="flex items-center justify-between text-xs">

                  <span className="font-semibold text-stone-600">
                    Capacity utilization
                  </span>

                  <span className="font-bold text-stone-800">

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

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">

                  <div
                    className={`h-full rounded-full ${
                      selectedNode.flow >=
                      selectedNode.designCapacity
                        ? "bg-red-600"
                        : selectedNode.designCapacity > 0 &&
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

              {(selectedNode.status === "Blocked" ||
                selectedNode.status === "Backflow" ||
                selectedNode.status === "Overloaded") && (

                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

                  <div className="text-xs font-bold uppercase tracking-wide text-red-800">
                    Operational attention
                  </div>

                  <p className="mt-1 text-xs leading-5 text-red-700">
                    This node is currently showing a
                    condition that may contribute to
                    reduced drainage performance and
                    localized flooding.
                  </p>

                </div>

              )}

            </div>
          ) : (

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              Select a node from the network schematic
              to inspect its operational status.
            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          NODE TABLE
          ===================================================== */}

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">

        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

          <div>

            <h2 className="text-base font-bold text-stone-900">
              Monitored drainage nodes
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              {filteredNodes.length} node
              {filteredNodes.length === 1 ? "" : "s"} shown
              {filter !== "All"
                ? ` with ${filter.toLowerCase()} status`
                : ""}.
            </p>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-180 text-left">

            <thead>

              <tr className="border-b border-stone-200">

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Node
                </th>

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Status
                </th>

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Flow
                </th>

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Capacity
                </th>

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Utilization
                </th>

                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-stone-500">
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
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                  >

                    <td className="px-3 py-3">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedNodeId(node.id)
                        }
                        className="text-left"
                      >

                        <div className="text-sm font-semibold text-stone-800 hover:text-red-800">
                          {node.label}
                        </div>

                        <div className="mt-0.5 text-[11px] text-stone-400">
                          {node.id}
                        </div>

                      </button>

                    </td>

                    <td className="px-3 py-3">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${style.bg} ${style.text}`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                        />

                        {node.status}

                      </span>

                    </td>

                    <td className="px-3 py-3 text-sm text-stone-700">
                      {node.flow} m³/s
                    </td>

                    <td className="px-3 py-3 text-sm text-stone-700">
                      {node.designCapacity} m³/s
                    </td>

                    <td className="px-3 py-3">

                      <div className="flex min-w-28 items-center gap-2">

                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">

                          <div
                            className={`h-full rounded-full ${
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

                        <span className="text-xs font-semibold text-stone-700">
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
                        className="text-xs font-semibold text-red-800 hover:underline"
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

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
            No drainage nodes match the selected condition.
          </div>

        )}

      </section>

      {/* =====================================================
          OPERATIONAL INTERPRETATION
          ===================================================== */}

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">

        <div className="mb-4">

          <h2 className="text-base font-bold text-stone-900">
            Operational interpretation
          </h2>

          <p className="mt-1 text-xs text-stone-500">
            How the current drainage state should be interpreted
            by an authority operator.
          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-lg border border-stone-200 p-4">

            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Hydraulic stress
            </div>

            <p className="mt-2 text-sm leading-6 text-stone-700">
              Rising utilization indicates that available
              drainage capacity is being consumed by the
              current rainfall and runoff conditions.
            </p>

          </div>

          <div className="rounded-lg border border-stone-200 p-4">

            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Blockage risk
            </div>

            <p className="mt-2 text-sm leading-6 text-stone-700">
              Blocked or highly stressed nodes can reduce
              downstream conveyance and increase localized
              surface-water accumulation.
            </p>

          </div>

          <div className="rounded-lg border border-stone-200 p-4">

            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Flood connection
            </div>

            <p className="mt-2 text-sm leading-6 text-stone-700">
              Drainage stress becomes an important input when
              interpreting predicted inundation hotspots and
              prioritizing field inspection.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <div className="mt-6 border-t border-stone-200 pt-5 pb-8">

        <p className="text-xs leading-5 text-stone-400">
          Prototype drainage operations view. Current node,
          segment, flow and capacity values are demonstration
          data. Production deployment will connect this module
          to verified drainage GIS assets, hydraulic model
          outputs and live operational observations.
        </p>

      </div>

    </main>
  );
}