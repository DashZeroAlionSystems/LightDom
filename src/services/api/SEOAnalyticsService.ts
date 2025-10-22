/**
 * SEO Analytics Service
 *
 * Collects and processes SEO analytics data including:
 * - Core Web Vitals
 * - User behavior metrics
 * - Performance data
 * - SEO scores
 */

import { createClient } from 'redis';
import type { PoolClient } from 'pg';

interface CoreWebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
}

interface UserBehavior {
  timeOnPage: number;
  scrollDepth: number;
  interactions: number;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
}

interface AnalyticsData {
  url: string;
  pageTitle: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
  coreWebVitals: CoreWebVitals;
  userBehavior: UserBehavior;
  performance: PerformanceMetrics;
}

interface SEOScore {
  overall: number;
  technical: number;
  content: number;
  performance: number;
  userExperience: number;
}

interface DashboardData {
  seoScore: SEOScore;
  coreWebVitals: CoreWebVitals & { timestamp: number }[];
  topPages: Array<{ url: string; views: number; avgScore: number }>;
  trafficSources: Array<{ source: string; visits: number; percentage: number }>;
  keywordRankings: Array<{ keyword: string; position: number; change: number }>;
  recentOptimizations: Array<{ url: string; optimization: string; impact: number; timestamp: number }>;
}

