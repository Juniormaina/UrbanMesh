import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router, type Request, type Response, type NextFunction } from "express";
import { env } from "../../lib/env.js";

const uploadsRouter = Router();

const MAX_BYTES = 8 * 1024 * 1024;

function extensionForMime(mime: string): string {
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  return ".jpg";
}

uploadsRouter.post(
  "/photos",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.body?.data;
      if (typeof raw !== "string" || raw.length < 32) {
        res.status(400).json({ error: "Photo data is required" });
        return;
      }

      const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      const mime = match?.[1] ?? "image/jpeg";
      const b64 = match?.[2] ?? raw;
      if (!mime.startsWith("image/")) {
        res.status(400).json({ error: "Only images can be uploaded" });
        return;
      }

      const buf = Buffer.from(b64, "base64");
      if (!buf.length) {
        res.status(400).json({ error: "Photo data is invalid" });
        return;
      }
      if (buf.length > MAX_BYTES) {
        res.status(400).json({ error: "Photo must be 8 MB or smaller" });
        return;
      }

      const dest = path.resolve(env.photoStoragePath);
      await mkdir(dest, { recursive: true });
      const filename = `${randomUUID()}${extensionForMime(mime)}`;
      await writeFile(path.join(dest, filename), buf);

      const url = `/uploads/photos/${filename}`;
      res.status(201).json({ url });
    } catch (err) {
      next(err);
    }
  },
);

export { uploadsRouter };
