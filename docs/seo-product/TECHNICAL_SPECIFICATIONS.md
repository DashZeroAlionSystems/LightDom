# SEO Product: Technical Implementation Specifications

## Executive Summary

This document provides detailed technical specifications for implementing the LightDom SEO-as-a-Service product. It includes architecture diagrams, data models, API contracts, and implementation guidelines.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Customer   │  │  Injectable  │  │   Admin      │          │
│  │  Dashboard   │  │     SDK      │  │   Panel      │          │
│  │  (React SPA) │  │  (Vanilla JS)│  │  (React SPA) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                          ↓ HTTPS ↓
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication (JWT)                                          │
│  • Rate Limiting (tier-based)                                   │
│  • Request Validation                                            │
│  • Response Compression                                          │
│  • CORS Handling                                                 │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Application Services                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    SEO      │  │  Analytics  │  │    ML       │            │
│  │  Injection  │  │   Service   │  │  Training   │            │
│  │  Service    │  │             │  │  Pipeline   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │Recommenda-  │  │   Report    │  │   Billing   │            │
│  │tion Engine  │  │  Generator  │  │  Service    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │  Redis   │  │Elastic-  │  │   S3     │       │
│  │  (Main)  │  │ (Cache)  │  │ search   │  │(Storage) │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         Blockchain (Ethereum/Polygon)                │       │
│  │         (Optimization Proofs & Rewards)              │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer', -- customer, admin
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 2. seo_clients
```sql
CREATE TABLE seo_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier VARCHAR(50) NOT NULL, -- starter, professional, business, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled
  domains_allowed INT NOT NULL,
  page_views_limit INT NOT NULL,
  keywords_limit INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_clients_user_id ON seo_clients(user_id);
CREATE INDEX idx_seo_clients_api_key ON seo_clients(api_key);
```

#### 3. domains
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50), -- dns, html, meta
  verification_token VARCHAR(255),
  script_installed BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(client_id, domain)
);

CREATE INDEX idx_domains_client_id ON domains(client_id);
CREATE INDEX idx_domains_domain ON domains(domain);
```

#### 4. seo_optimization_configs
```sql
CREATE TABLE seo_optimization_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  url_pattern VARCHAR(500) NOT NULL,
  page_type VARCHAR(100), -- Product, Article, FAQPage, etc.
  schemas JSONB NOT NULL, -- Array of schema configs
  meta_tags JSONB NOT NULL, -- Title, description, OG tags, etc.
  ab_test_variant CHAR(1), -- A, B, or NULL
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_configs_domain_id ON seo_optimization_configs(domain_id);
CREATE INDEX idx_seo_configs_url_pattern ON seo_optimization_configs(url_pattern);
```

#### 5. seo_analytics
```sql
CREATE TABLE seo_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  url VARCHAR(1000) NOT NULL,
  page_title VARCHAR(500),
  referrer VARCHAR(1000),
  session_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Core Web Vitals
  lcp FLOAT, -- Largest Contentful Paint
  inp FLOAT, -- Interaction to Next Paint
  cls FLOAT, -- Cumulative Layout Shift
  ttfb FLOAT, -- Time to First Byte
  fcp FLOAT, -- First Contentful Paint
  
  -- User Behavior
  time_on_page INT, -- seconds
  scroll_depth FLOAT, -- percentage
  interactions INT,
  
  -- Performance
  load_time INT, -- milliseconds
  dom_content_loaded INT,
  first_paint INT,
  
  -- Device & Location
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(2),
  city VARCHAR(100)
);

CREATE INDEX idx_seo_analytics_domain_id ON seo_analytics(domain_id);
CREATE INDEX idx_seo_analytics_timestamp ON seo_analytics(timestamp);
CREATE INDEX idx_seo_analytics_url ON seo_analytics(url);
```

#### 6. seo_keywords
```sql
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  target_url VARCHAR(1000),
  current_position INT,
  previous_position INT,
  best_position INT,
  search_volume INT,
  difficulty INT, -- 0-100
  ctr FLOAT, -- Click-through rate
  impressions INT,
  clicks INT,
  tracked_since DATE,
  last_checked TIMESTAMP,
  
  UNIQUE(domain_id, keyword)
);

CREATE INDEX idx_seo_keywords_domain_id ON seo_keywords(domain_id);
CREATE INDEX idx_seo_keywords_keyword ON seo_keywords(keyword);
```

#### 7. seo_recommendations
```sql
CREATE TABLE seo_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- schema, meta, performance, content, etc.
  severity VARCHAR(50) NOT NULL, -- critical, high, medium, low
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  affected_urls TEXT[], -- Array of URLs
  impact_estimate FLOAT, -- Estimated ranking improvement
  effort VARCHAR(50), -- easy, medium, hard
  auto_fixable BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'open', -- open, applied, dismissed
  created_at TIMESTAMP DEFAULT NOW(),
  applied_at TIMESTAMP,
  dismissed_at TIMESTAMP
);

