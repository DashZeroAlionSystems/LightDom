/**
 * Enhanced Agent Session API Routes
 * Extended endpoints for knowledge graph-aware agent orchestration
 */

import express, { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { EnhancedAgentOrchestratorService } from '../../services/enhanced-agent-orchestrator.service';
import {
  CreateEnhancedAgentRequest,
  DelegateTaskRequest,
  AgentSelectionRequest,
  UpdateKnowledgeContextRequest
} from '../../types/enhanced-agent-session';

export function createEnhancedAgentSessionRoutes(db: Pool): Router {
  const router = express.Router();
  const orchestrator = new EnhancedAgentOrchestratorService(db);

  // ============================================================================
  // ENHANCED AGENT CREATION
  // ============================================================================

  /**
   * POST /api/agent/enhanced/create
   * Create an enhanced agent with knowledge graph context
   */
  router.post('/enhanced/create', async (req: Request, res: Response) => {
    try {
      const request: CreateEnhancedAgentRequest = req.body;
      
      // Validate required fields
      if (!request.name || !request.session_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, session_id' 
        });
      }

      const agent = await orchestrator.createEnhancedAgent(request);
      res.status(201).json(agent);
    } catch (error) {
      console.error('Error creating enhanced agent:', error);
      res.status(500).json({ error: 'Failed to create enhanced agent' });
    }
  });

  // ============================================================================
  // KNOWLEDGE CONTEXT MANAGEMENT
  // ============================================================================

  /**
   * GET /api/agent/enhanced/:agent_id/knowledge-context
   * Get agent's knowledge graph context
   */
  router.get('/enhanced/:agent_id/knowledge-context', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT akc.*, 
               json_agg(kgs.*) as sections
        FROM agent_knowledge_contexts akc
        LEFT JOIN knowledge_graph_sections kgs ON kgs.section_id = ANY(
          SELECT jsonb_array_elements_text(akc.section_ids::jsonb)::text
        )
        WHERE akc.agent_instance_id = $1
        GROUP BY akc.context_id, akc.agent_instance_id, akc.section_ids, 
                 akc.included_patterns, akc.excluded_patterns, akc.focus_areas,
                 akc.created_at, akc.updated_at
      `;
      
      const result = await db.query(query, [req.params.agent_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Knowledge context not found' });
      }

      const context = result.rows[0];
      res.json({
        context_id: context.context_id,
        agent_instance_id: context.agent_instance_id,
        knowledge_sections: context.sections || [],
        included_patterns: JSON.parse(context.included_patterns || '[]'),
        excluded_patterns: JSON.parse(context.excluded_patterns || '[]'),
        focus_areas: JSON.parse(context.focus_areas || '[]'),
        created_at: context.created_at,
        updated_at: context.updated_at
      });
    } catch (error) {
      console.error('Error getting knowledge context:', error);
      res.status(500).json({ error: 'Failed to get knowledge context' });
    }
  });

  /**
   * PATCH /api/agent/enhanced/:agent_id/knowledge-context
   * Update agent's knowledge graph context
   */
  router.patch('/enhanced/:agent_id/knowledge-context', async (req: Request, res: Response) => {
    try {
      const request: UpdateKnowledgeContextRequest = {
        agent_instance_id: req.params.agent_id,
        ...req.body
      };

      const updatedContext = await orchestrator.updateKnowledgeContext(request);
      res.json(updatedContext);
    } catch (error) {
      console.error('Error updating knowledge context:', error);
      res.status(500).json({ error: 'Failed to update knowledge context' });
    }
  });

  // ============================================================================
  // AGENT SELECTION & ORCHESTRATION
  // ============================================================================

  /**
   * POST /api/agent/enhanced/select
   * Select best agents for a task using DeepSeek orchestration
   */
  router.post('/enhanced/select', async (req: Request, res: Response) => {
    try {
      const request: AgentSelectionRequest = req.body;
      
      if (!request.session_id || !request.task_description) {
        return res.status(400).json({ 
          error: 'Missing required fields: session_id, task_description' 
        });
      }

      const selection = await orchestrator.selectAgentsForTask(request);
      res.json(selection);
    } catch (error) {
      console.error('Error selecting agents:', error);
      res.status(500).json({ error: 'Failed to select agents' });
    }
  });

  /**
   * POST /api/agent/enhanced/delegate
   * Delegate a task from orchestrator to specialized agent
   */
  router.post('/enhanced/delegate', async (req: Request, res: Response) => {
    try {
      const request: DelegateTaskRequest = req.body;
      
      if (!request.orchestrator_instance_id || !request.task_description) {
        return res.status(400).json({ 
          error: 'Missing required fields: orchestrator_instance_id, task_description' 
        });
      }

      const prompt = await orchestrator.delegateTask(request);
      res.json(prompt);
    } catch (error) {
      console.error('Error delegating task:', error);
      res.status(500).json({ error: 'Failed to delegate task' });
    }
  });

  /**
   * POST /api/agent/enhanced/:agent_id/generate-prompt
   * Generate a context-aware prompt for an agent
   */
  router.post('/enhanced/:agent_id/generate-prompt', async (req: Request, res: Response) => {
    try {
      const { orchestrator_id, task_description, context_data } = req.body;
      
      if (!orchestrator_id || !task_description) {
        return res.status(400).json({ 
          error: 'Missing required fields: orchestrator_id, task_description' 
        });
      }

      const prompt = await orchestrator.generatePromptForAgent(
        orchestrator_id,
        req.params.agent_id,
        task_description,
        context_data
      );
      
      res.json(prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      res.status(500).json({ error: 'Failed to generate prompt' });
    }
  });

  // ============================================================================
  // DECISION CONTEXT & HISTORY
  // ============================================================================

  /**
   * GET /api/agent/enhanced/sessions/:session_id/decisions
   * Get decision history for a session
   */
  router.get('/enhanced/sessions/:session_id/decisions', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT * FROM agent_decision_contexts 
        WHERE session_id = $1 
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      
      const result = await db.query(query, [req.params.session_id]);
      
      const decisions = result.rows.map(row => ({
        ...row,
        available_agents: JSON.parse(row.available_agents),
        selected_agents: JSON.parse(row.selected_agents),
        excluded_agents: JSON.parse(row.excluded_agents)
      }));

      res.json(decisions);
    } catch (error) {
      console.error('Error getting decision history:', error);
      res.status(500).json({ error: 'Failed to get decision history' });
    }
  });

  // ============================================================================
  // KNOWLEDGE GRAPH SECTIONS
  // ============================================================================

  /**
   * GET /api/agent/enhanced/knowledge-sections
   * List available knowledge graph sections
   */
  router.get('/enhanced/knowledge-sections', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT * FROM knowledge_graph_sections 
        ORDER BY name ASC
      `;
      
      const result = await db.query(query);
      
      const sections = result.rows.map(row => ({
        ...row,
        nodes: JSON.parse(row.nodes || '[]'),
        relationships: JSON.parse(row.relationships || '[]'),
        entry_points: JSON.parse(row.entry_points || '[]')
      }));

      res.json(sections);
    } catch (error) {
      console.error('Error getting knowledge sections:', error);
      res.status(500).json({ error: 'Failed to get knowledge sections' });
    }
  });

  /**
   * POST /api/agent/enhanced/knowledge-sections
   * Create a new knowledge graph section
   */
  router.post('/enhanced/knowledge-sections', async (req: Request, res: Response) => {
    try {
      const { name, description, nodes, relationships, entry_points } = req.body;
      
      if (!name || !nodes) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, nodes' 
        });
      }

      const query = `
        INSERT INTO knowledge_graph_sections (
          name, description, nodes, relationships, entry_points, coverage_score
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const coverageScore = 0.5; // TODO: Calculate based on actual codebase
      
      const result = await db.query(query, [
        name,
        description || null,
        JSON.stringify(nodes),
        JSON.stringify(relationships || []),
        JSON.stringify(entry_points || []),
        coverageScore
      ]);

      const section = result.rows[0];
      res.status(201).json({
        ...section,
        nodes: JSON.parse(section.nodes),
        relationships: JSON.parse(section.relationships),
        entry_points: JSON.parse(section.entry_points)
      });
    } catch (error) {
      console.error('Error creating knowledge section:', error);
      res.status(500).json({ error: 'Failed to create knowledge section' });
    }
  });

  // ============================================================================
  // REPOSITORIES
  // ============================================================================

  /**
   * GET /api/agent/enhanced/repositories
   * List available repositories
   */
  router.get('/enhanced/repositories', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT * FROM repositories 
        ORDER BY repo_name ASC
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting repositories:', error);
      res.status(500).json({ error: 'Failed to get repositories' });
    }
  });

  /**
   * GET /api/agent/enhanced/:agent_id/repositories
   * Get repositories assigned to an agent
   */
  router.get('/enhanced/:agent_id/repositories', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT r.*, ara.access_level, ara.assigned_at
        FROM repositories r
        JOIN agent_repository_assignments ara ON r.repo_id = ara.repo_id
        WHERE ara.agent_instance_id = $1
        ORDER BY ara.assigned_at DESC
      `;
      
      const result = await db.query(query, [req.params.agent_id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting agent repositories:', error);
      res.status(500).json({ error: 'Failed to get agent repositories' });
    }
  });

  /**
   * POST /api/agent/enhanced/:agent_id/repositories
   * Assign repository to an agent
   */
  router.post('/enhanced/:agent_id/repositories', async (req: Request, res: Response) => {
    try {
      const { repo_id, access_level } = req.body;
      
      if (!repo_id) {
        return res.status(400).json({ error: 'Missing required field: repo_id' });
      }

      const query = `
        INSERT INTO agent_repository_assignments (
          agent_instance_id, repo_id, access_level, assigned_at
        ) VALUES ($1, $2, $3, NOW())
        ON CONFLICT (agent_instance_id, repo_id) 
        DO UPDATE SET access_level = $3, assigned_at = NOW()
        RETURNING *
      `;
      
      const result = await db.query(query, [
        req.params.agent_id,
        repo_id,
        access_level || 'read_write'
      ]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error assigning repository:', error);
      res.status(500).json({ error: 'Failed to assign repository' });
    }
  });

  // ============================================================================
  // AGENT SPECIALIZATIONS
  // ============================================================================

  /**
   * GET /api/agent/enhanced/specializations
   * List available agent specializations
   */
  router.get('/enhanced/specializations', async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT * FROM agent_specializations 
        ORDER BY name ASC
      `;
      
      const result = await db.query(query);
      
      const specializations = result.rows.map(row => ({
        ...row,
        required_capabilities: JSON.parse(row.required_capabilities || '[]'),
        knowledge_focus: JSON.parse(row.knowledge_focus || '[]'),
        prompt_templates: JSON.parse(row.prompt_templates || '[]')
      }));

      res.json(specializations);
    } catch (error) {
      console.error('Error getting specializations:', error);
      res.status(500).json({ error: 'Failed to get specializations' });
    }
  });

  return router;
}
