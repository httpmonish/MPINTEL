import React, { useState, useEffect, useRef } from 'react';
import { Compass, Navigation, MapPin, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INSPECTOR_PROFILES, ALL_PROJECTS } from '../data/mpintelDataset';

export default function InspectionOptimizerView({ onSelectProject }) {
  const [selectedInspectorId, setSelectedInspectorId] = useState('INSP-01');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const activeInspector = INSPECTOR_PROFILES.find(i => i.id === selectedInspectorId) || INSPECTOR_PROFILES[0];
  const assignedProjects = ALL_PROJECTS.filter(p => activeInspector.assigned_work_ids.includes(p.work_id));

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView([activeInspector.base_location.lat, activeInspector.base_location.lon], 7);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const waypoints = [];

    // Base Office Marker
    const baseMarker = L.circleMarker([activeInspector.base_location.lat, activeInspector.base_location.lon], {
      radius: 9,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.95
    }).addTo(map);
    baseMarker.bindPopup(`<b>${activeInspector.name}</b><br/>Base Office: ${activeInspector.base_location.city}`);
    waypoints.push([activeInspector.base_location.lat, activeInspector.base_location.lon]);

    // Assigned Project Stops
    assignedProjects.forEach((p, idx) => {
      waypoints.push([p.latitude, p.longitude]);
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: 8,
        fillColor: p.risk_score >= 70 ? '#e11d48' : '#d97706',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      }).addTo(map);

      marker.bindPopup(`
        <b>Stop #${idx + 1}: ${p.work_title}</b><br/>
        <span style="color: #64748b;">${p.work_id}</span><br/>
        Risk Score: <b style="color: #e11d48;">${p.risk_score}</b>
      `);
    });

    if (waypoints.length > 1) {
      L.polyline(waypoints, {
        color: '#2563eb',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(map);
      map.fitBounds(waypoints, { padding: [40, 40] });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [selectedInspectorId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Operational Decision Engine</span>
            <span>&gt;</span>
            <span className="text-slate-900">Feature 7: Inspection Resource Optimizer</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Capacity-Aware Greedy Nearest-Neighbor Route Planner
          </h1>
        </div>

        {/* Inspector Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedInspectorId}
            onChange={(e) => setSelectedInspectorId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer"
          >
            {INSPECTOR_PROFILES.map(insp => (
              <option key={insp.id} value={insp.id}>
                {insp.name} &bull; {insp.jurisdiction}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspector Details & Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Itinerary & Stops */}
        <div className="clean-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Inspector Profile & Constraints</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="font-bold text-slate-900">{activeInspector.name}</div>
            <div className="text-slate-500">{activeInspector.designation}</div>
            <div className="text-[11px] text-slate-600 font-mono pt-1">
              Max Daily Travel: <strong>{activeInspector.max_daily_travel_km} km</strong> &bull; Available: <strong>{activeInspector.available_days_per_week} days/week</strong>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Optimized Route Sequence</h3>
            
            {/* Base Office */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">0</span>
                <span className="font-bold text-blue-950">Depart: {activeInspector.base_location.city}</span>
              </div>
              <span className="text-[10px] font-mono text-blue-700">0 km</span>
            </div>

            {/* Sequence Stops */}
            {assignedProjects.map((p, idx) => (
              <div 
                key={p.work_id}
                onClick={() => onSelectProject(p)}
                className="p-2.5 clean-card rounded-xl text-xs space-y-1 cursor-pointer hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {p.work_id}
                  </span>
                  <span className="text-rose-600 font-mono font-bold">Risk: {p.risk_score}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate pl-6">{p.work_title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Interactive Leaflet Map (2 cols) */}
        <div className="lg:col-span-2 clean-card rounded-2xl p-4 space-y-3">
          <div ref={mapRef} className="w-full h-96 rounded-xl border border-slate-200 shadow-inner z-10"></div>
          <p className="text-[11px] text-slate-500 font-mono text-center">
            Greedy nearest-neighbor solver prioritizes projects by Composite Score: (Risk Score &times; 0.4) + (Confidence Gap &times; 0.3) + (Project Value &times; 0.3) &minus; Distance Penalty.
          </p>
        </div>

      </div>

    </div>
  );
}
