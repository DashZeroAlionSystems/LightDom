/**
 * Schema.org Tools for SEO and Data Mining
 *
 * Provides comprehensive Schema.org structured data generation and analysis
 * for SEO optimization and data mining strategies
 */

export interface SchemaOrgType {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Schema.org Generator for various entity types
 */
export class SchemaOrgGenerator {
  private static readonly SCHEMA_CONTEXT = 'https://schema.org';

  /**
   * Generate Organization schema
   */
  static generateOrganization(data: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    contactPoint?: {
      telephone: string;
      contactType: string;
      email?: string;
    };
    sameAs?: string[];
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'Organization',
      name: data.name,
      url: data.url
    };

    if (data.logo) schema.logo = data.logo;
    if (data.description) schema.description = data.description;
    if (data.contactPoint) schema.contactPoint = {
      '@type': 'ContactPoint',
      ...data.contactPoint
    };
    if (data.sameAs) schema.sameAs = data.sameAs;
    if (data.address) schema.address = {
      '@type': 'PostalAddress',
      ...data.address
    };

    return schema;
  }

  /**
   * Generate WebPage schema
   */
  static generateWebPage(data: {
    name: string;
    url: string;
    description?: string;
    inLanguage?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
    breadcrumb?: Array<{ name: string; url: string }>;
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'WebPage',
      name: data.name,
      url: data.url
    };

    if (data.description) schema.description = data.description;
    if (data.inLanguage) schema.inLanguage = data.inLanguage;
    if (data.datePublished) schema.datePublished = data.datePublished;
    if (data.dateModified) schema.dateModified = data.dateModified;

    if (data.author) {
      schema.author = {
        '@type': 'Person',
        name: data.author
      };
    }

    if (data.breadcrumb && data.breadcrumb.length > 0) {
      schema.breadcrumb = {
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      };
    }

    return schema;
  }

  /**
   * Generate Article schema (for blog posts, news articles)
   */
  static generateArticle(data: {
    headline: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    publisher: {
      name: string;
      logo?: string;
    };
    description?: string;
    articleBody?: string;
    keywords?: string[];
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'Article',
      headline: data.headline,
      url: data.url,
      datePublished: data.datePublished,
      author: {
        '@type': 'Person',
        name: data.author
      },
      publisher: {
        '@type': 'Organization',
        name: data.publisher.name
      }
    };

    if (data.image) schema.image = data.image;
    if (data.dateModified) schema.dateModified = data.dateModified;
    if (data.description) schema.description = data.description;
    if (data.articleBody) schema.articleBody = data.articleBody;
    if (data.keywords) schema.keywords = data.keywords.join(', ');

    if (data.publisher.logo) {
      schema.publisher.logo = {
        '@type': 'ImageObject',
        url: data.publisher.logo
      };
    }

    return schema;
  }

  /**
   * Generate Product schema (for e-commerce)
   */
  static generateProduct(data: {
    name: string;
    description: string;
    image?: string[];
    sku?: string;
    brand?: string;
    offers?: {
      price: number;
      priceCurrency: string;
      availability?: string;
      url?: string;
    };
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
    review?: Array<{
      author: string;
      datePublished: string;
      reviewBody: string;
      reviewRating: number;
    }>;
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'Product',
      name: data.name,
      description: data.description
    };

    if (data.image) schema.image = data.image;
    if (data.sku) schema.sku = data.sku;
    if (data.brand) schema.brand = { '@type': 'Brand', name: data.brand };

    if (data.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
        availability: data.offers.availability || 'https://schema.org/InStock',
        url: data.offers.url
      };
    }

