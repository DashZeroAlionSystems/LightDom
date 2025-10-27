# LightDom Testnet - Quick Start Guide

Get your blockchain testnet up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker installed (for database and Redis)
- At least 4GB free RAM

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Hardhat, Ethers, and contract dependencies.

### 2. Verify Setup

```bash
npm run testnet:verify
```

Expected output:
```
✓ 19 contracts verified
✓ All features enabled (NFTs, Metaverse, Gamification, SEO, Mining)
```

### 3. Start Testnet

```bash
npm run testnet:start
```

This single command will:
1. ✅ Start Hardhat blockchain (port 8545)
2. ✅ Compile all 19 smart contracts
3. ✅ Deploy contracts to testnet
4. ✅ Start mining service
5. ✅ Launch API server (port 3001)
6. ✅ Start frontend (port 3000)
7. ✅ Enable monitoring (port 3005)

**Wait for**: "Testnet Started Successfully" message

### 4. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main UI |
| **API** | http://localhost:3001 | REST API |
| **Blockchain** | http://localhost:8545 | RPC endpoint |
| **Monitoring** | http://localhost:3005 | System metrics |

### 5. Test Mining

```bash
# Check mining stats
curl http://localhost:3001/api/mining/stats

# View deployed contracts
cat deployments/testnet-31337.json
```

## Alternative: Step-by-Step Manual Setup

If you prefer more control:

### Step 1: Start Blockchain Only

```bash
npm run blockchain:start
```

Keep this terminal open. Open a new terminal for next steps.

### Step 2: Compile Contracts

```bash
npm run blockchain:compile
```

### Step 3: Deploy Contracts

```bash
npm run testnet:deploy
```

### Step 4: Start Mining

```bash
npm run mining:start
```

### Step 5: Start Services

```bash
npm start
```

## What's Included?

### 🔷 Core Blockchain (3 contracts)
- **LightDomToken**: ERC20 token (1B max supply)
- **ProofOfOptimization**: Verifies DOM optimizations
- **OptimizationRegistry**: Tracks all optimizations

### 🎨 NFT System (4 contracts)
- **VirtualLandNFT**: 8 biomes with daily rewards
- **MetaverseCreatureNFT**: Creatures with rarity levels
- **MetaverseItemNFT**: Items and objects
- **MetaverseMarketplace**: Trading platform (2.5% fee)

### 📊 SEO Services (1 contract)
- **SEODataMining**: 194 features, quality rewards

### 💾 Storage (3 contracts)
- **StorageContract**: Decentralized storage
- **StorageToken**: Storage token
- **StorageGovernance**: Governance

### 🛠️ Utilities (6 contracts)
- FileManager, HostManager, DataEncryption
- ModelStorageContract
- DOMSpaceToken, EnhancedDOMSpaceToken

### 🌉 Bridges (2 contracts)
- EthereumBridge, PolygonBridge

**Total: 19 Smart Contracts**

## Testing Features

### Test NFT Minting

```bash
# Mint virtual land NFT
curl -X POST http://localhost:3001/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{"type":"land","biome":"Production"}'
```

### Test SEO Mining

```bash
# Submit SEO data for mining
curl -X POST http://localhost:3001/api/seo/mine \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","features":[...]}'
```

### Test Staking

```bash
# Stake LDOM tokens
curl -X POST http://localhost:3001/api/staking/stake \
  -H "Content-Type: application/json" \
  -d '{"amount":"1000"}'
```

## Testnet Accounts

The testnet provides 20 pre-funded accounts:

```
Mnemonic: test test test test test test test test test test test junk
Balance: 10,000 ETH per account
Chain ID: 31337
```

**Account Assignments:**
- Account 0: Deployer
- Account 1: Miner
- Account 2: NFT Creator
- Account 3: Marketplace
- Account 4-5: Test Users
- Account 6-19: Available

## Configuration

Edit `config/testnet-config.json` to customize:

```json
{
  "mining": {
    "enabled": true,
    "difficulty": 3,
    "blockReward": "50000000000000000000"
  },
  "features": {
    "nfts": { "enabled": true },
    "metaverse": { "enabled": true },
    "gamification": { "enabled": true },
    "seoServices": { "enabled": true }
  }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 8545
lsof -i :8545
kill -9 <PID>

# Or use reset
npm run testnet:reset
```

### Compilation Errors

```bash
# Clear cache and recompile
rm -rf artifacts cache
npm run blockchain:compile
```

### Deployment Fails

```bash
# Check blockchain is running
curl http://localhost:8545

# Check logs
tail -f logs/blockchain.log
```

### Mining Not Working

```bash
# Check mining service
curl http://localhost:3001/api/mining/status

# Restart mining
npm run mining:start
```

## Useful Commands

```bash
# Verify contracts
npm run testnet:verify

# Stop testnet
npm run testnet:stop

# Reset and restart
npm run testnet:reset

# View all accounts
npx hardhat accounts --network localhost

# Check balances
npx hardhat balance --network localhost --address <address>

# Run tests
npm test
```

## Development Workflow

### 1. Make Contract Changes

```bash
# Edit contract in contracts/
vim contracts/MyContract.sol
```

### 2. Recompile

```bash
npm run blockchain:compile
```

### 3. Redeploy

```bash
npm run testnet:deploy
```

### 4. Test Changes

```bash
npm test
```

## Monitoring

Access the monitoring dashboard at http://localhost:3005 to view:
- Real-time mining statistics
- Contract interactions
- Network performance
- Gas usage
- Transaction history

## Environment Variables

Create `.env` file:

```bash
# Blockchain
RPC_URL=http://localhost:8545
CHAIN_ID=31337
PRIVATE_KEY=<your-private-key>

# Features
BLOCKCHAIN_ENABLED=true
MINING_ENABLED=true
NFT_ENABLED=true
METAVERSE_ENABLED=true
GAMIFICATION_ENABLED=true
SEO_SERVICES_ENABLED=true

# Services
API_PORT=3001
FRONTEND_PORT=3000
MONITORING_PORT=3005
```

## Next Steps

1. ✅ Start testnet: `npm run testnet:start`
2. ✅ Visit frontend: http://localhost:3000
3. ✅ Check contracts: `cat deployments/testnet-31337.json`
4. ✅ Test mining: `curl http://localhost:3001/api/mining/stats`
5. ✅ Explore API: http://localhost:3001/api/docs

## Support

For detailed information, see:
- **TESTNET-README.md** - Complete documentation
- **config/testnet-config.json** - Configuration reference
- **hardhat.config.ts** - Network settings

## Success Indicators

You'll know the testnet is working when:
- ✅ Frontend loads at http://localhost:3000
- ✅ API responds at http://localhost:3001/health
- ✅ Blockchain accepts RPC calls at http://localhost:8545
- ✅ Contracts are deployed (check deployments/ folder)
- ✅ Mining produces blocks
- ✅ Transactions are processed

Happy testing! 🚀

---

**Pro Tip**: Run `npm run testnet:verify` regularly to ensure all contracts are properly integrated.
