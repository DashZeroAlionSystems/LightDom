# User Schema Documentation - Config-Driven Architecture

**Date:** November 6, 2025  
**Version:** 2.0 - Enhanced with User Types and Service Management  
**Based On:** SCHEMA_AI_RESEARCH_2025.md, SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md

---

## Overview

This document describes the enhanced user schema system that separates users by type (DeepSeek, Admin, Paid, Free) and uses configuration-driven service and workflow management.

## User Types

### 1. DeepSeek User (`deepseek_user`)

**Purpose:** Users focused on AI/ML services with DeepSeek integration

**Default Configuration:**

```typescript
{
  userType: 'deepseek_user',
  role: 'user',
  planTier: 'deepseek_premium', // or 'basic', 'professional'
  config: {
    services: [
      {
        serviceName: 'deepseek-ai',
        enabled: true,
        limits: {
          requestsPerDay: 10000,
          requestsPerMinute: 100,
        },
        features: ['chat', 'completion', 'embeddings', 'code-generation'],
        priority: 'high'
      }
    ],
    aiConfig: {
      enableAI: true,
      models: ['deepseek-reasoner', 'deepseek-chat', 'deepseek-coder'],
      maxTokensPerRequest: 10000,
      temperature: 0.7,
      contextWindowSize: 4096,
      preferredModel: 'deepseek-reasoner'
    },
    quotas: {
      storageGB: 100,
      apiCallsPerDay: 20000,
      workflowExecutionsPerDay: 2000,
      maxConcurrentWorkflows: 20
    }
  }
}
```

**Services Available:**

- `deepseek-ai` - AI chat and code generation
- `workflow-automation` - Automated workflows
- `analytics` - Usage analytics
- `api-gateway` - Custom API endpoints

### 2. Admin User (`admin_user`)

**Purpose:** System administrators with full access

**Default Configuration:**

```typescript
{
  userType: 'admin_user',
  role: 'admin' | 'super_admin',
  planTier: 'enterprise',
  config: {
    workflows: [
      {
        workflowId: '...',
        workflowName: 'All Workflows',
        enabled: true,
        permissions: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          canExecute: true
        }
      }
    ],
    quotas: {
      storageGB: 1000,
      apiCallsPerDay: 1000000,
      workflowExecutionsPerDay: 10000,
      maxConcurrentWorkflows: 100
    },
    features: {
      adminPanel: true,
      userManagement: true,
      systemMonitoring: true,
      advancedAnalytics: true
    }
  }
}
```

**Services Available:** ALL

### 3. Paid Plan User (`paid_plan_user`)

**Purpose:** Users with paid subscription (Basic, Professional, Enterprise)

**Default Configuration (Professional):**

```typescript
{
  userType: 'paid_plan_user',
  role: 'user',
  planTier: 'professional',
  config: {
    quotas: {
      storageGB: 50,
      apiCallsPerDay: 10000,
      workflowExecutionsPerDay: 1000,
      maxConcurrentWorkflows: 20
    },
    features: {
      prioritySupport: true,
      advancedWorkflows: true,
      customIntegrations: true
    },
    billing: {
      planTier: 'professional',
      billingCycle: 'monthly',
      autoRenew: true
    }
  }
}
```

**Services Available:** Based on plan tier

### 4. Free Plan User (`free_plan_user`)

**Purpose:** Users on free tier with limited features

**Default Configuration:**

```typescript
{
  userType: 'free_plan_user',
  role: 'user',
  planTier: 'free',
  config: {
    quotas: {
      storageGB: 1,
      apiCallsPerDay: 100,
      workflowExecutionsPerDay: 10,
      maxConcurrentWorkflows: 1
    },
    billing: {
      planTier: 'free'
    }
  }
}
```

**Services Available:** Limited (basic workflows only)

---

## Configuration Schema Structure

### Service Configuration

```typescript
interface ServiceConfig {
  serviceName: string; // Unique service identifier
  enabled: boolean; // Is service enabled for user
  limits?: {
    requestsPerDay?: number; // Daily request limit
    requestsPerMinute?: number; // Rate limiting
    maxConcurrentRequests?: number;
    storageQuotaMB?: number; // Service-specific storage
  };
  features: string[]; // Enabled features
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}
```

### Workflow Configuration

```typescript
interface WorkflowConfig {
  workflowId: string; // UUID of workflow template
  workflowName: string; // Human-readable name
  enabled: boolean; // Is workflow accessible
  autoExecute: boolean; // Auto-execute on triggers
  permissions: {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExecute: boolean;
  };
  triggers?: string[]; // Event triggers
  schedule?: string; // Cron expression for scheduling
  metadata?: Record<string, any>;
}
```

### Complete User Config

