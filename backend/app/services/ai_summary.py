from typing import Any
import json

import httpx

from app.core.config import settings


ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"


def _build_prompt(flood_result: dict[str, Any]) -> str:
    return (
        "You are writing a short public flood briefing for a city "
        "dashboard. Given this JSON output from a hydraulic flood "
        "simulation, write 2-3 plain-language sentences a "
        "non-technical resident could understand: what the risk "
        "level is, roughly when it peaks if known, and one practical "
        "takeaway. Do not invent numbers that are not in the JSON. "
        "If status is 'degraded' or 'unavailable', say plainly that "
        "a full simulation isn't available right now and only "
        "weather data is shown.\n\n"
        f"JSON:\n{json.dumps(flood_result, default=str)}"
    )


async def generate_flood_briefing(flood_result: dict[str, Any]) -> dict[str, Any]:
    """
    Calls Claude to turn the structured /flood/status JSON into a
    short human-readable briefing string. This is what lets a
    frontend show a real sentence ("Moderate flooding expected near
    Node 21 within 4 hours") instead of just a raw risk label.

    Returns {"status": "ok", "summary": "..."} on success, or
    {"status": "unavailable"/"error", "reason": "..."} if no API
    key is configured or the call fails — callers should treat a
    missing summary as optional, not fatal.
    """
    if not settings.ANTHROPIC_API_KEY:
        return {"status": "unavailable", "reason": "ANTHROPIC_API_KEY not configured"}

    payload = {
        "model": settings.ANTHROPIC_MODEL,
        "max_tokens": 200,
        "messages": [{"role": "user", "content": _build_prompt(flood_result)}]
    }

    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(ANTHROPIC_MESSAGES_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

        text_parts = [
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        ]
        summary = "".join(text_parts).strip()

        if not summary:
            return {"status": "error", "reason": "Model returned no text content"}

        return {"status": "ok", "summary": summary}

    except Exception as error:
        return {"status": "error", "reason": str(error)}
