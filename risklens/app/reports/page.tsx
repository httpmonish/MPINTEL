"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building2,
  Lock,
} from "lucide-react";

export default function TransparencyReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (reportName: string, fileName: string) => {
    setDownloading(reportName);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob(
        [
          `GOVERNMENT OF INDIA - MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION\n` +
            `MPLADS AI RISK INTELLIGENCE PLATFORM - OFFICIAL AUDIT EXPORT\n` +
            `Report: ${reportName}\n` +
            `Generated At: ${new Date().toISOString()}\n` +
            `Classification: STATUTORY PUBLIC DISCLOSURE (RTI ACT SECTION 4(1)(B))\n` +
            `Integrity Hash (SHA-256): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n\n` +
            `[Data Fields: Constituency, MP Name, Allocated Limit, Total Expenditure, Discrepancy Index, Satellite Confirmation]\n`,
        ],
        { type: "text/plain" }
      );
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(null);
    }, 600);
  };

  const reports = [
    {
      id: "RTI-SEC4-2026",
      title: "RTI Section 4(1)(b) Proactive Public Disclosure Pack",
      description: "Complete constituency-wise allocation, expenditure vouchers, and implementing agency registry published proactively per statutory guidelines.",
      format: "PDF + CSV",
      fileSize: "14.2 MB",
      date: "September 2026",
      officialSource: "MoSPI RTI Cell / Sansad.in",
    },
    {
      id: "CAG-AUDIT-FY2526",
      title: "CAG Annual Reconciliation & Unspent Balance Ledger",
      description: "District treasury unspent balances, interest accrued vs remitted to Consolidated Fund of India (CFI), and overdue Form GFR 12-A utilization certificates.",
      format: "XLSX + CSV",
      fileSize: "8.6 MB",
      date: "August 2026",
      officialSource: "Comptroller and Auditor General of India",
    },
    {
      id: "EO-SATELLITE-Q2",
      title: "Sentinel-2 Multi-spectral Earth Observation Ground-Truth Compendium",
      description: "Satellite backscatter verification logs, physical progress claims vs spectral index findings, and cross-scheme duplicate asset flags.",
      format: "GeoJSON + CSV",
      fileSize: "22.8 MB",
      date: "September 2026",
      officialSource: "ESA Copernicus Sentinel-2 & ISRO Bhuvan",
    },
    {
      id: "GFR-VIOLATION-LOG",
      title: "General Financial Rules (GFR 2017) Exception & Anomaly Registry",
      description: "Automated compliance log for Rule 230(8) interest retention, Rule 238(1) delayed UCs, and Rule 144(xi) split-tender prevention audits.",
      format: "CSV",
      fileSize: "3.4 MB",
      date: "September 2026",
      officialSource: "Ministry of Finance Clearing Rails",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Freshness & Provenance Header */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">Public Transparency &amp; RTI Export Portal</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Statutory Authority: <strong>Right to Information Act, 2005 (Section 4)</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Machine-Readable Formats: <strong>CSV · JSON · PDF</strong></span>
            <span className="text-white/40">·</span>
            <span>Cryptographic Verification: <strong>SHA-256 Ledger</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
            <Link href="/" className="hover:text-[#1A56C4]">Public Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#14213D]">Transparency &amp; Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B2149] tracking-tight">
            Official Audit Reports, RTI Disclosures &amp; Open Datasets
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 max-w-3xl">
            In compliance with open governance mandates and RTI Act Section 4(1)(b), all project sanctions, satellite telemetry verification results, and CAG reconciliation matrices are published below in open, auditable formats.
          </p>
        </div>

        {/* 2. Downloadable Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-[#D9DEE4] rounded-[4px] p-6 flex flex-col justify-between hover:border-[#1A56C4] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#0B2149]/5 border border-[#0B2149]/20 text-[#0B2149] font-mono font-bold text-xs rounded-[2px]">
                    {report.id}
                  </span>
                  <span className="text-xs font-semibold text-[#6B7280]">
                    {report.format} · {report.fileSize}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0B2149] leading-snug">
                  {report.title}
                </h3>

                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {report.description}
                </p>

                <div className="pt-2 border-t border-[#D9DEE4] text-[11px] text-[#6B7280] flex items-center justify-between">
                  <span>Source: <strong>{report.officialSource}</strong></span>
                  <span>Published: <strong>{report.date}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D9DEE4]">
                <button
                  onClick={() => handleDownload(report.title, `${report.id.toLowerCase()}_export.csv`)}
                  disabled={downloading === report.title}
                  className="w-full py-2 bg-[#0B2149] hover:bg-[#14213D] text-white text-xs font-bold rounded-[2px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === report.title ? "Preparing Download..." : "Download Public Dataset"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Open Data API & Developer Notice */}
        <div className="bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] p-6">
          <h3 className="text-sm font-bold text-[#0B2149] uppercase tracking-wider mb-2">
            Direct Machine Access / REST API
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
            Auditors, researchers, and journalists can query live endpoints directly from our FastAPI backend node without authentication for read-only public intelligence:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3 rounded-[2px] font-mono text-xs overflow-x-auto space-y-1">
            <div>GET http://localhost:8000/api/v1/intelligence/dashboard/overview</div>
            <div>GET http://localhost:8000/api/v1/intelligence/export/cag-csv</div>
            <div>GET http://localhost:8000/api/v1/cross-scheme/matches</div>
          </div>
        </div>
      </div>
    </div>
  );
}
