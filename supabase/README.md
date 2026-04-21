# Supabase Setup & Testing Guide

## Quick Start

### 1. Initialize Supabase (Local or Remote)

**Local Development:**
```bash
supabase init
supabase start
```

**Remote (Vercel):**
- Set Supabase URL and anon key in `.env.local`

### 2. Run Migrations

```bash
# Local
supabase migration list
supabase migration up

# Remote
supabase migration push
```

### 3. Seed Admin User

```bash
# Local - via psql
psql -h localhost -U postgres -d postgres -f supabase/seeds/001_admin_seed.sql

# Remote - via Supabase dashboard
# Copy/paste contents of seeds/001_admin_seed.sql into SQL editor
```

## Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, username, avatar_level, role (user/mod/admin) |
| `polls` | Discussion polls | id, question, community_id, is_onboarding |
| `poll_votes` | User votes | poll_id, user_id, option_id |
| `poll_comments` | Discussion | poll_id, user_id, body |
| `communities` | Groups | id, slug, name, member_count |
| `community_members` | Membership | community_id, user_id, role |
| `community_messages` | Chat | community_id, user_id, body |
| `onboarding_state` | Progress | user_id, step, answered_poll_ids, selected_community_ids |
| `challenges` | Achievements | id, slug, target, reward_xp |
| `xp_ledger` | Scoring | user_id, delta, reason |
| `moderation_reports` | Reports | reporter_id, target_user_id, reason, status |
| `moderation_actions` | Admin actions | admin_id, target_user_id, action |

### Default Admin User

**Created by seed:**
```
username: admin
email: admin@theartofraw.me
role: admin
avatar_level: 8
```

⚠️ Set password in production via authentication flow

### Default Communities

Seed creates 3 founding communities:
- `general` - General Discussion
- `tech` - Tech & Innovation
- `life` - Life & Culture

## Testing Each Page

### Landing (`/`)
- ✅ ProblemSection renders
- ✅ Hero displays "Be authentically you"
- ✅ PollSection shows sample polls
- ✅ Footer with Terms/Privacy/Contact links
- ✅ Signup modal opens

### Onboarding
- ✅ Avatar selection (8 avatars)
- ✅ Poll voting (3 sample onboarding polls)
- ✅ Community selection (2+ required)
- ✅ Completion triggers home tab

### Dashboard (`/dashboard`)
- ✅ Home tab shows activity summary
- ✅ Polls tab shows daily vote limit
- ✅ Communities tab shows member count
- ✅ Challenges tab shows progress
- ✅ Daily Spin tab shows reward wheel
- ✅ Profile tab shows avatar level selector

### Admin (`/admin`)
- ✅ User moderation (warn/ban/unban)
- ✅ Community approval (approve/reject)
- ✅ Report management (resolve/dismiss)
- ✅ Audit log visible

### Utility Pages
- ✅ `/ask` - AI assistant (requires OPENAI_API_KEY)
- ✅ `/faq` - FAQ page
- ✅ `/security` - Security policy
- ✅ `/terms` - Terms of Service
- ✅ `/privacy` - Privacy Policy

## Clean Testing

### Reset Database Between Tests

```bash
# Local
./supabase/reset.sh

# This will:
# 1. Drop all tables
# 2. Re-run migrations
# 3. Seed admin user + defaults
```

### Expected State After Reset

- ✅ 3 founding communities created
- ✅ 8 avatar levels available
- ✅ 3 default challenges
- ✅ 1 admin user (no test data)
- ✅ All other tables empty

### Verify Clean State

```sql
-- Check row counts (should be minimal)
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'polls', COUNT(*) FROM polls
UNION ALL
SELECT 'communities', COUNT(*) FROM communities
UNION ALL
SELECT 'challenges', COUNT(*) FROM challenges;

-- Expected output:
-- users: 1 (admin only)
-- polls: 0
-- communities: 3
-- challenges: 3
```

## Development Workflow

1. **Reset DB:** `./supabase/reset.sh`
2. **Start local Supabase:** `supabase start`
3. **Start frontend:** `npm run dev`
4. **Test page:** Create account → onboard → dashboard
5. **Reset & repeat:** `./supabase/reset.sh`

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
OPENAI_API_KEY=sk_test_...  # For /ask page
```

## RLS Policies

Currently minimal RLS enabled for:
- `users` - public read, self-update
- `polls` - public read (active only)
- `moderation_reports` - authenticated insert

**TODO:** Expand per-table policies for:
- Private communities
- Message access control
- Admin-only operations

## Notes

- All tables use UUID primary keys with `gen_random_uuid()`
- All tables have `created_at` / `updated_at` timestamps
- Indexes created for common queries (see schema)
- On delete cascade for referential integrity
- No fake/test data after seed (clean state only)
