# LightDom Project Structure

Last Updated: 2025-10-22

## Overview

LightDom is a blockchain-based DOM optimization platform combining Web3 technology, web crawling, machine learning, and real-time monitoring.

## Directory Structure

```
LightDom/
├── src/                      # Main application source code (265 files)
│   ├── api/                  # API clients (blockchain, billing, storage)
│   ├── components/           # React UI components
│   ├── services/             # Business logic and integrations
│   ├── seo/                  # SEO analysis and ML models
│   ├── apps/                 # Headless CLI, browser demo, PWA
│   ├── core/                 # Framework foundations
│   ├── automation/           # Automation utilities
│   ├── mcp/                  # Model Context Protocol servers
│   ├── hooks/                # React custom hooks
│   ├── routes/               # React Router configuration
│   └── utils/                # Helper functions
│
├── backend/                  # Separate Express backend service
│   ├── src/                  # Backend source code
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # Backend TypeScript config
│
├── frontend/                 # Separate Vite frontend build
│   ├── src/                  # Frontend source code
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # Frontend TypeScript config
│
├── contracts/                # Solidity smart contracts (16 files)
│   ├── DOMSpaceToken.sol
│   ├── EthereumBridge.sol
│   ├── PolygonBridge.sol
│   ├── SEODataMining.sol
│   └── ProofOfOptimization.sol
│
├── tests/                    # Consolidated test suite (TypeScript)
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
│
├── scripts/                  # Build and deployment scripts
│   └── automation/           # Automation scripts (59 files)
│
├── monitoring/               # Prometheus & Grafana configs (21 files)
│   ├── prometheus/
│   ├── grafana/
│   └── dashboards/
│
├── docs/                     # Documentation (14 files)
│   └── reports/              # Generated automation reports
│
├── database/                 # Database configurations (7 files)
│   ├── schema.sql
│   └── migrations/
│
├── config/                   # Environment configs (13 files)
│
├── deployment/               # Deployment configurations (3 files)
│
├── security/                 # Security policies (3 files)
│
├── utils/                    # Shared utility functions (7 files)
│
├── crawler/                  # Web crawler module
│   └── RealWebCrawlerSystem.js
│
├── workflows/                # GitHub Actions CI/CD (6 files)
│
├── archive/                  # Archived/deprecated files
│   ├── backups/              # Old backup snapshots
│   ├── scripts/              # Deprecated start scripts
│   ├── unused-api-servers/   # Old API server versions
│   ├── config-legacy/        # Old configuration files
│   └── test-legacy/          # Old JavaScript test suite
│
├── .data/                    # Runtime data files (gitignored)
│   └── crawler-data.json
│
└── [Root Configuration Files]
    ├── package.json           # Main project dependencies
    ├── tsconfig.json          # Root TypeScript config
    ├── hardhat.config.ts      # Hardhat blockchain config
    ├── vite.config.ts         # Vite build config
    ├── vitest.config.js       # Vitest test config
    ├── .eslintrc.json         # ESLint config
    ├── .prettierrc            # Prettier config
    ├── tailwind.config.js     # Tailwind CSS config
    └── docker-compose.yml     # Docker services
```

## Technology Stack

### Frontend
- **Framework:** React 19.1.1 + TypeScript 5.9.2
- **Build Tool:** Vite 7.1.9
- **Styling:** TailwindCSS 4.1.14, Ant Design 5.27.4
- **Routing:** React Router 6.30.1
- **Real-time:** Socket.io-client 4.8.1

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4.18.2
- **Database:** PostgreSQL + Redis
- **WebSocket:** Socket.io 4.8.1
- **Logging:** Winston 3.18.3

### Blockchain
- **Development:** Hardhat 3.0.6
- **Library:** Ethers.js 6.15.0
- **Solidity:** 0.8.20
- **Networks:** Ethereum, Polygon, Local

### Web Scraping & ML
- **Crawler:** Puppeteer 24.23.0
- **Parser:** Cheerio 1.1.2
- **ML:** TensorFlow.js 4.22.0
- **Integration:** Browserbase

### Testing & Monitoring
- **Unit/Integration:** Vitest
- **E2E:** Playwright
- **Load Testing:** Artillery
- **Metrics:** Prometheus + Grafana

### DevOps
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Desktop:** Electron 38.1.2

## Startup Scripts

The project includes several startup modes in `package.json`:

### Development
```bash
npm run start:dev         # Quick dev start (API + Frontend + Electron)
npm run dev               # Frontend only (Vite dev server)
```

### Production
```bash
npm start                 # Full system with all services
npm run start:complete    # Complete system with monitoring
npm run start:blockchain  # Blockchain-focused mode
npm run start:docker      # Docker containerized mode
```

### Build & Deploy
```bash
npm run build             # TypeScript + Vite production build
npm run electron:build    # Build desktop app
npm run dist              # Build and package Electron app
```

### Testing
```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests with coverage
npm run test:e2e          # End-to-end tests
npm run test:load         # Load testing with Artillery
```

## API Servers

### Production API Server
- **File:** `api-server-express.js` (188KB, 5,849 lines)
- **Features:** WebSocket, PostgreSQL, Redis, Blockchain integration
- **Port:** 3001
- **Used by:** `start:blockchain`, `start:complete`

### Development API Server
- **File:** `simple-api-server.js` (5.3KB, 201 lines)
- **Features:** Mock data, quick startup
- **Port:** 3001
- **Used by:** `start:dev`, `start:docker`

## Key Entry Points

- **Main App:** `src/main.tsx` (React entry)
- **API Server:** `api-server-express.js` or `simple-api-server.js`
- **Electron:** `electron/main.cjs`
- **Web Crawler:** `web-crawler-service.js`
- **Blockchain Runner:** `start-blockchain.js`

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom_blockchain
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
NETWORK=localhost
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key

# Services
PORT=3001
FRONTEND_URL=http://localhost:3000
METRICS_ENABLED=true
```

## Archive Directory

The `archive/` directory contains deprecated files that were part of the project cleanup on 2025-10-22:

- **backups/**: Old backup snapshots (backup_20251005_172710)
- **scripts/**: 8 deprecated startup scripts
- **unused-api-servers/**: Old API server implementations
- **config-legacy/**: Deprecated configuration files
- **test-legacy/**: Old JavaScript test suite

These files are preserved for reference but are not actively used.

## Recent Cleanup (2025-10-22)

### Changes Made:
1. ✅ Moved old backups to `archive/backups/`
2. ✅ Consolidated test directories into `tests/`
3. ✅ Moved 8 unreferenced start scripts to `archive/scripts/`
4. ✅ Moved unused API servers to `archive/unused-api-servers/`
5. ✅ Moved generated reports to `docs/reports/`
6. ✅ Moved runtime data to `.data/` directory
7. ✅ Removed duplicate Hardhat config (kept TypeScript version)
8. ✅ Updated `.gitignore` with new exclusions

### File Count Reduction:
- **Before:** 671 files
- **After:** ~620 files (51 files archived)

### Active Start Scripts (5 total):
- `start-lightdom-complete.js`
- `start-dev.js`
- `start-docker.js`
- `start-complete-system.js`
- `start-blockchain-app.js`

## Contributing

When adding new features:
1. Place source code in appropriate `src/` subdirectory
2. Add tests in `tests/unit/` or `tests/integration/`
3. Update this document if adding new major directories
4. Use existing start scripts rather than creating new ones
5. Keep configuration files at root level

## Support

- Issues: GitHub Issues
- Documentation: `/docs` directory
- Reports: `/docs/reports` for automation reports
