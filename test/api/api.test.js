import request from 'supertest';
import { expect } from 'chai';
import { ethers } from 'ethers';
import express from 'express';
import { DOMSpaceHarvesterAPI } from '../../api-server-express.js';

// Import vitest globals
import { beforeEach, afterEach, describe, it } from 'vitest';

describe('DOM Space Harvester API', function() {
  let api;
  let app;

  beforeEach(async function() {
    // Create API instance with test configuration
    api = new DOMSpaceHarvesterAPI({
      dbDisabled: true, // Disable database for tests
      blockchainEnabled: false // Disable blockchain for basic tests
    });
    
    app = api.app;
  });

  afterEach(async function() {
    if (api) {
      await api.stop();
    }
  });

  describe('Health Endpoints', function() {
    it('GET /api/health should return health status', async function() {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('timestamp');
      expect(res.body).to.have.property('uptime');
    });

    it('GET /api/health/detailed should return detailed status', async function() {
      const res = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('metrics');
      expect(res.body).to.have.property('supervisor');
    });
  });

  describe('Crawler Endpoints', function() {
    it('POST /api/crawler/start should start crawler', async function() {
      const res = await request(app)
        .post('/api/crawler/start')
        .send({
          maxConcurrency: 2,
          requestDelay: 1000,
          maxDepth: 1
        })
        .expect(200);

      expect(res.body).to.have.property('sessionId');
      expect(res.body).to.have.property('message');
    });

    it('POST /api/crawler/start should reject if already running', async function() {
      // Start first crawler
      await request(app)
        .post('/api/crawler/start')
        .send({ maxConcurrency: 1 });

      // Try to start second crawler
      const res = await request(app)
        .post('/api/crawler/start')
        .send({ maxConcurrency: 1 })
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('POST /api/crawler/stop should stop crawler', async function() {
      // Start crawler first
      await request(app)
        .post('/api/crawler/start')
        .send({ maxConcurrency: 1 });

      const res = await request(app)
        .post('/api/crawler/stop')
        .expect(200);

      expect(res.body).to.have.property('message');
    });

    it('GET /api/crawler/status should return crawler status', async function() {
      const res = await request(app)
        .get('/api/crawler/status')
        .expect(200);

      expect(res.body).to.have.property('isRunning');
      expect(res.body).to.have.property('activeCrawlers');
      expect(res.body).to.have.property('queueLength');
    });
  });

  describe('Statistics Endpoints', function() {
    it('GET /api/stats should return statistics', async function() {
      const res = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(res.body).to.have.property('crawler');
      expect(res.body).to.have.property('metaverse');
      expect(res.body).to.have.property('database');
    });

    it('GET /api/stats/crawler should return crawler stats', async function() {
      const res = await request(app)
        .get('/api/stats/crawler')
        .expect(200);

      expect(res.body).to.have.property('totalSpaceHarvested');
      expect(res.body).to.have.property('sitesAnalyzed');
      expect(res.body).to.have.property('activeCrawlers');
    });
  });

  describe('Metaverse Endpoints', function() {
    it('GET /api/metaverse/infrastructure should return infrastructure stats', async function() {
      const res = await request(app)
        .get('/api/metaverse/infrastructure')
        .expect(200);

      expect(res.body).to.have.property('virtualLand');
      expect(res.body).to.have.property('aiConsensusNodes');
      expect(res.body).to.have.property('storageShards');
    });

    it('GET /api/metaverse/land-parcels should return land parcels', async function() {
      const res = await request(app)
        .get('/api/metaverse/land-parcels')
        .expect(200);

      expect(res.body).to.be.an('array');
    });

    it('GET /api/metaverse/biomes should return biomes', async function() {
      const res = await request(app)
        .get('/api/metaverse/biomes')
        .expect(200);

      expect(res.body).to.be.an('array');
    });
  });

  describe('Search Endpoints', function() {
    it('GET /api/search/domains should search domains', async function() {
      const res = await request(app)
        .get('/api/search/domains')
        .query({ q: 'example.com' })
        .expect(200);

      expect(res.body).to.have.property('results');
      expect(res.body.results).to.be.an('array');
    });

    it('GET /api/search/schemas should search schemas', async function() {
      const res = await request(app)
        .get('/api/search/schemas')
        .query({ type: 'WebPage' })
        .expect(200);

      expect(res.body).to.have.property('results');
      expect(res.body.results).to.be.an('array');
    });
  });

  describe('Admin Endpoints', function() {
    const adminToken = 'test-admin-token';

    beforeEach(function() {
      process.env.ADMIN_TOKEN = adminToken;
    });

    it('POST /api/admin/seed-data should seed test data', async function() {
      const res = await request(app)
        .post('/api/admin/seed-data')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).to.have.property('message');
    });

    it('POST /api/admin/seed-data should reject without auth', async function() {
      await request(app)
        .post('/api/admin/seed-data')
        .expect(403);
    });

    it('POST /api/admin/seed-data should reject with wrong token', async function() {
      await request(app)
        .post('/api/admin/seed-data')
        .set('Authorization', 'Bearer wrong-token')
        .expect(401);
    });
  });

  describe('Metrics Endpoints', function() {
    it('GET /metrics should return Prometheus metrics', async function() {
      const res = await request(app)
        .get('/metrics')
        .expect(200);

      expect(res.text).to.include('crawler_requests_total');
      expect(res.text).to.include('poo_submissions_total');
    });

    it('GET /api/metrics should return JSON metrics', async function() {
      const res = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(res.body).to.have.property('counters');
      expect(res.body).to.have.property('gauges');
      expect(res.body).to.have.property('histograms');
    });
  });

  describe('Error Handling', function() {
    it('Should handle 404 for unknown endpoints', async function() {
      await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);
    });

    it('Should handle malformed JSON', async function() {
      await request(app)
        .post('/api/crawler/start')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});