```typescript
interface UserConfig {
  services: ServiceConfig[]; // Enabled services
  workflows: WorkflowConfig[]; // Accessible workflows
  aiConfig?: {
    enableAI: boolean;
    models: string[];
    maxTokensPerRequest?: number;
    temperature?: number;
    contextWindowSize?: number;
  };
  features: Record<string, boolean>; // Feature flags
  quotas: {
    storageGB: number;
    apiCallsPerDay: number;
    workflowExecutionsPerDay: number;
    maxConcurrentWorkflows: number;
  };
  billing: {
    subscriptionId?: string;
    planTier: PlanTier;
    billingCycle?: 'monthly' | 'yearly' | 'lifetime';
    autoRenew: boolean;
    paymentMethod?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      workflow: boolean;
    };
  };
  metadata: Record<string, any>;
}
```

---

## Schema Generation Rules

### Rule 1: User Type Determines Default Services

When creating a new user, services are automatically assigned based on user type:

**DeepSeek Users:**

- Always get `deepseek-ai` service
- AI config is mandatory and pre-populated
- Higher API call limits

**Admin Users:**

- Get ALL services by default
- Full workflow permissions
- Unlimited quotas

**Paid Plan Users:**

- Services based on plan tier
- Professional and above get advanced features
- Quotas scale with plan

**Free Plan Users:**

- Minimal service set
- Restricted quotas
- Limited workflow access

### Rule 2: Plan Tier Affects Quotas

Quotas are automatically set based on plan tier:

| Plan Tier        | Storage | API Calls/Day | Workflows/Day | Concurrent |
| ---------------- | ------- | ------------- | ------------- | ---------- |
| Free             | 1 GB    | 100           | 10            | 1          |
| Basic            | 10 GB   | 1,000         | 100           | 5          |
| Professional     | 50 GB   | 10,000        | 1,000         | 20         |
| Enterprise       | 500 GB  | 100,000       | 10,000        | 100        |
| DeepSeek Premium | 100 GB  | 20,000        | 2,000         | 20         |

### Rule 3: Service Availability by Plan

Services are available based on plan tier (stored in `services.available_for_plans`):

```sql
-- Example: DeepSeek AI service
INSERT INTO services (service_name, available_for_plans) VALUES
  ('deepseek-ai', '["basic", "professional", "enterprise", "deepseek_premium"]');

-- This service is NOT available to free plan users
```

### Rule 4: Workflow Access by User Type

Workflows are available based on user type (stored in `workflow_templates.available_for_user_types`):

```sql
-- Example: Content Approval workflow
INSERT INTO workflow_templates (name, available_for_user_types, available_for_plans) VALUES
  ('Content Approval Pipeline',
   '["admin_user", "paid_plan_user", "deepseek_user"]',
   '["professional", "enterprise", "deepseek_premium"]');
```

### Rule 5: Config Separation for Service Management

**Configuration is stored in TWO places:**

1. **User Config (JSONB in `users_enhanced.config`)** - Fast access, embedded
2. **Relational Tables (`user_services`, `user_workflows`)** - Normalized, queryable

**When to use which:**

- Use JSONB config for: Quick checks, preferences, feature flags
- Use relational tables for: Complex queries, reporting, admin management

### Rule 6: Workflow Config Determines Execution

Before executing a workflow, check:

```typescript
function canUserExecuteWorkflow(user: User, workflowId: string): boolean {
  // 1. Check if workflow is in user config
  const workflow = user.config.workflows.find(w => w.workflowId === workflowId);
  if (!workflow) return false;

  // 2. Check if enabled
  if (!workflow.enabled) return false;

  // 3. Check permissions
  if (!workflow.permissions.canExecute) return false;

  // 4. Check quota
  if (user.workflowExecutionsToday >= user.config.quotas.workflowExecutionsPerDay) {
    return false;
  }

  return true;
}
```

---

## Default Service Configurations

### DeepSeek AI Service

```json
{
  "serviceName": "deepseek-ai",
  "enabled": true,
  "limits": {
    "requestsPerDay": 10000,
    "requestsPerMinute": 100,
    "maxConcurrentRequests": 10
  },
  "features": ["chat", "completion", "embeddings", "code-generation"],
  "priority": "high",
  "metadata": {
    "models": ["deepseek-reasoner", "deepseek-chat", "deepseek-coder"],
    "defaultModel": "deepseek-reasoner",
    "maxTokens": 4096,
    "temperature": 0.7
  }
}
```

### Workflow Automation Service

```json
{
  "serviceName": "workflow-automation",
  "enabled": true,
  "limits": {
    "maxConcurrentWorkflows": 20,
    "workflowExecutionsPerDay": 1000
  },
  "features": ["scheduling", "triggers", "ai-assisted-steps"],
  "priority": "medium",
  "metadata": {
    "enableScheduling": true,
    "supportedTriggers": ["webhook", "schedule", "event"]
  }
}
```

