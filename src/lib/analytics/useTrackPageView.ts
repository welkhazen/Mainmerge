import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { track } from "./index";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

function readUtm(search: string): Partial<Record<UtmKey, string>> {
  if (!search) {
    return {};
  }
  const params = new URLSearchParams(search);
  const out: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Fires `page_viewed` on every route change. Safe to mount multiple times —
 * duplicate firings for the same path are suppressed within a single mount.
 */
export function useTrackPageView(): void {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    if (lastPath.current === path) {
      return;
    }
    lastPath.current = path;

    const referrer =
      typeof document !== "undefined" ? document.referrer || undefined : undefined;
    const utm = readUtm(location.search);

    track("page_viewed", {
      path: location.pathname,
      ...(referrer ? { referrer } : {}),
      ...utm,
    });
  }, [location.pathname, location.search, location.hash]);
}
