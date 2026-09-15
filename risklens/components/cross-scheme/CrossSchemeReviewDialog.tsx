"use client";

import React, { useState } from "react";
import { CrossSchemeMatch, CrossSchemeDecisionState } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileCheck, Navigation, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CrossSchemeReviewDialogProps {
  isOpen: boolean;
  match: CrossSchemeMatch | null;
  onClose: () => void;
  onSubmitDecision: (
    matchId: string,
    decision: CrossSchemeDecisionState,
    remarks: string,
    dispatchFieldInspection: boolean
  ) => void;
}

export const CrossSchemeReviewDialog: React.FC<CrossSchemeReviewDialogProps> = ({
  isOpen,
  match,
  onClose,
  onSubmitDecision,
}) => {
  const [decision, setDecision] = useState<CrossSchemeDecisionState>("NEEDS_FIELD_INSPECTION");
  const [remarks, setRemarks] = useState("");
  const [dispatchInspection, setDispatchInspection] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!match) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitDecision(match.matchId, decision, remarks, dispatchInspection);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const decisionOptions: Array<{
    value: CrossSchemeDecisionState;
    label: string;
    description: string;
    badgeColor: string;
  }> = [
    {
      value: "NEEDS_FIELD_INSPECTION",
      label: "Request Physical Field Inspection",
      description: "Dispatch an authorized field engineer to capture verified GPS coordinates and live photos.",
      badgeColor: "bg-blue-600 text-white",
    },
    {
      value: "CONFIRMED_SHARED_ASSET",
      label: "Confirmed Shared Physical Asset",
      description: "Evidence confirms multiple schemes funded the exact same physical asset.",
      badgeColor: "bg-red-600 text-white",
    },
    {
      value: "CONFIRMED_SEPARATE_ASSETS",
      label: "Confirmed Separate Adjacent Assets",
      description: "Physical records verify distinct independent works executed in proximity (e.g. Road + Drain).",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      value: "NEEDS_DOCUMENT_REVIEW",
      label: "Request Statutory Document Review",
      description: "Escalate to District Planning Officer for measurement book and voucher cross-verification.",
      badgeColor: "bg-amber-600 text-white",
    },
    {
      value: "FALSE_MATCH",
      label: "Mark as False Algorithmic Match",
      description: "Records represent unrelated works with incidental text or coordinate proximity.",
      badgeColor: "bg-slate-600 text-white",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-5">
        <DialogHeader
          title={`Cross-Scheme Investigation Decision — ${match.matchId}`}
          description={`Record statutory investigation finding for ${match.projectA.schemeId} vs ${match.projectB.schemeId}`}
          onClose={onClose}
        />

        {/* Match Context Quick Pill */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              {match.projectA.schemeId} ({match.projectA.projectId}) ↔ {match.projectB.schemeId} ({match.projectB.projectId})
            </span>
            <Badge className="bg-slate-900 text-white text-[10px] font-mono">
              {match.similarityScore}/100 Similarity
            </Badge>
          </div>
          <p className="text-slate-600">{match.whyFlaggedSummary}</p>
        </div>

        {/* Decision Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Investigation Finding
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {decisionOptions.map((opt) => (
              <label
                key={opt.value}
                onClick={() => setDecision(opt.value)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  decision === opt.value
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={decision === opt.value}
                  onChange={() => setDecision(opt.value)}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{opt.label}</span>
                  </div>
                  <p
                    className={`text-[11px] leading-snug ${
                      decision === opt.value ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dispatch Field Inspection Checkbox */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-blue-950">Dispatch Phase 2 Field Re-inspection</span>
              <p className="text-blue-800 text-[11px]">
                Automatically schedules a statutory on-site GPS and photo verification task for field engineers.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={dispatchInspection}
            onChange={(e) => setDispatchInspection(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Remarks Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">
            Investigation Remarks & Statutory Reference <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter case notes, evidentiary basis, or specific instructions for the assigned field officer..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !remarks.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            {isSubmitting ? "Recording..." : "Record Statutory Finding"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
