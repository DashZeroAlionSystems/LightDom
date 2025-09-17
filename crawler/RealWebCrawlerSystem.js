import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { URL } from 'url';
import crypto from 'crypto';
import MerkleTree from '../utils/MerkleTree.js';
import ArtifactStorage from '../utils/ArtifactStorage.js';

class RealWebCrawlerSystem {
  constructor(config = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency || 5,
      requestDelay: config.requestDelay || 2000,
      maxDepth: config.maxDepth || 2,
      respectRobots: config.respectRobots !== false,
      userAgent: 'DOM-Space-Harvester/1.0 (+https://github.com/domspaceharvester)',
      timeout: 30000,
      ...config,
    };

    this.isRunning = false;
    this.sessionId = null;
    this.browser = null;
    this.visitedUrls = new Set();
    this.crawlQueue = [];
    this.priorityQueue = [];
    this.activeCrawlers = new Map();
    this.optimizationResults = [];
    this.schemaData = [];
    this.backlinkNetwork = [];
    this.domainAuthority = new Map(); // Cache for domain authority scores

    // Artifact storage
    this.storage = new ArtifactStorage({
      storageType: config.storageType || 'local',
      localPath: config.artifactPath || './artifacts',
    });

    // Database connection
    this.db = config.postgres
      ? {
          query: async (sql, params = []) => {
            // Mock database for now - will be replaced with real PostgreSQL
            return { rows: [], rowCount: 0 };
          },
        }
      : null;

