import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SendHorizontal } from "lucide-react";
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
  currentIndex: number;
  totalPolls: number;
  completedCount: number;
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
  currentIndex,
  totalPolls,
  completedCount,
}: SwipeablePollCardProps) {
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [updatedComments, setUpdatedComments] = useState<Comment[]>(comments);
  const pointerStartXRef = useRef<number | null>(null);
  const guideStorageKey = `raw.onboarding.swipe-guide-seen.${id}`;

  useEffect(() => setUpdatedComments(comments), [comments]);

  const yesOption = options.find((option) => option.trim().toLowerCase() === "yes");
  const noOption = options.find((option) => option.trim().toLowerCase() === "no");
  const orderedOptions = options.length === 2 && yesOption && noOption ? [yesOption, noOption] : options.slice(0, 2);
  const leftOption = orderedOptions[0];
  const rightOption = orderedOptions[1] ?? orderedOptions[0];

  const getOptionPercentage = (option: string): number => {
    if (totalResponses <= 0) return 0;
    return Math.round(((responseStats[option] ?? 0) / totalResponses) * 100);
  };

  const voteFromSwipeDirection = (direction: "left" | "right") => {
    if (isAnswered || options.length === 0) return;
    const selected = direction === "right" ? rightOption : leftOption;
    if (!selected) return;
    window.localStorage.setItem(guideStorageKey, "1");
    onSwipe(selected);
  };

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement && Boolean(target.closest("button, input, textarea, form, a"));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;
    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) return;
    const deltaX = event.clientX - pointerStartXRef.current;
    setSwipeOffsetX(Math.max(-120, Math.min(120, deltaX)));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) return;
    const deltaX = event.clientX - pointerStartXRef.current;
    pointerStartXRef.current = null;
    setSwipeOffsetX(0);

    if (Math.abs(deltaX) < 56) return;
    const direction = deltaX > 0 ? "right" : "left";
    if (isAnswered) {
      onNavigate?.(direction);
      return;
    }
    voteFromSwipeDirection(direction);
  };

  const handleCommentAdd = () => {
    const content = commentText.trim();
    if (!content) return;

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

  return (
    <div className="mx-auto w-full max-w-[28rem] rounded-[2rem] border border-[#3d3d3d] bg-[#080808] p-[clamp(0.9rem,3vw,1.2rem)] shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
      <div className="rounded-[1.25rem] border border-[#4c3a12] bg-[linear-gradient(180deg,#151515_0%,#0d0d0d_100%)] p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#575757] bg-black/40 px-4 py-3">
          <h3 className="text-[clamp(0.8rem,2.3vw,1rem)] uppercase tracking-[0.24em] text-[#ebebeb]">2. Answer 5 launch polls</h3>
          <span className="rounded-full border border-[#69521c] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f1c42d]">{completedCount}/{totalPolls} completed</span>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm tracking-[0.3em] text-[#d9d9d9]">{currentIndex + 1} / {totalPolls}</p>
          <div className="mx-auto mt-3 flex w-28 items-center justify-center gap-1.5">
            {Array.from({ length: totalPolls }, (_, i) => (
              <span key={i} className={`h-1 rounded-full ${i <= currentIndex ? "w-5 bg-[#f1c42d]" : "w-3 bg-white/15"}`} />
            ))}
          </div>
        </div>

        <div className="relative mt-5">
          <button aria-label="Previous poll" onClick={() => onNavigate?.("left")} className="absolute -left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#6a6a6a] bg-black/75 text-[#d9d9d9] hover:border-[#f1c42d] hover:text-[#f1c42d]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button aria-label="Next poll" onClick={() => onNavigate?.("right")} className="absolute -right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#6a6a6a] bg-black/75 text-[#d9d9d9] hover:border-[#f1c42d] hover:text-[#f1c42d]">
            <ChevronRight className="h-4 w-4" />
          </button>

          <article
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ transform: `translateX(${swipeOffsetX}px)` }}
            className="rounded-[1.4rem] border border-[#515151] bg-[radial-gradient(circle_at_50%_0%,rgba(241,196,45,0.18),rgba(9,9,9,0.95)_34%,rgba(5,5,5,1)_100%)] px-5 pb-5 pt-6 shadow-[inset_0_0_0_1px_rgba(217,217,217,0.16),inset_0_16px_30px_rgba(0,0,0,0.55)]"
          >
            <div className="mx-auto mb-4 h-12 w-12 rounded-[0.8rem] border border-[#705721] bg-[linear-gradient(145deg,#0f0f0f,#1b1b1b)] shadow-[0_0_14px_rgba(241,196,45,0.2)]" />
            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#f1c42d]">Poll Question</p>
            <h2 className="mt-3 text-center text-[clamp(1.75rem,6vw,2.4rem)] leading-[1.2] text-[#ebebeb]">{question}</h2>
            <p className="mt-3 text-center text-xs text-white/45">Swipe right for {rightOption}, left for {leftOption}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {orderedOptions.map((option, index) => {
                const isYes = option.trim().toLowerCase() === "yes";
                const isSelected = selectedOption === option && isAnswered;
                const pct = getOptionPercentage(option);
                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSwipe(option)}
                    disabled={isAnswered}
                    className={`rounded-xl border px-4 py-4 text-2xl transition active:scale-[0.98] disabled:cursor-not-allowed ${
                      isYes
                        ? "border-[#8d6e24] bg-[linear-gradient(160deg,rgba(241,196,45,0.24),rgba(20,16,7,0.95))] text-[#f1c42d] hover:shadow-[0_0_18px_rgba(241,196,45,0.2)]"
                        : "border-[#7f7f7f] bg-[linear-gradient(160deg,rgba(46,46,46,0.85),rgba(16,16,16,0.96))] text-[#d9d9d9] hover:border-[#bcbcbc]"
                    } ${isSelected ? "ring-1 ring-[#f1c42d]" : ""}`}
                  >
                    {option}
                    {isAnswered && <span className="block text-xs opacity-75">{pct}%</span>}
                  </button>
                );
              })}
            </div>
          </article>
        </div>

        <section className="mt-4 rounded-xl border border-[#4f4f4f] bg-[#101010] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d9d9d9]">Comments</p>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#3f3f3f] bg-black/40 px-3 py-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCommentAdd();
                }
              }}
              placeholder="Add a comment…"
              className="flex-1 bg-transparent text-sm text-[#ebebeb] outline-none placeholder:text-white/35"
            />
            <button type="button" aria-label="Send comment" onClick={handleCommentAdd} className="rounded-md border border-[#69521c] p-1.5 text-[#f1c42d]">
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
            {updatedComments.length === 0 ? (
              <p className="text-xs text-white/45">No comments yet. Be the first.</p>
            ) : (
              updatedComments.map((comment) => (
                <article key={comment.id} className="rounded-lg border border-[#2e2e2e] bg-black/35 px-3 py-2">
                  <p className="text-xs text-[#ebebeb]">{comment.content}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/45">{comment.author} · {comment.timestamp}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
