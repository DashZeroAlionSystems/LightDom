# Design System - Quick Start Guide

## 🚀 Overview

The LightDom Design System is an AI-powered, schema-driven framework for creating reusable UI components, dashboards, and workflows. It follows Material Design 3 principles and atomic design methodology.

## ✨ Key Features

- **AI-Powered Generation**: Create components from natural language using DeepSeek R1
- **Schema-Driven**: All components defined by JSON schemas stored in PostgreSQL
- **Atomic Design**: Clear hierarchy from atoms → components → dashboards → workflows
- **Material Design 3**: Full compliance with Google's latest design system
- **Learning System**: Improves over time by learning from user edits
- **Type-Safe**: Full TypeScript coverage
- **Accessible**: WCAG 2.1 AA compliant

## 📦 Installation

### 1. Database Setup

Run the migration to create the required tables:

```bash
# Using PostgreSQL
psql -U postgres -d lightdom -f database/132-design-system-components.sql
```

Or through the application:

```bash
npm run db:migrate
```

### 2. Install Ollama (for AI Features)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull DeepSeek R1 model
ollama pull deepseek-r1

# Start Ollama server
ollama serve
```

### 3. Environment Variables

Add to your `.env` file:

```bash
# Ollama Configuration
VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=deepseek-r1:latest

# Database (if not already configured)
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
```

### 4. API Routes

Integrate the component schema routes in your Express server:

```javascript
// api-server-express.js or similar
import { initializeComponentSchemaRoutes } from './src/api/component-schema-routes.ts';

// After database pool is created
const componentSchemaRoutes = initializeComponentSchemaRoutes(pool);
app.use('/api/components', componentSchemaRoutes);
```

## 🎯 Quick Start

### Access the Showcase

Navigate to the Design System Showcase to explore all features:

```
http://localhost:3000/design-system-showcase
```

Or add the route to your `App.tsx`:

```tsx
import DesignSystemShowcase from '@/pages/DesignSystemShowcase';

<Route path="/design-system-showcase" element={<DesignSystemShowcase />} />
```

### Using Components Programmatically

#### 1. Schema Editor

```tsx
import { SchemaEditor, ComponentSchema } from '@/components/design-system';

const MyComponent = () => {
  const [schema, setSchema] = useState<ComponentSchema>({
    name: 'MyComponent',
    type: 'component',
    fields: []
  });

  return (
    <SchemaEditor
      schema={schema}
      onChange={setSchema}
      onSave={(schema) => console.log('Saved:', schema)}
    />
  );
};
```

#### 2. AI Component Generator

```tsx
import { PromptToComponent } from '@/components/design-system';

const MyGenerator = () => {
  return (
    <PromptToComponent
      onComplete={(schema) => {
        console.log('Generated:', schema);
        // Use the schema or save to database
      }}
    />
  );
};
```

#### 3. Workflow Wizard

```tsx
import { WorkflowWizard } from '@/components/design-system';

const MyWorkflow = () => {
  return (
    <WorkflowWizard
      onComplete={(campaign) => {
        console.log('Campaign:', campaign);
        // Deploy the workflow
      }}
    />
  );
};
```

## 📖 Documentation

- **Full Documentation**: [`docs/DESIGN_SYSTEM_IMPLEMENTATION.md`](../docs/DESIGN_SYSTEM_IMPLEMENTATION.md)
- **Wizard UX Research**: [`docs/research/WIZARD_UX_PATTERNS.md`](../docs/research/WIZARD_UX_PATTERNS.md)
- **API Reference**: [`src/api/component-schema-routes.ts`](../src/api/component-schema-routes.ts)
- **Database Schema**: [`database/132-design-system-components.sql`](../database/132-design-system-components.sql)

## 🎨 Component Hierarchy

```
┌─────────────────────────────────────┐
│          Workflows                  │  Campaign orchestration
│                                     │  Multiple dashboards
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Dashboards                  │  Complete layouts
│                                     │  Grid-based, responsive
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Components                   │  Composed elements
│                                     │  Forms, tables, charts
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│           Atoms                     │  Basic UI elements
│                                     │  Buttons, inputs, badges
└─────────────────────────────────────┘
```

## 💡 Example Workflows

### 1. Create a Component Manually

```tsx
// Define schema
const schema: ComponentSchema = {
  name: 'UserCard',
  type: 'component',
  description: 'User profile card',
  fields: [
    {
      id: '1',
      key: 'name',
      label: 'Name',
      type: 'string',
      required: true
    },
    {
      id: '2',
      key: 'email',
      label: 'Email',
      type: 'string',
      required: true
    }
  ]
};

// Save to database
await fetch('/api/components/schema', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ schema })
});
```

### 2. Generate Component with AI

```typescript
const prompt = `
Create a data table component for displaying users with:
- Columns: name, email, role, status
- Sortable columns
- Search functionality
- Pagination (10 items per page)
- Row selection
- Export to CSV button
`;

