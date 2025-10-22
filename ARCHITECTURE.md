# LightDom Platform - Complete Architecture

**Generated:** 2025-10-22
**Based on:** README files, source code analysis, and project structure review

---

## Executive Summary

LightDom is a **blockchain-based DOM optimization platform** that combines Web3 technology, AI-powered optimization, web crawling, metaverse mining, and real-time monitoring. The platform enables users to optimize web DOM structures, earn cryptocurrency rewards, and participate in a decentralized metaverse ecosystem.

---

## Complete System Architecture

```mermaid
graph TB
    %% ============================================================================
    %% USER INTERFACES
    %% ============================================================================
    subgraph "User Interface Layer"
        BROWSER[Web Browser]
        ELECTRON[Electron Desktop App]
        EXTENSION[Chrome Extension]
        CLI[Command Line Interface]
    end

    %% ============================================================================
    %% FRONTEND APPLICATION LAYER
    %% ============================================================================
    subgraph "Frontend Application - React 19 + TypeScript"
        MAIN[main.tsx - App Entry Point]

        subgraph "Navigation"
            NAV[Navigation.tsx - Sidebar]
            BACK[BackButton.tsx]
        end

        subgraph "Main Dashboards"
            DASH[DiscordStyleDashboard - Overview]
            OPT_DASH[SpaceOptimizationDashboard - Optimization]
            SPACE_DASH[SpaceMiningDashboard - Space Mining]
            META_DASH[MetaverseMiningDashboard - Metaverse]
            NODE_DASH[AdvancedNodeDashboard - Node Management]
            BLOCK_DASH[BlockchainModelStorageDashboard]
            WALLET_DASH[WalletDashboard - Wallet & Tokens]
            WORK_DASH[WorkflowSimulationDashboard]
            TEST_DASH[TestingDashboard - QA]
            SLOT_DASH[LightDomSlotDashboard - Slots]
            BRIDGE_DASH[BridgeChatPage - Communication]
            CRAWLER_DASH[RealWebCrawlerDashboard]
        end

        subgraph "React Hooks"
            USE_AUTH[useAuth - Authentication]
            USE_OPT[useOptimization]
            USE_NOTIF[useNotifications]
            USE_BLOCKCHAIN[useBlockchain]
            USE_WEBSITES[useWebsites]
            USE_ANALYTICS[useAnalytics]
            USE_CRAWLER[useCrawler]
        end
    end

    %% ============================================================================
    %% CORE ENGINE LAYER
    %% ============================================================================
    subgraph "Core Engine Layer - TypeScript"
        DOM_ENGINE[DOMOptimizationEngine.ts<br/>DOM Analysis & Optimization]
        SPACE_ENGINE[SpaceMiningEngine.ts<br/>Spatial DOM Mining]
        META_ENGINE[MetaverseMiningEngine.ts<br/>Metaverse Integration]
        OPT_ENGINE[SpaceOptimizationEngine.ts<br/>Space Optimization]
        NODE_ENGINE[AdvancedNodeManager.ts<br/>Node Management]
        BLOCK_ENGINE[BlockchainModelStorage.ts<br/>Blockchain Storage]
        WORK_ENGINE[UserWorkflowSimulator.ts<br/>Workflow Simulation]
        SLOT_ENGINE[LightDomSlotSystem.ts<br/>Slot Management]
        GAME_ENGINE[GamificationEngine.ts<br/>Gamification]
        ALCHEMY_ENGINE[MetaverseAlchemyEngine.ts<br/>Alchemy System]
        CLIENT_ENGINE[ClientManagementSystem.ts<br/>Client Management]
        CURSOR_AGENT[CursorBackgroundAgent.ts<br/>AI Coding Assistant]
        ERROR_HANDLER[ErrorHandler.ts<br/>Error Management]
    end

    %% ============================================================================
    %% LIGHTDOM FRAMEWORK
    %% ============================================================================
    subgraph "LightDom Framework - Independent Execution"
        FRAMEWORK[LightDomFramework.ts<br/>Core Framework]
        QUEUE_MGR[URLQueueManager.ts<br/>Priority Queue System]
        SIM_ENGINE[SimulationEngine.ts<br/>Continuous Simulation]
        API_GATEWAY[APIGateway.ts<br/>API Management]
        FRAMEWORK_RUNNER[FrameworkRunner.ts<br/>Main Runner]
        DEPLOY_SYS[DeploymentSystem.ts<br/>K8s & Docker]
        MONITOR_DASH[MonitoringDashboard.tsx<br/>Framework Monitor]
    end

    %% ============================================================================
    %% SERVICE LAYER
    %% ============================================================================
    subgraph "Service Layer - Business Logic"
        BLOCKCHAIN_SVC[BlockchainService.ts<br/>Blockchain Operations]
        CRAWLER_SVC[WebCrawlerService.ts<br/>Web Crawling]
        OPTIMIZATION_SVC[OptimizationService.ts<br/>Optimization Management]
        METAVERSE_SVC[MetaverseService.ts<br/>Metaverse Operations]
        NODE_SVC[NodeService.ts<br/>Node Management]
        WALLET_SVC[WalletService.ts<br/>Wallet Operations]
        AUTH_SVC[AuthService.ts<br/>Authentication]
        NOTIFICATION_SVC[NotificationService.ts<br/>Notifications]
        ANALYTICS_SVC[AnalyticsService.ts<br/>Analytics]
        STORAGE_SVC[StorageService.ts<br/>Data Storage]
        HEADLESS_SVC[HeadlessChromeService.ts<br/>Headless Browsing]
        TASK_SVC[TaskManager.ts<br/>Task Management]
        SEO_SVC[SEOService.ts<br/>SEO Analysis]
    end

    %% ============================================================================
    %% API LAYER
    %% ============================================================================
    subgraph "API Layer - Express.js + REST"
        API_SERVER[api-server-express.js<br/>Main API Server - 5,849 lines]
        SIMPLE_API[simple-api-server.js<br/>Dev API Server - 201 lines]

        subgraph "API Endpoints"
            BLOCKCHAIN_API[blockchainApi.ts<br/>Blockchain Operations]
            SPACE_API[spaceMiningApi.ts<br/>Space Mining]
            META_API[metaverseMiningApi.ts<br/>Metaverse Mining]
            OPT_API[optimizationApi.ts<br/>Optimization]
            NODE_API[advancedNodeApi.ts<br/>Node Management]
            WALLET_API[walletApi.ts<br/>Wallet Operations]
            CRAWLER_API[DOMSpaceHarvesterAPI.ts<br/>Crawler API]
            BILLING_API[billingApi.ts<br/>Billing System]
            GAMIF_API[gamificationApi.ts<br/>Gamification]
            ALCHEMY_API[metaverseAlchemyApi.ts<br/>Alchemy]
            STORAGE_API[LightDomStorageApi.ts<br/>Storage API]
            TASK_API[taskApi.ts<br/>Task Management]
            SEO_API[seo-analysis.ts<br/>SEO Analysis]
            BROWSER_API[BrowserbaseAPI.ts<br/>Browserbase Integration]
        end

        WEBSOCKET[Socket.IO Server<br/>Real-time Communication]
    end

    %% ============================================================================
    %% BLOCKCHAIN LAYER
    %% ============================================================================
    subgraph "Blockchain Layer - Solidity Smart Contracts"
        subgraph "Token Contracts"
            DOM_TOKEN[DOMSpaceToken.sol<br/>Main ERC20 Token]
            LIGHT_TOKEN[LightDomToken.sol<br/>Enhanced Token]
            ENH_TOKEN[EnhancedDOMSpaceToken.sol<br/>Advanced Features]
            STORAGE_TOKEN[StorageToken.sol<br/>Storage Token]
        end

        subgraph "Core Contracts"
            OPT_REGISTRY[OptimizationRegistry.sol<br/>Optimization Tracking]
            PROOF_OPT[ProofOfOptimization.sol<br/>Proof Verification]
            MODEL_STORAGE[ModelStorageContract.sol<br/>AI Model Storage]
            STORAGE_CONTRACT[StorageContract.sol<br/>File Storage]
        end

        subgraph "Metaverse Contracts"
            VIRTUAL_LAND[VirtualLandNFT.sol<br/>Virtual Land NFTs]
            SEO_MINING[SEODataMining.sol<br/>SEO Data Mining]
        end

        subgraph "Bridge Contracts"
            ETH_BRIDGE[EthereumBridge.sol<br/>Ethereum Bridge]
            POLY_BRIDGE[PolygonBridge.sol<br/>Polygon Bridge]
        end

        subgraph "Management Contracts"
            FILE_MGR[FileManager.sol<br/>File Management]
            HOST_MGR[HostManager.sol<br/>Host Management]
            DATA_ENC[DataEncryption.sol<br/>Data Encryption]
            STORAGE_GOV[StorageGovernance.sol<br/>Governance]
        end
    end

    %% ============================================================================
    %% MCP INTEGRATION
    %% ============================================================================
    subgraph "MCP Integration - Model Context Protocol"
        N8N_MCP[n8n-mcp-server.ts<br/>n8n MCP Server]
        N8N_CLI[n8n-mcp-cli.ts<br/>n8n CLI]
        CURSOR_INT[Cursor IDE Integration]
        N8N_SERVICE[n8n Workflow Engine]
    end

    %% ============================================================================
    %% DATA LAYER
    %% ============================================================================
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL Database<br/>Primary Data Store)]
        REDIS[(Redis Cache<br/>Session & Cache)]
        BLOCKCHAIN_DATA[(Ethereum/Polygon<br/>Blockchain Data)]
        CRAWLER_DATA[(.data/crawler-data.json<br/>Crawler Cache)]
        IPFS[(IPFS<br/>Decentralized Storage)]
    end

    %% ============================================================================
    %% EXTERNAL SERVICES
    %% ============================================================================
    subgraph "External Services & Tools"
        WEB_CRAWLER[web-crawler-service.js<br/>Automated Web Crawler]
        PUPPETEER[Puppeteer<br/>Headless Browser]
        CHEERIO[Cheerio<br/>HTML Parser]
        ETHERJS[Ethers.js<br/>Blockchain Library]
        HARDHAT[Hardhat<br/>Smart Contract Dev]
        BROWSERBASE[Browserbase<br/>Cloud Browser Service]
        PROMETHEUS[Prometheus<br/>Metrics Collection]
        GRAFANA[Grafana<br/>Monitoring Dashboard]
    end

    %% ============================================================================
    %% AUTOMATION & CI/CD
    %% ============================================================================
    subgraph "Automation & DevOps"
        GITHUB_ACTIONS[GitHub Actions<br/>CI/CD Workflows]
        DOCKER[Docker<br/>Containerization]
        KUBERNETES[Kubernetes<br/>Orchestration]
        LINEAR[Linear API<br/>Project Management]
    end

    %% ============================================================================
    %% CONNECTIONS - User Interfaces
    %% ============================================================================
    BROWSER --> MAIN
    ELECTRON --> MAIN
    EXTENSION --> API_SERVER
    CLI --> FRAMEWORK_RUNNER

    %% ============================================================================
    %% CONNECTIONS - Frontend to Hooks
    %% ============================================================================
    MAIN --> NAV
    MAIN --> DASH
    MAIN --> OPT_DASH
    MAIN --> SPACE_DASH
    MAIN --> META_DASH
    MAIN --> NODE_DASH
    MAIN --> BLOCK_DASH
    MAIN --> WALLET_DASH
    MAIN --> WORK_DASH
    MAIN --> TEST_DASH
    MAIN --> SLOT_DASH
    MAIN --> BRIDGE_DASH
    MAIN --> CRAWLER_DASH

    USE_AUTH --> AUTH_SVC
    USE_OPT --> OPTIMIZATION_SVC
    USE_NOTIF --> NOTIFICATION_SVC
    USE_BLOCKCHAIN --> BLOCKCHAIN_SVC
    USE_WEBSITES --> CRAWLER_SVC
    USE_ANALYTICS --> ANALYTICS_SVC
    USE_CRAWLER --> CRAWLER_SVC

    %% ============================================================================
    %% CONNECTIONS - Dashboards to Engines
    %% ============================================================================
    OPT_DASH --> OPT_ENGINE
    SPACE_DASH --> SPACE_ENGINE
    META_DASH --> META_ENGINE
    NODE_DASH --> NODE_ENGINE
    BLOCK_DASH --> BLOCK_ENGINE
    WALLET_DASH --> WALLET_SVC
    WORK_DASH --> WORK_ENGINE
    SLOT_DASH --> SLOT_ENGINE
    CRAWLER_DASH --> CRAWLER_SVC

    %% ============================================================================
    %% CONNECTIONS - Engines to Services
    %% ============================================================================
    DOM_ENGINE --> OPTIMIZATION_SVC
    SPACE_ENGINE --> BLOCKCHAIN_SVC
    META_ENGINE --> METAVERSE_SVC
    OPT_ENGINE --> OPTIMIZATION_SVC
    NODE_ENGINE --> NODE_SVC
    BLOCK_ENGINE --> STORAGE_SVC
    WORK_ENGINE --> ANALYTICS_SVC
    SLOT_ENGINE --> STORAGE_SVC
    GAME_ENGINE --> GAMIF_API
    ALCHEMY_ENGINE --> METAVERSE_SVC
    CLIENT_ENGINE --> BILLING_API
    CURSOR_AGENT --> N8N_MCP
    ERROR_HANDLER --> NOTIFICATION_SVC

    %% ============================================================================
    %% CONNECTIONS - Framework Components
    %% ============================================================================
    FRAMEWORK --> QUEUE_MGR
    FRAMEWORK --> SIM_ENGINE
    FRAMEWORK --> API_GATEWAY
    FRAMEWORK_RUNNER --> FRAMEWORK
    DEPLOY_SYS --> KUBERNETES
    DEPLOY_SYS --> DOCKER
    MONITOR_DASH --> FRAMEWORK
    API_GATEWAY --> API_SERVER

    %% ============================================================================
    %% CONNECTIONS - Services to APIs
    %% ============================================================================
    BLOCKCHAIN_SVC --> BLOCKCHAIN_API
    CRAWLER_SVC --> CRAWLER_API
    OPTIMIZATION_SVC --> OPT_API
    METAVERSE_SVC --> META_API
    NODE_SVC --> NODE_API
    WALLET_SVC --> WALLET_API
    AUTH_SVC --> API_SERVER
    NOTIFICATION_SVC --> WEBSOCKET
    ANALYTICS_SVC --> API_SERVER
    STORAGE_SVC --> STORAGE_API
    HEADLESS_SVC --> BROWSER_API
    TASK_SVC --> TASK_API
    SEO_SVC --> SEO_API

    %% ============================================================================
    %% CONNECTIONS - APIs to Data Layer
    %% ============================================================================
    API_SERVER --> POSTGRES
    API_SERVER --> REDIS
    BLOCKCHAIN_API --> BLOCKCHAIN_DATA
    CRAWLER_API --> CRAWLER_DATA
    STORAGE_API --> IPFS
    OPT_API --> POSTGRES
    META_API --> POSTGRES
    NODE_API --> POSTGRES
    WALLET_API --> POSTGRES
    BILLING_API --> POSTGRES

    %% ============================================================================
    %% CONNECTIONS - External Services
    %% ============================================================================
    CRAWLER_SVC --> WEB_CRAWLER
    WEB_CRAWLER --> PUPPETEER
    WEB_CRAWLER --> CHEERIO
    BLOCKCHAIN_SVC --> ETHERJS
    HEADLESS_SVC --> PUPPETEER
    HEADLESS_SVC --> BROWSERBASE
    API_SERVER --> PROMETHEUS
    PROMETHEUS --> GRAFANA

    %% ============================================================================
    %% CONNECTIONS - Blockchain Integration
    %% ============================================================================
    ETHERJS --> DOM_TOKEN
    ETHERJS --> LIGHT_TOKEN
    ETHERJS --> OPT_REGISTRY
    ETHERJS --> PROOF_OPT
    ETHERJS --> MODEL_STORAGE
    ETHERJS --> VIRTUAL_LAND
    ETHERJS --> ETH_BRIDGE
    ETHERJS --> POLY_BRIDGE
    ETHERJS --> BLOCKCHAIN_DATA

    %% ============================================================================
    %% CONNECTIONS - Smart Contract Development
    %% ============================================================================
    HARDHAT --> DOM_TOKEN
    HARDHAT --> LIGHT_TOKEN
    HARDHAT --> OPT_REGISTRY
    HARDHAT --> BLOCKCHAIN_DATA

    %% ============================================================================
    %% CONNECTIONS - MCP Integration
    %% ============================================================================
    N8N_MCP --> N8N_SERVICE
    N8N_CLI --> N8N_MCP
    CURSOR_INT --> N8N_MCP
    CURSOR_AGENT --> N8N_MCP

    %% ============================================================================
    %% CONNECTIONS - Automation
    %% ============================================================================
    GITHUB_ACTIONS --> DOCKER
    DOCKER --> KUBERNETES
    LINEAR --> TASK_SVC

    %% ============================================================================
    %% STYLING
    %% ============================================================================
    classDef ui fill:#E6F3FF,stroke:#0066CC,stroke-width:3px
    classDef frontend fill:#B3D9FF,stroke:#0052A3,stroke-width:2px
    classDef engine fill:#FFE4B5,stroke:#D2691E,stroke-width:2px
    classDef framework fill:#F0E68C,stroke:#B8860B,stroke-width:2px
    classDef service fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    classDef api fill:#FFB6C1,stroke:#DC143C,stroke-width:2px
    classDef blockchain fill:#DDA0DD,stroke:#8B008B,stroke-width:2px
    classDef mcp fill:#98FB98,stroke:#228B22,stroke-width:2px
    classDef data fill:#F0FFF0,stroke:#006400,stroke-width:2px
    classDef external fill:#FFE4E1,stroke:#8B0000,stroke-width:2px
    classDef automation fill:#E0E0E0,stroke:#404040,stroke-width:2px

    class BROWSER,ELECTRON,EXTENSION,CLI ui
    class MAIN,NAV,BACK,DASH,OPT_DASH,SPACE_DASH,META_DASH,NODE_DASH,BLOCK_DASH,WALLET_DASH,WORK_DASH,TEST_DASH,SLOT_DASH,BRIDGE_DASH,CRAWLER_DASH,USE_AUTH,USE_OPT,USE_NOTIF,USE_BLOCKCHAIN,USE_WEBSITES,USE_ANALYTICS,USE_CRAWLER frontend
    class DOM_ENGINE,SPACE_ENGINE,META_ENGINE,OPT_ENGINE,NODE_ENGINE,BLOCK_ENGINE,WORK_ENGINE,SLOT_ENGINE,GAME_ENGINE,ALCHEMY_ENGINE,CLIENT_ENGINE,CURSOR_AGENT,ERROR_HANDLER engine
    class FRAMEWORK,QUEUE_MGR,SIM_ENGINE,API_GATEWAY,FRAMEWORK_RUNNER,DEPLOY_SYS,MONITOR_DASH framework
    class BLOCKCHAIN_SVC,CRAWLER_SVC,OPTIMIZATION_SVC,METAVERSE_SVC,NODE_SVC,WALLET_SVC,AUTH_SVC,NOTIFICATION_SVC,ANALYTICS_SVC,STORAGE_SVC,HEADLESS_SVC,TASK_SVC,SEO_SVC service
    class API_SERVER,SIMPLE_API,BLOCKCHAIN_API,SPACE_API,META_API,OPT_API,NODE_API,WALLET_API,CRAWLER_API,BILLING_API,GAMIF_API,ALCHEMY_API,STORAGE_API,TASK_API,SEO_API,BROWSER_API,WEBSOCKET api
    class DOM_TOKEN,LIGHT_TOKEN,ENH_TOKEN,STORAGE_TOKEN,OPT_REGISTRY,PROOF_OPT,MODEL_STORAGE,STORAGE_CONTRACT,VIRTUAL_LAND,SEO_MINING,ETH_BRIDGE,POLY_BRIDGE,FILE_MGR,HOST_MGR,DATA_ENC,STORAGE_GOV blockchain
    class N8N_MCP,N8N_CLI,CURSOR_INT,N8N_SERVICE mcp
    class POSTGRES,REDIS,BLOCKCHAIN_DATA,CRAWLER_DATA,IPFS data
    class WEB_CRAWLER,PUPPETEER,CHEERIO,ETHERJS,HARDHAT,BROWSERBASE,PROMETHEUS,GRAFANA external
    class GITHUB_ACTIONS,DOCKER,KUBERNETES,LINEAR automation
```

