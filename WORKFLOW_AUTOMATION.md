# LightDom Workflow Automation Guide

This guide provides comprehensive instructions for managing and automating the LightDom project using CLI tools, Makefile commands, and integrated workflows.

## Table of Contents

- [Quick Start](#quick-start)
- [CLI Tool](#cli-tool)
- [Makefile Commands](#makefile-commands)
- [Development Workflows](#development-workflows)
- [CI/CD Integration](#cicd-integration)
- [GitHub Copilot Integration](#github-copilot-integration)
- [Cursor AI Integration](#cursor-ai-integration)

## Quick Start

### First Time Setup

```bash
# Using CLI
npm run cli setup

# Or using Makefile
make quick-start
```

This will:
1. Install all dependencies
2. Create `.env` file from template
3. Setup PostgreSQL database
4. Start local blockchain (Anvil)
5. Run initial migrations

### Daily Development

```bash
# Start full development environment
npm run cli dev --full
# or
make dev-full

# Start only frontend
npm run dev
# or
make dev

# Start only API
npm run cli dev --api
# or
make dev-api
```

## CLI Tool

The LightDom CLI (`cli.js`) provides a unified interface for all project operations.

### Usage

```bash
# Using npm script
npm run cli -- <command> [options]

# Direct execution
node cli.js <command> [options]

# View all commands
npm run cli -- --help
```

### Available Commands

#### Development

```bash
# Start development server
npm run cli dev                    # Frontend only
npm run cli dev --full             # All services
npm run cli dev --api              # API only
npm run cli dev --blockchain       # With blockchain

# Examples:
npm run cli dev                    # Start Vite dev server
npm run cli dev --full             # Start PostgreSQL, Anvil, API, and frontend
```

#### Building

```bash
# Build application
npm run cli build                  # Production build
npm run cli build --analyze        # Build with bundle analysis
npm run cli build --electron       # Build Electron app

# Examples:
npm run cli build                  # Standard production build
npm run cli build --analyze        # See what's in your bundle
```

#### Testing

```bash
# Run tests
npm run cli test                   # All tests
npm run cli test --unit            # Unit tests only
npm run cli test --integration     # Integration tests
npm run cli test --e2e             # End-to-end tests
npm run cli test --coverage        # With coverage report
npm run cli test --watch           # Watch mode

# Examples:
npm run cli test --unit --watch    # Watch unit tests
npm run cli test --coverage        # Generate coverage report
```

#### Database Operations

```bash
# Database management
npm run cli db create              # Create database
npm run cli db migrate             # Run migrations
npm run cli db seed                # Seed data
npm run cli db reset               # Reset database
npm run cli db console             # Open psql console

# Examples:
npm run cli db migrate             # Apply schema changes
npm run cli db reset               # Drop and recreate database
```

#### Blockchain Operations

```bash
# Blockchain management
npm run cli blockchain start       # Start Anvil
npm run cli blockchain stop        # Stop Anvil
npm run cli blockchain compile     # Compile contracts
npm run cli blockchain test        # Test contracts
npm run cli blockchain deploy      # Deploy contracts

# Examples:
npm run cli blockchain compile     # Compile Solidity contracts
npm run cli blockchain deploy      # Deploy to local network
```

#### Docker Operations

```bash
# Docker management
npm run cli docker up              # Start containers
npm run cli docker down            # Stop containers
npm run cli docker build           # Build images
npm run cli docker logs            # View logs
npm run cli docker clean           # Clean resources

# Examples:
npm run cli docker up              # Start all services in Docker
npm run cli docker logs            # Follow container logs
```

#### Code Quality

```bash
# Quality checks
npm run cli quality --lint         # Run linter
npm run cli quality --format       # Format code
npm run cli quality --type-check   # Type check
npm run cli quality --all          # All checks

# Examples:
npm run cli quality --all          # Run all quality checks
npm run cli quality --lint         # Check code style
```

#### Cleanup

```bash
# Clean artifacts
npm run cli clean --build          # Clean build artifacts
npm run cli clean --deps           # Remove node_modules
npm run cli clean --cache          # Clear npm cache
npm run cli clean --all            # Clean everything

# Examples:
npm run cli clean --build          # Remove dist folders
npm run cli clean --all            # Full cleanup
```

#### Project Information

```bash
# Display project info
npm run cli info                   # Show project details and service status

# Output includes:
# - Project name and version
# - Node/NPM versions
# - Git branch
# - Service status (PostgreSQL, Anvil)
```

## Makefile Commands

The Makefile provides short, memorable commands for common operations.

### Installation

```bash
make install              # Install dependencies
make install-dev          # Install with dev dependencies
make clean-install        # Clean install
```

### Development

```bash
make dev                  # Start frontend
make dev-api              # Start API only
make dev-full             # Start all services
make dev-electron         # Start Electron app
make dev-stop             # Stop all services
```

### Building

```bash
make build                # Production build
make build-analyze        # Build with analysis
make build-electron       # Build Electron app
```

### Testing

```bash
make test                 # Run all tests
make test-unit            # Unit tests
make test-integration     # Integration tests
make test-e2e             # E2E tests
make test-coverage        # With coverage
make test-watch           # Watch mode
```

### Code Quality

```bash
make lint                 # Run linter
make lint-fix             # Fix linting issues
make format               # Format code
make format-check         # Check formatting
make type-check           # TypeScript check
make quality              # All quality checks
```

### Security

```bash
make security-audit       # Security audit
make security-scan        # Security scan
make security-fix         # Fix vulnerabilities
```

### Database

```bash
make db-start             # Start PostgreSQL
make db-stop              # Stop PostgreSQL
make db-create            # Create database
make db-migrate           # Run migrations
make db-seed              # Seed data
make db-reset             # Reset database
make db-drop              # Drop database
make db-console           # Open console
```

### Blockchain

```bash
make blockchain-start     # Start Anvil
make blockchain-stop      # Stop Anvil
make contracts-compile    # Compile contracts
make contracts-test       # Test contracts
make contracts-deploy     # Deploy contracts
make contracts-verify     # Verify contracts
```

### Docker

```bash
make docker-build         # Build images
make docker-up            # Start containers
make docker-down          # Stop containers
make docker-logs          # View logs
make docker-ps            # List containers
make docker-clean         # Clean resources
make docker-rebuild       # Rebuild all
```

### Deployment

```bash
make deploy-staging       # Deploy to staging
make deploy-production    # Deploy to production
```

### Monitoring

```bash
make logs                 # View logs
make logs-error           # Error logs only
make health-check         # Check health
make monitor              # Start monitoring
```

### Git Operations

```bash
make git-status           # Git status
make git-branches         # List branches
make git-clean            # Dry run cleanup
make git-clean-force      # Force cleanup
```

### Automation

```bash
make automation-test      # Test automation
make automation-round     # Run automation
make automation-master    # Master automation
make cursor-agent         # Launch Cursor agent
```

### Cleanup

```bash
make clean                # Clean build artifacts
make clean-deps           # Remove node_modules
make clean-cache          # Clear cache
make clean-logs           # Remove logs
make clean-all            # Clean everything
```

### Quick Workflows

```bash
make quick-start          # Complete setup and start
make quick-test           # Lint + type-check + test
make quick-deploy         # Quality + test + build
make reset-dev            # Reset environment
```

### CI/CD

```bash
make ci-test              # CI test workflow
make ci-build             # CI build workflow
make ci-deploy            # Complete CI/CD
```

## Development Workflows

### Feature Development Workflow

```bash
# 1. Start development
make dev-full

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes and test continuously
npm run cli test --watch

# 4. Run quality checks
make quality

# 5. Test the feature
npm run cli test

# 6. Build to verify
make build

# 7. Commit changes
git add .
git commit -m "feat: add new feature"

# 8. Push changes
git push origin feature/new-feature
```

### Bug Fix Workflow

```bash
# 1. Create bug fix branch
git checkout -b bugfix/fix-issue

# 2. Start services
make dev-full

# 3. Reproduce the bug
npm run cli test

# 4. Fix and test
npm run cli test --watch

# 5. Verify fix
npm run cli test --all

# 6. Quality checks
make quality

# 7. Commit and push
git add .
git commit -m "fix: resolve issue"
git push origin bugfix/fix-issue
```

### Database Migration Workflow

```bash
# 1. Create migration file
# Edit database/migrations/XXX_migration_name.sql

# 2. Test migration
npm run cli db reset

# 3. Verify schema
npm run cli db console
# \dt to list tables
# \d table_name to describe table

# 4. Test application with new schema
make dev-full
```

### Smart Contract Development Workflow

```bash
# 1. Start blockchain
npm run cli blockchain start

# 2. Make changes to contracts
# Edit contracts/*.sol

# 3. Compile
npm run cli blockchain compile

# 4. Test
npm run cli blockchain test

# 5. Deploy locally
npm run cli blockchain deploy

# 6. Test integration
npm run cli test --integration
```

### Release Workflow

```bash
# 1. Ensure main branch is clean
git checkout main
git pull origin main

# 2. Run full test suite
make ci-test

# 3. Build production
make ci-build

# 4. Update version
npm version patch  # or minor, or major

# 5. Generate changelog
npm run changelog:generate

# 6. Commit version bump
git add .
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"

# 7. Tag release
git tag -a v$(node -p "require('./package.json').version") -m "Release v$(node -p "require('./package.json').version")"

# 8. Push changes and tags
git push origin main --tags

# 9. Deploy
make deploy-production
```

## CI/CD Integration

### GitHub Actions Integration

The project includes GitHub Actions workflows that use these commands:

```yaml
# .github/workflows/ci-cd.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: make ci-test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: make ci-build

  deploy:
    runs-on: ubuntu-latest
    needs: [test, build]
    steps:
      - uses: actions/checkout@v3
      - run: make deploy-production
```

### Pre-commit Hooks

Setup Git hooks for automated checks:

```bash
# Install Husky
npm install --save-dev husky

# Setup hooks
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run quality checks
make quality

# Run unit tests
npm run cli test --unit
EOF

chmod +x .husky/pre-commit
```

## GitHub Copilot Integration

GitHub Copilot is configured with project-specific instructions.

### Location

- Instructions: `.github/COPILOT_INSTRUCTIONS.md`
- Configuration: `.github/copilot-config.json` (if exists)

### Usage

1. Open any file in VS Code with Copilot enabled
2. Start typing a comment describing what you need
3. Copilot will suggest code based on project patterns

### Tips

```typescript
// Example: Ask Copilot to generate an API endpoint
// Create an API endpoint for submitting DOM optimizations
// that validates input, saves to database, and returns result

// Copilot will generate code following project conventions
```

### Custom Commands

Use Copilot Chat for project-specific tasks:

```
# In Copilot Chat:
@workspace /help                    # Get help for this project
@workspace /explain                 # Explain code
@workspace /fix                     # Suggest fixes
@workspace /tests                   # Generate tests
```

## Cursor AI Integration

Cursor AI is configured with comprehensive project instructions.

### Location

- Instructions: `.cursor/CURSOR_INSTRUCTIONS.md`
- Rules: `.cursorrules`
- Workflows: `.cursor/workflows.json`
- Tasks: `.cursor/tasks.json`

### Usage in Cursor

#### 1. Cursor Composer

```bash
# Open Cursor Composer with Cmd+I (Mac) or Ctrl+I (Windows/Linux)

# Example prompts:
"Create a new React component for displaying optimization results"
"Add a new API endpoint for fetching user statistics"
"Write tests for the OptimizationService class"
"Refactor this component to use hooks"
```

#### 2. Cursor Chat

```bash
# Open Cursor Chat with Cmd+L (Mac) or Ctrl+L (Windows/Linux)

# Example questions:
"How do I add a new database migration?"
"What's the best way to optimize this query?"
"Explain how the blockchain integration works"
"Show me examples of error handling in this project"
```

#### 3. Inline Editing

```bash
# Select code and press Cmd+K (Mac) or Ctrl+K (Windows/Linux)

# Example commands:
"Add error handling"
"Add TypeScript types"
"Optimize this function"
"Add documentation"
```

### Cursor Workflows

The project includes predefined Cursor workflows:

```bash
# Available workflows in .cursor/workflows.json:
- PreCommitWorkflow
- PullRequestWorkflow
- FeatureDevelopmentWorkflow
- SecurityWorkflow
- DeploymentWorkflow
- DocumentationWorkflow
```

### Cursor Agent Launcher

```bash
# Launch automated Cursor agent
npm run cursor:launch-agent

# Or using Make
make cursor-agent
```

## Automation Scripts

### Available Automation Scripts

```bash
# Automation testing
npm run automation:app-test

# Run automation round
npm run automation:round

# Master automation
npm run automation:master

# Enhanced automation
npm run automation:enhanced

# Autopilot
npm run automation:autopilot
```

### Custom Automation

Create custom automation scripts:

```javascript
// scripts/custom-automation.js
import { runCommand } from './automation/utils.js';

async function customWorkflow() {
  // Your automation logic
  await runCommand('npm run test');
  await runCommand('npm run build');
  console.log('Custom workflow complete');
}

customWorkflow();
```

Add to package.json:

```json
{
  "scripts": {
    "automation:custom": "node scripts/custom-automation.js"
  }
}
```

## Best Practices

### 1. Daily Development

```bash
# Morning routine
make dev-stop                 # Stop any running services
make git-status               # Check git status
git pull origin main          # Update from main
make quick-start              # Start development
```

### 2. Before Committing

```bash
# Pre-commit checklist
make quality                  # Run quality checks
npm run cli test              # Run tests
make build                    # Verify build works
npm run cli info              # Check environment
```

### 3. Troubleshooting

```bash
# If something isn't working
make dev-stop                 # Stop all services
make clean-all                # Clean everything
make clean-install            # Reinstall dependencies
npm run cli setup             # Setup from scratch
```

### 4. Performance Issues

```bash
# Check what's running
npm run cli info              # Check service status
make docker-ps                # Check Docker containers

# Clean and restart
make clean-cache              # Clear caches
make dev-stop                 # Stop services
make dev-full                 # Restart fresh
```

## Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://lightdom:lightdom123@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=lightdom
DB_PASSWORD=lightdom123

# Blockchain
ETHEREUM_RPC_URL=http://localhost:8545
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NETWORK_ID=31337

# Application
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000
LOG_LEVEL=debug

# Security
JWT_SECRET=lightdom-development-secret-key
ENCRYPTION_KEY=lightdom-encryption-key-32-chars

# Features
ENABLE_MONITORING=true
ENABLE_CACHING=true
CACHE_TTL=3600
```

## Troubleshooting

### Common Issues

#### PostgreSQL not starting

```bash
# Check if PostgreSQL is installed
which psql

# Start service
sudo service postgresql start

# Check status
pg_isready -h localhost -p 5432
```

#### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or stop all services
make dev-stop
```

#### Anvil not starting

```bash
# Install Foundry if missing
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Start Anvil
npm run cli blockchain start
```

#### Build failures

```bash
# Clean and rebuild
make clean-all
make clean-install
make build
```

## Additional Resources

- [Project README](./README.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [GitHub Copilot Instructions](./.github/COPILOT_INSTRUCTIONS.md)
- [Cursor Instructions](./.cursor/CURSOR_INSTRUCTIONS.md)
- [Quick Start Guide](./QUICK_START.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Support

For issues or questions:
1. Check this documentation
2. Review project README
3. Check GitHub issues
4. Create a new issue with details

---

**Last Updated**: Auto-generated based on project state

Keep this documentation updated as the project evolves.
