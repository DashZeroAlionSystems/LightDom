# LightDom Makefile - Project Management and Automation

.PHONY: help install dev build test clean docker lint format deploy

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)LightDom Project Management$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(BLUE)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(BLUE)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

info: ## Display project information
	@echo "$(BLUE)Project Information$(NC)"
	@echo "Name: LightDom Space Bridge Platform"
	@echo "Version: $(shell node -p "require('./package.json').version")"
	@echo "Node: $(shell node --version)"
	@echo "NPM: $(shell npm --version)"
	@echo "Git Branch: $(shell git branch --show-current)"

##@ Installation

install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm ci
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-dev: ## Install with development dependencies
	@echo "$(GREEN)Installing with dev dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dev dependencies installed$(NC)"

clean-install: clean-deps install ## Clean install all dependencies
	@echo "$(GREEN)✓ Clean installation complete$(NC)"

##@ Development

dev: ## Start development server (frontend)
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

dev-api: ## Start API server only
	@echo "$(GREEN)Starting API server...$(NC)"
	npm run api

dev-full: ## Start all services (frontend + API + blockchain)
	@echo "$(GREEN)Starting full development environment...$(NC)"
	@echo "$(YELLOW)Starting PostgreSQL...$(NC)"
	-sudo service postgresql start 2>/dev/null || true
	@echo "$(YELLOW)Starting Anvil blockchain...$(NC)"
	-pkill -f anvil 2>/dev/null || true
	anvil --host 0.0.0.0 --port 8545 &
	@sleep 2
	@echo "$(GREEN)Starting application...$(NC)"
	npm run start:dev

dev-electron: ## Start Electron desktop app
	@echo "$(GREEN)Starting Electron app...$(NC)"
	npm run electron:dev

dev-stop: ## Stop all development services
	@echo "$(YELLOW)Stopping services...$(NC)"
	-pkill -f "vite" 2>/dev/null || true
	-pkill -f "node.*api" 2>/dev/null || true
	-pkill -f "anvil" 2>/dev/null || true
	@echo "$(GREEN)✓ Services stopped$(NC)"

##@ Building

build: ## Build production bundle
	@echo "$(GREEN)Building application...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete$(NC)"

build-analyze: ## Build and analyze bundle size
	@echo "$(GREEN)Building and analyzing...$(NC)"
	npm run analyze:bundle

build-electron: ## Build Electron desktop app
	@echo "$(GREEN)Building Electron app...$(NC)"
	npm run electron:build

##@ Testing

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	npm test

test-unit: ## Run unit tests
	@echo "$(GREEN)Running unit tests...$(NC)"
	npm run test:unit

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	npm run test:integration

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running e2e tests...$(NC)"
	npm run test:e2e

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	npm run test:coverage

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	npm run test -- --watch

##@ Code Quality

lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	npm run lint

lint-fix: ## Fix linting issues
	@echo "$(GREEN)Fixing linting issues...$(NC)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(GREEN)Formatting code...$(NC)"
	npm run format

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(NC)"
	npm run format:check

type-check: ## Run TypeScript type checking
	@echo "$(GREEN)Running type check...$(NC)"
	npm run type-check

quality: lint format type-check ## Run all quality checks
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

##@ Security

security-audit: ## Run npm security audit
	@echo "$(GREEN)Running security audit...$(NC)"
	npm audit

security-scan: ## Run security vulnerability scan
	@echo "$(GREEN)Running security scan...$(NC)"
	npm run security:scan

security-fix: ## Fix security vulnerabilities
	@echo "$(GREEN)Fixing security vulnerabilities...$(NC)"
	npm audit fix

##@ Database

db-start: ## Start PostgreSQL database
	@echo "$(GREEN)Starting PostgreSQL...$(NC)"
	sudo service postgresql start

db-stop: ## Stop PostgreSQL database
	@echo "$(YELLOW)Stopping PostgreSQL...$(NC)"
	sudo service postgresql stop

db-create: ## Create database
	@echo "$(GREEN)Creating database...$(NC)"
	sudo -u postgres psql -c "CREATE DATABASE lightdom;" 2>/dev/null || echo "Database already exists"
	sudo -u postgres psql -c "CREATE USER lightdom WITH PASSWORD 'lightdom123';" 2>/dev/null || echo "User already exists"
	sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lightdom TO lightdom;"

