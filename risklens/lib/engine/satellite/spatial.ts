import { AreaOfInterest } from "./types";

/**
 * Validates geographic coordinates for physical plausibility.
 */
export function validateCoordinates(
  lat: unknown,
  lon: unknown
): { isValid: boolean; error?: string } {
  if (typeof lat !== "number" || typeof lon !== "number") {
    return { isValid: false, error: "Coordinates must be numeric values." };
  }
  if (isNaN(lat) || isNaN(lon)) {
    return { isValid: false, error: "Coordinates cannot be NaN." };
  }
  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      error: `Latitude ${lat} out of range (-90 to +90).`,
    };
  }
  if (lon < -180 || lon > 180) {
    return {
      isValid: false,
      error: `Longitude ${lon} out of range (-180 to +180).`,
    };
  }
  // Check for (0, 0) Null Island placeholder
  if (Math.abs(lat) < 0.0001 && Math.abs(lon) < 0.0001) {
    return {
      isValid: false,
      error: "Coordinates point to Null Island (0,0); likely uncalibrated record.",
    };
  }
  return { isValid: true };
}

/**
 * Calculates geodesic distance between two points in meters using Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates an Area of Interest (AOI) bounding box and geometry around a project coordinate.
 * Configurable radius (defaults to 100m; typical values: 50m, 100m, 250m).
 */
export function createAreaOfInterest(
  lat: number,
  lon: number,
  radiusMeters: number = 100
): AreaOfInterest {
  const safeRadius = Math.max(25, Math.min(1000, radiusMeters));

  // Approx 1 degree latitude = 111,320 meters
  const latDelta = safeRadius / 111320;
  // Approx 1 degree longitude = 111,320 * cos(lat) meters
  const lonDelta =
    safeRadius / (111320 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));

  return {
    centerLat: lat,
    centerLon: lon,
    radiusMeters: safeRadius,
    bounds: {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLon: lon - lonDelta,
      maxLon: lon + lonDelta,
    },
    areaSqMeters: Math.PI * safeRadius * safeRadius,
  };
}

/**
 * Calculates spatial overlap between the project AOI and a detected physical change footprint.
 */
export function calculateSpatialOverlap(
  aoi: AreaOfInterest,
  changeCenterLat: number,
  changeCenterLon: number,
  changeRadiusMeters: number
): {
  overlapScore: number; // 0.0 to 1.0
  distanceMeters: number;
  isWithinAoi: boolean;
  notes: string;
} {
  const distance = calculateHaversineDistance(
    aoi.centerLat,
    aoi.centerLon,
    changeCenterLat,
    changeCenterLon
  );

  const combinedRadius = aoi.radiusMeters + changeRadiusMeters;

  // If completely outside combined radius
  if (distance >= combinedRadius) {
    return {
      overlapScore: 0.0,
      distanceMeters: Math.round(distance),
      isWithinAoi: false,
      notes: `Change detected ${Math.round(distance)}m away, outside project AOI buffer (${aoi.radiusMeters}m).`,
    };
  }

  // If change center is inside the AOI
  if (distance <= Math.abs(aoi.radiusMeters - changeRadiusMeters)) {
    return {
      overlapScore: 1.0,
      distanceMeters: Math.round(distance),
      isWithinAoi: true,
      notes: `Detected change footprint is fully contained within project AOI (${Math.round(distance)}m offset).`,
    };
  }

  // Partial geometric circle intersection approximation
  const r1 = aoi.radiusMeters;
  const r2 = changeRadiusMeters;
  const d = Math.max(1, distance);

  const part1 =
    r1 * r1 * Math.acos(Math.min(1, Math.max(-1, (d * d + r1 * r1 - r2 * r2) / (2 * d * r1))));
  const part2 =
    r2 * r2 * Math.acos(Math.min(1, Math.max(-1, (d * d + r2 * r2 - r1 * r1) / (2 * d * r2))));
  const part3 =
    0.5 *
    Math.sqrt(
      Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2))
    );

  const intersectionArea = Math.max(0, part1 + part2 - part3);
  const aoiArea = Math.PI * r1 * r1;
  const overlapRatio = Math.min(1.0, Math.max(0.0, intersectionArea / aoiArea));

  return {
    overlapScore: Math.round(overlapRatio * 100) / 100,
    distanceMeters: Math.round(distance),
    isWithinAoi: distance <= aoi.radiusMeters,
    notes: `Change footprint exhibits ${Math.round(overlapRatio * 100)}% spatial overlap with ${Math.round(distance)}m offset.`,
  };
}
