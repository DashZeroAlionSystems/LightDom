/**
 * Enhanced Agent Orchestration Service
 * Manages DeepSeek-powered agent orchestration with knowledge graph awareness
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { DeepSeekIntegrationService } from './deepseek-integration.service';
import {
  EnhancedAgentInstance,
  AgentKnowledgeContext,
  KnowledgeGraphSection,
  AgentDecisionContext,
  AgentCapability,
  GeneratedPrompt,
  DeepSeekOrchestrationConfig,
  DelegationRule,
  AgentNavigationRule,
  CreateEnhancedAgentRequest,
  DelegateTaskRequest,
  AgentSelectionRequest,
  AgentSelectionResponse,
  UpdateKnowledgeContextRequest
} from '../types/enhanced-agent-session';
import { AgentInstance } from '../types/agent-management';

export class EnhancedAgentOrchestratorService {
  private deepseek: DeepSeekIntegrationService;

  constructor(private db: Pool) {
    this.deepseek = new DeepSeekIntegrationService(db);
  }

  // ============================================================================
  // AGENT CREATION WITH KNOWLEDGE GRAPH
  // ============================================================================

  async createEnhancedAgent(request: CreateEnhancedAgentRequest): Promise<EnhancedAgentInstance> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Create base agent instance
      const instanceQuery = `
        INSERT INTO agent_instances (
          session_id, name, model_name, fine_tuned, 
          max_tokens, temperature, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const metadata = {
        specialization: request.specialization,
        capabilities: request.capabilities || [],
        delegation_enabled: request.delegation_enabled ?? true,
        auto_prompt_generation: request.auto_prompt_generation ?? true
      };

      const instanceResult = await client.query(instanceQuery, [
        request.session_id,
        request.name,
        request.model_name || 'deepseek-coder',
        request.fine_tune_before_start || false,
        4096,
        0.7,
        'initializing',
        JSON.stringify(metadata)
      ]);

      const instance = instanceResult.rows[0];

      // Create knowledge context if sections provided
      if (request.knowledge_graph_sections && request.knowledge_graph_sections.length > 0) {
        await this.createKnowledgeContext(
          instance.instance_id,
          request.knowledge_graph_sections,
          client
        );
      }

      // Assign repositories
      if (request.repository_ids && request.repository_ids.length > 0) {
        await this.assignRepositories(
          instance.instance_id,
          request.repository_ids,
          client
        );
      }

      // Fine-tune if requested
      if (request.fine_tune_before_start) {
        await this.queueFineTuneJob(instance.instance_id, client);
      } else {
        // Mark as ready immediately
        await client.query(
          'UPDATE agent_instances SET status = $1 WHERE instance_id = $2',
          ['ready', instance.instance_id]
        );
      }

      await client.query('COMMIT');

      return {
        ...instance,
        specialization: request.specialization,
        capabilities: request.capabilities,
        delegation_enabled: request.delegation_enabled ?? true,
        auto_prompt_generation: request.auto_prompt_generation ?? true
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // KNOWLEDGE GRAPH CONTEXT MANAGEMENT
  // ============================================================================

  async createKnowledgeContext(
    agentInstanceId: string,
    sectionIds: string[],
    client?: any
  ): Promise<AgentKnowledgeContext> {
    const conn = client || this.db;
    
    const contextId = uuidv4();
    const query = `
      INSERT INTO agent_knowledge_contexts (
        context_id, agent_instance_id, section_ids, created_at, updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await conn.query(query, [
      contextId,
      agentInstanceId,
      JSON.stringify(sectionIds)
    ]);
    
    // Fetch full knowledge sections
    const sections = await this.getKnowledgeSections(sectionIds, conn);
    
    return {
      ...result.rows[0],
      knowledge_sections: sections,
      included_patterns: [],
      excluded_patterns: [],
      focus_areas: []
    };
  }

  async updateKnowledgeContext(
    request: UpdateKnowledgeContextRequest
  ): Promise<AgentKnowledgeContext> {
    // Get current context
    const currentContext = await this.getAgentKnowledgeContext(request.agent_instance_id);
    
    if (!currentContext) {
      throw new Error('No knowledge context found for agent');
    }

    // Update sections
    let sectionIds = currentContext.knowledge_sections.map(s => s.section_id);
    
    if (request.add_sections) {
      sectionIds = [...new Set([...sectionIds, ...request.add_sections])];
    }
    
    if (request.remove_sections) {
      sectionIds = sectionIds.filter(id => !request.remove_sections!.includes(id));
    }

    // Update patterns
    let includedPatterns = currentContext.included_patterns || [];
    let excludedPatterns = currentContext.excluded_patterns || [];
    
    if (request.add_patterns) {
      includedPatterns = [...new Set([...includedPatterns, ...request.add_patterns])];
    }
    
    if (request.exclude_patterns) {
      excludedPatterns = [...new Set([...excludedPatterns, ...request.exclude_patterns])];
    }

    // Update in database
    const query = `
      UPDATE agent_knowledge_contexts 
      SET section_ids = $1, included_patterns = $2, excluded_patterns = $3, 
          focus_areas = $4, updated_at = NOW()
      WHERE agent_instance_id = $5
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      JSON.stringify(sectionIds),
      JSON.stringify(includedPatterns),
      JSON.stringify(excludedPatterns),
      JSON.stringify(request.focus_areas || currentContext.focus_areas),
      request.agent_instance_id
    ]);

    const sections = await this.getKnowledgeSections(sectionIds);
    
    return {
      ...result.rows[0],
      knowledge_sections: sections,
      included_patterns: includedPatterns,
      excluded_patterns: excludedPatterns
    };
  }

  private async getAgentKnowledgeContext(
    agentInstanceId: string
  ): Promise<AgentKnowledgeContext | null> {
    const query = 'SELECT * FROM agent_knowledge_contexts WHERE agent_instance_id = $1';
    const result = await this.db.query(query, [agentInstanceId]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    const sectionIds = JSON.parse(row.section_ids);
    const sections = await this.getKnowledgeSections(sectionIds);
    
    return {
      ...row,
      knowledge_sections: sections,
      included_patterns: JSON.parse(row.included_patterns || '[]'),
      excluded_patterns: JSON.parse(row.excluded_patterns || '[]'),
      focus_areas: JSON.parse(row.focus_areas || '[]')
    };
  }

  private async getKnowledgeSections(
    sectionIds: string[],
    client?: any
  ): Promise<KnowledgeGraphSection[]> {
    if (sectionIds.length === 0) return [];
    
    const conn = client || this.db;
    const query = `
      SELECT * FROM knowledge_graph_sections 
      WHERE section_id = ANY($1)
    `;
    
    const result = await conn.query(query, [sectionIds]);
    
    return result.rows.map(row => ({
      ...row,
      nodes: JSON.parse(row.nodes || '[]'),
      relationships: JSON.parse(row.relationships || '[]'),
      entry_points: JSON.parse(row.entry_points || '[]')
    }));
  }

  // ============================================================================
  // DEEPSEEK ORCHESTRATION & AGENT SELECTION
  // ============================================================================

  async selectAgentsForTask(
    request: AgentSelectionRequest
  ): Promise<AgentSelectionResponse> {
    // Get all available agents in session
    const agentsQuery = `
      SELECT ai.*, akc.section_ids, akc.included_patterns, akc.focus_areas
      FROM agent_instances ai
      LEFT JOIN agent_knowledge_contexts akc ON ai.instance_id = akc.agent_instance_id
      WHERE ai.session_id = $1 AND ai.status = 'ready'
      ${request.exclude_agents && request.exclude_agents.length > 0 
        ? 'AND ai.instance_id != ALL($2)' 
        : ''}
      ORDER BY ai.created_at DESC
    `;
    
    const params = [request.session_id];
    if (request.exclude_agents && request.exclude_agents.length > 0) {
      params.push(request.exclude_agents);
    }
    
    const result = await this.db.query(agentsQuery, params);
    const availableAgents: AgentCapability[] = result.rows.map(row => ({
      agent_instance_id: row.instance_id,
      agent_name: row.name,
      capabilities: JSON.parse(row.metadata || '{}').capabilities || [],
      specialization: JSON.parse(row.metadata || '{}').specialization,
      knowledge_areas: JSON.parse(row.section_ids || '[]')
    }));

    if (availableAgents.length === 0) {
      return {
        selected_agents: [],
        reasoning: 'No available agents found in session',
        confidence_score: 0,
        alternative_agents: []
      };
    }

    // Use DeepSeek to analyze and select best agents
    const selectionPrompt = this.buildAgentSelectionPrompt(
      request.task_description,
      availableAgents,
      request.required_capabilities
    );

    try {
      const response = await this.deepseek.chat([
        {
          role: 'system',
          content: 'You are an AI orchestrator that selects the best agents for tasks based on their capabilities and specializations.'
        },
        {
          role: 'user',
          content: selectionPrompt
        }
      ]);

      const selectionResult = this.parseAgentSelectionResponse(
        response.choices[0].message.content,
        availableAgents
      );

      // Store decision context
      await this.storeDecisionContext(
        request.session_id,
        request.task_description,
        availableAgents,
        selectionResult.selected_agents.map(a => a.agent_instance_id),
        selectionResult.reasoning,
        selectionResult.confidence_score
      );

      return selectionResult;
    } catch (error) {
      console.error('Error in agent selection:', error);
      
      // Fallback: select first available agent
      return {
        selected_agents: [availableAgents[0]],
        reasoning: 'Automatic fallback selection due to orchestration error',
        confidence_score: 0.5,
        alternative_agents: availableAgents.slice(1)
      };
    }
  }

  // ============================================================================
  // TASK DELEGATION
  // ============================================================================

  async delegateTask(request: DelegateTaskRequest): Promise<GeneratedPrompt> {
    // Get orchestrator instance
    const orchestratorQuery = 'SELECT * FROM agent_instances WHERE instance_id = $1';
    const orchestratorResult = await this.db.query(orchestratorQuery, [
      request.orchestrator_instance_id
    ]);
    
    if (orchestratorResult.rows.length === 0) {
      throw new Error('Orchestrator instance not found');
    }
    
    const orchestrator = orchestratorResult.rows[0];

    // Select target agent
    const selectionRequest: AgentSelectionRequest = {
      session_id: orchestrator.session_id,
      task_description: request.task_description,
      max_agents: 1
    };
    
    if (request.preferred_agent_specialization) {
      // Add specialization filter
      selectionRequest.required_capabilities = [request.preferred_agent_specialization];
    }

    const selection = await this.selectAgentsForTask(selectionRequest);
    
    if (selection.selected_agents.length === 0) {
      throw new Error('No suitable agent found for task delegation');
    }

    const targetAgent = selection.selected_agents[0];

    // Generate prompt for target agent
    const prompt = await this.generatePromptForAgent(
      request.orchestrator_instance_id,
      targetAgent.agent_instance_id,
      request.task_description,
      request.context_data
    );

    return prompt;
  }

  async generatePromptForAgent(
    orchestratorId: string,
    targetAgentId: string,
    taskDescription: string,
    contextData?: Record<string, any>
  ): Promise<GeneratedPrompt> {
    // Get target agent's knowledge context
    const targetContext = await this.getAgentKnowledgeContext(targetAgentId);
    
    // Build context-aware prompt
    const promptContent = await this.buildContextAwarePrompt(
      taskDescription,
      targetContext,
      contextData
    );

    // Store generated prompt
    const promptId = uuidv4();
    const query = `
      INSERT INTO generated_prompts (
        prompt_id, orchestrator_instance_id, target_agent_instance_id,
        prompt_content, context_data, knowledge_graph_refs, generated_at, execution_status
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'pending')
      RETURNING *
    `;
    
    const knowledgeRefs = targetContext 
      ? targetContext.knowledge_sections.flatMap(s => s.nodes.map(n => n.node_id))
      : [];

    const result = await this.db.query(query, [
      promptId,
      orchestratorId,
      targetAgentId,
      promptContent,
      JSON.stringify(contextData || {}),
      JSON.stringify(knowledgeRefs)
    ]);

    return result.rows[0];
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private buildAgentSelectionPrompt(
    taskDescription: string,
    availableAgents: AgentCapability[],
    requiredCapabilities?: string[]
  ): string {
    let prompt = `Task: ${taskDescription}\n\n`;
    prompt += `Available Agents:\n`;
    
    availableAgents.forEach((agent, index) => {
      prompt += `${index + 1}. ${agent.agent_name}\n`;
      prompt += `   Specialization: ${agent.specialization || 'General'}\n`;
      prompt += `   Capabilities: ${agent.capabilities.join(', ') || 'None specified'}\n`;
      prompt += `   Knowledge Areas: ${agent.knowledge_areas.length} sections\n\n`;
    });

    if (requiredCapabilities && requiredCapabilities.length > 0) {
      prompt += `Required Capabilities: ${requiredCapabilities.join(', ')}\n\n`;
    }

    prompt += `Please select the best agent(s) for this task. Respond in JSON format:\n`;
    prompt += `{\n`;
    prompt += `  "selected_agent_ids": ["agent_id_1", "agent_id_2"],\n`;
    prompt += `  "reasoning": "explanation of why these agents were selected",\n`;
    prompt += `  "confidence": 0.85\n`;
    prompt += `}`;

    return prompt;
  }

  private parseAgentSelectionResponse(
    response: string,
    availableAgents: AgentCapability[]
  ): AgentSelectionResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const selectedAgents = availableAgents.filter(agent =>
        parsed.selected_agent_ids.includes(agent.agent_instance_id)
      );

      return {
        selected_agents: selectedAgents,
        reasoning: parsed.reasoning || 'No reasoning provided',
        confidence_score: parsed.confidence || 0.7,
        alternative_agents: availableAgents.filter(agent =>
          !parsed.selected_agent_ids.includes(agent.agent_instance_id)
        )
      };
    } catch (error) {
      console.error('Error parsing agent selection response:', error);
      
      // Fallback: select first agent
      return {
        selected_agents: [availableAgents[0]],
        reasoning: 'Fallback selection due to parsing error',
        confidence_score: 0.5,
        alternative_agents: availableAgents.slice(1)
      };
    }
  }

  private async buildContextAwarePrompt(
    taskDescription: string,
    context: AgentKnowledgeContext | null,
    additionalContext?: Record<string, any>
  ): Promise<string> {
    let prompt = `Task: ${taskDescription}\n\n`;

    if (context && context.knowledge_sections.length > 0) {
      prompt += `Relevant Codebase Context:\n`;
      context.knowledge_sections.forEach(section => {
        prompt += `\nSection: ${section.name}\n`;
        prompt += `Entry Points: ${section.entry_points.join(', ')}\n`;
        prompt += `Coverage: ${(section.coverage_score * 100).toFixed(1)}%\n`;
      });
      prompt += `\n`;
    }

    if (context && context.focus_areas && context.focus_areas.length > 0) {
      prompt += `Focus Areas: ${context.focus_areas.join(', ')}\n\n`;
    }

    if (additionalContext) {
      prompt += `Additional Context:\n${JSON.stringify(additionalContext, null, 2)}\n\n`;
    }

    prompt += `Please provide a detailed response based on your knowledge and capabilities.`;

    return prompt;
  }

  private async storeDecisionContext(
    sessionId: string,
    taskDescription: string,
    availableAgents: AgentCapability[],
    selectedAgentIds: string[],
    reasoning: string,
    confidenceScore: number
  ): Promise<void> {
    const query = `
      INSERT INTO agent_decision_contexts (
        session_id, task_description, available_agents, selected_agents,
        excluded_agents, reasoning, confidence_score, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;

    const excludedAgentIds = availableAgents
      .map(a => a.agent_instance_id)
      .filter(id => !selectedAgentIds.includes(id));

    await this.db.query(query, [
      sessionId,
      taskDescription,
      JSON.stringify(availableAgents),
      JSON.stringify(selectedAgentIds),
      JSON.stringify(excludedAgentIds),
      reasoning,
      confidenceScore
    ]);
  }

  private async assignRepositories(
    agentInstanceId: string,
    repositoryIds: string[],
    client: any
  ): Promise<void> {
    const query = `
      INSERT INTO agent_repository_assignments (
        agent_instance_id, repo_id, access_level, assigned_at
      ) VALUES ($1, $2, 'read_write', NOW())
    `;

    for (const repoId of repositoryIds) {
      await client.query(query, [agentInstanceId, repoId]);
    }
  }

  private async queueFineTuneJob(
    agentInstanceId: string,
    client: any
  ): Promise<void> {
    const query = `
      INSERT INTO agent_fine_tune_jobs (
        agent_instance_id, status, progress_percentage, started_at
      ) VALUES ($1, 'queued', 0, NOW())
    `;

    await client.query(query, [agentInstanceId]);
  }
}
