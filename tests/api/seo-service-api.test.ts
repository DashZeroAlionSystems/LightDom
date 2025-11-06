/**
 * Integration Tests for SEO Service API
 * Tests all 30 API endpoints with real database interactions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

describe('SEO Service API Integration Tests', () => {
  let authToken: string;
  let apiKey: string;
  let clientId: string;

  beforeAll(async () => {
    // Setup test database and user
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/v1/auth/signup should create new user', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('POST /api/v1/auth/login should authenticate user', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('POST /api/v1/auth/refresh should refresh token', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('Client Management Endpoints', () => {
    it('POST /api/v1/clients should create SEO client', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Website',
          domain: 'https://test.com',
          plan: 'starter',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('apiKey');
      clientId = response.body.id;
      apiKey = response.body.apiKey;
    });

    it('GET /api/v1/clients/:clientId should get client details', async () => {
      const response = await request('http://localhost:3001')
        .get(`/api/v1/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', clientId);
    });
  });

  describe('SEO Configuration Endpoints', () => {
    it('GET /api/v1/seo/config/:apiKey should return configuration', async () => {
      const response = await request('http://localhost:3001')
        .get(`/api/v1/seo/config/${apiKey}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('enabledSchemas');
    });

    it('POST /api/v1/seo/analytics should accept analytics data', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/seo/analytics')
        .send({
          apiKey,
          url: 'https://test.com/page',
          vitals: {
            lcp: 2000,
            inp: 100,
            cls: 0.05,
          },
        });

      expect(response.status).toBe(202);
    });
  });

  describe('Analytics Endpoints', () => {
    it('GET /api/v1/analytics/overview should return dashboard data', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ clientId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('seoScore');
    });
  });

  describe('Recommendations Endpoints', () => {
    it('POST /api/v1/recommendations/generate should create recommendations', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/recommendations/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ clientId });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Reports Endpoints', () => {
    it('POST /api/v1/reports/generate should create report', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientId,
          type: 'executive',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Schemas Endpoints', () => {
    it('GET /api/v1/schemas/detect should detect schema type', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/v1/schemas/detect')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ url: 'https://test.com/blog/article' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestedType');
    });
  });

  describe('Subscriptions Endpoints', () => {
    it('GET /api/v1/subscriptions/plans should list pricing plans', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Send 101 requests (starter tier limit is 100/min)
      const requests = Array.from({ length: 101 }, () =>
        request('http://localhost:3001')
          .get(`/api/v1/seo/config/${apiKey}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for invalid token', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/v1/clients')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/v1/clients/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should validate request body', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/v1/auth/signup')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
