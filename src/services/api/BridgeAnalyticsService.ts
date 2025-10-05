import { Logger } from '../utils/Logger';

export interface BridgeAnalytics {
  bridge_id: string;
  total_messages: number;
  active_participants: number;
  total_space_connected: number;
  avg_space_per_connection: number;
  most_active_hour: number;
  peak_activity_day: string;
  space_growth_rate: number;
  participant_retention_rate: number;
  message_frequency: number;
  bridge_efficiency_score: number;
}

export interface SpaceMiningAnalytics {
  total_space_mined: number;
  total_optimizations: number;
  avg_space_per_optimization: number;
  top_biomes: Array<{ biome: string; count: number; total_space: number }>;
  optimization_types: Array<{ type: string; count: number; avg_space: number }>;
  mining_efficiency: number;
  space_growth_trend: Array<{ date: string; space_mined: number }>;
}

export interface UserEngagementAnalytics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  user_retention_rate: number;
  avg_session_duration: number;
  most_active_bridges: Array<{ bridge_id: string; participants: number; messages: number }>;
  user_activity_patterns: Array<{ hour: number; activity: number }>;
}

export interface BridgeComparison {
  bridge_id: string;
  source_chain: string;
  target_chain: string;
  total_space: number;
  participant_count: number;
  message_count: number;
  efficiency_score: number;
  growth_rate: number;
}

