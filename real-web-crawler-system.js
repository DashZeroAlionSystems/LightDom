// Real Web Crawler System - Production DOM Space Harvesting Engine
// Automatically discovers websites, extracts schema.org data, maps backlinks, 
// optimizes to Light DOM, and feeds blockchain metaverse

const puppeteer = require('puppeteer');
const { Client } = require('pg');
const { URL } = require('url');
const robots = require('robots');
const sitemap = require('sitemap-stream-parser');
const cheerio = require('cheerio');
const { createHash } = require('crypto');

class RealWebCrawlerSystem {
  constructor(config) {
    this.config = {
      maxConcurrency: config.maxConcurrency || 10,
      requestDelay: config.requestDelay || 1000,
      maxDepth: config.maxDepth || 3,
      respectRobots: config.respectRobots || true,
      userAgent: 'DOM-Space-Harvester/1.0 (+https://domspace.harvester)',
      ...config
    };
    
    this.browser = null;
    this.db = new Client(config.postgres);
    this.crawlQueue = [];
    this.activeCrawls = new Map();
    this.robotsCache = new Map();
    this.schemaExtractor = new SchemaOrgExtractor();
    this.backlinkAnalyzer = new BacklinkNetworkAnalyzer();
    this.lightDOMConverter = new LightDOMConverter();
    this.blockchainIntegrator = new BlockchainMetaverseIntegrator(config.blockchain);
  }

  async initialize() {
    console.log('🚀 Initializing Real Web Crawler System...');
    
    // Connect to PostgreSQL
    await this.db.connect();
    await this.initializeDatabase();
    
    // Launch browser pool
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    // Load seed URLs and generate initial crawl list
    await this.generateInitialCrawlList();
    
    console.log('✅ System initialized! Ready to harvest the web.');
  }

  async initializeDatabase() {
    // Create comprehensive schema for web crawling and optimization
    const schemas = [
      // Crawl targets and results
      `CREATE TABLE IF NOT EXISTS crawl_targets (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        domain TEXT NOT NULL,
        discovered_at TIMESTAMP DEFAULT NOW(),
        last_crawled TIMESTAMP,
        crawl_depth INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 1,
        robots_allowed BOOLEAN DEFAULT TRUE,
        sitemap_entry BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'pending',
        error_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}'
      )`,
      
      // DOM analysis and optimization results
      `CREATE TABLE IF NOT EXISTS dom_optimizations (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        crawl_timestamp TIMESTAMP DEFAULT NOW(),
        original_dom_hash TEXT NOT NULL,
        optimized_dom_hash TEXT NOT NULL,
        original_size_bytes BIGINT NOT NULL,
        optimized_size_bytes BIGINT NOT NULL,
        space_saved_bytes BIGINT NOT NULL,
        optimization_types TEXT[] NOT NULL,
        performance_metrics JSONB DEFAULT '{}',
        light_dom_data JSONB NOT NULL,
        blockchain_tx_hash TEXT,
        metaverse_impact JSONB DEFAULT '{}'
      )`,
      
      // Schema.org structured data
      `CREATE TABLE IF NOT EXISTS schema_data (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        schema_type TEXT NOT NULL,
        schema_data JSONB NOT NULL,
        extracted_at TIMESTAMP DEFAULT NOW(),
        confidence_score REAL DEFAULT 1.0
      )`,
      
      // Backlink network mapping
      `CREATE TABLE IF NOT EXISTS backlink_network (
        id SERIAL PRIMARY KEY,
        source_url TEXT NOT NULL,
        target_url TEXT NOT NULL,
        anchor_text TEXT,
        link_type TEXT NOT NULL, -- internal, external, nofollow, etc.
        context_data JSONB DEFAULT '{}',
        discovered_at TIMESTAMP DEFAULT NOW(),
        link_strength REAL DEFAULT 1.0
      )`,
      
      // Site analysis and biome classification
      `CREATE TABLE IF NOT EXISTS site_analysis (
        id SERIAL PRIMARY KEY,
        domain TEXT UNIQUE NOT NULL,
        biome_type TEXT NOT NULL,
        total_pages_discovered INTEGER DEFAULT 0,
        total_space_harvested BIGINT DEFAULT 0,
        avg_optimization_potential REAL DEFAULT 0.0,
        technology_stack TEXT[] DEFAULT '{}',
        performance_score REAL DEFAULT 0.0,
        schema_richness REAL DEFAULT 0.0,
        backlink_authority REAL DEFAULT 0.0,
        last_analyzed TIMESTAMP DEFAULT NOW()
      )`,

      // Crawl performance and statistics
      `CREATE TABLE IF NOT EXISTS crawl_stats (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        start_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP,
        pages_crawled INTEGER DEFAULT 0,
        total_space_harvested BIGINT DEFAULT 0,
        optimization_success_rate REAL DEFAULT 0.0,
        avg_response_time REAL DEFAULT 0.0,
        error_count INTEGER DEFAULT 0
      )`
    ];

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_crawl_targets_url ON crawl_targets(url)',
      'CREATE INDEX IF NOT EXISTS idx_crawl_targets_domain ON crawl_targets(domain)',
      'CREATE INDEX IF NOT EXISTS idx_crawl_targets_status ON crawl_targets(status)',
      'CREATE INDEX IF NOT EXISTS idx_dom_optimizations_url ON dom_optimizations(url)',
      'CREATE INDEX IF NOT EXISTS idx_schema_data_url ON schema_data(url)',
      'CREATE INDEX IF NOT EXISTS idx_schema_data_type ON schema_data(schema_type)',
      'CREATE INDEX IF NOT EXISTS idx_backlink_source ON backlink_network(source_url)',
      'CREATE INDEX IF NOT EXISTS idx_backlink_target ON backlink_network(target_url)',
      'CREATE INDEX IF NOT EXISTS idx_site_analysis_domain ON site_analysis(domain)'
    ];

