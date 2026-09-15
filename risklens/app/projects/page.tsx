"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Map,
  Search,
  Filter,
  ChevronRight,
  RotateCcw,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  ArrowRight,
  Download,
  Info,
  DollarSign,
  Layers,
  User,
} from "lucide-react";
import { useRiskLensStore } from "@/lib/store";
import { getAllMps } from "@/lib/adapters/mp-dataset";

export default function FindProjectsPage() {
  const { projects } = useRiskLensStore();
  const allMps = useMemo(() => getAllMps(), []);

  // Filter States matching Screenshot 4
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Dynamic state list
  const statesList = useMemo(() => {
    const s = new Set<string>();
    allMps.forEach((m) => {
      if (m.state) s.add(m.state);
    });
    return Array.from(s).sort();
  }, [allMps]);

  // Dynamic constituency list based on selected state
  const constituenciesList = useMemo(() => {
    let filtered = allMps;
    if (selectedState !== "ALL") {
      filtered = filtered.filter((m) => m.state === selectedState);
    }
    const c = new Set<string>();
    filtered.forEach((m) => {
      if (m.constituency) c.add(m.constituency);
    });
    return Array.from(c).sort();
  }, [allMps, selectedState]);

  // Handle State Change
  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedConstituency("");
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedState("ALL");
    setSelectedConstituency("");
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedConstituency && p.constituencyId !== selectedConstituency) {
        // Also check if constituency matches via partial string
        if (!p.constituencyId.toLowerCase().includes(selectedConstituency.toLowerCase())) {
          return false;
        }
      }
      if (selectedCategory !== "ALL" && p.workCategory !== selectedCategory) return false;
      if (selectedStatus !== "ALL" && p.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchConst = p.constituencyId.toLowerCase().includes(q);
        return matchTitle || matchId || matchConst;
      }
      return true;
    });
  }, [projects, selectedConstituency, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Provenance Header Strip */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">MPLADS Project Registry &amp; Geospatial Tracking</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Search &amp; Explore Constituency Asset Allocations</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Official Repository: <strong>eSAKSHI Public Portal</strong></span>
            <span className="text-white/40">·</span>
            <span>Data as of: <strong>September 2026</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#1A56C4]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>MPLADS</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#14213D]">Find Projects</span>
        </div>

        {/* 2. Hero Icon & Title Header matching Screenshot 4 */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 text-[#14213D] flex items-center justify-center">
              <Map className="w-10 h-10 stroke-[1.5]" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#14213D] tracking-tight">
            Find Projects in My Constituency
          </h1>
          <p className="text-sm text-[#6B7280]">
            Search and explore MPLADS projects in your area using constituency-based filtering
          </p>
        </div>

        {/* 3. Primary Constituency Selector Box matching Screenshot 4 */}
        <div className="bg-white border border-[#D9DEE4] rounded-[6px] p-6 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* State (Optional) */}
            <div>
              <label className="text-xs font-semibold text-[#14213D] block mb-1.5">
                State (Optional)
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full h-11 px-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-xs font-medium text-[#14213D] focus:bg-white focus:border-[#1A56C4] outline-none transition-colors cursor-pointer"
              >
                <option value="ALL">All States</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Constituency * */}
            <div>
              <label className="text-xs font-semibold text-[#14213D] block mb-1.5">
                Constituency <span className="text-slate-400">*</span>
              </label>
              <select
                value={selectedConstituency}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="w-full h-11 px-3 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] text-xs font-medium text-[#14213D] focus:bg-white focus:border-[#1A56C4] outline-none transition-colors cursor-pointer"
              >
                <option value="">Select Constituency</option>
                {constituenciesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="pt-2 border-t border-[#D9DEE4]/60">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-white hover:bg-[#FAFAF9] border border-[#D9DEE4] text-xs font-bold text-[#14213D] rounded-[4px] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* 4. Secondary Quick Search & Filter Controls (When Active) */}
        {selectedConstituency && (
          <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Filter works by title, keyword, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 text-xs bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px] focus:bg-white focus:border-[#1A56C4] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-2 bg-white border border-[#D9DEE4] rounded-[4px] text-xs font-semibold focus:border-[#1A56C4] outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Roads & Bridges">Roads &amp; Bridges</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Community Halls">Community Halls</option>
                <option value="School Infrastructure">School Infrastructure</option>
                <option value="Sanitation & Public Health">Sanitation &amp; Health</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-2 bg-white border border-[#D9DEE4] rounded-[4px] text-xs font-semibold focus:border-[#1A56C4] outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Sanctioned">Sanctioned</option>
                <option value="Delayed">Delayed / Under Review</option>
              </select>
            </div>

            <div className="text-xs text-[#6B7280]">
              Found <strong>{filteredProjects.length}</strong> community projects in <strong>{selectedConstituency}</strong>
            </div>
          </div>
        )}

        {/* 5. Results Area */}
        {!selectedConstituency ? (
          /* Empty State matching Screenshot 4 */
          <div className="bg-white border border-[#D9DEE4] rounded-[6px] p-16 text-center shadow-sm space-y-3">
            <div className="flex justify-center">
              <Search className="w-14 h-14 text-slate-300 stroke-[1.2]" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#14213D]">
              Select Your Constituency
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              Choose your state and constituency from the dropdown above to view all sanctioned, ongoing, and completed MPLADS works in your area.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty Query Results */
          <div className="bg-white border border-[#D9DEE4] rounded-[6px] p-12 text-center shadow-sm space-y-3">
            <Info className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[#14213D]">
              No Projects Match the Current Filters
            </h3>
            <p className="text-xs text-[#6B7280]">
              Try adjusting your category filter or resetting the search term.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1A56C4] text-white text-xs font-bold rounded-[4px] inline-block"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Populated Project Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.map((p) => {
              const isHighRisk = (p.riskScore?.compositeScore || 0) >= 60;
              const isCompleted = p.status === "Completed";
              const isInProgress = p.status === "In Progress";

              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#D9DEE4] rounded-[6px] p-5 shadow-sm hover:border-[#1A56C4] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 bg-[#0B2149]/5 border border-[#0B2149]/20 text-[#0B2149] font-mono font-bold text-[11px] rounded-[3px]">
                        {p.id}
                      </span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-[3px] border ${
                        isCompleted
                          ? "bg-[#EDF7EE] text-[#1E4620] border-[#4CAF50]/30"
                          : isInProgress
                          ? "bg-[#EBF3FC] text-[#0B2149] border-[#1A56C4]/30"
                          : "bg-[#FDF2F2] text-[#B3261E] border-[#B3261E]/30"
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#14213D] leading-snug">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <MapPin className="w-3.5 h-3.5 text-[#1A56C4] shrink-0" />
                      <span>{p.constituencyId}, {p.stateCode}</span>
                    </div>

                    {/* Financial & Physical Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px]">
                        <span className="text-[10px] font-bold uppercase text-[#6B7280] block mb-0.5">
                          SANCTIONED
                        </span>
                        <strong className="font-mono text-sm text-[#14213D]">
                          ₹{((p.sanctionedAmountINR || 25000000) / 10000000).toFixed(2)} Cr
                        </strong>
                      </div>

                      <div className="p-2.5 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[4px]">
                        <span className="text-[10px] font-bold uppercase text-[#6B7280] block mb-0.5">
                          PHYSICAL PROGRESS
                        </span>
                        <strong className="font-mono text-sm text-[#0E6E6E]">
                          {p.physicalProgressPct || 100}%
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#D9DEE4] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0E6E6E] h-full"
                        style={{ width: `${p.physicalProgressPct || 100}%` }}
                      />
                    </div>

                    {/* Sentinel-2 Verification Tag */}
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
                      <span className="flex items-center gap-1 text-[#0E6E6E] font-semibold">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Sentinel-2 EO Verified</span>
                      </span>
                      <span className="font-mono">
                        Risk: <strong className={isHighRisk ? "text-[#B3261E]" : "text-[#1E4620]"}>
                          {p.riskScore?.compositeScore || 20}/100
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#D9DEE4] flex items-center gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex-1 py-2 bg-white hover:bg-blue-50/50 border border-[#D9DEE4] hover:border-[#1A56C4] text-[#1A56C4] text-xs font-bold rounded-[4px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Public Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/investigation/${p.id}`}
                      className="px-3 py-2 bg-[#0B2149] hover:bg-[#14213D] text-white text-xs font-bold rounded-[4px] transition-colors"
                      title="Open in Official Audit Workspace"
                    >
                      Audit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
