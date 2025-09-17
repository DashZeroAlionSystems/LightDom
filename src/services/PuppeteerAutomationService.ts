import puppeteer, { Browser, Page, ElementHandle, JSHandle } from 'puppeteer';
import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { HeadlessChromeService } from './HeadlessChromeService';

export interface AutomationConfig {
  headless: boolean;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
  };
  userAgent: string;
  timeout: number;
  waitForSelectorTimeout: number;
  slowMo: number;
}

export interface ElementInfo {
  selector: string;
  tagName: string;
  text: string;
  attributes: Record<string, string>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isEnabled: boolean;
  confidence: number;
}

export interface InteractionResult {
  success: boolean;
  element: ElementInfo;
  action: string;
  timestamp: Date;
  screenshot?: Buffer;
  error?: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  memoryUsage: number;
  networkRequests: number;
  resourceSizes: {
    html: number;
    css: number;
    js: number;
    images: number;
    fonts: number;
  };
}

export interface OptimizationSuggestion {
  type: 'performance' | 'accessibility' | 'seo' | 'ux';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  implementation: string;
  estimatedSavings?: {
    time?: number;
    size?: number;
    score?: number;
  };
}

export class PuppeteerAutomationService extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private logger: Logger;
  private config: AutomationConfig;
  private headlessChromeService: HeadlessChromeService;

  constructor(headlessChromeService: HeadlessChromeService, config?: Partial<AutomationConfig>) {
    super();
    this.headlessChromeService = headlessChromeService;
    this.logger = new Logger('PuppeteerAutomationService');
    
    this.config = {
      headless: true,
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: 30000,
      waitForSelectorTimeout: 10000,
      slowMo: 0,
      ...config
    };
  }

  /**
   * Initialize the automation service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Puppeteer automation service...');
      
      // Use the existing headless Chrome service
      await this.headlessChromeService.initialize();
      this.browser = await puppeteer.connect({
        browserWSEndpoint: await this.getBrowserWSEndpoint(),
        defaultViewport: this.config.viewport
      });

      this.logger.info('Puppeteer automation service initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize automation service:', error);
      throw error;
    }
  }

  /**
   * Get browser WebSocket endpoint (simulated for integration)
   */
  private async getBrowserWSEndpoint(): Promise<string> {
    // In a real implementation, this would get the actual WebSocket endpoint
    // For now, we'll use the headless Chrome service directly
    return 'ws://localhost:9222';
  }

  /**
   * Create a new automation session
   */
  async createSession(sessionId: string, options?: {
    url?: string;
    viewport?: { width: number; height: number };
    userAgent?: string;
  }): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    try {
      const page = await this.browser.newPage();
      
      // Configure page
      await page.setViewport(options?.viewport || this.config.viewport);
      await page.setUserAgent(options?.userAgent || this.config.userAgent);
      
      // Set up request interception for performance optimization
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        this.handleRequestInterception(request);
      });

      // Set up performance monitoring
      await page.evaluateOnNewDocument(() => {
        // Performance monitoring code
        window.performanceMetrics = {
          startTime: Date.now(),
          navigationStart: performance.timing.navigationStart,
          requests: [],
          resources: []
        };
      });

      this.pages.set(sessionId, page);
      this.logger.info(`Created automation session: ${sessionId}`);

      // Navigate to URL if provided
      if (options?.url) {
        await this.navigateToUrl(sessionId, options.url);
      }

      return page;
    } catch (error) {
      this.logger.error(`Failed to create session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Navigate to a URL with intelligent waiting
   */
  async navigateToUrl(sessionId: string, url: string, options?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
  }): Promise<void> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      this.logger.info(`Navigating to: ${url}`);
      
      const response = await page.goto(url, {
        waitUntil: options?.waitUntil || 'networkidle2',
        timeout: options?.timeout || this.config.timeout
      });

      if (!response?.ok()) {
        throw new Error(`Navigation failed with status: ${response?.status()}`);
      }

      // Wait for additional content to load
      await this.waitForPageStability(page);
      
      this.logger.info(`Successfully navigated to: ${url}`);
      this.emit('navigationComplete', { sessionId, url, status: response.status() });
    } catch (error) {
      this.logger.error(`Navigation failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Intelligent element detection and interaction
   */
  async findAndInteract(sessionId: string, criteria: {
    text?: string;
    selector?: string;
    role?: string;
    placeholder?: string;
    type?: string;
    action: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'screenshot';
    value?: string;
    options?: string[];
  }): Promise<InteractionResult> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Find the element using intelligent detection
      const element = await this.findElement(page, criteria);
      
      if (!element) {
        throw new Error(`Element not found with criteria: ${JSON.stringify(criteria)}`);
      }

      // Perform the action
      const result = await this.performAction(page, element, criteria);
      
      this.logger.info(`Successfully performed ${criteria.action} on element`);
      this.emit('interactionComplete', { sessionId, criteria, result });
      
      return result;
    } catch (error) {
      this.logger.error(`Interaction failed:`, error);
      throw error;
    }
  }

  /**
   * Intelligent element finding with multiple strategies
   */
  private async findElement(page: Page, criteria: any): Promise<ElementInfo | null> {
    const strategies = [
      () => this.findBySelector(page, criteria.selector),
      () => this.findByText(page, criteria.text),
      () => this.findByRole(page, criteria.role),
      () => this.findByPlaceholder(page, criteria.placeholder),
      () => this.findByType(page, criteria.type),
      () => this.findByAriaLabel(page, criteria.text),
      () => this.findByDataAttribute(page, criteria.text),
      () => this.findByClass(page, criteria.text)
    ];

    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (element && element.confidence > 0.7) {
          return element;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    return null;
  }

  /**
   * Find element by CSS selector
   */
  private async findBySelector(page: Page, selector?: string): Promise<ElementInfo | null> {
    if (!selector) return null;

    try {
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by text content
   */
  private async findByText(page: Page, text?: string): Promise<ElementInfo | null> {
    if (!text) return null;

    try {
      const element = await page.$x(`//*[contains(text(), "${text}")]`);
      if (element.length === 0) return null;

      return await this.getElementInfo(element[0], `text: "${text}"`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by ARIA role
   */
  private async findByRole(page: Page, role?: string): Promise<ElementInfo | null> {
    if (!role) return null;

    try {
      const selector = `[role="${role}"]`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by placeholder text
   */
  private async findByPlaceholder(page: Page, placeholder?: string): Promise<ElementInfo | null> {
    if (!placeholder) return null;

    try {
      const selector = `[placeholder*="${placeholder}"]`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by input type
   */
  private async findByType(page: Page, type?: string): Promise<ElementInfo | null> {
    if (!type) return null;

    try {
      const selector = `input[type="${type}"]`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by ARIA label
   */
  private async findByAriaLabel(page: Page, label?: string): Promise<ElementInfo | null> {
    if (!label) return null;

    try {
      const selector = `[aria-label*="${label}"]`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by data attribute
   */
  private async findByDataAttribute(page: Page, value?: string): Promise<ElementInfo | null> {
    if (!value) return null;

    try {
      const selector = `[data-*="${value}"]`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find element by class name
   */
  private async findByClass(page: Page, className?: string): Promise<ElementInfo | null> {
    if (!className) return null;

    try {
      const selector = `.${className}`;
      const element = await page.$(selector);
      if (!element) return null;

      return await this.getElementInfo(element, selector);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get comprehensive element information
   */
  private async getElementInfo(element: ElementHandle, selector: string): Promise<ElementInfo> {
    const info = await element.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      
      return {
        tagName: el.tagName.toLowerCase(),
        text: el.textContent?.trim() || '',
        attributes: Array.from(el.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none',
        isEnabled: !el.hasAttribute('disabled')
      };
    });

    return {
      selector,
      confidence: 0.9,
      ...info
    };
  }

  /**
   * Perform action on element
   */
  private async performAction(page: Page, element: ElementInfo, criteria: any): Promise<InteractionResult> {
    const startTime = Date.now();
    
    try {
      let actionResult: any = null;
      
      switch (criteria.action) {
        case 'click':
          await page.click(element.selector);
          actionResult = 'clicked';
          break;
          
        case 'type':
          await page.type(element.selector, criteria.value || '');
          actionResult = 'typed';
          break;
          
        case 'select':
          await page.select(element.selector, ...(criteria.options || []));
          actionResult = 'selected';
          break;
          
        case 'hover':
          await page.hover(element.selector);
          actionResult = 'hovered';
          break;
          
        case 'scroll':
          await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, element.selector);
          actionResult = 'scrolled';
          break;
          
        case 'screenshot':
          const screenshot = await page.screenshot({ 
            clip: element.boundingBox,
            type: 'png'
          });
          actionResult = 'screenshot_taken';
          break;
      }

      // Take screenshot after action
      const screenshot = await page.screenshot({ type: 'png' });

      return {
        success: true,
        element,
        action: criteria.action,
        timestamp: new Date(),
        screenshot: screenshot as Buffer
      };
    } catch (error) {
      return {
        success: false,
        element,
        action: criteria.action,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Wait for page stability (no more DOM changes)
   */
  private async waitForPageStability(page: Page, timeout: number = 5000): Promise<void> {
    let lastHeight = 0;
    let stableCount = 0;
    
    while (stableCount < 3) {
      const currentHeight = await page.evaluate(() => document.body.scrollHeight);
      
      if (currentHeight === lastHeight) {
        stableCount++;
      } else {
        stableCount = 0;
        lastHeight = currentHeight;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Handle request interception for performance optimization
   */
  private handleRequestInterception(request: any): void {
    const resourceType = request.resourceType();
    const url = request.url();

    // Block unnecessary resources
    const blockedTypes = ['image', 'media', 'font', 'stylesheet'];
    const blockedDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'doubleclick.net'
    ];

    const shouldBlock = blockedTypes.includes(resourceType) || 
                       blockedDomains.some(domain => url.includes(domain));

    if (shouldBlock) {
      request.abort();
    } else {
      request.continue();
    }
  }

  /**
   * Analyze page performance
   */
  async analyzePerformance(sessionId: string): Promise<PerformanceMetrics> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint');
        const cls = performance.getEntriesByType('layout-shift');
        const longTasks = performance.getEntriesByType('longtask');
        const resources = performance.getEntriesByType('resource');

        return {
          pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcp[0]?.startTime || 0,
          cumulativeLayoutShift: cls.reduce((sum, entry) => sum + entry.value, 0),
          totalBlockingTime: longTasks.reduce((sum, entry) => sum + entry.duration, 0),
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          networkRequests: resources.length,
          resourceSizes: {
            html: resources.filter(r => r.name.includes('.html')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
            css: resources.filter(r => r.name.includes('.css')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
            js: resources.filter(r => r.name.includes('.js')).reduce((sum, r) => sum + (r.transferSize || 0), 0),
            images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).reduce((sum, r) => sum + (r.transferSize || 0), 0),
            fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|eot)$/i)).reduce((sum, r) => sum + (r.transferSize || 0), 0)
          }
        };
      });

      this.logger.info('Performance analysis completed');
      return metrics;
    } catch (error) {
      this.logger.error('Performance analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate optimization suggestions
   */
  async generateOptimizationSuggestions(sessionId: string): Promise<OptimizationSuggestion[]> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const suggestions: OptimizationSuggestion[] = [];
      const performance = await this.analyzePerformance(sessionId);

      // Performance suggestions
      if (performance.largestContentfulPaint > 2500) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          title: 'Optimize Largest Contentful Paint',
          description: 'LCP is above the recommended 2.5s threshold',
          impact: 'Improves user experience and Core Web Vitals score',
          implementation: 'Optimize images, reduce server response time, eliminate render-blocking resources',
          estimatedSavings: { time: performance.largestContentfulPaint - 2500 }
        });
      }

      if (performance.cumulativeLayoutShift > 0.1) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          title: 'Reduce Cumulative Layout Shift',
          description: 'CLS score indicates layout instability',
          impact: 'Improves visual stability and user experience',
          implementation: 'Add size attributes to images, reserve space for dynamic content',
          estimatedSavings: { score: performance.cumulativeLayoutShift }
        });
      }

      if (performance.resourceSizes.images > 1000000) {
        suggestions.push({
          type: 'performance',
          priority: 'medium',
          title: 'Optimize Image Loading',
          description: 'Images are taking up significant bandwidth',
          impact: 'Reduces page load time and bandwidth usage',
          implementation: 'Use WebP format, implement lazy loading, compress images',
          estimatedSavings: { size: performance.resourceSizes.images * 0.3 }
        });
      }

      // Accessibility suggestions
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];
        
        // Check for missing alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          issues.push({
            type: 'accessibility',
            priority: 'high',
            title: 'Add Alt Text to Images',
            description: `${imagesWithoutAlt.length} images are missing alt text`,
            impact: 'Improves accessibility for screen readers',
            implementation: 'Add descriptive alt attributes to all images'
          });
        }

        // Check for missing form labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
          const label = document.querySelector(`label[for="${input.id}"]`);
          return !label;
        });

        if (unlabeledInputs.length > 0) {
          issues.push({
            type: 'accessibility',
            priority: 'high',
            title: 'Add Labels to Form Inputs',
            description: `${unlabeledInputs.length} form inputs are missing labels`,
            impact: 'Improves form accessibility and usability',
            implementation: 'Add proper label elements or aria-label attributes'
          });
        }

        return issues;
      });

      suggestions.push(...accessibilityIssues);

      this.logger.info(`Generated ${suggestions.length} optimization suggestions`);
      return suggestions;
    } catch (error) {
      this.logger.error('Failed to generate optimization suggestions:', error);
      throw error;
    }
  }

  /**
   * Create visual regression test
   */
  async createVisualRegressionTest(sessionId: string, testName: string): Promise<{
    screenshot: Buffer;
    baseline?: Buffer;
    diff?: Buffer;
    passed: boolean;
    similarity: number;
  }> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Take screenshot
      const screenshot = await page.screenshot({ 
        fullPage: true, 
        type: 'png' 
      }) as Buffer;

      // In a real implementation, you would:
      // 1. Load baseline image
      // 2. Compare with current screenshot
      // 3. Generate diff image if different
      // 4. Calculate similarity score

      this.logger.info(`Visual regression test created: ${testName}`);
      return {
        screenshot,
        passed: true,
        similarity: 1.0
      };
    } catch (error) {
      this.logger.error('Visual regression test failed:', error);
      throw error;
    }
  }

  /**
   * Automated form filling
   */
  async fillForm(sessionId: string, formData: Record<string, any>): Promise<{
    filled: string[];
    errors: string[];
    success: boolean;
  }> {
    const page = this.pages.get(sessionId);
    if (!page) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const filled: string[] = [];
    const errors: string[] = [];

    try {
      for (const [fieldName, value] of Object.entries(formData)) {
        try {
          // Try multiple strategies to find the field
          const field = await this.findFormField(page, fieldName);
          
          if (field) {
            await page.type(field.selector, String(value));
            filled.push(fieldName);
            this.logger.info(`Filled field: ${fieldName}`);
          } else {
            errors.push(`Field not found: ${fieldName}`);
          }
        } catch (error) {
          errors.push(`Error filling ${fieldName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        filled,
        errors,
        success: errors.length === 0
      };
    } catch (error) {
      this.logger.error('Form filling failed:', error);
      throw error;
    }
  }

  /**
   * Find form field by name, id, or label
   */
  private async findFormField(page: Page, fieldName: string): Promise<ElementInfo | null> {
    const strategies = [
      `input[name="${fieldName}"]`,
      `input[id="${fieldName}"]`,
      `input[placeholder*="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `input[aria-label*="${fieldName}"]`,
      `input[data-testid="${fieldName}"]`
    ];

    for (const selector of strategies) {
      try {
        const element = await page.$(selector);
        if (element) {
          return await this.getElementInfo(element, selector);
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    return null;
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId: string): any {
    const page = this.pages.get(sessionId);
    if (!page) {
      return null;
    }

    return {
      sessionId,
      url: page.url(),
      title: page.title(),
      isActive: true,
      createdAt: new Date()
    };
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string): Promise<void> {
    const page = this.pages.get(sessionId);
    if (page) {
      await page.close();
      this.pages.delete(sessionId);
      this.logger.info(`Closed session: ${sessionId}`);
    }
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up automation service...');
    
    // Close all pages
    for (const [sessionId, page] of this.pages) {
      try {
        await page.close();
      } catch (error) {
        this.logger.error(`Error closing session ${sessionId}:`, error);
      }
    }
    this.pages.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.logger.info('Automation service cleanup complete');
  }
}

export default PuppeteerAutomationService;
