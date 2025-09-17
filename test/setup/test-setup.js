const { ethers } = require('hardhat');
const { DOMSpaceHarvesterAPI } = require('../../api-server-express');

/**
 * Test setup utilities for DOM Space Harvester
 */

class TestSetup {
  constructor() {
    this.contracts = {};
    this.api = null;
    this.accounts = [];
  }

  async setupContracts() {
    console.log('🔧 Setting up test contracts...');

    const [owner, submitter, challenger, ...addrs] = await ethers.getSigners();
    this.accounts = { owner, submitter, challenger, addrs };

    // Deploy ProofOfOptimization
    const ProofOfOptimization = await ethers.getContractFactory('ProofOfOptimization');
    this.contracts.poo = await ProofOfOptimization.deploy(
      ethers.ZeroAddress, // token contract
      ethers.ZeroAddress // land contract
    );
    await this.contracts.poo.waitForDeployment();

    // Deploy DOMSpaceToken
    const DOMSpaceToken = await ethers.getContractFactory('DOMSpaceToken');
    this.contracts.token = await DOMSpaceToken.deploy();
    await this.contracts.token.waitForDeployment();

    // Deploy VirtualLandNFT
    const VirtualLandNFT = await ethers.getContractFactory('VirtualLandNFT');
    this.contracts.land = await VirtualLandNFT.deploy('DOM Space Land', 'DSL');
    await this.contracts.land.waitForDeployment();

    console.log('✅ Contracts deployed successfully');
    return this.contracts;
  }

  async setupAPI(options = {}) {
    console.log('🔧 Setting up test API...');

    const defaultOptions = {
      dbDisabled: true,
      blockchainEnabled: true,
      ...options,
    };

    // Set environment variables
    if (this.contracts.poo) {
      process.env.POO_CONTRACT_ADDRESS = await this.contracts.poo.getAddress();
    }
    if (this.contracts.token) {
      process.env.DSH_CONTRACT = await this.contracts.token.getAddress();
    }
    if (this.contracts.land) {
      process.env.LAND_CONTRACT_ADDRESS = await this.contracts.land.getAddress();
    }

    process.env.RPC_URL = 'http://localhost:8545';
    process.env.PRIVATE_KEY = this.accounts.owner.privateKey;
    process.env.BLOCKCHAIN_ENABLED = 'true';

    this.api = new DOMSpaceHarvesterAPI(defaultOptions);
    await this.api.initializeBlockchain();

    console.log('✅ API setup successfully');
    return this.api;
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...');

    if (this.api) {
      await this.api.stop();
    }

    // Reset environment variables
    delete process.env.POO_CONTRACT_ADDRESS;
    delete process.env.DSH_CONTRACT;
    delete process.env.LAND_CONTRACT_ADDRESS;
    delete process.env.RPC_URL;
    delete process.env.PRIVATE_KEY;
    delete process.env.BLOCKCHAIN_ENABLED;

    console.log('✅ Cleanup completed');
  }

  async seedTestData() {
    console.log('🌱 Seeding test data...');

    if (!this.api) {
      throw new Error('API not initialized');
    }

    // Seed some PoO data
    const testPoOs = [
      {
        crawlId: ethers.keccak256(ethers.toUtf8Bytes('test-crawl-1')),
        merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('test-merkle-1')),
        bytesSaved: 1024,
        backlinksCount: 5,
        artifactCID: 'ipfs://test-cid-1',
      },
      {
        crawlId: ethers.keccak256(ethers.toUtf8Bytes('test-crawl-2')),
        merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('test-merkle-2')),
        bytesSaved: 2048,
        backlinksCount: 10,
        artifactCID: 'ipfs://test-cid-2',
      },
    ];

    for (const poo of testPoOs) {
      try {
        await this.contracts.poo.submitPoO(
          poo.crawlId,
          poo.merkleRoot,
          poo.bytesSaved,
          poo.backlinksCount,
          poo.artifactCID
        );
      } catch (error) {
        console.warn('Failed to seed PoO:', error.message);
      }
    }

    console.log('✅ Test data seeded');
  }

  getTestAccounts() {
    return this.accounts;
  }

  getContracts() {
    return this.contracts;
  }

  getAPI() {
    return this.api;
  }
}

module.exports = TestSetup;
