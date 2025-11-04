/**
 * Pattern Mining and Service Instantiation API Routes
 * API endpoints for GitHub pattern mining, service instantiation, and real-time simulation
 */

import express, { Router, Request, Response } from 'express';
import { GitHubPatternMiningService } from '../../services/github-pattern-mining.js';
import { ServiceInstantiationEngine } from '../../services/service-instantiation-engine.js';
import { DeepSeekPatternTrainingService } from '../../services/deepseek-pattern-training.js';
import { DeepSeekConfigLoader } from '../../config/deepseek-config.js';

const router: Router = express.Router();

// Initialize services
const config = new DeepSeekConfigLoader().getConfig();
const patternMiner = new GitHubPatternMiningService({
  githubToken: process.env.GITHUB_TOKEN,
  deepseekConfig: config,
});
const instantiationEngine = new ServiceInstantiationEngine();
const trainingService = new DeepSeekPatternTrainingService(config);

/**
 * POST /api/pattern-mining/repository/mine
 * Mine patterns from a GitHub repository
 */
router.post('/repository/mine', async (req: Request, res: Response) => {
  try {
    const { owner, repo, branch } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: 'owner and repo are required',
      });
    }

    const result = await patternMiner.mineRepository({ owner, repo, branch });

    res.json({
      success: true,
      result: {
        structure: result.structure,
        patterns: result.patterns.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          confidence: p.confidence,
          frequency: p.frequency,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mine repository',
    });
  }
});

/**
 * POST /api/pattern-mining/template/generate
 * Generate project template from mined patterns
 */
router.post('/template/generate', async (req: Request, res: Response) => {
  try {
    const { name, sourceRepos, options } = req.body;

    if (!name || !sourceRepos || !Array.isArray(sourceRepos)) {
      return res.status(400).json({
        success: false,
        error: 'name and sourceRepos array are required',
      });
    }

    const template = await patternMiner.generateProjectTemplate(
      name,
      sourceRepos,
      options
    );

    res.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        patternCount: template.patterns.length,
        serviceCount: template.services.length,
        confidence: template.metadata.confidence,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate template',
    });
  }
});

/**
 * GET /api/pattern-mining/templates
 * List all generated templates
 */
router.get('/templates', (req: Request, res: Response) => {
  const templates = patternMiner.listTemplates();

  res.json({
    success: true,
    templates: templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      patternCount: t.patterns.length,
      serviceCount: t.services.length,
      confidence: t.metadata.confidence,
    })),
    count: templates.length,
  });
});

/**
 * GET /api/pattern-mining/template/:templateId
 * Get template details
 */
router.get('/template/:templateId', (req: Request, res: Response) => {
  const template = patternMiner.getTemplate(req.params.templateId);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found',
    });
  }

  res.json({
    success: true,
    template,
  });
});

/**
 * POST /api/service-instantiation/instantiate
 * Instantiate a service from configuration
 */
router.post('/instantiate', async (req: Request, res: Response) => {
  try {
    const { serviceConfig } = req.body;

    if (!serviceConfig) {
      return res.status(400).json({
        success: false,
        error: 'serviceConfig is required',
      });
    }

    const instance = await instantiationEngine.instantiateService(serviceConfig);

    res.json({
      success: true,
      instance: {
        id: instance.id,
        name: instance.name,
        type: instance.type,
        status: instance.status,
        dataStreams: Array.from(instance.dataStreams.values()).map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to instantiate service',
    });
  }
});

/**
 * POST /api/service-instantiation/simulate/:instanceId
 * Start real-time simulation for a service instance
 */
router.post('/simulate/:instanceId', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const { duration, dataRate, enableRecording, enableEnrichment } = req.body;

    // Start simulation (non-blocking)
    instantiationEngine.simulateService(instanceId, {
      duration: duration || 60000,
      dataRate: dataRate || 10,
      enableRecording: enableRecording !== false,
      enableEnrichment: enableEnrichment !== false,
      mockData: true,
    });

    res.json({
      success: true,
      message: 'Simulation started',
      instanceId,
      config: {
        duration: duration || 60000,
        dataRate: dataRate || 10,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start simulation',
    });
  }
});

/**
 * POST /api/service-instantiation/simulate/:instanceId/stop
 * Stop simulation for a service instance
 */
router.post('/simulate/:instanceId/stop', (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    instantiationEngine.stopSimulation(instanceId);

    res.json({
      success: true,
      message: 'Simulation stopped',
      instanceId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop simulation',
    });
  }
});

