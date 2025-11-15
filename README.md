# LightDom - Blockchain-Based DOM Optimization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🌟 Overview

LightDom is a revolutionary blockchain-based DOM optimization platform that combines web crawling, optimization algorithms, blockchain mining, and metaverse integration into a unified ecosystem. The platform enables users to optimize websites, earn rewards through blockchain mining, and participate in a decentralized metaverse economy.

## ✨ Key Features

### 🔗 **Blockchain Integration**
- **Proof of Optimization Mining** - Mine blocks based on website optimization results
- **Real-time Health Monitoring** - Continuous blockchain network monitoring
- **Performance Metrics** - Hash rate, block time, and mining statistics
- **Reward System** - Earn LightDom tokens for optimization contributions

### 🤖 **Workflow Prompt System** ⭐ NEW
- **AI Workflow Assistant** - Create complex workflows with natural language prompts
- **Intelligent Visualization** - Card panels with accordion steps for workflow details
- **Real-time Updates** - WebSocket connection for live workflow status
- **DeepSeek Component Generation** - AI-powered component generation from Storybook
- **Continuous Styleguide Mining** - Automatic design token and pattern discovery
- **Context-Aware Navigation** - Role-based menus and quick access to recent items

### 🧠 **LangChain + Ollama DeepSeek Integration** ⭐ NEW
- **AI Chat Assistant** - Context-aware conversations with session management
- **Code Generation** - Generate code in 7+ languages with AI assistance
- **Workflow Automation** - Convert natural language to structured workflows
- **DOM Optimization** - AI-powered performance analysis and recommendations
- **Multi-Agent Systems** - Coordinate multiple AI agents for complex tasks
- **Custom Chains** - Flexible prompt engineering with LangChain
- **REST API** - 15+ endpoints for all AI operations
- **React Dashboard** - Full-featured UI for AI interactions
- **Streaming Support** - Real-time token streaming via Server-Sent Events

📖 **[Quick Start Guide](LANGCHAIN_QUICKSTART.md)** | **[Full Documentation](LANGCHAIN_OLLAMA_INTEGRATION_GUIDE.md)** | **[Implementation Summary](LANGCHAIN_INTEGRATION_SUMMARY.md)** | **[Examples](examples/langchain-ollama-examples.js)**

```bash
# Get started in 3 commands
ollama pull deepseek-r1:latest        # 1. Install DeepSeek model
npm run api                            # 2. Start API server
npm run langchain:test                 # 3. Test integration
```

### Testing & Quality Assurance
- **Integration Testing**: Comprehensive test suite for all platform components
- **Workflow Simulation**: End-to-end user workflow testing
- **Error Handling**: Centralized error management and validation
- **Performance Monitoring**: Real-time performance metrics and alerts
- **Automatic Retry Mechanism**: GitHub Actions workflows with intelligent retry logic for transient failures

### 💰 **Comprehensive Wallet System**
- **Multi-currency Support** - LightDom, USD, BTC, ETH balances
- **Transaction Management** - Complete transaction history
- **Marketplace Integration** - Purchase optimization tools and services
- **Transfer System** - Send funds between users

### 🌉 **Metaverse Dashboard**
- **Bridge Network** - Visualize and manage bridge connections
- **Chat System** - Real-time messaging across metaverse
- **Economy Tracking** - Monitor metaverse economic activity
- **Portal Management** - Manage metaverse portals and connections

### 📱 **Progressive Web App (PWA)**
- **Offline Support** - Work without internet connection
- **Push Notifications** - Real-time system alerts
- **Background Sync** - Automatic data synchronization
- **App Shortcuts** - Quick access to key features

### 🎨 **Modern UI/UX**
- **Discord-style Theme** - Familiar and intuitive interface
- **Design System** - Consistent components and animations
- **Responsive Design** - Works on all devices
- **Dark Mode** - Easy on the eyes

### 🤖 **Background Data Mining System** ⭐ NEW
- **AI-Powered Configuration** - Generate crawler configs from natural language prompts using Ollama (DeepSeek-R1, Llama3)
- **Smart URL Deduplication** - Intelligent caching with selective re-mining based on schema versions
- **Attribute-Based Mining** - Break down data extraction into prioritized, independent tasks
- **Schema-Linked Workflows** - Mining jobs tied to workflows, processes, and tasks for full traceability
- **Real-Time CLI Monitoring** - Watch mining progress live from terminal with rich status displays
- **Multi-Worker Architecture** - Concurrent crawling with configurable worker pools for optimal performance
- **Neural Network Training Data** - Collect structured data for ML model training

