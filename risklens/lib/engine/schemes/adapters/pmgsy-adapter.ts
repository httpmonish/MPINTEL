import { NormalizedProject, EvidencePhoto } from "@/lib/types";

export interface PmgsyRawRecord {
  packageNumber: string;
  roadName: string;
  category: string;
  lengthKm: number;
  district: string;
  state: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude?: number;
  endLongitude?: number;
  sanctionCostINR: number;
  expenditureINR: number;
  executingAgency: string;
  contractorName: string;
  sanctionDate: string;
  completionDate?: string;
  status: string;
  connectedHabitations: string[];
  photos?: EvidencePhoto[];
  corridorCoords?: Array<[number, number]>;
}

export class PmgsyAdapter {
  static normalize(raw: PmgsyRawRecord): NormalizedProject {
    return {
      projectId: raw.packageNumber,
      schemeId: "PMGSY",
      schemeName: "Pradhan Mantri Gram Sadak Yojana",
      title: raw.roadName,
      description: `PMGSY all-weather rural road connectivity (${raw.lengthKm} km): ${raw.roadName} connecting ${raw.connectedHabitations.join(", ")} in ${raw.district}, ${raw.state}`,
      category: "Roads & Bridges",
      latitude: raw.startLatitude,
      longitude: raw.startLongitude,
      location: `${raw.district}, ${raw.state} (Chainage: 0.00 to ${raw.lengthKm} km)`,
      district: raw.district,
      state: raw.state,
      implementingAgency: raw.executingAgency || "State Rural Roads Development Agency (SRRDA)",
      contractor: raw.contractorName,
      vendor: raw.contractorName,
      sanctionedAmountINR: raw.sanctionCostINR,
      expenditureAmountINR: raw.expenditureINR,
      startDate: raw.sanctionDate,
      completionDate: raw.completionDate,
      status: raw.status,
      beneficiarySummary: `Habitations: ${raw.connectedHabitations.join(", ")}`,
      geometry: {
        spatialType: "CORRIDOR",
        centroid: {
          latitude: raw.startLatitude,
          longitude: raw.startLongitude,
        },
        coordinates: raw.corridorCoords,
        boundingRadiusMeters: Math.max(500, Math.round(raw.lengthKm * 500)),
        estimatedAreaSqMeters: Math.round(raw.lengthKm * 1000 * 7), // 7m roadway corridor
      },
      documents: [
        {
          id: `DOC-PMGSY-${raw.packageNumber}`,
          documentType: "WORK_ORDER",
          title: `PMGSY Work Order & DPR - Package ${raw.packageNumber}`,
          fileUrl: `/docs/pmgsy-${raw.packageNumber}.pdf`,
          extractedFields: {
            sanctionedAmountINR: raw.sanctionCostINR,
            contractorName: raw.contractorName,
            locationText: `${raw.district}, ${raw.state}`,
            sanctionDate: raw.sanctionDate,
            workDescriptionText: raw.roadName,
            quantityMetrics: `${raw.lengthKm} km bituminous pavement`,
          },
        },
      ],
      photos: raw.photos || [],
      source: "OMMAS / NRIDA Portal (DEMO CROSS-SCHEME DATA)",
      sourceRecordId: raw.packageNumber,
      sourceTimestamp: raw.sanctionDate,
      isDemo: true,
    };
  }
}
