"""
Feature 9: Explain-the-Absence & Fairness Engine
Enforces the mandatory fairness rule:
1. Missing evidence != Contradictory evidence.
2. Never automatically increase Risk Score solely because citizen evidence or satellite data is unavailable.
3. Provides explicit region connectivity safeguards for remote/hilly/tribal areas.
"""

from typing import Dict, Any, List


class FairnessSafeguardEngine:
    # List of known low-connectivity / remote district keywords in India
    REMOTE_DISTRICT_KEYWORDS = [
        "LADAKH", "KARGIL", "ARUNACHAL", "SUKMA", "BIJAPUR", "DANTEWADA",
        "LAHAUL", "SPITI", "GADCHIROLI", "MALKANGIRI", "NICOBAR", "KISTWAR"
    ]

    def is_remote_or_low_connectivity(self, state: str, district: str) -> bool:
        """Determines if project location is in a recognized low-connectivity zone."""
        location_str = f"{state} {district}".upper()
        return any(keyword in location_str for keyword in self.REMOTE_DISTRICT_KEYWORDS)

    def apply_fairness_safeguard(
        self,
        raw_risk_score: float,
        verification_confidence: float,
        independent_evidence_status: str,
        state: str,
        district: str
    ) -> Dict[str, Any]:
        """
        Adjusts risk analysis interpretability to prevent penalizing remote regions.
        """
        is_remote = self.is_remote_or_low_connectivity(state, district)

        # Mandatory Rule: If independent evidence is simply unavailable (not conflicting),
        # ensure risk score is NOT artificially elevated.
        adjusted_risk_score = raw_risk_score
        fairness_note = None

        if independent_evidence_status == "INDEPENDENT_EVIDENCE_UNAVAILABLE":
            fairness_note = "Independent verification evidence is currently unavailable. Risk score is computed strictly from workflow and peer metrics without penalizing for missing citizen upload."
            if is_remote:
                fairness_note += " Location identified as remote/low-connectivity region; priority for physical mobile inspector."

        elif independent_evidence_status == "EVIDENCE_CONFLICT":
            fairness_note = "Potential evidence conflict detected (e.g. photo overlap or location discrepancy). Requires manual verification."

        return {
            "adjusted_risk_score": round(adjusted_risk_score, 2),
            "raw_risk_score": round(raw_risk_score, 2),
            "verification_confidence": round(verification_confidence, 2),
            "independent_evidence_status": independent_evidence_status,
            "is_low_connectivity_region": is_remote,
            "fairness_safeguard_applied": True,
            "fairness_note": fairness_note
        }
