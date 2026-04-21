import { SupabaseRestRepository } from "./supabaseRest";
import type { PollView } from "../types";

type PollRow = {
  id: string;
  question: string;
  locked: boolean;
};

type PollOptionRow = {
  id: string;
  poll_id: string;
  text: string;
  votes_count: number;
  order_index: number;
};

type PollVoteRow = {
  poll_id: string;
};

export class PollsRepository extends SupabaseRestRepository {
  async listActivePolls(limit = 100): Promise<PollView[]> {
    const polls = await this.request<PollRow[]>(
      "GET",
      "app_polls",
      `is_active=eq.true&select=id,question,locked&order=created_at.desc&limit=${limit}`
    );

    if (!polls.length) {
      return [];
    }

    const pollIds = polls.map((poll) => poll.id);
    const encodedIds = pollIds.join(",");

    const options = await this.request<PollOptionRow[]>(
      "GET",
      "app_poll_options",
      `poll_id=in.(${encodedIds})&select=id,poll_id,text,votes_count,order_index&order=order_index.asc`
    );

    const optionsByPollId = new Map<string, PollOptionRow[]>();
    options.forEach((option) => {
      const current = optionsByPollId.get(option.poll_id) ?? [];
      current.push(option);
      optionsByPollId.set(option.poll_id, current);
    });

    return polls.map((poll) => ({
      id: poll.id,
      question: poll.question,
      locked: Boolean(poll.locked),
      options: (optionsByPollId.get(poll.id) ?? []).map((option) => ({
        id: option.id,
        text: option.text,
        votes: option.votes_count,
      })),
    }));
  }

  async getVotedPollIds(userId: string): Promise<Set<string>> {
    const rows = await this.request<PollVoteRow[]>(
      "GET",
      "app_poll_votes",
      `user_id=eq.${encodeURIComponent(userId)}&select=poll_id`
    );

    return new Set(rows.map((row) => row.poll_id));
  }

  async hasUserVoted(userId: string, pollId: string): Promise<boolean> {
    const rows = await this.request<PollVoteRow[]>(
      "GET",
      "app_poll_votes",
      `user_id=eq.${encodeURIComponent(userId)}&poll_id=eq.${encodeURIComponent(pollId)}&select=poll_id&limit=1`
    );

    return rows.length > 0;
  }

  async createPoll(question: string, options: string[], createdBy: string): Promise<PollView> {
    const polls = await this.request<Array<{ id: string; question: string; locked: boolean }>>(
      "POST",
      "app_polls",
      "",
      {
        question,
        created_by: createdBy,
        is_active: true,
        locked: false,
      }
    );

    if (!polls.length) {
      throw new Error("Failed to create poll.");
    }

    const poll = polls[0];

    const optionRows = options.map((text, index) => ({
      poll_id: poll.id,
      text,
      votes_count: 0,
      order_index: index,
    }));

    const createdOptions = await this.request<PollOptionRow[]>("POST", "app_poll_options", "", optionRows);

    return {
      id: poll.id,
      question: poll.question,
      locked: poll.locked,
      options: createdOptions
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          text: option.text,
          votes: option.votes_count,
        })),
    };
  }

  async recordVote(userId: string, pollId: string, optionId: string): Promise<void> {
    await this.request("POST", "app_poll_votes", "", {
      user_id: userId,
      poll_id: pollId,
      option_id: optionId,
    });

    const optionRows = await this.request<Array<{ id: string; votes_count: number }>>(
      "GET",
      "app_poll_options",
      `id=eq.${encodeURIComponent(optionId)}&select=id,votes_count&limit=1`
    );

    if (!optionRows.length) {
      throw new Error("Poll option not found.");
    }

    const option = optionRows[0];
    await this.request(
      "PATCH",
      "app_poll_options",
      `id=eq.${encodeURIComponent(option.id)}`,
      { votes_count: option.votes_count + 1 }
    );
  }
}