---

## Technology Stack

### Frontend Technologies
- **React 19.1.1** - Modern UI framework
- **TypeScript 5.9.2** - Type-safe development
- **Vite 7.1.9** - Fast build tool
- **TailwindCSS 4.1.14** - Utility-first CSS
- **Ant Design 5.27.4** - UI component library
- **Material Design 3** - Design system
- **Socket.IO Client 4.8.1** - Real-time communication
- **React Router 6.30.1** - Client-side routing
- **Lucide React** - Icon library

### Backend Technologies
- **Node.js (ES Modules)** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **TypeScript** - Backend type safety
- **Socket.IO 4.8.1** - WebSocket server
- **Winston 3.18.3** - Logging
- **Helmet 8.1.0** - Security headers
- **Compression 1.8.1** - Response compression
- **Express Rate Limit** - API rate limiting

### Blockchain Technologies
- **Hardhat 3.0.6** - Ethereum development environment
- **Ethers.js 6.15.0** - Ethereum library
- **Solidity 0.8.20** - Smart contract language
- **IPFS** - Decentralized storage
- **16 Smart Contracts** - Complete contract suite

### Data Layer
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Blockchain Storage** - Immutable records
- **IPFS** - Decentralized file storage

### Web Scraping & ML
- **Puppeteer 24.23.0** - Headless browser automation
- **Cheerio 1.1.2** - HTML/DOM parsing
- **TensorFlow.js 4.22.0** - Machine learning
- **Browserbase** - Cloud browser service

