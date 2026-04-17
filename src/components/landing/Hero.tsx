import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Boxes } from "@/components/ui/background-boxes";

interface HeroProps {
  onSignupClick: () => void;
}

export function Hero({ onSignupClick }: HeroProps) {
  const words = [
    { text: "Find", className: "text-raw-text" },
    { text: "your", className: "text-raw-text" },
    { text: "people.", className: "text-raw-gold" },
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24 sm:pt-20 md:pt-16">
      {/* Background Boxes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-raw-black via-raw-black to-raw-surface/30 z-[1]" />
        <Boxes className="opacity-30" />
      </div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-raw-gold/[0.03] blur-[120px] z-[1]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-center">
          {/* Copy */}
          <div className="animate-fade-in-up text-center sm:text-left">
            <p className="mb-5 font-display text-[10px] tracking-[0.22em] uppercase text-raw-gold/75 sm:mb-6 sm:text-[11px] sm:tracking-[0.35em]">
              Anonymous &bull; Community-First &bull; Identity-Driven
            </p>

            <TypewriterEffect
              words={words}
              className="!text-center !text-3xl sm:!text-left sm:!text-5xl lg:!text-[3.4rem] !font-display !tracking-wide !leading-tight"
            />

            <p className="mt-4 font-display text-lg tracking-wide text-metallic sm:text-2xl lg:text-3xl">
              Grow behind your avatar.
            </p>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-raw-silver/70 sm:mx-0 sm:max-w-lg sm:text-lg sm:text-raw-silver/60">
              Answer a few honest questions, join the right 24/7 communities,
              and build an identity that feels like yours — without using your real name.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <button
                onClick={onSignupClick}
                className="rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-ink transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
              >
                Join Free
              </button>
              <a
                href="#communities"
                className="rounded-full border border-raw-border px-8 py-3.5 text-center text-sm font-medium text-raw-silver/80 transition-all hover:border-raw-silver/30 hover:text-raw-text"
              >
                Explore the 3 Founding Communities
              </a>
            </div>

            <p className="mt-5 text-xs text-raw-silver/45">
              Username + password only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
