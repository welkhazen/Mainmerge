import { useState, useCallback } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { getAvatarTheme } from "@/lib/avatar-theme";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import { Zap, Star, Sparkles, Gift, Lock } from "lucide-react";

interface AvatarIdentityProps {
  avatarLevel: number;
  onLevelChange: (level: number) => void;
  onSignupClick: () => void;
}

const PRIZES: WheelPrize[] = [
  { id: "xp-50",  label: "50 XP",           shortLabel: "50 XP",     color: "#121212", textColor: "#D9D9D9" },
  { id: "try-1",  label: "Try Again",        shortLabel: "TRY AGAIN", color: "#0e0e0e", textColor: "#444"   },
  { id: "xp-100", label: "100 XP",           shortLabel: "100 XP",    color: "#121212", textColor: "#F1C42D" },
  { id: "streak", label: "Streak Shield",    shortLabel: "SHIELD",    color: "#0e0e0e", textColor: "#D9D9D9" },
  { id: "xp-200", label: "200 XP",           shortLabel: "200 XP",    color: "#121212", textColor: "#F1C42D" },
  { id: "try-2",  label: "Try Again",        shortLabel: "TRY AGAIN", color: "#0e0e0e", textColor: "#444"   },
  { id: "theme",  label: "Avatar Theme",     shortLabel: "THEME",     color: "#1a1508", textColor: "#F1C42D" },
  { id: "xp-50b", label: "50 XP",           shortLabel: "50 XP",     color: "#0e0e0e", textColor: "#D9D9D9" },
  { id: "try-3",  label: "Try Again",        shortLabel: "TRY AGAIN", color: "#121212", textColor: "#444"   },
  { id: "xp-500", label: "500 XP Jackpot!", shortLabel: "500 XP",    color: "#1a1508", textColor: "#F1C42D" },
  { id: "badge",  label: "Community Badge",  shortLabel: "BADGE",     color: "#121212", textColor: "#D9D9D9" },
  { id: "xp-100b",label: "100 XP",          shortLabel: "100 XP",    color: "#0e0e0e", textColor: "#F1C42D" },
];

const PRIZE_META: Record<string, { label: string; icon: typeof Zap; gold: boolean }> = {
  "xp-50":  { label: "50 XP earned!",         icon: Zap,      gold: false },
  "xp-50b": { label: "50 XP earned!",          icon: Zap,      gold: false },
  "xp-100": { label: "100 XP earned!",         icon: Star,     gold: true  },
  "xp-100b":{ label: "100 XP earned!",         icon: Star,     gold: true  },
  "xp-200": { label: "200 XP earned!",         icon: Sparkles, gold: true  },
  "xp-500": { label: "500 XP Jackpot!",        icon: Gift,     gold: true  },
  "streak": { label: "Streak Shield unlocked!", icon: Sparkles, gold: true  },
  "theme":  { label: "Avatar Theme unlocked!",  icon: Gift,     gold: true  },
  "badge":  { label: "Community Badge earned!", icon: Star,     gold: false },
  "try-1":  { label: "Not this time — try again tomorrow", icon: Zap, gold: false },
  "try-2":  { label: "Not this time — try again tomorrow", icon: Zap, gold: false },
  "try-3":  { label: "Not this time — try again tomorrow", icon: Zap, gold: false },
};

