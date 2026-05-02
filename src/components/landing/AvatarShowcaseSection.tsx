import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { LEVEL_THEMES, getAvatarTheme } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

interface AvatarShowcaseSectionProps {
  avatarIndex: number;
  previewIndex: number;
  onAvatarChange: (index: number) => void;
  onPreviewAvatar: (index: number | null) => void;
}

export function AvatarShowcaseSection({ avatarIndex, previewIndex, onAvatarChange, onPreviewAvatar }: AvatarShowcaseSectionProps) {
  const sectionRef = useTrackSectionView("avatar");

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity"
      description="Hover or tap an avatar below to preview how it appears on the phone."
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
        <PhoneMockup showStatusBar={false}>
          <AvatarPhoneHomeScreen displayLevel={displayLevel} />
        </PhoneMockup>

        <div className="w-full max-w-4xl rounded-2xl border border-raw-border/40 bg-raw-surface/25 p-4 sm:p-5">
          <p className="text-center font-display text-xs uppercase tracking-[0.2em] text-raw-gold/70">Avatar progression</p>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 sm:gap-x-4">
            {LEVEL_THEMES.map((theme, i) => {
              const level = i + 1;
              const isActive = level === displayLevel;
              const isSelected = level === avatarLevel;
              return (
                <button
                  key={index}
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
                    <AvatarFigure level={level} size="md" selected={isSelected || isActive} />
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
