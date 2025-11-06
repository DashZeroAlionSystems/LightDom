# Self-Generating Workflows with Setup/Settings Architecture

## Overview

This system enables **self-generating workflows** with **minimal user interaction** by clearly distinguishing between **Setup** (complete workflows) and **Settings** (individual attributes), and providing automated bundling from atoms to components to dashboards to workflows.

## Key Concepts

### 1. Settings vs Setup

**SETTINGS** = Individual component attributes
- Toggle buttons
- Dropdown lists
- Input fields
- Validation rules
- Default values
- Component options

**SETUP** = Complete workflow configurations
- Multi-step processes
- Full feature implementations
- Integrated dashboards
- Automated execution plans
- Reusable workflow templates

### 2. Bundling Hierarchy

```
Atoms (smallest units)
  ↓ bundle
Components (grouped atoms)
  ↓ bundle
Dashboards (grouped components)
  ↓ bundle
Workflows (grouped dashboards)
  ↓ saved as
Setups (reusable workflows)
```

### 3. Self-Generation Process

1. **Data Mining**: Automatically discover relevant database tables
2. **Schema Linking**: Analyze table relationships and structure
3. **Atom Generation**: Create atomic components from schema fields
4. **Component Bundling**: Group atoms into functional components
5. **Dashboard Assembly**: Arrange components into dashboards
6. **Workflow Creation**: Combine dashboards into executable workflows
7. **Configuration Storage**: Save as reusable setup for future use

## Architecture

### Configuration Manager

Manages the distinction between settings and setups:

```javascript
import ConfigurationManager from './services/configuration-manager.js';

const configManager = new ConfigurationManager();

// Save individual settings
await configManager.saveSetting('user-status-toggle', {
  componentType: 'toggle',
  label: 'User Status',
  defaultValue: true
});

// Save complete setup
await configManager.saveSetup('user-management-workflow', {
  components: [...],
  dashboards: [...],
  automation: { enabled: true }
});
```

### Workflow Generator

Creates self-generating workflows from simple prompts:

```javascript
import WorkflowGenerator from './services/workflow-generator.js';

const generator = new WorkflowGenerator();

// Generate workflow from prompt
const workflow = await generator.generateWorkflowFromPrompt(
  'Create user management workflow with settings'
);

// Result includes:
// - Atoms: 25 individual field components
// - Components: 3 bundled components
// - Dashboards: 1 complete dashboard
// - Settings: 25 reusable settings
// - Workflow: Complete executable workflow
```

## Usage Examples

### Example 1: Generate Workflow from Prompt

```javascript
const generator = new WorkflowGenerator();

// Simple prompt - system does the rest
const workflow = await generator.generateWorkflowFromPrompt(
  'Create SEO optimization workflow'
);

console.log(`Generated:
  - ${workflow.atoms.length} atoms
  - ${workflow.components.length} components
  - ${workflow.dashboards.length} dashboards
  - ${workflow.settings.length} settings
`);

// Execute with minimal interaction
const result = await generator.executeGeneratedWorkflow(
  workflow.name,
  {} // Empty object = use all defaults
);
```

### Example 2: Manual Bundling Process

```javascript
const configManager = new ConfigurationManager();

// Step 1: Create atoms
await configManager.saveAtom('user-name', {
  field: 'name',
  componentType: 'input',
  required: true
});

await configManager.saveAtom('user-email', {
  field: 'email',
  componentType: 'input',
  required: true
});

// Step 2: Bundle atoms into component
const component = await configManager.bundleAtomsToComponent(
  'user-form',
  ['user-name', 'user-email']
);

// Step 3: Bundle components into dashboard
const dashboard = await configManager.bundleComponentsToDashboard(
  'user-dashboard',
  [component]
);

// Step 4: Bundle dashboards into workflow
const workflow = await configManager.bundleDashboardsToWorkflow(
  'user-workflow',
  [dashboard],
  [{ type: 'manual' }],
  { minimalInteraction: true }
);
```

### Example 3: Self-Generating Workflow

```javascript
const configManager = new ConfigurationManager();

const workflow = await configManager.createSelfGeneratingWorkflow(
  { name: 'Auto Data Processing' },
  {
    dataMining: true,        // Auto-discover tables
    schemaLinking: true,     // Auto-analyze relationships
    autoPopulate: true,      // Auto-fill options
    minimalInteraction: true // Minimal user input required
  }
);

// Workflow automatically:
// - Scans database for relevant tables
// - Analyzes schema structure
// - Creates linked schemas
// - Generates components
// - Assembles dashboards
// - Populates default values
// - Validates configuration
```

### Example 4: Reusing Configurations

```javascript
const configManager = new ConfigurationManager();

// Load existing setting
const setting = await configManager.loadSetting('user-status-toggle');

// Apply to new component
await configManager.saveSetting('admin-status-toggle', {
  ...setting,
  label: 'Admin Status'
});

// Load existing setup
const setup = await configManager.loadSetup('user-workflow');

// Execute for different dataset
await generator.executeGeneratedWorkflow(
  setup.name,
  { /* custom inputs */ }
);
```

## API Endpoints

### Configuration Management

```bash
# Get configuration summary
GET /api/workflow-generator/config/summary

# List all settings
GET /api/workflow-generator/settings

# Get specific setting
GET /api/workflow-generator/settings/:name

# Save new setting
POST /api/workflow-generator/settings
{
  "name": "user-toggle",
  "componentType": "toggle",
  "label": "User Active"
}

# List all setups
GET /api/workflow-generator/setups

# Get specific setup
GET /api/workflow-generator/setups/:name

# Save new setup
POST /api/workflow-generator/setups
{
  "name": "my-workflow",
  "components": [...],
  "automation": { enabled: true }
}
```

