/**
 * SEO Data Collection Service
 * Implements multi-source data collection with tiered frequency scheduling
 * Integrates Google APIs, commercial SEO tools, and web scraping
 */

import axios from 'axios';
import { google } from 'googleapis';
import * as cheerio from 'cheerio';
import { 
  SEODataRecord, 
  OnPageSEOData, 
  TechnicalSEOData,
  GoogleSearchConsoleResponse,
  PageSpeedInsightsResponse 
} from '../types/seo-schema';

export interface SEODataCollectorConfig {
  googleSearchConsoleAuth: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  pageSpeedApiKey: string;
  ahrefsApiToken?: string;
  semrushApiKey?: string;
  dataForSEOAuth?: {
    login: string;
    password: string;
  };
  crawlUserAgent: string;
  crawlDelay: number; // milliseconds between requests
}

export class SEODataCollector {
  private config: SEODataCollectorConfig;
  private searchConsole: any;
  private oauth2Client: any;

  constructor(config: SEODataCollectorConfig) {
    this.config = config;
    this.initializeGoogleAuth();
  }

  /**
   * Initialize Google OAuth2 client for Search Console API
   */
  private initializeGoogleAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.googleSearchConsoleAuth.clientId,
      this.config.googleSearchConsoleAuth.clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    this.oauth2Client.setCredentials({
      refresh_token: this.config.googleSearchConsoleAuth.refreshToken
    });

