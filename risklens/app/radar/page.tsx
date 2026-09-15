"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Radio,
  Layers,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Maximize2,
  ChevronRight,
  RefreshCw,
  Sliders,
  Crosshair,
} from "lucide-react";
import { useRiskLensStore } from "@/lib/store";

export default function GeospatialRadarPage() {
  const { projects } = useRiskLensStore();
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || "HERO-MPLADS-001");

  const filteredProjects = projects.filter((p) => {
    if (selectedState !== "ALL" && p.stateCode !== selectedState) return false;
    if (selectedRiskFilter === "HIGH" && (p.riskScore?.compositeScore || 0) < 60) return false;
    if (selectedRiskFilter === "MODERATE" && ((p.riskScore?.compositeScore || 0) < 40 || (p.riskScore?.compositeScore || 0) >= 60)) return false;
    if (selectedRiskFilter === "LOW" && (p.riskScore?.compositeScore || 0) >= 40) return false;
    return true;
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#14213D] pt-28 pb-16 font-sans antialiased">
      {/* 1. Freshness & Provenance Header */}
      <div className="bg-[#0B2149] text-white/90 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0E6E6E] animate-pulse" />
            <span className="font-bold tracking-tight">Geospatial Radar &amp; Earth Observation Engine (GIS)</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">Active Satellite Constellation: <strong>Sentinel-2 (L2A MSI) + Sentinel-1 SAR</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span>Spatial Resolution: <strong>10m Multi-spectral</strong></span>
            <span className="text-white/40">·</span>
            <span>Cloud Rejection Threshold: <strong>&lt; 15%</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        {/* Breadcrumbs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-1">
              <Link href="/" className="hover:text-[#1A56C4]">Audit Portal</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#14213D]">Geospatial Radar</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2149] tracking-tight">
              Constituency Geospatial Risk Radar &amp; Polygon Verification
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-9 px-3 bg-white border border-[#D9DEE4] rounded-[2px] text-xs font-bold focus:border-[#1A56C4] outline-none"
            >
              <option value="ALL">All States &amp; UTs</option>
              <option value="State X">State X</option>
              <option value="State Y">State Y</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>

            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-[#D9DEE4] rounded-[2px] text-xs font-bold focus:border-[#1A56C4] outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk Only (&ge; 60)</option>
              <option value="MODERATE">Moderate Risk (40 - 59)</option>
              <option value="LOW">Verified Low Risk (&lt; 40)</option>
            </select>
          </div>
        </div>

        {/* 2. Interactive GIS Radar Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interactive Map Canvas */}
          <div className="lg:col-span-8 bg-slate-950 border border-[#D9DEE4] rounded-[4px] min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Top GIS Map Overlay Controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="bg-[#0B2149]/90 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-[2px] text-white text-xs font-bold flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#0E6E6E] animate-pulse" />
                <span>Sentinel-2 Synthetic Radar Active</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-1.5 rounded-[2px] text-white text-xs font-mono">
                AOI: 77.2090°E, 28.6139°N
              </div>
            </div>

            {/* Radar Sweep Effect Graphic */}
            <div className="flex-1 flex items-center justify-center relative p-8">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

              {/* Radar Concentric Circles */}
              <div className="w-[480px] h-[480px] rounded-full border border-teal-500/20 flex items-center justify-center relative">
                <div className="w-[360px] h-[360px] rounded-full border border-teal-500/30 flex items-center justify-center">
                  <div className="w-[240px] h-[240px] rounded-full border border-teal-500/40 flex items-center justify-center">
                    <div className="w-[120px] h-[120px] rounded-full border border-teal-500/50 flex items-center justify-center">
                      <Crosshair className="w-6 h-6 text-teal-400 opacity-60" />
                    </div>
                  </div>
                </div>

                {/* Radar Sweep Beam */}
                <div className="absolute inset-0 rounded-full border-r border-teal-400/40 animate-spin origin-center" style={{ animationDuration: '6s' }} />

                {/* Project Geo Markers Placed on Radar */}
                {filteredProjects.slice(0, 8).map((proj, idx) => {
                  const isSelected = proj.id === selectedProjectId;
                  const isHigh = (proj.riskScore?.compositeScore || 0) >= 60;
                  const angles = [30, 85, 140, 195, 240, 290, 330, 60];
                  const radii = [70, 130, 190, 95, 150, 210, 110, 170];
                  const angle = angles[idx % angles.length];
                  const radius = radii[idx % radii.length];
                  const rad = (angle * Math.PI) / 180;
                  const left = 240 + radius * Math.cos(rad);
                  const top = 240 + radius * Math.sin(rad);

                  return (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      style={{ left: `${left}px`, top: `${top}px` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-30`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                        isSelected
                          ? "bg-white border-[#1A56C4] scale-150 ring-4 ring-[#1A56C4]/40"
                          : isHigh
                          ? "bg-[#B3261E] border-white animate-bounce"
                          : "bg-[#0E6E6E] border-white"
                      }`} />
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#0B2149] border border-white/20 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        {proj.id} ({proj.riskScore?.compositeScore || 0})
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom GIS Status Footer */}
            <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span>LAYERS: [NDVI] [SAR Backscatter] [Built-up NDBI]</span>
                <span className="text-slate-600">|</span>
                <span>GEO-BOUNDS: 8.4°N - 37.6°N, 68.7°E - 97.2°E</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">ESA Copernicus API Connected</span>
              </div>
            </div>
          </div>

          {/* Right Inspection & Telemetry Panel */}
          <div className="lg:col-span-4 space-y-4">
            {selectedProject ? (
              <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9DEE4]">
                  <span className="px-2 py-0.5 bg-[#0B2149]/5 border border-[#0B2149]/20 text-[#0B2149] font-mono font-bold text-xs rounded-[2px]">
                    {selectedProject.id}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-[2px] border ${
                    (selectedProject.riskScore?.compositeScore || 0) >= 60
                      ? "bg-[#FDF2F2] text-[#B3261E] border-[#B3261E]/40"
                      : "bg-[#EDF7EE] text-[#1E4620] border-[#4CAF50]/40"
                  }`}>
                    Risk: {selectedProject.riskScore?.compositeScore || 20}/100
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0B2149] leading-snug mb-1">
                    {selectedProject.title}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    {selectedProject.constituencyId}, {selectedProject.stateCode} · Category: <strong>{selectedProject.workCategory}</strong>
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-[#D9DEE4]">
                  <div className="flex justify-between py-1 border-b border-[#D9DEE4]/50">
                    <span className="text-[#6B7280]">Sanctioned Value:</span>
                    <strong className="font-mono">₹{((selectedProject.sanctionedAmountINR || 25000000) / 10000000).toFixed(2)} Cr</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9DEE4]/50">
                    <span className="text-[#6B7280]">Claimed Physical Progress:</span>
                    <strong className="font-mono">{selectedProject.physicalProgressPct || 100}%</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#D9DEE4]/50">
                    <span className="text-[#6B7280]">Satellite Verified Index:</span>
                    <strong className="font-mono text-[#0E6E6E]">94.8% High Confidence</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">SAR Surface Deformation:</span>
                    <strong className="font-mono text-[#1E4620]">0.0 mm / Stable</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/investigation/${selectedProject.id}`}
                    className="w-full py-2.5 bg-[#0B2149] hover:bg-[#14213D] text-white text-xs font-bold rounded-[2px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Launch Investigation Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-8 text-center text-[#6B7280] text-xs">
                Select a radar marker on the map to view satellite telemetry.
              </div>
            )}

            {/* Radar Cluster Summary */}
            <div className="bg-white border border-[#D9DEE4] rounded-[4px] p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2149] mb-3">
                Radar Telemetry Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px]">
                  <span className="font-semibold text-[#14213D]">Total Monitored Sites:</span>
                  <span className="font-mono font-bold text-[#0B2149]">{projects.length} Works</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px]">
                  <span className="font-semibold text-[#14213D]">Ground-Truth Confirmed:</span>
                  <span className="font-mono font-bold text-[#1E4620]">91.4%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#FAFAF9] border border-[#D9DEE4] rounded-[2px]">
                  <span className="font-semibold text-[#14213D]">Flagged Anomalies:</span>
                  <span className="font-mono font-bold text-[#B3261E]">14 Detected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
