import { supabase } from "../../lib/supabase";

export type ModerationReport = {
  id: string;
  reporter_id: string | null;
  target_user_id: string;
  resource_type: string | null;
  resource_id: string | null;
  reason: string;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
};

export type ModerationAction = {
  id: string;
  admin_id: string | null;
  target_user_id: string;
  action: string;
  resource_id: string | null;
  notes: string | null;
  created_at: string;
};

export type AdminAuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  subject_type: string | null;
  subject_id: string | null;
  payload: any;
  created_at: string;
};

export class ModerationRepository {
  async createReport(
    reporterId: string | null,
    targetUserId: string,
    reason: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<ModerationReport | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_reports")
        .insert({
          reporter_id: reporterId || null,
          target_user_id: targetUserId,
          reason,
          resource_type: resourceType || null,
          resource_id: resourceId || null,
          status: "open",
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to create report: ${error?.message}`);
      }

      return data as ModerationReport;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to create report");
    }
  }

  async getReport(reportId: string): Promise<ModerationReport | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = await supabase
        .from("moderation_reports")
        .select("*")
        .eq("id", reportId)
        .single();

      return data as ModerationReport;
    } catch {
      return null;
    }
  }

  async listReports(status?: string, limit: number = 50): Promise<ModerationReport[]> {
    if (!supabase) {
      return [];
    }

    try {
      let query = supabase
        .from("moderation_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq("status", status);
      }

      const { data } = await query;
      return (data || []) as ModerationReport[];
    } catch {
      return [];
    }
  }

  async resolveReport(
    reportId: string,
    adminId: string,
    resolution: string
  ): Promise<ModerationReport | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_reports")
        .update({
          status: "resolved",
          resolved_by: adminId,
          resolved_at: new Date().toISOString(),
          resolution,
        })
        .eq("id", reportId)
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to resolve report: ${error?.message}`);
      }

      return data as ModerationReport;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to resolve report");
    }
  }

  async dismissReport(reportId: string, adminId: string): Promise<ModerationReport | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_reports")
        .update({
          status: "dismissed",
          resolved_by: adminId,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId)
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to dismiss report: ${error?.message}`);
      }

      return data as ModerationReport;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to dismiss report");
    }
  }

  async warnUser(
    adminId: string,
    targetUserId: string,
    notes: string
  ): Promise<ModerationAction | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_actions")
        .insert({
          admin_id: adminId,
          target_user_id: targetUserId,
          action: "warn",
          notes,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to warn user: ${error?.message}`);
      }

      // Update user warnings
      const { data: user } = await supabase
        .from("users")
        .select("warnings")
        .eq("id", targetUserId)
        .single();

      if (user) {
        await supabase
          .from("users")
          .update({ warnings: (user.warnings || 0) + 1 })
          .eq("id", targetUserId);
      }

      await this.logAudit(adminId, "user.warn", "user", targetUserId, { notes });

      return data as ModerationAction;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to warn user");
    }
  }

  async banUser(
    adminId: string,
    targetUserId: string,
    notes: string
  ): Promise<ModerationAction | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_actions")
        .insert({
          admin_id: adminId,
          target_user_id: targetUserId,
          action: "ban",
          notes,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to ban user: ${error?.message}`);
      }

      // Update user status
      await supabase
        .from("users")
        .update({ status: "banned" })
        .eq("id", targetUserId);

      await this.logAudit(adminId, "user.ban", "user", targetUserId, { notes });

      return data as ModerationAction;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to ban user");
    }
  }

  async unbanUser(
    adminId: string,
    targetUserId: string,
    notes: string
  ): Promise<ModerationAction | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("moderation_actions")
        .insert({
          admin_id: adminId,
          target_user_id: targetUserId,
          action: "unban",
          notes,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to unban user: ${error?.message}`);
      }

      // Update user status
      await supabase
        .from("users")
        .update({ status: "active" })
        .eq("id", targetUserId);

      await this.logAudit(adminId, "user.unban", "user", targetUserId, { notes });

      return data as ModerationAction;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to unban user");
    }
  }

  async getActionHistory(targetUserId: string, limit: number = 50): Promise<ModerationAction[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("moderation_actions")
        .select("*")
        .eq("target_user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data || []) as ModerationAction[];
    } catch {
      return [];
    }
  }

  async logAudit(
    actorId: string | null,
    action: string,
    subjectType: string | null,
    subjectId: string | null,
    payload?: any
  ): Promise<AdminAuditLog | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .insert({
          actor_id: actorId || null,
          action,
          subject_type: subjectType || null,
          subject_id: subjectId || null,
          payload: payload || null,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to log audit: ${error?.message}`);
      }

      return data as AdminAuditLog;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to log audit");
    }
  }

  async getAuditLog(limit: number = 100): Promise<AdminAuditLog[]> {
    if (!supabase) {
      return [];
    }

    try {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data || []) as AdminAuditLog[];
    } catch {
      return [];
    }
  }
}
