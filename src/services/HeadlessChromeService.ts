import puppeteer, { Browser, Page, LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer';
import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { PerformanceMetrics, DOMAnalysis, OptimizationResult } from '../types/HeadlessTypes';

export class HeadlessChromeService extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private isInitialized = false;
  private maxPages = 10;
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('HeadlessChromeService');
  }

  /**
   * Initialize the headless Chrome browser
   */
  async initialize(options: LaunchOptions = {}): Promise<void> {
    try {
      const defaultOptions: LaunchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-pings',
          '--password-store=basic',
          '--use-mock-keychain',
          '--disable-background-networking',
          '--disable-component-extensions-with-background-pages',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-features=TranslateUI',
          '--disable-print-preview',
          '--disable-speech-api',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        ...options
      };

      this.browser = await puppeteer.launch(defaultOptions);
      this.isInitialized = true;
      this.logger.info('Headless Chrome browser initialized successfully');

      // Handle browser events
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected');
        this.isInitialized = false;
        this.emit('browserDisconnected');
      });

    } catch (error) {
      this.logger.error('Failed to initialize headless Chrome:', error);
      throw error;
    }
  }

  /**
   * Create a new page with optimized settings
   */
  async createPage(pageId: string, options: any = {}): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    if (this.pages.size >= this.maxPages) {
      throw new Error('Maximum number of pages reached');
    }

    try {
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: options.width || 1920,
        height: options.height || 1080,
        deviceScaleFactor: options.deviceScaleFactor || 1,
        isMobile: options.isMobile || false,
        hasTouch: options.hasTouch || false
      });

      // Set user agent
      await page.setUserAgent(options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Enable request interception for optimization
      await page.setRequestInterception(true);

      // Block unnecessary resources
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();

        // Block ads, analytics, and tracking
        if (this.shouldBlockRequest(url, resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Set up performance monitoring
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      });

      this.pages.set(pageId, page);
      this.logger.info(`Page created with ID: ${pageId}`);
      
      return page;
    } catch (error) {
      this.logger.error(`Failed to create page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Navigate to a URL and wait for page load
   */
  async navigateToPage(pageId: string, url: string, options: any = {}): Promise<void> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      this.logger.info(`Navigating to: ${url}`);
      
      const navigationPromise = page.waitForNavigation({
        waitUntil: options.waitUntil || 'networkidle2',
        timeout: options.timeout || 30000
      });

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000
      });

      await navigationPromise;

      // Wait for additional content if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      this.logger.info(`Successfully navigated to: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Analyze DOM structure and performance
   */
  async analyzeDOM(pageId: string): Promise<DOMAnalysis> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const analysis = await page.evaluate(() => {
        const startTime = performance.now();

        // DOM metrics
        const totalElements = document.querySelectorAll('*').length;
        const images = document.querySelectorAll('img');
        const scripts = document.querySelectorAll('script');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const inlineStyles = document.querySelectorAll('style');

        // Image analysis
        const imageAnalysis = {
          total: images.length,
          withoutAlt: Array.from(images).filter(img => !img.alt).length,
          oversized: Array.from(images).filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.width > 1920 || rect.height > 1080;
          }).length,
          lazyLoaded: Array.from(images).filter(img => img.loading === 'lazy').length,
          webpSupported: Array.from(images).filter(img => img.src.includes('.webp')).length
        };

        // Script analysis
        const scriptAnalysis = {
          total: scripts.length,
          inline: Array.from(scripts).filter(script => !script.src).length,
          external: Array.from(scripts).filter(script => script.src).length,
          async: Array.from(scripts).filter(script => script.async).length,
          defer: Array.from(scripts).filter(script => script.defer).length
        };

        // CSS analysis
        const cssAnalysis = {
          stylesheets: stylesheets.length,
          inlineStyles: inlineStyles.length,
          unusedRules: 0, // Would need more complex analysis
          criticalCSS: 0 // Would need more complex analysis
        };

        // Performance metrics
        const performanceMetrics = {
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
          cumulativeLayoutShift: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
          totalBlockingTime: performance.getEntriesByType('longtask').reduce((sum, entry) => sum + entry.duration, 0)
        };

        // Resource analysis
        const resources = performance.getEntriesByType('resource');
        const resourceAnalysis = {
          total: resources.length,
          images: resources.filter(r => r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.gif') || r.name.includes('.webp')).length,
          scripts: resources.filter(r => r.name.includes('.js')).length,
          stylesheets: resources.filter(r => r.name.includes('.css')).length,
          fonts: resources.filter(r => r.name.includes('.woff') || r.name.includes('.ttf')).length,
          totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
        };

        const endTime = performance.now();

        return {
          totalElements,
          imageAnalysis,
          scriptAnalysis,
          cssAnalysis,
          performanceMetrics,
          resourceAnalysis,
          analysisTime: endTime - startTime,
          timestamp: new Date().toISOString()
        };
      });

      this.logger.info(`DOM analysis completed for page ${pageId}`);
      return analysis;
    } catch (error) {
      this.logger.error(`Failed to analyze DOM for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Take a screenshot of the page
   */
  async takeScreenshot(pageId: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png',
        ...options
      });

      this.logger.info(`Screenshot taken for page ${pageId}`);
      return screenshot as Buffer;
    } catch (error) {
      this.logger.error(`Failed to take screenshot for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Generate PDF from page
   */
  async generatePDF(pageId: string, options: PDFOptions = {}): Promise<Buffer> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
        ...options
      });

      this.logger.info(`PDF generated for page ${pageId}`);
      return pdf;
    } catch (error) {
      this.logger.error(`Failed to generate PDF for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Execute custom JavaScript on the page
   */
  async executeScript(pageId: string, script: string, ...args: any[]): Promise<any> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const result = await page.evaluate(script, ...args);
      this.logger.info(`Script executed on page ${pageId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute script on page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Close a specific page
   */
  async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      await page.close();
      this.pages.delete(pageId);
      this.logger.info(`Page ${pageId} closed`);
    } catch (error) {
      this.logger.error(`Failed to close page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Close all pages and browser
   */
  async cleanup(): Promise<void> {
    try {
      // Close all pages
      for (const [pageId, page] of this.pages) {
        try {
          await page.close();
        } catch (error) {
          this.logger.error(`Error closing page ${pageId}:`, error);
        }
      }
      this.pages.clear();

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.isInitialized = false;
      this.logger.info('Headless Chrome service cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      activePages: this.pages.size,
      maxPages: this.maxPages,
      browserConnected: this.browser?.isConnected() || false
    };
  }

  /**
   * Check if request should be blocked
   */
  private shouldBlockRequest(url: string, resourceType: string): boolean {
    const blockedDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'doubleclick.net',
      'googlesyndication.com',
      'amazon-adsystem.com',
      'adsystem.amazon.com'
    ];

    const blockedTypes = ['image', 'media', 'font'];
    
    return blockedDomains.some(domain => url.includes(domain)) || 
           blockedTypes.includes(resourceType);
  }
}

export default HeadlessChromeService;
