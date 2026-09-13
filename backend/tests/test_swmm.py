import os
from datetime import datetime
from pathlib import Path

from app.services.swmm import build_runtime_swmm_input

INP_PATH = Path(__file__).resolve().parents[1] / "data" / "city_drainage_model.inp"


def _read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def test_build_runtime_swmm_input_overrides_start_date():
    rainfall_series = [{"rainfall_rate_mm_hr": 1.0} for _ in range(3)]
    start_time = datetime(2026, 9, 12, 6, 0, 0)

    out_path = build_runtime_swmm_input(str(INP_PATH), rainfall_series, start_time=start_time)
    try:
        content = _read(out_path)
        assert "START_DATE             09/12/2026" in content
        assert "START_TIME             06:00:00" in content
        # The demo model's original 1998 start date must not survive.
        assert "01/01/1998" not in content
    finally:
        os.remove(out_path)


def test_build_runtime_swmm_input_injects_rainfall_timeseries():
    rainfall_series = [
        {"rainfall_rate_mm_hr": 0.0},
        {"rainfall_rate_mm_hr": 12.5},
    ]
    start_time = datetime(2026, 9, 12, 6, 0, 0)

    out_path = build_runtime_swmm_input(str(INP_PATH), rainfall_series, start_time=start_time)
    try:
        content = _read(out_path)
        assert "[TIMESERIES]" in content
        # This model's FLOW_UNITS is CFS (US units), so mm/hr should
        # have been converted to in/hr (12.5 mm/hr = 0.4921 in/hr).
        assert "0.4921" in content
    finally:
        os.remove(out_path)


def test_build_runtime_swmm_input_cleans_up_on_read_failure(tmp_path):
    missing_path = tmp_path / "does_not_exist.inp"
    try:
        build_runtime_swmm_input(str(missing_path), [{"rainfall_rate_mm_hr": 1.0}])
        assert False, "expected FileNotFoundError"
    except FileNotFoundError:
        pass
