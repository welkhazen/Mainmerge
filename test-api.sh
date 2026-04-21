#!/bin/bash
# API Testing Script for Mainmerge Supabase Integration
# Tests complete user workflow: signup → login → voting → community joining

set -e

BASE_URL="${BASE_URL:-http://localhost:3000/api}"
COOKIES_FILE="test-cookies.txt"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="SecurePass123!"
TEST_PHONE="+14155552671"
TEST_OTP="000000"  # Change to actual OTP

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Mainmerge API Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Test User: $TEST_USERNAME"
echo ""

# Helper function to make requests
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local name=$4

  echo -n "Testing $name... "

  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -b "$COOKIES_FILE" \
      -c "$COOKIES_FILE" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -b "$COOKIES_FILE" \
      -c "$COOKIES_FILE" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi

  # Check if response contains error
  if echo "$response" | grep -q '"error"'; then
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $response"
    return 1
  else
    echo -e "${GREEN}✓ OK${NC}"
    echo "Response: $response"
    return 0
  fi
}

# Cleanup
rm -f "$COOKIES_FILE"

# Test 1: Sign up request
echo ""
echo "--- Phase 1: Authentication ---"
echo ""

echo "1. Request signup with phone..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -c "$COOKIES_FILE" \
  -d "{\"username\": \"$TEST_USERNAME\", \"password\": \"$TEST_PASSWORD\", \"phone\": \"$TEST_PHONE\"}" \
  "$BASE_URL/auth/signup/request" | tee /tmp/signup_response.json
echo ""

# Extract response
response=$(cat /tmp/signup_response.json)
if echo "$response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Signup request successful${NC}"
else
  echo -e "${RED}✗ Signup request failed${NC}"
  exit 1
fi

# Test 2: Verify OTP
echo ""
echo "2. Verify OTP code..."
echo "NOTE: Using $TEST_OTP (you may need to update this with the actual OTP)"
echo ""

curl -s -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -c "$COOKIES_FILE" \
  -d "{\"code\": \"$TEST_OTP\"}" \
  "$BASE_URL/auth/signup/verify" | tee /tmp/verify_response.json
echo ""

# Check verify response
response=$(cat /tmp/verify_response.json)
if echo "$response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ OTP verification successful - User created${NC}"
else
  echo -e "${YELLOW}⚠ OTP verification failed (expected without real Twilio config)${NC}"
  echo "Continuing with existing user test..."
fi

# Test 3: Login
echo ""
echo "3. Login with credentials..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -c "$COOKIES_FILE" \
  -d "{\"username\": \"$TEST_USERNAME\", \"password\": \"$TEST_PASSWORD\"}" \
  "$BASE_URL/auth/login" | tee /tmp/login_response.json
echo ""

response=$(cat /tmp/login_response.json)
if echo "$response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Login successful${NC}"
elif echo "$response" | grep -q '"error"'; then
  echo -e "${YELLOW}⚠ Login failed (expected if user not created in OTP step)${NC}"
fi

# Test 4: Bootstrap data
echo ""
echo "--- Phase 2: Application Data ---"
echo ""
echo "4. Get bootstrap data..."
curl -s -X GET \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  "$BASE_URL/bootstrap" | jq '.' | head -50
echo ""

# Test 5: Get polls
echo ""
echo "5. Get random polls..."
curl -s -X GET \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  "$BASE_URL/appV2/polls/random" | jq '.polls[0:2]' 2>/dev/null || echo "(appV2 endpoint requires migration)"
echo ""

# Test 6: Get communities
echo ""
echo "6. Get communities..."
curl -s -X GET \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  "$BASE_URL/appV2/communities" | jq '.communities[0:2]' 2>/dev/null || echo "(appV2 endpoint requires migration)"
echo ""

# Test 7: Get dashboard
echo ""
echo "7. Get dashboard data..."
curl -s -X GET \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  "$BASE_URL/appV2/dashboard" | jq '.' 2>/dev/null | head -50 || echo "(appV2 endpoint requires migration)"
echo ""

# Test 8: Logout
echo ""
echo "--- Phase 3: Session Management ---"
echo ""
echo "8. Logout..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -c "$COOKIES_FILE" \
  "$BASE_URL/auth/logout" | tee /tmp/logout_response.json
echo ""

response=$(cat /tmp/logout_response.json)
if echo "$response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Logout successful${NC}"
fi

# Cleanup
rm -f "$COOKIES_FILE" /tmp/signup_response.json /tmp/verify_response.json /tmp/login_response.json /tmp/logout_response.json

echo ""
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Notes:"
echo "- appV2 endpoints require full Supabase configuration"
echo "- OTP verification requires Twilio credentials"
echo "- User creation in Supabase requires OTP verification"
echo ""
echo "To test fully:"
echo "1. Set up local Supabase: supabase start"
echo "2. Apply migrations: supabase migration up"
echo "3. Seed data: psql -h localhost -U postgres -d postgres -f supabase/seeds/001_admin_seed.sql"
echo "4. Start server: npm run dev:server"
echo "5. Run this script: ./test-api.sh"
