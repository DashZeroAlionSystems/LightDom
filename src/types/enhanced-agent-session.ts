/**
 * Enhanced Agent Session Types
 * Extended types for knowledge graph-aware agent sessions with DeepSeek orchestration
 */

import { 
  AgentSession, 
  AgentInstance, 
  CodebaseSchemaMap, 
  CodebaseRelationship 
} from './agent-management';

// ============================================================================
// KNOWLEDGE GRAPH CONTEXT
// ============================================================================

export interface KnowledgeGraphNode {
  node_id: string;
  node_type: 'file' | 'component' | 'service' | 'api' | 'schema' | 'workflow';
  path: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  relationships: string[]; // IDs of related nodes
  relevance_score?: number;
}

export interface KnowledgeGraphSection {
  section_id: string;
  name: string;
  description?: string;
  nodes: KnowledgeGraphNode[];
  relationships: CodebaseRelationship[];
  entry_points: string[]; // Node IDs that serve as entry points
  coverage_score: number; // 0-1 representing how much of codebase is included
}

export interface AgentKnowledgeContext {
  context_id: string;
  agent_instance_id: string;
  knowledge_sections: KnowledgeGraphSection[];
  included_patterns: string[]; // Pattern rule IDs
  excluded_patterns: string[]; // Pattern rule IDs to explicitly exclude
  focus_areas: string[]; // Specific areas of the codebase to focus on
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// AGENT NAVIGATION & DECISION SCHEMA
// ============================================================================

export interface AgentNavigationRule {
  rule_id: string;
  name: string;
  description?: string;
  condition: {
    task_type?: string[];
    keywords?: string[];
    context_match?: Record<string, any>;
    required_capabilities?: string[];
  };
  action: 'include' | 'exclude' | 'prioritize' | 'deprioritize';
  target_agent_types?: string[];
  confidence_threshold: number; // 0-1
  created_at: Date;
  is_active: boolean;
}

export interface AgentDecisionContext {
  decision_id: string;
  session_id: string;
  task_description: string;
  available_agents: AgentCapability[];
  selected_agents: string[]; // Agent instance IDs
  excluded_agents: string[]; // Agent instance IDs
  reasoning: string; // DeepSeek's reasoning for agent selection
  confidence_score: number;
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface AgentCapability {
  agent_instance_id: string;
  agent_name: string;
  capabilities: string[];
  specialization?: string;
  knowledge_areas: string[];
  performance_metrics?: {
    success_rate: number;
    avg_response_time_ms: number;
    tasks_completed: number;
  };
}

// ============================================================================
// ENHANCED AGENT INSTANCES
// ============================================================================

export interface EnhancedAgentInstance extends AgentInstance {
  knowledge_context?: AgentKnowledgeContext;
  specialization?: string;
  capabilities?: string[];
  parent_instance_id?: string; // For agent hierarchies
  delegation_enabled: boolean;
  auto_prompt_generation: boolean;
}

export interface AgentSpecialization {
  specialization_id: string;
  name: string;
  description?: string;
  required_capabilities: string[];
  knowledge_focus: string[];
  prompt_templates: PromptTemplate[];
  fine_tune_config?: Record<string, any>;
}

export interface PromptTemplate {
  template_id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  example_usage?: string;
}

// ============================================================================
// DEEPSEEK ORCHESTRATION
// ============================================================================

export interface DeepSeekOrchestrationConfig {
  orchestrator_id: string;
  session_id: string;
  auto_delegation: boolean;
  delegation_rules: DelegationRule[];
  prompt_generation_config: {
    max_prompt_length: number;
    include_context_summary: boolean;
    include_code_examples: boolean;
    reasoning_chain_enabled: boolean;
  };
  agent_pool: string[]; // Available agent instance IDs
}

export interface DelegationRule {
  rule_id: string;
  name: string;
  trigger_condition: {
    task_complexity?: 'low' | 'medium' | 'high';
    task_type?: string;
    keywords?: string[];
    estimated_duration_minutes?: number;
  };
  target_agent_specialization?: string;
  agent_selection_strategy: 'best_match' | 'round_robin' | 'least_busy' | 'specialized';
  priority: number;
}

export interface GeneratedPrompt {
  prompt_id: string;
  orchestrator_instance_id: string;
  target_agent_instance_id: string;
  prompt_content: string;
  context_data: Record<string, any>;
  knowledge_graph_refs: string[]; // Node IDs from knowledge graph
  generated_at: Date;
  execution_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result_summary?: string;
}

// ============================================================================
// REPOSITORY SELECTION & CONTEXT
// ============================================================================

export interface RepositoryContext {
  repo_id: string;
  repo_name: string;
  repo_url?: string;
  local_path?: string;
  branch?: string;
  last_synced_at?: Date;
  codebase_analysis?: CodebaseAnalysis;
}

export interface CodebaseAnalysis {
  analysis_id: string;
  repo_id: string;
  total_files: number;
  total_lines: number;
  languages: Record<string, number>; // language -> line count
  architecture_patterns: string[];
  entry_points: string[];
  dependency_graph?: Record<string, string[]>;
  analyzed_at: Date;
}

export interface AgentRepositoryAssignment {
  assignment_id: string;
  agent_instance_id: string;
  repo_id: string;
  access_level: 'read' | 'read_write' | 'admin';
  scope_restrictions?: string[]; // Paths or patterns to restrict access
  assigned_at: Date;
}

// ============================================================================
// FINE-TUNING & TRAINING
// ============================================================================

export interface AgentFineTuneJob {
  job_id: string;
  agent_instance_id: string;
  training_data_source: string;
  knowledge_graph_section_id?: string;
  training_config: {
    epochs: number;
    learning_rate: number;
    batch_size: number;
    validation_split: number;
  };
  status: 'queued' | 'training' | 'validating' | 'completed' | 'failed';
  progress_percentage: number;
  started_at?: Date;
  completed_at?: Date;
  metrics?: {
    loss: number;
    accuracy: number;
    validation_loss: number;
    validation_accuracy: number;
  };
}

export interface TrainingDataset {
  dataset_id: string;
  name: string;
  description?: string;
  source_type: 'codebase' | 'conversations' | 'manual' | 'generated';
  data_points: number;
  created_at: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

export interface CreateEnhancedAgentRequest {
  name: string;
  session_id: string;
  model_name?: string;
  specialization?: string;
  capabilities?: string[];
  knowledge_graph_sections?: string[];
  repository_ids?: string[];
  fine_tune_before_start?: boolean;
  delegation_enabled?: boolean;
  auto_prompt_generation?: boolean;
}

export interface DelegateTaskRequest {
  orchestrator_instance_id: string;
  task_description: string;
  context_data?: Record<string, any>;
  preferred_agent_specialization?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface AgentSelectionRequest {
  session_id: string;
  task_description: string;
  required_capabilities?: string[];
  exclude_agents?: string[];
  max_agents?: number;
}

export interface AgentSelectionResponse {
  selected_agents: AgentCapability[];
  reasoning: string;
  confidence_score: number;
  alternative_agents?: AgentCapability[];
}

export interface UpdateKnowledgeContextRequest {
  agent_instance_id: string;
  add_sections?: string[]; // Knowledge section IDs to add
  remove_sections?: string[]; // Knowledge section IDs to remove
  add_patterns?: string[]; // Pattern rule IDs to include
  exclude_patterns?: string[]; // Pattern rule IDs to exclude
  focus_areas?: string[];
}

// ============================================================================
// 3D VISUALIZATION CONTEXT
// ============================================================================

export interface DOMLayerVisualization {
  visualization_id: string;
  agent_instance_id?: string;
  layer_type: '3d_dom' | 'architecture' | 'dependency_graph' | 'component_tree';
  render_data: Record<string, any>;
  screenshot_url?: string;
  interactive_url?: string;
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface VisualComponentPreview {
  preview_id: string;
  component_path: string;
  render_url: string;
  thumbnail_url?: string;
  generated_by_agent_id?: string;
  created_at: Date;
}
