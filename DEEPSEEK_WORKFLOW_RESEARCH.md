# DeepSeek Workflow Management - Complete Architecture & Research

## Executive Summary

This document provides comprehensive research on DeepSeek integration, workflow management, schema-driven automation, and tool chaining based on analysis of existing implementations and best practices.

## Table of Contents

1. [Mermaid Workflow Architecture](#mermaid-workflow-architecture)
2. [DeepSeek Streaming vs Non-Streaming](#deepseek-streaming-vs-non-streaming)
3. [Schema-Driven Workflow Management](#schema-driven-workflow-management)
4. [Tool Chaining & MCP Server Architecture](#tool-chaining--mcp-server-architecture)
5. [N8N Integration Patterns](#n8n-integration-patterns)
6. [DeepSeek Prompt Engineering](#deepseek-prompt-engineering)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Mermaid Workflow Architecture

### Complete SEO Data Mining Workflow

\`\`\`mermaid
graph TB
    subgraph "User Interface"
        UI[Admin Dashboard]
        Prompt[Natural Language Prompt]
    end
    
    subgraph "AI Layer - DeepSeek/Ollama"
        DS[DeepSeek API]
        Ollama[Ollama Local]
        PromptEngine[Prompt Engineering Engine]
    end
    
    subgraph "Workflow Orchestration"
        WM[Workflow Manager]
        SchemaValidator[Schema Validator]
        TaskQueue[Task Queue]
        StateManager[State Manager]
    end
    
    subgraph "Service Layer - MCP Tools"
        CrawlerTool[Crawler Tool]
        SEOTool[SEO Analysis Tool]
        SchemaTool[Schema Linking Tool]
        DataTool[Data Mining Tool]
        NNTool[Neural Network Tool]
    end
    
    subgraph "Execution Layer"
        CrawlerWorker[Crawler Workers 1-20]
        DataProcessor[Data Processors]
        MLEngine[ML Training Engine]
    end
    
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
        S3[(Object Storage)]
    end
    
    subgraph "Schedule & Automation"
        Scheduler[Cron Scheduler]
        N8N[N8N Workflows]
        EventBus[Event Bus]
    end
    
    UI --> Prompt
    Prompt --> PromptEngine
    PromptEngine --> DS
    PromptEngine --> Ollama
    
    DS --> WM
    Ollama --> WM
    
    WM --> SchemaValidator
    SchemaValidator --> TaskQueue
    TaskQueue --> StateManager
    
    StateManager --> CrawlerTool
    StateManager --> SEOTool
    StateManager --> SchemaTool
    StateManager --> DataTool
    StateManager --> NNTool
    
    CrawlerTool --> CrawlerWorker
    SEOTool --> DataProcessor
    DataTool --> DataProcessor
    NNTool --> MLEngine
    
    CrawlerWorker --> PostgreSQL
    DataProcessor --> PostgreSQL
    MLEngine --> PostgreSQL
    
    PostgreSQL --> Redis
    PostgreSQL --> S3
    
    Scheduler --> TaskQueue
    N8N --> TaskQueue
    EventBus --> TaskQueue
    
    StateManager -.->|Status Updates| UI
    
    style DS fill:#ff6b6b
    style Ollama fill:#4ecdc4
    style WM fill:#95e1d3
    style N8N fill:#f38181
\`\`\`

### Hierarchical Linked Schema for SEO Data Mining

\`\`\`mermaid
graph LR
    subgraph "Workflow Schema"
        WF[SEO Data Mining Workflow]
    end
    
    subgraph "Service Schemas"
        CS[Crawler Service Schema]
        SS[SEO Analysis Schema]
        DS[Data Storage Schema]
        MS[ML Training Schema]
    end
    
    subgraph "Task Schemas"
        T1[URL Discovery Task]
        T2[Page Crawl Task]
        T3[SEO Extract Task]
        T4[Data Enrich Task]
        T5[ML Train Task]
    end
    
    subgraph "Data Schemas"
        PageSchema[Page Data Schema]
        SEOSchema[SEO Metrics Schema]
        LinkSchema[Link Graph Schema]
        TrainingSchema[Training Data Schema]
    end
    
    WF -->|contains| CS
    WF -->|contains| SS
    WF -->|contains| DS
    WF -->|contains| MS
    
    CS -->|executes| T1
    CS -->|executes| T2
    SS -->|executes| T3
    DS -->|executes| T4
    MS -->|executes| T5
    
    T1 -->|outputs| LinkSchema
    T2 -->|outputs| PageSchema
    T3 -->|outputs| SEOSchema
    T4 -->|inputs| PageSchema
    T4 -->|outputs| TrainingSchema
    T5 -->|inputs| TrainingSchema
    
    T2 -.->|depends on| T1
    T3 -.->|depends on| T2
    T4 -.->|depends on| T3
    T5 -.->|depends on| T4
    
    style WF fill:#ffeaa7
    style CS fill:#74b9ff
    style SS fill:#a29bfe
    style DS fill:#fd79a8
    style MS fill:#fdcb6e
\`\`\`

### Tool Chain Architecture

\`\`\`mermaid
graph TB
    subgraph "MCP Server Framework"
        MCP[MCP Server Registry]
        ToolRegistry[Tool Registry]
    end
    
    subgraph "Tool Services"
        T1[DeepSeek Tool]
        T2[Crawler Tool]
        T3[Schema Tool]
        T4[SEO Tool]
        T5[Data Tool]
        T6[N8N Tool]
    end
    
    subgraph "Tool Capabilities"
        T1 --> Gen[Generate Workflow]
        T1 --> Opt[Optimize Config]
        T1 --> Ana[Analyze Results]
        
        T2 --> Crawl[Execute Crawl]
        T2 --> Parse[Parse DOM]
        T2 --> Extract[Extract Data]
        
        T3 --> Link[Link Schemas]
        T3 --> Validate[Validate Data]
        T3 --> Transform[Transform Format]
        
        T4 --> SEOAnalyze[SEO Analysis]
        T4 --> Keywords[Extract Keywords]
        T4 --> Metrics[Calculate Metrics]
        
        T5 --> Store[Store Data]
        T5 --> Query[Query Data]
        T5 --> Aggregate[Aggregate Results]
        
        T6 --> Trigger[Trigger Workflow]
        T6 --> Monitor[Monitor Status]
        T6 --> Callback[Handle Callbacks]
    end
    
    MCP --> ToolRegistry
    ToolRegistry --> T1
    ToolRegistry --> T2
    ToolRegistry --> T3
    ToolRegistry --> T4
    ToolRegistry --> T5
    ToolRegistry --> T6
    
    style MCP fill:#ff7675
    style ToolRegistry fill:#74b9ff
\`\`\`

---

## DeepSeek Streaming vs Non-Streaming

### Research Findings

Based on analysis of existing implementations and DeepSeek documentation:

#### **Streaming Mode**

**Use Cases:**
- Real-time UI updates during generation
- Long-form content generation
- Interactive chat interfaces
- Progressive result display

**Benefits:**
- Lower perceived latency
- Better UX for long responses
- Can cancel mid-generation
- Immediate feedback

**Implementation:**
\`\`\`javascript
async function streamDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      stream: true // Enable streaming
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.choices[0].delta.content) {
          process.stdout.write(data.choices[0].delta.content);
        }
      }
    }
  }
}
\`\`\`

#### **Non-Streaming Mode**

**Use Cases:**
- Batch processing
- Background tasks
- Structured JSON responses
- Workflow automation

**Benefits:**
- Simpler error handling
- Complete response validation
- Easier to cache
- Better for JSON parsing

**Implementation:**
\`\`\`javascript
async function nonStreamingDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      stream: false, // Disable streaming
      response_format: { type: 'json_object' } // Request JSON
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
\`\`\`

**Recommendation:** Use **non-streaming** for workflow automation and schema generation; use **streaming** for interactive dashboard features.

---

## Schema-Driven Workflow Management

### Complete Schema Hierarchy

\`\`\`javascript
{
  "workflow": {
    "id": "seo-data-mining-workflow",
    "version": "1.0.0",
    "name": "SEO Data Mining & Training",
    "description": "Automated SEO data collection and ML training pipeline",
    
    // Workflow metadata
    "metadata": {
      "author": "system",
      "createdAt": "2025-11-03T18:00:00Z",
      "tags": ["seo", "ml", "automation"],
      "category": "data-mining"
    },
    
    // Linked service schemas
    "services": [
      {
        "id": "crawler-service",
        "type": "crawler",
        "schema": "@schemas/services/crawler-service.json",
        "config": {
          "parallelWorkers": 5,
          "loadBalancing": "least-busy",
          "retryPolicy": {
            "maxRetries": 3,
            "backoffMs": 1000
          }
        }
      },
      {
        "id": "seo-analysis-service",
        "type": "analyzer",
        "schema": "@schemas/services/seo-analyzer.json",
        "config": {
          "metrics": ["title", "meta", "headings", "content"],
          "includePerformance": true
        }
      },
      {
        "id": "ml-training-service",
        "type": "ml-engine",
        "schema": "@schemas/neural-networks/neural-network-workflow.json",
        "config": {
          "modelType": "xgboost",
          "features": ["pagerank", "content_quality", "technical_seo"]
        }
      }
    ],
    
    // Task execution pipeline
    "tasks": [
      {
        "id": "url-discovery",
        "service": "crawler-service",
        "action": "discover_urls",
        "input": {
          "seedUrl": "\${input.clientSiteUrl}",
          "maxDepth": 3,
          "followExternal": false
        },
        "output": {
          "schema": "@schemas/data/url-list.json",
          "destination": "task:page-crawl"
        },
        "dependencies": [],
        "timeout": 600
      },
      {
        "id": "page-crawl",
        "service": "crawler-service",
        "action": "crawl_pages",
        "input": {
          "urls": "\${task:url-discovery.output}",
          "extractors": ["dom", "meta", "performance"]
        },
        "output": {
          "schema": "@schemas/data/page-data.json",
          "destination": ["task:seo-analysis", "database:pages"]
        },
        "dependencies": ["url-discovery"],
        "parallel": true,
        "timeout": 3600
      },
      {
        "id": "seo-analysis",
        "service": "seo-analysis-service",
        "action": "analyze_seo",
        "input": {
          "pages": "\${task:page-crawl.output}",
          "includeCompetitors": true
        },
        "output": {
          "schema": "@schemas/data/seo-metrics.json",
          "destination": ["task:data-enrichment", "database:seo_metrics"]
        },
        "dependencies": ["page-crawl"],
        "timeout": 1800
      },
      {
        "id": "data-enrichment",
        "service": "data-processor",
        "action": "enrich_data",
        "input": {
          "pageData": "\${task:page-crawl.output}",
          "seoMetrics": "\${task:seo-analysis.output}",
          "enrichmentRules": "@schemas/enrichment/seo-enrichment.json"
        },
        "output": {
          "schema": "@schemas/data/training-data.json",
          "destination": ["task:ml-training", "database:training_data"]
        },
        "dependencies": ["seo-analysis"],
        "timeout": 900
      },
      {
        "id": "ml-training",
        "service": "ml-training-service",
        "action": "train_model",
        "input": {
          "trainingData": "\${task:data-enrichment.output}",
          "modelConfig": {
            "algorithm": "xgboost",
            "hyperparameters": {
              "learning_rate": 0.05,
              "max_depth": 6,
              "n_estimators": 400
            }
          }
        },
        "output": {
          "schema": "@schemas/models/trained-model.json",
          "destination": "database:ml_models"
        },
        "dependencies": ["data-enrichment"],
        "timeout": 7200
      }
    ],
    
    // Schedule configuration
    "schedule": {
      "type": "cron",
      "expression": "0 2 * * *", // Daily at 2 AM
      "timezone": "UTC",
      "enabled": true
    },
    
    // State management
    "state": {
      "persistenceType": "database",
      "checkpointFrequency": "per-task",
      "resumable": true
    },
    
    // Error handling
    "errorHandling": {
      "strategy": "retry-then-skip",
      "notifications": {
        "onFailure": ["email", "slack"],
        "onSuccess": ["dashboard"]
      }
    },
    
    // Resource limits
    "resources": {
      "maxConcurrentTasks": 10,
      "maxMemoryMB": 4096,
      "maxCPUPercent": 80
    }
  }
}
\`\`\`

### Auto-Configuration Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant DeepSeek
    participant SchemaGen
    participant Validator
    participant WorkflowEngine
    participant Services

    User->>DeepSeek: Natural language prompt
    DeepSeek->>SchemaGen: Generate workflow schema
    SchemaGen->>Validator: Validate schema structure
    
    alt Schema Valid
        Validator->>WorkflowEngine: Initialize workflow
        WorkflowEngine->>Services: Configure services
        Services->>WorkflowEngine: Services ready
        WorkflowEngine->>User: Workflow configured
    else Schema Invalid
        Validator->>DeepSeek: Request schema fixes
        DeepSeek->>SchemaGen: Regenerate schema
        SchemaGen->>Validator: Re-validate
    end
    
    User->>WorkflowEngine: Start workflow
    WorkflowEngine->>Services: Execute tasks
    Services-->>WorkflowEngine: Status updates
    WorkflowEngine-->>User: Progress notifications
\`\`\`

---

## Tool Chaining & MCP Server Architecture

### MCP Server Structure

Based on research, the optimal structure compartmentalizes services as MCP tools:

\`\`\`javascript
// MCP Server Registry
class MCPServerRegistry {
  constructor() {
    this.tools = new Map();
    this.servers = new Map();
  }

  registerTool(name, toolDefinition) {
    this.tools.set(name, {
      name,
      description: toolDefinition.description,
      parameters: toolDefinition.parameters,
      handler: toolDefinition.handler,
      category: toolDefinition.category
    });
  }

  async executeTool(name, params) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(\`Tool not found: \${name}\`);
    
    return await tool.handler(params);
  }
}

// Example: DeepSeek Tool
const deepseekTool = {
  name: 'deepseek_generate_workflow',
  description: 'Generate workflow configuration from natural language',
  category: 'ai',
  parameters: {
    prompt: { type: 'string', required: true },
    context: { type: 'object', required: false }
  },
  handler: async ({ prompt, context }) => {
    return await deepSeekService.generateWorkflowFromPrompt(prompt, context);
  }
};

// Example: Crawler Tool
const crawlerTool = {
  name: 'crawler_execute',
  description: 'Execute web crawling job',
  category: 'data-collection',
  parameters: {
    urls: { type: 'array', required: true },
    config: { type: 'object', required: false }
  },
  handler: async ({ urls, config }) => {
    return await crawlerService.crawl(urls, config);
  }
};

// Register tools
mcpRegistry.registerTool('deepseek_generate_workflow', deepseekTool);
mcpRegistry.registerTool('crawler_execute', crawlerTool);
\`\`\`

### Tool Chain Example

\`\`\`javascript
// Tool chain execution
async function executeWorkflowToolChain(workflowSchema) {
  const results = {};
  
  for (const task of workflowSchema.tasks) {
    // Resolve dependencies
    const inputs = await resolveDependencies(task, results);
    
    // Execute tool
    const toolName = \`\${task.service}_\${task.action}\`;
    results[task.id] = await mcpRegistry.executeTool(toolName, {
      ...task.input,
      ...inputs
    });
    
    // Update state
    await stateManager.updateTaskState(task.id, 'completed', results[task.id]);
  }
  
  return results;
}
\`\`\`

---

## N8N Integration Patterns

### Existing Implementation Analysis

From `/scripts/automation/n8n-workflow-builder.js`:

1. **Workflow Templates**: Pre-built N8N workflows for common tasks
2. **Programmatic API**: Create workflows via N8N API
3. **Webhook Integration**: Trigger workflows from LightDom
4. **Data Passing**: Pass workflow results back to LightDom

### Enhanced Integration

\`\`\`javascript
class N8NWorkflowIntegration {
  async createWorkflowFromSchema(workflowSchema) {
    // Convert LightDom schema to N8N workflow
    const n8nWorkflow = {
      name: workflowSchema.name,
      nodes: [],
      connections: {}
    };
    
    // Add trigger node
    n8nWorkflow.nodes.push({
      type: 'n8n-nodes-base.webhook',
      name: 'Workflow Trigger',
      parameters: {
        path: \`workflow-\${workflowSchema.id}\`
      }
    });
    
    // Convert tasks to N8N nodes
    for (const task of workflowSchema.tasks) {
      n8nWorkflow.nodes.push({
        type: this.mapTaskToN8NNode(task.service),
        name: task.id,
        parameters: task.input
      });
    }
    
    // Create connections based on dependencies
    for (const task of workflowSchema.tasks) {
      if (task.dependencies.length > 0) {
        n8nWorkflow.connections[task.id] = {
          main: task.dependencies.map(dep => [{ node: dep }])
        };
      }
    }
    
    // Upload to N8N
    return await this.n8nAPI.createWorkflow(n8nWorkflow);
  }
}
\`\`\`

---

## DeepSeek Prompt Engineering

### Research Findings

Based on GitHub research and best practices:

#### 1. **Structured Prompts for Schema Generation**

\`\`\`javascript
const schemaPrompt = \`You are a workflow schema architect.

CONTEXT:
- Platform: LightDom SEO automation
- Goal: Generate crawler campaign for e-commerce site
- Client: example.com (outdoor gear)

REQUIREMENTS:
1. Discover all product pages, blog posts, category pages
2. Extract: title, meta description, content, structured data
3. Analyze SEO metrics: keyword density, readability, technical SEO
4. Store data for ML training

OUTPUT FORMAT:
Generate a JSON workflow schema with:
- Service configurations (crawler, seo-analyzer, data-processor)
- Task pipeline with dependencies
- Error handling and retry logic
- Schedule configuration

CONSTRAINTS:
- Max 20 parallel crawlers
- Respect robots.txt
- Rate limit: 100 req/min
- Daily execution at 2 AM UTC

Generate the workflow schema:\`;
\`\`\`

#### 2. **Few-Shot Learning**

\`\`\`javascript
const fewShotPrompt = \`Generate workflow schemas. Here are examples:

EXAMPLE 1:
Input: "Crawl competitor websites for pricing data"
Output: {
  "services": [{
    "id": "crawler",
    "config": { "followExternal": true, "extractPrices": true }
  }],
  "tasks": [
    { "id": "discover", "action": "find_competitors" },
    { "id": "crawl", "action": "extract_pricing" }
  ]
}

EXAMPLE 2:
Input: "Generate SEO audit report"
Output: {
  "services": [{
    "id": "seo-analyzer",
    "config": { "includeAccessibility": true }
  }],
  "tasks": [
    { "id": "analyze", "action": "seo_audit" },
    { "id": "report", "action": "generate_pdf" }
  ]
}

Now generate for:
Input: "\${userPrompt}"
Output:\`;
\`\`\`

#### 3. **Chain-of-Thought Reasoning**

\`\`\`javascript
const cotPrompt = \`Generate a workflow schema. Think step-by-step:

USER REQUEST: \${userPrompt}

STEP 1: Identify required services
- What services are needed? (crawler, analyzer, etc.)
- What tools does each service need?

STEP 2: Define task pipeline
- What tasks must run sequentially?
- What tasks can run in parallel?
- What are the dependencies?

STEP 3: Configure error handling
- What can fail?
- How should failures be handled?
- What retry logic is needed?

STEP 4: Set resource limits
- How many workers needed?
- What timeouts are appropriate?
- Any rate limits to respect?

STEP 5: Generate complete schema
Output the final JSON schema:\`;
\`\`\`

---

## Implementation Roadmap

### Phase 1: Enhanced DeepSeek Integration (Week 1)

- [ ] Add streaming support for interactive features
- [ ] Implement advanced prompt engineering
- [ ] Add few-shot learning examples
- [ ] Create prompt template library

### Phase 2: Workflow Orchestration (Week 2)

- [ ] Build workflow execution engine
- [ ] Implement state management
- [ ] Add dependency resolution
- [ ] Create error handling framework

### Phase 3: MCP Tool Framework (Week 3)

- [ ] Design MCP server registry
- [ ] Compartmentalize services as tools
- [ ] Implement tool chaining
- [ ] Add tool discovery API

### Phase 4: N8N Integration (Week 4)

- [ ] Enhanced N8N workflow generation
- [ ] Bi-directional data sync
- [ ] Webhook automation
- [ ] Visual workflow editor integration

### Phase 5: Neural Network Integration (Week 5)

- [ ] Research neural network frameworks
- [ ] Implement workflow-driven ML training
- [ ] Add model versioning
- [ ] Create prediction API

---

## Code Examples from GitHub Research

### 1. DeepSeek with Ollama (Local)

\`\`\`bash
# Pull DeepSeek model via Ollama
ollama pull deepseek-r1:latest

# Run DeepSeek locally
ollama run deepseek-r1:latest
\`\`\`

### 2. Tool Chaining Pattern

\`\`\`javascript
// Pattern found in successful implementations
class ToolChain {
  async execute(tools, context) {
    let result = context;
    
    for (const tool of tools) {
      result = await tool.execute(result);
      await this.saveCheckpoint(tool.name, result);
    }
    
    return result;
  }
}
\`\`\`

### 3. Workflow State Management

\`\`\`javascript
// Common pattern for resumable workflows
class WorkflowState {
  async saveState(workflowId, taskId, state) {
    await db.upsert('workflow_state', {
      workflow_id: workflowId,
      task_id: taskId,
      state: JSON.stringify(state),
      updated_at: new Date()
    });
  }
  
  async resumeFrom(workflowId) {
    const lastState = await db.query(\`
      SELECT * FROM workflow_state 
      WHERE workflow_id = $1 
      ORDER BY updated_at DESC 
      LIMIT 1
    \`, [workflowId]);
    
    return JSON.parse(lastState.state);
  }
}
\`\`\`

---

## Conclusion

This research provides a comprehensive foundation for:

1. **Advanced workflow orchestration** with schema-driven automation
2. **DeepSeek integration** with streaming and prompt engineering
3. **Tool compartmentalization** via MCP server architecture
4. **N8N integration** for visual workflow management
5. **Scalable execution** with state management and error handling

The next step is to implement these patterns into the LightDom platform incrementally, starting with enhanced DeepSeek integration and workflow orchestration.
