/**
 * Headless Browser Service - Advanced Chrome DevTools Protocol integration
 * Provides headless browser automation for DOM optimization and analysis
 */

import { EventEmitter } from 'events';
import puppeteer, { Browser, Page, CDPSession } from 'puppeteer';
import { performance } from 'perf_hooks';

export interface BrowserConfig {
  headless: boolean;
  devtools: boolean;
  args: string[];
  defaultViewport: {
    width: number;
    height: number;
  };
  timeout: number;
  maxConcurrentPages: number;
  enableServiceWorker: boolean;
  enableCache: boolean;
  userAgent?: string;
}

export interface OptimizationResult {
  url: string;
  originalSize: number;
  optimizedSize: number;
  spaceSaved: number;
  spaceSavedPercentage: number;
  optimizations: Optimization[];
  performance: PerformanceMetrics;
  timestamp: number;
}

export interface Optimization {
  type: 'css' | 'js' | 'html' | 'images' | 'fonts' | 'other';
  description: string;
  spaceSaved: number;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
  speedIndex: number;
}

export interface ServiceWorkerConfig {
  enabled: boolean;
  cacheStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  cacheName: string;
  maxCacheSize: number;
  offlineSupport: boolean;
}

export class HeadlessBrowserService extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private cdpSessions: Map<string, CDPSession> = new Map();
  private config: BrowserConfig;
  private serviceWorkerConfig: ServiceWorkerConfig;
  private isRunning = false;
  private pageCounter = 0;

  constructor(config: Partial<BrowserConfig> = {}) {
    super();
    this.config = {
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--use-mock-keychain',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Disable images for faster loading
        '--disable-javascript', // Disable JS for initial analysis
        '--disable-css', // Disable CSS for initial analysis
        '--disable-fonts', // Disable fonts for initial analysis
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      timeout: 30000,
      maxConcurrentPages: 10,
      enableServiceWorker: true,
      enableCache: true,
      ...config
    };

    this.serviceWorkerConfig = {
      enabled: true,
      cacheStrategy: 'cacheFirst',
      cacheName: 'lightdom-cache',
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      offlineSupport: true
    };
  }

  /**
   * Initialize the browser service
   */
  async initialize(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Headless browser service is already running');
      return;
    }

    try {
      console.log('🚀 Initializing headless browser service...');

      // Launch browser with configuration
      this.browser = await puppeteer.launch({
        headless: this.config.headless ? 'new' : false,
        devtools: this.config.devtools,
        args: this.config.args,
        defaultViewport: this.config.defaultViewport,
        timeout: this.config.timeout
      });

      // Set up browser event handlers
      this.setupBrowserEventHandlers();

      this.isRunning = true;
      this.emit('initialized');

      console.log('✅ Headless browser service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize headless browser service:', error);
      throw error;
    }
  }

  /**
   * Create a new page for optimization
   */
  async createPage(url: string): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    if (this.pages.size >= this.config.maxConcurrentPages) {
      throw new Error('Maximum concurrent pages reached');
    }

    try {
      const page = await this.browser.newPage();
      const pageId = `page_${++this.pageCounter}_${Date.now()}`;
      
      // Configure page
      await this.configurePage(page, url);
      
      // Store page
      this.pages.set(pageId, page);
      
      // Set up page event handlers
      this.setupPageEventHandlers(page, pageId);
      
      this.emit('pageCreated', { pageId, url });
      
      return page;
    } catch (error) {
      console.error('❌ Failed to create page:', error);
      throw error;
    }
  }

  /**
   * Configure page for optimization
   */
  private async configurePage(page: Page, url: string): Promise<void> {
    // Set user agent
    if (this.config.userAgent) {
      await page.setUserAgent(this.config.userAgent);
    }

    // Enable service worker if configured
    if (this.serviceWorkerConfig.enabled) {
      await this.setupServiceWorker(page);
    }

    // Set up request interception for optimization
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      
      // Block unnecessary resources for initial analysis
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set up response interception for analysis
    page.on('response', (response) => {
      this.analyzeResponse(response);
    });
  }

  /**
   * Set up service worker for caching and offline support
   */
  private async setupServiceWorker(page: Page): Promise<void> {
    const serviceWorkerScript = `
      const CACHE_NAME = '${this.serviceWorkerConfig.cacheName}';
      const MAX_CACHE_SIZE = ${this.serviceWorkerConfig.maxCacheSize};
      
      // Install service worker
      self.addEventListener('install', (event) => {
        console.log('LightDom Service Worker installed');
        self.skipWaiting();
      });
      
      // Activate service worker
      self.addEventListener('activate', (event) => {
        console.log('LightDom Service Worker activated');
        event.waitUntil(self.clients.claim());
      });
      
      // Handle fetch requests
      self.addEventListener('fetch', (event) => {
        const request = event.request;
        const url = new URL(request.url);
        
        // Only handle same-origin requests
        if (url.origin !== location.origin) {
          return;
        }
        
        event.respondWith(handleRequest(request));
      });
      
      async function handleRequest(request) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        try {
          // Fetch from network
          const networkResponse = await fetch(request);
          
          // Cache the response
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.error('Network request failed:', error);
          return new Response('Offline', { status: 503 });
        }
      }
      
      // Clean up old caches
      self.addEventListener('message', (event) => {
        if (event.data.action === 'cleanup') {
          cleanupCaches();
        }
      });
      
      async function cleanupCaches() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);
        
        await Promise.all(
          oldCaches.map(name => caches.delete(name))
        );
      }
    `;

    // Inject service worker script
    await page.evaluateOnNewDocument(serviceWorkerScript);
  }

  /**
   * Analyze response for optimization opportunities
   */
  private analyzeResponse(response: any): void {
    const url = response.url();
    const status = response.status();
    const headers = response.headers();
    const contentLength = headers['content-length'];
    
    if (status === 200 && contentLength) {
      const size = parseInt(contentLength);
      const contentType = headers['content-type'] || '';
      
      // Analyze different resource types
      if (contentType.includes('text/html')) {
        this.analyzeHTMLResponse(url, size, response);
      } else if (contentType.includes('text/css')) {
        this.analyzeCSSResponse(url, size, response);
      } else if (contentType.includes('application/javascript')) {
        this.analyzeJSResponse(url, size, response);
      }
    }
  }

  /**
   * Analyze HTML response
   */
  private async analyzeHTMLResponse(url: string, size: number, response: any): Promise<void> {
    try {
      const content = await response.text();
      
      // Analyze HTML for optimization opportunities
      const optimizations = this.analyzeHTML(content);
      
      if (optimizations.length > 0) {
        this.emit('htmlOptimization', {
          url,
          originalSize: size,
          optimizations
        });
      }
    } catch (error) {
      console.error('Error analyzing HTML response:', error);
    }
  }

  /**
   * Analyze CSS response
   */
  private async analyzeCSSResponse(url: string, size: number, response: any): Promise<void> {
    try {
      const content = await response.text();
      
      // Analyze CSS for optimization opportunities
      const optimizations = this.analyzeCSS(content);
      
      if (optimizations.length > 0) {
        this.emit('cssOptimization', {
          url,
          originalSize: size,
          optimizations
        });
      }
    } catch (error) {
      console.error('Error analyzing CSS response:', error);
    }
  }

  /**
   * Analyze JavaScript response
   */
  private async analyzeJSResponse(url: string, size: number, response: any): Promise<void> {
    try {
      const content = await response.text();
      
      // Analyze JS for optimization opportunities
      const optimizations = this.analyzeJS(content);
      
      if (optimizations.length > 0) {
        this.emit('jsOptimization', {
          url,
          originalSize: size,
          optimizations
        });
      }
    } catch (error) {
      console.error('Error analyzing JS response:', error);
    }
  }

  /**
   * Analyze HTML content for optimization opportunities
   */
  private analyzeHTML(content: string): Optimization[] {
    const optimizations: Optimization[] = [];
    
    // Remove unnecessary whitespace
    const originalLength = content.length;
    const minified = content
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    
    const spaceSaved = originalLength - minified.length;
    if (spaceSaved > 0) {
      optimizations.push({
        type: 'html',
        description: 'Remove unnecessary whitespace',
        spaceSaved,
        impact: spaceSaved > 1000 ? 'high' : 'medium',
        implementation: 'Minify HTML by removing extra whitespace'
      });
    }
    
    // Remove comments
    const commentRegex = /<!--[\s\S]*?-->/g;
    const withoutComments = content.replace(commentRegex, '');
    const commentSpaceSaved = content.length - withoutComments.length;
    
    if (commentSpaceSaved > 0) {
      optimizations.push({
        type: 'html',
        description: 'Remove HTML comments',
        spaceSaved: commentSpaceSaved,
        impact: commentSpaceSaved > 500 ? 'medium' : 'low',
        implementation: 'Remove HTML comments from production builds'
      });
    }
    
    // Optimize attributes
    const attributeOptimizations = this.optimizeHTMLAttributes(content);
    optimizations.push(...attributeOptimizations);
    
    return optimizations;
  }

  /**
   * Analyze CSS content for optimization opportunities
   */
  private analyzeCSS(content: string): Optimization[] {
    const optimizations: Optimization[] = [];
    
    // Remove unnecessary whitespace and comments
    const originalLength = content.length;
    const minified = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
      .replace(/\s*{\s*/g, '{') // Remove spaces around opening braces
      .replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
      .replace(/;\s*;/g, ';') // Remove duplicate semicolons
      .trim();
    
    const spaceSaved = originalLength - minified.length;
    if (spaceSaved > 0) {
      optimizations.push({
        type: 'css',
        description: 'Minify CSS',
        spaceSaved,
        impact: spaceSaved > 2000 ? 'high' : 'medium',
        implementation: 'Minify CSS by removing comments and unnecessary whitespace'
      });
    }
    
    // Remove unused CSS rules
    const unusedRules = this.findUnusedCSSRules(content);
    if (unusedRules.length > 0) {
      optimizations.push({
        type: 'css',
        description: `Remove ${unusedRules.length} unused CSS rules`,
        spaceSaved: unusedRules.reduce((sum, rule) => sum + rule.length, 0),
        impact: 'medium',
        implementation: 'Remove unused CSS rules using tools like PurgeCSS'
      });
    }
    
    return optimizations;
  }

  /**
   * Analyze JavaScript content for optimization opportunities
   */
  private analyzeJS(content: string): Optimization[] {
    const optimizations: Optimization[] = [];
    
    // Remove unnecessary whitespace and comments
    const originalLength = content.length;
    const minified = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}();,])\s*/g, '$1') // Remove spaces around operators
      .trim();
    
    const spaceSaved = originalLength - minified.length;
    if (spaceSaved > 0) {
      optimizations.push({
        type: 'js',
        description: 'Minify JavaScript',
        spaceSaved,
        impact: spaceSaved > 5000 ? 'high' : 'medium',
        implementation: 'Minify JavaScript using tools like Terser'
      });
    }
    
    // Remove unused code
    const unusedCode = this.findUnusedJSCode(content);
    if (unusedCode.length > 0) {
      optimizations.push({
        type: 'js',
        description: `Remove ${unusedCode.length} unused functions/variables`,
        spaceSaved: unusedCode.reduce((sum, code) => sum + code.length, 0),
        impact: 'medium',
        implementation: 'Remove unused code using tree-shaking'
      });
    }
    
    return optimizations;
  }

  /**
   * Optimize HTML attributes
   */
  private optimizeHTMLAttributes(content: string): Optimization[] {
    const optimizations: Optimization[] = [];
    
    // Remove unnecessary attributes
    const unnecessaryAttributes = [
      /type="text\/javascript"/g,
      /type="text\/css"/g,
      /language="javascript"/g
    ];
    
    let totalSpaceSaved = 0;
    unnecessaryAttributes.forEach(regex => {
      const matches = content.match(regex);
      if (matches) {
        totalSpaceSaved += matches.reduce((sum, match) => sum + match.length, 0);
      }
    });
    
    if (totalSpaceSaved > 0) {
      optimizations.push({
        type: 'html',
        description: 'Remove unnecessary attributes',
        spaceSaved: totalSpaceSaved,
        impact: 'low',
        implementation: 'Remove unnecessary type and language attributes'
      });
    }
    
    return optimizations;
  }

  /**
   * Find unused CSS rules (simplified implementation)
   */
  private findUnusedCSSRules(content: string): string[] {
    // This is a simplified implementation
    // In a real scenario, you would need to analyze the HTML to see which selectors are actually used
    const unusedRules: string[] = [];
    
    // Find CSS rules that are likely unused
    const cssRules = content.match(/[^{}]+{[^}]*}/g) || [];
    
    cssRules.forEach(rule => {
      // Check for common unused patterns
      if (rule.includes('display: none') || 
          rule.includes('visibility: hidden') ||
          rule.includes('opacity: 0')) {
        unusedRules.push(rule);
      }
    });
    
    return unusedRules;
  }

  /**
   * Find unused JavaScript code (simplified implementation)
   */
  private findUnusedJSCode(content: string): string[] {
    // This is a simplified implementation
    // In a real scenario, you would need to analyze the code to find truly unused functions
    const unusedCode: string[] = [];
    
    // Find function declarations
    const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
    
    functions.forEach(func => {
      const functionName = func.match(/function\s+(\w+)/)?.[1];
      if (functionName) {
        // Check if function is called elsewhere in the code
        const callRegex = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
        const calls = content.match(callRegex) || [];
        
        if (calls.length <= 1) { // Only the declaration, no calls
          unusedCode.push(func);
        }
      }
    });
    
    return unusedCode;
  }

  /**
   * Set up browser event handlers
   */
  private setupBrowserEventHandlers(): void {
    if (!this.browser) return;

    this.browser.on('disconnected', () => {
      console.log('🔌 Browser disconnected');
      this.isRunning = false;
      this.emit('disconnected');
    });

    this.browser.on('targetcreated', (target) => {
      console.log('🎯 New target created:', target.url());
    });

    this.browser.on('targetdestroyed', (target) => {
      console.log('🗑️ Target destroyed:', target.url());
    });
  }

  /**
   * Set up page event handlers
   */
  private setupPageEventHandlers(page: Page, pageId: string): void {
    page.on('load', () => {
      console.log(`📄 Page loaded: ${pageId}`);
      this.emit('pageLoaded', { pageId });
    });

    page.on('error', (error) => {
      console.error(`❌ Page error (${pageId}):`, error);
      this.emit('pageError', { pageId, error });
    });

    page.on('close', () => {
      console.log(`🔒 Page closed: ${pageId}`);
      this.pages.delete(pageId);
      this.emit('pageClosed', { pageId });
    });
  }

  /**
   * Get browser status
   */
  getStatus(): {
    running: boolean;
    pages: number;
    maxPages: number;
    config: BrowserConfig;
  } {
    return {
      running: this.isRunning,
      pages: this.pages.size,
      maxPages: this.config.maxConcurrentPages,
      config: this.config
    };
  }

  /**
   * Close the browser service
   */
  async close(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Closing headless browser service...');

    // Close all pages
    for (const [pageId, page] of this.pages) {
      try {
        await page.close();
      } catch (error) {
        console.error(`Error closing page ${pageId}:`, error);
      }
    }
    this.pages.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.isRunning = false;
    this.emit('closed');

    console.log('✅ Headless browser service closed');
  }
}

// Export singleton instance
export const headlessBrowserService = new HeadlessBrowserService();
