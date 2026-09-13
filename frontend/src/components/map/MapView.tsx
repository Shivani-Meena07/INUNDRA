import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../../state/AppContext";
import { cityData, RiskLevel } from "../../data/mockData";

const ncrBoundary: [number, number][] = [
  [28.88, 76.84],
  [28.91, 77.02],
  [28.86, 77.18],
  [28.83, 77.32],
  [28.78, 77.47],
  [28.67, 77.53],
  [28.52, 77.50],
  [28.39, 77.38],
  [28.29, 77.20],
  [28.30, 77.04],
  [28.36, 76.91],
  [28.50, 76.82],
  [28.68, 76.80],
  [28.88, 76.84],
];

/*
 * IMPORTANT:
 * City names are lowercase because AppContext / GlobalHeader
 * uses: "delhi", "mumbai", "chennai"
 */

const CITY_LOCATIONS: Record<
  string,
  {
    center: [number, number];
    zoom: number;
  }
> = {
  delhi: {
    center: [28.6139, 77.2090],
    zoom: 10,
  },

  mumbai: {
    center: [19.0760, 72.8777],
    zoom: 10,
  },

  chennai: {
    center: [13.0827, 80.2707],
    zoom: 10,
  },
};

/*
 * Rainfall overlay bounds for each city.
 */

const CITY_BOUNDS: Record<
  string,
  [[number, number], [number, number]]
> = {
  delhi: [
    [28.20, 76.70],
    [29.00, 77.65],
  ],

  mumbai: [
    [18.70, 72.60],
    [19.40, 73.20],
  ],

  chennai: [
    [12.75, 79.90],
    [13.45, 80.55],
  ],
};

/*
 * Flood risk colours.
 */

const riskColors: Record<RiskLevel, string> = {
  CRITICAL: "#991B1B",
  HIGH: "#DC2626",
  MODERATE: "#F59E0B",
  LOW: "#84CC16",
  SAFE: "#16A34A",
};

/*
 * Convert the existing prototype x/y coordinates
 * into geographic Leaflet coordinates.
 *
 * The current mock data uses a 1000 x 750 coordinate space.
 * This keeps mockData.ts unchanged.
 */

function prototypeToLatLng(
  x: number,
  y: number,
  city: string
): [number, number] {
  const bounds =
    CITY_BOUNDS[city] || CITY_BOUNDS.delhi;

  const southWest = L.latLng(
    bounds[0][0],
    bounds[0][1]
  );

  const northEast = L.latLng(
    bounds[1][0],
    bounds[1][1]
  );

  const longitude =
    southWest.lng +
    (x / 1000) *
      (northEast.lng - southWest.lng);

  const latitude =
    northEast.lat -
    (y / 750) *
      (northEast.lat - southWest.lat);

  return [latitude, longitude];
}