📖 **[Quick Start Guide](MINING_QUICKSTART.md)** | **[Full Documentation](MINING_SYSTEM_README.md)** | **[Research & Best Practices](CRAWLER_RESEARCH.md)** | **[GPU & Performance Research](GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md)** | **[Quick Reference](GPU_HEADLESS_CHROME_QUICK_REFERENCE.md)**

```bash
# Start mining in 3 commands
npm run mining:daemon                              # 1. Start service
npm run mining:generate "mine blog posts about AI" # 2. Generate config with AI
npm run mining:status                              # 3. Monitor progress
```

### ⚡ **Blockchain Algorithm Optimization** ⭐ NEW
- **Algorithm Benchmarking** - Compare PoW, PoS, PoO, DPoS for SEO data mining performance
- **Real-Time Simulation** - Test algorithms on live pattern detection workloads
- **AI-Powered DOM Optimization** - DeepSeek generates tree shaking and optimization configs
- **Two-Way Client Communication** - WebSocket API for live/staging site integration
- **Self-Generating Content** - Dynamic content streaming to client sites
- **Pattern Learning** - System improves recommendations over time

📖 **[Algorithm Optimization Guide](BLOCKCHAIN_ALGORITHM_OPTIMIZATION_README.md)** | **[Test Results](test-blockchain-optimization.js)** | **[Demo](demo-blockchain-algorithm-optimization.js)** | **[Client Integration](client-integration-example.html)**

```bash
# Test blockchain algorithms
node test-blockchain-optimization.js

# Run full demo
node demo-blockchain-algorithm-optimization.js

# Start API server
npm run start:dev
```

### 🚀 **Enhanced Startup System** ⭐ NEW
- **Integrated Demo** - Blockchain algorithm demo runs automatically on startup
- **Self-Generating Workloads** - Dynamic container generation for different workload types
- **SEO Data Mining Containers** - Scalable containerized workers for data mining
- **Multi-Environment** - Support for development, staging, and production

📖 **[Enhanced Startup Guide](ENHANCED_STARTUP_SYSTEM_README.md)** | **[Docker Compose](docker-compose.seo-datamining.yml)**

```bash
# Quick start with demo
npm run start:enhanced

# Production deployment
docker-compose -f docker-compose.seo-datamining.yml up -d

# Scale workers
docker-compose -f docker-compose.seo-datamining.yml up -d --scale seo-worker-1=10
```

### 📊 **Component Dashboard Generator** ⭐ NEW
- **Auto-Generated React Components** - Production-ready dashboard components with full CRUD
- **Storybook Integration** - Components from styleguide with auto-generated stories
- **AI-Powered Schemas** - DeepSeek generates JSON schemas from natural language
- **Complete CRUD APIs** - Express.js REST APIs for all entities
- **7 Generated Dashboards** - Workflows, Services, Templates, Attributes, Campaigns, Mining, Seeding

📖 **[Component Generator Guide](COMPONENT_DASHBOARD_GENERATOR_README.md)** | **[Demo](demo-component-dashboard-generator.js)**

```bash
# Generate all components
npm run demo:component-dashboard

# Use in your app
import { WorkflowManagementDashboard } from './components/generated/blockchain-optimization';
```

### 🤖 **Agent DeepSeek Management System** ⭐ NEW
- **AI Agent Configuration** - Create DeepSeek-powered agents with custom modes
- **Knowledge Graph System** - Semantic knowledge graphs with nodes and relationships
- **Rules Engine** - Behavioral rules (constraints, requirements, guidelines, preferences)
- **6 Pre-configured Modes** - Workflow Orchestrator, Code Analyzer, Content Generator, SEO Optimizer, Data Mining, Custom
- **Learning & Adaptation** - Track learning events and performance metrics
- **UI Integration** - "Add Agent" button in sidebar with 4-step wizard

📖 **[Agent System Guide](AGENT_DEEPSEEK_SYSTEM_README.md)** | **[Database Schema](database/agent-deepseek-system-schema.sql)**

```bash
# Create agent via API
curl -X POST http://localhost:3001/api/agent-deepseek/agents \
  -d '{"name": "SEO Agent", "mode_id": "seo-optimizer"}'

# Execute with DeepSeek
curl -X POST http://localhost:3001/api/agent-deepseek/deepseek/execute \
  -d '{"agent_id": "uuid", "prompt_text": "Analyze SEO..."}'
```

