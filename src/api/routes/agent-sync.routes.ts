/**
 * Agent Sync and Learning API Routes
 */

import { Router } from 'express';
import { Pool } from 'pg';
import { AgentSyncService } from '../../services/agent-sync.service';
import { AutoConfigGenerationService } from '../../services/auto-config-generation.service';
import { SelfLearningOrchestrationService } from '../../services/self-learning-orchestration.service';

const router = Router();
const pool = new Pool(); // Configure from environment

const syncService = new AgentSyncService(pool);
const configService = new AutoConfigGenerationService(pool);
const learningService = new SelfLearningOrchestrationService(pool);

// ============================================================================
// SYNCHRONIZATION ENDPOINTS
// ============================================================================

// Create sync channel
router.post('/channels', async (req, res) => {
  try {
    const channel = await syncService.createSyncChannel(req.body);
    res.status(201).json(channel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get sync channel
router.get('/channels/:id', async (req, res) => {
  try {
    const channel = await syncService.getSyncChannel(req.params.id);
    res.json(channel);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Subscribe agent to channel
router.post('/channels/:id/subscribe', async (req, res) => {
  try {
    await syncService.subscribeAgentToChannel(req.body.agent_id, req.params.id);
    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Publish sync event
router.post('/channels/:id/publish', async (req, res) => {
  try {
    const event = await syncService.publishSyncEvent(req.params.id, req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Broadcast to channel
router.post('/channels/:id/broadcast', async (req, res) => {
  try {
    await syncService.broadcastToChannel(req.params.id, req.body);
    res.status(200).json({ message: 'Broadcast successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get agent events
router.get('/agents/:id/events', async (req, res) => {
  try {
    const processed = req.query.processed === 'true';
    const events = await syncService.getAgentEvents(req.params.id, processed);
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get agent state
router.get('/agents/:id/state', async (req, res) => {
  try {
    const state = await syncService.getCurrentState(req.params.id);
    res.json(state);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create state snapshot
router.post('/agents/:id/snapshot', async (req, res) => {
  try {
    const snapshot = await syncService.createStateSnapshot(
      req.params.id,
      req.body.state_data,
      req.body.metadata
    );
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reconcile states
router.post('/agents/:id/reconcile', async (req, res) => {
  try {
    const snapshot = await syncService.reconcileStates(
      req.params.id,
      req.body.strategy,
      req.body.conflict_data
    );
    res.json(snapshot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get sync statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await syncService.getSyncStatistics(req.query.channel_id as string);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// AUTO-CONFIGURATION ENDPOINTS
// ============================================================================

// Generate config from patterns
router.post('/configs/generate', async (req, res) => {
  try {
    const config = await configService.generateConfigFromPatterns(
      req.body.workflow_type,
      req.body.criteria
    );
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test generated config
router.post('/configs/:id/test', async (req, res) => {
  try {
    const result = await configService.testGeneratedConfig(
      req.params.id,
      req.body.test_input
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Improve configuration
router.post('/configs/:id/improve', async (req, res) => {
  try {
    const improved = await configService.improveConfig(
      req.params.id,
      req.body.improvement_criteria
    );
    res.status(201).json(improved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get best configuration
router.get('/configs/best', async (req, res) => {
  try {
    const config = await configService.getBestConfiguration(
      req.query.workflow_type as string,
      {
        metric: req.query.metric as any,
        min_tests: parseInt(req.query.min_tests as string) || 3
      }
    );
    res.json(config);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get config statistics
router.get('/configs/statistics', async (req, res) => {
  try {
    const stats = await configService.getConfigStatistics(req.query.workflow_type as string);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// SELF-LEARNING ENDPOINTS
// ============================================================================

// Start learning session
router.post('/learning/sessions', async (req, res) => {
  try {
    const session = await learningService.startLearningSession(
      req.body.agent_id,
      req.body.config
    );
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// End learning session
router.post('/learning/sessions/:id/end', async (req, res) => {
  try {
    await learningService.endLearningSession(req.params.id, req.body.metrics);
    res.status(200).json({ message: 'Session ended successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Launch research campaign
router.post('/learning/research', async (req, res) => {
  try {
    const campaign = await learningService.launchResearchCampaign(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get research campaign
router.get('/learning/research/:id', async (req, res) => {
  try {
    const campaign = await learningService.getResearchCampaign(req.params.id);
    res.json(campaign);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Mine patterns from campaign
router.post('/learning/patterns/mine', async (req, res) => {
  try {
    const patterns = await learningService.minePatterns(req.body.campaign_id);
    res.status(201).json(patterns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get pattern
router.get('/learning/patterns/:id', async (req, res) => {
  try {
    const pattern = await learningService.getPattern(req.params.id);
    res.json(pattern);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Generate optimization
router.post('/learning/optimize', async (req, res) => {
  try {
    const optimization = await learningService.generateOptimization(
      req.body.pattern_id,
      req.body.config
    );
    res.status(201).json(optimization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Test optimization
router.post('/learning/optimizations/:id/test', async (req, res) => {
  try {
    const result = await learningService.testOptimization(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Apply optimization
router.post('/learning/optimizations/:id/apply', async (req, res) => {
  try {
    await learningService.applyOptimization(req.params.id);
    res.status(200).json({ message: 'Optimization applied successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get optimization metrics
router.get('/learning/metrics/:agent_id', async (req, res) => {
  try {
    const metrics = await learningService.getOptimizationMetrics(req.params.agent_id);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get learning statistics
router.get('/learning/statistics', async (req, res) => {
  try {
    const stats = await learningService.getLearningStatistics();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
