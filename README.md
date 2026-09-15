# AI-Powered MPLADS Intelligence + Independent Verification Platform

Official submission repository for **SIH 2026** AI-Powered MPLADS (Members of Parliament Local Area Development Scheme) Monitoring.

> [!NOTE]  
> **Core Positioning**: Operates as an **intelligence + independent verification layer ON TOP of eSAKSHI**. It does not replace eSAKSHI or call officials corrupt. It detects, verifies, explains, prioritizes, acts, and learns.

---

## Key Capabilities (Phases 1 to 7 Built & Verified)

1. **Feature 1 — AI Risk Engine**: Explainable, additive component-wise composite Risk Score (0–100) combining statistical Z-score/IQR deviation, SLA timeline delay ratio, March fiscal rush flags, spatial clustering, and Isolation Forest anomaly scores.
2. **Feature 2 — Contextual Peer Comparison**: Cohort benchmarking by Work Category × State × Budget Tier (<5L, 5L-20L, >20L) × Fiscal Year. Includes small sample size protection (`<5` records -> fallback to macro state baseline).
3. **Feature 3 — Duplicate Photo Detection**: Perceptual hashing (`pHash`) & Hamming distance similarity scoring to spot reused completion photos across projects.
4. **Feature 4 — Location-Bound Citizen Verification PWA**: Mobile live camera stream capture (gallery uploads blocked) + server-side Haversine geodesic distance calculation (100m threshold).
5. **Feature 5 — Evidence Triangulation**: Multi-signal `Verification Confidence (0–100)` (strictly decoupled from Risk Score). Signal breakdown states: `✅ SUPPORTS_CLAIM`, `❌ CONTRADICTS_CLAIM`, `🟡 INCONCLUSIVE`, `⚠️ PARTIAL_CONCERN`, `— UNAVAILABLE`.
6. **Feature 6 — Stage-Wise SLA Bottleneck Analyzer**: Identifies stage delays vs benchmark SLA with role-based attribution (e.g. *"District review stage handled by District Planning Officer IDA exceeded expected time by 4.1×"*). Zero naming of individual officials.
7. **Feature 7 — Inspection Resource Optimizer**: Capacity-aware greedy nearest-neighbor route planner ranking inspector visits by composite priority (risk, confidence gap, value, and distance penalty).
8. **Feature 8 — Confidence / Evidence Ledger**: Immutable decision audit logging (`audit_ledger`) capturing model version, rules version, data sources with synthetic vs eSAKSHI provenance tags, and human officer feedback.
9. **Feature 9 — Fairness Safeguard**: Consolidates `resolve_evidence_status()` ensuring unavailable evidence never numerically penalizes scores (verified 0.0 risk bias delta on sparse remote cohorts).
10. **Phase 1 Extension — Production Satellite Evidence Subsystem**:
    - Multi-provider abstraction (`BhuvanProvider`, `SentinelProvider`, `MockSatelliteProvider`)
    - Geographic coordinate validation & configurable Area of Interest (AOI: 50m / 100m / 250m)
    - Normalized Difference Built-up Index (NDBI) surface delta & Spectral Angle Mapper (SAM) change detection
    - Spatial consistency overlap score between detected change footprint and sanctioned AOI
    - Decoupled `Satellite Evidence Confidence` (0–100) with zero risk score mutation
    - Interactive before/after viewer with difference mask overlay, AOI boundary, and metadata audit drawer.
11. **Hero Demo Spotlight (`HERO-MPLADS-001` / `HERO-MPLADS-2024-001`)**: Anchor project demonstrating all features seamlessly in 30 seconds.

---

## Satellite Evidence Verification Architecture (Phase 1)

> [!IMPORTANT]
> **Core Civic Principle**: Satellite evidence is an **independent verification signal**, not definitive proof of project completion or non-compliance.
> - **Risk Score ≠ Verification Confidence**: Both metrics are calculated and rendered independently.
> - **Zero Penalty Rule**: Unavailable imagery (`— UNAVAILABLE`) or cloud cover (`LOW_QUALITY`) does not penalize scores.
> - **Neutral Terminology**: No accusatory labels. Uses `Satellite evidence detected`, `Requires verification`, `No significant change detected`.

