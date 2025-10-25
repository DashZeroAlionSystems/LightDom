# LightDom Blockchain Deployment Guide

**Version**: 1.0.0
**Last Updated**: October 24, 2025
**Author**: LightDom Development Team

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Deployment](#development-deployment)
- [Testnet Deployment](#testnet-deployment)
- [Production Deployment](#production-deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## 🎯 Prerequisites

### Required Software
- **Node.js**: v18+ (v22.20.0 recommended)
- **npm**: v8+ (v10.9.3 recommended)
- **Git**: For version control
- **PostgreSQL**: v13+ (for database storage)

### Optional Software
- **Docker**: For containerized deployment
- **Hardhat**: Installed automatically with npm install

### Environment Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure:
   - Database connection
   - Ethereum RPC URL
   - Private key (for deployment)
   - Network configuration

## 🚀 Quick Start

### Option 1: Using the Startup Script

```bash
# Start the complete blockchain application
node start-blockchain-app.js
```

This will:
- ✅ Check prerequisites
- ✅ Start local blockchain node (if needed)
- ✅ Deploy contracts (if AUTO_DEPLOY_CONTRACTS=true)
- ✅ Start database
- ✅ Start API server
- ✅ Start frontend

### Option 2: Manual Step-by-Step

```bash
# 1. Install dependencies
npm install

# 2. Start local Hardhat node (in separate terminal)
npx hardhat node

# 3. Deploy contracts
npx hardhat run scripts/automation/deploy-contracts.ts --network localhost

# 4. Start API server
node api-server-express.js

# 5. Start frontend (in separate terminal)
npm run dev
```

## 🔧 Development Deployment

### Step 1: Install Dependencies

```bash
npm install
```

**Note**: If you encounter Playwright or Electron download issues:
```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --legacy-peer-deps
```

### Step 2: Compile Contracts

```bash
npx hardhat compile
```

This will:
- Compile all Solidity contracts in `contracts/`
- Generate ABIs in `artifacts/contracts/`
- Create contract artifacts

**Expected Output**:
```
Compiled 19 Solidity files successfully
```

### Step 3: Start Local Blockchain

```bash
npx hardhat node
```

This starts a local Ethereum node with:
- 20 pre-funded accounts (10,000 ETH each)
- Chain ID: 1337
- RPC URL: http://127.0.0.1:8545

**Keep this terminal running!**

### Step 4: Deploy Contracts

In a new terminal:

```bash
npx hardhat run scripts/automation/deploy-contracts.ts --network localhost
```

This deploys:
- ✅ LightDomToken
- ✅ OptimizationRegistry
- ✅ VirtualLandNFT
- ✅ ProofOfOptimization

**Save the deployment addresses** shown in the output to your `.env` file:
```env
LIGHTDOM_TOKEN_ADDRESS=0x...
OPTIMIZATION_REGISTRY_ADDRESS=0x...
VIRTUAL_LAND_NFT_ADDRESS=0x...
PROOF_OF_OPTIMIZATION_ADDRESS=0x...
```

### Step 5: Start Database

Make sure PostgreSQL is running:

```bash
# Start PostgreSQL (varies by OS)
# Linux/Mac:
sudo service postgresql start

# Or using Docker:
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lightdom_blockchain \
  postgres:15
```

Run database migrations:

```bash
psql -U postgres -f postgresql-setup-script.sql
```

### Step 6: Start API Server

```bash
node api-server-express.js
```

The API server will start on `http://localhost:3001`

### Step 7: Start Frontend

In a new terminal:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🌐 Testnet Deployment

### Sepolia Testnet

1. **Get Sepolia ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your deployment wallet

2. **Configure `.env`**:
   ```env
   NETWORK=sepolia
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
   ```

3. **Deploy to Sepolia**:
   ```bash
   npx hardhat run scripts/automation/deploy-contracts.ts --network sepolia
   ```

4. **Verify Contracts** (optional):
   ```bash
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

### Other Testnets

The same process applies for other testnets. Update `hardhat.config.ts` to add networks:

```typescript
networks: {
  goerli: {
    url: process.env.GOERLI_RPC_URL || "",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 5,
  },
  // Add more networks as needed
}
```

## 🏭 Production Deployment

### ⚠️ Security Checklist

Before deploying to mainnet:

- [ ] Smart contracts audited by professional auditors
- [ ] Comprehensive test coverage (>90%)
- [ ] All tests passing
- [ ] Private keys secured (use hardware wallet)
- [ ] Multi-sig setup for admin functions
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup and recovery procedures tested
- [ ] Insurance considered

### Mainnet Deployment

1. **Final Testing**:
   ```bash
   # Run all tests
   npm run test

   # Run security audit
   npm run security:audit
   ```

2. **Configure Production `.env`**:
   ```env
   NODE_ENV=production
   NETWORK=mainnet
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=0xYOUR_PRODUCTION_PRIVATE_KEY
   ```

3. **Deploy to Mainnet**:
   ```bash
   npx hardhat run scripts/automation/deploy-contracts.ts --network mainnet
   ```

4. **Verify Contracts**:
   ```bash
   npx hardhat verify --network mainnet CONTRACT_ADDRESS
   ```

5. **Monitor Deployment**:
   - Check transactions on Etherscan
   - Verify contract code is verified
   - Test basic functions

## ✅ Verification

### Verify Contract Deployment

```bash
# Check contract at address
npx hardhat console --network localhost

> const token = await ethers.getContractAt("LightDomToken", "0xYOUR_ADDRESS")
> await token.name()
> await token.symbol()
> await token.totalSupply()
```

### Verify API Integration

```bash
# Test blockchain status endpoint
curl http://localhost:3001/api/blockchain/status

# Test network info
curl http://localhost:3001/api/blockchain/network-info
```

### Verify Frontend Integration

1. Open `http://localhost:3000`
2. Navigate to Blockchain Dashboard
3. Connect wallet
4. Verify:
   - Contract addresses shown
   - Network info correct
   - Can interact with contracts

## 🔍 Contract Addresses

After deployment, update your documentation with contract addresses:

### Local Development
```
LightDomToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
OptimizationRegistry: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VirtualLandNFT: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
ProofOfOptimization: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### Sepolia Testnet
```
LightDomToken: 0x...
OptimizationRegistry: 0x...
VirtualLandNFT: 0x...
ProofOfOptimization: 0x...
```

### Mainnet
```
LightDomToken: 0x...
OptimizationRegistry: 0x...
VirtualLandNFT: 0x...
ProofOfOptimization: 0x...
```

## 🐛 Troubleshooting

### Issue: "Contracts not compiling"

**Solution**:
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

### Issue: "Network connection failed"

**Solution**:
- Check if Hardhat node is running
- Verify RPC_URL in `.env`
- Check network configuration in `hardhat.config.ts`

### Issue: "Deployment failed"

**Solutions**:
- Ensure you have enough ETH for gas
- Check private key is correct
- Verify network is accessible
- Look for contract compilation errors

### Issue: "Transaction reverted"

**Solutions**:
- Check contract constructor parameters
- Verify you're sending from correct account
- Check gas limit is sufficient
- Review contract requirements

### Issue: "ABI not found"

**Solutions**:
```bash
# Recompile contracts
npx hardhat compile

# Check artifacts were generated
ls artifacts/contracts/
```

### Issue: "Database connection failed"

**Solutions**:
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists:
  ```bash
  psql -U postgres -c "CREATE DATABASE lightdom_blockchain;"
  ```

### Issue: "Port already in use"

**Solutions**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 PID

# Or use different port in .env
PORT=3002
```

## 📚 Additional Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)

### Tools
- [Etherscan](https://etherscan.io/) - Blockchain explorer
- [Remix IDE](https://remix.ethereum.org/) - Online Solidity IDE
- [Tenderly](https://tenderly.co/) - Smart contract monitoring
- [MetaMask](https://metamask.io/) - Ethereum wallet

### Support
- GitHub Issues: [Create an issue](https://github.com/DashZeroAlionSystems/lightdom/issues)
- Documentation: `/docs`
- Email: support@lightdom.io

## 🔄 Upgrade & Migration

### Upgrading Contracts

LightDom contracts use upgradeable proxy pattern (future feature):

```bash
# Deploy new implementation
npx hardhat run scripts/upgrade-contracts.ts --network mainnet

# Verify upgrade
npx hardhat verify-upgrade
```

### Data Migration

When upgrading:
1. Backup current data
2. Deploy new contracts
3. Migrate data if needed
4. Update frontend to use new addresses
5. Verify all functionality

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All dependencies installed
- [ ] Contracts compiled successfully
- [ ] All tests passing
- [ ] `.env` configured correctly
- [ ] Database set up and accessible
- [ ] Security audit completed (for production)

### Deployment
- [ ] Local blockchain node started
- [ ] Contracts deployed successfully
- [ ] Deployment addresses saved
- [ ] `.env` updated with addresses
- [ ] API server started
- [ ] Frontend started
- [ ] Basic functionality tested

### Post-Deployment
- [ ] Contract verification on block explorer
- [ ] Documentation updated with addresses
- [ ] Team notified of new deployment
- [ ] Monitoring set up
- [ ] Backup procedures in place
- [ ] Rollback plan documented

---

**Status**: ✅ Deployment Guide Complete
**Last Tested**: October 2025
**Maintained By**: LightDom Development Team
