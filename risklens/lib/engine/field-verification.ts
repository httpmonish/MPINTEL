import {
  FieldInspectionRecord,
  FieldInspectionPhoto,
  FieldEvidenceTimelineEvent,
  LocationValidationStatus,
  SignatureValidationState,
  VerificationConfidenceBreakdown,
  SatelliteEvidence,
  InspectionStage,
} from "../types";
import { calculateHaversineDistance, validateCoordinates } from "./satellite/spatial";
import { calculateHammingDistance } from "./phash";

/**
 * Validates live inspector GPS against sanctioned project location.
 */
export function validateInspectorLocation(
  projectLat: number,
  projectLon: number,
  inspectorLat: number,
  inspectorLon: number,
  allowedRadiusMeters: number = 100,
  accuracyMeters?: number
): {
  status: LocationValidationStatus;
  distanceMeters: number;
  isVerified: boolean;
  statusLabel: string;
} {
  const coordCheck = validateCoordinates(inspectorLat, inspectorLon);
  if (!coordCheck.isValid) {
    return {
      status: "INVALID_COORDINATES",
      distanceMeters: 99999,
      isVerified: false,
      statusLabel: `Invalid GPS coordinates: ${coordCheck.error}`,
    };
  }

  const distM = calculateHaversineDistance(
    inspectorLat,
    inspectorLon,
    projectLat,
    projectLon
  );

  if (accuracyMeters && accuracyMeters > 150) {
    return {
      status: "GPS_LOW_ACCURACY",
      distanceMeters: Math.round(distM),
      isVerified: false,
      statusLabel: `GPS accuracy (${accuracyMeters}m) is too low for statutory verification.`,
    };
  }

  if (distM <= allowedRadiusMeters) {
    return {
      status: "WITHIN_RADIUS",
      distanceMeters: Math.round(distM * 10) / 10,
      isVerified: true,
      statusLabel: `Location verified: ${Math.round(distM)}m from sanctioned GPS (within ${allowedRadiusMeters}m radius).`,
    };
  }

  return {
    status: "OUTSIDE_RADIUS",
    distanceMeters: Math.round(distM * 10) / 10,
    isVerified: false,
    statusLabel: `Location mismatch: capture point is ${Math.round(distM)}m away from sanctioned location (${allowedRadiusMeters}m allowed radius). Requires verification.`,
  };
}

/**
 * Triangulates Multi-Signal Physical Evidence into an independent Verification Confidence Score (0–100).
 * Decoupled from numerical Risk Score (0–100).
 */
