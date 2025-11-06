/**
 * Complete SEO Feature Schema - 194 Features
 * 
 * Category Breakdown:
 * - On-Page SEO: 35 features
 * - Technical SEO: 28 features
 * - Core Web Vitals: 18 features
 * - Off-Page/Authority: 32 features
 * - User Engagement: 24 features
 * - Content Quality: 22 features
 * - Temporal/Trend: 15 features
 * - Interaction Features: 12 features
 * - Composite Scores: 8 features
 * 
 * Total: 194 features
 */

// ============================================================================
// 1. ON-PAGE SEO FEATURES (35 features)
// ============================================================================

export interface OnPageSEOComplete {
  // Title Tag Features (6)
  title_text: string;                    // 1. The actual title text
  title_length: number;                  // 2. Character count of title
  title_word_count: number;              // 3. Number of words in title
  title_optimal_length: boolean;         // 4. Is between 50-60 characters
  title_has_keyword: boolean;            // 5. Contains target keyword
  title_keyword_position: number;        // 6. Position of keyword in title (0=start)

  // Meta Description Features (5)
  meta_description: string;              // 7. The actual meta description
  meta_desc_length: number;              // 8. Character count
  meta_desc_optimal: boolean;            // 9. Is between 150-160 characters
  meta_desc_has_keyword: boolean;        // 10. Contains target keyword
  meta_desc_has_cta: boolean;            // 11. Contains call-to-action words

  // Heading Structure (9)
  h1_count: number;                      // 12. Number of H1 tags
  h1_text: string;                       // 13. Text of first H1
  h1_length: number;                     // 14. Character count of H1
  h1_has_keyword: boolean;               // 15. H1 contains keyword
  h2_count: number;                      // 16. Number of H2 tags
  h3_count: number;                      // 17. Number of H3 tags
  h4_count: number;                      // 18. Number of H4 tags
  h5_count: number;                      // 19. Number of H5 tags
  h6_count: number;                      // 20. Number of H6 tags

  // URL Features (8)
  url: string;                           // 21. Full URL
  url_length: number;                    // 22. Character count
  url_depth: number;                     // 23. Number of path segments
  url_has_keyword: boolean;              // 24. URL contains keyword
  url_has_numbers: boolean;              // 25. Contains numbers
  url_has_special_chars: number;         // 26. Count of special characters
  url_slug_length: number;               // 27. Length of final path segment
  url_is_https: boolean;                 // 28. Uses HTTPS

  // Keyword Usage (7)
  keyword_density: number;               // 29. Keyword density percentage
  keyword_in_first_100_words: boolean;   // 30. Keyword appears early
  keyword_in_url: boolean;               // 31. Keyword in URL
  keyword_in_h1: boolean;                // 32. Keyword in H1
  keyword_in_h2: boolean;                // 33. Keyword in at least one H2
  keyword_in_meta: boolean;              // 34. Keyword in meta description
  keyword_exact_match_count: number;     // 35. Exact phrase occurrences
}

// ============================================================================
// 2. TECHNICAL SEO FEATURES (28 features)
// ============================================================================

export interface TechnicalSEOComplete {
  // Page Performance (8)
  page_size_kb: number;                  // 36. Total page size in KB
  html_size_kb: number;                  // 37. HTML document size
  image_size_kb: number;                 // 38. Total image size
  css_size_kb: number;                   // 39. Total CSS size
  js_size_kb: number;                    // 40. Total JavaScript size
  total_requests: number;                // 41. Number of HTTP requests
  time_to_first_byte: number;            // 42. TTFB in milliseconds
  dom_content_loaded: number;            // 43. DOMContentLoaded time (ms)

  // Mobile Optimization (6)
  is_mobile_friendly: boolean;           // 44. Mobile-friendly test passed
  viewport_configured: boolean;          // 45. Has viewport meta tag
  responsive_images: boolean;            // 46. Uses responsive image techniques
  mobile_page_speed_score: number;       // 47. Mobile PageSpeed score (0-100)
  mobile_usability_issues: number;       // 48. Count of mobile issues
  tap_targets_appropriate: boolean;      // 49. Touch elements properly sized

