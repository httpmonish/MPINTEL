import os
from typing import Dict, Any, List, Optional
from .base import BaseSatelliteProvider

class BhuvanProvider(BaseSatelliteProvider):
    name = "Bhuvan"
    display_name = "ISRO Bhuvan Geoportal (Cartosat / Resourcesat)"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BHUVAN_API_KEY")

    def check_availability(self, lat: float, lon: float) -> bool:
        return 6.0 <= lat <= 37.5 and 68.0 <= lon <= 97.5

    def search_imagery(self, lat: float, lon: float, radius: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": f"BHU-CS3-{round(lat, 2)}-{round(lon, 2)}-T0",
                "source": "ISRO Bhuvan Cartosat-3 PAN+MX",
                "acquisition_date": start_date,
                "resolution_meters": 1.12,
                "cloud_coverage_pct": 4.5,
                "tile_identifier": f"BHU-T-{int(lat)}-{int(lon)}"
            },
            {
                "id": f"BHU-CS3-{round(lat, 2)}-{round(lon, 2)}-T1",
                "source": "ISRO Bhuvan Cartosat-3 PAN+MX",
                "acquisition_date": end_date,
                "resolution_meters": 1.12,
                "cloud_coverage_pct": 6.0,
                "tile_identifier": f"BHU-T-{int(lat)}-{int(lon)}"
            }
        ]

    def get_image(self, reference_id: str) -> Optional[Dict[str, Any]]:
        return {
            "id": reference_id,
            "source": "ISRO Bhuvan Cartosat-3 PAN+MX",
            "acquisition_date": "2024-03-10",
            "resolution_meters": 1.12,
            "cloud_coverage_pct": 5.0,
            "tile_identifier": f"TILE-{reference_id}"
        }

    def get_metadata(self, reference_id: str) -> Dict[str, Any]:
        return {
            "provider": "ISRO National Remote Sensing Centre (NRSC)",
            "platform": "Cartosat-3",
            "radiometric_resolution": "11-bit",
            "processing_level": "Level 1R",
            "reference_id": reference_id
        }
