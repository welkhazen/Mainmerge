import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { AppController } from "../mvc/controllers/appController";
import { CommunitiesRepository } from "../mvc/repositories/communitiesRepository";
import { PollsRepository } from "../mvc/repositories/pollsRepository";
import { ProfileRepository } from "../mvc/repositories/profileRepository";
import { AppService } from "../mvc/services/appService";

export const appV2Router = Router();

try {
	const pollsRepository = new PollsRepository();
	const communitiesRepository = new CommunitiesRepository();
	const profileRepository = new ProfileRepository();
	const appService = new AppService(pollsRepository, communitiesRepository, profileRepository);
	const appController = new AppController(appService);

	appV2Router.use(requireAuth);

	appV2Router.get("/dashboard", appController.getDashboardData);
	appV2Router.get("/polls/random", appController.getRandomizedPolls);
	appV2Router.post("/polls/:pollId/vote", appController.voteOnPoll);
	appV2Router.get("/communities", appController.getCommunities);
	appV2Router.post("/communities/:communityId/join", appController.joinCommunity);
	appV2Router.get("/profile", appController.getProfile);
	appV2Router.post("/admin/polls", appController.createPollAsAdmin);
} catch (error) {
	console.warn("app.v2.disabled", error);
	appV2Router.use((_req, res) => {
		return res.status(503).json({
			error: "App v2 API requires Supabase configuration (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).",
		});
	});
}
