"use client";

import React, { useState } from "react";
import { FieldInspectionRecord, FieldInspectionPhoto } from "@/lib/types";
import { InspectionPhotoViewer } from "./InspectionPhotoViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  RotateCcw,
  FileCheck,
} from "lucide-react";

interface FieldEvidenceTimelineProps {
  inspections: FieldInspectionRecord[];
  onReviewClick?: (inspection: FieldInspectionRecord) => void;
  onReinspectClick?: (inspection: FieldInspectionRecord) => void;
  className?: string;
}

export function FieldEvidenceTimeline({
  inspections,
  onReviewClick,
  onReinspectClick,
  className = "",
}: FieldEvidenceTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<FieldInspectionPhoto | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<FieldInspectionRecord | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handlePhotoClick = (photo: FieldInspectionPhoto, inspection: FieldInspectionRecord) => {
    setSelectedPhoto(photo);
    setSelectedInspection(inspection);
    setViewerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case "PARTIALLY_VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            <CheckCircle2 className="w-3 h-3 text-cyan-600" />
            Partially Verified
          </span>
        );
      case "EVIDENCE_CONFLICT":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Evidence Conflict
          </span>
        );
      case "REQUIRES_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Requires Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            {status}
          </span>
        );
    }
  };

  const getLocationBadge = (locStatus: string, dist?: number) => {
    if (locStatus === "WITHIN_RADIUS") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <MapPin className="w-3 h-3 text-emerald-600" />
          GPS Verified ({dist ? `${dist}m` : "in AOI"})
        </span>
      );
    }
    if (locStatus === "OUTSIDE_RADIUS") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          <MapPin className="w-3 h-3 text-amber-600" />
          GPS Mismatch ({dist ? `${dist}m` : "outside"})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
        GPS Unavailable
      </span>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Physical Inspection Evidence Timeline
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Chronological multi-stage field audits ({inspections.length} recorded milestones)
          </p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {inspections.map((insp, idx) => {
          const isLatest = idx === inspections.length - 1;
          const stageLabel =
            insp.stage === "BEFORE"
              ? "Baseline Pre-Sanction"
              : insp.stage === "DURING"
              ? "Milestone Construction"
              : "Completion & Handover";

          return (
            <div key={insp.inspectionId} className="relative space-y-3">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                  insp.status === "VERIFIED"
                    ? "border-emerald-600"
                    : insp.status === "EVIDENCE_CONFLICT"
                    ? "border-amber-600"
                    : "border-slate-400"
                }`}
              />

              {/* Milestone Card */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{stageLabel}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({insp.inspectionId})</span>
                      {getStatusBadge(insp.status)}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                      <span>Date: {insp.inspectionTimestamp?.slice(0, 10) || insp.scheduledDate}</span>
                      <span>Inspector: {insp.assignedInspector.name} ({insp.assignedInspector.badge})</span>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2">
                    {getLocationBadge(insp.locationStatus, insp.distanceToProjectMeters)}

                    {onReviewClick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviewClick(insp)}
                        className="h-6 text-[10px] px-2 bg-white border-slate-200 text-slate-700 hover:text-slate-900"
                      >
                        <FileCheck className="w-3 h-3 mr-1 text-slate-500" />
                        Audit Review
                      </Button>
                    )}
                  </div>
                </div>

                {/* Evidence Photos Grid */}
                {insp.photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                    {insp.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => handlePhotoClick(photo, insp)}
                        className="p-2 bg-white rounded-lg border border-slate-200 hover:border-cyan-500/80 cursor-pointer transition-all shadow-2xs group space-y-1.5"
                      >
                        <div className="aspect-16/10 bg-slate-900 rounded overflow-hidden relative flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 200 120">
                            <rect width="200" height="120" fill="#1e293b" />
                            <path d="M 0 80 Q 70 70 200 90 L 200 120 L 0 120 Z" fill="#334155" />
                            <rect x="90" y="40" width="20" height="50" fill="#94a3b8" />
                            <circle cx="100" cy="35" r="8" fill="#38bdf8" />
                          </svg>
                          <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/80 text-white font-mono px-1 rounded">
                            {photo.capturedAt.slice(11, 16)} UTC
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-[11px] font-medium text-slate-800 line-clamp-1 group-hover:text-cyan-700">
                            {photo.caption}
                          </p>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                            <span>pHash: {photo.pHash.slice(0, 6)}...</span>
                            <span className={photo.signatureState === "SIGNED_AND_VALID" ? "text-emerald-600 font-bold" : "text-slate-500"}>
                              {photo.signatureState === "SIGNED_AND_VALID" ? "TPM Signed" : "Unsigned"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No photographs uploaded for this milestone.</p>
                )}

                {/* Review Decision Banner if present */}
                {insp.reviewDecision && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">
                        Human Investigator Decision ({insp.reviewDecision.decision}):
                      </span>{" "}
                      {insp.reviewDecision.remarks}
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        Reviewed by {insp.reviewDecision.reviewer} on {insp.reviewDecision.reviewedAt.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Photo Modal */}
      <InspectionPhotoViewer
        photo={selectedPhoto}
        inspection={selectedInspection}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </div>
  );
}
