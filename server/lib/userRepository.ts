import { env } from "../config/env";
import type { UserRecord } from "../types";
import { supabase } from "./supabase";
import {
  createUser,
  findUserByReferralCode,
  findUserById,
  findUserByUsername,
  phoneHashExists,
  updateUserPasswordHash,
  updateUserProfile,
  usernameExists,
  type UpdateUserProfileInput,
} from "./store";

type CreateUserInput = {
  username: string;
  passwordHash: string;
  email?: string;
  phoneHash?: string;
  referralCode?: string;
};

type StytchIdentityInput = {
  stytchUserId: string;
  email: string;
};

type UpdateProfileResult =
  | { status: "ok"; user: UserRecord }
  | { status: "not_found" | "username_taken" };

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
  findByUsername(username: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByReferralCode(referralCode: string): Promise<UserRecord | null>;
  usernameExists(username: string): Promise<boolean>;
  phoneHashExists(phoneHash: string): Promise<boolean>;
  create(input: CreateUserInput): Promise<UserRecord>;
  findOrCreateByStytchIdentity(input: StytchIdentityInput): Promise<UserRecord>;
  registerReferralActivation(referralCode: string, referredUserId: string): Promise<void>;
  updateProfile(userId: string, updates: UpdateUserProfileInput): Promise<UpdateProfileResult>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<boolean>;
}

function normalizeStytchUsername(email: string): string {
  const localPart = email.split("@")[0] ?? "user";
  const normalized = localPart.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  const trimmed = normalized.slice(0, 24);
  if (trimmed.length >= 3) {
    return trimmed;
  }
  return `user${Math.floor(Math.random() * 9000 + 1000)}`;
}

