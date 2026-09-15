"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  Download,
  Search,
  Filter,
  Layers,
  Scale,
  Building2,
} from "lucide-react";

export default function ComplianceEnginePage() {
  const [activeRule, setActiveRule] = useState<string>("ALL");

  const rules = [
    {
      id: "RULE-230-8",
      ruleName: "GFR Rule 230(8)",
      title: "Mandatory Remittance of Accrued Bank Interest to CFI",
      summary: "All interest earned on MPLADS funds deposited in commercial bank accounts must be credited back to the Consolidated Fund of India, not retained by implementing agencies or districts.",
      compliantCount: 712,
      violationCount: 62,
      riskLevel: "CRITICAL",
    },
    {
      id: "RULE-238-1",
      ruleName: "GFR Rule 238(1)",
      title: "12-Month Statutory Utilization Certificate (Form GFR 12-A) Submission",
      summary: "Utilization Certificates must be furnished within 12 months of the closure of the financial year. No further grants may be released if prior UCs remain unsubmitted.",
      compliantCount: 689,
      violationCount: 85,
      riskLevel: "HIGH",
    },
    {
      id: "RULE-144-XI",
      ruleName: "GFR Rule 144(xi)",
      title: "Split-Tender & Fragmentation Prevention Protocol",
      summary: "Works must not be deliberately subdivided or fragmented into smaller contracts (< ₹50 Lakhs) to bypass mandatory e-procurement or competitive bidding thresholds.",
      compliantCount: 756,
      violationCount: 18,
      riskLevel: "HIGH",
    },
    {
      id: "MOSPI-75-DAY",
      ruleName: "MoSPI Para 3.12",
      title: "75-Day Mandatory District Collector Sanction Window",
      summary: "District Authorities must sanction eligible works recommended by Hon'ble MPs within 75 calendar days of receipt. Delays beyond 75 days require written statutory explanation.",
      compliantCount: 640,
      violationCount: 134,
      riskLevel: "MODERATE",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Freshness & Provenance Header */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">GFR 2017 Statutory Compliance Engine · Real-time Automated Audit</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Statutory Authority: <strong>Ministry of Finance (Dept of Expenditure)</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Validation Checks: <strong>4 Core Rules Active</strong></span>
            <span className="text-white/40">·</span>
            <span>Audited Records: <strong>774 Parliamentary Constituencies</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumbs & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
            <Link href="/" className="hover:text-[#1A56C4]">Audit Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#14213D]">Compliance Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2149] tracking-tight">
            Automated Statutory GFR 2017 &amp; MoSPI Guidelines Compliance Verifier
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-3xl">
            This module evaluates all MPLADS transaction rails and sanction orders against mandatory General Financial Rules (GFR 2017) to prevent treasury leakage and ensure strict fiduciary compliance.
          </p>
        </div>

        {/* 2. Core Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rules.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#D9DEE4] rounded-[4px] p-6 space-y-4 hover:border-[#1A56C4] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#0B2149] text-white font-mono font-bold text-xs rounded-[2px]">
                  {r.ruleName}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-[2px] border ${
                  r.riskLevel === "CRITICAL"
                    ? "bg-[#FDF2F2] text-[#B3261E] border-[#B3261E]/40"
                    : "bg-[#FFF9E6] text-[#7A4D05] border-[#FFC107]/50"
                }`}>
                  {r.riskLevel} AUDIT RULE
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0B2149] leading-snug">
                  {r.title}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  {r.summary}
                </p>
              </div>

              {/* Progress and Numbers */}
              <div className="pt-3 border-t border-[#D9DEE4] grid grid-cols-2 gap-4 text-xs">
                <div className="p-2.5 bg-[#EDF7EE] border border-[#4CAF50]/30 rounded-[2px]">
                  <span className="text-[#1E4620] font-semibold block mb-0.5">Compliant Units:</span>
                  <span className="font-mono font-bold text-base text-[#1E4620]">{r.compliantCount}</span>
                  <span className="text-[10px] text-[#1E4620] block">{((r.compliantCount / 774) * 100).toFixed(1)}% Compliance</span>
                </div>
                <div className="p-2.5 bg-[#FDF2F2] border border-[#B3261E]/30 rounded-[2px]">
                  <span className="text-[#B3261E] font-semibold block mb-0.5">Flagged Exceptions:</span>
                  <span className="font-mono font-bold text-base text-[#B3261E]">{r.violationCount}</span>
                  <span className="text-[10px] text-[#B3261E] block">Action Required</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Action Callout */}
        <div className="bg-[#0B2149] text-white rounded-[4px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-1">
              Automated Exception Dispatch to State Nodal Officers
            </h4>
            <p className="text-xs text-white/80 max-w-2xl">
              Statutory notice templates are auto-drafted and ready for dispatch to District Magistrates for the 62 flagged interest non-remittance cases.
            </p>
          </div>
          <Link
            href="/queue"
            className="px-4 py-2 bg-white text-[#0B2149] hover:bg-slate-100 text-xs font-bold rounded-[2px] transition-colors shrink-0"
          >
            Review Flagged Cases in Triage Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
