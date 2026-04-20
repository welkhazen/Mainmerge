import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePostHog } from "@posthog/react";
import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from "web-vitals";
import { setClient } from "@/lib/analytics/client";
import { registerSuperProps, track } from "@/lib/analytics";
import type { DeviceClass, Surface } from "@/lib/analytics/events";
import { useTrackPageView } from "@/lib/analytics/useTrackPageView";
import { useRawStore } from "@/store/useRawStore";

function computeDeviceClass(): DeviceClass {
  if (typeof window === "undefined") {
    return "desktop";
  }
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function computeSurface(pathname: string): Surface {
  if (pathname.startsWith("/admin")) return "admin";
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/authenticate")
  ) {
    return "app";
  }
  return "landing";
}

const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "dev";

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const ph = usePostHog();
  const location = useLocation();
  const { isLoggedIn } = useRawStore();

  // Bind the module-level client so non-React code paths can call track().
  useEffect(() => {
    setClient(ph ?? null);
  }, [ph]);

  // Auto page-view on every route change.
  useTrackPageView();

  // Super-props that accompany every event.
  useEffect(() => {
    registerSuperProps({
      app_version: APP_VERSION,
      device_class: computeDeviceClass(),
      surface: computeSurface(location.pathname),
      logged_in: isLoggedIn,
    });
  }, [location.pathname, isLoggedIn]);

  // Web vitals → track once per metric.
  useEffect(() => {
    const report = (metric: Metric) => {
      const name = metric.name as "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
      track("web_vitals_reported", { metric: name, value: metric.value });
    };

    onCLS(report);
    onLCP(report);
    onINP(report);
    onFCP(report);
    onTTFB(report);
  }, []);

  return <>{children}</>;
}
