/**
 * Agent Management System Types
 * TypeScript types for agent sessions, tools, services, workflows, campaigns, and data streams
 */

// ============================================================================
// AGENT SESSIONS & INSTANCES
// ============================================================================

export interface AgentSession {
  session_id: string;
  name: string;
  description?: string;
  agent_type: 'deepseek' | 'gpt4' | 'claude' | 'custom';
  status: 'active' | 'paused' | 'completed' | 'archived';
  configuration: Record<string, any>;
  context_data?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  metadata?: Record<string, any>;
}

export interface AgentInstance {
  instance_id: string;
  session_id: string;
  name: string;
  model_name: string;
  model_version?: string;
  fine_tuned: boolean;
  fine_tune_config?: Record<string, any>;
  schema_map?: Record<string, any>;
  pattern_rules?: any[];
  tools_enabled?: string[];
  services_enabled?: string[];
  max_tokens: number;
  temperature: number;
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'stopped';
  endpoint_url?: string;
  api_key_encrypted?: string;
  created_at: Date;
  last_active_at: Date;
  metadata?: Record<string, any>;
}

export interface AgentMessage {
  message_id: string;
  session_id: string;
  instance_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  prompt_template_id?: string;
  attachments?: any[];
  token_count?: number;
  created_at: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// TOOLS, SERVICES & WORKFLOWS
// ============================================================================

export interface AgentTool {
  tool_id: string;
  name: string;
  description?: string;
  category?: string;
  service_type?: string;
  handler_function: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  configuration?: Record<string, any>;
  is_active: boolean;
  requires_auth: boolean;
  rate_limit?: number;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface AgentService {
  service_id: string;
  name: string;
  description?: string;
  category?: string;
  configuration?: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
  tools?: AgentTool[]; // populated via join
}

export interface ServiceTool {
  service_id: string;
  tool_id: string;
  ordering: number;
  is_required: boolean;
  configuration_override?: Record<string, any>;
}

export interface AgentWorkflow {
  workflow_id: string;
  name: string;
  description?: string;
  workflow_type: 'sequential' | 'parallel' | 'dag' | 'conditional';
  configuration: Record<string, any>;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  is_template: boolean;
  is_active: boolean;
  version: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  metadata?: Record<string, any>;
  steps?: WorkflowStep[]; // populated via join
}

export interface WorkflowStep {
  step_id: string;
  workflow_id: string;
  name: string;
  step_type: 'service' | 'tool' | 'condition' | 'loop' | 'parallel';
  service_id?: string;
  tool_id?: string;
  ordering: number;
  dependencies?: string[];
  configuration?: Record<string, any>;
  conditional_logic?: Record<string, any>;
  retry_policy?: Record<string, any>;
  timeout_seconds: number;
  is_optional: boolean;
  created_at: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// CAMPAIGNS & DATA STREAMS
// ============================================================================

export interface AgentCampaign {
  campaign_id: string;
  name: string;
  description?: string;
  campaign_type?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: Date;
  end_date?: Date;
  schedule_config?: Record<string, any>;
  configuration?: Record<string, any>;
  success_criteria?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  metadata?: Record<string, any>;
  workflows?: AgentWorkflow[]; // populated via join
}

export interface CampaignWorkflow {
  campaign_id: string;
  workflow_id: string;
  ordering: number;
  trigger_condition?: Record<string, any>;
  configuration_override?: Record<string, any>;
  is_active: boolean;
}

export interface DataStream {
  stream_id: string;
  campaign_id?: string;
  name: string;
  description?: string;
  stream_type: string;
  source_config: Record<string, any>;
  target_config?: Record<string, any>;
  transformation_rules?: any[];
  status: 'active' | 'paused' | 'stopped' | 'error';
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
  attributes?: StreamAttribute[]; // populated via join
}

export interface StreamAttribute {
  attribute_id: string;
  stream_id: string;
  name: string;
  description?: string;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  extraction_config: Record<string, any>;
  enrichment_prompt?: string;
  search_algorithm?: string;
  validation_rules?: Record<string, any>;
  is_required: boolean;
  is_included: boolean;
  default_value?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface StreamAttributeData {
  data_id: string;
  stream_id: string;
  attribute_id: string;
  source_url?: string;
  raw_value?: string;
  enriched_value?: string;
  confidence_score?: number;
  collected_at: Date;
  enriched_at?: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// CODEBASE ANALYSIS & PATTERNS
// ============================================================================

export interface CodebaseSchemaMap {
  schema_id: string;
  file_path: string;
  file_type?: string;
  component_type?: string;
  exports?: any[];
  imports?: any[];
  dependencies?: any[];
  functions?: any[];
  classes?: any[];
  interfaces?: any[];
  patterns_used?: any[];
  last_analyzed: Date;
  analysis_version?: string;
  metadata?: Record<string, any>;
}

export interface CodebaseRelationship {
  relationship_id: string;
  from_schema_id: string;
  to_schema_id: string;
  relationship_type: 'imports' | 'extends' | 'implements' | 'calls' | 'references';
  relationship_data?: Record<string, any>;
  strength: number;
  created_at: Date;
}

export interface PatternRule {
  rule_id: string;
  name: string;
  description?: string;
  pattern_type: string;
  rule_definition: Record<string, any>;
  examples?: any[];
  applies_to?: any[];
  confidence_score: number;
  discovered_at: Date;
  last_validated?: Date;
  is_active: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// EXECUTION & MONITORING
// ============================================================================

export interface AgentExecution {
  execution_id: string;
  session_id: string;
  instance_id?: string;
  workflow_id?: string;
  campaign_id?: string;
  execution_type: 'prompt' | 'workflow' | 'campaign';
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  started_at: Date;
  completed_at?: Date;
  execution_time_ms?: number;
  tokens_used?: number;
  cost_estimate?: number;
  metadata?: Record<string, any>;
}

export interface ExecutionLog {
  log_id: string;
  execution_id: string;
  log_level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  step_name?: string;
  context_data?: Record<string, any>;
  created_at: Date;
}

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

export interface CreateAgentSessionRequest {
  name: string;
  description?: string;
  agent_type?: 'deepseek' | 'gpt4' | 'claude' | 'custom';
  configuration?: Record<string, any>;
  context_data?: Record<string, any>;
}

export interface CreateAgentInstanceRequest {
  session_id: string;
  name: string;
  model_name?: string;
  model_version?: string;
  fine_tune_config?: Record<string, any>;
  tools_enabled?: string[];
  services_enabled?: string[];
  max_tokens?: number;
  temperature?: number;
}

export interface SendPromptRequest {
  session_id: string;
  instance_id?: string;
  content: string;
  attachments?: any[];
}

export interface CreateToolRequest {
  name: string;
  description?: string;
  category?: string;
  service_type?: string;
  handler_function: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  configuration?: Record<string, any>;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category?: string;
  tool_ids?: string[];
  configuration?: Record<string, any>;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  workflow_type: 'sequential' | 'parallel' | 'dag' | 'conditional';
  configuration?: Record<string, any>;
  steps?: Omit<WorkflowStep, 'step_id' | 'workflow_id' | 'created_at' | 'metadata'>[];
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  campaign_type?: string;
  workflow_ids?: string[];
  schedule_config?: Record<string, any>;
  configuration?: Record<string, any>;
}

export interface CreateDataStreamRequest {
  campaign_id?: string;
  name: string;
  description?: string;
  stream_type: string;
  source_config: Record<string, any>;
  target_config?: Record<string, any>;
  attributes?: Omit<StreamAttribute, 'attribute_id' | 'stream_id' | 'created_at' | 'updated_at' | 'metadata'>[];
}

export interface ExecuteWorkflowRequest {
  workflow_id: string;
  input_data?: Record<string, any>;
  execution_mode?: 'auto' | 'manual' | 'scheduled';
}

// ============================================================================
// DEEPSEEK CONFIGURATION
// ============================================================================

export interface DeepSeekConfig {
  api_url: string;
  api_key?: string;
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface DeepSeekFineTuneConfig {
  training_file?: string;
  validation_file?: string;
  model_suffix?: string;
  n_epochs?: number;
  batch_size?: number;
  learning_rate?: number;
  prompt_loss_weight?: number;
}

// ============================================================================
// PATTERN DISCOVERY
// ============================================================================

export interface CodebasePattern {
  pattern_id: string;
  name: string;
  type: 'architectural' | 'naming' | 'structure' | 'import' | 'export';
  description: string;
  occurrences: number;
  examples: string[];
  confidence: number;
}

export interface SchemaLinkMap {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
  metadata: {
    total_files: number;
    total_relationships: number;
    analyzed_at: Date;
  };
}

export interface SchemaNode {
  id: string;
  file_path: string;
  type: string;
  exports: string[];
  imports: string[];
}

export interface SchemaEdge {
  source: string;
  target: string;
  type: 'import' | 'extend' | 'implement' | 'call';
  weight: number;
}