export function AvatarIdentity({ avatarLevel, onLevelChange, onSignupClick }: AvatarIdentityProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [lastPrize, setLastPrize] = useState<WheelPrize | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const displayLevel = hoveredLevel ?? avatarLevel;
  const theme = getAvatarTheme(displayLevel);

  const handleSpinEnd = useCallback((prize: WheelPrize) => {
    setLastPrize(prize);
    setHasSpun(true);
  }, []);

  const meta = lastPrize ? PRIZE_META[lastPrize.id] : null;
  const PrizeIcon = meta?.icon ?? Zap;

  return (
    <section id="avatar" className="relative px-6 py-28 bg-gradient-to-b from-transparent to-[rgba(255,255,255,0.01)]">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            Your avatar is your identity.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-raw-silver/50">
            Spin the wheel. Claim your avatar. These are limited edition — only for early access users.
          </p>
        </div>

        {/* Main grid: wheel left, avatar right */}
        <div className="grid items-start gap-16 lg:grid-cols-2">

          {/* ── LEFT: Wheel of Fortune ── */}
          <div className="flex flex-col items-center gap-6">
            {/* Label */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-raw-gold/30" />
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-raw-gold/60">
                Early Access Reward
              </p>
              <div className="h-px w-8 bg-raw-gold/30" />
            </div>

            {/* Wheel — disabled after first spin */}
            <WheelOfFortune prizes={PRIZES} onSpinEnd={handleSpinEnd} disabled={hasSpun} />

            {/* Prize result + claim CTA */}
            <div
              className={`w-full max-w-sm transition-all duration-700 ${
                hasSpun
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              {meta && (
                <div
                  className={`rounded-2xl border p-6 text-center ${
                    meta.gold
                      ? "border-raw-gold/30 bg-gradient-to-b from-raw-gold/[0.08] to-raw-gold/[0.02]"
                      : "border-raw-border/40 bg-raw-surface/40"
                  }`}
                >
                  {/* Prize icon + label */}
                  <div className="flex items-center justify-center gap-2.5 mb-3">
                    <PrizeIcon
                      className={`h-5 w-5 ${meta.gold ? "text-raw-gold" : "text-raw-silver/50"}`}
                    />
                    <span
                      className={`font-display text-base tracking-wide ${
                        meta.gold ? "text-raw-gold" : "text-raw-silver/60"
                      }`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Claim CTA */}
                  <p className="text-sm text-raw-text/80 leading-relaxed mb-5">
                    Claim this avatar now as an early access gift from raW to you.
                  </p>

                  <button
                    type="button"
                    onClick={onSignupClick}
                    className="w-full rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
                  >
                    Claim My Avatar
                  </button>

                  {/* Scarcity note */}
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    <Lock className="h-3 w-3 text-raw-silver/30" />
                    <p className="text-[10px] uppercase tracking-[0.15em] text-raw-silver/35">
                      Limited edition — strictly for early access users only
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Avatar display ── */}
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <AvatarFigure level={displayLevel} size="xl" selected />
            </div>
            <p className="mt-1 font-display text-sm uppercase tracking-[0.2em] text-raw-text">
              Level {displayLevel}
            </p>
            <p className="mt-0.5 text-xs text-raw-silver/40">{theme.name}</p>

            {/* Limited edition badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-raw-gold/20 bg-raw-gold/[0.06] px-3 py-1">
              <Lock className="h-2.5 w-2.5 text-raw-gold/60" />
              <span className="text-[9px] font-display uppercase tracking-[0.2em] text-raw-gold/60">
                Limited Edition
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  onClick={() => onLevelChange(level)}
                  onMouseEnter={() => setHoveredLevel(level)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className="group flex flex-col items-center gap-1"
                >
                  <AvatarFigure level={level} size="sm" selected={level === avatarLevel} />
                  <span
                    className={`text-[9px] font-bold tracking-wider transition-colors ${
                      level === avatarLevel
                        ? "text-raw-gold"
                        : "text-raw-silver/30 group-hover:text-raw-silver/60"
                    }`}
                  >
                    LVL {level}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-raw-silver/35">
              These avatars are limited edition and will never be accessible again.
              Strictly only for early access users.
            </p>

            <div className="mt-10">
              <p className="mb-4 text-center font-display text-[10px] uppercase tracking-[0.3em] text-raw-silver/30">
                Your app icon
              </p>
              <PhoneMockup>
                <div className="min-h-[480px] bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] px-5 py-4">
                  <div className="grid grid-cols-4 gap-x-4 gap-y-5">
                    <AppIcon color="#32D74B" label="FaceTime" />
                    <AppIcon color="#FF3B30" label="Calendar" />
                    <AppIcon color="#FF9500" label="Photos" />
                    <AppIcon color="#5856D6" label="Camera" />
                    <AppIcon color="#000000" label="Clock" />
                    <AppIcon color="#34C759" label="Maps" />
                    <AppIcon color="#5AC8FA" label="Weather" />
                    <AppIcon color="#FFCC00" label="Notes" />
                    <AppIcon color="#FF2D55" label="Music" />
                    <AppIcon color="#AF52DE" label="Podcasts" />
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[12px] shadow-md"
                        style={{ background: theme.bg }}
                      >
                        <AvatarFigure level={displayLevel} size="sm" />
                      </div>
                      <span className="text-[8px] font-medium text-[#333]">raW</span>
                    </div>
                    <AppIcon color="#007AFF" label="Safari" />
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppIcon({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-[52px] w-[52px] rounded-[12px] shadow-sm"
        style={{ background: color, opacity: 0.7 }}
      />
      <span className="text-[8px] font-medium text-[#333]">{label}</span>
    </div>
  );
}