export class BridgeAnalyticsService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('BridgeAnalyticsService');
  }

  /**
   * Get comprehensive bridge analytics
   */
  async getBridgeAnalytics(bridgeId?: string): Promise<BridgeAnalytics[]> {
    try {
      const url = bridgeId 
        ? `/api/analytics/bridge/${bridgeId}`
        : '/api/analytics/bridges';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge analytics:', error);
      throw error;
    }
  }

  /**
   * Get space mining analytics
   */
  async getSpaceMiningAnalytics(): Promise<SpaceMiningAnalytics> {
    try {
      const response = await fetch('/api/analytics/space-mining');
      if (!response.ok) {
        throw new Error(`Failed to fetch space mining analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get space mining analytics:', error);
      throw error;
    }
  }

  /**
   * Get user engagement analytics
   */
  async getUserEngagementAnalytics(): Promise<UserEngagementAnalytics> {
    try {
      const response = await fetch('/api/analytics/user-engagement');
      if (!response.ok) {
        throw new Error(`Failed to fetch user engagement analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get user engagement analytics:', error);
      throw error;
    }
  }

  /**
   * Get bridge comparison data
   */
  async getBridgeComparison(): Promise<BridgeComparison[]> {
    try {
      const response = await fetch('/api/analytics/bridge-comparison');
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge comparison: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge comparison:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeAnalytics(): Promise<any> {
    try {
      const response = await fetch('/api/analytics/real-time');
      if (!response.ok) {
        throw new Error(`Failed to fetch real-time analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get real-time analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific time range
   */
  async getAnalyticsByTimeRange(
    startDate: Date,
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        granularity
      });
      
      const response = await fetch(`/api/analytics/time-range?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch time range analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get time range analytics:', error);
      throw error;
    }
  }

  /**
   * Get top performing bridges
   */
  async getTopPerformingBridges(limit: number = 10): Promise<BridgeComparison[]> {
    try {
      const response = await fetch(`/api/analytics/top-bridges?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch top performing bridges: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get top performing bridges:', error);
      throw error;
    }
  }

  /**
   * Get space mining leaderboard
   */
  async getSpaceMiningLeaderboard(limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`/api/analytics/space-mining-leaderboard?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch space mining leaderboard: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get space mining leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get bridge health metrics
   */
  async getBridgeHealthMetrics(): Promise<any> {
    try {
      const response = await fetch('/api/analytics/bridge-health');
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge health metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get bridge health metrics:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    type: 'bridges' | 'space-mining' | 'user-engagement' | 'all',
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> {
    try {
      const response = await fetch(`/api/analytics/export?type=${type}&format=${format}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export analytics: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      this.logger.error('Failed to export analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate bridge efficiency score
   */
  calculateBridgeEfficiencyScore(analytics: BridgeAnalytics): number {
    const {
      total_space_connected,
      active_participants,
      total_messages,
      participant_retention_rate,
      message_frequency
    } = analytics;

    // Weighted scoring algorithm
    const spaceScore = Math.min(total_space_connected / 1000, 100); // Max 100 for 1000KB
    const participantScore = Math.min(active_participants * 10, 100); // Max 100 for 10 participants
    const messageScore = Math.min(total_messages / 100, 100); // Max 100 for 100 messages
    const retentionScore = participant_retention_rate * 100;
    const frequencyScore = Math.min(message_frequency * 20, 100); // Max 100 for 5 messages/hour

    const efficiencyScore = (
      spaceScore * 0.3 +
      participantScore * 0.25 +
      messageScore * 0.2 +
      retentionScore * 0.15 +
      frequencyScore * 0.1
    );

    return Math.round(efficiencyScore);
  }

  /**
   * Generate analytics insights
   */
  generateInsights(analytics: BridgeAnalytics[]): string[] {
    const insights: string[] = [];

    if (analytics.length === 0) {
      return ['No analytics data available'];
    }

    // Find top performing bridge
    const topBridge = analytics.reduce((prev, current) => 
      prev.total_space_connected > current.total_space_connected ? prev : current
    );

    insights.push(`Top performing bridge: ${topBridge.bridge_id} with ${topBridge.total_space_connected}KB of connected space`);

    // Calculate total space across all bridges
    const totalSpace = analytics.reduce((sum, bridge) => sum + bridge.total_space_connected, 0);
    insights.push(`Total space connected across all bridges: ${totalSpace.toFixed(1)}KB`);

    // Find most active bridge by messages
    const mostActiveBridge = analytics.reduce((prev, current) => 
      prev.total_messages > current.total_messages ? prev : current
    );
    insights.push(`Most active bridge: ${mostActiveBridge.bridge_id} with ${mostActiveBridge.total_messages} messages`);

    // Calculate average efficiency
    const avgEfficiency = analytics.reduce((sum, bridge) => sum + bridge.bridge_efficiency_score, 0) / analytics.length;
    insights.push(`Average bridge efficiency: ${avgEfficiency.toFixed(1)}%`);

    // Find bridges with high growth rate
    const highGrowthBridges = analytics.filter(bridge => bridge.space_growth_rate > 0.1);
    if (highGrowthBridges.length > 0) {
      insights.push(`${highGrowthBridges.length} bridge(s) showing high growth rate (>10%)`);
    }

    return insights;
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<{
    total_bridges: number;
    total_space_connected: number;
    total_participants: number;
    total_messages: number;
    avg_efficiency: number;
    top_insights: string[];
  }> {
    try {
      const [bridgeAnalytics, spaceMiningAnalytics, userEngagementAnalytics] = await Promise.all([
        this.getBridgeAnalytics(),
        this.getSpaceMiningAnalytics(),
        this.getUserEngagementAnalytics()
      ]);

      const totalSpace = bridgeAnalytics.reduce((sum, bridge) => sum + bridge.total_space_connected, 0);
      const totalMessages = bridgeAnalytics.reduce((sum, bridge) => sum + bridge.total_messages, 0);
      const avgEfficiency = bridgeAnalytics.reduce((sum, bridge) => sum + bridge.bridge_efficiency_score, 0) / bridgeAnalytics.length;
      const insights = this.generateInsights(bridgeAnalytics);

      return {
        total_bridges: bridgeAnalytics.length,
        total_space_connected: totalSpace,
        total_participants: userEngagementAnalytics.active_users,
        total_messages: totalMessages,
        avg_efficiency: avgEfficiency,
        top_insights: insights.slice(0, 3) // Top 3 insights
      };
    } catch (error) {
      this.logger.error('Failed to get analytics summary:', error);
      throw error;
    }
  }
}

export default BridgeAnalyticsService;