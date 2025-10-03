# LightDom Blockchain Platform - GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information here is incomplete or found to be in error.**

## Working Effectively

### Bootstrap and Dependency Installation

- **CRITICAL**: Use corepack and yarn for dependency management:
  ```bash
  corepack enable
  yarn install
  ```
- **ALTERNATIVE**: If yarn fails due to lockfile conflicts, use npm with legacy peer deps:
  ```bash
  npm install --legacy-peer-deps --ignore-scripts
  ```
- **DEPENDENCY CONFLICTS**: This project has known peer dependency conflicts with:
  - chai versions (project uses 6.0.1, hardhat-toolbox needs ^4.2.0)
  - prom-client versions (project uses 15.1.3, prometheus-api-metrics needs <15.0.0)
  - Missing hardhat toolbox peer dependencies

### Build Process

- **CRITICAL - NEVER CANCEL**: Build can take 15+ minutes. Set timeout to 30+ minutes:
  ```bash
  # TypeScript compilation has known issues - build will fail
  npm run build  # Timeout: 30 minutes - EXPECT FAILURE
  ```
- **BUILD ISSUES**: The build currently fails due to:
  - TypeScript configuration conflicts with .d.ts files
  - Missing imports and unresolved dependencies (@/hooks/useBlockchain, react-router-dom)
  - 964+ TypeScript errors across 97 files
- **WORKAROUND**: Use development mode instead of full build:
  ```bash
  npm run dev  # Starts Vite dev server - EXPECT IMPORT ERRORS
  ```

### Testing Infrastructure

- **NEVER CANCEL**: Test suites can take 10-20 minutes. Set timeout to 30+ minutes.
- **Testing commands that DON'T work due to dependency issues**:
  ```bash
  npm run test          # FAILS - Rollup module issues
  npm run test:run      # FAILS - Missing @rollup/rollup-linux-x64-gnu
  npm run test:coverage # FAILS - Vitest dependency issues
  ```
- **Testing commands that MAY work** (with external dependencies):
  ```bash
  npm run test:api           # Requires PostgreSQL - Timeout: 30 minutes
  npm run test:blockchain    # Requires PostgreSQL + Anvil - Timeout: 30 minutes
  npm run test:contracts     # Requires Foundry - Timeout: 20 minutes
  npm run test:integration   # Requires full stack - Timeout: 60 minutes
  ```

### Development Servers

- **API Server**: Requires PostgreSQL database:
  ```bash
  npm run api  # FAILS without PostgreSQL on port 5432
  ```
- **Frontend Dev Server**: Has import resolution issues:
  ```bash
  npm run dev  # Starts on port 3000 but has import errors
  ```
- **Complete System**: Requires all dependencies:
  ```bash
  npm run start            # FAILS - needs PostgreSQL + blockchain setup
    npm run blockchain       # FAILS - needs external dependencies
    npm run automation       # FAILS - needs full environment
  ```

### Configuration Requirements

- **Database**: PostgreSQL 13+ on localhost:5432
  ```bash
  # Required for API server and most functionality
  docker run -d --name postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 postgres
  ```
- **Blockchain**: Anvil/Hardhat node on localhost:8545
  ```bash
  # Required for blockchain functionality
  anvil --host 0.0.0.0 --port 8545
  ```
- **Environment**: Copy and configure .env file:
  ```bash
  cp .env .env.local  # Edit DATABASE_URL and blockchain settings
  ```

## Code Quality and Validation

### Linting and Formatting

- **Linting**: Currently broken due to missing TypeScript ESLint dependencies:
  ```bash
  npm run lint      # FAILS - missing @typescript-eslint/recommended config
  npm run lint:fix  # FAILS - missing @typescript-eslint dependencies
  ```
- **Formatting**: Prettier has syntax errors in codebase:
  ```bash
  npm run format        # FAILS - multiple syntax errors in files
  npm run format:check  # FAILS - formatting issues detected
  ```
- **Type Checking**: Currently broken due to config issues:
  ```bash
  npm run type-check  # FAILS - .d.ts conflicts and missing references
  ```

### Pre-commit Validation

- **CRITICAL**: Standard quality checks currently broken due to dependency issues:
  ```bash
  npm run precommit     # FAILS - depends on broken lint/format commands
  ```
- **WORKING ALTERNATIVES**:
  ```bash
  # Syntax validation (works)
  node --check path/to/your/file.js
  
  # Manual review of changes
  git diff HEAD~1..HEAD
  ```

