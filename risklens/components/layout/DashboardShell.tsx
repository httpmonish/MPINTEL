"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  ShieldAlert,
  LayoutDashboard,
  FolderKanban,
  FileSearch,
  Building2,
  PieChart,
  UserCheck,
  ChevronDown,
  Search,
  Wifi,
  ExternalLink,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: "/district",
    icon: LayoutDashboard,
  },
  {
    title: "Investigation Queue",
    href: "/queue",
    icon: ShieldAlert,
    badge: "Active Flags",
  },
  {
    title: "All Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Money Monitoring",
    href: "/district/monitoring",
    icon: PieChart,
  },
  {
    title: "Hero Demo Spotlight",
    href: "/investigation/HERO-MPLADS-001",
    icon: Sparkles,
    badge: "30s Demo",
  },
  {
    title: "How Scoring Works",
    href: "/how-it-works",
    icon: FileSearch,
  },
];

const ROLES_METADATA: Record<
  UserRole,
  { title: string; subtitle: string; jurisdiction: string; badge: string }
> = {
  district: {
    title: "District Authority",
    subtitle: "District Planning Cell IDA",
    jurisdiction: "District 04 (State X)",
    badge: "Field Review Scope",
  },
  state: {
    title: "State Nodal Department",
    subtitle: "State Planning Directorate",
    jurisdiction: "State X",
    badge: "State Oversight",
  },
  ministry: {
    title: "Ministry / CVC Directorate",
    subtitle: "MoSPI Policy & Monitoring",
    jurisdiction: "All 28 States & UTs",
    badge: "National Authority",
  },
  mp: {
    title: "Member of Parliament (MP)",
    subtitle: "Lok Sabha Representative",
    jurisdiction: "Constituency X-01",
    badge: "Constituency View",
  },
};

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { currentRole, setRole, projects } = useRiskLensStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentRoleInfo = ROLES_METADATA[currentRole];
  const flaggedCount = projects.filter((p) => p.riskScore.compositeScore >= 60).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Banner for Demo Rigor */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">RiskLens for MPLADS</span>
          <span className="text-slate-400">| Explainable AI Risk Intelligence on top of eSAKSHI</span>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge type="synthetic" />
          <Link
            href="/offline"
            className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Wifi className="w-3 h-3 text-emerald-400" />
            Offline Pitch Mode
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Persistent Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 shrink-0 hidden md:flex flex-col justify-between">
          <div className="p-4 space-y-6">
            {/* Logo & Platform Positioning */}
            <div className="px-2">
              <Link href="/district" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                    RiskLens
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded">
                      AI v2.1
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Explainable MPLADS Auditing
                  </div>
                </div>
              </Link>
            </div>

            {/* Active Session Box */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Active Demo Scope
              </div>
              <div className="font-semibold text-xs text-slate-900 truncate">
                {currentRoleInfo.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentRoleInfo.jurisdiction}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/district" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-400")} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badge === "Active Flags"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-50 text-blue-700"
                        )}
                      >
                        {item.badge === "Active Flags" ? `${flaggedCount} Cases` : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Golden Rules Reminder */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[10px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1">
                <Award className="w-3 h-3 text-blue-600" />
                SIH 2026 Guardrails:
              </div>
              <p>• Zero personal names or real faces</p>
              <p>• AI explains; human officer decides</p>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with Role Switcher */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Global Search Input */}
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search works by ID, category, or constituency..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            {/* FAST ROLE SWITCHER (CRITICAL FOR LIVE JUDGE DEMOS) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 transition-colors border border-slate-200/60"
              >
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">
                    Demo Role
                  </span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {currentRoleInfo.title}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                </div>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Authority Scope
                  </div>
                  {(Object.keys(ROLES_METADATA) as UserRole[]).map((r) => {
                    const info = ROLES_METADATA[r];
                    const isCurrent = r === currentRole;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between",
                          isCurrent
                            ? "bg-slate-900 text-white"
                            : "hover:bg-slate-100 text-slate-800"
                        )}
                      >
                        <div>
                          <div className="font-semibold">{info.title}</div>
                          <div
                            className={cn(
                              "text-[10px]",
                              isCurrent ? "text-slate-300" : "text-slate-500"
                            )}
                          >
                            {info.jurisdiction}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </header>

          {/* Page View Body */}
          <main className="p-6 md:p-8 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};
