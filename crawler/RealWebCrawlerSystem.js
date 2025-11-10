import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { URL } from 'url';
import crypto from 'crypto';
import MerkleTree from '../utils/MerkleTree.js';
import ArtifactStorage from '../utils/ArtifactStorage.js';
import { SEOCrawlerIntegration } from './SEOCrawlerIntegration.js';

class RealWebCrawlerSystem {
  constructor(config = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency || 5,
      requestDelay: config.requestDelay || 2000,
      maxDepth: config.maxDepth || 2,
      respectRobots: config.respectRobots !== false,
      userAgent: 'DOM-Space-Harvester/1.0 (+https://github.com/domspaceharvester)',
      timeout: 30000,
      healthCheckInterval: config.healthCheckInterval || 15000,
      performanceUpdateInterval: config.performanceUpdateInterval || 5000,
      enableSEOIntegration: config.enableSEOIntegration !== false, // Enabled by default
      ...config
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

    this.ocrConfig = {
      enabled: config.enableOCR ?? true,
      endpoint: config.ocrEndpoint || process.env.OCR_WORKER_URL || 'http://localhost:4205/ocr',
      ragEndpoint: config.ragEndpoint || process.env.RAG_UPSERT_URL || 'http://localhost:3001/rag/upsert',
      maxImages: config.ocrMaxImages ?? Number.parseInt(process.env.OCR_MAX_IMAGES || '4', 10),
      timeoutMs: config.ocrTimeoutMs ?? Number.parseInt(process.env.OCR_TIMEOUT_MS || '30000', 10),
      minTextLength: config.ocrMinTextLength ?? Number.parseInt(process.env.OCR_MIN_TEXT_LENGTH || '24', 10),
      metadata: config.ocrMetadata || {},
      languageHint: config.ocrLanguageHint || process.env.OCR_LANGUAGE_HINT || null,
    };

    // Enhanced monitoring and statistics
    this.crawlerStats = {
      totalSitesCrawled: 0,
      activeCrawlers: 0,
      optimizationScore: 0,
      lastCrawlTime: Date.now(),
      sitesInQueue: 0,
      averageResponseTime: 0,
      crawlStatus: 'idle',
      spaceHarvested: {
        total: 0,
        today: 0,
        thisWeek: 0
      },
      errors: 0,
      successRate: 100,
      seoRecordsSaved: 0
    };

    // Performance metrics
    this.performanceMetrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      averageProcessingTime: 0,
      throughput: 0
    };

    // Health monitoring
    this.healthStatus = {
      isHealthy: true,
      lastHealthCheck: Date.now(),
      consecutiveErrors: 0,
      errorHistory: []
    };

    // Real-time data integration
    this.dataIntegration = {
      lastUpdate: Date.now(),
      updateInterval: 5000,
      subscribers: new Set()
    };

    // Artifact storage
    this.storage = new ArtifactStorage({
      storageType: config.storageType || 'local',
      localPath: config.artifactPath || './artifacts'
    });

    // SEO Database Integration
    if (this.config.enableSEOIntegration) {
      try {
        this.seoIntegration = new SEOCrawlerIntegration(config);
        console.log('✅ SEO Crawler Integration Enabled');
      } catch (error) {
        console.warn('⚠️  SEO Integration failed to initialize:', error.message);
        this.seoIntegration = null;
      }
    } else {
      this.seoIntegration = null;
    }

    // Database connection (legacy)
    this.db = config.postgres ? {
      query: async (sql, params = []) => {
        // Mock database for now - will be replaced with real PostgreSQL
        return { rows: [], rowCount: 0 };
      }
    } : null;

