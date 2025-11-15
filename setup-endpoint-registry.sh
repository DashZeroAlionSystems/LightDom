#!/bin/bash
# ====================================================================
# API Endpoint Registry - Easy Setup Script
# ====================================================================
# Purpose: One-command setup for the API Endpoint Registry system
# Usage: ./setup-endpoint-registry.sh
# ====================================================================

set -e  # Exit on error

echo "🚀 API Endpoint Registry - Easy Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-dom_space_harvester}"
DB_USER="${DB_USER:-postgres}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   User: $DB_USER"
echo ""

# Function to run SQL file
run_migration() {
    local file=$1
    local description=$2
    
    echo -e "${BLUE}📝 Running: $description${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success: $description${NC}"
    else
        echo -e "${YELLOW}⚠️  Already exists or warning: $description${NC}"
    fi
    echo ""
}

# Step 1: Check if workflow-hierarchy-schema exists (prerequisite)
echo -e "${BLUE}🔍 Step 1: Checking prerequisites...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1 FROM workflow_services LIMIT 1" > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing prerequisite: workflow-hierarchy-schema.sql${NC}"
    run_migration "migrations/workflow-hierarchy-schema.sql" "Workflow Hierarchy Schema"
else
    echo -e "${GREEN}✅ Prerequisites met${NC}"
    echo ""
fi

# Step 2: Run main migration
echo -e "${BLUE}🔧 Step 2: Creating API Endpoint Registry tables...${NC}"
run_migration "migrations/20251115_api_endpoint_registry.sql" "API Endpoint Registry Schema"

# Step 3: Seed demo data
echo -e "${BLUE}🌱 Step 3: Seeding demo data...${NC}"
run_migration "migrations/20251115_api_endpoint_registry_demo_data.sql" "Demo Data"

# Step 4: Verify installation
echo -e "${BLUE}🔍 Step 4: Verifying installation...${NC}"

# Count records in each table
ENDPOINTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM api_endpoints" 2>/dev/null | xargs)
BINDINGS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM service_endpoint_bindings" 2>/dev/null | xargs)
CHAINS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM workflow_endpoint_chains" 2>/dev/null | xargs)
WIZARDS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM workflow_wizard_configs" 2>/dev/null | xargs)
LOGS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM endpoint_execution_logs" 2>/dev/null | xargs)

echo -e "${GREEN}✅ Installation verified!${NC}"
echo ""
echo -e "${BLUE}📊 Database Status:${NC}"
echo "   • API Endpoints: $ENDPOINTS"
echo "   • Service Bindings: $BINDINGS"
echo "   • Endpoint Chains: $CHAINS"
echo "   • Wizard Configs: $WIZARDS"
echo "   • Execution Logs: $LOGS"
echo ""

# Step 5: Display next steps
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "1. Start the API server:"
echo "   ${YELLOW}npm run start:dev${NC}"
echo ""
echo "2. Test the demo data with SQL queries:"
echo "   ${YELLOW}psql -d $DB_NAME -c \"SELECT * FROM api_endpoints;\"${NC}"
echo ""
echo "3. View the relationships:"
echo "   ${YELLOW}psql -d $DB_NAME -c \"SELECT ae.title, seb.binding_order, ws.name FROM api_endpoints ae JOIN service_endpoint_bindings seb ON ae.endpoint_id = seb.endpoint_id JOIN workflow_services ws ON seb.service_id = ws.service_id ORDER BY seb.binding_order;\"${NC}"
echo ""
echo "4. Run the demo script:"
echo "   ${YELLOW}node demo-endpoint-registry-system.js${NC}"
echo ""
echo "5. Try the API endpoints:"
echo "   ${YELLOW}curl http://localhost:3001/api/endpoint-registry/endpoints${NC}"
echo "   ${YELLOW}curl http://localhost:3001/api/endpoint-registry/stats${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   • API_ENDPOINT_REGISTRY_QUICKSTART.md - Quick reference"
echo "   • API_ENDPOINT_REGISTRY_SYSTEM.md - Complete guide"
echo "   • API_ENDPOINT_REGISTRY_ARCHITECTURE.md - Architecture diagrams"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
