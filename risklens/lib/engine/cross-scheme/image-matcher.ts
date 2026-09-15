import { NormalizedProject, MatchSignal, EvidencePhoto } from "@/lib/types";
import { calculateHammingDistance } from "../phash";

export interface ImageMatchResult {
  hasPhotosA: boolean;
  hasPhotosB: boolean;
  minHammingDistance: number;
  maxSimilarityPct: number;
  matchedPhotoPair?: {
    photoA: EvidencePhoto;
    photoB: EvidencePhoto;
    hammingDistance: number;
    similarityPct: number;
  };
  imageSignal: MatchSignal;
}

/**
 * Compares evidence photographs across schemes using 64-bit pHash Hamming distance
 */
export function evaluateCrossSchemeImages(
  projectA: NormalizedProject,
  projectB: NormalizedProject
): ImageMatchResult {
  const photosA = projectA.photos || [];
  const photosB = projectB.photos || [];

  if (photosA.length === 0 || photosB.length === 0) {
    return {
      hasPhotosA: photosA.length > 0,
      hasPhotosB: photosB.length > 0,
      minHammingDistance: 64,
      maxSimilarityPct: 0,
      imageSignal: {
        signalType: "IMAGE_SIMILARITY",
        scorePct: 0,
        weight: 0.15,
        weightedPoints: 0,
        status: "UNAVAILABLE",
        explanation: "Photographic evidence unavailable in one or both scheme records (Zero negative penalty).",
      },
    };
  }

  let minHamming = 64;
  let maxSim = 0;
  let bestPair: ImageMatchResult["matchedPhotoPair"];

  for (const pA of photosA) {
    if (!pA.pHash) continue;
    for (const pB of photosB) {
      if (!pB.pHash) continue;
      const dist = calculateHammingDistance(pA.pHash, pB.pHash);
      const sim = Math.max(0, Math.round(100 - (dist / 64) * 100));
      if (dist < minHamming) {
        minHamming = dist;
        maxSim = sim;
        bestPair = {
          photoA: pA,
          photoB: pB,
          hammingDistance: dist,
          similarityPct: sim,
        };
      }
    }
  }

  let status: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" = "DIFFERENT";
  let explanation = `Cross-scheme photo perceptual distance: ${minHamming} bits diff (Similarity: ${maxSim}%). Distinct imagery.`;

  if (minHamming <= 6) {
    status = "MATCH";
    explanation = `High visual similarity detected across schemes: pHash Hamming distance ${minHamming} (Similarity: ${maxSim}%). Potential shared evidence.`;
  } else if (minHamming <= 12) {
    status = "PARTIAL";
    explanation = `Moderate visual similarity across schemes: pHash distance ${minHamming} (${maxSim}% similarity). Contextual review recommended.`;
  }

  return {
    hasPhotosA: true,
    hasPhotosB: true,
    minHammingDistance: minHamming,
    maxSimilarityPct: maxSim,
    matchedPhotoPair: bestPair,
    imageSignal: {
      signalType: "IMAGE_SIMILARITY",
      scorePct: maxSim,
      weight: 0.15,
      weightedPoints: (maxSim * 0.15),
      status,
      evidenceReference: bestPair ? `${bestPair.photoA.id} ↔ ${bestPair.photoB.id}` : undefined,
      explanation,
    },
  };
}
