/**
 * TypeScript types for n8n MCP integration
 */

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  disabled?: boolean;
  notes?: string;
  continueOnFail?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflowConnections {
  [sourceNodeId: string]: {
    main: N8nConnection[][];
  };
}

export interface N8nWorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  timezone?: string;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  executionTimeout?: number;
  errorWorkflow?: string;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nWorkflowConnections;
  active?: boolean;
  settings?: N8nWorkflowSettings;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  pinned?: boolean;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData?: N8nWorkflow;
  data?: {
    resultData: {
      runData: Record<string, any>;
      lastNodeExecuted?: string;
    };
  };
  status: 'running' | 'success' | 'error' | 'cancelled';
  error?: {
    message: string;
    stack?: string;
  };
}

export interface N8nWebhook {
  id: string;
  path: string;
  httpMethod: string;
  webhookUrl: string;
  workflowId: string;
  active: boolean;
  createdAt: string;
}

export interface N8nMCPConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
  timeout: number;
}

export interface N8nWorkflowTemplate {
  name: string;
  description: string;
  nodes: N8nNode[];
  connections: N8nWorkflowConnections;
  settings?: N8nWorkflowSettings;
  tags?: string[];
  category?: string;
}

export interface N8nExecutionStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  timeRange: string;
  successRate: number;
  failureRate: number;
}

export interface N8nValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface N8nExportData {
  workflow: N8nWorkflow;
  exportedAt: string;
  version: string;
  metadata?: {
    description?: string;
    tags?: string[];
    author?: string;
  };
}

export interface N8nTriggerOptions {
  webhookUrl?: string;
  inputData?: Record<string, any>;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface N8nNodeType {
  name: string;
  displayName: string;
  description: string;
  version: number;
  defaults: {
    name: string;
    color: string;
  };
  inputs: string[];
  outputs: string[];
  credentials?: string[];
  properties: Array<{
    displayName: string;
    name: string;
    type: string;
    required?: boolean;
    default?: any;
    options?: any[];
    description?: string;
  }>;
  codex?: {
    categories: string[];
    aliases?: string[];
  };
}

export interface N8nCredentials {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface N8nWorkflowTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface N8nWorkflowTemplateSearch {
  query?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface N8nWorkflowTemplateSearchResult {
  templates: N8nWorkflowTemplate[];
  total: number;
  hasMore: boolean;
}

// MCP Tool Input Types
export interface ListWorkflowsInput {
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetWorkflowInput {
  workflowId: string;
}

export interface CreateWorkflowInput {
  name: string;
  nodes: N8nNode[];
  connections: N8nWorkflowConnections;
  active?: boolean;
  settings?: N8nWorkflowSettings;
  tags?: string[];
}

export interface UpdateWorkflowInput {
  workflowId: string;
  name?: string;
  nodes?: N8nNode[];
  connections?: N8nWorkflowConnections;
  active?: boolean;
  settings?: N8nWorkflowSettings;
  tags?: string[];
}

export interface DeleteWorkflowInput {
  workflowId: string;
}

export interface ExecuteWorkflowInput {
  workflowId: string;
  inputData?: Record<string, any>;
  mode?: 'manual' | 'trigger';
}

export interface GetExecutionInput {
  executionId: string;
}

export interface ListExecutionsInput {
  workflowId?: string;
  limit?: number;
  offset?: number;
  status?: 'running' | 'success' | 'error' | 'cancelled';
}

export interface CreateWebhookInput {
  workflowId: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string;
  active?: boolean;
}

export interface TriggerWebhookInput {
  webhookUrl: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ExportWorkflowInput {
  workflowId: string;
  filePath?: string;
  includeExecutions?: boolean;
}

export interface ImportWorkflowInput {
  filePath: string;
  name?: string;
  active?: boolean;
}

export interface ValidateWorkflowInput {
  workflow: Partial<N8nWorkflow>;
}

export interface GetWorkflowStatisticsInput {
  workflowId: string;
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year';
  limit?: number;
}

// MCP Response Types
export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// Utility Types
export type N8nNodeTypeCategory = 
  | 'trigger'
  | 'transform'
  | 'output'
  | 'input'
  | 'utility'
  | 'communication'
  | 'data'
  | 'ai'
  | 'blockchain'
  | 'custom';

export type N8nExecutionMode = 'manual' | 'trigger' | 'webhook';
export type N8nExecutionStatus = 'running' | 'success' | 'error' | 'cancelled';
export type N8nWorkflowStatus = 'active' | 'inactive' | 'error';

// Event Types for real-time updates
export interface N8nExecutionEvent {
  type: 'execution_started' | 'execution_finished' | 'execution_failed';
  executionId: string;
  workflowId: string;
  timestamp: string;
  data?: any;
}

export interface N8nWorkflowEvent {
  type: 'workflow_created' | 'workflow_updated' | 'workflow_deleted' | 'workflow_activated' | 'workflow_deactivated';
  workflowId: string;
  timestamp: string;
  data?: any;
}
