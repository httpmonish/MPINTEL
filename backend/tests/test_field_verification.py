import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engines.field_verification import FieldVerificationEngine
from engines.evidence_triangulation import EvidenceTriangulationEngine
from engines.photo_duplication import PhotoDuplicationEngine

def run_field_verification_unit_tests():
    print("=== STARTING PHASE 2: FIELD VERIFICATION UNIT & INTEGRATION TESTS ===")
    engine = FieldVerificationEngine()

    # 1. Inspection Assignment & Creation
    insp = engine.create_inspection(
        project_id="PRJ-TEST-101",
        inspector_id="INSP-OFFICER-101",
        inspector_name="Amitabh Saxena",
        inspector_role="Authorized Executive Engineer (PWD)",
        inspector_badge="MH-PWD-101",
        scheduled_date="2024-06-15",
        stage="BEFORE",
        allowed_radius_meters=100.0,
        project_lat=19.0760,
        project_lon=72.8777,
        project_title="Rural Drinking Water Scheme"
    )
    assert insp["status"] == "ASSIGNED"
    assert insp["allowed_radius_meters"] == 100.0
    print("[Pass] Test 1: Field Inspection Assignment & Creation")

    # 2. Assignment Authorization & Start
    # Unauthorized inspector cannot start
    try:
        engine.start_inspection(insp["inspection_id"], "UNAUTHORIZED-USER-999")
        assert False, "Unauthorized start should fail"
    except PermissionError:
        pass

    started = engine.start_inspection(insp["inspection_id"], "INSP-OFFICER-101")
    assert started["status"] == "IN_PROGRESS"
    print("[Pass] Test 2: Inspector Role & Assignment Authorization")

    # 3. GPS Geodesic Validation - Inside Radius
    loc_inside = engine.validate_location(
        inspection_id=insp["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        latitude=19.0763,
        longitude=72.8780,
        accuracy_meters=4.5
    )
    assert loc_inside["is_location_verified"] is True
    assert loc_inside["location_status"] == "WITHIN_RADIUS"
    assert loc_inside["distance_to_project_meters"] < 100.0
    print(f"[Pass] Test 3: GPS Inside Radius ({loc_inside['distance_to_project_meters']}m <= 100m)")

    # 4. GPS Geodesic Validation - Outside Radius -> Evidence Conflict
    loc_outside = engine.validate_location(
        inspection_id=insp["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        latitude=19.0835,
        longitude=72.8828,
        accuracy_meters=4.0
    )
    assert loc_outside["is_location_verified"] is False
    assert loc_outside["location_status"] == "OUTSIDE_RADIUS"
    assert loc_outside["distance_to_project_meters"] > 400.0
    print(f"[Pass] Test 4: GPS Outside Radius ({loc_outside['distance_to_project_meters']}m > 100m -> EVIDENCE_CONFLICT)")

    # 5. Configurable Radius Check (50m vs 250m)
    insp_250m = engine.create_inspection(
        project_id="PRJ-LARGE-250",
        inspector_id="INSP-OFFICER-101",
        inspector_name="Amitabh Saxena",
        allowed_radius_meters=250.0,
        project_lat=19.0760,
        project_lon=72.8777
    )
    loc_check_250 = engine.validate_location(
        inspection_id=insp_250m["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        latitude=19.0775,
        longitude=72.8777
    )
    assert loc_check_250["is_location_verified"] is True
    assert loc_check_250["location_status"] == "WITHIN_RADIUS"
    print(f"[Pass] Test 5: Configurable Radius Support (250m buffer)")

    # 6. Invalid Coordinates Handling
    loc_invalid = engine.validate_location(
        inspection_id=insp["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        latitude=95.0,
        longitude=72.8777
    )
    assert loc_invalid["is_location_verified"] is False
    assert loc_invalid["location_status"] == "INVALID_COORDINATES"
    print("[Pass] Test 6: Invalid Coordinates Handling")

    # 7. Live Camera Photo Capture & Cryptographic Signature Validation
    valid_photo = engine.upload_photo_evidence(
        inspection_id=insp["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        stage="BEFORE",
        caption="Baseline site photograph prior to earth excavation.",
        latitude=19.0763,
        longitude=72.8780,
        is_live_camera_stream=True,
        gps_accuracy_meters=4.5,
        phash_value="b2c3d4e5f6071829",
        signature_digest="TPM2-HW-SEC-101-VALID-DIGEST",
        device_identifier=insp["assigned_inspector"]["authorized_device_fingerprint"]
    )
    assert valid_photo["signature_state"] == "SIGNED_AND_VALID"
    assert valid_photo["device_tpm_authorized"] is True
    assert valid_photo["quality_tier"] == "GOOD"
    assert valid_photo["duplicate_status"] == "NEW_EVIDENCE"
    print("[Pass] Test 7: Live Camera & Cryptographic TPM Signature Verification")

    # 8. pHash Duplicate Detection
    dup_photo = engine.upload_photo_evidence(
        inspection_id=insp["inspection_id"],
        inspector_id="INSP-OFFICER-101",
        stage="BEFORE",
        caption="Substituted duplicate image.",
        latitude=19.0763,
        longitude=72.8780,
        is_live_camera_stream=True,
        phash_value="a1b2c3d4e5f60718", # Matches PRJ-2023-088 benchmark hash exactly
        signature_digest="TPM2-HW-SEC-101",
        device_identifier=insp["assigned_inspector"]["authorized_device_fingerprint"]
    )
    assert dup_photo["duplicate_status"] in ("DUPLICATE_EVIDENCE", "POSSIBLE_DUPLICATE")
    assert dup_photo["similarity_score_pct"] >= 90.0
    print(f"[Pass] Test 8: pHash Visual Fingerprint Duplicate Detection ({dup_photo['similarity_score_pct']}% match)")

    # 9. Inspection Submission & Multi-Signal Verification Confidence
    submitted = engine.submit_inspection(insp["inspection_id"], "INSP-OFFICER-101")
    assert "verification_confidence" in submitted
    assert "confidence_breakdown" in submitted
    assert submitted["confidence_breakdown"]["compositeConfidence"] > 0
    print(f"[Pass] Test 9: Inspection Submission & Verification Confidence ({submitted['verification_confidence']}/100)")

    # 10. Human Review Decision Recording
    reviewed = engine.record_human_review(
        inspection_id=insp["inspection_id"],
        reviewer_id="REV-CHIEF-01",
        reviewer_name="Smt. Ananya Deshpande",
        reviewer_role="District Planning Officer & Authorized Investigator",
        decision="PARTIALLY_VERIFIED",
        remarks="Approved baseline with note on minor perimeter offset."
    )
    assert reviewed["review_decision"]["decision"] == "PARTIALLY_VERIFIED"
    assert len(reviewed["audit_trail"]) >= 4
    print("[Pass] Test 10: Human Review Decision Logging")

    # 11. Immutable Re-inspection Workflow
    re_insp = engine.request_reinspection(
        parent_inspection_id=insp["inspection_id"],
        requested_by_id="REV-CHIEF-01",
        requested_by_name="Smt. Ananya Deshpande",
        reason="Follow-up milestone check required for structural foundation."
    )
    assert re_insp["reinspection_of_id"] == insp["inspection_id"]
    assert insp["child_reinspection_id"] == re_insp["inspection_id"]
    print("[Pass] Test 11: Re-inspection Linked Branching & Historical Immutability")

    # 12. Satellite + Field Evidence Triangulation Engine
    triangulation = EvidenceTriangulationEngine().evaluate_verification_confidence(
        project_id="HERO-MPLADS-001",
        has_agency_claim=True,
        citizen_verification={"is_valid": True, "distance_meters": 46.8},
        photo_similarity={"is_duplicate": False},
        satellite_data={"status": "SUPPORTS"}
    )
    assert triangulation["verification_confidence"] >= 80.0
    assert "DID NOT penalize" in triangulation["fairness_safeguard_note"]
    print(f"[Pass] Test 12: Satellite + Field Evidence Triangulation ({triangulation['verification_confidence']}/100)")

    # 13. Neutral Civic Vocabulary Audit
    all_content = str(insp) + str(submitted) + str(reviewed) + str(triangulation)
    forbidden = ["fraud", "corrupt", "bribery", "criminal", "guilty"]
    for word in forbidden:
        assert word not in all_content.lower(), f"Forbidden word '{word}' found in output!"
    print("[Pass] Test 13: Strict Neutral Civic Vocabulary Guarantee")

    print("\n=== ALL 13 PHASE 2 FIELD VERIFICATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_field_verification_unit_tests()
