import { useApp } from "../state/AppContext";
import {
  cityData,
  DrainageNodeStatus,
} from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import {
  X,
  Activity,
  AlertTriangle,
  Gauge,
  ArrowDown,
  ArrowUp,
  Waves,
  ShieldAlert,
  Network,
} from "lucide-react";

const nodeColors: Record<
  DrainageNodeStatus,
  string
> = {
  Normal: "#16A34A",
  Warning: "#D97706",
  Overloaded: "#DC2626",
  Blocked: "#991B1B",
  Backflow: "#7C3AED",
};

const nodeFill: Record<
  DrainageNodeStatus,
  string
> = {
  Normal: "rgba(22,163,74,0.12)",
  Warning: "rgba(217,119,6,0.15)",
  Overloaded: "rgba(220,38,38,0.18)",
  Blocked: "rgba(153,27,27,0.20)",
  Backflow: "rgba(124,58,237,0.15)",
};

function CapacityBar({
  value,
}: {
  value: number;
}) {
  const color =
    value >= 90
      ? "#DC2626"
      : value >= 75
      ? "#D97706"
      : "#16A34A";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-warm-400">
          CAPACITY UTILIZATION
        </span>

        <span
          className="font-mono text-xs font-bold"
          style={{ color }}
        >
          {value}%
        </span>
      </div>

      <div className="h-2 bg-warm-100 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${Math.min(value, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function getStatusDescription(
  status: DrainageNodeStatus
) {
  switch (status) {
    case "Normal":
      return "Operating within expected capacity";
    case "Warning":
      return "Approaching hydraulic capacity";
    case "Overloaded":
      return "Hydraulic capacity exceeded";
    case "Blocked":
      return "Flow restriction detected";
    case "Backflow":
      return "Downstream pressure causing reverse flow";
    default:
      return "Status unavailable";
  }
}

