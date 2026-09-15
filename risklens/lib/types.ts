export type WorkCategory =
  | "Roads & Bridges"
  | "Drinking Water"
  | "Community Halls"
  | "School Infrastructure"
  | "Sanitation & Public Health"
  | "Solar & Street Lighting";

export type ProjectStatus =
  | "Recommended"
  | "Sanctioned"
  | "In Progress"
  | "Completed"
  | "Delayed"
  | "Under Review";

export type DataSourceType = "synthetic" | "public";

export interface DataSourceBadgeProps {
  type: DataSourceType;
  className?: string;
}

export interface PaymentTranche {
  trancheNumber: number;
  amountINR: number;
  disbursedDate: string;
  stageMilestone: string;
  utilizationCertificateSubmitted: boolean;
  voucherRefNumber?: string;
}

export interface StageEvent {
  stageName: string;
  expectedDays: number;
  actualDays: number;
  startDate: string;
  completionDate?: string;
  responsibleRole: string; // e.g. "District Planning Officer IDA", "Executive Engineer PWD" - NEVER personal names
  isDelayed: boolean;
  delayRatio: number;
  physicalProgressAtStage?: number; // 0 - 100%
}

export interface EvidencePhoto {
  id: string;
  url: string;
  caption: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  pHash: string; // 64-bit hexadecimal perceptual hash
  matchedPhotoId?: string;
  matchedProjectId?: string;
  hammingDistance?: number;
  isDuplicateFlagged?: boolean;
  isCryptographicallySigned?: boolean;
  signatureHash?: string;
  deviceFingerprint?: string;
}

export interface SignalBreakdownItem {
  signal:
    | "cost_anomaly"
    | "sla_delay"
    | "payment_anomaly"
    | "gis_similarity"
    | "photo_similarity"
    | "progress_mismatch"
    | "fiscal_rush"
    | "cross_scheme";
  label: string;
  points: number;
  maxPoints: number;
  reason: string;
  isTriggered: boolean;
}

export interface RiskTimelinePoint {
  date: string;
  score: number;
  triggerEvent: string;
}

export interface RiskScore {
  compositeScore: number; // 0 - 100
  tier: "low" | "moderate" | "high";
  whyFlaggedSummary: string;
  breakdown: SignalBreakdownItem[];
  calculatedAt: string;
  algorithmVersion: string;
  history?: RiskTimelinePoint[];
}

export interface DelayPrediction {
  likelihood: "Low" | "Medium" | "High";
  probabilityScore: number; // 0 - 100%
  expectedDelayDays: number;
  primaryRiskFactors: string[];
}

export interface CitizenSubmission {
  id: string;
  projectId: string;
  photoUrl: string;
  submittedAt: string;
  latitude: number;
  longitude: number;
  pHash: string;
  verificationMatch: boolean;
  notes: string;
}

export interface CrossSchemeDuplicate {
  matchedScheme: "PMGSY (Rural Roads)" | "MLA-LAD (State)" | "15th Finance Commission Grant";
  externalProjectId: string;
  assetDescription: string;
  sanctionedAmountINR: number;
  spatialDistanceMeters: number;
  textOverlapScore: number; // 0 - 100%
}

export interface Constituency {
  id: string; // e.g. "Constituency A-01"
  stateCode: string; // e.g. "State X", "State Y"
  totalProjects: number;
  totalSanctionedINR: number;
  totalDisbursedINR: number;
  averageRiskScore: number;
  openFlaggedCasesCount: number;
  avatarSeed: string;
  utilizationRatePct?: number;
  inspectionCoveragePct?: number;
  isNeglectedEquityFlagged?: boolean;
}

export interface InvestigationCase {
  id: string;
  projectId: string;
  status: "Open" | "Under Review" | "Resolved - False Alarm" | "Resolved - Corrective Action Required" | "Escalated";
  flaggedSignals: string[];
  officerAction?: "Mark False Alarm" | "Needs More Evidence" | "Confirm Issue";
  actionNotes?: string;
  actedByRole?: string; // e.g. "District Planning Authority"
  actedAt?: string;
  escalationLevel?: "District" | "State Nodal" | "Ministry / CVC";
  escalatedTo?: string;
}

