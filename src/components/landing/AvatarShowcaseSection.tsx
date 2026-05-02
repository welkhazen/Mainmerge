import { LandingSectionShell } from "@/components/landing/LandingSectionShell";

import { AvatarPhoneHomeScreen } from "@/components/ui/avatar-phone-home-screen";
import { PhoneMockup } from "@/components/ui/phone-mockup";

import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function AvatarShowcaseSection() {

  const sectionRef = useTrackSectionView("avatar");

  return (
    <LandingSectionShell
      id="avatar"
      sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar"
      description="A simple anonymous avatar that represents you across the app."
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
        <PhoneMockup showStatusBar={false}>
          <AvatarPhoneHomeScreen displayLevel={1} />
        </PhoneMockup>

      </div>
    </LandingSectionShell>
  );
  }
