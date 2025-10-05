# LightDom Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Frontend (React + Ant Design)"
        A[App.tsx] --> B[AuthProvider]
        B --> C[BlockchainProvider]
        C --> D[Router]
        
        D --> E[Public Routes]
        D --> F[Protected Routes]
        
        E --> G[LoginPage]
        E --> H[RegisterPage]
        
        F --> I[DashboardLayout]
        I --> J[DashboardOverview]
        I --> K[OptimizationDashboard]
        I --> L[WalletDashboard]
        I --> M[BlockchainDashboard]
        I --> N[SpaceMiningDashboard]
        I --> O[MetaverseMiningDashboard]
        I --> P[MetaverseMarketplace]
        I --> Q[MetaverseMiningRewards]
    end
    
    subgraph "API Layer (Express.js)"
        R[api-server-express.js]
        R --> S[Auth Routes]
        R --> T[Optimization Routes]
        R --> U[Blockchain Routes]
        R --> V[Mining Routes]
        R --> W[Space Mining Routes]
        R --> X[Metaverse Routes]
        R --> Y[Marketplace Routes]
    end
    
    subgraph "Core Engines"
        Z[DOMOptimizationEngine]
        AA[SpaceMiningEngine]
        AB[MetaverseMiningEngine]
        AC[BlockchainService]
    end
    
    subgraph "Blockchain Layer"
        AD[Smart Contracts]
        AD --> AE[LightDomToken.sol]
        AD --> AF[OptimizationRegistry.sol]
        AD --> AG[VirtualLandNFT.sol]
    end
    
    subgraph "Database"
        AH[(PostgreSQL)]
        AH --> AI[Users]
        AH --> AJ[Optimizations]
        AH --> AK[Mining Sessions]
        AH --> AL[Metaverse Items]
    end
    
    F -.-> R
    R -.-> Z
    R -.-> AA
    R -.-> AB
    R -.-> AC
    AC -.-> AD
    R -.-> AH
```

## Component Relationships

### Frontend Components

```mermaid
graph LR
    subgraph "Authentication Flow"
        A1[LoginPage] --> A2[LoginForm]
        A3[RegisterPage] --> A4[SignupForm]
        A2 --> A5[useAuth Hook]
        A4 --> A5
        A5 --> A6[Auth API]
    end
    
    subgraph "Dashboard Components"
        B1[DashboardLayout] --> B2[Navigation Menu]
        B2 --> B3[Overview]
        B2 --> B4[DOM Optimization]
        B2 --> B5[Blockchain]
        B2 --> B6[Space Mining]
        B2 --> B7[Metaverse Mining]
        B2 --> B8[Marketplace]
        B2 --> B9[Mining Rewards]
    end
    
    subgraph "Hooks"
        C1[useAuth]
        C2[useBlockchain]
        C3[useOptimization]
        C4[useWallet]
    end
```

### API Endpoints Structure

```mermaid
graph TD
    subgraph "Authentication"
        AUTH1[POST /api/auth/signup]
        AUTH2[POST /api/auth/login]
        AUTH3[POST /api/auth/forgot-password]
        AUTH4[POST /api/auth/reset-password]
        AUTH5[POST /api/auth/verify-email]
        AUTH6[GET /api/auth/profile]
        AUTH7[PUT /api/auth/profile]
    end
    
    subgraph "Mining Operations"
        MINE1[POST /api/mining/start]
        MINE2[GET /api/mining/session/:sessionId]
        MINE3[POST /api/mining/session/:sessionId/pause]
        MINE4[POST /api/mining/session/:sessionId/resume]
        MINE5[POST /api/mining/session/:sessionId/stop]
        MINE6[GET /api/mining/sessions]
        MINE7[GET /api/mining/stats]
    end
    
    subgraph "Blockchain"
        BC1[GET /api/blockchain/status]
        BC2[GET /api/blockchain/harvester-stats/:address]
        BC3[GET /api/blockchain/metaverse-stats]
        BC4[GET /api/blockchain/token-balance/:address]
        BC5[GET /api/blockchain/staking-rewards/:address]
        BC6[POST /api/blockchain/submit-optimization]
        BC7[GET /api/blockchain/network-info]
    end
    
    subgraph "Metaverse"
        MV1[GET /api/metaverse/mining-data]
        MV2[POST /api/metaverse/toggle-mining]
        MV3[GET /api/metaverse/marketplace]
        MV4[GET /api/metaverse/inventory]
        MV5[POST /api/metaverse/purchase]
        MV6[POST /api/metaverse/mine-items]
        MV7[GET /api/metaverse/mining-rewards]
        MV8[POST /api/metaverse/claim-reward]
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Engine
    participant Blockchain
    participant Database
    
    User->>Frontend: Login/Signup
    Frontend->>API: Auth Request
    API->>Database: Verify/Create User
    Database-->>API: User Data
    API-->>Frontend: JWT Token
    Frontend-->>User: Dashboard Access
    
    User->>Frontend: Start Mining
    Frontend->>API: Mining Request
    API->>Engine: Initialize Mining
    Engine->>Blockchain: Submit Results
    Blockchain-->>Engine: Transaction Hash
    Engine->>Database: Save Results
    Engine-->>API: Mining Status
    API-->>Frontend: Real-time Updates
    Frontend-->>User: Display Progress
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **UI Library**: Ant Design
- **State Management**: React Context API
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT

### Blockchain
- **Network**: Ethereum-compatible
- **Smart Contracts**: Solidity 0.8.20
- **Development**: Hardhat
- **Libraries**: OpenZeppelin

### Infrastructure
- **Container**: Docker
- **Monitoring**: Prometheus/Grafana
- **Logging**: Winston
- **Testing**: Jest/Vitest

## Key Features

1. **DOM Optimization**
   - Spatial analysis
   - Light DOM isolation
   - Performance metrics

2. **Blockchain Integration**
   - Token rewards (LDOM)
   - Staking system
   - Smart contracts

3. **Metaverse Mining**
   - Algorithm discovery
   - Item generation
   - Marketplace trading

4. **Space Mining**
   - 3D DOM structures
   - Metaverse bridges
   - Spatial optimization

## Security Measures

- JWT authentication
- Protected routes
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Secure headers

## Performance Optimizations

- Lazy loading
- Code splitting
- Caching strategies
- Database indexing
- Connection pooling
- Real-time updates
- Optimized queries

## Deployment Architecture

```mermaid
graph TD
    subgraph "Production Environment"
        LB[Load Balancer]
        LB --> WEB1[Web Server 1]
        LB --> WEB2[Web Server 2]
        
        WEB1 --> API1[API Server 1]
        WEB2 --> API2[API Server 2]
        
        API1 --> DB[(PostgreSQL)]
        API2 --> DB
        
        API1 --> CACHE[(Redis)]
        API2 --> CACHE
        
        API1 --> BC[Blockchain RPC]
        API2 --> BC
    end
```

## File Structure

```
LightDom/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── ...
│   ├── hooks/
│   ├── services/
│   ├── api/
│   ├── core/
│   └── App.tsx
├── contracts/
├── database/
├── scripts/
├── public/
└── api-server-express.js
```

This architecture provides a scalable, secure, and performant foundation for the LightDom platform.

