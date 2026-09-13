import asyncio
from typing import Any

import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def rainfall_rate_mm_hr(rainfall_mm: float, interval_minutes: int) -> float:
    if interval_minutes <= 0:
        raise ValueError("interval_minutes must be greater than zero")

    return rainfall_mm * 60.0 / interval_minutes


def imd_24h_category(rainfall_mm: float) -> str:
    """
    IMPORTANT: these categories are for accumulated 24h rainfall.
    They are NOT hourly rainfall-rate thresholds.
    """
    if rainfall_mm < 0.1:
        return "trace"
    if rainfall_mm <= 2.4:
        return "very_light"
    if rainfall_mm <= 15.5:
        return "light"
    if rainfall_mm <= 64.4:
        return "moderate"
    if rainfall_mm <= 115.5:
        return "heavy"
    if rainfall_mm <= 204.4:
        return "very_heavy"
    return "extremely_heavy"


async def fetch_open_meteo(latitude: float, longitude: float) -> dict[str, Any]:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,relative_humidity_2m,pressure_msl,"
            "wind_speed_10m,precipitation"
        ),
        "hourly": "precipitation,rain,showers",
        "forecast_days": 2,
        "timezone": "UTC"
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        data = response.json()

    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    rainfall = hourly.get("precipitation", [])

    series = []
    for i, time_value in enumerate(times):
        rain_mm = float(rainfall[i] or 0) if i < len(rainfall) else 0.0
        rate = rainfall_rate_mm_hr(rain_mm, 60)

        series.append({
            "time": time_value,
            "rainfall_mm": rain_mm,
            "interval_minutes": 60,
            "rainfall_rate_mm_hr": rate
        })

    # Open-Meteo's "current" block does not always include every
    # requested variable (depends on API version/response shape).
    # Default any missing fields instead of assuming they exist.
    current = data.get("current", {}) or {}
    current.setdefault("precipitation", 0)
    current.setdefault("temperature_2m", None)
    current.setdefault("relative_humidity_2m", None)
    current.setdefault("pressure_msl", None)
    current.setdefault("wind_speed_10m", None)

    return {
        "source": "Open-Meteo",
        "latitude": latitude,
        "longitude": longitude,
        "current": current,
        "series": series
    }


def _fetch_metar_sync(icao: str) -> dict[str, Any]:
    """
    Runs the blocking avwx network call. Must be executed off the
    asyncio event loop (see fetch_metar), since avwx's update()
    is a synchronous, blocking HTTP call.
    """
    try:
        from avwx import Metar

        station = Metar(icao)
        station.update()

        return {"source": "METAR", "icao": icao, "raw": station.raw, "status": "ok"}

    except Exception as error:
        return {"source": "METAR", "icao": icao, "status": "unavailable", "error": str(error)}


async def fetch_metar(icao: str) -> dict[str, Any]:
    # avwx's Metar.update() is synchronous and blocks on network I/O.
    # Running it directly inside an `async def` would block the whole
    # event loop for every other request being served. Offload it to
    # a worker thread instead.
    return await asyncio.to_thread(_fetch_metar_sync, icao)
