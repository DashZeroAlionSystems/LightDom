/**
 * Agent DeepSeek API Routes
 * RESTful API for managing AI agents with DeepSeek integration
 */

import { Router } from 'express';
import { AgentDeepSeekService } from '../services/agent-deepseek.service.js';

export function createAgentDeepSeekRoutes(dbPool) {
  const router = Router();
  const service = new AgentDeepSeekService(dbPool);

  // ========================================================================
  // AGENT MODES
  // ========================================================================

  // Create agent mode
  router.post('/modes', async (req, res) => {
    try {
      const mode = await service.createAgentMode(req.body);
      res.status(201).json({
        success: true,
        data: mode
      });
    } catch (error) {
      console.error('Create agent mode error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // List agent modes
  router.get('/modes', async (req, res) => {
    try {
      const { mode_type, is_active } = req.query;
      const modes = await service.listAgentModes({
        mode_type,
        is_active: is_active ? is_active === 'true' : undefined
      });
      res.json({
        success: true,
        data: modes
      });
    } catch (error) {
      console.error('List agent modes error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get agent mode
  router.get('/modes/:mode_id', async (req, res) => {
    try {
      const mode = await service.getAgentMode(req.params.mode_id);
      if (!mode) {
        return res.status(404).json({
          success: false,
          error: 'Agent mode not found'
        });
      }
      res.json({
        success: true,
        data: mode
      });
    } catch (error) {
      console.error('Get agent mode error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update agent mode
  router.put('/modes/:mode_id', async (req, res) => {
    try {
      const mode = await service.updateAgentMode(req.params.mode_id, req.body);
      if (!mode) {
        return res.status(404).json({
          success: false,
          error: 'Agent mode not found'
        });
      }
      res.json({
        success: true,
        data: mode
      });
    } catch (error) {
      console.error('Update agent mode error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete agent mode
  router.delete('/modes/:mode_id', async (req, res) => {
    try {
      const deleted = await service.deleteAgentMode(req.params.mode_id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Agent mode not found'
        });
      }
      res.json({
        success: true,
        message: 'Agent mode deleted successfully'
      });
    } catch (error) {
      console.error('Delete agent mode error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // AGENT INSTANCES
  // ========================================================================

  // Create agent instance
  router.post('/agents', async (req, res) => {
    try {
      const agent = await service.createAgentInstance(req.body);
      res.status(201).json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Create agent instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // List agent instances
  router.get('/agents', async (req, res) => {
    try {
      const { mode_id, status } = req.query;
      const agents = await service.listAgentInstances({
        mode_id,
        status
      });
      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      console.error('List agent instances error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get agent instance
  router.get('/agents/:agent_id', async (req, res) => {
    try {
      const agent = await service.getAgentInstance(req.params.agent_id);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Get agent instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update agent instance
  router.put('/agents/:agent_id', async (req, res) => {
    try {
      const agent = await service.updateAgentInstance(req.params.agent_id, req.body);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Update agent instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete agent instance
  router.delete('/agents/:agent_id', async (req, res) => {
    try {
      const deleted = await service.deleteAgentInstance(req.params.agent_id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      res.json({
        success: true,
        message: 'Agent deleted successfully'
      });
    } catch (error) {
      console.error('Delete agent instance error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // AGENT SESSIONS
  // ========================================================================

  // Create session
  router.post('/sessions', async (req, res) => {
    try {
      const session = await service.createSession(req.body);
      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // List sessions
  router.get('/sessions', async (req, res) => {
    try {
      const { agent_id } = req.query;
      const sessions = await service.listSessions(agent_id);
      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('List sessions error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get session
  router.get('/sessions/:session_id', async (req, res) => {
    try {
      const session = await service.getSession(req.params.session_id);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update session
  router.put('/sessions/:session_id', async (req, res) => {
    try {
      const session = await service.updateSession(req.params.session_id, req.body);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // KNOWLEDGE GRAPH
  // ========================================================================

  // Create knowledge node
  router.post('/knowledge/nodes', async (req, res) => {
    try {
      const node = await service.createKnowledgeNode(req.body);
      res.status(201).json({
        success: true,
        data: node
      });
    } catch (error) {
      console.error('Create knowledge node error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get knowledge graph
  router.get('/knowledge/graph', async (req, res) => {
    try {
      const { agent_id, mode_id } = req.query;
      const graph = await service.getKnowledgeGraph(agent_id, mode_id);
      res.json({
        success: true,
        data: graph
      });
    } catch (error) {
      console.error('Get knowledge graph error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // AGENT RULES
  // ========================================================================

  // Create agent rule
  router.post('/rules', async (req, res) => {
    try {
      const rule = await service.createAgentRule(req.body);
      res.status(201).json({
        success: true,
        data: rule
      });
    } catch (error) {
      console.error('Create agent rule error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // List agent rules
  router.get('/rules', async (req, res) => {
    try {
      const { agent_id, mode_id } = req.query;
      const rules = await service.listAgentRules(agent_id, mode_id);
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('List agent rules error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // DEEPSEEK INTEGRATION
  // ========================================================================

  // Execute DeepSeek prompt
  router.post('/deepseek/execute', async (req, res) => {
    try {
      const { agent_id, session_id, prompt_text, template_id } = req.body;

      if (!agent_id || !prompt_text) {
        return res.status(400).json({
          success: false,
          error: 'agent_id and prompt_text are required'
        });
      }

      const result = await service.executeDeepSeekPrompt({
        agent_id,
        session_id,
        prompt_text,
        template_id
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Execute DeepSeek prompt error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========================================================================
  // LEARNING & OPTIMIZATION
  // ========================================================================

  // Record learning event
  router.post('/learning/events', async (req, res) => {
    try {
      await service.recordLearningEvent(req.body);
      res.status(201).json({
        success: true,
        message: 'Learning event recorded'
      });
    } catch (error) {
      console.error('Record learning event error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Record performance metric
  router.post('/performance/metrics', async (req, res) => {
    try {
      await service.recordPerformanceMetric(req.body);
      res.status(201).json({
        success: true,
        message: 'Performance metric recorded'
      });
    } catch (error) {
      console.error('Record performance metric error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createAgentDeepSeekRoutes;