## Architecture Overview

### Key Components

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js API server with PostgreSQL
- **Blockchain**: Ethereum smart contracts with Hardhat/Foundry
- **Chrome Extension**: Manifest V3 extension for DOM mining
- **Testing**: Vitest + Jest + Mocha + Playwright (multiple test frameworks)

### File Structure

```
LightDom/
├── src/                           # Main source code
│   ├── components/               # React components
│   ├── api/                      # API endpoints
│   ├── core/                     # Business logic
│   ├── services/                 # Service layer
│   └── framework/                # Framework components
├── extension/                    # Chrome extension
├── contracts/                    # Smart contracts
├── test/                         # Test suites
├── scripts/                      # Build and deployment scripts
├── api-server-express.js         # Main API server
├── start-blockchain.js           # Blockchain startup
└── start-complete-system.js      # Full system startup
```

### Access Points (when running)

- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Blockchain API**: http://localhost:3001/api/blockchain
- **Metrics**: http://localhost:3001/metrics
- **Health Check**: http://localhost:3001/api/health

## Validation Scenarios

### Manual Testing After Changes

1. **Dependency Installation Test**:

   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --ignore-scripts
   ```

2. **Syntax Validation**:

   ```bash
   node --check api-server-express.js
   node --check start-blockchain.js
   node --check start-complete-system.js
   ```

3. **Configuration Test**:
   ```bash
   npm run lint:fix  # Should complete without errors
   npm run format    # Should complete without errors
   ```

## Known Issues and Workarounds

### Critical Blockers

1. **Build System**: TypeScript compilation fails with 964+ errors
2. **Testing**: Vitest fails due to missing native Rollup modules
3. **Dependencies**: Peer dependency conflicts prevent clean installation
4. **External Dependencies**: Requires PostgreSQL, Redis, and blockchain node

### Workarounds

1. **For Development**: Use `npm run dev` despite import errors
2. **For Testing**: Focus on syntax validation with `node --check`
3. **For Dependencies**: Use `--legacy-peer-deps` and `--ignore-scripts` flags
4. **For Build**: Skip TypeScript compilation, use development mode

### Environmental Requirements

- **Node.js**: 18+ (project configured for Node 18)
- **PostgreSQL**: 13+ running on port 5432
- **Package Manager**: Yarn 4.9.4 (via corepack) or npm with legacy flags
- **Artillery**: Requires Node 22+ (current limitation with Node 20)

## Development Workflow

### Making Changes

1. **ALWAYS validate syntax first**:

   ```bash
   node --check path/to/your/file.js
   ```

2. **Skip broken quality checks**:

   ```bash
   # These commands currently fail due to dependency issues:
   # npm run lint:fix  # FAILS - missing @typescript-eslint dependencies  
   # npm run format    # FAILS - syntax errors in codebase
   
   # Use manual code review instead
   git diff HEAD~1..HEAD
   ```

3. **Test in development mode** (expect import errors):

   ```bash
   npm run dev
   ```

4. **Validate critical entry points**:
   ```bash
   node --check api-server-express.js
   ```

### CI/CD Expectations

- **CI Pipeline**: Comprehensive with pre-commit, pre-merge, and pre-deployment gates
- **Quality Gates**: Linting, formatting, type checking, security scans
- **Testing**: Multiple test suites (unit, integration, e2e, performance)
- **Deployment**: Staging and production environments with health checks

### Security and Compliance

- **Security Scanning**: Snyk, Semgrep, CodeQL integration
- **Compliance**: Architecture validation and quality gates
- **Authentication**: JWT, 2FA, WebAuthn support built-in

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Use `--legacy-peer-deps` during installation
2. **TypeScript errors**: Expected - focus on JavaScript syntax validation
3. **Database connection errors**: Ensure PostgreSQL is running on port 5432
4. **Import resolution errors**: Use development mode, avoid full build
5. **Test failures**: Most test commands currently fail due to dependency issues

### Debug Commands

```bash
# Check syntax without running
node --check filename.js

# Verbose npm install
npm install --legacy-peer-deps --verbose

# Check process availability
lsof -i :3000  # Check if port is in use
lsof -i :3001  # Check API port
lsof -i :5432  # Check PostgreSQL port
```

---

**REMEMBER**: This is a complex, feature-rich codebase with known dependency conflicts. Focus on making minimal, surgical changes rather than attempting to fix the entire build system. Always validate syntax and use development mode for testing changes.