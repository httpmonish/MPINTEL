import {
  SatelliteEvidence,
  SatelliteProviderType,
  WorkCategory,
  DetectedChangeType,
} from "../../types";
import { AreaOfInterest, ChangeDetectionResult } from "./types";
import { createAreaOfInterest, calculateSpatialOverlap, validateCoordinates } from "./spatial";
import { MockSatelliteProvider } from "./providers";

export interface ProjectSatelliteContext {
  projectId: string;
  category: WorkCategory;
  latitude: number;
  longitude: number;
  sanctionDate: string;
  targetCompletionDate: string;
  physicalProgressPct: number;
  radiusMeters?: number;
  preferredProvider?: SatelliteProviderType;
}

/**
 * Maps project work category to expected visual signature.
 */
export function getExpectedVisualSignal(category: WorkCategory): {
  expectedChangeType: DetectedChangeType;
  signatureDescription: string;
  typicalFootprintSqMeters: number;
} {
  switch (category) {
    case "Roads & Bridges":
      return {
        expectedChangeType: "ROAD_CHANGE",
        signatureDescription: "Linear surface asphalt/concrete reflectance with continuous edge delineation",
        typicalFootprintSqMeters: 2400,
      };
    case "Solar & Street Lighting":
      return {
        expectedChangeType: "STRUCTURAL_CHANGE",
        signatureDescription: "High-mast pole foundation footprint and solar panel high-reflectance signature",
        typicalFootprintSqMeters: 450,
      };
    case "School Infrastructure":
    case "Community Halls":
      return {
        expectedChangeType: "CONSTRUCTION",
        signatureDescription: "Rectangular rooftop slab signature and ground disturbance perimeter",
        typicalFootprintSqMeters: 850,
      };
    case "Drinking Water":
      return {
        expectedChangeType: "WATER_CHANGE",
        signatureDescription: "Overhead tank / sump concrete footprint and pipeline trench line",
        typicalFootprintSqMeters: 380,
      };
    case "Sanitation & Public Health":
      return {
        expectedChangeType: "CONSTRUCTION",
        signatureDescription: "Enclosed civic health facility structural footprint with access pathway",
        typicalFootprintSqMeters: 620,
      };
    default:
      return {
        expectedChangeType: "STRUCTURAL_CHANGE",
        signatureDescription: "Physical earthworks and structural foundation change",
        typicalFootprintSqMeters: 500,
      };
  }
}

/**
 * Evaluates satellite evidence for a project deterministically.
 */
export function generateSatelliteEvidence(
  ctx: ProjectSatelliteContext
): SatelliteEvidence {
  const coordCheck = validateCoordinates(ctx.latitude, ctx.longitude);
  const radius = ctx.radiusMeters || 100;
  const aoi = createAreaOfInterest(ctx.latitude, ctx.longitude, radius);
  const visualSignal = getExpectedVisualSignal(ctx.category);
  const mockProvider = new MockSatelliteProvider();
  const scenario = mockProvider.getScenarioForProject(ctx.projectId);

  // If coordinates are invalid, mark UNAVAILABLE with clear note
  if (!coordCheck.isValid) {
    return {
      projectId: ctx.projectId,
      latitude: ctx.latitude,
      longitude: ctx.longitude,
      radiusMeters: radius,
      provider: "Unavailable",
      imagerySource: "None",
      acquisitionDate: ctx.sanctionDate,
      comparisonDate: ctx.targetCompletionDate,
      beforeImage: {
        id: "NA-PRE",
        source: "Unavailable",
        acquisitionDate: ctx.sanctionDate,
        resolutionMeters: 0,
        cloudCoveragePct: 0,
        tileIdentifier: "NA",
      },
      afterImage: {
        id: "NA-POST",
        source: "Unavailable",
        acquisitionDate: ctx.targetCompletionDate,
        resolutionMeters: 0,
        cloudCoveragePct: 0,
        tileIdentifier: "NA",
      },
      imageResolutionMeters: 0,
      cloudCoveragePct: 0,
      processingStatus: "FAILED",
      preprocessingMethod: "None",
      changeDetectionMethod: "None",
      changeScore: 0.0,
      spatialOverlapScore: 0.0,
      evidenceConfidence: 0,
      evidenceStatus: "UNAVAILABLE",
      detectedChangeType: "NONE",
      detectedAreaSqMeters: 0,
      notes: `Satellite evidence unavailable: ${coordCheck.error}`,
      generatedAt: new Date().toISOString(),
      sourceMetadata: {
        sensorName: "N/A",
        orbitPass: "N/A",
        radiometricProcessing: "N/A",
      },
      provenance: {
        pipelineVersion: "sat-engine-v1.0",
        algorithmHash: "00000000",
        isSyntheticDemo: true,
      },
      limitations: ["Uncalibrated geographic coordinates prevented satellite query."],
    };
  }

  // Generate scenario-specific evidence
  return buildScenarioEvidence(ctx, aoi, visualSignal, scenario);
}

