# LightDom Blockchain Application - Complete Setup

A comprehensive blockchain-based DOM optimization platform that converts web optimization into tradeable digital assets and blockchain metaverse infrastructure.

## 🚀 Quick Start (5 Minutes)

### 1. **One-Command Setup**
```bash
# Clone and setup everything
git clone <your-repo-url>
cd lightdom
chmod +x setup-blockchain-app.sh
./setup-blockchain-app.sh
```

### 2. **Configure Environment**
```bash
# Edit configuration
nano .env
# Update database, blockchain, and API settings
```

### 3. **Start the Application**
```bash
# Start everything
npm start

# Or start individual components
npm run start:api      # API server only
npm run dev           # Frontend only
npm run node          # Blockchain node only
```

### 4. **Access the Application**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Blockchain Dashboard**: http://localhost:3000/dashboard/blockchain

## 🌟 What You Get

### **Complete Blockchain Application**
- ✅ **Smart Contracts**: ERC20 token, optimization registry, NFT system
- ✅ **React Dashboard**: Modern UI with blockchain integration
- ✅ **API Server**: Comprehensive REST API with WebSocket support
- ✅ **Database**: PostgreSQL with blockchain-optimized schema
- ✅ **Mining System**: DOM space optimization and token rewards
- ✅ **Staking System**: Token staking with rewards
- ✅ **Metaverse**: Virtual land, AI nodes, storage shards, bridges
- ✅ **Monitoring**: Real-time metrics and performance tracking

### **Key Features**
- 🔗 **Blockchain Integration**: Full Ethereum compatibility
- 🎯 **DOM Optimization**: Advanced space mining algorithms
- 💰 **Token Economics**: LDOM token with staking rewards
- 🏞️ **Metaverse Assets**: Generate virtual infrastructure
- 📊 **Analytics**: Comprehensive optimization tracking
- 🔒 **Security**: Enterprise-grade security features

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React         │    │   Express.js     │    │   PostgreSQL    │
│   Frontend      │◄──►│   API Server     │◄──►│   Database      │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • REST API       │    │ • Users         │
│ • Blockchain    │    │ • WebSocket      │    │ • Optimizations │
│ • Wallet        │    │ • Authentication │    │ • Transactions  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Smart         │    │   DOM            │    │   Monitoring    │
│   Contracts     │    │   Optimization   │    │   System        │
│                 │    │   Engine         │    │                 │
│ • LDOM Token    │    │ • Space Mining  │    │ • Metrics       │
│ • Registry      │    │ • Proof Gen      │    │ • Alerts        │
│ • NFTs          │    │ • Analysis       │    │ • Dashboards    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
lightdom/
├── 📄 Smart Contracts
│   ├── contracts/
│   │   ├── LightDomToken.sol          # Main ERC20 token
│   │   ├── OptimizationRegistry.sol   # Optimization tracking
│   │   ├── VirtualLandNFT.sol         # Metaverse land NFTs
│   │   └── ProofOfOptimization.sol   # Proof verification
│   └── scripts/
│       └── deploy-contracts.ts        # Deployment script
│
├── 🎨 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlockchainDashboard.tsx    # Main blockchain UI
│   │   │   ├── OptimizationDashboard.tsx  # DOM optimization UI
│   │   │   └── WalletDashboard.tsx        # Wallet management
│   │   ├── services/
│   │   │   └── BlockchainService.ts        # Blockchain integration
│   │   └── core/
│   │       └── DOMOptimizationEngine.ts   # DOM analysis engine
│   └── public/
│
├── 🔌 Backend
│   ├── api-server-express.js              # Main API server
│   ├── database/
│   │   └── blockchain_schema.sql          # Database schema
│   └── utils/
│
├── 🚀 Deployment
│   ├── start-blockchain-app.js            # Main startup script
│   ├── setup-blockchain-app.sh            # Setup script
│   └── .env.example                       # Configuration template
│
└── 📚 Documentation
    ├── README-BLOCKCHAIN-COMPLETE.md      # This file
    ├── BLOCKCHAIN_APP_README.md           # Detailed documentation
    └── docs/                              # Additional docs
```

## 🔧 Smart Contracts

### **LightDom Token (LDOM)**
- **ERC20 Compliant**: Standard token with additional features
- **Space Mining**: Earn tokens by optimizing DOM space
- **Reputation System**: Build reputation for higher rewards
- **Staking**: Stake tokens to earn 5% annual rewards
- **Metaverse Generation**: Create virtual infrastructure

### **Key Functions**
```solidity
// Submit optimization and earn tokens
function submitOptimization(
    string memory url,
    uint256 spaceBytes,
    bytes32 proofHash,
    string memory biomeType
) external;