### Testing & Monitoring
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **Artillery** - Load testing
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Kubernetes** - Container orchestration
- **GitHub Actions** - CI/CD pipelines
- **Electron 38.1.2** - Desktop application

### Integration & Automation
- **Linear SDK 60.0.0** - Project management integration
- **n8n MCP** - Workflow automation
- **Cursor Integration** - AI coding assistant

---

## Component Overview

### 1. Frontend Application Layer

**Purpose:** User-facing interfaces for all platform features

**Key Components:**
- **12 Specialized Dashboards** - Each focused on specific functionality
- **7 React Hooks** - Centralized state management
- **Navigation System** - Discord-style sidebar navigation
- **Real-time Updates** - Socket.IO for live data

### 2. Core Engine Layer

**Purpose:** Business logic and core algorithms

**13 Specialized Engines:**
1. **DOMOptimizationEngine** - DOM analysis and optimization
2. **SpaceMiningEngine** - Spatial DOM mining
3. **MetaverseMiningEngine** - Metaverse integration
4. **SpaceOptimizationEngine** - Space optimization algorithms
5. **AdvancedNodeManager** - Distributed node management
6. **BlockchainModelStorage** - Blockchain data persistence
7. **UserWorkflowSimulator** - Workflow simulation
8. **LightDomSlotSystem** - Slot allocation system
9. **GamificationEngine** - Reward and achievement system
10. **MetaverseAlchemyEngine** - Metaverse transformations
11. **ClientManagementSystem** - Client lifecycle management
12. **CursorBackgroundAgent** - AI coding assistant
13. **ErrorHandler** - Centralized error management