  // Structured Data (6)
  has_schema_markup: boolean;            // 50. Any schema present
  schema_types: string[];                // 51. Types of schema used
  schema_count: number;                  // 52. Number of schema blocks
  has_organization_schema: boolean;      // 53. Organization schema present
  has_article_schema: boolean;           // 54. Article schema present
  has_breadcrumb_schema: boolean;        // 55. Breadcrumb schema present

  // Indexability (8)
  is_indexable: boolean;                 // 56. Not blocked from indexing
  robots_meta_tag: string;               // 57. Content of robots meta tag
  canonical_url: string;                 // 58. Canonical URL specified
  has_canonical: boolean;                // 59. Canonical tag exists
  canonical_is_self: boolean;            // 60. Canonical points to self
  has_hreflang: boolean;                 // 61. International targeting tags
  xml_sitemap_listed: boolean;           // 62. Present in XML sitemap
  robots_txt_allowed: boolean;           // 63. Not blocked by robots.txt
}

// ============================================================================
// 3. CORE WEB VITALS FEATURES (18 features)
// ============================================================================

export interface CoreWebVitalsComplete {
  // Largest Contentful Paint (6)
  lcp_ms: number;                        // 64. LCP time in milliseconds
  lcp_score: number;                     // 65. Normalized score (0-1)
  lcp_good: boolean;                     // 66. ≤2500ms
  lcp_needs_improvement: boolean;        // 67. 2500-4000ms
  lcp_poor: boolean;                     // 68. >4000ms
  lcp_element_type: string;              // 69. Type of LCP element (image/text)

  // Interaction to Next Paint (6)
  inp_ms: number;                        // 70. INP time in milliseconds
  inp_score: number;                     // 71. Normalized score (0-1)
  inp_good: boolean;                     // 72. ≤200ms
  inp_needs_improvement: boolean;        // 73. 200-500ms
  inp_poor: boolean;                     // 74. >500ms
  long_tasks_count: number;              // 75. Number of long JavaScript tasks

  // Cumulative Layout Shift (6)
  cls_score: number;                     // 76. CLS score
  cls_normalized: number;                // 77. Normalized score (0-1)
  cls_good: boolean;                     // 78. ≤0.1
  cls_needs_improvement: boolean;        // 79. 0.1-0.25
  cls_poor: boolean;                     // 80. >0.25
  cls_elements_count: number;            // 81. Elements causing shift
}

// ============================================================================
// 4. OFF-PAGE/AUTHORITY FEATURES (32 features)
// ============================================================================

export interface OffPageAuthorityComplete {
  // Backlink Profile (12)
  total_backlinks: number;               // 82. Total number of backlinks
  referring_domains: number;             // 83. Unique referring domains
  dofollow_backlinks: number;            // 84. Count of dofollow links
  nofollow_backlinks: number;            // 85. Count of nofollow links
  dofollow_ratio: number;                // 86. Dofollow / total backlinks
  avg_domain_rating: number;             // 87. Average DR of referring domains
  avg_url_rating: number;                // 88. Average UR of backlinks
  backlink_velocity_30d: number;         // 89. New backlinks in last 30 days
  lost_backlinks_30d: number;            // 90. Lost backlinks in last 30 days
  broken_backlinks: number;              // 91. Count of broken backlinks
  redirect_backlinks: number;            // 92. Backlinks through redirects
  edu_backlinks: number;                 // 93. Backlinks from .edu domains

  // Anchor Text Distribution (8)
  exact_match_anchors: number;           // 94. Exact keyword match anchors
  partial_match_anchors: number;         // 95. Partial keyword matches
  branded_anchors: number;               // 96. Brand name anchors
  generic_anchors: number;               // 97. Generic text anchors (click here, etc.)
  naked_url_anchors: number;             // 98. Raw URL as anchor
  image_anchors: number;                 // 99. Image alt text as anchor
  anchor_text_diversity: number;         // 100. Entropy of anchor distribution
  exact_match_ratio: number;             // 101. Exact match / total anchors

