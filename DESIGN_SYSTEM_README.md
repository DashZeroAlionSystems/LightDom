# LightDom Design System & Workflow Mining

## Quick Start

### 1. Mine Design Patterns

```bash
# Mine components and workflows from popular libraries
npm run design-system:mine
```

This will generate:
- Component patterns from 8+ UI libraries
- Workflow patterns from n8n templates
- Neural network training datasets
- Comprehensive mining reports

### 2. Setup n8n Workflow Engine

```bash
# Run setup script
npm run n8n:setup

# Start n8n Docker container
npm run n8n:start

# Access n8n UI
open http://localhost:5678
```

Default credentials:
- Username: `admin`
- Password: `lightdom_n8n_password`

### 3. Import Workflow Templates

1. Open n8n UI (http://localhost:5678)
2. Navigate to **Workflows** → **Import from File**
3. Import templates from:
   - `workflows/n8n/templates/dom-optimization-workflow.json`
   - `workflows/n8n/templates/data-sync-workflow.json`

### 4. Test the Integration

```bash
# Test DOM optimization webhook
curl -X POST http://localhost:5678/webhook/dom-optimize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# View n8n logs
npm run n8n:logs
```

## What Gets Generated?

### Component Data
```
data/design-system/
├── components/
│   ├── all-components.json          # All mined components
│   ├── atom-components.json         # Basic building blocks
│   ├── molecule-components.json     # Component combinations
│   └── organism-components.json     # Complex components
├── schemas/
│   └── all-schemas.json             # Component schemas
└── training-data/
    └── neural-network-training-data.json  # ML training data
```

### Workflow Data
```
data/workflow-patterns/
├── workflows/
│   ├── all-workflows.json
│   ├── automation-workflows.json
│   ├── data-synchronization-workflows.json
│   └── [10+ workflow categories]
├── schemas/
│   └── all-workflow-schemas.json
└── training-data/
    └── neural-network-training-data.json
```

### Training Datasets
```
data/neural-network-training/
├── comprehensive-training-data.json       # Complete dataset
├── component-generation-task.json         # Component generation
├── workflow-generation-task.json          # Workflow generation
└── component-composition-task.json        # Component composition
```

## Component Mining

### Libraries Mined
1. **Bootstrap** - Most popular CSS framework
2. **Material-UI** - React Material Design
3. **Ant Design** - Enterprise UI design
4. **Chakra UI** - Accessible components
5. **Tailwind UI** - Utility-first components
6. **Shadcn UI** - Re-usable components
7. **Radix UI** - Unstyled primitives
8. **Headless UI** - Accessible components

### Atomic Design Levels
- **Atoms**: Button, Input, Icon, Label, Badge
- **Molecules**: FormField, Card, SearchBar, NavigationItem
- **Organisms**: Form, Table, Navigation, Modal
- **Templates**: Page layouts (future)
- **Pages**: Complete interfaces (future)

### Component Schema Example

```json
{
  "id": "Material-UI-button-1234",
  "name": "Button",
  "category": "action",
  "atomicLevel": "atom",
  "library": "Material-UI",
  "html": "<button class='btn'>Click me</button>",
  "css": ".btn { padding: 0.5rem 1rem; }",
  "props": {
    "variant": ["primary", "secondary", "success"],
    "size": ["sm", "md", "lg"],
    "disabled": "boolean"
  },
  "variants": ["solid", "outline", "ghost"],
  "dependencies": [],
  "accessibility": {
    "ariaLabels": ["aria-label", "aria-pressed"],
    "keyboardNavigation": true,
    "screenReaderSupport": true
  },
  "schema": {
    "type": "button",
    "properties": {...},
    "composability": {
      "canContain": ["icon", "text", "badge"],
      "mustContain": [],
      "optionalContain": ["icon", "badge"]
    }
  }
}
```

## Workflow Mining

### Workflow Categories
1. **Data Synchronization** - Database syncs, API integrations
2. **Automation** - Task automation, process optimization
3. **Integration** - Service connections, data flow
4. **Notification** - Multi-channel alerts, messaging
5. **Data Processing** - Transformation, aggregation
6. **Monitoring** - Health checks, performance tracking
7. **Deployment** - CI/CD, infrastructure automation
8. **Content Management** - Publishing, distribution
9. **Customer Support** - Ticket management
10. **Marketing** - Campaign automation, lead scoring

### Workflow Template Example

The **DOM Optimization Workflow** includes:
1. **Webhook Trigger** - Receives URL to optimize
2. **Validate Input** - Checks URL validity
3. **Crawl Website** - Fetches webpage content
4. **Optimize DOM** - Analyzes and optimizes structure
5. **Record on Blockchain** - Stores optimization proof
6. **Send Notification** - Alerts about completion

### Workflow Schema Example

```json
{
  "id": "dom-optimization-template",
  "name": "DOM Optimization Workflow",
  "category": "automation",
  "complexity": "moderate",
  "nodes": [...],
  "connections": [...],
  "schema": {
    "type": "workflow",
    "trigger": {
      "type": "Webhook",
      "config": { "path": "dom-optimize" }
    },
    "steps": [
      { "type": "Function", "action": "Validate Input" },
      { "type": "HTTP Request", "action": "Crawl URL" },
      { "type": "Function", "action": "Optimize DOM" },
      { "type": "HTTP Request", "action": "Record on Blockchain" }
    ],
    "errorHandling": {
      "strategy": "continue-on-fail",
      "retries": 3
    }
  }
}
```

## Neural Network Training

### Training Data Structure

```json
{
  "metadata": {
    "version": "1.0.0",
    "generatedAt": "2025-11-01T...",
    "totalSamples": 200
  },
  "components": {
    "metadata": {...},
    "samples": [...],
    "combinations": [...]
  },
  "workflows": {
    "metadata": {...},
    "samples": [...],
    "patterns": [...]
  },
  "trainingConfig": {
    "modelArchitecture": {
      "type": "transformer",
      "layers": 12,
      "hiddenSize": 768,
      "attentionHeads": 12
    },
    "hyperparameters": {
      "learningRate": 0.0001,
      "batchSize": 32,
      "epochs": 100
    }
  }
}
```

### Task-Specific Datasets

1. **Component Generation**
   ```json
   {
     "input": "Generate a login form with email and password",
     "output": {
       "html": "...",
       "css": "...",
       "schema": {...}
     }
   }
   ```

2. **Workflow Generation**
   ```json
   {
     "input": "Create a data sync workflow from PostgreSQL to external API",
     "output": {
       "nodes": [...],
       "connections": [...],
       "schema": {...}
     }
   }
   ```

3. **Component Composition**
   ```json
   {
     "input": "Compose a FormField using Label and Input atoms",
     "output": {
       "schema": {...}
     }
   }
   ```

## n8n Integration

### Docker Configuration

The `docker-compose.yml` includes:

```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678"
  environment:
    DB_TYPE: postgresdb
    N8N_BASIC_AUTH_ACTIVE: true
    LIGHTDOM_API_URL: http://app:3001
  volumes:
    - n8n_data:/home/node/.n8n
    - ./workflows/n8n:/home/node/.n8n/workflows
```

### API Endpoints

```typescript
// List all workflows
GET /api/n8n/workflows

// Get workflow by ID
GET /api/n8n/workflows/:id

// Execute workflow
POST /api/n8n/workflows/:id/execute

// Trigger webhook
POST /api/n8n/webhooks/:path

// Get executions
GET /api/n8n/executions
```

### Environment Variables

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key
N8N_PASSWORD=lightdom_n8n_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=lightdom_user
DB_PASSWORD=lightdom_password
```

## Available Scripts

### Mining
```bash
npm run design-system:mine    # Mine components and workflows
npm run workflow:mine          # Alias for design-system:mine
```

### n8n Management
```bash
npm run n8n:setup             # Setup n8n integration
npm run n8n:start             # Start n8n container
npm run n8n:stop              # Stop n8n container
npm run n8n:logs              # View n8n logs
```

### Development
```bash
npm run dev                   # Start development server
npm run build                 # Build production bundle
npm run test                  # Run tests
```

## Project Structure

```
LightDom/
├── src/
│   ├── design-system/
│   │   ├── ComponentMiningService.ts    # Component mining logic
│   │   └── N8nWorkflowMiningService.ts  # Workflow mining logic
│   ├── api/
│   │   └── n8n-routes.ts                # n8n API endpoints
│   └── ...
├── scripts/
│   ├── mine-design-system.ts            # Mining CLI
│   └── setup-n8n-integration.js         # n8n setup
├── workflows/
│   └── n8n/
│       ├── templates/                   # Workflow templates
│       └── credentials/                 # Credential templates
├── data/
│   ├── design-system/                   # Component data
│   ├── workflow-patterns/               # Workflow data
│   ├── neural-network-training/         # Training datasets
│   ├── MINING_REPORT.json              # Mining report
│   └── MINING_REPORT.md                # Mining report (markdown)
├── docs/
│   └── DESIGN_SYSTEM_N8N_INTEGRATION.md # Full documentation
└── docker-compose.yml                   # Includes n8n service
```

## Use Cases

### 1. Component Generation
```bash
# Mine component patterns
npm run design-system:mine

# Train model
npm run train:model --data ./data/neural-network-training/component-generation-task.json

# Generate component
npm run generate:component --prompt "Create a modern login form"
```

### 2. Workflow Automation
```bash
# Setup n8n
npm run n8n:setup
npm run n8n:start

# Import templates
# (via n8n UI)

# Trigger workflow
curl -X POST http://localhost:5678/webhook/dom-optimize \
  -d '{"url": "https://example.com"}'
```

### 3. Design System Extension
```bash
# Mine additional libraries
# Edit ComponentMiningService.ts to add new libraries

# Re-run mining
npm run design-system:mine

# Review generated data
cat data/MINING_REPORT.md
```

## Troubleshooting

### n8n Won't Start
```bash
# Check Docker status
docker ps

# View logs
npm run n8n:logs

# Restart container
npm run n8n:stop
npm run n8n:start
```

### Mining Fails
```bash
# Check permissions
ls -la data/

# Create directories manually
mkdir -p data/design-system data/workflow-patterns

# Re-run mining
npm run design-system:mine
```

### Workflow Execution Fails
1. Check n8n credentials in UI
2. Verify PostgreSQL is running
3. Check API endpoints are accessible
4. Review execution logs in n8n UI

## Next Steps

1. **Review Generated Data**
   ```bash
   cat data/MINING_REPORT.md
   ```

2. **Train Neural Network**
   ```bash
   # Use your preferred ML framework
   python train.py --data data/neural-network-training/comprehensive-training-data.json
   ```

3. **Create Custom Workflows**
   - Design in n8n UI
   - Export as JSON
   - Save to `workflows/n8n/templates/`

4. **Extend Component Mining**
   - Add new libraries to `ComponentMiningService.ts`
   - Re-run mining
   - Review updated datasets

## Resources

- [Full Documentation](./docs/DESIGN_SYSTEM_N8N_INTEGRATION.md)
- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

## Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check `docs/` directory
- **Mining Reports**: Review `data/MINING_REPORT.md`

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2025-11-01
