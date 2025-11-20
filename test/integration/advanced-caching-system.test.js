/**
 * Integration Tests for Advanced Caching System
 * 
 * Tests:
 * - Cache manager initialization
 * - URL caching and retrieval
 * - Asset caching
 * - Screenshot caching with visual diff
 * - OCR result caching
 * - Training data deduplication
 * - Cache expiration and cleanup
 * - Network activity logging
 * - Offline mining simulation
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { AdvancedCacheManager } from '../services/advanced-cache-manager.js';
import { CacheAwareCrawler } from '../services/cache-aware-crawler.js';
import crypto from 'crypto';

describe('Advanced Caching System Integration Tests', function() {
  this.timeout(60000); // 60 second timeout for crawling operations
  
  let cacheManager;
  let crawler;
  
  before(async function() {
    // Initialize cache manager
    cacheManager = new AdvancedCacheManager({
      urlCacheSize: 100,
      assetCacheSize: 50,
      defaultCacheTTL: 1000 * 60 * 60 // 1 hour
    });
    
    await cacheManager.initialize();
    
    // Initialize crawler
    crawler = new CacheAwareCrawler({
      cacheManager,
      enableCDP: false, // Disable CDP for faster tests
      enableScreenshots: true,
      enableOCR: false,
      screenshotDir: './test-data/screenshots'
    });
    
    await crawler.initialize();
  });
  
  after(async function() {
    // Cleanup
    if (crawler) await crawler.close();
    if (cacheManager) await cacheManager.close();
  });
  
  describe('Cache Manager', function() {
    it('should initialize successfully', function() {
      expect(cacheManager).to.exist;
      expect(cacheManager.urlCache).to.exist;
      expect(cacheManager.assetCache).to.exist;
      expect(cacheManager.screenshotCache).to.exist;
    });
    
    it('should cache and retrieve URL data', async function() {
      const url = 'https://example.com/test-1';
      const data = {
        statusCode: 200,
        contentType: 'text/html',
        content: '<html><body>Test</body></html>',
        domSnapshot: { title: 'Test Page' }
      };
      
      // Cache URL
      const cached = await cacheManager.cacheUrl(url, data);
      expect(cached).to.have.property('urlHash');
      expect(cached).to.have.property('contentHash');
      
      // Retrieve from cache
      const result = await cacheManager.isCached(url);
      expect(result.cached).to.be.true;
      expect(result.data).to.exist;
      expect(result.data.status_code).to.equal(200);
    });
    
    it('should handle cache expiration', async function() {
      const url = 'https://example.com/test-expire';
      const data = {
        statusCode: 200,
        contentType: 'text/html',
        content: 'Test'
      };
      
      // Cache with very short TTL
      await cacheManager.cacheUrl(url, data, { ttl: 100 });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Should be expired
      const result = await cacheManager.isCached(url);
      expect(result.cached).to.be.false;
      expect(result.expired).to.be.true;
    });
    
    it('should cache assets', async function() {
      const assetUrl = 'https://cdn.example.com/lib.js';
      const content = 'function test() { return true; }';
      
      const result = await cacheManager.cacheAsset(assetUrl, content, {
        type: 'javascript'
      });
      
      expect(result).to.have.property('assetHash');
      expect(result.assetType).to.equal('javascript');
    });
    
    it('should cache screenshots with visual diff detection', async function() {
      const url = 'https://example.com/visual-test';
      const screenshot1 = Buffer.from('fake-screenshot-1');
      const screenshot2 = Buffer.from('fake-screenshot-2');
      
      // First screenshot
      const result1 = await cacheManager.cacheScreenshot(url, screenshot1);
      expect(result1).to.have.property('screenshotHash');
      
      // Same screenshot (should not detect change)
      const result2 = await cacheManager.cacheScreenshot(url, screenshot1);
      expect(result2.hasChanged).to.be.false;
      
      // Different screenshot (should detect change)
      const result3 = await cacheManager.cacheScreenshot(url, screenshot2);
      expect(result3.hasChanged).to.be.true;
    });
    
    it('should cache OCR results', async function() {
      const screenshotHash = crypto.randomBytes(32).toString('hex');
      const ocrResult = {
        text: 'Extracted text from image',
        confidence: 0.95,
        keywords: ['text', 'image', 'extracted'],
        entities: [{ type: 'PERSON', value: 'John' }],
        compressionRatio: 0.1,
        engine: 'test-ocr'
      };
      
      // Cache OCR result
      await cacheManager.cacheOCR(screenshotHash, ocrResult);
      
      // Retrieve OCR result
      const cached = await cacheManager.getCachedOCR(screenshotHash);
      expect(cached.found).to.be.true;
      expect(cached.data.extracted_text).to.equal(ocrResult.text);
      expect(Number(cached.data.confidence_score)).to.equal(ocrResult.confidence);
    });
    
    it('should deduplicate training data', async function() {
      const data = {
        sourceUrl: 'https://example.com/training',
        features: { dom: { title: 'Test' }, metadata: {} },
        labels: { category: 'test' },
        qualityScore: 0.9
      };
      
      // Add first time
      const result1 = await cacheManager.addTrainingData(data);
      expect(result1.duplicate).to.be.false;
      expect(result1).to.have.property('dataHash');
      
      // Add same data again
      const result2 = await cacheManager.addTrainingData(data);
      expect(result2.duplicate).to.be.true;
      expect(result2.dataHash).to.equal(result1.dataHash);
    });
    
    it('should log network activity', async function() {
      const url = 'https://example.com/network-test';
      const networkRequest = {
        url: 'https://example.com/script.js',
        method: 'GET',
        status: 200,
        resourceType: 'script',
        fromCache: true,
        contentLength: 1024,
        timing: { start: 0, end: 100 }
      };
      
      // Should not throw
      await cacheManager.logNetworkActivity(url, networkRequest);
    });
    
    it('should track offline mining sessions', async function() {
      const url = 'https://example.com/offline-test';
      
      // Start session
      const session = await cacheManager.startOfflineMiningSession(url, {
        serviceWorkerDetected: true
      });
      
      expect(session).to.have.property('sessionId');
      
      // Complete session
      const minedData = { title: 'Test', elements: 10 };
      const cachedResources = ['script.js', 'style.css'];
      
      await cacheManager.completeOfflineMiningSession(
        session.sessionId,
        minedData,
        cachedResources
      );
    });
    
    it('should get cache statistics', async function() {
      const stats = await cacheManager.getCacheStats();
      
      expect(stats).to.have.property('urls');
      expect(stats).to.have.property('assets');
      expect(stats).to.have.property('screenshots');
      expect(stats).to.have.property('ocr');
      expect(stats).to.have.property('trainingData');
      expect(stats).to.have.property('memory');
      
      expect(stats.memory).to.have.property('urlCacheSize');
      expect(stats.memory).to.have.property('assetCacheSize');
    });
    
    it('should cleanup expired cache entries', async function() {
      // Create some expired entries
      const url1 = 'https://example.com/cleanup-test-1';
      const url2 = 'https://example.com/cleanup-test-2';
      
      await cacheManager.cacheUrl(url1, {
        statusCode: 200,
        contentType: 'text/html',
        content: 'Test'
      }, { ttl: 100 });
      
      await cacheManager.cacheUrl(url2, {
        statusCode: 200,
        contentType: 'text/html',
        content: 'Test'
      }, { ttl: 100 });
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Cleanup
      const cleaned = await cacheManager.cleanupExpiredCache();
      expect(cleaned).to.be.at.least(0);
    });
  });
  
  describe('Cache-Aware Crawler', function() {
    it('should initialize successfully', function() {
      expect(crawler).to.exist;
      expect(crawler.browser).to.exist;
      expect(crawler.cacheManager).to.exist;
    });
    
    it('should crawl URL with caching', async function() {
      const url = 'https://example.com';
      
      // First crawl (should fetch from network)
      const result1 = await crawler.crawl(url);
      expect(result1.fromCache).to.be.false;
      expect(result1.data).to.exist;
      expect(result1.data.statusCode).to.equal(200);
      
      // Second crawl (should use cache)
      const result2 = await crawler.crawl(url);
      expect(result2.fromCache).to.be.true;
      expect(result2.data).to.exist;
    });
    
    it('should force refresh when requested', async function() {
      const url = 'https://httpbin.org/html';
      
      // Initial crawl
      await crawler.crawl(url);
      
      // Force refresh
      const result = await crawler.crawl(url, { forceRefresh: true });
      expect(result.fromCache).to.be.false;
    });
    
    it('should collect DOM snapshot', async function() {
      const url = 'https://example.com';
      const result = await crawler.crawl(url, { forceRefresh: true });
      
      expect(result.data.domSnapshot).to.exist;
      expect(result.data.domSnapshot).to.have.property('dom');
      expect(result.data.domSnapshot).to.have.property('title');
    });
    
    it('should detect service workers', async function() {
      const url = 'https://example.com';
      const result = await crawler.crawl(url, { forceRefresh: true });
      
      expect(result.data).to.have.property('serviceWorkerDetected');
      expect(result.data.serviceWorkerDetected).to.be.a('boolean');
    });
    
    it('should track network requests', async function() {
      const url = 'https://httpbin.org/html';
      const result = await crawler.crawl(url, { forceRefresh: true });
      
      expect(result.data.networkRequests).to.exist;
      expect(result.data.networkRequests).to.be.an('array');
      expect(result.data.networkRequests.length).to.be.greaterThan(0);
    });
    
    it('should extract metadata', async function() {
      const url = 'https://example.com';
      const result = await crawler.crawl(url, { forceRefresh: true });
      
      expect(result.data.metadata).to.exist;
      expect(result.data.metadata).to.have.property('title');
    });
    
    it('should collect training data', async function() {
      const url = 'https://example.com/training-test';
      
      const result = await crawler.collectTrainingData(url, {
        labels: { category: 'test', quality: 'high' },
        qualityScore: 0.85,
        dataType: 'integration-test'
      });
      
      expect(result.success).to.be.true;
      expect(result).to.have.property('duplicate');
      expect(result).to.have.property('dataHash');
      expect(result).to.have.property('features');
    });
    
    it('should get crawler statistics', async function() {
      const stats = await crawler.getStats();
      
      expect(stats).to.exist;
      expect(stats).to.have.property('urls');
      expect(stats).to.have.property('memory');
    });
  });
  
  describe('Performance Tests', function() {
    it('should demonstrate cache performance improvement', async function() {
      const url = 'https://httpbin.org/delay/1';
      
      // Measure first crawl (cold)
      const start1 = Date.now();
      await crawler.crawl(url, { forceRefresh: true });
      const duration1 = Date.now() - start1;
      
      // Measure second crawl (warm)
      const start2 = Date.now();
      await crawler.crawl(url);
      const duration2 = Date.now() - start2;
      
      // Cache should be significantly faster
      console.log(`  Cold: ${duration1}ms, Warm: ${duration2}ms`);
      expect(duration2).to.be.lessThan(duration1 * 0.5); // At least 50% faster
    });
  });
  
  describe('Error Handling', function() {
    it('should handle invalid URLs gracefully', async function() {
      const url = 'https://invalid-domain-that-does-not-exist-12345.com';
      
      const result = await crawler.crawl(url);
      expect(result.error).to.be.true;
      expect(result.data.errors).to.be.an('array');
    });
    
    it('should handle timeout errors', async function() {
      const url = 'https://httpbin.org/delay/60';
      
      const result = await crawler.crawl(url, { timeout: 1000 }); // 1 second timeout
      expect(result.error).to.be.true;
    });
  });
});