  // Domain Authority (7)
  domain_authority: number;              // 102. Moz Domain Authority (0-100)
  page_authority: number;                // 103. Moz Page Authority (0-100)
  domain_rating: number;                 // 104. Ahrefs Domain Rating (0-100)
  url_rating: number;                    // 105. Ahrefs URL Rating (0-100)
  trust_flow: number;                    // 106. Majestic Trust Flow (0-100)
  citation_flow: number;                 // 107. Majestic Citation Flow (0-100)
  spam_score: number;                    // 108. Moz Spam Score (0-100)

  // Social Signals (5)
  facebook_shares: number;               // 109. Facebook share count
  twitter_shares: number;                // 110. Twitter/X mentions
  linkedin_shares: number;               // 111. LinkedIn shares
  pinterest_pins: number;                // 112. Pinterest pins
  reddit_mentions: number;               // 113. Reddit mentions/submissions
}

// ============================================================================
// 5. USER ENGAGEMENT FEATURES (24 features)
// ============================================================================

export interface UserEngagementComplete {
  // Search Console Metrics (8)
  clicks: number;                        // 114. Total clicks from search
  impressions: number;                   // 115. Total impressions
  ctr: number;                          // 116. Click-through rate
  average_position: number;              // 117. Average ranking position
  clicks_7d: number;                     // 118. Clicks last 7 days
  clicks_30d: number;                    // 119. Clicks last 30 days
  impressions_7d: number;                // 120. Impressions last 7 days
  impressions_30d: number;               // 121. Impressions last 30 days

  // Google Analytics Metrics (10)
  pageviews: number;                     // 122. Total pageviews
  unique_pageviews: number;              // 123. Unique pageviews
  avg_time_on_page: number;              // 124. Average time in seconds
  bounce_rate: number;                   // 125. Bounce rate percentage
  exit_rate: number;                     // 126. Exit rate percentage
  pages_per_session: number;             // 127. Average pages per session
  engagement_rate: number;               // 128. Engaged sessions / total sessions
  scroll_depth_avg: number;              // 129. Average scroll depth percentage
  conversion_rate: number;               // 130. Goal conversion rate
  revenue_per_pageview: number;          // 131. E-commerce revenue / pageviews

  // CTR Performance (6)
  expected_ctr: number;                  // 132. Expected CTR for position
  ctr_vs_expected: number;               // 133. Actual CTR / expected CTR
  ctr_performance_category: string;      // 134. outperforming/average/underperforming
  position_1_3_impressions: number;      // 135. Impressions in top 3
  position_4_10_impressions: number;     // 136. Impressions 4-10
  featured_snippet_impressions: number;  // 137. Featured snippet shows
}

// ============================================================================
// 6. CONTENT QUALITY FEATURES (22 features)
// ============================================================================

export interface ContentQualityComplete {
  // Content Length & Structure (8)
  word_count: number;                    // 138. Total word count
  paragraph_count: number;               // 139. Number of paragraphs
  sentence_count: number;                // 140. Number of sentences
  avg_sentence_length: number;           // 141. Average words per sentence
  avg_paragraph_length: number;          // 142. Average words per paragraph
  reading_time_minutes: number;          // 143. Estimated reading time
  flesch_reading_ease: number;           // 144. Readability score
  flesch_kincaid_grade: number;          // 145. Grade level score

  // Media Elements (6)
  image_count: number;                   // 146. Total images
  images_with_alt: number;               // 147. Images with alt text
  images_without_alt: number;            // 148. Images missing alt text
  video_count: number;                   // 149. Number of videos
  infographic_count: number;             // 150. Infographics/charts
  image_alt_optimization_rate: number;   // 151. % images with alt text

