/**
 * Comprehensive SEO Data Schema
 * Implements 150+ features across 5 major categories for AI-driven SEO optimization
 * Based on production requirements for ranking prediction models
 */

// ============================================================================
// ON-PAGE SEO FEATURES (77 fields)
// ============================================================================
export interface OnPageSEOData {
  // Title and Meta
  titleTag: string; // max 70 characters
  titleLength: number;
  titleKeywordPresence: boolean;
  titleKeywordPosition: number; // position of primary keyword in title
  
  metaDescription: string; // max 160 characters
  metaDescriptionLength: number;
  metaDescriptionKeywordDensity: number; // 0-100%
  
  // Heading Structure
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  h4Tags: string[];
  h5Tags: string[];
  h6Tags: string[];
  headingKeywordPresence: boolean[];
  headingStructureScore: number; // hierarchical consistency score
  
  // Content Metrics
  contentLength: number; // word count
  contentReadabilityScore: number; // Flesch-Kincaid score
  keywordDensity: number; // primary keyword density 0-100%
  keywordProminence: number; // keyword position weighting
  lsiKeywordCoverage: number; // latent semantic indexing coverage
  
  // URL Structure
  urlLength: number;
  urlKeywordPresence: boolean;
  urlDepth: number; // number of subdirectories
  urlParameterCount: number;
  isHttps: boolean;
  
  // Image Optimization
  imageCount: number;
  imagesWithAltText: number;
  imagesWithDescriptiveFilenames: number;
  averageImageSize: number; // in KB
  nextGenImageFormats: number; // WebP, AVIF count
  
  // Internal Linking
  internalLinkCount: number;
  internalLinkAnchorsWithKeywords: number;
  internalLinkDistribution: number[]; // links per section
  
  // Schema Markup
  schemaTypes: string[]; // Organization, Product, Article, etc.
  schemaCompleteness: number; // 0-100% required fields filled
  
  // Content Structure
  tableCount: number;
  listCount: number;
  videoEmbedCount: number;
  faqSchemaPresent: boolean;
  
  // Keywords in Critical Locations
  keywordInFirstParagraph: boolean;
  keywordInLastParagraph: boolean;
  keywordInSubheadings: number; // count
  keywordInImageAlt: number; // count
  keywordInAnchorText: number; // count
}

// ============================================================================
// TECHNICAL SEO FEATURES
// ============================================================================
export interface TechnicalSEOData {
  // Core Web Vitals (2024 thresholds)
  largestContentfulPaint: number; // LCP in ms, good ≤ 2500ms
  interactionToNextPaint: number; // INP in ms, good ≤ 200ms (replaced FID)
  cumulativeLayoutShift: number; // CLS score, good ≤ 0.1
  
  // Performance Metrics
  firstContentfulPaint: number; // FCP in ms
  timeToFirstByte: number; // TTFB in ms
  totalBlockingTime: number; // TBT in ms
  speedIndex: number; // Speed Index score
  
  // Page Load Metrics
  pageSize: number; // total KB
  requestCount: number; // total HTTP requests
  javascriptSize: number; // JS bundle size in KB
  cssSize: number; // CSS size in KB
  imageSize: number; // total image size in KB
  thirdPartyRequestCount: number;
  
  // Mobile Optimization
  mobileResponsive: boolean;
  viewportMetaTag: boolean;
  tapTargetSize: boolean; // buttons ≥ 48x48px
  fontSizeReadability: boolean; // ≥ 16px base
  
  // Crawlability
  robotsTxtStatus: boolean;
  sitemapPresent: boolean;
  sitemapValidation: boolean;
  canonicalTagPresent: boolean;
  canonicalTagCorrect: boolean;
  
  // Indexability
  metaRobotsIndex: boolean;
  xRobotsTagIndex: boolean;
  
  // Technical Health
  httpStatusCode: number;
  redirectChainLength: number;
  brokenInternalLinks: number;
  brokenExternalLinks: number;
  orphanPageStatus: boolean;
  
  // Structured Data
  structuredDataErrors: number;
  structuredDataWarnings: number;
  richSnippetEligibility: boolean;
  
  // Security
  httpsEnabled: boolean;
  mixedContentIssues: number;
  securityHeadersScore: number; // CSP, HSTS, etc.
}

// ============================================================================
// OFF-PAGE AUTHORITY FEATURES
// ============================================================================
export interface OffPageAuthorityData {
  // Backlink Profile
  totalBacklinks: number;
  referringDomains: number;
  averageDomainRating: number; // 0-100
  averageUrlRating: number; // 0-100
  
  // Link Quality Distribution
  highAuthorityLinks: number; // DR > 70
  mediumAuthorityLinks: number; // DR 30-70
  lowAuthorityLinks: number; // DR < 30
  
  // Anchor Text Distribution
  exactMatchAnchors: number;
  partialMatchAnchors: number;
  brandedAnchors: number;
  genericAnchors: number;
  anchorTextDiversityScore: number; // TF-IDF based
  
  // Link Attributes
  doFollowLinks: number;
  noFollowLinks: number;
  ugcLinks: number;
  sponsoredLinks: number;
  
  // Temporal Metrics
  backlinksLast30Days: number;
  backlinksLast90Days: number;
  lostBacklinksLast30Days: number;
  backlinkVelocity: number; // new_links_30d / total_links
  
  // Authority Scores (normalized)
  domainAuthority: number; // Moz DA 0-100
  domainRating: number; // Ahrefs DR 0-100
  trustFlow: number; // Majestic TF 0-100
  citationFlow: number; // Majestic CF 0-100
  compositeAuthorityScore: number; // weighted average
  
  // Referring Domain Quality
  referringDomainsWithTraffic: number;
  governmentBacklinks: number; // .gov domains
  educationalBacklinks: number; // .edu domains
  
