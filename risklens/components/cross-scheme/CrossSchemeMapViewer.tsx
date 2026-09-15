"use client";

import React, { useState } from "react";
import { CrossSchemeMatch } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Eye,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface CrossSchemeMapViewerProps {
  match: CrossSchemeMatch;
}

export const CrossSchemeMapViewer: React.FC<CrossSchemeMapViewerProps> = ({ match }) => {
  const { projectA, projectB, distanceMeters, geometryOverlapPct } = match;
  const [zoomLevel, setZoomLevel] = useState<number>(16);
  const [showAoi, setShowAoi] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<"carto" | "satellite">("carto");

  const midLat = (projectA.latitude + projectB.latitude) / 2;
  const midLon = (projectA.longitude + projectB.longitude) / 2;

  // Calculate relative SVG coordinates for Project A and Project B
  // Delta in meters: 1 deg lat ≈ 111,000m
  const dLatMeters = (projectB.latitude - projectA.latitude) * 111000;
  const dLonMeters = (projectB.longitude - projectA.longitude) * 111000 * Math.cos((midLat * Math.PI) / 180);

  // Scaled for a 500x350 SVG canvas
  const scale = 500 / Math.max(250, distanceMeters * 2.2);
  const posAX = 250 - (dLonMeters * scale) / 2;
  const posAY = 175 + (dLatMeters * scale) / 2;
  const posBX = 250 + (dLonMeters * scale) / 2;
  const posBY = 175 - (dLatMeters * scale) / 2;

  const radiusA = Math.max(30, (projectA.geometry?.boundingRadiusMeters || 100) * scale * 0.4);
  const radiusB = Math.max(30, (projectB.geometry?.boundingRadiusMeters || 100) * scale * 0.4);

  return (
    <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            Multi-Scheme Geographic Proximity & Footprint Overlay
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5 font-primary">
            Centroid distance: <span className="font-bold text-slate-900">{distanceMeters} meters</span>. Category threshold: 100–500m.
          </p>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/70 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setActiveLayer("carto")}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                activeLayer === "carto" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              GIS Cadastral
            </button>
            <button
              onClick={() => setActiveLayer("satellite")}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                activeLayer === "satellite" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sentinel-2 Layer
            </button>
          </div>

          <button
            onClick={() => setShowAoi(!showAoi)}
            className={`px-2 py-1 rounded text-xs font-semibold border ${
              showAoi ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            AOI Buffer
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative w-full h-[360px] bg-slate-950 overflow-hidden flex items-center justify-center">
          {/* Base Grid Background */}
          {activeLayer === "carto" ? (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] bg-[size:16px_16px] opacity-60" />
          )}

          {/* SVG Map Canvas */}
          <svg className="w-full h-full relative z-10" viewBox="0 0 500 350">
            {/* Coordinate Grid Lines */}
            <g stroke="#334155" strokeWidth="1" strokeDasharray="2 4" opacity="0.5">
              <line x1="0" y1="175" x2="500" y2="175" />
              <line x1="250" y1="0" x2="250" y2="350" />
            </g>

            {/* AOI Buffers */}
            {showAoi && (
              <>
                <circle
                  cx={posAX}
                  cy={posAY}
                  r={radiusA}
                  fill="#3b82f6"
                  fillOpacity="0.12"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle
                  cx={posBX}
                  cy={posBY}
                  r={radiusB}
                  fill="#10b981"
                  fillOpacity="0.12"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </>
            )}

            {/* Connecting Geodesic Distance Vector */}
            <g>
              <line
                x1={posAX}
                y1={posAY}
                x2={posBX}
                y2={posBY}
                stroke={distanceMeters <= 100 ? "#ef4444" : distanceMeters <= 500 ? "#f59e0b" : "#94a3b8"}
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              {/* Distance Label Box */}
              <g transform={`translate(${(posAX + posBX) / 2}, ${(posAY + posBY) / 2 - 12})`}>
                <rect x="-38" y="-10" width="76" height="20" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {distanceMeters}m
                </text>
              </g>
            </g>

            {/* Project A Pin (MPLADS - Blue) */}
            <g transform={`translate(${posAX}, ${posAY})`} className="cursor-pointer">
              <circle r="14" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2.5" />
              <circle r="5" fill="#ffffff" />
              <text y="-18" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">
                {projectA.schemeId} ({projectA.projectId})
              </text>
            </g>

            {/* Project B Pin (MGNREGA / PMGSY - Green) */}
            <g transform={`translate(${posBX}, ${posBY})`} className="cursor-pointer">
              <circle r="14" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
              <circle r="5" fill="#ffffff" />
              <text y="26" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                {projectB.schemeId} ({projectB.projectId})
              </text>
            </g>
          </svg>

          {/* Map Compass & Scale Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-[10px] text-slate-300 font-mono flex items-center gap-3">
            <span>Lat: {midLat.toFixed(4)}°N</span>
            <span>Lon: {midLon.toFixed(4)}°E</span>
            <span className="text-blue-400 font-bold">Zoom: {zoomLevel}x</span>
          </div>

          {/* Overlay Status Pill */}
          <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-200">
            {distanceMeters <= 100 ? (
              <span className="text-amber-400 font-bold">Within 100m Co-location AOI</span>
            ) : distanceMeters <= 500 ? (
              <span className="text-blue-400 font-semibold">Within Linear Corridor (500m)</span>
            ) : (
              <span className="text-slate-400 font-medium">Spatially Dispersed</span>
            )}
          </div>
        </div>

        {/* Map Legend */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span className="font-semibold text-slate-800">{projectA.schemeId} Claim Point</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span className="font-semibold text-slate-800">{projectB.schemeId} Claim Point</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
              <span>Geodesic Distance Vector</span>
            </div>
          </div>

          <span className="font-mono text-[11px] text-slate-500">
            Datum: WGS84 Geoid
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
