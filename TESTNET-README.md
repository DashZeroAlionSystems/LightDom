# LightDom Testnet

Complete blockchain testnet setup for LightDom with mining, NFTs, metaverse, gamification, and SEO services.

## Features

### ✅ Core Blockchain
- **LightDomToken (LDOM)**: ERC20 token for DOM optimization mining
- **ProofOfOptimization**: Verifies DOM optimization proofs
- **OptimizationRegistry**: Tracks all optimizations

### 🎨 NFT System
- **VirtualLandNFT**: ERC721 virtual land parcels with 8 biomes
- **MetaverseCreatureNFT**: Creatures and objects with rarity system
- **MetaverseItemNFT**: Additional metaverse items
- **MetaverseMarketplace**: Trading marketplace with auctions

### 🌐 Metaverse
- Dynamic biome rewards
- Lore generation system
- Character animations
- In-world chat

### 🎮 Gamification
- Reputation system
- Staking (5% APY)
- Achievements
- Leaderboards

### 📊 SEO Services
- **SEODataMining**: Mines 194 SEO features with quality rewards
- Core Web Vitals tracking
- AI training pipeline
- Analytics collection

### 💾 Storage & Utilities
- Decentralized storage contracts
- File management
- Data encryption
- Model storage for AI

## Quick Start

### 1. Start Testnet (All-in-One)

```bash
npm run testnet:start
```

This command will:
- ✅ Start Hardhat blockchain (localhost:8545)
- ✅ Compile all smart contracts
- ✅ Deploy all contracts (NFT, Metaverse, Gamification, SEO)
- ✅ Start mining service for SEO data
- ✅ Launch API server (localhost:3001)
- ✅ Start web crawler
- ✅ Launch frontend (localhost:3000)
- ✅ Enable monitoring (localhost:3005)

### 2. Deploy Contracts Only

```bash
npm run testnet:deploy
```

### 3. Stop Testnet

```bash
npm run testnet:stop
```

### 4. Reset Testnet (Fresh Start)

```bash
npm run testnet:reset
```

## Network Configuration

```json
{
  "name": "lightdom-testnet",
  "chainId": 31337,
  "rpcUrl": "http://127.0.0.1:8545",
  "blockTime": 15
}
```

### Pre-funded Test Accounts

The testnet includes 20 pre-funded accounts with 10,000 ETH each:

```javascript
Mnemonic: "test test test test test test test test test test test junk"
Accounts: 20
Balance per account: 10,000 ETH
```

## Service Endpoints

| Service | URL |
|---------|-----|
| Blockchain RPC | http://localhost:8545 |
| API Server | http://localhost:3001 |
| Frontend | http://localhost:3000 |
| Monitoring | http://localhost:3005 |
| Database | localhost:5432 |
| Redis | localhost:6379 |

## API Examples

### Check Mining Stats

```bash
curl http://localhost:3001/api/mining/stats
```

### Get Contract Addresses

```bash
cat deployments/testnet-31337.json
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Mining Configuration

### SEO Data Mining
- **Enabled**: Yes
- **Features**: 194 SEO metrics
- **Base Reward**: 0.01 DSH per feature
- **Quality Multiplier**: Up to 3x
- **Rare Bonus**: 5x multiplier

### Block Mining
- **Block Reward**: 50 LDOM
- **Halving Interval**: Every 100,000 blocks
- **Mining Interval**: 30 seconds
- **Min Optimizations**: 3-5 per block
- **Target Block Time**: 15 seconds

## NFT Biome Rewards

| Biome | Daily Reward (DSH) |
|-------|-------------------|
| Digital | 1.0 |
| Commercial | 2.0 |
| Knowledge | 1.5 |
| Entertainment | 1.2 |
| Social | 1.8 |
| Community | 1.3 |
| Professional | 2.5 |
| Production | 3.0 |

## Staking

- **Minimum Stake**: 1,000 LDOM
- **Annual APY**: 5%
- **Lock Period**: 30 days
- **Rewards**: Distributed continuously

## Contract Integration

All contracts are fully integrated and deployed automatically:

### ✅ Core (3 contracts)
- LightDomToken
- ProofOfOptimization
- OptimizationRegistry

### ✅ NFTs (4 contracts)
- VirtualLandNFT
- MetaverseCreatureNFT
- MetaverseItemNFT
- MetaverseMarketplace

### ✅ SEO (1 contract)
- SEODataMining

### ✅ Storage (3 contracts)
- StorageContract
- StorageToken
- StorageGovernance

### ✅ Utilities (6 contracts)
- FileManager
- HostManager
- DataEncryption
- ModelStorageContract
- DOMSpaceToken
- EnhancedDOMSpaceToken

**Total: 17 Smart Contracts**

## Development

### Compile Contracts

```bash
npm run blockchain:compile
```

### Run Tests

```bash
npm test
```

### Check Contract Size

```bash
npx hardhat size-contracts
```

## Monitoring

The testnet includes comprehensive monitoring:

- Real-time mining stats
- Contract health checks
- Network performance
- Transaction history
- Gas usage analytics

Access monitoring dashboard at: http://localhost:3005

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8545

# Kill specific process
kill -9 <PID>
```

### Reset Blockchain State

```bash
npm run testnet:reset
```

### View Logs

```bash
# All logs
npm run admin:logs

# Specific service
tail -f logs/mining.log
tail -f logs/blockchain.log
```

### Database Issues

```bash
# Check database health
npm run db:health

# Restart database
docker restart $(docker ps -q --filter ancestor=postgres:15)
```

## Configuration Files

- **Network Config**: `config/testnet-config.json`
- **Hardhat Config**: `hardhat.config.ts`
- **Environment**: `.env`
- **Deployments**: `deployments/testnet-31337.json`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   LightDom Testnet                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Blockchain │  │   Contracts  │  │    Mining    │ │
│  │  (Hardhat)  │◄─┤  (17 total)  │◄─┤   Service    │ │
│  └─────────────┘  └──────────────┘  └──────────────┘ │
│         ▲                 ▲                 ▲          │
│         │                 │                 │          │
│  ┌──────┴─────────────────┴─────────────────┴───────┐ │
│  │              API Server (Express)                 │ │
│  └───────────────────────────┬───────────────────────┘ │
│                              │                          │
│  ┌───────────────────────────┴───────────────────────┐ │
│  │          Frontend (React + Vite)                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  Services: Database │ Redis │ Crawler │ Monitoring    │
└─────────────────────────────────────────────────────────┘
```

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review `TESTNET-README.md`
- Run health checks: `npm run admin:health`

## Next Steps

1. ✅ Start testnet: `npm run testnet:start`
2. ✅ Access frontend: http://localhost:3000
3. ✅ Check deployments: `cat deployments/testnet-31337.json`
4. ✅ Monitor mining: http://localhost:3001/api/mining/stats
5. ✅ Explore contracts in Hardhat console

Happy testing! 🚀
