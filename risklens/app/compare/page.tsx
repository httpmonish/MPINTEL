"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ALL_MPS, MPRecord, getMpBySlug } from "@/lib/adapters/mp-dataset";
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const mp1Slug = searchParams.get("mp1") || ALL_MPS[0]?.slug;
  const mp2Slug = searchParams.get("mp2") || ALL_MPS[1]?.slug;

  const [selectedMp1, setSelectedMp1] = useState<string>(mp1Slug);
  const [selectedMp2, setSelectedMp2] = useState<string>(mp2Slug);

  const mp1 = useMemo(() => getMpBySlug(selectedMp1) || ALL_MPS[0], [selectedMp1]);
  const mp2 = useMemo(() => getMpBySlug(selectedMp2) || ALL_MPS[1], [selectedMp2]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Strip */}
      <div className="w-full bg-white border border-[#D9DEE4] p-3.5 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <Link href="/" className="hover:text-[#1A56C4]">Public Portal</Link>
          <span>›</span>
          <Link href="/mps" className="hover:text-[#1A56C4]">MP Directory</Link>
          <span>›</span>
          <span className="font-bold text-[#14213D]">Multi-MP Comparative Ledger</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#14213D] tabular-nums font-semibold">
          <span className="w-2 h-2 rounded-[2px] bg-[#0E6E6E]" />
          <span>Statutory Side-by-Side Assessment · MoSPI Verified Data</span>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white border border-[#D9DEE4] p-5 rounded-[4px] space-y-4">
        <h2 className="text-[20px] font-bold text-[#14213D]">Select Members of Parliament to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#6B7280] block mb-1">
              Member 1 (Primary)
            </label>
            <select
              value={selectedMp1}
              onChange={(e) => setSelectedMp1(e.target.value)}
              className="w-full h-11 px-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-sm font-bold focus:border-[#1A56C4] focus:outline-none"
            >
              {ALL_MPS.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name} ({m.constituency}, {m.state} - {m.house})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#6B7280] block mb-1">
              Member 2 (Comparative)
            </label>
            <select
              value={selectedMp2}
              onChange={(e) => setSelectedMp2(e.target.value)}
              className="w-full h-11 px-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-sm font-bold focus:border-[#1A56C4] focus:outline-none"
            >
              {ALL_MPS.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name} ({m.constituency}, {m.state} - {m.house})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MP 1 Column */}
        <div className="bg-white border border-[#D9DEE4] p-6 rounded-[4px] space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-[#D9DEE4]">
            <div className="w-14 h-14 rounded-[4px] bg-[#0B2149] text-white flex items-center justify-center font-bold text-lg shrink-0">
              {mp1.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tabular-nums block">{mp1.id}</span>
              <h3 className="text-[20px] font-bold text-[#14213D] leading-tight">{mp1.name}</h3>
              <p className="text-[13px] text-[#6B7280]">{mp1.constituency}, {mp1.state}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#E6F4F4] border border-[#0E6E6E] text-[#0E6E6E] font-bold text-[11px] rounded-[2px]">
                {mp1.house} · {mp1.term}
              </span>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="space-y-3 text-sm tabular-nums">
            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Total Allocation</span>
              <strong className="text-lg text-[#14213D]">₹{mp1.allocated_cr} Cr</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Disbursed Expenditure</span>
              <strong className="text-lg text-[#1E7B4D]">₹{mp1.disbursed_cr} Cr ({mp1.utilization_pct}%)</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Total Recommended Works</span>
              <strong className="text-lg text-[#14213D]">{mp1.total_works_recommended} works</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Certified Completed Works</span>
              <strong className="text-lg text-[#1E7B4D]">{mp1.works_completed} ({mp1.completion_rate_pct}%)</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Flagged / Delayed Works</span>
              <strong className="text-lg text-[#B3261E]">{mp1.works_delayed} works</strong>
            </div>
          </div>

          <Link
            href={`/mps/${mp1.slug}`}
            className="w-full py-2 bg-[#1A56C4] hover:bg-[#15469F] text-white text-[13px] font-bold rounded-[2px] text-center block transition-colors"
          >
            Open Full Dossier for {mp1.name} →
          </Link>
        </div>

        {/* MP 2 Column */}
        <div className="bg-white border border-[#D9DEE4] p-6 rounded-[4px] space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-[#D9DEE4]">
            <div className="w-14 h-14 rounded-[4px] bg-[#0B2149] text-white flex items-center justify-center font-bold text-lg shrink-0">
              {mp2.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tabular-nums block">{mp2.id}</span>
              <h3 className="text-[20px] font-bold text-[#14213D] leading-tight">{mp2.name}</h3>
              <p className="text-[13px] text-[#6B7280]">{mp2.constituency}, {mp2.state}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#FEF3D6] border border-[#B5750A] text-[#B5750A] font-bold text-[11px] rounded-[2px]">
                {mp2.house} · {mp2.term}
              </span>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="space-y-3 text-sm tabular-nums">
            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Total Allocation</span>
              <strong className="text-lg text-[#14213D]">₹{mp2.allocated_cr} Cr</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Disbursed Expenditure</span>
              <strong className="text-lg text-[#1E7B4D]">₹{mp2.disbursed_cr} Cr ({mp2.utilization_pct}%)</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Total Recommended Works</span>
              <strong className="text-lg text-[#14213D]">{mp2.total_works_recommended} works</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Certified Completed Works</span>
              <strong className="text-lg text-[#1E7B4D]">{mp2.works_completed} ({mp2.completion_rate_pct}%)</strong>
            </div>

            <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Flagged / Delayed Works</span>
              <strong className="text-lg text-[#B3261E]">{mp2.works_delayed} works</strong>
            </div>
          </div>

          <Link
            href={`/mps/${mp2.slug}`}
            className="w-full py-2 bg-[#1A56C4] hover:bg-[#15469F] text-white text-[13px] font-bold rounded-[2px] text-center block transition-colors"
          >
            Open Full Dossier for {mp2.name} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-slate-500">Loading Comparative Ledger...</div>}>
      <CompareContent />
    </Suspense>
  );
}
