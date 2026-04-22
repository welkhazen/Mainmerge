import { GlareCard } from "@/components/ui/glare-card";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

const communities = [
  {
    title: "Late Night Talks",
    description:
      "For people who think deeply, feel deeply, and want honest conversation when the world gets quiet.",
    badge: "Founding Community",
  },
  {
    title: "Speak Your Turth",
    description:
      "For discipline, accountability, momentum, and becoming stronger with others who are trying too.",
    badge: "Opening First",
  },
  {
    title: "Mental Wellness",
    description:
      "For grounded reflection, support, and conversations that feel safe, real, and useful.",
    badge: "Early Access",
  },
];


interface CommunitiesProps {
  onSignupClick: () => void;
}

export function Communities({ onSignupClick }: CommunitiesProps) {
  const sectionRef = useTrackSectionView("communities");

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="communities"
      className="relative py-14 px-4 sm:py-20 sm:px-6 md:py-28 bg-black/40"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center sm:mb-14">
          <h2 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            24/7 communities for real talk.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-raw-silver/50 sm:mt-4 sm:text-base">
            Start with 3 founding categories. Smaller micro-communities unlock as raW grows.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {communities.map((c) => (
            <GlareCard key={c.title}>
              <div className="rounded-2xl border border-raw-border/50 bg-raw-surface/50 p-5 sm:p-8">
                <div className="mb-5 inline-block rounded-full border border-raw-gold/20 bg-raw-gold/5 px-3 py-1">
                  <span className="text-[10px] font-medium tracking-wider text-raw-gold/70 uppercase">
                    {c.badge}
                  </span>
                </div>
                <h3 className="font-display text-base tracking-wide text-raw-text">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-raw-silver/50">{c.description}</p>
              </div>
            </GlareCard>
          ))}
        </div>

        {/* Communities worldwide */}
        <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-6 sm:mt-16 sm:gap-8 md:flex-row md:items-center md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-raw-silver/40">
              Communities worldwide
            </p>
            <h3 className="mt-3 font-display text-xl tracking-wide text-raw-text sm:text-2xl md:text-3xl">
              Where mind meets heart.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-raw-silver/50 md:mx-0">
              Real connection starts when intellect and emotion align. raW communities
              are built for people who think deeply and feel deeply — worldwide, 24/7.
            </p>
          </div>
          <div className="relative w-full max-w-sm flex-shrink-0 md:max-w-none md:w-auto">
            <div
              className="relative overflow-hidden"
              style={{
                width: "min(100%, 460px)",
                height: "clamp(220px, 70vw, 400px)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.75) 62%, transparent 88%)",
                maskImage:
                  "radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.75) 62%, transparent 88%)",
              }}
            >
              <img
                src="/brain-heart-gold.png"
                alt="Golden brain and heart connected by branching neural pathways"
                className="h-full w-full object-cover"
                style={{ mixBlendMode: "screen" }}
              />
              {/* Inner vignette so the video blends softly into the background */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 40%, rgba(17,17,18,0.45) 80%, #111112 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
