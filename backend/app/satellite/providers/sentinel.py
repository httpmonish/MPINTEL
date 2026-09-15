import os
import json
import logging
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .base import BaseSatelliteProvider

logger = logging.getLogger("pratyaksh.satellite.sentinel")

# Public global Sentinel-2 L2A STAC endpoint (Earth Search by Element 84, indexing AWS S2 L2A archive)
STAC_ENDPOINT = os.getenv("SENTINEL_STAC_URL", "https://earth-search.aws.element84.com/v1/search")
COPERNICUS_API_KEY = os.getenv("COPERNICUS_API_KEY")
SENTINEL_HUB_CLIENT_ID = os.getenv("SENTINEL_HUB_CLIENT_ID")
SENTINEL_HUB_CLIENT_SECRET = os.getenv("SENTINEL_HUB_CLIENT_SECRET")

class SentinelProvider(BaseSatelliteProvider):
    name = "Sentinel-2"
    display_name = "Copernicus Sentinel-2 MSI (10m Optical L2A)"

    def __init__(self, client_secret: Optional[str] = None):
        self.client_secret = client_secret or SENTINEL_HUB_CLIENT_SECRET or COPERNICUS_API_KEY

    def check_availability(self, lat: float, lon: float) -> bool:
        # Sentinel-2 has global land coverage from 56° South to 84° North
        return -56.0 <= lat <= 84.0 and -180.0 <= lon <= 180.0

    def query_real_stac_scenes(
        self,
        lat: float,
        lon: float,
        radius_meters: float = 100.0,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 15
    ) -> List[Dict[str, Any]]:
        """Query real public Sentinel-2 L2A STAC catalogue for scenes intersecting AOI."""
        delta_deg = max((radius_meters / 111320.0) * 3, 0.02)
        bbox = [
            round(lon - delta_deg, 4),
            round(lat - delta_deg, 4),
            round(lon + delta_deg, 4),
            round(lat + delta_deg, 4),
        ]

        if not end_date:
            end_dt = datetime.utcnow()
        else:
            try:
                end_dt = datetime.strptime(end_date[:10], "%Y-%m-%d")
            except Exception:
                end_dt = datetime.utcnow()

        if not start_date:
            start_dt = end_dt - timedelta(days=180)
        else:
            try:
                start_dt = datetime.strptime(start_date[:10], "%Y-%m-%d")
            except Exception:
                start_dt = end_dt - timedelta(days=180)

        datetime_str = f"{start_dt.strftime('%Y-%m-%d')}T00:00:00Z/{end_dt.strftime('%Y-%m-%d')}T23:59:59Z"

        payload = {
            "collections": ["sentinel-2-l2a"],
            "bbox": bbox,
            "datetime": datetime_str,
            "limit": limit
        }

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            STAC_ENDPOINT,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "MPLADS-Verification-Platform/1.0"
            }
        )

        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            features = data.get("features", [])
            logger.info(f"Retrieved {len(features)} real Sentinel-2 scenes from STAC catalog for [{lat}, {lon}]")
            return features

    def search_scenes(
        self,
        lat: float,
        lon: float,
        radius_meters: float = 100.0,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        max_cloud_cover_pct: float = 60.0,
        force_demo: bool = False
    ) -> Tuple[List[Dict[str, Any]], str, Dict[str, Any]]:
        """Search Sentinel-2 scenes with quality grading and fallback."""
        mode = "REAL_SATELLITE_API"
        raw_scenes: List[Dict[str, Any]] = []

        if not force_demo:
            try:
                features = self.query_real_stac_scenes(
                    lat=lat,
                    lon=lon,
                    radius_meters=radius_meters,
                    start_date=start_date,
                    end_date=end_date,
                    limit=12
                )
                for feat in features:
                    props = feat.get("properties", {})
                    acq_datetime = props.get("datetime") or props.get("created") or "2024-04-22T05:53:48Z"
                    cloud_pct = float(props.get("eo:cloud_cover", 0.0))
                    scene_id = feat.get("id", f"S2_{acq_datetime[:10]}")
                    assets = feat.get("assets", {})
                    thumb_url = assets.get("rendered_preview", {}).get("href") or assets.get("thumbnail", {}).get("href")
                    sun_elev = props.get("view:sun_elevation") or props.get("sun_elevation")

                    raw_scenes.append({
                        "scene_id": scene_id,
                        "product_id": props.get("s2:product_id") or scene_id,
                        "acquisition_datetime": acq_datetime,
                        "acquisition_date": acq_datetime[:10],
                        "cloud_coverage_pct": round(cloud_pct, 1),
                        "resolution_meters": 10.0,
                        "sun_elevation_deg": round(float(sun_elev), 1) if sun_elev else 54.2,
                        "orbit_pass": f"Orbit {props.get('s2:relative_orbit', 'R076')}",
                        "tile_url": thumb_url,
                        "thumbnail_url": thumb_url,
                        "source": "Copernicus Sentinel-2 MSI L2A",
                        "is_demo": False
                    })
            except Exception as e:
                logger.warning(f"Real STAC query failed ({e}); engaging DEMO MODE with deterministic Sentinel-2 passes.")
                mode = "DEMO_SATELLITE_DATA"
        else:
            mode = "DEMO_SATELLITE_DATA"

        if not raw_scenes or mode == "DEMO_SATELLITE_DATA":
            mode = "DEMO_SATELLITE_DATA"
            raw_scenes = self._generate_deterministic_demo_scenes(lat, lon, start_date, end_date)

        # Classify quality & filter
        classified_scenes: List[Dict[str, Any]] = []
        for s in raw_scenes:
            cloud = s["cloud_coverage_pct"]
            if cloud <= 15.0:
                quality_tier = "OPTIMAL"
            elif cloud <= 30.0:
                quality_tier = "USABLE"
            else:
                quality_tier = "REJECTED_CLOUD"

            is_suitable = cloud <= max_cloud_cover_pct
            rejection_reason = None
            if not is_suitable:
                rejection_reason = f"Cloud coverage ({cloud}%) exceeds allowable threshold ({max_cloud_cover_pct}%)."

            record = dict(s)
            record["quality_tier"] = quality_tier
            record["is_suitable"] = is_suitable
            record["rejection_reason"] = rejection_reason
            classified_scenes.append(record)

        # Sort descending by acquisition date/time
        classified_scenes.sort(key=lambda x: x["acquisition_datetime"], reverse=True)

        provider_info = {
            "provider_name": "European Space Agency (ESA) Copernicus Hub",
            "constellation": "Sentinel-2A / Sentinel-2B",
            "instrument": "MultiSpectral Instrument (MSI)",
            "product_type": "Level-2A Bottom-of-Atmosphere (BOA) Reflectance",
            "nominal_resolution": "10m (B2, B3, B4, B8)",
            "revisit_rate_days": 5,
            "mode": mode,
            "is_demo": mode == "DEMO_SATELLITE_DATA"
        }

        return classified_scenes, mode, provider_info

    def _generate_deterministic_demo_scenes(
        self,
        lat: float,
        lon: float,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate high-fidelity deterministic 5-day revisit Sentinel-2 passes for DEMO MODE."""
        ref_dates = [
            ("2024-06-15", 76.4, "Ascending Pass 05:48 UTC", "REJECTED_CLOUD"),
            ("2024-05-18", 9.1, "Descending Pass 05:54 UTC", "OPTIMAL"),
            ("2024-05-10", 4.1, "Descending Pass 05:54 UTC", "OPTIMAL"),
            ("2024-04-22", 5.8, "Descending Pass 05:52 UTC", "OPTIMAL"),
            ("2024-04-02", 18.2, "Descending Pass 05:50 UTC", "USABLE"),
            ("2024-03-12", 22.0, "Ascending Pass 05:46 UTC", "USABLE"),
            ("2023-11-20", 3.4, "Descending Pass 05:51 UTC", "OPTIMAL"),
            ("2023-09-10", 8.2, "Descending Pass 05:53 UTC", "OPTIMAL"),
            ("2023-09-01", 3.2, "Descending Pass 05:52 UTC", "OPTIMAL"),
            ("2023-08-15", 4.5, "Descending Pass 05:50 UTC", "OPTIMAL"),
            ("2023-07-20", 18.0, "Ascending Pass 05:45 UTC", "USABLE"),
        ]

        tile_mgrs = f"T43Q{chr(65 + int(abs(lat) * 10) % 26)}{chr(65 + int(abs(lon) * 10) % 26)}"
        scenes = []

        for date_str, cloud, orbit, _ in ref_dates:
            compact_date = date_str.replace("-", "")
            scene_id = f"S2B_MSIL2A_{compact_date}T055239_N0500_R076_{tile_mgrs}_{compact_date}T083000"
            scenes.append({
                "scene_id": scene_id,
                "product_id": f"S2B_{compact_date}_{tile_mgrs}_L2A",
                "acquisition_datetime": f"{date_str}T05:52:39Z",
                "acquisition_date": date_str,
                "cloud_coverage_pct": cloud,
                "resolution_meters": 10.0,
                "sun_elevation_deg": round(52.0 + (int(compact_date) % 15), 1),
                "orbit_pass": orbit,
                "tile_url": f"/api/v1/projects/S2/tile/{scene_id}",
                "thumbnail_url": None,
                "source": "DEMO Copernicus Sentinel-2 MSI L2A",
                "is_demo": True
            })

        return scenes

    def search_imagery(self, lat: float, lon: float, radius: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        scenes, _, _ = self.search_scenes(lat, lon, radius, start_date, end_date)
        return scenes

    def get_image(self, reference_id: str) -> Optional[Dict[str, Any]]:
        return {
            "id": reference_id,
            "source": "Copernicus Sentinel-2 MSI L2A",
            "acquisition_date": "2024-04-22",
            "resolution_meters": 10.0,
            "cloud_coverage_pct": 5.8,
            "tile_identifier": reference_id
        }

    def get_metadata(self, reference_id: str) -> Dict[str, Any]:
        return {
            "provider": "European Space Agency (ESA) Copernicus Hub",
            "platform": "Sentinel-2B",
            "bands": ["B02 (Blue 490nm)", "B03 (Green 560nm)", "B04 (Red 665nm)", "B08 (NIR 842nm)", "B11 (SWIR 1610nm)"],
            "atmospheric_correction": "Sen2Cor v2.10 Level-2A BOA Reflectance",
            "reference_id": reference_id,
            "geometry_crs": "EPSG:4326 (WGS 84)"
        }

