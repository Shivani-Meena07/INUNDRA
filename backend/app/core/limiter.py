from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings


limiter = Limiter(key_func=get_remote_address)

# Human-readable slowapi limit string, e.g. "60/minute". A value of
# 0 disables rate limiting (an effectively unlimited quota).
RATE_LIMIT = (
    f"{settings.RATE_LIMIT_PER_MINUTE}/minute"
    if settings.RATE_LIMIT_PER_MINUTE > 0
    else "1000000/second"
)