export interface Project {
  id: string; // e.g. "PRJ-2024-001" or "HERO-MPLADS-001"
  title: string;
  description?: string;
  workCategory: WorkCategory;
  constituencyId: string;
  stateCode: string;
  sanctionedAmountINR: number;
  expenditureAmountINR: number;
  physicalProgressPct: number; // 0 - 100%
  peerGroupMedianINR: number;
  peerGroupRangeMinINR: number;
  peerGroupRangeMaxINR: number;
  sanctionDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  latitude: number;
  longitude: number;
  implementingAgencyRole: string; // Role designation only
  contractorEntityId?: string; // e.g. "ENT-PWD-CORP-42"
  paymentTranches: PaymentTranche[];
  stageEvents: StageEvent[];
  photos: EvidencePhoto[];
  riskScore: RiskScore;
  delayPrediction?: DelayPrediction;
  crossSchemeMatch?: CrossSchemeDuplicate;
  citizenSubmissions?: CitizenSubmission[];
  investigationCase?: InvestigationCase;
  satelliteEvidence?: SatelliteEvidence;
  synthetic: boolean;
  dataSource: DataSourceType;
}

export type SatelliteProviderType = "Bhuvan" | "Sentinel-2" | "Mock" | "Unavailable";

export type SatelliteEvidenceStatus =
  | "UNAVAILABLE"
  | "PENDING"
  | "LOW_QUALITY"
  | "NO_SIGNIFICANT_CHANGE"
  | "CHANGE_DETECTED"
  | "PARTIAL_CHANGE"
  | "REQUIRES_REVIEW"
  | "VERIFIED_CONSISTENT";

export type DetectedChangeType =
  | "NONE"
  | "CONSTRUCTION"
  | "VEGETATION_CHANGE"
  | "LAND_SURFACE_CHANGE"
  | "STRUCTURAL_CHANGE"
  | "ROAD_CHANGE"
  | "ROOFTOP_CHANGE"
  | "WATER_CHANGE"
  | "UNKNOWN";

export interface SatelliteImageReference {
  id: string;
  source: string; // e.g. "ISRO Bhuvan Cartosat-3" | "Copernicus Sentinel-2 L2A"
  acquisitionDate: string; // ISO format YYYY-MM-DD
  resolutionMeters: number;
  cloudCoveragePct: number;
  tileIdentifier: string;
  url?: string;
  thumbnailSvg?: string;
}

export interface SatelliteEvidence {
  projectId: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  provider: SatelliteProviderType;
  imagerySource: string;
  acquisitionDate: string;
  comparisonDate: string;
  beforeImage: SatelliteImageReference;
  afterImage: SatelliteImageReference;
  imageResolutionMeters: number;
  cloudCoveragePct: number;
  processingStatus: "COMPLETED" | "PARTIAL" | "FAILED" | "PENDING";
  preprocessingMethod: string;
  changeDetectionMethod: string;
  changeScore: number; // 0.0 to 1.0 (normalized change intensity)
  spatialOverlapScore: number; // 0.0 to 1.0 (overlap with project AOI)
  evidenceConfidence: number; // 0 to 100
  evidenceStatus: SatelliteEvidenceStatus;
  detectedChangeType: DetectedChangeType;
  detectedAreaSqMeters: number;
  notes: string;
  generatedAt: string;
  sourceMetadata: {
    sensorName: string;
    orbitPass: string;
    sunElevationDeg?: number;
    radiometricProcessing: string;
  };
  provenance: {
    pipelineVersion: string;
    algorithmHash: string;
    isSyntheticDemo: boolean;
  };
  limitations: string[];
}

export interface SentinelSceneRecord {
  sceneId: string;
  productId: string;
  acquisitionDatetime: string;
  acquisitionDate: string;
  cloudCoveragePct: number;
  resolutionMeters: number;
  qualityTier: "OPTIMAL" | "USABLE" | "REJECTED_CLOUD";
  isSuitable: boolean;
  rejectionReason?: string | null;
  tileUrl?: string | null;
  thumbnailUrl?: string | null;
  sunElevationDeg?: number | null;
  orbitPass?: string | null;
  source: string;
  isDemo: boolean;
}

export interface SentinelSceneSearchResponse {
  projectId?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  totalScenesFound: number;
  scenes: SentinelSceneRecord[];
  latestSuitableScene?: SentinelSceneRecord | null;
  rejectedNewerScenes: SentinelSceneRecord[];
  mode: "REAL_SATELLITE_API" | "DEMO_SATELLITE_DATA";
  providerInfo: {
    providerName: string;
    constellation: string;
    instrument: string;
    productType: string;
    nominalResolution: string;
    revisitRateDays: number;
    mode: string;
    isDemo: boolean;
  };
  retrievalTimestamp: string;
}

