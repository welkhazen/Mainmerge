import { supabase } from '../client';
import type { UserRow, UserRole } from '../models/user';

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, role, status, warnings, avatar_level, email, created_at')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data as UserRow | null;
}

export async function createUser(
  id: string,
  username: string,
  role: UserRole = 'member',
): Promise<UserRow> {
  const alreadyTaken = await isUsernameTaken(username);
  if (alreadyTaken) throw new Error(`Username "${username}" is already taken.`);

  const { data, error } = await supabase
    .from('users')
    .insert({ id, username, role, status: 'active', warnings: 0, avatar_level: 1 })
    .select('id, username, role, status, warnings, avatar_level, created_at')
    .single();
  if (error) throw error;
  return data as UserRow;
}
