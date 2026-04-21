import { Suspense, lazy } from "react";
import { Logo3D } from "@/components/ui/logo-3d";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { useFeatureExperiments } from "@/hooks/useFeatureExperiments";

const BoxesLazy = lazy(() => import("@/components/ui/background-boxes").then((module) => ({ default: module.Boxes })));
const TypewriterEffectLazy = lazy(() =>
  import("@/components/ui/typewriter-effect").then((module) => ({ default: module.TypewriterEffect }))
);

interface HeroProps {
  onSignupClick: () => void;
}

export function Hero({ onSignupClick }: HeroProps) {
  const sectionRef = useTrackSectionView("hero");
  const { heroCopy, signupCta } = useFeatureExperiments();

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
      className="hero-landing relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-24 sm:pt-28 bg-black/40"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="hero-landing-overlay absolute inset-0 z-[1] bg-gradient-to-b from-raw-black via-raw-black to-raw-surface" />
        <Suspense fallback={null}>
          <BoxesLazy className="opacity-30" />
        </Suspense>
      </div>

      <div className="absolute left-1/2 top-[28%] z-[1] h-[62vw] max-h-[620px] w-[62vw] max-w-[620px] -translate-x-1/2 rounded-full bg-raw-gold/[0.035] blur-[120px]" />

      <div className="relative z-10 flex w-full flex-col items-center text-center">
        <div className="mb-7 sm:mb-8">
          <Logo3D size={148} className="sm:[width:172px] sm:[height:172px] md:[width:196px] md:[height:196px]" />
        </div>

        <p className="mb-5 font-display text-[10px] uppercase tracking-[0.33em] text-raw-gold/70 sm:text-[11px]">
          Anonymous &bull; Community-First &bull; Identity-Driven
        </p>

        <Suspense fallback={<h1 className="font-display text-[2rem] leading-[1.15] tracking-wide text-raw-text sm:text-[2.7rem] md:text-[3.25rem]">Find your people.</h1>}>
          <TypewriterEffectLazy
            words={words}
            className="!text-center !font-display !text-[2rem] !leading-[1.15] !tracking-wide sm:!text-[2.7rem] md:!text-[3.25rem]"
          />
        </Suspense>

        <p className="mt-4 font-display text-lg tracking-wide text-metallic sm:text-2xl">Grow behind your avatar.</p>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-raw-silver/60 sm:text-lg">
          Anonymous poll voting. Real conversations. Communities that match who you actually are. No algorithms. No reputation damage.
        </p>

        <div className="mt-9 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={handleJoinClick}
            className="w-full rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20 sm:w-auto"
          >
            {signupLabel}
          </button>

          <a
            href="#communities"
            onClick={handleExploreClick}
            className="w-full rounded-full border border-raw-border px-8 py-3.5 text-center text-sm font-medium text-raw-silver/80 transition-all hover:border-raw-silver/30 hover:text-raw-text sm:w-auto"
          >
            Explore the 3 Founding Communities
          </a>
        </div>

        <p className="mt-5 text-xs text-raw-silver/40">Username + password only.</p>
      </div>
    </section>
  );
}