db-migrate: db-start ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	@if [ -f "postgresql-setup-script.sql" ]; then \
		PGPASSWORD=lightdom123 psql -h localhost -U lightdom -d lightdom -f postgresql-setup-script.sql; \
		echo "$(GREEN)✓ Migrations complete$(NC)"; \
	else \
		echo "$(YELLOW)No migration file found$(NC)"; \
	fi

db-seed: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(NC)"
	@if [ -f "database/seed.sql" ]; then \
		PGPASSWORD=lightdom123 psql -h localhost -U lightdom -d lightdom -f database/seed.sql; \
	else \
		echo "$(YELLOW)No seed file found$(NC)"; \
	fi

db-reset: db-drop db-create db-migrate ## Reset database (drop, create, migrate)
	@echo "$(GREEN)✓ Database reset complete$(NC)"

db-drop: ## Drop database
	@echo "$(RED)Dropping database...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		sudo -u postgres psql -c "DROP DATABASE IF EXISTS lightdom;"; \
		echo "$(GREEN)✓ Database dropped$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

db-console: ## Open database console
	@echo "$(GREEN)Opening database console...$(NC)"
	PGPASSWORD=lightdom123 psql -h localhost -U lightdom -d lightdom

##@ Blockchain

blockchain-start: ## Start local blockchain (Anvil)
	@echo "$(GREEN)Starting Anvil blockchain...$(NC)"
	-pkill -f anvil 2>/dev/null || true
	anvil --host 0.0.0.0 --port 8545 &
	@sleep 2
	@echo "$(GREEN)✓ Blockchain running on http://localhost:8545$(NC)"

blockchain-stop: ## Stop local blockchain
	@echo "$(YELLOW)Stopping blockchain...$(NC)"
	-pkill -f anvil 2>/dev/null || true
	@echo "$(GREEN)✓ Blockchain stopped$(NC)"

contracts-compile: ## Compile smart contracts
	@echo "$(GREEN)Compiling smart contracts...$(NC)"
	npx hardhat compile

contracts-test: ## Test smart contracts
	@echo "$(GREEN)Testing smart contracts...$(NC)"
	npx hardhat test

contracts-deploy: blockchain-start ## Deploy contracts to local blockchain
	@echo "$(GREEN)Deploying contracts...$(NC)"
	@sleep 2
	npx hardhat run scripts/deploy.ts --network localhost

contracts-verify: ## Verify contracts on Etherscan
	@echo "$(GREEN)Verifying contracts...$(NC)"
	npx hardhat verify --network mainnet CONTRACT_ADDRESS

##@ Docker

docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

docker-up: ## Start Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Containers started$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

docker-logs: ## View Docker logs
	@echo "$(GREEN)Viewing Docker logs...$(NC)"
	docker-compose logs -f

docker-ps: ## List running containers
	@echo "$(GREEN)Running containers:$(NC)"
	docker-compose ps

docker-clean: docker-down ## Clean Docker resources
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✓ Docker cleaned$(NC)"

docker-rebuild: docker-clean docker-build docker-up ## Rebuild and restart containers
	@echo "$(GREEN)✓ Docker rebuild complete$(NC)"

##@ Deployment

deploy-staging: build test ## Deploy to staging
	@echo "$(GREEN)Deploying to staging...$(NC)"
	npm run deploy:staging

deploy-production: build test ## Deploy to production
	@echo "$(GREEN)Deploying to production...$(NC)"
	@read -p "Are you sure you want to deploy to production? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npm run deploy:production; \
		echo "$(GREEN)✓ Deployed to production$(NC)"; \
	else \
		echo "$(YELLOW)Deployment cancelled$(NC)"; \
	fi

##@ Monitoring

