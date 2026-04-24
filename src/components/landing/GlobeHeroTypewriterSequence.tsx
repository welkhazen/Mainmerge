"use client";

import { useEffect, useMemo, useState } from "react";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

interface GlobeHeroTypewriterSequenceProps {
  words: string[];
  charDelay?: number;
  pauseBetweenLinesMs?: number;
  lineClassNames?: string[];
  cursorClassName?: string;
}

export function GlobeHeroTypewriterSequence({
  words,
  charDelay = 0.14,
  pauseBetweenLinesMs = 440,
  lineClassNames = [],
  cursorClassName = "bg-primary",
}: GlobeHeroTypewriterSequenceProps) {
  const [visibleCount, setVisibleCount] = useState(words.length > 0 ? 1 : 0);

  const lineDurations = useMemo(
    () =>
      words.map((line) => {
        const chars = line.replace(/\s/g, "").length;
        return Math.max(520, Math.round(chars * charDelay * 1000 + pauseBetweenLinesMs));
      }),
    [words, charDelay, pauseBetweenLinesMs]
  );

  useEffect(() => {
    if (visibleCount >= words.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, lineDurations[visibleCount - 1]);

    return () => clearTimeout(timer);
  }, [visibleCount, words.length, lineDurations]);

  return (
    <div className="flex flex-col items-center leading-[0.92]">
      {words.slice(0, visibleCount).map((line, index) => (
        <div key={line} className="block">
          <TypewriterEffect
            words={[{ text: line }]}
            className={`!font-black !tracking-tight !text-[2.25rem] sm:!text-[3rem] md:!text-[3.9rem] lg:!text-[5rem] ${lineClassNames[index] ?? ""}`}
            cursorClassName={cursorClassName}
            charDelay={charDelay}
            charDuration={Math.max(0.18, charDelay * 2)}
          />
        </div>
      ))}
    </div>
  );
}