### 3. LightDom Framework

**Purpose:** Independent execution framework for continuous optimization

**Components:**
- **LightDomFramework** - Core framework
- **URLQueueManager** - Priority-based queue system
- **SimulationEngine** - Continuous network simulation
- **APIGateway** - Framework API management
- **DeploymentSystem** - Docker & Kubernetes deployment
- **MonitoringDashboard** - Framework monitoring

**Features:**
- Priority-based URL queue (high, medium, low)
- Site-specific optimization perks (e-commerce, blog, corporate, etc.)
- Continuous simulation for network optimization
- RESTful API with Swagger documentation
- Auto-scaling with Kubernetes

### 4. Service Layer

**Purpose:** Business logic and external integrations

**13 Services:**
1. **BlockchainService** - Blockchain operations
2. **WebCrawlerService** - Web crawling management
3. **OptimizationService** - Optimization coordination
4. **MetaverseService** - Metaverse operations
5. **NodeService** - Node lifecycle management
6. **WalletService** - Cryptocurrency wallet operations
7. **AuthService** - Authentication and authorization
8. **NotificationService** - User notifications
9. **AnalyticsService** - Analytics and reporting
10. **StorageService** - Data persistence
11. **HeadlessChromeService** - Headless browser automation
12. **TaskManager** - Task queue management
13. **SEOService** - SEO analysis

