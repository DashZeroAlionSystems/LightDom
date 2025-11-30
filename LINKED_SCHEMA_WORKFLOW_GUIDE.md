# Linked Schema Workflow System

A neural network-powered system for generating functional UI components and n8n workflows from linked schema relationships.

## Overview

This system provides:

1. **Neural Relationship Prediction** - Predicts functional relationships between schemas (component + click actions, styling, animations, icons)
2. **N8N Workflow Generation** - Converts linked schemas into executable n8n workflows
3. **DeepSeek Integration** - AI-powered workflow configuration and relationship generation
4. **Status Indicators** - Animated status icons with anime.js for service monitoring
5. **Training Data Generation** - Creates training data for the relationship predictor

## Quick Start

### 1. Predict Relationships for a Schema

```javascript
import { NeuralRelationshipPredictor } from './services/neural-relationship-predictor.js';

const predictor = new NeuralRelationshipPredictor();

// Define a component schema
const buttonSchema = {
  type: 'button',
  name: 'Submit Button',
  category: 'action',
  onClick: true,
};

// Predict relationships
const relationships = await predictor.predictRelationships(buttonSchema);
console.log(relationships);
// [
//   { type: 'component_click', target: 'onClick', confidence: 0.95 },
//   { type: 'component_animation', target: 'click_feedback', animejs: {...}, confidence: 0.9 },
//   { type: 'component_style', target: 'primary_style', confidence: 0.85 }
// ]
```

### 2. Generate Functional Component

```javascript
const component = predictor.generateFunctionalComponent(relationships, {
  componentType: 'button',
  includeAnimation: true,
  includeStatus: true,
  framework: 'react',
});

console.log(component.code); // React component with anime.js animations
```

### 3. Generate N8N Workflow from Schema

```javascript
import LinkedSchemaN8nConverter from './services/linked-schema-n8n-converter.js';

const converter = new LinkedSchemaN8nConverter();

const workflow = await converter.convertSchemaToWorkflow({
  id: 'user-form',
  name: 'User Registration',
  type: 'form',
  fields: [
    { name: 'username', type: 'string' },
    { name: 'email', type: 'string' },
  ],
}, {
  templateType: 'dataProcessing',
  includeStatusIndicators: true,
  generateDeepSeekConfig: false,
});

// workflow contains complete n8n workflow definition
console.log(workflow.nodes.length); // 7 nodes
```

### 4. Use Status Indicators

```tsx
import { StatusIndicator, ServiceStatusGrid } from './components/StatusIndicator';

// Single indicator
<StatusIndicator 
  status="success" 
  serviceName="API Server" 
  message="All systems operational"
/>

// Multiple services grid
<ServiceStatusGrid
  services={[
    { id: '1', name: 'API Server', status: 'success' },
    { id: '2', name: 'Database', status: 'loading' },
    { id: '3', name: 'Cache', status: 'warning' },
  ]}
/>
```

## API Endpoints

### Predict Relationships
```http
POST /api/linked-schema/predict
Content-Type: application/json

{
  "schema": {
    "type": "button",
    "name": "Submit Button"
  },
  "context": {
    "preferAnimations": true
  }
}
```

### Generate Component
```http
POST /api/linked-schema/generate-component
Content-Type: application/json

{
  "schema": {
    "type": "button",
    "name": "Primary Action"
  },
  "options": {
    "framework": "react",
    "includeAnimation": true
  }
}
```

### Generate N8N Workflow
```http
POST /api/linked-schema/generate-workflow
Content-Type: application/json

{
  "schema": {
    "id": "data-pipeline",
    "name": "Data Processing",
    "type": "data_pipeline"
  },
  "options": {
    "templateType": "dataProcessing",
    "includeStatusIndicators": true
  }
}
```

### DeepSeek Relationship Generation
```http
POST /api/linked-schema/deepseek/generate
Content-Type: application/json

{
  "description": "Create a dashboard with animated status indicators for monitoring n8n workflows",
  "requirements": ["status icons", "anime.js animations", "n8n integration"]
}
```

### Get Status Indicator Configuration
```http
POST /api/linked-schema/status-indicator
Content-Type: application/json

{
  "status": "success",
  "service": "API Server"
}
```

