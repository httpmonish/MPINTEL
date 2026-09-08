"use client";

import React from "react";
import Link from "next/link";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { RiskGauge } from "@/components/charts/RiskGauge";
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Coins,
  Clock,
  ImageIcon,
  CheckCircle2,
  FileSearch,
  ExternalLink,
  Award,
  BarChart3,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const sampleRiskScore = {
    compositeScore: 84,
    tier: "high" as const,
    whyFlaggedSummary:
      "Flagged for verification due to: Peer Cost Outlier (+25), Stage SLA Bottleneck (+18), Duplicate Evidence (+20), Disbursement Compliance (+12).",
    breakdown: [
      {
        signal: "cost_anomaly" as const,
        label: "Peer Cost Outlier",
        points: 25,
        maxPoints: 25,
        reason: "Cost (₹92.0L) exceeds peer cohort normal range (₹5.0L–₹10.0L) by 1127%.",
        isTriggered: true,
      },
      {
        signal: "sla_delay" as const,
        label: "Stage SLA Bottleneck",
        points: 18,
        maxPoints: 20,
        reason: "Technical Sanction stage delayed 4.1× normative statutory timeline.",
        isTriggered: true,
      },
      {
        signal: "photo_similarity" as const,
        label: "Duplicate Evidence (pHash)",
        points: 20,
        maxPoints: 20,
        reason: "Site photo exhibits 97% perceptual visual fingerprint match with prior project.",
        isTriggered: true,
      },
      {
        signal: "payment_anomaly" as const,
        label: "Disbursement & UC Compliance",
        points: 12,
        maxPoints: 15,
        reason: "Tranche #2 released without mandatory prior Utilization Certificate (UC).",
        isTriggered: true,
      },
      {
        signal: "gis_similarity" as const,
        label: "GIS Spatial Overlap",
        points: 0,
        maxPoints: 16,
        reason: "Coordinates within standard geographic dispersion norms.",
        isTriggered: false,
      },
    ],
    calculatedAt: new Date().toISOString(),
    algorithmVersion: "RiskLens-v2.1",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Public Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              RiskLens
            </span>
            <span className="text-[11px] text-slate-500 font-medium ml-1.5 hidden sm:inline">
              for MPLADS
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
            How Scoring Works
          </Link>
          <Link href="/offline" className="hover:text-slate-900 transition-colors">
            Offline Demo
          </Link>
          <Link
            href="/district"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="space-y-6 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Official SIH 2026 Submission
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            From Status Monitoring to{" "}
            <span className="text-blue-600">Explainable Risk Intelligence</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Operating as an intelligence layer on top of the government&apos;s eSAKSHI system. Detects SLA delays, peer cost outliers, and duplicate completion evidence with complete mathematical explainability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/district"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>View Live Prototype</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center"
            >
              How Scoring Works
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
            <DataSourceBadge type="synthetic" />
            <span>• Zero Real Personal Names</span>
            <span>• Human-in-the-Loop</span>
          </div>
        </div>

        {/* Hero Visual: Interactive Telemetry Risk Gauge Card */}
        <div className="shrink-0 w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                HERO-MPLADS-001
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Solar High-Mast Grid
              </span>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              High Risk
            </span>
          </div>

          <div className="py-2 flex flex-col items-center">
            <RiskGauge riskScore={sampleRiskScore} size="lg" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="font-semibold text-slate-700 mb-1">
              Live Signal Attribution:
            </div>
            {sampleRiskScore.breakdown.slice(0, 3).map((b) => (
              <div
                key={b.signal}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px]"
              >
                <span className="text-slate-700 font-medium">{b.label}</span>
                <span className="font-bold text-red-600">+{b.points} pts</span>
              </div>
            ))}
          </div>

          <Link
            href="/investigation/HERO-MPLADS-001"
            className="block text-center w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors"
          >
            Launch Full Investigation Screen →
          </Link>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Built on 5 Invariant Architectural Pillars
            </h2>
            <p className="text-xs text-slate-500">
              Designed specifically for government compliance and multi-tier public administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Peer Cohort Cost Comparison</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never compares against a simplistic national average. Clusters works by sector, terrain, and fiscal year to compute legitimate statistical z-score deviations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Perceptual Hash Duplicate Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates 64-bit pHash fingerprints and bitwise Hamming distances to spot reused completion evidence photos across distinct projects and tenures.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Role-Attributed SLA Bottlenecks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tracks stage delays against statutory norms (45-day sanction, 1-year completion) with objective designation attribution, with zero naming of individual officers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Roadmap Section (Text Only - Strict Compliance with Exclusion List) */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Compass className="w-3.5 h-3.5" />
            Forward-Looking Vision
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Future Research & Platform Roadmap
          </h2>
          <p className="text-xs text-slate-500">
            Excluded from current MVP scope to prioritize deep explainability over shallow feature counts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
            <span className="font-bold text-slate-900 block">1. Satellite SAR Change Detection</span>
            <p className="text-slate-500">
              Temporal Sentinel-1/2 synthetic aperture radar analysis for physical surface elevation changes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
            <span className="font-bold text-slate-900 block">2. ML Delay Forecasting</span>
            <p className="text-slate-500">
              Predictive gradient-boosted models forecasting contractor abandonment prior to milestone breach.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
            <span className="font-bold text-slate-900 block">3. Procurement Entity Graph</span>
            <p className="text-slate-500">
              Cross-district contractor syndicate detection via multi-relational graph neural networks.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
            <span className="font-bold text-slate-900 block">4. Multilingual LLM Citizen Assistant</span>
            <p className="text-slate-500">
              Voice-first local language RTI and MPLADS grievance filing assistant for rural constituents.
            </p>
          </div>
        </div>
      </section>

      {/* Footer with Civic Landmark Motif (Inspired by Screenshot 5) */}
      <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800 pt-12 pb-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                RiskLens for MPLADS
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                From monitoring to risk intelligence. An explainable AI verification platform built for transparent public infrastructure delivery across parliamentary constituencies.
              </p>
              <div className="pt-1">
                <DataSourceBadge type="synthetic" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Platform
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <Link href="/district" className="hover:text-white transition-colors">
                    District Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/queue" className="hover:text-white transition-colors">
                    Investigation Queue
                  </Link>
                </li>
                <li>
                  <Link href="/investigation/HERO-MPLADS-001" className="hover:text-white transition-colors">
                    Hero Spotlight (30s)
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white transition-colors">
                    How Scoring Works
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                Ethical Safeguards
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li>• No Real Personal Names</li>
                <li>• Neutral Regulatory Tone</li>
                <li>• Human Officer Discretion</li>
                <li>• 100% Offline Pitch Ready</li>
              </ul>
            </div>
          </div>

          {/* Civic Heritage Skyline Motif Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              Smart India Hackathon (SIH) 2026 Official Submission • Team AI-RiskLens
            </div>
            <div>
              Built for Ministry of Statistics and Programme Implementation (MoSPI)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