CREATE INDEX idx_seo_recommendations_domain_id ON seo_recommendations(domain_id);
CREATE INDEX idx_seo_recommendations_status ON seo_recommendations(status);
CREATE INDEX idx_seo_recommendations_severity ON seo_recommendations(severity);
```

#### 8. seo_training_data
```sql
CREATE TABLE seo_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  url VARCHAR(1000) NOT NULL,
  features JSONB NOT NULL, -- 194 SEO features
  ranking_position INT,
  timestamp TIMESTAMP DEFAULT NOW(),
  blockchain_proof VARCHAR(255), -- Transaction hash
  reward_amount DECIMAL(18, 8), -- Token reward
  quality_score FLOAT -- Data quality (0-1)
);

CREATE INDEX idx_seo_training_data_domain_id ON seo_training_data(domain_id);
CREATE INDEX idx_seo_training_data_timestamp ON seo_training_data(timestamp);
```

#### 9. seo_models
```sql
CREATE TABLE seo_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_type VARCHAR(100) NOT NULL, -- ranking_prediction, schema_optimization, etc.
  version VARCHAR(50) NOT NULL,
  accuracy FLOAT,
  training_data_count INT,
  trained_at TIMESTAMP,
  deployed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'training', -- training, testing, deployed, deprecated
  model_file_url VARCHAR(500),
  metadata JSONB,
  
  UNIQUE(model_type, version)
);

CREATE INDEX idx_seo_models_type_status ON seo_models(model_type, status);
```

#### 10. seo_reports
```sql
CREATE TABLE seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL, -- executive, technical, full
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'generating', -- generating, completed, failed
  file_url VARCHAR(500),
  generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_reports_domain_id ON seo_reports(domain_id);
```

#### 11. subscription_plans
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  page_views_limit INT NOT NULL,
  domains_limit INT NOT NULL,
  keywords_limit INT,
  features JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Seed data
INSERT INTO subscription_plans (name, price_monthly, price_yearly, page_views_limit, domains_limit, keywords_limit, features) VALUES
('Starter', 79.00, 790.00, 10000, 1, 50, '{"schemas": 5, "ab_testing": false, "white_label": false, "support": "email"}'),
('Professional', 249.00, 2490.00, 100000, 5, 100, '{"schemas": 15, "ab_testing": true, "white_label": false, "support": "priority"}'),
('Business', 599.00, 5990.00, 500000, 20, 500, '{"schemas": "all", "ab_testing": true, "white_label": true, "support": "dedicated"}'),
('Enterprise', 1499.00, NULL, -1, -1, -1, '{"schemas": "custom", "ab_testing": true, "white_label": true, "support": "24/7"}');
```

---

## API Contracts

### Authentication Endpoints

