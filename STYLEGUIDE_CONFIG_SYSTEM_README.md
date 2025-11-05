# Styleguide Configuration System - Implementation Guide

## Overview

The Styleguide Configuration System provides a comprehensive framework for managing styleguides, workflows, campaigns, and headless containers with advanced features including:

- **Attribute Relationship Management** - Define and track relationships between attributes
- **Workflow Automation** - Create automated workflows for content and campaign management
- **SEO Campaign Optimization** - Automated SEO campaigns with bulk data mining and self-optimization
- **Headless Container Management** - Configure and manage Node.js headless API containers
- **Visual Component Builder** - Drag-and-drop interface for building components
- **Admin Menu Builder** - Visual admin menu configuration with drag-and-drop

## Architecture

### Core Components

1. **StyleguideConfigSystem** (`src/config/styleguide-config-system.ts`)
   - Central configuration management
   - Attribute relationship tracking
   - Simulation engine for optimization
   - Rich snippet schema generation

2. **StyleguideConfigManager** (`src/components/admin/StyleguideConfigManager.tsx`)
   - Admin UI for CRUD operations
   - Category, workflow, campaign, and container management
   - Real-time configuration updates

3. **AdminMenuBuilder** (`src/components/admin/AdminMenuBuilder.tsx`)
   - Drag-and-drop menu builder
   - Section and menu item management
   - Export/import configuration

4. **VisualComponentBuilder** (`src/components/admin/VisualComponentBuilder.tsx`)
   - Visual component creation
   - Property editor
   - Code and schema generation

5. **API Routes** (`src/api/routes/styleguide-config.routes.ts`)
   - RESTful API endpoints
   - Category, workflow, campaign, container CRUD
   - Simulation and optimization endpoints

## Features

### 1. Styleguide Categories

Create and manage styleguide categories with attributes:

```typescript
const category = styleguideConfigSystem.createCategory({
  name: 'Typography',
  description: 'Typography design tokens and components',
  attributes: [
    {
      id: 'font-family',
      name: 'Font Family',
      category: 'typography',
      value: 'Inter, sans-serif',
      importance: 8,
      relationships: {
        dependsOn: [],
        affects: ['heading', 'body-text'],
        exchangesWith: ['font-size', 'line-height'],
      },
      workflow: {
        automatable: true,
        simulationWeight: 0.9,
      },
      seo: {
        richSnippetRelevance: 6,
        searchAlgorithmImpact: 5,
      },
    },
  ],
  workflows: [],
  campaigns: [],
  importance: 8,
  relationships: {
    parentCategories: [],
    childCategories: ['headings', 'body'],
    relatedCategories: ['colors', 'spacing'],
  },
});
```

### 2. Workflow Configuration

Create workflows for content and campaign management:

```typescript
const workflow = styleguideConfigSystem.createWorkflow({
  name: 'Content Publishing Workflow',
  description: 'Automated content publishing with SEO optimization',
  categories: ['typography', 'colors', 'layout'],
  steps: [
    {
      id: 'step1',
      name: 'Extract Design Tokens',
      action: 'extract_tokens',
      config: { source: 'figma' },
      attributes: ['font-family', 'color-primary'],
    },
    {
      id: 'step2',
      name: 'Generate Components',
      action: 'generate_components',
      config: { framework: 'react' },
      attributes: [],
    },
  ],
  automation: {
    enabled: true,
    triggers: ['file_upload', 'api_call'],
    actions: ['extract', 'generate', 'publish'],
  },
  seo: {
    optimizationGoals: ['improve_readability', 'enhance_accessibility'],
    targetMetrics: { pageSpeed: 95, accessibility: 100 },
  },
});
```

### 3. SEO Campaigns

Create automated SEO campaigns with advanced features:

