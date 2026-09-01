import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Layers, 
  Camera, 
  Smartphone, 
  Satellite, 
  MapPin, 
  FileText, 
  GitMerge, 
  HelpCircle, 
  Link2, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  Check,
  Send,
  Building2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function ProjectInvestigationView({ 
  project = ALL_PROJECTS[0], 
  onAssignInspection, 
  onOpenCopilot,
  onOpenPWA
}) {
  const [activeTab, setActiveTab] = useState('why-flagged');
  const [officerDecision, setOfficerDecision] = useState('APPROVED');
  const [officerNotes, setOfficerNotes] = useState('');
  const [ledgerCommitted, setLedgerCommitted] = useState(false);
  const [blockchainVerifying, setBlockchainVerifying] = useState(false);
  const [blockchainVerified, setBlockchainVerified] = useState(true);

  const tabs = [
    { id: 'why-flagged', label: '1. Why Flagged?' },
    { id: 'risk-decomp', label: '2. Risk Decomposition' },
    { id: 'peer-compare', label: '3. Peer Benchmarks' },
    { id: 'payments', label: '4. Payment Timeline' },
    { id: 'progress', label: '5. Progress Mismatch' },
    { id: 'photo-phash', label: '6. Duplicate Photo (pHash)' },
    { id: 'citizen-proof', label: '7. Citizen Evidence' },
    { id: 'satellite', label: '8. Sentinel-2 Satellite' },
    { id: 'cross-scheme', label: '9. Cross-Scheme Overlap' },
    { id: 'bottlenecks', label: '10. Stage SLA Bottlenecks' },
    { id: 'compliance', label: '11. Compliance Checklist' },
    { id: 'blockchain-audit', label: '12. Blockchain Ledger' }
  ];

  const handleVerifyBlockchain = () => {
    setBlockchainVerifying(true);
    setTimeout(() => {
      setBlockchainVerifying(false);
      setBlockchainVerified(true);
    }, 500);
  };

  const handleCommitDecision = (e) => {
    e.preventDefault();
    setLedgerCommitted(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Project Banner */}
      <div className="clean-card rounded-2xl p-6 space-y-4 border-l-4 border-l-rose-600">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                {project.work_id}
              </span>
              {project.is_hero_project && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  FLAGSHIP DEMO CASE STUDY
                </span>
              )}
              <span className="text-xs font-bold text-slate-500">
                {project.district}, {project.state} &bull; Constituency: {project.constituency}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {project.work_title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Implementing Agency: <strong className="text-slate-800">{project.implementing_agency}</strong> &bull; Contractor: <strong className="text-slate-800">{project.contractor_name}</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAssignInspection}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              Assign Inspection
            </button>
            <button
              onClick={onOpenPWA}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Citizen PWA
            </button>
            <button
              onClick={onOpenCopilot}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Copilot
            </button>
          </div>
        </div>

        {/* 5 Core Metrics Top Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div className="clean-card p-3 rounded-xl bg-rose-50/40 border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">AI Risk Score</span>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{project.risk_score} <span className="text-xs text-rose-500">/ 100</span></div>
            <span className="text-[10px] text-rose-600 font-medium">Potential Anomaly</span>
          </div>

          <div className="clean-card p-3 rounded-xl bg-amber-50/40 border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Verification Conf</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{project.verification_confidence} <span className="text-xs text-amber-500">/ 100</span></div>
            <span className="text-[10px] text-amber-600 font-medium">Evidence Conflict</span>
          </div>

          <div className="clean-card p-3 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Sanctioned</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">₹{(project.sanctioned_amount_inr / 100000).toFixed(1)}L</div>
            <span className="text-[10px] text-slate-500">Approved Budget</span>
          </div>

          <div className="clean-card p-3 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Disbursed</span>
            <div className="text-2xl font-black text-blue-600 mt-0.5">₹{(project.disbursed_amount_inr / 100000).toFixed(1)}L</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Released</span>
          </div>

          <div className="clean-card p-3 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Physical Progress</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{project.physical_progress_pct}%</div>
            <span className="text-[10px] text-rose-600 font-bold">Mismatch Flagged</span>
          </div>
        </div>
      </div>

      {/* 12-Tab Investigation Navigation Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* PANEL 1: WHY FLAGGED? */}
      {activeTab === 'why-flagged' && (
        <div className="clean-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900">Why was this project flagged? (Additive Explanation)</h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">Additive Linear Decomposition</span>
          </div>

          {/* Additive Component Risk Stack */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-700 block font-bold">Cost Anomaly</span>
              <strong className="text-lg font-black text-rose-800">+22.0 pts</strong>
              <span className="text-[10px] text-rose-600 block mt-0.5">2.8x Peer Cohort Median</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-amber-700 block font-bold">Timeline Delay</span>
              <strong className="text-lg font-black text-amber-800">+18.5 pts</strong>
              <span className="text-[10px] text-amber-600 block mt-0.5">4.1x SLA District Review</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-700 block font-bold">Payment Spike</span>
              <strong className="text-lg font-black text-rose-800">+14.0 pts</strong>
              <span className="text-[10px] text-rose-600 block mt-0.5">72% March Rush Velocity</span>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-purple-700 block font-bold">Evidence Conflict</span>
              <strong className="text-lg font-black text-purple-800">+21.0 pts</strong>
              <span className="text-[10px] text-purple-600 block mt-0.5">94.2% pHash Duplicate</span>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-700 block font-bold">Cross-Scheme</span>
              <strong className="text-lg font-black text-blue-800">+13.0 pts</strong>
              <span className="text-[10px] text-blue-600 block mt-0.5">Overlap with PMGSY Culvert</span>
            </div>
          </div>

          {/* Plain English Synthesis */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Natural Language Synthesized Explanation</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              "Project <strong>{project.work_id}</strong> is significantly more expensive than comparable works in the same budget tier in Bihar and experienced an unusually prolonged District Review bottleneck (91 days vs 22-day SLA benchmark). While 100% of sanctioned funds (₹45.0L) were disbursed in a rapid fiscal year-end release, submitted completion photography matches a pre-existing project in Block A (Araria) with 94.2% perceptual similarity. Independent citizen location-bound verification captures show an incomplete foundation with 35% physical completion."
            </p>
          </div>
        </div>
      )}

      {/* PANEL 2: DUPLICATE PHOTO (PHASH) */}
      {activeTab === 'photo-phash' && (
        <div className="clean-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-extrabold text-slate-900">Perceptual Hash (pHash) Duplicate Photo Detection</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-mono font-bold text-xs">
              94.2% Visual Match
            </span>
          </div>

          {/* Side by Side Image Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 clean-card p-4 rounded-xl">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-900">Current Work ID: {project.work_id}</span>
                <span className="text-slate-500">Submitted: Aug 2024</span>
              </div>
              <div className="h-56 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs overflow-hidden relative">
                <div className="text-center p-4">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span>Completion Photo Submitted by DRDA</span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">pHash: {project.photo_similarity?.current_phash}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 clean-card p-4 rounded-xl border-rose-300 bg-rose-50/20">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-900">Matched Work ID: {project.photo_similarity?.matched_work_id}</span>
                <span className="text-rose-700">Sanctioned: Jun 2023</span>
              </div>
              <div className="h-56 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs overflow-hidden relative">
                <div className="text-center p-4">
                  <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <span className="text-rose-300">Historical Asset Photo (Araria Block A)</span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">pHash: {project.photo_similarity?.matched_phash}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>System Safeguard Note:</strong> Perceptual hash matches indicate high visual similarity across structural features and orientation. This is flagged as an anomaly signal to prompt on-site physical verification, not automated proof of misconduct.
          </div>
        </div>
      )}

      {/* PANEL 3: CITIZEN EVIDENCE & LOCATION PWA */}
      {activeTab === 'citizen-proof' && (
        <div className="clean-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900">Location-Bound Citizen Verification Stream</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">Haversine Geodesic Distance Verified</span>
          </div>

          <div className="space-y-3">
            {project.evidence_signals.map((sig, idx) => (
              <div key={idx} className="clean-card p-4 rounded-xl flex items-start justify-between text-xs gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{sig.name}</div>
                  <p className="text-slate-600 leading-relaxed">{sig.detail}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] shrink-0 ${
                  sig.status.includes('SUPPORTS') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  sig.status.includes('CONTRADICTS') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {sig.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANEL 4: CROSS-SCHEME OVERLAP */}
      {activeTab === 'cross-scheme' && (
        <div className="clean-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-extrabold text-slate-900">Cross-Scheme Double-Dipping Reconciliation</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-xs">
              86.4% Scope Overlap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="clean-card p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">MPLADS Sanction Record</span>
              <div className="font-bold text-slate-900">{project.work_title}</div>
              <div className="text-slate-600 font-mono">Value: ₹45,00,000 &bull; Coordinates: {project.latitude}, {project.longitude}</div>
            </div>

            <div className="clean-card p-4 rounded-xl space-y-2 border-purple-200 bg-purple-50/20">
              <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">External Scheme: PMGSY-III</span>
              <div className="font-bold text-purple-950">Approach Culvert & Civic Amenity Complex Block B</div>
              <div className="text-slate-600 font-mono">Value: ₹38,50,000 &bull; Distance: 32m from MPLADS point</div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 5: BLOCKCHAIN EVIDENCE LEDGER */}
      {activeTab === 'blockchain-audit' && (
        <div className="clean-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">Permissioned Blockchain Evidence Ledger (SHA-256)</h2>
            </div>
            <button
              onClick={handleVerifyBlockchain}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${blockchainVerifying ? 'animate-spin' : ''}`} />
              Verify Cryptographic Proof
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs space-y-2 overflow-x-auto">
            <div className="text-slate-400">// Hyperledger Fabric Ledger State</div>
            <div>Work ID: {project.work_id}</div>
            <div>Block Height: #104829</div>
            <div>SHA-256 Hash: {project.provenance?.cryptographic_sha256}</div>
            <div>Signer Authority: MoSPI_eSAKSHI_Node_01</div>
            <div>Status: <span className="text-emerald-300 font-bold">INTEGRITY_VERIFIED_UNCHANGED (0.00ms Delta)</span></div>
          </div>

          {/* Record Officer Decision */}
          <form onSubmit={handleCommitDecision} className="clean-card p-4 rounded-xl space-y-3 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Human Authority Decision & Feedback</h3>
            <div className="grid grid-cols-3 gap-2">
              {['ASSIGN_PHYSICAL_INSPECTION', 'REQUEST_EVIDENCE_RECONCILIATION', 'MARK_FALSE_ALARM'].map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setOfficerDecision(d)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    officerDecision === d ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {d.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <textarea 
              rows={2}
              placeholder="Enter official rationale for audit log..."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              {ledgerCommitted ? 'Decision Recorded & Sealed in Ledger' : 'Commit Decision to Evidence Ledger'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
