import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Compass, 
  Radar, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2,
  FileSearch,
  Users,
  MapPin
} from 'lucide-react';
import { NATIONAL_KPIS, STATE_RANKINGS, ALL_PROJECTS } from '../data/mpintelDataset';

export default function MinistryDashboard({ onSelectProject, onNavigate }) {
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const highRiskProjects = ALL_PROJECTS.filter(p => p.risk_score >= 70);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top National Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Ministry of Statistics & Programme Implementation (MoSPI)</span>
            <span>&gt;</span>
            <span className="text-slate-900">National Analytics Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            MPLADS National Scheme Intelligence & Risk Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            36 States & UTs Monitored
          </span>
        </div>
      </div>

      {/* 8 National KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Works</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">{NATIONAL_KPIS.total_works.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500">eSAKSHI Active</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Sanctioned</span>
          <div className="text-lg font-black text-blue-600 mt-0.5">₹{NATIONAL_KPIS.total_sanctioned_cr} Cr</div>
          <span className="text-[10px] text-slate-500">Allocated</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Disbursed</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">₹{NATIONAL_KPIS.total_expenditure_cr} Cr</div>
          <span className="text-[10px] text-slate-500">Expenditure</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Completion Rate</span>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{NATIONAL_KPIS.completion_rate_pct}%</div>
          <span className="text-[10px] text-slate-500">Verified Assets</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl border-rose-200 bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-600 uppercase block">High Risk Works</span>
          <div className="text-lg font-black text-rose-700 mt-0.5">{NATIONAL_KPIS.high_risk_works_count}</div>
          <span className="text-[10px] text-rose-600">Risk Score &ge; 70</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl border-amber-200 bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Evidence Conflict</span>
          <div className="text-lg font-black text-amber-700 mt-0.5">{NATIONAL_KPIS.verification_conflicts_count}</div>
          <span className="text-[10px] text-amber-600">Citizen vs Claim</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Delayed Works</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">{NATIONAL_KPIS.delayed_works_count}</div>
          <span className="text-[10px] text-slate-500">&gt; 1.5x SLA</span>
        </div>

        <div className="clean-card p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Audit Coverage</span>
          <div className="text-lg font-black text-indigo-600 mt-0.5">{NATIONAL_KPIS.inspection_coverage_pct}%</div>
          <span className="text-[10px] text-slate-500">Physical Verified</span>
        </div>
      </div>

      {/* State Rankings by Risk vs Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* State Rankings Table (2 Cols) */}
        <div className="lg:col-span-2 clean-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">State-Wise Risk Index & SLA Bottleneck Multipliers</h2>
              <p className="text-xs text-slate-500">Ranked by Composite Anomaly Density and Stage Velocity</p>
            </div>
            <button 
              onClick={() => onNavigate('state')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              State Deep-Dive &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Total Works</th>
                  <th className="py-2.5 px-3">Disbursed (₹)</th>
                  <th className="py-2.5 px-3">Avg Risk (0-100)</th>
                  <th className="py-2.5 px-3">High Risk Count</th>
                  <th className="py-2.5 px-3">Primary Bottleneck</th>
                  <th className="py-2.5 px-3">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {STATE_RANKINGS.map((st) => (
                  <tr key={st.state} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {st.state}
                    </td>
                    <td className="py-3 px-3 font-mono">{st.total_works.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-semibold">₹{st.expenditure_cr} Cr</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                        st.avg_risk >= 65 ? 'bg-rose-50 text-rose-700' : (st.avg_risk >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')
                      }`}>
                        {st.avg_risk}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-rose-600">{st.high_risk_count}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{st.bottleneck}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{st.utilization_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attention / Neglect Radar & Systemic Warnings */}
        <div className="clean-card rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Radar className="w-4 h-4 text-purple-600" />
              <span>Attention Deficit Radar</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Identifies regions with low utilization, stalled sanctions, or uninspected remote assets.</p>

            <div className="space-y-3 pt-3">
              {[
                { region: "Purnia & Araria (Bihar)", reason: "4.1x District Review Delay with 88.5 Avg Anomaly Score", score: 84 },
                { region: "Varanasi Tributary Sector (UP)", reason: "Reused completion photo collision with PMGSY bridge", score: 76 },
                { region: "Silchar Rural Division (Assam)", reason: "High monsoon execution lag, zero citizen verifications recorded", score: 68 },
              ].map(item => (
                <div key={item.region} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{item.region}</span>
                    <span className="font-mono text-purple-700">Score: {item.score}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('investigation')}
            className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition"
          >
            Launch Investigation Suite &rarr;
          </button>
        </div>

      </div>

      {/* High-Risk Projects Requiring Action */}
      <div className="clean-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">National High-Risk Works Queue (Requires Review)</h2>
          </div>
          <button 
            onClick={() => onNavigate('alert-center')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View All Alerts ({highRiskProjects.length}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {highRiskProjects.slice(0, 3).map((p) => (
            <div 
              key={p.work_id}
              onClick={() => onSelectProject(p)}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 cursor-pointer transition space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {p.work_id}
                </span>
                <span className="text-xs font-black font-mono text-rose-700">
                  Risk: {p.risk_score}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-2">{p.work_title}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-rose-200/50">
                <span>{p.district}, {p.state}</span>
                <span className="text-blue-600 font-bold">Investigate &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
