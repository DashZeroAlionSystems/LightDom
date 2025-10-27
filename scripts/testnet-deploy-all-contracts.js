#!/usr/bin/env node

/**
 * LightDom Testnet - Complete Contract Deployment Script
 *
 * Deploys all contracts for:
 * - Core blockchain (LightDomToken, ProofOfOptimization, OptimizationRegistry)
 * - NFTs (VirtualLandNFT, MetaverseCreatureNFT, MetaverseItemNFT)
 * - Metaverse (MetaverseMarketplace)
 * - SEO Services (SEODataMining)
 * - Storage (StorageContract, StorageToken, StorageGovernance)
 * - Utilities (FileManager, HostManager, DataEncryption, ModelStorageContract)
 */

import { ethers } from 'ethers';
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

// Load testnet configuration
const configPath = path.join(__dirname, '../config/testnet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Contract artifacts directory
const artifactsDir = path.join(__dirname, '../artifacts/contracts');

// Deployment results
const deployments = {
  network: config.network.name,
  chainId: config.network.chainId,
  timestamp: new Date().toISOString(),
  contracts: {}
};

/**
 * Load contract artifact
 */
function loadArtifact(contractName) {
  const artifactPath = path.join(artifactsDir, `${contractName}.sol/${contractName}.json`);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found for ${contractName} at ${artifactPath}`);
  }
  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}

/**
 * Deploy a contract
 */
async function deployContract(name, signer, args = []) {
  try {
    log.info(`Deploying ${name}...`);

    const artifact = loadArtifact(name);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    deployments.contracts[name] = {
      address,
      args,
      deployedAt: new Date().toISOString()
    };

    log.success(`${name} deployed to: ${address}`);
    return contract;
  } catch (error) {
    log.error(`Failed to deploy ${name}: ${error.message}`);
    throw error;
  }
}

/**
 * Save deployment information
 */
function saveDeployments() {
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, `testnet-${config.network.chainId}.json`);
  fs.writeFileSync(filename, JSON.stringify(deployments, null, 2));
  log.success(`Deployment info saved to: ${filename}`);
}

/**
 * Main deployment function
 */
async function main() {
  log.section('LightDom Testnet - Contract Deployment');

  // Connect to network
  log.info(`Connecting to ${config.network.rpcUrl}...`);
  const provider = new ethers.JsonRpcProvider(config.network.rpcUrl);

  // Get deployer account
  const wallet = ethers.Wallet.fromPhrase(config.accounts.mnemonic);
  const signer = wallet.connect(provider);

  const deployerAddress = await signer.getAddress();
  const balance = await provider.getBalance(deployerAddress);

  log.success(`Connected to network`);
  log.info(`Deployer: ${deployerAddress}`);
  log.info(`Balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy Core Blockchain Contracts
  log.section('Core Blockchain Contracts');

  const lightDomToken = await deployContract('LightDomToken', signer);
  const lightDomTokenAddress = await lightDomToken.getAddress();

  const proofOfOptimization = await deployContract('ProofOfOptimization', signer, [lightDomTokenAddress]);
  const proofOfOptimizationAddress = await proofOfOptimization.getAddress();

  const optimizationRegistry = await deployContract('OptimizationRegistry', signer, [
    lightDomTokenAddress,
    proofOfOptimizationAddress
  ]);

  // Deploy NFT Contracts
  if (config.contracts.VirtualLandNFT.enabled) {
    log.section('NFT Contracts');

    await deployContract('VirtualLandNFT', signer, [lightDomTokenAddress]);
    await deployContract('MetaverseCreatureNFT', signer);
    await deployContract('MetaverseItemNFT', signer);
  }

  // Deploy Metaverse Contracts
  if (config.contracts.MetaverseMarketplace.enabled) {
    log.section('Metaverse Contracts');

    await deployContract('MetaverseMarketplace', signer, [
      config.contracts.MetaverseMarketplace.platformFee
    ]);
  }

  // Deploy SEO Contracts
  if (config.contracts.SEODataMining.enabled) {
    log.section('SEO Service Contracts');

    await deployContract('SEODataMining', signer, [lightDomTokenAddress]);
  }

  // Deploy Storage Contracts
  if (config.contracts.StorageContract.enabled) {
    log.section('Storage Contracts');

    const storageToken = await deployContract('StorageToken', signer);
    const storageTokenAddress = await storageToken.getAddress();

    const storageContract = await deployContract('StorageContract', signer, [storageTokenAddress]);
    const storageContractAddress = await storageContract.getAddress();

    await deployContract('StorageGovernance', signer, [
      storageTokenAddress,
      storageContractAddress
    ]);
  }

  // Deploy Utility Contracts
  if (config.contracts.FileManager.enabled) {
    log.section('Utility Contracts');

    await deployContract('FileManager', signer);
    await deployContract('HostManager', signer);
    await deployContract('DataEncryption', signer);
    await deployContract('ModelStorageContract', signer);
  }

  // Deploy Enhanced Token Contracts
  log.section('Enhanced Token Contracts');

  await deployContract('DOMSpaceToken', signer);
  await deployContract('EnhancedDOMSpaceToken', signer);

  // Save deployment information
  log.section('Saving Deployment Information');
  saveDeployments();

  // Summary
  log.section('Deployment Summary');
  log.success(`Total contracts deployed: ${Object.keys(deployments.contracts).length}`);
  log.info(`Network: ${deployments.network} (Chain ID: ${deployments.chainId})`);
  log.info(`Timestamp: ${deployments.timestamp}`);

  console.log('\nDeployed Contracts:');
  for (const [name, info] of Object.entries(deployments.contracts)) {
    console.log(`  ${colors.green}•${colors.reset} ${name}: ${info.address}`);
  }

  log.section('Deployment Complete');
  log.success('All contracts deployed successfully!');
  log.info('You can now start the testnet with: npm run testnet:start');
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    log.error(`Deployment failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
