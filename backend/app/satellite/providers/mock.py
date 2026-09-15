from typing import Dict, Any, List, Optional
from .base import BaseSatelliteProvider

class MockSatelliteProvider(BaseSatelliteProvider):
    name = "Mock"
    display_name = "Deterministic Multi-Sensor Satellite Engine"

    def get_scenario_for_project(self, project_id: str) -> str:
        pid = project_id.upper()
        if pid == "HERO-MPLADS-001" or pid.endswith("-001") or pid.endswith("-010"):
            return "SCENARIO_A_CLEAR_CHANGE"
        if pid.endswith("-002") or pid.endswith("-020") or pid.endswith("-045"):
            return "SCENARIO_B_NO_CHANGE"
        if pid.endswith("-003") or pid.endswith("-030") or "CLOUD" in pid:
            return "SCENARIO_C_LOW_QUALITY"
        if pid.endswith("-004") or pid.endswith("-040") or "REMOTE" in pid:
            return "SCENARIO_D_UNAVAILABLE"
        if pid.endswith("-005") or pid.endswith("-050") or "REVIEW" in pid:
            return "SCENARIO_E_REQUIRES_REVIEW"
        
        char_sum = sum(ord(c) for c in pid)
        mod = char_sum % 5
        mapping = {
            0: "SCENARIO_A_CLEAR_CHANGE",
            1: "SCENARIO_B_NO_CHANGE",
            2: "SCENARIO_C_LOW_QUALITY",
            3: "SCENARIO_D_UNAVAILABLE",
            4: "SCENARIO_E_REQUIRES_REVIEW"
        }
        return mapping[mod]

    def check_availability(self, lat: float, lon: float) -> bool:
        return True

    def search_imagery(self, lat: float, lon: float, radius: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": f"MOCK-SAT-PRE-{round(lat, 2)}",
                "source": "ISRO Bhuvan Cartosat-3 Optical Surface Reflectance",
                "acquisition_date": start_date,
                "resolution_meters": 1.12,
                "cloud_coverage_pct": 4.8,
                "tile_identifier": "TILE-BHU-2023-Q3"
            },
            {
                "id": f"MOCK-SAT-POST-{round(lat, 2)}",
                "source": "ISRO Bhuvan Cartosat-3 Optical Surface Reflectance",
                "acquisition_date": end_date,
                "resolution_meters": 1.12,
                "cloud_coverage_pct": 6.2,
                "tile_identifier": "TILE-BHU-2024-Q2"
            }
        ]

    def get_image(self, reference_id: str) -> Optional[Dict[str, Any]]:
        return {
            "id": reference_id,
            "source": "ISRO Bhuvan Cartosat-3 Optical Surface Reflectance",
            "acquisition_date": "2024-04-01",
            "resolution_meters": 1.12,
            "cloud_coverage_pct": 5.0,
            "tile_identifier": reference_id
        }

    def get_metadata(self, reference_id: str) -> Dict[str, Any]:
        return {
            "simulation_mode": "Deterministic Pre-computed Geospatial Index",
            "reference_id": reference_id,
            "reproducible": True
        }