// Stake tokens for rewards
function stakeTokens(uint256 amount) external;

// Claim staking rewards
function claimStakingRewards() external;
```

## 🎯 Usage Examples

### **1. Submit DOM Optimization**
```typescript
const optimizationData = {
  url: 'https://example.com',
  spaceBytes: 1024,
  proofHash: '0x...',
  biomeType: 'E-commerce',
  metadata: 'Additional info'
};

const txHash = await blockchainService.submitOptimization(optimizationData);
console.log('Optimization submitted:', txHash);
```

### **2. Stake Tokens**
```typescript
// Stake 1000 LDOM tokens
const stakeTx = await blockchainService.stakeTokens('1000');
console.log('Tokens staked:', stakeTx);

// Claim rewards
const rewardsTx = await blockchainService.claimStakingRewards();
console.log('Rewards claimed:', rewardsTx);
```

### **3. View Statistics**
```typescript
const stats = await blockchainService.getHarvesterStats(userAddress);
console.log('Reputation:', stats.reputation);
console.log('Space Harvested:', stats.spaceHarvested);
console.log('Tokens Earned:', stats.tokensEarned);
```

## 🔌 API Endpoints

### **Blockchain Operations**
```bash
POST /api/blockchain/submit-optimization
GET  /api/blockchain/harvester-stats/:address
GET  /api/blockchain/metaverse-stats
POST /api/blockchain/stake-tokens
POST /api/blockchain/unstake-tokens
POST /api/blockchain/claim-rewards
```

### **Optimization Management**
```bash
POST /api/optimization/analyze
GET  /api/optimization/history/:address
GET  /api/optimization/recommendations/:id
POST /api/optimization/verify
```

### **User Management**
```bash
GET  /api/users/:address
GET  /api/users/leaderboard
POST /api/users/register
PUT  /api/users/:address/profile
```

## 🗄️ Database Schema

### **Core Tables**
- `users` - Blockchain address-based user management
- `optimizations` - DOM optimization records with proofs
- `metaverse_infrastructure` - Generated virtual assets
- `staking_transactions` - Staking history and rewards
- `token_transfers` - Token transfer records
- `blockchain_events` - Smart contract events

### **Key Features**
- Comprehensive indexing for performance
- Automatic timestamp updates
- User statistics views
- Optimization analytics functions
- Audit logging

## 🚀 Deployment Options

### **1. Local Development**
```bash
# Start local blockchain
npm run node

# Deploy contracts
npm run deploy:contracts:localhost

# Start application
npm start
```

### **2. Testnet Deployment**
```bash
# Deploy to Sepolia testnet
npm run deploy:contracts:sepolia

# Verify contracts
npm run verify:contracts
```

### **3. Production Deployment**
```bash
# Deploy to mainnet
npm run deploy:contracts:mainnet

# Start production server
NODE_ENV=production npm start
```

## 📊 Monitoring & Analytics

### **Real-time Metrics**
- **Blockchain**: Network health, gas usage, transaction volume
- **Optimization**: Space saved, optimization count, success rate
- **Users**: Active users, reputation scores, staking activity
- **Performance**: Response times, error rates, throughput

### **Monitoring Tools**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Custom Dashboard**: Real-time blockchain statistics

## 🔒 Security Features

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

## 🌐 Supported Networks

- **Localhost**: Development and testing
- **Sepolia**: Ethereum testnet
- **Mainnet**: Ethereum mainnet
- **Polygon**: Layer 2 scaling solution

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

## 🆘 Support & Troubleshooting

### **Common Issues**

**Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Create database
createdb lightdom_blockchain
```

**Blockchain Connection Failed**
```bash
# Check RPC URL
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

**Contract Deployment Failed**
```bash
# Check private key and balance
npx hardhat run scripts/deploy-contracts.ts --network localhost
```

### **Getting Help**
- **Issues**: GitHub Issues
- **Discord**: LightDom Community
- **Email**: support@lightdom.io
- **Documentation**: /docs

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

## 🎉 Ready to Start?

```bash
# Quick start (5 minutes)
git clone <your-repo-url>
cd lightdom
./setup-blockchain-app.sh
npm start
```

**Open http://localhost:3000 and start optimizing the web with blockchain technology!** ⚡🔗

---

**LightDom Blockchain Application** - Optimizing the web, one DOM element at a time, powered by blockchain technology! 🌐⚡