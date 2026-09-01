import React from 'react';
import { GitMerge, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { CROSS_SCHEME_RECORDS } from '../data/mpintelDataset';

export default function CrossSchemeView({ onSelectProject }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Context Intelligence</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 13: Cross-Scheme Double-Dipping Scanner</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Inter-Scheme Spatial & Scope Overlap Detection
          </h1>
        </div>

        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold font-mono">
          Scanned against PMGSY, JJM & Samagra Shiksha
        </span>
      </div>

      {/* Cross-Scheme Matches Cards */}
      <div className="space-y-4">
        {CROSS_SCHEME_RECORDS.map((rec) => (
          <div key={rec.id} className="clean-card rounded-2xl p-6 space-y-4 border border-purple-200/80 bg-purple-50/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-mono font-bold text-slate-500">Match ID: {rec.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {rec.overlap_status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-purple-800">
                Scope Overlap: {rec.semantic_scope_overlap_pct}% &bull; Proximity: {rec.distance_between_coordinates_m}m
              </span>
            </div>

            {/* Side by Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              
              {/* MPLADS Record */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">1. MPLADS Sanction</span>
                <div className="font-bold text-slate-900">{rec.mplads_title}</div>
                <div className="text-[11px] text-slate-500 font-mono">Work ID: {rec.mplads_work_id}</div>
                <div className="font-mono font-bold text-slate-800 pt-1">Sanctioned Value: {rec.mplads_cost}</div>
              </div>

              {/* External Scheme Record */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-1.5">
                <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">2. External Scheme Record ({rec.matching_scheme})</span>
                <div className="font-bold text-purple-950">{rec.external_title}</div>
                <div className="text-[11px] text-slate-500 font-mono">External Ref: {rec.external_work_id}</div>
                <div className="font-mono font-bold text-purple-900 pt-1">Sanctioned Value: {rec.external_cost}</div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-600">
                <strong>Recommended Authority Action:</strong> {rec.recommended_action}
              </div>
              <button 
                onClick={() => onSelectProject({ work_id: rec.mplads_work_id, work_title: rec.mplads_title, risk_score: 88.5, sanctioned_amount_inr: 4500000, disbursed_amount_inr: 4500000, district: 'Purnia', state: 'Bihar', category: 'Community Infrastructure & Halls', physical_progress_pct: 35, verification_confidence: 28.0, evidence_signals: [] })}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-2xs"
              >
                Inspect Reconciliation Record &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
