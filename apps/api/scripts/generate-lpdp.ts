/**
 * CLI: compile the current verified clusters into the LPDP A4 PDF.
 *
 *   npx tsx scripts/generate-lpdp.ts
 */
import { generateLpdpPdf } from "../src/modules/reports/lpdp.service.js";

async function main() {
  const result = await generateLpdpPdf();
  console.log("LPDP policy brief generated:");
  console.log(`  clusters : ${result.cluster_count}`);
  console.log(`  pdf_path : ${result.pdf_path}`);
  console.log(`  download : ${result.download_url}`);
  console.log(`  at       : ${result.generated_at}`);
}

main().catch((err) => {
  console.error("LPDP generation failed:", err);
  process.exit(1);
});
