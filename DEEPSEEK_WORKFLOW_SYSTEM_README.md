# DeepSeek Schema-Driven Workflow System

## Overview

The DeepSeek Schema-Driven Workflow System is a comprehensive AI-powered automation platform that enables self-organizing workflows, intelligent schema generation, and campaign management through natural language interaction.

## Key Features

### 🤖 DeepSeek AI Integration
- **Natural Language Workflow Generation**: Describe workflows in plain English
- **Intelligent Prompt Templates**: Pre-configured templates for common tasks
- **Chain-of-Thought Reasoning**: Advanced reasoning patterns for complex problems
- **Memory Management**: Contextual memory with semantic search
- **Self-Improvement**: AI can suggest and implement system optimizations

### 🗺️ Self-Organizing Schema Maps
- **Automatic Schema Generation**: AI generates JSON schemas from descriptions
- **Relationship Detection**: Automatically identifies links between schemas
- **Schema Maps**: Generates complete data models with relationships
- **Multiple Schema Types**: JSON Schema, GraphQL, Database schemas, Component schemas
- **Validation Rules**: Auto-generated validation logic

### ⚙️ Workflow Orchestration
- **Multi-Step Workflows**: Complex pipelines with dependencies
- **Parallel Execution**: Run independent tasks concurrently
- **Live Data Streams**: Real-time data connections
- **State Management**: Checkpoint and resume workflows
- **Error Handling**: Configurable retry and failure strategies
- **Monitoring**: Real-time metrics and alerts

### 🔄 N8N Integration
- **Visual Workflow Editor**: Convert LightDom workflows to N8N
- **Bi-Directional Sync**: Changes sync between platforms
- **Workflow Blocks**: Pre-built blocks for common operations
- **API Integration**: Full N8N API support

### 📦 Git-Based State Management
- **Version Control**: All workflow states in Git
- **Rollback**: Revert to any previous state
- **Tagging**: Mark important states
- **Remote Sync**: Sync state across instances
- **Audit Trail**: Complete history of changes

### 📊 SEO Campaign Management
- **Campaign Templates**: Pre-configured SEO workflows
- **Trend Following**: Auto-configure based on current trends
- **Monitoring**: Track campaign performance
- **Recommendations**: AI-powered optimization suggestions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DeepSeek AI Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Prompt Engine│  │Schema Generator│  │Self-Improver │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Workflow Orchestration                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Task Engine  │  │ State Manager│  │  Monitoring  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  N8N Service │  │ Git State Mgr│  │ Data Streams │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Crawler    │  │ SEO Analyzer │  │  ML Engine   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Configuration

Set environment variables:

```bash
# DeepSeek API
export DEEPSEEK_API_KEY=your_api_key
export DEEPSEEK_API_URL=https://api.deepseek.com/v1
export DEEPSEEK_MODEL=deepseek-chat

# N8N Integration
export N8N_API_URL=http://localhost:5678/api/v1
export N8N_API_KEY=your_n8n_api_key
export N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Git State Management
export GIT_STATE_REPO=git@github.com:yourorg/lightdom-state.git
```

### 2. Generate a Workflow

```typescript
import { WorkflowOrchestrator } from './services/workflow-orchestrator';
import { DeepSeekConfigLoader } from './config/deepseek-config';

const config = new DeepSeekConfigLoader();
const orchestrator = new WorkflowOrchestrator(config.getConfig());

// Generate workflow from natural language
const workflow = await orchestrator.generateWorkflow(
  'Create an SEO campaign that crawls my website, analyzes content, and generates optimization recommendations'
);

// Execute the workflow
const execution = await orchestrator.executeWorkflow(workflow.id, {
  targetUrl: 'https://example.com'
});
```

### 3. Generate Schemas

```typescript
import { SchemaGeneratorService } from './services/schema-generator';

const schemaGenerator = new SchemaGeneratorService();

// Generate a schema
const schema = await schemaGenerator.generateSchema({
  description: 'User profile with preferences and settings',
  options: {
    includeValidation: true,
    generateRelationships: true
  }
});

// Generate a complete schema map
const schemaMap = await schemaGenerator.generateSchemaMap(
  'E-commerce system with products, orders, customers, and payments'
);
```

### 4. Use Prompt Templates

```typescript
import { DeepSeekPromptEngine } from './services/deepseek-prompt-engine';

const promptEngine = new DeepSeekPromptEngine(config.getConfig());

// Generate a prompt from template
const prompt = promptEngine.generatePrompt('workflow-generation', {
  userRequest: 'Analyze competitor SEO strategies',
  domainContext: 'E-commerce, fashion industry'
});
```

### 5. Manage State with Git

```typescript
import { GitStateManager } from './services/git-state-manager';

const stateManager = new GitStateManager({
  repository: process.env.GIT_STATE_REPO,
  branch: 'state/production',
  autoCommit: true,
  commitMessage: 'Update workflow state',
  conflictResolution: 'theirs'
});

// Save workflow state
await stateManager.saveWorkflowState(workflowId, workflowState);

// Get history
const history = await stateManager.getHistory(`workflows/${workflowId}.json`);

// Rollback
await stateManager.rollback(3); // Rollback 3 commits
```

## API Endpoints

