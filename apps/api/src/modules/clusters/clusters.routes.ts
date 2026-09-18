import { Router, type Request, type Response, type NextFunction } from "express";
import { listVerifiedClusters } from "./clusters.service.js";

const clustersRouter = Router();

clustersRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clusters = await listVerifiedClusters();
      res.json({ count: clusters.length, clusters });
    } catch (err) {
      next(err);
    }
  },
);

export { clustersRouter };
