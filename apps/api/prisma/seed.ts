/**
 * UrbanMesh Prisma seed — Kilimani historical hazard points.
 *
 * Corridors: Argwings Kodhek, Dennis Pritt, Ngong Road, Kirichwa Kubwa.
 * Uses $executeRaw so PostGIS geometries are written natively.
 *
 * Intentional same-category clusters within ~15 m:
 *   - Full clusters (≥3) → post-seed verification pass sets is_verified + cluster_id
 *   - Near-miss pairs (2) → left pending so a live PWA report can flip verification
 *
 *   npx prisma db seed
 */
import { randomUUID } from "node:crypto";
import { latLngToCell } from "h3-js";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const H3_RESOLUTION = 10;
/** ~ metres → degrees at Nairobi latitude (good enough for demo offsets). */
const M_TO_DEG = 1 / 111_320;

type HazardCategory =
  | "MOBILITY_SURFACE_DAMAGE"
  | "NMT_PEDESTRIAN_HAZARD"
  | "DRAINAGE_STORMWATER"
  | "SEWER_SANITATION"
  | "LIGHTING_SECURITY"
  | "ILLEGAL_WASTE_DUMP";

interface SeedPoint {
  category: HazardCategory;
  description: string;
  lat: number;
  lng: number;
  /** Days ago — spreads the trend chart. */
  daysAgo: number;
  /** Demo tag for logging. */
  note?: string;
}

/** Offset a base coordinate by metres (north / east). */
function offset(lat: number, lng: number, northM: number, eastM: number) {
  return {
    lat: lat + northM * M_TO_DEG,
    lng: lng + eastM * M_TO_DEG * Math.cos((lat * Math.PI) / 180),
  };
}

// ── Corridor anchors (approx. Kilimani, Nairobi) ───────────────────────────

/** Argwings Kodhek Rd — west → east samples */
const ARGWINGS = [
  { lat: -1.2972, lng: 36.7825 }, // near Yaya
  { lat: -1.2958, lng: 36.7858 },
  { lat: -1.2945, lng: 36.7885 },
  { lat: -1.2932, lng: 36.7912 },
  { lat: -1.2920, lng: 36.7938 }, // toward State House Rd
];

/** Dennis Pritt Rd */
const DENNIS_PRITT = [
  { lat: -1.2915, lng: 36.7860 },
  { lat: -1.2928, lng: 36.7878 },
  { lat: -1.2940, lng: 36.7895 },
  { lat: -1.2952, lng: 36.7910 },
];

/** Ngong Road — Kilimani stretch */
const NGONG = [
  { lat: -1.3015, lng: 36.7810 },
  { lat: -1.3002, lng: 36.7845 },
  { lat: -1.2990, lng: 36.7880 },
  { lat: -1.2978, lng: 36.7915 },
  { lat: -1.2965, lng: 36.7950 },
];

/** Kirichwa Kubwa river corridor (riparian / drainage issues) */
const KIRICHWA = [
  { lat: -1.2968, lng: 36.7795 },
  { lat: -1.2955, lng: 36.7808 },
  { lat: -1.2942, lng: 36.7820 },
  { lat: -1.2928, lng: 36.7835 },
];