#### POST /api/v1/auth/signup
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "company": "Example Inc"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Example Inc"
  },
  "token": "jwt-token-here"
}
```

#### POST /api/v1/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### SEO Injection Endpoints (Public)

#### GET /api/v1/seo/config/:apiKey
**Response (200):**
```json
{
  "schemas": [
    {
      "type": "Organization",
      "data": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Example Inc",
        "url": "https://example.com",
        "logo": "https://example.com/logo.png"
      },
      "enabled": true
    },
    {
      "type": "WebSite",
      "data": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Example Site",
        "url": "https://example.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://example.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      "enabled": true
    }
  ],
  "metaTags": {
    "title": "Example Inc - Best Products",
    "description": "Discover the best products at Example Inc",
    "keywords": "products, quality, example",
    "ogTags": {
      "og:title": "Example Inc - Best Products",
      "og:description": "Discover the best products",
      "og:image": "https://example.com/og-image.jpg",
      "og:type": "website"
    },
    "twitterTags": {
      "twitter:card": "summary_large_image",
      "twitter:title": "Example Inc - Best Products",
      "twitter:description": "Discover the best products",
      "twitter:image": "https://example.com/twitter-image.jpg"
    },
    "canonical": "https://example.com",
    "robots": "index, follow"
  },
  "abTestVariant": "A",
  "customizations": {
    "trackingId": "GA-XXXXXXXXX"
  }
}
```

#### POST /api/v1/seo/analytics
**Request:**
```json
{
  "apiKey": "ld_live_xxxxxxxxxxxx",
  "url": "https://example.com/product/123",
  "pageTitle": "Amazing Product",
  "referrer": "https://google.com",
  "sessionId": "session-id-here",
  "coreWebVitals": {
    "lcp": 1.8,
    "inp": 150,
    "cls": 0.08,
    "ttfb": 300,
    "fcp": 1.2
  },
  "userBehavior": {
    "timeOnPage": 45,
    "scrollDepth": 75,
    "interactions": 3
  },
  "performance": {
    "loadTime": 2100,
    "domContentLoaded": 1500,
    "firstPaint": 1100
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Analytics data received"
}
```

### Dashboard Endpoints

#### GET /api/v1/analytics/overview
**Query Params:**
- `domainId` (required)
- `startDate` (optional, default: 30 days ago)
- `endDate` (optional, default: today)

**Response (200):**
```json
{
  "seoScore": {
    "overall": 87,
    "technical": 92,
    "content": 85,
    "performance": 84,
    "ux": 88,
    "trend": +5
  },
  "coreWebVitals": {
    "lcp": {
      "value": 1.8,
      "status": "good",
      "threshold": 2.5,
      "distribution": {
        "good": 85,
        "needsImprovement": 10,
        "poor": 5
      }
    },
    "inp": {
      "value": 150,
      "status": "good",
      "threshold": 200,
      "distribution": {
        "good": 90,
        "needsImprovement": 7,
        "poor": 3
      }
    },
    "cls": {
      "value": 0.08,
      "status": "good",
      "threshold": 0.1,
      "distribution": {
        "good": 88,
        "needsImprovement": 8,
        "poor": 4
      }
    }
  },
  "traffic": {
    "total": 24521,
    "change": +15.3,
    "organic": 18200,
    "direct": 4000,
    "referral": 1821,
    "social": 500,
    "chart": [
      { "date": "2024-10-01", "organic": 580, "direct": 120, "referral": 60, "social": 15 },
      // ... 30 days of data
    ]
  },
  "keywords": {
    "top10": [
      {
        "keyword": "best products",
        "position": 5,
        "previousPosition": 8,
        "change": -3,
        "volume": 12000,
        "ctr": 3.2
      }
      // ... more keywords
    ],
    "totalTracked": 50,
    "improved": 23,
    "declined": 8,
    "stable": 19
  },
  "recentOptimizations": [
    {
      "timestamp": "2024-11-01T10:30:00Z",
      "type": "schema_added",
      "description": "Product schema added to 15 pages",
      "impact": "High"
    }
    // ... more optimizations
  ]
}
```

#### GET /api/v1/recommendations
**Query Params:**
- `domainId` (required)
- `severity` (optional: critical, high, medium, low)
- `category` (optional: schema, meta, performance, content)
- `status` (optional: open, applied, dismissed)

**Response (200):**
```json
{
  "recommendations": [
    {
      "id": "uuid-here",
      "type": "schema",
      "severity": "high",
      "title": "Add Product Schema to Product Pages",
      "description": "15 product pages are missing Product schema markup, which could improve visibility in search results and enable rich snippets in Google.",
      "affectedUrls": [
        "https://example.com/product/123",
        "https://example.com/product/456"
        // ... more URLs
      ],
      "impactEstimate": 8,
      "effort": "easy",
      "autoFixable": true,
      "status": "open",
      "createdAt": "2024-11-01T09:00:00Z"
    }
    // ... more recommendations
  ],
  "summary": {
    "total": 25,
    "bySeverity": {
      "critical": 2,
      "high": 8,
      "medium": 10,
      "low": 5
    },
    "byCategory": {
      "schema": 10,
      "meta": 5,
      "performance": 7,
      "content": 3
    }
  }
}
```

---

## SDK Implementation

### Core SDK Structure

```typescript
// src/sdk/lightdom-seo.ts

interface LightDomConfig {
  apiKey: string;
  apiEndpoint: string;
  debug: boolean;
  enableAnalytics: boolean;
  enableCoreWebVitals: boolean;
  analyticsInterval: number;
}

class LightDomSDK {
  private config: LightDomConfig;
  private sessionId: string;
  private optimizationConfig: any = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.parseConfig();
    this.init();
  }

  private parseConfig(): LightDomConfig {
    const script = document.currentScript as HTMLScriptElement;
    return {
      apiKey: script?.getAttribute('data-api-key') || '',
      apiEndpoint: script?.getAttribute('data-api-endpoint') || 'https://api.lightdom.io',
      debug: script?.getAttribute('data-debug') === 'true',
      enableAnalytics: script?.getAttribute('data-analytics') !== 'false',
      enableCoreWebVitals: script?.getAttribute('data-core-web-vitals') !== 'false',
      analyticsInterval: parseInt(script?.getAttribute('data-interval') || '30000')
    };
  }

  private async init(): Promise<void> {
    try {
      // Fetch optimization config
      this.optimizationConfig = await this.fetchConfig();
      
      // Inject schemas
      this.injectSchemas(this.optimizationConfig.schemas);
      
      // Optimize meta tags
      this.optimizeMetaTags(this.optimizationConfig.metaTags);
      
      // Start Core Web Vitals monitoring
      if (this.config.enableCoreWebVitals) {
        this.monitorCoreWebVitals();
      }
      
      // Start analytics tracking
      if (this.config.enableAnalytics) {
        this.startAnalyticsTracking();
      }
      
      this.log('LightDom SEO initialized successfully');
    } catch (error) {
      this.logError('Initialization failed', error);
    }
  }

  private async fetchConfig(): Promise<any> {
    const response = await fetch(
      `${this.config.apiEndpoint}/api/v1/seo/config/${this.config.apiKey}`
    );
    if (!response.ok) throw new Error('Failed to fetch config');
    return response.json();
  }

  private injectSchemas(schemas: any[]): void {
    schemas.forEach(schema => {
      if (!schema.enabled) return;
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema.data);
      document.head.appendChild(script);
      
      this.log('Schema injected:', schema.type);
    });
  }

  private optimizeMetaTags(metaTags: any): void {
    // Update title
    if (metaTags.title && metaTags.title !== document.title) {
      document.title = metaTags.title;
    }

    // Update or create meta tags
    this.updateMetaTag('description', metaTags.description);
    this.updateMetaTag('keywords', metaTags.keywords);
    this.updateMetaTag('robots', metaTags.robots);

    // Update Open Graph tags
    if (metaTags.ogTags) {
      Object.entries(metaTags.ogTags).forEach(([property, content]) => {
        this.updateMetaTag('property', property, content as string);
      });
    }

    // Update Twitter tags
    if (metaTags.twitterTags) {
      Object.entries(metaTags.twitterTags).forEach(([name, content]) => {
        this.updateMetaTag('name', name, content as string);
      });
    }

    // Update canonical URL
    if (metaTags.canonical) {
      this.updateCanonical(metaTags.canonical);
    }

    this.log('Meta tags optimized');
  }

  private updateMetaTag(
    attr: string,
    attrValue: string,
    content?: string
  ): void {
    const selector = `meta[${attr}="${attrValue}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, attrValue);
      document.head.appendChild(meta);
    }
    
    if (content) {
      meta.setAttribute('content', content);
    }
  }

  private updateCanonical(url: string): void {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    
    link.href = url;
  }

  private monitorCoreWebVitals(): void {
    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.log('LCP:', lastEntry.startTime);
      // Store for analytics
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.log('CLS:', clsValue);
      // Store for analytics
    }).observe({ type: 'layout-shift', buffered: true });

    // INP (Interaction to Next Paint)
    // Implementation depends on browser support
  }

  private startAnalyticsTracking(): void {
    const startTime = Date.now();
    let scrollDepth = 0;
    let interactions = 0;

    // Track scroll depth
    window.addEventListener('scroll', () => {
      const depth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      scrollDepth = Math.max(scrollDepth, depth);
    });

    // Track interactions
    ['click', 'keydown'].forEach(event => {
      window.addEventListener(event, () => interactions++);
    });

    // Send analytics periodically
    setInterval(() => {
      this.sendAnalytics({
        timeOnPage: Math.floor((Date.now() - startTime) / 1000),
        scrollDepth: Math.floor(scrollDepth),
        interactions
      });
    }, this.config.analyticsInterval);
  }

  private async sendAnalytics(data: any): Promise<void> {
    try {
      await fetch(`${this.config.apiEndpoint}/api/v1/seo/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          url: window.location.href,
          pageTitle: document.title,
          referrer: document.referrer,
          sessionId: this.sessionId,
          userBehavior: data,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      this.logError('Failed to send analytics', error);
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[LightDom SEO]', ...args);
    }
  }

  private logError(...args: any[]): void {
    console.error('[LightDom SEO]', ...args);
  }
}

