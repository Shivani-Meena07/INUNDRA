from app.services.geo import haversine_km, nearby_drainage_assets
from app.models.models import DrainageAsset


def test_haversine_km_zero_distance_for_same_point():
    assert haversine_km(28.6139, 77.2090, 28.6139, 77.2090) == 0.0


def test_haversine_km_known_distance_connaught_place_to_dwarka():
    # Connaught Place to Dwarka, Delhi is roughly 18-20 km apart.
    distance = haversine_km(28.6315, 77.2167, 28.5921, 77.0460)
    assert 15 < distance < 25


def test_nearby_drainage_assets_filters_by_radius(db_session):
    near = DrainageAsset(
        name="Near point", latitude=28.6139, longitude=77.2090,
        condition="normal", swmm_node_id="9"
    )
    far = DrainageAsset(
        name="Far point (Rohini)", latitude=28.7495, longitude=77.0565,
        condition="normal", swmm_node_id="13"
    )
    db_session.add_all([near, far])
    db_session.commit()

    results = nearby_drainage_assets(db_session, 28.6139, 77.2090, radius_km=2.0)

    names = {asset.name for asset in results}
    assert "Near point" in names
    assert "Far point (Rohini)" not in names
