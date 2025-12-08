#!/bin/bash

# LightDom Development Automation Script
# Automates common development tasks and workflows

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_cyan() {
    echo -e "${CYAN}$1${NC}"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}🚀 LightDom Development Automation${NC}"
    echo "======================================"
    echo
    echo "Usage: $0 [command] [options]"
    echo
    echo "Commands:"
    echo "  setup         Complete development environment setup"
    echo "  dev           Start development workflow"
    echo "  test          Run comprehensive testing"
    echo "  build         Build and validate project"
    echo "  deploy        Deploy to staging/production"
    echo "  clean         Clean project artifacts"
    echo "  health        System health check and diagnostics"
    echo "  update        Update dependencies and tools"
    echo "  backup        Backup important project files"
    echo "  generate      Generate code components"
    echo
    echo "Options:"
    echo "  --verbose     Verbose output"
    echo "  --dry-run     Show what would be done without executing"
    echo "  --force       Force operation without confirmations"
    echo
    echo "Examples:"
    echo "  $0 setup              # Complete setup"
    echo "  $0 dev --verbose      # Start development with verbose output"
    echo "  $0 test --coverage    # Run tests with coverage"
    echo "  $0 deploy staging     # Deploy to staging"
}

# Setup command
cmd_setup() {
    log_info "Setting up LightDom development environment..."
    
    # Check prerequisites
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install --legacy-peer-deps
    log_success "Dependencies installed"
    
    # Setup environment
    if [ ! -f ".env" ]; then
        if [ -f "automation.env" ]; then
            cp automation.env .env
            log_success "Environment file created from automation.env"
        else
            log_info "Creating basic environment file..."
            cat > .env << 'EOF'
NODE_ENV=development
API_PORT=3000
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_RPC_URL=http://localhost:8545
DATABASE_URL=postgresql://localhost:5432/lightdom_dev
EOF
            log_success "Basic environment file created"
        fi
    fi
    
    # Setup Git hooks
    if [ -d ".git" ]; then
        log_info "Setting up Git hooks..."
        npx husky install >/dev/null 2>&1 || true
        chmod +x .husky/pre-commit .husky/pre-push 2>/dev/null || true
        log_success "Git hooks configured"
    fi
    
    # Make scripts executable
    find bin/ -type f -exec chmod +x {} \; 2>/dev/null || true
    find scripts/ -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    log_success "Setup completed successfully!"
}

# Development command
cmd_dev() {
    log_info "Starting development workflow..."
    
    # Health check first
    log_info "Running health check..."
    node bin/lightdom-dev health
    
    # Start development server
    log_info "Starting development server..."
    if [ "$1" = "--api-only" ]; then
        npm run api
    elif [ "$1" = "--frontend-only" ]; then
        npm run dev
    else
        npm run start:dev
    fi
}

# Test command
cmd_test() {
    log_info "Running comprehensive tests..."
    
    local test_type="$1"
    local coverage=""
    
    if [ "$2" = "--coverage" ]; then
        coverage="--coverage"
    fi
    
    case "$test_type" in
        "unit")
            npm run test:unit $coverage
            ;;
        "integration")
            npm run test:integration
            ;;
        "e2e")
            npm run test:e2e
            ;;
        "all"|"")
            npm run test:unit
            npm run test:integration
            npm run test:e2e
            ;;
        *)
            log_error "Unknown test type: $test_type"
            exit 1
            ;;
    esac
    
    log_success "Tests completed successfully!"
}

# Build command
cmd_build() {
    log_info "Building project..."
    
    # Clean previous build
    log_info "Cleaning previous build..."
    rm -rf dist/ || true
    
    # Type checking
    log_info "Running TypeScript type checking..."
    npm run type-check
    
    # Linting
    log_info "Running linting..."
    npm run lint
    
    # Build
    log_info "Building application..."
    npm run build
    
    # Analyze bundle if requested
    if [ "$1" = "--analyze" ]; then
        log_info "Analyzing bundle..."
        npm run analyze:bundle || true
    fi
    
    log_success "Build completed successfully!"
}

