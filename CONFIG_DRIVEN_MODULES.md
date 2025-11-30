# Config-Driven Modular Architecture - Services & Workflows

**Date:** November 6, 2025  
**Version:** 2.1 - Fully Modular Standalone Modules  
**Schema:** database/migrations/205-enhanced-user-schema.sql

---

## Overview

Services and workflows are **standalone modules** that are **ONLY loaded/active when explicitly included in user configuration**. This provides complete control over what runs for each user type, plan, or individual user.

## Core Principle

> **A module (service or workflow) is loaded if and ONLY if:**
>
> 1. A mapping exists in `user_services` or `user_workflows` table
> 2. The `enabled` column is `TRUE`
> 3. The module's `is_active` is `TRUE`

---

## Module Structure

### Service Module

Each service is a self-contained, standalone module:

```typescript
// Service Module Structure
{
  service_name: 'deepseek-ai',           // Unique identifier
  module_path: 'src/services/deepseek-ai', // Module location
  entry_point: 'index.ts',               // Main file
  dependencies: ['axios', '@deepseek/sdk'], // Required packages
  default_config: {                      // Default settings
    models: ['deepseek-reasoner', 'deepseek-coder'],
    maxTokens: 4096,
    temperature: 0.7
  },
  is_standalone: true,                   // Runs independently
  auto_load: true,                       // Load on startup if enabled
  load_priority: 10                      // Lower = load first
}
```

### Workflow Module

Each workflow is a self-contained, standalone module:

```typescript
// Workflow Module Structure
{
  name: 'Content Approval Pipeline',
  module_path: 'src/workflows/content-approval',
  entry_point: 'index.ts',
  dependencies: [],                      // Required packages/services
  workflow_schema: {                     // Workflow definition
    steps: [...],
    transitions: [...]
  },
  requires_services: ['deepseek-ai', 'workflow-automation'],
  is_standalone: true,
  auto_load: false,
  load_priority: 50
}
```

---

## Config-Driven Inclusion/Exclusion

### Including a Service for a User

```sql
-- Method 1: Direct insertion
INSERT INTO user_services (user_id, service_id, enabled, config)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- user_id
  (SELECT id FROM services WHERE service_name = 'deepseek-ai'),
  true,  -- enabled
  '{"maxTokensPerRequest": 8000}'  -- custom config
);

-- The service is NOW active for this user
```

### Excluding a Service from a User

```sql
-- Method 1: Delete the mapping (complete exclusion)
DELETE FROM user_services
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND service_id = (SELECT id FROM services WHERE service_name = 'deepseek-ai');

-- Method 2: Disable (keeps mapping but deactivates)
UPDATE user_services
SET enabled = false
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND service_id = (SELECT id FROM services WHERE service_name = 'deepseek-ai');

-- The service is NOW inactive for this user
```

### Including a Workflow for a User

```sql
INSERT INTO user_workflows (user_id, workflow_template_id, enabled, permissions)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  (SELECT id FROM workflow_templates WHERE name = 'Content Approval Pipeline'),
  true,
  '{"canCreate": true, "canRead": true, "canUpdate": true, "canDelete": false, "canExecute": true}'
);
```

### Excluding a Workflow from a User

```sql
-- Method 1: Delete the mapping
DELETE FROM user_workflows
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND workflow_template_id = (SELECT id FROM workflow_templates WHERE name = 'Content Approval Pipeline');

-- Method 2: Disable
UPDATE user_workflows
SET enabled = false
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND workflow_template_id = (SELECT id FROM workflow_templates WHERE name = 'Content Approval Pipeline');
```

---

## Availability Rules

### User Type & Plan Filtering

Services and workflows define which user types and plans can access them:

```sql
-- Service availability example
UPDATE services
SET available_for_user_types = '["deepseek_user", "admin_user", "paid_plan_user"]',
    available_for_plans = '["basic", "professional", "enterprise", "deepseek_premium"]',
    excluded_for_user_types = '[]',  -- No exclusions
    excluded_for_plans = '["free"]'  -- Free plan explicitly excluded
WHERE service_name = 'deepseek-ai';
```

### Availability Check Logic

```sql
-- Check if user CAN have a service (not if they DO have it)
SELECT
  s.service_name,
  (u.user_type = ANY(string_to_array(s.available_for_user_types::text, ',')::varchar[])) as type_allowed,
  (u.plan_tier = ANY(string_to_array(s.available_for_plans::text, ',')::varchar[])) as plan_allowed,
  NOT (u.user_type = ANY(string_to_array(s.excluded_for_user_types::text, ',')::varchar[])) as not_excluded_type,
  NOT (u.plan_tier = ANY(string_to_array(s.excluded_for_plans::text, ',')::varchar[])) as not_excluded_plan
FROM services s
CROSS JOIN users_enhanced u
WHERE u.id = '123e4567-e89b-12d3-a456-426614174000'
  AND s.service_name = 'deepseek-ai';
```

