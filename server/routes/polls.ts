import { Router } from "express";
import { z } from "zod";
import { audit } from "../lib/audit";
import { applyVote, buildBootstrap, canVote, findUserById } from "../lib/store";
import type { AuthSessionData } from "../types";

const voteBodySchema = z.object({
  optionId: z.string().min(1).max(64),
});

function getSessionData(req: any): AuthSessionData {
  return req.session as unknown as AuthSessionData;
}

export const pollsRouter = Router();

import { posthog } from "../lib/posthog";

pollsRouter.get("/bootstrap", async (req, res) => {
  const sessionData = getSessionData(req);
  const user = sessionData.userId ? await findUserById(sessionData.userId) : null;

  if (sessionData.userId && !user) {
    sessionData.userId = undefined;
  }

  return res.status(200).json(await buildBootstrap(user, sessionData));
});

pollsRouter.post("/polls/:pollId/vote", async (req, res) => {
  const parsed = voteBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid vote payload." });
  }

  const sessionData = getSessionData(req);
  const user = sessionData.userId ? await findUserById(sessionData.userId) : null;
  const { pollId } = req.params;

  const permission = await canVote(user, sessionData, pollId);
  if (!permission.ok) {
    if (permission.reason === "auth_required") {
      return res.status(403).json({ error: "Sign up or log in to continue voting." });
    }

    return res.status(409).json({ error: "You already voted on this poll." });
  }

  const voted = await applyVote(user, sessionData, pollId, parsed.data.optionId);
  if (!voted) {
    return res.status(404).json({ error: "Poll or option not found." });
  }

  if (posthog) {
    posthog.capture({
      distinctId: user?.id ?? `anon-${req.ip}`,
      event: 'user_voted',
      properties: {
        pollId,
        optionId: parsed.data.optionId,
        isLoggedIn: !!user
      }
    });
  }

  audit("poll.vote", {
    pollId,
    optionId: parsed.data.optionId,
    userId: user?.id ?? null,
    ip: req.ip,
  });

  return res.status(200).json(await buildBootstrap(user, sessionData));
});
