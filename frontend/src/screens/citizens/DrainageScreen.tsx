import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import StatusBadge from "../../components/ui/StatusBadge";
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
  RefreshCw,
  Database,
  MapPin,
  AlertCircle,
} from "lucide-react";

import {
  DrainageAsset,
  FloodNode,
  FloodStatusResponse,
  getDrainageAssets,
  getFloodStatus,
} from "../../data/api";

type DrainageStatus =
  | "Normal"
  | "Warning"
  | "Overloaded"
  | "Blocked"
  | "Backflow";

interface DrainageViewNode {
  id: string;
  assetId: number;
  name: string;
  latitude: number;
  longitude: number;
  condition: string;
  swmmNodeId?: string | null;
  status: DrainageStatus;
  risk: string;
  maxDepthM: number;
  flooding: boolean;
}

function deriveStatus(
  asset: DrainageAsset,
  floodNode?: FloodNode
): DrainageStatus {
  const condition =
    asset.condition?.toLowerCase() ?? "";

  const risk =
    floodNode?.risk?.toLowerCase() ?? "";

  if (
    floodNode?.flooding ||
    risk === "critical"
  ) {
    return "Overloaded";
  }

  if (risk === "high") {
    return "Warning";
  }

  if (
    condition.includes("blocked") ||
    condition.includes("blockage")
  ) {
    return "Blocked";
  }

  if (condition.includes("backflow")) {
    return "Backflow";
  }

  if (
    condition.includes("warning") ||
    condition.includes("stress") ||
    risk === "moderate" ||
    risk === "medium"
  ) {
    return "Warning";
  }

  return "Normal";
}

const nodeColors: Record<
  DrainageStatus,
  string
> = {
  Normal: "#16A34A",
  Warning: "#D97706",
  Overloaded: "#DC2626",
  Blocked: "#991B1B",
  Backflow: "#7C3AED",
};

const nodeFill: Record<
  DrainageStatus,
  string
> = {
  Normal: "rgba(22,163,74,0.12)",
  Warning: "rgba(217,119,6,0.15)",
  Overloaded: "rgba(220,38,38,0.18)",
  Blocked: "rgba(153,27,27,0.20)",
  Backflow: "rgba(124,58,237,0.15)",
};

function getStatusDescription(
  status: DrainageStatus
) {
  switch (status) {
    case "Normal":
      return "No critical drainage condition is currently reported.";

    case "Warning":
      return "The model indicates elevated hydraulic risk at this location.";

    case "Overloaded":
      return "Flood-model output indicates significant hydraulic stress.";

    case "Blocked":
      return "A blockage condition is reported for this drainage asset.";

    case "Backflow":
      return "Reverse-flow condition is reported for this drainage asset.";

    default:
      return "Status unavailable.";
  }
}

function formatDepth(depthM: number) {
  return `${(depthM * 100).toFixed(1)} cm`;
}

function getNodeRiskClass(risk: string) {
  switch (risk.toLowerCase()) {
    case "critical":
      return "text-red-700";

    case "high":
      return "text-orange-700";

    case "moderate":
    case "medium":
      return "text-amber-700";

    case "low":
      return "text-lime-700";

    case "safe":
      return "text-green-700";

    default:
      return "text-warm-700";
  }
}

