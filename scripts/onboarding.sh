#!/bin/bash

# LightDom Quick Start - New Developer Onboarding
# This script helps new developers get up and running quickly

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'EOF'
 _     _       _     _   ____                  
| |   (_) __ _| |__ | |_|  _ \  ___  _ __ ___  
| |   | |/ _` | '_ \| __| | | |/ _ \| '_ ` _ \ 
| |___| | (_| | | | | |_| |_| | (_) | | | | | |
|_____|_|\__, |_| |_|\__|____/ \___/|_| |_| |_|
         |___/                                 

🚀 Welcome to LightDom Enterprise Platform!
EOF
echo -e "${NC}"

echo -e "${CYAN}=========================================${NC}"
echo -e "${GREEN}New Developer Quick Start Guide${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to log steps
log_step() {
    echo -e "${BLUE}📋 Step $1: ${2}${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Welcome message
echo -e "${BLUE}Welcome to the LightDom development team! 🎉${NC}"
echo
echo "This script will help you set up your development environment"
echo "and get you ready to contribute to the LightDom platform."
echo

# Step 1: Prerequisites Check
log_step "1" "Checking Prerequisites"
echo

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        log_success "Node.js $(node -v) is installed"
    else
        log_error "Node.js version is too old ($(node -v)). Please install Node.js 18+"
        exit 1
    fi
else
    log_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    log_success "npm $(npm -v) is installed"
else
    log_error "npm is not installed"
    exit 1
fi

# Check Git
if command_exists git; then
    log_success "Git $(git --version | cut -d' ' -f3) is installed"
else
    log_warning "Git is not installed - some features may not work"
fi

echo

# Step 2: Project Overview
log_step "2" "Project Overview"
echo
echo -e "${CYAN}LightDom is a comprehensive blockchain-based platform that includes:${NC}"
echo "  🌐 DOM optimization and space harvesting"
echo "  ⛓️  Blockchain integration with smart contracts"
echo "  🤖 Automated workflow management"
echo "  🎨 React-based frontend with TypeScript"
echo "  🔧 Comprehensive CLI tools"
echo "  📊 Real-time monitoring and analytics"
echo

# Step 3: Environment Setup
log_step "3" "Setting up Development Environment"
echo

read -p "Proceed with automatic setup? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    log_info "Installing dependencies..."
    npm install --legacy-peer-deps
    
    log_info "Setting up environment configuration..."
    if [ ! -f ".env" ]; then
        if [ -f "automation.env" ]; then
            cp automation.env .env
            log_success "Environment file created from template"
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
    fi
    
    log_info "Setting up Git hooks..."
    if [ -d ".git" ]; then
        npx husky install >/dev/null 2>&1 || true
        chmod +x .husky/pre-commit .husky/pre-push 2>/dev/null || true
        log_success "Git hooks configured"
    fi
    
    log_info "Making scripts executable..."
    find bin/ -type f -exec chmod +x {} \; 2>/dev/null || true
    find scripts/ -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    log_success "Environment setup completed!"
fi

echo

# Step 4: CLI Tools Introduction
log_step "4" "CLI Tools Overview"
echo

echo -e "${CYAN}LightDom provides powerful CLI tools for development:${NC}"
echo
echo "📦 Main CLI (lightweight, always works):"
echo "  node bin/lightdom-dev --help"
echo
echo "🚀 Development automation:"
echo "  ./scripts/dev-automation.sh help"
echo
echo "⚙️  Environment setup:"
echo "  ./scripts/setup-dev-environment.sh"
echo

# Step 5: Quick Health Check
log_step "5" "System Health Check"
echo

log_info "Running health check..."
node bin/lightdom-dev health
echo

# Step 6: Development Workflow
log_step "6" "Development Workflow Guide"
echo

echo -e "${CYAN}Common development commands:${NC}"
echo
echo "🔧 Start development:"
echo "  npm run dev                 # Start frontend development"
echo "  npm run api                 # Start API server"
echo "  npm run automation          # Start blockchain automation"
echo
echo "🧪 Testing:"
echo "  npm run test                # Run all tests"
echo "  npm run test:unit           # Unit tests only"
echo "  npm run lint                # Code linting"
echo
echo "🏗️  Building:"
echo "  npm run build               # Production build"
echo "  npm run type-check          # TypeScript checking"
echo
echo "🤖 Using CLI:"
echo "  node bin/lightdom-dev dev           # Start development"
echo "  node bin/lightdom-dev test          # Run tests"
echo "  node bin/lightdom-dev health        # System health"
echo "  node bin/lightdom-dev doctor        # Diagnose issues"
echo

# Step 7: IDE Setup
log_step "7" "IDE Configuration"
echo

echo -e "${CYAN}Recommended development setup:${NC}"
echo
echo "🔧 VSCode workspace is available:"
echo "  code .vscode/lightdom.code-workspace"
echo
echo "📦 Recommended extensions are listed in:"
echo "  .vscode/extensions.json"
echo
echo "⚙️  Project settings configured in:"
echo "  .vscode/settings.json"
echo

# Step 8: Documentation
log_step "8" "Documentation & Resources"
echo

echo -e "${CYAN}Key documentation files:${NC}"
echo "  📖 README.md                 - Main project documentation"
echo "  🔧 CLI_README.md             - CLI tools and commands"
echo "  🤖 AUTOMATION_README.md      - Automation system guide"
echo "  ⛓️  BLOCKCHAIN_README.md      - Blockchain development"
echo "  🚀 QUICK_START.md            - Quick start guide"
echo

# Step 9: First Steps
log_step "9" "Suggested Next Steps"
echo

echo -e "${CYAN}Ready to start developing! Here's what to do next:${NC}"
echo
echo "1. 🎯 Explore the codebase:"
echo "   ls -la src/                 # Source code structure"
echo "   cat package.json            # Available scripts"
echo
echo "2. 🚀 Start development:"
echo "   npm run dev                 # Start development server"
echo "   # Open http://localhost:3000 in your browser"
echo
echo "3. 🧪 Run tests to ensure everything works:"
echo "   npm run test:unit           # Quick unit tests"
echo
echo "4. 🤖 Try the automation system:"
echo "   npm run automation          # Start blockchain automation"
echo
echo "5. 🔧 Use CLI tools:"
echo "   node bin/lightdom-dev --help        # Explore CLI commands"
echo "   ./scripts/dev-automation.sh help    # Development automation"
echo

# Step 10: Team Resources
log_step "10" "Team & Support Resources"
echo

echo -e "${CYAN}Getting help and staying connected:${NC}"
echo
echo "📚 Documentation:"
echo "  - Check all *.md files in the project root"
echo "  - API documentation in docs/ directory"
echo
echo "🐛 Reporting issues:"
echo "  - Use GitHub issues for bug reports"
echo "  - Include output from: node bin/lightdom-dev doctor"
echo
echo "💡 Development tips:"
echo "  - Use pre-commit hooks for code quality"
echo "  - Run health checks regularly"
echo "  - Keep environment files up to date"
echo

# Final message
echo
echo -e "${GREEN}🎉 Welcome to the LightDom team! You're all set up and ready to go!${NC}"
echo
echo -e "${BLUE}Happy coding! 🚀${NC}"
echo

# Optional: Start development server
echo
read -p "Would you like to start the development server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Starting development server..."
    npm run dev
fi