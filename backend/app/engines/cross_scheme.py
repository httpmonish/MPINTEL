"""
Phase 3: Multi-Scheme Cross-Verification Engine
Modular cross-scheme matching layer comparing project claims across MPLADS, MGNREGA, PMGSY.

Invariants:
- Risk Score (0-100) remains completely unchanged and decoupled.
- Verification Confidence (0-100) remains independent.
- Cross-Scheme Similarity Score (0-100) measures multi-scheme correlation.
- Missing evidence receives 0.0 penalty (Fairness Safeguard).
- Strict neutral civic terminology.
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime
from engines.photo_duplication import PhotoDuplicationEngine


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geodesic distance in meters between two lat/lon pairs."""
    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def normalize_category_to_standard(category_str: str) -> str:
    """Standardizes category strings across schemes."""
    lower = category_str.lower()
    if any(k in lower for k in ["road", "bridge", "connectivity", "pavement", "culvert"]):
        return "Roads & Bridges"
    if any(k in lower for k in ["water", "harvesting", "reservoir", "pipe", "jal"]):
        return "Drinking Water"
    if any(k in lower for k in ["hall", "community", "shelter", "anganwadi", "bhawan"]):
        return "Community Halls"
    if any(k in lower for k in ["school", "education", "classroom", "library"]):
        return "School Infrastructure"
    if any(k in lower for k in ["sanitat", "toilet", "health", "drain", "solid waste"]):
        return "Sanitation & Public Health"
    if any(k in lower for k in ["solar", "light", "illumination", "power", "electric"]):
        return "Solar & Street Lighting"
    return category_str


def get_category_spatial_parameters(category: str) -> Dict[str, Any]:
    norm = normalize_category_to_standard(category)
    if norm == "Roads & Bridges":
        return {"expected_spatial_type": "CORRIDOR", "recommended_threshold_meters": 500.0, "max_search_radius": 1500.0}
    elif norm == "Drinking Water":
        return {"expected_spatial_type": "NETWORK", "recommended_threshold_meters": 250.0, "max_search_radius": 1000.0}
    elif norm in ["Community Halls", "School Infrastructure"]:
        return {"expected_spatial_type": "POLYGON", "recommended_threshold_meters": 100.0, "max_search_radius": 500.0}
    elif norm == "Solar & Street Lighting":
        return {"expected_spatial_type": "POINT", "recommended_threshold_meters": 120.0, "max_search_radius": 600.0}
    else:
        return {"expected_spatial_type": "POINT", "recommended_threshold_meters": 150.0, "max_search_radius": 800.0}


def normalize_entity_string(raw: Optional[str]) -> str:
    if not raw:
        return ""
    clean = raw.lower().strip()
    for char in ",.-_/()":
        clean = clean.replace(char, " ")
    words = clean.split()
    replacements = {
        "pvt": "pvt", "private": "pvt",
        "ltd": "ltd", "limited": "ltd",
        "corp": "corp", "corporation": "corp",
        "infra": "infra", "infrastructure": "infra",
        "pwd": "pwd", "public works department": "pwd",
        "dept": "dept", "department": "dept",
        "const": "construction", "construction": "construction",
        "engg": "engineering", "engineering": "engineering"
    }
    normalized_words = [replacements.get(w, w) for w in words]
    return " ".join(normalized_words)


def calculate_jaccard_text_similarity(text_a: str, text_b: str) -> float:
    if not text_a or not text_b:
        return 0.0
    tokens_a = set([w for w in text_a.lower().replace(",", " ").replace(".", " ").split() if len(w) > 2])
    tokens_b = set([w for w in text_b.lower().replace(",", " ").replace(".", " ").split() if len(w) > 2])
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = len(tokens_a.intersection(tokens_b))
    union = len(tokens_a.union(tokens_b))
    if union == 0:
        return 0.0
    return round((intersection / union) * 100.0, 2)


class CrossSchemeEngine:
    """
    Core engine for multi-scheme matching, candidate blocking, and explainable scoring.
    """

    @staticmethod
    def evaluate_pair(project_a: Dict[str, Any], project_b: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Geographic Proximity & Footprint Overlap
        dist = haversine_distance_meters(
            project_a["latitude"], project_a["longitude"],
            project_b["latitude"], project_b["longitude"]
        )

        params_a = get_category_spatial_parameters(project_a.get("category", ""))
        params_b = get_category_spatial_parameters(project_b.get("category", ""))
        threshold = max(params_a["recommended_threshold_meters"], params_b["recommended_threshold_meters"])

        if dist <= threshold:
            prox_score = round(100.0 - (dist / threshold) * 20.0, 2)
            prox_status = "MATCH"
        elif dist <= threshold * 3.0:
            excess = dist - threshold
            prox_score = round(max(0.0, 80.0 - (excess / (threshold * 2.0)) * 70.0), 2)
            prox_status = "PARTIAL"
        else:
            prox_score = max(0.0, round(10.0 * math.exp(-dist / (threshold * 4.0)), 2))
            prox_status = "DIFFERENT"

        geom_a = project_a.get("geometry")
        geom_b = project_b.get("geometry")
        footprint_overlap_pct = None
        footprint_status = "UNAVAILABLE"
        footprint_exp = "Physical footprint geometry unavailable; using point-based coordinate geodesic approximation."

        if geom_a and geom_b and geom_a.get("estimated_area_sq_meters") and geom_b.get("estimated_area_sq_meters"):
            r_a = geom_a.get("bounding_radius_meters", threshold)
            r_b = geom_b.get("bounding_radius_meters", threshold)
            if dist >= r_a + r_b:
                footprint_overlap_pct = 0.0
                footprint_status = "DIFFERENT"
                footprint_exp = f"Footprints do not intersect (Centroid distance {dist}m > combined radius {r_a + r_b}m)."
            else:
                overlap_factor = 1.0 - (dist / (r_a + r_b))
                footprint_overlap_pct = round(max(0.0, min(100.0, overlap_factor * 90.0)), 2)
                footprint_status = "MATCH" if footprint_overlap_pct > 50.0 else "PARTIAL"
                footprint_exp = f"Geospatial footprint overlap estimated at {footprint_overlap_pct}%."

        # 2. Text, Category & Entity Normalization
        title_sim = calculate_jaccard_text_similarity(project_a.get("title", ""), project_b.get("title", ""))
        desc_sim = calculate_jaccard_text_similarity(project_a.get("description", ""), project_b.get("description", ""))
        text_score = round(title_sim * 0.6 + desc_sim * 0.4, 2)
        text_status = "MATCH" if text_score > 70.0 else "PARTIAL" if text_score > 35.0 else "DIFFERENT"

        norm_cat_a = normalize_category_to_standard(project_a.get("category", ""))
        norm_cat_b = normalize_category_to_standard(project_b.get("category", ""))
        is_same_category = norm_cat_a == norm_cat_b
        cat_score = 100.0 if is_same_category else 25.0

        cont_a = normalize_entity_string(project_a.get("contractor"))
        cont_b = normalize_entity_string(project_b.get("contractor"))
        entity_score = 0.0
        entity_exp = "No shared contractor or agency detected."
        if cont_a and cont_b and cont_a == cont_b:
            entity_score = 95.0
            entity_exp = f"Common executing contractor: '{project_a.get('contractor')}' (normalized match)."
        elif cont_a and cont_b and calculate_jaccard_text_similarity(cont_a, cont_b) > 75.0:
            entity_score = 80.0
            entity_exp = f"Probable contractor entity variant: '{project_a.get('contractor')}' vs '{project_b.get('contractor')}'."

        # 3. pHash Photo Comparison
        photos_a = project_a.get("photos", [])
        photos_b = project_b.get("photos", [])
        img_score = 0.0
        img_status = "UNAVAILABLE"
        img_exp = "Photographic evidence unavailable in one or both scheme records (Zero negative penalty)."
        min_hamming = 64
        max_img_sim = 0.0

        if photos_a and photos_b:
            for pA in photos_a:
                hA = pA.get("phash") or pA.get("phash_value")
                if not hA:
                    continue
                for pB in photos_b:
                    hB = pB.get("phash") or pB.get("phash_value")
                    if not hB:
                        continue
                    h_dist = PhotoDuplicationEngine.hamming_distance(hA, hB)
                    sim = round(max(0.0, (1.0 - (h_dist / 64.0)) * 100.0), 2)
                    if h_dist < min_hamming:
                        min_hamming = h_dist
                        max_img_sim = sim

            if min_hamming <= 6:
                img_score = max_img_sim
                img_status = "MATCH"
                img_exp = f"High visual similarity detected across schemes: pHash Hamming distance {min_hamming} ({max_img_sim}%)."
            elif min_hamming <= 14:
                img_score = max_img_sim
                img_status = "PARTIAL"
                img_exp = f"Moderate visual similarity across schemes: pHash distance {min_hamming} ({max_img_sim}%)."
            else:
                img_score = max_img_sim
                img_status = "DIFFERENT"
                img_exp = f"Visual evidence indicates distinct assets (Hamming distance {min_hamming})."

        # 4. Temporal Relationship & Asset Lifecycle
        start_a = project_a.get("start_date", "2023-01-01")
        start_b = project_b.get("start_date", "2023-01-01")
        try:
            dt_a = datetime.strptime(start_a[:10], "%Y-%m-%d")
            dt_b = datetime.strptime(start_b[:10], "%Y-%m-%d")
            diff_days = abs((dt_b - dt_a).days)
        except Exception:
            diff_days = 90

        if diff_days <= 180:
            temporal_rel = "CONCURRENT_PROJECTS"
            temporal_score = 90.0
            temporal_exp = f"Concurrent statutory timelines: Sanction dates separated by {diff_days} days."
        elif diff_days <= 365:
            temporal_rel = "POSSIBLE_PHASED_WORK"
            temporal_score = 45.0
            temporal_exp = f"Sequential timelines ({diff_days} days delta): Indicative of phased public asset development."
        else:
            temporal_rel = "SEQUENTIAL_PROJECTS"
            temporal_score = 15.0
            temporal_exp = f"Distinct execution periods ({diff_days} days separation)."

        # Asset Lifecycle
        if dist <= 150.0:
            if title_sim > 15.0 or text_score > 15.0 or img_score > 75.0 or is_same_category:
                if temporal_rel == "CONCURRENT_PROJECTS" and is_same_category and (text_score > 30.0 or img_score > 75.0):
                    asset_lifecycle = "SAME_ASSET_POTENTIAL_DUPLICATE"
                else:
                    asset_lifecycle = "SAME_ASSET_DIFFERENT_WORK"
            else:
                asset_lifecycle = "INDEPENDENT_ADJACENT_ASSETS"
        elif cont_a and cont_b and cont_a == cont_b:
            asset_lifecycle = "SHARED_CONTRACTOR_DIFFERENT_PROJECTS"
        else:
            asset_lifecycle = "UNRELATED"

        # Multi-signal breakdown
        signals = {
            "geographic_proximity": {
                "signal_type": "GEOGRAPHIC_PROXIMITY",
                "score_pct": prox_score,
                "weight": 0.20,
                "weighted_points": round(prox_score * 0.20, 2),
                "status": prox_status,
                "explanation": f"Centroid distance: {dist}m (Category threshold: {threshold}m)."
            },
            "footprint_overlap": {
                "signal_type": "FOOTPRINT_OVERLAP",
                "score_pct": footprint_overlap_pct if footprint_overlap_pct is not None else (prox_score * 0.8 if prox_score > 75 else 0.0),
                "weight": 0.15,
                "weighted_points": round((footprint_overlap_pct if footprint_overlap_pct is not None else (prox_score * 0.8 if prox_score > 75 else 0.0)) * 0.15, 2),
                "status": footprint_status,
                "explanation": footprint_exp
            },
            "description_similarity": {
                "signal_type": "DESCRIPTION_SIMILARITY",
                "score_pct": text_score,
                "weight": 0.15,
                "weighted_points": round(text_score * 0.15, 2),
                "status": text_status,
                "explanation": f"Title & description textual overlap: {text_score}%."
            },
            "category_similarity": {
                "signal_type": "CATEGORY_SIMILARITY",
                "score_pct": cat_score,
                "weight": 0.10,
                "weighted_points": round(cat_score * 0.10, 2),
                "status": "MATCH" if is_same_category else "DIFFERENT",
                "explanation": f"Category: {norm_cat_a} vs {norm_cat_b}."
            },
            "image_similarity": {
                "signal_type": "IMAGE_SIMILARITY",
                "score_pct": img_score,
                "weight": 0.15,
                "weighted_points": round(img_score * 0.15, 2),
                "status": img_status,
                "explanation": img_exp
            },
            "temporal_overlap": {
                "signal_type": "TEMPORAL_OVERLAP",
                "score_pct": temporal_score,
                "weight": 0.10,
                "weighted_points": round(temporal_score * 0.10, 2),
                "status": "MATCH" if temporal_rel == "CONCURRENT_PROJECTS" else "PARTIAL",
                "explanation": temporal_exp
            },
            "entity_relationship": {
                "signal_type": "ENTITY_RELATIONSHIP",
                "score_pct": entity_score,
                "weight": 0.10,
                "weighted_points": round(entity_score * 0.10, 2),
                "status": "MATCH" if entity_score > 75.0 else "PARTIAL" if entity_score > 40.0 else "DIFFERENT",
                "explanation": entity_exp
            },
            "satellite_consistency": {
                "signal_type": "SATELLITE_CONSISTENCY",
                "score_pct": 0.0,
                "weight": 0.05,
                "weighted_points": 0.0,
                "status": "UNAVAILABLE",
                "explanation": "Satellite corroboration footprint not requested for this pair."
            }
        }

        # Calculate composite score normalized by available weights (Zero penalty rule)
        total_score = 0.0
        total_weight = 0.0
        for s in signals.values():
            if s["status"] != "UNAVAILABLE":
                total_score += s["score_pct"] * s["weight"]
                total_weight += s["weight"]

        composite_score = round(total_score / total_weight, 1) if total_weight > 0 else 0.0

        # Classification
        if composite_score >= 80.0:
            classification = "HIGH_SIMILARITY"
        elif composite_score >= 60.0:
            classification = "POTENTIAL_OVERLAP"
        elif composite_score >= 35.0:
            classification = "LOW_SIMILARITY"
        else:
            classification = "NO_SIGNIFICANT_MATCH"

        # Investigation Priority
        if composite_score >= 80.0:
            priority = "URGENT_REVIEW"
        elif composite_score >= 65.0 or (prox_score > 85.0 and img_score > 85.0):
            priority = "HIGH_PRIORITY"
        elif composite_score >= 45.0 or prox_score > 70.0:
            priority = "MEDIUM_PRIORITY"
        else:
            priority = "LOW_PRIORITY"

        why_flagged = f"Analytical match evaluated across independent signals. Composite similarity: {composite_score}/100. Verification recommended."

        match_id = f"MATCH-{project_a.get('scheme_id', 'MPLADS')}-{project_b.get('scheme_id', 'MGNREGA')}-{project_a.get('project_id', '')[-4:]}-{project_b.get('project_id', '')[-4:]}"

        return {
            "match_id": match_id,
            "project_a": project_a,
            "project_b": project_b,
            "similarity_score": composite_score,
            "classification": classification,
            "priority": priority,
            "temporal_relationship": temporal_rel,
            "asset_lifecycle": asset_lifecycle,
            "signals": signals,
            "signal_list": list(signals.values()),
            "why_flagged_summary": why_flagged,
            "distance_meters": dist,
            "geometry_overlap_pct": footprint_overlap_pct,
            "image_similarity_pct": max_img_sim if photos_a and photos_b else None,
            "text_similarity_pct": text_score,
            "status": "REQUIRES_VERIFICATION",
            "audit_trail": [
                {
                    "action": "MATCH_EVALUATION_COMPLETED",
                    "performed_by": "Pratyaksh Multi-Scheme Analytics Engine v3.0",
                    "timestamp": datetime.now().isoformat(),
                    "details": f"Calculated similarity: {composite_score}/100. Priority: {priority}"
                }
            ],
            "created_at": datetime.now().isoformat()
        }
