# Supabase Implementation Status

## Overview

This document tracks the implementation progress of the full Supabase backend integration for Mainmerge, covering database persistence, user authentication, polling system, communities, gamification, and moderation.

## Completed ✅

### Phase 1: Database Schema & Migrations
- [x] 21-table PostgreSQL schema created (migrations/001_initial_schema.sql)
- [x] Foreign key constraints and cascading deletes configured
- [x] Indexes created for common queries
- [x] Row-Level Security (RLS) policies established
- [x] Seed data for admin user, avatars, challenges, communities (seeds/001_admin_seed.sql)
- [x] Database reset script (supabase/reset.sh)

### Phase 2: Supabase SDK Integration
- [x] Supabase JS client initialized (server/lib/supabase.ts)
- [x] Service role key authentication configured
- [x] Fallback to in-memory when Supabase unavailable
- [x] @supabase/supabase-js package installed

### Phase 3: Repository Layer (Type-Safe Data Access)
- [x] **userRepository.ts**: Refactored to use Supabase SDK
  - User CRUD operations (create, read, update, delete)
  - Username/email lookup
  - Password hashing with bcrypt
  - Referral code management
  - Fallback to in-memory MemoryUserRepository
  - Automatic onboarding_state creation on signup

- [x] **pollRepository.ts**: Poll operations
  - Poll creation with options
  - Poll voting with duplicate check
  - Vote history tracking
  - Comment management
  - Onboarding polls vs regular polls

- [x] **communityRepository.ts**: Community operations
  - Community CRUD (create, read, list)
  - Membership management (join, leave)
  - Community-specific messaging
  - Member enumeration

- [x] **xpRepository.ts**: Gamification
  - XP ledger entries
  - Avatar level calculation (8 levels)
  - Challenge tracking
  - Daily spin rewards
  - Total XP aggregation

- [x] **moderationRepository.ts**: Admin & safety
  - Report creation and management
  - User warnings, bans, unbans
  - Moderation action logging
  - Audit trail for admin actions

### Phase 4: Type System Updates
- [x] UserRecord extended with: avatarLevel, role, status, email, stytchUserId
- [x] New repository type definitions created for all entities
- [x] PollWithOptions, Community, XPEntry, etc. types defined
- [x] Type safety across data access layer

### Phase 5: Documentation & Testing
- [x] SUPABASE_SETUP.md: Complete setup guide (local + remote)
- [x] test-api.sh: Automated API testing script
- [x] Architecture diagrams and troubleshooting guide
- [x] Database verification queries

## In Progress 🔄

### Phase 6: Route Handlers & Controllers
- [ ] auth.ts: Verify signup/login works with new userRepository
  - Currently compatible, needs testing
  - Phone-based signup flow intact
  - Referral activation functional

- [ ] appV2.ts: Update to use new repositories
  - Currently uses old repositories (PollsRepository, CommunitiesRepository)
  - Needs refactoring to use new SDK-based repos

- [ ] Other routes (polls.ts, users.ts, cron.ts)

## Pending ⏳

### Phase 7: Integration & Testing
- [ ] Manual testing of complete workflows
- [ ] Integration tests with real Supabase instance
- [ ] Performance testing (latency, concurrent users)
- [ ] Error handling edge cases
- [ ] Session persistence verification

### Phase 8: Frontend Integration
- [ ] Update React components to use new API responses
- [ ] Onboarding flow (avatar → polls → communities)
- [ ] Dashboard updates (activity, XP, challenges)
- [ ] Admin interface for moderation
- [ ] Notification system for moderator actions

### Phase 9: Production Deployment
- [ ] Environment variable configuration (Vercel)
- [ ] Production Supabase project setup
- [ ] RLS policy security review
- [ ] Data backup/recovery procedures
- [ ] Monitoring & alerting setup

### Phase 10: Advanced Features
- [ ] Daily spin animation & UX
- [ ] Challenge progression tracking UI
- [ ] Moderation dashboard
- [ ] Analytics dashboards
- [ ] Email notifications

## Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vite)             │
│     Uses anon key for subset of data       │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│      Backend (Express/Node + Supabase)      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Routes (auth, appV2, polls, etc.)   │   │
│  └────────────────┬────────────────────┘   │
│                   ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │ Services & Controllers              │   │
│  │ (AppService, AppController, etc.)   │   │
│  └────────────────┬────────────────────┘   │
│                   ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │ Repositories (Type-Safe Access)    │   │
│  │ • userRepository.ts                 │   │
│  │ • pollRepository.ts                 │   │
│  │ • communityRepository.ts            │   │
│  │ • xpRepository.ts                   │   │
│  │ • moderationRepository.ts           │   │
│  └────────────────┬────────────────────┘   │
│                   ▼                        │
│  ┌─────────────────────────────────────┐   │
│  │ Supabase SDK Client (service role) │   │
│  │ server/lib/supabase.ts              │   │
│  └────────────────┬────────────────────┘   │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│    Supabase Cloud/Local                     │
│  ┌─────────────────────────────────────┐   │
│  │ PostgreSQL Database                 │   │
│  │ • 21 tables with indexes            │   │
│  │ • RLS policies                      │   │
│  │ • Cascading deletes                 │   │
│  │ • Full-text search ready            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Auth System                         │   │
│  │ • Email/password (bcrypt)           │   │
│  │ • Phone OTP (Twilio)                │   │
│  │ • Session management                │   │
│  │ • JWT/RLS integration               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. SDK-Based Approach
- Using @supabase/supabase-js SDK instead of REST API
- More type-safe, better error handling
- Automatic retry logic for transient failures

### 2. Repository Pattern
- Data access layer isolated from business logic
- Easy to mock for testing
- Fallback to in-memory implementation for development

### 3. Schema Design
- UUID primary keys for distributed systems
- Denormalized member_count for performance
- Cascading deletes for referential integrity
- RLS for security (can be expanded)

### 4. Backward Compatibility
- Old in-memory implementation still available
- Graceful fallback when Supabase unavailable
- No breaking changes to public API

## Database Schema Tables

| Category | Tables |
|----------|--------|
| **Auth/Users** | users, sessions, stytch_users (optional) |
| **Polls** | polls, poll_options, poll_votes, poll_comments |
| **Communities** | communities, community_members, community_messages, community_requests |
| **Gamification** | avatars, daily_spins, challenges, user_challenge_progress, xp_ledger |
| **Moderation** | moderation_reports, moderation_actions, admin_audit_log |
| **Analytics** | utm_touches, waitlist_signups, referrals, experiments, experiment_assignments |

## Configuration Required

### Environment Variables

**Frontend (.env.local)**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Backend (.env)**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_SCHEMA=public
SUPABASE_USERS_TABLE=users
```

## Testing

### Unit Testing
- Repository layer tests with mocked Supabase
- Type safety validation

### Integration Testing
- Test against local Supabase instance
- Verify data persistence
- Check RLS policies

### Manual Testing
```bash
./test-api.sh
```

## Files Modified/Created

### Created
- `server/lib/supabase.ts` - Supabase SDK client
- `server/mvc/repositories/pollRepository.ts`
- `server/mvc/repositories/communityRepository.ts`
- `server/mvc/repositories/xpRepository.ts`
- `server/mvc/repositories/moderationRepository.ts`
- `SUPABASE_SETUP.md` - Setup guide
- `test-api.sh` - API testing script
- `supabase/migrations/001_initial_schema.sql`
- `supabase/seeds/001_admin_seed.sql`
- `supabase/reset.sh`
- `supabase/README.md`

### Modified
- `server/lib/userRepository.ts` - Refactored to use SDK
- `server/lib/store.ts` - Updated createUser signature
- `server/types.ts` - Extended UserRecord type
- `package.json` - Added @supabase/supabase-js

## Next Immediate Steps

1. **Test Current Implementation**
   - Start local Supabase: `supabase start`
   - Apply migrations: `supabase migration up`
   - Seed data: `psql ... -f supabase/seeds/001_admin_seed.sql`
   - Run server: `npm run dev:server`
   - Test API: `./test-api.sh`

2. **Fix appV2 Router**
   - Refactor to use new repositories
   - Test dashboard endpoint
   - Verify poll voting flow

3. **Add Integration Tests**
   - Test user signup flow
   - Test poll voting
   - Test community joining
   - Test XP calculations

4. **Onboarding Flow**
   - Implement avatar selection
   - Implement poll voting (3 required)
   - Implement community selection (2+ required)
   - Track in onboarding_state table

5. **Frontend Integration**
   - Update dashboard to show XP/avatar level
   - Add challenge progress display
   - Implement daily spin UI
   - Add moderation reports to admin panel

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Supabase downtime | In-memory fallback available |
| Data loss | Automated backups in Supabase Cloud |
| RLS misconfiguration | Policies can be reviewed before prod |
| Type errors | Full TypeScript typing throughout |
| Performance issues | Indexes on all foreign keys + common queries |

## Success Criteria

- [x] Database schema created (21 tables)
- [x] Seed data populated
- [x] Repository layer implemented (5 repos)
- [x] Type system extended
- [x] Documentation complete
- [ ] Test script passes
- [ ] appV2 routes working
- [ ] Signup → login → voting flow end-to-end
- [ ] Dashboard showing activity
- [ ] Admin moderation interface

## Support

For setup help, see: `SUPABASE_SETUP.md`
For API testing, run: `./test-api.sh`
For architecture questions, see: Architecture Overview above
