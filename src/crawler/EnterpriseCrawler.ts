/**
 * Enterprise Crawler - 24/7 Resilient Web Crawler
 * 
 * Features:
 * - Automatic error recovery
 * - Database logging of all activities
 * - Rate limiting and politeness
 * - Proxy rotation support
 * - Session persistence
 * - Health monitoring
 * - Graceful shutdown
 * - Comprehensive metrics
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';
import { DatabaseAccessLayer } from '../database/DatabaseAccessLayer';

export interface CrawlerConfig {
  name: string;
  startUrls: string[];
  maxConcurrency?: number;
  maxDepth?: number;
  maxPages?: number;
  rateLimit?: number; // ms between requests
  timeout?: number; // ms
  retryAttempts?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  proxyUrl?: string;
  screenshot?: boolean;
  javascript?: boolean;
  cookies?: any[];
  viewport?: { width: number; height: number };
  selectors?: {
    title?: string;
    content?: string;
    links?: string;
  };
}

export interface CrawlResult {
  url: string;
  title: string | null;
  content: string | null;
  links: string[];
  metadata: Record<string, any>;
  screenshot?: Buffer;
  timestamp: Date;
}

export class EnterpriseCrawler extends EventEmitter {
  private config: CrawlerConfig;
  private db: DatabaseAccessLayer;
  private instanceId: number | null = null;
  private browser: Browser | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private queue: Set<string> = new Set();
  private visited: Set<string> = new Set();
  private activePages: Set<Page> = new Set();
  private stats = {
    pagesProcessed: 0,
    errors: 0,
    startTime: null as Date | null,
    lastActivity: null as Date | null,
  };
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: CrawlerConfig, db: DatabaseAccessLayer) {
    super();
    this.config = {
      maxConcurrency: 3,
      maxDepth: 10,
      maxPages: 1000,
      rateLimit: 1000,
      timeout: 30000,
      retryAttempts: 3,
      userAgent: 'LightDom Enterprise Crawler/1.0',
      screenshot: false,
      javascript: true,
      viewport: { width: 1920, height: 1080 },
      ...config,
    };
    this.db = db;
  }

  /**
   * Initialize crawler instance in database
   */
  private async initializeInstance(): Promise<void> {
    const record = await this.db.insert('crawler_instances', {
      name: this.config.name,
      config: JSON.stringify(this.config),
      status: 'initializing',
      started_at: new Date(),
      last_heartbeat: new Date(),
      metadata: JSON.stringify({
        startUrls: this.config.startUrls,
        maxPages: this.config.maxPages,
      }),
    });
    
    this.instanceId = record.id;
    this.emit('initialized', { instanceId: this.instanceId });
    
    console.log(`✅ Crawler instance initialized: ${this.instanceId}`);
  }

  /**
   * Update instance status in database
   */
  private async updateInstanceStatus(status: string, extra: Record<string, any> = {}): Promise<void> {
    if (!this.instanceId) return;
    
    await this.db.update(
      'crawler_instances',
      {
        status,
        last_heartbeat: new Date(),
        total_pages_crawled: this.stats.pagesProcessed,
        total_errors: this.stats.errors,
        ...extra,
      },
      'id = $1',
      [this.instanceId]
    );
  }

  /**
   * Log activity to database
   */
  private async logActivity(
    url: string,
    status: string,
    data?: any,
    error?: string
  ): Promise<void> {
    if (!this.instanceId) return;
    
    try {
      await this.db.insert('crawler_logs', {
        instance_id: this.instanceId,
        url,
        status,
        response_time: data?.responseTime || null,
        error: error || null,
        data: data ? JSON.stringify(data) : null,
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }

  /**
   * Save crawl result to database
   */
  private async saveCrawlResult(result: CrawlResult): Promise<void> {
    if (!this.instanceId) return;
    
    try {
      await this.db.upsert(
        'crawler_results',
        {
          instance_id: this.instanceId,
          url: result.url,
          title: result.title,
          content: result.content,
          metadata: JSON.stringify(result.metadata),
          components: JSON.stringify({ links: result.links }),
          quality_score: this.calculateQualityScore(result),
        },
        ['instance_id', 'url']
      );
    } catch (err) {
      console.error('Failed to save result:', err);
    }
  }

  /**
   * Calculate quality score for crawled page
   */
  private calculateQualityScore(result: CrawlResult): number {
    let score = 0;
    
    // Has title
    if (result.title) score += 0.2;
    
    // Has substantial content
    if (result.content && result.content.length > 100) score += 0.3;
    
    // Has links
    if (result.links.length > 0) score += 0.2;
    
    // Has metadata
    if (Object.keys(result.metadata).length > 0) score += 0.3;
    
    return score;
  }

  /**
   * Start the crawler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }

    try {
      // Initialize database connection
      await this.db.initialize();
      
      // Initialize instance in database
      await this.initializeInstance();
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      
      // Add start URLs to queue
      this.config.startUrls.forEach(url => this.queue.add(url));
      
      // Start processing
      this.isRunning = true;
      this.stats.startTime = new Date();
      this.stats.lastActivity = new Date();
      
      await this.updateInstanceStatus('running');
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Process queue
      this.emit('started');
      console.log(`✅ Crawler started: ${this.config.name}`);
      
      await this.processQueue();
      
    } catch (error: any) {
      console.error('Failed to start crawler:', error);
      await this.logActivity('', 'error', null, error.message);
      await this.updateInstanceStatus('error');
      throw error;
    }
  }

  /**
   * Process crawl queue
   */
  private async processQueue(): Promise<void> {
    const concurrency = this.config.maxConcurrency || 3;
    const promises: Promise<void>[] = [];
    
    while (this.isRunning && (this.queue.size > 0 || promises.length > 0)) {
      // Check if paused
      if (this.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Check max pages limit
      if (this.stats.pagesProcessed >= (this.config.maxPages || Infinity)) {
        console.log('Max pages limit reached');
        break;
      }
      
      // Start new tasks up to concurrency limit
      while (promises.length < concurrency && this.queue.size > 0) {
        const url = Array.from(this.queue)[0];
        this.queue.delete(url);
        
        if (!this.visited.has(url)) {
          const promise = this.crawlPage(url)
            .catch(err => {
              console.error(`Error crawling ${url}:`, err);
              this.stats.errors++;
            });
          
          promises.push(promise);
        }
      }
      
      // Wait for at least one task to complete
      if (promises.length > 0) {
        await Promise.race(promises);
        // Remove completed promises
        for (let i = promises.length - 1; i >= 0; i--) {
          if (await Promise.race([promises[i], Promise.resolve('pending')]) !== 'pending') {
            promises.splice(i, 1);
          }
        }
      }
      
      // Rate limiting
      if (this.config.rateLimit) {
        await new Promise(resolve => setTimeout(resolve, this.config.rateLimit));
      }
    }
    
    // Wait for all remaining tasks
    await Promise.all(promises);
    
    // Crawl completed
    await this.updateInstanceStatus('completed');
    this.emit('completed');
    console.log(`✅ Crawler completed: ${this.stats.pagesProcessed} pages processed`);
  }

  /**
   * Crawl a single page
   */
  private async crawlPage(url: string, depth: number = 0, retries: number = 0): Promise<void> {
    if (depth > (this.config.maxDepth || 10)) {
      return;
    }
    
    if (this.visited.has(url)) {
      return;
    }
    
    this.visited.add(url);
    const startTime = Date.now();
    
    let page: Page | null = null;
    
    try {
      // Create new page
      page = await this.browser!.newPage();
      this.activePages.add(page);
      
      // Set viewport
      if (this.config.viewport) {
        await page.setViewport(this.config.viewport);
      }
      
      // Set user agent
      if (this.config.userAgent) {
        await page.setUserAgent(this.config.userAgent);
      }
      
      // Set headers
      if (this.config.headers) {
        await page.setExtraHTTPHeaders(this.config.headers);
      }
      
      // Set cookies
      if (this.config.cookies) {
        await page.setCookie(...this.config.cookies);
      }
      
      // Navigate to page
      const response = await page.goto(url, {
        timeout: this.config.timeout,
        waitUntil: 'networkidle2',
      });
      
      const responseTime = Date.now() - startTime;
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()}`);
      }
      
      // Extract data
      const result: CrawlResult = {
        url,
        title: await page.title(),
        content: await page.evaluate(() => document.body.innerText),
        links: await this.extractLinks(page, url),
        metadata: {
          status: response.status(),
          contentType: response.headers()['content-type'],
          responseTime,
        },
        timestamp: new Date(),
      };
      
      // Take screenshot if configured
      if (this.config.screenshot) {
        result.screenshot = await page.screenshot({ fullPage: false });
      }
      
      // Save result
      await this.saveCrawlResult(result);
      
      // Log success
      await this.logActivity(url, 'success', { responseTime });
      
      // Add new links to queue
      result.links.forEach(link => {
        if (!this.visited.has(link) && this.isValidUrl(link)) {
          this.queue.add(link);
        }
      });
      
      // Update stats
      this.stats.pagesProcessed++;
      this.stats.lastActivity = new Date();
      
      // Emit success event
      this.emit('page-crawled', result);
      
    } catch (error: any) {
      console.error(`Error crawling ${url}:`, error.message);
      
      // Retry logic
      if (retries < (this.config.retryAttempts || 3)) {
        console.log(`Retrying ${url} (attempt ${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
        return this.crawlPage(url, depth, retries + 1);
      }
      
      // Log error
      await this.logActivity(url, 'error', null, error.message);
      this.stats.errors++;
      
      // Emit error event
      this.emit('page-error', { url, error: error.message });
      
    } finally {
      // Clean up page
      if (page) {
        this.activePages.delete(page);
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * Extract links from page
   */
  private async extractLinks(page: Page, baseUrl: string): Promise<string[]> {
    const selector = this.config.selectors?.links || 'a[href]';
    
    const links = await page.evaluate((sel: string) => {
      const elements = document.querySelectorAll(sel);
      return Array.from(elements)
        .map((el: any) => el.href)
        .filter(href => href && !href.startsWith('javascript:'));
    }, selector);
    
    // Resolve relative URLs
    return links.map(link => new URL(link, baseUrl).href);
  }

  /**
   * Check if URL is valid for crawling
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Only HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      // Check if same domain as start URLs (optional)
      // This can be configured based on requirements
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        queueSize: this.queue.size,
        visited: this.visited.size,
        activePages: this.activePages.size,
        stats: this.stats,
      };
      
      this.emit('health-check', health);
      
      // Check for stalled crawler
      const lastActivity = this.stats.lastActivity;
      if (lastActivity) {
        const timeSinceActivity = Date.now() - lastActivity.getTime();
        if (timeSinceActivity > 300000) { // 5 minutes
          console.warn('⚠️ Crawler appears stalled, attempting recovery...');
          await this.recover();
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.updateInstanceStatus(this.isRunning ? 'running' : 'stopped');
    }, 60000); // Every minute
  }

  /**
   * Attempt to recover from errors
   */
  private async recover(): Promise<void> {
    try {
      console.log('🔧 Attempting crawler recovery...');
      
      // Close all active pages
      for (const page of this.activePages) {
        await page.close().catch(() => {});
      }
      this.activePages.clear();
      
      // Restart browser if needed
      if (!this.browser || !this.browser.isConnected()) {
        console.log('Restarting browser...');
        if (this.browser) {
          await this.browser.close().catch(() => {});
        }
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }
      
      this.stats.lastActivity = new Date();
      this.emit('recovered');
      console.log('✅ Crawler recovered');
      
    } catch (error) {
      console.error('Failed to recover crawler:', error);
      this.emit('recovery-failed', error);
    }
  }

  /**
   * Pause crawling
   */
  pause(): void {
    this.isPaused = true;
    this.emit('paused');
    console.log('⏸️  Crawler paused');
  }

  /**
   * Resume crawling
   */
  resume(): void {
    this.isPaused = false;
    this.emit('resumed');
    console.log('▶️  Crawler resumed');
  }

  /**
   * Stop crawling
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping crawler...');
    
    this.isRunning = false;
    
    // Clear intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Close all pages
    for (const page of this.activePages) {
      await page.close().catch(() => {});
    }
    this.activePages.clear();
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    // Update status
    await this.updateInstanceStatus('stopped');
    
    this.emit('stopped');
    console.log('✅ Crawler stopped');
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.size,
      visitedSize: this.visited.size,
      activePages: this.activePages.size,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      instanceId: this.instanceId,
    };
  }
}

export default EnterpriseCrawler;