  // Content Freshness (4)
  published_date: Date;                  // 152. Original publication date
  last_modified_date: Date;              // 153. Last update date
  content_age_days: number;              // 154. Days since publication
  days_since_update: number;             // 155. Days since last update

  // Semantic Content (4)
  lsi_keyword_count: number;             // 156. Latent semantic keywords found
  entity_count: number;                  // 157. Named entities detected
  entity_density: number;                // 158. Entities per 1000 words
  content_depth_score: number;           // 159. Comprehensive coverage score (0-1)
}

// ============================================================================
// 7. TEMPORAL/TREND FEATURES (15 features)
// ============================================================================

export interface TemporalTrendComplete {
  // Rolling Averages (6)
  clicks_7d_avg: number;                 // 160. 7-day moving average clicks
  clicks_30d_avg: number;                // 161. 30-day moving average clicks
  position_7d_avg: number;               // 162. 7-day average position
  position_30d_avg: number;              // 163. 30-day average position
  ctr_7d_avg: number;                    // 164. 7-day average CTR
  ctr_30d_avg: number;                   // 165. 30-day average CTR

  // Trends & Momentum (6)
  clicks_trend_7d: number;               // 166. % change in clicks (7 days)
  position_trend_7d: number;             // 167. Change in position (7 days)
  clicks_trend_30d: number;              // 168. % change in clicks (30 days)
  position_trend_30d: number;            // 169. Change in position (30 days)
  traffic_momentum: number;              // 170. Acceleration of traffic growth
  ranking_momentum: number;              // 171. Acceleration of position improvement

  // Seasonality (3)
  day_of_week: number;                   // 172. Day of week (0-6)
  month: number;                         // 173. Month (1-12)
  is_weekend: boolean;                   // 174. Saturday or Sunday
}

// ============================================================================
// 8. INTERACTION FEATURES (12 features)
// ============================================================================

export interface InteractionFeaturesComplete {
  // Quality × Authority
  content_quality_authority_interaction: number;  // 175. content_quality × domain_authority
  technical_authority_interaction: number;        // 176. technical_health × domain_rating

  // Engagement × Position
  engagement_position_interaction: number;        // 177. ctr × (1/position)
  time_position_interaction: number;              // 178. avg_time_on_page × (1/position)

  // Technical × Content
  technical_content_interaction: number;          // 179. cwv_composite × log(word_count)
  speed_content_interaction: number;              // 180. lcp_score × content_quality_score

  // Mobile × Speed
  mobile_speed_interaction: number;               // 181. mobile_traffic_share × lcp_score
  mobile_usability_interaction: number;           // 182. is_mobile_friendly × mobile_page_speed

  // Backlinks × Content
  backlinks_quality_interaction: number;          // 183. referring_domains × content_depth
  authority_freshness_interaction: number;        // 184. domain_authority × (1/content_age_days)

  // CTR × Quality
  ctr_quality_interaction: number;                // 185. ctr_vs_expected × content_quality_score
  engagement_quality_interaction: number;         // 186. engagement_rate × onpage_optimization
}

// ============================================================================
// 9. COMPOSITE SCORES (8 features)
// ============================================================================

export interface CompositeScoresComplete {
  technical_health_score: number;        // 187. Composite of CWV, mobile, HTTPS, schema (0-1)
  onpage_optimization_score: number;     // 188. Composite of title, meta, headings, keywords (0-1)
  content_quality_score: number;         // 189. Composite of length, readability, media, freshness (0-1)
  authority_score: number;               // 190. Normalized average of DA, DR, TF (0-1)
  engagement_score: number;              // 191. Composite of CTR, time on page, bounce rate (0-1)
  cwv_composite_score: number;           // 192. Weighted average of LCP, INP, CLS scores (0-1)
  overall_seo_score: number;             // 193. Master score combining all factors (0-1)
  ranking_potential_score: number;       // 194. Predicted ranking capability (0-1)
}

// ============================================================================
// COMPLETE SEO FEATURE RECORD
// ============================================================================

