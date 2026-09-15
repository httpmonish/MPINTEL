"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  getMpBySlug,
  getProjectsForMp,
  getMpFinancials,
  ALL_MPS,
} from "@/lib/adapters/mp-dataset";
import {
  Building2,
  MapPin,
  Calendar,
  Share2,
  GitCompare,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileText,
  ShieldCheck,
  TrendingUp,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function MPDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const mp = useMemo(() => getMpBySlug(slug), [slug]);

  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "financials">("projects");
  const [projectFilter, setProjectFilter] = useState<"ALL" | "Completed" | "In Progress" | "Upcoming" | "Delayed">("ALL");
  const [copied, setCopied] = useState(false);

  if (!mp) {
    return (
      <div className="bg-white border border-[#D9DEE4] p-12 text-center rounded-[4px] space-y-3">
        <h2 className="text-xl font-bold text-[#14213D]">Member of Parliament Not Found</h2>
        <p className="text-sm text-[#6B7280]">
          The MP slug &ldquo;{slug}&rdquo; does not match any member in the official 18th Lok Sabha or Rajya Sabha register.
        </p>
        <Link
          href="/mps"
          className="inline-block mt-2 px-4 py-2 bg-[#1A56C4] text-white text-xs font-bold rounded-[4px]"
        >
          ← Return to All MPs Directory
        </Link>
      </div>
    );
  }

  const { completed, in_progress, upcoming, delayed } = useMemo(() => getProjectsForMp(mp), [mp]);
  const financials = useMemo(() => getMpFinancials(mp), [mp]);

  const allProjectsList = useMemo(() => {
    return [...completed, ...in_progress, ...upcoming, ...delayed];
  }, [completed, in_progress, upcoming, delayed]);

  const displayedProjects = useMemo(() => {
    if (projectFilter === "ALL") return allProjectsList;
    if (projectFilter === "Completed") return completed;
    if (projectFilter === "In Progress") return in_progress;
    if (projectFilter === "Upcoming") return upcoming;
    if (projectFilter === "Delayed") return delayed;
    return allProjectsList;
  }, [projectFilter, allProjectsList, completed, in_progress, upcoming, delayed]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Strip */}
      <div className="w-full bg-white border border-[#D9DEE4] p-3.5 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-1.5 text-[#6B7280] flex-wrap">
          <Link href="/" className="hover:text-[#1A56C4]">Public Portal</Link>
          <span>›</span>
          <Link href="/mps" className="hover:text-[#1A56C4]">MP Directory</Link>
          <span>›</span>
          <span className="font-bold text-[#14213D]">{mp.name}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#14213D] tabular-nums font-semibold">
          <span className="w-2 h-2 rounded-[2px] bg-[#0E6E6E]" />
          <span>MoSPI Official Dataset ID: {mp.id} · {mp.term}</span>
        </div>
      </div>

      {/* Header Profile Dossier Card */}
      <div className="bg-white border border-[#D9DEE4] p-6 rounded-[4px] space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[#D9DEE4]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-[4px] bg-[#0B2149] text-white flex items-center justify-center font-bold text-xl shrink-0 border border-[#D9DEE4]">
              {mp.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] md:text-[28px] font-bold text-[#14213D] leading-tight">
                  {mp.name}
                </h1>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-[2px] uppercase border ${
                    mp.house === "Lok Sabha"
                      ? "bg-[#E6F4F4] border-[#0E6E6E] text-[#0E6E6E]"
                      : "bg-[#FEF3D6] border-[#B5750A] text-[#B5750A]"
                  }`}
                >
                  {mp.house}
                </span>
                <span className="px-2 py-0.5 bg-[#FAFAF9] border border-[#D9DEE4] text-[#14213D] text-[11px] font-semibold rounded-[2px]">
                  {mp.term}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[14px] text-[#6B7280]">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                <span className="font-semibold text-[#14213D]">{mp.constituency}</span>
                <span>·</span>
                <span>{mp.state}</span>
                <span>·</span>
                <span>Party: {mp.party}</span>
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white border border-[#D9DEE4] hover:bg-[#FAFAF9] text-[#14213D] text-[13px] font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
            <Link
              href={`/compare?mp1=${mp.slug}`}
              className="px-3 py-1.5 bg-white border border-[#D9DEE4] hover:bg-[#FAFAF9] text-[#14213D] text-[13px] font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              Compare MP
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-[#1A56C4] hover:bg-[#15469F] text-white text-[13px] font-bold rounded-[2px] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>

        {/* Big KPI Row (40px+ dominant numbers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAFAF9] border border-[#D9DEE4] p-4 rounded-[2px]">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Total Allocated</span>
            <div className="text-[36px] font-bold text-[#14213D] tabular-nums mt-1 leading-none">
              ₹{mp.allocated_cr} <span className="text-sm font-normal text-[#6B7280]">Cr</span>
            </div>
            <span className="text-[12px] text-[#6B7280] mt-1 block">Sanctioned Outlay Limit</span>
          </div>

          <div className="bg-[#FAFAF9] border border-[#D9DEE4] p-4 rounded-[2px]">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Fund Utilization</span>
            <div className="text-[36px] font-bold text-[#1E7B4D] tabular-nums mt-1 leading-none">
              {mp.utilization_pct}%
            </div>
            <span className="text-[12px] text-[#1E7B4D] mt-1 block font-semibold">₹{mp.disbursed_cr} Cr Disbursed</span>
          </div>

          <div className="bg-[#FAFAF9] border border-[#D9DEE4] p-4 rounded-[2px]">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Works Completed</span>
            <div className="text-[36px] font-bold text-[#14213D] tabular-nums mt-1 leading-none">
              {mp.works_completed} <span className="text-sm font-normal text-[#6B7280]">/ {mp.total_works_recommended}</span>
            </div>
            <span className="text-[12px] text-[#6B7280] mt-1 block">Total Recommended Works</span>
          </div>

          <div className="bg-[#FAFAF9] border border-[#D9DEE4] p-4 rounded-[2px]">
            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">Completion Rate</span>
            <div className="text-[36px] font-bold text-[#1A56C4] tabular-nums mt-1 leading-none">
              {mp.completion_rate_pct}%
            </div>
            <span className="text-[12px] text-[#1A56C4] mt-1 block font-semibold">Physical Delivery Rate</span>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-[#D9DEE4] gap-2 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 font-bold text-[14px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[#1A56C4] text-[#1A56C4]"
                : "border-transparent text-[#6B7280] hover:text-[#14213D]"
            }`}
          >
            <Building2 className="w-4 h-4" /> Overview &amp; Performance
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 px-4 font-bold text-[14px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "projects"
                ? "border-[#1A56C4] text-[#1A56C4]"
                : "border-transparent text-[#6B7280] hover:text-[#14213D]"
            }`}
          >
            <Layers className="w-4 h-4" /> Works &amp; Projects Directory ({allProjectsList.length})
          </button>
          <button
            onClick={() => setActiveTab("financials")}
            className={`pb-3 px-4 font-bold text-[14px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "financials"
                ? "border-[#1A56C4] text-[#1A56C4]"
                : "border-transparent text-[#6B7280] hover:text-[#14213D]"
            }`}
          >
            <FileText className="w-4 h-4" /> Financial Details &amp; PFMS
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white border border-[#D9DEE4] p-5 rounded-[4px] space-y-4">
            <h2 className="text-[18px] font-bold text-[#14213D]">Constituency Execution Summary</h2>
            <p className="text-[14px] text-[#6B7280] leading-relaxed">
              Under the Member of Parliament Local Area Development Scheme (MPLADS), <strong>{mp.name}</strong> has sanctioned and recommended a total of <strong>{mp.total_works_recommended} community assets</strong> across {mp.constituency}. As certified through the Ministry of Statistics &amp; Programme Implementation (MoSPI) and Public Financial Management System (PFMS) reconciliation ledger, <strong>{mp.works_completed} works</strong> have achieved certified completion.
            </p>

            {/* Performance Metric Bar Chart Mock */}
            <div className="p-4 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] space-y-3">
              <span className="text-[12px] font-bold text-[#6B7280] uppercase block">Asset Lifecycle Breakdown</span>
              <div className="grid grid-cols-4 gap-2 text-center tabular-nums text-sm">
                <div className="p-2.5 bg-white border border-[#D9DEE4] rounded-[2px]">
                  <span className="text-[10px] text-[#1E7B4D] font-bold uppercase block">COMPLETED</span>
                  <strong className="text-lg text-[#1E7B4D]">{completed.length}</strong>
                </div>
                <div className="p-2.5 bg-white border border-[#D9DEE4] rounded-[2px]">
                  <span className="text-[10px] text-[#B5750A] font-bold uppercase block">IN PROGRESS</span>
                  <strong className="text-lg text-[#B5750A]">{in_progress.length}</strong>
                </div>
                <div className="p-2.5 bg-white border border-[#D9DEE4] rounded-[2px]">
                  <span className="text-[10px] text-[#1A56C4] font-bold uppercase block">UPCOMING</span>
                  <strong className="text-lg text-[#1A56C4]">{upcoming.length}</strong>
                </div>
                <div className="p-2.5 bg-white border border-[#D9DEE4] rounded-[2px]">
                  <span className="text-[10px] text-[#B3261E] font-bold uppercase block">DELAYED</span>
                  <strong className="text-lg text-[#B3261E]">{delayed.length}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#D9DEE4] p-5 rounded-[4px] space-y-4">
            <h2 className="text-[18px] font-bold text-[#14213D]">Statutory Compliance</h2>
            <div className="space-y-3 text-[13px]">
              <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
                <span>GFR Rule 144 Pricing Compliance</span>
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#1E7B4D] font-bold rounded-[2px]">COMPLIANT</span>
              </div>
              <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
                <span>SC/ST Habitat Allocation Norms</span>
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#1E7B4D] font-bold rounded-[2px]">&gt;15% MET</span>
              </div>
              <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] flex items-center justify-between">
                <span>PFMS Disbursal Reconciliation</span>
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#1E7B4D] font-bold rounded-[2px]">100% SYNCED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS DIRECTORY (CRITICAL SECTION) */}
      {activeTab === "projects" && (
        <div className="bg-white border border-[#D9DEE4] p-6 rounded-[4px] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9DEE4]">
            <div>
              <h2 className="text-[20px] font-bold text-[#14213D]">All Works &amp; Projects Under {mp.name}</h2>
              <p className="text-[13px] text-[#6B7280]">
                Classified by real-time statutory execution and verification status
              </p>
            </div>

            {/* Filter Buttons for 4 Project Statuses */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setProjectFilter("ALL")}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] border ${
                  projectFilter === "ALL"
                    ? "bg-[#1A56C4] text-white border-[#1A56C4]"
                    : "bg-white text-[#14213D] border-[#D9DEE4] hover:bg-[#FAFAF9]"
                }`}
              >
                All ({allProjectsList.length})
              </button>
              <button
                onClick={() => setProjectFilter("Completed")}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] border ${
                  projectFilter === "Completed"
                    ? "bg-[#1E7B4D] text-white border-[#1E7B4D]"
                    : "bg-[#E8F5E9] text-[#1E7B4D] border-[#1E7B4D]/40 hover:bg-[#E8F5E9]/80"
                }`}
              >
                Completed ({completed.length})
              </button>
              <button
                onClick={() => setProjectFilter("In Progress")}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] border ${
                  projectFilter === "In Progress"
                    ? "bg-[#B5750A] text-white border-[#B5750A]"
                    : "bg-[#FEF3D6] text-[#B5750A] border-[#B5750A]/40 hover:bg-[#FEF3D6]/80"
                }`}
              >
                In Progress ({in_progress.length})
              </button>
              <button
                onClick={() => setProjectFilter("Upcoming")}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] border ${
                  projectFilter === "Upcoming"
                    ? "bg-[#1A56C4] text-white border-[#1A56C4]"
                    : "bg-[#E6F4F4] text-[#0E6E6E] border-[#0E6E6E]/40 hover:bg-[#E6F4F4]/80"
                }`}
              >
                Upcoming ({upcoming.length})
              </button>
              {delayed.length > 0 && (
                <button
                  onClick={() => setProjectFilter("Delayed")}
                  className={`px-3 py-1 text-xs font-bold rounded-[2px] border ${
                    projectFilter === "Delayed"
                      ? "bg-[#B3261E] text-white border-[#B3261E]"
                      : "bg-[#FDF2F2] text-[#B3261E] border-[#B3261E]/40 hover:bg-[#FDF2F2]/80"
                  }`}
                >
                  Delayed / Flagged ({delayed.length})
                </button>
              )}
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProjects.map((p) => {
              const isCompleted = p.status === "Completed";
              const isInProgress = p.status === "In Progress";
              const isUpcoming = p.status === "Upcoming";
              const isDelayed = p.status === "Delayed";

              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#D9DEE4] p-4 rounded-[4px] flex flex-col justify-between hover:border-[#1A56C4] transition-colors space-y-3"
                >
                  <div>
                    {/* Header ID & Status Pill */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE4] text-[12px]">
                      <span className="font-bold text-[#1A56C4] tabular-nums">{p.id}</span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-[#E8F5E9] border border-[#1E7B4D] text-[#1E7B4D] font-bold text-[11px] rounded-[2px] uppercase">
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="px-2 py-0.5 bg-[#FEF3D6] border border-[#B5750A] text-[#B5750A] font-bold text-[11px] rounded-[2px] uppercase">
                          In Progress
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2 py-0.5 bg-[#E6F4F4] border border-[#0E6E6E] text-[#0E6E6E] font-bold text-[11px] rounded-[2px] uppercase">
                          Upcoming / Pipeline
                        </span>
                      )}
                      {isDelayed && (
                        <span className="px-2 py-0.5 bg-[#FDF2F2] border border-[#B3261E] text-[#B3261E] font-bold text-[11px] rounded-[2px] uppercase">
                          Delayed / Attention Required
                        </span>
                      )}
                    </div>

                    {/* Title & Category */}
                    <div className="mt-2 space-y-1">
                      <h4 className="font-bold text-[15px] text-[#14213D] leading-snug">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <span>Category: <strong className="text-[#14213D]">{p.category}</strong></span>
                        <span>·</span>
                        <span>{p.location}</span>
                      </div>
                    </div>

                    {/* Financial Numbers */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] text-center tabular-nums text-xs">
                      <div>
                        <span className="text-[#6B7280] block text-[10px] uppercase font-bold">SANCTIONED</span>
                        <strong className="text-[#14213D] text-[13px]">₹{p.sanctioned_amount_lakh} Lakh</strong>
                      </div>
                      <div>
                        <span className="text-[#6B7280] block text-[10px] uppercase font-bold">DISBURSED</span>
                        <strong className="text-[#14213D] text-[13px]">₹{p.disbursed_amount_lakh} Lakh</strong>
                      </div>
                    </div>

                    {/* Risk / Flag Reason if delayed */}
                    {p.flag_reason && (
                      <div className="mt-2 p-2 bg-[#FDF2F2] border border-[#B3261E] text-[#B3261E] text-[11px] rounded-[2px] flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.flag_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Link */}
                  <div className="pt-2 border-t border-[#D9DEE4] flex items-center justify-between text-[12px]">
                    <span className="text-[#6B7280] tabular-nums">Sanction: {p.sanction_date}</span>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-[#1A56C4] hover:text-[#15469F] font-bold flex items-center gap-1"
                    >
                      Project Detail <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL DETAILS */}
      {activeTab === "financials" && (
        <div className="bg-white border border-[#D9DEE4] p-6 rounded-[4px] space-y-6">
          <div className="pb-4 border-b border-[#D9DEE4]">
            <h2 className="text-[20px] font-bold text-[#14213D]">Year-Wise Financial Disbursal Ledger</h2>
            <p className="text-[13px] text-[#6B7280]">
              Statutory accounting verified with Public Financial Management System (PFMS) records
            </p>
          </div>

          <div className="overflow-x-auto border border-[#D9DEE4] rounded-[2px]">
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="bg-[#FAFAF9] border-b border-[#D9DEE4] text-[13px] uppercase font-bold text-[#14213D]">
                <tr>
                  <th className="p-3">Financial Year</th>
                  <th className="p-3 text-right">Allocated Outlay</th>
                  <th className="p-3 text-right">Disbursed Expenditure</th>
                  <th className="p-3 text-right">Unspent Balance</th>
                  <th className="p-3 text-center">Utilization Rate</th>
                  <th className="p-3 text-center">PFMS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEE4] text-[14px]">
                {financials.map((f) => (
                  <tr key={f.financial_year} className="hover:bg-[#FAFAF9]">
                    <td className="p-3 font-bold text-[#14213D]">{f.financial_year}</td>
                    <td className="p-3 text-right font-semibold text-[#14213D]">₹{f.allocated_cr} Cr</td>
                    <td className="p-3 text-right font-bold text-[#1E7B4D]">₹{f.disbursed_cr} Cr</td>
                    <td className="p-3 text-right text-[#6B7280]">₹{f.unspent_cr} Cr</td>
                    <td className="p-3 text-center font-bold text-[#14213D]">{f.utilization_pct}%</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-[#E8F5E9] border border-[#1E7B4D] text-[#1E7B4D] text-[11px] font-bold rounded-[2px]">
                        {f.pfms_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] text-[12px] text-[#6B7280]">
            <strong>Accounting Guarantee:</strong> All fund disbursals adhere strictly to General Financial Rules (GFR 2017) Rule 130 and Ministry of Finance statutory accounting ceilings.
          </div>
        </div>
      )}
    </div>
  );
}
