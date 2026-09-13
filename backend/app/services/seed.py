from sqlalchemy.orm import Session

from app.models.models import DrainageAsset


# Node IDs pulled directly from data/city_drainage_model.inp's
# [JUNCTIONS] / [OUTFALLS] sections (the EPA "Example1" demo model).
#
# IMPORTANT: the .inp file's own [COORDINATES] are drawing-canvas
# units (0-10000), not real lat/lon, so they can't be used for
# geographic proximity lookups. Each node below is instead pinned to
# a real Delhi locality's approximate lat/lon, so the "find nodes
# near this real-world point" pipeline exercises genuinely different
# parts of the city (not one small cluster) end-to-end. These are
# still a demo hydraulic network (EPA Example1), not a surveyed model
# of Delhi's actual drainage — replace with real surveyed asset
# locations mapped to a real city model before relying on this for
# anything beyond a demo.
_DEMO_ASSETS = [
    ("9",  28.6315, 77.2167, "Connaught Place storm junction"),
    ("10", 28.6519, 77.1909, "Karol Bagh storm junction"),
    ("13", 28.7495, 77.0565, "Rohini storm junction"),
    ("14", 28.6980, 77.1310, "Pitampura storm junction"),
    ("15", 28.5921, 77.0460, "Dwarka storm junction"),
    ("16", 28.6219, 77.0878, "Janakpuri storm junction"),
    ("17", 28.5245, 77.2066, "Saket storm junction"),
    ("19", 28.5244, 77.1594, "Vasant Kunj storm junction"),
    ("20", 28.5677, 77.2431, "Lajpat Nagar storm junction"),
    ("21", 28.6096, 77.2952, "Mayur Vihar storm junction"),
    ("22", 28.6692, 77.2897, "Shahdara storm junction"),
    ("23", 28.5355, 77.2856, "Okhla storm junction"),
    ("24", 28.6092, 76.9793, "Najafgarh storm junction"),
    ("18", 28.6595, 77.2426, "Yamuna Bazar outfall (discharge into Yamuna)")
]


def seed_demo_drainage_assets(db: Session) -> int:
    """
    Populates the drainage_assets table with placeholder geocoded
    points spread across different parts of Delhi (see _DEMO_ASSETS
    above) the first time the app starts against an empty database,
    so location-based flood queries have something real to resolve
    against immediately.

    Returns the number of rows inserted (0 if the table already
    had data, in which case nothing is touched).
    """

    if db.query(DrainageAsset).first() is not None:
        return 0

    inserted = 0

    for node_id, lat, lon, label in _DEMO_ASSETS:
        db.add(
            DrainageAsset(
                name=label,
                latitude=lat,
                longitude=lon,
                condition="normal",
                swmm_node_id=node_id
            )
        )
        inserted += 1

    db.commit()

    return inserted
