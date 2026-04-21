import { SupabaseRestRepository } from "./supabaseRest";
import type { CommunityView } from "../types";

type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

type CommunityMemberRow = {
  community_id: string;
};

export class CommunitiesRepository extends SupabaseRestRepository {
  async listActive(userId: string): Promise<CommunityView[]> {
    const communities = await this.request<CommunityRow[]>(
      "GET",
      "app_communities",
      "is_active=eq.true&select=id,slug,name,description&order=name.asc"
    );

    if (!communities.length) {
      return [];
    }

    const memberships = await this.request<CommunityMemberRow[]>(
      "GET",
      "app_community_members",
      `user_id=eq.${encodeURIComponent(userId)}&select=community_id`
    );
    const joinedSet = new Set(memberships.map((row) => row.community_id));

    const memberCountRows = await Promise.all(
      communities.map(async (community) => {
        const rows = await this.request<CommunityMemberRow[]>(
          "GET",
          "app_community_members",
          `community_id=eq.${encodeURIComponent(community.id)}&select=community_id`
        );
        return [community.id, rows.length] as const;
      })
    );

    const memberCountMap = new Map<string, number>(memberCountRows);

    return communities.map((community) => ({
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description,
      joined: joinedSet.has(community.id),
      memberCount: memberCountMap.get(community.id) ?? 0,
    }));
  }

  async joinCommunity(userId: string, communityId: string): Promise<void> {
    const existing = await this.request<CommunityMemberRow[]>(
      "GET",
      "app_community_members",
      `user_id=eq.${encodeURIComponent(userId)}&community_id=eq.${encodeURIComponent(communityId)}&select=community_id&limit=1`
    );

    if (existing.length > 0) {
      return;
    }

    await this.request("POST", "app_community_members", "", {
      user_id: userId,
      community_id: communityId,
    });
  }
}
