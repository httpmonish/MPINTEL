from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional, List
from schemas.pydantic_schemas import (
    InspectionCreateRequest,
    LocationValidationRequest,
    LocationValidationResponse,
    FieldEvidenceUploadRequest,
    FieldPhotoRecord,
    InspectionReviewRequest,
    ReinspectionRequestSchema,
    FieldInspectionDetail,
)
from engines.field_verification import FieldVerificationEngine

router = APIRouter(prefix="/inspections", tags=["Field Verification & Inspection Subsystem"])
engine = FieldVerificationEngine()

@router.get("", response_model=List[FieldInspectionDetail], summary="List all field inspections")
def list_inspections(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    inspector_id: Optional[str] = Query(None, description="Filter by assigned inspector"),
    status: Optional[str] = Query(None, description="Filter by inspection status")
):
    return engine.get_all_inspections(project_id=project_id, inspector_id=inspector_id, status=status)

@router.post("", response_model=FieldInspectionDetail, summary="Assign a new field inspection")
def create_inspection(req: InspectionCreateRequest):
    return engine.create_inspection(
        project_id=req.project_id,
        inspector_id=req.inspector_id,
        inspector_name=req.inspector_name,
        inspector_role=req.inspector_role,
        inspector_badge=req.inspector_badge,
        scheduled_date=req.scheduled_date,
        stage=req.stage,
        allowed_radius_meters=req.allowed_radius_meters or 100.0
    )

@router.get("/{inspection_id}", response_model=FieldInspectionDetail, summary="Get full inspection details")
def get_inspection(inspection_id: str):
    insp = engine.get_inspection(inspection_id)
    if not insp:
        raise HTTPException(status_code=404, detail=f"Inspection '{inspection_id}' not found.")
    return insp

@router.post("/{inspection_id}/start", response_model=FieldInspectionDetail, summary="Inspector accepts and starts on-site session")
def start_inspection(inspection_id: str, inspector_id: str = Query(..., description="Inspector ID for authorization")):
    try:
        return engine.start_inspection(inspection_id=inspection_id, inspector_id=inspector_id)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/{inspection_id}/location", response_model=LocationValidationResponse, summary="Validate live inspector coordinates against sanctioned AOI")
def validate_inspector_location(inspection_id: str, req: LocationValidationRequest):
    try:
        return engine.validate_location(
            inspection_id=inspection_id,
            inspector_id=req.inspector_id,
            latitude=req.latitude,
            longitude=req.longitude,
            accuracy_meters=req.accuracy_meters
        )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/{inspection_id}/evidence", response_model=FieldPhotoRecord, summary="Upload live geotagged field photograph")
def upload_field_evidence(inspection_id: str, req: FieldEvidenceUploadRequest):
    try:
        return engine.upload_photo_evidence(
            inspection_id=inspection_id,
            inspector_id=req.inspector_id,
            stage=req.stage,
            caption=req.caption,
            latitude=req.latitude,
            longitude=req.longitude,
            is_live_camera_stream=req.is_live_camera_stream,
            gps_accuracy_meters=req.gps_accuracy_meters,
            image_base64=req.image_base64,
            phash_value=req.phash_value,
            signature_digest=req.signature_digest,
            device_identifier=req.device_identifier
        )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/{inspection_id}/submit", response_model=FieldInspectionDetail, summary="Submit inspection for automated multi-signal verification")
def submit_inspection(inspection_id: str, inspector_id: str = Query(...)):
    try:
        return engine.submit_inspection(inspection_id=inspection_id, inspector_id=inspector_id)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/{inspection_id}/review", response_model=FieldInspectionDetail, summary="Record authorized human investigator decision")
def review_inspection(inspection_id: str, req: InspectionReviewRequest):
    try:
        return engine.record_human_review(
            inspection_id=inspection_id,
            reviewer_id=req.reviewer_id,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            decision=req.decision,
            remarks=req.remarks,
            supporting_evidence_ids=req.supporting_evidence_ids
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/{inspection_id}/reinspect", response_model=FieldInspectionDetail, summary="Request immutable child re-inspection")
def request_reinspection(inspection_id: str, req: ReinspectionRequestSchema):
    try:
        return engine.request_reinspection(
            parent_inspection_id=inspection_id,
            requested_by_id=req.requested_by_id,
            requested_by_name=req.requested_by_name,
            reason=req.reason,
            new_inspector_id=req.new_inspector_id,
            new_scheduled_date=req.new_scheduled_date
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
