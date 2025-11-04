/**
 * DeepSeek System Integration Tests
 * Comprehensive test suite for all system components
 */

const { DeepSeekSystemIntegrator } = require('./src/services/deepseek-system-integrator');

// Mock environment for testing
process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'test-key';
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-github-token';

describe('DeepSeek System Integration', () => {
  let integrator;

  beforeEach(() => {
    integrator = new DeepSeekSystemIntegrator({
      githubToken: process.env.GITHUB_TOKEN,
      enableAutoTraining: false, // Disable for tests
      enableAutoAPI: true,
      enableRouteHistory: true
    });
  });

  describe('System Health', () => {
    test('should return system health status', () => {
      const health = integrator.getSystemHealth();
      
      expect(health).toHaveProperty('services');
      expect(health).toHaveProperty('config');
      expect(health.services.orchestrator).toBe(true);
      expect(health.services.schemaGenerator).toBe(true);
    });

    test('should indicate enabled features', () => {
      const health = integrator.getSystemHealth();
      
      expect(health.config.autoAPIEnabled).toBe(true);
      expect(health.config.routeHistoryEnabled).toBe(true);
    });
  });

  describe('Workflow Creation', () => {
    test('should create workflow from natural language', async () => {
      const description = 'Test workflow: fetch data, process, save';
      
      const result = await integrator.createAndDeployWorkflow(description, {
        generateSchema: false,
        createN8N: false,
        trackRoutes: false
      });

      expect(result).toHaveProperty('workflow');
      expect(result.workflow).toHaveProperty('id');
      expect(result.workflow).toHaveProperty('tasks');
      expect(result.workflow.tasks.length).toBeGreaterThan(0);
    });

    test('should generate schemas when requested', async () => {
      const description = 'Workflow with User and Product entities';
      
      const result = await integrator.createAndDeployWorkflow(description, {
        generateSchema: true,
        createN8N: false,
        trackRoutes: false
      });

      expect(result).toHaveProperty('schemas');
      expect(Array.isArray(result.schemas)).toBe(true);
    });
  });

  describe('Schema Generation', () => {
    test('should generate complete API from description', async () => {
      const description = 'Blog with User and Post entities';
      
      const result = await integrator.generateCompleteAPI(description, 'blog-api');

      expect(result).toHaveProperty('schemas');
      expect(result).toHaveProperty('schemaMap');
      expect(result).toHaveProperty('api');
      expect(result).toHaveProperty('bundle');
      expect(result.bundle.name).toBe('blog-api');
    });

    test('should extract entities from description', async () => {
      const description = 'E-commerce with User, Product, and Order';
      
      const result = await integrator.generateCompleteAPI(description, 'shop-api');

      expect(result.schemas.length).toBeGreaterThan(0);
    });
  });

  describe('GitHub Pattern Mining', () => {
    test('should learn patterns from GitHub repos', async () => {
      if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'test-github-token') {
        console.log('Skipping GitHub test - no token');
        return;
      }

      const repos = [{ owner: 'facebook', repo: 'react' }];
      const result = await integrator.learnFromGitHub(repos, 'react-app');

      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('template');
      expect(result).toHaveProperty('project');
    });
  });

  describe('SEO Campaign', () => {
    test('should create SEO campaign workflow', async () => {
      const result = await integrator.runSEOCampaign(
        'https://test.example.com',
        ['test', 'keywords']
      );

      expect(result).toHaveProperty('workflow');
      expect(result).toHaveProperty('schemas');
      expect(result).toHaveProperty('execution');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('should generate SEO recommendations', async () => {
      const result = await integrator.runSEOCampaign(
        'https://test.example.com',
        ['seo']
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Service Simulation', () => {
    test('should simulate service with data streams', async () => {
      if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'test-github-token') {
        console.log('Skipping simulation test - no token');
        return;
      }

      const config = {
        name: 'Test Service',
        type: 'rest-api',
        dataStreams: [{
          source: 'client',
          destination: 'server'
        }]
      };

      const result = await integrator.simulateService(config, 5000);

      expect(result).toHaveProperty('instance');
      expect(result).toHaveProperty('data');
      expect(result.instance.name).toBe('Test Service');
    });
  });

  describe('Batch Operations', () => {
    test('should handle multiple workflows', async () => {
      const workflows = [
        { description: 'Workflow 1', options: {} },
        { description: 'Workflow 2', options: {} }
      ];

      const results = [];
      for (const wf of workflows) {
        const result = await integrator.createAndDeployWorkflow(
          wf.description,
          wf.options
        );
        results.push(result);
      }

      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result).toHaveProperty('workflow');
      });
    });
  });

  describe('State Management', () => {
    test('should save workflow state', async () => {
      const result = await integrator.createAndDeployWorkflow(
        'Test workflow for state',
        {}
      );

      expect(result).toHaveProperty('state');
    });
  });

  describe('Analytics', () => {
    test('should provide workflow analytics', () => {
      const workflows = integrator.getWorkflows();
      
      expect(Array.isArray(workflows)).toBe(true);
    });

    test('should provide schema analytics', () => {
      const schemas = integrator.getSchemas();
      
      expect(Array.isArray(schemas)).toBe(true);
    });
  });
});

describe('Integration API Routes', () => {
  const request = require('supertest');
  const express = require('express');
  const systemRoutes = require('./src/api/routes/system-integration.routes').default;

  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/integration', systemRoutes);
  });

  describe('GET /health', () => {
    test('should return system health', async () => {
      const response = await request(app).get('/api/integration/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('config');
    });
  });

  describe('POST /workflow/create-and-deploy', () => {
    test('should create workflow', async () => {
      const response = await request(app)
        .post('/api/integration/workflow/create-and-deploy')
        .send({ description: 'Test workflow' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('workflow');
    });

    test('should require description', async () => {
      const response = await request(app)
        .post('/api/integration/workflow/create-and-deploy')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/generate', () => {
    test('should generate API', async () => {
      const response = await request(app)
        .post('/api/integration/api/generate')
        .send({
          schemaDescription: 'Test API',
          bundleName: 'test-api'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bundle');
    });
  });

  describe('POST /seo/campaign', () => {
    test('should create SEO campaign', async () => {
      const response = await request(app)
        .post('/api/integration/seo/campaign')
        .send({
          targetUrl: 'https://test.com',
          keywords: ['test']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('workflow');
      expect(response.body).toHaveProperty('recommendations');
    });
  });

  describe('GET /analytics/workflows', () => {
    test('should return workflow analytics', async () => {
      const response = await request(app).get('/api/integration/analytics/workflows');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
    });
  });

  describe('POST /quick/ecommerce-setup', () => {
    test('should setup e-commerce project', async () => {
      const response = await request(app)
        .post('/api/integration/quick/ecommerce-setup')
        .send({
          shopName: 'test-shop',
          targetUrl: 'https://test-shop.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('api');
      expect(response.body).toHaveProperty('seo');
      expect(response.body).toHaveProperty('workflow');
    });
  });
});

// Run tests
if (require.main === module) {
  console.log('Running DeepSeek System Integration Tests...\n');
  
  // Run tests using Jest or similar
  // For demo purposes, just log
  console.log('Test suite configured. Run with: npm test');
}

module.exports = {
  // Export for use with test runners
};
