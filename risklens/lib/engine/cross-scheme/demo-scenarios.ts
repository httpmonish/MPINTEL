import { NormalizedProject, CrossSchemeMatch } from "@/lib/types";
import { CrossSchemeMatchEngine } from "./matching-engine";
import { MpladsAdapter } from "../schemes/adapters/mplads-adapter";
import { MgnregaAdapter } from "../schemes/adapters/mgnrega-adapter";
import { PmgsyAdapter } from "../schemes/adapters/pmgsy-adapter";
import { getProjectById } from "@/lib/synthetic/fixtures/dataset";

export function getDeterministicCrossSchemeScenarios(): {
  normalizedProjects: NormalizedProject[];
  matches: CrossSchemeMatch[];
  analytics: any;
} {
  const heroMplads = getProjectById("HERO-MPLADS-001");
  const normHeroMplads = heroMplads
    ? MpladsAdapter.normalize(heroMplads)
    : {
        projectId: "HERO-MPLADS-001",
        schemeId: "MPLADS" as const,
        schemeName: "Members of Parliament Local Area Development Scheme",
        title: "Solar High-Mast Grid & Public Facility Electrification",
        description: "Installation of 12-meter octagonal high-mast solar illumination luminaires across 14 public junction points.",
        category: "Solar & Street Lighting",
        latitude: 19.0760,
        longitude: 72.8777,
        location: "Constituency X-01, State X",
        district: "District-X-01",
        state: "State X",
        constituency: "Constituency X-01",
        implementingAgency: "District Planning Officer IDA",
        contractor: "ENT-SOLAR-CORP-09",
        sanctionedAmountINR: 9200000,
        expenditureAmountINR: 9200000,
        startDate: "2023-08-01",
        completionDate: "2024-06-30",
        status: "Delayed",
        photos: [
          {
            id: "PHT-HERO-01",
            url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
            caption: "High-mast lighting structure completion snapshot",
            capturedAt: "2024-03-18T14:30:00Z",
            latitude: 19.0760,
            longitude: 72.8777,
            pHash: "cc88aa2211bb44fe",
          },
        ],
        documents: [],
        source: "eSAKSHI / MoSPI",
        sourceRecordId: "ESAKSHI-HERO-001",
        sourceTimestamp: "2023-08-01",
        isDemo: true,
      };

  // --- SCENARIO A: Strong Potential Overlap (MPLADS + MGNREGA) ---
  const scenarioANreg = MgnregaAdapter.normalize({
    workCode: "NREGA-MH-2023-9021",
    workName: "Solar High-Mast Illumination & Junction Electrification",
    workCategory: "Solar & Street Lighting",
    gramPanchayat: "Junction GP-01",
    block: "Block East",
    district: "District-X-01",
    state: "State X",
    latitude: 19.0763,
    longitude: 72.8780,
    financialYear: "2023-2024",
    sanctionAmountINR: 3800000,
    expenditureINR: 3800000,
    status: "Completed",
    implementingAgency: "District Planning Officer IDA",
    contractorOrMate: "ENT-SOLAR-CORP-09",
    startDate: "2023-09-15",
    completionDate: "2024-05-30",
    photos: [
      {
        id: "PHT-NREGA-9021",
        url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
        caption: "Solar luminaire battery & pole mounting muster photo",
        capturedAt: "2024-03-20T10:15:00Z",
        latitude: 19.0763,
        longitude: 72.8780,
        pHash: "cc88aa2211bb44fd", // Hamming dist = 1 vs HERO-001
      },
    ],
  });

  // --- SCENARIO B: Same Asset, Phased Legitimate Development ---
  const scenarioBMplads: NormalizedProject = {
    projectId: "PRJ-2023-042",
    schemeId: "MPLADS",
    schemeName: "Members of Parliament Local Area Development Scheme",
    title: "Gramin Community Hall Superstructure & Roofing",
    description: "Phase 1 construction of reinforced concrete community hall superstructure and roof truss.",
    category: "Community Halls",
    latitude: 19.1200,
    longitude: 72.8500,
    location: "Block South, State X",
    district: "District-X-02",
    state: "State X",
    constituency: "Constituency X-02",
    implementingAgency: "Executive Engineer PWD",
    contractor: "ENT-CIVIL-BUILD-14",
    sanctionedAmountINR: 4500000,
    expenditureAmountINR: 4500000,
    startDate: "2023-01-10",
    completionDate: "2023-11-15",
    status: "Completed",
    photos: [
      {
        id: "PHT-HALL-01",
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        caption: "Community hall roof truss completion",
        capturedAt: "2023-11-10T12:00:00Z",
        latitude: 19.1200,
        longitude: 72.8500,
        pHash: "1a2b3c4d5e6f7a8b",
      },
    ],
    documents: [],
    source: "eSAKSHI",
    sourceRecordId: "ESAKSHI-PRJ-042",
    sourceTimestamp: "2023-01-10",
    isDemo: true,
  };

  const scenarioBNreg = MgnregaAdapter.normalize({
    workCode: "NREGA-MH-2024-1104",
    workName: "Community Hall Land Leveling & Perimeter Drainage Pavement",
    workCategory: "Land Development",
    gramPanchayat: "Vikas GP",
    block: "Block South",
    district: "District-X-02",
    state: "State X",
    latitude: 19.1203,
    longitude: 72.8502,
    financialYear: "2024-2025",
    sanctionAmountINR: 1200000,
    expenditureINR: 950000,
    status: "In Progress",
    implementingAgency: "Gram Panchayat Vikas",
    startDate: "2024-02-01",
    completionDate: "2024-07-30",
    photos: [
      {
        id: "PHT-NREGA-1104",
        url: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80",
        caption: "Perimeter soil leveling muster observation",
        capturedAt: "2024-04-12T09:30:00Z",
        latitude: 19.1203,
        longitude: 72.8502,
        pHash: "e4f8a3c2b1d09e7f",
      },
    ],
  });

  // --- SCENARIO C: Same Contractor, Different Locations (Clean Relationship) ---
  const scenarioCMplads: NormalizedProject = {
    projectId: "PRJ-2024-080",
    schemeId: "MPLADS",
    schemeName: "Members of Parliament Local Area Development Scheme",
    title: "Bituminous Rural Approach Road Extension",
    description: "Construction of 1.2 km single-lane bituminous pavement.",
    category: "Roads & Bridges",
    latitude: 19.2000,
    longitude: 72.9000,
    location: "Block North, State X",
    district: "District-X-03",
    state: "State X",
    constituency: "Constituency X-03",
    implementingAgency: "Executive Engineer PWD",
    contractor: "ENT-PWD-CORP-42",
    sanctionedAmountINR: 3200000,
    expenditureAmountINR: 3200000,
    startDate: "2023-11-01",
    completionDate: "2024-04-15",
    status: "Completed",
    photos: [],
    documents: [],
    source: "eSAKSHI",
    sourceRecordId: "ESAKSHI-PRJ-080",
    sourceTimestamp: "2023-11-01",
    isDemo: true,
  };

  const scenarioCPmgsy = PmgsyAdapter.normalize({
    packageNumber: "PMGSY-MH-PKG-44",
    roadName: "PMGSY Stage-II Through Route T04 to Habitation H12",
    category: "Roads & Bridges",
    lengthKm: 4.8,
    district: "District-Y-01",
    state: "State Y",
    startLatitude: 19.8500, // 65km distance away
    startLongitude: 73.5000,
    sanctionCostINR: 28500000,
    expenditureINR: 28500000,
    executingAgency: "State Rural Roads Development Agency",
    contractorName: "ENT-PWD-CORP-42", // Same contractor entity
    sanctionDate: "2023-06-01",
    completionDate: "2024-03-30",
    status: "Completed",
    connectedHabitations: ["Habitation H12", "Habitation H14"],
  });

  // --- SCENARIO D: Same Location, Independent Distinct Public Works (Road + Drain) ---
  const scenarioDMplads: NormalizedProject = {
    projectId: "PRJ-2024-105",
    schemeId: "MPLADS",
    schemeName: "Members of Parliament Local Area Development Scheme",
    title: "Cement Concrete Main Village Roadway",
    description: "CC Pavement 600m through main market street.",
    category: "Roads & Bridges",
    latitude: 19.0500,
    longitude: 72.8200,
    location: "Market Ward, State X",
    district: "District-X-01",
    state: "State X",
    constituency: "Constituency X-01",
    implementingAgency: "Municipal Council Engineer",
    contractor: "ENT-CIVIL-INFRA-08",
    sanctionedAmountINR: 2500000,
    expenditureAmountINR: 2500000,
    startDate: "2024-01-15",
    completionDate: "2024-05-15",
    status: "Completed",
    photos: [],
    documents: [],
    source: "eSAKSHI",
    sourceRecordId: "ESAKSHI-PRJ-105",
    sourceTimestamp: "2024-01-15",
    isDemo: true,
  };

  const scenarioDNreg = MgnregaAdapter.normalize({
    workCode: "NREGA-MH-2024-5510",
    workName: "Covered Stormwater Drainage Canal along Market Corridor",
    workCategory: "Sanitation & Public Health",
    gramPanchayat: "Market GP",
    block: "Block Central",
    district: "District-X-01",
    state: "State X",
    latitude: 19.0502,
    longitude: 72.8201, // ~25m away
    financialYear: "2024-2025",
    sanctionAmountINR: 850000,
    expenditureINR: 850000,
    status: "Completed",
    implementingAgency: "Gram Panchayat",
    startDate: "2024-02-01",
    completionDate: "2024-06-01",
    photos: [],
  });

  // --- SCENARIO E: Potential Image Reuse Across Scheme Boundaries ---
  const scenarioEMplads: NormalizedProject = {
    projectId: "PRJ-2023-088",
    schemeId: "MPLADS",
    schemeName: "Members of Parliament Local Area Development Scheme",
    title: "Overhead Drinking Water Storage Reservoir",
    description: "50,000 Litre ESR RCC tank installation.",
    category: "Drinking Water",
    latitude: 18.9800,
    longitude: 72.8300,
    location: "Ward 4, State X",
    district: "District-X-04",
    state: "State X",
    constituency: "Constituency X-04",
    implementingAgency: "Superintending Engineer Rural Water",
    contractor: "ENT-WATER-CORP-22",
    sanctionedAmountINR: 2200000,
    expenditureAmountINR: 2200000,
    startDate: "2023-03-01",
    completionDate: "2023-09-30",
    status: "Completed",
    photos: [
      {
        id: "PHT-REF-088",
        url: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
        caption: "ESR overhead reservoir structure completion",
        capturedAt: "2023-09-28T11:00:00Z",
        latitude: 18.9800,
        longitude: 72.8300,
        pHash: "3f2e1d0c9b8a7f6e",
      },
    ],
    documents: [],
    source: "eSAKSHI",
    sourceRecordId: "ESAKSHI-PRJ-088",
    sourceTimestamp: "2023-03-01",
    isDemo: true,
  };

  const scenarioEPmgsy = PmgsyAdapter.normalize({
    packageNumber: "PMGSY-MH-PKG-99",
    roadName: "Drinking Water Supply Pipeline & Culvert Integration",
    category: "Drinking Water",
    lengthKm: 1.0,
    district: "District-X-04",
    state: "State X",
    startLatitude: 18.9808,
    startLongitude: 72.8309,
    sanctionCostINR: 1900000,
    expenditureINR: 1900000,
    executingAgency: "SRRDA",
    contractorName: "ENT-WATER-CORP-22",
    sanctionDate: "2023-05-15",
    completionDate: "2023-11-20",
    status: "Completed",
    connectedHabitations: ["Habitation W04"],
    photos: [
      {
        id: "PHT-PMGSY-99-01",
        url: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
        caption: "Water reservoir culvert inspection photo",
        capturedAt: "2023-10-15T15:00:00Z",
        latitude: 18.9808,
        longitude: 72.8309,
        pHash: "3f2e1d0c9b8a7f6d", // Hamming dist = 1
      },
    ],
  });

  const allProjects = [
    normHeroMplads,
    scenarioANreg,
    scenarioBMplads,
    scenarioBNreg,
    scenarioCMplads,
    scenarioCPmgsy,
    scenarioDMplads,
    scenarioDNreg,
    scenarioEMplads,
    scenarioEPmgsy,
  ];

  // Evaluate matches
  const matchA = CrossSchemeMatchEngine.evaluatePair(normHeroMplads, scenarioANreg);
  matchA.isDemoScenario = true;
  matchA.demoScenarioTag = "SCENARIO_A";

  const matchB = CrossSchemeMatchEngine.evaluatePair(scenarioBMplads, scenarioBNreg);
  matchB.isDemoScenario = true;
  matchB.demoScenarioTag = "SCENARIO_B";

  const matchC = CrossSchemeMatchEngine.evaluatePair(scenarioCMplads, scenarioCPmgsy);
  matchC.isDemoScenario = true;
  matchC.demoScenarioTag = "SCENARIO_C";

  const matchD = CrossSchemeMatchEngine.evaluatePair(scenarioDMplads, scenarioDNreg);
  matchD.isDemoScenario = true;
  matchD.demoScenarioTag = "SCENARIO_D";

  const matchE = CrossSchemeMatchEngine.evaluatePair(scenarioEMplads, scenarioEPmgsy);
  matchE.isDemoScenario = true;
  matchE.demoScenarioTag = "SCENARIO_E";

  const matches = [matchA, matchB, matchC, matchD, matchE];

  const analytics = {
    totalMatchedPairs: 124,
    potentialOverlapsCount: 28,
    highSimilarityCount: 7,
    requiresReviewCount: 14,
    confirmedSharedAssetsCount: 9,
    falseMatchesCount: 18,
    pendingInspectionsCount: 4,
    schemePairDistribution: [
      { schemePair: "MPLADS ↔ MGNREGA", count: 68, avgSimilarity: 64 },
      { schemePair: "MPLADS ↔ PMGSY", count: 34, avgSimilarity: 52 },
      { schemePair: "MGNREGA ↔ PMGSY", count: 22, avgSimilarity: 41 },
    ],
    categoryDistribution: [
      { category: "Roads & Bridges", count: 48 },
      { category: "Solar & Street Lighting", count: 32 },
      { category: "Community Halls", count: 24 },
      { category: "Drinking Water", count: 20 },
    ],
    hotspots: [
      { state: "State X", district: "District-X-01", latitude: 19.0760, longitude: 72.8777, matchCount: 12, highestSimilarity: 91 },
      { state: "State X", district: "District-X-02", latitude: 19.1200, longitude: 72.8500, matchCount: 8, highestSimilarity: 78 },
      { state: "State X", district: "District-X-04", latitude: 18.9800, longitude: 72.8300, matchCount: 5, highestSimilarity: 86 },
    ],
  };

  return {
    normalizedProjects: allProjects,
    matches,
    analytics,
  };
}
