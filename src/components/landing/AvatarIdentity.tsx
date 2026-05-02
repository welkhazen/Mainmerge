 import { Logo3D } from "@/components/ui/logo-3d";
 import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
 import { LandingSectionShell } from "@/components/landing/LandingSectionShell";
 
export function AvatarIdentity() {
   const sectionRef = useTrackSectionView("avatar");

 
   return (
     <LandingSectionShell
       id="avatar"
       sectionRef={sectionRef as React.Ref<HTMLElement>}
      title="Your avatar"
      description="A neutral avatar marker for anonymous participation."
     >
       <div id="avatar-phone-anchor" className="flex flex-col items-center gap-6">
         <div className="relative flex items-center justify-center">

           <div

            className="relative flex items-center justify-center rounded-full"
             style={{
               width: 180,
               height: 180,

              background: "radial-gradient(circle at 50% 40%, #161616 0%, #050505 70%)",
              boxShadow: "0 0 0 2px rgba(241,196,45,0.4)",
             }}
           >
             <Logo3D size={140} colorScheme="white" />
           </div>
         </div>

       </div>
     </LandingSectionShell>
   );
 }
 
EOF
)