async function reserveAvailableUsername(
  baseUsername: string,
  exists: (username: string) => Promise<boolean>
): Promise<string> {
  const sanitizedBase = baseUsername.slice(0, 24);
  if (!(await exists(sanitizedBase))) {
    return sanitizedBase;
  }

  for (let index = 1; index <= 9999; index += 1) {
    const suffix = `-${index}`;
    const candidate = `${sanitizedBase.slice(0, 24 - suffix.length)}${suffix}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  return `${sanitizedBase.slice(0, 20)}-${Date.now().toString().slice(-3)}`;
}

class MemoryUserRepository implements UserRepository {
  async findById(userId: string): Promise<UserRecord | null> {
    return findUserById(userId);
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    return findUserByUsername(username);
  }

  async findByEmail(_email: string): Promise<UserRecord | null> {
    return null;
  }

  async findByReferralCode(referralCode: string): Promise<UserRecord | null> {
    return findUserByReferralCode(referralCode);
  }

  async usernameExists(username: string): Promise<boolean> {
    return usernameExists(username);
  }

  async phoneHashExists(phoneHash: string): Promise<boolean> {
    return phoneHashExists(phoneHash);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return createUser(input.username, input.passwordHash, input.email || input.phoneHash || "", input.referralCode);
  }

  async findOrCreateByStytchIdentity(input: StytchIdentityInput): Promise<UserRecord> {
    const preferredUsername = normalizeStytchUsername(input.email);
    const existingByUsername = await this.findByUsername(preferredUsername);
    if (existingByUsername) {
      return existingByUsername;
    }

    const username = await reserveAvailableUsername(preferredUsername, (candidate) => this.usernameExists(candidate));
    return this.create({
      username,
      passwordHash: `stytch:${input.stytchUserId}`,
      phoneHash: `stytch:${input.stytchUserId}`,
    });
  }

  async registerReferralActivation(_referralCode: string, _referredUserId: string): Promise<void> {
    return;
  }

  async updateProfile(userId: string, updates: UpdateUserProfileInput): Promise<UpdateProfileResult> {
    const result = updateUserProfile(userId, updates);
    if (result.status !== "ok" || !result.user) {
      return { status: result.status };
    }

    return { status: "ok", user: result.user };
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<boolean> {
    return updateUserPasswordHash(userId, passwordHash);
  }
}

type SupabaseUserRow = {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  phone: string | null;
  avatar_level: number;
  role: string;
  status: string;
  referral_code: string | null;
  stytch_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type RuntimeUserState = {
  votedPollIds: Set<string>;
};

class SupabaseUserRepository implements UserRepository {
  private readonly runtimeStateByUserId = new Map<string, RuntimeUserState>();

  async findById(userId: string): Promise<UserRecord | null> {
    if (!supabase) {
      return findUserById(userId);
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) return null;
      return this.toUserRecord(data as SupabaseUserRow);
    } catch {
      return null;
    }
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    if (!supabase) {
      return findUserByUsername(username);
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) return null;
      return this.toUserRecord(data as SupabaseUserRow);
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) return null;
      return this.toUserRecord(data as SupabaseUserRow);
    } catch {
      return null;
    }
  }

  async findByReferralCode(referralCode: string): Promise<UserRecord | null> {
    if (!supabase) {
      return findUserByReferralCode(referralCode);
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("referral_code", referralCode.toUpperCase())
        .single();

      if (error || !data) return null;
      return this.toUserRecord(data as SupabaseUserRow);
    } catch {
      return null;
    }
  }

  async usernameExists(username: string): Promise<boolean> {
    if (!supabase) {
      return usernameExists(username);
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async phoneHashExists(phoneHash: string): Promise<boolean> {
    if (!supabase) {
      return phoneHashExists(phoneHash);
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phoneHash)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    if (!supabase) {
      return createUser(input.username, input.passwordHash, input.phoneHash || input.email || "", input.referralCode);
    }

    const randomSuffix = Math.floor(Math.random() * 9000 + 1000).toString();
    const baseReferralCode = (input.referralCode ?? `${input.username}`)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
      .padEnd(6, "X");
    const referralCode = `${baseReferralCode}${randomSuffix}`;

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            username: input.username,
            password_hash: input.passwordHash,
            email: input.email || null,
            phone: input.phoneHash || null,
            referral_code: referralCode,
            avatar_level: 1,
            role: "user",
            status: "active",
          },
        ])
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Supabase create user failed: ${error?.message}`);
      }

      const user = this.toUserRecord(data as SupabaseUserRow);

      // Create onboarding state
      await supabase.from("onboarding_state").insert({
        user_id: user.id,
        step: "avatar",
        answered_poll_ids: [],
        selected_community_ids: [],
      });

      return user;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Supabase create user failed");
    }
  }

  async registerReferralActivation(referralCode: string, referredUserId: string): Promise<void> {
    if (!supabase) {
      return;
    }

    try {
      const referrer = await this.findByReferralCode(referralCode);
      if (!referrer || referrer.id === referredUserId) {
        return;
      }

      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", referrer.id)
        .eq("referred_user_id", referredUserId)
        .single();

      if (existing) {
        return;
      }

      await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        referred_user_id: referredUserId,
        activated_at: new Date().toISOString(),
      });

      // Update users table - set referred_by
      await supabase
        .from("users")
        .update({ referred_by: referrer.id })
        .eq("id", referredUserId);
    } catch {
      return;
    }
  }

  async findOrCreateByStytchIdentity(input: StytchIdentityInput): Promise<UserRecord> {
    if (!supabase) {
      return findUserByUsername(normalizeStytchUsername(input.email)) ||
        createUser(
          normalizeStytchUsername(input.email),
          `stytch:${input.stytchUserId}`,
          input.email,
          undefined
        );
    }

    try {
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("stytch_user_id", input.stytchUserId)
        .single();

      if (existing) {
        return this.toUserRecord(existing as SupabaseUserRow);
      }

      const preferredUsername = normalizeStytchUsername(input.email);
      const username = await reserveAvailableUsername(preferredUsername, (candidate) =>
        this.usernameExists(candidate)
      );

      const user = await this.create({
        username,
        passwordHash: `stytch:${input.stytchUserId}`,
        email: input.email,
      });

      // Link Stytch ID
      await supabase
        .from("users")
        .update({ stytch_user_id: input.stytchUserId })
        .eq("id", user.id);

      return { ...user, stytchUserId: input.stytchUserId };
    } catch {
      throw new Error("Unable to create or locate Stytch user");
    }
  }

  async updateProfile(userId: string, updates: UpdateUserProfileInput): Promise<UpdateProfileResult> {
    if (!supabase) {
      return updateUserProfile(userId, updates);
    }

    const existing = await this.findById(userId);
    if (!existing) {
      return { status: "not_found" };
    }

    if (typeof updates.username === "string" && updates.username !== existing.username) {
      const taken = await this.usernameExists(updates.username);
      if (taken) {
        return { status: "username_taken" };
      }
    }

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (Object.prototype.hasOwnProperty.call(updates, "username")) {
      payload.username = updates.username;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .update(payload)
        .eq("id", userId)
        .select()
        .single();

      if (error || !data) {
        return { status: "not_found" };
      }

      return { status: "ok", user: this.toUserRecord(data as SupabaseUserRow) };
    } catch {
      return { status: "not_found" };
    }
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<boolean> {
    if (!supabase) {
      return updateUserPasswordHash(userId, passwordHash);
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq("id", userId);

      return !error;
    } catch {
      return false;
    }
  }

  private toUserRecord(row: SupabaseUserRow): UserRecord {
    const state = this.ensureRuntimeState(row.id);

    return {
      id: row.id,
      username: row.username,
      displayName: null,
      bio: null,
      referralCode: row.referral_code || "",
      createdAt: Date.parse(row.created_at),
      updatedAt: Date.parse(row.updated_at),
      passwordChangedAt: Date.parse(row.updated_at),
      passwordHash: row.password_hash,
      phoneHash: row.phone || "",
      votedPollIds: state.votedPollIds,
      avatarLevel: row.avatar_level,
      role: row.role,
      status: row.status,
      email: row.email || undefined,
    };
  }

  private ensureRuntimeState(userId: string): RuntimeUserState {
    const existing = this.runtimeStateByUserId.get(userId);
    if (existing) {
      return existing;
    }

    const state: RuntimeUserState = {
      votedPollIds: new Set<string>(),
    };

    this.runtimeStateByUserId.set(userId, state);
    return state;
  }
}

let repository: UserRepository | null = null;

function shouldUseSupabaseRepository(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getUserRepository(): UserRepository {
  if (repository) {
    return repository;
  }

  repository = shouldUseSupabaseRepository() ? new SupabaseUserRepository() : new MemoryUserRepository();
  return repository;
}