```typescript
const campaign = styleguideConfigSystem.createCampaign({
  name: 'E-commerce Product SEO Campaign',
  type: 'seo',
  workflows: [workflow.id],
  categories: ['products', 'reviews', 'ratings'],
  automation: {
    bulkDataMining: true,          // Mine bulk data for insights
    massDataSimulation: true,       // Run simulations at scale
    selfOptimization: true,         // Self-optimize based on results
    searchAlgorithmBeating: true,   // Actively improve search ranking
  },
  seo: {
    richSnippets: {
      autoGenerate: true,          // Auto-generate rich snippets
      schemas: ['Product', 'Review', 'AggregateRating'],
      selfEnriching: true,         // Self-enriching snippets
    },
    targetRanking: 3,              // Target top 3 ranking
    competitorTracking: true,      // Track competitors
    visualDataOptimization: true,  // 3D visual optimization
  },
  simulation: {
    enabled: true,
    lowCost: true,                 // Cost-optimized simulation
    highAccuracy: true,            // High accuracy results
    liveExchange: true,            // Live data exchange
    attributes: ['title', 'description', 'image'],
  },
});
```

### 4. Headless Container Configuration

Configure Node.js headless API containers:

```typescript
const container = styleguideConfigSystem.createHeadlessContainer({
  name: 'SEO Crawler Container',
  nodejs: {
    version: '20',
    runtime: 'node',
    apiPort: 3001,
    headlessMode: true,
  },
  categories: ['crawling', 'data-mining', 'seo'],
  startWindow: {
    enabled: true,
    width: 1920,
    height: 1080,
    visible: false,
  },
  electron: {
    enabled: true,
    testMode: true,
    mainProcess: 'electron/main-enhanced.cjs',
  },
});
```

### 5. Attribute Simulation

Run simulations to optimize attributes:

```typescript
const result = await styleguideConfigSystem.runAttributeSimulation(
  ['font-size', 'line-height', 'color-primary'],
  {
    iterations: 10000,
    costOptimized: true,
    highAccuracy: true,
    liveExchange: true,
  }
);

console.log('Optimized Values:', result.optimizedValues);
console.log('SEO Impact:', result.seoImpact);
console.log('Cost Efficiency:', result.costEfficiency);
console.log('Accuracy:', result.accuracy);
```

### 6. Rich Snippet Generation

Generate SEO-optimized rich snippets:

```typescript
const richSnippets = styleguideConfigSystem.generateRichSnippetSchema(campaign.id);

// Output:
{
  "@context": "https://schema.org",
  "@type": "Product",
  "schemas": [
    {
      "attributeId": "product-name",
      "schemaProperty": "name",
      "value": "Premium Widget",
      "importance": 10
    },
    {
      "attributeId": "product-price",
      "schemaProperty": "price",
      "value": "$99.99",
      "importance": 9
    }
  ]
}
```

## API Endpoints

### Categories

- `GET /api/styleguide-config/categories` - Get all categories
- `GET /api/styleguide-config/categories/:id` - Get category by ID
- `POST /api/styleguide-config/categories` - Create category

### Workflows

- `GET /api/styleguide-config/workflows` - Get all workflows
- `GET /api/styleguide-config/workflows/:id` - Get workflow by ID
- `POST /api/styleguide-config/workflows` - Create workflow

### Campaigns

- `GET /api/styleguide-config/campaigns` - Get all campaigns
- `GET /api/styleguide-config/campaigns/:id` - Get campaign by ID
- `POST /api/styleguide-config/campaigns` - Create campaign
- `GET /api/styleguide-config/campaigns/:id/rich-snippets` - Generate rich snippets

### Containers

- `GET /api/styleguide-config/containers` - Get all containers
- `GET /api/styleguide-config/containers/:id` - Get container by ID
- `POST /api/styleguide-config/containers` - Create container

### Advanced Features

- `GET /api/styleguide-config/attributes/:id/relationships` - Get attribute relationships
- `POST /api/styleguide-config/simulate` - Run simulation
- `GET /api/styleguide-config/export` - Export configuration
- `POST /api/styleguide-config/import` - Import configuration
- `GET /api/styleguide-config/health` - Health check

