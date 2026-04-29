import { RadialOrbitalTimelineDemo } from "@/components/ui/radial-orbital-timeline-demo";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="landing-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20 transition-opacity duration-700">
        <SpiralAnimation />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-raw-black/70 via-raw-black/45 to-raw-black/70" />

      <div className="relative z-10">
        <RadialOrbitalTimelineDemo />
      </div>
    </section>
  );
}
