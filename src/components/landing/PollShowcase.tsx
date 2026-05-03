import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ListChecks, X } from "lucide-react";

const SHOWCASE_QUESTIONS = [
  "Should all high-impact content claims require visible evidence labels?",
  "Should anonymous accounts be allowed to post breaking news?",
  "Do you trust AI-generated content without disclosure?",
  "Should platforms verify creators before paying them?",
  "Should political ads include verified source citations?",
];

export function PollShowcase() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  if (!mounted || !open) return null;

  const total = SHOWCASE_QUESTIONS.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;
  const selected = answers[index];

  const handleAnswer = (choice: "yes" | "no") => {
    setAnswers((prev) => ({ ...prev, [index]: choice }));
    if (canNext) {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      advanceTimerRef.current = window.setTimeout(() => {
        setIndex((i) => Math.min(i + 1, total - 1));
        advanceTimerRef.current = null;
      }, 250);
    }
  };

  const overlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close poll preview"
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex flex-col items-center">
          <p className="text-xs tracking-[0.4em] text-white/55">
            {index + 1} / {total}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`h-0.5 transition-all ${
                  i === index ? "w-7 bg-raw-gold" : "w-5 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => canPrev && setIndex((i) => i - 1)}
            disabled={!canPrev}
            aria-label="Previous question"
            className="absolute left-0 z-10 flex h-10 w-10 -translate-x-2 items-center justify-center rounded-full border border-raw-gold/40 bg-black/60 text-raw-gold transition-all hover:bg-raw-gold/10 disabled:cursor-not-allowed disabled:opacity-30 sm:-translate-x-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative w-full max-w-[320px] rounded-[1.5rem] border border-raw-gold/35 bg-[#0a0a0a] px-6 py-7 shadow-[0_0_40px_rgba(241,196,45,0.15)]">
            <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-raw-gold/70" />
            <span className="absolute right-2 top-2 h-3 w-3 border-r border-t border-raw-gold/70" />
            <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-raw-gold/70" />
            <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-raw-gold/70" />

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5 h-14 w-14">
                <div
                  className="absolute inset-0 bg-raw-gold/10"
                  style={{
                    clipPath:
                      "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                  }}
                />
                <div
                  className="absolute inset-[2px] bg-[#0a0a0a]"
                  style={{
                    clipPath:
                      "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-raw-gold" />
                </div>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-raw-gold">
                Poll Question
              </p>

              <p className="mt-4 font-display text-xl leading-tight tracking-wide text-white sm:text-2xl">
                {SHOWCASE_QUESTIONS[index]}
              </p>

              <div className="mt-5 h-px w-12 bg-white/15" />

              <p className="mt-4 text-[11px] text-white/40">
                {selected
                  ? `You answered: ${selected.toUpperCase()}`
                  : "Tap Yes or No to answer"}
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAnswer("yes")}
                  className={`rounded-xl border py-3 text-base font-semibold transition-all active:scale-95 ${
                    selected === "yes"
                      ? "border-raw-gold bg-raw-gold/25 text-raw-gold"
                      : "border-raw-gold/55 bg-raw-gold/10 text-raw-gold hover:bg-raw-gold/15"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer("no")}
                  className={`rounded-xl border py-3 text-base font-semibold transition-all active:scale-95 ${
                    selected === "no"
                      ? "border-white bg-white/15 text-white"
                      : "border-white/30 text-white/85 hover:bg-white/5"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => canNext && setIndex((i) => i + 1)}
            disabled={!canNext}
            aria-label="Next question"
            className="absolute right-0 z-10 flex h-10 w-10 translate-x-2 items-center justify-center rounded-full border border-raw-gold/40 bg-black/60 text-raw-gold transition-all hover:bg-raw-gold/10 disabled:cursor-not-allowed disabled:opacity-30 sm:translate-x-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
