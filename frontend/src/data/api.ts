const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const API_KEY = import.meta.env.VITE_API_KEY || "";

/* =========================================================
   GENERIC API REQUEST
========================================================= */

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers);

  headers.set("Content-Type", "application/json");

  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  const response = await fetch(
    `${API_BASE_URL}/api${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const errorBody = await response.json();

      if (errorBody?.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/* =========================================================
   HEALTH
   GET /api/health
========================================================= */

export interface HealthResponse {
  status: string;
  service?: string;
}

export function getHealth() {
  return apiRequest<HealthResponse>("/health");
}

/* =========================================================
   SYSTEM STATUS
   GET /api/data/status
========================================================= */

export interface SystemStatusResponse {
  weather?: string;
  airport?: unknown;
  imd?: unknown;
  cwc?: unknown;
  agriculture?: unknown;
  google_elevation?: unknown;
  earth_engine?: unknown;
}

export function getSystemStatus() {
  return apiRequest<SystemStatusResponse>(
    "/data/status"
  );
}

/* =========================================================
   LIVE WEATHER
   GET /api/weather/live
========================================================= */

export interface LiveWeatherCurrent {
  temperature_2m: number | null;
  relative_humidity_2m: number | null;
  pressure_msl: number | null;
  wind_speed_10m: number | null;
  precipitation: number | null;
}

export interface WeatherForecastPoint {
  time: string;
  rainfall_mm: number;
  interval_minutes: number;
  rainfall_rate_mm_hr: number;
}

export interface LiveWeatherResponse {
  source?: string;

  latitude?: number;
  longitude?: number;

  weather: LiveWeatherCurrent;

  airport?: {
    source?: string;
    icao?: string;
    raw?: string;
    status?: string;
    error?: string;
  };

  forecast: WeatherForecastPoint[];
}

export interface WeatherParams {
  lat?: number;
  lon?: number;
}

export function getLiveWeather(
  params?: WeatherParams
) {
  const searchParams =
    new URLSearchParams();

  if (params?.lat !== undefined) {
    searchParams.set(
      "lat",
      String(params.lat)
    );
  }

  if (params?.lon !== undefined) {
    searchParams.set(
      "lon",
      String(params.lon)
    );
  }

  const query =
    searchParams.toString();

  return apiRequest<LiveWeatherResponse>(
    `/weather/live${
      query ? `?${query}` : ""
    }`
  );
}

/* =========================================================
   DRAINAGE ASSETS
   GET /api/assets/drainage
========================================================= */

export interface DrainageAsset {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  condition: string;
  swmm_node_id?: string | null;
}

export interface DrainageParams {
  lat?: number;
  lon?: number;
  radius_km?: number;
}

export function getDrainageAssets(
  params?: DrainageParams
) {
  const searchParams =
    new URLSearchParams();

  if (params?.lat !== undefined) {
    searchParams.set(
      "lat",
      String(params.lat)
    );
  }

  if (params?.lon !== undefined) {
    searchParams.set(
      "lon",
      String(params.lon)
    );
  }

  if (
    params?.radius_km !== undefined
  ) {
    searchParams.set(
      "radius_km",
      String(params.radius_km)
    );
  }

  const query =
    searchParams.toString();

  return apiRequest<DrainageAsset[]>(
    `/assets/drainage${
      query ? `?${query}` : ""
    }`
  );
}

/* =========================================================
   FLOOD STATUS
   GET /api/flood/status
========================================================= */

export interface FloodLocation {
  latitude: number;
  longitude: number;
  matched_assets: number;
}

export interface FloodNode {
  node: string;
  max_depth_m: number;
  risk: string;
  flooding: boolean;
}

export interface FloodStatusResponse {
  status: string;

  reason?: string | null;

  location?: FloodLocation | null;

  overall_risk?: string | null;

  forecast_hours?: number | null;

  forecast_rainfall_mm?: number | null;

  peak_depth_m?: number | null;

  time_to_peak?: string | null;

  critical_nodes?: string[] | null;

  flooded_nodes?: string[] | null;

  confidence?: number | null;

  nodes?: FloodNode[] | null;

  forecast?: WeatherForecastPoint[] | null;

  ai_summary?: string | null;
}

export interface FloodStatusParams {
  lat?: number;
  lon?: number;
  radius_km?: number;
  includeAiSummary?: boolean;
}

export function getFloodStatus(
  params?: FloodStatusParams
) {
  const searchParams =
    new URLSearchParams();

  if (params?.lat !== undefined) {
    searchParams.set(
      "lat",
      String(params.lat)
    );
  }

  if (params?.lon !== undefined) {
    searchParams.set(
      "lon",
      String(params.lon)
    );
  }

  if (
    params?.radius_km !== undefined
  ) {
    searchParams.set(
      "radius_km",
      String(params.radius_km)
    );
  }

  if (
    params?.includeAiSummary !==
    undefined
  ) {
    searchParams.set(
      "include_ai_summary",
      String(
        params.includeAiSummary
      )
    );
  }

  const query =
    searchParams.toString();

  return apiRequest<FloodStatusResponse>(
    `/flood/status${
      query ? `?${query}` : ""
    }`
  );
}

/* =========================================================
   CITIZEN REPORTS
   POST /api/reports
   GET /api/reports
   PATCH /api/reports/{id}/verify
   PATCH /api/reports/{id}/status
========================================================= */

export interface CitizenReport {
  id: number;
  issue_type: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: string;
  description?: string | null;
  status: string;
  created_at: string;
  verified_at?: string | null;
  assigned_team?: string | null;
  model_relevant: boolean;
}

export interface CitizenReportCreate {
  issue_type: string;
  location: string;
  latitude: number;
  longitude: number;
  severity: string;
  description?: string;
}

export async function createCitizenReport(
  report: CitizenReportCreate
): Promise<CitizenReport> {
  return apiRequest<CitizenReport>("/reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
}

export async function getCitizenReports(
  status?: string,
  severity?: string
): Promise<CitizenReport[]> {
  const searchParams = new URLSearchParams();

  if (status) {
    searchParams.set("status", status);
  }

  if (severity) {
    searchParams.set("severity", severity);
  }

  const query = searchParams.toString();

  return apiRequest<CitizenReport[]>(
    `/reports${query ? `?${query}` : ""}`
  );
}

export interface CitizenReportVerification {
  verified: boolean;
  model_relevant: boolean;
  assigned_team?: string | null;
}

export async function verifyCitizenReport(
  reportId: number,
  verification: CitizenReportVerification
): Promise<CitizenReport> {
  return apiRequest<CitizenReport>(
    `/reports/${reportId}/verify`,
    {
      method: "PATCH",
      body: JSON.stringify(verification),
    }
  );
}

export async function updateCitizenReportStatus(
  reportId: number,
  status: string
): Promise<CitizenReport> {
  return apiRequest<CitizenReport>(
    `/reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

/* =========================================================
   API BASE URL
========================================================= */

export { API_BASE_URL };