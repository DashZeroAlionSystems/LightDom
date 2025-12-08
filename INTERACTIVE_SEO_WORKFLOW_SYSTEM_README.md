# Interactive SEO Workflow Creation System

## Overview

A comprehensive, configurable SEO data mining campaign system with AI-powered workflow generation. This system enables users to create and manage SEO campaigns through an interactive chat interface, leveraging DeepSeek AI for intelligent workflow creation and N8N for execution.

## Key Features

### 🤖 AI-Powered Workflow Generation

- **Interactive Chat Interface**: Claude/Copilot-style conversational UI
- **DeepSeek Integration**: Intelligent workflow generation using function calling
- **N8N Tool Chains**: Automated workflow creation following N8N standards
- **Session Management**: Track multiple workflow creation sessions

### 📊 192+ SEO Attributes

Comprehensive data mining across 9 categories:

- **SEO Core** (30 attributes): Title, meta tags, headings, links, structure
- **Structured Data** (25 attributes): JSON-LD, Open Graph, Twitter Cards, schemas
- **Performance** (20 attributes): Core Web Vitals, load times, resource metrics
- **Content Quality** (25 attributes): Readability, freshness, expertise signals
- **Technical SEO** (22 attributes): HTTPS, sitemaps, robots.txt, mobile-friendly
- **3D Layer Analysis** (20 attributes): GPU usage, paint performance, compositing
- **Visual Design** (20 attributes): Colors, typography, layout, consistency
- **User Experience** (15 attributes): Navigation, forms, trust signals
- **Competitor Metrics** (15 attributes): Rankings, backlinks, traffic estimates

### 🔄 N8N Workflow Engine

- **Pre-configured Templates**: Ready-to-use workflows for common SEO tasks
- **Dynamic Generation**: Create custom workflows via AI
- **Real-time Execution**: Monitor workflow progress in real-time
- **Error Handling**: Automatic retries and failure recovery
- **Webhook Integration**: Trigger workflows via API or schedule

### 💾 Database Persistence

- **Workflow States**: Track all workflow executions and results
- **Task Progress**: Monitor individual task completion
- **Session History**: Complete conversation and decision tracking
- **Algorithm Storage**: Cache generated extraction algorithms
- **Component Schemas**: Store UI component configurations

### 🎨 Interactive Dashboard

- **Session List**: View and manage all workflow creation sessions
- **Real-time Chat**: Natural language workflow creation
- **Progress Tracking**: Visual progress indicators for all tasks
- **Attribute Configuration**: Enable/disable specific SEO attributes
- **Live Status Updates**: WebSocket-based real-time updates

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Interactive React Dashboard                       │
│  - Chat interface                                                │
│  - Session management                                            │
│  - Progress visualization                                        │
│  - Attribute configuration                                       │
└───────────────────┬──────────────────────────────────────────────┘
                    │
                    ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                  Express API Server                              │
│  /api/seo-workflow/sessions     - Session CRUD                  │
│  /api/seo-workflow/chat         - AI-powered chat               │
│  /api/seo-workflow/attributes   - SEO config                    │
│  /api/seo-workflow/execute/:id  - Workflow execution            │
│  /api/seo-workflow/status/:id   - Real-time status              │
└───────────────────┬──────────────────────────────────────────────┘
                    │
        ┌───────────┼──────────────┐
        ↓           ↓              ↓
┌──────────────┐ ┌─────────────┐ ┌────────────────┐
│  DeepSeek AI │ │  N8N Engine │ │   PostgreSQL   │
│              │ │             │ │                │
│ - Workflow   │ │ - Execution │ │ - Sessions     │
│   generation │ │ - Monitoring│ │ - Workflows    │
│ - Algorithm  │ │ - Scheduling│ │ - Tasks        │
│   search     │ │ - Webhooks  │ │ - Attributes   │
│ - Component  │ │             │ │ - History      │
│   schemas    │ │             │ │                │
└──────────────┘ └─────────────┘ └────────────────┘
```

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- N8N (optional, for workflow execution)
- DeepSeek API key

### Setup

1. **Database Migration**

```bash
# Run the migration to create required tables
psql -U postgres -d dom_space_harvester -f database/migrations/create_seo_workflow_tables.sql
```

This creates:

- `seo_campaign_workflows` - N8N workflow configurations
- `seo_attributes_config` - All 192 SEO attributes (pre-populated)
- `workflow_tasks` - Individual task tracking
- `workflow_executions` - Execution history
- `user_sessions` - Interactive chat sessions
- `n8n_workflow_templates` - Reusable templates

2. **Environment Variables**

```bash
# DeepSeek API
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-reasoner

# N8N Integration
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/dom_space_harvester
```

3. **Install Dependencies**

```bash
npm install
```

4. **Start Services**

```bash
# Start API server (includes WebSocket support)
npm run start:dev

