-- Run in Supabase SQL editor after mvc_v2_schema.sql.
-- Replace the UUID values before running.

-- 1) Ensure RLS-enabled tables have expected policies.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('app_admin_users', 'app_polls')
order by tablename, policyname;

-- 2) Seed one admin and one member in app_admin_users.
-- Replace with real app_users IDs from your project.
insert into public.app_admin_users (user_id, role)
values
  ('00000000-0000-0000-0000-000000000001', 'admin')
on conflict (user_id) do update set role = excluded.role;

insert into public.app_admin_users (user_id, role)
values
  ('00000000-0000-0000-0000-000000000002', 'moderator')
on conflict (user_id) do update set role = excluded.role;

-- 3) Validate server-side admin source of truth.
select user_id, role
from public.app_admin_users
where role = 'admin';

-- 4) Validate Stytch mapping table structure exists.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'app_stytch_users'
order by ordinal_position;
