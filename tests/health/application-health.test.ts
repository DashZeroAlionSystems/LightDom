import { test, expect } from '@playwright/test';

test.describe('Application Health Checks', () => {
  test('API Health Check', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      version: expect.any(String),
    });
    
    // Check individual service health
    expect(data.services).toMatchObject({
      database: 'healthy',
      redis: 'healthy',
      blockchain: 'healthy',
      crawler: 'healthy',
    });
  });

  test('Database Connection Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/database');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      connection: 'connected',
      responseTime: expect.any(Number),
      activeConnections: expect.any(Number),
    });
    
    // Verify response time is reasonable
    expect(data.responseTime).toBeLessThan(1000); // Less than 1 second
  });

  test('Redis Cache Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/redis');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      connection: 'connected',
      memory: expect.any(Object),
      operations: expect.any(Object),
    });
    
    // Check memory usage
    expect(data.memory).toMatchObject({
      used: expect.any(Number),
      total: expect.any(Number),
      percentage: expect.any(Number),
    });
  });

  test('Blockchain Service Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/blockchain');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      networks: expect.any(Object),
      contracts: expect.any(Object),
    });
    
    // Check network connectivity
    expect(data.networks).toMatchObject({
      ethereum: expect.any(Object),
      polygon: expect.any(Object),
      arbitrum: expect.any(Object),
      optimism: expect.any(Object),
    });
  });

  test('Web Crawler Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/crawler');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      browser: 'connected',
      activeSessions: expect.any(Number),
      queueSize: expect.any(Number),
    });
  });

  test('Frontend Application Health', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if page loads successfully
    await expect(page.locator('body')).toBeVisible();
    
    // Check for critical elements
    await expect(page.locator('h1, h2, h3')).toHaveCount.greaterThan(0);
    
    // Check for JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForLoadState('networkidle');
    
    // Verify no critical JavaScript errors
    expect(errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404')
    )).toHaveLength(0);
  });

  test('Service Dependencies Health', async ({ request }) => {
    // Test all critical API endpoints
    const endpoints = [
      '/api/auth/health',
      '/api/optimization/health',
      '/api/websites/health',
      '/api/analytics/health',
      '/api/crawler/health',
      '/api/metaverse/health',
      '/api/blockchain/health',
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`http://localhost:3001${endpoint}`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
      });
    }
  });

  test('Memory Usage Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/memory');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      memory: expect.any(Object),
      heap: expect.any(Object),
      external: expect.any(Number),
    });
    
    // Check memory usage is reasonable
    expect(data.memory.used).toBeLessThan(data.memory.total);
    expect(data.memory.percentage).toBeLessThan(90); // Less than 90% usage
  });

  test('Disk Space Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/disk');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      disk: expect.any(Object),
      logs: expect.any(Object),
      artifacts: expect.any(Object),
    });
    
    // Check disk usage is reasonable
    expect(data.disk.used).toBeLessThan(data.disk.total);
    expect(data.disk.percentage).toBeLessThan(90); // Less than 90% usage
  });

  test('Network Connectivity Health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/network');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      connectivity: expect.any(Object),
      latency: expect.any(Object),
    });
    
    // Check external connectivity
    expect(data.connectivity).toMatchObject({
      internet: 'connected',
      blockchain: 'connected',
      cdn: 'connected',
    });
  });

  test('Security Health Check', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/security');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      ssl: expect.any(Object),
      cors: expect.any(Object),
      rateLimit: expect.any(Object),
      authentication: expect.any(Object),
    });
    
    // Check SSL configuration
    expect(data.ssl).toMatchObject({
      enabled: true,
      valid: true,
      expires: expect.any(String),
    });
  });

  test('Performance Health Check', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/performance');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      responseTime: expect.any(Object),
      throughput: expect.any(Object),
      errorRate: expect.any(Object),
    });
    
    // Check response times are reasonable
    expect(data.responseTime.average).toBeLessThan(1000); // Less than 1 second
    expect(data.responseTime.p95).toBeLessThan(2000); // Less than 2 seconds
    
    // Check error rate is low
    expect(data.errorRate.percentage).toBeLessThan(5); // Less than 5% error rate
  });

  test('Comprehensive Health Check', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/comprehensive');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      overall: 'healthy',
      services: expect.any(Object),
      metrics: expect.any(Object),
      recommendations: expect.any(Array),
    });
    
    // Check all services are healthy
    Object.values(data.services).forEach((service: any) => {
      expect(service.status).toBe('healthy');
    });
    
    // Check critical metrics
    expect(data.metrics).toMatchObject({
      uptime: expect.any(Number),
      requests: expect.any(Number),
      errors: expect.any(Number),
      responseTime: expect.any(Number),
    });
  });

  test('Health Check Endpoint Availability', async ({ request }) => {
    // Test that health check endpoint is always available
    const response = await request.get('http://localhost:3001/api/health');
    
    expect(response.status()).toBe(200);
    
    // Test with different HTTP methods (should return 405 for unsupported methods)
    const postResponse = await request.post('http://localhost:3001/api/health');
    expect(postResponse.status()).toBe(405);
    
    const putResponse = await request.put('http://localhost:3001/api/health');
    expect(putResponse.status()).toBe(405);
    
    const deleteResponse = await request.delete('http://localhost:3001/api/health');
    expect(deleteResponse.status()).toBe(405);
  });

  test('Health Check Response Time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('http://localhost:3001/api/health');
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    
    const data = await response.json();
    expect(data.responseTime).toBeLessThan(1000); // Internal response time should also be fast
  });

  test('Health Check Under Load', async ({ request }) => {
    // Simulate multiple concurrent health check requests
    const promises = Array.from({ length: 10 }, () => 
      request.get('http://localhost:3001/api/health')
    );
    
    const responses = await Promise.all(promises);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Check that all responses are consistent
    const data = await responses[0].json();
    responses.forEach(async (response) => {
      const responseData = await response.json();
      expect(responseData.status).toBe(data.status);
    });
  });
});