function buildSeedPoints(): SeedPoint[] {
  const points: SeedPoint[] = [];

  // ── DEMO CLUSTER A: Open manhole — Argwings @ Yaya (3 pts within ~10 m) ──
  // Auto-verification WILL fire in post-seed pass.
  {
    const base = ARGWINGS[0];
    const a = offset(base.lat, base.lng, 0, 0);
    const b = offset(base.lat, base.lng, 6, 4);
    const c = offset(base.lat, base.lng, -5, 8);
    points.push(
      {
        category: "SEWER_SANITATION",
        description:
          "Open manhole on Argwings Kodhek pedestrian verge near Yaya Centre — no barrier.",
        ...a,
        daysAgo: 12,
        note: "cluster-A-1",
      },
      {
        category: "SEWER_SANITATION",
        description:
          "Sewer cover missing; strong odour. Same Argwings crossing as earlier reports.",
        ...b,
        daysAgo: 9,
        note: "cluster-A-2",
      },
      {
        category: "SEWER_SANITATION",
        description:
          "Third confirmation: open chamber at Argwings / Yaya walkway edge.",
        ...c,
        daysAgo: 4,
        note: "cluster-A-3",
      },
    );
  }

  // ── DEMO CLUSTER B: Unlit stretch — Dennis Pritt (4 pts within ~12 m) ──
  {
    const base = DENNIS_PRITT[1];
    const offsets: Array<[number, number]> = [
      [0, 0],
      [8, -3],
      [-4, 7],
      [5, 9],
    ];
    offsets.forEach(([n, e], i) => {
      const p = offset(base.lat, base.lng, n, e);
      points.push({
        category: "LIGHTING_SECURITY",
        description: `Broken / dead streetlight on Dennis Pritt Rd (report ${i + 1}/4) — dark corridor after 7pm.`,
        ...p,
        daysAgo: 14 - i * 2,
        note: `cluster-B-${i + 1}`,
      });
    });
  }

  // ── DEMO CLUSTER C: Potholes — Ngong Road (3 pts) ──
  {
    const base = NGONG[2];
    for (const [i, [n, e]] of [
      [0, 0],
      [7, 5],
      [-6, 4],
    ].entries()) {
      const p = offset(base.lat, base.lng, n, e);
      points.push({
        category: "MOBILITY_SURFACE_DAMAGE",
        description: `Deep pothole on Ngong Road carriageway near Kilimani (confirmation ${i + 1}).`,
        ...p,
        daysAgo: 18 - i * 3,
        note: `cluster-C-${i + 1}`,
      });
    }
  }

  // ── DEMO CLUSTER D: Dumping — Kirichwa corridor (3 pts) ──
  {
    const base = KIRICHWA[1];
    for (const [i, [n, e]] of [
      [0, 0],
      [4, 6],
      [-7, 3],
    ].entries()) {
      const p = offset(base.lat, base.lng, n, e);
      points.push({
        category: "ILLEGAL_WASTE_DUMP",
        description: `Illegal waste pile along Kirichwa Kubwa riparian buffer (sighting ${i + 1}).`,
        ...p,
        daysAgo: 10 - i,
        note: `cluster-D-${i + 1}`,
      });
    }
  }

  // ── NEAR-MISS PAIRS (2 only) — live demo: one more PWA report → verifies ──
  {
    const base = ARGWINGS[2];
    const a = offset(base.lat, base.lng, 0, 0);
    const b = offset(base.lat, base.lng, 5, -6);
    points.push(
      {
        category: "NMT_PEDESTRIAN_HAZARD",
        description:
          "Scaffolding blocking the Argwings Kodhek sidewalk — pedestrians forced into traffic.",
        ...a,
        daysAgo: 3,
        note: "near-miss-E-1",
      },
      {
        category: "NMT_PEDESTRIAN_HAZARD",
        description:
          "Same Argwings sidewalk blockage confirmed — still no temporary walkway.",
        ...b,
        daysAgo: 1,
        note: "near-miss-E-2",
      },
    );
  }

  {
    const base = NGONG[0];
    const a = offset(base.lat, base.lng, 0, 0);
    const b = offset(base.lat, base.lng, -8, 4);
    points.push(
      {
        category: "DRAINAGE_STORMWATER",
        description:
          "Clogged roadside drain on Ngong Road — standing water after light rain.",
        ...a,
        daysAgo: 6,
        note: "near-miss-F-1",
      },
      {
        category: "DRAINAGE_STORMWATER",
        description:
          "Ngong Road stormwater overflow at same drain inlet — splash hazard for bodas.",
        ...b,
        daysAgo: 2,
        note: "near-miss-F-2",
      },
    );
  }

  // ── Distributed historical points along corridors ───────────────────────

  const argwingsExtras: Array<{
    category: HazardCategory;
    description: string;
    anchor: number;
    north: number;
    east: number;
    daysAgo: number;
  }> = [
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Cracked asphalt shoulder on Argwings Kodhek near office blocks.",
      anchor: 1,
      north: 12,
      east: -20,
      daysAgo: 20,
    },
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "Missing dropped kerb at Argwings zebra crossing.",
      anchor: 1,
      north: -15,
      east: 25,
      daysAgo: 17,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Dark stretch under trees on Argwings Kodhek — lamp out.",
      anchor: 2,
      north: 18,
      east: -12,
      daysAgo: 15,
    },
    {
      category: "DRAINAGE_STORMWATER",
      description: "Flooded pedestrian dip on Argwings after overnight rain.",
      anchor: 3,
      north: -10,
      east: 15,
      daysAgo: 11,
    },
    {
      category: "ILLEGAL_WASTE_DUMP",
      description: "Bagged household waste bags dumped at Argwings lay-by.",
      anchor: 3,
      north: 22,
      east: -8,
      daysAgo: 8,
    },
    {
      category: "SEWER_SANITATION",
      description: "Sewage seep from chamber joint on Argwings Kodhek.",
      anchor: 4,
      north: -18,
      east: 10,
      daysAgo: 7,
    },
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Rutted service lane off Argwings Kodhek.",
      anchor: 4,
      north: 14,
      east: 30,
      daysAgo: 5,
    },
  ];

  for (const e of argwingsExtras) {
    const base = ARGWINGS[e.anchor];
    points.push({
      category: e.category,
      description: e.description,
      ...offset(base.lat, base.lng, e.north, e.east),
      daysAgo: e.daysAgo,
    });
  }

  const dennisExtras: Array<{
    category: HazardCategory;
    description: string;
    anchor: number;
    north: number;
    east: number;
    daysAgo: number;
  }> = [
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "Cars parked on Dennis Pritt sidewalk — no walking path.",
      anchor: 0,
      north: 10,
      east: -18,
      daysAgo: 19,
    },
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Broken paving slabs at Dennis Pritt apartment entrance.",
      anchor: 0,
      north: -20,
      east: 14,
      daysAgo: 16,
    },
    {
      category: "DRAINAGE_STORMWATER",
      description: "Open drain grate missing on Dennis Pritt side channel.",
      anchor: 2,
      north: 16,
      east: 8,
      daysAgo: 13,
    },
    {
      category: "SEWER_SANITATION",
      description: "Manhole cover rattling / displaced on Dennis Pritt.",
      anchor: 2,
      north: -12,
      east: -22,
      daysAgo: 9,
    },
    {
      category: "ILLEGAL_WASTE_DUMP",
      description: "Construction rubble dumped overnight on Dennis Pritt verge.",
      anchor: 3,
      north: 8,
      east: 20,
      daysAgo: 6,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Unlit bend on Dennis Pritt near junction — lamp vandalised.",
      anchor: 3,
      north: -25,
      east: -10,
      daysAgo: 4,
    },
  ];

  for (const e of dennisExtras) {
    const base = DENNIS_PRITT[e.anchor];
    points.push({
      category: e.category,
      description: e.description,
      ...offset(base.lat, base.lng, e.north, e.east),
      daysAgo: e.daysAgo,
    });
  }

  const ngongExtras: Array<{
    category: HazardCategory;
    description: string;
    anchor: number;
    north: number;
    east: number;
    daysAgo: number;
  }> = [
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Lane-edge pothole on Ngong Road slowing matatus.",
      anchor: 1,
      north: 20,
      east: -15,
      daysAgo: 21,
    },
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "No safe crossing island on Ngong Road mid-block.",
      anchor: 1,
      north: -14,
      east: 28,
      daysAgo: 18,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Dark underpass approach lighting out on Ngong Road.",
      anchor: 3,
      north: 11,
      east: -24,
      daysAgo: 14,
    },
    {
      category: "DRAINAGE_STORMWATER",
      description: "Stormwater ponding in Ngong Road bus bay.",
      anchor: 3,
      north: -19,
      east: 12,
      daysAgo: 10,
    },
    {
      category: "SEWER_SANITATION",
      description: "Overflowing sewer manhole beside Ngong Road footpath.",
      anchor: 4,
      north: 7,
      east: -16,
      daysAgo: 7,
    },
    {
      category: "ILLEGAL_WASTE_DUMP",
      description: "Informal dump behind Ngong Road commercial frontage.",
      anchor: 4,
      north: -22,
      east: 18,
      daysAgo: 3,
    },
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Sunken utility trench patch failing on Ngong Road.",
      anchor: 0,
      north: 15,
      east: 22,
      daysAgo: 22,
    },
  ];

  for (const e of ngongExtras) {
    const base = NGONG[e.anchor];
    points.push({
      category: e.category,
      description: e.description,
      ...offset(base.lat, base.lng, e.north, e.east),
      daysAgo: e.daysAgo,
    });
  }

  const kirichwaExtras: Array<{
    category: HazardCategory;
    description: string;
    anchor: number;
    north: number;
    east: number;
    daysAgo: number;
  }> = [
    {
      category: "DRAINAGE_STORMWATER",
      description: "Kirichwa Kubwa overflow onto adjacent access lane after rains.",
      anchor: 0,
      north: 9,
      east: -14,
      daysAgo: 16,
    },
    {
      category: "SEWER_SANITATION",
      description: "Raw effluent discharge suspected near Kirichwa Kubwa bank.",
      anchor: 0,
      north: -11,
      east: 17,
      daysAgo: 13,
    },
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "Informal crossing of Kirichwa with no railing — slip risk.",
      anchor: 2,
      north: 13,
      east: 6,
      daysAgo: 11,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Unlit footpath along Kirichwa Kubwa corridor.",
      anchor: 2,
      north: -17,
      east: -9,
      daysAgo: 8,
    },
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Eroded river-adjacent track used by bodas near Kirichwa.",
      anchor: 3,
      north: 6,
      east: 19,
      daysAgo: 5,
    },
    {
      category: "ILLEGAL_WASTE_DUMP",
      description: "Plastics and debris snagged in Kirichwa Kubwa channel.",
      anchor: 3,
      north: -14,
      east: -11,
      daysAgo: 2,
    },
    {
      category: "DRAINAGE_STORMWATER",
      description: "Blocked culvert under path crossing Kirichwa Kubwa.",
      anchor: 1,
      north: 21,
      east: 5,
      daysAgo: 19,
    },
  ];

  for (const e of kirichwaExtras) {
    const base = KIRICHWA[e.anchor];
    points.push({
      category: e.category,
      description: e.description,
      ...offset(base.lat, base.lng, e.north, e.east),
      daysAgo: e.daysAgo,
    });
  }

  // A few more spaced points to clear 50+
  const fillers: SeedPoint[] = [
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Edge break on Argwings Kodhek near junction with Ralph Bunche.",
      ...offset(ARGWINGS[2].lat, ARGWINGS[2].lng, 35, -40),
      daysAgo: 23,
    },
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "Temporary works fencing pinches Dennis Pritt footway to <0.5 m.",
      ...offset(DENNIS_PRITT[0].lat, DENNIS_PRITT[0].lng, -30, 35),
      daysAgo: 12,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Series of dark poles along Ngong Road service road.",
      ...offset(NGONG[2].lat, NGONG[2].lng, 40, 25),
      daysAgo: 9,
    },
    {
      category: "DRAINAGE_STORMWATER",
      description: "Standing water at Kirichwa low point after short shower.",
      ...offset(KIRICHWA[0].lat, KIRICHWA[0].lng, -28, 32),
      daysAgo: 4,
    },
    {
      category: "SEWER_SANITATION",
      description: "Leaking lateral connection smell reported near Argwings offices.",
      ...offset(ARGWINGS[1].lat, ARGWINGS[1].lng, 28, 38),
      daysAgo: 6,
    },
    {
      category: "ILLEGAL_WASTE_DUMP",
      description: "Mattress and e-waste dumped at Ngong Road back lane.",
      ...offset(NGONG[1].lat, NGONG[1].lng, -35, -28),
      daysAgo: 1,
    },
    {
      category: "MOBILITY_SURFACE_DAMAGE",
      description: "Failed speed bump asphalt on Dennis Pritt feeder.",
      ...offset(DENNIS_PRITT[2].lat, DENNIS_PRITT[2].lng, 32, -27),
      daysAgo: 15,
    },
    {
      category: "NMT_PEDESTRIAN_HAZARD",
      description: "Vendors occupying Ngong Road sidewalk near stage.",
      ...offset(NGONG[3].lat, NGONG[3].lng, -27, 33),
      daysAgo: 8,
    },
    {
      category: "LIGHTING_SECURITY",
      description: "Dark alley off Argwings Kodhek with no functioning lamp.",
      ...offset(ARGWINGS[3].lat, ARGWINGS[3].lng, 24, -31),
      daysAgo: 11,
    },
  ];

  points.push(...fillers);
  return points;
}

