import pytest

from app.services.weather import rainfall_rate_mm_hr, imd_24h_category


def test_rainfall_rate_mm_hr_60_minute_interval_is_unchanged():
    assert rainfall_rate_mm_hr(5.0, 60) == 5.0


def test_rainfall_rate_mm_hr_30_minute_interval_doubles():
    assert rainfall_rate_mm_hr(5.0, 30) == 10.0


def test_rainfall_rate_mm_hr_rejects_zero_interval():
    with pytest.raises(ValueError):
        rainfall_rate_mm_hr(5.0, 0)


def test_rainfall_rate_mm_hr_rejects_negative_interval():
    with pytest.raises(ValueError):
        rainfall_rate_mm_hr(5.0, -10)


@pytest.mark.parametrize(
    "rainfall_mm,expected",
    [
        (0.0, "trace"),
        (2.4, "very_light"),
        (15.5, "light"),
        (64.4, "moderate"),
        (115.5, "heavy"),
        (204.4, "very_heavy"),
        (300.0, "extremely_heavy"),
    ],
)
def test_imd_24h_category_boundaries(rainfall_mm, expected):
    assert imd_24h_category(rainfall_mm) == expected
