from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
import numpy as np

from engines.risk_engine import AIRiskEngine, RISK_ENGINE_VERSION, RULES_VERSION
from engines.peer_comparison import PeerComparisonEngine
from engines.photo_duplication import PhotoDuplicationEngine
from engines.citizen_verification import CitizenVerificationEngine
from engines.evidence_triangulation import EvidenceTriangulationEngine, TRIANGULATION_ENGINE_VERSION
from engines.fairness_engine import FairnessSafeguardEngine
from engines.sla_analyzer import SLABottleneckAnalyzer, SLA_ANALYZER_VERSION
from engines.inspection_optimizer import InspectionOptimizerEngine, OPTIMIZER_ENGINE_VERSION
from engines.ledger_engine import AuditLedgerEngine, LEDGER_ENGINE_VERSION

from adapters.synthetic_evidence import SyntheticEvidenceGenerator
from adapters.synthetic_process_data import SyntheticProcessGenerator, SYNTHETIC_INSPECTORS
from schemas.pydantic_schemas import CitizenEvidenceSubmission
from routers.projects import WORK_RECORDS

router = APIRouter(prefix="", tags=["Pratyaksh Ledger & Fairness Intelligence"])

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

# Pre-evaluate top 2,000 records & seed initial audit ledger entries
EVALUATED_CACHE = []
sample_features = []

for idx, p in enumerate(WORK_RECORDS[:2000]):
    peer_analysis = peer_engine.get_peer_stats(p, PEER_BENCHMARKS)
    risk_res = risk_engine.evaluate_project_risk(p, peer_analysis)
    
    stage_hist = SyntheticProcessGenerator.generate_project_stage_history(p, idx)
    risk_res["stage_history"] = stage_hist
    risk_res["latitude"] = p.get("latitude", 25.0961)
    risk_res["longitude"] = p.get("longitude", 85.3131)
    
    # Auto-log Phase 2 Risk Assessment Ledger Entry
    ledger_entry = ledger_engine.record_entry(
        project_id=risk_res["work_id"],
        decision_type="RISK_ASSESSMENT",
        computed_score=risk_res["risk_score"],
        component_breakdown=risk_res["component_breakdown"],
        data_sources_used=[
            {"source_name": "eSAKSHI Official Public Export", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False},
            {"source_name": "District Nodal Master Registry", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False}
        ],
        model_version=RISK_ENGINE_VERSION,
        rules_version=RULES_VERSION,
        missing_evidence_fields=risk_res.get("missing_evidence_fields", [])
    )
    risk_res["ledger_entry_id"] = ledger_entry["entry_id"]
    
    EVALUATED_CACHE.append(risk_res)
    
    bd = risk_res["component_breakdown"]
    sample_features.append([bd["cost_anomaly"], bd["delay_anomaly"], bd["payment_pattern"], bd["spatial_signal"], bd["evidence_issue"]])

if sample_features:
    risk_engine.fit_isolation_forest(np.array(sample_features))


# Helper to ensure ledger entry exists for any query
def ensure_project_ledger_entries(clean_id: str, project_match: Dict[str, Any]):
    existing = ledger_engine.get_entries_by_project(clean_id)
    if not existing and project_match:
        # Seed Risk Ledger
        ledger_engine.record_entry(
            project_id=clean_id,
            decision_type="RISK_ASSESSMENT",
            computed_score=project_match.get("risk_score", 40.0),
            component_breakdown=project_match.get("component_breakdown", {}),
            data_sources_used=[{"source_name": "eSAKSHI Official Public Export", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False}],
            model_version=RISK_ENGINE_VERSION,
            rules_version=RULES_VERSION,
            missing_evidence_fields=project_match.get("missing_evidence_fields", [])
        )
        # Seed Bottleneck Ledger
        btl_res = sla_engine.analyze_project_bottleneck(clean_id, project_match.get("stage_history", []))
        ledger_engine.record_entry(
            project_id=clean_id,
            decision_type="BOTTLENECK_ANALYSIS",
            computed_score=btl_res.get("max_deviation_multiple", 1.0) * 20.0,
            component_breakdown={"max_deviation_multiple": btl_res.get("max_deviation_multiple", 1.0)},
            data_sources_used=[{"source_name": "District Event Log History", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}],
            model_version=SLA_ANALYZER_VERSION,
            rules_version=RULES_VERSION
        )

