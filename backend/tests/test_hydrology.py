from app.services.hydrology import (
    classify_depth,
    estimate_confidence,
    green_ampt_step,
)


def test_classify_depth_boundaries():
    assert classify_depth(0.0) == "low"
    assert classify_depth(0.049) == "low"
    assert classify_depth(0.05) == "moderate"
    assert classify_depth(0.15) == "high"
    assert classify_depth(0.30) == "severe"
    assert classify_depth(5.0) == "severe"


def test_estimate_confidence_full_coverage_real_model_with_assets():
    score = estimate_confidence(
        forecast_hours_available=12,
        forecast_hours_requested=12,
        nearby_assets_found=3,
        using_demo_model=False,
    )
    assert score == 1.0


def test_estimate_confidence_penalizes_demo_model():
    with_demo = estimate_confidence(12, 12, 3, using_demo_model=True)
    without_demo = estimate_confidence(12, 12, 3, using_demo_model=False)
    assert with_demo < without_demo


def test_estimate_confidence_penalizes_short_coverage():
    full = estimate_confidence(12, 12, 3, using_demo_model=False)
    partial = estimate_confidence(6, 12, 3, using_demo_model=False)
    assert partial < full


def test_estimate_confidence_penalizes_no_nearby_assets():
    with_assets = estimate_confidence(12, 12, 3, using_demo_model=False)
    without_assets = estimate_confidence(12, 12, 0, using_demo_model=False)
    assert without_assets < with_assets


def test_estimate_confidence_bounded_0_to_1():
    score = estimate_confidence(0, 12, 0, using_demo_model=True)
    assert 0.0 <= score <= 1.0


def test_green_ampt_step_no_rainfall_returns_zero_infiltration():
    infiltration_mm, cumulative = green_ampt_step(
        rainfall_rate_mm_hr=0,
        time_step_hr=1,
        cumulative_infiltration_mm=5.0,
        suction_head_mm=100.0,
        hydraulic_conductivity_mm_hr=10.0,
        moisture_deficit=0.3,
    )
    assert infiltration_mm == 0.0
    assert cumulative == 5.0


def test_green_ampt_step_accumulates_infiltration():
    infiltration_mm, cumulative = green_ampt_step(
        rainfall_rate_mm_hr=20.0,
        time_step_hr=1.0,
        cumulative_infiltration_mm=0.0,
        suction_head_mm=100.0,
        hydraulic_conductivity_mm_hr=10.0,
        moisture_deficit=0.3,
    )
    assert infiltration_mm > 0
    assert cumulative == infiltration_mm
