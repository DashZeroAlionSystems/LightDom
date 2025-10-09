import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import HeadlessChromeService from './HeadlessChromeService';
import WebCrawlerService from './WebCrawlerService';
import { OptimizationResult, OptimizationOptions, OptimizationRule } from '../types/OptimizationTypes';
import { Queue } from 'bull';
import Redis from 'ioredis';

export class OptimizationEngine extends EventEmitter {
  private headlessService: HeadlessChromeService;
  private crawlerService: WebCrawlerService;
  private logger: Logger;
  private optimizationQueue: Queue;
  private redis: Redis;
  private isRunning = false;
  private activeOptimizations = new Map<string, any>();
  private optimizationRules: OptimizationRule[] = [];

  constructor() {
    super();
    this.headlessService = new HeadlessChromeService();
    this.crawlerService = new WebCrawlerService();
    this.logger = new Logger('OptimizationEngine');
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.optimizationQueue = new Queue('optimization-queue', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    });

    this.setupQueueProcessing();
    this.loadOptimizationRules();
  }

  /**
   * Initialize the optimization engine
   */
  async initialize(): Promise<void> {
    try {
      await this.headlessService.initialize();
      await this.crawlerService.initialize();
      this.isRunning = true;
      this.logger.info('OptimizationEngine initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OptimizationEngine:', error);
      throw error;
    }
  }

  /**
   * Setup queue processing
   */
  private setupQueueProcessing(): void {
    this.optimizationQueue.process('optimize-website', 3, async (job) => {
      const { url, options, optimizationId } = job.data;
      return await this.processOptimizationJob(url, options, optimizationId);
    });

    this.optimizationQueue.on('completed', (job, result) => {
      this.logger.info(`Optimization job ${job.id} completed`);
      this.emit('optimizationCompleted', { jobId: job.id, result });
    });

    this.optimizationQueue.on('failed', (job, err) => {
      this.logger.error(`Optimization job ${job.id} failed:`, err);
      this.emit('optimizationFailed', { jobId: job.id, error: err });
    });
  }

  /**
   * Load optimization rules
   */
  private loadOptimizationRules(): void {
    this.optimizationRules = [
      // Image optimization rules
      {
        id: 'image-compression',
        name: 'Image Compression',
        category: 'performance',
        priority: 'high',
        description: 'Compress images to reduce file size',
        conditions: {
          imageCount: { min: 1 },
          imageSize: { min: 100000 } // 100KB
        },
        actions: ['compress-images', 'convert-webp', 'lazy-load']
      },
      {
        id: 'image-alt-text',
        name: 'Image Alt Text',
        category: 'accessibility',
        priority: 'high',
        description: 'Add alt text to images for accessibility',
        conditions: {
          imagesWithoutAlt: { min: 1 }
        },
        actions: ['add-alt-text', 'generate-alt-text']
      },
      {
        id: 'image-responsive',
        name: 'Responsive Images',
        category: 'performance',
        priority: 'medium',
        description: 'Make images responsive for different screen sizes',
        conditions: {
          oversizedImages: { min: 1 }
        },
        actions: ['responsive-images', 'srcset-generation']
      },

      // CSS optimization rules
      {
        id: 'css-minification',
        name: 'CSS Minification',
        category: 'performance',
        priority: 'medium',
        description: 'Minify CSS files to reduce size',
        conditions: {
          cssFiles: { min: 1 }
        },
        actions: ['minify-css', 'remove-unused-css']
      },
      {
        id: 'css-critical',
        name: 'Critical CSS',
        category: 'performance',
        priority: 'high',
        description: 'Extract and inline critical CSS',
        conditions: {
          cssFiles: { min: 1 },
          pageSize: { min: 50000 }
        },
        actions: ['extract-critical-css', 'inline-critical-css']
      },

      // JavaScript optimization rules
      {
        id: 'js-minification',
        name: 'JavaScript Minification',
        category: 'performance',
        priority: 'medium',
        description: 'Minify JavaScript files',
        conditions: {
          jsFiles: { min: 1 }
        },
        actions: ['minify-js', 'remove-unused-js']
      },
      {
        id: 'js-bundle-splitting',
        name: 'Bundle Splitting',
        category: 'performance',
        priority: 'high',
        description: 'Split JavaScript bundles for better caching',
        conditions: {
          jsFiles: { min: 3 },
          bundleSize: { min: 500000 } // 500KB
        },
        actions: ['split-bundles', 'code-splitting']
      },

      // HTML optimization rules
      {
        id: 'html-minification',
        name: 'HTML Minification',
        category: 'performance',
        priority: 'low',
        description: 'Minify HTML to reduce size',
        conditions: {
          htmlSize: { min: 10000 }
        },
        actions: ['minify-html', 'remove-whitespace']
      },
      {
        id: 'html-semantic',
        name: 'Semantic HTML',
        category: 'seo',
        priority: 'medium',
        description: 'Improve HTML semantic structure',
        conditions: {
          divCount: { min: 10 },
          semanticElements: { max: 5 }
        },
        actions: ['semantic-html', 'heading-structure']
      },

      // Performance optimization rules
      {
        id: 'lazy-loading',
        name: 'Lazy Loading',
        category: 'performance',
        priority: 'high',
        description: 'Implement lazy loading for images and content',
        conditions: {
          imageCount: { min: 5 },
          pageHeight: { min: 2000 }
        },
        actions: ['lazy-load-images', 'lazy-load-content']
      },
      {
        id: 'preloading',
        name: 'Resource Preloading',
        category: 'performance',
        priority: 'medium',
        description: 'Preload critical resources',
        conditions: {
          criticalResources: { min: 3 }
        },
        actions: ['preload-fonts', 'preload-css', 'preload-js']
      },

      // SEO optimization rules
      {
        id: 'meta-tags',
        name: 'Meta Tags',
        category: 'seo',
        priority: 'high',
        description: 'Optimize meta tags for SEO',
        conditions: {
          missingMetaTags: { min: 1 }
        },
        actions: ['add-meta-description', 'add-meta-keywords', 'add-og-tags']
      },
      {
        id: 'heading-structure',
        name: 'Heading Structure',
        category: 'seo',
        priority: 'medium',
        description: 'Improve heading hierarchy',
        conditions: {
          headingIssues: { min: 1 }
        },
        actions: ['fix-heading-hierarchy', 'add-missing-headings']
      }
    ];
  }

  /**
   * Start optimizing a website
   */
  async optimizeWebsite(url: string, options: OptimizationOptions = {}): Promise<string> {
    const optimizationId = this.generateOptimizationId();
    
    try {
      // Add to queue
      const job = await this.optimizationQueue.add('optimize-website', {
        url,
        options,
        optimizationId
      }, {
        priority: options.priority || 0,
        delay: options.delay || 0,
        attempts: options.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });

      this.activeOptimizations.set(optimizationId, {
        jobId: job.id,
        url,
        status: 'queued',
        startTime: new Date(),
        options
      });

      this.logger.info(`Optimization job queued for ${url} with ID: ${optimizationId}`);
      return optimizationId;
    } catch (error) {
      this.logger.error(`Failed to queue optimization for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Process an optimization job
   */
  private async processOptimizationJob(url: string, options: OptimizationOptions, optimizationId: string): Promise<OptimizationResult> {
    const pageId = `optimize-${optimizationId}`;
    
    try {
      this.updateOptimizationStatus(optimizationId, 'analyzing');
      
      // First, crawl the website to get baseline data
      const crawlResult = await this.crawlerService.crawlWebsite(url, {
        generatePDF: true,
        waitForSelector: options.waitForSelector
      });

      // Wait for crawl to complete
      let crawlData;
      let attempts = 0;
      while (attempts < 30) {
        crawlData = await this.crawlerService.getCrawlResult(crawlResult);
        if (crawlData) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!crawlData) {
        throw new Error('Failed to get crawl data');
      }

      this.updateOptimizationStatus(optimizationId, 'optimizing');

      // Create page for optimization
      const page = await this.headlessService.createPage(pageId, {
        width: options.viewport?.width || 1920,
        height: options.viewport?.height || 1080
      });

      // Navigate to URL
      await this.headlessService.navigateToPage(pageId, url);

      // Apply optimization rules
      const appliedOptimizations = await this.applyOptimizationRules(pageId, crawlData, options);

      // Measure performance after optimization
      const performanceAfter = await this.measurePerformance(pageId);

      // Generate optimized version
      const optimizedContent = await this.generateOptimizedContent(pageId, appliedOptimizations);

      // Take before/after screenshots
      const beforeScreenshot = crawlData.screenshot;
      const afterScreenshot = await this.headlessService.takeScreenshot(pageId, {
        fullPage: true,
        type: 'png'
      });

      // Close page
      await this.headlessService.closePage(pageId);

      const result: OptimizationResult = {
        optimizationId,
        url,
        timestamp: new Date().toISOString(),
        status: 'completed',
        beforeMetrics: crawlData.domAnalysis.performanceMetrics,
        afterMetrics: performanceAfter,
        improvements: this.calculateImprovements(crawlData.domAnalysis.performanceMetrics, performanceAfter),
        appliedOptimizations,
        optimizedContent,
        beforeScreenshot,
        afterScreenshot,
        savings: {
          fileSize: this.calculateFileSizeSavings(crawlData, optimizedContent),
          loadTime: this.calculateLoadTimeSavings(crawlData.domAnalysis.performanceMetrics, performanceAfter),
          seoScore: this.calculateSEOScore(crawlData.websiteData, appliedOptimizations),
          accessibilityScore: this.calculateAccessibilityScore(crawlData.domAnalysis, appliedOptimizations)
        },
        recommendations: this.generateRecommendations(appliedOptimizations, crawlData.opportunities)
      };

      // Store result in Redis
      await this.redis.setex(`optimization:${optimizationId}`, 3600, JSON.stringify(result));

      this.updateOptimizationStatus(optimizationId, 'completed');
      this.logger.info(`Optimization completed for ${url}`);

      return result;
    } catch (error) {
      this.logger.error(`Optimization failed for ${url}:`, error);
      this.updateOptimizationStatus(optimizationId, 'failed');
      
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
   * Apply optimization rules
   */
  private async applyOptimizationRules(pageId: string, crawlData: any, options: OptimizationOptions): Promise<any[]> {
    const appliedOptimizations = [];
    const page = this.headlessService['pages'].get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    for (const rule of this.optimizationRules) {
      if (this.shouldApplyRule(rule, crawlData, options)) {
        try {
          const result = await this.applyRule(pageId, rule, crawlData);
          if (result.success) {
            appliedOptimizations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              category: rule.category,
              priority: rule.priority,
              result: result.data,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          this.logger.error(`Failed to apply rule ${rule.id}:`, error);
        }
      }
    }

    return appliedOptimizations;
  }

  /**
   * Check if rule should be applied
   */
  private shouldApplyRule(rule: OptimizationRule, crawlData: any, options: OptimizationOptions): boolean {
    // Check if rule is enabled in options
    if (options.disabledRules?.includes(rule.id)) {
      return false;
    }

    // Check rule conditions
    const conditions = rule.conditions;
    for (const [key, condition] of Object.entries(conditions)) {
      const value = this.getValueFromCrawlData(crawlData, key);
      if (value === undefined) continue;

      if (condition.min && value < condition.min) return false;
      if (condition.max && value > condition.max) return false;
    }

    return true;
  }

  /**
   * Apply a specific rule
   */
  private async applyRule(pageId: string, rule: OptimizationRule, crawlData: any): Promise<any> {
    const page = this.headlessService['pages'].get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    switch (rule.id) {
      case 'image-compression':
        return await this.optimizeImages(page, crawlData);
      
      case 'image-alt-text':
        return await this.addAltText(page, crawlData);
      
      case 'css-minification':
        return await this.minifyCSS(page, crawlData);
      
      case 'js-minification':
        return await this.minifyJS(page, crawlData);
      
      case 'html-minification':
        return await this.minifyHTML(page, crawlData);
      
      case 'lazy-loading':
        return await this.implementLazyLoading(page, crawlData);
      
      case 'meta-tags':
        return await this.optimizeMetaTags(page, crawlData);
      
      default:
        return { success: false, error: 'Unknown rule' };
    }
  }

  /**
   * Optimize images
   */
  private async optimizeImages(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let optimizedCount = 0;
      let totalSavings = 0;

      images.forEach(img => {
        // Add loading="lazy" if not present
        if (!img.loading) {
          img.loading = 'lazy';
          optimizedCount++;
        }

        // Add width and height attributes if missing
        if (!img.width && !img.height) {
          const rect = img.getBoundingClientRect();
          img.width = rect.width;
          img.height = rect.height;
          optimizedCount++;
        }

        // Convert to WebP if supported
        if (img.src && (img.src.includes('.jpg') || img.src.includes('.png'))) {
          const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          // In a real implementation, you would check if WebP version exists
          // and replace the src
        }
      });

      return {
        success: true,
        data: {
          optimizedImages: optimizedCount,
          totalImages: images.length,
          estimatedSavings: totalSavings
        }
      };
    });
  }

  /**
   * Add alt text to images
   */
  private async addAltText(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      const images = document.querySelectorAll('img:not([alt])');
      let addedCount = 0;

      images.forEach(img => {
        // Generate alt text based on image context
        const parent = img.parentElement;
        const context = parent?.textContent?.trim() || '';
        const altText = context.substring(0, 100) || 'Image';
        
        img.alt = altText;
        addedCount++;
      });

      return {
        success: true,
        data: {
          addedAltText: addedCount,
          totalImages: images.length
        }
      };
    });
  }

  /**
   * Minify CSS
   */
  private async minifyCSS(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      let minifiedCount = 0;

      stylesheets.forEach(link => {
        // In a real implementation, you would minify the CSS content
        // For now, we'll just mark it as processed
        link.setAttribute('data-minified', 'true');
        minifiedCount++;
      });

      return {
        success: true,
        data: {
          minifiedStylesheets: minifiedCount
        }
      };
    });
  }

  /**
   * Minify JavaScript
   */
  private async minifyJS(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src]');
      let minifiedCount = 0;

      scripts.forEach(script => {
        // In a real implementation, you would minify the JS content
        script.setAttribute('data-minified', 'true');
        minifiedCount++;
      });

      return {
        success: true,
        data: {
          minifiedScripts: minifiedCount
        }
      };
    });
  }

  /**
   * Minify HTML
   */
  private async minifyHTML(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      // Remove unnecessary whitespace
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }

      textNodes.forEach(textNode => {
        textNode.textContent = textNode.textContent?.replace(/\s+/g, ' ').trim();
      });

      return {
        success: true,
        data: {
          minifiedTextNodes: textNodes.length
        }
      };
    });
  }

  /**
   * Implement lazy loading
   */
  private async implementLazyLoading(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      const images = document.querySelectorAll('img:not([loading])');
      let lazyLoadedCount = 0;

      images.forEach(img => {
        img.loading = 'lazy';
        lazyLoadedCount++;
      });

      return {
        success: true,
        data: {
          lazyLoadedImages: lazyLoadedCount
        }
      };
    });
  }

  /**
   * Optimize meta tags
   */
  private async optimizeMetaTags(page: any, crawlData: any): Promise<any> {
    return await page.evaluate(() => {
      let addedTags = 0;

      // Add meta description if missing
      if (!document.querySelector('meta[name="description"]')) {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = document.title || 'Website description';
        document.head.appendChild(meta);
        addedTags++;
      }

      // Add viewport meta tag if missing
      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(meta);
        addedTags++;
      }

      return {
        success: true,
        data: {
          addedMetaTags: addedTags
        }
      };
    });
  }

  /**
   * Measure performance after optimization
   */
  private async measurePerformance(pageId: string): Promise<any> {
    const page = this.headlessService['pages'].get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    return await page.evaluate(() => {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
        cumulativeLayoutShift: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
        totalBlockingTime: performance.getEntriesByType('longtask').reduce((sum, entry) => sum + entry.duration, 0)
      };
    });
  }

  /**
   * Generate optimized content
   */
  private async generateOptimizedContent(pageId: string, appliedOptimizations: any[]): Promise<string> {
    const page = this.headlessService['pages'].get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    return await page.content();
  }

  /**
   * Calculate improvements
   */
  private calculateImprovements(before: any, after: any): any {
    return {
      loadTime: ((before.loadComplete - after.loadComplete) / before.loadComplete * 100).toFixed(2),
      firstContentfulPaint: ((before.firstContentfulPaint - after.firstContentfulPaint) / before.firstContentfulPaint * 100).toFixed(2),
      largestContentfulPaint: ((before.largestContentfulPaint - after.largestContentfulPaint) / before.largestContentfulPaint * 100).toFixed(2),
      cumulativeLayoutShift: ((before.cumulativeLayoutShift - after.cumulativeLayoutShift) / before.cumulativeLayoutShift * 100).toFixed(2)
    };
  }

  /**
   * Calculate file size savings
   */
  private calculateFileSizeSavings(crawlData: any, optimizedContent: string): number {
    const originalSize = crawlData.domAnalysis.resourceAnalysis.totalSize;
    const optimizedSize = optimizedContent.length;
    return ((originalSize - optimizedSize) / originalSize * 100);
  }

  /**
   * Calculate load time savings
   */
  private calculateLoadTimeSavings(before: any, after: any): number {
    return ((before.loadComplete - after.loadComplete) / before.loadComplete * 100);
  }

  /**
   * Calculate SEO score
   */
  private calculateSEOScore(websiteData: any, appliedOptimizations: any[]): number {
    let score = 0;
    
    // Meta tags
    if (websiteData.title) score += 10;
    if (websiteData.description) score += 10;
    if (websiteData.keywords) score += 5;
    
    // Applied optimizations
    const seoOptimizations = appliedOptimizations.filter(opt => opt.category === 'seo');
    score += seoOptimizations.length * 5;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(domAnalysis: any, appliedOptimizations: any[]): number {
    let score = 0;
    
    // Image alt text
    const totalImages = domAnalysis.imageAnalysis.total;
    const imagesWithAlt = totalImages - domAnalysis.imageAnalysis.withoutAlt;
    score += (imagesWithAlt / totalImages) * 30;
    
    // Applied optimizations
    const accessibilityOptimizations = appliedOptimizations.filter(opt => opt.category === 'accessibility');
    score += accessibilityOptimizations.length * 10;
    
    return Math.min(score, 100);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(appliedOptimizations: any[], opportunities: any[]): string[] {
    const recommendations = [];
    
    appliedOptimizations.forEach(opt => {
      recommendations.push(`Applied ${opt.ruleName} optimization`);
    });
    
    opportunities.forEach(opp => {
      if (opp.priority === 'high') {
        recommendations.push(`High priority: ${opp.title}`);
      }
    });
    
    return recommendations;
  }

  /**
   * Get value from crawl data
   */
  private getValueFromCrawlData(crawlData: any, key: string): any {
    const keys = key.split('.');
    let value = crawlData;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value;
  }

  /**
   * Get optimization status
   */
  async getOptimizationStatus(optimizationId: string): Promise<any> {
    const optimization = this.activeOptimizations.get(optimizationId);
    if (!optimization) {
      throw new Error(`Optimization ${optimizationId} not found`);
    }

    return optimization;
  }

  /**
   * Get optimization result
   */
  async getOptimizationResult(optimizationId: string): Promise<OptimizationResult | null> {
    try {
      const result = await this.redis.get(`optimization:${optimizationId}`);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.logger.error(`Failed to get optimization result for ${optimizationId}:`, error);
      return null;
    }
  }

  /**
   * Update optimization status
   */
  private updateOptimizationStatus(optimizationId: string, status: string): void {
    const optimization = this.activeOptimizations.get(optimizationId);
    if (optimization) {
      optimization.status = status;
      optimization.updatedAt = new Date();
      this.activeOptimizations.set(optimizationId, optimization);
    }
  }

  /**
   * Generate unique optimization ID
   */
  private generateOptimizationId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      activeOptimizations: this.activeOptimizations.size,
      queueStatus: {
        waiting: this.optimizationQueue.getWaiting().length,
        active: this.optimizationQueue.getActive().length,
        completed: this.optimizationQueue.getCompleted().length,
        failed: this.optimizationQueue.getFailed().length
      },
      rulesLoaded: this.optimizationRules.length
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.optimizationQueue.close();
      await this.redis.quit();
      await this.headlessService.cleanup();
      await this.crawlerService.cleanup();
      this.logger.info('OptimizationEngine cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default OptimizationEngine;
