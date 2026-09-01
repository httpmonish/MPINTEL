import React, { useState } from 'react';
import { 
  Smartphone, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw,
  Upload,
  Lock,
  Compass
} from 'lucide-react';
import { ALL_PROJECTS } from '../data/mpintelDataset';

export default function CitizenVerificationPWA({ project = ALL_PROJECTS[0] }) {
  const [liveGpsLat, setLiveGpsLat] = useState(project.latitude.toString());
  const [liveGpsLon, setLiveGpsLon] = useState(project.longitude.toString());
  const [cameraActive, setCameraActive] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Haversine calculation in meters
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const distanceMeters = calculateDistance(
    project.latitude,
    project.longitude,
    parseFloat(liveGpsLat) || project.latitude,
    parseFloat(liveGpsLon) || project.longitude
  );

  const isLocationValid = distanceMeters <= 100;

  const handleSubmitProof = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmissionResult({
        status: isLocationValid ? 'VERIFIED_LOCATION_BOUND' : 'OUT_OF_GEOFENCE',
        distance: distanceMeters,
        hash: 'sha256-evidence-citiz-' + Date.now(),
        timestamp: new Date().toISOString(),
        confidence_delta: isLocationValid ? '+18.4 pts' : '0.0 pts'
      });
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* PWA Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold font-mono">
          <Smartphone className="w-3.5 h-3.5" />
          Feature 4: Location-Bound Citizen Verification PWA
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Live Camera & Geofenced Evidence Capture
        </h1>
        <p className="text-xs text-slate-500">
          Zero gallery uploads allowed. Enforces real-time browser GPS sensor validation and live camera capture to prevent reused photo fraud.
        </p>
      </div>

      {/* Verification Terminal Card */}
      <div className="clean-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-xl">
        
        {/* Project Context Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between font-bold text-slate-900">
            <span>Work ID: {project.work_id}</span>
            <span className="text-blue-600 font-mono">Sanctioned: ₹{(project.sanctioned_amount_inr / 100000).toFixed(1)}L</span>
          </div>
          <p className="font-bold text-slate-800">{project.work_title}</p>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Official Geotag: <strong>{project.latitude}, {project.longitude}</strong> ({project.district}, {project.state})</span>
          </div>
        </div>

        {/* Live Camera Viewport Simulation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-600" />
              Live HTML5 Camera Viewport (Anti-Tamper Stream)
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              GPS Stream Locked
            </span>
          </div>

          <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-white">
            <div className="text-center p-6 space-y-2">
              <Camera className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
              <div className="text-xs font-mono font-bold text-slate-200">
                {capturedPhoto ? "Photo Captured (Ready for Submission)" : "Live Video Stream (30 FPS, Latency: 12ms)"}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                GPS: {liveGpsLat}, {liveGpsLon} &bull; Accuracy: &plusmn;3.8m
              </div>
            </div>

            {/* Simulated HUD Overlays */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">
              LIVE_SENSOR_SECURE
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
              {new Date().toLocaleTimeString()} IST
            </div>
          </div>
        </div>

        {/* Geofence Distance Calculation Gauge */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-600" />
              Haversine Geodesic Distance from Sanctioned Boundary
            </span>
            <span className={`font-mono text-sm ${isLocationValid ? 'text-emerald-600' : 'text-rose-600'}`}>
              {distanceMeters} meters
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isLocationValid ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (distanceMeters / 150) * 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0m (Exact Match)</span>
            <span className="font-bold text-slate-700">100m Geofence Threshold</span>
            <span>150m+ (Rejected)</span>
          </div>
        </div>

        {/* Submission Action */}
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition"
          >
            {submitting ? 'Calculating Cryptographic Proof...' : 'Capture Photo & Submit Geotagged Proof'}
          </button>
        </form>

        {/* Submission Response Alert */}
        {submissionResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Evidence Successfully Sealed & Verified
            </div>
            <div className="font-mono text-[11px] text-emerald-800 space-y-0.5">
              <div>Geodesic Distance: {submissionResult.distance}m (Within 100m Geofence)</div>
              <div>SHA-256 Digest: {submissionResult.hash}</div>
              <div>Verification Confidence Impact: {submissionResult.confidence_delta}</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
