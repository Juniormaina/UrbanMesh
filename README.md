# UrbanMesh

**Crowdsourced walkability & safety intelligence for Kilimani — feeding Nairobi County’s Local Physical Development Plan (LPDP).**

Kilimani Urban Hackathon 2026 · Urban Mobility track · Team UrbanMesh

Residents report mobility and infrastructure hazards in real time. When enough nearby reports agree, the platform auto-verifies a spatial cluster, paints a live Walkability & Safety Heatmap, and compiles an LPDP policy brief for county planners.

---

## Why it exists

Kilimani’s streets carry recurring hazards — unlit corridors, broken sidewalks, open sewers, drainage failures, surface damage, and illegal dumping — that rarely reach planners as structured evidence. UrbanMesh closes that gap:

1. **Citizens** pin hazards from a mobile-first PWA  
2. **PostGIS + H3** cluster same-category reports within 15 m  
3. **County dashboards** turn verified clusters into ward-level metrics and an exportable LPDP PDF  

Pilot corridors (see [`roadmap.md`](./roadmap.md)): **Argwings Kodhek Road** and the **Kirichwa Kubwa** river corridor.

Living snapshot of what the code does today: **[`STATUS.md`](./STATUS.md)** (hackathon MVP — demo-ready, not a street pilot).

---

## Three workflows

| Discipline | Surface | What it does |
| --- | --- | --- |
| **Civic design & front-end** | `apps/web` | Citizen PWA — GPS report form + live heatmap |
| **Geospatial & spatial planning** | `apps/api` + PostGIS / H3 | Geometry ingest, 15 m clustering, verified spatial clusters |
| **Data systems & policy automation** | `apps/dashboard` + LPDP PDF | Ward metrics (Recharts) + Puppeteer A4 policy brief |

---

## Architecture

```text
Citizen PWA (:5173)  ──┐
County Dashboard (:5174) ──┼──► Express API (:3001)
                           │         │
                           │         ├── Prisma → PostgreSQL + PostGIS
                           │         ├── H3 cell indexes (res 10)
                           │         └── Puppeteer → LPDP PDF
                           │
                    storage/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf
```

### Monorepo layout

```text
UrbanMesh/
├── apps/
│   ├── web/                 # Citizen PWA (React, Vite, Leaflet, Tailwind)
│   ├── dashboard/           # County planner console (React, Recharts)
│   └── api/                 # Express + Prisma + PostGIS + Puppeteer
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts      # 50+ Kilimani corridor seed points
│       ├── scripts/
│       │   └── generate-lpdp.ts
│       ├── src/
│       │   ├── modules/hazards/     # Report ingest + clustering
│       │   ├── modules/dashboard/   # Ward / category metrics
│       │   └── modules/reports/     # LPDP HTML → PDF
│       └── storage/lpdp/            # Generated policy briefs
├── STATUS.md                # What is shipped / stubbed / missing
├── roadmap.md               # 90-day pilot plan
└── README.md
```

---

## Tech stack

| Layer | Choices |
| --- | --- |
| Citizen / dashboard UI | React 19, Vite, TypeScript, Tailwind CSS |
| Maps | Leaflet, react-leaflet, leaflet.heat |
| Charts | Recharts |
| Spatial index | Uber H3 (`h3-js`, resolution 10) |
| API | Node.js, Express, TypeScript |
| ORM / DB | Prisma, PostgreSQL, PostGIS |
| Documents | Puppeteer (HTML → A4 PDF) |

---

## Hazard categories

| Enum | Plain-language label |
| --- | --- |
| `MOBILITY_SURFACE_DAMAGE` | Pothole / Broken Road Surface |
| `NMT_PEDESTRIAN_HAZARD` | Blocked Walkway / Pedestrian Barrier |
| `DRAINAGE_STORMWATER` | Flooding / Clogged Drain |
| `SEWER_SANITATION` | Open Manhole / Sewer Leak |
| `LIGHTING_SECURITY` | Unlit Street / Broken Light |
| `ILLEGAL_WASTE_DUMP` | Illegal Dumping / Waste Pile |

---

## Crowdsource verification

On every `POST /api/v1/reports`:

1. Store the report as a PostGIS `geometry(Point, 4326)`  
2. Find same-category incidents within **15 metres** (`ST_DWithin` on geography)  
3. If **≥ 3** reports match → set `is_verified = true` and assign a shared `cluster_id` (anchor = new report id)  
4. Response status is either:
   - `"Verified Cluster Created"`
   - `"Incident Logged - Pending Verification"`

Seed data intentionally includes full clusters (A–D) and near-miss pairs (E–F) so demos can show both verified heat and a live third report flipping verification.

---

## Prerequisites

- **Node.js** 20+  
- **PostgreSQL** 14+ with the **PostGIS** extension  
- Chromium deps for Puppeteer (LPDP PDF generation)

---

## Quick start

### 1. Database

```bash
# Enable PostGIS in your database
psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS postgis;'
```

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/urbanmesh?schema=public"
PORT=3001
```

### 2. API

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init   # or apply your first migration
npm run db:seed                      # 53 Kilimani historical points
npm run dev                          # http://localhost:3001
```

### 3. Citizen PWA

```bash
cd apps/web
npm install
npm run dev                          # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:3001`.

### 4. County dashboard

```bash
cd apps/dashboard
npm install
npm run dev                          # http://localhost:5174
```

Optional: set `VITE_API_BASE` in either frontend if the API is not on the Vite proxy host.

