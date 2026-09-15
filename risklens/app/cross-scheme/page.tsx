"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CrossSchemeMatchCard,
  CrossSchemeReviewDialog,
} from "@/components/cross-scheme";
import { getDeterministicCrossSchemeScenarios } from "@/lib/engine/cross-scheme";
import { CrossSchemeMatch, CrossSchemeDecisionState } from "@/lib/types";
import {
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Search,
  Sparkles,
  RefreshCw,
  Navigation,
} from "lucide-react";

export default function CrossSchemeDashboardPage() {
  const { matches: initialMatches, analytics } = getDeterministicCrossSchemeScenarios();
  const [matches, setMatches] = useState<CrossSchemeMatch[]>(initialMatches);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMatchForReview, setSelectedMatchForReview] = useState<CrossSchemeMatch | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
              reviewerName: "District Planning Authority",
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
                performedBy: "District Planning Authority",
                timestamp: new Date().toISOString(),
                details: `Decision: ${decision}. Remarks: ${remarks}` + (dispatchFieldInspection ? " [Dispatched Field Re-inspection]" : ""),
              },
            ],
          };
        }
        return m;
      })
    );

    setToastMessage(`Investigation decision recorded for ${matchId}. Audit trail updated.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter matches based on active tab & search query
  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.matchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.projectA.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.projectB.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.projectA.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.projectB.projectId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "urgent") return m.priority === "URGENT_REVIEW";
    if (activeTab === "high") return m.similarityScore >= 80;
    if (activeTab === "phased") return m.assetLifecycle === "SAME_ASSET_DIFFERENT_WORK";
    if (activeTab === "independent") return m.assetLifecycle === "INDEPENDENT_ADJACENT_ASSETS";
    if (activeTab.startsWith("scenario_")) {
      return m.demoScenarioTag?.toLowerCase() === activeTab.toLowerCase();
    }
    return true;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              MULTI-SCHEME CROSS-VERIFICATION SUBSYSTEM (PHASE 3)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Multi-Scheme Cross-Verification & Asset De-duplication
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary max-w-3xl">
              Cross-verifying project claims, visual hashes, and physical footprints across <span className="font-semibold text-slate-800">MPLADS</span>, <span className="font-semibold text-slate-800">MGNREGA</span>, and <span className="font-semibold text-slate-800">PMGSY</span>. Detecting potential overlapping claims without declaring automatic wrongdoing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/graph">
              <Button variant="outline" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                Syndicate Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Matches</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{analytics.totalMatchedPairs}</div>
            <span className="text-[10px] text-slate-400">Indexed Scheme Pairs</span>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Potential Overlaps</span>
            <div className="text-2xl font-black text-amber-600 font-mono">{analytics.potentialOverlapsCount}</div>
            <span className="text-[10px] text-amber-600/80">Spatial Proximity &le; 150m</span>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">High Similarity</span>
            <div className="text-2xl font-black text-red-600 font-mono">{analytics.highSimilarityCount}</div>
            <span className="text-[10px] text-red-600/80">&ge; 80% Multi-Signal Score</span>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Requires Review</span>
            <div className="text-2xl font-black text-blue-600 font-mono">{analytics.requiresReviewCount}</div>
            <span className="text-[10px] text-blue-600/80">Awaiting Auditor Sign-off</span>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Shared Assets</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">{analytics.confirmedSharedAssetsCount}</div>
            <span className="text-[10px] text-emerald-600/80">Legitimate Phased Upgrades</span>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white shadow-2xs space-y-1">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Dispatched Insp.</span>
            <div className="text-2xl font-black text-purple-600 font-mono">{analytics.pendingInspectionsCount}</div>
            <span className="text-[10px] text-purple-600/80">Phase 2 Field Tasks</span>
          </Card>
        </div>

        {/* Analytics Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scheme Pair Distribution */}
          <Card className="border-slate-200/80 p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Scheme Pair Distribution
              </span>
              <span className="text-[10px] text-slate-500 font-mono">3 Active Schemes</span>
            </div>
            <div className="space-y-2.5">
              {analytics.schemePairDistribution.map((sp: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{sp.schemePair}</span>
                    <span className="font-mono text-slate-900">{sp.count} pairs ({sp.avgSimilarity}% avg)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(sp.count / 124) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="border-slate-200/80 p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Cross-Scheme Category Overlaps
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Taxonomy Alignment</span>
            </div>
            <div className="space-y-2">
              {analytics.categoryDistribution.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-600">{cat.category}</span>
                  <Badge variant="outline" className="font-mono text-[11px] font-bold text-slate-900">
                    {cat.count} works
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Geographic Hotspots */}
          <Card className="border-slate-200/80 p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-600" />
                District Hotspot Density
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Geodesic Clusters</span>
            </div>
            <div className="space-y-2">
              {analytics.hotspots.map((hot: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div>
                    <span className="font-bold text-slate-800">{hot.district}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{hot.state}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{hot.matchCount} matches</span>
                    <span className="text-[10px] text-red-600 block font-semibold">Max {hot.highestSimilarity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Demo Scenario Quick-Selector */}
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Phase 3 Deterministic Verification Demo Scenarios
              </h3>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Click to filter specific analytical scenarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              { id: "scenario_a", label: "Scenario A: High Overlap", sub: "MPLADS + MGNREGA Solar", badge: "Urgent Review" },
              { id: "scenario_b", label: "Scenario B: Phased Work", sub: "Community Hall Upgrade", badge: "Phased Dev" },
              { id: "scenario_c", label: "Scenario C: Common Contractor", sub: "Distant Roads (65km)", badge: "Clean" },
              { id: "scenario_d", label: "Scenario D: Co-located Works", sub: "Road + Drain Canal", badge: "Independent" },
              { id: "scenario_e", label: "Scenario E: Photo Reuse", sub: "pHash Water Tank Match", badge: "Shared Image" },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveTab(activeTab === sc.id ? "all" : sc.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  activeTab === sc.id
                    ? "bg-indigo-900 text-white border-indigo-900 shadow-xs"
                    : "bg-white text-slate-800 border-indigo-100 hover:border-indigo-300 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{sc.label}</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${activeTab === sc.id ? "text-indigo-200" : "text-slate-500"}`}>
                  {sc.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Cases" },
              { id: "urgent", label: "Urgent Review" },
              { id: "high", label: "High Similarity (≥80%)" },
              { id: "phased", label: "Phased Assets" },
              { id: "independent", label: "Co-located Works" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === f.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search match ID, title, or project..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Matches Grid List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <span className="font-bold text-slate-900">{filteredMatches.length}</span> cross-scheme candidate cases</span>
            {activeTab !== "all" && (
              <button onClick={() => setActiveTab("all")} className="text-blue-600 font-semibold hover:underline">
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredMatches.map((match) => (
              <CrossSchemeMatchCard
                key={match.matchId}
                match={match}
                onOpenReview={(m) => {
                  setSelectedMatchForReview(m);
                  setReviewModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Human Review Resolution Modal */}
        <CrossSchemeReviewDialog
          isOpen={reviewModalOpen}
          match={selectedMatchForReview}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedMatchForReview(null);
          }}
          onSubmitDecision={handleDecisionSubmit}
        />
      </div>
    </DashboardShell>
  );
}