---

## Module Loading

### On User Login

When a user logs in, the system loads ONLY the modules enabled in their config:

```sql
-- Get all services to load
SELECT * FROM get_active_services_for_user('user-id-here');

-- Returns:
-- service_name | module_path | entry_point | config | load_on_startup | load_priority
-- deepseek-ai  | src/services/deepseek-ai | index.ts | {...} | true | 10
-- workflow-automation | src/services/workflow-automation | index.ts | {...} | true | 20
```

```sql
-- Get all workflows to load
SELECT * FROM get_active_workflows_for_user('user-id-here');

-- Returns:
-- workflow_id | workflow_name | module_path | entry_point | config | permissions | load_on_startup | load_priority
-- uuid-1 | Content Approval | src/workflows/content-approval | index.ts | {...} | {...} | false | 50
```

### Dynamic Module Loading (TypeScript)

```typescript
// Module loader service
class ModuleLoader {
  async loadUserModules(userId: string) {
    // Get active services
    const services = await db.query('SELECT * FROM get_active_services_for_user($1)', [userId]);

    // Load each service module
    for (const service of services.rows) {
      if (service.load_on_startup) {
        const modulePath = path.join(process.cwd(), service.module_path, service.entry_point);
        const module = await import(modulePath);

        // Initialize with user-specific config
        await module.initialize(service.config);

        console.log(`Loaded service: ${service.service_name}`);
      }
    }

    // Get active workflows
    const workflows = await db.query('SELECT * FROM get_active_workflows_for_user($1)', [userId]);

    // Load each workflow module
    for (const workflow of workflows.rows) {
      if (workflow.load_on_startup) {
        const modulePath = path.join(process.cwd(), workflow.module_path, workflow.entry_point);
        const module = await import(modulePath);

        // Initialize with user-specific config and permissions
        await module.initialize(workflow.config, workflow.permissions);

        console.log(`Loaded workflow: ${workflow.workflow_name}`);
      }
    }
  }
}
```

---

## User Type Examples

### DeepSeek User

**Default Services:**

- `deepseek-ai` (enabled, auto-load)
- `workflow-automation` (enabled, auto-load)

```sql
-- Auto-setup for new DeepSeek user
INSERT INTO user_services (user_id, service_id, enabled, load_on_startup)
SELECT
  '123e4567-e89b-12d3-a456-426614174000',
  id,
  true,
  auto_load
FROM services
WHERE service_name IN ('deepseek-ai', 'workflow-automation');
```

### Admin User

**Default Services:** ALL (auto-enabled)

```sql
-- Auto-setup for new Admin user
INSERT INTO user_services (user_id, service_id, enabled, load_on_startup)
SELECT
  'admin-user-id',
  id,
  true,
  auto_load
FROM services
WHERE is_active = true;
```

### Free Plan User

**Default Services:** NONE (must be explicitly added)

Free plan users get no services by default. Services must be manually enabled.

### Paid Plan User (Professional)

**Available Services:**

- `deepseek-ai` (if plan includes AI)
- `workflow-automation`
- `data-mining`
- `analytics`

```sql
-- Setup for Professional plan user
INSERT INTO user_services (user_id, service_id, enabled, load_on_startup)
SELECT
  'professional-user-id',
  id,
  true,
  auto_load
FROM services
WHERE 'professional' = ANY(string_to_array(available_for_plans::text, ',')::varchar[])
  AND is_active = true;
```

---

## Helper Functions

### Check if Service Should Load

```sql
-- Returns TRUE only if service should be loaded for user
SELECT should_load_service('user-id', 'deepseek-ai');
```

### Check if Workflow Should Load

```sql
-- Returns TRUE only if workflow should be loaded for user
SELECT should_load_workflow('user-id', 'workflow-id');
```

### Get All Active Modules

```sql
-- Services
SELECT * FROM get_active_services_for_user('user-id');

-- Workflows
SELECT * FROM get_active_workflows_for_user('user-id');
```

---

## Configuration Examples

### Enable Service with Custom Config

```sql
INSERT INTO user_services (user_id, service_id, enabled, config, custom_limits)
VALUES (
  'user-id',
  (SELECT id FROM services WHERE service_name = 'deepseek-ai'),
  true,
  '{
    "models": ["deepseek-reasoner"],
    "maxTokensPerRequest": 8000,
    "temperature": 0.5
  }',
  '{
    "requestsPerDay": 50000,
    "requestsPerMinute": 200
  }'
);
```

### Enable Workflow with Permissions

