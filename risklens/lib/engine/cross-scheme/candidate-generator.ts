import { NormalizedProject } from "@/lib/types";
import { calculateHaversineMeters } from "../gis-similarity";
import { getCategorySpatialParameters } from "../schemes/scheme-registry";

export interface CandidateGenerationResult {
  totalProjectsEvaluated: number;
  candidatePairsCount: number;
  candidatePairs: Array<{
    projectA: NormalizedProject;
    projectB: NormalizedProject;
    distanceMeters: number;
    spatialThresholdMeters: number;
  }>;
  blockingMetrics: {
    spatialBlockFilteredCount: number;
    categoryBlockFilteredCount: number;
    executionDurationMs: number;
  };
}

/**
 * Generates candidate pairs across schemes using multi-stage blocking
 * Stage 1: State/District or Geographic Bounding Box (coarse spatial blocking)
 * Stage 2: Category-aware spatial threshold check
 * Stage 3: Candidate pair assembly
 */
export function generateCandidatePairs(
  targetProject: NormalizedProject,
  candidatePool: NormalizedProject[],
  customRadiusMeters?: number
): CandidateGenerationResult {
  const startTime = Date.now();
  let spatialFiltered = 0;
  let categoryFiltered = 0;
  const candidatePairs: CandidateGenerationResult["candidatePairs"] = [];

  const spatialParams = getCategorySpatialParameters(targetProject.category);
  const maxSearchRadius = customRadiusMeters || spatialParams.maxCandidateSearchRadiusMeters;

  // Approx degree offset for coarse bounding box (1 deg ≈ 111km)
  const degOffset = (maxSearchRadius / 111000) * 1.5;
  const minLat = targetProject.latitude - degOffset;
  const maxLat = targetProject.latitude + degOffset;
  const minLon = targetProject.longitude - degOffset;
  const maxLon = targetProject.longitude + degOffset;

  for (const other of candidatePool) {
    // Exclude same project
    if (other.projectId === targetProject.projectId && other.schemeId === targetProject.schemeId) {
      continue;
    }

    // Coarse Bounding Box Filter
    if (
      other.latitude < minLat ||
      other.latitude > maxLat ||
      other.longitude < minLon ||
      other.longitude > maxLon
    ) {
      spatialFiltered++;
      continue;
    }

    // Precise Geodesic Distance via Haversine
    const dist = calculateHaversineMeters(
      targetProject.latitude,
      targetProject.longitude,
      other.latitude,
      other.longitude
    );

    if (dist > maxSearchRadius) {
      spatialFiltered++;
      continue;
    }

    // Candidate qualified
    candidatePairs.push({
      projectA: targetProject,
      projectB: other,
      distanceMeters: dist,
      spatialThresholdMeters: spatialParams.recommendedThresholdMeters,
    });
  }

  return {
    totalProjectsEvaluated: candidatePool.length,
    candidatePairsCount: candidatePairs.length,
    candidatePairs,
    blockingMetrics: {
      spatialBlockFilteredCount: spatialFiltered,
      categoryBlockFilteredCount: categoryFiltered,
      executionDurationMs: Date.now() - startTime,
    },
  };
}
