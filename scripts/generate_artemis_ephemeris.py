#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import ssl
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

LAUNCH = dt.datetime.fromisoformat("2026-04-01T22:35:12+00:00")
TLI = dt.datetime.fromisoformat("2026-04-02T23:49:00+00:00")
FLYBY = dt.datetime.fromisoformat("2026-04-06T18:45:00+00:00")

EARTH_RADIUS_KM = 6378.137
MOON_RADIUS_KM = 1737.4
UNVERIFIED_SSL_CONTEXT = ssl._create_unverified_context()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert NASA Artemis II OEM ephemeris into a compact JSON payload.",
    )
    parser.add_argument("source", type=Path, help="Path to OEM .asc file or a zip containing it")
    parser.add_argument("output", type=Path, help="Output JSON path")
    return parser.parse_args()


def read_source(path: Path) -> str:
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as archive:
            members = [name for name in archive.namelist() if name.lower().endswith(".asc")]
            if not members:
                raise RuntimeError("zip archive does not contain an OEM .asc file")
            return archive.read(members[0]).decode()

    return path.read_text()


def parse_oem(text: str) -> tuple[dict[str, str], list[tuple[int, list[float]]]]:
    metadata: dict[str, str] = {}
    rows: list[tuple[int, list[float]]] = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        if "=" in line:
            key, value = [part.strip() for part in line.split("=", 1)]
            metadata[key] = value
            continue

        if line.startswith("COMMENT") or line.startswith("META_"):
            continue

        parts = line.split()
        if len(parts) != 7 or "T" not in parts[0]:
            continue

        timestamp = dt.datetime.fromisoformat(parts[0]).replace(tzinfo=dt.timezone.utc)
        values = [float(value) for value in parts[1:]]
        rows.append((int(timestamp.timestamp() * 1000), values))

    if not rows:
        raise RuntimeError("no OEM state vectors found")

    return metadata, rows


def fetch_horizons_vectors(
    start_time: dt.datetime,
    stop_time: dt.datetime,
    step_size: str = "30 min",
) -> list[tuple[int, list[float]]]:
    params = {
        "format": "json",
        "COMMAND": "'301'",
        "OBJ_DATA": "'NO'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'VECTORS'",
        "CENTER": "'500@399'",
        "START_TIME": f"'{start_time.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}'",
        "STOP_TIME": f"'{stop_time.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}'",
        "STEP_SIZE": f"'{step_size}'",
        "TIME_TYPE": "'UT'",
        "REF_SYSTEM": "'ICRF'",
        "REF_PLANE": "'FRAME'",
        "OUT_UNITS": "'KM-S'",
        "VEC_TABLE": "'2'",
        "CSV_FORMAT": "'YES'",
    }
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, context=UNVERIFIED_SSL_CONTEXT) as response:
        payload = json.loads(response.read().decode())

    result = payload["result"]
    rows: list[tuple[int, list[float]]] = []
    inside_rows = False
    for raw_line in result.splitlines():
        line = raw_line.strip()
        if line == "$$SOE":
            inside_rows = True
            continue
        if line == "$$EOE":
            break
        if not inside_rows or not line or not line[0].isdigit():
            continue

        parts = [part.strip() for part in line.rstrip(",").split(",")]
        timestamp = dt.datetime.strptime(parts[1], "A.D. %Y-%b-%d %H:%M:%S.%f").replace(
            tzinfo=dt.timezone.utc
        )
        values = [float(value) for value in parts[2:8]]
        rows.append((int(timestamp.timestamp() * 1000), values))

    if not rows:
        raise RuntimeError("failed to parse JPL Horizons Moon vectors")

    return rows


def dot(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def cross(
    left: tuple[float, float, float],
    right: tuple[float, float, float],
) -> tuple[float, float, float]:
    return (
        left[1] * right[2] - left[2] * right[1],
        left[2] * right[0] - left[0] * right[2],
        left[0] * right[1] - left[1] * right[0],
    )


def add(
    left: tuple[float, float, float],
    right: tuple[float, float, float],
) -> tuple[float, float, float]:
    return (
        left[0] + right[0],
        left[1] + right[1],
        left[2] + right[2],
    )


def subtract(
    left: tuple[float, float, float],
    right: tuple[float, float, float],
) -> tuple[float, float, float]:
    return (
        left[0] - right[0],
        left[1] - right[1],
        left[2] - right[2],
    )


def scale(vector: tuple[float, float, float], scalar: float) -> tuple[float, float, float]:
    return (vector[0] * scalar, vector[1] * scalar, vector[2] * scalar)


def magnitude(vector: tuple[float, float, float]) -> float:
    return math.sqrt(dot(vector, vector))


def normalize(vector: tuple[float, float, float]) -> tuple[float, float, float]:
    vector_magnitude = magnitude(vector)
    if vector_magnitude == 0:
        raise RuntimeError("cannot normalize zero vector")
    return tuple(component / vector_magnitude for component in vector)  # type: ignore[return-value]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def hermite_interpolate(
    start_value: float,
    start_velocity: float,
    end_value: float,
    end_velocity: float,
    delta_seconds: float,
    t: float,
) -> float:
    t_squared = t * t
    t_cubed = t_squared * t
    tangent_start = start_velocity * delta_seconds
    tangent_end = end_velocity * delta_seconds
    return (
        (2 * t_cubed - 3 * t_squared + 1) * start_value
        + (t_cubed - 2 * t_squared + t) * tangent_start
        + (-2 * t_cubed + 3 * t_squared) * end_value
        + (t_cubed - t_squared) * tangent_end
    )


