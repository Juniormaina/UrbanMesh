import { Router, type Request, type Response, type NextFunction } from "express";
import { getDashboardMetrics } from "./metrics.service.js";

const dashboardRouter = Router();

/**
 * GET /api/v1/dashboard/metrics
 * Ward-level and category metrics for the county planner dashboard.
 */
dashboardRouter.get(
  "/metrics",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await getDashboardMetrics();
      res.json(metrics);
    } catch (err) {
      next(err);
    }
  },
);

export { dashboardRouter };
