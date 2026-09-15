"use client";

import React, { useState } from "react";
import { FieldInspectionRecord } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface HumanReviewDialogProps {
  inspection: FieldInspectionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitReview: (
    inspectionId: string,
    decision: "VERIFIED" | "PARTIALLY_VERIFIED" | "INSUFFICIENT_EVIDENCE" | "EVIDENCE_CONFLICT_CONFIRMED" | "REQUEST_REINSPECTION",
    remarks: string
  ) => void;
}

export function HumanReviewDialog({
  inspection,
  open,
  onOpenChange,
  onSubmitReview,
}: HumanReviewDialogProps) {
  const [decision, setDecision] = useState<
    "VERIFIED" | "PARTIALLY_VERIFIED" | "INSUFFICIENT_EVIDENCE" | "EVIDENCE_CONFLICT_CONFIRMED" | "REQUEST_REINSPECTION"
  >("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!inspection) return null;

  const handleSubmit = () => {
    if (!remarks.trim()) return;
    setSubmitting(true);
    onSubmitReview(inspection.inspectionId, decision, remarks);
    setSubmitting(false);
    onOpenChange(false);
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl bg-white border border-slate-200">
        <DialogHeader
          title={`Authorized Audit Review • ${inspection.inspectionId}`}
          description={`Project: ${inspection.projectId} • Inspector: ${inspection.assignedInspector.name}`}
          onClose={() => onOpenChange(false)}
        />

        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Inspection Summary Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold">Stage: {inspection.stage} Milestone</span>
              <span>GPS: {inspection.locationStatus} ({inspection.distanceToProjectMeters ? `${inspection.distanceToProjectMeters}m` : "N/A"})</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Photos Uploaded: {inspection.photos.length} • Current Status: <strong>{inspection.status}</strong>
            </div>
          </div>

          {/* Decision Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Select Official Review Decision
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision("VERIFIED")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  decision === "VERIFIED"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approve & Verify</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Evidence confirms physical work at sanctioned site.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDecision("PARTIALLY_VERIFIED")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  decision === "PARTIALLY_VERIFIED"
                    ? "bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Partially Verified</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Minor perimeter offset or supplementary checks pending.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDecision("REQUEST_REINSPECTION")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  decision === "REQUEST_REINSPECTION"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Request Re-Inspection</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Dispatches new linked inspection while preserving history.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDecision("EVIDENCE_CONFLICT_CONFIRMED")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  decision === "EVIDENCE_CONFLICT_CONFIRMED"
                    ? "bg-rose-50 border-rose-300 text-rose-900 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Confirm Conflict</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Material discrepancy in location or visual evidence.
                </p>
              </button>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Official Review Remarks & Audit Notes *
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter audit rationale, observed ground conditions, or specific re-inspection directives..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>
        </div>

        <DialogFooter className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs border-slate-200"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!remarks.trim() || submitting}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            Record Audit Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
