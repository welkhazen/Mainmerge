import { useState } from "react";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { PhoneMockup } from "@/components/ui/phone-mockup";
import { AVATARS } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function AvatarShowcaseSection() {
  const sectionRef = useTrackSectionView("avatar");
  const [avatarIndex, setAvatarIndex] = useState(1);
  const [previewIndex, setPreviewIndex] = useState(1);

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity"
      description="Tap any avatar to preview how it appears on the phone."
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
        <PhoneMockup className="w-full max-w-[360px]" showStatusBar={false}>
          <AvatarPhoneHomeScreen avatarIndex={previewIndex} />
        </PhoneMockup>

        <div className="w-full max-w-4xl rounded-2xl border border-raw-border/40 bg-raw-surface/25 p-4 sm:p-5">
          <p className="text-center font-display text-xs uppercase tracking-[0.2em] text-raw-gold/70">Choose your avatar</p>
          <div className="mt-4 flex items-start justify-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:gap-4">
            {AVATARS.map((avatar, i) => {
              const index = i + 1;
              const isActive = index === previewIndex;
              const isSelected = index === avatarIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatarIndex(index)}
                  onTouchStart={() => setPreviewIndex(index)}
                  onTouchEnd={() => setPreviewIndex(avatarIndex)}
                  onTouchCancel={() => setPreviewIndex(avatarIndex)}
                  onMouseEnter={() => setPreviewIndex(index)}
                  onMouseLeave={() => setPreviewIndex(avatarIndex)}
                  onFocus={() => setPreviewIndex(index)}
                  onBlur={() => setPreviewIndex(avatarIndex)}
                  className="group flex min-w-[70px] flex-col items-center gap-2"
                  aria-label={`Select ${avatar.name}`}
                  aria-pressed={isSelected}
                >
                  <div className={`rounded-full transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                    <AvatarFigure avatarIndex={index} size="lg" selected={isSelected || isActive} />
                  </div>
                  <span className={`font-display text-[9px] tracking-[0.12em] text-center leading-tight ${isActive ? "text-raw-text" : "text-raw-silver/55"}`}>
                    {avatar.name}
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
