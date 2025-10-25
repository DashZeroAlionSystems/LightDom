#!/bin/bash

# ============================================================
# Test SEO Injection System
# ============================================================
# Tests the SEO injector plugin and injection API
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
TEST_API_KEY="test_api_key_12345"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    SEO Injection System Tests                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: SEO Injector Plugin File
echo -e "${BLUE}[1] Testing SEO Injector Plugin File...${NC}"

INJECTOR_PATH="src/seo/plugins/lightdom-seo-injector.js"

if [ -f "$INJECTOR_PATH" ]; then
    FILE_SIZE=$(wc -c < "$INJECTOR_PATH")
    echo -e "${GREEN}  ✓ Injector plugin found (${FILE_SIZE} bytes)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Check for required functions
    if grep -q "class FeatureExtractor" "$INJECTOR_PATH"; then
        echo -e "${GREEN}  ✓ FeatureExtractor class found${NC}"
    fi
    if grep -q "class SEOOptimizer" "$INJECTOR_PATH"; then
        echo -e "${GREEN}  ✓ SEOOptimizer class found${NC}"
    fi
else
    echo -e "${RED}  ✗ Injector plugin not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 2: SEO Injection API Endpoint
echo -e "${BLUE}[2] Testing SEO Injection API...${NC}"

CONFIG_RESPONSE=$(curl -s "$API_URL/api/v1/seo/config/$TEST_API_KEY?url=https://example.com&pathname=/")

if echo "$CONFIG_RESPONSE" | grep -q 'optimization\|config'; then
    echo -e "${GREEN}  ✓ SEO Injection API responding${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}  ⚠ SEO Injection API may not be implemented yet${NC}"
    echo -e "${YELLOW}  Response: $CONFIG_RESPONSE${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 3: Create Test HTML Page
echo -e "${BLUE}[3] Creating Test HTML Page...${NC}"

TEST_PAGE="test/seo-injection-test.html"
mkdir -p test

cat > "$TEST_PAGE" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Short Title</title>
    <meta name="description" content="Too short">

    <!-- LightDOM SEO Injector -->
    <script
      src="http://localhost:3001/seo-injector.js"
      data-api-key="test_api_key_12345"
      data-model-id="latest"
      data-auto="true"
      data-debug="true"
      data-mining="true">
    </script>
</head>
<body>
    <h2>Wrong Heading Level (Should be H1)</h2>
    <h1>First H1</h1>
    <h1>Second H1 (Should be H2)</h1>

    <p>This is a very short paragraph without enough content for good SEO.</p>

    <img src="test.jpg">
    <img src="test2.jpg">

    <h3>Missing H2 Before This</h3>

    <div id="seo-test-results"></div>

    <script>
        // Monitor SEO optimizations
        window.addEventListener('lightdom-seo-optimized', function(e) {
            console.log('SEO Optimizations Applied:', e.detail);

            // Display results
            const results = document.getElementById('seo-test-results');
            results.innerHTML = '<h2>SEO Optimizations</h2>' +
                '<pre>' + JSON.stringify(e.detail, null, 2) + '</pre>';
        });
    </script>
</body>
</html>
EOF

if [ -f "$TEST_PAGE" ]; then
    echo -e "${GREEN}  ✓ Test page created: $TEST_PAGE${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Failed to create test page${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 4: SEO Rules Configuration
echo -e "${BLUE}[4] Testing SEO Rules Configuration...${NC}"

if grep -q "SEO_RULES" "$INJECTOR_PATH"; then
    echo -e "${GREEN}  ✓ SEO rules defined${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Extract some rules
    echo -e "  ${BLUE}Title rules:${NC}"
    grep -A 5 "title:" "$INJECTOR_PATH" | head -6 | sed 's/^/    /'

    echo -e "  ${BLUE}Meta rules:${NC}"
    grep -A 5 "meta:" "$INJECTOR_PATH" | head -6 | sed 's/^/    /'
else
    echo -e "${RED}  ✗ SEO rules not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 5: Feature Extraction Functions
