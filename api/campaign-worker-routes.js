/**
 * Campaign Worker and Container API Routes
 * 
 * Provides REST API endpoints for managing campaign workers and containers.
 */

import express from 'express';
import CampaignContainerManager from '../services/campaign-container-manager.js';
import CampaignWebCrawlerWorker from '../services/campaign-web-crawler-worker.js';

const router = express.Router();

// Initialize container manager
const containerManager = new CampaignContainerManager({
  maxContainers: 20,
  maxWorkersPerContainer: 10,
  enableRealTimeAggregation: true,
  enableLLMIntegration: true
});

/**
 * POST /api/workers/containers/create
 * Create a container for a campaign
 */
router.post('/containers/create', async (req, res) => {
  try {
    const { campaignId, config } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        error: 'campaignId is required'
      });
    }

    const container = await containerManager.createContainer(campaignId, config || {});

    res.status(201).json({
      success: true,
      container
    });
  } catch (error) {
    console.error('Create container error:', error);
    res.status(500).json({
      error: 'Failed to create container',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/containers/:containerId/spawn
 * Spawn a worker in a container
 */
router.post('/containers/:containerId/spawn', async (req, res) => {
  try {
    const { containerId } = req.params;
    const { config } = req.body;

    const worker = await containerManager.spawnWorker(containerId, config || {});

    res.status(201).json({
      success: true,
      worker: worker.getStatus()
    });
  } catch (error) {
    console.error('Spawn worker error:', error);
    res.status(500).json({
      error: 'Failed to spawn worker',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/containers/:containerId/start
 * Start a container (starts all workers)
 */
router.post('/containers/:containerId/start', async (req, res) => {
  try {
    const { containerId } = req.params;

    await containerManager.startContainer(containerId);

    res.json({
      success: true,
      message: 'Container started'
    });
  } catch (error) {
    console.error('Start container error:', error);
    res.status(500).json({
      error: 'Failed to start container',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/containers/:containerId/stop
 * Stop a container (stops all workers)
 */
router.post('/containers/:containerId/stop', async (req, res) => {
  try {
    const { containerId } = req.params;

    await containerManager.stopContainer(containerId);

    res.json({
      success: true,
      message: 'Container stopped'
    });
  } catch (error) {
    console.error('Stop container error:', error);
    res.status(500).json({
      error: 'Failed to stop container',
      details: error.message
    });
  }
});

/**
 * GET /api/workers/containers/:containerId/status
 * Get container status
 */
router.get('/containers/:containerId/status', async (req, res) => {
  try {
    const { containerId } = req.params;

    const status = containerManager.getContainerStatus(containerId);

    if (!status) {
      return res.status(404).json({
        error: 'Container not found'
      });
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get container status error:', error);
    res.status(500).json({
      error: 'Failed to get container status',
      details: error.message
    });
  }
});

/**
 * GET /api/workers/containers
 * List all containers
 */
router.get('/containers', async (req, res) => {
  try {
    const containers = containerManager.getAllContainersStatus();

    res.json({
      success: true,
      containers,
      count: containers.length
    });
  } catch (error) {
    console.error('List containers error:', error);
    res.status(500).json({
      error: 'Failed to list containers',
      details: error.message
    });
  }
});

/**
 * GET /api/workers/containers/:containerId/llm-config
 * Get LLM configuration for a container
 */
router.get('/containers/:containerId/llm-config', async (req, res) => {
  try {
    const { containerId } = req.params;

    const llmConfig = containerManager.getLLMConfiguration(containerId);

    res.json({
      success: true,
      llmConfig
    });
  } catch (error) {
    console.error('Get LLM config error:', error);
    res.status(500).json({
      error: 'Failed to get LLM configuration',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/containers/:containerId/config-update
 * Send configuration update to container (two-way communication)
 */
router.post('/containers/:containerId/config-update', async (req, res) => {
  try {
    const { containerId } = req.params;
    const { workerId, update } = req.body;

    const container = containerManager.containers.get(containerId);
    if (!container) {
      return res.status(404).json({
        error: 'Container not found'
      });
    }

    // Send update to specific worker or all workers
    if (workerId) {
      const worker = containerManager.workers.get(workerId);
      if (worker) {
        worker.emit('configUpdate', update);
      }
    } else {
      // Broadcast to all workers in container
      for (const worker of container.workers.values()) {
        worker.emit('configUpdate', update);
      }
    }

    res.json({
      success: true,
      message: 'Configuration update sent'
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({
      error: 'Failed to send configuration update',
      details: error.message
    });
  }
});

/**
 * GET /api/workers/containers/:containerId/data-stream
 * Get aggregated data stream from container (Server-Sent Events)
 */
router.get('/containers/:containerId/data-stream', async (req, res) => {
  try {
    const { containerId } = req.params;

    const container = containerManager.containers.get(containerId);
    if (!container) {
      return res.status(404).json({
        error: 'Container not found'
      });
    }

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Subscribe to aggregated data
    const unsubscribe = containerManager.subscribeToAggregatedData((data, cId) => {
      if (cId === containerId) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    });

    // Cleanup on connection close
    req.on('close', () => {
      unsubscribe();
    });
  } catch (error) {
    console.error('Data stream error:', error);
    res.status(500).json({
      error: 'Failed to setup data stream',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/simulation/create
 * Create simulation environment
 */
router.post('/simulation/create', async (req, res) => {
  try {
    const { campaignId, scenarios } = req.body;

    if (!campaignId || !scenarios) {
      return res.status(400).json({
        error: 'campaignId and scenarios are required'
      });
    }

    const simEnv = await containerManager.createSimulationEnvironment(campaignId, scenarios);

    res.status(201).json({
      success: true,
      simulationEnvironment: simEnv
    });
  } catch (error) {
    console.error('Create simulation error:', error);
    res.status(500).json({
      error: 'Failed to create simulation environment',
      details: error.message
    });
  }
});

/**
 * POST /api/workers/simulation/:envId/run
 * Run simulation
 */
router.post('/simulation/:envId/run', async (req, res) => {
  try {
    const { envId } = req.params;

    const results = await containerManager.runSimulation(envId);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Run simulation error:', error);
    res.status(500).json({
      error: 'Failed to run simulation',
      details: error.message
    });
  }
});

/**
 * DELETE /api/workers/containers/:containerId
 * Destroy a container
 */
router.delete('/containers/:containerId', async (req, res) => {
  try {
    const { containerId } = req.params;

    await containerManager.destroyContainer(containerId);

    res.json({
      success: true,
      message: 'Container destroyed'
    });
  } catch (error) {
    console.error('Destroy container error:', error);
    res.status(500).json({
      error: 'Failed to destroy container',
      details: error.message
    });
  }
});

// Export the container manager instance for use in other modules
export { containerManager };
export default router;
