/**
 * SEO Injection Service
 *
 * Generates optimized JSON-LD schemas and meta tag configurations
 * for client websites based on AI recommendations and best practices.
 */

import { createClient } from 'redis';
import type { PoolClient } from 'pg';

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

interface SEOOptimizationConfig {
  schemas: SchemaConfig[];
  metaTags: MetaTagConfig;
  abTestVariant?: 'A' | 'B';
  customizations: Record<string, any>;
}

interface ClientInfo {
  id: string;
  domain: string;
  subscriptionTier: string;
  config: Record<string, any>;
}

export class SEOInjectionService {
  private redisClient: any;
  private pgPool: any;

  constructor(pgPool: any) {
    this.pgPool = pgPool;
    this.initRedis();
  }

  private async initRedis(): Promise<void> {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redisClient.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
      });

      await this.redisClient.connect();
      console.log('SEO Injection Service: Redis connected');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  /**
   * Get optimization configuration for a specific URL
   */
  async getOptimizationConfig(apiKey: string, url: string, pathname: string): Promise<SEOOptimizationConfig | null> {
    try {
      // Check cache first
      const cacheKey = `seo:config:${apiKey}:${pathname}`;
      const cachedConfig = await this.getCachedConfig(cacheKey);

      if (cachedConfig) {
        console.log('Returning cached SEO config for', pathname);
        return cachedConfig;
      }

      // Get client info
      const client = await this.getClientByApiKey(apiKey);
      if (!client) {
        throw new Error('Invalid API key');
      }

      // Generate optimization config
      const config = await this.generateOptimizationConfig(client, url, pathname);

      // Cache the config
      await this.cacheConfig(cacheKey, config);

      return config;
    } catch (error) {
      console.error('Error getting optimization config:', error);
      throw error;
    }
  }

  /**
   * Generate optimization configuration based on page content and client tier
   */
  private async generateOptimizationConfig(
    client: ClientInfo,
    url: string,
    pathname: string
  ): Promise<SEOOptimizationConfig> {
    const schemas: SchemaConfig[] = [];
    const metaTags: MetaTagConfig = {};

    // Get saved configurations for this client and path pattern
    const savedConfigs = await this.getSavedConfigs(client.id, pathname);

    if (savedConfigs.length > 0) {
      // Use saved configuration
      const config = savedConfigs[0];
      return {
        schemas: config.json_ld_schemas || [],
        metaTags: config.meta_tags || {},
        abTestVariant: config.ab_test_variant,
        customizations: config.customizations || {}
      };
    }

    // Generate default schemas based on page type and subscription tier
    const pageType = this.detectPageType(pathname);

    // Organization schema (available in all tiers)
    schemas.push(this.generateOrganizationSchema(client));

    // WebSite schema (available in all tiers)
    schemas.push(this.generateWebSiteSchema(client, url));

    // BreadcrumbList schema (available in all tiers)
    schemas.push(this.generateBreadcrumbSchema(pathname));

    // Professional tier and above
    if (client.subscriptionTier !== 'starter') {
      // Add page-specific schemas
      switch (pageType) {
        case 'product':
          schemas.push(this.generateProductSchema(client, pathname));
          break;
        case 'article':
          schemas.push(this.generateArticleSchema(client, pathname));
          break;
        case 'faq':
          schemas.push(this.generateFAQSchema(client));
          break;
        case 'local':
          schemas.push(this.generateLocalBusinessSchema(client));
          break;
      }
    }

    // Generate optimized meta tags
    metaTags.title = this.generateOptimizedTitle(client, pathname, pageType);
    metaTags.description = this.generateOptimizedDescription(client, pathname, pageType);
    metaTags.canonical = url;
    metaTags.robots = 'index, follow';

    // Open Graph tags
    metaTags.ogTags = {
      title: metaTags.title,
      description: metaTags.description,
      url: url,
      type: pageType === 'article' ? 'article' : 'website',
      site_name: client.domain
    };

    // Twitter Card tags
    metaTags.twitterTags = {
      card: 'summary_large_image',
      title: metaTags.title,
      description: metaTags.description
    };

    return {
      schemas,
      metaTags,
      customizations: client.config || {}
    };
  }

  /**
   * Detect page type based on pathname
   */
  private detectPageType(pathname: string): string {
    if (pathname.includes('/product') || pathname.includes('/shop') || pathname.includes('/item')) {
      return 'product';
    }
    if (pathname.includes('/blog') || pathname.includes('/article') || pathname.includes('/news')) {
      return 'article';
    }
    if (pathname.includes('/faq') || pathname.includes('/help')) {
      return 'faq';
    }
    if (pathname.includes('/contact') || pathname.includes('/location')) {
      return 'local';
    }
    return 'general';
  }

  /**
   * Generate Organization schema
   */
  private generateOrganizationSchema(client: ClientInfo): SchemaConfig {
    return {
      type: 'Organization',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: client.config.organizationName || client.domain,
        url: `https://${client.domain}`,
        logo: client.config.logo || `https://${client.domain}/logo.png`,
        contactPoint: client.config.contactPoint || {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: `contact@${client.domain}`
        },
        sameAs: client.config.socialProfiles || []
      }
    };
  }

  /**
   * Generate WebSite schema
   */
  private generateWebSiteSchema(client: ClientInfo, url: string): SchemaConfig {
    return {
      type: 'WebSite',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: client.config.siteName || client.domain,
        url: `https://${client.domain}`,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `https://${client.domain}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  private generateBreadcrumbSchema(pathname: string): SchemaConfig {
    const pathParts = pathname.split('/').filter(part => part);
    const breadcrumbs = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: '/'
      }
    ];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      breadcrumbs.push({
        '@type': 'ListItem',
        position: index + 2,
        name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        item: currentPath
      });
    });

    return {
      type: 'BreadcrumbList',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs
      }
    };
  }

  /**
   * Generate Product schema
   */
  private generateProductSchema(client: ClientInfo, pathname: string): SchemaConfig {
    return {
      type: 'Product',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Product Name', // To be filled dynamically
        description: 'Product description', // To be filled dynamically
        brand: {
          '@type': 'Brand',
          name: client.config.brandName || client.domain
        },
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `https://${client.domain}${pathname}`
        }
      }
    };
  }

  /**
   * Generate Article schema
   */
  private generateArticleSchema(client: ClientInfo, pathname: string): SchemaConfig {
    return {
      type: 'Article',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Article Headline', // To be filled dynamically
        description: 'Article description', // To be filled dynamically
        author: {
          '@type': 'Person',
          name: client.config.authorName || 'Author'
        },
        publisher: {
          '@type': 'Organization',
          name: client.config.organizationName || client.domain,
          logo: {
            '@type': 'ImageObject',
            url: client.config.logo || `https://${client.domain}/logo.png`
          }
        },
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      }
    };
  }

  /**
   * Generate FAQ schema
   */
  private generateFAQSchema(client: ClientInfo): SchemaConfig {
    return {
      type: 'FAQPage',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [] // To be filled with actual FAQ data
      }
    };
  }

  /**
   * Generate LocalBusiness schema
   */
  private generateLocalBusinessSchema(client: ClientInfo): SchemaConfig {
    return {
      type: 'LocalBusiness',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: client.config.businessName || client.domain,
        address: client.config.address || {
          '@type': 'PostalAddress',
          streetAddress: '',
          addressLocality: '',
          addressRegion: '',
          postalCode: '',
          addressCountry: ''
        },
        telephone: client.config.phone || '',
        openingHours: client.config.openingHours || []
      }
    };
  }

  /**
   * Generate optimized title
   */
  private generateOptimizedTitle(client: ClientInfo, pathname: string, pageType: string): string {
    const siteName = client.config.siteName || client.domain;
    const pathParts = pathname.split('/').filter(part => part);

    if (pathParts.length === 0) {
      return `${siteName} - Home`;
    }

    const pageName = pathParts[pathParts.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return `${pageName} | ${siteName}`;
  }

  /**
   * Generate optimized description
   */
  private generateOptimizedDescription(client: ClientInfo, pathname: string, pageType: string): string {
    const siteName = client.config.siteName || client.domain;
    const defaultDescription = client.config.defaultDescription || `Discover amazing content on ${siteName}`;

    // In a production system, this would use AI to generate contextual descriptions
    return defaultDescription;
  }

  /**
   * Get client by API key
   */
  private async getClientByApiKey(apiKey: string): Promise<ClientInfo | null> {
    try {
      const result = await this.pgPool.query(
        'SELECT id, domain, subscription_tier, config FROM seo_clients WHERE api_key = $1 AND status = $2',
        [apiKey, 'active']
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        domain: row.domain,
        subscriptionTier: row.subscription_tier,
        config: row.config || {}
      };
    } catch (error) {
      console.error('Error getting client by API key:', error);
      return null;
    }
  }

  /**
   * Get saved configurations for a client and path
   */
  private async getSavedConfigs(clientId: string, pathname: string): Promise<any[]> {
    try {
      const result = await this.pgPool.query(
        `SELECT * FROM seo_optimization_configs
         WHERE client_id = $1
         AND (page_pattern = $2 OR page_pattern = '*')
         AND active = true
         ORDER BY page_pattern DESC
         LIMIT 1`,
        [clientId, pathname]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting saved configs:', error);
      return [];
    }
  }

  /**
   * Cache configuration in Redis
   */
  private async cacheConfig(key: string, config: SEOOptimizationConfig): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.setEx(key, 300, JSON.stringify(config)); // 5 min TTL
      }
    } catch (error) {
      console.error('Error caching config:', error);
    }
  }

  /**
   * Get cached configuration
   */
  private async getCachedConfig(key: string): Promise<SEOOptimizationConfig | null> {
    try {
      if (this.redisClient) {
        const cached = await this.redisClient.get(key);
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached config:', error);
      return null;
    }
  }

  /**
   * Save optimization configuration
   */
  async saveOptimizationConfig(
    clientId: string,
    pagePattern: string,
    schemas: SchemaConfig[],
    metaTags: MetaTagConfig,
    abTestVariant?: 'A' | 'B'
  ): Promise<string> {
    try {
      const result = await this.pgPool.query(
        `INSERT INTO seo_optimization_configs
         (client_id, page_pattern, json_ld_schemas, meta_tags, ab_test_variant, active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id`,
        [clientId, pagePattern, JSON.stringify(schemas), JSON.stringify(metaTags), abTestVariant]
      );

      // Invalidate cache for this client
      await this.invalidateClientCache(clientId);

      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving optimization config:', error);
      throw error;
    }
  }

  /**
   * Invalidate all cached configs for a client
   */
  private async invalidateClientCache(clientId: string): Promise<void> {
    try {
      if (this.redisClient) {
        const pattern = `seo:config:*${clientId}*`;
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Track API usage
   */
  async trackApiUsage(apiKey: string): Promise<void> {
    try {
      await this.pgPool.query(
        `UPDATE seo_clients
         SET api_calls_today = api_calls_today + 1,
             updated_at = NOW()
         WHERE api_key = $1`,
        [apiKey]
      );
    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(apiKey: string): Promise<boolean> {
    try {
      const result = await this.pgPool.query(
        `SELECT subscription_tier, api_calls_today FROM seo_clients
         WHERE api_key = $1 AND status = 'active'`,
        [apiKey]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const { subscription_tier, api_calls_today } = result.rows[0];

      // Rate limits per tier
      const limits: Record<string, number> = {
        starter: 10000,
        professional: 100000,
        business: 500000,
        enterprise: 999999999
      };

      return api_calls_today < (limits[subscription_tier] || 10000);
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  }

  /**
   * Clean up
   */
  async cleanup(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

export default SEOInjectionService;
