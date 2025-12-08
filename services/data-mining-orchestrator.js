/**
 * Data Mining Orchestrator Service
 * 
 * Orchestrates multiple data mining services running in parallel.
 * Features:
 * - Multi-instance data mining coordination
 * - Headless browser pool integration
 * - Custom scraper framework support
 * - 3D layer scraper integration
 * - Topic-based URL bundling
 * - Automated seeding and discovery
 */

import { EventEmitter } from 'events';
import HeadlessBrowserPool from './headless-browser-pool.js';
import { URLSeedingService } from './url-seeding-service.js';
import { DOM3DDataMiningService } from './dom-3d-datamining-service.js';
import dataMiningInstanceService from './data-mining-instance-service.js';

export class DataMiningOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrentInstances: config.maxConcurrentInstances || 5,
      browserPoolConfig: config.browserPoolConfig || {},
      enableURLSeeding: config.enableURLSeeding !== false,
      enable3DLayerScraping: config.enable3DLayerScraping !== false,
      enableCustomScrapers: config.enableCustomScrapers !== false,
      defaultMiningConfig: config.defaultMiningConfig || {},
      ...config
    };

    // Core services
    this.browserPool = null;
    this.urlSeedingServices = new Map(); // instanceId -> URLSeedingService
    this.miningInstances = new Map(); // miningId -> instance data
    this.customScrapers = new Map(); // scraperName -> scraper function
    this.dataBundles = new Map(); // topic -> data bundle
    
    // Statistics
    this.stats = {
      activeInstances: 0,
      completedInstances: 0,
      totalURLsProcessed: 0,
      totalDataMined: 0,
      averageProcessingTime: 0,
      successRate: 100
    };

    this.isInitialized = false;
    this.isRunning = false;

    // Register default custom scrapers
    this.registerDefaultScrapers();
  }

  /**
   * Initialize the orchestrator
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Data Mining Orchestrator already initialized');
      return;
    }

    console.log('🚀 Initializing Data Mining Orchestrator...');

    // Initialize browser pool
    this.browserPool = new HeadlessBrowserPool(this.config.browserPoolConfig);
    await this.browserPool.initialize();

    // Listen to browser pool events
    this.browserPool.on('taskCompleted', (data) => {
      this.emit('taskCompleted', data);
    });

    this.browserPool.on('taskFailed', (data) => {
      this.emit('taskFailed', data);
    });

    this.isInitialized = true;
    console.log('✅ Data Mining Orchestrator initialized');
    
    this.emit('initialized');
  }

  /**
   * Create a new data mining instance with automated configuration
   */
  async createMiningInstance(config) {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const {
      name,
      topic,
      seedUrls = [],
      attributes = [],
      enableAutoSeeding = true,
      enable3DLayer = false,
      customScrapers = [],
      config: miningConfig = {}
    } = config;

    console.log(`📦 Creating mining instance: ${name}`);

    // Create data mining instance
    const instance = await dataMiningInstanceService.createMiningInstance(name, {
      description: config.description || `Data mining for ${topic}`,
      targetUrls: seedUrls,
      enabledAttributes: attributes.map(a => a.name || a),
      attributeConfig: this.buildAttributeConfig(attributes),
      metadata: {
        topic,
        enableAutoSeeding,
        enable3DLayer,
        customScrapers
      },
      ...miningConfig
    });

    const miningId = instance.mining_id;

    // Setup URL seeding if enabled
    if (enableAutoSeeding && this.config.enableURLSeeding) {
      const seedingService = new URLSeedingService({
        instanceId: miningId,
        crawler: this.browserPool,
        db: this.config.db
      });

      await seedingService.start();
      
      // Seed initial URLs
      if (seedUrls.length > 0) {
        for (const url of seedUrls) {
          await seedingService.addSeed(url, { topic, priority: 10 });
        }
      }

      // Auto-discover related URLs based on topic
      if (topic) {
        await this.seedURLsByTopic(seedingService, topic);
      }

      this.urlSeedingServices.set(miningId, seedingService);
    }

    // Register custom scrapers for this instance
    if (customScrapers.length > 0) {
      for (const scraperName of customScrapers) {
        if (!this.customScrapers.has(scraperName)) {
          console.warn(`Custom scraper '${scraperName}' not found`);
        }
      }
    }

    // Store instance data
    this.miningInstances.set(miningId, {
      instance,
      config,
      status: 'ready',
      startedAt: null,
      completedAt: null,
      urlsProcessed: 0,
      dataMined: 0
    });

    this.emit('instanceCreated', { miningId, name, topic });

    return miningId;
  }

  /**
   * Start a mining instance
   */
  async startMiningInstance(miningId) {
    const instanceData = this.miningInstances.get(miningId);
    if (!instanceData) {
      throw new Error(`Mining instance ${miningId} not found`);
    }

    if (instanceData.status === 'running') {
      throw new Error(`Mining instance ${miningId} is already running`);
    }

    console.log(`▶️  Starting mining instance: ${miningId}`);
    
    instanceData.status = 'running';
    instanceData.startedAt = Date.now();
    this.stats.activeInstances++;

    // Start mining execution
    this.executeMiningInstance(miningId).catch(error => {
      console.error(`Mining instance ${miningId} failed:`, error);
      this.handleInstanceFailure(miningId, error);
    });

    this.emit('instanceStarted', { miningId });

    return instanceData.instance;
  }

  /**
   * Execute mining instance
   */
  async executeMiningInstance(miningId) {
    const instanceData = this.miningInstances.get(miningId);
    const instance = instanceData.instance;
    const config = instanceData.config;

    // Get URLs to process
    let urls = instance.target_urls || [];
    
    // If URL seeding is enabled, get discovered URLs
    const seedingService = this.urlSeedingServices.get(miningId);
    if (seedingService) {
      const discoveredSeeds = await seedingService.getAllSeeds();
      urls = [...urls, ...discoveredSeeds.map(s => s.url)];
    }

    console.log(`🔍 Processing ${urls.length} URLs for ${miningId}`);

    // Process each URL
    for (const url of urls) {
      if (instanceData.status !== 'running') {
        console.log(`Mining instance ${miningId} stopped`);
        break;
      }

      try {
        await this.processURL(miningId, url, config);
        instanceData.urlsProcessed++;
        this.stats.totalURLsProcessed++;
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
      }
    }

    // Complete the instance
    await this.completeMiningInstance(miningId);
  }

  /**
   * Process a single URL for a mining instance
   */
  async processURL(miningId, url, config) {
    const instanceData = this.miningInstances.get(miningId);
    const instance = instanceData.instance;

    console.log(`🔬 Mining URL: ${url}`);

    // Execute mining task using browser pool
    const result = await this.browserPool.executeTask(async (page) => {
      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: config.timeout || 30000
      });

      const minedData = {
        url,
        timestamp: new Date().toISOString(),
        attributes: {}
      };

      // Execute 3D layer scraping if enabled
      if (config.enable3DLayer && this.config.enable3DLayerScraping) {
        minedData.layerData = await this.execute3DLayerScraping(page, url);
      }

      // Extract attributes
      for (const attr of config.attributes || []) {
        try {
          const value = await this.extractAttribute(page, attr, config);
          minedData.attributes[attr.name || attr] = value;
        } catch (error) {
          console.error(`Error extracting attribute ${attr.name || attr}:`, error);
          minedData.attributes[attr.name || attr] = null;
        }
      }

      // Execute custom scrapers if configured
      if (config.customScrapers && config.customScrapers.length > 0) {
        minedData.customScraperData = {};
        for (const scraperName of config.customScrapers) {
          const scraper = this.customScrapers.get(scraperName);
          if (scraper) {
            try {
              minedData.customScraperData[scraperName] = await scraper(page, url, config);
            } catch (error) {
              console.error(`Custom scraper ${scraperName} failed:`, error);
            }
          }
        }
      }

      return minedData;
    });

    // Store result in data bundle by topic
    const topic = config.topic;
    if (topic) {
      this.addToDataBundle(topic, result);
    }

    instanceData.dataMined++;
    this.stats.totalDataMined++;

    this.emit('urlProcessed', { miningId, url, data: result });

    return result;
  }

  /**
   * Execute 3D layer scraping using Chrome DevTools
   */
  async execute3DLayerScraping(page, url) {
    try {
      // Get CDP session
      const client = await page.target().createCDPSession();
      
      // Enable Layer Tree domain
      await client.send('LayerTree.enable');
      await client.send('DOM.enable');
      
      // Get layer tree
      const { layers } = await client.send('LayerTree.layerTree');
      
      // Extract 3D layer information
      const layerData = {
        totalLayers: layers?.length || 0,
        layers: layers?.map(layer => ({
          id: layer.layerId,
          type: layer.type,
          bounds: layer.bounds,
          transform: layer.transform,
          compositingReasons: layer.compositingReasons
        })) || []
      };

      // Get additional 3D context if available
      const dom3DData = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const layerInfo = [];
        
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          const transform = style.transform;
          const zIndex = style.zIndex;
          
          if (transform !== 'none' || zIndex !== 'auto') {
            layerInfo.push({
              tag: el.tagName,
              transform,
              zIndex,
              className: el.className,
              id: el.id
            });
          }
        }
        
        return layerInfo;
      });

      layerData.dom3DElements = dom3DData;

      return layerData;
    } catch (error) {
      console.error('3D layer scraping failed:', error);
      return null;
    }
  }

  /**
   * Extract a single attribute from a page
   */
  async extractAttribute(page, attribute, config) {
    const attrName = attribute.name || attribute;
    const selector = attribute.selector;
    const dataType = attribute.dataType || 'text';

    if (!selector) {
      console.warn(`No selector defined for attribute ${attrName}`);
      return null;
    }

    try {
      const elements = await page.$$(selector);
      
      if (elements.length === 0) {
        return null;
      }

      // Extract based on data type
      const values = [];
      for (const element of elements) {
        let value;
        
        switch (dataType) {
          case 'text':
            value = await element.evaluate(el => el.textContent?.trim());
            break;
          case 'html':
            value = await element.evaluate(el => el.innerHTML);
            break;
          case 'attribute':
            value = await element.evaluate((el, attr) => el.getAttribute(attr), attribute.attributeName);
            break;
          case 'image':
            value = await element.evaluate(el => el.src || el.getAttribute('data-src'));
            break;
          case 'url':
            value = await element.evaluate(el => el.href);
            break;
          default:
            value = await element.evaluate(el => el.textContent?.trim());
        }
        
        if (value) {
          values.push(value);
        }
      }

      // Return single value or array based on configuration
      if (attribute.multiple) {
        return values;
      } else {
        return values[0] || null;
      }
    } catch (error) {
      console.error(`Error extracting attribute ${attrName}:`, error);
      return null;
    }
  }

  /**
   * Seed URLs by topic using search algorithms
   */
  async seedURLsByTopic(seedingService, topic) {
    console.log(`🌱 Auto-seeding URLs for topic: ${topic}`);
    
    // Use topic-based search to discover URLs
    const discoveredUrls = await seedingService.discoverURLsByTopic(topic, {
      maxUrls: 50,
      minQuality: 0.7
    });

    console.log(`   Discovered ${discoveredUrls.length} URLs for ${topic}`);

    return discoveredUrls;
  }

  /**
   * Add data to topic-based bundle
   */
  addToDataBundle(topic, data) {
    if (!this.dataBundles.has(topic)) {
      this.dataBundles.set(topic, {
        topic,
        data: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    const bundle = this.dataBundles.get(topic);
    bundle.data.push(data);
    bundle.updatedAt = Date.now();

    this.emit('dataBundleUpdated', { topic, size: bundle.data.length });
  }

  /**
   * Get data bundle by topic
   */
  getDataBundle(topic) {
    return this.dataBundles.get(topic);
  }

  /**
   * Build attribute configuration from attribute definitions
   */
  buildAttributeConfig(attributes) {
    const config = {};
    
    for (const attr of attributes) {
      const attrName = attr.name || attr;
      config[attrName] = {
        enabled: true,
        options: attr.options || {}
      };
    }

    return config;
  }

  /**
   * Register a custom scraper
   */
  registerCustomScraper(name, scraperFn) {
    if (typeof scraperFn !== 'function') {
      throw new Error('Scraper must be a function');
    }

    this.customScrapers.set(name, scraperFn);
    console.log(`✅ Registered custom scraper: ${name}`);
    
    this.emit('customScraperRegistered', { name });
  }

  /**
   * Register default scrapers
   */
  registerDefaultScrapers() {
    // SEO metadata scraper
    this.registerCustomScraper('seo-metadata', async (page, url) => {
      return await page.evaluate(() => {
        const meta = {};
        
        // Title
        meta.title = document.title;
        
        // Meta tags
        const metaTags = document.querySelectorAll('meta');
        for (const tag of metaTags) {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          if (name && content) {
            meta[name] = content;
          }
        }
        
        // Canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          meta.canonical = canonical.getAttribute('href');
        }
        
        // Schema.org markup
        const schemas = [];
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scriptTags) {
          try {
            schemas.push(JSON.parse(script.textContent));
          } catch (e) {
            // Invalid JSON
          }
        }
        meta.schemas = schemas;
        
        return meta;
      });
    });

    // Performance metrics scraper
    this.registerCustomScraper('performance-metrics', async (page, url) => {
      return await page.evaluate(() => {
        const perf = window.performance;
        const timing = perf.timing;
        
        return {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          timeToFirstByte: timing.responseStart - timing.navigationStart,
          domInteractive: timing.domInteractive - timing.navigationStart,
          resources: perf.getEntriesByType('resource').length
        };
      });
    });

    // Accessibility scraper
    this.registerCustomScraper('accessibility', async (page, url) => {
      return await page.evaluate(() => {
        const a11y = {
          headings: {},
          images: { total: 0, withAlt: 0, withoutAlt: 0 },
          links: { total: 0, withText: 0, withoutText: 0 },
          forms: { total: 0, withLabels: 0, withoutLabels: 0 }
        };
        
        // Headings structure
        for (let i = 1; i <= 6; i++) {
          a11y.headings[`h${i}`] = document.querySelectorAll(`h${i}`).length;
        }
        
        // Images
        const images = document.querySelectorAll('img');
        a11y.images.total = images.length;
        for (const img of images) {
          if (img.alt) {
            a11y.images.withAlt++;
          } else {
            a11y.images.withoutAlt++;
          }
        }
        
        // Links
        const links = document.querySelectorAll('a');
        a11y.links.total = links.length;
        for (const link of links) {
          if (link.textContent.trim()) {
            a11y.links.withText++;
          } else {
            a11y.links.withoutText++;
          }
        }
        
        // Forms
        const inputs = document.querySelectorAll('input, textarea, select');
        a11y.forms.total = inputs.length;
        for (const input of inputs) {
          const label = document.querySelector(`label[for="${input.id}"]`);
          if (label || input.getAttribute('aria-label')) {
            a11y.forms.withLabels++;
          } else {
            a11y.forms.withoutLabels++;
          }
        }
        
        return a11y;
      });
    });

    console.log('✅ Default custom scrapers registered');
  }

  /**
   * Complete a mining instance
   */
  async completeMiningInstance(miningId) {
    const instanceData = this.miningInstances.get(miningId);
    if (!instanceData) return;

    instanceData.status = 'completed';
    instanceData.completedAt = Date.now();
    
    const duration = instanceData.completedAt - instanceData.startedAt;
    
    this.stats.activeInstances--;
    this.stats.completedInstances++;

    // Stop URL seeding service
    const seedingService = this.urlSeedingServices.get(miningId);
    if (seedingService) {
      await seedingService.stop();
    }

    console.log(`✅ Mining instance completed: ${miningId}`);
    console.log(`   URLs processed: ${instanceData.urlsProcessed}`);
    console.log(`   Data mined: ${instanceData.dataMined}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);

    this.emit('instanceCompleted', {
      miningId,
      urlsProcessed: instanceData.urlsProcessed,
      dataMined: instanceData.dataMined,
      duration
    });
  }

  /**
   * Handle instance failure
   */
  async handleInstanceFailure(miningId, error) {
    const instanceData = this.miningInstances.get(miningId);
    if (!instanceData) return;

    instanceData.status = 'failed';
    instanceData.error = error.message;
    
    this.stats.activeInstances--;

    // Stop URL seeding service
    const seedingService = this.urlSeedingServices.get(miningId);
    if (seedingService) {
      await seedingService.stop();
    }

    console.error(`❌ Mining instance failed: ${miningId}`, error);

    this.emit('instanceFailed', { miningId, error: error.message });
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    return {
      ...this.stats,
      browserPoolStats: this.browserPool?.getStats() || {},
      activeUrlSeedingServices: this.urlSeedingServices.size,
      dataBundles: this.dataBundles.size
    };
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown() {
    console.log('🛑 Shutting down Data Mining Orchestrator...');

    // Stop all URL seeding services
    for (const seedingService of this.urlSeedingServices.values()) {
      await seedingService.stop();
    }

    // Shutdown browser pool
    if (this.browserPool) {
      await this.browserPool.shutdown();
    }

    this.isRunning = false;
    this.isInitialized = false;

    console.log('✅ Data Mining Orchestrator shut down');
    this.emit('shutdown');
  }
}

export default DataMiningOrchestrator;
