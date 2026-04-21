import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { identify, reset, track } from "@/lib/analytics";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { AuthResult, User } from "@/store/types";

type ApiUser = {
  id: string;
  username: string;
  role?: "member" | "admin";
};

export function useAuth() {
  const queryClient = useQueryClient();
  const [showSignup, setShowSignup] = useState(false);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    retry: false,
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiRequest<{ user: ApiUser }>("/api/users/me");
        return {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role ?? "member",
          moderationStatus: "active",
          warnings: 0,
        };
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
  });

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    try {
      await apiRequest<{ ok: boolean }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      const nextUser = queryClient.getQueryData<User | null>(["auth", "me"]);
      if (nextUser) {
        identify(nextUser.id, { username: nextUser.username });
      }
      track("login_completed", { method: "username_password" });
      setShowSignup(false);
      return { ok: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Login failed.";
      return { ok: false, error: message };
    }
  }, [queryClient]);

  const requestSignupOtp = useCallback(async (username: string, password: string, phone: string): Promise<AuthResult> => {
    try {
      const referralCode =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref")?.trim().toUpperCase()
          : undefined;
      await apiRequest<{ ok: boolean }>("/api/auth/signup/request-otp", {
        method: "POST",
        body: JSON.stringify({ username, password, phone, referralCode }),
      });
      return { ok: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to start signup.";
      return { ok: false, error: message };
    }
  }, []);

  const verifySignupOtp = useCallback(async (code: string): Promise<AuthResult> => {
    try {
      await apiRequest<{ ok: boolean }>("/api/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      const nextUser = queryClient.getQueryData<User | null>(["auth", "me"]);
      if (nextUser) {
        identify(nextUser.id, { username: nextUser.username });
      }
      track("signup_completed", { source: "modal" });
      setShowSignup(false);
      return { ok: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Signup verification failed.";
      return { ok: false, error: message };
    }
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await apiRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout network errors and clear local session state anyway.
    }

    queryClient.setQueryData(["auth", "me"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    reset();
  }, [queryClient]);

  const user = meQuery.data ?? null;
  const isLoggedIn = Boolean(user);

  return useMemo(() => ({
    user,
    isLoggedIn,
    isAdmin: user?.role === "admin",
    showSignup,
    setShowSignup,
    requestSignupOtp,
    verifySignupOtp,
    login,
    logout,
  }), [
    isLoggedIn,
    login,
    logout,
    requestSignupOtp,
    showSignup,
    user,
    verifySignupOtp,
  ]);
}