  // Competitive Metrics
  competitorBacklinkGap: number; // vs top 3 competitors
  linkIntersectionScore: number; // shared referring domains
}

// ============================================================================
// USER BEHAVIOR FEATURES
// ============================================================================
export interface UserBehaviorData {
  // Google Analytics 4 Metrics
  engagementRate: number; // engaged_sessions / total_sessions
  bounceRate: number; // (sessions - engaged_sessions) / sessions
  averageEngagementTime: number; // seconds
  pagesPerSession: number;
  scrollDepth: number; // average percentage
  
  // Search Console Metrics
  impressions: number;
  clicks: number;
  clickThroughRate: number; // clicks / impressions
  averagePosition: number;
  
  // CTR by Position
  ctrPositionDeviation: number; // actual vs expected CTR
  ctrByDevice: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // User Flow
  exitRate: number;
  pageViewsPerSession: number;
  returnVisitorRate: number;
  
  // Engagement Signals
  socialShares: number;
  commentCount: number;
  dwellTime: number; // estimated from GA4
  pogostickingRate: number; // quick returns to SERP
  
  // Conversion Metrics
  conversionRate: number;
  goalCompletions: number;
  assistedConversions: number;
}

// ============================================================================
// CONTENT QUALITY FEATURES
// ============================================================================
export interface ContentQualityData {
  // E-E-A-T Signals
  authorBylinePresent: boolean;
  authorBioPresent: boolean;
  authorSocialProfiles: number;
  authorExpertiseSignals: number; // credentials, experience mentions
  
  // Content Freshness
  publishDate: Date;
  lastModifiedDate: Date;
  contentAge: number; // days
  updateFrequency: number; // updates per year
  
  // Content Depth
  topicalCoverage: number; // entity coverage score
  semanticRichness: number; // unique entities per 1000 words
  questionsCovered: number; // who, what, where, when, why, how
  
  // Multimedia
  imageToTextRatio: number;
  videoPresent: boolean;
  infographicsPresent: boolean;
  interactiveElements: number;
  
  // Originality
  uniqueContentScore: number; // 0-100%
  citationCount: number;
  externalReferenceQuality: number; // authority of cited sources
  
  // User Intent Match
  searchIntentAlignment: number; // informational, transactional, navigational
  intentKeywordCoverage: number;
  
  // Featured Snippet Optimization
  snippetOptimizedSections: number;
  definitionBoxCandidate: boolean;
  listSnippetCandidate: boolean;
  tableSnippetCandidate: boolean;
}

// ============================================================================
// COMPOSITE SEO FEATURES
// ============================================================================
export interface CompositeSEOFeatures {
  // Interaction Features
  contentQualityBacklinkMultiplier: number; // quality × backlinks
  engagementPositionInteraction: number; // engagement × (1/position)
  mobileTrafficMobileFriendly: number; // mobile_traffic × mobile_score
  
  // Temporal Features
  traffic7DayMA: number; // 7-day moving average
  traffic30DayMA: number; // 30-day moving average
  trafficTrend: number; // linear regression slope
  engagementTrend: number;
  
  // Domain-Specific Scores
  technicalHealthScore: number; // (1 - error_rate) × https × mobile × cwv
  contentAuthorityScore: number; // content_score × topical_authority
  userSatisfactionScore: number; // engagement × (1 - bounce) × dwell_time
  
  // Competitive Position
  relativeAuthorityScore: number; // vs competitor average
  contentGapScore: number; // missing topics vs competitors
  
  // Ranking Momentum
  positionChange7Days: number;
  positionChange30Days: number;
  rankingVolatility: number; // standard deviation of positions
}

// ============================================================================
// COMPLETE SEO RECORD
// ============================================================================
export interface SEODataRecord {
  // Identifiers
  url: string;
  pageId: string;
  domain: string;
  crawlTimestamp: Date;
  
  // Feature Categories
  onPage: OnPageSEOData;
  technical: TechnicalSEOData;
  offPage: OffPageAuthorityData;
  userBehavior: UserBehaviorData;
  contentQuality: ContentQualityData;
  composite: CompositeSEOFeatures;
  
  // Target Variables
  targetKeyword: string;
  currentPosition: number;
  relevanceLabel: number; // 0-4 graded relevance
  
  // Metadata
  vertical: string; // industry/category
  pageType: string; // homepage, product, article, etc.
  competitorGroup: string; // for relative scoring
}

// ============================================================================
// ML FEATURE VECTOR
// ============================================================================
export interface SEOFeatureVector {
  features: number[]; // flattened numerical features
  featureNames: string[]; // feature identifiers
  categoricalFeatures: { [key: string]: string }; // categorical data
  
  // Feature metadata
  featureImportance?: number[]; // from trained model
  featureStats: {
    mean: number[];
    std: number[];
    min: number[];
    max: number[];
  };
}

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================
export interface GoogleSearchConsoleResponse {
  rows: Array<{
    keys: string[]; // [page, query, device, country]
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  responseAggregationType: string;
}

export interface PageSpeedInsightsResponse {
  lighthouseResult: {
    audits: {
      'largest-contentful-paint': { numericValue: number };
      'interaction-to-next-paint': { numericValue: number };
      'cumulative-layout-shift': { numericValue: number };
    };
    categories: {
      performance: { score: number };
    };
  };
}

export interface AhrefsBacklinkResponse {
  backlinks: Array<{
    url_from: string;
    url_to: string;
    ahrefs_rank: number;
    domain_rating: number;
    url_rating: number;
    traffic: number;
    keywords: number;
    anchor: string;
    anchor_type: string; // exact, phrase, branded, generic
    nofollow: boolean;
    first_seen: string;
    last_seen: string;
  }>;
  refdomains: number;
}