```
PROJECT COORDINATES
       ↓
COORDINATE VALIDATION & AOI BUFFER (100m)
       ↓
PROVIDER SELECTION (ISRO Bhuvan / Copernicus Sentinel-2 / Mock Engine)
       ↓
IMAGE ACQUISITION & CLOUD-COVER QUALITY CHECK (< 65% threshold)
       ↓
BEFORE / AFTER NORMALIZED DIFFERENCE BUILT-UP INDEX (NDBI)
       ↓
SPATIAL CONSISTENCY (Detected Area vs Sanctioned AOI)
       ↓
SATELLITE EVIDENCE CONFIDENCE (0–100)
       ↓
INVESTIGATION DEEP-DIVE VIEW (/investigation/[projectId])
```

### Supported Satellite Providers & Setup
1. **Copernicus Sentinel-2 (ESA MSI L2A)**:
   - 10m multispectral surface reflectance with 5-day revisit rate.
   - **Real STAC API Querying**: Directly queries global AWS Sentinel-2 L2A STAC catalogue (`https://earth-search.aws.element84.com/v1/search`) and Copernicus Hub with date range and cloud filtering.
   - **Interactive GIS Map Viewer (`SentinelMapViewer`)**:
     - Real-time "Latest Available Sentinel-2 Imagery" header with observation timestamp and cloud meter.
     - Interactive swipe split comparison, side-by-side view, and NDBI delta mask.
     - Multi-band layer switcher: True Color (B04-B03-B02), False Color NIR (B08-B04-B03), NDBI Delta.
     - Project GPS pinpoint marker, 100m AOI buffer ring, coordinate grid, scale bar, and zoom controls.
   - **Observation Scene Selector (`SentinelSceneSelector`)**:
     - Candidate pass table: `Date | Orbit Pass | Cloud Coverage | Quality Tier | Action (Set T0 / Set T1)`.
     - Quality filtering (< 10%, < 20%, < 30%, < 60% cloud).
     - Atmospheric cloud rejection diagnostic banner explaining why newer cloudy scenes were rejected in favor of the latest suitable clear pass.
   - Credentials (optional): set `SENTINEL_HUB_CLIENT_SECRET` or `COPERNICUS_API_KEY` in environment variables.
2. **ISRO Bhuvan Geoportal (Cartosat-3 / Resourcesat-2A)**:
   - High-resolution panchromatic (0.28m) & multispectral (1.12m) imaging over Indian sovereign territory.
   - Credentials (optional): set `BHUVAN_API_KEY` in environment variables.
3. **Deterministic Multi-Sensor Mock Provider**:
   - Production-style mock engine with 5 reproducible scenarios:
     - `Scenario A (CLEAR_CHANGE)`: Structure footprint confirmed in AOI (e.g. `HERO-MPLADS-001`).
     - `Scenario B (NO_SIGNIFICANT_CHANGE)`: Bare surface, zero observable construction in AOI.
     - `Scenario C (LOW_QUALITY)`: Monsoon cloud cover (>70%) preventing optical confirmation.
     - `Scenario D (UNAVAILABLE)`: Remote archive coverage gap; recorded neutrally with zero penalty.
     - `Scenario E (REQUIRES_REVIEW)`: Construction detected but spatially offset from sanctioned GPS.

### API Endpoints
- `GET /api/v1/projects/{project_id}/satellite`: Fetch satellite evidence payload and metrics.
- `GET /api/v1/projects/{project_id}/satellite/scenes`: Query and filter Sentinel-2 observation passes with cloud thresholds and quality grading.
- `POST /api/v1/projects/{project_id}/satellite/compare`: Run multi-temporal comparison between two specific Sentinel-2 scenes.
- `POST /api/v1/projects/{project_id}/satellite/analyze`: Run on-demand satellite analysis with custom coordinates/AOI.
- `GET /api/v1/projects/{project_id}/satellite/evidence`: Fetch audit-grade sensor metadata, orbit pass, and pipeline hash.
- `GET /api/v1/projects/{project_id}/satellite/status`: Quick status summary for dashboard tables.