## Workflow Templates

| Template | Description | Nodes |
|----------|-------------|-------|
| `crud` | CRUD operations | webhook, function, postgres, response |
| `dataProcessing` | Data pipeline | webhook, function, httpRequest, function, postgres, response |
| `notification` | Notifications | webhook, if, httpRequest, response |
| `componentStatus` | Status monitoring | schedule, httpRequest, if, function, httpRequest |
| `schemaValidation` | Schema validation | webhook, function, if, response |
| `aiPowered` | AI processing | webhook, function, httpRequest, function, response |

## Relationship Types

| Type | Description |
|------|-------------|
| `component_click` | Click action handlers |
| `component_style` | Style guide styling |
| `component_animation` | Anime.js animations |
| `component_icon` | Status icons |
| `workflow_trigger` | N8N workflow triggers |
| `workflow_action` | N8N workflow actions |
| `workflow_transform` | Data transformations |
| `ux_feedback` | User feedback mechanisms |
| `ux_validation` | Form validation |

## Animation Presets

All animations use [anime.js](https://animejs.com):

```javascript
// Click feedback
{ scale: [1, 0.95, 1], duration: 200, easing: 'easeInOutQuad' }

// Success indicator
{ scale: [0.8, 1.1, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, .5)' }

// Loading spinner
{ rotate: 360, duration: 1000, loop: true, easing: 'linear' }

// Error shake
{ translateX: [-5, 5, -5, 5, 0], duration: 400, easing: 'easeInOutQuad' }

// Hover elevation
{ translateY: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', duration: 300 }
```

## Training the Predictor

```javascript
import { RelationshipTrainingGenerator } from './services/relationship-training-generator.js';

const generator = new RelationshipTrainingGenerator();

// Generate all training data
const trainingData = generator.generateAllTrainingData();

// Generate specific training data
const animationData = generator.generateAnimationTrainingData();
const statusData = generator.generateStatusIndicatorTrainingData();
const n8nData = generator.generateN8nWorkflowTrainingData();

// Train the predictor
await predictor.train(trainingData.examples);

// Export training data
const json = generator.exportToJSON();
```

## DeepSeek Integration for N8N Workflows

To configure DeepSeek to use our n8n service:

```javascript
// POST /api/linked-schema/deepseek/train
{
  "examples": [
    {
      "input": "Create a workflow for processing form submissions",
      "schema": { "type": "form", "name": "Contact Form" },
      "options": { "templateType": "dataProcessing" }
    }
  ]
}
```

This generates DeepSeek tool definitions that allow it to call our API:

```json
{
  "type": "function",
  "function": {
    "name": "contact_form_data_pipeline",
    "description": "Process and transform data from Contact Form",
    "parameters": {
      "type": "object",
      "properties": {
        "data": { "type": "object", "description": "Input data" }
      }
    }
  }
}
```

## Environment Variables

```bash
# N8N Configuration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# DeepSeek Configuration
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_api_key

# API Configuration
API_URL=http://localhost:3001
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ StatusIndicator  │  │  Workflow Builder                │ │
│  │ (anime.js)       │  │  (n8n integration)               │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
│  /api/linked-schema/predict      - Relationship prediction  │
│  /api/linked-schema/generate-*   - Component/workflow gen   │
│  /api/linked-schema/deepseek/*   - DeepSeek integration     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Service Layer (Node.js)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NeuralRelationshipPredictor                         │  │
│  │  - Pattern matching                                   │  │
│  │  - Component generation                               │  │
│  │  - Workflow generation                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LinkedSchemaN8nConverter                            │  │
│  │  - Template-based workflow generation                │  │
│  │  - DeepSeek configuration enhancement                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ N8N Server   │  │ DeepSeek AI  │  │ PostgreSQL   │      │
│  │ :5678        │  │ API          │  │ :5432        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Related Documentation

- [Schema Linking Architecture](./SCHEMA_LINKING_ARCHITECTURE.md)
- [N8N Integration Guide](./N8N_INTEGRATION_GUIDE.md)
- [DeepSeek Workflow Research](./DEEPSEEK_WORKFLOW_RESEARCH.md)
- [Linked Schema Training Data](./linked-schema-training-data.js)
