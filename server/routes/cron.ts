import type { Request } from "express";
import { Router } from "express";
import { env } from "../config/env";
import { runStreakResetAtUtc, sendStreakAtRiskEmailsUtc } from "../lib/streakCron";

export const cronRouter = Router();

function isAuthorized(req: Request): boolean {
  if (!env.CRON_SECRET) {
    return false;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  return authHeader.slice("Bearer ".length) === env.CRON_SECRET;
}

cronRouter.post("/streaks/reset", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized cron request." });
  }

  const result = await runStreakResetAtUtc();
  return res.status(200).json({ ok: true, ...result });
});

cronRouter.post("/streaks/at-risk", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized cron request." });
  }

  const result = await sendStreakAtRiskEmailsUtc();
  return res.status(200).json({ ok: true, ...result });
});
