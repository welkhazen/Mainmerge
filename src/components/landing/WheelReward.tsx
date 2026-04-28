import { useCallback, useState } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { LEVEL_THEMES } from "@/lib/avatar-theme";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { Lock, Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

interface WheelRewardProps {
  onLevelChange: (level: number) => void;
  onSignupClick: () => void;
}

const RANK_PRIZES: WheelPrize[] = LEVEL_THEMES.map((theme, i) => {
  const level = i + 1;
  const isGold = level >= 7;
  return {
    id: `rank-${level}`,
    label: `Rank ${level} — ${theme.name}`,
    shortLabel: `RANK ${level}`,
    color: level % 2 === 0 ? "#121212" : "#0e0e0e",
    textColor: isGold ? "#F1C42D" : "#D9D9D9",
  };
});

export function WheelReward({ onLevelChange, onSignupClick }: WheelRewardProps) {
  const sectionRef = useTrackSectionView("wheel");
  const [landedLevel, setLandedLevel] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const handleSpinEnd = useCallback(
    (prize: WheelPrize) => {
      const match = /^rank-(\d+)$/.exec(prize.id);
      if (match) {
        const level = parseInt(match[1], 10);
        setLandedLevel(level);
        onLevelChange(level);
      }
      setHasSpun(true);
    },
    [onLevelChange]
  );

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="wheel"
      className="landing-section relative px-4 py-12 sm:px-6 sm:py-20 md:py-24"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4">
            <div className="h-px w-6 bg-raw-gold/30 sm:w-8" />
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-raw-gold/60 sm:tracking-[0.3em]">
              Early Access Reward
            </p>
            <div className="h-px w-6 bg-raw-gold/30 sm:w-8" />
          </div>
          <h2 className="font-display text-xl tracking-wide text-raw-text sm:text-2xl md:text-3xl">
            Spin the wheel to land your rank.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-raw-silver/50">
            One spin, one rank — yours to claim as an early access gift from raW.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 sm:gap-10">
          <WheelOfFortune prizes={RANK_PRIZES} onSpinEnd={handleSpinEnd} disabled={hasSpun} />

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
      </div>
    </section>
  );
}
