/**
 * Admin Analytics API Integration Tests
 * Tests for all admin analytics endpoints including system overview, client metrics, mining stats, and billing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { adminAnalyticsAPI } from '../../../src/api/adminAnalyticsApi';
import { ClientManagementSystem } from '../../../src/core/ClientManagementSystem';
import { MetaverseMiningEngine } from '../../../src/core/MetaverseMiningEngine';
import { GamificationEngine } from '../../../src/core/GamificationEngine';

// Mock Request and Response objects
class MockRequest {
  params: Record<string, any> = {};
  headers: Record<string, any> = {};
  body: Record<string, any> = {};
  query: Record<string, any> = {};
}

class MockResponse {
  statusCode = 200;
  data: any = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.data = data;
    return this;
  }
}

describe('Admin Analytics API Integration Tests', () => {
  let clientSystem: ClientManagementSystem;
  let miningEngine: MetaverseMiningEngine;
  let gamificationEngine: GamificationEngine;
  const adminAddress = '0x1234567890123456789012345678901234567890';
  const invalidAddress = '0xinvalid';

  beforeAll(() => {
    // Initialize systems
    clientSystem = new ClientManagementSystem();
    miningEngine = new MetaverseMiningEngine();
    gamificationEngine = new GamificationEngine();

    // Create some test clients
    clientSystem.createClient('test1@example.com', 'Test Client 1', 'starter', 'Test Company 1');
    clientSystem.createClient('test2@example.com', 'Test Client 2', 'professional', 'Test Company 2');
    clientSystem.createClient('test3@example.com', 'Test Client 3', 'enterprise', 'Test Company 3');
  });

  describe('GET /api/admin/analytics/overview', () => {
    it('should return system overview for admin', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(res.data.data.totalClients).toBeGreaterThanOrEqual(3);
      expect(res.data.data).toHaveProperty('activeClients');
      expect(res.data.data).toHaveProperty('totalRevenue');
      expect(res.data.data).toHaveProperty('monthlyRecurringRevenue');
      expect(res.data.data).toHaveProperty('totalMiningScore');
      expect(res.data.data).toHaveProperty('systemHealth');
    });

    it('should reject request without admin address', async () => {
      const req = new MockRequest();
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('Admin access required');
    });

    it('should reject request with invalid admin address', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = invalidAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
    });

    it('should include system health metrics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.data.data.systemHealth).toBeDefined();
      expect(res.data.data.systemHealth.uptime).toBeGreaterThan(0);
      expect(res.data.data.systemHealth.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(res.data.data.systemHealth.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(res.data.data.systemHealth.apiResponseTime).toBeGreaterThan(0);
      expect(res.data.data.systemHealth.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/admin/analytics/clients', () => {
    it('should return client usage metrics for admin', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should include all required client fields', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      const client = res.data.data[0];
      expect(client).toHaveProperty('clientId');
      expect(client).toHaveProperty('clientName');
      expect(client).toHaveProperty('planId');
      expect(client).toHaveProperty('planName');
      expect(client).toHaveProperty('status');
      expect(client).toHaveProperty('usage');
      expect(client).toHaveProperty('mining');
      expect(client).toHaveProperty('gamification');
      expect(client).toHaveProperty('billing');
    });

    it('should include usage statistics with percentages', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      const client = res.data.data[0];
      expect(client.usage.requestsPercentage).toBeGreaterThanOrEqual(0);
      expect(client.usage.requestsPercentage).toBeLessThanOrEqual(100);
      expect(client.usage.storagePercentage).toBeGreaterThanOrEqual(0);
      expect(client.usage.storagePercentage).toBeLessThanOrEqual(100);
    });

    it('should include mining statistics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      const client = res.data.data[0];
      expect(client.mining).toHaveProperty('totalMiningScore');
      expect(client.mining).toHaveProperty('algorithmsDiscovered');
      expect(client.mining).toHaveProperty('elementsCollected');
      expect(client.mining).toHaveProperty('combinationsCompleted');
      expect(client.mining).toHaveProperty('totalTokensEarned');
    });

    it('should include gamification data', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      const client = res.data.data[0];
      expect(client.gamification).toHaveProperty('level');
      expect(client.gamification).toHaveProperty('experiencePoints');
      expect(client.gamification).toHaveProperty('achievementsUnlocked');
      expect(client.gamification).toHaveProperty('questsCompleted');
      expect(client.gamification).toHaveProperty('currentStreak');
      expect(client.gamification).toHaveProperty('rank');
    });

    it('should reject request without admin access', async () => {
      const req = new MockRequest();
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
    });
  });

  describe('GET /api/admin/analytics/client/:clientId/activity', () => {
    it('should return client activity details', async () => {
      const clients = clientSystem.getAllClients();
      const clientId = clients[0].id;

      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      req.params['clientId'] = clientId;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientActivity(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(res.data.data.clientId).toBe(clientId);
      expect(res.data.data.activities).toBeDefined();
      expect(Array.isArray(res.data.data.activities)).toBe(true);
    });

    it('should return 404 for non-existent client', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      req.params['clientId'] = 'non-existent-client';
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientActivity(req as any, res as any);

      expect(res.statusCode).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('Client not found');
    });

    it('should include performance metrics', async () => {
      const clients = clientSystem.getAllClients();
      const clientId = clients[0].id;

      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      req.params['clientId'] = clientId;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientActivity(req as any, res as any);

      expect(res.data.data.performanceMetrics).toBeDefined();
      expect(res.data.data.performanceMetrics).toHaveProperty('averageOptimizationTime');
      expect(res.data.data.performanceMetrics).toHaveProperty('successRate');
      expect(res.data.data.performanceMetrics).toHaveProperty('resourceUtilization');
    });

    it('should include activity timeline', async () => {
      const clients = clientSystem.getAllClients();
      const clientId = clients[0].id;

      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      req.params['clientId'] = clientId;
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientActivity(req as any, res as any);

      expect(res.data.data.activities.length).toBeGreaterThan(0);
      const activity = res.data.data.activities[0];
      expect(activity).toHaveProperty('timestamp');
      expect(activity).toHaveProperty('type');
      expect(activity).toHaveProperty('description');
      expect(activity).toHaveProperty('metadata');
    });
  });

  describe('GET /api/admin/analytics/mining', () => {
    it('should return mining statistics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getMiningStatistics(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(res.data.data).toHaveProperty('overall');
      expect(res.data.data).toHaveProperty('byClient');
      expect(res.data.data).toHaveProperty('byBiome');
      expect(res.data.data).toHaveProperty('topPerformers');
    });

    it('should include overall mining metrics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getMiningStatistics(req as any, res as any);

      const overall = res.data.data.overall;
      expect(overall).toHaveProperty('totalMiningOperations');
      expect(overall).toHaveProperty('totalAlgorithmsDiscovered');
      expect(overall).toHaveProperty('totalDataMined');
      expect(overall).toHaveProperty('averageMiningScore');
      expect(overall).toHaveProperty('totalTokensEarned');
    });

    it('should rank clients by mining score', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getMiningStatistics(req as any, res as any);

      const byClient = res.data.data.byClient;
      expect(Array.isArray(byClient)).toBe(true);
      
      // Verify clients are sorted by mining score (descending)
      for (let i = 1; i < byClient.length; i++) {
        expect(byClient[i - 1].miningScore).toBeGreaterThanOrEqual(byClient[i].miningScore);
      }
    });

    it('should include biome statistics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getMiningStatistics(req as any, res as any);

      const byBiome = res.data.data.byBiome;
      expect(Array.isArray(byBiome)).toBe(true);
      
      if (byBiome.length > 0) {
        const biome = byBiome[0];
        expect(biome).toHaveProperty('biomeType');
        expect(biome).toHaveProperty('totalOperations');
        expect(biome).toHaveProperty('averageAuthority');
        expect(biome).toHaveProperty('totalRewards');
      }
    });

    it('should include top performers', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getMiningStatistics(req as any, res as any);

      const topPerformers = res.data.data.topPerformers;
      expect(Array.isArray(topPerformers)).toBe(true);
      expect(topPerformers.length).toBeLessThanOrEqual(10);
      
      if (topPerformers.length > 0) {
        const performer = topPerformers[0];
        expect(performer).toHaveProperty('clientId');
        expect(performer).toHaveProperty('clientName');
        expect(performer).toHaveProperty('metric');
        expect(performer).toHaveProperty('value');
        expect(performer).toHaveProperty('rank');
        expect(performer.rank).toBe(1);
      }
    });
  });

  describe('GET /api/admin/analytics/billing', () => {
    it('should return billing analytics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getBillingAnalytics(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(res.data.data).toHaveProperty('revenue');
      expect(res.data.data).toHaveProperty('subscriptions');
      expect(res.data.data).toHaveProperty('plans');
      expect(res.data.data).toHaveProperty('usage');
      expect(res.data.data).toHaveProperty('trends');
    });

    it('should include revenue metrics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getBillingAnalytics(req as any, res as any);

      const revenue = res.data.data.revenue;
      expect(revenue).toHaveProperty('total');
      expect(revenue).toHaveProperty('thisMonth');
      expect(revenue).toHaveProperty('lastMonth');
      expect(revenue).toHaveProperty('growthRate');
      expect(revenue.total).toBeGreaterThanOrEqual(0);
    });

    it('should include subscription metrics', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getBillingAnalytics(req as any, res as any);

      const subscriptions = res.data.data.subscriptions;
      expect(subscriptions).toHaveProperty('active');
      expect(subscriptions).toHaveProperty('trial');
      expect(subscriptions).toHaveProperty('cancelled');
      expect(subscriptions).toHaveProperty('churnRate');
      expect(subscriptions.active).toBeGreaterThanOrEqual(0);
      expect(subscriptions.churnRate).toBeGreaterThanOrEqual(0);
    });

    it('should include plan distribution', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getBillingAnalytics(req as any, res as any);

      const plans = res.data.data.plans;
      expect(Array.isArray(plans)).toBe(true);
      
      if (plans.length > 0) {
        const plan = plans[0];
        expect(plan).toHaveProperty('planId');
        expect(plan).toHaveProperty('planName');
        expect(plan).toHaveProperty('subscriberCount');
        expect(plan).toHaveProperty('revenue');
        expect(plan).toHaveProperty('averageRevenue');
      }
    });

    it('should include revenue trends', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getBillingAnalytics(req as any, res as any);

      const trends = res.data.data.trends;
      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBe(30); // 30 days of data
      
      const trend = trends[0];
      expect(trend).toHaveProperty('date');
      expect(trend).toHaveProperty('revenue');
      expect(trend).toHaveProperty('newClients');
      expect(trend).toHaveProperty('churnedClients');
      expect(trend).toHaveProperty('activeClients');
    });
  });

  describe('GET /api/admin/analytics/alerts', () => {
    it('should return system alerts', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemAlerts(req as any, res as any);

      expect(res.statusCode).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data).toBeDefined();
      expect(res.data.data).toHaveProperty('alerts');
      expect(res.data.data).toHaveProperty('count');
      expect(Array.isArray(res.data.data.alerts)).toBe(true);
    });

    it('should include alert details', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemAlerts(req as any, res as any);

      const alerts = res.data.data.alerts;
      if (alerts.length > 0) {
        const alert = alerts[0];
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('clientId');
        expect(alert).toHaveProperty('clientName');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('timestamp');
        expect(['warning', 'critical']).toContain(alert.severity);
      }
    });

    it('should detect usage warnings', async () => {
      // Create a client with high usage
      const client = clientSystem.createClient(
        'highusage@example.com',
        'High Usage Client',
        'starter'
      );
      
      // Simulate high usage (over 90%)
      for (let i = 0; i < 950; i++) {
        clientSystem.updateClientUsage(client.id, 'request', 1);
      }

      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemAlerts(req as any, res as any);

      const usageAlerts = res.data.data.alerts.filter(
        (a: any) => a.type === 'usage_warning'
      );
      expect(usageAlerts.length).toBeGreaterThan(0);
    });

    it('should count alerts correctly', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemAlerts(req as any, res as any);

      expect(res.data.data.count).toBe(res.data.data.alerts.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing admin address gracefully', async () => {
      const req = new MockRequest();
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBeDefined();
    });

    it('should handle invalid client ID gracefully', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      req.params['clientId'] = 'invalid-id-that-does-not-exist';
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientActivity(req as any, res as any);

      expect(res.statusCode).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('Client not found');
    });

    it('should return proper error messages', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = 'invalid';
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.data).toHaveProperty('error');
      expect(typeof res.data.error).toBe('string');
      expect(res.data.error.length).toBeGreaterThan(0);
    });
  });

  describe('Security', () => {
    it('should validate admin address format', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = 'not-a-valid-address';
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
    });

    it('should require 0x prefix in admin address', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = '1234567890123456789012345678901234567890';
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
    });

    it('should require correct address length', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = '0x123'; // Too short
      const res = new MockResponse();

      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.success).toBe(false);
    });

    it('should not expose sensitive client data without admin access', async () => {
      const req = new MockRequest();
      const res = new MockResponse();

      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);

      expect(res.statusCode).toBe(403);
      expect(res.data.data).toBeUndefined();
    });
  });

  describe('Performance', () => {
    it('should handle large number of clients efficiently', async () => {
      // Create many clients
      for (let i = 0; i < 100; i++) {
        clientSystem.createClient(
          `test${i}@example.com`,
          `Test Client ${i}`,
          'starter'
        );
      }

      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      const startTime = Date.now();
      await adminAnalyticsAPI.getClientUsageMetrics(req as any, res as any);
      const endTime = Date.now();

      expect(res.statusCode).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should return data in reasonable time for overview', async () => {
      const req = new MockRequest();
      req.headers['x-admin-address'] = adminAddress;
      const res = new MockResponse();

      const startTime = Date.now();
      await adminAnalyticsAPI.getSystemOverview(req as any, res as any);
      const endTime = Date.now();

      expect(res.statusCode).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
