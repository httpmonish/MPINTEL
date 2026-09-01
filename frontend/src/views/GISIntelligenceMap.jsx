import React, { useEffect, useRef } from 'react';
import { Map as MapIcon, Layers, ShieldAlert, MapPin, Eye } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function GISIntelligenceMap({ onSelectProject }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView([23.5937, 80.9629], 5);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    ALL_PROJECTS.slice(0, 35).forEach((p) => {
      const markerColor = p.risk_score >= 70 ? '#e11d48' : (p.risk_score >= 40 ? '#d97706' : '#16a34a');
      
      const marker = L.circleMarker([p.latitude, p.longitude], {
        radius: p.is_hero_project ? 11 : 7,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <b style="color: #1e293b;">${p.work_title}</b><br/>
          <span style="color: #64748b;">${p.work_id} &bull; ${p.district}, ${p.state}</span>
          <div style="margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Risk: <b style="color: ${markerColor};">${p.risk_score}</b></span>
            <span>Sanction: <b>₹${(p.sanctioned_amount_inr / 100000).toFixed(1)}L</b></span>
          </div>
        </div>
      `);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Spatial Decision Layer</span>
            <span>&gt;</span>
            <span className="text-slate-900">GIS Intelligence & Proximity Clustering</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Geospatial Risk & Cross-Scheme Overlap Map
          </h1>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Risk (&ge;70)
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Review (40-70)
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Verified (&lt;40)
          </span>
        </div>
      </div>

      {/* Map Card */}
      <div className="clean-card rounded-2xl p-4 space-y-3">
        <div ref={mapRef} className="w-full h-[580px] rounded-xl border border-slate-200 shadow-inner z-10"></div>
        <p className="text-[11px] text-slate-500 font-mono text-center">
          Click any project pin on the interactive MapLibre/Leaflet canvas to inspect risk and coordinates.
        </p>
      </div>

    </div>
  );
}
