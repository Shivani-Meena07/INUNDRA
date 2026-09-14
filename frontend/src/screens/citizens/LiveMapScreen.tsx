import { useState } from "react";
import {
  Plus,
  Minus,
  Locate,
  Layers,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";

import { useApp } from "../../state/AppContext";
import { cityData } from "../../data/mockData";
import StatusBadge from "../../components/ui/StatusBadge";
import MapView from "../../components/map/MapView";

const LAYERS = [
  {
    key: "floodRisk",
    label: "Flood Risk",
  },
  {
    key: "rainfall",
    label: "Rainfall",
  },
  {
    key: "drainage",
    label: "Drainage",
  },
  {
    key: "blockages",
    label: "Blockages",
  },
  {
    key: "waterDepth",
    label: "Water Depth",
  },
  {
    key: "safeRoutes",
    label: "Safe Routes",
  },
];

export default function LiveMapScreen() {
  const { state, dispatch } = useApp();

  const data = cityData[state.city];
  const ts = data.timeSteps[state.timeStep];

  const [layerPanelOpen, setLayerPanelOpen] =
    useState(false);

  const [legendOpen, setLegendOpen] =
    useState(false);

  const [zoom, setZoom] = useState(1);

  const selectedHotspot =
    data.hotspots.find(
      (hotspot) =>
        hotspot.id === state.selectedHotspot
    );

  return (
    <div
      className="
        flex
        flex-col
        min-h-0
        h-[calc(100dvh-56px)]
        md:h-[calc(100dvh-88px)]
        overflow-hidden
        bg-warm-50
      "
    >
      {/* =====================================================
          FORECAST TIMELINE
      ===================================================== */}

      <div
        className="
          flex
          shrink-0
          items-stretch
          overflow-x-auto
          overflow-y-hidden
          border-b
          border-warm-800
          bg-warm-900
          scrollbar-thin
        "
      >
        {data.timeSteps.map((step, index) => {
          const isSelected =
            state.timeStep === index;

          const isCurrent = index === 0;

          return (
            <button
              key={index}
              onClick={() =>
                dispatch({
                  type: "SET_TIME_STEP",
                  step: index,
                })
              }
              className={`
                relative
                flex-1
                min-w-28
                sm:min-w-31.25
                border-r
                border-warm-800
                px-3
                py-2.5
                text-left
                transition-colors
                ${
                  isSelected
                    ? "bg-maroon-700"
                    : "hover:bg-warm-800"
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    h-0.75
                    bg-maroon-200
                  "
                />
              )}

              {/* Time */}
              <div
                className="
                  mb-1
                  flex
                  items-center
                  gap-1.5
                "
              >
                <span
                  className={`
                    text-[10px]
                    font-mono
                    ${
                      isSelected
                        ? "text-white"
                        : "text-warm-300"
                    }
                  `}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <span
                    className="
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-maroon-200
                    "
                  >
                    Now
                  </span>
                )}
              </div>

              {/* Rainfall */}
              <div
                className="
                  text-sm
                  font-mono
                  font-bold
                  text-white
                  sm:text-base
                "
              >
                {step.rainfall} mm/hr
              </div>

              {/* Risk */}
              <div
                className={`
                  mt-0.5
                  text-[10px]
                  font-medium
                  tracking-wide
                  ${
                    step.riskLevel === "CRITICAL"
                      ? "text-red-300"
                      : step.riskLevel === "HIGH"
                      ? "text-amber-300"
                      : step.riskLevel === "MODERATE"
                      ? "text-yellow-300"
                      : "text-green-300"
                  }
                `}
              >
                {step.riskLevel}
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          MAP AREA
      ===================================================== */}

      <div
        className="
          relative
          z-0
          flex
          min-h-0
          flex-1
          overflow-hidden
          isolate
        "
      >
        {/* ===================================================
            LEAFLET MAP
        =================================================== */}

        <div
          className="
            relative
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
            bg-[#EAE8E3]
          "
        >
          <MapView />

          {/* =================================================
              RAINFALL NOW CARD
          ================================================= */}

          {state.activeLayers.has("rainfall") && (
            <div
              className="
                absolute
                left-3
                top-3
                z-2000
                w-37.5
                overflow-hidden
                rounded-[5px]
                border
                border-warm-200
                bg-white/95
                shadow-[0_3px_12px_rgba(0,0,0,0.12)]
                backdrop-blur-sm
                sm:w-41.25
              "
            >
              <div
                className="
                  px-3
                  pb-2
                  pt-2.5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >
                  <div
                    className="
                      font-mono
                      text-[9px]
                      uppercase
                      tracking-wide
                      text-warm-500
                    "
                  >
                    Rainfall now
                  </div>

                  <span
                    className="
                      h-1.5
                      w-1.5
                      shrink-0
                      animate-pulse
                      rounded-full
                      bg-blue-500
                    "
                  />
                </div>

                <div
                  className="
                    mt-1
                    font-mono
                    text-lg
                    font-bold
                    leading-none
                    text-blue-700
                  "
                >
                  {ts.rainfall}

                  <span
                    className="
                      ml-1
                      text-xs
                      font-medium
                    "
                  >
                    mm/hr
                  </span>
                </div>
              </div>

              <div
                className="
                  border-t
                  border-blue-100
                  bg-blue-50
                  px-3
                  py-1.5
                  text-[9px]
                  font-medium
                  text-blue-700
                "
              >
                Current observation
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            MAP CONTROLS
        =================================================== */}

        <div
          className="
            absolute
            right-3
            top-3
            z-3000
            flex
            flex-col
            gap-2
          "
        >
          {/* Zoom controls */}
          <div
            className="
              overflow-hidden
              rounded-[5px]
              border
              border-warm-200
              bg-white
              shadow-[0_2px_8px_rgba(0,0,0,0.12)]
            "
          >
            <button
              onClick={() =>
                setZoom((current) =>
                  Math.min(
                    current + 0.2,
                    2.5
                  )
                )
              }
              className="map-ctrl-btn"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus size={17} />
            </button>

            <div className="h-px bg-warm-200" />

            <button
              onClick={() =>
                setZoom((current) =>
                  Math.max(
                    current - 0.2,
                    0.6
                  )
                )
              }
              className="map-ctrl-btn"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus size={17} />
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => setZoom(1)}
            className="map-ctrl-btn standalone"
            title="Reset view"
            aria-label="Reset map view"
          >
            <Locate size={16} />
          </button>

          {/* Layers */}
          <button
            onClick={() => {
              setLayerPanelOpen(
                (current) => !current
              );

              setLegendOpen(false);
            }}
            className={`
              map-ctrl-btn
              standalone
              ${
                layerPanelOpen
                  ? "active"
                  : ""
              }
            `}
            title="Map layers"
            aria-label="Map layers"
            aria-expanded={layerPanelOpen}
          >
            <Layers size={16} />
          </button>

          {/* Legend */}
          <button
            onClick={() => {
              setLegendOpen(
                (current) => !current
              );

              setLayerPanelOpen(false);
            }}
            className={`
              map-ctrl-btn
              standalone
              ${
                legendOpen
                  ? "active"
                  : ""
              }
            `}
            title="Map legend"
            aria-label="Map legend"
            aria-expanded={legendOpen}
          >
            <Info size={16} />
          </button>
        </div>

        {/* ===================================================
            LAYERS PANEL
        =================================================== */}

        {layerPanelOpen && (
          <div
            className="
              absolute
              right-13
              top-3
              z-3500
              w-52.5
              max-w-[calc(100vw-80px)]
              overflow-hidden
              rounded-[5px]
              border
              border-warm-200
              bg-white
              shadow-[0_6px_22px_rgba(0,0,0,0.16)]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-warm-100
                bg-warm-50
                px-3
                py-2.5
              "
            >
              <div>
                <span
                  className="
                    text-xs
                    font-semibold
                    text-warm-800
                  "
                >
                  Map Layers
                </span>

                <div
                  className="
                    mt-0.5
                    text-[9px]
                    text-warm-400
                  "
                >
                  Select what appears on map
                </div>
              </div>

              <button
                onClick={() =>
                  setLayerPanelOpen(false)
                }
                className="
                  rounded
                  p-1
                  text-warm-400
                  hover:bg-warm-200
                  hover:text-warm-700
                "
                aria-label="Close layers"
              >
                <X size={13} />
              </button>
            </div>

            <div className="py-1">
              {LAYERS.map((layer) => (
                <label
                  key={layer.key}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2.5
                    px-3
                    py-2.5
                    transition-colors
                    hover:bg-warm-50
                  "
                >
                  <input
                    type="checkbox"
                    checked={state.activeLayers.has(
                      layer.key
                    )}
                    onChange={() =>
                      dispatch({
                        type: "TOGGLE_LAYER",
                        layer: layer.key,
                      })
                    }
                    className="
                      h-3.5
                      w-3.5
                      accent-maroon-700
                    "
                  />

                  <span
                    className="
                      text-xs
                      text-warm-700
                    "
                  >
                    {layer.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            LEGEND
        =================================================== */}

        {legendOpen && (
          <div
            className="
              absolute
              right-13
              top-3
              z-3500
              w-55
              max-w-[calc(100vw-80px)]
              overflow-hidden
              rounded-[5px]
              border
              border-warm-200
              bg-white
              shadow-[0_6px_22px_rgba(0,0,0,0.16)]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-warm-100
                bg-warm-50
                px-3
                py-2.5
              "
            >
              <div>
                <span
                  className="
                    text-xs
                    font-semibold
                    text-warm-800
                  "
                >
                  Map Legend
                </span>

                <div
                  className="
                    mt-0.5
                    text-[9px]
                    text-warm-400
                  "
                >
                  Risk and infrastructure
                </div>
              </div>

              <button
                onClick={() =>
                  setLegendOpen(false)
                }
                className="
                  rounded
                  p-1
                  text-warm-400
                  hover:bg-warm-200
                  hover:text-warm-700
                "
                aria-label="Close legend"
              >
                <X size={13} />
              </button>
            </div>

            <div className="space-y-2.5 p-3">
              <div
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-warm-400
                "
              >
                Flood Risk
              </div>

              {[
                {
                  label: "Critical flood risk",
                  color: "bg-red-500",
                },
                {
                  label: "High flood risk",
                  color: "bg-amber-500",
                },
                {
                  label: "Moderate flood risk",
                  color: "bg-yellow-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <div
                    className={`
                      h-3
                      w-3
                      rounded-xs
                      opacity-75
                      ${item.color}
                    `}
                  />

                  <span
                    className="
                      text-[11px]
                      text-warm-600
                    "
                  >
                    {item.label}
                  </span>
                </div>
              ))}

              <hr className="border-warm-100" />

              <div
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-warm-400
                "
              >
                Drainage Nodes
              </div>

              {[
                {
                  label: "Overloaded node",
                  color: "bg-red-600",
                },
                {
                  label: "Warning node",
                  color: "bg-amber-500",
                },
                {
                  label: "Blocked node",
                  color: "bg-red-900",
                },
                {
                  label: "Normal node",
                  color: "bg-green-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <div
                    className={`
                      h-3
                      w-3
                      rounded-full
                      ${item.color}
                    `}
                  />

                  <span
                    className="
                      text-[11px]
                      text-warm-600
                    "
                  >
                    {item.label}
                  </span>
                </div>
              ))}

              <hr className="border-warm-100" />

              <div
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-warm-400
                "
              >
                Network
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    w-8
                    border-t-2
                    border-dashed
                    border-green-600
                  "
                />

                <span
                  className="
                    text-[11px]
                    text-warm-600
                  "
                >
                  Safe route
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    w-8
                    border-t
                    border-dashed
                    border-blue-500
                  "
                />

                <span
                  className="
                    text-[11px]
                    text-warm-600
                  "
                >
                  Drainage line
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            HOTSPOT DETAIL PANEL
        =================================================== */}

        {selectedHotspot && (
          <div
            className="
              absolute
              left-3
              top-19
              z-3200
              w-[min(290px,calc(100vw-80px))]
              overflow-hidden
              rounded-[5px]
              border
              border-warm-200
              bg-white
              shadow-[0_6px_22px_rgba(0,0,0,0.16)]
              sm:top-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-warm-100
                bg-warm-50
                px-3
                py-2.5
              "
            >
              <div className="min-w-0">
                <div
                  className="
                    truncate
                    font-mono
                    text-[10px]
                    text-warm-500
                  "
                >
                  {selectedHotspot.zone}
                </div>

                <div
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-warm-900
                  "
                >
                  {selectedHotspot.label}
                </div>
              </div>

              <button
                onClick={() =>
                  dispatch({
                    type: "SELECT_HOTSPOT",
                    id: null,
                  })
                }
                className="
                  shrink-0
                  rounded
                  p-1
                  text-warm-400
                  hover:bg-warm-200
                  hover:text-warm-700
                "
                aria-label="Close hotspot details"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2.5 p-3">
              {/* Risk */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-xs
                    text-warm-500
                  "
                >
                  Risk Level
                </span>

                <StatusBadge
                  level={selectedHotspot.risk}
                  size="md"
                />
              </div>

              {/* Metrics */}
              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  text-xs
                "
              >
                <Metric
                  label="Predicted depth"
                  value={`${selectedHotspot.depthMin}–${selectedHotspot.depthMax} cm`}
                />

                <Metric
                  label="Onset"
                  value={`${selectedHotspot.onset} min`}
                />

                <Metric
                  label="Peak"
                  value={`+${selectedHotspot.peakMin} min`}
                />

                <Metric
                  label="Rainfall"
                  value={`${selectedHotspot.rainfall} mm/hr`}
                  valueClass="text-blue-700"
                />

                <Metric
                  label="Drainage"
                  value={`${selectedHotspot.drainageCapacity}%`}
                />

                <Metric
                  label="Confidence"
                  value={`${selectedHotspot.confidence}%`}
                />
              </div>

              {/* Cause */}
              <div
                className="
                  rounded-sm
                  border
                  border-amber-200
                  bg-amber-50
                  px-2.5
                  py-2
                "
              >
                <div
                  className="
                    mb-0.5
                    font-mono
                    text-[10px]
                    text-amber-700
                  "
                >
                  PRIMARY CAUSE
                </div>

                <div
                  className="
                    text-xs
                    leading-4
                    text-amber-900
                  "
                >
                  {selectedHotspot.cause}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() =>
                  dispatch({
                    type: "SET_TAB",
                    tab: "risk",
                  })
                }
                className="
                  w-full
                  rounded-[3px]
                  px-2
                  py-1.5
                  text-left
                  text-xs
                  font-medium
                  text-maroon-700
                  transition-colors
                  hover:bg-maroon-50
                  hover:text-maroon-800
                "
              >
                View full risk analysis →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            FORECAST SUMMARY
        =================================================== */}

        <div
          className="
            absolute
            bottom-3
            left-3
            right-3
            z-3000
            rounded-[5px]
            bg-warm-900/95
            px-3
            py-2.5
            text-xs
            text-white
            shadow-[0_4px_16px_rgba(0,0,0,0.18)]
            backdrop-blur-sm
            sm:right-16
          "
        >
          <div
            className="
              flex
              items-start
              gap-2
            "
          >
            <AlertTriangle
              size={14}
              className={`
                mt-0.5
                shrink-0
                ${
                  ts.riskLevel === "CRITICAL"
                    ? "text-red-300"
                    : ts.riskLevel === "HIGH"
                    ? "text-amber-300"
                    : "text-yellow-300"
                }
              `}
            />

            <div
              className="
                min-w-0
                leading-4
              "
            >
              <span
                className="
                  mr-1.5
                  font-mono
                  text-warm-300
                "
              >
                {ts.label}:
              </span>

              <span className="text-warm-100">
                {ts.explanation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAP CONTROL CSS
      ===================================================== */}

      <style>{`
        .map-ctrl-btn {
          width: 36px;
          height: 36px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A4540;
          cursor: pointer;
          transition: background-color 0.15s ease,
                      color 0.15s ease;
          border: 0;
        }

        .map-ctrl-btn.standalone {
          border: 1px solid #E5E0DA;
          border-radius: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }

        .map-ctrl-btn:hover {
          background: #F0EDE9;
          color: #1A1714;
        }

        .map-ctrl-btn.active {
          background: #8B1A2A;
          color: #ffffff;
          border-color: #8B1A2A;
        }

        .map-ctrl-btn:focus-visible {
          outline: 2px solid #8B1A2A;
          outline-offset: 1px;
        }

        @media (max-width: 640px) {
          .map-ctrl-btn {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
}

/* ===========================================================
   SMALL METRIC COMPONENT
=========================================================== */

function Metric({
  label,
  value,
  valueClass = "text-warm-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div
      className="
        rounded-[3px]
        border
        border-warm-100
        bg-warm-50
        p-2
      "
    >
      <div
        className="
          font-mono
          text-[9px]
          uppercase
          text-warm-400
        "
      >
        {label}
      </div>

      <div
        className={`
          mt-0.5
          font-mono
          font-bold
          ${valueClass}
        `}
      >
        {value}
      </div>
    </div>
  );
}