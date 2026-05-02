import { Sparkles } from "lucide-react";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

interface WheelRewardProps {
  onSignupClick: () => void;
}

export function WheelReward({ onSignupClick }: WheelRewardProps) {
  const sectionRef = useTrackSectionView("wheel");

  return (
    <LandingSectionShell
      id="wheel"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      eyebrow="Coming Soon"
      title="Wheel rewards are on the way."
      description="This section is now a placeholder while we prepare the new experience."
    >
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-raw-border/35 bg-raw-surface/35 p-6 text-center sm:p-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-raw-gold/35 bg-raw-gold/10">
          <Sparkles className="h-5 w-5 text-raw-gold" />
        </div>
        <p className="text-sm leading-relaxed text-raw-silver/70">
          Wheel of Fortune logic and reward linking have been temporarily removed.
          You can still join now and we will announce rewards when this launches.
        </p>
        <button
          type="button"
          onClick={onSignupClick}
          className="mt-5 rounded-full bg-raw-gold px-6 py-3 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90"
        >
          Join Free
        </button>
      </div>
    </LandingSectionShell>
  );
}