### 5. API Layer

**Purpose:** RESTful API endpoints for all functionality

**Main Servers:**
- **api-server-express.js** (5,849 lines) - Production server with full features
- **simple-api-server.js** (201 lines) - Development server with mock data

**14 Specialized API Modules:**
1. **blockchainApi** - Blockchain operations
2. **spaceMiningApi** - Space mining endpoints
3. **metaverseMiningApi** - Metaverse mining
4. **optimizationApi** - Optimization management
5. **advancedNodeApi** - Node management
6. **walletApi** - Wallet operations
7. **billingApi** - Billing and subscriptions
8. **gamificationApi** - Gamification system
9. **metaverseAlchemyApi** - Alchemy operations
10. **LightDomStorageApi** - Storage management
11. **taskApi** - Task management
12. **seo-analysis** - SEO analysis
13. **BrowserbaseAPI** - Browserbase integration
14. **DOMSpaceHarvesterAPI** - Crawler API

**Real-time:**
- **Socket.IO Server** - WebSocket for real-time updates

### 6. Blockchain Layer

**Purpose:** Smart contracts for decentralized operations

**16 Solidity Contracts:**

**Token Contracts (4):**
- DOMSpaceToken.sol - Main ERC20 token
- LightDomToken.sol - Enhanced token with staking
- EnhancedDOMSpaceToken.sol - Advanced features
- StorageToken.sol - Storage-specific token

