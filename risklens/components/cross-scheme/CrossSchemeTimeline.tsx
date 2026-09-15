"use client";

import React from "react";
import { CrossSchemeMatch } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, Layers, CheckCircle2 } from "lucide-react";

interface CrossSchemeTimelineProps {
  match: CrossSchemeMatch;
}

export const CrossSchemeTimeline: React.FC<CrossSchemeTimelineProps> = ({ match }) => {
  const { projectA, projectB, temporalRelationship, signals } = match;

  const startA = projectA.startDate;
  const endA = projectA.completionDate || "Ongoing";
  const startB = projectB.startDate;
  const endB = projectB.completionDate || "Ongoing";

  return (
    <Card className="border-slate-200/90 shadow-2xs overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Cross-Scheme Execution Lifecycle & Temporal Overlap
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal relationship: <span className="font-bold text-slate-800">{temporalRelationship.replace(/_/g, " ")}</span>.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2.5 py-1 ${
            temporalRelationship === "CONCURRENT_PROJECTS"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : temporalRelationship === "POSSIBLE_PHASED_WORK"
              ? "bg-blue-50 text-blue-800 border-blue-200"
              : "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          {temporalRelationship.replace(/_/g, " ")}
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Timeline Visual Gantt Bars */}
        <div className="space-y-4 font-mono text-xs">
          {/* Project A Timeline Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {projectA.schemeId}: {projectA.title}
              </span>
              <span className="text-slate-500 font-mono">{startA} → {endA}</span>
            </div>
            <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-3 border border-slate-200">
              <div
                className="absolute top-1 bottom-1 bg-blue-600/85 rounded-md flex items-center px-2 text-white text-[10px] font-bold tracking-tight shadow-2xs"
                style={{ left: "10%", width: "70%" }}
              >
                Statutory Execution Period ({projectA.status})
              </div>
            </div>
          </div>

          {/* Project B Timeline Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                {projectB.schemeId}: {projectB.title}
              </span>
              <span className="text-slate-500 font-mono">{startB} → {endB}</span>
            </div>
            <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden relative flex items-center px-3 border border-slate-200">
              <div
                className="absolute top-1 bottom-1 bg-emerald-600/85 rounded-md flex items-center px-2 text-white text-[10px] font-bold tracking-tight shadow-2xs"
                style={{
                  left: temporalRelationship === "CONCURRENT_PROJECTS" ? "18%" : "65%",
                  width: "60%",
                }}
              >
                Statutory Execution Period ({projectB.status})
              </div>
            </div>
          </div>
        </div>

        {/* Temporal Explanation Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-700 font-primary">
          <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Timeline Analysis:</span> {signals.temporalOverlap.explanation}
            {temporalRelationship === "POSSIBLE_PHASED_WORK" && (
              <span className="text-blue-700 font-medium ml-1">
                Sequential execution indicates normal multi-stage asset enhancement rather than duplicate billing.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
