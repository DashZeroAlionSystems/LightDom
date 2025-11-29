/**
 * Active Data Mining Service
 * 
 * Orchestrates SEO attribute extraction with neural network optimization
 * Handles active mining workflows and data stream integration
 */

import { EventEmitter } from 'events';
import pg from 'pg';

const { Pool } = pg;

class ActiveDataMiningService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.pool = new Pool({
      host: config.dbHost || process.env.DB_HOST || 'localhost',
      port: parseInt(config.dbPort || process.env.DB_PORT || '5432'),
      database: config.dbName || process.env.DB_NAME || 'lightdom',
      user: config.dbUser || process.env.DB_USER || 'postgres',
      password: config.dbPassword || process.env.DB_PASSWORD || 'postgres',
    });
    
    this.activeMiningJobs = new Map();
    this.neuralNetworkEnabled = config.neuralNetworkEnabled || false;
    this.maxConcurrentJobs = config.maxConcurrentJobs || 10;
    this.miningInterval = config.miningInterval || 60000; // 1 minute default
    
    this.stats = {
      totalJobsRun: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageExtractionTime: 0,
      lastRunTime: null
    };
  }
  
  /**
   * Initialize the mining service
   */
  async initialize() {
    console.log('🚀 Initializing Active Data Mining Service...');
    
    try {
      // Verify database connection
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection established');
      
      // Load active campaigns
      const activeCampaigns = await this.loadActiveCampaigns();
      console.log(`✅ Loaded ${activeCampaigns.length} active campaigns`);
      
      // Start mining scheduler
      this.startMiningScheduler();
      
      this.emit('initialized');
      console.log('✅ Active Data Mining Service initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Active Data Mining Service:', error);
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Load all active campaigns with mining enabled
   */
  async loadActiveCampaigns() {
    const query = `
      SELECT c.*, 
        COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.mine_actively = TRUE) as mining_attributes_count
      FROM seo_campaigns c
      LEFT JOIN campaign_attributes ca ON c.campaign_id = ca.campaign_id
      WHERE c.status = 'active' AND c.active_mining = TRUE
      GROUP BY c.id
      HAVING COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.mine_actively = TRUE) > 0;
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }
  
  /**
   * Start the mining scheduler
   */
  startMiningScheduler() {
    console.log('⏰ Starting mining scheduler...');
    
    this.schedulerInterval = setInterval(async () => {
      try {
        await this.runScheduledMining();
      } catch (error) {
        console.error('Error in mining scheduler:', error);
        this.emit('error', error);
      }
    }, this.miningInterval);
    
    // Run immediately on start
    setTimeout(() => this.runScheduledMining(), 5000);
  }
  
  /**
   * Stop the mining scheduler
   */
  stopMiningScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      console.log('⏸️  Mining scheduler stopped');
    }
  }
  
  /**
   * Run scheduled mining for all active campaigns
   */
  async runScheduledMining() {
    const startTime = Date.now();
    console.log('🔍 Running scheduled mining cycle...');
    
    try {
      const campaigns = await this.loadActiveCampaigns();
      
      if (campaigns.length === 0) {
        console.log('ℹ️  No active campaigns with mining enabled');
        return;
      }
      
      console.log(`📊 Processing ${campaigns.length} campaigns`);
      
      for (const campaign of campaigns) {
        if (this.activeMiningJobs.size >= this.maxConcurrentJobs) {
          console.log(`⚠️  Max concurrent jobs reached (${this.maxConcurrentJobs}), skipping remaining campaigns`);
          break;
        }
        
        await this.startCampaignMining(campaign);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Mining cycle completed in ${duration}ms`);
      this.stats.lastRunTime = new Date();
      
    } catch (error) {
      console.error('Error in scheduled mining:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Start mining for a specific campaign
   */
  async startCampaignMining(campaign) {
    const { campaign_id, name } = campaign;
    
    // Check if already mining
    if (this.activeMiningJobs.has(campaign_id)) {
      console.log(`⏭️  Campaign '${name}' is already being mined, skipping...`);
      return;
    }
    
    console.log(`🎯 Starting mining for campaign: ${name}`);
    
    try {
      // Get pending seed URLs for this campaign
      const seedUrls = await this.getPendingSeedUrls(campaign_id);
      
      if (seedUrls.length === 0) {
        console.log(`ℹ️  No pending URLs for campaign '${name}'`);
        return;
      }
      
      // Get campaign attributes to mine
      const attributes = await this.getCampaignMiningAttributes(campaign_id);
      
      if (attributes.length === 0) {
        console.log(`⚠️  No mining attributes configured for campaign '${name}'`);
        return;
      }
      
      // Create mining job
      const job = {
        campaignId: campaign_id,
        campaignName: name,
        urls: seedUrls,
        attributes,
        startTime: Date.now(),
        status: 'running'
      };
      
      this.activeMiningJobs.set(campaign_id, job);
      this.emit('miningStarted', job);
      
      // Process URLs (simulate for now, will integrate with actual crawler)
      await this.processMiningJob(job);
      
      // Clean up
      this.activeMiningJobs.delete(campaign_id);
      this.emit('miningCompleted', job);
      
      console.log(`✅ Mining completed for campaign: ${name}`);
      
    } catch (error) {
      console.error(`❌ Error mining campaign '${name}':`, error);
      this.activeMiningJobs.delete(campaign_id);
      this.emit('miningFailed', { campaign_id, error });
    }
  }
  
  /**
   * Get pending seed URLs for a campaign
   */
  async getPendingSeedUrls(campaignId) {
    const query = `
      SELECT *
      FROM attribute_seed_urls
      WHERE campaign_id = $1
        AND status IN ('pending', 'completed')
        AND (next_crawl_at IS NULL OR next_crawl_at <= CURRENT_TIMESTAMP)
      ORDER BY priority DESC
      LIMIT 100;
    `;
    
    const result = await this.pool.query(query, [campaignId]);
    return result.rows;
  }
  
  /**
   * Get attributes to mine for a campaign
   */
  async getCampaignMiningAttributes(campaignId) {
    const query = `
      SELECT ca.*, ad.*
      FROM campaign_attributes ca
      JOIN seo_attribute_definitions ad ON ca.attribute_key = ad.attribute_key
      WHERE ca.campaign_id = $1
        AND ca.enabled = TRUE
        AND ca.mine_actively = TRUE
        AND ad.active = TRUE
      ORDER BY ca.mining_priority DESC, ad.ml_weight DESC;
    `;
    
    const result = await this.pool.query(query, [campaignId]);
    return result.rows;
  }
  
  /**
   * Process a mining job
   */
  async processMiningJob(job) {
    const { campaignId, urls, attributes } = job;
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let processedUrls = 0;
      let successfulExtractions = 0;
      let failedExtractions = 0;
      
      for (const seedUrl of urls) {
        // Update seed URL status
        await client.query(
          'UPDATE attribute_seed_urls SET status = $1, last_crawled_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['crawling', seedUrl.id]
        );
        
        // Mine attributes for this URL
        const extractionResults = await this.mineUrlAttributes(
          seedUrl.url,
          attributes,
          campaignId,
          client
        );
        
        successfulExtractions += extractionResults.successful;
        failedExtractions += extractionResults.failed;
        
        // Calculate next crawl time based on frequency
        const nextCrawlAt = this.calculateNextCrawlTime(seedUrl.crawl_frequency);
        
        // Update seed URL with results
        await client.query(`
          UPDATE attribute_seed_urls
          SET 
            status = $1,
            last_success = $2,
            attributes_extracted = attributes_extracted + $3,
            next_crawl_at = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [
          extractionResults.failed === 0 ? 'completed' : 'error',
          extractionResults.failed === 0,
          extractionResults.successful,
          nextCrawlAt,
          seedUrl.id
        ]);
        
        processedUrls++;
        
        // Emit progress
        this.emit('miningProgress', {
          campaignId,
          processedUrls,
          totalUrls: urls.length,
          successfulExtractions,
          failedExtractions
        });
      }
      
      await client.query('COMMIT');
      
      // Update stats
      this.stats.totalJobsRun++;
      this.stats.successfulExtractions += successfulExtractions;
      this.stats.failedExtractions += failedExtractions;
      
      job.status = 'completed';
      job.results = {
        processedUrls,
        successfulExtractions,
        failedExtractions
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing mining job:', error);
      job.status = 'failed';
      job.error = error.message;
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Mine attributes for a specific URL
   */
  async mineUrlAttributes(url, attributes, campaignId, client) {
    const results = {
      successful: 0,
      failed: 0,
      extractions: []
    };
    
    for (const attribute of attributes) {
      const startTime = Date.now();
      
      try {
        // Simulate attribute extraction (will be replaced with actual crawler integration)
        const extractedValue = await this.extractAttribute(url, attribute);
        
        const extractionTime = Date.now() - startTime;
        
        // Validate extracted value
        const validation = await this.validateExtraction(attribute, extractedValue);
        
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(attribute, extractedValue, validation);
        
        // Log extraction
        await this.logExtraction(client, {
          campaignId,
          url,
          attributeKey: attribute.attribute_key,
          success: true,
          extractedValue,
          extractionTime,
          validation,
          qualityScore
        });
        
        // Store in training data if neural network is enabled
        if (this.neuralNetworkEnabled) {
          await this.storeTrainingData(client, {
            campaignId,
            url,
            attributeKey: attribute.attribute_key,
            extractedValue,
            extractionTime,
            qualityScore
          });
        }
        
        results.successful++;
        results.extractions.push({
          attributeKey: attribute.attribute_key,
          success: true,
          value: extractedValue,
          qualityScore
        });
        
      } catch (error) {
        const extractionTime = Date.now() - startTime;
        
        // Log failed extraction
        await this.logExtraction(client, {
          campaignId,
          url,
          attributeKey: attribute.attribute_key,
          success: false,
          extractionTime,
          error: error.message
        });
        
        results.failed++;
        results.extractions.push({
          attributeKey: attribute.attribute_key,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  /**
   * Extract an attribute from a URL (simulated - will integrate with crawler)
   */
  async extractAttribute(url, attribute) {
    // This is a placeholder - will be replaced with actual crawler integration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Extracted value for ${attribute.attribute_key} from ${url}`);
      }, Math.random() * 100);
    });
  }
  
  /**
   * Validate extracted value
   */
  async validateExtraction(attribute, value) {
    const validation = {
      passed: true,
      errors: []
    };
    
    const rules = attribute.validation_rules;
    
    if (rules.required && (!value || value === '')) {
      validation.passed = false;
      validation.errors.push('Value is required');
    }
    
    if (attribute.type === 'string' && value) {
      if (rules.minLength && value.length < rules.minLength) {
        validation.passed = false;
        validation.errors.push(`Value too short (min: ${rules.minLength})`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        validation.passed = false;
        validation.errors.push(`Value too long (max: ${rules.maxLength})`);
      }
    }
    
    return validation;
  }
  
  /**
   * Calculate quality score for extraction
   */
  calculateQualityScore(attribute, value, validation) {
    let score = 100;
    
    if (!validation.passed) {
      score -= validation.errors.length * 20;
    }
    
    // Adjust based on attribute importance
    if (attribute.importance === 'critical' && !validation.passed) {
      score -= 30;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Log extraction attempt
   */
  async logExtraction(client, data) {
    const query = `
      INSERT INTO attribute_extraction_logs (
        campaign_id, url, attribute_key, success,
        extracted_value, extraction_time_ms,
        validation_passed, validation_errors, quality_score,
        error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `;
    
    const values = [
      data.campaignId,
      data.url,
      data.attributeKey,
      data.success,
      data.extractedValue || null,
      data.extractionTime,
      data.validation?.passed || false,
      data.validation?.errors || [],
      data.qualityScore || 0,
      data.error || null
    ];
    
    await client.query(query, values);
  }
  
  /**
   * Store training data for neural network
   */
  async storeTrainingData(client, data) {
    const query = `
      INSERT INTO nn_training_data (
        campaign_id, url, attribute_key,
        extraction_result, extraction_success,
        extraction_time_ms, quality_score,
        input_features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    
    const inputFeatures = {
      url: data.url,
      attributeKey: data.attributeKey,
      timestamp: Date.now()
    };
    
    const values = [
      data.campaignId,
      data.url,
      data.attributeKey,
      JSON.stringify({ value: data.extractedValue }),
      true,
      data.extractionTime,
      data.qualityScore,
      JSON.stringify(inputFeatures)
    ];
    
    await client.query(query, values);
  }
  
  /**
   * Calculate next crawl time based on frequency
   */
  calculateNextCrawlTime(frequency) {
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  
  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeMiningJobs: this.activeMiningJobs.size,
      campaigns: Array.from(this.activeMiningJobs.values()).map(job => ({
        campaignId: job.campaignId,
        campaignName: job.campaignName,
        status: job.status,
        urlsCount: job.urls.length,
        attributesCount: job.attributes.length
      }))
    };
  }
  
  /**
   * Shutdown the service
   */
  async shutdown() {
    console.log('🛑 Shutting down Active Data Mining Service...');
    
    this.stopMiningScheduler();
    
    // Wait for active jobs to complete (with timeout)
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.activeMiningJobs.size > 0 && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await this.pool.end();
    
    console.log('✅ Active Data Mining Service shut down');
  }
}

export default ActiveDataMiningService;