**Core Contracts (4):**
- OptimizationRegistry.sol - Optimization tracking
- ProofOfOptimization.sol - Proof verification
- ModelStorageContract.sol - AI model storage
- StorageContract.sol - File storage

**Metaverse Contracts (2):**
- VirtualLandNFT.sol - Virtual land ownership
- SEODataMining.sol - SEO data mining

**Bridge Contracts (2):**
- EthereumBridge.sol - Ethereum cross-chain
- PolygonBridge.sol - Polygon cross-chain

**Management Contracts (4):**
- FileManager.sol - File management
- HostManager.sol - Host management
- DataEncryption.sol - Data encryption
- StorageGovernance.sol - Governance system

### 7. MCP Integration Layer

**Purpose:** Integration with n8n workflows and Cursor IDE

**Components:**
- **n8n-mcp-server.ts** - MCP server for n8n integration
- **n8n-mcp-cli.ts** - CLI for workflow management
- **Cursor Integration** - AI coding assistant integration

**Features:**
- Create, read, update, delete n8n workflows
- Execute workflows and monitor execution
- Webhook creation and management
- Workflow validation and statistics

### 8. Data Layer

**Storage Systems:**
- **PostgreSQL** - User data, optimizations, transactions
- **Redis** - Session cache, real-time data
- **Blockchain** - Immutable records, smart contract state
- **IPFS** - Decentralized file storage
- **.data/crawler-data.json** - Crawler cache