    this.searchConsole = google.searchconsole({
      version: 'v1',
      auth: this.oauth2Client
    });
  }

  /**
   * Collect Search Console data for a domain
   * Free tier: 50,000 rows/day, 1,200 requests/minute
   */
  async collectSearchConsoleData(
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions: string[] = ['page', 'query']
  ): Promise<GoogleSearchConsoleResponse> {
    try {
      const response = await this.searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'country',
              operator: 'equals',
              expression: 'usa'
            }]
          }],
          rowLimit: 25000,
          dataState: 'final'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Search Console API error:', error);
      throw error;
    }
  }

  /**
   * Collect Core Web Vitals via PageSpeed Insights API
   * Free tier: 25,000 queries/day
   */
  async collectCoreWebVitals(url: string): Promise<TechnicalSEOData> {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
    
    try {
      const response = await axios.get<PageSpeedInsightsResponse>(apiUrl, {
        params: {
          url,
          key: this.config.pageSpeedApiKey,
          category: ['performance', 'accessibility', 'seo'],
          strategy: 'mobile' // Mobile-first indexing
        }
      });

      const audits = response.data.lighthouseResult.audits;
      
      return {
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        interactionToNextPaint: audits['interaction-to-next-paint']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        timeToFirstByte: audits['server-response-time']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        
        // Extract additional metrics
        pageSize: this.extractPageSize(audits),
        requestCount: audits['network-requests']?.details?.items?.length || 0,
        javascriptSize: this.extractResourceSize(audits, 'js'),
        cssSize: this.extractResourceSize(audits, 'css'),
        imageSize: this.extractResourceSize(audits, 'image'),
        thirdPartyRequestCount: audits['third-party-summary']?.details?.items?.length || 0,
        
        // Mobile optimization
        mobileResponsive: audits['viewport']?.score === 1,
        viewportMetaTag: audits['viewport']?.score === 1,
        tapTargetSize: audits['tap-targets']?.score === 1,
        fontSizeReadability: audits['font-size']?.score === 1,
        
        // Technical health defaults (to be enriched by crawling)
        robotsTxtStatus: true,
        sitemapPresent: true,
        sitemapValidation: true,
        canonicalTagPresent: true,
        canonicalTagCorrect: true,
        metaRobotsIndex: true,
        xRobotsTagIndex: true,
        httpStatusCode: 200,
        redirectChainLength: 0,
        brokenInternalLinks: 0,
        brokenExternalLinks: 0,
        orphanPageStatus: false,
        structuredDataErrors: 0,
        structuredDataWarnings: 0,
        richSnippetEligibility: false,
        httpsEnabled: url.startsWith('https://'),
        mixedContentIssues: 0,
        securityHeadersScore: 0
      };
    } catch (error) {
      console.error('PageSpeed Insights API error:', error);
      throw error;
    }
  }

  /**
   * Validate and sanitize URL to prevent SSRF attacks
   */
  private validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
      }
      
      // Prevent access to local/private networks
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Block localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        throw new Error('Access to localhost is not allowed.');
      }
      
      // Block private IP ranges
      const privateIpRanges = [
        /^10\./,                          // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
        /^192\.168\./,                     // 192.168.0.0/16
        /^169\.254\./,                     // 169.254.0.0/16 (link-local)
        /^fd[0-9a-f]{2}:/i,               // IPv6 ULA
        /^fe80:/i                          // IPv6 link-local
      ];
      
      for (const pattern of privateIpRanges) {
        if (pattern.test(hostname)) {
          throw new Error('Access to private IP ranges is not allowed.');
        }
      }
      
      return true;
    } catch (error) {
      console.error('URL validation failed:', error.message);
      return false;
    }
  }

  /**
   * Collect on-page SEO data via web scraping
   */
  async collectOnPageData(url: string): Promise<OnPageSEOData> {
    try {
      // Validate URL to prevent SSRF
      if (!this.validateUrl(url)) {
        throw new Error('Invalid or unsafe URL provided');
      }
      
      // Add delay to respect crawl rate
      await this.delay(this.config.crawlDelay);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.config.crawlUserAgent
        },
        timeout: 30000,
        maxRedirects: 5,  // Limit redirects
        validateStatus: (status) => status >= 200 && status < 400  // Only follow success/redirect
      });

      const $ = cheerio.load(response.data);
      
      // Extract title and meta
      const titleTag = $('title').text() || '';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Extract headings
      const h1Tags = $('h1').map((_, el) => $(el).text()).get();
      const h2Tags = $('h2').map((_, el) => $(el).text()).get();
      const h3Tags = $('h3').map((_, el) => $(el).text()).get();
      const h4Tags = $('h4').map((_, el) => $(el).text()).get();
      const h5Tags = $('h5').map((_, el) => $(el).text()).get();
      const h6Tags = $('h6').map((_, el) => $(el).text()).get();
      
      // Extract content
      const bodyText = $('body').text();
      const words = bodyText.split(/\s+/).filter(word => word.length > 0);
      const contentLength = words.length;
      
      // Extract images
      const images = $('img');
      const imagesWithAlt = images.filter((_, el) => $(el).attr('alt')).length;
      
      // Extract links
      const internalLinks = $('a[href^="/"], a[href^="' + new URL(url).origin + '"]');
      
      // Extract schema markup
      const schemaScripts = $('script[type="application/ld+json"]');
      const schemaTypes: string[] = [];
      
      schemaScripts.each((_, el) => {
        try {
          const schema = JSON.parse($(el).html() || '{}');
          if (schema['@type']) {
            schemaTypes.push(schema['@type']);
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      });

      // URL analysis
      const urlObj = new URL(url);
      const urlDepth = urlObj.pathname.split('/').filter(p => p).length;
      
      return {
        titleTag,
        titleLength: titleTag.length,
        titleKeywordPresence: false, // To be calculated with target keyword
        titleKeywordPosition: -1,
        
        metaDescription,
        metaDescriptionLength: metaDescription.length,
        metaDescriptionKeywordDensity: 0, // To be calculated
        
        h1Tags,
        h2Tags,
        h3Tags,
        h4Tags,
        h5Tags,
        h6Tags,
        headingKeywordPresence: [], // To be calculated
        headingStructureScore: this.calculateHeadingStructureScore($),
        
        contentLength,
        contentReadabilityScore: this.calculateReadabilityScore(bodyText),
        keywordDensity: 0, // To be calculated with target keyword
        keywordProminence: 0,
        lsiKeywordCoverage: 0,
        
        urlLength: url.length,
        urlKeywordPresence: false, // To be calculated
        urlDepth,
        urlParameterCount: urlObj.searchParams.toString().split('&').filter(p => p).length,
        isHttps: urlObj.protocol === 'https:',
        
        imageCount: images.length,
        imagesWithAltText: imagesWithAlt,
        imagesWithDescriptiveFilenames: 0, // Requires image URL analysis
        averageImageSize: 0, // Requires fetching images
        nextGenImageFormats: 0,
        
        internalLinkCount: internalLinks.length,
        internalLinkAnchorsWithKeywords: 0, // To be calculated
        internalLinkDistribution: this.calculateLinkDistribution($),
        
        schemaTypes,
        schemaCompleteness: schemaTypes.length > 0 ? 80 : 0, // Simplified
        
        tableCount: $('table').length,
        listCount: $('ul, ol').length,
        videoEmbedCount: $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
        faqSchemaPresent: schemaTypes.includes('FAQPage'),
        
        keywordInFirstParagraph: false, // To be calculated
        keywordInLastParagraph: false,
        keywordInSubheadings: 0,
        keywordInImageAlt: 0,
        keywordInAnchorText: 0
      };
    } catch (error) {
      console.error('Web scraping error:', error);
      throw error;
    }
  }

  /**
   * Collect backlink data from Ahrefs API
   * Costs: $500/month for API access on top of subscription
   */
  async collectAhrefsBacklinks(target: string, limit: number = 1000): Promise<any> {
    if (!this.config.ahrefsApiToken) {
      throw new Error('Ahrefs API token not configured');
    }

    const apiUrl = 'https://api.ahrefs.com/v3/site-explorer/backlinks';
    
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.ahrefsApiToken}`
        },
        params: {
          target,
          limit,
          order_by: 'ahrefs_rank:desc',
          output: 'json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Ahrefs API error:', error);
      throw error;
    }
  }

  /**
   * Collect complete SEO data for a URL
   */
  async collectCompleteData(
    url: string,
    targetKeyword: string
  ): Promise<SEODataRecord> {
    // Collect data from all sources in parallel where possible
    const [onPageData, technicalData] = await Promise.all([
      this.collectOnPageData(url),
      this.collectCoreWebVitals(url)
    ]);

    // Search Console data requires date range
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const searchConsoleData = await this.collectSearchConsoleData(
      new URL(url).origin,
      startDate,
      endDate,
      ['page']
    );

    // Find metrics for this specific page
    const pageMetrics = searchConsoleData.rows?.find(
      row => row.keys[0] === url
    );

    // Build complete record
    const record: SEODataRecord = {
      url,
      pageId: this.generatePageId(url),
      domain: new URL(url).hostname,
      crawlTimestamp: new Date(),
      
      onPage: this.enrichOnPageWithKeyword(onPageData, targetKeyword),
      technical: technicalData,
      
      // Placeholder for off-page data (requires commercial APIs)
      offPage: this.createDefaultOffPageData(),
      
      userBehavior: {
        engagementRate: 0.75, // Placeholder
        bounceRate: 0.25,
        averageEngagementTime: 120,
        pagesPerSession: 2.5,
        scrollDepth: 65,
        
        impressions: pageMetrics?.impressions || 0,
        clicks: pageMetrics?.clicks || 0,
        clickThroughRate: pageMetrics?.ctr || 0,
        averagePosition: pageMetrics?.position || 0,
        
        ctrPositionDeviation: 0,
        ctrByDevice: { desktop: 0, mobile: 0, tablet: 0 },
        exitRate: 0.4,
        pageViewsPerSession: 2.5,
        returnVisitorRate: 0.3,
        socialShares: 0,
        commentCount: 0,
        dwellTime: 180,
        pogostickingRate: 0.15,
        conversionRate: 0.02,
        goalCompletions: 0,
        assistedConversions: 0
      },
      
      contentQuality: this.analyzeContentQuality(onPageData, url),
      composite: this.calculateCompositeFeatures({} as any), // Simplified
      
      targetKeyword,
      currentPosition: pageMetrics?.position || 0,
      relevanceLabel: this.calculateRelevanceLabel(pageMetrics?.position || 0),
      
      vertical: 'general',
      pageType: this.detectPageType(url, onPageData),
      competitorGroup: 'default'
    };

    return record;
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractPageSize(audits: any): number {
    const totalBytes = audits['total-byte-weight']?.numericValue || 0;
    return Math.round(totalBytes / 1024); // Convert to KB
  }

  private extractResourceSize(audits: any, type: string): number {
    const items = audits['resource-summary']?.details?.items || [];
    const resource = items.find((item: any) => item.resourceType === type);
    return resource ? Math.round(resource.size / 1024) : 0;
  }

  private calculateHeadingStructureScore($: cheerio.CheerioAPI): number {
    // Simple hierarchical consistency check
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    
    if (h1Count === 1 && h2Count > 0) {
      return 100;
    } else if (h1Count === 1) {
      return 80;
    } else if (h1Count === 0) {
      return 40;
    } else {
      return 60; // Multiple H1s
    }
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) {
      count--;
    }
    
    // Ensure at least 1 syllable
    return Math.max(1, count);
  }

  private calculateLinkDistribution($: cheerio.CheerioAPI): number[] {
    // Simplified: count links in main content areas
    const distribution = [
      $('header a').length,
      $('main a, article a').length,
      $('aside a').length,
      $('footer a').length
    ];
    
    return distribution;
  }

  private enrichOnPageWithKeyword(
    data: OnPageSEOData, 
    keyword: string
  ): OnPageSEOData {
    const keywordLower = keyword.toLowerCase();
    
    // Check keyword presence in various locations
    data.titleKeywordPresence = data.titleTag.toLowerCase().includes(keywordLower);
    data.titleKeywordPosition = data.titleTag.toLowerCase().indexOf(keywordLower);
    
    data.urlKeywordPresence = false; // Would need URL from context
    
    // Calculate keyword density
    // This is simplified - in production, use proper tokenization
    const contentWords = data.contentLength;
    const keywordOccurrences = (data.titleTag + ' ' + data.metaDescription)
      .toLowerCase()
      .split(keywordLower).length - 1;
    
    data.keywordDensity = contentWords > 0 ? (keywordOccurrences / contentWords) * 100 : 0;
    
    return data;
  }

  private createDefaultOffPageData(): any {
    // Placeholder data structure
    return {
      totalBacklinks: 0,
      referringDomains: 0,
      averageDomainRating: 0,
      averageUrlRating: 0,
      highAuthorityLinks: 0,
      mediumAuthorityLinks: 0,
      lowAuthorityLinks: 0,
      exactMatchAnchors: 0,
      partialMatchAnchors: 0,
      brandedAnchors: 0,
      genericAnchors: 0,
      anchorTextDiversityScore: 0,
      doFollowLinks: 0,
      noFollowLinks: 0,
      ugcLinks: 0,
      sponsoredLinks: 0,
      backlinksLast30Days: 0,
      backlinksLast90Days: 0,
      lostBacklinksLast30Days: 0,
      backlinkVelocity: 0,
      domainAuthority: 0,
      domainRating: 0,
      trustFlow: 0,
      citationFlow: 0,
      compositeAuthorityScore: 0,
      referringDomainsWithTraffic: 0,
      governmentBacklinks: 0,
      educationalBacklinks: 0,
      competitorBacklinkGap: 0,
      linkIntersectionScore: 0
    };
  }

  private analyzeContentQuality(onPageData: OnPageSEOData, url: string): any {
    // Simplified content quality analysis
    return {
      authorBylinePresent: false,
      authorBioPresent: false,
      authorSocialProfiles: 0,
      authorExpertiseSignals: 0,
      publishDate: new Date(),
      lastModifiedDate: new Date(),
      contentAge: 0,
      updateFrequency: 0,
      topicalCoverage: 0,
      semanticRichness: 0,
      questionsCovered: 0,
      imageToTextRatio: onPageData.imageCount / Math.max(1, onPageData.contentLength / 1000),
      videoPresent: onPageData.videoEmbedCount > 0,
      infographicsPresent: false,
      interactiveElements: 0,
      uniqueContentScore: 85, // Placeholder
      citationCount: 0,
      externalReferenceQuality: 0,
      searchIntentAlignment: 0,
      intentKeywordCoverage: 0,
      snippetOptimizedSections: 0,
      definitionBoxCandidate: false,
      listSnippetCandidate: onPageData.listCount > 0,
      tableSnippetCandidate: onPageData.tableCount > 0
    };
  }

  private calculateCompositeFeatures(data: SEODataRecord): any {
    // Placeholder composite features
    return {
      contentQualityBacklinkMultiplier: 0,
      engagementPositionInteraction: 0,
      mobileTrafficMobileFriendly: 0,
      traffic7DayMA: 0,
      traffic30DayMA: 0,
      trafficTrend: 0,
      engagementTrend: 0,
      technicalHealthScore: 0,
      contentAuthorityScore: 0,
      userSatisfactionScore: 0,
      relativeAuthorityScore: 0,
      contentGapScore: 0,
      positionChange7Days: 0,
      positionChange30Days: 0,
      rankingVolatility: 0
    };
  }

  private generatePageId(url: string): string {
    // Simple hash-based ID generation
    return Buffer.from(url).toString('base64').substring(0, 16);
  }

  private calculateRelevanceLabel(position: number): number {
    // Convert position to graded relevance (0-4 scale)
    if (position <= 3) return 4; // Perfect
    if (position <= 5) return 3; // Excellent
    if (position <= 10) return 2; // Good
    if (position <= 20) return 1; // Fair
    return 0; // Bad
  }

  private detectPageType(url: string, onPageData: OnPageSEOData): string {
    const urlLower = url.toLowerCase();
    
    if (urlLower.endsWith('/') || urlLower.endsWith('/index.html')) {
      return 'homepage';
    } else if (urlLower.includes('/product/') || urlLower.includes('/p/')) {
      return 'product';
    } else if (urlLower.includes('/category/') || urlLower.includes('/c/')) {
      return 'category';
    } else if (urlLower.includes('/blog/') || urlLower.includes('/article/')) {
      return 'article';
    } else if (onPageData.schemaTypes.includes('Article')) {
      return 'article';
    } else if (onPageData.schemaTypes.includes('Product')) {
      return 'product';
    }
    
    return 'other';
  }
}