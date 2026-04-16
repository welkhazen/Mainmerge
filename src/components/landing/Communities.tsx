import { GlareCard } from "@/components/ui/glare-card";

const communities = [
  {
    title: "Late Night Talks",
    description:
      "For people who think deeply, feel deeply, and want honest conversation when the world gets quiet.",
    badge: "Founding Community",
  },
  {
    title: "Self-Improvement Circle",
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
  return (
    <section id="communities" className="relative py-28 px-6 bg-gradient-to-b from-transparent to-[rgba(255,255,255,0.01)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            24/7 communities for real talk.
          </h2>
          <p className="mt-4 text-base text-raw-silver/50 max-w-xl mx-auto">
            Start with 3 founding categories. Smaller micro-communities unlock as raW grows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {communities.map((c) => (
            <GlareCard key={c.title}>
              <div className="rounded-2xl border border-raw-border/50 bg-raw-surface/50 p-8">
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

        <div className="mt-10 text-center">
          <button
            onClick={onSignupClick}
            className="rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
          >
            Join the Founding Community
          </button>
        </div>

        {/* Communities worldwide */}
        <div className="mt-16 flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-raw-silver/40">
              Communities worldwide
            </p>
            <h3 className="mt-3 font-display text-2xl tracking-wide text-raw-text sm:text-3xl">
              Where mind meets heart.
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-raw-silver/50">
              Real connection starts when intellect and emotion align. raW communities
              are built for people who think deeply and feel deeply — worldwide, 24/7.
            </p>
          </div>
          <div className="flex-shrink-0">
            <video
              src="/brain-heart.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-[280px] w-auto object-contain sm:h-[340px] md:h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
