import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

export function ProblemSection() {
  const sectionRef = useTrackSectionView("problem");

  return (
    <section ref={sectionRef} className="relative bg-black/60 px-4 py-12 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-raw-gold/75">The Problem</p>

        <h2 className="mt-4 font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">
          Online spaces reward conformity,{" "}
          <span className="text-raw-gold">not authenticity</span>.
        </h2>

        <p className="mt-5 text-sm leading-relaxed text-raw-silver/65 sm:mt-6 sm:text-base">
          Your real opinions, questions, and perspectives stay hidden. Algorithms amplify outrage. Communities demand allegiance. You self-censor because your reputation is on the line.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {[
            { icon: "🪞", label: "Persona Management", desc: "Curating a polished image" },
            { icon: "👁️", label: "Social Risk", desc: "Fear of judgment or backlash" },
            { icon: "🫧", label: "Echo Chambers", desc: "Talking only to people like you" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-raw-border/30 bg-raw-black/40 p-4">
              <p className="text-2xl">{item.icon}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-raw-text">{item.label}</p>
              <p className="mt-1 text-xs text-raw-silver/55">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
