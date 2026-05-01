import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { LEVEL_THEMES } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

interface AvatarShowcaseSectionProps {
  avatarLevel: number;
  displayLevel: number;
  onLevelChange: (level: number) => void;
  onPreviewLevel: (level: number | null) => void;
}

export function AvatarShowcaseSection({ avatarLevel, displayLevel, onLevelChange, onPreviewLevel }: AvatarShowcaseSectionProps) {
export function AvatarShowcaseSection({
  avatarLevel,
  displayLevel,
  onLevelChange,
  onPreviewLevel,
}: AvatarShowcaseSectionProps) {
  const sectionRef = useTrackSectionView("avatar");

  const handleLevelClick = (level: number) => {
    onPreviewLevel(level);
    if (level === 1 || level === avatarLevel) onLevelChange(level);
  };

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity"
      description="Hover or tap a rank to preview how it appears on the phone."
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-10">
        <PhoneMockup className="w-[320px] sm:w-[360px]" showStatusBar={false}>
          <AvatarPhoneHomeScreen displayLevel={displayLevel} />
        </PhoneMockup>

        <div className="w-full rounded-2xl border border-raw-border/40 bg-raw-surface/35 p-4 sm:p-6">
          <p className="text-center font-display text-xs uppercase tracking-[0.2em] text-raw-gold/70">Avatar progression</p>
          <h3 className="mt-3 text-center font-display text-xl tracking-wide text-raw-text sm:text-2xl">Every rank, one tap away.</h3>
          <p className="mt-2 text-center text-xs text-raw-silver/50 sm:text-sm">Swipe on mobile or hover on desktop to update the phone preview.</p>

          <div className="mt-6 sm:hidden">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {LEVEL_THEMES.map((_, i) => {
                const level = i + 1;
                const isActive = level === displayLevel;
                const isSelected = level === avatarLevel;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleLevelClick(level)}
                    onTouchStart={() => onPreviewLevel(level)}
                    onMouseEnter={() => onPreviewLevel(level)}
                    onMouseLeave={() => onPreviewLevel(null)}
                    onFocus={() => onPreviewLevel(level)}
                    onBlur={() => onPreviewLevel(null)}
                    className="group flex min-w-[64px] snap-center flex-col items-center gap-2"
                  >
                    <div className={`rounded-full transition-all duration-300 ${isActive ? "scale-110" : "group-active:scale-105"}`}>
                      <AvatarFigure level={level} size="md" selected={isSelected || isActive} />
                    </div>
                    <span className={`font-display text-[9px] tracking-[0.16em] ${isActive ? "text-raw-text" : "text-raw-silver/55"}`}>LVL {level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 hidden grid-cols-5 gap-5 sm:grid">
            {LEVEL_THEMES.map((_, i) => {
              const level = i + 1;
              const isActive = level === displayLevel;
              const isSelected = level === avatarLevel;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelClick(level)}
                  onMouseEnter={() => onPreviewLevel(level)}
                  onMouseLeave={() => onPreviewLevel(null)}
                  onFocus={() => onPreviewLevel(level)}
                  onBlur={() => onPreviewLevel(null)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className={`rounded-full transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                    <AvatarFigure level={level} size="lg" selected={isSelected || isActive} />
                  </div>
                  <span className={`font-display text-[10px] tracking-[0.18em] ${isActive ? "text-raw-text" : "text-raw-silver/55"}`}>LVL {level}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </LandingSectionShell>
  );
}
