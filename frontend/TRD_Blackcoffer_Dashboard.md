# Technical Requirements Document (TRD)
## Blackcoffer Data Visualization Dashboard

**Companion to:** PRD_Blackcoffer_Dashboard.md
**Purpose:** Implementation spec detailed enough to hand to an agentic coding tool (e.g. Antigravity)
and get a working build with minimal back-and-forth.

---

## 1. Stack

| Layer | Choice | Rationale |
|---|---|---|
| Database | MongoDB (local or Atlas free tier) | Source data is a flat JSON array of documents — no relational modeling needed |
| Backend | Node.js + Express + Mongoose | Fast to scaffold, native JSON handling, one language across the stack |
| Frontend | Vanilla HTML/CSS/JS (no build step) using Chart.js + D3.js | Assignment explicitly allows this; avoids build tooling overhead so the grader can run it instantly |
| Charts | Chart.js (bar/line/pie/doughnut), D3.js (bubble/scatter) | Chart.js for standard charts = fast + clean defaults; D3 for the one bespoke visual (intensity/likelihood/relevance bubble chart), satisfying the "D3 highly recommended" note |
| Hosting (local) | Express serves both `/api/*` and the static `frontend/` folder | Single process, single port, simplest possible run instructions |

If the build agent prefers React/Next.js instead of vanilla JS, that is acceptable per the brief —
substitute a component tree for the DOM-manipulation modules in §5 and keep the API contract in §4
unchanged.

## 2. Repository Layout

```
blackcoffer-dashboard/
├── data/
│   └── jsondata.json              # source data, read-only reference copy
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js                  # Express app entrypoint, mounts routes + static frontend
│   ├── db.js                      # mongoose connection helper
│   ├── models/
│   │   └── Insight.js             # Mongoose schema (see §3)
│   ├── routes/
│   │   └── insights.js            # /api/insights, /api/insights/filters, /api/insights/stats
│   └── seed.js                    # one-off script: reads ../data/jsondata.json -> inserts into Mongo
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js                     # fetch calls, filter state, chart rendering
└── README.md
```

## 3. Data Model

Mongo collection: `insights`. Schema (Mongoose) — mirrors the raw JSON 1:1, with numeric fields
coerced to `Number` and all other fields kept as `String` (blank string, not null, when absent in
source):

```js
{
  end_year:    String,  // default ''
  start_year:  String,  // default ''
  added:       String,  // default ''
  published:   String,  // default ''
  intensity:   Number,  // default 0
  likelihood:  Number,  // default 0
  relevance:   Number,  // default 0
  sector:      String,  // default ''
  topic:       String,  // default ''
  insight:     String,  // default ''
  url:         String,  // default ''
  region:      String,  // default ''
  impact:      String,  // default ''
  country:     String,  // default ''
  pestle:      String,  // default ''
  source:      String,  // default ''
  title:       String,  // default ''
  city:        String,  // default '' — not populated in current dataset; keep field for forward-compat
  swot:        String,  // default '' — not present in current dataset; keep field for forward-compat
}
```

Indexes: single-field indexes on `sector`, `region`, `country`, `topic`, `pestle`, `source`,
`end_year` (all fields used as filters, to keep aggregation queries fast even though N=1,000 is
small — this is about establishing correct patterns, not solving a real perf problem at this scale).

### Seed script (`backend/seed.js`) — behavior spec
1. Load `MONGODB_URI` from `.env`.
2. Connect via Mongoose.
3. Read `../data/jsondata.json`.
4. `Insight.deleteMany({})` (idempotent re-seed).
5. `Insight.insertMany(records)`.
6. Log count inserted, exit process.

## 4. API Contract

Base path: `/api/insights`

### 4.1 `GET /api/insights`
Query params (all optional, all string unless noted; repeatable params = OR within a field, all
provided fields = AND across fields):

| Param | Maps to field | Notes |
|---|---|---|
| `end_year` | `end_year` | exact match |
| `topic` | `topic` | exact match, repeatable |
| `sector` | `sector` | exact match, repeatable |
| `region` | `region` | exact match, repeatable |
| `pestle` | `pestle` | exact match, repeatable (this is the "PEST" filter) |
| `source` | `source` | exact match, repeatable |
| `country` | `country` | exact match, repeatable |
| `city` | `city` | exact match — will currently always return empty result set; documented, not hidden |
| `swot` | `swot` | exact match — field does not exist with data in current dataset; documented, not hidden |
| `page` | — | default 1 |
| `limit` | — | default 50, max 500 |

Response `200`:
```json
{
  "total": 123,
  "page": 1,
  "limit": 50,
  "results": [ { "_id": "...", "intensity": 6, "sector": "Energy", "...": "..." } ]
}
```

### 4.2 `GET /api/insights/filters`
No params. Returns distinct, sorted values per filterable field, computed live from the DB so the
frontend never hardcodes options:
```json
{
  "end_year": ["", "2016", "2017", "..."],
  "topic": ["", "coal", "gas", "..."],
  "sector": ["", "Energy", "Government", "..."],
  "region": ["", "Africa", "Asia", "..."],
  "pestle": ["", "Economic", "Political", "..."],
  "source": ["", "EIA", "Foreign Policy", "..."],
  "country": ["", "United States of America", "..."],
  "city": [],
  "swot": []
}
```
`city` and `swot` returning empty arrays is expected and is how the frontend knows to render those
two controls as disabled (§5.3).

