// SEO Data Processing Service
// Transforms mined data into structured SEO insights and recommendations

import { Pool } from 'pg';
import { createHash } from 'crypto';
import axios from 'axios';
import { URL } from 'url';

class SEODataProcessor {
  constructor(config = {}) {
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

    this.processingQueue = [];
    this.isProcessing = false;
    this.batchSize = config.batchSize || 100;
    this.processingInterval = config.processingInterval || 30000; // 30 seconds
    
    // SEO analysis configuration
    this.seoConfig = {
      coreWebVitals: {
        lcp: { good: 2500, needsImprovement: 4000 },
        fid: { good: 100, needsImprovement: 300 },
        cls: { good: 0.1, needsImprovement: 0.25 }
      },
      seoFactors: {
        titleLength: { min: 30, max: 60 },
        descriptionLength: { min: 120, max: 160 },
        headingStructure: true,
        imageOptimization: true,
        schemaMarkup: true,
        mobileOptimization: true
      }
    };

    this.startProcessing();
  }

  /**
   * Start the data processing pipeline
   */
  startProcessing() {
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        await this.processBatch();
      }
    }, this.processingInterval);

    console.log('🔄 SEO Data Processor started');
  }

  /**
   * Add optimization data to processing queue
   */
  async queueOptimizationData(optimizationData) {
    try {
      const processedData = await this.extractSEOMetrics(optimizationData);
      this.processingQueue.push(processedData);
      
      console.log(`📊 Queued SEO data for processing: ${optimizationData.url}`);
      return processedData;
    } catch (error) {
      console.error('Failed to queue optimization data:', error);
      throw error;
    }
  }

  /**
   * Extract SEO metrics from optimization data
   */
  async extractSEOMetrics(optimizationData) {
    const { url, domStats, performance, schemas, backlinks } = optimizationData;
    
    try {
      // Parse URL for domain analysis
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Extract core SEO metrics
      const seoMetrics = {
        url,
        domain,
        timestamp: new Date(),
        
        // Performance metrics
        coreWebVitals: await this.analyzeCoreWebVitals(performance),
        
        // Content analysis
        contentMetrics: await this.analyzeContent(domStats, schemas),
        
        // Technical SEO
        technicalSEO: await this.analyzeTechnicalSEO(domStats, performance),
        
        // Backlink analysis
        backlinkMetrics: await this.analyzeBacklinks(backlinks),
        
        // Schema analysis
        schemaMetrics: await this.analyzeSchemas(schemas),
        
        // Overall SEO score
        seoScore: 0, // Will be calculated after all metrics are gathered
        
        // Recommendations
        recommendations: []
      };

      // Calculate overall SEO score
      seoMetrics.seoScore = this.calculateSEOScore(seoMetrics);
      
      // Generate recommendations
      seoMetrics.recommendations = this.generateRecommendations(seoMetrics);

      return seoMetrics;
    } catch (error) {
      console.error('Failed to extract SEO metrics:', error);
      throw error;
    }
  }

  /**
   * Analyze Core Web Vitals
   */
  async analyzeCoreWebVitals(performance) {
    const { lcp, fid, cls } = this.seoConfig.coreWebVitals;
    
    return {
      lcp: {
        value: performance.loadTime || 0,
        score: this.getScore(performance.loadTime, lcp.good, lcp.needsImprovement),
        status: this.getStatus(performance.loadTime, lcp.good, lcp.needsImprovement)
      },
      fid: {
        value: performance.fid || 0,
        score: this.getScore(performance.fid, fid.good, fid.needsImprovement),
        status: this.getStatus(performance.fid, fid.good, fid.needsImprovement)
      },
      cls: {
        value: performance.cls || 0,
        score: this.getScore(performance.cls, cls.good, cls.needsImprovement),
        status: this.getStatus(performance.cls, cls.good, cls.needsImprovement)
      }
    };
  }

  /**
   * Analyze content metrics
   */
  async analyzeContent(domStats, schemas) {
    return {
      title: {
        length: domStats.titleLength || 0,
        score: this.getTitleScore(domStats.titleLength),
        status: this.getTitleStatus(domStats.titleLength)
      },
      description: {
        length: domStats.descriptionLength || 0,
        score: this.getDescriptionScore(domStats.descriptionLength),
        status: this.getDescriptionStatus(domStats.descriptionLength)
      },
      headings: {
        h1Count: domStats.h1Count || 0,
        h2Count: domStats.h2Count || 0,
        h3Count: domStats.h3Count || 0,
        score: this.getHeadingScore(domStats),
        status: this.getHeadingStatus(domStats)
      },
      images: {
        total: domStats.imageCount || 0,
        withAlt: domStats.imagesWithAlt || 0,
        optimized: domStats.optimizedImages || 0,
        score: this.getImageScore(domStats),
        status: this.getImageStatus(domStats)
      },
      schemaMarkup: {
        count: schemas ? schemas.length : 0,
        types: schemas ? schemas.map(s => s.type) : [],
        score: this.getSchemaScore(schemas),
        status: this.getSchemaStatus(schemas)
      }
    };
  }

  /**
   * Analyze technical SEO factors
   */
  async analyzeTechnicalSEO(domStats, performance) {
    return {
      pageSpeed: {
        loadTime: performance.loadTime || 0,
        score: this.getPageSpeedScore(performance.loadTime),
        status: this.getPageSpeedStatus(performance.loadTime)
      },
      mobileOptimization: {
        responsive: domStats.isResponsive || false,
        viewport: domStats.hasViewport || false,
        score: this.getMobileScore(domStats),
        status: this.getMobileStatus(domStats)
      },
      domOptimization: {
        totalElements: domStats.totalElements || 0,
        unusedElements: domStats.unusedElements || 0,
        deadCSS: domStats.deadCSS || 0,
        orphanedJS: domStats.orphanedJS || 0,
        score: this.getDOMScore(domStats),
        status: this.getDOMStatus(domStats)
      },
      security: {
        https: domStats.isHTTPS || false,
        score: this.getSecurityScore(domStats),
        status: this.getSecurityStatus(domStats)
      }
    };
  }

  /**
   * Analyze backlink metrics
   */
  async analyzeBacklinks(backlinks) {
    if (!backlinks || backlinks.length === 0) {
      return {
        total: 0,
        internal: 0,
        external: 0,
        score: 0,
        status: 'poor'
      };
    }

    const internal = backlinks.filter(b => !b.isExternal).length;
    const external = backlinks.filter(b => b.isExternal).length;
    
    return {
      total: backlinks.length,
      internal,
      external,
      score: this.getBacklinkScore(backlinks.length, external),
      status: this.getBacklinkStatus(backlinks.length, external)
    };
  }

  /**
   * Analyze schema markup
   */
  async analyzeSchemas(schemas) {
    if (!schemas || schemas.length === 0) {
      return {
        count: 0,
        types: [],
        score: 0,
        status: 'poor'
      };
    }

    const types = schemas.map(s => s.type || s.itemType).filter(Boolean);
    const uniqueTypes = [...new Set(types)];

    return {
      count: schemas.length,
      types: uniqueTypes,
      score: this.getSchemaScore(schemas),
      status: this.getSchemaStatus(schemas)
    };
  }

  /**
   * Calculate overall SEO score
   */
  calculateSEOScore(seoMetrics) {
    const weights = {
      coreWebVitals: 0.25,
      content: 0.25,
      technical: 0.25,
      backlinks: 0.15,
      schema: 0.10
    };

    let totalScore = 0;
    
    // Core Web Vitals (25%)
    const cwvScore = (
      seoMetrics.coreWebVitals.lcp.score +
      seoMetrics.coreWebVitals.fid.score +
      seoMetrics.coreWebVitals.cls.score
    ) / 3;
    totalScore += cwvScore * weights.coreWebVitals;

    // Content (25%)
    const contentScore = (
      seoMetrics.contentMetrics.title.score +
      seoMetrics.contentMetrics.description.score +
      seoMetrics.contentMetrics.headings.score +
      seoMetrics.contentMetrics.images.score +
      seoMetrics.contentMetrics.schemaMarkup.score
    ) / 5;
    totalScore += contentScore * weights.content;

    // Technical SEO (25%)
    const technicalScore = (
      seoMetrics.technicalSEO.pageSpeed.score +
      seoMetrics.technicalSEO.mobileOptimization.score +
      seoMetrics.technicalSEO.domOptimization.score +
      seoMetrics.technicalSEO.security.score
    ) / 4;
    totalScore += technicalScore * weights.technical;

    // Backlinks (15%)
    totalScore += seoMetrics.backlinkMetrics.score * weights.backlinks;

    // Schema (10%)
    totalScore += seoMetrics.schemaMetrics.score * weights.schema;

    return Math.round(totalScore * 100) / 100;
  }

  /**
   * Generate SEO recommendations
   */
  generateRecommendations(seoMetrics) {
    const recommendations = [];

    // Core Web Vitals recommendations
    if (seoMetrics.coreWebVitals.lcp.status === 'poor') {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Improve Largest Contentful Paint (LCP)',
        description: 'Optimize images, reduce server response time, and eliminate render-blocking resources',
        impact: 'high'
      });
    }

    if (seoMetrics.coreWebVitals.fid.status === 'poor') {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Reduce First Input Delay (FID)',
        description: 'Minimize JavaScript execution time and break up long tasks',
        impact: 'high'
      });
    }

    if (seoMetrics.coreWebVitals.cls.status === 'poor') {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Improve Cumulative Layout Shift (CLS)',
        description: 'Add size attributes to images and avoid inserting content above existing content',
        impact: 'high'
      });
    }

    // Content recommendations
    if (seoMetrics.contentMetrics.title.status === 'poor') {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Optimize Page Title',
        description: `Title length is ${seoMetrics.contentMetrics.title.length} characters. Recommended: 30-60 characters`,
        impact: 'medium'
      });
    }

    if (seoMetrics.contentMetrics.description.status === 'poor') {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Optimize Meta Description',
        description: `Description length is ${seoMetrics.contentMetrics.description.length} characters. Recommended: 120-160 characters`,
        impact: 'medium'
      });
    }

    if (seoMetrics.contentMetrics.headings.status === 'poor') {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Improve Heading Structure',
        description: 'Ensure proper H1-H6 hierarchy and use descriptive headings',
        impact: 'medium'
      });
    }

    if (seoMetrics.contentMetrics.images.status === 'poor') {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        title: 'Optimize Images',
        description: 'Add alt text to images and optimize image file sizes',
        impact: 'medium'
      });
    }

    // Technical recommendations
    if (seoMetrics.technicalSEO.domOptimization.status === 'poor') {
      recommendations.push({
        category: 'technical',
        priority: 'high',
        title: 'Optimize DOM Structure',
        description: `Remove ${seoMetrics.technicalSEO.domOptimization.unusedElements} unused elements and ${seoMetrics.technicalSEO.domOptimization.deadCSS} dead CSS rules`,
        impact: 'high'
      });
    }

    if (seoMetrics.technicalSEO.mobileOptimization.status === 'poor') {
      recommendations.push({
        category: 'technical',
        priority: 'high',
        title: 'Improve Mobile Optimization',
        description: 'Ensure responsive design and proper viewport configuration',
        impact: 'high'
      });
    }

    if (seoMetrics.technicalSEO.security.status === 'poor') {
      recommendations.push({
        category: 'technical',
        priority: 'high',
        title: 'Enable HTTPS',
        description: 'Implement SSL certificate for secure data transmission',
        impact: 'high'
      });
    }

    // Schema recommendations
    if (seoMetrics.schemaMetrics.status === 'poor') {
      recommendations.push({
        category: 'structured-data',
        priority: 'low',
        title: 'Add Schema Markup',
        description: 'Implement structured data to help search engines understand your content',
        impact: 'medium'
      });
    }

    // Backlink recommendations
    if (seoMetrics.backlinkMetrics.status === 'poor') {
      recommendations.push({
        category: 'link-building',
        priority: 'medium',
        title: 'Build Quality Backlinks',
        description: 'Focus on acquiring high-quality external links from authoritative domains',
        impact: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Process a batch of SEO data
   */
  async processBatch() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.processingQueue.splice(0, this.batchSize);

    try {
      console.log(`🔄 Processing batch of ${batch.length} SEO records`);

      for (const seoData of batch) {
        await this.storeSEOData(seoData);
        await this.updateDomainMetrics(seoData);
        await this.generateInsights(seoData);
      }

      console.log(`✅ Processed ${batch.length} SEO records`);
    } catch (error) {
      console.error('Failed to process SEO batch:', error);
      // Re-queue failed items
      this.processingQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Store SEO data in database
   */
  async storeSEOData(seoData) {
    try {
      const { url, domain, timestamp, coreWebVitals, contentMetrics, technicalSEO, backlinkMetrics, schemaMetrics, seoScore, recommendations } = seoData;

      await this.db.query(`
        INSERT INTO seo_analysis (
          url, domain, analysis_timestamp, core_web_vitals, content_metrics,
          technical_seo, backlink_metrics, schema_metrics, seo_score, recommendations
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (url, analysis_timestamp) DO UPDATE SET
          core_web_vitals = EXCLUDED.core_web_vitals,
          content_metrics = EXCLUDED.content_metrics,
          technical_seo = EXCLUDED.technical_seo,
          backlink_metrics = EXCLUDED.backlink_metrics,
          schema_metrics = EXCLUDED.schema_metrics,
          seo_score = EXCLUDED.seo_score,
          recommendations = EXCLUDED.recommendations
      `, [
        url,
        domain,
        timestamp,
        JSON.stringify(coreWebVitals),
        JSON.stringify(contentMetrics),
        JSON.stringify(technicalSEO),
        JSON.stringify(backlinkMetrics),
        JSON.stringify(schemaMetrics),
        seoScore,
        JSON.stringify(recommendations)
      ]);

      console.log(`💾 Stored SEO analysis for ${url}`);
    } catch (error) {
      console.error('Failed to store SEO data:', error);
      throw error;
    }
  }

  /**
   * Update domain-level metrics
   */
  async updateDomainMetrics(seoData) {
    try {
      const { domain, seoScore, timestamp } = seoData;

      await this.db.query(`
        INSERT INTO domain_seo_metrics (
          domain, last_analysis, avg_seo_score, total_pages_analyzed, 
          performance_trend, content_trend, technical_trend
        ) VALUES ($1, $2, $3, 1, $4, $5, $6)
        ON CONFLICT (domain) DO UPDATE SET
          last_analysis = EXCLUDED.last_analysis,
          avg_seo_score = (domain_seo_metrics.avg_seo_score * domain_seo_metrics.total_pages_analyzed + EXCLUDED.avg_seo_score) / (domain_seo_metrics.total_pages_analyzed + 1),
          total_pages_analyzed = domain_seo_metrics.total_pages_analyzed + 1,
          performance_trend = EXCLUDED.performance_trend,
          content_trend = EXCLUDED.content_trend,
          technical_trend = EXCLUDED.technical_trend
      `, [
        domain,
        timestamp,
        seoScore,
        seoData.coreWebVitals.lcp.score,
        seoData.contentMetrics.title.score,
        seoData.technicalSEO.pageSpeed.score
      ]);

      console.log(`📊 Updated domain metrics for ${domain}`);
    } catch (error) {
      console.error('Failed to update domain metrics:', error);
      throw error;
    }
  }

  /**
   * Generate insights for AI training
   */
  async generateInsights(seoData) {
    try {
      const insights = {
        url: seoData.url,
        domain: seoData.domain,
        timestamp: seoData.timestamp,
        seoScore: seoData.seoScore,
        performanceFactors: {
          lcp: seoData.coreWebVitals.lcp.value,
          fid: seoData.coreWebVitals.fid.value,
          cls: seoData.coreWebVitals.cls.value,
          loadTime: seoData.technicalSEO.pageSpeed.loadTime
        },
        contentFactors: {
          titleLength: seoData.contentMetrics.title.length,
          descriptionLength: seoData.contentMetrics.description.length,
          headingCount: seoData.contentMetrics.headings.h1Count + seoData.contentMetrics.headings.h2Count,
          imageCount: seoData.contentMetrics.images.total,
          schemaCount: seoData.schemaMetrics.count
        },
        technicalFactors: {
          domElements: seoData.technicalSEO.domOptimization.totalElements,
          unusedElements: seoData.technicalSEO.domOptimization.unusedElements,
          deadCSS: seoData.technicalSEO.domOptimization.deadCSS,
          orphanedJS: seoData.technicalSEO.domOptimization.orphanedJS,
          isHTTPS: seoData.technicalSEO.security.https
        },
        backlinkFactors: {
          totalBacklinks: seoData.backlinkMetrics.total,
          externalBacklinks: seoData.backlinkMetrics.external
        },
        recommendations: seoData.recommendations.map(r => ({
          category: r.category,
          priority: r.priority,
          impact: r.impact
        }))
      };

      await this.db.query(`
        INSERT INTO seo_insights (
          url, domain, analysis_timestamp, insights_data
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (url, analysis_timestamp) DO UPDATE SET
          insights_data = EXCLUDED.insights_data
      `, [
        seoData.url,
        seoData.domain,
        seoData.timestamp,
        JSON.stringify(insights)
      ]);

      console.log(`🧠 Generated insights for ${seoData.url}`);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }

  // Helper methods for scoring
  getScore(value, good, needsImprovement) {
    if (value <= good) return 100;
    if (value <= needsImprovement) return 50;
    return 0;
  }

  getStatus(value, good, needsImprovement) {
    if (value <= good) return 'good';
    if (value <= needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  getTitleScore(length) {
    const { min, max } = this.seoConfig.seoFactors.titleLength;
    if (length >= min && length <= max) return 100;
    if (length < min) return Math.max(0, (length / min) * 100);
    return Math.max(0, 100 - ((length - max) / max) * 100);
  }

  getTitleStatus(length) {
    const { min, max } = this.seoConfig.seoFactors.titleLength;
    if (length >= min && length <= max) return 'good';
    return 'poor';
  }

  getDescriptionScore(length) {
    const { min, max } = this.seoConfig.seoFactors.descriptionLength;
    if (length >= min && length <= max) return 100;
    if (length < min) return Math.max(0, (length / min) * 100);
    return Math.max(0, 100 - ((length - max) / max) * 100);
  }

  getDescriptionStatus(length) {
    const { min, max } = this.seoConfig.seoFactors.descriptionLength;
    if (length >= min && length <= max) return 'good';
    return 'poor';
  }

  getHeadingScore(domStats) {
    const h1Count = domStats.h1Count || 0;
    const h2Count = domStats.h2Count || 0;
    
    if (h1Count === 1 && h2Count > 0) return 100;
    if (h1Count === 1) return 80;
    if (h1Count === 0) return 0;
    return 50; // Multiple H1s
  }

  getHeadingStatus(domStats) {
    const h1Count = domStats.h1Count || 0;
    if (h1Count === 1) return 'good';
    if (h1Count === 0) return 'poor';
    return 'needs-improvement';
  }

  getImageScore(domStats) {
    const total = domStats.imageCount || 0;
    const withAlt = domStats.imagesWithAlt || 0;
    
    if (total === 0) return 100;
    return Math.round((withAlt / total) * 100);
  }

  getImageStatus(domStats) {
    const total = domStats.imageCount || 0;
    const withAlt = domStats.imagesWithAlt || 0;
    
    if (total === 0) return 'good';
    const ratio = withAlt / total;
    if (ratio >= 0.9) return 'good';
    if (ratio >= 0.7) return 'needs-improvement';
    return 'poor';
  }

  getSchemaScore(schemas) {
    if (!schemas || schemas.length === 0) return 0;
    if (schemas.length >= 3) return 100;
    if (schemas.length >= 2) return 80;
    return 60;
  }

  getSchemaStatus(schemas) {
    if (!schemas || schemas.length === 0) return 'poor';
    if (schemas.length >= 2) return 'good';
    return 'needs-improvement';
  }

  getPageSpeedScore(loadTime) {
    if (loadTime <= 2000) return 100;
    if (loadTime <= 4000) return 50;
    return 0;
  }

  getPageSpeedStatus(loadTime) {
    if (loadTime <= 2000) return 'good';
    if (loadTime <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getMobileScore(domStats) {
    let score = 0;
    if (domStats.isResponsive) score += 50;
    if (domStats.hasViewport) score += 50;
    return score;
  }

  getMobileStatus(domStats) {
    const score = this.getMobileScore(domStats);
    if (score >= 100) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  getDOMScore(domStats) {
    const total = domStats.totalElements || 0;
    const unused = domStats.unusedElements || 0;
    const deadCSS = domStats.deadCSS || 0;
    const orphanedJS = domStats.orphanedJS || 0;
    
    if (total === 0) return 100;
    
    const optimizationRatio = 1 - ((unused + deadCSS + orphanedJS) / total);
    return Math.max(0, Math.round(optimizationRatio * 100));
  }

  getDOMStatus(domStats) {
    const score = this.getDOMScore(domStats);
    if (score >= 80) return 'good';
    if (score >= 60) return 'needs-improvement';
    return 'poor';
  }

  getSecurityScore(domStats) {
    return domStats.isHTTPS ? 100 : 0;
  }

  getSecurityStatus(domStats) {
    return domStats.isHTTPS ? 'good' : 'poor';
  }

  getBacklinkScore(total, external) {
    if (total === 0) return 0;
    if (external >= 10) return 100;
    if (external >= 5) return 80;
    if (external >= 2) return 60;
    return 30;
  }

  getBacklinkStatus(total, external) {
    if (total === 0) return 'poor';
    if (external >= 5) return 'good';
    if (external >= 2) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get SEO analysis for a specific URL
   */
  async getSEOAnalysis(url) {
    try {
      const result = await this.db.query(`
        SELECT * FROM seo_analysis 
        WHERE url = $1 
        ORDER BY analysis_timestamp DESC 
        LIMIT 1
      `, [url]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get SEO analysis:', error);
      throw error;
    }
  }

  /**
   * Get domain SEO metrics
   */
  async getDomainMetrics(domain) {
    try {
      const result = await this.db.query(`
        SELECT * FROM domain_seo_metrics 
        WHERE domain = $1
      `, [domain]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get domain metrics:', error);
      throw error;
    }
  }

  /**
   * Get SEO insights for AI training
   */
  async getSEOInsights(limit = 1000) {
    try {
      const result = await this.db.query(`
        SELECT insights_data FROM seo_insights 
        ORDER BY analysis_timestamp DESC 
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => row.insights_data);
    } catch (error) {
      console.error('Failed to get SEO insights:', error);
      throw error;
    }
  }

  /**
   * Shutdown the processor
   */
  async shutdown() {
    console.log('🛑 Shutting down SEO Data Processor...');
    
    // Process remaining queue
    while (this.processingQueue.length > 0) {
      await this.processBatch();
    }
    
    await this.db.end();
    console.log('✅ SEO Data Processor shutdown complete');
  }
}

export { SEODataProcessor };