### 9. External Services

**Web Automation:**
- **Puppeteer** - Headless Chrome automation
- **Browserbase** - Cloud browser service
- **Cheerio** - HTML parsing

**Blockchain:**
- **Ethers.js** - Ethereum interaction
- **Hardhat** - Smart contract development

**Monitoring:**
- **Prometheus** - Metrics collection
- **Grafana** - Visualization

**Automation:**
- **GitHub Actions** - CI/CD
- **Linear API** - Project management

---

## Data Flow Patterns

### 1. User Interaction Flow
```
User → Dashboard → React Hook → Service → API → Database
                                    ↓
                              WebSocket ← Real-time Updates
```

### 2. Web Crawling Flow
```
Framework → Queue Manager → Web Crawler → Puppeteer → Target Site
                                ↓
                        Crawler Data → Database
                                ↓
                        Dashboard Updates
```

### 3. Optimization Flow
```
DOM Analysis → Optimization Engine → Proof Generation → Blockchain
                      ↓
               Database Storage → Token Distribution → User Wallet
```

### 4. Blockchain Transaction Flow
```
User → Wallet Service → Blockchain API → Ethers.js → Smart Contract
                                                ↓
                                        Blockchain Network
                                                ↓
                                        Transaction Confirmation
                                                ↓
                                        Database Update
```

