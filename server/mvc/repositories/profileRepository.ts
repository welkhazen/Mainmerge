import { SupabaseRestRepository } from "./supabaseRest";
import { getUserRepository } from "../../lib/userRepository";
import type { UserProfileView } from "../types";

type ProfileRow = {
  user_id: string;
  xp: number;
  daily_streak: number;
  last_active_date: string | null;
};

type AdminRow = {
  user_id: string;
};

export class ProfileRepository extends SupabaseRestRepository {
  async getProfile(userId: string): Promise<UserProfileView> {
    const user = await getUserRepository().findById(userId);
    if (!user) {
      throw new Error("Authenticated user not found.");
    }

    let profile = await this.readProfile(userId);
    if (!profile) {
      profile = await this.createProfile(userId);
    }

    return {
      userId,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      xp: profile.xp,
      dailyStreak: profile.daily_streak,
      lastActiveDate: profile.last_active_date,
    };
  }

  async applyDailyActivity(userId: string): Promise<void> {
    const profile = (await this.readProfile(userId)) ?? (await this.createProfile(userId));
    const today = new Date().toISOString().slice(0, 10);

    if (profile.last_active_date === today) {
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const nextStreak = profile.last_active_date === yesterday ? profile.daily_streak + 1 : 1;

    await this.request(
      "PATCH",
      "app_profiles",
      `user_id=eq.${encodeURIComponent(userId)}`,
      {
        daily_streak: nextStreak,
        last_active_date: today,
      }
    );
  }

  async addXp(userId: string, amount: number): Promise<void> {
    const profile = (await this.readProfile(userId)) ?? (await this.createProfile(userId));
    await this.request(
      "PATCH",
      "app_profiles",
      `user_id=eq.${encodeURIComponent(userId)}`,
      {
        xp: Math.max(0, profile.xp + amount),
      }
    );
  }

  async isAdmin(userId: string): Promise<boolean> {
    const rows = await this.request<AdminRow[]>(
      "GET",
      "app_admin_users",
      `user_id=eq.${encodeURIComponent(userId)}&role=eq.admin&select=user_id&limit=1`
    );

    return rows.length > 0;
  }

  private async readProfile(userId: string): Promise<ProfileRow | null> {
    const rows = await this.request<ProfileRow[]>(
      "GET",
      "app_profiles",
      `user_id=eq.${encodeURIComponent(userId)}&select=user_id,xp,daily_streak,last_active_date&limit=1`
    );

    return rows.length > 0 ? rows[0] : null;
  }

  private async createProfile(userId: string): Promise<ProfileRow> {
    const rows = await this.request<ProfileRow[]>("POST", "app_profiles", "", {
      user_id: userId,
      xp: 0,
      daily_streak: 0,
      last_active_date: null,
    });

    if (!rows.length) {
      throw new Error("Failed to create profile row.");
    }

    return rows[0];
  }
}
