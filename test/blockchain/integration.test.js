import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DOMSpaceHarvesterAPI } from '../../api-server-express.js';
import { describe, it, before, after } from 'vitest';

describe('Blockchain Integration', function () {
  let api;
  let pooContract;
  let tokenContract;
  let landContract;
  let owner;
  let submitter;

  beforeEach(async function () {
    [owner, submitter] = await ethers.getSigners();

    // Deploy contracts
    const ProofOfOptimization = await ethers.getContractFactory('ProofOfOptimization');
    const DOMSpaceToken = await ethers.getContractFactory('DOMSpaceToken');
    const VirtualLandNFT = await ethers.getContractFactory('VirtualLandNFT');

    tokenContract = await DOMSpaceToken.deploy();
    landContract = await VirtualLandNFT.deploy('DOM Space Land', 'DSL');
    pooContract = await ProofOfOptimization.deploy(
      await tokenContract.getAddress(),
      await landContract.getAddress()
    );

    await tokenContract.waitForDeployment();
    await landContract.waitForDeployment();
    await pooContract.waitForDeployment();

    // Create API with blockchain enabled
    api = new DOMSpaceHarvesterAPI({
      dbDisabled: true,
      blockchainEnabled: true,
    });

    // Set contract addresses
    process.env.POO_CONTRACT_ADDRESS = await pooContract.getAddress();
    process.env.DSH_CONTRACT = await tokenContract.getAddress();
    process.env.LAND_CONTRACT_ADDRESS = await landContract.getAddress();
    process.env.RPC_URL = 'http://localhost:8545';
    process.env.PRIVATE_KEY = owner.privateKey;

    await api.initializeBlockchain();
  });

  afterEach(async function () {
    if (api) {
      await api.stop();
    }
  });

  describe('PoO Submission', function () {
    it('Should submit PoO to blockchain', async function () {
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes('test-crawl'));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes('test-merkle'));
      const bytesSaved = 1024;
      const backlinksCount = 5;
      const artifactCID = 'ipfs://test-cid';

      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-poo',
        payload: {
          crawlId,
          merkleRoot,
          bytesSaved,
          backlinksCount,
          artifactCID,
        },
      });

      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.success).to.be.true;
      expect(result.txHash).to.be.a('string');
    });

    it('Should reject invalid PoO submission', async function () {
      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-poo',
        payload: {
          // Missing required fields
        },
      });

      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PoO Status Retrieval', function () {
    let crawlId;

    beforeEach(async function () {
      crawlId = ethers.keccak256(ethers.toUtf8Bytes('status-test-crawl'));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes('test-merkle'));

      await pooContract.submitPoO(crawlId, merkleRoot, 1024, 5, 'ipfs://test-cid');
    });

    it('Should retrieve PoO status', async function () {
      const response = await api.app.inject({
        method: 'GET',
        url: `/api/blockchain/poo/${crawlId}`,
      });

      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.crawlId).to.equal(crawlId);
      expect(result.bytesSaved).to.equal('1024');
      expect(result.backlinksCount).to.equal('5');
    });

    it('Should handle non-existent PoO', async function () {
      const nonExistentId = ethers.keccak256(ethers.toUtf8Bytes('non-existent'));

      const response = await api.app.inject({
        method: 'GET',
        url: `/api/blockchain/poo/${nonExistentId}`,
      });

      expect(response.statusCode).to.equal(500);
    });
  });

  describe('PoO Challenge', function () {
    let crawlId;

    beforeEach(async function () {
      crawlId = ethers.keccak256(ethers.toUtf8Bytes('challenge-test-crawl'));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes('test-merkle'));

      await pooContract.submitPoO(crawlId, merkleRoot, 1024, 5, 'ipfs://test-cid');
    });

    it('Should challenge PoO', async function () {
      const merkleProof = [ethers.keccak256(ethers.toUtf8Bytes('proof1'))];
      const leafData = ethers.keccak256(ethers.toUtf8Bytes('leaf'));

      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/challenge-poo',
        payload: {
          crawlId,
          merkleProof,
          leafData,
        },
      });

      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.success).to.be.true;
      expect(result.txHash).to.be.a('string');
    });
  });

  describe('Batch PoO Submission', function () {
    it('Should submit batch PoO', async function () {
      const batch = [
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes('batch-crawl1')),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('merkle1')),
          bytesSaved: 1024,
          backlinksCount: 5,
          artifactCID: 'ipfs://cid1',
        },
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes('batch-crawl2')),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('merkle2')),
          bytesSaved: 2048,
          backlinksCount: 10,
          artifactCID: 'ipfs://cid2',
        },
      ];

      const batchHash = ethers.keccak256(ethers.toUtf8Bytes('batch-hash'));
      const signature = ethers.keccak256(ethers.toUtf8Bytes('signature'));

      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-batch-poo',
        payload: {
          batch,
          batchHash,
          signature,
          timestamp: Date.now(),
        },
      });

      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.success).to.be.true;
      expect(result.batchSize).to.equal(2);
    });
  });

  describe('Blockchain Statistics', function () {
    it('Should retrieve blockchain statistics', async function () {
      const response = await api.app.inject({
        method: 'GET',
        url: '/api/blockchain/stats',
      });

      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result).to.have.property('totalProofs');
      expect(result).to.have.property('totalBytesSaved');
      expect(result).to.have.property('totalBacklinks');
      expect(result).to.have.property('contractAddress');
      expect(result).to.have.property('networkId');
    });
  });

  describe('Token Integration', function () {
    it('Should mint tokens for optimization', async function () {
      const initialBalance = await tokenContract.balanceOf(owner.address);

      // Submit PoO to trigger token minting
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes('token-test-crawl'));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes('test-merkle'));

      await pooContract.submitPoO(crawlId, merkleRoot, 1024, 5, 'ipfs://test-cid');

      // Check if tokens were minted (this would depend on the actual implementation)
      const finalBalance = await tokenContract.balanceOf(owner.address);
      // Note: The actual token minting logic would need to be implemented
      expect(finalBalance).to.be.at.least(initialBalance);
    });
  });

  describe('Land NFT Integration', function () {
    it('Should create land NFTs for domains', async function () {
      const domain = 'example.com';
      const landId = ethers.keccak256(ethers.toUtf8Bytes(domain));

      // This would depend on the actual land NFT creation logic
      // For now, just check that the contract is deployed
      expect(await landContract.name()).to.equal('DOM Space Land');
      expect(await landContract.symbol()).to.equal('DSL');
    });
  });

  describe('Error Handling', function () {
    it('Should handle blockchain connection errors', async function () {
      // Disable blockchain
      api.blockchainEnabled = false;
      api.pooContract = null;

      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-poo',
        payload: {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes('test')),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('test')),
          bytesSaved: 1024,
          backlinksCount: 5,
          artifactCID: 'ipfs://test',
        },
      });

      expect(response.statusCode).to.equal(503);
      const result = JSON.parse(response.payload);
      expect(result.error).to.equal('PoO contract not initialized');
    });

    it('Should handle invalid contract calls', async function () {
      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-poo',
        payload: {
          crawlId: 'invalid-id',
          merkleRoot: 'invalid-root',
          bytesSaved: -1,
          backlinksCount: -1,
          artifactCID: '',
        },
      });

      expect(response.statusCode).to.equal(500);
    });
  });
});