### 5. Framework Simulation Flow
```
Simulation Engine → Network Analysis → Recommendations
                          ↓
                 Auto-Implementation → Optimization
                          ↓
                  Performance Monitoring
```

---

## Deployment Architecture

### Development
```
npm run start:dev
├── Vite Dev Server (Frontend) :3000
├── Simple API Server (Backend) :3001
└── Electron Desktop App
```

### Production
```
npm run start:complete
├── Docker Containers
│   ├── PostgreSQL :5432
│   ├── Redis :6379
│   ├── API Server :3001
│   └── Frontend :3000
├── Kubernetes Cluster
│   ├── Auto-scaling
│   ├── Load Balancing
│   └── Health Monitoring
└── Monitoring Stack
    ├── Prometheus :9090
    └── Grafana :3000
```

### Blockchain
```
npm run start:blockchain
├── Hardhat Node :8545
├── Contract Deployment
└── Blockchain Integration
```

---

## Key Features

### ✅ DOM Optimization
- Real-time DOM analysis
- Space savings calculation
- Optimization recommendations
- Proof generation for blockchain

### ✅ Space Mining
- Spatial DOM mining
- Metaverse bridge creation
- Token rewards
- Virtual asset generation

### ✅ Metaverse Integration
- Algorithm discovery
- Data mining
- Blockchain upgrades
- Virtual land NFTs

### ✅ Client Management
- Plan-based onboarding
- API key generation
- Usage tracking
- Billing automation

### ✅ Workflow Simulation
- End-to-end testing
- Performance monitoring
- User workflow simulation
- Integration testing

### ✅ Gamification
- Achievement system
- Leaderboards
- Reward distribution
- Progress tracking

### ✅ Testing & QA
- Comprehensive test suite
- Integration tests
- E2E testing
- Load testing

---

## Security Features

### Authentication & Authorization
- JWT token-based auth
- API key management
- Role-based access control (RBAC)
- WebAuthn/WebOTP support

### Data Protection
- Encryption at rest
- HTTPS/TLS in transit
- Input validation
- SQL injection prevention
- XSS protection

### Blockchain Security
- Multi-signature wallets
- Smart contract audits
- Access control modifiers
- Reentrancy protection

### API Security
- Rate limiting
- CORS configuration
- Helmet security headers
- Request validation

---

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- React.memo optimization
- Virtual scrolling
- Service workers (PWA)

### Backend
- Redis caching
- Database query optimization
- Connection pooling
- Compression
- Rate limiting

### Blockchain
- Gas optimization
- Batch transactions
- Layer 2 solutions (Polygon bridge)
- IPFS for large data

---

## Monitoring & Observability

### Metrics
- Response times
- Error rates
- Resource usage
- Transaction throughput
- User activity

### Logging
- Structured logging (Winston)
- Correlation IDs
- Error tracking
- Performance profiling

### Alerting
- Prometheus alerts
- Grafana dashboards
- WebSocket notifications
- Email alerts

---

## Future Roadmap

### Phase 1 - Current ✅
- Core DOM optimization
- Tokenization system
- Basic metaverse features
- Client management
- Workflow simulation

### Phase 2 - Next 🔄
- Advanced AI models
- Cross-chain bridges
- Mobile applications
- Advanced analytics

### Phase 3 - Future 🔮
- Decentralized governance
- Advanced metaverse features
- Machine learning optimization
- Global scaling

---

## Documentation References

- **Main README**: `/README.md`
- **Architecture Diagram**: `/ARCHITECTURE_DIAGRAM.md`
- **System Architecture**: `/LIGHTDOM_SYSTEM_ARCHITECTURE.md`
- **Project Structure**: `/PROJECT_STRUCTURE.md`
- **Framework README**: `/src/framework/README.md`
- **MCP Integration**: `/src/mcp/README.md`
- **Import Changes**: `/IMPORT_REFERENCE_CHANGES.md`

---

**Generated by Claude Code** | Last Updated: 2025-10-22
