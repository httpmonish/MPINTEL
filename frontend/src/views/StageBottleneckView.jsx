import React from 'react';
import { Clock, BarChart3, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function StageBottleneckView() {
  const stages = [
    { stage: "District Authority Review", actual: 91, benchmark: 22, multiplier: 4.1, role: "District Planning Authority", status: "CRITICAL_BOTTLENECK", color: "bg-rose-500", text: "text-rose-700" },
    { stage: "Technical Sanction & Estimates", actual: 48, benchmark: 14, multiplier: 3.4, role: "Executive Engineer", status: "ELEVATED_DELAY", color: "bg-amber-500", text: "text-amber-700" },
    { stage: "Agency Work Order Issue", actual: 35, benchmark: 10, multiplier: 3.5, role: "Implementing Agency (DRDA)", status: "ELEVATED_DELAY", color: "bg-amber-500", text: "text-amber-700" },
    { stage: "Physical Execution & Milestone", actual: 180, benchmark: 120, multiplier: 1.5, role: "Contractor Consortium", status: "MODERATE_LAG", color: "bg-blue-500", text: "text-blue-700" },
    { stage: "MP Initial Recommendation", actual: 8, benchmark: 15, multiplier: 0.5, role: "Hon'ble MP", status: "OPTIMAL", color: "bg-emerald-500", text: "text-emerald-700" },
    { stage: "Treasury Final Voucher Release", actual: 4, benchmark: 30, multiplier: 0.13, role: "District Treasury", status: "MARCH_RUSH_SPIKE", color: "bg-purple-500", text: "text-purple-700" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Process Intelligence</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 6: Stage-Wise SLA Bottleneck Analyzer</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Workflow Stage Duration vs MoSPI Benchmark SLA (Days)
          </h1>
        </div>

        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold font-mono">
          Systemic Multiplier Attribution (Zero Officer Shaming)
        </span>
      </div>

      {/* SLA Multipliers Bar Cards */}
      <div className="clean-card rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Stage-Wise Delay Analysis (Across 38,450 Monitored Works)</h2>
          <p className="text-xs text-slate-500">Identifies administrative stages where project files remain stalled compared against standard MoSPI SLA norms.</p>
        </div>

        <div className="space-y-4">
          {stages.map((stg) => {
            const maxVal = 200;
            const actualPct = (stg.actual / maxVal) * 100;
            const benchPct = (stg.benchmark / maxVal) * 100;

            return (
              <div key={stg.stage} className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-bold flex items-center gap-2 font-sans">
                    {stg.stage}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      Role: {stg.role}
                    </span>
                  </span>
                  <span className={`font-black ${stg.text}`}>
                    {stg.actual} Days <span className="text-slate-500 font-normal">({stg.multiplier}&times; SLA limit)</span>
                  </span>
                </div>

                <div className="relative bg-slate-100 h-6 rounded-xl overflow-hidden border border-slate-200 flex items-center p-0.5">
                  <div 
                    className="bg-slate-300 h-full rounded-lg transition-all"
                    style={{ width: `${benchPct}%` }}
                    title={`Standard SLA Benchmark: ${stg.benchmark} days`}
                  ></div>
                  <div 
                    className={`${stg.color} h-full rounded-lg absolute left-0 top-0 opacity-80 transition-all`}
                    style={{ width: `${actualPct}%` }}
                  ></div>
                  <span className="absolute right-3 text-[10px] font-bold text-slate-700">
                    Benchmark: {stg.benchmark}d &bull; Actual: {stg.actual}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <strong className="text-slate-900 block font-bold">Policy Recommendation for District Authority:</strong>
          <p>
            The primary systemic bottleneck across Eastern Bihar and Northern UP lies in the <strong>District Verification Stage (avg 91 days vs 22-day SLA)</strong>. Expediting digital cross-verification between District Planning Officers and Implementing Agencies can reduce total asset gestation time by up to 58 days.
          </p>
        </div>
      </div>

    </div>
  );
}
