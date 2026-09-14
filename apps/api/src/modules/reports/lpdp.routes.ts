import { access } from "node:fs/promises";
import { Router, type Request, type Response, type NextFunction } from "express";
import {
  generateLpdpPdf,
  LPDP_DOWNLOAD_URL,
  LPDP_PDF_FILENAME,
  LPDP_PDF_PATH,
} from "./lpdp.service.js";

const lpdpRouter = Router();

/**
 * POST /api/v1/lpdp/generate
 * Compile verified clusters into an A4 LPDP policy brief PDF.
 */
lpdpRouter.post(
  "/generate",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await generateLpdpPdf();
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/v1/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf
 * Stream the latest generated brief (regenerates if missing).
 */
lpdpRouter.get(
  `/${LPDP_PDF_FILENAME}`,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      try {
        await access(LPDP_PDF_PATH);
      } catch {
        await generateLpdpPdf();
      }

      res.download(LPDP_PDF_PATH, LPDP_PDF_FILENAME);
    } catch (err) {
      next(err);
    }
  },
);

/** Convenience alias used by the dashboard download button. */
lpdpRouter.get(
  "/latest.pdf",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      try {
        await access(LPDP_PDF_PATH);
      } catch {
        await generateLpdpPdf();
      }
      res.download(LPDP_PDF_PATH, LPDP_PDF_FILENAME);
    } catch (err) {
      next(err);
    }
  },
);

lpdpRouter.get("/info", (_req: Request, res: Response) => {
  res.json({
    filename: LPDP_PDF_FILENAME,
    path: LPDP_PDF_PATH,
    download_url: LPDP_DOWNLOAD_URL,
    latest_url: "/api/v1/lpdp/latest.pdf",
  });
});

export { lpdpRouter };
