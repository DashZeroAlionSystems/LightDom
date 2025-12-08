# Agent Mode Orchestration System

> **AI-Powered Error Investigation, Task Automation, and GitHub Integration**

## Overview

The Agent Mode Orchestration System provides a comprehensive framework for automated error investigation, code generation, and GitHub workflow automation using DeepSeek AI agents. It integrates multiple services to create an intelligent, self-improving development pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Agent Orchestration Integration                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Health     │  │ Investigation│  │    Agent     │          │
│  │   Checks     │  │   Service    │  │   Spawner    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   GitHub     │  │  Git MCP     │                            │
│  │ Automation   │  │   Bridge     │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ Database │        │  Ollama  │        │  GitHub  │
   │PostgreSQL│        │ DeepSeek │        │   API    │
   └──────────┘        └──────────┘        └──────────┘
```

## Key Features

### 1. **Agent Mode Investigation**
- Uses knowledge graph and indexed codebase to provide focused context
- Extracts error-related code snippets from database
- Creates targeted investigation contexts for AI agents
- Supports both error investigation and feature development

### 2. **DeepSeek Agent Spawning**
- Spawns AI agent instances for specific tasks
- Task queue with priority management
- Concurrent agent execution (configurable limit)
- Automatic retry and error handling
- Support for multiple task types:
  - Error analysis
  - Code generation
  - Code review
  - Refactoring
  - Documentation
  - Test generation

### 3. **GitHub Automation**
- Automatically creates GitHub issues from error reports
- Assigns GitHub Copilot as default assignee
- Creates draft PRs with AI-generated fixes
- Continuous task creation from error patterns
- Issue/PR lifecycle management

### 4. **Git MCP to Ollama Bridge**
- Enables git MCP server integration with Ollama
- GitHub Desktop sync pipeline automation
- AI-assisted commit message generation
- Conflict resolution suggestions
- Automatic branch creation with AI-generated names

### 5. **Bidirectional Health Checks**
- Real-time service health monitoring
- WebSocket streaming of health status
- Service dependency validation
- Pre-consumption health checks
- Sub-service health tracking

### 6. **Failproof Git Workflow**
- Multi-stage CI/CD pipeline
- Automated testing gates
- Staging deployment for PRs
- Production deployment with backup
- Automatic rollback on failure
- Post-deployment monitoring

## Quick Start

### Prerequisites

- Node.js 20.x
- PostgreSQL 15+
- Redis 7+
- Ollama with DeepSeek model
- GitHub token (for automation)

### Installation

1. **Run database migrations:**

```bash
psql -U lightdom_user -d lightdom -f migrations/007_error_reporting_system.sql
psql -U lightdom_user -d lightdom -f migrations/008_agent_mode_automation.sql
```

2. **Configure environment variables:**

```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=your_org
GITHUB_REPO_NAME=your_repo

# Ollama Configuration
OLLAMA_ENDPOINT=http://127.0.0.1:11434
OLLAMA_MODEL=deepseek-coder

# Database
DATABASE_URL=postgresql://lightdom_user:lightdom_password@localhost:5432/lightdom
```

3. **Start services:**

```bash
# Start with Docker Compose (includes n8n, postgres, redis, ollama)
docker-compose up -d

# Or start individual services
npm run start:orchestration
```

### Basic Usage

#### 1. Initialize Orchestration

```javascript
import { AgentOrchestrationIntegration } from './services/agent-orchestration-integration.service.js';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const orchestration = new AgentOrchestrationIntegration({
  db: pool,
  enableHealthChecks: true,
  enableGitHubAutomation: true,
  enableGitMcpBridge: true,
  continuousTaskCreation: true,
});

await orchestration.initialize();
```

#### 2. Handle Error Report

```javascript
// Automatically investigate error and queue agent task
const result = await orchestration.handleErrorReport(errorReportId);

