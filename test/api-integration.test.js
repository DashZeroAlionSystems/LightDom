/**
 * Automated API Integration Tests
 * Ensures all critical API endpoints are accessible and returning 200 responses
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return {
    status: response.status,
    ok: response.ok,
    data: response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text()
  };
}

describe('API Health and Availability Tests', () => {
  describe('Core API Endpoints', () => {
    it('should return 200 for health check', async () => {
      const response = await apiRequest('/api/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });

    it('should return 200 for crawler status', async () => {
      const response = await apiRequest('/api/crawler/status');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isRunning');
    });

    it('should return 200 for stats dashboard', async () => {
      const response = await apiRequest('/api/stats/dashboard');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('lastUpdated');
    });

    it('should return 200 for blockchain metrics', async () => {
      const response = await apiRequest('/api/blockchain/metrics');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
    });

    it('should return 200 for blockchain status', async () => {
      const response = await apiRequest('/api/blockchain/status');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('enabled');
    });
  });

  describe('Onboarding API Endpoints', () => {
    let sessionToken;

    it('should return 200 for onboarding plans', async () => {
      const response = await apiRequest('/api/onboarding/plans');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('plans');
      expect(Array.isArray(response.data.plans)).toBe(true);
      expect(response.data.plans.length).toBeGreaterThan(0);
    });

    it('should return 200 for onboarding steps', async () => {
      const response = await apiRequest('/api/onboarding/steps');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should start onboarding session and return 200', async () => {
      const response = await apiRequest('/api/onboarding/start', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          metadata: { source: 'api_test' }
        })
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('sessionToken');
      expect(response.data).toHaveProperty('currentStep');
      expect(response.data).toHaveProperty('totalSteps');
      
      sessionToken = response.data.sessionToken;
    });

    it('should get session state with valid token and return 200', async () => {
      if (!sessionToken) {
        // Start a session first
        const startResponse = await apiRequest('/api/onboarding/start', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' })
        });
        sessionToken = startResponse.data.sessionToken;
      }

      const response = await apiRequest('/api/onboarding/session', {
        headers: {
          'x-session-token': sessionToken
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('currentStep');
      expect(response.data).toHaveProperty('status');
    });

    it('should return 401 for session without token', async () => {
      const response = await apiRequest('/api/onboarding/session');
      expect(response.status).toBe(401);
    });
  });

  describe('Payment API Endpoints', () => {
    it('should return 200 for payment plans', async () => {
      const response = await apiRequest('/api/payment/plans');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('plans');
      expect(Array.isArray(response.data.plans)).toBe(true);
      expect(response.data.plans.length).toBeGreaterThan(0);
    });

    it('should handle checkout request (mock mode)', async () => {
      const response = await apiRequest('/api/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId: 'starter',
          billingCycle: 'monthly',
          customerEmail: 'test@example.com'
        })
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('checkoutUrl');
    });

    it('should return 400 for checkout without required fields', async () => {
      const response = await apiRequest('/api/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Analytics and Stats Endpoints', () => {
    it('should return 200 for bridge analytics', async () => {
      const response = await apiRequest('/api/analytics/bridges');
      expect(response.status).toBe(200);
    });

    it('should return 200 for space mining analytics', async () => {
      const response = await apiRequest('/api/analytics/space-mining');
      expect(response.status).toBe(200);
    });

    it('should return 200 for user engagement analytics', async () => {
      const response = await apiRequest('/api/analytics/user-engagement');
      expect(response.status).toBe(200);
    });

    it('should return 200 for real-time analytics', async () => {
      const response = await apiRequest('/api/analytics/real-time');
      expect(response.status).toBe(200);
    });
  });

  describe('Metaverse API Endpoints', () => {
    it('should return 200 for metaverse land', async () => {
      const response = await apiRequest('/api/metaverse/land');
      expect(response.status).toBe(200);
    });

    it('should return 200 for metaverse bridges', async () => {
      const response = await apiRequest('/api/metaverse/bridges');
      expect(response.status).toBe(200);
    });

    it('should return 200 for metaverse chatrooms', async () => {
      const response = await apiRequest('/api/metaverse/chatrooms');
      expect(response.status).toBe(200);
    });
  });

  describe('Mining API Endpoints', () => {
    it('should return 200 for mining sessions', async () => {
      const response = await apiRequest('/api/mining/sessions');
      expect(response.status).toBe(200);
    });

    it('should return 200 for mining rewards', async () => {
      const response = await apiRequest('/api/mining/rewards');
      expect(response.status).toBe(200);
    });

    it('should return 200 for mining stats', async () => {
      const response = await apiRequest('/api/mining/stats');
      expect(response.status).toBe(200);
    });
  });

  describe('Marketplace API Endpoints', () => {
    it('should return 200 for marketplace items', async () => {
      const response = await apiRequest('/api/marketplace/items');
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await apiRequest('/api/non-existent-endpoint');
      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/onboarding/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});

describe('API Performance and Availability', () => {
  it('should respond to health check within 1 second', async () => {
    const start = Date.now();
    const response = await apiRequest('/api/health');
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000);
  });

  it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, () => 
      apiRequest('/api/health')
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});

describe('Database Connection Handling', () => {
  it('should handle database disabled gracefully', async () => {
    const response = await apiRequest('/api/health');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('database');
    // Should work even if database is disabled
  });

  it('should return appropriate status when database is unavailable', async () => {
    const response = await apiRequest('/api/stats/dashboard');
    expect(response.status).toBe(200);
    // Should return empty/default data instead of 500 error
  });
});