def interpolate_state(
    rows: list[tuple[int, list[float]]],
    timestamp_ms: int,
) -> tuple[float, float, float, float, float, float]:
    if timestamp_ms <= rows[0][0]:
        return tuple(rows[0][1])  # type: ignore[return-value]
    if timestamp_ms >= rows[-1][0]:
        return tuple(rows[-1][1])  # type: ignore[return-value]

    low = 0
    high = len(rows) - 1
    while low <= high:
        mid = (low + high) // 2
        if rows[mid][0] <= timestamp_ms:
            low = mid + 1
        else:
            high = mid - 1

    start_ms, start_values = rows[max(0, high)]
    end_ms, end_values = rows[min(len(rows) - 1, high + 1)]
    if start_ms == end_ms:
        return tuple(start_values)  # type: ignore[return-value]

    duration_ms = end_ms - start_ms
    duration_seconds = duration_ms / 1000
    local_t = clamp((timestamp_ms - start_ms) / duration_ms, 0.0, 1.0)

    interpolated = [
        hermite_interpolate(
            start_values[index],
            start_values[index + 3],
            end_values[index],
            end_values[index + 3],
            duration_seconds,
            local_t,
        )
        for index in range(3)
    ]
    interpolated.extend(
        hermite_interpolate(
            start_values[index + 3],
            0,
            end_values[index + 3],
            0,
            duration_seconds,
            local_t,
        )
        for index in range(3)
    )
    return tuple(interpolated)  # type: ignore[return-value]


def build_projection_basis(
    orion_rows: list[tuple[int, list[float]]],
    moon_rows: list[tuple[int, list[float]]],
) -> tuple[
    tuple[float, float, float],
    tuple[float, float, float],
    tuple[float, float, float],
    int,
    tuple[float, float, float, float, float, float],
]:
    closest_approach_time_ms = orion_rows[0][0]
    closest_approach_distance_km = float("inf")
    closest_moon_state = tuple(moon_rows[0][1])  # type: ignore[assignment]

    for timestamp_ms, values in orion_rows:
        moon_state = interpolate_state(moon_rows, timestamp_ms)
        relative_distance = magnitude(
            subtract(tuple(values[:3]), moon_state[:3])  # type: ignore[arg-type]
        )
        if relative_distance < closest_approach_distance_km:
            closest_approach_distance_km = relative_distance
            closest_approach_time_ms = timestamp_ms
            closest_moon_state = moon_state

    orbital_normal = (0.0, 0.0, 0.0)
    for index in range(len(orion_rows) - 1):
        current_position = tuple(orion_rows[index][1][:3])  # type: ignore[assignment]
        next_position = tuple(orion_rows[index + 1][1][:3])  # type: ignore[assignment]
        orbital_normal = add(orbital_normal, cross(current_position, next_position))

    normal = normalize(orbital_normal)
    axis_x = normalize(closest_moon_state[:3])
    axis_y = normalize(cross(normal, axis_x))

    outbound_position = interpolate_state(orion_rows, int(TLI.timestamp() * 1000))[:3]
    if dot(outbound_position, axis_y) < 0:
        axis_y = scale(axis_y, -1.0)
        normal = scale(normal, -1.0)

    return axis_x, axis_y, normal, closest_approach_time_ms, closest_moon_state


def build_rotating_frame_sample(
    timestamp_ms: int,
    values: list[float],
    moon_position: tuple[float, float, float],
    normal: tuple[float, float, float],
) -> dict[str, object]:
    position = tuple(values[:3])  # type: ignore[assignment]
    axis_x = normalize(moon_position)
    axis_y = normalize(cross(normal, axis_x))
    return {
        "timestampMs": timestamp_ms,
        "raw": values,
        "sceneX": dot(position, axis_x),
        "sceneY": dot(position, axis_y),
    }


