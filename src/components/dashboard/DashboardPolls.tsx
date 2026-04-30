import { useEffect, useMemo, useRef, useState } from "react";
import type { Poll } from "@/store/useRawStore";
import { useTheme } from "@/providers/ThemeProvider";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Fingerprint,
  Lock,
  Map,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

interface PollProgressProps {
  currentIndex: number;
  total: number;
  onSelect: (index: number) => void;
}

function PollProgress({ currentIndex, total, onSelect }: PollProgressProps) {
  return (
    <div className="mb-5 text-center">
      <p className="text-[13px] tracking-[0.35em] text-[#D9D9D9]">{currentIndex + 1} / {total}</p>
      <div className="mt-3 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-7 bg-[#F1C42D] shadow-[0_0_10px_rgba(241,196,45,0.45)]"
                : "w-4 bg-[#3A3A3A]"
            }`}
            aria-label={`Go to poll ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

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
  const pointerStartTimeRef = useRef<number>(0);
  const swipeGuideButtonRef = useRef<HTMLButtonElement | null>(null);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
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
    setShowAllComments(false);
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
    attachmentStyle: false,
    cognitiveBiasMap: false,
  };

  const insightsProgress = [
    {
      id: "myers-briggs",
      name: "Myers-Briggs",
      icon: Brain,
      description: "Discover your personality type across 4 key dimensions of how you see the world.",
      requiredPolls: 5,
      unlockPrice: 0,
      unlocked: pollsAnswered >= 5,
    },
    {
      id: "big-five-profile",
      name: "Big Five Profile",
      icon: Fingerprint,
      description:
        "Measure your openness, conscientiousness, extraversion, agreeableness, and emotional range.",
      requiredPolls: 10,
      unlockPrice: 4,
      unlocked: pollsAnswered >= 10 && paidUnlocks.bigFiveProfile,
    },
    {
      id: "emotional-intelligence",
      name: "Emotional Intelligence",
      icon: CircleGauge,
      description:
        "Understand how you process emotions, empathy, and interpersonal cues under pressure.",
      requiredPolls: 15,
      unlockPrice: 0,
      unlocked: pollsAnswered >= 15,
    },
    {
      id: "shadow-self",
      name: "Shadow Self",
      icon: WandSparkles,
      description:
        "Reveal hidden patterns, blind spots, and traits that surface in difficult moments.",
      requiredPolls: 20,
      unlockPrice: 8,
      unlocked: pollsAnswered >= 20 || paidUnlocks.shadowSelf,
    },
    {
      id: "attachment-style",
      name: "Attachment Style",
      icon: BookOpen,
      description: "Understand your patterns in relationships and emotional bonding with others.",
      requiredPolls: 14,
      unlockPrice: 2,
      unlocked: pollsAnswered >= 14 && paidUnlocks.attachmentStyle,
    },
    {
      id: "cognitive-bias-map",
      name: "Cognitive Bias Map",
      icon: Map,
      description: "Identify the mental shortcuts and biases that shape your decisions and thinking.",
      requiredPolls: 18,
      unlockPrice: 6,
      unlocked: pollsAnswered >= 18 && paidUnlocks.cognitiveBiasMap,
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
    if (showSwipeGuide) return;
    if (isInteractiveTarget(event.target)) return;

    pointerStartXRef.current = event.clientX;
    pointerStartTimeRef.current = Date.now();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null || hasVotedCurrent) return;

    const deltaX = event.clientX - pointerStartXRef.current;
    const limitedDelta = Math.max(-160, Math.min(160, deltaX));
    setSwipeOffsetX(limitedDelta);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) return;

    const deltaX = event.clientX - pointerStartXRef.current;
    const elapsed = Date.now() - pointerStartTimeRef.current;
    const velocity = Math.abs(deltaX) / Math.max(elapsed, 1);

    pointerStartXRef.current = null;
    setIsDragging(false);
    setSwipeOffsetX(0);

    // trigger on distance OR fast flick
    const swipeThreshold = 55;
    const velocityThreshold = 0.4;
    if (Math.abs(deltaX) >= swipeThreshold || (velocity >= velocityThreshold && Math.abs(deltaX) > 20)) {
      voteFromSwipeDirection(deltaX > 0 ? "right" : "left");
    }
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

      <section className="relative mx-auto w-full max-w-[430px] px-1">
        <button
          onClick={() => setCurrentPollIndex((previous) => Math.max(0, previous - 1))}
          disabled={currentPollIndex === 0}
          className={`absolute left-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border p-2.5 transition disabled:cursor-not-allowed disabled:opacity-35 md:left-0 md:-translate-x-1/2 md:p-3 ${
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
          className={`absolute right-2 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border p-2.5 transition disabled:cursor-not-allowed disabled:opacity-35 md:right-0 md:translate-x-1/2 md:p-3 ${
            isLightMode
              ? "border-slate-300 bg-white/95 text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.2)] hover:border-amber-400 hover:text-amber-700"
              : "border-raw-border/55 bg-raw-black/85 text-raw-silver/85 shadow-[0_10px_24px_rgba(0,0,0,0.4)] hover:border-raw-gold/45 hover:text-raw-gold"
          }`}
          aria-label="Next poll"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden rounded-[2rem] border border-[#6f6f6f]/45 bg-[radial-gradient(circle_at_50%_0%,rgba(241,196,45,0.10),rgba(18,18,18,0.92)_36%,rgba(8,8,8,0.97)_100%)] p-4 shadow-[inset_0_0_0_1px_rgba(217,217,217,0.08),0_30px_65px_rgba(0,0,0,0.58)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(217,217,217,0.35) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative">
            <div className="mb-4 rounded-2xl border border-[#8b8b8b]/35 bg-[#111111]/80 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(241,196,45,0.12)]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[clamp(1.05rem,3.8vw,1.35rem)] uppercase tracking-[0.18em] text-[#EBEBEB]">2. Answer 5 launch polls</h3>
                <span className="rounded-full border border-[#F1C42D]/60 bg-[#F1C42D]/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#F1C42D]">
                  {dailyAnsweredCount}/{dailyPollLimit} completed
                </span>
              </div>
            </div>

            <PollProgress currentIndex={currentPollIndex} total={polls.length} onSelect={setCurrentPollIndex} />
          </div>

          <div
            className="relative rounded-[1.75rem] border border-[#D9D9D9]/35 bg-[linear-gradient(160deg,#171717,#0d0d0d)] p-5"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              transform: `translateX(${swipeOffsetX}px) rotate(${swipeOffsetX * 0.035}deg)`,
              transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
              touchAction: "pan-y",
              userSelect: "none",
            }}
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

            <p className="mb-3 text-center text-[11px] uppercase tracking-[0.26em] text-[#F1C42D]/85">POLL QUESTION</p>
            <h2 className="text-center font-display text-[clamp(1.9rem,8vw,3rem)] leading-[1.15] text-[#EBEBEB]">
              {currentPoll.question}
            </h2>

            <div className="mt-8 space-y-4">
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
                  className={`flex min-h-[84px] flex-col items-start justify-center rounded-2xl border px-4 py-3 text-left text-2xl font-medium transition disabled:cursor-not-allowed ${
                    selectedLeft
                      ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                      : "border-[#F1C42D]/55 bg-[linear-gradient(145deg,rgba(241,196,45,0.24),rgba(20,20,20,0.95))] text-[#F1C42D] hover:brightness-110"
                  } ${hasVotedCurrent ? "opacity-100" : "disabled:opacity-55"}`}
                >
                  {hasVotedCurrent && (
                    <span className={`text-xl font-bold leading-none ${selectedLeft ? "text-black" : "text-raw-text"}`}>
                      {leftPercent}%
                    </span>
                  )}
                  <span className={hasVotedCurrent ? "mt-1 text-[11px] leading-snug opacity-70" : "text-sm leading-snug"}>{leftOption?.text}</span>
                </button>

                <button
                  onClick={() => {
                    if (rightOption) handleVote(currentPoll.id, rightOption.id);
                  }}
                  disabled={hasVotedCurrent}
                  className={`flex min-h-[84px] flex-col items-end justify-center rounded-2xl border px-4 py-3 text-right text-2xl font-medium transition disabled:cursor-not-allowed ${
                    selectedRight
                      ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                      : "border-[#D9D9D9]/45 bg-[linear-gradient(145deg,rgba(27,27,27,0.98),rgba(10,10,10,0.9))] text-[#D9D9D9] hover:border-[#F1C42D]/55"
                  } ${hasVotedCurrent ? "opacity-100" : "disabled:opacity-55"}`}
                >
                  {hasVotedCurrent && (
                    <span className={`text-xl font-bold leading-none ${selectedRight ? "text-black" : "text-raw-text"}`}>
                      {rightPercent}%
                    </span>
                  )}
                  <span className={hasVotedCurrent ? "mt-1 text-[11px] leading-snug opacity-70" : "text-sm leading-snug"}>{rightOption?.text}</span>
                </button>
              </div>
            </div>

            {hasVotedCurrent ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className={`text-[11px] uppercase tracking-[0.12em] ${isLightMode ? "text-slate-600" : "text-raw-silver/55"}`}>COMMENTS</p>
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
                    placeholder="Add a comment…"
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
                      No comments yet. Be the first.
                    </p>
                  ) : (
                    (showAllComments ? currentComments : currentComments.slice(0, 3)).map((comment) => (
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
                  {currentComments.length > 3 && (
                    <button
                      onClick={() => setShowAllComments((prev) => !prev)}
                      className={`w-full rounded-xl border py-2 text-xs font-medium transition ${
                        isLightMode
                          ? "border-slate-200 text-slate-500 hover:bg-slate-100"
                          : "border-raw-border/35 text-raw-silver/55 hover:bg-raw-surface/20"
                      }`}
                    >
                      {showAllComments ? "Show less" : `Show ${currentComments.length - 3} more comment${currentComments.length - 3 === 1 ? "" : "s"}`}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-raw-text sm:text-xl">Personality Insights</h2>
            <div className={`mt-1 h-1.5 w-28 overflow-hidden rounded-full ${isLightMode ? "bg-slate-300/70" : "bg-raw-border/40"}`}>
              <span
                className="block h-full rounded-full bg-raw-gold"
                style={{ width: `${Math.min(100, Math.max(8, (unlockedReports / insightsProgress.length) * 100))}%` }}
              />
            </div>
          </div>
          <p className={`shrink-0 text-[11px] ${isLightMode ? "text-slate-600" : "text-raw-silver/55"}`}>
            {pollsAnswered} polls answered
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {insightsProgress.map((item) => (
            <article
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-xl border p-3 ${
                isLightMode
                  ? "border-slate-300/80 bg-white/85"
                  : "border-raw-gold/30 bg-raw-black/35 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <item.icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLightMode ? "text-amber-700" : "text-raw-gold/85"}`} />
                  <p className="font-display text-sm leading-snug text-raw-text">{item.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] ${
                    isLightMode
                      ? "border-amber-600/45 bg-amber-50 text-amber-700"
                      : "border-raw-gold/35 bg-raw-gold/10 text-raw-gold/85"
                  }`}
                >
                  {item.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div className={`flex-1 ${!item.unlocked ? "pointer-events-none select-none blur-[2px]" : ""}`}>
                <p className={`mt-1.5 text-[11px] leading-relaxed ${isLightMode ? "text-slate-600" : "text-raw-silver/55"}`}>
                  {item.description}
                </p>
                <button
                  disabled={!item.unlocked}
                  className={`mt-3 w-full rounded-lg border px-2 py-1.5 text-[11px] transition ${
                    item.unlocked
                      ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20"
                      : isLightMode
                        ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500"
                        : "cursor-not-allowed border-raw-border/40 bg-raw-black/35 text-raw-silver/45"
                  }`}
                >
                  {item.unlocked ? "Open report" : "Preview locked"}
                </button>
              </div>

              {!item.unlocked && (
                <div className="-mx-3 -mb-3 mt-2.5 flex items-center justify-between border-t border-dashed border-raw-border/40 px-2.5 py-1.5 text-[9px]">
                  <span className={isLightMode ? "text-slate-600" : "text-raw-silver/55"}>
                    {item.requiredPolls} polls req.
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 ${
                      isLightMode
                        ? "border-amber-600/40 bg-amber-100 text-amber-700"
                        : "border-raw-gold/40 bg-raw-gold/10 text-raw-gold/85"
                    }`}
                  >
                    <Lock className="h-2 w-2" />
                    {item.unlockPrice > 0 ? `$${item.unlockPrice}` : "Free"}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>

        <p className={`text-center text-xs ${isLightMode ? "text-slate-500" : "text-raw-silver/45"}`}>
          Answer more polls to unlock deeper reports.
        </p>
      </section>
    </div>
  );
}
