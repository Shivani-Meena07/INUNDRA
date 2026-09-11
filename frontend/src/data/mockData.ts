export type RiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "SAFE";
export type IncidentStatus = "Under verification" | "Confirmed" | "Resolved" | "Closed";
export type IncidentType = "Blocked Drain" | "Waterlogging" | "Drain Overflow" | "Damaged Drain" | "Other";
export type DrainageNodeStatus = "Normal" | "Warning" | "Overloaded" | "Blocked" | "Backflow";

export interface TimeStep {
  label: string;
  rainfall: number;
  riskLevel: RiskLevel;
  waterDepth: number;
  drainageUtil: number;
  explanation: string;
}

export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  risk: RiskLevel;
  depthMin: number;
  depthMax: number;
  onset: number;
  peakMin: number;
  rainfall: number;
  drainageCapacity: number;
  cause: string;
  confidence: number;
  zone: string;
}

export interface DrainageNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: DrainageNodeStatus;
  capacity: number;
  flow: number;
  designCapacity: number;
  upstreamInflow: number;
  downstreamCondition: string;
  predictedImpact: string;
}

export interface DrainageEdge {
  from: string;
  to: string;
}

export interface Incident {
  id: string;
  location: string;
  type: IncidentType;
  severity: RiskLevel;
  reportedAt: string;
  status: IncidentStatus;
  impact: string;
  description: string;
}

export interface Route {
  id: string;
  label: string;
  tag: string;
  duration: number;
  floodExposure: RiskLevel;
  predictedWater: number;
  recommended: boolean;
  reason: string;
}

export interface RiskFactor {
  id: string;
  label: string;
  value: string;
  severity: RiskLevel;
  explanation: string;
}

export interface FloodZone {
  points: string;
  risk: RiskLevel;
  id: string;
  label: string;
}

export interface Road {
  d: string;
  major: boolean;
}

export interface CityData {
  name: string;
  alertLevel: RiskLevel;
  alertMessage: string;
  currentRainfall: number;
  timeSteps: TimeStep[];
  hotspots: Hotspot[];
  drainageNodes: DrainageNode[];
  drainageEdges: DrainageEdge[];
  incidents: Incident[];
  routes: Route[];
  riskFactors: RiskFactor[];
  whyAtRisk: string;
  forecastConfidence: number;
  confidenceFactors: { label: string; level: "High" | "Medium" | "Low" }[];
  floodZones: FloodZone[];
  roads: Road[];
  waterBody: string;
  drainageLines: string[];
  origin: string;
  destination: string;
}