## Admin UI

### Accessing the Admin Interface

Navigate to these routes in your browser:

1. **Styleguide Config Manager**: `/admin/styleguide-config`
   - Manage categories, workflows, campaigns, containers
   - CRUD operations with visual interface

2. **Admin Menu Builder**: `/admin/menu-builder`
   - Drag-and-drop menu configuration
   - Section and item management
   - Export/import menu structure

3. **Visual Component Builder**: `/admin/component-builder`
   - Build components visually
   - Edit properties in real-time
   - Generate code and schemas

### Using the Admin Menu Builder

1. Click "Add Section" to create a new menu section
2. Select a section to view its menu items
3. Drag and drop items to reorder
4. Click "Add Menu Item" to add new items
5. Edit or delete items using the action buttons
6. Click "Export Config" to download the configuration

### Using the Visual Component Builder

1. Browse the component library on the left
2. Click a component to add it to the canvas
3. Select a component to edit its properties on the right
4. View generated code in the "Code" tab
5. View generated schema in the "Schema" tab
6. Click "Export" to save the configuration

## Integration with Existing Systems

### 1. Add API Routes to Express Server

Add to `api-server-express.js`:

```javascript
import styleguideConfigRoutes from './src/api/routes/styleguide-config.routes.js';

// In your route setup section:
app.use('/api/styleguide-config', styleguideConfigRoutes);
```

### 2. Use in React Components

```typescript
import { styleguideConfigSystem } from '@/config/styleguide-config-system';

// In your component:
const categories = styleguideConfigSystem.getAllCategories();
const workflows = styleguideConfigSystem.getAllWorkflows();
```

### 3. API Client Example

```javascript
// Fetch categories
const response = await fetch('/api/styleguide-config/categories');
const { data: categories } = await response.json();

// Create campaign
const campaign = await fetch('/api/styleguide-config/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Campaign',
    type: 'seo',
    workflows: [],
    categories: [],
    automation: {
      bulkDataMining: true,
      selfOptimization: true,
    },
    seo: {
      richSnippets: {
        autoGenerate: true,
        selfEnriching: true,
      },
      targetRanking: 5,
    },
    simulation: {
      enabled: true,
      lowCost: true,
      highAccuracy: true,
    },
  }),
});
```

## Best Practices

1. **Attribute Relationships**
   - Define clear dependencies between attributes
   - Set appropriate importance levels (1-10)
   - Use simulation weights to control optimization

2. **Workflow Automation**
   - Enable automation only when workflows are tested
   - Define clear triggers and actions
   - Monitor workflow execution

3. **SEO Campaigns**
   - Start with conservative target rankings
   - Enable competitor tracking for insights
   - Use visual data optimization for better results

4. **Headless Containers**
   - Use headless mode for production
   - Enable Electron for testing and debugging
   - Configure appropriate ports to avoid conflicts

5. **Simulations**
   - Use low-cost mode for rapid iteration
   - Enable high-accuracy for production decisions
   - Monitor simulation results and adjust weights

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure TypeScript paths are configured correctly
2. **API routes not working**: Check Express server configuration
3. **Drag-and-drop not working**: Ensure @dnd-kit packages are installed
4. **Component not rendering**: Check React Router configuration

### Debug Mode

Enable debug logging:

```javascript
// In your code:
localStorage.setItem('debug', 'styleguide-config:*');
```

## Future Enhancements

- [ ] Deep learning integration for attribute optimization
- [ ] Real-time collaboration on configurations
- [ ] Advanced visual data representation (3D graphs)
- [ ] Integration with external design tools (Figma, Sketch)
- [ ] AI-powered campaign recommendations
- [ ] Multi-tenant support for agencies
- [ ] Advanced A/B testing framework
- [ ] Blockchain-based configuration versioning

## Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check console logs for errors
- Test with simple configurations first

## License

Part of the LightDom Space Bridge Platform
