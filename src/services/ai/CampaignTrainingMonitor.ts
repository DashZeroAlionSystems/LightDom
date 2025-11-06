/**
 * Campaign Training Monitor Service
 * 
 * Monitors training data mining status across all client campaigns
 * Provides real-time status updates and health checks
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';

export interface CampaignTrainingStatus {
  campaignId: string;
  clientId: string;
  neuralNetworkId: string;
  dataCollectionStatus: 'active' | 'paused' | 'error' | 'completed';
  trainingStatus: 'not_started' | 'in_progress' | 'completed' | 'error';
  metrics: {
    totalSamples: number;
    lastCollectionTime: string;
    collectionRate: number; // samples per hour
    trainingAccuracy: number;
    trainingLoss: number;
    estimatedCompletion: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastHealthCheck: string;
  };
}

export interface ClientStatus {
  clientId: string;
  name: string;
  email: string;
  planType: string;
  campaigns: CampaignTrainingStatus[];
  totalCampaigns: number;
  activeCampaigns: number;
  totalSamples: number;
  avgAccuracy: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive: string;
}

export class CampaignTrainingMonitor extends EventEmitter {
  private dbPool: Pool;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private statusCache: Map<string, CampaignTrainingStatus> = new Map();
  private refreshInterval: number = 30000; // 30 seconds

  constructor(dbPool: Pool) {
    super();
    this.dbPool = dbPool;
  }

  /**
   * Start monitoring all campaigns
   */
  async startMonitoring(): Promise<void> {
    console.log('🔍 Starting campaign training monitor...');
    
    // Initial fetch
    await this.refreshAllStatuses();

    // Setup periodic refresh
    this.monitoringInterval = setInterval(async () => {
      await this.refreshAllStatuses();
    }, this.refreshInterval);

    console.log('✅ Campaign training monitor started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('⏸️  Campaign training monitor stopped');
  }

  /**
   * Refresh all campaign statuses
   */
  private async refreshAllStatuses(): Promise<void> {
    try {
      const campaigns = await this.fetchAllCampaigns();
      
      for (const campaign of campaigns) {
        const status = await this.getCampaignStatus(campaign.id);
        this.statusCache.set(campaign.id, status);
        
        // Emit events for status changes
        this.emit('status:update', status);
        
        // Check for issues
        if (status.health.status === 'critical') {
          this.emit('status:critical', status);
        } else if (status.health.status === 'warning') {
          this.emit('status:warning', status);
        }
      }
    } catch (error) {
      console.error('Error refreshing campaign statuses:', error);
      this.emit('error', error);
    }
  }

  /**
   * Fetch all campaigns from database
   */
  private async fetchAllCampaigns(): Promise<any[]> {
    const result = await this.dbPool.query(`
      SELECT id, client_id, neural_network_id, status, target_url
      FROM client_seo_campaigns
      WHERE status != 'archived'
      ORDER BY created_at DESC
    `);

    return result.rows;
  }

  /**
   * Get detailed status for a campaign
   */
  async getCampaignStatus(campaignId: string): Promise<CampaignTrainingStatus> {
    // Fetch campaign details
    const campaignResult = await this.dbPool.query(
      'SELECT * FROM client_seo_campaigns WHERE id = $1',
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const campaign = campaignResult.rows[0];

    // Fetch training data configuration
    const configResult = await this.dbPool.query(
      'SELECT * FROM training_data_configs WHERE neural_network_id = $1',
      [campaign.neural_network_id]
    );

    // Fetch neural network status
    const nnResult = await this.dbPool.query(
      'SELECT * FROM neural_network_instances WHERE id = $1',
      [campaign.neural_network_id]
    );

    // Fetch training samples stats
    const samplesResult = await this.dbPool.query(`
      SELECT 
        COUNT(*) as total_samples,
        MAX(created_at) as last_collection,
        AVG(quality_score) as avg_quality
      FROM training_samples
      WHERE neural_network_id = $1
    `, [campaign.neural_network_id]);

    const config = configResult.rows[0];
    const nn = nnResult.rows[0];
    const stats = samplesResult.rows[0];

    // Calculate collection rate (samples per hour in last 24h)
    const rateResult = await this.dbPool.query(`
      SELECT COUNT(*) as recent_samples
      FROM training_samples
      WHERE neural_network_id = $1
        AND created_at > NOW() - INTERVAL '24 hours'
    `, [campaign.neural_network_id]);

    const collectionRate = parseInt(rateResult.rows[0].recent_samples) / 24;

    // Determine health status
    const health = this.assessHealth(config, nn, stats, collectionRate);

    // Calculate estimated completion
    const estimatedCompletion = this.estimateCompletion(
      stats.total_samples,
      collectionRate,
      config?.source?.config?.maxSamples || 10000
    );

    return {
      campaignId: campaign.id,
      clientId: campaign.client_id,
      neuralNetworkId: campaign.neural_network_id,
      dataCollectionStatus: config?.status || 'paused',
      trainingStatus: nn?.status || 'not_started',
      metrics: {
        totalSamples: parseInt(stats.total_samples) || 0,
        lastCollectionTime: stats.last_collection || 'Never',
        collectionRate: Math.round(collectionRate * 100) / 100,
        trainingAccuracy: nn?.performance?.accuracy || 0,
        trainingLoss: nn?.performance?.loss || 0,
        estimatedCompletion,
      },
      health,
    };
  }

  /**
   * Assess health of a campaign
   */
  private assessHealth(config: any, nn: any, stats: any, collectionRate: number): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    lastHealthCheck: string;
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check if data collection is active
    if (!config || config.status !== 'active') {
      issues.push('Data collection is not active');
      status = 'warning';
    }

    // Check collection rate
    if (collectionRate < 1 && config?.status === 'active') {
      issues.push('Low data collection rate (< 1 sample/hour)');
      status = 'warning';
    }

    // Check training status
    if (nn?.status === 'error') {
      issues.push('Neural network training error');
      status = 'critical';
    }

    // Check sample count
    if (stats.total_samples < 100) {
      issues.push('Insufficient training samples (< 100)');
      status = 'warning';
    }

    // Check data quality
    if (stats.avg_quality && stats.avg_quality < 0.5) {
      issues.push('Low average data quality (< 0.5)');
      status = 'warning';
    }

    return {
      status,
      issues,
      lastHealthCheck: new Date().toISOString(),
    };
  }

  /**
   * Estimate completion time
   */
  private estimateCompletion(
    currentSamples: number,
    samplesPerHour: number,
    targetSamples: number
  ): string {
    if (samplesPerHour <= 0) {
      return 'Unknown';
    }

    const remainingSamples = Math.max(0, targetSamples - currentSamples);
    const hoursRemaining = remainingSamples / samplesPerHour;

    if (hoursRemaining < 1) {
      return `${Math.round(hoursRemaining * 60)} minutes`;
    } else if (hoursRemaining < 24) {
      return `${Math.round(hoursRemaining)} hours`;
    } else {
      return `${Math.round(hoursRemaining / 24)} days`;
    }
  }

  /**
   * Get all client statuses
   */
  async getAllClientStatuses(): Promise<ClientStatus[]> {
    // Fetch all clients
    const clientsResult = await this.dbPool.query(`
      SELECT DISTINCT c.client_id, c.plan_type, c.created_at
      FROM client_seo_campaigns c
      WHERE c.status != 'archived'
      ORDER BY c.created_at DESC
    `);

    const clientStatuses: ClientStatus[] = [];

    for (const clientRow of clientsResult.rows) {
      const status = await this.getClientStatus(clientRow.client_id);
      clientStatuses.push(status);
    }

    return clientStatuses;
  }

  /**
   * Get status for a specific client
   */
  async getClientStatus(clientId: string): Promise<ClientStatus> {
    // Fetch client campaigns
    const campaignsResult = await this.dbPool.query(`
      SELECT id, created_at, updated_at
      FROM client_seo_campaigns
      WHERE client_id = $1 AND status != 'archived'
    `, [clientId]);

    const campaigns: CampaignTrainingStatus[] = [];
    let totalSamples = 0;
    let totalAccuracy = 0;
    let activeCampaigns = 0;

    for (const campaign of campaignsResult.rows) {
      const status = await this.getCampaignStatus(campaign.id);
      campaigns.push(status);

      totalSamples += status.metrics.totalSamples;
      totalAccuracy += status.metrics.trainingAccuracy;
      
      if (status.dataCollectionStatus === 'active') {
        activeCampaigns++;
      }
    }

    const avgAccuracy = campaigns.length > 0
      ? totalAccuracy / campaigns.length
      : 0;

    return {
      clientId,
      name: `Client ${clientId}`, // Would fetch from users table
      email: '', // Would fetch from users table
      planType: campaignsResult.rows[0]?.plan_type || 'unknown',
      campaigns,
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalSamples,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      status: activeCampaigns > 0 ? 'active' : 'inactive',
      createdAt: campaignsResult.rows[0]?.created_at || new Date().toISOString(),
      lastActive: campaignsResult.rows[0]?.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Get cached status for a campaign
   */
  getCachedStatus(campaignId: string): CampaignTrainingStatus | undefined {
    return this.statusCache.get(campaignId);
  }

  /**
   * Get all cached statuses
   */
  getAllCachedStatuses(): CampaignTrainingStatus[] {
    return Array.from(this.statusCache.values());
  }
}

export default CampaignTrainingMonitor;