async function insertIncident(point: SeedPoint): Promise<string> {
  const id = randomUUID();
  const h3Index = latLngToCell(point.lat, point.lng, H3_RESOLUTION);
  const createdAt = new Date();
  createdAt.setUTCDate(createdAt.getUTCDate() - point.daysAgo);
  createdAt.setUTCHours(8 + (point.daysAgo % 10), (point.daysAgo * 7) % 60, 0, 0);

  // PostGIS-native geometry insert (Prisma can't express ST_MakePoint).
  await prisma.$executeRaw`
    INSERT INTO incidents (
      id,
      category,
      description,
      location,
      h3_index,
      is_verified,
      cluster_id,
      photo_url,
      created_at
    )
    VALUES (
      ${id}::uuid,
      ${point.category}::"HazardCategory",
      ${point.description},
      ST_SetSRID(ST_MakePoint(${point.lng}, ${point.lat}), 4326),
      ${h3Index},
      false,
      NULL,
      NULL,
      ${createdAt}
    )
  `;

  return id;
}

/**
 * Mirror the ingestion service rule: same category within 15 m geography,
 * ≥3 reports → is_verified + shared cluster_id (anchor = lexicographically
 * smallest member id, stable across re-seeds of the same geometry set).
 */
async function applyAutoVerification(): Promise<number> {
  const anchors = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT a.id::text AS id
    FROM incidents a
    WHERE (
      SELECT COUNT(*)::int
      FROM incidents b
      WHERE b.category = a.category
        AND ST_DWithin(
          a.location::geography,
          b.location::geography,
          15
        )
    ) >= 3
    ORDER BY a.id
  `;

  const claimed = new Set<string>();
  let clusterCount = 0;

  for (const { id: candidateId } of anchors) {
    if (claimed.has(candidateId)) continue;

    const members = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT b.id::text AS id
      FROM incidents a
      JOIN incidents b
        ON b.category = a.category
       AND ST_DWithin(
         a.location::geography,
         b.location::geography,
         15
       )
      WHERE a.id = ${candidateId}::uuid
      ORDER BY b.id
    `;

    if (members.length < 3) continue;
    if (members.some((m) => claimed.has(m.id))) continue;

    const memberIds = members.map((m) => m.id);
    const anchorId = memberIds[0]!;
    const idList = Prisma.join(
      memberIds.map((id) => Prisma.sql`${id}::uuid`),
    );

    await prisma.$executeRaw`
      UPDATE incidents
      SET
        is_verified = true,
        cluster_id = ${anchorId}::uuid
      WHERE id IN (${idList})
    `;

    for (const id of memberIds) claimed.add(id);
    clusterCount += 1;
    console.log(
      `  ✓ cluster ${anchorId.slice(0, 8)}… — ${memberIds.length} reports verified`,
    );
  }

  return claimed.size;
}

