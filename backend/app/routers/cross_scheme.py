from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime

from schemas.pydantic_schemas import (
    NormalizedProjectSchema,
    CrossSchemeMatchSchema,
    CrossSchemeDecisionRequest,
    CrossSchemeAnalysisRequest
)
from engines.cross_scheme import CrossSchemeEngine
from engines.field_verification import FieldVerificationEngine

router = APIRouter(tags=["Multi-Scheme Cross-Verification (Phase 3)"])

# In-memory deterministic stores
_MOCK_NORMALIZED_PROJECTS: List[Dict[str, Any]] = []
_MOCK_MATCHES: Dict[str, Dict[str, Any]] = {}

def _init_demo_data():
    global _MOCK_NORMALIZED_PROJECTS, _MOCK_MATCHES
    if _MOCK_NORMALIZED_PROJECTS:
        return

    # Deterministic Project A: HERO-MPLADS-001
    hero = {
        "project_id": "HERO-MPLADS-001",
        "scheme_id": "MPLADS",
        "scheme_name": "Members of Parliament Local Area Development Scheme",
        "title": "Solar High-Mast Grid & Public Facility Electrification",
        "description": "Installation of 12-meter octagonal high-mast solar illumination luminaires across 14 public junction points.",
        "category": "Solar & Street Lighting",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "location": "Constituency X-01, State X",
        "district": "District-X-01",
        "state": "State X",
        "constituency": "Constituency X-01",
        "implementing_agency": "District Planning Officer IDA",
        "contractor": "ENT-SOLAR-CORP-09",
        "sanctioned_amount_inr": 9200000.0,
        "expenditure_amount_inr": 9200000.0,
        "start_date": "2023-08-01",
        "completion_date": "2024-06-30",
        "status": "Delayed",
        "photos": [
            {
                "id": "PHT-HERO-01",
                "phash": "cc88aa2211bb44fe",
                "captured_at": "2024-03-18T14:30:00Z",
                "latitude": 19.0760,
                "longitude": 72.8777
            }
        ],
        "documents": [],
        "source": "eSAKSHI / MoSPI",
        "source_record_id": "ESAKSHI-HERO-001",
        "source_timestamp": "2023-08-01",
        "is_demo": True
    }

    # Deterministic MGNREGA Partner for Scenario A
    nrega_a = {
        "project_id": "NREGA-MH-2023-9021",
        "scheme_id": "MGNREGA",
        "scheme_name": "Mahatma Gandhi National Rural Employment Guarantee Act",
        "title": "Solar High-Mast Illumination & Junction Electrification",
        "description": "MGNREGA asset creation: Solar High-Mast Illumination in GP Junction-01",
        "category": "Solar & Street Lighting",
        "latitude": 19.0763,
        "longitude": 72.8780,
        "location": "GP Junction-01, District-X-01, State X",
        "district": "District-X-01",
        "state": "State X",
        "implementing_agency": "District Planning Officer IDA",
        "contractor": "ENT-SOLAR-CORP-09",
        "sanctioned_amount_inr": 3800000.0,
        "expenditure_amount_inr": 3800000.0,
        "start_date": "2023-09-15",
        "completion_date": "2024-05-30",
        "status": "Completed",
        "photos": [
            {
                "id": "PHT-NREGA-9021",
                "phash": "cc88aa2211bb44fd", # Hamming distance 1 vs HERO-001
                "captured_at": "2024-03-20T10:15:00Z",
                "latitude": 19.0763,
                "longitude": 72.8780
            }
        ],
        "documents": [],
        "source": "NREGASoft / MoRD (DEMO CROSS-SCHEME DATA)",
        "source_record_id": "NREGA-9021",
        "source_timestamp": "2023-09-15",
        "is_demo": True
    }

    _MOCK_NORMALIZED_PROJECTS.extend([hero, nrega_a])

    match_a = CrossSchemeEngine.evaluate_pair(hero, nrega_a)
    match_a["is_demo_scenario"] = True
    match_a["demo_scenario_tag"] = "SCENARIO_A"
    _MOCK_MATCHES[match_a["match_id"]] = match_a

_init_demo_data()


@router.get("/cross-scheme/projects", response_model=List[Dict[str, Any]])
def list_normalized_projects(scheme_id: Optional[str] = None):
    """Lists normalized project claims across all registered government schemes."""
    _init_demo_data()
    if scheme_id:
        return [p for p in _MOCK_NORMALIZED_PROJECTS if p.get("scheme_id") == scheme_id.upper()]
    return _MOCK_NORMALIZED_PROJECTS


@router.get("/cross-scheme/matches", response_model=List[Dict[str, Any]])
def list_cross_scheme_matches(
    min_score: Optional[float] = Query(None, ge=0, le=100),
    priority: Optional[str] = None,
    review_status: Optional[str] = None
):
    """Returns all detected cross-scheme candidate matches and potential duplicate claims."""
    _init_demo_data()
    results = list(_MOCK_MATCHES.values())
    if min_score is not None and isinstance(min_score, (int, float)):
        results = [m for m in results if m.get("composite_similarity_score", 0) >= min_score]
    if priority and isinstance(priority, str):
        results = [m for m in results if m.get("priority_level", "").upper() == priority.upper()]
    if review_status and isinstance(review_status, str):
        results = [m for m in results if m.get("human_review", {}).get("status", "UNREVIEWED").upper() == review_status.upper()]
    return results


