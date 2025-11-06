/**
 * Phased Feature Collection System
 * Implements progressive feature collection across 3 phases:
 * - Phase 1 (MVP): 50 features ($0-100/month)
 * - Phase 2 (Production): 100 features ($500-1000/month)
 * - Phase 3 (Enterprise): 194 features ($2000+/month)
 */

import { MVPFeatureCollector } from './MVPFeatureCollector';
import { SEODataCollector } from './SEODataCollector';
import { 
  CompleteSEOFeatureRecord,
  OnPageSEOComplete,
  TechnicalSEOComplete,
  CoreWebVitalsComplete,
  OffPageAuthorityComplete,
  UserEngagementComplete,
  ContentQualityComplete,
  TemporalTrendComplete,
  InteractionFeaturesComplete,
  CompositeScoresComplete,
  SEOFeatureCalculator
} from '@/types/complete-seo-schema';
import { Pool } from 'pg';
import axios from 'axios';
import * as cheerio from 'cheerio';

export type CollectionPhase = 'mvp' | 'phase1' | 'phase2' | 'phase3';

export interface PhasedCollectorConfig {
  phase: CollectionPhase;
  
  // Free APIs
  pageSpeedApiKey: string;
  searchConsoleAuth?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  
  // Commercial APIs (Phase 2+)
  mozApiAuth?: {
    accessId: string;
    secretKey: string;
  };
  ahrefsApiToken?: string;
  semrushApiKey?: string;
  majesticApiKey?: string;
  
  // Database
  dbPool: Pool;
  
  // Collection settings
  batchSize?: number;
  retryAttempts?: number;
  rateLimits?: {
    pageSpeed?: number; // requests per second
    searchConsole?: number;
    moz?: number;
    ahrefs?: number;
  };
}

export interface CollectionCostEstimate {
  phase: CollectionPhase;
  monthlyApiCost: number;
  featuresCollected: number;
  apisUsed: string[];
  costBreakdown: {
    api: string;
    cost: number;
    features: number;
  }[];
}

export class PhasedFeatureCollector {
  private config: PhasedCollectorConfig;
  private mvpCollector: MVPFeatureCollector;
  private seoDataCollector: SEODataCollector;

  constructor(config: PhasedCollectorConfig) {
    this.config = config;
    
    // Initialize MVP collector (always available)
    this.mvpCollector = new MVPFeatureCollector({
      pageSpeedApiKey: config.pageSpeedApiKey,
      searchConsoleAuth: config.searchConsoleAuth
    });

    // Initialize full data collector if needed
    if (config.phase !== 'mvp') {
      this.seoDataCollector = new SEODataCollector({
        googleSearchConsoleAuth: config.searchConsoleAuth!,
        pageSpeedApiKey: config.pageSpeedApiKey,
        ahrefsApiToken: config.ahrefsApiToken,
        semrushApiKey: config.semrushApiKey,
        crawlUserAgent: 'SEO-Bot/2.0',
        crawlDelay: 1000
      });
    }
  }

