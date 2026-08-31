# Pratyaksh (प्रत्यक्ष) — AI-Powered MPLADS Monitoring & Independent Verification Platform

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
10. **Hero Demo Spotlight (`HERO-MPLADS-2024-001`)**: Anchor project demonstrating all 9 features seamlessly in 30 seconds.
11. **Judge Mobile QR Code Access**: Integrated QR generator enabling judges to test live camera/GPS submission on their personal smartphones over HTTPS.

---

## Production Deployment Guide (Vercel & Render)

### 1. Backend Deployment (Render / Railway / Docker)
- Deploy Python FastAPI app from `backend/Dockerfile` or `render.yaml`.
- Set Environment Variables:
  - `ENVIRONMENT=production`
  - `CORS_ORIGINS=https://pratyaksh-mplads.vercel.app`
  - `DATABASE_URL=postgresql://user:pass@host:5432/pratyaksh_db`
- Public FastAPI Swagger Docs will be available at `https://pratyaksh-backend.onrender.com/docs`.

### 2. Frontend Deployment (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Set Environment Variable:
  - `VITE_API_BASE_URL=https://pratyaksh-backend.onrender.com`
- Native HTTPS URL guarantees live HTML5 browser permissions for mobile camera & location streams.

---

## Local Offline Pitch Presentation Setup Guide

In case of internet failure at the hackathon venue, the entire stack can run 100% locally on a laptop without internet dependency.

### Step 1: Start Backend Server
```bash
# From workspace root
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### Step 2: Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open Offline Pitch View
- Open browser at `http://localhost:3000` (or `http://localhost:5173`).
- Click **Hero Demo Project Spotlight** on the Home Overview Dashboard to present all 9 features live!

---

## Provenance & Neutral Vocabulary Guarantees
- **Risk Score ≠ Verification Confidence**: Both metrics are calculated and rendered independently.
- **Neutral Terminology**: No usage of forbidden words like `"fraud"`. Uses `high-risk`, `potential anomaly`, `requires verification`, `evidence conflict`.
- **Missing Evidence Rule**: Unconnected/missing evidence (`— UNAVAILABLE`) does not penalize score as if it were a negative contradiction (`❌`).
- **Data Provenance**: Every entity table records `source`, `source_type`, `retrieved_at`, `is_synthetic`.
