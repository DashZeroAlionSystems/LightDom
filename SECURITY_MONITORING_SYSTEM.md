# Security Monitoring System

## Overview

The Security Monitoring System provides real-time security layers for all agent instances and workflows, implementing best practices and tracking successful patterns that emerge from workflow executions.

## Features

- ✅ **Security Layers** - Configurable security profiles with best practices
- ✅ **Real-time Monitoring** - Track instance activities and prompt history
- ✅ **Security Checks** - Automated security validation (authentication, authorization, data validation, etc.)
- ✅ **Pattern Tracking** - Identify and track successful workflow patterns
- ✅ **Nested Workflows** - Support for sub-workflows within workflows
- ✅ **Security Scoring** - Automatic security score calculation (0-100)
- ✅ **Violation Tracking** - Log and monitor security violations

## Installation

```bash
# Run database migration
psql -U postgres -d lightdom -f database/migrations/202-security-monitoring-system.sql
```

## Security Layers

Security layers define security configurations that can be attached to agent instances.

### Default Security Layers

1. **Default Security Layer** (Active mode)
   - 5-minute execution timeout
   - 512MB memory limit
   - Network access allowed
   - Logs all activities
   - 60 requests per minute

2. **Strict Security Layer** (Strict mode)
   - 3-minute execution timeout
   - 256MB memory limit
   - Network access denied
   - Requires approval
   - Auto-terminates on violation
   - 30 requests per minute

### Create Custom Security Layer

```typescript
import { SecurityMonitoringService } from './services/security-monitoring.service';

const securityService = new SecurityMonitoringService(db);

const layer = await securityService.createSecurityLayer({
  name: 'Production Security Layer',
  description: 'Security layer for production instances',
  config: {
    max_execution_time: 180000,  // 3 minutes
    max_memory_mb: 1024,
    allowed_network_access: true,
    require_approval: false,
    auto_terminate_on_violation: true,
    log_all_activities: true,
    max_requests_per_minute: 100
  },
  monitoring_mode: 'active'
});
```

## Instance Security Profiles

Attach security layers to instances to enable monitoring.

### Attach Security Layer

```typescript
// Attach layer to instance with prompt context
const profile = await securityService.attachSecurityLayerToInstance(
  instanceId,
  layerId,
  'Create a new SEO campaign for client X'
);
```

### Get Security Profile

```typescript
const profile = await securityService.getInstanceSecurityProfile(instanceId);

console.log(profile);
// {
//   profile_id: '...',
//   instance_id: '...',
//   layer_id: '...',
//   prompt_history: [...],
//   activity_log: [...],
//   security_score: 95,
//   status: 'secure'
// }
```

## Security Checks

The system performs automated security checks on instances.

### Available Check Types

1. **authentication** - Verifies instance authentication
2. **authorization** - Validates permissions and scope
3. **data_validation** - Checks data validation rules
4. **rate_limiting** - Monitors request rates
5. **input_sanitization** - Validates input sanitization
6. **output_encoding** - Checks output encoding

### Run Security Checks

```typescript
const checks = await securityService.runSecurityChecks(instanceId);

console.log(checks);
// [
//   {
//     check_id: '...',
//     instance_id: '...',
//     check_type: 'authentication',
//     status: 'passed',
//     severity: 'medium',
//     description: 'Instance authentication verified',
//     details: { method: 'api_key', verified: true }
//   },
//   ...
// ]
```

### Security Check Statuses

- **passed** - Check passed successfully
- **failed** - Check failed (security issue detected)
- **warning** - Check passed with warnings
- **monitoring** - Check is in monitoring mode

### Severity Levels

- **low** - Minor security considerations
- **medium** - Important security checks
- **high** - Critical security validations
- **critical** - Essential security requirements

## Activity Logging

Track all instance activities and prompts.

### Log Activity

```typescript
await securityService.logInstanceActivity(instanceId, {
  action: 'execute_workflow',
  details: {
    workflow_id: '...',
    duration_ms: 1500
  },
  prompt: 'Generate SEO-optimized content'
});
```

### Activity History

All activities are logged in the `activity_log` field:

```json
[
  {
    "action": "security_layer_attached",
    "timestamp": "2025-11-04T...",
    "details": {}
  },
  {
    "action": "execute_workflow",
    "timestamp": "2025-11-04T...",
    "details": {
      "workflow_id": "...",
      "duration_ms": 1500
    }
  }
]
```

