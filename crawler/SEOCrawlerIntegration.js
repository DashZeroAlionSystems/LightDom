/**
 * SEO Crawler Integration
 * Connects the Real Web Crawler System with SEO Database
 * Saves crawl data to seo_analytics and seo_training_data tables
 */

import { Pool } from 'pg';

export class SEOCrawlerIntegration {
  constructor(config = {}) {
    this.config = config;

    // Initialize PostgreSQL connection pool
    this.pool = new Pool({
      host: process.env.DB_HOST || config.dbHost || 'localhost',
      port: Number(process.env.DB_PORT || config.dbPort || 5432),
      database: process.env.DB_NAME || config.dbName || 'dom_space_harvester',
      user: process.env.DB_USER || config.dbUser || 'postgres',
      password: process.env.DB_PASSWORD || config.dbPassword || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.attributeConfigs = new Map();
    this.targetAttributeCount = 192; // expected campaign attribute coverage

    // Fire-and-forget connect + load attribute configs
    this.testConnection();
  }

  // Utility helpers
  capitalizeFirst(s) {
    if (!s || typeof s !== 'string') return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  safeNum(v, fallback = 0) {
    if (v === null || v === undefined) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  safeBool(v) {
    if (v === null || v === undefined) return false;
    return Boolean(v);
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ SEO Crawler Database Connection Established');
      // Load attribute configuration from DB if present
      try {
        await this.loadAttributeConfigs();
      } catch (err) {
        console.warn(
          '⚠️ Failed to load SEO attribute configs:',
          err && err.message ? err.message : err
        );
      }
    } catch (error) {
      console.error('❌ SEO Crawler Database Connection Failed:', error.message);
    }
  }

  // Load attribute configurations (seo_attributes_config) into memory
  async loadAttributeConfigs() {
    try {
      const res = await this.pool.query(
        'SELECT * FROM seo_attributes_config WHERE is_active = true ORDER BY priority DESC'
      );
      this.attributeConfigs.clear();
      for (const row of res.rows) {
        this.attributeConfigs.set(row.attribute_name, row);
      }
      console.log(`🔎 Loaded ${res.rowCount} SEO attribute configs`);
      return res.rowCount;
    } catch (err) {
      console.warn('Failed to load seo_attributes_config', err && err.message ? err.message : err);
      return 0;
    }
  }

  getAttributeConfig(name) {
    return this.attributeConfigs.get(name) || null;
  }

  /**
   * Calculate SEO score from crawl data
   */
  calculateSEOScore(analysis, schemas, backlinks) {
    let score = 0;

    // Performance metrics (30 points)
    if (analysis && analysis.performance) {
      const perf = analysis.performance;
      const lcp = this.safeNum(perf.lcp, Number.POSITIVE_INFINITY);
      const fid = this.safeNum(perf.fid, Number.POSITIVE_INFINITY);
      const cls = this.safeNum(perf.cls, Number.POSITIVE_INFINITY);

      if (lcp < 2500) score += 10;
      else if (lcp < 4000) score += 5;

      if (fid < 100) score += 10;
      else if (fid < 300) score += 5;

      if (cls < 0.1) score += 10;
      else if (cls < 0.25) score += 5;
    }

    // Content quality (25 points)
    if (analysis && analysis.domStats && this.safeNum(analysis.domStats.totalElements, 0) > 0) {
      const domStats = analysis.domStats;
      const total = this.safeNum(domStats.totalElements, 0);
      const unused = this.safeNum(domStats.unusedElements, 0);
      const contentRatio = total > 0 ? (total - unused) / total : 0;
      score += Math.floor(contentRatio * 25);
    }

    // Schema.org structured data (20 points)
    if (schemas && schemas.length > 0) {
      score += Math.min(schemas.length * 5, 20);
    }

    // Backlinks (15 points)
    if (backlinks && backlinks.length > 0) {
      score += Math.min(backlinks.length * 2, 15);
    }

    // Technical optimization (10 points)
    if (analysis.optimizations && analysis.optimizations.length > 0) {
      score += Math.min(analysis.optimizations.length, 10);
    }

    return Math.min(score, 100);
  }

  /**
   * Extract features for ML training
   * Returns features aligned with DB-configured attribute names (aims for targetAttributeCount features)
   */
  extractFeatures(url, analysis, schemas, backlinks) {
    // If we have attribute configs loaded, use them to generate a consistent
    // features object keyed by attribute_name (ensures 1:1 mapping with DB)
    const features = {};

    if (this.attributeConfigs && this.attributeConfigs.size > 0) {
      for (const [attributeName] of this.attributeConfigs.entries()) {
        try {
          features[attributeName] = this.computeFeatureValue(
            attributeName,
            url,
            analysis,
            schemas,
            backlinks
          );
        } catch (err) {
          features[attributeName] = null;
        }
      }

      // Ensure we reach the expected target attribute count by adding placeholders
      const currentCount = Object.keys(features).length;
      if (currentCount < this.targetAttributeCount) {
        const placeholders = this.generatePlaceholderFeatures(
          this.targetAttributeCount - currentCount
        );
        Object.assign(features, placeholders);
      }

      // Always include some convenient meta fields and helpful numeric shorthands
      features.url_length = features.url_length ?? url.length;
      features.url_has_https = features.url_has_https ?? url.startsWith('https://');
      // Backwards compatibility alias
      features.has_https = features.has_https ?? features.url_has_https;
      // Surface a few common numeric features to make scoring functions robust
      features.lcp = features.lcp ?? analysis?.performance?.lcp ?? analysis?.lcp ?? 0;
      features.cls = features.cls ?? analysis?.performance?.cls ?? analysis?.cls ?? 0;
      features.backlink_count = features.backlink_count ?? backlinks?.length ?? 0;
      features.schema_count = features.schema_count ?? schemas?.length ?? 0;
      return features;
    }

    // Fallback: legacy behavior (no DB attribute configs available)
    const legacy = {
      url_length: url.length,
      url_has_https: url.startsWith('https://'),
      url_has_keywords: this.hasKeywordsInUrl(url),
      url_depth: url.split('/').length - 3,

      lcp: analysis.performance?.lcp || 0,
      fid: analysis.performance?.fid || 0,
      cls: analysis.performance?.cls || 0,
      ttfb: analysis.performance?.ttfb || 0,
      fcp: analysis.performance?.fcp || 0,

      total_elements: analysis.domStats?.totalElements || 0,
      unused_elements: analysis.domStats?.unusedElements || 0,
      dead_css: analysis.domStats?.deadCSS || 0,
      orphaned_js: analysis.domStats?.orphanedJS || 0,
      memory_leaks: analysis.domStats?.memoryLeaks || 0,

      schema_count: schemas?.length || 0,
      has_article_schema: this.hasSchemaType(schemas, 'Article'),
      has_product_schema: this.hasSchemaType(schemas, 'Product'),
      has_organization_schema: this.hasSchemaType(schemas, 'Organization'),
      has_breadcrumb_schema: this.hasSchemaType(schemas, 'BreadcrumbList'),

      backlink_count: backlinks?.length || 0,
      internal_links: this.countInternalLinks(backlinks, url),
      external_links: this.countExternalLinks(backlinks, url),

      space_saved: analysis.spaceSaved || 0,
      optimization_count: analysis.optimizations?.length || 0,

      has_meta_description: false,
      meta_description_length: 0,
      has_title: false,
      title_length: 0,
      has_h1: false,
      h1_count: 0,
      ...this.generatePlaceholderFeatures(this.targetAttributeCount - 20),
    };

    return legacy;
  }

  /**
   * Generate placeholder features to fill out the expected attribute count
   */
  generatePlaceholderFeatures(count = 0) {
    const placeholders = {};
    const start = 0;
    for (let i = start; i < count; i++) {
      placeholders[`placeholder_attr_${i}`] = 0;
    }
    return placeholders;
  }

  // Compute feature value by attribute name using best-effort extraction from
  // available analysis, schemas and backlinks. This ensures attributes map
  // consistently to the DB-configured attribute names.
  computeFeatureValue(attributeName, url, analysis = {}, schemas = [], backlinks = []) {
    const name = (attributeName || '').toLowerCase();

    // Performance metrics
    if (name.includes('lcp') || name.includes('largest_contentful'))
      return analysis.performance?.lcp ?? analysis.lcp ?? 0;
    if (name.includes('fid') || name.includes('first_input'))
      return analysis.performance?.fid ?? analysis.fid ?? 0;
    if (name.includes('cls') || name.includes('cumulative_layout_shift'))
      return analysis.performance?.cls ?? analysis.cls ?? 0;
    if (name.includes('ttfb') || name.includes('time_to_first_byte'))
      return analysis.performance?.ttfb ?? analysis.ttfb ?? 0;
    if (name.includes('fcp') || name.includes('first_contentful_paint'))
      return analysis.performance?.fcp ?? analysis.fcp ?? 0;
    if (name.includes('page_load_time') || name.includes('page_load'))
      return analysis.performance?.pageLoadTime ?? analysis.pageLoadTime ?? 0;

    // URL-derived
    if (name === 'url_length') return url.length;
    if (name === 'url_has_https' || name === 'https_enabled') return url.startsWith('https://');
    if (name === 'url_has_keywords') return this.hasKeywordsInUrl(url);
    if (name === 'url_depth') return url.split('/').length - 3;

    // DOM / content
    if (name === 'total_elements') return analysis.domStats?.totalElements ?? 0;
    if (name === 'unused_elements') return analysis.domStats?.unusedElements ?? 0;
    if (name.includes('dead_css')) return analysis.domStats?.deadCSS ?? 0;
    if (name.includes('orphaned_js')) return analysis.domStats?.orphanedJS ?? 0;

    // Schema / structured data
    if (name === 'schema_count' || name === 'structured_data_types') return schemas?.length ?? 0;
    if (name.includes('schema') && name.includes('present'))
      return (schemas && schemas.length > 0) || false;
    if (name.startsWith('jsonld_')) {
      const type = name.replace('jsonld_', '');
      const cap = this.capitalizeFirst(type);
      return this.hasSchemaType(schemas, cap)
        ? schemas.find(
            s =>
              (s.type || s['@type']) &&
              (s.type || s['@type']).toString().toLowerCase().includes(type)
          )
        : null;
    }

    // Backlinks
    if (name.includes('backlink') || name.includes('link_count')) {
      if (name.includes('internal')) return this.countInternalLinks(backlinks, url);
      if (name.includes('external')) return this.countExternalLinks(backlinks, url);
      return backlinks?.length ?? 0;
    }

    // Meta and textual features
    if (name.includes('meta_description')) return analysis.metaDescription ?? null;
    if (name === 'has_meta_description') return !!analysis.metaDescription;
    if (name === 'meta_description_length') return (analysis.metaDescription || '').length;
    if (name === 'has_title') return !!analysis.pageTitle;
    if (name === 'title_length') return (analysis.pageTitle || '').length;
    if (name === 'has_h1') return !!(analysis.domStats && analysis.domStats.h1Count);
    if (name === 'h1_count') return analysis.domStats?.h1Count ?? 0;

    // Technical
    if (name === 'mobile_friendly' || name === 'responsive_design')
      return analysis.mobileFriendly ?? false;

    // 3D layers and visual design - best-effort mappings
    if (name.includes('layer') || name.includes('composited') || name.includes('paint'))
      return analysis['3dLayers']?.[attributeName] ?? 0;

    // Competitor metrics
    if (name.startsWith('competitor')) return analysis.competitorMetrics?.[attributeName] ?? null;

    // Fallback: if analysis contains a top-level key matching attributeName
    if (analysis && Object.prototype.hasOwnProperty.call(analysis, attributeName))
      return analysis[attributeName];

    // Default fallback
    return null;
  }

  hasSchemaType(schemas, type) {
    if (!schemas) return false;
    return schemas.some(s => s.type === type || s['@type'] === type);
  }

  hasKeywordsInUrl(url) {
    const keywords = ['product', 'article', 'blog', 'service', 'about', 'contact'];
    return keywords.some(k => url.toLowerCase().includes(k));
  }

  countInternalLinks(backlinks, url) {
    if (!backlinks) return 0;
    const domain = new URL(url).hostname;
    return backlinks.filter(link => {
      try {
        return new URL(link.href).hostname === domain;
      } catch {
        return false;
      }
    }).length;
  }

  countExternalLinks(backlinks, url) {
    if (!backlinks) return 0;
    const domain = new URL(url).hostname;
    return backlinks.filter(link => {
      try {
        return new URL(link.href).hostname !== domain;
      } catch {
        return false;
      }
    }).length;
  }

  /**
   * Save crawl result to SEO analytics table
   */
  async saveSEOAnalytics(clientId, crawlResult) {
    const { url, analysis, schemas, backlinks, performance } = crawlResult;

    const seoScore = this.calculateSEOScore(analysis, schemas, backlinks);

    try {
      const query = `
        INSERT INTO seo_analytics (
          client_id, url, page_title, meta_description,
          core_web_vitals, seo_score, performance_score,
          technical_score, content_score, ux_score,
          optimization_applied, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING id
      `;

      const coreWebVitals = {
        lcp: performance?.lcp || 0,
        fid: performance?.fid || 0,
        cls: performance?.cls || 0,
        inp: performance?.inp || 0,
        ttfb: performance?.ttfb || 0,
        fcp: performance?.fcp || 0,
      };

      const values = [
        clientId || null, // Will be null for general crawling, set when client-specific
        url,
        analysis.pageTitle || 'N/A',
        analysis.metaDescription || 'N/A',
        JSON.stringify(coreWebVitals),
        seoScore,
        performance?.score || 0,
        this.calculateTechnicalScore(analysis),
        this.calculateContentScore(analysis, schemas),
        this.calculateUXScore(analysis),
        JSON.stringify(analysis.optimizations || []),
      ];

      const result = await this.pool.query(query, values);
      console.log(`✅ Saved SEO analytics for ${url} - Score: ${seoScore}`);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error saving SEO analytics:', error.message);
      throw error;
    }
  }

  /**
   * Save crawl result as training data
   */
  async saveSEOTrainingData(crawlResult) {
    const { url, analysis, schemas, backlinks } = crawlResult;

    const features = this.extractFeatures(url, analysis, schemas, backlinks);
    const seoScore = this.calculateSEOScore(analysis, schemas, backlinks);

    try {
      const query = `
        INSERT INTO seo_training_data (
          url, features, seo_score_before, seo_score_after,
          optimization_type, optimization_details,
          effectiveness_score, verified, quality_score,
          blockchain_proof_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id
      `;

      const values = [
        url,
        JSON.stringify(features),
        seoScore,
        seoScore, // After score will be updated when re-crawled
        'dom_optimization',
        JSON.stringify({
          spaceSaved: analysis.spaceSaved,
          optimizations: analysis.optimizations,
          schemas: schemas?.length || 0,
          backlinks: backlinks?.length || 0,
        }),
        this.calculateEffectivenessScore(analysis),
        false, // Will be verified later
        this.calculateQualityScore(features),
        crawlResult.merkleRoot || null,
      ];

      const result = await this.pool.query(query, values);
      console.log(`✅ Saved SEO training data for ${url}`);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error saving SEO training data:', error.message);
      throw error;
    }
  }

  calculateTechnicalScore(analysis) {
    let score = 0;
    if (analysis && analysis.domStats && analysis.domStats.totalElements) {
      const unused = this.safeNum(analysis.domStats.unusedElements, 0);
      const total = this.safeNum(analysis.domStats.totalElements, 1);
      const efficiency = 1 - unused / total;
      score += efficiency * 50;
    }
    if (this.safeNum(analysis?.spaceSaved, 0) > 0) {
      score += Math.min((this.safeNum(analysis.spaceSaved, 0) / 10000) * 50, 50);
    }
    return Math.min(score, 100);
  }

  calculateContentScore(analysis, schemas) {
    let score = 50; // Base score
    if (schemas && schemas.length > 0) {
      score += Math.min(schemas.length * 10, 50);
    }
    return Math.min(score, 100);
  }

  calculateUXScore(analysis) {
    let score = 50; // Base score
    if (analysis && analysis.performance) {
      const fid = this.safeNum(analysis.performance.fid, 9999);
      const cls = this.safeNum(analysis.performance.cls, 1);
      if (fid < 100) score += 25;
      if (cls < 0.1) score += 25;
    }
    return Math.min(score, 100);
  }

  calculateEffectivenessScore(analysis) {
    if (!analysis.spaceSaved) return 0;
    return Math.min((analysis.spaceSaved / 1000) * 10, 100);
  }

  calculateQualityScore(features = {}) {
    let score = 0;
    const hasHttps = this.safeBool(
      features.has_https ?? features.url_has_https ?? features.urlHasHttps ?? false
    );
    if (hasHttps) score += 20;

    const schemaCount = this.safeNum(
      features.schema_count ?? features.schemaCount ?? features.schemas_count ?? 0
    );
    if (schemaCount > 0) score += 20;

    const backlinkCount = this.safeNum(
      features.backlink_count ?? features.backlinkCount ?? features.backlinks_count ?? 0
    );
    if (backlinkCount > 5) score += 20;

    const lcp = this.safeNum(features.lcp ?? features.largest_contentful_paint ?? 0);
    if (lcp < 2500) score += 20;

    const cls = this.safeNum(features.cls ?? features.cumulative_layout_shift ?? 1);
    if (cls < 0.1) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Get SEO statistics
   */
  async getStats() {
    try {
      const statsQuery = `
        SELECT
          COUNT(*) as total_records,
          AVG(seo_score) as avg_seo_score,
          MAX(seo_score) as max_seo_score,
          MIN(seo_score) as min_seo_score,
          COUNT(DISTINCT url) as unique_urls
        FROM seo_analytics
      `;

      const trainingQuery = `
        SELECT
          COUNT(*) as total_training_records,
          COUNT(*) FILTER (WHERE verified = true) as verified_records,
          AVG(effectiveness_score) as avg_effectiveness
        FROM seo_training_data
      `;

      const stats = await this.pool.query(statsQuery);
      const training = await this.pool.query(trainingQuery);

      return {
        analytics: stats.rows[0],
        training: training.rows[0],
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      return null;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
    console.log('🛑 SEO Crawler Database Connection Closed');
  }
}

export default SEOCrawlerIntegration;
