/**
 * Google Analytics 4 Integration Service
 * 
 * Real-time campaign monitoring with:
 * - GA4 Data API integration
 * - Change detection and workflow triggering
 * - Metric tracking and alerting
 * - Historical data analysis
 */

import { Pool } from 'pg';

export interface GA4Config {
  propertyId: string;
  credentials: any; // Service account JSON
  metrics: string[];
  dimensions: string[];
}

export interface GA4Metric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
}

export interface GA4Report {
  campaignId: string;
  timestamp: Date;
  metrics: GA4Metric[];
  dimensions: Record<string, string>;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  organicTraffic: number;
}

export interface ChangeDetection {
  metricName: string;
  oldValue: number;
  newValue: number;
  changePercent: number;
  threshold: number;
  exceeded: boolean;
  workflowTriggered?: string; // Workflow ID if triggered
}

export class GoogleAnalyticsIntegration {
  private db: Pool;
  private configs: Map<string, GA4Config> = new Map();
  private changeThresholds: Map<string, number> = new Map();

  constructor(db: Pool) {
    this.db = db;
    this.initializeDefaultThresholds();
  }

  /**
   * Configure GA4 for a campaign
   */
  async configureCampaign(campaignId: string, config: GA4Config) {
    this.configs.set(campaignId, config);

    await this.db.query(
      `INSERT INTO ga4_configs (campaign_id, property_id, credentials, metrics, dimensions)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (campaign_id) DO UPDATE SET
         property_id = $2, credentials = $3, metrics = $4, dimensions = $5`,
      [
        campaignId,
        config.propertyId,
        JSON.stringify(config.credentials),
        JSON.stringify(config.metrics),
        JSON.stringify(config.dimensions),
      ]
    );
  }

  /**
   * Collect real-time metrics from GA4
   */
  async collectMetrics(campaignId: string): Promise<GA4Report> {
    const config = this.configs.get(campaignId);
    if (!config) {
      throw new Error(`No GA4 config found for campaign: ${campaignId}`);
    }

    // Fetch data from GA4 API
    const data = await this.fetchGA4Data(config);

    // Get previous metrics for comparison
    const previousMetrics = await this.getPreviousMetrics(campaignId);

    // Build metrics with change detection
    const metrics: GA4Metric[] = [];
    for (const [name, value] of Object.entries(data.metrics)) {
      const prevValue = previousMetrics.get(name);
      const metric: GA4Metric = {
        name,
        value: value as number,
        timestamp: new Date(),
      };

      if (prevValue !== undefined) {
        metric.previousValue = prevValue;
        metric.change = (value as number) - prevValue;
        metric.changePercent = ((value as number) - prevValue) / prevValue * 100;
      }

      metrics.push(metric);
    }

    const report: GA4Report = {
      campaignId,
      timestamp: new Date(),
      metrics,
      dimensions: data.dimensions,
      pageViews: data.pageViews || 0,
      sessions: data.sessions || 0,
      bounceRate: data.bounceRate || 0,
      avgSessionDuration: data.avgSessionDuration || 0,
      conversions: data.conversions || 0,
      organicTraffic: data.organicTraffic || 0,
    };

    // Save report
    await this.saveReport(report);

    // Check for changes and trigger workflows
    await this.detectChangesAndTrigger(campaignId, metrics);

    return report;
  }

  /**
   * Fetch data from GA4 Data API
   */
  private async fetchGA4Data(config: GA4Config): Promise<any> {
    // In production, use @google-analytics/data package
    // For now, return mock data
    return {
      metrics: {
        pageViews: Math.floor(Math.random() * 10000),
        sessions: Math.floor(Math.random() * 5000),
        organicTraffic: Math.floor(Math.random() * 3000),
        conversions: Math.floor(Math.random() * 100),
      },
      dimensions: {
        source: 'google',
        medium: 'organic',
      },
      pageViews: Math.floor(Math.random() * 10000),
      sessions: Math.floor(Math.random() * 5000),
      bounceRate: Math.random() * 100,
      avgSessionDuration: Math.random() * 300,
      conversions: Math.floor(Math.random() * 100),
      organicTraffic: Math.floor(Math.random() * 3000),
    };
  }

