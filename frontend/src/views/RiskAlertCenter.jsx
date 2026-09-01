import React, { useState } from 'react';
import { ShieldAlert, Filter, Search, ChevronRight, AlertTriangle, Clock, Camera, GitMerge, DollarSign } from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function RiskAlertCenter({ onSelectProject }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const alerts = ALL_PROJECTS.filter(p => {
    if (severityFilter === 'HIGH' && p.risk_score < 70) return false;
    if (severityFilter === 'ELEVATED' && (p.risk_score < 40 || p.risk_score >= 70)) return false;
    if (severityFilter === 'LOW' && p.risk_score >= 40) return false;
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Risk Intelligence Engine</span>
            <span>&gt;</span>
            <span className="text-slate-900">Real-Time Risk Alert Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Triaged MPLADS Risk & Anomaly Alerts Feed
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="HIGH">High Risk (&ge;70)</option>
            <option value="ELEVATED">Elevated (40-70)</option>
            <option value="LOW">Low (&lt;40)</option>
          </select>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3">
        {alerts.slice(0, 10).map((p) => (
          <div
            key={p.work_id}
            onClick={() => onSelectProject(p)}
            className="clean-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:border-blue-400 transition group"
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                p.risk_score >= 70 ? 'bg-rose-100 text-rose-700' : (p.risk_score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">{p.work_id}</span>
                  <span className={`px-2 py-0.2 rounded-full font-bold font-mono text-[10px] ${
                    p.risk_score >= 70 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Risk Score: {p.risk_score}
                  </span>
                  {p.is_hero_project && <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">FLAGSHIP DEMO</span>}
                </div>

                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition truncate max-w-xl">
                  {p.work_title}
                </div>

                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                  <span>{p.district}, {p.state}</span>
                  <span>&bull;</span>
                  <span>Sanction: <strong>₹{(p.sanctioned_amount_inr / 100000).toFixed(1)}L</strong></span>
                  <span>&bull;</span>
                  <span className="text-rose-600 font-medium">{p.primary_bottleneck_stage}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Open Investigation <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
