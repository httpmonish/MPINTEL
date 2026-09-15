"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function CitizenFeedbackPage() {
  const [projectId, setProjectId] = useState("");
  const [grievanceType, setGrievanceType] = useState("DELAYED_WORK");
  const [description, setDescription] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const ref = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceNumber(ref);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Freshness & Provenance Header */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">Citizen Feedback &amp; Physical Ground Verification Channel</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">CPGRAMS Integrated Portal</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Whistleblower Protection: <strong>Encrypted &amp; Anonymized</strong></span>
            <span className="text-white/40">·</span>
            <span>Response Mandate: <strong>14 Working Days</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
            <Link href="/" className="hover:text-[#1A56C4]">Public Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#14213D]">Feedback &amp; Grievance</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2149] tracking-tight">
            Submit Public Ground-Truth Observation or Grievance
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Citizens, resident associations, and RTI activists can report physical discrepancies, ghost assets, or delays directly into our risk triaging queue.
          </p>
        </div>

        {/* 2. Main Form or Confirmation */}
        {submitted ? (
          <div className="bg-white border border-[#4CAF50]/40 rounded-[4px] p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-[#EDF7EE] border border-[#4CAF50]/30 rounded-full flex items-center justify-center mx-auto text-[#1E4620]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0B2149]">
              Grievance Registered Successfully
            </h2>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Your report has been queued for AI risk triangulation against Sentinel-2 satellite imagery and forwarded to the District Nodal Officer.
            </p>
            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] inline-block font-mono text-xs font-bold text-[#0B2149]">
              Tracking Docket: {referenceNumber}
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setDescription("");
                  setProjectId("");
                }}
                className="px-4 py-2 bg-[#0B2149] text-white text-xs font-bold rounded-[2px] hover:bg-[#14213D] transition-colors"
              >
                Submit Another Observation
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#D9DEE4] rounded-[4px] p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0B2149] block mb-1">
                  Project ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PRJ-2024-001 or MPLADS Work ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0B2149] block mb-1">
                  Category of Observation <span className="text-[#B3261E]">*</span>
                </label>
                <select
                  value={grievanceType}
                  onChange={(e) => setGrievanceType(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none font-semibold"
                >
                  <option value="DELAYED_WORK">Prolonged Delay / Incomplete Construction</option>
                  <option value="GHOST_ASSET">Asset Claimed as Complete but Missing on Ground</option>
                  <option value="POOR_QUALITY">Sub-standard Materials / Structural Defects</option>
                  <option value="DUPLICATE_CLAIM">Identical Work Built under MGNREGA / Other Scheme</option>
                  <option value="GENERAL_FEEDBACK">General Citizen Inquiry / Commendation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0B2149] block mb-1">
                Detailed Ground Observation / Specific Coordinates <span className="text-[#B3261E]">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe the exact location, current physical state of the work, and any evidence you observed on site..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0B2149] block mb-1">
                  Your Name (Optional / Anonymous reporting allowed)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for anonymous submission"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0B2149] block mb-1">
                  Contact Email / Mobile (for CPGRAMS updates)
                </label>
                <input
                  type="text"
                  placeholder="citizen@gov.in or +91-98XXXXXXXX"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] text-xs text-[#6B7280] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0B2149]">
                <ShieldCheck className="w-4 h-4 text-[#0E6E6E]" />
                <span>Statutory Whistleblower Assurance</span>
              </div>
              <p>
                Observations submitted via this channel are encrypted and processed by our risk engine to verify whether physical claims align with satellite radar backscatter and treasury vouchers.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0B2149] hover:bg-[#14213D] text-white text-xs font-bold rounded-[2px] flex items-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verification Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
