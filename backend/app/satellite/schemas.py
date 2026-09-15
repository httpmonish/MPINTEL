from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SatelliteImageRefSchema(BaseModel):
    id: str
    source: str
    acquisition_date: str
    resolution_meters: float
    cloud_coverage_pct: float
    tile_identifier: str
    url: Optional[str] = None
    thumbnail_svg: Optional[str] = None

class SatelliteAnalysisRequest(BaseModel):
    project_id: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    work_category: Optional[str] = "Roads & Bridges"
    radius_meters: Optional[float] = 100.0
    preferred_provider: Optional[str] = "Bhuvan"

class SentinelSceneRecord(BaseModel):
    scene_id: str
    product_id: str
    acquisition_datetime: str
    acquisition_date: str
    cloud_coverage_pct: float
    resolution_meters: float = 10.0
    quality_tier: str  # "OPTIMAL" (<15%), "USABLE" (15-30%), "REJECTED_CLOUD" (>30%)
    is_suitable: bool
    rejection_reason: Optional[str] = None
    tile_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    sun_elevation_deg: Optional[float] = None
    orbit_pass: Optional[str] = None
    source: str = "Copernicus Sentinel-2 MSI L2A"
    is_demo: bool = False

class SentinelSceneSearchRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    radius_meters: Optional[float] = 100.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_cloud_cover_pct: Optional[float] = 60.0
    force_demo: Optional[bool] = False

class SentinelSceneSearchResponse(BaseModel):
    project_id: Optional[str] = None
    latitude: float
    longitude: float
    radius_meters: float
    total_scenes_found: int
    scenes: List[SentinelSceneRecord]
    latest_suitable_scene: Optional[SentinelSceneRecord] = None
    rejected_newer_scenes: List[SentinelSceneRecord] = []
    mode: str  # "REAL_SATELLITE_API" or "DEMO_SATELLITE_DATA"
    provider_info: Dict[str, Any]
    retrieval_timestamp: str

class SentinelObservationCompareRequest(BaseModel):
    project_id: str
    latitude: float
    longitude: float
    work_category: Optional[str] = "Roads & Bridges"
    radius_meters: Optional[float] = 100.0
    before_scene_id: str
    after_scene_id: str

class SentinelObservationCompareResponse(BaseModel):
    project_id: str
    latitude: float
    longitude: float
    radius_meters: float
    before_scene: SentinelSceneRecord
    after_scene: SentinelSceneRecord
    spatial_overlap_score: float
    change_score: float
    evidence_confidence: float
    evidence_status: str
    detected_change_type: str
    detected_area_sq_meters: float
    notes: str
    mode: str
    provenance: Dict[str, Any]

class SatelliteEvidenceSchema(BaseModel):
    project_id: str
    latitude: float
    longitude: float
    radius_meters: float
    provider: str
    imagery_source: str
    acquisition_date: str
    comparison_date: str
    before_image: SatelliteImageRefSchema
    after_image: SatelliteImageRefSchema
    image_resolution_meters: float
    cloud_coverage_pct: float
    processing_status: str
    preprocessing_method: str
    change_detection_method: str
    change_score: float = Field(..., ge=0.0, le=1.0)
    spatial_overlap_score: float = Field(..., ge=0.0, le=1.0)
    evidence_confidence: float = Field(..., ge=0.0, le=100.0)
    evidence_status: str
    detected_change_type: str
    detected_area_sq_meters: float
    notes: str
    generated_at: str
    source_metadata: Dict[str, Any]
    provenance: Dict[str, Any]
    limitations: List[str]

class SatelliteStatusResponse(BaseModel):
    project_id: str
    status: str
    provider: str
    evidence_available: bool
    evidence_confidence: float
    spatial_overlap_pct: float
    fairness_safeguard_note: str
