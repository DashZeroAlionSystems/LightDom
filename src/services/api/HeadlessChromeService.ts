import puppeteer, { Browser, Page, LaunchOptions, PDFOptions, ScreenshotOptions } from 'puppeteer';
import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import { PerformanceMetrics, DOMAnalysis } from '@/types/HeadlessTypes';
import { OptimizationResult } from '@/types/OptimizationTypes';

export class HeadlessChromeService extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private isInitialized = false;
  private maxPages = 10;
  private logger: Logger;
  private useBiDi: boolean = false;
  private biDiEventHandlers: Map<string, Function> = new Map();

  constructor(options: { useBiDi?: boolean } = {}) {
    super();
    this.logger = new Logger('HeadlessChromeService');
    this.useBiDi = options.useBiDi || false;
  }

  /**
   * Initialize the headless Chrome browser with optional WebDriver BiDi support
   */
  async initialize(options: LaunchOptions = {}): Promise<void> {
    try {
      const defaultOptions: LaunchOptions = {
        // Use a conservative boolean headless flag to be compatible with a
        // variety of puppeteer versions during triage.
        headless: true,
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

      // Enable WebDriver BiDi if configured (requires Puppeteer 21.0.0+)
      if (this.useBiDi) {
        (defaultOptions as any).protocol = 'webDriverBiDi';
        this.logger.info('Initializing with WebDriver BiDi protocol for cross-browser compatibility');
      }

      this.browser = await puppeteer.launch(defaultOptions);
      this.isInitialized = true;
      this.logger.info('Headless Chrome browser initialized successfully', 
        this.useBiDi ? '(BiDi mode)' : '(CDP mode)');

      // Handle browser events
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected');
        this.isInitialized = false;
        this.biDiEventHandlers.clear();
        this.emit('browserDisconnected');
      });

      // Setup BiDi event handlers if enabled
      if (this.useBiDi) {
        this.setupBiDiEventHandlers();
      }

    } catch (error) {
      this.logger.error('Failed to initialize headless Chrome:', error);
      throw error;
    }
  }

  /**
   * Setup WebDriver BiDi event handlers for real-time monitoring
   */
  private setupBiDiEventHandlers(): void {
    if (!this.browser) return;

    this.logger.info('Setting up WebDriver BiDi event handlers');

    // These handlers would be attached to the browser instance
    // Note: Actual BiDi event API depends on Puppeteer version
    try {
      // Network monitoring (if supported)
      const networkHandler = (event: any) => {
        this.logger.debug('BiDi Network event:', event);
        this.emit('biDi:network', event);
      };
      this.biDiEventHandlers.set('network', networkHandler);

      // Console log streaming (if supported)
      const consoleHandler = (entry: any) => {
        this.logger.debug('BiDi Console entry:', entry);
        this.emit('biDi:console', entry);
      };
      this.biDiEventHandlers.set('console', consoleHandler);

      this.logger.info('BiDi event handlers configured');
    } catch (error) {
      this.logger.warn('BiDi event handlers not fully supported in this Puppeteer version');
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
   * Mine specific attributes from a webpage
   * Supports multiple selector strategies with fallbacks
   */
  async mineAttributes(
    pageId: string,
    url: string,
    attributes: Array<{
      name: string;
      selectors: string[];
      type?: 'text' | 'html' | 'attribute' | 'json';
      waitFor?: string;
      pattern?: string;
      validator?: any;
    }>
  ): Promise<any[]> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      this.logger.info(`Mining ${attributes.length} attributes from ${url}`);
      
      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const results = [];

      // Mine each attribute
      for (const attr of attributes) {
        const result = await this.extractAttribute(page, attr);
        results.push({
          name: attr.name,
          ...result
        });
      }

      this.logger.info(`Successfully mined ${results.filter(r => r.success).length}/${attributes.length} attributes`);
      return results;

    } catch (error) {
      this.logger.error(`Failed to mine attributes from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Extract a single attribute from a page
   */
  private async extractAttribute(
    page: Page,
    attribute: {
      name: string;
      selectors: string[];
      type?: 'text' | 'html' | 'attribute' | 'json';
      waitFor?: string;
      pattern?: string;
      validator?: any;
    }
  ): Promise<any> {
    try {
      // Wait for specific selector if provided
      if (attribute.waitFor) {
        try {
          await page.waitForSelector(attribute.waitFor, { timeout: 10000 });
        } catch (error) {
          this.logger.warn(`Wait selector not found: ${attribute.waitFor}`);
        }
      }

      // Try each selector in the fallback chain
      let extractedData = null;
      for (const selector of attribute.selectors) {
        try {
          const data = await page.evaluate((sel: string, attrType: string) => {
            const element = document.querySelector(sel);
            if (!element) return null;

            // Extract based on attribute type
            switch (attrType) {
              case 'text':
                return element.textContent?.trim();
              case 'html':
                return element.innerHTML;
              case 'attribute': {
                const parts = sel.split('@');
                return element.getAttribute(parts[1] || 'value');
              }
              case 'json':
                return JSON.parse(element.textContent || '{}');
              default:
                return element.textContent?.trim();
            }
          }, selector, attribute.type || 'text');

          if (data) {
            extractedData = data;
            this.logger.debug(`Extracted using selector: ${selector}`);
            break;
          }
        } catch (error) {
          this.logger.debug(`Selector failed: ${selector}`, error);
          continue;
        }
      }

      // Fallback to pattern-based extraction if no selector worked
      if (!extractedData && attribute.pattern) {
        extractedData = await page.evaluate((pattern: string) => {
          const bodyText = document.body.textContent || '';
          const regex = new RegExp(pattern);
          const match = bodyText.match(regex);
          return match ? match[1] || match[0] : null;
        }, attribute.pattern);
      }

      return {
        success: true,
        data: extractedData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Failed to extract attribute ${attribute.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate Open Graph social media image
   */
  async generateOGImage(
    template: string,
    data: Record<string, any>,
    options: {
      width?: number;
      height?: number;
      deviceScaleFactor?: number;
    } = {}
  ): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();

    try {
      // Set viewport to OG image dimensions
      await page.setViewport({
        width: options.width || 1200,
        height: options.height || 630,
        deviceScaleFactor: options.deviceScaleFactor || 2
      });

      // Simple template rendering
      const html = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || '';
      });

      // Load HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts and images to load
      await page.waitForTimeout(1000);

      // Generate screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'binary',
        omitBackground: false
      });

      this.logger.info('OG image generated successfully');
      return screenshot as Buffer;

    } finally {
      await page.close();
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
