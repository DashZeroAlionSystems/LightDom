# LightDom Deep Research Wiki - Schema Index

This index connects all research documentation through semantic relationships, making it easy for DeepSeek and other AI systems to navigate the knowledge base.

## Document Schema

```json
{
  "$schema": "https://lightdom.ai/schemas/research-index.json",
  "version": "1.0.0",
  "lastUpdated": "2024-11-04",
  "documents": [
    {
      "id": "webdriver-bidi-puppeteer",
      "path": "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md",
      "title": "WebDriver BiDi and Puppeteer Research",
      "topics": [
        "WebDriver BiDi Protocol",
        "Puppeteer Integration",
        "Social Image Generation",
        "Web Scraping Best Practices",
        "Cross-browser Automation"
      ],
      "relatedTo": [
        "deepseek-bidi-datamining",
        "headless-api-research",
        "crawler-research"
      ],
      "schemas": [
        "AttributeConfig",
        "BiDiEventHandler",
        "OGImageTemplate"
      ],
      "implements": [
        "Two-way communication patterns",
        "Real-time event streaming",
        "Attribute mining fallback chains"
      ]
    },
    {
      "id": "deepseek-bidi-datamining",
      "path": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md",
      "title": "DeepSeek BiDi Data Mining Deep Wiki",
      "topics": [
        "Two-Way Communication Patterns",
        "Large-Scale Data Mining",
        "Container-Based Architecture",
        "DeepSeek Integration",
        "Self-Generating Components",
        "TensorFlow Streaming",
        "Schema-Driven Config"
      ],
      "relatedTo": [
        "webdriver-bidi-puppeteer",
        "nodejs-llm-communication-2025",
        "deepseek-integration-guide",
        "automated-seo-campaign",
        "schema-linking-architecture"
      ],
      "schemas": [
        "CampaignConfig",
        "DeepSeekTools",
        "ContainerSpec",
        "PageComponent",
        "TrainingDataset"
      ],
      "implements": [
        "Bidirectional mining patterns",
        "Container orchestration",
        "Auto-component generation",
        "ML-driven optimization"
      ]
    },
    {
      "id": "nodejs-llm-communication-2025",
      "path": "docs/research/NODEJS_LLM_BIDIRECTIONAL_COMMUNICATION_2025.md",
      "title": "Node.js LLM Bidirectional Communication & Fine-Tuning Research 2025",
      "topics": [
        "WebSockets & Socket.IO",
        "SSE + HTTP POST",
        "gRPC Bidirectional Streaming",
        "LangGraph.js & LangChain.js",
        "VoltAgent Framework",
        "Real-Time Model Training",
        "Tool Chaining Architecture",
        "TokenRing Parallelization",
        "Streaming Pipelines"
      ],
      "relatedTo": [
        "deepseek-bidi-datamining",
        "webdriver-bidi-puppeteer",
        "schema-driven-agent-architecture",
        "bidi-orchestration-technical",
        "implementation-roadmap"
      ],
      "schemas": [
        "BiDiConnectionPool",
        "LLMWorkflowGraph",
        "ToolChainDefinition",
        "StreamingTrainingConfig",
        "AgentOrchestratorConfig"
      ],
      "implements": [
        "WebSocket-based two-way communication",
        "LLM orchestration frameworks",
        "Real-time fine-tuning pipelines",
        "Tool dependency graphs",
        "Event-driven architecture"
      ]
    },
    {
      "id": "headless-api-research",
      "path": "HEADLESS_API_RESEARCH.md",
      "title": "Headless API and Worker Research",
      "topics": [
        "Chrome Headless API",
        "Worker Patterns",
        "Schema-Driven Development",
        "Dev Container Architecture"
      ],
      "relatedTo": [
        "webdriver-bidi-puppeteer",
        "headless-workers-readme"
      ]
    },
    {
      "id": "headless-workers-readme",
      "path": "HEADLESS_WORKERS_README.md",
      "title": "Headless Workers Implementation",
      "topics": [
        "Worker Pool Management",
        "Attribute Mining",
        "BiDi Protocol Usage",
        "API Reference"
      ],
      "relatedTo": [
        "webdriver-bidi-puppeteer",
        "deepseek-bidi-datamining"
      ]
    },
    {
      "id": "crawler-research",
      "path": "CRAWLER_RESEARCH.md",
      "title": "Web Crawler Research & Best Practices",
      "topics": [
        "Crawler Architecture",
        "Ethical Crawling",
        "Performance Optimization",
        "AI Integration"
      ],
      "relatedTo": [
        "webdriver-bidi-puppeteer",
        "deepseek-bidi-datamining"
      ]
    },
    {
      "id": "deepseek-integration-guide",
      "path": "DEEPSEEK_INTEGRATION_GUIDE.md",
      "title": "DeepSeek Integration Guide",
      "topics": [
        "DeepSeek Setup",
        "Tool Integration",
        "Workflow Automation"
      ],
      "relatedTo": [
        "deepseek-bidi-datamining",
        "deepseek-workflow-system"
      ]
    },
    {
      "id": "schema-linking-architecture",
      "path": "SCHEMA_LINKING_ARCHITECTURE.md",
      "title": "Schema Linking Architecture",
      "topics": [
        "Schema Relationships",
        "Linked Data",
        "Component Generation"
      ],
      "relatedTo": [
        "deepseek-bidi-datamining",
        "comprehensive-schema-research"
      ]
    },
    {
      "id": "automated-seo-campaign",
      "path": "AUTOMATED_SEO_CAMPAIGN_SYSTEM.md",
      "title": "Automated SEO Campaign System",
      "topics": [
        "SEO Automation",
        "Campaign Management",
        "Data Mining Workflows"
      ],
      "relatedTo": [
        "deepseek-bidi-datamining",
        "crawler-research"
      ]
    }
  ],
  "schemaDefinitions": {
    "AttributeConfig": {
      "location": "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md#attribute-mining",
      "description": "Configuration for mining specific attributes",
      "properties": [
        "name",
        "selectors",
        "type",
        "validator",
        "pattern"
      ],
      "usedBy": [
        "puppeteer-worker.js",
        "HeadlessChromeService.ts"
      ]
    },
    "CampaignConfig": {
      "location": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#seo-campaign-mcp-server",
      "description": "SEO campaign configuration schema",
      "properties": [
        "campaignId",
        "miningInstances",
        "deepseekConfig",
        "linkedSchemas"
      ],
      "generatesComponents": [
        "CampaignDashboard",
        "WorkerMonitor",
        "AnalyticsPanels"
      ]
    },
    "DeepSeekTools": {
      "location": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#deepseek-config-schema",
      "description": "Tool definitions for DeepSeek integration",
      "properties": [
        "tools",
        "workflows",
        "constraints"
      ],
      "enablesFeatures": [
        "Auto-config generation",
        "Workflow orchestration",
        "Performance optimization"
      ]
    },
    "ContainerSpec": {
      "location": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#container-specification",
      "description": "Docker container specification for mining workers",
      "properties": [
        "containerId",
        "image",
        "config",
        "resources",
        "linkedSchemas"
      ]
    },
    "PageComponent": {
      "location": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#page-schema",
      "description": "Default page component template",
      "properties": [
        "layout",
        "sections",
        "styleGuide",
        "relationships"
      ],
      "autoGenerates": [
        "CRUD operations",
        "Related navigations",
        "Action toolbars"
      ]
    }
  },
  "topicIndex": {
    "WebDriver BiDi": {
      "description": "Bidirectional browser automation protocol",
      "documents": [
        "webdriver-bidi-puppeteer",
        "deepseek-bidi-datamining",
        "headless-workers-readme"
      ],
      "keyPoints": [
        "Real-time event streaming",
        "Two-way communication",
        "Cross-browser support",
        "Performance benefits"
      ]
    },
    "Data Mining": {
      "description": "Web scraping and data extraction",
      "documents": [
        "deepseek-bidi-datamining",
        "crawler-research",
        "webdriver-bidi-puppeteer"
      ],
      "keyPoints": [
        "Attribute-specific extraction",
        "Selector fallback chains",
        "Large-scale operations",
        "Container-based workers"
      ]
    },
    "DeepSeek Integration": {
      "description": "AI-driven automation and optimization",
      "documents": [
        "deepseek-bidi-datamining",
        "deepseek-integration-guide"
      ],
      "keyPoints": [
        "Tool definitions",
        "Auto-config generation",
        "Fine-tuning datasets",
        "Continuous learning"
      ]
    },
    "Container Orchestration": {
      "description": "Docker/Kubernetes for scalable mining",
      "documents": [
        "deepseek-bidi-datamining"
      ],
      "keyPoints": [
        "Auto-scaling",
        "Config-driven behavior",
        "Resource management",
        "Dynamic deployment"
      ]
    },
    "Schema-Driven Development": {
      "description": "Using schemas to generate code and UI",
      "documents": [
        "deepseek-bidi-datamining",
        "schema-linking-architecture"
      ],
      "keyPoints": [
        "Auto-component generation",
        "CRUD operations",
        "Relationship navigation",
        "Type safety"
      ]
    },
    "Machine Learning": {
      "description": "TensorFlow integration for optimization",
      "documents": [
        "deepseek-bidi-datamining"
      ],
      "keyPoints": [
        "Streaming analytics",
        "Predictive selectors",
        "Continuous learning",
        "Performance optimization"
      ]
    }
  },
  "apiEndpoints": {
    "mineAttribute": {
      "documentation": "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md",
      "implementation": "electron/workers/puppeteer-worker.js",
      "schema": "AttributeConfig",
      "relatedSchemas": ["Product", "Offer"]
    },
    "createAttributeWorker": {
      "documentation": "HEADLESS_WORKERS_README.md",
      "implementation": "electron/main-enhanced.cjs",
      "schema": "WorkerConfig"
    },
    "generateOGImage": {
      "documentation": "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md",
      "implementation": "electron/workers/puppeteer-worker.js",
      "schema": "OGImageTemplate"
    }
  },
  "workflows": {
    "setupSEOCampaign": {
      "description": "Complete workflow for SEO campaign setup",
      "documentation": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md",
      "steps": [
        "analyzeTargetSites",
        "generateSelectors",
        "createContainers",
        "startMonitoring",
        "setupAlerts"
      ],
      "schemas": ["CampaignConfig", "ContainerSpec"],
      "tools": ["mineAttribute", "createMiningCampaign"]
    },
    "optimizeMiningPerformance": {
      "description": "Analyze and improve mining operations",
      "documentation": "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md",
      "steps": [
        "collectPerformanceData",
        "analyzePatterns",
        "generateOptimizations",
        "deployUpdates",
        "validateImprovements"
      ],
      "mlModels": ["SelectorOptimizer", "PerformancePredictor"]
    }
  },
  "researchQuestions": {
    "twoWayCommunication": {
      "question": "How to implement efficient two-way communication for real-time mining?",
      "answers": [
        {
          "document": "deepseek-bidi-datamining",
          "section": "Two-Way Communication Patterns",
          "keyInsights": [
            "Event stream pattern for continuous updates",
            "Batch processing for high-frequency data",
            "Backpressure handling for reliability"
          ]
        }
      ]
    },
    "containerScaling": {
      "question": "How to auto-scale mining containers based on load?",
      "answers": [
        {
          "document": "deepseek-bidi-datamining",
          "section": "Container-Based Data Mining",
          "keyInsights": [
            "Monitor queue size and worker utilization",
            "Scale up when utilization > 80%",
            "Scale down when utilization < 20%",
            "Gradual scaling to prevent thrashing"
          ]
        }
      ]
    },
    "deepseekFineTuning": {
      "question": "How to generate fine-tuning datasets from mining operations?",
      "answers": [
        {
          "document": "deepseek-bidi-datamining",
          "section": "DeepSeek Integration Patterns",
          "keyInsights": [
            "Capture: Prompt → Reasoning → Action → Result",
            "Record performance metrics",
            "Export as JSONL format",
            "Include successful and failed attempts"
          ]
        }
      ]
    }
  },
  "usagePatterns": {
    "beginners": {
      "startWith": [
        "HEADLESS_WORKERS_README.md",
        "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md"
      ],
      "thenRead": [
        "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md"
      ]
    },
    "developers": {
      "startWith": [
        "docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md",
        "docs/research/DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md"
      ],
      "reference": [
        "HEADLESS_WORKERS_README.md",
        "SCHEMA_LINKING_ARCHITECTURE.md"
      ]
    },
    "aiSystems": {
      "queryBy": "topic",
      "followLinks": true,
      "prioritize": [
        "schemaDefinitions",
        "apiEndpoints",
        "workflows"
      ]
    }
  }
}
```

