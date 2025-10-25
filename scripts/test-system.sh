#!/bin/bash

# ============================================================
# Comprehensive System Test
# ============================================================
# Runs all test suites to verify the complete system
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██╗     ██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗ ███╗   ███╗
║   ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗ ████║
║   ██║     ██║██║  ███╗███████║   ██║   ██║  ██║██║   ██║██╔████╔██║
║   ██║     ██║██║   ██║██╔══██║   ██║   ██║  ██║██║   ██║██║╚██╔╝██║
║   ███████╗██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝██║ ╚═╝ ██║
║   ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
║                                                              ║
║              SEO AI System - Comprehensive Test Suite              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Counters
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local test_script=$2

    TOTAL_SUITES=$((TOTAL_SUITES + 1))

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}Test Suite [$TOTAL_SUITES]: $suite_name${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ -f "$test_script" ]; then
        if bash "$test_script"; then
            echo -e "${GREEN}✓ $suite_name: PASSED${NC}"
            PASSED_SUITES=$((PASSED_SUITES + 1))
            return 0
        else
            echo -e "${RED}✗ $suite_name: FAILED${NC}"
            FAILED_SUITES=$((FAILED_SUITES + 1))
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ Test script not found: $test_script${NC}"
        FAILED_SUITES=$((FAILED_SUITES + 1))
        return 1
    fi
}

# Start timestamp
START_TIME=$(date +%s)

# Pre-flight checks
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Pre-flight Checks${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo -e "${GREEN}✓ Environment configuration found${NC}"
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${YELLOW}  Copy .env.example to .env and configure it${NC}"
    exit 1
fi

# Check if database is configured
if [ -z "$DB_NAME" ]; then
    echo -e "${RED}✗ Database not configured${NC}"
    echo -e "${YELLOW}  Set DATABASE_URL in .env${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Database configured: $DB_NAME${NC}"
fi

# Check if PostgreSQL is accessible
if command -v psql >/dev/null 2>&1; then
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL accessible${NC}"
    else
        echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
        echo -e "${YELLOW}  Start PostgreSQL and run: ./scripts/init-database.sh${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ psql not found, skipping database check${NC}"
fi

# Check if API server is running
API_URL="${API_BASE_URL:-http://localhost:3001}"
if curl -sf "$API_URL/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ API server running at $API_URL${NC}"
else
    echo -e "${YELLOW}⚠ API server not responding at $API_URL${NC}"
    echo -e "${YELLOW}  Start server with: npm run dev${NC}"
    echo -e "${YELLOW}  Some tests may fail without the API server${NC}"
fi

# Check if Python is available
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo -e "${GREEN}✓ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Python not found, ML tests may fail${NC}"
fi

echo ""

# Run test suites
run_test_suite "Data Collection System" "scripts/test-data-collection.sh"
run_test_suite "AI Training System" "scripts/test-ai-training.sh"
run_test_suite "SEO Injection System" "scripts/test-seo-injection.sh"

# End timestamp
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Final Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Final Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Test Suites: $TOTAL_SUITES"
echo -e "${GREEN}Passed: $PASSED_SUITES${NC}"
echo -e "${RED}Failed: $FAILED_SUITES${NC}"
echo -e "Duration: ${DURATION}s"
echo ""

# System health overview
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}System Health Overview${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Database stats
if [ ! -z "$DB_NAME" ]; then
    echo -e "${YELLOW}Database Statistics:${NC}"
    CONTRIB_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.training_contributions" 2>/dev/null | tr -d ' ')
    TRAINING_RUNS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.model_training_runs" 2>/dev/null | tr -d ' ')

    echo -e "  Training Contributions: ${CONTRIB_COUNT:-0}"
    echo -e "  Model Training Runs: ${TRAINING_RUNS:-0}"
fi

# Disk usage
echo ""
echo -e "${YELLOW}Disk Usage:${NC}"
if [ -d ".data" ]; then
    DATA_SIZE=$(du -sh .data 2>/dev/null | cut -f1)
    echo -e "  Data Directory: $DATA_SIZE"
fi
if [ -d "logs" ]; then
    LOG_SIZE=$(du -sh logs 2>/dev/null | cut -f1)
    echo -e "  Logs Directory: $LOG_SIZE"
fi

# Models
echo ""
echo -e "${YELLOW}Machine Learning Models:${NC}"
MODELS_DIR="${ML_MODELS_DIR:-./.data/models}"
if [ -d "$MODELS_DIR" ]; then
    MODEL_COUNT=$(find "$MODELS_DIR" -name "*.pkl" 2>/dev/null | wc -l)
    echo -e "  Trained Models: $MODEL_COUNT"
else
    echo -e "  Trained Models: 0"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Final result
if [ $FAILED_SUITES -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║  ✓ ALL TESTS PASSED - SYSTEM READY FOR DEPLOYMENT!      ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "  1. Review deployment guide: ${YELLOW}cat DEPLOYMENT.md${NC}"
    echo -e "  2. Configure production environment"
    echo -e "  3. Deploy to production server"
    echo -e "  4. Set up monitoring and alerts"
    echo -e "  5. Start collecting SEO training data"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                          ║${NC}"
    echo -e "${RED}║  ✗ SOME TESTS FAILED - REVIEW ERRORS ABOVE              ║${NC}"
    echo -e "${RED}║                                                          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Check error messages above"
    echo -e "  2. Verify environment configuration (.env)"
    echo -e "  3. Ensure PostgreSQL is running"
    echo -e "  4. Ensure API server is running (npm run dev)"
    echo -e "  5. Check logs in ./logs directory"
    echo -e "  6. Review DEPLOYMENT.md for setup instructions"
    echo ""
    exit 1
fi
