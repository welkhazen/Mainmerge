import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
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

  useEffect(() => {
    setUpdatedComments(comments);
  }, [comments]);

  useEffect(() => {
    const saved = window.localStorage.getItem(guideStorageKey);
    setHasSeenSwipeGuide(saved === "1");
  }, [guideStorageKey]);

  useEffect(() => {
    if (hasSeenSwipeGuide) {
      window.localStorage.setItem(guideStorageKey, "1");
    }
  }, [guideStorageKey, hasSeenSwipeGuide]);

  const yesOption = options.find((option) => option.trim().toLowerCase() === "yes");
  const noOption = options.find((option) => option.trim().toLowerCase() === "no");
  const orderedOptions = options.length === 2 && yesOption && noOption ? [noOption, yesOption] : options;
  const leftOption = orderedOptions[0];
  const rightOption = orderedOptions[1] ?? orderedOptions[0];
  const showSwipeGuide = !isAnswered && options.length >= 2 && !hasSeenSwipeGuide;

  const getOptionPercentage = (option: string): number => {
    if (totalResponses <= 0) {
      return 0;
    }

    return Math.round(((responseStats[option] ?? 0) / totalResponses) * 100);
  };

  const voteFromSwipeDirection = (direction: "left" | "right") => {
    if (isAnswered || options.length === 0) {
      return;
    }

    const selected = direction === "right" ? rightOption : leftOption;
    if (!selected) {
      return;
    }

    setHasSeenSwipeGuide(true);
    onSwipe(selected);
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(target.closest("button, input, textarea, form, a"));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) {
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

    const direction = deltaX > 0 ? "right" : "left";
    if (isAnswered) {
      onNavigate?.(direction);
      return;
    }

    voteFromSwipeDirection(direction);
  };

  const handleCommentAdd = () => {
    const content = commentText.trim();
    if (!content) {
      return;
    }

    const nextComment: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      avatar: 5,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      replies: [],
      isAnonymous: false,
    };

    setUpdatedComments((previous) => [nextComment, ...previous]);
    onAddComment?.(content);
    setCommentText("");
  };

  const handleReplyAdd = (commentId: string) => {
    const content = replyText.trim();
    if (!content) {
      return;
    }

    const nextReply: Comment = {
      id: `${commentId}-reply-${Date.now()}`,
      author: "You",
      avatar: 5,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      replies: [],
      isAnonymous: false,
    };

    setUpdatedComments((previous) =>
      previous.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies ?? []), nextReply],
            }
          : comment
      )
    );

    setReplyText("");
    setReplyingToId(null);
  };

  return (
    <div className="space-y-6">
      <div
        className="relative mx-auto w-full max-w-[760px] rounded-2xl border border-raw-border/40 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.1),rgba(0,0,0,0.06)_35%,rgba(0,0,0,0.6)_100%)] p-3 shadow-[0_20px_45px_rgba(0,0,0,0.4)] sm:rounded-[2rem] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between text-xs text-raw-silver/45">
          <span>Question for you</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <div
          className="relative rounded-2xl border border-white/10 bg-black/65 p-4 sm:rounded-[1.7rem] sm:p-6"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ transform: `translateX(${swipeOffsetX}px) rotate(${swipeOffsetX * 0.04}deg)` }}
        >
          {showSwipeGuide && options.length >= 2 && (
            <>
              <div className="absolute inset-x-4 top-14 z-30 rounded-2xl border border-raw-gold/40 bg-black/85 p-4 shadow-[0_0_30px_rgba(255,102,102,0.22)] backdrop-blur-sm sm:inset-x-10">
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
                <p className="mt-2 text-sm text-white/80">
                  Swipe to vote. Right means <span className="font-semibold text-emerald-300">{rightOption}</span>, left means <span className="font-semibold text-rose-300">{leftOption}</span>.
                </p>
              </div>
            </>
          )}

          {!isAnswered && options.length >= 2 && (
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
              <span className={`transition ${swipeOffsetX < -20 ? "text-rose-300" : "text-white/35"}`}>{leftOption}</span>
              <span className={`transition ${swipeOffsetX > 20 ? "text-emerald-300" : "text-white/35"}`}>{rightOption}</span>
            </div>
          )}

          <h2 className="text-center font-display text-lg leading-snug text-white sm:text-2xl md:text-[2rem] md:leading-tight">
            {question}
          </h2>

          <div className="mt-5 space-y-3 sm:mt-6">
            <div className={`grid gap-2 sm:gap-3 ${orderedOptions.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {orderedOptions.map((option, index) => {
                const isSelected = isAnswered && selectedOption === option;
                const isRightSide = orderedOptions.length === 2 && index === 1;
                const percent =
                  isAnswered && orderedOptions.length === 2
                    ? getOptionPercentage(option)
                    : null;

                return (
                  <button
                    key={option}
                    onClick={() => {
                      setHasSeenSwipeGuide(true);
                      onSwipe(option);
                      setSwipeOffsetX(0);
                    }}
                    disabled={isAnswered}
                    className={`min-h-[52px] rounded-2xl border px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed sm:px-4 sm:text-base ${
                      isRightSide ? "text-right" : "text-left"
                    } ${
                      isSelected
                        ? "border-raw-gold/70 bg-raw-gold/55 text-black"
                        : "border-raw-gold/30 bg-raw-gold/18 text-white hover:bg-raw-gold/28 disabled:opacity-55"
                    }`}
                  >
                    {percent !== null && isRightSide ? (
                      <span className={`mr-2 text-sm ${isSelected ? "text-black/85" : "text-white/70"}`}>{percent}%</span>
                    ) : null}
                    {option}
                    {percent !== null && !isRightSide ? (
                      <span className={`ml-2 text-sm ${isSelected ? "text-black/85" : "text-white/70"}`}>{percent}%</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {isAnswered && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/55">Comments</p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCommentAdd();
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
            >
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="rounded-full border border-white/20 bg-white/10 p-2 text-white/80 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add comment"
              >
                <SendHorizontal className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {updatedComments.length === 0 ? (
                <p className="text-center text-xs text-white/45">No comments yet for this poll.</p>
              ) : (
                updatedComments.slice(0, 6).map((comment) => (
                  <article key={comment.id} className="rounded-2xl border border-white/20 bg-black/55 px-3.5 py-2.5">
                    <div className="flex items-center justify-between text-[11px] text-white/50">
                      <span>@{comment.isAnonymous ? "Anonymous" : comment.author}</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-white/80">{comment.content}</p>

                    <div className="mt-2 space-y-1.5">
                      {(comment.replies ?? []).slice(-2).map((reply) => (
                        <div key={reply.id} className="rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2">
                          <div className="flex items-center justify-between text-[10px] text-white/45">
                            <span>@{reply.isAnonymous ? "Anonymous" : reply.author}</span>
                            <span>{reply.timestamp}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/75">{reply.content}</p>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleReplyAdd(comment.id);
                      }}
                      className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5"
                    >
                      <input
                        value={replyingToId === comment.id ? replyText : ""}
                        onFocus={() => setReplyingToId(comment.id)}
                        onChange={(event) => {
                          setReplyingToId(comment.id);
                          setReplyText(event.target.value);
                        }}
                        placeholder="Reply..."
                        className="flex-1 bg-transparent text-xs text-white placeholder:text-white/35 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={replyingToId !== comment.id || !replyText.trim()}
                        className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
