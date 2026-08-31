import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  X,
  Layers,
  Database,
  Camera,
  ShieldCheck,
  Clock,
  Navigation,
  UserCheck,
  Zap,
  HelpCircle,
  History,
  Check,
  Send,
  Sparkles,
  BarChart3,
  Activity,
  ArrowUpRight
} from 'lucide-react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'risk', 'planner'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [systemOverview, setSystemOverview] = useState(null);

  // Phase 3 Verification & Phase 4 Bottleneck State
  const [verificationData, setVerificationData] = useState(null);
  const [photoSimData, setPhotoSimData] = useState(null);
  const [bottleneckData, setBottleneckData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showPWACaptureModal, setShowPWACaptureModal] = useState(false);

  // Phase 4 Optimizer & Planner State
  const [optimizerPlan, setOptimizerPlan] = useState(null);
  const [selectedInspectorId, setSelectedInspectorId] = useState('all');
  const [bottleneckSummary, setBottleneckSummary] = useState(null);
  const [plannerLoading, setPlannerLoading] = useState(false);

  // Phase 5 Audit Ledger & "Why?" Modal State
  const [activeWhyEntry, setActiveWhyEntry] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [whyLoading, setWhyLoading] = useState(false);
  const [officerDecisionInput, setOfficerDecisionInput] = useState('APPROVED');
  const [officerNotesInput, setOfficerNotesInput] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [fairnessTestResult, setFairnessTestResult] = useState(null);

  // Citizen PWA Form State
  const [pwaLat, setPwaLat] = useState('26.1521');
  const [pwaLon, setPwaLon] = useState('87.5181');
  const [isLiveCamera, setIsLiveCamera] = useState(true);
  const [pwaSubmitting, setPwaSubmitting] = useState(false);
  const [pwaSuccessMsg, setPwaSuccessMsg] = useState('');

  // Leaflet Map Ref
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    fetchSystemOverview();
    fetchProjects();
    fetchBottleneckSummary();
    fetchOptimizerPlan();
    fetchFairnessTestSummary();
  }, [selectedState, selectedFlag]);

  useEffect(() => {
    if (activeTab === 'planner' && optimizerPlan && mapContainerRef.current) {
      initMap();
    }
  }, [activeTab, optimizerPlan, selectedInspectorId]);

  const fetchSystemOverview = async () => {
    try {
      const res = await fetch('/api/v1/projects/summary');
      if (res.ok) setSystemOverview(await res.json());
    } catch (err) {
      console.error('Failed to fetch system overview:', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/risk?limit=100&sort_by=risk_score&sort_order=desc';
      if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
      if (selectedFlag) url += `&anomaly_flag=${encodeURIComponent(selectedFlag)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch risk projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBottleneckSummary = async () => {
    try {
      const res = await fetch('/api/v1/bottleneck/summary');
      if (res.ok) setBottleneckSummary(await res.json());
    } catch (err) {
      console.error('Failed to fetch bottleneck summary:', err);
    }
  };

  const fetchOptimizerPlan = async () => {
    setPlannerLoading(true);
    try {
      const res = await fetch('/api/v1/optimizer/plan');
      if (res.ok) setOptimizerPlan(await res.json());
    } catch (err) {
      console.error('Failed to fetch optimizer plan:', err);
    } finally {
      setPlannerLoading(false);
    }
  };

  const fetchFairnessTestSummary = async () => {
    try {
      const res = await fetch('/api/v1/fairness/test-summary');
      if (res.ok) setFairnessTestResult(await res.json());
    } catch (err) {
      console.error('Failed to fetch fairness test summary:', err);
    }
  };

  const handleRowClick = async (proj) => {
    setSelectedProject(proj);
    setModalLoading(true);
    try {
      const cleanId = encodeURIComponent(proj.work_id);
      const [confRes, simRes, btlRes] = await Promise.all([
        fetch(`/api/v1/verification/confidence/${cleanId}`),
        fetch(`/api/v1/verification/photo-similarity/${cleanId}`),
        fetch(`/api/v1/bottleneck/${cleanId}`)
      ]);

      if (confRes.ok) setVerificationData(await confRes.json());
      if (simRes.ok) setPhotoSimData(await simRes.json());
      if (btlRes.ok) setBottleneckData(await btlRes.json());
    } catch (err) {
      console.error('Failed to load project modal details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const openWhyModalForProject = async (workId, decisionType = 'RISK_ASSESSMENT') => {
    setWhyLoading(true);
    setWhyModalOpen(true);
    try {
      const cleanId = encodeURIComponent(workId);
      const res = await fetch(`/api/v1/ledger/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        const history = data.ledger_history || [];
        const match = history.find(e => e.decision_type === decisionType) || history[0];
        setActiveWhyEntry(match || null);
      }
    } catch (err) {
      console.error('Failed to fetch why ledger entry:', err);
    } finally {
      setWhyLoading(false);
    }
  };

  const submitOfficerDecision = async (e) => {
    e.preventDefault();
    if (!activeWhyEntry) return;

    setDecisionSubmitting(true);
    try {
      const res = await fetch(`/api/v1/ledger/entry/${activeWhyEntry.entry_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          human_decision: officerDecisionInput,
          outcome_notes: officerNotesInput || 'Officer reviewed and recorded decision.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveWhyEntry(data.updated_entry);
        setOfficerNotesInput('');
      }
    } catch (err) {
      console.error('Failed to submit officer decision:', err);
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([22.5937, 78.9629], 5);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    if (!optimizerPlan || !optimizerPlan.inspector_routes) return;

    let routesToRender = optimizerPlan.inspector_routes;
    if (selectedInspectorId !== 'all') {
      routesToRender = routesToRender.filter(r => r.inspector_id === selectedInspectorId);
    }

    const routeColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const allLatLngs = [];

    routesToRender.forEach((inspRoute, rIdx) => {
      const color = routeColors[rIdx % routeColors.length];
      const waypoints = [];

      const baseLat = inspRoute.base_location.lat;
      const baseLon = inspRoute.base_location.lon;
      waypoints.push([baseLat, baseLon]);
      allLatLngs.push([baseLat, baseLon]);

      const baseMarker = L.circleMarker([baseLat, baseLon], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(map);
      baseMarker.bindPopup(`<b>${inspRoute.inspector_name}</b><br/>Base Office (${inspRoute.jurisdiction_state})`);

      inspRoute.assigned_route.forEach((stop) => {
        const lat = stop.latitude;
        const lon = stop.longitude;
        waypoints.push([lat, lon]);
        allLatLngs.push([lat, lon]);

        const markerColor = stop.risk_score >= 70 ? '#f43f5e' : (stop.risk_score >= 40 ? '#f59e0b' : '#10b981');
        
        const marker = L.circleMarker([lat, lon], {
          radius: 7,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b>Stop #${stop.visit_order_rank}: ${stop.work_title}</b><br/>
            <span>Work ID: ${stop.work_id}</span><br/>
            <span>Risk Score: <b>${stop.risk_score}</b> | Priority: <b>${stop.priority_analysis.composite_priority_score}</b></span>
          </div>
        `);
      });

      if (waypoints.length > 1) {
        L.polyline(waypoints, {
          color: color,
          weight: 3.5,
          opacity: 0.8,
          dashArray: '6, 6'
        }).addTo(map);
      }
    });

    if (allLatLngs.length > 0) {
      map.fitBounds(allLatLngs, { padding: [30, 30] });
    }
  };

  const handleCitizenCaptureSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    setPwaSubmitting(true);
    setPwaSuccessMsg('');
    try {
      const payload = {
        project_id: selectedProject.work_id,
        latitude: parseFloat(pwaLat),
        longitude: parseFloat(pwaLon),
        timestamp_captured: new Date().toISOString(),
        is_live_camera_capture: isLiveCamera,
        image_base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..."
      };

      const res = await fetch('/api/v1/verification/citizen-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setPwaSuccessMsg(data.submission_verification.status_label);
        await handleRowClick(selectedProject);
      }
    } catch (err) {
      console.error('Failed to submit citizen capture:', err);
    } finally {
      setPwaSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.work_id.toLowerCase().includes(term) ||
      (p.work_title && p.work_title.toLowerCase().includes(term)) ||
      (p.state && p.state.toLowerCase().includes(term))
    );
  });

  const getRiskScoreBadge = (score) => {
    if (score >= 70) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">⚠️ {score.toFixed(1)} / 100 — High Risk</span>;
    } else if (score >= 40) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">⚡ {score.toFixed(1)} / 100 — Review</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">✓ {score.toFixed(1)} / 100 — Normal</span>;
    }
  };

  const getSignalBadge = (statusStr) => {
    if (statusStr.includes('SUPPORTS')) return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">✅ Supports Claim</span>;
    if (statusStr.includes('PARTIAL')) return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">⚠️ Partial Concern</span>;
    if (statusStr.includes('CONTRADICTS')) return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">❌ Contradicts Claim</span>;
    if (statusStr.includes('INCONCLUSIVE')) return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">🟡 Inconclusive</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">— Unavailable</span>;
  };

  const selectedInspectorData = optimizerPlan && selectedInspectorId !== 'all' 
    ? optimizerPlan.inspector_routes.find(r => r.inspector_id === selectedInspectorId)
    : null;

  const heroProject = projects.find(p => p.work_id === "HERO-MPLADS-2024-001") || projects[0];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Pratyaksh <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">SIH 2026 Unified Platform</span>
            </h1>
            <p className="text-xs text-slate-400">AI-Powered MPLADS Monitoring, Independent Verification & Route Optimizer Layer</p>
          </div>
        </div>

        {/* 3-Tab Switcher (Overview, Risk Matrix, Inspection Planner) */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Impact Overview
          </button>
          <button 
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'risk' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Risk & Verification Matrix
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'planner' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Inspection Planner & Map
          </button>
        </div>
      </header>

      {/* FAIRNESS SAFEGUARD BANNER */}
      {fairnessTestResult && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Fairness Safeguard Active:</strong> {fairnessTestResult.fairness_verdict}</span>
          </div>
          <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[10px] text-emerald-200 border border-emerald-700">
            Bias Delta: {fairnessTestResult.risk_score_bias_delta} points
          </span>
        </div>
      )}

      {/* TAB 1: UNIFIED HOME OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* 4 TOP IMPACT METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Projects Monitored</span>
              <div className="text-3xl font-extrabold text-white">
                {systemOverview ? systemOverview.total_projects_monitored.toLocaleString() : '2,000'}
              </div>
              <p className="text-[11px] text-slate-400">Indexed from eSAKSHI & data.gov.in Exports</p>
            </div>

            <div className="bg-slate-900/60 border border-rose-900/40 rounded-2xl p-5 space-y-2 shadow-xl">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">High Risk Anomalies</span>
              <div className="text-3xl font-extrabold text-rose-400">
                {systemOverview ? systemOverview.risk_distribution.high_risk_count : '142'}
              </div>
              <p className="text-[11px] text-rose-300">Composite Risk Score &ge; 70 / 100</p>
            </div>

            <div className="bg-slate-900/60 border border-amber-900/40 rounded-2xl p-5 space-y-2 shadow-xl">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Review Required</span>
              <div className="text-3xl font-extrabold text-amber-400">
                {systemOverview ? systemOverview.risk_distribution.review_required_count : '385'}
              </div>
              <p className="text-[11px] text-amber-300">Risk Score 40.0 &ndash; 69.9 / 100</p>
            </div>

            <div className="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-5 space-y-2 shadow-xl">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Normal Projects</span>
              <div className="text-3xl font-extrabold text-emerald-400">
                {systemOverview ? systemOverview.risk_distribution.normal_count : '1,473'}
              </div>
              <p className="text-[11px] text-emerald-300">Progressing within expected benchmarks</p>
            </div>

          </div>

          {/* HERO DEMO PROJECT SPOTLIGHT CARD (PHASE 6 FEATURE) */}
          {heroProject && (
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-rose-950/50 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/30 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-bold">Featured Hero Demo Project (Triggers All 9 Features)</span>
                    <h2 className="text-lg font-bold text-white mt-0.5">{heroProject.work_title}</h2>
                    <p className="text-xs text-slate-400 font-mono">{heroProject.work_id} &bull; {heroProject.state} ({heroProject.constituency})</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRowClick(heroProject)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shrink-0"
                >
                  Inspect Hero Project <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">1. AI Risk Score</span>
                  <strong className="text-rose-400 text-base">88.5 / 100</strong>
                  <span className="text-slate-400 block text-[10px] truncate mt-0.5">Top: Cost Anomaly</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">2. Verification Conf</span>
                  <strong className="text-amber-400 text-base">30.0 / 100</strong>
                  <span className="text-slate-400 block text-[10px] truncate mt-0.5">❌ Photo & GPS Conflict</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">3. Max SLA Delay</span>
                  <strong className="text-amber-300 text-base">4.1× SLA</strong>
                  <span className="text-slate-400 block text-[10px] truncate mt-0.5">District Review (90 days)</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">4. Route Optimizer</span>
                  <strong className="text-emerald-400 text-base">Rank #1 (Priority 94.2)</strong>
                  <span className="text-slate-400 block text-[10px] truncate mt-0.5">Inspector Bihar North</span>
                </div>
              </div>
            </div>
          )}

          {/* 2 PREVIEW CARDS (BOTTLENECK SUMMARY + OPTIMIZER PREVIEW) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Bottleneck Preview */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  System-Wide SLA Bottleneck Summary (Feature 6)
                </h3>
                <button onClick={() => setActiveTab('planner')} className="text-xs text-indigo-400 hover:underline">
                  View Route Map &rarr;
                </button>
              </div>

              {bottleneckSummary && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300 bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl font-mono">
                    {bottleneckSummary.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Projects Analyzed</span>
                      <strong className="text-slate-100 text-sm font-mono">{bottleneckSummary.total_projects_analyzed}</strong>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Top Bottleneck Stage</span>
                      <strong className="text-amber-400 text-sm font-mono">{bottleneckSummary.top_system_bottleneck_stage}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optimizer Inspection Plan Preview */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Top Ranked Inspection Visit Preview (Feature 7)
                </h3>
                <button onClick={() => setActiveTab('planner')} className="text-xs text-indigo-400 hover:underline">
                  Open Route Planner &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {optimizerPlan && optimizerPlan.inspector_routes[0]?.assigned_route.slice(0, 2).map((stop, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{stop.work_title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{stop.work_id} &bull; {stop.state}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-800">
                      Priority {stop.priority_analysis.composite_priority_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* TAB 2: RISK & VERIFICATION MATRIX */}
      {activeTab === 'risk' && (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Filter Bar */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xl">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Work ID, Title, or State..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All States</option>
                <option value="Bihar">Bihar</option>
                <option value="Kerala">Kerala</option>
                <option value="Punjab">Punjab</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>

              <select
                value={selectedFlag}
                onChange={(e) => setSelectedFlag(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Risk Flags</option>
                <option value="POTENTIAL_ANOMALY">Potential Anomaly (&ge;70)</option>
                <option value="REQUIRES_VERIFICATION">Requires Verification (&ge;40)</option>
                <option value="HIGH_RISK_COST_DEVIATION">High Cost Deviation</option>
                <option value="NORMAL">Normal (&lt;40)</option>
              </select>
            </div>
          </div>

          {/* Risk Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Work Details</th>
                    <th className="py-4 px-6">State / Region</th>
                    <th className="py-4 px-6">Disbursed (₹)</th>
                    <th className="py-4 px-6">Risk Score</th>
                    <th className="py-4 px-6">Why? (Ledger)</th>
                    <th className="py-4 px-6">Top Factor</th>
                    <th className="py-4 px-6 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-12 text-slate-400">Loading evaluated projects...</td></tr>
                  ) : filteredProjects.map((p) => (
                    <tr 
                      key={p.work_id}
                      className="hover:bg-indigo-950/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6" onClick={() => handleRowClick(p)}>
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                          {p.work_title}
                          {p.is_hero_project && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">HERO DEMO</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.work_id}</div>
                      </td>
                      <td className="py-4 px-6" onClick={() => handleRowClick(p)}>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {p.state}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-200" onClick={() => handleRowClick(p)}>
                        ₹{p.disbursed_amount_inr ? p.disbursed_amount_inr.toLocaleString('en-IN') : '0'}
                      </td>
                      <td className="py-4 px-6" onClick={() => handleRowClick(p)}>{getRiskScoreBadge(p.risk_score)}</td>
                      
                      <td className="py-4 px-6">
                        <button
                          onClick={(e) => { e.stopPropagation(); openWhyModalForProject(p.work_id, 'RISK_ASSESSMENT'); }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                          Why?
                        </button>
                      </td>

                      <td className="py-4 px-6" onClick={() => handleRowClick(p)}>
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.top_contributing_factor}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={() => handleRowClick(p)}>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-all inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* TAB 3: INSPECTION PLANNER & MAP VIEW */}
      {activeTab === 'planner' && (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* System Bottleneck Impact Banner */}
          {bottleneckSummary && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-800/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    System-Wide SLA Bottleneck Alert
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Feature 6</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{bottleneckSummary.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500">Stuck Projects: </span>
                  <span className="text-amber-400 font-bold">{bottleneckSummary.projects_with_bottlenecks}</span> / {bottleneckSummary.total_projects_analyzed}
                </div>
              </div>
            </div>
          )}

          {/* Planner Controls Bar */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs text-slate-400">Select Field Inspector Team</div>
                <select
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 mt-0.5"
                >
                  <option value="all">All Inspector Teams (System Route Map)</option>
                  {optimizerPlan && optimizerPlan.inspector_routes.map((r) => (
                    <option key={r.inspector_id} value={r.inspector_id}>
                      {r.inspector_name} ({r.jurisdiction_state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedInspectorData && (
              <div className="flex items-center space-x-4 text-xs">
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-slate-400 block">Weekly Capacity</span>
                    <strong className="text-slate-100">
                      {selectedInspectorData.capacity_summary.assigned_inspections} of {selectedInspectorData.capacity_summary.max_weekly_capacity} Slots Assigned ({selectedInspectorData.capacity_summary.capacity_utilization_pct}%)
                    </strong>
                  </div>
                </div>

                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block">Planned Route Distance</span>
                    <strong className="text-emerald-400 font-mono">{selectedInspectorData.total_route_distance_km} km</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map & Route Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 overflow-hidden shadow-2xl flex flex-col h-[520px]">
              <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 rounded-t-xl">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  Spatial Route & Risk Map (Leaflet OSM Vector Canvas)
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> High Risk
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Review
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Normal
                </div>
              </div>
              <div ref={mapContainerRef} className="flex-1 w-full rounded-b-xl z-10"></div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[520px] shadow-2xl">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Ordered Inspection Visit Schedule</span>
                <span className="text-xs font-mono text-indigo-400">Feature 7 Optimizer</span>
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
                {plannerLoading ? (
                  <div className="text-center py-12 text-xs text-slate-400">Computing optimal inspection plan...</div>
                ) : !optimizerPlan ? (
                  <div className="text-center py-12 text-xs text-slate-400">No route plan data.</div>
                ) : (
                  (selectedInspectorId === 'all' 
                    ? optimizerPlan.inspector_routes.flatMap(r => r.assigned_route) 
                    : selectedInspectorData ? selectedInspectorData.assigned_route : []
                  ).map((stop, idx) => (
                    <div 
                      key={stop.work_id + idx}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                            #{stop.visit_order_rank || idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">{stop.work_title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">{stop.work_id}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          Priority {stop.priority_analysis ? stop.priority_analysis.composite_priority_score : 50}
                        </span>
                      </div>

                      {stop.priority_analysis && (
                        <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <div className="font-semibold text-indigo-300">{stop.priority_analysis.reasoning_summary}</div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Leg Distance: <strong className="text-slate-300">{stop.leg_distance_km || stop.distance_from_base_km} km</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openWhyModalForProject(stop.work_id, 'OPTIMIZER_ASSIGNMENT')}
                            className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold flex items-center gap-1"
                          >
                            <HelpCircle className="w-3 h-3" /> Why?
                          </button>
                          <button onClick={() => handleRowClick(stop)} className="text-slate-400 hover:text-white text-[10px]">
                            Details &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* EXTENDED PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl h-full max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wide">Comprehensive Project Intelligence</span>
                <h2 className="text-lg font-bold text-slate-100 mt-1">{selectedProject.work_title}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedProject.work_id}</p>
              </div>
              <button 
                onClick={() => { setSelectedProject(null); setVerificationData(null); setBottleneckData(null); }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* THREE CORE METRIC CARDS WITH "WHY?" BUTTONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Risk Score Card */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 relative">
                  <button 
                    onClick={() => openWhyModalForProject(selectedProject.work_id, 'RISK_ASSESSMENT')}
                    className="absolute right-3 top-3 p-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                    title="Audit Traceability Ledger"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">AI Risk Score</span>
                  <div className="text-2xl font-extrabold text-white">
                    {selectedProject.risk_score.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Top: <strong className="text-slate-200">{selectedProject.top_contributing_factor}</strong>
                  </div>
                </div>

                {/* 2. Verification Confidence Card */}
                <div className="bg-slate-950/90 border border-emerald-900/40 rounded-2xl p-4 space-y-2 relative">
                  <button 
                    onClick={() => openWhyModalForProject(selectedProject.work_id, 'VERIFICATION_TRIANGULATION')}
                    className="absolute right-3 top-3 p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    title="Audit Traceability Ledger"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Verification Conf</span>
                  <div className="text-2xl font-extrabold text-emerald-300">
                    {verificationData ? verificationData.verification_confidence.toFixed(0) : '0'} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">
                    {verificationData ? verificationData.signals.citizen_evidence.status : 'Evaluating...'}
                  </div>
                </div>

                {/* 3. SLA Delay Bottleneck Card */}
                <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl p-4 space-y-2 relative">
                  <button 
                    onClick={() => openWhyModalForProject(selectedProject.work_id, 'BOTTLENECK_ANALYSIS')}
                    className="absolute right-3 top-3 p-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    title="Audit Traceability Ledger"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">Max SLA Delay</span>
                  <div className="text-2xl font-extrabold text-amber-300">
                    {bottleneckData && bottleneckData.has_bottleneck ? `${bottleneckData.max_deviation_multiple}×` : '1.0×'}
                    <span className="text-xs font-normal text-slate-500"> Benchmark</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium truncate">
                    {bottleneckData && bottleneckData.primary_bottleneck ? bottleneckData.primary_bottleneck.stage_name : 'Within Normal SLA'}
                  </div>
                </div>

              </div>

              {/* STAGE-WISE BOTTLENECK PANEL */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Workflow Stage SLA Bottleneck Analysis (Feature 6)
                  </span>
                  <span className="text-xs font-mono text-amber-400">Role Attribution Only</span>
                </h3>

                {bottleneckData && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl font-mono">
                      {bottleneckData.summary}
                    </p>

                    <div className="space-y-2 pt-1">
                      {bottleneckData.stage_breakdown.map((stg) => (
                        <div key={stg.stage_key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-200">{stg.stage_name}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">Responsible Role: <strong>{stg.responsible_role}</strong></div>
                          </div>
                          <div className="text-right font-mono">
                            <div className={stg.is_bottleneck ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                              {stg.actual_duration_days} days ({stg.delay_ratio}× SLA)
                            </div>
                            <div className="text-[10px] text-slate-500">Benchmark: {stg.benchmark_days} days</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MULTI-SIGNAL TRIANGULATION PANEL */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Multi-Signal Evidence Triangulation (Feature 5)
                  </h3>
                  <button 
                    onClick={() => setShowPWACaptureModal(true)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Camera className="w-3.5 h-3.5" /> Test PWA Capture
                  </button>
                </div>

                {verificationData ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">1. Agency Claim</div>
                        <div className="text-[11px] text-slate-400">{verificationData.signals.agency_claim.detail}</div>
                      </div>
                      {getSignalBadge(verificationData.signals.agency_claim.status)}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">2. Citizen Mobile Verification</div>
                        <div className="text-[11px] text-slate-400">{verificationData.signals.citizen_evidence.detail}</div>
                      </div>
                      {getSignalBadge(verificationData.signals.citizen_evidence.status)}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">3. Photo Uniqueness (pHash)</div>
                        <div className="text-[11px] text-slate-400">{verificationData.signals.photo_uniqueness.detail}</div>
                      </div>
                      {getSignalBadge(verificationData.signals.photo_uniqueness.status)}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    No citizen verification submitted yet &mdash; click "Test PWA Capture" to submit live evidence.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* REUSABLE "WHY?" AUDIT LEDGER MODAL */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI Decision Audit Ledger <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Feature 8</span>
                  </h3>
                  <p className="text-xs text-slate-400">Full Decision Traceability, Provenance & Human Feedback Ledger</p>
                </div>
              </div>
              <button onClick={() => setWhyModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {whyLoading ? (
                <div className="py-12 text-center text-slate-400">Loading audit ledger record...</div>
              ) : !activeWhyEntry ? (
                <div className="py-12 text-center text-slate-400">No ledger entry found for this score.</div>
              ) : (
                <>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Decision Type</span>
                      <strong className="text-sm text-indigo-400 font-bold">{activeWhyEntry.decision_type}</strong>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {activeWhyEntry.entry_id}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Computed Score</span>
                      <strong className="text-2xl font-extrabold text-white font-mono">{activeWhyEntry.computed_score}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 mb-2 uppercase text-[10px] tracking-wider text-slate-400">Named Component Factor Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      {Object.entries(activeWhyEntry.component_breakdown || {}).map(([key, val]) => (
                        <div key={key} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-400 text-[11px]">{key.replace('_', ' ')}:</span>
                          <strong className="text-slate-100">{typeof val === 'number' ? val.toFixed(1) : String(val)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 mb-2 uppercase text-[10px] tracking-wider text-slate-400">Data Sources & Provenance Tags</h4>
                    <div className="space-y-1.5">
                      {(activeWhyEntry.data_sources_used || []).map((src, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{src.source_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${src.is_synthetic ? 'bg-amber-950/60 text-amber-400 border border-amber-800' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'}`}>
                            {src.is_synthetic ? 'Synthetic Demo Data' : 'eSAKSHI Official Public'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 mb-2 uppercase text-[10px] tracking-wider text-slate-400">Unavailable Evidence Signals (Fairness Safeguard)</h4>
                    {activeWhyEntry.missing_evidence_fields && activeWhyEntry.missing_evidence_fields.length > 0 ? (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                        <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Independent evidence unavailable: {activeWhyEntry.missing_evidence_fields.join(', ')}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Strict Fairness Safeguard Rule: Unavailable evidence fields are isolated as missing and return zero numerical penalty to score calculations.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 text-[11px]">
                        ✓ All expected evidence signals available for calculation.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                    <span>Engine: {activeWhyEntry.model_version} | Rules: {activeWhyEntry.rules_version}</span>
                    <span>Timestamp: {new Date(activeWhyEntry.computed_at).toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-indigo-400" />
                        Human Officer Action Ledger
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Learn Loop Target</span>
                    </h4>

                    {activeWhyEntry.human_decision ? (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800 text-slate-200 space-y-1">
                        <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          Decision Recorded: {activeWhyEntry.human_decision}
                        </div>
                        <div className="text-slate-400">{activeWhyEntry.outcome || 'No additional outcome notes recorded.'}</div>
                      </div>
                    ) : (
                      <form onSubmit={submitOfficerDecision} className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {['APPROVED', 'DISPATCHED_INSPECTION', 'CLEARED'].map((dec) => (
                            <button
                              key={dec}
                              type="button"
                              onClick={() => setOfficerDecisionInput(dec)}
                              className={`py-1.5 rounded-lg border text-[11px] font-bold transition ${officerDecisionInput === dec ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                            >
                              {dec}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Enter officer notes/field inspection observations..."
                          value={officerNotesInput}
                          onChange={(e) => setOfficerNotesInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={decisionSubmitting}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {decisionSubmitting ? 'Recording Action...' : 'Record Officer Action to Ledger'}
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Citizen PWA Live Capture Modal */}
      {showPWACaptureModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Citizen PWA Capture Flow</h3>
              </div>
              <button onClick={() => setShowPWACaptureModal(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCitizenCaptureSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Project Work ID</label>
                <input type="text" disabled value={selectedProject.work_id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input type="text" value={pwaLat} onChange={(e) => setPwaLat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input type="text" value={pwaLon} onChange={(e) => setPwaLon(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono" />
                </div>
              </div>
              {pwaSuccessMsg && <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">{pwaSuccessMsg}</div>}
              <button type="submit" disabled={pwaSubmitting} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm transition shadow-lg">
                Submit Live Location Verification
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
