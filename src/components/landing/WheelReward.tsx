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

type SpinAvatarReward = {
  id: string;
  level: number;
  codename: string;
  odds: string;
  denominator: number;
};

const SPIN_REWARDS_IMAGE_SRC = "/avatars/spin-rewards.png";

const SPIN_AVATAR_REWARDS: SpinAvatarReward[] = [
  { id: "inferno-lord", level: 10, codename: "Inferno Lord", odds: "1/500", denominator: 500 },
  { id: "solar-flare", level: 9, codename: "Solar Flare", odds: "1/250", denominator: 250 },
  { id: "digital-prophet", level: 8, codename: "Digital Prophet", odds: "1/120", denominator: 120 },
  { id: "shadow-claw", level: 7, codename: "Shadow Claw", odds: "1/120", denominator: 120 },
  { id: "void-reaper", level: 6, codename: "Void Reaper", odds: "1/100", denominator: 100 },
  { id: "neon-dj", level: 5, codename: "Neon DJ", odds: "1/100", denominator: 100 },
  { id: "bronze-pilot", level: 4, codename: "Bronze Pilot", odds: "1/80", denominator: 80 },
  { id: "iron-sentinel", level: 3, codename: "Iron Sentinel", odds: "1/80", denominator: 80 },
  { id: "night-stalker", level: 2, codename: "Night Stalker", odds: "1/60", denominator: 60 },
  { id: "golden-shogun", level: 1, codename: "Golden Shogun", odds: "1/60", denominator: 60 },
];

const RANK_PRIZES: WheelPrize[] = SPIN_AVATAR_REWARDS.map((reward, idx) => {
  const theme = LEVEL_THEMES[Math.max(0, reward.level - 1)];
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

  const prizeWeights = useMemo(
    () =>
      Object.fromEntries(
        SPIN_AVATAR_REWARDS.map((reward) => [reward.id, 1 / reward.denominator])
      ),
    []
  );

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

        <div className="w-full max-w-5xl rounded-2xl border border-raw-border/40 bg-raw-surface/20 p-4 sm:p-6">
          <p className="text-center font-display text-xs uppercase tracking-[0.2em] text-raw-gold/70">Spin Rewards & Rarity</p>
          {!rewardsImageMissing ? (
            <img
              src={SPIN_REWARDS_IMAGE_SRC}
              alt="Spin reward avatars with rarity odds"
              className="mt-4 w-full rounded-xl border border-raw-border/35 bg-black/25 object-contain"
              onError={() => setRewardsImageMissing(true)}
            />
          ) : (
            <div className="mt-4 rounded-xl border border-red-500/35 bg-red-500/10 p-3 text-center text-xs text-red-200">
              Reward artwork missing: add <code className="font-mono text-red-100">public/avatars/spin-rewards.png</code> to display the exact image.
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {SPIN_AVATAR_REWARDS.map((reward) => {
              const isActive = landedReward?.id === reward.id;
              return (
                <div key={reward.id} className={`rounded-xl border p-3 text-center ${isActive ? "border-raw-gold/50 bg-raw-gold/10" : "border-raw-border/40 bg-raw-black/30"}`}>
                  <div className="mx-auto w-fit"><AvatarFigure level={reward.level} size="md" selected={isActive} /></div>
                  <p className="mt-2 font-display text-[10px] uppercase tracking-[0.12em] text-raw-text">{reward.codename}</p>
                  <p className="mt-1 text-xs text-raw-gold">{reward.odds}</p>
                </div>
              );
            })}
          </div>
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
