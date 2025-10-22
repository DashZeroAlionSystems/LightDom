/**
 * Admin Analytics API - Comprehensive analytics and monitoring endpoints
 * Provides admin overview of client usage, mining stats, billing, and system health
 */

import { Request, Response } from 'express';
import { ClientManagementSystem } from '../core/ClientManagementSystem';
import { MetaverseMiningEngine } from '../core/MetaverseMiningEngine';
import { GamificationEngine } from '../core/GamificationEngine';
import { logger } from '../utils/Logger';

// Initialize core systems
const clientSystem = new ClientManagementSystem();
const miningEngine = new MetaverseMiningEngine();
const gamificationEngine = new GamificationEngine();

export interface ClientUsageMetrics {
  clientId: string;
  clientName: string;
  planId: string;
  planName: string;
  status: string;
  usage: {
    requestsThisMonth: number;
    requestsLimit: number;
    requestsPercentage: number;
    storageUsedGB: number;
    storageLimit: number;
    storagePercentage: number;
    apiCallsToday: number;
    apiCallsLimit: number;
    optimizationTasksCompleted: number;
  };
  mining: {
    totalMiningScore: number;
    algorithmsDiscovered: number;
    elementsCollected: number;
    combinationsCompleted: number;
    totalTokensEarned: number;
  };
  gamification: {
    level: number;
    experiencePoints: number;
    achievementsUnlocked: number;
    questsCompleted: number;
    currentStreak: number;
    rank: string;
  };
  billing: {
    currentPeriodStart: number;
    currentPeriodEnd: number;
    totalCharges: number;
    lastPaymentDate?: number;
    paymentStatus: string;
  };
  lastActive: number;
  createdAt: number;
}

export interface SystemOverview {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  trialClients: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalMiningScore: number;
  totalAlgorithmsDiscovered: number;
  totalOptimizations: number;
  totalTokensMinted: number;
  systemHealth: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    apiResponseTime: number;
    errorRate: number;
  };
}

export interface ClientActivityDetail {
  clientId: string;
  activities: Array<{
    timestamp: number;
    type: 'optimization' | 'mining' | 'combination' | 'api_call' | 'payment' | 'achievement';
    description: string;
    metadata: any;
  }>;
  performanceMetrics: {
    averageOptimizationTime: number;
    successRate: number;
    resourceUtilization: number;
  };
}

export interface MiningStatistics {
  overall: {
    totalMiningOperations: number;
    totalAlgorithmsDiscovered: number;
    totalDataMined: number;
    averageMiningScore: number;
    totalTokensEarned: number;
  };
  byClient: Array<{
    clientId: string;
    clientName: string;
    miningScore: number;
    algorithmsDiscovered: number;
    tokensEarned: number;
    lastMiningActivity: number;
  }>;
  byBiome: Array<{
    biomeType: string;
    biomeCount: number;
    totalOperations: number;
    averageAuthority: number;
    totalRewards: number;
  }>;
  topPerformers: Array<{
    clientId: string;
    clientName: string;
    metric: string;
    value: number;
    rank: number;
  }>;
}

export interface BillingAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  subscriptions: {
    active: number;
    trial: number;
    cancelled: number;
    churnRate: number;
  };
  plans: Array<{
    planId: string;
    planName: string;
    subscriberCount: number;
    revenue: number;
    averageRevenue: number;
  }>;
  usage: {
    totalApiCalls: number;
    totalOptimizations: number;
    totalStorageGB: number;
    overageCharges: number;
  };
  trends: Array<{
    date: string;
    revenue: number;
    newClients: number;
    churnedClients: number;
    activeClients: number;
  }>;
}

