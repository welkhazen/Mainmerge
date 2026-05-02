import { getAvatar } from "@/lib/avatar-theme";
import { Logo3D } from "@/components/ui/logo-3d";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface AvatarIdentityProps {
  avatarIndex: number;
}

export function AvatarIdentity({ avatarIndex }: AvatarIdentityProps) {
  const sectionRef = useTrackSectionView("avatar");
  const theme = getAvatar(avatarIndex);
  const glowColor = theme.glow !== "none" ? theme.glow : "rgba(241,196,45,0.25)";

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity."
      description="Hover or tap any avatar below to preview it on the phone."
    >
      <div id="avatar-phone-anchor" className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full blur-3xl opacity-30 transition-all duration-700"
            style={{ width: 260, height: 260, background: glowColor }}
          />
          <div
            className="absolute rounded-full animate-ping opacity-10"
            style={{ width: 220, height: 220, border: `2px solid ${theme.ring}` }}
          />
          <div
            className="absolute rounded-full opacity-30 transition-all duration-700"
            style={{ width: 210, height: 210, border: `1px solid ${theme.ring}` }}
          />
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

        <p className="font-display text-sm uppercase tracking-[0.2em] text-raw-silver/50 transition-all duration-500">
          {theme.name}
        </p>
      </div>
    </LandingSectionShell>
  );
}
