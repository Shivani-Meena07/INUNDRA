from math import radians, sin, cos, sqrt, atan2

from sqlalchemy.orm import Session

from app.models.models import DrainageAsset


EARTH_RADIUS_KM = 6371.0088


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points, in kilometers."""
    lat1_r, lat2_r = radians(lat1), radians(lat2)
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2) ** 2 + cos(lat1_r) * cos(lat2_r) * sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * atan2(sqrt(a), sqrt(1 - a))


def nearby_drainage_assets(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 2.0
) -> list[DrainageAsset]:
    """Returns drainage assets within radius_km of the given point.

    NOTE: filters in Python after loading all assets, which is fine
    at demo scale (a few dozen rows) but should move to a bounding-box
    SQL WHERE clause (or PostGIS) before this table grows large.
    """
    assets = db.query(DrainageAsset).all()
    return [
        asset for asset in assets
        if haversine_km(latitude, longitude, asset.latitude, asset.longitude) <= radius_km
    ]
