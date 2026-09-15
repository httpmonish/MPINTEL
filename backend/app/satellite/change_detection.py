from datetime import datetime
from typing import Dict, Any
from .spatial import create_area_of_interest, calculate_spatial_overlap, validate_coordinates
from .providers.mock import MockSatelliteProvider

def get_expected_visual_signal(category: str) -> Dict[str, Any]:
    cat = (category or "").strip()
    if "Road" in cat or "Bridge" in cat:
        return {
            "expected_change_type": "ROAD_CHANGE",
            "description": "Linear surface asphalt/concrete reflectance with continuous edge delineation",
            "typical_footprint_sq_meters": 2400.0
        }
    if "Solar" in cat or "Lighting" in cat:
        return {
            "expected_change_type": "STRUCTURAL_CHANGE",
            "description": "High-mast pole foundation footprint and solar panel high-reflectance signature",
            "typical_footprint_sq_meters": 450.0
        }
    if "School" in cat or "Hall" in cat or "Community" in cat:
        return {
            "expected_change_type": "CONSTRUCTION",
            "description": "Rectangular rooftop slab signature and ground disturbance perimeter",
            "typical_footprint_sq_meters": 850.0
        }
    if "Water" in cat:
        return {
            "expected_change_type": "WATER_CHANGE",
            "description": "Overhead tank / sump concrete footprint and pipeline trench line",
            "typical_footprint_sq_meters": 380.0
        }
    return {
        "expected_change_type": "CONSTRUCTION",
        "description": "Physical earthworks and structural foundation change",
        "typical_footprint_sq_meters": 500.0
    }