# Start N8N (optional)
npm run n8n:start

# Access dashboard
# Navigate to http://localhost:3000/dashboard/seo-workflow
```

## Usage

### Creating a Workflow via Chat

1. **Start a New Session**
   - Click "New" in the Sessions panel
   - The AI assistant will greet you and ask for initial information

2. **Provide Campaign Details**

   ```
   User: I want to analyze my e-commerce website at https://example.com

   AI: Great! I'll help you set up an SEO analysis campaign.
       A few questions:
       - How often should we collect data? (daily/weekly/monthly)
       - Any specific competitors to track?
       - Which attributes are most important to you?
   ```

3. **AI Generates Workflow**
   - Based on your responses, DeepSeek generates:
     - N8N workflow with appropriate nodes
     - Extraction algorithms for each attribute
     - Component schemas for dashboard visualization
     - Scheduled execution configuration

4. **Review and Execute**
   - Review the generated workflow
   - Click "Execute Now" to start data collection
   - Monitor progress in real-time

### Configuring SEO Attributes

1. Click "Configure" in the SEO Attributes panel
2. Browse attributes by category
3. Enable/disable specific attributes
4. Adjust priority levels
5. Changes automatically apply to new workflows

### Monitoring Workflow Execution

Real-time updates via WebSocket show:

- Current task being executed
- Progress percentage
- Extracted data preview
- Errors or warnings
- Overall completion status

### API Examples

**Create a Session**

```bash
curl -X POST http://localhost:3001/api/seo-workflow/sessions \
  -H "Content-Type: application/json" \
  -d '{"name": "My SEO Campaign", "userId": "user123"}'
```

**Chat with AI**

```bash
curl -X POST http://localhost:3001/api/seo-workflow/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "message": "Analyze https://example.com daily",
    "conversationHistory": []
  }'
```

**Execute Workflow**

```bash
curl -X POST http://localhost:3001/api/seo-workflow/execute/123 \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "inputData": {"targetUrl": "https://example.com"}
  }'
```

**Get Workflow Status**

```bash
curl http://localhost:3001/api/seo-workflow/status/123
```

## N8N Workflow Templates

### Comprehensive SEO Mining

Extracts all 192 attributes:

- Fetches page HTML
- Parses SEO core metrics (title, meta, headings)
- Extracts structured data (JSON-LD, Open Graph)
- Measures performance (load time, Core Web Vitals)
- Merges all data
- Saves to database
- Sends webhook notification

### Competitor Analysis

Compares your site with competitors:

- Fetches multiple competitor URLs in parallel
- Extracts key metrics from each
- Aggregates results
- Performs comparative analysis
- Saves comparison data

### Scheduled Monitoring

Automated performance tracking:

- Runs on schedule (hourly/daily/weekly)
- Fetches monitored URLs from database
- Executes SEO analysis for each
- Checks for performance degradation
- Sends alerts if thresholds exceeded
- Updates dashboard

## Component Architecture

### EnhancedDeepSeekN8NService

**Location**: `services/enhanced-deepseek-n8n-service.js`

Features:

- DeepSeek API integration with function calling
- N8N tool chain definitions
- Algorithm generation and caching
- Component schema generation
- Workflow creation and execution
- Interactive conversation management

Key Methods:

```javascript
// Generate complete SEO workflow
await service.generateCompleteSEOWorkflow(targetUrl, options);

// Search/generate algorithm for specific attribute
await service.searchOrGenerateAlgorithm(attributeName, type, context);

// Generate React component schema
await service.generateComponentSchema(attributeName, vizType, dataStructure);

// Interactive workflow creation
await service.interactiveWorkflowGeneration(messages, sessionContext);

// Create N8N workflow
await service.createN8NWorkflow(workflowData);

