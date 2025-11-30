// Enhanced Web Crawler Service for LightDom
// Automatically crawls websites and saves SEO data to database

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

import { computeSeoStats } from './lib/seo/seo-stat-catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedWebCrawlerService {
  constructor() {
    this.browser = null;
    this.crawledUrls = new Set();
    this.discoveredUrls = new Set();
    this.isRunning = false;
    this.crawlInterval = null;
    this.dataFile = path.join(__dirname, '.data', 'crawler-data.json');
    this.seedCrawlDelayMs = Number(process.env.CRAWLER_SEED_DELAY_MS || 1500);
    this.continuousCrawlIntervalMs = Number(process.env.CRAWLER_INTERVAL_MS || 10000);
    this.continuousCrawlDelayMs = Number(process.env.CRAWLER_CONTINUOUS_DELAY_MS || 1000);
    this.maxConcurrentPages = Math.max(1, Number(process.env.CRAWLER_MAX_CONCURRENCY || 1));
    this.activePages = 0;
    this.defaultSeedUrls = [
      'https://example.com',
      'https://httpbin.org',
      'https://jsonplaceholder.typicode.com',
      'https://www.google.com',
      'https://github.com',
      'https://stackoverflow.com',
      'https://www.wikipedia.org',
      'https://www.reddit.com',
      'https://www.youtube.com',
      'https://www.amazon.com',
    ];
    this.seedUrls = new Set(this.defaultSeedUrls);
    this.runtimeConfig = {
      seedServiceId: process.env.CRAWLER_SEEDER_ID || null,
      seedBatchSize: Number(process.env.CRAWLER_SEED_BATCH || 50),
      additionalSeeds: [],
      headless: process.env.CRAWLER_HEADLESS !== 'false',
      puppeteerArgs: (process.env.CRAWLER_PUPPETEER_ARGS || '')
        .split(',')
        .map(arg => arg.trim())
        .filter(Boolean),
      maxRawContentLength: Number(process.env.CRAWLER_MAX_RAW_CONTENT || 200000),
      performanceSampleSize: Number(process.env.CRAWLER_PERF_SAMPLE || 120),
      respectRobotsTxt: process.env.CRAWLER_RESPECT_ROBOTS !== 'false',
      maxConcurrentPages: this.maxConcurrentPages,
      metadataOnly: false,
    };

    // Database connection
    this.dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.crawledUrls = new Set(data.crawledUrls || []);
        this.discoveredUrls = new Set(data.discoveredUrls || []);
        this.seedUrls = new Set(data.seedUrls || this.defaultSeedUrls);
        console.log(
          `📁 Loaded ${this.crawledUrls.size} crawled URLs and ${this.discoveredUrls.size} discovered URLs`
        );
      }
    } catch (error) {
      console.error('❌ Error loading crawler data:', error.message);
    }
  }

  saveData() {
    try {
      const data = {
        crawledUrls: Array.from(this.crawledUrls),
        discoveredUrls: Array.from(this.discoveredUrls),
        seedUrls: Array.from(this.seedUrls),
        lastUpdate: new Date().toISOString(),
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error saving crawler data:', error.message);
    }
  }

  configure(config = {}) {
    if (!config || typeof config !== 'object') {
      return;
    }

    this.runtimeConfig = {
      ...this.runtimeConfig,
      ...config,
      puppeteerArgs: Array.isArray(config.puppeteerArgs)
        ? config.puppeteerArgs
        : typeof config.puppeteerArgs === 'string'
          ? config.puppeteerArgs
              .split(',')
              .map(arg => arg.trim())
              .filter(Boolean)
          : this.runtimeConfig.puppeteerArgs,
      additionalSeeds: Array.isArray(config.additionalSeeds)
        ? config.additionalSeeds
        : this.runtimeConfig.additionalSeeds,
      seedBatchSize: config.seedBatchSize
        ? Number(config.seedBatchSize)
        : this.runtimeConfig.seedBatchSize,
      maxRawContentLength: config.maxRawContentLength
        ? Number(config.maxRawContentLength)
        : this.runtimeConfig.maxRawContentLength,
      performanceSampleSize: config.performanceSampleSize
        ? Number(config.performanceSampleSize)
        : this.runtimeConfig.performanceSampleSize,
      maxConcurrentPages: config.maxConcurrentPages
        ? Math.max(1, Number(config.maxConcurrentPages))
        : this.runtimeConfig.maxConcurrentPages,
    };

    if (config.maxConcurrentPages) {
      this.maxConcurrentPages = this.runtimeConfig.maxConcurrentPages;
    }

    if (Array.isArray(config.seedUrls)) {
      config.seedUrls.forEach(url => this.seedUrls.add(url));
    }

    if (Array.isArray(this.runtimeConfig.additionalSeeds)) {
      this.runtimeConfig.additionalSeeds.forEach(url => this.seedUrls.add(url));
    }
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Web Crawler Service...');

      // Test database connection
      await this.testDatabaseConnection();

      const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        ...this.runtimeConfig.puppeteerArgs,
      ];

      this.browser = await puppeteer.launch({
        headless: this.runtimeConfig.headless !== false,
        args: launchArgs,
        ignoreHTTPSErrors: true,
      });
      console.log('✅ Enhanced Web Crawler Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize crawler:', error.message);
    }
  }

  async testDatabaseConnection() {
    try {
      const client = await this.dbPool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  generateSiteId(url) {
    try {
      return crypto.createHash('sha1').update(url).digest('hex');
    } catch {
      return `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }
  }

  async fetchSeedsFromSeeder(limit = this.runtimeConfig.seedBatchSize) {
    if (!this.runtimeConfig.seedServiceId) {
      return [];
    }

    const client = await this.dbPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT url, metadata
         FROM url_seeds
         WHERE seeder_service_id = $1
           AND status IN ('pending', 'processing')
         ORDER BY priority DESC, created_at ASC
         LIMIT $2`,
        [this.runtimeConfig.seedServiceId, limit]
      );

      const urls = rows.map(row => row.url);
      if (urls.length > 0) {
        await client.query(
          `UPDATE url_seeds
             SET status = 'processing', updated_at = NOW()
           WHERE seeder_service_id = $1
             AND url = ANY($2::text[])`,
          [this.runtimeConfig.seedServiceId, urls]
        );
      }

      return rows;
    } catch (error) {
      console.error('❌ Failed to fetch seeds from seeder service:', error.message);
      return [];
    } finally {
      client.release();
    }
  }

  async hydrateSeedsFromRuntime() {
    if (this.runtimeConfig.seedServiceId) {
      const seedRows = await this.fetchSeedsFromSeeder();
      seedRows.forEach(row => {
        if (row.url && !this.crawledUrls.has(row.url)) {
          this.seedUrls.add(row.url);
          this.discoveredUrls.add(row.url);
        }
      });
    }

    if (Array.isArray(this.runtimeConfig.additionalSeeds)) {
      this.runtimeConfig.additionalSeeds.forEach(url => {
        if (url && !this.crawledUrls.has(url)) {
          this.seedUrls.add(url);
          this.discoveredUrls.add(url);
        }
      });
    }
  }

  async markSeedStatus(url, status, errorMessage = null) {
    if (!this.runtimeConfig.seedServiceId || !url) {
      return;
    }

    const client = await this.dbPool.connect();
    try {
      await client.query(
        `UPDATE url_seeds
           SET status = $1,
               updated_at = NOW(),
               completed_at = CASE WHEN $1 IN ('completed','failed') THEN NOW() ELSE completed_at END,
               metadata = CASE WHEN $3 IS NOT NULL THEN metadata || jsonb_build_object('lastError', $3) ELSE metadata END
         WHERE seeder_service_id = $2
           AND url = $4`,
        [status, this.runtimeConfig.seedServiceId, errorMessage, url]
      );
    } catch (error) {
      console.error('❌ Failed to update seed status:', error.message);
    } finally {
      client.release();
    }
  }

  getDomainFromUrl(targetUrl) {
    try {
      return new URL(targetUrl).hostname;
    } catch (error) {
      const match = targetUrl?.match(/https?:\/\/([^\/]+)/);
      return match ? match[1] : 'unknown';
    }
  }

  async crawlUrl(url) {
    if (this.crawledUrls.has(url)) {
      return null;
    }

    // Ensure browser is initialized
    if (!this.browser) {
      console.log('⚠️  Browser not initialized, initializing now...');
      await this.initialize();
    }

    await this.waitForSlot();
    this.activePages += 1;
    let page;

    try {
      console.log(`🕷️  Crawling: ${url}`);
      page = await this.browser.newPage();

      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // Set timeout (increased for better reliability)
      await page.setDefaultTimeout(30000);

      // Navigate to URL with timeout handling
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
      } catch (navError) {
        if (navError.message.includes('Navigation timeout')) {
          console.warn(`⚠️  Navigation timeout for ${url}, continuing with basic page load...`);
          // Try with domcontentloaded instead
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } else {
          throw navError; // Re-throw non-timeout errors
        }
      }

      // Extract comprehensive SEO data
      const seoData = await page.evaluate(() => {
        const title = document.title || 'No Title';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
        const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
        const robots = document.querySelector('meta[name="robots"]')?.content || '';

        // Open Graph data
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
        const ogDescription =
          document.querySelector('meta[property="og:description"]')?.content || '';
        const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content || '';

        // Twitter Card data
        const twitterCard = document.querySelector('meta[name="twitter:card"]')?.content || '';
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content || '';
        const twitterDescription =
          document.querySelector('meta[name="twitter:description"]')?.content || '';
        const twitterImage = document.querySelector('meta[name="twitter:image"]')?.content || '';

        // Structured data
        const structuredData = [];
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          try {
            const jsonData = JSON.parse(script.textContent || '');
            structuredData.push(jsonData);
          } catch (error) {
            console.warn('Invalid JSON-LD:', error);
          }
        });

        // Breadcrumb extraction for schema planning
        const breadcrumbTrail = Array.from(
          document.querySelectorAll('nav[aria-label*="breadcrumb" i] a, nav.breadcrumb a')
        )
          .map(anchor => ({
            name: anchor.textContent?.trim() || '',
            url: anchor.href || '',
          }))
          .filter(item => item.name && item.url)
          .slice(0, 8);

        // Links analysis
        const links = Array.from(document.querySelectorAll('a[href]'))
          .slice(0, 200)
          .map(a => ({
            href: a.href,
            text: a.textContent?.trim() || '',
            title: a.title || '',
            rel: a.rel || '',
          }));

        // Images analysis
        const images = Array.from(document.querySelectorAll('img'))
          .slice(0, 80)
          .map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            width: img.width || 0,
            height: img.height || 0,
            loading: img.loading || 'eager',
          }));

        // Headings analysis
        const headings = {
          h1: Array.from(document.querySelectorAll('h1'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
          h2: Array.from(document.querySelectorAll('h2'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
          h3: Array.from(document.querySelectorAll('h3'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
          h4: Array.from(document.querySelectorAll('h4'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
          h5: Array.from(document.querySelectorAll('h5'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
          h6: Array.from(document.querySelectorAll('h6'))
            .map(h => h.textContent?.trim())
            .filter(Boolean),
        };

        const headingDetails = Array.from(document.querySelectorAll('h2, h3')).map(node => ({
          tag: node.tagName.toLowerCase(),
          text: node.textContent?.trim() || '',
          followingParagraph:
            node.nextElementSibling && node.nextElementSibling.tagName.toLowerCase() === 'p'
              ? node.nextElementSibling.textContent?.trim() || ''
              : '',
        }));

        // Content analysis
        const bodyText = document.body?.innerText || '';
        const cleanWords = bodyText.split(/\s+/).filter(Boolean);
        const wordCount = cleanWords.length;
        const paragraphCount = document.querySelectorAll('p').length;
        const textContent = bodyText.slice(0, 50000);

        // Performance metrics (basic)
        const scripts = document.querySelectorAll('script[src]').length;
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
        const inlineStyles = document.querySelectorAll('style').length;
        const inlineScripts = document.querySelectorAll('script:not([src])').length;

        const viewport = document.querySelector('meta[name="viewport"]')?.content || '';
        const htmlLang = document.documentElement?.lang || '';
        const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]').length;
        const author =
          document.querySelector('meta[name="author"]')?.content ||
          document.querySelector('meta[property="article:author"]')?.content ||
          '';
        const publishDate =
          document.querySelector('meta[property="article:published_time"]')?.content ||
          document.querySelector('time[datetime]')?.getAttribute('datetime') ||
          '';

        return {
          url: window.location.href,
          title,
          description,
          keywords,
          canonical,
          robots,
          viewport,
          htmlLang,
          hreflangs: hreflangLinks,
          author,
          publishDate,
          ogTitle,
          ogDescription,
          ogImage,
          ogUrl,
          twitterCard,
          twitterTitle,
          twitterDescription,
          twitterImage,
          structuredData,
          breadcrumbTrail,
          links,
          images,
          headings,
          headingDetails,
          wordCount,
          paragraphCount,
          scripts,
          stylesheets,
          inlineStyles,
          inlineScripts,
          content: textContent,
          timestamp: new Date().toISOString(),
        };
      });

      // Extract DOM structure info
      const domInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const tagCounts = {};
        elements.forEach(el => {
          const tag = el.tagName.toLowerCase();
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        return {
          totalElements: elements.length,
          tagCounts,
          domSize: document.documentElement.outerHTML.length,
          complexity: elements.length / 1000, // Simple complexity metric
        };
      });

      const devtoolsPayload = await page.evaluate(sampleSize => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] || null;
          const resources = performance
            .getEntriesByType('resource')
            .slice(0, sampleSize)
            .map(entry => ({
              name: entry.name,
              initiatorType: entry.initiatorType,
              transferSize: entry.transferSize,
              encodedBodySize: entry.encodedBodySize,
              decodedBodySize: entry.decodedBodySize,
              duration: entry.duration,
              startTime: entry.startTime,
            }));
          const paint = performance.getEntriesByType('paint').map(entry => ({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
          }));
          const timing = performance.timing ? { ...performance.timing } : null;
          return { navigation, resources, paint, timing };
        } catch (error) {
          return {
            navigation: null,
            resources: [],
            paint: [],
            error: error?.message || 'performance unavailable',
          };
        }
      }, this.runtimeConfig.performanceSampleSize);

      const metrics = await page.metrics().catch(() => null);
      const rawContent = this.runtimeConfig.metadataOnly ? null : await page.content();
      const trimmedContent =
        rawContent && rawContent.length > this.runtimeConfig.maxRawContentLength
          ? `${rawContent.slice(0, this.runtimeConfig.maxRawContentLength)}<!-- truncated -->`
          : rawContent;
      const contentHash = rawContent
        ? crypto.createHash('sha256').update(rawContent).digest('hex')
        : null;
      const resourceSummary = Array.isArray(devtoolsPayload?.resources)
        ? devtoolsPayload.resources.map(entry => ({
            name: entry.name,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            duration: entry.duration,
          }))
        : [];

      await page.close();
      page = null;

      // Calculate SEO score
      const seoScore = this.calculateSEOScore(seoData, domInfo);

      // Mark as crawled
      this.crawledUrls.add(url);

      // Add discovered links
      seoData.links.forEach(link => {
        if (this.isValidUrl(link.href) && !this.crawledUrls.has(link.href)) {
          this.discoveredUrls.add(link.href);
        }
      });

      const combinedDevtoolsPayload = {
        ...devtoolsPayload,
        metrics,
      };

      const seoStats = computeSeoStats({
        url,
        seoData,
        domInfo,
        devtoolsPayload: combinedDevtoolsPayload,
        resourceSummary,
        metrics,
        seoScore,
      });

      const result = {
        ...seoData,
        domInfo,
        seoScore,
        seoStats,
        status: 'success',
        rawContent: trimmedContent,
        contentHash,
        devtoolsPayload: combinedDevtoolsPayload,
        resourceSummary,
        schemaCandidates: seoData.structuredData || [],
      };

      // Save to database
      await this.saveToDatabase(result);
      await this.markSeedStatus(url, 'completed');

      console.log(
        `✅ Crawled: ${url} (${domInfo.totalElements} elements, ${domInfo.domSize} bytes, SEO Score: ${seoScore.overall})`
      );
      return result;
    } catch (error) {
      console.error(`❌ Failed to crawl ${url}:`, error.message);
      this.crawledUrls.add(url); // Mark as attempted
      await this.markSeedStatus(url, 'failed', error.message);

      // Don't save failed crawls to database, just log
      console.log(`⚠️  Skipping database save for failed crawl: ${url}`);

      return {
        url,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    } finally {
      if (page && !page.isClosed()) {
        try {
          await page.close();
        } catch {}
      }
      this.activePages = Math.max(0, this.activePages - 1);
    }
  }

  calculateSEOScore(seoData, domInfo) {
    let score = 0;
    let maxScore = 0;

    // Title optimization (20 points)
    maxScore += 20;
    if (seoData.title && seoData.title.length > 0) {
      score += 10;
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        score += 10;
      }
    }

    // Meta description (20 points)
    maxScore += 20;
    if (seoData.description && seoData.description.length > 0) {
      score += 10;
      if (seoData.description.length >= 120 && seoData.description.length <= 160) {
        score += 10;
      }
    }

    // Heading structure (15 points)
    maxScore += 15;
    if (seoData.headings.h1.length === 1) score += 5;
    if (seoData.headings.h1.length > 0) score += 5;
    if (seoData.headings.h2.length > 0) score += 5;

    // Content quality (15 points)
    maxScore += 15;
    if (seoData.wordCount > 300) score += 5;
    if (seoData.wordCount > 600) score += 5;
    if (seoData.paragraphCount > 3) score += 5;

    // Technical SEO (15 points)
    maxScore += 15;
    if (seoData.canonical) score += 5;
    if (seoData.robots && !seoData.robots.includes('noindex')) score += 5;
    if (seoData.structuredData.length > 0) score += 5;

    // Social media (10 points)
    maxScore += 10;
    if (seoData.ogTitle) score += 3;
    if (seoData.ogDescription) score += 3;
    if (seoData.ogImage) score += 2;
    if (seoData.twitterCard) score += 2;

    // Performance (5 points)
    maxScore += 5;
    if (domInfo.complexity < 2) score += 5;
    else if (domInfo.complexity < 5) score += 3;

    const overall = Math.round((score / maxScore) * 100);

    return {
      overall,
      title: Math.round(
        ((seoData.title
          ? seoData.title.length >= 30 && seoData.title.length <= 60
            ? 20
            : 10
          : 0) /
          20) *
          100
      ),
      description: Math.round(
        ((seoData.description
          ? seoData.description.length >= 120 && seoData.description.length <= 160
            ? 20
            : 10
          : 0) /
          20) *
          100
      ),
      headings: Math.round(
        ((seoData.headings.h1.length === 1 ? 15 : seoData.headings.h1.length > 0 ? 10 : 0) / 15) *
          100
      ),
      content: Math.round(
        ((seoData.wordCount > 600 ? 15 : seoData.wordCount > 300 ? 10 : 0) / 15) * 100
      ),
      technical: Math.round(
        (seoData.canonical ? 5 : 0) +
          (seoData.robots && !seoData.robots.includes('noindex') ? 5 : 0) +
          ((seoData.structuredData.length > 0 ? 5 : 0) / 15) * 100
      ),
      social: Math.round(
        (((seoData.ogTitle ? 3 : 0) +
          (seoData.ogDescription ? 3 : 0) +
          (seoData.ogImage ? 2 : 0) +
          (seoData.twitterCard ? 2 : 0)) /
          10) *
          100
      ),
      performance: Math.round(
        ((domInfo.complexity < 2 ? 5 : domInfo.complexity < 5 ? 3 : 0) / 5) * 100
      ),
    };
  }

  async saveToDatabase(crawlData) {
    try {
      console.log('💾 Attempting to save crawl data to database...');
      const client = await this.dbPool.connect();

      try {
        const siteId = this.generateSiteId(crawlData.url);
        const domain = this.getDomainFromUrl(crawlData.url);
        const metadataPayload = {
          title: crawlData.title,
          description: crawlData.description,
          keywords: crawlData.keywords,
          headings: crawlData.headings,
          headingDetails: crawlData.headingDetails,
          wordCount: crawlData.wordCount,
          paragraphCount: crawlData.paragraphCount,
          seoScore: crawlData.seoScore,
          domInfo: crawlData.domInfo,
          linksSample: (crawlData.links || []).slice(0, 25),
          imagesSample: (crawlData.images || []).slice(0, 25),
          socialMedia: {
            ogTitle: crawlData.ogTitle,
            ogDescription: crawlData.ogDescription,
            ogImage: crawlData.ogImage,
            twitterCard: crawlData.twitterCard,
            twitterTitle: crawlData.twitterTitle,
            twitterDescription: crawlData.twitterDescription,
          },
          seoStats: crawlData.seoStats,
          seoQualityScore: crawlData.seoStats?.qualityScore || null,
          schemaTypes: crawlData.seoStats?.schemaTypes || [],
          richSnippetTargets: crawlData.seoStats?.richSnippetTargets || [],
          breadcrumbTrail: crawlData.breadcrumbTrail || [],
          author: crawlData.author || null,
          publishDate: crawlData.publishDate || null,
          capturedAt: crawlData.timestamp,
        };

        const schemaCandidates = crawlData.schemaCandidates || crawlData.structuredData || [];
        const seoStatMetrics = crawlData.seoStats?.metrics || {};
        const featureVector = crawlData.seoStats?.featureVector || [];
        const featureNames = crawlData.seoStats?.featureNames || [];
        const featureVersion = crawlData.seoStats?.version || null;
        const seoQualityScore = crawlData.seoStats?.qualityScore || null;
        const schemaTypes = crawlData.seoStats?.schemaTypes || [];
        const richSnippetTargets = crawlData.seoStats?.richSnippetTargets || [];

        // Save to crawled_sites table (if it exists)
        await client.query(
          `
          INSERT INTO crawled_sites (
            id, url, domain, last_crawled, crawl_frequency, priority,
            seo_score, optimization_potential, current_size, optimized_size,
            space_reclaimed, blockchain_recorded, transaction_hash, 
            metaverse_slot_id, metadata, raw_content, content_hash,
            devtools_payload, resource_summary, schema_candidates, extraction_status,
            seo_stat_metrics, seo_feature_vector, seo_feature_names,
            seo_feature_version, seo_quality_score, schema_types, rich_snippet_targets
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
          ON CONFLICT (id) DO UPDATE SET
            last_crawled = EXCLUDED.last_crawled,
            crawl_frequency = EXCLUDED.crawl_frequency,
            priority = EXCLUDED.priority,
            seo_score = EXCLUDED.seo_score,
            optimization_potential = EXCLUDED.optimization_potential,
            current_size = EXCLUDED.current_size,
            optimized_size = EXCLUDED.optimized_size,
            space_reclaimed = EXCLUDED.space_reclaimed,
            blockchain_recorded = EXCLUDED.blockchain_recorded,
            transaction_hash = EXCLUDED.transaction_hash,
            metaverse_slot_id = EXCLUDED.metaverse_slot_id,
            metadata = EXCLUDED.metadata,
            raw_content = COALESCE(EXCLUDED.raw_content, crawled_sites.raw_content),
            content_hash = EXCLUDED.content_hash,
            devtools_payload = EXCLUDED.devtools_payload,
            resource_summary = EXCLUDED.resource_summary,
            schema_candidates = EXCLUDED.schema_candidates,
            extraction_status = EXCLUDED.extraction_status,
            seo_stat_metrics = EXCLUDED.seo_stat_metrics,
            seo_feature_vector = EXCLUDED.seo_feature_vector,
            seo_feature_names = EXCLUDED.seo_feature_names,
            seo_feature_version = EXCLUDED.seo_feature_version,
            seo_quality_score = EXCLUDED.seo_quality_score,
            schema_types = EXCLUDED.schema_types,
            rich_snippet_targets = EXCLUDED.rich_snippet_targets,
            updated_at = NOW()
        `,
          [
            siteId,
            crawlData.url,
            domain,
            new Date(),
            1,
            5,
            Math.round(crawlData.seoScore.overall * 100) / 100,
            Math.round(crawlData.seoScore.overall * 100) / 100,
            Math.round(crawlData.domInfo.domSize),
            Math.round(crawlData.domInfo.domSize * 0.8),
            Math.round(crawlData.domInfo.domSize * 0.2),
            false,
            null,
            null,
            JSON.stringify(metadataPayload),
            crawlData.rawContent || null,
            crawlData.contentHash,
            JSON.stringify(crawlData.devtoolsPayload || {}),
            JSON.stringify(crawlData.resourceSummary || []),
            JSON.stringify(schemaCandidates),
            'raw',
            JSON.stringify(seoStatMetrics),
            featureVector,
            featureNames,
            featureVersion,
            seoQualityScore,
            schemaTypes,
            richSnippetTargets,
          ]
        );

        const socialMedia = metadataPayload.socialMedia;
        const structuredData = schemaCandidates;

        // Save SEO training data to seo_training_data table
        await client.query(
          `
          INSERT INTO seo_training_data (
            url, domain, page_title, meta_description, seo_score,
            performance_score, technical_score, content_score,
            headings, keywords, word_count, paragraph_count,
            social_media, structured_data, dom_info, crawled_at,
            features, feature_vector, feature_names, feature_version,
            schema_types, rich_snippet_targets, quality_score,
            optimization_type, optimization_details
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
            $23, $24, $25
          )
        `,
          [
            crawlData.url,
            domain,
            crawlData.title,
            crawlData.description,
            Math.round(crawlData.seoScore.overall * 100) / 100,
            Math.round(crawlData.seoScore.performance * 100) / 100,
            Math.round(crawlData.seoScore.technical * 100) / 100,
            Math.round(crawlData.seoScore.content * 100) / 100,
            JSON.stringify(crawlData.headings),
            crawlData.keywords,
            crawlData.wordCount,
            crawlData.paragraphCount,
            JSON.stringify(socialMedia),
            JSON.stringify(structuredData),
            JSON.stringify(crawlData.domInfo),
            new Date(),
            JSON.stringify(seoStatMetrics),
            featureVector,
            featureNames,
            featureVersion,
            schemaTypes,
            richSnippetTargets,
            seoQualityScore,
            'auto_crawl_schema',
            JSON.stringify({
              schemaCandidates,
              seoStats: crawlData.seoStats,
              seoScore: crawlData.seoScore,
            }),
          ]
        );

        const summary = {
          seoQualityScore,
          wordCount: crawlData.wordCount,
          paragraphs: crawlData.paragraphCount,
          schemaTypes: schemaTypes.length,
          linkCount: (crawlData.links || []).length,
        };

        console.log(`📊 SEO stats mined for ${crawlData.url}`, summary);
        console.log(
          `💾 Saved SEO training data to database for ${crawlData.url} (siteId: ${siteId})`
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database save error:', error.message);
      // Don't throw error to prevent crawler from stopping
    }
  }

  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return (
        ['http:', 'https:'].includes(urlObj.protocol) &&
        !url.includes('javascript:') &&
        !url.includes('mailto:') &&
        !url.includes('tel:') &&
        url.length < 2000
      ); // Avoid very long URLs
    } catch {
      return false;
    }
  }

  async startCrawling() {
    if (this.isRunning) {
      console.log('⚠️  Crawler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting enhanced web crawler...');

    // Initialize browser if not already done
    if (!this.browser) {
      await this.initialize();
    }

    await this.hydrateSeedsFromRuntime();

    // Start with seed URLs
    for (const url of Array.from(this.seedUrls)) {
      try {
        if (!this.crawledUrls.has(url)) {
          await this.crawlUrl(url);
          // Small delay between crawls
          await this.sleep(this.seedCrawlDelayMs);
        }
      } catch (error) {
        console.error(`❌ Error crawling seed URL ${url}:`, error.message);
        // Continue with next URL
      }
    }

    // Start continuous crawling
    this.crawlInterval = setInterval(async () => {
      try {
        if (this.discoveredUrls.size === 0) {
          await this.hydrateSeedsFromRuntime();
        }

        if (this.discoveredUrls.size > 0) {
          const url = this.discoveredUrls.values().next().value;
          this.discoveredUrls.delete(url);
          await this.crawlUrl(url);
          this.saveData();
          await this.sleep(this.continuousCrawlDelayMs);
        }
      } catch (error) {
        console.error('❌ Error in continuous crawling loop:', error.message);
        // Continue running despite errors
      }
    }, this.continuousCrawlIntervalMs); // Crawl interval is configurable

    console.log('✅ Enhanced crawler started');
  }

  stopCrawling() {
    if (!this.isRunning) {
      console.log('⚠️  Crawler is not running');
      return;
    }

    this.isRunning = false;
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
      this.crawlInterval = null;
    }
    this.saveData();
    console.log('🛑 Enhanced crawler stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      crawledCount: this.crawledUrls.size,
      discoveredCount: this.discoveredUrls.size,
      lastUpdate: new Date().toISOString(),
      status: this.isRunning ? 'running' : 'stopped',
    };
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      crawledCount: this.crawledUrls.size,
      discoveredCount: this.discoveredUrls.size,
      lastUpdate: new Date().toISOString(),
    };
  }

  getRecentCrawls(limit = 10) {
    return Array.from(this.crawledUrls)
      .slice(-limit)
      .map(url => ({
        url,
        crawledAt: new Date().toISOString(),
      }));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.dbPool) {
      await this.dbPool.end();
    }
  }

  async waitForSlot() {
    while (this.activePages >= this.maxConcurrentPages) {
      await this.sleep(100);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EnhancedWebCrawlerService();
