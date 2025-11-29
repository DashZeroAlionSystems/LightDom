# Ollama DeepSeek Integration Guide

## 🚀 Overview

This guide covers the complete Ollama DeepSeek integration for LightDom, including bidirectional streaming, tool calling, workflow automation, data mining campaigns, and visual components.

## 📋 Prerequisites

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Or download from https://ollama.com
```

### 2. Pull DeepSeek Model

```bash
ollama pull deepseek-r1:latest
```

### 3. Start Ollama Server

```bash
ollama serve
# Runs on http://localhost:11434
```

### 4. Database Setup

```bash
# Run the workflow schema
psql -d lightdom < database/workflow_deepseek_schema.sql
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React)                          │
│  - Prompt interface                                         │
│  - Workflow visual editor                                   │
│  - Real-time streaming display                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────────────┐
│                  API Layer (Express)                         │
│  /api/ollama/* - Chat and streaming endpoints               │
│  WebSocket - Bidirectional streaming                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────────────┐
│          OllamaDeepSeekIntegration Service                   │
│  - Tool registration and calling                            │
│  - Bidirectional streaming                                  │
│  - Conversation management                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────────────────────┐
│                  Ollama API                                  │
│  http://localhost:11434                                     │
│  - DeepSeek R1 Model                                        │
│  - Tool calling support                                     │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Setup

### 1. Environment Configuration

Add to `.env`:

```bash
# Ollama Configuration
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest

# Database
DATABASE_URL=postgresql://localhost:5432/lightdom

# Ports
API_PORT=3001
MCP_PORT=3100
```

### 2. Start the Complete System

```bash
# Start all services including Ollama integration
npm run start:complete

# Or individually
ollama serve                    # Terminal 1
npm run start:mcp              # Terminal 2
npm run dev                    # Terminal 3
```

## 💬 Using DeepSeek from the Prompt

### Simple Chat

```bash
curl -X POST http://localhost:3001/api/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a workflow for portfolio optimization",
    "conversationId": "my-session"
  }'
```

### Bidirectional Streaming

```javascript
// Frontend JavaScript
const streamId = `stream-${Date.now()}`;

// Start stream
await fetch('/api/ollama/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    streamId,
    message: 'Help me create a data mining workflow',
    systemPrompt: 'You are a workflow automation expert.'
  })
});

// Send follow-up messages
await fetch('/api/ollama/stream/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    streamId,
    message: 'Add risk analysis step'
  })
});
```

### WebSocket Streaming (Real-time)

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'start',
    message: 'Create a workflow for me',
    systemPrompt: 'You are a helpful AI assistant.'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'chunk') {
    // Stream chunk received
    console.log('Chunk:', data.content);
    displayChunk(data.content);
  } else if (data.type === 'complete') {
    // Stream completed
    console.log('Complete:', data.content);
  }
};

// Send more messages
ws.send(JSON.stringify({
  type: 'send',
  message: 'Add a validation step'
}));
```

## 🛠️ Tool Calling

DeepSeek can call the following tools automatically:

### 1. Create Workflow

```typescript
// DeepSeek will call this when you ask to create a workflow
{
  "name": "create_workflow",
  "arguments": {
    "name": "Portfolio Optimization",
    "description": "AI-powered portfolio optimization",
    "steps": [
      {
        "id": "fetch-data",
        "type": "data-fetch",
        "config": { "source": "market-api" }
      },
      {
        "id": "analyze",
        "type": "ai-analyze",
        "config": { "model": "deepseek" }
      }
    ],
    "rules": [
      {
        "conditions": [{ "field": "risk", "operator": "gt", "value": 0.7 }],
        "actions": [{ "type": "send-notification" }]
      }
    ]
  }
}
```

### 2. Query Database

```typescript
// Query workflows, campaigns, or analytics
{
  "name": "query_database",
  "arguments": {
    "table": "workflows",
    "filters": { "status": "active" }
  }
}
```

### 3. Create Data Mining Campaign

```typescript
{
  "name": "create_data_mining_campaign",
  "arguments": {
    "workflowId": "workflow-123",
    "name": "Market Trends Analysis",
    "attributes": ["price", "volume", "sentiment"],
    "dataStreams": ["market-feed", "social-sentiment"]
  }
}
```

### 4. Add Visual Component

```typescript
{
  "name": "add_workflow_component",
  "arguments": {
    "workflowId": "workflow-123",
    "componentType": "chart",
    "config": {
      "chartType": "line",
      "dataSource": "portfolio-value",
      "refreshInterval": 5000
    }
  }
}
```

## 📊 Workflow Components

### Available Component Types

1. **Chart** - Visualize data trends
   ```json
   {
     "componentType": "chart",
     "config": {
       "chartType": "line|bar|pie|scatter",
       "dataSource": "step-id",
       "xAxis": "timestamp",
       "yAxis": "value"
     }
   }
   ```

2. **Form** - Data input and editing
   ```json
   {
     "componentType": "form",
     "config": {
       "fields": [
         { "name": "amount", "type": "number", "required": true },
         { "name": "asset", "type": "select", "options": ["BTC", "ETH"] }
       ]
     }
   }
   ```

3. **Table** - Data display
   ```json
   {
     "componentType": "table",
     "config": {
       "columns": ["id", "name", "value", "status"],
       "sortable": true,
       "filterable": true
     }
   }
   ```

4. **Dashboard** - Multiple widgets
   ```json
   {
     "componentType": "dashboard",
     "config": {
       "layout": "grid",
       "widgets": [
         { "type": "metric", "value": "portfolio-total" },
         { "type": "chart", "source": "performance" }
       ]
     }
   }
   ```

## ⛏️ Data Mining Campaigns

### Creating a Campaign

Ask DeepSeek:
```
"Create a data mining campaign for my portfolio workflow that tracks price, volume, and market sentiment from real-time feeds"
```

DeepSeek will:
1. Create the campaign
2. Attach it to your workflow
3. Configure data streams
4. Set up attribute monitoring

### Campaign Features

- **Real-time Attributes**: Monitor specific data points
- **Data Streams**: Connect to live data feeds
- **Insights Generation**: AI-powered pattern detection
- **Action Triggers**: Automatic alerts and responses

## 📈 Internal Analytics

The system tracks:

1. **AI Tool Usage** - Which tools are used and when
2. **Workflow Execution** - Success rates, timing, errors
3. **Data Quality** - Confidence scores, accuracy
4. **Knowledge Graph** - Relationships between entities

### Example: Track Tool Performance

```sql
-- See most used tools
SELECT 
    tool_name,
    COUNT(*) as usage_count,
    AVG(execution_time_ms) as avg_time,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
FROM ai_tool_usage
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY tool_name
ORDER BY usage_count DESC;
```

## 🔄 Service Bundling and Containers

### Service Configuration

```typescript
// DeepSeek can configure services
{
  "service_name": "calculation-engine",
  "service_type": "worker",
  "config": {
    "maxWorkers": 4,
    "enableCaching": true
  },
  "container_config": {
    "image": "node:20-alpine",
    "replicas": 3,
    "resources": {
      "cpu": "2",
      "memory": "4G"
    }
  }
}
```

### Managing Instances

```sql
-- View running instances
SELECT 
    si.instance_name,
    si.status,
    si.port,
    si.health_status,
    sc.service_name
FROM service_instances si
JOIN service_configs sc ON si.service_config_id = sc.id
WHERE si.status = 'running';
```

## 🎯 Example Workflows

### 1. Portfolio Optimization with Data Mining

```bash
curl -X POST http://localhost:3001/api/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a complete portfolio optimization workflow with:
      1. Real-time market data fetching
      2. AI-powered risk analysis
      3. Data mining campaign for trends
      4. Dashboard component for visualization
      5. Automated rebalancing when risk > 0.7"
  }'
```

DeepSeek will:
- Create the workflow with all steps
- Set up the data mining campaign
- Add visual components
- Configure rules and triggers
- Store everything in the database

### 2. Custom Analytics Dashboard

```javascript
// Ask DeepSeek via WebSocket
ws.send(JSON.stringify({
  type: 'send',
  message: 'Build me an analytics dashboard that shows:
    - Portfolio value over time (line chart)
    - Asset allocation (pie chart)
    - Recent transactions (table)
    - Risk metrics (metric cards)
    All updating in real-time from my active workflows'
}));
```

## 🔐 Security and Config Filters

### Include/Exclude Patterns

```sql
-- Add include filter for workflow
INSERT INTO config_filters (target_type, target_id, filter_type, filter_pattern)
VALUES ('workflow', 'workflow-123', 'include', 'market-data-*');

-- Add exclude filter
INSERT INTO config_filters (target_type, target_id, filter_type, filter_pattern)
VALUES ('workflow', 'workflow-123', 'exclude', 'test-*');
```

## 📚 Knowledge Graph

### Building Knowledge

The system automatically builds a knowledge graph from:
- Workflow executions
- Tool usage patterns
- Data relationships
- User interactions

### Query Knowledge

```sql
-- Find related concepts
SELECT 
    kn2.name as related_concept,
    kr.relationship_type,
    kr.weight
FROM knowledge_nodes kn1
JOIN knowledge_relationships kr ON kn1.id = kr.source_node_id
JOIN knowledge_nodes kn2 ON kr.target_node_id = kn2.id
WHERE kn1.name = 'portfolio-optimization'
ORDER BY kr.weight DESC;
```

## 🎨 Best Practices

1. **Use Descriptive Prompts**: Be specific about what you want
2. **Leverage Streaming**: Use WebSocket for real-time feedback
3. **Monitor Tool Usage**: Check analytics to optimize
4. **Build Incrementally**: Start simple, add complexity
5. **Use Components**: Visual aids improve understanding
6. **Track Campaigns**: Monitor data mining for insights
7. **Review Schemas**: Ensure all relationships are correct

## 🐛 Troubleshooting

### Ollama Not Responding

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
killall ollama
ollama serve
```

### DeepSeek Model Not Found

```bash
ollama pull deepseek-r1:latest
ollama list  # Verify it's installed
```

### Database Connection Issues

```bash
# Check database exists
psql -l | grep lightdom

# Create if missing
createdb lightdom
psql -d lightdom < database/workflow_deepseek_schema.sql
```

### Tool Calls Not Working

Check that `toolsEnabled: true` in OllamaDeepSeekIntegration config.

## 📖 API Reference

### REST Endpoints

- `GET /api/ollama/status` - Get service status
- `POST /api/ollama/chat` - Simple chat interface
- `POST /api/ollama/stream/start` - Start bidirectional stream
- `POST /api/ollama/stream/send` - Send to active stream
- `POST /api/ollama/stream/stop` - Stop stream
- `GET /api/ollama/conversation/:id` - Get conversation history
- `DELETE /api/ollama/conversation/:id` - Clear conversation

### WebSocket Protocol

```javascript
// Client -> Server
{
  "type": "start|send|stop",
  "message": "string",
  "systemPrompt": "string" // optional, only for 'start'
}

// Server -> Client
{
  "type": "chunk|complete|error",
  "content": "string",
  "error": "string" // only for 'error'
}
```

## 🚀 Advanced Features

### Custom Tools

Register your own tools:

```typescript
import ollamaDeepseek from './src/ai/OllamaDeepSeekIntegration';

ollamaDeepseek.registerTool({
  type: 'function',
  function: {
    name: 'custom_action',
    description: 'Perform custom action',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        params: { type: 'object' }
      },
      required: ['action']
    }
  }
}, async (args) => {
  // Your custom logic
  return { success: true, result: 'Done!' };
});
```

### Event Listeners

```typescript
ollamaDeepseek.on('workflowCreated', (workflow) => {
  console.log('New workflow:', workflow);
  // Trigger your custom logic
});

ollamaDeepseek.on('chunk', ({ streamId, chunk }) => {
  // Process streaming chunks
  broadcastToClients(streamId, chunk);
});
```

## 📝 Custom Modelfile Configuration

LightDom includes custom Modelfiles for creating optimized DeepSeek models with platform-specific configurations.

### Creating Custom Models

```bash
# Full-featured model (16GB+ RAM recommended)
npm run ollama:create-model

# Lite version (8GB RAM)
npm run ollama:create-model-lite
```

### Testing Tool Calling

```bash
# Test tool-calling capabilities
npm run ollama:test-tools
```

### Modelfile Documentation

See the comprehensive documentation:
- [Modelfile Configuration Guide](docs/OLLAMA_MODELFILE_CONFIGURATION.md) - Complete parameter reference
- [LightDom Modelfiles](config/ollama/README.md) - Usage instructions and customization

### Available Modelfiles

| Modelfile | Base Model | Context | Use Case |
|-----------|------------|---------|----------|
| `Modelfile.lightdom-deepseek` | deepseek-r1:14b | 16K | Production, complex tasks |
| `Modelfile.lightdom-deepseek-lite` | deepseek-coder:6.7b | 4K | Development, limited resources |

---

**Ready to build amazing AI-powered workflows! 🚀**
