"use client";

import React, { useState } from "react";
import { CrossSchemeMatch } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Maximize2,
  Calendar,
  MapPin,
  Fingerprint,
  Info,
} from "lucide-react";

interface CrossSchemeImageViewerProps {
  match: CrossSchemeMatch;
}

export const CrossSchemeImageViewer: React.FC<CrossSchemeImageViewerProps> = ({ match }) => {
  const { projectA, projectB, imageSimilarityPct, signals } = match;
  const photoA = projectA.photos?.[0];
  const photoB = projectB.photos?.[0];

  const hasBothPhotos = Boolean(photoA && photoB);

  return (
    <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Cross-Scheme Photographic Fingerprint & pHash Comparison
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent visual perceptual hash comparison between {projectA.schemeId} and {projectB.schemeId} completion photographs.
          </p>
        </div>

        {hasBothPhotos ? (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                (imageSimilarityPct ?? 0) > 85
                  ? "bg-red-50 text-red-800 border-red-200"
                  : (imageSimilarityPct ?? 0) > 60
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {(imageSimilarityPct ?? 0) > 85 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              pHash Visual Similarity: {imageSimilarityPct}%
            </span>
          </div>
        ) : (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 text-xs">
            Photo Evidence Sparse / Unavailable
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {hasBothPhotos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Photo (Project A) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 space-y-2">
              <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-xs text-white">
                <span className="font-bold text-blue-300">{projectA.schemeId} Primary Work Photo</span>
                <span className="font-mono text-[11px] text-slate-300">{photoA?.id}</span>
              </div>
              <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={photoA?.url}
                  alt={photoA?.caption || "Project A Photo"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-xs space-y-1.5 bg-white">
                <p className="font-medium text-slate-800 text-xs line-clamp-1">{photoA?.caption}</p>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Captured: {photoA?.capturedAt?.slice(0, 10)}</span>
                  <span>pHash: <span className="text-blue-700 font-bold">{photoA?.pHash}</span></span>
                </div>
              </div>
            </div>

            {/* Right Photo (Project B) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 space-y-2">
              <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-xs text-white">
                <span className="font-bold text-emerald-300">{projectB.schemeId} Corroborating Photo</span>
                <span className="font-mono text-[11px] text-slate-300">{photoB?.id}</span>
              </div>
              <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={photoB?.url}
                  alt={photoB?.caption || "Project B Photo"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-xs space-y-1.5 bg-white">
                <p className="font-medium text-slate-800 text-xs line-clamp-1">{photoB?.caption}</p>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Captured: {photoB?.capturedAt?.slice(0, 10)}</span>
                  <span>pHash: <span className="text-emerald-700 font-bold">{photoB?.pHash}</span></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Photographic Evidence Unavailable</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              One or both scheme claims do not contain registered completion photographs. Pursuant to the Zero-Penalty fairness principle, this dimension is marked unavailable without lowering project confidence.
            </p>
          </div>
        )}

        {/* Explainability Note */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600 font-primary">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p leading-relaxed>
            <span className="font-bold text-slate-800">Forensic Guidance:</span> {signals.imageSimilarity.explanation} Visual similarity indicates physical asset resemblance; human verification is required before confirming duplication.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
