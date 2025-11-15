/**
 * Storybook Blog Performance & Caching Analyzer
 *
 * Analyzes https://storybook.js.org/blog/ for:
 * - Preload strategies
 * - Caching headers
 * - Router prefetch patterns
 * - Service worker usage
 * - Resource hints (prefetch, preconnect, dns-prefetch)
 * - Page transitions and animations
 * - Lazy loading patterns
 */

import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorybookBlogAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.performanceData = [];
    this.results = {
      url: 'https://storybook.js.org/blog/',
      analyzedAt: new Date().toISOString(),
      preloadStrategy: {},
      caching: {},
      prefetch: {},
      serviceWorker: {},
      transitions: {},
      resources: {},
      performance: {},
    };
  }

  async initialize() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    this.page = await this.browser.newPage();

    // Enable request interception to analyze caching headers
    await this.page.setRequestInterception(true);

    // Track all network requests
    this.page.on('request', request => {
      const url = request.url();
      const type = request.resourceType();

      if (!this.results.resources[type]) {
        this.results.resources[type] = [];
      }

      this.results.resources[type].push({
        url,
        method: request.method(),
        headers: request.headers(),
      });

      request.continue();
    });

    // Track responses to analyze caching
    this.page.on('response', async response => {
      const url = response.url();
      const headers = response.headers();
      const type = response.request().resourceType();

      if (!this.results.caching[type]) {
        this.results.caching[type] = [];
      }

      this.results.caching[type].push({
        url,
        status: response.status(),
        cacheControl: headers['cache-control'],
        expires: headers['expires'],
        etag: headers['etag'],
        lastModified: headers['last-modified'],
        age: headers['age'],
      });
    });

    // Enable performance tracking
    await this.page.evaluateOnNewDocument(() => {
      window.performanceData = [];
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        const start = performance.now();
        return originalFetch.apply(this, args).then(response => {
          const end = performance.now();
          window.performanceData.push({
            type: 'fetch',
            url: args[0],
            duration: end - start,
            timestamp: Date.now(),
          });
          return response;
        });
      };
    });

    console.log('✅ Browser initialized');
  }

  async analyzeBlogPage() {
    console.log('\n📊 Analyzing blog page...');
    await this.page.goto('https://storybook.js.org/blog/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for initial render
    await this.page.waitForTimeout(2000);

    // Extract preload and prefetch strategies
    console.log('🔍 Extracting resource hints...');
    this.results.prefetch = await this.page.evaluate(() => {
      const hints = {
        preload: [],
        prefetch: [],
        preconnect: [],
        dnsPrefetch: [],
      };

      // Find link tags with rel="preload|prefetch|preconnect|dns-prefetch"
      document.querySelectorAll('link[rel]').forEach(link => {
        const rel = link.getAttribute('rel');
        const href = link.getAttribute('href');
        const as = link.getAttribute('as');

        if (rel === 'preload') {
          hints.preload.push({ href, as, crossorigin: link.crossOrigin });
        } else if (rel === 'prefetch') {
          hints.prefetch.push({ href, as });
        } else if (rel === 'preconnect') {
          hints.preconnect.push({ href, crossorigin: link.crossOrigin });
        } else if (rel === 'dns-prefetch') {
          hints.dnsPrefetch.push({ href });
        }
      });

      return hints;
    });

    // Check for service worker
    console.log('🔍 Checking for service worker...');
    this.results.serviceWorker = await this.page.evaluate(() => {
      return {
        registered: 'serviceWorker' in navigator,
        controller: navigator.serviceWorker?.controller?.scriptURL || null,
      };
    });

    // Extract React Router or routing library info
    console.log('🔍 Analyzing routing...');
    this.results.routing = await this.page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const routerDetection = {
        reactRouter: scripts.some(s => s.src.includes('react-router')),
        nextJs: scripts.some(s => s.src.includes('_next')),
        gatsby: scripts.some(s => s.src.includes('gatsby')),
        frameworks: [],
      };

      // Check for common routing patterns in window object
      if (window.__NEXT_DATA__) routerDetection.frameworks.push('Next.js');
      if (window.___gatsby) routerDetection.frameworks.push('Gatsby');

      return routerDetection;
    });

    // Measure initial page load performance
    console.log('🔍 Measuring performance metrics...');
    this.results.performance.initialLoad = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')
          ?.startTime,
        firstContentfulPaint: performance
          .getEntriesByType('paint')
          .find(p => p.name === 'first-contentful-paint')?.startTime,
        transferSize: perfData.transferSize,
        encodedBodySize: perfData.encodedBodySize,
        decodedBodySize: perfData.decodedBodySize,
      };
    });

    // Extract CSS transitions and animations
    console.log('🔍 Extracting transitions and animations...');
    this.results.transitions = await this.page.evaluate(() => {
      const transitions = new Set();
      const animations = [];

      // Get computed styles for all elements
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);

        // Capture transitions
        if (style.transition && style.transition !== 'all 0s ease 0s') {
          transitions.add(style.transition);
        }

        // Capture transform transitions (common for page transitions)
        if (style.transform && style.transform !== 'none') {
          transitions.add(`transform: ${style.transform}`);
        }
      });

      // Extract CSS animations from stylesheets
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSKeyframesRule) {
              animations.push({
                name: rule.name,
                keyframes: Array.from(rule.cssRules).map(kf => ({
                  keyText: kf.keyText,
                  style: kf.style.cssText,
                })),
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });

      return {
        transitions: Array.from(transitions),
        animations,
        transitionCount: transitions.size,
        animationCount: animations.length,
      };
    });

    console.log('✅ Blog page analysis complete');
  }

  async testBlogPostNavigation() {
    console.log('\n🔗 Testing blog post navigation...');

    // Find the first blog post link
    const firstPostSelector = 'a[href*="/blog/"]';
    await this.page.waitForSelector(firstPostSelector);

    // Start monitoring network before hover
    const preHoverRequests = this.results.resources;

    // Hover over the link to trigger potential prefetch
    console.log('🖱️  Hovering over first blog post link...');
    await this.page.hover(firstPostSelector);
    await this.page.waitForTimeout(1000);

    // Check if any prefetch happened
    const postHoverRequests = this.results.resources;
    this.results.preloadStrategy.hoverPrefetch = {
      enabled: JSON.stringify(preHoverRequests) !== JSON.stringify(postHoverRequests),
      message: 'Detected if hovering triggers resource prefetch',
    };

    // Measure click navigation performance
    console.log('🖱️  Clicking blog post link...');
    const navigationStart = Date.now();

    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      this.page.click(firstPostSelector),
    ]);

    const navigationEnd = Date.now();
    const navigationDuration = navigationEnd - navigationStart;

    this.results.performance.blogPostNavigation = {
      duration: navigationDuration,
      url: this.page.url(),
    };

    // Measure post-navigation performance
    this.results.performance.blogPost = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        transferSize: perfData.transferSize,
      };
    });

    console.log(`✅ Navigation completed in ${navigationDuration}ms`);
  }

  async analyzePreloadStrategies() {
    console.log('\n🎯 Analyzing preload strategies...');

    // Go back to blog index
    await this.page.goto('https://storybook.js.org/blog/', {
      waitUntil: 'networkidle2',
    });

    // Check for intersection observer usage (viewport-based lazy loading)
    this.results.preloadStrategy.intersectionObserver = await this.page.evaluate(() => {
      return {
        supported: 'IntersectionObserver' in window,
        instances: window.IntersectionObserver ? 'detected' : 'not detected',
      };
    });

    // Check for lazy-loaded images
    this.results.preloadStrategy.lazyImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return {
        total: images.length,
        withLoading: images.filter(img => img.loading === 'lazy').length,
        withSrcset: images.filter(img => img.srcset).length,
      };
    });

    // Check for code splitting patterns
    this.results.preloadStrategy.codeSplitting = {
      chunkFiles:
        this.results.resources.script?.filter(
          r => r.url.includes('chunk') || r.url.match(/\.[a-f0-9]{8}\.js$/)
        ).length || 0,
    };

    console.log('✅ Preload strategies analyzed');
  }

  async extractPackageInfo() {
    console.log('\n📦 Extracting package information...');

    // Try to find package.json or build manifests
    const scripts = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    });

    this.results.packages = {
      detectedLibraries: [],
    };

    // Detect common libraries from script URLs and global objects
    const detections = await this.page.evaluate(() => {
      const libraries = [];

      // Check for React
      if (window.React) libraries.push({ name: 'React', version: window.React.version });

      // Check for common globals
      if (window.__NEXT_DATA__) libraries.push({ name: 'Next.js', detected: true });
      if (window.___gatsby) libraries.push({ name: 'Gatsby', detected: true });
      if (window.gtag) libraries.push({ name: 'Google Analytics', detected: true });

      return libraries;
    });

    this.results.packages.detectedLibraries = detections;

    console.log('✅ Package information extracted');
  }

  async generateReport() {
    console.log('\n📝 Generating analysis report...');

    const reportDir = path.join(__dirname, '../../data/analysis-reports');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, `storybook-blog-analysis-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    console.log(`✅ Report saved to: ${reportPath}`);

    // Generate summary
    const summary = {
      url: this.results.url,
      analyzedAt: this.results.analyzedAt,
      performance: {
        initialLoadTime: this.results.performance.initialLoad?.domContentLoaded,
        firstContentfulPaint: this.results.performance.initialLoad?.firstContentfulPaint,
        navigationTime: this.results.performance.blogPostNavigation?.duration,
      },
      caching: {
        hasCacheControl: Object.values(this.results.caching).some(items =>
          items.some(item => item.cacheControl)
        ),
      },
      prefetch: {
        preloadLinks: this.results.prefetch.preload?.length || 0,
        prefetchLinks: this.results.prefetch.prefetch?.length || 0,
        preconnectLinks: this.results.prefetch.preconnect?.length || 0,
      },
      serviceWorker: this.results.serviceWorker,
      transitions: {
        count: this.results.transitions?.transitionCount || 0,
        animationCount: this.results.transitions?.animationCount || 0,
      },
      preloadStrategy: this.results.preloadStrategy,
    };

    console.log('\n📊 Analysis Summary:');
    console.log(JSON.stringify(summary, null, 2));

    return summary;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.analyzeBlogPage();
      await this.testBlogPostNavigation();
      await this.analyzePreloadStrategies();
      await this.extractPackageInfo();
      const summary = await this.generateReport();
      return summary;
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new StorybookBlogAnalyzer();
  analyzer
    .run()
    .then(summary => {
      console.log('\n✨ Analysis complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Analysis failed:', error);
      process.exit(1);
    });
}
