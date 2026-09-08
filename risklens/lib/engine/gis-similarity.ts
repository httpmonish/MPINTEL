import { WorkCategory } from "@/lib/types";

export interface GisProximityResult {
  triggered: boolean;
  points: number;
  nearbySimilarCount: number;
  nearestDistanceMeters: number;
  reason: string;
}

/**
 * Calculates geodesic distance between two coordinate pairs using the Haversine formula.
 */
export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function evaluateGisSimilarity(
  currentLat: number,
  currentLon: number,
  currentCategory: WorkCategory,
  currentProjectId: string,
  allProjects: Array<{ id: string; latitude: number; longitude: number; workCategory: WorkCategory }>
): GisProximityResult {
  let nearbyCount = 0;
  let minDistance = Infinity;

  for (const p of allProjects) {
    if (p.id === currentProjectId) continue;
    if (p.workCategory === currentCategory) {
      const dist = calculateHaversineMeters(currentLat, currentLon, p.latitude, p.longitude);
      if (dist < minDistance) {
        minDistance = dist;
      }
      if (dist <= 150) {
        nearbyCount++;
      }
    }
  }

  // Within 150m of another project of the exact same work category sanctioned recently
  if (nearbyCount >= 1 && minDistance <= 150) {
    const points = Math.min(16, 12 + nearbyCount * 2);
    return {
      triggered: true,
      points,
      nearbySimilarCount: nearbyCount,
      nearestDistanceMeters: minDistance,
      reason: `Geographic proximity anomaly: ${nearbyCount} project(s) of identical work category located within ${minDistance}m.`,
    };
  }

  return {
    triggered: false,
    points: 0,
    nearbySimilarCount: nearbyCount,
    nearestDistanceMeters: minDistance === Infinity ? 0 : minDistance,
    reason: "Spatial coordinate distance from existing works within normal dispersion norms.",
  };
}
