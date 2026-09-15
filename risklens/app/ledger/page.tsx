"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronRight,
  DollarSign,
  Building2,
  HelpCircle,
  Clock,
  ArrowDownRight,
} from "lucide-react";
import { useRiskLensStore } from "@/lib/store";

export default function CAGLedgerPage() {
  const [filterType, setFilterType] = useState<"ALL" | "UC_PENDING" | "INTEREST_UNREMITTED" | "RECONCILED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const ledgerEntries = [
    {
      id: "LED-UP-2024-001",
      district: "Varanasi",
      state: "Uttar Pradesh",
      mpName: "Narendra Modi",
      house: "Lok Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 238000000,
      unspentBalance: 12000000,
      interestAccrued: 485000,
      interestRemitted: 485000,
      pendingUCsCount: 0,
      status: "RECONCILED",
      gfrStatus: "GFR Rule 230(8) & 238(1) Satisfied",
    },
    {
      id: "LED-MH-2024-002",
      district: "Mumbai North",
      state: "Maharashtra",
      mpName: "Piyush Goyal",
      house: "Lok Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 215000000,
      unspentBalance: 35000000,
      interestAccrued: 620000,
      interestRemitted: 620000,
      pendingUCsCount: 1,
      status: "UC_PENDING",
      gfrStatus: "Rule 238(1) - 1 UC pending > 365 days",
    },
    {
      id: "LED-KR-2024-003",
      district: "Wayanad",
      state: "Kerala",
      mpName: "Rahul Gandhi",
      house: "Lok Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 242000000,
      unspentBalance: 8000000,
      interestAccrued: 310000,
      interestRemitted: 0,
      pendingUCsCount: 0,
      status: "INTEREST_UNREMITTED",
      gfrStatus: "Rule 230(8) - ₹3.10L Interest not remitted to CFI",
    },
    {
      id: "LED-TN-2024-004",
      district: "Chennai South",
      state: "Tamil Nadu",
      mpName: "Thamizhachi Thangapandian",
      house: "Lok Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 248000000,
      unspentBalance: 2000000,
      interestAccrued: 290000,
      interestRemitted: 290000,
      pendingUCsCount: 0,
      status: "RECONCILED",
      gfrStatus: "GFR 2017 Compliant",
    },
    {
      id: "LED-WB-2024-005",
      district: "Diamond Harbour",
      state: "West Bengal",
      mpName: "Abhishek Banerjee",
      house: "Lok Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 195000000,
      unspentBalance: 55000000,
      interestAccrued: 890000,
      interestRemitted: 450000,
      pendingUCsCount: 3,
      status: "UC_PENDING",
      gfrStatus: "Rule 238(1) - 3 UCs pending & partial interest retained",
    },
    {
      id: "LED-RS-2024-006",
      district: "Nodal Karnataka",
      state: "Karnataka",
      mpName: "Nirmala Sitharaman",
      house: "Rajya Sabha",
      sanctionedTotal: 250000000,
      disbursedTotal: 246000000,
      unspentBalance: 4000000,
      interestAccrued: 380000,
      interestRemitted: 380000,
      pendingUCsCount: 0,
      status: "RECONCILED",
      gfrStatus: "GFR 2017 Compliant",
    },
  ];

  const filteredEntries = ledgerEntries.filter((item) => {
    if (filterType !== "ALL" && item.status !== filterType) return false;
    if (
      searchTerm &&
      !item.district.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.mpName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.state.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Ledger ID,District,State,MP Name,House,Sanctioned (Rs),Disbursed (Rs),Unspent Balance (Rs),Interest Accrued (Rs),Interest Remitted (Rs),Pending UCs,Status,GFR Note\n" +
      ledgerEntries
        .map(
          (e) =>
            `"${e.id}","${e.district}","${e.state}","${e.mpName}","${e.house}",${e.sanctionedTotal},${e.disbursedTotal},${e.unspentBalance},${e.interestAccrued},${e.interestRemitted},${e.pendingUCsCount},"${e.status}","${e.gfrStatus}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cag_reconciliation_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Freshness & Provenance Header */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">CAG Reconciliation Ledger · MoSPI &amp; PFMS Clearing Rails</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Statutory Standard: <strong>General Financial Rules (GFR) 2017</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Primary Sources: <strong>PFMS Scheme 9201 + eSAKSHI</strong></span>
            <span className="text-white/40">·</span>
            <span>Audit Year: <strong>2024-2025 / 2025-2026</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
              <Link href="/" className="hover:text-[#1A56C4]">Audit Portal</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#14213D]">CAG Ledger</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2149] tracking-tight">
              Constituency Fund Reconciliation &amp; Statutory Utilization Ledger
            </h1>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#0B2149] hover:bg-[#14213D] text-white text-xs font-bold rounded-[2px] flex items-center gap-2 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAG Audit CSV</span>
          </button>
        </div>

        {/* 2. Headline Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
              Total Monitored Allocations
            </span>
            <span className="text-2xl font-bold font-mono text-[#0B2149] tabular-nums">
              ₹1,500.00 Cr
            </span>
            <span className="text-[10px] text-[#6B7280] block mt-1">Across 774 Parliamentary seats</span>
          </div>

          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
              Total Unspent District Balances
            </span>
            <span className="text-2xl font-bold font-mono text-[#7A4D05] tabular-nums">
              ₹116.00 Cr
            </span>
            <span className="text-[10px] text-[#6B7280] block mt-1">Held in nodal treasury accounts</span>
          </div>

          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
              Accrued Interest Remittance Rate
            </span>
            <span className="text-2xl font-bold font-mono text-[#0E6E6E] tabular-nums">
              88.4%
            </span>
            <span className="text-[10px] text-[#6B7280] block mt-1">Credited to CFI under Rule 230(8)</span>
          </div>

          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
              Pending Utilization Certificates
            </span>
            <span className="text-2xl font-bold font-mono text-[#B3261E] tabular-nums">
              4 Overdue
            </span>
            <span className="text-[10px] text-[#6B7280] block mt-1">Outstanding Form GFR 12-A</span>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search MP, District, or State..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] focus:bg-white focus:border-[#1A56C4] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-[2px] font-bold border transition-colors ${
                  filterType === "ALL"
                    ? "bg-[#0B2149] text-white border-[#0B2149]"
                    : "bg-white text-[#6B7280] border-[#D9DEE4] hover:bg-[#FAFAF9]"
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setFilterType("UC_PENDING")}
                className={`px-3 py-1.5 rounded-[2px] font-bold border transition-colors ${
                  filterType === "UC_PENDING"
                    ? "bg-[#0B2149] text-white border-[#0B2149]"
                    : "bg-white text-[#6B7280] border-[#D9DEE4] hover:bg-[#FAFAF9]"
                }`}
              >
                UC Overdue
              </button>
              <button
                onClick={() => setFilterType("INTEREST_UNREMITTED")}
                className={`px-3 py-1.5 rounded-[2px] font-bold border transition-colors ${
                  filterType === "INTEREST_UNREMITTED"
                    ? "bg-[#0B2149] text-white border-[#0B2149]"
                    : "bg-white text-[#6B7280] border-[#D9DEE4] hover:bg-[#FAFAF9]"
                }`}
              >
                Interest Retained
              </button>
            </div>
          </div>

          <div className="text-xs text-[#6B7280] font-mono">
            Showing <strong>{filteredEntries.length}</strong> of <strong>{ledgerEntries.length}</strong> audit entries
          </div>
        </div>

        {/* 4. Ledger Data Table */}
        <div className="bg-white border border-[#D9DEE4] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#0B2149] text-white font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-r border-white/10">Ledger ID &amp; Constituency</th>
                  <th className="p-3 border-r border-white/10">Hon&apos;ble MP &amp; House</th>
                  <th className="p-3 border-r border-white/10 text-right">Sanctioned (₹)</th>
                  <th className="p-3 border-r border-white/10 text-right">Disbursed (₹)</th>
                  <th className="p-3 border-r border-white/10 text-right">Unspent Balance</th>
                  <th className="p-3 border-r border-white/10 text-right">Interest Accrued / Remitted</th>
                  <th className="p-3 border-r border-white/10 text-center">Pending UCs</th>
                  <th className="p-3">Statutory GFR Audit Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DEE4]">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="p-3 border-r border-[#D9DEE4]">
                      <span className="font-mono font-bold text-[#0B2149] block">{entry.id}</span>
                      <span className="text-[#6B7280]">{entry.district}, {entry.state}</span>
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4]">
                      <strong className="text-[#14213D] block">{entry.mpName}</strong>
                      <span className="text-[10px] text-[#6B7280] uppercase">{entry.house}</span>
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4] text-right font-mono font-bold text-[#0B2149]">
                      ₹{(entry.sanctionedTotal / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4] text-right font-mono font-bold text-[#1A56C4]">
                      ₹{(entry.disbursedTotal / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4] text-right font-mono font-bold text-[#7A4D05]">
                      ₹{(entry.unspentBalance / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4] text-right font-mono">
                      <div>₹{(entry.interestAccrued / 100000).toFixed(2)}L Accrued</div>
                      <div className={entry.interestRemitted < entry.interestAccrued ? "text-[#B3261E] font-bold" : "text-[#1E4620]"}>
                        ₹{(entry.interestRemitted / 100000).toFixed(2)}L Remitted
                      </div>
                    </td>
                    <td className="p-3 border-r border-[#D9DEE4] text-center">
                      <span className={`px-2 py-0.5 font-mono font-bold rounded-[2px] ${
                        entry.pendingUCsCount > 0 ? "bg-[#FDF2F2] text-[#B3261E]" : "bg-[#EDF7EE] text-[#1E4620]"
                      }`}>
                        {entry.pendingUCsCount}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-[2px] border ${
                        entry.status === "RECONCILED"
                          ? "bg-[#EDF7EE] text-[#1E4620] border-[#4CAF50]/30"
                          : "bg-[#FDF2F2] text-[#B3261E] border-[#B3261E]/30"
                      }`}>
                        {entry.gfrStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
