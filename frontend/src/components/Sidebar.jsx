import React from 'react';
import { 
  LayoutGrid, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  FileSearch, 
  BarChart3, 
  Map as MapIcon, 
  Layers, 
  Camera, 
  Smartphone, 
  Satellite, 
  Clock, 
  Navigation, 
  Compass, 
  Radar, 
  GitMerge, 
  FileText, 
  DollarSign, 
  Network, 
  MessageSquare, 
  History, 
  Sparkles, 
  BookOpenCheck, 
  Link2, 
  ShieldCheck, 
  Database, 
  Scale, 
  Sliders, 
  Activity, 
  ChevronDown,
  Globe,
  Users,
  Zap
} from 'lucide-react';

export default function Sidebar({ 
  activeNav, 
  onSelectNav,
  currentRole
}) {
  const navSections = [
    {
      label: "Dashboards & Role Views",
      items: [
        { id: "ministry", label: "Ministry National View", icon: Building2, roles: ["MINISTRY", "ADMIN"] },
        { id: "state", label: "State Nodal Dashboard", icon: MapPin, roles: ["MINISTRY", "STATE", "ADMIN"] },
        { id: "district", label: "District Operations Queue", icon: LayoutGrid, roles: ["MINISTRY", "STATE", "DISTRICT", "ADMIN"] },
        { id: "mp", label: "MP Constituency Hub", icon: Users, roles: ["MP", "MINISTRY", "ADMIN"] },
        { id: "inspector", label: "Inspector Field Tasklist", icon: Navigation, roles: ["INSPECTOR", "DISTRICT", "ADMIN"] },
        { id: "transparency", label: "Public Transparency Portal", icon: Globe, roles: ["CITIZEN", "MINISTRY", "STATE", "DISTRICT", "MP", "INSPECTOR", "ADMIN"] },
      ]
    },
    {
      label: "AI Risk & Anomaly Intelligence",
      items: [
        { id: "alert-center", label: "Risk Alert Center", icon: ShieldAlert, badge: "342 Alerts" },
        { id: "investigation", label: "Project Deep Investigation", icon: FileSearch, highlight: true },
        { id: "risk-analytics", label: "Risk Radar & Decomposition", icon: BarChart3 },
        { id: "gis-map", label: "GIS Spatial Intelligence Map", icon: MapIcon },
      ]
    },
    {
      label: "Verification & Field Proofs",
      items: [
        { id: "triangulation", label: "Evidence Triangulation Matrix", icon: Layers },
        { id: "photo-phash", label: "Duplicate Photo pHash Scanner", icon: Camera },
        { id: "citizen-pwa", label: "Location-Bound Citizen PWA", icon: Smartphone },
        { id: "satellite", label: "Copernicus Sentinel-2 Satellite", icon: Satellite },
      ]
    },
    {
      label: "Decisions & Optimization",
      items: [
        { id: "bottlenecks", label: "Stage Bottlenecks & SLA", icon: Clock },
        { id: "optimizer", label: "Inspection Route Optimizer", icon: Compass },
        { id: "pre-sanction", label: "Pre-Sanction Risk Scanner", icon: Zap },
        { id: "attention-radar", label: "Attention Deficit Radar", icon: Radar },
      ]
    },
    {
      label: "Context & Cross-Scheme",
      items: [
        { id: "cross-scheme", label: "Cross-Scheme Double-Dipping", icon: GitMerge },
        { id: "dpr-similarity", label: "DPR & Text Similarity", icon: FileText },
        { id: "rate-benchmark", label: "Govt Schedule of Rates (SoR)", icon: DollarSign },
        { id: "contractor-network", label: "Agency & Contractor Graph", icon: Network },
        { id: "grievances", label: "Citizen Grievance NLP Fusion", icon: MessageSquare },
        { id: "post-completion", label: "Post-Completion Monitoring", icon: History },
      ]
    },
    {
      label: "Governance, Trust & Blockchain",
      items: [
        { id: "copilot", label: "Investigation AI Copilot", icon: Sparkles },
        { id: "confidence-ledger", label: "Confidence & Decision Ledger", icon: BookOpenCheck },
        { id: "blockchain", label: "Blockchain Evidence Ledger", icon: Link2, badge: "SHA-256" },
        { id: "compliance", label: "Compliance & Statutory Rules", icon: ShieldCheck },
        { id: "data-provenance", label: "Data & Provenance Center", icon: Database },
        { id: "responsible-ai", label: "Responsible AI & Fairness", icon: Scale },
        { id: "admin-config", label: "System & Weights Config", icon: Sliders },
        { id: "api-health", label: "API & Adapter Health", icon: Activity },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#fafbfc] border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] sticky top-[53px] z-30 select-none overflow-y-auto font-sans">
      <div className="p-3 space-y-4">
        
        {/* Navigation Groups */}
        <nav className="space-y-4">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="flex items-center justify-between px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>{section.label}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </div>

              <div className="space-y-0.5 pt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectNav(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/30'
                          : item.highlight
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                          isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* Bottom Live Data Provenance Tag */}
      <div className="p-3 border-t border-slate-200/70 bg-white space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            eSAKSHI Sync
          </span>
          <span className="text-emerald-700 font-bold">100% ONLINE</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono truncate">
          Engine: MPINTEL v2.4.1 &bull; SHA-256 Verified
        </p>
      </div>
    </aside>
  );
}
