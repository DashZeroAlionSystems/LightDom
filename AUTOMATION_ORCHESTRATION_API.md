# Automation Orchestration API Documentation

## Overview

The Automation Orchestration API provides a comprehensive system for managing, executing, and monitoring automation workflows through RESTful endpoints. It integrates with existing automation scripts and provides agent-based task evaluation and execution.

## Features

- **Workflow Management**: Start, stop, and monitor automation workflows
- **Agent Evaluation**: Intelligent task evaluation and prioritization
- **Autopilot Mode**: Automated fix cycles with agent integration
- **Scheduling**: Schedule workflows to run at specified intervals
- **Metrics**: Comprehensive metrics and reporting
- **Health Monitoring**: System health checks and status

## API Endpoints

### Base URL

```
http://localhost:3001/api
```

### Workflow Management

#### Start a Workflow

Start an automation workflow execution.

```http
POST /automation/workflow/start
```

**Request Body:**
```json
{
  "workflowId": "compliance-check",
  "config": {
    "timeout": 600000,
    "env": {
      "CUSTOM_VAR": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "workflowId": "compliance-check",
    "status": "started"
  }
}
```

#### Stop a Workflow

Stop a running workflow execution.

```http
POST /automation/workflow/stop
```

**Request Body:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "stopped"
  }
}
```

#### Get Workflow Status

Get the status of a workflow job.

```http
GET /automation/workflow/:jobId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "workflowId": "compliance-check",
    "status": "running",
    "startTime": "2025-10-22T18:00:00.000Z",
    "progress": 50,
    "metadata": {}
  }
}
```

#### List Available Workflows

Get all available automation workflows.

```http
GET /automation/workflows
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "workflowId": "autopilot",
      "name": "Autopilot",
      "description": "Runs automated fix rounds with Cursor agent",
      "script": "node",
      "args": ["scripts/automation/autopilot.js"],
      "timeout": 3600000
    },
    {
      "workflowId": "compliance-check",
      "name": "Compliance Check",
      "description": "Runs compliance tests on the system",
      "script": "npm",
      "args": ["run", "compliance:check"],
      "timeout": 600000
    }
  ]
}
```

#### List All Jobs

Get all workflow jobs (running and completed).

```http
GET /automation/jobs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "workflowId": "compliance-check",
      "status": "completed",
      "startTime": "2025-10-22T18:00:00.000Z",
      "endTime": "2025-10-22T18:05:00.000Z",
      "progress": 100
    }
  ]
}
```

### Autopilot Mode

#### Start Autopilot

Start autopilot mode for automated fix cycles.

```http
POST /automation/autopilot/start
```

**Request Body:**
```json
{
  "maxRounds": 5,
  "config": {
    "complianceCheck": true,
    "agentPromptFile": "automation-expert-prompt.txt"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "660e8400-e29b-41d4-a716-446655440001",
    "mode": "autopilot",
    "status": "started",
    "maxRounds": 5
  }
}
```

### Agent Evaluation

#### Evaluate Tasks

Evaluate tasks and create an execution plan.

```http
POST /automation/evaluate
```

**Request Body:**
```json
{
  "tasks": [
    {
      "title": "Fix build errors",
      "description": "Resolve TypeScript compilation errors in the codebase",
      "priority": "high",
      "category": "development",
      "estimatedEffort": 3
    },
    {
      "title": "Update dependencies",
      "description": "Update npm packages to latest compatible versions",
      "priority": "medium",
      "category": "maintenance"
    }
  ],
  "context": {
    "currentSystemState": {},
    "availableResources": ["cursor-agent", "automation-agent"],
    "goals": ["improve code quality", "reduce technical debt"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluationId": "eval-770e8400-e29b-41d4-a716-446655440002",
    "timestamp": "2025-10-22T18:00:00.000Z",
    "tasks": [
      {
        "id": "task-1",
        "title": "Fix build errors",
        "description": "Resolve TypeScript compilation errors in the codebase",
        "priority": "high",
        "evaluatedPriority": 85,
        "automatable": true,
        "recommendedAgent": "cursor-agent",
        "estimatedCompletionTime": 45,
        "riskLevel": "medium",
        "complexity": 0.7,
        "confidence": 0.85
      }
    ],
    "summary": {
      "totalTasks": 2,
      "automatableTasks": 2,
      "highPriorityTasks": 1,
      "estimatedTotalTime": 75,
      "riskDistribution": {
        "low": 1,
        "medium": 1,
        "high": 0
      }
    },
    "recommendations": [
      "2 tasks can be automated. Consider using agents for faster execution.",
      "1 high-priority tasks should be addressed first.",
      "Use cursor-agent for 1 task.",
      "Use automation-agent for 1 task."
    ],
    "executionPlan": {
      "phases": [
        {
          "phaseId": "phase-1",
          "name": "cursor-agent tasks",
          "tasks": ["task-1"],
          "estimatedTime": 45,
          "dependencies": [],
          "agentType": "cursor-agent"
        }
      ],
      "totalEstimatedTime": 75,
      "parallelizable": false
    }
  }
}
```

#### Execute Evaluated Tasks

Execute tasks based on evaluation.

```http
POST /automation/execute
```

**Request Body:**
```json
{
  "evaluationId": "eval-770e8400-e29b-41d4-a716-446655440002",
  "agentConfig": {
    "dryRun": false,
    "maxParallel": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "880e8400-e29b-41d4-a716-446655440003",
    "evaluationId": "eval-770e8400-e29b-41d4-a716-446655440002",
    "status": "executing"
  }
}
```

### Metrics and Monitoring

#### Get Orchestration Metrics

Get comprehensive metrics about automation execution.

```http
GET /automation/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 25,
    "activeJobs": 2,
    "completedJobs": 20,
    "failedJobs": 3,
    "successRate": 86.96,
    "averageExecutionTime": 180000,
    "workflowStats": {
      "compliance-check": {
        "executions": 10,
        "successes": 9,
        "failures": 1,
        "avgExecutionTime": 120000
      },
      "autopilot": {
        "executions": 5,
        "successes": 4,
        "failures": 1,
        "avgExecutionTime": 300000
      }
    }
  }
}
```

#### Get Evaluation History

Get history of task evaluations.

```http
GET /automation/evaluations?limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "evaluationId": "eval-770e8400-e29b-41d4-a716-446655440002",
      "timestamp": "2025-10-22T18:00:00.000Z",
      "tasks": [...],
      "summary": {...},
      "recommendations": [...],
      "executionPlan": {...}
    }
  ]
}
```

### Scheduling

#### Schedule a Workflow

Schedule a workflow to run at specified intervals.

```http
POST /automation/schedule
```

**Request Body:**
```json
{
  "workflowId": "compliance-check",
  "schedule": "every 6 hours",
  "config": {
    "timeout": 600000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleId": "990e8400-e29b-41d4-a716-446655440004",
    "workflowId": "compliance-check",
    "schedule": "every 6 hours",
    "status": "scheduled"
  }
}
```

**Schedule Formats:**
- `every N seconds`
- `every N minutes`
- `every N hours`
- `every N days`

### Health Check

#### Get System Health

Get health status of the automation orchestration system.

```http
GET /automation/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "initialized": true,
      "hasWorkflows": true,
      "outputDirExists": true
    },
    "message": "All systems operational"
  }
}
```

## Available Workflows

### Built-in Workflows

1. **autopilot**
   - Runs automated fix rounds with Cursor agent
   - Timeout: 1 hour
   - Script: `scripts/automation/autopilot.js`

2. **automation-master**
   - Orchestrates complete automation system
   - Timeout: 1 hour
   - Script: `scripts/automation/automation-master.js`

3. **compliance-check**
   - Runs compliance tests on the system
   - Timeout: 10 minutes
   - Script: `npm run compliance:check`

4. **functionality-test**
   - Tests actual system functionality
   - Timeout: 15 minutes
   - Script: `scripts/automation/functionality-test.js`

5. **enhanced-automation**
   - Enhanced automation with advanced features
   - Timeout: 30 minutes
   - Script: `scripts/automation/enhanced-automation-system.js`

6. **git-safe-automation**
   - Automation with git safety checks
   - Timeout: 30 minutes
   - Script: `scripts/automation/git-safe-automation.js`

7. **quality-gates**
   - Runs quality gate checks
   - Timeout: 15 minutes
   - Script: `scripts/automation/quality-gates.js`

8. **enterprise-organizer**
   - Organizes project structure for enterprise
   - Timeout: 10 minutes
   - Script: `scripts/automation/enterprise-organizer.js`

## Integration with GitHub Actions

The system integrates with GitHub Actions through the `agent-automation.yml` workflow:

### Trigger Automation via GitHub Actions

```yaml
# Manual trigger
workflow_dispatch:
  inputs:
    workflow_type:
      - compliance-check
      - autopilot
      - functionality-test
      - quality-gates
      - enhanced-automation

