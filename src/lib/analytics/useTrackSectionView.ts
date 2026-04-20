import { useEffect, useRef } from "react";
import { track } from "./index";
import type { EventPropsFor } from "./events";

type SectionId = EventPropsFor<"landing_section_viewed">["section_id"];

/**
 * Per-session guard so the same section doesn't fire twice per page load.
 * The key is "<session-id>:<section-id>"; if no session id, we fall back to a
 * module-level Set that resets on refresh.
 */
const seen = new Set<string>();

function sessionKey(sectionId: SectionId): string {
  if (typeof window === "undefined") {
    return `ssr:${sectionId}`;
  }
  const id = (window as unknown as { __raw_session_id?: string }).__raw_session_id;
  if (!id) {
    const generated = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    (window as unknown as { __raw_session_id?: string }).__raw_session_id = generated;
    return `${generated}:${sectionId}`;
  }
  return `${id}:${sectionId}`;
}

/**
 * Fire `landing_section_viewed` once per session when the ref'd element is
 * at least 50% in view.
 */
export function useTrackSectionView(sectionId: SectionId) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const key = sessionKey(sectionId);
    if (seen.has(key)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!seen.has(key)) {
              seen.add(key);
              track("landing_section_viewed", { section_id: sectionId });
            }
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [sectionId]);

  return ref;
}

/**
 * Test-only: reset the per-session guard between tests.
 */
export function __resetSectionViewGuardForTests(): void {
  seen.clear();
  if (typeof window !== "undefined") {
    delete (window as unknown as { __raw_session_id?: string }).__raw_session_id;
  }
}
