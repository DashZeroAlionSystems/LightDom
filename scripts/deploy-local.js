#!/usr/bin/env node

/**
 * Simplified Local Blockchain Deployment Script
 * 
 * This script provides a streamlined way to deploy contracts to a local
 * Hardhat network for development and testing.
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

class SimplifiedDeployer {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.deployedContracts = {};
  }

  async setup() {
    console.log('🔧 Setting up deployment environment...\n');

    // Connect to local network
    const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    try {
      // Check if network is accessible
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

      // Setup wallet with first Hardhat account or from env
      let privateKey = process.env.PRIVATE_KEY;
      
      if (!privateKey || privateKey === '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef') {
        // Use first Hardhat account
        privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        console.log('⚠️  Using default Hardhat account #0');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      const balance = await this.provider.getBalance(this.wallet.address);
      
      console.log(`✅ Deployer address: ${this.wallet.address}`);
      console.log(`✅ Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

      if (balance === 0n) {
        throw new Error('Deployer has no ETH. Make sure you\'re connected to a funded network.');
      }

      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      console.error('\n💡 Make sure you have a local Hardhat node running:');
      console.error('   npx hardhat node\n');
      return false;
    }
  }

  async deployContract(name, abi, bytecode, ...args) {
    console.log(`📄 Deploying ${name}...`);
    
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
      const contract = await factory.deploy(...args);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      this.deployedContracts[name] = {
        address,
        contract
      };

      console.log(`✅ ${name} deployed to: ${address}\n`);
      return contract;
    } catch (error) {
      console.error(`❌ Failed to deploy ${name}:`, error.message);
      throw error;
    }
  }

  loadArtifact(contractName) {
    const artifactPath = path.join(
      __dirname,
      '../artifacts/contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found for ${contractName}. Run: npx hardhat compile`);
    }

    return JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  }

  async deployAll() {
    console.log('🚀 Starting contract deployment...\n');
    console.log('='.repeat(60));

    try {
      // Deploy ProofOfOptimization
      const pooArtifact = this.loadArtifact('ProofOfOptimization');
      const challengeWindow = 7 * 24 * 60 * 60; // 7 days
      await this.deployContract(
        'ProofOfOptimization',
        pooArtifact.abi,
        pooArtifact.bytecode,
        challengeWindow
      );

      // Deploy LightDomToken (if it exists)
      try {
        const tokenArtifact = this.loadArtifact('LightDomToken');
        await this.deployContract(
          'LightDomToken',
          tokenArtifact.abi,
          tokenArtifact.bytecode
        );
      } catch (error) {
        console.log('⚠️  LightDomToken not found, skipping...\n');
      }

      // Deploy OptimizationRegistry (if it exists)
      try {
        const registryArtifact = this.loadArtifact('OptimizationRegistry');
        await this.deployContract(
          'OptimizationRegistry',
          registryArtifact.abi,
          registryArtifact.bytecode
        );
      } catch (error) {
        console.log('⚠️  OptimizationRegistry not found, skipping...\n');
      }

      // Deploy VirtualLandNFT (if it exists)
      try {
        const nftArtifact = this.loadArtifact('VirtualLandNFT');
        await this.deployContract(
          'VirtualLandNFT',
          nftArtifact.abi,
          nftArtifact.bytecode
        );
      } catch (error) {
        console.log('⚠️  VirtualLandNFT not found, skipping...\n');
      }

      console.log('='.repeat(60));
      console.log('✅ Deployment completed!\n');

      return true;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      return false;
    }
  }

  saveDeployment() {
    console.log('💾 Saving deployment addresses...\n');

    // Save to JSON file
    const deploymentDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentData = {
      network: 'localhost',
      chainId: 1337,
      timestamp: new Date().toISOString(),
      deployer: this.wallet.address,
      contracts: {}
    };

    for (const [name, data] of Object.entries(this.deployedContracts)) {
      deploymentData.contracts[name] = data.address;
    }

    const deploymentFile = path.join(deploymentDir, 'localhost.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`✅ Deployment saved to: ${deploymentFile}\n`);

    // Update .env file
    this.updateEnvFile();
  }

  updateEnvFile() {
    const envPath = path.join(__dirname, '../.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  .env file not found, skipping update\n');
      return;
    }

    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Update contract addresses in .env
    const contractMappings = {
      'LightDomToken': 'LIGHTDOM_TOKEN_ADDRESS',
      'OptimizationRegistry': 'OPTIMIZATION_REGISTRY_ADDRESS',
      'VirtualLandNFT': 'VIRTUAL_LAND_NFT_ADDRESS',
      'ProofOfOptimization': 'PROOF_OF_OPTIMIZATION_ADDRESS'
    };

    for (const [contractName, envVar] of Object.entries(contractMappings)) {
      if (this.deployedContracts[contractName]) {
        const address = this.deployedContracts[contractName].address;
        const regex = new RegExp(`${envVar}=.*`, 'g');
        
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${envVar}=${address}`);
        } else {
          envContent += `\n${envVar}=${address}`;
        }
      }
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated with contract addresses\n');
  }

  displaySummary() {
    console.log('='.repeat(60));
    console.log('📊 Deployment Summary');
    console.log('='.repeat(60));
    console.log(`Network: localhost (Chain ID: 1337)`);
    console.log(`Deployer: ${this.wallet.address}\n`);
    console.log('Deployed Contracts:');
    
    for (const [name, data] of Object.entries(this.deployedContracts)) {
      console.log(`  ${name}:`);
      console.log(`    Address: ${data.address}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Next Steps:');
    console.log('  1. Start the API server: node api-server-express.js');
    console.log('  2. Start the frontend: npm run dev');
    console.log('  3. Run health check: node scripts/blockchain-health-check.js\n');
  }

  async testDeployment() {
    console.log('🧪 Testing deployments...\n');

    for (const [name, data] of Object.entries(this.deployedContracts)) {
      try {
        const code = await this.provider.getCode(data.address);
        if (code === '0x') {
          console.log(`❌ ${name}: No code at address`);
        } else {
          console.log(`✅ ${name}: Contract verified`);
        }
      } catch (error) {
        console.log(`❌ ${name}: Verification failed`);
      }
    }
    console.log('');
  }
}

// Main execution
async function main() {
  const deployer = new SimplifiedDeployer();

  // Setup
  const setupSuccess = await deployer.setup();
  if (!setupSuccess) {
    process.exit(1);
  }

  // Deploy contracts
  const deploySuccess = await deployer.deployAll();
  if (!deploySuccess) {
    process.exit(1);
  }

  // Test deployments
  await deployer.testDeployment();

  // Save deployment info
  deployer.saveDeployment();

  // Display summary
  deployer.displaySummary();

  console.log('✅ All done! Blockchain is ready to use.\n');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
