create extension if not exists pgcrypto;

create table if not exists public.app_profiles (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  xp integer not null default 0,
  daily_streak integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

alter table if exists public.app_users
  add column if not exists referral_code text;

create unique index if not exists app_users_referral_code_uidx
on public.app_users (referral_code)
where referral_code is not null;

create table if not exists public.app_polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  is_active boolean not null default true,
  locked boolean not null default false,
  created_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.app_polls(id) on delete cascade,
  text text not null,
  votes_count integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.app_poll_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  poll_id uuid not null references public.app_polls(id) on delete cascade,
  option_id uuid not null references public.app_poll_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, poll_id)
);

create table if not exists public.app_communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_community_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  community_id uuid not null references public.app_communities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, community_id)
);

create table if not exists public.app_admin_users (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.app_users(id) on delete cascade,
  referred_user_id uuid not null references public.app_users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending',
  reward_points integer not null default 0,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (referrer_user_id, referred_user_id)
);

create table if not exists public.app_stytch_users (
  stytch_user_id text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists app_polls_active_idx on public.app_polls (is_active, created_at desc);
create index if not exists app_poll_options_poll_idx on public.app_poll_options (poll_id, order_index);
create index if not exists app_poll_votes_user_idx on public.app_poll_votes (user_id, created_at desc);
create index if not exists app_community_members_user_idx on public.app_community_members (user_id);
create index if not exists app_community_members_community_idx on public.app_community_members (community_id);
create index if not exists app_stytch_users_user_idx on public.app_stytch_users (user_id);
create index if not exists app_stytch_users_email_idx on public.app_stytch_users (email);
create index if not exists referrals_referrer_idx on public.referrals (referrer_user_id, created_at desc);
create index if not exists referrals_referred_idx on public.referrals (referred_user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_admin_users_role_check'
  ) then
    alter table public.app_admin_users
      add constraint app_admin_users_role_check check (role in ('admin', 'moderator'));
  end if;
end
$$;

alter table public.app_admin_users enable row level security;
alter table public.app_polls enable row level security;

drop policy if exists app_admin_users_select_self_admin on public.app_admin_users;
create policy app_admin_users_select_self_admin
on public.app_admin_users
for select
to authenticated
using (user_id = auth.uid() and role = 'admin');

drop policy if exists app_polls_insert_admin_only on public.app_polls;
create policy app_polls_insert_admin_only
on public.app_polls
for insert
to authenticated
with check (
  exists (
    select 1
    from public.app_admin_users admin
    where admin.user_id = auth.uid()
      and admin.role = 'admin'
  )
);
