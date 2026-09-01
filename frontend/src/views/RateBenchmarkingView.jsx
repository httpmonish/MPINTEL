import React from 'react';
import { DollarSign, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { SOR_RATE_BENCHMARKS } from '../data/mpintelDataset';

export default function RateBenchmarkingView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Financial Context Engine</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 31: Government Rate Benchmarking</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Itemized Cost Variance vs State Schedule of Rates (SoR)
          </h1>
        </div>

        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold font-mono">
          State PWD Schedule of Rates 2026 Indexed
        </span>
      </div>

      {/* Benchmarks Table */}
      <div className="clean-card rounded-2xl p-6 space-y-4">
        <p className="text-xs text-slate-500">
          Compares submitted Detailed Project Report (DPR) itemized construction and material rates against state public works Schedule of Rates (SoR) reference benchmarks.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-3">Item Code & Specification</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Standard SoR Rate (₹)</th>
                <th className="py-3 px-3">Project Submitted (₹)</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {SOR_RATE_BENCHMARKS.map((item) => (
                <tr key={item.item_code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{item.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.item_code}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{item.state}</td>
                  <td className="py-3.5 px-3 font-mono">{item.unit}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">₹{item.standard_sor_rate_inr.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-700">₹{item.submitted_project_rate_inr.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-mono font-black">
                    <span className={item.variance_pct > 20 ? 'text-rose-600' : 'text-emerald-600'}>
                      {item.variance_pct > 0 ? `+${item.variance_pct}%` : `${item.variance_pct}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                      item.status.includes('ELEVATED') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
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
