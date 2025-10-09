#!/usr/bin/env node

import { ethers } from 'ethers';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntegratedOptimizationMiner } from '../blockchain/IntegratedOptimizationMiner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy contracts and start mining system
 */
class DeployAndMine {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.miner = null;
  }

  async run() {
    console.log('🚀 LightDOM Blockchain Mining System');
    console.log('====================================');
    
    try {
      // Step 1: Start local blockchain if needed
      await this.startLocalBlockchain();
      
      // Step 2: Deploy smart contracts
      await this.deployContracts();
      
      // Step 3: Initialize mining system
      await this.initializeMiningSystem();
      
      // Step 4: Start mining
      await this.startMining();
      
      console.log('\n✅ System is running!');
      console.log('📊 Monitor progress at: http://localhost:3000/mining-dashboard');
      console.log('🛑 Press Ctrl+C to stop\n');
      
      // Keep the process running
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down...');
        await this.shutdown();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  async startLocalBlockchain() {
    console.log('\n📦 Starting local blockchain...');
    
    // Check if blockchain is already running
    try {
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      await provider.getBlockNumber();
      console.log('✅ Blockchain already running');
      return;
    } catch (error) {
      // Blockchain not running, start it
    }
    
    // Start Hardhat node
    console.log('Starting Hardhat node...');
    const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe',
      shell: true
    });
    
    // Wait for it to start
    await new Promise((resolve) => {
      hardhatProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Started HTTP')) {
          console.log('✅ Hardhat node started');
          resolve();
        }
      });
    });
    
    // Give it a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async deployContracts() {
    console.log('\n📝 Deploying smart contracts...');
    
    // Connect to blockchain
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Use first account from Hardhat
    const accounts = await this.provider.listAccounts();
    this.wallet = await this.provider.getSigner(0);
    
    console.log(`📍 Deployer address: ${await this.wallet.getAddress()}`);
    
    // Deploy ProofOfOptimization contract
    console.log('Deploying ProofOfOptimization...');
    const ProofOfOptimization = await ethers.getContractFactory(
      'ProofOfOptimization',
      this.wallet
    );
    this.contracts.proofOfOptimization = await ProofOfOptimization.deploy(300); // 5 minute challenge window
    await this.contracts.proofOfOptimization.waitForDeployment();
    console.log(`✅ ProofOfOptimization deployed at: ${await this.contracts.proofOfOptimization.getAddress()}`);
    
    // Deploy LightDomToken contract
    console.log('Deploying LightDomToken...');
    const LightDomToken = await ethers.getContractFactory(
      'LightDomToken',
      this.wallet
    );
    this.contracts.lightDomToken = await LightDomToken.deploy();
    await this.contracts.lightDomToken.waitForDeployment();
    console.log(`✅ LightDomToken deployed at: ${await this.contracts.lightDomToken.getAddress()}`);
    
    // Save contract addresses
    const addresses = {
      proofOfOptimization: await this.contracts.proofOfOptimization.getAddress(),
      lightDomToken: await this.contracts.lightDomToken.getAddress(),
      network: 'localhost',
      chainId: 1337,
      deployedAt: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(__dirname, '../blockchain/deployed-contracts.json'),
      JSON.stringify(addresses, null, 2)
    );
    
    console.log('✅ Contracts deployed successfully');
  }

  async initializeMiningSystem() {
    console.log('\n⚙️ Initializing mining system...');
    
    // Load deployed addresses
    const addresses = JSON.parse(
      await fs.readFile(path.join(__dirname, '../blockchain/deployed-contracts.json'), 'utf8')
    );
    
    // Create miner configuration
    const config = {
      crawlerConfig: {
        maxConcurrency: 2,
        requestDelay: 1000,
        maxDepth: 1,
        respectRobots: true
      },
      miningConfig: {
        rpcUrl: 'http://localhost:8545',
        chainId: 1337,
        miningInterval: 15000, // 15 seconds for demo
        minOptimizationsPerBlock: 2, // Lower threshold for demo
        proofOfOptimizationAddress: addresses.proofOfOptimization,
        lightDomTokenAddress: addresses.lightDomToken
      },
      seedUrls: [
        'https://example.com',
        'https://httpbin.org',
        'https://jsonplaceholder.typicode.com'
      ],
      trainingDataPath: './training-data',
      exportInterval: 60000 // 1 minute for demo
    };
    
    // Initialize miner
    this.miner = new IntegratedOptimizationMiner(config);
    await this.miner.initialize();
    
    console.log('✅ Mining system initialized');
  }

  async startMining() {
    console.log('\n⛏️ Starting mining operations...');
    
    // Start the integrated system
    await this.miner.start();
    
    // Display initial status
    setTimeout(() => {
      this.displayStatus();
      // Update status every 30 seconds
      setInterval(() => this.displayStatus(), 30000);
    }, 5000);
  }

  displayStatus() {
    const status = this.miner.getStatus();
    
    console.log('\n📊 Mining Status Update');
    console.log('=======================');
    console.log(`⏱️  Uptime: ${Math.floor(status.uptime / 1000 / 60)} minutes`);
    console.log(`🌐 Sites optimized: ${status.statistics.sitesOptimized}`);
    console.log(`💾 Space saved: ${(status.statistics.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⛏️  Blocks mined: ${status.statistics.blocksMinedCount}`);
    console.log(`💰 Tokens earned: ${status.statistics.tokensEarned} LDOM`);
    
    if (status.miningStats) {
      console.log(`🔧 Mining difficulty: ${status.miningStats.currentDifficulty}`);
      console.log(`📦 Pending optimizations: ${status.miningStats.pendingOptimizations}`);
      console.log(`⚡ Hash rate: ${status.miningStats.hashRate} H/s`);
    }
  }

  async shutdown() {
    if (this.miner) {
      await this.miner.stop();
    }
  }
}

// Run the deployment and mining
const deployer = new DeployAndMine();
deployer.run().catch(console.error);