    for (const schema of schemas) {
      await this.db.query(schema);
    }
    
    for (const index of indexes) {
      await this.db.query(index);
    }

    console.log('✅ Database schema initialized');
  }

  async generateInitialCrawlList() {
    console.log('🌐 Generating initial crawl list...');
    
    // Start with high-value seed domains across different biomes
    const seedDomains = [
      // Tech/Digital Biome
      'github.com', 'stackoverflow.com', 'developer.mozilla.org', 'nodejs.org',
      // Commercial Biome  
      'amazon.com', 'ebay.com', 'shopify.com', 'stripe.com',
      // Knowledge Biome
      'wikipedia.org', 'medium.com', 'hackernews.com', 'reddit.com',
      // Entertainment Biome
      'youtube.com', 'netflix.com', 'spotify.com', 'twitch.tv',
      // Social Biome
      'twitter.com', 'linkedin.com', 'instagram.com', 'facebook.com',
      // News/Media Biome
      'bbc.com', 'cnn.com', 'techcrunch.com', 'wired.com'
    ];

    // Discover additional URLs from sitemaps and robots.txt
    for (const domain of seedDomains) {
      await this.discoverDomainUrls(domain);
    }

    // Load any existing targets from database
    const existingTargets = await this.db.query(
      'SELECT url, priority FROM crawl_targets WHERE status = $1 ORDER BY priority DESC, discovered_at ASC',
      ['pending']
    );

    this.crawlQueue = existingTargets.rows.map(row => ({
      url: row.url,
      priority: row.priority,
      depth: 0
    }));

    console.log(`✅ Generated crawl list with ${this.crawlQueue.length} initial targets`);
  }

  async discoverDomainUrls(domain) {
    try {
      const baseUrl = `https://${domain}`;
      
      // Check robots.txt
      const robotsData = await this.parseRobotsTxt(baseUrl);
      
      // Parse sitemaps if available
      if (robotsData.sitemaps.length > 0) {
        for (const sitemapUrl of robotsData.sitemaps) {
          await this.parseSitemap(sitemapUrl, domain);
        }
      }
      
      // Add homepage as priority target
      await this.addCrawlTarget(baseUrl, domain, 0, 10, true);
      
      // Discover common high-value pages
      const commonPaths = [
        '/blog', '/products', '/services', '/about', '/contact',
        '/docs', '/documentation', '/api', '/support'
      ];
      
      for (const path of commonPaths) {
        await this.addCrawlTarget(`${baseUrl}${path}`, domain, 1, 5);
      }

    } catch (error) {
      console.log(`⚠️ Could not discover URLs for ${domain}:`, error.message);
    }
  }

  async parseRobotsTxt(baseUrl) {
    try {
      const robotsUrl = `${baseUrl}/robots.txt`;
      const response = await fetch(robotsUrl);
      const robotsText = await response.text();
      
      const robotsData = {
        sitemaps: [],
        disallowed: [],
        allowed: []
      };
      
      const lines = robotsText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith('sitemap:')) {
          robotsData.sitemaps.push(trimmed.split('sitemap:')[1].trim());
        } else if (trimmed.startsWith('disallow:')) {
          robotsData.disallowed.push(trimmed.split('disallow:')[1].trim());
        } else if (trimmed.startsWith('allow:')) {
          robotsData.allowed.push(trimmed.split('allow:')[1].trim());
        }
      }
      
      this.robotsCache.set(baseUrl, robotsData);
      return robotsData;
      
    } catch (error) {
      return { sitemaps: [], disallowed: [], allowed: [] };
    }
  }

  async parseSitemap(sitemapUrl, domain) {
    try {
      const response = await fetch(sitemapUrl);
      const sitemapXml = await response.text();
      
      // Parse XML sitemap (simplified - in production use proper XML parser)
      const urlRegex = /<loc>(.*?)<\/loc>/g;
      let match;
      const urls = [];
      
      while ((match = urlRegex.exec(sitemapXml)) !== null) {
        urls.push(match[1]);
      }
      
      // Add sitemap URLs to crawl targets
      for (const url of urls.slice(0, 100)) { // Limit initial sitemap URLs
        await this.addCrawlTarget(url, domain, 1, 3, false, true);
      }
      
      console.log(`📄 Discovered ${urls.length} URLs from sitemap: ${sitemapUrl}`);
      
    } catch (error) {
      console.log(`⚠️ Could not parse sitemap ${sitemapUrl}:`, error.message);
    }
  }

  async addCrawlTarget(url, domain, depth = 0, priority = 1, robotsAllowed = true, isSitemapEntry = false) {
    try {
      await this.db.query(
        `INSERT INTO crawl_targets (url, domain, crawl_depth, priority, robots_allowed, sitemap_entry) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (url) DO NOTHING`,
        [url, domain, depth, priority, robotsAllowed, isSitemapEntry]
      );
    } catch (error) {
      // Ignore duplicate URL errors
    }
  }

  async startCrawling() {
    console.log('🕷️ Starting distributed web crawling...');
    
    const sessionId = createHash('md5').update(Date.now().toString()).digest('hex');
    await this.db.query(
      'INSERT INTO crawl_stats (session_id) VALUES ($1)',
      [sessionId]
    );

    // Process crawl queue with controlled concurrency
    while (this.crawlQueue.length > 0 || this.activeCrawls.size > 0) {
      // Start new crawls up to concurrency limit
      while (this.activeCrawls.size < this.config.maxConcurrency && this.crawlQueue.length > 0) {
        const target = this.crawlQueue.shift();
        const crawlPromise = this.crawlUrl(target, sessionId);
        this.activeCrawls.set(target.url, crawlPromise);
        
        // Remove from active crawls when complete
        crawlPromise.finally(() => {
          this.activeCrawls.delete(target.url);
        });
      }
      
      // Wait for at least one crawl to complete
      if (this.activeCrawls.size > 0) {
        await Promise.race(this.activeCrawls.values());
      }
      
      // Reload queue from database if empty
      if (this.crawlQueue.length === 0) {
        await this.reloadCrawlQueue();
      }
      
      // Rate limiting
      await this.delay(this.config.requestDelay);
    }
    
    console.log('🎉 Crawling session completed!');
  }

  async crawlUrl(target, sessionId) {
    const startTime = Date.now();
    let page = null;
    
    try {
      console.log(`🔍 Crawling: ${target.url}`);
      
      // Update status to processing
      await this.db.query(
        'UPDATE crawl_targets SET status = $1, last_crawled = NOW() WHERE url = $2',
        ['processing', target.url]
      );
      
      // Create new page
      page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent);
      
      // Navigate to URL with timeout
      await page.goto(target.url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Extract page data
      const pageData = await this.extractPageData(page, target.url);
      
      // Analyze and optimize DOM
      const optimization = await this.analyzeAndOptimizePage(page, pageData);
      
      // Extract schema.org data
      const schemaData = await this.schemaExtractor.extractSchemas(pageData.html);
      
      // Discover and analyze backlinks
      const backlinks = await this.backlinkAnalyzer.extractBacklinks(pageData.html, target.url);
      
      // Store all data in database
      await this.storePageData(target.url, pageData, optimization, schemaData, backlinks);
      
      // Submit to blockchain if significant optimization achieved
      if (optimization.spaceSavedBytes > 10000) { // > 10KB saved
        await this.blockchainIntegrator.submitOptimization(target.url, optimization);
      }
      
      // Discover new URLs for crawling
      await this.discoverNewUrls(pageData.links, target.url, target.depth);
      
      // Update crawl status to completed
      await this.db.query(
        'UPDATE crawl_targets SET status = $1 WHERE url = $2',
        ['completed', target.url]
      );
      
      console.log(`✅ Successfully crawled: ${target.url} (saved ${optimization.spaceSavedBytes} bytes)`);
      
    } catch (error) {
      console.error(`❌ Error crawling ${target.url}:`, error.message);
      
      // Update error count and status
      await this.db.query(
        `UPDATE crawl_targets SET status = $1, error_count = error_count + 1, 
         metadata = metadata || jsonb_build_object('last_error', $2) WHERE url = $3`,
        ['error', error.message, target.url]
      );
      
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async extractPageData(page, url) {
    // Get comprehensive page data
    const pageData = await page.evaluate(() => {
      return {
        html: document.documentElement.outerHTML,
        title: document.title,
        url: window.location.href,
        links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: a.textContent.trim(),
          rel: a.rel
        })),
        scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
        stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
        images: Array.from(document.querySelectorAll('img[src]')).map(img => ({
          src: img.src,
          alt: img.alt,
          loading: img.loading
        })),
        meta: Array.from(document.querySelectorAll('meta')).map(m => ({
          name: m.name,
          property: m.property,
          content: m.content
        }))
      };
    });
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        responseTime: navigation.responseEnd - navigation.requestStart,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize
      };
    });
    
    pageData.performanceMetrics = performanceMetrics;
    return pageData;
  }

  async analyzeAndOptimizePage(page, pageData) {
    // Analyze DOM for optimization opportunities
    const domAnalysis = await page.evaluate(() => {
      // Count DOM elements
      const allElements = document.querySelectorAll('*');
      const unusedElements = [];
      const orphanedElements = [];
      
      // Detect unused CSS classes and IDs
      const usedClasses = new Set();
      const usedIds = new Set();
      const allClasses = new Set();
      const allIds = new Set();
      
      // Extract all classes and IDs
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.trim()) allClasses.add(cls.trim());
          });
        }
        if (el.id) allIds.add(el.id);
      });
      
      // Check which are actually used in CSS
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.selectorText) {
              // Simple class/ID detection
              const classMatches = rule.selectorText.match(/\.([\w-]+)/g);
              if (classMatches) {
                classMatches.forEach(cls => usedClasses.add(cls.substring(1)));
              }
              
              const idMatches = rule.selectorText.match(/#([\w-]+)/g);
              if (idMatches) {
                idMatches.forEach(id => usedIds.add(id.substring(1)));
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets might throw errors
        }
      });
      
      // Find unused elements (simplified)
      allElements.forEach(el => {
        if (!el.offsetParent && el.style.display !== 'none' && 
            el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
          orphanedElements.push({
            tag: el.tagName,
            id: el.id || null,
            classes: el.className ? el.className.split(' ') : [],
            size: el.outerHTML.length
          });
        }
      });
      
      return {
        totalElements: allElements.length,
        orphanedElements,
        unusedClasses: Array.from(allClasses).filter(cls => !usedClasses.has(cls)),
        unusedIds: Array.from(allIds).filter(id => !usedIds.has(id)),
        totalSize: document.documentElement.outerHTML.length
      };
    });
    
    // Convert to Light DOM
    const lightDOM = await this.lightDOMConverter.optimize(pageData.html, domAnalysis);
    
    // Calculate space savings
    const originalSize = pageData.html.length;
    const optimizedSize = lightDOM.optimizedHTML.length;
    const spaceSaved = originalSize - optimizedSize;
    
    return {
      originalDomHash: createHash('md5').update(pageData.html).digest('hex'),
      optimizedDomHash: createHash('md5').update(lightDOM.optimizedHTML).digest('hex'),
      originalSizeBytes: originalSize,
      optimizedSizeBytes: optimizedSize,
      spaceSavedBytes: spaceSaved,
      optimizationTypes: lightDOM.optimizationTypes,
      performanceMetrics: pageData.performanceMetrics,
      lightDomData: lightDOM,
      domAnalysis
    };
  }

  async storePageData(url, pageData, optimization, schemaData, backlinks) {
    // Store DOM optimization results
    await this.db.query(
      `INSERT INTO dom_optimizations 
       (url, original_dom_hash, optimized_dom_hash, original_size_bytes, optimized_size_bytes, 
        space_saved_bytes, optimization_types, performance_metrics, light_dom_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        url,
        optimization.originalDomHash,
        optimization.optimizedDomHash,
        optimization.originalSizeBytes,
        optimization.optimizedSizeBytes,
        optimization.spaceSavedBytes,
        optimization.optimizationTypes,
        JSON.stringify(optimization.performanceMetrics),
        JSON.stringify(optimization.lightDomData)
      ]
    );
    
    // Store schema.org data
    for (const schema of schemaData) {
      await this.db.query(
        'INSERT INTO schema_data (url, schema_type, schema_data, confidence_score) VALUES ($1, $2, $3, $4)',
        [url, schema.type, JSON.stringify(schema.data), schema.confidence]
      );
    }
    
    // Store backlink network data
    for (const backlink of backlinks) {
      await this.db.query(
        `INSERT INTO backlink_network (source_url, target_url, anchor_text, link_type, context_data, link_strength) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [
          url,
          backlink.targetUrl,
          backlink.anchorText,
          backlink.linkType,
          JSON.stringify(backlink.context),
          backlink.strength
        ]
      );
    }
    
    // Update site analysis
    const domain = new URL(url).hostname;
    await this.updateSiteAnalysis(domain, optimization);
  }

  async updateSiteAnalysis(domain, optimization) {
    await this.db.query(
      `INSERT INTO site_analysis (domain, biome_type, total_pages_discovered, total_space_harvested, performance_score) 
       VALUES ($1, $2, 1, $3, $4)
       ON CONFLICT (domain) DO UPDATE SET 
         total_pages_discovered = site_analysis.total_pages_discovered + 1,
         total_space_harvested = site_analysis.total_space_harvested + $3,
         performance_score = (site_analysis.performance_score + $4) / 2,
         last_analyzed = NOW()`,
      [
        domain,
        this.classifyBiome(domain),
        optimization.spaceSavedBytes,
        this.calculatePerformanceScore(optimization.performanceMetrics)
      ]
    );
  }

  classifyBiome(domain) {
    // Simple biome classification based on domain patterns
    if (domain.includes('github') || domain.includes('dev') || domain.includes('api')) return 'digital';
    if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) return 'commercial';
    if (domain.includes('wiki') || domain.includes('edu') || domain.includes('doc')) return 'knowledge';
    if (domain.includes('tube') || domain.includes('stream') || domain.includes('media')) return 'entertainment';
    if (domain.includes('social') || domain.includes('book') || domain.includes('gram')) return 'social';
    if (domain.includes('community') || domain.includes('forum') || domain.includes('reddit')) return 'community';
    if (domain.includes('linkedin') || domain.includes('career') || domain.includes('job')) return 'professional';
    return 'experimental';
  }

  calculatePerformanceScore(metrics) {
    // Calculate performance score based on various metrics
    const loadScore = Math.max(0, 100 - (metrics.loadTime / 100));
    const sizeScore = Math.max(0, 100 - (metrics.transferSize / 10000));
    const responseScore = Math.max(0, 100 - (metrics.responseTime / 50));
    
    return (loadScore + sizeScore + responseScore) / 3;
  }

  async discoverNewUrls(links, sourceUrl, currentDepth) {
    if (currentDepth >= this.config.maxDepth) return;
    
    const sourceDomain = new URL(sourceUrl).hostname;
    const newUrls = [];
    
    for (const link of links.slice(0, 50)) { // Limit links per page
      try {
        const targetUrl = new URL(link.href, sourceUrl).toString();
        const targetDomain = new URL(targetUrl).hostname;
        
        // Focus on same domain or high-authority external domains
        if (targetDomain === sourceDomain || this.isHighAuthorityDomain(targetDomain)) {
          newUrls.push({
            url: targetUrl,
            domain: targetDomain,
            depth: currentDepth + 1,
            priority: targetDomain === sourceDomain ? 3 : 1
          });
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }
    
    // Add new URLs to crawl targets
    for (const urlData of newUrls) {
      await this.addCrawlTarget(
        urlData.url,
        urlData.domain,
        urlData.depth,
        urlData.priority
      );
    }
  }

  isHighAuthorityDomain(domain) {
    const highAuthority = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 'mozilla.org',
      'w3.org', 'google.com', 'microsoft.com', 'apple.com', 'amazon.com'
    ];
    return highAuthority.some(auth => domain.includes(auth));
  }

  async reloadCrawlQueue() {
    const targets = await this.db.query(
      `SELECT url, domain, crawl_depth, priority FROM crawl_targets 
       WHERE status = 'pending' AND error_count < 3 
       ORDER BY priority DESC, discovered_at ASC 
       LIMIT 100`
    );
    
    this.crawlQueue = targets.rows.map(row => ({
      url: row.url,
      domain: row.domain,
      depth: row.crawl_depth,
      priority: row.priority
    }));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCrawlStatistics() {
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_targets,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'error') as errors,
        SUM(space_saved_bytes) as total_space_saved
      FROM crawl_targets 
      LEFT JOIN dom_optimizations ON crawl_targets.url = dom_optimizations.url
    `);
    
    return stats.rows[0];
  }

  async shutdown() {
    console.log('🛑 Shutting down crawler system...');
    if (this.browser) {
      await this.browser.close();
    }
    await this.db.end();
    console.log('✅ Crawler system shutdown complete');
  }
}

// Schema.org Data Extractor
class SchemaOrgExtractor {
  async extractSchemas(html) {
    const $ = cheerio.load(html);
    const schemas = [];
    
    // Extract JSON-LD structured data
    $('script[type="application/ld+json"]').each((i, element) => {
      try {
        const jsonData = JSON.parse($(element).html());
        schemas.push({
          type: jsonData['@type'] || 'Unknown',
          data: jsonData,
          confidence: 0.9,
          source: 'json-ld'
        });
      } catch (error) {
        // Invalid JSON-LD
      }
    });
    
    // Extract microdata
    $('[itemscope]').each((i, element) => {
      const itemType = $(element).attr('itemtype');
      if (itemType) {
        const schema = this.extractMicrodata($(element));
        schemas.push({
          type: itemType.split('/').pop(),
          data: schema,
          confidence: 0.7,
          source: 'microdata'
        });
      }
    });
    
    // Extract RDFa
    $('[typeof]').each((i, element) => {
      const typeOf = $(element).attr('typeof');
      if (typeOf) {
        const schema = this.extractRDFa($(element));
        schemas.push({
          type: typeOf,
          data: schema,
          confidence: 0.6,
          source: 'rdfa'
        });
      }
    });
    
    return schemas;
  }
  
  extractMicrodata($element) {
    const data = {};
    
    $element.find('[itemprop]').each((i, prop) => {
      const $prop = cheerio.load(prop);
      const propName = $prop.attr('itemprop');
      let propValue = $prop.attr('content') || $prop.text().trim();
      
      if ($prop.attr('href')) propValue = $prop.attr('href');
      if ($prop.attr('src')) propValue = $prop.attr('src');
      
      data[propName] = propValue;
    });
    
    return data;
  }
  
  extractRDFa($element) {
    const data = {};
    
    $element.find('[property]').each((i, prop) => {
      const $prop = cheerio.load(prop);
      const propName = $prop.attr('property');
      let propValue = $prop.attr('content') || $prop.text().trim();
      
      data[propName] = propValue;
    });
    
    return data;
  }
}

// Backlink Network Analyzer
class BacklinkNetworkAnalyzer {
  async extractBacklinks(html, sourceUrl) {
    const $ = cheerio.load(html);
    const backlinks = [];
    const sourceDomain = new URL(sourceUrl).hostname;
    
    $('a[href]').each((i, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      try {
        const targetUrl = new URL(href, sourceUrl).toString();
        const targetDomain = new URL(targetUrl).hostname;
        const anchorText = $link.text().trim();
        const rel = $link.attr('rel') || '';
        
        const linkType = this.classifyLinkType(sourceDomain, targetDomain, rel);
        const context = this.extractLinkContext($link);
        const strength = this.calculateLinkStrength($link, context);
        
        backlinks.push({
          targetUrl,
          anchorText,
          linkType,
          context,
          strength
        });
        
      } catch (error) {
        // Invalid URL
      }
    });
    
    return backlinks;
  }
  
  classifyLinkType(sourceDomain, targetDomain, rel) {
    if (sourceDomain === targetDomain) return 'internal';
    if (rel.includes('nofollow')) return 'nofollow_external';
    if (rel.includes('sponsored')) return 'sponsored';
    if (rel.includes('ugc')) return 'ugc';
    return 'external';
  }
  
  extractLinkContext($link) {
    const parentTag = $link.parent().get(0).tagName.toLowerCase();
    const position = $link.index();
    const surroundingText = $link.parent().text().substring(0, 200);
    
    return {
      parentTag,
      position,
      surroundingText,
      hasTitle: !!$link.attr('title'),
      isImage: $link.find('img').length > 0
    };
  }
  
  calculateLinkStrength($link, context) {
    let strength = 1.0;
    
    // Boost for contextual links
    if (['p', 'article', 'main'].includes(context.parentTag)) strength += 0.5;
    
    // Reduce for navigation/footer links
    if (['nav', 'footer', 'sidebar'].includes(context.parentTag)) strength -= 0.3;
    
    // Boost for descriptive anchor text
    if ($link.text().trim().length > 10) strength += 0.2;
    
    // Reduce for generic anchor text
    if (['click here', 'read more', 'learn more'].includes($link.text().trim().toLowerCase())) {
      strength -= 0.4;
    }
    
    return Math.max(0.1, Math.min(2.0, strength));
  }
}

// Light DOM Converter
class LightDOMConverter {
  async optimize(html, domAnalysis) {
    const $ = cheerio.load(html);
    const optimizations = [];
    
    // Remove unused elements
    domAnalysis.orphanedElements.forEach(orphan => {
      if (orphan.id) {
        $(`#${orphan.id}`).remove();
        optimizations.push('removed_orphaned_by_id');
      }
    });
    
    // Remove unused classes
    domAnalysis.unusedClasses.forEach(unusedClass => {
      $('*').each((i, element) => {
        const $el = $(element);
        if ($el.hasClass(unusedClass)) {
          $el.removeClass(unusedClass);
        }
      });
    });
    
    if (domAnalysis.unusedClasses.length > 0) {
      optimizations.push('removed_unused_classes');
    }
    
    // Optimize images
    $('img').each((i, img) => {
      const $img = $(img);
      if (!$img.attr('loading')) {
        $img.attr('loading', 'lazy');
        optimizations.push('added_lazy_loading');
      }
      
      if (!$img.attr('alt')) {
        $img.attr('alt', '');
      }
    });
    
    // Remove empty elements
    $('*').each((i, element) => {
      const $el = $(element);
      if ($el.is(':empty') && !$el.is('img, br, hr, input, meta, link')) {
        $el.remove();
        optimizations.push('removed_empty_elements');
      }
    });
    
    // Minify inline styles and scripts
    $('style').each((i, style) => {
      const $style = $(style);
      const css = $style.html();
      const minified = css.replace(/\s+/g, ' ').replace(/;\s*}/g, '}').trim();
      $style.html(minified);
      optimizations.push('minified_inline_css');
    });
    
    // Remove comments
    $.root().find('*').contents().filter((i, node) => node.nodeType === 8).remove();
    optimizations.push('removed_comments');
    
    const optimizedHTML = $.html();
    
    return {
      optimizedHTML,
      optimizationTypes: [...new Set(optimizations)],
      compressionRatio: html.length / optimizedHTML.length,
      elementsRemoved: domAnalysis.orphanedElements.length,
      classesOptimized: domAnalysis.unusedClasses.length
    };
  }
}

