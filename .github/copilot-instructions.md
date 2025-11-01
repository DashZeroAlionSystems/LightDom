## LightDom — AI Agent Instructions

This file contains focused, repo-specific guidance to help AI coding agents be immediately productive in this blockchain-based DOM optimization platform.

### 🎯 Quick Orientation
- **Purpose**: Full-stack DOM optimization platform with blockchain mining, React PWA, Express API, web crawler, and Ethereum smart contracts
- **Core Entry Points**: 
  - `src/main.tsx` → React frontend (port 3000)
  - `api-server-express.js` → Express API (port 3001, 8k+ LOC)
  - `dom-harvesting-engine.js` → Core DOM analysis algorithms
  - `contracts/` → 19+ Solidity contracts including DOMSpaceToken, ProofOfOptimization

### 🚀 Development Workflows

#### Fast Start Options
```bash
# Frontend only (fastest)
npm run dev

# Full stack (recommended for development)
make dev-full                    # Uses Makefile
npm run cli dev --full          # Uses CLI tool
npm run start:dev               # Direct npm script

# Blockchain development
npm run blockchain:start        # Hardhat local node
npm run testnet:start          # Custom testnet
```

#### DevContainer (Recommended)
- Use `.devcontainer/` for consistent environment with Node 20, PostgreSQL, Redis, Foundry
- Pre-configured VS Code extensions and tools
- See `.devcontainer/README.md` for GitHub Codespaces/VS Code setup

### 🧪 Testing & Quality Validation

#### Functionality Testing (Critical)
```bash
npm run compliance:check        # Tests actual functionality, not just structure
npm run test:enhanced          # Enhanced integration tests
npm run automation:app-test    # App startup validation
```

#### Standard Testing
- **Unit Tests**: `npm run test:unit` (Vitest, 80% coverage required)
- **Integration**: `npm run test:integration` (real DB/blockchain connections)
- **Type Check**: `npm run type-check` (strict TypeScript)
- **Lint/Format**: `npm run lint && npm run format:check`

### 🏗️ Architecture Patterns

#### Multi-Service System
- **API Server**: Express.js with WebSocket (Socket.IO), PostgreSQL, Redis
- **Frontend**: React 18 + Ant Design + Tailwind, PWA capabilities
- **Blockchain**: Hardhat + ethers.js, custom mining algorithms
- **Crawler**: Puppeteer-based with DOM optimization algorithms
- **Desktop**: Electron with enhanced main process (`electron/main-enhanced.cjs`)

#### Key Integrations
- **Database**: PostgreSQL with connection pooling, health checks via `/api/db/health`
- **Blockchain**: Real-time mining system with performance metrics
- **WebSocket**: Live updates for mining stats, crawler progress, metaverse bridge data
- **Admin System**: Comprehensive dashboard with analytics (`scripts/start-admin-system.js`)

### 💼 Project-Specific Conventions

#### TypeScript Configuration
- **Strict Mode**: Disabled for rapid prototyping (`"strict": false`)
- **Path Aliases**: `@/` maps to `src/`, extensive path mapping configured
- **Module Resolution**: Bundler mode with ESNext modules
- **Build Target**: ES2020 with React JSX transform

#### Component Architecture
- **React**: Functional components + hooks only, located in `src/components/`
- **UI System**: Ant Design + Discord-inspired theme (`src/discord-theme.css`)
- **State Management**: Context API (`src/contexts/EnhancedAuthContext`)
- **Routing**: React Router v6 with protected routes

#### Smart Contract Patterns
- **Standards**: OpenZeppelin-based, 19 contracts in `contracts/`
- **Key Contracts**: `DOMSpaceToken.sol`, `ProofOfOptimization.sol`, `MetaverseMarketplace.sol`
- **Testing**: Hardhat framework with deployment scripts in `scripts/`
- **Networks**: Local hardhat node, custom testnet, production deployment ready

### 🔧 Advanced Developer Tools

#### CLI System
```bash
npm run cli --help              # Comprehensive CLI with setup, dev, test commands
npm run cli setup              # Complete environment setup
npm run cli db migrate         # Database operations
```

#### Automation Framework
- **Location**: `scripts/automation/` (50+ automation scripts)
- **Key Scripts**: `functionality-test.js`, `autopilot.js`, `master-automation.js`
- **Orchestration**: `orchestrator.js` for complex workflows
- **Monitoring**: `monitoring-system.js` for real-time system health

#### Admin & Monitoring
```bash
npm run admin:start            # Start comprehensive admin dashboard
npm run admin:status           # Check system status
npm run monitoring:start       # Start monitoring system
```

### 🔒 Security & Environment

#### Environment Variables
- **Database**: `DATABASE_URL`, `DB_*` connection settings
- **Blockchain**: `ETHEREUM_RPC_URL`, `ADMIN_PRIVATE_KEY`, contract addresses
- **API**: Various API keys for external integrations
- **Security**: Never commit secrets, use `.env` files

#### Code Quality Gates
- **Pre-commit**: ESLint, Prettier, type checking, unit tests
- **CI Requirements**: Real functionality tests (not mocks), 80% coverage
- **Security**: Helmet, CORS, rate limiting in API server

### 📁 Critical Files for Context

#### Core Runtime
- `api-server-express.js` → Main API server (8k+ lines, WebSocket, DB integration)
- `src/App.tsx` → Main React app with routing and auth
- `dom-harvesting-engine.js` → DOM analysis algorithms and space quantification

#### Configuration
- `vite.config.ts` → Frontend build (proxy to :3001, path aliases, chunking)
- `tsconfig.json` → TypeScript config (bundler mode, strict: false)
- `package.json` → 100+ npm scripts for all workflows
- `Makefile` → 400+ lines of development commands

#### Development Environment
- `.cursorrules` → Comprehensive coding standards and enterprise workflows
- `.devcontainer/` → Complete containerized development environment
- `scripts/automation/` → Extensive automation and testing framework

### 🎯 Agent Behavior Guidelines

1. **Functionality First**: Always run `npm run compliance:check` to validate real functionality
2. **Multi-Service Awareness**: Changes often affect frontend, API, and blockchain simultaneously
3. **Environment Consistency**: Prefer devcontainer for complex development
4. **Testing Requirements**: Tests must validate actual service connectivity, not mocks
5. **Documentation**: Update both inline docs and relevant README files
6. **Security**: Use environment variables, never hardcode secrets or private keys

### 🚨 Common Patterns & Gotchas

- **API Proxy**: Frontend (:3000) proxies `/api` to backend (:3001) via Vite config
- **Electron Development**: Uses enhanced main process with comprehensive preload scripts
- **Database Connections**: Connection pooling configured, health checks available
- **Blockchain Integration**: Real mining algorithms, not simulation - test with local hardhat node
- **Admin Dashboards**: Multiple admin interfaces for different system aspects
- **CLI Workflows**: Extensive CLI tooling for setup, development, and deployment

This platform emphasizes real functionality over mocks, comprehensive automation, and enterprise-grade development workflows.