// Use PromptToComponent component or call API directly
const response = await fetch('/api/components/schema', {
  method: 'POST',
  body: JSON.stringify({
    prompt,
    model_name: 'deepseek-r1'
  })
});
```

### 3. Create Complete Workflow

```typescript
// Use WorkflowWizard component
<WorkflowWizard
  onComplete={async (campaign) => {
    // Campaign includes:
    // - atoms: [Button, Input, Card, ...]
    // - components: [UserForm, DataTable, ...]
    // - dashboards: [AdminDashboard, ClientDashboard, ...]
    // - tasks: [automation workflows]
    
    await deployWorkflow(campaign);
  }}
/>
```

## 🗄️ Database Schema

### Key Tables

- **`atom_definitions`**: Basic UI elements (buttons, inputs)
- **`component_definitions`**: Composed components
- **`dashboard_definitions`**: Complete layouts
- **`schema_fields`**: Dynamic field definitions
- **`schema_relationships`**: Links between schemas
- **`ai_component_generations`**: AI generation history
- **`component_training_data`**: ML training data

### Example Queries

```sql
-- Get all published components
SELECT * FROM component_definitions
WHERE is_published = true
ORDER BY usage_count DESC;

-- Get component with its atoms
SELECT 
  c.name AS component_name,
  a.name AS atom_name,
  ca.role
FROM component_definitions c
JOIN component_atoms ca ON ca.component_id = c.id
JOIN atom_definitions a ON a.id = ca.atom_id
WHERE c.id = 'component-uuid';

-- Get usage analytics
SELECT 
  type,
  COUNT(*) as count,
  AVG(usage_count) as avg_usage
FROM component_definitions
GROUP BY type;
```

## 🔧 API Endpoints

### Components

```bash
# List all components
GET /api/components/schema?type=component&published_only=true

# Get specific component
GET /api/components/schema/:id

# Create component
POST /api/components/schema
Body: { schema, prompt?, userEdits?, accepted? }

# Update component
PUT /api/components/schema/:id
Body: { name?, description?, schema?, is_published? }
```

### Atoms

```bash
# List atoms
GET /api/components/atoms?category=action&tags=button

# Create atom
POST /api/components/atoms
Body: { name, category, schema, design_tokens, props }
```

### Dashboards

```bash
# List dashboards
GET /api/components/dashboards?domain=admin

# Get dashboard with components
GET /api/components/dashboards/:id
```

### Analytics

```bash
# Get usage analytics
GET /api/components/analytics

# Get training data
GET /api/components/training-data?category=attribute_mapping
```

## 🎓 Best Practices

### Component Design

1. **Single Responsibility**: Each component should do one thing well
2. **Composition Over Inheritance**: Build complex components from simpler ones
3. **Material Design 3**: Follow MD3 guidelines for consistency
4. **Accessibility**: Include ARIA labels, keyboard navigation, focus indicators
5. **Versioning**: Use semantic versioning for components

### Schema Creation

1. **Descriptive Names**: Use clear, descriptive field names
2. **Helpful Descriptions**: Include descriptions for all fields
3. **Validation Rules**: Set appropriate validation rules
4. **Logical Grouping**: Group related fields together
5. **Sensible Defaults**: Provide good default values

### AI Prompts

1. **Be Specific**: Include exact requirements
2. **Field Types**: Mention data types explicitly
3. **Styling**: Describe visual preferences
4. **Behavior**: Explain interactions and workflows
5. **Context**: Reference existing components when relevant

## 🐛 Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama
ollama serve
```

### Database Connection

```bash
# Test database connection
npm run db:health

# Run migrations
npm run db:migrate
```

### Component Not Rendering

1. Check console for errors
2. Verify schema validation
3. Ensure all required fields are present
4. Check Material Design 3 tokens are loaded

## 📚 Additional Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Ollama Documentation](https://ollama.ai/docs)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

## 🤝 Contributing

When adding new components:

1. Follow Material Design 3 specifications
2. Use TypeScript with strict types
3. Include accessibility features
4. Write comprehensive descriptions
5. Add usage examples
6. Update documentation

## 📄 License

Part of the LightDom platform. See LICENSE file for details.

---

**Built with ❤️ using Material Design 3, React, TypeScript, and AI**

## 🚀 Next Steps

1. **Explore the Showcase**: Visit `/design-system-showcase` to see all features
2. **Try the Schema Editor**: Create your first component schema
3. **Generate with AI**: Use natural language to create components
4. **Build a Workflow**: Create a complete campaign with the wizard
5. **Read the Docs**: Deep dive into the full documentation

Need help? Check the full documentation or open an issue on GitHub.