### Configuration

```bash
# Get configuration
GET /api/deepseek/config

# Update configuration
PUT /api/deepseek/config
```

### Templates

```bash
# List templates
GET /api/deepseek/templates

# Generate prompt from template
POST /api/deepseek/prompt/generate
```

### Schemas

```bash
# Generate schema
POST /api/deepseek/schema/generate

# Generate schema map
POST /api/deepseek/schema/map/generate

# Get schema
GET /api/deepseek/schema/:schemaId

# List schemas
GET /api/deepseek/schemas
```

### Workflows

```bash
# Generate workflow
POST /api/deepseek/workflow/generate

# Execute workflow
POST /api/deepseek/workflow/:workflowId/execute

# Get workflow
GET /api/deepseek/workflow/:workflowId

# List workflows
GET /api/deepseek/workflows
```

### State Management

```bash
# Get state history
GET /api/deepseek/state/history/:entityType/:entityId

# Rollback state
POST /api/deepseek/state/rollback

# Create tag
POST /api/deepseek/state/tag

# List tags
GET /api/deepseek/state/tags

# Sync with remote
POST /api/deepseek/state/sync
```

## Configuration Files

### System Defaults (`/src/config/system-defaults.json`)

Contains default configurations for:
- Naming conventions
- Behavior settings
- SEO trends
- LLM schema patterns
- Data mining strategies
- Monitoring metrics
- N8N integration
- Git state management
- Subscription plans

### DeepSeek Config (`/src/config/deepseek-config.ts`)

Configures:
- API settings (URL, key, model, timeout)
- Memory management (context window, retention, persistence)
- Reasoning patterns (chain-of-thought, self-reflection)
- Naming conventions (schemas, workflows, components)
- Behavior (auto-generate, validate, safety mode)

## Workflow Templates

### SEO Campaign Workflow
- Sitemap discovery
- URL prioritization
- Page crawling
- SEO analysis
- Content analysis
- Technical audit
- Recommendations generation
- Report creation

### Data Mining & Training Workflow
- Data source discovery
- Data extraction
- Data cleaning
- Feature engineering
- Model training
- Model evaluation

## Prompt Templates

1. **Workflow Generation**: Generate complete workflows from descriptions
2. **Schema Generation**: Create linked schema maps
3. **Component Generation**: Generate React components from schemas
4. **Campaign Optimization**: Optimize SEO campaigns
5. **Data Mining Strategy**: Determine what data to mine
6. **Self-Improvement**: Analyze and improve system performance

## Safety Features

### Sandboxed Execution
- Workflows run in isolated containers
- Limited system access
- Resource constraints enforced

### Approval Workflows
- Human approval required for critical changes
- Configurable approval thresholds
- Audit logging of all approvals

### Rollback Capabilities
- Git-based state versioning
- One-click rollback to any previous state
- Tag important states for easy recovery

### Bounded Self-Modification
- Maximum modification limits
- Safety validation before execution
- Reversible changes only

## N8N Integration

### Convert LightDom to N8N

```typescript
import { N8NIntegrationService } from './services/n8n-integration';

const n8nService = new N8NIntegrationService({
  apiUrl: process.env.N8N_API_URL,
  apiKey: process.env.N8N_API_KEY,
  webhookUrl: process.env.N8N_WEBHOOK_URL
});

// Convert workflow
const n8nWorkflow = n8nService.convertToN8N(lightdomWorkflow);

// Create in N8N
const { id, url } = await n8nService.createWorkflow(n8nWorkflow);
```

### Workflow Blocks

Pre-built blocks for visual editor:
- Web Crawler
- SEO Analyzer
- Schema Generator
- Data Processor
- ML Training
- DeepSeek AI
- Campaign Monitor

## Monitoring & Metrics

### Workflow Metrics
- Execution duration
- Success rate
- Task completion rate
- Error rate
- Resource usage

### Campaign Metrics
- Organic traffic
- Keyword rankings
- Conversion rate
- Page load time
- Schema validation errors

### Alerts
- Ranking drops
- Traffic drops
- High error rates
- Long execution times
- Low success rates

## Best Practices

### 1. Start with Templates
Use pre-built workflow templates and customize as needed.

### 2. Use Descriptive Names
Follow naming conventions for consistency:
- Schemas: `{domain}_{entity}_schema`
- Workflows: `{purpose}_{timestamp}_workflow`
- Components: `{Component}{Type}`

### 3. Enable Monitoring
Always enable monitoring for production workflows.

### 4. Set Appropriate Timeouts
Configure realistic timeouts based on task complexity.

### 5. Use Git State Management
Enable state versioning for critical workflows.

### 6. Review AI Recommendations
Always review AI-generated workflows before production deployment.

## Troubleshooting

### DeepSeek API Errors
- Check API key configuration
- Verify API URL and endpoint
- Check rate limits

### Workflow Execution Failures
- Review task dependencies
- Check service availability
- Verify input data format

### State Sync Issues
- Check Git credentials
- Verify repository access
- Review conflict resolution settings

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Support

- Documentation: [docs/](../docs/)
- Issues: [GitHub Issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- Discussions: [GitHub Discussions](https://github.com/DashZeroAlionSystems/LightDom/discussions)
