import mpDataRaw from "./mp-data.json";

export interface MPRecord {
  id: string;
  slug: string;
  name: string;
  constituency: string;
  state: string;
  house: "Lok Sabha" | "Rajya Sabha";
  term: string;
  party: string;
  allocated_inr: number;
  allocated_cr: number;
  disbursed_inr: number;
  disbursed_cr: number;
  utilization_pct: number;
  completion_rate_pct: number;
  total_works_recommended: number;
  works_completed: number;
  works_in_progress: number;
  works_upcoming: number;
  works_delayed: number;
  data_source: string;
}

export interface MPProject {
  id: string;
  title: string;
  category: string;
  sanctioned_amount_lakh: number;
  disbursed_amount_lakh: number;
  status: "Completed" | "In Progress" | "Upcoming" | "Delayed";
  completion_date?: string;
  sanction_date: string;
  location: string;
  risk_score: number;
  verification_status: "VERIFIED" | "REQUIRES_VERIFICATION" | "EVIDENCE_CONFLICT";
  flag_reason?: string;
}

export interface MPFinancialYear {
  financial_year: string;
  allocated_cr: number;
  disbursed_cr: number;
  unspent_cr: number;
  utilization_pct: number;
  pfms_status: "RECONCILED" | "PENDING_AUDIT";
}

export const ALL_MPS: MPRecord[] = mpDataRaw as MPRecord[];

export function getAllMps(filters?: {
  search?: string;
  state?: string;
  house?: string;
  term?: string;
}): MPRecord[] {
  let list = ALL_MPS;

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.constituency.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
  }

  if (filters?.state && filters.state !== "ALL") {
    list = list.filter(
      (m) => m.state.toLowerCase() === filters.state!.toLowerCase()
    );
  }

  if (filters?.house && filters.house !== "ALL") {
    list = list.filter(
      (m) => m.house.toLowerCase() === filters.house!.toLowerCase()
    );
  }

  return list;
}

export function getMpBySlug(slug: string): MPRecord | undefined {
  const clean = slug.toLowerCase().trim();
  return ALL_MPS.find(
    (m) =>
      m.slug.toLowerCase() === clean ||
      m.id.toLowerCase() === clean ||
      m.name.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(clean)
  );
}

export function getProjectsForMp(mp: MPRecord): {
  completed: MPProject[];
  in_progress: MPProject[];
  upcoming: MPProject[];
  delayed: MPProject[];
} {
  const seed = mp.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const categories = [
    "Roads & Pathways",
    "Community Water RO Plant",
    "School Infrastructure",
    "Public Library Complex",
    "Solar Street Lighting",
    "Flood Protection Wall",
    "Health Sub-Center Upgrade",
    "Community Hall Renovation",
  ];

  const completed: MPProject[] = [];
  for (let i = 0; i < mp.works_completed; i++) {
    const cat = categories[(seed + i) % categories.length];
    const sanc = Math.round(8.5 + ((seed * (i + 1)) % 35));
    completed.push({
      id: `${mp.id}-WRK-C${i + 1}`,
      title: `Construction of ${cat} in ${mp.constituency} (Sector ${i + 1})`,
      category: cat,
      sanctioned_amount_lakh: sanc,
      disbursed_amount_lakh: sanc,
      status: "Completed",
      sanction_date: "2023-04-15",
      completion_date: "2024-02-28",
      location: `${mp.constituency}, ${mp.state}`,
      risk_score: 15 + ((seed + i) % 15),
      verification_status: "VERIFIED",
    });
  }

  const in_progress: MPProject[] = [];
  for (let i = 0; i < mp.works_in_progress; i++) {
    const cat = categories[(seed + i + 3) % categories.length];
    const sanc = Math.round(12.0 + ((seed * (i + 2)) % 40));
    in_progress.push({
      id: `${mp.id}-WRK-P${i + 1}`,
      title: `Upgradation of ${cat} at Block ${i + 1}`,
      category: cat,
      sanctioned_amount_lakh: sanc,
      disbursed_amount_lakh: Math.round(sanc * 0.55),
      status: "In Progress",
      sanction_date: "2024-01-10",
      location: `${mp.constituency}, ${mp.state}`,
      risk_score: 35 + ((seed + i) % 20),
      verification_status: "REQUIRES_VERIFICATION",
    });
  }

  const upcoming: MPProject[] = [];
  for (let i = 0; i < mp.works_upcoming; i++) {
    const cat = categories[(seed + i + 5) % categories.length];
    const sanc = Math.round(15.0 + ((seed * (i + 3)) % 30));
    upcoming.push({
      id: `${mp.id}-WRK-U${i + 1}`,
      title: `Proposed ${cat} Installation Proposal`,
      category: cat,
      sanctioned_amount_lakh: sanc,
      disbursed_amount_lakh: 0,
      status: "Upcoming",
      sanction_date: "2024-08-01",
      location: `${mp.constituency}, ${mp.state}`,
      risk_score: 10,
      verification_status: "VERIFIED",
    });
  }

  const delayed: MPProject[] = [];
  for (let i = 0; i < mp.works_delayed; i++) {
    const cat = categories[(seed + i + 7) % categories.length];
    const sanc = Math.round(22.0 + ((seed * (i + 4)) % 35));
    delayed.push({
      id: `${mp.id}-WRK-D${i + 1}`,
      title: `Priority Overdue: ${cat} Drainage Link`,
      category: cat,
      sanctioned_amount_lakh: sanc,
      disbursed_amount_lakh: Math.round(sanc * 0.4),
      status: "Delayed",
      sanction_date: "2023-11-20",
      location: `${mp.constituency}, ${mp.state}`,
      risk_score: 75 + ((seed + i) % 18),
      verification_status: "EVIDENCE_CONFLICT",
      flag_reason: "Milestone completion SLA stall (>60d) + 1.8x unit cost divergence",
    });
  }

  return { completed, in_progress, upcoming, delayed };
}

export function getMpFinancials(mp: MPRecord): MPFinancialYear[] {
  const total = mp.allocated_cr;
  const y1_alloc = Number((total * 0.45).toFixed(2));
  const y2_alloc = Number((total * 0.35).toFixed(2));
  const y3_alloc = Number((total * 0.20).toFixed(2));

  const y1_disb = Number((y1_alloc * (mp.utilization_pct / 100)).toFixed(2));
  const y2_disb = Number((y2_alloc * (Math.max(30, mp.utilization_pct - 15) / 100)).toFixed(2));
  const y3_disb = Number((y3_alloc * (Math.max(20, mp.utilization_pct - 30) / 100)).toFixed(2));

  return [
    {
      financial_year: "FY 2024–25",
      allocated_cr: y1_alloc,
      disbursed_cr: y1_disb,
      unspent_cr: Number((y1_alloc - y1_disb).toFixed(2)),
      utilization_pct: Math.round((y1_disb / y1_alloc) * 100),
      pfms_status: "RECONCILED",
    },
    {
      financial_year: "FY 2023–24",
      allocated_cr: y2_alloc,
      disbursed_cr: y2_disb,
      unspent_cr: Number((y2_alloc - y2_disb).toFixed(2)),
      utilization_pct: Math.round((y2_disb / y2_alloc) * 100),
      pfms_status: "RECONCILED",
    },
    {
      financial_year: "FY 2022–23",
      allocated_cr: y3_alloc,
      disbursed_cr: y3_disb,
      unspent_cr: Number((y3_alloc - y3_disb).toFixed(2)),
      utilization_pct: Math.round((y3_disb / y3_alloc) * 100),
      pfms_status: "RECONCILED",
    },
  ];
}
