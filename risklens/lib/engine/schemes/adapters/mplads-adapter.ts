import { Project, NormalizedProject } from "@/lib/types";

export class MpladsAdapter {
  static normalize(project: Project): NormalizedProject {
    return {
      projectId: project.id,
      schemeId: "MPLADS",
      schemeName: "Members of Parliament Local Area Development Scheme",
      title: project.title,
      description: project.description || `Sanctioned MPLADS civic infrastructure work (${project.workCategory}) in constituency ${project.constituencyId}`,
      category: project.workCategory,
      latitude: project.latitude,
      longitude: project.longitude,
      location: `${project.constituencyId}, ${project.stateCode}`,
      district: project.constituencyId.replace("Constituency ", "District-"),
      state: project.stateCode,
      constituency: project.constituencyId,
      implementingAgency: project.implementingAgencyRole,
      contractor: project.contractorEntityId,
      vendor: project.contractorEntityId ? `Vendor-${project.contractorEntityId}` : undefined,
      sanctionedAmountINR: project.sanctionedAmountINR,
      expenditureAmountINR: project.expenditureAmountINR,
      startDate: project.sanctionDate,
      completionDate: project.actualCompletionDate || project.targetCompletionDate,
      status: project.status,
      beneficiarySummary: `Constituents of ${project.constituencyId}`,
      geometry: {
        spatialType: project.workCategory === "Roads & Bridges" ? "CORRIDOR" : "POINT",
        centroid: {
          latitude: project.latitude,
          longitude: project.longitude,
        },
        boundingRadiusMeters: project.workCategory === "Roads & Bridges" ? 400 : 100,
        estimatedAreaSqMeters: project.workCategory === "Roads & Bridges" ? 4800 : 1200,
      },
      documents: [
        {
          id: `DOC-AS-${project.id}`,
          documentType: "ADMINISTRATIVE_SANCTION",
          title: `Administrative Sanction Order - ${project.id}`,
          fileUrl: `/docs/as-${project.id}.pdf`,
          extractedFields: {
            sanctionedAmountINR: project.sanctionedAmountINR,
            contractorName: project.contractorEntityId,
            locationText: `${project.constituencyId}, ${project.stateCode}`,
            sanctionDate: project.sanctionDate,
            workDescriptionText: project.title,
          },
        },
      ],
      photos: project.photos || [],
      satelliteEvidence: project.satelliteEvidence,
      source: "eSAKSHI / data.gov.in (MoSPI)",
      sourceRecordId: `ESAKSHI-${project.id}`,
      sourceTimestamp: project.sanctionDate,
      isDemo: project.synthetic,
    };
  }
}