export class SEOAnalyticsService {
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
      console.log('SEO Analytics Service: Redis connected');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  /**
   * Process incoming analytics data from SDK
   */
  async processAnalyticsData(apiKey: string, data: AnalyticsData): Promise<void> {
    try {
      // Get client ID from API key
      const client = await this.getClientByApiKey(apiKey);
      if (!client) {
        throw new Error('Invalid API key');
      }

      // Calculate SEO score
      const seoScore = this.calculateSEOScore(data);

      // Store analytics data in database
      await this.pgPool.query(
        `INSERT INTO seo_analytics
         (client_id, url, page_title, meta_description, core_web_vitals, seo_score,
          user_behavior, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          client.id,
          data.url,
          data.pageTitle,
          null, // meta_description to be extracted separately
          JSON.stringify(data.coreWebVitals),
          seoScore.overall,
          JSON.stringify(data.userBehavior),
          new Date(data.timestamp)
        ]
      );

      // Update real-time metrics in Redis
      await this.updateRealTimeMetrics(client.id, data, seoScore);

      // Update page view count
      await this.updatePageViewCount(client.id);

      // Check for alerts
      await this.checkForAlerts(client.id, data, seoScore);

      console.log(`Analytics processed for client ${client.id}, URL: ${data.url}`);
    } catch (error) {
      console.error('Error processing analytics data:', error);
      throw error;
    }
  }

  /**
   * Calculate SEO score based on various metrics
   */
  private calculateSEOScore(data: AnalyticsData): SEOScore {
    // Performance score (based on Core Web Vitals)
    let performanceScore = 100;

    if (data.coreWebVitals.lcp) {
      if (data.coreWebVitals.lcp > 4000) performanceScore -= 30;
      else if (data.coreWebVitals.lcp > 2500) performanceScore -= 15;
    }

    if (data.coreWebVitals.inp) {
      if (data.coreWebVitals.inp > 500) performanceScore -= 20;
      else if (data.coreWebVitals.inp > 200) performanceScore -= 10;
    }

    if (data.coreWebVitals.cls) {
      if (data.coreWebVitals.cls > 0.25) performanceScore -= 20;
      else if (data.coreWebVitals.cls > 0.1) performanceScore -= 10;
    }

    if (data.coreWebVitals.ttfb) {
      if (data.coreWebVitals.ttfb > 1800) performanceScore -= 15;
      else if (data.coreWebVitals.ttfb > 800) performanceScore -= 7;
    }

    // User Experience score (based on user behavior)
    let uxScore = 100;

    if (data.userBehavior.timeOnPage < 10000) uxScore -= 20; // Less than 10s
    if (data.userBehavior.scrollDepth < 25) uxScore -= 15; // Less than 25% scroll
    if (data.userBehavior.interactions < 1) uxScore -= 10; // No interactions

    // Technical score (placeholder - would check for proper HTML, meta tags, etc.)
    const technicalScore = 85;

    // Content score (placeholder - would analyze content quality)
    const contentScore = 80;

    // Calculate overall score
    const overall = Math.round(
      (performanceScore * 0.35 + uxScore * 0.25 + technicalScore * 0.25 + contentScore * 0.15)
    );

    return {
      overall: Math.max(0, Math.min(100, overall)),
      technical: technicalScore,
      content: contentScore,
      performance: Math.max(0, performanceScore),
      userExperience: Math.max(0, uxScore)
    };
  }

  /**
   * Update real-time metrics in Redis
   */
  private async updateRealTimeMetrics(clientId: string, data: AnalyticsData, seoScore: SEOScore): Promise<void> {
    try {
      if (!this.redisClient) return;

      const key = `seo:metrics:${clientId}:realtime`;

      // Store latest metrics (expires after 1 hour)
      await this.redisClient.setEx(
        key,
        3600,
        JSON.stringify({
          latestScore: seoScore,
          latestCoreWebVitals: data.coreWebVitals,
          lastUpdated: Date.now()
        })
      );

      // Increment page views counter
      await this.redisClient.incr(`seo:pageviews:${clientId}:${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
    }
  }

  /**
   * Update monthly page view count
   */
  private async updatePageViewCount(clientId: string): Promise<void> {
    try {
      await this.pgPool.query(
        `UPDATE seo_clients
         SET monthly_page_views = monthly_page_views + 1,
             updated_at = NOW()
         WHERE id = $1`,
        [clientId]
      );
    } catch (error) {
      console.error('Error updating page view count:', error);
    }
  }

  /**
   * Check for alerts based on thresholds
   */
  private async checkForAlerts(clientId: string, data: AnalyticsData, seoScore: SEOScore): Promise<void> {
    try {
      const alerts: string[] = [];

      // Check SEO score drop
      if (seoScore.overall < 60) {
        alerts.push('SEO score dropped below 60');
      }

      // Check Core Web Vitals
      if (data.coreWebVitals.lcp && data.coreWebVitals.lcp > 4000) {
        alerts.push('LCP exceeds 4 seconds (poor)');
      }

      if (data.coreWebVitals.cls && data.coreWebVitals.cls > 0.25) {
        alerts.push('CLS exceeds 0.25 (poor)');
      }

      if (data.coreWebVitals.inp && data.coreWebVitals.inp > 500) {
        alerts.push('INP exceeds 500ms (poor)');
      }

      // Store alerts if any
      if (alerts.length > 0) {
        await this.storeAlerts(clientId, data.url, alerts);
      }
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
  }

  /**
   * Store alerts
   */
  private async storeAlerts(clientId: string, url: string, alerts: string[]): Promise<void> {
    try {
      for (const alert of alerts) {
        await this.pgPool.query(
          `INSERT INTO seo_alerts (client_id, url, alert_type, message, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [clientId, url, 'performance', alert]
        );
      }
    } catch (error) {
      console.error('Error storing alerts:', error);
    }
  }

  /**
   * Get dashboard data for a client
   */
  async getDashboardData(clientId: string, timeRange: string = '7d'): Promise<DashboardData> {
    try {
      const days = this.parseTimeRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get average SEO scores
      const scoreResult = await this.pgPool.query(
        `SELECT
           AVG(seo_score) as overall,
           MAX(seo_score) as max_score,
           MIN(seo_score) as min_score
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2`,
        [clientId, startDate]
      );

      const seoScore: SEOScore = {
        overall: Math.round(scoreResult.rows[0]?.overall || 0),
        technical: 85, // Calculated separately
        content: 80,
        performance: Math.round(scoreResult.rows[0]?.overall || 0),
        userExperience: 85
      };

      // Get Core Web Vitals trends
      const vitalsResult = await this.pgPool.query(
        `SELECT
           core_web_vitals,
           DATE_TRUNC('hour', timestamp) as hour
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2
         ORDER BY hour DESC
         LIMIT 100`,
        [clientId, startDate]
      );

      const coreWebVitals = vitalsResult.rows.map((row: any) => ({
        ...row.core_web_vitals,
        timestamp: new Date(row.hour).getTime()
      }));

      // Get top pages
      const topPagesResult = await this.pgPool.query(
        `SELECT
           url,
           COUNT(*) as views,
           AVG(seo_score) as avg_score
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2
         GROUP BY url
         ORDER BY views DESC
         LIMIT 10`,
        [clientId, startDate]
      );

      const topPages = topPagesResult.rows.map((row: any) => ({
        url: row.url,
        views: parseInt(row.views),
        avgScore: Math.round(row.avg_score || 0)
      }));

      // Get traffic sources (mock data for now)
      const trafficSources = [
        { source: 'Organic Search', visits: 1200, percentage: 60 },
        { source: 'Direct', visits: 400, percentage: 20 },
        { source: 'Referral', visits: 300, percentage: 15 },
        { source: 'Social', visits: 100, percentage: 5 }
      ];

      // Get keyword rankings (mock data for now)
      const keywordRankings = [
        { keyword: 'main keyword', position: 5, change: 2 },
        { keyword: 'secondary keyword', position: 12, change: -1 },
        { keyword: 'brand keyword', position: 1, change: 0 }
      ];

      // Get recent optimizations
      const recentOptimizations = [
        {
          url: '/home',
          optimization: 'JSON-LD Schema Added',
          impact: 12,
          timestamp: Date.now() - 86400000
        },
        {
          url: '/products',
          optimization: 'Meta Tags Optimized',
          impact: 8,
          timestamp: Date.now() - 172800000
        }
      ];

      return {
        seoScore,
        coreWebVitals,
        topPages,
        trafficSources,
        keywordRankings,
        recentOptimizations
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Generate SEO report
   */
  async generateReport(clientId: string, timeRange: string = '30d'): Promise<any> {
    try {
      const dashboardData = await this.getDashboardData(clientId, timeRange);

      // Additional report calculations
      const days = this.parseTimeRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total page views
      const pageViewsResult = await this.pgPool.query(
        `SELECT COUNT(*) as total_views
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2`,
        [clientId, startDate]
      );

      // Get unique URLs
      const uniqueUrlsResult = await this.pgPool.query(
        `SELECT COUNT(DISTINCT url) as unique_urls
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2`,
        [clientId, startDate]
      );

      // Get average metrics
      const avgMetricsResult = await this.pgPool.query(
        `SELECT
           AVG((user_behavior->>'timeOnPage')::integer) as avg_time_on_page,
           AVG((user_behavior->>'scrollDepth')::numeric) as avg_scroll_depth,
           AVG((user_behavior->>'interactions')::integer) as avg_interactions
         FROM seo_analytics
         WHERE client_id = $1 AND timestamp >= $2`,
        [clientId, startDate]
      );

      return {
        summary: {
          totalPageViews: parseInt(pageViewsResult.rows[0].total_views),
          uniquePages: parseInt(uniqueUrlsResult.rows[0].unique_urls),
          averageSEOScore: dashboardData.seoScore.overall,
          reportPeriod: timeRange
        },
        seoScore: dashboardData.seoScore,
        coreWebVitals: {
          current: dashboardData.coreWebVitals[0] || {},
          trend: dashboardData.coreWebVitals
        },
        topPages: dashboardData.topPages,
        trafficSources: dashboardData.trafficSources,
        userEngagement: {
          avgTimeOnPage: Math.round(avgMetricsResult.rows[0].avg_time_on_page || 0),
          avgScrollDepth: Math.round(avgMetricsResult.rows[0].avg_scroll_depth || 0),
          avgInteractions: Math.round(avgMetricsResult.rows[0].avg_interactions || 0)
        },
        keywordRankings: dashboardData.keywordRankings,
        optimizations: dashboardData.recentOptimizations,
        recommendations: this.generateRecommendations(dashboardData)
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate AI recommendations based on analytics data
   */
  private generateRecommendations(data: DashboardData): string[] {
    const recommendations: string[] = [];

    if (data.seoScore.overall < 70) {
      recommendations.push('Overall SEO score needs improvement. Focus on technical optimization and content quality.');
    }

    if (data.seoScore.performance < 70) {
      recommendations.push('Improve Core Web Vitals by optimizing images, reducing JavaScript, and using a CDN.');
    }

    if (data.coreWebVitals.length > 0 && data.coreWebVitals[0].lcp && data.coreWebVitals[0].lcp > 2500) {
      recommendations.push('LCP is above threshold. Optimize largest contentful element (images, videos, or text blocks).');
    }

    if (data.coreWebVitals.length > 0 && data.coreWebVitals[0].cls && data.coreWebVitals[0].cls > 0.1) {
      recommendations.push('CLS needs improvement. Reserve space for dynamic content and use size attributes for media.');
    }

    if (data.topPages.length > 0 && data.topPages[0].avgScore < 70) {
      recommendations.push(`Top page "${data.topPages[0].url}" has low SEO score. Consider optimizing meta tags and content.`);
    }

    return recommendations;
  }

  /**
   * Parse time range string to number of days
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/(\d+)([dDwWmMyY])/);
    if (!match) return 7; // Default to 7 days

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        return value;
      case 'w':
        return value * 7;
      case 'm':
        return value * 30;
      case 'y':
        return value * 365;
      default:
        return 7;
    }
  }

  /**
   * Get client by API key
   */
  private async getClientByApiKey(apiKey: string): Promise<{ id: string } | null> {
    try {
      const result = await this.pgPool.query(
        'SELECT id FROM seo_clients WHERE api_key = $1 AND status = $2',
        [apiKey, 'active']
      );

      if (result.rows.length === 0) {
        return null;
      }

      return { id: result.rows[0].id };
    } catch (error) {
      console.error('Error getting client by API key:', error);
      return null;
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

export default SEOAnalyticsService;
