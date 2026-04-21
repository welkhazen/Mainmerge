import { env } from "../config/env";
import type { UserRecord } from "../types";
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
  phoneHash: string;
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

  async phoneHashExists(userPhoneHash: string): Promise<boolean> {
    return phoneHashExists(userPhoneHash);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return createUser(input.username, input.passwordHash, input.phoneHash, input.referralCode);
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
  phone_hash: string;
  display_name: string | null;
  bio: string | null;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
  password_changed_at: string;
};

type StytchMappingRow = {
  user_id: string;
  stytch_user_id: string;
  email: string;
};

type ReferralRow = {
  referrer_user_id: string;
  referred_user_id: string;
  status: string;
};

type RuntimeUserState = {
  votedPollIds: Set<string>;
};

class SupabaseUserRepository implements UserRepository {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly table: string;
  private readonly schema: string;
  private readonly runtimeStateByUserId = new Map<string, RuntimeUserState>();

  constructor() {
    this.baseUrl = env.SUPABASE_URL as string;
    this.serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY as string;
    this.table = env.SUPABASE_USERS_TABLE;
    this.schema = env.SUPABASE_SCHEMA;
  }

  async findById(userId: string): Promise<UserRecord | null> {
    const rows = await this.selectRows(`id=eq.${encodeURIComponent(userId)}&limit=1`);
    return rows.length > 0 ? this.toUserRecord(rows[0]) : null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const rows = await this.selectRows(`username=eq.${encodeURIComponent(username)}&limit=1`);
    return rows.length > 0 ? this.toUserRecord(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const mappingRows = await this.query<StytchMappingRow[]>(
      "GET",
      `email=eq.${encodeURIComponent(email)}&select=user_id,email,stytch_user_id&limit=1`,
      undefined,
      "app_stytch_users"
    );

    if (!mappingRows.length) {
      return null;
    }

    return this.findById(mappingRows[0].user_id);
  }

  async findByReferralCode(referralCode: string): Promise<UserRecord | null> {
    const rows = await this.selectRows(`referral_code=eq.${encodeURIComponent(referralCode.toUpperCase())}&limit=1`);
    return rows.length > 0 ? this.toUserRecord(rows[0]) : null;
  }

  async usernameExists(username: string): Promise<boolean> {
    const rows = await this.selectRows(`username=eq.${encodeURIComponent(username)}&select=id&limit=1`);
    return rows.length > 0;
  }

  async phoneHashExists(phoneHash: string): Promise<boolean> {
    const rows = await this.selectRows(`phone_hash=eq.${encodeURIComponent(phoneHash)}&select=id&limit=1`);
    return rows.length > 0;
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const nowIso = new Date().toISOString();
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000).toString();
    const baseReferralCode = (input.referralCode ?? `${input.username}`)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
      .padEnd(6, "X");
    const referralCode = `${baseReferralCode}${randomSuffix}`;
    const rows = await this.query<SupabaseUserRow[]>("POST", "", {
      username: input.username,
      password_hash: input.passwordHash,
      phone_hash: input.phoneHash,
      display_name: null,
      bio: null,
      referral_code: referralCode,
      created_at: nowIso,
      updated_at: nowIso,
      password_changed_at: nowIso,
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Supabase create user failed.");
    }

    return this.toUserRecord(rows[0]);
  }

  async registerReferralActivation(referralCode: string, referredUserId: string): Promise<void> {
    const referrer = await this.findByReferralCode(referralCode);
    if (!referrer || referrer.id === referredUserId) {
      return;
    }

    const existing = await this.query<ReferralRow[]>(
      "GET",
      `referrer_user_id=eq.${encodeURIComponent(referrer.id)}&referred_user_id=eq.${encodeURIComponent(referredUserId)}&select=referrer_user_id,referred_user_id,status&limit=1`,
      undefined,
      "referrals"
    );

    if (existing.length > 0) {
      return;
    }

    await this.query(
      "POST",
      "",
      {
        referrer_user_id: referrer.id,
        referred_user_id: referredUserId,
        referral_code: referralCode.toUpperCase(),
        status: "activated",
        activated_at: new Date().toISOString(),
        reward_points: 30,
      },
      "referrals"
    );
  }

  async findOrCreateByStytchIdentity(input: StytchIdentityInput): Promise<UserRecord> {
    const mappingRows = await this.query<StytchMappingRow[]>(
      "GET",
      `stytch_user_id=eq.${encodeURIComponent(input.stytchUserId)}&select=user_id,stytch_user_id,email&limit=1`,
      undefined,
      "app_stytch_users"
    );

    if (mappingRows.length > 0) {
      const existing = await this.findById(mappingRows[0].user_id);
      if (existing) {
        return existing;
      }
    }

    const preferredUsername = normalizeStytchUsername(input.email);
    const username = await reserveAvailableUsername(preferredUsername, (candidate) => this.usernameExists(candidate));
    const phoneHash = `stytch:${input.stytchUserId}`;

    let user: UserRecord;
    try {
      user = await this.create({
        username,
        passwordHash: `stytch:${input.stytchUserId}`,
        phoneHash,
      });
    } catch {
      const rows = await this.selectRows(`phone_hash=eq.${encodeURIComponent(phoneHash)}&limit=1`);
      if (!rows.length) {
        throw new Error("Unable to create or locate Stytch user.");
      }
      user = this.toUserRecord(rows[0]);
    }

    await this.query(
      "POST",
      "on_conflict=stytch_user_id",
      {
        user_id: user.id,
        stytch_user_id: input.stytchUserId,
        email: input.email,
      },
      "app_stytch_users"
    );

    return user;
  }

  async updateProfile(userId: string, updates: UpdateUserProfileInput): Promise<UpdateProfileResult> {
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
    if (Object.prototype.hasOwnProperty.call(updates, "displayName")) {
      payload.display_name = updates.displayName ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(updates, "bio")) {
      payload.bio = updates.bio ?? null;
    }

    const rows = await this.query<SupabaseUserRow[]>("PATCH", `id=eq.${encodeURIComponent(userId)}`, payload);

    if (!Array.isArray(rows) || rows.length === 0) {
      return { status: "not_found" };
    }

    return { status: "ok", user: this.toUserRecord(rows[0]) };
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const rows = await this.query<SupabaseUserRow[]>("PATCH", `id=eq.${encodeURIComponent(userId)}`, {
      password_hash: passwordHash,
      password_changed_at: nowIso,
      updated_at: nowIso,
    });

    return Array.isArray(rows) && rows.length > 0;
  }

  private async selectRows(filters: string): Promise<SupabaseUserRow[]> {
    const hasSelect = filters.includes("select=");
    const query = hasSelect ? filters : `${filters}&select=*`;
    const rows = await this.query<SupabaseUserRow[]>("GET", query);
    return Array.isArray(rows) ? rows : [];
  }

  private async query<T>(
    method: "GET" | "POST" | "PATCH",
    queryString: string,
    body?: Record<string, unknown>,
    tableOverride?: string
  ): Promise<T> {
    const queryPrefix = queryString.length > 0 ? `?${queryString}` : "";
    const tableName = tableOverride ?? this.table;
    const url = `${this.baseUrl}/rest/v1/${tableName}${queryPrefix}`;
    const response = await fetch(url, {
      method,
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Accept-Profile": this.schema,
        "Content-Profile": this.schema,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(`Supabase query failed (${response.status}): ${reason}`);
    }

    return (await response.json()) as T;
  }

  private toUserRecord(row: SupabaseUserRow): UserRecord {
    const state = this.ensureRuntimeState(row.id);

    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      bio: row.bio,
      referralCode: row.referral_code,
      createdAt: Date.parse(row.created_at),
      updatedAt: Date.parse(row.updated_at),
      passwordChangedAt: Date.parse(row.password_changed_at),
      passwordHash: row.password_hash,
      phoneHash: row.phone_hash,
      votedPollIds: state.votedPollIds,
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
