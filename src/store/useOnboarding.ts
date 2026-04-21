import { useCallback, useMemo, useState } from "react";
import type { OnboardingStep } from "@/store/types";

export function useOnboarding(isLoggedIn: boolean) {
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("avatar");
  const [onboardingAnsweredPollIds, setOnboardingAnsweredPollIds] = useState<Set<string>>(new Set());
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const markOnboardingPollAnswered = useCallback((pollId: string) => {
    setOnboardingAnsweredPollIds((previous) => new Set(previous).add(pollId));
  }, []);

  const resetOnboardingProgress = useCallback(() => {
    setOnboardingStep("avatar");
    setOnboardingAnsweredPollIds(new Set());
    setOnboardingCompleted(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    setOnboardingStep("communities");
  }, []);

  const isOnboardingResolved = !isLoggedIn || onboardingCompleted || onboardingStep.length > 0;

  return useMemo(() => ({
    onboardingStep,
    setOnboardingStep,
    onboardingAnsweredPollIds,
    markOnboardingPollAnswered,
    onboardingCompleted,
    completeOnboarding,
    resetOnboardingProgress,
    isOnboardingResolved,
  }), [
    completeOnboarding,
    isOnboardingResolved,
    markOnboardingPollAnswered,
    onboardingAnsweredPollIds,
    onboardingCompleted,
    onboardingStep,
    resetOnboardingProgress,
  ]);
}
