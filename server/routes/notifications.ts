import type { Request } from "express";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import type { AuthSessionData } from "../types";
import { sendTransactionalEmail } from "../lib/email";
import { ProfileRepository } from "../mvc/repositories/profileRepository";

const inviteSchema = z.object({
  to: z.string().email(),
  communityName: z.string().min(2).max(80),
  inviteLink: z.string().url(),
});

const digestSchema = z.object({
  to: z.string().email(),
  summary: z.string().min(4).max(1000),
});

const atRiskSchema = z.object({
  to: z.string().email(),
  username: z.string().min(1).max(30),
  streakDays: z.coerce.number().int().min(1).max(3650),
});

function getUserId(req: Request): string | undefined {
  const session = req.session as unknown as AuthSessionData;
  return session.userId;
}

async function ensureAdmin(userId: string): Promise<boolean> {
  const profileRepository = new ProfileRepository();
  return profileRepository.isAdmin(userId);
}

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.post("/community-invite", async (req, res) => {
  const userId = getUserId(req);
  if (!userId || !(await ensureAdmin(userId))) {
    return res.status(403).json({ error: "Admin permissions required." });
  }

  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid invite payload." });
  }

  await sendTransactionalEmail("community_invite", parsed.data.to, {
    inviter: "raW community",
    communityName: parsed.data.communityName,
    inviteLink: parsed.data.inviteLink,
  });

  return res.status(200).json({ ok: true });
});

notificationsRouter.post("/weekly-digest", async (req, res) => {
  const userId = getUserId(req);
  if (!userId || !(await ensureAdmin(userId))) {
    return res.status(403).json({ error: "Admin permissions required." });
  }

  const parsed = digestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid digest payload." });
  }

  await sendTransactionalEmail("weekly_digest", parsed.data.to, {
    summary: parsed.data.summary,
  });

  return res.status(200).json({ ok: true });
});

notificationsRouter.post("/streak-at-risk", async (req, res) => {
  const userId = getUserId(req);
  if (!userId || !(await ensureAdmin(userId))) {
    return res.status(403).json({ error: "Admin permissions required." });
  }

  const parsed = atRiskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid streak payload." });
  }

  await sendTransactionalEmail("streak_at_risk", parsed.data.to, {
    username: parsed.data.username,
    streakDays: String(parsed.data.streakDays),
  });

  return res.status(200).json({ ok: true });
});
