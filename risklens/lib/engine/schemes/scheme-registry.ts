import { SchemeId, SchemeMetadata, WorkCategory } from "@/lib/types";

export const SCHEME_REGISTRY: Record<SchemeId, SchemeMetadata> = {
  MPLADS: {
    schemeId: "MPLADS",
    displayName: "Members of Parliament Local Area Development Scheme",
    statutoryBody: "Ministry of Statistics and Programme Implementation (MoSPI)",
    ministry: "MoSPI",
    primaryCategories: [
      "Roads & Bridges",
      "Drinking Water",
      "Community Halls",
      "School Infrastructure",
      "Sanitation & Public Health",
      "Solar & Street Lighting",
    ],
    dataProvider: "eSAKSHI / data.gov.in",
    supportsFootprints: true,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: false,
  },
  MGNREGA: {
    schemeId: "MGNREGA",
    displayName: "Mahatma Gandhi National Rural Employment Guarantee Act",
    statutoryBody: "Ministry of Rural Development (MoRD)",
    ministry: "MoRD",
    primaryCategories: [
      "Rural Connectivity",
      "Water Conservation & Harvesting",
      "Micro-Irrigation Works",
      "Rural Sanitation",
      "Community Infrastructure & Hall",
      "Land Development",
    ],
    dataProvider: "NREGASoft / MoRD Open Portal (DEMO CROSS-SCHEME DATA)",
    supportsFootprints: true,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: true,
  },
  PMGSY: {
    schemeId: "PMGSY",
    displayName: "Pradhan Mantri Gram Sadak Yojana",
    statutoryBody: "National Rural Infrastructure Development Agency (NRIDA)",
    ministry: "MoRD",
    primaryCategories: [
      "All-Weather Rural Roads",
      "Major & Minor Cross Drainage Bridges",
      "Upgradation of Rural Through Routes",
      "Habitation Connectivity Links",
    ],
    dataProvider: "OMMAS / NRIDA Portal (DEMO CROSS-SCHEME DATA)",
    supportsFootprints: true,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: true,
  },
  PMAY: {
    schemeId: "PMAY",
    displayName: "Pradhan Mantri Awas Yojana - Gramin / Urban",
    statutoryBody: "Ministry of Housing and Urban Affairs (MoHUA)",
    ministry: "MoHUA",
    primaryCategories: ["Pucca House Construction", "Individual Household Sanitation"],
    dataProvider: "AwaasSoft (DEMO CROSS-SCHEME DATA)",
    supportsFootprints: true,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: true,
  },
  JJM: {
    schemeId: "JJM",
    displayName: "Jal Jeevan Mission - Har Ghar Jal",
    statutoryBody: "Department of Drinking Water and Sanitation (DDWS)",
    ministry: "Ministry of Jal Shakti",
    primaryCategories: ["Piped Water Supply Schemes", "Overhead Service Reservoirs", "Water Treatment"],
    dataProvider: "JJM IMIS Portal (DEMO CROSS-SCHEME DATA)",
    supportsFootprints: true,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: true,
  },
  OTHER: {
    schemeId: "OTHER",
    displayName: "State & Central Finance Commission Grants",
    statutoryBody: "State Planning Board / Finance Commission",
    ministry: "Ministry of Finance",
    primaryCategories: ["Civic Infrastructure", "Municipal Upgrades"],
    dataProvider: "Public Finance Management System (PFMS)",
    supportsFootprints: false,
    supportsPhotos: true,
    supportsDocuments: true,
    isDemoSource: true,
  },
};

/**
 * Normalizes external scheme category into standard WorkCategory where possible
 */
export function normalizeCategoryToStandard(categoryStr: string): WorkCategory | string {
  const lower = categoryStr.toLowerCase();
  if (lower.includes("road") || lower.includes("bridge") || lower.includes("connectivity") || lower.includes("pavement") || lower.includes("culvert")) {
    return "Roads & Bridges";
  }
  if (lower.includes("water") || lower.includes("harvesting") || lower.includes("reservoir") || lower.includes("pipe") || lower.includes("jal")) {
    return "Drinking Water";
  }
  if (lower.includes("hall") || lower.includes("community") || lower.includes("shelter") || lower.includes("anganwadi") || lower.includes("bhawan")) {
    return "Community Halls";
  }
  if (lower.includes("school") || lower.includes("education") || lower.includes("classroom") || lower.includes("library")) {
    return "School Infrastructure";
  }
  if (lower.includes("sanitat") || lower.includes("toilet") || lower.includes("health") || lower.includes("drain") || lower.includes("solid waste")) {
    return "Sanitation & Public Health";
  }
  if (lower.includes("solar") || lower.includes("light") || lower.includes("illumination") || lower.includes("power") || lower.includes("electric")) {
    return "Solar & Street Lighting";
  }
  return categoryStr;
}

/**
 * Get category spatial behavior expectations and distance threshold
 */
export function getCategorySpatialParameters(category: WorkCategory | string): {
  expectedSpatialType: "POINT" | "POLYGON" | "CORRIDOR" | "NETWORK";
  recommendedThresholdMeters: number;
  maxCandidateSearchRadiusMeters: number;
} {
  const norm = normalizeCategoryToStandard(category);
  switch (norm) {
    case "Roads & Bridges":
      return {
        expectedSpatialType: "CORRIDOR",
        recommendedThresholdMeters: 500,
        maxCandidateSearchRadiusMeters: 1500,
      };
    case "Drinking Water":
      return {
        expectedSpatialType: "NETWORK",
        recommendedThresholdMeters: 250,
        maxCandidateSearchRadiusMeters: 1000,
      };
    case "Community Halls":
    case "School Infrastructure":
      return {
        expectedSpatialType: "POLYGON",
        recommendedThresholdMeters: 100,
        maxCandidateSearchRadiusMeters: 500,
      };
    case "Solar & Street Lighting":
      return {
        expectedSpatialType: "POINT",
        recommendedThresholdMeters: 120,
        maxCandidateSearchRadiusMeters: 600,
      };
    case "Sanitation & Public Health":
      return {
        expectedSpatialType: "POINT",
        recommendedThresholdMeters: 150,
        maxCandidateSearchRadiusMeters: 800,
      };
    default:
      return {
        expectedSpatialType: "POINT",
        recommendedThresholdMeters: 150,
        maxCandidateSearchRadiusMeters: 800,
      };
  }
}