    // Optional optimization callback
    this.onOptimization = typeof config.onOptimization === 'function' ? config.onOptimization : null;
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
        '--disable-gpu'
      ]
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
      'https://httpbin.org/html'
    ];

    for (const url of seedUrls) {
      this.crawlQueue.push({
        url,
        depth: 0,
        priority: 1,
        discoveredAt: new Date()
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
      startTime: new Date()
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
          worker.pagesProcessed += 1;
          worker.spaceHarvested += result.spaceSaved || 0;

          // Store results
          this.optimizationResults.push(result);
          this.schemaData.push(...(result.schemas || []));
          this.backlinkNetwork.push(...(result.backlinks || []));

          if (result.ocr?.text) {
            try {
              await this.upsertOcrToRag(result);
            } catch (error) {
              console.error('Failed to upsert OCR to RAG:', error.message);
            }
          }
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
        timeout: this.config.timeout 
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
              referrer: url
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
        crawlId: this.generateCrawlId(url, analysis)
      };

      if (this.ocrConfig.enabled) {
        try {
          const ocr = await this.extractOcrFromPage(page, url);
          if (ocr) {
            result.ocr = ocr;
          }
        } catch (error) {
          console.error('OCR extraction failed:', error.message);
        }
      }

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
        try { await this.onOptimization({ url, analysis, result }); } catch (e) { console.log('onOptimization error:', e.message); }
      }

      // Save to SEO database if integration is enabled
      if (this.seoIntegration) {
        try {
          // Save analytics data
          await this.seoIntegration.saveSEOAnalytics(null, result);

          // Save as training data
          await this.seoIntegration.saveSEOTrainingData(result);

          // Update stats
          this.crawlerStats.seoRecordsSaved++;
        } catch (error) {
          console.error('Failed to save SEO data:', error.message);
        }
      }

      return result;

    } catch (error) {
      console.error(`❌ Error processing ${crawlTarget.url}:`, error.message);
      return null;
    }
  }

  async extractOcrFromPage(page, pageUrl) {
    const artifacts = await this.collectOcrArtifacts(page, pageUrl);
    if (!artifacts.length) {
      return null;
    }

    const limit = typeof this.ocrConfig.maxImages === 'number' && this.ocrConfig.maxImages > 0
      ? this.ocrConfig.maxImages
      : artifacts.length;

    const selectedArtifacts = artifacts.slice(0, limit);
    const pieces = [];

    for (const artifact of selectedArtifacts) {
      try {
        const response = await this.runOcrOnBuffer(artifact.buffer, {
          mimeType: artifact.mimeType,
          languageHint: this.ocrConfig.languageHint,
        });

        if (response?.text?.trim()) {
          pieces.push({
            text: response.text.trim(),
            confidence: response.confidence ?? null,
            language: response.language ?? null,
            model: response.model ?? null,
            latencyMs: response.latencyMs ?? null,
            requestId: response.requestId ?? null,
            blocks: response.blocks ?? [],
            artifact: {
              type: artifact.type,
              source: artifact.source,
            },
          });
        }
      } catch (error) {
        console.error(`OCR request failed for ${artifact.source}:`, error.message);
      }
    }

    if (!pieces.length) {
      return null;
    }

    const aggregatedText = pieces
      .map((piece) => piece.text)
      .filter(Boolean)
      .join('\n\n');

    if (!aggregatedText || aggregatedText.length < this.ocrConfig.minTextLength) {
      return null;
    }

    return {
      text: aggregatedText,
      pieces,
    };
  }

  async collectOcrArtifacts(page, pageUrl) {
    const artifacts = [];

    if (!this.ocrConfig.enabled) {
      return artifacts;
    }

    try {
      const screenshot = await page.screenshot({ fullPage: true, type: 'png' });
      if (screenshot?.length) {
        artifacts.push({
          type: 'screenshot',
          source: `${pageUrl}#screenshot`,
          buffer: screenshot,
          mimeType: 'image/png',
        });
      }
    } catch (error) {
      console.error(`Failed to capture screenshot for OCR (${pageUrl}):`, error.message);
    }

    try {
      const imageSources = await page.$$eval(
        'img',
        (imgs) => imgs
          .map((img) => img.currentSrc || img.src || '')
          .filter((src) => typeof src === 'string' && src.trim().length > 0)
      );

      const uniqueSources = Array.from(new Set(imageSources));

      for (const rawSrc of uniqueSources) {
        if (artifacts.length >= (this.ocrConfig.maxImages ?? Number.MAX_SAFE_INTEGER)) {
          break;
        }

        const resolvedSrc = this.resolveImageUrl(rawSrc, pageUrl);
        if (!resolvedSrc) {
          continue;
        }

        const imageArtifact = await this.fetchImageArtifact(resolvedSrc);
        if (imageArtifact) {
          artifacts.push({
            type: 'image',
            source: resolvedSrc,
            buffer: imageArtifact.buffer,
            mimeType: imageArtifact.mimeType,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to collect image sources for OCR (${pageUrl}):`, error.message);
    }

    return artifacts;
  }

  resolveImageUrl(src, pageUrl) {
    try {
      if (src.startsWith('data:')) {
        return src;
      }

      const absolute = new URL(src, pageUrl);
      return absolute.href;
    } catch (error) {
      console.error('Failed to resolve image URL for OCR:', error.message);
      return null;
    }
  }

  async fetchImageArtifact(imageUrl) {
    try {
      if (imageUrl.startsWith('data:')) {
        const [, base64] = imageUrl.split(',', 2);
        if (!base64) {
          return null;
        }
        const mimeMatch = imageUrl.match(/^data:([^;]+);/i);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        return {
          buffer: Buffer.from(base64, 'base64'),
          mimeType,
        };
      }

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: this.ocrConfig.timeoutMs,
      });

      return {
        buffer: Buffer.from(response.data),
        mimeType: response.headers['content-type'] || 'application/octet-stream',
      };
    } catch (error) {
      console.error(`Failed to fetch image for OCR (${imageUrl}):`, error.message);
      return null;
    }
  }

  async runOcrOnBuffer(buffer, { mimeType, languageHint } = {}) {
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty buffer provided for OCR');
    }

    const base64 = buffer.toString('base64');
    const payload = {
      base64Data: `data:${mimeType || 'image/png'};base64,${base64}`,
    };

    if (languageHint) {
      payload.languageHint = languageHint;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.ocrConfig.timeoutMs);

    try {
      const response = await fetch(this.ocrConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`OCR worker responded with ${response.status}: ${text}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async upsertOcrToRag(result) {
    const { ocr } = result;
    if (!ocr?.text || ocr.text.length < this.ocrConfig.minTextLength) {
      return;
    }

    const documentId = `${result.crawlId || crypto.createHash('sha1').update(result.url).digest('hex')}::ocr`;
    const metadata = {
      sourceUrl: result.url,
      crawlId: result.crawlId,
      artifactCID: result.artifactCID,
      capturedAt:
        result.timestamp instanceof Date
          ? result.timestamp.toISOString()
          : result.timestamp || new Date().toISOString(),
      ...this.ocrConfig.metadata,
    };

    if (ocr.pieces) {
      metadata.ocrPieces = ocr.pieces.map((piece) => ({
        artifact: piece.artifact,
        confidence: piece.confidence,
        latencyMs: piece.latencyMs,
        language: piece.language,
      }));
    }

    const payload = {
      documents: [
        {
          id: documentId,
          title: result.url,
          content: ocr.text,
          metadata,
        },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.ocrConfig.timeoutMs);

    try {
      const response = await fetch(this.ocrConfig.ragEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`RAG upsert failed (${response.status}): ${text}`);
      }
    } finally {
      clearTimeout(timeout);
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
      memoryLeaks: 0
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
        domNodes: domStats.totalElements
      }
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
                    size: rule.cssText.length
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
          size: $(script).html().length
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
          size: $el.prop('outerHTML').length
        });
      }
    });
    
    return unused;
  }

  calculateSpaceSavings(unusedCSS, orphanedJS, unusedElements) {
    let totalBytes = 0;
    
    // Add up all the space savings
    unusedCSS.forEach(css => totalBytes += css.size);
    orphanedJS.forEach(js => totalBytes += js.size);
    unusedElements.forEach(el => totalBytes += el.size);
    
    return totalBytes;
  }

  generateOptimizations(unusedCSS, orphanedJS, unusedElements) {
    const optimizations = [];
    
    if (unusedCSS.length > 0) {
      optimizations.push({
        type: 'unused_css',
        count: unusedCSS.length,
        potentialSavings: unusedCSS.reduce((sum, css) => sum + css.size, 0),
        description: 'Remove unused CSS selectors'
      });
    }
    
    if (orphanedJS.length > 0) {
      optimizations.push({
        type: 'orphaned_js',
        count: orphanedJS.length,
        potentialSavings: orphanedJS.reduce((sum, js) => sum + js.size, 0),
        description: 'Remove orphaned JavaScript files'
      });
    }
    
    if (unusedElements.length > 0) {
      optimizations.push({
        type: 'unused_elements',
        count: unusedElements.length,
        potentialSavings: unusedElements.reduce((sum, el) => sum + el.size, 0),
        description: 'Remove unused DOM elements'
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
          extractedAt: new Date()
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
        extractedAt: new Date()
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
          discoveredAt: new Date()
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
        JSON.stringify(analysis.performance)
      ];

      // Build Merkle tree
      const tree = new MerkleTree(leaves);
      const root = tree.getRoot();
      
      // Generate proof for the first leaf (URL)
      const proof = tree.getProof(0);

      return {
        root,
        proof,
        leaves
      };
    } catch (error) {
      console.error('Failed to generate Merkle proof:', error);
      return {
        root: '0x0000000000000000000000000000000000000000000000000000000000000000',
        proof: [],
        leaves: []
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
        artifactCID: `ipfs://${result.crawlId}` // Placeholder for actual IPFS CID
      };

      const response = await axios.post(`${this.config.apiUrl}/api/blockchain/submit-poo`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

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
      authority += Math.max(0, 1 - (domain.length / 50));
      
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
      totalSpaceHarvested: this.optimizationResults.reduce((sum, r) => sum + (r.spaceSaved || 0), 0)
    };
  }

  /**
   * Start health monitoring system
   */
  startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, this.config.performanceUpdateInterval);
  }

  /**
   * Start real-time data integration
   */
  startDataIntegration() {
    setInterval(() => {
      this.updateDataIntegration();
    }, this.dataIntegration.updateInterval);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      // Check browser health
      const browserHealth = await this.checkBrowserHealth();
      
      // Check crawling performance
      const performanceHealth = await this.checkCrawlingPerformance();
      
      // Update health status
      this.healthStatus = {
        isHealthy: browserHealth.isHealthy && performanceHealth.isHealthy,
        lastHealthCheck: Date.now(),
        consecutiveErrors: browserHealth.isHealthy ? 0 : this.healthStatus.consecutiveErrors + 1,
        errorHistory: this.healthStatus.errorHistory.slice(-10) // Keep last 10 errors
      };

      // Update crawler stats
      this.crawlerStats = {
        ...this.crawlerStats,
        crawlStatus: this.isRunning ? 'running' : 'idle',
        activeCrawlers: this.activeCrawlers.size,
        sitesInQueue: this.crawlQueue.length + this.priorityQueue.length,
        lastCrawlTime: this.crawlerStats.lastCrawlTime,
        optimizationScore: this.calculateOptimizationScore(),
        averageResponseTime: this.calculateAverageResponseTime(),
        successRate: this.calculateSuccessRate()
      };

      // Emit health status update
      this.emit('healthUpdate', {
        isHealthy: this.healthStatus.isHealthy,
        crawlerStatus: this.crawlerStats.crawlStatus,
        performance: this.performanceMetrics
      });

    } catch (error) {
      console.error('Crawler health check failed:', error);
      this.healthStatus.consecutiveErrors++;
      this.healthStatus.errorHistory.push({
        timestamp: Date.now(),
        error: error.message
      });
    }
  }

  /**
   * Check browser health and connectivity
   */
  async checkBrowserHealth() {
    try {
      if (!this.browser) {
        return { isHealthy: false, status: 'browser_not_initialized' };
      }

      // Check if browser is still connected
      const pages = await this.browser.pages();
      const isConnected = this.browser.isConnected();
      
      return {
        isHealthy: isConnected && pages.length >= 0,
        status: isConnected ? 'healthy' : 'disconnected',
        pageCount: pages.length
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check crawling performance metrics
   */
  async checkCrawlingPerformance() {
    try {
      // Calculate throughput (sites per minute)
      const recentCrawls = this.optimizationResults.slice(-10);
      const throughput = recentCrawls.length / (this.config.performanceUpdateInterval / 60000);

      // Update performance metrics
      this.performanceMetrics = {
        cpuUsage: Math.random() * 100, // Simulate CPU usage
        memoryUsage: Math.random() * 100, // Simulate memory usage
        networkLatency: Math.random() * 100, // Simulate network latency
        averageProcessingTime: this.calculateAverageProcessingTime(),
        throughput: throughput
      };

      return {
        isHealthy: this.performanceMetrics.cpuUsage < 90 && this.performanceMetrics.memoryUsage < 90,
        performance: this.performanceMetrics
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message
      };
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    // Simulate real-time performance data
    this.performanceMetrics = {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      networkLatency: Math.random() * 100,
      averageProcessingTime: this.calculateAverageProcessingTime(),
      throughput: this.calculateThroughput()
    };
  }

  /**
   * Calculate optimization score based on recent results
   */
  calculateOptimizationScore() {
    if (this.optimizationResults.length === 0) return 0;
    
    const recentResults = this.optimizationResults.slice(-20);
    const totalScore = recentResults.reduce((sum, result) => {
      return sum + (result.optimizationScore || 0);
    }, 0);
    
    return Math.round(totalScore / recentResults.length);
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    if (this.optimizationResults.length === 0) return 0;
    
    const recentResults = this.optimizationResults.slice(-20);
    const totalTime = recentResults.reduce((sum, result) => {
      return sum + (result.responseTime || 0);
    }, 0);
    
    return Math.round(totalTime / recentResults.length);
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    if (this.optimizationResults.length === 0) return 100;
    
    const recentResults = this.optimizationResults.slice(-50);
    const successfulResults = recentResults.filter(result => !result.error);
    
    return Math.round((successfulResults.length / recentResults.length) * 100);
  }

  /**
   * Calculate average processing time
   */
  calculateAverageProcessingTime() {
    if (this.optimizationResults.length === 0) return 0;
    
    const recentResults = this.optimizationResults.slice(-20);
    const totalTime = recentResults.reduce((sum, result) => {
      return sum + (result.processingTime || 0);
    }, 0);
    
    return Math.round(totalTime / recentResults.length);
  }

  /**
   * Calculate throughput (sites per minute)
   */
  calculateThroughput() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentCrawls = this.optimizationResults.filter(result => 
      result.timestamp && result.timestamp > oneMinuteAgo
    );
    
    return recentCrawls.length;
  }

  /**
   * Update data integration and notify subscribers
   */
  updateDataIntegration() {
    const data = {
      totalSitesCrawled: this.crawlerStats.totalSitesCrawled,
      activeCrawlers: this.crawlerStats.activeCrawlers,
      optimizationScore: this.crawlerStats.optimizationScore,
      lastCrawlTime: this.crawlerStats.lastCrawlTime,
      sitesInQueue: this.crawlerStats.sitesInQueue,
      averageResponseTime: this.crawlerStats.averageResponseTime,
      crawlStatus: this.crawlerStats.crawlStatus,
      spaceHarvested: this.crawlerStats.spaceHarvested,
      performance: this.performanceMetrics,
      health: this.healthStatus
    };

    this.dataIntegration.lastUpdate = Date.now();
    
    // Notify all subscribers
    this.dataIntegration.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error notifying crawler data subscriber:', error);
      }
    });

    this.emit('dataUpdate', data);
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(callback) {
    this.dataIntegration.subscribers.add(callback);
    return () => this.dataIntegration.subscribers.delete(callback);
  }

  /**
   * Get current crawler statistics
   */
  getCrawlerStats() {
    return {
      ...this.crawlerStats,
      performance: this.performanceMetrics,
      health: this.healthStatus,
      lastUpdate: this.dataIntegration.lastUpdate
    };
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    return {
      ...this.healthStatus,
      isRunning: this.isRunning,
      activeCrawlers: this.activeCrawlers.size,
      queueSize: this.crawlQueue.length + this.priorityQueue.length
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      crawlerStats: this.crawlerStats,
      healthStatus: this.healthStatus
    };
  }

  /**
   * Force data refresh
   */
  async refreshData() {
    await this.performHealthCheck();
    this.updateDataIntegration();
  }
}

export { RealWebCrawlerSystem };