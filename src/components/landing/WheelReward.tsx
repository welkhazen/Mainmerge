import { useCallback, useState } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { AVATARS } from "@/lib/avatar-theme";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { useTheme } from "@/providers/ThemeProvider";

interface WheelRewardProps {
  onAvatarChange: (index: number) => void;
  onSignupClick: () => void;
}

const TRANSPARENT_REWARDS_IMAGE_SRC = "/avatars/spin-rewards-transparent.png";

function buildPrizes(isLight: boolean): WheelPrize[] {
  return AVATARS.map((avatar, i) => {
    const index = i + 1;
    const isGold = index >= 7;
    return {
      id: `avatar-${index}`,
      label: avatar.name,
      shortLabel: avatar.name.split(" ")[0].toUpperCase(),
      color: isLight
        ? index % 2 === 0 ? "#e8edf5" : "#dde4ef"
        : index % 2 === 0 ? "#121212" : "#0e0e0e",
      textColor: isGold
        ? "#F1C42D"
        : isLight ? "#1a1a2e" : "#D9D9D9",
    };
  });
}

export function WheelReward({ onAvatarChange, onSignupClick }: WheelRewardProps) {
  const sectionRef = useTrackSectionView("wheel");
  const { mode } = useTheme();
  const isLight = mode === "light";
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rewardsImageMissing, setRewardsImageMissing] = useState(false);

  const prizes = buildPrizes(isLight);

  const handleSpinEnd = useCallback(
    (prize: WheelPrize) => {
      const match = /^avatar-(\d+)$/.exec(prize.id);
      if (match) {
        const index = parseInt(match[1], 10);
        setLandedIndex(index);
        onAvatarChange(index);
      }
      setHasSpun(true);
    },
    [onAvatarChange]
  );

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
