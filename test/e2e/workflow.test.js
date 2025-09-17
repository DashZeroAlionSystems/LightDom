import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DOMSpaceHarvesterAPI } from '../../api-server-express.js';
import { RealWebCrawlerSystem } from '../../crawler/RealWebCrawlerSystem.js';
import { describe, it, before, after } from 'vitest';

describe('End-to-End Workflow', function() {
  let api;
  let crawler;
  let pooContract;
  let tokenContract;
  let owner;

  beforeEach(async function() {
    [owner] = await ethers.getSigners();
    
    // Deploy contracts
    const ProofOfOptimization = await ethers.getContractFactory("ProofOfOptimization");
    const DOMSpaceToken = await ethers.getContractFactory("DOMSpaceToken");
    
    tokenContract = await DOMSpaceToken.deploy();
    pooContract = await ProofOfOptimization.deploy(
      await tokenContract.getAddress(),
      ethers.ZeroAddress
    );
    
    await tokenContract.waitForDeployment();
    await pooContract.waitForDeployment();
    
    // Setup API
    process.env.POO_CONTRACT_ADDRESS = await pooContract.getAddress();
    process.env.DSH_CONTRACT = await tokenContract.getAddress();
    process.env.RPC_URL = 'http://localhost:8545';
    process.env.PRIVATE_KEY = owner.privateKey;
    process.env.BLOCKCHAIN_ENABLED = 'true';
    
    api = new DOMSpaceHarvesterAPI({
      dbDisabled: true,
      blockchainEnabled: true
    });
    
    await api.initializeBlockchain();
  });

  afterEach(async function() {
    if (crawler && crawler.isRunning) {
      await crawler.stop();
    }
    if (api) {
      await api.stop();
    }
  });

  describe('Complete Crawl-to-PoO Workflow', function() {
    it('Should complete full workflow from crawl to PoO submission', async function() {
      // 1. Start crawler
      const startResponse = await api.app.inject({
        method: 'POST',
        url: '/api/crawler/start',
        payload: {
          maxConcurrency: 1,
          requestDelay: 100,
          maxDepth: 1,
          respectRobots: false
        }
      });
      
      expect(startResponse.statusCode).to.equal(200);
      const startResult = JSON.parse(startResponse.payload);
      expect(startResult.sessionId).to.be.a('string');
      
      // 2. Wait for crawler to process some URLs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Check crawler status
      const statusResponse = await api.app.inject({
        method: 'GET',
        url: '/api/crawler/status'
      });
      
      expect(statusResponse.statusCode).to.equal(200);
      const status = JSON.parse(statusResponse.payload);
      expect(status.isRunning).to.be.true;
      
      // 4. Stop crawler
      const stopResponse = await api.app.inject({
        method: 'POST',
        url: '/api/crawler/stop'
      });
      
      expect(stopResponse.statusCode).to.equal(200);
      
      // 5. Check final status
      const finalStatusResponse = await api.app.inject({
        method: 'GET',
        url: '/api/crawler/status'
      });
      
      expect(finalStatusResponse.statusCode).to.equal(200);
      const finalStatus = JSON.parse(finalStatusResponse.payload);
      expect(finalStatus.isRunning).to.be.false;
    });

    it('Should handle PoO submission workflow', async function() {
      // 1. Submit PoO
      const crawlId = ethers.keccak256(ethers.toUtf8Bytes('e2e-test-crawl'));
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes('e2e-test-merkle'));
      
      const submitResponse = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-poo',
        payload: {
          crawlId,
          merkleRoot,
          bytesSaved: 2048,
          backlinksCount: 10,
          artifactCID: 'ipfs://e2e-test-cid'
        }
      });
      
      expect(submitResponse.statusCode).to.equal(200);
      const submitResult = JSON.parse(submitResponse.payload);
      expect(submitResult.success).to.be.true;
      
      // 2. Verify PoO status
      const statusResponse = await api.app.inject({
        method: 'GET',
        url: `/api/blockchain/poo/${crawlId}`
      });
      
      expect(statusResponse.statusCode).to.equal(200);
      const status = JSON.parse(statusResponse.payload);
      expect(status.crawlId).to.equal(crawlId);
      expect(status.bytesSaved).to.equal('2048');
      
      // 3. Check blockchain statistics
      const statsResponse = await api.app.inject({
        method: 'GET',
        url: '/api/blockchain/stats'
      });
      
      expect(statsResponse.statusCode).to.equal(200);
      const stats = JSON.parse(statsResponse.payload);
      expect(parseInt(stats.totalProofs)).to.be.greaterThan(0);
    });

    it('Should handle batch PoO submission workflow', async function() {
      const batch = [
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes('batch-e2e-1')),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('merkle1')),
          bytesSaved: 1024,
          backlinksCount: 5,
          artifactCID: 'ipfs://batch1'
        },
        {
          crawlId: ethers.keccak256(ethers.toUtf8Bytes('batch-e2e-2')),
          merkleRoot: ethers.keccak256(ethers.toUtf8Bytes('merkle2')),
          bytesSaved: 1536,
          backlinksCount: 8,
          artifactCID: 'ipfs://batch2'
        }
      ];
      
      const batchHash = ethers.keccak256(ethers.toUtf8Bytes('e2e-batch-hash'));
      const signature = ethers.keccak256(ethers.toUtf8Bytes('e2e-signature'));
      
      const response = await api.app.inject({
        method: 'POST',
        url: '/api/blockchain/submit-batch-poo',
        payload: {
          batch,
          batchHash,
          signature,
          timestamp: Date.now()
        }
      });
      
      expect(response.statusCode).to.equal(200);
      const result = JSON.parse(response.payload);
      expect(result.success).to.be.true;
      expect(result.batchSize).to.equal(2);
    });
  });

  describe('Crawler with PoO Integration', function() {
    it('Should integrate crawler with PoO submission', async function() {
      // Create crawler with PoO submission enabled
      crawler = new RealWebCrawlerSystem({
        maxConcurrency: 1,
        requestDelay: 100,
        maxDepth: 1,
        respectRobots: false,
        submitPoO: true,
        apiUrl: 'http://localhost:3001'
      });
      
      // Mock the PoO submission
      const originalSubmit = crawler.submitProofOfOptimization;
      let submittedPoOs = [];
      crawler.submitProofOfOptimization = async function(result) {
        submittedPoOs.push(result);
        return { success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) };
      };
      
      // Start crawler
      await crawler.start(['https://example.com']);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stop crawler
      await crawler.stop();
      
      // Verify PoO submissions were attempted
      expect(submittedPoOs.length).to.be.greaterThan(0);
      expect(submittedPoOs[0]).to.have.property('crawlId');
      expect(submittedPoOs[0]).to.have.property('merkleRoot');
      expect(submittedPoOs[0]).to.have.property('spaceSaved');
    });
  });

  describe('Metrics and Monitoring Workflow', function() {
    it('Should provide comprehensive metrics', async function() {
      // 1. Check Prometheus metrics
      const metricsResponse = await api.app.inject({
        method: 'GET',
        url: '/metrics'
      });
      
      expect(metricsResponse.statusCode).to.equal(200);
      expect(metricsResponse.payload).to.include('crawler_requests_total');
      expect(metricsResponse.payload).to.include('poo_submissions_total');
      
      // 2. Check JSON metrics
      const jsonMetricsResponse = await api.app.inject({
        method: 'GET',
        url: '/api/metrics'
      });
      
      expect(jsonMetricsResponse.statusCode).to.equal(200);
      const metrics = JSON.parse(jsonMetricsResponse.payload);
      expect(metrics).to.have.property('counters');
      expect(metrics).to.have.property('gauges');
      expect(metrics).to.have.property('histograms');
      
      // 3. Check detailed health
      const healthResponse = await api.app.inject({
        method: 'GET',
        url: '/api/health/detailed'
      });
      
      expect(healthResponse.statusCode).to.equal(200);
      const health = JSON.parse(healthResponse.payload);
      expect(health).to.have.property('status');
      expect(health).to.have.property('metrics');
      expect(health).to.have.property('supervisor');
    });
  });

  describe('Error Recovery Workflow', function() {
    it('Should handle and recover from errors', async function() {
      // 1. Start crawler
      const startResponse = await api.app.inject({
        method: 'POST',
        url: '/api/crawler/start',
        payload: {
          maxConcurrency: 1,
          requestDelay: 50,
          maxDepth: 1
        }
      });
      
      expect(startResponse.statusCode).to.equal(200);
      
      // 2. Simulate error by stopping API
      await api.stop();
      
      // 3. Restart API
      api = new DOMSpaceHarvesterAPI({
        dbDisabled: true,
        blockchainEnabled: true
      });
      
      await api.initializeBlockchain();
      
      // 4. Verify system is still functional
      const healthResponse = await api.app.inject({
        method: 'GET',
        url: '/api/health'
      });
      
      expect(healthResponse.statusCode).to.equal(200);
    });
  });

  describe('Performance Workflow', function() {
    it('Should handle concurrent operations', async function() {
      const promises = [];
      
      // Submit multiple PoOs concurrently
      for (let i = 0; i < 5; i++) {
        const promise = api.app.inject({
          method: 'POST',
          url: '/api/blockchain/submit-poo',
          payload: {
            crawlId: ethers.keccak256(ethers.toUtf8Bytes(`concurrent-test-${i}`)),
            merkleRoot: ethers.keccak256(ethers.toUtf8Bytes(`merkle-${i}`)),
            bytesSaved: 1024 + i * 100,
            backlinksCount: 5 + i,
            artifactCID: `ipfs://concurrent-${i}`
          }
        });
        promises.push(promise);
      }
      
      const results = await Promise.all(promises);
      
      // All should succeed
      results.forEach(result => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });
});
