from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NodeRisk(BaseModel):

    node: str

    max_depth_m: float

    risk: str

    flooding: bool


class LocationInfo(BaseModel):

    latitude: float

    longitude: float

    matched_assets: int


class DrainageAssetOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int

    name: str

    latitude: float

    longitude: float

    condition: str

    swmm_node_id: Optional[str] = None

class CitizenReportCreate(BaseModel):

    issue_type: str

    location: str

    latitude: float

    longitude: float

    severity: str = "LOW"

    description: Optional[str] = None


class CitizenReportOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int

    issue_type: str

    location: str

    latitude: float

    longitude: float

    severity: str

    description: Optional[str] = None

    status: str

    created_at: datetime

    verified_at: Optional[datetime] = None

    assigned_team: Optional[str] = None

    model_relevant: bool


class ReportVerifyRequest(BaseModel):

    verified: bool

    model_relevant: bool = False

    assigned_team: Optional[str] = None


class ReportStatusRequest(BaseModel):

    status: str

class FloodStatusResponse(BaseModel):

    status: str

    reason: Optional[str] = None

    location: Optional[LocationInfo] = None

    overall_risk: Optional[str] = None

    forecast_hours: Optional[int] = None

    forecast_rainfall_mm: Optional[float] = None

    peak_depth_m: Optional[float] = None

    time_to_peak: Optional[str] = None

    critical_nodes: Optional[list[str]] = None

    flooded_nodes: Optional[list[str]] = None

    confidence: Optional[float] = None

    nodes: Optional[list[NodeRisk]] = None

    forecast: Optional[list[dict]] = None

    ai_summary: Optional[str] = None