function buildScenarioEvidence(
  ctx: ProjectSatelliteContext,
  aoi: AreaOfInterest,
  visualSignal: ReturnType<typeof getExpectedVisualSignal>,
  scenario: string
): SatelliteEvidence {
  const providerType: SatelliteProviderType =
    ctx.preferredProvider || (ctx.projectId.includes("S2") ? "Sentinel-2" : "Bhuvan");
  const imagerySource =
    providerType === "Sentinel-2"
      ? "Copernicus Sentinel-2 L2A (10m Multispectral)"
      : "ISRO Bhuvan Cartosat-3 (1.12m Panchromatic/Multispectral)";
  const resMeters = providerType === "Sentinel-2" ? 10.0 : 1.12;

  switch (scenario) {
    case "SCENARIO_A_CLEAR_CHANGE": {
      const spatial = calculateSpatialOverlap(aoi, ctx.latitude + 0.0001, ctx.longitude + 0.0001, 35);
      return {
        projectId: ctx.projectId,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        radiusMeters: aoi.radiusMeters,
        provider: providerType,
        imagerySource,
        acquisitionDate: ctx.sanctionDate || "2023-08-15",
        comparisonDate: ctx.targetCompletionDate || "2024-04-22",
        beforeImage: {
          id: `PRE-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2023-08-15",
          resolutionMeters: resMeters,
          cloudCoveragePct: 4.5,
          tileIdentifier: `T43Q-${ctx.projectId}-T0`,
        },
        afterImage: {
          id: `POST-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2024-04-22",
          resolutionMeters: resMeters,
          cloudCoveragePct: 5.8,
          tileIdentifier: `T43Q-${ctx.projectId}-T1`,
        },
        imageResolutionMeters: resMeters,
        cloudCoveragePct: 5.8,
        processingStatus: "COMPLETED",
        preprocessingMethod: "Top-of-Atmosphere (TOA) & Sen2Cor 2.9 Orthorectification",
        changeDetectionMethod: "Spectral Angle Mapper (SAM) + Normalized Difference Built-up Index (NDBI)",
        changeScore: 0.82,
        spatialOverlapScore: 0.88,
        evidenceConfidence: 82,
        evidenceStatus: "CHANGE_DETECTED",
        detectedChangeType: visualSignal.expectedChangeType,
        detectedAreaSqMeters: visualSignal.typicalFootprintSqMeters,
        notes: `Optical surface reflectance indicates physical structure erection with 82% confidence. ${spatial.notes}`,
        generatedAt: new Date().toISOString(),
        sourceMetadata: {
          sensorName: providerType === "Sentinel-2" ? "MSI MultiSpectral" : "Cartosat-3 PAN+MX",
          orbitPass: "Descending Node 10:30 IST",
          sunElevationDeg: 54.2,
          radiometricProcessing: "Level 2A Bottom-of-Atmosphere (BOA)",
        },
        provenance: {
          pipelineVersion: "sat-engine-v1.0",
          algorithmHash: "sha256-a9f82d41",
          isSyntheticDemo: true,
        },
        limitations: [
          "Resolution limits fine sub-meter architectural verification.",
          "Optical imagery is sensitive to seasonal soil moisture variations.",
        ],
      };
    }

    case "SCENARIO_B_NO_CHANGE": {
      return {
        projectId: ctx.projectId,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        radiusMeters: aoi.radiusMeters,
        provider: providerType,
        imagerySource,
        acquisitionDate: "2023-09-01",
        comparisonDate: "2024-05-10",
        beforeImage: {
          id: `PRE-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2023-09-01",
          resolutionMeters: resMeters,
          cloudCoveragePct: 3.2,
          tileIdentifier: `TILE-PRE-${ctx.projectId}`,
        },
        afterImage: {
          id: `POST-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2024-05-10",
          resolutionMeters: resMeters,
          cloudCoveragePct: 4.1,
          tileIdentifier: `TILE-POST-${ctx.projectId}`,
        },
        imageResolutionMeters: resMeters,
        cloudCoveragePct: 4.1,
        processingStatus: "COMPLETED",
        preprocessingMethod: "Orthorectification and radiometric normalization",
        changeDetectionMethod: "Pixel-wise Radiometric Differencing",
        changeScore: 0.08,
        spatialOverlapScore: 0.05,
        evidenceConfidence: 30,
        evidenceStatus: "NO_SIGNIFICANT_CHANGE",
        detectedChangeType: "NONE",
        detectedAreaSqMeters: 0,
        notes: "Surface reflectance comparison shows no observable construction, earthworks, or structural erection in AOI.",
        generatedAt: new Date().toISOString(),
        sourceMetadata: {
          sensorName: "Cartosat-3 PAN",
          orbitPass: "Descending Pass",
          sunElevationDeg: 51.0,
          radiometricProcessing: "Level 1R",
        },
        provenance: {
          pipelineVersion: "sat-engine-v1.0",
          algorithmHash: "sha256-b873c91e",
          isSyntheticDemo: true,
        },
        limitations: [
          "Internal plumbing or electrical work not visible to optical remote sensing.",
          "Clear optical surface indicates physical excavation has not commenced.",
        ],
      };
    }

    case "SCENARIO_C_LOW_QUALITY": {
      return {
        projectId: ctx.projectId,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        radiusMeters: aoi.radiusMeters,
        provider: providerType,
        imagerySource,
        acquisitionDate: "2023-07-20",
        comparisonDate: "2024-06-15",
        beforeImage: {
          id: `PRE-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2023-07-20",
          resolutionMeters: resMeters,
          cloudCoveragePct: 18.0,
          tileIdentifier: `TILE-PRE-${ctx.projectId}`,
        },
        afterImage: {
          id: `POST-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2024-06-15",
          resolutionMeters: resMeters,
          cloudCoveragePct: 76.4,
          tileIdentifier: `TILE-POST-${ctx.projectId}`,
        },
        imageResolutionMeters: resMeters,
        cloudCoveragePct: 76.4,
        processingStatus: "PARTIAL",
        preprocessingMethod: "Cloud Masking (Fmask 4.0)",
        changeDetectionMethod: "Optical Pass Inhibited by Monsoon Cloud Cover",
        changeScore: 0.22,
        spatialOverlapScore: 0.0,
        evidenceConfidence: 45,
        evidenceStatus: "LOW_QUALITY",
        detectedChangeType: "UNKNOWN",
        detectedAreaSqMeters: 0,
        notes: "Heavy cloud cover (76.4%) over area of interest prevents reliable optical surface comparison. Excluded from negative scoring under Fairness Safeguard.",
        generatedAt: new Date().toISOString(),
        sourceMetadata: {
          sensorName: "Sentinel-2 MSI",
          orbitPass: "Ascending Pass",
          radiometricProcessing: "Level 1C",
        },
        provenance: {
          pipelineVersion: "sat-engine-v1.0",
          algorithmHash: "sha256-c43912da",
          isSyntheticDemo: true,
        },
        limitations: [
          "Monsoon atmospheric interference obscured AOI during observation window.",
          "Synthetic Aperture Radar (SAR / Sentinel-1) pass recommended for cloud penetration.",
        ],
      };
    }

    case "SCENARIO_D_UNAVAILABLE": {
      return {
        projectId: ctx.projectId,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        radiusMeters: aoi.radiusMeters,
        provider: "Unavailable",
        imagerySource: "Archive Coverage Gap",
        acquisitionDate: ctx.sanctionDate || "2023-08-01",
        comparisonDate: ctx.targetCompletionDate || "2024-06-01",
        beforeImage: {
          id: "PRE-UNAVAIL",
          source: "None",
          acquisitionDate: ctx.sanctionDate || "2023-08-01",
          resolutionMeters: 0,
          cloudCoveragePct: 0,
          tileIdentifier: "NONE",
        },
        afterImage: {
          id: "POST-UNAVAIL",
          source: "None",
          acquisitionDate: ctx.targetCompletionDate || "2024-06-01",
          resolutionMeters: 0,
          cloudCoveragePct: 0,
          tileIdentifier: "NONE",
        },
        imageResolutionMeters: 0,
        cloudCoveragePct: 0,
        processingStatus: "FAILED",
        preprocessingMethod: "None",
        changeDetectionMethod: "None",
        changeScore: 0.0,
        spatialOverlapScore: 0.0,
        evidenceConfidence: 0,
        evidenceStatus: "UNAVAILABLE",
        detectedChangeType: "NONE",
        detectedAreaSqMeters: 0,
        notes: "High-resolution satellite archive pass currently unavailable for this remote geographic coordinate. Recorded neutrally with zero score penalty.",
        generatedAt: new Date().toISOString(),
        sourceMetadata: {
          sensorName: "N/A",
          orbitPass: "N/A",
          radiometricProcessing: "N/A",
        },
        provenance: {
          pipelineVersion: "sat-engine-v1.0",
          algorithmHash: "00000000",
          isSyntheticDemo: true,
        },
        limitations: [
          "No public high-resolution optical passes indexed in archive for selected date window.",
        ],
      };
    }

    case "SCENARIO_E_REQUIRES_REVIEW":
    default: {
      const spatial = calculateSpatialOverlap(aoi, ctx.latitude + 0.0035, ctx.longitude + 0.0028, 60);
      return {
        projectId: ctx.projectId,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        radiusMeters: aoi.radiusMeters,
        provider: providerType,
        imagerySource,
        acquisitionDate: "2023-09-10",
        comparisonDate: "2024-05-18",
        beforeImage: {
          id: `PRE-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2023-09-10",
          resolutionMeters: resMeters,
          cloudCoveragePct: 8.2,
          tileIdentifier: `TILE-PRE-${ctx.projectId}`,
        },
        afterImage: {
          id: `POST-${ctx.projectId}`,
          source: imagerySource,
          acquisitionDate: "2024-05-18",
          resolutionMeters: resMeters,
          cloudCoveragePct: 9.1,
          tileIdentifier: `TILE-POST-${ctx.projectId}`,
        },
        imageResolutionMeters: resMeters,
        cloudCoveragePct: 9.1,
        processingStatus: "COMPLETED",
        preprocessingMethod: "Orthorectification with SRTM 30m Digital Elevation Model",
        changeDetectionMethod: "Structural Surface Segmentation",
        changeScore: 0.68,
        spatialOverlapScore: spatial.overlapScore, // Low overlap (< 25%)
        evidenceConfidence: 48,
        evidenceStatus: "REQUIRES_REVIEW",
        detectedChangeType: visualSignal.expectedChangeType,
        detectedAreaSqMeters: 720,
        notes: `Physical construction detected but located ${spatial.distanceMeters}m from sanctioned project coordinates (spatial overlap: ${Math.round(spatial.overlapScore * 100)}%). Requires field verification.`,
        generatedAt: new Date().toISOString(),
        sourceMetadata: {
          sensorName: "Cartosat-3 MX",
          orbitPass: "Descending Pass",
          sunElevationDeg: 58.4,
          radiometricProcessing: "Level 2A",
        },
        provenance: {
          pipelineVersion: "sat-engine-v1.0",
          algorithmHash: "sha256-e82931bc",
          isSyntheticDemo: true,
        },
        limitations: [
          "Significant spatial offset between sanctioned GPS coordinates and observed physical construction.",
        ],
      };
    }
  }
}
