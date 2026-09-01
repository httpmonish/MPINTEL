import React, { useState } from 'react';
import { 
  LayoutGrid, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Search, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function DistrictDashboard({ 
  onSelectProject, 
  onAssignInspection,
  onOpenOptimizer 
}) {
  const [districtFilter, setDistrictFilter] = useState('Purnia');
  const [selectedRiskTier, setSelectedRiskTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const districtProjects = ALL_PROJECTS.filter(p => {
    if (districtFilter !== 'ALL' && p.district !== districtFilter) return false;
    if (selectedRiskTier !== 'ALL' && p.risk_tier !== selectedRiskTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.work_id.toLowerCase().includes(q) || p.work_title.toLowerCase().includes(q);
    }
    return true;
  });

  const highRiskCount = districtProjects.filter(p => p.risk_score >= 70).length;
  const delayedCount = districtProjects.filter(p => p.primary_bottleneck_stage.includes('SLA')).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* District Operations Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>District Administration</span>
            <span>&gt;</span>
            <span className="text-slate-900">District Planning Officer (DPO) Queue</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            District Operations & Verification Action Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer"
          >
            <option value="Purnia">District: Purnia (Bihar)</option>
            <option value="Varanasi">District: Varanasi (UP)</option>
            <option value="Wayanad">District: Wayanad (Kerala)</option>
            <option value="Amritsar">District: Amritsar (Punjab)</option>
            <option value="ALL">All Monitored Districts</option>
          </select>

          <button
            onClick={onOpenOptimizer}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            Generate Inspection Route
          </button>
        </div>
      </div>

      {/* District KPI Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clean-card p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Monitored Works</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{districtProjects.length}</div>
          <span className="text-[10px] text-slate-500">Active in {districtFilter}</span>
        </div>

        <div className="clean-card p-4 rounded-2xl border-rose-200 bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-600 uppercase block">Requires Verification</span>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{highRiskCount}</div>
          <span className="text-[10px] text-rose-600 font-bold">Priority Action Items</span>
        </div>

        <div className="clean-card p-4 rounded-2xl border-amber-200 bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Stage Bottlenecks</span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{delayedCount}</div>
          <span className="text-[10px] text-amber-600 font-bold">SLA Delay Exceeded</span>
        </div>

        <div className="clean-card p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Inspectors</span>
          <div className="text-2xl font-black text-blue-600 mt-0.5">2 Teams</div>
          <span className="text-[10px] text-emerald-600 font-bold">Capacity: 180 km/day</span>
        </div>
      </div>

      {/* District Priority Action Table */}
      <div className="clean-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">District Investigation & Inspection Queue</h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search works..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={selectedRiskTier}
              onChange={(e) => setSelectedRiskTier(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="ELEVATED">Elevated</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-3">Project Title</th>
                <th className="py-3 px-3">Sanctioned (₹)</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Verification Conf</th>
                <th className="py-3 px-3">Primary Anomaly</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {districtProjects.map((p) => (
                <tr key={p.work_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {p.work_title}
                      {p.is_hero_project && <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-700 font-bold rounded">HERO</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.work_id} &bull; {p.category}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{(p.sanctioned_amount_inr / 100000).toFixed(1)}L
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                      p.risk_score >= 70 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.risk_score}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                      p.verification_confidence < 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {p.verification_confidence}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{p.primary_bottleneck_stage}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-2xs"
                    >
                      Investigate &rarr;
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
