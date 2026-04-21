# Quick Start: Test Mainmerge Supabase Backend

This guide walks you through setting up Supabase and testing the backend **in 5 minutes**.

## Option 1: Cloud Supabase (Easiest ⭐ RECOMMENDED)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Sign Up" or "Get Started"
3. Sign in with GitHub or email
4. Create new project:
   - Name: `mainmerge`
   - Region: `Europe (Ireland)` (or closest to you)
   - Password: Generate strong password

### Step 2: Get Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Step 3: Create .env Files

Create `.env.local` (frontend):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Create `.env` (backend):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Step 4: Run Migrations

In Supabase Dashboard, go to **SQL Editor** and:

1. Click **New Query**
2. Copy entire contents of: `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Execute**
4. Verify 21 tables created (check **Table Editor**)

### Step 5: Seed Data

In Supabase Dashboard SQL Editor:

1. Click **New Query**
2. Copy entire contents of: `supabase/seeds/001_admin_seed.sql`
3. Paste and click **Execute**
4. Verify admin user, avatars, communities created

### Step 6: Test Backend

Terminal 1 - Start server:
```bash
npm run dev:server
```

Should print:
```
✓ Supabase configured
✓ Server running on port 3000
```

Terminal 2 - Run tests:
```bash
./test-api.sh
```

Expected output:
```
✅ Signup request successful
✅ OTP verification successful - User created
✅ Login successful
✅ Bootstrap data loaded
✅ Logout successful
```

---

## Option 2: Local Setup (Advanced)

Requires: Supabase CLI, Docker, PostgreSQL

```bash
# Install Supabase CLI (macOS/Linux)
brew install supabase/tap/supabase
# or from: https://github.com/supabase/cli#install-the-cli

# Initialize
supabase init

# Start local Supabase
supabase start

# Create .env.local from output
# (Supabase prints credentials when started)

# Run migrations
supabase migration up

# Seed data
psql -h localhost -U postgres -d postgres -f supabase/seeds/001_admin_seed.sql

# Start server
npm run dev:server

# Test
./test-api.sh
```

---

## Verification Checklist

After starting the server, verify:

### ✓ Server Health
```bash
curl http://localhost:3000/api/bootstrap
```
Should return JSON with polls and communities.

### ✓ User Creation
In Supabase Dashboard → **Table Editor** → **users** table
- Should have at least 1 row for admin user

### ✓ Database Schema
In Supabase Dashboard → **Table Editor**
Verify these 21 tables exist:
- `users`, `sessions`, `onboarding_state`
- `polls`, `poll_options`, `poll_votes`, `poll_comments`
- `communities`, `community_members`, `community_messages`, `community_requests`
- `avatars`, `challenges`, `user_challenge_progress`, `xp_ledger`, `daily_spins`
- `moderation_reports`, `moderation_actions`, `admin_audit_log`
- `referrals`, `utm_touches`, `waitlist_signups`, `experiments`, `experiment_assignments`

---

## Testing Workflow

### 1. Signup Test
```bash
curl -X POST http://localhost:3000/api/auth/signup/request \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!",
    "phone": "+14155552671"
  }'
```

Response:
```json
{ "ok": true, "channels": ["sms"] }
```

Check in Supabase → **Log** for Twilio SMS or use test OTP: `000000`

### 2. Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/signup/verify \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt \
  -d '{"code": "000000"}'
```

Response:
```json
{ "ok": true }
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{ "ok": true }
```

### 4. Check Supabase
In Supabase Dashboard → **Table Editor** → **users** table:
- New row with `username: testuser` created ✓
- `avatar_level: 1` ✓
- `role: user` ✓
- `status: active` ✓

---

## Troubleshooting

### "SUPABASE_URL not configured"
Make sure `.env` or `.env.local` has:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### "Connection refused" on localhost:3000
Make sure server is running:
```bash
npm run dev:server
```

### OTP not being sent
Without Twilio credentials in `.env`, OTP verification will fail.
Use test OTP: `000000` or mock Twilio.

### Migrations failed
1. Check Supabase **SQL Editor** for errors
2. Look for "Error creating table..." messages
3. Fix the migration and retry

### Can't find table
Migrations may not have executed. In Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return 21 tables.

---

## Architecture

```
┌─────────────────────────────────┐
│   Your Machine                  │
│                                 │
│  Frontend (npm run dev)         │
│  Port 5173 (http://localhost)   │
│        ↓                        │
│  Backend (npm run dev:server)   │
│  Port 3000 (http://localhost)   │
│        ↓                        │
│  .env / .env.local (Supabase    │
│  credentials)                   │
└────────────────┬────────────────┘
                 │
                 ↓
         ☁️ INTERNET
                 ↓
┌─────────────────────────────────┐
│   Supabase Cloud (supabase.co)  │
│                                 │
│   PostgreSQL Database           │
│   • 21 tables                   │
│   • RLS policies                │
│   • Real-time subscriptions     │
│   • Auth system                 │
│                                 │
│   Free tier: 500MB storage      │
│   Always free: 2 databases      │
└─────────────────────────────────┘
```

---

## Next Steps

After testing works:

1. **Test complete flow:**
   - Sign up → Verify → Login → View dashboard

2. **Test polls:**
   - Create poll (admin only)
   - Vote on poll
   - Check XP awarded

3. **Test communities:**
   - List communities
   - Join community
   - Check member count

4. **Test challenges:**
   - Complete challenge (20 votes)
   - Verify XP reward given

5. **Test admin:**
   - Create moderation report
   - Resolve report
   - Ban user

---

## Support

- **Setup issues?** Check SUPABASE_SETUP.md
- **API issues?** Run ./test-api.sh
- **Database issues?** Check Supabase SQL Editor logs
- **Code issues?** Run `npm run build` to check types
