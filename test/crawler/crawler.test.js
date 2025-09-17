import { expect } from 'chai';
import { RealWebCrawlerSystem } from '../../crawler/RealWebCrawlerSystem.js';
import MerkleTree from '../../utils/MerkleTree.js';
import ArtifactStorage from '../../utils/ArtifactStorage.js';
import { describe, it, beforeEach, afterEach } from 'vitest';

describe('RealWebCrawlerSystem', function () {
  let crawler;
  let mockPage;
  let mockBrowser;

  beforeEach(function () {
    // Mock Puppeteer page
    mockPage = {
      goto: async () => ({ status: () => 200 }),
      content: async () =>
        '<html><head><title>Test</title></head><body><div>Test content</div></body></html>',
      metrics: async () => ({
        JSHeapUsedSize: 1000000,
        JSHeapTotalSize: 2000000,
        Timestamp: Date.now(),
      }),
      close: async () => {},
    };

    // Mock Puppeteer browser
    mockBrowser = {
      newPage: async () => mockPage,
      close: async () => {},
    };

    // Mock Puppeteer - not needed for priority calculation tests
    // const puppeteer = require('puppeteer');
    // puppeteer.launch = async () => mockBrowser;

    crawler = new RealWebCrawlerSystem({
      maxConcurrency: 1,
      requestDelay: 100,
      maxDepth: 1,
      respectRobots: false,
      submitPoO: false,
    });
  });

  afterEach(async function () {
    if (crawler && crawler.isRunning) {
      await crawler.stop();
    }
  });

  describe('Initialization', function () {
    it('Should initialize with default config', function () {
      expect(crawler.config.maxConcurrency).to.equal(1);
      expect(crawler.config.requestDelay).to.equal(100);
      expect(crawler.config.maxDepth).to.equal(1);
      expect(crawler.isRunning).to.be.false;
    });

    it('Should initialize priority queue', function () {
      expect(crawler.priorityQueue).to.be.an('array');
      expect(crawler.priorityQueue).to.have.length(0);
    });

    it('Should initialize storage system', function () {
      expect(crawler.storage).to.be.instanceOf(ArtifactStorage);
    });
  });

  describe('URL Priority Calculation', function () {
    it('Should calculate priority for different URLs', async function () {
      const priority1 = await crawler.calculateUrlPriority(
        'https://example.com',
        1,
        'https://referrer.com'
      );
      const priority2 = await crawler.calculateUrlPriority(
        'https://subdomain.example.com',
        3,
        'https://referrer.com'
      );

      expect(priority1).to.be.a('number');
      expect(priority2).to.be.a('number');
      expect(priority1).to.be.greaterThan(priority2); // Closer to seed = higher priority
    });

    it('Should boost HTTPS URLs', async function () {
      const httpsPriority = await crawler.calculateUrlPriority(
        'https://example.com',
        2,
        'https://referrer.com'
      );
      const httpPriority = await crawler.calculateUrlPriority(
        'http://example.com',
        2,
        'https://referrer.com'
      );

      expect(httpsPriority).to.be.greaterThan(httpPriority);
    });

    it('Should handle invalid URLs gracefully', async function () {
      const priority = await crawler.calculateUrlPriority('invalid-url', 1, 'https://referrer.com');
      expect(priority).to.equal(1); // Default priority
    });
  });

  describe('Domain Authority Calculation', function () {
    it('Should calculate authority for different domains', async function () {
      const comAuthority = await crawler.getDomainAuthority('example.com');
      const orgAuthority = await crawler.getDomainAuthority('example.org');
      const subdomainAuthority = await crawler.getDomainAuthority('sub.example.com');

      expect(comAuthority).to.be.a('number');
      expect(orgAuthority).to.be.a('number');
      expect(subdomainAuthority).to.be.a('number');
      expect(comAuthority).to.be.greaterThan(subdomainAuthority);
    });

    it('Should cache domain authority', async function () {
      const authority1 = await crawler.getDomainAuthority('example.com');
      const authority2 = await crawler.getDomainAuthority('example.com');

      expect(authority1).to.equal(authority2);
      expect(crawler.domainAuthority.has('example.com')).to.be.true;
    });
  });

  describe('Merkle Proof Generation', function () {
    it('Should generate valid Merkle proof', function () {
      const analysis = {
        spaceSaved: 1024,
        optimizations: [{ type: 'unused-css', bytes: 512 }],
        domStats: { totalElements: 100 },
        performance: { loadTime: 1000 },
      };

      const proof = crawler.generateMerkleProof(analysis, 'https://example.com');

      expect(proof).to.have.property('root');
      expect(proof).to.have.property('proof');
      expect(proof).to.have.property('leaves');
      expect(proof.root).to.be.a('string');
      expect(proof.proof).to.be.an('array');
      expect(proof.leaves).to.be.an('array');
    });

    it('Should handle errors in proof generation', function () {
      const proof = crawler.generateMerkleProof(null, 'https://example.com');

      expect(proof).to.have.property('root');
      expect(proof).to.have.property('proof');
      expect(proof).to.have.property('leaves');
      expect(proof.root).to.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
    });
  });

  describe('Crawl ID Generation', function () {
    it('Should generate unique crawl IDs', function () {
      const analysis1 = { spaceSaved: 1024 };
      const analysis2 = { spaceSaved: 2048 };

      const id1 = crawler.generateCrawlId('https://example.com', analysis1);
      const id2 = crawler.generateCrawlId('https://example.com', analysis2);

      expect(id1).to.be.a('string');
      expect(id2).to.be.a('string');
      expect(id1).to.not.equal(id2);
    });

    it('Should generate consistent IDs for same input', function () {
      const analysis = { spaceSaved: 1024 };

      const id1 = crawler.generateCrawlId('https://example.com', analysis);
      const id2 = crawler.generateCrawlId('https://example.com', analysis);

      expect(id1).to.equal(id2);
    });
  });

  describe('Priority Queue Management', function () {
    it('Should add items to priority queue', function () {
      const urlData = {
        url: 'https://example.com',
        depth: 1,
        priority: 8.5,
        discoveredAt: new Date(),
      };

      crawler.addToPriorityQueue(urlData);

      expect(crawler.priorityQueue).to.have.length(1);
      expect(crawler.priorityQueue[0]).to.deep.include(urlData);
    });

    it('Should sort priority queue by priority', function () {
      const urlData1 = {
        url: 'https://example1.com',
        depth: 1,
        priority: 5.0,
        discoveredAt: new Date(),
      };
      const urlData2 = {
        url: 'https://example2.com',
        depth: 1,
        priority: 8.5,
        discoveredAt: new Date(),
      };
      const urlData3 = {
        url: 'https://example3.com',
        depth: 1,
        priority: 7.0,
        discoveredAt: new Date(),
      };

      crawler.addToPriorityQueue(urlData1);
      crawler.addToPriorityQueue(urlData2);
      crawler.addToPriorityQueue(urlData3);

      expect(crawler.priorityQueue[0].priority).to.equal(8.5); // Highest first
      expect(crawler.priorityQueue[1].priority).to.equal(7.0);
      expect(crawler.priorityQueue[2].priority).to.equal(5.0);
    });

    it('Should get next URL from priority queue', function () {
      const urlData = {
        url: 'https://example.com',
        depth: 1,
        priority: 8.5,
        discoveredAt: new Date(),
      };

      crawler.addToPriorityQueue(urlData);

      const nextUrl = crawler.getNextUrl();

      expect(nextUrl).to.deep.include(urlData);
      expect(crawler.priorityQueue).to.have.length(0);
    });

    it('Should return null for empty queue', function () {
      const nextUrl = crawler.getNextUrl();
      expect(nextUrl).to.be.null;
    });
  });

  describe('Status Reporting', function () {
    it('Should return current status', function () {
      const status = crawler.getStatus();

      expect(status).to.have.property('isRunning');
      expect(status).to.have.property('sessionId');
      expect(status).to.have.property('activeCrawlers');
      expect(status).to.have.property('queueLength');
      expect(status).to.have.property('priorityQueueLength');
      expect(status).to.have.property('visitedCount');
      expect(status).to.have.property('totalOptimizations');
      expect(status).to.have.property('totalSpaceHarvested');
    });

    it('Should track optimization results', function () {
      const result = {
        url: 'https://example.com',
        spaceSaved: 1024,
        timestamp: new Date(),
      };

      crawler.optimizationResults.push(result);

      const status = crawler.getStatus();
      expect(status.totalOptimizations).to.equal(1);
      expect(status.totalSpaceHarvested).to.equal(1024);
    });
  });

  describe('Error Handling', function () {
    it('Should handle invalid URLs gracefully', async function () {
      const priority = await crawler.calculateUrlPriority('not-a-url', 1, 'https://referrer.com');
      expect(priority).to.equal(1); // Default priority
    });

    it('Should handle null analysis in proof generation', function () {
      const proof = crawler.generateMerkleProof(null, 'https://example.com');
      expect(proof).to.have.property('root');
      expect(proof.root).to.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
    });
  });
});
