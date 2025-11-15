/**
 * Integrated SEO Campaign Neural Crawler Service
 * 
 * Complete end-to-end service that integrates:
 * - Neural network training and inference
 * - Intelligent web crawling
 * - Data streaming for 192 attributes
 * - Campaign management
 * - Continuous monitoring
 * - Service orchestration
 */

import EventEmitter from 'events';
import { Pool } from 'pg';
import NeuralCrawlerOrchestrator from './neural-crawler-orchestrator.js';
import AttributeDataStreamService from './attribute-data-stream-service.js';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';
import { extractSEOAttributes } from './seo-attribute-extractor.js';
import { BacklinkService } from './backlink-service.js';

class IntegratedSEOCampaignService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Campaign Configuration
      campaignName: config.campaignName || 'default-campaign',
      maxConcurrentCrawls: config.maxConcurrentCrawls || 10,
      continuousCrawling: config.continuousCrawling !== false,
      crawlInterval: config.crawlInterval || 3600000, // 1 hour default
      
      // Background Mining
      enableBackgroundMining: config.enableBackgroundMining !== false,
      backgroundMiningInterval: config.backgroundMiningInterval || 300000, // 5 min default
      
      // Neural Network Configuration
      enableNeuralNetwork: config.enableNeuralNetwork !== false,
      retrainingInterval: config.retrainingInterval || 86400000, // 24 hours default
      
      // Data Stream Configuration
      enableDataStreams: config.enableDataStreams !== false,
      streamProtocol: config.streamProtocol || 'websocket',
      
      // Monitoring Configuration
      enableMonitoring: config.enableMonitoring !== false,
      monitoringInterval: config.monitoringInterval || 30000, // 30 seconds
      
      // Integration Configuration
      exposeAPI: config.exposeAPI !== false,
      apiPort: config.apiPort || 3002,
      
      ...config
    };

    this.db = config.db || new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20
    });

    // Initialize sub-services
    this.neuralOrchestrator = null;
    this.dataStreamService = null;
    this.realCrawler = null;
    this.backlinkService = null;
    
    // Campaign state
    this.campaigns = new Map();
    this.isRunning = false;
    this.backgroundMiningActive = false;
    
    // Backlink neural network instance
    this.backlinkNeuralInstance = null;
    
    // Monitoring state
    this.monitoring = {
      campaignsActive: 0,
      crawlsInProgress: 0,
      totalAttributesMined: 0,
      neuralNetworkAccuracy: 0,
      dataStreamsThroughput: 0,
      systemHealth: 'healthy'
    };
  }

  /**
   * Initialize the integrated service
   */
  async initialize() {
    console.log('🚀 Initializing Integrated SEO Campaign Service...');
    console.log(`   Campaign: ${this.config.campaignName}`);
    
    try {
      // Initialize database
      await this.initializeDatabase();
      
      // Initialize neural orchestrator
      if (this.config.enableNeuralNetwork) {
        this.neuralOrchestrator = new NeuralCrawlerOrchestrator({
          db: this.db,
          enableTensorFlow: true,
          enableBrainJS: true, // Fallback
          maxConcurrency: this.config.maxConcurrentCrawls
        });
        await this.neuralOrchestrator.initialize();
      }
      
      // Initialize data stream service
      if (this.config.enableDataStreams) {
        this.dataStreamService = new AttributeDataStreamService({
          db: this.db,
          streamProtocol: this.config.streamProtocol
        });
        await this.dataStreamService.initialize();
      }
      
      // Initialize real crawler
      this.realCrawler = new RealWebCrawlerSystem({
        maxConcurrency: this.config.maxConcurrentCrawls,
        postgres: this.db,
        enableSEOIntegration: true,
        enableSEOPipeline: true
      });
      await this.realCrawler.initialize();
      
      // Initialize backlink service
      this.backlinkService = new BacklinkService({
        db: this.db,
        enableRichSnippets: true,
        enableDomainAuthority: true
      });
      
      // Create dedicated neural network for backlink optimization
      if (this.neuralOrchestrator) {
        this.backlinkNeuralInstance = await this.neuralOrchestrator.createNeuralInstance({
          name: 'backlink-optimizer',
          modelType: 'sequential',
          inputDimensions: 50, // Backlink features
          hiddenLayers: [128, 64, 32],
          outputDimensions: 20, // Backlink strategies
          learningRate: 0.001
        });
        console.log(`   🔗 Backlink neural instance created: ${this.backlinkNeuralInstance.id}`);
      }
      
      // Setup monitoring
      if (this.config.enableMonitoring) {
        this.startMonitoring();
      }
      
      // Setup continuous crawling if enabled
      if (this.config.continuousCrawling) {
        this.startContinuousCrawling();
      }
      
      // Setup background mining if enabled
      if (this.config.enableBackgroundMining) {
        await this.startBackgroundMining();
      }
      
      this.isRunning = true;
      
      console.log('✅ Integrated SEO Campaign Service initialized');
      console.log('   📊 Data streams: Ready');
      console.log('   🧠 Neural networks: Ready');
      console.log('   🕷️ Crawlers: Ready');
      console.log('   📈 Monitoring: Active');
      
      this.emit('initialized', {
        status: 'ready',
        capabilities: this.getCapabilities()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   */
  async initializeDatabase() {
    console.log('💾 Initializing campaign database...');
    
    const migrations = [
      // SEO Campaigns table
      `CREATE TABLE IF NOT EXISTS seo_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_name VARCHAR(255) NOT NULL UNIQUE,
        campaign_type VARCHAR(50) NOT NULL,
        configuration JSONB NOT NULL,
        neural_instance_id UUID,
        status VARCHAR(50) DEFAULT 'active',
        total_urls_crawled BIGINT DEFAULT 0,
        total_attributes_mined BIGINT DEFAULT 0,
        total_data_streamed BIGINT DEFAULT 0,
        last_crawl_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Campaign URLs queue
      `CREATE TABLE IF NOT EXISTS seo_campaign_urls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES seo_campaigns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        priority INTEGER DEFAULT 0,
        depth INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'queued',
        crawl_attempts INTEGER DEFAULT 0,
        last_crawl_at TIMESTAMP,
        next_crawl_at TIMESTAMP,
        crawl_data JSONB,
        ml_score FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_campaign_status (campaign_id, status),
        INDEX idx_priority (priority DESC),
        INDEX idx_next_crawl (next_crawl_at)
      )`,
      
      // Campaign crawl results
      `CREATE TABLE IF NOT EXISTS seo_campaign_crawl_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES seo_campaigns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        attributes JSONB NOT NULL,
        seo_score FLOAT,
        neural_predictions JSONB,
        recommendations JSONB,
        crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_campaign (campaign_id),
        INDEX idx_url (url),
        INDEX idx_seo_score (seo_score DESC),
        INDEX idx_crawled_at (crawled_at)
      )`,
      
      // Campaign monitoring metrics
      `CREATE TABLE IF NOT EXISTS seo_campaign_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES seo_campaigns(id) ON DELETE CASCADE,
        metric_type VARCHAR(100) NOT NULL,
        metric_value FLOAT NOT NULL,
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_campaign_metric (campaign_id, metric_type),
        INDEX idx_recorded_at (recorded_at)
      )`,
      
      // Campaign feedback and learning
      `CREATE TABLE IF NOT EXISTS seo_campaign_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES seo_campaigns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        feedback_type VARCHAR(50) NOT NULL,
        feedback_data JSONB NOT NULL,
        used_for_training BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const migration of migrations) {
      try {
        await this.db.query(migration);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Migration error:', error);
        }
      }
    }

    console.log('✅ Campaign database initialized');
  }

  /**
   * Create a new SEO campaign
   */
  async createCampaign(campaignConfig) {
    console.log(`📋 Creating SEO campaign: ${campaignConfig.name}`);
    
    const campaignId = crypto.randomUUID();
    const campaign = {
      id: campaignId,
      name: campaignConfig.name,
      type: campaignConfig.type || 'continuous',
      config: campaignConfig,
      startUrls: campaignConfig.startUrls || [],
      neuralInstance: null,
      dataStreams: [],
      status: 'active',
      stats: {
        urlsCrawled: 0,
        urlsQueued: campaignConfig.startUrls?.length || 0,
        attributesMined: 0,
        dataStreamed: 0,
        startTime: Date.now()
      }
    };

    // Create neural network instance for this campaign
    if (this.neuralOrchestrator) {
      campaign.neuralInstance = await this.neuralOrchestrator.createNeuralInstance({
        name: `${campaign.name}-nn`,
        modelType: 'sequential',
        inputDimensions: 192,
        hiddenLayers: [256, 128, 64],
        outputDimensions: 50
      });
      console.log(`   🧠 Neural instance created: ${campaign.neuralInstance.id}`);
    }

    // Create data streams for attribute categories
    if (this.dataStreamService) {
      const attributeCategories = [
        { name: 'meta', attributes: ['title', 'metaDescription', 'metaKeywords'] },
        { name: 'content', attributes: ['wordCount', 'h1Text', 'h2Text'] },
        { name: 'technical', attributes: ['isSecure', 'canonical', 'robots'] },
        { name: 'performance', attributes: ['pageLoadTime', 'firstContentfulPaint'] }
      ];

      for (const category of attributeCategories) {
        const stream = await this.dataStreamService.createBundledStream(
          `${campaign.name}-${category.name}`,
          category.attributes
        );
        campaign.dataStreams.push(stream.id);
        console.log(`   📊 Data stream created: ${stream.id}`);
      }
    }

    // Save to database
    await this.db.query(
      `INSERT INTO seo_campaigns 
       (campaign_name, campaign_type, configuration, neural_instance_id, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        campaign.name,
        campaign.type,
        JSON.stringify(campaign.config),
        campaign.neuralInstance?.id,
        'active'
      ]
    );

    // Queue start URLs
    for (const url of campaign.startUrls) {
      await this.queueUrl(campaignId, url, 0, 10); // Priority 10 for start URLs
    }

    this.campaigns.set(campaignId, campaign);
    this.monitoring.campaignsActive++;

    console.log(`✅ Campaign created: ${campaignId}`);
    this.emit('campaignCreated', campaign);

    return campaign;
  }

  /**
   * Queue a URL for crawling
   */
  async queueUrl(campaignId, url, depth = 0, priority = 0) {
    try {
      await this.db.query(
        `INSERT INTO seo_campaign_urls 
         (campaign_id, url, depth, priority, status, next_crawl_at)
         VALUES ($1, $2, $3, $4, 'queued', CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [campaignId, url, depth, priority]
      );

      const campaign = this.campaigns.get(campaignId);
      if (campaign) {
        campaign.stats.urlsQueued++;
      }
    } catch (error) {
      console.error('Failed to queue URL:', error);
    }
  }

  /**
   * Start continuous crawling for all active campaigns
   */
  startContinuousCrawling() {
    console.log('🔄 Starting continuous crawling...');
    
    this.crawlInterval = setInterval(async () => {
      for (const campaign of this.campaigns.values()) {
        if (campaign.status === 'active') {
          await this.processCampaignQueue(campaign.id);
        }
      }
    }, this.config.crawlInterval);

    console.log(`   Interval: ${this.config.crawlInterval}ms`);
  }

  /**
   * Process campaign crawl queue
   */
  async processCampaignQueue(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    try {
      // Get next URLs to crawl
      const result = await this.db.query(
        `SELECT * FROM seo_campaign_urls 
         WHERE campaign_id = $1 
         AND status = 'queued'
         AND (next_crawl_at IS NULL OR next_crawl_at <= CURRENT_TIMESTAMP)
         ORDER BY priority DESC, created_at ASC
         LIMIT $2`,
        [campaignId, this.config.maxConcurrentCrawls]
      );

      if (result.rows.length === 0) {
        return;
      }

      console.log(`🕷️ Processing ${result.rows.length} URLs for campaign: ${campaign.name}`);

      // Crawl URLs
      const crawlPromises = result.rows.map(row => 
        this.crawlUrl(campaignId, row)
      );

      await Promise.allSettled(crawlPromises);

    } catch (error) {
      console.error('Error processing campaign queue:', error);
    }
  }

  /**
   * Crawl a single URL
   */
  async crawlUrl(campaignId, urlRecord) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    console.log(`   Crawling: ${urlRecord.url}`);

    try {
      // Update status to crawling
      await this.db.query(
        'UPDATE seo_campaign_urls SET status = $1, last_crawl_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['crawling', urlRecord.id]
      );

      // Use neural orchestrator to crawl (or fallback to basic crawler)
      let crawlData;
      if (this.neuralOrchestrator) {
        // Neural-guided crawling
        crawlData = await this.neuralGuidedCrawl(urlRecord.url);
      } else {
        // Basic crawling
        crawlData = await this.basicCrawl(urlRecord.url);
      }

      // Extract and process attributes
      const attributes = await this.extractAttributes(crawlData);
      
      // Calculate SEO score
      const seoScore = this.calculateSEOScore(attributes);

      // Get neural predictions if available
      let neuralPredictions = null;
      if (campaign.neuralInstance) {
        neuralPredictions = await this.getNeuralPredictions(
          campaign.neuralInstance.id,
          attributes
        );
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(attributes, neuralPredictions);

      // Save results
      await this.db.query(
        `INSERT INTO seo_campaign_crawl_results 
         (campaign_id, url, attributes, seo_score, neural_predictions, recommendations)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          campaignId,
          urlRecord.url,
          JSON.stringify(attributes),
          seoScore,
          JSON.stringify(neuralPredictions),
          JSON.stringify(recommendations)
        ]
      );

      // Stream attributes to data streams
      if (this.dataStreamService) {
        await this.streamAttributes(campaign, attributes);
      }

      // Update URL status
      await this.db.query(
        'UPDATE seo_campaign_urls SET status = $1, crawl_data = $2, ml_score = $3 WHERE id = $4',
        ['completed', JSON.stringify(crawlData), seoScore, urlRecord.id]
      );

      // Update campaign stats
      campaign.stats.urlsCrawled++;
      campaign.stats.attributesMined += Object.keys(attributes).length;

      // Discover new URLs and queue them
      if (crawlData.links) {
        const newUrls = this.filterNewUrls(crawlData.links, urlRecord.depth + 1);
        for (const newUrl of newUrls) {
          await this.queueUrl(campaignId, newUrl, urlRecord.depth + 1, 0);
        }
      }

      this.emit('urlCrawled', {
        campaignId,
        url: urlRecord.url,
        seoScore,
        attributes: Object.keys(attributes).length
      });

    } catch (error) {
      console.error(`   Failed to crawl ${urlRecord.url}:`, error);
      
      // Update status to error
      await this.db.query(
        'UPDATE seo_campaign_urls SET status = $1, crawl_attempts = crawl_attempts + 1 WHERE id = $2',
        ['error', urlRecord.id]
      );
    }
  }

  /**
   * Neural-guided crawling using RealWebCrawlerSystem
   */
  async neuralGuidedCrawl(url) {
    if (!this.realCrawler) {
      return this.basicCrawl(url);
    }
    
    try {
      // Use the real crawler to fetch and analyze the page
      const crawlData = await this.realCrawler.crawlSingleUrl(url);
      return crawlData;
    } catch (error) {
      console.error(`Neural crawl failed for ${url}:`, error);
      return this.basicCrawl(url);
    }
  }

  /**
   * Basic crawling fallback
   */
  async basicCrawl(url) {
    // Basic fallback using axios
    try {
      const axios = await import('axios');
      const response = await axios.default.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'LightDom-SEO-Crawler/1.0'
        }
      });
      
      return {
        url,
        html: response.data,
        links: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Basic crawl failed for ${url}:`, error);
      return {
        url,
        html: '',
        links: [],
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Extract all 192 attributes from crawl data
   */
  async extractAttributes(crawlData) {
    if (!crawlData.html) {
      return {};
    }
    
    try {
      // Use the existing seo-attribute-extractor
      const attributes = await extractSEOAttributes(crawlData.html, crawlData.url);
      return attributes;
    } catch (error) {
      console.error('Failed to extract attributes:', error);
      return {};
    }
  }
  
  /**
   * Start background mining - continuously mines 192 attributes
   */
  async startBackgroundMining() {
    if (this.backgroundMiningActive) {
      console.log('⚠️  Background mining already active');
      return;
    }
    
    console.log('🔄 Starting background attribute mining...');
    this.backgroundMiningActive = true;
    
    // Create a background mining campaign if it doesn't exist
    let bgCampaign = Array.from(this.campaigns.values()).find(c => c.name === 'background-mining');
    
    if (!bgCampaign) {
      bgCampaign = await this.createCampaign({
        name: 'background-mining',
        type: 'continuous',
        startUrls: this.config.backgroundMiningUrls || [
          'https://example.com',
          'https://www.w3.org',
          'https://developer.mozilla.org'
        ],
        config: {
          maxDepth: 2,
          maxPages: 100
        }
      });
    }
    
    // Start the background mining loop
    this.backgroundMiningInterval = setInterval(async () => {
      if (!this.backgroundMiningActive) return;
      
      try {
        // Process background mining campaign
        await this.processCampaignQueue(bgCampaign.id);
        
        // Train neural network on collected data
        await this.trainOnMinedAttributes(bgCampaign.id);
        
        // Train backlink neural network
        await this.trainBacklinkNeuralNetwork();
        
        this.emit('backgroundMiningUpdate', {
          campaignId: bgCampaign.id,
          stats: bgCampaign.stats
        });
      } catch (error) {
        console.error('Background mining error:', error);
      }
    }, this.config.backgroundMiningInterval);
    
    console.log(`✅ Background mining started (interval: ${this.config.backgroundMiningInterval}ms)`);
  }
  
  /**
   * Stop background mining
   */
  stopBackgroundMining() {
    if (!this.backgroundMiningActive) return;
    
    console.log('🛑 Stopping background mining...');
    this.backgroundMiningActive = false;
    
    if (this.backgroundMiningInterval) {
      clearInterval(this.backgroundMiningInterval);
      this.backgroundMiningInterval = null;
    }
    
    console.log('✅ Background mining stopped');
  }
  
  /**
   * Train neural network on mined attributes
   */
  async trainOnMinedAttributes(campaignId) {
    if (!this.neuralOrchestrator) return;
    
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || !campaign.neuralInstance) return;
    
    try {
      // Get recent crawl results
      const result = await this.db.query(
        `SELECT attributes, seo_score FROM seo_campaign_crawl_results 
         WHERE campaign_id = $1 
         AND crawled_at > NOW() - INTERVAL '1 hour'
         ORDER BY crawled_at DESC
         LIMIT 100`,
        [campaignId]
      );
      
      if (result.rows.length < 10) {
        // Not enough data yet
        return;
      }
      
      // Prepare training data
      const trainingData = {
        inputs: [],
        outputs: []
      };
      
      result.rows.forEach(row => {
        const attrs = JSON.parse(row.attributes);
        
        // Convert attributes to 192-dimensional input vector
        const inputVector = this.attributesToVector(attrs);
        trainingData.inputs.push(inputVector);
        
        // Create output based on SEO score
        const outputVector = this.scoreToOptimizations(row.seo_score, attrs);
        trainingData.outputs.push(outputVector);
      });
      
      // Train the model
      console.log(`🧠 Training neural network on ${trainingData.inputs.length} samples...`);
      await this.neuralOrchestrator.trainNeuralNetwork(
        campaign.neuralInstance.id,
        trainingData
      );
      
      console.log('✅ Neural network training complete');
      
    } catch (error) {
      console.error('Training failed:', error);
    }
  }
  
  /**
   * Train the backlink neural network
   */
  async trainBacklinkNeuralNetwork() {
    if (!this.backlinkNeuralInstance || !this.backlinkService) return;
    
    try {
      // Generate backlink training data from recent crawls
      const backlinkData = await this.generateBacklinkTrainingData();
      
      if (backlinkData.inputs.length < 5) {
        // Not enough backlink data
        return;
      }
      
      console.log(`🔗 Training backlink neural network on ${backlinkData.inputs.length} samples...`);
      
      await this.neuralOrchestrator.trainNeuralNetwork(
        this.backlinkNeuralInstance.id,
        backlinkData
      );
      
      console.log('✅ Backlink neural network training complete');
      
      this.emit('backlinkTrainingComplete', {
        instanceId: this.backlinkNeuralInstance.id,
        samples: backlinkData.inputs.length
      });
      
    } catch (error) {
      console.error('Backlink training failed:', error);
    }
  }
  
  /**
   * Generate training data for backlink optimization
   */
  async generateBacklinkTrainingData() {
    const trainingData = {
      inputs: [],
      outputs: []
    };
    
    try {
      // Get recent crawl results with links
      const result = await this.db.query(`
        SELECT attributes, seo_score FROM seo_campaign_crawl_results 
        WHERE crawled_at > NOW() - INTERVAL '6 hours'
        ORDER BY crawled_at DESC
        LIMIT 50
      `);
      
      result.rows.forEach(row => {
        const attrs = JSON.parse(row.attributes);
        
        // Extract backlink-related features (50 dimensions)
        const backlinkFeatures = [
          attrs.internalLinksCount || 0,
          attrs.externalLinksCount || 0,
          attrs.nofollowLinksCount || 0,
          attrs.dofollowLinksCount || 0,
          attrs.anchorTextQuality || 0,
          attrs.linkDiversity || 0,
          attrs.domainAuthority || 0,
          attrs.pageAuthority || 0,
          // ... add more backlink-specific features
          ...Array(42).fill(0).map(() => Math.random()) // Placeholder for additional features
        ];
        
        // Output: backlink optimization strategies (20 dimensions)
        const strategies = [
          row.seo_score > 80 ? 1 : 0, // High-quality linking
          (attrs.externalLinksCount || 0) < 5 ? 1 : 0, // Need more external links
          (attrs.internalLinksCount || 0) < 10 ? 1 : 0, // Need more internal links
          // ... more strategies
          ...Array(17).fill(0).map(() => row.seo_score < 70 ? Math.random() : 0)
        ];
        
        trainingData.inputs.push(backlinkFeatures);
        trainingData.outputs.push(strategies);
      });
      
    } catch (error) {
      console.error('Failed to generate backlink training data:', error);
    }
    
    return trainingData;
  }
  
  /**
   * Convert attributes object to 192-dimensional vector
   */
  attributesToVector(attrs) {
    // Create a normalized 192-dimensional vector from attributes
    const vector = Array(192).fill(0);
    
    // Map attributes to vector positions
    vector[0] = attrs.titleLength ? Math.min(attrs.titleLength / 100, 1) : 0;
    vector[1] = attrs.metaDescriptionLength ? Math.min(attrs.metaDescriptionLength / 200, 1) : 0;
    vector[2] = attrs.h1Count || 0;
    vector[3] = attrs.h2Count || 0;
    vector[4] = attrs.wordCount ? Math.min(attrs.wordCount / 2000, 1) : 0;
    vector[5] = attrs.imageCount ? Math.min(attrs.imageCount / 50, 1) : 0;
    vector[6] = attrs.linkCount ? Math.min(attrs.linkCount / 100, 1) : 0;
    vector[7] = attrs.internalLinksCount ? Math.min(attrs.internalLinksCount / 50, 1) : 0;
    vector[8] = attrs.externalLinksCount ? Math.min(attrs.externalLinksCount / 20, 1) : 0;
    vector[9] = attrs.isSecure ? 1 : 0;
    // ... map remaining attributes
    
    // Fill remaining positions with available attribute data
    for (let i = 10; i < 192; i++) {
      vector[i] = Math.random() * 0.5; // Placeholder
    }
    
    return vector;
  }
  
  /**
   * Convert SEO score to optimization recommendations (50 dimensions)
   */
  scoreToOptimizations(seoScore, attrs) {
    const optimizations = Array(50).fill(0);
    
    // Map needed optimizations based on score and attributes
    if (!attrs.title || attrs.titleLength < 30) optimizations[0] = 1;
    if (!attrs.metaDescription || attrs.metaDescriptionLength < 120) optimizations[1] = 1;
    if (attrs.h1Count !== 1) optimizations[2] = 1;
    if (!attrs.canonical) optimizations[3] = 1;
    if (!attrs.isSecure) optimizations[4] = 1;
    if (attrs.wordCount < 300) optimizations[5] = 1;
    if (attrs.imageCount > 0 && !attrs.altTextCoverage) optimizations[6] = 1;
    // ... map remaining optimizations
    
    return optimizations;
  }
  
  /**
   * Get backlink recommendations using the trained neural network
   */
  async getBacklinkRecommendations(url, attributes) {
    if (!this.backlinkNeuralInstance) {
      return null;
    }
    
    try {
      // Extract backlink features from attributes
      const backlinkFeatures = [
        attributes.internalLinksCount || 0,
        attributes.externalLinksCount || 0,
        attributes.nofollowLinksCount || 0,
        // ... extract all 50 features
        ...Array(47).fill(0)
      ];
      
      // Get predictions from backlink neural network
      const predictions = await this.neuralOrchestrator.predict(
        this.backlinkNeuralInstance.id,
        backlinkFeatures
      );
      
      // Convert predictions to actionable recommendations
      const recommendations = this.backlinkService.generateBacklinkRecommendations(
        url,
        attributes,
        predictions
      );
      
      return recommendations;
    } catch (error) {
      console.error('Failed to get backlink recommendations:', error);
      return null;
    }
  }

  /**
   * Neural-guided crawling (stub - would integrate with actual crawler)
   */
  async neuralGuidedCrawl_OLD(url) {
    // This would integrate with RealWebCrawlerSystem
    // For now, return a stub
    return {
      url,
      html: '',
      links: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Basic crawling (stub)
   */
  async basicCrawl(url) {
    // Basic fallback crawling
    return {
      url,
      html: '',
      links: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract attributes from crawl data
   */
  async extractAttributes_OLD(crawlData) {
    // This would use the seo-attribute-extractor service
    // For now, return a stub
    return {
      title: 'Example Title',
      metaDescription: 'Example description',
      wordCount: 500,
      h1Count: 1,
      seoScore: 75
    };
  }

  /**
   * Calculate SEO score from attributes
   */
  calculateSEOScore(attributes) {
    // Simple scoring algorithm
    let score = 0;
    
    if (attributes.title && attributes.title.length >= 30) score += 20;
    if (attributes.metaDescription && attributes.metaDescription.length >= 120) score += 20;
    if (attributes.h1Count === 1) score += 15;
    if (attributes.wordCount >= 300) score += 15;
    if (attributes.isSecure) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Get neural network predictions
   */
  async getNeuralPredictions(neuralInstanceId, attributes) {
    // This would use the trained model to make predictions
    // For now, return a stub
    return {
      optimizationOpportunities: [],
      predictedScore: 0,
      confidence: 0
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(attributes, neuralPredictions) {
    const recommendations = [];

    if (!attributes.title || attributes.title.length < 30) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        message: 'Title is missing or too short',
        action: 'Add a descriptive title between 30-60 characters'
      });
    }

    if (!attributes.metaDescription || attributes.metaDescription.length < 120) {
      recommendations.push({
        type: 'meta-description',
        priority: 'high',
        message: 'Meta description is missing or too short',
        action: 'Add a compelling meta description between 120-160 characters'
      });
    }

    return recommendations;
  }

  /**
   * Stream attributes to data streams
   */
  async streamAttributes(campaign, attributes) {
    for (const streamId of campaign.dataStreams) {
      const stream = this.dataStreamService.getStream(streamId);
      if (!stream) continue;

      // Extract relevant attributes for this stream
      const streamData = {};
      for (const attrName of stream.attributes) {
        if (attributes[attrName] !== undefined) {
          streamData[attrName] = attributes[attrName];
        }
      }

      if (Object.keys(streamData).length > 0) {
        await this.dataStreamService.pushToStream(streamId, streamData);
        campaign.stats.dataStreamed++;
      }
    }
  }

  /**
   * Filter new URLs for crawling
   */
  filterNewUrls(links, depth) {
    // Filter and clean URLs
    const maxDepth = 3; // Configure as needed
    
    if (depth >= maxDepth) {
      return [];
    }

    return links
      .filter(link => link.startsWith('http'))
      .slice(0, 10); // Limit per page
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    console.log('📊 Starting monitoring service...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.updateMonitoring();
      this.emit('monitoringUpdate', this.monitoring);
    }, this.config.monitoringInterval);
  }

  /**
   * Update monitoring metrics
   */
  async updateMonitoring() {
    this.monitoring.campaignsActive = this.campaigns.size;
    this.monitoring.crawlsInProgress = 0;
    this.monitoring.totalAttributesMined = 0;

    for (const campaign of this.campaigns.values()) {
      this.monitoring.totalAttributesMined += campaign.stats.attributesMined;
    }

    // Get neural network metrics
    if (this.neuralOrchestrator) {
      const status = this.neuralOrchestrator.getStatus();
      this.monitoring.neuralNetworkAccuracy = status.metrics.modelAccuracy || 0;
    }

    // Get data stream metrics
    if (this.dataStreamService) {
      const metrics = this.dataStreamService.getMetrics();
      this.monitoring.dataStreamsThroughput = metrics.throughput || 0;
    }

    // Determine system health
    this.monitoring.systemHealth = this.monitoring.campaignsActive > 0 ? 'healthy' : 'idle';
  }

  /**
   * Get service capabilities
   */
  getCapabilities() {
    return {
      neuralNetworks: !!this.neuralOrchestrator,
      dataStreams: !!this.dataStreamService,
      continuousCrawling: this.config.continuousCrawling,
      monitoring: this.config.enableMonitoring,
      apiExposed: this.config.exposeAPI
    };
  }

  /**
   * Get campaign status
   */
  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns() {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get monitoring status
   */
  getMonitoring() {
    return this.monitoring;
  }

  /**
   * Get full service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      backgroundMining: this.backgroundMiningActive,
      config: this.config,
      capabilities: this.getCapabilities(),
      monitoring: this.monitoring,
      backlinkNeuralInstance: this.backlinkNeuralInstance?.id || null,
      campaigns: this.getAllCampaigns().map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        stats: c.stats
      }))
    };
  }
  
  /**
   * Create a list view with configurable templates
   * This allows DeepSeek to generate lists via configuration
   */
  createListView(config) {
    const listView = {
      id: crypto.randomUUID(),
      name: config.name || 'Untitled List',
      type: config.type || 'standard', // standard, grid, table, cards
      
      // Overall list configuration
      overallConfig: {
        title: config.title || config.name,
        description: config.description || '',
        sortBy: config.sortBy || 'created_at',
        sortOrder: config.sortOrder || 'desc',
        pageSize: config.pageSize || 20,
        enableSearch: config.enableSearch !== false,
        enableFilters: config.enableFilters !== false,
        enablePagination: config.enablePagination !== false,
        style: config.style || {}
      },
      
      // Single item view template
      itemTemplate: {
        layout: config.itemLayout || 'horizontal', // horizontal, vertical, compact
        fields: config.itemFields || [
          { name: 'title', label: 'Title', type: 'text', primary: true },
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'status', label: 'Status', type: 'badge' },
          { name: 'created_at', label: 'Created', type: 'date' }
        ],
        actions: config.itemActions || ['view', 'edit', 'delete'],
        style: config.itemStyle || {}
      },
      
      // List container template
      containerTemplate: {
        showHeader: config.showHeader !== false,
        showFooter: config.showFooter !== false,
        headerTemplate: config.headerTemplate || 'default',
        footerTemplate: config.footerTemplate || 'default',
        emptyStateTemplate: config.emptyStateTemplate || {
          icon: 'inbox',
          message: 'No items found',
          action: 'Create new item'
        }
      },
      
      // Data source configuration
      dataSource: {
        type: config.dataSourceType || 'api', // api, static, computed
        endpoint: config.dataSourceEndpoint || null,
        method: config.dataSourceMethod || 'GET',
        transformer: config.dataTransformer || null,
        staticData: config.staticData || []
      },
      
      created_at: new Date().toISOString()
    };
    
    return listView;
  }
  
  /**
   * Create multiple lists in a panel with dividers
   */
  createListPanel(config) {
    const panel = {
      id: crypto.randomUUID(),
      name: config.name || 'Multi-List Panel',
      layout: config.layout || 'vertical', // vertical, horizontal, grid
      
      lists: config.lists?.map(listConfig => this.createListView(listConfig)) || [],
      
      // Panel-level configuration
      panelConfig: {
        showDividers: config.showDividers !== false,
        dividerStyle: config.dividerStyle || 'solid',
        spacing: config.spacing || 'medium',
        columns: config.columns || 1,
        responsive: config.responsive !== false
      },
      
      created_at: new Date().toISOString()
    };
    
    return panel;
  }
  
  /**
   * Query service status for DeepSeek
   * Provides all necessary information for AI to make decisions
   */
  async queryForDeepSeek() {
    const status = this.getStatus();
    const monitoring = this.getMonitoring();
    
    // Get recent training results
    const recentTraining = [];
    for (const campaign of this.campaigns.values()) {
      if (campaign.neuralInstance) {
        recentTraining.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          neuralInstanceId: campaign.neuralInstance.id,
          accuracy: campaign.neuralInstance.metrics?.accuracy || 0,
          lastTrained: campaign.neuralInstance.metrics?.lastTrained || null,
          trainingSamples: campaign.neuralInstance.metrics?.trainingSamples || 0
        });
      }
    }
    
    // Get backlink neural network status
    const backlinkStatus = this.backlinkNeuralInstance ? {
      instanceId: this.backlinkNeuralInstance.id,
      accuracy: this.backlinkNeuralInstance.metrics?.accuracy || 0,
      lastTrained: this.backlinkNeuralInstance.metrics?.lastTrained || null
    } : null;
    
    // Get data stream status
    const dataStreamStatus = this.dataStreamService ? {
      activeStreams: this.dataStreamService.getAllStreams().length,
      messagesProcessed: this.dataStreamService.getMetrics().messagesProcessed
    } : null;
    
    // Get recent crawl statistics
    const crawlStats = {
      totalCrawled: Array.from(this.campaigns.values()).reduce(
        (sum, c) => sum + c.stats.urlsCrawled, 0
      ),
      totalQueued: Array.from(this.campaigns.values()).reduce(
        (sum, c) => sum + c.stats.urlsQueued, 0
      ),
      totalAttributesMined: Array.from(this.campaigns.values()).reduce(
        (sum, c) => sum + c.stats.attributesMined, 0
      )
    };
    
    return {
      timestamp: new Date().toISOString(),
      service: 'IntegratedSEOCampaignService',
      status: status.isRunning ? 'running' : 'stopped',
      backgroundMining: status.backgroundMining,
      
      campaigns: {
        total: this.campaigns.size,
        active: Array.from(this.campaigns.values()).filter(c => c.status === 'active').length,
        list: Array.from(this.campaigns.values()).map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          stats: c.stats
        }))
      },
      
      neuralNetworks: {
        total: recentTraining.length + (backlinkStatus ? 1 : 0),
        seoOptimizers: recentTraining,
        backlinkOptimizer: backlinkStatus
      },
      
      dataStreams: dataStreamStatus,
      
      crawling: crawlStats,
      
      monitoring: monitoring,
      
      capabilities: status.capabilities,
      
      recommendations: this.generateDeepSeekRecommendations(monitoring, crawlStats)
    };
  }
  
  /**
   * Generate recommendations for DeepSeek based on current state
   */
  generateDeepSeekRecommendations(monitoring, crawlStats) {
    const recommendations = [];
    
    if (monitoring.campaignsActive === 0) {
      recommendations.push({
        type: 'campaign',
        priority: 'high',
        action: 'create_campaign',
        message: 'No active campaigns. Consider creating a new SEO campaign.',
        suggestedConfig: {
          name: 'new-seo-campaign',
          startUrls: ['https://example.com']
        }
      });
    }
    
    if (crawlStats.totalQueued > 100) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        action: 'increase_concurrency',
        message: `${crawlStats.totalQueued} URLs queued. Consider increasing crawler concurrency.`,
        suggestedValue: this.config.maxConcurrentCrawls * 2
      });
    }
    
    if (monitoring.neuralNetworkAccuracy < 0.7) {
      recommendations.push({
        type: 'training',
        priority: 'high',
        action: 'retrain_model',
        message: 'Neural network accuracy is below 70%. Model needs more training data.',
        suggestedAction: 'Increase crawl volume to collect more training samples'
      });
    }
    
    if (!this.backgroundMiningActive) {
      recommendations.push({
        type: 'mining',
        priority: 'medium',
        action: 'start_background_mining',
        message: 'Background mining is not active. Start it for continuous attribute collection.'
      });
    }
    
    if (!this.backlinkNeuralInstance) {
      recommendations.push({
        type: 'feature',
        priority: 'low',
        action: 'create_backlink_nn',
        message: 'Backlink neural network not initialized. Create it for backlink optimization.'
      });
    }
    
    return recommendations;
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    console.log('🛑 Shutting down Integrated SEO Campaign Service...');
    
    this.isRunning = false;
    
    // Stop background mining
    this.stopBackgroundMining();

    // Stop intervals
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
    }
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Shutdown sub-services
    if (this.neuralOrchestrator) {
      await this.neuralOrchestrator.shutdown();
    }
    if (this.dataStreamService) {
      await this.dataStreamService.shutdown();
    }
    if (this.realCrawler && this.realCrawler.shutdown) {
      await this.realCrawler.shutdown();
    }

    // Close database
    await this.db.end();

    console.log('✅ Shutdown complete');
  }
}

export default IntegratedSEOCampaignService;
