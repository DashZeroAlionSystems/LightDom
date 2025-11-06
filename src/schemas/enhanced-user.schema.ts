// Enhanced User Schema with User Types, Plans, and Configs
// Based on SCHEMA_AI_RESEARCH_2025.md and user requirements
// Supports: DeepSeek users, Admin users, Paid/Free plan users

import { z } from 'zod';

// =====================================================
// User Type Enums
// =====================================================
export const UserTypeEnum = z.enum([
  'deepseek_user',    // DeepSeek AI service users
  'admin_user',       // System administrators
  'paid_plan_user',   // Paid subscription users
  'free_plan_user',   // Free tier users
]);

export const PlanTierEnum = z.enum([
  'free',
  'basic',
  'professional',
  'enterprise',
  'deepseek_premium',
]);

export const UserRoleEnum = z.enum([
  'super_admin',
  'admin',
  'moderator',
  'user',
  'viewer',
]);

// =====================================================
// Service Configuration Schema
// =====================================================
export const ServiceConfigSchema = z.object({
  serviceName: z.string(),
  enabled: z.boolean().default(true),
  limits: z.object({
    requestsPerDay: z.number().int().positive().optional(),
    requestsPerMinute: z.number().int().positive().optional(),
    maxConcurrentRequests: z.number().int().positive().optional(),
    storageQuotaMB: z.number().int().positive().optional(),
  }).optional(),
  features: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.unknown()).optional(),
});

// =====================================================
// Workflow Configuration Schema
// =====================================================
export const WorkflowConfigSchema = z.object({
  workflowId: z.string().uuid(),
  workflowName: z.string(),
  enabled: z.boolean().default(true),
  autoExecute: z.boolean().default(false),
  permissions: z.object({
    canCreate: z.boolean().default(false),
    canRead: z.boolean().default(true),
    canUpdate: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    canExecute: z.boolean().default(false),
  }),
  triggers: z.array(z.string()).default([]),
  schedule: z.string().optional(), // Cron expression
  metadata: z.record(z.unknown()).optional(),
});

// =====================================================
// User Configuration Schema
// Defines what services and workflows are available to the user
// =====================================================
export const UserConfigSchema = z.object({
  // Service configurations
  services: z.array(ServiceConfigSchema).default([]),
  
  // Workflow configurations
  workflows: z.array(WorkflowConfigSchema).default([]),
  
  // AI/ML configurations
  aiConfig: z.object({
    enableAI: z.boolean().default(false),
    models: z.array(z.string()).default([]),
    maxTokensPerRequest: z.number().int().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
    contextWindowSize: z.number().int().positive().optional(),
  }).optional(),
  
  // Feature flags
  features: z.record(z.boolean()).default({}),
  
  // Quota and limits
  quotas: z.object({
    storageGB: z.number().int().positive(),
    apiCallsPerDay: z.number().int().positive(),
    workflowExecutionsPerDay: z.number().int().positive(),
    maxConcurrentWorkflows: z.number().int().positive(),
  }),
  
  // Billing configuration
  billing: z.object({
    subscriptionId: z.string().optional(),
    planTier: PlanTierEnum,
    billingCycle: z.enum(['monthly', 'yearly', 'lifetime']).optional(),
    autoRenew: z.boolean().default(true),
    paymentMethod: z.string().optional(),
  }),
  
  // Preferences
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
      workflow: z.boolean().default(true),
    }).default({}),
  }).default({}),
  
  // Custom metadata
  metadata: z.record(z.unknown()).default({}),
});

// =====================================================
// Complete User Schema
// =====================================================
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  name: z.string().min(2).max(100),
  
  // User type and role
  userType: UserTypeEnum,
  role: UserRoleEnum.default('user'),
  
  // Plan information
  planTier: PlanTierEnum,
  
  // User configuration - defines available services and workflows
  config: UserConfigSchema,
  
  // Authentication
  passwordHash: z.string().optional(), // Optional for OAuth users
  lastLogin: z.date().optional(),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  
  // Status
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  
  // Audit fields
  createdAt: z.date(),
  updatedAt: z.date(),
  lastModifiedBy: z.string().uuid().optional(),
  
  // Additional metadata
  avatar: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// =====================================================
// User Type Schemas (Specific Configurations)
// =====================================================

// DeepSeek User - AI service focused
export const DeepSeekUserSchema = UserSchema.extend({
  userType: z.literal('deepseek_user'),
  config: UserConfigSchema.extend({
    aiConfig: z.object({
      enableAI: z.literal(true),
      models: z.array(z.string()).min(1),
      maxTokensPerRequest: z.number().int().positive(),
      temperature: z.number().min(0).max(2).default(0.7),
      contextWindowSize: z.number().int().positive().default(4096),
      preferredModel: z.string().default('deepseek-chat'),
    }),
    services: z.array(ServiceConfigSchema).min(1), // Must have at least one service
  }),
});

// Admin User - Full system access
export const AdminUserSchema = UserSchema.extend({
  userType: z.literal('admin_user'),
  role: z.enum(['super_admin', 'admin']),
  config: UserConfigSchema.extend({
    workflows: z.array(WorkflowConfigSchema.extend({
      permissions: z.object({
        canCreate: z.literal(true),
        canRead: z.literal(true),
        canUpdate: z.literal(true),
        canDelete: z.literal(true),
        canExecute: z.literal(true),
      }),
    })),
  }),
});