/**
 * POST /api/service-instantiation/bundle
 * Bundle multiple services together
 */
router.post('/bundle', async (req: Request, res: Response) => {
  try {
    const { serviceConfigs, bundleConfig } = req.body;

    if (!serviceConfigs || !Array.isArray(serviceConfigs)) {
      return res.status(400).json({
        success: false,
        error: 'serviceConfigs array is required',
      });
    }

    const bundle = await instantiationEngine.bundleServices(
      serviceConfigs,
      bundleConfig
    );

    res.json({
      success: true,
      bundle: {
        bundleId: bundle.bundleId,
        serviceCount: bundle.services.length,
        streamCount: bundle.dataStreams.length,
        status: bundle.status,
        createdAt: bundle.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bundle',
    });
  }
});

/**
 * GET /api/service-instantiation/bundle/:bundleId/api
 * Get API configuration for a bundled service
 */
router.get('/bundle/:bundleId/api', (req: Request, res: Response) => {
  try {
    const { bundleId } = req.params;
    const apiConfig = instantiationEngine.getBundleAPIConfig(bundleId);

    res.json({
      success: true,
      bundleId,
      apiConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get API config',
    });
  }
});

/**
 * GET /api/service-instantiation/instances
 * List all service instances
 */
router.get('/instances', (req: Request, res: Response) => {
  const instances = instantiationEngine.listInstances();

  res.json({
    success: true,
    instances: instances.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      status: i.status,
      metrics: i.metrics,
    })),
    count: instances.length,
  });
});

/**
 * GET /api/service-instantiation/instance/:instanceId
 * Get instance details
 */
router.get('/instance/:instanceId', (req: Request, res: Response) => {
  const instance = instantiationEngine.getInstance(req.params.instanceId);

  if (!instance) {
    return res.status(404).json({
      success: false,
      error: 'Instance not found',
    });
  }

  res.json({
    success: true,
    instance: {
      ...instance,
      dataStreams: Array.from(instance.dataStreams.values()),
    },
  });
});

/**
 * POST /api/deepseek-training/train-pattern
 * Train DeepSeek on a coding pattern
 */
router.post('/train-pattern', async (req: Request, res: Response) => {
  try {
    const { pattern, context } = req.body;

    if (!pattern) {
      return res.status(400).json({
        success: false,
        error: 'pattern is required',
      });
    }

    await trainingService.trainPattern(pattern, context);

    res.json({
      success: true,
      message: `DeepSeek trained on pattern: ${pattern.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to train pattern',
    });
  }
});

/**
 * POST /api/deepseek-training/train-template
 * Train DeepSeek from a project template
 */
router.post('/train-template/:templateId', async (req: Request, res: Response) => {
  try {
    const template = patternMiner.getTemplate(req.params.templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    await trainingService.trainFromTemplate(template);

    res.json({
      success: true,
      message: `DeepSeek trained from template: ${template.name}`,
      patternCount: template.patterns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to train from template',
    });
  }
});

/**
 * POST /api/deepseek-training/generate-project
 * Generate project using learned patterns
 */
router.post('/generate-project', async (req: Request, res: Response) => {
  try {
    const { projectType, requirements } = req.body;

    if (!projectType || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'projectType and requirements are required',
      });
    }

    const project = await trainingService.generateProject(
      projectType,
      requirements
    );

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate project',
    });
  }
});

/**
 * POST /api/deepseek-training/create-service
 * Create service instance with pattern-based configuration
 */
router.post('/create-service', async (req: Request, res: Response) => {
  try {
    const { serviceType, config } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        error: 'serviceType is required',
      });
    }

    const result = await trainingService.createServiceInstance(
      serviceType,
      config || {}
    );

    res.json({
      success: true,
      instance: result.instance,
      managementConfig: result.managementConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create service',
    });
  }
});

/**
 * POST /api/deepseek-training/simulate-record/:instanceId
 * Simulate and record service data
 */
router.post('/simulate-record/:instanceId', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const { duration } = req.body;

    const recordings = await trainingService.simulateAndRecord(
      instanceId,
      duration || 60000
    );

    res.json({
      success: true,
      instanceId,
      recordingCount: recordings.length,
      recordings: recordings.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to simulate and record',
    });
  }
});

/**
 * GET /api/pattern-mining/health
 * Health check for pattern mining services
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      patternMiner: 'ready',
      instantiationEngine: 'ready',
      trainingService: 'ready',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
