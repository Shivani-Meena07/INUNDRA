from fastapi import Header, HTTPException

from app.core.config import settings


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """
    Lightweight shared-secret auth for the /api routes.

    If settings.API_KEY is unset (the default in demo mode), this is
    a no-op and the API stays open — that's a deliberate choice for
    running the prototype locally without extra setup. Set API_KEY
    in .env for any deployment that isn't purely local/demo, and
    every request must then send a matching `X-API-Key` header.

    This is intentionally simple (a single shared key checked with a
    non-constant-time comparison isn't ideal against a determined
    attacker with network-level timing access). For a real deployment
    with multiple clients/users, replace this with proper per-client
    API keys or OAuth2, not just a stronger version of this check.
    """
    if not settings.API_KEY:
        return

    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
