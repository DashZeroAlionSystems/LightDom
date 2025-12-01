# Agent DeepSeek System Documentation

## Overview

The Agent DeepSeek System is a comprehensive AI agent management platform that enables you to create, configure, and manage AI agents powered by DeepSeek. Each agent operates in a specific **mode** with defined capabilities, rules, and knowledge graphs.

## Table of Contents

1. [Key Concepts](#key-concepts)
2. [Getting Started](#getting-started)
3. [Agent Modes](#agent-modes)
4. [Creating Agents](#creating-agents)
5. [Knowledge Graphs](#knowledge-graphs)
6. [Rules System](#rules-system)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Best Practices](#best-practices)

---

## Key Concepts

### Agent Mode
A **mode** defines the functional role an agent fulfills. Each mode has:
- **Capabilities**: What the agent can do
- **Function Definition**: The purpose the agent serves
- **Knowledge Graph**: Structured knowledge about the domain
- **Rules**: Behavioral guidelines and constraints
- **Default Configuration**: Starting settings for agents in this mode

### Agent Instance
An **instance** is a specific agent configured with a mode. Each instance has:
- Personal configuration
- DeepSeek API settings
- Enabled tools and services
- Learning data accumulated over time
- Performance metrics

### Agent Session
A **session** represents a conversation or interaction with an agent. Sessions contain:
- Message history
- Session context
- Knowledge updates from the session

### Knowledge Graph
A graph structure representing:
- **Nodes**: Concepts, entities, skills, tools, patterns, rules
- **Relationships**: Connections between nodes (requires, enables, uses, produces, etc.)
- **Confidence Scores**: How confident we are about each node/relationship

### Agent Rules
Rules guide agent behavior with different types:
- **Constraints**: Hard limits on what agent can do
- **Requirements**: Must-follow rules
- **Guidelines**: Best practices
- **Preferences**: Soft preferences
- **Optimizations**: Performance improvements

---

## Getting Started

### Prerequisites

1. **PostgreSQL Database** (13+)
   ```bash
   # Create database
   createdb lightdom
   
   # Run schema
   psql lightdom < database/agent-deepseek-system-schema.sql
   ```

2. **DeepSeek/Ollama** (for AI capabilities)
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   
   # Pull DeepSeek model
   ollama pull deepseek-chat
   ```

3. **Node.js** (20+)
   ```bash
   npm install
   ```

### Quick Start

**1. Start the API server:**
```bash
npm run start:dev
```

**2. Add agent routes to your server** (`api-server-express.js`):
```javascript
import createAgentDeepSeekRoutes from './api/agent-deepseek-routes.js';

// In your Express app setup
const agentRoutes = createAgentDeepSeekRoutes(dbPool);
app.use('/api/agent-deepseek', agentRoutes);
```

**3. Open the UI and click "Add Agent"** in the sidebar

---

## Agent Modes

The system comes with 6 pre-configured modes:

### 1. **Workflow Orchestrator**
- **Type**: `workflow`
- **Purpose**: Manages multi-step workflows
- **Capabilities**:
  - Workflow execution
  - Dependency management
  - Error handling
  - Parallel processing
- **Use Cases**: Automate complex processes, coordinate multiple services

### 2. **Code Analyzer**
- **Type**: `analysis`
- **Purpose**: Analyzes codebase structure and patterns
- **Capabilities**:
  - Code parsing
  - Pattern recognition
  - Dependency analysis
  - Documentation generation
- **Use Cases**: Understand codebases, discover patterns, generate docs

### 3. **Content Generator**
- **Type**: `generation`
- **Purpose**: Creates various types of content
- **Capabilities**:
  - Text generation
  - Code generation
  - Template rendering
  - Context awareness
- **Use Cases**: Generate code, documentation, configurations

### 4. **SEO Optimizer**
- **Type**: `optimization`
- **Purpose**: Optimizes content for search engines
- **Capabilities**:
  - SEO analysis
  - DOM optimization
  - Metadata generation
  - Performance optimization
- **Use Cases**: Improve search rankings, optimize page speed

### 5. **Data Mining Agent**
- **Type**: `mining`
- **Purpose**: Extracts data from web sources
- **Capabilities**:
  - Web crawling
  - Data extraction
  - Data enrichment
  - Pattern matching
- **Use Cases**: Scrape data, collect SEO metrics

### 6. **Custom Agent**
- **Type**: `custom`
- **Purpose**: User-defined functionality
- **Capabilities**: Flexible, user-configured
- **Use Cases**: Any custom workflow

### Creating Custom Modes

```javascript
// POST /api/agent-deepseek/modes
{
  "name": "My Custom Mode",
  "description": "Description of what this mode does",
  "mode_type": "custom",
  "function_definition": "Detailed description of the function this agent fulfills",
  "capabilities": ["capability1", "capability2"],
  "knowledge_graph": {
    "nodes": [...],
    "relationships": [...]
  },
  "rules": [
    {
      "type": "guideline",
      "description": "Follow these best practices..."
    }
  ],
  "default_config": {
    "setting1": "value1"
  }
}
```

---

## Creating Agents

### Via UI (Recommended)

1. Click **"Add Agent"** button in sidebar
2. Follow the 4-step wizard:
   - **Step 1**: Select agent mode
   - **Step 2**: Configure basic settings
   - **Step 3**: Setup DeepSeek connection
   - **Step 4**: Review and create

### Via API

```javascript
// POST /api/agent-deepseek/agents
{
  "name": "My SEO Agent",
  "description": "Optimizes website content for search engines",
  "mode_id": "uuid-of-seo-optimizer-mode",
  "configuration": {
    "focus_keywords": ["AI", "Machine Learning"],
    "target_regions": ["US", "UK"]
  },
  "deepseek_config": {
    "api_url": "http://localhost:11434",
    "model": "deepseek-chat"
  },
  "tools_enabled": ["seo_analyzer", "content_optimizer"],
  "services_enabled": ["seo_service"],
  "model_name": "deepseek-chat",
  "temperature": 0.7,
  "max_tokens": 4000
}
```

---

## Knowledge Graphs

Knowledge graphs help agents understand domain-specific concepts and relationships.

### Node Types

- **concept**: Abstract ideas or principles
- **entity**: Concrete objects or systems
- **skill**: Capabilities or techniques
- **tool**: Specific tools or APIs
- **pattern**: Recognized patterns
- **rule**: Behavioral rules

### Creating Knowledge Nodes

```javascript
// POST /api/agent-deepseek/knowledge/nodes
{
  "agent_id": "uuid-of-agent", // Or mode_id for mode-level knowledge
  "node_type": "concept",
  "name": "SEO Best Practices",
  "description": "Guidelines for optimizing content for search engines",
  "properties": {
    "priority": "high",
    "domain": "seo"
  }
}
```

### Retrieving Knowledge Graph

```javascript
// GET /api/agent-deepseek/knowledge/graph?agent_id=xxx
// Returns:
{
  "nodes": [...],
  "relationships": [...]
}
```

### Example Knowledge Graph

```json
{
  "nodes": [
    {
      "node_id": "uuid1",
      "node_type": "concept",
      "name": "Title Optimization",
      "confidence_score": 0.95
    },
    {
      "node_id": "uuid2",
      "node_type": "tool",
      "name": "Meta Tag Analyzer",
      "confidence_score": 0.90
    }
  ],
  "relationships": [
    {
      "from_node_id": "uuid1",
      "to_node_id": "uuid2",
      "relationship_type": "uses",
      "strength": 0.85
    }
  ]
}
```

---

## Rules System

Rules guide how agents behave and make decisions.

### Rule Types

1. **Constraint**: Hard limits (MUST NOT)
   ```json
   {
     "rule_type": "constraint",
     "rule_name": "Rate Limit Respect",
     "description": "Never exceed 10 requests per second",
     "is_mandatory": true,
     "condition": {"requests_per_second": {"$lte": 10}},
     "action": {"delay_ms": 100}
   }
   ```

2. **Requirement**: Must-follow rules (MUST)
   ```json
   {
     "rule_type": "requirement",
     "rule_name": "Log All Actions",
     "description": "Log every action taken",
     "is_mandatory": true
   }
   ```

3. **Guideline**: Best practices (SHOULD)
   ```json
   {
     "rule_type": "guideline",
     "rule_name": "Prefer Caching",
     "description": "Cache results when possible",
     "is_mandatory": false
   }
   ```

4. **Preference**: Soft preferences (PREFER)
   ```json
   {
     "rule_type": "preference",
     "rule_name": "Batch Operations",
     "description": "Batch similar operations together"
   }
   ```

5. **Optimization**: Performance improvements
   ```json
   {
     "rule_type": "optimization",
     "rule_name": "Parallel Execution",
     "description": "Execute independent tasks in parallel"
   }
   ```

### Creating Rules

```javascript
// POST /api/agent-deepseek/rules
{
  "agent_id": "uuid", // Or mode_id for mode-level rules
  "rule_name": "Quality Threshold",
  "description": "Only use results with >80% confidence",
  "rule_type": "constraint",
  "condition": {
    "confidence": {"$gte": 0.8}
  },
  "action": {
    "filter": "confidence >= 0.8"
  },
  "priority": 10,
  "is_mandatory": true
}
```

---

## API Reference

### Agent Modes

- `POST /api/agent-deepseek/modes` - Create agent mode
- `GET /api/agent-deepseek/modes` - List agent modes
- `GET /api/agent-deepseek/modes/:mode_id` - Get mode details
- `PUT /api/agent-deepseek/modes/:mode_id` - Update mode
- `DELETE /api/agent-deepseek/modes/:mode_id` - Delete mode

### Agent Instances

- `POST /api/agent-deepseek/agents` - Create agent instance
- `GET /api/agent-deepseek/agents` - List agents
- `GET /api/agent-deepseek/agents/:agent_id` - Get agent details
- `PUT /api/agent-deepseek/agents/:agent_id` - Update agent
- `DELETE /api/agent-deepseek/agents/:agent_id` - Delete agent

### Sessions

- `POST /api/agent-deepseek/sessions` - Create session
- `GET /api/agent-deepseek/sessions` - List sessions
- `GET /api/agent-deepseek/sessions/:session_id` - Get session details
- `PUT /api/agent-deepseek/sessions/:session_id` - Update session

### Knowledge Graph

- `POST /api/agent-deepseek/knowledge/nodes` - Create knowledge node
- `GET /api/agent-deepseek/knowledge/graph` - Get knowledge graph

### Rules

- `POST /api/agent-deepseek/rules` - Create rule
- `GET /api/agent-deepseek/rules` - List rules

### DeepSeek Integration

- `POST /api/agent-deepseek/deepseek/execute` - Execute prompt with DeepSeek

### Learning & Metrics

- `POST /api/agent-deepseek/learning/events` - Record learning event
- `POST /api/agent-deepseek/performance/metrics` - Record performance metric

---

## Database Schema

### Core Tables

1. **agent_modes** - Agent functional modes
2. **agent_instances** - Actual agent instances
3. **agent_sessions** - Conversation sessions
4. **agent_messages** - Individual messages
5. **knowledge_nodes** - Knowledge graph nodes
6. **knowledge_relationships** - Knowledge graph edges
7. **agent_rules** - Behavioral rules
8. **prompt_templates** - Reusable prompts
9. **prompt_executions** - Prompt execution history
10. **agent_learning_events** - Learning and adaptation tracking
11. **agent_performance_metrics** - Performance measurements

See `database/agent-deepseek-system-schema.sql` for complete schema.

---

## Best Practices

### 1. **Mode Selection**
- Choose the mode that best matches your use case
- Use custom modes for unique requirements
- Review mode capabilities before creating agents

### 2. **Configuration**
- Start with default configurations
- Adjust temperature based on use case:
  - Low (0.1-0.3) for deterministic tasks
  - Medium (0.5-0.7) for balanced tasks
  - High (0.8-1.0) for creative tasks
- Set appropriate token limits

### 3. **Rules**
- Define clear, specific rules
- Use mandatory rules sparingly
- Prioritize rules appropriately
- Document why each rule exists

### 4. **Knowledge Graphs**
- Build knowledge graphs incrementally
- Update confidence scores based on results
- Prune low-confidence nodes periodically
- Document node relationships

### 5. **Learning**
- Track learning events for pattern discovery
- Validate learned patterns before incorporating
- Monitor performance metrics
- Adjust agent configuration based on metrics

### 6. **Sessions**
- Create new sessions for distinct tasks
- Maintain session context appropriately
- Close sessions when complete
- Review session history for insights

### 7. **Security**
- Store API keys securely
- Validate all inputs
- Implement rate limiting
- Monitor agent activity
- Review agent outputs before deployment

---

## Troubleshooting

### Agent Creation Fails
- Check database connection
- Verify mode_id exists
- Ensure DeepSeek/Ollama is running
- Check API endpoint configuration

### DeepSeek Not Responding
- Verify Ollama is running: `ollama serve`
- Check model is pulled: `ollama list`
- Test API directly: `curl http://localhost:11434/api/generate`
- Check API URL in agent configuration

### Poor Agent Performance
- Review performance metrics
- Adjust temperature setting
- Check rule priorities
- Review knowledge graph completeness
- Analyze learning events

### Knowledge Graph Issues
- Verify node relationships are logical
- Check confidence scores
- Prune unused nodes
- Update node properties

---

## Examples

### Example 1: SEO Optimization Agent

```javascript
// 1. Create agent
const agent = await axios.post('/api/agent-deepseek/agents', {
  name: 'Content SEO Optimizer',
  mode_id: 'seo-optimizer-mode-id',
  tools_enabled: ['meta_tag_analyzer', 'keyword_density_checker'],
  temperature: 0.5
});

// 2. Create session
const session = await axios.post('/api/agent-deepseek/sessions', {
  agent_id: agent.data.data.agent_id,
  name: 'Website Optimization'
});

// 3. Execute optimization
const result = await axios.post('/api/agent-deepseek/deepseek/execute', {
  agent_id: agent.data.data.agent_id,
  session_id: session.data.data.session_id,
  prompt_text: 'Analyze this page and suggest SEO improvements: ...'
});
```

### Example 2: Custom Workflow Agent

```javascript
// 1. Create custom mode
const mode = await axios.post('/api/agent-deepseek/modes', {
  name: 'Data Pipeline Manager',
  mode_type: 'workflow',
  function_definition: 'Manages data ingestion, transformation, and storage workflows',
  capabilities: ['data_ingestion', 'etl', 'validation', 'storage'],
  rules: [
    {
      type: 'requirement',
      description: 'Validate all incoming data'
    },
    {
      type: 'guideline',
      description: 'Use batch processing when possible'
    }
  ]
});

// 2. Create agent with custom configuration
const agent = await axios.post('/api/agent-deepseek/agents', {
  name: 'Production Data Pipeline',
  mode_id: mode.data.data.mode_id,
  configuration: {
    batch_size: 1000,
    validation_rules: ['schema_check', 'duplicate_check']
  }
});
```

---

## Support

For issues or questions:
- Check logs in agent_learning_events and prompt_executions tables
- Review agent performance_metrics
- Consult the knowledge graph for agent behavior
- Check DeepSeek/Ollama logs

---

## License

Copyright © 2025 LightDom. All rights reserved.
