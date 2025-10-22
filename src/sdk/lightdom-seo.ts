/**
 * LightDom SEO SDK - Injectable JavaScript for Automated SEO Optimization
 *
 * This script provides:
 * - JSON-LD schema injection
 * - Meta tag optimization
 * - Core Web Vitals monitoring
 * - Real-time analytics
 * - A/B testing support
 *
 * Usage:
 * <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
 *         data-api-key="ld_live_xxxxxxxxxxxx"></script>
 */

interface LightDomConfig {
  apiKey: string;
  apiEndpoint: string;
  debug: boolean;
  enableAnalytics: boolean;
  enableCoreWebVitals: boolean;
  analyticsInterval: number;
  version: string;
}

interface SEOOptimizationConfig {
  schemas: SchemaConfig[];
  metaTags: MetaTagConfig;
  abTestVariant?: 'A' | 'B';
  customizations: Record<string, any>;
}

interface SchemaConfig {
  type: string;
  data: Record<string, any>;
  enabled: boolean;
}

interface MetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTags?: Record<string, string>;
  twitterTags?: Record<string, string>;
  canonical?: string;
  robots?: string;
}

interface CoreWebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
}

interface AnalyticsData {
  url: string;
  pageTitle: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
  coreWebVitals: CoreWebVitals;
  userBehavior: {
    timeOnPage: number;
    scrollDepth: number;
    interactions: number;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  };
}

