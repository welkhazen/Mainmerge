import { useState } from "react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { getAvatarTheme, LEVEL_THEMES } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

interface AvatarIdentityProps {
  avatarLevel: number;
  onLevelChange: (level: number) => void;
}

export function AvatarIdentity({ avatarLevel, onLevelChange }: AvatarIdentityProps) {
  const sectionRef = useTrackSectionView("avatar");
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const displayLevel = hoveredLevel ?? avatarLevel;
  const theme = getAvatarTheme(displayLevel);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="avatar"
      className="relative px-6 py-28 bg-black/60"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            Your avatar is your identity.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-raw-silver/50">
            Hover or tap any rank to preview it live on your phone — your avatar becomes your app icon.
          </p>
        </div>

        {/* Phone preview */}
        <div className="flex flex-col items-center">
          <PhoneMockup>
            <AvatarPhoneHomeScreen displayLevel={displayLevel} />
          </PhoneMockup>

          <p className="mt-5 font-display text-sm uppercase tracking-[0.2em] text-raw-text">
            Level {displayLevel}
          </p>
          <p className="mt-0.5 text-xs text-raw-silver/40">{theme.name}</p>
        </div>

        {/* Avatar progression row */}
        <div className="mt-14">
          <p className="mb-6 text-center font-display text-xs uppercase tracking-[0.3em] text-raw-silver/50">
            Avatar Progression
          </p>

          <div className="grid grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6">
            {LEVEL_THEMES.map((t, i) => {
              const level = i + 1;
              const isActive = level === displayLevel;
              const isSelected = level === avatarLevel;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onLevelChange(level)}
                  onMouseEnter={() => setHoveredLevel(level)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  onFocus={() => setHoveredLevel(level)}
                  onBlur={() => setHoveredLevel(null)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                  aria-label={`Preview rank ${level} — ${t.name}`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? "scale-110"
                        : "opacity-80 group-hover:opacity-100 group-focus-visible:opacity-100"
                    }`}
                  >
                    <AvatarFigure level={level} size="lg" selected={isSelected || isActive} />
                  </div>
                  <span
                    className={`font-display text-[11px] font-bold tracking-[0.2em] transition-colors ${
                      isActive ? "text-raw-text" : "text-raw-silver/50 group-hover:text-raw-silver/80"
                    }`}
                  >
                    LVL {level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
