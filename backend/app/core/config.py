from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    DATABASE_URL: str = f"sqlite:///{ROOT / 'floodguard.db'}"

    DEFAULT_LAT: float = 28.6139
    DEFAULT_LON: float = 77.2090

    DEFAULT_ICAO: str = "VIDP"

    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_EE_PROJECT: Optional[str] = None

    IMD_API_URL: Optional[str] = None
    IMD_API_KEY: Optional[str] = None

    CWC_API_URL: Optional[str] = None
    CWC_API_KEY: Optional[str] = None

    AGRI_API_URL: Optional[str] = None
    AGRI_API_KEY: Optional[str] = None

    SWMM_INP_PATH: str = "data/city_drainage_model.inp"

    SWMM_FORECAST_HOURS: int = 12

    # True while data/city_drainage_model.inp is the EPA "Example1"
    # placeholder network rather than a real surveyed model of the
    # actual city being monitored. Used only to discount the
    # "confidence" score returned by /flood/status — flip to False
    # once a real city drainage model is swapped in.
    SWMM_MODEL_IS_DEMO: bool = True

    # Used by app/services/ai_summary.py to turn the raw hydraulic
    # JSON into a short, plain-language flood briefing. Optional —
    # the endpoint degrades gracefully (skips the summary) if unset.
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-sonnet-5"

    DEMO_MODE: bool = True

    # Comma-separated list of allowed CORS origins, e.g.
    # "https://floodguard.example.com,https://admin.example.com".
    # Left as "*" only in DEMO_MODE; set explicitly for any real
    # deployment so the API doesn't accept requests from any origin.
    ALLOWED_ORIGINS: str = "*"

    # If set, all /api routes (except /api/health) require an
    # `X-API-Key` header matching this value. Left unset in demo
    # mode so the prototype keeps working out of the box.
    API_KEY: Optional[str] = None

    # Requests allowed per client IP per minute, applied to all
    # /api routes. Set to 0 to disable rate limiting entirely.
    RATE_LIMIT_PER_MINUTE: int = 60

    @property
    def allowed_origins_list(self) -> list[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
        return [o for o in origins if o]


settings = Settings()
