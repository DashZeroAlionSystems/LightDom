#!/bin/bash

# Crawler Campaign System Validation Script
# Checks that all components are properly set up

echo "🔍 Validating Crawler Campaign System Installation"
echo "=================================================="
echo ""

SUCCESS=0
FAILURES=0

# Check 1: Core Service Files
echo "✓ Checking core service files..."
if [ -f "services/deepseek-api-service.js" ]; then
  echo "  ✓ DeepSeek API service found"
  ((SUCCESS++))
else
  echo "  ✗ DeepSeek API service missing"
  ((FAILURES++))
fi

if [ -f "services/crawler-campaign-service.js" ]; then
  echo "  ✓ Campaign service found"
  ((SUCCESS++))
else
  echo "  ✗ Campaign service missing"
  ((FAILURES++))
fi

# Check 2: API Routes
echo ""
echo "✓ Checking API routes..."
if [ -f "src/api/routes/campaign.routes.js" ]; then
  echo "  ✓ Campaign routes found"
  ((SUCCESS++))
else
  echo "  ✗ Campaign routes missing"
  ((FAILURES++))
fi

# Check 3: UI Components
echo ""
echo "✓ Checking UI components..."
if [ -f "src/components/CrawlerCampaignDashboard.tsx" ]; then
  echo "  ✓ Campaign dashboard component found"
  ((SUCCESS++))
else
  echo "  ✗ Campaign dashboard component missing"
  ((FAILURES++))
fi

# Check 4: Database Migration
echo ""
echo "✓ Checking database migrations..."
if [ -f "database/migrations/crawler-campaign-tables.sql" ]; then
  echo "  ✓ Database migration file found"
  ((SUCCESS++))
else
  echo "  ✗ Database migration file missing"
  ((FAILURES++))
fi

# Check 5: Documentation
echo ""
echo "✓ Checking documentation..."
if [ -f "CRAWLER_CAMPAIGN_SYSTEM_README.md" ]; then
  echo "  ✓ System README found"
  ((SUCCESS++))
else
  echo "  ✗ System README missing"
  ((FAILURES++))
fi

if [ -f "CRAWLER_QUICKSTART.md" ]; then
  echo "  ✓ Quick start guide found"
  ((SUCCESS++))
else
  echo "  ✗ Quick start guide missing"
  ((FAILURES++))
fi

# Check 6: Environment Configuration
echo ""
echo "✓ Checking environment configuration..."
if grep -q "DEEPSEEK_API_KEY" .env.example; then
  echo "  ✓ DeepSeek config in .env.example"
  ((SUCCESS++))
else
  echo "  ✗ DeepSeek config missing from .env.example"
  ((FAILURES++))
fi

if grep -q "CRAWLER_MAX_CAMPAIGNS" .env.example; then
  echo "  ✓ Crawler campaign config in .env.example"
  ((SUCCESS++))
else
  echo "  ✗ Crawler campaign config missing from .env.example"
  ((FAILURES++))
fi

# Check 7: API Server Integration
echo ""
echo "✓ Checking API server integration..."
if grep -q "campaign.routes" api-server-express.js; then
  echo "  ✓ Campaign routes registered in API server"
  ((SUCCESS++))
else
  echo "  ✗ Campaign routes not registered in API server"
  ((FAILURES++))
fi

# Check 8: React App Integration
echo ""
echo "✓ Checking React app integration..."
if grep -q "CrawlerCampaignDashboard" src/App.tsx; then
  echo "  ✓ Campaign dashboard imported in App.tsx"
  ((SUCCESS++))
else
  echo "  ✗ Campaign dashboard not imported in App.tsx"
  ((FAILURES++))
fi

if grep -q "crawler-campaigns" src/App.tsx; then
  echo "  ✓ Campaign dashboard route configured"
  ((SUCCESS++))
else
  echo "  ✗ Campaign dashboard route not configured"
  ((FAILURES++))
fi

# Check 9: File Structure
echo ""
echo "✓ Checking file structure..."
TOTAL_FILES=9

echo "  Core Files:"
echo "    - services/deepseek-api-service.js"
echo "    - services/crawler-campaign-service.js"
echo "    - src/api/routes/campaign.routes.js"
echo "    - src/components/CrawlerCampaignDashboard.tsx"
echo "    - database/migrations/crawler-campaign-tables.sql"
echo "    - CRAWLER_CAMPAIGN_SYSTEM_README.md"
echo "    - CRAWLER_QUICKSTART.md"
echo "    - test/crawler-campaign-system.test.js"
echo "    - validate-crawler-system.sh"

# Summary
echo ""
echo "=================================================="
echo "VALIDATION SUMMARY"
echo "=================================================="
echo "✓ Checks Passed: $SUCCESS"
echo "✗ Checks Failed: $FAILURES"
TOTAL=$((SUCCESS + FAILURES))
PERCENTAGE=$((SUCCESS * 100 / TOTAL))
echo "📊 Success Rate: $PERCENTAGE%"
echo "=================================================="

if [ $FAILURES -eq 0 ]; then
  echo ""
  echo "🎉 All validation checks passed!"
  echo ""
  echo "Next Steps:"
  echo "1. Install dependencies: npm install"
  echo "2. Configure environment: cp .env.example .env"
  echo "3. Add your DeepSeek API key to .env (optional)"
  echo "4. Run database migration: psql -U postgres -d your_db < database/migrations/crawler-campaign-tables.sql"
  echo "5. Start the system: npm run start:dev"
  echo "6. Access dashboard: http://localhost:3000/admin/crawler-campaigns"
  echo ""
  echo "See CRAWLER_QUICKSTART.md for detailed instructions."
  echo ""
  exit 0
else
  echo ""
  echo "⚠️  Some validation checks failed."
  echo "Please review the errors above and ensure all files are present."
  echo ""
  exit 1
fi
