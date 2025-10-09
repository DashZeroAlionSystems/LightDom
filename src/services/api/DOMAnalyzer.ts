import { Logger } from '../../utils/Logger';
import { DOMAnalysis, PerformanceMetrics, ImageAnalysis, ScriptAnalysis, CSSAnalysis, ResourceAnalysis } from '../types/HeadlessTypes';
import { OptimizationOpportunity } from '../types/CrawlerTypes';

export class DOMAnalyzer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DOMAnalyzer');
  }

  /**
   * Analyze DOM and extract optimization opportunities
   */
  async analyzeDOM(page: any): Promise<DOMAnalysis> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting DOM analysis');

      // Get basic page information
      const pageInfo = await this.getPageInfo(page);
      
      // Analyze images
      const imageAnalysis = await this.analyzeImages(page);
      
      // Analyze scripts
      const scriptAnalysis = await this.analyzeScripts(page);
      
      // Analyze CSS
      const cssAnalysis = await this.analyzeCSS(page);
      
      // Analyze resources
      const resourceAnalysis = await this.analyzeResources(page);
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(page);
      
      // Calculate total elements
      const totalElements = await this.getTotalElements(page);

      const analysisTime = Date.now() - startTime;

      const analysis: DOMAnalysis = {
        totalElements,
        imageAnalysis,
        scriptAnalysis,
        cssAnalysis,
        performanceMetrics,
        resourceAnalysis,
        analysisTime,
        timestamp: new Date().toISOString()
      };

      this.logger.info(`DOM analysis completed in ${analysisTime}ms`);
      return analysis;
    } catch (error) {
      this.logger.error('DOM analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get basic page information
   */
  private async getPageInfo(page: any): Promise<any> {
    return await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        language: document.documentElement.lang || 'en',
        charset: document.characterSet || 'UTF-8',
        viewport: document.querySelector('meta[name="viewport"]')?.content || '',
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || '',
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content || '',
        twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content || '',
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.content || ''
      };
    });
  }

  /**
   * Analyze images for optimization opportunities
   */
  private async analyzeImages(page: any): Promise<ImageAnalysis> {
    return await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      let totalSize = 0;
      let withoutAlt = 0;
      let oversized = 0;
      let lazyLoaded = 0;
      let webpSupported = 0;

      images.forEach(img => {
        // Check alt text
        if (!img.alt || img.alt.trim() === '') {
          withoutAlt++;
        }

        // Check lazy loading
        if (img.loading === 'lazy') {
          lazyLoaded++;
        }

        // Check if image is oversized (basic check)
        const rect = img.getBoundingClientRect();
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        if (naturalWidth > rect.width * 2 || naturalHeight > rect.height * 2) {
          oversized++;
        }

        // Check WebP support (basic check)
        if (img.src && (img.src.includes('.webp') || img.src.includes('format=webp'))) {
          webpSupported++;
        }

        // Estimate file size (this is a rough estimate)
        if (img.src && !img.src.startsWith('data:')) {
          // This is a very rough estimate - in a real implementation,
          // you would fetch the actual image size
          totalSize += 50000; // Assume 50KB average
        }
      });

      return {
        total: images.length,
        withoutAlt,
        oversized,
        lazyLoaded,
        webpSupported,
        totalSize,
        averageSize: images.length > 0 ? totalSize / images.length : 0
      };
    });
  }

  /**
   * Analyze scripts for optimization opportunities
   */
  private async analyzeScripts(page: any): Promise<ScriptAnalysis> {
    return await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      let totalSize = 0;
      let inline = 0;
      let external = 0;
      let async = 0;
      let defer = 0;

      scripts.forEach(script => {
        if (script.src) {
          external++;
          // Estimate file size
          totalSize += 25000; // Assume 25KB average
        } else {
          inline++;
          totalSize += script.textContent?.length || 0;
        }

        if (script.async) async++;
        if (script.defer) defer++;
      });

      return {
        total: scripts.length,
        inline,
        external,
        async,
        defer,
        totalSize,
        averageSize: scripts.length > 0 ? totalSize / scripts.length : 0
      };
    });
  }

  /**
   * Analyze CSS for optimization opportunities
   */
  private async analyzeCSS(page: any): Promise<CSSAnalysis> {
    return await page.evaluate(() => {
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const inlineStyles = Array.from(document.querySelectorAll('style'));
      let totalSize = 0;
      let unusedRules = 0;
      let criticalCSS = 0;

      // Analyze external stylesheets
      stylesheets.forEach(link => {
        totalSize += 15000; // Assume 15KB average
      });

      // Analyze inline styles
      inlineStyles.forEach(style => {
        const content = style.textContent || '';
        totalSize += content.length;
        
        // Count rules (rough estimate)
        const rules = content.split('}').length - 1;
        criticalCSS += rules;
      });

      // Estimate unused rules (this is a very rough estimate)
      unusedRules = Math.floor(totalSize * 0.3); // Assume 30% unused

      return {
        stylesheets: stylesheets.length,
        inlineStyles: inlineStyles.length,
        unusedRules,
        criticalCSS,
        totalSize,
        averageSize: (stylesheets.length + inlineStyles.length) > 0 ? 
          totalSize / (stylesheets.length + inlineStyles.length) : 0
      };
    });
  }

  /**
   * Analyze resources for optimization opportunities
   */
  private async analyzeResources(page: any): Promise<ResourceAnalysis> {
    return await page.evaluate(() => {
      const images = document.querySelectorAll('img').length;
      const scripts = document.querySelectorAll('script').length;
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
      const fonts = document.querySelectorAll('link[href*="font"], link[href*="woff"], link[href*="ttf"]').length;
      
      const total = images + scripts + stylesheets + fonts;
      let totalSize = 0;

      // Estimate total size
      totalSize += images * 50000; // 50KB per image
      totalSize += scripts * 25000; // 25KB per script
      totalSize += stylesheets * 15000; // 15KB per stylesheet
      totalSize += fonts * 20000; // 20KB per font

      return {
        total,
        images,
        scripts,
        stylesheets,
        fonts,
        totalSize,
        averageSize: total > 0 ? totalSize / total : 0
      };
    });
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(page: any): Promise<PerformanceMetrics> {
    return await page.evaluate(() => {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Get LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const largestContentfulPaint = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
      
      // Get CLS
      const clsEntries = performance.getEntriesByType('layout-shift');
      const cumulativeLayoutShift = clsEntries.reduce((sum, entry) => sum + entry.value, 0);
      
      // Get TBT
      const longTasks = performance.getEntriesByType('longtask');
      const totalBlockingTime = longTasks.reduce((sum, entry) => sum + entry.duration, 0);
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        totalBlockingTime,
        firstInputDelay: 0, // Would need to be measured separately
        timeToInteractive: 0 // Would need to be calculated
      };
    });
  }

  /**
   * Get total number of elements
   */
  private async getTotalElements(page: any): Promise<number> {
    return await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
  }

  /**
   * Find optimization opportunities
   */
  async findOptimizationOpportunities(page: any, analysis: DOMAnalysis): Promise<OptimizationOpportunity[]> {
    const opportunities: OptimizationOpportunity[] = [];

    try {
      // Image optimization opportunities
      opportunities.push(...this.findImageOpportunities(analysis.imageAnalysis));
      
      // Script optimization opportunities
      opportunities.push(...this.findScriptOpportunities(analysis.scriptAnalysis));
      
      // CSS optimization opportunities
      opportunities.push(...this.findCSSOpportunities(analysis.cssAnalysis));
      
      // Performance optimization opportunities
      opportunities.push(...this.findPerformanceOpportunities(analysis.performanceMetrics));
      
      // Resource optimization opportunities
      opportunities.push(...this.findResourceOpportunities(analysis.resourceAnalysis));

      this.logger.info(`Found ${opportunities.length} optimization opportunities`);
      return opportunities;
    } catch (error) {
      this.logger.error('Failed to find optimization opportunities:', error);
      throw error;
    }
  }

  /**
   * Find image optimization opportunities
   */
  private findImageOpportunities(imageAnalysis: ImageAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Images without alt text
    if (imageAnalysis.withoutAlt > 0) {
      opportunities.push({
        type: 'image',
        category: 'accessibility',
        priority: 'high',
        title: 'Images Missing Alt Text',
        description: `${imageAnalysis.withoutAlt} images are missing alt text`,
        impact: 'Improves accessibility for screen readers',
        effort: 'low',
        savings: {
          accessibility: 20
        },
        elements: ['img:not([alt])'],
        selectors: ['img:not([alt])']
      });
    }

    // Oversized images
    if (imageAnalysis.oversized > 0) {
      opportunities.push({
        type: 'image',
        category: 'performance',
        priority: 'medium',
        title: 'Oversized Images',
        description: `${imageAnalysis.oversized} images are larger than needed`,
        impact: 'Reduces bandwidth usage and improves load times',
        effort: 'medium',
        savings: {
          performance: 15,
          bandwidth: 30
        },
        elements: ['img[width], img[height]'],
        selectors: ['img[width], img[height]']
      });
    }

    // Images without lazy loading
    const nonLazyImages = imageAnalysis.total - imageAnalysis.lazyLoaded;
    if (nonLazyImages > 5) {
      opportunities.push({
        type: 'image',
        category: 'performance',
        priority: 'medium',
        title: 'Images Without Lazy Loading',
        description: `${nonLazyImages} images could benefit from lazy loading`,
        impact: 'Improves initial page load performance',
        effort: 'low',
        savings: {
          performance: 10
        },
        elements: ['img:not([loading="lazy"])'],
        selectors: ['img:not([loading="lazy"])']
      });
    }

    // WebP conversion opportunity
    const nonWebPImages = imageAnalysis.total - imageAnalysis.webpSupported;
    if (nonWebPImages > 0) {
      opportunities.push({
        type: 'image',
        category: 'performance',
        priority: 'medium',
        title: 'WebP Image Conversion',
        description: `${nonWebPImages} images could be converted to WebP format`,
        impact: 'Reduces file sizes by 25-35%',
        effort: 'medium',
        savings: {
          performance: 20,
          bandwidth: 30
        },
        elements: ['img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]'],
        selectors: ['img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]']
      });
    }

    return opportunities;
  }

  /**
   * Find script optimization opportunities
   */
  private findScriptOpportunities(scriptAnalysis: ScriptAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Inline scripts
    if (scriptAnalysis.inline > 0) {
      opportunities.push({
        type: 'script',
        category: 'performance',
        priority: 'medium',
        title: 'Inline Scripts',
        description: `${scriptAnalysis.inline} inline scripts could be externalized`,
        impact: 'Improves caching and parallel loading',
        effort: 'medium',
        savings: {
          performance: 10,
          caching: 15
        },
        elements: ['script:not([src])'],
        selectors: ['script:not([src])']
      });
    }

    // Scripts without async/defer
    const blockingScripts = scriptAnalysis.external - scriptAnalysis.async - scriptAnalysis.defer;
    if (blockingScripts > 0) {
      opportunities.push({
        type: 'script',
        category: 'performance',
        priority: 'high',
        title: 'Blocking Scripts',
        description: `${blockingScripts} scripts are blocking page rendering`,
        impact: 'Improves page load performance',
        effort: 'low',
        savings: {
          performance: 25
        },
        elements: ['script[src]:not([async]):not([defer])'],
        selectors: ['script[src]:not([async]):not([defer])']
      });
    }

    return opportunities;
  }

  /**
   * Find CSS optimization opportunities
   */
  private findCSSOpportunities(cssAnalysis: CSSAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Unused CSS
    if (cssAnalysis.unusedRules > 0) {
      opportunities.push({
        type: 'css',
        category: 'performance',
        priority: 'medium',
        title: 'Unused CSS Rules',
        description: `Approximately ${cssAnalysis.unusedRules} unused CSS rules detected`,
        impact: 'Reduces file size and improves load times',
        effort: 'high',
        savings: {
          performance: 15,
          bandwidth: 20
        },
        elements: ['link[rel="stylesheet"]', 'style'],
        selectors: ['link[rel="stylesheet"]', 'style']
      });
    }

    // Critical CSS
    if (cssAnalysis.criticalCSS > 0) {
      opportunities.push({
        type: 'css',
        category: 'performance',
        priority: 'high',
        title: 'Critical CSS Extraction',
        description: 'Critical CSS could be inlined for faster rendering',
        impact: 'Improves first paint and first contentful paint',
        effort: 'medium',
        savings: {
          performance: 30
        },
        elements: ['link[rel="stylesheet"]'],
        selectors: ['link[rel="stylesheet"]']
      });
    }

    return opportunities;
  }

  /**
   * Find performance optimization opportunities
   */
  private findPerformanceOpportunities(performanceMetrics: PerformanceMetrics): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Slow load time
    if (performanceMetrics.loadComplete > 3000) {
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'high',
        title: 'Slow Page Load',
        description: `Page load time is ${performanceMetrics.loadComplete}ms (target: <3000ms)`,
        impact: 'Improves user experience and SEO',
        effort: 'high',
        savings: {
          performance: 40,
          userExperience: 30
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    // Poor FCP
    if (performanceMetrics.firstContentfulPaint > 1800) {
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'high',
        title: 'Slow First Contentful Paint',
        description: `FCP is ${performanceMetrics.firstContentfulPaint}ms (target: <1800ms)`,
        impact: 'Improves perceived performance',
        effort: 'medium',
        savings: {
          performance: 25
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    // Poor LCP
    if (performanceMetrics.largestContentfulPaint > 2500) {
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'high',
        title: 'Slow Largest Contentful Paint',
        description: `LCP is ${performanceMetrics.largestContentfulPaint}ms (target: <2500ms)`,
        impact: 'Improves Core Web Vitals score',
        effort: 'medium',
        savings: {
          performance: 20
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    // High CLS
    if (performanceMetrics.cumulativeLayoutShift > 0.1) {
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'medium',
        title: 'Cumulative Layout Shift',
        description: `CLS is ${performanceMetrics.cumulativeLayoutShift} (target: <0.1)`,
        impact: 'Improves user experience and Core Web Vitals',
        effort: 'medium',
        savings: {
          performance: 15,
          userExperience: 20
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    return opportunities;
  }

  /**
   * Find resource optimization opportunities
   */
  private findResourceOpportunities(resourceAnalysis: ResourceAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Too many resources
    if (resourceAnalysis.total > 50) {
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'medium',
        title: 'Too Many Resources',
        description: `Page has ${resourceAnalysis.total} resources (target: <50)`,
        impact: 'Reduces HTTP requests and improves load times',
        effort: 'high',
        savings: {
          performance: 20
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    // Large total size
    if (resourceAnalysis.totalSize > 2000000) { // 2MB
      opportunities.push({
        type: 'performance',
        category: 'performance',
        priority: 'high',
        title: 'Large Page Size',
        description: `Total page size is ${Math.round(resourceAnalysis.totalSize / 1024)}KB (target: <2MB)`,
        impact: 'Reduces bandwidth usage and improves load times',
        effort: 'high',
        savings: {
          performance: 30,
          bandwidth: 40
        },
        elements: ['*'],
        selectors: ['*']
      });
    }

    return opportunities;
  }
}

export default DOMAnalyzer;