export interface CompleteSEOFeatureRecord {
  // Metadata
  id: string;
  url: string;
  query: string;
  collected_at: Date;

  // All feature categories
  onPage: OnPageSEOComplete;
  technical: TechnicalSEOComplete;
  coreWebVitals: CoreWebVitalsComplete;
  offPageAuthority: OffPageAuthorityComplete;
  userEngagement: UserEngagementComplete;
  contentQuality: ContentQualityComplete;
  temporalTrend: TemporalTrendComplete;
  interactionFeatures: InteractionFeaturesComplete;
  compositeScores: CompositeScoresComplete;
}

// ============================================================================
// FEATURE COLLECTION PHASES
// ============================================================================

export interface FeatureCollectionPhases {
  // Phase 1: MVP (50 features)
  phase1_mvp: {
    // Essential on-page (15)
    title_length: boolean;
    title_has_keyword: boolean;
    meta_desc_length: boolean;
    word_count: boolean;
    h1_count: boolean;
    h2_count: boolean;
    url_depth: boolean;
    url_is_https: boolean;
    keyword_density: boolean;
    keyword_in_h1: boolean;
    
    // Core Web Vitals (9)
    lcp_ms: boolean;
    lcp_good: boolean;
    inp_ms: boolean;
    inp_good: boolean;
    cls_score: boolean;
    cls_good: boolean;
    cwv_composite_score: boolean;
    
    // Search Console (8)
    clicks: boolean;
    impressions: boolean;
    ctr: boolean;
    average_position: boolean;
    clicks_7d: boolean;
    
    // Basic authority (5)
    domain_authority: boolean;
    total_backlinks: boolean;
    referring_domains: boolean;
    
    // Content basics (8)
    paragraph_count: boolean;
    image_count: boolean;
    flesch_reading_ease: boolean;
    content_age_days: boolean;
    
    // Basic composite (5)
    technical_health_score: boolean;
    content_quality_score: boolean;
    authority_score: boolean;
    overall_seo_score: boolean;
  };

  // Phase 2: Production (100 features)
  phase2_production: {
    // Includes all Phase 1 features plus:
    complete_backlink_analysis: boolean;
    all_engagement_metrics: boolean;
    temporal_features: boolean;
    advanced_onpage: boolean;
    social_signals: boolean;
  };

  // Phase 3: Enterprise (194 features)
  phase3_enterprise: {
    // All features including:
    full_interaction_features: boolean;
    semantic_analysis: boolean;
    competitive_metrics: boolean;
    advanced_temporal_patterns: boolean;
  };
}

// ============================================================================
// FEATURE IMPORTANCE RANKING
// ============================================================================

export const FEATURE_IMPORTANCE_RANKING = {
  // Top 10 Most Important Features (typical model)
  1: 'domain_authority',           // Feature #102
  2: 'total_backlinks',           // Feature #82
  3: 'word_count',                // Feature #138
  4: 'cwv_composite_score',       // Feature #192
  5: 'ctr_vs_expected',           // Feature #133
  6: 'title_optimal_length',      // Feature #4
  7: 'average_position',          // Feature #117
  8: 'page_authority',            // Feature #103
  9: 'engagement_rate',           // Feature #128
  10: 'content_age_days',         // Feature #154
  
  // Next 10 Important Features
  11: 'referring_domains',        // Feature #83
  12: 'clicks',                   // Feature #114
  13: 'lcp_ms',                   // Feature #64
  14: 'bounce_rate',              // Feature #125
  15: 'h1_has_keyword',           // Feature #15
  16: 'content_quality_score',    // Feature #189
  17: 'mobile_page_speed_score',  // Feature #47
  18: 'has_schema_markup',        // Feature #50
  19: 'keyword_density',          // Feature #29
  20: 'avg_time_on_page'          // Feature #124
};

// ============================================================================
// EXPECTED CTR BY POSITION
// ============================================================================

