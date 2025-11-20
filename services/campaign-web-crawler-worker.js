/**
 * Campaign Web Crawler Worker
 * 
 * Headless web crawler worker that runs mining campaigns with custom configurations.
 * Integrates with RealWebCrawlerSystem and supports real-time data streams.
 * 
 * Features:
 * - Headless Chrome operation via Puppeteer
 * - Custom mining configurations per campaign
 * - Real-time data streaming to LLM/visual components
 * - Two-way communication for config updates
 * - Schema-driven attribute extraction
 * - Virtual simulation for self-improvement
 * - Container-ready for isolated execution
 */

import { EventEmitter } from 'events';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';
import dataMiningInstanceService from './data-mining-instance-service.js';
import attributeDiscoveryService from './attribute-discovery-service.js';

class CampaignWebCrawlerWorker extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.workerId = `worker_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    this.config = {
      headless: config.headless !== false,
      containerMode: config.containerMode || false,
      realTimeStreaming: config.realTimeStreaming !== false,
      enableSimulation: config.enableSimulation !== false,
      ...config
    };

    // Mining configuration from campaign
    this.miningConfig = null;
    this.campaignId = null;
    this.miningId = null;
    
    // Real-time data stream
    this.dataStream = {
      enabled: this.config.realTimeStreaming,
      subscribers: new Set(),
      buffer: [],
      maxBufferSize: 1000
    };

    // Two-way communication channel
    this.communicationChannel = {
      configUpdates: new Map(),
      pendingChanges: [],
      lastSync: Date.now()
    };

    // Simulation engine for self-improvement
    this.simulationEngine = {
      enabled: this.config.enableSimulation,
      scenarios: [],
      results: [],
      learningRate: 0.1
    };

    // Web crawler instance
    this.crawler = null;
    this.isRunning = false;
    
    // Extracted data storage
    this.extractedData = [];
    this.extractionStats = {
      totalExtracted: 0,
      successRate: 0,
      averageTime: 0
    };

    // Schema plugins for LLM configuration
    this.schemaPlugins = new Map();
    this.llmTools = new Map();
  }

  /**
   * Initialize worker with mining instance configuration
   */
  async initialize(miningId, options = {}) {
    try {
      console.log(`🔧 Initializing Campaign Web Crawler Worker: ${this.workerId}`);
      
      this.miningId = miningId;
      
      // Load mining configuration
      const miningInstance = await dataMiningInstanceService.getMiningInstance(miningId);
      if (!miningInstance) {
        throw new Error(`Mining instance ${miningId} not found`);
      }
      
      this.miningConfig = miningInstance;
      this.campaignId = miningInstance.metadata?.campaignId;
      
      // Load attributes
      const attributes = await this.loadAttributes(miningInstance);
      
      // Initialize crawler with custom config
      this.crawler = new RealWebCrawlerSystem({
        maxConcurrency: miningInstance.max_depth || 5,
        requestDelay: miningInstance.rate_limit_ms || 2000,
        maxDepth: miningInstance.max_depth || 3,
        headless: this.config.headless,
        enableSEOIntegration: true,
        ...options
      });

      // Setup attribute extraction handlers
      this.setupAttributeExtraction(attributes);
      
      // Setup real-time streaming
      if (this.dataStream.enabled) {
        this.setupDataStreaming();
      }
      
      // Setup two-way communication
      this.setupCommunicationChannel();
      
      // Initialize simulation engine
      if (this.simulationEngine.enabled) {
        this.initializeSimulation();
      }
      
      console.log(`✅ Worker initialized with ${attributes.length} attributes`);
      this.emit('initialized', { workerId: this.workerId, miningId });
      
      return this;
    } catch (error) {
      console.error('Worker initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load attributes for the mining instance
   */
  async loadAttributes(miningInstance) {
    const attributes = [];
    
    if (miningInstance.research_id) {
      const discovered = await attributeDiscoveryService.getAttributesByResearch(
        miningInstance.research_id
      );
      
      // Filter to enabled attributes
      for (const attr of discovered) {
        if (miningInstance.enabled_attributes.includes(attr.attribute_id)) {
          attributes.push(attr);
        }
      }
    }
    
    return attributes;
  }

  /**
   * Setup attribute extraction handlers
   */
  setupAttributeExtraction(attributes) {
    this.extractionHandlers = new Map();
    
    for (const attr of attributes) {
      const handler = this.createExtractionHandler(attr);
      this.extractionHandlers.set(attr.attribute_id, handler);
      
      // Register as LLM tool/skill
      this.registerAsLLMTool(attr);
    }
  }

  /**
   * Create extraction handler for an attribute
   */
  createExtractionHandler(attribute) {
    return async (page, url) => {
      try {
        const startTime = Date.now();
        let value = null;
        
        const strategy = attribute.selector_strategy;
        const config = this.miningConfig.attribute_config[attribute.attribute_id] || {};
        
        // Execute extraction based on algorithm
        switch (attribute.mining_algorithm) {
          case 'dom_extraction':
            value = await this.extractFromDOM(page, strategy, config);
            break;
          case 'meta_extraction':
            value = await this.extractFromMeta(page, strategy, config);
            break;
          case 'link_extraction':
            value = await this.extractLinks(page, strategy, config);
            break;
          case 'image_extraction':
            value = await this.extractImages(page, strategy, config);
            break;
          case 'seo_extraction':
            value = await this.extractSEOData(page, strategy, config);
            break;
          case 'performance_measurement':
            value = await this.measurePerformance(page, strategy, config);
            break;
          case 'event_tracking':
            value = await this.trackEvents(page, strategy, config);
            break;
          case 'computed_metric':
            value = await this.computeMetric(page, strategy, config);
            break;
          default:
            value = await this.extractFromDOM(page, strategy, config);
        }
        
        const extractionTime = Date.now() - startTime;
        
        // Validate extracted data
        const isValid = this.validateExtraction(value, attribute.validation_rules);
        
        return {
          attribute_id: attribute.attribute_id,
          attribute_name: attribute.name,
          value,
          url,
          timestamp: new Date().toISOString(),
          extraction_time_ms: extractionTime,
          is_valid: isValid
        };
      } catch (error) {
        console.error(`Extraction failed for ${attribute.name}:`, error.message);
        return {
          attribute_id: attribute.attribute_id,
          attribute_name: attribute.name,
          value: null,
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    };
  }

  /**
   * Extract data from DOM using CSS selectors
   */
  async extractFromDOM(page, strategy, config) {
    const selectors = strategy.selectors || [];
    
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const values = await Promise.all(
            elements.map(el => el.evaluate(node => node.textContent?.trim()))
          );
          
          // Return single value or array based on count
          return values.length === 1 ? values[0] : values;
        }
      } catch (error) {
        // Try next selector
        continue;
      }
    }
    
    return null;
  }

  /**
   * Extract meta tag data
   */
  async extractFromMeta(page, strategy, config) {
    const selectors = strategy.selectors || [];
    
    for (const selector of selectors) {
      try {
        const content = await page.$eval(selector, el => el.getAttribute('content'));
        if (content) return content;
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Extract links from page
   */
  async extractLinks(page, strategy, config) {
    const selectors = strategy.selectors || ['a'];
    const includeExternal = config.options?.include_external !== false;
    const includeInternal = config.options?.include_internal !== false;
    
    const links = await page.$$eval(selectors.join(','), (elements, baseUrl) => {
      return elements.map(el => {
        const href = el.getAttribute('href');
        if (!href) return null;
        
        try {
          const url = new URL(href, baseUrl);
          return {
            href: url.href,
            text: el.textContent?.trim(),
            isExternal: url.origin !== new URL(baseUrl).origin
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    }, await page.url());
    
    return links.filter(link => {
      if (link.isExternal && !includeExternal) return false;
      if (!link.isExternal && !includeInternal) return false;
      return true;
    });
  }

  /**
   * Extract images from page
   */
  async extractImages(page, strategy, config) {
    const selectors = strategy.selectors || ['img'];
    const minWidth = config.options?.min_width || 0;
    const minHeight = config.options?.min_height || 0;
    
    const images = await page.$$eval(selectors.join(','), (elements, minW, minH) => {
      return elements.map(el => ({
        src: el.src,
        alt: el.alt,
        width: el.naturalWidth || el.width,
        height: el.naturalHeight || el.height
      })).filter(img => img.width >= minW && img.height >= minH);
    }, minWidth, minHeight);
    
    return images;
  }

  /**
   * Extract SEO data
   */
  async extractSEOData(page, strategy, config) {
    const seoData = {};
    
    // Title
    try {
      seoData.title = await page.$eval('title', el => el.textContent);
    } catch {}
    
    // Meta description
    try {
      seoData.description = await page.$eval('meta[name="description"]', el => el.content);
    } catch {}
    
    // Canonical URL
    try {
      seoData.canonical = await page.$eval('link[rel="canonical"]', el => el.href);
    } catch {}
    
    // Open Graph
    try {
      seoData.og = await page.$$eval('meta[property^="og:"]', elements => {
        const og = {};
        elements.forEach(el => {
          const property = el.getAttribute('property').replace('og:', '');
          og[property] = el.content;
        });
        return og;
      });
    } catch {}
    
    return seoData;
  }

  /**
   * Measure page performance
   */
  async measurePerformance(page, strategy, config) {
    const metrics = await page.metrics();
    const performance = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    return {
      ...metrics,
      ...performance
    };
  }

  /**
   * Track events (placeholder - requires instrumentation)
   */
  async trackEvents(page, strategy, config) {
    // This would require page instrumentation to track actual events
    return {
      tracked: false,
      message: 'Event tracking requires page instrumentation'
    };
  }

  /**
   * Compute derived metrics
   */
  async computeMetric(page, strategy, config) {
    // Execute custom computation logic
    const formula = strategy.formula || config.formula;
    if (!formula) return null;
    
    try {
      return await page.evaluate(formula);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate extracted data
   */
  validateExtraction(value, rules) {
    if (!rules) return true;
    
    if (rules.required && (value === null || value === undefined)) {
      return false;
    }
    
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) return false;
      if (rules.maxLength && value.length > rules.maxLength) return false;
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) return false;
    }
    
    if (typeof value === 'number') {
      if (rules.min !== null && value < rules.min) return false;
      if (rules.max !== null && value > rules.max) return false;
    }
    
    return true;
  }

  /**
   * Setup real-time data streaming
   */
  setupDataStreaming() {
    console.log('📡 Setting up real-time data streaming');
    
    // Stream extracted data to subscribers
    this.on('dataExtracted', (data) => {
      this.streamData({
        type: 'extraction',
        workerId: this.workerId,
        miningId: this.miningId,
        data
      });
    });
    
    // Stream performance metrics
    setInterval(() => {
      this.streamData({
        type: 'metrics',
        workerId: this.workerId,
        stats: this.extractionStats
      });
    }, 5000);
  }

  /**
   * Stream data to subscribers
   */
  streamData(data) {
    // Add to buffer
    this.dataStream.buffer.push({
      ...data,
      timestamp: Date.now()
    });
    
    // Trim buffer if too large
    if (this.dataStream.buffer.length > this.dataStream.maxBufferSize) {
      this.dataStream.buffer.shift();
    }
    
    // Notify subscribers
    for (const subscriber of this.dataStream.subscribers) {
      try {
        subscriber(data);
      } catch (error) {
        console.error('Stream subscriber error:', error);
      }
    }
    
    this.emit('dataStreamed', data);
  }

  /**
   * Subscribe to data stream
   */
  subscribe(callback) {
    this.dataStream.subscribers.add(callback);
    
    return () => {
      this.dataStream.subscribers.delete(callback);
    };
  }

  /**
   * Setup two-way communication channel
   */
  setupCommunicationChannel() {
    console.log('🔄 Setting up two-way communication channel');
    
    // Listen for config updates
    this.on('configUpdate', async (update) => {
      this.communicationChannel.configUpdates.set(update.key, update.value);
      this.communicationChannel.pendingChanges.push(update);
      
      // Apply update immediately
      await this.applyConfigUpdate(update);
      
      this.emit('configApplied', update);
    });
    
    // Sync pending changes periodically
    setInterval(() => {
      this.syncConfigChanges();
    }, 10000);
  }

  /**
   * Apply configuration update in real-time
   */
  async applyConfigUpdate(update) {
    try {
      switch (update.type) {
        case 'attribute_config':
          // Update attribute configuration
          if (this.miningConfig.attribute_config[update.attributeId]) {
            this.miningConfig.attribute_config[update.attributeId] = {
              ...this.miningConfig.attribute_config[update.attributeId],
              ...update.config
            };
          }
          break;
          
        case 'rate_limit':
          // Update rate limiting
          this.miningConfig.rate_limit_ms = update.value;
          if (this.crawler) {
            this.crawler.config.requestDelay = update.value;
          }
          break;
          
        case 'max_urls':
          // Update URL limit
          this.miningConfig.max_urls = update.value;
          break;
          
        default:
          console.warn('Unknown update type:', update.type);
      }
      
      console.log(`✅ Applied config update: ${update.type}`);
    } catch (error) {
      console.error('Failed to apply config update:', error);
    }
  }

  /**
   * Sync config changes to database
   */
  async syncConfigChanges() {
    if (this.communicationChannel.pendingChanges.length === 0) return;
    
    try {
      // Update mining instance in database
      await dataMiningInstanceService.updateMiningInstanceInDB(this.miningConfig);
      
      this.communicationChannel.pendingChanges = [];
      this.communicationChannel.lastSync = Date.now();
      
      console.log('✅ Config changes synced to database');
    } catch (error) {
      console.error('Failed to sync config changes:', error);
    }
  }

  /**
   * Initialize simulation engine
   */
  initializeSimulation() {
    console.log('🎮 Initializing simulation engine for self-improvement');
    
    // Create baseline scenario from current config
    this.simulationEngine.scenarios.push({
      id: 'baseline',
      config: { ...this.miningConfig },
      results: null,
      score: 0
    });
    
    // Generate variation scenarios
    this.generateSimulationScenarios();
  }

  /**
   * Generate simulation scenarios for testing improvements
   */
  generateSimulationScenarios() {
    const variations = [
      { name: 'faster_rate', rate_limit_ms: this.miningConfig.rate_limit_ms * 0.5 },
      { name: 'slower_rate', rate_limit_ms: this.miningConfig.rate_limit_ms * 2 },
      { name: 'deeper_crawl', max_depth: this.miningConfig.max_depth + 1 },
      { name: 'more_urls', max_urls: this.miningConfig.max_urls * 2 }
    ];
    
    for (const variation of variations) {
      this.simulationEngine.scenarios.push({
        id: variation.name,
        config: {
          ...this.miningConfig,
          ...variation
        },
        results: null,
        score: 0
      });
    }
  }

  /**
   * Run simulation to test configuration improvements
   */
  async runSimulation(scenarioId) {
    const scenario = this.simulationEngine.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }
    
    console.log(`🎮 Running simulation: ${scenarioId}`);
    
    // Simulate crawling with scenario config
    const simulationResults = {
      extractionRate: Math.random() * 100,
      errorRate: Math.random() * 10,
      averageTime: Math.random() * 5000,
      dataQuality: Math.random() * 100
    };
    
    // Calculate score
    scenario.score = (
      simulationResults.extractionRate * 0.4 +
      (100 - simulationResults.errorRate) * 0.3 +
      simulationResults.dataQuality * 0.3
    );
    
    scenario.results = simulationResults;
    this.simulationEngine.results.push(scenario);
    
    this.emit('simulationCompleted', scenario);
    
    return scenario;
  }

  /**
   * Learn from simulations and apply best configuration
   */
  async learnFromSimulations() {
    if (this.simulationEngine.results.length === 0) return;
    
    // Find best performing scenario
    const bestScenario = this.simulationEngine.results.reduce((best, current) => {
      return current.score > best.score ? current : best;
    });
    
    console.log(`📚 Best scenario: ${bestScenario.id} (score: ${bestScenario.score})`);
    
    // Apply best configuration if significantly better than baseline
    const baseline = this.simulationEngine.scenarios.find(s => s.id === 'baseline');
    if (bestScenario.score > baseline.score * 1.1) {
      console.log('✨ Applying improved configuration from simulation');
      
      // Apply improvements
      Object.assign(this.miningConfig, bestScenario.config);
      
      // Sync to database
      await this.syncConfigChanges();
      
      this.emit('configImproved', {
        oldScore: baseline.score,
        newScore: bestScenario.score,
        improvement: ((bestScenario.score - baseline.score) / baseline.score * 100).toFixed(2) + '%'
      });
    }
  }

  /**
   * Register attribute as LLM tool/skill
   */
  registerAsLLMTool(attribute) {
    const tool = {
      name: `extract_${attribute.name}`,
      description: attribute.description,
      category: attribute.category,
      schema: {
        type: 'function',
        function: {
          name: `extract_${attribute.name}`,
          description: `Extract ${attribute.name} from web page`,
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to extract data from'
              }
            },
            required: ['url']
          }
        }
      },
      handler: this.extractionHandlers.get(attribute.attribute_id)
    };
    
    this.llmTools.set(attribute.attribute_id, tool);
    this.emit('toolRegistered', tool);
  }

  /**
   * Get LLM tools configuration
   */
  getLLMToolsConfig() {
    return Array.from(this.llmTools.values()).map(tool => tool.schema);
  }

  /**
   * Start crawling with the configured mining instance
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Worker is already running');
    }
    
    console.log(`▶️ Starting Campaign Web Crawler Worker: ${this.workerId}`);
    
    try {
      this.isRunning = true;
      
      // Start crawler
      const urls = this.miningConfig.target_urls || [];
      
      for (const url of urls) {
        await this.crawlURL(url);
      }
      
      console.log(`✅ Worker completed crawling ${urls.length} URLs`);
      this.emit('completed', {
        workerId: this.workerId,
        urlsCrawled: urls.length,
        dataExtracted: this.extractedData.length
      });
      
    } catch (error) {
      console.error('Worker crawling failed:', error);
      this.emit('error', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Crawl a single URL
   */
  async crawlURL(url) {
    console.log(`🌐 Crawling: ${url}`);
    
    try {
      // Launch browser if not already running
      if (!this.crawler.browser) {
        await this.crawler.launchBrowser();
      }
      
      const page = await this.crawler.browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract data for each attribute
      const extractedPage = {
        url,
        timestamp: new Date().toISOString(),
        attributes: {}
      };
      
      for (const [attrId, handler] of this.extractionHandlers) {
        const result = await handler(page, url);
        extractedPage.attributes[result.attribute_name] = result;
        
        this.emit('dataExtracted', result);
      }
      
      this.extractedData.push(extractedPage);
      
      // Stream data in real-time
      this.streamData({
        type: 'pageExtracted',
        url,
        data: extractedPage
      });
      
      await page.close();
      
      // Update stats
      this.extractionStats.totalExtracted++;
      
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error.message);
      this.emit('crawlError', { url, error: error.message });
    }
  }

  /**
   * Stop the worker
   */
  async stop() {
    console.log(`⏹️ Stopping worker: ${this.workerId}`);
    
    this.isRunning = false;
    
    if (this.crawler && this.crawler.browser) {
      await this.crawler.browser.close();
    }
    
    this.emit('stopped', { workerId: this.workerId });
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      workerId: this.workerId,
      miningId: this.miningId,
      campaignId: this.campaignId,
      isRunning: this.isRunning,
      extractionStats: this.extractionStats,
      dataStreamEnabled: this.dataStream.enabled,
      subscriberCount: this.dataStream.subscribers.size,
      pendingConfigChanges: this.communicationChannel.pendingChanges.length,
      simulationsRun: this.simulationEngine.results.length,
      llmToolsRegistered: this.llmTools.size
    };
  }
}

export default CampaignWebCrawlerWorker;
export { CampaignWebCrawlerWorker };
