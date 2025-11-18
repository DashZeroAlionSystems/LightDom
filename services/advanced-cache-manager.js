/**
 * Advanced Cache Manager for Large-Scale Data Mining
 * 
 * Provides comprehensive caching strategies for:
 * - URL-based crawler caching with TTL
 * - Asset/library caching for repeated crawls
 * - Screenshot/OCR result caching
 * - Network activity monitoring
 * - Offline mining capabilities
 * - Training data deduplication
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

export class AdvancedCacheManager {
  constructor(options = {}) {
    this.dbPool = options.dbPool || this.createDatabasePool();
    
    // In-memory LRU caches for hot data
    this.urlCache = new LRUCache({
      max: options.urlCacheSize || 10000,
      ttl: options.urlCacheTTL || 1000 * 60 * 60 * 24, // 24 hours
      updateAgeOnGet: true
    });
    
    this.assetCache = new LRUCache({
      max: options.assetCacheSize || 5000,
      ttl: options.assetCacheTTL || 1000 * 60 * 60 * 24 * 7, // 7 days
      updateAgeOnGet: true
    });
    
    this.screenshotCache = new LRUCache({
      max: options.screenshotCacheSize || 1000,
      ttl: options.screenshotCacheTTL || 1000 * 60 * 60 * 24 * 30, // 30 days
      updateAgeOnGet: true
    });
    
    this.ocrCache = new LRUCache({
      max: options.ocrCacheSize || 500,
      ttl: options.ocrCacheTTL || 1000 * 60 * 60 * 24 * 30, // 30 days
      updateAgeOnGet: true
    });
    
    // Configuration
    this.config = {
      enableOfflineMining: options.enableOfflineMining !== false,
      enableVisualDiffTracking: options.enableVisualDiffTracking !== false,
      enableNetworkMonitoring: options.enableNetworkMonitoring !== false,
      defaultCacheTTL: options.defaultCacheTTL || 1000 * 60 * 60 * 24, // 24 hours
      staleWhileRevalidate: options.staleWhileRevalidate !== false,
      compressionEnabled: options.compressionEnabled !== false
    };
  }

  createDatabasePool() {
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize() {
    console.log('🚀 Initializing Advanced Cache Manager...');
    await this.createCacheTables();
    console.log('✅ Cache Manager initialized');
  }

  async createCacheTables() {
    const client = await this.dbPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // URL cache table with crawl metadata
      await client.query(`
        CREATE TABLE IF NOT EXISTS url_cache (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL UNIQUE,
          url_hash TEXT NOT NULL UNIQUE,
          status_code INTEGER,
          content_type TEXT,
          content_hash TEXT,
          dom_snapshot JSONB,
          metadata JSONB,
          last_crawled TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          cache_expires_at TIMESTAMP,
          crawl_count INTEGER DEFAULT 1,
          is_stale BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_url_cache_url_hash ON url_cache(url_hash);
        CREATE INDEX IF NOT EXISTS idx_url_cache_expires ON url_cache(cache_expires_at);
        CREATE INDEX IF NOT EXISTS idx_url_cache_stale ON url_cache(is_stale);
      `);
      
      // Asset cache for libraries, scripts, styles
      await client.query(`
        CREATE TABLE IF NOT EXISTS asset_cache (
          id SERIAL PRIMARY KEY,
          asset_url TEXT NOT NULL UNIQUE,
          asset_hash TEXT NOT NULL,
          asset_type TEXT NOT NULL,
          content TEXT,
          content_size INTEGER,
          metadata JSONB,
          last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          access_count INTEGER DEFAULT 1,
          cache_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_asset_cache_hash ON asset_cache(asset_hash);
        CREATE INDEX IF NOT EXISTS idx_asset_cache_type ON asset_cache(asset_type);
      `);
      
      // Screenshot cache for visual comparison
      await client.query(`
        CREATE TABLE IF NOT EXISTS screenshot_cache (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          url_hash TEXT NOT NULL,
          screenshot_hash TEXT NOT NULL,
          screenshot_path TEXT,
          screenshot_data BYTEA,
          viewport_width INTEGER,
          viewport_height INTEGER,
          device_type TEXT,
          captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_screenshot_url_hash ON screenshot_cache(url_hash);
        CREATE INDEX IF NOT EXISTS idx_screenshot_hash ON screenshot_cache(screenshot_hash);
      `);
      
      // OCR results cache
      await client.query(`
        CREATE TABLE IF NOT EXISTS ocr_cache (
          id SERIAL PRIMARY KEY,
          screenshot_hash TEXT NOT NULL UNIQUE,
          extracted_text TEXT,
          confidence_score FLOAT,
          keywords JSONB,
          entities JSONB,
          compression_ratio FLOAT,
          ocr_engine TEXT,
          processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_ocr_screenshot ON ocr_cache(screenshot_hash);
        CREATE INDEX IF NOT EXISTS idx_ocr_keywords ON ocr_cache USING GIN(keywords);
      `);
      
      // Network activity monitoring
      await client.query(`
        CREATE TABLE IF NOT EXISTS network_activity_log (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          request_url TEXT,
          request_method TEXT,
          response_status INTEGER,
          resource_type TEXT,
          from_cache BOOLEAN DEFAULT FALSE,
          from_service_worker BOOLEAN DEFAULT FALSE,
          content_length INTEGER,
          timing_info JSONB,
          captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_network_url ON network_activity_log(url);
        CREATE INDEX IF NOT EXISTS idx_network_cache ON network_activity_log(from_cache);
      `);
      
      // Offline mining sessions
      await client.query(`
        CREATE TABLE IF NOT EXISTS offline_mining_sessions (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL,
          session_id TEXT NOT NULL UNIQUE,
          service_worker_detected BOOLEAN DEFAULT FALSE,
          cached_resources JSONB,
          mined_data JSONB,
          offline_duration INTEGER,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          status TEXT DEFAULT 'pending',
          metadata JSONB
        )
      `);
      
      // Training data deduplication
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_data_cache (
          id SERIAL PRIMARY KEY,
          data_hash TEXT NOT NULL UNIQUE,
          data_type TEXT NOT NULL,
          source_url TEXT,
          features JSONB,
          labels JSONB,
          quality_score FLOAT,
          used_in_training BOOLEAN DEFAULT FALSE,
          training_session_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB
        )
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_training_hash ON training_data_cache(data_hash);
        CREATE INDEX IF NOT EXISTS idx_training_type ON training_data_cache(data_type);
        CREATE INDEX IF NOT EXISTS idx_training_used ON training_data_cache(used_in_training);
      `);
      
      await client.query('COMMIT');
      console.log('✅ Cache tables created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error creating cache tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if URL is cached and still valid
   */
  async isCached(url, options = {}) {
    const urlHash = this.hashUrl(url);
    
    // Check in-memory cache first
    const memoryCache = this.urlCache.get(urlHash);
    if (memoryCache && !this.isExpired(memoryCache)) {
      return { cached: true, data: memoryCache, source: 'memory' };
    }
    
    // Check database
    const result = await this.dbPool.query(
      'SELECT * FROM url_cache WHERE url_hash = $1',
      [urlHash]
    );
    
    if (result.rows.length === 0) {
      return { cached: false };
    }
    
    const cacheEntry = result.rows[0];
    
    // Check if expired
    if (this.isExpired(cacheEntry)) {
      if (this.config.staleWhileRevalidate) {
        // Mark as stale but return data
        await this.markStale(urlHash);
        return { cached: true, data: cacheEntry, source: 'database', stale: true };
      }
      return { cached: false, expired: true };
    }
    
    // Update in-memory cache
    this.urlCache.set(urlHash, cacheEntry);
    
    return { cached: true, data: cacheEntry, source: 'database' };
  }

  /**
   * Cache crawled URL data
   */
  async cacheUrl(url, data, options = {}) {
    const urlHash = this.hashUrl(url);
    const contentHash = this.hashContent(data.content || '');
    const ttl = options.ttl || this.config.defaultCacheTTL;
    const expiresAt = new Date(Date.now() + ttl);
    
    const cacheEntry = {
      url,
      url_hash: urlHash,
      status_code: data.statusCode,
      content_type: data.contentType,
      content_hash: contentHash,
      dom_snapshot: data.domSnapshot || null,
      metadata: data.metadata || {},
      cache_expires_at: expiresAt,
      updated_at: new Date()
    };
    
    // Update in-memory cache
    this.urlCache.set(urlHash, cacheEntry);
    
    // Update database
    await this.dbPool.query(`
      INSERT INTO url_cache (
        url, url_hash, status_code, content_type, content_hash,
        dom_snapshot, metadata, cache_expires_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (url_hash) DO UPDATE SET
        status_code = EXCLUDED.status_code,
        content_type = EXCLUDED.content_type,
        content_hash = EXCLUDED.content_hash,
        dom_snapshot = EXCLUDED.dom_snapshot,
        metadata = EXCLUDED.metadata,
        last_crawled = CURRENT_TIMESTAMP,
        cache_expires_at = EXCLUDED.cache_expires_at,
        crawl_count = url_cache.crawl_count + 1,
        is_stale = FALSE,
        updated_at = EXCLUDED.updated_at
    `, [
      url, urlHash, data.statusCode, data.contentType, contentHash,
      JSON.stringify(cacheEntry.dom_snapshot), JSON.stringify(cacheEntry.metadata),
      expiresAt, new Date()
    ]);
    
    return { urlHash, contentHash, expiresAt };
  }

  /**
   * Cache asset (script, style, library)
   */
  async cacheAsset(assetUrl, content, options = {}) {
    const assetHash = this.hashContent(content);
    const assetType = options.type || this.detectAssetType(assetUrl);
    const ttl = options.ttl || this.config.defaultCacheTTL * 7; // Assets cache longer
    const expiresAt = new Date(Date.now() + ttl);
    
    // Check in-memory cache
    this.assetCache.set(assetHash, { assetUrl, content, assetType });
    
    // Store in database
    await this.dbPool.query(`
      INSERT INTO asset_cache (
        asset_url, asset_hash, asset_type, content, content_size,
        metadata, cache_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (asset_url) DO UPDATE SET
        asset_hash = EXCLUDED.asset_hash,
        content = EXCLUDED.content,
        content_size = EXCLUDED.content_size,
        last_accessed = CURRENT_TIMESTAMP,
        access_count = asset_cache.access_count + 1
    `, [
      assetUrl, assetHash, assetType, content, content.length,
      JSON.stringify(options.metadata || {}), expiresAt
    ]);
    
    return { assetHash, assetType };
  }

  /**
   * Cache screenshot for visual comparison
   */
  async cacheScreenshot(url, screenshotData, options = {}) {
    const urlHash = this.hashUrl(url);
    const screenshotHash = this.hashContent(screenshotData);
    
    // Check for existing screenshots
    const existing = await this.dbPool.query(
      'SELECT screenshot_hash FROM screenshot_cache WHERE url_hash = $1 ORDER BY captured_at DESC LIMIT 1',
      [urlHash]
    );
    
    const hasChanged = existing.rows.length === 0 || 
                       existing.rows[0].screenshot_hash !== screenshotHash;
    
    // Store screenshot
    await this.dbPool.query(`
      INSERT INTO screenshot_cache (
        url, url_hash, screenshot_hash, screenshot_data,
        viewport_width, viewport_height, device_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      url, urlHash, screenshotHash, screenshotData,
      options.viewportWidth || 1920, options.viewportHeight || 1080,
      options.deviceType || 'desktop', JSON.stringify(options.metadata || {})
    ]);
    
    // Update in-memory cache
    this.screenshotCache.set(screenshotHash, { url, screenshotData, hasChanged });
    
    return { screenshotHash, hasChanged };
  }

  /**
   * Cache OCR results
   */
  async cacheOCR(screenshotHash, ocrResult) {
    const cacheEntry = {
      screenshot_hash: screenshotHash,
      extracted_text: ocrResult.text,
      confidence_score: ocrResult.confidence,
      keywords: JSON.stringify(ocrResult.keywords || []),
      entities: JSON.stringify(ocrResult.entities || []),
      compression_ratio: ocrResult.compressionRatio,
      ocr_engine: ocrResult.engine || 'deepseek-ocr',
      metadata: JSON.stringify(ocrResult.metadata || {})
    };
    
    // Update in-memory cache
    this.ocrCache.set(screenshotHash, ocrResult);
    
    // Store in database
    await this.dbPool.query(`
      INSERT INTO ocr_cache (
        screenshot_hash, extracted_text, confidence_score, keywords,
        entities, compression_ratio, ocr_engine, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (screenshot_hash) DO UPDATE SET
        extracted_text = EXCLUDED.extracted_text,
        confidence_score = EXCLUDED.confidence_score,
        keywords = EXCLUDED.keywords,
        entities = EXCLUDED.entities,
        compression_ratio = EXCLUDED.compression_ratio,
        processed_at = CURRENT_TIMESTAMP
    `, [
      cacheEntry.screenshot_hash, cacheEntry.extracted_text,
      cacheEntry.confidence_score, cacheEntry.keywords,
      cacheEntry.entities, cacheEntry.compression_ratio,
      cacheEntry.ocr_engine, cacheEntry.metadata
    ]);
    
    return { cached: true };
  }

  /**
   * Get cached OCR result
   */
  async getCachedOCR(screenshotHash) {
    // Check in-memory cache
    const memoryCache = this.ocrCache.get(screenshotHash);
    if (memoryCache) {
      return { found: true, data: memoryCache, source: 'memory' };
    }
    
    // Check database
    const result = await this.dbPool.query(
      'SELECT * FROM ocr_cache WHERE screenshot_hash = $1',
      [screenshotHash]
    );
    
    if (result.rows.length === 0) {
      return { found: false };
    }
    
    const ocrData = result.rows[0];
    
    // Update in-memory cache
    this.ocrCache.set(screenshotHash, ocrData);
    
    return { found: true, data: ocrData, source: 'database' };
  }

  /**
   * Log network activity for monitoring
   */
  async logNetworkActivity(url, networkRequest) {
    if (!this.config.enableNetworkMonitoring) {
      return;
    }
    
    await this.dbPool.query(`
      INSERT INTO network_activity_log (
        url, request_url, request_method, response_status, resource_type,
        from_cache, from_service_worker, content_length, timing_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      url,
      networkRequest.url,
      networkRequest.method || 'GET',
      networkRequest.status,
      networkRequest.resourceType,
      networkRequest.fromCache || false,
      networkRequest.fromServiceWorker || false,
      networkRequest.contentLength || 0,
      JSON.stringify(networkRequest.timing || {})
    ]);
  }

  /**
   * Start offline mining session
   */
  async startOfflineMiningSession(url, options = {}) {
    if (!this.config.enableOfflineMining) {
      throw new Error('Offline mining is disabled');
    }
    
    const sessionId = crypto.randomUUID();
    
    await this.dbPool.query(`
      INSERT INTO offline_mining_sessions (
        url, session_id, service_worker_detected, metadata
      ) VALUES ($1, $2, $3, $4)
    `, [
      url,
      sessionId,
      options.serviceWorkerDetected || false,
      JSON.stringify(options.metadata || {})
    ]);
    
    return { sessionId };
  }

  /**
   * Complete offline mining session with results
   */
  async completeOfflineMiningSession(sessionId, minedData, cachedResources) {
    await this.dbPool.query(`
      UPDATE offline_mining_sessions SET
        cached_resources = $1,
        mined_data = $2,
        completed_at = CURRENT_TIMESTAMP,
        status = 'completed'
      WHERE session_id = $3
    `, [
      JSON.stringify(cachedResources),
      JSON.stringify(minedData),
      sessionId
    ]);
  }

  /**
   * Add training data with deduplication
   */
  async addTrainingData(data, options = {}) {
    const dataHash = this.hashContent(JSON.stringify(data.features));
    
    // Check if already exists
    const existing = await this.dbPool.query(
      'SELECT id FROM training_data_cache WHERE data_hash = $1',
      [dataHash]
    );
    
    if (existing.rows.length > 0) {
      return { duplicate: true, dataHash };
    }
    
    await this.dbPool.query(`
      INSERT INTO training_data_cache (
        data_hash, data_type, source_url, features, labels, quality_score, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dataHash,
      options.dataType || 'crawl',
      data.sourceUrl,
      JSON.stringify(data.features),
      JSON.stringify(data.labels || {}),
      data.qualityScore || 1.0,
      JSON.stringify(options.metadata || {})
    ]);
    
    return { duplicate: false, dataHash };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const stats = {};
    
    // URL cache stats
    const urlStats = await this.dbPool.query(`
      SELECT 
        COUNT(*) as total_urls,
        COUNT(*) FILTER (WHERE is_stale = TRUE) as stale_urls,
        COUNT(*) FILTER (WHERE cache_expires_at < CURRENT_TIMESTAMP) as expired_urls,
        SUM(crawl_count) as total_crawls
      FROM url_cache
    `);
    stats.urls = urlStats.rows[0];
    
    // Asset cache stats
    const assetStats = await this.dbPool.query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(content_size) as total_size,
        SUM(access_count) as total_accesses
      FROM asset_cache
    `);
    stats.assets = assetStats.rows[0];
    
    // Screenshot cache stats
    const screenshotStats = await this.dbPool.query(`
      SELECT COUNT(*) as total_screenshots FROM screenshot_cache
    `);
    stats.screenshots = screenshotStats.rows[0];
    
    // OCR cache stats
    const ocrStats = await this.dbPool.query(`
      SELECT 
        COUNT(*) as total_ocr_results,
        AVG(confidence_score) as avg_confidence
      FROM ocr_cache
    `);
    stats.ocr = ocrStats.rows[0];
    
    // Training data stats
    const trainingStats = await this.dbPool.query(`
      SELECT 
        COUNT(*) as total_training_data,
        COUNT(*) FILTER (WHERE used_in_training = TRUE) as used_in_training
      FROM training_data_cache
    `);
    stats.trainingData = trainingStats.rows[0];
    
    // Memory cache stats
    stats.memory = {
      urlCacheSize: this.urlCache.size,
      assetCacheSize: this.assetCache.size,
      screenshotCacheSize: this.screenshotCache.size,
      ocrCacheSize: this.ocrCache.size
    };
    
    return stats;
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupExpiredCache() {
    console.log('🧹 Cleaning up expired cache entries...');
    
    const result = await this.dbPool.query(`
      DELETE FROM url_cache 
      WHERE cache_expires_at < CURRENT_TIMESTAMP 
      AND is_stale = FALSE
      RETURNING url
    `);
    
    console.log(`✅ Cleaned up ${result.rowCount} expired URL cache entries`);
    return result.rowCount;
  }

  // Helper methods
  hashUrl(url) {
    return crypto.createHash('sha256').update(url).digest('hex');
  }

  hashContent(content) {
    return crypto.createHash('sha256').update(content.toString()).digest('hex');
  }

  isExpired(cacheEntry) {
    if (!cacheEntry.cache_expires_at) return false;
    return new Date(cacheEntry.cache_expires_at) < new Date();
  }

  async markStale(urlHash) {
    await this.dbPool.query(
      'UPDATE url_cache SET is_stale = TRUE WHERE url_hash = $1',
      [urlHash]
    );
  }

  detectAssetType(url) {
    if (url.endsWith('.js') || url.includes('.js?')) return 'javascript';
    if (url.endsWith('.css') || url.includes('.css?')) return 'stylesheet';
    if (url.endsWith('.json')) return 'json';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  async close() {
    await this.dbPool.end();
  }
}

export default AdvancedCacheManager;
