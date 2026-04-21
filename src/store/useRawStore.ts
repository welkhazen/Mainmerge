import { useCallback, useEffect, useState } from "react";
import {
  clearAuthSession,
  getPersistedUserById,
  persistAuthSession,
  readAuthSession,
  registerOrUpdateUser,
} from "@/lib/adminData";
import { identify, reset, track } from "@/lib/analytics";
import type { User, AuthResult, OnboardingStep, Poll } from "./useRawStore.types";
import { DAILY_POLL_LIMIT } from "./useRawStore.types";
import { INITIAL_POLLS } from "./useRawStore.polling";
import {
  getTodayKey,
  readDailyPollProgressMap,
  writeDailyPollProgressMap,
  readOnboardingMap,
  writeOnboardingMap,
} from "./useRawStore.storage";

function toUser(record: NonNullable<ReturnType<typeof getPersistedUserById>>): User {
  return {
    id: record.id,
    username: record.username,
    role: record.role,
    moderationStatus: record.moderationStatus,
    warnings: record.warnings,
  };
}

function readInitialUser(): User | null {
  const sessionUserId = readAuthSession();
  if (!sessionUserId) {
    return null;
  }

  const persistedUser = getPersistedUserById(sessionUserId);
  return persistedUser ? toUser(persistedUser) : null;
}

