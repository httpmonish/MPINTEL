"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldInspectionRecord } from "@/lib/types";
import { getDeterministicInspections } from "@/lib/engine/field-verification";
import {
  ClipboardCheck,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Car,
  Camera,
  CheckCircle2,
  Plus,
} from "lucide-react";

export default function InspectionsDashboardPage() {
  const { projects } = useRiskLensStore();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Collect all deterministic inspections across projects
  const allInspections: FieldInspectionRecord[] = [
    ...getDeterministicInspections("HERO-MPLADS-001"),
    ...getDeterministicInspections("PRJ-2023-088"),
    ...getDeterministicInspections("PRJ-REVIEW-005"),
  ];

  const filtered = filterStatus === "ALL"
    ? allInspections
    : allInspections.filter((i) => i.status === filterStatus);

  const assignedCount = allInspections.filter((i) => i.status === "ASSIGNED" || i.status === "IN_PROGRESS").length;
  const verifiedCount = allInspections.filter((i) => i.status === "VERIFIED" || i.status === "COMPLETED").length;
  const conflictCount = allInspections.filter((i) => i.status === "EVIDENCE_CONFLICT" || i.status === "REQUIRES_REVIEW").length;

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow">PHYSICAL AUDIT & INDEPENDENT VERIFICATION</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Statutory Field Inspections & Evidence Hub
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary">
              Independent physical verification subsystem managing inspector dispatch, live GPS validation, cryptographic hardware signatures, and multi-stage audit timelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/inspections/optimizer">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-slate-200 gap-1.5"
              >
                <Car className="w-3.5 h-3.5 text-blue-600" />
                Route Optimizer
              </Button>
            </Link>
          </div>
        </div>

        {/* High-Level KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Scheduled Audits
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {allInspections.length}
              </div>
              <span className="text-[10px] text-slate-500">Statutory 10% mandate</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block">
                Active In Field
              </span>
              <div className="text-2xl font-black text-cyan-800 mt-0.5">
                {assignedCount}
              </div>
              <span className="text-[10px] text-cyan-700 font-medium">Assigned / In Progress</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Verified On-Site
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {verifiedCount}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">GPS + Live Photo Signed</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                Requires Review
              </span>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {conflictCount}
              </div>
              <span className="text-[10px] text-amber-700 font-medium">Location / Hash Discrepancy</span>
            </CardContent>
          </Card>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter:
            </span>
            {[
              { id: "ALL", label: "All Inspections" },
              { id: "VERIFIED", label: "Verified" },
              { id: "ASSIGNED", label: "Assigned" },
              { id: "EVIDENCE_CONFLICT", label: "Requires Review" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterStatus(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === t.id
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing {filtered.length} of {allInspections.length} records
          </span>
        </div>

        {/* Inspections Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 font-sans">
                <tr>
                  <th className="py-3 px-4">Inspection ID & Stage</th>
                  <th className="py-3 px-4">Project Asset</th>
                  <th className="py-3 px-4">Assigned Inspector</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">GPS Telemetry</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filtered.map((insp) => (
                  <tr key={insp.inspectionId} className="hover:bg-slate-50/80 transition-colors font-sans">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{insp.inspectionId}</div>
                      <span className="text-[10px] text-slate-500 font-mono">Stage: {insp.stage} Milestone</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 line-clamp-1">{insp.projectTitle}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{insp.projectId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{insp.assignedInspector.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{insp.assignedInspector.badge}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {insp.scheduledDate}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {insp.locationStatus === "WITHIN_RADIUS" ? (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {insp.distanceToProjectMeters}m (Verified)
                        </span>
                      ) : insp.locationStatus === "OUTSIDE_RADIUS" ? (
                        <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          {insp.distanceToProjectMeters}m (Mismatch)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending GPS</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {insp.status === "VERIFIED" || insp.status === "COMPLETED" ? (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                          Verified ({insp.verificationConfidence || 88}%)
                        </Badge>
                      ) : insp.status === "EVIDENCE_CONFLICT" || insp.status === "REQUIRES_REVIEW" ? (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                          Requires Review
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-600">
                          {insp.status}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <Link href={`/inspections/${insp.inspectionId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-200 text-slate-800 hover:text-slate-900"
                        >
                          <Camera className="w-3 h-3 mr-1 text-cyan-600" />
                          Mobile Inspect
                        </Button>
                      </Link>

                      <Link href={`/investigation/${insp.projectId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Audit File
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
