import { Router } from "express";
import { z } from "zod";
import { audit } from "../lib/audit";
import { findUserById, joinCommunity, trackEvent, updateTraits } from "../lib/store";
import { posthog } from "../lib/posthog";
import type { AuthSessionData } from "../types";

function getSessionData(req: any): AuthSessionData {
  return req.session as unknown as AuthSessionData;
}

export const communitiesRouter = Router();

const joinSchema = z.object({
  communityId: z.string(),
});

communitiesRouter.post("/communities/join", async (req, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid community ID." });
  }

  const sessionData = getSessionData(req);
  if (!sessionData.userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const user = await findUserById(sessionData.userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  await joinCommunity(user.id, parsed.data.communityId);
  await updateTraits(user.id, { [`joined_${parsed.data.communityId}`]: true });
  
  if (posthog) {
    posthog.capture({
      distinctId: user.id,
      event: 'community_joined',
      properties: {
        communityId: parsed.data.communityId
      }
    });
  }

  await trackEvent(user.id, 'join_community', { communityId: parsed.data.communityId });

  audit("community.join", {
    communityId: parsed.data.communityId,
    userId: user.id,
    ip: req.ip,
  });

  return res.status(200).json({ ok: true });
});
