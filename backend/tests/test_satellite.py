import os
import sys

# Add backend/app and backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from satellite.spatial import (
    validate_coordinates,
    create_area_of_interest,
    calculate_haversine_distance,
    calculate_spatial_overlap
)
from satellite.providers import BhuvanProvider, SentinelProvider, MockSatelliteProvider
from satellite.service import SatelliteVerificationService
from satellite.change_detection import analyze_satellite_evidence

def run_satellite_unit_tests():
    print("=== STARTING SATELLITE SUBSYSTEM UNIT & INTEGRATION TESTS ===")

    # 1. Coordinate Validation Tests
    valid, _ = validate_coordinates(19.0760, 72.8777)
    assert valid, "Valid coordinates failed"

    invalid_lat, err1 = validate_coordinates(95.0, 72.8777)
    assert not invalid_lat, "Latitude > 90 must fail"

    invalid_lon, err2 = validate_coordinates(19.0760, 195.0)
    assert not invalid_lon, "Longitude > 180 must fail"

    null_island, err3 = validate_coordinates(0.0, 0.0)
    assert not null_island, "Null Island (0,0) must fail"
    print("[Pass] Test 1: Coordinate Range & Null Island Validations")

    # 2. AOI Generation & Haversine Distance
    aoi = create_area_of_interest(19.0760, 72.8777, 100.0)
    assert aoi["radius_meters"] == 100.0
    assert aoi["bounds"]["min_lat"] < 19.0760 < aoi["bounds"]["max_lat"]
    assert aoi["bounds"]["min_lon"] < 72.8777 < aoi["bounds"]["max_lon"]

    dist_same = calculate_haversine_distance(19.0760, 72.8777, 19.0760, 72.8777)
    assert dist_same < 0.001

    dist_offset = calculate_haversine_distance(19.0760, 72.8777, 19.0770, 72.8777)
    assert 100 < dist_offset < 120
    print("[Pass] Test 2: AOI Bounding Box & Geodesic Calculations")

    # 3. Spatial Overlap Calculations
    overlap_inside = calculate_spatial_overlap(aoi, 19.0760, 72.8777, 25.0)
    assert overlap_inside["is_within_aoi"] is True
    assert overlap_inside["overlap_score"] == 1.0

    overlap_far = calculate_spatial_overlap(aoi, 19.0900, 72.8777, 25.0)
    assert overlap_far["is_within_aoi"] is False
    assert overlap_far["overlap_score"] == 0.0
    print("[Pass] Test 3: Spatial Consistency & Overlap Metric")

    # 4. Provider Adapters
    bhuvan = BhuvanProvider()
    assert bhuvan.check_availability(19.0760, 72.8777) is True
    assert bhuvan.check_availability(55.0, 37.0) is False  # Outside India

    sentinel = SentinelProvider()
    assert sentinel.check_availability(19.0760, 72.8777) is True

    mock = MockSatelliteProvider()
    assert mock.get_scenario_for_project("HERO-MPLADS-001") == "SCENARIO_A_CLEAR_CHANGE"
    print("[Pass] Test 4: Provider Abstractions (Bhuvan, Sentinel-2, Mock)")

    # 5. Deterministic Mock Scenarios
    # Scenario A: Clear Change (Hero Project)
    hero_res = analyze_satellite_evidence(
        project_id="HERO-MPLADS-001",
        latitude=19.0760,
        longitude=72.8777,
        work_category="Solar & Street Lighting"
    )
    assert hero_res["evidence_status"] == "CHANGE_DETECTED"
    assert hero_res["evidence_confidence"] >= 75.0
    assert hero_res["spatial_overlap_score"] > 0.70

    # Scenario D: Unavailable
    unavail_res = analyze_satellite_evidence(
        project_id="PRJ-REMOTE-004",
        latitude=28.1234,
        longitude=77.5678,
        work_category="Roads & Bridges"
    )
    assert unavail_res["evidence_status"] == "UNAVAILABLE"
    assert unavail_res["evidence_confidence"] == 0.0

    # Scenario C: Low Quality
    cloud_res = analyze_satellite_evidence(
        project_id="PRJ-CLOUD-003",
        latitude=26.1234,
        longitude=88.5678,
        work_category="Community Halls"
    )
    assert cloud_res["evidence_status"] == "LOW_QUALITY"
    assert cloud_res["cloud_coverage_pct"] > 70.0
    print("[Pass] Test 5: Deterministic Scenarios (Clear Change, Low Quality, Unavailable)")

    # 6. Service & Thread-Safe Cache
    service_res1 = SatelliteVerificationService.get_or_analyze_evidence(
        project_id="HERO-MPLADS-001",
        latitude=19.0760,
        longitude=72.8777
    )
    service_res2 = SatelliteVerificationService.get_or_analyze_evidence(
        project_id="HERO-MPLADS-001",
        latitude=19.0760,
        longitude=72.8777
    )
    assert service_res1["project_id"] == service_res2["project_id"]

    status_summary = SatelliteVerificationService.get_status_summary(service_res1)
    assert status_summary["evidence_available"] is True
    assert "Zero penalty" in status_summary["fairness_safeguard_note"]
    print("[Pass] Test 6: Satellite Verification Service & Cache")

    # 7. Sentinel-2 Multi-Scene Search & Quality Classification
    scenes, mode, prov = sentinel.search_scenes(
        lat=19.0760,
        lon=72.8777,
        radius_meters=100.0,
        max_cloud_cover_pct=30.0,
        force_demo=False
    )
    assert len(scenes) > 0, "Scene search returned zero scenes"
    assert mode in ("REAL_SATELLITE_API", "DEMO_SATELLITE_DATA")
    assert "revisit_rate_days" in prov
    suitable = [s for s in scenes if s["is_suitable"]]
    assert len(suitable) > 0, "Should find at least one suitable scene"
    # Ensure quality tiers are well-formed
    for s in scenes:
        assert s["quality_tier"] in ("OPTIMAL", "USABLE", "REJECTED_CLOUD")
        if s["cloud_coverage_pct"] > 30.0:
            assert s["is_suitable"] is False
            assert "exceeds" in s["rejection_reason"]
    print(f"[Pass] Test 7: Sentinel-2 Scene Query & Quality Filtering ({mode}, {len(scenes)} scenes found)")

    # 8. Neutral Vocabulary Audit
    all_content = str(hero_res) + str(unavail_res) + str(cloud_res) + str(scenes)
    forbidden = ["fraud", "corrupt", "bribery", "criminal", "guilty"]
    for word in forbidden:
        assert word not in all_content.lower(), f"Forbidden word '{word}' found in satellite output!"
    print("[Pass] Test 8: Strict Neutral Civic Vocabulary Guarantee")

    print("\n=== ALL 8 SATELLITE SUBSYSTEM BACKEND TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_satellite_unit_tests()