## Quick Navigation

### By Feature
- **BiDi Protocol**: [WebDriver BiDi Research](WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md) → [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#two-way-communication-patterns)
- **Attribute Mining**: [Workers README](../HEADLESS_WORKERS_README.md) → [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#bidi-for-large-scale-data-mining)
- **DeepSeek Integration**: [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#deepseek-integration-patterns)
- **Containers**: [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#container-based-data-mining-architecture)
- **ML/TensorFlow**: [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#tensorflow-streaming-analytics)

### By Use Case
- **Setting up SEO campaign**: Start with [Deep Wiki - DeepSeek Integration](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#deepseek-integration-patterns)
- **Optimizing mining performance**: See [Deep Wiki - Learning Algorithms](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#learning-algorithms-for-mining-optimization)
- **Auto-generating UI**: See [Deep Wiki - Self-Generating Components](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#self-generating-component-systems)
- **Scaling operations**: See [Deep Wiki - Container Orchestration](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#dynamic-container-orchestration)

### By Role
- **Product Managers**: [Automated SEO Campaign](../AUTOMATED_SEO_CAMPAIGN_SYSTEM.md)
- **Developers**: [WebDriver BiDi Research](WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md), [Deep Wiki](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md)
- **ML Engineers**: [Deep Wiki - TensorFlow](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#tensorflow-streaming-analytics)
- **DevOps**: [Deep Wiki - Containers](DEEPSEEK_BIDI_DATAMINING_DEEP_WIKI.md#container-based-data-mining-architecture)

## API for DeepSeek

When querying this research wiki, use the following patterns:

```javascript
// Get all documents on a topic
GET /api/research?topic=WebDriver+BiDi

// Get schema definition
GET /api/research/schema/AttributeConfig

// Get implementation details
GET /api/research/workflow/setupSEOCampaign

// Get related documents
GET /api/research/document/webdriver-bidi-puppeteer/related
```

## Maintenance

This index is automatically generated and updated when:
- New research documents are added
- Schemas are modified
- APIs are updated
- New workflows are created

**Last Generated**: 2024-11-04  
**Auto-Update**: Enabled  
**Maintained By**: LightDom Research Team
