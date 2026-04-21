#!/bin/bash
# Reset Supabase database for clean testing
# Usage: ./supabase/reset.sh

set -e

echo "🔄 Resetting Supabase database..."

# Drop all tables and start fresh
supabase db reset

echo "✅ Database reset complete"
echo ""
echo "Next steps:"
echo "  1. Run migrations: supabase migration list"
echo "  2. Seed admin: psql -h localhost -U postgres -d postgres -f supabase/seeds/001_admin_seed.sql"
echo "  3. Start frontend: npm run dev"
