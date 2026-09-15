from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# -----------------------------------------------------------------------------
# Provenance Schema
# -----------------------------------------------------------------------------
class ProvenanceMetadata(BaseModel):
    source: str = Field(..., example="data.gov.in / eSAKSHI")
    source_type: str = Field(..., example="OFFICIAL_PUBLIC")
    source_url: Optional[str] = None
    retrieved_at: datetime = Field(default_factory=datetime.now)
    is_synthetic: bool = False
    data_quality_score: float = 1.0

# -----------------------------------------------------------------------------
# MP & Project Schemas
# -----------------------------------------------------------------------------
class MPSchema(BaseModel):
    id: Optional[str] = None
    mp_name: str
    house: str
    category: str
    state: str
    constituency: Optional[str] = None
    allocated_limit_inr: float
    provenance: Optional[ProvenanceMetadata] = None

class ProjectSchema(BaseModel):
    id: Optional[str] = None
    work_id: str
    work_category: str
    work_title: str
    work_description: Optional[str] = None
    mp_name: Optional[str] = None
    ida_office: Optional[str] = None
    state: str
    constituency: Optional[str] = None
    sanctioned_amount_inr: float
    disbursed_amount_inr: float
    current_stage: str = "PROPOSAL_SUBMITTED"
    has_official_images: bool = False
    provenance: Optional[ProvenanceMetadata] = None

# -----------------------------------------------------------------------------
# Feature 1 & 2: Risk Assessment & Peer Comparison Schemas
# STRICT SEPARATION: Risk Score vs Verification Confidence
# -----------------------------------------------------------------------------
class RiskScoreBreakdown(BaseModel):
    cost_anomaly_score: float = Field(..., ge=0, le=100, description="Z-Score / IQR vs peer benchmark")
    time_delay_score: float = Field(..., ge=0, le=100, description="SLA workflow delay score")
    duplicate_risk_score: float = Field(..., ge=0, le=100, description="Perceptual photo hash overlap risk")
    cluster_density_score: float = Field(..., ge=0, le=100, description="Geographic clustering score")

class RiskAssessmentResult(BaseModel):
    project_id: str
    work_id: str
    risk_score: float = Field(..., ge=0, le=100, description="Composite Risk Score 0-100")
    anomaly_flag: str = Field(..., example="POTENTIAL_ANOMALY")
    explanation: Dict[str, Any]
    score_breakdown: RiskScoreBreakdown
    peer_group_id: str
    evaluated_at: datetime = Field(default_factory=datetime.now)

# -----------------------------------------------------------------------------
# Feature 3 & 4: Evidence & Citizen Verification Schemas
# -----------------------------------------------------------------------------
class CitizenEvidenceSubmission(BaseModel):
    project_id: str
    latitude: float
    longitude: float
    timestamp_captured: datetime
    is_live_camera_capture: bool
    image_base64: Optional[str] = None

class EvidenceVerificationResult(BaseModel):
    evidence_id: str
    project_id: str
    distance_to_project_meters: float
    location_verified: bool
    phash_value: Optional[str] = None
    duplicate_detected: bool = False
    verification_status: str

# -----------------------------------------------------------------------------
# Feature 5 & 9: Verification Confidence & Fairness Schemas
# -----------------------------------------------------------------------------
class VerificationEvaluationResult(BaseModel):
    project_id: str
    verification_confidence: float = Field(..., ge=0, le=100, description="Triangulated Verification Confidence 0-100")
    independent_evidence_status: str = Field(..., example="INDEPENDENT_EVIDENCE_UNAVAILABLE")
    is_low_connectivity_region: bool = False
    triangulation_summary: Dict[str, float]
    evaluated_at: datetime = Field(default_factory=datetime.now)

# -----------------------------------------------------------------------------
# Feature 6: SLA Workflow Bottleneck Schema
# -----------------------------------------------------------------------------
class SLABottleneckResult(BaseModel):
    project_id: str
    current_stage: str
    days_in_current_stage: float
    expected_benchmark_days: float
    delay_ratio: float
    responsible_role: str
    is_bottleneck: bool

# -----------------------------------------------------------------------------
# Feature 7: Inspection Optimizer Schema
# -----------------------------------------------------------------------------
class InspectorScheduleItem(BaseModel):
    inspection_priority_rank: int
    project_id: str
    work_id: str
    priority_score: float
    risk_score: float
    disbursed_amount_inr: float
    distance_from_base_km: float
    recommended_action: str

