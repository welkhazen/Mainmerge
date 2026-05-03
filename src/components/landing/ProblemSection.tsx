import { RadialOrbitalTimelineDemo } from "@/components/ui/radial-orbital-timeline-demo";
import { Card, CardContent } from "@/components/ui/card";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="landing-section relative px-4 py-14 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2
          className="landing-section-accent-title mb-8 text-center font-display text-xl tracking-wide sm:mb-12 sm:text-2xl md:text-3xl"
        >
          THE PROBLEM
        </h2>
        <div className="landing-section-rule mx-auto h-px w-40 sm:w-56" aria-hidden />
        <Card className="mx-auto mt-5 w-full max-w-2xl overflow-hidden rounded-2xl border-raw-gold/30 bg-raw-black/45 shadow-[0_0_32px_rgba(241,196,45,0.12)] backdrop-blur-md">
          <CardContent className="flex items-center justify-center gap-3 p-4 text-center font-display sm:gap-5 sm:p-5">
            <span className="text-3xl tracking-[0.08em] sm:text-4xl md:text-5xl">
              <span className="raw-chrome-metallic">ra</span>
              <span className="text-raw-gold drop-shadow-[0_0_16px_rgba(241,196,45,0.35)]">W</span>
            </span>
            <span className="rounded-full border border-raw-gold/35 bg-raw-gold/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-raw-gold shadow-[0_0_18px_rgba(241,196,45,0.22)] sm:text-sm">
              vs
            </span>
            <span className="text-lg tracking-[0.06em] text-raw-silver/40 sm:text-xl md:text-2xl">
              Them
            </span>
          </CardContent>
        </Card>

        <div className="mt-10 sm:mt-14">
          <RadialOrbitalTimelineDemo />
        </div>
      </div>
    </section>
  );
}
