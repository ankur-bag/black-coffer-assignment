# Blackcoffer Global Insights & Strategic Analytics Dashboard

A production-grade full-stack analytics dashboard visualizing global trends, geopolitical events, economic indicators, and energy telemetry from the Blackcoffer dataset.

---

##  Architecture Overview

- **Backend**: Node.js, Express 5, Mongoose 9, MongoDB Atlas.
- **Frontend**: Next.js 16 (App Router), React 19, Chart.js, React-ChartJS-2, D3.js (v7), Tailwind CSS v4.
- **Design System**: Strict design tokens defined in `globals.css` and `lib/chartColors.js` (Sapphire Blue `#2563eb` accent, Slate-50 canvas `#f8fafc`, authoritative typographic hierarchy, and responsive grid layout).
- **Proxy Architecture**: Configurable Next.js dev proxy rewrite (`/api/:path*` -> `http://localhost:5000/api/:path*`) eliminating CORS issues in development.

---

##  Visualizations

1. **Executive KPI Cards** (`components/KpiCards.tsx`): Real-time metrics for Matched Insights, Avg Intensity, Avg Likelihood, and Avg Relevance.
2. **Intensity by Sector** (`components/SectorBarChart.tsx`): Horizontal bar chart of the Top 15 sectors sorted by severity, with click-to-filter drill-down and the `Unspecified` bucket visually differentiated in neutral slate.
3. **Geographic Distribution** (`components/RegionDonutChart.tsx`): Doughnut chart of the Top 10 regions by record volume with click-to-filter drill-down and a consolidated "Other" slice.
4. **Temporal Trajectory** (`components/YearLineChart.tsx`): Dual-series line chart tracking Avg Likelihood and Avg Relevance over chronological years.
5. **High-Frequency Strategic Topics** (`components/TopTopicsChart.tsx`): Top 10 recurring themes across insights.
6. **Strategic Multi-Metric Landscape** (`components/BubbleChart.tsx`): Bespoke D3.js 4-variable visualization mapping Likelihood (X-axis) vs Intensity (Y-axis) vs Relevance (Bubble Area via `scaleSqrt`) vs Sector (Color).
7. **Active Filter Chips** (`components/ActiveFilterChips.tsx`): Real-time dismissible tags with individual remove buttons and full reset synchronization.

---

##  Known Limitations & Data Hygiene Decisions

1. **Missing Score Coordinates in D3 Bubble Chart**:
   - In the source dataset (`jsondata.json`), ~38 records (3.8%) have blank or missing values for `intensity` and `likelihood`.
   - In Mongoose ingestion, these are coerced to `0` to prevent cast errors and preserve total record count (1,000 records).
   - **Exclusion**: These ~38 records are excluded specifically from the D3 bubble chart coordinate space (`intensity > 0`, `likelihood > 0`, `relevance > 0`). Plotting a coerced `0` at the `(0, 0)` origin would misrepresent missing data as a genuine minimum score. They continue to be fully counted across all other aggregations and KPI calculations.

2. **Unclassified Category Bucketing (`"Unspecified"`)**:
   - **Sector**: 229 records (22.9%) have an empty sector. Rather than dropping them silently, sector aggregations explicitly bucket them as `"Unspecified"` (average intensity: 10.03).
   - **Region**: 453 records (45.3%) lack a geographical region (all of which also lack a country). These represent macro-technology and general industry trends and are bucketed as `"Unspecified"`.
   - **Topic**: 93 records lack a specific topic tag and are bucketed as `"Unspecified"`.
   - In the filter controls (`/api/insights/filters`), empty strings remain filtered out so dropdown menus only present valid, selectable categories.

3. **Casing & Whitespace Deduplication**:
   - In the source data, `"World"` (131 records) and `"world"` (1 record) represented the identical real-world entity. During database seeding, all case variants were normalized to the canonical `"World"`.
   - Trailing whitespace across 16 source records (e.g. `"Atlantic Council "`, `"CNBC "`, `"UNESCO "`) was trimmed, consolidating duplicates.

---

##  Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Ingests and normalizes 1000 records into MongoDB
node server.js   # Starts backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Next.js dashboard on http://localhost:3000
```