export interface SentinelObservationComparison {
  projectId: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  beforeScene: SentinelSceneRecord;
  afterScene: SentinelSceneRecord;
  spatialOverlapScore: number;
  changeScore: number;
  evidenceConfidence: number;
  evidenceStatus: SatelliteEvidenceStatus;
  detectedChangeType: DetectedChangeType;
  detectedAreaSqMeters: number;
  notes: string;
  mode: "REAL_SATELLITE_API" | "DEMO_SATELLITE_DATA";
  provenance: {
    pipelineVersion: string;
    algorithmHash: string;
    processingMethod: string;
    retrievalTimestamp: string;
  };
}

export type UserRole = "mp" | "district" | "state" | "ministry" | "inspector" | "investigator";

export interface DemoSession {
  role: UserRole;
  roleTitle: string;
  jurisdiction: string;
  badge: string;
}

// -----------------------------------------------------------------------------
// Phase 2: Field Verification Subsystem Types
// -----------------------------------------------------------------------------

export type InspectionStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "LOCATION_VERIFIED"
  | "EVIDENCE_CAPTURED"
  | "SUBMITTED"
  | "PROCESSING"
  | "REQUIRES_REVIEW"
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "EVIDENCE_CONFLICT"
  | "REJECTED"
  | "COMPLETED";

export type InspectionStage = "BEFORE" | "DURING" | "AFTER";

export type LocationValidationStatus =
  | "WITHIN_RADIUS"
  | "OUTSIDE_RADIUS"
  | "GPS_UNAVAILABLE"
  | "GPS_LOW_ACCURACY"
  | "INVALID_COORDINATES";

export type SignatureValidationState =
  | "SIGNED_AND_VALID"
  | "SIGNED_BUT_INVALID"
  | "UNSIGNED"
  | "SIGNATURE_UNAVAILABLE"
  | "DEVICE_NOT_AUTHORIZED";

export type ImageQualityTier = "GOOD" | "ACCEPTABLE" | "LOW_QUALITY" | "UNUSABLE";

export type DuplicateCheckStatus =
  | "NEW_EVIDENCE"
  | "POSSIBLE_DUPLICATE"
  | "DUPLICATE_EVIDENCE"
  | "INSUFFICIENT_IMAGE_QUALITY";

export interface FieldInspectionPhoto {
  id: string;
  inspectionId: string;
  projectId: string;
  stage: InspectionStage;
  url: string;
  caption: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters?: number;
  altitudeMeters?: number;
  headingDegrees?: number;
  isLiveCameraStream: boolean;
  pHash: string;
  duplicateStatus: DuplicateCheckStatus;
  matchedPhotoId?: string;
  matchedProjectId?: string;
  hammingDistance?: number;
  similarityScorePct?: number;
  signatureState: SignatureValidationState;
  signatureDigest?: string;
  deviceIdentifier?: string;
  deviceTpmAuthorized: boolean;
  qualityTier: ImageQualityTier;
  qualityScorePct: number;
  resolutionWidth?: number;
  resolutionHeight?: number;
  uploadStatus: "UPLOADING" | "UPLOADED" | "PROCESSING" | "VERIFIED" | "REQUIRES_REVIEW" | "FAILED" | "PENDING_SYNC";
  auditHash: string;
}

export interface InspectionReviewDecision {
  reviewer: string;
  reviewerRole: string;
  decision: "VERIFIED" | "PARTIALLY_VERIFIED" | "INSUFFICIENT_EVIDENCE" | "EVIDENCE_CONFLICT_CONFIRMED" | "REQUEST_REINSPECTION";
  remarks: string;
  reviewedAt: string;
  supportingEvidenceIds: string[];
}

export interface VerificationConfidenceBreakdown {
  compositeConfidence: number; // 0 - 100
  gpsConfidence: number; // 0 - 100
  imageAuthenticityScore: number; // 0 - 100
  imageQualityScore: number; // 0 - 100
  phashUniquenessScore: number; // 0 - 100
  satelliteCorroborationScore: number; // 0 - 100
  crossEvidenceConsistency: number; // 0 - 100
  status: "STRONG_CONSISTENT_EVIDENCE" | "PARTIAL_EVIDENCE" | "EVIDENCE_CONFLICT" | "INSUFFICIENT_EVIDENCE";
  statusLabel: string;
  fairnessSafeguardNote: string;
}

