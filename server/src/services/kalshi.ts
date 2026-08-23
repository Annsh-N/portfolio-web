import { readFile } from "node:fs/promises";
import type { KalshiPublicSnapshot } from "../../../shared/types.js";
import { z } from "zod";

const publicSnapshotSchema = z.object({
  status: z.enum(["offline", "paper", "live"]),
  updatedAt: z.string().datetime().nullable(),
  uptimeSeconds: z.number().int().nonnegative().nullable(),
  trackedMarkets: z.number().int().nonnegative().nullable(),
  decisionsToday: z.number().int().nonnegative().nullable(),
  fillsToday: z.number().int().nonnegative().nullable(),
  marketDataAgeMs: z.number().int().nonnegative().nullable(),
  note: z.string().trim().min(1).max(240),
});

const offlineSnapshot: KalshiPublicSnapshot = {
  status: "offline",
  updatedAt: null,
  uptimeSeconds: null,
  trackedMarkets: null,
  decisionsToday: null,
  fillsToday: null,
  marketDataAgeMs: null,
  note: "The public telemetry feed is not connected on this deployment.",
};

export async function getKalshiPublicSnapshot(): Promise<KalshiPublicSnapshot> {
  const snapshotPath = process.env.KALSHI_PUBLIC_SNAPSHOT_PATH;
  if (!snapshotPath) return offlineSnapshot;

  try {
    const raw = await readFile(snapshotPath, "utf8");
    return publicSnapshotSchema.parse(JSON.parse(raw));
  } catch {
    return {
      ...offlineSnapshot,
      note: "The latest public snapshot was unavailable or failed validation.",
    };
  }
}
