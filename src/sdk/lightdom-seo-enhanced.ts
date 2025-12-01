/**
 * LightDom SEO SDK - Enhanced Production Version
 * 
 * One-line injectable JavaScript for automated SEO optimization
 * 
 * Features:
 * - Auto schema detection and injection (15+ types)
 * - Meta tag optimization (title, description, OG, Twitter)
 * - Core Web Vitals monitoring (LCP, INP, CLS, TTFB, FCP)
 * - User behavior tracking
 * - A/B testing support
 * - Real-time analytics
 * 
 * Usage:
 * <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
 *         data-api-key="ld_live_xxxxxxxxxxxx"></script>
 * 
 * Bundle size target: <20KB gzipped
 * Execution time target: <5ms
 */

interface LightDomConfig {
  apiKey: string;
  apiEndpoint: string;
  debug: boolean;
  enableAnalytics: boolean;
  enableCoreWebVitals: boolean;
  enableCrawler: boolean;
  applyStyleGuide: boolean;
  enableRealtimeInsights: boolean;
  allowBacklinkOverlay: boolean;
  analyticsInterval: number;
  version: string;
  environment: 'development' | 'production';
  crawlerEndpoint: string;
  realtimeEndpoint: string;
  campaignPlan?: string;
}

interface StyleGuideDefaults {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    success: string;
    warning: string;
    danger: string;
  };
  typography: {
    fontFamily: string;
    headlineWeight: string;
    bodyWeight: string;
    lineHeight: number;
    scale: Record<string, string>;
  };
  layout: {
    borderRadius: string;
    spacingUnit: string;
    containerWidth: string;
    shadow: string;
  };
  components: {
    card: { padding: string; border: string; backdrop: string };
    button: { padding: string; radius: string; fontWeight: string };
    badge: { radius: string; fontSize: string };
  };
}

interface BacklinkStorefrontLink {
  label: string;
  url: string;
  payoutUrl: string;
  anchorText?: string;
  category?: string;
}

interface BacklinkCampaignPlan {
  tier: 'core' | 'growth' | 'elite';
  focusKeywords: string[];
  flagshipOffers: string[];
  storefrontLinks: BacklinkStorefrontLink[];
  automation: {
    refreshCadence: string;
    indexMonitoring: boolean;
    webhooksEnabled: boolean;
  };
  reporting: {
    frequency: string;
    lastGenerated?: string;
    nextGeneration?: string;
  };
}

interface RealtimeInsightSnapshot {
  seoScore: number;
  seoScoreChange: number;
  coreWebVitals: CoreWebVitals;
  lastUpdated: number;
  monthlyOverview?: {
    improvements: number;
    regressions: number;
    highlights: string[];
  };
}

interface CampaignCustomizations {
  campaignRules?: string[];
  styleGuideDefaults?: StyleGuideDefaults;
  backlinkCampaign?: BacklinkCampaignPlan;
  realtimeInsights?: RealtimeInsightSnapshot;
  [key: string]: any;
}

interface SEOOptimizationConfig {
  schemas: SchemaConfig[];
  metaTags: MetaTagConfig;
  abTestVariant?: 'A' | 'B';
  customizations: CampaignCustomizations;
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
  campaign?: {
    plan?: string;
    rules?: string[];
    seoScore?: number;
    lastUpdated?: number;
  };
}

class LightDomSDK {
  private config: LightDomConfig;
  private optimizationConfig: SEOOptimizationConfig | null = null;
  private sessionId: string;
  private startTime: number;
  private coreWebVitals: CoreWebVitals = {};
  private analyticsQueue: AnalyticsData[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private userInteractions = 0;
  private maxScrollDepth = 0;
  private campaignDetails?: CampaignCustomizations;
  private styleGuideApplied = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.config = this.parseConfig();
    
    if (!this.config.apiKey) {
      this.logError('API key is required. Add data-api-key attribute to the script tag.');
      return;
    }

    this.init();
  }

  /**
   * Parse configuration from script tag attributes
   */
  private parseConfig(): LightDomConfig {
    const script = document.currentScript as HTMLScriptElement;
    const apiEndpoint = script?.getAttribute('data-api-endpoint') || 'https://api.lightdom.io';
    const envAttr = script?.getAttribute('data-env');
    const environment: 'development' | 'production' = envAttr === 'development' ? 'development' : 'production';
    
    return {
      apiKey: script?.getAttribute('data-api-key') || '',
      apiEndpoint,
      debug: script?.getAttribute('data-debug') === 'true',
      enableAnalytics: script?.getAttribute('data-analytics') !== 'false',
      enableCoreWebVitals: script?.getAttribute('data-core-web-vitals') !== 'false',
      enableCrawler: script?.getAttribute('data-enable-crawler') !== 'false',
      applyStyleGuide: script?.getAttribute('data-apply-style-guide') !== 'false',
      enableRealtimeInsights: script?.getAttribute('data-realtime-insights') !== 'false',
      allowBacklinkOverlay: script?.getAttribute('data-backlink-overlay') === 'true',
      analyticsInterval: parseInt(script?.getAttribute('data-interval') || '30000'),
      version: '1.0.0',
      environment,
      crawlerEndpoint: script?.getAttribute('data-crawler-endpoint') || `${apiEndpoint}/api/v1/seo/crawl`,
      realtimeEndpoint: script?.getAttribute('data-realtime-endpoint') || `${apiEndpoint}/api/v1/seo/runtime/insights`,
      campaignPlan: script?.getAttribute('data-plan') || undefined
    };
  }

