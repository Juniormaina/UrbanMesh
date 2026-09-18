import { Router, type Request, type Response } from "express";
import { env } from "../../lib/env.js";
import { PILOT_CORRIDORS } from "../../lib/corridors.js";
import { KILIMANI_WARDS } from "../../lib/wards.js";
import { HAZARD_LABELS } from "../../lib/categories.js";

const metaRouter = Router();

metaRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    product: "UrbanMesh",
    planning_area: "Kilimani",
    city: "Nairobi",
    county: "Nairobi City County",
    cluster_threshold: env.clusterThreshold,
    cluster_radius_meters: env.clusterRadiusMeters,
    h3_resolution: 10,
    categories: Object.entries(HAZARD_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
    corridors: PILOT_CORRIDORS,
    wards: KILIMANI_WARDS,
  });
});

export { metaRouter };
