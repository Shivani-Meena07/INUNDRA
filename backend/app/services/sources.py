from typing import Optional, Any

import httpx

from app.core.config import settings


async def fetch_configured_json(
    url: Optional[str],
    api_key: Optional[str],
    source_name: str
) -> dict[str, Any]:
    """Generic fetcher for the stub government data sources (IMD, CWC,
    Agriculture). Returns "unavailable" if no URL is configured, "error"
    on a failed request, or "ok" with the raw JSON payload otherwise.
    """
    if not url:
        return {
            "source": source_name,
            "status": "unavailable",
            "reason": "API endpoint not configured"
        }

    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return {"source": source_name, "status": "ok", "data": response.json()}

    except Exception as error:
        return {"source": source_name, "status": "error", "error": str(error)}


async def fetch_imd():
    return await fetch_configured_json(settings.IMD_API_URL, settings.IMD_API_KEY, "IMD")


async def fetch_cwc():
    return await fetch_configured_json(settings.CWC_API_URL, settings.CWC_API_KEY, "CWC")


async def fetch_agriculture():
    return await fetch_configured_json(
        settings.AGRI_API_URL, settings.AGRI_API_KEY, "AGRICULTURE_DEPARTMENT"
    )


async def fetch_google_elevation(latitude: float, longitude: float) -> dict[str, Any]:
    if not settings.GOOGLE_MAPS_API_KEY:
        return {
            "source": "Google Elevation",
            "status": "unavailable",
            "reason": "GOOGLE_MAPS_API_KEY not configured"
        }

    url = "https://maps.googleapis.com/maps/api/elevation/json"
    params = {"locations": f"{latitude},{longitude}", "key": settings.GOOGLE_MAPS_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return {"source": "Google Elevation", "status": "ok", "data": response.json()}

    except Exception as error:
        return {"source": "Google Elevation", "status": "error", "error": str(error)}


def earth_engine_status():
    if not settings.GOOGLE_EE_PROJECT:
        return {
            "source": "Google Earth Engine",
            "status": "unavailable",
            "reason": "GOOGLE_EE_PROJECT not configured"
        }

    try:
        import ee

        ee.Initialize(project=settings.GOOGLE_EE_PROJECT)
        return {"source": "Google Earth Engine", "status": "ready"}

    except Exception as error:
        return {"source": "Google Earth Engine", "status": "unavailable", "reason": str(error)}
