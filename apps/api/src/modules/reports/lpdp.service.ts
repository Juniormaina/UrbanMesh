import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { prisma } from "../../lib/prisma.js";
import { labelForCategory } from "../../lib/categories.js";
import { wardForCoordinates } from "../../lib/wards.js";

/**
 * Predictable on-disk path (run API scripts from apps/api).
 * Frontend downloads via {@link LPDP_DOWNLOAD_URL}.
 */
export const LPDP_STORAGE_DIR = path.resolve(process.cwd(), "storage/lpdp");
export const LPDP_PDF_FILENAME = "UrbanMesh-LPDP-Policy-Brief.pdf";
export const LPDP_PDF_PATH = path.join(LPDP_STORAGE_DIR, LPDP_PDF_FILENAME);
/** Stable public download URL served by Express. */
export const LPDP_DOWNLOAD_URL = `/api/v1/lpdp/${LPDP_PDF_FILENAME}`;

export interface LpdpCluster {
  cluster_id: string;
  category: string;
  category_label: string;
  lat: number;
  lng: number;
  report_count: number;
  ward_name: string;
  verification_status: "3+ Confirmed Citizen Reports";
}

interface ClusterRow {
  cluster_id: string;
  category: string;
  lat: number;
  lng: number;
  report_count: number;
}

/** Load verified spatial clusters (grouped by cluster_id). */
export async function loadVerifiedClusters(): Promise<LpdpCluster[]> {
  const rows = await prisma.$queryRaw<ClusterRow[]>`
    SELECT
      cluster_id::text AS cluster_id,
      mode() WITHIN GROUP (ORDER BY category::text) AS category,
      AVG(ST_Y(location::geometry)) AS lat,
      AVG(ST_X(location::geometry)) AS lng,
      COUNT(*)::int AS report_count
    FROM incidents
    WHERE is_verified = true
      AND cluster_id IS NOT NULL
    GROUP BY cluster_id
    HAVING COUNT(*) >= 3
    ORDER BY COUNT(*) DESC, cluster_id
  `;

  return rows.map((row) => {
    const lat = Number(row.lat);
    const lng = Number(row.lng);
    return {
      cluster_id: row.cluster_id,
      category: row.category,
      category_label: labelForCategory(row.category),
      lat,
      lng,
      report_count: Number(row.report_count),
      ward_name: wardForCoordinates(lat, lng).name,
      verification_status: "3+ Confirmed Citizen Reports" as const,
    };
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Print-styled HTML LPDP policy brief (A4). */
export function renderLpdpHtml(clusters: LpdpCluster[]): string {
  const generated = new Date().toLocaleString("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  });

  const sections =
    clusters.length === 0
      ? `<section class="cluster empty">
           <h2>No verified clusters</h2>
           <p>No high-risk clusters currently meet the 3+ confirmed citizen report threshold.</p>
         </section>`
      : clusters
          .map(
            (c, i) => `
    <section class="cluster">
      <h2>High-Risk Cluster ${i + 1}</h2>
      <dl>
        <div><dt>Hazard category</dt><dd>${escapeHtml(c.category_label)}</dd></div>
        <div><dt>Coordinates</dt><dd>${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</dd></div>
        <div><dt>Planning area</dt><dd>${escapeHtml(c.ward_name)}</dd></div>
        <div><dt>Citizen reports</dt><dd>${c.report_count}</dd></div>
        <div><dt>Verification status</dt><dd class="status">${escapeHtml(c.verification_status)}</dd></div>
        <div><dt>Cluster ID</dt><dd class="mono">${escapeHtml(c.cluster_id)}</dd></div>
      </dl>
      <p class="action">
        <strong>Recommended LPDP action:</strong>
        Prioritise site inspection and budget allocation for remedial works under the
        ${escapeHtml(c.category_label)} intervention envelope for ${escapeHtml(c.ward_name)}.
      </p>
    </section>`,
          )
          .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UrbanMesh LPDP Policy Brief — Kilimani</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: #0b1f2a;
      font-size: 11pt;
      line-height: 1.45;
    }
    .title-block {
      border-bottom: 3px solid #0e7c6b;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 9pt;
      font-weight: 700;
      color: #0e7c6b;
      margin: 0 0 6px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 20pt;
      line-height: 1.2;
    }
    .meta { margin: 0; color: #1c3a4a; font-size: 10pt; }
    .summary {
      background: #e8f1f4;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 22px;
    }
    .cluster {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 1px solid #c5d5dc;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .cluster h2 {
      margin: 0 0 10px;
      font-size: 13pt;
      color: #0b1f2a;
    }
    dl { margin: 0; }
    dl > div {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 6px;
      padding: 4px 0;
      border-bottom: 1px solid #e8f1f4;
    }
    dt { font-weight: 700; color: #1c3a4a; }
    dd { margin: 0; }
    .status { color: #0a5c50; font-weight: 700; }
    .mono { font-family: ui-monospace, monospace; font-size: 9pt; }
    .action { margin: 12px 0 0; font-size: 10pt; }
    .empty { background: #f7fbfc; }
    footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #c5d5dc;
      font-size: 9pt;
      color: #1c3a4a;
    }
  </style>
</head>
<body>
  <header class="title-block">
    <p class="eyebrow">Nairobi County · Local Physical Development Plan</p>
    <h1>UrbanMesh LPDP Policy Brief — Kilimani Walkability &amp; Safety</h1>
    <p class="meta">
      Crowdsourced verified hazard clusters for county planning prioritisation.<br />
      Generated ${escapeHtml(generated)} (EAT) · Urban Mobility track · Kilimani Urban Hackathon 2026
    </p>
  </header>

  <section class="summary">
    <strong>${clusters.length}</strong> high-risk verified cluster${clusters.length === 1 ? "" : "s"}
    currently meet the crowdsource threshold of three or more confirmed citizen reports within 15 metres.
  </section>

  ${sections}

  <footer>
    Source: UrbanMesh Incident API · Verification rule: ≥3 same-category reports within 15 m (PostGIS ST_DWithin).
    This brief is an operational input to the Kilimani LPDP — not a statutory plan amendment.
  </footer>
</body>
</html>`;
}

export interface LpdpGenerateResult {
  pdf_path: string;
  download_url: string;
  cluster_count: number;
  generated_at: string;
}

/**
 * Compile verified clusters → print HTML → A4 PDF via Puppeteer.
 * Writes to {@link LPDP_PDF_PATH}.
 */
export async function generateLpdpPdf(): Promise<LpdpGenerateResult> {
  const clusters = await loadVerifiedClusters();
  const html = renderLpdpHtml(clusters);

  await mkdir(LPDP_STORAGE_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: LPDP_PDF_PATH,
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
    });
  } finally {
    await browser.close();
  }

  return {
    pdf_path: LPDP_PDF_PATH,
    download_url: LPDP_DOWNLOAD_URL,
    cluster_count: clusters.length,
    generated_at: new Date().toISOString(),
  };
}