// Paid Plan User - Premium features
export const PaidPlanUserSchema = UserSchema.extend({
  userType: z.literal('paid_plan_user'),
  planTier: z.enum(['basic', 'professional', 'enterprise', 'deepseek_premium']),
  config: UserConfigSchema.extend({
    quotas: z.object({
      storageGB: z.number().int().min(10),
      apiCallsPerDay: z.number().int().min(1000),
      workflowExecutionsPerDay: z.number().int().min(100),
      maxConcurrentWorkflows: z.number().int().min(5),
    }),
  }),
});

// Free Plan User - Limited features
export const FreePlanUserSchema = UserSchema.extend({
  userType: z.literal('free_plan_user'),
  planTier: z.literal('free'),
  config: UserConfigSchema.extend({
    quotas: z.object({
      storageGB: z.number().int().max(1),
      apiCallsPerDay: z.number().int().max(100),
      workflowExecutionsPerDay: z.number().int().max(10),
      maxConcurrentWorkflows: z.number().int().max(1),
    }),
  }),
});

// =====================================================
// Create/Update Schemas
// =====================================================

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

// =====================================================
// Type Exports
// =====================================================

export type User = z.infer<typeof UserSchema>;
export type UserType = z.infer<typeof UserTypeEnum>;
export type PlanTier = z.infer<typeof PlanTierEnum>;
export type UserRole = z.infer<typeof UserRoleEnum>;
export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;

export type DeepSeekUser = z.infer<typeof DeepSeekUserSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type PaidPlanUser = z.infer<typeof PaidPlanUserSchema>;
export type FreePlanUser = z.infer<typeof FreePlanUserSchema>;

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get default config based on user type and plan
 */
export function getDefaultUserConfig(userType: UserType, planTier: PlanTier): UserConfig {
  const baseConfig: UserConfig = {
    services: [],
    workflows: [],
    features: {},
    quotas: {
      storageGB: 1,
      apiCallsPerDay: 100,
      workflowExecutionsPerDay: 10,
      maxConcurrentWorkflows: 1,
    },
    billing: {
      planTier,
      autoRenew: true,
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        sms: false,
        push: true,
        workflow: true,
      },
    },
    metadata: {},
  };

  // Customize based on user type
  switch (userType) {
    case 'deepseek_user':
      return {
        ...baseConfig,
        services: [
          {
            serviceName: 'deepseek-ai',
            enabled: true,
            limits: {
              requestsPerDay: planTier === 'free' ? 100 : 10000,
              requestsPerMinute: planTier === 'free' ? 10 : 100,
            },
            features: ['chat', 'completion', 'embeddings'],
            priority: 'high',
          },
        ],
        aiConfig: {
          enableAI: true,
          models: ['deepseek-chat', 'deepseek-coder'],
          maxTokensPerRequest: planTier === 'free' ? 1000 : 10000,
          temperature: 0.7,
          contextWindowSize: 4096,
        },
        quotas: {
          ...baseConfig.quotas,
          apiCallsPerDay: planTier === 'free' ? 100 : 10000,
        },
      };

    case 'admin_user':
      return {
        ...baseConfig,
        quotas: {
          storageGB: 1000,
          apiCallsPerDay: 1000000,
          workflowExecutionsPerDay: 10000,
          maxConcurrentWorkflows: 100,
        },
        features: {
          adminPanel: true,
          userManagement: true,
          systemMonitoring: true,
          advancedAnalytics: true,
        },
      };

    case 'paid_plan_user':
      return {
        ...baseConfig,
        quotas: {
          storageGB: planTier === 'basic' ? 10 : planTier === 'professional' ? 50 : 500,
          apiCallsPerDay: planTier === 'basic' ? 1000 : planTier === 'professional' ? 10000 : 100000,
          workflowExecutionsPerDay: planTier === 'basic' ? 100 : planTier === 'professional' ? 1000 : 10000,
          maxConcurrentWorkflows: planTier === 'basic' ? 5 : planTier === 'professional' ? 20 : 100,
        },
        features: {
          prioritySupport: true,
          advancedWorkflows: true,
          customIntegrations: planTier !== 'basic',
        },
      };

    case 'free_plan_user':
    default:
      return baseConfig;
  }
}

/**
 * Check if user has access to a specific service
 */
export function hasServiceAccess(user: User, serviceName: string): boolean {
  const service = user.config.services.find(s => s.serviceName === serviceName);
  return service?.enabled ?? false;
}

/**
 * Check if user has access to a specific workflow
 */
export function hasWorkflowAccess(user: User, workflowId: string): boolean {
  const workflow = user.config.workflows.find(w => w.workflowId === workflowId);
  return workflow?.enabled ?? false;
}

/**
 * Check if user can execute a workflow
 */
export function canExecuteWorkflow(user: User, workflowId: string): boolean {
  const workflow = user.config.workflows.find(w => w.workflowId === workflowId);
  return workflow?.permissions.canExecute ?? false;
}