## Workflow Patterns

Track successful patterns that emerge from workflow executions.

### Pattern Types

1. **successful** - Patterns that complete successfully
2. **failed** - Patterns that fail
3. **optimized** - Optimized execution patterns
4. **security_compliant** - Patterns that meet security requirements

### Track Pattern

```typescript
await securityService.trackWorkflowPattern(
  workflowId,
  'successful',
  {
    duration_ms: 2500,
    success: true,
    security_score: 95
  }
);
```

### Get Successful Patterns

```typescript
// Get patterns with 80%+ success rate
const patterns = await securityService.getSuccessfulPatterns(80);

console.log(patterns);
// [
//   {
//     pattern_id: '...',
//     workflow_id: '...',
//     pattern_type: 'successful',
//     execution_count: 15,
//     success_rate: 93.33,
//     avg_duration_ms: 2300,
//     security_score: 92,
//     emerged_at: '2025-11-04T...'
//   },
//   ...
// ]
```

Patterns are automatically tracked with:
- **execution_count** - Number of times pattern has been seen
- **success_rate** - Percentage of successful executions
- **avg_duration_ms** - Average execution duration
- **security_score** - Average security score

## Nested Workflows (Sub-workflows)

Workflows can include other workflows as sub-workflows.

### Add Sub-workflow

```typescript
import { AgentManagementService } from './services/agent-management.service';

const agentService = new AgentManagementService(db);

// Add child workflow to parent workflow
await agentService.addSubWorkflow(
  parentWorkflowId,
  childWorkflowId,
  executionOrder,  // 0, 1, 2, etc.
  {                // Optional condition
    status: 'success',
    score_above: 80
  }
);
```

### Execute Workflow with Sub-workflows

```typescript
const execution = await agentService.executeWorkflowWithSubWorkflows(
  parentWorkflowId,
  { input: 'data' }
);

// Executes parent workflow
// Then executes all sub-workflows in order
// Sub-workflows only execute if conditions are met
```

### Get Sub-workflows

```typescript
const subWorkflows = await agentService.getSubWorkflows(parentWorkflowId);

console.log(subWorkflows);
// [
//   {
//     subworkflow_id: '...',
//     parent_workflow_id: '...',
//     child_workflow_id: '...',
//     child_workflow_name: 'Data Validation Workflow',
//     workflow_type: 'sequential',
//     execution_order: 0,
//     condition: { status: 'success' }
//   },
//   ...
// ]
```

## API Endpoints

### Security Layers

```bash
# Create security layer
POST /api/security/layers
{
  "name": "Custom Layer",
  "config": { ... },
  "monitoring_mode": "active"
}

# Get security layer
GET /api/security/layers/:layer_id
```

### Instance Security

```bash
# Attach security layer to instance
POST /api/security/instances/:instance_id/attach-layer
{
  "layer_id": "...",
  "prompt_context": "..."
}

# Get instance security profile
GET /api/security/instances/:instance_id/profile

# Run security checks
POST /api/security/instances/:instance_id/check

# Get security checks
GET /api/security/instances/:instance_id/checks?limit=100

# Log activity
POST /api/security/instances/:instance_id/log-activity
{
  "action": "execute_workflow",
  "details": { ... },
  "prompt": "..."
}
```

### Workflow Patterns

```bash
# Track pattern
POST /api/security/patterns
{
  "workflow_id": "...",
  "pattern_type": "successful",
  "execution_data": {
    "duration_ms": 2500,
    "success": true,
    "security_score": 95
  }
}

# Get successful patterns
GET /api/security/patterns/successful?min_success_rate=80
```

### Sub-workflows

```bash
# Add sub-workflow (via agent management API)
POST /api/agent/workflows/:parent_id/subworkflows
{
  "child_workflow_id": "...",
  "execution_order": 0,
  "condition": { ... }
}

# Get sub-workflows
GET /api/agent/workflows/:parent_id/subworkflows

# Execute with sub-workflows
POST /api/agent/workflows/:workflow_id/execute-with-subs
{
  "input_data": { ... }
}
```

## Security Scoring

Security scores are calculated automatically based on check results.

### Score Calculation

- **Passed check**: 100 points
- **Monitoring check**: 75 points
- **Warning check**: 50 points
- **Failed check**: 0 points

