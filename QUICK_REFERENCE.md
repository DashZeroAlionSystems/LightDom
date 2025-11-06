# LightDom Quick Reference Card

Quick access to the most commonly used commands.

## 🚀 Getting Started

```bash
# Complete setup (first time)
make quick-start

# Or step by step
npm install
make setup-env      # Create .env file
make db-create      # Setup database
make db-migrate     # Run migrations
```

## 💻 Development

```bash
# Start all services
make dev-full
npm run cli dev --full

# Frontend only
make dev
npm run dev

# API only
make dev-api
npm run cli dev --api

# Stop all services
make dev-stop
```

## 🧪 Testing

```bash
# All tests
make test
npm run cli test

# Unit tests
make test-unit
npm run cli test --unit

# With coverage
make test-coverage
npm run cli test --coverage

# Watch mode
make test-watch
npm run cli test --watch
```

## 🎨 Code Quality

```bash
# All checks
make quality
npm run cli quality --all

# Lint only
make lint
npm run cli quality --lint

# Format code
make format
npm run cli quality --format

# Type check
make type-check
npm run cli quality --type-check

# Fix issues
make lint-fix
```

## 🗄️ Database

```bash
# Create database
make db-create
npm run cli db create

# Run migrations
make db-migrate
npm run cli db migrate

# Seed data
make db-seed
npm run cli db seed

# Reset database
make db-reset
npm run cli db reset

# Open console
make db-console
npm run cli db console
```

## ⛓️ Blockchain

```bash
# Start Anvil
make blockchain-start
npm run cli blockchain start

# Compile contracts
make contracts-compile
npm run cli blockchain compile

# Test contracts
make contracts-test
npm run cli blockchain test

# Deploy contracts
make contracts-deploy
npm run cli blockchain deploy
```

## 🏗️ Building

```bash
# Production build
make build
npm run cli build

# Analyze bundle
make build-analyze
npm run cli build --analyze

# Electron app
make build-electron
npm run cli build --electron
```

## 🐳 Docker

```bash
# Start containers
make docker-up
npm run cli docker up

# Stop containers
make docker-down
npm run cli docker down

# View logs
make docker-logs
npm run cli docker logs

# Rebuild
make docker-rebuild
```

## 🧹 Cleanup

```bash
# Clean build artifacts
make clean
npm run cli clean --build

# Clean node_modules
make clean-deps
npm run cli clean --deps

# Clean everything
make clean-all
npm run cli clean --all
```

## 🔍 Information

```bash
# Project info
make info
npm run cli info

# Git status
make git-status

# Service status
npm run cli info

# View all commands
make help
npm run cli --help
```

## ⚡ Quick Workflows

```bash
# Quick start everything
make quick-start

# Quick test (lint + type-check + test)
make quick-test

# Ready for deployment
make quick-deploy

# Reset environment
make reset-dev
```

## 📦 Package Management

```bash
# Install dependencies
make install

# Update dependencies
make update-deps

# Check outdated
make check-deps

# Security audit
make security-audit

# Fix vulnerabilities
make security-fix
```

## 🔧 Troubleshooting

```bash
# Stop all services
make dev-stop

# Clean and reinstall
make clean-all
make install

# Reset database
make db-reset

# Restart blockchain
make blockchain-stop
make blockchain-start

# Check services
npm run cli info
```

## 📚 Documentation

- **[README](./README.md)** - Project overview
- **[Workflow Automation](./WORKFLOW_AUTOMATION.md)** - Complete CLI guide
- **[Dev Container](./devcontainer/README.md)** - Container setup
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[GitHub Copilot](./.github/COPILOT_INSTRUCTIONS.md)** - Copilot guide
- **[Cursor AI](./.cursor/CURSOR_INSTRUCTIONS.md)** - Cursor guide

## 🆘 Help

```bash
# CLI help
npm run cli --help

# Makefile help
make help

# Command help
npm run cli <command> --help
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Blockchain**: http://localhost:8545
- **Database**: localhost:5432

## 💡 Tips

1. Use `make` commands for quick access
2. Use `npm run cli` for detailed options
3. Check service status with `npm run cli info`
4. Always run `make quality` before committing
5. Use dev container for consistent environment

---

**Pro Tip**: Bookmark this page for quick reference! 🚀
