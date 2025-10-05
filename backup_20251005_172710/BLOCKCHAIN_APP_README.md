# LightDom Blockchain Application

A comprehensive blockchain-based DOM optimization platform that converts web optimization into tradeable digital assets and blockchain metaverse infrastructure.

## 🌟 Features

### 🔗 **Blockchain Integration**
- **LightDom Token (LDOM)**: ERC20 token for rewarding space optimization
- **Smart Contracts**: Comprehensive Solidity contracts for optimization tracking
- **Staking System**: Stake tokens to earn rewards and increase reputation
- **Metaverse Infrastructure**: Generate virtual land, AI nodes, storage shards, and bridges

### 🎯 **DOM Optimization Engine**
- **Real-time Analysis**: Advanced DOM analysis and optimization detection
- **Space Mining**: Convert unused DOM elements into blockchain assets
- **Proof Generation**: Cryptographic proofs for optimization verification
- **Biome Classification**: Automatic website categorization for metaverse generation

### 📊 **Comprehensive Dashboard**
- **Blockchain Dashboard**: Real-time blockchain statistics and management
- **Optimization Management**: Submit and track DOM optimizations
- **Staking Interface**: Manage token staking and rewards
- **Metaverse Stats**: View generated infrastructure assets

### 🗄️ **Database & Storage**
- **PostgreSQL Integration**: Comprehensive database schema for blockchain data
- **Optimization Tracking**: Detailed optimization history and analytics
- **User Management**: Blockchain address-based user system
- **Performance Metrics**: Real-time performance monitoring

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js 18+**
- **PostgreSQL 13+**
- **Git**
- **Docker** (optional, for monitoring)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd lightdom

# Install dependencies
npm install

# Setup environment
npm run setup:env
# Edit .env file with your configuration

# Setup database
npm run setup:db
```

### 3. Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lightdom_blockchain

# Blockchain
NETWORK=localhost
RPC_URL=http://localhost:8545
PRIVATE_KEY=0x...

# API
PORT=3001
API_KEY=your-secret-api-key
```

### 4. Start the Application

```bash
# Start everything (recommended)
npm start

# Or start individual components
npm run start:api      # API server only
npm run dev           # Frontend only
npm run node          # Blockchain node only
```

## 🏗️ Architecture

### **Smart Contracts**
```
contracts/
├── LightDomToken.sol          # Main ERC20 token contract
├── OptimizationRegistry.sol   # Optimization tracking
├── VirtualLandNFT.sol         # Metaverse land NFTs
└── ProofOfOptimization.sol   # Proof verification
```

### **Frontend**
```
src/
├── components/
│   ├── BlockchainDashboard.tsx    # Main blockchain interface
│   ├── OptimizationDashboard.tsx  # DOM optimization interface
│   └── WalletDashboard.tsx        # Wallet management
├── services/
│   └── BlockchainService.ts        # Blockchain integration
└── core/
    └── DOMOptimizationEngine.ts   # DOM analysis engine
```

### **Backend**
```
├── api-server-express.js           # Main API server
├── database/
│   └── blockchain_schema.sql       # Database schema
└── scripts/
    └── deploy-contracts.ts         # Contract deployment
```

## 🔧 Smart Contracts

### **LightDom Token (LDOM)**

**Features:**
- ERC20 compliant token
- Space-based mining rewards
- Reputation system
- Staking mechanism
- Metaverse infrastructure generation

**Key Functions:**
```solidity
function submitOptimization(
    string memory url,
    uint256 spaceBytes,
    bytes32 proofHash,
    string memory biomeType
) external;

function stakeTokens(uint256 amount) external;
function unstakeTokens(uint256 amount) external;
function claimStakingRewards() external;
```

### **Optimization Registry**

**Features:**
- Optimization tracking
- Proof verification
- Quality scoring
- Recommendation system

**Key Functions:**
```solidity
function registerOptimization(
    string memory url,
    uint256 spaceBytes,
    bytes32 proofHash,
    string memory biomeType,
    string memory metadata
) external;

function verifyOptimization(
    bytes32 optimizationId,
    uint256 verificationScore,
    bool isVerified
) external;
```

## 📊 Database Schema

### **Core Tables**
- `users` - Blockchain address-based user management
- `optimizations` - DOM optimization records
- `metaverse_infrastructure` - Generated metaverse assets
- `staking_transactions` - Staking history
- `token_transfers` - Token transfer records

### **Key Features**
- Comprehensive indexing for performance
- Automatic timestamp updates
- User statistics views
- Optimization analytics functions

## 🎯 Usage

### **1. Submit Optimization**