### 🔄 **Auto-Generated CRUD APIs** ⭐ NEW
- **Schema-Driven Generation** - Automatically generates REST APIs from database schemas
- **13 Core Tables** - Workflows, Services, Data Streams, Attributes, Datamining, Seeding, SEO, Users, Tasks, Agents, Schemas, Configs
- **Use-Case Operations** - Custom endpoints for domain-specific actions (execute, health_check, analyze, etc.)
- **Complete Integration** - Automatically initialized at startup with full error handling

📖 **[System Integration Guide](COMPREHENSIVE_SYSTEM_INTEGRATION_README.md)** | **[Database Schema](database/comprehensive-system-schema.sql)** | **[API Service](services/api-auto-generator.service.js)**

```bash
# Start system (auto-generates all APIs)
npm run start:enhanced

# List all generated APIs
curl http://localhost:3001/api/auto-generated/routes

# Use generated endpoints
curl -X POST http://localhost:3001/api/workflows \
  -d '{"name": "SEO Pipeline", "workflow_type": "seo_automation"}'

curl -X POST http://localhost:3001/api/workflows/{id}/execute
```

## 🚀 Quick Start

### ⚡ Fastest Start (3 Commands)

```bash
# 1. Install dependencies
PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps

# 2. Ensure .env exists
cp -n .env.example .env

# 3. Start integrated system (API + Frontend)
npm run start:integrated
```

**Access Points:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API Server: http://localhost:3001
- ❤️ Health Check: http://localhost:3001/api/health

📖 **See [START_GUIDE.md](START_GUIDE.md) for detailed quick start instructions**

### Prerequisites

### 🎨 **Component Dashboard Generator** ⭐ NEW
- **Auto-Generated React Components** - Full CRUD dashboard components from Storybook/styleguide
- **DeepSeek Schema Generation** - AI-powered schema creation for workflows, services, templates
- **Complete CRUD APIs** - Express routes for workflows, services, component templates, data attributes, campaigns, data mining, seeding
- **Storybook Integration** - Auto-generated stories with interactive controls
- **Schema-Driven** - DeepSeek controls customization and validation

📖 **[Component Generator Guide](COMPONENT_DASHBOARD_GENERATOR_README.md)** | **[Demo](demo-component-dashboard-generator.js)**

```bash
# Generate all dashboard components
npm run demo:component-dashboard

# Components for: workflows, services, templates, attributes, campaigns, mining, seeding
# Output: React components + API routes + Storybook stories + JSON schemas
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 13+
- Git
- Make (optional, for Makefile commands)

### Quick Start with Dev Container (Recommended)

The fastest way to get started is using our pre-configured dev container:

**GitHub Codespaces:**
1. Click "Code" → "Codespaces" → "Create codespace"
2. Wait for setup to complete (~5 minutes first time)
3. Run `make dev-full` or `npm run dev`

**VS Code Dev Containers:**
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open project → F1 → "Dev Containers: Reopen in Container"
4. Run `make dev-full` or `npm run dev`

📖 **See [Dev Container Documentation](./.devcontainer/README.md)** for details.

### Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DashZeroAlionSystems/lightdom.git
   cd lightdom
   ```

2. **Quick setup (using CLI)**
   ```bash
   npm run cli setup
   ```
   This will install dependencies, setup database, and start services.

   **Or manual setup:**
   ```bash
   # Install dependencies
   npm install
   
   # Setup environment
   make setup-env
   # Edit .env with your configuration
   
   # Setup database
   make db-create
   make db-migrate
   
   # Start blockchain
   make blockchain-start
   ```

3. **Start development**
   ```bash
   # Using Make (recommended)
   make dev-full              # Start all services
   
   # Or using npm scripts
   npm run dev                # Frontend only
   npm run start:dev          # Full stack
   
   # Or using CLI
   npm run cli dev --full     # All services
   ```

### CLI Tool & Automation

We provide comprehensive CLI tools and automation:

```bash
# Using the CLI tool
npm run cli <command> [options]
npm run cli --help              # View all commands
npm run cli dev --full          # Start development
npm run cli test --coverage     # Run tests with coverage
npm run cli db migrate          # Run migrations

# Using Makefile (shorter commands)
make help                       # View all commands
make dev-full                   # Start all services
make test                       # Run tests
make quality                    # Run quality checks

# Quick workflows
make quick-start                # Complete setup and start
make quick-test                 # Lint + type-check + test
make quick-deploy               # Quality + test + build
```

📖 **See [Workflow Automation Guide](./WORKFLOW_AUTOMATION.md)** for comprehensive documentation.

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lightdom

