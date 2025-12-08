/**
 * TensorFlow Workflow Orchestration API Routes
 *
 * RESTful API for managing workflows, tools, and training data
 */

import { Router } from 'express';
import { NeuralNetworkInstanceManager } from '../../services/NeuralNetworkInstanceManager';
import DeepSeekToolsService from '../../services/ai/DeepSeekToolsService';
import TensorFlowWorkflowOrchestrator from '../../services/ai/TensorFlowWorkflowOrchestrator';
import TrainingDataService from '../../services/ai/TrainingDataService';

/**
 * @param {import('pg').Pool} dbPool
 * @returns {import('express').Router}
 */
export function createTensorFlowWorkflowRoutes(dbPool) {
  const router = Router();

  // Initialize services
  const nnManager = new NeuralNetworkInstanceManager(dbPool);
  const orchestrator = new TensorFlowWorkflowOrchestrator(nnManager);
  const deepseekTools = new DeepSeekToolsService();
  const trainingDataService = new TrainingDataService(dbPool);

  // Initialize async
  Promise.all([
    nnManager.initialize(),
    deepseekTools.initialize(),
    trainingDataService.initialize(),
  ]).catch(console.error);

  // ==================== Workflow Orchestration Routes ====================

  /**
   * GET /api/tensorflow/workflows
   * Get all workflows
   */
  router.get('/workflows', async (req, res) => {
    try {
      const workflows = orchestrator.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error('Error getting workflows:', error);
      res.status(500).json({ error: 'Failed to get workflows' });
    }
  });

  /**
   * GET /api/tensorflow/workflows/:id
   * Get a specific workflow
   */
  router.get('/workflows/:id', async (req, res) => {
    try {
      const workflow = orchestrator.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (error) {
      console.error('Error getting workflow:', error);
      res.status(500).json({ error: 'Failed to get workflow' });
    }
  });

  /**
   * POST /api/tensorflow/workflows/from-prompt
   * Create a workflow from a DeepSeek prompt
   */
  router.post('/workflows/from-prompt', async (req, res) => {
    try {
      const { prompt, context } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const workflow = await orchestrator.createWorkflowFromPrompt(prompt, context);
      res.status(201).json(workflow);
    } catch (error) {
      console.error('Error creating workflow from prompt:', error);
      res.status(500).json({
        error: 'Failed to create workflow from prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/tensorflow/workflows/meta
   * Create the meta-workflow (workflow that creates workflows)
   */
  router.post('/workflows/meta', async (req, res) => {
    try {
      const metaWorkflow = await orchestrator.createWorkflowCreatorWorkflow();
      res.status(201).json(metaWorkflow);
    } catch (error) {
      console.error('Error creating meta-workflow:', error);
      res.status(500).json({ error: 'Failed to create meta-workflow' });
    }
  });

  /**
   * POST /api/tensorflow/workflows/:id/execute
   * Execute a workflow
   */
  router.post('/workflows/:id/execute', async (req, res) => {
    try {
      const { inputs } = req.body;
      const execution = await orchestrator.executeWorkflow(req.params.id, inputs);
      res.json(execution);
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({
        error: 'Failed to execute workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/tensorflow/workflows/executions
   * Get active workflow executions
   */
  router.get('/workflows/executions', async (req, res) => {
    try {
      const executions = orchestrator.getActiveExecutions();
      res.json(executions);
    } catch (error) {
      console.error('Error getting executions:', error);
      res.status(500).json({ error: 'Failed to get executions' });
    }
  });

  // ==================== Service Registry Routes ====================

  /**
   * GET /api/tensorflow/services
   * Get all registered services
   */
  router.get('/services', async (req, res) => {
    try {
      const services = orchestrator.getServiceRegistry();
      res.json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  });

  /**
   * GET /api/tensorflow/services/:id
   * Get a specific service
   */
  router.get('/services/:id', async (req, res) => {
    try {
      const service = orchestrator.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ error: 'Failed to get service' });
    }
  });

  // ==================== DeepSeek Tools Routes ====================

  /**
   * GET /api/tensorflow/tools
   * Get all available DeepSeek tools
   */
  router.get('/tools', async (req, res) => {
    try {
      const tools = deepseekTools.getTools();
      res.json(tools);
    } catch (error) {
      console.error('Error getting tools:', error);
      res.status(500).json({ error: 'Failed to get tools' });
    }
  });

  /**
   * GET /api/tensorflow/tools/:name
   * Get a specific tool
   */
  router.get('/tools/:name', async (req, res) => {
    try {
      const tool = deepseekTools.getTool(req.params.name);
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      console.error('Error getting tool:', error);
      res.status(500).json({ error: 'Failed to get tool' });
    }
  });

  /**
   * POST /api/tensorflow/tools/:name/execute
   * Execute a DeepSeek tool
   */
  router.post('/tools/:name/execute', async (req, res) => {
    try {
      const { args } = req.body;
      const result = await deepseekTools.executeTool(req.params.name, args || {});
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error executing tool:', error);
      res.status(500).json({
        error: 'Failed to execute tool',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ==================== Training Data Routes ====================

  /**
   * GET /api/tensorflow/training-data/configs
   * Get all training data configurations
   */
  router.get('/training-data/configs', async (req, res) => {
    try {
      const configs = trainingDataService.getConfigs();
      res.json(configs);
    } catch (error) {
      console.error('Error getting training data configs:', error);
      res.status(500).json({ error: 'Failed to get training data configs' });
    }
  });

  /**
   * GET /api/tensorflow/training-data/configs/:id
   * Get a specific training data configuration
   */
  router.get('/training-data/configs/:id', async (req, res) => {
    try {
      const config = trainingDataService.getConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.json(config);
    } catch (error) {
      console.error('Error getting training data config:', error);
      res.status(500).json({ error: 'Failed to get training data config' });
    }
  });

  /**
   * POST /api/tensorflow/training-data/configs
   * Create a new training data configuration
   */
  router.post('/training-data/configs', async (req, res) => {
    try {
      const config = await trainingDataService.createConfig(req.body);
      res.status(201).json(config);
    } catch (error) {
      console.error('Error creating training data config:', error);
      res.status(500).json({
        error: 'Failed to create training data config',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/tensorflow/training-data/configs/:id/collect
   * Trigger data collection for a configuration
   */
  router.post('/training-data/configs/:id/collect', async (req, res) => {
    try {
      const result = await trainingDataService.collectData(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error collecting training data:', error);
      res.status(500).json({
        error: 'Failed to collect training data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/tensorflow/training-data/configs/:id/trigger-from-workflow
   * Trigger data collection from a workflow
   */
  router.post('/training-data/configs/:id/trigger-from-workflow', async (req, res) => {
    try {
      const { workflowData } = req.body;
      const result = await trainingDataService.triggerFromWorkflow(
        req.params.id,
        workflowData || {}
      );
      res.json(result);
    } catch (error) {
      console.error('Error triggering from workflow:', error);
      res.status(500).json({
        error: 'Failed to trigger from workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ==================== Utility Routes ====================

  /**
   * GET /api/tensorflow/status
   * Get overall system status
   */
  router.get('/status', async (req, res) => {
    try {
      const status = {
        workflows: {
          total: orchestrator.getWorkflows().length,
          activeExecutions: orchestrator.getActiveExecutions().length,
        },
        services: {
          registered: orchestrator.getServiceRegistry().length,
        },
        tools: {
          available: deepseekTools.getTools().length,
        },
        trainingData: {
          configurations: trainingDataService.getConfigs().length,
          active: trainingDataService.getConfigs().filter(c => c.status === 'active').length,
        },
        timestamp: new Date().toISOString(),
      };

      res.json(status);
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  /**
   * GET /api/tensorflow/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        orchestrator: 'running',
        deepseekTools: 'running',
        trainingDataService: 'running',
      },
    });
  });

  return router;
}

export default createTensorFlowWorkflowRoutes;
