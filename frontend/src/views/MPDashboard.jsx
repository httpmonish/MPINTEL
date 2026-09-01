import React from 'react';
import { Users, CheckCircle2, Clock, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function MPDashboard({ onSelectProject }) {
  const mpProjects = ALL_PROJECTS.slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* MP Constituency Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Hon'ble Member of Parliament</span>
            <span>&gt;</span>
            <span className="text-slate-900">Constituency Development Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Constituency Progress & Priority Monitoring
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Constituency: <strong className="text-slate-800">Purnia (Bihar)</strong> &bull; Member: <strong className="text-slate-800">Hon'ble Santosh Kumar, MP</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold font-mono">
            ₹5.00 Cr Annual Sanction Quota
          </span>
        </div>
      </div>

      {/* 4 Constituency Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clean-card p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Works</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">34 Works</div>
          <span className="text-[10px] text-slate-500">Total Constituency Pool</span>
        </div>

        <div className="clean-card p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Sanctioned Funds</span>
          <div className="text-2xl font-black text-blue-600 mt-0.5">₹4.85 Cr</div>
          <span className="text-[10px] text-emerald-600 font-bold">97.0% Sanctioned</span>
        </div>

        <div className="clean-card p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Completed Assets</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">22 Assets</div>
          <span className="text-[10px] text-slate-500">Verified Community Durable</span>
        </div>

        <div className="clean-card p-4 rounded-2xl border-amber-200 bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Requiring Attention</span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">3 Works</div>
          <span className="text-[10px] text-amber-600 font-bold">SLA / Verification Pending</span>
        </div>
      </div>

      {/* Works Requiring Attention (Non-Accusatory Wording) */}
      <div className="clean-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Works Requiring Administrative Follow-Up</h2>
          <p className="text-xs text-slate-500">Projects experiencing processing delay or awaiting location evidence reconciliation.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3">Work Title</th>
                <th className="py-2.5 px-3">Sanctioned (₹)</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">Administrative Focus</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {mpProjects.map((p) => (
                <tr key={p.work_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{p.work_title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.work_id} &bull; {p.category}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{(p.sanctioned_amount_inr / 100000).toFixed(1)}L
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.current_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{p.primary_bottleneck_stage}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                    >
                      View Details &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