# -----------------------------------------------------------------------------
# Feature 8: Ledger Snapshot Schema
# -----------------------------------------------------------------------------
class AuditLedgerEntry(BaseModel):
    ledger_id: str
    project_id: str
    action_type: str
    data_source: str
    model_version: str
    rules_version: str
    risk_score: float
    verification_confidence: float
    human_decision: Optional[str] = None
    human_notes: Optional[str] = None
    snapshot_payload: Dict[str, Any]
    timestamp: datetime

# -----------------------------------------------------------------------------
# Phase 2: Field Verification & Physical Inspection Schemas
# -----------------------------------------------------------------------------
class InspectionCreateRequest(BaseModel):
    project_id: str
    inspector_id: str
    inspector_name: str
    inspector_role: str = "Authorized Junior Engineer (PWD)"
    inspector_badge: str = "PWD-INSP-2024"
    scheduled_date: Optional[str] = None
    stage: str = "BEFORE" # "BEFORE" | "DURING" | "AFTER"
    allowed_radius_meters: Optional[float] = 100.0

class LocationValidationRequest(BaseModel):
    inspector_id: str
    latitude: float
    longitude: float
    accuracy_meters: Optional[float] = None
    client_timestamp: Optional[str] = None

class LocationValidationResponse(BaseModel):
    inspection_id: str
    project_id: str
    distance_to_project_meters: float
    allowed_radius_meters: float
    location_status: str # "WITHIN_RADIUS" | "OUTSIDE_RADIUS" | "GPS_UNAVAILABLE" | "GPS_LOW_ACCURACY" | "INVALID_COORDINATES"
    is_location_verified: bool
    status_label: str
    disclaimer: str

class FieldEvidenceUploadRequest(BaseModel):
    inspector_id: str
    stage: str = "BEFORE"
    caption: str
    latitude: float
    longitude: float
    gps_accuracy_meters: Optional[float] = None
    altitude_meters: Optional[float] = None
    heading_degrees: Optional[float] = None
    is_live_camera_stream: bool = True
    image_base64: Optional[str] = None
    phash_value: Optional[str] = None
    signature_digest: Optional[str] = None
    device_identifier: Optional[str] = None
    client_timestamp: Optional[str] = None

class FieldPhotoRecord(BaseModel):
    id: str
    inspection_id: str
    project_id: str
    stage: str
    url: str
    caption: str
    captured_at: str
    latitude: float
    longitude: float
    gps_accuracy_meters: Optional[float] = None
    is_live_camera_stream: bool
    phash: str
    duplicate_status: str # "NEW_EVIDENCE" | "POSSIBLE_DUPLICATE" | "DUPLICATE_EVIDENCE" | "INSUFFICIENT_IMAGE_QUALITY"
    matched_project_id: Optional[str] = None
    similarity_score_pct: Optional[float] = None
    signature_state: str # "SIGNED_AND_VALID" | "SIGNED_BUT_INVALID" | "UNSIGNED" | "SIGNATURE_UNAVAILABLE" | "DEVICE_NOT_AUTHORIZED"
    device_tpm_authorized: bool
    quality_tier: str # "GOOD" | "ACCEPTABLE" | "LOW_QUALITY" | "UNUSABLE"
    quality_score_pct: float
    upload_status: str
    audit_hash: str

class InspectionReviewRequest(BaseModel):
    reviewer_id: str
    reviewer_name: str
    reviewer_role: str
    decision: str # "VERIFIED" | "PARTIALLY_VERIFIED" | "INSUFFICIENT_EVIDENCE" | "EVIDENCE_CONFLICT_CONFIRMED" | "REQUEST_REINSPECTION"
    remarks: str
    supporting_evidence_ids: Optional[List[str]] = []

class ReinspectionRequestSchema(BaseModel):
    requested_by_id: str
    requested_by_name: str
    reason: str
    new_inspector_id: Optional[str] = None
    new_scheduled_date: Optional[str] = None

