import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  QrCode, 
  UserCheck, 
  Building2, 
  MapPin, 
  Users, 
  Navigation, 
  ShieldAlert, 
  Globe, 
  Sliders,
  ChevronDown,
  Bell,
  Cpu
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  onSelectRole, 
  onOpenDemoTour, 
  onOpenQRModal,
  searchQuery,
  onSearchChange
}) {
  const roles = [
    { id: 'MINISTRY', label: 'Ministry of Statistics (MoSPI)', badge: 'National', icon: Building2 },
    { id: 'STATE', label: 'State Nodal Authority (Bihar)', badge: 'State', icon: MapPin },
    { id: 'DISTRICT', label: 'District Authority (Purnia)', badge: 'District', icon: ShieldCheck },
    { id: 'MP', label: 'Hon\'ble MP Dashboard', badge: 'Constituency', icon: Users },
    { id: 'INSPECTOR', label: 'Field Quality Inspector', badge: 'Field PWA', icon: Navigation },
    { id: 'CITIZEN', label: 'Citizen Transparency Portal', badge: 'Public', icon: Globe },
    { id: 'ADMIN', label: 'System & Blockchain Admin', badge: 'Admin', icon: Sliders }
  ];

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 px-5 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
      
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-700/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
              MPINTEL
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              SIH 2026 MPLADS Intelligence
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
            Detect &bull; Verify &bull; Explain &bull; Prioritize &bull; Act
          </p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm hidden md:block">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search Work ID, MP Name, District, State..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
        />
        <span className="absolute right-2.5 top-1.5 text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
          ⌘K
        </span>
      </div>

      {/* Right Tools: Role Selector, Demo Mode Trigger & Mobile Scan */}
      <div className="flex items-center gap-2.5">
        
        {/* Flagship 60-Second Judge Tour Trigger */}
        <button
          onClick={onOpenDemoTour}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          <span>Judge Demo Spotlight</span>
        </button>

        {/* Judge Mobile QR Scanner Trigger */}
        <button
          onClick={onOpenQRModal}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          title="Scan QR to open Location-Bound Citizen Verification on mobile"
        >
          <QrCode className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden sm:inline">Mobile PWA</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 p-1 pl-2.5 rounded-xl border border-slate-200 cursor-pointer transition">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:inline">Role:</span>
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {currentRole}
            </span>
            <div className="p-1 rounded-lg bg-white shadow-2xs text-slate-600">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Role Selection Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 space-y-1 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Switch Government Persona
            </div>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="font-bold truncate">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.badge} Level Authority</div>
                    </div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
