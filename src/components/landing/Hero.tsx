import { Suspense, lazy, useState } from "react";
import { Logo3D } from "@/components/ui/logo-3d";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { useFeatureExperiments } from "@/hooks/useFeatureExperiments";
import { DottedSurface } from "@/components/ui/dotted-surface";

const BoxesLazy = lazy(() => import("@/components/ui/background-boxes").then((module) => ({ default: module.Boxes })));
const TypewriterEffectLazy = lazy(() =>
  import("@/components/ui/typewriter-effect").then((module) => ({ default: module.TypewriterEffect }))
);

interface HeroProps {
  onSignupClick: () => void;
  showDottedSurface?: boolean;
}

export function Hero({ onSignupClick, showDottedSurface = true }: HeroProps) {
  const sectionRef = useTrackSectionView("hero");
  const { heroCopy, signupCta } = useFeatureExperiments();
  const [showMatrixIntro, setShowMatrixIntro] = useState(true);

  const words = [
    ...(heroCopy === "identity-first"
      ? [
          { text: "Be", className: "text-raw-text" },
          { text: "authentically", className: "text-raw-text" },
          { text: "you.", className: "text-raw-gold" },
        ]
      : [
          { text: "Be", className: "text-raw-text" },
          { text: "authentically", className: "text-raw-text" },
          { text: "you.", className: "text-raw-gold" },
        ]),
  ];

  const signupLabel = signupCta === "start-anonymous" ? "Start Anonymous" : "Join Free";

  const handleJoinClick = () => {
    track("landing_cta_clicked", {
      cta_id: "hero_join_free",
      cta_text: signupLabel,
      source_section: "hero",
    });
    onSignupClick();
  };

  const handleExploreClick = () => {
    track("landing_cta_clicked", {
      cta_id: "hero_explore_communities",
      cta_text: "Explore the 3 Founding Communities",
      source_section: "hero",
    });
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="hero-landing relative flex min-h-screen items-center overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pb-16 sm:pt-24 md:pt-28 bg-black/40"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <DottedSurface className="absolute inset-0 z-0" />
        <div className="hero-landing-overlay absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-black/20 to-black/40" />
        <Suspense fallback={null}>
          <BoxesLazy className="opacity-30" />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[28%] z-[1] h-[80vw] max-h-[400px] w-[80vw] max-w-[400px] -translate-x-1/2 rounded-full bg-raw-gold/[0.035] blur-[100px] sm:h-[62vw] sm:max-h-[620px] sm:w-[62vw] sm:max-w-[620px] sm:blur-[120px]" />

      <div className="relative z-10 flex w-full flex-col items-center text-center">
        <div className="mb-5 sm:mb-8">
          <Logo3D size={104} className="sm:[width:148px] sm:[height:148px] md:[width:172px] md:[height:172px] lg:[width:196px] lg:[height:196px]" />
        </div>

        <p className="mb-5 font-display text-[10px] uppercase tracking-[0.2em] text-raw-gold/70 sm:tracking-[0.33em] sm:text-[11px]">
          Anonymous &bull; Community-First &bull; Identity-Driven
        </p>

        <Suspense fallback={<h1 className="font-display text-[1.75rem] leading-[1.12] tracking-wide text-raw-text sm:text-[2.7rem] md:text-[3.25rem]">Find your people.</h1>}>
          <TypewriterEffectLazy
            words={words}
            className="!text-center !font-display !text-[1.75rem] !leading-[1.12] !tracking-wide sm:!text-[2.7rem] md:!text-[3.25rem]"
          />
        </Suspense>

        <p className="mt-3 font-display text-base tracking-wide text-metallic sm:mt-4 sm:text-2xl">Grow behind your avatar.</p>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-raw-silver/60 sm:mt-5 sm:text-base md:text-lg">
          Anonymous poll voting. Real conversations. Communities that match who you actually are. No algorithms. No reputation damage.
        </p>

        <div className="mt-7 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-xl sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={handleJoinClick}
            className="rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20 sm:w-auto"
          >
            {signupLabel}
          </button>

          <a
            href="#communities"
            onClick={handleExploreClick}
            className="rounded-full border border-raw-border px-6 py-3.5 text-center text-sm font-medium text-raw-silver/80 transition-all hover:border-raw-silver/30 hover:text-raw-text sm:w-auto sm:px-8"
          >
            Explore Communities
          </a>
        </div>

        <p className="mt-4 text-xs text-raw-silver/40 sm:mt-5">Username + password only.</p>
      </div>
    </section>
  );
}
