import { useEffect, useMemo, useRef, useState } from "react";
import type { Poll } from "@/store/useRawStore";
import { useTheme } from "@/providers/ThemeProvider";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

interface PollHistoryComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies?: PollHistoryReply[];
}

interface PollHistoryReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface DashboardPollsProps {
  polls: Poll[];
  votedPolls: Set<string>;
  avatarLevel: number;
  userId: string;
  username: string;
  dailyAnsweredCount: number;
  dailyPollLimit: number;
  isDailyPollLimitReached: boolean;
  onVote: (pollId: string, optionId: string) => void;
}

export function DashboardPolls({
  polls,
  votedPolls,
  avatarLevel,
  userId,
  username,
  dailyAnsweredCount,
  dailyPollLimit,
  isDailyPollLimitReached,
  onVote,
}: DashboardPollsProps) {
  const { mode } = useTheme();
  const isLightMode = mode === "light";
  const answersStorageKey = `raw.poll-history.answers.${userId}`;
  const commentsStorageKey = `raw.poll-history.comments.${userId}`;
  const swipeGuideStorageKey = "raw.polls.swipe-guide-seen";
  const [answerHistory, setAnswerHistory] = useState<Record<string, string>>({});
  const [historyComments, setHistoryComments] = useState<Record<string, PollHistoryComment[]>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const pointerStartXRef = useRef<number | null>(null);
  const swipeGuideButtonRef = useRef<HTMLButtonElement | null>(null);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [hasSeenSwipeGuide, setHasSeenSwipeGuide] = useState(false);

  useEffect(() => {
    try {
      const rawAnswers = window.localStorage.getItem(answersStorageKey);
      const parsedAnswers = rawAnswers ? (JSON.parse(rawAnswers) as Record<string, string>) : {};
      setAnswerHistory(parsedAnswers && typeof parsedAnswers === "object" ? parsedAnswers : {});
    } catch {
      setAnswerHistory({});
    }

    try {
      const rawComments = window.localStorage.getItem(commentsStorageKey);
      const parsedComments = rawComments ? (JSON.parse(rawComments) as Record<string, PollHistoryComment[]>) : {};
      setHistoryComments(parsedComments && typeof parsedComments === "object" ? parsedComments : {});
    } catch {
      setHistoryComments({});
    }
  }, [answersStorageKey, commentsStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(answersStorageKey, JSON.stringify(answerHistory));
  }, [answerHistory, answersStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(historyComments));
  }, [commentsStorageKey, historyComments]);

  useEffect(() => {
    const saved = window.localStorage.getItem(swipeGuideStorageKey);
    setHasSeenSwipeGuide(saved === "1");
  }, [swipeGuideStorageKey]);

  useEffect(() => {
    if (hasSeenSwipeGuide) {
      window.localStorage.setItem(swipeGuideStorageKey, "1");
    }
  }, [hasSeenSwipeGuide, swipeGuideStorageKey]);

  useEffect(() => {
    if (currentPollIndex >= polls.length && polls.length > 0) {
      setCurrentPollIndex(polls.length - 1);
    }
  }, [currentPollIndex, polls.length]);

  const currentPoll = polls[currentPollIndex]
    ? {
        ...polls[currentPollIndex],
        options: polls[currentPollIndex].options.slice(0, 2),
      }
    : undefined;
  const selectedOptionId = currentPoll ? answerHistory[currentPoll.id] : undefined;
  const hasVotedCurrent = Boolean(currentPoll && answerHistory[currentPoll.id]);
  const currentComments = currentPoll ? historyComments[currentPoll.id] ?? [] : [];
  const leftOption = currentPoll?.options[0];
  const rightOption = currentPoll?.options[1] ?? currentPoll?.options[0];
  const showSwipeGuide =
    currentPollIndex === 0 && !hasVotedCurrent && !hasSeenSwipeGuide;

  useEffect(() => {
    if (!showSwipeGuide) {
      return;
    }

    swipeGuideButtonRef.current?.focus();
  }, [showSwipeGuide]);

  const totalResponses = useMemo(
    () => polls.reduce((sum, poll) => sum + poll.options.reduce((acc, option) => acc + option.votes, 0), 0),
    [polls]
  );

  const pollsAnswered = votedPolls.size;
  const paidUnlocks = {
    bigFiveProfile: false,
    shadowSelf: false,
    decisionFingerprint: false,
    identityArc: false,
  };

  const insightsProgress = [
    {
      id: "myers-briggs",
      name: "Myers-Briggs",
      description: "Discover your personality type across 4 key dimensions of how you see the world.",
      unlockRequirements: ["Reach level 1", "OR answer 5 polls"],
      unlocked: avatarLevel >= 1 || pollsAnswered >= 5,
      lockedAction: "View Report",
    },
    {
      id: "big-five-profile",
      name: "Big Five Profile",
      description:
        "Measure your openness, conscientiousness, extraversion, agreeableness, and emotional range.",
      unlockRequirements: ["Reach level 2", "Answer 10 polls", "Pay $4 to unlock"],
      unlocked: avatarLevel >= 2 && pollsAnswered >= 10 && paidUnlocks.bigFiveProfile,
      lockedAction: "Complete to-do list",
    },
    {
      id: "emotional-intelligence",
      name: "Emotional Intelligence",
      description:
        "Understand how you process emotions, empathy, and interpersonal cues under pressure.",
      unlockRequirements: ["Reach level 3", "Answer 15 polls"],
      unlocked: avatarLevel >= 3 && pollsAnswered >= 15,
      lockedAction: "Complete to-do list",
    },
    {
      id: "shadow-self",
      name: "Shadow Self",
      description:
        "Reveal hidden patterns, blind spots, and traits that surface in difficult moments.",
      unlockRequirements: ["Path A", "Reach level 1", "Pay $8", "Path B", "Answer 50 polls"],
      unlocked: (avatarLevel >= 1 && paidUnlocks.shadowSelf) || pollsAnswered >= 50,
      lockedAction: "Unlock $8",
    },
    {
      id: "decision-fingerprint",
      name: "Decision Fingerprint",
      description: "Map your decision style: instinctive, strategic, reflective, or adaptive.",
      unlockRequirements: ["Reach level 4", "Answer 22 polls", "Pay $6 to unlock"],
      unlocked: avatarLevel >= 4 && pollsAnswered >= 22 && paidUnlocks.decisionFingerprint,
      lockedAction: "Complete to-do list",
    },
    {
      id: "identity-arc",
      name: "Identity Arc",
      description: "Track how your personality signal changes over time as your answers evolve.",
      unlockRequirements: ["Reach level 5", "Answer 30 polls", "Pay $9 to unlock"],
      unlocked: avatarLevel >= 5 && pollsAnswered >= 30 && paidUnlocks.identityArc,
      lockedAction: "Complete to-do list",
    },
  ];

  const unlockedReports = insightsProgress.filter((item) => item.unlocked).length;

  const handleVote = (pollId: string, optionId: string) => {
    setHasSeenSwipeGuide(true);

    setAnswerHistory((previous) => ({
      ...previous,
      [pollId]: optionId,
    }));

    if (!votedPolls.has(pollId)) {
      onVote(pollId, optionId);
    }
  };

  const voteFromSwipeDirection = (direction: "left" | "right") => {
    if (!currentPoll || hasVotedCurrent) {
      return;
    }

    if (direction === "right") {
      const selected = currentPoll.options[1] ?? currentPoll.options[0];
      if (selected) {
        handleVote(currentPoll.id, selected.id);
      }
      return;
    }

    const selected = currentPoll.options[0];
    if (selected) {
      handleVote(currentPoll.id, selected.id);
    }
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(target.closest("button, input, textarea, form, a"));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (showSwipeGuide) {
      return;
    }

    if (isInteractiveTarget(event.target)) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null || hasVotedCurrent) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    const limitedDelta = Math.max(-140, Math.min(140, deltaX));
    setSwipeOffsetX(limitedDelta);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    pointerStartXRef.current = null;
    setSwipeOffsetX(0);

    const swipeThreshold = 60;
    if (Math.abs(deltaX) < swipeThreshold) {
      return;
    }

    voteFromSwipeDirection(deltaX > 0 ? "right" : "left");
  };

  const handleCommentAdd = () => {
    if (!currentPoll) {
      return;
    }

    const content = commentDraft.trim();
    if (!content) {
      return;
    }

    const nextComment: PollHistoryComment = {
      id: `${currentPoll.id}-${Date.now()}`,
      author: username,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistoryComments((previous) => ({
      ...previous,
      [currentPoll.id]: [nextComment, ...(previous[currentPoll.id] ?? [])],
    }));

    setCommentDraft("");
  };

  const handleCommentKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleCommentAdd();
  };

  const handleReplyAdd = (commentId: string) => {
    if (!currentPoll) {
      return;
    }

    const content = (replyDrafts[commentId] ?? "").trim();
    if (!content) {
      return;
    }

    const nextReply: PollHistoryReply = {
      id: `${commentId}-reply-${Date.now()}`,
      author: username,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistoryComments((previous) => ({
      ...previous,
      [currentPoll.id]: (previous[currentPoll.id] ?? []).map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies ?? []), nextReply],
            }
          : comment
      ),
    }));

    setReplyDrafts((previous) => ({
      ...previous,
      [commentId]: "",
    }));
  };

  const handleReplyKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    commentId: string
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleReplyAdd(commentId);
  };

  if (!currentPoll) {
    return (
      <div className="rounded-2xl border border-raw-border/30 bg-raw-black/30 p-6 text-center text-sm text-raw-silver/55">
        No polls available yet.
      </div>
    );
  }

  const pollTotalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  const leftPercent = leftOption && pollTotalVotes > 0 ? Math.round((leftOption.votes / pollTotalVotes) * 100) : 50;
  const rightPercent = rightOption && pollTotalVotes > 0 ? Math.round((rightOption.votes / pollTotalVotes) * 100) : 50;
  const selectedLeft = leftOption ? selectedOptionId === leftOption.id : false;
  const selectedRight = rightOption ? selectedOptionId === rightOption.id : false;
  const showMorePollsPaywall = dailyPollLimit > 0 && dailyAnsweredCount >= dailyPollLimit;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-xl tracking-wide text-raw-text sm:text-2xl">Polls</h1>
        <p className="mt-2 text-xs text-raw-silver/45 sm:text-sm">
          Anonymous voting, live percentages, and reflections from the community.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-raw-border/35 bg-raw-surface/25 p-3 text-center sm:p-4">
          <BarChart3 className="mx-auto mb-2 h-4 w-4 text-raw-gold/45" />
          <p className="text-lg font-semibold text-raw-text">{polls.length}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-raw-silver/35">Live Polls</p>
        </div>
        <div className="rounded-xl border border-raw-border/35 bg-raw-surface/25 p-3 text-center sm:p-4">
          <Users className="mx-auto mb-2 h-4 w-4 text-raw-gold/45" />
          <p className="text-lg font-semibold text-raw-text">{totalResponses.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-raw-silver/35">Total Votes</p>
        </div>
        <div className="rounded-xl border border-raw-border/35 bg-raw-surface/25 p-3 text-center sm:p-4">
          <MessageCircle className="mx-auto mb-2 h-4 w-4 text-raw-gold/45" />
          <p className="text-lg font-semibold text-raw-text">{dailyAnsweredCount}/{dailyPollLimit}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-raw-silver/35">Daily Progress</p>
        </div>
      </section>

      {showMorePollsPaywall && (
        <section className="rounded-2xl border border-raw-gold/35 bg-gradient-to-r from-raw-gold/12 via-raw-black/60 to-raw-black/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.16em] text-raw-gold/80">Daily Limit Reached</p>
              <h3 className="mt-1 font-display text-lg text-raw-text sm:text-xl">You completed {dailyAnsweredCount}/{dailyPollLimit} polls today.</h3>
              <p className="mt-1 text-xs text-raw-silver/50 sm:text-sm">
                Want to solve more right now? Upgrade to unlock extra polls instantly.
              </p>
            </div>
            <div className="flex items-stretch gap-2 sm:items-center">
              <button className="flex-1 rounded-xl border border-raw-border/45 bg-raw-black/35 px-4 py-2.5 text-xs text-raw-silver/75 hover:border-raw-gold/35 hover:text-raw-gold sm:flex-none">
                Maybe Later
              </button>
              <button className="flex-1 rounded-xl border border-raw-gold/65 bg-raw-gold/90 px-4 py-2.5 text-xs font-semibold text-raw-ink hover:bg-raw-gold sm:flex-none">
                Solve More - Pay
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="relative mx-auto max-w-xl">
        <button
          onClick={() => setCurrentPollIndex((previous) => Math.max(0, previous - 1))}
          disabled={currentPollIndex === 0}
          className={`absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border p-3 transition disabled:cursor-not-allowed disabled:opacity-35 md:inline-flex ${
            isLightMode
              ? "border-slate-300 bg-white/95 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.2)] hover:border-amber-400 hover:text-amber-700"
              : "border-raw-border/55 bg-raw-black/85 text-raw-silver/85 shadow-[0_10px_24px_rgba(0,0,0,0.4)] hover:border-raw-gold/45 hover:text-raw-gold"
          }`}
          aria-label="Previous poll"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => setCurrentPollIndex((previous) => Math.min(polls.length - 1, previous + 1))}
          disabled={currentPollIndex === polls.length - 1}
          className={`absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border p-3 transition disabled:cursor-not-allowed disabled:opacity-35 md:inline-flex ${
            isLightMode
              ? "border-slate-300 bg-white/95 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.2)] hover:border-amber-400 hover:text-amber-700"
              : "border-raw-border/55 bg-raw-black/85 text-raw-silver/85 shadow-[0_10px_24px_rgba(0,0,0,0.4)] hover:border-raw-gold/45 hover:text-raw-gold"
          }`}
          aria-label="Next poll"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="rounded-2xl border border-raw-border/40 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),rgba(0,0,0,0.05)_35%,rgba(0,0,0,0.6)_100%)] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.4)] sm:rounded-[2rem] sm:p-6">
          <div className="mb-4 flex items-center justify-between text-xs text-raw-silver/45">
            <span>
              {currentPollIndex + 1}/{polls.length} today
            </span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          <div className="mb-5 flex items-center justify-center gap-1.5">
            {polls.map((poll, index) => (
              <button
                key={poll.id}
                onClick={() => setCurrentPollIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentPollIndex ? "w-6 bg-raw-gold" : "w-2 bg-raw-border/60"
                }`}
                aria-label={`Go to poll ${index + 1}`}
              />
            ))}
          </div>

          <div
            className="relative rounded-2xl border border-raw-border/45 bg-raw-black/55 p-4 sm:rounded-[1.7rem] sm:p-6"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ transform: `translateX(${swipeOffsetX}px) rotate(${swipeOffsetX * 0.04}deg)` }}
          >
            {showSwipeGuide && (
              <>
                <div className="absolute inset-0 z-20 rounded-[1.3rem] bg-raw-black/45 backdrop-blur-[2px]" />
                <div
                  className={`absolute left-1/2 top-1/2 z-30 w-[calc(100%-2rem)] max-w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 sm:p-5 ${
                    isLightMode
                      ? "border-amber-400/55 bg-white/98 shadow-[0_14px_35px_rgba(15,23,42,0.2)]"
                      : "border-raw-gold/40 bg-raw-black/88 shadow-[0_0_30px_rgba(255,102,102,0.22)] backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] ${isLightMode ? "text-amber-700" : "text-raw-gold/85"}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Quick Swipe Guide
                    </p>
                    <button
                      ref={swipeGuideButtonRef}
                      type="button"
                      onClick={() => setHasSeenSwipeGuide(true)}
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${
                        isLightMode
                          ? "border-amber-400/70 text-amber-700 hover:bg-amber-50"
                          : "border-raw-gold/35 text-raw-gold/80 hover:bg-raw-gold/10"
                      }`}
                    >
                      Got it
                    </button>
                  </div>
                  <p className={`mt-2 text-sm ${isLightMode ? "text-slate-800" : "text-raw-silver/85"}`}>
                    Swipe to vote. Right means <span className={isLightMode ? "text-emerald-600 font-semibold" : "text-emerald-300 font-semibold"}>{rightOption?.text ?? "Right"}</span>, left means <span className={isLightMode ? "text-rose-600 font-semibold" : "text-rose-300 font-semibold"}>{leftOption?.text ?? "Left"}</span>.
                  </p>
                </div>
              </>
            )}

            <div
              className={`mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] transition-opacity ${
                hasVotedCurrent ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              aria-hidden={hasVotedCurrent}
            >
              <span className={`transition ${swipeOffsetX < -20 ? "text-rose-300" : "text-raw-silver/35"}`}>{leftOption?.text}</span>
              <span className={`transition ${swipeOffsetX > 20 ? "text-emerald-300" : "text-raw-silver/35"}`}>{rightOption?.text}</span>
            </div>

            <h2 className="text-center font-display text-2xl leading-tight text-raw-text sm:text-[2rem]">
              {currentPoll.question}
            </h2>

            <div className="mt-6 space-y-3">
              <div
                className={`flex h-[42px] items-center justify-between rounded-xl border border-raw-border/35 bg-raw-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-raw-silver/55 transition-opacity ${
                  hasVotedCurrent ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
                aria-hidden={hasVotedCurrent}
              >
                <span className="flex items-center gap-1.5 text-rose-200/85">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Swipe left = {leftOption?.text}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-200/85">
                  Swipe right = {rightOption?.text}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (leftOption) handleVote(currentPoll.id, leftOption.id);
                  }}
                  disabled={hasVotedCurrent}
                  className={`relative rounded-2xl border px-4 py-3 text-left text-base font-medium transition disabled:cursor-not-allowed ${
                    selectedLeft
                      ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                      : "border-raw-gold/30 bg-raw-gold/18 text-raw-text hover:bg-raw-gold/28"
                  } ${hasVotedCurrent ? "opacity-100" : "disabled:opacity-55"}`}
                >
                  <span>{leftOption?.text}</span>
                  {hasVotedCurrent ? (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${selectedLeft ? "text-black" : "text-raw-text"}`}>
                      {leftPercent}%
                    </span>
                  ) : null}
                </button>

                <button
                  onClick={() => {
                    if (rightOption) handleVote(currentPoll.id, rightOption.id);
                  }}
                  disabled={hasVotedCurrent}
                  className={`relative rounded-2xl border px-4 py-3 text-right text-base font-medium transition disabled:cursor-not-allowed ${
                    selectedRight
                      ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                      : "border-raw-gold/30 bg-raw-gold/18 text-raw-text hover:bg-raw-gold/28"
                  } ${hasVotedCurrent ? "opacity-100" : "disabled:opacity-55"}`}
                >
                  <span>{rightOption?.text}</span>
                  {hasVotedCurrent ? (
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${selectedRight ? "text-black" : "text-raw-text"}`}>
                      {rightPercent}%
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            {hasVotedCurrent ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className={`text-[11px] uppercase tracking-[0.12em] ${isLightMode ? "text-slate-600" : "text-raw-silver/55"}`}>Comments</p>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleCommentAdd();
                  }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 ${
                    isLightMode
                      ? "border-slate-300 bg-white/95"
                      : "border-raw-border/35 bg-raw-black/35"
                  }`}
                >
                  <input
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Add a comment..."
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${
                      isLightMode
                        ? "text-slate-800 placeholder:text-slate-400"
                        : "text-raw-text placeholder:text-raw-silver/35"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!commentDraft.trim()}
                    className={`rounded-full border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      isLightMode
                        ? "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        : "border-raw-border/40 bg-raw-surface/40 text-raw-silver/80 hover:bg-raw-surface/55"
                    }`}
                    aria-label="Add comment"
                  >
                    <SendHorizontal className="h-3.5 w-3.5" />
                  </button>
                </form>

                <div className="mt-4 space-y-2.5">
                  {currentComments.length === 0 ? (
                    <p className={`text-center text-xs ${isLightMode ? "text-slate-500" : "text-raw-silver/45"}`}>
                      No comments yet for this poll. Be the first to comment.
                    </p>
                  ) : (
                    currentComments.slice(0, 3).map((comment) => (
                      <article key={comment.id} className="rounded-2xl border border-raw-border/35 bg-raw-black/50 px-3.5 py-2.5">
                        <div className="flex items-center justify-between text-[11px] text-raw-silver/50">
                          <span>@{comment.author}</span>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p className="mt-1 text-sm text-raw-silver/85">{comment.content}</p>

                        <div className="mt-2 space-y-1.5">
                          {(comment.replies ?? []).slice(-2).map((reply) => (
                            <div key={reply.id} className="rounded-xl border border-raw-border/35 bg-raw-black/30 px-3 py-2">
                              <div className="flex items-center justify-between text-[10px] text-raw-silver/45">
                                <span>@{reply.author}</span>
                                <span>{reply.createdAt}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-raw-silver/80">{reply.content}</p>
                            </div>
                          ))}
                        </div>

                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleReplyAdd(comment.id);
                          }}
                          className="mt-2 flex items-center gap-2 rounded-full border border-raw-border/35 bg-raw-black/30 px-3 py-1.5"
                        >
                          <input
                            value={replyDrafts[comment.id] ?? ""}
                            onChange={(event) =>
                              setReplyDrafts((previous) => ({
                                ...previous,
                                [comment.id]: event.target.value,
                              }))
                            }
                            onKeyDown={(event) => handleReplyKeyDown(event, comment.id)}
                            placeholder="Reply..."
                            className="flex-1 bg-transparent text-xs text-raw-text placeholder:text-raw-silver/35 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={!(replyDrafts[comment.id] ?? "").trim()}
                            className="rounded-full border border-raw-border/40 px-2 py-0.5 text-[10px] text-raw-silver/80 hover:bg-raw-surface/40 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Reply
                          </button>
                        </form>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex gap-3 md:hidden">
            <button
              onClick={() => setCurrentPollIndex((previous) => Math.max(0, previous - 1))}
              disabled={currentPollIndex === 0}
              className="flex-1 rounded-xl border border-raw-border/35 bg-raw-black/25 px-3 py-2 text-xs text-raw-silver/70 disabled:opacity-35"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPollIndex((previous) => Math.min(polls.length - 1, previous + 1))}
              disabled={currentPollIndex === polls.length - 1}
              className="flex-1 rounded-xl border border-raw-border/35 bg-raw-black/25 px-3 py-2 text-xs text-raw-silver/70 disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-2xl border border-raw-border/35 bg-raw-surface/20 p-4 sm:p-5">
          <h2 className="font-display text-xl text-raw-text">Personality Insights</h2>
          <p className="mt-1 text-sm text-raw-silver/55">
            Your answers unlock deeper identity reports. Keep participating to reveal your full profile.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-raw-border/30 bg-raw-black/30 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-raw-silver/40">Poll Coverage</p>
              <p className="mt-1 text-base font-semibold text-raw-text">{pollsAnswered} polls answered</p>
            </div>
            <div className="rounded-xl border border-raw-border/30 bg-raw-black/30 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-raw-silver/40">Unlocked Reports</p>
              <p className="mt-1 text-base font-semibold text-raw-text">{unlockedReports}/6</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insightsProgress.map((item) => (
            <article
              key={item.id}
              className="relative overflow-hidden rounded-2xl border border-raw-border/35 bg-raw-surface/25 p-4"
            >
              <p className="font-display text-base text-raw-text">{item.name}</p>

              <div className={!item.unlocked ? "pointer-events-none select-none blur-sm" : undefined}>
                <p className="mt-2 text-xs leading-relaxed text-raw-silver/55">{item.description}</p>
                <button
                  disabled={!item.unlocked}
                  className={`mt-4 w-full rounded-xl border px-3 py-2 text-xs transition ${
                    item.unlocked
                      ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20"
                      : "cursor-not-allowed border-raw-border/40 bg-raw-black/35 text-raw-silver/45"
                  }`}
                >
                  {item.unlocked ? "View Report" : item.lockedAction}
                </button>
              </div>

              {!item.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full border border-raw-border/45 bg-raw-black/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-raw-silver/60 backdrop-blur-sm">
                    Locked
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>

        <p className="text-center text-xs text-raw-silver/45">More insight models coming soon</p>
      </section>
    </div>
  );
}