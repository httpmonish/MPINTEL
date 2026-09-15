"use client";

import React, { useState } from "react";
import { SatelliteEvidence, SentinelSceneRecord } from "@/lib/types";
import { SentinelMapViewer } from "./SentinelMapViewer";
import { SentinelSceneSelector } from "./SentinelSceneSelector";
import { ChangeMaskOverlay } from "./ChangeMaskOverlay";
import { Layers, Calendar, Sparkles, Map, Table, Sliders } from "lucide-react";

interface BeforeAfterSatelliteViewerProps {
  evidence: SatelliteEvidence;
  className?: string;
}

export function BeforeAfterSatelliteViewer({
  evidence,
  className = "",
}: BeforeAfterSatelliteViewerProps) {
  const [activeTab, setActiveTab] = useState<"gis-map" | "scene-archive" | "multi-tile">("gis-map");
  const [selectedBeforeScene, setSelectedBeforeScene] = useState<SentinelSceneRecord | null>(null);
  const [selectedAfterScene, setSelectedAfterScene] = useState<SentinelSceneRecord | null>(null);
  const [viewMode, setViewMode] = useState<"side-by-side" | "diff" | "before" | "after">("side-by-side");

  const isUnavailable = evidence.evidenceStatus === "UNAVAILABLE";
  const isLowQuality = evidence.evidenceStatus === "LOW_QUALITY";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Subsystem Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600" />
          <span className="text-xs font-semibold text-slate-800">
            Observation Engine: {evidence.provider} ({evidence.imageResolutionMeters > 0 ? `${evidence.imageResolutionMeters}m GSD` : "10m L2A"})
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("gis-map")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === "gis-map"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Map className="w-3.5 h-3.5 text-cyan-600" />
            Interactive GIS Viewer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scene-archive")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === "scene-archive"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-slate-500" />
            Observation Passes & Selector
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("multi-tile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === "multi-tile"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Standard Multi-Tile
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive GIS Viewer (Map, Swipe, Layers, Coordinates) */}
      {activeTab === "gis-map" && (
        <SentinelMapViewer
          evidence={evidence}
          selectedBeforeScene={selectedBeforeScene}
          selectedAfterScene={selectedAfterScene}
          onSelectSceneClick={() => setActiveTab("scene-archive")}
        />
      )}

      {/* Tab 2: Sentinel-2 Scene Selector & Cloud Rejection Diagnostics */}
      {activeTab === "scene-archive" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-600">
            Select specific baseline (T0) and post-sanction (T1) Sentinel-2 observation passes to perform multi-temporal change extraction across project coordinates:
          </div>
          <SentinelSceneSelector
            projectId={evidence.projectId}
            latitude={evidence.latitude}
            longitude={evidence.longitude}
            selectedBeforeScene={selectedBeforeScene}
            selectedAfterScene={selectedAfterScene}
            onSelectBeforeScene={setSelectedBeforeScene}
            onSelectAfterScene={setSelectedAfterScene}
          />
        </div>
      )}

      {/* Tab 3: Standard Multi-Tile Surface View */}
      {activeTab === "multi-tile" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("side-by-side")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "side-by-side"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode("diff")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "diff"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Change Mask (NDBI)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("before")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "before"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                T0 Baseline
              </button>
              <button
                type="button"
                onClick={() => setViewMode("after")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "after"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                T1 Post-Work
              </button>
            </div>
          </div>

          {viewMode === "side-by-side" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Before: {evidence.beforeImage.acquisitionDate}
                  </span>
                  <span>{evidence.beforeImage.cloudCoveragePct}% cloud</span>
                </div>
                <ChangeMaskOverlay evidence={evidence} mode="before" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                    After: {evidence.afterImage.acquisitionDate}
                  </span>
                  <span>{evidence.afterImage.cloudCoveragePct}% cloud</span>
                </div>
                <ChangeMaskOverlay evidence={evidence} mode="after" />
              </div>
            </div>
          ) : viewMode === "diff" ? (
            <div className="max-w-xl mx-auto space-y-2">
              <ChangeMaskOverlay evidence={evidence} mode="diff" />
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Normalized Difference Built-up Index (NDBI) Surface Delta:</strong> {evidence.preprocessingMethod}. Change Score: <strong>{(evidence.changeScore * 100).toFixed(0)}%</strong>.
                </div>
              </div>
            </div>
          ) : viewMode === "before" ? (
            <div className="max-w-xl mx-auto space-y-2">
              <ChangeMaskOverlay evidence={evidence} mode="before" />
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-2">
              <ChangeMaskOverlay evidence={evidence} mode="after" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