  /**
   * Get cost estimate for current phase
   */
  getCostEstimate(): CollectionCostEstimate {
    const estimates: { [key in CollectionPhase]: CollectionCostEstimate } = {
      mvp: {
        phase: 'mvp',
        monthlyApiCost: 0,
        featuresCollected: 20,
        apisUsed: ['PageSpeed API (Free)', 'Web Scraping (Free)', 'Search Console (Free)'],
        costBreakdown: [
          { api: 'PageSpeed API', cost: 0, features: 3 },
          { api: 'Web Scraping', cost: 0, features: 8 },
          { api: 'Search Console', cost: 0, features: 4 },
          { api: 'Derived Features', cost: 0, features: 5 }
        ]
      },
      phase1: {
        phase: 'phase1',
        monthlyApiCost: 99,
        featuresCollected: 50,
        apisUsed: ['PageSpeed API', 'Search Console', 'Web Scraping', 'Moz API'],
        costBreakdown: [
          { api: 'PageSpeed API', cost: 0, features: 9 },
          { api: 'Search Console', cost: 0, features: 8 },
          { api: 'Web Scraping', cost: 0, features: 20 },
          { api: 'Moz API', cost: 99, features: 5 },
          { api: 'Derived Features', cost: 0, features: 8 }
        ]
      },
      phase2: {
        phase: 'phase2',
        monthlyApiCost: 799,
        featuresCollected: 100,
        apisUsed: ['All Phase 1', 'Ahrefs API', 'SEMrush API'],
        costBreakdown: [
          { api: 'Free APIs', cost: 0, features: 40 },
          { api: 'Moz API', cost: 99, features: 10 },
          { api: 'Ahrefs API', cost: 500, features: 25 },
          { api: 'SEMrush API', cost: 200, features: 15 },
          { api: 'Derived Features', cost: 0, features: 10 }
        ]
      },
      phase3: {
        phase: 'phase3',
        monthlyApiCost: 2499,
        featuresCollected: 194,
        apisUsed: ['All Phase 2', 'Majestic API', 'Social APIs', 'Advanced Analytics'],
        costBreakdown: [
          { api: 'Free APIs', cost: 0, features: 50 },
          { api: 'Moz API', cost: 599, features: 15 },
          { api: 'Ahrefs API', cost: 1000, features: 40 },
          { api: 'SEMrush API', cost: 500, features: 30 },
          { api: 'Majestic API', cost: 400, features: 10 },
          { api: 'Social APIs', cost: 0, features: 5 },
          { api: 'Interaction Features', cost: 0, features: 12 },
          { api: 'Temporal Features', cost: 0, features: 15 },
          { api: 'Composite Scores', cost: 0, features: 17 }
        ]
      }
    };

    return estimates[this.config.phase];
  }

  /**
   * Collect features based on current phase
   */
  async collectFeatures(url: string, keyword: string): Promise<Partial<CompleteSEOFeatureRecord>> {
    console.log(`\n🎯 Collecting ${this.config.phase.toUpperCase()} features for: ${url}`);
    
    switch (this.config.phase) {
      case 'mvp':
        return this.collectMVPFeatures(url, keyword);
      case 'phase1':
        return this.collectPhase1Features(url, keyword);
      case 'phase2':
        return this.collectPhase2Features(url, keyword);
      case 'phase3':
        return this.collectPhase3Features(url, keyword);
      default:
        throw new Error(`Unknown phase: ${this.config.phase}`);
    }
  }

  /**
   * MVP Collection (20 features) - $0/month
   */
  private async collectMVPFeatures(url: string, keyword: string): Promise<Partial<CompleteSEOFeatureRecord>> {
    const mvpData = await this.mvpCollector.collectMVPFeatures(url, keyword);
    
    // Map MVP features to complete schema
    const record: Partial<CompleteSEOFeatureRecord> = {
      url,
      query: keyword,
      collected_at: new Date(),
      
      onPage: {
        title_length: mvpData.title_length,
        title_optimal_length: mvpData.title_optimal,
        meta_desc_length: mvpData.meta_desc_length,
        h1_count: mvpData.h1_count,
        h2_count: mvpData.h2_count,
        url_depth: mvpData.url_depth,
        word_count: mvpData.word_count,
        // ... partial data
      } as Partial<OnPageSEOComplete>,
      
      coreWebVitals: {
        lcp_ms: mvpData.lcp_ms,
        lcp_good: mvpData.lcp_ms <= 2500,
        inp_ms: mvpData.inp_ms,
        inp_good: mvpData.inp_ms <= 200,
        cls_score: mvpData.cls_score,
        cls_good: mvpData.cls_score <= 0.1,
        // ... partial data
      } as Partial<CoreWebVitalsComplete>,
      
      userEngagement: {
        clicks: mvpData.clicks,
        impressions: mvpData.impressions,
        ctr: mvpData.ctr,
        average_position: mvpData.position,
        // ... partial data
      } as Partial<UserEngagementComplete>,
      
      contentQuality: {
        image_count: mvpData.image_count,
        word_count: mvpData.word_count,
        // ... partial data
      } as Partial<ContentQualityComplete>,
      
      compositeScores: {
        cwv_composite_score: mvpData.cwv_composite,
        content_quality_score: mvpData.content_quality,
        technical_health_score: mvpData.technical_health,
        overall_seo_score: mvpData.overall_seo_score,
        // ... partial data
      } as Partial<CompositeScoresComplete>
    };

    await this.saveToDatabase(record, 'mvp');
    return record;
  }