class AdminAnalyticsAPI {
  /**
   * Get comprehensive system overview
   * GET /api/admin/analytics/overview
   */
  async getSystemOverview(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const clients = clientSystem.getAllClients();
      const activeClients = clients.filter(c => c.status === 'active');
      const suspendedClients = clients.filter(c => c.status === 'suspended');
      const trialClients = clients.filter(c => c.status === 'trial');

      const totalRevenue = clients.reduce((sum, c) => sum + c.billing.totalCharges, 0);
      const monthlyRecurringRevenue = activeClients.reduce((sum, c) => 
        sum + c.plan.pricing.monthlyPriceUSD, 0);

      const totalMiningScore = clients.reduce((sum, c) => {
        const miningStats = miningEngine.getUserMiningStats(c.id);
        return sum + (miningStats?.totalScore || 0);
      }, 0);

      const totalAlgorithmsDiscovered = miningEngine.getTotalAlgorithmsDiscovered();
      const totalOptimizations = clients.reduce((sum, c) => 
        sum + c.usage.optimizationTasksCompleted, 0);

      const overview: SystemOverview = {
        totalClients: clients.length,
        activeClients: activeClients.length,
        suspendedClients: suspendedClients.length,
        trialClients: trialClients.length,
        totalRevenue,
        monthlyRecurringRevenue,
        totalMiningScore,
        totalAlgorithmsDiscovered,
        totalOptimizations,
        totalTokensMinted: totalMiningScore * 10, // 10 tokens per mining score point
        systemHealth: {
          uptime: process.uptime(),
          cpuUsage: process.cpuUsage().user / 1000000,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          diskUsage: 0, // Would need actual disk monitoring
          apiResponseTime: 50, // Would need actual API monitoring
          errorRate: 0.1 // Would need actual error tracking
        }
      };

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Error getting system overview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system overview',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all client usage metrics
   * GET /api/admin/analytics/clients
   */
  async getClientUsageMetrics(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const clients = clientSystem.getAllClients();
      const clientMetrics: ClientUsageMetrics[] = clients.map(client => {
        const miningStats = miningEngine.getUserMiningStats(client.id);
        const gamificationStats = gamificationEngine.getUserStats(client.id);

        return {
          clientId: client.id,
          clientName: client.name,
          planId: client.planId,
          planName: client.plan.name,
          status: client.status,
          usage: {
            requestsThisMonth: client.usage.requestsThisMonth,
            requestsLimit: client.plan.limits.requestsPerMonth,
            requestsPercentage: (client.usage.requestsThisMonth / client.plan.limits.requestsPerMonth) * 100,
            storageUsedGB: client.usage.storageUsedGB,
            storageLimit: client.plan.limits.storageGB,
            storagePercentage: (client.usage.storageUsedGB / client.plan.limits.storageGB) * 100,
            apiCallsToday: client.usage.apiCallsToday,
            apiCallsLimit: client.plan.limits.apiCallsPerDay,
            optimizationTasksCompleted: client.usage.optimizationTasksCompleted
          },
          mining: {
            totalMiningScore: miningStats?.totalScore || 0,
            algorithmsDiscovered: miningStats?.algorithmsDiscovered || 0,
            elementsCollected: miningStats?.elementsCollected || 0,
            combinationsCompleted: miningStats?.combinationsCompleted || 0,
            totalTokensEarned: (miningStats?.totalScore || 0) * 10
          },
          gamification: {
            level: gamificationStats?.level || 1,
            experiencePoints: gamificationStats?.experiencePoints || 0,
            achievementsUnlocked: gamificationStats?.achievementsUnlocked || 0,
            questsCompleted: gamificationStats?.questsCompleted || 0,
            currentStreak: gamificationStats?.currentStreak || 0,
            rank: gamificationStats?.rank || 'Novice'
          },
          billing: {
            currentPeriodStart: client.billing.currentPeriodStart,
            currentPeriodEnd: client.billing.currentPeriodEnd,
            totalCharges: client.billing.totalCharges,
            lastPaymentDate: client.billing.lastPaymentDate,
            paymentStatus: this.getPaymentStatus(client)
          },
          lastActive: Date.now() - Math.random() * 86400000, // Mock last active
          createdAt: client.createdAt
        };
      });

      res.json({
        success: true,
        data: clientMetrics
      });
    } catch (error) {
      logger.error('Error getting client metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get client metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get detailed client activity
   * GET /api/admin/analytics/client/:clientId/activity
   */
  async getClientActivity(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const { clientId } = req.params;
      const client = clientSystem.getClientById(clientId);

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Generate mock activity data (would be real activity tracking in production)
      const activities = this.generateMockActivities(clientId, 50);

      const activityDetail: ClientActivityDetail = {
        clientId,
        activities,
        performanceMetrics: {
          averageOptimizationTime: 1.2,
          successRate: 95.5,
          resourceUtilization: 65.3
        }
      };

      res.json({
        success: true,
        data: activityDetail
      });
    } catch (error) {
      logger.error('Error getting client activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get client activity',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get mining statistics
   * GET /api/admin/analytics/mining
   */
  async getMiningStatistics(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const clients = clientSystem.getAllClients();
      const allMiningData = miningEngine.getAllMiningData();

      const byClient = clients.map(client => {
        const stats = miningEngine.getUserMiningStats(client.id);
        return {
          clientId: client.id,
          clientName: client.name,
          miningScore: stats?.totalScore || 0,
          algorithmsDiscovered: stats?.algorithmsDiscovered || 0,
          tokensEarned: (stats?.totalScore || 0) * 10,
          lastMiningActivity: Date.now() - Math.random() * 86400000
        };
      }).sort((a, b) => b.miningScore - a.miningScore);

      const biomeStats = miningEngine.getBiomeStatistics();
      const byBiome = biomeStats.map(biome => ({
        biomeType: biome.type,
        biomeCount: biome.count,
        totalOperations: biome.operations,
        averageAuthority: biome.avgAuthority,
        totalRewards: biome.totalRewards
      }));

      const topPerformers = byClient.slice(0, 10).map((client, index) => ({
        clientId: client.clientId,
        clientName: client.clientName,
        metric: 'Mining Score',
        value: client.miningScore,
        rank: index + 1
      }));

      const statistics: MiningStatistics = {
        overall: {
          totalMiningOperations: allMiningData.totalOperations,
          totalAlgorithmsDiscovered: allMiningData.totalAlgorithms,
          totalDataMined: allMiningData.totalDataMined,
          averageMiningScore: allMiningData.averageScore,
          totalTokensEarned: allMiningData.totalTokens
        },
        byClient,
        byBiome,
        topPerformers
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error getting mining statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get mining statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get billing analytics
   * GET /api/admin/analytics/billing
   */
  async getBillingAnalytics(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const clients = clientSystem.getAllClients();
      const activeClients = clients.filter(c => c.status === 'active');
      const trialClients = clients.filter(c => c.status === 'trial');
      const cancelledClients = clients.filter(c => c.status === 'cancelled');

      const totalRevenue = clients.reduce((sum, c) => sum + c.billing.totalCharges, 0);
      const thisMonthRevenue = this.calculateMonthRevenue(clients, 0);
      const lastMonthRevenue = this.calculateMonthRevenue(clients, 1);
      const growthRate = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      const planStats = this.calculatePlanStatistics(clients);

      const analytics: BillingAnalytics = {
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growthRate
        },
        subscriptions: {
          active: activeClients.length,
          trial: trialClients.length,
          cancelled: cancelledClients.length,
          churnRate: (cancelledClients.length / clients.length) * 100
        },
        plans: planStats,
        usage: {
          totalApiCalls: clients.reduce((sum, c) => sum + c.usage.apiCallsToday, 0),
          totalOptimizations: clients.reduce((sum, c) => sum + c.usage.optimizationTasksCompleted, 0),
          totalStorageGB: clients.reduce((sum, c) => sum + c.usage.storageUsedGB, 0),
          overageCharges: this.calculateOverageCharges(clients)
        },
        trends: this.generateRevenueTrends(clients, 30)
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error getting billing analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get billing analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time system alerts
   * GET /api/admin/analytics/alerts
   */
  async getSystemAlerts(req: Request, res: Response) {
    try {
      // Verify admin access
      const adminAddress = req.headers['x-admin-address'] as string;
      if (!adminAddress || !this.verifyAdminAccess(adminAddress)) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const clients = clientSystem.getAllClients();
      const alerts = [];

      // Check for clients exceeding usage limits
      for (const client of clients) {
        if (client.usage.requestsThisMonth > client.plan.limits.requestsPerMonth * 0.9) {
          alerts.push({
            type: 'usage_warning',
            severity: 'warning',
            clientId: client.id,
            clientName: client.name,
            message: `Client approaching request limit (${client.usage.requestsThisMonth}/${client.plan.limits.requestsPerMonth})`,
            timestamp: Date.now()
          });
        }

        if (client.usage.storageUsedGB > client.plan.limits.storageGB * 0.9) {
          alerts.push({
            type: 'storage_warning',
            severity: 'warning',
            clientId: client.id,
            clientName: client.name,
            message: `Client approaching storage limit (${client.usage.storageUsedGB}/${client.plan.limits.storageGB} GB)`,
            timestamp: Date.now()
          });
        }

        // Check for payment issues
        if (client.status === 'active' && client.billing.nextBillingDate < Date.now()) {
          alerts.push({
            type: 'billing_alert',
            severity: 'critical',
            clientId: client.id,
            clientName: client.name,
            message: 'Payment overdue',
            timestamp: Date.now()
          });
        }
      }

      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length
        }
      });
    } catch (error) {
      logger.error('Error getting system alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system alerts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods
  private verifyAdminAccess(address: string): boolean {
    // Would verify against admin whitelist in production
    return address.startsWith('0x') && address.length === 42;
  }

  private getPaymentStatus(client: any): string {
    if (client.status === 'trial') return 'trial';
    if (client.billing.lastPaymentDate && 
        client.billing.lastPaymentDate > Date.now() - 30 * 86400000) {
      return 'paid';
    }
    return 'pending';
  }

  private generateMockActivities(clientId: string, count: number) {
    const activities = [];
    const types = ['optimization', 'mining', 'combination', 'api_call', 'achievement'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)] as any;
      activities.push({
        timestamp: Date.now() - Math.random() * 86400000,
        type,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} activity`,
        metadata: { success: Math.random() > 0.1 }
      });
    }
    
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }

  private calculateMonthRevenue(clients: any[], monthsAgo: number): number {
    const targetMonth = new Date();
    targetMonth.setMonth(targetMonth.getMonth() - monthsAgo);
    
    return clients.reduce((sum, client) => {
      return sum + client.plan.pricing.monthlyPriceUSD;
    }, 0);
  }

  private calculatePlanStatistics(clients: any[]) {
    const planMap = new Map();
    
    clients.forEach(client => {
      if (!planMap.has(client.planId)) {
        planMap.set(client.planId, {
          planId: client.planId,
          planName: client.plan.name,
          subscriberCount: 0,
          revenue: 0
        });
      }
      
      const planStat = planMap.get(client.planId);
      planStat.subscriberCount++;
      planStat.revenue += client.billing.totalCharges;
    });
    
    return Array.from(planMap.values()).map(stat => ({
      ...stat,
      averageRevenue: stat.revenue / stat.subscriberCount
    }));
  }

  private calculateOverageCharges(clients: any[]): number {
    return clients.reduce((sum, client) => {
      let overage = 0;
      if (client.usage.requestsThisMonth > client.plan.limits.requestsPerMonth) {
        overage += (client.usage.requestsThisMonth - client.plan.limits.requestsPerMonth) * 
                   client.plan.pricing.overagePricePerRequest;
      }
      return sum + overage;
    }, 0);
  }

  private generateRevenueTrends(clients: any[], days: number) {
    const trends = [];
    const dailyRevenue = clients.reduce((sum, c) => sum + c.plan.pricing.monthlyPriceUSD, 0) / 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        revenue: dailyRevenue * (0.8 + Math.random() * 0.4),
        newClients: Math.floor(Math.random() * 3),
        churnedClients: Math.floor(Math.random() * 2),
        activeClients: clients.length + Math.floor(Math.random() * 10 - 5)
      });
    }
    
    return trends;
  }
}

export const adminAnalyticsAPI = new AdminAnalyticsAPI();
