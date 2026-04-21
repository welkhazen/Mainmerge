# Supabase Integration Setup & Testing

This document explains how to set up Supabase, run migrations, seed data, and test the API endpoints.

## Prerequisites

- Node.js 18+
- Supabase account (local or remote)
- A `.env.local` file with Supabase credentials

## Phase 1: Supabase Project Setup

### Local Development (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in the project
supabase init

# Start local Supabase (runs in Docker)
supabase start
```

This will:
- Start a local PostgreSQL database
- Start Supabase services
- Create credentials in `.env.local`

### Remote Development (Vercel)

1. Go to https://supabase.com/dashboard
2. Create new project with EU region
3. Get credentials from Settings → API
4. Add to `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## Phase 2: Apply Database Schema

### Local

```bash
# Check migrations
supabase migration list

# Run migrations
supabase migration up
```

### Remote

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Execute query

Verify in Table Editor - should show 21 tables:
- users, polls, poll_options, poll_votes, poll_comments
- communities, community_members, community_messages, community_requests
- onboarding_state, avatars, daily_spins, challenges, user_challenge_progress
- xp_ledger, moderation_reports, moderation_actions, admin_audit_log
- sessions, waitlist_signups, referrals, utm_touches, experiments

## Phase 3: Seed Initial Data

### Local

```bash
# Via psql
psql -h localhost -U postgres -d postgres -f supabase/seeds/001_admin_seed.sql
```

### Remote

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/seeds/001_admin_seed.sql`
3. Execute query

## Phase 4: Environment Variables

Create/update `.env` and `.env.local`:

```bash
# .env.local (Frontend)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

```bash
# .env (Backend)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## Phase 5: Start Services

```bash
# Terminal 1: Start backend
npm run dev:server

# Terminal 2: Start frontend
npm run dev

# Terminal 3 (optional): Monitor Supabase (local only)
supabase status
```

Backend will run on `http://localhost:3000`
Frontend will run on `http://localhost:5173`

## Testing API Endpoints

All endpoints require authentication via session cookie (except auth endpoints).

### 1. Sign Up with Phone

```bash
curl -X POST http://localhost:3000/api/auth/signup/request \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "Abc123!@",
    "phone": "+11234567890"
  }'

# Response:
# { "ok": true, "channels": ["sms"] }
```

### 2. Verify OTP

```bash
# Get the 6-digit code from Twilio SMS (or check Supabase Logs)
curl -X POST http://localhost:3000/api/auth/signup/verify \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt \
  -d '{"code": "123456"}'

# Response:
# { "ok": true }
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "Abc123!@"
  }'

# Response:
# { "ok": true }
```

### 4. Get Bootstrap Data

```bash
curl -X GET http://localhost:3000/api/bootstrap \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Response:
# {
#   "user": {
#     "id": "uuid",
#     "username": "testuser",
#     "avatarLevel": 1,
#     "role": "user",
#     "status": "active"
#   },
#   "isLoggedIn": true,
#   "polls": [...],
#   "votedPollIds": [],
#   "freeVotesUsed": 0
# }
```

### 5. List Polls

```bash
curl -X GET http://localhost:3000/api/appV2/polls/random \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Response:
# {
#   "polls": [
#     {
#       "id": "poll-uuid",
#       "question": "Do you believe...",
#       "options": [
#         { "id": "opt-uuid", "text": "Yes", "votes": 5 },
#         { "id": "opt-uuid", "text": "No", "votes": 3 }
#       ]
#     }
#   ]
# }
```

### 6. Vote on Poll

```bash
# Get poll ID from previous response
curl -X POST http://localhost:3000/api/appV2/polls/POLL_ID/vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"optionId": "OPTION_ID"}'

# Response:
# { "ok": true, "voteId": "vote-uuid" }
```

### 7. Get Communities

```bash
curl -X GET http://localhost:3000/api/appV2/communities \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Response:
# {
#   "communities": [
#     {
#       "id": "community-uuid",
#       "slug": "general",
#       "name": "General Discussion",
#       "members": 42,
#       "isMember": false
#     }
#   ]
# }
```