---

## API reference

Base URL: `http://localhost:3001`

### Reports

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/reports` | Ingest geotagged hazard report + run clustering |
| `GET` | `/api/v1/reports` | All reports (filter `status`, `category`, `limit`) |
| `GET` | `/api/v1/reports/nearby` | Reports near `lat` / `lng` (`radius` metres) |
| `GET` | `/api/v1/reports/verified` | Verified incidents for the heatmap |
| `GET` | `/api/v1/reports/:id` | Evidence pack: report, nearby, cluster members |
| `POST` | `/api/v1/reports/:id/confirm` | “I’m seeing this too” — new nearby confirmation |
| `POST` | `/api/v1/uploads/photos` | Store a citizen photo (`{ data: data-url }`) |

**POST body**

```json
{
  "category": "SEWER_SANITATION",
  "description": "Open manhole near Argwings pedestrian crossing",
  "lat": -1.2972,
  "lng": 36.7825,
  "h3_index": "8a2a1072b59ffff",
  "photo_url": null
}
```

**POST response (example)**

```json
{
  "status": "Verified Cluster Created",
  "incident_id": "…",
  "cluster_id": "…",
  "is_verified": true,
  "nearby_count": 3
}
```

### Dashboard

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/dashboard/metrics` | Totals, clusters, corridors, category, ward, trend |
| `GET` | `/api/v1/clusters` | Verified spatial clusters with first/latest timestamps |
| `GET` | `/api/v1/meta` | Thresholds, corridors, ward boxes |
| `GET` | `/health` | Liveness |

### LPDP policy brief

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/lpdp/generate` | Compile verified clusters → A4 PDF (`cluster_ids` optional) |
| `GET` | `/api/v1/lpdp/latest.pdf` | Download latest brief |
| `GET` | `/api/v1/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf` | Stable filename download |
| `GET` | `/api/v1/lpdp/info` | Path + URL metadata |

**On-disk path (from `apps/api`):**

```text
storage/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf
```

**CLI**

```bash
cd apps/api
npm run generate:lpdp
```

Each PDF cluster entry includes hazard category, coordinates, planning area, report count, and verification status **“3+ Confirmed Citizen Reports”**.

---

## Seed data (demo)

```bash
cd apps/api && npm run db:seed
```

Populates **53** realistic points along Argwings Kodhek, Dennis Pritt, Ngong Road, and Kirichwa Kubwa via raw PostGIS SQL (`$executeRaw`).

| Tag | Behaviour |
| --- | --- |
| Clusters A–D | ≥3 same-category points within ~15 m → auto-verified on seed |
| Near-miss E–F | Exactly 2 reports — submit one more nearby from the PWA to fire live verification |

---

## Demo script (hackathon)

1. Start API + seed + citizen web  
2. Open the **Walkability & Safety Heatmap** — verified clusters A–D should glow  
3. On Argwings mid-corridor, report **Blocked Walkway / Pedestrian Barrier** near the near-miss pair → expect **Verified Cluster Created**  
4. Open the county dashboard → ward bars, category counts, verification pie, trend  
5. Click **Generate LPDP PDF** → **Download brief**

---

## Environment variables

Templates: [`.env.example`](./.env.example) · [`apps/api/.env.example`](./apps/api/.env.example) · [`apps/web/.env.example`](./apps/web/.env.example) · [`apps/dashboard/.env.example`](./apps/dashboard/.env.example)

| Variable | App | Description |
| --- | --- | --- |
| `DATABASE_URL` | API | Postgres connection string (PostGIS required) |
| `PORT` | API | Defaults to `3001` |
| `CLUSTER_RADIUS_METERS` | API | Auto-verify radius (default `15`; **wired**; tune in roadmap Wk 6) |
| `CLUSTER_THRESHOLD` | API | Reports needed to verify (default `3`; **wired**) |
| `PHOTO_STORAGE_PATH` | API | Photo upload directory — **wired** via `POST /api/v1/uploads/photos` |
| `RATE_LIMIT_*` | API | Reserved for Phase 1 spam protection — **not wired yet** |
| `LPDP_STORAGE_DIR` | API | Documented output dir; generator currently writes `./storage/lpdp` |
| `CORS_ORIGINS` | API | Allowed PWA + dashboard origins — **applied** |
| `VITE_API_BASE` | web / dashboard | Optional absolute API origin; empty = Vite proxy |
| `VITE_H3_RESOLUTION` | web | Client H3 resolution (default `10`) |

---

## 90-day pilot

The path from hackathon MVP to a supervised street pilot (KCF hosting, reporter cohort, county LPDP desk) is documented in:

- **[`STATUS.md`](./STATUS.md)** — what is live, stubbed, or missing right now  
- **[`roadmap.md`](./roadmap.md)** — Foundation (days 1–30) → Community pilot (31–60) → Validate & handover (61–90)

---

## Team alignment

| Role | Owns |
| --- | --- |
| Civic design & front-end | PWA UX, reporter orientation, public feedback loop |
| Geospatial & spatial planning | PostGIS, H3, clustering thresholds, taxonomy |
| Data systems & policy automation | Dashboard metrics, LPDP PDF pipeline, runbooks |

---

## Licence & attribution

Hackathon prototype for the **Kilimani Urban Hackathon 2026**. Built for community evidence and county planning workflows — not a statutory plan amendment by itself.

UrbanMesh · Nairobi · Kilimani
