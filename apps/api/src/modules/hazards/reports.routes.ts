import { Router, type Request, type Response, type NextFunction } from "express";
import {
  ingestHazardReport,
  isHazardCategory,
} from "./ingestion.service.js";
import { listVerifiedIncidents } from "./verified.service.js";
import type { HazardReportInput } from "../../types/reports.js";

const reportsRouter = Router();

/**
 * GET /api/v1/reports/verified
 * Returns verified incidents with lat/lng for the citizen heatmap.
 */
reportsRouter.get(
  "/verified",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const incidents = await listVerifiedIncidents();
      res.json({ count: incidents.length, incidents });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/v1/reports
 * Accepts a geotagged hazard report from the citizen PWA and runs
 * PostGIS 15 m same-category clustering / verification.
 */
reportsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, description, lat, lng, h3_index, photo_url } =
        req.body ?? {};

      if (!isHazardCategory(category)) {
        res.status(400).json({
          error: "Invalid or missing category",
          allowed: [
            "MOBILITY_SURFACE_DAMAGE",
            "NMT_PEDESTRIAN_HAZARD",
            "DRAINAGE_STORMWATER",
            "SEWER_SANITATION",
            "LIGHTING_SECURITY",
            "ILLEGAL_WASTE_DUMP",
          ],
        });
        return;
      }

      if (typeof description !== "string" || description.trim().length === 0) {
        res.status(400).json({ error: "description is required" });
        return;
      }

      const latitude = Number(lat);
      const longitude = Number(lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        res.status(400).json({ error: "lat and lng must be valid coordinates" });
        return;
      }

      if (typeof h3_index !== "string" || h3_index.trim().length === 0) {
        res.status(400).json({ error: "h3_index is required" });
        return;
      }

      const payload: HazardReportInput = {
        category,
        description: description.trim(),
        lat: latitude,
        lng: longitude,
        h3_index: h3_index.trim(),
        photo_url:
          typeof photo_url === "string" && photo_url.length > 0
            ? photo_url
            : null,
      };

      const result = await ingestHazardReport(payload);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

export { reportsRouter };
