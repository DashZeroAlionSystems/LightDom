#!/bin/bash

# ============================================================
# LightDOM Database Initialization Script
# ============================================================
# This script initializes the PostgreSQL database with all
# required schemas, tables, indexes, and seed data.
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    echo -e "${BLUE}Loading environment variables...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-lightdom_blockchain}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    LightDOM Database Initialization Script            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}→ ${description}...${NC}"

    if [ ! -f "$file" ]; then
        echo -e "${RED}  ✗ File not found: $file${NC}"
        return 1
    fi

    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ ${description} completed${NC}"
        return 0
    else
        echo -e "${RED}  ✗ ${description} failed${NC}"
        return 1
    fi
}

# Function to execute SQL command
execute_sql() {
    local command=$1
    local description=$2

    echo -e "${YELLOW}→ ${description}...${NC}"

    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$command" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ ${description} completed${NC}"
        return 0
    else
        echo -e "${RED}  ✗ ${description} failed${NC}"
        return 1
    fi
}

# Check if PostgreSQL is running
echo -e "${BLUE}[1/8] Checking PostgreSQL connection...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ PostgreSQL connection successful${NC}"
else
    echo -e "${RED}  ✗ Cannot connect to PostgreSQL${NC}"
    echo -e "${RED}  Please ensure PostgreSQL is running and credentials are correct.${NC}"
    exit 1
fi

# Create database if it doesn't exist
echo ""
echo -e "${BLUE}[2/8] Creating database...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Database '$DB_NAME' created${NC}"
else
    echo -e "${YELLOW}  ⚠ Database '$DB_NAME' already exists${NC}"
fi

# Create extensions
echo ""
echo -e "${BLUE}[3/8] Installing PostgreSQL extensions...${NC}"
execute_sql "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"" "Installing uuid-ossp"
execute_sql "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"" "Installing pgcrypto"

# Create SEO Features Schema
echo ""
echo -e "${BLUE}[4/8] Creating SEO features schema...${NC}"
if [ -f "src/seo/database/seo-features-schema.sql" ]; then
    execute_sql_file "src/seo/database/seo-features-schema.sql" "Creating SEO features schema"
else
    echo -e "${YELLOW}  ⚠ SEO features schema file not found, skipping...${NC}"
fi

# Create Training Data Tables
echo ""
echo -e "${BLUE}[5/8] Creating training data tables...${NC}"
if [ -f "src/seo/database/training-data-migrations.sql" ]; then
    execute_sql_file "src/seo/database/training-data-migrations.sql" "Creating training data tables"
else
    echo -e "${YELLOW}  ⚠ Training data migrations file not found, skipping...${NC}"
fi

# Create application user
echo ""
echo -e "${BLUE}[6/8] Creating application database user...${NC}"
APP_USER="${DB_USER}_app"
APP_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres <<EOF > /dev/null 2>&1
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$APP_USER') THEN
        CREATE USER $APP_USER WITH PASSWORD '$APP_PASSWORD';
    END IF;
END
\$\$;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Application user '$APP_USER' created/verified${NC}"
    echo -e "${YELLOW}  ⚠ Save this password: ${APP_PASSWORD}${NC}"
    echo ""
    echo -e "${YELLOW}  Add to your .env file:${NC}"
    echo -e "${YELLOW}  DB_USER=$APP_USER${NC}"
    echo -e "${YELLOW}  DB_PASSWORD=$APP_PASSWORD${NC}"
else
    echo -e "${RED}  ✗ Failed to create application user${NC}"
fi

# Grant permissions
echo ""
echo -e "${BLUE}[7/8] Granting permissions...${NC}"
execute_sql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $APP_USER" "Granting database privileges"
execute_sql "GRANT ALL PRIVILEGES ON SCHEMA seo_features TO $APP_USER" "Granting schema privileges"
execute_sql "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA seo_features TO $APP_USER" "Granting table privileges"
execute_sql "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA seo_features TO $APP_USER" "Granting sequence privileges"

# Seed initial data
echo ""
echo -e "${BLUE}[8/8] Seeding initial data...${NC}"

# Create default subscription plans
execute_sql "
INSERT INTO subscription_plans (name, price, currency, interval, features)
VALUES
    ('Starter', 29.00, 'usd', 'month', '{\"optimizations\": 1000, \"apiCalls\": 10000, \"domains\": 3}'::jsonb),
    ('Pro', 99.00, 'usd', 'month', '{\"optimizations\": 10000, \"apiCalls\": 100000, \"domains\": 10}'::jsonb),
    ('Enterprise', 499.00, 'usd', 'month', '{\"optimizations\": -1, \"apiCalls\": -1, \"domains\": -1}'::jsonb)
ON CONFLICT DO NOTHING
" "Creating subscription plans" 2>/dev/null || echo -e "${YELLOW}  ⚠ Subscription plans table not found, skipping...${NC}"

# Create data directories
echo ""
echo -e "${BLUE}Creating data directories...${NC}"
mkdir -p .data/models
mkdir -p .data/training
mkdir -p logs
mkdir -p uploads
mkdir -p backups

echo -e "${GREEN}  ✓ Data directories created${NC}"

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Database Initialization Complete!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Database Details:${NC}"
echo -e "  Host: ${DB_HOST}:${DB_PORT}"
echo -e "  Database: ${DB_NAME}"
echo -e "  User: ${DB_USER}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Update your .env file with the application user credentials"
echo -e "  2. Run: ${YELLOW}npm install${NC} to install dependencies"
echo -e "  3. Run: ${YELLOW}npm run dev${NC} to start the development server"
echo -e "  4. Run: ${YELLOW}./scripts/test-system.sh${NC} to test the system"
echo ""
echo -e "${GREEN}Happy hacking! 🚀${NC}"
