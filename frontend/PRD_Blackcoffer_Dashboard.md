# Product Requirements Document (PRD)
## Blackcoffer Data Visualization Dashboard — Test Assignment

**Owner:** Candidate submission for Blackcoffer Software Engineer (Full-stack) Associate role
**Status:** Draft v1.0
**Timeline:** 8 days (sooner preferred)

---

## 1. Background & Problem Statement

Blackcoffer has provided a dataset (`jsondata.json`, 1,000 records) containing market/industry
insights scraped from various sources. Each record captures a forward-looking statement or
prediction (e.g. "U.S. natural gas consumption is expected to increase...") tagged with metadata
such as sector, topic, region, country, PEST category, source, and scored on three axes:
**intensity**, **likelihood**, and **relevance**.

There is currently no way to explore this data other than reading the raw JSON. The goal is to
build a web dashboard that lets a user slice, filter, and visually explore this dataset to surface
trends and insights.

## 2. Goals

- Turn a flat JSON dataset into a queryable, persistent data store (MongoDB).
- Expose that data through a REST API.
- Provide an interactive, filterable dashboard that visualizes the key variables and helps a
  non-technical user spot patterns (e.g. "which sectors have the highest average intensity",
  "how does likelihood trend by year", "which regions dominate a given topic").
- Demonstrate full-stack competency and product/design judgment as part of a hiring evaluation.

## 3. Non-Goals

- No user authentication/accounts — this is a single-tenant, internal analytics tool.
- No data ingestion pipeline beyond a one-time seed script (dataset is static and provided).
- No editing/writing of records from the UI — read-only analytics.
- Not building a general-purpose BI tool — scope is limited to the fields in the given dataset.

## 4. Target User

A single reviewer/hiring evaluator (and, illustratively, a business analyst persona) who wants to
quickly filter the dataset and see visual summaries without reading raw JSON or writing queries.

## 5. Data Overview

Source: `jsondata.json`, 1,000 records. Key fields and observed cardinality:

| Field | Type | Notes |
|---|---|---|
| `intensity` | number | Score, primary metric |
| `likelihood` | number | Score, primary metric |
| `relevance` | number | Score, primary metric |
| `sector` | string | 19 distinct values (incl. blank) |
| `topic` | string | 98 distinct values (incl. blank) |
| `region` | string | 24 distinct values (incl. blank) |
| `country` | string | 57 distinct values (incl. blank) |
| `pestle` | string | 10 distinct values — this is the "PEST" filter (Political/Economic/Social/Technological + a few extra categories present in the data) |
| `source` | string | 404 distinct values |
| `end_year` / `start_year` | string (numeric-like) | Mostly blank; ~26 distinct non-blank values for end_year |
| `city` | string | **Present in schema but empty for all 1,000 records** |
| `swot` | string | **Not present in this dataset at all** |
| `title`, `insight`, `url`, `impact`, `added`, `published` | string | Supporting/reference text fields |

**Data caveat to call out explicitly in the submission:** the assignment brief asks for City and
SWOT filters, but neither field has any populated values in the supplied dataset. The product
decision is to render these filters in a visibly disabled/"no data" state rather than fabricate
values, so the UI is honest about the data it has.

## 6. Functional Requirements

### 6.1 Data Layer
- FR1: All 1,000 records from `jsondata.json` are loaded into MongoDB via a seed script.
- FR2: Blank string fields are preserved as-is (not dropped), so "unspecified" remains a valid,
  filterable state.

### 6.2 API
- FR3: `GET /api/insights` returns records, supporting query-parameter filters for every field in
  §5, plus pagination.
- FR4: `GET /api/insights/filters` returns the distinct values available for each filterable field,
  so the frontend can populate dropdowns dynamically from live data rather than hardcoding them.
- FR5: `GET /api/insights/stats` returns pre-aggregated data for the dashboard's charts (e.g.
  average intensity by sector, count by region, likelihood by year) so heavy aggregation happens
  server-side, not in the browser.
- FR6: All list/stat endpoints accept the same filter query parameters, so charts update
  consistently with the active filter set.

### 6.3 Dashboard / Frontend
- FR7: Filter bar with controls for: End Year, Topic, Sector, Region, PEST, Source, Country, City,
  SWOT (City/SWOT shown as disabled with a "no data available" hint per §5).
- FR8: Filters are combinable (AND logic) and update all visuals + a summary KPI row in real time.
- FR9: At minimum, the following visualizations:
  1. KPI cards — total records matching filter, avg intensity, avg likelihood, avg relevance.
  2. Bar chart — average intensity by sector.
  3. Line chart — average likelihood/relevance by year (using whichever of start/end year has
     signal — see Open Questions).
  4. Donut/pie chart — record share by region.
  5. Bubble or scatter chart — intensity vs. likelihood, sized/colored by relevance, to expose
     clustering across the three core metrics at once.
  6. Top-N horizontal bar — most frequent topics under the current filter.
- FR10: A "reset filters" action.
- FR11: Responsive layout that works acceptably on a laptop screen; mobile is a nice-to-have,
  not required.
- FR12: Clicking/hovering a chart element shows the underlying count and lets the user optionally
  drill into a filtered list of matching titles.

### 6.4 Non-Functional
- NFR1: Initial dashboard load (data + first paint) under ~2 seconds on localhost.
- NFR2: Code is organized so the grading engineer can read it in minutes (clear folder structure,
  short README, one command to seed + one command to run).
- NFR3: No dataset other than the one provided is used, per the assignment's explicit constraint.

## 7. Success Metrics (for this assignment)

- Dashboard runs end-to-end from a clean checkout following the README (seed → start → open
  browser) with zero manual data massaging.
- All required filters are present and functional or explicitly and visibly marked as unavailable
  due to lack of data.
- Reviewer can answer, within the UI, questions like "which sector has the most high-intensity
  insights about energy" without touching the raw JSON.

## 8. Open Questions

- Should `start_year` or `end_year` drive the year-based chart, given both are mostly blank? →
  Decision: use whichever year field is present for a record (`end_year` if set, else
  `start_year`), and visually flag "year unspecified" records rather than excluding them silently.
- Is Supabase/Postgres acceptable instead of MongoDB? → Brief allows either; MongoDB chosen here
  because the source data is a flat JSON array, which maps directly onto a document store with no
  schema-normalization work needed.

## 9. Deliverables

1. Seeded MongoDB database (or seed script + instructions to reproduce it).
2. REST API (Node.js/Express).
3. Frontend dashboard consuming that API.
4. README with setup steps.
5. Submission via the Google Form with a Google Drive link (per Blackcoffer's instructions — not
   a public GitHub/Bitbucket repo).