// Auto-initialize
new LightDomSDK();
```

---

## ML Feature Extraction

### 194 SEO Features

```typescript
interface SEOFeatures {
  // Technical SEO (50 features)
  technical: {
    hasHttps: boolean;
    pageLoadTime: number; // ms
    serverResponseTime: number; // ms
    totalPageSize: number; // bytes
    numberOfRequests: number;
    hasGzip: boolean;
    hasMinifiedCSS: boolean;
    hasMinifiedJS: boolean;
    hasLazyLoading: boolean;
    imageOptimizationScore: number; // 0-100
    hasCDN: boolean;
    hasServiceWorker: boolean;
    mobileResponsive: boolean;
    hasViewportMeta: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    canonicalUrlSet: boolean;
    hasStructuredData: boolean;
    structuredDataTypes: string[]; // Array of schema types
    structuredDataValidation: boolean;
    hasHreflang: boolean;
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    has404Page: boolean;
    hasSSLCertificate: boolean;
    // ... 25 more technical features
  };

  // Content SEO (70 features)
  content: {
    titleLength: number;
    titleHasKeyword: boolean;
    descriptionLength: number;
    descriptionHasKeyword: boolean;
    h1Count: number;
    h1HasKeyword: boolean;
    h2Count: number;
    h3Count: number;
    wordCount: number;
    keywordDensity: number; // percentage
    readabilityScore: number; // Flesch reading ease
    paragraphCount: number;
    sentenceCount: number;
    averageWordsPerSentence: number;
    internalLinksCount: number;
    externalLinksCount: number;
    brokenLinksCount: number;
    imageCount: number;
    imagesWithAltText: number;
    videoCount: number;
    uniqueContentRatio: number; // percentage
    contentFreshness: number; // days since update
    hasTable: boolean;
    hasList: boolean;
    hasFAQ: boolean;
    // ... 45 more content features
  };

