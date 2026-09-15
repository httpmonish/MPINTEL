"use client";

import React from "react";
import Link from "next/link";
import { CrossSchemeMatch } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import {
  Layers,
  MapPin,
  Image as ImageIcon,
  FileText,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface CrossSchemeMatchCardProps {
  match: CrossSchemeMatch;
  onOpenReview?: (match: CrossSchemeMatch) => void;
  onDispatchInspection?: (match: CrossSchemeMatch) => void;
}

export const CrossSchemeMatchCard: React.FC<CrossSchemeMatchCardProps> = ({
  match,
  onOpenReview,
  onDispatchInspection,
}) => {
  const {
    matchId,
    projectA,
    projectB,
    similarityScore,
    classification,
    priority,
    assetLifecycle,
    temporalRelationship,
    signals,
    distanceMeters,
    imageSimilarityPct,
    textSimilarityPct,
    status,
    isDemoScenario,
    demoScenarioTag,
  } = match;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT_REVIEW":
        return <Badge className="bg-red-700 text-white font-bold text-[10px] px-2 py-0.5">URGENT REVIEW</Badge>;
      case "HIGH_PRIORITY":
        return <Badge className="bg-amber-600 text-white font-semibold text-[10px] px-2 py-0.5">HIGH PRIORITY</Badge>;
      case "MEDIUM_PRIORITY":
        return <Badge className="bg-blue-600 text-white font-semibold text-[10px] px-2 py-0.5">MEDIUM PRIORITY</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 font-medium text-[10px] px-2 py-0.5">LOW PRIORITY</Badge>;
    }
  };

  const getLifecycleBadge = (lifecycle: string) => {
    switch (lifecycle) {
      case "SAME_ASSET_POTENTIAL_DUPLICATE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Potential Duplicate Claim
          </span>
        );
      case "SAME_ASSET_DIFFERENT_WORK":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <Layers className="w-3 h-3 text-blue-600" />
            Phased Work on Same Asset
          </span>
        );
      case "INDEPENDENT_ADJACENT_ASSETS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Co-located Independent Assets
          </span>
        );
      case "SHARED_CONTRACTOR_DIFFERENT_PROJECTS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
            Shared Contractor Entity
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-500 font-medium">Distinct Records</span>;
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden bg-white">
      {/* Top Banner */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-700 tracking-tight">{matchId}</span>
          {isDemoScenario && demoScenarioTag && (
            <Badge variant="outline" className="bg-indigo-50/80 text-indigo-700 border-indigo-200 text-[9px] font-semibold">
              DEMO {demoScenarioTag.replace("SCENARIO_", "CASE ")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getPriorityBadge(priority)}
          {getLifecycleBadge(assetLifecycle)}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Schemes Comparison Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/2 rounded-xl p-3 border border-slate-100">
          {/* Project A (Left) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {projectA.schemeId}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">{projectA.projectId}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{projectA.title}</h4>
            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span>{projectA.category}</span>
              <span className="font-semibold">{formatINR(projectA.sanctionedAmountINR)}</span>
            </div>
          </div>

          {/* Project B (Right) */}
          <div className="space-y-1 md:border-l md:border-slate-200/80 md:pl-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {projectB.schemeId}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">{projectB.projectId}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{projectB.title}</h4>
            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span>{projectB.category}</span>
              <span className="font-semibold">{formatINR(projectB.sanctionedAmountINR)}</span>
            </div>
          </div>
        </div>

        {/* Analytical Similarity Gauge & Signals */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {similarityScore}
            </span>
            <span className="text-xs font-medium text-slate-500">/ 100 Multi-Scheme Similarity</span>
          </div>

          {/* Quick Signal Pill Indicators */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                signals.geographicProximity.status === "MATCH"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : signals.geographicProximity.status === "PARTIAL"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
              title={`Distance: ${distanceMeters}m`}
            >
              <MapPin className="w-2.5 h-2.5" />
              {distanceMeters}m
            </span>

            {imageSimilarityPct !== undefined && imageSimilarityPct > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                  imageSimilarityPct > 80
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
                title={`pHash Visual Similarity: ${imageSimilarityPct}%`}
              >
                <ImageIcon className="w-2.5 h-2.5" />
                pHash {imageSimilarityPct}%
              </span>
            )}

            {textSimilarityPct !== undefined && textSimilarityPct > 0 && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border bg-slate-50 text-slate-700 border-slate-200"
                title={`Text overlap: ${textSimilarityPct}%`}
              >
                <FileText className="w-2.5 h-2.5" />
                Text {textSimilarityPct}%
              </span>
            )}

            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border bg-slate-50 text-slate-600 border-slate-200"
              title={`Timeline relationship: ${temporalRelationship}`}
            >
              <Calendar className="w-2.5 h-2.5" />
              {temporalRelationship.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Explainable Why Flagged Summary */}
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 font-primary">
          <span className="font-semibold text-slate-800">Analytical Context:</span> {match.whyFlaggedSummary}
        </p>
      </CardContent>

      <CardFooter className="bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-medium">Status:</span>
          <span className="font-bold text-slate-800">{status.replace("_", " ")}</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenReview(match)}
              className="text-xs h-8 px-3 border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold"
            >
              Review Case
            </Button>
          )}

          <Link href={`/cross-scheme/${matchId}`}>
            <Button size="sm" className="text-xs h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1">
              Investigate
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