    if (data.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount
      };
    }

    if (data.review && data.review.length > 0) {
      schema.review = data.review.map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        datePublished: r.datePublished,
        reviewBody: r.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.reviewRating
        }
      }));
    }

    return schema;
  }

  /**
   * Generate LocalBusiness schema
   */
  static generateLocalBusiness(data: {
    name: string;
    businessType?: string;
    image?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    telephone?: string;
    email?: string;
    url?: string;
    openingHours?: string[];
    geo?: {
      latitude: number;
      longitude: number;
    };
    priceRange?: string;
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': data.businessType || 'LocalBusiness',
      name: data.name,
      address: {
        '@type': 'PostalAddress',
        ...data.address
      }
    };

    if (data.image) schema.image = data.image;
    if (data.telephone) schema.telephone = data.telephone;
    if (data.email) schema.email = data.email;
    if (data.url) schema.url = data.url;
    if (data.openingHours) schema.openingHours = data.openingHours;
    if (data.priceRange) schema.priceRange = data.priceRange;

    if (data.geo) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude
      };
    }

    return schema;
  }

  /**
   * Generate FAQ schema
   */
  static generateFAQPage(questions: Array<{ question: string; answer: string }>): SchemaOrgType {
    return {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  static generateBreadcrumbList(items: Array<{ name: string; url: string }>): SchemaOrgType {
    return {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
  }

  /**
   * Generate VideoObject schema
   */
  static generateVideoObject(data: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration?: string;
    contentUrl?: string;
    embedUrl?: string;
    interactionCount?: number;
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'VideoObject',
      name: data.name,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      uploadDate: data.uploadDate
    };

    if (data.duration) schema.duration = data.duration;
    if (data.contentUrl) schema.contentUrl = data.contentUrl;
    if (data.embedUrl) schema.embedUrl = data.embedUrl;
    if (data.interactionCount) schema.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: data.interactionCount
    };

    return schema;
  }

  /**
   * Generate Event schema
   */
  static generateEvent(data: {
    name: string;
    startDate: string;
    endDate?: string;
    location: {
      name: string;
      address?: string;
    };
    description?: string;
    image?: string;
    organizer?: string;
    offers?: {
      price: number;
      priceCurrency: string;
      url?: string;
    };
  }): SchemaOrgType {
    const schema: SchemaOrgType = {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'Event',
      name: data.name,
      startDate: data.startDate,
      location: {
        '@type': 'Place',
        name: data.location.name
      }
    };

    if (data.endDate) schema.endDate = data.endDate;
    if (data.description) schema.description = data.description;
    if (data.image) schema.image = data.image;

    if (data.location.address) {
      schema.location.address = {
        '@type': 'PostalAddress',
        streetAddress: data.location.address
      };
    }

    if (data.organizer) {
      schema.organizer = {
        '@type': 'Organization',
        name: data.organizer
      };
    }

    if (data.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
        url: data.offers.url
      };
    }

    return schema;
  }
}

/**
 * Schema.org Analyzer for existing structured data
 */
export class SchemaOrgAnalyzer {
  /**
   * Extract all Schema.org scripts from HTML
   */
  static extractSchemas(html: string): SchemaOrgType[] {
    const schemaRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas: SchemaOrgType[] = [];
    let match;

    while ((match = schemaRegex.exec(html)) !== null) {
      try {
        const schema = JSON.parse(match[1]);
        if (Array.isArray(schema)) {
          schemas.push(...schema);
        } else {
          schemas.push(schema);
        }
      } catch (e) {
        // Invalid JSON, skip
        console.warn('Invalid Schema.org JSON found:', e);
      }
    }

    return schemas;
  }

