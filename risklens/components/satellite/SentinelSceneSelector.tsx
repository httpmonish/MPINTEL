"use client";

import React, { useState, useEffect } from "react";
import { SentinelSceneRecord, SentinelSceneSearchResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  Filter,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SentinelSceneSelectorProps {
  projectId: string;
  latitude: number;
  longitude: number;
  selectedBeforeScene: SentinelSceneRecord | null;
  selectedAfterScene: SentinelSceneRecord | null;
  onSelectBeforeScene: (scene: SentinelSceneRecord) => void;
  onSelectAfterScene: (scene: SentinelSceneRecord) => void;
  className?: string;
}

export function SentinelSceneSelector({
  projectId,
  latitude,
  longitude,
  selectedBeforeScene,
  selectedAfterScene,
  onSelectBeforeScene,
  onSelectAfterScene,
  className = "",
}: SentinelSceneSelectorProps) {
  const [scenes, setScenes] = useState<SentinelSceneRecord[]>([]);
  const [latestSuitable, setLatestSuitable] = useState<SentinelSceneRecord | null>(null);
  const [rejectedNewer, setRejectedNewer] = useState<SentinelSceneRecord[]>([]);
  const [mode, setMode] = useState<"REAL_SATELLITE_API" | "DEMO_SATELLITE_DATA">("DEMO_SATELLITE_DATA");
  const [loading, setLoading] = useState<boolean>(true);
  const [maxCloudFilter, setMaxCloudFilter] = useState<number>(30); // 10, 20, 30, 60
  const [forceDemo, setForceDemo] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<"latest" | "pre" | "post" | "all">("all");

  const fetchScenes = async (demo: boolean, cloudLimit: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "scenes",
        projectId,
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: "100",
        maxCloud: cloudLimit.toString(),
        forceDemo: demo ? "true" : "false",
      });
      const res = await fetch(`/api/satellite?${params.toString()}`);
      if (res.ok) {
        const data: SentinelSceneSearchResponse = await res.json();
        setScenes(data.scenes || []);
        setLatestSuitable(data.latestSuitableScene || null);
        setRejectedNewer(data.rejectedNewerScenes || []);
        setMode(data.mode);

        // Auto-select latest suitable if after scene not set
        if (!selectedAfterScene && data.latestSuitableScene) {
          onSelectAfterScene(data.latestSuitableScene);
        }
        if (!selectedBeforeScene && data.scenes.length > 0) {
          const preScene = [...data.scenes].reverse().find((s) => s.isSuitable) || data.scenes[data.scenes.length - 1];
          if (preScene) onSelectBeforeScene(preScene);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes(forceDemo, maxCloudFilter);
  }, [projectId, latitude, longitude, forceDemo, maxCloudFilter]);

  const getQualityBadge = (scene: SentinelSceneRecord) => {
    if (!scene.isSuitable) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
          <CloudOff className="w-3 h-3 text-slate-500" />
          Cloud Exceeded ({scene.cloudCoveragePct}%)
        </span>
      );
    }
    if (scene.qualityTier === "OPTIMAL") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Optimal (&lt;15% cloud)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Usable ({scene.cloudCoveragePct}% cloud)
      </span>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Strip & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Cloud Filter & Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Max Cloud:
          </span>
          <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-xs">
            {[10, 20, 30, 60].map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setMaxCloudFilter(limit)}
                className={`px-2 py-0.5 rounded font-medium ${
                  maxCloudFilter === limit
                    ? "bg-cyan-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                &le;{limit}%
              </button>
            ))}
          </div>

          <div className="border-l border-slate-200 pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForceDemo(!forceDemo)}
              className="h-7 text-xs border-slate-200"
            >
              {forceDemo ? "Switch to Live API Mode" : "Switch to Demo Mode"}
            </Button>
          </div>
        </div>

        {/* Mode Tag */}
        <div className="flex items-center gap-2">
          {mode === "REAL_SATELLITE_API" ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              REAL SENTINEL-2 API MODE
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              DEMO SATELLITE DATA MODE
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchScenes(forceDemo, maxCloudFilter)}
            disabled={loading}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Cloud Rejection Diagnostic Banner */}
      {rejectedNewer.length > 0 && latestSuitable && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Atmospheric Filtering Applied: Newer Scene Rejected
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Observation on <strong>{rejectedNewer[0].acquisitionDate}</strong> was rejected due to excessive cloud coverage (<strong>{rejectedNewer[0].cloudCoveragePct}%</strong>). Under institutional quality protocols, the system automatically selected the latest suitable observation on <strong>{latestSuitable.acquisitionDate}</strong> ({latestSuitable.cloudCoveragePct}% cloud).
            </p>
          </div>
        </div>
      )}

      {/* Observation Passes Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Acquisition Date & Time (UTC)</th>
                <th className="py-2.5 px-3">Orbit Pass</th>
                <th className="py-2.5 px-3">Cloud Coverage</th>
                <th className="py-2.5 px-3">Quality Tier</th>
                <th className="py-2.5 px-3 text-right">Observation Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {scenes.map((scene) => {
                const isSelectedBefore = selectedBeforeScene?.sceneId === scene.sceneId;
                const isSelectedAfter = selectedAfterScene?.sceneId === scene.sceneId;
                const isLatestSuitablePass = latestSuitable?.sceneId === scene.sceneId;

                return (
                  <tr
                    key={scene.sceneId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelectedAfter
                        ? "bg-cyan-50/60"
                        : isSelectedBefore
                        ? "bg-slate-100/60"
                        : ""
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{scene.acquisitionDate}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {scene.acquisitionDatetime.slice(11, 16)}
                        </span>
                        {isLatestSuitablePass && (
                          <Badge variant="outline" className="text-[9px] bg-cyan-50 text-cyan-800 border-cyan-300 ml-1 py-0 px-1">
                            Latest Suitable
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      {scene.orbitPass || "Descending Pass"}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          scene.cloudCoveragePct <= 15
                            ? "text-emerald-700"
                            : scene.cloudCoveragePct <= 30
                            ? "text-amber-700"
                            : "text-slate-500"
                        }`}
                      >
                        {scene.cloudCoveragePct}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      {getQualityBadge(scene)}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBeforeScene(scene)}
                        className={`px-2 py-1 rounded text-[10px] font-sans font-medium transition-all ${
                          isSelectedBefore
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelectedBefore ? "Selected (T0)" : "Set Baseline (T0)"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectAfterScene(scene)}
                        className={`px-2 py-1 rounded text-[10px] font-sans font-medium transition-all ${
                          isSelectedAfter
                            ? "bg-cyan-600 text-white"
                            : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                        }`}
                      >
                        {isSelectedAfter ? "Selected (T1)" : "Set Post-Work (T1)"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
