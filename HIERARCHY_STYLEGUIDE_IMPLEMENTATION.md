# Component Hierarchy, Styleguide & Self-Generating Systems

## Overview

This implementation provides a comprehensive framework for managing component hierarchies, generating styleguides, creating self-generating components with Storybook, and managing reusable templates for long-running tasks.

## 🎯 Key Features

### 1. Component Hierarchy System

**File:** `src/services/hierarchy/ComponentHierarchyService.ts`

Manages hierarchical component organization using atomic design methodology (Atoms → Molecules → Organisms → Templates → Pages).

**Features:**
- ✅ Tree structure with parent-child relationships
- ✅ DFS and BFS traversal algorithms
- ✅ Composition path tracking (from atoms to pages)
- ✅ Visualization generation (Mermaid, JSON, D3)
- ✅ Hierarchy statistics and analytics
- ✅ Database persistence support

**Usage Example:**
```typescript
import { ComponentHierarchyService } from './services/hierarchy/ComponentHierarchyService';

const hierarchyService = new ComponentHierarchyService(database);

// Create hierarchy
const hierarchy = hierarchyService.createHierarchy('design-system', {
  id: 'root',
  name: 'DesignSystem',
  type: 'organism',
  level: 0,
  parent: null,
  children: [],
  metadata: {
    description: 'Root design system',
    tags: ['core'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

// Add component nodes
hierarchyService.addNode('design-system', {
  id: 'button-atom',
  name: 'Button',
  type: 'atom',
  level: 1,
  parent: 'root',
  children: [],
  metadata: {
    description: 'Basic button component',
    tags: ['interactive', 'form'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

// Generate visualization
const viz = hierarchyService.generateVisualization('design-system');
console.log(viz.mermaid); // Mermaid diagram
console.log(viz.json);    // JSON structure
```

### 2. Schema & Knowledge Graph Generator

**File:** `src/services/schema/SchemaKnowledgeGraphGenerator.ts`

Automatically generates CRUD APIs, service classes, database migrations, and knowledge graphs from schema definitions.

**Features:**
- ✅ Schema definition with relationships
- ✅ CRUD API endpoint generation
- ✅ TypeScript interface generation
- ✅ Database migration SQL generation
- ✅ Express route handler generation
- ✅ Service class generation
- ✅ Knowledge graph visualization
- ✅ Relationship tracking

**Usage Example:**
```typescript
import { SchemaKnowledgeGraphGenerator } from './services/schema/SchemaKnowledgeGraphGenerator';

const generator = new SchemaKnowledgeGraphGenerator();

// Define schema
generator.addSchema({
  name: 'User',
  tableName: 'users',
  description: 'User account',
  fields: [
    {
      name: 'email',
      type: 'string',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'string',
      required: true,
    },
  ],
  timestamps: true,
  softDelete: true,
});

// Generate files
const migration = generator.generateMigrationSQL('User');
const interface = generator.generateTypeScriptInterface('User');
const routes = generator.generateExpressRoute('User');
const service = generator.generateServiceClass('User');

// Generate knowledge graph
const graph = generator.getKnowledgeGraph();
const mermaid = generator.exportKnowledgeGraphAsMermaid();
```

### 3. Enhanced Storybook Generator

**File:** `src/services/storybook/EnhancedStorybookGenerator.ts`

Generates Storybook stories from component configurations with atomic design hierarchy support.

**Features:**
- ✅ Automatic story generation from schemas
- ✅ Atomic design level organization
- ✅ Component variant support
- ✅ TypeScript React components
- ✅ Props interface generation
- ✅ Interactive playground stories
- ✅ Auto-documentation

**Usage Example:**
```typescript
import { EnhancedStorybookGenerator } from './services/storybook/EnhancedStorybookGenerator';

const generator = new EnhancedStorybookGenerator();
await generator.initialize();

// Generate component and story
await generator.generateComponent({
  name: 'Card',
  props: {
    title: 'string',
    description: 'string',
    onClick: '() => void',
  },
});

await generator.generateStory({
  componentName: 'Card',
  componentPath: '../components/generated/Card',
  atomicLevel: 'molecule',
  props: {
    title: 'Default Card',
    description: 'This is a card component',
  },
  variants: [
    {
      name: 'WithAction',
      props: {
        title: 'Action Card',
        description: 'Card with action',
        onClick: () => alert('clicked'),
      },
    },
  ],
});
```

### 4. Task Template Documentation System

**File:** `src/services/templates/TaskTemplateDocumentationSystem.ts`

Breaks down long tasks into reusable template parts and provides comprehensive documentation.

**Features:**
- ✅ Template creation with variables
- ✅ Template part composition
- ✅ Variable validation and interpolation
- ✅ File generation from templates
- ✅ Task documentation with steps
- ✅ Template search and filtering
- ✅ Markdown export
- ✅ Database persistence

**Usage Example:**
```typescript
import { TaskTemplateDocumentationSystem } from './services/templates/TaskTemplateDocumentationSystem';

const templateSystem = new TaskTemplateDocumentationSystem();
await templateSystem.initialize();

// Create template
const template = await templateSystem.createTemplate({
  name: 'CRUD API Template',
  description: 'Generate complete CRUD API',
  category: 'api',
  parts: [
    {
      id: 'routes',
      name: '{{modelName}}-routes',
      type: 'code',
      order: 1,
      content: 'export const {{modelName}}Routes = ...',
    },
  ],
  variables: {
    modelName: {
      name: 'modelName',
      type: 'string',
      description: 'Name of the model',
      required: true,
    },
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['api', 'crud'],
    complexity: 'moderate',
    estimatedTime: '30 minutes',
  },
});

// Compose and generate files
const composition = await templateSystem.composeTemplate(template.id, {
  modelName: 'Product',
});

const files = await templateSystem.generateFilesFromTemplate(
  composition,
  './generated/api'
);
```

