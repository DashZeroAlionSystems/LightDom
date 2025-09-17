#!/usr/bin/env node

/**
 * Deploy contracts to local Anvil devnet
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function deployDevnet() {
  console.log('🚀 Deploying DOM Space Harvester to devnet...');
  
  try {
    // Check if Anvil is running
    try {
      execSync('curl -s http://localhost:8545', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Anvil not running. Please start with: anvil');
      process.exit(1);
    }
    
    // Set environment
    process.env.RPC_URL = 'http://localhost:8545';
    process.env.PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    // Deploy contracts
    console.log('📦 Deploying ProofOfOptimization...');
    const pooOutput = execSync('forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/ProofOfOptimization.sol:ProofOfOptimization --constructor-args "0x0000000000000000000000000000000000000000" "0x0000000000000000000000000000000000000000"', { cwd: 'contracts', encoding: 'utf8' });
    const pooAddress = pooOutput.match(/Deployed to: (0x[a-fA-F0-9]{40})/)?.[1];
    
    console.log('📦 Deploying DOMSpaceToken...');
    const tokenOutput = execSync('forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/DOMSpaceToken.sol:DOMSpaceToken', { cwd: 'contracts', encoding: 'utf8' });
    const tokenAddress = tokenOutput.match(/Deployed to: (0x[a-fA-F0-9]{40})/)?.[1];
    
    console.log('📦 Deploying VirtualLandNFT...');
    const landOutput = execSync('forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/VirtualLandNFT.sol:VirtualLandNFT --constructor-args "DOM Space Land" "DSL"', { cwd: 'contracts', encoding: 'utf8' });
    const landAddress = landOutput.match(/Deployed to: (0x[a-fA-F0-9]{40})/)?.[1];
    
    // Create .env file
    const envContent = `# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_ENABLED=true
POO_CONTRACT_ADDRESS=${pooAddress}
DSH_CONTRACT=${tokenAddress}
LAND_CONTRACT_ADDRESS=${landAddress}

# API
PORT=3001
FRONTEND_URL=http://localhost:3002
ADMIN_TOKEN=dev-admin-token-123

# Storage
STORAGE_TYPE=local
ARTIFACT_PATH=./artifacts
`;
    
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Deployment complete!');
    console.log(`📋 Contract Addresses:`);
    console.log(`  PoO Contract: ${pooAddress}`);
    console.log(`  Token Contract: ${tokenAddress}`);
    console.log(`  Land Contract: ${landAddress}`);
    console.log(`📝 Environment saved to .env`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployDevnet();