def add_scene_velocities(samples: list[dict[str, object]]) -> list[list[float | int]]:
    result: list[list[float | int]] = []

    for index, sample in enumerate(samples):
        current_time = int(sample["timestampMs"])
        current_x = float(sample["sceneX"])
        current_y = float(sample["sceneY"])
        raw = sample["raw"]  # type: ignore[assignment]
        x, y, z, vx, vy, vz = raw

        if len(samples) == 1:
            scene_vx = 0.0
            scene_vy = 0.0
        elif index == 0:
            next_sample = samples[index + 1]
            delta_seconds = (int(next_sample["timestampMs"]) - current_time) / 1000
            scene_vx = (float(next_sample["sceneX"]) - current_x) / delta_seconds
            scene_vy = (float(next_sample["sceneY"]) - current_y) / delta_seconds
        elif index == len(samples) - 1:
            previous_sample = samples[index - 1]
            delta_seconds = (current_time - int(previous_sample["timestampMs"])) / 1000
            scene_vx = (current_x - float(previous_sample["sceneX"])) / delta_seconds
            scene_vy = (current_y - float(previous_sample["sceneY"])) / delta_seconds
        else:
            previous_sample = samples[index - 1]
            next_sample = samples[index + 1]
            delta_seconds = (
                int(next_sample["timestampMs"]) - int(previous_sample["timestampMs"])
            ) / 1000
            scene_vx = (
                float(next_sample["sceneX"]) - float(previous_sample["sceneX"])
            ) / delta_seconds
            scene_vy = (
                float(next_sample["sceneY"]) - float(previous_sample["sceneY"])
            ) / delta_seconds

        result.append(
            [
                current_time,
                round(x, 6),
                round(y, 6),
                round(z, 6),
                round(vx, 9),
                round(vy, 9),
                round(vz, 9),
                round(current_x, 6),
                round(current_y, 6),
                round(scene_vx, 9),
                round(scene_vy, 9),
            ]
        )

    return result


def project_rows(
    rows: list[tuple[int, list[float]]],
    moon_rows: list[tuple[int, list[float]]],
    normal: tuple[float, float, float],
    use_self_as_moon: bool = False,
) -> list[list[float | int]]:
    rotating_samples: list[dict[str, object]] = []

    for timestamp_ms, values in rows:
        moon_state = tuple(values[:3]) if use_self_as_moon else interpolate_state(moon_rows, timestamp_ms)[:3]
        rotating_samples.append(
            build_rotating_frame_sample(timestamp_ms, values, moon_state, normal)
        )

    return add_scene_velocities(rotating_samples)


def main() -> None:
    args = parse_args()
    text = read_source(args.source)
    metadata, orion_rows = parse_oem(text)

    start_time = dt.datetime.fromisoformat(
        metadata.get("USEABLE_START_TIME", metadata.get("START_TIME", ""))
    ).replace(tzinfo=dt.timezone.utc)
    stop_time = dt.datetime.fromisoformat(
        metadata.get("USEABLE_STOP_TIME", metadata.get("STOP_TIME", ""))
    ).replace(tzinfo=dt.timezone.utc)
    moon_rows = fetch_horizons_vectors(start_time, stop_time)

    (
        axis_x,
        axis_y,
        normal,
        closest_approach_time_ms,
        closest_moon_state,
    ) = build_projection_basis(orion_rows, moon_rows)
    moon_flyby_distance_km = magnitude(closest_moon_state[:3])

    payload = {
        "source": "NASA AROW OEM + JPL Horizons Moon vectors",
        "objectName": metadata.get("OBJECT_NAME", ""),
        "originator": metadata.get("ORIGINATOR", ""),
        "refFrame": metadata.get("REF_FRAME", ""),
        "centerName": metadata.get("CENTER_NAME", ""),
        "timeSystem": metadata.get("TIME_SYSTEM", ""),
        "creationDate": metadata.get("CREATION_DATE", ""),
        "startTime": start_time.isoformat().replace("+00:00", "Z"),
        "stopTime": stop_time.isoformat().replace("+00:00", "Z"),
        "launchTime": LAUNCH.isoformat().replace("+00:00", "Z"),
        "tliTime": TLI.isoformat().replace("+00:00", "Z"),
        "flybyTime": FLYBY.isoformat().replace("+00:00", "Z"),
        "closestApproachTime": dt.datetime.fromtimestamp(
            closest_approach_time_ms / 1000, tz=dt.timezone.utc
        )
        .isoformat()
        .replace("+00:00", "Z"),
        "earthRadiusKm": EARTH_RADIUS_KM,
        "moonRadiusKm": MOON_RADIUS_KM,
        "moonFlybyDistanceKm": round(moon_flyby_distance_km, 6),
        "projection": {
            "axisX": [round(component, 12) for component in axis_x],
            "axisY": [round(component, 12) for component in axis_y],
            "normal": [round(component, 12) for component in normal],
        },
        "samples": project_rows(orion_rows, moon_rows, normal),
        "moonSamples": project_rows(moon_rows, moon_rows, normal, use_self_as_moon=True),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, separators=(",", ":")))


if __name__ == "__main__":
    main()
