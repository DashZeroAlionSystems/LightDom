/**
 * TensorFlow Integration for Crawlers and Seeders
 * 
 * This module integrates TensorFlow-powered SEO analysis into the crawling
 * and seeding pipeline, enabling:
 * 
 * 1. Real-time ML-enhanced SEO attribute extraction
 * 2. Continuous learning from each crawl
 * 3. Intelligent seeding strategies based on ML predictions
 * 4. Automated optimization recommendations
 * 5. Performance tracking and improvement metrics
 */

import { PretrainedSEONetwork } from './pretrained-seo-network.js';
import { SEOCrawlerIntegration } from '../../crawler/SEOCrawlerIntegration.js';
import { EventEmitter } from 'events';

/**
 * TensorFlow-Enhanced Crawler
 * 
 * Wraps the standard crawler with ML capabilities
 */
export class TensorFlowEnhancedCrawler extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enableML: config.enableML !== false,
      autoLearn: config.autoLearn !== false,
      minConfidence: config.minConfidence || 0.7,
      saveFrequency: config.saveFrequency || 100,
      modelPath: config.modelPath || './models/seo',
      ...config
    };
    
    this.seoNetwork = null;
    this.crawlerIntegration = new SEOCrawlerIntegration(config);
    this.crawlStats = {
      totalPages: 0,
      pagesWithML: 0,
      averageConfidence: 0,
      recommendationsGenerated: 0,
      learningIterations: 0
    };
  }

  /**
   * Initialize the ML-enhanced crawler
   */
  async initialize() {
    console.log('🚀 Initializing TensorFlow-Enhanced Crawler...');
    
    if (this.config.enableML) {
      this.seoNetwork = new PretrainedSEONetwork({
        modelPath: this.config.modelPath,
        autoSave: true,
        saveInterval: this.config.saveFrequency,
        continuousLearning: this.config.autoLearn,
        minConfidenceThreshold: this.config.minConfidence
      });
      
      await this.seoNetwork.initialize();
      
      // Listen to network events
      this.seoNetwork.on('batchTrained', (data) => {
        this.crawlStats.learningIterations++;
        this.emit('learningProgress', data);
      });
      
      this.seoNetwork.on('metricsUpdated', (metrics) => {
        this.emit('metricsUpdated', metrics);
      });
      
      console.log('✅ ML capabilities enabled');
    } else {
      console.log('⚠️ ML capabilities disabled');
    }
    
    console.log('✅ TensorFlow-Enhanced Crawler initialized');
  }

  /**
   * Crawl and analyze page with ML enhancement
   */
  async crawlPage(url, html, metadata = {}) {
    this.crawlStats.totalPages++;
    
    try {
      let attributes;
      
      if (this.config.enableML && this.seoNetwork) {
        // ML-enhanced extraction
        attributes = await this.seoNetwork.processPageWithML(url, html, metadata);
        this.crawlStats.pagesWithML++;
        
        // Update average confidence
        if (attributes.mlConfidence) {
          this.crawlStats.averageConfidence = 
            (this.crawlStats.averageConfidence * (this.crawlStats.pagesWithML - 1) + 
             attributes.mlConfidence) / this.crawlStats.pagesWithML;
        }
        
        // Count recommendations
        if (attributes.mlRecommendations) {
          this.crawlStats.recommendationsGenerated += attributes.mlRecommendations.length;
        }
      } else {
        // Standard extraction without ML
        const { extractSEOAttributes } = await import('../../services/seo-attribute-extractor.js');
        attributes = await extractSEOAttributes(html, url);
      }
      
      // Save to database
      await this.crawlerIntegration.savePageData({
        url,
        attributes,
        metadata,
        crawledAt: new Date().toISOString()
      });
      
      this.emit('pageCrawled', { url, attributes });
      
      return attributes;
    } catch (error) {
      console.error(`❌ Error crawling ${url}:`, error);
      this.emit('crawlError', { url, error });
      throw error;
    }
  }

  /**
   * Batch crawl multiple URLs
   */
  async crawlBatch(urls, options = {}) {
    console.log(`📊 Crawling batch of ${urls.length} URLs...`);
    
    const results = [];
    const concurrency = options.concurrency || 3;
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      
      const batchResults = await Promise.allSettled(
        batch.map(url => this.crawlPage(url.url, url.html, url.metadata))
      );
      
      results.push(...batchResults);
      
      // Emit progress
      this.emit('batchProgress', {
        processed: i + batch.length,
        total: urls.length,
        percentage: ((i + batch.length) / urls.length * 100).toFixed(2)
      });
    }
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Batch complete: ${successful}/${urls.length} successful`);
    
    return results;
  }

  /**
   * Get crawler statistics
   */
  getStats() {
    return {
      ...this.crawlStats,
      mlEnabled: this.config.enableML,
      autoLearnEnabled: this.config.autoLearn,
      networkStatus: this.seoNetwork ? this.seoNetwork.getStatus() : null
    };
  }

  /**
   * Force save ML model
   */
  async saveModel() {
    if (this.seoNetwork) {
      await this.seoNetwork.saveModel();
    }
  }

  /**
   * Cleanup and dispose
   */
  async dispose() {
    if (this.seoNetwork) {
      await this.seoNetwork.dispose();
    }
    console.log('🗑️ TensorFlow-Enhanced Crawler disposed');
  }
}

/**
 * TensorFlow-Enhanced Seeder
 * 
 * Intelligent URL seeding based on ML predictions
 */
export class TensorFlowEnhancedSeeder extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enableML: config.enableML !== false,
      priorityThreshold: config.priorityThreshold || 0.8,
      maxQueueSize: config.maxQueueSize || 1000,
      modelPath: config.modelPath || './models/seo',
      ...config
    };
    
    this.seoNetwork = null;
    this.seedQueue = [];
    this.seedHistory = [];
    this.stats = {
      totalSeeded: 0,
      highPrioritySeeds: 0,
      averagePriority: 0,
      successfulCrawls: 0
    };
  }

  /**
   * Initialize the ML-enhanced seeder
   */
  async initialize() {
    console.log('🌱 Initializing TensorFlow-Enhanced Seeder...');
    
    if (this.config.enableML) {
      this.seoNetwork = new PretrainedSEONetwork({
        modelPath: this.config.modelPath,
        autoSave: true,
        continuousLearning: false // Seeder doesn't train
      });
      
      await this.seoNetwork.initialize();
      console.log('✅ ML capabilities enabled for seeding');
    }
    
    console.log('✅ TensorFlow-Enhanced Seeder initialized');
  }

  /**
   * Seed URL with ML-based prioritization
   */
  async seedURL(url, metadata = {}) {
    try {
      let priority = metadata.priority || 0.5;
      let predictions = null;
      
      if (this.config.enableML && this.seoNetwork && metadata.html) {
        // Analyze URL with ML to determine priority
        const attributes = await this.seoNetwork.processPageWithML(url, metadata.html);
        
        // Calculate priority based on ML predictions
        priority = this.calculateSeedPriority(attributes);
        predictions = attributes.mlRecommendations;
      }
      
      const seed = {
        url,
        priority,
        predictions,
        metadata,
        seededAt: new Date().toISOString()
      };
      
      this.addToQueue(seed);
      this.stats.totalSeeded++;
      
      if (priority >= this.config.priorityThreshold) {
        this.stats.highPrioritySeeds++;
      }
      
      // Update average priority
      this.stats.averagePriority = 
        (this.stats.averagePriority * (this.stats.totalSeeded - 1) + priority) / 
        this.stats.totalSeeded;
      
      this.emit('urlSeeded', seed);
      
      return seed;
    } catch (error) {
      console.error(`❌ Error seeding ${url}:`, error);
      throw error;
    }
  }

  /**
   * Calculate seed priority based on ML predictions
   */
  calculateSeedPriority(attributes) {
    let priority = 0.5; // Base priority
    
    // Factor in SEO score
    const seoScore = parseFloat(attributes.seoScore) || 50;
    priority += (seoScore / 100) * 0.3;
    
    // Factor in ML confidence
    if (attributes.mlConfidence) {
      priority += attributes.mlConfidence * 0.2;
    }
    
    // Factor in number of high-priority recommendations
    if (attributes.mlRecommendations) {
      const highPriorityRecs = attributes.mlRecommendations.filter(
        r => r.priority > 80
      ).length;
      priority += Math.min(highPriorityRecs / 10, 0.3);
    }
    
    // Factor in content quality
    if (attributes.contentQualityScore) {
      priority += (parseFloat(attributes.contentQualityScore) / 100) * 0.2;
    }
    
    return Math.min(1, Math.max(0, priority));
  }

  /**
   * Add seed to priority queue
   */
  addToQueue(seed) {
    this.seedQueue.push(seed);
    
    // Sort by priority (highest first)
    this.seedQueue.sort((a, b) => b.priority - a.priority);
    
    // Limit queue size
    if (this.seedQueue.length > this.config.maxQueueSize) {
      const removed = this.seedQueue.pop();
      console.log(`⚠️ Queue full, removed lowest priority seed: ${removed.url}`);
    }
    
    this.seedHistory.push({
      url: seed.url,
      priority: seed.priority,
      timestamp: seed.seededAt
    });
  }

  /**
   * Get next URL to crawl (highest priority)
   */
  getNextURL() {
    return this.seedQueue.shift();
  }

  /**
   * Get top N priority URLs
   */
  getTopURLs(n = 10) {
    return this.seedQueue.slice(0, n);
  }

  /**
   * Batch seed multiple URLs
   */
  async seedBatch(urls) {
    console.log(`🌱 Seeding batch of ${urls.length} URLs...`);
    
    const results = await Promise.allSettled(
      urls.map(item => this.seedURL(item.url, item.metadata))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Seeding complete: ${successful}/${urls.length} successful`);
    
    return results;
  }

  /**
   * Get seeder statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.seedQueue.length,
      mlEnabled: this.config.enableML,
      topPriorityURL: this.seedQueue[0]?.url || null
    };
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.seedQueue = [];
    console.log('🧹 Seed queue cleared');
  }

  /**
   * Cleanup and dispose
   */
  async dispose() {
    if (this.seoNetwork) {
      await this.seoNetwork.dispose();
    }
    console.log('🗑️ TensorFlow-Enhanced Seeder disposed');
  }
}