// Execute workflow
await service.executeN8NWorkflow(workflowId, inputData);
```

### InteractiveSEOWorkflowDashboard

**Location**: `src/components/InteractiveSEOWorkflowDashboard.tsx`

Features:

- Claude/Copilot-style chat interface
- Session list with status indicators
- Real-time message streaming
- Progress visualization
- Attribute configuration modal
- WebSocket connection for live updates

Components:

- Session sidebar with status badges
- Chat area with message history
- Input area with send button
- Workflow status timeline
- SEO attributes configuration modal

### API Routes

**Location**: `api/seo-workflow-routes.js`

Endpoints:

- `GET /sessions` - List all sessions
- `POST /sessions` - Create new session
- `GET /attributes` - Get SEO attribute config
- `POST /chat` - Process chat message
- `POST /execute/:id` - Execute workflow
- `GET /status/:id` - Get workflow status
- `PUT /attributes/:name` - Update attribute config

WebSocket Events:

- `workflow_created` - New workflow generated
- `task_progress` - Task status update
- `workflow_completed` - Workflow finished
- `workflow_failed` - Workflow error

## Database Schema

### seo_campaign_workflows

Stores workflow configurations:

- `id` - Primary key
- `campaign_id` - Associated campaign
- `name` - Workflow name
- `description` - Purpose description
- `status` - Current status
- `n8n_workflow_id` - N8N workflow ID
- `n8n_workflow_url` - N8N editor URL
- `generated_config` - Complete workflow JSON
- `execution_count` - Times executed
- `metadata` - Additional data

### seo_attributes_config

Configuration for 192 attributes (pre-populated):

- `attribute_name` - Unique attribute identifier
- `category` - Category (seo_core, performance, etc.)
- `description` - What it measures
- `data_type` - Data type (string, number, boolean, array, object)
- `extraction_algorithm` - Generated algorithm
- `component_schema` - UI component config
- `is_active` - Enabled/disabled
- `priority` - Importance level

### workflow_tasks

Individual task tracking:

- `workflow_id` - Parent workflow
- `task_name` - Task description
- `task_type` - Type (attribute_mining, analysis, etc.)
- `status` - pending, running, completed, failed
- `progress` - Percentage (0-100)
- `result` - Extracted data
- `error_message` - If failed
- `started_at`, `completed_at` - Timestamps

### user_sessions

Interactive chat sessions:

- `session_id` - Unique session ID
- `user_id` - User identifier
- `session_type` - Type of session
- `current_step` - Current workflow step
- `total_steps` - Total steps
- `conversation_history` - All messages (JSONB)
- `generated_schemas` - Schemas created
- `workflow_ids` - Associated workflows
- `status` - active, completed, paused

## Advanced Features

### Algorithm Caching

Generated algorithms are cached to avoid redundant API calls:

```javascript
const cacheKey = `${attributeName}_${dataType}_${context}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### Tool Chain Execution

DeepSeek can call multiple tools in sequence:

1. `search_algorithm` - Find/generate extraction logic
2. `create_n8n_workflow` - Create N8N workflow
3. `add_workflow_node` - Add nodes dynamically
4. `generate_component_schema` - Create UI components
5. `execute_n8n_workflow` - Run the workflow

### Real-time Progress

WebSocket updates for instant feedback:

```javascript
workflowNamespace.to(`session:${sessionId}`).emit('task_progress', {
  taskId: task.id,
  status: 'running',
  progress: 45,
  result: partialData,
});
```

### Error Handling

Comprehensive error recovery:

- Task-level retries with exponential backoff
- Workflow checkpointing
- Graceful degradation
- Detailed error logging
- User-friendly error messages

## Troubleshooting

### Common Issues

**1. DeepSeek API Errors**

```
Error: DeepSeek API key not configured
```

Solution: Set `DEEPSEEK_API_KEY` in environment variables

**2. N8N Connection Failed**

```
Error: Failed to connect to N8N
```

Solution: Ensure N8N is running and `N8N_API_URL` is correct

**3. Database Connection Issues**

```
Error: relation "seo_campaign_workflows" does not exist
```

Solution: Run the database migration script

**4. WebSocket Disconnections**

```
Warning: WebSocket disconnected. Retrying...
```

Solution: Check network connectivity, server will auto-reconnect

### Debug Mode

Enable verbose logging:

```javascript
// In enhanced-deepseek-n8n-service.js
this.config.debug = true;

// In api-server-express.js
console.log('Workflow request:', req.body);
```

## Performance Optimization

### Database Indexes

All critical queries have indexes:

- `idx_seo_workflows_campaign` on campaign_id
- `idx_workflow_tasks_workflow` on workflow_id
- `idx_user_sessions_session` on session_id

### Caching Strategy

- Algorithm cache (5 min TTL)
- Attribute config cache
- Session context cache

### Rate Limiting

API endpoints are rate-limited:

- 100 requests per 15 minutes per IP
- Configurable via environment

## Security

### Authentication

- API key verification for external calls
- Session-based auth for dashboard
- Bearer token for admin endpoints

### Data Protection

- All sensitive data encrypted at rest
- HTTPS required in production
- SQL injection prevention via parameterized queries
- XSS protection with input sanitization

### N8N Security

- API key required for all N8N calls
- Workflow execution sandboxed
- Resource limits enforced

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom attribute definitions
- [ ] Workflow templates marketplace
- [ ] Advanced analytics and reporting
- [ ] Integration with more AI models
- [ ] Automated optimization recommendations
- [ ] A/B testing for SEO changes
- [ ] Competitive intelligence dashboard

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Support

- Documentation: This file
- Issues: [GitHub Issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- Email: support@lightdom.io

---

**Built with ❤️ by the LightDom Team**
