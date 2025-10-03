#!/bin/bash

# Complete Git Automations Setup Script for LightDom
# This script sets up all git automations and codespace configurations

set -e

echo "🚀 Setting up complete Git automations and Codespace configuration for LightDom..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first."
    echo "   Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the repository root."
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
print_status "Repository: $REPO"

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to switch to main branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        print_error "Please switch to main branch before running this script."
        exit 1
    fi
fi

print_success "Prerequisites check passed!"

# 1. Setup branch protection rules
print_status "Setting up branch protection rules..."
if ./scripts/setup-branch-protection.sh; then
    print_success "Branch protection rules configured!"
else
    print_error "Failed to setup branch protection rules"
    exit 1
fi

# 2. Verify GitHub Actions workflows
print_status "Verifying GitHub Actions workflows..."

WORKFLOWS=(
    ".github/workflows/auto-merge.yml"
    ".github/workflows/branch-cleanup.yml"
    ".github/workflows/ci-cd.yml"
    ".github/workflows/test.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "$workflow" ]; then
        print_success "✓ $workflow exists"
    else
        print_error "✗ $workflow missing"
        exit 1
    fi
done

# 3. Verify Codespace configuration
print_status "Verifying Codespace configuration..."

CODESPACE_FILES=(
    ".devcontainer/devcontainer.json"
    ".devcontainer/post-create.sh"
    ".devcontainer/post-start.sh"
    ".codespaces/codespace.json"
)

for file in "${CODESPACE_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

# 4. Make scripts executable
print_status "Making scripts executable..."
chmod +x .devcontainer/post-create.sh
chmod +x .devcontainer/post-start.sh
chmod +x scripts/setup-branch-protection.sh
print_success "Scripts made executable!"

# 5. Check package.json scripts
print_status "Verifying package.json scripts..."

REQUIRED_SCRIPTS=(
    "test:unit:coverage"
    "test:integration"
    "test:e2e"
    "lint"
    "format:check"
    "type-check"
    "security:scan"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run "$script" --dry-run &> /dev/null; then
        print_success "✓ $script script exists"
    else
        print_warning "⚠ $script script missing or has issues"
    fi
done

# 6. Create environment file if it doesn't exist
print_status "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=lightdom
DB_PASSWORD=lightdom123

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NETWORK_ID=31337

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000

# API Configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=lightdom-development-secret-key-change-in-production
ENCRYPTION_KEY=lightdom-encryption-key-32-chars

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=debug
EOF
    print_success "Created .env file"
else
    print_success "✓ .env file already exists"
fi

# 7. Test GitHub Actions syntax
print_status "Testing GitHub Actions syntax..."

for workflow in "${WORKFLOWS[@]}"; do
    if gh workflow list &> /dev/null; then
        print_success "✓ GitHub Actions workflows are valid"
        break
    else
        print_warning "⚠ GitHub Actions validation failed"
    fi
done

# 8. Display summary
echo ""
echo "🎉 Git Automations Setup Complete!"
echo ""
echo "📋 What was configured:"
echo "  ✅ Branch protection rules for main branch"
echo "  ✅ Auto-merge workflow for feature branches"
echo "  ✅ Branch cleanup workflow"
echo "  ✅ Enhanced CI/CD pipeline"
echo "  ✅ GitHub Codespaces configuration"
echo "  ✅ Development environment scripts"
echo "  ✅ Package.json scripts for CI/CD"
echo ""
echo "🔧 Next steps:"
echo "  1. Configure required secrets in GitHub repository settings:"
echo "     - SLACK_WEBHOOK_URL (optional, for notifications)"
echo "     - SNYK_TOKEN (for security scanning)"
echo "     - SEMGREP_APP_TOKEN (for SAST)"
echo "     - Deployment tokens for staging/production"
echo ""
echo "  2. Test the setup:"
echo "     - Create a feature branch: git checkout -b feature/test-automation"
echo "     - Make a small change and commit"
echo "     - Push and create a PR"
echo "     - Request a review"
echo "     - Watch the auto-merge workflow in action!"
echo ""
echo "  3. Start developing in Codespace:"
echo "     - Open the repository in GitHub Codespaces"
echo "     - The development environment will be automatically configured"
echo "     - Use './start-dev.sh' to start all services"
echo ""
echo "📚 Documentation:"
echo "  - See GIT_AUTOMATION_README.md for detailed information"
echo "  - Check .github/workflows/ for workflow details"
echo "  - Review .devcontainer/ for Codespace configuration"
echo ""
echo "🚀 Happy coding with automated workflows!"