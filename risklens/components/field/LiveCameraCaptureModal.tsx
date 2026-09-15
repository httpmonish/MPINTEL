"use client";

import React, { useState, useEffect } from "react";
import { FieldInspectionPhoto, FieldInspectionRecord } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  MapPin,
  ShieldCheck,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
} from "lucide-react";

interface LiveCameraCaptureModalProps {
  inspection: FieldInspectionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoCaptured: (photo: FieldInspectionPhoto) => void;
}

export function LiveCameraCaptureModal({
  inspection,
  open,
  onOpenChange,
  onPhotoCaptured,
}: LiveCameraCaptureModalProps) {
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState<"BEFORE" | "DURING" | "AFTER">("AFTER");
  const [gpsLocked, setGpsLocked] = useState(false);
  const [lat, setLat] = useState<number>(19.0763);
  const [lon, setLon] = useState<number>(72.8780);
  const [tpmSigned, setTpmSigned] = useState(true);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (inspection) {
      setStage(inspection.stage);
      setLat(inspection.projectCoordinates.latitude + 0.0003);
      setLon(inspection.projectCoordinates.longitude + 0.0003);
      setGpsLocked(true);
    }
  }, [inspection]);

  if (!inspection) return null;

  const handleCapture = () => {
    setCapturing(true);
    setTimeout(() => {
      const photoId = `PHOTO-${Date.now().toString().slice(-6)}`;
      const newPhoto: FieldInspectionPhoto = {
        id: photoId,
        inspectionId: inspection.inspectionId,
        projectId: inspection.projectId,
        stage,
        url: `/images/evidence/live-${photoId}.jpg`,
        caption: caption.trim() || `${stage} milestone on-site inspection photograph.`,
        capturedAt: new Date().toISOString(),
        latitude: lat,
        longitude: lon,
        gpsAccuracyMeters: 4.0,
        isLiveCameraStream: true,
        pHash: "a1b2c3d4e5f60718",
        duplicateStatus: "NEW_EVIDENCE",
        signatureState: tpmSigned ? "SIGNED_AND_VALID" : "UNSIGNED",
        signatureDigest: tpmSigned ? `TPM2-HW-SEC-${inspection.assignedInspector.badge}` : undefined,
        deviceIdentifier: inspection.assignedInspector.authorizedDeviceFingerprint,
        deviceTpmAuthorized: tpmSigned,
        qualityTier: "GOOD",
        qualityScorePct: 94,
        uploadStatus: "UPLOADED",
        auditHash: `sha256-${photoId}`,
      };

      onPhotoCaptured(newPhoto);
      setCapturing(false);
      onOpenChange(false);
      setCaption("");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl bg-white border border-slate-200">
        <DialogHeader
          title="Live Field Camera & TPM Lock"
          description={`Project: ${inspection.projectId} • Inspector: ${inspection.assignedInspector.name}`}
          onClose={() => onOpenChange(false)}
        />

        <div className="p-4 space-y-4 text-xs font-sans">
          {/* Live Camera Viewfinder Simulation */}
          <div className="aspect-4/3 bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 225">
              <rect width="300" height="225" fill="#0f172a" />
              <path d="M 0 150 Q 100 130 300 160 L 300 225 L 0 225 Z" fill="#1e293b" />
              <rect x="130" y="80" width="40" height="70" rx="3" fill="#64748b" />
              <circle cx="150" cy="70" r="14" fill="#0284c7" />

              {/* Crosshair Viewfinder */}
              <circle cx="150" cy="112" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="150" y1="70" x2="150" y2="90" stroke="#38bdf8" strokeWidth="1" />
              <line x1="150" y1="135" x2="150" y2="155" stroke="#38bdf8" strokeWidth="1" />
              <line x1="105" y1="112" x2="125" y2="112" stroke="#38bdf8" strokeWidth="1" />
              <line x1="175" y1="112" x2="195" y2="112" stroke="#38bdf8" strokeWidth="1" />
            </svg>

            {/* GPS & TPM Overlays */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/90 text-white">
                <MapPin className="w-3 h-3" />
                GPS LOCK: {lat.toFixed(4)}°N, {lon.toFixed(4)}°E (±4m)
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-slate-700">
                <Lock className="w-3 h-3 text-cyan-400" />
                TPM v2 Hardware Stream Active
              </span>
            </div>

            <div className="absolute bottom-2 right-2">
              <span className="text-[9px] text-slate-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded">
                Live Sensor: 1080p Optical
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Milestone Stage
              </label>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-[11px]">
                {(["BEFORE", "DURING", "AFTER"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    className={`px-2 py-0.5 rounded font-medium ${
                      stage === s ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Evidence Description / Observation Note *
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Foundation slab cast, pole erected, or completed asset..."
                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                Cryptographic Hardware Signer
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tpmSigned}
                  onChange={(e) => setTpmSigned(e.target.checked)}
                  className="rounded border-slate-300 text-cyan-600 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-mono text-slate-600">Attach TPM2 Seal</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            Direct Camera Feed • Gallery Disabled
          </span>
          <Button
            size="sm"
            onClick={handleCapture}
            disabled={capturing}
            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-1.5"
          >
            {capturing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Capturing & Signing...
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Capture & Geotag
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
