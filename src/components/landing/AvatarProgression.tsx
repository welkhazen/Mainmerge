import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function AvatarProgression() {
  const sectionRef = useTrackSectionView("avatar");

  return (
    <LandingSectionShell
      id="avatar-overview"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      eyebrow="Avatar Progression"
      title="Choose your avatar."
      description="Tap any avatar to preview it on the phone above."
    >
      <div
        className="grid gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:gap-x-6"
        style={{ gridTemplateColumns: `repeat(${Math.ceil(AVATARS.length / 2)}, minmax(0, 1fr))` }}
      >
        {AVATARS.map((avatar, i) => {
          const index = i + 1;
          const isActive = index === previewIndex;
          const isSelected = index === avatarIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                onPreviewAvatar(index);
                onAvatarChange(index);
                if (typeof document !== "undefined") {
                  document
                    .getElementById("avatar-phone-anchor")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              onMouseEnter={() => onPreviewAvatar(index)}
              onMouseLeave={() => onPreviewAvatar(null)}
              onFocus={() => onPreviewAvatar(index)}
              onBlur={() => onPreviewAvatar(null)}
              className="group flex flex-col items-center gap-2 focus:outline-none"
              aria-label={`Select ${avatar.name}`}
              aria-pressed={isSelected}
            >
              <div className="relative">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "scale-110"
                      : isLocked
                      ? ""
                      : "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  <AvatarFigure avatarIndex={index} size="md" selected={isSelected || isActive} className="sm:hidden" />
                  <AvatarFigure avatarIndex={index} size="lg" selected={isSelected || isActive} className="hidden sm:block" />
                </div>
              </div>
              <span
                className={`font-display text-[9px] sm:text-[10px] tracking-[0.12em] text-center leading-tight transition-colors ${
                  isActive ? "text-raw-text" : "text-raw-silver/60 group-hover:text-raw-silver/90"
                }`}
              >
                {avatar.name}
              </span>
            </button>
          );
        })}
      eyebrow="Avatar"
      title="Avatar overview"
      description="This area is reserved for future avatar updates."
    >
      <div className="rounded-2xl border border-raw-border/35 bg-raw-surface/20 p-5 text-center text-sm text-raw-silver/65">
        Your avatar is fixed to a neutral visual style for now.
      </div>
    </LandingSectionShell>
  );
}
