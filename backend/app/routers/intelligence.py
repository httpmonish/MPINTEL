from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
import numpy as np

from engines.risk_engine import AIRiskEngine
from engines.peer_comparison import PeerComparisonEngine
from engines.photo_duplication import PhotoDuplicationEngine
from engines.citizen_verification import CitizenVerificationEngine
from engines.evidence_triangulation import EvidenceTriangulationEngine
from engines.fairness_engine import FairnessSafeguardEngine
from engines.sla_analyzer import SLABottleneckAnalyzer
from engines.inspection_optimizer import InspectionOptimizerEngine
from engines.ledger_engine import AuditLedgerEngine

from adapters.synthetic_evidence import SyntheticEvidenceGenerator
from adapters.synthetic_process_data import SyntheticProcessGenerator, SYNTHETIC_INSPECTORS
from schemas.pydantic_schemas import CitizenEvidenceSubmission
from routers.projects import WORK_RECORDS

router = APIRouter(prefix="", tags=["Pratyaksh Process Intelligence & Inspection Optimizer"])

# Initialize engine singletons
risk_engine = AIRiskEngine()
peer_engine = PeerComparisonEngine()
photo_engine = PhotoDuplicationEngine()
citizen_engine = CitizenVerificationEngine()
triangulation_engine = EvidenceTriangulationEngine()
fairness_engine = FairnessSafeguardEngine()
sla_engine = SLABottleneckAnalyzer()
inspection_engine = InspectionOptimizerEngine()
ledger_engine = AuditLedgerEngine()

# Compute peer benchmarks at router startup
PEER_BENCHMARKS = peer_engine.compute_peer_benchmarks(WORK_RECORDS)

# Generate synthetic demonstration stores for prototype testing
EVIDENCE_STORE = SyntheticEvidenceGenerator.generate_demo_evidence_store(WORK_RECORDS)

# Pre-evaluate top 2,000 records for high-speed prototype API responses
EVALUATED_CACHE = []
sample_features = []

for idx, p in enumerate(WORK_RECORDS[:2000]):
    peer_analysis = peer_engine.get_peer_stats(p, PEER_BENCHMARKS)
    risk_res = risk_engine.evaluate_project_risk(p, peer_analysis)
    
    # Attach synthetic process stage history to candidate records
    stage_hist = SyntheticProcessGenerator.generate_project_stage_history(p, idx)
    risk_res["stage_history"] = stage_hist
    risk_res["latitude"] = p.get("latitude", 25.0961)
    risk_res["longitude"] = p.get("longitude", 85.3131)
    
    EVALUATED_CACHE.append(risk_res)
    
    bd = risk_res["component_breakdown"]
    sample_features.append([bd["cost_anomaly"], bd["delay_anomaly"], bd["payment_pattern"], bd["spatial_signal"], bd["evidence_issue"]])

if sample_features:
    risk_engine.fit_isolation_forest(np.array(sample_features))

