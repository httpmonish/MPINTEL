import { NormalizedProject, MatchSignal } from "@/lib/types";
import { calculateHaversineMeters } from "../gis-similarity";
import { getCategorySpatialParameters } from "../schemes/scheme-registry";

export interface SpatialMatchResult {
  distanceMeters: number;
  spatialScorePct: number;
  spatialStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT";
  footprintOverlapPct?: number;
  isGeometryAvailable: boolean;
  explanation: string;
  proximitySignal: MatchSignal;
  footprintSignal: MatchSignal;
}

/**
 * Calculates geographic proximity and footprint overlap with category-aware thresholds
 */
export function evaluateSpatialProximity(
  projectA: NormalizedProject,
  projectB: NormalizedProject
): SpatialMatchResult {
  const dist = calculateHaversineMeters(
    projectA.latitude,
    projectA.longitude,
    projectB.latitude,
    projectB.longitude
  );

  const paramsA = getCategorySpatialParameters(projectA.category);
  const paramsB = getCategorySpatialParameters(projectB.category);
  const thresholdMeters = Math.max(paramsA.recommendedThresholdMeters, paramsB.recommendedThresholdMeters);

  // Proximity score: 100% at 0m, scaling down to 0% at 3x threshold
  let proximityScore = 0;
  if (dist <= thresholdMeters) {
    proximityScore = Math.round(100 - (dist / thresholdMeters) * 20); // 80% - 100% within threshold
  } else if (dist <= thresholdMeters * 3) {
    const excess = dist - thresholdMeters;
    const maxExcess = thresholdMeters * 2;
    proximityScore = Math.round(Math.max(0, 80 - (excess / maxExcess) * 70));
  } else {
    proximityScore = Math.max(0, Math.round(10 * Math.exp(-dist / (thresholdMeters * 4))));
  }

  const proximityStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" =
    dist <= thresholdMeters ? "MATCH" : dist <= thresholdMeters * 2.5 ? "PARTIAL" : "DIFFERENT";

  // Footprint / Geometry Overlap Evaluation
  let footprintOverlapPct: number | undefined;
  let hasGeometry = false;
  let footprintStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" = "UNAVAILABLE";
  let footprintExplanation = "Physical footprint geometry unavailable; using point-based coordinate geodesic approximation.";

  const geomA = projectA.geometry;
  const geomB = projectB.geometry;

  if (geomA && geomB && geomA.estimatedAreaSqMeters && geomB.estimatedAreaSqMeters) {
    hasGeometry = true;
    const rA = geomA.boundingRadiusMeters || thresholdMeters;
    const rB = geomB.boundingRadiusMeters || thresholdMeters;
    
    // Circle intersection area model as analytical proxy for polygon overlap
    if (dist >= rA + rB) {
      footprintOverlapPct = 0;
      footprintStatus = "DIFFERENT";
      footprintExplanation = `Footprints do not intersect (Centroid distance ${dist}m > combined radius ${rA + rB}m).`;
    } else if (dist <= Math.abs(rA - rB)) {
      const minArea = Math.min(geomA.estimatedAreaSqMeters, geomB.estimatedAreaSqMeters);
      const maxArea = Math.max(geomA.estimatedAreaSqMeters, geomB.estimatedAreaSqMeters);
      footprintOverlapPct = Math.round((minArea / maxArea) * 100);
      footprintStatus = footprintOverlapPct > 70 ? "MATCH" : "PARTIAL";
      footprintExplanation = `Substantial footprint containment: ${footprintOverlapPct}% area overlap detected (${geomA.spatialType} vs ${geomB.spatialType}).`;
    } else {
      // Partial intersection
      const overlapFactor = 1 - (dist / (rA + rB));
      footprintOverlapPct = Math.round(Math.max(0, Math.min(100, overlapFactor * 90)));
      footprintStatus = footprintOverlapPct > 50 ? "MATCH" : "PARTIAL";
      footprintExplanation = `Geospatial footprint overlap estimated at ${footprintOverlapPct}% within ${dist}m buffer.`;
    }
  }

  const proximitySignal: MatchSignal = {
    signalType: "GEOGRAPHIC_PROXIMITY",
    scorePct: proximityScore,
    weight: 0.20,
    weightedPoints: (proximityScore * 0.20),
    status: proximityStatus,
    explanation: `Centroid distance: ${dist}m (Category threshold: ${thresholdMeters}m for ${projectA.category} / ${projectB.category}).`,
  };

  const footprintSignal: MatchSignal = {
    signalType: "FOOTPRINT_OVERLAP",
    scorePct: footprintOverlapPct ?? (proximityScore > 75 ? proximityScore * 0.8 : 0),
    weight: 0.15,
    weightedPoints: ((footprintOverlapPct ?? (proximityScore > 75 ? proximityScore * 0.8 : 0)) * 0.15),
    status: footprintStatus,
    explanation: footprintExplanation,
  };

  return {
    distanceMeters: dist,
    spatialScorePct: proximityScore,
    spatialStatus: proximityStatus,
    footprintOverlapPct,
    isGeometryAvailable: hasGeometry,
    explanation: `${proximitySignal.explanation} ${hasGeometry ? "[GEOMETRY AVAILABLE]" : "[POINT-BASED APPROXIMATION]"}`,
    proximitySignal,
    footprintSignal,
  };
}