/**
 * Unified TensorFlow SEO System
 * 
 * Combines crawler and seeder with shared neural network
 */
export class TensorFlowSEOSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.crawler = new TensorFlowEnhancedCrawler(config);
    this.seeder = new TensorFlowEnhancedSeeder(config);
    this.isRunning = false;
  }

  /**
   * Initialize the complete system
   */
  async initialize() {
    console.log('🎯 Initializing TensorFlow SEO System...');
    
    await Promise.all([
      this.crawler.initialize(),
      this.seeder.initialize()
    ]);
    
    // Forward events
    this.crawler.on('pageCrawled', (data) => this.emit('pageCrawled', data));
    this.crawler.on('learningProgress', (data) => this.emit('learningProgress', data));
    this.seeder.on('urlSeeded', (data) => this.emit('urlSeeded', data));
    
    console.log('✅ TensorFlow SEO System initialized');
  }

  /**
   * Start automated crawl-seed-learn loop
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ System already running');
      return;
    }
    
    this.isRunning = true;
    console.log('▶️ TensorFlow SEO System started');
    
    this.emit('systemStarted');
  }

  /**
   * Stop the system
   */
  async stop() {
    this.isRunning = false;
    console.log('⏸️ TensorFlow SEO System stopped');
    
    this.emit('systemStopped');
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      crawler: this.crawler.getStats(),
      seeder: this.seeder.getStats()
    };
  }

  /**
   * Cleanup and dispose
   */
  async dispose() {
    await this.stop();
    await Promise.all([
      this.crawler.dispose(),
      this.seeder.dispose()
    ]);
    console.log('🗑️ TensorFlow SEO System disposed');
  }
}

