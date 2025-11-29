/**
 * Headless Browser Pool Manager
 * 
 * Manages a pool of headless browsers (Puppeteer/Playwright) for large-scale data mining.
 * Features:
 * - Multi-browser support (Puppeteer & Playwright)
 * - Connection pooling and reuse
 * - Automatic scaling based on workload
 * - Health monitoring and auto-recovery
 * - Resource optimization
 * - Task queue management
 */

import { EventEmitter } from 'events';

// Conditional imports
let puppeteer = null;
let AdaptiveBrowserConfig = null;
let PerformanceMonitor = null;

try {
  const puppeteerModule = await import('puppeteer');
  puppeteer = puppeteerModule.default;
} catch (e) {
  console.warn('⚠️  Puppeteer not installed. Install with: npm install puppeteer');
}

try {
  const adapterModule = await import('../utils/AdaptiveBrowserConfig.js');
  AdaptiveBrowserConfig = adapterModule.AdaptiveBrowserConfig;
} catch (e) {
  // AdaptiveBrowserConfig is optional
}

try {
  const perfModule = await import('../utils/PerformanceMonitor.js');
  PerformanceMonitor = perfModule.PerformanceMonitor;
} catch (e) {
  // PerformanceMonitor is optional
}

export class HeadlessBrowserPool extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      minBrowsers: config.minBrowsers || 2,
      maxBrowsers: config.maxBrowsers || 10,
      maxPagesPerBrowser: config.maxPagesPerBrowser || 5,
      browserType: config.browserType || 'puppeteer', // 'puppeteer' or 'playwright'
      idleTimeout: config.idleTimeout || 300000, // 5 minutes
      healthCheckInterval: config.healthCheckInterval || 30000, // 30 seconds
      autoScale: config.autoScale !== false,
      enableGPU: config.enableGPU || false,
      headless: config.headless !== false,
      ...config
    };

    this.browsers = new Map(); // browserId -> browser instance
    this.pages = new Map(); // pageId -> { browser, page, inUse, lastUsed }
    this.taskQueue = [];
    this.browserConfig = AdaptiveBrowserConfig ? new AdaptiveBrowserConfig() : null;
    this.perfMonitor = PerformanceMonitor ? new PerformanceMonitor({ learningRate: 0.1 }) : null;
    
    this.stats = {
      totalBrowsersCreated: 0,
      activeBrowsers: 0,
      activePages: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      averageTaskTime: 0,
      poolUtilization: 0
    };

    this.isInitialized = false;
    this.isShuttingDown = false;
    this.healthCheckTimer = null;
    this.scaleCheckTimer = null;
  }

  /**
   * Initialize the browser pool
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Browser pool already initialized');
      return;
    }

    if (!puppeteer && this.config.browserType === 'puppeteer') {
      throw new Error('Puppeteer is not installed. Install it with: npm install puppeteer');
    }

    console.log('🚀 Initializing Headless Browser Pool...');
    console.log(`   Type: ${this.config.browserType}`);
    console.log(`   Pool size: ${this.config.minBrowsers}-${this.config.maxBrowsers} browsers`);
    console.log(`   Pages per browser: ${this.config.maxPagesPerBrowser}`);

    if (this.browserConfig) {
      await this.browserConfig.initialize();
    }

    // Create initial browser pool
    for (let i = 0; i < this.config.minBrowsers; i++) {
      await this.createBrowser();
    }

    // Start health monitoring
    this.startHealthMonitoring();

    // Start auto-scaling if enabled
    if (this.config.autoScale) {
      this.startAutoScaling();
    }

    this.isInitialized = true;
    console.log('✅ Browser pool initialized');
    
    this.emit('initialized', { stats: this.getStats() });
  }

  /**
   * Create a new browser instance
   */
  async createBrowser() {
    if (this.browsers.size >= this.config.maxBrowsers) {
      throw new Error('Maximum browser pool size reached');
    }

    const browserId = `browser_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    try {
      let launchOptions = {
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      };

      // Use adaptive browser config if available
      if (this.browserConfig) {
        const browserConfig = await this.browserConfig.getConfig({
          task: 'scraping',
          enableGPU: this.config.enableGPU
        });
        launchOptions = {
          ...browserConfig.config,
          ...launchOptions
        };
      }

      let browser;
      if (this.config.browserType === 'playwright') {
        // Playwright support (requires installation)
        const { chromium } = await import('playwright');
        browser = await chromium.launch(launchOptions);
      } else {
        // Puppeteer (default)
        if (!puppeteer) {
          throw new Error('Puppeteer is not available');
        }
        browser = await puppeteer.launch(launchOptions);
      }

      this.browsers.set(browserId, {
        id: browserId,
        browser,
        pages: new Set(),
        createdAt: Date.now(),
        lastUsed: Date.now(),
        healthy: true,
        taskCount: 0
      });

      this.stats.totalBrowsersCreated++;
      this.stats.activeBrowsers = this.browsers.size;

      console.log(`✅ Browser created: ${browserId}`);
      this.emit('browserCreated', { browserId });

      return browserId;
    } catch (error) {
      console.error(`Failed to create browser ${browserId}:`, error);
      throw error;
    }
  }

  /**
   * Get a page from the pool (or create one)
   */
  async acquirePage(options = {}) {
    if (!this.isInitialized) {
      throw new Error('Browser pool not initialized');
    }

    // Try to find an idle page first
    for (const [pageId, pageData] of this.pages.entries()) {
      if (!pageData.inUse) {
        pageData.inUse = true;
        pageData.lastUsed = Date.now();
        this.stats.poolUtilization = this.calculateUtilization();
        return { pageId, page: pageData.page };
      }
    }

    // No idle pages, create a new one
    const browser = await this.getLeastLoadedBrowser();
    if (!browser) {
      throw new Error('No available browsers');
    }

    const pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const page = await browser.browser.newPage();

    // Configure page
    await page.setUserAgent(options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({
      width: options.width || 1920,
      height: options.height || 1080
    });

    // Set default timeout
    page.setDefaultTimeout(options.timeout || 30000);

    this.pages.set(pageId, {
      browser: browser.id,
      page,
      inUse: true,
      createdAt: Date.now(),
      lastUsed: Date.now()
    });

    browser.pages.add(pageId);
    this.stats.activePages = this.pages.size;
    this.stats.poolUtilization = this.calculateUtilization();

    this.emit('pageAcquired', { pageId, browserId: browser.id });

    return { pageId, page };
  }

  /**
   * Release a page back to the pool
   */
  async releasePage(pageId, options = {}) {
    const pageData = this.pages.get(pageId);
    if (!pageData) {
      console.warn(`Page ${pageId} not found in pool`);
      return;
    }

    if (options.close) {
      // Close the page permanently
      try {
        await pageData.page.close();
      } catch (error) {
        console.error(`Error closing page ${pageId}:`, error);
      }
      
      const browserData = this.browsers.get(pageData.browser);
      if (browserData) {
        browserData.pages.delete(pageId);
      }
      
      this.pages.delete(pageId);
      this.stats.activePages = this.pages.size;
    } else {
      // Return to pool for reuse
      pageData.inUse = false;
      pageData.lastUsed = Date.now();
      
      // Clear page state for next use
      try {
        await pageData.page.evaluate(() => {
          sessionStorage.clear();
          localStorage.clear();
        });
      } catch (error) {
        // Ignore errors during cleanup
      }
    }

    this.stats.poolUtilization = this.calculateUtilization();
    this.emit('pageReleased', { pageId });
  }

  /**
   * Execute a task using a page from the pool
   */
  async executeTask(taskFn, options = {}) {
    const startTime = Date.now();
    let pageId = null;
    let page = null;

    try {
      // Acquire page
      const acquired = await this.acquirePage(options);
      pageId = acquired.pageId;
      page = acquired.page;

      // Execute task
      const result = await taskFn(page);

      // Update stats
      const duration = Date.now() - startTime;
      this.stats.tasksCompleted++;
      this.updateAverageTaskTime(duration);
      
      this.emit('taskCompleted', { pageId, duration, success: true });

      return result;
    } catch (error) {
      this.stats.tasksFailed++;
      this.emit('taskFailed', { pageId, error: error.message });
      throw error;
    } finally {
      // Always release the page
      if (pageId) {
        await this.releasePage(pageId, { close: options.closeAfter });
      }
    }
  }

  /**
   * Get the least loaded browser
   */
  async getLeastLoadedBrowser() {
    let leastLoaded = null;
    let minPages = Infinity;

    for (const browserData of this.browsers.values()) {
      if (browserData.healthy && browserData.pages.size < this.config.maxPagesPerBrowser) {
        if (browserData.pages.size < minPages) {
          minPages = browserData.pages.size;
          leastLoaded = browserData;
        }
      }
    }

    // If all browsers are full, try to create a new one
    if (!leastLoaded && this.browsers.size < this.config.maxBrowsers) {
      const browserId = await this.createBrowser();
      return this.browsers.get(browserId);
    }

    return leastLoaded;
  }

  /**
   * Calculate pool utilization
   */
  calculateUtilization() {
    const totalCapacity = this.browsers.size * this.config.maxPagesPerBrowser;
    const inUsePages = Array.from(this.pages.values()).filter(p => p.inUse).length;
    return totalCapacity > 0 ? (inUsePages / totalCapacity) * 100 : 0;
  }

  /**
   * Update average task time
   */
  updateAverageTaskTime(newTime) {
    const total = this.stats.tasksCompleted + this.stats.tasksFailed;
    if (total === 1) {
      this.stats.averageTaskTime = newTime;
    } else {
      this.stats.averageTaskTime = (this.stats.averageTaskTime * (total - 1) + newTime) / total;
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check on all browsers
   */
  async performHealthCheck() {
    for (const [browserId, browserData] of this.browsers.entries()) {
      try {
        // Try to create and close a test page
        const testPage = await browserData.browser.newPage();
        await testPage.close();
        browserData.healthy = true;
      } catch (error) {
        console.error(`Browser ${browserId} failed health check:`, error);
        browserData.healthy = false;
        
        // Try to recover
        await this.recoverBrowser(browserId);
      }
    }

    // Clean up idle pages
    await this.cleanupIdlePages();
  }

  /**
   * Recover an unhealthy browser
   */
  async recoverBrowser(browserId) {
    console.log(`🔧 Attempting to recover browser ${browserId}`);
    
    try {
      // Close all pages for this browser
      const browserData = this.browsers.get(browserId);
      for (const pageId of browserData.pages) {
        const pageData = this.pages.get(pageId);
        if (pageData) {
          try {
            await pageData.page.close();
          } catch (e) {
            // Ignore
          }
          this.pages.delete(pageId);
        }
      }

      // Close the browser
      await browserData.browser.close();
      this.browsers.delete(browserId);
      this.stats.activeBrowsers = this.browsers.size;

      // Create a new browser to replace it
      await this.createBrowser();
      
      console.log(`✅ Browser ${browserId} recovered`);
    } catch (error) {
      console.error(`Failed to recover browser ${browserId}:`, error);
    }
  }

  /**
   * Clean up idle pages
   */
  async cleanupIdlePages() {
    const now = Date.now();
    const pagesToClose = [];

    for (const [pageId, pageData] of this.pages.entries()) {
      if (!pageData.inUse && (now - pageData.lastUsed) > this.config.idleTimeout) {
        pagesToClose.push(pageId);
      }
    }

    for (const pageId of pagesToClose) {
      await this.releasePage(pageId, { close: true });
    }

    if (pagesToClose.length > 0) {
      console.log(`🧹 Cleaned up ${pagesToClose.length} idle pages`);
    }
  }

  /**
   * Start auto-scaling
   */
  startAutoScaling() {
    this.scaleCheckTimer = setInterval(() => {
      this.checkAndScale();
    }, 60000); // Check every minute
  }

  /**
   * Check if scaling is needed and adjust pool size
   */
  async checkAndScale() {
    const utilization = this.stats.poolUtilization;

    // Scale up if utilization is high
    if (utilization > 80 && this.browsers.size < this.config.maxBrowsers) {
      console.log(`📈 High utilization (${utilization.toFixed(1)}%), scaling up...`);
      await this.createBrowser();
    }

    // Scale down if utilization is low
    if (utilization < 20 && this.browsers.size > this.config.minBrowsers) {
      console.log(`📉 Low utilization (${utilization.toFixed(1)}%), scaling down...`);
      await this.removeLeastUsedBrowser();
    }
  }

  /**
   * Remove the least used browser
   */
  async removeLeastUsedBrowser() {
    let oldestBrowser = null;
    let oldestTime = Infinity;

    for (const browserData of this.browsers.values()) {
      if (browserData.pages.size === 0 && browserData.lastUsed < oldestTime) {
        oldestTime = browserData.lastUsed;
        oldestBrowser = browserData;
      }
    }

    if (oldestBrowser) {
      try {
        await oldestBrowser.browser.close();
        this.browsers.delete(oldestBrowser.id);
        this.stats.activeBrowsers = this.browsers.size;
        console.log(`Browser ${oldestBrowser.id} removed from pool`);
      } catch (error) {
        console.error(`Error removing browser ${oldestBrowser.id}:`, error);
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      browsers: this.browsers.size,
      pages: this.pages.size,
      idlePages: Array.from(this.pages.values()).filter(p => !p.inUse).length,
      poolUtilization: this.stats.poolUtilization.toFixed(2) + '%'
    };
  }

  /**
   * Shutdown the pool gracefully
   */
  async shutdown() {
    if (this.isShuttingDown) {
      console.warn('Pool is already shutting down');
      return;
    }

    console.log('🛑 Shutting down browser pool...');
    this.isShuttingDown = true;

    // Stop monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    if (this.scaleCheckTimer) {
      clearInterval(this.scaleCheckTimer);
    }

    // Close all pages
    for (const [pageId, pageData] of this.pages.entries()) {
      try {
        await pageData.page.close();
      } catch (error) {
        // Ignore errors during shutdown
      }
    }
    this.pages.clear();

    // Close all browsers
    for (const browserData of this.browsers.values()) {
      try {
        await browserData.browser.close();
      } catch (error) {
        // Ignore errors during shutdown
      }
    }
    this.browsers.clear();

    this.isInitialized = false;
    this.stats.activeBrowsers = 0;
    this.stats.activePages = 0;

    console.log('✅ Browser pool shut down');
    this.emit('shutdown');
  }
}

export default HeadlessBrowserPool;