async function main() {
  console.log("UrbanMesh seed — clearing incidents…");
  await prisma.$executeRaw`DELETE FROM incidents`;

  const points = buildSeedPoints();
  console.log(`Inserting ${points.length} historical points via PostGIS…`);

  const clusterNotes = points.filter((p) => p.note?.startsWith("cluster-"));
  const nearMissNotes = points.filter((p) => p.note?.startsWith("near-miss-"));

  for (const point of points) {
    await insertIncident(point);
  }

  console.log(
    `\nIntentional full clusters seeded: ${clusterNotes.length} points (A–D)`,
  );
  console.log(
    `Near-miss pairs for live demo: ${nearMissNotes.length} points (E–F)`,
  );
  console.log("\nRunning 15 m / ≥3 auto-verification pass…");
  const flipped = await applyAutoVerification();

  const summary = await prisma.$queryRaw<
    Array<{ total: number; verified: number; unverified: number }>
  >`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE is_verified)::int AS verified,
      COUNT(*) FILTER (WHERE NOT is_verified)::int AS unverified
    FROM incidents
  `;

  console.log("\nSeed complete:");
  console.log(`  total      : ${summary[0]?.total}`);
  console.log(`  verified   : ${summary[0]?.verified} (rows touched ≈ ${flipped})`);
  console.log(`  unverified : ${summary[0]?.unverified}`);
  console.log(
    "\nLive demo tip: report NMT on Argwings mid-corridor or DRAINAGE on Ngong west",
  );
  console.log(
    "  near existing near-miss pairs to fire “Verified Cluster Created”.",
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
