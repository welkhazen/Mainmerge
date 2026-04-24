"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface TypewriterStackProps {
  words: string[];
  typeSpeed?: number;
  pauseAfterWord?: number;
  nextWordDelay?: number;
  className?: string;
  lineClassName?: string;
  cursorClassName?: string;
}

type Phase = "typing" | "pausing" | "done";

export function TypewriterStack({
  words,
  typeSpeed = 85,
  pauseAfterWord = 450,
  nextWordDelay = 220,
  className,
  lineClassName,
  cursorClassName,
}: TypewriterStackProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (phase === "done" || words.length === 0) return;
    const current = words[wordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeSpeed
        );
      } else if (wordIndex + 1 < words.length) {
        timer = setTimeout(() => setPhase("pausing"), pauseAfterWord);
      } else {
        setPhase("done");
      }
    } else if (phase === "pausing") {
      timer = setTimeout(() => {
        setWordIndex((i) => i + 1);
        setText("");
        setPhase("typing");
      }, nextWordDelay);
    }

    return () => clearTimeout(timer);
  }, [text, phase, wordIndex, words, typeSpeed, pauseAfterWord, nextWordDelay]);

  return (
    <span className={cn("flex flex-col items-center", className)}>
      {words.slice(0, wordIndex).map((w, i) => (
        <motion.span
          key={`done-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className={cn("block will-change-transform", lineClassName)}
        >
          {w}
        </motion.span>
      ))}
      <motion.span
        key={`typing-${wordIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className={cn("inline-flex items-center will-change-transform", lineClassName)}
      >
        <span aria-live="polite">{text}</span>
        <span
          aria-hidden="true"
          className={cn(
            "ml-[0.08em] inline-block w-[0.08em] h-[0.9em] animate-pulse bg-primary",
            cursorClassName
          )}
        />
      </motion.span>
    </span>
  );
}
