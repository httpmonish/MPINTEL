import math
from typing import Dict, Any, Tuple

def validate_coordinates(lat: float, lon: float) -> Tuple[bool, str]:
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        return False, "Coordinates must be numerical floats."
    if math.isnan(lat) or math.isnan(lon):
        return False, "Coordinates cannot be NaN."
    if lat < -90.0 or lat > 90.0:
        return False, f"Latitude {lat} out of range (-90 to +90)."
    if lon < -180.0 or lon > 180.0:
        return False, f"Longitude {lon} out of range (-180 to +180)."
    if abs(lat) < 0.0001 and abs(lon) < 0.0001:
        return False, "Coordinates point to Null Island (0,0); likely uncalibrated."
    return True, "Valid"

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geodesic distance between two points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def create_area_of_interest(lat: float, lon: float, radius_meters: float = 100.0) -> Dict[str, Any]:
    safe_radius = max(25.0, min(1000.0, float(radius_meters)))
    lat_delta = safe_radius / 111320.0
    lon_cos = max(0.1, math.cos(math.radians(lat)))
    lon_delta = safe_radius / (111320.0 * lon_cos)

    return {
        "center_lat": lat,
        "center_lon": lon,
        "radius_meters": safe_radius,
        "bounds": {
            "min_lat": lat - lat_delta,
            "max_lat": lat + lat_delta,
            "min_lon": lon - lon_delta,
            "max_lon": lon + lon_delta,
        },
        "area_sq_meters": math.pi * safe_radius * safe_radius
    }

def calculate_spatial_overlap(
    aoi: Dict[str, Any],
    change_lat: float,
    change_lon: float,
    change_radius_meters: float
) -> Dict[str, Any]:
    dist = calculate_haversine_distance(
        aoi["center_lat"], aoi["center_lon"], change_lat, change_lon
    )
    combined = aoi["radius_meters"] + change_radius_meters
    if dist >= combined:
        return {
            "overlap_score": 0.0,
            "distance_meters": round(dist, 1),
            "is_within_aoi": False,
            "notes": f"Change detected {round(dist)}m away, outside project AOI buffer ({aoi['radius_meters']}m)."
        }
    if dist <= abs(aoi["radius_meters"] - change_radius_meters):
        return {
            "overlap_score": 1.0,
            "distance_meters": round(dist, 1),
            "is_within_aoi": True,
            "notes": f"Detected change footprint is completely inside AOI ({round(dist)}m offset)."
        }

    # Geometric overlap approximation
    r1 = aoi["radius_meters"]
    r2 = change_radius_meters
    d = max(1.0, dist)
    part1 = r1 * r1 * math.acos(min(1.0, max(-1.0, (d * d + r1 * r1 - r2 * r2) / (2.0 * d * r1))))
    part2 = r2 * r2 * math.acos(min(1.0, max(-1.0, (d * d + r2 * r2 - r1 * r1) / (2.0 * d * r2))))
    part3 = 0.5 * math.sqrt(max(0.0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)))
    intersection = max(0.0, part1 + part2 - part3)
    aoi_area = math.pi * r1 * r1
    ratio = min(1.0, max(0.0, intersection / aoi_area))

    return {
        "overlap_score": round(ratio, 2),
        "distance_meters": round(dist, 1),
        "is_within_aoi": dist <= aoi["radius_meters"],
        "notes": f"Change footprint exhibits {round(ratio * 100)}% spatial overlap with {round(dist)}m offset."
    }