def analyze_satellite_evidence(
    project_id: str,
    latitude: float,
    longitude: float,
    work_category: str = "Roads & Bridges",
    radius_meters: float = 100.0,
    preferred_provider: str = "Bhuvan"
) -> Dict[str, Any]:
    is_valid, err = validate_coordinates(latitude, longitude)
    aoi = create_area_of_interest(latitude, longitude, radius_meters)
    signal = get_expected_visual_signal(work_category)
    mock = MockSatelliteProvider()
    scenario = mock.get_scenario_for_project(project_id)

    if not is_valid:
        return {
            "project_id": project_id,
            "latitude": latitude,
            "longitude": longitude,
            "radius_meters": radius_meters,
            "provider": "Unavailable",
            "imagery_source": "None",
            "acquisition_date": "2023-08-01",
            "comparison_date": "2024-06-01",
            "before_image": {
                "id": "NA-PRE",
                "source": "Unavailable",
                "acquisition_date": "2023-08-01",
                "resolution_meters": 0.0,
                "cloud_coverage_pct": 0.0,
                "tile_identifier": "NA"
            },
            "after_image": {
                "id": "NA-POST",
                "source": "Unavailable",
                "acquisition_date": "2024-06-01",
                "resolution_meters": 0.0,
                "cloud_coverage_pct": 0.0,
                "tile_identifier": "NA"
            },
            "image_resolution_meters": 0.0,
            "cloud_coverage_pct": 0.0,
            "processing_status": "FAILED",
            "preprocessing_method": "None",
            "change_detection_method": "None",
            "change_score": 0.0,
            "spatial_overlap_score": 0.0,
            "evidence_confidence": 0.0,
            "evidence_status": "UNAVAILABLE",
            "detected_change_type": "NONE",
            "detected_area_sq_meters": 0.0,
            "notes": f"Satellite evidence unavailable: {err}",
            "generated_at": datetime.now().isoformat(),
            "source_metadata": {"sensor_name": "N/A", "orbit_pass": "N/A", "radiometric_processing": "N/A"},
            "provenance": {"pipeline_version": "sat-engine-v1.0", "algorithm_hash": "00000000", "is_synthetic": True},
            "limitations": ["Invalid coordinates prevented imagery query."]
        }

    provider_name = preferred_provider or ("Sentinel-2" if "S2" in project_id else "Bhuvan")
    imagery_source = (
        "Copernicus Sentinel-2 L2A (10m Multispectral)"
        if provider_name == "Sentinel-2"
        else "ISRO Bhuvan Cartosat-3 (1.12m Panchromatic/Multispectral)"
    )
    res_meters = 10.0 if provider_name == "Sentinel-2" else 1.12

    if scenario == "SCENARIO_A_CLEAR_CHANGE":
        spatial = calculate_spatial_overlap(aoi, latitude + 0.0001, longitude + 0.0001, 35.0)
        return {
            "project_id": project_id,
            "latitude": latitude,
            "longitude": longitude,
            "radius_meters": aoi["radius_meters"],
            "provider": provider_name,
            "imagery_source": imagery_source,
            "acquisition_date": "2023-08-15",
            "comparison_date": "2024-04-22",
            "before_image": {
                "id": f"PRE-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2023-08-15",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 4.5,
                "tile_identifier": f"T43Q-{project_id}-T0"
            },
            "after_image": {
                "id": f"POST-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2024-04-22",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 5.8,
                "tile_identifier": f"T43Q-{project_id}-T1"
            },
            "image_resolution_meters": res_meters,
            "cloud_coverage_pct": 5.8,
            "processing_status": "COMPLETED",
            "preprocessing_method": "Top-of-Atmosphere (TOA) & Sen2Cor 2.9 Orthorectification",
            "change_detection_method": "Spectral Angle Mapper (SAM) + Normalized Difference Built-up Index (NDBI)",
            "change_score": 0.82,
            "spatial_overlap_score": 0.88,
            "evidence_confidence": 82.0,
            "evidence_status": "CHANGE_DETECTED",
            "detected_change_type": signal["expected_change_type"],
            "detected_area_sq_meters": signal["typical_footprint_sq_meters"],
            "notes": f"Optical surface reflectance indicates physical structure erection with 82% confidence. {spatial['notes']}",
            "generated_at": datetime.now().isoformat(),
            "source_metadata": {
                "sensor_name": "MSI MultiSpectral" if provider_name == "Sentinel-2" else "Cartosat-3 PAN+MX",
                "orbit_pass": "Descending Node 10:30 IST",
                "sun_elevation_deg": 54.2,
                "radiometric_processing": "Level 2A Bottom-of-Atmosphere (BOA)"
            },
            "provenance": {
                "pipeline_version": "sat-engine-v1.0",
                "algorithm_hash": "sha256-a9f82d41",
                "is_synthetic": True
            },
            "limitations": [
                "Resolution limits fine sub-meter architectural verification.",
                "Optical imagery is sensitive to seasonal soil moisture variations."
            ]
        }

    if scenario == "SCENARIO_B_NO_CHANGE":
        return {
            "project_id": project_id,
            "latitude": latitude,
            "longitude": longitude,
            "radius_meters": aoi["radius_meters"],
            "provider": provider_name,
            "imagery_source": imagery_source,
            "acquisition_date": "2023-09-01",
            "comparison_date": "2024-05-10",
            "before_image": {
                "id": f"PRE-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2023-09-01",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 3.2,
                "tile_identifier": f"TILE-PRE-{project_id}"
            },
            "after_image": {
                "id": f"POST-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2024-05-10",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 4.1,
                "tile_identifier": f"TILE-POST-{project_id}"
            },
            "image_resolution_meters": res_meters,
            "cloud_coverage_pct": 4.1,
            "processing_status": "COMPLETED",
            "preprocessing_method": "Orthorectification and radiometric normalization",
            "change_detection_method": "Pixel-wise Radiometric Differencing",
            "change_score": 0.08,
            "spatial_overlap_score": 0.05,
            "evidence_confidence": 30.0,
            "evidence_status": "NO_SIGNIFICANT_CHANGE",
            "detected_change_type": "NONE",
            "detected_area_sq_meters": 0.0,
            "notes": "Surface reflectance comparison shows no observable construction or earthworks in AOI.",
            "generated_at": datetime.now().isoformat(),
            "source_metadata": {
                "sensor_name": "Cartosat-3 PAN",
                "orbit_pass": "Descending Pass",
                "radiometric_processing": "Level 1R"
            },
            "provenance": {
                "pipeline_version": "sat-engine-v1.0",
                "algorithm_hash": "sha256-b873c91e",
                "is_synthetic": True
            },
            "limitations": [
                "Internal electrical or plumbing work not visible to optical remote sensing."
            ]
        }

    if scenario == "SCENARIO_C_LOW_QUALITY":
        return {
            "project_id": project_id,
            "latitude": latitude,
            "longitude": longitude,
            "radius_meters": aoi["radius_meters"],
            "provider": provider_name,
            "imagery_source": imagery_source,
            "acquisition_date": "2023-07-20",
            "comparison_date": "2024-06-15",
            "before_image": {
                "id": f"PRE-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2023-07-20",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 18.0,
                "tile_identifier": f"TILE-PRE-{project_id}"
            },
            "after_image": {
                "id": f"POST-{project_id}",
                "source": imagery_source,
                "acquisition_date": "2024-06-15",
                "resolution_meters": res_meters,
                "cloud_coverage_pct": 76.4,
                "tile_identifier": f"TILE-POST-{project_id}"
            },
            "image_resolution_meters": res_meters,
            "cloud_coverage_pct": 76.4,
            "processing_status": "PARTIAL",
            "preprocessing_method": "Cloud Masking (Fmask 4.0)",
            "change_detection_method": "Optical Pass Inhibited by Monsoon Cloud Cover",
            "change_score": 0.22,
            "spatial_overlap_score": 0.0,
            "evidence_confidence": 45.0,
            "evidence_status": "LOW_QUALITY",
            "detected_change_type": "UNKNOWN",
            "detected_area_sq_meters": 0.0,
            "notes": "Heavy cloud cover (76.4%) over area of interest prevents reliable optical surface comparison. Excluded from negative scoring under Fairness Safeguard.",
            "generated_at": datetime.now().isoformat(),
            "source_metadata": {
                "sensor_name": "Sentinel-2 MSI",
                "orbit_pass": "Ascending Pass",
                "radiometric_processing": "Level 1C"
            },
            "provenance": {
                "pipeline_version": "sat-engine-v1.0",
                "algorithm_hash": "sha256-c43912da",
                "is_synthetic": True
            },
            "limitations": [
                "Monsoon atmospheric interference obscured AOI during observation window."
            ]
        }

    if scenario == "SCENARIO_D_UNAVAILABLE":
        return {
            "project_id": project_id,
            "latitude": latitude,
            "longitude": longitude,
            "radius_meters": aoi["radius_meters"],
            "provider": "Unavailable",
            "imagery_source": "Archive Coverage Gap",
            "acquisition_date": "2023-08-01",
            "comparison_date": "2024-06-01",
            "before_image": {
                "id": "PRE-UNAVAIL",
                "source": "None",
                "acquisition_date": "2023-08-01",
                "resolution_meters": 0.0,
                "cloud_coverage_pct": 0.0,
                "tile_identifier": "NONE"
            },
            "after_image": {
                "id": "POST-UNAVAIL",
                "source": "None",
                "acquisition_date": "2024-06-01",
                "resolution_meters": 0.0,
                "cloud_coverage_pct": 0.0,
                "tile_identifier": "NONE"
            },
            "image_resolution_meters": 0.0,
            "cloud_coverage_pct": 0.0,
            "processing_status": "FAILED",
            "preprocessing_method": "None",
            "change_detection_method": "None",
            "change_score": 0.0,
            "spatial_overlap_score": 0.0,
            "evidence_confidence": 0.0,
            "evidence_status": "UNAVAILABLE",
            "detected_change_type": "NONE",
            "detected_area_sq_meters": 0.0,
            "notes": "High-resolution satellite archive pass currently unavailable for this remote geographic coordinate. Recorded neutrally with zero score penalty.",
            "generated_at": datetime.now().isoformat(),
            "source_metadata": {
                "sensor_name": "N/A",
                "orbit_pass": "N/A",
                "radiometric_processing": "N/A"
            },
            "provenance": {
                "pipeline_version": "sat-engine-v1.0",
                "algorithm_hash": "00000000",
                "is_synthetic": True
            },
            "limitations": [
                "No public high-resolution optical passes indexed in archive for selected date window."
            ]
        }

    # SCENARIO_E_REQUIRES_REVIEW
    spatial = calculate_spatial_overlap(aoi, latitude + 0.0035, longitude + 0.0028, 60.0)
    return {
        "project_id": project_id,
        "latitude": latitude,
        "longitude": longitude,
        "radius_meters": aoi["radius_meters"],
        "provider": provider_name,
        "imagery_source": imagery_source,
        "acquisition_date": "2023-09-10",
        "comparison_date": "2024-05-18",
        "before_image": {
            "id": f"PRE-{project_id}",
            "source": imagery_source,
            "acquisition_date": "2023-09-10",
            "resolution_meters": res_meters,
            "cloud_coverage_pct": 8.2,
            "tile_identifier": f"TILE-PRE-{project_id}"
        },
        "after_image": {
            "id": f"POST-{project_id}",
            "source": imagery_source,
            "acquisition_date": "2024-05-18",
            "resolution_meters": res_meters,
            "cloud_coverage_pct": 9.1,
            "tile_identifier": f"TILE-POST-{project_id}"
        },
        "image_resolution_meters": res_meters,
        "cloud_coverage_pct": 9.1,
        "processing_status": "COMPLETED",
        "preprocessing_method": "Orthorectification with SRTM 30m Digital Elevation Model",
        "change_detection_method": "Structural Surface Segmentation",
        "change_score": 0.68,
        "spatial_overlap_score": spatial["overlap_score"],
        "evidence_confidence": 48.0,
        "evidence_status": "REQUIRES_REVIEW",
        "detected_change_type": signal["expected_change_type"],
        "detected_area_sq_meters": 720.0,
        "notes": f"Physical construction detected but located {spatial['distance_meters']}m from sanctioned project coordinates (spatial overlap: {round(spatial['overlap_score'] * 100)}%). Requires field verification.",
        "generated_at": datetime.now().isoformat(),
        "source_metadata": {
            "sensor_name": "Cartosat-3 MX",
            "orbit_pass": "Descending Pass",
            "radiometric_processing": "Level 2A"
        },
        "provenance": {
            "pipeline_version": "sat-engine-v1.0",
            "algorithm_hash": "sha256-e82931bc",
            "is_synthetic": True
        },
        "limitations": [
            "Significant spatial offset between sanctioned GPS coordinates and observed physical construction."
        ]
    }
