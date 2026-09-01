import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Camera, 
  Smartphone, 
  Clock, 
  Compass, 
  Link2, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function DemoWalkthroughModal({ isOpen, onClose, onLaunchInvestigation, onLaunchOptimizer }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Detect: Real-Time Anomaly Flagging",
      icon: ShieldAlert,
      tag: "AI Risk Engine (0-100)",
      headline: "Flagship Case Study HERO-MPLADS-2024-001 flagged with Risk Score 88.5",
      body: "The AI Risk Engine monitors 38,450+ MPLADS works and detects statistical deviations across cost estimates, timeline delays, and March fiscal rush disbursement spikes.",
      actionLabel: "Next: Explain Why &rarr;"
    },
    {
      title: "2. Explain: Additive 'Why Flagged?' Decomposition",
      icon: Sparkles,
      tag: "Explainable AI",
      headline: "Transparent linear breakdown: Cost (+22) + Delay (+18.5) + Photo Match (+21)",
      body: "Authorities see exactly why a project looks unusual. No black-box scores. Explanations synthesize statistical IQR peer deviations into natural language guidance.",
      actionLabel: "Next: Verify Evidence &rarr;"
    },
    {
      title: "3. Verify: Duplicate Photo pHash & Citizen GPS",
      icon: Camera,
      tag: "Verification Engine",
      headline: "94.2% visual match with Block A Araria + Citizen GPS shows only 35% completion",
      body: "Perceptual hashing (pHash) catches reused completion photos. Location-bound citizen PWA capture verifies ground truth using real-time browser GPS sensors (100m geofence).",
      actionLabel: "Next: Triangulate & SLA &rarr;"
    },
    {
      title: "4. Triangulate: Evidence Matrix & SLA Bottleneck",
      icon: Clock,
      tag: "Multi-Signal Fusion",
      headline: "Verification Confidence: 28.0/100 &bull; District Review delay: 4.1x SLA benchmark",
      body: "Decoupled Verification Confidence reconciles contradictory claims. Bottleneck analyzer attributes lag to the District Review stage without naming individual officers.",
      actionLabel: "Next: Route Optimizer &rarr;"
    },
    {
      title: "5. Prioritize: Inspection Resource Optimizer",
      icon: Compass,
      tag: "Field Optimization",
      headline: "Greedy Nearest-Neighbor Route planned for Er. Rajesh Sharma (180 km limit)",
      body: "Calculates maximum audit impact per travel kilometer, scheduling high-risk and high-value works into an actionable field inspector itinerary.",
      actionLabel: "Next: Blockchain Proof &rarr;"
    },
    {
      title: "6. Prove: Immutable Blockchain Ledger & Human Action",
      icon: Link2,
      tag: "Hyperledger Fabric PoC",
      headline: "Off-Chain Evidence sealed with SHA-256 Digest & Human Officer Feedback",
      body: "All model evaluations, citizen proofs, and human officer overrides are permanently recorded in the permissioned blockchain ledger for tamper-proof accountability.",
      actionLabel: "Inspect Flagship Case Study &rarr;"
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      onLaunchInvestigation();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                SIH 2026 Official Judge Walkthrough
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                MPINTEL 60-Second Investigation Tour
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5">
          {steps.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                idx === currentStep ? 'bg-amber-500 scale-y-125' : (idx < currentStep ? 'bg-slate-900' : 'bg-slate-200')
              }`}
            ></div>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="clean-card p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white space-y-3 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-700" />
            <span className="text-xs font-mono font-bold text-blue-700 uppercase">{step.tag}</span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
            {step.headline}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {step.body}
          </p>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            &larr; Back
          </button>

          <div className="text-xs font-mono font-bold text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <span>{step.actionLabel}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
