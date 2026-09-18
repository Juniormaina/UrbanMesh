# UrbanMesh — Product Status

**Stage:** Hackathon MVP (demo-ready)  
**As of:** 16 September 2026  
**Pilot:** not started — see [`roadmap.md`](./roadmap.md)

UrbanMesh is a working three-app prototype for the Kilimani Urban Hackathon 2026. Citizens can log geotagged hazards, the API can auto-verify nearby same-category reports, and county planners can read ward metrics and export an LPDP PDF. It is **not** ready for unsupervised public reporting.

---

## Verdict

| Question | Answer |
| --- | --- |
| Can we run the hackathon demo end-to-end? | **Yes** — seed + PWA report + heatmap + dashboard + LPDP PDF |
| Can residents use it unsupervised on the street? | **No** — no rate limiting, no photo evidence, no installable PWA, no moderation |
| Can the county treat output as operational evidence? | **Not yet** — seed-backed demo data, approximate ward boxes, no named LPDP desk access |
| What is the next product job? | Harden the reporting path (Phase 1), then put real Kilimani reporters on Argwings Kodhek and Kirichwa Kubwa |

---

## What’s live

Three local surfaces, one API, seed data for the demo script.

| Surface | Port | What works today |
| --- | --- | --- |
| Citizen web (`apps/web`) | `:5173` | Mobile map home, 4-step report flow, reports list, my reports, hazard evidence |
| County dashboard (`apps/dashboard`) | `:5174` | County console: overview, live map, clusters, analytics, LPDP evidence workspace |
| API (`apps/api`) | `:3001` | `POST /reports` ingest + PostGIS clustering, `GET /reports/verified`, `GET /dashboard/metrics`, LPDP generate + download |
| Database | Postgres + PostGIS | `incidents` table, six `HazardCategory` values, `is_verified` / `cluster_id` |
| Seed | `npm run db:seed` | 53 Kilimani points; clusters A–D auto-verify; near-miss pairs E–F wait for a live third report |

**Clustering rule (live):** same category, `ST_DWithin` on geography, default **≥ 3 reports within 15 m**. Radius and threshold are env-configurable (`CLUSTER_RADIUS_METERS`, `CLUSTER_THRESHOLD`).

---

## Capability matrix

| Capability | Status | Notes |
| --- | --- | --- |
| GPS hazard report | **Shipped** | Geolocation required; no map-pin fallback if GPS fails |
| Six-category taxonomy | **Shipped** | Same enums in Prisma, PWA, dashboard, LPDP |
| PostGIS 15 m clustering | **Shipped** | Auto-verify + shared `cluster_id` |
| Client-side H3 index | **Shipped** | `h3-js` at resolution 10 — roadmap Wk 2 is done |
| Verified heatmap | **Shipped** | Leaflet.heat; polls every 60 s; does **not** refresh immediately after submit |
| Ward / category metrics | **Shipped** | In-memory aggregation of all incidents; bbox “wards”, not official polygons |
| LPDP A4 PDF | **Shipped** | Puppeteer HTML → `storage/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf` |
| Kilimani seed + demo script | **Shipped** | Corridors: Argwings Kodhek, Dennis Pritt, Ngong Road, Kirichwa Kubwa |
| Configurable cluster threshold | **Shipped** | Env only — not yet tuned on real density (roadmap Wk 6) |
| Photo upload | **Shipped** | `POST /api/v1/uploads/photos` stores images under `storage/photos`; PWA report flow attaches them |
| CORS | **Shipped** | `CORS_ORIGINS` applied on the API |
| Rate limiting | **Stubbed** | `RATE_LIMIT_*` env exists; no middleware |
| Installable PWA | **Partial** | Web App Manifest present; no service worker yet |
| Auth / planner access control | **Missing** | Open local APIs — anyone can report or generate a PDF |
| Moderation queue | **Missing** | Auto-verify is the only gate; no KCF review surface |
| Health / ops endpoints | **Missing** | No `/health`; no global Express error handler |
| Automated tests | **Missing** | No unit, integration, or clustering tests |
| Official ward polygons | **Missing** | Five hardcoded bounding boxes + “Kilimani Wider Catchment” |

---

## Demo vs pilot

The hackathon script is the product’s current contract:

1. Seed DB → verified clusters A–D glow on the heatmap  
2. Report **Blocked Walkway** near the Argwings near-miss pair → `Verified Cluster Created`  
3. Dashboard shows ward / category / verification / trend  
4. Generate and download the LPDP brief  

That path is complete. The 90-day pilot still needs partners (KCF, county LPDP desk), a reporter cohort, and the Phase 1 hardening items above. Do not treat seed clusters as live citizen evidence.

---

## Product risks (engineering)

These are the gaps that will bite first if the prototype is opened to the public:

| Risk | Why it matters |
| --- | --- |
| Unauthenticated ingest + PDF generation | Spam can inflate “verified” clusters; Puppeteer is expensive to invoke freely |
| Rate-limit config unused | `RATE_LIMIT_*` is documented but not enforced |
| Cluster id re-anchored on every new match | A 4th nearby report overwrites `cluster_id` for the whole group — LPDP cluster identity is unstable |
| H3 stored but unused for clustering | Heatmap / ingest key off lat-lng + PostGIS; H3 is an index, not the verification geometry |
| Heatmap lag after submit | Reporter may not see their newly verified cluster until the 60 s poll |
| Approximate wards | Dashboard “ward” bars are demo geography, not Nairobi County electoral/planning units |

---

## How to update this file

When a row in the capability matrix changes, update **Status** and **Notes** in the same PR, and tick or untick the matching item in [`roadmap.md`](./roadmap.md). Keep this document about **what the code does now**; keep the roadmap about **what the pilot still has to prove**.
