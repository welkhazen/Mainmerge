import { useState, useCallback } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { getAvatarTheme, LEVEL_THEMES } from "@/lib/avatar-theme";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { Lock, Sparkles } from "lucide-react";

interface AvatarIdentityProps {
  avatarLevel: number;
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

export function AvatarIdentity({ avatarLevel, onLevelChange, onSignupClick }: AvatarIdentityProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [landedLevel, setLandedLevel] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Priority: hovered (phone preview) > landed (wheel result) > current avatar level
  const displayLevel = hoveredLevel ?? landedLevel ?? avatarLevel;
  const theme = getAvatarTheme(displayLevel);

  // Highlight on avatar row: landed > hovered > selected
  const highlightedLevel = landedLevel ?? hoveredLevel ?? avatarLevel;

  const handleSpinEnd = useCallback((prize: WheelPrize) => {
    const match = /^rank-(\d+)$/.exec(prize.id);
    if (match) {
      const level = parseInt(match[1], 10);
      setLandedLevel(level);
      onLevelChange(level);
    }
    setHasSpun(true);
    setIsSpinning(false);
  }, [onLevelChange]);

  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
  }, []);

  return (
    <section id="avatar" className="relative px-6 py-28 bg-gradient-to-b from-transparent to-[rgba(255,255,255,0.01)]">
      <div className="mx-auto w-full max-w-6xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            Your avatar is your identity.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-raw-silver/50">
            Spin the wheel to land your rank. Hover an avatar to preview it on your phone — your avatar becomes your app icon.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2">

          {/* ── LEFT: Wheel + avatar rewards row ── */}
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-raw-gold/30" />
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-raw-gold/60">
                Early Access Reward
              </p>
              <div className="h-px w-8 bg-raw-gold/30" />
            </div>

            <WheelOfFortune
              prizes={RANK_PRIZES}
              onSpinEnd={handleSpinEnd}
              onSpinStart={handleSpinStart}
              disabled={hasSpun}
            />

            {/* Avatar rewards row — under wheel */}
            <div className="w-full max-w-md">
              <p className="mb-4 text-center font-display text-[10px] uppercase tracking-[0.3em] text-raw-silver/40">
                Possible Rewards
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {LEVEL_THEMES.map((t, i) => {
                  const level = i + 1;
                  const isHighlighted = level === highlightedLevel;
                  const isLanded = level === landedLevel;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onLevelChange(level)}
                      onMouseEnter={() => setHoveredLevel(level)}
                      onMouseLeave={() => setHoveredLevel(null)}
                      className="group relative flex flex-col items-center gap-1 focus:outline-none"
                      aria-label={`Select rank ${level} — ${t.name}`}
                    >
                      <div
                        className={`rounded-full transition-all duration-300 ${
                          isLanded
                            ? "ring-2 ring-raw-gold shadow-[0_0_20px_rgba(241,196,45,0.55)] scale-110"
                            : isHighlighted
                              ? "ring-1 ring-raw-gold/60 scale-105"
                              : "ring-1 ring-transparent opacity-70 group-hover:opacity-100"
                        }`}
                      >
                        <AvatarFigure level={level} size="sm" selected={isLanded} />
                      </div>
                      <span
                        className={`text-[9px] font-bold tracking-wider transition-colors ${
                          isLanded
                            ? "text-raw-gold"
                            : isHighlighted
                              ? "text-raw-gold/70"
                              : "text-raw-silver/30 group-hover:text-raw-silver/60"
                        }`}
                      >
                        RANK {level}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Landed result callout */}
              {landedLevel && !isSpinning && (
                <div className="mt-6 rounded-2xl border border-raw-gold/30 bg-gradient-to-b from-raw-gold/[0.08] to-raw-gold/[0.02] p-5 text-center transition-all duration-500">
                  <div className="flex items-center justify-center gap-2 mb-2">
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
                    onClick={onSignupClick}
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

          {/* ── RIGHT: Interactive iPhone ── */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px w-8 bg-raw-gold/20" />
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-raw-silver/40">
                Your app icon — live preview
              </p>
              <div className="h-px w-8 bg-raw-gold/20" />
            </div>

            <PhoneMockup>
              <AvatarPhoneHomeScreen displayLevel={displayLevel} />
            </PhoneMockup>

            <p className="mt-4 font-display text-sm uppercase tracking-[0.2em] text-raw-text">
              Level {displayLevel}
            </p>
            <p className="mt-0.5 text-xs text-raw-silver/40">{theme.name}</p>

            <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-raw-silver/35">
              Limited edition — strictly for early access users. Hover any avatar to preview the look on your phone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