---

## Phase 2: Real Field Verification & Physical Inspection Subsystem

Phase 2 introduces the end-to-end statutory inspection lifecycle, live GPS validation, camera hardware stream enforcement with TPM v2 cryptographic signatures, pHash duplicate detection, multi-stage milestone timelines, and multi-signal evidence triangulation.

### Multi-Signal Evidence Triangulation
```
                PROJECT CLAIM (eSAKSHI)
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
     GPS TELEMETRY    LIVE PHOTO     SENTINEL-2
      (Haversine)    (TPM/pHash)     SATELLITE
          │               │               │
          └───────────────┼───────────────┘
                          ↓
              EVIDENCE TRIANGULATION
                          ↓
          VERIFICATION CONFIDENCE (0–100)
```

### Core Architecture & Guarantees
- **Strict Decoupling**: Verification Confidence (0–100) remains an independent physical evidence dimension. It **never** modifies the numerical Risk Score (0–100).
- **Zero Penalty for Missing Evidence**: Under the Fairness Safeguard, unavailable GPS or lack of photos receives 0.0 penalty.
- **Auditable Historical Immutability**: Inspection records are immutable; re-inspections create linked child records (`reinspectionOfId`).
- **Cryptographic TPM Hardware Signatures**: `SIGNED_AND_VALID`, `SIGNED_BUT_INVALID`, `UNSIGNED`, `DEVICE_NOT_AUTHORIZED`.
- **Perceptual Hash Duplicate Auditing**: 64-bit hexadecimal pHash comparison against cross-project repositories.

### Phase 2 APIs
- `GET /api/v1/inspections`: Query field inspections with status and inspector filters.
- `POST /api/v1/inspections`: Assign new statutory inspection with configurable radius (50m, 100m, 250m).
- `GET /api/v1/inspections/{id}`: Detailed inspection record and audit trail.
- `POST /api/v1/inspections/{id}/start`: Start inspector on-site session.
- `POST /api/v1/inspections/{id}/location`: Validate inspector GPS against sanctioned site using geodesic Haversine distance.
- `POST /api/v1/inspections/{id}/evidence`: Upload live geotagged photograph with TPM digest and pHash.
- `POST /api/v1/inspections/{id}/submit`: Submit inspection for automated multi-signal verification.
- `POST /api/v1/inspections/{id}/review`: Record authorized investigator decision (`VERIFIED`, `PARTIALLY_VERIFIED`, `EVIDENCE_CONFLICT_CONFIRMED`, `REQUEST_REINSPECTION`).
- `POST /api/v1/inspections/{id}/reinspect`: Request immutable child re-inspection.

---

## Phase 3 — Multi-Scheme Cross-Verification Subsystem

> [!IMPORTANT]
> **Core Principle**: Cross-scheme matches are **investigative signals**, not determinations of wrongdoing.
> - **Strict 3-Way Independence**: Risk Score (0–100), Verification Confidence (0–100), and Cross-Scheme Similarity Score (0–100) are decoupled independent metrics.
> - **Zero Penalty Rule**: Missing photographs or absent physical footprints receive `0.0` penalty.
> - **Asset Lifecycle Distinction**: Distinguishes legitimate phased work on the same public asset (`SAME_ASSET_DIFFERENT_WORK`) from potential concurrent duplicates (`SAME_ASSET_POTENTIAL_DUPLICATE`) or co-located independent infrastructure (`INDEPENDENT_ADJACENT_ASSETS`).

