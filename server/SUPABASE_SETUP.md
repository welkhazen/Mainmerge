# Backend Account API + Supabase Setup

This backend now supports account management endpoints suitable for a Supabase-backed user store.

## What was added

- Profile read endpoint: `GET /api/users/me`
- Profile update endpoint: `PATCH /api/users/me`
- Password change endpoint: `POST /api/users/me/change-password`
- Repository abstraction (`server/lib/userRepository.ts`) with:
  - Memory implementation (default, no DB required)
  - Supabase REST implementation (enabled via env vars)

## Environment variables

Add the existing auth vars plus these optional Supabase vars to your backend environment file:

```env
# Existing required vars still apply
SESSION_SECRET=replace-with-long-random-value
PHONE_HMAC_KEY=replace-with-long-random-value
AUTH_PASSWORD_PEPPER=replace-with-long-random-value
BCRYPT_ROUNDS=12

# Optional: enable Supabase-backed users
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SCHEMA=public
SUPABASE_USERS_TABLE=app_users
```

If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not provided, the backend falls back to in-memory users.

## Supabase SQL schema

Run this in Supabase SQL editor:

```sql
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  phone_hash text not null unique,
  display_name text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  password_changed_at timestamptz not null default now()
);

create index if not exists app_users_username_idx on public.app_users (username);
create index if not exists app_users_phone_hash_idx on public.app_users (phone_hash);
```

## API request/response examples

### Get current user

`GET /api/users/me`

Response:

```json
{
  "user": {
    "id": "a294f2de-cc8d-47d4-8f18-f2f7f7e8ff3e",
    "username": "rawwar_king",
    "displayName": "Raw War King",
    "bio": "No face. Real opinions.",
    "createdAt": "2026-04-15T10:12:31.339Z",
    "updatedAt": "2026-04-15T10:22:08.112Z",
    "passwordChangedAt": "2026-04-15T10:12:31.339Z"
  }
}
```

### Update profile

`PATCH /api/users/me`

Body:

```json
{
  "displayName": "Raw Warrior",
  "bio": "Anonymous but accountable"
}
```

### Change password

`POST /api/users/me/change-password`

Body:

```json
{
  "currentPassword": "OldPass#2025",
  "newPassword": "NewPass#2026"
}
```

Password policy:

- Length: 8-128
- Must include uppercase, lowercase, number, symbol
- Must differ from current password

## MVC v2 API (communities, polls, XP, streak)

New server-side MVC routes are available under `/api/v2`.

- `GET /api/v2/dashboard` -> profile + communities + randomized polls
- `GET /api/v2/polls/random?limit=10` -> randomized polls prioritizing unseen polls
- `POST /api/v2/polls/:pollId/vote` -> submit poll vote and award XP/streak activity
- `GET /api/v2/communities` -> list communities with membership status
- `POST /api/v2/communities/:communityId/join` -> join community and award XP/streak activity
- `GET /api/v2/profile` -> profile with XP and daily streak
- `POST /api/v2/admin/polls` -> admin-only poll creation
- `POST /api/auth/stytch/session-exchange` -> verifies Stytch session token and syncs/links user to Supabase-backed account
- `POST /api/auth/magic-link/request` -> sends transactional magic-link email
- `POST /api/auth/magic-link/verify` -> exchanges magic-link token for authenticated session
- `POST /api/notifications/streak-at-risk` -> sends transactional streak reminder email (admin)
- `POST /api/notifications/weekly-digest` -> sends weekly digest email (admin)
- `POST /api/notifications/community-invite` -> sends community invite email (admin)
- `POST /api/cron/streaks/reset` -> UTC cron-safe streak reset endpoint (Bearer CRON_SECRET)
- `POST /api/cron/streaks/at-risk` -> UTC cron-safe at-risk reminder dispatch endpoint (Bearer CRON_SECRET)

Admin access can be configured with either:

- rows in `public.app_admin_users` where `role='admin'`

Client-side role is display-only. Server-side authorization checks `public.app_admin_users`.

### Additional env vars for Stytch session exchange

```env
STYTCH_PROJECT_ID=project-test-...
STYTCH_SECRET=secret-test-...
STYTCH_ENV=test

# Transactional email
EMAIL_PROVIDER=none # one of: none, resend, postmark
EMAIL_FROM=
RESEND_API_KEY=
POSTMARK_SERVER_TOKEN=
APP_BASE_URL=http://localhost:8080

# Cron
CRON_ENABLED=true
CRON_SECRET=replace-with-long-random-value
```

### Required SQL for MVC v2

Run the schema in [server/sql/mvc_v2_schema.sql](server/sql/mvc_v2_schema.sql) in your Supabase SQL editor.

It creates and indexes these tables:

- `app_profiles`
- `app_polls`
- `app_poll_options`
- `app_poll_votes`
- `app_communities`
- `app_community_members`
- `app_admin_users`
- `app_stytch_users`
- `referrals`

It also enables row-level security policies that gate admin poll creation to `role='admin'` users.

Referral loop behavior:

- `app_users.referral_code` is generated for each user
- New signups can include `referralCode` in `/api/auth/signup/request-otp`
- On successful activation, a `referrals` row is written and rewards are applied
