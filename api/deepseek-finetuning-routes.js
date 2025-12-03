/**
 * DeepSeek Finetuning API Routes
 * 
 * Provides endpoints for managing the 4-phase finetuning pipeline:
 * - Phase 1: Data Infrastructure
 * - Phase 2: Local Training Setup  
 * - Phase 3: Integration
 * - Phase 4: Production Deployment
 * 
 * @module api/deepseek-finetuning-routes
 */

import express from 'express';
import {
  DeepSeekFinetuningPipeline,
  TrainingDataCollectionPipeline,
  DataQualityScorer,
  ToolUseTrainingGenerator,
  ValidationDatasetBuilder,
  QLoRATrainingConfig,
  EvaluationMetrics,
  ModelIntegrationService,
  ModelVersionControl,
  ProductionDeploymentManager,
  ContinuousTrainingPipeline
} from '../services/deepseek-finetuning-pipeline.js';

const router = express.Router();

// Initialize pipeline components
let pipeline = null;
let initialized = false;

async function ensurePipeline(config = {}) {
  if (!pipeline) {
    pipeline = new DeepSeekFinetuningPipeline({
      outputDir: './finetuning_output',
      ...config
    });
    initialized = true;
  }
  return pipeline;
}

/**
 * GET /api/finetuning/status
 * Get overall pipeline status
 */
