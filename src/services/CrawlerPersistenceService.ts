/**
 * Crawler Persistence Service
 * Manages crawled site data as a blockchain-backed storage system
 * Integrates with SEO analysis and LightDOM slots
 */

import { databaseIntegration } from './DatabaseIntegration';
import { serviceHub } from './ServiceHub';

export interface CrawledSite {
  id: string;
  url: string;
  domain: string;
  lastCrawled: Date;
  crawlFrequency: number; // in hours
  priority: number; // 1-10
  seoScore: number; // 0-100
  optimizationPotential: number; // bytes that can be saved
  currentSize: number; // current page size in bytes
  optimizedSize: number; // size after optimization
  spaceReclaimed: number; // space saved in bytes
  blockchainRecorded: boolean;
  transactionHash?: string;
  metaverseSlotId?: string;

  // Top-level SEO attributes (mirrors key entries in metadata for easier queries)
  title?: string;
  description?: string;
  keywords?: string[]; // text[]
  canonicalUrl?: string;
  robotsMeta?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;

  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  // Rich JSON fields
  structuredData?: any[]; // JSONB
  headings?: any; // JSONB of heading counts / structures
  contentAnalysis?: any; // JSONB analytics of content
  links?: any; // JSONB
  images?: any; // JSONB
  scripts?: any; // JSONB
  stylesheets?: any; // JSONB
  inlineStyles?: any; // JSONB

  // Neural integration fields
  domPaintMetrics?: any; // JSONB dom paint metrics
  renderLayers?: any; // JSONB render layer info
  neuralTopics?: any[]; // JSONB array of topics
  neuralRecommendations?: any[]; // JSONB recommendations from neural analysis
  neuralEmbeddings?: any; // JSONB embeddings payload

  metadata: SiteMetadata;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
  structuredData: any[];
  performance: PerformanceMetrics;
  seo: SEOMetrics;
  accessibility: AccessibilityMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
}

export interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  h1Count: number;
  imageAltMissing: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: string[];
  duplicateContent: boolean;
  canonicalUrl?: string;
  robots: string;
  sitemap: boolean;
  schemaMarkup: boolean;
}

export interface AccessibilityMetrics {
  score: number;
  issues: string[];
  ariaLabels: number;
  altTexts: number;
  contrastIssues: number;
}

export interface CrawlPlan {
  siteId: string;
  url: string;
  nextCrawl: Date;
  priority: number;
  reason: string; // 'scheduled', 'seo-update', 'user-request', 'optimization-check'
}

export interface SpaceAllocation {
  siteId: string;
  totalSpace: number; // bytes
  usedSpace: number;
  availableSpace: number;
  slots: LightDomSlot[];
}

export interface LightDomSlot {
  id: string;
  siteId: string;
  size: number; // bytes
  type: 'chat' | 'storage' | 'compute' | 'metaverse';
  owner: string; // wallet address
  price: string; // LDOM tokens
  occupied: boolean;
  occupant?: string; // wallet address of renter
  expiresAt?: Date;
  metadata?: any;
}

