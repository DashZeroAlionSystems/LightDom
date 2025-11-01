# LightDom Design System & n8n Workflow Integration

## Overview

This comprehensive system integrates advanced design pattern mining, neural network training data generation, and n8n workflow automation into the LightDom platform. The system enables:

1. **Component Mining**: Automated extraction of component patterns from popular UI libraries
2. **Workflow Mining**: Pattern extraction from n8n workflows and automation templates
3. **Training Data Generation**: Neural network datasets for component and workflow generation
4. **n8n Integration**: Full workflow automation engine with Docker support
5. **Prompt-Based Generation**: AI-powered component and workflow creation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   LightDom Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐           │
│  │  Component       │      │  Workflow        │           │
│  │  Mining Service  │◄────►│  Mining Service  │           │
│  └────────┬─────────┘      └────────┬─────────┘           │
│           │                         │                      │
│           │                         │                      │
│  ┌────────▼─────────────────────────▼─────────┐           │
│  │     Training Data Generator               │           │
│  │  - Component combinations                 │           │
│  │  - Workflow patterns                      │           │
│  │  - Neural network datasets                │           │
│  └────────┬──────────────────────────────────┘           │
│           │                                                │
│           │                                                │
│  ┌────────▼──────────────────────────────────┐           │
│  │     Neural Network Training               │           │
│  │  - Component generation model             │           │
│  │  - Workflow generation model              │           │
│  │  - Composition model                      │           │
│  └────────┬──────────────────────────────────┘           │
│           │                                                │
│           │                                                │
│  ┌────────▼──────────────────────────────────┐           │
│  │     Generation APIs                       │           │
│  │  - Prompt-based component creation        │           │
│  │  - Workflow automation                    │           │
│  │  - Component composition                  │           │
│  └───────────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Integrates with
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   n8n Workflow Engine                        │
├─────────────────────────────────────────────────────────────┤
│  - Docker container orchestration                           │
│  - PostgreSQL workflow storage                              │
│  - Webhook triggers                                         │
│  - API integration                                          │
│  - Workflow execution engine                                │
└─────────────────────────────────────────────────────────────┘
```

## Component Mining System

### Atomic Design Structure

The system uses atomic design methodology:

- **Atoms**: Basic building blocks (Button, Input, Icon, Label, Badge)
- **Molecules**: Combinations of atoms (FormField, Card, SearchBar)
- **Organisms**: Complex components (Form, Table, Navigation, Modal)
- **Templates**: Page layouts
- **Pages**: Complete interfaces

### Mined Component Libraries

1. **Bootstrap** - Most popular CSS framework
2. **Material-UI** - React Material Design implementation
3. **Ant Design** - Enterprise-class UI design system
4. **Chakra UI** - Accessible component library
5. **Tailwind UI** - Utility-first components
6. **Shadcn UI** - Re-usable components
7. **Radix UI** - Unstyled primitives
8. **Headless UI** - Unstyled accessible components

### Component Schema Structure

Each component includes:

```typescript
interface ComponentPattern {
  id: string;
  name: string;
  category: string;
  atomicLevel: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  html: string;
  css: string;
  props: Record<string, any>;
  variants: string[];
  dependencies: string[];
  library: string;
  designTokens: Record<string, any>;
  accessibility: {
    ariaLabels: string[];
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };
  schema: ComponentSchema;
}
```

## Workflow Mining System

### Workflow Categories

1. **Data Synchronization**: Database syncs, API integrations
2. **Automation**: Task automation, process optimization
3. **Integration**: Service connections, data flow
4. **Notification**: Multi-channel alerts, messaging
5. **Data Processing**: Transformation, aggregation
6. **Monitoring**: Health checks, performance tracking
7. **Deployment**: CI/CD, infrastructure automation
8. **Content Management**: Publishing, distribution
9. **Customer Support**: Ticket management, responses
10. **Marketing**: Campaign automation, lead scoring

### Workflow Pattern Structure

```typescript
interface WorkflowPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  triggers: string[];
  actions: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  tags: string[];
  useCase: string;
  schema: WorkflowSchema;
}
```

## Training Data Generation

### Neural Network Datasets

The system generates three types of training datasets:

#### 1. Component Generation Task
```json
{
  "task": "component-generation",
  "samples": [
    {
      "input": "Generate a molecule component for form with props: {...}",
      "output": {
        "html": "<div class='form-field'>...</div>",
        "css": ".form-field { ... }",
        "schema": { ... }
      }
    }
  ]
}
```

#### 2. Workflow Generation Task
```json
{
  "task": "workflow-generation",
  "samples": [
    {
      "input": "Generate a moderate workflow for data-synchronization with use case: API to Database sync",
      "output": {
        "nodes": [...],
        "connections": [...],
        "schema": { ... }
      }
    }
  ]
}
```

#### 3. Component Composition Task
```json
{
  "task": "component-composition",
  "samples": [
    {
      "input": "Compose a molecule component: FormField using atoms: Label, Input",
      "output": {
        "schema": { ... }
      }
    }
  ]
}
```

### Training Configuration

```json
{
  "modelArchitecture": {
    "type": "transformer",
    "layers": 12,
    "hiddenSize": 768,
    "attentionHeads": 12,
    "vocabularySize": 50000
  },
  "hyperparameters": {
    "learningRate": 0.0001,
    "batchSize": 32,
    "epochs": 100,
    "warmupSteps": 10000
  }
}
```

## n8n Workflow Integration

### Docker Setup

The integration includes a fully configured n8n Docker service:

```yaml
n8n:
  image: n8nio/n8n:latest
  environment:
    DB_TYPE: postgresdb
    DB_POSTGRESDB_HOST: postgres
    N8N_BASIC_AUTH_ACTIVE: true
    LIGHTDOM_API_URL: http://app:3001
  ports:
    - "5678:5678"
  volumes:
    - n8n_data:/home/node/.n8n
    - ./workflows/n8n:/home/node/.n8n/workflows
