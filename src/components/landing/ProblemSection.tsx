import { RadialOrbitalTimelineDemo } from "@/components/ui/radial-orbital-timeline-demo";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="landing-section relative px-4 py-14 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">
          The Problem
        </h2>
        <h3 className="mt-3 text-center font-display text-lg tracking-wide text-raw-text/80 sm:text-xl md:text-2xl">
          Why existing social apps still leave people disconnected
        </h3>

        <div className="mt-10 sm:mt-14">
          <RadialOrbitalTimelineDemo />
        </div>
      </div>
    </section>
  );
}
