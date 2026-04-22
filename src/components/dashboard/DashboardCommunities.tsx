import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import lntCoverVideo from "@/assets/2026-04-18 10_10_00.MP4";
import { AlertTriangle, ArrowLeft, Bell, BellOff, Clock3, Heart, MessageCircle, Plus, Reply, Search, Send, Trash2, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CommunityBadge } from "@/components/dashboard/CommunityBadge";
import {
  ensureUserRecord,
  formatAdminTimestamp,
  getPersistedUserById,
  readChatReports,
  readCommunityRequests,
  writeChatReports,
  writeCommunityRequests,
  type ChatReportRecord,
  type CommunityRequestRecord,
} from "@/lib/adminData";
import {
  canManageCommunity,
  countUnreadMessages,
  countOnlineMembers,
  deleteCommunityMessage,
  formatChatDayLabel,
  formatChatTimestamp,
  joinCommunityChat,
  markCommunityRead,
  readCommunityChats,
  sendCommunityMessage,
  setCommunityNotifications,
  touchCommunityMemberActivity,
  updateCommunityPresentation,
  type CommunityChatMessageRecord,
  type PersistedCommunityRecord,
} from "@/lib/communityChat";
import type { User } from "@/store/useRawStore";

interface DashboardCommunitiesProps {
  user: User;
  activeCommunityId?: string | null;
  onOpenCommunity: (communityId: string) => void;
  onBackToCommunities?: () => void;
}

interface CommunityRequestDraft {
  communityName: string;
  focusArea: string;
  audience: string;
  whyNow: string;
  samplePrompt: string;
}

interface ReportDraft {
  reason: string;
  details: string;
}

interface ReportTarget {
  communityId: string;
  communityTitle: string;
  message: CommunityChatMessageRecord;
}

interface CommunitySettingsDraft {
  title: string;
  logoUrl: string;
}

const INITIAL_REQUEST_DRAFT: CommunityRequestDraft = {
  communityName: "",
  focusArea: "",
  audience: "",
  whyNow: "",
  samplePrompt: "",
};

const INITIAL_REPORT_DRAFT: ReportDraft = {
  reason: "",
  details: "",
};

const INITIAL_COMMUNITY_SETTINGS_DRAFT: CommunitySettingsDraft = {
  title: "",
  logoUrl: "",
};

const FEATURED_DIRECTORY_COMMUNITY_IDS = ["lnt", "sic", "mw"] as const;

const COMMUNITY_COVER_IMAGES: Record<string, string> = {
  sic: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  mw: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
};

const COMMUNITY_COVER_VIDEOS: Record<string, string> = {
  lnt: lntCoverVideo,
};

