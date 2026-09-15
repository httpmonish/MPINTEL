import {
  NormalizedProject,
  TemporalRelationship,
  AssetLifecycleRelationship,
  MatchSignal,
} from "@/lib/types";

export interface TemporalAndLifecycleResult {
  temporalRelationship: TemporalRelationship;
  assetLifecycle: AssetLifecycleRelationship;
  temporalOverlapDays: number;
  temporalSignal: MatchSignal;
  satelliteSignal: MatchSignal;
  fieldEvidenceSignal: MatchSignal;
}

/**
 * Analyzes execution dates to distinguish phased sequential legitimate work from concurrent duplicate claims
 */
export function evaluateTemporalAndLifecycle(
  projectA: NormalizedProject,
  projectB: NormalizedProject,
  distanceMeters: number,
  isSameCategory: boolean,
  textScorePct: number
): TemporalAndLifecycleResult {
  const startA = new Date(projectA.startDate).getTime();
  const endA = projectA.completionDate
    ? new Date(projectA.completionDate).getTime()
    : startA + 365 * 24 * 3600 * 1000;

  const startB = new Date(projectB.startDate).getTime();
  const endB = projectB.completionDate
    ? new Date(projectB.completionDate).getTime()
    : startB + 365 * 24 * 3600 * 1000;

  // Overlap calculation in days
  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  const overlapMs = overlapEnd - overlapStart;
  const overlapDays = Math.max(0, Math.round(overlapMs / (1000 * 3600 * 24)));

  let temporalRelationship: TemporalRelationship = "UNKNOWN";
  let temporalScorePct = 0;
  let temporalExplanation = "";

  if (overlapDays > 30) {
    temporalRelationship = "CONCURRENT_PROJECTS";
    temporalScorePct = Math.min(100, Math.round(50 + (overlapDays / 180) * 50));
    temporalExplanation = `Concurrent execution timelines: ${overlapDays} days of temporal overlap between ${projectA.schemeId} and ${projectB.schemeId}.`;
  } else if (Math.abs(startB - endA) < 180 * 24 * 3600 * 1000 || Math.abs(startA - endB) < 180 * 24 * 3600 * 1000) {
    temporalRelationship = "POSSIBLE_PHASED_WORK";
    temporalScorePct = 40; // Moderate signal - indicative of phased development
    temporalExplanation = `Sequential execution timelines: Works commenced shortly after prior phase completion. Indicative of phased asset creation.`;
  } else {
    temporalRelationship = "SEQUENTIAL_PROJECTS";
    temporalScorePct = 15;
    temporalExplanation = `Distinct non-overlapping execution periods (Separation > 6 months).`;
  }

  // Determine Physical Asset Lifecycle Relationship
  let assetLifecycle: AssetLifecycleRelationship = "UNRELATED";
  if (distanceMeters <= 150) {
    if (isSameCategory) {
      if (temporalRelationship === "CONCURRENT_PROJECTS") {
        assetLifecycle = "SAME_ASSET_POTENTIAL_DUPLICATE";
      } else {
        assetLifecycle = "SAME_ASSET_DIFFERENT_WORK"; // Phased improvement on same asset
      }
    } else if (textScorePct >= 12) {
      assetLifecycle = "SAME_ASSET_DIFFERENT_WORK";
    } else {
      assetLifecycle = "INDEPENDENT_ADJACENT_ASSETS"; // E.g. Road + Drain or School + Solar
    }
  } else if (projectA.contractor && projectB.contractor && projectA.contractor === projectB.contractor) {
    assetLifecycle = "SHARED_CONTRACTOR_DIFFERENT_PROJECTS";
  }

  const temporalSignal: MatchSignal = {
    signalType: "TEMPORAL_OVERLAP",
    scorePct: temporalScorePct,
    weight: 0.10,
    weightedPoints: (temporalScorePct * 0.10),
    status: overlapDays > 30 ? "MATCH" : overlapDays > 0 ? "PARTIAL" : "DIFFERENT",
    explanation: temporalExplanation,
  };

  // Satellite Corroboration Cross-Check (Phase 1 Reuse)
  let satScore = 0;
  let satStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" = "UNAVAILABLE";
  let satExplanation = "Satellite change detection footprint unavailable for cross-scheme AOI comparison.";

  if (projectA.satelliteEvidence && distanceMeters <= 300) {
    const satA = projectA.satelliteEvidence;
    if (satA.evidenceStatus === "CHANGE_DETECTED" || satA.evidenceStatus === "VERIFIED_CONSISTENT") {
      satScore = Math.round(satA.changeScore * 100);
      satStatus = "MATCH";
      satExplanation = `Satellite sensor (${satA.provider}) detected physical surface change (${satA.detectedChangeType}) within 300m cross-scheme corridor.`;
    } else if (satA.evidenceStatus === "PARTIAL_CHANGE") {
      satScore = 55;
      satStatus = "PARTIAL";
      satExplanation = `Partial satellite change detected in spatial proximity.`;
    }
  }

  const satelliteSignal: MatchSignal = {
    signalType: "SATELLITE_CONSISTENCY",
    scorePct: satScore,
    weight: 0.10,
    weightedPoints: (satScore * 0.10),
    status: satStatus,
    explanation: satExplanation,
  };

  // Field Evidence Cross-Check (Phase 2 Reuse)
  let fieldScore = 0;
  let fieldStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" = "UNAVAILABLE";
  let fieldExplanation = "Phase 2 statutory field inspection evidence unavailable for cross-scheme comparison.";

  const hasInspA = projectA.fieldInspections && projectA.fieldInspections.length > 0;
  if (hasInspA && distanceMeters <= 200) {
    fieldScore = 80;
    fieldStatus = "MATCH";
    fieldExplanation = `GPS observation from statutory field inspection correlates within ${distanceMeters}m of cross-scheme claimed asset.`;
  }

  const fieldEvidenceSignal: MatchSignal = {
    signalType: "FIELD_EVIDENCE_CONSISTENCY",
    scorePct: fieldScore,
    weight: 0.05,
    weightedPoints: (fieldScore * 0.05),
    status: fieldStatus,
    explanation: fieldExplanation,
  };

  return {
    temporalRelationship,
    assetLifecycle,
    temporalOverlapDays: overlapDays,
    temporalSignal,
    satelliteSignal,
    fieldEvidenceSignal,
  };
}
