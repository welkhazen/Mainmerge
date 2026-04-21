import { useCallback, useMemo, useState } from "react";
import { track } from "@/lib/analytics";

export function useRewards() {
  const [avatarLevel, setAvatarLevel] = useState(1);

  const changeAvatarLevel = useCallback((toLevel: number) => {
    setAvatarLevel((previous) => {
      if (previous !== toLevel) {
        track("avatar_level_up", { from_level: previous, to_level: toLevel, trigger: "manual" });
      }
      return toLevel;
    });
  }, []);

  return useMemo(() => ({
    avatarLevel,
    setAvatarLevel,
    changeAvatarLevel,
  }), [avatarLevel, changeAvatarLevel]);
}