export const EXPECTED_CTR_BY_POSITION: { [key: number]: number; default: number } = {
  1: 0.316,    // 31.6% CTR for position 1
  2: 0.177,    // 17.7% CTR for position 2
  3: 0.112,    // 11.2% CTR for position 3
  4: 0.080,    // 8.0% CTR for position 4
  5: 0.061,    // 6.1% CTR for position 5
  6: 0.047,    // 4.7% CTR for position 6
  7: 0.037,    // 3.7% CTR for position 7
  8: 0.030,    // 3.0% CTR for position 8
  9: 0.025,    // 2.5% CTR for position 9
  10: 0.021,   // 2.1% CTR for position 10
  // Positions 11-20
  11: 0.017,
  12: 0.014,
  13: 0.012,
  14: 0.010,
  15: 0.009,
  16: 0.008,
  17: 0.007,
  18: 0.006,
  19: 0.006,
  20: 0.005,
  // Default for positions beyond 20
  default: 0.003
};

// Helper function to get expected CTR
export function getExpectedCTR(position: number): number {
  return EXPECTED_CTR_BY_POSITION[Math.floor(position)] || EXPECTED_CTR_BY_POSITION.default;
}

// ============================================================================
// FEATURE CALCULATION HELPERS
// ============================================================================

export class SEOFeatureCalculator {
  // Calculate title optimization score
  static calculateTitleScore(title: string, keyword: string): number {
    const length = title.length;
    const optimalLength = length >= 50 && length <= 60;
    const hasKeyword = title.toLowerCase().includes(keyword.toLowerCase());
    const keywordPosition = title.toLowerCase().indexOf(keyword.toLowerCase());
    const keywordEarly = keywordPosition >= 0 && keywordPosition < 30;
    
    let score = 0;
    if (optimalLength) score += 0.3;
    if (hasKeyword) score += 0.4;
    if (keywordEarly) score += 0.3;
    
    return score;
  }

  // Calculate content quality composite
  static calculateContentQualityScore(features: Partial<ContentQualityComplete>): number {
    const wordCountScore = Math.min(features.word_count! / 2000, 1) * 0.25;
    const readabilityScore = (features.flesch_reading_ease! / 100) * 0.20;
    const mediaScore = (features.image_count! > 0 ? 0.1 : 0) + 
                      (features.video_count! > 0 ? 0.1 : 0);
    const freshnessScore = Math.max(0, 1 - (features.content_age_days! / 365)) * 0.15;
    const depthScore = (features.content_depth_score! || 0.5) * 0.20;
    
    return wordCountScore + readabilityScore + mediaScore + freshnessScore + depthScore;
  }

  // Calculate technical health score
  static calculateTechnicalHealthScore(
    cwv: Partial<CoreWebVitalsComplete>,
    technical: Partial<TechnicalSEOComplete>
  ): number {
    const cwvScore = ((cwv.lcp_good ? 0.35 : 0) + 
                     (cwv.inp_good ? 0.35 : 0) + 
                     (cwv.cls_good ? 0.30 : 0)) * 0.4;
    
    const mobileScore = (technical.is_mobile_friendly ? 0.2 : 0);
    const httpsScore = (technical.url_is_https ? 0.1 : 0);
    const schemaScore = (technical.has_schema_markup ? 0.1 : 0);
    const indexableScore = (technical.is_indexable ? 0.2 : 0);
    
    return cwvScore + mobileScore + httpsScore + schemaScore + indexableScore;
  }

  // Calculate overall SEO score
  static calculateOverallSEOScore(features: Partial<CompleteSEOFeatureRecord>): number {
    const weights = {
      technical: 0.25,
      content: 0.20,
      authority: 0.25,
      engagement: 0.20,
      onpage: 0.10
    };
    
    const scores = features.compositeScores!;
    
    return (
      scores.technical_health_score * weights.technical +
      scores.content_quality_score * weights.content +
      scores.authority_score * weights.authority +
      scores.engagement_score * weights.engagement +
      scores.onpage_optimization_score * weights.onpage
    );
  }
}