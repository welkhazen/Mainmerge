"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterCycleProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseBeforeType?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
}

type Phase = "typing" | "pausing" | "deleting" | "done";

export function TypewriterCycle({
  words,
  typeSpeed = 85,
  deleteSpeed = 45,
  pauseAfterType = 1200,
  pauseBeforeType = 250,
  loop = true,
  className,
  cursorClassName,
}: TypewriterCycleProps) {
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
      } else {
        timer = setTimeout(() => setPhase("pausing"), pauseAfterType);
      }
    } else if (phase === "pausing") {
      if (!loop && wordIndex === words.length - 1) {
        setPhase("done");
        return;
      }
      timer = setTimeout(() => setPhase("deleting"), 0);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          deleteSpeed
        );
      } else {
        timer = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        }, pauseBeforeType);
      }
    }

    return () => clearTimeout(timer);
  }, [
    text,
    phase,
    wordIndex,
    words,
    typeSpeed,
    deleteSpeed,
    pauseAfterType,
    pauseBeforeType,
    loop,
  ]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span aria-live="polite">{text}</span>
      <span
        aria-hidden="true"
        className={cn(
          "ml-[0.08em] inline-block w-[0.08em] h-[0.9em] animate-pulse bg-primary",
          cursorClassName
        )}
      />
    </span>
  );
}