---

## Default Workflow Configurations

### Content Approval Pipeline

```json
{
  "workflowId": "uuid-here",
  "workflowName": "Content Approval Pipeline",
  "enabled": true,
  "autoExecute": false,
  "permissions": {
    "canCreate": true,
    "canRead": true,
    "canUpdate": true,
    "canDelete": false,
    "canExecute": true
  },
  "triggers": ["manual", "webhook"],
  "metadata": {
    "category": "content",
    "requiresAI": true,
    "estimatedDuration": "5-10 minutes"
  }
}
```

---

## Usage Examples

### Creating a DeepSeek User

```typescript
import { DeepSeekUserSchema, getDefaultUserConfig } from './schemas/enhanced-user.schema';

const newUser = DeepSeekUserSchema.parse({
  email: 'user@example.com',
  name: 'John Doe',
  userType: 'deepseek_user',
  role: 'user',
  planTier: 'deepseek_premium',
  config: getDefaultUserConfig('deepseek_user', 'deepseek_premium'),
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// User automatically has:
// - DeepSeek AI service enabled
// - AI config with preferred models
// - 20,000 API calls per day
// - Access to AI-assisted workflows
```

### Checking Service Access

```typescript
import { hasServiceAccess, hasWorkflowAccess } from './schemas/enhanced-user.schema';

// Check if user can use DeepSeek AI
if (hasServiceAccess(user, 'deepseek-ai')) {
  // Execute AI request
  await deepseekAI.chat(prompt);
}

// Check if user can access workflow
if (hasWorkflowAccess(user, workflowId)) {
  // Show workflow in UI
  renderWorkflow(workflow);
}
```

### Upgrading User Plan

```typescript
async function upgradeUserPlan(userId: string, newPlan: PlanTier) {
  // 1. Update plan tier
  await db.users.update({
    where: { id: userId },
    data: {
      planTier: newPlan,
      config: getDefaultUserConfig(user.userType, newPlan),
    },
  });

  // 2. Update quotas
  const planLimits = await db.planTiers.findUnique({
    where: { tier_name: newPlan },
    select: { limits: true },
  });

  await db.userQuotas.update({
    where: { user_id: userId },
    data: {
      storage_quota_gb: planLimits.limits.storageGB,
      api_calls_per_day: planLimits.limits.apiCallsPerDay,
      workflow_executions_per_day: planLimits.limits.workflowExecutionsPerDay,
    },
  });

  // 3. Enable additional services
  const availableServices = await db.services.findMany({
    where: {
      available_for_plans: { contains: newPlan },
    },
  });

  for (const service of availableServices) {
    await db.userServices.upsert({
      where: { user_id_service_id: { user_id: userId, service_id: service.id } },
      update: { enabled: true },
      create: {
        user_id: userId,
        service_id: service.id,
        enabled: true,
        config: service.default_config,
      },
    });
  }
}
```

---

## Research References

This implementation is based on:

1. **SCHEMA_AI_RESEARCH_2025.md**
   - Agentic workflow patterns
   - AI-assisted step configurations
   - Tool schemas for service integration

2. **SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md**
   - Database introspection patterns
   - Schema-to-code generation
   - Configuration-driven architecture

3. **SCHEMA_GITHUB_PROJECTS_2025.md**
   - Zod validation patterns
   - Type-safe configuration management
   - Best practices from production systems

---

## Migration Guide

### From Simple User Schema to Enhanced Schema

```sql
-- 1. Create new tables
\i database/migrations/205-enhanced-user-schema.sql

-- 2. Migrate existing users
INSERT INTO users_enhanced (id, email, name, user_type, role, plan_tier, config, created_at, updated_at)
SELECT
  id,
  email,
  name,
  CASE
    WHEN role = 'admin' THEN 'admin_user'::VARCHAR
    ELSE 'free_plan_user'::VARCHAR
  END,
  role,
  'free'::VARCHAR,
  '{}'::JSONB,
  created_at,
  updated_at
FROM users;

-- 3. Assign default services to migrated users
-- (This is done automatically by application logic or a migration script)
```

---

## Future Enhancements

### Planned Features

1. **Dynamic Service Discovery**
   - Services can register themselves
   - Auto-populate user configs based on discovery

2. **Workflow Marketplace**
   - Users can share workflows
   - Install workflows from templates

3. **AI-Driven Config Optimization**
   - AI analyzes usage patterns
   - Suggests optimal service/workflow configurations

4. **Multi-Tenancy Support**
   - Organizations can manage multiple users
   - Shared quotas and billing

---

**Last Updated:** November 6, 2025  
**Maintained By:** LightDom Development Team  
**Status:** ✅ Production Ready