export default function DrainageScreen() {
  const { state, dispatch } = useApp();

  const [assets, setAssets] = useState<
    DrainageAsset[]
  >([]);

  const [floodStatus, setFloodStatus] =
    useState<FloodStatusResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        drainageAssets,
        flood,
      ] = await Promise.all([
        getDrainageAssets(),
        getFloodStatus({
          includeAiSummary: false,
        }),
      ]);

      setAssets(drainageAssets);
      setFloodStatus(flood);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Drainage API error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load drainage information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = window.setInterval(
      loadData,
      5 * 60 * 1000
    );

    return () =>
      window.clearInterval(interval);
  }, [loadData]);

  /*
   * Combine:
   * /api/assets/drainage
   * +
   * /api/flood/status
   *
   * using swmm_node_id as the connection key.
   */
  const nodes = useMemo<
    DrainageViewNode[]
  >(() => {
    return assets.map((asset) => {
      const floodNode =
        floodStatus?.nodes?.find(
          (node) =>
            node.node ===
            asset.swmm_node_id
        );

      return {
        id:
          asset.swmm_node_id ??
          String(asset.id),

        assetId: asset.id,

        name: asset.name,

        latitude: asset.latitude,

        longitude: asset.longitude,

        condition:
          asset.condition ?? "Unknown",

        swmmNodeId:
          asset.swmm_node_id,

        status: deriveStatus(
          asset,
          floodNode
        ),

        risk:
          floodNode?.risk ??
          "unavailable",

        maxDepthM:
          floodNode?.max_depth_m ?? 0,

        flooding:
          floodNode?.flooding ?? false,
      };
    });
  }, [assets, floodStatus]);

  const selectedNode = nodes.find(
    (node) =>
      node.id ===
      state.selectedDrainageNode
  );

  const counts = useMemo(() => {
    return {
      Normal: nodes.filter(
        (node) =>
          node.status === "Normal"
      ).length,

      Warning: nodes.filter(
        (node) =>
          node.status === "Warning"
      ).length,

      Overloaded: nodes.filter(
        (node) =>
          node.status === "Overloaded"
      ).length,

      Blocked: nodes.filter(
        (node) =>
          node.status === "Blocked"
      ).length,

      Backflow: nodes.filter(
        (node) =>
          node.status === "Backflow"
      ).length,
    };
  }, [nodes]);

  const criticalNodes = nodes.filter(
    (node) =>
      node.status === "Blocked" ||
      node.status === "Backflow" ||
      node.status === "Overloaded"
  );

  const floodedNodes = nodes.filter(
    (node) => node.flooding
  );

  const highestDepthNode = useMemo(() => {
    if (!nodes.length) {
      return null;
    }

    return [...nodes].sort(
      (a, b) =>
        b.maxDepthM - a.maxDepthM
    )[0];
  }, [nodes]);

  const averageDepthCm = useMemo(() => {
    if (!nodes.length) {
      return 0;
    }

    return (
      (nodes.reduce(
        (sum, node) =>
          sum + node.maxDepthM,
        0
      ) /
        nodes.length) *
      100
    );
  }, [nodes]);

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
              Drainage Network —{" "}
              {state.city}
            </h1>

            <p className="text-sm text-warm-500 mt-1">
              Backend drainage assets and flood-model node status
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated &&
              !loading && (
                <span className="text-[10px] font-mono text-warm-400">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              )}

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-warm-700 border border-warm-200 bg-white hover:bg-warm-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading &&
        !nodes.length && (
          <div className="border border-warm-200 bg-white px-4 py-4 mb-6 flex items-center gap-3">
            <RefreshCw
              size={16}
              className="animate-spin text-maroon-700"
            />

            <div>
              <div className="text-sm font-medium text-warm-800">
                Loading drainage model
              </div>

              <div className="text-[11px] font-mono text-warm-400 mt-0.5">
                Fetching drainage assets and flood-model output
              </div>
            </div>
          </div>
        )}

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-4 mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="text-red-600 mt-0.5 shrink-0"
            />

            <div>
              <div className="text-sm font-semibold text-red-900">
                Drainage data unavailable
              </div>

              <div className="text-xs text-red-700 mt-1">
                {error}
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="shrink-0 text-xs font-medium text-red-700 border border-red-200 bg-white px-3 py-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Backend source */}
      {nodes.length > 0 && (
        <div className="border border-green-200 bg-green-50 px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <Database
              size={14}
              className="text-green-700"
            />

            <div>
              <div className="text-xs font-semibold text-green-900">
                Backend drainage model connected
              </div>

              <div className="text-[10px] font-mono text-green-700 mt-0.5">
                {nodes.length} drainage asset
                {nodes.length !== 1
                  ? "s"
                  : ""}{" "}
                matched with current model output
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Peak depth */}
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Peak depth
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {highestDepthNode
              ? formatDepth(
                  highestDepthNode.maxDepthM
                )
              : "—"}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Highest simulated node depth
          </div>
        </div>

        {/* Model nodes */}
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Network
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Model nodes
            </span>
          </div>

          <div className="text-2xl font-bold font-mono text-warm-900">
            {nodes.length}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Backend drainage assets
          </div>
        </div>

        {/* Critical nodes */}
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
            Based on current model output
          </div>
        </div>

        {/* Flooding */}
        <div className="bg-white border border-warm-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Waves
              size={14}
              className="text-warm-400"
            />

            <span className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
              Flooding
            </span>
          </div>

          <div
            className={`text-2xl font-bold font-mono ${
              floodedNodes.length > 0
                ? "text-red-700"
                : "text-green-700"
            }`}
          >
            {floodedNodes.length}
          </div>

          <div className="text-[10px] text-warm-400 mt-1">
            Nodes currently flagged
          </div>
        </div>
      </div>

      {/* Status distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
        {(
          Object.entries(
            counts
          ) as [
            DrainageStatus,
            number
          ][]
        ).map(
          ([status, count]) => (
            <div
              key={status}
              className="bg-white border border-warm-200 px-3 py-2.5"
            >
              <div
                className="text-lg font-bold font-mono"
                style={{
                  color:
                    nodeColors[
                      status
                    ],
                }}
              >
                {count}
              </div>

              <div className="text-[10px] text-warm-500 font-mono uppercase">
                {status}
              </div>
            </div>
          )
        )}
      </div>

      {/* Critical alert */}
      {criticalNodes.length >
        0 && (
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
                {criticalNodes.length} model node
                {criticalNodes.length !==
                1
                  ? "s"
                  : ""}{" "}
                currently show elevated drainage or flood risk.
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
                    Drainage Asset Map
                  </div>

                  <div className="text-[11px] text-warm-400 font-mono mt-0.5">
                    Current backend assets · select a node to inspect
                  </div>
                </div>

                <Activity
                  size={15}
                  className="text-warm-400"
                />
              </div>
            </div>

            <div className="p-4">
              {nodes.length >
              0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nodes.map(
                    (node) => {
                      const isSelected =
                        state.selectedDrainageNode ===
                        node.id;

                      const color =
                        nodeColors[
                          node.status
                        ];

                      return (
                        <button
                          key={
                            node.id
                          }
                          onClick={() =>
                            dispatch({
                              type: "SELECT_DRAINAGE_NODE",
                              id: isSelected
                                ? null
                                : node.id,
                            })
                          }
                          className={`text-left border p-4 transition-colors ${
                            isSelected
                              ? "border-maroon-300 bg-maroon-50"
                              : "border-warm-200 bg-warm-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor:
                                    nodeFill[
                                      node.status
                                    ],
                                }}
                              >
                                <div
                                  className="w-3.5 h-3.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      color,
                                  }}
                                />
                              </div>

                              <div>
                                <div className="text-sm font-bold font-mono text-warm-900">
                                  {
                                    node.id
                                  }
                                </div>

                                <div className="text-xs text-warm-600 mt-0.5">
                                  {
                                    node.name
                                  }
                                </div>
                              </div>
                            </div>

                            <StatusBadge
                              level={
                                node.status
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div>
                              <div className="text-[9px] uppercase font-mono text-warm-400">
                                Model depth
                              </div>

                              <div className="text-sm font-bold font-mono text-warm-800 mt-1">
                                {formatDepth(
                                  node.maxDepthM
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-[9px] uppercase font-mono text-warm-400">
                                Model risk
                              </div>

                              <div
                                className={`text-sm font-bold font-mono mt-1 ${getNodeRiskClass(
                                  node.risk
                                )}`}
                              >
                                {
                                  node.risk
                                }
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-warm-400 font-mono">
                            <MapPin
                              size={
                                11
                              }
                            />

                            {node.latitude.toFixed(
                              4
                            )}
                            ,{" "}
                            {node.longitude.toFixed(
                              4
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-warm-400">
                  <Network
                    size={32}
                    className="mx-auto mb-3 opacity-30"
                  />

                  <p className="text-sm">
                    No drainage assets are currently available.
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 border-t border-warm-100 flex flex-wrap gap-x-4 gap-y-2">
              {(
                Object.entries(
                  nodeColors
                ) as [
                  DrainageStatus,
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
                        backgroundColor:
                          color,
                      }}
                    />

                    <span className="text-[10px] text-warm-500 font-mono">
                      {status}
                    </span>
                  </div>
                )
              )}
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
              {highestDepthNode
                ? `Node ${
                    highestDepthNode.id
                  } currently has the highest simulated depth at ${formatDepth(
                    highestDepthNode.maxDepthM
                  )}. Average simulated depth across the matched nodes is ${averageDepthCm.toFixed(
                    1
                  )} cm.`
                : "No drainage model output is currently available."}
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
                    DRAINAGE ASSET
                  </div>

                  <div className="text-sm font-bold text-warm-900">
                    {
                      selectedNode.id
                    }
                  </div>

                  <div className="text-xs text-warm-500">
                    {
                      selectedNode.name
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

                {/* Model risk */}
                <div className="border border-warm-200 bg-warm-50 p-3">
                  <div className="text-[9px] uppercase font-mono text-warm-400">
                    Flood model risk
                  </div>

                  <div
                    className={`text-lg font-bold font-mono mt-1 ${getNodeRiskClass(
                      selectedNode.risk
                    )}`}
                  >
                    {
                      selectedNode.risk
                    }
                  </div>
                </div>

                {/* Depth */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Simulated depth
                  </div>

                  <div className="border border-warm-200 p-3">
                    <div className="text-xl font-bold font-mono text-warm-900">
                      {formatDepth(
                        selectedNode.maxDepthM
                      )}
                    </div>

                    <div className="text-[10px] text-warm-400 mt-1">
                      Maximum depth returned by the flood model
                    </div>
                  </div>
                </div>

                {/* Flooding */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Flooding state
                  </div>

                  <div
                    className={`border p-3 ${
                      selectedNode.flooding
                        ? "bg-red-50 border-red-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedNode.flooding ? (
                        <ArrowUp
                          size={14}
                          className="text-red-600"
                        />
                      ) : (
                        <ArrowDown
                          size={14}
                          className="text-green-600"
                        />
                      )}

                      <span
                        className={`text-xs font-semibold ${
                          selectedNode.flooding
                            ? "text-red-800"
                            : "text-green-800"
                        }`}
                      >
                        {selectedNode.flooding
                          ? "Flooding detected"
                          : "No flooding detected"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Asset condition */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Asset condition
                  </div>

                  <div className="border border-warm-200 bg-warm-50 p-3">
                    <div className="text-xs font-medium text-warm-800">
                      {
                        selectedNode.condition
                      }
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                    Location
                  </div>

                  <div className="flex items-start gap-2 text-xs text-warm-600">
                    <MapPin
                      size={13}
                      className="text-warm-400 mt-0.5"
                    />

                    <span className="font-mono">
                      {selectedNode.latitude.toFixed(
                        5
                      )}
                      ,{" "}
                      {selectedNode.longitude.toFixed(
                        5
                      )}
                    </span>
                  </div>
                </div>

                {/* SWMM mapping */}
                {selectedNode.swmmNodeId && (
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wide text-warm-400 mb-2">
                      Model mapping
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-warm-500">
                        SWMM node
                      </span>

                      <span className="font-mono font-medium text-warm-800">
                        {
                          selectedNode.swmmNodeId
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Honest API limitation */}
                <div className="border-t border-warm-100 pt-3">
                  <p className="text-[10px] text-warm-400 leading-relaxed">
                    Flow rate, design capacity,
                    drainage utilization and pipe
                    connectivity are not returned by the
                    current backend API, so they are not
                    displayed as fabricated values.
                  </p>
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
                Select a drainage asset to inspect its backend model output.
              </p>
            </div>
          )}

          {/* Highest depth */}
          {highestDepthNode && (
            <div className="mt-4 bg-white border border-warm-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  size={14}
                  className="text-amber-600"
                />

                <div className="text-[10px] font-mono uppercase tracking-wide text-warm-500">
                  Highest simulated depth
                </div>
              </div>

              <button
                onClick={() =>
                  dispatch({
                    type: "SELECT_DRAINAGE_NODE",
                    id: highestDepthNode.id,
                  })
                }
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-warm-900">
                    {
                      highestDepthNode.id
                    }
                  </span>

                  <span className="font-mono text-sm font-bold text-warm-800">
                    {formatDepth(
                      highestDepthNode.maxDepthM
                    )}
                  </span>
                </div>

                <div className="text-xs text-warm-500 mt-1">
                  {
                    highestDepthNode.name
                  }
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
              {nodes.map(
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
                          {
                            node.id
                          }
                        </div>

                        <div className="text-[10px] text-warm-400">
                          {
                            node.name
                          }
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-medium text-warm-700">
                        {formatDepth(
                          node.maxDepthM
                        )}
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
                        {
                          node.status
                        }
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prototype note */}
      <div className="border border-warm-200 bg-warm-50 px-4 py-3 mt-6">
        <div className="flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-warm-500 mt-0.5 shrink-0"
          />

          <p className="text-[11px] text-warm-500 leading-relaxed">
            The current backend drainage assets are
            demonstration model assets mapped to the
            prototype SWMM network. They are not surveyed
            municipal drainage infrastructure. Detailed
            capacity, flow and pipe connectivity will be
            added when those backend model outputs become
            available.
          </p>
        </div>
      </div>
    </div>
  );
}