```

### Workflow Templates

#### DOM Optimization Workflow
- **Trigger**: Webhook (`/webhook/dom-optimize`)
- **Steps**:
  1. Validate Input URL
  2. Crawl Website
  3. Optimize DOM
  4. Record on Blockchain
  5. Send Notification

#### Data Synchronization Workflow
- **Trigger**: Schedule (hourly)
- **Steps**:
  1. Fetch Unsynced Data from PostgreSQL
  2. Transform Data
  3. Sync to External Service
  4. Mark as Synced

### API Integration

```typescript
// List workflows
GET /api/n8n/workflows

// Execute workflow
POST /api/n8n/workflows/:id/execute

// Trigger webhook
POST /api/n8n/webhooks/:path

// Get executions
GET /api/n8n/executions
```

## Usage Guide

### 1. Mining Design Patterns

```bash
# Mine components and workflows
npm run design-system:mine

# This generates:
# - ./data/design-system/components/
# - ./data/design-system/schemas/
# - ./data/design-system/training-data/
# - ./data/workflow-patterns/workflows/
# - ./data/workflow-patterns/schemas/
# - ./data/neural-network-training/
```

### 2. Setup n8n Integration

```bash
# Run setup script
npm run n8n:setup

# Start n8n
npm run n8n:start

# Access UI
open http://localhost:5678
```

### 3. Import Workflow Templates

1. Open n8n UI (http://localhost:5678)
2. Go to Workflows → Import from File
3. Select templates from `workflows/n8n/templates/`

### 4. Test Workflows

```bash
# Test DOM optimization
curl -X POST http://localhost:5678/webhook/dom-optimize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Via LightDom API
curl -X POST http://localhost:3001/api/n8n/webhooks/dom-optimize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 5. Train Neural Network

```bash
# Use comprehensive training data
npm run train:model -- \
  --data ./data/neural-network-training/comprehensive-training-data.json

# Or use task-specific datasets
npm run train:component-generation -- \
  --data ./data/neural-network-training/component-generation-task.json

npm run train:workflow-generation -- \
  --data ./data/neural-network-training/workflow-generation-task.json
```

### 6. Generate Components and Workflows

```bash
# Generate component from prompt
npm run generate:component -- \
  --prompt "Create a login form with email and password"

# Generate workflow from prompt
npm run generate:workflow -- \
  --prompt "Create a data sync workflow from PostgreSQL to external API"
```

## Generated Data Structure

```
data/
├── design-system/
│   ├── components/
│   │   ├── all-components.json
│   │   ├── atom-components.json
│   │   ├── molecule-components.json
│   │   └── organism-components.json
│   ├── schemas/
│   │   └── all-schemas.json
│   └── training-data/
│       └── neural-network-training-data.json
├── workflow-patterns/
│   ├── workflows/
│   │   ├── all-workflows.json
│   │   ├── automation-workflows.json
│   │   ├── data-synchronization-workflows.json
│   │   └── ...
│   ├── schemas/
│   │   └── all-workflow-schemas.json
│   └── training-data/
│       └── neural-network-training-data.json
├── neural-network-training/
│   ├── comprehensive-training-data.json
│   ├── component-generation-task.json
│   ├── workflow-generation-task.json
│   └── component-composition-task.json
├── MINING_REPORT.json
└── MINING_REPORT.md
```

## Key Features

### 1. Comprehensive Component Mining
- Mines 8+ popular UI libraries
- Extracts atomic design patterns
- Generates component schemas
- Creates composability rules

### 2. Workflow Pattern Extraction
- 10+ workflow categories
- Template generation
- Complexity analysis
- Pattern recognition

### 3. Neural Network Training Data
- 3 task-specific datasets
- Comprehensive metadata
- Training configuration
- Hyperparameter suggestions

### 4. n8n Integration
- Docker orchestration
- PostgreSQL persistence
- Webhook triggers
- API endpoints
- Workflow templates

### 5. Prompt-Based Generation
- Natural language input
- AI-powered component creation
- Workflow automation
- Schema generation

## Benefits

1. **Rapid Development**: Generate components and workflows from simple prompts
2. **Consistency**: All components follow atomic design principles
3. **Scalability**: Neural network learns from patterns to create variations
4. **Automation**: n8n workflows automate repetitive tasks
5. **Integration**: Seamless connection between design system and workflows
6. **Training Data**: Ready-to-use datasets for ML model training

## Future Enhancements

1. **Real-time Component Generation API**
2. **Visual Workflow Designer Integration**
3. **Component Variant Generator**
4. **Automated Testing for Generated Components**
5. **Design Token Extraction from Figma**
6. **Advanced Workflow Pattern Recognition**
7. **Multi-Framework Component Generation**
8. **Automated Documentation Generation**

## Resources

- Component Mining Service: `src/design-system/ComponentMiningService.ts`
- Workflow Mining Service: `src/design-system/N8nWorkflowMiningService.ts`
- Mining CLI: `scripts/mine-design-system.ts`
- n8n Setup: `scripts/setup-n8n-integration.js`
- n8n Integration Docs: `docs/N8N_WORKFLOW_INTEGRATION.md`
- Training Data: `data/neural-network-training/`

## Support

For questions or issues:
1. Check the documentation in `docs/`
2. Review generated reports in `data/MINING_REPORT.md`
3. Open an issue on GitHub
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-01  
**Status**: Production Ready
