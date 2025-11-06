/**
 * DeepSeek System Integration Routes
 * Unified API for all DeepSeek system components
 */

import express from 'express';
import { DeepSeekSystemIntegrator } from '../services/deepseek-system-integrator';

const router = express.Router();

// Initialize integrator with environment config
const integrator = new DeepSeekSystemIntegrator({
  githubToken: process.env.GITHUB_TOKEN,
  n8nApiUrl: process.env.N8N_API_URL,
  n8nApiKey: process.env.N8N_API_KEY,
  repoPath: process.cwd(),
  enableAutoTraining: process.env.ENABLE_AUTO_TRAINING === 'true',
  enableAutoAPI: process.env.ENABLE_AUTO_API === 'true',
  enableRouteHistory: process.env.ENABLE_ROUTE_HISTORY === 'true'
});

/**
 * System Health and Status
 */
router.get('/health', async (req, res) => {
  try {
    const health = integrator.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/workflows', async (req, res) => {
  try {
    const workflows = integrator.getWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/schemas', async (req, res) => {
  try {
    const schemas = integrator.getSchemas();
    res.json(schemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * End-to-End Workflow Creation
 */
router.post('/workflow/create-and-deploy', async (req, res) => {
  try {
    const { description, options } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await integrator.createAndDeployWorkflow(description, options || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GitHub Pattern Learning
 */
router.post('/learn-from-github', async (req, res) => {
  try {
    const { repos, projectType } = req.body;

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({ error: 'Repos array is required' });
    }

    if (!projectType) {
      return res.status(400).json({ error: 'Project type is required' });
    }

    const result = await integrator.learnFromGitHub(repos, projectType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete API Generation
 */
router.post('/api/generate', async (req, res) => {
  try {
    const { schemaDescription, bundleName } = req.body;

    if (!schemaDescription) {
      return res.status(400).json({ error: 'Schema description is required' });
    }

    if (!bundleName) {
      return res.status(400).json({ error: 'Bundle name is required' });
    }

    const result = await integrator.generateCompleteAPI(schemaDescription, bundleName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * SEO Campaign
 */
router.post('/seo/campaign', async (req, res) => {
  try {
    const { targetUrl, keywords } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    const result = await integrator.runSEOCampaign(targetUrl, keywords);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Service Simulation
 */
router.post('/service/simulate', async (req, res) => {
  try {
    const { serviceConfig, duration } = req.body;

    if (!serviceConfig) {
      return res.status(400).json({ error: 'Service config is required' });
    }

    const result = await integrator.simulateService(
      serviceConfig,
      duration || 60000
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete Project Lifecycle
 */
router.post('/project/complete-lifecycle', async (req, res) => {
  try {
    const { repos, projectType, apiDescription, deploymentWorkflow } = req.body;

    const results: any = {};

    // 1. Learn from repos if provided
    if (repos && Array.isArray(repos) && repos.length > 0) {
      results.patterns = await integrator.learnFromGitHub(repos, projectType || 'web-app');
    }

    // 2. Generate API if description provided
    if (apiDescription) {
      results.api = await integrator.generateCompleteAPI(
        apiDescription,
        `${projectType || 'app'}-api`
      );
    }

    // 3. Create deployment workflow if requested
    if (deploymentWorkflow) {
      results.deployment = await integrator.createAndDeployWorkflow(
        deploymentWorkflow,
        { createN8N: true, trackRoutes: true }
      );
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Batch Operations
 */
router.post('/batch/generate-schemas', async (req, res) => {
  try {
    const { descriptions } = req.body;

    if (!descriptions || !Array.isArray(descriptions)) {
      return res.status(400).json({ error: 'Descriptions array is required' });
    }

    const results = [];
    for (const desc of descriptions) {
      const schema = await integrator.generateCompleteAPI(desc, `schema-${Date.now()}`);
      results.push(schema);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/batch/execute-workflows', async (req, res) => {
  try {
    const { workflows } = req.body;

    if (!workflows || !Array.isArray(workflows)) {
      return res.status(400).json({ error: 'Workflows array is required' });
    }

    const results = [];
    for (const workflow of workflows) {
      const result = await integrator.createAndDeployWorkflow(
        workflow.description,
        workflow.options || {}
      );
      results.push(result);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analytics and Insights
 */
router.get('/analytics/workflows', async (req, res) => {
  try {
    const workflows = integrator.getWorkflows();
    const analytics = {
      total: workflows.length,
      byStatus: {},
      averageTaskCount: 0,
      totalExecutions: 0
    };

    workflows.forEach((w: any) => {
      analytics.byStatus[w.status] = (analytics.byStatus[w.status] || 0) + 1;
      analytics.averageTaskCount += (w.tasks?.length || 0);
      analytics.totalExecutions += (w.executions?.length || 0);
    });

    analytics.averageTaskCount = Math.round(analytics.averageTaskCount / workflows.length) || 0;

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/schemas', async (req, res) => {
  try {
    const schemas = integrator.getSchemas();
    const analytics = {
      total: schemas.length,
      byType: {},
      totalProperties: 0,
      totalRelationships: 0
    };

    schemas.forEach((s: any) => {
      analytics.byType[s.type] = (analytics.byType[s.type] || 0) + 1;
      analytics.totalProperties += Object.keys(s.properties || {}).length;
      analytics.totalRelationships += (s.relationships?.length || 0);
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Quick Actions
 */
router.post('/quick/ecommerce-setup', async (req, res) => {
  try {
    const { shopName, targetUrl } = req.body;

    // 1. Generate e-commerce API
    const api = await integrator.generateCompleteAPI(
      'E-commerce with User, Product, Order, Payment, Cart',
      `${shopName}-api`
    );

    // 2. Create SEO campaign
    const seo = await integrator.runSEOCampaign(
      targetUrl || `https://${shopName}.example.com`,
      ['ecommerce', 'online shopping', 'products']
    );

    // 3. Create data workflow
    const workflow = await integrator.createAndDeployWorkflow(
      'E-commerce workflow: sync inventory, process orders, send notifications',
      { createN8N: true }
    );

    res.json({ api, seo, workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quick/blog-setup', async (req, res) => {
  try {
    const { blogName, targetUrl } = req.body;

    // 1. Generate blog API
    const api = await integrator.generateCompleteAPI(
      'Blog with User, Post, Comment, Tag, Category',
      `${blogName}-api`
    );

    // 2. Create content workflow
    const workflow = await integrator.createAndDeployWorkflow(
      'Content workflow: draft post, review, publish, promote',
      { createN8N: true, trackRoutes: true }
    );

    // 3. SEO optimization
    const seo = await integrator.runSEOCampaign(
      targetUrl || `https://${blogName}.example.com`,
      ['blogging', 'content', 'writing']
    );

    res.json({ api, workflow, seo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
