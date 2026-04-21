import { useMemo, useState } from "react";

export function useCommunities() {
  const [onboardingSelectedCommunityIds, setOnboardingSelectedCommunityIds] = useState<string[]>([]);

  return useMemo(() => ({
    onboardingSelectedCommunityIds,
    setOnboardingSelectedCommunityIds,
  }), [onboardingSelectedCommunityIds]);
}
