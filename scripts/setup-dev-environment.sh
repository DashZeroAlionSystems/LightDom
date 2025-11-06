#!/bin/bash

# LightDom Development Environment Setup Script
# This script automates the complete development environment setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    echo -e "${BLUE}🚀 LightDom Development Environment Setup${NC}"
    echo "=================================================="
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js version $node_version is too old. Please install Node.js 18+."
        exit 1
    fi
    log_success "Node.js $(node -v) is installed"
    
    if ! command_exists npm; then
        log_error "npm is not installed"
        exit 1
    fi
    log_success "npm $(npm -v) is installed"
    
    # Install dependencies
    log_info "Installing dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci --legacy-peer-deps || npm install --legacy-peer-deps
    else
        npm install --legacy-peer-deps
    fi
    log_success "Dependencies installed"
    
    # Setup environment files
    log_info "Setting up environment configuration..."
    if [ ! -f ".env" ]; then
        if [ -f "automation.env" ]; then
            cp automation.env .env
            log_success "Environment file created from automation.env"
        else
            cat > .env << 'EOF'
# LightDom Development Environment
NODE_ENV=development
API_PORT=3000
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://localhost:8545
DATABASE_URL=postgresql://localhost:5432/lightdom_dev
AUTOMATION_ENABLED=true
MONITORING_ENABLED=true
LOG_LEVEL=info
EOF
            log_success "Basic environment file created"
        fi
    else
        log_info "Environment file already exists"
    fi
    
    # Setup Git hooks
    log_info "Setting up Git hooks..."
    if [ -d ".git" ]; then
        if [ ! -d ".husky" ]; then
            npx husky install
            log_success "Husky initialized"
        fi
        
        # Make hooks executable
        if [ -f ".husky/pre-commit" ]; then
            chmod +x .husky/pre-commit
        fi
        if [ -f ".husky/pre-push" ]; then
            chmod +x .husky/pre-push
        fi
        log_success "Git hooks configured"
    else
        log_warning "Not a git repository - skipping Git hooks setup"
    fi
    
    # Make CLI executable
    log_info "Setting up CLI..."
    if [ -f "bin/lightdom" ]; then
        chmod +x bin/lightdom
        log_success "CLI executable configured"
    fi
    
    # Database setup (optional)
    log_info "Checking database setup..."
    if command_exists psql; then
        createdb lightdom_dev 2>/dev/null || true
        if [ -f "postgresql-setup-script.sql" ]; then
            psql -d lightdom_dev -f postgresql-setup-script.sql >/dev/null 2>&1 || true
            log_success "Database setup completed"
        else
            log_info "No database schema file found"
        fi
    else
        log_warning "PostgreSQL not available - skipping database setup"
    fi
    
    # Build the project
    log_info "Building the project..."
    npm run build >/dev/null 2>&1 || log_warning "Build failed - you may need to fix TypeScript errors"
    
    # Run health check
    log_info "Running system health check..."
    if [ -f "bin/lightdom" ]; then
        node bin/lightdom health --verbose || true
    fi
    
    # Success message
    echo
    echo -e "${GREEN}🎉 Development environment setup completed!${NC}"
    echo
    log_info "Next steps:"
    echo "  npm run dev                 - Start development server"
    echo "  npm run test                - Run tests"
    echo "  node bin/lightdom --help    - Use the CLI"
    echo "  npm run automation          - Start blockchain automation"
    echo "  npm run health              - Check system health"
    echo
    log_info "Available CLI commands:"
    echo "  lightdom dev                - Start development environment"
    echo "  lightdom build              - Build the application"
    echo "  lightdom test               - Run tests"
    echo "  lightdom automation --start - Start automation system"
    echo "  lightdom health             - Check system health"
    echo "  lightdom doctor --fix       - Diagnose and fix issues"
}

# Run main function
main "$@"