  /**
   * Phase 1 Collection (50 features) - $99/month
   */
  private async collectPhase1Features(url: string, keyword: string): Promise<Partial<CompleteSEOFeatureRecord>> {
    // Start with MVP features
    const record = await this.collectMVPFeatures(url, keyword);
    
    // Add Phase 1 specific features
    const [onPageExtended, authorityBasic] = await Promise.all([
      this.collectExtendedOnPageFeatures(url, keyword),
      this.collectBasicAuthorityFeatures(url)
    ]);

    // Merge additional features
    record.onPage = { ...record.onPage, ...onPageExtended };
    record.offPageAuthority = authorityBasic;
    
    // Calculate Phase 1 composite scores
    record.compositeScores = {
      ...record.compositeScores,
      authority_score: this.calculateAuthorityScore(authorityBasic),
      onpage_optimization_score: this.calculateOnPageScore(record.onPage!)
    } as CompositeScoresComplete;

    await this.saveToDatabase(record, 'phase1');
    return record;
  }

  /**
   * Phase 2 Collection (100 features) - $799/month
   */
  private async collectPhase2Features(url: string, keyword: string): Promise<Partial<CompleteSEOFeatureRecord>> {
    // Start with Phase 1 features
    const record = await this.collectPhase1Features(url, keyword);
    
    // Add Phase 2 specific features
    const [
      backlinkProfile,
      userEngagementFull,
      temporalFeatures
    ] = await Promise.all([
      this.collectBacklinkProfile(url),
      this.collectFullEngagementMetrics(url),
      this.collectTemporalFeatures(url)
    ]);

    // Merge additional features
    record.offPageAuthority = { ...record.offPageAuthority, ...backlinkProfile };
    record.userEngagement = { ...record.userEngagement, ...userEngagementFull };
    record.temporalTrend = temporalFeatures;
    
    await this.saveToDatabase(record, 'phase2');
    return record;
  }

  /**
   * Phase 3 Collection (194 features) - $2499/month
   */
  private async collectPhase3Features(url: string, keyword: string): Promise<CompleteSEOFeatureRecord> {
    // Start with Phase 2 features
    const record = await this.collectPhase2Features(url, keyword) as CompleteSEOFeatureRecord;
    
    // Add Phase 3 specific features
    const [
      socialSignals,
      semanticFeatures,
      interactionFeatures
    ] = await Promise.all([
      this.collectSocialSignals(url),
      this.collectSemanticFeatures(url, keyword),
      this.calculateAllInteractionFeatures(record)
    ]);

    // Complete all remaining features
    record.offPageAuthority = { ...record.offPageAuthority, ...socialSignals } as OffPageAuthorityComplete;
    record.contentQuality = { ...record.contentQuality, ...semanticFeatures } as ContentQualityComplete;
    record.interactionFeatures = interactionFeatures;
    
    // Calculate final composite scores
    record.compositeScores = this.calculateAllCompositeScores(record);
    
    await this.saveToDatabase(record, 'phase3');
    return record;
  }

  /**
   * Helper: Collect extended on-page features
   */
  private async collectExtendedOnPageFeatures(url: string, keyword: string): Promise<Partial<OnPageSEOComplete>> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('title').text();
    const h1Text = $('h1').first().text();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    
    // Calculate keyword features
    const keywordLower = keyword.toLowerCase();
    const titleLower = title.toLowerCase();
    const h1Lower = h1Text.toLowerCase();
    
