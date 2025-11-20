// Service and Workflow Defaults Generator
// Generates default configurations for services and workflows based on user type and plan
// Based on USER_SCHEMA_DOCUMENTATION.md

import { 
  UserType, 
  PlanTier, 
  ServiceConfig, 
  WorkflowConfig 
} from './enhanced-user.schema';

// =====================================================
// Service Defaults
// =====================================================

export interface ServiceDefinition {
  serviceName: string;
  displayName: string;
  description: string;
  category: string;
  defaultConfig: Partial<ServiceConfig>;
  availableForPlans: PlanTier[];
  requiresAuth: boolean;
}

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    serviceName: 'deepseek-ai',
    displayName: 'DeepSeek AI',
    description: 'AI chat and code generation with DeepSeek models',
    category: 'ai',
    defaultConfig: {
      serviceName: 'deepseek-ai',
      enabled: true,
      limits: {
        requestsPerDay: 10000,
        requestsPerMinute: 100,
        maxConcurrentRequests: 10,
      },
      features: ['chat', 'completion', 'embeddings', 'code-generation'],
      priority: 'high',
      metadata: {
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat',
        maxTokens: 4096,
        temperature: 0.7,
      },
    },
    availableForPlans: ['basic', 'professional', 'enterprise', 'deepseek_premium'],
    requiresAuth: true,
  },
  {
    serviceName: 'workflow-automation',
    displayName: 'Workflow Automation',
    description: 'Automated workflow execution and management',
    category: 'automation',
    defaultConfig: {
      serviceName: 'workflow-automation',
      enabled: true,
      limits: {
        maxConcurrentRequests: 20,
      },
      features: ['scheduling', 'triggers', 'ai-assisted-steps'],
      priority: 'medium',
      metadata: {
        enableScheduling: true,
        supportedTriggers: ['webhook', 'schedule', 'event'],
      },
    },
    availableForPlans: ['basic', 'professional', 'enterprise', 'deepseek_premium'],
    requiresAuth: false,
  },
  {
    serviceName: 'data-mining',
    displayName: 'Data Mining',
    description: 'Web crawling and data extraction services',
    category: 'data',
    defaultConfig: {
      serviceName: 'data-mining',
      enabled: true,
      limits: {
        requestsPerDay: 1000,
        requestsPerMinute: 10,
      },
      features: ['web-crawling', 'data-extraction', 'javascript-rendering'],
      priority: 'medium',
      metadata: {
        maxPagesPerDay: 1000,
        enableJavaScript: true,
        respectRobotsTxt: true,
      },
    },
    availableForPlans: ['professional', 'enterprise'],
    requiresAuth: false,
  },
  {
    serviceName: 'analytics',
    displayName: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting',
    category: 'analytics',
    defaultConfig: {
      serviceName: 'analytics',
      enabled: true,
      limits: {
        storageQuotaMB: 1000,
      },
      features: ['real-time-analytics', 'custom-dashboards', 'data-export'],
      priority: 'low',
      metadata: {
        dataRetentionDays: 90,
        enableRealTime: true,
      },
    },
    availableForPlans: ['professional', 'enterprise'],
    requiresAuth: false,
  },
  {
    serviceName: 'api-gateway',
    displayName: 'API Gateway',
    description: 'Custom API endpoints and integrations',
    category: 'integration',
    defaultConfig: {
      serviceName: 'api-gateway',
      enabled: true,
      limits: {
        requestsPerDay: 10000,
        requestsPerMinute: 100,
      },
      features: ['custom-endpoints', 'rate-limiting', 'authentication'],
      priority: 'high',
      metadata: {
        maxEndpoints: 10,
        rateLimiting: true,
      },
    },
    availableForPlans: ['professional', 'enterprise'],
    requiresAuth: true,
  },
];

// =====================================================
// Workflow Template Defaults
// =====================================================

export interface WorkflowTemplateDefinition {
  workflowId: string;
  workflowName: string;
  description: string;
  category: string;
  workflowSchema: any; // Full workflow definition
  defaultConfig: Partial<WorkflowConfig>;
  availableForUserTypes: UserType[];
  availableForPlans: PlanTier[];
  requiredServices: string[];
}

