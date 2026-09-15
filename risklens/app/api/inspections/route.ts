import { NextRequest, NextResponse } from "next/server";
import { getDeterministicInspections, validateInspectorLocation, calculateTriangulatedVerificationConfidence } from "@/lib/engine/field-verification";
import { getProjectById } from "@/lib/synthetic/fixtures/dataset";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || "HERO-MPLADS-001";
  const inspectorId = searchParams.get("inspectorId");

  let inspections = getDeterministicInspections(projectId);
  if (inspectorId) {
    inspections = inspections.filter((i) => i.assignedInspector.id === inspectorId);
  }

  return NextResponse.json({
    projectId,
    totalInspections: inspections.length,
    inspections,
    fairnessSafeguard: {
      scoreDecoupled: true,
      riskScoreImpact: 0,
      note: "Field verification confidence is evaluated independently from the numerical Risk Score.",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, inspectionId, projectId, latitude, longitude, radiusMeters, inspectorId } = body;

    const project = projectId ? getProjectById(projectId) : null;
    const projLat = project ? project.latitude : 19.0760;
    const projLon = project ? project.longitude : 72.8777;

    if (action === "validate_location") {
      const locResult = validateInspectorLocation(
        projLat,
        projLon,
        latitude,
        longitude,
        radiusMeters || 100
      );
      return NextResponse.json({
        success: true,
        inspectionId,
        projectId,
        ...locResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inspection action logged.",
      inspectionId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Inspection API failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
