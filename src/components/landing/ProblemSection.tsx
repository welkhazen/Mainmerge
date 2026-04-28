import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { LandingType } from "@/components/landing/LandingType";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="landing-section relative px-4 py-12 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-raw-gold/75 sm:text-[13px]">The Problem</p>

        <h2 className="mt-4 font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">
          Online spaces reward conformity,{" "}
          <span className="text-raw-gold">not authenticity</span>.
        </h2>

        <p className="landing-type-body mt-5 text-raw-silver/65 sm:mt-6 sm:text-base">
          Your real opinions, questions, and perspectives stay hidden. Algorithms amplify outrage. Communities demand allegiance. You self-censor because your reputation is on the line.
        </LandingType>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {[
            { icon: "🪞", label: "Persona", desc: "Curating a polished image" },
            { icon: "👁️", label: "Social Risk", desc: "Fear of judgment or backlash" },
            { icon: "🫧", label: "Echo Chambers", desc: "Talking only to people like you" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-raw-border/30 bg-raw-black/40 p-4 sm:p-5">
              <p className="text-2xl">{item.icon}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-raw-text">{item.label}</p>
              <p className="mt-1 text-sm text-raw-silver/55">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
