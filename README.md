# Pratyaksh (प्रत्यक्ष) — AI-Powered MPLADS Monitoring & Independent Verification Platform

Official submission repository for **SIH 2026** AI-Powered MPLADS (Members of Parliament Local Area Development Scheme) Monitoring.

> [!NOTE]  
> **Core Positioning**: Operates as an **intelligence + independent verification layer ON TOP of eSAKSHI**. It does not replace eSAKSHI or call officials corrupt. It detects, verifies, explains, prioritizes, acts, and learns.

---

## Key Capabilities (Phases 1 to 4 Built & Verified)

1. **Feature 1 — AI Risk Engine**: Explainable, additive component-wise composite Risk Score (0–100) combining statistical Z-score/IQR deviation, SLA timeline delay ratio, March fiscal rush flags, spatial clustering, and Isolation Forest anomaly scores.
2. **Feature 2 — Contextual Peer Comparison**: Cohort benchmarking by Work Category × State × Budget Tier (<5L, 5L-20L, >20L) × Fiscal Year. Includes small sample size protection (`<5` records -> fallback to macro state baseline).
3. **Feature 3 — Duplicate Photo Detection**: Perceptual hashing (`pHash`) & Hamming distance similarity scoring to spot reused completion photos across projects.
4. **Feature 4 — Location-Bound Citizen Verification PWA**: Mobile live camera stream capture (gallery uploads blocked) + server-side Haversine geodesic distance calculation (100m threshold).
5. **Feature 5 — Evidence Triangulation**: Multi-signal `Verification Confidence (0–100)` (strictly decoupled from Risk Score). Signal breakdown states: `✅ SUPPORTS_CLAIM`, `❌ CONTRADICTS_CLAIM`, `🟡 INCONCLUSIVE`, `⚠️ PARTIAL_CONCERN`, `— UNAVAILABLE`.
6. **Feature 6 — Stage-Wise SLA Bottleneck Analyzer**: Identifies stage delays vs benchmark SLA with role-based attribution (e.g. *"District review stage handled by District Planning Officer IDA exceeded expected time by 4.1×"*). Zero naming of individual officials.
7. **Feature 7 — Inspection Resource Optimizer**: Capacity-aware greedy nearest-neighbor route planner ranking inspector visits by composite priority (risk, confidence gap, value, and distance penalty).
8. **Interactive Leaflet Map & Inspection Planner**: Multi-tab React + Tailwind dashboard with spatial route polylines, risk-colored markers, inspector capacity bars, and unified 3-card project intelligence modals.

---

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Leaflet JS, Lucide Icons, Vite
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **Database**: PostgreSQL + PostGIS (Canonical Spatial DDL in `backend/database/schema.sql`)
- **Data & AI Engines**: Pandas, NumPy, Scikit-Learn (Isolation Forest), ImageHash, Geopy
- **Data Provenance**: Ingests eSAKSHI & `data.gov.in` official public exports (30,002 works & 39,002 expenditures indexed)

---

## Quick Start

### 1. Backend Setup
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI Server
cd backend/app
uvicorn main:app --reload --port 8000
```
FastAPI Docs will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
# Install frontend dependencies
cd frontend
npm install

# Run Vite React Dev Server
npm run dev
```
Dashboard will be live at `http://localhost:3000`.

---

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/projects/summary` | Overall dataset statistics & provenance metadata |
| `GET` | `/api/v1/risk` | Paginated, sortable list of evaluated projects with risk scores |
| `GET` | `/api/v1/risk/{project_id}` | Additive risk breakdown, Z-score, and peer group summary |
| `GET` | `/api/v1/verification/photo-similarity/{project_id}` | Perceptual hash photo duplicate check |
| `POST` | `/api/v1/verification/citizen-capture` | Citizen mobile live camera + GPS distance submission |
| `GET` | `/api/v1/verification/confidence/{project_id}` | Triangulated Verification Confidence score (0-100) |
| `GET` | `/api/v1/bottleneck/{project_id}` | Primary workflow bottleneck & 6-stage delay ratio |
| `GET` | `/api/v1/bottleneck/summary` | System-wide aggregate bottleneck breakdown |
| `GET` | `/api/v1/optimizer/plan` | Full capacity-aware inspection routes across all inspectors |

---

## Provenance & Neutral Vocabulary Guarantees
- **Risk Score ≠ Verification Confidence**: Both metrics are calculated and rendered independently.
- **Neutral Terminology**: No usage of forbidden words like `"fraud"`. Uses `high-risk`, `potential anomaly`, `requires verification`, `evidence conflict`.
- **Missing Evidence Rule**: Unconnected/missing evidence (`— UNAVAILABLE`) does not penalize score as if it were a negative contradiction (`❌`).
- **Data Provenance**: Every entity table records `source`, `source_type`, `retrieved_at`, `is_synthetic`.
