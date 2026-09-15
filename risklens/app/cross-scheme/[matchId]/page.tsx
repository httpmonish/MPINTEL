"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CrossSchemeComparisonCard,
  CrossSchemeMapViewer,
  CrossSchemeImageViewer,
  CrossSchemeTimeline,
  CrossSchemeReviewDialog,
} from "@/components/cross-scheme";
import { getDeterministicCrossSchemeScenarios } from "@/lib/engine/cross-scheme";
import { CrossSchemeMatch, CrossSchemeDecisionState } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  ArrowLeft,
  Layers,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ShieldCheck,
  Building2,
  HardHat,
  Banknote,
  Navigation,
  Satellite,
  Info,
} from "lucide-react";

export default function CrossSchemeDetailPage() {
  const params = useParams();
  const matchIdParam = (params?.matchId as string) || "";
  const { matches: initialMatches } = getDeterministicCrossSchemeScenarios();

  const [matches, setMatches] = useState<CrossSchemeMatch[]>(initialMatches);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const match =
    matches.find((m) => m.matchId.toLowerCase() === matchIdParam.toLowerCase()) ||
    matches[0]; // Fallback to hero scenario A

  if (!match) {
    return (
      <DashboardShell>
        <div className="text-center py-16 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Match Record Not Found</h2>
          <p className="text-sm text-slate-500">
            Cross-scheme match identifier &apos;{matchIdParam}&apos; does not exist in registry.
          </p>
          <Link href="/cross-scheme" className="text-blue-600 font-semibold text-sm hover:underline">
            Return to Cross-Scheme Dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const { projectA, projectB } = match;

  const handleDecisionSubmit = (
    matchId: string,
    decision: CrossSchemeDecisionState,
    remarks: string,
    dispatchFieldInspection: boolean
  ) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.matchId === matchId) {
          return {
            ...m,
            status: dispatchFieldInspection ? "INSPECTION_DISPATCHED" : "REVIEW_RECORDED",
            decision: {
              reviewerId: "REV-DISTRICT-01",
              reviewerName: "District Planning Officer",
              reviewerRole: "Authorized Auditor",
              decision,
              remarks,
              decidedAt: new Date().toISOString(),
              dispatchedInspectionId: dispatchFieldInspection ? `INSP-DISPATCH-${Date.now().toString().slice(-4)}` : undefined,
            },
            auditTrail: [
              ...m.auditTrail,
              {
                action: `HUMAN_DECISION_${decision}`,
                performedBy: "District Planning Officer",
                timestamp: new Date().toISOString(),
                details: `Decision: ${decision}. Remarks: ${remarks}` + (dispatchFieldInspection ? " [Dispatched Field Re-inspection]" : ""),
              },
            ],
          };
        }
        return m;
      })
    );

    setToastMsg(`Investigation finding recorded for ${match.matchId}. Audit trail updated.`);
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/cross-scheme"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cross-Scheme Match Queue
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-mono font-semibold text-slate-700 bg-white">
              {match.matchId}
            </Badge>
            <DataSourceBadge type="synthetic" />
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Match Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="civic-eyebrow">CROSS-SCHEME CORROBORATION CASE</span>
              {match.isDemoScenario && (
                <Badge className="bg-indigo-600 text-white text-[9px] font-bold">
                  {match.demoScenarioTag}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              {projectA.schemeId} ({projectA.projectId}) ↔ {projectB.schemeId} ({projectB.projectId})
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-primary">
              {match.whyFlaggedSummary}
            </p>
          </div>

          {/* Similarity Metric Pill */}
          <div className="flex flex-col items-center sm:items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Cross-Scheme Similarity
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {match.similarityScore}
              </span>
              <span className="text-xs font-semibold text-slate-500">/ 100</span>
            </div>
            <Badge
              className={`text-[10px] font-bold px-2 py-0.5 ${
                match.priority === "URGENT_REVIEW"
                  ? "bg-red-700 text-white"
                  : match.priority === "HIGH_PRIORITY"
                  ? "bg-amber-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {match.priority.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Section 1: Side-by-Side Claim Record Comparison & Signal Matrix */}
        <CrossSchemeComparisonCard match={match} />

        {/* Section 2: GIS Map & Geodesic Proximity Overlay */}
        <CrossSchemeMapViewer match={match} />

        {/* Section 3: Visual Perceptual Hash (pHash) Image Comparison */}
        <CrossSchemeImageViewer match={match} />

        {/* Section 4: Execution Lifecycle & Temporal Overlap */}
        <CrossSchemeTimeline match={match} />

        {/* Section 5: Audit Trail & Recorded Investigation Decisions */}
        <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Immutable Statutory Audit Trail & Investigation Log
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                All algorithmic evaluations, human officer reviews, and dispatched inspections are cryptographically recorded.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8 px-3.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Record Official Decision
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {match.decision && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Recorded Statutory Finding: {match.decision.decision.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-mono">
                    {match.decision.decidedAt.slice(0, 10)}
                  </span>
                </div>
                <p className="text-emerald-900 font-primary">{match.decision.remarks}</p>
                <div className="flex items-center gap-4 text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/80">
                  <span>Reviewer: <span className="font-bold">{match.decision.reviewerName}</span> ({match.decision.reviewerRole})</span>
                  {match.decision.dispatchedInspectionId && (
                    <span className="font-mono font-bold text-blue-800">
                      Dispatched Field Inspection: {match.decision.dispatchedInspectionId}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {match.auditTrail.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{ev.action.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp.slice(0, 19).replace("T", " ")}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{ev.details}</p>
                    <span className="text-[10px] text-slate-400 block">By: {ev.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Human Review Modal */}
        <CrossSchemeReviewDialog
          isOpen={reviewModalOpen}
          match={match}
          onClose={() => setReviewModalOpen(false)}
          onSubmitDecision={handleDecisionSubmit}
        />
      </div>
    </DashboardShell>
  );
}
