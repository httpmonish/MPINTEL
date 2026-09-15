"use client";

import React from "react";
import { SatelliteEvidence } from "@/lib/types";

interface ChangeMaskOverlayProps {
  evidence: SatelliteEvidence;
  mode?: "before" | "after" | "diff";
  className?: string;
}

export function ChangeMaskOverlay({
  evidence,
  mode = "after",
  className = "",
}: ChangeMaskOverlayProps) {
  const isDiff = mode === "diff";
  const isBefore = mode === "before";
  const hasChange =
    evidence.evidenceStatus === "CHANGE_DETECTED" ||
    evidence.evidenceStatus === "REQUIRES_REVIEW" ||
    evidence.evidenceStatus === "PARTIAL_CHANGE" ||
    evidence.evidenceStatus === "VERIFIED_CONSISTENT";

  const isUnavailable = evidence.evidenceStatus === "UNAVAILABLE";
  const isLowQuality = evidence.evidenceStatus === "LOW_QUALITY";

  // Compute display offsets based on spatial overlap
  const isOffset = evidence.evidenceStatus === "REQUIRES_REVIEW";
  const changeX = isOffset ? 190 : 135;
  const changeY = isOffset ? 65 : 125;
  const changeRadius = isOffset ? 28 : 36;

  return (
    <div
      className={`relative w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col justify-between p-3 select-none ${className}`}
    >
      {/* Dynamic Satellite Canvas Simulation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 280 210"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Surface texture grid */}
          <pattern
            id={`sat-grid-${evidence.projectId}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Change Mask glow filter */}
          <filter id={`change-glow-${evidence.projectId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Terrain Simulation */}
        <rect width="280" height="210" fill="#090d16" />
        <rect width="280" height="210" fill={`url(#sat-grid-${evidence.projectId})`} />

        {/* Topographic landscape contours */}
        <path
          d="M 0,80 Q 70,50 140,85 T 280,70 L 280,210 L 0,210 Z"
          fill="#0f172a"
          opacity="0.8"
        />
        <path
          d="M 0,130 Q 90,110 180,140 T 280,120 L 280,210 L 0,210 Z"
          fill="#131e36"
          opacity="0.7"
        />

        {/* Cloud coverage overlay for LOW_QUALITY */}
        {isLowQuality && (
          <g opacity="0.65">
            <circle cx="120" cy="90" r="75" fill="#94a3b8" filter="blur(18px)" />
            <circle cx="180" cy="120" r="60" fill="#cbd5e1" filter="blur(22px)" />
            <circle cx="90" cy="140" r="50" fill="#64748b" filter="blur(15px)" />
          </g>
        )}

        {/* Project Sanctioned AOI Buffer Circle */}
        {!isUnavailable && (
          <g>
            <circle
              cx="140"
              cy="115"
              r="62"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.75"
            />
            <text
              x="140"
              y="48"
              fill="#7dd3fc"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.9"
            >
              AOI BUFFER (100m)
            </text>
          </g>
        )}

        {/* Pre-existing baseline structures in BEFORE image */}
        {isBefore && (
          <g opacity="0.5">
            <rect x="70" y="130" width="30" height="18" fill="#334155" rx="2" />
            <path d="M 0,165 L 280,165" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
          </g>
        )}

        {/* DETECTED PHYSICAL CHANGE FOOTPRINT (Rendered in AFTER or DIFF mode) */}
        {!isBefore && hasChange && !isLowQuality && (
          <g filter={`url(#change-glow-${evidence.projectId})`}>
            {/* Structural change polygon */}
            <polygon
              points={`
                ${changeX - changeRadius},${changeY - 8}
                ${changeX - 10},${changeY - changeRadius}
                ${changeX + changeRadius - 6},${changeY - 14}
                ${changeX + changeRadius},${changeY + 12}
                ${changeX + 12},${changeY + changeRadius}
                ${changeX - changeRadius + 8},${changeY + changeRadius - 4}
              `}
              fill={isOffset ? "rgba(245, 158, 11, 0.45)" : "rgba(34, 197, 94, 0.45)"}
              stroke={isOffset ? "#f59e0b" : "#22c55e"}
              strokeWidth="2"
            />
            {/* High-reflectance rooftop / mast core */}
            <circle
              cx={changeX}
              cy={changeY}
              r="6"
              fill={isOffset ? "#fbbf24" : "#4ade80"}
            />

            {/* Offset line for REQUIRES_REVIEW */}
            {isOffset && (
              <line
                x1="140"
                y1="115"
                x2={changeX}
                y2={changeY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            )}
          </g>
        )}

        {/* Project Coordinate Center Marker */}
        {!isUnavailable && (
          <g>
            <circle cx="140" cy="115" r="4" fill="#38bdf8" />
            <circle cx="140" cy="115" r="9" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <line x1="140" y1="103" x2="140" y2="127" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="128" y1="115" x2="152" y2="115" stroke="#38bdf8" strokeWidth="0.8" />
          </g>
        )}

        {/* Coordinate Text Overlay */}
        <text
          x="10"
          y="20"
          fill="#94a3b8"
          fontSize="8"
          fontFamily="monospace"
        >
          {evidence.latitude.toFixed(4)}°N, {evidence.longitude.toFixed(4)}°E
        </text>

        <text
          x="270"
          y="20"
          fill="#94a3b8"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="end"
        >
          {evidence.imageResolutionMeters > 0 ? `${evidence.imageResolutionMeters}m/px` : "N/A"}
        </text>

        {isDiff && hasChange && (
          <g>
            <rect x="80" y="180" width="120" height="18" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#334155" />
            <text
              x="140"
              y="192"
              fill={isOffset ? "#fbbf24" : "#4ade80"}
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              NDBI CHANGE: +{(evidence.changeScore * 100).toFixed(0)}%
            </text>
          </g>
        )}
      </svg>

      {/* Top Banner Status */}
      <div className="relative z-10 flex items-center justify-between text-[11px]">
        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700 font-mono">
          {mode === "before"
            ? `T0 Pre-Sanction (${evidence.acquisitionDate})`
            : mode === "after"
            ? `T1 Observation (${evidence.comparisonDate})`
            : "Surface Difference Mask"}
        </span>

        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-800/60 font-mono text-[10px]">
          {evidence.provider}
        </span>
      </div>

      {/* Bottom Legend Overlay */}
      <div className="relative z-10 bg-slate-900/85 backdrop-blur-xs border border-slate-800 rounded-md p-1.5 flex items-center justify-between text-[10px] text-slate-300 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            Sanctioned GPS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 border border-sky-400 border-dashed rounded-full inline-block" />
            100m AOI
          </span>
          {hasChange && (
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-xs inline-block ${
                  isOffset ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              {isOffset ? "Offset Change" : "Detected Footprint"}
            </span>
          )}
        </div>

        <div>
          {isUnavailable ? (
            <span className="text-slate-400">Imagery Gap</span>
          ) : isLowQuality ? (
            <span className="text-slate-400">Cloud Obscured</span>
          ) : (
            <span className="text-cyan-300">
              Overlap: {(evidence.spatialOverlapScore * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