```sql
INSERT INTO user_workflows (user_id, workflow_template_id, enabled, permissions, auto_execute)
VALUES (
  'user-id',
  (SELECT id FROM workflow_templates WHERE name = 'Content Approval Pipeline'),
  true,
  '{
    "canCreate": true,
    "canRead": true,
    "canUpdate": true,
    "canDelete": false,
    "canExecute": true
  }',
  false  -- Manual execution only
);
```

---

## Migration from Static to Config-Driven

### Before (Static)

Services were always loaded for all users:

```javascript
// Old approach - always loaded
app.use('/api/deepseek', deepseekRouter);
app.use('/api/workflows', workflowRouter);
```

### After (Config-Driven)

Services are loaded ONLY for users who have them enabled:

```javascript
// New approach - dynamic loading
app.use('/api', async (req, res, next) => {
  const userId = req.user.id;

  // Check if user has service enabled
  const hasDeepSeek = await shouldLoadService(userId, 'deepseek-ai');

  if (hasDeepSeek && req.path.startsWith('/deepseek')) {
    // Load module dynamically
    const deepseekModule = await loadServiceModule('deepseek-ai', userId);
    return deepseekModule.handler(req, res, next);
  }

  next();
});
```

---

## Best Practices

### 1. Always Check Config Before Loading

```typescript
// DON'T: Load service unconditionally
const deepseek = new DeepSeekService();

// DO: Check config first
if (await shouldLoadService(userId, 'deepseek-ai')) {
  const deepseek = await loadServiceModule('deepseek-ai', userId);
}
```

### 2. Use Transactions for Multi-Service Setup

```sql
BEGIN;

-- Enable multiple services atomically
INSERT INTO user_services (user_id, service_id, enabled)
VALUES
  ('user-id', (SELECT id FROM services WHERE service_name = 'deepseek-ai'), true),
  ('user-id', (SELECT id FROM services WHERE service_name = 'workflow-automation'), true);

COMMIT;
```

### 3. Respect Dependencies

```sql
-- Workflow requires services - check before enabling
SELECT
  wt.name,
  wt.requires_services,
  (
    SELECT array_agg(s.service_name)
    FROM user_services us
    JOIN services s ON us.service_id = s.id
    WHERE us.user_id = 'user-id' AND us.enabled = true
  ) as enabled_services
FROM workflow_templates wt
WHERE wt.name = 'Content Approval Pipeline';

-- Only enable workflow if all required services are enabled
```

### 4. Monitor Module Loading

```sql
-- Track module usage
UPDATE user_services
SET last_used = NOW(),
    usage_count = usage_count + 1,
    total_api_calls = total_api_calls + 1
WHERE user_id = 'user-id'
  AND service_id = (SELECT id FROM services WHERE service_name = 'deepseek-ai');
```

---

## Troubleshooting

### Service Not Loading

```sql
-- Debug checklist
SELECT
  s.service_name,
  s.is_active as service_active,
  us.enabled as user_enabled,
  us.load_on_startup,
  s.module_path,
  CASE
    WHEN us.id IS NULL THEN 'No mapping exists'
    WHEN NOT us.enabled THEN 'Disabled in user_services'
    WHEN NOT s.is_active THEN 'Service globally inactive'
    ELSE 'Should be loading'
  END as status
FROM services s
LEFT JOIN user_services us ON s.id = us.service_id AND us.user_id = 'user-id'
WHERE s.service_name = 'deepseek-ai';
```

### Workflow Not Executing

```sql
-- Debug checklist
SELECT
  wt.name,
  wt.is_active as workflow_active,
  uw.enabled as user_enabled,
  uw.permissions,
  wt.requires_services,
  CASE
    WHEN uw.id IS NULL THEN 'No mapping exists'
    WHEN NOT uw.enabled THEN 'Disabled in user_workflows'
    WHEN NOT wt.is_active THEN 'Workflow globally inactive'
    WHEN NOT (uw.permissions->>'canExecute')::boolean THEN 'Missing execute permission'
    ELSE 'Should be executable'
  END as status
FROM workflow_templates wt
LEFT JOIN user_workflows uw ON wt.id = uw.workflow_template_id AND uw.user_id = 'user-id'
WHERE wt.name = 'Content Approval Pipeline';
```

---

## Summary

✅ **Services and workflows are standalone modules**  
✅ **Modules are ONLY active when explicitly enabled in config**  
✅ **Complete inclusion/exclusion control by user type and plan**  
✅ **Dynamic loading based on user configuration**  
✅ **No module runs without user_services/user_workflows mapping**

This provides **complete config-driven control** over what services and workflows run for each user.

---

**Last Updated:** November 6, 2025  
**Schema Version:** 2.1  
**Status:** ✅ Production Ready