  /**
   * Validate Schema.org structure
   */
  static validateSchema(schema: any): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schema['@context']) {
      errors.push('Missing @context property');
    } else if (!schema['@context'].includes('schema.org')) {
      warnings.push('@context does not reference schema.org');
    }

    if (!schema['@type']) {
      errors.push('Missing @type property');
    }

    // Type-specific validation
    if (schema['@type'] === 'Organization') {
      if (!schema.name) errors.push('Organization missing required "name" property');
      if (!schema.url) warnings.push('Organization missing recommended "url" property');
    }

    if (schema['@type'] === 'Product') {
      if (!schema.name) errors.push('Product missing required "name" property');
      if (!schema.description) warnings.push('Product missing recommended "description" property');
      if (!schema.offers) warnings.push('Product missing recommended "offers" property');
    }

    if (schema['@type'] === 'Article') {
      if (!schema.headline) errors.push('Article missing required "headline" property');
      if (!schema.author) errors.push('Article missing required "author" property');
      if (!schema.datePublished) errors.push('Article missing required "datePublished" property');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate SEO recommendations based on Schema.org analysis
   */
  static generateRecommendations(schemas: SchemaOrgType[], pageType?: string): string[] {
    const recommendations: string[] = [];
    const types = schemas.map(s => s['@type']);

    // Check for essential schemas
    if (!types.includes('Organization') && !types.includes('LocalBusiness')) {
      recommendations.push('Add Organization or LocalBusiness schema to establish entity identity');
    }

    if (!types.includes('WebPage') && !types.includes('WebSite')) {
      recommendations.push('Add WebPage or WebSite schema for better page understanding');
    }

    // Page-type specific recommendations
    if (pageType === 'product' && !types.includes('Product')) {
      recommendations.push('Add Product schema for e-commerce pages');
    }

    if (pageType === 'article' && !types.includes('Article')) {
      recommendations.push('Add Article schema for blog posts and articles');
    }

    if (pageType === 'local' && !types.includes('LocalBusiness')) {
      recommendations.push('Add LocalBusiness schema with NAP (Name, Address, Phone)');
    }

    // Check for advanced features
    const hasBreadcrumb = types.includes('BreadcrumbList');
    if (!hasBreadcrumb) {
      recommendations.push('Add BreadcrumbList schema to enhance navigation understanding');
    }

    // Check for rich snippets opportunities
    const hasFAQ = types.includes('FAQPage');
    const hasHowTo = types.includes('HowTo');

    if (!hasFAQ && !hasHowTo) {
      recommendations.push('Consider adding FAQ or HowTo schema for rich snippet opportunities');
    }

    return recommendations;
  }

  /**
   * Calculate SEO score based on Schema.org implementation
   */
  static calculateSchemaScore(schemas: SchemaOrgType[]): {
    score: number;
    breakdown: {
      presence: number;
      validity: number;
      richness: number;
      completeness: number;
    };
  } {
    let presenceScore = 0;
    let validityScore = 0;
    let richnessScore = 0;
    let completenessScore = 0;

    // Presence (0-25 points)
    if (schemas.length > 0) presenceScore = 15;
    if (schemas.length >= 3) presenceScore = 25;

    // Validity (0-25 points)
    const validSchemas = schemas.filter(s => {
      const validation = this.validateSchema(s);
      return validation.valid;
    });
    validityScore = Math.min(25, (validSchemas.length / Math.max(1, schemas.length)) * 25);

    // Richness (0-25 points) - diverse schema types
    const uniqueTypes = new Set(schemas.map(s => s['@type']));
    richnessScore = Math.min(25, uniqueTypes.size * 5);

    // Completeness (0-25 points) - essential schemas present
    const types = Array.from(uniqueTypes);
    const essentialTypes = ['Organization', 'WebPage', 'BreadcrumbList'];
    const hasEssentials = essentialTypes.filter(t => types.includes(t));
    completenessScore = Math.min(25, (hasEssentials.length / essentialTypes.length) * 25);

    const totalScore = Math.round(presenceScore + validityScore + richnessScore + completenessScore);

    return {
      score: totalScore,
      breakdown: {
        presence: Math.round(presenceScore),
        validity: Math.round(validityScore),
        richness: Math.round(richnessScore),
        completeness: Math.round(completenessScore)
      }
    };
  }
}

/**
 * SEO Strategy Generator using Schema.org
 */