export const cityData: Record<string, CityData> = {
  delhi: {
    name: "Delhi",
    alertLevel: "HIGH",
    alertMessage: "Flooding likely within 60 minutes in Lajpat Nagar, Sarita Vihar, and ITO areas.",
    currentRainfall: 72,
    timeSteps: [
      { label: "NOW", rainfall: 72, riskLevel: "HIGH", waterDepth: 0, drainageUtil: 71, explanation: "Intense rainfall over Lajpat Nagar catchment. Drainage at 71% capacity. Flood onset imminent in low-lying underpasses." },
      { label: "+30 MIN", rainfall: 78, riskLevel: "HIGH", waterDepth: 8, drainageUtil: 82, explanation: "Rainfall intensifying. Drainage approaching saturation. Road surface accumulation beginning at D-17 outlet zone." },
      { label: "+1 HR", rainfall: 82, riskLevel: "CRITICAL", waterDepth: 18, drainageUtil: 94, explanation: "Critical drainage surcharge. Node D-17 overloaded. Downstream blockage confirmed. Inundation spreading on Ring Road underpass." },
      { label: "+2 HR", rainfall: 65, riskLevel: "HIGH", waterDepth: 27, drainageUtil: 97, explanation: "Peak inundation depth. Drainage system at near-collapse. Backflow reported at nodes D-14 and D-19." },
      { label: "+3 HR", rainfall: 42, riskLevel: "MODERATE", waterDepth: 16, drainageUtil: 79, explanation: "Rainfall tapering. Gradual drainage recovery. Residual ponding on low-lying segments expected for 2–3 hours." },
    ],
    hotspots: [
      { id: "h1", label: "Lajpat Nagar Underpass", x: 380, y: 220, risk: "HIGH", depthMin: 18, depthMax: 25, onset: 42, peakMin: 90, rainfall: 72, drainageCapacity: 94, cause: "Downstream drainage blockage at D-17", confidence: 87, zone: "South Delhi" },
      { id: "h2", label: "ITO Intersection", x: 310, y: 190, risk: "CRITICAL", depthMin: 28, depthMax: 35, onset: 28, peakMin: 75, rainfall: 72, drainageCapacity: 97, cause: "Low elevation, multiple upstream inflows, D-19 backflow", confidence: 91, zone: "Central Delhi" },
      { id: "h3", label: "Sarita Vihar Sector 5", x: 450, y: 310, risk: "MODERATE", depthMin: 8, depthMax: 15, onset: 68, peakMin: 120, rainfall: 68, drainageCapacity: 73, cause: "Impervious surface runoff, minor blockage at D-22", confidence: 74, zone: "South-East Delhi" },
      { id: "h4", label: "Ring Road Underpass", x: 260, y: 250, risk: "HIGH", depthMin: 22, depthMax: 30, onset: 35, peakMin: 85, rainfall: 72, drainageCapacity: 89, cause: "Below-grade road segment, restricted downstream outlet", confidence: 82, zone: "Central-South Delhi" },
    ],
    drainageNodes: [
      { id: "D-14", label: "D-14 • Lodhi Colony Inlet", x: 280, y: 170, status: "Warning", capacity: 78, flow: 2.9, designCapacity: 3.5, upstreamInflow: 3.1, downstreamCondition: "Restricted", predictedImpact: "Minor surface ponding" },
      { id: "D-17", label: "D-17 • Lajpat Nagar Main", x: 370, y: 230, status: "Overloaded", capacity: 94, flow: 3.8, designCapacity: 4.0, upstreamInflow: 4.3, downstreamCondition: "Restricted", predictedImpact: "18–25 cm road inundation" },
      { id: "D-19", label: "D-19 • ITO Junction", x: 305, y: 195, status: "Backflow", capacity: 99, flow: 4.1, designCapacity: 4.0, upstreamInflow: 4.6, downstreamCondition: "Blocked", predictedImpact: "28–35 cm severe inundation" },
      { id: "D-21", label: "D-21 • Ashram Chowk", x: 340, y: 260, status: "Warning", capacity: 81, flow: 3.1, designCapacity: 3.8, upstreamInflow: 3.4, downstreamCondition: "Normal", predictedImpact: "Moderate surface runoff" },
      { id: "D-22", label: "D-22 • Sarita Vihar S5", x: 445, y: 305, status: "Blocked", capacity: 65, flow: 1.2, designCapacity: 3.2, upstreamInflow: 2.8, downstreamCondition: "Blocked", predictedImpact: "8–15 cm ponding" },
      { id: "D-08", label: "D-08 • Pragati Maidan", x: 230, y: 215, status: "Normal", capacity: 52, flow: 2.0, designCapacity: 4.2, upstreamInflow: 2.1, downstreamCondition: "Normal", predictedImpact: "None expected" },
      { id: "D-25", label: "D-25 • Govindpuri", x: 400, y: 350, status: "Normal", capacity: 45, flow: 1.6, designCapacity: 3.6, upstreamInflow: 1.7, downstreamCondition: "Normal", predictedImpact: "None expected" },
    ],
    drainageEdges: [
      { from: "D-08", to: "D-14" }, { from: "D-14", to: "D-19" }, { from: "D-19", to: "D-17" },
      { from: "D-17", to: "D-21" }, { from: "D-21", to: "D-22" }, { from: "D-22", to: "D-25" },
    ],
    incidents: [
      { id: "IN-2026-0141", location: "Lajpat Nagar, Gate 3", type: "Blocked Drain", severity: "HIGH", reportedAt: "09:12", status: "Confirmed", impact: "Partial road flooding, 1 lane blocked", description: "Storm drain at Gate 3 completely blocked with debris. Water backing up onto service road." },
      { id: "IN-2026-0138", location: "ITO Intersection", type: "Waterlogging", severity: "CRITICAL", reportedAt: "08:55", status: "Confirmed", impact: "3 lanes flooded, traffic diverted", description: "Severe waterlogging at ITO. Multiple drains overwhelmed. Emergency services deployed." },
      { id: "IN-2026-0135", location: "Sarita Vihar Sector 5", type: "Drain Overflow", severity: "MODERATE", reportedAt: "08:40", status: "Under verification", impact: "Footpath and parking area affected", description: "Open stormwater drain overflowing near Sector 5 market. Verified by two independent reports." },
      { id: "IN-2026-0129", location: "Ring Road Underpass", type: "Waterlogging", severity: "HIGH", reportedAt: "08:20", status: "Confirmed", impact: "Underpass closed, diversions active", description: "Ring Road underpass waterlogged to 22 cm depth. NDMC teams on site." },
      { id: "IN-2026-0122", location: "Ashram Chowk", type: "Damaged Drain", severity: "LOW", reportedAt: "07:55", status: "Resolved", impact: "Repaired, monitoring ongoing", description: "Drain cover dislodged due to pressure. Replaced by maintenance crew at 08:45." },
    ],
    routes: [
      { id: "rA", label: "Route A", tag: "Fastest", duration: 18, floodExposure: "HIGH", predictedWater: 22, recommended: false, reason: "Passes through ITO and Lajpat Nagar flood zones. Not recommended." },
      { id: "rB", label: "Route B", tag: "Safer", duration: 24, floodExposure: "LOW", predictedWater: 4, recommended: true, reason: "Recommended — avoids 3 predicted flood zones via Outer Ring Road and Mathura Road." },
      { id: "rC", label: "Route C", tag: "Alternative", duration: 27, floodExposure: "MODERATE", predictedWater: 11, recommended: false, reason: "Longer but avoids critical zones. Some risk near Ashram Chowk." },
    ],
    riskFactors: [
      { id: "rf1", label: "Rainfall Intensity", value: "82 mm/hr", severity: "HIGH", explanation: "Current intensity exceeds design threshold for catchment drainage capacity." },
      { id: "rf2", label: "Drainage Capacity", value: "94% utilized", severity: "CRITICAL", explanation: "Node D-17 operating at 94% of design capacity with rising upstream inflow." },
      { id: "rf3", label: "Terrain Accumulation", value: "High", severity: "HIGH", explanation: "Low-lying road segments with micro-topography enabling surface water pooling." },
      { id: "rf4", label: "Impervious Surface", value: "78%", severity: "HIGH", explanation: "High imperviousness ratio limits infiltration; near-total runoff reaches drainage network." },
      { id: "rf5", label: "Downstream Blockage", value: "Confirmed", severity: "CRITICAL", explanation: "Reported blockage at D-17 outlet restricts downstream flow, causing backpressure." },
      { id: "rf6", label: "Downstream Water Level", value: "Elevated", severity: "MODERATE", explanation: "Yamuna water level elevated; reduces gradient driving drainage discharge." },
    ],
    whyAtRisk: "High-intensity rainfall is expected to exceed the drainage capacity in the Lajpat Nagar catchment. Low-lying road segments and 78% impervious surface coverage concentrate runoff rapidly. A confirmed downstream blockage at D-17 further reduces effective drainage capacity, causing surcharge and backflow into upstream nodes.",
    forecastConfidence: 87,
    confidenceFactors: [
      { label: "Radar agreement", level: "High" },
      { label: "Terrain model resolution", level: "High" },
      { label: "Drainage data freshness", level: "Medium" },
      { label: "Citizen reports", level: "Medium" },
    ],
    floodZones: [
      { id: "fz1", points: "340,195 385,195 395,240 375,255 340,250 325,230", risk: "CRITICAL", label: "ITO–Lajpat Zone" },
      { id: "fz2", points: "245,235 280,235 290,265 270,275 245,268", risk: "HIGH", label: "Ring Road Underpass" },
      { id: "fz3", points: "415,280 460,280 470,330 450,340 415,330", risk: "MODERATE", label: "Sarita Vihar" },
    ],
    roads: [
      { d: "M80,100 L720,100", major: true }, { d: "M80,180 L720,180", major: true },
      { d: "M80,260 L720,260", major: true }, { d: "M80,340 L720,340", major: true },
      { d: "M80,420 L720,420", major: true },
      { d: "M150,60 L150,460", major: true }, { d: "M280,60 L280,460", major: true },
      { d: "M400,60 L400,460", major: true }, { d: "M520,60 L520,460", major: true },
      { d: "M640,60 L640,460", major: true },
      { d: "M80,140 L720,140", major: false }, { d: "M80,220 L720,220", major: false },
      { d: "M80,300 L720,300", major: false }, { d: "M80,380 L720,380", major: false },
      { d: "M215,60 L215,460", major: false }, { d: "M340,60 L340,460", major: false },
      { d: "M460,60 L460,460", major: false }, { d: "M580,60 L580,460", major: false },
      { d: "M100,60 L340,200 L560,140 L720,200", major: true },
      { d: "M100,350 L280,300 L460,360 L720,300", major: false },
    ],
    waterBody: "M620,60 L720,60 L720,460 L620,460 L590,380 L600,260 L580,140 Z",
    drainageLines: [
      "M150,100 L280,180 L340,220 L380,230",
      "M150,260 L230,215 L280,195 L305,195",
      "M400,100 L370,230 L340,260 L400,350",
    ],
    origin: "Nehru Place",
    destination: "Connaught Place",
  },

  mumbai: {
    name: "Mumbai",
    alertLevel: "CRITICAL",
    alertMessage: "Severe inundation expected within 30 minutes. Coastal areas under high tide advisory.",
    currentRainfall: 94,
    timeSteps: [
      { label: "NOW", rainfall: 94, riskLevel: "CRITICAL", waterDepth: 12, drainageUtil: 88, explanation: "Intense southwest monsoon rainfall. High tide compounding drainage capacity at coastal outlets. Dharavi and Hindmata hotspots active." },
      { label: "+30 MIN", rainfall: 102, riskLevel: "CRITICAL", waterDepth: 28, drainageUtil: 96, explanation: "Rainfall at peak. High tide peak coinciding with maximum inflow. Multiple pump stations at capacity." },
      { label: "+1 HR", rainfall: 98, riskLevel: "CRITICAL", waterDepth: 38, drainageUtil: 99, explanation: "Maximum inundation expected. Hindmata underpass flooding likely. Western Express Highway low-lying sections critical." },
      { label: "+2 HR", rainfall: 81, riskLevel: "HIGH", waterDepth: 32, drainageUtil: 94, explanation: "Tide receding. Drainage recovery beginning. Residual deep ponding persists in Dharavi low zones." },
      { label: "+3 HR", rainfall: 58, riskLevel: "HIGH", waterDepth: 18, drainageUtil: 84, explanation: "Rainfall moderating. Gradual recede. Monitoring Mithi River levels for late surge." },
    ],
    hotspots: [
      { id: "h1", label: "Hindmata Underpass", x: 290, y: 240, risk: "CRITICAL", depthMin: 38, depthMax: 50, onset: 18, peakMin: 60, rainfall: 94, drainageCapacity: 99, cause: "Pump station at capacity, high tide backflow", confidence: 93, zone: "Dadar" },
      { id: "h2", label: "Dharavi Low Zone", x: 380, y: 290, risk: "HIGH", depthMin: 22, depthMax: 32, onset: 35, peakMin: 80, rainfall: 94, drainageCapacity: 91, cause: "Low elevation, dense impervious cover, limited outlet", confidence: 85, zone: "Dharavi" },
      { id: "h3", label: "Andheri Subway", x: 240, y: 160, risk: "HIGH", depthMin: 18, depthMax: 28, onset: 42, peakMin: 90, rainfall: 88, drainageCapacity: 86, cause: "Below-grade structure, upstream catchment overload", confidence: 79, zone: "Andheri" },
    ],
    drainageNodes: [
      { id: "M-03", label: "M-03 • Hindmata Pump", x: 285, y: 235, status: "Overloaded", capacity: 99, flow: 6.8, designCapacity: 7.0, upstreamInflow: 7.4, downstreamCondition: "High Tide Backflow", predictedImpact: "38–50 cm severe flooding" },
      { id: "M-07", label: "M-07 • Dharavi Outlet", x: 370, y: 285, status: "Blocked", capacity: 88, flow: 3.2, designCapacity: 5.5, upstreamInflow: 4.9, downstreamCondition: "Tidal restriction", predictedImpact: "22–32 cm ponding" },
      { id: "M-11", label: "M-11 • Andheri N Sewer", x: 235, y: 155, status: "Warning", capacity: 82, flow: 4.1, designCapacity: 5.0, upstreamInflow: 4.2, downstreamCondition: "Restricted", predictedImpact: "Moderate surface accumulation" },
      { id: "M-14", label: "M-14 • Bandra Creek", x: 160, y: 300, status: "Normal", capacity: 58, flow: 3.2, designCapacity: 8.0, upstreamInflow: 3.3, downstreamCondition: "Normal (tidal)", predictedImpact: "None expected" },
      { id: "M-18", label: "M-18 • Kurla Junction", x: 460, y: 230, status: "Warning", capacity: 76, flow: 3.8, designCapacity: 5.0, upstreamInflow: 3.9, downstreamCondition: "Normal", predictedImpact: "Minor surface runoff" },
    ],
    drainageEdges: [
      { from: "M-11", to: "M-03" }, { from: "M-03", to: "M-07" }, { from: "M-07", to: "M-14" }, { from: "M-18", to: "M-07" },
    ],
    incidents: [
      { id: "IN-2026-0156", location: "Hindmata, Dadar", type: "Waterlogging", severity: "CRITICAL", reportedAt: "10:05", status: "Confirmed", impact: "Underpass closed, emergency teams deployed", description: "Hindmata underpass has 35 cm water. MCGM pump teams on site. Complete closure enforced." },
      { id: "IN-2026-0153", location: "Dharavi 90 Feet Road", type: "Drain Overflow", severity: "HIGH", reportedAt: "09:48", status: "Confirmed", impact: "Road impassable, local traffic diverted", description: "Storm drain overflow along 90 Feet Road. Water entering ground-floor establishments." },
      { id: "IN-2026-0149", location: "Andheri Subway", type: "Waterlogging", severity: "HIGH", reportedAt: "09:30", status: "Under verification", impact: "Subway entry closed", description: "Water accumulation at subway entrance. Depth reported at 20 cm by commuter." },
      { id: "IN-2026-0144", location: "Kurla LBS Road", type: "Blocked Drain", severity: "MODERATE", reportedAt: "09:10", status: "Under verification", impact: "Slow drainage, minor ponding", description: "Drain inlet blocked with plastic waste near LBS Market junction." },
    ],
    routes: [
      { id: "rA", label: "Route A", tag: "Fastest", duration: 22, floodExposure: "CRITICAL", predictedWater: 38, recommended: false, reason: "Passes directly through Hindmata. Active flooding with 38 cm depth. Dangerous." },
      { id: "rB", label: "Route B", tag: "Safer", duration: 31, floodExposure: "LOW", predictedWater: 5, recommended: true, reason: "Recommended — avoids Hindmata and Dharavi zones via Eastern Express Highway elevated section." },
      { id: "rC", label: "Route C", tag: "Alternative", duration: 28, floodExposure: "MODERATE", predictedWater: 14, recommended: false, reason: "Uses Sion-Bandra Link. Moderate exposure near Dharavi. Passable with caution." },
    ],
    riskFactors: [
      { id: "rf1", label: "Rainfall Intensity", value: "102 mm/hr", severity: "CRITICAL", explanation: "Exceptional southwest monsoon intensity, well above city design storm threshold of 50 mm/hr." },
      { id: "rf2", label: "Tidal Influence", value: "High tide +1.8m", severity: "CRITICAL", explanation: "Mumbai high tide coincides with peak rainfall, blocking gravity drainage at coastal outlets." },
      { id: "rf3", label: "Pump Capacity", value: "99% utilized", severity: "CRITICAL", explanation: "Hindmata pump station operating at maximum. No reserve capacity for additional inflow." },
      { id: "rf4", label: "Impervious Surface", value: "85%", severity: "HIGH", explanation: "Dense urban fabric with minimal permeable surface. Near-total surface runoff to drainage network." },
      { id: "rf5", label: "Downstream Blockage", value: "Tidal restriction", severity: "HIGH", explanation: "High tide prevents gravity drainage at tidal outlets for next 2–3 hours." },
      { id: "rf6", label: "Mithi River Level", value: "Elevated +1.2m", severity: "HIGH", explanation: "Mithi River level elevated due to combined rainfall and tidal backflow. Threatens overflow in Dharavi." },
    ],
    whyAtRisk: "Peak southwest monsoon rainfall coinciding with high tide creates a compound flooding event. Coastal drainage outlets are blocked by tidal backflow, leaving only pump stations as discharge pathway. With pump capacity at maximum and rainfall intensifying, critical inundation at low-lying structures is imminent.",
    forecastConfidence: 93,
    confidenceFactors: [
      { label: "Radar agreement", level: "High" },
      { label: "Tidal model accuracy", level: "High" },
      { label: "Pump telemetry freshness", level: "High" },
      { label: "Citizen reports", level: "Medium" },
    ],
    floodZones: [
      { id: "fz1", points: "255,210 330,210 340,270 310,280 255,270", risk: "CRITICAL", label: "Hindmata Zone" },
      { id: "fz2", points: "340,260 430,260 440,330 410,340 340,325", risk: "HIGH", label: "Dharavi Low Zone" },
      { id: "fz3", points: "200,135 275,135 280,185 255,192 200,182", risk: "HIGH", label: "Andheri Subway" },
    ],
    roads: [
      { d: "M80,100 L720,100", major: true }, { d: "M80,180 L720,180", major: true },
      { d: "M80,260 L720,260", major: true }, { d: "M80,340 L720,340", major: true },
      { d: "M80,420 L720,420", major: true },
      { d: "M140,60 L140,460", major: true }, { d: "M260,60 L260,460", major: true },
      { d: "M380,60 L380,460", major: true }, { d: "M500,60 L500,460", major: true },
      { d: "M620,60 L620,460", major: true },
      { d: "M80,140 L720,140", major: false }, { d: "M80,220 L720,220", major: false },
      { d: "M80,300 L720,300", major: false }, { d: "M80,380 L720,380", major: false },
      { d: "M200,60 L200,460", major: false }, { d: "M320,60 L320,460", major: false },
      { d: "M440,60 L440,460", major: false }, { d: "M560,60 L560,460", major: false },
      { d: "M80,60 L200,120 L320,160 L440,120 L560,160 L720,120", major: true },
      { d: "M80,400 L200,360 L380,400 L560,360 L720,400", major: false },
    ],
    waterBody: "M80,60 L140,60 L160,120 L140,200 L120,300 L100,400 L80,460 Z",
    drainageLines: [
      "M140,160 L200,200 L260,240 L290,240",
      "M380,180 L370,235 L340,270",
      "M500,180 L460,225 L440,260",
    ],
    origin: "BKC",
    destination: "Churchgate",
  },

  chennai: {
    name: "Chennai",
    alertLevel: "MODERATE",
    alertMessage: "Flood watch in effect. Adyar River rising. Monitoring Velachery low-lying areas.",
    currentRainfall: 54,
    timeSteps: [
      { label: "NOW", rainfall: 54, riskLevel: "MODERATE", waterDepth: 0, drainageUtil: 62, explanation: "Moderate northeast monsoon rainfall. Adyar River level rising but within safe limits. Velachery lakes near capacity." },
      { label: "+30 MIN", rainfall: 61, riskLevel: "MODERATE", waterDepth: 5, drainageUtil: 73, explanation: "Rainfall increasing over Velachery catchment. Canal levels rising. Initial surface accumulation in low-lying zones." },
      { label: "+1 HR", rainfall: 68, riskLevel: "HIGH", waterDepth: 12, drainageUtil: 84, explanation: "Drainage system approaching saturation. Adyar River level at cautionary mark. Flood risk elevated for Velachery." },
      { label: "+2 HR", rainfall: 72, riskLevel: "HIGH", waterDepth: 20, drainageUtil: 91, explanation: "Peak inundation expected. Canal overflow risk at Buckingham Canal near Perungudi. Low-road segments flooded." },
      { label: "+3 HR", rainfall: 55, riskLevel: "MODERATE", waterDepth: 14, drainageUtil: 78, explanation: "Rainfall beginning to moderate. Gradual channel drainage. Monitoring Chembarambakkam Tank outflow." },
    ],
    hotspots: [
      { id: "h1", label: "Velachery Main Road", x: 400, y: 280, risk: "HIGH", depthMin: 15, depthMax: 22, onset: 55, peakMin: 105, rainfall: 72, drainageCapacity: 88, cause: "Low-lying basin, lake overflow risk, blocked outlet canal", confidence: 78, zone: "Velachery" },
      { id: "h2", label: "Adyar River Crossing", x: 300, y: 340, risk: "MODERATE", depthMin: 8, depthMax: 14, onset: 72, peakMin: 120, rainfall: 65, drainageCapacity: 71, cause: "River level elevation, limited freeboard in embankment", confidence: 72, zone: "Adyar" },
      { id: "h3", label: "Perungudi Canal Zone", x: 480, y: 220, risk: "MODERATE", depthMin: 6, depthMax: 12, onset: 80, peakMin: 130, rainfall: 61, drainageCapacity: 68, cause: "Canal near capacity, downstream tidal restriction", confidence: 68, zone: "Perungudi" },
    ],
    drainageNodes: [
      { id: "C-04", label: "C-04 • Velachery Canal N", x: 390, y: 270, status: "Warning", capacity: 84, flow: 3.4, designCapacity: 4.0, upstreamInflow: 3.6, downstreamCondition: "Restricted", predictedImpact: "15–22 cm inundation" },
      { id: "C-07", label: "C-07 • Adyar River Outlet", x: 295, y: 335, status: "Warning", capacity: 71, flow: 5.1, designCapacity: 7.0, upstreamInflow: 5.3, downstreamCondition: "Tidal restriction", predictedImpact: "River margin flooding" },
      { id: "C-11", label: "C-11 • Buckingham Canal", x: 475, y: 215, status: "Normal", capacity: 62, flow: 4.2, designCapacity: 8.5, upstreamInflow: 4.3, downstreamCondition: "Normal", predictedImpact: "None expected" },
      { id: "C-15", label: "C-15 • Perungudi Junction", x: 510, y: 290, status: "Normal", capacity: 55, flow: 2.1, designCapacity: 3.8, upstreamInflow: 2.2, downstreamCondition: "Normal", predictedImpact: "None expected" },
      { id: "C-19", label: "C-19 • Kotturpuram Bridge", x: 245, y: 290, status: "Normal", capacity: 48, flow: 3.8, designCapacity: 9.0, upstreamInflow: 3.9, downstreamCondition: "Normal", predictedImpact: "None expected" },
    ],
    drainageEdges: [
      { from: "C-04", to: "C-07" }, { from: "C-11", to: "C-15" }, { from: "C-15", to: "C-04" }, { from: "C-19", to: "C-07" },
    ],
    incidents: [
      { id: "IN-2026-0162", location: "Velachery Main Road Km 3", type: "Drain Overflow", severity: "MODERATE", reportedAt: "11:20", status: "Under verification", impact: "Slow traffic, partial road ponding", description: "Storm drain overflowing near Velachery bus terminus. Two separate citizen reports received." },
      { id: "IN-2026-0158", location: "Adyar, East Coast Road Junction", type: "Waterlogging", severity: "MODERATE", reportedAt: "11:05", status: "Under verification", impact: "Low-lying areas near river monitoring", description: "River level rising at Adyar crossing. PWD warning issued for riverside settlements." },
      { id: "IN-2026-0151", location: "Perungudi Canal, Sector 2", type: "Blocked Drain", severity: "LOW", reportedAt: "10:40", status: "Resolved", impact: "Cleared, monitoring continuing", description: "Canal inlet blocked with construction debris. Cleared by CMWSSB at 11:15." },
    ],
    routes: [
      { id: "rA", label: "Route A", tag: "Fastest", duration: 25, floodExposure: "HIGH", predictedWater: 18, recommended: false, reason: "Passes through Velachery Main Road flood zone. 18 cm predicted depth. Not recommended." },
      { id: "rB", label: "Route B", tag: "Safer", duration: 33, floodExposure: "LOW", predictedWater: 3, recommended: true, reason: "Recommended — uses OMR elevated stretch, avoids Velachery and Adyar crossing risk zones." },
      { id: "rC", label: "Route C", tag: "Alternative", duration: 30, floodExposure: "MODERATE", predictedWater: 9, recommended: false, reason: "Uses Inner Ring Road. Moderate exposure near Adyar crossing. Monitor updates." },
    ],
    riskFactors: [
      { id: "rf1", label: "Rainfall Intensity", value: "72 mm/hr", severity: "HIGH", explanation: "Forecast peak exceeds northeast monsoon norm for this catchment. Intensification expected over next 2 hours." },
      { id: "rf2", label: "Drainage Capacity", value: "84% utilized", severity: "HIGH", explanation: "Velachery Canal approaching capacity with limited overflow margin." },
      { id: "rf3", label: "Terrain Accumulation", value: "Moderate", severity: "MODERATE", explanation: "Velachery is a natural basin area with limited outfall gradient. Surface water accumulates readily." },
      { id: "rf4", label: "Impervious Surface", value: "72%", severity: "HIGH", explanation: "Dense residential and commercial development limits natural infiltration." },
      { id: "rf5", label: "Lake Storage", value: "Velachery Lake 91% full", severity: "HIGH", explanation: "Velachery Lake near capacity. Uncontrolled overflow into road network possible during peak inflow." },
      { id: "rf6", label: "Tidal Influence", value: "Low", severity: "LOW", explanation: "Tidal influence limited to Adyar River mouth zone. Not a primary factor for inland areas." },
    ],
    whyAtRisk: "Northeast monsoon rainfall is intensifying over the Velachery basin, which has limited outfall gradient and high impervious coverage. Velachery Lake at 91% capacity may overflow during peak inflow. Canal drainage approaching saturation with a restricted downstream tidal outlet at the Adyar River.",
    forecastConfidence: 78,
    confidenceFactors: [
      { label: "Radar agreement", level: "High" },
      { label: "Lake level telemetry", level: "Medium" },
      { label: "Drainage data freshness", level: "Medium" },
      { label: "Citizen reports", level: "Low" },
    ],
    floodZones: [
      { id: "fz1", points: "355,250 445,250 455,315 430,325 355,315", risk: "HIGH", label: "Velachery Basin" },
      { id: "fz2", points: "260,310 350,310 355,360 330,368 260,360", risk: "MODERATE", label: "Adyar Margin" },
      { id: "fz3", points: "445,195 520,195 525,245 500,250 445,240", risk: "MODERATE", label: "Perungudi Canal" },
    ],
    roads: [
      { d: "M80,100 L720,100", major: true }, { d: "M80,180 L720,180", major: true },
      { d: "M80,260 L720,260", major: true }, { d: "M80,340 L720,340", major: true },
      { d: "M80,420 L720,420", major: true },
      { d: "M150,60 L150,460", major: true }, { d: "M280,60 L280,460", major: true },
      { d: "M400,60 L400,460", major: true }, { d: "M520,60 L520,460", major: true },
      { d: "M640,60 L640,460", major: true },
      { d: "M80,140 L720,140", major: false }, { d: "M80,220 L720,220", major: false },
      { d: "M80,300 L720,300", major: false }, { d: "M80,380 L720,380", major: false },
      { d: "M215,60 L215,460", major: false }, { d: "M340,60 L340,460", major: false },
      { d: "M460,60 L460,460", major: false }, { d: "M580,60 L580,460", major: false },
      { d: "M80,440 L280,380 L400,420 L560,340 L720,420", major: true },
      { d: "M80,80 L150,120 L300,80 L460,120 L620,80 L720,100", major: false },
    ],
    waterBody: "M80,280 L130,300 L160,360 L140,420 L80,460 Z",
    drainageLines: [
      "M150,180 L200,220 L245,290 L295,335",
      "M400,140 L390,200 L390,270",
      "M520,140 L475,180 L475,215",
    ],
    origin: "T. Nagar",
    destination: "Chennai Airport",
  },
};

export const initialNotifications = [
  { id: "n1", message: "Critical flood risk predicted in ITO sector.", time: "2 min ago", read: false, city: "delhi" },
  { id: "n2", message: "Drainage node D-17 approaching capacity.", time: "5 min ago", read: false, city: "delhi" },
  { id: "n3", message: "New blockage report received at Lajpat Nagar Gate 3.", time: "8 min ago", read: true, city: "delhi" },
  { id: "n4", message: "Safe route updated — Route B now recommended.", time: "12 min ago", read: true, city: "delhi" },
  { id: "n5", message: "Forecast updated: rainfall intensity increasing.", time: "15 min ago", read: true, city: "delhi" },
  { id: "n6", message: "Hindmata pump station at 99% capacity.", time: "3 min ago", read: false, city: "mumbai" },
  { id: "n7", message: "High tide advisory active. Coastal drainage restricted.", time: "10 min ago", read: false, city: "mumbai" },
];
