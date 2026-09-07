# Blackcoffer Global Insights & Strategic Analytics Dashboard

A production-grade full-stack analytics dashboard visualizing global trends, geopolitical events, economic indicators, and energy telemetry from the Blackcoffer dataset. The platform pairs a robust MongoDB/Express aggregation backend with a responsive Next.js and TypeScript frontend, delivering interactive multi-metric intelligence through Chart.js and D3.js.

---

## Live Deployment

- **Frontend (Vercel)**: [https://black-coffer-ankur.vercel.app](https://black-coffer-ankur.vercel.app)
- **Backend API (Render)**: [https://black-coffer-assignment.onrender.com](https://black-coffer-assignment.onrender.com)
- **API Health Check**: [https://black-coffer-assignment.onrender.com/](https://black-coffer-assignment.onrender.com/)

## Features

- **Interactive 9-Dimension Filtering**: Filter across End Year, Topic, Sector, Region, PESTLE, Source, Country, City, and SWOT.
- **5 Synchronized Visualizations**:
  - **Executive KPI Cards**: Real-time metrics for Matched Insights, Avg Intensity, Avg Likelihood, and Avg Relevance.
  - **Intensity by Sector**: Horizontal bar chart of top sectors sorted by severity with click-to-filter drill-down.
  - **Geographic Distribution**: Donut chart of top regions by insight volume with consolidated "Other" tail and click-to-filter drill-down.
  - **Temporal Trajectory**: Dual-series line chart tracking likelihood and relevance trends over publication years.
  - **High-Frequency Topics**: Ranked frequency chart of top recurring strategic themes.
  - **Strategic Multi-Metric Landscape (D3.js)**: Custom D3.js visualization mapping Likelihood (X-axis) vs. Intensity (Y-axis) vs. Relevance (Bubble Radius) vs. Sector (Color).
- **Click-to-Filter Drill-Down**: Click sector bars or region donut slices to immediately filter the dashboard down to that segment.
- **Active Filter Chips**: Live badges displaying all active filter constraints with one-click individual dismiss (`×`) and bulk "Reset Filters" / "Clear all".
- **Strict End-to-End TypeScript**: Zero `any` workarounds, shared domain and payload types across all components, hooks, and API clients.

---

## Tech Stack

- **Backend**: Node.js, Express 5, Mongoose 9, MongoDB Atlas
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Visualizations**: Chart.js 4, React-ChartJS-2, D3.js v7 (`@types/d3`)
- **Styling**: Tailwind CSS v4, custom CSS design tokens (`globals.css`, `chartColors.ts`)

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- Access to a MongoDB instance (MongoDB Atlas cluster or local MongoDB)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and supply your MONGODB_URI (e.g., mongodb+srv://<user>:<password>@cluster.mongodb.net/blackcoffer)

# Seed and normalize the database (ingests and cleans 1,000 records from data/jsondata.json)
npm run seed

# Start backend server (runs on http://localhost:5000)
npm run dev
# Or alternatively: node server.js
```

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

### 4. Environment & API Configuration
- **Backend Port**: `http://localhost:5000`
- **Frontend Port**: `http://localhost:3000`
- **API URL Configuration**: The frontend communicates directly with the Express API using `NEXT_PUBLIC_API_URL`:
  - **Local Development**: Configured in `frontend/.env.local` as `NEXT_PUBLIC_API_URL=http://localhost:5000` (defaults to `http://localhost:5000` if omitted).
  - **Production (Vercel)**: Configured via Vercel Environment Variables as `NEXT_PUBLIC_API_URL=https://black-coffer-assignment.onrender.com`.
  - **CORS**: The backend explicitly allows requests from `http://localhost:3000`, `https://black-coffer-ankur.vercel.app`, and Vercel preview environments (`*.vercel.app`).

---

## API Reference

The backend exposes three REST endpoints under `/api/insights`, all accepting the same filter parameters:

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/insights` | `GET` | `page`, `limit`, and any filter params | Paginated list of raw insight records with total count and page metadata. |
| `/api/insights/filters` | `GET` | *(None)* | Returns distinct available options per schema field for populating filter controls. |
| `/api/insights/stats` | `GET` | Any filter params (repeatable) | Returns aggregated dashboard statistics: `matchedCount`, KPI averages (`avgIntensity`, `avgLikelihood`, `avgRelevance`), and arrays for all 5 charts. |

### Supported Filter Parameters
All endpoints accept the following query parameters (supports multiple values for OR-filtering, e.g. `?sector=Energy&sector=Retail`):
- `end_year` — Filter by conclusion year (e.g. `2018`, `2020`)
- `topic` — Filter by topic (e.g. `oil`, `gas`, `growth`)
- `sector` — Filter by industry sector (e.g. `Energy`, `Financial Services`, `Unspecified`)
- `region` — Filter by geographic region (e.g. `Northern America`, `World`, `Unspecified`)
- `pestle` — Filter by PESTLE category (e.g. `Economic`, `Political`, `Technological`)
- `source` — Filter by intelligence publisher (e.g. `EIA`, `OPEC`, `World Bank`)
- `country` — Filter by country (e.g. `United States of America`, `Russia`)
- `city` — Filter by city
- `swot` — Filter by SWOT category

---

## Known Limitations & Data Hygiene Decisions

1. **Missing Score Coordinates in D3 Bubble Chart**:
   - In the raw source dataset (`jsondata.json`), ~38 records (3.8%) have blank string values for `intensity`, `likelihood`, and/or `relevance`.
   - In Mongoose ingestion, these are defensively coerced to `0` to prevent cast errors and preserve total record count (1,000 records).
   - **Exclusion**: These ~38 records are specifically excluded from the D3 bubble chart coordinate space (`intensity > 0`, `likelihood > 0`, `relevance > 0`). Plotting a coerced `0` at the `(0, 0)` origin would misrepresent missing data as a true minimum score. These records remain fully counted in KPI cards, sector distributions, and all other aggregations.

2. **Unclassified Category Bucketing (`"Unspecified"`)**:
   - **Sector**: 229 records (22.9%) have an empty sector string in the source data. Rather than dropping them silently, backend aggregations bucket them explicitly under `"Unspecified"` (average intensity: 10.03).
   - **Region**: 453 records (45.3%) lack a geographical region (all of which also lack a country). These represent macro-global or cross-regional trends and are bucketed as `"Unspecified"`.
   - **Topic**: 93 records lack a specific topic tag and are bucketed as `"Unspecified"`.
   - In the filter dropdown options (`/api/insights/filters`), empty strings are filtered out so menus only present valid named categories.

3. **Casing & Whitespace Deduplication**:
   - In the raw dataset, `"World"` (131 records) and `"world"` (1 record) represented the identical geographic entity. The seed pipeline normalizes all casing variants to canonical `"World"`.
   - Trailing whitespace across 16 source records (e.g. `"Atlantic Council "`, `"CNBC "`, `"UNESCO "`) was trimmed, consolidating duplicate filter options and chart slices.

4. **Empty Dimensions in Source Data (City & SWOT)**:
   - The assignment brief specifies City and SWOT among the required filter dimensions. Both fields are fully supported by the database schema, query parser, and UI dropdowns.
   - However, in the provided `jsondata.json` dataset, 100% of records have blank values for `city` and `swot`. The UI dropdowns gracefully indicate that no options are available in this dataset.

5. **Synthetic `"Unspecified"` Filter Caveat**:
   - The string `"Unspecified"` is an application-level synthetic label generated by aggregation pipelines to represent unclassified records (blank string `""` or `null`).
   - The query parsing layer (`buildMongoFilter`) explicitly translates `"Unspecified"` input filters to `{ $in: ['', null] }` so that clicking unclassified chart segments drills down into those records.
   - *Extensibility Caveat*: If a different dataset is ingested that features a literal, verbatim category named `"Unspecified"`, this query translation would treat it as a request for blank records.
