# Get Your Supabase Service Role Key

Your Supabase instance is running and reachable! Now we need the **Service Role Key** to apply migrations and test the backend.

## 📍 Where to Find It

### Option 1: Web Dashboard (Easiest)

1. Go to: https://app.supabase.com/project/zdqcnjwmahklqzzxqvcj/settings/api

2. Under **Project API keys** section, find:
   - **`service_role` (SECRET)** - This is what we need
   - It starts with: `sbp_` or similar
   - ⚠️ **KEEP THIS SECRET** - Never commit to git!

3. Copy the entire key

### Option 2: Via Supabase CLI

```bash
supabase projects api-keys --project-id zdqcnjwmahklqzzxqvcj
```

## 🔧 What to Do Once You Have It

Once you have the service role key, update `.env`:

```bash
# Replace PLACEHOLDER with the actual key
export SUPABASE_SERVICE_ROLE_KEY=sbp_xxxxxxxxxxxxxxxxxxxx
```

Or edit `.env` file directly:

```env
SUPABASE_URL=https://zdqcnjwmahklqzzxqvcj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_xxxxxxxxxxxxxxxxxxxx
```

## ✅ Then We'll:

1. ✓ Apply database schema (21 tables)
2. ✓ Seed admin user + data
3. ✓ Start backend server
4. ✓ Run complete API tests
5. ✓ Verify everything works end-to-end

## 🔒 Security Note

- Service role key = **ADMIN access** (never expose)
- Anon key = **Limited access** (safe for frontend)
- Never commit keys to git (already in .gitignore)

---

**Ready?** Paste your service role key here and we'll complete the setup!
