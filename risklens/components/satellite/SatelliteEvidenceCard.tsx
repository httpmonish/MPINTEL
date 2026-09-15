"use client";

import React, { useState } from "react";
import { SatelliteEvidence } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BeforeAfterSatelliteViewer } from "./BeforeAfterSatelliteViewer";
import { SatelliteMetadataDrawer } from "./SatelliteMetadataDrawer";
import {
  Satellite,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  SearchX,
  FileSearch,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface SatelliteEvidenceCardProps {
  evidence?: SatelliteEvidence;
  className?: string;
}

export function SatelliteEvidenceCard({
  evidence,
  className = "",
}: SatelliteEvidenceCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!evidence) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-slate-500" />
              Independent Satellite Verification (ISRO Bhuvan / Sentinel-2)
            </span>
            <Badge variant="secondary" className="text-slate-600 bg-slate-100 border-slate-200">
              — UNAVAILABLE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-slate-500 space-y-2">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-medium text-slate-700">Satellite Evidence Index Not Initialized</p>
          <p className="text-slate-500 max-w-md mx-auto">
            Remote sensing imagery has not yet been processed for this project coordinate. Under the Fairness Safeguard, unindexed coordinates receive zero negative score penalty.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (evidence.evidenceStatus) {
      case "CHANGE_DETECTED":
      case "VERIFIED_CONSISTENT":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Satellite Evidence Detected
          </span>
        );
      case "REQUIRES_REVIEW":
      case "PARTIAL_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Requires Verification
          </span>
        );
      case "NO_SIGNIFICANT_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            No Significant Change Detected
          </span>
        );
      case "LOW_QUALITY":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <CloudOff className="w-3.5 h-3.5 text-slate-500" />
            Low Quality (Cloud Cover)
          </span>
        );
      case "UNAVAILABLE":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            — Evidence Unavailable
          </span>
        );
    }
  };

  return (
    <>
      <Card className={`border-slate-200/80 shadow-2xs ${className}`}>
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-600" />
              <span>Independent Satellite Verification</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({evidence.provider})
              </span>
            </CardTitle>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="h-7 text-xs gap-1 border-slate-200 text-slate-700 hover:text-slate-900"
              >
                <FileSearch className="w-3.5 h-3.5 text-cyan-600" />
                View Evidence Details
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Evidence Confidence
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900">
                  {evidence.evidenceConfidence}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <span className="text-[10px] text-cyan-700 font-medium block">
                Independent Dimension
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Spatial Overlap
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900">
                  {(evidence.spatialOverlapScore * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-slate-500">in 100m AOI</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                {evidence.spatialOverlapScore >= 0.75
                  ? "High Consistency"
                  : evidence.spatialOverlapScore > 0
                  ? "Partial Overlap"
                  : "Zero Overlap"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Detected Change Footprint
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900">
                  {evidence.detectedAreaSqMeters.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">m²</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                Type: {evidence.detectedChangeType.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Cloud Coverage
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-slate-900">
                  {evidence.cloudCoveragePct}%
                </span>
                <span className="text-xs text-slate-500">pass quality</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                {evidence.cloudCoveragePct < 20
                  ? "Optimal Optical Pass"
                  : "Atmospheric Attenuation"}
              </span>
            </div>
          </div>

          {/* Side-by-Side Satellite Viewer */}
          <BeforeAfterSatelliteViewer evidence={evidence} />

          {/* Explanatory Narrative Box */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Independent Observation Summary:</strong> {evidence.notes}
              </p>
              <p className="text-[11px] text-slate-500">
                Data Source: <em>{evidence.imagerySource}</em>. Pipeline Hash: <code>{evidence.provenance.algorithmHash}</code>. Processed with zero impact on numerical Risk Score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SatelliteMetadataDrawer
        evidence={evidence}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