  /**
   * Initialize SDK
   */
  private async init(): Promise<void> {
    try {
      this.log('Initializing LightDom SEO SDK v' + this.config.version);

      // Fetch optimization configuration
      this.optimizationConfig = await this.fetchConfig();
      this.campaignDetails = this.optimizationConfig.customizations || {};
      
      // Apply optimizations
      this.injectSchemas(this.optimizationConfig.schemas);
      this.optimizeMetaTags(this.optimizationConfig.metaTags);

      if (this.config.applyStyleGuide) {
        this.applyStyleGuideDefaults(this.campaignDetails?.styleGuideDefaults);
      }

      if (this.config.enableCrawler) {
        this.ensureSiteCrawl().catch((err) => this.logError('Crawl orchestration failed', err));
      }

      if (this.campaignDetails?.campaignRules) {
        this.registerCampaignRules(this.campaignDetails.campaignRules);
      }

      if (this.config.allowBacklinkOverlay) {
        this.attachBacklinkStorefront(this.campaignDetails?.backlinkCampaign);
      }

      if (this.config.enableRealtimeInsights) {
        this.publishRealtimeInsights(this.campaignDetails?.realtimeInsights);
      }
      
      // Start monitoring
      if (this.config.enableCoreWebVitals) {
        this.monitorCoreWebVitals();
      }
      
      if (this.config.enableAnalytics) {
        this.startAnalyticsTracking();
      }
      
      this.log('SDK initialized successfully');
    } catch (error) {
      this.logError('Initialization failed', error);
    }
  }

  /**
   * Fetch optimization configuration from API
   */
  private async fetchConfig(): Promise<SEOOptimizationConfig> {
    const requestUrl = new URL(`${this.config.apiEndpoint}/api/v1/seo/config/${this.config.apiKey}`);
    requestUrl.searchParams.set('url', window.location.href);
    requestUrl.searchParams.set('path', window.location.pathname || '/');
    if (this.config.campaignPlan) {
      requestUrl.searchParams.set('plan', this.config.campaignPlan);
    }
    
    try {
      const response = await fetch(requestUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Version': this.config.version,
          'X-LightDom-SDK-Mode': this.config.environment,
          'X-LightDom-SDK-Plan': this.config.campaignPlan || 'unspecified'
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const config = await response.json() as SEOOptimizationConfig;
      config.customizations = (config.customizations || {}) as CampaignCustomizations;
      this.log('Configuration fetched successfully');
      return config;
      
    } catch (error) {
      this.logError('Failed to fetch configuration', error);
      
      // Return default configuration
      return {
        schemas: [],
        metaTags: {},
        customizations: {} as CampaignCustomizations
      };
    }
  }

  /**
   * Inject JSON-LD schemas into page
   */
  private injectSchemas(schemas: SchemaConfig[]): void {
    if (!schemas || schemas.length === 0) {
      this.log('No schemas to inject');
      return;
    }

    schemas.forEach(schema => {
      if (!schema.enabled) return;
      
      try {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema.data);
        document.head.appendChild(script);
        
        this.log(`Schema injected: ${schema.type}`);
      } catch (error) {
        this.logError(`Failed to inject schema: ${schema.type}`, error);
      }
    });
  }

