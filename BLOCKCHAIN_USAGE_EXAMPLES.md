# LightDom Blockchain Usage Examples

This guide provides practical examples of how to interact with the LightDom blockchain system.

## Table of Contents

- [Setup](#setup)
- [Contract Interactions](#contract-interactions)
- [API Usage](#api-usage)
- [Frontend Integration](#frontend-integration)
- [Common Workflows](#common-workflows)

## Setup

### Quick Start

```bash
# Run the quick start script
./scripts/blockchain-quickstart.sh
```

### Manual Setup

```bash
# 1. Start Hardhat node
npx hardhat node

# 2. Deploy contracts (in another terminal)
node scripts/deploy-local.js

# 3. Run health check
node scripts/blockchain-health-check.js
```

## Contract Interactions

### Using ethers.js Directly

#### Connect to Blockchain

```javascript
import { ethers } from 'ethers';

// Connect to local network
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// Create wallet from private key
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const wallet = new ethers.Wallet(privateKey, provider);

// Get network info
const network = await provider.getNetwork();
console.log(`Connected to ${network.name} (Chain ID: ${network.chainId})`);
```

#### Interact with LightDomToken

```javascript
import tokenArtifact from './artifacts/contracts/LightDomToken.sol/LightDomToken.json';

const tokenAddress = process.env.LIGHTDOM_TOKEN_ADDRESS;
const token = new ethers.Contract(tokenAddress, tokenArtifact.abi, wallet);

// Get token info
const name = await token.name();
const symbol = await token.symbol();
const totalSupply = await token.totalSupply();

console.log(`Token: ${name} (${symbol})`);
console.log(`Total Supply: ${ethers.formatEther(totalSupply)} tokens`);

// Get balance
const balance = await token.balanceOf(wallet.address);
console.log(`Balance: ${ethers.formatEther(balance)} tokens`);

// Transfer tokens
const tx = await token.transfer('0xRecipientAddress', ethers.parseEther('10'));
await tx.wait();
console.log(`Transfer complete: ${tx.hash}`);
```

#### Submit Optimization

```javascript
import registryArtifact from './artifacts/contracts/OptimizationRegistry.sol/OptimizationRegistry.json';

const registryAddress = process.env.OPTIMIZATION_REGISTRY_ADDRESS;
const registry = new ethers.Contract(registryAddress, registryArtifact.abi, wallet);

// Register an optimization
const url = 'https://example.com';
const spaceBytes = 10240; // 10 KB saved
const proofHash = ethers.id('unique-proof-hash');
const biomeType = 'e-commerce';
const metadata = JSON.stringify({
  domElementsRemoved: 15,
  cssReduced: 5000,
  jsReduced: 5240
});

const tx = await registry.registerOptimization(
  url,
  spaceBytes,
  proofHash,
  biomeType,
  metadata
);

await tx.wait();
console.log(`Optimization registered: ${tx.hash}`);

// Get optimization details
const optimization = await registry.getOptimization(proofHash);
console.log(`Harvester: ${optimization.harvester}`);
console.log(`Space Saved: ${optimization.spaceBytes} bytes`);
```

#### Mint Virtual Land NFT

```javascript
import nftArtifact from './artifacts/contracts/VirtualLandNFT.sol/VirtualLandNFT.json';

const nftAddress = process.env.VIRTUAL_LAND_NFT_ADDRESS;
const nft = new ethers.Contract(nftAddress, nftArtifact.abi, wallet);

// Mint land
const tokenId = 1;
const tokenURI = 'ipfs://QmYourMetadata123';
const recipient = wallet.address;

const tx = await nft.mintLand(recipient, tokenId, tokenURI);
await tx.wait();
console.log(`Land minted: Token ID ${tokenId}`);

// Set land properties
await nft.setLandCoordinates(tokenId, 100, 200);
await nft.setLandSize(tokenId, 500);
await nft.setLandBiome(tokenId, 'Digital Forest');

// Get land details
const coords = await nft.getLandCoordinates(tokenId);
const size = await nft.getLandSize(tokenId);
const biome = await nft.getLandBiome(tokenId);

console.log(`Land at (${coords.x}, ${coords.y})`);
console.log(`Size: ${size}, Biome: ${biome}`);
```

#### Submit Proof of Optimization

```javascript
import pooArtifact from './artifacts/contracts/ProofOfOptimization.sol/ProofOfOptimization.json';

const pooAddress = process.env.PROOF_OF_OPTIMIZATION_ADDRESS;
const poo = new ethers.Contract(pooAddress, pooArtifact.abi, wallet);

// Submit proof
const crawlId = ethers.id('crawl-12345');
const merkleRoot = ethers.id('merkle-root-hash');
const bytesSaved = 50000;
const backlinksCount = 100;
const artifactCID = 'QmArtifactCID123';

const tx = await poo.submitProof(
  crawlId,
  merkleRoot,
  bytesSaved,
  backlinksCount,
  artifactCID
);

await tx.wait();
console.log(`Proof submitted: ${tx.hash}`);

// Check proof status
const proof = await poo.proofs(crawlId);
console.log(`Submitter: ${proof.submitter}`);
console.log(`Bytes Saved: ${proof.bytesSaved}`);
console.log(`Finalized: ${proof.finalized}`);
```

## API Usage

### Using the Blockchain API

#### Get Blockchain Status

```javascript
const response = await fetch('http://localhost:3001/api/blockchain/status');
const data = await response.json();

console.log('Blockchain Status:', data.data);
```

#### Get Harvester Stats

```javascript
const address = '0xYourAddress';
const response = await fetch(
  `http://localhost:3001/api/blockchain/harvester-stats/${address}`
);
const data = await response.json();

console.log('Harvester Stats:', data.data);
```

#### Get Token Balance

```javascript
const address = '0xYourAddress';
const response = await fetch(
  `http://localhost:3001/api/blockchain/token-balance/${address}`
);
const data = await response.json();

console.log('Balance:', data.data.balance);
```

#### Submit Optimization via API

```javascript
const optimizationData = {
  url: 'https://example.com',
  spaceBytes: 10240,
  proofHash: '0x...',
  biomeType: 'e-commerce',
  metadata: JSON.stringify({ /* ... */ })
};

const response = await fetch(
  'http://localhost:3001/api/blockchain/submit-optimization',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optimizationData)
  }
);

const result = await response.json();
console.log('Optimization submitted:', result.data);
```

## Frontend Integration

### Using the BlockchainService

```typescript
import { BlockchainService } from './src/services/api/BlockchainService';

// Initialize service
const config = {
  rpcUrl: 'http://localhost:8545',
  privateKey: process.env.PRIVATE_KEY,
  contractAddresses: {
    token: process.env.LIGHTDOM_TOKEN_ADDRESS,
    registry: process.env.OPTIMIZATION_REGISTRY_ADDRESS,
    nft: process.env.VIRTUAL_LAND_NFT_ADDRESS
  },
  networkId: 1337
};

const service = new BlockchainService(config);
await service.initializeContracts();

// Get harvester stats
const stats = await service.getHarvesterStats('0xYourAddress');
console.log('Reputation:', stats.reputation);
console.log('Space Harvested:', stats.spaceHarvested);
console.log('Tokens Earned:', stats.tokensEarned);

// Submit optimization
const optimizationData = {
  url: 'https://example.com',
  spaceBytes: 10240,
  proofHash: '0x...',
  biomeType: 'e-commerce'
};

const txHash = await service.submitOptimization(optimizationData);
console.log('Transaction:', txHash);
```

### Using React Hooks

```typescript
import { useBlockchain } from './src/hooks/state/useBlockchain';

function MyComponent() {
  const {
    isConnected,
    userAddress,
    tokenBalance,
    harvesterStats,
    connectWallet,
    submitOptimization
  } = useBlockchain();

  const handleSubmit = async () => {
    const data = {
      url: 'https://example.com',
      spaceBytes: 10240,
      proofHash: ethers.id('unique-proof'),
      biomeType: 'blog'
    };

    const txHash = await submitOptimization(data);
    console.log('Submitted:', txHash);
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Address: {userAddress}</p>
          <p>Balance: {tokenBalance} LDM</p>
          <button onClick={handleSubmit}>Submit Optimization</button>
        </div>
      )}
    </div>
  );
}
```

## Common Workflows

### Workflow 1: Register New Optimization

```javascript
async function registerOptimization() {
  // 1. Analyze website and calculate space saved
  const analysis = await analyzeWebsite('https://example.com');
  
  // 2. Generate proof hash
  const proofHash = ethers.id(`${analysis.url}-${Date.now()}`);
  
  // 3. Register with smart contract
  const tx = await registry.registerOptimization(
    analysis.url,
    analysis.spaceBytes,
    proofHash,
    analysis.biomeType,
    JSON.stringify(analysis.metadata)
  );
  
  await tx.wait();
  
  // 4. Store in database
  await saveToDatabase({
    url: analysis.url,
    proofHash,
    txHash: tx.hash
  });
  
  console.log('Optimization registered successfully!');
}
```

### Workflow 2: Mint and Configure Land NFT

```javascript
async function mintAndConfigureLand(recipient, coordinates, biome) {
  // 1. Mint the NFT
  const tokenId = Date.now();
  const tokenURI = await uploadMetadataToIPFS({
    name: `Land Parcel #${tokenId}`,
    coordinates,
    biome
  });
  
  let tx = await nft.mintLand(recipient, tokenId, tokenURI);
  await tx.wait();
  
  // 2. Set properties
  tx = await nft.setLandCoordinates(tokenId, coordinates.x, coordinates.y);
  await tx.wait();
  
  tx = await nft.setLandSize(tokenId, 100);
  await tx.wait();
  
  tx = await nft.setLandBiome(tokenId, biome);
  await tx.wait();
  
  console.log(`Land #${tokenId} minted and configured!`);
  return tokenId;
}
```

### Workflow 3: Submit and Finalize Proof

```javascript
async function submitAndFinalizeProof(crawlData) {
  // 1. Generate merkle tree from crawl data
  const merkleTree = generateMerkleTree(crawlData.urls);
  const merkleRoot = merkleTree.getRoot();
  
  // 2. Upload artifacts to IPFS
  const artifactCID = await uploadToIPFS(crawlData);
  
  // 3. Submit proof
  const crawlId = ethers.id(`crawl-${Date.now()}`);
  let tx = await poo.submitProof(
    crawlId,
    merkleRoot,
    crawlData.bytesSaved,
    crawlData.backlinksCount,
    artifactCID
  );
  await tx.wait();
  
  console.log('Proof submitted. Waiting for challenge window...');
  
  // 4. Wait for challenge window (7 days in production)
  // In development, use time manipulation
  
  // 5. Finalize proof
  tx = await poo.finalize(crawlId);
  await tx.wait();
  
  console.log('Proof finalized!');
}
```

### Workflow 4: Stake Tokens for Rewards

```javascript
async function stakeForRewards(amount) {
  // 1. Approve token spending
  let tx = await token.approve(stakingContractAddress, amount);
  await tx.wait();
  
  // 2. Stake tokens
  tx = await token.stakeTokens(amount);
  await tx.wait();
  
  console.log(`Staked ${ethers.formatEther(amount)} tokens`);
  
  // 3. Check staking rewards periodically
  setInterval(async () => {
    const rewards = await token.calculateStakingRewards(wallet.address);
    console.log(`Rewards: ${ethers.formatEther(rewards)}`);
  }, 60000); // Every minute
}
```

## Testing

### Run Contract Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/contracts/LightDomToken.test.ts

# Run with coverage
npx hardhat coverage

# Run with gas reporter
REPORT_GAS=true npx hardhat test
```

