import { useEffect, useRef, useState } from "react";
import {
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
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

const routePathColors = ["#16A34A", "#D97706", "#DC2626"];

const CITY_LOCATIONS: Record<string, [number, number]> = {
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  chennai: [13.0827, 80.2707],
};

const LOCATION_COORDS: Record<string, [number, number]> = {
  IGDTUW: [28.6655, 77.2322],
  "Connaught Place": [28.6315, 77.2167],
  "India Gate": [28.6129, 77.2295],
  "Delhi Airport": [28.5562, 77.1],
};

function createCurvedRoute(
  start: [number, number],
  control: [number, number],
  end: [number, number]
): [number, number][] {
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
}

interface RouteMapProps {
  selectedRoute: string | null;
  origin: string;
  destination: string;
  showRoutes: boolean;
}

function RouteMap({
  selectedRoute,
  origin,
  destination,
  showRoutes,
}: RouteMapProps) {
  const { state } = useApp();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const originMarker = useRef<L.Marker | null>(null);
  const destinationMarker = useRef<L.Marker | null>(null);

  const routeLines = useRef<L.Polyline[]>([]);

  /*
   * Create Leaflet map.
   */
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const center =
      CITY_LOCATIONS[state.city] ?? CITY_LOCATIONS.delhi;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(center, 11);

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
      originMarker.current = null;
      destinationMarker.current = null;
      routeLines.current = [];
    };
  }, [state.city]);

  /*
   * Draw origin, destination and prototype route geometry.
   *
   * NOTE:
   * These paths are currently demonstration geometry.
   * A future routing API should replace them with actual road-network paths.
   */
  useEffect(() => {
    const map = leafletMap.current;

    if (!map) return;

    const originCoords = LOCATION_COORDS[origin];
    const destinationCoords = LOCATION_COORDS[destination];

    if (!originCoords || !destinationCoords) return;

    if (originMarker.current) {
      originMarker.current.remove();
    }

    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }

    routeLines.current.forEach((line) => line.remove());
    routeLines.current = [];

    originMarker.current = L.marker(originCoords)
      .addTo(map)
      .bindPopup(`<b>Starting location</b><br>${origin}`);

    destinationMarker.current = L.marker(destinationCoords)
      .addTo(map)
      .bindPopup(`<b>Destination</b><br>${destination}`);

    if (!showRoutes) {
      map.setView(originCoords, 12);
      return;
    }

    const [oLat, oLng] = originCoords;
    const [dLat, dLng] = destinationCoords;

    /*
     * Demonstration route 1 — recommended.
     */
    const route1Points = createCurvedRoute(
      originCoords,
      [
        (oLat + dLat) / 2 + 0.015,
        (oLng + dLng) / 2 - 0.01,
      ],
      destinationCoords
    );

    const route1 = L.polyline(route1Points, {
      color: routePathColors[0],
      weight: selectedRoute === "route-1" ? 7 : 5,
      opacity:
        selectedRoute && selectedRoute !== "route-1"
          ? 0.25
          : 0.95,
    }).addTo(map);

    /*
     * Demonstration route 2 — moderate risk.
     */
    const route2Points = createCurvedRoute(
      originCoords,
      [
        (oLat + dLat) / 2 + 0.03,
        (oLng + dLng) / 2 + 0.02,
      ],
      destinationCoords
    );

    const route2 = L.polyline(route2Points, {
      color: routePathColors[1],
      weight: selectedRoute === "route-2" ? 7 : 5,
      opacity:
        selectedRoute && selectedRoute !== "route-2"
          ? 0.25
          : 0.9,
    }).addTo(map);

    /*
     * Demonstration route 3 — high-risk route.
     */
    const route3Points = createCurvedRoute(
      originCoords,
      [
        (oLat + dLat) / 2 - 0.025,
        (oLng + dLng) / 2 + 0.015,
      ],
      destinationCoords
    );

    const route3 = L.polyline(route3Points, {
      color: routePathColors[2],
      weight: selectedRoute === "route-3" ? 7 : 5,
      opacity:
        selectedRoute && selectedRoute !== "route-3"
          ? 0.25
          : 0.9,
      dashArray: "8, 6",
    }).addTo(map);

    routeLines.current = [route1, route2, route3];

    map.fitBounds(
      L.latLngBounds([
        originCoords,
        destinationCoords,
      ]),
      {
        padding: [50, 50],
      }
    );
  }, [
    origin,
    destination,
    showRoutes,
    selectedRoute,
    state.city,
  ]);

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full rounded-[3px] border border-warm-200 overflow-hidden"
        style={{ height: "480px" }}
      />

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-warm-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-green-600" />
          <span>Recommended</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-amber-600" />
          <span>Moderate risk</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-[3px] border-red-600 border-dashed" />
          <span>High risk</span>
        </div>
      </div>
    </div>
  );
}