// Blockchain Metaverse Integrator
class BlockchainMetaverseIntegrator {
  constructor(blockchainConfig) {
    this.config = blockchainConfig;
    // Integration with the metaverse smart contracts
  }
  
  async submitOptimization(url, optimization) {
    try {
      // Calculate metaverse impact
      const biome = this.classifyUrlBiome(url);
      const metaverseImpact = this.calculateMetaverseImpact(optimization.spaceSavedBytes, biome);
      
      // Submit to blockchain (mock implementation)
      const tx = {
        url,
        spaceSaved: optimization.spaceSavedBytes,
        biome,
        metaverseImpact,
        timestamp: Date.now()
      };
      
      console.log(`🚀 Submitting to blockchain: ${url} (${optimization.spaceSavedBytes} bytes saved)`);
      console.log(`🏞️ Metaverse Impact:`, metaverseImpact);
      
      return tx;
      
    } catch (error) {
      console.error('❌ Blockchain submission failed:', error);
    }
  }
  
  classifyUrlBiome(url) {
    const domain = new URL(url).hostname;
    if (domain.includes('github') || domain.includes('dev')) return 'digital';
    if (domain.includes('shop') || domain.includes('amazon')) return 'commercial';
    if (domain.includes('wiki') || domain.includes('edu')) return 'knowledge';
    return 'experimental';
  }
  
  calculateMetaverseImpact(spaceSaved, biome) {
    return {
      virtualLand: Math.floor(spaceSaved / 2000),
      aiNodes: Math.floor(spaceSaved / 5000),
      storageShards: Math.floor(spaceSaved / 1500),
      bridges: Math.floor(spaceSaved / 10000),
      biome
    };
  }
}

module.exports = {
  RealWebCrawlerSystem,
  SchemaOrgExtractor,
  BacklinkNetworkAnalyzer,
  LightDOMConverter,
  BlockchainMetaverseIntegrator
};

// Example usage
async function startRealWebHarvesting() {
  const crawler = new RealWebCrawlerSystem({
    postgres: {
      host: 'localhost',
      port: 5432,
      database: 'dom_space_harvester',
      user: 'postgres',
      password: 'your_password'
    },
    maxConcurrency: 5,
    requestDelay: 2000,
    maxDepth: 2,
    blockchain: {
      // Blockchain configuration
    }
  });
  
  await crawler.initialize();
  await crawler.startCrawling();
  
  const stats = await crawler.getCrawlStatistics();
  console.log('📊 Final Statistics:', stats);
  
  await crawler.shutdown();
}

// Uncomment to run
// startRealWebHarvesting();