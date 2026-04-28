import { useEffect, useMemo, useState } from "react";
import { type LandingDensity } from "@/components/landing/landing-typography";

const LANDING_DENSITY_STORAGE_KEY = "landing-density";
const COMPACT_MEDIA_QUERY = "(max-width: 390px) and (max-height: 844px)";

function resolveManualOverride(): LandingDensity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const queryDensity = new URLSearchParams(window.location.search).get("landingDensity");
  if (queryDensity === "compact" || queryDensity === "default") {
    window.localStorage.setItem(LANDING_DENSITY_STORAGE_KEY, queryDensity);
    return queryDensity;
  }

  const storedDensity = window.localStorage.getItem(LANDING_DENSITY_STORAGE_KEY);
  return storedDensity === "compact" || storedDensity === "default" ? storedDensity : null;
}

export function useLandingDensity() {
  const [density, setDensity] = useState<LandingDensity>("default");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const manualOverride = resolveManualOverride();
    if (manualOverride) {
      setDensity(manualOverride);
      return;
    }

    const mediaQuery = window.matchMedia(COMPACT_MEDIA_QUERY);
    const updateDensity = () => {
      setDensity(mediaQuery.matches ? "compact" : "default");
    };

    updateDensity();
    mediaQuery.addEventListener("change", updateDensity);
    return () => mediaQuery.removeEventListener("change", updateDensity);
  }, []);

  return useMemo(() => ({ density }), [density]);
}
