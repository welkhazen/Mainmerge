"use client";

import { useEffect, useMemo, useState } from "react";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

interface SequenceWord {
  text: string;
  className?: string;
  noSpaceAfter?: boolean;
}

interface SequenceLine {
  words: SequenceWord[];
  className?: string;
}

interface GlobeHeroTypewriterSequenceProps {
  lines: SequenceLine[];
  charDelay?: number;
  pauseBetweenLinesMs?: number;
  cursorClassName?: string;
}

export function GlobeHeroTypewriterSequence({
  lines,
  charDelay = 0.14,
  pauseBetweenLinesMs = 440,
  cursorClassName = "bg-primary",
}: GlobeHeroTypewriterSequenceProps) {
  const safeLines = useMemo(
    () => lines.filter((line) => Array.isArray(line?.words) && line.words.length > 0),
    [lines]
  );

  const [visibleCount, setVisibleCount] = useState(safeLines.length > 0 ? 1 : 0);

  const lineDurations = useMemo(
    () =>
      safeLines.map((line) => {
        const chars = line.words.reduce((count, word) => count + word.text.replace(/\s/g, "").length, 0);
        return Math.max(520, Math.round(chars * charDelay * 1000 + pauseBetweenLinesMs));
      }),
    [safeLines, charDelay, pauseBetweenLinesMs]
  );

  useEffect(() => {
    if (safeLines.length === 0) {
      setVisibleCount(0);
      return;
    }
    if (visibleCount <= 0) {
      setVisibleCount(1);
      return;
    }
    if (visibleCount >= safeLines.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, lineDurations[visibleCount - 1]);

    return () => clearTimeout(timer);
  }, [visibleCount, safeLines.length, lineDurations]);

  return (
    <div className="flex flex-col items-center leading-[0.92]">
      {safeLines.slice(0, visibleCount).map((line, index) => (
        <div key={`line-${index}`} className="block">
          <TypewriterEffect
            words={line.words}
            className={`!font-black !tracking-tight !text-[2.25rem] sm:!text-[3rem] md:!text-[3.9rem] lg:!text-[5rem] ${line.className ?? ""}`}
            cursorClassName={cursorClassName}
            charDelay={charDelay}
            charDuration={Math.max(0.18, charDelay * 2)}
          />
        </div>
      ))}
    </div>
  );
}