# -----------------------------------------------------------------------------
# PHASE 2 & 3 ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/risk/{work_id:path}", summary="GET /risk/{project_id}")
def get_project_risk_detail(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    if not match:
        project = next((w for w in WORK_RECORDS if clean_id.lower() in w["work_id"].lower()), None)
        if project:
            peer_analysis = peer_engine.get_peer_stats(project, PEER_BENCHMARKS)
            match = risk_engine.evaluate_project_risk(project, peer_analysis)
            match["stage_history"] = SyntheticProcessGenerator.generate_project_stage_history(project, 0)
            
    if not match:
        raise HTTPException(status_code=404, detail=f"Project with work_id '{work_id}' not found.")

    orig_proj = next((w for w in WORK_RECORDS if w["work_id"] == match["work_id"]), {})
    peer_analysis = peer_engine.get_peer_stats(orig_proj, PEER_BENCHMARKS)

    return {
        "project": {
            "work_id": match.get("work_id"),
            "work_title": match.get("work_title"),
            "state": match.get("state"),
            "constituency": match.get("constituency"),
            "disbursed_amount_inr": match.get("disbursed_amount_inr"),
            "current_stage": orig_proj.get("current_stage", "COMPLETION_REPORTED"),
            "has_official_images": orig_proj.get("has_official_images", False)
        },
        "risk_assessment": match,
        "peer_group_summary": peer_analysis
    }


@router.get("/risk", summary="GET /risk - Paginated, sortable, filterable project list")
def list_projects_risk(
    state: Optional[str] = None,
    work_category: Optional[str] = None,
    anomaly_flag: Optional[str] = None,
    min_risk_score: Optional[float] = Query(None, ge=0, le=100),
    sort_by: str = Query("risk_score", pattern="^(risk_score|disbursed_amount_inr|work_id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, le=500),
    offset: int = 0
):
    limit_val = int(getattr(limit, "default", limit))
    offset_val = int(getattr(offset, "default", offset))
    sort_by_val = str(getattr(sort_by, "default", sort_by))
    sort_order_val = str(getattr(sort_order, "default", sort_order))
    min_risk_val = float(getattr(min_risk_score, "default", min_risk_score)) if min_risk_score is not None and not hasattr(min_risk_score, "default") else None

    filtered = EVALUATED_CACHE
    if state:
        filtered = [r for r in filtered if state.lower() in r.get("state", "").lower()]
    if anomaly_flag:
        filtered = [r for r in filtered if r["anomaly_flag"] == anomaly_flag.upper()]
    if min_risk_val is not None:
        filtered = [r for r in filtered if r["risk_score"] >= min_risk_val]

    reverse = (sort_order_val.lower() == "desc")
    if sort_by_val == "risk_score":
        filtered = sorted(filtered, key=lambda x: x["risk_score"], reverse=reverse)
    elif sort_by_val == "disbursed_amount_inr":
        filtered = sorted(filtered, key=lambda x: x["disbursed_amount_inr"], reverse=reverse)
    elif sort_by_val == "work_id":
        filtered = sorted(filtered, key=lambda x: x["work_id"], reverse=reverse)

    paginated = filtered[offset_val : offset_val + limit_val]

    return {
        "total_records": len(filtered),
        "limit": limit_val,
        "offset": offset_val,
        "sort_by": sort_by_val,
        "sort_order": sort_order_val,
        "projects": paginated
    }


@router.get("/verification/photo-similarity/{work_id:path}", summary="GET /verification/photo-similarity/{project_id}")
def check_photo_similarity_endpoint(work_id: str):
    clean_id = work_id.strip('/')
    target_ev = next((e for e in EVIDENCE_STORE if e["project_id"].lower().strip('/') == clean_id.lower()), None)
    target_phash = target_ev.get("phash_value") if target_ev else None
    
    sim_res = photo_engine.check_photo_similarity(
        target_project_id=clean_id,
        target_phash=target_phash,
        evidence_index=EVIDENCE_STORE
    )
    return sim_res


@router.post("/verification/citizen-capture", summary="POST /verification/citizen-capture")
def submit_citizen_capture(submission: CitizenEvidenceSubmission):
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == submission.project_id.lower().strip('/')), None)
    proj_lat = project.get("latitude", 25.0961) if project else 25.0961
    proj_lon = project.get("longitude", 85.3131) if project else 85.3131

    vert_res = citizen_engine.verify_citizen_submission(
        citizen_lat=submission.latitude,
        citizen_lon=submission.longitude,
        project_lat=proj_lat,
        project_lon=proj_lon,
        is_live_camera_capture=submission.is_live_camera_capture
    )

    EVIDENCE_STORE.append({
        "evidence_id": f"cit-{len(EVIDENCE_STORE)+1}",
        "project_id": submission.project_id,
        "evidence_type": "CITIZEN_LIVE_CAMERA",
        "submitted_by_role": "CITIZEN",
        "phash_value": "9988776655443322",
        "latitude": submission.latitude,
        "longitude": submission.longitude,
        "is_live_camera_capture": submission.is_live_camera_capture,
        "timestamp_captured": str(submission.timestamp_captured),
        "verification_status": vert_res["signal_code"],
        "source": "Citizen Mobile PWA Live Upload",
        "source_type": "CITIZEN_PWA",
        "is_synthetic": False
    })

    return {"status": "ACCEPTED", "submission_verification": vert_res}


