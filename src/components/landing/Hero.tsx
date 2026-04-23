import { motion } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { track } from "@/lib/analytics";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
import { useFeatureExperiments } from "@/hooks/useFeatureExperiments";

interface HeroProps {
  onSignupClick: () => void;
  showDottedSurface?: boolean;
}

export function Hero({ onSignupClick }: HeroProps) {
  const sectionRef = useTrackSectionView("hero");
  const { signupCta } = useFeatureExperiments();

  const signupLabel = signupCta === "start-anonymous" ? "Start Anonymous" : "Join Free";

  const handleJoinClick = () => {
    track("landing_cta_clicked", {
      cta_id: "hero_join_free",
      cta_text: signupLabel,
      source_section: "hero",
    });
    onSignupClick();
  };

  const handleExploreClick = () => {
    track("landing_cta_clicked", {
      cta_id: "hero_explore_communities",
      cta_text: "Explore the 3 Founding Communities",
      source_section: "hero",
    });
    const target = document.getElementById("communities");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="hero-landing relative">
      <DotGlobeHero
        rotationSpeed={0.004}
        className="bg-gradient-to-br from-background via-background/95 to-muted/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-xl shadow-2xl"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="relative z-10 text-sm font-bold text-primary tracking-wider uppercase">
                Anonymous &bull; Community-First
              </span>
              <div className="w-2 h-2 bg-primary rounded-full animate-ping animation-delay-500" />
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] select-none"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                <span className="block font-light text-foreground/70 mb-3 text-4xl md:text-6xl lg:text-7xl">
                  Be authentically
                </span>
                <span className="block relative">
                  <span className="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent font-black relative z-10">
                    you.
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                    className="absolute -bottom-6 left-0 h-3 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full shadow-lg shadow-primary/50"
                  />
                </span>
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <p
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Anonymous poll voting. Real conversations. Communities that match{" "}
                <span className="text-foreground font-semibold bg-gradient-to-r from-primary/20 to-primary/10 px-2 py-1 rounded-md">
                  who you actually are
                </span>
              </p>
              <p className="text-lg text-muted-foreground/80 leading-relaxed">
                No algorithms. No reputation damage. Grow behind your avatar.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
          >
            <LiquidButton
              type="button"
              onClick={handleJoinClick}
              size="xl"
              className="rounded-full text-base font-semibold tracking-wide text-primary"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {signupLabel}
                <ArrowRight className="w-5 h-5" />
              </span>
            </LiquidButton>

            <LiquidButton
              type="button"
              onClick={handleExploreClick}
              size="xl"
              className="rounded-full text-base font-semibold tracking-wide text-foreground"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Explore Communities
              </span>
            </LiquidButton>
          </motion.div>

          <p className="text-xs text-muted-foreground/60 pt-2">Username + password only.</p>
        </div>
      </DotGlobeHero>
    </section>
  );
}