    return {
      title_text: title,
      title_word_count: title.split(/\s+/).length,
      title_has_keyword: titleLower.includes(keywordLower),
      title_keyword_position: titleLower.indexOf(keywordLower),
      
      meta_description: metaDesc,
      meta_desc_optimal: metaDesc.length >= 150 && metaDesc.length <= 160,
      meta_desc_has_keyword: metaDesc.toLowerCase().includes(keywordLower),
      meta_desc_has_cta: /learn|discover|find|get|shop|buy|read|click|visit/i.test(metaDesc),
      
      h1_text: h1Text,
      h1_length: h1Text.length,
      h1_has_keyword: h1Lower.includes(keywordLower),
      h3_count: $('h3').length,
      h4_count: $('h4').length,
      h5_count: $('h5').length,
      h6_count: $('h6').length,
      
      url_full: url,
      url_length: url.length,
      url_has_keyword: url.toLowerCase().includes(keywordLower),
      url_has_numbers: /\d/.test(url),
      url_has_special_chars: (url.match(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]/g) || []).length,
      url_slug_length: url.split('/').pop()?.length || 0,
      url_is_https: url.startsWith('https://'),
      
      keyword_density: this.calculateKeywordDensity($('body').text(), keyword),
      keyword_in_first_100_words: this.isKeywordInFirst100Words($('body').text(), keyword),
      keyword_in_url: url.toLowerCase().includes(keywordLower),
      keyword_in_h1: h1Lower.includes(keywordLower),
      keyword_in_h2: $('h2').toArray().some(el => $(el).text().toLowerCase().includes(keywordLower)),
      keyword_in_meta: metaDesc.toLowerCase().includes(keywordLower),
      keyword_exact_match_count: (($('body').text().toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length)
    };
  }

  /**
   * Helper: Collect basic authority features (Moz API)
   */
  private async collectBasicAuthorityFeatures(url: string): Promise<Partial<OffPageAuthorityComplete>> {
    // Mock implementation - replace with actual Moz API call
    const domain = new URL(url).hostname;
    
    return {
      domain_authority: 45 + Math.floor(Math.random() * 30),
      page_authority: 40 + Math.floor(Math.random() * 25),
      spam_score: Math.floor(Math.random() * 30),
      total_backlinks: 100 + Math.floor(Math.random() * 5000),
      referring_domains: 10 + Math.floor(Math.random() * 200)
    };
  }

  /**
   * Helper: Collect backlink profile (Ahrefs API)
   */
  private async collectBacklinkProfile(url: string): Promise<Partial<OffPageAuthorityComplete>> {
    // Mock implementation - replace with actual Ahrefs API call
    const totalBacklinks = 500 + Math.floor(Math.random() * 10000);
    const dofollow = Math.floor(totalBacklinks * 0.7);
    
    return {
      total_backlinks: totalBacklinks,
      dofollow_backlinks: dofollow,
      nofollow_backlinks: totalBacklinks - dofollow,
      dofollow_ratio: dofollow / totalBacklinks,
      avg_domain_rating: 30 + Math.random() * 40,
      avg_url_rating: 25 + Math.random() * 35,
      backlink_velocity_30d: Math.floor(Math.random() * 100),
      lost_backlinks_30d: Math.floor(Math.random() * 20),
      broken_backlinks: Math.floor(Math.random() * 10),
      redirect_backlinks: Math.floor(Math.random() * 5),
      edu_backlinks: Math.floor(Math.random() * 3),
      
      exact_match_anchors: Math.floor(Math.random() * 50),
      partial_match_anchors: Math.floor(Math.random() * 100),
      branded_anchors: Math.floor(Math.random() * 200),
      generic_anchors: Math.floor(Math.random() * 150),
      naked_url_anchors: Math.floor(Math.random() * 100),
      image_anchors: Math.floor(Math.random() * 50),
      anchor_text_diversity: 0.6 + Math.random() * 0.3,
      exact_match_ratio: 0.05 + Math.random() * 0.1
    };
  }

  /**
   * Helper: Collect full engagement metrics
   */
  private async collectFullEngagementMetrics(url: string): Promise<Partial<UserEngagementComplete>> {
    // Mock implementation - replace with actual GA4 API call
    return {
      pageviews: 1000 + Math.floor(Math.random() * 10000),
      unique_pageviews: 800 + Math.floor(Math.random() * 8000),
      avg_time_on_page: 60 + Math.random() * 180,
      bounce_rate: 20 + Math.random() * 60,
      exit_rate: 15 + Math.random() * 50,
      pages_per_session: 1.5 + Math.random() * 3,
      engagement_rate: 40 + Math.random() * 40,
      scroll_depth_avg: 30 + Math.random() * 60,
      conversion_rate: Math.random() * 5,
      revenue_per_pageview: Math.random() * 10,
      
      expected_ctr: 0.05,
      ctr_vs_expected: 0.8 + Math.random() * 0.4,
      ctr_performance_category: 'average',
      position_1_3_impressions: Math.floor(Math.random() * 1000),
      position_4_10_impressions: Math.floor(Math.random() * 2000),
      featured_snippet_impressions: Math.floor(Math.random() * 500)
    };
  }

  /**
   * Helper: Collect temporal features
   */
  private async collectTemporalFeatures(url: string): Promise<TemporalTrendComplete> {
    // This would normally query historical data
    const now = new Date();
    
    return {
      clicks_7d_avg: 50 + Math.random() * 100,
      clicks_30d_avg: 45 + Math.random() * 90,
      position_7d_avg: 8 + Math.random() * 5,
      position_30d_avg: 9 + Math.random() * 5,
      ctr_7d_avg: 0.03 + Math.random() * 0.05,
      ctr_30d_avg: 0.035 + Math.random() * 0.04,
      
      clicks_trend_7d: -10 + Math.random() * 20,
      position_trend_7d: -2 + Math.random() * 4,
      clicks_trend_30d: -15 + Math.random() * 30,
      position_trend_30d: -3 + Math.random() * 6,
      traffic_momentum: -5 + Math.random() * 10,
      ranking_momentum: -2 + Math.random() * 4,
      
      day_of_week: now.getDay(),
      month: now.getMonth() + 1,
      is_weekend: now.getDay() === 0 || now.getDay() === 6
    };
  }

  /**
   * Helper: Collect social signals
   */
  private async collectSocialSignals(url: string): Promise<Partial<OffPageAuthorityComplete>> {
    // Mock implementation - would use social APIs
    return {
      facebook_shares: Math.floor(Math.random() * 1000),
      twitter_shares: Math.floor(Math.random() * 500),
      linkedin_shares: Math.floor(Math.random() * 200),
      pinterest_pins: Math.floor(Math.random() * 100),
      reddit_mentions: Math.floor(Math.random() * 50)
    };
  }

  /**
   * Helper: Collect semantic features
   */
  private async collectSemanticFeatures(url: string, keyword: string): Promise<Partial<ContentQualityComplete>> {
    // This would use NLP libraries
    return {
      lsi_keyword_count: 5 + Math.floor(Math.random() * 20),
      entity_count: 10 + Math.floor(Math.random() * 50),
      entity_density: 5 + Math.random() * 15,
      content_depth_score: 0.5 + Math.random() * 0.5,
      
      paragraph_count: 10 + Math.floor(Math.random() * 30),
      sentence_count: 50 + Math.floor(Math.random() * 150),
      avg_sentence_length: 10 + Math.random() * 10,
      avg_paragraph_length: 50 + Math.random() * 50,
      reading_time_minutes: 2 + Math.random() * 8,
      flesch_reading_ease: 30 + Math.random() * 40,
      flesch_kincaid_grade: 8 + Math.random() * 4,
      
      images_with_alt: Math.floor(Math.random() * 10),
      images_without_alt: Math.floor(Math.random() * 5),
      video_count: Math.floor(Math.random() * 3),
      infographic_count: Math.floor(Math.random() * 2),
      image_alt_optimization_rate: 0.5 + Math.random() * 0.5,
      
      published_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      last_modified_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      content_age_days: Math.floor(Math.random() * 365),
      days_since_update: Math.floor(Math.random() * 30)
    };
  }

  /**
   * Helper: Calculate all interaction features
   */
  private async calculateAllInteractionFeatures(record: CompleteSEOFeatureRecord): Promise<InteractionFeaturesComplete> {
    const c = record.compositeScores;
    const o = record.offPageAuthority;
    const e = record.userEngagement;
    const t = record.technical;
    const q = record.contentQuality;
    
    return {
      content_quality_authority_interaction: c.content_quality_score * o.domain_authority,
      technical_authority_interaction: c.technical_health_score * o.domain_rating,
      engagement_position_interaction: e.ctr * (1 / (e.average_position + 1)),
      time_position_interaction: e.avg_time_on_page * (1 / (e.average_position + 1)),
      technical_content_interaction: c.cwv_composite_score * Math.log(q.word_count + 1),
      speed_content_interaction: (record.coreWebVitals.lcp_score || 0.5) * c.content_quality_score,
      mobile_speed_interaction: 0.5 * (record.coreWebVitals.lcp_score || 0.5), // Simplified
      mobile_usability_interaction: (t.is_mobile_friendly ? 1 : 0) * (t.mobile_page_speed_score / 100),
      backlinks_quality_interaction: o.referring_domains * q.content_depth_score,
      authority_freshness_interaction: o.domain_authority * (1 / (q.content_age_days + 1)),
      ctr_quality_interaction: e.ctr_vs_expected * c.content_quality_score,
      engagement_quality_interaction: e.engagement_rate * c.onpage_optimization_score
    };
  }

  /**
   * Helper: Calculate all composite scores
   */
  private calculateAllCompositeScores(record: CompleteSEOFeatureRecord): CompositeScoresComplete {
    return {
      technical_health_score: SEOFeatureCalculator.calculateTechnicalHealthScore(
        record.coreWebVitals,
        record.technical
      ),
      onpage_optimization_score: this.calculateOnPageScore(record.onPage),
      content_quality_score: SEOFeatureCalculator.calculateContentQualityScore(record.contentQuality),
      authority_score: this.calculateAuthorityScore(record.offPageAuthority),
      engagement_score: this.calculateEngagementScore(record.userEngagement),
      cwv_composite_score: this.calculateCWVComposite(record.coreWebVitals),
      overall_seo_score: SEOFeatureCalculator.calculateOverallSEOScore(record),
      ranking_potential_score: this.calculateRankingPotential(record)
    };
  }

  // Score calculation helpers
  private calculateOnPageScore(onPage: Partial<OnPageSEOComplete>): number {
    let score = 0;
    if (onPage.title_optimal_length) score += 0.2;
    if (onPage.title_has_keyword) score += 0.2;
    if (onPage.h1_has_keyword) score += 0.2;
    if (onPage.meta_desc_optimal) score += 0.1;
    if (onPage.url_is_https) score += 0.1;
    if (onPage.keyword_density && onPage.keyword_density >= 1 && onPage.keyword_density <= 3) score += 0.2;
    return Math.min(score, 1);
  }

  private calculateAuthorityScore(authority: Partial<OffPageAuthorityComplete>): number {
    if (!authority.domain_authority) return 0;
    const da = (authority.domain_authority || 0) / 100;
    const dr = (authority.domain_rating || 0) / 100;
    const tf = (authority.trust_flow || 0) / 100;
    return (da + dr + tf) / 3;
  }

  private calculateEngagementScore(engagement: Partial<UserEngagementComplete>): number {
    const ctrScore = Math.min((engagement.ctr || 0) * 10, 1) * 0.3;
    const bounceScore = (1 - (engagement.bounce_rate || 100) / 100) * 0.3;
    const timeScore = Math.min((engagement.avg_time_on_page || 0) / 180, 1) * 0.2;
    const engagementRate = (engagement.engagement_rate || 0) / 100 * 0.2;
    return ctrScore + bounceScore + timeScore + engagementRate;
  }

  private calculateCWVComposite(cwv: Partial<CoreWebVitalsComplete>): number {
    const lcpScore = cwv.lcp_good ? 0.35 : cwv.lcp_needs_improvement ? 0.17 : 0;
    const inpScore = cwv.inp_good ? 0.35 : cwv.inp_needs_improvement ? 0.17 : 0;
    const clsScore = cwv.cls_good ? 0.30 : cwv.cls_needs_improvement ? 0.15 : 0;
    return lcpScore + inpScore + clsScore;
  }

  private calculateRankingPotential(record: CompleteSEOFeatureRecord): number {
    // Complex calculation based on current position and quality
    const position = record.userEngagement.average_position;
    const quality = record.compositeScores.overall_seo_score;
    
    if (position <= 3) return quality * 0.3; // Already ranking well
    if (position <= 10) return quality * 0.6; // Good potential
    if (position <= 20) return quality * 0.8; // High potential
    return quality; // Maximum potential for low rankings
  }

  private calculateKeywordDensity(text: string, keyword: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(w => w === keyword.toLowerCase()).length;
    return (keywordCount / words.length) * 100;
  }

  private isKeywordInFirst100Words(text: string, keyword: string): boolean {
    const first100 = text.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    return first100.includes(keyword.toLowerCase());
  }

  /**
   * Save features to database
   */
  private async saveToDatabase(record: Partial<CompleteSEOFeatureRecord>, phase: string): Promise<void> {
    try {
      const query = `
        INSERT INTO seo_features.complete_features (
          url, query, collection_phase,
          title_length, meta_desc_length, word_count,
          lcp_ms, inp_ms, cls_score,
          clicks, impressions, ctr, average_position,
          overall_seo_score, technical_health_score,
          content_quality_score, cwv_composite_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `;

      const values = [
        record.url,
        record.query,
        phase,
        record.onPage?.title_length || 0,
        record.onPage?.meta_desc_length || 0,
        record.contentQuality?.word_count || 0,
        record.coreWebVitals?.lcp_ms || 0,
        record.coreWebVitals?.inp_ms || 0,
        record.coreWebVitals?.cls_score || 0,
        record.userEngagement?.clicks || 0,
        record.userEngagement?.impressions || 0,
        record.userEngagement?.ctr || 0,
        record.userEngagement?.average_position || 0,
        record.compositeScores?.overall_seo_score || 0,
        record.compositeScores?.technical_health_score || 0,
        record.compositeScores?.content_quality_score || 0,
        record.compositeScores?.cwv_composite_score || 0
      ];

      await this.config.dbPool.query(query, values);
      console.log(`✅ Saved ${phase} features to database`);
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  /**
   * Generate collection report
   */
  generateReport(features: Partial<CompleteSEOFeatureRecord>): string {
    const phase = this.config.phase;
    const cost = this.getCostEstimate();
    
    let report = `
📊 SEO Feature Collection Report
================================
Phase: ${phase.toUpperCase()}
URL: ${features.url}
Keyword: ${features.query}
Collection Time: ${features.collected_at}

💰 Cost Analysis
----------------
Monthly API Cost: $${cost.monthlyApiCost}
Features Collected: ${cost.featuresCollected}
Cost per Feature: $${(cost.monthlyApiCost / cost.featuresCollected).toFixed(2)}

📈 Key Metrics
--------------
Overall SEO Score: ${((features.compositeScores?.overall_seo_score || 0) * 100).toFixed(1)}%
Current Position: #${features.userEngagement?.average_position || 'N/A'}
Technical Health: ${((features.compositeScores?.technical_health_score || 0) * 100).toFixed(1)}%
Content Quality: ${((features.compositeScores?.content_quality_score || 0) * 100).toFixed(1)}%
`;

    if (phase === 'phase2' || phase === 'phase3') {
      report += `
Authority Score: ${((features.compositeScores?.authority_score || 0) * 100).toFixed(1)}%
Backlinks: ${features.offPageAuthority?.total_backlinks || 'N/A'}
Referring Domains: ${features.offPageAuthority?.referring_domains || 'N/A'}
`;
    }

    report += `
🎯 Next Steps
-------------
`;

    if (phase === 'mvp') {
      report += `• Upgrade to Phase 1 ($99/mo) for authority metrics and extended features
• Current coverage: Basic SEO signals only`;
    } else if (phase === 'phase1') {
      report += `• Upgrade to Phase 2 ($799/mo) for full backlink analysis and engagement metrics
• Current coverage: 50 essential features`;
    } else if (phase === 'phase2') {
      report += `• Upgrade to Phase 3 ($2499/mo) for interaction features and advanced analytics
• Current coverage: 100 production features`;
    } else {
      report += `• Full enterprise coverage active (194 features)
• Consider custom ML model training with collected data`;
    }

    return report;
  }
}