export class CrawlerPersistenceService {
  private crawledSites: Map<string, CrawledSite> = new Map();
  private crawlQueue: CrawlPlan[] = [];
  private spaceAllocations: Map<string, SpaceAllocation> = new Map();
  private crawlInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadPersistedData();
    this.startCrawlScheduler();
  }

  /**
   * Load persisted crawler data from database
   */
  private async loadPersistedData() {
    try {
      await databaseIntegration.initialize();
      
      // Load crawled sites
      const sites = await databaseIntegration.query(
        'SELECT * FROM crawled_sites ORDER BY last_crawled DESC',
        []
      );
      
      sites.rows.forEach(site => {
        this.crawledSites.set(site.id, {
          ...site,
          lastCrawled: new Date(site.last_crawled),
          metadata: JSON.parse(site.metadata || '{}')
        });
      });

      // Load space allocations
      const allocations = await databaseIntegration.query(
        'SELECT * FROM space_allocations',
        []
      );

      allocations.rows.forEach(allocation => {
        this.spaceAllocations.set(allocation.site_id, {
          siteId: allocation.site_id,
          totalSpace: allocation.total_space,
          usedSpace: allocation.used_space,
          availableSpace: allocation.available_space,
          slots: JSON.parse(allocation.slots || '[]')
        });
      });

      console.log(`✅ Loaded ${this.crawledSites.size} crawled sites`);
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }

  /**
   * Record a crawled site with SEO analysis
   */
  async recordCrawledSite(siteData: Partial<CrawledSite>): Promise<CrawledSite> {
    const site: CrawledSite = {
      id: this.generateSiteId(siteData.url!),
      url: siteData.url!,
      domain: new URL(siteData.url!).hostname,
      lastCrawled: new Date(),
      crawlFrequency: siteData.crawlFrequency || 24, // default 24 hours
      priority: this.calculatePriority(siteData),
      seoScore: siteData.seoScore || 0,
      optimizationPotential: siteData.optimizationPotential || 0,
      currentSize: siteData.currentSize || 0,
      optimizedSize: siteData.optimizedSize || 0,
      spaceReclaimed: (siteData.currentSize || 0) - (siteData.optimizedSize || 0),
      blockchainRecorded: false,
      metadata: siteData.metadata || this.createDefaultMetadata(),
      ...siteData
    };

    // Save to database
    await this.persistSite(site);
    
    // Record to blockchain if significant optimization
    if (site.spaceReclaimed > 10000) { // 10KB threshold
      await this.recordToBlockchain(site);
    }

    // Create space allocation
    await this.createSpaceAllocation(site);

    // Update crawl plan
    this.updateCrawlPlan(site);

    this.crawledSites.set(site.id, site);
    
    return site;
  }

  /**
   * Calculate crawl priority based on SEO and optimization metrics
   */
  private calculatePriority(siteData: Partial<CrawledSite>): number {
    let priority = 5; // default medium priority

    // Increase priority for poor SEO
    if ((siteData.seoScore || 100) < 50) priority += 2;
    
    // Increase priority for high optimization potential
    if ((siteData.optimizationPotential || 0) > 100000) priority += 2; // >100KB
    
    // Increase priority for frequently updated sites
    if (siteData.metadata?.performance?.loadTime && 
        siteData.metadata.performance.loadTime > 3000) priority += 1;

    return Math.min(10, Math.max(1, priority));
  }

  /**
   * Persist site to database
   */
  private async persistSite(site: CrawledSite) {
    try {
      await databaseIntegration.query(
        `INSERT INTO crawled_sites (
          id, url, domain, last_crawled, crawl_frequency, priority,
          seo_score, optimization_potential, current_size, optimized_size,
          space_reclaimed, blockchain_recorded, transaction_hash, 
          metaverse_slot_id,
          title, description, keywords, canonical_url, robots_meta,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_title, twitter_description, twitter_image,
          structured_data, headings, content_analysis, links, images,
          scripts, stylesheets, inline_styles, metadata,
          dom_paint_metrics, render_layers, neural_topics, neural_recommendations, neural_embeddings
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,
          $11,$12,$13,$14,
          $15,$16,$17,$18,$19,
          $20,$21,$22,$23,
          $24,$25,$26,$27,
          $28,$29,$30,$31,$32,
          $33,$34,$35,$36,
          COALESCE($37::jsonb, '{}'::jsonb),
          COALESCE($38::jsonb, '[]'::jsonb),
          COALESCE($39::jsonb, '[]'::jsonb),
          COALESCE($40::jsonb, '[]'::jsonb),
          COALESCE($41::jsonb, '{}'::jsonb)
        )
        ON CONFLICT (id) DO UPDATE SET
          last_crawled = $4, crawl_frequency = $5, priority = $6,
          seo_score = $7, optimization_potential = $8, current_size = $9,
          optimized_size = $10, space_reclaimed = $11, 
          blockchain_recorded = $12, transaction_hash = $13,
          metaverse_slot_id = $14,
          title = $15, description = $16, keywords = $17, canonical_url = $18, robots_meta = $19,
          og_title = $20, og_description = $21, og_image = $22, og_url = $23,
          twitter_card = $24, twitter_title = $25, twitter_description = $26, twitter_image = $27,
          structured_data = $28, headings = $29, content_analysis = $30, links = $31, images = $32,
          scripts = $33, stylesheets = $34, inline_styles = $35, metadata = $36,
          dom_paint_metrics = COALESCE($37::jsonb, dom_paint_metrics),
          render_layers = COALESCE($38::jsonb, render_layers),
          neural_topics = COALESCE($39::jsonb, neural_topics),
          neural_recommendations = COALESCE($40::jsonb, neural_recommendations),
          neural_embeddings = COALESCE($41::jsonb, neural_embeddings)`,
        [
          site.id,
          site.url,
          site.domain,
          site.lastCrawled,
          site.crawlFrequency,
          site.priority,
          site.seoScore,
          site.optimizationPotential,
          site.currentSize,
          site.optimizedSize,
          site.spaceReclaimed,
          site.blockchainRecorded,
          site.transactionHash || null,
          site.metaverseSlotId || null,

          // top-level SEO columns (fall back to metadata)
          site.title ?? site.metadata?.title ?? null,
          site.description ?? site.metadata?.description ?? null,
          site.keywords ?? site.metadata?.keywords ?? [],
          site.canonicalUrl ?? site.metadata?.seo?.canonicalUrl ?? site.metadata?.seo?.canonicalUrl ?? null,
          site.robotsMeta ?? site.metadata?.seo?.robots ?? null,

          site.ogTitle ?? site.metadata?.ogTags?.title ?? null,
          site.ogDescription ?? site.metadata?.ogTags?.description ?? null,
          site.ogImage ?? site.metadata?.ogTags?.image ?? null,
          site.ogUrl ?? site.url,

          site.twitterCard ?? site.metadata?.twitterCard ?? null,
          site.twitterTitle ?? site.metadata?.twitterTitle ?? null,
          site.twitterDescription ?? site.metadata?.twitterDescription ?? null,
          site.twitterImage ?? site.metadata?.twitterImage ?? null,

          // JSONB fields -> stringify
          JSON.stringify(site.structuredData ?? site.metadata?.structuredData ?? []),
          JSON.stringify(site.headings ?? { h1: (site.metadata?.seo?.h1Count || 0) }),
          JSON.stringify(site.contentAnalysis ?? {}),
          JSON.stringify(site.links ?? site.metadata?.links ?? {}),
          JSON.stringify(site.images ?? site.metadata?.images ?? []),
          JSON.stringify(site.scripts ?? site.metadata?.scripts ?? []),
          JSON.stringify(site.stylesheets ?? site.metadata?.stylesheets ?? []),
          JSON.stringify(site.inlineStyles ?? {}),
          // full metadata JSONB (last param)
          JSON.stringify(site.metadata ?? {}),
          site.domPaintMetrics !== undefined ? JSON.stringify(site.domPaintMetrics ?? {}) : null,
          site.renderLayers !== undefined ? JSON.stringify(site.renderLayers ?? []) : null,
          site.neuralTopics !== undefined ? JSON.stringify(site.neuralTopics ?? []) : null,
          site.neuralRecommendations !== undefined ? JSON.stringify(site.neuralRecommendations ?? []) : null,
          site.neuralEmbeddings !== undefined ? JSON.stringify(site.neuralEmbeddings ?? {}) : null
        ]
      );
    } catch (error) {
      console.error('Failed to persist site:', error);
    }
  }

  /**
   * Record optimization to blockchain
   */
  private async recordToBlockchain(site: CrawledSite) {
    try {
      const blockchain = serviceHub.getBlockchain();
      if (!blockchain) return;

      const txHash = await blockchain.submitOptimization({
        url: site.url,
        originalSize: site.currentSize,
        optimizedSize: site.optimizedSize,
        spaceSaved: site.spaceReclaimed,
        optimizationScore: Math.round((site.spaceReclaimed / site.currentSize) * 100),
        metadata: {
          seoScore: site.seoScore,
          domain: site.domain,
          crawledAt: site.lastCrawled.toISOString()
        }
      });

      site.blockchainRecorded = true;
      site.transactionHash = txHash;
      
      await this.persistSite(site);
      console.log(`✅ Recorded optimization to blockchain: ${txHash}`);
    } catch (error) {
      console.error('Failed to record to blockchain:', error);
    }
  }

  /**
   * Create space allocation for optimized sites
   */
  private async createSpaceAllocation(site: CrawledSite) {
    if (site.spaceReclaimed <= 0) return;

    const allocation: SpaceAllocation = {
      siteId: site.id,
      totalSpace: site.spaceReclaimed,
      usedSpace: 0,
      availableSpace: site.spaceReclaimed,
      slots: this.generateSlots(site)
    };

    this.spaceAllocations.set(site.id, allocation);
    
    // Persist allocation
    await databaseIntegration.query(
      `INSERT INTO space_allocations (site_id, total_space, used_space, available_space, slots)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (site_id) DO UPDATE SET
         total_space = $2, used_space = $3, available_space = $4, slots = $5`,
      [site.id, allocation.totalSpace, allocation.usedSpace, 
       allocation.availableSpace, JSON.stringify(allocation.slots)]
    );
  }

  /**
   * Generate LightDOM slots from reclaimed space
   */
  private generateSlots(site: CrawledSite): LightDomSlot[] {
    const slots: LightDomSlot[] = [];
    const slotSize = 1024 * 10; // 10KB per slot
    const numSlots = Math.floor(site.spaceReclaimed / slotSize);

    for (let i = 0; i < numSlots; i++) {
      slots.push({
        id: `${site.id}-slot-${i}`,
        siteId: site.id,
        size: slotSize,
        type: this.determineSlotType(i, numSlots),
        owner: site.url, // Initially owned by the site
        price: this.calculateSlotPrice(slotSize, site.seoScore),
        occupied: false
      });
    }

    return slots;
  }

  /**
   * Determine slot type based on position and total slots
   */
  private determineSlotType(index: number, total: number): LightDomSlot['type'] {
    const ratio = index / total;
    if (ratio < 0.3) return 'chat';
    if (ratio < 0.6) return 'storage';
    if (ratio < 0.8) return 'compute';
    return 'metaverse';
  }

  /**
   * Calculate slot price in LDOM tokens
   */
  private calculateSlotPrice(size: number, seoScore: number): string {
    // Base price: 1 LDOM per KB
    const basePrice = size / 1024;
    
    // Multiply by SEO factor (better SEO = higher price)
    const seoMultiplier = 1 + (seoScore / 100);
    
    return (basePrice * seoMultiplier).toFixed(2);
  }

  /**
   * Update crawl plan based on site metrics
   */
  private updateCrawlPlan(site: CrawledSite) {
    const nextCrawl = new Date(site.lastCrawled);
    nextCrawl.setHours(nextCrawl.getHours() + site.crawlFrequency);

    const plan: CrawlPlan = {
      siteId: site.id,
      url: site.url,
      nextCrawl,
      priority: site.priority,
      reason: 'scheduled'
    };

    // Remove existing plan for this site
    this.crawlQueue = this.crawlQueue.filter(p => p.siteId !== site.id);
    
    // Add new plan
    this.crawlQueue.push(plan);
    
    // Sort by next crawl time and priority
    this.crawlQueue.sort((a, b) => {
      if (a.nextCrawl.getTime() === b.nextCrawl.getTime()) {
        return b.priority - a.priority;
      }
      return a.nextCrawl.getTime() - b.nextCrawl.getTime();
    });
  }

  /**
   * Start the crawl scheduler
   */
  private startCrawlScheduler() {
    // Check every minute for sites to crawl
    this.crawlInterval = setInterval(() => {
      this.processCrawlQueue();
    }, 60000);
  }

  /**
   * Process the crawl queue
   */
  private async processCrawlQueue() {
    const now = new Date();
    const dueSites = this.crawlQueue.filter(plan => plan.nextCrawl <= now);

    for (const plan of dueSites) {
      try {
        // Trigger crawl through web crawler service
        const crawler = serviceHub.getWebCrawler();
        if (crawler) {
          await crawler.crawlUrl(plan.url);
          console.log(`🕷️ Crawling ${plan.url} (${plan.reason})`);
        }
      } catch (error) {
        console.error(`Failed to crawl ${plan.url}:`, error);
      }
    }
  }

  /**
   * Get SEO insights for a domain
   */
  async getSEOInsights(domain: string): Promise<any> {
    const sites = Array.from(this.crawledSites.values())
      .filter(site => site.domain === domain);

    if (sites.length === 0) {
      return { error: 'Domain not found in crawled sites' };
    }

    const avgSeoScore = sites.reduce((sum, site) => sum + site.seoScore, 0) / sites.length;
    const totalSpaceReclaimed = sites.reduce((sum, site) => sum + site.spaceReclaimed, 0);
    const commonIssues = this.analyzeCommonSEOIssues(sites);

    return {
      domain,
      sitesAnalyzed: sites.length,
      averageSeoScore: avgSeoScore,
      totalSpaceReclaimed,
      recommendations: this.generateSEORecommendations(avgSeoScore, commonIssues),
      commonIssues,
      crawlHistory: sites.map(s => ({
        url: s.url,
        lastCrawled: s.lastCrawled,
        seoScore: s.seoScore,
        spaceReclaimed: s.spaceReclaimed
      }))
    };
  }

  /**
   * Analyze common SEO issues across sites
   */
  private analyzeCommonSEOIssues(sites: CrawledSite[]): string[] {
    const issues: string[] = [];
    
    const avgTitleLength = sites.reduce((sum, s) => 
      sum + (s.metadata.seo?.titleLength || 0), 0) / sites.length;
    
    if (avgTitleLength < 30) issues.push('Short page titles');
    if (avgTitleLength > 60) issues.push('Long page titles');

    const missingAltText = sites.filter(s => 
      (s.metadata.seo?.imageAltMissing || 0) > 0).length;
    if (missingAltText > sites.length / 2) {
      issues.push('Missing image alt text');
    }

    const noSchema = sites.filter(s => !s.metadata.seo?.schemaMarkup).length;
    if (noSchema > sites.length / 2) {
      issues.push('Missing schema markup');
    }

    return issues;
  }

  /**
   * Generate SEO recommendations
   */
  private generateSEORecommendations(avgScore: number, issues: string[]): string[] {
    const recommendations: string[] = [];

    if (avgScore < 50) {
      recommendations.push('Urgent SEO improvements needed');
    }

    issues.forEach(issue => {
      switch (issue) {
        case 'Short page titles':
          recommendations.push('Expand page titles to 50-60 characters');
          break;
        case 'Long page titles':
          recommendations.push('Shorten page titles to under 60 characters');
          break;
        case 'Missing image alt text':
          recommendations.push('Add descriptive alt text to all images');
          break;
        case 'Missing schema markup':
          recommendations.push('Implement structured data markup');
          break;
      }
    });

    return recommendations;
  }

  /**
   * Get available LightDOM slots
   */
  async getAvailableSlots(type?: LightDomSlot['type']): Promise<LightDomSlot[]> {
    const allSlots: LightDomSlot[] = [];
    
    this.spaceAllocations.forEach(allocation => {
      allocation.slots.forEach(slot => {
        if (!slot.occupied && (!type || slot.type === type)) {
          allSlots.push(slot);
        }
      });
    });

    return allSlots.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  /**
   * Rent a LightDOM slot
   */
  async rentSlot(slotId: string, renter: string, duration: number): Promise<boolean> {
    // Find the slot
    let targetSlot: LightDomSlot | null = null;
    let targetAllocation: SpaceAllocation | null = null;

    for (const allocation of this.spaceAllocations.values()) {
      const slot = allocation.slots.find(s => s.id === slotId);
      if (slot) {
        targetSlot = slot;
        targetAllocation = allocation;
        break;
      }
    }

    if (!targetSlot || !targetAllocation || targetSlot.occupied) {
      return false;
    }

    // Process payment (integrate with blockchain)
    const totalPrice = parseFloat(targetSlot.price) * duration;
    // TODO: Process LDOM payment

    // Update slot
    targetSlot.occupied = true;
    targetSlot.occupant = renter;
    targetSlot.expiresAt = new Date(Date.now() + duration * 3600000); // duration in hours

    // Update allocation
    targetAllocation.usedSpace += targetSlot.size;
    targetAllocation.availableSpace -= targetSlot.size;

    // Persist changes
    await this.persistSpaceAllocation(targetAllocation);

    return true;
  }

  /**
   * Persist space allocation
   */
  private async persistSpaceAllocation(allocation: SpaceAllocation) {
    await databaseIntegration.query(
      `UPDATE space_allocations 
       SET used_space = $2, available_space = $3, slots = $4
       WHERE site_id = $1`,
      [allocation.siteId, allocation.usedSpace, 
       allocation.availableSpace, JSON.stringify(allocation.slots)]
    );
  }

  /**
   * Generate site ID from URL
   */
  private generateSiteId(url: string): string {
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): SiteMetadata {
    return {
      title: '',
      description: '',
      keywords: [],
      ogTags: {},
      structuredData: [],
      performance: {
        loadTime: 0,
        ttfb: 0,
        fcp: 0,
        lcp: 0,
        cls: 0,
        fid: 0
      },
      seo: {
        titleLength: 0,
        descriptionLength: 0,
        h1Count: 0,
        imageAltMissing: 0,
        internalLinks: 0,
        externalLinks: 0,
        brokenLinks: [],
        duplicateContent: false,
        robots: '',
        sitemap: false,
        schemaMarkup: false
      },
      accessibility: {
        score: 0,
        issues: [],
        ariaLabels: 0,
        altTexts: 0,
        contrastIssues: 0
      }
    };
  }

  /**
   * Cleanup expired slots
   */
  async cleanupExpiredSlots() {
    const now = new Date();
    let cleaned = 0;

    for (const allocation of this.spaceAllocations.values()) {
      for (const slot of allocation.slots) {
        if (slot.occupied && slot.expiresAt && slot.expiresAt < now) {
          slot.occupied = false;
          slot.occupant = undefined;
          slot.expiresAt = undefined;
          
          allocation.usedSpace -= slot.size;
          allocation.availableSpace += slot.size;
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        await this.persistSpaceAllocation(allocation);
      }
    }

    console.log(`🧹 Cleaned up ${cleaned} expired slots`);
  }

  /**
   * Shutdown service
   */
  shutdown() {
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
    }
  }
}

// Export singleton
export const crawlerPersistence = new CrawlerPersistenceService();


