import {
  SatelliteEvidence,
  SatelliteProviderType,
  SatelliteEvidenceStatus,
  DetectedChangeType,
  SatelliteImageReference,
  WorkCategory,
} from "../../types";

export interface CoordinateBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface AreaOfInterest {
  centerLat: number;
  centerLon: number;
  radiusMeters: number;
  bounds: CoordinateBounds;
  areaSqMeters: number;
}

export interface SatelliteSearchQuery {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startDate: string;
  endDate: string;
  maxCloudCoveragePct?: number;
  minResolutionMeters?: number;
}

export interface SatelliteProvider {
  name: SatelliteProviderType;
  displayName: string;
  checkAvailability(lat: number, lon: number): Promise<boolean>;
  searchImagery(query: SatelliteSearchQuery): Promise<SatelliteImageReference[]>;
  getImage(referenceId: string): Promise<SatelliteImageReference | null>;
  getMetadata(referenceId: string): Promise<Record<string, unknown>>;
}

export interface ChangeDetectionInput {
  projectId: string;
  category: WorkCategory;
  aoi: AreaOfInterest;
  beforeImage: SatelliteImageReference;
  afterImage: SatelliteImageReference;
  provider: SatelliteProviderType;
}

export interface ChangeDetectionResult {
  status: SatelliteEvidenceStatus;
  changeScore: number; // 0.0 to 1.0
  spatialOverlapScore: number; // 0.0 to 1.0
  detectedChangeType: DetectedChangeType;
  detectedAreaSqMeters: number;
  evidenceConfidence: number; // 0 to 100
  notes: string;
  limitations: string[];
}