# Deploy command
cmd_deploy() {
    local environment="$1"
    
    if [ -z "$environment" ]; then
        environment="staging"
    fi
    
    log_info "Deploying to $environment..."
    
    # Pre-deployment checks
    log_info "Running pre-deployment checks..."
    cmd_test unit
    cmd_build
    
    # Security audit
    log_info "Running security audit..."
    npm audit --audit-level=moderate || true
    
    # Deploy
    if [ "$environment" = "production" ]; then
        read -p "⚠️ Are you sure you want to deploy to PRODUCTION? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "Deployment cancelled"
            exit 0
        fi
    fi
    
    npm run deploy:$environment
    
    # Post-deployment verification
    log_info "Running post-deployment verification..."
    npm run test:smoke || log_warning "Smoke tests failed"
    
    log_success "Deployment to $environment completed!"
}

# Clean command
cmd_clean() {
    log_info "Cleaning project artifacts..."
    
    # Remove build artifacts
    rm -rf dist/ || true
    rm -rf .next/ || true
    rm -rf coverage/ || true
    
    # Remove temporary files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    
    log_success "Project cleaned!"
}

# Health command
cmd_health() {
    log_info "Running comprehensive health check..."
    
    # Use CLI health check
    node bin/lightdom-dev health
    
    # Additional checks
    log_info "Checking service status..."
    
    # Check if development server is running
    if lsof -i :3000 >/dev/null 2>&1; then
        log_success "Development server is running on port 3000"
    else
        log_warning "Development server is not running"
    fi
    
    # Check if automation is running
    if pgrep -f "start-blockchain-automation" >/dev/null 2>&1; then
        log_success "Blockchain automation is running"
    else
        log_warning "Blockchain automation is not running"
    fi
    
    # Check disk space
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_warning "Disk space is low: ${disk_usage}% used"
    else
        log_success "Disk space is adequate: ${disk_usage}% used"
    fi
}

# Update command
cmd_update() {
    log_info "Updating dependencies and tools..."
    
    # Update npm packages
    log_info "Checking for package updates..."
    npm outdated || true
    
    # Update packages
    read -p "Update packages? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm update
        log_success "Packages updated"
    fi
    
    # Update global tools
    log_info "Updating global tools..."
    npm install -g npm@latest 2>/dev/null || true
    
    log_success "Update completed!"
}

# Backup command
cmd_backup() {
    log_info "Creating project backup..."
    
    local backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "../$backup_dir"
    
    # Backup important files
    cp -r src "../$backup_dir/" 2>/dev/null || true
    cp -r scripts "../$backup_dir/" 2>/dev/null || true
    cp -r contracts "../$backup_dir/" 2>/dev/null || true
    cp package.json "../$backup_dir/" 2>/dev/null || true
    cp .env "../$backup_dir/" 2>/dev/null || true
    cp *.md "../$backup_dir/" 2>/dev/null || true
    
    log_success "Backup created at ../$backup_dir"
}

# Generate command
cmd_generate() {
    local type="$1"
    local name="$2"
    
    if [ -z "$type" ] || [ -z "$name" ]; then
        log_error "Usage: $0 generate <type> <name>"
        log_info "Types: component, service, api, contract"
        exit 1
    fi
    
    case "$type" in
        "component")
            node bin/lightdom-dev generate component "$name"
            ;;
        "service")
            node bin/lightdom-dev generate service "$name"
            ;;
        *)
            log_error "Unknown type: $type"
            exit 1
            ;;
    esac
}

# Parse command line arguments
COMMAND="$1"
shift || true

case "$COMMAND" in
    "setup")
        cmd_setup "$@"
        ;;
    "dev")
        cmd_dev "$@"
        ;;
    "test")
        cmd_test "$@"
        ;;
    "build")
        cmd_build "$@"
        ;;
    "deploy")
        cmd_deploy "$@"
        ;;
    "clean")
        cmd_clean "$@"
        ;;
    "health")
        cmd_health "$@"
        ;;
    "update")
        cmd_update "$@"
        ;;
    "backup")
        cmd_backup "$@"
        ;;
    "generate")
        cmd_generate "$@"
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac