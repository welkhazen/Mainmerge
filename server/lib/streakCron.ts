import { env } from "../config/env";
import { sendTransactionalEmail } from "./email";

type ProfileRow = {
  user_id: string;
  daily_streak: number;
  last_active_date: string | null;
};

type StytchUserRow = {
  user_id: string;
  email: string;
};

async function supabaseRequest<T>(method: "GET" | "PATCH", table: string, query: string, body?: Record<string, unknown>) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured.");
  }

  const queryPrefix = query ? `?${query}` : "";
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}${queryPrefix}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "Accept-Profile": env.SUPABASE_SCHEMA,
      "Content-Profile": env.SUPABASE_SCHEMA,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase ${method} ${table} failed (${response.status}): ${details}`);
  }

  return (await response.json()) as T;
}

function getIsoDateOffset(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export async function runStreakResetAtUtc(): Promise<{ resetCount: number }> {
  const yesterday = getIsoDateOffset(-1);
  const staleProfiles = await supabaseRequest<ProfileRow[]>(
    "GET",
    "app_profiles",
    `daily_streak=gt.0&or=(last_active_date.lt.${yesterday},last_active_date.is.null)&select=user_id,daily_streak,last_active_date`
  );

  for (const profile of staleProfiles) {
    await supabaseRequest(
      "PATCH",
      "app_profiles",
      `user_id=eq.${encodeURIComponent(profile.user_id)}`,
      { daily_streak: 0 }
    );
  }

  return { resetCount: staleProfiles.length };
}

export async function sendStreakAtRiskEmailsUtc(): Promise<{ sent: number }> {
  const today = getIsoDateOffset(0);
  const yesterday = getIsoDateOffset(-1);

  const profiles = await supabaseRequest<ProfileRow[]>(
    "GET",
    "app_profiles",
    `daily_streak=gt.0&last_active_date=eq.${yesterday}&select=user_id,daily_streak,last_active_date`
  );

  if (!profiles.length) {
    return { sent: 0 };
  }

  const users = await supabaseRequest<StytchUserRow[]>(
    "GET",
    "app_stytch_users",
    "select=user_id,email"
  );
  const emailsByUserId = new Map(users.map((user) => [user.user_id, user.email]));

  let sent = 0;
  for (const profile of profiles) {
    const email = emailsByUserId.get(profile.user_id);
    if (!email) {
      continue;
    }

    await sendTransactionalEmail("streak_at_risk", email, {
      username: email.split("@")[0] ?? "there",
      streakDays: String(profile.daily_streak),
      today,
    });
    sent += 1;
  }

  return { sent };
}