# Scheduled trigger
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC

# Push trigger
push:
  branches: [main, develop]
  paths: ['src/**', 'scripts/automation/**']
```

### Workflow Steps

1. **Agent Evaluation**: Evaluates tasks and creates execution plan
2. **Compliance Check**: Runs compliance checks
3. **Autopilot Execution**: Executes autopilot if failures detected
4. **Execute Workflow**: Runs specific workflow (manual trigger)
5. **Verify Results**: Verifies automation results
6. **Notify**: Sends notifications on completion

## Usage Examples

### Example 1: Start Compliance Check

```bash
curl -X POST http://localhost:3001/api/automation/workflow/start \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "compliance-check"
  }'
```

### Example 2: Start Autopilot with Custom Rounds

```bash
curl -X POST http://localhost:3001/api/automation/autopilot/start \
  -H "Content-Type: application/json" \
  -d '{
    "maxRounds": 3,
    "config": {
      "complianceCheck": true
    }
  }'
```

### Example 3: Evaluate and Execute Tasks

```bash
# Step 1: Evaluate tasks
curl -X POST http://localhost:3001/api/automation/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "title": "Fix linting errors",
        "description": "Run ESLint and fix all auto-fixable issues",
        "priority": "high"
      }
    ]
  }' > evaluation.json

