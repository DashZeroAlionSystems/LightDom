#!/bin/bash

# Interactive SEO Workflow System - Quick Setup Script
# This script sets up the database and validates the installation

set -e

echo "🚀 Setting up Interactive SEO Workflow System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL connection..."
if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw dom_space_harvester; then
    echo -e "${GREEN}✓ Database 'dom_space_harvester' exists${NC}"
else
    echo -e "${YELLOW}⚠ Database 'dom_space_harvester' not found${NC}"
    echo "Creating database..."
    createdb -U postgres dom_space_harvester || echo -e "${RED}✗ Failed to create database${NC}"
fi

# Run migration
echo ""
echo "📝 Running database migration..."
if [ -f "database/migrations/create_seo_workflow_tables.sql" ]; then
    psql -U postgres -d dom_space_harvester -f database/migrations/create_seo_workflow_tables.sql
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration file not found${NC}"
    exit 1
fi

# Check table creation
echo ""
echo "🔍 Verifying table creation..."
TABLES=("seo_campaign_workflows" "seo_attributes_config" "workflow_tasks" "workflow_executions" "user_sessions" "n8n_workflow_templates")

for table in "${TABLES[@]}"; do
    if psql -U postgres -d dom_space_harvester -tAc "SELECT to_regclass('public.$table')" | grep -q "$table"; then
        echo -e "${GREEN}✓ Table '$table' created${NC}"
    else
        echo -e "${RED}✗ Table '$table' not found${NC}"
    fi
done

# Count pre-populated attributes
echo ""
echo "📊 Checking SEO attributes..."
ATTR_COUNT=$(psql -U postgres -d dom_space_harvester -tAc "SELECT COUNT(*) FROM seo_attributes_config")
echo -e "${GREEN}✓ $ATTR_COUNT SEO attributes configured${NC}"

# Show attribute breakdown by category
echo ""
echo "📈 Attribute breakdown by category:"
psql -U postgres -d dom_space_harvester -c "
    SELECT 
        category, 
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE is_active = true) as enabled
    FROM seo_attributes_config 
    GROUP BY category 
    ORDER BY count DESC
"

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."

check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${YELLOW}⚠ $1 not set${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 configured${NC}"
        return 0
    fi
}

ENV_VARS=("DEEPSEEK_API_KEY" "DATABASE_URL")
OPTIONAL_VARS=("N8N_API_URL" "N8N_API_KEY" "N8N_WEBHOOK_URL")

for var in "${ENV_VARS[@]}"; do
    check_env "$var" || echo "  Please set $var in your .env file"
done

echo ""
echo "Optional integrations:"
for var in "${OPTIONAL_VARS[@]}"; do
    check_env "$var" || echo "  $var not set (N8N integration will be limited)"
done

# Check if services are running
echo ""
echo "🌐 Checking service availability..."

check_service() {
    local url=$1
    local name=$2
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓ $name is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $name is not accessible at $url${NC}"
        return 1
    fi
}

# API Server
if check_service "http://localhost:3001/health" "API Server"; then
    echo "  API endpoints available at http://localhost:3001/api/seo-workflow"
fi

# Frontend
if check_service "http://localhost:3000" "Frontend"; then
    echo "  Dashboard available at http://localhost:3000/dashboard/seo-workflow"
fi

# N8N (optional)
if [ ! -z "$N8N_API_URL" ]; then
    check_service "$N8N_API_URL" "N8N" || echo "  Start N8N with: npm run n8n:start"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation: INTERACTIVE_SEO_WORKFLOW_SYSTEM_README.md"
echo ""
echo "🚀 Quick Start:"
echo "  1. Start API server: npm run start:dev"
echo "  2. Navigate to: http://localhost:3000/dashboard/seo-workflow"
echo "  3. Click 'New' to create a workflow session"
echo "  4. Chat with the AI to generate your SEO workflow"
echo ""
echo "💡 Example chat message:"
echo '  "Analyze my e-commerce site at https://example.com daily"'
echo ""
echo "📊 Features:"
echo "  • 192 SEO attributes across 9 categories"
echo "  • AI-powered workflow generation via DeepSeek"
echo "  • N8N integration for automated execution"
echo "  • Real-time progress monitoring"
echo "  • Interactive chat interface"
echo ""
echo "🔗 API Endpoints:"
echo "  • Sessions: GET/POST /api/seo-workflow/sessions"
echo "  • Chat: POST /api/seo-workflow/chat"
echo "  • Execute: POST /api/seo-workflow/execute/:id"
echo "  • Status: GET /api/seo-workflow/status/:id"
echo ""

exit 0
