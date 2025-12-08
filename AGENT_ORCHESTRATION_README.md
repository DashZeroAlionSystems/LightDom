# Agent-Driven Component & Workflow System

## Overview

A comprehensive AI-powered system for generating components, dashboards, and services from natural language prompts. Built on top of the LightDom platform, this system leverages DeepSeek AI and atomic component schemas to enable rapid, config-driven development.

## Features

### 🤖 AI-Powered Generation
- **Natural Language Prompts**: Describe what you want in plain English
- **Intent Analysis**: AI automatically determines what you're trying to create
- **Smart Configuration**: Generates complete configs from minimal input
- **Multi-Type Support**: Components, dashboards, services, and workflows

### 📦 Atomic Component System
- **Schema-Driven**: Components defined by JSON schemas
- **Type-Safe**: Auto-generates TypeScript types and Zod validation
- **Complete Scaffolding**: Components, tests, stories, and docs
- **Storybook Integration**: Interactive component playground
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages

### 🔄 Workflow Orchestration
- **Prompt → Config → Component**: End-to-end automation
- **Multi-Step Workflows**: Complex orchestrations with checkpoints
- **Real-Time Monitoring**: Track workflow progress
- **History & Analytics**: Review past generations

## Architecture

```
┌─────────────────┐
│ Natural Language│
│     Prompt      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Intent Analysis│  ← DeepSeek AI
│  (AI-Powered)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Config Generator│  ← Schema Templates
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Orchestrator  │
│   • Component   │
│   • Dashboard   │
│   • Service     │
│   • Workflow    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Generator │
│   • TypeScript  │
│   • Tests       │
│   • Stories     │
│   • Schemas     │
└─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create a `.env` file:

```env
# DeepSeek API (optional but recommended)
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek-chat

# Database (for workflow storage)
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
```

### 3. Run Demo

```bash
# Full demo (components + orchestration)
node demo-agent-orchestration.js

# Component generation only
node demo-agent-orchestration.js --component-only

# Orchestration only
node demo-agent-orchestration.js --orchestrator-only
```

## Usage

### CLI Usage

#### Generate Components

```bash
# From schema
node services/atomic-component-generator.js generate Button

# Generate all components
node services/atomic-component-generator.js generate-all

# List available schemas
node services/atomic-component-generator.js list

# With AI enhancement
node services/atomic-component-generator.js generate Button --ai
```

#### Execute Workflows

```bash
# From prompt
node services/agent-workflow-orchestrator.js "Create a button component with primary and secondary variants"

# More examples
node services/agent-workflow-orchestrator.js "Generate a dashboard for user analytics"
node services/agent-workflow-orchestrator.js "Create a service for managing user authentication"
```

### API Usage

#### Start API Server

```bash
npm run start:dev
```

#### Execute Workflow from Prompt

```bash
POST /api/agent/orchestrate
Content-Type: application/json

{
  "prompt": "Create a search bar component with autocomplete",
  "options": {
    "useAI": true
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "workflowId": "workflow-1234567890",
    "intent": {
      "type": "component",
      "entities": {
        "name": "SearchBar",
        "purpose": "search bar with autocomplete"
      }
    },
    "result": {
      "type": "component",
      "componentName": "SearchBar",
      "files": { /* generated files */ }
    }
  }
}
```

#### Get Component Library

```bash
GET /api/agent/components
```

#### Generate Specific Component

```bash
POST /api/agent/components/generate
Content-Type: application/json

{
  "componentName": "Button",
  "options": {
    "useAI": true
  }
}
```

#### Get Workflow History

```bash
GET /api/agent/workflows?limit=10
```

#### Get Workflow Stats

```bash
GET /api/agent/stats
```

### React Component Usage

Add to your React app:

```tsx
import { AgentOrchestrationDashboard } from '@/components/design-system/AgentOrchestrationDashboard';

function App() {
  return (
    <div>
      <AgentOrchestrationDashboard />
    </div>
  );
}
```

## Component Schemas

### Schema Format

Components are defined using an extended JSON-LD schema format:

```json
{
  "@context": "https://schema.org",
  "@type": "Button",
  "@id": "lightdom:button",
  "name": "Button",
  "description": "Clickable button component",
  
  "lightdom:componentType": "atom",
  "lightdom:reactComponent": "Button",
  "lightdom:category": "action",
  "lightdom:priority": 1,
  
  "lightdom:props": [
    {
      "name": "label",
      "type": "string",
      "required": true,
      "description": "Button label text"
    },
    {
      "name": "variant",
      "type": "string",
      "required": false,
      "enum": ["primary", "secondary", "danger"],
      "default": "primary"
    }
  ],
  
  "lightdom:semanticMeaning": "Initiates an action when clicked",
  "lightdom:accessibility": {
    "role": "button",
    "keyboard": { "enter": "activate", "space": "activate" }
  }
}
```

### Schema Location

Schemas are stored in `schemas/components/`:

```
schemas/
├── components/
│   ├── button.json
│   ├── input.json
│   ├── checkbox.json
│   └── ...
```

### Generated Files

For each component, the generator creates:

```
src/components/atoms/Button/
├── Button.tsx             # React component
├── Button.types.ts        # TypeScript types
├── Button.schema.ts       # Zod validation
├── Button.test.tsx        # Jest tests
└── index.ts              # Barrel export

