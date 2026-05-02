import { useCallback, useMemo, useState } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { LEVEL_THEMES } from "@/lib/avatar-theme";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { Lock, Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface WheelRewardProps {
  onLevelChange: (level: number) => void;
  onSignupClick: () => void;
}

const TRANSPARENT_REWARDS_IMAGE_SRC = "/avatars/spin-rewards-transparent.png";

const RANK_PRIZES: WheelPrize[] = LEVEL_THEMES.map((theme, i) => {
  const level = i + 1;
  const isGold = level >= 7;
  return {
    id: reward.id,
    label: `${reward.codename} (${reward.odds})`,
    shortLabel: `R${idx + 1}`,
    color: idx % 2 === 0 ? "#121212" : "#0e0e0e",
    textColor: theme?.ring ?? "#D9D9D9",
  };
});

export function WheelReward({ onLevelChange, onSignupClick }: WheelRewardProps) {
  const sectionRef = useTrackSectionView("wheel");
  const [landedReward, setLandedReward] = useState<SpinAvatarReward | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rewardsImageMissing, setRewardsImageMissing] = useState(false);

  const handleSpinEnd = useCallback(
    (prize: WheelPrize) => {
      const reward = SPIN_AVATAR_REWARDS.find((entry) => entry.id === prize.id);
      if (reward) {
        setLandedReward(reward);
        onLevelChange(reward.level);
      }
      setHasSpun(true);
    },
    [onLevelChange]
  );

  return (
    <LandingSectionShell
      id="wheel"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      eyebrow="Early Access Reward"
      title="Spin the wheel to land your rank."
      description="Rarer avatar codenames have lower win chance. Odds are shown below each reward."
    >
      <div className="flex flex-col items-center gap-6 sm:gap-10">
        <WheelOfFortune prizes={RANK_PRIZES} prizeWeights={prizeWeights} onSpinEnd={handleSpinEnd} disabled={hasSpun} />

          {!rewardsImageMissing ? (
            <img
              src={TRANSPARENT_REWARDS_IMAGE_SRC}
              alt="Avatar reward rarity chart"
              className="w-full max-w-5xl object-contain mix-blend-screen"
              onError={() => setRewardsImageMissing(true)}
            />
          ) : null}

          {landedLevel && (
            <div className="w-full max-w-md rounded-2xl border border-raw-gold/30 bg-gradient-to-b from-raw-gold/[0.08] to-raw-gold/[0.02] p-4 text-center transition-all duration-500 sm:p-5">
              <div className="mb-2 flex items-center justify-center gap-2">
                <AvatarFigure level={landedLevel} size="sm" selected />
                <Sparkles className="h-4 w-4 text-raw-gold" />
                <span className="font-display text-sm tracking-wide text-raw-gold">
                  Rank {landedLevel} unlocked — {LEVEL_THEMES[landedLevel - 1].name}
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
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <Lock className="h-3 w-3 text-raw-silver/30" />
                <p className="text-[10px] uppercase tracking-[0.15em] text-raw-silver/35">
                  Limited — early access only
                </p>
              </div>
            </div>
          )}
        </div>

        {landedReward && (
          <div className="w-full max-w-md rounded-2xl border border-raw-gold/30 bg-gradient-to-b from-raw-gold/[0.08] to-raw-gold/[0.02] p-4 text-center transition-all duration-500 sm:p-5">
            <div className="mb-2 flex items-center justify-center gap-2">
              <AvatarFigure level={landedReward.level} size="sm" selected />
              <Sparkles className="h-4 w-4 text-raw-gold" />
              <span className="font-display text-sm tracking-wide text-raw-gold">{landedReward.codename} unlocked — {landedReward.odds}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-raw-text/75">Claim this avatar now as an early access gift from raW to you.</p>
            <button
              type="button"
              onClick={() => {
                track("landing_cta_clicked", { cta_id: "avatar_claim", cta_text: "Claim My Avatar", source_section: "wheel" });
                onSignupClick();
              }}
              className="mt-4 w-full rounded-full bg-raw-gold px-6 py-3 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
            >
              Claim My Avatar
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3 text-raw-silver/30" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-raw-silver/35">Limited — early access only</p>
            </div>
          </div>
        )}
      </div>
    </LandingSectionShell>
  );
}