export const WORKFLOW_TEMPLATE_DEFINITIONS: WorkflowTemplateDefinition[] = [
  {
    workflowId: '550e8400-e29b-41d4-a716-446655440001',
    workflowName: 'Content Approval Pipeline',
    description: 'AI-assisted content review and publication workflow',
    category: 'content',
    workflowSchema: {
      steps: [
        {
          id: 'draft',
          name: 'Content Draft',
          type: 'manual',
          schema: { content: 'string', title: 'string' },
          validation: [{ rule: 'required' }],
        },
        {
          id: 'ai_review',
          name: 'AI Content Review',
          type: 'ai',
          schema: { content: 'string' },
          aiAssistance: {
            model: 'deepseek-chat',
            promptTemplate: 'Review this content for grammar, tone, and accuracy',
            confidenceThreshold: 0.85,
          },
        },
        {
          id: 'editor_review',
          name: 'Editor Review',
          type: 'manual',
          schema: { approved: 'boolean', feedback: 'string' },
        },
        {
          id: 'publish',
          name: 'Publish Content',
          type: 'automated',
          schema: { publishDate: 'date' },
        },
      ],
      transitions: [
        { from: 'draft', to: 'ai_review', condition: 'validation_passed' },
        { from: 'ai_review', to: 'editor_review', condition: 'validation_passed' },
        { from: 'editor_review', to: 'publish', condition: 'approved' },
        { from: 'editor_review', to: 'draft', condition: 'rejected' },
      ],
    },
    defaultConfig: {
      workflowId: '550e8400-e29b-41d4-a716-446655440001',
      workflowName: 'Content Approval Pipeline',
      enabled: true,
      autoExecute: false,
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canExecute: true,
      },
      triggers: ['manual', 'webhook'],
      metadata: {
        category: 'content',
        requiresAI: true,
        estimatedDuration: '5-10 minutes',
      },
    },
    availableForUserTypes: ['admin_user', 'paid_plan_user', 'deepseek_user'],
    availableForPlans: ['professional', 'enterprise', 'deepseek_premium'],
    requiredServices: ['deepseek-ai', 'workflow-automation'],
  },
  {
    workflowId: '550e8400-e29b-41d4-a716-446655440002',
    workflowName: 'Data Collection Workflow',
    description: 'Automated data collection and processing',
    category: 'data',
    workflowSchema: {
      steps: [
        {
          id: 'collect',
          name: 'Collect Data',
          type: 'automated',
          schema: { urls: 'array' },
        },
        {
          id: 'process',
          name: 'Process Data',
          type: 'ai',
          schema: { data: 'object' },
          aiAssistance: {
            model: 'deepseek-chat',
            promptTemplate: 'Analyze and categorize this data',
            confidenceThreshold: 0.8,
          },
        },
        {
          id: 'store',
          name: 'Store Results',
          type: 'automated',
          schema: { destination: 'string' },
        },
      ],
      transitions: [
        { from: 'collect', to: 'process', condition: 'data_collected' },
        { from: 'process', to: 'store', condition: 'processing_complete' },
      ],
    },
    defaultConfig: {
      workflowId: '550e8400-e29b-41d4-a716-446655440002',
      workflowName: 'Data Collection Workflow',
      enabled: true,
      autoExecute: true,
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canExecute: true,
      },
      triggers: ['schedule', 'webhook'],
      schedule: '0 2 * * *', // Daily at 2 AM
      metadata: {
        category: 'data',
        requiresAI: true,
      },
    },
    availableForUserTypes: ['admin_user', 'paid_plan_user'],
    availableForPlans: ['professional', 'enterprise'],
    requiredServices: ['data-mining', 'deepseek-ai', 'workflow-automation'],
  },
  {
    workflowId: '550e8400-e29b-41d4-a716-446655440003',
    workflowName: 'User Onboarding',
    description: 'Automated user onboarding and setup',
    category: 'admin',
    workflowSchema: {
      steps: [
        {
          id: 'signup',
          name: 'User Signup',
          type: 'manual',
          schema: { email: 'string', name: 'string' },
        },
        {
          id: 'verify',
          name: 'Verify Email',
          type: 'automated',
          schema: { verificationCode: 'string' },
        },
        {
          id: 'setup',
          name: 'Setup Account',
          type: 'automated',
          schema: { userType: 'string', planTier: 'string' },
        },
      ],
      transitions: [
        { from: 'signup', to: 'verify', condition: 'email_valid' },
        { from: 'verify', to: 'setup', condition: 'email_verified' },
      ],
    },
    defaultConfig: {
      workflowId: '550e8400-e29b-41d4-a716-446655440003',
      workflowName: 'User Onboarding',
      enabled: true,
      autoExecute: true,
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canExecute: false,
      },
      triggers: ['event'],
      metadata: {
        category: 'admin',
        systemWorkflow: true,
      },
    },
    availableForUserTypes: ['admin_user'],
    availableForPlans: ['enterprise'],
    requiredServices: ['workflow-automation'],
  },
];