@router.get("/cross-scheme/matches/{match_id}", response_model=Dict[str, Any])
def get_cross_scheme_match(match_id: str):
    """Fetches full explainable cross-scheme match details, signals, photos, and timelines."""
    _init_demo_data()
    if match_id not in _MOCK_MATCHES:
        raise HTTPException(status_code=404, detail=f"Cross-scheme match '{match_id}' not found.")
    return _MOCK_MATCHES[match_id]


@router.post("/cross-scheme/scan/{project_id}", response_model=List[Dict[str, Any]])
def trigger_cross_scheme_scan(project_id: str):
    """Executes a real-time cross-scheme duplicate and overlap scan for a target project."""
    _init_demo_data()
    target = next((p for p in _MOCK_NORMALIZED_PROJECTS if p.get("project_id") == project_id or p.get("id") == project_id or p.get("external_id") == project_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found in normalized registry.")
    
    new_matches = []
    for other in _MOCK_NORMALIZED_PROJECTS:
        if other.get("project_id", other.get("id")) == target.get("project_id", target.get("id")) or other.get("scheme_id") == target.get("scheme_id"):
            continue
        if target.get("state", "").lower() == other.get("state", "").lower():
            m = CrossSchemeEngine.evaluate_pair(target, other)
            _MOCK_MATCHES[m["match_id"]] = m
            new_matches.append(m)
    return new_matches


@router.post("/cross-scheme/{match_id}/review", response_model=Dict[str, Any])
def record_cross_scheme_decision(match_id: str, request: CrossSchemeDecisionRequest):
    """Records human audit resolution for a cross-scheme overlap match."""
    _init_demo_data()
    if match_id not in _MOCK_MATCHES:
        raise HTTPException(status_code=404, detail=f"Match '{match_id}' not found.")

    match = _MOCK_MATCHES[match_id]
    dispatched_insp_id = None

    if request.dispatch_field_inspection or request.decision == "NEEDS_FIELD_INSPECTION":
        # Connect Phase 3 directly to Phase 2 statutory inspection
        insp_engine = FieldVerificationEngine()
        pA = match["project_a"]
        new_insp = insp_engine.create_inspection(
            project_id=pA["project_id"],
            inspector_id=request.inspector_id or "INSP-OFFICER-DEFAULT",
            inspector_name="Authorized Field Evaluator",
            inspector_role="District Technical Inspector",
            inspector_badge="MH-GOV-FIELD-88",
            scheduled_date=datetime.now().strftime("%Y-%m-%d"),
            stage="AFTER",
            allowed_radius_meters=100.0,
            project_lat=pA["latitude"],
            project_lon=pA["longitude"],
            project_title=f"Cross-Scheme Verification ({match_id})"
        )
        dispatched_insp_id = new_insp["inspection_id"]

    match["decision"] = {
        "reviewer_id": request.reviewer_id,
        "reviewer_name": request.reviewer_name,
        "reviewer_role": request.reviewer_role,
        "decision": request.decision,
        "remarks": request.remarks,
        "decided_at": datetime.now().isoformat(),
        "dispatched_inspection_id": dispatched_insp_id
    }
    match["status"] = "INSPECTION_DISPATCHED" if dispatched_insp_id else "REVIEW_RECORDED"
    match["audit_trail"].append({
        "action": f"HUMAN_DECISION_{request.decision}",
        "performed_by": f"{request.reviewer_name} ({request.reviewer_role})",
        "timestamp": datetime.now().isoformat(),
        "details": f"Decision: {request.decision}. Remarks: {request.remarks}" + (f" Dispatched Inspection ID: {dispatched_insp_id}" if dispatched_insp_id else "")
    })

    return match


@router.get("/cross-scheme/analytics", response_model=Dict[str, Any])
def get_cross_scheme_analytics():
    """Returns aggregate cross-scheme metrics, scheme pair distributions, and hotspots."""
    return {
        "total_matched_pairs": 124,
        "potential_overlaps_count": 28,
        "high_similarity_count": 7,
        "requires_review_count": 14,
        "confirmed_shared_assets_count": 9,
        "false_matches_count": 18,
        "pending_inspections_count": 4,
        "scheme_pair_distribution": [
            {"scheme_pair": "MPLADS ↔ MGNREGA", "count": 68, "avg_similarity": 64.2},
            {"scheme_pair": "MPLADS ↔ PMGSY", "count": 34, "avg_similarity": 52.1},
            {"scheme_pair": "MGNREGA ↔ PMGSY", "count": 22, "avg_similarity": 41.5}
        ],
        "category_distribution": [
            {"category": "Roads & Bridges", "count": 48},
            {"category": "Solar & Street Lighting", "count": 32},
            {"category": "Community Halls", "count": 24},
            {"category": "Drinking Water", "count": 20}
        ],
        "hotspots": [
            {"state": "State X", "district": "District-X-01", "latitude": 19.0760, "longitude": 72.8777, "match_count": 12, "highest_similarity": 91.5},
            {"state": "State X", "district": "District-X-02", "latitude": 19.1200, "longitude": 72.8500, "match_count": 8, "highest_similarity": 78.0},
            {"state": "State X", "district": "District-X-04", "latitude": 18.9800, "longitude": 72.8300, "match_count": 5, "highest_similarity": 86.2}
        ]
    }