router.get('/status', async (req, res) => {
  try {
    const p = await ensurePipeline();
    
    res.json({
      success: true,
      data: {
        initialized,
        phases: {
          phase1: 'Data Infrastructure',
          phase2: 'Local Training Setup',
          phase3: 'Integration',
          phase4: 'Production Deployment'
        },
        continuousTraining: p.continuousTraining.getStatus(),
        deployments: p.deploymentManager.listDeployments().length,
        versions: Array.from(p.versionControl.versions.keys()).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Phase 1: Data Infrastructure
// =====================================

/**
 * POST /api/finetuning/phase1/collect
 * Collect training data from sources
 */
router.post('/phase1/collect', async (req, res) => {
  try {
    const { sources } = req.body;

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({
        success: false,
        error: 'Sources array is required'
      });
    }

    const p = await ensurePipeline();
    const result = await p.runPhase1(sources);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase1/score-quality
 * Score training data quality
 */
router.post('/phase1/score-quality', async (req, res) => {
  try {
    const { examples } = req.body;

    if (!examples || !Array.isArray(examples)) {
      return res.status(400).json({
        success: false,
        error: 'Examples array is required'
      });
    }

    const p = await ensurePipeline();
    const report = p.qualityScorer.scoreDataset(examples);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase1/generate-tool-examples
 * Generate tool-use training examples
 */
router.post('/phase1/generate-tool-examples', async (req, res) => {
  try {
    const { outputPath } = req.body;

    const p = await ensurePipeline();
    const examples = await p.toolGenerator.generateDataset(
      outputPath || './finetuning_output/tool_examples.jsonl'
    );

    res.json({
      success: true,
      data: {
        count: examples.length,
        categories: {
          mining: examples.filter(e => 
            e.messages?.some(m => m.tool_calls?.some(t => t.function.name.includes('mine')))
          ).length,
          schema: examples.filter(e =>
            e.messages?.some(m => m.tool_calls?.some(t => t.function.name.includes('Schema')))
          ).length,
          workflow: examples.filter(e =>
            e.messages?.some(m => m.tool_calls?.some(t => t.function.name.includes('Workflow')))
          ).length,
          errorHandling: examples.filter(e =>
            e.messages?.some(m => m.role === 'tool' && m.content?.includes('error'))
          ).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase1/create-validation-split
 * Create train/validation split
 */
router.post('/phase1/create-validation-split', async (req, res) => {
  try {
    const { examples, splitRatio } = req.body;

    if (!examples || !Array.isArray(examples)) {
      return res.status(400).json({
        success: false,
        error: 'Examples array is required'
      });
    }

    const p = await ensurePipeline();
    p.validationBuilder.config.splitRatio = splitRatio || 0.1;
    
    const datasets = p.validationBuilder.createValidationDataset(examples);
    await p.validationBuilder.saveSplitDatasets(
      datasets.train,
      datasets.validation,
      './finetuning_output/datasets'
    );

    res.json({
      success: true,
      data: datasets.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Phase 2: Local Training Setup
// =====================================

/**
 * POST /api/finetuning/phase2/configure
 * Configure QLoRA training
 */
router.post('/phase2/configure', async (req, res) => {
  try {
    const config = req.body;

    const p = await ensurePipeline();
    p.trainingConfig = new QLoRATrainingConfig(config);

    res.json({
      success: true,
      data: {
        config: p.trainingConfig.config
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase2/generate-scripts
 * Generate training scripts
 */
router.post('/phase2/generate-scripts', async (req, res) => {
  try {
    const { outputDir } = req.body;

    const p = await ensurePipeline();
    const result = await p.runPhase2();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase2/training-script
 * Get the generated training script
 */
router.get('/phase2/training-script', async (req, res) => {
  try {
    const p = await ensurePipeline();
    const script = p.trainingConfig.generateTrainingScript();

    res.type('text/plain').send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase2/requirements
 * Get Python requirements
 */
router.get('/phase2/requirements', async (req, res) => {
  try {
    const p = await ensurePipeline();
    const requirements = p.trainingConfig.generateRequirements();

    res.type('text/plain').send(requirements);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Phase 3: Integration
// =====================================

/**
 * POST /api/finetuning/phase3/register-model
 * Register a trained model
 */
router.post('/phase3/register-model', async (req, res) => {
  try {
    const { name, version, metadata } = req.body;

    if (!name || !version) {
      return res.status(400).json({
        success: false,
        error: 'Model name and version are required'
      });
    }

    const p = await ensurePipeline();
    const versionInfo = await p.versionControl.registerVersion(name, version, metadata || {});
    p.modelIntegration.registerModel(`${name}@${version}`, { name, version, metadata });

    res.json({
      success: true,
      data: versionInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase3/models
 * List all registered models
 */
router.get('/phase3/models', async (req, res) => {
  try {
    const p = await ensurePipeline();
    const models = Array.from(p.modelIntegration.models.values());

    res.json({
      success: true,
      data: {
        models,
        total: models.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase3/versions/:modelName
 * List versions for a model
 */
router.get('/phase3/versions/:modelName', async (req, res) => {
  try {
    const { modelName } = req.params;

    const p = await ensurePipeline();
    const versions = p.versionControl.listVersions(modelName);

    res.json({
      success: true,
      data: {
        modelName,
        versions,
        latest: p.versionControl.getLatestVersion(modelName)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase3/ab-test
 * Create A/B test
 */
router.post('/phase3/ab-test', async (req, res) => {
  try {
    const { testId, modelA, modelB, trafficSplit } = req.body;

    if (!testId || !modelA || !modelB) {
      return res.status(400).json({
        success: false,
        error: 'testId, modelA, and modelB are required'
      });
    }

    const p = await ensurePipeline();
    const test = p.modelIntegration.createABTest(testId, {
      modelA,
      modelB,
      trafficSplit: trafficSplit || 0.5
    });

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase3/ab-test/:testId
 * Get A/B test results
 */
router.get('/phase3/ab-test/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const p = await ensurePipeline();
    const results = p.modelIntegration.getABTestResults(testId);

    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'A/B test not found'
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase3/ab-test/:testId/record
 * Record A/B test result
 */
router.post('/phase3/ab-test/:testId/record', async (req, res) => {
  try {
    const { testId } = req.params;
    const { modelId, success, latency } = req.body;

    const p = await ensurePipeline();
    p.modelIntegration.recordResult(testId, modelId, success, latency);

    res.json({
      success: true,
      data: { recorded: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Phase 4: Production Deployment
// =====================================

/**
 * POST /api/finetuning/phase4/deploy
 * Deploy model to production
 */
router.post('/phase4/deploy', async (req, res) => {
  try {
    const { modelId, config } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        error: 'modelId is required'
      });
    }

    const p = await ensurePipeline();
    const deployment = await p.deploymentManager.deploy(modelId, config || {});

    // Promote to production
    const [name, version] = modelId.split('@');
    if (name && version) {
      try {
        await p.versionControl.promoteToProduction(name, version);
      } catch (e) {
        // Version might not exist, continue anyway
      }
    }

    res.json({
      success: true,
      data: deployment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase4/deployments
 * List all deployments
 */
router.get('/phase4/deployments', async (req, res) => {
  try {
    const p = await ensurePipeline();
    const deployments = p.deploymentManager.listDeployments();

    res.json({
      success: true,
      data: {
        deployments,
        total: deployments.length,
        healthy: deployments.filter(d => d.health === 'healthy').length,
        unhealthy: deployments.filter(d => d.health === 'unhealthy').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/phase4/deployments/:deploymentId
 * Get deployment status
 */
router.get('/phase4/deployments/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;

    const p = await ensurePipeline();
    const deployment = p.deploymentManager.getDeploymentStatus(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      data: deployment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/phase4/rollback/:deploymentId
 * Rollback a deployment
 */
router.post('/phase4/rollback/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;

    const p = await ensurePipeline();
    const deployment = await p.deploymentManager.rollback(deploymentId);

    res.json({
      success: true,
      data: deployment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Continuous Training
// =====================================

/**
 * POST /api/finetuning/continuous/add-example
 * Add new training example for continuous learning
 */
router.post('/continuous/add-example', async (req, res) => {
  try {
    const { example } = req.body;

    if (!example) {
      return res.status(400).json({
        success: false,
        error: 'Example is required'
      });
    }

    const p = await ensurePipeline();
    p.continuousTraining.addExample(example);

    res.json({
      success: true,
      data: p.continuousTraining.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/finetuning/continuous/status
 * Get continuous training status
 */
router.get('/continuous/status', async (req, res) => {
  try {
    const p = await ensurePipeline();

    res.json({
      success: true,
      data: p.continuousTraining.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/finetuning/continuous/trigger
 * Manually trigger training
 */
router.post('/continuous/trigger', async (req, res) => {
  try {
    const p = await ensurePipeline();
    const result = await p.continuousTraining.triggerTraining();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================
// Full Pipeline Execution
// =====================================

/**
 * POST /api/finetuning/run-pipeline
 * Run the complete finetuning pipeline
 */
router.post('/run-pipeline', async (req, res) => {
  try {
    const config = req.body;

    const p = await ensurePipeline();
    const results = await p.runCompletePipeline(config);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
