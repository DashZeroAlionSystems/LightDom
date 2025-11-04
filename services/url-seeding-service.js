/**
 * URL Seeding Service
 * 
 * Independent service for URL discovery, seeding, and backlink generation.
 * Each instance runs independently for a data mining campaign.
 * 
 * Features:
 * - URL seed generation from search algorithms
 * - Related URL discovery from crawled sites
 * - Backlink network mapping
 * - SEO-focused URL prioritization
 * - Integration with crawler system
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { URL } from 'url';
import crypto from 'crypto';

export class URLSeedingService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.instanceId = config.instanceId || this.generateInstanceId();
    this.config = {
      maxSeedsPerInstance: config.maxSeedsPerInstance || 1000,
      seedRefreshInterval: config.seedRefreshInterval || 3600000, // 1 hour
      searchDepth: config.searchDepth || 3,
      minBacklinkQuality: config.minBacklinkQuality || 0.5,
      enableSearchAlgorithms: config.enableSearchAlgorithms !== false,
      enableRelatedURLDiscovery: config.enableRelatedURLDiscovery !== false,
      enableBacklinkGeneration: config.enableBacklinkGeneration !== false,
      ...config
    };

    // Service state
    this.isRunning = false;
    this.isPaused = false;
    this.seeds = new Map(); // url -> seed data
    this.discoveredUrls = new Set();
    this.backlinkNetwork = new Map(); // source -> [targets]
    this.urlMetrics = new Map(); // url -> metrics
    
    // Statistics
    this.stats = {
      totalSeeds: 0,
      activeSeeds: 0,
      discoveredUrls: 0,
      backlinksMapped: 0,
      lastUpdate: null,
      startedAt: null,
      crawledSites: 0,
      successRate: 0
    };

    // Search algorithms
    this.searchAlgorithms = {
      keyword: this.keywordSearch.bind(this),
      similarity: this.similaritySearch.bind(this),
      authority: this.authoritySearch.bind(this),
      topic: this.topicSearch.bind(this),
      competitor: this.competitorSearch.bind(this)
    };

    // Database connection (if available)
    this.db = config.db || null;
    
    // Crawler integration
    this.crawler = config.crawler || null;
    
    console.log(`✅ URL Seeding Service initialized: ${this.instanceId}`);
  }

  /**
   * Generate unique instance ID
   */
  generateInstanceId() {
    return `seeding_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Start the seeding service
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Seeding service is already running');
    }

    console.log(`🚀 Starting URL Seeding Service: ${this.instanceId}`);
    
    this.isRunning = true;
    this.isPaused = false;
    this.stats.startedAt = new Date().toISOString();

    // Load existing seeds from database
    if (this.db) {
      await this.loadSeedsFromDatabase();
    }

    // Start periodic seed refresh
    this.refreshInterval = setInterval(
      () => this.refreshSeeds(),
      this.config.seedRefreshInterval
    );

    // Start monitoring crawled sites
    if (this.crawler) {
      this.startCrawlerMonitoring();
    }

    this.emit('started', { instanceId: this.instanceId });
    console.log(`✅ URL Seeding Service started: ${this.instanceId}`);
    
    return {
      instanceId: this.instanceId,
      status: 'running',
      stats: this.stats
    };
  }

  /**
   * Stop the seeding service
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log(`⏹️  Stopping URL Seeding Service: ${this.instanceId}`);
    
    this.isRunning = false;
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Save state to database
    if (this.db) {
      await this.saveSeedsToDatabase();
    }

    this.emit('stopped', { instanceId: this.instanceId });
    console.log(`✅ URL Seeding Service stopped: ${this.instanceId}`);
  }

  /**
   * Pause the seeding service
   */
  pause() {
    this.isPaused = true;
    this.emit('paused', { instanceId: this.instanceId });
    console.log(`⏸️  URL Seeding Service paused: ${this.instanceId}`);
  }

  /**
   * Resume the seeding service
   */
  resume() {
    this.isPaused = false;
    this.emit('resumed', { instanceId: this.instanceId });
    console.log(`▶️  URL Seeding Service resumed: ${this.instanceId}`);
  }

  /**
   * Add URL seed
   */
  async addSeed(url, metadata = {}) {
    if (this.seeds.size >= this.config.maxSeedsPerInstance) {
      throw new Error('Maximum seeds limit reached');
    }

    const normalizedUrl = this.normalizeUrl(url);
    
    const seed = {
      url: normalizedUrl,
      addedAt: new Date().toISOString(),
      source: metadata.source || 'manual',
      priority: metadata.priority || 5,
      searchAlgorithm: metadata.searchAlgorithm || null,
      attributes: metadata.attributes || [],
      status: 'active',
      crawlCount: 0,
      lastCrawled: null,
      backlinks: [],
      relatedUrls: []
    };

    this.seeds.set(normalizedUrl, seed);
    this.stats.totalSeeds++;
    this.stats.activeSeeds++;

    // Save to database
    if (this.db) {
      await this.saveSeedToDatabase(seed);
    }

    this.emit('seedAdded', seed);
    return seed;
  }

  /**
   * Remove URL seed
   */
  async removeSeed(url) {
    const normalizedUrl = this.normalizeUrl(url);
    
    if (!this.seeds.has(normalizedUrl)) {
      return false;
    }

    const seed = this.seeds.get(normalizedUrl);
    this.seeds.delete(normalizedUrl);
    this.stats.activeSeeds--;

    // Remove from database
    if (this.db) {
      await this.removeSeedFromDatabase(normalizedUrl);
    }

    this.emit('seedRemoved', { url: normalizedUrl });
    return true;
  }

  /**
   * Get seeds matching criteria
   */
  getSeeds(criteria = {}) {
    let seeds = Array.from(this.seeds.values());

    // Filter by status
    if (criteria.status) {
      seeds = seeds.filter(s => s.status === criteria.status);
    }

    // Filter by priority
    if (criteria.minPriority) {
      seeds = seeds.filter(s => s.priority >= criteria.minPriority);
    }

    // Filter by source
    if (criteria.source) {
      seeds = seeds.filter(s => s.source === criteria.source);
    }

    // Sort by priority
    seeds.sort((a, b) => b.priority - a.priority);

    // Limit results
    if (criteria.limit) {
      seeds = seeds.slice(0, criteria.limit);
    }

    return seeds;
  }

  /**
   * Discover related URLs from a crawled site
   * 
   * @param {string} sourceUrl - The source URL that was crawled
   * @param {Object} crawlData - Crawl data containing links
   * @param {Array} crawlData.links - Array of link objects with href, text, and context properties
   * @returns {Promise<Array<string>>} Array of discovered related URLs
   */
  async discoverRelatedUrls(sourceUrl, crawlData) {
    if (!this.config.enableRelatedURLDiscovery) {
      return [];
    }

    const relatedUrls = new Set();
    const sourceUrlObj = new URL(sourceUrl);

    // Extract links from crawl data
    const links = crawlData.links || [];
    
    for (const link of links) {
      try {
        // Handle both string URLs and link objects
        const linkHref = typeof link === 'string' ? link : (link.href || link);
        const linkUrl = new URL(linkHref, sourceUrl);
        
        // Skip same domain if configured
        if (this.config.excludeSameDomain && linkUrl.hostname === sourceUrlObj.hostname) {
          continue;
        }

        // Apply search algorithms to determine relevance
        const relevance = await this.calculateUrlRelevance(linkUrl.href, sourceUrl, crawlData);
        
        if (relevance >= this.config.minBacklinkQuality) {
          relatedUrls.add(linkUrl.href);
          this.discoveredUrls.add(linkUrl.href);
          
          // Track backlink relationship
          await this.addBacklink(sourceUrl, linkUrl.href, {
            relevance,
            anchorText: typeof link === 'object' ? (link.text || '') : '',
            context: typeof link === 'object' ? (link.context || '') : ''
          });
        }
      } catch (error) {
        // Skip invalid URLs
        continue;
      }
    }

    this.stats.discoveredUrls = this.discoveredUrls.size;
    
    return Array.from(relatedUrls);
  }

  /**
   * Add backlink relationship
   */
  async addBacklink(sourceUrl, targetUrl, metadata = {}) {
    if (!this.config.enableBacklinkGeneration) {
      return;
    }

    const normalizedSource = this.normalizeUrl(sourceUrl);
    const normalizedTarget = this.normalizeUrl(targetUrl);

    if (!this.backlinkNetwork.has(normalizedSource)) {
      this.backlinkNetwork.set(normalizedSource, []);
    }

    const backlink = {
      target: normalizedTarget,
      source: normalizedSource,
      relevance: metadata.relevance || 1.0,
      anchorText: metadata.anchorText || '',
      context: metadata.context || '',
      discoveredAt: new Date().toISOString()
    };

    this.backlinkNetwork.get(normalizedSource).push(backlink);
    this.stats.backlinksMapped++;

    // Update seed with backlink
    const seed = this.seeds.get(normalizedSource);
    if (seed) {
      seed.backlinks.push(backlink);
    }

    // Save to database
    if (this.db) {
      await this.saveBacklinkToDatabase(backlink);
    }

    this.emit('backlinkAdded', backlink);
  }

  /**
   * Calculate URL relevance using search algorithms
   */
  async calculateUrlRelevance(url, sourceUrl, crawlData) {
    if (!this.config.enableSearchAlgorithms) {
      return 1.0;
    }

    let totalRelevance = 0;
    let algorithmCount = 0;

    // Run each search algorithm
    for (const [name, algorithm] of Object.entries(this.searchAlgorithms)) {
      try {
        const relevance = await algorithm(url, sourceUrl, crawlData);
        totalRelevance += relevance;
        algorithmCount++;
      } catch (error) {
        console.warn(`Search algorithm ${name} failed:`, error.message);
      }
    }

    return algorithmCount > 0 ? totalRelevance / algorithmCount : 0;
  }

  /**
   * Keyword-based search algorithm
   */
  async keywordSearch(url, sourceUrl, crawlData) {
    const keywords = this.config.keywords || [];
    if (keywords.length === 0) return 0.5;

    const urlLower = url.toLowerCase();
    const matchCount = keywords.filter(kw => 
      urlLower.includes(kw.toLowerCase())
    ).length;

    return matchCount / keywords.length;
  }

  /**
   * Similarity-based search algorithm
   */
  async similaritySearch(url, sourceUrl, crawlData) {
    const sourceUrlObj = new URL(sourceUrl);
    const targetUrlObj = new URL(url);

    // Domain similarity
    const domainSimilarity = this.calculateDomainSimilarity(
      sourceUrlObj.hostname,
      targetUrlObj.hostname
    );

    // Path similarity
    const pathSimilarity = this.calculatePathSimilarity(
      sourceUrlObj.pathname,
      targetUrlObj.pathname
    );

    return (domainSimilarity + pathSimilarity) / 2;
  }

  /**
   * Authority-based search algorithm
   */
  async authoritySearch(url, sourceUrl, crawlData) {
    // Check if URL is from a known authority domain
    const authorityDomains = this.config.authorityDomains || [];
    const urlObj = new URL(url);

    for (const domain of authorityDomains) {
      if (urlObj.hostname.includes(domain)) {
        return 1.0;
      }
    }

    // Check domain metrics (if available)
    const metrics = this.urlMetrics.get(url);
    if (metrics && metrics.domainAuthority) {
      return metrics.domainAuthority / 100;
    }

    return 0.5;
  }

  /**
   * Topic-based search algorithm
   */
  async topicSearch(url, sourceUrl, crawlData) {
    const topics = this.config.topics || [];
    if (topics.length === 0) return 0.5;

    const urlLower = url.toLowerCase();
    const content = (crawlData.text || '').toLowerCase();

    let topicScore = 0;
    for (const topic of topics) {
      if (urlLower.includes(topic.toLowerCase()) || 
          content.includes(topic.toLowerCase())) {
        topicScore++;
      }
    }

    return topicScore / topics.length;
  }

  /**
   * Competitor-based search algorithm
   */
  async competitorSearch(url, sourceUrl, crawlData) {
    const competitors = this.config.competitors || [];
    if (competitors.length === 0) return 0.5;

    const urlObj = new URL(url);
    
    for (const competitor of competitors) {
      try {
        const compUrl = new URL(competitor);
        if (urlObj.hostname === compUrl.hostname) {
          return 1.0;
        }
      } catch (error) {
        // Skip invalid competitor URLs
        continue;
      }
    }

    return 0.3;
  }

  /**
   * Calculate domain similarity
   */
  calculateDomainSimilarity(domain1, domain2) {
    const parts1 = domain1.split('.').reverse();
    const parts2 = domain2.split('.').reverse();
    
    let matches = 0;
    const minLength = Math.min(parts1.length, parts2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (parts1[i] === parts2[i]) {
        matches++;
      } else {
        break;
      }
    }
    
    return matches / Math.max(parts1.length, parts2.length);
  }

  /**
   * Calculate path similarity
   */
  calculatePathSimilarity(path1, path2) {
    const segments1 = path1.split('/').filter(s => s);
    const segments2 = path2.split('/').filter(s => s);
    
    let matches = 0;
    const minLength = Math.min(segments1.length, segments2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (segments1[i] === segments2[i]) {
        matches++;
      }
    }
    
    return matches / Math.max(segments1.length, segments2.length);
  }

  /**
   * Refresh seeds periodically
   */
  async refreshSeeds() {
    if (this.isPaused || !this.isRunning) {
      return;
    }

    console.log(`🔄 Refreshing seeds for instance: ${this.instanceId}`);
    
    // Update seed priorities based on performance
    for (const [url, seed] of this.seeds) {
      if (seed.crawlCount > 0 && seed.backlinks.length > 0) {
        // Increase priority for seeds that generate backlinks
        seed.priority = Math.min(10, seed.priority + 0.5);
      }
    }

    this.stats.lastUpdate = new Date().toISOString();
    this.emit('seedsRefreshed', { 
      instanceId: this.instanceId,
      stats: this.stats 
    });
  }

  /**
   * Monitor crawler for new crawled sites
   */
  startCrawlerMonitoring() {
    if (!this.crawler) {
      return;
    }

    this.crawler.on('sitesCrawled', async (data) => {
      if (this.isPaused || !this.isRunning) {
        return;
      }

      this.stats.crawledSites++;
      
      // Discover related URLs from crawled data
      for (const site of data.sites || []) {
        try {
          const relatedUrls = await this.discoverRelatedUrls(site.url, site.data);
          
          // Add high-quality related URLs as new seeds
          for (const relatedUrl of relatedUrls.slice(0, 10)) {
            if (!this.seeds.has(relatedUrl)) {
              await this.addSeed(relatedUrl, {
                source: 'crawler-discovery',
                priority: 6,
                searchAlgorithm: 'related-discovery'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to process crawled site ${site.url}:`, error.message);
        }
      }
    });
  }

  /**
   * Normalize URL for consistent storage
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove trailing slash and fragments
      return urlObj.origin + urlObj.pathname.replace(/\/$/, '') + urlObj.search;
    } catch (error) {
      return url;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      instanceId: this.instanceId,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      stats: this.stats,
      config: {
        maxSeeds: this.config.maxSeedsPerInstance,
        searchDepth: this.config.searchDepth,
        enabledFeatures: {
          searchAlgorithms: this.config.enableSearchAlgorithms,
          relatedURLDiscovery: this.config.enableRelatedURLDiscovery,
          backlinkGeneration: this.config.enableBacklinkGeneration
        }
      }
    };
  }

  /**
   * Get backlinks for a specific URL
   */
  getBacklinks(url) {
    const normalizedUrl = this.normalizeUrl(url);
    return this.backlinkNetwork.get(normalizedUrl) || [];
  }

  /**
   * Load seeds from database
   */
  async loadSeedsFromDatabase() {
    if (!this.db) return;

    try {
      const result = await this.db.query(
        `SELECT * FROM url_seeds WHERE instance_id = $1 AND status = 'active'`,
        [this.instanceId]
      );

      for (const row of result.rows) {
        this.seeds.set(row.url, {
          url: row.url,
          addedAt: row.added_at,
          source: row.source,
          priority: row.priority,
          searchAlgorithm: row.search_algorithm,
          attributes: row.attributes || [],
          status: row.status,
          crawlCount: row.crawl_count || 0,
          lastCrawled: row.last_crawled,
          backlinks: [],
          relatedUrls: []
        });
      }

      this.stats.totalSeeds = this.seeds.size;
      this.stats.activeSeeds = this.seeds.size;
      
      console.log(`✅ Loaded ${this.seeds.size} seeds from database`);
    } catch (error) {
      console.error('Failed to load seeds from database:', error);
    }
  }

  /**
   * Save seeds to database
   */
  async saveSeedsToDatabase() {
    if (!this.db) return;

    try {
      for (const seed of this.seeds.values()) {
        await this.saveSeedToDatabase(seed);
      }
      console.log(`✅ Saved ${this.seeds.size} seeds to database`);
    } catch (error) {
      console.error('Failed to save seeds to database:', error);
    }
  }

  /**
   * Save single seed to database
   */
  async saveSeedToDatabase(seed) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO url_seeds 
        (instance_id, url, source, priority, search_algorithm, attributes, status, crawl_count, last_crawled, added_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (instance_id, url) 
        DO UPDATE SET 
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          crawl_count = EXCLUDED.crawl_count,
          last_crawled = EXCLUDED.last_crawled`,
        [
          this.instanceId,
          seed.url,
          seed.source,
          seed.priority,
          seed.searchAlgorithm,
          JSON.stringify(seed.attributes),
          seed.status,
          seed.crawlCount,
          seed.lastCrawled,
          seed.addedAt
        ]
      );
    } catch (error) {
      console.error(`Failed to save seed ${seed.url}:`, error);
    }
  }

  /**
   * Remove seed from database
   */
  async removeSeedFromDatabase(url) {
    if (!this.db) return;

    try {
      await this.db.query(
        `DELETE FROM url_seeds WHERE instance_id = $1 AND url = $2`,
        [this.instanceId, url]
      );
    } catch (error) {
      console.error(`Failed to remove seed ${url}:`, error);
    }
  }

  /**
   * Save backlink to database
   */
  async saveBacklinkToDatabase(backlink) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO backlinks 
        (instance_id, source_url, target_url, relevance, anchor_text, context, discovered_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (instance_id, source_url, target_url) DO NOTHING`,
        [
          this.instanceId,
          backlink.source,
          backlink.target,
          backlink.relevance,
          backlink.anchorText,
          backlink.context,
          backlink.discoveredAt
        ]
      );
    } catch (error) {
      console.error('Failed to save backlink:', error);
    }
  }
}

export default URLSeedingService;
