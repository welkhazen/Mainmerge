import { SpiralDemo } from "@/components/ui/demo";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="landing-section relative">
      <SpiralDemo />
    </section>
  );
}
