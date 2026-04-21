import { supabase } from "../../lib/supabase";

export type XPEntry = {
  id: string;
  user_id: string;
  delta: number;
  reason: string | null;
  ref_id: string | null;
  created_at: string;
};

export type Challenge = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  target: number;
  reward_xp: number;
  status: string;
  created_at: string;
};

export type ChallengeProgress = {
  user_id: string;
  challenge_id: string;
  progress: number;
  completed_at: string | null;
};

export class XPRepository {
  async addXP(
    userId: string,
    delta: number,
    reason: string,
    refId?: string
  ): Promise<XPEntry | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("xp_ledger")
        .insert({
          user_id: userId,
          delta,
          reason,
          ref_id: refId || null,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to add XP: ${error?.message}`);
      }

      // Update user's avatar level if XP threshold is met
      await this.checkAndUpdateAvatarLevel(userId);

      return data as XPEntry;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to add XP");
    }
  }

  async getTotalXP(userId: string): Promise<number> {
    if (!supabase) {
      return 0;
    }

    try {
      const { data } = await supabase
        .from("xp_ledger")
        .select("delta")
        .eq("user_id", userId);

      return (data || []).reduce((sum: number, entry: any) => sum + entry.delta, 0);
    } catch {
      return 0;
    }
  }

  async getXPHistory(userId: string, limit: number = 50): Promise<XPEntry[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("xp_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data || []) as XPEntry[];
    } catch {
      return [];
    }
  }

  private async checkAndUpdateAvatarLevel(userId: string): Promise<void> {
    if (!supabase) {
      return;
    }

    try {
      const totalXP = await this.getTotalXP(userId);
      const newLevel = this.calculateAvatarLevel(totalXP);

      const { data: user } = await supabase
        .from("users")
        .select("avatar_level")
        .eq("id", userId)
        .single();

      if (user && user.avatar_level < newLevel) {
        await supabase.from("users").update({ avatar_level: newLevel }).eq("id", userId);
      }
    } catch {
      // Silently fail if avatar level update fails
    }
  }

  private calculateAvatarLevel(totalXP: number): number {
    const thresholds = [0, 50, 150, 300, 500, 750, 1050, 1400];
    let level = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (totalXP >= thresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return Math.min(level, 8);
  }

  async listChallenges(): Promise<Challenge[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .order("created_at");

      return (data || []) as Challenge[];
    } catch {
      return [];
    }
  }

  async getChallenge(challengeId: string): Promise<Challenge | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();

      return data as Challenge;
    } catch {
      return null;
    }
  }

  async getChallengeBySlugg(slug: string): Promise<Challenge | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      return data as Challenge;
    } catch {
      return null;
    }
  }

  async getUserChallenges(userId: string): Promise<ChallengeProgress[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", userId);

      return (data || []) as ChallengeProgress[];
    } catch {
      return [];
    }
  }

  async getChallengeProgress(
    userId: string,
    challengeId: string
  ): Promise<ChallengeProgress | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .single();

      return data as ChallengeProgress;
    } catch {
      return null;
    }
  }

  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number
  ): Promise<ChallengeProgress | null> {
    if (!supabase) {
      return null;
    }

    try {
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        return null;
      }

      let upsertData: any = {
        user_id: userId,
        challenge_id: challengeId,
        progress,
      };

      if (progress >= challenge.target && !challenge.completed_at) {
        upsertData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("user_challenge_progress")
        .upsert(upsertData, {
          onConflict: "user_id,challenge_id",
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to update progress: ${error?.message}`);
      }

      // Award XP if challenge completed
      if (progress >= challenge.target && !data.completed_at) {
        await this.addXP(userId, challenge.reward_xp, `Challenge completed: ${challenge.name}`, challengeId);
      }

      return data as ChallengeProgress;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to update challenge progress");
    }
  }

  async recordDailySpin(userId: string, prizeType: string, prizeValue: number): Promise<any> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("daily_spins")
        .insert({
          user_id: userId,
          prize_type: prizeType,
          prize_value_xp: prizeValue,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to record spin: ${error?.message}`);
      }

      // Award XP
      if (prizeValue > 0) {
        await this.addXP(userId, prizeValue, "Daily spin reward", data.id);
      }

      return data;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to record daily spin");
    }
  }

  async canSpinToday(userId: string): Promise<boolean> {
    if (!supabase) {
      return true;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("daily_spins")
        .select("id")
        .eq("user_id", userId)
        .gte("spun_at", today.toISOString())
        .single();

      return !data;
    } catch {
      return true;
    }
  }
}
