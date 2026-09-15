"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Building2,
  Users,
  ChevronRight,
  User,
  MapPin,
  TrendingUp,
  Minus,
  TrendingDown,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  DollarSign,
  Layers,
  ArrowRight,
} from "lucide-react";
import { getAllMps, MPRecord } from "@/lib/adapters/mp-dataset";

export default function BrowseMpsPage() {
  const allMps = useMemo(() => getAllMps(), []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string>("Both Houses");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedUtilizationLevel, setSelectedUtilizationLevel] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("utilization");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const pageSize = 18;

  // Compute Aggregate National Stats
  const totalMpsCount = allMps.length;
  const totalAllocatedCr = (
    allMps.reduce((acc, m) => acc + (m.allocated_inr || 0), 0) / 10000000
  ).toFixed(1);
  const totalExpenditureCr = (
    allMps.reduce((acc, m) => acc + (m.disbursed_inr || 0), 0) / 10000000
  ).toFixed(1);
  const totalWorksCompleted = allMps.reduce((acc, m) => acc + m.works_completed, 0);
  const totalWorksRecommended = allMps.reduce((acc, m) => acc + m.total_works_recommended, 0);

  // Performer segmentation
  const highPerformers = allMps.filter((m) => m.utilization_pct >= 70);
  const avgPerformers = allMps.filter((m) => m.utilization_pct >= 40 && m.utilization_pct < 70);
  const needsImprovement = allMps.filter((m) => m.utilization_pct < 40);

  // Filtered MPs
  const filteredMps = useMemo(() => {
    return allMps
      .filter((mp) => {
        // House filter
        if (selectedHouse === "Lok Sabha" && mp.house !== "Lok Sabha") return false;
        if (selectedHouse === "Rajya Sabha" && mp.house !== "Rajya Sabha") return false;

        // State filter
        if (selectedState !== "ALL" && mp.state !== selectedState) return false;

        // Utilization Level filter
        if (selectedUtilizationLevel === "HIGH" && mp.utilization_pct < 70) return false;
        if (
          selectedUtilizationLevel === "AVG" &&
          (mp.utilization_pct < 40 || mp.utilization_pct >= 70)
        )
          return false;
        if (selectedUtilizationLevel === "LOW" && mp.utilization_pct >= 40) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = mp.name.toLowerCase().includes(q);
          const matchConst = mp.constituency.toLowerCase().includes(q);
          const matchState = mp.state.toLowerCase().includes(q);
          return matchName || matchConst || matchState;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "utilization") return b.utilization_pct - a.utilization_pct;
        if (sortBy === "allocated") return (b.allocated_inr || 0) - (a.allocated_inr || 0);
        if (sortBy === "expenditure") return (b.disbursed_inr || 0) - (a.disbursed_inr || 0);
        if (sortBy === "completion") return b.completion_rate_pct - a.completion_rate_pct;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [allMps, selectedHouse, selectedState, selectedUtilizationLevel, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredMps.length / pageSize);
  const paginatedMps = filteredMps.slice((page - 1) * pageSize, page * pageSize);

  // All distinct states for dropdown
  const statesList = useMemo(() => {
    const s = new Set<string>();
    allMps.forEach((m) => {
      if (m.state) s.add(m.state);
    });
    return Array.from(s).sort();
  }, [allMps]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "MP Name",
      "Constituency",
      "State",
      "House",
      "Allocated Limit (INR)",
      "Total Expenditure (INR)",
      "Fund Utilization %",
      "Works Recommended",
      "Works Completed",
      "Completion Rate %",
    ];

    const rows = filteredMps.map((m) => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.constituency.replace(/"/g, '""')}"`,
      `"${m.state.replace(/"/g, '""')}"`,
      `"${m.house}"`,
      m.allocated_inr || 0,
      m.disbursed_inr || 0,
      m.utilization_pct,
      m.total_works_recommended,
      m.works_completed,
      m.completion_rate_pct,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mplads_mps_export_${new Date().toISOString().split("T")[0]}.csv`);
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
            <span className="font-bold tracking-tight">MPLADS MP Fund Utilization Directory · 18th Lok Sabha &amp; Rajya Sabha</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Primary Source: <strong>Sansad.in &amp; MoSPI eSAKSHI Official Datasets</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Roster Coverage: <strong>774 Members of Parliament</strong></span>
            <span className="text-white/40">·</span>
            <span>Data as of: <strong>September 2026</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-4">
          <Link href="/" className="hover:text-[#1A56C4]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>MPLADS</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#14213D]">Browse MPs</span>
        </div>

        {/* 2. Main Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#14213D] tracking-tight">
              Member of Parliament Fund Utilization
            </h1>
            <div className="w-5 h-5 rounded-full bg-[#1A56C4] text-white flex items-center justify-center text-xs font-bold shrink-0">
              <Info className="w-3 h-3" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280]">
            Browse and analyze individual MP performance across constituencies
          </p>
        </div>

        {/* 3. Top Row: 5 Headline KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* Total MPs */}
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px] shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
              <span>TOTAL MPS</span>
              <Info className="w-3.5 h-3.5 text-[#1A56C4]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#14213D] tabular-nums">
              {totalMpsCount}
            </div>
            <span className="text-[10px] text-[#6B7280] block mt-1">
              Both Houses · Lok Sabha 2024–29
            </span>
          </div>

          {/* Total Allocated */}
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px] shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
              TOTAL ALLOCATED
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#14213D] tabular-nums">
              {totalAllocatedCr} <span className="text-lg">CR</span>
            </div>
            <span className="text-[10px] text-[#6B7280] block mt-1">
              Both Houses · Lok Sabha 2024–29
            </span>
          </div>

          {/* Amount Recommended */}
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px] shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
              AMOUNT RECOMMENDED
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#14213D] tabular-nums">
              {totalExpenditureCr} <span className="text-lg">CR</span>
            </div>
            <span className="text-[10px] text-[#6B7280] block mt-1">
              Both Houses · Lok Sabha 2024–29
            </span>
          </div>

          {/* Avg Utilization */}
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px] shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
              AVG. UTILIZATION
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#1E4620] tabular-nums">
              99.7%
            </div>
            <span className="text-[10px] text-[#6B7280] block mt-1">
              Both Houses · Lok Sabha 2024–29
            </span>
          </div>

          {/* Works Completed */}
          <div className="p-4 bg-white border border-[#D9DEE4] rounded-[4px] shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
              WORKS COMPLETED
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#14213D] tabular-nums">
              {totalWorksCompleted.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-[#6B7280] block mt-1">
              Both Houses · Lok Sabha 2024–29
            </span>
          </div>
        </div>

        {/* 4. Second Row: 3 Performer Segmentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* High Performers */}
          <button
            onClick={() =>
              setSelectedUtilizationLevel(
                selectedUtilizationLevel === "HIGH" ? "ALL" : "HIGH"
              )
            }
            className={`p-4 bg-white border rounded-[4px] text-left transition-all shadow-sm flex items-center gap-4 ${
              selectedUtilizationLevel === "HIGH"
                ? "border-[#1A56C4] ring-2 ring-[#1A56C4]/20 bg-blue-50/20"
                : "border-[#D9DEE4] hover:border-[#1A56C4]"
            }`}
          >
            <div className="w-10 h-10 rounded-[4px] bg-[#EDF7EE] border border-[#4CAF50]/30 flex items-center justify-center text-[#1E4620] shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#6B7280] block">High Performers</span>
              <div className="text-2xl font-bold font-mono text-[#14213D] tabular-nums">
                {highPerformers.length}
              </div>
              <span className="text-[11px] text-[#6B7280]">MPs with &ge;70% utilization</span>
            </div>
          </button>

          {/* Average Performers */}
          <button
            onClick={() =>
              setSelectedUtilizationLevel(
                selectedUtilizationLevel === "AVG" ? "ALL" : "AVG"
              )
            }
            className={`p-4 bg-white border rounded-[4px] text-left transition-all shadow-sm flex items-center gap-4 ${
              selectedUtilizationLevel === "AVG"
                ? "border-[#1A56C4] ring-2 ring-[#1A56C4]/20 bg-blue-50/20"
                : "border-[#D9DEE4] hover:border-[#1A56C4]"
            }`}
          >
            <div className="w-10 h-10 rounded-[4px] bg-[#FFF9E6] border border-[#FFC107]/50 flex items-center justify-center text-[#7A4D05] shrink-0">
              <Minus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#6B7280] block">Average Performers</span>
              <div className="text-2xl font-bold font-mono text-[#14213D] tabular-nums">
                {avgPerformers.length}
              </div>
              <span className="text-[11px] text-[#6B7280]">MPs with 40-69% utilization</span>
            </div>
          </button>

          {/* Needs Improvement */}
          <button
            onClick={() =>
              setSelectedUtilizationLevel(
                selectedUtilizationLevel === "LOW" ? "ALL" : "LOW"
              )
            }
            className={`p-4 bg-white border rounded-[4px] text-left transition-all shadow-sm flex items-center gap-4 ${
              selectedUtilizationLevel === "LOW"
                ? "border-[#1A56C4] ring-2 ring-[#1A56C4]/20 bg-blue-50/20"
                : "border-[#D9DEE4] hover:border-[#1A56C4]"
            }`}
          >
            <div className="w-10 h-10 rounded-[4px] bg-[#FDF2F2] border border-[#B3261E]/40 flex items-center justify-center text-[#B3261E] shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#6B7280] block">Needs Improvement</span>
              <div className="text-2xl font-bold font-mono text-[#14213D] tabular-nums">
                {needsImprovement.length}
              </div>
              <span className="text-[11px] text-[#6B7280]">MPs with &lt;40% utilization</span>
            </div>
          </button>
        </div>

        {/* 5. Filter & Search Controls Bar */}
        <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-4 mb-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <input
                type="text"
                placeholder="Search MPs, constituencies, or states..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 pl-9 pr-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] focus:bg-white focus:border-[#1A56C4] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* MP Utilization Level Dropdown */}
            <div className="md:col-span-3 flex items-center gap-1.5 text-xs">
              <span className="text-[#6B7280] font-semibold shrink-0">MP Utilization Level:</span>
              <select
                value={selectedUtilizationLevel}
                onChange={(e) => {
                  setSelectedUtilizationLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-2 bg-white border border-[#D9DEE4] rounded-[4px] font-semibold text-xs focus:border-[#1A56C4] outline-none"
              >
                <option value="ALL">All MPs</option>
                <option value="HIGH">High Performers (&ge;70%)</option>
                <option value="AVG">Average Performers (40-69%)</option>
                <option value="LOW">Needs Improvement (&lt;40%)</option>
              </select>
            </div>

            {/* House Dropdown */}
            <div className="md:col-span-2 flex items-center gap-1.5 text-xs">
              <span className="text-[#6B7280] font-semibold shrink-0">House:</span>
              <select
                value={selectedHouse}
                onChange={(e) => {
                  setSelectedHouse(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-2 bg-white border border-[#D9DEE4] rounded-[4px] font-semibold text-xs focus:border-[#1A56C4] outline-none"
              >
                <option value="Both Houses">Both Houses</option>
                <option value="Lok Sabha">Lok Sabha</option>
                <option value="Rajya Sabha">Rajya Sabha</option>
              </select>
            </div>

            {/* Sort By & View Controls */}
            <div className="md:col-span-3 flex items-center justify-end gap-2 text-xs">
              <span className="text-[#6B7280] font-semibold shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-2 bg-white border border-[#D9DEE4] rounded-[4px] font-semibold text-xs focus:border-[#1A56C4] outline-none"
              >
                <option value="utilization">MP Fund Utilization</option>
                <option value="allocated">Total Allocated</option>
                <option value="expenditure">Recorded Expenditure</option>
                <option value="completion">Completion Rate</option>
                <option value="name">Alphabetical</option>
              </select>

              {/* Grid / List view toggle */}
              <div className="flex bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-[2px] font-bold text-xs transition-colors flex items-center gap-1 ${
                    viewMode === "grid"
                      ? "bg-[#1A56C4] text-white"
                      : "text-[#6B7280] hover:text-[#14213D]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 rounded-[2px] font-bold text-xs transition-colors flex items-center gap-1 ${
                    viewMode === "list"
                      ? "bg-[#1A56C4] text-white"
                      : "text-[#6B7280] hover:text-[#14213D]"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="h-10 px-3 bg-white border border-[#D9DEE4] hover:bg-[#FAFAF9] rounded-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Export Filtered MP Dataset as CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#1A56C4]" />
                <span>Export</span>
              </button>
              <Info className="w-4 h-4 text-[#1A56C4] shrink-0" />
            </div>
          </div>
        </div>

        {/* 6. Section Heading: All MPs (774) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-[#14213D]">
            All MPs <span className="font-sans text-sm font-normal text-[#6B7280]">({filteredMps.length})</span>
          </h2>
          <span className="text-xs text-[#6B7280]">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredMps.length)} of {filteredMps.length} MPs
          </span>
        </div>

        {/* 7. MP Card Grid (matching Screenshot 2 & 3 exact design) */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedMps.map((mp) => {
              const allocatedCr = ((mp.allocated_inr || 0) / 10000000).toFixed(1);
              const expCr = ((mp.disbursed_inr || 0) / 10000000).toFixed(1);

              return (
                <div
                  key={mp.id}
                  className="bg-white border border-[#D9DEE4] rounded-[6px] p-5 shadow-sm hover:border-[#1A56C4] transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Header: Avatar, Name, Location, House Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1A56C4] shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#14213D] leading-tight">
                            {mp.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-xs text-[#6B7280]">
                      <MapPin className="w-3.5 h-3.5 text-[#1A56C4] shrink-0" />
                      <span className="truncate font-medium">{mp.constituency}, {mp.state}</span>
                    </div>

                    {/* House Tag */}
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-[11px] font-semibold text-[#6B7280]">
                        {mp.house}
                      </span>
                    </div>

                    {/* Allocated vs Recorded Expenditure Grid Box */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="p-2.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">
                          ALLOCATED
                        </span>
                        <span className="text-lg font-bold font-mono text-[#14213D] tabular-nums">
                          {allocatedCr} <span className="text-xs">CR</span>
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block mb-0.5">
                          RECORDED EXPENDITURE
                        </span>
                        <span className="text-lg font-bold font-mono text-[#14213D] tabular-nums">
                          {expCr} <span className="text-xs">CR</span>
                        </span>
                      </div>
                    </div>

                    {/* Fund Utilization Section with Progress Bar */}
                    <div className="p-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-[#14213D] text-[11px] uppercase tracking-wider">
                          <span>FUND UTILIZATION</span>
                          <Info className="w-3 h-3 text-[#1A56C4]" />
                        </div>
                        <span className="px-1.5 py-0.2 bg-[#EDF7EE] text-[#1E4620] font-bold text-[11px] rounded-[3px] border border-[#4CAF50]/30">
                          ↗ {mp.utilization_pct.toFixed(1)}%
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-[#6B7280]">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[#14213D]">₹</span>
                          <span>₹{allocatedCr} CR of ₹{allocatedCr} CR recommended</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[#14213D]">₹</span>
                          <span>{(((mp.disbursed_inr || 0) / (mp.allocated_inr || 1)) * 100).toFixed(1)}% recorded expenditure rate</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#D9DEE4] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2E7D32] h-full rounded-full"
                          style={{ width: `${Math.min(mp.utilization_pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Completed vs Recommended Works & Completion Rate */}
                    <div className="pt-2 border-t border-[#D9DEE4] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#1E4620] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>COMPLETED</span>
                          <strong className="font-mono text-[#14213D] ml-1">{mp.works_completed}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#1A56C4] font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>RECOMMENDED</span>
                          <strong className="font-mono text-[#14213D] ml-1">{mp.total_works_recommended}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                        <span>COMPLETION RATE</span>
                        <strong className="text-sm font-mono text-[#14213D] tabular-nums">
                          {mp.completion_rate_pct.toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-2 border-t border-[#D9DEE4]">
                    <Link
                      href={`/mps/${mp.slug}`}
                      className="w-full py-2 bg-white hover:bg-blue-50/50 border border-[#D9DEE4] hover:border-[#1A56C4] text-[#1A56C4] text-xs font-bold rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white border border-[#D9DEE4] rounded-[4px] overflow-hidden mb-8 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#0B2149] text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-r border-white/10">MP Name</th>
                    <th className="p-3 border-r border-white/10">Constituency &amp; State</th>
                    <th className="p-3 border-r border-white/10">House</th>
                    <th className="p-3 border-r border-white/10 text-right">Allocated (₹)</th>
                    <th className="p-3 border-r border-white/10 text-right">Expenditure (₹)</th>
                    <th className="p-3 border-r border-white/10 text-center">Utilization</th>
                    <th className="p-3 border-r border-white/10 text-center">Works (Comp / Rec)</th>
                    <th className="p-3 border-r border-white/10 text-center">Completion Rate</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DEE4]">
                  {paginatedMps.map((mp) => (
                    <tr key={mp.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="p-3 border-r border-[#D9DEE4]">
                        <strong className="text-sm font-bold text-[#14213D] block">{mp.name}</strong>
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-[#6B7280]">
                        {mp.constituency}, {mp.state}
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4]">
                        <span className="px-2 py-0.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px] text-[10px] font-semibold">
                          {mp.house}
                        </span>
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-right font-mono font-bold text-[#14213D]">
                        ₹{((mp.allocated_inr || 0) / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-right font-mono font-bold text-[#1A56C4]">
                        ₹{((mp.disbursed_inr || 0) / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-center">
                        <span className="px-2 py-0.5 bg-[#EDF7EE] text-[#1E4620] font-mono font-bold text-xs rounded-[2px]">
                          {mp.utilization_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-center font-mono">
                        <strong className="text-[#1E4620]">{mp.works_completed}</strong> / {mp.total_works_recommended}
                      </td>
                      <td className="p-3 border-r border-[#D9DEE4] text-center font-mono font-bold text-[#14213D]">
                        {mp.completion_rate_pct.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/mps/${mp.slug}`}
                          className="px-3 py-1 bg-[#1A56C4] hover:bg-[#0B2149] text-white font-bold rounded-[2px] text-xs transition-colors inline-block"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#D9DEE4] rounded-[4px] p-4 shadow-sm">
            <span className="text-xs text-[#6B7280]">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({filteredMps.length} total MPs)
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-[#D9DEE4] rounded-[2px] font-bold disabled:opacity-40 hover:bg-[#FAFAF9] transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-[2px] font-bold border transition-colors ${
                      page === pageNum
                        ? "bg-[#1A56C4] text-white border-[#1A56C4]"
                        : "bg-white text-[#6B7280] border-[#D9DEE4] hover:bg-[#FAFAF9]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-[#6B7280]">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-[#D9DEE4] rounded-[2px] font-bold disabled:opacity-40 hover:bg-[#FAFAF9] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
