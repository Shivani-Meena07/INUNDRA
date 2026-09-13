from app.models.models import DrainageAsset


def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "FloodGuard Backend"}


def test_list_drainage_assets_empty_db(client):
    response = client.get("/api/assets/drainage")
    assert response.status_code == 200
    assert response.json() == []


def test_list_drainage_assets_returns_seeded_rows(client, db_session):
    db_session.add(
        DrainageAsset(
            name="Connaught Place storm junction",
            latitude=28.6315,
            longitude=77.2167,
            condition="normal",
            swmm_node_id="9",
        )
    )
    db_session.commit()

    response = client.get("/api/assets/drainage")
    assert response.status_code == 200

    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Connaught Place storm junction"
    assert body[0]["swmm_node_id"] == "9"


def test_list_drainage_assets_filters_by_location(client, db_session):
    db_session.add_all([
        DrainageAsset(
            name="Connaught Place storm junction", latitude=28.6315, longitude=77.2167,
            condition="normal", swmm_node_id="9"
        ),
        DrainageAsset(
            name="Rohini storm junction", latitude=28.7495, longitude=77.0565,
            condition="normal", swmm_node_id="13"
        ),
    ])
    db_session.commit()

    response = client.get(
        "/api/assets/drainage", params={"lat": 28.6315, "lon": 77.2167, "radius_km": 2.0}
    )
    assert response.status_code == 200

    names = {row["name"] for row in response.json()}
    assert names == {"Connaught Place storm junction"}
