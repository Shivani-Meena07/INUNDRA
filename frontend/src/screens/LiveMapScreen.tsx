import { useState } from "react";
import { Plus, Minus, Locate, Layers, Info, X, AlertTriangle, Clock, Droplets, Activity } from "lucide-react";
import { useApp } from "../state/AppContext";
import { cityData, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";

const LAYERS = [
  { key: "floodRisk", label: "Flood Risk" },
  { key: "rainfall", label: "Rainfall" },
  { key: "drainage", label: "Drainage" },
  { key: "blockages", label: "Blockages" },
  { key: "waterDepth", label: "Water Depth" },
  { key: "safeRoutes", label: "Safe Routes" },
];

const riskFill: Record<RiskLevel, string> = {
  CRITICAL: "rgba(220,38,38,0.22)",
  HIGH: "rgba(217,119,6,0.20)",
  MODERATE: "rgba(202,138,4,0.16)",
  LOW: "rgba(22,163,74,0.10)",
  SAFE: "rgba(22,163,74,0.08)",
};

const riskStroke: Record<RiskLevel, string> = {
  CRITICAL: "rgba(220,38,38,0.7)",
  HIGH: "rgba(217,119,6,0.6)",
  MODERATE: "rgba(202,138,4,0.55)",
  LOW: "rgba(22,163,74,0.4)",
  SAFE: "rgba(22,163,74,0.3)",
};

const nodeColors: Record<string, string> = {
  Normal: "#16A34A",
  Warning: "#D97706",
  Overloaded: "#DC2626",
  Blocked: "#991B1B",
  Backflow: "#7C3AED",
};

const timeStepRiskColors: RiskLevel[] = ["HIGH", "HIGH", "CRITICAL", "HIGH", "MODERATE"];

export default function LiveMapScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const ts = data.timeSteps[state.timeStep];
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const selectedHotspot = data.hotspots.find(h => h.id === state.selectedHotspot);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 88px)" }}>
      {/* Forecast time strip */}
      <div className="flex items-stretch bg-warm-900 border-b border-warm-800 overflow-x-auto shrink-0">
        {data.timeSteps.map((step, i) => (
          <button
            key={i}
            onClick={() => dispatch({ type: "SET_TIME_STEP", step: i })}
            className={`flex-1 min-w-[100px] px-3 py-2.5 border-r border-warm-800 text-left transition-colors ${
              state.timeStep === i ? "bg-maroon-700" : "hover:bg-warm-800"
            }`}
          >
            <div className="text-[10px] font-mono text-warm-300 mb-0.5">{step.label}</div>
            <div className="text-white font-bold text-sm font-mono">{step.rainfall} mm/hr</div>
            <div className={`text-[10px] font-medium mt-0.5 ${
              step.riskLevel === "CRITICAL" ? "text-red-300" :
              step.riskLevel === "HIGH" ? "text-amber-300" :
              step.riskLevel === "MODERATE" ? "text-yellow-300" : "text-green-300"
            }`}>{step.riskLevel}</div>
          </button>
        ))}
      </div>

      {/* Map area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* SVG Map */}
        <div className="flex-1 relative bg-[#EAE8E3] overflow-hidden">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s" }}
            onClick={(e) => {
              const target = e.target as SVGElement;
              if (!target.dataset.hotspot) dispatch({ type: "SELECT_HOTSPOT", id: null });
            }}
          >
            {/* Map background */}
            <rect width="800" height="500" fill="#EAE8E3" />

            {/* Block grid pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#E6E3DD" />
                <rect x="2" y="2" width="36" height="36" fill="#EDEBE7" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* Roads */}
            {data.roads.map((road, i) => (
              <path
                key={i}
                d={road.d}
                stroke={road.major ? "#D4CEC7" : "#DEDAD5"}
                strokeWidth={road.major ? 4 : 2}
                fill="none"
              />
            ))}
            {data.roads.map((road, i) => (
              road.major && (
                <path
                  key={`r-${i}`}
                  d={road.d}
                  stroke="#FFF8F2"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="0"
                />
              )
            ))}

            {/* Water body */}
            <polygon
              points={data.waterBody}
              fill="rgba(37,99,235,0.18)"
              stroke="rgba(37,99,235,0.4)"
              strokeWidth="1.5"
            />

            {/* Flood zones (if layer active) */}
            {state.activeLayers.has("floodRisk") && data.floodZones.map(fz => (
              <polygon
                key={fz.id}
                points={fz.points}
                fill={riskFill[fz.risk]}
                stroke={riskStroke[fz.risk]}
                strokeWidth="1.5"
                strokeDasharray={fz.risk === "CRITICAL" ? "4,2" : "0"}
              />
            ))}

            {/* Drainage lines */}
            {state.activeLayers.has("drainage") && data.drainageLines.map((line, i) => (
              <path
                key={i}
                d={line}
                stroke="rgba(37,99,235,0.5)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="4,3"
              />
            ))}

            {/* Drainage nodes */}
            {state.activeLayers.has("drainage") && data.drainageNodes.map(node => (
              <g key={node.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT_DRAINAGE_NODE", id: node.id }); }}>
                <circle cx={node.x} cy={node.y} r="7" fill={nodeColors[node.status]} opacity="0.25" />
                <circle cx={node.x} cy={node.y} r="4" fill={nodeColors[node.status]} />
                <circle cx={node.x} cy={node.y} r="4" stroke="white" strokeWidth="1" fill="none" />
              </g>
            ))}

            {/* Blockages */}
            {state.activeLayers.has("blockages") && data.drainageNodes.filter(n => n.status === "Blocked" || n.status === "Backflow").map(node => (
              <g key={`b-${node.id}`}>
                <text x={node.x + 6} y={node.y - 6} fontSize="10" fill="#991B1B">✕</text>
              </g>
            ))}

            {/* Water depth overlay */}
            {state.activeLayers.has("waterDepth") && ts.waterDepth > 0 && data.floodZones.filter(fz => fz.risk === "CRITICAL" || fz.risk === "HIGH").map(fz => (
              <polygon
                key={`wd-${fz.id}`}
                points={fz.points}
                fill="rgba(37,99,235,0.15)"
                stroke="rgba(37,99,235,0.3)"
                strokeWidth="1"
              />
            ))}

            {/* Safe route */}
            {state.activeLayers.has("safeRoutes") && (
              <path
                d="M150,420 L280,380 L400,340 L520,260 L640,180"
                stroke="#16A34A"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                strokeLinecap="round"
              />
            )}

            {/* Hotspot markers */}
            {data.hotspots.map(h => (
              <g
                key={h.id}
                className="cursor-pointer"
                data-hotspot={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "SELECT_HOTSPOT", id: state.selectedHotspot === h.id ? null : h.id });
                }}
              >
                <circle cx={h.x} cy={h.y} r="14" fill={riskFill[h.risk]} stroke={riskStroke[h.risk]} strokeWidth="1.5" />
                <circle cx={h.x} cy={h.y} r="6" fill={h.risk === "CRITICAL" ? "#DC2626" : h.risk === "HIGH" ? "#D97706" : "#CA8A04"} />
                {state.selectedHotspot === h.id && (
                  <circle cx={h.x} cy={h.y} r="18" fill="none" stroke={riskStroke[h.risk]} strokeWidth="2" strokeDasharray="4,2" />
                )}
                <text x={h.x} y={h.y + 28} textAnchor="middle" fontSize="9" fill="#4A4540" fontFamily="Inter, sans-serif" fontWeight="500">{h.label.split(" ").slice(0, 2).join(" ")}</text>
              </g>
            ))}

            {/* Rainfall intensity overlay */}
            {state.activeLayers.has("rainfall") && (
              <rect
                width="800" height="500"
                fill={`rgba(37,99,235,${Math.min(0.08, ts.rainfall / 2000)})`}
                pointerEvents="none"
              />
            )}

            {/* Labels */}
            <text x="625" y="78" fontSize="10" fill="rgba(37,99,235,0.7)" fontFamily="Inter, sans-serif" fontStyle="italic">
              {state.city === "delhi" ? "Yamuna" : state.city === "mumbai" ? "Arabian Sea" : "Bay of Bengal"}
            </text>
          </svg>

          {/* Rainfall intensity indicator */}
          {state.activeLayers.has("rainfall") && (
            <div className="absolute top-3 left-3 bg-white/90 border border-warm-200 rounded-[3px] px-2 py-1.5 text-xs">
              <div className="text-[10px] text-warm-500 font-mono mb-0.5">RAINFALL NOW</div>
              <div className="font-bold text-blue-700 font-mono text-base">{ts.rainfall} mm/hr</div>
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="map-ctrl-btn" title="Zoom in">
            <Plus size={16} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))} className="map-ctrl-btn" title="Zoom out">
            <Minus size={16} />
          </button>
          <button onClick={() => setZoom(1)} className="map-ctrl-btn" title="Reset view">
            <Locate size={16} />
          </button>
          <hr className="border-warm-200 my-0.5" />
          <button onClick={() => { setLayerPanelOpen(p => !p); setLegendOpen(false); }} className={`map-ctrl-btn ${layerPanelOpen ? "!bg-maroon-700 !text-white" : ""}`} title="Layers">
            <Layers size={16} />
          </button>
          <button onClick={() => { setLegendOpen(p => !p); setLayerPanelOpen(false); }} className={`map-ctrl-btn ${legendOpen ? "!bg-maroon-700 !text-white" : ""}`} title="Legend">
            <Info size={16} />
          </button>
        </div>

        {/* Layers panel */}
        {layerPanelOpen && (
          <div className="absolute right-14 top-3 w-52 bg-white border border-warm-200 rounded-[3px] shadow-md z-10">
            <div className="px-3 py-2 border-b border-warm-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-warm-800">Map Layers</span>
              <button onClick={() => setLayerPanelOpen(false)}><X size={13} className="text-warm-400" /></button>
            </div>
            {LAYERS.map(layer => (
              <label key={layer.key} className="flex items-center gap-2.5 px-3 py-2 hover:bg-warm-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.activeLayers.has(layer.key)}
                  onChange={() => dispatch({ type: "TOGGLE_LAYER", layer: layer.key })}
                  className="accent-[#8B1A2A]"
                />
                <span className="text-xs text-warm-700">{layer.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Legend */}
        {legendOpen && (
          <div className="absolute right-14 top-3 w-52 bg-white border border-warm-200 rounded-[3px] shadow-md z-10">
            <div className="px-3 py-2 border-b border-warm-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-warm-800">Legend</span>
              <button onClick={() => setLegendOpen(false)}><X size={13} className="text-warm-400" /></button>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "Critical flood risk", color: "bg-red-500" },
                { label: "High flood risk", color: "bg-amber-500" },
                { label: "Moderate flood risk", color: "bg-yellow-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-[1px] ${item.color} opacity-70`} />
                  <span className="text-[11px] text-warm-600">{item.label}</span>
                </div>
              ))}
              <hr className="border-warm-100" />
              {[
                { label: "Overloaded node", color: "bg-red-600" },
                { label: "Warning node", color: "bg-amber-500" },
                { label: "Blocked node", color: "bg-red-900" },
                { label: "Normal node", color: "bg-green-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-[11px] text-warm-600">{item.label}</span>
                </div>
              ))}
              <hr className="border-warm-100" />
              <div className="flex items-center gap-2">
                <div className="w-8 border-t-2 border-dashed border-green-600" />
                <span className="text-[11px] text-warm-600">Safe route</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 border-t border-dashed border-blue-500" />
                <span className="text-[11px] text-warm-600">Drainage line</span>
              </div>
            </div>
          </div>
        )}

        {/* Hotspot detail panel */}
        {selectedHotspot && (
          <div className="absolute left-3 top-3 w-72 bg-white border border-warm-200 rounded-[4px] shadow-lg z-10">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-warm-100">
              <div>
                <div className="text-xs text-warm-500 font-mono">{selectedHotspot.zone}</div>
                <div className="text-sm font-semibold text-warm-900">{selectedHotspot.label}</div>
              </div>
              <button onClick={() => dispatch({ type: "SELECT_HOTSPOT", id: null })} className="text-warm-400 hover:text-warm-700">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-500">Risk Level</span>
                <StatusBadge level={selectedHotspot.risk} size="md" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">PREDICTED DEPTH</div>
                  <div className="font-bold text-warm-900 font-mono">{selectedHotspot.depthMin}–{selectedHotspot.depthMax} cm</div>
                </div>
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">ONSET</div>
                  <div className="font-bold text-warm-900 font-mono">{selectedHotspot.onset} min</div>
                </div>
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">PEAK</div>
                  <div className="font-bold text-warm-900 font-mono">+{selectedHotspot.peakMin} min</div>
                </div>
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">RAINFALL</div>
                  <div className="font-bold text-blue-700 font-mono">{selectedHotspot.rainfall} mm/hr</div>
                </div>
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">DRAINAGE</div>
                  <div className="font-bold text-warm-900 font-mono">{selectedHotspot.drainageCapacity}%</div>
                </div>
                <div className="bg-warm-50 p-2 rounded-[3px]">
                  <div className="text-warm-400 font-mono text-[10px]">CONFIDENCE</div>
                  <div className="font-bold text-warm-900 font-mono">{selectedHotspot.confidence}%</div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-[3px] px-2.5 py-2">
                <div className="text-[10px] font-mono text-amber-700 mb-0.5">PRIMARY CAUSE</div>
                <div className="text-xs text-amber-900">{selectedHotspot.cause}</div>
              </div>
              <button
                onClick={() => dispatch({ type: "SET_TAB", tab: "risk" })}
                className="w-full text-xs text-maroon-700 hover:text-maroon-800 hover:underline text-left"
              >
                View full risk analysis →
              </button>
            </div>
          </div>
        )}

        {/* Forecast summary strip for current step */}
        <div className="absolute bottom-3 left-3 right-16 bg-warm-900/90 text-white rounded-[3px] px-4 py-2.5 text-xs backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle size={13} className={ts.riskLevel === "CRITICAL" ? "text-red-300 shrink-0 mt-0.5" : "text-amber-300 shrink-0 mt-0.5"} />
            <div>
              <span className="font-mono text-warm-300 mr-1.5">{ts.label}:</span>
              <span>{ts.explanation}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .map-ctrl-btn {
          width: 32px;
          height: 32px;
          background: white;
          border: 1px solid #E5E0DA;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A4540;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .map-ctrl-btn:hover {
          background: #F0EDE9;
          color: #1A1714;
        }
      `}</style>
    </div>
  );
}