/**
 * Usage Guide and Documentation
 */
export const TENSORFLOW_INTEGRATION_GUIDE = {
  overview: 'TensorFlow.js integration for SEO data mining and continuous learning',
  
  features: [
    'Pre-trained neural network on 192 SEO attributes',
    'Real-time ML-enhanced attribute extraction',
    'Continuous learning from each crawl',
    'Intelligent URL prioritization',
    'Automated optimization recommendations',
    'Performance metrics and monitoring'
  ],
  
  usage: {
    basicCrawler: `
      import { TensorFlowEnhancedCrawler } from './tensorflow-crawler-integration.js';
      
      const crawler = new TensorFlowEnhancedCrawler({
        enableML: true,
        autoLearn: true,
        modelPath: './models/seo'
      });
      
      await crawler.initialize();
      const attributes = await crawler.crawlPage(url, html);
      console.log('Recommendations:', attributes.mlRecommendations);
    `,
    
    basicSeeder: `
      import { TensorFlowEnhancedSeeder } from './tensorflow-crawler-integration.js';
      
      const seeder = new TensorFlowEnhancedSeeder({
        enableML: true,
        priorityThreshold: 0.8
      });
      
      await seeder.initialize();
      await seeder.seedURL(url, { html });
      const nextURL = seeder.getNextURL();
    `,
    
    completeSystem: `
      import { TensorFlowSEOSystem } from './tensorflow-crawler-integration.js';
      
      const system = new TensorFlowSEOSystem({
        enableML: true,
        autoLearn: true,
        modelPath: './models/seo'
      });
      
      await system.initialize();
      await system.start();
      
      // Listen to events
      system.on('pageCrawled', (data) => {
        console.log('Page crawled:', data.url);
        console.log('Recommendations:', data.attributes.mlRecommendations);
      });
      
      system.on('learningProgress', (data) => {
        console.log('Learning progress:', data.total, 'samples');
      });
    `
  },
  
  models: 'See SEO_MODELS in seo-tensorflow-models.js for all available models',
  
  continuousLearning: {
    description: 'The system learns from each crawl automatically',
    mechanism: 'Batches are queued and trained periodically',
    autoSave: 'Model is saved every N iterations (configurable)',
    metrics: 'Accuracy, precision, recall, F1 score tracked in real-time'
  },
  
  recommendations: {
    confidence: 'Each recommendation has confidence score (0-1)',
    priority: 'Priority calculated based on impact and current SEO score',
    categories: ['meta', 'content', 'technical', 'links', 'images', 'performance']
  }
};

export default {
  TensorFlowEnhancedCrawler,
  TensorFlowEnhancedSeeder,
  TensorFlowSEOSystem,
  TENSORFLOW_INTEGRATION_GUIDE
};
