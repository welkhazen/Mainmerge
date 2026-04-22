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
    enabled: typeof window !== "undefined"
      ? window.location.hostname !== "localhost" && localStorage.getItem("force-logout") !== "true"
      : true,
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
    // Client-side mock login for testing
    if (!username || !password) {
      return { ok: false, error: "Username and password required" };
    }

    const mockUser: User = {
      id: "test-user-" + Date.now(),
      username,
      role: username === "admin" ? "admin" : "member",
      moderationStatus: "active",
      warnings: 0,
    };

    queryClient.setQueryData(["auth", "me"], mockUser);
    if (typeof window !== "undefined") {
      localStorage.removeItem("force-logout");
    }
    identify(mockUser.id, { username: mockUser.username });
    track("login_completed", { method: "username_password" });
    setShowSignup(false);
    return { ok: true };
  }, [queryClient]);

  const requestSignupOtp = useCallback(async (username: string, password: string, phone: string): Promise<AuthResult> => {
    // Client-side mock signup for testing
    if (!username || !password || !phone) {
      return { ok: false, error: "All fields required" };
    }
    // Just return success - OTP verification will complete the signup
    return { ok: true };
  }, []);

  const verifySignupOtp = useCallback(async (code: string): Promise<AuthResult> => {
    // Client-side mock OTP verification for testing
    if (!code) {
      return { ok: false, error: "Code required" };
    }

    const mockUser: User = {
      id: "test-user-" + Date.now(),
      username: "test-user",
      role: "member",
      moderationStatus: "active",
      warnings: 0,
    };

    queryClient.setQueryData(["auth", "me"], mockUser);
    if (typeof window !== "undefined") {
      localStorage.removeItem("force-logout");
    }
    identify(mockUser.id, { username: mockUser.username });
    track("signup_completed", { source: "modal" });
    setShowSignup(false);
    return { ok: true };
  }, [queryClient]);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("force-logout", "true");
    }
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    reset();
    window.location.href = "/";
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