export default function MapView() {
  const mapContainer =
    useRef<HTMLDivElement>(null);

  const mapRef =
    useRef<L.Map | null>(null);

  const rainfallOverlayRef =
    useRef<L.ImageOverlay | null>(null);

  const boundaryRef =
    useRef<L.Polygon | null>(null);

  /*
   * Dynamic map layer references.
   */

  const floodZonesRef =
    useRef<L.Polygon[]>([]);

  const hotspotMarkersRef =
    useRef<L.CircleMarker[]>([]);

  const drainageMarkersRef =
    useRef<L.CircleMarker[]>([]);

  const drainageLinesRef =
    useRef<L.Polyline[]>([]);

  const { state, dispatch } = useApp();

  const city = String(state.city);

  /*
   * ==================================================
   * CREATE MAP
   * ==================================================
   */

  useEffect(() => {
    if (!mapContainer.current) return;

    /*
     * Don't create the Leaflet map more than once.
     */

    if (mapRef.current) return;

    const initialLocation =
      CITY_LOCATIONS[city] ||
      CITY_LOCATIONS.delhi;

    const map = L.map(
      mapContainer.current
    ).setView(
      initialLocation.center,
      initialLocation.zoom
    );
    

    mapRef.current = map;

    /*
     * ==================================================
     * OPEN STREET MAP
     * ==================================================
     */

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    /*
     * ==================================================
     * RAINFALL LEGEND
     * ==================================================
     */

    const legend = L.DomUtil.create(
      "div",
      "rainfall-legend"
    );

    legend.style.position = "absolute";
    legend.style.right = "15px";
    legend.style.bottom = "15px";
    legend.style.zIndex = "1000";
    legend.style.background =
      "rgba(255,255,255,0.92)";
    legend.style.padding =
      "10px 12px";
    legend.style.borderRadius = "8px";
    legend.style.boxShadow =
      "0 2px 8px rgba(0,0,0,0.18)";
    legend.style.fontSize = "12px";
    legend.style.lineHeight = "1.5";
    legend.style.minWidth = "180px";

    legend.innerHTML = `
      <div style="
        font-weight:700;
        margin-bottom:8px;
        color:#1f2937;
      ">
        Rainfall Intensity
      </div>

      <div style="
        height:12px;
        width:100%;
        border-radius:6px;
        background:linear-gradient(
          to right,
          #84CC16,
          #FACC15,
          #F97316,
          #DC2626,
          #991B1B
        );
        margin-bottom:6px;
      "></div>

      <div style="
        display:flex;
        justify-content:space-between;
        color:#374151;
        font-size:10px;
      ">
        <span>Low</span>
        <span>Moderate</span>
        <span>Heavy</span>
        <span>Extreme</span>
      </div>

      <div style="
        margin-top:8px;
        color:#6B7280;
        font-size:10px;
      ">
        Demo rainfall visualization
      </div>
    `;

    map
      .getContainer()
      .appendChild(legend);

    /*
     * ==================================================
     * CLEANUP
     * ==================================================
     */

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /*
   * ==================================================
   * CHANGE CITY
   * ==================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const location =
      CITY_LOCATIONS[city] ||
      CITY_LOCATIONS.delhi;

    console.log(
      "Changing map city to:",
      city
    );

    map.flyTo(
      location.center,
      location.zoom,
      {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      }
    );

    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [city]);

  /*
   * ==================================================
   * RAINFALL OVERLAY
   * ==================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    /*
     * Remove old rainfall overlay.
     */

    if (rainfallOverlayRef.current) {
      map.removeLayer(
        rainfallOverlayRef.current
      );

      rainfallOverlayRef.current = null;
    }

    /*
     * Remove old NCR boundary.
     */

    if (boundaryRef.current) {
      map.removeLayer(
        boundaryRef.current
      );

      boundaryRef.current = null;
    }

    /*
     * ==================================================
     * SYNTHETIC RAINFALL VISUALIZATION
     * ==================================================
     *
     * Demo/synthetic rainfall data for now.
     * Later this can be replaced with backend
     * rainfall prediction data.
     */

    const rainfallSvg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1000"
        height="750"
        viewBox="0 0 1000 750"
      >

        <defs>

          <linearGradient
            id="baseRain"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >

            <stop
              offset="0%"
              stop-color="#D1FAE5"
              stop-opacity="0.12"
            />

            <stop
              offset="50%"
              stop-color="#ECFCCB"
              stop-opacity="0.08"
            />

            <stop
              offset="100%"
              stop-color="#D1FAE5"
              stop-opacity="0.12"
            />

          </linearGradient>

          <radialGradient
            id="rainMain"
            cx="50%"
            cy="50%"
            r="50%"
          >

            <stop
              offset="0%"
              stop-color="#F97316"
              stop-opacity="0.82"
            />

            <stop
              offset="22%"
              stop-color="#FACC15"
              stop-opacity="0.78"
            />

            <stop
              offset="48%"
              stop-color="#A3E635"
              stop-opacity="0.58"
            />

            <stop
              offset="75%"
              stop-color="#84CC16"
              stop-opacity="0.30"
            />

            <stop
              offset="100%"
              stop-color="#84CC16"
              stop-opacity="0"
            />

          </radialGradient>

          <radialGradient
            id="rainHeavy"
            cx="50%"
            cy="50%"
            r="50%"
          >

            <stop
              offset="0%"
              stop-color="#DC2626"
              stop-opacity="0.92"
            />

            <stop
              offset="18%"
              stop-color="#EF4444"
              stop-opacity="0.86"
            />

            <stop
              offset="38%"
              stop-color="#F97316"
              stop-opacity="0.82"
            />

            <stop
              offset="58%"
              stop-color="#FACC15"
              stop-opacity="0.68"
            />

            <stop
              offset="78%"
              stop-color="#A3E635"
              stop-opacity="0.35"
            />

            <stop
              offset="100%"
              stop-color="#84CC16"
              stop-opacity="0"
            />

          </radialGradient>

          <radialGradient
            id="rainYellow"
            cx="50%"
            cy="50%"
            r="50%"
          >

            <stop
              offset="0%"
              stop-color="#FDE047"
              stop-opacity="0.72"
            />

            <stop
              offset="45%"
              stop-color="#FACC15"
              stop-opacity="0.48"
            />

            <stop
              offset="75%"
              stop-color="#A3E635"
              stop-opacity="0.24"
            />

            <stop
              offset="100%"
              stop-color="#84CC16"
              stop-opacity="0"
            />

          </radialGradient>

          <radialGradient
            id="rainHotspot"
            cx="50%"
            cy="50%"
            r="50%"
          >

            <stop
              offset="0%"
              stop-color="#991B1B"
              stop-opacity="0.95"
            />

            <stop
              offset="22%"
              stop-color="#DC2626"
              stop-opacity="0.90"
            />

            <stop
              offset="45%"
              stop-color="#F97316"
              stop-opacity="0.72"
            />

            <stop
              offset="70%"
              stop-color="#FACC15"
              stop-opacity="0.40"
            />

            <stop
              offset="100%"
              stop-color="#FACC15"
              stop-opacity="0"
            />

          </radialGradient>

        </defs>

        <rect
          width="1000"
          height="750"
          fill="url(#baseRain)"
        />

        <ellipse
          cx="455"
          cy="350"
          rx="300"
          ry="210"
          fill="url(#rainMain)"
        />

        <ellipse
          cx="735"
          cy="285"
          rx="235"
          ry="190"
          fill="url(#rainHeavy)"
        />

        <ellipse
          cx="650"
          cy="500"
          rx="235"
          ry="170"
          fill="url(#rainMain)"
        />

        <ellipse
          cx="300"
          cy="535"
          rx="270"
          ry="175"
          fill="url(#rainMain)"
        />

        <ellipse
          cx="430"
          cy="165"
          rx="280"
          ry="155"
          fill="url(#rainYellow)"
        />

        <ellipse
          cx="850"
          cy="470"
          rx="170"
          ry="190"
          fill="url(#rainYellow)"
        />

        <ellipse
          cx="130"
          cy="350"
          rx="190"
          ry="220"
          fill="url(#rainYellow)"
        />

        <ellipse
          cx="760"
          cy="315"
          rx="78"
          ry="68"
          fill="url(#rainHotspot)"
        />

        <ellipse
          cx="535"
          cy="425"
          rx="68"
          ry="60"
          fill="url(#rainHotspot)"
        />

      </svg>
    `;

    const svgUrl =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(rainfallSvg);

    const rainfallBounds =
      CITY_BOUNDS[city] ||
      CITY_BOUNDS.delhi;

    const rainfallOverlay =
      L.imageOverlay(
        svgUrl,
        rainfallBounds,
        {
          opacity: 0.50,
          interactive: false,
        }
      );

    rainfallOverlay.addTo(map);

    rainfallOverlayRef.current =
      rainfallOverlay;

    /*
     * ==================================================
     * NCR BOUNDARY
     * ==================================================
     */

    if (city === "delhi") {
      const boundary = L.polygon(
        ncrBoundary,
        {
          color: "#374151",
          weight: 2,
          opacity: 0.85,
          fill: false,
          dashArray: "7, 5",
        }
      );

      boundary.addTo(map);

      boundaryRef.current =
        boundary;
    }
  }, [city]);

  /*
   * ==================================================
   * FLOOD + DRAINAGE DATA LAYERS
   * ==================================================
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const data = cityData[city];

    /*
     * ==================================================
     * CLEAR PREVIOUS DATA LAYERS
     * ==================================================
     */

    floodZonesRef.current.forEach(
      (layer) => {
        map.removeLayer(layer);
      }
    );

    hotspotMarkersRef.current.forEach(
      (layer) => {
        map.removeLayer(layer);
      }
    );

    drainageMarkersRef.current.forEach(
      (layer) => {
        map.removeLayer(layer);
      }
    );

    drainageLinesRef.current.forEach(
      (layer) => {
        map.removeLayer(layer);
      }
    );

    floodZonesRef.current = [];
    hotspotMarkersRef.current = [];
    drainageMarkersRef.current = [];
    drainageLinesRef.current = [];

    /*
     * ==================================================
     * FLOOD RISK ZONES
     * ==================================================
     */

    if (
      state.activeLayers.has("floodRisk")
    ) {
      data.floodZones.forEach(
        (zone) => {
          const points = zone.points
            .split(" ")
            .map((point) => {
              const [x, y] =
                point
                  .split(",")
                  .map(Number);

              return prototypeToLatLng(
                x,
                y,
                city
              );
            });

          const polygon =
            L.polygon(
              points,
              {
                color:
                  riskColors[
                    zone.risk
                  ],
                weight: 1.5,
                opacity: 0.8,
                fillColor:
                  riskColors[
                    zone.risk
                  ],
                fillOpacity: 0.25,
              }
            );

          polygon.bindTooltip(
            `${zone.label} • ${zone.risk}`,
            {
              direction: "top",
            }
          );

          polygon.addTo(map);

          floodZonesRef.current.push(
            polygon
          );
        }
      );
    }

    /*
     * ==================================================
     * FLOOD HOTSPOTS
     * ==================================================
     */

    if (
      state.activeLayers.has("floodRisk")
    ) {
      data.hotspots.forEach(
        (hotspot) => {
          const position =
            prototypeToLatLng(
              hotspot.x,
              hotspot.y,
              city
            );

          const marker =
            L.circleMarker(
              position,
              {
                radius: 9,
                color: "#ffffff",
                weight: 2,
                fillColor:
                  riskColors[
                    hotspot.risk
                  ],
                fillOpacity: 0.95,
              }
            );

          marker.bindTooltip(
            `${hotspot.label} • ${hotspot.risk}`,
            {
              direction: "top",
            }
          );

          marker.on(
            "click",
            () => {
              dispatch({
                type:
                  "SELECT_HOTSPOT",
                id: hotspot.id,
              });
            }
          );

          marker.addTo(map);

          hotspotMarkersRef.current.push(
            marker
          );
        }
      );
    }

    /*
     * ==================================================
     * DRAINAGE NETWORK
     * ==================================================
     */

    if (
      state.activeLayers.has("drainage")
    ) {
      const nodePositions =
        new Map<
          string,
          [number, number]
        >();

      /*
       * Store every drainage node's
       * geographic position.
       */

      data.drainageNodes.forEach(
        (node) => {
          nodePositions.set(
            node.id,
            prototypeToLatLng(
              node.x,
              node.y,
              city
            )
          );
        }
      );

      /*
       * Draw connections between
       * drainage nodes.
       */

      data.drainageEdges.forEach(
        (edge) => {
          const from =
            nodePositions.get(
              edge.from
            );

          const to =
            nodePositions.get(
              edge.to
            );

          if (!from || !to) return;

          const line =
            L.polyline(
              [from, to],
              {
                color: "#6B7280",
                weight: 3,
                opacity: 0.65,
              }
            );

          line.addTo(map);

          drainageLinesRef.current.push(
            line
          );
        }
      );

      /*
       * ==================================================
       * DRAINAGE NODES
       * ==================================================
       */

      const nodeColors: Record<
        string,
        string
      > = {
        Normal: "#16A34A",
        Warning: "#F59E0B",
        Overloaded: "#DC2626",
        Blocked: "#991B1B",
        Backflow: "#7C3AED",
      };

      data.drainageNodes.forEach(
        (node) => {
          const position =
            prototypeToLatLng(
              node.x,
              node.y,
              city
            );

          const marker =
            L.circleMarker(
              position,
              {
                radius: 7,
                color: "#ffffff",
                weight: 2,
                fillColor:
                  nodeColors[
                    node.status
                  ] ||
                  "#6B7280",
                fillOpacity: 1,
              }
            );

          marker.bindTooltip(
            `${node.label} • ${node.status}`,
            {
              direction: "top",
            }
          );

          marker.on(
            "click",
            () => {
              dispatch({
                type:
                  "SELECT_DRAINAGE_NODE",
                id: node.id,
              });
            }
          );

          marker.addTo(map);

          drainageMarkersRef.current.push(
            marker
          );
        }
      );
    }
  }, [
    city,
    state.activeLayers,
    state.timeStep,
    dispatch,
  ]);

  /*
   * ==================================================
   * MAP CONTAINER
   * ==================================================
   */

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  );
}