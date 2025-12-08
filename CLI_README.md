# LightDom CLI & Development Guide

A comprehensive guide to using the LightDom CLI and development tools for the best developer experience.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git
- PostgreSQL 13+ (optional)

### One-Line Setup
```bash
./scripts/setup-dev-environment.sh
```

### Manual Setup
```bash
# Clone and install
git clone <repository-url>
cd LightDom
npm install --legacy-peer-deps

# Setup environment
cp automation.env .env

# Setup development tools
chmod +x bin/lightdom
npx husky install

# Start developing
npm run dev
```

## 🔧 LightDom CLI

The LightDom CLI provides a unified interface for all development tasks.

### Installation
The CLI is available once you install dependencies:
```bash
# Use directly
node bin/lightdom --help

# Or add to PATH for global usage
npm link
lightdom --help
```

### Core Commands

#### Development
```bash
# Start development environment
lightdom dev                    # Start full stack
lightdom dev --api-only         # API server only
lightdom dev --frontend-only    # Frontend only
lightdom dev --port 4000        # Custom port

# Build application
lightdom build                  # Production build
lightdom build --mode development  # Development build
lightdom build --analyze       # Analyze bundle size
lightdom build --clean         # Clean before build
```

#### Testing
```bash
lightdom test                   # Run all tests
lightdom test --unit           # Unit tests only
lightdom test --integration    # Integration tests only
lightdom test --e2e            # End-to-end tests only
lightdom test --coverage       # With coverage report
lightdom test --watch          # Watch mode
```

#### Project Management
```bash
# Initialize new project
lightdom init                   # Interactive setup
lightdom init --template basic # Use template
lightdom init --name my-project # Set project name

# Generate code
lightdom generate component MyComponent
lightdom g component MyComponent --styled
lightdom g service MyService --type blockchain
lightdom g service ApiService --type api
```

#### Automation & Blockchain
```bash
# Automation management
lightdom automation --start    # Start automation system
lightdom automation --stop     # Stop automation system
lightdom automation --status   # Check status
lightdom automation --debug    # Debug mode

# Blockchain operations
lightdom blockchain --deploy   # Deploy contracts
lightdom blockchain --test     # Test contracts
lightdom blockchain --network testnet  # Use specific network
```

#### Deployment
```bash
lightdom deploy                 # Deploy to staging
lightdom deploy --env production    # Deploy to production
lightdom deploy --dry-run      # Dry run deployment
lightdom deploy --rollback     # Rollback deployment
```

#### System Management
```bash
# Environment setup
lightdom setup                  # Full setup
lightdom setup --fresh         # Fresh installation
lightdom setup --deps          # Dependencies only
lightdom setup --db            # Database only

# Health & diagnostics
lightdom health                 # System health check
lightdom health --verbose      # Detailed health info
lightdom doctor                 # Diagnose issues
lightdom doctor --fix          # Auto-fix issues
```

## 📦 NPM Scripts Reference

### Development Scripts
```bash
npm run dev                     # Start development server (Vite)
npm run start:dev              # Start framework development
npm run dev:all                # Start all services concurrently
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Testing Scripts
```bash
npm run test                    # Run all tests (Vitest)
npm run test:unit              # Unit tests with Jest
npm run test:integration       # Integration tests with Mocha
npm run test:e2e               # End-to-end tests with Playwright
npm run test:coverage          # Test coverage report
npm run test:watch             # Watch mode testing
npm run test:all               # All test suites
```

### Quality Assurance
```bash
npm run lint                   # ESLint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Prettier formatting
npm run format:check           # Check formatting
npm run type-check             # TypeScript type checking
npm run security:scan          # Security audit
```

### Blockchain & Automation
```bash
npm run automation             # Start blockchain automation
npm run automation:dev         # Development mode
npm run automation:debug       # Debug mode
npm run automation:dry-run     # Dry run mode
npm run blockchain             # Blockchain operations
npm run test:contracts         # Test smart contracts
```

### Deployment & Monitoring
```bash
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production
npm run monitor:start          # Start monitoring
npm run health:check           # Health check
npm run doctor                 # System diagnostics
```

### CLI Shortcuts
```bash
npm run cli -- --help          # CLI help
npm run health                 # Health check via CLI
npm run setup:hooks            # Setup Git hooks
npm run setup:env             # Setup environment
```

## 🔄 Development Workflow

### Daily Development
```bash
# 1. Check system health
lightdom health

# 2. Start development
lightdom dev

# 3. Generate components as needed
lightdom g component NewFeature
lightdom g service DataService

# 4. Run tests frequently
lightdom test --watch

# 5. Pre-commit (automatic with hooks)
npm run precommit
```

### Git Hooks Integration

Pre-commit hooks automatically run:
- Code formatting check
- ESLint
- TypeScript type checking
- Unit tests

Pre-push hooks run:
- Integration tests
- Security audit

### Environment Management

```bash
# Setup new environment
lightdom setup --fresh

# Check configuration
lightdom health --verbose

# Fix common issues
lightdom doctor --fix
```

## 🚀 Automation Features

### Blockchain Automation
```bash
# Start automation system
lightdom automation --start

# Monitor automation status
lightdom automation --status

# Debug automation issues
lightdom automation --debug
```

### Code Generation
```bash
# React components
lightdom g component UserProfile --styled
lightdom g component DataTable --type functional

# Services
lightdom g service PaymentService --type api
lightdom g service ContractService --type blockchain
lightdom g service CrawlerService --type automation
```

### Deployment Automation
```bash
# Automated deployment with checks
lightdom deploy --env staging

# Production deployment with confirmation
lightdom deploy --env production

# Rollback if needed
lightdom deploy --rollback --env production
```

## 🐛 Troubleshooting

### Common Issues

**Dependencies fail to install**
```bash
lightdom doctor --fix
# or
npm install --legacy-peer-deps
```

**TypeScript errors**
```bash
npm run type-check
lightdom doctor
```

**Tests failing**
```bash
lightdom test --verbose
lightdom health
```

**Automation not starting**
```bash
lightdom automation --status
lightdom doctor --fix
```

### Health Check
```bash
# Full system health check
lightdom health --verbose

# This checks:
# - Node.js version
# - Dependencies
# - Environment configuration
# - Database connection
# - Blockchain RPC
# - Service status
```

### Doctor Tool
```bash
# Diagnose and fix issues automatically
lightdom doctor --fix

# This can fix:
# - Missing dependencies
# - Missing environment files
# - Outdated packages
# - Lint errors
# - Missing build files
```

## 🎯 Best Practices

### Development
1. Always run `lightdom health` before starting work
2. Use `lightdom dev` for development instead of individual npm scripts
3. Generate code with CLI to maintain consistency
4. Run tests in watch mode during development

### Code Quality
1. Pre-commit hooks ensure code quality
2. Use `lightdom doctor --fix` to resolve common issues
3. Regular security audits with `npm run security:scan`
4. Type checking with `npm run type-check`

### Deployment
1. Always test with `--dry-run` first
2. Use staging environment before production
3. Monitor health after deployment
4. Keep rollback plan ready

## 📚 Additional Resources

- [Automation README](./AUTOMATION_README.md) - Detailed automation system documentation
- [Blockchain README](./BLOCKCHAIN_README.md) - Blockchain development guide
- [API Documentation](./docs/) - Complete API reference
- [VSCode Workspace](./.vscode/lightdom.code-workspace) - Optimized development environment

---

**Happy coding with LightDom! 🚀**