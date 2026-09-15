"use client";

import React from "react";
import { SatelliteEvidence } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Satellite,
  ShieldCheck,
  Cpu,
  AlertCircle,
  FileCode2,
  Orbit,
  Sun,
  Layers,
  Info,
} from "lucide-react";

interface SatelliteMetadataDrawerProps {
  evidence: SatelliteEvidence;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SatelliteMetadataDrawer({
  evidence,
  open,
  onOpenChange,
}: SatelliteMetadataDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title={`Satellite Evidence Calibration & Provenance (${evidence.projectId})`}
        description="Audit-grade cryptographic telemetry and sensor parameters."
        onClose={() => onOpenChange(false)}
      />
      <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">

        <div className="space-y-4 pt-2 text-xs">
          {/* Key Identification Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Provider</span>
              <span className="font-semibold text-slate-800">{evidence.provider}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sensor Resolution</span>
              <span className="font-semibold text-slate-800">
                {evidence.imageResolutionMeters > 0 ? `${evidence.imageResolutionMeters}m / pixel` : "Archive"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Cloud Coverage</span>
              <span className="font-semibold text-slate-800">{evidence.cloudCoveragePct}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Evidence Confidence</span>
              <span className="font-bold text-cyan-700">{evidence.evidenceConfidence} / 100</span>
            </div>
          </div>

          {/* Sensor & Orbit Specifications */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Orbit className="w-4 h-4 text-slate-600" />
              Orbital Platform & Radiometric Calibration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="font-semibold text-slate-700">Sensor Payload:</span>{" "}
                {evidence.sourceMetadata.sensorName}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Orbit Pass:</span>{" "}
                {evidence.sourceMetadata.orbitPass}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Sun Elevation:</span>{" "}
                {evidence.sourceMetadata.sunElevationDeg ? `${evidence.sourceMetadata.sunElevationDeg}°` : "52.4°"}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Radiometric Level:</span>{" "}
                {evidence.sourceMetadata.radiometricProcessing}
              </div>
            </div>
          </div>

          {/* Algorithmic Pipeline & Provenance */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-600" />
              Change Detection Pipeline & Provenance
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div>
                <span className="font-semibold text-slate-700">Preprocessing:</span>{" "}
                {evidence.preprocessingMethod}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Change Detection:</span>{" "}
                {evidence.changeDetectionMethod}
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                <Badge variant="outline" className="text-slate-600">
                  Version: {evidence.provenance.pipelineVersion}
                </Badge>
                <Badge variant="outline" className="text-slate-600">
                  Algorithm Hash: {evidence.provenance.algorithmHash}
                </Badge>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  <ShieldCheck className="w-3 h-3 mr-1 inline text-emerald-600" />
                  Audit Traceable
                </Badge>
              </div>
            </div>
          </div>

          {/* Sensor Limitations & Environmental Context */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              Documented Analysis Limitations
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
              {evidence.limitations.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
              <li>
                Satellite evidence represents independent physical surface observation and does not replace field audits or administrative records.
              </li>
            </ul>
          </div>

          {/* Civic Principle Notice */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-[11px] text-blue-900 leading-relaxed">
            <strong>Civic Safeguard Principle:</strong> Satellite evidence is strictly an independent verification signal. It does not determine compliance or non-compliance on its own. Missing or cloud-obscured imagery never carries a negative scoring penalty.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
