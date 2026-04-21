import { z } from "zod";
import type { Request, Response } from "express";
import type { AuthSessionData } from "../../types";
import { AppService } from "../services/appService";

const voteSchema = z.object({
  optionId: z.string().min(1).max(64),
});

const createPollSchema = z.object({
  question: z.string().min(8).max(280),
  options: z.array(z.string().min(1).max(80)).min(2).max(4),
});

const limitSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .default({});

function getUserId(req: Request): string | null {
  const session = req.session as unknown as AuthSessionData;
  return session.userId ?? null;
}

export class AppController {
  constructor(private readonly service: AppService) {}

  getDashboardData = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      const data = await this.service.getDashboardData(userId);
      return res.status(200).json(data);
    } catch (error) {
      console.error("v2.dashboard.error", error);
      return res.status(500).json({ error: "Failed to load dashboard data." });
    }
  };

  getRandomizedPolls = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const parsed = limitSchema.safeParse(req.query);
    const limit = parsed.success ? parsed.data.limit ?? 10 : 10;

    try {
      const polls = await this.service.getRandomizedPolls(userId, limit);
      return res.status(200).json({ polls });
    } catch (error) {
      console.error("v2.polls.random.error", error);
      return res.status(500).json({ error: "Failed to load randomized polls." });
    }
  };

  voteOnPoll = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid vote payload." });
    }

    try {
      await this.service.submitPollVote(userId, req.params.pollId, parsed.data.optionId);
      return res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message === "already_voted") {
        return res.status(409).json({ error: "You already voted on this poll." });
      }

      console.error("v2.polls.vote.error", error);
      return res.status(500).json({ error: "Failed to submit vote." });
    }
  };

  getCommunities = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      const communities = await this.service.listCommunities(userId);
      return res.status(200).json({ communities });
    } catch (error) {
      console.error("v2.communities.list.error", error);
      return res.status(500).json({ error: "Failed to load communities." });
    }
  };

  joinCommunity = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      await this.service.joinCommunity(userId, req.params.communityId);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("v2.communities.join.error", error);
      return res.status(500).json({ error: "Failed to join community." });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    try {
      const profile = await this.service.getProfile(userId);
      return res.status(200).json({ profile });
    } catch (error) {
      console.error("v2.profile.get.error", error);
      return res.status(500).json({ error: "Failed to load profile." });
    }
  };

  createPollAsAdmin = async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid poll payload." });
    }

    try {
      const poll = await this.service.createPollAsAdmin(userId, parsed.data.question, parsed.data.options);
      return res.status(201).json({ poll });
    } catch (error) {
      if (error instanceof Error && error.message === "forbidden") {
        return res.status(403).json({ error: "Only admins can create polls." });
      }

      console.error("v2.admin.polls.create.error", error);
      return res.status(500).json({ error: "Failed to create poll." });
    }
  };
}