```typescript
const optimizationData = {
  url: 'https://example.com',
  spaceBytes: 1024,
  proofHash: '0x...',
  biomeType: 'E-commerce',
  metadata: 'Additional info'
};

const txHash = await blockchainService.submitOptimization(optimizationData);
```

### **2. Stake Tokens**

```typescript
// Stake 1000 LDOM tokens
const txHash = await blockchainService.stakeTokens('1000');

// Claim staking rewards
const rewardsTxHash = await blockchainService.claimStakingRewards();
```

### **3. View Statistics**

```typescript
const stats = await blockchainService.getHarvesterStats(userAddress);
const metaverseStats = await blockchainService.getMetaverseStats();
```

## 🔌 API Endpoints

### **Blockchain Endpoints**
```bash
POST /api/blockchain/submit-optimization
GET  /api/blockchain/harvester-stats/:address
GET  /api/blockchain/metaverse-stats
POST /api/blockchain/stake-tokens
POST /api/blockchain/unstake-tokens
POST /api/blockchain/claim-rewards
```

### **Optimization Endpoints**
```bash
POST /api/optimization/analyze
GET  /api/optimization/history/:address
GET  /api/optimization/recommendations/:id
POST /api/optimization/verify
```

### **User Endpoints**
```bash
GET  /api/users/:address
GET  /api/users/leaderboard
POST /api/users/register
PUT  /api/users/:address/profile
```

## 🧪 Testing

### **Smart Contract Testing**
```bash
# Run all tests
npm run test:contracts

# Run with coverage
npm run test:coverage

# Test specific contract
npx hardhat test test/LightDomToken.test.ts
```

### **Integration Testing**
```bash
# Test blockchain integration
npm run test:integration

# Test API endpoints
npm run test:api
```

## 🚀 Deployment

### **1. Deploy Contracts**

```bash
# Deploy to localhost
npm run deploy:contracts:localhost

# Deploy to Sepolia testnet
npm run deploy:contracts:sepolia

# Deploy to mainnet
npm run deploy:contracts:mainnet
```

### **2. Verify Contracts**

```bash
# Verify on Etherscan
npm run verify:contracts
```

### **3. Deploy Application**

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📈 Monitoring

### **Metrics**
- **Blockchain Metrics**: Network health, gas usage, transaction volume
- **Optimization Metrics**: Space saved, optimization count, success rate
- **User Metrics**: Active users, reputation scores, staking activity
- **Performance Metrics**: Response times, error rates, throughput

### **Monitoring Tools**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Custom Dashboard**: Real-time blockchain stats

## 🔒 Security

### **Smart Contract Security**
- OpenZeppelin libraries for security patterns
- Access control with role-based permissions
- Reentrancy guards and pause functionality
- Comprehensive testing and auditing

### **Application Security**
- Input validation and sanitization
- Rate limiting and CORS protection
- Secure API key management
- Database security best practices

## 🌐 Networks

### **Supported Networks**
- **Localhost**: Development and testing
- **Sepolia**: Ethereum testnet
- **Mainnet**: Ethereum mainnet
- **Polygon**: Layer 2 scaling solution

### **Network Configuration**
```typescript
const config = {
  localhost: {
    rpcUrl: 'http://localhost:8545',
    chainId: 1337
  },
  sepolia: {
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111
  },
  mainnet: {
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    chainId: 1
  }
};
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### **Code Standards**
- TypeScript for all new code
- ESLint and Prettier for formatting
- Comprehensive testing
- Security best practices

## 📚 Documentation

### **Additional Resources**
- [Smart Contract Documentation](contracts/README.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Guide](docs/SECURITY.md)

## 🆘 Support

### **Getting Help**
- **Issues**: GitHub Issues
- **Discord**: LightDom Community
- **Email**: support@lightdom.io
- **Documentation**: /docs

### **Common Issues**
- **Database Connection**: Check PostgreSQL is running
- **Blockchain Connection**: Verify RPC URL and network
- **Contract Deployment**: Ensure sufficient gas and funds
- **Frontend Issues**: Check API server is running

## 🔮 Roadmap

### **Phase 1 (Current)**
- ✅ Core blockchain integration
- ✅ DOM optimization engine
- ✅ Staking system
- ✅ Metaverse infrastructure

### **Phase 2 (Next)**
- 🔄 Advanced AI models
- 🔄 Cross-chain bridges
- 🔄 Mobile applications
- 🔄 Enterprise features

### **Phase 3 (Future)**
- ⏳ Decentralized governance
- ⏳ Advanced metaverse features
- ⏳ Machine learning optimization
- ⏳ Global scaling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- React team for the frontend framework
- Ethereum community for blockchain infrastructure
- All contributors and supporters

---

**LightDom Blockchain Application** - Optimizing the web, one DOM element at a time, powered by blockchain technology! ⚡🔗
