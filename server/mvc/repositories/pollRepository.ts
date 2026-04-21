import { supabase } from "../../lib/supabase";

export type PollWithOptions = {
  id: string;
  question: string;
  options: Array<{ id: string; label: string; position: number; votes: number }>;
  created_at: string;
  created_by: string | null;
};

export type PollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  voted_at: string;
  surface?: string;
};

export class PollRepository {
  async createPoll(
    question: string,
    options: string[],
    communityId?: string,
    userId?: string
  ): Promise<PollWithOptions> {
    if (!supabase) {
      throw new Error("Supabase not available");
    }

    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert({
          question,
          community_id: communityId || null,
          created_by: userId || null,
          status: "active",
        })
        .select()
        .single();

      if (pollError || !pollData) {
        throw new Error(`Failed to create poll: ${pollError?.message}`);
      }

      const optionsToInsert = options.map((label, position) => ({
        poll_id: pollData.id,
        label,
        position,
      }));

      const { data: optionsData, error: optionsError } = await supabase
        .from("poll_options")
        .insert(optionsToInsert)
        .select();

      if (optionsError) {
        throw new Error(`Failed to create poll options: ${optionsError.message}`);
      }

      return {
        id: pollData.id,
        question: pollData.question,
        options: (optionsData || []).map((opt: any) => ({
          id: opt.id,
          label: opt.label,
          position: opt.position,
          votes: 0,
        })),
        created_at: pollData.created_at,
        created_by: pollData.created_by,
      };
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to create poll");
    }
  }

  async getPoll(pollId: string): Promise<PollWithOptions | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("id", pollId)
        .eq("status", "active")
        .single();

      if (pollError || !pollData) {
        return null;
      }

      const { data: optionsData } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", pollId)
        .order("position");

      const { data: votesData } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("poll_id", pollId);

      const voteCount = new Map<string, number>();
      (votesData || []).forEach((vote: any) => {
        voteCount.set(vote.option_id, (voteCount.get(vote.option_id) || 0) + 1);
      });

      return {
        id: pollData.id,
        question: pollData.question,
        options: (optionsData || []).map((opt: any) => ({
          id: opt.id,
          label: opt.label,
          position: opt.position,
          votes: voteCount.get(opt.id) || 0,
        })),
        created_at: pollData.created_at,
        created_by: pollData.created_by,
      };
    } catch {
      return null;
    }
  }

  async listPolls(limit: number = 20, offset: number = 0): Promise<PollWithOptions[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data: pollsData } = await supabase
        .from("polls")
        .select("*")
        .eq("status", "active")
        .eq("is_onboarding", false)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!pollsData) {
        return [];
      }

      const polls: PollWithOptions[] = [];

      for (const poll of pollsData) {
        const { data: optionsData } = await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", poll.id)
          .order("position");

        const { data: votesData } = await supabase
          .from("poll_votes")
          .select("option_id")
          .eq("poll_id", poll.id);

        const voteCount = new Map<string, number>();
        (votesData || []).forEach((vote: any) => {
          voteCount.set(vote.option_id, (voteCount.get(vote.option_id) || 0) + 1);
        });

        polls.push({
          id: poll.id,
          question: poll.question,
          options: (optionsData || []).map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            position: opt.position,
            votes: voteCount.get(opt.id) || 0,
          })),
          created_at: poll.created_at,
          created_by: poll.created_by,
        });
      }

      return polls;
    } catch {
      return [];
    }
  }

  async getOnboardingPolls(): Promise<PollWithOptions[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data: pollsData } = await supabase
        .from("polls")
        .select("*")
        .eq("status", "active")
        .eq("is_onboarding", true)
        .order("created_at")
        .limit(3);

      if (!pollsData) {
        return [];
      }

      const polls: PollWithOptions[] = [];

      for (const poll of pollsData) {
        const { data: optionsData } = await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", poll.id)
          .order("position");

        polls.push({
          id: poll.id,
          question: poll.question,
          options: (optionsData || []).map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            position: opt.position,
            votes: 0,
          })),
          created_at: poll.created_at,
          created_by: poll.created_by,
        });
      }

      return polls;
    } catch {
      return [];
    }
  }

  async recordVote(
    pollId: string,
    optionId: string,
    userId: string,
    surface?: string
  ): Promise<PollVote | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data: existingVote } = await supabase
        .from("poll_votes")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", userId)
        .single();

      if (existingVote) {
        return null; // Already voted
      }

      const { data: voteData, error } = await supabase
        .from("poll_votes")
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
          surface: surface || null,
        })
        .select()
        .single();

      if (error || !voteData) {
        throw new Error(`Failed to record vote: ${error?.message}`);
      }

      return voteData as PollVote;
    } catch (e) {
      if ((e as Error).message.includes("already voted")) {
        return null;
      }
      throw e;
    }
  }

  async hasVoted(pollId: string, userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("poll_votes")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async getUserVotes(userId: string): Promise<string[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("poll_votes")
        .select("poll_id")
        .eq("user_id", userId);

      return (data || []).map((vote: any) => vote.poll_id);
    } catch {
      return [];
    }
  }

  async addComment(pollId: string, userId: string, body: string): Promise<any> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("poll_comments")
        .insert({
          poll_id: pollId,
          user_id: userId,
          body,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to add comment: ${error?.message}`);
      }

      return data;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to add comment");
    }
  }

  async getPollComments(pollId: string, limit: number = 20): Promise<any[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("poll_comments")
        .select("*")
        .eq("poll_id", pollId)
        .order("created_at", { ascending: false })
        .limit(limit);

      return data || [];
    } catch {
      return [];
    }
  }
}