### Workflow Generation

```bash
# Generate workflow from prompt
POST /api/workflow-generator/generate
{
  "prompt": "Create user management workflow"
}

# Execute workflow
POST /api/workflow-generator/execute/:name
{
  "table1": { "field1": "value1" },
  "table2": { "field2": "value2" }
}

# Get workflow config
GET /api/workflow-generator/config/:name

# Create self-generating workflow
POST /api/workflow-generator/self-generating
{
  "prompt": { "name": "Auto Workflow" },
  "options": {
    "dataMining": true,
    "schemaLinking": true,
    "autoPopulate": true,
    "minimalInteraction": true
  }
}
```

### Bundling

```bash
# Bundle atoms to component
POST /api/workflow-generator/bundle/component
{
  "name": "user-form",
  "atoms": ["user-name", "user-email"]
}

# Bundle components to dashboard
POST /api/workflow-generator/bundle/dashboard
{
  "name": "user-dashboard",
  "components": [...],
  "layout": { "columns": 12 }
}

# Bundle dashboards to workflow
POST /api/workflow-generator/bundle/workflow
{
  "name": "complete-workflow",
  "dashboards": [...],
  "triggers": [{ "type": "manual" }]
}
```

## npm Scripts

```bash
# Run workflow generator demo
npm run workflow:generate

# Generate workflow via API
npm run workflow:gen:api

# Get configuration summary
npm run workflow:config
```

## Benefits

### 1. Minimal User Interaction

User only provides:
- Initial prompt (e.g., "Create user workflow")
- Optional: Review generated configuration
- Optional: Custom input values

System automatically:
- Discovers relevant tables
- Analyzes schema relationships
- Generates all components
- Populates dropdown options
- Creates validation rules
- Assembles dashboards
- Builds executable workflows

### 2. Reusable Configurations

- **Settings** can be reused across multiple workflows
- **Atoms** can be bundled into different components
- **Components** can appear in multiple dashboards
- **Dashboards** can be included in various workflows
- **Setups** can be executed repeatedly with different data

### 3. Self-Documenting

Every configuration includes:
- Name and description
- Creation timestamp
- Reusability flag
- Component composition
- Usage examples

### 4. Automated Data Population

- Auto-discovers enum options
- Auto-populates foreign key dropdowns
- Auto-extracts distinct values for varchar fields
- Auto-generates validation rules from constraints
- Auto-sets default values from schema

## File Structure

```
config/workflow-configs/
├── settings/           # Individual attribute configs
│   ├── user-name.json
│   ├── user-email.json
│   └── user-status.json
├── setups/            # Complete workflow configs
│   ├── user-workflow.json
│   ├── seo-workflow.json
│   └── admin-workflow.json
└── atoms/             # Atomic component configs
    ├── user-name.json
    ├── user-email.json
    └── user-status.json

services/
├── configuration-manager.js      # Settings/Setup management
├── workflow-generator.js         # Self-generating workflows
└── workflow-generator-routes.js  # API endpoints
```

## Advanced Features

### Custom Generators

Extend the system to create custom generators:

```javascript
class CustomWorkflowGenerator extends WorkflowGenerator {
  async generateCustomWorkflow(params) {
    // Custom logic here
    const workflow = await this.generateWorkflowFromPrompt(params.prompt);
    
    // Add custom processing
    workflow.customField = params.customValue;
    
    return workflow;
  }
}
```

### Workflow Templates

Create reusable templates:

```javascript
const templates = {
  'user-management': {
    tables: ['users', 'roles', 'permissions'],
    automation: { enabled: true },
    validation: { strict: true }
  },
  'data-processing': {
    tables: ['data_sources', 'transformations'],
    automation: { enabled: true },
    minimalInteraction: true
  }
};

// Use template
const workflow = await generator.generateFromTemplate('user-management');
```

### Integration with Other Services

```javascript
// Integrate with schema linking
const schemaService = new SchemaLinkingService();
await schemaService.analyzeDatabaseSchema();

// Generate workflow using schema insights
const workflow = await generator.generateWorkflowFromPrompt(
  'Create workflow for discovered features'
);

// Combine with automation
await configManager.executeSelfGeneratingWorkflow(workflow);
```

## Best Practices

1. **Use Settings for Reusability**: Save common configurations as settings
2. **Use Setups for Complete Workflows**: Save full workflows as setups
3. **Leverage Auto-Population**: Let the system discover options automatically
4. **Minimal Prompts**: Keep prompts simple, let system infer details
5. **Review Before Execute**: Check generated config before execution
6. **Version Setups**: Include version numbers in setup names
7. **Document Custom Logic**: Add descriptions to custom configurations

## Troubleshooting

**No tables discovered:**
- Check database connection
- Ensure tables exist in schema
- Provide more specific prompt keywords

**Missing options:**
- Verify foreign key relationships exist
- Check enum types are defined
- Ensure tables have data for distinct values

**Validation errors:**
- Review generated validation rules
- Check database constraints
- Verify required fields are populated

## Future Enhancements

- [ ] AI-powered prompt understanding
- [ ] Visual workflow builder
- [ ] Real-time collaboration
- [ ] Workflow versioning and rollback
- [ ] Performance optimization
- [ ] Custom validation rules
- [ ] Workflow marketplace
- [ ] Template library
