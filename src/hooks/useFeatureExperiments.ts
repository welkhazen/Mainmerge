import { useMemo } from "react";

export type HeroCopyVariant = "control" | "identity-first";
export type SignupCtaVariant = "join-free" | "start-anonymous";
export type GatePositionVariant = "inline" | "below";

export function useFeatureExperiments() {
  return useMemo(
    () => ({
      heroCopy: "control" as HeroCopyVariant,
      signupCta: "join-free" as SignupCtaVariant,
      gatePosition: "inline" as GatePositionVariant,
    }),
    [],
  );
}
