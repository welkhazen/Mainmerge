import { cn } from "@/lib/utils";

export type LandingDensity = "default" | "compact";

export const LANDING_TYPOGRAPHY_DENSITY: LandingDensity = "default";

export const landingTypography = {
  metaLabel: "landing-type-kicker uppercase",
  heroTitle: "landing-type-title font-black",
  heroLead: "landing-type-title-lead font-light",
  heroBodyStrong: "landing-type-body-lg font-medium",
  sectionBody: "landing-type-body",
  sectionBodyStrong: "landing-type-body font-semibold",
  sectionBodyMuted: "landing-type-body-muted",
} as const;

export type LandingTypographyToken = keyof typeof landingTypography;

const compactLandingTypography: Record<LandingTypographyToken, string> = {
  metaLabel: "landing-type-kicker-compact",
  heroTitle: "landing-type-title-compact",
  heroLead: "landing-type-title-lead-compact",
  heroBodyStrong: "landing-type-body-lg-compact",
  sectionBody: "landing-type-body-compact",
  sectionBodyStrong: "landing-type-body-compact",
  sectionBodyMuted: "landing-type-body-muted-compact",
};

export const getLandingType = (
  token: LandingTypographyToken,
  density: LandingDensity = LANDING_TYPOGRAPHY_DENSITY,
) => cn(landingTypography[token], density === "compact" && compactLandingTypography[token]);
