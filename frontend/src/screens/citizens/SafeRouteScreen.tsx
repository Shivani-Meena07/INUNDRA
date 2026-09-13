import { useState, useEffect, useRef } from "react";
import { Navigation, AlertTriangle, CheckCircle, Clock, Droplets, MapPin } from "lucide-react";
import { useApp } from "../../state/AppContext";
import { cityData, RiskLevel } from "../../data/mockData";
import StatusBadge from "../../components/ui/StatusBadge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

function RouteMap({
  selectedRoute,
  origin,
  destination,
  showRoutes,
}: {
  selectedRoute: string | null;
  origin: string;
  destination: string;
  showRoutes: boolean;
}) {
  const { state } = useApp();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const originMarker = useRef<L.Marker | null>(null);
  const destinationMarker = useRef<L.Marker | null>(null);

  const routeLines = useRef<L.Polyline[]>([]);

  const CITY_LOCATIONS: Record<string, [number, number]> = {
    delhi: [28.6139, 77.2090],
    mumbai: [19.0760, 72.8777],
    chennai: [13.0827, 80.2707],
  };

  const LOCATION_COORDS: Record<string, [number, number]> = {
    "IGDTUW": [28.6655, 77.2322],
    "Connaught Place": [28.6315, 77.2167],
    "India Gate": [28.6129, 77.2295],
    "Delhi Airport": [28.5562, 77.1000],
  };
  
  const createCurvedRoute = (
  start: [number, number],
  control: [number, number],
  end: [number, number]
): [number, number][] => {
  const points: [number, number][] = [];

  for (let i = 0; i <= 40; i++) {
    const t = i / 40;

    const lat =
      (1 - t) * (1 - t) * start[0] +
      2 * (1 - t) * t * control[0] +
      t * t * end[0];

    const lng =
      (1 - t) * (1 - t) * start[1] +
      2 * (1 - t) * t * control[1] +
      t * t * end[1];

    points.push([lat, lng]);
  }

  return points;
};

  // Create the map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const center =
      CITY_LOCATIONS[state.city] || CITY_LOCATIONS.delhi;

    const map = L.map(mapRef.current).setView(center, 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
      originMarker.current = null;
      destinationMarker.current = null;
      routeLines.current = [];
    };
  }, [state.city]);

  // Update markers and routes whenever the dropdown selection changes
  useEffect(() => {
    const map = leafletMap.current;

    if (!map) return;

    const originCoords = LOCATION_COORDS[origin];
    const destinationCoords = LOCATION_COORDS[destination];

    if (!originCoords || !destinationCoords) return;

    // Remove old markers
    if (originMarker.current) {
      originMarker.current.remove();
    }

    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }

    // Remove old routes
    routeLines.current.forEach(line => line.remove());
    routeLines.current = [];

    // Origin marker
    originMarker.current = L.marker(originCoords)
      .addTo(map)
      .bindPopup(`<b>Starting Location</b><br>${origin}`);

    // Destination marker
    destinationMarker.current = L.marker(destinationCoords)
      .addTo(map)
      .bindPopup(`<b>Destination</b><br>${destination}`);

    originMarker.current.openPopup();

    // Show three routes only after Find Safe Routes
    if (showRoutes) {
      const [oLat, oLng] = originCoords;
      const [dLat, dLng] = destinationCoords;

      // Green — fastest / recommended
      const route1Points = createCurvedRoute(
  [oLat, oLng],
  [
    (oLat + dLat) / 2 + 0.015,
    (oLng + dLng) / 2 - 0.010,
  ],
  [dLat, dLng]
);

const route1 = L.polyline(route1Points, {
  color: "#16A34A",
  weight: selectedRoute === "route-1" ? 7 : 5,
  opacity:
    selectedRoute && selectedRoute !== "route-1" ? 0.3 : 0.95,
}).addTo(map);


const route2Points = createCurvedRoute(
  [oLat, oLng],
  [
    (oLat + dLat) / 2 + 0.030,
    (oLng + dLng) / 2 + 0.020,
  ],
  [dLat, dLng]
);

const route2 = L.polyline(route2Points, {
  color: "#F97316",
  weight: selectedRoute === "route-2" ? 7 : 5,
  opacity:
    selectedRoute && selectedRoute !== "route-2" ? 0.3 : 0.9,
}).addTo(map);


const route3Points = createCurvedRoute(
  [oLat, oLng],
  [
    (oLat + dLat) / 2 - 0.025,
    (oLng + dLng) / 2 + 0.015,
  ],
  [dLat, dLng]
);

const route3 = L.polyline(route3Points, {
  color: "#DC2626",
  weight: selectedRoute === "route-3" ? 7 : 5,
  opacity:
    selectedRoute && selectedRoute !== "route-3" ? 0.3 : 0.9,
  dashArray: "8, 6",
}).addTo(map);
      routeLines.current = [route1, route2, route3];

      // Fit map around both locations
      map.fitBounds(
        L.latLngBounds([originCoords, destinationCoords]),
        {
          padding: [50, 50],
        }
      );
    }
  }, [origin, destination, showRoutes, selectedRoute, state.city]);

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full rounded-[3px] border border-warm-200 overflow-hidden"
        style={{ height: "480px" }}
      />

      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-warm-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-green-600" />
          <span>Fastest / Recommended</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-orange-500" />
          <span>Moderate risk</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-red-600 border-dashed" />
          <span>Not advisable</span>
        </div>
      </div>
    </div>
  );
}

export default function SafeRouteScreen() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const [origin, setOrigin] = useState("IGDTUW");
  const [destination, setDestination] =  useState("India Gate");
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
              <select
  value={origin}
  onChange={e => setOrigin(e.target.value)}
  className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
>
  <option value="IGDTUW">IGDTUW</option>
  <option value="Connaught Place">Connaught Place</option>
</select>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-warm-400 uppercase tracking-wide mb-1.5">Destination</label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
              <select
  value={destination}
  onChange={e => setDestination(e.target.value)}
  className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
>
  <option value="India Gate">India Gate</option>
  <option value="Delhi Airport">Delhi Airport</option>
</select>
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
            <RouteMap
  selectedRoute={state.selectedRoute}
  origin={origin}
  destination={destination}
  showRoutes={searched}
/>
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
                  className={`w-full text-left p-4 border rounded-sm transition-all ${
                    isSelected
                      ? "border-maroon-300 bg-maroon-50 shadow-sm"
                      : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: routePathColors[i] }} />
                      <span className="text-sm font-bold text-warm-900">{route.label}</span>
                      <span className="text-xs text-warm-500 bg-warm-100 px-1.5 py-0.5 rounded-xs">{route.tag}</span>
                    </div>
                    {route.recommended && (
                      <div className="flex items-center gap-1 text-green-700 text-[11px] font-medium">
                        <CheckCircle size={12} />
                        <span>Recommended</span>
                      </div>
                    )}
                   {!route.recommended &&
(route.floodExposure === "CRITICAL" ||
route.floodExposure === "HIGH") ? (
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
