import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { identify, reset, track } from "@/lib/analytics";
import type { AuthResult, User } from "@/store/types";
import {
  signIn,
  signUp,
  signOut,
  getSession,
  type AuthUser,
} from "@/backend/supabase/controllers/authController";

function toUser(a: AuthUser): User {
  return {
    id: a.id,
    username: a.username,
    role: a.role === "admin" ? "admin" : "member",
    moderationStatus:
      a.status === "banned" || a.status === "deleted"
        ? "banned"
        : a.status === "warned"
          ? "warned"
          : "active",
    warnings: 0,
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Restore session on mount
  useEffect(() => {
    getSession()
      .then((authUser) => {
        if (authUser) {
          const u = toUser(authUser);
          setUser(u);
          identify(u.id, { username: u.username });
        }
      })
      .catch(() => {
        // No active session
      });
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      const result = await signIn(username, password);
      if (!result.ok || !result.user) return { ok: false, error: result.error };
      const u = toUser(result.user);
      setUser(u);
      identify(u.id, { username: u.username });
      track("login_completed", { method: "username_password" });
      setShowSignup(false);
      return { ok: true };
    },
    [],
  );

  const requestSignupOtp = useCallback(
    async (username: string, password: string, _phone: string): Promise<AuthResult> => {
      const result = await signUp(username, password);
      if (!result.ok || !result.user) return { ok: false, error: result.error };
      const u = toUser(result.user);
      setUser(u);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`raw.onboarding.completed.${username}`);
      }
      identify(u.id, { username: u.username });
      track("signup_completed", { source: "modal" });
      setShowSignup(false);
      return { ok: true };
    },
    [],
  );

  const verifySignupOtp = useCallback(async (_code: string): Promise<AuthResult> => {
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    queryClient.clear();
    reset();
    window.location.href = "/";
  }, [queryClient]);

  return useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isAdmin: user?.role === "admin",
      showSignup,
      setShowSignup,
      requestSignupOtp,
      verifySignupOtp,
      login,
      logout,
    }),
    [login, logout, requestSignupOtp, showSignup, user, verifySignupOtp],
  );
}
