import { useCallback, useEffect, useMemo, useState } from "react";
import type { OnboardingStep } from "@/store/types";

export function useOnboarding(isLoggedIn: boolean, username?: string) {
  const storageKey = username ? `raw.onboarding.completed.${username}` : null;

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("avatar");
  const [onboardingAnsweredPollIds, setOnboardingAnsweredPollIds] = useState<Set<string>>(new Set());
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  useEffect(() => {
    if (!storageKey) {
      setOnboardingLoaded(true);
      return;
    }
    setOnboardingCompleted(localStorage.getItem(storageKey) === "1");
    setOnboardingLoaded(true);
  }, [storageKey]);

  const markOnboardingPollAnswered = useCallback((pollId: string) => {
    setOnboardingAnsweredPollIds((previous) => new Set(previous).add(pollId));
  }, []);

  const resetOnboardingProgress = useCallback(() => {
    setOnboardingStep("avatar");
    setOnboardingAnsweredPollIds(new Set());
    setOnboardingCompleted(false);
    if (storageKey) localStorage.removeItem(storageKey);
  }, [storageKey]);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    setOnboardingStep("communities");
    if (storageKey) localStorage.setItem(storageKey, "1");
  }, [storageKey]);

  const isOnboardingResolved = !isLoggedIn || onboardingLoaded;

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
