/**
 * Cache-Aware Crawler with Chrome DevTools Protocol Integration
 * 
 * Features:
 * - CDP cache interception and monitoring
 * - Network activity tracking for offline detection
 * - Screenshot comparison with visual diff
 * - Service worker detection and cache inspection
 * - Offline mining capabilities
 * - Training data collection with deduplication
 */

import puppeteer from 'puppeteer';
import { AdvancedCacheManager } from './advanced-cache-manager.js';
import { promises as fs } from 'fs';
import path from 'path';

export class CacheAwareCrawler {
  constructor(options = {}) {
    this.cacheManager = options.cacheManager || new AdvancedCacheManager();
    this.browser = null;
    this.config = {
      enableCDP: options.enableCDP !== false,
      enableOfflineMining: options.enableOfflineMining !== false,
      enableScreenshots: options.enableScreenshots !== false,
      enableOCR: options.enableOCR !== false,
      screenshotDir: options.screenshotDir || './data/screenshots',
      ...options
    };
  }

  async initialize() {
    console.log('🚀 Initializing Cache-Aware Crawler...');
    
    await this.cacheManager.initialize();
    
    // Create screenshot directory
    if (this.config.enableScreenshots) {
      await fs.mkdir(this.config.screenshotDir, { recursive: true });
    }
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--enable-features=NetworkService',
        '--enable-automation'
      ]
    });
    
    console.log('✅ Cache-Aware Crawler initialized');
  }

  /**
   * Crawl URL with comprehensive caching
   */
  async crawl(url, options = {}) {
    console.log(`🔍 Crawling: ${url}`);
    
    // Check cache first
    const cacheCheck = await this.cacheManager.isCached(url, options);
    
    if (cacheCheck.cached && !options.forceRefresh) {
      console.log(`✨ Cache hit for ${url} (source: ${cacheCheck.source})`);
      
      if (cacheCheck.stale && this.config.staleWhileRevalidate) {
        console.log('🔄 Stale cache, revalidating in background...');
        // Continue to crawl but return cached data immediately
        this.revalidateInBackground(url, options).catch(err => {
          console.error('Background revalidation failed:', err);
        });
      }
      
      return {
        fromCache: true,
        stale: cacheCheck.stale || false,
        data: cacheCheck.data
      };
    }
    
    // Perform fresh crawl
    const page = await this.browser.newPage();
    const crawlData = {
      url,
      timestamp: new Date(),
      networkRequests: [],
      serviceWorkerDetected: false,
      cachedResources: [],
      errors: []
    };
    
    try {
      // Enable CDP domains if configured
      if (this.config.enableCDP) {
        const client = await page.target().createCDPSession();
        await this.setupCDPMonitoring(client, crawlData);
      }
      
      // Monitor network activity
      await this.setupNetworkMonitoring(page, crawlData);
      
      // Navigate to URL
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });
      
      // Check for service worker
      crawlData.serviceWorkerDetected = await this.detectServiceWorker(page);
      
      // Collect DOM snapshot
      crawlData.domSnapshot = await this.collectDOMSnapshot(page);
      
      // Take screenshot if enabled
      if (this.config.enableScreenshots) {
        crawlData.screenshot = await this.captureScreenshot(page, url);
      }
      
      // Extract metadata
      crawlData.metadata = await this.extractMetadata(page);
      
      // Cache the results
      crawlData.statusCode = response.status();
      crawlData.contentType = response.headers()['content-type'];
      
      await this.cacheManager.cacheUrl(url, crawlData, options);
      
      // Cache assets
      if (options.cacheAssets) {
        await this.cachePageAssets(crawlData.networkRequests);
      }
      
      // Log network activity
      for (const request of crawlData.networkRequests) {
        await this.cacheManager.logNetworkActivity(url, request);
      }
      
      console.log(`✅ Crawled ${url} - ${crawlData.networkRequests.length} requests tracked`);
      
      return {
        fromCache: false,
        data: crawlData
      };
      
    } catch (error) {
      console.error(`❌ Error crawling ${url}:`, error.message);
      crawlData.errors.push({
        message: error.message,
        stack: error.stack
      });
      return {
        error: true,
        data: crawlData
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Setup Chrome DevTools Protocol monitoring
   */
  async setupCDPMonitoring(client, crawlData) {
    // Enable necessary domains
    await client.send('Network.enable');
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Performance.enable');
    
    // Monitor cache usage
    client.on('Network.requestWillBeSent', (params) => {
      crawlData.networkRequests.push({
        url: params.request.url,
        method: params.request.method,
        resourceType: params.type,
        fromCache: false,
        timestamp: params.timestamp
      });
    });
    
    client.on('Network.requestServedFromCache', (params) => {
      const request = crawlData.networkRequests.find(r => r.requestId === params.requestId);
      if (request) {
        request.fromCache = true;
      }
    });
    
    client.on('Network.responseReceived', (params) => {
      const request = crawlData.networkRequests.find(r => r.requestId === params.requestId);
      if (request) {
        request.status = params.response.status;
        request.contentLength = params.response.encodedDataLength;
        request.fromServiceWorker = params.response.fromServiceWorker || false;
        request.timing = params.response.timing;
      }
    });
  }

  /**
   * Setup network monitoring using Puppeteer
   */
  async setupNetworkMonitoring(page, crawlData) {
    page.on('request', request => {
      crawlData.networkRequests.push({
        requestId: request._requestId,
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        fromCache: request.isFromCache(),
        timestamp: Date.now()
      });
    });
    
    page.on('response', response => {
      const request = crawlData.networkRequests.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
        request.contentLength = response.headers()['content-length'];
        request.fromServiceWorker = response.fromServiceWorker();
      }
    });
  }

  /**
   * Detect if page has service worker
   */
  async detectServiceWorker(page) {
    try {
      const hasServiceWorker = await page.evaluate(() => {
        return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
      });
      return hasServiceWorker;
    } catch (error) {
      return false;
    }
  }

  /**
   * Collect comprehensive DOM snapshot
   */
  async collectDOMSnapshot(page) {
    try {
      const snapshot = await page.evaluate(() => {
        const getNodeInfo = (node) => {
          if (node.nodeType !== 1) return null; // Only element nodes
          
          return {
            tag: node.tagName.toLowerCase(),
            id: node.id || undefined,
            classes: node.className ? node.className.split(' ').filter(Boolean) : [],
            attributes: Array.from(node.attributes || []).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {}),
            textContent: node.childNodes.length === 1 && node.childNodes[0].nodeType === 3
              ? node.textContent.trim().substring(0, 100)
              : undefined,
            children: Array.from(node.children).map(getNodeInfo).filter(Boolean)
          };
        };
        
        return {
          dom: getNodeInfo(document.body),
          title: document.title,
          meta: Array.from(document.querySelectorAll('meta')).map(m => ({
            name: m.name || m.property,
            content: m.content
          })),
          links: Array.from(document.querySelectorAll('link')).map(l => ({
            rel: l.rel,
            href: l.href,
            type: l.type
          })),
          scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
          styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(s => s.href)
        };
      });
      
      return snapshot;
    } catch (error) {
      console.error('Error collecting DOM snapshot:', error);
      return null;
    }
  }

  /**
   * Capture screenshot for visual comparison
   */
  async captureScreenshot(page, url) {
    try {
      const timestamp = Date.now();
      const filename = `screenshot-${timestamp}.png`;
      const filepath = path.join(this.config.screenshotDir, filename);
      
      const screenshotBuffer = await page.screenshot({
        fullPage: true,
        type: 'png'
      });
      
      await fs.writeFile(filepath, screenshotBuffer);
      
      // Cache screenshot
      const result = await this.cacheManager.cacheScreenshot(url, screenshotBuffer, {
        viewportWidth: 1920,
        viewportHeight: 1080,
        deviceType: 'desktop'
      });
      
      return {
        path: filepath,
        hash: result.screenshotHash,
        hasChanged: result.hasChanged,
        timestamp
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  }

  /**
   * Extract metadata from page
   */
  async extractMetadata(page) {
    try {
      return await page.evaluate(() => {
        const getMetaContent = (name) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta ? meta.content : null;
        };
        
        return {
          title: document.title,
          description: getMetaContent('description'),
          keywords: getMetaContent('keywords'),
          author: getMetaContent('author'),
          viewport: getMetaContent('viewport'),
          ogTitle: getMetaContent('og:title'),
          ogDescription: getMetaContent('og:description'),
          ogImage: getMetaContent('og:image'),
          twitterCard: getMetaContent('twitter:card'),
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          lang: document.documentElement.lang,
          charset: document.characterSet
        };
      });
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {};
    }
  }

  /**
   * Cache page assets (scripts, styles, libraries)
   */
  async cachePageAssets(networkRequests) {
    const assetTypes = ['script', 'stylesheet', 'font'];
    const assetsToCache = networkRequests.filter(req => 
      assetTypes.includes(req.resourceType) && req.status === 200
    );
    
    console.log(`💾 Caching ${assetsToCache.length} assets...`);
    
    for (const asset of assetsToCache) {
      try {
        // Note: In a real implementation, you'd fetch the actual content
        // For now, we'll just store the URL reference
        await this.cacheManager.cacheAsset(asset.url, '', {
          type: asset.resourceType,
          metadata: {
            fromCache: asset.fromCache,
            contentLength: asset.contentLength
          }
        });
      } catch (error) {
        console.error(`Error caching asset ${asset.url}:`, error.message);
      }
    }
  }

  /**
   * Mine offline site by simulating network disconnection
   */
  async mineOfflineSite(url, options = {}) {
    console.log(`🔌 Starting offline mining for: ${url}`);
    
    const session = await this.cacheManager.startOfflineMiningSession(url, {
      serviceWorkerDetected: false,
      metadata: options.metadata
    });
    
    const page = await this.browser.newPage();
    
    try {
      // Enable offline mode
      await page.setOfflineMode(true);
      
      // Try to navigate - should load from service worker cache if available
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        
        // If we got here, the site works offline!
        console.log('✅ Site works offline - mining cached content...');
        
        const minedData = await this.collectDOMSnapshot(page);
        const cachedResources = await this.inspectServiceWorkerCache(page);
        
        await this.cacheManager.completeOfflineMiningSession(
          session.sessionId,
          minedData,
          cachedResources
        );
        
        return {
          success: true,
          sessionId: session.sessionId,
          minedData,
          cachedResources
        };
        
      } catch (error) {
        console.log('⚠️  Site does not work offline');
        return {
          success: false,
          sessionId: session.sessionId,
          reason: 'Site requires network connection',
          error: error.message
        };
      }
      
    } finally {
      await page.close();
    }
  }

  /**
   * Inspect service worker cache
   */
  async inspectServiceWorkerCache(page) {
    try {
      const cacheNames = await page.evaluate(async () => {
        if (!('caches' in window)) return [];
        
        const names = await caches.keys();
        const allCaches = [];
        
        for (const name of names) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          allCaches.push({
            name,
            urls: requests.map(req => req.url)
          });
        }
        
        return allCaches;
      });
      
      return cacheNames;
    } catch (error) {
      console.error('Error inspecting service worker cache:', error);
      return [];
    }
  }

  /**
   * Revalidate stale cache in background
   */
  async revalidateInBackground(url, options) {
    console.log(`🔄 Background revalidation for: ${url}`);
    
    // Force fresh crawl
    const result = await this.crawl(url, { ...options, forceRefresh: true });
    
    if (!result.error) {
      console.log(`✅ Background revalidation complete for: ${url}`);
    }
    
    return result;
  }

  /**
   * Collect training data with deduplication
   */
  async collectTrainingData(url, options = {}) {
    console.log(`🧠 Collecting training data for: ${url}`);
    
    const crawlResult = await this.crawl(url, options);
    
    if (crawlResult.error) {
      return { error: true, message: 'Crawl failed' };
    }
    
    const data = crawlResult.data;
    
    // Prepare training data features
    const features = {
      dom: data.domSnapshot,
      metadata: data.metadata,
      networkRequests: data.networkRequests.map(r => ({
        url: r.url,
        type: r.resourceType,
        fromCache: r.fromCache,
        status: r.status
      })),
      screenshot: data.screenshot ? {
        hash: data.screenshot.hash,
        hasChanged: data.screenshot.hasChanged
      } : null,
      serviceWorker: data.serviceWorkerDetected
    };
    
    // Add to training data cache with deduplication
    const result = await this.cacheManager.addTrainingData({
      sourceUrl: url,
      features,
      labels: options.labels || {},
      qualityScore: options.qualityScore || 1.0
    }, {
      dataType: options.dataType || 'web-crawl',
      metadata: options.metadata
    });
    
    console.log(result.duplicate 
      ? `⚠️  Duplicate training data detected (hash: ${result.dataHash})`
      : `✅ New training data added (hash: ${result.dataHash})`
    );
    
    return {
      success: true,
      duplicate: result.duplicate,
      dataHash: result.dataHash,
      features
    };
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    return await this.cacheManager.getCacheStats();
  }

  /**
   * Cleanup expired cache
   */
  async cleanup() {
    return await this.cacheManager.cleanupExpiredCache();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    await this.cacheManager.close();
  }
}

export default CacheAwareCrawler;
