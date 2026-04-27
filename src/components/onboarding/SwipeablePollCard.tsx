import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, SendHorizontal, Sparkles } from "lucide-react";
import type { Comment } from "./PollComments";

interface SwipeablePollCardProps {
  id: string;
  question: string;
  options: string[];
  selectedOption?: string;
  isAnswered: boolean;
  totalResponses: number;
  responseStats: Record<string, number>;
  comments?: Comment[];
  pollIndex: number;
  totalPolls: number;
  onSwipe: (option: string) => void;
  onNavigate?: (direction: "left" | "right") => void;
  onAddComment?: (content: string) => void;
}

export function SwipeablePollCard({
  id,
  question,
  options,
  selectedOption,
  isAnswered,
  totalResponses,
  responseStats,
  comments = [],
  pollIndex,
  totalPolls,
  onSwipe,
  onNavigate,
  onAddComment,
}: SwipeablePollCardProps) {
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [updatedComments, setUpdatedComments] = useState<Comment[]>(comments);
  const [hasSeenSwipeGuide, setHasSeenSwipeGuide] = useState(false);
  const pointerStartXRef = useRef<number | null>(null);
  const guideStorageKey = "raw.onboarding.swipe-guide-seen";

  useEffect(() => { setUpdatedComments(comments); }, [comments]);

  useEffect(() => {
    const saved = window.localStorage.getItem(guideStorageKey);
    setHasSeenSwipeGuide(saved === "1");
  }, [guideStorageKey]);

  useEffect(() => {
    if (hasSeenSwipeGuide) window.localStorage.setItem(guideStorageKey, "1");
  }, [guideStorageKey, hasSeenSwipeGuide]);

  const yesOption = options.find((o) => o.trim().toLowerCase() === "yes");
  const noOption = options.find((o) => o.trim().toLowerCase() === "no");
  const orderedOptions = options.length === 2 && yesOption && noOption ? [noOption, yesOption] : options;
  const leftOption = orderedOptions[0];
  const rightOption = orderedOptions[1] ?? orderedOptions[0];
  const showSwipeGuide = !isAnswered && options.length >= 2 && !hasSeenSwipeGuide;

  const getOptionPercentage = (option: string): number => {
    if (totalResponses <= 0) return 0;
    return Math.round(((responseStats[option] ?? 0) / totalResponses) * 100);
  };

  const leftPercent = getOptionPercentage(leftOption);
  const rightPercent = getOptionPercentage(rightOption);

  const voteFromSwipeDirection = (direction: "left" | "right") => {
    if (isAnswered || options.length === 0) return;
    const selected = direction === "right" ? rightOption : leftOption;
    if (!selected) return;
    setHasSeenSwipeGuide(true);
    onSwipe(selected);
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("button, input, textarea, form, a"));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (showSwipeGuide || isInteractiveTarget(e.target)) return;
    pointerStartXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null || isAnswered) return;
    const delta = Math.max(-140, Math.min(140, e.clientX - pointerStartXRef.current));
    setSwipeOffsetX(delta);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) return;
    const delta = e.clientX - pointerStartXRef.current;
    pointerStartXRef.current = null;
    setSwipeOffsetX(0);
    if (Math.abs(delta) < 60) return;
    const direction = delta > 0 ? "right" : "left";
    if (isAnswered) { onNavigate?.(direction); return; }
    voteFromSwipeDirection(direction);
  };

  const handleCommentAdd = () => {
    const content = commentText.trim();
    if (!content) return;
    const next: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      avatar: 5,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      replies: [],
      isAnonymous: false,
    };
    setUpdatedComments((prev) => [next, ...prev]);
    onAddComment?.(content);
    setCommentText("");
  };

  const handleReplyAdd = (commentId: string) => {
    const content = replyText.trim();
    if (!content) return;
    const next: Comment = {
      id: `${commentId}-reply-${Date.now()}`,
      author: "You",
      avatar: 5,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      replies: [],
      isAnonymous: false,
    };
    setUpdatedComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, replies: [...(c.replies ?? []), next] } : c)
    );
    setReplyText("");
    setReplyingToId(null);
  };

  const selectedLeft = isAnswered && selectedOption === leftOption;
  const selectedRight = isAnswered && selectedOption === rightOption;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-raw-border/40 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),rgba(0,0,0,0.05)_35%,rgba(0,0,0,0.6)_100%)] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.4)] sm:rounded-[2rem] sm:p-6">
        <div className="mb-4 flex items-center justify-between text-xs text-raw-silver/45">
          <span>{pollIndex + 1}/{totalPolls} today</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        {/* Progress dots */}
        <div className="mb-5 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPolls }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === pollIndex ? "w-6 bg-raw-gold" : "w-2 bg-raw-border/60"
              }`}
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
          {/* Swipe guide overlay */}
          {showSwipeGuide && (
            <>
              <div className="absolute inset-0 z-20 rounded-[1.3rem] bg-raw-black/45 backdrop-blur-[2px]" />
              <div className="absolute left-1/2 top-1/2 z-30 w-[calc(100%-2rem)] max-w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-raw-gold/40 bg-raw-black/88 p-4 shadow-[0_0_30px_rgba(255,102,102,0.22)] backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-raw-gold/85">
                    <Sparkles className="h-3.5 w-3.5" />
                    Quick Swipe Guide
                  </p>
                  <button
                    type="button"
                    onClick={() => setHasSeenSwipeGuide(true)}
                    className="rounded-full border border-raw-gold/35 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-raw-gold/80 hover:bg-raw-gold/10"
                  >
                    Got it
                  </button>
                </div>
                <p className="mt-2 text-sm text-raw-silver/85">
                  Swipe to vote. Right means <span className="font-semibold text-emerald-300">{rightOption}</span>, left means <span className="font-semibold text-rose-300">{leftOption}</span>.
                </p>
              </div>
            </>
          )}

          {/* Swipe direction labels */}
          <div
            className={`mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] transition-opacity ${
              isAnswered ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            aria-hidden={isAnswered}
          >
            <span className={`transition ${swipeOffsetX < -20 ? "text-rose-300" : "text-raw-silver/35"}`}>{leftOption}</span>
            <span className={`transition ${swipeOffsetX > 20 ? "text-emerald-300" : "text-raw-silver/35"}`}>{rightOption}</span>
          </div>

          <h2 className="text-center font-display text-2xl leading-tight text-raw-text sm:text-[2rem]">
            {question}
          </h2>

          <div className="mt-6 space-y-3">
            {/* Swipe hint bar */}
            <div
              className={`flex h-[42px] items-center justify-between rounded-xl border border-raw-border/35 bg-raw-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-raw-silver/55 transition-opacity ${
                isAnswered ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              aria-hidden={isAnswered}
            >
              <span className="flex items-center gap-1.5 text-rose-200/85">
                <ArrowLeft className="h-3.5 w-3.5" />
                Swipe left = {leftOption}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-200/85">
                Swipe right = {rightOption}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Vote buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setHasSeenSwipeGuide(true); onSwipe(leftOption); setSwipeOffsetX(0); }}
                disabled={isAnswered}
                className={`relative rounded-2xl border px-4 py-3 text-left text-base font-medium transition disabled:cursor-not-allowed ${
                  selectedLeft
                    ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                    : "border-raw-gold/30 bg-raw-gold/18 text-raw-text hover:bg-raw-gold/28"
                } ${isAnswered ? "opacity-100" : "disabled:opacity-55"}`}
              >
                <span>{leftOption}</span>
                {isAnswered && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${selectedLeft ? "text-black" : "text-raw-text"}`}>
                    {leftPercent}%
                  </span>
                )}
              </button>

              <button
                onClick={() => { setHasSeenSwipeGuide(true); onSwipe(rightOption); setSwipeOffsetX(0); }}
                disabled={isAnswered}
                className={`relative rounded-2xl border px-4 py-3 text-right text-base font-medium transition disabled:cursor-not-allowed ${
                  selectedRight
                    ? "border-raw-gold/65 bg-raw-gold/50 text-black shadow-[0_0_18px_rgba(255,204,77,0.35)]"
                    : "border-raw-gold/30 bg-raw-gold/18 text-raw-text hover:bg-raw-gold/28"
                } ${isAnswered ? "opacity-100" : "disabled:opacity-55"}`}
              >
                <span>{rightOption}</span>
                {isAnswered && (
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${selectedRight ? "text-black" : "text-raw-text"}`}>
                    {rightPercent}%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Comments (after voting) */}
          {isAnswered && (
            <div className="mt-5">
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-raw-silver/55">Comments</p>
              <form
                onSubmit={(e) => { e.preventDefault(); handleCommentAdd(); }}
                className="flex items-center gap-2 rounded-full border border-raw-border/35 bg-raw-black/35 px-3 py-2"
              >
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm text-raw-text placeholder:text-raw-silver/35 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-full border border-raw-border/40 bg-raw-surface/40 p-2 text-raw-silver/80 transition hover:bg-raw-surface/55 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Add comment"
                >
                  <SendHorizontal className="h-3.5 w-3.5" />
                </button>
              </form>

              <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                {updatedComments.length === 0 ? (
                  <p className="text-center text-xs text-raw-silver/45">No comments yet. Be the first.</p>
                ) : (
                  updatedComments.slice(0, 6).map((comment) => (
                    <article key={comment.id} className="rounded-2xl border border-raw-border/35 bg-raw-black/50 px-3.5 py-2.5">
                      <div className="flex items-center justify-between text-[11px] text-raw-silver/50">
                        <span>@{comment.isAnonymous ? "Anonymous" : comment.author}</span>
                        <span>{comment.timestamp}</span>
                      </div>
                      <p className="mt-1 text-sm text-raw-silver/85">{comment.content}</p>

                      <div className="mt-2 space-y-1.5">
                        {(comment.replies ?? []).slice(-2).map((reply) => (
                          <div key={reply.id} className="rounded-xl border border-raw-border/35 bg-raw-black/30 px-3 py-2">
                            <div className="flex items-center justify-between text-[10px] text-raw-silver/45">
                              <span>@{reply.isAnonymous ? "Anonymous" : reply.author}</span>
                              <span>{reply.timestamp}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-raw-silver/80">{reply.content}</p>
                          </div>
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => { e.preventDefault(); handleReplyAdd(comment.id); }}
                        className="mt-2 flex items-center gap-2 rounded-full border border-raw-border/35 bg-raw-black/30 px-3 py-1.5"
                      >
                        <input
                          value={replyingToId === comment.id ? replyText : ""}
                          onFocus={() => setReplyingToId(comment.id)}
                          onChange={(e) => { setReplyingToId(comment.id); setReplyText(e.target.value); }}
                          placeholder="Reply..."
                          className="flex-1 bg-transparent text-xs text-raw-text placeholder:text-raw-silver/35 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={replyingToId !== comment.id || !replyText.trim()}
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
          )}
        </div>
      </div>
    </div>
  );
}
