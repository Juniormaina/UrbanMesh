# UrbanMesh — 90-Day Pilot Roadmap

**Kilimani Urban Hackathon 2026 · Team UrbanMesh**

*From hackathon prototype to a working pilot on Kilimani’s streets*

---

## Pilot overview

This plan turns the hackathon MVP into a supervised, real-world pilot across two of Kilimani’s most heavily reported corridors:

| Corridor | Focus |
| --- | --- |
| **Argwings Kodhek Road** | Mobility & surface damage |
| **Kirichwa Kubwa river corridor** | Sewer, sanitation & environmental hazards |

These corridors already anchor the seed data and demo flow built during the hackathon, giving Day 1 of the pilot a running start rather than a cold launch.

The pilot is organized into **three 30-day phases**, each with a single owning question:

| Phase | Days | Owning question |
| --- | --- | --- |
| **Foundation** | 1–30 | Is the platform ready for real residents to use unsupervised? |
| **Community pilot** | 31–60 | Does real usage produce verifiable, useful evidence? |
| **Validate & handover** | 61–90 | Is the evidence good enough to hand to a permanent operator? |

---

## Phase 1 · Days 1–30 — Foundation

**Goal:** Harden the MVP, lock in institutional partners, recruit the first reporters.

| Window | Workstream | Owner |
| --- | --- | --- |
| Wk 1 | Confirm **KCF** as the platform’s long-term community host; agree moderation responsibilities and a point of contact for verified-cluster review. | Team lead + KCF |
| Wk 1–2 | Harden the reporting API and clustering service from hackathon-grade to pilot-grade: input validation, photo upload storage, error handling, and basic rate-limiting against spam reports. | Backend / spatial tech |
| Wk 2 | Replace the hard-coded demo H3 index in the PWA with live client-side H3 calculation (`turf.js` or `h3-js`), so real GPS coordinates resolve to real spatial cells. | Frontend |
| Wk 2–3 | Recruit a first cohort of **15–20 community reporters** along the two pilot corridors, drawing on KCF’s existing resident network from the 2023/24 and 2025 assessments. | KCF + civic design |
| Wk 3 | Run a short reporter orientation (how to categorize a hazard, what “verified” means, data-privacy basics) — in person or via WhatsApp voice notes for accessibility. | Civic design |
| Wk 4 | Dry-run the full pipeline end-to-end with the recruited cohort in a controlled window; fix whatever breaks before opening reporting more broadly. | Full team |

### Phase 1 exit criteria

- [ ] KCF hosting agreement in writing
- [ ] 15+ onboarded reporters
- [ ] End-to-end dry run completed with **zero data-loss incidents**

---

## Phase 2 · Days 31–60 — Community pilot

**Goal:** Real residents reporting real hazards, with the platform proving it can tell the difference between noise and a genuine cluster.

| Window | Workstream | Owner |
| --- | --- | --- |
| Wk 5–6 | Open live reporting to the full cohort on both corridors; monitor submission volume and clustering behaviour daily. | KCF (moderation) |
| Wk 6 | Tune the **15-metre / 3-report** auto-verification threshold against real density — wider corridors may need a larger radius, denser ones a stricter report count. | Spatial tech |
| Wk 7 | Expand reporting beyond the recruited cohort to the general public via a QR code at **Kiota School** and KCF community touchpoints. | Civic design |
| Wk 7–8 | Stand up the county-facing dashboard with live ward-level metrics; share read-only access with a named contact in the LPDP planning desk. | Data systems |
| Wk 8 | Generate the first live **LPDP Policy Report PDF** from real pilot data and walk the county contact through it directly. | Data systems + team lead |

### Phase 2 exit criteria

- [ ] Minimum of **50 verified (clustered) reports** across both corridors
- [ ] One LPDP Policy Report reviewed by an actual county contact
- [ ] Clustering threshold tuned and documented

---

## Phase 3 · Days 61–90 — Validate & handover

**Goal:** Confirm the evidence holds up, and formally transfer ownership to whoever runs the platform after the pilot ends.

| Window | Workstream | Owner |
| --- | --- | --- |
| Wk 9 | Joint review session with KCF and the county contact: does the verified-cluster data match what KCF’s own 2025 assessment already found? Where does it disagree, and why? | Full team + KCF + County |
| Wk 9–10 | Adjust the hazard taxonomy based on what residents actually reported (e.g. if a category is unused or a new pattern emerges outside the six original categories). | Spatial tech + data systems |
| Wk 10–11 | Write the **operations runbook**: how to moderate reports, how to regenerate the LPDP PDF, how to add a new corridor. | Full team |
| Wk 11 | Formal handover session with the long-term operator (KCF), including the 1-page handover note, repository access, and the architecture diagram. | Team lead |
| Wk 12 | Publish a short public pilot summary back to the Kilimani community that reported the hazards in the first place — closing the feedback loop. | Civic design + KCF |

### Phase 3 exit criteria

- [ ] Operations runbook complete
- [ ] Handover session held with KCF
- [ ] Pilot summary shared publicly

---

## Key risks

| Risk | Mitigation |
| --- | --- |
| Low reporter turnout outside the recruited cohort | Lean on KCF’s existing community channels and Kiota School as a physical touchpoint rather than relying on organic PWA discovery alone. |
| False or duplicate reports gaming the 3-report auto-verify threshold | Keep KCF moderation in the loop for Phase 1–2; treat auto-verification as a priority signal, not an unreviewed publish. |
| County contact turnover or disengagement | Secure a named LPDP desk contact **in writing during Phase 1**, not just a general county email. |
| Clustering threshold miscalibrated for corridor density | Built-in tuning step in Week 6; keep the radius and report-count **configurable**, not hard-coded. |
| Team availability after the hackathon ends | Handover runbook and KCF ownership are planned from **Phase 1**, not left to Phase 3. |

---

*UrbanMesh · Kilimani Urban Hackathon 2026 · 90-Day Pilot Plan*
