import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Globe,
  Database
} from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function LandingPublicPortal({ onSelectProject, onOpenPWA }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const publicProjects = ALL_PROJECTS.filter(p => {
    if (selectedState && p.state !== selectedState) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.work_id.toLowerCase().includes(term) ||
      p.work_title.toLowerCase().includes(term) ||
      p.district.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            MPINTEL &bull; Public Transparency & Accountability Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            AI-Powered MPLADS Risk, Verification & Decision Intelligence
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            Empowering citizens, Hon'ble Members of Parliament, District Collectors, and Ministry Authorities with independent multi-signal verification, automated compliance checks, and spatial evidence intelligence.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Indexed Works</span>
              <strong className="text-xl font-bold text-white font-mono">38,450+</strong>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Sanctioned Value</span>
              <strong className="text-xl font-bold text-blue-400 font-mono">₹5,420 Cr</strong>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Independent Proofs</span>
              <strong className="text-xl font-bold text-emerald-400 font-mono">14,280</strong>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Blockchain Audited</span>
              <strong className="text-xl font-bold text-amber-400 font-mono">100% SHA-256</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Public Search & Verification Card */}
      <div className="clean-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Public Project Lookup & Verification</h2>
            <p className="text-xs text-slate-500">Search any MPLADS sanctioned asset to view permitted public milestone details and submit location-bound photo proof.</p>
          </div>

          <button
            onClick={onOpenPWA}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition"
          >
            <Smartphone className="w-4 h-4" />
            Citizen Location PWA Capture
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Work ID, Project Title, District..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="">All States</option>
            <option value="Bihar">Bihar</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Kerala">Kerala</option>
            <option value="Punjab">Punjab</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>

        {/* Public Project Results Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Project Scope</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Sanctioned (₹)</th>
                <th className="py-3 px-4">Physical Status</th>
                <th className="py-3 px-4">Public Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publicProjects.slice(0, 8).map((p) => (
                <tr key={p.work_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.work_title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.work_id} &bull; {p.category}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {p.district}, {p.state}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{(p.sanctioned_amount_inr / 100000).toFixed(1)} Lakhs
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.physical_progress_pct}%` }}></div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{p.physical_progress_pct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {p.risk_score >= 70 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Review Recommended
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified On-Track
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                    >
                      View Record &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Public Disclaimer Alert */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <strong className="text-slate-900 block font-bold">Public Disclaimer:</strong>
        <p>
          MPINTEL is an independent AI-powered risk intelligence layer developed for SIH 2026. It analyzes authorized public records from eSAKSHI and data.gov.in. Risk indicators represent statistical variance and evidence reconciliation signals, not determinations of wrongdoing. All official sanctions are governed by designated authorities under the MPLADS Scheme Guidelines.
        </p>
      </div>

    </div>
  );
}