export function useRawStore() {
  const [user, setUser] = useState<User | null>(() => readInitialUser());
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [showSignup, setShowSignup] = useState(false);
  const [avatarLevel, setAvatarLevel] = useState(1);
  const [freeVotesUsed, setFreeVotesUsed] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("avatar");
  const [onboardingAnsweredPollIds, setOnboardingAnsweredPollIds] = useState<Set<string>>(new Set());
  const [onboardingSelectedCommunityIds, setOnboardingSelectedCommunityIds] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isOnboardingResolved, setIsOnboardingResolved] = useState(false);
  const [dailyAnsweredPollIds, setDailyAnsweredPollIds] = useState<Set<string>>(new Set());
  const [dailyPollDate, setDailyPollDate] = useState<string>(getTodayKey());

  const isLoggedIn = user !== null;

  const refreshPersistedUser = useCallback(() => {
    const sessionUserId = readAuthSession();
    if (!sessionUserId) {
      setUser(null);
      return;
    }

    const persistedUser = getPersistedUserById(sessionUserId);
    setUser(persistedUser ? toUser(persistedUser) : null);
  }, []);

  useEffect(() => {
    refreshPersistedUser();
    window.addEventListener("focus", refreshPersistedUser);

    return () => {
      window.removeEventListener("focus", refreshPersistedUser);
    };
  }, [refreshPersistedUser]);

  useEffect(() => {
    if (!user) {
      setOnboardingStep("avatar");
      setOnboardingAnsweredPollIds(new Set());
      setOnboardingSelectedCommunityIds([]);
      setOnboardingCompleted(false);
      setIsOnboardingResolved(true);
      return;
    }

    setIsOnboardingResolved(false);

    const onboardingMap = readOnboardingMap();
    const entry = onboardingMap[user.id];
    if (!entry) {
      setOnboardingStep("avatar");
      setOnboardingAnsweredPollIds(new Set());
      setOnboardingSelectedCommunityIds([]);
      setOnboardingCompleted(false);
      setIsOnboardingResolved(true);
      return;
    }

    setOnboardingStep(entry.step ?? "avatar");
    setOnboardingAnsweredPollIds(new Set(entry.answeredPollIds ?? []));
    if (Array.isArray(entry.selectedCommunityIds)) {
      setOnboardingSelectedCommunityIds(entry.selectedCommunityIds.slice(0, 2));
    } else if (typeof entry.selectedCommunityId === "string" && entry.selectedCommunityId.length > 0) {
      setOnboardingSelectedCommunityIds([entry.selectedCommunityId]);
    } else {
      setOnboardingSelectedCommunityIds([]);
    }
    setOnboardingCompleted(Boolean(entry.completed));
    setIsOnboardingResolved(true);
  }, [user]);

  useEffect(() => {
    if (!user || !isOnboardingResolved) {
      return;
    }

    const onboardingMap = readOnboardingMap();
    onboardingMap[user.id] = {
      completed: onboardingCompleted,
      step: onboardingStep,
      answeredPollIds: [...onboardingAnsweredPollIds],
      selectedCommunityIds: onboardingSelectedCommunityIds,
      selectedCommunityId: onboardingSelectedCommunityIds[0] ?? null,
    };
    writeOnboardingMap(onboardingMap);
  }, [isOnboardingResolved, onboardingAnsweredPollIds, onboardingCompleted, onboardingSelectedCommunityIds, onboardingStep, user]);

  useEffect(() => {
    const ownerId = user?.id ?? "guest";
    const todayKey = getTodayKey();
    const progressMap = readDailyPollProgressMap();
    const ownerEntry = progressMap[ownerId];

    if (!ownerEntry || ownerEntry.date !== todayKey) {
      setDailyPollDate(todayKey);
      setDailyAnsweredPollIds(new Set());
      return;
    }

    setDailyPollDate(ownerEntry.date);
    setDailyAnsweredPollIds(new Set(ownerEntry.pollIds ?? []));
  }, [user?.id]);

  useEffect(() => {
    const ownerId = user?.id ?? "guest";
    const progressMap = readDailyPollProgressMap();
    progressMap[ownerId] = {
      date: dailyPollDate,
      pollIds: [...dailyAnsweredPollIds],
    };
    writeDailyPollProgressMap(progressMap);
  }, [dailyAnsweredPollIds, dailyPollDate, user?.id]);

  const vote = useCallback((pollId: string, optionId: string) => {
    const todayKey = getTodayKey();
    if (dailyPollDate !== todayKey) {
      setDailyPollDate(todayKey);
      setDailyAnsweredPollIds(new Set());
    }

    const currentDailySet = dailyPollDate === todayKey ? dailyAnsweredPollIds : new Set<string>();
    if (!currentDailySet.has(pollId) && currentDailySet.size >= DAILY_POLL_LIMIT) {
      return;
    }

    if (!isLoggedIn) {
      setFreeVotesUsed((previous) => previous + 1);
    } else {
      track("poll_answered", { poll_id: pollId, option_id: optionId, surface: "app" });
    }

    setVotedPolls((previous) => new Set([...previous, pollId]));
    setDailyAnsweredPollIds((previous) => {
      const next = new Set(previous);
      next.add(pollId);
      return next;
    });
    setPolls((previous) =>
      previous.map((poll) =>
        poll.id === pollId
          ? { ...poll, options: poll.options.map((option) => option.id === optionId ? { ...option, votes: option.votes + 1 } : option) }
          : poll
      )
    );
  }, [dailyAnsweredPollIds, dailyPollDate, isLoggedIn]);

  const requestSignupOtp = useCallback(async (username: string, _password: string, _phone: string): Promise<AuthResult> => {
    const registeredUser = registerOrUpdateUser(username);
    if (registeredUser.moderationStatus === "banned") {
      return { ok: false, error: "This account has been banned after moderation review." };
    }

    persistAuthSession(registeredUser.id);
    setUser(toUser(registeredUser));
    setShowSignup(false);
    identify(registeredUser.id, { username: registeredUser.username });
    track("signup_completed", { time_since_first_visit_ms: 0, source: "modal" });
    return { ok: true };
  }, []);

  const verifySignupOtp = useCallback(async (_code: string): Promise<AuthResult> => {
    return { ok: true };
  }, []);

  const login = useCallback(async (username: string, _password: string): Promise<AuthResult> => {
    const registeredUser = registerOrUpdateUser(username);
    if (registeredUser.moderationStatus === "banned") {
      return { ok: false, error: "This account has been banned after moderation review." };
    }

    persistAuthSession(registeredUser.id);
    setUser(toUser(registeredUser));
    setShowSignup(false);
    identify(registeredUser.id, { username: registeredUser.username });
    track("login_completed", { method: "username_password" });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    reset();
  }, []);

  const changeAvatarLevel = useCallback((toLevel: number) => {
    setAvatarLevel((prev) => {
      if (prev !== toLevel) {
        track("avatar_level_up", { from_level: prev, to_level: toLevel, trigger: "manual" });
      }
      return toLevel;
    });
  }, []);

  const markOnboardingPollAnswered = useCallback((pollId: string) => {
    setOnboardingAnsweredPollIds((previous) => {
      const next = new Set(previous);
      next.add(pollId);
      return next;
    });
  }, []);

  const resetOnboardingProgress = useCallback(() => {
    setOnboardingStep("avatar");
    setOnboardingAnsweredPollIds(new Set());
    setOnboardingSelectedCommunityIds([]);
    setOnboardingCompleted(false);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    setOnboardingStep("ready");
  }, []);

  return {
    user,
    isLoggedIn,
    isAdmin: user?.role === "admin",
    polls,
    votedPolls,
    freeVotesUsed,
    showSignup,
    setShowSignup,
    avatarLevel,
    setAvatarLevel,
    changeAvatarLevel,
    onboardingStep,
    setOnboardingStep,
    onboardingAnsweredPollIds,
    markOnboardingPollAnswered,
    onboardingSelectedCommunityIds,
    setOnboardingSelectedCommunityIds,
    onboardingCompleted,
    isOnboardingResolved,
    dailyAnsweredCount: dailyAnsweredPollIds.size,
    dailyPollLimit: DAILY_POLL_LIMIT,
    isDailyPollLimitReached: dailyAnsweredPollIds.size >= DAILY_POLL_LIMIT,
    completeOnboarding,
    resetOnboardingProgress,
    vote,
    requestSignupOtp,
    verifySignupOtp,
    login,
    logout,
  };
}

export type { User, AuthResult, Poll, OnboardingStep } from "./useRawStore.types";
