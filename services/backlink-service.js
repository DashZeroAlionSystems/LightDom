/**
 * Backlink Service
 * 
 * Generates backlink reports and rich snippets for SEO clients.
 * Integrates with URL Seeding Service for backlink discovery.
 * 
 * Features:
 * - Backlink tracking and analysis
 * - Rich snippet generation (schema.org)
 * - SEO optimization recommendations
 * - Client-specific backlink reports
 * - Domain authority tracking
 */

import { EventEmitter } from 'events';

export class BacklinkService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      minBacklinkQuality: config.minBacklinkQuality || 0.5,
      enableRichSnippets: config.enableRichSnippets !== false,
      enableDomainAuthority: config.enableDomainAuthority !== false,
      schemaTypes: config.schemaTypes || [
        'Organization',
        'Article',
        'Product',
        'Service',
        'LocalBusiness',
        'WebPage'
      ],
      ...config
    };

    this.db = config.db || null;
    this.seedingService = config.seedingService || null;
    
    // Backlink data
    this.backlinks = new Map(); // clientId -> backlinks
    this.richSnippets = new Map(); // url -> schema markup
    this.domainMetrics = new Map(); // domain -> authority metrics
    
    console.log('✅ Backlink Service initialized');
  }

  /**
   * Generate backlink report for a client
   */
  async generateBacklinkReport(clientId, clientUrls = []) {
    console.log(`📊 Generating backlink report for client: ${clientId}`);
    
    const backlinks = [];
    const urlSet = new Set(clientUrls);

    // Get backlinks for all client URLs
    for (const url of urlSet) {
      if (this.seedingService) {
        const urlBacklinks = this.seedingService.getBacklinks(url);
        backlinks.push(...urlBacklinks);
      }
    }

    // Load additional backlinks from database
    if (this.db) {
      const dbBacklinks = await this.loadBacklinksFromDatabase(clientId);
      backlinks.push(...dbBacklinks);
    }

    // Analyze backlinks
    const analysis = this.analyzeBacklinks(backlinks);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis);
    
    const report = {
      clientId,
      generatedAt: new Date().toISOString(),
      totalBacklinks: backlinks.length,
      backlinks: backlinks.map(bl => ({
        source: bl.source,
        target: bl.target,
        relevance: bl.relevance,
        anchorText: bl.anchorText,
        quality: this.calculateBacklinkQuality(bl),
        discoveredAt: bl.discoveredAt
      })),
      analysis,
      recommendations,
      richSnippets: await this.generateRichSnippetsForUrls(clientUrls)
    };

    // Store report
    this.backlinks.set(clientId, report);
    
    // Save to database
    if (this.db) {
      await this.saveReportToDatabase(report);
    }

    this.emit('reportGenerated', { clientId, report });
    
    return report;
  }

  /**
   * Analyze backlinks for quality and patterns
   */
  analyzeBacklinks(backlinks) {
    const analysis = {
      totalBacklinks: backlinks.length,
      highQualityBacklinks: 0,
      mediumQualityBacklinks: 0,
      lowQualityBacklinks: 0,
      averageRelevance: 0,
      uniqueDomains: new Set(),
      topSources: [],
      anchorTextDistribution: new Map(),
      qualityDistribution: {
        excellent: 0, // > 0.8
        good: 0,      // 0.6-0.8
        fair: 0,      // 0.4-0.6
        poor: 0       // < 0.4
      }
    };

    let totalRelevance = 0;

    for (const backlink of backlinks) {
      const quality = this.calculateBacklinkQuality(backlink);
      
      // Quality categorization
      if (quality > 0.8) {
        analysis.qualityDistribution.excellent++;
        analysis.highQualityBacklinks++;
      } else if (quality > 0.6) {
        analysis.qualityDistribution.good++;
        analysis.highQualityBacklinks++;
      } else if (quality > 0.4) {
        analysis.qualityDistribution.fair++;
        analysis.mediumQualityBacklinks++;
      } else {
        analysis.qualityDistribution.poor++;
        analysis.lowQualityBacklinks++;
      }

      // Domain tracking
      try {
        const sourceUrl = new URL(backlink.source);
        analysis.uniqueDomains.add(sourceUrl.hostname);
      } catch (error) {
        // Skip invalid URLs
      }

      // Anchor text distribution
      if (backlink.anchorText) {
        const count = analysis.anchorTextDistribution.get(backlink.anchorText) || 0;
        analysis.anchorTextDistribution.set(backlink.anchorText, count + 1);
      }

      totalRelevance += backlink.relevance || 0;
    }

    analysis.averageRelevance = backlinks.length > 0 
      ? totalRelevance / backlinks.length 
      : 0;
    
    analysis.uniqueDomains = analysis.uniqueDomains.size;
    
    // Top anchor texts
    analysis.topAnchorTexts = Array.from(analysis.anchorTextDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([text, count]) => ({ text, count }));

    return analysis;
  }

  /**
   * Calculate backlink quality score
   */
  calculateBacklinkQuality(backlink) {
    let quality = backlink.relevance || 0.5;

    // Bonus for anchor text
    if (backlink.anchorText && backlink.anchorText.length > 3) {
      quality += 0.1;
    }

    // Bonus for context
    if (backlink.context && backlink.context.length > 10) {
      quality += 0.1;
    }

    // Check domain authority (if available)
    try {
      const sourceUrl = new URL(backlink.source);
      const domainMetrics = this.domainMetrics.get(sourceUrl.hostname);
      
      if (domainMetrics && domainMetrics.authority) {
        quality += (domainMetrics.authority / 100) * 0.2;
      }
    } catch (error) {
      // Skip invalid URLs
    }

    return Math.min(quality, 1.0);
  }

  /**
   * Generate SEO recommendations based on backlink analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Low backlink count
    if (analysis.totalBacklinks < 10) {
      recommendations.push({
        priority: 'high',
        category: 'backlink-building',
        title: 'Increase Backlink Count',
        description: 'Your site has fewer than 10 backlinks. Consider guest posting, content marketing, and outreach to increase backlinks.',
        impact: 'High'
      });
    }

    // Low quality backlinks
    if (analysis.lowQualityBacklinks > analysis.highQualityBacklinks) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        title: 'Improve Backlink Quality',
        description: 'Focus on obtaining backlinks from high-authority domains in your niche.',
        impact: 'High'
      });
    }

    // Low domain diversity
    if (analysis.uniqueDomains < 5 && analysis.totalBacklinks > 10) {
      recommendations.push({
        priority: 'medium',
        category: 'diversity',
        title: 'Diversify Backlink Sources',
        description: 'Expand your backlink profile by obtaining links from more unique domains.',
        impact: 'Medium'
      });
    }

    // Anchor text optimization
    if (analysis.topAnchorTexts && analysis.topAnchorTexts.length > 0) {
      const topAnchor = analysis.topAnchorTexts[0];
      if (topAnchor.count > analysis.totalBacklinks * 0.5) {
        recommendations.push({
          priority: 'medium',
          category: 'anchor-text',
          title: 'Diversify Anchor Text',
          description: `Over 50% of backlinks use "${topAnchor.text}". Diversify anchor text to avoid over-optimization penalties.`,
          impact: 'Medium'
        });
      }
    }

    // Add rich snippets if not present
    if (this.config.enableRichSnippets) {
      recommendations.push({
        priority: 'medium',
        category: 'rich-snippets',
        title: 'Implement Rich Snippets',
        description: 'Add schema.org structured data to improve search engine visibility and click-through rates.',
        impact: 'Medium'
      });
    }

    return recommendations;
  }

  /**
   * Generate rich snippets for URLs
   */
  async generateRichSnippetsForUrls(urls) {
    if (!this.config.enableRichSnippets) {
      return {};
    }

    const snippets = {};

    for (const url of urls) {
      const snippet = await this.generateRichSnippet(url);
      snippets[url] = snippet;
    }

    return snippets;
  }

  /**
   * Generate rich snippet (schema.org) for a URL
   */
  async generateRichSnippet(url, schemaType = 'WebPage') {
    const snippet = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      url: url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      }
    };

    // Load page data if available
    const pageData = await this.loadPageData(url);
    
    if (pageData) {
      // Add common properties
      if (pageData.title) {
        snippet.name = pageData.title;
        snippet.headline = pageData.title;
      }
      
      if (pageData.description) {
        snippet.description = pageData.description;
      }
      
      if (pageData.image) {
        snippet.image = pageData.image;
      }
      
      if (pageData.author) {
        snippet.author = {
          '@type': 'Person',
          name: pageData.author
        };
      }
      
      if (pageData.datePublished) {
        snippet.datePublished = pageData.datePublished;
      }
      
      if (pageData.dateModified) {
        snippet.dateModified = pageData.dateModified;
      }

      // Schema-specific properties
      if (schemaType === 'Article') {
        snippet.articleBody = pageData.content;
        snippet.wordCount = pageData.wordCount || 0;
      } else if (schemaType === 'Product') {
        snippet.offers = {
          '@type': 'Offer',
          price: pageData.price || '0',
          priceCurrency: pageData.currency || 'USD'
        };
      } else if (schemaType === 'Organization') {
        snippet.logo = pageData.logo;
        snippet.sameAs = pageData.socialProfiles || [];
      } else if (schemaType === 'LocalBusiness') {
        snippet.address = pageData.address;
        snippet.telephone = pageData.phone;
        snippet.openingHours = pageData.hours;
      }
    }

    // Store snippet
    this.richSnippets.set(url, snippet);
    
    return snippet;
  }

  /**
   * Generate HTML markup for rich snippet
   */
  generateSnippetMarkup(url) {
    const snippet = this.richSnippets.get(url);
    
    if (!snippet) {
      return '';
    }

    return `<script type="application/ld+json">
${JSON.stringify(snippet, null, 2)}
</script>`;
  }

  /**
   * Get backlinks for a specific client
   */
  async getBacklinksForClient(clientId) {
    const report = this.backlinks.get(clientId);
    
    if (report) {
      return report;
    }

    // Load from database
    if (this.db) {
      return await this.loadReportFromDatabase(clientId);
    }

    return null;
  }

  /**
   * Update domain authority metrics
   */
  async updateDomainAuthority(domain, metrics) {
    this.domainMetrics.set(domain, {
      domain,
      authority: metrics.authority || 0,
      trustFlow: metrics.trustFlow || 0,
      citationFlow: metrics.citationFlow || 0,
      updatedAt: new Date().toISOString()
    });

    if (this.db) {
      await this.saveDomainMetricsToDatabase(domain);
    }
  }

  /**
   * Load page data for rich snippet generation
   */
  async loadPageData(url) {
    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.query(
        `SELECT * FROM seo_training_data WHERE url = $1 LIMIT 1`,
        [url]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        title: row.title,
        description: row.meta_description,
        content: row.content_text,
        author: row.author,
        datePublished: row.publish_date,
        dateModified: row.last_modified,
        image: row.featured_image,
        wordCount: row.word_count
      };
    } catch (error) {
      console.error('Failed to load page data:', error);
      return null;
    }
  }

  /**
   * Load backlinks from database
   */
  async loadBacklinksFromDatabase(clientId) {
    if (!this.db) return [];

    try {
      const result = await this.db.query(
        `SELECT * FROM backlinks WHERE client_id = $1 ORDER BY relevance DESC`,
        [clientId]
      );

      return result.rows.map(row => ({
        source: row.source_url,
        target: row.target_url,
        relevance: row.relevance,
        anchorText: row.anchor_text,
        context: row.context,
        discoveredAt: row.discovered_at
      }));
    } catch (error) {
      console.error('Failed to load backlinks:', error);
      return [];
    }
  }

  /**
   * Save report to database
   */
  async saveReportToDatabase(report) {
    if (!this.db) return;

    try {
      await this.db.query(
        `INSERT INTO backlink_reports 
        (client_id, total_backlinks, analysis, recommendations, generated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (client_id) 
        DO UPDATE SET 
          total_backlinks = EXCLUDED.total_backlinks,
          analysis = EXCLUDED.analysis,
          recommendations = EXCLUDED.recommendations,
          generated_at = EXCLUDED.generated_at`,
        [
          report.clientId,
          report.totalBacklinks,
          JSON.stringify(report.analysis),
          JSON.stringify(report.recommendations),
          report.generatedAt
        ]
      );
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  /**
   * Load report from database
   */
  async loadReportFromDatabase(clientId) {
    if (!this.db) return null;

    try {
      const result = await this.db.query(
        `SELECT * FROM backlink_reports WHERE client_id = $1`,
        [clientId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        clientId: row.client_id,
        totalBacklinks: row.total_backlinks,
        analysis: row.analysis,
        recommendations: row.recommendations,
        generatedAt: row.generated_at
      };
    } catch (error) {
      console.error('Failed to load report:', error);
      return null;
    }
  }

  /**
   * Save domain metrics to database
   */
  async saveDomainMetricsToDatabase(domain) {
    if (!this.db) return;

    const metrics = this.domainMetrics.get(domain);
    if (!metrics) return;

    try {
      await this.db.query(
        `INSERT INTO domain_authority 
        (domain, authority, trust_flow, citation_flow, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (domain) 
        DO UPDATE SET 
          authority = EXCLUDED.authority,
          trust_flow = EXCLUDED.trust_flow,
          citation_flow = EXCLUDED.citation_flow,
          updated_at = EXCLUDED.updated_at`,
        [
          metrics.domain,
          metrics.authority,
          metrics.trustFlow,
          metrics.citationFlow,
          metrics.updatedAt
        ]
      );
    } catch (error) {
      console.error('Failed to save domain metrics:', error);
    }
  }
}

export default BacklinkService;
