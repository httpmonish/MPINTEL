import React from 'react';
import { 
  Briefcase, 
  FileCheck2, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TopMetricCards({ 
  onAddFunds, 
  onOpenQueue, 
  onReviewApplications 
}) {
  return (
    <div className="space-y-6">
      {/* 3 Top Action & Metric Cards matching Screenshot 1 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Available to spend */}
        <div className="clean-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-2xs">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span>Available to spend</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ₹14.00 <span className="text-base font-semibold text-slate-500">Cr</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                Covers 18 of 22 pending approvals
              </div>
            </div>

            <button 
              onClick={onAddFunds}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition"
            >
              Add funds
            </button>
          </div>
        </div>

        {/* Card 2: Content awaiting approval */}
        <div className="clean-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-2xs">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <span>Content awaiting approval</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                07 <span className="text-sm font-semibold text-slate-500">assets</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                2 are due to post/verify today
              </div>
            </div>

            <button 
              onClick={onOpenQueue}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition"
            >
              Open queue
            </button>
          </div>
        </div>

        {/* Card 3: Citizen Applications / Creators */}
        <div className="clean-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Creators / Submissions</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                22 <span className="text-sm font-semibold text-slate-500">creators</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                4 have waited more than 5 days
              </div>
            </div>

            <button 
              onClick={onReviewApplications}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition"
            >
              Review applications
            </button>
          </div>
        </div>

      </div>

      {/* Performance 4-Column Metric Section matching Screenshot 1 & 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Performance</h2>
          <span className="text-xs text-slate-400 font-mono font-medium">Synced with eSAKSHI API</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Performance Card 1 */}
          <div className="clean-card rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Attributed revenue</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹18,420 <span className="text-xs font-semibold text-slate-500">L</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                +24.1%
              </span>
              <span className="text-slate-400 font-mono text-[10px]">vs ₹14,850L</span>
            </div>
          </div>

          {/* Performance Card 2 */}
          <div className="clean-card rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Return on spend</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              2.7&times;
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                -0.4
              </span>
              <span className="text-slate-400 font-mono text-[10px]">vs 3.1&times;</span>
            </div>
          </div>

          {/* Performance Card 3 */}
          <div className="clean-card rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Live posts</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              59
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                +11
              </span>
              <span className="text-slate-400 font-mono text-[10px]">vs 48</span>
            </div>
          </div>

          {/* Performance Card 4 */}
          <div className="clean-card rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Cost per post</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹142
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                No change
              </span>
              <span className="text-slate-400 font-mono text-[10px]">vs ₹142</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