export class SEOStrategyGenerator {
  /**
   * Generate comprehensive SEO strategy with Schema.org integration
   */
  static generateStrategy(data: {
    businessType: string;
    industry: string;
    targetKeywords: string[];
    hasEcommerce?: boolean;
    hasBlog?: boolean;
    hasLocalPresence?: boolean;
  }): {
    recommendedSchemas: string[];
    implementationPriority: Array<{ schema: string; priority: 'high' | 'medium' | 'low'; reason: string }>;
    contentStrategy: string[];
    technicalRecommendations: string[];
  } {
    const recommendedSchemas: string[] = ['Organization', 'WebSite', 'WebPage'];
    const implementationPriority: Array<{ schema: string; priority: 'high' | 'medium' | 'low'; reason: string }> = [];
    const contentStrategy: string[] = [];
    const technicalRecommendations: string[] = [];

    // Essential schemas (high priority)
    implementationPriority.push({
      schema: 'Organization',
      priority: 'high',
      reason: 'Establishes entity identity and brand recognition in search results'
    });

    implementationPriority.push({
      schema: 'BreadcrumbList',
      priority: 'high',
      reason: 'Improves site navigation understanding and SERP display'
    });

    // E-commerce specific
    if (data.hasEcommerce) {
      recommendedSchemas.push('Product', 'Offer', 'AggregateRating');
      implementationPriority.push({
        schema: 'Product',
        priority: 'high',
        reason: 'Essential for product rich snippets and shopping results'
      });
      contentStrategy.push('Implement product reviews to enable AggregateRating schema');
      contentStrategy.push('Maintain accurate pricing and availability data');
    }

    // Blog/Content specific
    if (data.hasBlog) {
      recommendedSchemas.push('Article', 'BlogPosting');
      implementationPriority.push({
        schema: 'Article',
        priority: 'medium',
        reason: 'Enhances article visibility and enables rich snippets'
      });
      contentStrategy.push('Add author bios with AuthorPage schema');
      contentStrategy.push('Implement FAQ schema for commonly asked questions in articles');
    }

    // Local business specific
    if (data.hasLocalPresence) {
      recommendedSchemas.push('LocalBusiness', 'PostalAddress', 'GeoCoordinates');
      implementationPriority.push({
        schema: 'LocalBusiness',
        priority: 'high',
        reason: 'Critical for local search visibility and Google Business Profile integration'
      });
      contentStrategy.push('Maintain consistent NAP (Name, Address, Phone) across all platforms');
      contentStrategy.push('Add opening hours and service area information');
    }

    // Additional opportunities
    recommendedSchemas.push('FAQPage', 'HowTo', 'VideoObject');
    implementationPriority.push({
      schema: 'FAQPage',
      priority: 'medium',
      reason: 'High-impact rich snippet opportunity for voice search'
    });

    // Technical recommendations
    technicalRecommendations.push('Implement JSON-LD format (Google\'s recommended format)');
    technicalRecommendations.push('Validate all schemas using Google\'s Rich Results Test');
    technicalRecommendations.push('Monitor schema performance in Google Search Console');
    technicalRecommendations.push('Keep schemas updated with current business information');
    technicalRecommendations.push('Use schema.org version 13.0 or later for latest features');

    // Content strategy based on keywords
    contentStrategy.push(`Create content clusters around keywords: ${data.targetKeywords.slice(0, 3).join(', ')}`);
    contentStrategy.push('Develop cornerstone content pages with comprehensive schema markup');
    contentStrategy.push('Implement internal linking structure to support schema relationships');

    return {
      recommendedSchemas,
      implementationPriority,
      contentStrategy,
      technicalRecommendations
    };
  }

  /**
   * Generate data mining strategy using structured data
   */
  static generateDataMiningStrategy(industry: string): {
    dataSources: string[];
    schemaTargets: string[];
    extractionStrategy: string[];
    analysisRecommendations: string[];
  } {
    return {
      dataSources: [
        'Competitor websites with Schema.org markup',
        'Industry directories and aggregators',
        'Google Knowledge Graph entities',
        'Structured data from social media platforms',
        'Public APIs and data feeds'
      ],
      schemaTargets: [
        'Product catalogs and pricing data',
        'Business information (NAP, hours, services)',
        'Customer reviews and ratings',
        'Event listings and schedules',
        'Article metadata and content themes'
      ],
      extractionStrategy: [
        'Use Schema.org extractors to parse structured data',
        'Build knowledge graphs from interconnected entities',
        'Track schema implementation trends in your industry',
        'Monitor competitor schema strategies',
        'Aggregate rating and review data for market analysis'
      ],
      analysisRecommendations: [
        'Perform competitive gap analysis on schema implementation',
        'Identify common patterns in high-ranking pages',
        'Track schema type adoption rates over time',
        'Analyze correlation between schema richness and rankings',
        'Generate insights from aggregated structured data'
      ]
    };
  }
}
