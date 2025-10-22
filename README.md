# LightDom Enterprise Platform

A comprehensive blockchain-based DOM optimization platform with AI-powered coding abilities, metaverse mining, and advanced client management.

## 🚀 Features

### Core Platform
- **DOM Space Optimization**: Detect and quantify unused elements, dead code, and optimization opportunities
- **Tokenization (DSH Token)**: ERC20 token for rewarding space optimization
- **Metaverse Infrastructure**: Virtual Land Parcels, AI Consensus Nodes, Storage Shards, and Cross-Chain Bridges
- **Real-time Web Crawling**: Advanced web crawler with schema.org extraction and backlink analysis
- **PostgreSQL Integration**: Comprehensive database for storing crawl data and optimization records

### AI & Automation
- **Cursor Background Agent**: AI-powered coding assistance with code generation, refactoring, and debugging
- **Merge Conflict Resolution**: Intelligent automatic detection and resolution of git merge conflicts
- **Metaverse Mining Engine**: Continuous discovery of optimization algorithms and data mining
- **Blockchain Integration**: Smart contract deployment and token management
- **Advanced Node Management**: Creation, scaling, and merging of optimization nodes

### Client Management
- **Automatic Client Creation**: Plan-based client onboarding with API key generation
- **Usage Tracking**: Comprehensive monitoring of client usage and limits
- **Billing Integration**: Automated billing and subscription management
- **Admin Controls**: Role-based access control and permissions

### Testing & Quality Assurance
- **Integration Testing**: Comprehensive test suite for all platform components
- **Workflow Simulation**: End-to-end user workflow testing
- **Error Handling**: Centralized error management and validation
- **Performance Monitoring**: Real-time performance metrics and alerts

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Socket.IO** for real-time updates

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** for data persistence
- **Socket.IO** for real-time communication
- **Ethers.js** for blockchain integration

### Blockchain
- **Ethereum** smart contracts
- **Solidity 0.8.19** for contract development
- **Hardhat** for development and testing
- **IPFS** for decentralized storage

### AI & ML
- **Cursor AI** integration for code generation
- **Custom optimization algorithms**
- **Machine learning models** for pattern recognition
- **Data mining** for continuous improvement

## 📁 Project Structure

```
LightDom/
├── src/
│   ├── components/           # React components
│   │   ├── SpaceOptimizationDashboard.tsx
│   │   ├── AdvancedNodeDashboard.tsx
│   │   ├── MetaverseMiningDashboard.tsx
│   │   ├── BlockchainModelStorageDashboard.tsx
│   │   ├── WorkflowSimulationDashboard.tsx
│   │   └── TestingDashboard.tsx
│   ├── core/                 # Core business logic
│   │   ├── SpaceOptimizationEngine.ts
│   │   ├── AdvancedNodeManager.ts
│   │   ├── MetaverseMiningEngine.ts
│   │   ├── ClientManagementSystem.ts
│   │   ├── CursorBackgroundAgent.ts
│   │   ├── BlockchainModelStorage.ts
│   │   ├── UserWorkflowSimulator.ts
│   │   └── ErrorHandler.ts
│   ├── api/                  # API endpoints
│   │   ├── optimizationApi.ts
│   │   ├── advancedNodeApi.ts
│   │   ├── metaverseMiningApi.ts
│   │   └── blockchainModelStorageApi.ts
│   ├── server/               # Server configuration
│   │   └── optimizationServer.ts
│   └── tests/                # Test suites
│       └── IntegrationTests.ts
├── contracts/                # Smart contracts
│   ├── DOMSpaceToken.sol
│   ├── OptimizationRegistry.sol
│   ├── ProofOfOptimization.sol
│   ├── VirtualLandNFT.sol
│   └── ModelStorageContract.sol
├── crawler/                  # Web crawling system
│   └── RealWebCrawlerSystem.js
├── optimizer/                # DOM optimization algorithms
│   └── light-dom-v1.js
└── database/                 # Database schemas
    └── optimization_schema.sql
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 13+
- Ethereum node (local or remote)
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

## 🎯 Usage

### 1. Space Optimization Dashboard
- Navigate to `/` for the main dashboard
- Start/stop web crawling
- Monitor optimization results
- View metaverse asset generation

### 2. Advanced Node Management
- Navigate to `/advanced-nodes`
- Create and manage optimization nodes
- Allocate storage for different purposes
- Monitor node performance

### 3. Metaverse Mining
- Navigate to `/metaverse-mining`
- Start continuous mining
- View discovered algorithms
- Monitor data mining results

### 4. Blockchain Model Storage
- Navigate to `/blockchain-models`
- Store model training data
- Manage admin access
- View blockchain statistics

### 5. Workflow Simulation
- Navigate to `/workflow-simulation`
- Run complete user workflows
- Monitor simulation progress
- View workflow history

### 6. Testing Dashboard
- Navigate to `/testing`
- Run integration tests
- View test results
- Export test reports

## 🔧 API Endpoints

### Optimization API
- `POST /api/optimization/submit` - Submit optimization results
- `GET /api/optimization/harvester/:address` - Get harvester stats
- `GET /api/optimization/recent` - Get recent optimizations
- `GET /api/metaverse/stats` - Get metaverse statistics

### Advanced Node API
- `POST /api/nodes/create` - Create new node
- `GET /api/nodes/list` - List all nodes
- `POST /api/nodes/scale` - Scale node
- `POST /api/nodes/merge` - Merge nodes

### Metaverse Mining API
- `GET /api/metaverse/mining-data` - Get mining data
- `POST /api/metaverse/toggle-mining` - Toggle mining
- `GET /api/metaverse/algorithms` - Get discovered algorithms
- `GET /api/metaverse/upgrades` - Get blockchain upgrades

### Blockchain Model Storage API
- `POST /api/blockchain-models/store` - Store model data
- `GET /api/blockchain-models/:modelId` - Get model data
- `PUT /api/blockchain-models/:modelId` - Update model data
- `DELETE /api/blockchain-models/:modelId` - Delete model data

### Workflow Simulation API
- `POST /api/workflow/start` - Start simulation
- `POST /api/workflow/stop` - Stop simulation
- `GET /api/workflow/simulations` - Get simulations
- `GET /api/workflow/stats` - Get simulation stats

### Testing API
- `POST /api/tests/run` - Run all tests
- `GET /api/tests/results` - Get test results
- `GET /api/tests/export` - Export test results

## 🧪 Testing

### Run Integration Tests
```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:client
npm run test:cursor
npm run test:blockchain
npm run test:workflow
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

