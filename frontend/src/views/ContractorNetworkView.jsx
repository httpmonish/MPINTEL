import React from 'react';
import { Network, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CONTRACTOR_NETWORK } from '../data/mpintelDataset';

export default function ContractorNetworkView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Context & Relationship Engine</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 36: Agency & Contractor Network Graph</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Contractor Allocation Concentration & Performance Profiles
          </h1>
        </div>

        <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold font-mono">
          Public Contract Identifiers Only (Zero Private PII)
        </span>
      </div>

      {/* Network Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTRACTOR_NETWORK.map((ag) => (
          <div key={ag.agency_name} className={`clean-card rounded-2xl p-6 space-y-4 ${
            ag.risk_profile.includes('ATTENTION') ? 'border-amber-200 bg-amber-50/10' : ''
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{ag.agency_name}</h2>
                  <div className="text-[11px] text-slate-500">Active in: {ag.states_active.join(', ')}</div>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                ag.risk_profile.includes('ATTENTION') ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {ag.risk_profile.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Total Works</span>
                <strong className="text-base text-slate-900">{ag.total_awarded_projects}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Value</span>
                <strong className="text-base text-blue-700">₹{ag.total_value_cr} Cr</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">High Risk</span>
                <strong className="text-base text-rose-600">{ag.high_risk_projects_count}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Lag</span>
                <strong className="text-base text-amber-700">{ag.avg_timeline_delay_days}d</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
              {ag.reused_completion_photos_detected > 0 ? (
                <span className="text-amber-800 font-medium">
                  &bull; <strong>{ag.reused_completion_photos_detected} duplicate completion photos</strong> flagged across separate sanction batches under this agency.
                </span>
              ) : (
                <span className="text-slate-600">
                  &bull; Standard milestone completion record with zero photo duplication collisions.
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
