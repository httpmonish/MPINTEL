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
  BarChart3
} from 'lucide-react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('risk'); // 'risk' or 'planner'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  
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

  // Citizen PWA Form State
  const [pwaLat, setPwaLat] = useState('25.0964');
  const [pwaLon, setPwaLon] = useState('85.3134');
  const [isLiveCamera, setIsLiveCamera] = useState(true);
  const [pwaSubmitting, setPwaSubmitting] = useState(false);
  const [pwaSuccessMsg, setPwaSuccessMsg] = useState('');

  // Leaflet Map Ref
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchBottleneckSummary();
    fetchOptimizerPlan();
  }, [selectedState, selectedFlag]);

  useEffect(() => {
    if (activeTab === 'planner' && optimizerPlan && mapContainerRef.current) {
      initMap();
    }
  }, [activeTab, optimizerPlan, selectedInspectorId]);

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
      if (res.ok) {
        const data = await res.json();
        setBottleneckSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch bottleneck summary:', err);
    }
  };

  const fetchOptimizerPlan = async () => {
    setPlannerLoading(true);
    try {
      const res = await fetch('/api/v1/optimizer/plan');
      if (res.ok) {
        const data = await res.json();
        setOptimizerPlan(data);
      }
    } catch (err) {
      console.error('Failed to fetch optimizer plan:', err);
    } finally {
      setPlannerLoading(false);
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

  const initMap = () => {
    if (!mapContainerRef.current) return;
    
    // Destroy previous Leaflet map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center (India centroid)
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

      // Base location marker
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

      // Assigned project markers & polylines
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

      // Route polyline connecting visits
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
              Pratyaksh <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Phase 4 — Process & Optimizer</span>
            </h1>
            <p className="text-xs text-slate-400">AI-Powered MPLADS Monitoring, SLA Bottlenecks & Capacity Inspection Routing</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
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

      {/* TAB 1: RISK & VERIFICATION MATRIX */}
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
                    <th className="py-4 px-6">Top Factor</th>
                    <th className="py-4 px-6">Provenance</th>
                    <th className="py-4 px-6 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-12 text-slate-400">Loading evaluated projects...</td></tr>
                  ) : filteredProjects.map((p) => (
                    <tr 
                      key={p.work_id}
                      onClick={() => handleRowClick(p)}
                      className="hover:bg-indigo-950/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">{p.work_title}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.work_id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {p.state}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-200">
                        ₹{p.disbursed_amount_inr ? p.disbursed_amount_inr.toLocaleString('en-IN') : '0'}
                      </td>
                      <td className="py-4 px-6">{getRiskScoreBadge(p.risk_score)}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.top_contributing_factor}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          Official eSAKSHI
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
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

      {/* TAB 2: INSPECTION PLANNER & MAP VIEW (PHASE 4 FEATURE) */}
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
            
            {/* Map Container (Leaflet OSM Tiles + Spatial Polylines) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 overflow-hidden shadow-2xl flex flex-col h-[520px]">
              <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 rounded-t-xl">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  Spatial Route & Risk Map (MapLibre / Leaflet OSM Vector Canvas)
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> High Risk
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Review
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Normal
                </div>
              </div>
              <div ref={mapContainerRef} className="flex-1 w-full rounded-b-xl z-10"></div>
            </div>

            {/* Ordered Route Stop List (Feature 7 Actionable Output) */}
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
                      onClick={() => handleRowClick(stop)}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition space-y-2 group"
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

                      {/* Explicit Priority Factor Reasoning */}
                      {stop.priority_analysis && (
                        <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                          <div className="font-semibold text-indigo-300">{stop.priority_analysis.reasoning_summary}</div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Risk Contrib: <strong className="text-slate-200">+{stop.priority_analysis.factor_breakdown.risk_contribution}</strong></span>
                            <span>Confidence Gap: <strong className="text-slate-200">+{stop.priority_analysis.factor_breakdown.confidence_gap_contribution}</strong></span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Leg Distance: <strong className="text-slate-300">{stop.leg_distance_km || stop.distance_from_base_km} km</strong></span>
                        <span className="text-indigo-400 group-hover:underline flex items-center gap-1">
                          View Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* EXTENDED PROJECT DETAIL MODAL (PHASES 2, 3, AND 4 TIED TOGETHER) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl h-full max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wide">Comprehensive Project Intelligence (Phases 2, 3, 4)</span>
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* THREE CORE METRIC CARDS (STRICTLY SEPARATE) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Risk Score Card (Phase 2) */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">AI Risk Score (Phase 2)</span>
                  <div className="text-2xl font-extrabold text-white">
                    {selectedProject.risk_score.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Top: <strong className="text-slate-200">{selectedProject.top_contributing_factor}</strong>
                  </div>
                </div>

                {/* 2. Verification Confidence Card (Phase 3) */}
                <div className="bg-slate-950/90 border border-emerald-900/40 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Verification Conf (Phase 3)</span>
                  <div className="text-2xl font-extrabold text-emerald-300">
                    {verificationData ? verificationData.verification_confidence.toFixed(0) : '0'} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium truncate">
                    {verificationData ? verificationData.signals.citizen_evidence.status : 'Evaluating...'}
                  </div>
                </div>

                {/* 3. SLA Delay Bottleneck Card (Phase 4) */}
                <div className="bg-slate-950/90 border border-amber-900/40 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">Max SLA Delay (Phase 4)</span>
                  <div className="text-2xl font-extrabold text-amber-300">
                    {bottleneckData && bottleneckData.has_bottleneck ? `${bottleneckData.max_deviation_multiple}×` : '1.0×'}
                    <span className="text-xs font-normal text-slate-500"> Benchmark</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium truncate">
                    {bottleneckData && bottleneckData.primary_bottleneck ? bottleneckData.primary_bottleneck.stage_name : 'Within Normal SLA'}
                  </div>
                </div>

              </div>

              {/* PHASE 4: STAGE-WISE BOTTLENECK PANEL (FEATURE 6) */}
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
                    <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl">
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

              {/* PHASE 3: MULTI-SIGNAL TRIANGULATION PANEL */}
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

                {verificationData && (
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
                )}
              </div>

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
