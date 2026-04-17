import { useState, useCallback } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { PhoneMockup } from "@/components/ui/phone-mockup";
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
              <PhoneHomeScreen displayLevel={displayLevel} theme={theme} />
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

interface PhoneHomeScreenProps {
  displayLevel: number;
  theme: ReturnType<typeof getAvatarTheme>;
}

function PhoneHomeScreen({ displayLevel, theme }: PhoneHomeScreenProps) {
  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#e8e8e8] via-[#dcdcdc] to-[#c6c6c8] px-4 pt-3 pb-4">
      {/* Status bar override (inside screen) */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-[#1a1a1a]">10:35</span>
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-[1px]">
            <div className="w-[3px] h-[4px] rounded-[0.5px] bg-[#1a1a1a]" />
            <div className="w-[3px] h-[6px] rounded-[0.5px] bg-[#1a1a1a]" />
            <div className="w-[3px] h-[8px] rounded-[0.5px] bg-[#1a1a1a]" />
            <div className="w-[3px] h-[10px] rounded-[0.5px] bg-[#1a1a1a]" />
          </div>
          <div className="ml-0.5 w-[18px] h-[8px] rounded-[2px] border border-[#1a1a1a]/70 flex items-center p-[1px]">
            <div className="h-full w-3/4 rounded-[1px] bg-[#1a1a1a]/80" />
          </div>
        </div>
      </div>

      {/* Grid: 4 cols x 4 rows with the avatar occupying 2x2 */}
      <div className="grid grid-cols-4 grid-rows-4 gap-x-3 gap-y-3">
        {/* Row 1 */}
        <AppIcon kind="facetime" label="FaceTime" />
        <AppIcon kind="calendar" label="Calendar" />
        <AppIcon kind="photos" label="Photos" />
        <AppIcon kind="camera" label="Camera" />

        {/* Row 2 */}
        <AppIcon kind="clock" label="Clock" />
        <AppIcon kind="maps" label="Maps" />
        <AppIcon kind="weather" label="Weather" />
        <AppIcon kind="notes" label="Notes" />

        {/* Row 3: reminders, stocks, then 2x2 avatar starts */}
        <AppIcon kind="reminders" label="Reminders" />
        <AppIcon kind="stocks" label="Stocks" />
        {/* Big avatar tile: spans 2 cols x 2 rows (col 3-4, row 3-4) */}
        <div className="col-span-2 row-span-2 flex flex-col items-center gap-1">
          <div
            key={displayLevel}
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] shadow-lg animate-[iconPop_420ms_ease-out]"
            style={{
              background: `linear-gradient(135deg, ${theme.bg} 0%, #050505 70%)`,
              boxShadow: theme.glow !== "none" ? `0 0 22px ${theme.glow}` : "0 6px 16px rgba(0,0,0,0.35)",
            }}
          >
            <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 35%, ${theme.figure}33 0%, transparent 60%)` }} />
            <div className="relative scale-[1.4]">
              <AvatarFigure level={displayLevel} size="md" />
            </div>
          </div>
          <span className="text-[9px] font-medium text-[#222]">raW</span>
        </div>

        {/* Row 4 (first 2 columns because rows 3-4 right side is avatar) */}
        <AppIcon kind="podcasts" label="Podcasts" />
        <AppIcon kind="tv" label="TV" />
      </div>

      {/* Page dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <div className="h-[3px] w-[3px] rounded-full bg-[#1a1a1a]/60" />
        <div className="h-[3px] w-[3px] rounded-full bg-[#1a1a1a]/25" />
        <div className="h-[3px] w-[3px] rounded-full bg-[#1a1a1a]/25" />
        <div className="h-[3px] w-[3px] rounded-full bg-[#1a1a1a]/25" />
      </div>

      {/* Dock */}
      <div className="mt-2 flex items-center justify-between rounded-[22px] bg-white/40 backdrop-blur-sm px-3 py-2">
        <DockIcon kind="phone" />
        <DockIcon kind="siri" />
        <DockIcon kind="messages" />
        <DockIcon kind="music" />
      </div>
    </div>
  );
}

type IconKind =
  | "facetime"
  | "calendar"
  | "photos"
  | "camera"
  | "clock"
  | "maps"
  | "weather"
  | "notes"
  | "reminders"
  | "stocks"
  | "podcasts"
  | "tv"
  | "phone"
  | "siri"
  | "messages"
  | "music";

function AppIcon({ kind, label }: { kind: IconKind; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <IconTile kind={kind} />
      <span className="text-[8px] font-medium text-[#222] leading-none">{label}</span>
    </div>
  );
}

function DockIcon({ kind }: { kind: IconKind }) {
  return <IconTile kind={kind} small />;
}

function IconTile({ kind, small = false }: { kind: IconKind; small?: boolean }) {
  const sizeClass = small ? "h-[38px] w-[38px] rounded-[10px]" : "h-[44px] w-[44px] rounded-[11px]";

  const base = `flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${sizeClass}`;

  switch (kind) {
    case "facetime":
      return (
        <div className={base} style={{ background: "linear-gradient(180deg,#34D058 0%,#1DB341 100%)" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17 10.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z" /></svg>
        </div>
      );
    case "calendar":
      return (
        <div className={`${base} bg-white flex-col !gap-0`}>
          <span className="text-[6px] font-bold text-red-500 tracking-tight leading-none mt-[3px]">TUESDAY</span>
          <span className="text-[18px] font-extralight text-[#111] leading-none mt-[-1px]">23</span>
        </div>
      );
    case "photos":
      return (
        <div className={`${base} bg-white relative overflow-hidden`}>
          <div className="absolute inset-[3px]" style={{
            background: "conic-gradient(from 0deg, #FFCA28, #FF5252, #AB47BC, #42A5F5, #66BB6A, #FFCA28)",
            WebkitMaskImage: "radial-gradient(circle, transparent 22%, black 23%)",
            maskImage: "radial-gradient(circle, transparent 22%, black 23%)",
            borderRadius: "50%",
          }} />
        </div>
      );
    case "camera":
      return (
        <div className={`${base} bg-white`}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111" strokeWidth="1.7">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <circle cx="12" cy="13.5" r="3.5" fill="#111" />
            <rect x="8" y="5" width="5" height="3" rx="0.5" fill="#111" />
          </svg>
        </div>
      );
    case "clock":
      return (
        <div className={`${base} bg-black relative`}>
          <div className="absolute inset-[4px] rounded-full border border-white/70" />
          <div className="absolute left-1/2 top-1/2 h-[14px] w-[1.5px] -translate-x-1/2 -translate-y-full bg-white origin-bottom" />
          <div className="absolute left-1/2 top-1/2 h-[1.5px] w-[10px] -translate-y-1/2 bg-orange-400 origin-left" />
        </div>
      );
    case "maps":
      return (
        <div className={`${base}`} style={{ background: "linear-gradient(180deg,#C8F5C0 0%,#9CE394 100%)" }}>
          <span className="font-display text-[18px] font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>V</span>
        </div>
      );
    case "weather":
      return (
        <div className={`${base} relative overflow-hidden`} style={{ background: "linear-gradient(180deg,#3AA5E0 0%,#1E88E5 100%)" }}>
          <div className="absolute right-[6px] top-[6px] h-[10px] w-[10px] rounded-full bg-yellow-300" />
          <div className="absolute bottom-[6px] left-[5px] h-[10px] w-[22px] rounded-full bg-white" />
          <span className="absolute left-1/2 top-[9px] -translate-x-1/2 text-[9px] font-bold text-white">69°</span>
        </div>
      );
    case "notes":
      return (
        <div className={`${base} bg-white relative overflow-hidden`}>
          <div className="absolute top-0 left-0 right-0 h-[9px] bg-yellow-400" />
          <div className="absolute inset-x-[5px] top-[13px] flex flex-col gap-[2px]">
            <div className="h-[1.5px] w-full rounded bg-[#222]/50" />
            <div className="h-[1.5px] w-[80%] rounded bg-[#222]/40" />
            <div className="h-[1.5px] w-[60%] rounded bg-[#222]/30" />
          </div>
        </div>
      );
    case "reminders":
      return (
        <div className={`${base} bg-white flex flex-col items-start justify-center px-[6px] gap-[3px]`}>
          <div className="flex items-center gap-1"><div className="h-[5px] w-[5px] rounded-full border border-blue-500" /><div className="h-[1.5px] w-[16px] rounded bg-[#222]/50" /></div>
          <div className="flex items-center gap-1"><div className="h-[5px] w-[5px] rounded-full border border-orange-500" /><div className="h-[1.5px] w-[12px] rounded bg-[#222]/50" /></div>
          <div className="flex items-center gap-1"><div className="h-[5px] w-[5px] rounded-full border border-red-500" /><div className="h-[1.5px] w-[18px] rounded bg-[#222]/50" /></div>
        </div>
      );
    case "stocks":
      return (
        <div className={`${base} bg-black relative overflow-hidden`}>
          <svg viewBox="0 0 40 40" className="h-full w-full">
            <polyline points="2,30 10,22 16,26 24,12 32,18 38,8" fill="none" stroke="#34D058" strokeWidth="2" />
          </svg>
        </div>
      );
    case "podcasts":
      return (
        <div className={`${base}`} style={{ background: "linear-gradient(180deg,#C77CFF 0%,#8A3FE0 100%)" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><circle cx="12" cy="12" r="2.5" /><path d="M12 2a10 10 0 00-7 17.1l1.4-1.4A8 8 0 1120.1 8.4l1.4-1.4A10 10 0 0012 2z" opacity="0.9" /><path d="M12 6a6 6 0 00-4.2 10.2l1.4-1.4A4 4 0 1117.8 10l1.4-1.4A6 6 0 0012 6z" opacity="0.7" /></svg>
        </div>
      );
    case "tv":
      return (
        <div className={`${base} bg-black`}>
          <span className="font-display text-[14px] font-extrabold text-white leading-none">TV</span>
        </div>
      );
    case "phone":
      return (
        <div className={`${base}`} style={{ background: "linear-gradient(180deg,#34D058 0%,#1DB341 100%)" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3a11 11 0 003.4.6c.6 0 1 .4 1 1V20c0 .5-.4 1-1 1A17 17 0 013 4c0-.5.4-1 1-1h3.5c.5 0 1 .4 1 1 0 1.2.2 2.3.5 3.4.1.3 0 .7-.3 1l-2.1 2.1z" /></svg>
        </div>
      );
    case "siri":
      return (
        <div className={`${base} bg-white relative overflow-hidden`}>
          <div className="absolute inset-0 rounded-[10px] border-2 border-blue-500" />
          <svg viewBox="0 0 24 24" width="16" height="16" fill="url(#siriGrad)"><defs><linearGradient id="siriGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4081" /><stop offset="100%" stopColor="#7C4DFF" /></linearGradient></defs><path d="M12 3c-1.7 0-3 1.3-3 3v6a3 3 0 006 0V6c0-1.7-1.3-3-3-3zm-7 9a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm6 8v2h2v-2h-2z" /></svg>
        </div>
      );
    case "messages":
      return (
        <div className={`${base}`} style={{ background: "linear-gradient(180deg,#34D058 0%,#1DB341 100%)" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.2 1 4.2 2.7 5.7L3.5 21l4.2-1.5A11 11 0 0012 20c5.5 0 10-3.8 10-8.5S17.5 3 12 3z" /></svg>
        </div>
      );
    case "music":
      return (
        <div className={`${base}`} style={{ background: "linear-gradient(180deg,#FF5E7E 0%,#F43352 100%)" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20 3L9 5v10.6A3.5 3.5 0 1010 18V8.4l8-1.5v7.7A3.5 3.5 0 1019 17V3z" /></svg>
        </div>
      );
  }
}