class FieldInspectionDetail(BaseModel):
    inspection_id: str
    project_id: str
    project_title: str
    work_category: str
    stage: str
    assigned_inspector: Dict[str, Any]
    assignment_date: str
    scheduled_date: str
    status: str
    project_coordinates: Dict[str, float]
    allowed_radius_meters: float
    inspection_coordinates: Optional[Dict[str, Any]] = None
    distance_to_project_meters: Optional[float] = None
    location_status: str
    photos: List[FieldPhotoRecord] = []
    verification_confidence: Optional[float] = None
    confidence_breakdown: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    review_decision: Optional[Dict[str, Any]] = None
    reinspection_of_id: Optional[str] = None
    child_reinspection_id: Optional[str] = None
    audit_trail: List[Dict[str, Any]] = []

# -----------------------------------------------------------------------------
# Phase 3: Multi-Scheme Cross-Verification Schemas
# -----------------------------------------------------------------------------
class SchemeMetadataSchema(BaseModel):
    scheme_id: str
    display_name: str
    statutory_body: str
    ministry: str
    primary_categories: List[str]
    data_provider: str
    supports_footprints: bool
    supports_photos: bool
    supports_documents: bool
    is_demo_source: bool = False

class AssetGeometrySchema(BaseModel):
    spatial_type: str # "POINT" | "POLYGON" | "CORRIDOR" | "NETWORK"
    centroid: Dict[str, float]
    coordinates: Optional[List[List[float]]] = None
    bounding_radius_meters: float
    estimated_area_sq_meters: Optional[float] = None

class SchemeDocumentSchema(BaseModel):
    id: str
    document_type: str
    title: str
    file_url: str
    extracted_fields: Dict[str, Any] = {}

class NormalizedProjectSchema(BaseModel):
    project_id: str
    scheme_id: str # "MPLADS" | "MGNREGA" | "PMGSY" | "PMAY" | "JJM"
    scheme_name: str
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    location: str
    district: str
    state: str
    constituency: Optional[str] = None
    implementing_agency: str
    contractor: Optional[str] = None
    vendor: Optional[str] = None
    sanctioned_amount_inr: float
    expenditure_amount_inr: float
    start_date: str
    completion_date: Optional[str] = None
    status: str
    beneficiary_summary: Optional[str] = None
    geometry: Optional[AssetGeometrySchema] = None
    documents: List[SchemeDocumentSchema] = []
    photos: List[Dict[str, Any]] = []
    satellite_evidence: Optional[Dict[str, Any]] = None
    field_inspections: Optional[List[Dict[str, Any]]] = []
    source: str
    source_record_id: str
    source_timestamp: str
    is_demo: bool = False

class MatchSignalSchema(BaseModel):
    signal_type: str
    score_pct: float
    weight: float
    weighted_points: float
    status: str # "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT"
    evidence_reference: Optional[str] = None
    explanation: str

class CrossSchemeMatchSchema(BaseModel):
    match_id: str
    project_a: NormalizedProjectSchema
    project_b: NormalizedProjectSchema
    similarity_score: float # 0 - 100
    classification: str
    priority: str # "LOW_PRIORITY" | "MEDIUM_PRIORITY" | "HIGH_PRIORITY" | "URGENT_REVIEW"
    temporal_relationship: str
    asset_lifecycle: str
    signals: Dict[str, MatchSignalSchema]
    signal_list: List[MatchSignalSchema]
    why_flagged_summary: str
    distance_meters: float
    geometry_overlap_pct: Optional[float] = None
    image_similarity_pct: Optional[float] = None
    text_similarity_pct: Optional[float] = None
    status: str
    decision: Optional[Dict[str, Any]] = None
    audit_trail: List[Dict[str, Any]] = []
    created_at: str
    is_demo_scenario: bool = False
    demo_scenario_tag: Optional[str] = None

class CrossSchemeDecisionRequest(BaseModel):
    reviewer_id: str
    reviewer_name: str
    reviewer_role: str
    decision: str # "CONFIRMED_SHARED_ASSET" | "CONFIRMED_SEPARATE_ASSETS" | "INSUFFICIENT_EVIDENCE" | "NEEDS_FIELD_INSPECTION" | "NEEDS_DOCUMENT_REVIEW" | "FALSE_MATCH"
    remarks: str
    dispatch_field_inspection: bool = False
    inspector_id: Optional[str] = None

class CrossSchemeAnalysisRequest(BaseModel):
    project_id: str
    scheme_id: str = "MPLADS"
    max_distance_meters: Optional[float] = 1000.0
    include_demo_schemes: bool = True