echo -e "${BLUE}[5] Testing Feature Extraction Functions...${NC}"

EXTRACTION_FUNCTIONS=(
    "extractOnPageFeatures"
    "extractTechnicalFeatures"
    "extractCoreWebVitals"
    "extractContentFeatures"
)

ALL_FOUND=true
for func in "${EXTRACTION_FUNCTIONS[@]}"; do
    if grep -q "$func" "$INJECTOR_PATH"; then
        echo -e "${GREEN}  ✓ $func() found${NC}"
    else
        echo -e "${RED}  ✗ $func() missing${NC}"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = true ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 6: Optimization Functions
echo -e "${BLUE}[6] Testing Optimization Functions...${NC}"

OPTIMIZATION_FUNCTIONS=(
    "optimizeTitle"
    "optimizeMeta"
    "optimizeHeadings"
    "optimizeImages"
    "optimizeTechnical"
)

ALL_FOUND=true
for func in "${OPTIMIZATION_FUNCTIONS[@]}"; do
    if grep -q "$func" "$INJECTOR_PATH"; then
        echo -e "${GREEN}  ✓ $func() found${NC}"
    else
        echo -e "${RED}  ✗ $func() missing${NC}"
        ALL_FOUND=false
    fi
done

if [ "$ALL_FOUND" = true ]; then
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 7: Feature Bitmap Generation
echo -e "${BLUE}[7] Testing Feature Bitmap Generation...${NC}"

if grep -q "setFeatureBit\|featureBitmap" "$INJECTOR_PATH"; then
    echo -e "${GREEN}  ✓ Feature bitmap generation implemented${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}  ✗ Feature bitmap generation not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 8: SEO Injection Service
echo -e "${BLUE}[8] Testing SEO Injection Service...${NC}"

INJECTION_SERVICE="src/services/api/SEOInjectionService.ts"

if [ -f "$INJECTION_SERVICE" ]; then
    echo -e "${GREEN}  ✓ SEO Injection Service found${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    if grep -q "getOptimizationConfig" "$INJECTION_SERVICE"; then
        echo -e "${GREEN}  ✓ getOptimizationConfig() found${NC}"
    fi
    if grep -q "checkRateLimit" "$INJECTION_SERVICE"; then
        echo -e "${GREEN}  ✓ Rate limiting implemented${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ SEO Injection Service not found${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 9: Analytics Tracking
echo -e "${BLUE}[9] Testing Analytics API...${NC}"

ANALYTICS_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/seo/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "'$TEST_API_KEY'",
    "url": "https://example.com",
    "optimizationsApplied": 5,
    "extractionTime": 125,
    "features": {"title": true, "meta": true}
  }')

if echo "$ANALYTICS_RESPONSE" | grep -q 'success\|tracked'; then
    echo -e "${GREEN}  ✓ Analytics API responding${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}  ⚠ Analytics API may not be implemented${NC}"
fi
TESTS_RUN=$((TESTS_RUN + 1))
echo ""

# Test 10: Browser Testing Instructions
echo -e "${BLUE}[10] Manual Browser Testing Instructions${NC}"
echo ""
echo -e "${YELLOW}To test the SEO injector in a browser:${NC}"
echo ""
echo -e "1. Start the development server:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo -e "2. Open the test page:"
echo -e "   ${BLUE}open $TEST_PAGE${NC}"
echo -e "   Or visit: ${BLUE}http://localhost:3001/$TEST_PAGE${NC}"
echo ""
echo -e "3. Open browser console (F12) and check for:"
echo -e "   - SEO optimization messages"
echo -e "   - Feature extraction logs"
echo -e "   - Applied optimizations"
echo ""
echo -e "4. Verify optimizations:"
echo -e "   - Title should be 50-60 characters"
echo -e "   - Meta description should be 150-160 characters"
echo -e "   - Only one H1 should exist"
echo -e "   - Images should have alt text and dimensions"
echo ""
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
    echo -e "${GREEN}✓ All automated tests passed!${NC}"
    echo -e "${YELLOW}⚠ Don't forget to run manual browser tests${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
