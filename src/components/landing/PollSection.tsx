import { useEffect, useRef, useState } from "react";
import type { Poll } from "@/store/useRawStore";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { ChevronLeft, ChevronRight, Send, ThumbsUp, MessageCircle, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface PollSectionProps {
  polls: Poll[];
  votedPolls: Set<string>;
  isLoggedIn: boolean;
  freeVotesUsed: number;
  onVote: (pollId: string, optionId: string) => void;
  onSignupClick: () => void;
}

const mockComments: Record<string, { user: string; text: string; time: string; likes: number }[]> = {
  "poll-1": [
    {
      user: "zen_spark",
      text: "This really made me think about what's been weighing on me.",
      time: "2h ago",
      likes: 5,
    },
    { user: "wave_rider", text: "Your mindset is everything.", time: "3h ago", likes: 2 },
  ],
  "poll-2": [
    {
      user: "night_echo",
      text: "It depends how you use it honestly.",
      time: "1h ago",
      likes: 8,
    },
    { user: "raw_signal", text: "Deleted all my apps. Best decision.", time: "4h ago", likes: 3 },
  ],
  "poll-3": [
    {
      user: "ghost_mind",
      text: "Growth is uncomfortable but worth it.",
      time: "30m ago",
      likes: 12,
    },
    {
      user: "quiet_flame",
      text: "Comfort is underrated sometimes though.",
      time: "2h ago",
      likes: 6,
    },
  ],
};

function PollPhoneContent({
  poll,
  hasVoted,
  onVote,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  pollIndex,
  totalPolls,
}: {
  poll: Poll;
  hasVoted: boolean;
  onVote: (optionId: string) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  pollIndex: number;
  totalPolls: number;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const commentsPopupRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<"yes" | "no" | null>(null);

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const comments = mockComments[poll.id] || [];
  const yesOption = poll.options.find((o) => o.text === "Yes");
  const noOption = poll.options.find((o) => o.text === "No");
  const yesPct = yesOption && totalVotes > 0 ? Math.round((yesOption.votes / totalVotes) * 100) : 0;
  const noPct = noOption && totalVotes > 0 ? Math.round((noOption.votes / totalVotes) * 100) : 0;

  useEffect(() => {
    setCommentsOpen(false);
    setSwipeHint(null);
  }, [poll.id, hasVoted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (hasVoted) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (hasVoted || touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 20) setSwipeHint(delta > 0 ? "yes" : "no");
    else setSwipeHint(null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (hasVoted || touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    setSwipeHint(null);
    if (Math.abs(delta) < 50) return;
    if (delta > 0 && yesOption) onVote(yesOption.id);
    else if (delta < 0 && noOption) onVote(noOption.id);
  };

  useEffect(() => {
    if (!commentsOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!commentsPopupRef.current) return;
      if (!commentsPopupRef.current.contains(event.target as Node)) {
        setCommentsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [commentsOpen]);

  return (
    <div className="relative h-[480px] overflow-hidden bg-[#080808] px-4 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-[max(0.6rem,env(safe-area-inset-top))] pointer-events-auto select-none" style={{ userSelect: "none" }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(217,217,217,0.3) 1px, transparent 0)", backgroundSize: "14px 14px" }} />
      <div className="relative flex h-full flex-col select-none" style={{ userSelect: "none" }}>
        <div className="mb-3 rounded-2xl border border-[#7f7f7f]/45 bg-[#121212] px-3 py-2 shadow-[inset_0_0_0_1px_rgba(241,196,45,0.12)]">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-[10px] tracking-[0.16em] uppercase text-[#EBEBEB]">2. Answer 5 launch polls</p>
            <span className="rounded-full border border-[#F1C42D]/55 bg-[#F1C42D]/12 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#F1C42D]">{Math.min(pollIndex + Number(hasVoted), totalPolls)}/{totalPolls} completed</span>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] tracking-[0.35em] text-[#D9D9D9]">{pollIndex + 1} / {totalPolls}</p>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalPolls }, (_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === pollIndex ? "w-5 bg-[#F1C42D] shadow-[0_0_10px_rgba(241,196,45,0.5)]" : "w-2 bg-[#3a3a3a]"}`} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-[9px] text-white/25 flex items-center gap-1 select-none" style={{ userSelect: 'none' }}>
              <ThumbsUp className="h-2.5 w-2.5" /> {totalVotes}
            </span>
            <button
              type="button"
              onClick={() => hasVoted && comments.length > 0 && setCommentsOpen((prev) => !prev)}
              disabled={!hasVoted || comments.length === 0}
              className={`text-[9px] flex items-center gap-1 rounded-full px-2 py-1 transition-all select-none ${
                hasVoted && comments.length > 0 ? "text-white/60 hover:bg-white/10" : "text-white/20 cursor-default"
              }`}
              style={{ userSelect: 'none' }}
            >
              <MessageCircle className="h-2.5 w-2.5" /> {comments.length}
            </button>
          </div>
        </div>

        <div
          className={`relative rounded-[1.75rem] border p-5 flex-1 flex flex-col justify-center select-none transition-colors duration-150 ${
            swipeHint === "yes"
              ? "bg-emerald-900/20 border-emerald-400/40"
              : swipeHint === "no"
              ? "bg-rose-900/20 border-rose-400/40"
              : "border-[#D9D9D9]/35 bg-[linear-gradient(160deg,#171717,#0d0d0d)]"
          }`}
          style={{ userSelect: "none", touchAction: hasVoted ? "auto" : "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {pollIndex === 0 && !hasVoted && (
            <div className="absolute inset-x-4 top-3 z-10 rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4">
                <span className="text-xs text-rose-300">👈 No</span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-xs text-emerald-300">Yes 👉</span>
              </div>
            </div>
          )}

          <p className="mb-2 text-center text-[9px] uppercase tracking-[0.24em] text-[#F1C42D]/80">POLL QUESTION</p>
          <p className={`font-display text-2xl tracking-wide text-[#EBEBEB] text-center leading-snug font-medium select-none ${pollIndex === 0 && !hasVoted ? "mt-4" : ""}`} style={{ userSelect: "none" }}>
            {poll.question}
          </p>

          {!hasVoted && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => noOption && onVote(noOption.id)}
                className="flex-1 rounded-2xl border border-[#D9D9D9]/45 bg-[linear-gradient(145deg,rgba(27,27,27,0.98),rgba(10,10,10,0.9))] py-3 text-base font-semibold text-[#D9D9D9] transition-all active:scale-95 hover:border-[#F1C42D]/55"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => yesOption && onVote(yesOption.id)}
                className="flex-1 rounded-2xl border border-[#F1C42D]/55 bg-[linear-gradient(145deg,rgba(241,196,45,0.24),rgba(20,20,20,0.95))] py-3 text-base font-semibold text-[#F1C42D] transition-all active:scale-95 hover:brightness-110"
              >
                Yes
              </button>
            </div>
          )}

          {hasVoted && (
            <div className="mt-5 space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.06]">
                <div className="absolute inset-y-0 left-0 bg-raw-gold/25 transition-all duration-700" style={{ width: `${yesPct}%` }} />
                <div className="relative flex items-center justify-between px-5 py-3.5" style={{ userSelect: "none" }}>
                  <span className="text-xs text-white/70">Yes</span>
                  <span className="text-sm font-bold text-raw-gold">{yesPct}%</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.06]">
                <div className="absolute inset-y-0 left-0 bg-white/15 transition-all duration-700" style={{ width: `${noPct}%` }} />
                <div className="relative flex items-center justify-between px-5 py-3.5" style={{ userSelect: "none" }}>
                  <span className="text-xs text-white/70">No</span>
                  <span className="text-sm font-bold text-white/90">{noPct}%</span>
                </div>
              </div>
              <p className="text-[9px] text-white/40 text-center pt-1 select-none" style={{ userSelect: "none" }}>{totalVotes.toLocaleString()} anonymous responses</p>
            </div>
          )}
        </div>

        {hasVoted && (
        <div className="mt-3 flex gap-2" style={{ userSelect: 'none' }}>
          {canGoPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="flex-1 rounded-xl border border-white/15 py-2.5 text-[11px] font-medium text-white/50 hover:border-white/30 hover:text-white/70 transition-all flex items-center justify-center gap-1 select-none"
              style={{ userSelect: 'none' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
          )}
          {canGoNext && (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1 select-none"
              style={{ userSelect: 'none' }}
            >
              Next Question <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        )}
      </div>

      {hasVoted && comments.length > 0 && commentsOpen && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/15 px-3 pb-14" style={{ userSelect: 'none' }}>
          <div
            ref={commentsPopupRef}
            className="w-full rounded-2xl border border-white/12 bg-[#0f0f11]/95 p-3 shadow-2xl shadow-black/70 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
            style={{ userSelect: 'none' }}
          >
            <div className="mb-2 flex items-center justify-between select-none" style={{ userSelect: 'none' }}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 select-none" style={{ userSelect: 'none' }}>Comments</p>
              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                className="rounded-full p-1 text-white/45 hover:bg-white/10 hover:text-white/70 select-none"
                style={{ userSelect: 'none' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#111] border border-white/10 px-3 py-2 select-none" style={{ userSelect: 'none' }}>
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-[11px] text-white placeholder:text-white/20 outline-none select-none"
                readOnly
                style={{ userSelect: 'none' }}
              />
              <Send className="h-3.5 w-3.5 text-white/20" />
            </div>

            <div className="max-h-[170px] space-y-1.5 overflow-y-auto pr-1 select-none" style={{ userSelect: 'none' }}>
              {comments.map((comment, i) => (
                <div key={i} className="rounded-xl bg-[#111] border border-white/8 px-3 py-2 select-none" style={{ userSelect: 'none' }}>
                  <p className="text-[10px] text-white/50 leading-relaxed select-none" style={{ userSelect: 'none' }}>{comment.text}</p>
                  <div className="mt-1 flex items-center gap-2 select-none" style={{ userSelect: 'none' }}>
                    <span className="text-[8px] font-medium text-white/30 select-none" style={{ userSelect: 'none' }}>@{comment.user}</span>
                    <span className="text-[8px] text-white/15 select-none" style={{ userSelect: 'none' }}>{comment.time}</span>
                    <span className="text-[8px] text-white/20 select-none" style={{ userSelect: 'none' }}>↑ {comment.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PollSection({ polls, votedPolls, isLoggedIn, freeVotesUsed, onVote, onSignupClick }: PollSectionProps) {
  const [currentPoll, setCurrentPoll] = useState(0);
  const sectionRef = useTrackSectionView("polls");
  const gateFiredRef = useRef(false);

  if (polls.length === 0) return null;

  const goNext = () => setCurrentPoll((p) => Math.min(p + 1, polls.length - 1));
  const goPrev = () => setCurrentPoll((p) => Math.max(p - 1, 0));

  const currentHasVoted = votedPolls.has(polls[currentPoll].id);
  const showSignupGate = !isLoggedIn && freeVotesUsed >= 3;

  const handleVote = (optionId: string) => {
    const pollId = polls[currentPoll].id;
    const nextVotesUsed = !isLoggedIn ? freeVotesUsed + 1 : freeVotesUsed;
    const gateReached = !isLoggedIn && nextVotesUsed >= 3;
    track("landing_poll_sampled", {
      poll_id: pollId,
      option_id: optionId,
      votes_used: nextVotesUsed,
      gate_reached: gateReached,
    });
    if (gateReached && !gateFiredRef.current) {
      gateFiredRef.current = true;
      track("signup_gate_triggered", {
        trigger: "poll_gate",
        votes_used: nextVotesUsed,
      });
    }
    onVote(pollId, optionId);
  };

  const handleGateSignupClick = () => {
    track("landing_cta_clicked", {
      cta_id: "poll_gate_signup",
      cta_text: "Sign Up & Earn Rewards",
      source_section: "polls",
    });
    onSignupClick();
  };

  return (
    <LandingSectionShell
      id="polls"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Start with a question."
      description={
        <>
          Answer anonymously and see live results instantly.
          {!isLoggedIn && " Answer 3 questions free — then sign up to keep going."}
        </>
      }
    >
      <div className="w-full">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-sm sm:w-auto sm:max-w-none">
            {showSignupGate ? (
              <PhoneMockup>
                <div className="h-[480px] bg-black px-5 py-6 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-raw-gold/10 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <p className="font-display text-lg tracking-wide text-white mb-2">You've answered 3 polls!</p>
                    <p className="text-sm text-white/40 mb-2 max-w-[200px] mx-auto leading-relaxed">
                      Sign up to earn your reward and keep answering.
                    </p>
                    <p className="text-xs text-raw-gold/60 mb-6">+3 coins per poll answered</p>
                    <button
                      type="button"
                      onClick={handleGateSignupClick}
                      className="rounded-full bg-raw-gold px-8 py-3 text-sm font-bold text-raw-black hover:bg-raw-gold/90 transition-all active:scale-95"
                    >
                      Sign Up & Earn Rewards
                    </button>
                  </div>
                </div>
              </PhoneMockup>
            ) : (
              <PhoneMockup>
                <PollPhoneContent
                  poll={polls[currentPoll]}
                  hasVoted={currentHasVoted}
                  onVote={handleVote}
                  canGoPrev={currentPoll > 0}
                  canGoNext={currentPoll < polls.length - 1}
                  onPrev={goPrev}
                  onNext={goNext}
                  pollIndex={currentPoll}
                  totalPolls={polls.length}
                />
              </PhoneMockup>
            )}
          </div>
        </div>

      </div>
    </LandingSectionShell>
  );
}
