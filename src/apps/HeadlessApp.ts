import puppeteer, { Browser, Page, LaunchOptions } from 'puppeteer';
import type { CDPSession } from 'puppeteer';
import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import { PerformanceMetrics, DOMAnalysis } from '../types/HeadlessTypes';

export interface HeadlessAppConfig {
  headless: boolean | 'new';
  devtools: boolean;
  slowMo: number;
  timeout: number;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
  };
  userAgent: string;
  args: string[];
}

export interface AdvancedFeatures {
  performanceTracing: boolean;
  accessibilityTesting: boolean;
  networkInterception: boolean;
  securityAudit: boolean;
  visualTesting: boolean;
  mobileEmulation: boolean;
}

export interface TestResult {
  url: string;
  timestamp: string;
  performance: PerformanceMetrics;
  accessibility: AccessibilityResult;
  security: SecurityResult;
  visual: VisualResult;
  network: NetworkResult;
  errors: Error[];
  warnings: string[];
  score: number;
}

export interface AccessibilityResult {
  score: number;
  violations: AccessibilityViolation[];
  recommendations: string[];
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  nodes: string[];
  tags: string[];
}

export interface SecurityResult {
  score: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  httpsStatus: boolean;
  mixedContent: boolean;
  cspStatus: boolean;
}

export interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  url: string;
  recommendation: string;
}

export interface VisualResult {
  score: number;
  layoutShift: number;
  colorContrast: number;
  fontReadability: number;
  responsiveDesign: boolean;
  mobileFriendly: boolean;
}

export interface NetworkResult {
  totalRequests: number;
  totalSize: number;
  loadTime: number;
  slowRequests: NetworkRequest[];
  failedRequests: NetworkRequest[];
  resourceTypes: Record<string, number>;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  size: number;
  duration: number;
  type: string;
}