export default function DrainageScreen() {
  const { state, dispatch } = useApp();

  const data = cityData[state.city];

  const selectedNode = data.drainageNodes.find(
    (n) =>
      n.id === state.selectedDrainageNode
  );

  // Build node position map
  const nodePos: Record<
    string,
    { x: number; y: number }
  > = {};

  data.drainageNodes.forEach((node) => {
    nodePos[node.id] = {
      x: node.x,
      y: node.y,
    };
  });

  const counts = {
    Normal: data.drainageNodes.filter(
      (n) => n.status === "Normal"
    ).length,

    Warning: data.drainageNodes.filter(
      (n) => n.status === "Warning"
    ).length,

    Overloaded: data.drainageNodes.filter(
      (n) => n.status === "Overloaded"
    ).length,

    Blocked: data.drainageNodes.filter(
      (n) => n.status === "Blocked"
    ).length,

    Backflow: data.drainageNodes.filter(
      (n) => n.status === "Backflow"
    ).length,
  };

  const averageCapacity =
    data.drainageNodes.length > 0
      ? Math.round(
          data.drainageNodes.reduce(
            (sum, node) =>
              sum + node.capacity,
            0
          ) / data.drainageNodes.length
        )
      : 0;

  const criticalNodes =
    data.drainageNodes.filter(
      (node) =>
        node.status === "Blocked" ||
        node.status === "Backflow" ||
        node.status === "Overloaded"
    );

  const mostStressedNode =
    [...data.drainageNodes].sort(
      (a, b) => b.capacity - a.capacity
    )[0];

  const totalFlow = data.drainageNodes.reduce(
    (sum, node) => sum + node.flow,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-wider text-warm-500 mb-1">
          Drainage digital twin
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-warm-900">
              Drainage Network — {data.name}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              Hydraulic network status · Select a node to inspect
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-warm-500">
            <span className="w-2 h-2 rounded-full bg-green-600" />
            Network model active
          </div>
        </div>
      </div>

      {/* Network health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Avg. utilization
            </span>
          </div>

          <div
            className={`text-2xl font-bold font-mono ${
              averageCapacity >= 90
                ? "text-red-700"
                : averageCapacity >= 75
                ? "text-amber-700"
                : "text-green-700"
            }`}
          >
            {averageCapacity}%
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Across monitored nodes
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Network
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Network nodes
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {data.drainageNodes.length}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            {data.drainageEdges.length} connected segments
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Critical nodes
            </span>
          </div>

          <div
            className={`text-2xl font-bold font-mono ${
              criticalNodes.length > 0
                ? "text-red-700"
                : "text-green-700"
            }`}
          >
            {criticalNodes.length}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Overloaded, blocked or backflow
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Waves
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Total flow
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {totalFlow.toFixed(1)}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            m³/s across monitored nodes
          </div>
        </div>
      </div>

      {/* Status distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
        {(
          Object.entries(
            counts
          ) as [
            DrainageNodeStatus,
            number
          ][]
        ).map(([status, count]) => (
          <div
            key={status}
            className="bg-white border border-warm-200 px-3 py-2.5"
          >
            <div
              className="text-lg font-bold font-mono"
              style={{
                color: nodeColors[status],
              }}
            >
              {count}
            </div>

            <div className="text-[10px] text-warm-500 font-mono uppercase">
              {status}
            </div>
          </div>
        ))}
      </div>

      {/* Critical network alert */}
      {criticalNodes.length > 0 && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={17}
              className="text-red-600 mt-0.5 shrink-0"
            />

            <div>
              <div className="text-sm font-semibold text-red-900">
                Drainage stress detected
              </div>

              <p className="text-xs text-red-800 mt-1">
                {criticalNodes.length} node
                {criticalNodes.length !== 1
                  ? "s"
                  : ""}{" "}
                currently show{" "}
                {criticalNodes.some(
                  (n) => n.status === "Blocked"
                )
                  ? "blockage or"
                  : ""}
                hydraulic stress. These locations can amplify surface flooding.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Network visualization */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-warm-200">
            <div className="px-4 py-3 border-b border-warm-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-warm-900">
                    Network Schematic
                  </div>

                  <div className="text-[11px] text-warm-400 font-mono mt-0.5">
                    Nodes = drainage assets · Lines = network connections
                  </div>
                </div>

                <Activity
                  size={15}
                  className="text-warm-400"
                />
              </div>
            </div>

            <div className="p-2 overflow-hidden">
              <svg
                viewBox="80 100 600 300"
                className="w-full"
                style={{
                  minHeight: "280px",
                }}
              >
                {/* Background */}
                <rect
                  x="80"
                  y="100"
                  width="600"
                  height="300"
                  fill="#F8F6F2"
                  rx="3"
                />

                {/* Grid */}
                {[130, 180, 230, 280, 330, 380].map(
                  (y) => (
                    <line
                      key={y}
                      x1="90"
                      x2="670"
                      y1={y}
                      y2={y}
                      stroke="#E5E0DA"
                      strokeWidth="0.5"
                    />
                  )
                )}

                {[120, 180, 240, 300, 360, 420, 480, 540, 600, 660].map(
                  (x) => (
                    <line
                      key={x}
                      x1={x}
                      x2={x}
                      y1="105"
                      y2="395"
                      stroke="#E5E0DA"
                      strokeWidth="0.5"
                    />
                  )
                )}

                {/* Network edges */}
                {data.drainageEdges.map(
                  (edge, i) => {
                    const from =
                      nodePos[edge.from];
                    const to =
                      nodePos[edge.to];

                    if (!from || !to) {
                      return null;
                    }

                    const fromNode =
                      data.drainageNodes.find(
                        (n) =>
                          n.id === edge.from
                      );

                    const toNode =
                      data.drainageNodes.find(
                        (n) =>
                          n.id === edge.to
                      );

                    const stressed =
                      fromNode &&
                      (
                        fromNode.status ===
                          "Overloaded" ||
                        fromNode.status ===
                          "Backflow" ||
                        fromNode.status ===
                          "Blocked"
                      );

                    const edgeColor =
                      stressed
                        ? "#DC2626"
                        : "#2563EB";

                    return (
                      <g key={i}>
                        <line
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke={edgeColor}
                          strokeWidth={
                            stressed ? 2.5 : 1.5
                          }
                          strokeDasharray={
                            stressed
                              ? "5,3"
                              : "3,2"
                          }
                          opacity={
                            stressed ? 0.7 : 0.45
                          }
                        />

                        {/* Flow indicator */}
                        <circle
                          cx={
                            (from.x + to.x) /
                            2
                          }
                          cy={
                            (from.y + to.y) /
                            2
                          }
                          r="3"
                          fill={edgeColor}
                          opacity="0.7"
                        />

                        {/* Direction marker */}
                        <circle
                          cx={
                            from.x * 0.35 +
                            to.x * 0.65
                          }
                          cy={
                            from.y * 0.35 +
                            to.y * 0.65
                          }
                          r="1.5"
                          fill={edgeColor}
                        />
                      </g>
                    );
                  }
                )}

                {/* Nodes */}
                {data.drainageNodes.map(
                  (node) => {
                    const isSelected =
                      state.selectedDrainageNode ===
                      node.id;

                    const isCritical =
                      node.status ===
                        "Blocked" ||
                      node.status ===
                        "Backflow" ||
                      node.status ===
                        "Overloaded";

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onClick={() =>
                          dispatch({
                            type: "SELECT_DRAINAGE_NODE",
                            id: isSelected
                              ? null
                              : node.id,
                          })
                        }
                      >
                        {/* Critical halo */}
                        {isCritical && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="20"
                            fill="none"
                            stroke={
                              nodeColors[
                                node.status
                              ]
                            }
                            strokeWidth="1"
                            strokeDasharray="3,3"
                            opacity="0.45"
                          />
                        )}

                        {/* Status area */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="16"
                          fill={
                            nodeFill[
                              node.status
                            ]
                          }
                        />

                        {/* Node */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={
                            isSelected
                              ? 10
                              : 8
                          }
                          fill={
                            nodeColors[
                              node.status
                            ]
                          }
                        />

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={
                            isSelected
                              ? 10
                              : 8
                          }
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                        />

                        {/* Selection ring */}
                        {isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="14"
                            fill="none"
                            stroke={
                              nodeColors[
                                node.status
                              ]
                            }
                            strokeWidth="1.5"
                            strokeDasharray="3,2"
                          />
                        )}

                        {/* Node ID */}
                        <text
                          x={node.x}
                          y={node.y + 27}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#4A4540"
                          fontFamily="DM Mono, monospace"
                          fontWeight="500"
                        >
                          {node.id}
                        </text>

                        {/* Capacity */}
                        <text
                          x={node.x}
                          y={node.y - 20}
                          textAnchor="middle"
                          fontSize="8"
                          fill={
                            nodeColors[
                              node.status
                            ]
                          }
                          fontFamily="DM Mono, monospace"
                          fontWeight="500"
                        >
                          {node.capacity}%
                        </text>
                      </g>
                    );
                  }
                )}
              </svg>
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 border-t border-warm-100 flex flex-wrap gap-x-4 gap-y-2">
              {(
                Object.entries(
                  nodeColors
                ) as [
                  DrainageNodeStatus,
                  string
                ][]
              ).map(
                ([status, color]) => (
                  <div
                    key={status}
                    className="flex items-center gap-1.5"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <span className="text-[10px] text-warm-500 font-mono">
                      {status}
                    </span>
                  </div>
                )
              )}

              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t border-dashed border-blue-500" />

                <span className="text-[10px] text-warm-500 font-mono">
                  Flow
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-6 border-t-2 border-dashed border-red-500" />

                <span className="text-[10px] text-warm-500 font-mono">
                  Stressed flow
                </span>
              </div>
            </div>
          </div>

          {/* Network interpretation */}
          <div className="bg-warm-50 border border-warm-200 mt-4 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity
                size={14}
                className="text-warm-500"
              />

              <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                Network interpretation
              </span>
            </div>

            <p className="text-xs text-warm-700 leading-relaxed">
              {mostStressedNode
                ? `${mostStressedNode.id} is currently the most capacity-constrained node at ${mostStressedNode.capacity}% utilization. ${
                    criticalNodes.length > 0
                      ? `${criticalNodes.length} critical node${
                          criticalNodes.length !== 1
                            ? "s"
                            : ""
                        } may contribute to downstream surface flooding.`
                      : "No critical drainage failure is currently represented in the model."
                  }`
                : "No drainage node information is available."}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="w-full lg:w-80 shrink-0">
          {selectedNode ? (
            <div className="bg-white border border-warm-200">
              {/* Detail header */}
              <div className="px-4 py-3 border-b border-warm-100 flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-warm-400 mb-0.5">
                    DRAINAGE NODE
                  </div>

                  <div className="text-sm font-bold text-warm-900">
                    {selectedNode.id}
                  </div>

                  <div className="text-xs text-warm-500">
                    {
                      selectedNode.label.split(
                        "•"
                      )[1]
                    }
                  </div>
                </div>

                <button
                  onClick={() =>
                    dispatch({
                      type: "SELECT_DRAINAGE_NODE",
                      id: null,
                    })
                  }
                  className="text-warm-400 hover:text-warm-700 mt-1"
                  aria-label="Close node details"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warm-500">
                    Current status
                  </span>

                  <StatusBadge
                    level={
                      selectedNode.status
                    }
                    size="md"
                  />
                </div>

                <div className="text-[11px] text-warm-500">
                  {getStatusDescription(
                    selectedNode.status
                  )}
                </div>

                {/* Capacity */}
                <CapacityBar
                  value={selectedNode.capacity}
                />

                {/* Hydraulic metrics */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Hydraulic metrics
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        label: "Flow Rate",
                        value: `${selectedNode.flow} m³/s`,
                      },
                      {
                        label: "Design Capacity",
                        value: `${selectedNode.designCapacity} m³/s`,
                      },
                      {
                        label: "Upstream Inflow",
                        value: `${selectedNode.upstreamInflow} m³/s`,
                        highlight:
                          selectedNode.upstreamInflow >
                          selectedNode.designCapacity,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-warm-500">
                          {row.label}
                        </span>

                        <span
                          className={`font-mono font-medium ${
                            row.highlight
                              ? "text-red-600"
                              : "text-warm-800"
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-warm-100" />

                {/* Downstream */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Downstream condition
                  </div>

                  <div
                    className={`border p-3 ${
                      selectedNode.status ===
                        "Blocked" ||
                      selectedNode.status ===
                        "Backflow"
                        ? "bg-red-50 border-red-200"
                        : "bg-warm-50 border-warm-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {selectedNode.status ===
                      "Backflow" ? (
                        <ArrowUp
                          size={14}
                          className="text-purple-600 mt-0.5"
                        />
                      ) : (
                        <ArrowDown
                          size={14}
                          className="text-warm-500 mt-0.5"
                        />
                      )}

                      <div>
                        <div className="text-xs font-medium text-warm-800">
                          {
                            selectedNode.downstreamCondition
                          }
                        </div>

                        <div className="text-[10px] text-warm-500 mt-1">
                          Downstream conditions influence pressure and flow through this node.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Predicted impact */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Predicted impact
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3">
                    <div className="text-xs text-amber-900 leading-relaxed">
                      {
                        selectedNode.predictedImpact
                      }
                    </div>
                  </div>
                </div>

                {/* Connections */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Network connections
                  </div>

                  <div className="space-y-1">
                    {data.drainageEdges
                      .filter(
                        (edge) =>
                          edge.from ===
                            selectedNode.id ||
                          edge.to ===
                            selectedNode.id
                      )
                      .map(
                        (edge, i) => {
                          const isUpstream =
                            edge.to ===
                            selectedNode.id;

                          const peerId =
                            isUpstream
                              ? edge.from
                              : edge.to;

                          const peer =
                            data.drainageNodes.find(
                              (n) =>
                                n.id ===
                                peerId
                            );

                          return (
                            <button
                              key={i}
                              onClick={() =>
                                dispatch({
                                  type: "SELECT_DRAINAGE_NODE",
                                  id: peerId,
                                })
                              }
                              className="w-full flex items-center justify-between px-2 py-2 text-xs text-warm-600 hover:bg-warm-50 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                {isUpstream ? (
                                  <ArrowUp
                                    size={11}
                                  />
                                ) : (
                                  <ArrowDown
                                    size={11}
                                  />
                                )}

                                <span className="text-[9px] font-mono text-warm-400">
                                  {isUpstream
                                    ? "UPSTREAM"
                                    : "DOWNSTREAM"}
                                </span>
                              </span>

                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      peer
                                        ? nodeColors[
                                            peer
                                              .status
                                          ]
                                        : "#ccc",
                                  }}
                                />

                                <span className="font-mono">
                                  {peerId}
                                </span>
                              </span>
                            </button>
                          );
                        }
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-warm-200 p-6 text-center text-warm-400">
              <Activity
                size={32}
                className="mx-auto mb-3 opacity-30"
              />

              <p className="text-sm leading-relaxed">
                Select a node on the network diagram
                to inspect capacity, flow,
                downstream conditions and
                predicted impact.
              </p>
            </div>
          )}

          {/* Most stressed node */}
          {mostStressedNode && (
            <div className="mt-4 bg-white border border-warm-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  size={14}
                  className="text-amber-600"
                />

                <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Highest stress
                </div>
              </div>

              <button
                onClick={() =>
                  dispatch({
                    type: "SELECT_DRAINAGE_NODE",
                    id: mostStressedNode.id,
                  })
                }
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-warm-900">
                    {mostStressedNode.id}
                  </span>

                  <span
                    className="font-mono text-sm font-bold"
                    style={{
                      color:
                        nodeColors[
                          mostStressedNode.status
                        ],
                    }}
                  >
                    {mostStressedNode.capacity}%
                  </span>
                </div>

                <div className="text-xs text-warm-500 mt-1">
                  {mostStressedNode.label
                    .split("•")[1]
                    ?.trim()}
                </div>
              </button>
            </div>
          )}

          {/* All nodes */}
          <div className="mt-4 bg-white border border-warm-200">
            <div className="px-4 py-2.5 border-b border-warm-100">
              <div className="text-xs font-semibold text-warm-800">
                All Nodes
              </div>
            </div>

            <div className="divide-y divide-warm-50 max-h-72 overflow-y-auto">
              {data.drainageNodes.map(
                (node) => (
                  <button
                    key={node.id}
                    onClick={() =>
                      dispatch({
                        type: "SELECT_DRAINAGE_NODE",
                        id:
                          state.selectedDrainageNode ===
                          node.id
                            ? null
                            : node.id,
                      })
                    }
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                      state.selectedDrainageNode ===
                      node.id
                        ? "bg-maroon-50"
                        : "hover:bg-warm-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            nodeColors[
                              node.status
                            ],
                        }}
                      />

                      <div>
                        <div className="text-xs font-mono font-medium text-warm-800">
                          {node.id}
                        </div>

                        <div className="text-[10px] text-warm-400">
                          {
                            node.label.split(
                              "•"
                            )[1]
                          }
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-medium text-warm-700">
                        {node.capacity}%
                      </div>

                      <div
                        className="text-[9px] font-mono"
                        style={{
                          color:
                            nodeColors[
                              node.status
                            ],
                        }}
                      >
                        {node.status}
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}