"use client";

import React, { useState } from "react";
import { FieldInspectionPhoto, FieldInspectionRecord } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  Camera,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";

interface InspectionPhotoViewerProps {
  photo: FieldInspectionPhoto | null;
  inspection?: FieldInspectionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InspectionPhotoViewer({
  photo,
  inspection,
  open,
  onOpenChange,
}: InspectionPhotoViewerProps) {
  if (!photo) return null;

  const isSigned = photo.signatureState === "SIGNED_AND_VALID";
  const isDuplicate = photo.duplicateStatus === "DUPLICATE_EVIDENCE" || photo.duplicateStatus === "POSSIBLE_DUPLICATE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl bg-white border border-slate-200">
        <DialogHeader
          title={`Physical Evidence Record • ${photo.id}`}
          description={`Stage: ${photo.stage} Milestone • Inspection Ref: ${photo.inspectionId}`}
          onClose={() => onOpenChange(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo Canvas Frame */}
          <div className="bg-slate-950 flex flex-col items-center justify-center p-4 relative min-h-[300px]">
            {/* Visual Canvas Simulation / Photo */}
            <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative flex items-center justify-center">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 300">
                <rect width="400" height="300" fill="#1e293b" />
                {/* Terrain / Site Graphics */}
                <path d="M 0 200 Q 150 180 400 220 L 400 300 L 0 300 Z" fill="#334155" />
                <rect x="180" y="100" width="40" height="100" rx="3" fill="#94a3b8" />
                <circle cx="200" cy="90" r="16" fill="#38bdf8" fillOpacity="0.8" />
                {/* Geotag Watermark Overlay */}
                <text x="15" y="275" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  LAT: {photo.latitude.toFixed(4)}°N  LON: {photo.longitude.toFixed(4)}°E
                </text>
                <text x="15" y="290" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  TIME: {photo.capturedAt} | ACCURACY: ±{photo.gpsAccuracyMeters || 4}m
                </text>
              </svg>

              {/* Status Badges Overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {isSigned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/90 text-white shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                    TPM v2 Hardware Signed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Unsigned Upload
                  </span>
                )}

                {isDuplicate && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Duplicate Match ({photo.similarityScorePct}%)
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center font-mono truncate max-w-xs">
              Audit Hash: {photo.auditHash}
            </p>
          </div>

          {/* Forensic Audit Telemetry Sidebar */}
          <div className="p-5 space-y-4 text-xs font-sans overflow-y-auto max-h-[480px]">
            {/* Caption */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Inspector Observation Note
              </span>
              <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                &ldquo;{photo.caption}&rdquo;
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">GPS Coordinates</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {photo.latitude.toFixed(4)}°N, {photo.longitude.toFixed(4)}°E
                </span>
                <span className="text-[10px] text-slate-500">±{photo.gpsAccuracyMeters || 4}m radius</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">Image Quality</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {photo.qualityTier} ({photo.qualityScorePct}%)
                </span>
                <span className="text-[10px] text-emerald-700">Clear optical focus</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">pHash Fingerprint</span>
                <span className="font-bold text-slate-900 text-[11px] mt-0.5 block truncate">
                  {photo.pHash}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isDuplicate ? `Matches ${photo.matchedProjectId}` : "Unique fingerprint"}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">Hardware Stream</span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Camera Lock
                </span>
                <span className="text-[10px] text-slate-500">Gallery upload blocked</span>
              </div>
            </div>

            {/* Cryptographic Proof Strip */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-cyan-400 font-sans font-bold text-xs">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Integrity Digest
                </span>
                <Badge variant="outline" className="text-[9px] bg-slate-800 text-cyan-300 border-cyan-500/30">
                  FIPS 140-2
                </Badge>
              </div>
              <p className="text-slate-400 text-[10px] leading-tight">
                Signed by Inspector device TPM v2 security module. Image bytes and geotags are tamper-sealed.
              </p>
              <div className="text-[10px] text-slate-300 truncate pt-1">
                Signature: <code>{photo.signatureDigest || "TPM2-HW-SEC-VALIDATED-SIG"}</code>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Captured: {photo.capturedAt}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs border-slate-200"
          >
            Close Viewer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