### Manual Testing
1. Navigate to `/testing`
2. Click "Run All Tests"
3. View results and export reports

## 🔀 Merge Conflict Resolution

The platform includes intelligent merge conflict detection and resolution capabilities:

### Quick Commands
```bash
# Detect merge conflicts
node scripts/agent-runner.js merge-conflicts detect

# Automatically resolve conflicts
node scripts/agent-runner.js merge-conflicts resolve

# Analyze specific file conflicts
node scripts/agent-runner.js merge-conflicts analyze path/to/file.js

# Generate detailed report
node scripts/agent-runner.js merge-conflicts report
```

### Automated Workflow
```bash
# Run complete merge conflict resolution workflow
node scripts/agent-runner.js workflow MergeConflictWorkflow
```

**📖 For detailed documentation, see [MERGE_CONFLICT_GUIDE.md](MERGE_CONFLICT_GUIDE.md)**

## 🔒 Security

### Authentication
- API key authentication for all endpoints
- Role-based access control for admin functions
- JWT tokens for session management

### Data Protection
- All sensitive data encrypted at rest
- Secure API key generation and storage
- Input validation and sanitization

### Blockchain Security
- Smart contract audits
- Multi-signature requirements
- Access control modifiers

## 📊 Monitoring

### Performance Metrics
- Response times and throughput
- Error rates and availability
- Database performance
- Smart contract gas usage

### Logging
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance monitoring
- Security event logging

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Build Docker image
docker build -t lightdom .

# Run with Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set up production database
2. Deploy smart contracts to mainnet
3. Configure environment variables
4. Set up monitoring and logging
5. Configure load balancing

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

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
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

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation
- Review the API reference

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core DOM optimization
- ✅ Tokenization system
- ✅ Basic metaverse infrastructure
- ✅ Client management
- ✅ Cursor AI integration

### Phase 2 (Next)
- 🔄 Advanced AI models
- 🔄 Cross-chain bridges
- 🔄 Mobile applications
- 🔄 Advanced analytics
- 🔄 Enterprise features

### Phase 3 (Future)
- ⏳ Decentralized governance
- ⏳ Advanced metaverse features
- ⏳ Machine learning optimization
- ⏳ Global scaling
- ⏳ Enterprise partnerships

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- React team for the frontend framework
- Ethereum community for blockchain infrastructure
- All contributors and supporters

---

**LightDom Enterprise Platform** - Optimizing the web, one DOM element at a time.