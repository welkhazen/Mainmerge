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
  const sectionRef = useTrackSectionView("avatar");

  const handleLevelClick = (level: number) => {
    onPreviewLevel(level);
    if (level === 1 || level === avatarLevel) onLevelChange(level);
  };

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Choose your avatar identity"
      description="Avatar choice is independent from badge level. Hover or tap any avatar to preview it clearly."
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
        <PhoneMockup showStatusBar={false}>
          <AvatarPhoneHomeScreen displayLevel={displayLevel} />
        </PhoneMockup>

        <div className="w-full max-w-4xl rounded-2xl border border-raw-border/40 bg-raw-surface/25 p-4 sm:p-5">
          <p className="text-center font-display text-xs uppercase tracking-[0.2em] text-raw-gold/70">Avatar library</p>
          <div className="mt-4 flex items-start justify-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:gap-4">
            {LEVEL_THEMES.map((theme, i) => {
              const level = i + 1;
              const isActive = level === displayLevel;
              const isSelected = level === avatarLevel;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelClick(level)}
                  onTouchStart={() => onPreviewLevel(level)}
                  onTouchEnd={() => onPreviewLevel(null)}
                  onTouchCancel={() => onPreviewLevel(null)}
                  onMouseEnter={() => onPreviewLevel(level)}
                  onMouseLeave={() => onPreviewLevel(null)}
                  onFocus={() => onPreviewLevel(level)}
                  onBlur={() => onPreviewLevel(null)}
                  className="group flex min-w-[84px] flex-col items-center gap-2"
                >
                  <div className={`rounded-full transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                    <AvatarFigure level={level} size="lg" selected={isSelected || isActive} />
                  </div>
                  <span className="text-center text-[10px] leading-tight text-raw-silver/75 group-hover:text-raw-silver">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </LandingSectionShell>
  );
}