  // Performance (24 features)
  performance: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    inp: number; // Interaction to Next Paint
    ttfb: number; // Time to First Byte
    fcp: number; // First Contentful Paint
    si: number; // Speed Index
    tbt: number; // Total Blocking Time
    tti: number; // Time to Interactive
    domSize: number;
    criticalRequestChains: number;
    resourceSummaryCount: number;
    thirdPartyScriptsCount: number;
    mainThreadWork: number; // ms
    javascriptExecutionTime: number; // ms
    // ... 9 more performance features
  };

  // User Engagement (40 features)
  engagement: {
    bounceRate: number; // percentage
    timeOnPage: number; // seconds
    pagesPerSession: number;
    scrollDepth: number; // percentage
    clickThroughRate: number; // from SERP
    conversionRate: number; // percentage
    returnVisitorRate: number; // percentage
    avgSessionDuration: number; // seconds
    exitRate: number; // percentage
    interactionCount: number;
    formSubmissions: number;
    videoPlays: number;
    downloadCount: number;
    shareCount: number;
    commentCount: number;
    // ... 25 more engagement features
  };

  // Competitive (10 features)
  competitive: {
    domainAuthority: number;
    pageAuthority: number;
    backlinksCount: number;
    referringDomainsCount: number;
    competitorRanking: number; // average position of competitors
    keywordDifficulty: number; // 0-100
    searchVolume: number;
    topCompetitorsCount: number;
    organicShareOfVoice: number; // percentage
    brandMentions: number;
  };
}
```

---

## Deployment Configuration

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: lightdom_seo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/seo_service_schema.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:6
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://postgres:password@postgres:5432/lightdom_seo
      REDIS_URL: redis://redis:6379
      ELASTICSEARCH_URL: http://elasticsearch:9200
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres
      - redis
      - elasticsearch
    volumes:
      - .:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
  es_data:
```

---

## Performance Targets

### SDK Performance
- **Bundle Size**: <20KB gzipped
- **Execution Time**: <5ms
- **API Calls**: Max 1 on page load, then 1 every 30s
- **Memory Usage**: <2MB
- **CPU Usage**: <1%

### API Performance
- **Response Time**: <100ms (p95)
- **Throughput**: 1000 req/s per instance
- **Availability**: 99.9% uptime
- **Error Rate**: <0.1%

### Database Performance
- **Query Time**: <50ms (p95)
- **Connection Pool**: 50 connections
- **Replication Lag**: <1s

---

## Security Measures

1. **Authentication**: JWT with 24h expiration
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Tier-based (1000-10000 req/hour)
4. **Input Validation**: Zod schemas for all inputs
5. **SQL Injection**: Parameterized queries
6. **XSS Protection**: Content Security Policy
7. **CSRF Protection**: CSRF tokens
8. **Data Encryption**: TLS 1.3, encrypted backups
9. **API Key Security**: SHA-256 hashed, rate limited
10. **GDPR Compliance**: Data anonymization, right to deletion

---

This technical specification provides the foundation for implementing the LightDom SEO product. All components are designed to work together seamlessly while maintaining high performance, security, and scalability.