src/stories/atoms/Button/
└── Button.stories.tsx     # Storybook story
```

## Workflow Types

### 1. Component Generation

**Input:**
```
"Create a button component with primary, secondary, and danger variants"
```

**Output:**
- Component files (TSX, types, tests, stories)
- Schema saved to `schemas/components/generated/`
- Component added to registry

### 2. Dashboard Generation

**Input:**
```
"Generate a dashboard for user analytics with charts and tables"
```

**Output:**
- Dashboard configuration
- Layout specification
- Widget definitions
- Data source mappings

### 3. Service Generation

**Input:**
```
"Create a service for managing user authentication"
```

**Output:**
- Service template
- API endpoint definitions
- Database integration
- Handler scaffolding

### 4. Custom Workflow

**Input:**
```
"Build a workflow for automated SEO optimization"
```

**Output:**
- Workflow definition (JSON)
- Task specifications
- Trigger configurations
- Execution plan

## Integration with Existing Systems

### DeepSeek Integration

The system integrates with DeepSeek AI for:
- Intent analysis
- Configuration generation
- Component code generation
- Smart suggestions

Configuration in `.env`:
```env
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

### Database Integration

Workflows and components are tracked in PostgreSQL:

```sql
-- Workflow history
CREATE TABLE agent_workflows (
  id UUID PRIMARY KEY,
  prompt TEXT NOT NULL,
  intent JSONB,
  config JSONB,
  results JSONB,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Component registry
CREATE TABLE agent_components (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  schema JSONB,
  generated BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP
);
```

### Blockchain Integration

For paid plans and service governance:
- Component usage tracking
- Service deployment contracts
- Revenue distribution
- Access control

## Advanced Features

### Fine-Tuning DeepSeek

Train DeepSeek on your specific component library:

```javascript
import { DeepSeekComponentFinetuningService } from './services/deepseek-component-finetuning-service.js';

const finetuner = new DeepSeekComponentFinetuningService();
await finetuner.initialize();

// Generate training data from existing components
await finetuner.generateTrainingDataFromStyleGuide(styleGuide);

// Fine-tune model
await finetuner.fineTuneModel(trainingData);
```

### Custom Schemas

Create custom component schemas:

```json
{
  "@context": "https://schema.org",
  "@type": "WebComponent",
  "@id": "lightdom:my-custom-component",
  "name": "MyCustomComponent",
  "description": "My custom component",
  "lightdom:componentType": "molecule",
  "lightdom:reactComponent": "MyCustomComponent",
  "lightdom:props": [
    // Your custom props
  ]
}
```

Save to `schemas/components/` and run:

```bash
node services/atomic-component-generator.js generate MyCustomComponent
```

### Workflow Automation

Chain multiple generations:

```javascript
const orchestrator = new AgentWorkflowOrchestrator();

// Generate component
const comp = await orchestrator.executeFromPrompt("Create a login form");

// Generate dashboard using that component
const dashboard = await orchestrator.executeFromPrompt(
  `Create a dashboard with the ${comp.result.componentName} component`
);

// Generate service to handle the form
const service = await orchestrator.executeFromPrompt(
  `Create an authentication service for the ${comp.result.componentName}`
);
```

## Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### Component Tests

```bash
npm run test:components
```

## Deployment

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start
```

### Docker

```bash
docker-compose up
```

## Troubleshooting

### Component Generation Fails

1. Check schema is valid JSON
2. Verify all required fields are present
3. Run with `--verbose` flag for detailed logs

### AI Features Not Working

1. Verify `DEEPSEEK_API_KEY` is set
2. Check API quota/limits
3. Try template-based generation (without `--ai`)

### Database Connection Issues

1. Verify database is running
2. Check connection string in `.env`
3. Run migrations: `npm run migrate`

## Contributing

See `CONTRIBUTING.md` for guidelines on:
- Adding new component schemas
- Creating workflow templates
- Extending the orchestrator
- Submitting PRs

## License

MIT License - See LICENSE file

## Related Documentation

- [AGENT_SYSTEM_README.md](./AGENT_SYSTEM_README.md) - Agent management system
- [ATOMIC_COMPONENT_SCHEMAS.md](./ATOMIC_COMPONENT_SCHEMAS.md) - Component schema guide
- [COMPREHENSIVE_SCHEMA_RESEARCH.md](./COMPREHENSIVE_SCHEMA_RESEARCH.md) - Schema research
- [DEEPSEEK_INTEGRATION_GUIDE.md](./DEEPSEEK_INTEGRATION_GUIDE.md) - DeepSeek setup

## Support

For questions or issues:
1. Check documentation
2. Review example code
3. Open an issue on GitHub
4. Contact the team

---

**Version:** 1.0.0  
**Last Updated:** November 5, 2024  
**Maintained by:** LightDom Development Team