export class HeadlessApp extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private cdpSessions: Map<string, CDPSession> = new Map();
  private logger: Logger;
  private config: HeadlessAppConfig;
  private features: AdvancedFeatures;
  private isInitialized = false;

  constructor(config?: Partial<HeadlessAppConfig>, features?: Partial<AdvancedFeatures>) {
    super();
    this.logger = new Logger('HeadlessApp');
    
    this.config = {
      headless: 'new',
      devtools: false,
      slowMo: 0,
      timeout: 30000,
      viewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      ...config
    };

    this.features = {
      performanceTracing: true,
      accessibilityTesting: true,
      networkInterception: true,
      securityAudit: true,
      visualTesting: true,
      mobileEmulation: false,
      ...features
    };
  }

  /**
   * Initialize the headless application
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing HeadlessApp with advanced features');

      const launchOptions: LaunchOptions = {
        headless: this.config.headless,
        devtools: this.config.devtools,
        slowMo: this.config.slowMo,
        args: this.config.args,
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: this.config.viewport
      };

      this.browser = await puppeteer.launch(launchOptions);
      this.isInitialized = true;

      this.logger.info('HeadlessApp initialized successfully');
      this.emit('initialized');

      // Handle browser events
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected');
        this.isInitialized = false;
        this.emit('disconnected');
      });

    } catch (error) {
      this.logger.error('Failed to initialize HeadlessApp:', error);
      throw error;
    }
  }

  /**
   * Create a new page with advanced features
   */
  async createPage(pageId: string, options: any = {}): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    try {
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport(this.config.viewport);
      
      // Set user agent
      await page.setUserAgent(this.config.userAgent);
      
      // Enable advanced features
      if (this.features.performanceTracing) {
        await this.enablePerformanceTracing(page);
      }
      
      if (this.features.networkInterception) {
        await this.enableNetworkInterception(page);
      }
      
      if (this.features.accessibilityTesting) {
        await this.enableAccessibilityTesting(page);
      }

      // Create CDP session for advanced features
      const cdpSession = await page.target().createCDPSession();
      this.cdpSessions.set(pageId, cdpSession);

      this.pages.set(pageId, page);
      this.logger.info(`Page ${pageId} created with advanced features`);
      
      this.emit('pageCreated', pageId);
      return page;
    } catch (error) {
      this.logger.error(`Failed to create page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Navigate to URL with advanced monitoring
   */
  async navigateToPage(pageId: string, url: string, options: any = {}): Promise<void> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      this.logger.info(`Navigating to ${url}`);
      
      const navigationOptions = {
        waitUntil: 'networkidle2' as const,
        timeout: this.config.timeout,
        ...options
      };

      await page.goto(url, navigationOptions);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState?.('networkidle');
      
      this.logger.info(`Successfully navigated to ${url}`);
      this.emit('navigationCompleted', pageId, url);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Run comprehensive test suite
   */
  async runComprehensiveTest(url: string, pageId?: string): Promise<TestResult> {
    const testPageId = pageId || `test_${Date.now()}`;
    
    try {
      this.logger.info(`Starting comprehensive test for ${url}`);
      
      // Create page if not provided
      if (!pageId) {
        await this.createPage(testPageId);
      }
      
      // Navigate to URL
      await this.navigateToPage(testPageId, url);
      
      const page = this.pages.get(testPageId)!;
      const cdpSession = this.cdpSessions.get(testPageId)!;
      
      // Run all tests in parallel
      const [
        performance,
        accessibility,
        security,
        visual,
        network
      ] = await Promise.all([
        this.testPerformance(page, cdpSession),
        this.testAccessibility(page, cdpSession),
        this.testSecurity(page, cdpSession),
        this.testVisual(page, cdpSession),
        this.testNetwork(page, cdpSession)
      ]);

      // Calculate overall score
      const scores = [performance.score, accessibility.score, security.score, visual.score, network.score];
      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      const result: TestResult = {
        url,
        timestamp: new Date().toISOString(),
        performance,
        accessibility,
        security,
        visual,
        network,
        errors: [],
        warnings: [],
        score: Math.round(overallScore)
      };

      this.logger.info(`Comprehensive test completed for ${url} - Score: ${result.score}`);
      this.emit('testCompleted', result);
      
      return result;
    } catch (error) {
      this.logger.error(`Comprehensive test failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Test performance metrics
   */
  private async testPerformance(page: Page, cdpSession: CDPSession): Promise<{ score: number; metrics: PerformanceMetrics }> {
    try {
      // Enable performance domain
      await cdpSession.send('Performance.enable');
      await cdpSession.send('Runtime.enable');

      // Get performance metrics
      const metrics = await page.metrics();
      const performanceEntries = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
          cumulativeLayoutShift: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
          totalBlockingTime: performance.getEntriesByType('longtask').reduce((sum, entry) => sum + entry.duration, 0)
        };
      });

      // Calculate performance score
      let score = 100;
      if (performanceEntries.loadComplete > 3000) score -= 20;
      if (performanceEntries.firstContentfulPaint > 1800) score -= 15;
      if (performanceEntries.largestContentfulPaint > 2500) score -= 15;
      if (performanceEntries.cumulativeLayoutShift > 0.1) score -= 10;
      if (performanceEntries.totalBlockingTime > 200) score -= 10;

      return {
        score: Math.max(0, score),
        metrics: performanceEntries
      };
    } catch (error) {
      this.logger.error('Performance test failed:', error);
      return { score: 0, metrics: {} as PerformanceMetrics };
    }
  }

  /**
   * Test accessibility
   */
  private async testAccessibility(page: Page, cdpSession: CDPSession): Promise<AccessibilityResult> {
    try {
      // Enable accessibility domain
      await cdpSession.send('Accessibility.enable');
      
      // Get accessibility tree
      const accessibilityTree = await cdpSession.send('Accessibility.getFullAXTree');
      
      // Run accessibility audit
      const auditResult = await page.evaluate(() => {
        // Basic accessibility checks
        const violations = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt) {
            violations.push({
              id: `missing-alt-${index}`,
              impact: 'serious',
              description: 'Image missing alt text',
              help: 'Add alt text to images for screen readers',
              nodes: [img.outerHTML],
              tags: ['wcag2a', 'wcag111', 'section508']
            });
          }
        });

        // Check for missing headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          violations.push({
            id: 'missing-headings',
            impact: 'moderate',
            description: 'Page missing heading structure',
            help: 'Add heading elements to structure content',
            nodes: ['<body>'],
            tags: ['wcag2a', 'wcag141']
          });
        }

        // Check for form labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
          if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') && !input.closest('label')) {
            violations.push({
              id: `missing-label-${index}`,
              impact: 'serious',
              description: 'Form control missing label',
              help: 'Add labels or aria-labels to form controls',
              nodes: [input.outerHTML],
              tags: ['wcag2a', 'wcag111', 'section508']
            });
          }
        });

        return violations;
      });

      // Calculate accessibility score
      const score = Math.max(0, 100 - (auditResult.length * 10));
      
      return {
        score,
        violations: auditResult,
        recommendations: [
          'Add alt text to all images',
          'Ensure proper heading hierarchy',
          'Add labels to all form controls',
          'Use semantic HTML elements',
          'Ensure sufficient color contrast'
        ],
        wcagLevel: 'AA'
      };
    } catch (error) {
      this.logger.error('Accessibility test failed:', error);
      return {
        score: 0,
        violations: [],
        recommendations: [],
        wcagLevel: 'AA'
      };
    }
  }

  /**
   * Test security
   */
  private async testSecurity(page: Page, cdpSession: CDPSession): Promise<SecurityResult> {
    try {
      // Enable security domain
      await cdpSession.send('Security.enable');
      
      const securityAudit = await page.evaluate(() => {
        const vulnerabilities = [];
        
        // Check HTTPS
        if (location.protocol !== 'https:') {
          vulnerabilities.push({
            type: 'insecure-connection',
            severity: 'high',
            description: 'Site not using HTTPS',
            url: location.href,
            recommendation: 'Enable HTTPS for secure communication'
          });
        }

        // Check for mixed content
        const mixedContent = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
        if (mixedContent.length > 0) {
          vulnerabilities.push({
            type: 'mixed-content',
            severity: 'medium',
            description: 'Mixed content detected',
            url: location.href,
            recommendation: 'Use HTTPS for all resources'
          });
        }

        // Check for CSP
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
          vulnerabilities.push({
            type: 'missing-csp',
            severity: 'medium',
            description: 'Content Security Policy not implemented',
            url: location.href,
            recommendation: 'Implement CSP to prevent XSS attacks'
          });
        }

        return vulnerabilities;
      });

      // Calculate security score
      const score = Math.max(0, 100 - (securityAudit.length * 20));
      
      return {
        score,
        vulnerabilities: securityAudit,
        recommendations: [
          'Enable HTTPS',
          'Implement Content Security Policy',
          'Use secure headers',
          'Regular security audits',
          'Keep dependencies updated'
        ],
        httpsStatus: location.protocol === 'https:',
        mixedContent: securityAudit.some(v => v.type === 'mixed-content'),
        cspStatus: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      };
    } catch (error) {
      this.logger.error('Security test failed:', error);
      return {
        score: 0,
        vulnerabilities: [],
        recommendations: [],
        httpsStatus: false,
        mixedContent: false,
        cspStatus: false
      };
    }
  }

  /**
   * Test visual aspects
   */
  private async testVisual(page: Page, cdpSession: CDPSession): Promise<VisualResult> {
    try {
      const visualAudit = await page.evaluate(() => {
        // Check layout shift
        const layoutShifts = performance.getEntriesByType('layout-shift');
        const cumulativeLayoutShift = layoutShifts.reduce((sum, entry) => sum + entry.value, 0);

        // Check viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        const responsiveDesign = !!viewport;

        // Check mobile-friendly elements
        const mobileFriendly = viewport && viewport.getAttribute('content')?.includes('width=device-width');

        return {
          layoutShift: cumulativeLayoutShift,
          responsiveDesign,
          mobileFriendly: !!mobileFriendly
        };
      });

      // Calculate visual score
      let score = 100;
      if (visualAudit.layoutShift > 0.1) score -= 20;
      if (!visualAudit.responsiveDesign) score -= 15;
      if (!visualAudit.mobileFriendly) score -= 10;

      return {
        score: Math.max(0, score),
        layoutShift: visualAudit.layoutShift,
        colorContrast: 85, // Placeholder - would need actual color analysis
        fontReadability: 90, // Placeholder - would need font analysis
        responsiveDesign: visualAudit.responsiveDesign,
        mobileFriendly: visualAudit.mobileFriendly
      };
    } catch (error) {
      this.logger.error('Visual test failed:', error);
      return {
        score: 0,
        layoutShift: 0,
        colorContrast: 0,
        fontReadability: 0,
        responsiveDesign: false,
        mobileFriendly: false
      };
    }
  }

  /**
   * Test network performance
   */
  private async testNetwork(page: Page, cdpSession: CDPSession): Promise<NetworkResult> {
    try {
      // Enable network domain
      await cdpSession.send('Network.enable');
      
      const networkData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        const resourceTypes: Record<string, number> = {};
        const slowRequests: any[] = [];
        const failedRequests: any[] = [];
        
        resources.forEach(resource => {
          const type = resource.initiatorType || 'other';
          resourceTypes[type] = (resourceTypes[type] || 0) + 1;
          
          if (resource.duration > 1000) {
            slowRequests.push({
              url: resource.name,
              method: 'GET',
              status: 200,
              size: resource.transferSize || 0,
              duration: resource.duration,
              type: type
            });
          }
          
          if (resource.transferSize === 0 && resource.duration > 100) {
            failedRequests.push({
              url: resource.name,
              method: 'GET',
              status: 0,
              size: 0,
              duration: resource.duration,
              type: type
            });
          }
        });

        return {
          totalRequests: resources.length,
          totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          slowRequests,
          failedRequests,
          resourceTypes
        };
      });

      return {
        totalRequests: networkData.totalRequests,
        totalSize: networkData.totalSize,
        loadTime: networkData.loadTime,
        slowRequests: networkData.slowRequests,
        failedRequests: networkData.failedRequests,
        resourceTypes: networkData.resourceTypes
      };
    } catch (error) {
      this.logger.error('Network test failed:', error);
      return {
        totalRequests: 0,
        totalSize: 0,
        loadTime: 0,
        slowRequests: [],
        failedRequests: [],
        resourceTypes: {}
      };
    }
  }

  /**
   * Enable performance tracing
   */
  private async enablePerformanceTracing(page: Page): Promise<void> {
    try {
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');
      await client.send('Runtime.enable');
      this.logger.debug('Performance tracing enabled');
    } catch (error) {
      this.logger.error('Failed to enable performance tracing:', error);
    }
  }

  /**
   * Enable network interception
   */
  private async enableNetworkInterception(page: Page): Promise<void> {
    try {
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        // Log requests for monitoring
        this.logger.debug(`Request: ${request.method()} ${request.url()}`);
        request.continue();
      });

      page.on('response', (response) => {
        // Log responses for monitoring
        this.logger.debug(`Response: ${response.status()} ${response.url()}`);
      });

      this.logger.debug('Network interception enabled');
    } catch (error) {
      this.logger.error('Failed to enable network interception:', error);
    }
  }

  /**
   * Enable accessibility testing
   */
  private async enableAccessibilityTesting(page: Page): Promise<void> {
    try {
      const client = await page.target().createCDPSession();
      await client.send('Accessibility.enable');
      this.logger.debug('Accessibility testing enabled');
    } catch (error) {
      this.logger.error('Failed to enable accessibility testing:', error);
    }
  }

  /**
   * Take screenshot with advanced options
   */
  async takeScreenshot(pageId: string, options: any = {}): Promise<Buffer> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const screenshotOptions = {
        fullPage: true,
        type: 'png' as const,
        quality: 90,
        ...options
      };

      const screenshot = await page.screenshot(screenshotOptions);
      this.logger.info(`Screenshot taken for page ${pageId}`);
      return screenshot;
    } catch (error) {
      this.logger.error(`Failed to take screenshot for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Generate PDF with advanced options
   */
  async generatePDF(pageId: string, options: any = {}): Promise<Buffer> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      const pdfOptions = {
        format: 'A4' as const,
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
        ...options
      };

      const pdf = await page.pdf(pdfOptions);
      this.logger.info(`PDF generated for page ${pageId}`);
      return pdf;
    } catch (error) {
      this.logger.error(`Failed to generate PDF for page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Close a page
   */
  async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    try {
      await page.close();
      this.pages.delete(pageId);
      
      const cdpSession = this.cdpSessions.get(pageId);
      if (cdpSession) {
        await cdpSession.detach();
        this.cdpSessions.delete(pageId);
      }

      this.logger.info(`Page ${pageId} closed`);
      this.emit('pageClosed', pageId);
    } catch (error) {
      this.logger.error(`Failed to close page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Get application status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      activePages: this.pages.size,
      config: this.config,
      features: this.features,
      browserConnected: !!this.browser
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up HeadlessApp');

      // Close all pages
      for (const [pageId, page] of this.pages) {
        try {
          await page.close();
        } catch (error) {
          this.logger.error(`Error closing page ${pageId}:`, error);
        }
      }

      // Detach all CDP sessions
      for (const [pageId, session] of this.cdpSessions) {
        try {
          await session.detach();
        } catch (error) {
          this.logger.error(`Error detaching CDP session ${pageId}:`, error);
        }
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      this.pages.clear();
      this.cdpSessions.clear();
      this.isInitialized = false;

      this.logger.info('HeadlessApp cleaned up successfully');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default HeadlessApp;