Final score = (Total points / Max possible points) × 100

### Status Based on Score

- **90-100**: Secure
- **70-89**: Monitoring
- **50-69**: Warning
- **0-49**: Compromised

## Best Practices

1. **Always attach security layers** to production instances
2. **Use strict mode** for sensitive operations
3. **Monitor security scores** regularly
4. **Review security checks** daily
5. **Track successful patterns** to identify best practices
6. **Use nested workflows** for complex operations
7. **Set appropriate conditions** on sub-workflows
8. **Log all critical activities** for audit trails

## Example: Complete Setup

```typescript
import { Pool } from 'pg';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { AgentManagementService } from './services/agent-management.service';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const securityService = new SecurityMonitoringService(db);
const agentService = new AgentManagementService(db);

// 1. Create security layer
const layer = await securityService.createSecurityLayer({
  name: 'Production Layer',
  monitoring_mode: 'active'
});

// 2. Create instance
const instance = await agentService.createInstance({
  session_id: sessionId,
  name: 'SEO Agent',
  model_name: 'deepseek-coder'
});

// 3. Attach security layer
await securityService.attachSecurityLayerToInstance(
  instance.instance_id,
  layer.layer_id,
  'Generate SEO campaign'
);

// 4. Run security checks
const checks = await securityService.runSecurityChecks(instance.instance_id);

// 5. Create parent workflow
const parentWorkflow = await agentService.createWorkflow({
  name: 'Main SEO Workflow',
  workflow_type: 'sequential',
  configuration: {}
});

// 6. Create child workflow
const childWorkflow = await agentService.createWorkflow({
  name: 'Content Generation',
  workflow_type: 'parallel',
  configuration: {}
});

// 7. Add as sub-workflow
await agentService.addSubWorkflow(
  parentWorkflow.workflow_id,
  childWorkflow.workflow_id,
  0,
  { status: 'success' }
);

// 8. Execute with monitoring
await securityService.logInstanceActivity(instance.instance_id, {
  action: 'start_workflow',
  prompt: 'Execute main workflow'
});

const execution = await agentService.executeWorkflowWithSubWorkflows(
  parentWorkflow.workflow_id,
  { target: 'website.com' }
);

// 9. Track pattern
await securityService.trackWorkflowPattern(
  parentWorkflow.workflow_id,
  'successful',
  {
    duration_ms: execution.duration_ms,
    success: true,
    security_score: 95
  }
);

// 10. Get profile and patterns
const profile = await securityService.getInstanceSecurityProfile(instance.instance_id);
const patterns = await securityService.getSuccessfulPatterns(80);

console.log('Security Score:', profile.security_score);
console.log('Successful Patterns:', patterns.length);
```

## Monitoring Dashboard

Query for security overview:

```sql
-- Instance security overview
SELECT 
  isp.*,
  sl.name as layer_name,
  sl.monitoring_mode,
  ai.name as instance_name
FROM instance_security_profiles isp
JOIN security_layers sl ON isp.layer_id = sl.layer_id
JOIN agent_instances ai ON isp.instance_id = ai.instance_id
ORDER BY isp.security_score DESC;

-- Recent security checks
SELECT 
  check_type,
  status,
  severity,
  COUNT(*) as count
FROM security_checks
WHERE checked_at > NOW() - INTERVAL '24 hours'
GROUP BY check_type, status, severity
ORDER BY severity DESC, count DESC;

-- Top successful patterns
SELECT 
  wp.*,
  w.name as workflow_name
FROM workflow_patterns wp
JOIN agent_workflows w ON wp.workflow_id = w.workflow_id
WHERE pattern_type = 'successful'
  AND success_rate >= 80
ORDER BY success_rate DESC, execution_count DESC
LIMIT 10;
```

## Troubleshooting

### Low Security Score

Check recent failed checks:
```sql
SELECT * FROM security_checks 
WHERE instance_id = '...' 
  AND status = 'failed'
ORDER BY checked_at DESC;
```

### Pattern Not Emerging

Ensure:
1. Workflow has executed at least 3 times
2. Pattern type is set correctly
3. Success rate is being calculated
4. Tracking is enabled

### Sub-workflow Not Executing

Check:
1. Condition is being met
2. Sub-workflow is marked as active
3. Parent workflow completed successfully
4. Execution order is correct
