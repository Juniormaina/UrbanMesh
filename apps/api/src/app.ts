import express from "express";
import { reportsRouter } from "./modules/hazards/reports.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { lpdpRouter } from "./modules/reports/lpdp.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/lpdp", lpdpRouter);
  return app;
}