console.log(`Task queued: ${result.taskId}`);
// Investigation context created with relevant files
// Agent task queued for analysis
// GitHub issue will be created if confidence is high
```

#### 3. Handle Feature Request

```javascript
const result = await orchestration.handleFeatureRequest(
  'Add user authentication with JWT',
  ['auth', 'users', 'api']
);

// Investigation context created
// Code generation task queued
// GitHub issue created with Copilot assigned
```

#### 4. Check System Status

```javascript
const status = orchestration.getStatus();

console.log('Services:', status.services);
console.log('Active agents:', status.services.agentSpawner.activeAgents);
console.log('Queue status:', status.services.agentSpawner.queueStatus);
```

## API Endpoints

### Health & Status

```http
GET /api/agent-orchestration/status
GET /api/agent-orchestration/health
GET /api/agent-orchestration/health/:serviceId
```

### Investigation

```http
POST /api/agent-orchestration/investigate/error/:errorReportId
POST /api/agent-orchestration/investigate/feature
Body: { "description": "...", "components": ["..."] }
```

### Agent Tasks

```http
POST /api/agent-orchestration/agent/task
Body: { "type": "error_analysis", "priority": 3, "context": {...} }

GET /api/agent-orchestration/agent/task/:taskId
GET /api/agent-orchestration/agent/:agentId
GET /api/agent-orchestration/agents/active
GET /api/agent-orchestration/queue/status
```

### GitHub Integration

```http
POST /api/agent-orchestration/github/issue/error/:errorReportId
POST /api/agent-orchestration/github/issue/task
Body: { "description": "...", "options": {...} }
```

### Git Operations

```http
POST /api/agent-orchestration/git/sync
GET /api/agent-orchestration/git/status
```

## Configuration

### Service Dependencies (`config/service-dependencies.json`)

Defines services, their health checks, and sub-service requirements:

```json
{
  "services": {
    "app": {
      "required": true,
      "healthCheck": {
        "endpoint": "/api/health",
        "interval": 30000
      },
      "subServices": ["api-server", "websocket-server"]
    },
    "deepseek-agent": {
      "healthCheck": {
        "endpoint": "/api/deepseek/health"
      },
      "subServices": [
        "agent-spawner",
        "task-queue",
        "error-analyzer"
      ]
    }
  }
}
```

### GitHub Workflows

#### Failproof Production Deploy (`.github/workflows/failproof-production-deploy.yml`)

Multi-stage deployment pipeline:
1. Code quality checks
2. Security scanning
3. Automated tests
4. Build verification
5. Staging deployment (PRs)
6. Production deployment (main branch)
7. Post-deployment monitoring

#### AI Agent Automation (`.github/workflows/ai-agent-automation.yml`)

Automated agent workflows:
- Error investigation on repository dispatch
- Continuous task creation (scheduled)
- GitHub issue creation
- Draft PR generation

## WebSocket Streaming

### Health Check Stream

Connect to real-time health updates:

```javascript
const ws = new WebSocket('ws://localhost:3002/health-stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'initial') {
    console.log('Initial health status:', data.services);
  } else if (data.type === 'update') {
    console.log(`Service ${data.serviceId} status:`, data.status);
  }
};

// Request immediate check
ws.send(JSON.stringify({
  type: 'check',
  service: 'n8n'
}));

