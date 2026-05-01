import { getAvatarTheme } from "@/lib/avatar-theme";
import { Logo3D } from "@/components/ui/logo-3d";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface AvatarIdentityProps {
  displayLevel: number;
}

export function AvatarIdentity({ displayLevel }: AvatarIdentityProps) {
  const sectionRef = useTrackSectionView("avatar");
  const theme = getAvatarTheme(displayLevel);
  const glowColor = theme.glow !== "none" ? theme.glow : "rgba(241,196,45,0.25)";

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity."
      description="Hover or tap any rank below to preview your avatar — every rank has its own look."
    >
      <div id="avatar-phone-anchor" className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {/* Outer ambient glow */}
          <div
            className="absolute rounded-full blur-3xl opacity-30 transition-all duration-700"
            style={{
              width: 260,
              height: 260,
              background: glowColor,
            }}
          />
          {/* Pulse ring */}
          <div
            className="absolute rounded-full animate-ping opacity-10"
            style={{
              width: 220,
              height: 220,
              border: `2px solid ${theme.ring}`,
            }}
          />
          {/* Static ring */}
          <div
            className="absolute rounded-full opacity-30 transition-all duration-700"
            style={{
              width: 210,
              height: 210,
              border: `1px solid ${theme.ring}`,
            }}
          />
          {/* Circular avatar background with spinning logo inside */}
          <div
            className="relative flex items-center justify-center rounded-full transition-all duration-700"
            style={{
              width: 180,
              height: 180,
              background: `radial-gradient(circle at 50% 40%, ${theme.bg} 0%, #050505 70%)`,
              boxShadow: `0 0 0 2px ${theme.ring}, 0 0 18px ${glowColor}`,
            }}
          >
            <Logo3D size={140} colorScheme="white" />
          </div>
        </div>

        <div className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-raw-text transition-all duration-500">
            Level {displayLevel}
          </p>
          <p className="mt-0.5 text-xs text-raw-silver/40 transition-all duration-500">{theme.name}</p>
        </div>
      </div>
    </LandingSectionShell>
  );
}