export interface FieldInspectionRecord {
  inspectionId: string;
  projectId: string;
  projectTitle: string;
  workCategory: string;
  stage: InspectionStage;
  assignedInspector: {
    id: string;
    name: string;
    role: string;
    badge: string;
    authorizedDeviceFingerprint: string;
  };
  assignmentDate: string;
  scheduledDate: string;
  status: InspectionStatus;
  projectCoordinates: {
    latitude: number;
    longitude: number;
  };
  allowedRadiusMeters: number; // Configurable: 50, 100, 250
  inspectionCoordinates?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  distanceToProjectMeters?: number;
  locationStatus: LocationValidationStatus;
  inspectionTimestamp?: string;
  photos: FieldInspectionPhoto[];
  verificationConfidence?: number;
  confidenceBreakdown?: VerificationConfidenceBreakdown;
  notes?: string;
  reviewDecision?: InspectionReviewDecision;
  reinspectionOfId?: string; // Linked parent inspection if this is a re-inspection
  childReinspectionId?: string;
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
  isOfflineQueued?: boolean;
  isDemoData?: boolean;
}

export interface FieldEvidenceTimelineEvent {
  date: string;
  inspectionId: string;
  stage: InspectionStage;
  title: string;
  inspectorName: string;
  status: InspectionStatus;
  evidenceCount: number;
  gpsResult: LocationValidationStatus;
  verificationConfidence: number;
  photos: FieldInspectionPhoto[];
  reinspectionRequested?: boolean;
}

// -----------------------------------------------------------------------------
// Phase 3: Multi-Scheme Cross-Verification Subsystem Types
// -----------------------------------------------------------------------------

export type SchemeId = "MPLADS" | "MGNREGA" | "PMGSY" | "PMAY" | "JJM" | "OTHER";

export type AssetSpatialType = "POINT" | "POLYGON" | "CORRIDOR" | "NETWORK";

export type CrossSchemeClassification =
  | "NO_SIGNIFICANT_MATCH"
  | "LOW_SIMILARITY"
  | "POTENTIAL_OVERLAP"
  | "HIGH_SIMILARITY"
  | "POTENTIAL_DUPLICATE"
  | "REQUIRES_HUMAN_REVIEW";

export type TemporalRelationship =
  | "SEQUENTIAL_PROJECTS"
  | "CONCURRENT_PROJECTS"
  | "POSSIBLE_PHASED_WORK"
  | "TEMPORAL_OVERLAP"
  | "UNKNOWN";

export type AssetLifecycleRelationship =
  | "SAME_ASSET_DIFFERENT_WORK"
  | "SAME_ASSET_POTENTIAL_DUPLICATE"
  | "INDEPENDENT_ADJACENT_ASSETS"
  | "SHARED_CONTRACTOR_DIFFERENT_PROJECTS"
  | "UNRELATED";

export type CrossSchemeDecisionState =
  | "CONFIRMED_SHARED_ASSET"
  | "CONFIRMED_SEPARATE_ASSETS"
  | "INSUFFICIENT_EVIDENCE"
  | "NEEDS_FIELD_INSPECTION"
  | "NEEDS_DOCUMENT_REVIEW"
  | "FALSE_MATCH";

export type InvestigationPriority = "LOW_PRIORITY" | "MEDIUM_PRIORITY" | "HIGH_PRIORITY" | "URGENT_REVIEW";

export interface SchemeMetadata {
  schemeId: SchemeId;
  displayName: string;
  statutoryBody: string;
  ministry: string;
  primaryCategories: string[];
  dataProvider: string;
  supportsFootprints: boolean;
  supportsPhotos: boolean;
  supportsDocuments: boolean;
  isDemoSource: boolean;
}

export interface AssetGeometry {
  spatialType: AssetSpatialType;
  centroid: {
    latitude: number;
    longitude: number;
  };
  coordinates?: Array<[number, number]>; // GeoJSON polygon or linestring coords
  boundingRadiusMeters: number;
  estimatedAreaSqMeters?: number;
}