# Step 2: Execute evaluated tasks
EVAL_ID=$(jq -r '.data.evaluationId' evaluation.json)
curl -X POST http://localhost:3001/api/automation/execute \
  -H "Content-Type: application/json" \
  -d "{
    \"evaluationId\": \"$EVAL_ID\"
  }"
```

### Example 4: Schedule Regular Compliance Checks

```bash
curl -X POST http://localhost:3001/api/automation/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "compliance-check",
    "schedule": "every 6 hours"
  }'
```

### Example 5: Monitor Job Status

```bash
# Get job status
JOB_ID="550e8400-e29b-41d4-a716-446655440000"
curl http://localhost:3001/api/automation/workflow/$JOB_ID

# Poll until completion
while true; do
  STATUS=$(curl -s http://localhost:3001/api/automation/workflow/$JOB_ID | jq -r '.data.status')
  echo "Status: $STATUS"
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi
  sleep 5
done
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found (workflow/job not found)
- `500`: Internal Server Error

## Best Practices

1. **Monitor Job Status**: Always monitor job status after starting workflows
2. **Use Timeouts**: Set appropriate timeouts for long-running workflows
3. **Schedule Wisely**: Avoid scheduling too many workflows concurrently
4. **Check Health**: Regularly check system health
5. **Review Evaluations**: Review task evaluations before execution
6. **Handle Errors**: Implement proper error handling in clients

## Security Considerations

- API should be protected with authentication in production
- Limit workflow execution permissions
- Sanitize all inputs
- Monitor for abuse
- Rate limit API endpoints
- Secure webhook URLs
- Validate workflow configurations

## Performance Tips

- Use parallel execution where possible
- Set appropriate timeouts
- Clean up old job data periodically
- Monitor resource usage
- Use scheduling for non-urgent tasks
- Cache evaluation results when appropriate

## Troubleshooting

### Workflow Not Starting

- Check if workflow ID is valid
- Verify workflow configuration
- Check system health endpoint
- Review logs in `automation-output/`

### Job Stuck in Running State

- Check if process is actually running
- Review timeout settings
- Check system resources
- Review job output logs

### Evaluation Errors

- Verify task format
- Check context data
- Review agent capabilities
- Ensure evaluation directory is writable

## Support

For issues and questions:
- Check system health: `GET /automation/health`
- Review metrics: `GET /automation/metrics`
- Check job status: `GET /automation/workflow/:jobId`
- Review logs in `automation-output/` directory
- Review evaluation results in `automation-evaluations/` directory
