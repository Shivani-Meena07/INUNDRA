def green_ampt_step(
    rainfall_rate_mm_hr: float,
    time_step_hr: float,
    cumulative_infiltration_mm: float,
    suction_head_mm: float,
    hydraulic_conductivity_mm_hr: float,
    moisture_deficit: float
):

    if rainfall_rate_mm_hr <= 0:

        return (
            0.0,
            cumulative_infiltration_mm
        )

    if cumulative_infiltration_mm <= 0:

        infiltration_capacity = (
            hydraulic_conductivity_mm_hr
        )

    else:

        infiltration_capacity = (

            hydraulic_conductivity_mm_hr

            *

            (
                1
                +
                (
                    suction_head_mm
                    *
                    moisture_deficit
                )
                /
                cumulative_infiltration_mm
            )

        )

    infiltration_rate = min(

        rainfall_rate_mm_hr,

        max(
            hydraulic_conductivity_mm_hr,
            infiltration_capacity
        )

    )

    infiltration_mm = (

        infiltration_rate
        *
        time_step_hr

    )

    new_cumulative = (

        cumulative_infiltration_mm
        +
        infiltration_mm

    )

    return (
        infiltration_mm,
        new_cumulative
    )


def classify_depth(
    depth_m: float
) -> str:

    if depth_m < 0.05:
        return "low"

    if depth_m < 0.15:
        return "moderate"

    if depth_m < 0.30:
        return "high"

    return "severe"


def estimate_confidence(
    forecast_hours_available: int,
    forecast_hours_requested: int,
    nearby_assets_found: int,
    using_demo_model: bool
) -> float:

    """
    A simple, transparent heuristic (NOT a statistical model) that
    scores how much weight a reader should put on a given flood
    result, from 0.0 to 1.0. It penalizes:

    - a forecast that's shorter than what was requested (the API
      degraded gracefully rather than failing, but the result is
      based on less lead time than asked for)
    - having no known drainage assets near the requested point
      (results fall back to city-wide rather than local numbers)
    - running against a placeholder/demo hydraulic model rather
      than the real surveyed city network
    """

    score = 1.0

    if forecast_hours_requested > 0:

        coverage_ratio = min(
            1.0,
            forecast_hours_available / forecast_hours_requested
        )

        score *= (0.6 + 0.4 * coverage_ratio)

    if nearby_assets_found <= 0:
        score *= 0.85

    if using_demo_model:
        score *= 0.6

    return round(max(0.0, min(1.0, score)), 2)
