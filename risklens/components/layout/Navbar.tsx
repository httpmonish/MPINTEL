"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import {
  Search,
  ChevronDown,
  Layers,
  ShieldAlert,
  Compass,
  MapPin,
  GitCompare,
  Network,
  Menu,
  X,
  Building2,
  Users,
  FileText,
  MessageSquareWarning,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  LogOut,
} from "lucide-react";

export type HouseType = "ALL" | "Lok Sabha" | "Rajya Sabha";
export type LokSabhaTerm = "18th" | "17th" | "rajya_sabha";
export type NavTier = "PUBLIC" | "OFFICIAL";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, setRole, projects } = useRiskLensStore();

  const [activeTier, setActiveTier] = useState<NavTier>("PUBLIC");
  const [selectedHouse, setSelectedHouse] = useState<HouseType>("ALL");
  const [selectedTerm, setSelectedTerm] = useState<LokSabhaTerm>("18th");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const flaggedCount = projects.filter((p) => (p.riskScore?.compositeScore || 0) >= 60).length || 14;

  interface NavLink {
    name: string;
    href: string;
    badge?: string;
  }

  const publicNavLinks: NavLink[] = [
    { name: "Overview", href: "/" },
    { name: "Find Projects", href: "/projects" },
    { name: "Browse States", href: "/states" },
    { name: "Browse MPs", href: "/mps" },
    { name: "Compare", href: "/compare" },
    { name: "Transparency & Reports", href: "/reports" },
    { name: "Feedback", href: "/feedback" },
  ];

  const officialNavLinks: NavLink[] = [
    { name: "Dashboard Overview", href: "/" },
    { name: "Projects Directory", href: "/projects" },
    { name: "Risk Triage & Alerts", href: "/queue", badge: `${flaggedCount}` },
    { name: "Investigation Workspace", href: "/investigation/MPL-2024-14205" },
    { name: "Geospatial Radar", href: "/radar" },
    { name: "CAG Ledger", href: "/ledger" },
    { name: "Compliance Engine", href: "/compliance" },
    { name: "RTI Export", href: "/reports" },
  ];

  const currentNavLinks: NavLink[] = activeTier === "PUBLIC" ? publicNavLinks : officialNavLinks;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleHouseChange = (house: HouseType) => {
    setSelectedHouse(house);
    if (pathname === "/mps" || pathname.startsWith("/mps")) {
      router.push(`/mps?house=${encodeURIComponent(house)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0B2149] border-b border-[#D9DEE4]/30 select-none">
      {/* 1. Sovereign Government Header Strip */}
      <div className="h-16 px-4 md:px-8 max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* National Emblem Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-[2px] bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:bg-white/15 transition-colors">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[17px] md:text-[19px] font-bold text-white tracking-tight leading-tight">
                  MPLADS AI Risk Intelligence Platform
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20 rounded-[2px]">
                  MoSPI Node
                </span>
              </div>
              <span className="text-[12px] text-white/80 leading-tight mt-0.5">
                Government of India · Ministry of Statistics &amp; Programme Implementation
              </span>
            </div>
          </Link>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Nav Mode Switcher: PUBLIC vs OFFICIAL */}
          <div className="hidden lg:flex items-center bg-white/10 border border-white/25 rounded-[2px] p-0.5 text-[11px] font-bold uppercase">
            <button
              onClick={() => setActiveTier("PUBLIC")}
              className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                activeTier === "PUBLIC"
                  ? "bg-white text-[#0B2149]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Public Portal
            </button>
            <button
              onClick={() => setActiveTier("OFFICIAL")}
              className={`px-2.5 py-1 rounded-[2px] transition-colors flex items-center gap-1 ${
                activeTier === "OFFICIAL"
                  ? "bg-white text-[#0B2149]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Lock className="w-3 h-3" />
              Official Audit
            </button>
          </div>

          {/* House Filter Dropdown */}
          <div className="hidden xl:flex items-center bg-white/10 border border-white/20 rounded-[2px] px-2 py-1 text-white text-[12px] font-semibold gap-1.5">
            <span className="text-white/70 text-[11px] uppercase">House:</span>
            <select
              value={selectedHouse}
              onChange={(e) => handleHouseChange(e.target.value as HouseType)}
              className="bg-transparent text-white text-[12px] font-bold outline-none cursor-pointer"
            >
              <option value="ALL" className="text-slate-900">Both Houses (774 MPs)</option>
              <option value="Lok Sabha" className="text-slate-900">Lok Sabha (543 MPs)</option>
              <option value="Rajya Sabha" className="text-slate-900">Rajya Sabha (231 MPs)</option>
            </select>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search MP, Work, Constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 bg-white/10 border border-white/20 rounded-[2px] text-white placeholder:text-white/60 text-[12px] focus:bg-white focus:text-[#14213D] focus:placeholder:text-slate-400 focus:outline-none w-56 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-white/70 absolute left-2.5 pointer-events-none" />
          </form>

          {/* Investigator Profile Strip & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="w-8 h-8 rounded-[2px] bg-[#1A56C4] border border-white/20 flex items-center justify-center text-white font-bold text-xs">
              IAS
            </div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="text-[12px] font-bold text-white leading-tight">R. Sharma, IAS</span>
              <span className="text-[10px] text-white/70 leading-none">DISTRICT / STATE INVESTIGATOR</span>
            </div>
            <button
              onClick={() => {
                setActiveTier("PUBLIC");
                setRole("mp");
                router.push("/");
              }}
              title="Sign Out to Landing Page"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-[2px] transition-colors flex items-center justify-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-white/90 hover:text-white bg-white/10 border border-white/20 rounded-[2px]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2. Secondary Navigation Bar */}
      <div className="h-11 bg-white border-t border-b border-[#D9DEE4] px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          <nav className="flex items-center h-full gap-1 overflow-x-auto text-[13px] font-semibold">
            {currentNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`h-full flex items-center px-3 transition-colors whitespace-nowrap gap-1.5 ${
                    isActive
                      ? "text-[#1A56C4] border-b-2 border-[#1A56C4] font-bold bg-[#FAFAF9]"
                      : "text-[#6B7280] hover:text-[#14213D]"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 bg-[#FDF2F2] border border-[#B3261E] text-[#B3261E] text-[10px] font-bold rounded-[2px]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#0E6E6E]" />
              <span className="tabular-nums">543 Lok Sabha + 231 RS Active</span>
            </span>
            <span className="text-[#D9DEE4]">|</span>
            <span className="uppercase tracking-wider">GFR 2017 Restrained Data</span>
          </div>
        </div>
      </div>

      {/* 3. Mobile Responsive Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAFAF9] border-b border-[#D9DEE4] p-4 text-[#14213D] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE4]">
            <span className="text-xs font-bold uppercase text-[#6B7280]">Navigation Mode</span>
            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTier("PUBLIC")}
                className={`px-3 py-1 rounded-[2px] border ${
                  activeTier === "PUBLIC"
                    ? "bg-[#1A56C4] text-white border-[#1A56C4]"
                    : "bg-white text-slate-700 border-[#D9DEE4]"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setActiveTier("OFFICIAL")}
                className={`px-3 py-1 rounded-[2px] border ${
                  activeTier === "OFFICIAL"
                    ? "bg-[#1A56C4] text-white border-[#1A56C4]"
                    : "bg-white text-slate-700 border-[#D9DEE4]"
                }`}
              >
                Official Audit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-white border border-[#D9DEE4] rounded-[2px] hover:border-[#1A56C4] flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.5 bg-[#FDF2F2] border border-[#B3261E] text-[#B3261E] text-[10px] font-bold rounded-[2px]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="pt-2">
            <input
              type="text"
              placeholder="Search across entire registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#D9DEE4] rounded-[2px] text-sm focus:border-[#1A56C4] focus:outline-none"
            />
          </form>
        </div>
      )}
    </header>
  );
};
