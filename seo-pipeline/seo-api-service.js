// SEO Service API
// Provides comprehensive SEO analysis and recommendations through REST API

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { SEODataProcessor } from './seo-data-processor.js';
import { SEOTrainingModel } from './ai-training-model.js';
import { Pool } from 'pg';
import axios from 'axios';
import { URL } from 'url';

class SEOServiceAPI {
  constructor(config = {}) {
    this.app = express();
    this.port = config.port || process.env.SEO_API_PORT || 3002;
    
    // Database connection
    this.db = new Pool({
      host: config.dbHost || process.env.DB_HOST || 'localhost',
      port: config.dbPort || process.env.DB_PORT || 5432,
      database: config.dbName || process.env.DB_NAME || 'dom_space_harvester',
      user: config.dbUser || process.env.DB_USER || 'postgres',
      password: config.dbPassword || process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize services
    this.seoProcessor = new SEODataProcessor({
      dbHost: config.dbHost,
      dbPort: config.dbPort,
      dbName: config.dbName,
      dbUser: config.dbUser,
      dbPassword: config.dbPassword
    });

    this.aiModel = new SEOTrainingModel({
      dbHost: config.dbHost,
      dbPort: config.dbPort,
      dbName: config.dbName,
      dbUser: config.dbUser,
      dbPassword: config.dbPassword
    });

    // API key management
    this.apiKeys = new Map();
    this.rateLimits = new Map();

    this.setupMiddleware();
    this.setupRoutes();
    this.initializeServices();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Initialize services
   */
  async initializeServices() {
    try {
      // Load pre-trained model if available
      const modelLoaded = await this.aiModel.loadModel();
      if (!modelLoaded) {
        console.log('No pre-trained model found, will train new model when data is available');
      }

      // Schedule continuous learning
      this.aiModel.scheduleContinuousLearning(24); // Every 24 hours

      console.log('✅ SEO Service API initialized');
    } catch (error) {
      console.error('Failed to initialize SEO services:', error);
    }
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // =====================================================
    // AUTHENTICATION MIDDLEWARE
    // =====================================================

    const apiKeyAuth = async (req, res, next) => {
      try {
        const apiKey = req.header('x-api-key') || req.query.apiKey;
        if (!apiKey) {
          return res.status(401).json({ 
            error: 'API key required',
            message: 'Please provide an API key in the x-api-key header or apiKey query parameter'
          });
        }

        // Check API key validity
        const keyData = await this.validateApiKey(apiKey);
        if (!keyData) {
          return res.status(401).json({ 
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
          });
        }

        req.apiKey = keyData;
        next();
      } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      }
    };

    // =====================================================
    // SEO ANALYSIS ENDPOINTS
    // =====================================================

    // Analyze a single URL
    this.app.post('/api/seo/analyze', apiKeyAuth, async (req, res) => {
      try {
        const { url, includeAIRecommendations = true } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL
        try {
          new URL(url);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Check if we have recent analysis
        const existingAnalysis = await this.seoProcessor.getSEOAnalysis(url);
        const isRecent = existingAnalysis && 
          (new Date() - new Date(existingAnalysis.analysis_timestamp)) < 24 * 60 * 60 * 1000; // 24 hours

        let analysis = existingAnalysis;

        if (!isRecent) {
          // Get fresh optimization data from crawler
          const optimizationData = await this.getOptimizationData(url);
          if (!optimizationData) {
            return res.status(404).json({ 
              error: 'No optimization data available',
              message: 'Please ensure the URL has been crawled recently'
            });
          }

          // Process SEO data
          analysis = await this.seoProcessor.queueOptimizationData(optimizationData);
        }

        // Get AI recommendations if requested
        let aiRecommendations = [];
        if (includeAIRecommendations && this.aiModel.model) {
          try {
            const insights = await this.getSEOInsights(url);
            if (insights) {
              aiRecommendations = await this.aiModel.generateAIRecommendations(insights);
            }
          } catch (error) {
            console.warn('Failed to generate AI recommendations:', error.message);
          }
        }

        res.json({
          success: true,
          url,
          analysis: {
            timestamp: analysis.analysis_timestamp,
            seoScore: analysis.seo_score,
            coreWebVitals: analysis.core_web_vitals,
            contentMetrics: analysis.content_metrics,
            technicalSEO: analysis.technical_seo,
            backlinkMetrics: analysis.backlink_metrics,
            schemaMetrics: analysis.schema_metrics,
            recommendations: analysis.recommendations
          },
          aiRecommendations,
          cached: isRecent
        });

      } catch (error) {
        console.error('SEO analysis failed:', error);
        res.status(500).json({ 
          error: 'SEO analysis failed',
          details: error.message 
        });
      }
    });

    // Batch analyze multiple URLs
    this.app.post('/api/seo/analyze-batch', apiKeyAuth, async (req, res) => {
      try {
        const { urls, includeAIRecommendations = true } = req.body;
        
        if (!Array.isArray(urls) || urls.length === 0) {
          return res.status(400).json({ error: 'URLs array is required' });
        }

        if (urls.length > 50) {
          return res.status(400).json({ error: 'Maximum 50 URLs allowed per batch' });
        }

        const results = [];
        const errors = [];

        for (const url of urls) {
          try {
            // Validate URL
            new URL(url);
            
            // Get analysis
            const analysis = await this.seoProcessor.getSEOAnalysis(url);
            if (analysis) {
              results.push({
                url,
                seoScore: analysis.seo_score,
                timestamp: analysis.analysis_timestamp,
                cached: true
              });
            } else {
              errors.push({ url, error: 'No analysis data available' });
            }
          } catch (error) {
            errors.push({ url, error: error.message });
          }
        }

        res.json({
          success: true,
          results,
          errors,
          total: urls.length,
          successful: results.length,
          failed: errors.length
        });

      } catch (error) {
        console.error('Batch SEO analysis failed:', error);
        res.status(500).json({ 
          error: 'Batch SEO analysis failed',
          details: error.message 
        });
      }
    });

    // Get domain SEO overview
    this.app.get('/api/seo/domain/:domain', apiKeyAuth, async (req, res) => {
      try {
        const { domain } = req.params;
        const { includePages = true, limit = 20 } = req.query;

        // Get domain metrics
        const domainMetrics = await this.seoProcessor.getDomainMetrics(domain);
        
        let pages = [];
        if (includePages) {
          const result = await this.db.query(`
            SELECT url, seo_score, analysis_timestamp, core_web_vitals, content_metrics
            FROM seo_analysis 
            WHERE domain = $1 
            ORDER BY seo_score DESC 
            LIMIT $2
          `, [domain, parseInt(limit)]);

          pages = result.rows.map(row => ({
            url: row.url,
            seoScore: row.seo_score,
            timestamp: row.analysis_timestamp,
            coreWebVitals: row.core_web_vitals,
            contentMetrics: row.content_metrics
          }));
        }

        res.json({
          success: true,
          domain,
          metrics: domainMetrics,
          pages,
          totalPages: pages.length
        });

      } catch (error) {
        console.error('Domain SEO overview failed:', error);
        res.status(500).json({ 
          error: 'Failed to get domain overview',
          details: error.message 
        });
      }
    });

    // =====================================================
    // AI RECOMMENDATIONS ENDPOINTS
    // =====================================================

    // Get AI-powered recommendations
    this.app.post('/api/seo/recommendations', apiKeyAuth, async (req, res) => {
      try {
        const { url, category, limit = 10 } = req.body;
        
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }

        // Get SEO insights for the URL
        const insights = await this.getSEOInsights(url);
        if (!insights) {
          return res.status(404).json({ 
            error: 'No SEO data available for URL',
            message: 'Please analyze the URL first'
          });
        }

        // Generate AI recommendations
        const recommendations = await this.aiModel.generateAIRecommendations(insights);
        
        // Filter by category if specified
        const filteredRecommendations = category 
          ? recommendations.filter(r => r.category === category)
          : recommendations;

        res.json({
          success: true,
          url,
          recommendations: filteredRecommendations.slice(0, parseInt(limit)),
          total: filteredRecommendations.length,
          category: category || 'all'
        });

      } catch (error) {
        console.error('AI recommendations failed:', error);
        res.status(500).json({ 
          error: 'Failed to generate AI recommendations',
          details: error.message 
        });
      }
    });

    // Predict SEO score for optimization scenario
    this.app.post('/api/seo/predict', apiKeyAuth, async (req, res) => {
      try {
        const { url, optimizations } = req.body;
        
        if (!url || !optimizations) {
          return res.status(400).json({ error: 'URL and optimizations are required' });
        }

        // Get current SEO insights
        const currentInsights = await this.getSEOInsights(url);
        if (!currentInsights) {
          return res.status(404).json({ 
            error: 'No SEO data available for URL',
            message: 'Please analyze the URL first'
          });
        }

        // Apply optimizations to create scenario
        const optimizedInsights = this.applyOptimizations(currentInsights, optimizations);
        
        // Predict SEO score
        const predictedScore = await this.aiModel.predictSEO(optimizedInsights);
        const currentScore = currentInsights.seoScore;
        const improvement = predictedScore - currentScore;

        res.json({
          success: true,
          url,
          currentScore,
          predictedScore,
          improvement,
          optimizations,
          impact: this.calculateImpact(improvement)
        });

      } catch (error) {
        console.error('SEO prediction failed:', error);
        res.status(500).json({ 
          error: 'Failed to predict SEO score',
          details: error.message 
        });
      }
    });

    // =====================================================
    // COMPETITIVE ANALYSIS ENDPOINTS
    // =====================================================

    // Compare domains
    this.app.post('/api/seo/compare-domains', apiKeyAuth, async (req, res) => {
      try {
        const { domains, limit = 10 } = req.body;
        
        if (!Array.isArray(domains) || domains.length < 2) {
          return res.status(400).json({ error: 'At least 2 domains required for comparison' });
        }

        const comparison = [];
        
        for (const domain of domains) {
          const metrics = await this.seoProcessor.getDomainMetrics(domain);
          const pages = await this.db.query(`
            SELECT url, seo_score, analysis_timestamp
            FROM seo_analysis 
            WHERE domain = $1 
            ORDER BY seo_score DESC 
            LIMIT $2
          `, [domain, parseInt(limit)]);

          comparison.push({
            domain,
            metrics,
            topPages: pages.rows.map(row => ({
              url: row.url,
              seoScore: row.seo_score,
              timestamp: row.analysis_timestamp
            }))
          });
        }

        // Calculate comparison metrics
        const avgScores = comparison.map(c => c.metrics?.avg_seo_score || 0);
        const bestDomain = comparison[avgScores.indexOf(Math.max(...avgScores))];

        res.json({
          success: true,
          comparison,
          bestPerforming: bestDomain,
          averageScores: avgScores,
          totalDomains: domains.length
        });

      } catch (error) {
        console.error('Domain comparison failed:', error);
        res.status(500).json({ 
          error: 'Failed to compare domains',
          details: error.message 
        });
      }
    });

    // =====================================================
    // TREND ANALYSIS ENDPOINTS
    // =====================================================

    // Get SEO trends for a domain
    this.app.get('/api/seo/trends/:domain', apiKeyAuth, async (req, res) => {
      try {
        const { domain } = req.params;
        const { days = 30 } = req.query;

        const result = await this.db.query(`
          SELECT 
            DATE(analysis_timestamp) as date,
            AVG(seo_score) as avg_score,
            COUNT(*) as page_count,
            AVG((core_web_vitals->>'lcp')::numeric) as avg_lcp,
            AVG((core_web_vitals->>'fid')::numeric) as avg_fid,
            AVG((core_web_vitals->>'cls')::numeric) as avg_cls
          FROM seo_analysis 
          WHERE domain = $1 
            AND analysis_timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
          GROUP BY DATE(analysis_timestamp)
          ORDER BY date ASC
        `, [domain]);

        const trends = result.rows.map(row => ({
          date: row.date,
          avgScore: parseFloat(row.avg_score),
          pageCount: parseInt(row.page_count),
          avgLCP: parseFloat(row.avg_lcp),
          avgFID: parseFloat(row.avg_fid),
          avgCLS: parseFloat(row.avg_cls)
        }));

        res.json({
          success: true,
          domain,
          period: `${days} days`,
          trends,
          totalDataPoints: trends.length
        });

      } catch (error) {
        console.error('Trend analysis failed:', error);
        res.status(500).json({ 
          error: 'Failed to get SEO trends',
          details: error.message 
        });
      }
    });

    // =====================================================
    // MODEL MANAGEMENT ENDPOINTS
    // =====================================================

    // Train the AI model
    this.app.post('/api/seo/train-model', apiKeyAuth, async (req, res) => {
      try {
        if (this.aiModel.isTraining) {
          return res.status(409).json({ 
            error: 'Model is already training',
            message: 'Please wait for the current training to complete'
          });
        }

        // Start training in background
        this.aiModel.trainModel().then(() => {
          console.log('Model training completed successfully');
        }).catch(error => {
          console.error('Model training failed:', error);
        });

        res.json({
          success: true,
          message: 'Model training started',
          status: 'training'
        });

      } catch (error) {
        console.error('Model training request failed:', error);
        res.status(500).json({ 
          error: 'Failed to start model training',
          details: error.message 
        });
      }
    });

    // Get model status and metrics
    this.app.get('/api/seo/model-status', apiKeyAuth, async (req, res) => {
      try {
        const metrics = await this.aiModel.getModelMetrics();
        
        res.json({
          success: true,
          model: {
            loaded: !!this.aiModel.model,
            training: this.aiModel.isTraining,
            metrics
          }
        });

      } catch (error) {
        console.error('Failed to get model status:', error);
        res.status(500).json({ 
          error: 'Failed to get model status',
          details: error.message 
        });
      }
    });

    // =====================================================
    // HEALTH AND STATUS ENDPOINTS
    // =====================================================

    // Health check
    this.app.get('/api/seo/health', async (req, res) => {
      try {
        // Check database connection
        await this.db.query('SELECT NOW()');
        
        // Check services
        const services = {
          database: 'healthy',
          seoProcessor: 'healthy',
          aiModel: this.aiModel.model ? 'loaded' : 'not_loaded'
        };

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services,
          uptime: process.uptime()
        });

      } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // API usage statistics
    this.app.get('/api/seo/usage', apiKeyAuth, async (req, res) => {
      try {
        const apiKey = req.apiKey;
        
        res.json({
          success: true,
          usage: {
            apiKey: apiKey.key.substring(0, 8) + '...',
            requestsUsed: apiKey.requests_used,
            requestsLimit: apiKey.requests_limit,
            lastUsed: apiKey.last_used_at
          }
        });

      } catch (error) {
        console.error('Failed to get usage stats:', error);
        res.status(500).json({ 
          error: 'Failed to get usage statistics',
          details: error.message 
        });
      }
    });

    // =====================================================
    // ERROR HANDLING
    // =====================================================

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
        availableEndpoints: [
          'POST /api/seo/analyze',
          'POST /api/seo/analyze-batch',
          'GET /api/seo/domain/:domain',
          'POST /api/seo/recommendations',
          'POST /api/seo/predict',
          'POST /api/seo/compare-domains',
          'GET /api/seo/trends/:domain',
          'POST /api/seo/train-model',
          'GET /api/seo/model-status',
          'GET /api/seo/health',
          'GET /api/seo/usage'
        ]
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey) {
    try {
      const result = await this.db.query(`
        SELECT id, key_hash, owner_email, requests_used, requests_limit, 
               last_used_at, created_at, is_active
        FROM api_keys 
        WHERE key_hash = $1 AND is_active = true
      `, [this.hashApiKey(apiKey)]);

      if (result.rows.length === 0) {
        return null;
      }

      const keyData = result.rows[0];
      
      // Check rate limits
      if (keyData.requests_used >= keyData.requests_limit) {
        return null;
      }

      // Update usage
      await this.db.query(`
        UPDATE api_keys 
        SET requests_used = requests_used + 1, last_used_at = NOW()
        WHERE id = $1
      `, [keyData.id]);

      return {
        id: keyData.id,
        key: apiKey,
        owner: keyData.owner_email,
        requests_used: keyData.requests_used + 1,
        requests_limit: keyData.requests_limit,
        last_used_at: new Date()
      };
    } catch (error) {
      console.error('API key validation error:', error);
      return null;
    }
  }

  /**
   * Hash API key
   */
  hashApiKey(apiKey) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Get optimization data from crawler
   */
  async getOptimizationData(url) {
    try {
      const result = await this.db.query(`
        SELECT url, dom_stats, performance, schemas, backlinks, timestamp
        FROM dom_optimizations 
        WHERE url = $1 
        ORDER BY timestamp DESC 
        LIMIT 1
      `, [url]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get optimization data:', error);
      return null;
    }
  }

  /**
   * Get SEO insights for AI processing
   */
  async getSEOInsights(url) {
    try {
      const result = await this.db.query(`
        SELECT insights_data FROM seo_insights 
        WHERE url = $1 
        ORDER BY analysis_timestamp DESC 
        LIMIT 1
      `, [url]);

      return result.rows[0]?.insights_data || null;
    } catch (error) {
      console.error('Failed to get SEO insights:', error);
      return null;
    }
  }

  /**
   * Apply optimizations to insights data
   */
  applyOptimizations(insights, optimizations) {
    const optimized = { ...insights };

    // Apply performance optimizations
    if (optimizations.performance) {
      const perf = optimized.performanceFactors || {};
      optimized.performanceFactors = {
        ...perf,
        lcp: optimizations.performance.lcp !== undefined ? optimizations.performance.lcp : perf.lcp,
        fid: optimizations.performance.fid !== undefined ? optimizations.performance.fid : perf.fid,
        cls: optimizations.performance.cls !== undefined ? optimizations.performance.cls : perf.cls,
        loadTime: optimizations.performance.loadTime !== undefined ? optimizations.performance.loadTime : perf.loadTime
      };
    }

    // Apply content optimizations
    if (optimizations.content) {
      const content = optimized.contentFactors || {};
      optimized.contentFactors = {
        ...content,
        titleLength: optimizations.content.titleLength !== undefined ? optimizations.content.titleLength : content.titleLength,
        descriptionLength: optimizations.content.descriptionLength !== undefined ? optimizations.content.descriptionLength : content.descriptionLength,
        headingCount: optimizations.content.headingCount !== undefined ? optimizations.content.headingCount : content.headingCount,
        imageCount: optimizations.content.imageCount !== undefined ? optimizations.content.imageCount : content.imageCount,
        schemaCount: optimizations.content.schemaCount !== undefined ? optimizations.content.schemaCount : content.schemaCount
      };
    }

    // Apply technical optimizations
    if (optimizations.technical) {
      const technical = optimized.technicalFactors || {};
      optimized.technicalFactors = {
        ...technical,
        domElements: optimizations.technical.domElements !== undefined ? optimizations.technical.domElements : technical.domElements,
        unusedElements: optimizations.technical.unusedElements !== undefined ? optimizations.technical.unusedElements : technical.unusedElements,
        deadCSS: optimizations.technical.deadCSS !== undefined ? optimizations.technical.deadCSS : technical.deadCSS,
        orphanedJS: optimizations.technical.orphanedJS !== undefined ? optimizations.technical.orphanedJS : technical.orphanedJS,
        isHTTPS: optimizations.technical.isHTTPS !== undefined ? optimizations.technical.isHTTPS : technical.isHTTPS
      };
    }

    // Apply backlink optimizations
    if (optimizations.backlinks) {
      const backlinks = optimized.backlinkFactors || {};
      optimized.backlinkFactors = {
        ...backlinks,
        totalBacklinks: optimizations.backlinks.totalBacklinks !== undefined ? optimizations.backlinks.totalBacklinks : backlinks.totalBacklinks,
        externalBacklinks: optimizations.backlinks.externalBacklinks !== undefined ? optimizations.backlinks.externalBacklinks : backlinks.externalBacklinks
      };
    }

    return optimized;
  }

  /**
   * Calculate impact level
   */
  calculateImpact(improvement) {
    if (improvement >= 20) return 'high';
    if (improvement >= 10) return 'medium';
    if (improvement >= 5) return 'low';
    return 'minimal';
  }

  /**
   * Start the API server
   */
  async start() {
    try {
      // Test database connection
      await this.db.query('SELECT NOW()');
      console.log('✅ Database connected successfully');

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 SEO Service API running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/api/seo/health`);
        console.log(`📚 API Documentation: http://localhost:${this.port}/api/seo/health`);
      });

    } catch (error) {
      console.error('❌ Failed to start SEO Service API:', error);
      process.exit(1);
    }
  }

  /**
   * Shutdown the API server
   */
  async shutdown() {
    console.log('🛑 Shutting down SEO Service API...');
    
    await this.seoProcessor.shutdown();
    await this.aiModel.shutdown();
    await this.db.end();
    
    console.log('✅ SEO Service API shutdown complete');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (global.seoApiServer) {
    await global.seoApiServer.shutdown();
  }
  process.exit(0);
});

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const seoApiServer = new SEOServiceAPI();
  global.seoApiServer = seoApiServer;
  seoApiServer.start();
}

export { SEOServiceAPI };