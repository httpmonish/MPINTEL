import logging
from typing import Dict, Any, Optional
from .change_detection import analyze_satellite_evidence
from .cache import satellite_cache

logger = logging.getLogger("pratyaksh.satellite")

class SatelliteVerificationService:
    """High-level orchestration service for Satellite Evidence Verification."""

    @staticmethod
    def get_or_analyze_evidence(
        project_id: str,
        latitude: float,
        longitude: float,
        work_category: str = "Roads & Bridges",
        radius_meters: float = 100.0,
        preferred_provider: str = "Bhuvan",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        if not force_refresh:
            cached = satellite_cache.get(project_id, radius_meters, preferred_provider)
            if cached:
                logger.info(f"Satellite cache HIT for {project_id}")
                return cached

        logger.info(f"Satellite cache MISS. Analyzing project {project_id} ({latitude}, {longitude})")
        result = analyze_satellite_evidence(
            project_id=project_id,
            latitude=latitude,
            longitude=longitude,
            work_category=work_category,
            radius_meters=radius_meters,
            preferred_provider=preferred_provider
        )
        satellite_cache.set(project_id, result, radius_meters, preferred_provider)
        return result

    @staticmethod
    def get_status_summary(evidence: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "project_id": evidence.get("project_id"),
            "status": evidence.get("evidence_status", "UNAVAILABLE"),
            "provider": evidence.get("provider", "Unknown"),
            "evidence_available": evidence.get("evidence_status") not in ("UNAVAILABLE", "FAILED"),
            "evidence_confidence": evidence.get("evidence_confidence", 0.0),
            "spatial_overlap_pct": round(evidence.get("spatial_overlap_score", 0.0) * 100.0, 1),
            "fairness_safeguard_note": "Evaluated independently. Zero penalty applied to Risk Score."
        }