export interface SchemeDocument {
  id: string;
  documentType: "ADMINISTRATIVE_SANCTION" | "TECHNICAL_ESTIMATE" | "WORK_ORDER" | "UTILIZATION_CERTIFICATE" | "MEASUREMENT_BOOK" | "INSPECTION_NOTE";
  title: string;
  fileUrl: string;
  extractedFields: {
    sanctionedAmountINR?: number;
    contractorName?: string;
    locationText?: string;
    sanctionDate?: string;
    workDescriptionText?: string;
    quantityMetrics?: string;
  };
}

export interface NormalizedProject {
  projectId: string;
  schemeId: SchemeId;
  schemeName: string;
  title: string;
  description: string;
  category: WorkCategory | string;
  latitude: number;
  longitude: number;
  location: string;
  district: string;
  state: string;
  constituency?: string;
  implementingAgency: string;
  contractor?: string;
  vendor?: string;
  sanctionedAmountINR: number;
  expenditureAmountINR: number;
  startDate: string;
  completionDate?: string;
  status: ProjectStatus | string;
  beneficiarySummary?: string;
  geometry?: AssetGeometry;
  documents: SchemeDocument[];
  photos: EvidencePhoto[];
  satelliteEvidence?: SatelliteEvidence;
  fieldInspections?: FieldInspectionRecord[];
  source: string;
  sourceRecordId: string;
  sourceTimestamp: string;
  isDemo: boolean;
}

export interface MatchSignal {
  signalType:
    | "GEOGRAPHIC_PROXIMITY"
    | "FOOTPRINT_OVERLAP"
    | "DESCRIPTION_SIMILARITY"
    | "CATEGORY_SIMILARITY"
    | "IMAGE_SIMILARITY"
    | "SATELLITE_CONSISTENCY"
    | "FIELD_EVIDENCE_CONSISTENCY"
    | "TEMPORAL_OVERLAP"
    | "ENTITY_RELATIONSHIP"
    | "FINANCIAL_COMPARISON";
  scorePct: number; // 0 - 100%
  weight: number;
  weightedPoints: number;
  status: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT";
  evidenceReference?: string;
  explanation: string;
}

export interface MatchSignalBreakdown {
  geographicProximity: MatchSignal;
  footprintOverlap: MatchSignal;
  descriptionSimilarity: MatchSignal;
  categorySimilarity: MatchSignal;
  imageSimilarity: MatchSignal;
  satelliteConsistency: MatchSignal;
  fieldEvidenceConsistency: MatchSignal;
  temporalOverlap: MatchSignal;
  entityRelationship: MatchSignal;
}

export interface CrossSchemeMatch {
  matchId: string;
  projectA: NormalizedProject;
  projectB: NormalizedProject;
  similarityScore: number; // 0 - 100
  classification: CrossSchemeClassification;
  priority: InvestigationPriority;
  temporalRelationship: TemporalRelationship;
  assetLifecycle: AssetLifecycleRelationship;
  signals: MatchSignalBreakdown;
  signalList: MatchSignal[];
  whyFlaggedSummary: string;
  distanceMeters: number;
  geometryOverlapPct?: number;
  imageSimilarityPct?: number;
  textSimilarityPct?: number;
  status: "REQUIRES_VERIFICATION" | "UNDER_INVESTIGATION" | "REVIEW_RECORDED" | "INSPECTION_DISPATCHED";
  decision?: {
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    decision: CrossSchemeDecisionState;
    remarks: string;
    decidedAt: string;
    dispatchedInspectionId?: string;
  };
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
  createdAt: string;
  isDemoScenario?: boolean;
  demoScenarioTag?: "SCENARIO_A" | "SCENARIO_B" | "SCENARIO_C" | "SCENARIO_D" | "SCENARIO_E";
}

export interface CrossSchemeAnalytics {
  totalMatchedPairs: number;
  potentialOverlapsCount: number;
  highSimilarityCount: number;
  requiresReviewCount: number;
  confirmedSharedAssetsCount: number;
  falseMatchesCount: number;
  pendingInspectionsCount: number;
  schemePairDistribution: Array<{
    schemePair: string;
    count: number;
    avgSimilarity: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  hotspots: Array<{
    state: string;
    district: string;
    latitude: number;
    longitude: number;
    matchCount: number;
    highestSimilarity: number;
  }>;
}
