"use client";

import React from "react";
import { CrossSchemeMatch } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Minus,
  XCircle,
  Layers,
  MapPin,
  Calendar,
  Building2,
  HardHat,
  Banknote,
  FileText,
  Image as ImageIcon,
  Satellite,
  ShieldCheck,
} from "lucide-react";

interface CrossSchemeComparisonCardProps {
  match: CrossSchemeMatch;
}

export const CrossSchemeComparisonCard: React.FC<CrossSchemeComparisonCardProps> = ({ match }) => {
  const { projectA, projectB, signals, signalList } = match;

  const renderStatusIcon = (status: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT") => {
    switch (status) {
      case "MATCH":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Match
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Partial
          </span>
        );
      case "UNAVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            <Minus className="w-3.5 h-3.5 text-slate-400" />
            Unavailable
          </span>
        );
      case "DIFFERENT":
        return (
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            Different
          </span>
        );
    }
  };

  const rows = [
    { label: "Scheme Identifier", icon: Layers, valA: projectA.schemeId, valB: projectB.schemeId, isHeader: true },
    { label: "Statutory Project ID", icon: FileText, valA: projectA.projectId, valB: projectB.projectId, isMono: true },
    { label: "Project Title", icon: FileText, valA: projectA.title, valB: projectB.title, isBold: true },
    { label: "Work Category", icon: Layers, valA: projectA.category, valB: projectB.category },
    {
      label: "Geographic Location",
      icon: MapPin,
      valA: `${projectA.location} (${projectA.latitude.toFixed(4)}, ${projectA.longitude.toFixed(4)})`,
      valB: `${projectB.location} (${projectB.latitude.toFixed(4)}, ${projectB.longitude.toFixed(4)})`,
    },
    {
      label: "Execution Period",
      icon: Calendar,
      valA: `${projectA.startDate} → ${projectA.completionDate || "Ongoing"}`,
      valB: `${projectB.startDate} → ${projectB.completionDate || "Ongoing"}`,
    },
    {
      label: "Sanctioned Amount",
      icon: Banknote,
      valA: formatINR(projectA.sanctionedAmountINR),
      valB: formatINR(projectB.sanctionedAmountINR),
      isBold: true,
    },
    {
      label: "Implementing Agency",
      icon: Building2,
      valA: projectA.implementingAgency,
      valB: projectB.implementingAgency,
    },
    {
      label: "Contractor / Executing Role",
      icon: HardHat,
      valA: projectA.contractor || "Direct / Departmental",
      valB: projectB.contractor || "Direct / Departmental",
    },
    {
      label: "Official Data Source",
      icon: ShieldCheck,
      valA: projectA.source,
      valB: projectB.source,
    },
  ];

  return (
    <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Side-by-Side Scheme Claim Record Comparison
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Normalized comparative audit comparing statutory records from {projectA.schemeId} against {projectB.schemeId}.
            </p>
          </div>
          <Badge variant="outline" className="bg-white text-slate-700 font-mono text-xs font-semibold px-2.5 py-1">
            Centroid Distance: {match.distanceMeters}m
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Record Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-1/4 font-semibold text-slate-900">Attribute Dimension</th>
                <th className="py-3 px-4 w-3/8 font-bold text-blue-950 bg-blue-50/60 border-l border-r border-blue-100/80">
                  {projectA.schemeId} Primary Work
                </th>
                <th className="py-3 px-4 w-3/8 font-bold text-emerald-950 bg-emerald-50/60">
                  {projectB.schemeId} Corroborating Record
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, idx) => {
                const Icon = r.icon;
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-medium flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{r.label}</span>
                    </td>
                    <td
                      className={`py-3 px-4 bg-blue-50/20 border-l border-r border-slate-100 ${
                        r.isMono ? "font-mono font-bold text-slate-800" : ""
                      } ${r.isBold ? "font-bold text-slate-900" : "text-slate-700"}`}
                    >
                      {r.valA}
                    </td>
                    <td
                      className={`py-3 px-4 bg-emerald-50/20 ${
                        r.isMono ? "font-mono font-bold text-slate-800" : ""
                      } ${r.isBold ? "font-bold text-slate-900" : "text-slate-700"}`}
                    >
                      {r.valB}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Analytical Signal Matrix */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Independent Verification Signal Correlation Matrix
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Missing evidence receives zero penalty (Fairness Safeguard)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {signalList.map((sig, sIdx) => (
              <div
                key={sIdx}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 text-[11px]">
                    {sig.signalType.replace(/_/g, " ")}
                  </span>
                  {renderStatusIcon(sig.status)}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug font-primary">
                  {sig.explanation}
                </p>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Weight: {Math.round(sig.weight * 100)}%</span>
                  <span className="font-mono font-bold text-slate-900">
                    {sig.status === "UNAVAILABLE" ? "N/A" : `${sig.scorePct}% Score`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
