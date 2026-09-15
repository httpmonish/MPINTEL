"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldInspectionRecord, FieldInspectionPhoto, LocationValidationStatus } from "@/lib/types";
import { getDeterministicInspections, validateInspectorLocation } from "@/lib/engine/field-verification";
import { LiveCameraCaptureModal, InspectionPhotoViewer } from "@/components/field";
import {
  ArrowLeft,
  MapPin,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  Lock,
  RefreshCw,
  Clock,
  Compass,
} from "lucide-react";

export default function MobileInspectionExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = (params?.id as string) || "INSP-2024-HERO-001";

  const [inspection, setInspection] = useState<FieldInspectionRecord | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FieldInspectionPhoto | null>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    // Lookup inspection
    const all = [
      ...getDeterministicInspections("HERO-MPLADS-001"),
      ...getDeterministicInspections("PRJ-2023-088"),
      ...getDeterministicInspections("PRJ-REVIEW-005"),
    ];
    const match = all.find((i) => i.inspectionId.toLowerCase() === inspectionId.toLowerCase()) || all[0];
    setInspection({ ...match });
  }, [inspectionId]);

  if (!inspection) {
    return (
      <DashboardShell>
        <div className="p-8 text-center text-slate-500 text-xs">
          Loading inspection work order...
        </div>
      </DashboardShell>
    );
  }

  const handleStartSession = () => {
    setInspection((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: "IN_PROGRESS",
        auditTrail: [
          ...prev.auditTrail,
          {
            action: "IN_PROGRESS",
            performedBy: prev.assignedInspector.name,
            timestamp: new Date().toISOString(),
            details: "Inspector started on-site field verification session.",
          },
        ],
      };
    });
    setSuccessToast("Inspection session active. Proceed with GPS lock and camera capture.");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleGetLocation = () => {
    setLocating(true);
    setTimeout(() => {
      // Simulate live GPS lock at site (approx 35m from sanctioned coordinates)
      const liveLat = inspection.projectCoordinates.latitude + 0.00025;
      const liveLon = inspection.projectCoordinates.longitude + 0.00020;
      const res = validateInspectorLocation(
        inspection.projectCoordinates.latitude,
        inspection.projectCoordinates.longitude,
        liveLat,
        liveLon,
        inspection.allowedRadiusMeters,
        3.8
      );

      setInspection((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          inspectionCoordinates: { latitude: liveLat, longitude: liveLon, accuracyMeters: 3.8 },
          distanceToProjectMeters: res.distanceMeters,
          locationStatus: res.status,
          status: res.status === "WITHIN_RADIUS" ? "LOCATION_VERIFIED" : "EVIDENCE_CONFLICT",
          auditTrail: [
            ...prev.auditTrail,
            {
              action: `GPS_${res.status}`,
              performedBy: prev.assignedInspector.name,
              timestamp: new Date().toISOString(),
              details: `GPS lock acquired at ${res.distanceMeters}m from sanctioned site. Status: ${res.status}.`,
            },
          ],
        };
      });

      setLocating(false);
      setSuccessToast(`GPS Lock Acquired: ${res.statusLabel}`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 800);
  };

  const handlePhotoCaptured = (photo: FieldInspectionPhoto) => {
    setInspection((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        photos: [...prev.photos, photo],
        status: "EVIDENCE_CAPTURED",
        auditTrail: [
          ...prev.auditTrail,
          {
            action: "PHOTO_CAPTURED",
            performedBy: prev.assignedInspector.name,
            timestamp: new Date().toISOString(),
            details: `Captured ${photo.stage} milestone photo. Signature: ${photo.signatureState}.`,
          },
        ],
      };
    });
    setSuccessToast("Live photograph captured with TPM v2 cryptographic hardware lock.");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmitInspection = () => {
    setSubmitting(true);
    setTimeout(() => {
      setInspection((prev) => {
        if (!prev) return null;
        const isVerified = prev.locationStatus === "WITHIN_RADIUS" && prev.photos.length > 0;
        return {
          ...prev,
          status: isVerified ? "VERIFIED" : "REQUIRES_REVIEW",
          verificationConfidence: isVerified ? 88 : 48,
          auditTrail: [
            ...prev.auditTrail,
            {
              action: "SUBMITTED",
              performedBy: prev.assignedInspector.name,
              timestamp: new Date().toISOString(),
              details: `Inspection submitted. Automated Multi-Signal Verification: ${isVerified ? "VERIFIED (88%)" : "REQUIRES_REVIEW"}.`,
            },
          ],
        };
      });
      setSubmitting(false);
      setSuccessToast("Inspection submitted successfully. Multi-signal verification updated.");
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1000);
  };

  const isLocationLocked = inspection.locationStatus === "WITHIN_RADIUS" || inspection.locationStatus === "OUTSIDE_RADIUS";

  return (
    <DashboardShell>
      <div className="max-w-xl mx-auto space-y-4 pb-16 font-sans">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/inspections"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Field Hub
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {inspection.inspectionId}
            </Badge>
            <DataSourceBadge type="synthetic" />
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Mobile Work Order Card */}
        <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                Statutory Inspection Work Order
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">
                Stage: {inspection.stage}
              </span>
            </div>
            <CardTitle className="text-base text-white mt-1">
              {inspection.projectTitle}
            </CardTitle>
            <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 pt-0.5">
              <span>Project ID: <strong>{inspection.projectId}</strong></span>
              <span>•</span>
              <span>Inspector: {inspection.assignedInspector.name}</span>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Sanctioned Site Coordinates */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-sans font-bold text-slate-700">Sanctioned GPS Site</span>
                <span>Buffer: {inspection.allowedRadiusMeters}m</span>
              </div>
              <div className="text-slate-900 font-bold">
                {inspection.projectCoordinates.latitude.toFixed(4)}°N, {inspection.projectCoordinates.longitude.toFixed(4)}°E
              </div>
            </div>

            {/* Step 1: Start Inspection Session */}
            {inspection.status === "ASSIGNED" && (
              <Button
                onClick={handleStartSession}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2 rounded-xl"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                START ON-SITE INSPECTION
              </Button>
            )}

            {/* Step 2: Get Location & Geodesic Check */}
            {inspection.status !== "ASSIGNED" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">1. On-Site GPS Validation</span>
                  {isLocationLocked && (
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        inspection.locationStatus === "WITHIN_RADIUS"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {inspection.locationStatus === "WITHIN_RADIUS" ? "GPS VERIFIED" : "MISMATCH"}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleGetLocation}
                  disabled={locating}
                  variant="outline"
                  className="w-full h-11 border-slate-300 font-bold text-xs gap-2 rounded-xl text-slate-800 hover:bg-slate-50"
                >
                  <MapPin className={`w-4 h-4 text-cyan-600 ${locating ? "animate-bounce" : ""}`} />
                  {locating ? "Acquiring GPS Telemetry..." : isLocationLocked ? "Re-Check GPS Lock" : "GET LIVE LOCATION"}
                </Button>

                {isLocationLocked && inspection.distanceToProjectMeters && (
                  <p className="text-[11px] text-slate-500 font-mono text-center">
                    Current Lock: {inspection.distanceToProjectMeters}m from sanctioned site (±3.8m precision)
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Capture Live Field Photo */}
            {isLocationLocked && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">2. Live Photographic Evidence</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inspection.photos.length} captured
                  </span>
                </div>

                <Button
                  onClick={() => setCameraModalOpen(true)}
                  className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  CAPTURE LIVE FIELD PHOTOGRAPH
                </Button>

                {/* Uploaded Photos Thumbnails */}
                {inspection.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {inspection.photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPhoto(p);
                          setPhotoViewerOpen(true);
                        }}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-left cursor-pointer hover:border-cyan-500 transition-all space-y-1"
                      >
                        <div className="aspect-16/10 bg-slate-900 rounded overflow-hidden relative flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 160 100">
                            <rect width="160" height="100" fill="#1e293b" />
                            <path d="M 0 60 Q 50 50 160 70 L 160 100 L 0 100 Z" fill="#334155" />
                            <rect x="70" y="30" width="18" height="40" fill="#94a3b8" />
                          </svg>
                          <span className="absolute top-1 left-1 text-[8px] bg-emerald-600 text-white px-1 rounded font-bold">
                            TPM Signed
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-800 truncate">{p.caption}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Submit Inspection */}
            {inspection.photos.length > 0 && inspection.status !== "VERIFIED" && (
              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={handleSubmitInspection}
                  disabled={submitting}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating Multi-Signal Triangulation...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      SUBMIT INSPECTION FOR VERIFICATION
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Completed / Verified Summary Banner */}
            {inspection.status === "VERIFIED" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Statutory Field Verification Complete
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  On-site physical evidence submitted with valid GPS telemetry, TPM v2 hardware signature, and unique pHash fingerprint. Triangulated Verification Confidence: <strong>{inspection.verificationConfidence}/100</strong>.
                </p>
                <div className="pt-2">
                  <Link href={`/investigation/${inspection.projectId}`}>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-white border-emerald-300 text-emerald-800">
                      View Investigation Audit Record &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Camera Modal */}
        <LiveCameraCaptureModal
          inspection={inspection}
          open={cameraModalOpen}
          onOpenChange={setCameraModalOpen}
          onPhotoCaptured={handlePhotoCaptured}
        />

        {/* Photo Detail Modal */}
        <InspectionPhotoViewer
          photo={selectedPhoto}
          inspection={inspection}
          open={photoViewerOpen}
          onOpenChange={setPhotoViewerOpen}
        />
      </div>
    </DashboardShell>
  );
}
