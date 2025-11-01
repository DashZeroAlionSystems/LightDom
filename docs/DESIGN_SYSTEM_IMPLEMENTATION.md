# Design System Architecture and Implementation Guide

## Overview

This document provides a comprehensive guide to the LightDom Design System, which implements a schema-driven approach to creating reusable dashboard components and workflows using AI-powered generation.

## Architecture

### Component Hierarchy

The design system follows atomic design principles with a clear hierarchy:

```
Atoms → Molecules/Components → Organisms → Templates → Dashboards → Workflows
```

#### 1. **Atoms** (Basic UI Elements)
- Smallest building blocks (buttons, inputs, icons, badges)
- Self-contained with design tokens
- Reusable across all components
- Examples: Button, Input, Card, Avatar, Badge

#### 2. **Components** (Composed Elements)
- Built from multiple atoms
- Specific functionality or purpose
- Configurable through schema
- Examples: Form fields, data tables, charts, search bars

#### 3. **Dashboards** (Complete Layouts)
- Composed of multiple components
- Grid-based layouts
- Domain-specific (admin, client, analytics)
- Responsive and customizable

#### 4. **Workflows** (Orchestrated Processes)
- Multiple dashboards linked together
- Task automation and orchestration
- Data flow between components
- Campaign management

## Database Schema

### Core Tables

#### `atom_definitions`
Stores atomic UI elements with design tokens and metadata.

```sql
CREATE TABLE atom_definitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- button, input, icon, typography, etc.
  description TEXT,
  schema JSONB DEFAULT '{}'::jsonb,
  design_tokens JSONB DEFAULT '{}'::jsonb,  -- Colors, spacing, typography
  props JSONB DEFAULT '[]'::jsonb,          -- Component props
  a11y_metadata JSONB DEFAULT '{}'::jsonb, -- Accessibility info
  tags TEXT[],
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `component_definitions`
Stores component schemas built from atoms.

```sql
CREATE TABLE component_definitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type component_type NOT NULL,  -- atom, molecule, organism, template, page
  variant TEXT DEFAULT 'default',
  description TEXT,
  schema JSONB DEFAULT '{}'::jsonb,
  props_schema JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  version TEXT DEFAULT '1.0.0'
);
```

See `database/132-design-system-components.sql` for complete schema.

## Component Usage

### 1. Schema Editor

Visual editor for creating and modifying component schemas.

```tsx
import { SchemaEditor, ComponentSchema } from '@/components/design-system';

const MyEditor = () => {
  const [schema, setSchema] = useState<ComponentSchema>({
    name: 'UserCard',
    type: 'component',
    description: 'User profile card component',
    fields: [
      {
        id: '1',
        key: 'name',
        label: 'User Name',
        type: 'string',
        required: true
      },
      {
        id: '2',
        key: 'email',
        label: 'Email',
        type: 'string',
        validations: [{ type: 'email' }]
      }
    ]
  });

  return (
    <SchemaEditor
      schema={schema}
      onChange={setSchema}
      mode="visual"
      onSave={(savedSchema) => console.log('Saved:', savedSchema)}
    />
  );
};
```

**Features:**
- Visual and code editing modes
- Drag & drop field ordering
- 12 field types supported
- Validation rule configuration
- Real-time validation
- Export to JSON

### 2. Prompt-to-Component Generator

AI-powered component generation from natural language.

```tsx
import { PromptToComponent } from '@/components/design-system';

const MyGenerator = () => {
  return (
    <PromptToComponent
      onComplete={(schema) => {
        console.log('Generated schema:', schema);
        // Save to database or use directly
      }}
      onCancel={() => router.back()}
    />
  );
};
```

**Workflow:**
1. **Describe Component**: Enter natural language description
2. **AI Generation**: DeepSeek R1 generates schema
3. **Review & Edit**: Visual schema editor
4. **Preview**: See component structure
5. **Save**: Add to component library

**Example Prompts:**
```
"Create a user profile card with avatar, name, email, bio, and social links. 
Include a status badge showing online/offline state. Use Material Design styling."

"Build a data table component with sortable columns, pagination, search, and 
row selection. Include export to CSV functionality."

"Design a multi-step form wizard for user onboarding with progress indicator,
validation, and auto-save functionality."
```

### 3. Workflow Wizard

Complete workflow creation with AI-generated schemas.

```tsx
import { WorkflowWizard, WorkflowCampaign } from '@/components/design-system';

const MyWorkflow = () => {
  return (
    <WorkflowWizard
      onComplete={(campaign: WorkflowCampaign) => {
        console.log('Campaign created:', campaign);
        // Deploy workflow
      }}
    />
  );
};
```

**Workflow Steps:**
1. **Campaign Setup**: Define goals and requirements
2. **Generate**: AI creates atoms, components, dashboards
3. **Review Schemas**: Edit generated schemas
4. **Configure Settings**: Admin and client settings
5. **Preview & Launch**: Deploy campaign

## AI Integration

### Ollama DeepSeek R1

The system uses Ollama with DeepSeek R1 model for component generation.

**Configuration:**
```bash
# .env
VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=deepseek-r1:latest
```

**Setup Ollama:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull DeepSeek R1 model
ollama pull deepseek-r1

# Start Ollama server
ollama serve
```

## API Routes

See `src/api/component-schema-routes.ts` for complete API documentation.

**Key Endpoints:**
- `GET /api/components/atoms` - List atoms
- `POST /api/components/atoms` - Create atom
- `GET /api/components/schema` - List components
- `POST /api/components/schema` - Create component (with AI tracking)
- `GET /api/components/dashboards` - List dashboards
- `GET /api/components/analytics` - Usage analytics
- `GET /api/components/training-data` - AI training data

## Best Practices

### 1. Component Design
- Keep components focused and single-purpose
- Use composition over inheritance
- Follow Material Design 3 guidelines
- Include accessibility metadata
- Version components properly

### 2. Schema Creation
- Use descriptive field names
- Include helpful descriptions
- Set appropriate validation rules
- Group related fields logically
- Provide sensible defaults

### 3. AI Prompts
- Be specific about requirements
- Include field types and validation
- Mention styling preferences
- Describe behavior and interactions
- Reference existing components when relevant

### 4. Workflow Design
- Start with clear campaign goals
- Define data sources and metrics
- Plan component reusability
- Consider admin vs client access
- Test automation thresholds

## Resources

- [Wizard UX Patterns Research](../research/WIZARD_UX_PATTERNS.md)
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Ollama Documentation](https://ollama.ai/docs)

---

**Built with ❤️ using Material Design 3, React, TypeScript, and AI**
