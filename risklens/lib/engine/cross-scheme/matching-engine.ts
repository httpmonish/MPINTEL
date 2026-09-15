import {
  NormalizedProject,
  CrossSchemeMatch,
  MatchSignalBreakdown,
  CrossSchemeClassification,
  InvestigationPriority,
} from "@/lib/types";
import { evaluateSpatialProximity } from "./spatial-matcher";
import { evaluateTextAndEntities } from "./text-matcher";
import { evaluateCrossSchemeImages } from "./image-matcher";
import { evaluateTemporalAndLifecycle } from "./temporal-lifecycle";
import { generateCandidatePairs } from "./candidate-generator";

export class CrossSchemeMatchEngine {
  /**
   * Evaluates a pair of normalized projects across all independent evidence dimensions
   */
  static evaluatePair(
    projectA: NormalizedProject,
    projectB: NormalizedProject
  ): CrossSchemeMatch {
    // 1. Spatial & Footprint
    const spatial = evaluateSpatialProximity(projectA, projectB);

    // 2. Text & Category & Entity
    const textAndEntities = evaluateTextAndEntities(projectA, projectB);

    // 3. Visual & Perceptual Hash (pHash)
    const images = evaluateCrossSchemeImages(projectA, projectB);

    // 4. Temporal & Asset Lifecycle & Satellite / Field cross-checks
    const isSameCategory = textAndEntities.categorySignal.status === "MATCH";
    const temporal = evaluateTemporalAndLifecycle(
      projectA,
      projectB,
      spatial.distanceMeters,
      isSameCategory,
      textAndEntities.textScorePct
    );

    const signals: MatchSignalBreakdown = {
      geographicProximity: spatial.proximitySignal,
      footprintOverlap: spatial.footprintSignal,
      descriptionSimilarity: textAndEntities.descriptionSignal,
      categorySimilarity: textAndEntities.categorySignal,
      imageSimilarity: images.imageSignal,
      satelliteConsistency: temporal.satelliteSignal,
      fieldEvidenceConsistency: temporal.fieldEvidenceSignal,
      temporalOverlap: temporal.temporalSignal,
      entityRelationship: textAndEntities.entitySignal,
    };

    const signalList = Object.values(signals);

    // Weighted composite score (0 - 100)
    let totalScore = 0;
    let totalWeight = 0;
    for (const sig of signalList) {
      if (sig.status !== "UNAVAILABLE") {
        totalScore += sig.scorePct * sig.weight;
        totalWeight += sig.weight;
      }
    }

    // Normalized to available signal weights (Zero penalty rule)
    const compositeScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

    // Classification
    let classification: CrossSchemeClassification = "NO_SIGNIFICANT_MATCH";
    if (compositeScore >= 80) {
      classification = "HIGH_SIMILARITY";
    } else if (compositeScore >= 60) {
      classification = "POTENTIAL_OVERLAP";
    } else if (compositeScore >= 35) {
      classification = "LOW_SIMILARITY";
    }

    // Investigation Priority
    let priority: InvestigationPriority = "LOW_PRIORITY";
    if (compositeScore >= 80) {
      priority = "URGENT_REVIEW";
    } else if (compositeScore >= 65 || (spatial.spatialScorePct > 85 && images.maxSimilarityPct > 85)) {
      priority = "HIGH_PRIORITY";
    } else if (compositeScore >= 45 || spatial.spatialScorePct > 70) {
      priority = "MEDIUM_PRIORITY";
    }

    // Why Flagged Summary
    const reasons: string[] = [];
    if (spatial.distanceMeters <= 150) reasons.push(`Geographic proximity within ${spatial.distanceMeters}m`);
    if (images.maxSimilarityPct > 85) reasons.push(`High photographic pHash similarity (${images.maxSimilarityPct}%)`);
    if (textAndEntities.textScorePct > 70) reasons.push(`Asset description textual overlap (${textAndEntities.textScorePct}%)`);
    if (temporal.temporalRelationship === "CONCURRENT_PROJECTS") reasons.push("Overlapping statutory execution period");
    if (textAndEntities.isSameEntity) reasons.push("Common vendor or executing entity");

    const whyFlaggedSummary =
      reasons.length > 0
        ? `Analytical match flagged due to: ${reasons.join(", ")}. Physical or administrative verification recommended.`
        : "Records demonstrate spatial or categorical separation within normative public works dispersion.";

    const matchId = `MATCH-${projectA.schemeId}-${projectB.schemeId}-${projectA.projectId.slice(-4)}-${projectB.projectId.slice(-4)}`;

    return {
      matchId,
      projectA,
      projectB,
      similarityScore: compositeScore,
      classification,
      priority,
      temporalRelationship: temporal.temporalRelationship,
      assetLifecycle: temporal.assetLifecycle,
      signals,
      signalList,
      whyFlaggedSummary,
      distanceMeters: spatial.distanceMeters,
      geometryOverlapPct: spatial.footprintOverlapPct,
      imageSimilarityPct: images.maxSimilarityPct,
      textSimilarityPct: textAndEntities.textScorePct,
      status: "REQUIRES_VERIFICATION",
      auditTrail: [
        {
          action: "MATCH_EVALUATION_COMPLETED",
          performedBy: "Pratyaksh Multi-Scheme Analytics Engine v3.0",
          timestamp: new Date().toISOString(),
          details: `Calculated similarity: ${compositeScore}/100. Priority: ${priority}. Classification: ${classification}`,
        },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Scans a target project against a candidate pool
   */
  static findMatchesForProject(
    targetProject: NormalizedProject,
    candidatePool: NormalizedProject[],
    minSimilarityThreshold: number = 30
  ): CrossSchemeMatch[] {
    const candidateResult = generateCandidatePairs(targetProject, candidatePool);
    const matches: CrossSchemeMatch[] = [];

    for (const pair of candidateResult.candidatePairs) {
      const match = this.evaluatePair(pair.projectA, pair.projectB);
      if (match.similarityScore >= minSimilarityThreshold) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}
