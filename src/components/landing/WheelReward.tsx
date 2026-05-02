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
      eyebrow="Early Access Reward"
      title="Spin the wheel to claim your avatar."
      description="One spin, one avatar — yours as an early access gift from raW."
    >
      <div className="flex flex-col items-center gap-6 sm:gap-10">
        <WheelOfFortune prizes={prizes} onSpinEnd={handleSpinEnd} disabled={hasSpun} />

        {!rewardsImageMissing ? (
          <img
            src={TRANSPARENT_REWARDS_IMAGE_SRC}
            alt="Avatar rarity chart"
            className={`w-full max-w-5xl object-contain ${isLight ? "opacity-80" : "mix-blend-screen"}`}
            onError={() => setRewardsImageMissing(true)}
          />
        ) : null}

        {landedIndex && (
          <div className={`w-full max-w-md rounded-2xl border p-4 text-center transition-all duration-500 sm:p-5 ${
            isLight
              ? "border-raw-gold/40 bg-gradient-to-b from-raw-gold/[0.12] to-raw-gold/[0.04]"
              : "border-raw-gold/30 bg-gradient-to-b from-raw-gold/[0.08] to-raw-gold/[0.02]"
          }`}>
            <div className="mb-2 flex items-center justify-center gap-2">
              <AvatarFigure avatarIndex={landedIndex} size="sm" selected />
              <Sparkles className="h-4 w-4 text-raw-gold" />
              <span className="font-display text-sm tracking-wide text-raw-gold">
                {AVATARS[landedIndex - 1]?.name} unlocked
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-raw-text/75">
              Claim this avatar now as an early access gift from raW to you.
            </p>
            <button
              type="button"
              onClick={() => {
                track("landing_cta_clicked", {
                  cta_id: "avatar_claim",
                  cta_text: "Claim My Avatar",
                  source_section: "wheel",
                });
                onSignupClick();
              }}
              className="mt-4 w-full rounded-full bg-raw-gold px-6 py-3 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
            >
              Claim My Avatar
            </button>
          </div>
        )}
      </div>
    </LandingSectionShell>
  );
}
