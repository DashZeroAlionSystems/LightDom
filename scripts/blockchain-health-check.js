#!/usr/bin/env node

/**
 * Blockchain Health Check Script
 * 
 * Verifies the status and health of the LightDom blockchain system.
 * Checks:
 * - Environment configuration
 * - Contract ABIs availability
 * - Blockchain network connectivity
 * - Contract deployments
 * - API server health
 * - Database connectivity
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Handle ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

class BlockchainHealthChecker {
  constructor() {
    this.results = {
      environment: {},
      contracts: {},
      network: {},
      api: {},
      database: {},
      overall: 'unknown'
    };
  }

  async runAllChecks() {
    console.log('🔍 Running LightDom Blockchain Health Checks...\n');
    console.log('='.repeat(60));

    try {
      await this.checkEnvironment();
      await this.checkContractABIs();
      await this.checkNetwork();
      await this.checkContractDeployments();
      await this.checkAPIServer();
      await this.checkDatabase();
      
      this.calculateOverallHealth();
      this.displayResults();
      
      return this.results.overall === 'healthy';
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  async checkEnvironment() {
    console.log('\n📋 Checking Environment Configuration...');
    
    const requiredVars = [
      'RPC_URL',
      'DATABASE_URL',
      'PORT',
      'NODE_ENV'
    ];

    const optionalVars = [
      'LIGHTDOM_TOKEN_ADDRESS',
      'OPTIMIZATION_REGISTRY_ADDRESS',
      'VIRTUAL_LAND_NFT_ADDRESS',
      'PROOF_OF_OPTIMIZATION_ADDRESS'
    ];

    let allPresent = true;
    let deployedContracts = 0;

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`  ✅ ${varName}: Set`);
        this.results.environment[varName] = 'present';
      } else {
        console.log(`  ❌ ${varName}: Missing`);
        this.results.environment[varName] = 'missing';
        allPresent = false;
      }
    }

    for (const varName of optionalVars) {
      if (process.env[varName] && process.env[varName] !== '0x0000000000000000000000000000000000000000') {
        console.log(`  ✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
        this.results.environment[varName] = 'present';
        deployedContracts++;
      } else {
        console.log(`  ⚠️  ${varName}: Not deployed`);
        this.results.environment[varName] = 'not_deployed';
      }
    }

    this.results.environment.status = allPresent ? 'healthy' : 'unhealthy';
    this.results.environment.deployedContracts = deployedContracts;
  }

  async checkContractABIs() {
    console.log('\n📄 Checking Contract ABIs...');
    
    const contracts = [
      'LightDomToken',
      'OptimizationRegistry',
      'VirtualLandNFT',
      'ProofOfOptimization'
    ];

    let foundABIs = 0;
    
    for (const contractName of contracts) {
      const abiPath = path.join(__dirname, '../blockchain/abi', `${contractName}.json`);
      const artifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
      
      if (fs.existsSync(abiPath)) {
        console.log(`  ✅ ${contractName}: Found in blockchain/abi/`);
        this.results.contracts[contractName] = 'found_abi';
        foundABIs++;
      } else if (fs.existsSync(artifactPath)) {
        console.log(`  ✅ ${contractName}: Found in artifacts/`);
        this.results.contracts[contractName] = 'found_artifact';
        foundABIs++;
      } else {
        console.log(`  ❌ ${contractName}: ABI not found`);
        this.results.contracts[contractName] = 'not_found';
      }
    }

    this.results.contracts.status = foundABIs === contracts.length ? 'healthy' : 'unhealthy';
    this.results.contracts.foundCount = foundABIs;
    this.results.contracts.totalCount = contracts.length;
  }

  async checkNetwork() {
    console.log('\n🌐 Checking Network Connectivity...');
    
    try {
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getFeeData();
      
      console.log(`  ✅ Network: Connected`);
      console.log(`  ✅ Chain ID: ${network.chainId}`);
      console.log(`  ✅ Block Number: ${blockNumber}`);
      console.log(`  ✅ Gas Price: ${gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'N/A'} gwei`);
      
      this.results.network = {
        status: 'healthy',
        chainId: Number(network.chainId),
        blockNumber: blockNumber,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'N/A'
      };
    } catch (error) {
      console.log(`  ❌ Network: Connection failed`);
      console.log(`     Error: ${error.message}`);
      this.results.network = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkContractDeployments() {
    console.log('\n📝 Checking Contract Deployments...');
    
    if (this.results.network.status !== 'healthy') {
      console.log('  ⚠️  Skipping (network not available)');
      this.results.contracts.deploymentStatus = 'skipped';
      return;
    }

    const contracts = {
      LightDomToken: process.env.LIGHTDOM_TOKEN_ADDRESS,
      OptimizationRegistry: process.env.OPTIMIZATION_REGISTRY_ADDRESS,
      VirtualLandNFT: process.env.VIRTUAL_LAND_NFT_ADDRESS,
      ProofOfOptimization: process.env.PROOF_OF_OPTIMIZATION_ADDRESS
    };

    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
      
      for (const [name, address] of Object.entries(contracts)) {
        if (!address || address === '0x0000000000000000000000000000000000000000') {
          console.log(`  ⚠️  ${name}: Not deployed`);
          continue;
        }

        try {
          const code = await provider.getCode(address);
          if (code !== '0x') {
            console.log(`  ✅ ${name}: Deployed at ${address.substring(0, 10)}...`);
          } else {
            console.log(`  ❌ ${name}: No code at ${address.substring(0, 10)}...`);
          }
        } catch (error) {
          console.log(`  ❌ ${name}: Check failed - ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Deployment check failed: ${error.message}`);
    }
  }

  async checkAPIServer() {
    console.log('\n🔌 Checking API Server...');
    
    const port = process.env.PORT || 3001;
    const apiUrl = `http://localhost:${port}`;
    
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        console.log(`  ✅ API Server: Running on port ${port}`);
        console.log(`  ✅ Health Endpoint: Responding`);
        this.results.api = {
          status: 'healthy',
          port: port,
          url: apiUrl
        };
      } else {
        console.log(`  ⚠️  API Server: Responding but unhealthy (${response.status})`);
        this.results.api = {
          status: 'degraded',
          port: port,
          httpStatus: response.status
        };
      }
    } catch (error) {
      console.log(`  ❌ API Server: Not responding`);
      console.log(`     Error: ${error.message}`);
      this.results.api = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkDatabase() {
    console.log('\n🗄️  Checking Database...');
    
    if (!process.env.DATABASE_URL) {
      console.log('  ⚠️  DATABASE_URL not configured');
      this.results.database = { status: 'not_configured' };
      return;
    }

    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000
      });

      const client = await pool.connect();
      await client.query('SELECT NOW()');
      const result = await client.query('SELECT version()');
      client.release();
      await pool.end();

      console.log(`  ✅ Database: Connected`);
      console.log(`  ✅ Version: PostgreSQL`);
      this.results.database = {
        status: 'healthy',
        type: 'PostgreSQL'
      };
    } catch (error) {
      console.log(`  ❌ Database: Connection failed`);
      console.log(`     Error: ${error.message}`);
      this.results.database = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  calculateOverallHealth() {
    const statuses = [
      this.results.environment.status,
      this.results.contracts.status,
      this.results.network.status,
      this.results.api.status,
      this.results.database.status
    ];

    const unhealthy = statuses.filter(s => s === 'unhealthy' || s === 'not_configured').length;
    const degraded = statuses.filter(s => s === 'degraded').length;

    if (unhealthy === 0 && degraded === 0) {
      this.results.overall = 'healthy';
    } else if (unhealthy > 2) {
      this.results.overall = 'unhealthy';
    } else {
      this.results.overall = 'degraded';
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Health Check Summary');
    console.log('='.repeat(60));
    
    const status = this.results.overall;
    const icon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
    
    console.log(`\nOverall Status: ${icon} ${status.toUpperCase()}`);
    
    console.log('\nComponent Status:');
    console.log(`  Environment:  ${this.results.environment.status === 'healthy' ? '✅' : '❌'} ${this.results.environment.status}`);
    console.log(`  Contracts:    ${this.results.contracts.status === 'healthy' ? '✅' : '❌'} ${this.results.contracts.status} (${this.results.contracts.foundCount}/${this.results.contracts.totalCount})`);
    console.log(`  Network:      ${this.results.network.status === 'healthy' ? '✅' : '❌'} ${this.results.network.status}`);
    console.log(`  API Server:   ${this.results.api.status === 'healthy' ? '✅' : this.results.api.status === 'degraded' ? '⚠️' : '❌'} ${this.results.api.status}`);
    console.log(`  Database:     ${this.results.database.status === 'healthy' ? '✅' : this.results.database.status === 'not_configured' ? '⚠️' : '❌'} ${this.results.database.status}`);

    if (this.results.overall !== 'healthy') {
      console.log('\n⚠️  Recommendations:');
      
      if (this.results.environment.status !== 'healthy') {
        console.log('  - Check .env configuration');
      }
      
      if (this.results.contracts.status !== 'healthy') {
        console.log('  - Compile contracts: npx hardhat compile');
      }
      
      if (this.results.network.status !== 'healthy') {
        console.log('  - Start blockchain node: npx hardhat node');
      }
      
      if (this.results.environment.deployedContracts === 0) {
        console.log('  - Deploy contracts: npx hardhat run scripts/automation/deploy-contracts.ts --network localhost');
      }
      
      if (this.results.api.status !== 'healthy') {
        console.log('  - Start API server: node api-server-express.js');
      }
      
      if (this.results.database.status !== 'healthy') {
        console.log('  - Start database: see BLOCKCHAIN_DEPLOYMENT_GUIDE.md');
      }
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run health checks
const checker = new BlockchainHealthChecker();
checker.runAllChecks()
  .then(healthy => {
    process.exit(healthy ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