export function calculateTriangulatedVerificationConfidence(
  locationStatus: LocationValidationStatus,
  photos: FieldInspectionPhoto[],
  satelliteEvidence?: SatelliteEvidence
): VerificationConfidenceBreakdown {
  // 1. GPS Confidence (30% weight)
  let gpsScore = 50;
  if (locationStatus === "WITHIN_RADIUS") {
    gpsScore = 95;
  } else if (locationStatus === "OUTSIDE_RADIUS") {
    gpsScore = 25;
  } else if (locationStatus === "GPS_UNAVAILABLE") {
    gpsScore = 50; // Neutral fairness baseline
  }

  // 2. Image Authenticity / TPM Hardware Signature (20% weight)
  const hasSigned = photos.some((p) => p.signatureState === "SIGNED_AND_VALID");
  const hasCorrupt = photos.some((p) => p.signatureState === "SIGNED_BUT_INVALID");
  let authScore = 50;
  if (hasSigned) {
    authScore = 95;
  } else if (hasCorrupt) {
    authScore = 30;
  } else if (photos.length > 0) {
    authScore = 70; // Unsigned standard photo
  }

  // 3. Image Quality (15% weight)
  let qualScore = 50;
  if (photos.length > 0) {
    const avgQual = photos.reduce((acc, p) => acc + p.qualityScorePct, 0) / photos.length;
    qualScore = Math.round(avgQual);
  }

  // 4. pHash Uniqueness Check (20% weight)
  const hasDuplicate = photos.some(
    (p) => p.duplicateStatus === "DUPLICATE_EVIDENCE" || p.duplicateStatus === "POSSIBLE_DUPLICATE"
  );
  let phashScore = 98;
  if (hasDuplicate) {
    phashScore = 15;
  } else if (photos.length === 0) {
    phashScore = 50;
  }

  // 5. Satellite Corroboration (15% weight)
  let satScore = 50;
  if (satelliteEvidence) {
    if (satelliteEvidence.evidenceStatus === "CHANGE_DETECTED") {
      satScore = satelliteEvidence.evidenceConfidence;
    } else if (satelliteEvidence.evidenceStatus === "NO_SIGNIFICANT_CHANGE") {
      satScore = 30;
    } else if (satelliteEvidence.evidenceStatus === "LOW_QUALITY" || satelliteEvidence.evidenceStatus === "UNAVAILABLE") {
      satScore = 50; // Neutral baseline under Fairness Safeguard
    } else {
      satScore = 45;
    }
  }

  // Composite Weighted Calculation
  const composite = Math.round(
    gpsScore * 0.30 +
    authScore * 0.20 +
    qualScore * 0.15 +
    phashScore * 0.20 +
    satScore * 0.15
  );

  let status: VerificationConfidenceBreakdown["status"] = "PARTIAL_EVIDENCE";
  let statusLabel = "Partial physical evidence verified across field and remote sensing feeds.";

  if (hasDuplicate || locationStatus === "OUTSIDE_RADIUS") {
    status = "EVIDENCE_CONFLICT";
    statusLabel = "Evidence discrepancy detected (location or visual duplicate match). Routed to human review.";
  } else if (composite >= 75) {
    status = "STRONG_CONSISTENT_EVIDENCE";
    statusLabel = "Strong physical consistency confirmed across GPS, Live Photo, and Satellite Remote Sensing.";
  } else if (photos.length === 0 && (!satelliteEvidence || satelliteEvidence.evidenceStatus === "UNAVAILABLE")) {
    status = "INSUFFICIENT_EVIDENCE";
    statusLabel = "Independent physical evidence currently unindexed. Evaluated with zero score penalty.";
  }

  return {
    compositeConfidence: composite,
    gpsConfidence: gpsScore,
    imageAuthenticityScore: authScore,
    imageQualityScore: qualScore,
    phashUniquenessScore: phashScore,
    satelliteCorroborationScore: satScore,
    crossEvidenceConsistency: Math.round(composite * 0.95),
    status,
    statusLabel,
    fairnessSafeguardNote: "Verification Confidence is evaluated independently and never modifies the numerical Risk Score.",
  };
}

/**
 * Deterministic seed generator for multi-stage Field Inspections (BEFORE, DURING, AFTER).
 */