### Generate Test Data

```bash
# Generate all test data
node scripts/generate-test-data.js all

# Generate specific data
node scripts/generate-test-data.js users 20
node scripts/generate-test-data.js optimizations 100
node scripts/generate-test-data.js proofs 50
node scripts/generate-test-data.js lands 30
```

## Troubleshooting

### Common Issues

**Issue**: Contract addresses not found
```bash
# Solution: Deploy contracts
node scripts/deploy-local.js
```

**Issue**: Network connection failed
```bash
# Solution: Start Hardhat node
npx hardhat node
```

**Issue**: ABI not found
```bash
# Solution: Compile contracts
npx hardhat compile
```

**Issue**: Transaction reverted
```bash
# Solution: Check gas limit and contract state
# View transaction details on local explorer or logs
```

## Best Practices

1. **Always check contract deployment** before interacting
2. **Use proper error handling** for all blockchain calls
3. **Wait for transaction confirmations** before proceeding
4. **Test on local network** before deploying to testnet/mainnet
5. **Keep private keys secure** and never commit them
6. **Use environment variables** for sensitive configuration
7. **Monitor gas prices** and optimize transactions
8. **Implement retry logic** for network failures

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [LightDom Deployment Guide](./BLOCKCHAIN_DEPLOYMENT_GUIDE.md)
- [LightDom README Review](./BLOCKCHAIN_README_REVIEW.md)

---

**Need help?** Check the [troubleshooting section](./BLOCKCHAIN_DEPLOYMENT_GUIDE.md#troubleshooting) or run the health check:
```bash
node scripts/blockchain-health-check.js
```