export function DashboardCommunities({
  user,
  activeCommunityId = null,
  onOpenCommunity,
  onBackToCommunities,
}: DashboardCommunitiesProps) {
  const [communities, setCommunities] = useState<PersistedCommunityRecord[]>(() => readCommunityChats());
  const [messageDraft, setMessageDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDescs, setExpandedDescs] = useState<Set<string>>(new Set());
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [communitySettingsDraft, setCommunitySettingsDraft] = useState<CommunitySettingsDraft>(INITIAL_COMMUNITY_SETTINGS_DRAFT);
  const [requestDraft, setRequestDraft] = useState<CommunityRequestDraft>(INITIAL_REQUEST_DRAFT);
  const [reportDraft, setReportDraft] = useState<ReportDraft>(INITIAL_REPORT_DRAFT);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [replyTarget, setReplyTarget] = useState<CommunityChatMessageRecord | null>(null);
  const [likedMessageIds, setLikedMessageIds] = useState<Set<string>>(() => new Set());
  const [communityRequests, setCommunityRequests] = useState<CommunityRequestRecord[]>([]);
  const [chatReports, setChatReports] = useState<ChatReportRecord[]>([]);
  const lastTouchedCommunityRef = useRef<string>("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const reloadChatData = useCallback(() => {
      setCommunities(readCommunityChats());
      setCommunityRequests(readCommunityRequests());
      setChatReports(readChatReports());
    }, []);

    const selectedCommunity = useMemo(
      () => activeCommunityId ? communities.find((community) => community.id === activeCommunityId) ?? null : null,
      [activeCommunityId, communities]
    );
    const userRequests = useMemo(
      () => communityRequests.filter((request) => request.requesterId === user.id),
      [communityRequests, user.id]
    );
    const activePendingRequest = userRequests.find((request) => request.status === "pending") ?? null;
    const currentUserRecord = useMemo(() => getPersistedUserById(user.id), [user.id, chatReports]);
    const isUserBanned = (currentUserRecord?.moderationStatus ?? user.moderationStatus) === "banned";
    const warningCount = currentUserRecord?.warnings ?? user.warnings;
    const currentMember = selectedCommunity?.members.find((member) => member.userId === user.id) ?? null;
    const isJoined = Boolean(currentMember);
    const canEditSelectedCommunity = selectedCommunity ? canManageCommunity(selectedCommunity, user.id, user.username) : false;
    const onlineNow = selectedCommunity ? countOnlineMembers(selectedCommunity) : 0;
    const visibleMembers = selectedCommunity?.members.slice(0, 5) ?? [];
    const unreadCount = selectedCommunity && isJoined ? countUnreadMessages(selectedCommunity, user.id) : 0;

    const activeMessages = selectedCommunity?.messages ?? [];
    const filteredMessages = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        return activeMessages;
      }

      return activeMessages.filter((message) => {
        const haystacks = [message.senderName, message.text, message.replyToSenderName, message.replyToText]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystacks.includes(query);
      });
    }, [activeMessages, searchQuery]);
    const latestMessage = activeMessages[activeMessages.length - 1];
    const groupedMessages = useMemo(() => {
      const groups: Array<{ label: string; messages: CommunityChatMessageRecord[] }> = [];

      filteredMessages.forEach((message) => {
        const label = formatChatDayLabel(message.createdAt);
        const currentGroup = groups[groups.length - 1];
        if (!currentGroup || currentGroup.label !== label) {
          groups.push({ label, messages: [message] });
          return;
        }

        currentGroup.messages.push(message);
      });

      return groups;
    }, [filteredMessages]);

    const directoryCommunities = useMemo(() => {
      const featuredSet = new Set(FEATURED_DIRECTORY_COMMUNITY_IDS);
      return communities.filter((community) => featuredSet.has(community.id as (typeof FEATURED_DIRECTORY_COMMUNITY_IDS)[number]));
    }, [communities]);

    useEffect(() => {
      setSearchQuery("");
      setReplyTarget(null);
    }, [activeCommunityId]);

    useEffect(() => {
      reloadChatData();

      const handleStorage = (event: StorageEvent) => {
        if (!event.key || event.key.startsWith("raw.community") || event.key === "raw.chat-reports.v1") {
          reloadChatData();
        }
      };

      window.addEventListener("focus", reloadChatData);
      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("focus", reloadChatData);
        window.removeEventListener("storage", handleStorage);
      };
    }, [reloadChatData]);

    useEffect(() => {
      if (!selectedCommunity || !isJoined) {
        return;
      }

      const touchKey = `${selectedCommunity.id}:${user.id}`;
      if (lastTouchedCommunityRef.current === touchKey) {
        return;
      }

      touchCommunityMemberActivity(selectedCommunity.id, { userId: user.id, username: user.username });
      lastTouchedCommunityRef.current = touchKey;
      reloadChatData();
    }, [isJoined, reloadChatData, selectedCommunity, user.id, user.username]);

    useEffect(() => {
      if (!selectedCommunity || !isJoined || unreadCount === 0) {
        return;
      }

      markCommunityRead(selectedCommunity.id, user.id);
      reloadChatData();
    }, [isJoined, reloadChatData, selectedCommunity, unreadCount, user.id]);

    useLayoutEffect(() => {
      if (!messagesContainerRef.current || searchQuery.trim()) {
        return;
      }

      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [activeMessages, activeCommunityId, searchQuery]);

    const handleJoinCommunity = (communityId: string, shouldOpenPage = false) => {
      const targetCommunity = communities.find((community) => community.id === communityId);
      if (!targetCommunity) {
        return;
      }

      joinCommunityChat(communityId, { userId: user.id, username: user.username });
      lastTouchedCommunityRef.current = `${communityId}:${user.id}`;
      reloadChatData();
      toast({
        title: `Joined ${targetCommunity.title}`,
        description: "You can now chat in this group and receive notifications.",
      });

      if (shouldOpenPage) {
        onOpenCommunity(communityId);
      }
    };

    const handleSendMessage = () => {
      if (!selectedCommunity) {
        return;
      }

      if (!isJoined) {
        toast({
          title: "Join the group first",
          description: `Enter ${selectedCommunity.title} before sending messages.`,
        });
        return;
      }

      if (isUserBanned) {
        toast({
          title: "Chat access restricted",
          description: "Your account is currently banned from posting while admin review remains in effect.",
        });
        return;
      }

      const trimmedMessage = messageDraft.trim();
      if (!trimmedMessage) {
        return;
      }

      sendCommunityMessage(selectedCommunity.id, {
        senderId: user.id,
        senderName: user.username,
        text: trimmedMessage,
        replyToMessage: replyTarget,
      });
      reloadChatData();
      setMessageDraft("");
      setReplyTarget(null);
    };

    const handleDeleteMessage = (message: CommunityChatMessageRecord) => {
      if (!selectedCommunity || message.senderId !== user.id || message.deletedAt) {
        return;
      }

      deleteCommunityMessage(selectedCommunity.id, message.id, user.id);
      reloadChatData();
      if (replyTarget?.id === message.id) {
        setReplyTarget(null);
      }
      toast({
        title: "Message deleted",
        description: "Your message was removed from the group chat.",
      });
    };

    const handleCommunitySettingsSave = () => {
      if (!selectedCommunity || !canEditSelectedCommunity) {
        toast({
          title: "Creator access required",
          description: "Only the community creator can change the group name or logo.",
        });
        return;
      }

      const trimmedTitle = communitySettingsDraft.title.trim();
      if (!trimmedTitle) {
        toast({
          title: "Name required",
          description: "Add a community name before saving these changes.",
        });
        return;
      }

      const updatedCommunity = updateCommunityPresentation(selectedCommunity.id, {
        actorUserId: user.id,
        actorUsername: user.username,
        title: trimmedTitle,
        logoUrl: communitySettingsDraft.logoUrl,
      });

      if (!updatedCommunity) {
        toast({
          title: "Creator access required",
          description: "Only the community creator can change the group name or logo.",
        });
        return;
      }

      reloadChatData();
      setLogoDialogOpen(false);
      toast({
        title: "Community updated",
        description: `${updatedCommunity.title} now shows the latest name and logo across the app.`,
      });
    };

    const toggleMessageLike = (messageId: string) => {
      setLikedMessageIds((previous) => {
        const next = new Set(previous);
        if (next.has(messageId)) {
          next.delete(messageId);
        } else {
          next.add(messageId);
        }
        return next;
      });
    };

    const handleSubmitReport = () => {
      if (!reportTarget) {
        return;
      }

      const reason = reportDraft.reason.trim();
      const details = reportDraft.details.trim();
      if (!reason) {
        toast({
          title: "Add a report reason",
          description: "Tell the admin team why this message should be reviewed.",
        });
        return;
      }

      const reportedUser = ensureUserRecord(reportTarget.message.senderName);
      const nextReport: ChatReportRecord = {
        id: `chat-report-${Date.now()}`,
        communityId: reportTarget.communityId,
        communityTitle: reportTarget.communityTitle,
        messageId: reportTarget.message.id,
        messageText: reportTarget.message.text,
        reportedUserId: reportTarget.message.senderId || reportedUser.id,
        reportedUsername: reportTarget.message.senderName,
        reporterId: user.id,
        reporterName: user.username,
        reason,
        details,
        createdAt: new Date().toISOString(),
        status: "open",
      };

      setChatReports((previous) => {
        const nextReports = [nextReport, ...previous];
        writeChatReports(nextReports);
        return nextReports;
      });
      setReportDialogOpen(false);
      setReportTarget(null);
      setReportDraft(INITIAL_REPORT_DRAFT);
      toast({
        title: "Report sent for review",
        description: `The message from ${nextReport.reportedUsername} is now in the admin review queue.`,
      });
    };

    const updateRequestDraft = <K extends keyof CommunityRequestDraft>(field: K, value: CommunityRequestDraft[K]) => {
      setRequestDraft((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

    const handleSubmitCommunityRequest = () => {
      if (activePendingRequest) {
        toast({
          title: "Request already pending",
          description: `Your request for ${activePendingRequest.communityName} is still waiting for admin review.`,
        });
        return;
      }

      const trimmedDraft = {
        communityName: requestDraft.communityName.trim(),
        focusArea: requestDraft.focusArea.trim(),
        audience: requestDraft.audience.trim(),
        whyNow: requestDraft.whyNow.trim(),
        samplePrompt: requestDraft.samplePrompt.trim(),
      };

      if (!trimmedDraft.communityName || !trimmedDraft.focusArea || !trimmedDraft.audience || !trimmedDraft.whyNow) {
        toast({
          title: "Complete the request form",
          description: "Add the community name, focus, intended members, and your reason before submitting.",
        });
        return;
      }

      const nextRequest: CommunityRequestRecord = {
        id: `community-request-${Date.now()}`,
        requesterId: user.id,
        requesterName: user.username,
        communityName: trimmedDraft.communityName,
        focusArea: trimmedDraft.focusArea,
        audience: trimmedDraft.audience,
        whyNow: trimmedDraft.whyNow,
        samplePrompt: trimmedDraft.samplePrompt,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      setCommunityRequests((previous) => {
        const nextRequests = [nextRequest, ...previous];
        writeCommunityRequests(nextRequests);
        return nextRequests;
      });
      setRequestDraft(INITIAL_REQUEST_DRAFT);
      setRequestFormOpen(false);
      toast({
        title: "Request sent to admin",
        description: `${nextRequest.communityName} is now pending review. We will keep you posted in this dashboard.`,
      });
    };

    const renderDirectoryView = () => (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-xl tracking-wide text-raw-text sm:text-2xl">Communities</h1>
            <p className="mt-2 text-xs text-raw-silver/40 sm:text-sm">
              Join any room from here to start chatting with like minded peers. Don't see a community that fits? Request a new one and we'll review it for you.
            </p>
            {(warningCount > 0 || isUserBanned) && (
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                isUserBanned
                  ? "border-red-400/20 bg-red-500/10 text-red-200"
                  : "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
              }`}>
                <AlertTriangle className="h-3.5 w-3.5" />
                {isUserBanned ? "Account banned after moderation review" : `${warningCount} warning${warningCount === 1 ? "" : "s"} on your account`}
              </div>
            )}
          </div>

          <Button
            onClick={() => setRequestFormOpen(true)}
            className="h-11 w-full shrink-0 rounded-xl bg-raw-gold px-4 text-sm font-semibold text-raw-ink hover:bg-raw-gold/90 md:w-auto"
          >
            <Plus className="h-4 w-4" /> Request a Community
          </Button>
        </div>

        {activePendingRequest && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-amber-300/85">Community request in queue</p>
                <p className="mt-2 font-display text-base text-raw-text">{activePendingRequest.communityName}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-raw-silver/50">
                  Admin review is pending. Once approved, the team can turn this into a live room with moderation and onboarding rules.
                </p>
              </div>
              <div className="rounded-full border border-amber-300/20 px-3 py-1 text-[11px] text-amber-200/80">
                Submitted {formatAdminTimestamp(activePendingRequest.submittedAt)}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {directoryCommunities.map((community) => {
            const joined = community.members.some((member) => member.userId === user.id);
            const communityUnreadCount = joined ? countUnreadMessages(community, user.id) : 0;
            const coverImage = COMMUNITY_COVER_IMAGES[community.id] ?? community.logoUrl;
            const coverVideo = COMMUNITY_COVER_VIDEOS[community.id];
            const isExpanded = expandedDescs.has(community.id);
            const descLong = community.description.length > 120;

            return (
              <div key={community.id} className="flex flex-col overflow-hidden rounded-3xl border border-raw-border/30 bg-raw-surface/35 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
                <div className="relative h-44 shrink-0 overflow-hidden border-b border-raw-border/25">
                  {coverVideo ? (
                    <video src={coverVideo} className="h-full w-full object-cover" autoPlay loop muted playsInline />
                  ) : coverImage ? (
                    <img src={coverImage} alt={`${community.title} cover`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-raw-gold/12 via-raw-surface/30 to-raw-black/70" />
                  )}
                  {!coverVideo && <div className="absolute inset-0 bg-gradient-to-t from-raw-black/85 via-raw-black/30 to-transparent" />}
                  <div className="absolute bottom-3 right-3 rounded-full border border-raw-border/40 bg-raw-black/60 px-2.5 py-1 text-[10px] text-raw-silver/70 backdrop-blur-sm">
                    {joined ? "Joined" : "Not joined"}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CommunityBadge abbr={community.abbr} title={community.title} logoUrl={community.logoUrl} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-base tracking-wide text-raw-text">{community.title}</p>
                          {communityUnreadCount > 0 && (
                            <span className="rounded-full bg-raw-gold px-2 py-0.5 text-[10px] font-semibold text-raw-ink">
                              {communityUnreadCount}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-raw-gold/65">{community.status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className={`text-sm leading-relaxed text-raw-silver/50 ${!isExpanded && descLong ? "line-clamp-3" : ""}`}>
                      {community.description}
                    </p>
                    {descLong && (
                      <button
                        onClick={() => setExpandedDescs((prev) => {
                          const next = new Set(prev);
                          isExpanded ? next.delete(community.id) : next.add(community.id);
                          return next;
                        })}
                        className="mt-1 text-xs text-raw-gold/60 hover:text-raw-gold"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-raw-silver/35">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {community.members.length} members
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" /> {countOnlineMembers(community)} online
                      </span>
                    </div>
                    <Button
                      onClick={() => onOpenCommunity(community.id)}
                      className="rounded-xl bg-raw-gold px-4 text-raw-ink hover:bg-raw-gold/90"
                    >
                      Open Chat Page
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    const renderChatPage = () => {
      if (!selectedCommunity) {
        return null;
      }

      return (
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-raw-border/30 bg-raw-surface/25 p-4 sm:rounded-3xl sm:p-5 md:flex-row md:flex-wrap md:items-start md:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <button
                onClick={() => onBackToCommunities?.()}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-raw-border/30 text-raw-silver/55 transition-colors hover:border-raw-gold/20 hover:text-raw-gold"
                aria-label="Back to communities"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <CommunityBadge abbr={selectedCommunity.abbr} title={selectedCommunity.title} logoUrl={selectedCommunity.logoUrl} />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg tracking-wide text-raw-text sm:text-xl md:text-2xl">{selectedCommunity.title}</h1>
                <p className="mt-2 text-xs text-raw-silver/45 sm:text-sm">{selectedCommunity.description}</p>
                <p className="mt-2 text-xs text-raw-silver/35">Topic prompt: {selectedCommunity.topic}</p>
                <p className="mt-2 text-xs text-raw-silver/35">
                  Members: {selectedCommunity.members.length} · {visibleMembers.map((member) => `@${member.username}`).join(", ")}
                  {selectedCommunity.members.length > visibleMembers.length ? ` +${selectedCommunity.members.length - visibleMembers.length} more` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-raw-border/30 px-3 py-1 text-[11px] text-raw-silver/40">
                {onlineNow} online now
              </div>
              {unreadCount > 0 && (
                <div className="rounded-full border border-raw-gold/20 bg-raw-gold/[0.08] px-3 py-1 text-[11px] text-raw-gold/75">
                  {unreadCount} unread
                </div>
              )}
              {!isJoined && (
                <button
                  onClick={() => handleJoinCommunity(selectedCommunity.id)}
                  className="flex items-center gap-2 rounded-full bg-raw-gold px-3 py-1.5 text-[11px] font-semibold text-raw-ink transition-colors hover:bg-raw-gold/90"
                >
                  Join Group
                </button>
              )}
              {canEditSelectedCommunity && (
                <button
                  onClick={() => {
                    setCommunitySettingsDraft({
                      title: selectedCommunity.title,
                      logoUrl: selectedCommunity.logoUrl ?? "",
                    });
                    setLogoDialogOpen(true);
                  }}
                  className="rounded-full border border-raw-border/30 px-3 py-1.5 text-[11px] text-raw-silver/55 transition-colors hover:border-raw-gold/20 hover:text-raw-gold"
                >
                  Edit Group
                </button>
              )}
              <button
                onClick={() => {
                  if (!currentMember) {
                    return;
                  }

                  setCommunityNotifications(selectedCommunity.id, user.id, !currentMember.notificationsEnabled);
                  reloadChatData();
                }}
                disabled={!currentMember}
                className="flex items-center gap-2 rounded-full border border-raw-gold/20 bg-raw-gold/[0.05] px-3 py-1.5 text-[11px] text-raw-gold/70 transition-colors hover:bg-raw-gold/[0.09] disabled:opacity-60"
              >
                {currentMember?.notificationsEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                {currentMember?.notificationsEnabled ? "Notifications On" : "Notifications Off"}
              </button>
            </div>
          </div>

          {(warningCount > 0 || isUserBanned) && (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              isUserBanned
                ? "border-red-400/20 bg-red-500/10 text-red-200"
                : "border-amber-400/20 bg-amber-400/[0.08] text-amber-200"
            }`}>
              <AlertTriangle className="h-3.5 w-3.5" />
              {isUserBanned ? "Account banned after moderation review" : `${warningCount} warning${warningCount === 1 ? "" : "s"} on your account`}
            </div>
          )}

          <div ref={messagesContainerRef} className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-raw-border/20 bg-raw-black/35 p-3 sm:max-h-[560px] sm:p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-raw-border/20 bg-raw-black/35 px-4 py-3">
              <Search className="h-4 w-4 text-raw-silver/35" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search this group chat"
                className="w-full bg-transparent text-sm text-raw-text placeholder:text-raw-silver/25 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-1 text-raw-silver/40 transition-colors hover:bg-raw-surface/30 hover:text-raw-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {groupedMessages.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="sticky top-0 z-10 flex justify-center py-1">
                  <span className="rounded-full border border-raw-border/20 bg-raw-black/85 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-raw-silver/40 backdrop-blur">
                    {group.label}
                  </span>
                </div>
                {group.messages.map((message) => {
                  const isOwnMessage = message.senderId === user.id || message.senderName === user.username;
                  const liked = likedMessageIds.has(message.id);

                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isOwnMessage
                            ? "bg-raw-gold/12 text-raw-text"
                            : "border border-raw-border/20 bg-raw-surface/30 text-raw-silver/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
                          <span className={isOwnMessage ? "text-raw-gold/80" : "text-raw-gold/60"}>{message.senderName}</span>
                          <span className="text-raw-silver/25">{formatChatTimestamp(message.createdAt)}</span>
                          {message.pinned && <span className="text-raw-gold/75">Pinned</span>}
                        </div>
                        {message.replyToText && (
                          <div className="mt-2 rounded-xl border border-raw-border/20 bg-raw-black/20 px-3 py-2 text-xs text-raw-silver/55">
                            <p className="font-medium text-raw-gold/75">Replying to {message.replyToSenderName}</p>
                            <p className="mt-1 truncate">{message.replyToText}</p>
                          </div>
                        )}
                        <p className={`mt-2 text-sm leading-relaxed ${message.deletedAt ? "italic text-raw-silver/45" : ""}`}>{message.text}</p>
                        <div className="mt-3 flex justify-end gap-2">
                          {!message.deletedAt && isJoined && (
                            <>
                              <button
                                onClick={() => setReplyTarget(message)}
                                className="inline-flex items-center gap-1 rounded-full border border-raw-border/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-raw-silver/70 transition-colors hover:bg-raw-surface/20"
                              >
                                <Reply className="h-3 w-3" /> Reply
                              </button>
                              <button
                                onClick={() => toggleMessageLike(message.id)}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                                  liked
                                    ? "border-raw-gold/45 bg-raw-gold/10 text-raw-gold"
                                    : "border-raw-border/20 text-raw-silver/70 hover:bg-raw-surface/20"
                                }`}
                              >
                                <Heart className="h-3 w-3" /> {liked ? "Liked" : "Like"}
                              </button>
                            </>
                          )}
                          {isOwnMessage && !message.deletedAt && (
                            <button
                              onClick={() => handleDeleteMessage(message)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-400/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-red-200/75 transition-colors hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {!groupedMessages.length && !activeMessages.length && (
              <div className="rounded-2xl border border-dashed border-raw-border/30 bg-raw-surface/20 px-4 py-10 text-center text-sm text-raw-silver/45">
                This group is quiet right now. Join and start the first real conversation.
              </div>
            )}

            {!groupedMessages.length && activeMessages.length > 0 && (
              <div className="rounded-2xl border border-dashed border-raw-border/30 bg-raw-surface/20 px-4 py-10 text-center text-sm text-raw-silver/45">
                No messages match your search in this group.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-raw-silver/35">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> Latest activity: {latestMessage ? formatChatTimestamp(latestMessage.createdAt) : "No activity yet"}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> Dedicated community chat page
            </span>
          </div>

          <div className="rounded-2xl border border-raw-border/20 bg-raw-black/40 p-4">
            {isUserBanned && (
              <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                Chat posting is disabled for this account. An admin has marked it as banned after review.
              </div>
            )}
            {!isJoined && (
              <div className="mb-4 rounded-xl border border-raw-gold/20 bg-raw-gold/[0.07] px-4 py-3 text-sm text-raw-gold/85">
                Join this community first. Once you are in, you can chat, like messages, and stay synced with the group.
              </div>
            )}
            <label className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-raw-silver/35">
              {isJoined ? `Say something real in ${selectedCommunity.title}` : `Join ${selectedCommunity.title} to start chatting`}
            </label>
            {replyTarget && (
              <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-raw-gold/20 bg-raw-gold/[0.06] px-4 py-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-raw-gold/75">Replying to {replyTarget.senderName}</p>
                  <p className="mt-1 text-raw-silver/70">{replyTarget.text}</p>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="rounded-full p-1 text-raw-silver/40 transition-colors hover:bg-raw-surface/30 hover:text-raw-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <input
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder={isJoined ? "Type your message..." : "Join the group to type a message"}
                disabled={isUserBanned || !isJoined}
                className="flex-1 rounded-xl border border-raw-border/30 bg-raw-surface/30 px-4 py-3 text-sm text-raw-text placeholder:text-raw-silver/25 focus:border-raw-gold/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                onClick={handleSendMessage}
                disabled={isUserBanned || !isJoined}
                className="flex items-center gap-2 rounded-xl bg-raw-gold px-4 py-3 text-sm font-semibold text-raw-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
            <p className="mt-3 text-[11px] text-raw-silver/35">Messages in this community: {activeMessages.length}</p>
          </div>
        </div>
      );
    };

    if (activeCommunityId && !selectedCommunity) {
      return (
        <div className="rounded-3xl border border-raw-border/30 bg-raw-surface/20 p-8 text-center text-raw-silver/50">
          <p className="font-display text-lg text-raw-text">This community could not be found.</p>
          <button
            onClick={() => onBackToCommunities?.()}
            className="mt-4 rounded-xl bg-raw-gold px-4 py-2 text-sm font-semibold text-raw-ink"
          >
            Back to communities
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {activeCommunityId ? renderChatPage() : renderDirectoryView()}

        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
          <DialogContent className="border border-raw-border/40 bg-raw-black p-0 text-raw-text sm:max-w-lg sm:rounded-3xl">
            <div className="border-b border-raw-border/20 bg-gradient-to-br from-raw-gold/[0.08] via-raw-black to-raw-black px-6 py-6">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-display text-xl tracking-wide text-raw-text">Edit community details</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-raw-silver/45">
                  Only the community creator can change the group name or logo.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Community name</label>
                <Input
                  value={communitySettingsDraft.title}
                  onChange={(event) => setCommunitySettingsDraft((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Community name"
                  className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Logo URL</label>
                <Input
                  value={communitySettingsDraft.logoUrl}
                  onChange={(event) => setCommunitySettingsDraft((previous) => ({ ...previous, logoUrl: event.target.value }))}
                  placeholder="https://example.com/community-logo.png"
                  className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-raw-border/20 px-6 py-5 sm:justify-between">
              <p className="text-xs text-raw-silver/40">Leave empty to remove the current logo.</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLogoDialogOpen(false)}
                  className="rounded-xl border-raw-border/30 bg-transparent text-raw-silver/70 hover:bg-raw-surface/30 hover:text-raw-text"
                >
                  Cancel
                </Button>
                <Button onClick={handleCommunitySettingsSave} className="rounded-xl bg-raw-gold px-4 text-raw-ink hover:bg-raw-gold/90">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={requestFormOpen} onOpenChange={setRequestFormOpen}>
          <DialogContent className="border border-raw-border/40 bg-raw-black p-0 text-raw-text sm:max-w-2xl sm:rounded-3xl">
            <div className="border-b border-raw-border/20 bg-gradient-to-br from-raw-gold/[0.08] via-raw-black to-raw-black px-6 py-6">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-display text-xl tracking-wide text-raw-text">Request a new community</DialogTitle>
                <DialogDescription className="max-w-xl text-sm leading-relaxed text-raw-silver/45">
                  This form goes to admin review. Approved requests can become new in-app communities after moderation checks and launch setup.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Community name</label>
                  <Input
                    value={requestDraft.communityName}
                    onChange={(event) => updateRequestDraft("communityName", event.target.value)}
                    placeholder="Example: Creator Burnout Circle"
                    className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Focus area</label>
                  <Input
                    value={requestDraft.focusArea}
                    onChange={(event) => updateRequestDraft("focusArea", event.target.value)}
                    placeholder="What theme would this room center on?"
                    className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Who is this for?</label>
                <Input
                  value={requestDraft.audience}
                  onChange={(event) => updateRequestDraft("audience", event.target.value)}
                  placeholder="Who would join and benefit from this community?"
                  className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Why should admin approve it?</label>
                <Textarea
                  value={requestDraft.whyNow}
                  onChange={(event) => updateRequestDraft("whyNow", event.target.value)}
                  placeholder="Explain the need, how it adds value, and what kind of conversations it should unlock."
                  className="min-h-[130px] rounded-2xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Sample opening prompt</label>
                <Textarea
                  value={requestDraft.samplePrompt}
                  onChange={(event) => updateRequestDraft("samplePrompt", event.target.value)}
                  placeholder="Optional: add the kind of opening topic that would set the tone for the room."
                  className="min-h-[96px] rounded-2xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-raw-border/20 px-6 py-5 sm:justify-between">
              <p className="text-xs leading-relaxed text-raw-silver/40">
                Requesting as @{user.username}. Only one pending request is allowed at a time.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setRequestFormOpen(false)}
                  className="rounded-xl border-raw-border/30 bg-transparent text-raw-silver/70 hover:bg-raw-surface/30 hover:text-raw-text"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitCommunityRequest}
                  className="rounded-xl bg-raw-gold px-4 text-raw-ink hover:bg-raw-gold/90"
                >
                  Submit for approval
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="border border-raw-border/40 bg-raw-black p-0 text-raw-text sm:max-w-xl sm:rounded-3xl">
            <div className="border-b border-raw-border/20 bg-gradient-to-br from-red-500/[0.08] via-raw-black to-raw-black px-6 py-6">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-display text-xl tracking-wide text-raw-text">Report this message</DialogTitle>
                <DialogDescription className="max-w-xl text-sm leading-relaxed text-raw-silver/45">
                  Admin can review reports here, then warn or ban the user if the report is valid.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="space-y-5 px-6 py-6">
              {reportTarget && (
                <div className="rounded-2xl border border-raw-border/20 bg-raw-surface/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/35">Message under review</p>
                  <p className="mt-2 font-display text-sm text-raw-text">{reportTarget.message.senderName}</p>
                  <p className="mt-2 text-sm leading-relaxed text-raw-silver/55">{reportTarget.message.text}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Why should this be reviewed?</label>
                <Input
                  value={reportDraft.reason}
                  onChange={(event) => setReportDraft((previous) => ({ ...previous, reason: event.target.value }))}
                  placeholder="Spam, harassment, harmful content, impersonation..."
                  className="h-11 rounded-xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.16em] text-raw-silver/40">Extra context</label>
                <Textarea
                  value={reportDraft.details}
                  onChange={(event) => setReportDraft((previous) => ({ ...previous, details: event.target.value }))}
                  placeholder="Optional: explain what happened so admin can review faster."
                  className="min-h-[110px] rounded-2xl border-raw-border/30 bg-raw-surface/30 text-raw-text placeholder:text-raw-silver/25"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-raw-border/20 px-6 py-5 sm:justify-between">
              <p className="text-xs leading-relaxed text-raw-silver/40">Reports are stored for admin review in the hidden admin page.</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setReportDialogOpen(false)}
                  className="rounded-xl border-raw-border/30 bg-transparent text-raw-silver/70 hover:bg-raw-surface/30 hover:text-raw-text"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitReport} className="rounded-xl bg-red-400 px-4 text-raw-ink hover:bg-red-300">
                  Submit report
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }