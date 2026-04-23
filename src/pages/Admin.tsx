import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Ban, BellRing, CheckCircle2, Flag, Lock, Plus, Shield, Trash2, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRawStore } from "@/store/useRawStore";
import { track } from "@/lib/analytics";
import {
  createAdminPoll,
  deleteAdminPoll,
  formatAdminTimestamp,
  readAdminPolls,
  readChatReports,
  readCommunityJoinRequests,
  readCommunityRequests,
  readPersistedUsers,
  updateUserModerationStatus,
  writeChatReports,
  writeCommunityJoinRequests,
  writeCommunityRequests,
  type AdminPollRecord,
  type ChatReportRecord,
  type CommunityJoinRequestRecord,
  type CommunityRequestRecord,
  type PersistedUserRecord,
} from "@/lib/adminData";
import { approveCommunityJoinRequest, createCommunityFromApprovedRequest } from "@/lib/communityChat";

function SummaryCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-raw-border/30 bg-raw-surface/25 p-4 sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-raw-silver/35 sm:text-[11px] sm:tracking-[0.18em]">{label}</p>
      <p className="mt-2 font-display text-2xl text-raw-text sm:mt-3 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-raw-silver/45 leading-relaxed sm:mt-2 sm:text-sm">{hint}</p>
    </div>
  );
}

