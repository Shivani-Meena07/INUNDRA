from pathlib import Path
import tempfile
import os
from datetime import datetime, timedelta


def build_runtime_swmm_input(
    base_path: str,
    rainfall_series: list[dict],
    start_time: datetime | None = None
) -> str:

    """
    start_time: the real-world timestamp the simulation should begin
    at (typically "now", since we're feeding it a live weather
    forecast). Demo/example .inp files usually ship with an
    arbitrary historical START_DATE (e.g. 1998) baked in — if we
    didn't override it, every "time_to_peak" the API returns would
    be a nonsensical date decades in the past. Defaults to the
    current UTC time if not supplied.
    """

    if start_time is None:
        start_time = datetime.utcnow()

    original = Path(base_path).read_text(encoding="utf-8")
    lines = original.splitlines()

    output = []
    inside_timeseries = False
    inside_options = False
    inside_raingages = False

    # A [RAINGAGES] entry looks like:
    #   RG1   INTENSITY  1:00  1.0   TIMESERIES  TS1
    # We need the *actual* series name(s) the gages point at, so
    # the timeseries we inject below actually gets used by the
    # model instead of silently being ignored (or worse, leaving
    # a raingage pointing at a now-deleted series).
    rain_series_names: set[str] = set()

    # SWMM's unit system is driven entirely by FLOW_UNITS: CFS/GPM/MGD
    # mean US units, where rainfall intensity is expected in in/hr.
    # CMS/LPS/MLD mean metric, where it's mm/hr. Open-Meteo always
    # gives us mm/hr, so we convert if the model is a US-unit model —
    # otherwise flows would be ~25x too high (1 mm = 0.0394 in) and
    # every simulation would look like a catastrophic flood.
    us_flow_units = {"CFS", "GPM", "MGD"}
    flow_units = None

    for line in lines:
        stripped = line.strip()
        stripped_upper = stripped.upper()

        if stripped_upper.startswith("FLOW_UNITS"):
            parts = line.split()
            if len(parts) >= 2:
                flow_units = parts[1].upper()

        if stripped_upper == "[RAINGAGES]":
            inside_raingages = True
            continue

        if inside_raingages:
            if stripped_upper.startswith("["):
                inside_raingages = False
            elif stripped and not stripped.startswith(";"):
                parts = stripped.split()
                if len(parts) >= 6 and parts[4].upper() == "TIMESERIES":
                    rain_series_names.add(parts[5])

    # Fall back to a default name if the model has no raingages
    # referencing a timeseries (nothing will consume the injected
    # rain, but this avoids crashing on an unusual model).
    if not rain_series_names:
        rain_series_names.add("FLOODGUARD_RAIN")

    convert_mm_to_in = flow_units in us_flow_units

    end_dt = start_time + timedelta(hours=len(rainfall_series))

    start_date_str = start_time.strftime("%m/%d/%Y")
    start_time_str = start_time.strftime("%H:%M:%S")
    end_date_str = end_dt.strftime("%m/%d/%Y")
    end_time_str = end_dt.strftime("%H:%M:%S")

    # Any of these four keys inside [OPTIONS] get overwritten with
    # the real-time values computed above.
    options_overrides = {
        "START_DATE": f"START_DATE             {start_date_str}",
        "START_TIME": f"START_TIME             {start_time_str}",
        "REPORT_START_DATE": f"REPORT_START_DATE      {start_date_str}",
        "REPORT_START_TIME": f"REPORT_START_TIME      {start_time_str}",
        "END_DATE": f"END_DATE               {end_date_str}",
        "END_TIME": f"END_TIME               {end_time_str}"
    }

    for line in lines:
        stripped = line.strip().upper()

        if stripped == "[OPTIONS]":
            inside_options = True
            output.append(line)
            continue

        if inside_options:
            if stripped.startswith("["):
                inside_options = False
            else:
                matched_key = next(
                    (
                        key
                        for key in options_overrides
                        if stripped.startswith(key)
                    ),
                    None
                )
                if matched_key:
                    output.append(options_overrides[matched_key])
                    continue

        if stripped == "[TIMESERIES]":
            inside_timeseries = True
            output.append("[TIMESERIES]")
            output.append(";;Name              Time      Value")
            for series_name in sorted(rain_series_names):
                for i, rainfall in enumerate(rainfall_series):
                    rate = max(
                        0.0,
                        float(rainfall.get("rainfall_rate_mm_hr", 0))
                    )
                    if convert_mm_to_in:
                        rate = rate / 25.4
                    output.append(
                        f"{series_name:<20}{i:02d}:00     {rate:.4f}"
                    )
            continue

        if inside_timeseries and stripped.startswith("["):
            inside_timeseries = False

        if not inside_timeseries:
            output.append(line)

    fd, temp_path = tempfile.mkstemp(
        prefix="floodguard_",
        suffix=".inp"
    )

    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write("\n".join(output))
    except Exception:
        try:
            os.close(fd)
        except OSError:
            pass
        raise

    return temp_path


def run_swmm(input_file: str) -> dict[str, dict]:
    """
    Runs the SWMM simulation and returns a per-node summary:
    {node_id: {"max_depth_m", "flooding", "time_at_peak"}}.

    NOTE on memory: earlier versions of this function appended a raw
    row (depth/flooding/head/time) for *every node at every routing
    step* into one big list, then summarized it afterward. That's
    fine for a tiny demo network but scales linearly with
    nodes x timesteps — on a real city model (hundreds of nodes,
    thousands of steps) that list can grow into the hundreds of
    thousands of rows and blow up memory. Instead we aggregate each
    node's max depth / flooding / peak time incrementally as the
    simulation advances, so memory stays O(number of nodes)
    regardless of how many timesteps the simulation runs for.

    NOTE: this performs blocking I/O and CPU work (the SWMM engine
    runs synchronously). Callers from async route handlers should
    wrap this in asyncio.to_thread(...) rather than awaiting it
    directly, or it will block the event loop for the duration of
    the simulation.
    """

    try:
        from pyswmm import Simulation, Nodes
    except Exception as error:
        raise RuntimeError(f"PySWMM is not available: {error}")

    per_node: dict[str, dict] = {}

    try:
        with Simulation(input_file) as simulation:
            nodes = Nodes(simulation)

            for _ in simulation:
                current_time = str(simulation.current_time)

                for node in nodes:
                    try:
                        depth_m = float(node.depth)
                        flooding_cms = float(node.flooding)
                    except Exception:
                        continue

                    entry = per_node.setdefault(
                        node.nodeid,
                        {"max_depth_m": 0.0, "flooding": False, "time_at_peak": current_time}
                    )

                    if depth_m > entry["max_depth_m"]:
                        entry["max_depth_m"] = depth_m
                        entry["time_at_peak"] = current_time

                    if flooding_cms > 0:
                        entry["flooding"] = True
    finally:
        # The runtime .inp file is generated fresh per request by
        # build_runtime_swmm_input(); clean it up so temp files
        # don't accumulate on disk.
        try:
            os.remove(input_file)
        except OSError:
            pass

    return per_node
