from datetime import datetime
from pathlib import Path
from typing import Optional
import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import require_api_key
from app.core.limiter import limiter, RATE_LIMIT
from app.db.session import get_db
from app.models.models import WeatherObservation, DrainageAsset
from app.services.weather import fetch_open_meteo, fetch_metar, rainfall_rate_mm_hr
from app.services.sources import (
    fetch_imd,
    fetch_cwc,
    fetch_agriculture,
    fetch_google_elevation,
    earth_engine_status
)
from app.services.swmm import build_runtime_swmm_input, run_swmm
from app.services.hydrology import classify_depth, estimate_confidence
from app.services.geo import nearby_drainage_assets
from app.services.ai_summary import generate_flood_briefing
from app.schemas import FloodStatusResponse, LocationInfo, NodeRisk, DrainageAssetOut


router = APIRouter()


@router.get("/health")
def health():
    # Deliberately not behind require_api_key / rate limiting: this
    # is the endpoint load balancers and uptime checks hit.
    return {"status": "ok", "service": "FloodGuard Backend"}


@router.get("/data/status", dependencies=[Depends(require_api_key)])
@limiter.limit(RATE_LIMIT)
async def data_status(
    request: Request,
    lat: Optional[float] = Query(
        None, description="Latitude to check elevation data for. Defaults to DEFAULT_LAT."
    ),
    lon: Optional[float] = Query(
        None, description="Longitude to check elevation data for. Defaults to DEFAULT_LON."
    )
):
    latitude = lat if lat is not None else settings.DEFAULT_LAT
    longitude = lon if lon is not None else settings.DEFAULT_LON

    return {
        "weather": "Open-Meteo",
        "airport": await fetch_metar(settings.DEFAULT_ICAO),
        "imd": await fetch_imd(),
        "cwc": await fetch_cwc(),
        "agriculture": await fetch_agriculture(),
        "google_elevation": await fetch_google_elevation(latitude, longitude),
        "earth_engine": earth_engine_status()
    }


@router.get("/weather/live", dependencies=[Depends(require_api_key)])
@limiter.limit(RATE_LIMIT)
async def weather_live(
    request: Request,
    lat: Optional[float] = Query(
        None, description="Latitude to fetch live weather for. Defaults to DEFAULT_LAT."
    ),
    lon: Optional[float] = Query(
        None, description="Longitude to fetch live weather for. Defaults to DEFAULT_LON."
    ),
    db: Session = Depends(get_db)
):
    latitude = lat if lat is not None else settings.DEFAULT_LAT
    longitude = lon if lon is not None else settings.DEFAULT_LON

    weather = await fetch_open_meteo(latitude, longitude)
    current = weather["current"]

    rainfall_mm = float(current.get("precipitation", 0) or 0)

    # Open-Meteo's "current" block is a snapshot for the current
    # hourly step, so rainfall_mm is already a per-hour amount here —
    # convert it through the same rainfall_rate_mm_hr() helper the
    # hourly series uses (interval_minutes=60) instead of assigning
    # the raw precipitation value directly, so both fields can't
    # silently drift apart if that assumption ever changes.
    observation = WeatherObservation(
        latitude=latitude,
        longitude=longitude,
        rainfall_mm=rainfall_mm,
        rainfall_rate_mm_hr=rainfall_rate_mm_hr(rainfall_mm, 60),
        source="Open-Meteo"
    )

    db.add(observation)
    db.commit()

    return {
        "weather": current,
        "airport": await fetch_metar(settings.DEFAULT_ICAO),
        "forecast": weather["series"][:12]
    }


@router.get(
    "/assets/drainage",
    response_model=list[DrainageAssetOut],
    dependencies=[Depends(require_api_key)]
)
@limiter.limit(RATE_LIMIT)
def list_drainage_assets(
    request: Request,
    lat: Optional[float] = Query(
        None, description="If given (with lon), only returns assets within radius_km of this point."
    ),
    lon: Optional[float] = Query(None),
    radius_km: float = Query(5.0, description="Search radius in km when lat/lon are given."),
    db: Session = Depends(get_db)
):
    """
    Lists known drainage infrastructure (manholes, junctions,
    outfalls) with real-world coordinates and the SWMM node ID each
    one corresponds to. Useful for a frontend to plot markers on a
    map, or to let a user click a point and see which simulation
    node it maps to.
    """
    if lat is not None and lon is not None:
        assets = nearby_drainage_assets(db, lat, lon, radius_km=radius_km)
    else:
        assets = db.query(DrainageAsset).all()

    return assets