logs: ## View application logs
	@echo "$(GREEN)Application logs:$(NC)"
	@tail -f logs/*.log 2>/dev/null || echo "No logs found"

logs-error: ## View error logs only
	@echo "$(RED)Error logs:$(NC)"
	@tail -f logs/error.log 2>/dev/null || echo "No error logs found"

health-check: ## Check application health
	@echo "$(GREEN)Running health check...$(NC)"
	@curl -f http://localhost:3001/health || echo "$(RED)Health check failed$(NC)"

monitor: ## Start monitoring dashboard
	@echo "$(GREEN)Starting monitoring...$(NC)"
	node setup-monitoring.js

##@ Git Operations

git-status: ## Show git status
	@git --no-pager status

git-branches: ## List all branches
	@git --no-pager branch -a

git-clean: ## Clean untracked files (dry run)
	@echo "$(YELLOW)Files that would be removed:$(NC)"
	@git clean -nfd

git-clean-force: ## Clean untracked files (force)
	@echo "$(RED)Removing untracked files...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		git clean -fd; \
		echo "$(GREEN)✓ Cleaned$(NC)"; \
	fi

##@ Automation

automation-test: ## Test automation systems
	@echo "$(GREEN)Testing automation...$(NC)"
	npm run automation:app-test

automation-round: ## Run automation round
	@echo "$(GREEN)Running automation round...$(NC)"
	npm run automation:round

automation-master: ## Run master automation
	@echo "$(GREEN)Running master automation...$(NC)"
	npm run automation:master

cursor-agent: ## Launch Cursor AI agent
	@echo "$(GREEN)Launching Cursor agent...$(NC)"
	npm run cursor:launch-agent

##@ Cleanup

clean: ## Remove build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist/ dist-electron/ .vite/ build/
	@echo "$(GREEN)✓ Build artifacts cleaned$(NC)"

clean-deps: ## Remove node_modules
	@echo "$(YELLOW)Cleaning dependencies...$(NC)"
	rm -rf node_modules/
	@echo "$(GREEN)✓ Dependencies cleaned$(NC)"

clean-cache: ## Clear npm cache
	@echo "$(YELLOW)Cleaning cache...$(NC)"
	npm cache clean --force
	@echo "$(GREEN)✓ Cache cleaned$(NC)"

clean-logs: ## Remove log files
	@echo "$(YELLOW)Cleaning logs...$(NC)"
	rm -rf logs/*.log
	@echo "$(GREEN)✓ Logs cleaned$(NC)"

clean-all: clean clean-deps clean-cache clean-logs ## Clean everything
	@echo "$(GREEN)✓ All cleaned$(NC)"

##@ Utilities

update-deps: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	npm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

check-deps: ## Check for outdated dependencies
	@echo "$(GREEN)Checking dependencies...$(NC)"
	npm outdated

generate-docs: ## Generate documentation
	@echo "$(GREEN)Generating documentation...$(NC)"
	npm run docs:api:generate
	npm run docs:architecture:generate

changelog: ## Generate changelog
	@echo "$(GREEN)Generating changelog...$(NC)"
	npm run changelog:generate

setup-env: ## Setup environment file
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Creating .env file...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env created. Please update with your values.$(NC)"; \
	else \
		echo "$(YELLOW).env already exists$(NC)"; \
	fi

##@ Quick Workflows

quick-start: install setup-env db-create db-migrate blockchain-start dev-full ## Quick start everything
	@echo "$(GREEN)✓ Quick start complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Access points:$(NC)"
	@echo "  Frontend:   http://localhost:3000"
	@echo "  API:        http://localhost:3001"
	@echo "  Blockchain: http://localhost:8545"

quick-test: lint type-check test ## Quick test (lint + type-check + test)
	@echo "$(GREEN)✓ Quick test complete$(NC)"

quick-deploy: quality test build ## Quick deploy workflow
	@echo "$(GREEN)✓ Ready for deployment$(NC)"

reset-dev: dev-stop clean-all install db-reset blockchain-start dev-full ## Reset development environment
	@echo "$(GREEN)✓ Development environment reset$(NC)"

##@ CI/CD

ci-test: install lint type-check test-coverage ## CI test workflow
	@echo "$(GREEN)✓ CI tests passed$(NC)"

ci-build: install build ## CI build workflow
	@echo "$(GREEN)✓ CI build complete$(NC)"

ci-deploy: ci-test ci-build ## Complete CI/CD workflow
	@echo "$(GREEN)✓ CI/CD complete$(NC)"
