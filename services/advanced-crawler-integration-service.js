/**
 * Advanced Crawler Integration Service
 * 
 * Integrates enterprise crawler features:
 * - 3D Layers mining via Chrome DevTools Protocol
 * - OCR worker for image text extraction
 * - Proxy rotation and management
 * - robots.txt compliance
 * - Anti-scraping resilience
 */

import { EventEmitter } from 'events';
import EnterpriseCrawlerConfigService from './enterprise-crawler-config-service.js';

class AdvancedCrawlerIntegration extends EventEmitter {
  constructor(config = {}) {
    super();

    // Enterprise configuration
    this.configService = new EnterpriseCrawlerConfigService(config);

    // Services integration
    this.services = {
      chromeLayers: null,
      dom3DMining: null,
      ocrWorker: null,
    };

    // State
    this.initialized = false;
  }

  /**
   * Initialize all integrated services
   */
  async initialize() {
    console.log('🚀 Initializing Advanced Crawler Integration...');

    try {
      // Initialize 3D Layers service if enabled
      if (this.configService.config.layers3D.enabled) {
        await this.initialize3DLayers();
      }

      // Initialize OCR worker if enabled
      if (this.configService.config.ocr.enabled) {
        await this.initializeOCR();
      }

      this.initialized = true;
      console.log('✅ Advanced Crawler Integration initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Crawler Integration:', error);
      throw error;
    }
  }

  /**
   * Initialize 3D Layers mining service
   */
  async initialize3DLayers() {
    try {
      // Dynamically import the service
      const { DOM3DDataMiningService } = await import('./dom-3d-datamining-service.js');
      
      const layersConfig = this.configService.get3DLayersConfig();
      this.services.chromeLayers = new DOM3DDataMiningService({
        headless: true,
        maxDepth: layersConfig.maxDepth,
        minImportanceScore: layersConfig.minImportance,
        enableGPU: layersConfig.gpuAcceleration === 'enabled',
      });

      await this.services.chromeLayers.initialize();
      console.log('✅ 3D Layers mining service initialized');
    } catch (error) {
      console.warn('⚠️  3D Layers service not available:', error.message);
      this.services.chromeLayers = null;
    }
  }

  /**
   * Initialize OCR worker service
   */
  async initializeOCR() {
    try {
      const ocrConfig = this.configService.getOCRConfig();
      
      // OCR worker is accessed via HTTP endpoint
      this.services.ocrWorker = {
        endpoint: ocrConfig.endpoint,
        maxImages: ocrConfig.maxImages,
        compressionRatio: ocrConfig.compressionRatio,
        minPrecision: ocrConfig.minPrecision,
        batchSize: ocrConfig.batchSize,
      };

      // Test OCR endpoint
      const testResponse = await fetch(`${ocrConfig.endpoint}/health`, {
        timeout: 5000,
      }).catch(() => null);

      if (testResponse?.ok) {
        console.log('✅ OCR worker service connected');
      } else {
        console.warn('⚠️  OCR worker endpoint not responding');
      }
    } catch (error) {
      console.warn('⚠️  OCR service not available:', error.message);
      this.services.ocrWorker = null;
    }
  }

  /**
   * Crawl URL with all advanced features
   */
  async crawlAdvanced(url, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const result = {
      url,
      timestamp: new Date().toISOString(),
      success: false,
      data: {},
      metadata: {},
      errors: [],
    };

    try {
      // Check robots.txt
      const robotsCheck = await this.configService.checkRobotsTxt(url);
      if (!robotsCheck.allowed) {
        throw new Error('URL disallowed by robots.txt');
      }

      // Apply rate limiting
      const urlObj = new URL(url);
      await this.configService.applyRateLimit(urlObj.hostname);

      // Wait for crawl delay
      if (robotsCheck.crawlDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, robotsCheck.crawlDelay));
      }

      // Get Puppeteer configuration with proxy
      const { config: puppeteerConfig, proxy } = this.configService.getPuppeteerConfig(url);
      result.metadata.proxy = proxy ? `${proxy.host}:${proxy.port}` : 'none';
      result.metadata.userAgent = puppeteerConfig.args.find(arg => arg.startsWith('--user-agent='))?.split('=')[1];

      // Perform 3D layers mining if enabled
      if (this.services.chromeLayers) {
        try {
          const layersData = await this.mine3DLayers(url, options);
          result.data.layers3D = layersData;
          result.metadata.has3DLayers = true;
        } catch (error) {
          result.errors.push({ service: '3DLayers', error: error.message });
        }
      }

      // Perform OCR if enabled and images detected
      if (this.services.ocrWorker && options.extractImages) {
        try {
          const ocrData = await this.performOCR(url, options);
          result.data.ocr = ocrData;
          result.metadata.hasOCR = true;
        } catch (error) {
          result.errors.push({ service: 'OCR', error: error.message });
        }
      }

      result.success = true;
      result.metadata.duration = Date.now() - startTime;

      // Record proxy usage if used
      if (proxy) {
        this.configService.recordProxyUsage(proxy.id, true, result.metadata.duration);
      }