# -----------------------------------------------------------------------------
# FEATURE 8: LEDGER REST API ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/ledger/{work_id:path}", summary="Feature 8: GET /ledger/{project_id} - Chronological ledger entries for a project")
def get_project_ledger_history(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    if match:
        ensure_project_ledger_entries(clean_id, match)

    entries = ledger_engine.get_entries_by_project(clean_id)
    return {
        "project_id": clean_id,
        "total_ledger_entries": len(entries),
        "ledger_history": entries
    }


@router.get("/ledger/entry/{entry_id}", summary="Feature 8: GET /ledger/entry/{entry_id} - Full detail for a single ledger entry")
def get_single_ledger_entry(entry_id: str):
    entry = ledger_engine.get_entry_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Ledger entry '{entry_id}' not found.")
    return entry


@router.post("/ledger/entry/{entry_id}/decision", summary="Feature 8: POST /ledger/entry/{entry_id}/decision - Officer action feedback")
def record_officer_human_decision(
    entry_id: str,
    human_decision: str = Body(..., embed=True),
    outcome_notes: Optional[str] = Body(None, embed=True)
):
    updated = ledger_engine.update_human_decision(entry_id, human_decision, outcome_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ledger entry '{entry_id}' not found.")
    return {"status": "SUCCESS", "updated_entry": updated}

# -----------------------------------------------------------------------------
# FEATURE 9: FAIRNESS TEST SUMMARY REST API ENDPOINT
# -----------------------------------------------------------------------------

@router.get("/fairness/test-summary", summary="Feature 9: GET /fairness/test-summary - Remote cohort fairness validation test")
def get_fairness_test_summary():
    from tests.fairness_test import run_fairness_validation
    res = run_fairness_validation()
    return res

# -----------------------------------------------------------------------------
# PHASE 2 & 3 ENDPOINTS (WITH LEDGER ENTRY ID AUTO-POPULATION)
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

    ensure_project_ledger_entries(clean_id, match)

    orig_proj = next((w for w in WORK_RECORDS if w["work_id"] == match["work_id"]), {})
    peer_analysis = peer_engine.get_peer_stats(orig_proj, PEER_BENCHMARKS)
    ledger_entries = ledger_engine.get_entries_by_project(clean_id)

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
        "peer_group_summary": peer_analysis,
        "latest_ledger_entry_id": ledger_entries[0]["entry_id"] if ledger_entries else None
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


@router.get("/verification/confidence/{work_id:path}", summary="GET /verification/confidence/{project_id}")
def get_verification_confidence(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    target_ev = next((e for e in EVIDENCE_STORE if e["project_id"].lower().strip('/') == clean_id.lower()), None)
    target_phash = target_ev.get("phash_value") if target_ev else None
    
    photo_sim = photo_engine.check_photo_similarity(
        target_project_id=clean_id,
        target_phash=target_phash,
        evidence_index=EVIDENCE_STORE
    )

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

    # Auto-log Phase 3 Verification Ledger Entry
    ledger_entry = ledger_engine.record_entry(
        project_id=clean_id,
        decision_type="VERIFICATION_TRIANGULATION",
        computed_score=conf_res["verification_confidence"],
        component_breakdown=conf_res["signal_weights"],
        data_sources_used=[
            {"source_name": "Citizen Mobile PWA Live Upload", "source_type": "CITIZEN_PWA", "is_synthetic": False},
            {"source_name": "eSAKSHI Photo Registry", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}
        ],
        model_version=TRIANGULATION_ENGINE_VERSION,
        rules_version=RULES_VERSION,
        missing_evidence_fields=conf_res.get("missing_evidence_fields", [])
    )
    conf_res["ledger_entry_id"] = ledger_entry["entry_id"]

    return conf_res


@router.get("/bottleneck/{work_id:path}", summary="Feature 6: GET /bottleneck/{project_id} - Project SLA delays")
def get_project_bottleneck_detail(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    if not match:
        match = {"work_id": clean_id, "stage_history": SyntheticProcessGenerator.generate_project_stage_history({"work_id": clean_id}, 0)}

    stage_hist = match.get("stage_history", [])
    bottleneck_res = sla_engine.analyze_project_bottleneck(clean_id, stage_hist)

    # Auto-log Phase 4 Bottleneck Ledger Entry
    ledger_entry = ledger_engine.record_entry(
        project_id=clean_id,
        decision_type="BOTTLENECK_ANALYSIS",
        computed_score=bottleneck_res.get("max_deviation_multiple", 1.0) * 20.0,
        component_breakdown={"max_deviation_multiple": bottleneck_res.get("max_deviation_multiple", 1.0)},
        data_sources_used=[{"source_name": "District Event Log History", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}],
        model_version=SLA_ANALYZER_VERSION,
        rules_version=RULES_VERSION
    )
    bottleneck_res["ledger_entry_id"] = ledger_entry["entry_id"]

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