@router.get("/verification/confidence/{work_id:path}", summary="GET /verification/confidence/{project_id}")
def get_verification_confidence(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    photo_sim = check_photo_similarity_endpoint(clean_id)
    evidence_list = [e for e in EVIDENCE_STORE if e["project_id"].lower().strip('/') == clean_id.lower()]
    cit_record = evidence_list[0] if evidence_list else None
    
    cit_verification_data = None
    if cit_record:
        cit_verification_data = citizen_engine.verify_citizen_submission(
            citizen_lat=cit_record.get("latitude", 25.0961),
            citizen_lon=cit_record.get("longitude", 85.3131),
            project_lat=project.get("latitude", 25.0961) if project else 25.0961,
            project_lon=project.get("longitude", 85.3131) if project else 85.3131,
            is_live_camera_capture=cit_record.get("is_live_camera_capture", True)
        )

    conf_res = triangulation_engine.evaluate_verification_confidence(
        project_id=clean_id,
        has_agency_claim=True if project else False,
        citizen_verification=cit_verification_data,
        photo_similarity=photo_sim,
        satellite_data=None
    )
    return conf_res

# -----------------------------------------------------------------------------
# PHASE 4: PROCESS INTELLIGENCE & OPTIMIZER ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/bottleneck/summary", summary="Feature 6: GET /bottleneck/summary - System-wide bottleneck aggregate")
def get_bottleneck_summary():
    all_analyses = [
        sla_engine.analyze_project_bottleneck(p["work_id"], p.get("stage_history", []))
        for p in EVALUATED_CACHE[:200]
    ]
    summary = sla_engine.compute_system_bottleneck_summary(all_analyses)
    return summary


@router.get("/bottleneck/{work_id:path}", summary="Feature 6: GET /bottleneck/{project_id} - Project SLA delays")
def get_project_bottleneck_detail(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    if not match:
        match = {"work_id": clean_id, "stage_history": SyntheticProcessGenerator.generate_project_stage_history({"work_id": clean_id}, 0)}

    stage_hist = match.get("stage_history", [])
    bottleneck_res = sla_engine.analyze_project_bottleneck(clean_id, stage_hist)
    return bottleneck_res


@router.get("/optimizer/plan", summary="Feature 7: GET /optimizer/plan - Full inspection plan across all inspectors")
def get_full_inspection_plan():
    routes = []
    for insp in SYNTHETIC_INSPECTORS:
        route_plan = inspection_engine.generate_inspector_route(insp, EVALUATED_CACHE[:300])
        routes.append(route_plan)
        
    return {
        "total_inspectors": len(SYNTHETIC_INSPECTORS),
        "total_planned_inspections": sum(r["capacity_summary"]["assigned_inspections"] for r in routes),
        "inspector_routes": routes
    }


@router.get("/optimizer/plan/{inspector_id}", summary="Feature 7: GET /optimizer/plan/{inspector_id} - Single inspector route")
def get_single_inspector_route(inspector_id: str):
    insp = next((i for i in SYNTHETIC_INSPECTORS if i["inspector_id"].lower() == inspector_id.lower()), None)
    if not insp:
        raise HTTPException(status_code=404, detail=f"Inspector with ID '{inspector_id}' not found.")
        
    route_plan = inspection_engine.generate_inspector_route(insp, EVALUATED_CACHE[:300])
    return route_plan