# Ethereum
ETHEREUM_RPC_URL=http://localhost:8545
ADMIN_PRIVATE_KEY=0x...
MODEL_STORAGE_CONTRACT_ADDRESS=0x...

# API
API_KEY=your-api-key
CURSOR_API_KEY=your-cursor-api-key

# Server
PORT=3000
NODE_ENV=development
```

### Access Points
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📚 Documentation

- **[Complete System Documentation](COMPLETE_SYSTEM_DOCUMENTATION.md)** - Comprehensive technical documentation
- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get started in 5 minutes
- **[Frontend Setup](FRONTEND_SETUP_COMPLETE.md)** - Frontend configuration details

### 🔬 Research & Optimization
- **[GPU & Headless Chrome Research](GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md)** - Comprehensive research on GPU acceleration, headless Chrome optimization, and adaptive learning rate strategies (2024-2025)
- **[GPU Quick Reference](GPU_HEADLESS_CHROME_QUICK_REFERENCE.md)** - Quick reference guide for GPU and headless Chrome configuration
- **[Crawler Research](CRAWLER_RESEARCH.md)** - Web crawler best practices and patterns
- **[Headless API Research](HEADLESS_API_RESEARCH.md)** - Headless browser APIs and worker patterns

## 🏗️ Architecture

### Core Systems
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Blockchain    │    │   Web Crawler   │    │   API Server    │
│   Mining        │◄──►│   System        │◄──►│   Express       │
│   System        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   React PWA      │
                    │   Frontend       │
                    │                 │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with comprehensive schemas
- **Blockchain**: Ethereum-compatible with custom mining
- **PWA**: Service Worker, Push Notifications, Background Sync
- **UI/UX**: Discord-style theme, Design system, Animations

## 🔧 System Components

### 1. Blockchain Mining System
- **File**: `blockchain/LightDomMiningSystem.js`
- **Features**: Real-time mining, health monitoring, performance metrics
- **API**: `/api/blockchain/*`

### 2. Web Crawler System
- **File**: `crawler/RealWebCrawlerSystem.js`
- **Features**: Multi-threaded crawling, DOM optimization, performance tracking
- **API**: `/api/crawler/*`

### 3. API Server
- **File**: `api-server-express.js`
- **Features**: RESTful API, comprehensive endpoints, real-time data
- **Port**: 3001

### 4. Frontend Application
- **Entry**: `src/main.tsx`
- **Features**: PWA, Discord theme, responsive design
- **Port**: 3000

### 5. Database Integration
- **Schema**: `database/*.sql`
- **Features**: User management, transactions, metaverse data
- **Health**: `/api/db/health`

## 🎯 Key Features Deep Dive

### Blockchain Mining
```javascript
// Initialize mining system
const miningSystem = new LightDomMiningSystem({
  rpcUrl: 'http://localhost:8545',
  miningInterval: 30000
});

await miningSystem.startMining();

// Subscribe to events
miningSystem.subscribe((data) => {
  console.log('Mining update:', data);
});
```

### Web Crawler
```javascript
// Initialize crawler system
const crawlerSystem = new RealWebCrawlerSystem({
  maxConcurrency: 5,
  requestDelay: 2000
});

await crawlerSystem.startCrawling(['https://example.com']);

// Subscribe to events
crawlerSystem.subscribe((data) => {
  console.log('Crawler update:', data);
});
```

### PWA Notifications
```javascript
// Initialize PWA features
await pwaNotificationService.initialize();

// Send notifications
await pwaNotificationService.sendMiningNotification(12345, 25.5);
await pwaNotificationService.sendOptimizationNotification('https://example.com', 15.2);
```

## 📊 API Endpoints

### Blockchain
- `GET /api/blockchain/stats` - Mining statistics
- `POST /api/blockchain/mine` - Trigger mining
- `GET /api/blockchain/health` - Health status

### Crawler
- `GET /api/crawler/stats` - Crawler statistics
- `POST /api/crawler/start` - Start crawling
- `POST /api/crawler/stop` - Stop crawling

### Wallet
- `GET /api/wallet/balance` - Get balance
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/purchase` - Purchase items
- `POST /api/wallet/transfer` - Transfer funds

### Metaverse
- `GET /api/metaverse/stats` - Metaverse statistics
- `GET /api/metaverse/bridges` - Bridge data
- `GET /api/metaverse/chatrooms` - Chat rooms
- `POST /api/metaverse/bridges` - Create bridge

### System
- `GET /api/headless/status` - System status
- `GET /api/integrated/dashboard` - Integrated dashboard
- `POST /api/headless/notifications/test` - Test notifications

## 🧪 Testing

### Run Integration Tests
```bash
node scripts/run-integration-tests.js
```

### Test Individual Components
```bash
# Test API health
curl http://localhost:3001/api/health

# Test blockchain stats
curl http://localhost:3001/api/blockchain/stats

# Test crawler stats
curl http://localhost:3001/api/crawler/stats

# Test notifications
curl -X POST http://localhost:3001/api/headless/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"type": "system", "message": "Test notification"}'
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1337
MINING_INTERVAL=30000

# Crawler
CRAWLER_MAX_CONCURRENCY=5
CRAWLER_REQUEST_DELAY=2000
CRAWLER_MAX_DEPTH=2

# API Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_PORT=3000
```

## 🚀 Deployment

### Production Setup
1. Configure production environment variables
2. Run database migrations
3. Build frontend: `npm run build`
4. Start services: `node scripts/start-system-integration.js`

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "api-server-express.js"]
```

## 🔒 Security

### Features
- **Input Validation** - All inputs validated and sanitized
- **Authentication** - Secure user authentication system
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Configuration** - Proper CORS setup
- **HTTPS Support** - Secure connections in production

### Best Practices
- Environment variables for sensitive data
- Database connection encryption
- Service worker security
- Notification permission handling

## 📈 Performance

### Optimizations
- **Code Splitting** - Lazy loading of components
- **Bundle Optimization** - Minimized bundle size
- **Caching Strategies** - Effective browser and API caching
- **Database Indexing** - Optimized database queries
- **Connection Pooling** - Efficient database connections

### Monitoring
- **Health Checks** - Continuous service monitoring
- **Performance Metrics** - Real-time performance tracking
- **Error Tracking** - Comprehensive error monitoring
- **Resource Usage** - CPU, memory, and network monitoring

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./QUICK_START.md)** - Fast track to running the project
- **[Workflow Automation](./WORKFLOW_AUTOMATION.md)** - CLI tools and automation guide
- **[Dev Container Guide](./.devcontainer/README.md)** - Development environment setup

### CI/CD & Quality Assurance
- **[Retry Mechanism](./RETRY_MECHANISM.md)** - Automatic retry logic for GitHub Actions workflows

### AI Integration
- **[GitHub Copilot Instructions](./.github/COPILOT_INSTRUCTIONS.md)** - Copilot configuration and usage
- **[Cursor AI Instructions](./.cursor/CURSOR_INSTRUCTIONS.md)** - Cursor AI integration guide
- **[Cursor Rules](./.cursorrules)** - Project-specific coding standards

### Technical Documentation
- **[Architecture Documentation](./ARCHITECTURE.md)** - System architecture and design
- **[Blockchain Guide](./BLOCKCHAIN_README.md)** - Blockchain integration details
- **[Blockchain Deployment Guide](./BLOCKCHAIN_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Blockchain Usage Examples](./BLOCKCHAIN_USAGE_EXAMPLES.md)** - Practical code examples and workflows
- **[Blockchain README Review](./BLOCKCHAIN_README_REVIEW.md)** - Comprehensive blockchain documentation review

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./QUICK_START.md)** - Fast track to running the project
- **[Workflow Automation](./WORKFLOW_AUTOMATION.md)** - CLI tools and automation guide
- **[Dev Container Guide](./.devcontainer/README.md)** - Development environment setup

### AI Integration
- **[GitHub Copilot Instructions](./.github/COPILOT_INSTRUCTIONS.md)** - Copilot configuration and usage
- **[Cursor AI Instructions](./.cursor/CURSOR_INSTRUCTIONS.md)** - Cursor AI integration guide
- **[Cursor Rules](./.cursorrules)** - Project-specific coding standards

### Technical Documentation
- **[Architecture Documentation](./ARCHITECTURE.md)** - System architecture and design
- **[Blockchain Guide](./BLOCKCHAIN_README.md)** - Blockchain integration details

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `node scripts/run-integration-tests.js`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document all public APIs
- Follow the coding standards
- Ensure security best practices
- See **[Cursor Rules](./.cursorrules)** for detailed guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the documentation files
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join the community for support

## 🙏 Acknowledgments

- React team for the amazing framework
- PostgreSQL team for the robust database
- Ethereum community for blockchain inspiration
- Discord for UI/UX inspiration

---

**Built with ❤️ by the LightDom team**

*Optimizing the web, one DOM at a time* 🚀