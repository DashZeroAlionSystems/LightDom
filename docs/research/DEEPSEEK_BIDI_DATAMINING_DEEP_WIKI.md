# Deep Research Wiki: BiDi-Based Real-Time Data Mining with DeepSeek Integration

## Executive Summary

This document provides comprehensive research on integrating WebDriver BiDi protocol with AI-driven data mining systems, containerized workflows, and self-organizing schema-based architectures for SEO campaign management.

**Last Updated**: November 2024  
**Status**: Active Research  
**Related Implementation**: WebDriver BiDi Protocol Support (PR #copilot/update-electron-headless-browser)

---

## Table of Contents

1. [Two-Way Communication Patterns](#two-way-communication-patterns)
2. [BiDi for Large-Scale Data Mining](#bidi-for-large-scale-data-mining)
3. [Container-Based Data Mining Architecture](#container-based-data-mining-architecture)
4. [DeepSeek Integration Patterns](#deepseek-integration-patterns)
5. [Self-Generating Component Systems](#self-generating-component-systems)
6. [TensorFlow Streaming Analytics](#tensorflow-streaming-analytics)
7. [Schema-Driven Configuration](#schema-driven-configuration)
8. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Two-Way Communication Patterns

### 1.1 WebDriver BiDi Bidirectional Architecture

**Core Concept**: Unlike traditional request-response patterns, BiDi enables simultaneous client→server and server→client communication streams.

#### Communication Flows

```javascript
// Traditional WebDriver (Unidirectional)
Client → Request → Server
Client ← Response ← Server

// WebDriver BiDi (Bidirectional)
Client ↔ Events/Commands ↔ Server
       ↕ Real-time Stream ↕
```

#### Key Patterns for Real-Time Mining

**1. Event Stream Pattern**
```javascript
// Browser emits events continuously
browser.on('network.responseReceived', (event) => {
  // Process in real-time without polling
  analyzeSEOData(event.response);
});

browser.on('log.entryAdded', (entry) => {
  // Track console errors for page quality
  validatePageHealth(entry);
});
```

**2. Command Pipeline Pattern**
```javascript
// Send commands while receiving events
async function miningPipeline() {
  const session = await browser.createSession();
  
  // Stream 1: Send extraction commands
  const commandStream = async function* () {
    for (const url of urlQueue) {
      yield { command: 'navigate', params: { url } };
      yield { command: 'extract', params: { selectors } };
    }
  };
  
  // Stream 2: Receive results
  session.on('extractionComplete', (result) => {
    processResult(result);
  });
  
  // Run both streams concurrently
  await Promise.all([
    sendCommands(commandStream()),
    listenForResults(session)
  ]);
}
```

**3. Batch Update Pattern**
```javascript
// Accumulate updates, flush periodically
class BatchProcessor {
  constructor() {
    this.buffer = [];
    this.batchSize = 100;
    this.flushInterval = 5000; // 5 seconds
  }
  
  async onDataMined(data) {
    this.buffer.push(data);
    
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }
  
  async flush() {
    if (this.buffer.length === 0) return;
    
    const batch = this.buffer.splice(0, this.batchSize);
    await database.bulkInsert(batch);
    await eventEmitter.emit('batchProcessed', { count: batch.length });
  }
}
```

### 1.2 Best Practices for Two-Way Communication

**Performance Optimization**
- Use message batching for high-frequency updates
- Implement backpressure handling to prevent overwhelming consumers
- Cache frequently accessed data on both ends
- Use binary protocols (msgpack, protobuf) for large payloads

**Reliability Patterns**
- Heartbeat/keepalive messages to detect connection issues
- Message acknowledgment and retry logic
- Idempotent operations for safe retries
- Circuit breaker pattern for failing endpoints

**Real-Time Sync Architecture**
```javascript
class TwoWaySync {
  constructor(worker, database) {
    this.worker = worker;
    this.database = database;
    this.pendingChanges = new Map();
  }
  
  // Server → Client: Push config updates
  async onConfigUpdate(config) {
    await this.worker.send({ type: 'updateConfig', config });
    this.pendingChanges.set(config.id, 'pending');
  }
  
  // Client → Server: Report mining results
  async onMiningComplete(result) {
    await this.database.save(result);
    this.pendingChanges.delete(result.configId);
    
    // Analyze and adjust config in real-time
    const optimizedConfig = await this.analyzePerformance(result);
    if (optimizedConfig) {
      await this.onConfigUpdate(optimizedConfig);
    }
  }
}
```

---

## 2. BiDi for Large-Scale Data Mining

### 2.1 Scaling Patterns

**Horizontal Scaling with Worker Pools**

```javascript
// Multi-instance coordination
class ScalableDataMiner {
  constructor(config) {
    this.workers = [];
    this.taskQueue = [];
    this.results = new StreamingDatabase();
  }
  
  async scaleUp(instances) {
    for (let i = 0; i < instances; i++) {
      const worker = await this.createWorker({
        id: `worker-${i}`,
        useBiDi: true,
        capabilities: ['mineAttribute', 'generateOGImage']
      });
      
      // BiDi event handlers for real-time coordination
      worker.on('taskComplete', (result) => {
        this.results.stream(result);
        this.assignNextTask(worker);
      });
      
      worker.on('performanceMetric', (metric) => {
        this.optimizeTaskDistribution(metric);
      });
      
      this.workers.push(worker);
    }
  }
  
  optimizeTaskDistribution(metric) {
    // Use BiDi events to dynamically rebalance
    if (metric.avgResponseTime > threshold) {
      this.redistributeTasks();
    }
  }
}
```

**Distributed Mining Architecture**

```
┌─────────────────────────────────────────────────────┐
│              Orchestration Layer                     │
│  - Task distribution                                 │
│  - Config management via BiDi                        │
│  - Real-time performance monitoring                  │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
       ┌───────┴───────┐      ┌──────┴────────┐
       │  Worker Pool 1 │      │ Worker Pool 2 │
       │  (Attribute A) │      │ (Attribute B) │
       │                │      │               │
       │  ┌──────────┐  │      │ ┌──────────┐ │
       │  │ Worker 1 │  │      │ │ Worker 5 │ │
       │  │ Worker 2 │  │      │ │ Worker 6 │ │
       │  │ Worker 3 │  │      │ │ Worker 7 │ │
       │  │ Worker 4 │  │      │ │ Worker 8 │ │
       │  └──────────┘  │      │ └──────────┘ │
       └────────┬───────┘      └───────┬──────┘
                │                      │
                └──────────┬───────────┘
                           │
                  ┌────────┴─────────┐
                  │ Streaming Results │
                  │   Database        │
                  └──────────────────┘
```

### 2.2 Learning Algorithms for Mining Optimization

**Pattern Recognition from Mining Results**

```javascript
class MiningPatternLearner {
  constructor() {
    this.successPatterns = new Map();
    this.failurePatterns = new Map();
  }
  
  async learn(result) {
    const pattern = this.extractPattern(result);
    
    if (result.success) {
      this.recordSuccess(pattern, result);
    } else {
      this.recordFailure(pattern, result);
    }
    
    // Update selector strategies based on success rate
    return this.generateOptimizedConfig(pattern);
  }
  
  extractPattern(result) {
    return {
      domain: new URL(result.url).hostname,
      elementType: result.attribute.type,
      selectorType: result.successfulSelector?.type,
      pageStructure: result.domStats
    };
  }
  
  generateOptimizedConfig(pattern) {
    const successRate = this.calculateSuccessRate(pattern);
    
    if (successRate > 0.9) {
      // Pattern is reliable - prioritize these selectors
      return {
        selectors: this.getTopSelectors(pattern),
        confidence: successRate,
        strategy: 'fast-track'
      };
    } else {
      // Pattern needs improvement - use all fallbacks
      return {
        selectors: this.getAllSelectors(pattern),
        confidence: successRate,
        strategy: 'comprehensive'
      };
    }
  }
}
```

**Predictive Selector Generation**

```javascript
// Use ML to predict best selectors for new sites
class PredictiveSelectorEngine {
  async predictSelectors(url, attributeType) {
    // 1. Analyze page structure via BiDi
    const structure = await this.analyzePageStructure(url);
    
    // 2. Find similar patterns in historical data
    const similarPatterns = await this.findSimilarPatterns(structure);
    
    // 3. Generate ranked selector list
    return similarPatterns.map(pattern => ({
      selector: pattern.selector,
      probability: pattern.successRate,
      reasoning: pattern.context
    })).sort((a, b) => b.probability - a.probability);
  }
}
```

---

## 3. Container-Based Data Mining Architecture

### 3.1 Containerization Strategy

**Why Containers for Data Mining?**
- Isolation: Each mining operation runs independently
- Scalability: Spin up/down instances based on load
- Reproducibility: Same environment every time
- Resource control: CPU/memory limits per container

**Container Architecture**

```yaml
# docker-compose.datamining.yml
version: '3.8'

services:
  # Orchestrator
  mining-orchestrator:
    image: lightdom/mining-orchestrator:latest
    environment:
      - BIDI_ENABLED=true
      - DEEPSEEK_API_KEY=${DEEPSEEK_KEY}
    volumes:
      - ./configs:/configs
      - ./schemas:/schemas
    networks:
      - mining-network
  
  # Worker pool for attribute mining
  attribute-worker:
    image: lightdom/attribute-worker:latest
    deploy:
      replicas: 10
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - USE_BIDI=true
      - ORCHESTRATOR_URL=http://mining-orchestrator:8080
    networks:
      - mining-network
  
  # TensorFlow analytics
  analytics-engine:
    image: tensorflow/tensorflow:latest-gpu
    volumes:
      - ./models:/models
      - ./data:/data
    environment:
      - MODEL_PATH=/models/seo-optimizer
    networks:
      - mining-network
  
  # Real-time database
  timeseries-db:
    image: timescale/timescaledb:latest-pg14
    environment:
      - POSTGRES_DB=mining_data
    volumes:
      - mining-data:/var/lib/postgresql/data
    networks:
      - mining-network

networks:
  mining-network:
    driver: bridge

volumes:
  mining-data:
```

### 3.2 Dynamic Container Orchestration

**Self-Scaling Based on Load**

```javascript
class ContainerOrchestrator {
  constructor() {
    this.docker = new Docker();
    this.metrics = new MetricsCollector();
  }
  
  async monitorAndScale() {
    setInterval(async () => {
      const load = await this.metrics.getCurrentLoad();
      
      if (load.queueSize > 1000 && load.workerUtilization > 0.8) {
        await this.scaleUp(Math.ceil(load.queueSize / 100));
      } else if (load.workerUtilization < 0.2) {
        await this.scaleDown();
      }
    }, 10000); // Check every 10 seconds
  }
  
  async scaleUp(instances) {
    for (let i = 0; i < instances; i++) {
      await this.docker.createContainer({
        Image: 'lightdom/attribute-worker:latest',
        Env: [
          'USE_BIDI=true',
          `WORKER_ID=dynamic-${Date.now()}-${i}`,
          'ORCHESTRATOR_URL=http://orchestrator:8080'
        ],
        HostConfig: {
          NetworkMode: 'mining-network',
          Memory: 512 * 1024 * 1024, // 512MB
          NanoCpus: 500000000 // 0.5 CPU
        }
      }).then(container => container.start());
    }
  }
}
```

### 3.3 Config-Driven Container Behavior

**Schema-Based Container Specification**

```json
{
  "$schema": "https://lightdom.ai/schemas/mining-container.json",
  "containerId": "seo-campaign-product-prices",
  "image": "lightdom/attribute-worker:latest",
  "config": {
    "attribute": {
      "name": "productPrice",
      "type": "currency",
      "validation": {
        "pattern": "^\\$?[0-9,]+(\\.[0-9]{2})?$",
        "range": { "min": 0, "max": 100000 }
      }
    },
    "selectors": {
      "primary": ["[data-testid='price']", "[itemprop='price']"],
      "fallback": [".product-price", ".price-amount"],
      "adaptive": true
    },
    "schedule": {
      "type": "realtime",
      "interval": 300,
      "batchSize": 50
    },
    "biDi": {
      "enabled": true,
      "events": ["network.responseReceived", "log.entryAdded"],
      "streamResults": true
    }
  },
  "linkedSchemas": [
    "schema.org/Product",
    "schema.org/Offer",
    "schema.org/PriceSpecification"
  ],
  "resources": {
    "cpu": "0.5",
    "memory": "512Mi",
    "replicas": 5,
    "autoScale": {
      "min": 2,
      "max": 20,
      "targetUtilization": 0.75
    }
  }
}
```

---

## 4. DeepSeek Integration Patterns

### 4.1 DeepSeek Config Schema

**Tool Definition for DeepSeek**

```json
{
  "$schema": "https://lightdom.ai/schemas/deepseek-tools.json",
  "version": "1.0.0",
  "tools": [
    {
      "name": "mineAttribute",
      "description": "Extract specific data attributes from web pages using BiDi-powered browser instances",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "Target URL to mine"
          },
          "attribute": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "selectors": {
                "type": "array",
                "items": { "type": "string" }
              },
              "validator": { "type": "object" }
            }
          }
        },
        "required": ["url", "attribute"]
      },
      "returns": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "data": { "type": "any" },
          "confidence": { "type": "number" }
        }
      }
    },
    {
      "name": "createMiningCampaign",
      "description": "Set up a new SEO data mining campaign with automatic config generation",
      "parameters": {
        "type": "object",
        "properties": {
          "objective": {
            "type": "string",
            "description": "Goal of the campaign (e.g., 'Monitor competitor pricing')"
          },
          "targetSites": {
            "type": "array",
            "items": { "type": "string" }
          },
          "attributes": {
            "type": "array",
            "items": { "type": "string" }
          },
          "schedule": {
            "type": "string",
            "enum": ["realtime", "hourly", "daily", "weekly"]
          }
        }
      }
    },
    {
      "name": "optimizeMiningConfig",
      "description": "Analyze mining performance and generate optimized configuration",
      "parameters": {
        "type": "object",
        "properties": {
          "campaignId": { "type": "string" },
          "performanceData": {
            "type": "object",
            "description": "Historical performance metrics"
          }
        }
      },
      "returns": {
        "type": "object",
        "properties": {
          "optimizedConfig": { "type": "object" },
          "expectedImprovement": { "type": "number" },
          "reasoning": { "type": "string" }
        }
      }
    }
  ],
  "workflows": [
    {
      "name": "setupSEOCampaign",
      "description": "Complete workflow for setting up an SEO monitoring campaign",
      "steps": [
        {
          "action": "analyzeTargetSites",
          "description": "Inspect target sites to understand structure"
        },
        {
          "action": "generateSelectors",
          "description": "Create selector strategies based on page analysis"
        },
        {
          "action": "createContainers",
          "description": "Spin up worker containers with generated config"
        },
        {
          "action": "startMonitoring",
          "description": "Begin real-time data collection"
        },
        {
          "action": "setupAlerts",
          "description": "Configure alerts for important changes"
        }
      ]
    }
  ]
}
```

### 4.2 Fine-Tuning Dataset Generation

**Generating Training Data from Mining Operations**

```javascript
class DeepSeekTrainingDataGenerator {
  constructor() {
    this.trainingExamples = [];
  }
  
  async captureInteraction(interaction) {
    // Record: Prompt → DeepSeek Reasoning → Action → Result
    const example = {
      prompt: interaction.userRequest,
      reasoning: interaction.deepseekThinking,
      toolCalls: interaction.toolsUsed,
      config: interaction.generatedConfig,
      result: interaction.outcome,
      performance: {
        successRate: interaction.successRate,
        speed: interaction.executionTime,
        resourceUsage: interaction.resources
      }
    };
    
    this.trainingExamples.push(example);
    
    // Generate fine-tuning dataset
    if (this.trainingExamples.length >= 1000) {
      await this.exportDataset();
    }
  }
  
  async exportDataset() {
    const dataset = this.trainingExamples.map(ex => ({
      messages: [
        {
          role: 'system',
          content: 'You are an SEO data mining expert. Generate optimal configurations for web scraping campaigns.'
        },
        {
          role: 'user',
          content: ex.prompt
        },
        {
          role: 'assistant',
          content: JSON.stringify({
            reasoning: ex.reasoning,
            config: ex.config,
            expected_performance: ex.performance
          })
        }
      ]
    }));
    
    await fs.writeFile('deepseek-finetune-dataset.jsonl', 
      dataset.map(d => JSON.stringify(d)).join('\n')
    );
  }
}
```

### 4.3 Simulation Mode for Testing

**Simulate Mining Without Live Scraping**

```javascript
class MiningSimulator {
  constructor() {
    this.mockData = new MockDataGenerator();
    this.performanceModel = new PerformancePredictor();
  }
  
  async simulateCampaign(config) {
    // Predict outcomes without running real crawlers
    const predictions = await this.performanceModel.predict({
      selectors: config.selectors,
      targetSites: config.sites,
      schedule: config.schedule
    });
    
    // Generate synthetic results
    const syntheticResults = await this.mockData.generate({
      schema: config.attributeSchema,
      count: 1000,
      distribution: predictions.distribution
    });
    
    // Run through analytics pipeline
    const analytics = await this.analyzeResults(syntheticResults);
    
    return {
      predicted: predictions,
      synthetic: syntheticResults,
      analytics: analytics,
      recommendation: this.generateRecommendation(analytics)
    };
  }
  
  generateRecommendation(analytics) {
    if (analytics.successRate < 0.7) {
      return {
        action: 'optimize_selectors',
        reasoning: 'Low success rate detected. Consider adding more fallback selectors.',
        suggestedSelectors: this.suggestBetterSelectors(analytics)
      };
    } else {
      return {
        action: 'deploy',
        reasoning: 'Configuration looks good. Ready for production.',
        estimatedCost: this.estimateResourceCost(analytics)
      };
    }
  }
}
```

---

## 5. Self-Generating Component Systems

### 5.1 Schema-to-UI Component Generation

**Automatic CRUD Generation from Schema**

```javascript
class ComponentGenerator {
  async generateFromSchema(schema) {
    const component = {
      name: schema.name,
      type: this.determineComponentType(schema),
      props: this.extractProps(schema),
      hooks: this.generateHooks(schema),
      crud: this.generateCRUD(schema)
    };
    
    return this.renderComponent(component);
  }
  
  generateCRUD(schema) {
    return {
      create: this.generateCreateForm(schema),
      read: this.generateListView(schema),
      update: this.generateEditForm(schema),
      delete: this.generateDeleteConfirmation(schema),
      api: this.generateAPIEndpoints(schema)
    };
  }
  
  generateCreateForm(schema) {
    return `
import { Form, Input, Select, Button } from 'antd';
import { useState } from 'react';

export function Create${schema.name}() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/${schema.apiPath}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      // BiDi: Stream real-time updates
      const eventSource = new EventSource(\`/api/${schema.apiPath}/\${result.id}/stream\`);
      eventSource.onmessage = (event) => {
        console.log('Update:', event.data);
      };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form form={form} onFinish={onFinish}>
      ${this.generateFormFields(schema)}
      <Button type="primary" htmlType="submit" loading={loading}>
        Create ${schema.name}
      </Button>
    </Form>
  );
}
    `;
  }
}
```

### 5.2 Relationship-Based Navigation

**Auto-generate next steps based on schema relationships**

```javascript
class RelationshipNavigator {
  async suggestNextActions(currentSchema, context) {
    const relationships = await this.getRelationships(currentSchema);
    
    const suggestions = relationships.map(rel => ({
      action: this.determineAction(rel),
      targetSchema: rel.target,
      reasoning: this.explainRelationship(rel),
      component: this.generateComponent(rel)
    }));
    
    return suggestions.sort((a, b) => 
      b.relevance - a.relevance
    );
  }
  
  determineAction(relationship) {
    const actionMap = {
      'hasMany': 'list',
      'belongsTo': 'select',
      'manyToMany': 'multiselect',
      'aggregates': 'analytics'
    };
    
    return actionMap[relationship.type] || 'view';
  }
}
```

---

## 6. TensorFlow Streaming Analytics

### 6.1 Real-Time Data Pipelines

**Stream mining results into TensorFlow**

```python
# tensorflow_pipeline.py
import tensorflow as tf
import tensorflow_io as tfio

class RealTimeMiningAnalyzer:
    def __init__(self):
        self.model = self.build_model()
        
    def build_model(self):
        # Model to predict mining success
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        return model
    
    def create_streaming_dataset(self, kafka_topic):
        # Connect to BiDi event stream via Kafka
        dataset = tfio.experimental.streaming.KafkaBatchIODataset(
            topics=[kafka_topic],
            group_id='tensorflow-analyzer',
            servers='localhost:9092'
        )
        
        def parse_event(record):
            # Parse BiDi mining event
            parsed = tf.io.parse_single_example(
                record,
                features={
                    'selector_type': tf.io.FixedLenFeature([], tf.string),
                    'response_time': tf.io.FixedLenFeature([], tf.float32),
                    'success': tf.io.FixedLenFeature([], tf.int64),
                    'dom_complexity': tf.io.FixedLenFeature([], tf.int64)
                }
            )
            return parsed
        
        return dataset.map(parse_event)
    
    def train_on_stream(self, stream_dataset):
        # Continuous learning from live data
        for batch in stream_dataset.batch(32):
            with tf.GradientTape() as tape:
                predictions = self.model(batch['features'])
                loss = self.compute_loss(predictions, batch['labels'])
            
            gradients = tape.gradient(loss, self.model.trainable_variables)
            self.optimizer.apply_gradients(
                zip(gradients, self.model.trainable_variables)
            )
            
            # Push updated predictions back to mining system
            self.update_mining_strategy(predictions)
```

### 6.2 Predictive Optimization

```python
class SelectorOptimizer:
    """Use TF to predict best selectors for new pages"""
    
    def predict_selectors(self, page_features):
        # page_features: DOM structure, element types, etc.
        embeddings = self.feature_extractor(page_features)
        predicted_selectors = self.selector_model(embeddings)
        
        return {
            'selectors': predicted_selectors,
            'confidence': self.calculate_confidence(predicted_selectors),
            'fallback_chain': self.generate_fallbacks(predicted_selectors)
        }
    
    def continuous_improvement(self):
        # Learn from each mining operation
        while True:
            results = self.get_latest_results()
            
            # Update model with actual performance
            self.model.fit(
                results['features'],
                results['success_labels'],
                epochs=1,
                batch_size=32
            )
            
            # Deploy updated model to containers
            self.deploy_model_update()
            
            time.sleep(300)  # Every 5 minutes
```

---

## 7. Schema-Driven Configuration

### 7.1 Default Page Schema

**page.tsx Template Schema**

```json
{
  "$schema": "https://lightdom.ai/schemas/page-component.json",
  "component": "Page",
  "type": "template",
  "defaultStructure": {
    "layout": {
      "type": "grid",
      "columns": 12,
      "responsive": true
    },
    "sections": [
      {
        "name": "header",
        "component": "PageHeader",
        "props": {
          "title": "{{page.title}}",
          "actions": {
            "$ref": "#/components/ActionToolbar"
          }
        }
      },
      {
        "name": "content",
        "component": "PageContent",
        "defaultComponents": [
          {
            "type": "DataTable",
            "features": ["sort", "filter", "pagination"],
            "crud": {
              "create": true,
              "read": true,
              "update": true,
              "delete": true,
              "realtime": true
            },
            "biDi": {
              "enabled": true,
              "streamUpdates": true
            }
          }
        ]
      },
      {
        "name": "sidebar",
        "component": "ContextSidebar",
        "autoGenerate": {
          "basedOn": "relationships",
          "showRelated": true,
          "suggestActions": true
        }
      }
    ]
  },
  "styleGuide": {
    "theme": "discord-dark",
    "spacing": "material-design-3",
    "components": {
      "$ref": "styleguide://components"
    }
  },
  "relationships": {
    "autoDetect": true,
    "displayAs": "navigation",
    "actions": [
      "view",
      "edit",
      "create-related",
      "analyze"
    ]
  }
}
```

### 7.2 Configuration Hierarchy

```
Campaign Config
    ├── Global Settings
    │   ├── BiDi Protocol: enabled
    │   ├── Rate Limits: 100 req/min
    │   └── Error Handling: retry 3x
    │
    ├── Attribute Configs
    │   ├── Product Price
    │   │   ├── Selectors: [...]
    │   │   ├── Validation: currency
    │   │   └── Container: worker-pool-1
    │   │
    │   └── Product Title
    │       ├── Selectors: [...]
    │       ├── Validation: text
    │       └── Container: worker-pool-2
    │
    └── DeepSeek Integration
        ├── Model: deepseek-coder
        ├── Fine-tuning: enabled
        ├── Tools: [mineAttribute, optimizeConfig]
        └── Learning Mode: continuous
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ WebDriver BiDi protocol support
- ✅ Attribute-specific worker pools
- ✅ Basic two-way communication
- 🔄 Container orchestration setup
- 🔄 Schema registry implementation

### Phase 2: DeepSeek Integration (Weeks 3-4)
- Tool definition schema
- DeepSeek API wrapper
- Fine-tuning dataset generation
- Simulation mode
- Performance tracking

### Phase 3: Auto-Generation (Weeks 5-6)
- Schema-to-component generator
- CRUD auto-generation
- Relationship navigation
- UI component library
- Style guide integration

### Phase 4: ML/Analytics (Weeks 7-8)
- TensorFlow streaming pipeline
- Predictive selector engine
- Continuous learning system
- Performance optimization
- A/B testing framework

### Phase 5: Production (Weeks 9-10)
- Monitoring & alerting
- Auto-scaling policies
- Backup & recovery
- Documentation
- User training materials

---

## Key Technologies

### Core Stack
- **WebDriver BiDi**: Two-way browser communication
- **Docker/Kubernetes**: Container orchestration
- **Node.js**: Runtime for workers and API
- **TypeScript**: Type-safe development
- **React**: UI component framework

### Data & ML
- **TensorFlow**: Machine learning & analytics
- **PostgreSQL + TimescaleDB**: Time-series data storage
- **Redis**: Real-time caching & pub/sub
- **Kafka**: Event streaming (optional)

### AI Integration
- **DeepSeek**: Code generation & reasoning
- **Ollama**: Local LLM hosting
- **LangChain**: Tool chaining (optional)

---

## References

1. WebDriver BiDi Specification: https://w3c.github.io/webdriver-bidi/
2. Puppeteer BiDi Support: https://pptr.dev/webdriver-bidi
3. TensorFlow Streaming: https://www.tensorflow.org/io/tutorials/kafka
4. Schema.org Vocabulary: https://schema.org/
5. Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
6. DeepSeek Documentation: https://platform.deepseek.com/docs

---

## Next Actions

1. **Immediate**: Implement container orchestration layer
2. **Short-term**: Build DeepSeek tool integration
3. **Medium-term**: Develop auto-generation system
4. **Long-term**: Production deployment & scaling

---

**Document Status**: Living Document - Updated Continuously  
**Maintainers**: LightDom Development Team  
**Last Review**: November 2024