  /**
   * Get previous metrics for comparison
   */
  private async getPreviousMetrics(campaignId: string): Promise<Map<string, number>> {
    const result = await this.db.query(
      `SELECT metrics FROM ga4_metrics 
       WHERE campaign_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [campaignId]
    );

    if (result.rows.length === 0) {
      return new Map();
    }

    const metricsData = JSON.parse(result.rows[0].metrics);
    return new Map(
      metricsData.map((m: GA4Metric) => [m.name, m.value])
    );
  }

  /**
   * Detect changes and trigger workflows if thresholds exceeded
   */
  private async detectChangesAndTrigger(
    campaignId: string,
    metrics: GA4Metric[]
  ): Promise<ChangeDetection[]> {
    const changes: ChangeDetection[] = [];

    for (const metric of metrics) {
      if (metric.changePercent !== undefined && metric.previousValue !== undefined) {
        const threshold = this.changeThresholds.get(metric.name) || 10;
        const exceeded = Math.abs(metric.changePercent) > threshold;

        const change: ChangeDetection = {
          metricName: metric.name,
          oldValue: metric.previousValue,
          newValue: metric.value,
          changePercent: metric.changePercent,
          threshold,
          exceeded,
        };

        if (exceeded) {
          // Trigger workflow
          const workflowId = await this.triggerChangeWorkflow(campaignId, change);
          change.workflowTriggered = workflowId;
        }

        changes.push(change);
      }
    }

    // Save change detections
    await this.saveChangeDetections(campaignId, changes);

    return changes;
  }

  /**
   * Trigger workflow when change threshold exceeded
   */
  private async triggerChangeWorkflow(
    campaignId: string,
    change: ChangeDetection
  ): Promise<string> {
    const workflowId = `workflow-change-${Date.now()}`;

    await this.db.query(
      `INSERT INTO workflow_executions 
       (id, workflow_id, campaign_id, status, context, triggered_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        `exec-${Date.now()}`,
        workflowId,
        campaignId,
        'pending',
        JSON.stringify({ change }),
        'ga4-change-detection',
      ]
    );

    return workflowId;
  }

  /**
   * Save GA4 report to database
   */
  private async saveReport(report: GA4Report) {
    await this.db.query(
      `INSERT INTO ga4_metrics 
       (campaign_id, timestamp, metrics, dimensions, page_views, sessions, bounce_rate, avg_session_duration, conversions, organic_traffic)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        report.campaignId,
        report.timestamp,
        JSON.stringify(report.metrics),
        JSON.stringify(report.dimensions),
        report.pageViews,
        report.sessions,
        report.bounceRate,
        report.avgSessionDuration,
        report.conversions,
        report.organicTraffic,
      ]
    );
  }

  /**
   * Save change detections
   */
  private async saveChangeDetections(
    campaignId: string,
    changes: ChangeDetection[]
  ) {
    for (const change of changes) {
      await this.db.query(
        `INSERT INTO ga4_change_detections 
         (campaign_id, metric_name, old_value, new_value, change_percent, threshold, exceeded, workflow_triggered, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          campaignId,
          change.metricName,
          change.oldValue,
          change.newValue,
          change.changePercent,
          change.threshold,
          change.exceeded,
          change.workflowTriggered,
        ]
      );
    }
  }

  /**
   * Initialize default change thresholds
   */
  private initializeDefaultThresholds() {
    this.changeThresholds.set('pageViews', 15);
    this.changeThresholds.set('sessions', 15);
    this.changeThresholds.set('organicTraffic', 20);
    this.changeThresholds.set('conversions', 25);
    this.changeThresholds.set('bounceRate', 10);
  }

  /**
   * Set change threshold for metric
   */
  setChangeThreshold(metricName: string, threshold: number) {
    this.changeThresholds.set(metricName, threshold);
  }

  /**
   * Start monitoring campaign
   */
  async startMonitoring(
    campaignId: string,
    intervalMinutes = 15
  ): Promise<NodeJS.Timeout> {
    const interval = setInterval(async () => {
      try {
        await this.collectMetrics(campaignId);
      } catch (error) {
        console.error(`Error collecting metrics for ${campaignId}:`, error);
      }
    }, intervalMinutes * 60 * 1000);

    return interval;
  }

  /**
   * Get historical data for campaign
   */
  async getHistoricalData(
    campaignId: string,
    days = 30
  ): Promise<GA4Report[]> {
    const result = await this.db.query(
      `SELECT * FROM ga4_metrics 
       WHERE campaign_id = $1 
       AND timestamp > NOW() - INTERVAL '${days} days'
       ORDER BY timestamp DESC`,
      [campaignId]
    );

    return result.rows.map((row) => ({
      campaignId: row.campaign_id,
      timestamp: row.timestamp,
      metrics: JSON.parse(row.metrics),
      dimensions: JSON.parse(row.dimensions),
      pageViews: row.page_views,
      sessions: row.sessions,
      bounceRate: row.bounce_rate,
      avgSessionDuration: row.avg_session_duration,
      conversions: row.conversions,
      organicTraffic: row.organic_traffic,
    }));
  }
}
