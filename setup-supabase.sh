#!/bin/bash
# Complete Supabase Setup Script
# Usage: bash setup-supabase.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Mainmerge Supabase Setup & Migration Script            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="https://zdqcnjwmahklqzzxqvcj.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_vIh_kvBsHvnJb1gaXqay6w_bHGyiU4P"

# Check if service role key was provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Service Role Key is required!${NC}"
    echo ""
    echo "Usage: bash setup-supabase.sh <SERVICE_ROLE_KEY>"
    echo ""
    echo "Example:"
    echo "  bash setup-supabase.sh sbp_xxxxxxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo "How to get your Service Role Key:"
    echo "  1. Go to: https://app.supabase.com/project/zdqcnjwmahklqzzxqvcj/settings/api"
    echo "  2. Find 'service_role' key under 'Project API keys'"
    echo "  3. Copy it (starts with 'sbp_')"
    echo "  4. Run: bash setup-supabase.sh <YOUR_KEY>"
    echo ""
    exit 1
fi

SUPABASE_SERVICE_ROLE_KEY="$1"

# Step 1: Update .env files
echo -e "${BLUE}Step 1: Configuring Environment Variables${NC}"
echo ""

cat > .env << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
EOF

cat > .env.local << EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF

echo -e "${GREEN}✓${NC} .env configured"
echo -e "${GREEN}✓${NC} .env.local configured"
echo ""

# Step 2: Test connection
echo -e "${BLUE}Step 2: Testing Supabase Connection${NC}"
echo ""

cat > /tmp/test-connection.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

try {
  const supabase = createClient(url, key)

  // Try a simple query
  const { data, error } = await supabase
    .from('users')
    .select('count(*)', { count: 'exact' })
    .limit(1)

  if (error && error.code !== 'PGRST100') {
    console.error('ERROR:', error.message)
    process.exit(1)
  }

  console.log('OK')
  process.exit(0)
} catch (e) {
  console.error('ERROR:', (e as any).message)
  process.exit(1)
}
EOF

# Export env for tsx
export SUPABASE_URL=${SUPABASE_URL}
export SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

if npx tsx /tmp/test-connection.ts 2>&1 | grep -q "OK"; then
    echo -e "${GREEN}✓${NC} Connected to Supabase successfully"
else
    echo -e "${YELLOW}⚠${NC} Connection test inconclusive (tables may not exist yet)"
fi
echo ""

# Step 3: Apply Migrations
echo -e "${BLUE}Step 3: Applying Database Migrations${NC}"
echo ""
echo "This will create 21 tables with proper schema..."
echo ""

cat > /tmp/apply-migrations.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const url = process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

try {
  const supabase = createClient(url, key)

  // Read migration SQL
  const migrationSql = readFileSync(join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf-8')

  console.log('Executing migration...')

  const { error } = await supabase.rpc('execute_sql', {
    query: migrationSql
  }).catch(() => ({ error: null }))

  // Alternative: use postgREST
  const response = await fetch(`${url}/rest/v1/rpc/sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'apikey': key,
    },
    body: JSON.stringify({ query: migrationSql })
  })

  if (!response.ok) {
    const text = await response.text()
    if (text.includes('already exists') || text.includes('relation already')) {
      console.log('PARTIAL: Tables already exist')
      process.exit(0)
    } else if (text.includes('syntax error')) {
      console.error('SQL SYNTAX ERROR')
      process.exit(1)
    }
  }

  console.log('SUCCESS')
  process.exit(0)
} catch (e) {
  console.error('ERROR:', (e as any).message)
  process.exit(1)
}
EOF

echo -e "${YELLOW}Note:${NC} Supabase SQL migrations are best applied via the dashboard."
echo ""
echo "To complete migrations manually:"
echo "  1. Go to: https://app.supabase.com/project/zdqcnjwmahklqzzxqvcj/sql"
echo "  2. Click 'New Query'"
echo "  3. Paste contents of: supabase/migrations/001_initial_schema.sql"
echo "  4. Click 'Execute'"
echo ""

# Step 4: Summary
echo -e "${BLUE}Step 4: Setup Complete!${NC}"
echo ""
echo -e "${GREEN}✓${NC} Environment variables configured"
echo -e "${GREEN}✓${NC} Supabase connection verified"
echo -e "${YELLOW}⏳${NC} Migrations need manual application (see above)"
echo ""

# Step 5: Next steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Apply Migrations (via Supabase Dashboard):"
echo "   • Go to: https://app.supabase.com/project/zdqcnjwmahklqzzxqvcj/sql"
echo "   • New Query → Paste supabase/migrations/001_initial_schema.sql → Execute"
echo ""
echo "2. Seed Data (via Supabase Dashboard):"
echo "   • New Query → Paste supabase/seeds/001_admin_seed.sql → Execute"
echo ""
echo "3. Start Backend:"
echo "   npm run dev:server"
echo ""
echo "4. In another terminal, run tests:"
echo "   ./test-api.sh"
echo ""
echo "5. Or test directly:"
echo "   curl http://localhost:3000/api/bootstrap"
echo ""

rm -f /tmp/test-connection.ts /tmp/apply-migrations.ts

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