class LightDomSEO {
  private config: LightDomConfig;
  private optimizationConfig: SEOOptimizationConfig | null = null;
  private sessionId: string;
  private startTime: number;
  private coreWebVitals: CoreWebVitals = {};
  private analyticsQueue: AnalyticsData[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    // Get API key from script tag
    const scriptTag = document.currentScript as HTMLScriptElement;
    const apiKey = scriptTag?.getAttribute('data-api-key') || '';

    if (!apiKey) {
      console.error('[LightDom SEO] API key is required. Add data-api-key attribute to the script tag.');
      return;
    }

    this.config = {
      apiKey,
      apiEndpoint: scriptTag?.getAttribute('data-api-endpoint') || 'https://api.lightdom.io',
      debug: scriptTag?.getAttribute('data-debug') === 'true',
      enableAnalytics: scriptTag?.getAttribute('data-analytics') !== 'false',
      enableCoreWebVitals: scriptTag?.getAttribute('data-core-web-vitals') !== 'false',
      analyticsInterval: parseInt(scriptTag?.getAttribute('data-analytics-interval') || '30000', 10),
      version: '1.0.0'
    };

    this.log('Initializing LightDom SEO SDK v' + this.config.version);
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Fetch optimization configuration
      await this.fetchOptimizationConfig();

      // Apply SEO optimizations
      if (this.optimizationConfig) {
        this.applyJSONLDSchemas();
        this.applyMetaTags();
      }

      // Set up Core Web Vitals monitoring
      if (this.config.enableCoreWebVitals) {
        this.setupCoreWebVitalsMonitoring();
      }

      // Set up analytics
      if (this.config.enableAnalytics) {
        this.setupAnalytics();
      }

      // Send initial page view
      this.trackPageView();

      this.log('LightDom SEO SDK initialized successfully');
    } catch (error) {
      console.error('[LightDom SEO] Initialization failed:', error);
    }
  }

  private async fetchOptimizationConfig(): Promise<void> {
    try {
      const url = new URL(`${this.config.apiEndpoint}/api/v1/seo/config/${this.config.apiKey}`);
      url.searchParams.set('url', window.location.href);
      url.searchParams.set('path', window.location.pathname);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
      }

      this.optimizationConfig = await response.json();
      this.log('Optimization config loaded', this.optimizationConfig);
    } catch (error) {
      console.error('[LightDom SEO] Failed to fetch optimization config:', error);
    }
  }

  private applyJSONLDSchemas(): void {
    if (!this.optimizationConfig?.schemas) return;

    this.optimizationConfig.schemas.forEach((schemaConfig) => {
      if (!schemaConfig.enabled) return;

      try {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaConfig.data);
        document.head.appendChild(script);

        this.log(`Applied JSON-LD schema: ${schemaConfig.type}`, schemaConfig.data);
      } catch (error) {
        console.error(`[LightDom SEO] Failed to apply schema ${schemaConfig.type}:`, error);
      }
    });
  }

  private applyMetaTags(): void {
    if (!this.optimizationConfig?.metaTags) return;

    const metaTags = this.optimizationConfig.metaTags;

    // Update title
    if (metaTags.title) {
      document.title = metaTags.title;
      this.log('Updated page title:', metaTags.title);
    }

    // Update or create meta tags
    if (metaTags.description) {
      this.updateMetaTag('name', 'description', metaTags.description);
    }

    if (metaTags.keywords) {
      this.updateMetaTag('name', 'keywords', metaTags.keywords);
    }

    if (metaTags.robots) {
      this.updateMetaTag('name', 'robots', metaTags.robots);
    }

    // Update canonical URL
    if (metaTags.canonical) {
      this.updateLinkTag('canonical', metaTags.canonical);
    }

    // Update Open Graph tags
    if (metaTags.ogTags) {
      Object.entries(metaTags.ogTags).forEach(([property, content]) => {
        this.updateMetaTag('property', `og:${property}`, content);
      });
    }

    // Update Twitter Card tags
    if (metaTags.twitterTags) {
      Object.entries(metaTags.twitterTags).forEach(([name, content]) => {
        this.updateMetaTag('name', `twitter:${name}`, content);
      });
    }

    this.log('Meta tags applied successfully');
  }

  private updateMetaTag(attributeType: 'name' | 'property', attributeValue: string, content: string): void {
    let metaTag = document.querySelector(`meta[${attributeType}="${attributeValue}"]`);

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attributeType, attributeValue);
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', content);
  }

  private updateLinkTag(rel: string, href: string): void {
    let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = rel;
      document.head.appendChild(linkTag);
    }

    linkTag.href = href;
  }

  private setupCoreWebVitalsMonitoring(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.coreWebVitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
          this.log('LCP:', this.coreWebVitals.lcp);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        this.log('LCP observer not supported');
      }

      // Interaction to Next Paint (INP)
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const inp = entry.processingStart - entry.startTime;
              if (!this.coreWebVitals.inp || inp > this.coreWebVitals.inp) {
                this.coreWebVitals.inp = inp;
              }
            }
          });
          this.log('INP:', this.coreWebVitals.inp);
        });
        inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
        this.observers.set('inp', inpObserver);
      } catch (e) {
        this.log('INP observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.coreWebVitals.cls = clsValue;
            }
          }
          this.log('CLS:', this.coreWebVitals.cls);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        this.log('CLS observer not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.coreWebVitals.fcp = entry.startTime;
              this.log('FCP:', this.coreWebVitals.fcp);
            }
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        this.log('FCP observer not supported');
      }
    }

    // Time to First Byte (TTFB) from Navigation Timing
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        const navTiming = performance.timing;
        this.coreWebVitals.ttfb = navTiming.responseStart - navTiming.requestStart;
        this.log('TTFB:', this.coreWebVitals.ttfb);
      });
    }
  }

  private setupAnalytics(): void {
    // Track user interactions
    let interactionCount = 0;
    let maxScrollDepth = 0;

    const trackInteraction = () => {
      interactionCount++;
    };

    const trackScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
    };

    // Add event listeners
    ['click', 'touchstart', 'keydown'].forEach((eventType) => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });

    window.addEventListener('scroll', trackScroll, { passive: true });

    // Send analytics data periodically
    setInterval(() => {
      this.sendAnalytics({
        interactionCount,
        scrollDepth: maxScrollDepth
      });
    }, this.config.analyticsInterval);

    // Send analytics on page unload
    window.addEventListener('beforeunload', () => {
      this.sendAnalytics({
        interactionCount,
        scrollDepth: maxScrollDepth
      }, true);
    });

    // Send analytics on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendAnalytics({
          interactionCount,
          scrollDepth: maxScrollDepth
        }, true);
      }
    });
  }

  private trackPageView(): void {
    const analyticsData: AnalyticsData = {
      url: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      coreWebVitals: this.coreWebVitals,
      userBehavior: {
        timeOnPage: 0,
        scrollDepth: 0,
        interactions: 0
      },
      performance: {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0
      }
    };

    // Get performance metrics
    if ('performance' in window && 'timing' in performance) {
      const perfData = performance.timing;
      const navStart = perfData.navigationStart;

      if (perfData.loadEventEnd > 0) {
        analyticsData.performance.loadTime = perfData.loadEventEnd - navStart;
      }
      if (perfData.domContentLoadedEventEnd > 0) {
        analyticsData.performance.domContentLoaded = perfData.domContentLoadedEventEnd - navStart;
      }
    }

    this.sendAnalyticsData(analyticsData, false);
  }

  private sendAnalytics(userBehavior: { interactionCount: number; scrollDepth: number }, useBeacon = false): void {
    const timeOnPage = Date.now() - this.startTime;

    const analyticsData: AnalyticsData = {
      url: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      coreWebVitals: this.coreWebVitals,
      userBehavior: {
        timeOnPage,
        scrollDepth: userBehavior.scrollDepth,
        interactions: userBehavior.interactionCount
      },
      performance: {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0
      }
    };

    this.sendAnalyticsData(analyticsData, useBeacon);
  }

  private sendAnalyticsData(data: AnalyticsData, useBeacon: boolean): void {
    const url = `${this.config.apiEndpoint}/api/v1/seo/analytics`;
    const payload = JSON.stringify({
      apiKey: this.config.apiKey,
      data
    });

    if (useBeacon && 'sendBeacon' in navigator) {
      // Use sendBeacon for reliable delivery during page unload
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      this.log('Analytics sent via beacon');
    } else {
      // Use fetch for regular updates
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true,
        credentials: 'omit'
      })
        .then((response) => {
          if (response.ok) {
            this.log('Analytics sent successfully');
          }
        })
        .catch((error) => {
          console.error('[LightDom SEO] Failed to send analytics:', error);
        });
    }
  }

  private generateSessionId(): string {
    return `ld_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      if (data) {
        console.log(`[LightDom SEO] ${message}`, data);
      } else {
        console.log(`[LightDom SEO] ${message}`);
      }
    }
  }

  // Public API
  public updateConfig(newConfig: Partial<SEOOptimizationConfig>): void {
    if (this.optimizationConfig) {
      this.optimizationConfig = {
        ...this.optimizationConfig,
        ...newConfig
      };
      this.applyJSONLDSchemas();
      this.applyMetaTags();
    }
  }

  public getCoreWebVitals(): CoreWebVitals {
    return { ...this.coreWebVitals };
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    (window as any).LightDomSEO = new LightDomSEO();
  });
} else {
  (window as any).LightDomSEO = new LightDomSEO();
}

// Export for module usage
export default LightDomSEO;
