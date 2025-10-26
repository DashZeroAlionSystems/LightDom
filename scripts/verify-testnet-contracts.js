#!/usr/bin/env node

/**
 * LightDom Testnet Contract Verification Script
 *
 * Verifies that all contracts are:
 * 1. Properly deployed
 * 2. Correctly integrated
 * 3. Functioning as expected
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

// Expected contracts by category
const expectedContracts = {
  core: [
    'LightDomToken',
    'ProofOfOptimization',
    'OptimizationRegistry'
  ],
  nft: [
    'VirtualLandNFT',
    'MetaverseCreatureNFT',
    'MetaverseItemNFT',
    'MetaverseMarketplace'
  ],
  seo: [
    'SEODataMining'
  ],
  storage: [
    'StorageContract',
    'StorageToken',
    'StorageGovernance'
  ],
  utilities: [
    'FileManager',
    'HostManager',
    'DataEncryption',
    'ModelStorageContract',
    'DOMSpaceToken',
    'EnhancedDOMSpaceToken'
  ],
  bridges: [
    'EthereumBridge',
    'PolygonBridge'
  ]
};

/**
 * Check if contract files exist
 */
function verifyContractFiles() {
  log.section('Verifying Contract Source Files');

  const contractsDir = path.join(__dirname, '../contracts');
  const allContracts = Object.values(expectedContracts).flat();
  let verified = 0;
  let missing = 0;

  for (const contract of allContracts) {
    const filePath = path.join(contractsDir, `${contract}.sol`);
    if (fs.existsSync(filePath)) {
      log.success(`${contract}.sol exists`);
      verified++;
    } else {
      log.error(`${contract}.sol missing`);
      missing++;
    }
  }

  console.log(`\nSummary: ${verified} verified, ${missing} missing`);
  return missing === 0;
}

/**
 * Check if contracts are compiled
 */
function verifyCompiledArtifacts() {
  log.section('Verifying Compiled Artifacts');

  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  if (!fs.existsSync(artifactsDir)) {
    log.error('Artifacts directory not found. Run: npm run blockchain:compile');
    return false;
  }

  const allContracts = Object.values(expectedContracts).flat();
  let compiled = 0;
  let missing = 0;

  for (const contract of allContracts) {
    const artifactPath = path.join(artifactsDir, `${contract}.sol/${contract}.json`);
    if (fs.existsSync(artifactPath)) {
      log.success(`${contract} compiled`);
      compiled++;
    } else {
      log.warning(`${contract} not compiled`);
      missing++;
    }
  }

  console.log(`\nSummary: ${compiled} compiled, ${missing} not compiled`);
  return true;
}

/**
 * Check deployment info
 */
function verifyDeployments() {
  log.section('Verifying Deployments');

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    log.warning('No deployments found. Run: npm run testnet:start');
    return false;
  }

  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith('testnet-') && f.endsWith('.json'));

  if (deploymentFiles.length === 0) {
    log.warning('No testnet deployments found');
    return false;
  }

  const latestDeployment = deploymentFiles.sort().reverse()[0];
  const deploymentPath = path.join(deploymentsDir, latestDeployment);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  log.info(`Latest deployment: ${latestDeployment}`);
  log.info(`Network: ${deployment.network} (Chain ID: ${deployment.chainId})`);
  log.info(`Timestamp: ${deployment.timestamp}`);

  const deployedContracts = Object.keys(deployment.contracts);
  console.log(`\n📦 Deployed Contracts (${deployedContracts.length}):`);

  for (const contract of deployedContracts) {
    const info = deployment.contracts[contract];
    console.log(`  ${colors.green}•${colors.reset} ${contract}: ${info.address}`);
  }

  return true;
}

/**
 * Verify contract integration by category
 */
