#!/bin/bash

# ============================================================
# Test SEO Data Collection System
# ============================================================
# Tests the crawler, data collection, and database storage
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

API_URL="${API_BASE_URL:-http://localhost:3001}"
TEST_ADDRESS="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    SEO Data Collection System Tests                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name=$1
    local test_command=$2

    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${YELLOW}[TEST $TESTS_RUN] ${test_name}${NC}"

    if eval "$test_command" > /tmp/test_output.log 2>&1; then
        echo -e "${GREEN}  ✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}  ✗ FAILED${NC}"
        echo -e "${RED}  Output: $(cat /tmp/test_output.log)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test 1: API Health Check
echo -e "${BLUE}[1] Testing API Health...${NC}"
run_test "API Health Endpoint" "curl -sf $API_URL/health"
echo ""

# Test 2: Database Connection
echo -e "${BLUE}[2] Testing Database Connection...${NC}"
run_test "Database Connection" "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT 1'"
echo ""

# Test 3: SEO Data Contribution
echo -e "${BLUE}[3] Testing SEO Data Contribution API...${NC}"

# Create test contribution
CONTRIB_RESPONSE=$(curl -s -X POST $API_URL/api/seo/training/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "keyword": "test keyword",
    "contributorAddress": "'$TEST_ADDRESS'"
  }')

echo "Response: $CONTRIB_RESPONSE"

if echo "$CONTRIB_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ Data contribution successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Data contribution failed${NC}"
    echo -e "${RED}  Response: $CONTRIB_RESPONSE${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 4: Training Data Stats
echo -e "${BLUE}[4] Testing Training Data Stats API...${NC}"

STATS_RESPONSE=$(curl -s $API_URL/api/seo/training/stats)
echo "Response: $STATS_RESPONSE"

if echo "$STATS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ Stats retrieval successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Parse stats
    TOTAL_CONTRIB=$(echo "$STATS_RESPONSE" | jq -r '.stats.totalContributions')
    echo -e "  Total Contributions: $TOTAL_CONTRIB"
else
    echo -e "${RED}  ✗ Stats retrieval failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 5: User Contributions
echo -e "${BLUE}[5] Testing User Contributions API...${NC}"

USER_CONTRIB=$(curl -s $API_URL/api/seo/training/contributions/$TEST_ADDRESS)
echo "Response: $USER_CONTRIB"

if echo "$USER_CONTRIB" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ User contributions retrieval successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ User contributions retrieval failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 6: Database Storage Verification
echo -e "${BLUE}[6] Testing Database Storage...${NC}"

DB_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT COUNT(*) FROM seo_features.training_contributions" 2>/dev/null | tr -d ' ')

if [ ! -z "$DB_COUNT" ] && [ "$DB_COUNT" -ge 1 ]; then
    echo -e "${GREEN}  ✓ Data stored in database ($DB_COUNT records)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ No data found in database${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 7: Feature Extraction
echo -e "${BLUE}[7] Testing Feature Extraction...${NC}"

LAST_CONTRIB=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT features_provided FROM seo_features.training_contributions ORDER BY id DESC LIMIT 1" 2>/dev/null)

if echo "$LAST_CONTRIB" | grep -q 'onPage'; then
    echo -e "${GREEN}  ✓ Features properly extracted and stored${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Count features
    FEATURE_COUNT=$(echo "$LAST_CONTRIB" | jq '. | keys | length' 2>/dev/null || echo "0")
    echo -e "  Features extracted: $FEATURE_COUNT"
else
    echo -e "${RED}  ✗ Feature extraction failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 8: Quality Score Calculation
echo -e "${BLUE}[8] Testing Quality Score Calculation...${NC}"

QUALITY_SCORE=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT quality_score FROM seo_features.training_contributions ORDER BY id DESC LIMIT 1" 2>/dev/null | tr -d ' ')

if [ ! -z "$QUALITY_SCORE" ] && [ "$QUALITY_SCORE" -ge 0 ] && [ "$QUALITY_SCORE" -le 100 ]; then
    echo -e "${GREEN}  ✓ Quality score calculated ($QUALITY_SCORE/100)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Quality score calculation failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 9: Data Hash Generation
echo -e "${BLUE}[9] Testing Data Hash Generation...${NC}"

DATA_HASH=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -t -c "SELECT data_hash FROM seo_features.training_contributions ORDER BY id DESC LIMIT 1" 2>/dev/null | tr -d ' ')

if [ ! -z "$DATA_HASH" ] && [ ${#DATA_HASH} -eq 66 ]; then
    echo -e "${GREEN}  ✓ Data hash generated ($DATA_HASH)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Data hash generation failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 10: Leaderboard
echo -e "${BLUE}[10] Testing Leaderboard API...${NC}"

LEADERBOARD=$(curl -s $API_URL/api/seo/training/leaderboard?limit=5)

if echo "$LEADERBOARD" | grep -q '"success":true'; then
    echo -e "${GREEN}  ✓ Leaderboard retrieval successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Leaderboard retrieval failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Test Summary                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Data collection system is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
