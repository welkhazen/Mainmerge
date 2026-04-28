"use client";

import React from "react";
import { motion } from "motion/react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { ArrowRight, Zap } from "lucide-react";
import { track } from "@/lib/analytics";

import { GlobeHeroTypewriterSequence } from "@/components/landing/GlobeHeroTypewriterSequence";
import { TypewriterStack } from "@/components/ui/typewriter-stack";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";

import { Globe } from "@/components/ui/globe-hero";
import { useTheme } from "@/providers/ThemeProvider";

interface GlobeHeroProps {
  onSignupClick: () => void;
}

export function GlobeHero({ onSignupClick }: GlobeHeroProps) {
  const { mode } = useTheme();
  const globeColor = mode === "light" ? "#0A0A0A" : "#F5F5F5";

  const handlePrimaryClick = () => {
    track("landing_cta_clicked", {
      cta_id: "globe_hero_join_now",
      cta_text: "Join Now",
      source_section: "globe_hero",
    });
    onSignupClick();
  };

  const handleSecondaryClick = () => {
    track("landing_cta_clicked", {
      cta_id: "globe_hero_learn_more",
      cta_text: "Learn More",
      source_section: "globe_hero",
    });
  };

  return (
    <div className="relative bg-gradient-to-br from-background via-background/95 to-muted/10 overflow-hidden h-[90vh] min-h-[600px] flex items-center justify-center">
      {/* Globe behind text, centered and smaller */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] lg:w-[520px] lg:h-[520px]">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
            <Globe rotationSpeed={0.004} radius={1.1} color={globeColor} />
          </Canvas>
        </div>
      </div>
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
            className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-xl shadow-2xl w-full max-w-none justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="relative z-10 text-sm font-bold text-primary tracking-wider uppercase text-center w-full">Fully Anonymous • Community Driven • Identity Based</span>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-[1.53rem] md:text-[2.295rem] lg:text-[3.06rem] xl:text-[4.08rem] font-black tracking-tighter leading-[0.85] select-none"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="block font-light text-foreground/70 mb-3 text-[1.146rem] md:text-[1.914rem] lg:text-[2.298rem]">
                Find
              </span>
              <span className="block relative">
                <span
                  className="font-black relative z-10 block"
                  style={{
                    filter:
                      "drop-shadow(0 0 24px hsl(var(--primary) / 0.45)) drop-shadow(0 0 48px hsl(var(--primary) / 0.25))",
                  }}
                >
                  <TypewriterStack
                    words={["Your Place", "Your People", "Your Self", "Be raW"]}
                    textClassName="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent font-black"
                    firstWordClassName="text-metallic font-black"
                    cursorClassName="bg-primary"
                  />
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
            className="max-w-3xl mx-auto space-y-4 pt-8"
          >
            <p
              className="text-xl md:text-2xl text-foreground font-bold leading-relaxed font-medium"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Y𝗼𝘂𝗿 𝗻𝗲𝘄 𝟮𝟰/𝟳 𝗹𝗶𝘃𝗶𝗻𝗴 𝗮𝗻𝗱 𝗲𝘃𝗲𝗿-𝗴𝗿𝗼𝘄𝗶𝗻𝗴 𝗻𝗲𝘄 𝘄𝗼𝗿𝗹𝗱
            </p>
            <p className="text-base md:text-lg font-medium leading-relaxed">
              <span className="text-foreground/60 font-semibold bg-gradient-to-r from-primary/10 to-primary/5 px-2 py-1 rounded-md">
                prioritizing genuine connections, a sense of belonging, and a safe space to allow discovering oneself and others.
              </span>
            </p>
            <p
              className="text-lg font-semibold text-primary leading-relaxed"
              style={{
                textShadow:
                  "0 0 12px hsl(var(--primary) / 0.6), 0 0 28px hsl(var(--primary) / 0.35)",
              }}
            >
              Username And Password Only
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
        >
          <motion.button
            type="button"
            onClick={handlePrimaryClick}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2), 0 0 25px hsl(var(--primary) / 0.3)",
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground rounded-xl font-semibold text-lg shadow-xl hover:shadow-primary/30 transition-all duration-500 overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
            <span className="relative z-10 tracking-wide">Join Now</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </motion.button>

          <motion.a
            href="#communities"
            onClick={handleSecondaryClick}
            whileHover={{
              scale: 1.05,
              backgroundColor: "hsl(var(--accent))",
              borderColor: "hsl(var(--primary))",
              boxShadow: "0 15px 30px rgba(0,0,0,0.1), 0 0 15px hsl(var(--primary) / 0.1)",
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-border/40 rounded-xl font-semibold text-lg hover:border-primary/40 transition-all duration-500 backdrop-blur-xl bg-background/60 hover:bg-background/90 shadow-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="relative z-10 w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
            <span className="relative z-10 tracking-wide">Learn More</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
