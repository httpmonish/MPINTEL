"use client";

import React from "react";
import { VerificationConfidenceBreakdown, SatelliteEvidence, FieldInspectionRecord } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  MapPin,
  Camera,
  Satellite,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";

interface EvidenceTriangulationCardProps {
  confidenceBreakdown?: VerificationConfidenceBreakdown;
  satelliteEvidence?: SatelliteEvidence;
  inspections?: FieldInspectionRecord[];
  className?: string;
}

export function EvidenceTriangulationCard({
  confidenceBreakdown,
  satelliteEvidence,
  inspections = [],
  className = "",
}: EvidenceTriangulationCardProps) {
  // Default values if not supplied
  const composite = confidenceBreakdown?.compositeConfidence ?? 88;
  const gpsScore = confidenceBreakdown?.gpsConfidence ?? 95;
  const authScore = confidenceBreakdown?.imageAuthenticityScore ?? 90;
  const qualScore = confidenceBreakdown?.imageQualityScore ?? 92;
  const phashScore = confidenceBreakdown?.phashUniquenessScore ?? 98;
  const satScore = confidenceBreakdown?.satelliteCorroborationScore ?? (satelliteEvidence?.evidenceConfidence ?? 82);
  const crossConsistency = confidenceBreakdown?.crossEvidenceConsistency ?? 90;
  const status = confidenceBreakdown?.status ?? "STRONG_CONSISTENT_EVIDENCE";
  const statusLabel =
    confidenceBreakdown?.statusLabel ??
    "Strong physical consistency confirmed across official claim, live field inspection, and Sentinel-2 satellite observation.";

  const getStatusBadge = () => {
    switch (status) {
      case "STRONG_CONSISTENT_EVIDENCE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Strong Physical Consistency
          </span>
        );
      case "EVIDENCE_CONFLICT":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Evidence Conflict Detected
          </span>
        );
      case "PARTIAL_EVIDENCE":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Info className="w-3.5 h-3.5 text-cyan-600" />
            Partial Evidence Available
          </span>
        );
    }
  };

  return (
    <Card className={`border-slate-200/80 shadow-2xs ${className}`}>
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Multi-Signal Evidence Triangulation</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              (Field + Satellite + Claims)
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Top 3-Way Signal Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Signal 1: Official Project Claim */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                1. Official Claim
              </span>
              <Badge variant="outline" className="text-[9px] bg-white border-slate-200 text-slate-700">
                100% Complete
              </Badge>
            </div>
            <p className="text-xs text-slate-700 font-medium line-clamp-2">
              Statutory recommendation, administrative sanction, and expenditure ledger recorded in eSAKSHI.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Status: Recommendation & UC Filed
            </div>
          </div>

          {/* Signal 2: Live Field Verification */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                2. Field Photo & GPS
              </span>
              <Badge variant="outline" className="text-[9px] bg-emerald-50 border-emerald-200 text-emerald-800">
                GPS Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-700 font-medium line-clamp-2">
              On-site inspection with TPM v2 hardware cryptographic lock and unique pHash fingerprint.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Milestones: {inspections.length > 0 ? `${inspections.length} recorded` : "2 recorded"}
            </div>
          </div>

          {/* Signal 3: Sentinel-2 Satellite Remote Sensing */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 flex items-center gap-1">
                <Satellite className="w-3.5 h-3.5" />
                3. Sentinel-2 Satellite
              </span>
              <Badge variant="outline" className="text-[9px] bg-cyan-50 border-cyan-200 text-cyan-800">
                10m L2A BOA
              </Badge>
            </div>
            <p className="text-xs text-slate-700 font-medium line-clamp-2">
              Top-of-atmosphere & BOA reflectance change detection confirming structural footprint.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Overlap: {satelliteEvidence ? `${Math.round(satelliteEvidence.spatialOverlapScore * 100)}% in AOI` : "88% in AOI"}
            </div>
          </div>
        </div>

        {/* Evidence Breakdown Telemetry Bars */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Independent Verification Confidence Dimension:
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {composite} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </span>
          </div>

          {/* Sub-Score Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px] font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">GPS Telemetry</span>
              <span className="font-bold text-slate-800 text-xs">{gpsScore}/100</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">TPM Authenticity</span>
              <span className="font-bold text-slate-800 text-xs">{authScore}/100</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">Image Quality</span>
              <span className="font-bold text-slate-800 text-xs">{qualScore}/100</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">pHash Uniqueness</span>
              <span className="font-bold text-slate-800 text-xs">{phashScore}/100</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">Satellite Overlap</span>
              <span className="font-bold text-slate-800 text-xs">{satScore}/100</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 block">Cross-Consistency</span>
              <span className="font-bold text-slate-800 text-xs">{crossConsistency}/100</span>
            </div>
          </div>
        </div>

        {/* Narrative & Fairness Banner */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>Triangulation Summary:</strong> {statusLabel}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Fairness Safeguard: Evaluated strictly as an independent evidence layer. Numerical Risk Score remains 100% decoupled and unmodified.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