@router.get(
    "/flood/status",
    response_model=FloodStatusResponse,
    dependencies=[Depends(require_api_key)]
)
@limiter.limit(RATE_LIMIT)
async def flood_status(
    request: Request,
    lat: Optional[float] = Query(
        None, description="Latitude to check flood risk for. Defaults to DEFAULT_LAT (city-wide view)."
    ),
    lon: Optional[float] = Query(
        None, description="Longitude to check flood risk for. Defaults to DEFAULT_LON (city-wide view)."
    ),
    radius_km: float = Query(
        5.0,
        description="How far from lat/lon to look for known drainage assets when narrowing "
                    "results to a specific location."
    ),
    include_ai_summary: bool = Query(
        False,
        description="If true, also asks Claude to turn the result into a short plain-language "
                    "briefing (requires ANTHROPIC_API_KEY to be set)."
    ),
    db: Session = Depends(get_db)
):
    """
    Pulls the rainfall forecast for the requested point, feeds it
    into the SWMM drainage model as a synthetic rainfall time
    series, runs the hydraulic simulation, and summarizes flood
    risk — narrowed to known drainage assets near that point when
    available, or city-wide otherwise.

    If no SWMM input model is configured/available on disk, this
    degrades gracefully to a weather-only response instead of
    throwing a 500.
    """
    latitude = lat if lat is not None else settings.DEFAULT_LAT
    longitude = lon if lon is not None else settings.DEFAULT_LON

    location = LocationInfo(latitude=latitude, longitude=longitude, matched_assets=0)

    weather = await fetch_open_meteo(latitude, longitude)
    forecast_series = weather["series"][:settings.SWMM_FORECAST_HOURS]

    forecast_rainfall_mm = round(
        sum(float(point.get("rainfall_mm", 0) or 0) for point in forecast_series), 2
    )

    nearby_assets = nearby_drainage_assets(db, latitude, longitude, radius_km=radius_km)
    location.matched_assets = len(nearby_assets)

    relevant_node_ids = {
        asset.swmm_node_id for asset in nearby_assets if asset.swmm_node_id
    }

    inp_path = Path(settings.SWMM_INP_PATH)
    if not inp_path.is_absolute():
        # SWMM_INP_PATH in .env is relative to the project root.
        inp_path = Path(__file__).resolve().parents[2] / inp_path

    if not inp_path.exists():
        confidence = estimate_confidence(
            forecast_hours_available=len(forecast_series),
            forecast_hours_requested=settings.SWMM_FORECAST_HOURS,
            nearby_assets_found=len(nearby_assets),
            using_demo_model=settings.SWMM_MODEL_IS_DEMO
        )

        return FloodStatusResponse(
            status="degraded",
            reason=(
                f"SWMM input model not found at {inp_path}. "
                "Flood simulation skipped; returning weather forecast only."
            ),
            location=location,
            forecast_hours=len(forecast_series),
            forecast_rainfall_mm=forecast_rainfall_mm,
            confidence=confidence,
            forecast=forecast_series
        )

    try:
        runtime_input_path = build_runtime_swmm_input(
            str(inp_path), forecast_series, start_time=datetime.utcnow()
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to build SWMM input: {error}")

    try:
        # run_swmm() is blocking (pyswmm runs the hydraulic engine
        # synchronously). Offload it to a worker thread so it does
        # not stall the event loop / other concurrent requests.
        per_node = await asyncio.to_thread(run_swmm, runtime_input_path)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"SWMM simulation failed: {error}")

    # Narrow to nodes near the requested location when we know of
    # any; otherwise fall back to reporting on the whole network.
    node_ids_to_report = relevant_node_ids & set(per_node.keys())
    if not node_ids_to_report:
        node_ids_to_report = set(per_node.keys())

    nodes_summary = [
        NodeRisk(
            node=node_id,
            max_depth_m=round(info["max_depth_m"], 4),
            risk=classify_depth(info["max_depth_m"]),
            flooding=info["flooding"]
        )
        for node_id, info in per_node.items()
        if node_id in node_ids_to_report
    ]

    if not nodes_summary:
        raise HTTPException(status_code=500, detail="SWMM simulation produced no node results.")

    risk_order = ["low", "moderate", "high", "severe"]
    overall_risk = "low"
    for node in nodes_summary:
        if risk_order.index(node.risk) > risk_order.index(overall_risk):
            overall_risk = node.risk

    peak_node = max(nodes_summary, key=lambda n: n.max_depth_m)

    critical_nodes = [
        n.node for n in sorted(nodes_summary, key=lambda n: n.max_depth_m, reverse=True)[:3]
    ]

    flooded_nodes = [n.node for n in nodes_summary if n.flooding]

    confidence = estimate_confidence(
        forecast_hours_available=len(forecast_series),
        forecast_hours_requested=settings.SWMM_FORECAST_HOURS,
        nearby_assets_found=len(nearby_assets),
        using_demo_model=settings.SWMM_MODEL_IS_DEMO
    )

    result = FloodStatusResponse(
        status="ok",
        location=location,
        overall_risk=overall_risk,
        forecast_hours=len(forecast_series),
        forecast_rainfall_mm=forecast_rainfall_mm,
        peak_depth_m=peak_node.max_depth_m,
        time_to_peak=per_node[peak_node.node]["time_at_peak"],
        critical_nodes=critical_nodes,
        flooded_nodes=flooded_nodes,
        confidence=confidence,
        nodes=nodes_summary
    )

    if include_ai_summary:
        ai_result = await generate_flood_briefing(result.model_dump())
        if ai_result.get("status") == "ok":
            result.ai_summary = ai_result["summary"]

    return result
