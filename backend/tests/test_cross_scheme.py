import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engines.cross_scheme import (
    CrossSchemeEngine,
    haversine_distance_meters,
    normalize_category_to_standard,
    get_category_spatial_parameters,
    normalize_entity_string,
    calculate_jaccard_text_similarity
)
from engines.photo_duplication import PhotoDuplicationEngine


def run_cross_scheme_unit_tests():
    print("=== STARTING PHASE 3: MULTI-SCHEME CROSS-VERIFICATION UNIT & INTEGRATION TESTS ===")

    # 1. Scheme Normalization & Category Standardization
    cat_road = normalize_category_to_standard("PMGSY Rural Connectivity Link Road")
    cat_water = normalize_category_to_standard("JJM Overhead Drinking Water Piped Scheme")
    cat_hall = normalize_category_to_standard("MGNREGA Community Bhawan Infrastructure")
    assert cat_road == "Roads & Bridges"
    assert cat_water == "Drinking Water"
    assert cat_hall == "Community Halls"
    print("[Pass] Test 1: Category Normalization across Multi-Scheme Taxonomy")

    # 2. Category-Aware Spatial Parameters
    params_road = get_category_spatial_parameters("Roads & Bridges")
    params_hall = get_category_spatial_parameters("Community Halls")
    assert params_road["recommended_threshold_meters"] == 500.0
    assert params_hall["recommended_threshold_meters"] == 100.0
    print("[Pass] Test 2: Category-Aware Spatial Thresholds (Roads: 500m, Halls: 100m)")

    # 3. Geodesic Distance Calculation
    dist = haversine_distance_meters(19.0760, 72.8777, 19.0763, 72.8780)
    assert 40.0 <= dist <= 50.0
    print(f"[Pass] Test 3: Geodesic Haversine Calculation ({dist}m)")

    # 4. Entity Normalization (Contractors & Agencies)
    norm_a = normalize_entity_string("ABC Infra Pvt. Ltd.")
    norm_b = normalize_entity_string("ABC Infrastructure Private Limited")
    assert norm_a == "abc infra pvt ltd"
    assert norm_b == "abc infra pvt ltd"
    assert norm_a == norm_b
    print("[Pass] Test 4: Entity Name Normalization & Variant Matching")

    # 5. Text Jaccard Similarity
    txt_sim = calculate_jaccard_text_similarity(
        "Construction of high mast solar lighting installation",
        "Erection of solar high mast lighting system at junction"
    )
    assert txt_sim > 40.0
    print(f"[Pass] Test 5: Description Jaccard Similarity ({txt_sim}%)")

    # 6. pHash Duplicate Detection across Schemes
    phash_a = "cc88aa2211bb44fe"
    phash_b = "cc88aa2211bb44fd"
    h_dist = PhotoDuplicationEngine.hamming_distance(phash_a, phash_b)
    assert h_dist <= 2
    print(f"[Pass] Test 6: Cross-Scheme pHash Visual Fingerprinting (Hamming Distance: {h_dist})")

    # 7. Scenario A: Strong Potential Overlap (MPLADS + MGNREGA)
    proj_mplads_hero = {
        "project_id": "HERO-MPLADS-001",
        "scheme_id": "MPLADS",
        "title": "Solar High-Mast Grid & Public Facility Electrification",
        "description": "Installation of 12-meter octagonal high-mast solar illumination luminaires across 14 public junction points.",
        "category": "Solar & Street Lighting",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "contractor": "ENT-SOLAR-CORP-09",
        "start_date": "2023-08-01",
        "photos": [{"id": "PHT-01", "phash": "cc88aa2211bb44fe"}],
        "geometry": {"spatial_type": "POINT", "bounding_radius_meters": 100.0, "estimated_area_sq_meters": 1200.0}
    }

    proj_nrega_hero = {
        "project_id": "NREGA-MH-2023-9021",
        "scheme_id": "MGNREGA",
        "title": "Solar High-Mast Illumination & Junction Electrification",
        "description": "Installation of solar high-mast lighting and illumination luminaires at junction",
        "category": "Solar & Street Lighting",
        "latitude": 19.0763,
        "longitude": 72.8780,
        "contractor": "ENT-SOLAR-CORP-09",
        "start_date": "2023-09-15",
        "photos": [{"id": "PHT-NREGA-01", "phash": "cc88aa2211bb44fd"}],
        "geometry": {"spatial_type": "POINT", "bounding_radius_meters": 100.0, "estimated_area_sq_meters": 1200.0}
    }

    match_a = CrossSchemeEngine.evaluate_pair(proj_mplads_hero, proj_nrega_hero)
    assert match_a["similarity_score"] >= 80.0
    assert match_a["classification"] == "HIGH_SIMILARITY"
    assert match_a["priority"] == "URGENT_REVIEW"
    assert match_a["asset_lifecycle"] == "SAME_ASSET_POTENTIAL_DUPLICATE"
    print(f"[Pass] Test 7: Scenario A (High Overlap) Similarity = {match_a['similarity_score']}/100, Priority = {match_a['priority']}")

    # 8. Scenario B: Same Asset, Phased Legitimate Development
    proj_hall_phase1 = {
        "project_id": "PRJ-2023-042",
        "scheme_id": "MPLADS",
        "title": "Gramin Community Hall Superstructure Construction",
        "description": "Phase 1 reinforced concrete superstructure and roofing",
        "category": "Community Halls",
        "latitude": 19.1200,
        "longitude": 72.8500,
        "contractor": "ENT-CIVIL-BUILD-14",
        "start_date": "2023-01-10",
        "photos": []
    }
    proj_hall_phase2 = {
        "project_id": "NREGA-MH-2024-1104",
        "scheme_id": "MGNREGA",
        "title": "Community Hall Land Leveling & Perimeter Drainage",
        "description": "Perimeter drainage and ground leveling around community hall",
        "category": "Land Development",
        "latitude": 19.1203,
        "longitude": 72.8502,
        "contractor": "Gram Panchayat Vikas",
        "start_date": "2024-02-01",
        "photos": []
    }
    match_b = CrossSchemeEngine.evaluate_pair(proj_hall_phase1, proj_hall_phase2)
    assert match_b["temporal_relationship"] in ["POSSIBLE_PHASED_WORK", "SEQUENTIAL_PROJECTS"]
    assert match_b["asset_lifecycle"] == "SAME_ASSET_DIFFERENT_WORK"
    print(f"[Pass] Test 8: Scenario B (Phased Development) Lifecycle = {match_b['asset_lifecycle']}")

    # 9. Scenario C: Same Contractor in Different Geographic Area (Clean)
    proj_road_a = {
        "project_id": "PRJ-2024-080",
        "scheme_id": "MPLADS",
        "title": "Rural Approach Road",
        "category": "Roads & Bridges",
        "latitude": 19.2000,
        "longitude": 72.9000,
        "contractor": "ENT-PWD-CORP-42",
        "start_date": "2023-11-01"
    }
    proj_road_b = {
        "project_id": "PMGSY-MH-PKG-44",
        "scheme_id": "PMGSY",
        "title": "PMGSY Through Route T04",
        "category": "Roads & Bridges",
        "latitude": 19.8500, # 65km away
        "longitude": 73.5000,
        "contractor": "ENT-PWD-CORP-42",
        "start_date": "2023-06-01"
    }
    match_c = CrossSchemeEngine.evaluate_pair(proj_road_a, proj_road_b)
    assert match_c["similarity_score"] < 45.0
    assert match_c["asset_lifecycle"] == "SHARED_CONTRACTOR_DIFFERENT_PROJECTS"
    assert match_c["priority"] == "LOW_PRIORITY"
    print(f"[Pass] Test 9: Scenario C (Contractor Relationship Only) Score = {match_c['similarity_score']}/100, Priority = {match_c['priority']}")

    # 10. Scenario D: Co-located Distinct Public Assets (Road + Drain)
    proj_road_d = {
        "project_id": "PRJ-2024-105",
        "scheme_id": "MPLADS",
        "title": "Cement Concrete Village Roadway",
        "category": "Roads & Bridges",
        "latitude": 19.0500,
        "longitude": 72.8200,
        "start_date": "2024-01-15"
    }
    proj_drain_d = {
        "project_id": "NREGA-MH-2024-5510",
        "scheme_id": "MGNREGA",
        "title": "Covered Stormwater Drainage Canal",
        "category": "Sanitation & Public Health",
        "latitude": 19.0502,
        "longitude": 72.8201,
        "start_date": "2024-02-01"
    }
    match_d = CrossSchemeEngine.evaluate_pair(proj_road_d, proj_drain_d)
    assert match_d["asset_lifecycle"] == "INDEPENDENT_ADJACENT_ASSETS"
    print(f"[Pass] Test 10: Scenario D (Independent Co-located Assets) Lifecycle = {match_d['asset_lifecycle']}")

    # 11. Fairness Safeguard Invariant (0.0 penalty for missing photos/footprints)
    proj_empty_a = {
        "project_id": "PRJ-EMPTY-A",
        "scheme_id": "MPLADS",
        "title": "Basic Water Scheme",
        "category": "Drinking Water",
        "latitude": 19.0000,
        "longitude": 72.8000,
        "photos": []
    }
    proj_empty_b = {
        "project_id": "PRJ-EMPTY-B",
        "scheme_id": "MGNREGA",
        "title": "Basic Water Scheme",
        "category": "Drinking Water",
        "latitude": 19.0000,
        "longitude": 72.8000,
        "photos": []
    }
    match_empty = CrossSchemeEngine.evaluate_pair(proj_empty_a, proj_empty_b)
    # Image signal is marked UNAVAILABLE and not penalized
    assert match_empty["signals"]["image_similarity"]["status"] == "UNAVAILABLE"
    assert match_empty["signals"]["image_similarity"]["score_pct"] == 0.0
    print("[Pass] Test 11: Fairness Safeguard: Zero penalty for missing evidence")

    print("=== ALL PHASE 3 BACKEND UNIT & INTEGRATION TESTS PASSED (11/11) ===")


if __name__ == "__main__":
    run_cross_scheme_unit_tests()
