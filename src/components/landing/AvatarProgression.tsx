import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
 

export function AvatarProgression() {
   const sectionRef = useTrackSectionView("avatar");
 

   return (
     <LandingSectionShell

      id="avatar-overview"
       sectionRef={sectionRef as React.Ref<HTMLElement>}

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