// Check all services
ws.send(JSON.stringify({
  type: 'check-all'
}));
```

## Task Types

### Error Analysis
Analyzes errors and provides diagnosis:
- Root cause identification
- Potential fixes
- Confidence scoring
- Action recommendations

### Code Generation
Generates code from specifications:
- Implementation code
- Unit tests
- Documentation
- Integration notes

### Code Review
Reviews code for quality:
- Quality assessment
- Potential issues
- Security concerns
- Performance suggestions

### Refactoring
Refactors code for improvement:
- Maintains functionality
- Improves code quality
- Provides migration guide
- Generates tests

### Documentation
Creates comprehensive docs:
- API documentation
- Usage examples
- Configuration guides
- Common patterns

### Test Generation
Creates test suites:
- Unit tests
- Edge case tests
- Error handling tests
- Integration test suggestions

## Database Schema

### Core Tables

- `agent_investigation_contexts` - Investigation contexts for errors/features
- `deepseek_agent_instances` - Spawned agent tracking
- `deepseek_agent_tasks` - Task queue
- `github_issues` - Automated GitHub issues
- `github_pull_requests` - Automated PRs
- `service_health_status` - Real-time health tracking
- `codebase_index` - Indexed codebase for queries

### Views

- `active_agents` - Currently running agents
- `pending_tasks` - Queued tasks
- `github_issues_summary` - Issue statistics
- `service_health_summary` - Health overview

## Best Practices

### 1. Error Handling
- Always wrap agent operations in try-catch
- Implement retry logic for transient failures
- Log all errors to database for pattern analysis

### 2. Resource Management
- Configure `maxConcurrentAgents` based on available resources
- Monitor agent execution times
- Implement timeouts for long-running tasks

### 3. GitHub Integration
- Use draft PRs for AI-generated code
- Require manual review before merging
- Set up branch protection rules

### 4. Security
- Never commit secrets or tokens
- Use environment variables for sensitive config
- Redact secrets in error reports
- Validate all AI-generated code

### 5. Health Checks
- Define appropriate check intervals
- Set realistic timeout values
- Monitor consecutive failure counts
- Alert on critical service failures

## Monitoring & Debugging

### Check Service Health

```bash
curl http://localhost:3001/api/agent-orchestration/health
```

### Monitor Active Agents

```bash
curl http://localhost:3001/api/agent-orchestration/agents/active
```

### View Task Queue

```bash
curl http://localhost:3001/api/agent-orchestration/queue/status
```

### Check Git Sync Status

```bash
curl http://localhost:3001/api/agent-orchestration/git/status
```

### Database Queries

```sql
-- View active agents
SELECT * FROM active_agents;

-- View pending tasks
SELECT * FROM pending_tasks;

-- Check service health
SELECT * FROM service_health_summary;

-- View recent GitHub issues
SELECT * FROM github_issues ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Ollama Not Connecting
1. Verify Ollama is running: `curl http://127.0.0.1:11434/api/tags`
2. Check DeepSeek model is installed: `ollama list`
3. Pull model if needed: `ollama pull deepseek-coder`

### N8N Health Check Failing
1. Check n8n container: `docker-compose ps n8n`
2. View logs: `docker-compose logs n8n`
3. Verify database connection
4. Wait for startup period (30s)

### Agents Not Spawning
1. Check database connection
2. Verify Ollama is accessible
3. Check `maxConcurrentAgents` limit
4. Review agent spawner logs

### GitHub Issues Not Creating
1. Verify `GITHUB_TOKEN` is set
2. Check token permissions (issues: write)
3. Verify repository access
4. Review error logs in `error_actions` table

## Advanced Features

### Custom Task Types
Add custom agent task types:

```javascript
// In deepseek-agent-spawner.service.js
case 'custom_task':
  result = await this.executeCustomTask(agent, task);
  break;
```

### Custom Health Checks
Add service-specific health checks:

```json
{
  "services": {
    "custom-service": {
      "healthCheck": {
        "endpoint": "/health",
        "method": "GET",
        "expectedStatus": 200
      }
    }
  }
}
```

### Event Handlers
Hook into system events:

```javascript
orchestration.on('agent:completed', (agent) => {
  console.log('Agent completed:', agent.id);
});

orchestration.services.healthCheck.on('health:update', (data) => {
  console.log('Health update:', data);
});
```

## License

Private Use Only - See LICENSE_PRIVATE_USE.md

## Support

For issues or questions, create a GitHub issue or contact the development team.
