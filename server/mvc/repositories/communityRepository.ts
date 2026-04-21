import { supabase } from "../../lib/supabase";

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  member_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityMember = {
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

export class CommunityRepository {
  async getCommunity(communityId: string): Promise<Community | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .eq("status", "active")
        .single();

      if (error || !data) {
        return null;
      }

      return data as Community;
    } catch {
      return null;
    }
  }

  async getCommunityBySlug(slug: string): Promise<Community | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (error || !data) {
        return null;
      }

      return data as Community;
    } catch {
      return null;
    }
  }

  async listCommunities(limit: number = 20, offset: number = 0): Promise<Community[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("communities")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return (data || []) as Community[];
    } catch {
      return [];
    }
  }

  async createCommunity(
    slug: string,
    name: string,
    description: string,
    userId: string
  ): Promise<Community | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("communities")
        .insert({
          slug,
          name,
          description,
          status: "active",
          created_by: userId,
          member_count: 1,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create community: ${error?.message}`);
      }

      // Add creator as owner
      await supabase.from("community_members").insert({
        community_id: data.id,
        user_id: userId,
        role: "owner",
      });

      return data as Community;
    } catch (e) {
      return null;
    }
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMember | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data: existingMember } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        return existingMember as CommunityMember;
      }

      const { data, error } = await supabase
        .from("community_members")
        .insert({
          community_id: communityId,
          user_id: userId,
          role: "member",
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to join community: ${error?.message}`);
      }

      // Increment member count
      const { data: community } = await supabase
        .from("communities")
        .select("member_count")
        .eq("id", communityId)
        .single();

      if (community) {
        await supabase
          .from("communities")
          .update({ member_count: (community.member_count || 0) + 1 })
          .eq("id", communityId);
      }

      return data as CommunityMember;
    } catch {
      return null;
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);

      if (!error) {
        // Decrement member count
        const { data: community } = await supabase
          .from("communities")
          .select("member_count")
          .eq("id", communityId)
          .single();

        if (community && community.member_count > 0) {
          await supabase
            .from("communities")
            .update({ member_count: community.member_count - 1 })
            .eq("id", communityId);
        }
      }

      return !error;
    } catch {
      return false;
    }
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);

      if (!memberships || memberships.length === 0) {
        return [];
      }

      const communityIds = memberships.map((m: any) => m.community_id);

      const { data: communities } = await supabase
        .from("communities")
        .select("*")
        .in("id", communityIds)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      return (communities || []) as Community[];
    } catch {
      return [];
    }
  }

  async getCommunityMembers(communityId: string, limit: number = 50): Promise<string[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("community_members")
        .select("user_id")
        .eq("community_id", communityId)
        .limit(limit);

      return (data || []).map((m: any) => m.user_id);
    } catch {
      return [];
    }
  }

  async isMember(communityId: string, userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  async addMessage(communityId: string, userId: string, body: string): Promise<any> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("community_messages")
        .insert({
          community_id: communityId,
          user_id: userId,
          body,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to add message: ${error?.message}`);
      }

      return data;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to add message");
    }
  }

  async getMessages(communityId: string, limit: number = 50): Promise<any[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data || []).reverse();
    } catch {
      return [];
    }
  }
}
