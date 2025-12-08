# Agent Management System

A comprehensive AI agent management system similar to GitHub Copilot, built for the LightDom platform.

## Features

✅ **GitHub Copilot-style Interface**
- Side menu with agent sessions
- Real-time chat interface
- Session management
- Prompt input with context awareness

✅ **AI Agent Management**
- Create and manage multiple agent sessions
- Configure DeepSeek instances with fine-tuning
- Codebase-aware agents with schema maps
- Pattern-based code understanding

✅ **Modular Tool System**
- CRUD operations for tools, services, workflows
- Service grouping by domain
- Tool bundling for specific tasks
- Dropdown selection by category

✅ **Workflow Orchestration**
- Sequential, parallel, and DAG workflows
- Campaign management
- Data stream configuration
- Attribute-based data gathering

✅ **Codebase Analysis**
- Automatic pattern discovery
- Schema map generation
- Relationship tracking
- Rule extraction

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize the System

```bash
node scripts/init-agent-system.js
```

This will:
- Create all necessary database tables
- Seed default tools and services
- Create a demo session for testing
- Verify configuration

### 3. Configure Environment

Add to your `.env` file:

```env
# DeepSeek API Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_api_key_here

# Database (usually already configured)
DATABASE_URL=postgresql://postgres:password@localhost:5432/lightdom
```

### 4. Start the Server

```bash
npm run start:dev
```

### 5. Access the UI

The agent session sidebar will automatically appear in your application. You can also access the full dashboard at:

```
http://localhost:3000/agent-management
```

## Architecture

### Database Schema

- **agent_sessions** - Chat sessions with agents
- **agent_instances** - DeepSeek instances with configurations
- **agent_messages** - Chat message history
- **agent_tools** - Individual capabilities
- **agent_services** - Tool bundles
- **agent_workflows** - Service orchestration
- **agent_campaigns** - Workflow coordination
- **data_streams** - Data collection pipelines
- **stream_attributes** - Configurable data points
- **codebase_schema_map** - File structure analysis
- **codebase_relationships** - File dependencies
- **pattern_rules** - Discovered patterns

### Services

1. **AgentManagementService** - CRUD operations for all entities
2. **DeepSeekIntegrationService** - AI model integration
3. **CodebasePatternDiscoveryService** - Codebase analysis

### API Endpoints

All endpoints are under `/api/agent/`:

- Sessions: `/sessions`
- Instances: `/instances`
- Messages: `/messages`
- Tools: `/tools`
- Services: `/services`
- Workflows: `/workflows`
- Campaigns: `/campaigns`
- Data Streams: `/data-streams`

## Usage Examples

### Creating a Session

```typescript
const response = await axios.post('/api/agent/sessions', {
  name: 'Feature Development',
  description: 'Working on authentication',
  agent_type: 'deepseek'
});
```

### Creating an Agent Instance

```typescript
const instance = await axios.post('/api/agent/instances', {
  session_id: 'session-uuid',
  name: 'Full Stack Developer',
  model_name: 'deepseek-coder',
  temperature: 0.7,
  max_tokens: 4096,
  tools_enabled: ['code_analyzer', 'database_query'],
  services_enabled: ['Data Collection', 'ML & AI']
});
```

### Sending a Message

```typescript
const message = await axios.post('/api/agent/messages', {
  session_id: 'session-uuid',
  instance_id: 'instance-uuid',
  content: 'Help me implement JWT authentication'
});
```

### Running Codebase Analysis

```typescript
import { CodebasePatternDiscoveryService } from './src/services/codebase-pattern-discovery.service';

const discoveryService = new CodebasePatternDiscoveryService(db, process.cwd());
const results = await discoveryService.scanCodebase();

// Get schema map for agent
const schemaMap = await discoveryService.getSchemaMap();

// Get pattern rules
const patterns = await discoveryService.getPatternRules();
```

## UI Components

### AgentSessionSidebar

GitHub Copilot-style sidebar component:

```tsx
import { AgentSessionSidebar } from './components/agent/AgentSessionSidebar';

function App() {
  return (
    <>
      {/* Your app */}
      <AgentSessionSidebar visible={true} />
    </>
  );
}
```

### AgentManagementDashboard

Full management dashboard:

```tsx
import { AgentManagementDashboard } from './components/agent/AgentManagementDashboard';

// Add to routes
<Route path="/agent-management" element={<AgentManagementDashboard />} />
```

## Module Hierarchy

1. **Attributes** - Data points to collect
2. **Tools** - Individual capabilities  
3. **Services** - Tool bundles
4. **Workflows** - Service orchestration
5. **Campaigns** - Workflow coordination
6. **Data Streams** - Attribute collection

## Configuration

### DeepSeek Models

Available models:
- `deepseek-coder` - Optimized for code
- `deepseek-chat` - General chat

### Agent Configuration

```typescript
{
  model_name: 'deepseek-coder',
  temperature: 0.7,        // 0.0 - 1.0
  max_tokens: 4096,        // Up to 8192
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0
}
```

### Codebase Pattern Discovery

```typescript
{
  excludeDirs: [
    'node_modules',
    'dist',
    'build',
    '.git'
  ],
  fileExtensions: [
    '.ts', '.tsx',
    '.js', '.jsx',
    '.py', '.go'
  ]
}
```

## Advanced Features

### Fine-tuning Support

```typescript
const deepseek = new DeepSeekIntegrationService(db);

const fineTune = await deepseek.createFineTune(
  'training-data.jsonl',
  {
    model_suffix: 'my-custom-model',
    n_epochs: 3,
    batch_size: 4,
    learning_rate: 0.0001
  }
);
```

### Code Analysis

```typescript
const analysis = await deepseek.analyzeCode(
  sourceCode,
  'typescript'
);
// Returns: { issues: [...], suggestions: [...] }
```

### Code Refactoring

```typescript
const refactored = await deepseek.refactorCode(
  originalCode,
  'Convert to async/await',
  'javascript'
);
```

### Test Generation

```typescript
const tests = await deepseek.generateTests(
  sourceCode,
  'typescript',
  'jest'
);
```

## Troubleshooting

### Database Connection
```bash
# Test connection
psql -U postgres -d lightdom -c "SELECT version();"

# Check tables
psql -U postgres -d lightdom -c "\dt"
```

### DeepSeek API
- Verify API key
- Check endpoint URL
- Ensure network access
- Check rate limits

### Pattern Discovery
- Ensure file read permissions
- Check project root path
- Verify database write access

## Documentation

- **Complete Guide**: `AGENT_MANAGEMENT_SYSTEM_GUIDE.md`
- **API Reference**: See service files in `src/services/`
- **Type Definitions**: `src/types/agent-management.ts`

## Next Steps

- [ ] Implement hot reload system
- [ ] Add CI/CD integration
- [ ] Research GitHub Copilot API
- [ ] Build visual workflow builder
- [ ] Add real-time monitoring
- [ ] Implement campaign analytics

## Support

For issues or questions, please refer to:
1. `AGENT_MANAGEMENT_SYSTEM_GUIDE.md` - Complete documentation
2. Database schema comments
3. Inline code documentation
4. Type definitions

## License

Part of the LightDom Space-Bridge Platform
