# Automation Orchestration Quick Start Guide

## What is Automation Orchestration?

The Automation Orchestration system allows you to **trigger, monitor, and manage automation workflows through a REST API**. This enables:

- **Automated task execution** via API calls
- **Agent-based task evaluation** and prioritization  
- **Scheduled automation** at specified intervals
- **Real-time monitoring** of automation jobs
- **Integration with CI/CD pipelines** through GitHub Actions

## Quick Start

### 1. Start the API Server

```bash
# Start the complete LightDom system with API server
npm run start

# Or start just the API server on port 3001
node api-server-express.js
```

The API will be available at: `http://localhost:3001/api`

### 2. Verify System Health

```bash
curl http://localhost:3001/api/automation/health
```

Expected response:
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

### 3. List Available Workflows

```bash
curl http://localhost:3001/api/automation/workflows
```

Available workflows:
- **autopilot** - Runs automated fix rounds with Cursor agent
- **compliance-check** - Runs compliance tests on the system
- **functionality-test** - Tests actual system functionality
- **enhanced-automation** - Enhanced automation with advanced features
- **quality-gates** - Runs quality gate checks

### 4. Start a Workflow

```bash
# Start compliance check
curl -X POST http://localhost:3001/api/automation/workflow/start \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "compliance-check"
  }'
```

Response includes a `jobId` to monitor the workflow:
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

### 5. Monitor Job Status

```bash
# Replace JOB_ID with your actual job ID
curl http://localhost:3001/api/automation/workflow/JOB_ID
```

### 6. Start Autopilot Mode

Autopilot automatically runs fix rounds:

```bash
curl -X POST http://localhost:3001/api/automation/autopilot/start \
  -H "Content-Type: application/json" \
  -d '{
    "maxRounds": 5,
    "config": {
      "complianceCheck": true
    }
  }'
```

## Common Use Cases

### Use Case 1: Continuous Compliance Monitoring

```bash
# Start compliance check
RESPONSE=$(curl -s -X POST http://localhost:3001/api/automation/workflow/start \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "compliance-check"}')

JOB_ID=$(echo $RESPONSE | jq -r '.data.jobId')

# Poll for completion
while true; do
  STATUS=$(curl -s http://localhost:3001/api/automation/workflow/$JOB_ID | jq -r '.data.status')
  echo "Status: $STATUS"
  
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi
  
  sleep 5
done

echo "Job completed with status: $STATUS"
```

### Use Case 2: Automated Fix Cycles

```bash
# Start autopilot with 3 rounds
curl -X POST http://localhost:3001/api/automation/autopilot/start \
  -H "Content-Type: application/json" \
  -d '{
    "maxRounds": 3,
    "config": {
      "complianceCheck": true
    }
  }'
```

### Use Case 3: View Automation Metrics

```bash
# Get comprehensive metrics
curl http://localhost:3001/api/automation/metrics

# Example output
{
  "totalJobs": 15,
  "activeJobs": 2,
  "completedJobs": 10,
  "failedJobs": 3,
  "successRate": 76.92,
  "averageExecutionTime": 180000,
  "workflowStats": {
    "compliance-check": {
      "executions": 8,
      "successes": 7,
      "failures": 1
    }
  }
}
```

## GitHub Actions Integration

The system includes a GitHub Actions workflow for automated execution:

### Trigger Manually

1. Go to **Actions** tab in your repository
2. Select **Agent-Driven Automation** workflow
3. Click **Run workflow**
4. Choose workflow type and parameters
5. Click **Run workflow** button

### Automatic Triggers

The workflow automatically runs on:
- **Schedule**: Daily at 2 AM UTC
- **Push**: When code changes in `src/` or `scripts/automation/`

## Testing

Run the test script to verify everything works:

```bash
# Make sure API server is running first
npm run start &

# Wait for server to start
sleep 5

# Run tests
node test-automation-api.js
```

Expected output:
```
🧪 Testing Automation Orchestration API

Test 1: Health Check
✅ Health: healthy
   Checks: { initialized: true, hasWorkflows: true, outputDirExists: true }

Test 2: List Available Workflows
✅ Found 5 workflows:
   - autopilot: Autopilot
   - compliance-check: Compliance Check
   - functionality-test: Functionality Test
   - enhanced-automation: Enhanced Automation
   - quality-gates: Quality Gates

...

🎉 All tests passed!
```

## Troubleshooting

### API Server Not Starting

**Problem**: Server fails to start

**Solution**:
1. Check if port 3001 is available: `lsof -i :3001`
2. Kill conflicting process: `kill -9 <PID>`
3. Start server again: `node api-server-express.js`

### Workflow Not Starting

**Problem**: Getting "Workflow not found" error

**Solution**:
1. List available workflows: `curl http://localhost:3001/api/automation/workflows`
2. Use exact `workflowId` from the list
3. Check API health: `curl http://localhost:3001/api/automation/health`

### Job Stuck in Running State

**Problem**: Job status stays "running" indefinitely

**Solution**:
1. Check output logs in `automation-output/` directory
2. Review timeout settings (default is 10 minutes)
3. Check system resources (CPU, memory)
4. View job details: `curl http://localhost:3001/api/automation/workflow/<jobId>`

### Authentication Errors

**Problem**: Getting 401 or 403 errors

**Solution**:
The current implementation doesn't require authentication for local development. In production:
1. Set up API authentication
2. Add API key to requests
3. Configure environment variables

## Next Steps

1. **Read Full Documentation**: See [AUTOMATION_ORCHESTRATION_API.md](./AUTOMATION_ORCHESTRATION_API.md)
2. **Explore Workflows**: Check existing workflows in `scripts/automation/`
3. **Create Custom Workflows**: Add your own automation workflows
4. **Set Up Scheduling**: Schedule workflows for regular execution
5. **Integrate with CI/CD**: Use GitHub Actions for automated workflows

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automation/health` | GET | System health check |
| `/api/automation/workflows` | GET | List available workflows |
| `/api/automation/workflow/start` | POST | Start a workflow |
| `/api/automation/workflow/stop` | POST | Stop a running workflow |
| `/api/automation/workflow/:jobId` | GET | Get workflow job status |
| `/api/automation/jobs` | GET | List all jobs |
| `/api/automation/autopilot/start` | POST | Start autopilot mode |
| `/api/automation/metrics` | GET | Get automation metrics |

## Support

- **Documentation**: [AUTOMATION_ORCHESTRATION_API.md](./AUTOMATION_ORCHESTRATION_API.md)
- **Issues**: Create an issue on GitHub
- **Examples**: Check `test-automation-api.js` for usage examples

---

**Happy Automating! 🤖**
