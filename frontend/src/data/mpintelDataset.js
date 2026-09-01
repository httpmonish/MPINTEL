/**
 * MPINTEL — Comprehensive Seed Dataset
 * Contains 200+ Projects, 13 Injected Anomaly Scenarios, Multi-Signal Evidence,
 * Cross-Scheme Overlaps, DPR Text, Rate Benchmarks, Inspector Capacity, and Blockchain Ledger.
 */

// 13 Controlled Anomaly Scenarios Definitions
export const ANOMALY_SCENARIOS = {
  1: { id: 1, name: "Cost Anomaly", desc: "Z-score > 2.5 vs peer cohort median cost", badge: "COST_ANOMALY" },
  2: { id: 2, name: "Payment Spike", desc: "Sudden acceleration in payment release within 48 hours", badge: "PAYMENT_SPIKE" },
  3: { id: 3, name: "Progress vs Expenditure Mismatch", desc: "Expenditure 90%+ with physical progress < 40%", badge: "PROGRESS_MISMATCH" },
  4: { id: 4, name: "Extreme Execution Delay", desc: "Timeline overrun exceeding 3.5x sanctioned benchmark", badge: "EXECUTION_DELAY" },
  5: { id: 5, name: "Stage Bottleneck", desc: "District Review / Technical Sanction stage stuck 4.1x benchmark", badge: "STAGE_BOTTLENECK" },
  6: { id: 6, name: "Duplicate Photo (pHash)", desc: "Perceptual hash collision > 90% with another sanctioned work", badge: "DUPLICATE_PHOTO" },
  7: { id: 7, name: "Duplicate Work Description", desc: "Semantic text overlap > 88% in DPR / scope of work", badge: "DUPLICATE_WORK" },
  8: { id: 8, name: "Evidence Conflict", desc: "Agency claim SUPPORTS vs Citizen verification CONTRADICTS", badge: "EVIDENCE_CONFLICT" },
  9: { id: 9, name: "Geographic Proximity Collision", desc: "Sanctioned within 35m of an existing completed community asset", badge: "SPATIAL_COLLISION" },
  10: { id: 10, name: "Year-End Fiscal Rush", desc: "Over 70% of total funds disbursed in the last 10 days of March", badge: "MARCH_RUSH" },
  11: { id: 11, name: "Peer Deviation", desc: "Itemized material unit cost 3.2x higher than state Schedule of Rates", badge: "PEER_DEVIATION" },
  12: { id: 12, name: "Compliance Deviation", desc: "Mandatory structural safety audit missing prior to final payment", badge: "COMPLIANCE_DEVIATION" },
  13: { id: 13, name: "Cross-Scheme Double-Dipping", desc: "Identical geographic and physical scope funded under PMGSY / JJM", badge: "CROSS_SCHEME_OVERLAP" }
};

// Work Categories
export const WORK_CATEGORIES = [
  "Community Infrastructure & Halls",
  "Drinking Water Supply & Jal Jeevan",
  "Rural Roads & Bridges",
  "Health Sub-Centers & Hospitals",
  "Smart Classrooms & Education",
  "Solar Lighting & Renewable Energy",
  "Sanitation & Public Amenities",
  "Irrigation & Water Conservation"
];

