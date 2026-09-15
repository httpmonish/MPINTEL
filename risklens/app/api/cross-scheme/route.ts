import { NextResponse } from "next/server";
import { getDeterministicCrossSchemeScenarios } from "@/lib/engine/cross-scheme";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  const schemeId = searchParams.get("schemeId");
  const { normalizedProjects, matches, analytics } = getDeterministicCrossSchemeScenarios();

  if (matchId) {
    const match = matches.find((m) => m.matchId.toLowerCase() === matchId.toLowerCase());
    if (!match) {
      return NextResponse.json({ error: `Match '${matchId}' not found` }, { status: 404 });
    }
    return NextResponse.json(match);
  }

  if (schemeId) {
    const filteredProjects = normalizedProjects.filter(
      (p) => p.schemeId.toLowerCase() === schemeId.toLowerCase()
    );
    return NextResponse.json({ projects: filteredProjects });
  }

  return NextResponse.json({
    projects: normalizedProjects,
    matches,
    analytics,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, decision, remarks, reviewerName, reviewerRole, dispatchInspection } = body;

    const { matches } = getDeterministicCrossSchemeScenarios();
    const match = matches.find((m) => m.matchId.toLowerCase() === matchId.toLowerCase());

    if (!match) {
      return NextResponse.json({ error: `Match '${matchId}' not found` }, { status: 404 });
    }

    match.decision = {
      reviewerId: "REV-OFFICER-01",
      reviewerName: reviewerName || "District Planning Officer",
      reviewerRole: reviewerRole || "Authorized Investigator",
      decision,
      remarks: remarks || "Audited via live review session.",
      decidedAt: new Date().toISOString(),
      dispatchedInspectionId: dispatchInspection ? `INSP-DISPATCH-${Date.now().toString().slice(-4)}` : undefined,
    };
    match.status = dispatchInspection ? "INSPECTION_DISPATCHED" : "REVIEW_RECORDED";
    match.auditTrail.push({
      action: `HUMAN_DECISION_${decision}`,
      performedBy: `${reviewerName || "District Planning Officer"} (${reviewerRole || "Authorized Investigator"})`,
      timestamp: new Date().toISOString(),
      details: `Decision: ${decision}. Remarks: ${remarks}`,
    });

    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record decision" }, { status: 500 });
  }
}
