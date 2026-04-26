import { supabase } from './supabase';
import type { AuthSessionData, BootstrapResponse, Poll, User, UserRecord } from "../types";

export async function findUserById(userId: string): Promise<UserRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  
  const { data: votes } = await supabase
    .from('poll_answers')
    .select('poll_id')
    .eq('user_id', data.id);

  return {
    id: data.id,
    username: data.username,
    passwordHash: data.password_hash || '',
    phoneHash: data.phone_hash || '',
    votedPollIds: new Set(votes?.map(v => v.poll_id) || []),
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error || !data) return null;
  
  const { data: votes } = await supabase
    .from('poll_answers')
    .select('poll_id')
    .eq('user_id', data.id);

  return {
    id: data.id,
    username: data.username,
    passwordHash: data.password_hash || '',
    phoneHash: data.phone_hash || '',
    votedPollIds: new Set(votes?.map(v => v.poll_id) || []),
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function usernameExists(username: string): Promise<boolean> {
  if (!supabase) return false;
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('username', username.toLowerCase());
  
  return !error && count !== null && count > 0;
}

export async function phoneHashExists(phoneHash: string): Promise<boolean> {
  if (!supabase) return false;
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('phone_hash', phoneHash);
  
  return !error && count !== null && count > 0;
}

export async function createUser(username: string, passwordHash: string, phoneHash: string): Promise<UserRecord> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      username: username.toLowerCase(),
      password_hash: passwordHash,
      phone_hash: phoneHash,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    username: data.username,
    passwordHash: data.password_hash,
    phoneHash: data.phone_hash,
    votedPollIds: new Set(),
    createdAt: new Date(data.created_at).getTime(),
  };
}

export async function getPolls(): Promise<Poll[]> {
  if (!supabase) return [];
  const { data: polls, error: pollError } = await supabase
    .from('polls')
    .select(`
      id,
      question,
      poll_options (
        id,
        option_text
      )
    `);

  if (pollError || !polls) return [];

  const { data: voteCounts, error: voteError } = await supabase
    .from('poll_answers')
    .select('option_id');

  if (voteError) return [];

  const countsMap = (voteCounts || []).reduce((acc: Record<string, number>, vote) => {
    acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
    return acc;
  }, {});

  return polls.map((poll: any) => ({
    id: poll.id,
    question: poll.question,
    options: poll.poll_options.map((opt: any) => ({
      id: opt.id,
      text: opt.option_text,
      votes: countsMap[opt.id] || 0
    })),
    locked: false
  }));
}

export function getAnonymousVotes(sessionData: AuthSessionData): string[] {
  if (!Array.isArray(sessionData.anonymousVotes)) {
    sessionData.anonymousVotes = [];
  }
  return sessionData.anonymousVotes;
}

export async function buildBootstrap(user: UserRecord | null, sessionData: AuthSessionData): Promise<BootstrapResponse> {
  const polls = await getPolls();
  const votedPollIds = user ? Array.from(user.votedPollIds) : getAnonymousVotes(sessionData);

  return {
    user: user ? { id: user.id, username: user.username } : null,
    isLoggedIn: Boolean(user),
    polls,
    votedPollIds,
    freeVotesUsed: votedPollIds.length,
  };
}

export async function canVote(user: UserRecord | null, sessionData: AuthSessionData, pollId: string) {
  if (user) {
    if (user.votedPollIds.has(pollId)) {
      return { ok: false, reason: "already_voted" as const };
    }
    return { ok: true as const };
  }

  const anonVotes = getAnonymousVotes(sessionData);
  if (anonVotes.includes(pollId)) {
    return { ok: false, reason: "already_voted" as const };
  }

  if (anonVotes.length >= 3) {
    return { ok: false, reason: "auth_required" as const };
  }

  return { ok: true as const };
}

export async function applyVote(user: UserRecord | null, sessionData: AuthSessionData, pollId: string, optionId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('poll_answers')
    .insert({
      poll_id: pollId,
      user_id: user?.id || null,
      option_id: optionId
    });

  if (error) return false;

  if (!user) {
    getAnonymousVotes(sessionData).push(pollId);
  } else {
    // Update traits based on vote
    await updateTraits(user.id, { [`last_vote_${pollId}`]: optionId });
  }

  return true;
}

export async function updateTraits(userId: string, traits: any) {
  if (!supabase) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('traits')
    .eq('id', userId)
    .single();

  const newTraits = { ...(profile?.traits || {}), ...traits };

  await supabase
    .from('profiles')
    .update({ traits: newTraits })
    .eq('id', userId);
}

export async function trackEvent(userId: string | null, eventName: string, metadata: any = {}) {
  if (!supabase) return;

  await supabase
    .from('user_events')
    .insert({
      user_id: userId,
      event_name: eventName,
      metadata
    });
}

export async function joinCommunity(userId: string, communityId: string) {
  if (!supabase) return;

  await supabase
    .from('community_memberships')
    .insert({
      user_id: userId,
      community_id: communityId,
      role: 'member'
    });
}