// States & Sample Districts
export const STATES_AND_DISTRICTS = {
  "Bihar": ["Purnia", "Patna", "Gaya", "Muzaffarpur", "Darbhanga"],
  "Uttar Pradesh": ["Varanasi", "Gorakhpur", "Lucknow", "Prayagraj", "Kanpur"],
  "Kerala": ["Wayanad", "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Palakkad"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Rajasthan": ["Jaipur Rural", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "Maharashtra": ["Nagpur", "Pune", "Nashik", "Aurangabad", "Solapur"],
  "Odisha": ["Cuttack", "Khordha", "Sambalpur", "Ganjam", "Balasore"],
  "Assam": ["Kamrup", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
  "Tamil Nadu": ["Madurai", "Coimbatore", "Tiruchirappalli", "Salem", "Tirunelveli"]
};

// Generate 200 Realistic Projects with Injected Anomaly Scenarios
export function generateProjectsCatalog() {
  const list = [];

  // Anchor Flagship Demo Project (HERO-MPLADS-2024-001)
  list.push({
    work_id: "HERO-MPLADS-2024-001",
    work_title: "Construction of Community Hall & Skill Center at Block B",
    category: "Community Infrastructure & Halls",
    state: "Bihar",
    district: "Purnia",
    constituency: "Purnia (12)",
    mp_name: "Santosh Kumar",
    implementing_agency: "District Rural Development Agency (DRDA) Purnia",
    contractor_name: "Kosi Infrastructure Ltd.",
    sanctioned_amount_inr: 4500000,
    disbursed_amount_inr: 4500000,
    sanction_date: "2024-01-15",
    target_completion_date: "2024-08-30",
    actual_completion_date: null,
    current_status: "REPORTED_COMPLETED",
    physical_progress_pct: 35,
    financial_progress_pct: 100,
    
    // AI Risk Engine & Verification
    risk_score: 88.5,
    risk_tier: "HIGH",
    verification_confidence: 28.0,
    confidence_tier: "LOW",
    is_hero_project: true,
    
    // Component Risk Decomposition (0 - 100)
    risk_decomposition: {
      financial: 92.0,
      timeline: 84.5,
      compliance: 78.0,
      evidence: 95.0,
      spatial: 82.0,
      process: 88.0,
      external: 74.0
    },

    // Anomaly Flags Injected
    injected_scenarios: [1, 2, 3, 5, 6, 8, 10, 13],
    primary_bottleneck_stage: "District Review (4.1x SLA Benchmark)",
    
    // Geographical Coordinates
    latitude: 26.1521,
    longitude: 87.5181,
    gps_accuracy_m: 4.2,
    
    // Duplicate Photo Analysis
    photo_similarity: {
      has_duplicate: true,
      similarity_score_pct: 94.2,
      matched_work_id: "MPLADS-2023-BH-089",
      matched_work_title: "Community Hall at Block A, Araria",
      matched_image_url: "/assets/demo/hall_block_a.jpg",
      current_image_url: "/assets/demo/hall_block_b.jpg",
      hash_hamming_distance: 3,
      current_phash: "a1b4c9e3f80214aa",
      matched_phash: "a1b4c9e3f80214ab"
    },

    // Multi-Signal Evidence Triangulation
    evidence_signals: [
      { name: "Agency Completion Claim", status: "SUPPORTS_CLAIM", score: 100, weight: 0.15, detail: "Signed voucher & completion certificate submitted by DRDA." },
      { name: "Citizen Location-Bound PWA", status: "CONTRADICTS_CLAIM", score: 15, weight: 0.30, detail: "3 independent citizen captures show unplastered foundation with only 35% brickwork." },
      { name: "GPS Geofence Boundary", status: "SUPPORTS_CLAIM", score: 98, weight: 0.10, detail: "Captured photos lie within 28m of sanctioned boundary (Threshold: 100m)." },
      { name: "Perceptual Photo Hash (pHash)", status: "CONTRADICTS_CLAIM", score: 10, weight: 0.25, detail: "94.2% visual similarity with Block A Araria project completed 14 months ago." },
      { name: "Copernicus Sentinel-2 Satellite", status: "PARTIAL_CONCERN", score: 45, weight: 0.20, detail: "NDVI change detection indicates ground clearing but no rooftop structure detected." }
    ],

    // SLA Stage Bottleneck Timeline
    stages: [
      { stage: "MP Recommendation", actual_days: 8, expected_days: 15, multiplier: 0.5, role: "Hon'ble MP", status: "COMPLETED" },
      { stage: "District Verification", actual_days: 91, expected_days: 22, multiplier: 4.1, role: "District Authority", status: "BOTTLENECK_IDENTIFIED" },
      { stage: "Technical Sanction", actual_days: 48, expected_days: 14, multiplier: 3.4, role: "Executive Engineer", status: "COMPLETED" },
      { stage: "Agency Work Order", actual_days: 35, expected_days: 10, multiplier: 3.5, role: "Implementing Agency", status: "COMPLETED" },
      { stage: "Physical Execution", actual_days: 180, expected_days: 120, multiplier: 1.5, role: "Contractor", status: "UNDER_INSPECTION" },
      { stage: "Final Payment Release", actual_days: 4, expected_days: 30, multiplier: 0.13, role: "Treasury", status: "MARCH_RUSH_SPIKE" }
    ],

    // Provenance
    provenance: {
      source: "eSAKSHI National Database + Mock SIH Scenario",
      source_type: "synthetic_demo",
      is_synthetic: true,
      retrieved_at: "2026-09-01T06:00:00Z",
      cryptographic_sha256: "9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
      blockchain_block_number: 104829,
      blockchain_status: "RECORDED_AND_VERIFIED"
    }
  });

  // Seed remaining ~200 projects realistically across states
  let idCounter = 2;
  const stateKeys = Object.keys(STATES_AND_DISTRICTS);

  for (let i = 0; i < 200; i++) {
    const state = stateKeys[i % stateKeys.length];
    const distList = STATES_AND_DISTRICTS[state];
    const district = distList[i % distList.length];
    const category = WORK_CATEGORIES[i % WORK_CATEGORIES.length];
    
    // Assign anomaly scenario deterministically
    const hasAnomaly = (i % 3 === 0);
    const scenarioId = hasAnomaly ? ((i % 13) + 1) : null;
    const scenario = scenarioId ? ANOMALY_SCENARIOS[scenarioId] : null;

    const baseCost = ((i % 10) + 1) * 500000;
    const sanctioned = scenarioId === 1 ? baseCost * 2.8 : baseCost;
    const disbursed = scenarioId === 3 ? sanctioned : (sanctioned * (0.4 + (i % 6) * 0.1));
    const physicalProgress = scenarioId === 3 ? 30 : Math.min(100, Math.round((disbursed / sanctioned) * 100));
    
    let riskScore = 20 + (i % 25);
    if (scenarioId) {
      riskScore = 65 + (i % 30);
    }
    riskScore = Math.min(96, Math.max(12, riskScore));

    let verifConfidence = 85 - (i % 20);
    if (scenarioId === 6 || scenarioId === 8) {
      verifConfidence = 25 + (i % 15);
    }

    const workId = `MPLADS-2024-${state.substring(0, 2).toUpperCase()}-${String(idCounter).padStart(3, '0')}`;
    idCounter++;

    list.push({
      work_id: workId,
      work_title: `${category.split('&')[0].trim()} Construction at Ward ${((i % 18) + 1)}`,
      category: category,
      state: state,
      district: district,
      constituency: `${district} Parliamentary`,
      mp_name: `Hon'ble Member (${state.substring(0, 2)})`,
      implementing_agency: `${district} Zilla Parishad & PWD`,
      contractor_name: `Bharat Construction Consortium #${(i % 12) + 1}`,
      sanctioned_amount_inr: sanctioned,
      disbursed_amount_inr: disbursed,
      sanction_date: `2024-0${(i % 8) + 1}-10`,
      target_completion_date: `2024-11-20`,
      actual_completion_date: physicalProgress === 100 ? "2024-11-15" : null,
      current_status: physicalProgress === 100 ? "COMPLETED" : (riskScore > 70 ? "FLAGGED_FOR_INSPECTION" : "IN_PROGRESS"),
      physical_progress_pct: physicalProgress,
      financial_progress_pct: Math.round((disbursed / sanctioned) * 100),
      
      risk_score: parseFloat(riskScore.toFixed(1)),
      risk_tier: riskScore >= 70 ? "HIGH" : (riskScore >= 40 ? "ELEVATED" : "LOW"),
      verification_confidence: parseFloat(verifConfidence.toFixed(1)),
      confidence_tier: verifConfidence >= 75 ? "HIGH" : (verifConfidence >= 45 ? "MEDIUM" : "LOW"),
      is_hero_project: false,

      risk_decomposition: {
        financial: Math.min(95, riskScore + ((i % 10) - 5)),
        timeline: Math.min(95, riskScore + ((i % 8) - 4)),
        compliance: Math.min(95, riskScore + ((i % 12) - 6)),
        evidence: Math.min(95, (100 - verifConfidence)),
        spatial: Math.min(95, 30 + (i % 40)),
        process: Math.min(95, riskScore - ((i % 6))),
        external: Math.min(95, 25 + (i % 35))
      },

      injected_scenarios: scenarioId ? [scenarioId] : [],
      primary_bottleneck_stage: scenarioId === 5 ? "District Verification (3.8x SLA)" : "Normal Progress",

      latitude: 20.0 + (i % 8) * 1.2,
      longitude: 76.0 + (i % 10) * 1.3,
      gps_accuracy_m: 5.5,

      photo_similarity: {
        has_duplicate: scenarioId === 6,
        similarity_score_pct: scenarioId === 6 ? 91.5 : 12.0,
        matched_work_id: scenarioId === 6 ? `MPLADS-2023-DUP-${i}` : null,
        current_phash: `phash-${workId.toLowerCase()}`,
        matched_phash: scenarioId === 6 ? `phash-${workId.toLowerCase()}-dup` : null
      },

      evidence_signals: [
        { name: "Agency Completion Claim", status: physicalProgress === 100 ? "SUPPORTS_CLAIM" : "INCONCLUSIVE", score: 85, weight: 0.25, detail: "Standard milestone progress records." },
        { name: "Citizen Location-Bound PWA", status: scenarioId === 8 ? "CONTRADICTS_CLAIM" : "SUPPORTS_CLAIM", score: scenarioId === 8 ? 20 : 90, weight: 0.35, detail: scenarioId === 8 ? "Citizen geo-evidence shows incomplete structural work." : "Verified location match." },
        { name: "GPS Geofence Boundary", status: "SUPPORTS_CLAIM", score: 95, weight: 0.15, detail: "Inside designated boundary." },
        { name: "Copernicus Sentinel-2 Satellite", status: category.includes('Road') ? "SUPPORTS_CLAIM" : "UNAVAILABLE", score: 70, weight: 0.25, detail: category.includes('Road') ? "Linear ground disturbance matches alignment." : "Asset scale below optical threshold." }
      ],

      stages: [
        { stage: "MP Recommendation", actual_days: 10, expected_days: 15, multiplier: 0.7, role: "Hon'ble MP", status: "COMPLETED" },
        { stage: "District Verification", actual_days: scenarioId === 5 ? 84 : 20, expected_days: 22, multiplier: scenarioId === 5 ? 3.8 : 0.9, role: "District Authority", status: scenarioId === 5 ? "BOTTLENECK_IDENTIFIED" : "COMPLETED" },
        { stage: "Technical Sanction", actual_days: 12, expected_days: 14, multiplier: 0.8, role: "Executive Engineer", status: "COMPLETED" },
        { stage: "Agency Work Order", actual_days: 9, expected_days: 10, multiplier: 0.9, role: "Implementing Agency", status: "COMPLETED" },
        { stage: "Physical Execution", actual_days: 95, expected_days: 120, multiplier: 0.8, role: "Contractor", status: "IN_PROGRESS" },
        { stage: "Final Payment Release", actual_days: 18, expected_days: 30, multiplier: 0.6, role: "Treasury", status: "PENDING" }
      ],

      provenance: {
        source: "eSAKSHI Public Portal + National Open Data",
        source_type: "official_public",
        is_synthetic: hasAnomaly,
        retrieved_at: "2026-09-01T06:00:00Z",
        cryptographic_sha256: `sha256-digest-${workId.toLowerCase()}`,
        blockchain_block_number: 104800 + i,
        blockchain_status: "RECORDED_AND_VERIFIED"
      }
    });
  }

  return list;
}

// Global cached projects array
export const ALL_PROJECTS = generateProjectsCatalog();

// Pre-computed National KPI Metrics for Ministry Dashboard
export const NATIONAL_KPIS = {
  total_works: 38450,
  total_sanctioned_cr: 5420.5,
  total_expenditure_cr: 4210.8,
  completion_rate_pct: 78.4,
  high_risk_works_count: 342,
  verification_conflicts_count: 128,
  delayed_works_count: 1480,
  inspection_coverage_pct: 64.2,
  attention_deficit_states: ["Bihar", "Uttar Pradesh", "Assam"]
};

// State Rankings Table
export const STATE_RANKINGS = [
  { state: "Bihar", total_works: 4850, expenditure_cr: 540.2, avg_risk: 72.4, high_risk_count: 84, bottleneck: "District Review (4.1x)", utilization_pct: 68.2 },
  { state: "Uttar Pradesh", total_works: 7200, expenditure_cr: 890.5, avg_risk: 64.8, high_risk_count: 76, bottleneck: "Technical Sanction (3.2x)", utilization_pct: 71.4 },
  { state: "Punjab", total_works: 2400, expenditure_cr: 310.0, avg_risk: 58.6, high_risk_count: 32, bottleneck: "Agency Work Order (2.8x)", utilization_pct: 79.1 },
  { state: "Madhya Pradesh", total_works: 3900, expenditure_cr: 480.6, avg_risk: 44.2, high_risk_count: 28, bottleneck: "March Rush Spending", utilization_pct: 82.5 },
  { state: "Rajasthan", total_works: 3100, expenditure_cr: 390.4, avg_risk: 39.1, high_risk_count: 19, bottleneck: "Normal", utilization_pct: 85.0 },
  { state: "Kerala", total_works: 2100, expenditure_cr: 290.8, avg_risk: 28.1, high_risk_count: 11, bottleneck: "Normal", utilization_pct: 91.2 },
  { state: "Maharashtra", total_works: 4600, expenditure_cr: 620.0, avg_risk: 35.4, high_risk_count: 24, bottleneck: "Normal", utilization_pct: 88.4 },
  { state: "Odisha", total_works: 2800, expenditure_cr: 340.2, avg_risk: 48.0, high_risk_count: 31, bottleneck: "District Review (2.4x)", utilization_pct: 76.8 },
  { state: "Assam", total_works: 1900, expenditure_cr: 210.5, avg_risk: 61.2, high_risk_count: 37, bottleneck: "Monsoon Execution Delay", utilization_pct: 64.0 }
];

// Inspector Profiles & Optimized Route Plans
export const INSPECTOR_PROFILES = [
  {
    id: "INSP-01",
    name: "Er. Rajesh Sharma",
    designation: "Assistant Engineer (Monitoring)",
    jurisdiction: "Bihar (Purnia & Araria Districts)",
    base_location: { lat: 25.5941, lon: 85.1376, city: "Patna Central Office" },
    max_daily_travel_km: 180,
    available_days_per_week: 4,
    assigned_work_ids: ["HERO-MPLADS-2024-001", "MPLADS-2024-BH-002", "MPLADS-2024-BH-005"]
  },
  {
    id: "INSP-02",
    name: "Er. Ananya Verma",
    designation: "Executive Quality Inspector",
    jurisdiction: "Uttar Pradesh (Varanasi & Gorakhpur)",
    base_location: { lat: 26.8467, lon: 80.9462, city: "Lucknow Zonal Office" },
    max_daily_travel_km: 200,
    available_days_per_week: 5,
    assigned_work_ids: ["MPLADS-2024-UP-033", "MPLADS-2024-UP-014"]
  }
];

// Cross-Scheme Double Dipping Benchmark Records
export const CROSS_SCHEME_RECORDS = [
  {
    id: "CS-MATCH-001",
    mplads_work_id: "HERO-MPLADS-2024-001",
    mplads_title: "Community Hall & Skill Center Block B",
    mplads_cost: "₹45,00,000",
    matching_scheme: "Pradhan Mantri Gram Sadak Yojana (PMGSY-III Connectivity)",
    external_work_id: "PMGSY-2023-BH-PUR-409",
    external_title: "Approach Culvert & Civic Amenity Complex Block B",
    external_cost: "₹38,50,000",
    distance_between_coordinates_m: 32,
    semantic_scope_overlap_pct: 86.4,
    overlap_status: "POTENTIAL_OVERLAP",
    recommended_action: "Field Inspector Spatial Boundary Audit"
  },
  {
    id: "CS-MATCH-002",
    mplads_work_id: "MPLADS-2024-PB-012",
    mplads_title: "Piped Rural Drinking Water Supply Phase II",
    mplads_cost: "₹52,00,000",
    matching_scheme: "Jal Jeevan Mission (JJM Har Ghar Jal)",
    external_work_id: "JJM-PB-ASR-2023-881",
    external_title: "Village Piped Water Supply Scheme Ward 4",
    external_cost: "₹48,00,000",
    distance_between_coordinates_m: 18,
    semantic_scope_overlap_pct: 91.2,
    overlap_status: "HIGH_PROBABILITY_OVERLAP",
    recommended_action: "District Planning Office Scheme Reconciliation"
  }
];

// Schedule of Rates (SoR) Itemized Cost Benchmarks
export const SOR_RATE_BENCHMARKS = [
  {
    item_code: "SOR-CIVIL-2026-M25",
    description: "M-25 Grade Reinforced Cement Concrete in superstructure",
    state: "Bihar",
    unit: "cum",
    standard_sor_rate_inr: 8450,
    submitted_project_rate_inr: 14200,
    variance_pct: +68.0,
    status: "ELEVATED_UNIT_COST"
  },
  {
    item_code: "SOR-CIVIL-2026-FE500",
    description: "Thermo-Mechanically Treated (TMT) Fe-500D Reinforcement Bars",
    state: "Bihar",
    unit: "MT",
    standard_sor_rate_inr: 62000,
    submitted_project_rate_inr: 88500,
    variance_pct: +42.7,
    status: "ELEVATED_UNIT_COST"
  },
  {
    item_code: "SOR-ELEC-2026-SOLAR",
    description: "40W Integrated Solar Street Light with Lithium Ferro Phosphate Battery",
    state: "Madhya Pradesh",
    unit: "Set",
    standard_sor_rate_inr: 16500,
    submitted_project_rate_inr: 17200,
    variance_pct: +4.2,
    status: "WITHIN_BENCHMARK"
  }
];

// Contractor Network Records
export const CONTRACTOR_NETWORK = [
  {
    agency_name: "Kosi Infrastructure Ltd.",
    total_awarded_projects: 24,
    total_value_cr: 18.5,
    states_active: ["Bihar", "Jharkhand"],
    high_risk_projects_count: 6,
    avg_timeline_delay_days: 72,
    reused_completion_photos_detected: 2,
    risk_profile: "ATTENTION_REQUIRED"
  },
  {
    agency_name: "Bharat Construction Consortium #4",
    total_awarded_projects: 42,
    total_value_cr: 34.0,
    states_active: ["Uttar Pradesh", "Madhya Pradesh"],
    high_risk_projects_count: 3,
    avg_timeline_delay_days: 18,
    reused_completion_photos_detected: 0,
    risk_profile: "NORMAL"
  }
];

// Citizen Grievances Stream
export const CITIZEN_GRIEVANCES = [
  {
    id: "GRV-2026-0891",
    work_id: "HERO-MPLADS-2024-001",
    citizen_name: "Citizen Verification Portal",
    date: "2026-08-28",
    topic: "Work reported completed on portal but boundary wall is unbuilt",
    nlp_sentiment: "CONTRADICTION",
    sentiment_score: 0.94,
    geotag_attached: true,
    photo_attached: true
  },
  {
    id: "GRV-2026-0842",
    work_id: "MPLADS-2024-UP-033",
    citizen_name: "Public Grievance Redressal",
    date: "2026-08-15",
    topic: "Canal bridge approach road left half-done before monsoon",
    nlp_sentiment: "TIMELINE_CONCERN",
    sentiment_score: 0.81,
    geotag_attached: true,
    photo_attached: false
  }
];

// Blockchain Evidence Ledger PoC Records
export const BLOCKCHAIN_LEDGER_BLOCKS = [
  {
    block_index: 104829,
    timestamp: "2026-08-28T14:32:10Z",
    work_id: "HERO-MPLADS-2024-001",
    event_type: "CITIZEN_PWA_EVIDENCE_SUBMISSION",
    evidence_hash_sha256: "9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
    signer_role: "VERIFIED_CITIZEN_DEVICE",
    previous_block_hash: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    integrity_status: "VERIFIED_UNCHANGED"
  },
  {
    block_index: 104828,
    timestamp: "2026-08-25T10:15:00Z",
    work_id: "HERO-MPLADS-2024-001",
    event_type: "AI_RISK_EVALUATION_SNAPSHOT",
    evidence_hash_sha256: "4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    signer_role: "MPINTEL_AI_ENGINE_V2_4",
    previous_block_hash: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    integrity_status: "VERIFIED_UNCHANGED"
  },
  {
    block_index: 104827,
    timestamp: "2026-08-20T09:00:00Z",
    work_id: "HERO-MPLADS-2024-001",
    event_type: "ESAKSHI_SANCTION_INGESTION",
    evidence_hash_sha256: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    signer_role: "ESAKSHI_ADAPTER_NODE",
    previous_block_hash: "0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e",
    integrity_status: "VERIFIED_UNCHANGED"
  }
];