### Multi-Scheme Architecture
```
RAW SCHEME DATA (MPLADS, MGNREGA, PMGSY, PMAY, JJM)
       ↓
SCHEME ADAPTER NORMALIZATION (MpladsAdapter, MgnregaAdapter, PmgsyAdapter)
       ↓
CANDIDATE PAIR GENERATION (Geographic Bounding Box & Category-Aware Spatial Blocking)
       ↓
MULTI-SIGNAL CROSS-SCHEME MATCH ENGINE:
  ├── 1. Geographic Proximity (Haversine category-aware: 100m–500m)
  ├── 2. Physical Footprint & Geometry Overlap
  ├── 3. Title & Description Token Jaccard Similarity
  ├── 4. Standardized Category Taxonomy Alignment
  ├── 5. 64-bit Perceptual Hash (pHash) Image Fingerprint Comparison
  ├── 6. Temporal Execution Lifecycle & Overlap Analysis
  ├── 7. Entity Normalization (Contractors & Implementing Agencies)
  └── 8. Sentinel-2 Satellite & Phase 2 Field Evidence Cross-Check
       ↓
EXPLAINABLE CROSS-SCHEME SIMILARITY SCORE (0–100) & PRIORITY (LOW, MEDIUM, HIGH, URGENT)
       ↓
INTERACTIVE INVESTIGATION UI (/cross-scheme/[matchId]) & HUMAN AUDIT DECISION
       ↓
DISPATCH FIELD RE-INSPECTION (Phase 2 Link) OR TRIGGER SENTINEL-2 (Phase 1 Link)
```

### Phase 3 APIs
- `GET /api/v1/cross-scheme/projects`: Normalized project claims across schemes.
- `GET /api/v1/cross-scheme/matches`: Evaluated match pairs with filterable thresholds.
- `GET /api/v1/cross-scheme/matches/{match_id}`: Full explainable signal breakdown.
- `POST /api/v1/cross-scheme/analyze`: On-demand multi-scheme scan for target works.
- `POST /api/v1/cross-scheme/{match_id}/review`: Record official human decision (`CONFIRMED_SHARED_ASSET`, `CONFIRMED_SEPARATE_ASSETS`, `NEEDS_FIELD_INSPECTION`, `FALSE_MATCH`) with optional Phase 2 inspection dispatch.
- `GET /api/v1/cross-scheme/analytics`: Aggregated scheme pair distributions, categories, and geographic hotspots.

## Production Deployment Guide (Vercel & Render)

### 1. Backend Deployment (Render / Railway / Docker)
- Deploy Python FastAPI app from `backend/Dockerfile` or `render.yaml`.
- Set Environment Variables:
  - `ENVIRONMENT=production`
  - `CORS_ORIGINS=https://pratyaksh-mplads.vercel.app`
  - `DATABASE_URL=postgresql://user:pass@host:5432/pratyaksh_db`
- Public FastAPI Swagger Docs available at `https://pratyaksh-backend.onrender.com/docs`.

### 2. Frontend Deployment (Vercel)
- Root Directory: `risklens` (or `frontend`)
- Build Command: `npm run build`
- Output Directory: `.next` (or `dist`)

---

## Local Offline Pitch Presentation Setup Guide

In case of internet failure at the venue, the entire stack runs 100% locally on a laptop without internet dependency.

### Step 1: Start Backend Server
```bash
cd backend
../venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Step 2: Start RiskLens Next.js Dev Server
```bash
cd risklens
npm run dev
```

### Step 3: Run Full-Suite Test Verification
```bash
cd risklens
npx tsx test-engine.ts
```

---

## Provenance & Neutral Vocabulary Guarantees
- **Risk Score ≠ Verification Confidence**: Both metrics are calculated and rendered independently.
- **Neutral Terminology**: Zero usage of forbidden words (`fraud`, `corrupt`, `bribery`, `criminal`, `guilty`). Uses `high-risk`, `potential anomaly`, `requires verification`, `evidence conflict`.
- **Missing Evidence Rule**: Missing evidence (`— UNAVAILABLE`) does not penalize scores.
- **Data Provenance**: Every entity records `source`, `source_type`, `retrieved_at`, and `is_synthetic`.
