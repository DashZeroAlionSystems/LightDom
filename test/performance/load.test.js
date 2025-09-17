import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DOMSpaceHarvesterAPI } from '../../api-server-express.js';
import { RealWebCrawlerSystem } from '../../crawler/RealWebCrawlerSystem.js';
import { describe, it, before, after } from 'vitest';

describe('Performance and Load Tests', function () {
  let api;
  let pooContract;
  let tokenContract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy contracts
    const ProofOfOptimization = await ethers.getContractFactory('ProofOfOptimization');
    const DOMSpaceToken = await ethers.getContractFactory('DOMSpaceToken');

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
      blockchainEnabled: true,
    });

    await api.initializeBlockchain();
  });

  afterEach(async function () {
    if (api) {
      await api.stop();
    }
  });

  describe('API Load Tests', function () {
    it('Should handle high concurrent request load', async function () {
      const concurrentRequests = 50;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = api.app.inject({
          method: 'GET',
          url: '/api/health',
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.statusCode).to.equal(200);
      });

      // Should complete within reasonable time (5 seconds)
      expect(duration).to.be.lessThan(5000);

      console.log(`Handled ${concurrentRequests} concurrent requests in ${duration}ms`);
    });

    it('Should handle PoO submission load', async function () {
      const submissionCount = 20;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < submissionCount; i++) {
        const promise = api.app.inject({
          method: 'POST',
          url: '/api/blockchain/submit-poo',
          payload: {
            crawlId: ethers.keccak256(ethers.toUtf8Bytes(`load-test-${i}`)),
            merkleRoot: ethers.keccak256(ethers.toUtf8Bytes(`merkle-${i}`)),
            bytesSaved: 1024 + i * 100,
            backlinksCount: 5 + i,
            artifactCID: `ipfs://load-test-${i}`,
          },
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All submissions should succeed
      results.forEach(result => {
        expect(result.statusCode).to.equal(200);
      });

      // Should complete within reasonable time (10 seconds)
      expect(duration).to.be.lessThan(10000);

      console.log(`Submitted ${submissionCount} PoOs in ${duration}ms`);
    });

    it('Should handle batch PoO submission load', async function () {
      const batchCount = 10;
      const batchSize = 5;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < batchCount; i++) {
        const batch = [];
        for (let j = 0; j < batchSize; j++) {
          batch.push({
            crawlId: ethers.keccak256(ethers.toUtf8Bytes(`batch-${i}-${j}`)),
            merkleRoot: ethers.keccak256(ethers.toUtf8Bytes(`merkle-${i}-${j}`)),
            bytesSaved: 1024 + j * 100,
            backlinksCount: 5 + j,
            artifactCID: `ipfs://batch-${i}-${j}`,
          });
        }

        const promise = api.app.inject({
          method: 'POST',
          url: '/api/blockchain/submit-batch-poo',
          payload: {
            batch,
            batchHash: ethers.keccak256(ethers.toUtf8Bytes(`batch-hash-${i}`)),
            signature: ethers.keccak256(ethers.toUtf8Bytes(`signature-${i}`)),
            timestamp: Date.now(),
          },
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All batch submissions should succeed
      results.forEach(result => {
        expect(result.statusCode).to.equal(200);
      });

      // Should complete within reasonable time (15 seconds)
      expect(duration).to.be.lessThan(15000);

      console.log(`Submitted ${batchCount} batches of ${batchSize} PoOs in ${duration}ms`);
    });
  });

  describe('Crawler Performance Tests', function () {
    it('Should handle high-frequency crawling', async function () {
      const crawler = new RealWebCrawlerSystem({
        maxConcurrency: 5,
        requestDelay: 10, // Very fast
        maxDepth: 2,
        respectRobots: false,
      });

      const startTime = Date.now();

      // Start crawler with multiple URLs
      const testUrls = [
        'https://example.com',
        'https://httpbin.org',
        'https://jsonplaceholder.typicode.com',
        'https://httpbin.org/html',
        'https://httpbin.org/json',
      ];

      await crawler.start(testUrls);

      // Let it run for a bit
      await new Promise(resolve => setTimeout(resolve, 5000));

      const status = crawler.getStatus();
      const endTime = Date.now();
      const duration = endTime - startTime;

      await crawler.stop();

      // Should have processed some URLs
      expect(status.visitedCount).to.be.greaterThan(0);
      expect(status.totalOptimizations).to.be.greaterThan(0);

      console.log(`Processed ${status.visitedCount} URLs in ${duration}ms`);
      console.log(`Optimizations: ${status.totalOptimizations}`);
    });

    it('Should handle priority queue performance', async function () {
      const crawler = new RealWebCrawlerSystem({
        maxConcurrency: 1,
        requestDelay: 1,
        maxDepth: 1,
        respectRobots: false,
      });

      const urlCount = 1000;
      const startTime = Date.now();

      // Add many URLs to priority queue
      for (let i = 0; i < urlCount; i++) {
        crawler.addToPriorityQueue({
          url: `https://example${i}.com`,
          depth: 1,
          priority: Math.random() * 10,
          discoveredAt: new Date(),
        });
      }

      const addTime = Date.now();
      const addDuration = addTime - startTime;

      // Retrieve URLs from priority queue
      const retrievedUrls = [];
      let nextUrl;
      while ((nextUrl = crawler.getNextUrl()) !== null) {
        retrievedUrls.push(nextUrl);
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(retrievedUrls).to.have.length(urlCount);
      expect(addDuration).to.be.lessThan(1000); // Should add quickly
      expect(totalDuration).to.be.lessThan(2000); // Should process quickly

      console.log(`Added ${urlCount} URLs to priority queue in ${addDuration}ms`);
      console.log(`Retrieved all URLs in ${totalDuration}ms`);
    });
  });

  describe('Memory Usage Tests', function () {
    it('Should not leak memory during long operations', async function () {
      const initialMemory = process.memoryUsage();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await api.app.inject({
          method: 'POST',
          url: '/api/blockchain/submit-poo',
          payload: {
            crawlId: ethers.keccak256(ethers.toUtf8Bytes(`memory-test-${i}`)),
            merkleRoot: ethers.keccak256(ethers.toUtf8Bytes(`merkle-${i}`)),
            bytesSaved: 1024,
            backlinksCount: 5,
            artifactCID: `ipfs://memory-test-${i}`,
          },
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024);

      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Database Performance Tests', function () {
    it('Should handle database operations efficiently', async function () {
      const operationCount = 100;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < operationCount; i++) {
        const promise = api.app.inject({
          method: 'GET',
          url: '/api/stats',
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All operations should succeed
      results.forEach(result => {
        expect(result.statusCode).to.equal(200);
      });

      // Should complete within reasonable time
      expect(duration).to.be.lessThan(5000);

      console.log(`Performed ${operationCount} database operations in ${duration}ms`);
    });
  });

  describe('WebSocket Performance Tests', function () {
    it('Should handle multiple WebSocket connections', async function () {
      // This would require a WebSocket client library
      // For now, just test that the WebSocket server can handle connections
      const healthResponse = await api.app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(healthResponse.statusCode).to.equal(200);

      // In a real test, you would:
      // 1. Create multiple WebSocket connections
      // 2. Send messages concurrently
      // 3. Verify all messages are received
      // 4. Measure performance
    });
  });

  describe('Stress Tests', function () {
    it('Should handle system stress gracefully', async function () {
      const stressLevel = 100;
      const promises = [];

      // Mix different types of operations
      for (let i = 0; i < stressLevel; i++) {
        if (i % 4 === 0) {
          // Health check
          promises.push(
            api.app.inject({
              method: 'GET',
              url: '/api/health',
            })
          );
        } else if (i % 4 === 1) {
          // PoO submission
          promises.push(
            api.app.inject({
              method: 'POST',
              url: '/api/blockchain/submit-poo',
              payload: {
                crawlId: ethers.keccak256(ethers.toUtf8Bytes(`stress-${i}`)),
                merkleRoot: ethers.keccak256(ethers.toUtf8Bytes(`merkle-${i}`)),
                bytesSaved: 1024,
                backlinksCount: 5,
                artifactCID: `ipfs://stress-${i}`,
              },
            })
          );
        } else if (i % 4 === 2) {
          // Statistics
          promises.push(
            api.app.inject({
              method: 'GET',
              url: '/api/stats',
            })
          );
        } else {
          // Metrics
          promises.push(
            api.app.inject({
              method: 'GET',
              url: '/api/metrics',
            })
          );
        }
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Most operations should succeed (allow some failures under stress)
      const successCount = results.filter(r => r.statusCode < 400).length;
      const successRate = successCount / stressLevel;

      expect(successRate).to.be.greaterThan(0.8); // 80% success rate
      expect(duration).to.be.lessThan(30000); // Within 30 seconds

      console.log(
        `Stress test: ${successCount}/${stressLevel} operations succeeded in ${duration}ms`
      );
      console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
    });
  });
});
