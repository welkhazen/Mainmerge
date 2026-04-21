import { useEffect, useMemo, useRef } from "react";
import { usePostHog } from "@posthog/react";
import { track } from "@/lib/analytics";

export type HeroCopyVariant = "control" | "identity-first";
export type SignupCtaVariant = "join-free" | "start-anonymous";
export type GatePositionVariant = "inline" | "below";

function normalizeVariant<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value !== "string") {
    return fallback;
  }

  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function useFeatureExperiments() {
  const posthog = usePostHog();
  const exposureRef = useRef(new Set<string>());

  const heroCopy = normalizeVariant<HeroCopyVariant>(
    posthog?.getFeatureFlag("exp_hero_copy"),
    ["control", "identity-first"],
    "control",
  );

  const signupCta = normalizeVariant<SignupCtaVariant>(
    posthog?.getFeatureFlag("exp_signup_cta"),
    ["join-free", "start-anonymous"],
    "join-free",
  );

  const gatePosition = normalizeVariant<GatePositionVariant>(
    posthog?.getFeatureFlag("exp_gate_position"),
    ["inline", "below"],
    "inline",
  );

  useEffect(() => {
    if (!posthog) {
      return;
    }

    const entries = [
      ["exp_hero_copy", heroCopy],
      ["exp_signup_cta", signupCta],
      ["exp_gate_position", gatePosition],
    ] as const;

    entries.forEach(([flag, variant]) => {
      const key = `${flag}:${variant}`;
      if (exposureRef.current.has(key)) {
        return;
      }

      exposureRef.current.add(key);
      track("experiment_exposure", { flag, variant });
    });
  }, [gatePosition, heroCopy, posthog, signupCta]);

  return useMemo(
    () => ({
      heroCopy,
      signupCta,
      gatePosition,
    }),
    [gatePosition, heroCopy, signupCta],
  );
}
