/**
 * URL Seeding Service Tests
 * 
 * Unit and integration tests for the URL seeding service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { URLSeedingService } from '../services/url-seeding-service.js';
import { BacklinkService } from '../services/backlink-service.js';
import SeedingConfigManager from '../services/seeding-config-manager.js';
import { EventEmitter } from 'events';

describe('URLSeedingService', () => {
  let service;
  let mockDb;
  let mockCrawler;

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 })
    };

    // Mock crawler
    mockCrawler = new EventEmitter();

    // Create service instance
    service = new URLSeedingService({
      instanceId: 'test_instance',
      db: mockDb,
      crawler: mockCrawler,
      maxSeedsPerInstance: 100,
      enableSearchAlgorithms: true,
      enableRelatedURLDiscovery: true,
      enableBacklinkGeneration: true
    });
  });

  afterEach(async () => {
    if (service.isRunning) {
      await service.stop();
    }
  });

  describe('Service Lifecycle', () => {
    it('should initialize with correct instance ID', () => {
      expect(service.instanceId).toBe('test_instance');
      expect(service.isRunning).toBe(false);
    });

    it('should start service successfully', async () => {
      const result = await service.start();
      
      expect(service.isRunning).toBe(true);
      expect(result.instanceId).toBe('test_instance');
      expect(result.status).toBe('running');
    });

    it('should stop service successfully', async () => {
      await service.start();
      await service.stop();
      
      expect(service.isRunning).toBe(false);
    });

    it('should pause and resume service', async () => {
      await service.start();
      
      service.pause();
      expect(service.isPaused).toBe(true);
      
      service.resume();
      expect(service.isPaused).toBe(false);
    });

    it('should throw error if starting already running service', async () => {
      await service.start();
      
      await expect(service.start()).rejects.toThrow('already running');
    });
  });

  describe('Seed Management', () => {
    beforeEach(async () => {
      await service.start();
    });

    it('should add URL seed successfully', async () => {
      const seed = await service.addSeed('https://example.com', {
        source: 'manual',
        priority: 8
      });

      expect(seed.url).toBe('https://example.com');
      expect(seed.source).toBe('manual');
      expect(seed.priority).toBe(8);
      expect(service.stats.totalSeeds).toBe(1);
    });

    it('should normalize URLs when adding seeds', async () => {
      await service.addSeed('https://example.com/page/', {});
      const seeds = service.getSeeds();
      
      expect(seeds[0].url).toBe('https://example.com/page');
    });

    it('should remove URL seed successfully', async () => {
      await service.addSeed('https://example.com');
      const removed = await service.removeSeed('https://example.com');
      
      expect(removed).toBe(true);
      expect(service.stats.activeSeeds).toBe(0);
    });

    it('should prevent exceeding max seeds limit', async () => {
      // Add seeds up to limit
      for (let i = 0; i < 100; i++) {
        await service.addSeed(`https://example${i}.com`);
      }

      // Try to add one more
      await expect(
        service.addSeed('https://overflow.com')
      ).rejects.toThrow('Maximum seeds limit');
    });

    it('should get seeds with filters', async () => {
      await service.addSeed('https://example1.com', { priority: 8, status: 'active' });
      await service.addSeed('https://example2.com', { priority: 5, status: 'active' });
      await service.addSeed('https://example3.com', { priority: 3, status: 'paused' });

      const highPrioritySeeds = service.getSeeds({ minPriority: 7 });
      expect(highPrioritySeeds.length).toBe(1);

      const activeSeeds = service.getSeeds({ status: 'active' });
      expect(activeSeeds.length).toBe(2);
    });
  });

  describe('Search Algorithms', () => {
    beforeEach(async () => {
      service.config.keywords = ['tech', 'software'];
      service.config.topics = ['technology'];
      service.config.authorityDomains = ['github.com'];
      await service.start();
    });

    it('should calculate keyword relevance', async () => {
      const relevance = await service.keywordSearch(
        'https://tech-software.com/article',
        'https://source.com',
        {}
      );

      expect(relevance).toBeGreaterThan(0);
    });

    it('should calculate domain similarity', () => {
      const similarity = service.calculateDomainSimilarity(
        'blog.example.com',
        'shop.example.com'
      );

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should calculate path similarity', () => {
      const similarity = service.calculatePathSimilarity(
        '/products/electronics',
        '/products/computers'
      );

      expect(similarity).toBeGreaterThan(0);
    });

    it('should recognize authority domains', async () => {
      const relevance = await service.authoritySearch(
        'https://github.com/user/repo',
        'https://source.com',
        {}
      );

      expect(relevance).toBe(1.0);
    });

    it('should calculate overall URL relevance', async () => {
      const relevance = await service.calculateUrlRelevance(
        'https://tech-software.github.com/article',
        'https://source.com',
        { text: 'technology software article' }
      );

      expect(relevance).toBeGreaterThan(0);
      expect(relevance).toBeLessThanOrEqual(1);
    });
  });

  describe('Related URL Discovery', () => {
    beforeEach(async () => {
      await service.start();
    });

    it('should discover related URLs from crawl data', async () => {
      const crawlData = {
        links: [
          { href: 'https://related1.com', text: 'Related 1' },
          { href: 'https://related2.com', text: 'Related 2' },
          { href: 'https://related3.com', text: 'Related 3' }
        ]
      };

      const relatedUrls = await service.discoverRelatedUrls(
        'https://source.com',
        crawlData
      );

      expect(Array.isArray(relatedUrls)).toBe(true);
      expect(service.stats.discoveredUrls).toBeGreaterThan(0);
    });

    it('should filter low-quality URLs', async () => {
      service.config.minBacklinkQuality = 0.8;

      const crawlData = {
        links: [
          { href: 'https://lowquality.com', text: 'Low' }
        ]
      };

      const relatedUrls = await service.discoverRelatedUrls(
        'https://source.com',
        crawlData
      );

      // Low quality URLs should be filtered out
      expect(relatedUrls.length).toBe(0);
    });
  });

  describe('Backlink Management', () => {
    beforeEach(async () => {
      await service.start();
    });

    it('should add backlink successfully', async () => {
      await service.addBacklink(
        'https://source.com',
        'https://target.com',
        {
          relevance: 0.9,
          anchorText: 'Example Link',
          context: 'This is an example link'
        }
      );

      expect(service.stats.backlinksMapped).toBe(1);
      
      const backlinks = service.getBacklinks('https://source.com');
      expect(backlinks.length).toBe(1);
      expect(backlinks[0].target).toBe('https://target.com');
    });

    it('should get backlinks for URL', async () => {
      await service.addBacklink('https://source.com', 'https://target1.com');
      await service.addBacklink('https://source.com', 'https://target2.com');

      const backlinks = service.getBacklinks('https://source.com');
      expect(backlinks.length).toBe(2);
    });
  });

  describe('Crawler Integration', () => {
    beforeEach(async () => {
      await service.start();
    });

    it('should monitor crawler for new sites', async () => {
      const crawledData = {
        sites: [
          {
            url: 'https://crawled.com',
            data: {
              links: [
                { href: 'https://discovered.com', text: 'New Link' }
              ]
            }
          }
        ]
      };

      mockCrawler.emit('sitesCrawled', crawledData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.stats.crawledSites).toBe(1);
    });
  });

  describe('Status and Statistics', () => {
    it('should return correct status', async () => {
      await service.start();
      
      const status = service.getStatus();

      expect(status.instanceId).toBe('test_instance');
      expect(status.isRunning).toBe(true);
      expect(status.stats).toBeDefined();
      expect(status.config).toBeDefined();
    });

    it('should track statistics correctly', async () => {
      await service.start();
      await service.addSeed('https://example.com');
      await service.addBacklink('https://source.com', 'https://target.com');

      const status = service.getStatus();
      expect(status.stats.totalSeeds).toBe(1);
      expect(status.stats.backlinksMapped).toBe(1);
    });
  });
});

describe('BacklinkService', () => {
  let service;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 })
    };

    service = new BacklinkService({ db: mockDb });
  });

  describe('Backlink Analysis', () => {
    it('should analyze backlinks correctly', () => {
      const backlinks = [
        { source: 'https://source1.com', target: 'https://target.com', relevance: 0.9 },
        { source: 'https://source2.com', target: 'https://target.com', relevance: 0.7 },
        { source: 'https://source3.com', target: 'https://target.com', relevance: 0.3 }
      ];

      const analysis = service.analyzeBacklinks(backlinks);

      expect(analysis.totalBacklinks).toBe(3);
      expect(analysis.averageRelevance).toBeCloseTo(0.633, 2);
      expect(analysis.qualityDistribution.excellent).toBe(1);
      expect(analysis.qualityDistribution.good).toBe(1);
    });

    it('should calculate backlink quality', () => {
      const backlink = {
        source: 'https://source.com',
        target: 'https://target.com',
        relevance: 0.7,
        anchorText: 'Good Link',
        context: 'This is a good backlink'
      };

      const quality = service.calculateBacklinkQuality(backlink);

      expect(quality).toBeGreaterThan(0.7);
      expect(quality).toBeLessThanOrEqual(1.0);
    });
  });

  describe('SEO Recommendations', () => {
    it('should recommend increasing backlink count for low backlinks', () => {
      const analysis = {
        totalBacklinks: 5,
        highQualityBacklinks: 3,
        lowQualityBacklinks: 2
      };

      const recommendations = service.generateRecommendations(analysis);

      const backlinkRec = recommendations.find(r => 
        r.category === 'backlink-building'
      );

      expect(backlinkRec).toBeDefined();
      expect(backlinkRec.priority).toBe('high');
    });

    it('should recommend improving quality for low-quality backlinks', () => {
      const analysis = {
        totalBacklinks: 20,
        highQualityBacklinks: 5,
        lowQualityBacklinks: 15
      };

      const recommendations = service.generateRecommendations(analysis);

      const qualityRec = recommendations.find(r => 
        r.category === 'quality'
      );

      expect(qualityRec).toBeDefined();
    });
  });

  describe('Rich Snippets', () => {
    it('should generate rich snippet', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          title: 'Example Page',
          meta_description: 'This is an example',
          author: 'John Doe'
        }]
      });

      const snippet = await service.generateRichSnippet(
        'https://example.com',
        'Article'
      );

      expect(snippet['@context']).toBe('https://schema.org');
      expect(snippet['@type']).toBe('Article');
      expect(snippet.url).toBe('https://example.com');
    });

    it('should generate snippet markup', async () => {
      await service.generateRichSnippet('https://example.com', 'WebPage');
      
      const markup = service.generateSnippetMarkup('https://example.com');

      expect(markup).toContain('<script type="application/ld+json">');
      expect(markup).toContain('https://schema.org');
    });
  });
});

describe('SeedingConfigManager', () => {
  let manager;
  let mockDb;

  beforeEach(async () => {
    mockDb = {
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 })
    };

    manager = new SeedingConfigManager({
      db: mockDb,
      configDir: '/tmp/test-seeding-configs',
      templateDir: '/tmp/test-seeding-templates'
    });

    await manager.init();
  });

  describe('Configuration CRUD', () => {
    it('should create configuration', async () => {
      const config = await manager.createConfig({
        name: 'Test Config',
        clientId: 'client_123',
        maxSeedsPerInstance: 500,
        searchDepth: 3,
        minBacklinkQuality: 0.6
      });

      expect(config.instanceId).toBeDefined();
      expect(config.name).toBe('Test Config');
      expect(config.status).toBe('created');
    });

    it('should read configuration', async () => {
      const created = await manager.createConfig({
        name: 'Test Config',
        clientId: 'client_123'
      });

      const read = await manager.readConfig(created.instanceId);

      expect(read.instanceId).toBe(created.instanceId);
      expect(read.name).toBe('Test Config');
    });

    it('should update configuration', async () => {
      const created = await manager.createConfig({
        name: 'Original Name',
        clientId: 'client_123'
      });

      const updated = await manager.updateConfig(created.instanceId, {
        name: 'Updated Name'
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.instanceId).toBe(created.instanceId);
    });

    it('should delete configuration', async () => {
      const created = await manager.createConfig({
        name: 'To Delete',
        clientId: 'client_123'
      });

      await manager.deleteConfig(created.instanceId);

      await expect(
        manager.readConfig(created.instanceId)
      ).rejects.toThrow('not found');
    });

    it('should list configurations with filters', async () => {
      await manager.createConfig({
        name: 'Config 1',
        clientId: 'client_123',
        status: 'active'
      });

      await manager.createConfig({
        name: 'Config 2',
        clientId: 'client_456',
        status: 'paused'
      });

      const allConfigs = await manager.listConfigs();
      expect(allConfigs.length).toBe(2);

      const activeConfigs = await manager.listConfigs({ status: 'active' });
      expect(activeConfigs.length).toBe(1);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const config = {
        name: 'Valid Config',
        maxSeedsPerInstance: 1000,
        searchDepth: 3,
        minBacklinkQuality: 0.5,
        crawlerConfig: {
          maxDepth: 3,
          parallelCrawlers: 10
        }
      };

      const validation = manager.validateConfig(config);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should reject invalid configuration', () => {
      const config = {
        // Missing required fields
        maxSeedsPerInstance: 0, // Invalid
        searchDepth: -1, // Invalid
        minBacklinkQuality: 2.0 // Invalid
      };

      const validation = manager.validateConfig(config);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Template Management', () => {
    it('should create template', async () => {
      const template = await manager.createTemplate('test-template', {
        searchDepth: 3,
        keywords: ['test', 'template']
      });

      expect(template.templateName).toBe('test-template');
      expect(template.searchDepth).toBe(3);
    });

    it('should use template for config creation', async () => {
      await manager.createTemplate('ecommerce-template', {
        searchDepth: 3,
        keywords: ['shop', 'product'],
        maxSeedsPerInstance: 1000
      });

      const config = await manager.createConfig({
        templateName: 'ecommerce-template',
        clientId: 'client_123'
      });

      expect(config.keywords).toContain('shop');
      expect(config.maxSeedsPerInstance).toBe(1000);
    });
  });

  describe('Utility Functions', () => {
    it('should extract keywords from prompt', () => {
      const prompt = 'Create an SEO campaign for outdoor camping gear';
      const keywords = manager.extractKeywords(prompt);

      expect(keywords).toContain('campaign');
      expect(keywords).toContain('outdoor');
      expect(keywords).toContain('camping');
    });

    it('should extract topics from prompt', () => {
      const prompt = 'SEO and marketing for e-commerce business';
      const topics = manager.extractTopics(prompt);

      expect(topics.length).toBeGreaterThan(0);
    });

    it('should merge seed lists', () => {
      const seeds = {
        primarySeeds: ['https://example.com'],
        competitorSeeds: ['https://competitor.com'],
        authoritySeeds: ['https://authority.com']
      };

      const merged = manager.mergeSeeds(seeds);

      expect(merged.length).toBe(3);
      expect(merged).toContain('https://example.com');
    });
  });
});
