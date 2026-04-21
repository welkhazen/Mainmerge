import { CommunitiesRepository } from "../repositories/communitiesRepository";
import { PollsRepository } from "../repositories/pollsRepository";
import { ProfileRepository } from "../repositories/profileRepository";
import type { CommunityView, DashboardData, PollView, UserProfileView } from "../types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export class AppService {
  constructor(
    private readonly pollsRepository: PollsRepository,
    private readonly communitiesRepository: CommunitiesRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  async getRandomizedPolls(userId: string, limit = 10): Promise<PollView[]> {
    const [polls, votedPollIds] = await Promise.all([
      this.pollsRepository.listActivePolls(100),
      this.pollsRepository.getVotedPollIds(userId),
    ]);

    const unseen = polls.filter((poll) => !votedPollIds.has(poll.id));
    const seen = polls.filter((poll) => votedPollIds.has(poll.id));

    const randomized = [...shuffle(unseen), ...shuffle(seen)];
    return randomized.slice(0, limit);
  }

  async submitPollVote(userId: string, pollId: string, optionId: string): Promise<void> {
    const alreadyVoted = await this.pollsRepository.hasUserVoted(userId, pollId);
    if (alreadyVoted) {
      throw new Error("already_voted");
    }

    await this.pollsRepository.recordVote(userId, pollId, optionId);
    await Promise.all([
      this.profileRepository.addXp(userId, 10),
      this.profileRepository.applyDailyActivity(userId),
    ]);
  }

  async listCommunities(userId: string): Promise<CommunityView[]> {
    return this.communitiesRepository.listActive(userId);
  }

  async joinCommunity(userId: string, communityId: string): Promise<void> {
    await this.communitiesRepository.joinCommunity(userId, communityId);
    await Promise.all([
      this.profileRepository.addXp(userId, 5),
      this.profileRepository.applyDailyActivity(userId),
    ]);
  }

  async getProfile(userId: string): Promise<UserProfileView> {
    return this.profileRepository.getProfile(userId);
  }

  async createPollAsAdmin(userId: string, question: string, options: string[]): Promise<PollView> {
    const isAdmin = await this.profileRepository.isAdmin(userId);
    if (!isAdmin) {
      throw new Error("forbidden");
    }

    return this.pollsRepository.createPoll(question, options, userId);
  }

  async getDashboardData(userId: string): Promise<DashboardData> {
    const [profile, communities, polls] = await Promise.all([
      this.getProfile(userId),
      this.listCommunities(userId),
      this.getRandomizedPolls(userId, 10),
    ]);

    return { profile, communities, polls };
  }
}
