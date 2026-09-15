import { NormalizedProject, EvidencePhoto } from "@/lib/types";

export interface MgnregaRawRecord {
  workCode: string;
  workName: string;
  workCategory: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  financialYear: string;
  sanctionAmountINR: number;
  expenditureINR: number;
  status: string;
  implementingAgency: string;
  contractorOrMate?: string;
  startDate: string;
  completionDate?: string;
  photos?: EvidencePhoto[];
  polygonCoords?: Array<[number, number]>;
}

export class MgnregaAdapter {
  static normalize(raw: MgnregaRawRecord): NormalizedProject {
    return {
      projectId: raw.workCode,
      schemeId: "MGNREGA",
      schemeName: "Mahatma Gandhi National Rural Employment Guarantee Act",
      title: raw.workName,
      description: `MGNREGA asset creation: ${raw.workName} in Gram Panchayat ${raw.gramPanchayat}, Block ${raw.block}, District ${raw.district}`,
      category: raw.workCategory,
      latitude: raw.latitude,
      longitude: raw.longitude,
      location: `GP ${raw.gramPanchayat}, Block ${raw.block}, ${raw.district}, ${raw.state}`,
      district: raw.district,
      state: raw.state,
      implementingAgency: raw.implementingAgency || "Gram Panchayat / Programme Officer",
      contractor: raw.contractorOrMate,
      sanctionedAmountINR: raw.sanctionAmountINR,
      expenditureAmountINR: raw.expenditureINR,
      startDate: raw.startDate,
      completionDate: raw.completionDate,
      status: raw.status,
      beneficiarySummary: `Job card holder households in GP ${raw.gramPanchayat}`,
      geometry: {
        spatialType: raw.workCategory.toLowerCase().includes("road") || raw.workCategory.toLowerCase().includes("connectivity") ? "CORRIDOR" : "POLYGON",
        centroid: {
          latitude: raw.latitude,
          longitude: raw.longitude,
        },
        coordinates: raw.polygonCoords,
        boundingRadiusMeters: raw.workCategory.toLowerCase().includes("road") ? 350 : 120,
        estimatedAreaSqMeters: 1800,
      },
      documents: [
        {
          id: `DOC-NREGA-${raw.workCode}`,
          documentType: "ADMINISTRATIVE_SANCTION",
          title: `MGNREGA Work Sanction Order - ${raw.workCode}`,
          fileUrl: `/docs/mgnrega-${raw.workCode}.pdf`,
          extractedFields: {
            sanctionedAmountINR: raw.sanctionAmountINR,
            contractorName: raw.contractorOrMate,
            locationText: `${raw.gramPanchayat}, ${raw.district}`,
            sanctionDate: raw.startDate,
            workDescriptionText: raw.workName,
          },
        },
      ],
      photos: raw.photos || [],
      source: "NREGASoft / MoRD Open Data (DEMO CROSS-SCHEME DATA)",
      sourceRecordId: raw.workCode,
      sourceTimestamp: raw.startDate,
      isDemo: true,
    };
  }
}