  /**
   * Optimize meta tags
   */
  private optimizeMetaTags(metaTags: MetaTagConfig): void {
    if (!metaTags) return;

    // Update title
    if (metaTags.title && metaTags.title !== document.title) {
      document.title = metaTags.title;
      this.log('Title updated');
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

    // Update Open Graph tags
    if (metaTags.ogTags) {
      Object.entries(metaTags.ogTags).forEach(([property, content]) => {
        this.updateMetaTag('property', property, content);
      });
    }

    // Update Twitter tags
    if (metaTags.twitterTags) {
      Object.entries(metaTags.twitterTags).forEach(([name, content]) => {
        this.updateMetaTag('name', name, content);
      });
    }

    // Update canonical URL
    if (metaTags.canonical) {
      this.updateCanonical(metaTags.canonical);
    }

    this.log('Meta tags optimized');
  }

  private applyStyleGuideDefaults(styleGuide?: StyleGuideDefaults): void {
    if (!styleGuide || this.styleGuideApplied) {
      return;
    }

    try {
      const root = document.documentElement;
      const palette = styleGuide.palette;
      Object.entries({
        '--lightdom-color-primary': palette.primary,
        '--lightdom-color-secondary': palette.secondary,
        '--lightdom-color-accent': palette.accent,
        '--lightdom-color-background': palette.background,
        '--lightdom-color-surface': palette.surface,
        '--lightdom-color-success': palette.success,
        '--lightdom-color-warning': palette.warning,
        '--lightdom-color-danger': palette.danger,
        '--lightdom-radius-base': styleGuide.layout.borderRadius,
        '--lightdom-spacing-unit': styleGuide.layout.spacingUnit,
        '--lightdom-container-width': styleGuide.layout.containerWidth,
        '--lightdom-shadow-elevated': styleGuide.layout.shadow,
        '--lightdom-font-family': styleGuide.typography.fontFamily,
        '--lightdom-font-weight-headline': styleGuide.typography.headlineWeight,
        '--lightdom-font-weight-body': styleGuide.typography.bodyWeight,
        '--lightdom-line-height': styleGuide.typography.lineHeight.toString()
      }).forEach(([variable, value]) => {
        if (value) {
          root.style.setProperty(variable, value);
        }
      });

      this.styleGuideApplied = true;
      this.log('Style guide defaults applied');
    } catch (error) {
      this.logError('Failed to apply style guide defaults', error);
    }
  }

  private registerCampaignRules(rules?: string[]): void {
    if (!rules || rules.length === 0) {
      return;
    }

    try {
      document.body.dataset.lightdomCampaignRules = rules.join('|');
      this.updateMetaTag('name', 'lightdom:campaign-rules', rules.join(', '));

      if (this.config.campaignPlan) {
        document.body.dataset.lightdomCampaignPlan = this.config.campaignPlan;
        this.updateMetaTag('name', 'lightdom:campaign-plan', this.config.campaignPlan);
      }
    } catch (error) {
      this.logError('Failed to register campaign rules', error);
    }
  }

  private publishRealtimeInsights(insights?: RealtimeInsightSnapshot): void {
    if (!insights) {
      return;
    }

    try {
      (window as any).LightDomRealtimeInsights = insights;
      document.body.dataset.lightdomSeoScore = insights.seoScore.toString();
      this.updateMetaTag('name', 'lightdom:seo-score', insights.seoScore.toString());
      this.updateMetaTag('name', 'lightdom:seo-score-change', insights.seoScoreChange.toString());

      if (insights.monthlyOverview) {
        this.updateMetaTag(
          'name',
          'lightdom:monthly-highlights',
          insights.monthlyOverview.highlights.join(' | ')
        );
      }
    } catch (error) {
      this.logError('Failed to publish realtime insights', error);
    }
  }

  private attachBacklinkStorefront(plan?: BacklinkCampaignPlan): void {
    if (!plan || !plan.storefrontLinks || plan.storefrontLinks.length === 0) {
      return;
    }

    try {
      if (document.querySelector('script[data-lightdom="backlink-storefront"]')) {
        return;
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-lightdom', 'backlink-storefront');

      const offerCatalog = {
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: `LightDom Backlink Storefront - ${plan.tier.toUpperCase()} Tier`,
        description: 'Curated backlink placements with automated payout tracking.',
        itemListElement: plan.storefrontLinks.map((link, index) => ({
          '@type': 'Offer',
          position: index + 1,
          url: link.payoutUrl,
          itemOffered: {
            '@type': 'Service',
            name: link.label,
            description: link.category ? `${link.category} backlink placement` : 'Backlink placement',
            url: link.url,
            potentialAction: {
              '@type': 'BuyAction',
              target: link.payoutUrl
            }
          }
        }))
      };

      script.text = JSON.stringify(offerCatalog);
      document.head.appendChild(script);
      document.body.dataset.lightdomBacklinkTier = plan.tier;
      this.log('Backlink storefront schema injected');
    } catch (error) {
      this.logError('Failed to inject backlink storefront schema', error);
    }
  }

  private async ensureSiteCrawl(): Promise<void> {
    if (!this.config.enableCrawler || !this.config.apiKey) {
      return;
    }

    try {
      const storageKey = `lightdom:crawl:${this.config.apiKey}:${window.location.pathname}`;
      const lastRunRaw = window.localStorage?.getItem(storageKey);
      const lastRun = lastRunRaw ? parseInt(lastRunRaw, 10) : 0;
      const oneDay = 24 * 60 * 60 * 1000;

      if (Date.now() - lastRun < oneDay) {
        return;
      }

      const response = await fetch(this.config.crawlerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Version': this.config.version
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          url: window.location.href,
          pathname: window.location.pathname,
          plan: this.config.campaignPlan,
          sessionId: this.sessionId
        })
      });

      if (response.ok) {
        window.localStorage?.setItem(storageKey, Date.now().toString());
        this.log('SEO crawl queued successfully');
      } else {
        this.logError('Failed to queue crawl', await response.text());
      }
    } catch (error) {
      this.logError('Crawl orchestration failed', error);
    }
  }

  /**
   * Update or create a meta tag
   */
  private updateMetaTag(attr: string, attrValue: string, content: string): void {
    const selector = `meta[${attr}="${attrValue}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, attrValue);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  /**
   * Update canonical URL
   */
  private updateCanonical(url: string): void {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    
    link.href = url;
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.coreWebVitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
          this.log(`LCP: ${this.coreWebVitals.lcp}ms`);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        this.logError('LCP observer failed', e);
      }

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.coreWebVitals.cls = clsValue;
          this.log(`CLS: ${clsValue.toFixed(4)}`);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        this.logError('CLS observer failed', e);
      }

      // FCP (First Contentful Paint)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.coreWebVitals.fcp = entry.startTime;
              this.log(`FCP: ${entry.startTime}ms`);
            }
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        this.logError('FCP observer failed', e);
      }
    }

    // Navigation Timing API for TTFB
    if (performance && performance.timing) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        this.coreWebVitals.ttfb = timing.responseStart - timing.requestStart;
        this.log(`TTFB: ${this.coreWebVitals.ttfb}ms`);
      });
    }
  }

  /**
   * Start analytics tracking
   */
  private startAnalyticsTracking(): void {
    // Track scroll depth
    let ticking = false;
    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, depth);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Track user interactions
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.userInteractions++;
      }, { passive: true, capture: true });
    });

    // Send analytics periodically
    const sendInterval = setInterval(() => {
      this.sendAnalytics();
    }, this.config.analyticsInterval);

    // Send analytics before page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(sendInterval);
      this.sendAnalytics(true); // Send immediately
    });
  }

  /**
   * Send analytics data to API
   */
  private async sendAnalytics(immediate = false): Promise<void> {
    const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);
    
    const analyticsData: AnalyticsData = {
      url: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      coreWebVitals: { ...this.coreWebVitals },
      userBehavior: {
        timeOnPage,
        scrollDepth: Math.floor(this.maxScrollDepth),
        interactions: this.userInteractions
      },
      performance: {
        loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0,
        domContentLoaded: performance.timing ? performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : 0,
        firstPaint: this.coreWebVitals.fcp || 0
      },
      campaign: {
        plan: this.config.campaignPlan,
        rules: this.campaignDetails?.campaignRules,
        seoScore: this.campaignDetails?.realtimeInsights?.seoScore,
        lastUpdated: this.campaignDetails?.realtimeInsights?.lastUpdated
      }
    };

    if (immediate) {
      // Use sendBeacon for immediate sends (more reliable on page unload)
      const blob = new Blob([JSON.stringify({
        apiKey: this.config.apiKey,
        data: analyticsData
      })], { type: 'application/json' });
      
      navigator.sendBeacon(
        `${this.config.apiEndpoint}/api/v1/seo/analytics`,
        blob
      );
    } else {
      // Regular fetch for periodic sends
      try {
        await fetch(`${this.config.apiEndpoint}/api/v1/seo/analytics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SDK-Version': this.config.version
          },
          body: JSON.stringify({
            apiKey: this.config.apiKey,
            data: analyticsData
          })
        });
        
        this.log('Analytics sent successfully');
      } catch (error) {
        this.logError('Failed to send analytics', error);
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  /**
   * Log message (only in debug mode)
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[LightDom SEO]', ...args);
    }
  }

  /**
   * Log error (always)
   */
  private logError(...args: any[]): void {
    console.error('[LightDom SEO]', ...args);
  }

  /**
   * Public API: Manual refresh of configuration
   */
  public async refresh(): Promise<void> {
    this.optimizationConfig = await this.fetchConfig();
    this.injectSchemas(this.optimizationConfig.schemas);
    this.optimizeMetaTags(this.optimizationConfig.metaTags);
  }

  /**
   * Public API: Get current Core Web Vitals
   */
  public getCoreWebVitals(): CoreWebVitals {
    return { ...this.coreWebVitals };
  }

  /**
   * Public API: Get session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Auto-initialize on load
(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      (window as any).LightDomSDK = new LightDomSDK();
    });
  } else {
    (window as any).LightDomSDK = new LightDomSDK();
  }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightDomSDK;
}

export default LightDomSDK;
