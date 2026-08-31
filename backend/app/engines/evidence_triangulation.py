"""
Feature 5: Evidence Triangulation Engine (Phase 3 Step 3)
Synthesizes multi-source independent evidence signals into Verification Confidence Score (0–100).
STRICT SCORE SEPARATION: Verification Confidence is independent of Risk Score.

Signal States:
- ✅ SUPPORTS_CLAIM
- ⚠️ PARTIAL_CONCERN
- ❌ CONTRADICTS_CLAIM
- 🟡 INCONCLUSIVE
- — UNAVAILABLE

Fairness Principle: Missing / Unavailable evidence ('—') does NOT equal contradiction ('❌').
"""

from typing import Dict, Any, Optional, List


class EvidenceTriangulationEngine:
    def evaluate_verification_confidence(
        self,
        project_id: str,
        has_agency_claim: bool = True,
        citizen_verification: Optional[Dict[str, Any]] = None,
        photo_similarity: Optional[Dict[str, Any]] = None,
        satellite_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculates Verification Confidence (0–100) and resolves per-signal status.
        """

        # 1. Signal 1: Agency Claim (Baseline Reference from Dataset)
        if has_agency_claim:
            agency_status = "✅ SUPPORTS_CLAIM"
            agency_score = 40.0
            agency_text = "Official eSAKSHI sanction & completion report registered."
        else:
            agency_status = "🟡 INCONCLUSIVE"
            agency_score = 15.0
            agency_text = "Agency sanction documentation unverified."

        # 2. Signal 2: Citizen Location Evidence (Feature 4)
        if citizen_verification is None or citizen_verification.get("consistency_status") is None:
            citizen_status = "— UNAVAILABLE"
            citizen_score = 0.0 # Neutral missing signal
            citizen_text = "Independent citizen mobile verification currently unavailable."
        elif citizen_verification.get("verified"):
            citizen_status = "✅ SUPPORTS_CLAIM"
            citizen_score = 35.0
            citizen_text = f"Live camera evidence captured within {citizen_verification.get('distance_to_project_meters', 0):.1f}m of site."
        elif citizen_verification.get("consistency_status") == "LOCATION_INCONSISTENT":
            citizen_status = "❌ CONTRADICTS_CLAIM"
            citizen_score = 0.0
            citizen_text = f"Capture location is {citizen_verification.get('distance_to_project_meters', 0):.1f}m away from project site."
        else:
            citizen_status = "🟡 INCONCLUSIVE"
            citizen_score = 10.0
            citizen_text = "Citizen upload requires further spatial verification."

        # 3. Signal 3: Photo Similarity & Uniqueness Check (Feature 3)
        if photo_similarity is None or not photo_similarity.get("has_photo_evidence"):
            photo_status = "— UNAVAILABLE"
            photo_score = 0.0 # Neutral missing signal
            photo_text = "Completion image pHash hash unavailable."
        elif photo_similarity.get("duplicate_detected"):
            photo_status = "⚠️ PARTIAL_CONCERN"
            photo_score = 0.0
            photo_text = f"Possible duplicate evidence detected ({photo_similarity.get('max_similarity_pct', 0)}% overlap)."
        else:
            photo_status = "✅ SUPPORTS_CLAIM"
            photo_score = 15.0
            photo_text = "Photo evidence appears unique across indexed database."

        # 4. Signal 4: Supporting Satellite Signal (Tier 2 Sentinel-2 Hook)
        if satellite_data is None:
            satellite_status = "— UNAVAILABLE"
            satellite_score = 0.0 # Structural placeholder
            satellite_text = "Sentinel-2 satellite change detection signal unavailable."
        elif satellite_data.get("change_detected"):
            satellite_status = "✅ SUPPORTS_CLAIM"
            satellite_score = 10.0
            satellite_text = "Surface change detected in Sentinel-2 temporal imagery."
        else:
            satellite_status = "🟡 INCONCLUSIVE"
            satellite_score = 5.0
            satellite_text = "Satellite temporal change inconclusive at current spatial resolution."

        # Verification Confidence Calculation (0–100)
        total_confidence = round(agency_score + citizen_score + photo_score + satellite_score, 2)

        # Recommendation Text (Never "fraud")
        if total_confidence >= 75.0:
            recommendation = f"Verification Confidence: {total_confidence:.0f}/100 — High multi-signal verification established."
        elif total_confidence >= 40.0:
            recommendation = f"Verification Confidence: {total_confidence:.0f}/100 — Moderate verification; routine field inspection recommended."
        else:
            recommendation = f"Verification Confidence: {total_confidence:.0f}/100 — Independent evidence unavailable or inconclusive; physical inspection required."

        return {
            "project_id": project_id,
            "verification_confidence": total_confidence,
            "recommendation": recommendation,
            "signals": {
                "agency_claim": {
                    "status": agency_status,
                    "score_contrib": agency_score,
                    "detail": agency_text
                },
                "citizen_evidence": {
                    "status": citizen_status,
                    "score_contrib": citizen_score,
                    "detail": citizen_text
                },
                "photo_uniqueness": {
                    "status": photo_status,
                    "score_contrib": photo_score,
                    "detail": photo_text
                },
                "satellite_signal": {
                    "status": satellite_status,
                    "score_contrib": satellite_score,
                    "detail": satellite_text
                }
            }
        }