### 8. Join Community

```bash
curl -X POST http://localhost:3000/api/appV2/communities/COMMUNITY_ID/join \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Response:
# { "ok": true }
```

### 9. Get Dashboard

```bash
curl -X GET http://localhost:3000/api/appV2/dashboard \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Response:
# {
#   "profile": { "id": "...", "username": "testuser", "avatarLevel": 1 },
#   "communities": [...],
#   "polls": [...],
#   "xp": 10,
#   "level": 1
# }
```

## Testing Checklist

- [ ] Sign up with phone number
- [ ] Receive OTP via Twilio
- [ ] Verify OTP code
- [ ] Login with username/password
- [ ] View available polls
- [ ] Vote on poll (XP +10)
- [ ] Join community (XP +5)
- [ ] View dashboard with activity
- [ ] Check avatar level updates
- [ ] Verify data persists in Supabase

## Database Verification

Check data in Supabase:

```bash
# Via Supabase Dashboard → SQL Editor

-- Check created user
SELECT id, username, avatar_level, status FROM users WHERE username = 'testuser';

-- Check poll votes
SELECT poll_id, user_id, voted_at FROM poll_votes WHERE poll_id = 'POLL_ID';

-- Check XP ledger
SELECT user_id, delta, reason, created_at FROM xp_ledger WHERE user_id = 'USER_ID';

-- Check community membership
SELECT * FROM community_members WHERE user_id = 'USER_ID';
```

## Resetting Test Data

```bash
# Local only
./supabase/reset.sh

# This will:
# 1. Drop all tables
# 2. Reapply migrations
# 3. Seed admin user
# 4. Clear all test data
```

## Troubleshooting

### "SUPABASE_URL not found"

Check `.env` file is loaded:
```bash
echo $SUPABASE_URL
```

### OTP not received

1. Check Twilio credentials in `.env`
2. Check Supabase logs: Dashboard → Logs
3. Verify phone number format: +COUNTRY_CODE_PHONE

### Session not persisting

Check cookie settings:
```bash
# Add -v flag to see response headers
curl -v -X POST http://localhost:3000/api/auth/login ... -c cookies.txt
```

### Type errors in TypeScript

```bash
# Rebuild types
npm run build
```

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)           │
│   Uses VITE_SUPABASE_* keys (anon)          │
└────────────────────┬────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────┐
│        Backend (Express + Node.js)          │
│ Uses SUPABASE_* keys (service_role)         │
│ ┌─────────────────────────────────────────┐ │
│ │ Routes (auth, appV2, polls, etc.)       │ │
│ │ ↓                                       │ │
│ │ Services (AppService, etc.)             │ │
│ │ ↓                                       │ │
│ │ Repositories (new SDK-based)            │ │
│ │ - userRepository.ts                     │ │
│ │ - pollRepository.ts                     │ │
│ │ - communityRepository.ts                │ │
│ │ - xpRepository.ts                       │ │
│ │ - moderationRepository.ts               │ │
│ │ ↓                                       │ │
│ │ Supabase SDK client (supabase.ts)       │ │
│ └─────────────────────────────────────────┘ │
└────────────────────┬────────────────────────┘
                     │ Network
                     ▼
┌─────────────────────────────────────────────┐
│     Supabase (PostgreSQL + REST API)        │
│  ┌─────────────────────────────────────────┐│
│  │ 21 tables + indexes + RLS policies      ││
│  │ - Auth: users, sessions                 ││
│  │ - Polls: polls, poll_options, votes     ││
│  │ - Community: communities, members       ││
│  │ - Gamification: xp_ledger, challenges  ││
│  │ - Moderation: reports, actions, audit  ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Next Steps

1. **Implement onboarding flow** - avatar selection → poll voting → community selection
2. **Add challenge tracking** - track user progress towards challenges
3. **Implement daily spin** - gamification wheel reward system
4. **Add moderation UI** - admin dashboard for reports/bans
5. **Deploy to Vercel** - production Supabase + environment variables
