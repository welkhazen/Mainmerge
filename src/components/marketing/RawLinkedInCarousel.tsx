import React from "react";

type Slide = {
  id: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string[];
  bullets?: string[];
  cta?: string;
};

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: "raW",
    title: "Most people don’t know what they actually need.",
    subtitle: "So they search blindly. Pick randomly. Stay stuck.",
    cta: "raW changes that.",
  },
  {
    id: 2,
    eyebrow: "raW IS:",
    title: "A Self-Discovery Engine, Live Community Platform, and Wellness Marketplace.",
    body: ["All in one intelligent system."],
  },
  {
    id: 3,
    eyebrow: "How raW Works",
    title: "3 Simple Steps",
    body: [
      "1. Learn about you through answers, behavior, and signals.",
      "2. Match you into the right people, communities, and micro-communities.",
      "3. Connect you to the right help, services, and growth paths.",
    ],
  },
  {
    id: 4,
    eyebrow: "Why it gets better",
    title: "The more you use raW, the smarter it gets.",
    bullets: ["better people", "better communities", "better support", "better growth paths"],
  },
  {
    id: 5,
    eyebrow: "Start here",
    title: "Better matches. Real connections.",
    subtitle: "Every day. 24/7. Live.",
    cta: "Join raW — Free",
  },
];

function GoldLine() {
  return <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-[#F1C42D] to-transparent opacity-90" />;
}

function SlideFrame({
  index,
  total,
  children,
}: {
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[1200px] overflow-hidden rounded-[36px] border border-[#F1C42D]/30 bg-[#080808] text-[#EBEBEB] shadow-[0_0_40px_rgba(241,196,45,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,196,45,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(241,196,45,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(241,196,45,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      <div className="absolute right-8 top-8 rounded-full border border-[#F1C42D]/30 bg-black/40 px-4 py-2 text-sm tracking-[0.25em] text-[#F1C42D]">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="relative z-10 flex h-full w-full flex-col px-[88px] py-[96px]">{children}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex w-fit rounded-full border border-[#F1C42D]/35 bg-black/50 px-5 py-2 text-sm font-medium tracking-[0.24em] text-[#F1C42D] shadow-[0_0_20px_rgba(241,196,45,0.16)]">
      {children}
    </div>
  );
}

function RawWordmark() {
  return (
    <div className="inline-block bg-gradient-to-b from-[#FFF4C7] via-[#F1C42D] to-[#B8860B] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(241,196,45,0.22)]">
      raW
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {slide.eyebrow && <Eyebrow>{slide.eyebrow}</Eyebrow>}

        <div className="mt-10 max-w-[920px]">
          <h2 className="text-[76px] leading-[0.96] tracking-[-0.04em] text-[#EBEBEB]">
            {slide.id === 1 ? (
              <>
                Most people don’t know what they actually <span className="text-[#F1C42D]">need.</span>
              </>
            ) : slide.id === 5 ? (
              <>
                Better matches. <span className="text-[#F1C42D]">Real connections.</span>
              </>
            ) : slide.id === 2 ? (
              <>
                <RawWordmark /> IS:
              </>
            ) : (
              slide.title
            )}
          </h2>

          {slide.id === 2 ? (
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                {
                  title: "Self-Discovery Engine",
                  text: "Learns from answers, behavior, and signals.",
                },
                {
                  title: "Live Community Platform",
                  text: "Anonymous, live, 24/7 communities and micro-communities.",
                },
                {
                  title: "Wellness Marketplace",
                  text: "Access the right support, coaches, therapists, and services.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-[28px] border border-[#F1C42D]/20 bg-white/[0.04] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="mb-6 h-14 w-14 rounded-2xl border border-[#F1C42D]/25 bg-black/40 shadow-[0_0_18px_rgba(241,196,45,0.1)]" />
                  <h3 className="text-[30px] leading-tight text-[#EBEBEB]">{card.title}</h3>
                  <p className="mt-4 text-[22px] leading-[1.35] text-[#CFCFCF]">{card.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {slide.subtitle && <p className="mt-8 max-w-[860px] text-[34px] leading-[1.22] text-[#CFCFCF]">{slide.subtitle}</p>}

              {slide.body && (
                <div className="mt-10 space-y-5">
                  {slide.body.map((line) => (
                    <div
                      key={line}
                      className="rounded-[24px] border border-[#F1C42D]/20 bg-white/[0.04] p-6 text-[28px] leading-[1.28] text-[#EBEBEB]"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {slide.bullets && (
                <div className="mt-12 grid grid-cols-2 gap-5">
                  {slide.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-center gap-4 rounded-[22px] border border-[#F1C42D]/20 bg-white/[0.04] px-6 py-5 text-[28px] text-[#EBEBEB]"
                    >
                      <span className="h-3 w-3 rounded-full bg-[#F1C42D]" />
                      {bullet}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-12">
        <GoldLine />
        {slide.cta && (
          <div className="mt-8 inline-flex rounded-full border border-[#F1C42D]/40 bg-black/50 px-8 py-4 text-[28px] font-medium text-[#F1C42D] shadow-[0_0_24px_rgba(241,196,45,0.18)]">
            {slide.cta}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RawLinkedInCarousel() {
  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        {slides.map((slide, index) => (
          <SlideFrame key={slide.id} index={index} total={slides.length}>
            <SlideContent slide={slide} />
          </SlideFrame>
        ))}
      </div>
    </div>
  );
}
