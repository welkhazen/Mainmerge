import { supabase } from '../client';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  status: string;
  avatar_level: number;
}

const SESSION_KEY = 'raw.auth.session.v2';

function saveSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

type RpcResult = { ok: boolean; user?: AuthUser; error?: string };

export async function signUp(username: string, password: string): Promise<RpcResult> {
  const { data, error } = await supabase.rpc('signup_user', {
    p_username: username,
    p_password: password,
  });
  if (error) return { ok: false, error: error.message };
  const result = data as RpcResult;
  if (result.ok && result.user) saveSession(result.user);
  return result;
}

export async function signIn(username: string, password: string): Promise<RpcResult> {
  const { data, error } = await supabase.rpc('login_user', {
    p_username: username,
    p_password: password,
  });
  if (error) return { ok: false, error: error.message };
  const result = data as RpcResult;
  if (result.ok && result.user) saveSession(result.user);
  return result;
}

export async function signOut(): Promise<void> {
  clearSession();
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
