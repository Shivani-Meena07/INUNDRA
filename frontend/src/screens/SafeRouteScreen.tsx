import { useState } from "react";
import { Navigation, AlertTriangle, CheckCircle, Clock, Droplets, MapPin } from "lucide-react";
import { useApp } from "../state/AppContext";
import { cityData, RiskLevel } from "../data/mockData";
import StatusBadge from "../components/ui/StatusBadge";

const riskColor: Record<RiskLevel, string> = {
  CRITICAL: "#DC2626",
  HIGH: "#D97706",
  MODERATE: "#CA8A04",
  LOW: "#16A34A",
  SAFE: "#16A34A",
};

const routePathColors = ["#D97706", "#16A34A", "#CA8A04"];

const ROUTE_PATHS = [
  "M100,420 L200,380 L280,340 L340,280 L380,240 L430,200 L500,180 L580,160 L660,140",
  "M100,420 L160,400 L200,380 L220,340 L240,300 L280,260 L340,220 L420,200 L520,200 L620,180 L680,160",
  "M100,420 L150,390 L200,360 L240,320 L300,290 L360,270 L420,240 L490,210 L580,190 L660,160",
];

function RouteMap({ selectedRoute }: { selectedRoute: string | null }) {
  const { state } = useApp();
  const data = cityData[state.city];

  return (
    <div className="bg-[#EAE8E3] rounded-[3px] border border-warm-200 overflow-hidden">
      <svg viewBox="0 0 780 480" className="w-full" style={{ minHeight: "220px" }}>
        <rect width="780" height="480" fill="#EAE8E3" />
        <defs>
          <pattern id="routeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#E6E3DD" />
            <rect x="2" y="2" width="36" height="36" fill="#EDEBE7" />
          </pattern>
        </defs>
        <rect width="780" height="480" fill="url(#routeGrid)" />

        {/* Roads */}
        {data.roads.map((road, i) => (
          <path key={i} d={road.d} stroke={road.major ? "#D4CEC7" : "#DEDAD5"} strokeWidth={road.major ? 4 : 2} fill="none" />
        ))}

        {/* Water body */}
        <polygon points={data.waterBody} fill="rgba(37,99,235,0.15)" stroke="rgba(37,99,235,0.35)" strokeWidth="1.5" />

        {/* Flood zones */}
        {data.floodZones.map(fz => (
          <polygon
            key={fz.id}
            points={fz.points}
            fill={fz.risk === "CRITICAL" ? "rgba(220,38,38,0.15)" : "rgba(217,119,6,0.12)"}
            stroke={fz.risk === "CRITICAL" ? "rgba(220,38,38,0.5)" : "rgba(217,119,6,0.4)"}
            strokeWidth="1"
            strokeDasharray="3,2"
          />
        ))}

        {/* All routes (dimmed when one selected) */}
        {data.routes.map((route, i) => {
          const isSelected = selectedRoute === route.id;
          const isOther = selectedRoute !== null && !isSelected;
          return (
            <path
              key={route.id}
              d={ROUTE_PATHS[i] || ROUTE_PATHS[0]}
              stroke={routePathColors[i]}
              strokeWidth={isSelected ? 4 : isOther ? 1.5 : 2.5}
              strokeDasharray={route.recommended ? "0" : "7,4"}
              fill="none"
              opacity={isOther ? 0.25 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Origin / Destination markers */}
        <circle cx="100" cy="420" r="8" fill="#8B1A2A" />
        <circle cx="100" cy="420" r="5" fill="white" />
        <text x="115" y="425" fontSize="10" fill="#4A4540" fontFamily="Inter, sans-serif">{data.origin}</text>

        <circle cx="660" cy="140" r="8" fill="#16A34A" />
        <circle cx="660" cy="140" r="5" fill="white" />
        <text x="640" y="130" fontSize="10" fill="#4A4540" fontFamily="Inter, sans-serif" textAnchor="end">{data.destination}</text>

        {/* Route labels */}
        {data.routes.map((route, i) => {
          const path = ROUTE_PATHS[i];
          if (!path) return null;
          const midX = [350, 360, 350][i];
          const midY = [260, 280, 300][i];
          return (
            <g key={`lbl-${route.id}`}>
              <rect x={midX - 16} y={midY - 10} width="32" height="16" fill="white" opacity="0.9" rx="2" />
              <text x={midX} y={midY + 2} textAnchor="middle" fontSize="9" fill={routePathColors[i]} fontFamily="DM Mono, monospace" fontWeight="500">{route.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function SafeRouteScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const [origin, setOrigin] = useState(data.origin);
  const [destination, setDestination] = useState(data.destination);
  const [searched, setSearched] = useState(true);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-warm-900">Flood-Aware Safe Route — {data.name}</h1>
        <p className="text-sm text-warm-500 mt-1">Routes consider flood depth, road closures, drainage overflow, and predicted onset</p>
      </div>

      {/* Route input */}
      <div className="bg-white border border-warm-200 rounded-[3px] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-warm-400 uppercase tracking-wide mb-1.5">Origin</label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-600" />
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2 text-sm text-warm-800 focus:border-maroon-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-warm-400 uppercase tracking-wide mb-1.5">Destination</label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2 text-sm text-warm-800 focus:border-maroon-600 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => setSearched(true)}
            className="flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white text-sm font-medium rounded-[3px] hover:bg-maroon-800 transition-colors shrink-0"
          >
            <Navigation size={14} />
            Find Safe Routes
          </button>
        </div>
      </div>

      {searched && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="flex-1">
            <RouteMap selectedRoute={state.selectedRoute} />
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-warm-500">
              <div className="flex items-center gap-1.5"><div className="w-5 border-t-2 border-green-600" /><span>Recommended</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 border-t-2 border-dashed border-amber-600" /><span>Not recommended</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 opacity-60 rounded-[1px]" /><span>Flood zone</span></div>
            </div>
          </div>

          {/* Route options */}
          <div className="w-full lg:w-80 shrink-0 space-y-3">
            {data.routes.map((route, i) => {
              const isSelected = state.selectedRoute === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => dispatch({ type: "SELECT_ROUTE", id: isSelected ? null : route.id })}
                  className={`w-full text-left p-4 border rounded-[4px] transition-all ${
                    isSelected
                      ? "border-maroon-300 bg-maroon-50 shadow-sm"
                      : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: routePathColors[i] }} />
                      <span className="text-sm font-bold text-warm-900">{route.label}</span>
                      <span className="text-xs text-warm-500 bg-warm-100 px-1.5 py-0.5 rounded-[2px]">{route.tag}</span>
                    </div>
                    {route.recommended && (
                      <div className="flex items-center gap-1 text-green-700 text-[11px] font-medium">
                        <CheckCircle size={12} />
                        <span>Recommended</span>
                      </div>
                    )}
                    {!route.recommended && route.floodExposure === "CRITICAL" || route.floodExposure === "HIGH" ? (
                      <div className="flex items-center gap-1 text-red-600 text-[11px] font-medium">
                        <AlertTriangle size={12} />
                        <span>Not advised</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2.5">
                    <div className="text-center bg-warm-50 rounded-[3px] p-1.5">
                      <Clock size={11} className="mx-auto mb-0.5 text-warm-400" />
                      <div className="font-mono text-sm font-bold text-warm-800">{route.duration}</div>
                      <div className="text-[9px] text-warm-400">min</div>
                    </div>
                    <div className="text-center bg-warm-50 rounded-[3px] p-1.5">
                      <Droplets size={11} className="mx-auto mb-0.5 text-warm-400" />
                      <div className="font-mono text-sm font-bold" style={{ color: riskColor[route.floodExposure] }}>{route.predictedWater}</div>
                      <div className="text-[9px] text-warm-400">cm depth</div>
                    </div>
                    <div className="text-center bg-warm-50 rounded-[3px] p-1.5">
                      <AlertTriangle size={11} className="mx-auto mb-0.5 text-warm-400" />
                      <div className="font-mono text-[10px] font-bold" style={{ color: riskColor[route.floodExposure] }}>{route.floodExposure}</div>
                      <div className="text-[9px] text-warm-400">exposure</div>
                    </div>
                  </div>
                  <StatusBadge level={route.floodExposure} />
                  <p className="text-[11px] text-warm-500 mt-2 leading-relaxed">{route.reason}</p>
                </button>
              );
            })}

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-[3px] px-3 py-2.5 text-[11px] text-blue-800">
              Routes are updated every 2 minutes as rainfall, drainage conditions, and incident reports change. Always use local judgment when road conditions are unclear.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