### 4.3 `GET /api/insights/stats`
Accepts the same filter query params as §4.1 (no pagination). Returns pre-aggregated shapes for
each chart, computed via Mongo aggregation pipelines:
```json
{
  "matchedCount": 123,
  "avgIntensity": 4.2,
  "avgLikelihood": 2.8,
  "avgRelevance": 2.1,
  "intensityBySector": [ { "sector": "Energy", "avgIntensity": 5.1, "count": 40 } ],
  "countByRegion": [ { "region": "Northern America", "count": 30 } ],
  "metricsByYear": [ { "year": "2017", "avgLikelihood": 3.0, "avgRelevance": 2.0, "count": 12 } ],
  "topTopics": [ { "topic": "gas", "count": 15 } ],
  "bubblePoints": [ { "intensity": 6, "likelihood": 3, "relevance": 2, "sector": "Energy" } ]
}
```
- `metricsByYear`: build `year = end_year || start_year || 'Unspecified'` server-side in the
  aggregation pipeline before grouping.
- `bubblePoints`: cap at 500 points (sample if the filtered set is larger) to keep the D3 render
  smooth.

## 5. Frontend Spec

### 5.1 Layout
- Left/top filter panel (per PRD §6.3) + a top KPI row (4 cards: Total, Avg Intensity, Avg
  Likelihood, Avg Relevance) + a chart grid below (2 columns on desktop, 1 on narrow viewports).

### 5.2 State management (vanilla JS)
- Single `filters` object in `app.js`, e.g. `{ end_year: [], topic: [], sector: [], region: [],
  pestle: [], source: [], country: [] }` (arrays even for single-select controls, to keep the
  serialization to query params uniform).
- `applyFilters()`: serializes `filters` to a query string, calls `/api/insights/stats?...`,
  re-renders KPIs + all charts from the single response. Debounce 200ms on multi-select changes.
- `resetFilters()`: clears `filters`, re-fetches unfiltered stats.

### 5.3 Filter controls
- Populate every `<select>`/multi-select from `/api/insights/filters` on initial load — never
  hardcode option lists in HTML/JS.
- For `city` and `swot`: render the control `disabled`, with a tooltip/label reading "No data
  available in current dataset" (per PRD §5 data caveat). Do not hide them — the assignment brief
  asked for them explicitly, so the honest move is to show they were considered and why they're
  inert.

### 5.4 Charts

| Chart | Library | Data source | Spec |
|---|---|---|---|
| KPI cards | plain DOM | `/stats` root fields | 4 cards, animate value on change |
| Avg Intensity by Sector | Chart.js horizontal bar | `intensityBySector` | sort descending, top 15 |
| Record Share by Region | Chart.js doughnut | `countByRegion` | top 10 + "Other" bucket |
| Likelihood/Relevance by Year | Chart.js line, dual series | `metricsByYear` | x-axis sorted ascending; bucket blank years into a trailing "Unspecified" category rather than dropping them |
| Top Topics | Chart.js horizontal bar | `topTopics` | top 10 |
| Intensity × Likelihood bubble | D3.js | `bubblePoints` | x = likelihood, y = intensity, radius = relevance, color = sector (categorical scale); tooltip on hover shows title-count for that point's bucket |

### 5.5 Interactivity
- Hovering any chart element shows a tooltip with the exact underlying count.
- Clicking a bar/segment adds that value as an additional filter (e.g. clicking the "Energy" bar
  in the sector chart sets `filters.sector = ['Energy']` and re-applies) — this is the
  drill-down called out in PRD FR12.

## 6. Non-Functional / Ops

- `.env` (git-ignored) holds `MONGODB_URI` and `PORT`; `.env.example` checked in.
- CORS enabled on the Express app (`cors` package) since frontend and API share an origin in the
  default setup, but keeping CORS on avoids friction if the frontend is later served separately.
- No auth layer (per PRD Non-Goals).
- Logging: basic request logging via `morgan` or console — no requirement for structured logging
  at this scale.

## 7. Setup / Run Instructions (for README.md)

```bash
# 1. Backend
cd backend
cp .env.example .env        # edit MONGODB_URI if not using local default
npm install
npm run seed                # loads data/jsondata.json into MongoDB
npm start                   # serves API on :5000 and the frontend/ folder

# 2. Open the dashboard
# http://localhost:5000
```

## 8. Acceptance Criteria (maps to PRD §6)

- [ ] `npm run seed` inserts exactly 1,000 documents into the `insights` collection.
- [ ] `GET /api/insights/filters` returns non-empty arrays for every field except `city` and
      `swot`, which return `[]`.
- [ ] Changing any filter control updates KPI cards and all five charts without a full page reload.
- [ ] `city` and `swot` controls render disabled with the "no data available" message.
- [ ] "Reset filters" restores the full unfiltered dataset view.
- [ ] Clicking a chart segment applies the corresponding filter (drill-down).
- [ ] Fresh clone → seed → start → dashboard loads with data in under 2 seconds on localhost.
- [ ] No dataset other than `jsondata.json` is referenced anywhere in the code.

## 9. Suggested Build Order (for an agent executing this spec)

1. Scaffold `backend/` — `package.json`, `db.js`, `models/Insight.js`.
2. Write and run `seed.js` against a local/Atlas MongoDB; verify count.
3. Implement `routes/insights.js` per §4; smoke-test all three endpoints with `curl`.
4. Scaffold `frontend/index.html` + `style.css` static layout (filters panel, KPI row, chart grid
   placeholders) with no data wired up yet.
5. Wire `app.js`: fetch `/filters` → populate controls; fetch `/stats` → render KPIs + Chart.js
   charts.
6. Add the D3 bubble chart last, since it's the most bespoke piece.
7. Add drill-down click handlers and the reset action.
8. Write `README.md` with the exact commands from §7.
9. Manual pass through the Acceptance Criteria checklist in §8.