export default function SafeRouteScreen() {
  const { state, dispatch } = useApp();

  const data = cityData[state.city];

  const [origin, setOrigin] = useState("IGDTUW");
  const [destination, setDestination] = useState("India Gate");
  const [searched, setSearched] = useState(true);

  /*
   * If the city changes, clear the previous route selection.
   */
  useEffect(() => {
    dispatch({
      type: "SELECT_ROUTE",
      id: null,
    });
  }, [state.city, dispatch]);

  const selectedRoute =
    data.routes.find(
      (route) => route.id === state.selectedRoute
    ) ?? null;

  const handleFindRoutes = () => {
    dispatch({
      type: "SELECT_ROUTE",
      id: null,
    });

    setSearched(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck
                size={18}
                className="text-green-700"
              />

              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-green-700">
                Flood-aware routing
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-warm-900">
              Safe Routes — {data.name}
            </h1>

            <p className="text-sm text-warm-500 mt-1 max-w-2xl">
              Compare routes using predicted flood exposure,
              water depth, and known incident conditions.
            </p>
          </div>

          {searched && (
            <button
              onClick={handleFindRoutes}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-warm-200 bg-white text-warm-700 text-xs font-medium rounded-[3px] hover:border-warm-300"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Route search */}
      <div className="bg-white border border-warm-200 rounded-[3px] p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          {/* Origin */}
          <div>
            <label className="block text-[10px] font-mono text-warm-400 uppercase tracking-wide mb-1.5">
              Origin
            </label>

            <div className="relative">
              <MapPin
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon-600"
              />

              <select
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setSearched(false);
                }}
                className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2.5 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
              >
                <option value="IGDTUW">IGDTUW</option>
                <option value="Connaught Place">
                  Connaught Place
                </option>
              </select>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[10px] font-mono text-warm-400 uppercase tracking-wide mb-1.5">
              Destination
            </label>

            <div className="relative">
              <MapPin
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
              />

              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setSearched(false);
                }}
                className="w-full border border-warm-200 rounded-[3px] pl-8 pr-3 py-2.5 text-sm text-warm-800 bg-white focus:border-maroon-600 focus:outline-none"
              >
                <option value="India Gate">India Gate</option>
                <option value="Delhi Airport">
                  Delhi Airport
                </option>
              </select>
            </div>
          </div>

          {/* Search */}
          <button
            onClick={handleFindRoutes}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-[3px] hover:bg-maroon-800 transition-colors"
          >
            <Navigation size={14} />
            Find Safe Routes
          </button>
        </div>

        {!searched && (
          <div className="mt-3 text-[11px] text-warm-500">
            Select both locations, then find routes to update
            the flood-aware comparison.
          </div>
        )}
      </div>

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          {/* MAP */}
          <div>
            <div className="bg-white border border-warm-200 rounded-[3px] p-2">
              <RouteMap
                selectedRoute={state.selectedRoute}
                origin={origin}
                destination={destination}
                showRoutes={searched}
              />
            </div>

            {/* Route interpretation */}
            <div className="mt-3 bg-white border border-warm-200 rounded-[3px] p-3">
              <div className="flex items-start gap-2">
                <Navigation
                  size={14}
                  className="text-maroon-700 mt-0.5 shrink-0"
                />

                <div>
                  <div className="text-xs font-semibold text-warm-800">
                    Flood-aware route selection
                  </div>

                  <p className="text-[11px] text-warm-500 mt-1 leading-relaxed">
                    Routes are compared using predicted water
                    depth and flood exposure. The safest route
                    is preferred over a faster route when flood
                    risk is materially higher.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ROUTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-warm-900">
                  Route comparison
                </h2>

                <p className="text-[10px] text-warm-400 mt-0.5">
                  {data.routes.length} candidate routes
                </p>
              </div>

              <span className="text-[9px] font-mono uppercase tracking-wide text-warm-400">
                Flood exposure
              </span>
            </div>

            {data.routes.map((route, index) => {
              const isSelected =
                state.selectedRoute === route.id;

              const isUnsafe =
                route.floodExposure === "CRITICAL" ||
                route.floodExposure === "HIGH";

              return (
                <button
                  key={route.id}
                  onClick={() =>
                    dispatch({
                      type: "SELECT_ROUTE",
                      id: isSelected ? null : route.id,
                    })
                  }
                  className={`w-full text-left p-4 border rounded-[3px] transition-all ${
                    isSelected
                      ? "border-maroon-300 bg-maroon-50 shadow-sm"
                      : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50/50"
                  }`}
                >
                  {/* Route heading */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1"
                        style={{
                          backgroundColor:
                            routePathColors[index],
                        }}
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-bold text-warm-900">
                            {route.label}
                          </span>

                          <span className="text-[10px] text-warm-500 bg-warm-100 px-1.5 py-0.5 rounded-xs">
                            {route.tag}
                          </span>
                        </div>
                      </div>
                    </div>

                    {route.recommended ? (
                      <div className="flex items-center gap-1 text-green-700 text-[10px] font-semibold shrink-0">
                        <CheckCircle size={12} />
                        Recommended
                      </div>
                    ) : isUnsafe ? (
                      <div className="flex items-center gap-1 text-red-600 text-[10px] font-semibold shrink-0">
                        <AlertTriangle size={12} />
                        Not advised
                      </div>
                    ) : null}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center bg-warm-50 rounded-[3px] p-2">
                      <Clock
                        size={11}
                        className="mx-auto mb-1 text-warm-400"
                      />

                      <div className="font-mono text-sm font-bold text-warm-800">
                        {route.duration}
                      </div>

                      <div className="text-[9px] text-warm-400">
                        minutes
                      </div>
                    </div>

                    <div className="text-center bg-warm-50 rounded-[3px] p-2">
                      <Droplets
                        size={11}
                        className="mx-auto mb-1 text-warm-400"
                      />

                      <div
                        className="font-mono text-sm font-bold"
                        style={{
                          color:
                            riskColor[route.floodExposure],
                        }}
                      >
                        {route.predictedWater}
                      </div>

                      <div className="text-[9px] text-warm-400">
                        cm depth
                      </div>
                    </div>

                    <div className="text-center bg-warm-50 rounded-[3px] p-2">
                      <AlertTriangle
                        size={11}
                        className="mx-auto mb-1 text-warm-400"
                      />

                      <div
                        className="font-mono text-[10px] font-bold"
                        style={{
                          color:
                            riskColor[route.floodExposure],
                        }}
                      >
                        {route.floodExposure}
                      </div>

                      <div className="text-[9px] text-warm-400">
                        exposure
                      </div>
                    </div>
                  </div>

                  <StatusBadge
                    level={route.floodExposure}
                  />

                  <p className="text-[11px] text-warm-500 mt-2.5 leading-relaxed">
                    {route.reason}
                  </p>
                </button>
              );
            })}

            {/* Selected route */}
            {selectedRoute && (
              <div className="border border-green-200 bg-green-50 rounded-[3px] p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle
                    size={14}
                    className="text-green-700 mt-0.5 shrink-0"
                  />

                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      {selectedRoute.recommended
                        ? "Recommended route selected"
                        : "Route selected for inspection"}
                    </div>

                    <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                      Review current road conditions before
                      travelling. Flood conditions can change
                      faster than route updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prototype notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-[3px] px-3 py-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={13}
                  className="text-amber-700 mt-0.5 shrink-0"
                />

                <div className="text-[10px] text-amber-800 leading-relaxed">
                  <strong>Prototype routing:</strong>{" "}
                  route geometry is currently demonstration
                  geometry. Flood-risk values are used to
                  demonstrate the decision layer. Production
                  deployment should connect this module to a
                  road-routing API and live flood/closure data.
                </div>
              </div>
            </div>

            {/* Safety note */}
            <div className="bg-blue-50 border border-blue-200 rounded-[3px] px-3 py-2.5 text-[10px] text-blue-800 leading-relaxed">
              Never enter a flooded road when depth, current,
              visibility, or road stability is uncertain. Follow
              local emergency instructions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}