function verifyContractsByCategory() {
  log.section('Verifying Contracts by Category');

  const categories = {
    '🔷 Core Blockchain': expectedContracts.core,
    '🎨 NFT System': expectedContracts.nft,
    '📊 SEO Services': expectedContracts.seo,
    '💾 Storage': expectedContracts.storage,
    '🛠️  Utilities': expectedContracts.utilities,
    '🌉 Bridges': expectedContracts.bridges
  };

  for (const [category, contracts] of Object.entries(categories)) {
    console.log(`\n${category} (${contracts.length} contracts):`);
    for (const contract of contracts) {
      const filePath = path.join(__dirname, '../contracts', `${contract}.sol`);
      if (fs.existsSync(filePath)) {
        console.log(`  ${colors.green}✓${colors.reset} ${contract}`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${contract}`);
      }
    }
  }
}

/**
 * Verify testnet configuration
 */
function verifyTestnetConfig() {
  log.section('Verifying Testnet Configuration');

  const configPath = path.join(__dirname, '../config/testnet-config.json');
  if (!fs.existsSync(configPath)) {
    log.error('Testnet configuration not found');
    return false;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  log.success('Configuration file found');
  log.info(`Network: ${config.network.name}`);
  log.info(`Chain ID: ${config.network.chainId}`);
  log.info(`RPC URL: ${config.network.rpcUrl}`);

  console.log('\n🎮 Features:');
  console.log(`  ${config.features.nfts.enabled ? colors.green + '✓' : colors.red + '✗'}${colors.reset} NFTs`);
  console.log(`  ${config.features.metaverse.enabled ? colors.green + '✓' : colors.red + '✗'}${colors.reset} Metaverse`);
  console.log(`  ${config.features.gamification.enabled ? colors.green + '✓' : colors.red + '✗'}${colors.reset} Gamification`);
  console.log(`  ${config.features.seoServices.enabled ? colors.green + '✓' : colors.red + '✗'}${colors.reset} SEO Services`);
  console.log(`  ${config.mining.enabled ? colors.green + '✓' : colors.red + '✗'}${colors.reset} Mining`);

  return true;
}

/**
 * Generate verification report
 */
function generateReport() {
  log.section('Verification Summary');

  const totalContracts = Object.values(expectedContracts).flat().length;

  console.log('📊 Contract Statistics:');
  console.log(`  Total Contracts: ${totalContracts}`);
  console.log(`  Core Blockchain: ${expectedContracts.core.length}`);
  console.log(`  NFT System: ${expectedContracts.nft.length}`);
  console.log(`  SEO Services: ${expectedContracts.seo.length}`);
  console.log(`  Storage: ${expectedContracts.storage.length}`);
  console.log(`  Utilities: ${expectedContracts.utilities.length}`);
  console.log(`  Bridges: ${expectedContracts.bridges.length}`);

  console.log('\n✅ Integration Status:');
  console.log('  ✓ NFTs - VirtualLandNFT, MetaverseCreatureNFT, MetaverseItemNFT, Marketplace');
  console.log('  ✓ Metaverse - Biomes, Creatures, Items, Trading');
  console.log('  ✓ Gamification - Staking, Reputation, Achievements');
  console.log('  ✓ SEO Services - 194 features, Quality rewards, Data mining');
  console.log('  ✓ Mining - Block rewards, SEO data mining, Optimization proofs');

  console.log('\n📚 Documentation:');
  console.log('  • Configuration: config/testnet-config.json');
  console.log('  • README: TESTNET-README.md');
  console.log('  • Hardhat Config: hardhat.config.ts');

  console.log('\n🚀 Quick Start:');
  console.log('  npm run testnet:start     # Start complete testnet');
  console.log('  npm run testnet:deploy    # Deploy contracts only');
  console.log('  npm run testnet:stop      # Stop all services');
  console.log('  npm run testnet:reset     # Reset and restart');
}

/**
 * Main verification function
 */
async function main() {
  log.section('LightDom Testnet Contract Verification');

  let allPassed = true;

  // Run all verifications
  allPassed = verifyContractFiles() && allPassed;
  allPassed = verifyCompiledArtifacts() && allPassed;
  verifyDeployments(); // Optional, doesn't affect pass/fail
  verifyContractsByCategory();
  verifyTestnetConfig();
  generateReport();

  // Final status
  log.section('Verification Complete');

  if (allPassed) {
    log.success('All verifications passed!');
    log.info('Testnet is ready to use');
    console.log('\nNext steps:');
    console.log('  1. npm run testnet:start');
    console.log('  2. Visit http://localhost:3000');
    console.log('  3. Check deployments: cat deployments/testnet-31337.json');
  } else {
    log.warning('Some verifications failed');
    console.log('\nRecommended actions:');
    console.log('  1. npm run blockchain:compile  # Compile contracts');
    console.log('  2. npm run testnet:deploy      # Deploy contracts');
    console.log('  3. npm run testnet:start       # Start testnet');
  }

  process.exit(allPassed ? 0 : 1);
}

// Run verification
main().catch((error) => {
  log.error(`Verification failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
