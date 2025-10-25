#!/bin/bash

# ============================================================
# System Status & Health Check
# ============================================================
# Monitors the health and performance of the LightDOM system
# ============================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs) 2>/dev/null
fi

API_URL="${API_BASE_URL:-http://localhost:3001}"

clear

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║              LightDOM System Status Dashboard                ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to check service status
check_service() {
    local service_name=$1
    local check_command=$2

    printf "%-30s" "$service_name:"

    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Down${NC}"
        return 1
    fi
}

# Function to format bytes
format_bytes() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$(( bytes / 1024 ))KB"
    elif [ $bytes -lt 1073741824 ]; then
        echo "$(( bytes / 1048576 ))MB"
    else
        echo "$(( bytes / 1073741824 ))GB"
    fi
}

# ═══════════════════════════════════════════════════════════════
# Service Health Checks
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Service Health${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

check_service "API Server" "curl -sf $API_URL/health"
check_service "PostgreSQL" "PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-lightdom_blockchain} -c 'SELECT 1'"
check_service "Redis (Optional)" "redis-cli ping"
check_service "Python ML" "python3 --version"

echo ""

# ═══════════════════════════════════════════════════════════════
# API Endpoints Health
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}API Endpoints${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

ENDPOINTS=(
    "GET|/health|Health Check"
    "GET|/api/seo/training/stats|Training Stats"
    "GET|/api/seo/training/leaderboard|Leaderboard"
    "GET|/api/seo/training/feature-importance|Feature Importance"
)

for endpoint in "${ENDPOINTS[@]}"; do
    IFS='|' read -r method path description <<< "$endpoint"
    printf "%-40s" "$description:"

    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -sf "$API_URL$path" 2>/dev/null)
    else
        RESPONSE=$(curl -sf -X $method "$API_URL$path" 2>/dev/null)
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# Database Statistics
# ═══════════════════════════════════════════════════════════════
if [ ! -z "$DB_NAME" ]; then
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Database Statistics${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo ""

    # Training contributions
    CONTRIB_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.training_contributions" 2>/dev/null | tr -d ' ')

    CONTRIB_TODAY=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.training_contributions WHERE timestamp > CURRENT_DATE" 2>/dev/null | tr -d ' ')

    AVG_QUALITY=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT ROUND(AVG(quality_score), 2) FROM seo_features.training_contributions" 2>/dev/null | tr -d ' ')

    # Training runs
    TRAINING_RUNS=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.model_training_runs" 2>/dev/null | tr -d ' ')

    COMPLETED_RUNS=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT COUNT(*) FROM seo_features.model_training_runs WHERE status = 'completed'" 2>/dev/null | tr -d ' ')

    # Contributors
    CONTRIBUTORS=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d $DB_NAME \
      -t -c "SELECT COUNT(DISTINCT contributor_address) FROM seo_features.training_contributions" 2>/dev/null | tr -d ' ')

    printf "%-40s %s\n" "Total Training Contributions:" "${CONTRIB_COUNT:-0}"
    printf "%-40s %s\n" "Contributions Today:" "${CONTRIB_TODAY:-0}"
    printf "%-40s %s/100\n" "Average Quality Score:" "${AVG_QUALITY:-0}"
    printf "%-40s %s\n" "Unique Contributors:" "${CONTRIBUTORS:-0}"
    printf "%-40s %s\n" "Total Training Runs:" "${TRAINING_RUNS:-0}"
    printf "%-40s %s\n" "Completed Runs:" "${COMPLETED_RUNS:-0}"

    echo ""
fi

# ═══════════════════════════════════════════════════════════════
# Machine Learning Models
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Machine Learning Models${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

MODELS_DIR="${ML_MODELS_DIR:-./.data/models}"

if [ -d "$MODELS_DIR" ]; then
    MODEL_COUNT=$(find "$MODELS_DIR" -name "*.pkl" 2>/dev/null | wc -l)
    printf "%-40s %s\n" "Trained Models:" "$MODEL_COUNT"

    if [ $MODEL_COUNT -gt 0 ]; then
        echo ""
        echo "Recent Models:"
        find "$MODELS_DIR" -name "*.pkl" -type f -printf "%TY-%Tm-%Td %TH:%TM  %f\n" 2>/dev/null | sort -r | head -5 | sed 's/^/  /'
    fi
else
    printf "%-40s %s\n" "Models Directory:" "Not found"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# System Resources
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}System Resources${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

# CPU Usage
if command -v top >/dev/null 2>&1; then
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    printf "%-40s %.1f%%\n" "CPU Usage:" "$CPU_USAGE"
fi

# Memory Usage
if command -v free >/dev/null 2>&1; then
    MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
    MEM_USED=$(free -m | awk 'NR==2{print $3}')
    MEM_PERCENT=$(awk "BEGIN {printf \"%.1f\", ($MEM_USED/$MEM_TOTAL)*100}")
    printf "%-40s %sMB / %sMB (%s%%)\n" "Memory Usage:" "$MEM_USED" "$MEM_TOTAL" "$MEM_PERCENT"
fi

# Disk Usage
if command -v df >/dev/null 2>&1; then
    DISK_USAGE=$(df -h . | awk 'NR==2{print $5}')
    DISK_AVAIL=$(df -h . | awk 'NR==2{print $4}')
    printf "%-40s %s used, %s available\n" "Disk Usage:" "$DISK_USAGE" "$DISK_AVAIL"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Directory Sizes
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Directory Sizes${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

DIRS=(".data:Data Directory" "logs:Logs Directory" "uploads:Uploads Directory" "backups:Backups Directory")

for dir_info in "${DIRS[@]}"; do
    IFS=':' read -r dir label <<< "$dir_info"

    if [ -d "$dir" ]; then
        SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
        printf "%-40s %s\n" "$label:" "$SIZE"
    else
        printf "%-40s %s\n" "$label:" "Not found"
    fi
done

echo ""

# ═══════════════════════════════════════════════════════════════
# Recent Logs
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Recent Errors (Last 5)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -d "logs" ]; then
    if [ -f "logs/error.log" ]; then
        tail -5 logs/error.log 2>/dev/null | sed 's/^/  /' || echo "  No errors found"
    elif [ -f "logs/app.log" ]; then
        grep -i "error" logs/app.log 2>/dev/null | tail -5 | sed 's/^/  /' || echo "  No errors found"
    else
        echo "  No error logs found"
    fi
else
    echo "  Logs directory not found"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Active Processes
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Active Node Processes${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

if command -v pm2 >/dev/null 2>&1; then
    pm2 list 2>/dev/null | grep -v "^$" || echo "  No PM2 processes"
else
    ps aux | grep -E "node.*lightdom|node.*api" | grep -v grep | head -5 | awk '{printf "  %-8s %5s %5s %s\n", $2, $3, $4, $11}' || echo "  No Node processes found"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Footer
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Last updated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo -e "  ${CYAN}./scripts/test-system.sh${NC}        - Run all tests"
echo -e "  ${CYAN}./scripts/init-database.sh${NC}      - Initialize database"
echo -e "  ${CYAN}npm run dev${NC}                     - Start dev server"
echo -e "  ${CYAN}npm test${NC}                        - Run unit tests"
echo -e "  ${CYAN}pm2 logs${NC}                        - View PM2 logs"
echo ""