      this.emit('crawlComplete', result);
      return result;
    } catch (error) {
      result.success = false;
      result.errors.push({ service: 'crawler', error: error.message });
      result.metadata.duration = Date.now() - startTime;

      // Record proxy failure if used
      const puppeteerConfig = this.configService.getPuppeteerConfig(url);
      if (puppeteerConfig.proxy) {
        this.configService.recordProxyUsage(puppeteerConfig.proxy.id, false, result.metadata.duration);
      }

      this.emit('crawlError', result);
      return result;
    }
  }

  /**
   * Mine 3D layers from URL
   */
  async mine3DLayers(url, options = {}) {
    if (!this.services.chromeLayers) {
      throw new Error('3D Layers service not initialized');
    }

    const miningResult = await this.services.chromeLayers.mineURL(url);

    return {
      dom3DModel: miningResult.dom3DModel,
      layers: miningResult.dom3DModel.layers,
      schemas: miningResult.schemas,
      seoScore: miningResult.metadata.seoScore,
      recommendations: miningResult.metadata.recommendations,
      trainingData: miningResult.trainingData,
    };
  }

  /**
   * Perform OCR on images from URL
   */
  async performOCR(url, options = {}) {
    if (!this.services.ocrWorker) {
      throw new Error('OCR service not initialized');
    }

    const images = options.images || [];
    if (images.length === 0) {
      return { images: [], text: '', totalText: 0 };
    }

    const ocrResults = [];
    const config = this.services.ocrWorker;

    // Process images in batches
    for (let i = 0; i < images.length; i += config.batchSize) {
      const batch = images.slice(i, i + config.batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (imageUrl) => {
          try {
            const response = await fetch(config.endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrl,
                compressionRatio: config.compressionRatio,
                minPrecision: config.minPrecision,
              }),
            });

            if (!response.ok) {
              throw new Error(`OCR request failed: ${response.statusText}`);
            }

            return await response.json();
          } catch (error) {
            return { error: error.message, imageUrl };
          }
        })
      );

      ocrResults.push(...batchResults);
    }

    const successfulResults = ocrResults.filter(r => !r.error);
    const totalText = successfulResults.reduce((sum, r) => sum + (r.text?.length || 0), 0);

    return {
      images: ocrResults,
      text: successfulResults.map(r => r.text).join('\n'),
      totalText,
      successRate: successfulResults.length / ocrResults.length,
    };
  }

  /**
   * Add proxy to rotation pool
   */
  addProxy(proxyConfig) {
    return this.configService.addProxy(proxyConfig);
  }

  /**
   * Get proxy statistics
   */
  getProxyStats() {
    return {
      total: this.configService.proxyPool.length,
      stats: Array.from(this.configService.proxyStats.entries()).map(([id, stats]) => ({
        id,
        ...stats,
      })),
    };
  }

  /**
   * Get robots.txt for domain
   */
  async getRobotsTxt(domain) {
    const url = `https://${domain}/robots.txt`;
    return await this.configService.checkRobotsTxt(url);
  }

  /**
   * Test configuration
   */
  async testConfiguration(testUrl = 'https://example.com') {
    console.log('🧪 Testing crawler configuration...');

    const tests = {
      robots: { pass: false, message: '' },
      proxy: { pass: false, message: '' },
      layers3D: { pass: false, message: '' },
      ocr: { pass: false, message: '' },
      rateLimit: { pass: false, message: '' },
    };

    // Test robots.txt
    try {
      const robotsCheck = await this.configService.checkRobotsTxt(testUrl);
      tests.robots.pass = true;
      tests.robots.message = robotsCheck.allowed ? 'Allowed' : 'Disallowed';
    } catch (error) {
      tests.robots.message = error.message;
    }

    // Test proxy
    const proxy = this.configService.getNextProxy();
    tests.proxy.pass = proxy !== null || !this.configService.config.proxies.enabled;
    tests.proxy.message = proxy ? `${proxy.host}:${proxy.port}` : 'No proxy configured';

    // Test 3D layers
    tests.layers3D.pass = this.services.chromeLayers !== null;
    tests.layers3D.message = this.services.chromeLayers ? 'Available' : 'Not initialized';

    // Test OCR
    tests.ocr.pass = this.services.ocrWorker !== null;
    tests.ocr.message = this.services.ocrWorker ? 'Connected' : 'Not available';

    // Test rate limiting
    tests.rateLimit.pass = this.configService.config.rateLimit.enabled;
    tests.rateLimit.message = tests.rateLimit.pass 
      ? `${this.configService.config.rateLimit.requestsPerSecond} req/s`
      : 'Disabled';

    console.log('\n📊 Configuration Test Results:');
    console.log('================================');
    for (const [test, result] of Object.entries(tests)) {
      const icon = result.pass ? '✅' : '❌';
      console.log(`${icon} ${test}: ${result.message}`);
    }
    console.log('================================\n');

    return tests;
  }

  /**
   * Shutdown all services
   */
  async shutdown() {
    console.log('🛑 Shutting down Advanced Crawler Integration...');

    if (this.services.chromeLayers) {
      await this.services.chromeLayers.shutdown();
    }

    this.initialized = false;
    console.log('✅ Shutdown complete');
  }
}

export default AdvancedCrawlerIntegration;
export { AdvancedCrawlerIntegration };