export default function Admin() {
  const { user, isLoggedIn, isAdmin, logout } = useRawStore();
  const [users, setUsers] = useState<PersistedUserRecord[]>([]);
  const [communityRequests, setCommunityRequests] = useState<CommunityRequestRecord[]>([]);
  const [chatReports, setChatReports] = useState<ChatReportRecord[]>([]);
  const [communityJoinRequests, setCommunityJoinRequests] = useState<CommunityJoinRequestRecord[]>([]);
  const [adminPolls, setAdminPolls] = useState<AdminPollRecord[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const refreshAdminData = useCallback(() => {
    setUsers(readPersistedUsers());
    setCommunityRequests(readCommunityRequests());
    setChatReports(readChatReports());
    setAdminPolls(readAdminPolls());
    setCommunityJoinRequests(readCommunityJoinRequests());
  }, []);

  useEffect(() => {
    refreshAdminData();
    window.addEventListener("focus", refreshAdminData);

    return () => {
      window.removeEventListener("focus", refreshAdminData);
    };
  }, [refreshAdminData]);

  const openReports = useMemo(() => chatReports.filter((report) => report.status === "open"), [chatReports]);
  const pendingRequests = useMemo(
    () => communityRequests.filter((request) => request.status === "pending"),
    [communityRequests]
  );
  const pendingJoinRequests = useMemo(
    () => communityJoinRequests.filter((r) => r.status === "pending"),
    [communityJoinRequests]
  );
  const bannedUsers = useMemo(() => users.filter((entry) => entry.moderationStatus === "banned"), [users]);

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-raw-black px-4 py-8 text-raw-text sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-raw-border/30 bg-raw-surface/20 p-5 text-center sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-raw-gold/65">Restricted</p>
          <h1 className="mt-4 font-display text-3xl tracking-wide">Admin access only</h1>
          <p className="mt-4 text-sm text-raw-silver/45">
            This hidden page is only available to accounts marked as admin.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/dashboard" className="rounded-xl bg-raw-gold px-5 py-3 text-sm font-semibold text-raw-ink">
              Back to dashboard
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-raw-border/30 px-5 py-3 text-sm text-raw-silver/70"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRequestStatus = (requestId: string, status: "approved" | "rejected") => {
    let approvedRequest: CommunityRequestRecord | null = null;
    const nextRequests = communityRequests.map((request) => {
      if (request.id !== requestId) {
        return request;
      }

      approvedRequest = {
        ...request,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user.username,
      };

      return approvedRequest;
    });

    setCommunityRequests(nextRequests);
    writeCommunityRequests(nextRequests);
    if (status === "approved" && approvedRequest) {
      createCommunityFromApprovedRequest(approvedRequest);
      track("admin_action_performed", { action: "approve_community", resource_id: requestId });
    } else if (status === "rejected") {
      track("admin_action_performed", { action: "reject_community", resource_id: requestId });
    }
    toast({
      title: status === "approved" ? "Community approved" : "Community rejected",
      description: status === "approved"
        ? "The request has been approved and is now live in Communities as a group chat."
        : `The request has been ${status} and removed from the pending queue.`,
    });
  };

  const handleJoinRequestStatus = (requestId: string, status: "approved" | "rejected") => {
    const target = communityJoinRequests.find((r) => r.id === requestId);
    if (!target) return;

    const nextRequests = communityJoinRequests.map((r) =>
      r.id === requestId
        ? { ...r, status, reviewedAt: new Date().toISOString(), reviewedBy: user.username }
        : r,
    );
    setCommunityJoinRequests(nextRequests);
    writeCommunityJoinRequests(nextRequests);

    if (status === "approved") {
      approveCommunityJoinRequest(target.communityId, target.requesterId, target.requesterName);
      track("admin_action_performed", { action: "approve_join_request", resource_id: requestId });
    } else {
      track("admin_action_performed", { action: "reject_join_request", resource_id: requestId });
    }

    toast({
      title: status === "approved" ? "Access granted" : "Request rejected",
      description: status === "approved"
        ? `@${target.requesterName} has been added to ${target.communityTitle}.`
        : `@${target.requesterName}'s request to join ${target.communityTitle} was rejected.`,
    });
  };

  const handleModeration = (reportId: string, action: "dismissed" | "warned" | "banned") => {
    const targetReport = chatReports.find((report) => report.id === reportId);
    if (!targetReport) {
      return;
    }

    if (action === "warned") {
      updateUserModerationStatus(targetReport.reportedUserId, "warned", user.username, 1);
      track("admin_action_performed", { action: "warn", target_user_id: targetReport.reportedUserId, resource_id: reportId });
    }

    if (action === "banned") {
      updateUserModerationStatus(targetReport.reportedUserId, "banned", user.username);
      track("admin_action_performed", { action: "ban", target_user_id: targetReport.reportedUserId, resource_id: reportId });
    }

    if (action === "dismissed") {
      track("admin_action_performed", { action: "dismiss_report", resource_id: reportId });
    }

    const nextReports = chatReports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            status: action,
            resolvedAt: new Date().toISOString(),
            resolvedBy: user.username,
          }
        : report
    );

    setChatReports(nextReports);
    writeChatReports(nextReports);
    refreshAdminData();
    toast({
      title: action === "dismissed" ? "Report dismissed" : action === "warned" ? "User warned" : "User banned",
      description: `${targetReport.reportedUsername} has been reviewed by admin.`,
    });
  };

  const handleCreatePoll = () => {
    const filledOptions = pollOptions.filter((o) => o.trim().length > 0);
    if (!pollQuestion.trim() || filledOptions.length < 2) {
      toast({ title: "Fill in the question and at least 2 options." });
      return;
    }
    createAdminPoll(pollQuestion, filledOptions);
    setAdminPolls(readAdminPolls());
    setPollQuestion("");
    setPollOptions(["", ""]);
    toast({ title: "Poll created", description: "It will appear in the daily poll feed." });
  };

  const handleDeletePoll = (pollId: string) => {
    deleteAdminPoll(pollId);
    setAdminPolls(readAdminPolls());
    toast({ title: "Poll deleted" });
  };

  return (
    <div className="min-h-screen bg-raw-black text-raw-text">
      <div className="border-b border-raw-border/30 bg-raw-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-raw-gold/65">Hidden admin page</p>
            <h1 className="mt-2 font-display text-2xl tracking-wide sm:text-3xl">Moderation dashboard</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-raw-border/30 px-3 py-2 text-sm text-raw-silver/70 transition-colors hover:text-raw-text sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <button onClick={logout} className="rounded-xl bg-raw-gold px-3 py-2 text-sm font-semibold text-raw-ink sm:px-4">
              Log out
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 sm:space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <SummaryCard label="Users" value={users.length} hint="All locally registered accounts, including admin and reported aliases." />
          <SummaryCard label="Pending Requests" value={pendingRequests.length} hint="Community creation requests waiting for admin approval." />
          <SummaryCard label="Join Requests" value={pendingJoinRequests.length} hint="Pending requests to join locked communities." />
          <SummaryCard label="Open Reports" value={openReports.length} hint="Chat reports still awaiting a moderation decision." />
          <SummaryCard label="Banned Users" value={bannedUsers.length} hint="Accounts currently blocked from chatting after review." />
        </div>

        <section className="rounded-2xl border border-raw-border/30 bg-raw-surface/20 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-raw-gold/70" />
            <div>
              <h2 className="font-display text-xl tracking-wide">Users</h2>
              <p className="mt-1 text-sm text-raw-silver/45">Every locally known user account and its current moderation state.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {users.length === 0 ? (
              <div className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4 text-sm text-raw-silver/45">No users yet.</div>
            ) : (
              users.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-2 rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-base text-raw-text">@{entry.username}</p>
                    <p className="mt-1 text-xs text-raw-silver/40 leading-relaxed">
                      Role: {entry.role} · Warnings: {entry.warnings} · Last seen {formatAdminTimestamp(entry.lastSeenAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                      entry.moderationStatus === "active"
                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200"
                        : entry.moderationStatus === "warned"
                          ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
                          : "border-red-400/20 bg-red-500/10 text-red-200"
                    }`}>
                      {entry.moderationStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-raw-border/30 bg-raw-surface/20 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-raw-gold/70" />
            <div>
              <h2 className="font-display text-xl tracking-wide">Community requests</h2>
              <p className="mt-1 text-sm text-raw-silver/45">Approve or reject requests for new communities before they go live.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {communityRequests.length === 0 ? (
              <div className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4 text-sm text-raw-silver/45">No requests submitted yet.</div>
            ) : (
              communityRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg text-raw-text">{request.communityName}</p>
                      <p className="mt-1 text-sm text-raw-silver/45">Requested by @{request.requesterName} · {formatAdminTimestamp(request.submittedAt)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                      request.status === "pending"
                        ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
                        : request.status === "approved"
                          ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200"
                          : "border-red-400/20 bg-red-500/10 text-red-200"
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Focus</p>
                      <p className="mt-2 text-sm text-raw-silver/60">{request.focusArea}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Audience</p>
                      <p className="mt-2 text-sm text-raw-silver/60">{request.audience}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Why now</p>
                    <p className="mt-2 text-sm leading-relaxed text-raw-silver/60">{request.whyNow}</p>
                  </div>

                  {request.samplePrompt && (
                    <div className="mt-4 rounded-2xl border border-raw-border/20 bg-raw-surface/20 p-4 text-sm text-raw-silver/55">
                      “{request.samplePrompt}”
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <Button onClick={() => handleRequestStatus(request.id, "approved")} className="rounded-xl bg-emerald-400 px-4 text-raw-ink hover:bg-emerald-300">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleRequestStatus(request.id, "rejected")} className="rounded-xl bg-red-400 px-4 text-raw-ink hover:bg-red-300">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-raw-border/30 bg-raw-surface/20 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-raw-gold/70" />
            <div>
              <h2 className="font-display text-xl tracking-wide">Join requests</h2>
              <p className="mt-1 text-sm text-raw-silver/45">Approve or reject user requests to join locked communities.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {communityJoinRequests.length === 0 ? (
              <div className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4 text-sm text-raw-silver/45">No join requests yet.</div>
            ) : (
              communityJoinRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg text-raw-text">{request.communityTitle}</p>
                      <p className="mt-1 text-sm text-raw-silver/45">
                        Requested by @{request.requesterName} · {formatAdminTimestamp(request.submittedAt)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                      request.status === "pending"
                        ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
                        : request.status === "approved"
                          ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200"
                          : "border-red-400/20 bg-red-500/10 text-red-200"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  {request.status === "pending" && (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <Button onClick={() => handleJoinRequestStatus(request.id, "approved")} className="rounded-xl bg-emerald-400 px-4 text-raw-ink hover:bg-emerald-300">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleJoinRequestStatus(request.id, "rejected")} className="rounded-xl bg-red-400 px-4 text-raw-ink hover:bg-red-300">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                  {request.status !== "pending" && (
                    <p className="mt-3 text-xs text-raw-silver/40">
                      Reviewed by @{request.reviewedBy ?? "admin"}{request.reviewedAt ? ` · ${formatAdminTimestamp(request.reviewedAt)}` : ""}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-raw-border/30 bg-raw-surface/20 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-raw-gold/70" />
            <div>
              <h2 className="font-display text-xl tracking-wide">Create poll</h2>
              <p className="mt-1 text-sm text-raw-silver/45">Add a new poll with its answer options. It will show up in the daily feed.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <input
              type="text"
              placeholder="Poll question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full rounded-xl border border-raw-border/30 bg-raw-black/50 px-4 py-3 text-sm text-raw-text placeholder-raw-silver/30 outline-none focus:border-raw-gold/40"
            />
            {pollOptions.map((option, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={i === 0 ? "No" : i === 1 ? "Yes" : `Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  className="flex-1 rounded-xl border border-raw-border/30 bg-raw-black/50 px-4 py-3 text-sm text-raw-text placeholder-raw-silver/30 outline-none focus:border-raw-gold/40"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                    className="rounded-xl border border-raw-border/30 px-3 text-raw-silver/40 hover:text-red-400"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={() => setPollOptions([...pollOptions, ""])}
                className="text-xs text-raw-silver/40 hover:text-raw-silver/70"
              >
                + Add option
              </button>
            </div>
            <Button onClick={handleCreatePoll} className="rounded-xl bg-raw-gold px-5 text-raw-ink hover:bg-raw-gold/90">
              <Plus className="h-4 w-4" /> Create poll
            </Button>
          </div>

          {adminPolls.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Existing polls</p>
              {adminPolls.map((poll) => (
                <div key={poll.id} className="flex items-start justify-between gap-4 rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4">
                  <div>
                    <p className="text-sm text-raw-text">{poll.question}</p>
                    <p className="mt-1 text-xs text-raw-silver/40">{poll.options.map((o) => o.text).join(" · ")} · {formatAdminTimestamp(poll.createdAt)}</p>
                  </div>
                  <button onClick={() => handleDeletePoll(poll.id)} className="shrink-0 text-raw-silver/30 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-raw-border/30 bg-raw-surface/20 p-4 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-raw-gold/70" />
            <div>
              <h2 className="font-display text-xl tracking-wide">Chat reports</h2>
              <p className="mt-1 text-sm text-raw-silver/45">Review reported chat messages, then dismiss, warn, or ban after moderation review.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {chatReports.length === 0 ? (
              <div className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-4 text-sm text-raw-silver/45">No reports in the queue yet.</div>
            ) : (
              chatReports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-raw-border/20 bg-raw-black/35 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg text-raw-text">{report.communityTitle}</p>
                      <p className="mt-1 text-sm text-raw-silver/45">
                        Reported by @{report.reporterName} against @{report.reportedUsername} · {formatAdminTimestamp(report.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                      report.status === "open"
                        ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
                        : report.status === "dismissed"
                          ? "border-raw-border/30 bg-raw-surface/20 text-raw-silver/60"
                          : report.status === "warned"
                            ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
                            : "border-red-400/20 bg-red-500/10 text-red-200"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-raw-border/20 bg-raw-surface/20 p-4 text-sm text-raw-silver/55">
                    “{report.messageText}”
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Reason</p>
                      <p className="mt-2 text-sm text-raw-silver/60">{report.reason}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-raw-silver/35">Reporter note</p>
                      <p className="mt-2 text-sm text-raw-silver/60">{report.details || "No extra context provided."}</p>
                    </div>
                  </div>

                  {report.status === "open" ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => handleModeration(report.id, "dismissed")} variant="outline" className="rounded-xl border-raw-border/30 bg-transparent text-raw-silver/70 hover:bg-raw-surface/30 hover:text-raw-text">
                        <XCircle className="h-4 w-4" /> Dismiss
                      </Button>
                      <Button onClick={() => handleModeration(report.id, "warned")} className="rounded-xl bg-amber-400 px-4 text-raw-ink hover:bg-amber-300">
                        <BellRing className="h-4 w-4" /> Warn user
                      </Button>
                      <Button onClick={() => handleModeration(report.id, "banned")} className="rounded-xl bg-red-400 px-4 text-raw-ink hover:bg-red-300">
                        <Ban className="h-4 w-4" /> Ban user
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-raw-silver/40">
                      Reviewed by @{report.resolvedBy ?? "admin"}{report.resolvedAt ? ` · ${formatAdminTimestamp(report.resolvedAt)}` : ""}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}