# TensorFlow Neural Network Workflow Orchestration System

## Overview

The TensorFlow Neural Network Workflow Orchestration System is a comprehensive platform for managing AI-powered workflows, training neural networks, and providing automated SEO services to clients. It integrates DeepSeek for intelligent workflow generation, Puppeteer for web automation, and TensorFlow.js for neural network training.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Components](#core-components)
3. [Getting Started](#getting-started)
4. [API Reference](#api-reference)
5. [Client Integration](#client-integration)
6. [Workflow Creation](#workflow-creation)
7. [Training Data Collection](#training-data-collection)
8. [DeepSeek Tools](#deepseek-tools)
9. [Examples](#examples)

---

## Architecture

The system consists of several interconnected components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard                        │
│  - Workflow Management                                       │
│  - Service Registry Viewer                                   │
│  - Tool Execution Interface                                  │
│  - Training Data Configuration                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    API Layer                                 │
│  /api/tensorflow/*         - Workflow & Service APIs         │
│  /api/tensorflow/client/*  - Client SEO Dashboard APIs       │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Core Services                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  TensorFlow Workflow Orchestrator                   │    │
│  │  - Workflow execution engine                        │    │
│  │  - Service registry                                 │    │
│  │  - Meta-workflow creation                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  DeepSeek Tools Service                             │    │
│  │  - Puppeteer-based web automation                   │    │
│  │  - Schema extraction                                │    │
│  │  - SEO campaign setup                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Training Data Service                              │    │
│  │  - Automated data collection                        │    │
│  │  - Preprocessing pipeline                           │    │
│  │  - Storage management                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Neural Network Instance Manager                    │    │
│  │  - Per-client neural networks                       │    │
│  │  - Training coordination                            │    │
│  │  - Model versioning                                 │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. TensorFlow Workflow Orchestrator

**Purpose**: Manages workflow creation, execution, and coordination across services.

**Key Features**:
- Create workflows from DeepSeek prompts
- Execute workflows with dependency resolution
- Service registry for discovering available APIs
- Meta-workflows (workflows that create workflows)

**Location**: `src/services/ai/TensorFlowWorkflowOrchestrator.ts`

### 2. DeepSeek Tools Service

**Purpose**: Provides Puppeteer-based tools for web automation and data extraction.

**Available Tools**:
1. `extract_page_schema` - Extract structured data from web pages
2. `collect_training_data` - Crawl websites for training data
3. `analyze_component_structure` - Analyze UI components
4. `extract_workflow_config` - Extract workflow configurations
5. `setup_seo_campaign` - Setup SEO campaigns for clients
6. `generate_dashboard_config` - Create dashboard configurations

**Location**: `src/services/ai/DeepSeekToolsService.ts`

### 3. Training Data Service

**Purpose**: Automates training data collection with configurable triggers.

**Key Features**:
- Multiple data sources (web crawler, API, database, file)
- Scheduled, threshold, and workflow-based triggers
- Preprocessing pipeline with normalization and tokenization
- Quality scoring and validation

**Location**: `src/services/ai/TrainingDataService.ts`

### 4. Client SEO Dashboard

**Purpose**: Provides embeddable SEO dashboards for clients.

**Key Features**:
- API key authentication
- Per-client neural network instances
- Real-time metrics and insights
- Embed script for integration

**Location**: `src/components/dashboards/ClientSEODashboard.tsx`

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional)
- Ollama with DeepSeek-R1 model

### Installation

1. **Setup Database**:
```bash
# Run migrations
psql -U postgres -d your_database -f database/migrations/006_tensorflow_workflow_orchestration.sql
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Configure Environment**:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=your_password

# Ollama
OLLAMA_API_URL=http://localhost:11434

# Application
FRONTEND_URL=http://localhost:3000
API_PORT=3001
```

4. **Start Services**:
```bash
# Start Ollama
ollama serve

# Pull DeepSeek model
ollama pull deepseek-r1

# Start application
npm run dev
```

---

## API Reference

### Workflow Endpoints

#### Create Workflow from Prompt
```http
POST /api/tensorflow/workflows/from-prompt
Content-Type: application/json

{
  "prompt": "Create a workflow to collect SEO data and train a neural network",
  "context": {
    "industry": "e-commerce",
    "keywords": ["product pages", "checkout flow"]
  }
}
```

#### Execute Workflow
```http
POST /api/tensorflow/workflows/:id/execute
Content-Type: application/json

{
  "inputs": {
    "neuralNetworkId": "nn-123",
    "dataConfig": {}
  }
}
```

#### Get Service Registry
```http
GET /api/tensorflow/services
```

### Tool Endpoints

#### List Available Tools
```http
GET /api/tensorflow/tools
```

#### Execute Tool
```http
POST /api/tensorflow/tools/:name/execute
Content-Type: application/json

{
  "args": {
    "url": "https://example.com",
    "dataType": "seo"
  }
}
```

### Training Data Endpoints

#### Create Training Data Configuration
```http
POST /api/tensorflow/training-data/configs
Content-Type: application/json

{
  "neuralNetworkId": "nn-123",
  "dataType": "seo",
  "source": {
    "type": "web-crawler",
    "config": {
      "startUrl": "https://example.com",
      "maxSamples": 100
    }
  },
  "preprocessing": {
    "normalization": true,
    "tokenization": {
      "enabled": true,
      "maxLength": 512
    }
  },
  "storage": {
    "destination": "database",
    "format": "json"
  },
  "triggers": [
    {
      "type": "scheduled",
      "config": {
        "schedule": "0 0 * * *"
      },
      "enabled": true
    }
  ],
  "status": "active"
}
```

#### Trigger Data Collection
```http
POST /api/tensorflow/training-data/configs/:id/collect
```

### Client API Endpoints

#### Create Client Campaign
```http
POST /api/tensorflow/client/campaigns
Content-Type: application/json

{
  "clientId": "client-123",
  "targetUrl": "https://client-site.com",
  "keywords": ["keyword1", "keyword2"],
  "competitors": ["https://competitor1.com"],
  "planType": "premium",
  "config": {}
}
```

Response:
```json
{
  "id": "campaign-123",
  "apiKey": "generated-api-key-here",
  "embedCode": "<script src=\"https://yoursite.com/embed/seo-dashboard.js\" data-api-key=\"...\"></script>"
}
```

#### Get Campaign Data (Client-facing)
```http
GET /api/tensorflow/client/campaign
Headers:
  X-API-Key: client-api-key
```

---

## Client Integration

### Embedding the Dashboard

Clients can embed their SEO dashboard on their website using a simple script tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>My SEO Dashboard</h1>
  
  <!-- LightDom SEO Dashboard Embed -->
  <script 
    src="https://yoursite.com/embed/seo-dashboard.js" 
    data-api-key="your-client-api-key-here">
  </script>
  
</body>
</html>
```

### JavaScript API

The embed script exposes a JavaScript API:

```javascript
// Reload the dashboard
window.LightDomSEO.reload();

// Hide the dashboard
window.LightDomSEO.hide();

// Show the dashboard
window.LightDomSEO.show();

// Get version
console.log(window.LightDomSEO.version); // "1.0.0"
```

---

## Workflow Creation

### Using DeepSeek Prompts

Create workflows using natural language:

```javascript
const response = await fetch('/api/tensorflow/workflows/from-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: `Create a workflow that:
    1. Crawls competitor websites
    2. Extracts SEO data
    3. Trains a neural network to predict optimal keywords
    4. Generates recommendations`,
    context: {
      industry: 'e-commerce',
      competitors: ['site1.com', 'site2.com']
    }
  })
});

const workflow = await response.json();
```

### Meta-Workflows

Create a "workflow that creates workflows":

```javascript
const response = await fetch('/api/tensorflow/workflows/meta', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const metaWorkflow = await response.json();
```

The meta-workflow will:
1. Analyze requirements from prompts
2. Identify required services
3. Generate workflow configurations
4. Validate and register workflows

---

## Training Data Collection

### Configuration Schema

```typescript
interface TrainingDataConfig {
  neuralNetworkId: string;
  dataType: 'seo' | 'ui-patterns' | 'content' | 'workflow' | 'custom';
  source: {
    type: 'web-crawler' | 'api' | 'database' | 'file';
    config: {
      startUrl?: string;
      apiEndpoint?: string;
      databaseQuery?: string;
      maxSamples?: number;
    };
  };
  preprocessing: {
    normalization: boolean;
    tokenization?: {
      enabled: boolean;
      maxLength?: number;
    };
    validation?: {
      enabled: boolean;
      rules: ValidationRule[];
    };
  };
  storage: {
    destination: 'database' | 'file' | 'both';
    format: 'json' | 'csv' | 'tfrecord';
  };
  triggers: DataCollectionTrigger[];
}
```

### Trigger Types

1. **Manual Trigger**: Trigger collection manually via API
2. **Scheduled Trigger**: Use cron expressions for periodic collection
3. **Threshold Trigger**: Trigger when metrics cross thresholds
4. **Workflow Trigger**: Trigger from workflow execution

---

## DeepSeek Tools

### Extract Page Schema

```javascript
const result = await executeTool('extract_page_schema', {
  url: 'https://example.com',
  selectors: ['form', '[data-component]']
});
```

### Collect Training Data

```javascript
const result = await executeTool('collect_training_data', {
  startUrl: 'https://example.com',
  dataType: 'seo',
  maxPages: 50
});
```

### Setup SEO Campaign

```javascript
const result = await executeTool('setup_seo_campaign', {
  targetUrl: 'https://client-site.com',
  keywords: ['product', 'service'],
  competitors: ['https://competitor.com']
});
```

---

## Examples

### Example 1: Complete SEO Workflow

```javascript
// 1. Create client campaign
const campaign = await createCampaign({
  clientId: 'client-abc',
  targetUrl: 'https://client-site.com',
  keywords: ['ecommerce', 'products'],
  planType: 'premium'
});

// 2. Setup training data collection
const dataConfig = await createTrainingDataConfig({
  neuralNetworkId: campaign.neuralNetworkId,
  dataType: 'seo',
  source: {
    type: 'web-crawler',
    config: {
      startUrl: campaign.targetUrl,
      maxSamples: 1000
    }
  },
  triggers: [{
    type: 'scheduled',
    config: { schedule: '0 0 * * *' },
    enabled: true
  }]
});

// 3. Create workflow from prompt
const workflow = await createWorkflowFromPrompt({
  prompt: 'Analyze collected SEO data and generate optimization recommendations',
  context: { campaignId: campaign.id }
});

// 4. Execute workflow
const execution = await executeWorkflow(workflow.id, {
  inputs: { campaignId: campaign.id }
});
```

### Example 2: Embedding Dashboard

```html
<!-- Client's website -->
<!DOCTYPE html>
<html>
<head>
  <title>My Business - SEO Dashboard</title>
  <style>
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="dashboard-container">
    <h1>My SEO Performance</h1>
    <script 
      src="https://lightdom-platform.com/embed/seo-dashboard.js" 
      data-api-key="abc123xyz789">
    </script>
  </div>
</body>
</html>
```

---

## Dashboard Navigation

Access the dashboard at: `http://localhost:3000/dashboard/tensorflow-workflow`

The dashboard provides:
- **Workflows Tab**: Create and manage workflows
- **Services Tab**: View available services and capabilities
- **DeepSeek Tools Tab**: Execute web automation tools
- **Training Data Tab**: Configure and monitor data collection

---

## Security Considerations

1. **API Keys**: Generated using cryptographically secure random bytes
2. **Iframe Sandboxing**: Embedded dashboards use iframe sandboxing
3. **CORS**: Configured for specific origins only
4. **Rate Limiting**: Applied to all public endpoints
5. **Input Validation**: All inputs sanitized and validated

---

## Troubleshooting

### Common Issues

**Issue**: Ollama not responding
```bash
# Solution: Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

**Issue**: Database connection failed
```bash
# Solution: Verify PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL
```

**Issue**: Workflow creation fails
```bash
# Solution: Check DeepSeek model is available
ollama list | grep deepseek
```

---

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.
