import { useApp } from "../state/AppContext";
import { cityData, DrainageNodeStatus } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import { X, Activity } from "lucide-react";

const nodeColors: Record<DrainageNodeStatus, string> = {
  Normal: "#16A34A",
  Warning: "#D97706",
  Overloaded: "#DC2626",
  Blocked: "#991B1B",
  Backflow: "#7C3AED",
};

const nodeFill: Record<DrainageNodeStatus, string> = {
  Normal: "rgba(22,163,74,0.12)",
  Warning: "rgba(217,119,6,0.15)",
  Overloaded: "rgba(220,38,38,0.18)",
  Blocked: "rgba(153,27,27,0.2)",
  Backflow: "rgba(124,58,237,0.15)",
};

function CapacityBar({ value, status }: { value: number; status: DrainageNodeStatus }) {
  const color = value >= 90 ? "#DC2626" : value >= 75 ? "#D97706" : "#16A34A";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-warm-400">CAPACITY</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DrainageScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const selectedNode = data.drainageNodes.find(n => n.id === state.selectedDrainageNode);

  // Build node position map for edge rendering
  const nodePos: Record<string, { x: number; y: number }> = {};
  data.drainageNodes.forEach(n => { nodePos[n.id] = { x: n.x, y: n.y }; });

  const counts = {
    Normal: data.drainageNodes.filter(n => n.status === "Normal").length,
    Warning: data.drainageNodes.filter(n => n.status === "Warning").length,
    Overloaded: data.drainageNodes.filter(n => n.status === "Overloaded").length,
    Blocked: data.drainageNodes.filter(n => n.status === "Blocked").length,
    Backflow: data.drainageNodes.filter(n => n.status === "Backflow").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-warm-900">Drainage Network — {data.name}</h1>
        <p className="text-sm text-warm-500 mt-1">Drainage digital twin · Select a node to inspect</p>
      </div>

      {/* Network summary */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {(Object.entries(counts) as [DrainageNodeStatus, number][]).map(([status, count]) => (
          <div key={status} className="bg-white border border-warm-200 px-3 py-2.5 text-center">
            <div className="text-lg font-bold font-mono" style={{ color: nodeColors[status] }}>{count}</div>
            <div className="text-[10px] text-warm-500 font-mono uppercase">{status}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Network visualization */}
        <div className="flex-1">
          <div className="bg-white border border-warm-200 rounded-[3px]">
            <div className="px-4 py-3 border-b border-warm-100">
              <div className="text-sm font-semibold text-warm-900">Network Schematic</div>
            </div>
            <div className="p-2">
              <svg viewBox="80 100 600 300" className="w-full" style={{ minHeight: "260px" }}>
                {/* Background */}
                <rect x="80" y="100" width="600" height="300" fill="#F8F6F2" rx="3" />

                {/* Grid lines */}
                {[130, 180, 230, 280, 330, 380].map(y => (
                  <line key={y} x1="90" x2="670" y1={y} y2={y} stroke="#E5E0DA" strokeWidth="0.5" />
                ))}
                {[120, 180, 240, 300, 360, 420, 480, 540, 600, 660].map(x => (
                  <line key={x} x1={x} x2={x} y1="105" y2="395" stroke="#E5E0DA" strokeWidth="0.5" />
                ))}

                {/* Edges */}
                {data.drainageEdges.map((edge, i) => {
                  const from = nodePos[edge.from];
                  const to = nodePos[edge.to];
                  if (!from || !to) return null;
                  const fromNode = data.drainageNodes.find(n => n.id === edge.from);
                  const stressed = fromNode && (fromNode.status === "Overloaded" || fromNode.status === "Backflow");
                  return (
                    <g key={i}>
                      <line
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={stressed ? "rgba(220,38,38,0.4)" : "rgba(37,99,235,0.35)"}
                        strokeWidth={stressed ? 2.5 : 1.5}
                        strokeDasharray={stressed ? "5,3" : "3,2"}
                      />
                      {/* Flow arrow */}
                      <circle
                        cx={(from.x + to.x) / 2}
                        cy={(from.y + to.y) / 2}
                        r="3"
                        fill={stressed ? "#DC2626" : "#2563EB"}
                        opacity="0.5"
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {data.drainageNodes.map(node => {
                  const isSelected = state.selectedDrainageNode === node.id;
                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={() => dispatch({ type: "SELECT_DRAINAGE_NODE", id: isSelected ? null : node.id })}
                    >
                      <circle cx={node.x} cy={node.y} r="16" fill={nodeFill[node.status]} />
                      <circle cx={node.x} cy={node.y} r={isSelected ? 10 : 8} fill={nodeColors[node.status]} />
                      <circle cx={node.x} cy={node.y} r={isSelected ? 10 : 8} stroke="white" strokeWidth="1.5" fill="none" />
                      {isSelected && <circle cx={node.x} cy={node.y} r="14" fill="none" stroke={nodeColors[node.status]} strokeWidth="1.5" strokeDasharray="3,2" />}
                      <text x={node.x} y={node.y + 26} textAnchor="middle" fontSize="9" fill="#4A4540" fontFamily="DM Mono, monospace" fontWeight="500">{node.id}</text>
                      {/* Capacity indicator */}
                      <text x={node.x} y={node.y - 20} textAnchor="middle" fontSize="8" fill={nodeColors[node.status]} fontFamily="DM Mono, monospace">{node.capacity}%</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Legend */}
            <div className="px-4 py-2.5 border-t border-warm-100 flex flex-wrap gap-4">
              {(Object.entries(nodeColors) as [DrainageNodeStatus, string][]).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-warm-500 font-mono">{status}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-6 border-t border-dashed border-blue-500" />
                <span className="text-[10px] text-warm-500 font-mono">Flow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node detail panel */}
        <div className="w-full lg:w-80 shrink-0">
          {selectedNode ? (
            <div className="bg-white border border-warm-200 rounded-[3px]">
              <div className="px-4 py-3 border-b border-warm-100 flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-warm-400 mb-0.5">DRAINAGE NODE</div>
                  <div className="text-sm font-bold text-warm-900">{selectedNode.id}</div>
                  <div className="text-xs text-warm-500">{selectedNode.label.split("•")[1]?.trim()}</div>
                </div>
                <button onClick={() => dispatch({ type: "SELECT_DRAINAGE_NODE", id: null })} className="text-warm-400 hover:text-warm-700 mt-1">
                  <X size={14} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warm-500">Status</span>
                  <StatusBadge level={selectedNode.status} size="md" />
                </div>
                <CapacityBar value={selectedNode.capacity} status={selectedNode.status} />
                <hr className="border-warm-100" />
                {[
                  { label: "Flow Rate", value: `${selectedNode.flow} m³/s`, mono: true },
                  { label: "Design Capacity", value: `${selectedNode.designCapacity} m³/s`, mono: true },
                  { label: "Upstream Inflow", value: `${selectedNode.upstreamInflow} m³/s`, mono: true, highlight: selectedNode.upstreamInflow > selectedNode.designCapacity },
                  { label: "Downstream Condition", value: selectedNode.downstreamCondition, mono: false },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-warm-500">{row.label}</span>
                    <span className={`font-medium ${row.mono ? "font-mono" : ""} ${row.highlight ? "text-red-600" : "text-warm-800"}`}>{row.value}</span>
                  </div>
                ))}
                <hr className="border-warm-100" />
                <div className="bg-amber-50 border border-amber-200 rounded-[3px] p-2.5">
                  <div className="text-[10px] font-mono text-amber-700 mb-1">PREDICTED IMPACT</div>
                  <div className="text-xs text-amber-900">{selectedNode.predictedImpact}</div>
                </div>
                {/* Upstream/downstream connections */}
                <div>
                  <div className="text-[10px] font-mono text-warm-400 mb-1.5">NETWORK CONNECTIONS</div>
                  <div className="space-y-1">
                    {data.drainageEdges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, i) => {
                      const isUpstream = edge.to === selectedNode.id;
                      const peerId = isUpstream ? edge.from : edge.to;
                      const peer = data.drainageNodes.find(n => n.id === peerId);
                      return (
                        <button
                          key={i}
                          onClick={() => dispatch({ type: "SELECT_DRAINAGE_NODE", id: peerId })}
                          className="w-full flex items-center justify-between text-xs text-warm-600 hover:text-maroon-700 transition-colors"
                        >
                          <span className="text-[10px] font-mono text-warm-400">{isUpstream ? "↑ UPSTREAM" : "↓ DOWNSTREAM"}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: peer ? nodeColors[peer.status] : "#ccc" }} />
                            {peerId}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-warm-200 rounded-[3px] p-6 text-center text-warm-400">
              <Activity size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a node on the network diagram to inspect its status, flow, and predicted impact.</p>
            </div>
          )}

          {/* All nodes list */}
          <div className="mt-4 bg-white border border-warm-200 rounded-[3px]">
            <div className="px-4 py-2.5 border-b border-warm-100">
              <div className="text-xs font-semibold text-warm-800">All Nodes</div>
            </div>
            <div className="divide-y divide-warm-50 max-h-64 overflow-y-auto">
              {data.drainageNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => dispatch({ type: "SELECT_DRAINAGE_NODE", id: state.selectedDrainageNode === node.id ? null : node.id })}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${state.selectedDrainageNode === node.id ? "bg-maroon-50" : "hover:bg-warm-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColors[node.status] }} />
                    <div>
                      <div className="text-xs font-mono font-medium text-warm-800">{node.id}</div>
                      <div className="text-[10px] text-warm-400">{node.label.split("•")[1]?.trim()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-medium text-warm-700">{node.capacity}%</div>
                    <div className="text-[9px] font-mono" style={{ color: nodeColors[node.status] }}>{node.status}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