## 🗄️ Database Schema

**File:** `database/141-component-hierarchy-schema.sql`

Complete PostgreSQL schema for component hierarchies with:

- Component hierarchies table
- Component nodes with atomic levels
- Parent-child relationships
- Hierarchy statistics (auto-updated via triggers)
- Recursive queries for path finding
- GIN indexes for JSON fields
- Full-text search support

**Key Tables:**
- `component_hierarchies` - Hierarchy definitions
- `component_nodes` - Individual components
- `component_node_relationships` - Parent-child links
- `component_hierarchy_stats` - Cached statistics

**Functions:**
- `update_hierarchy_stats()` - Update statistics
- `get_component_path()` - Get composition path
- `get_child_components()` - Get all children

## 🔧 Enhanced Linting for DeepSeek

**File:** `.eslintrc.deepseek.cjs`

AI-optimized ESLint configuration with:

- Relaxed complexity limits (20 vs 10)
- Increased max-depth (6 vs 4)
- Increased max-lines (500 vs 300)
- Allow console.log for debugging
- Flexible TypeScript rules
- AI-friendly code patterns
- Auto-fix capabilities
- Security rules (critical only)

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
psql -U postgres -d lightdom -f database/141-component-hierarchy-schema.sql
```

### Basic Workflow

1. **Define Component Hierarchy:**
```typescript
const hierarchy = hierarchyService.createHierarchy('my-app', rootNode);
hierarchyService.addNode('my-app', buttonAtom, 'root');
hierarchyService.addNode('my-app', formMolecule, 'button-atom');
```

2. **Generate Schema and API:**
```typescript
generator.addSchema(userSchema);
const migration = generator.generateMigrationSQL('User');
const service = generator.generateServiceClass('User');
```

3. **Create Storybook Stories:**
```typescript
await storybookGen.generateStory({
  componentName: 'Button',
  atomicLevel: 'atom',
  props: { label: 'Click me' },
});
```

4. **Document Complex Tasks:**
```typescript
await templateSystem.documentTask({
  taskName: 'Setup Authentication',
  steps: [...],
  difficulty: 'medium',
});
```

## 📋 API Routes

All services can be exposed via Express routes:

```typescript
// Example API routes
app.get('/api/hierarchies/:name', async (req, res) => {
  const hierarchy = hierarchyService.getHierarchyTree(req.params.name);
  res.json(hierarchy);
});

app.post('/api/schemas', async (req, res) => {
  generator.addSchema(req.body);
  const crud = generator.generateCRUDSchema(req.body.name);
  res.json(crud);
});

app.post('/api/components/generate', async (req, res) => {
  const story = await storybookGen.generateStory(req.body);
  res.json(story);
});

app.get('/api/templates/search', async (req, res) => {
  const results = templateSystem.searchTemplates(req.query);
  res.json(results);
});
```

## 🏗️ Architecture

```
src/services/
├── hierarchy/
│   └── ComponentHierarchyService.ts    # Component tree management
├── schema/
│   └── SchemaKnowledgeGraphGenerator.ts # Schema & API generation
├── storybook/
│   └── EnhancedStorybookGenerator.ts   # Storybook story generation
└── templates/
    └── TaskTemplateDocumentationSystem.ts # Task templates

database/
└── 141-component-hierarchy-schema.sql   # PostgreSQL schema

.eslintrc.deepseek.cjs                   # AI-optimized linting
```

## 🎨 Design Patterns

### Atomic Design Hierarchy
- **Atoms:** Basic UI elements (Button, Input)
- **Molecules:** Simple component groups (Form Field)
- **Organisms:** Complex components (Navigation Bar)
- **Templates:** Page layouts
- **Pages:** Complete pages

### Schema-Driven Development
1. Define schema with fields and relationships
2. Generate TypeScript interfaces
3. Generate database migrations
4. Generate CRUD services
5. Generate API routes
6. Generate knowledge graph

### Template-Based Code Generation
1. Create template with variable placeholders
2. Define template parts (code, config, docs)
3. Compose with actual values
4. Generate multiple files
5. Save to database for reuse

## 🧪 Testing

```bash
# Run linting with DeepSeek config
npx eslint --config .eslintrc.deepseek.cjs src/

# Test hierarchy service
node -e "const { ComponentHierarchyService } = require('./src/services/hierarchy/ComponentHierarchyService'); const service = new ComponentHierarchyService(); console.log('✅ Hierarchy service loaded');"

# Generate Storybook
npm run storybook
```

## 📚 Documentation

All systems include comprehensive inline documentation with JSDoc comments. Generate API documentation with:

```bash
npm run docs:api:generate
```

## 🔐 Security

- Input validation on all template variables
- SQL injection prevention (parameterized queries)
- XSS protection in generated components
- Type safety with TypeScript
- ESLint security rules

## 🤝 Contributing

When adding new features:

1. Follow atomic design principles
2. Use TypeScript for type safety
3. Add comprehensive documentation
4. Include usage examples
5. Update knowledge graphs
6. Run linting with DeepSeek config

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Atomic Design by Brad Frost
- Storybook team
- Material Design guidelines
- DeepSeek AI optimization patterns
