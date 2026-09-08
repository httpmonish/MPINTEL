import React from "react";
import Link from "next/link";
import { Constituency } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { ArrowRight, AlertTriangle, Building2 } from "lucide-react";

interface ConstituencyCardProps {
  constituency: Constituency;
}

export const ConstituencyCard: React.FC<ConstituencyCardProps> = ({ constituency }) => {
  // Deterministic SVG geometric avatar based on constituency string
  const hash = constituency.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash * 37) % 360;
  const isHighAverage = constituency.averageRiskScore >= 50;

  return (
    <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-200 border-slate-200/80">
      <CardContent className="p-5">
        <div className="flex items-center gap-3.5">
          {/* Deterministic Geometric SVG Avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 70%, 90%), hsl(${(hue + 40) % 360}, 70%, 80%))`,
            }}
          >
            <Building2
              className="w-6 h-6"
              style={{ color: `hsl(${hue}, 70%, 30%)` }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 text-sm truncate">
              {constituency.id}
            </h4>
            <p className="text-xs text-slate-500">{constituency.stateCode}</p>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-sm font-bold block ${
                isHighAverage ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {constituency.averageRiskScore}
              <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Avg Risk
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Sanctioned</span>
            <span className="font-semibold text-slate-800">
              {formatINR(constituency.totalSanctionedINR)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Disbursed</span>
            <span className="font-semibold text-slate-800">
              {formatINR(constituency.totalDisbursedINR)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between pt-1 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {constituency.openFlaggedCasesCount} open flag(s)
          </span>

          <Link
            href={`/projects?constituency=${encodeURIComponent(constituency.id)}`}
            className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-[11px]"
          >
            {constituency.totalProjects} Works
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
