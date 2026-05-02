import { supabase } from '../client';

export interface WaitlistSummary {
  counts: Record<string, number>;
  joinedCommunityIds: Set<string>;
}

type DbWaitlistRow = {
  community_id: string;
  user_id: string;
};

export async function fetchWaitlistSummary(userId: string): Promise<WaitlistSummary> {
  const { data, error } = await supabase
    .from('community_waitlist')
    .select('community_id, user_id');

  if (error) throw error;

  const counts: Record<string, number> = {};
  const joinedCommunityIds = new Set<string>();
  for (const row of (data ?? []) as DbWaitlistRow[]) {
    counts[row.community_id] = (counts[row.community_id] ?? 0) + 1;
    if (row.user_id === userId) {
      joinedCommunityIds.add(row.community_id);
    }
  }

  return { counts, joinedCommunityIds };
}

export async function joinCommunityWaitlist(
  communityId: string,
  userId: string,
  username: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('join_community_waitlist', {
    p_community_id: communityId,
    p_user_id: userId,
    p_username: username,
  });

  if (error) throw error;
  return typeof data === 'number' ? data : Number(data ?? 0);
}
