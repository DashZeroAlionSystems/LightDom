import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import HeadlessChromeService from './HeadlessChromeService';
import { CrawlResult, CrawlOptions, WebsiteData, OptimizationOpportunity } from '@/types/CrawlerTypes';
let BullQueueWC: any;
let RedisCtorWC: any;

export class WebCrawlerService extends EventEmitter {
  private headlessService: HeadlessChromeService;
  private logger: Logger;
  private crawlQueue: any;
  private redis: any;
  private isRunning = false;
  private activeCrawls = new Map<string, any>();

  constructor() {
    super();
    this.headlessService = new HeadlessChromeService();
    this.logger = new Logger('WebCrawlerService');
    this.redis = null;
    this.crawlQueue = null;
    // Defer server-only setup to initialize()
  }

  /**
   * Initialize the crawler service
   */
  async initialize(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('WebCrawlerService is server-only and cannot run in the browser');
      }
      const [bull, { default: Redis }] = await Promise.all([
        import('bull'),
        import('ioredis')
      ]);
      BullQueueWC = bull.Queue || bull.default?.Queue || bull;
      RedisCtorWC = Redis;
      this.redis = new RedisCtorWC(process.env.REDIS_URL || 'redis://localhost:6379');
      this.crawlQueue = new BullQueueWC('crawl-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    });
      await this.headlessService.initialize();
      this.setupQueueProcessing();
      this.logger.info('WebCrawlerService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WebCrawlerService:', error);
      throw error;
    }
  }

  /**
   * Setup queue processing
   */
  private setupQueueProcessing(): void {
    this.crawlQueue.process('crawl-website', 5, async (job) => {
      const { url, options, crawlId } = job.data;
      return await this.processCrawlJob(url, options, crawlId);
    });

    this.crawlQueue.on('completed', (job, result) => {
      this.logger.info(`Crawl job ${job.id} completed`);
      this.emit('crawlCompleted', { jobId: job.id, result });
    });

    this.crawlQueue.on('failed', (job, err) => {
      this.logger.error(`Crawl job ${job.id} failed:`, err);
      this.emit('crawlFailed', { jobId: job.id, error: err });
    });
  }

  /**
   * Start crawling a website
   */
  async crawlWebsite(url: string, options: CrawlOptions = {}): Promise<string> {
    const crawlId = this.generateCrawlId();
    
    try {
      // Add to queue
      const job = await this.crawlQueue.add('crawl-website', {
        url,
        options,
        crawlId
      }, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });

      this.activeCrawls.set(crawlId, {
        jobId: job.id,
        url,
        status: 'queued',
        startTime: new Date()
      });

      this.logger.info(`Crawl job queued for ${url} with ID: ${crawlId}`);
      return crawlId;
    } catch (error) {
      this.logger.error(`Failed to queue crawl for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Process a crawl job
   */
  private async processCrawlJob(url: string, options: CrawlOptions, crawlId: string): Promise<CrawlResult> {
    const pageId = `crawl-${crawlId}`;
    
    try {
      this.updateCrawlStatus(crawlId, 'processing');
      
      // Create page
      const page = await this.headlessService.createPage(pageId, {
        width: options.viewport?.width || 1920,
        height: options.viewport?.height || 1080,
        userAgent: options.userAgent
      });

      // Navigate to URL
      await this.headlessService.navigateToPage(pageId, url, {
        waitUntil: options.waitUntil || 'networkidle2',
        timeout: options.timeout || 30000
      });

      // Wait for additional content
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      // Analyze DOM
      const domAnalysis = await this.headlessService.analyzeDOM(pageId);

      // Extract website data
      const websiteData = await this.extractWebsiteData(pageId, url);

      // Find optimization opportunities
      const opportunities = await this.findOptimizationOpportunities(pageId, domAnalysis);

      // Take screenshot
      const screenshot = await this.headlessService.takeScreenshot(pageId, {
        fullPage: true,
        type: 'png'
      });

      // Generate PDF if requested
      let pdf: Buffer | undefined;
      if (options.generatePDF) {
        pdf = await this.headlessService.generatePDF(pageId);
      }

      // Close page
      await this.headlessService.closePage(pageId);

      const result: CrawlResult = {
        crawlId,
        url,
        timestamp: new Date().toISOString(),
        status: 'completed',
        websiteData,
        domAnalysis,
        opportunities,
        screenshot,
        pdf,
        performance: {
          totalTime: Date.now() - this.activeCrawls.get(crawlId)?.startTime.getTime(),
          pagesAnalyzed: 1,
          errors: []
        }
      };

      // Store result in Redis
      await this.redis.setex(`crawl:${crawlId}`, 3600, JSON.stringify(result));

      this.updateCrawlStatus(crawlId, 'completed');
      this.logger.info(`Crawl completed for ${url}`);

      return result;
    } catch (error) {
      this.logger.error(`Crawl failed for ${url}:`, error);
      this.updateCrawlStatus(crawlId, 'failed');
      
      // Clean up page if it exists
      try {
        await this.headlessService.closePage(pageId);
      } catch (cleanupError) {
        this.logger.error('Error during cleanup:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Extract website data
   */
  private async extractWebsiteData(pageId: string, url: string): Promise<WebsiteData> {
    const page = this.headlessService['pages'].get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    return await page.evaluate((url) => {
      const data: WebsiteData = {
        url,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        language: document.documentElement.lang || 'en',
        charset: document.characterSet || 'UTF-8',
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '',
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '',
        twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '',
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '',
        structuredData: [],
        links: {
          internal: [],
          external: [],
          broken: []
        },
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          youtube: ''
        }
      };

      // Extract structured data
      const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
      structuredDataScripts.forEach(script => {
        try {
          const jsonData = JSON.parse(script.textContent || '');
          data.structuredData.push(jsonData);
        } catch (error) {
          console.warn('Invalid JSON-LD:', error);
        }
      });

      // Extract links
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const absoluteUrl = new URL(href, url).href;
        const isInternal = absoluteUrl.startsWith(url);

        if (isInternal) {
          data.links.internal.push({
            url: absoluteUrl,
            text: link.textContent?.trim() || '',
            title: link.getAttribute('title') || ''
          });
        } else {
          data.links.external.push({
            url: absoluteUrl,
            text: link.textContent?.trim() || '',
            title: link.getAttribute('title') || ''
          });
        }
      });

      // Extract images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        data.images.push({
          src: img.src,
          alt: img.alt || '',
          title: img.title || '',
          width: img.width || 0,
          height: img.height || 0,
          loading: img.loading || 'eager'
        });
      });

      // Extract scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        data.scripts.push({
          src: script.src,
          async: script.async,
          defer: script.defer,
          type: script.type || 'text/javascript'
        });
      });

      // Extract stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(link => {
        data.stylesheets.push({
          href: link.href,
          media: link.media || 'all',
          type: link.type || 'text/css'
        });
      });

      // Extract fonts
      const fontLinks = document.querySelectorAll('link[href*="font"], link[href*="woff"], link[href*="ttf"]');
      fontLinks.forEach(link => {
        data.fonts.push({
          href: link.href,
          type: link.type || 'font/woff2'
        });
      });

      // Extract social links
      const socialSelectors = {
        facebook: 'a[href*="facebook.com"], a[href*="fb.com"]',
        twitter: 'a[href*="twitter.com"], a[href*="x.com"]',
        linkedin: 'a[href*="linkedin.com"]',
        instagram: 'a[href*="instagram.com"]',
        youtube: 'a[href*="youtube.com"], a[href*="youtu.be"]'
      };

      Object.entries(socialSelectors).forEach(([platform, selector]) => {
        const link = document.querySelector(selector) as HTMLAnchorElement;
        if (link) {
          data.socialLinks[platform as keyof typeof data.socialLinks] = link.href;
        }
      });

      return data;
    }, url);
  }

  /**
   * Find optimization opportunities
   */
  private async findOptimizationOpportunities(pageId: string, domAnalysis: any): Promise<OptimizationOpportunity[]> {
    const opportunities: OptimizationOpportunity[] = [];

    // Image optimization opportunities
    if (domAnalysis.imageAnalysis.withoutAlt > 0) {
      opportunities.push({
        type: 'image',
        category: 'accessibility',
        priority: 'high',
        title: 'Missing Alt Text',
        description: `${domAnalysis.imageAnalysis.withoutAlt} images are missing alt text`,
        impact: 'Improves accessibility and SEO',
        effort: 'low',
        savings: {
          seo: 10,
          accessibility: 20
        }
      });
    }

    if (domAnalysis.imageAnalysis.oversized > 0) {
      opportunities.push({
        type: 'image',
        category: 'performance',
        priority: 'high',
        title: 'Oversized Images',
        description: `${domAnalysis.imageAnalysis.oversized} images are larger than necessary`,
        impact: 'Reduces page load time and bandwidth usage',
        effort: 'medium',
        savings: {
          performance: 15,
          bandwidth: 25
        }
      });
    }

    // Script optimization opportunities
    if (domAnalysis.scriptAnalysis.inline > 0) {
      opportunities.push({
        type: 'script',
        category: 'performance',
        priority: 'medium',
        title: 'Inline Scripts',
        description: `${domAnalysis.scriptAnalysis.inline} inline scripts should be externalized`,
        impact: 'Improves caching and parallel loading',
        effort: 'medium',
        savings: {
          performance: 8,
          caching: 12
        }
      });
    }

    // CSS optimization opportunities
    if (domAnalysis.cssAnalysis.inlineStyles > 0) {
      opportunities.push({
        type: 'css',
        category: 'performance',
        priority: 'medium',
        title: 'Inline Styles',
        description: `${domAnalysis.cssAnalysis.inlineStyles} inline styles should be externalized`,
        impact: 'Improves caching and maintainability',
        effort: 'medium',
        savings: {
          performance: 6,
          maintainability: 15
        }
      });
    }

    // Performance opportunities
    if (domAnalysis.performanceMetrics.largestContentfulPaint > 2500) {
      opportunities.push({
        type: 'performance',
        category: 'core-web-vitals',
        priority: 'high',
        title: 'Slow Largest Contentful Paint',
        description: `LCP is ${domAnalysis.performanceMetrics.largestContentfulPaint}ms (should be < 2.5s)`,
        impact: 'Improves Core Web Vitals and user experience',
        effort: 'high',
        savings: {
          performance: 20,
          seo: 15
        }
      });
    }

    if (domAnalysis.performanceMetrics.cumulativeLayoutShift > 0.1) {
      opportunities.push({
        type: 'performance',
        category: 'core-web-vitals',
        priority: 'high',
        title: 'High Cumulative Layout Shift',
        description: `CLS is ${domAnalysis.performanceMetrics.cumulativeLayoutShift} (should be < 0.1)`,
        impact: 'Improves Core Web Vitals and user experience',
        effort: 'medium',
        savings: {
          performance: 18,
          userExperience: 25
        }
      });
    }

    return opportunities;
  }

  /**
   * Get crawl status
   */
  async getCrawlStatus(crawlId: string): Promise<any> {
    const crawl = this.activeCrawls.get(crawlId);
    if (!crawl) {
      throw new Error(`Crawl ${crawlId} not found`);
    }

    return crawl;
  }

  /**
   * Get crawl result
   */
  async getCrawlResult(crawlId: string): Promise<CrawlResult | null> {
    try {
      const result = await this.redis.get(`crawl:${crawlId}`);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.logger.error(`Failed to get crawl result for ${crawlId}:`, error);
      return null;
    }
  }

  /**
   * Update crawl status
   */
  private updateCrawlStatus(crawlId: string, status: string): void {
    const crawl = this.activeCrawls.get(crawlId);
    if (crawl) {
      crawl.status = status;
      crawl.updatedAt = new Date();
      this.activeCrawls.set(crawlId, crawl);
    }
  }

  /**
   * Generate unique crawl ID
   */
  private generateCrawlId(): string {
    return `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      activeCrawls: this.activeCrawls.size,
      queueStatus: {
        waiting: this.crawlQueue.getWaiting().length,
        active: this.crawlQueue.getActive().length,
        completed: this.crawlQueue.getCompleted().length,
        failed: this.crawlQueue.getFailed().length
      }
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.crawlQueue.close();
      await this.redis.quit();
      await this.headlessService.cleanup();
      this.logger.info('WebCrawlerService cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default WebCrawlerService;