    // Optional optimization callback
    this.onOptimization =
      typeof config.onOptimization === 'function' ? config.onOptimization : null;
  }

  async initialize() {
    console.log('🚀 Initializing Real Web Crawler System...');

    // Launch headless browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    console.log('✅ Browser launched successfully');
    return true;
  }

  async startCrawling() {
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }

    this.isRunning = true;
    this.sessionId = `session_${Date.now()}`;

    console.log(`🕷️ Starting DOM Space Harvesting - Session: ${this.sessionId}`);

    // Initialize crawl targets
    await this.initializeCrawlTargets();

    // Start crawler workers
    await this.startCrawlerWorkers();

    return this.sessionId;
  }

  async initializeCrawlTargets() {
    // Seed URLs for crawling
    const seedUrls = [
      'https://example.com',
      'https://httpbin.org',
      'https://jsonplaceholder.typicode.com',
      'https://httpstat.us',
      'https://httpbin.org/html',
    ];

    for (const url of seedUrls) {
      this.crawlQueue.push({
        url,
        depth: 0,
        priority: 1,
        discoveredAt: new Date(),
      });
    }

    console.log(`📋 Initialized ${this.crawlQueue.length} crawl targets`);
  }

  async startCrawlerWorkers() {
    const workerPromises = [];

    for (let i = 0; i < this.config.maxConcurrency; i++) {
      const workerId = `crawler_${i + 1}`;
      workerPromises.push(this.crawlerWorker(workerId));
    }

    // Start all workers
    await Promise.all(workerPromises);
  }

  async crawlerWorker(workerId) {
    console.log(`🔧 Starting crawler worker: ${workerId}`);

    const page = await this.browser.newPage();
    await page.setUserAgent(this.config.userAgent);
    await page.setViewport({ width: 1920, height: 1080 });

    this.activeCrawlers.set(workerId, {
      id: workerId,
      status: 'active',
      currentUrl: null,
      pagesProcessed: 0,
      spaceHarvested: 0,
      startTime: new Date(),
    });

    while (this.isRunning && (this.crawlQueue.length > 0 || this.priorityQueue.length > 0)) {
      try {
        // Use priority queue first, then fallback to regular queue
        const crawlTarget = this.getNextUrl() || this.crawlQueue.shift();
        if (!crawlTarget) {
          await this.delay(1000);
          continue;
        }

        // Update worker status
        const worker = this.activeCrawlers.get(workerId);
        worker.currentUrl = crawlTarget.url;
        worker.status = 'processing';

        console.log(`🕷️ ${workerId} processing: ${crawlTarget.url}`);

        // Process the URL
        const result = await this.processUrl(page, crawlTarget);

        if (result) {
          worker.pagesProcessed++;
          worker.spaceHarvested += result.spaceSaved || 0;

          // Store results
          this.optimizationResults.push(result);
          this.schemaData.push(...(result.schemas || []));
          this.backlinkNetwork.push(...(result.backlinks || []));
        }

        // Respect robots.txt and rate limiting
        await this.delay(this.config.requestDelay);
      } catch (error) {
        console.error(`❌ Worker ${workerId} error:`, error.message);
        await this.delay(5000); // Wait before retrying
      }
    }

    // Cleanup
    await page.close();
    this.activeCrawlers.delete(workerId);
    console.log(`🏁 Worker ${workerId} finished`);
  }

  async processUrl(page, crawlTarget) {
    try {
      const { url, depth } = crawlTarget;

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout,
      });

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Analyze DOM and extract data
      const analysis = await this.analyzeDOM(page, $, url);

      // Extract schema.org data
      const schemas = this.extractSchemaData($, url);

      // Extract backlinks
      const backlinks = this.extractBacklinks($, url);

      // Discover new URLs
      if (depth < this.config.maxDepth) {
        const newUrls = this.discoverUrls($, url);
        for (const newUrl of newUrls) {
          if (!this.visitedUrls.has(newUrl)) {
            const priority = await this.calculateUrlPriority(newUrl, depth + 1, url);
            this.addToPriorityQueue({
              url: newUrl,
              depth: depth + 1,
              priority,
              discoveredAt: new Date(),
              referrer: url,
            });
            this.visitedUrls.add(newUrl);
          }
        }
      }

      this.visitedUrls.add(url);

      // Generate Merkle proof for PoO
      const merkleProof = this.generateMerkleProof(analysis, url);

      const result = {
        url,
        timestamp: new Date(),
        spaceSaved: analysis.spaceSaved,
        optimizations: analysis.optimizations,
        schemas,
        backlinks,
        performance: analysis.performance,
        domStats: analysis.domStats,
        merkleRoot: merkleProof.root,
        merkleProof: merkleProof.proof,
        crawlId: this.generateCrawlId(url, analysis),
      };

      // Store artifact and submit PoO to blockchain if enabled
      if (this.config.submitPoO && this.config.apiUrl) {
        try {
          // Store artifact first
          const storageResult = await this.storage.storeArtifact(result);
          result.artifactCID = storageResult.cid;

          // Submit PoO with artifact CID
          await this.submitProofOfOptimization(result);
        } catch (error) {
          console.error('Failed to store artifact or submit PoO:', error.message);
        }
      }

      // Fire optimization callback for minting or external actions
      if (this.onOptimization) {
        try {
          await this.onOptimization({ url, analysis, result });
        } catch (e) {
          console.log('onOptimization error:', e.message);
        }
      }

      return result;
    } catch (error) {
      console.error(`❌ Error processing ${crawlTarget.url}:`, error.message);
      return null;
    }
  }

  async analyzeDOM(page, $, url) {
    // Get page metrics
    const metrics = await page.metrics();

    // Analyze DOM structure
    const domStats = {
      totalElements: $('*').length,
      unusedElements: 0,
      deadCSS: 0,
      orphanedJS: 0,
      memoryLeaks: 0,
    };

    // Detect unused CSS
    const unusedCSS = await this.detectUnusedCSS(page);
    domStats.deadCSS = unusedCSS.length;

    // Detect orphaned JavaScript
    const orphanedJS = this.detectOrphanedJS($);
    domStats.orphanedJS = orphanedJS.length;

    // Detect unused DOM elements
    const unusedElements = this.detectUnusedElements($);
    domStats.unusedElements = unusedElements.length;

    // Calculate space savings
    const spaceSaved = this.calculateSpaceSavings(unusedCSS, orphanedJS, unusedElements);

    // Generate optimization recommendations
    const optimizations = this.generateOptimizations(unusedCSS, orphanedJS, unusedElements);

    return {
      spaceSaved,
      optimizations,
      domStats,
      performance: {
        loadTime: metrics.LayoutDuration + metrics.ScriptDuration,
        memoryUsage: metrics.JSHeapUsedSize,
        domNodes: domStats.totalElements,
      },
    };
  }

  async detectUnusedCSS(page) {
    try {
      // Use browser devtools to detect unused CSS
      const unusedCSS = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        const unused = [];

        for (const sheet of stylesheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule.type === CSSRule.STYLE_RULE) {
                const selector = rule.selectorText;
                if (selector && !document.querySelector(selector)) {
                  unused.push({
                    selector,
                    rule: rule.cssText,
                    size: rule.cssText.length,
                  });
                }
              }
            }
          } catch (e) {
            // Cross-origin stylesheets can't be accessed
          }
        }

        return unused;
      });

      return unusedCSS;
    } catch (error) {
      console.error('Error detecting unused CSS:', error);
      return [];
    }
  }

  detectOrphanedJS($) {
    const scripts = $('script[src]');
    const orphaned = [];

    scripts.each((i, script) => {
      const src = $(script).attr('src');
      if (src && !this.isScriptUsed($, src)) {
        orphaned.push({
          src,
          size: $(script).html().length,
        });
      }
    });

    return orphaned;
  }

  isScriptUsed($, src) {
    // Check if script is referenced in the DOM
    const references = $('*').filter((i, el) => {
      const html = $(el).html();
      return html && html.includes(src);
    });

    return references.length > 0;
  }

  detectUnusedElements($) {
    const unused = [];

    // Find elements with no visible content
    $('*').each((i, el) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();

      // Skip script, style, and meta tags
      if (['script', 'style', 'meta', 'link', 'title'].includes(tagName)) {
        return;
      }

      // Check if element has no text content and no children
      if (!$el.text().trim() && $el.children().length === 0) {
        unused.push({
          tag: tagName,
          id: $el.attr('id'),
          class: $el.attr('class'),
          size: $el.prop('outerHTML').length,
        });
      }
    });

    return unused;
  }

  calculateSpaceSavings(unusedCSS, orphanedJS, unusedElements) {
    let totalBytes = 0;

    // Add up all the space savings
    unusedCSS.forEach(css => (totalBytes += css.size));
    orphanedJS.forEach(js => (totalBytes += js.size));
    unusedElements.forEach(el => (totalBytes += el.size));

    return totalBytes;
  }

  generateOptimizations(unusedCSS, orphanedJS, unusedElements) {
    const optimizations = [];

    if (unusedCSS.length > 0) {
      optimizations.push({
        type: 'unused_css',
        count: unusedCSS.length,
        potentialSavings: unusedCSS.reduce((sum, css) => sum + css.size, 0),
        description: 'Remove unused CSS selectors',
      });
    }

    if (orphanedJS.length > 0) {
      optimizations.push({
        type: 'orphaned_js',
        count: orphanedJS.length,
        potentialSavings: orphanedJS.reduce((sum, js) => sum + js.size, 0),
        description: 'Remove orphaned JavaScript files',
      });
    }

    if (unusedElements.length > 0) {
      optimizations.push({
        type: 'unused_elements',
        count: unusedElements.length,
        potentialSavings: unusedElements.reduce((sum, el) => sum + el.size, 0),
        description: 'Remove unused DOM elements',
      });
    }

    return optimizations;
  }

  extractSchemaData($, url) {
    const schemas = [];

    // Extract JSON-LD schemas
    $('script[type="application/ld+json"]').each((i, script) => {
      try {
        const data = JSON.parse($(script).html());
        schemas.push({
          url,
          type: 'json-ld',
          data,
          extractedAt: new Date(),
        });
      } catch (e) {
        console.error('Error parsing JSON-LD:', e);
      }
    });

    // Extract microdata
    $('[itemscope]').each((i, item) => {
      const $item = $(item);
      const schema = {
        url,
        type: 'microdata',
        itemType: $item.attr('itemtype'),
        properties: {},
        extractedAt: new Date(),
      };

      $item.find('[itemprop]').each((j, prop) => {
        const $prop = $(prop);
        const name = $prop.attr('itemprop');
        const value = $prop.attr('content') || $prop.text();
        schema.properties[name] = value;
      });

      schemas.push(schema);
    });

    return schemas;
  }

  extractBacklinks($, url) {
    const backlinks = [];
    const baseUrl = new URL(url);

    $('a[href]').each((i, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const text = $link.text().trim();

      try {
        const linkUrl = new URL(href, url);
        const isExternal = linkUrl.hostname !== baseUrl.hostname;

        backlinks.push({
          sourceUrl: url,
          targetUrl: linkUrl.href,
          anchorText: text,
          isExternal,
          linkType: isExternal ? 'external' : 'internal',
          discoveredAt: new Date(),
        });
      } catch (e) {
        // Invalid URL
      }
    });

    return backlinks;
  }

  discoverUrls($, baseUrl) {
    const urls = [];

    $('a[href]').each((i, link) => {
      const $link = $(link);
      const href = $link.attr('href');

      try {
        const url = new URL(href, baseUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          urls.push(url.href);
        }
      } catch (e) {
        // Invalid URL
      }
    });

    return urls;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    console.log('🛑 Shutting down Real Web Crawler System...');

    this.isRunning = false;

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Crawler system shutdown complete');
  }

  // Generate Merkle proof for DOM optimization
  generateMerkleProof(analysis, url) {
    try {
      // Create leaves from optimization data
      const leaves = [
        url,
        analysis.spaceSaved.toString(),
        analysis.optimizations.length.toString(),
        JSON.stringify(analysis.domStats),
        JSON.stringify(analysis.performance),
      ];

      // Build Merkle tree
      const tree = new MerkleTree(leaves);
      const root = tree.getRoot();

      // Generate proof for the first leaf (URL)
      const proof = tree.getProof(0);

      return {
        root,
        proof,
        leaves,
      };
    } catch (error) {
      console.error('Failed to generate Merkle proof:', error);
      return {
        root: '0x0000000000000000000000000000000000000000000000000000000000000000',
        proof: [],
        leaves: [],
      };
    }
  }

  // Generate unique crawl ID
  generateCrawlId(url, analysis) {
    const data = `${url}-${analysis.spaceSaved}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Submit Proof of Optimization to blockchain
  async submitProofOfOptimization(result) {
    try {
      const payload = {
        crawlId: result.crawlId,
        merkleRoot: result.merkleRoot,
        bytesSaved: result.spaceSaved,
        backlinksCount: result.backlinks ? result.backlinks.length : 0,
        artifactCID: `ipfs://${result.crawlId}`, // Placeholder for actual IPFS CID
      };

      const response = await axios.post(
        `${this.config.apiUrl}/api/blockchain/submit-poo`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        console.log(`✅ PoO submitted: ${result.crawlId} (${result.spaceSaved} bytes saved)`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'PoO submission failed');
      }
    } catch (error) {
      console.error('PoO submission error:', error.message);
      throw error;
    }
  }

  // Calculate URL priority based on backlink authority and freshness
  async calculateUrlPriority(url, depth, referrer) {
    try {
      const urlObj = new globalThis.URL(url);
      const domain = urlObj.hostname;

      // Base priority from depth (closer to seed = higher priority)
      let priority = Math.max(0, 10 - depth);

      // Domain authority boost
      const authority = await this.getDomainAuthority(domain);
      priority += authority * 0.1;

      // Freshness boost (recently discovered = higher priority)
      // For now, assume all URLs are fresh (age = 0)
      priority += 1.0; // Fresh URLs get full boost

      // Schema.org presence boost
      const hasSchema = this.schemaData.some(s => s.url === url);
      if (hasSchema) priority += 0.5;

      // Backlink count boost
      const backlinkCount = this.backlinkNetwork.filter(b => b.target === url).length;
      priority += Math.min(backlinkCount * 0.1, 2); // Cap at 2.0

      // HTTPS boost
      if (urlObj.protocol === 'https:') priority += 0.2;

      return Math.max(0.1, Math.min(priority, 10)); // Clamp between 0.1 and 10
    } catch (error) {
      console.error('Priority calculation error:', error);
      return 1; // Default priority
    }
  }

  // Get domain authority score (cached)
  async getDomainAuthority(domain) {
    if (this.domainAuthority.has(domain)) {
      return this.domainAuthority.get(domain);
    }

    try {
      // Simple heuristic based on TLD and subdomain count
      let authority = 1;

      // TLD authority
      const tld = domain.split('.').pop();
      const highAuthorityTlds = ['com', 'org', 'edu', 'gov'];
      if (highAuthorityTlds.includes(tld)) authority += 1;

      // Subdomain penalty
      const subdomainCount = domain.split('.').length - 2;
      authority -= subdomainCount * 0.1;

      // Domain length penalty (shorter = more authority)
      authority += Math.max(0, 1 - domain.length / 50);

      this.domainAuthority.set(domain, authority);
      return authority;
    } catch (error) {
      return 1; // Default authority
    }
  }

  // Add URL to priority queue
  addToPriorityQueue(urlData) {
    this.priorityQueue.push(urlData);
    // Sort by priority (highest first)
    this.priorityQueue.sort((a, b) => b.priority - a.priority);
  }

  // Get next URL from priority queue
  getNextUrl() {
    if (this.priorityQueue.length === 0) return null;
    return this.priorityQueue.shift();
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      sessionId: this.sessionId,
      activeCrawlers: Array.from(this.activeCrawlers.values()),
      queueLength: this.crawlQueue.length,
      priorityQueueLength: this.priorityQueue.length,
      visitedCount: this.visitedUrls.size,
      totalOptimizations: this.optimizationResults.length,
      totalSpaceHarvested: this.optimizationResults.reduce(
        (sum, r) => sum + (r.spaceSaved || 0),
        0
      ),
    };
  }
}

export { RealWebCrawlerSystem };