export function getDeterministicInspections(projectId: string): FieldInspectionRecord[] {
  const isHero = projectId === "HERO-MPLADS-001";
  const isConflict = projectId.includes("REVIEW") || projectId.includes("CONFLICT");
  const isDuplicate = projectId.includes("DUP");

  if (isHero) {
    return [
      {
        inspectionId: "INSP-2023-HERO-001-T0",
        projectId: "HERO-MPLADS-001",
        projectTitle: "High-Mast Solar Street Lighting Installation (Bandra West)",
        workCategory: "Solar & Street Lighting",
        stage: "BEFORE",
        assignedInspector: {
          id: "INSP-OFFICER-441",
          name: "Rajesh V. Patil",
          role: "Authorized Junior Engineer (PWD)",
          badge: "MH-PWD-INSP-441",
          authorizedDeviceFingerprint: "TPM2-HW-SEC-88219",
        },
        assignmentDate: "2023-08-10",
        scheduledDate: "2023-08-16",
        status: "COMPLETED",
        projectCoordinates: { latitude: 19.0760, longitude: 72.8777 },
        allowedRadiusMeters: 100,
        inspectionCoordinates: { latitude: 19.0762, longitude: 72.8779, accuracyMeters: 3.8 },
        distanceToProjectMeters: 31.4,
        locationStatus: "WITHIN_RADIUS",
        inspectionTimestamp: "2023-08-16T11:15:00Z",
        photos: [
          {
            id: "PHOTO-HERO-T0",
            inspectionId: "INSP-2023-HERO-001-T0",
            projectId: "HERO-MPLADS-001",
            stage: "BEFORE",
            url: "/images/evidence/hero-solar-before.jpg",
            caption: "Baseline unpaved junction pre-sanction site inspection.",
            capturedAt: "2023-08-16T11:12:00Z",
            latitude: 19.0762,
            longitude: 72.8779,
            gpsAccuracyMeters: 3.8,
            isLiveCameraStream: true,
            pHash: "0011223344556677",
            duplicateStatus: "NEW_EVIDENCE",
            signatureState: "SIGNED_AND_VALID",
            deviceTpmAuthorized: true,
            qualityTier: "GOOD",
            qualityScorePct: 92,
            uploadStatus: "VERIFIED",
            auditHash: "sha256-photo-001",
          },
        ],
        verificationConfidence: 85,
        auditTrail: [
          { action: "ASSIGNED", performedBy: "System Dispatch", timestamp: "2023-08-10T09:00:00Z", details: "Initial inspection assigned." },
          { action: "COMPLETED", performedBy: "INSP-OFFICER-441", timestamp: "2023-08-16T11:30:00Z", details: "Baseline site confirmed." },
        ],
      },
      {
        inspectionId: "INSP-2024-HERO-001-T1",
        projectId: "HERO-MPLADS-001",
        projectTitle: "High-Mast Solar Street Lighting Installation (Bandra West)",
        workCategory: "Solar & Street Lighting",
        stage: "AFTER",
        assignedInspector: {
          id: "INSP-OFFICER-441",
          name: "Rajesh V. Patil",
          role: "Authorized Junior Engineer (PWD)",
          badge: "MH-PWD-INSP-441",
          authorizedDeviceFingerprint: "TPM2-HW-SEC-88219",
        },
        assignmentDate: "2024-04-10",
        scheduledDate: "2024-04-24",
        status: "VERIFIED",
        projectCoordinates: { latitude: 19.0760, longitude: 72.8777 },
        allowedRadiusMeters: 100,
        inspectionCoordinates: { latitude: 19.0763, longitude: 72.8780, accuracyMeters: 4.2 },
        distanceToProjectMeters: 46.8,
        locationStatus: "WITHIN_RADIUS",
        inspectionTimestamp: "2024-04-24T10:45:00Z",
        photos: [
          {
            id: "PHOTO-HERO-T1",
            inspectionId: "INSP-2024-HERO-001-T1",
            projectId: "HERO-MPLADS-001",
            stage: "AFTER",
            url: "/images/evidence/hero-solar-after.jpg",
            caption: "Erected high-mast solar pole with dual LED luminaire and battery enclosure.",
            capturedAt: "2024-04-24T10:42:15Z",
            latitude: 19.0763,
            longitude: 72.8780,
            gpsAccuracyMeters: 4.2,
            isLiveCameraStream: true,
            pHash: "a1b2c3d4e5f60718",
            duplicateStatus: "NEW_EVIDENCE",
            signatureState: "SIGNED_AND_VALID",
            deviceTpmAuthorized: true,
            qualityTier: "GOOD",
            qualityScorePct: 94,
            uploadStatus: "VERIFIED",
            auditHash: "sha256-photo-9a81b7c",
          },
        ],
        verificationConfidence: 88,
        confidenceBreakdown: {
          compositeConfidence: 88,
          gpsConfidence: 96,
          imageAuthenticityScore: 95,
          imageQualityScore: 94,
          phashUniquenessScore: 98,
          satelliteCorroborationScore: 82,
          crossEvidenceConsistency: 92,
          status: "STRONG_CONSISTENT_EVIDENCE",
          statusLabel: "Strong physical consistency across GPS, live photo, and Sentinel-2 satellite pass.",
          fairnessSafeguardNote: "Evaluated with zero impact on numerical Risk Score.",
        },
        auditTrail: [
          { action: "ASSIGNED", performedBy: "System Dispatch", timestamp: "2024-04-10T09:00:00Z", details: "Completion verification assigned." },
          { action: "VERIFIED", performedBy: "INSP-OFFICER-441", timestamp: "2024-04-24T10:45:00Z", details: "Completion verified on site." },
        ],
      },
    ];
  }

  // Default Standard Project
  return [
    {
      inspectionId: `INSP-2024-${projectId}`,
      projectId,
      projectTitle: "Sanctioned Community Asset",
      workCategory: "Roads & Bridges",
      stage: "AFTER",
      assignedInspector: {
        id: "INSP-OFFICER-302",
        name: "Vikram N. Rao",
        role: "Assistant Engineer (PWD)",
        badge: "PWD-INSP-302",
        authorizedDeviceFingerprint: "TPM2-HW-SEC-30299",
      },
      assignmentDate: "2024-03-01",
      scheduledDate: "2024-03-15",
      status: isConflict ? "EVIDENCE_CONFLICT" : "VERIFIED",
      projectCoordinates: { latitude: 18.5204, longitude: 73.8567 },
      allowedRadiusMeters: 100,
      inspectionCoordinates: isConflict
        ? { latitude: 18.5245, longitude: 73.8610, accuracyMeters: 5.0 }
        : { latitude: 18.5206, longitude: 73.8569, accuracyMeters: 3.5 },
      distanceToProjectMeters: isConflict ? 490 : 32,
      locationStatus: isConflict ? "OUTSIDE_RADIUS" : "WITHIN_RADIUS",
      photos: [
        {
          id: `PHOTO-${projectId}-1`,
          inspectionId: `INSP-2024-${projectId}`,
          projectId,
          stage: "AFTER",
          url: "/images/evidence/standard-work.jpg",
          caption: "Completed civil work photograph with GPS lock.",
          capturedAt: "2024-03-15T14:30:00Z",
          latitude: isConflict ? 18.5245 : 18.5206,
          longitude: isConflict ? 73.8610 : 73.8569,
          gpsAccuracyMeters: 4.0,
          isLiveCameraStream: true,
          pHash: isDuplicate ? "a1b2c3d4e5f60718" : "9988776655443322",
          duplicateStatus: isDuplicate ? "DUPLICATE_EVIDENCE" : "NEW_EVIDENCE",
          similarityScorePct: isDuplicate ? 94 : 0,
          signatureState: "SIGNED_AND_VALID",
          deviceTpmAuthorized: true,
          qualityTier: "GOOD",
          qualityScorePct: 90,
          uploadStatus: isConflict ? "REQUIRES_REVIEW" : "VERIFIED",
          auditHash: "sha256-photo-std",
        },
      ],
      verificationConfidence: isConflict ? 46 : 86,
      auditTrail: [
        { action: "ASSIGNED", performedBy: "System Dispatch", timestamp: "2024-03-01T09:00:00Z", details: "Inspection assigned." },
      ],
    },
  ];
}

/**
 * Builds a chronological multi-stage project evidence timeline.
 */
export function buildProjectEvidenceTimeline(
  inspections: FieldInspectionRecord[]
): FieldEvidenceTimelineEvent[] {
  const events: FieldEvidenceTimelineEvent[] = [];

  for (const insp of inspections) {
    events.push({
      date: insp.inspectionTimestamp?.slice(0, 10) || insp.scheduledDate,
      inspectionId: insp.inspectionId,
      stage: insp.stage,
      title: `${insp.stage === "BEFORE" ? "Baseline Site" : insp.stage === "DURING" ? "Milestone Progress" : "Completion"} Verification`,
      inspectorName: insp.assignedInspector.name,
      status: insp.status,
      evidenceCount: insp.photos.length,
      gpsResult: insp.locationStatus,
      verificationConfidence: insp.verificationConfidence || 50,
      photos: insp.photos,
      reinspectionRequested: !!insp.childReinspectionId,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
