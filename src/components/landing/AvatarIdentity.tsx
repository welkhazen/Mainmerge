import { PhoneMockup } from "@/components/ui/phone-mockup";
import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { getAvatarTheme } from "@/lib/avatar-theme";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

interface AvatarIdentityProps {
  displayLevel: number;
}

export function AvatarIdentity({ displayLevel }: AvatarIdentityProps) {
  const sectionRef = useTrackSectionView("avatar");
  const theme = getAvatarTheme(displayLevel);

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar is your identity."
      description="Hover or tap any rank to preview it live on your phone — your avatar becomes your app icon."
    >
      <div id="avatar-phone-anchor" className="flex flex-col items-center">
        <PhoneMockup>
          <AvatarPhoneHomeScreen displayLevel={displayLevel} />
        </PhoneMockup>

        <p className="mt-5 font-display text-sm uppercase tracking-[0.2em] text-raw-text">
          Level {displayLevel}
        </p>
        <p className="mt-0.5 text-xs text-raw-silver/40">{theme.name}</p>
      </div>
    </LandingSectionShell>
  );
}
