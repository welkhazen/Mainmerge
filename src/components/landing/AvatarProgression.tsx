import { AvatarFigure } from "@/components/ui/avatar-figure";
import { LEVEL_THEMES } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface AvatarProgressionProps {
  avatarLevel: number;
  displayLevel: number;
  onLevelChange: (level: number) => void;
  onPreviewLevel: (level: number | null) => void;
}

export function AvatarProgression({
  avatarLevel,
  displayLevel,
  onLevelChange,
  onPreviewLevel,
}: AvatarProgressionProps) {
  const sectionRef = useTrackSectionView("avatar");

  const handleLevelClick = (level: number) => {
    if (level === 1) {
      onLevelChange(level);
      return;
    }
    onPreviewLevel(level);
    if (typeof document !== "undefined") {
      document
        .getElementById("avatar-phone-anchor")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <LandingSectionShell
      id="avatar-progression"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      eyebrow="Avatar Progression"
      title="Every rank, one tap away."
      description="Tap a rank to preview it on the phone above. Earn higher ranks by participating raW."
    >
      <div
        className="grid gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:gap-x-6"
        style={{ gridTemplateColumns: `repeat(${Math.ceil(LEVEL_THEMES.length / 2)}, minmax(0, 1fr))` }}
      >
        {LEVEL_THEMES.map((t, i) => {
          const level = i + 1;
          const isActive = level === displayLevel;
          const isSelected = level === avatarLevel;
          const isLocked = level > 1 && level !== avatarLevel;
          return (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelClick(level)}
              onMouseEnter={() => onPreviewLevel(level)}
              onMouseLeave={() => onPreviewLevel(null)}
              onFocus={() => onPreviewLevel(level)}
              onBlur={() => onPreviewLevel(null)}
              className="group flex flex-col items-center gap-2 focus:outline-none"
              aria-label={`Preview rank ${level} — ${t.name}${isLocked ? " (locked)" : ""}`}
              aria-pressed={isSelected}
            >
              <div className="relative">
                {isActive && (
                  <div
                    className="absolute -inset-1.5 rounded-full opacity-60 blur-md sm:hidden"
                    style={{ background: t.ring }}
                  />
                )}
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "scale-115 drop-shadow-lg"
                      : isLocked
                      ? ""
                      : "opacity-90 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  <AvatarFigure level={level} size="md" selected={isSelected || isActive} className="sm:hidden" />
                  <AvatarFigure level={level} size="lg" selected={isSelected || isActive} className="hidden sm:block" />
                </div>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full sm:hidden overflow-hidden">
                    <div className="absolute inset-0 rounded-full bg-black/40" />
                    <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/15">
                      <span className="text-[10px] leading-none">🔒</span>
                    </div>
                  </div>
                )}
              </div>
              <span
                className={`font-display text-[9px] sm:text-[11px] font-bold tracking-[0.18em] transition-colors ${
                  isActive ? "text-raw-text" : isLocked ? "text-raw-silver/30" : "text-raw-silver/60 group-hover:text-raw-silver/90"
                }`}
              >
                LVL {level}
              </span>
            </button>
          );
        })}
      </div>
    </LandingSectionShell>
  );
}