// =====================================================
// Generator Functions
// =====================================================

/**
 * Get services for a specific user type and plan
 */
export function getServicesForUser(userType: UserType, planTier: PlanTier): ServiceConfig[] {
  return SERVICE_DEFINITIONS
    .filter(def => def.availableForPlans.includes(planTier))
    .map(def => {
      const config: ServiceConfig = {
        serviceName: def.serviceName,
        enabled: true,
        limits: def.defaultConfig.limits,
        features: def.defaultConfig.features || [],
        priority: def.defaultConfig.priority || 'medium',
        metadata: def.defaultConfig.metadata,
      };

      // Customize limits based on plan tier
      if (config.limits) {
        if (planTier === 'free') {
          config.limits.requestsPerDay = Math.floor((config.limits.requestsPerDay || 100) * 0.1);
          config.limits.requestsPerMinute = Math.floor((config.limits.requestsPerMinute || 10) * 0.1);
        } else if (planTier === 'basic') {
          config.limits.requestsPerDay = Math.floor((config.limits.requestsPerDay || 1000) * 0.5);
        }
      }

      return config;
    });
}

/**
 * Get workflows for a specific user type and plan
 */
export function getWorkflowsForUser(userType: UserType, planTier: PlanTier): WorkflowConfig[] {
  return WORKFLOW_TEMPLATE_DEFINITIONS
    .filter(def => 
      def.availableForUserTypes.includes(userType) &&
      def.availableForPlans.includes(planTier)
    )
    .map(def => ({
      workflowId: def.workflowId,
      workflowName: def.workflowName,
      enabled: def.defaultConfig.enabled || true,
      autoExecute: def.defaultConfig.autoExecute || false,
      permissions: def.defaultConfig.permissions || {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canExecute: false,
      },
      triggers: def.defaultConfig.triggers || [],
      schedule: def.defaultConfig.schedule,
      metadata: def.defaultConfig.metadata,
    }));
}

/**
 * Generate complete user config
 */
export function generateUserConfig(userType: UserType, planTier: PlanTier) {
  return {
    services: getServicesForUser(userType, planTier),
    workflows: getWorkflowsForUser(userType, planTier),
    // ... other config from getDefaultUserConfig
  };
}

/**
 * Get service definition by name
 */
export function getServiceDefinition(serviceName: string): ServiceDefinition | undefined {
  return SERVICE_DEFINITIONS.find(def => def.serviceName === serviceName);
}

/**
 * Get workflow template by ID
 */
export function getWorkflowTemplate(workflowId: string): WorkflowTemplateDefinition | undefined {
  return WORKFLOW_TEMPLATE_DEFINITIONS.find(def => def.workflowId === workflowId);
}

/**
 * Check if service is available for plan
 */
export function isServiceAvailableForPlan(serviceName: string, planTier: PlanTier): boolean {
  const service = getServiceDefinition(serviceName);
  return service?.availableForPlans.includes(planTier) ?? false;
}

/**
 * Check if workflow is available for user type and plan
 */
export function isWorkflowAvailable(
  workflowId: string, 
  userType: UserType, 
  planTier: PlanTier
): boolean {
  const workflow = getWorkflowTemplate(workflowId);
  if (!workflow) return false;
  
  return (
    workflow.availableForUserTypes.includes(userType) &&
    workflow.availableForPlans.includes(planTier)
  );
}
