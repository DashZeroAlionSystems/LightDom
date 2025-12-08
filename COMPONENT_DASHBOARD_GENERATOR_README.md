# Component Dashboard Generator

## Overview

The Component Dashboard Generator creates ready-to-use React dashboard components with full CRUD functionality. Components are generated from Storybook/styleguide templates with DeepSeek AI customization and schema-driven configuration.

## Features

### 🎨 **React Component Generation**
- Full CRUD dashboard components
- TypeScript + React + Ant Design
- Form validation and error handling
- Table with sorting, filtering, pagination
- Modal create/edit forms
- Delete confirmation dialogs

### 🔌 **CRUD API Generation**
- Express.js REST API routes
- PostgreSQL integration
- Full CRUD operations (Create, Read, ReadOne, Update, Delete)
- Query parameters (pagination, filtering, search)
- Error handling and validation

### 📖 **Storybook Integration**
- Auto-generated stories
- Multiple story variants (Default, WithData, Loading)
- Interactive controls
- Auto-documentation

### 🤖 **AI-Powered Schemas**
- DeepSeek generates schemas from natural language
- JSON Schema validation
- TypeScript interfaces
- Fallback templates

## Quick Start

### Run the Demo

```bash
# Generate all dashboard components
npm run demo:component-dashboard

# Or run directly
node demo-component-dashboard-generator.js
```

This will generate:
- 7 dashboard components
- 7 CRUD API routes
- 7 Storybook stories
- 7 JSON schemas

### Generated Components

1. **Workflow Management** - Manage automated workflows for SEO data mining
2. **Service Configuration** - Configure and manage microservices
3. **Component Templates** - Reusable component templates
4. **Data Attributes** - Define data attributes for SEO mining
5. **Campaign Management** - Orchestrate SEO campaigns
6. **Data Mining Jobs** - Configure and monitor data mining
7. **URL Seeding** - Manage URL seeds for web crawling

## Usage

### 1. Generate Components

```bash
npm run demo:component-dashboard
```

Output:
```
📦 src/components/generated/blockchain-optimization/
   ├── WorkflowManagementDashboard.tsx
   ├── ServiceConfigurationDashboard.tsx
   ├── ComponentTemplatesDashboard.tsx
   ├── DataAttributesDashboard.tsx
   ├── CampaignManagementDashboard.tsx
   ├── DataMiningJobsDashboard.tsx
   ├── URLSeedingDashboard.tsx
   └── index.ts

📦 api/generated/
   ├── workflow-management-routes.js
   ├── service-configuration-routes.js
   ├── component-templates-routes.js
   ├── data-attributes-routes.js
   ├── campaign-management-routes.js
   ├── data-mining-jobs-routes.js
   ├── url-seeding-routes.js
   └── index.js

📦 src/stories/generated/blockchain-optimization/
   ├── WorkflowManagement.stories.tsx
   ├── ServiceConfiguration.stories.tsx
   ├── ComponentTemplates.stories.tsx
   ├── DataAttributes.stories.tsx
   ├── CampaignManagement.stories.tsx
   ├── DataMiningJobs.stories.tsx
   └── URLSeeding.stories.tsx

📦 schemas/generated/
   ├── workflow-management-schema.json
   ├── service-configuration-schema.json
   ├── component-templates-schema.json
   ├── data-attributes-schema.json
   ├── campaign-management-schema.json
   ├── data-mining-jobs-schema.json
   └── url-seeding-schema.json
```

### 2. Register API Routes

Add to `api-server-express.js`:

```javascript
import { registerGeneratedRoutes } from './api/generated/index.js';

// In constructor or startup
registerGeneratedRoutes(this.app, this.db);
```

### 3. Use Components

```typescript
import { 
  WorkflowManagementDashboard,
  CampaignManagementDashboard,
  DataMiningJobsDashboard
} from './components/generated/blockchain-optimization';

export const DashboardPage = () => {
  return (
    <div>
      <WorkflowManagementDashboard />
      <CampaignManagementDashboard />
      <DataMiningJobsDashboard />
    </div>
  );
};
```

### 4. View in Storybook

```bash
npm run storybook
```

Navigate to `Dashboard/WorkflowManagement` to see the generated component.

## Component Structure

### React Component Features

Each generated component includes:

- **State Management** - useState for data, loading, modals
- **API Integration** - axios for HTTP requests
- **Table View** - Sortable, filterable, paginated table
- **CRUD Operations**:
  - Create: Modal form with validation
  - Read: Table with pagination and search
  - Update: Edit modal with pre-filled values
  - Delete: Confirmation dialog
- **Error Handling** - User-friendly error messages
- **Loading States** - Skeleton screens and spinners

### API Endpoint Features

Each generated API includes:

- **POST /** - Create new record
  - Request validation
  - UUID generation
  - Timestamp tracking
  - JSON response

- **GET /** - List all records
  - Pagination (page, limit)
  - Status filtering
  - Search (name, description)
  - Total count

- **GET /:id** - Get single record
  - 404 handling
  - Complete record data

- **PUT /:id** - Update record
  - Partial updates (COALESCE)
  - Timestamp update
  - 404 handling

- **DELETE /:id** - Delete record
  - Soft delete option
  - 404 handling
  - Return deleted data

## Customization with DeepSeek

### Schema Generation

The AI generator creates schemas based on your requirements:

```javascript
const prompt = `Generate a schema for a Workflow Management component.

Requirements:
- Manage automated workflows for SEO data mining
- Should include: workflow_type, schedule, tasks
- Must support CRUD operations
`;

const schema = await aiGenerator.generateConfig(prompt);
```

### Custom Fields

Add domain-specific fields:

```javascript
const feature = {
  name: 'Custom Feature',
  customFields: {
    custom_field: {
      type: 'string',
      enum: ['option1', 'option2'],
      description: 'Custom field description'
    }
  }
};
```

### Schema Validation

Schemas include:
- Type constraints
- Required fields
- Min/max lengths
- Enum values
- Format validation (email, uri, date-time, uuid)
- Pattern matching (regex)

## Integration Examples

### Workflow Management

```typescript
// Generated schema
{
  "workflow_type": {
    "type": "string",
    "enum": ["sequential", "parallel", "dag", "event-driven"]
  },
  "schedule": {
    "type": "object",
    "properties": {
      "enabled": { "type": "boolean" },
      "frequency": { "type": "string" },
      "next_run": { "type": "string", "format": "date-time" }
    }
  },
  "tasks": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "type": { "type": "string" },
        "config": { "type": "object" }
      }
    }
  }
}

// Generated API usage
POST /api/workflow-management
{
  "name": "SEO Crawler Workflow",
  "description": "Automated SEO data collection",
  "workflow_type": "sequential",
  "schedule": {
    "enabled": true,
    "frequency": "daily",
    "next_run": "2025-11-07T00:00:00Z"
  },
  "tasks": [
    {
      "name": "Fetch URLs",
      "type": "crawler",
      "config": { "depth": 3 }
    },
    {
      "name": "Extract Data",
      "type": "extractor",
      "config": { "attributes": ["title", "meta"] }
    }
  ]
}
```

### Data Mining Jobs

```typescript
// Generated component usage
<DataMiningJobsDashboard />

// API endpoints available
GET    /api/data-mining-jobs           // List all jobs
POST   /api/data-mining-jobs           // Create new job
GET    /api/data-mining-jobs/:id       // Get job details
PUT    /api/data-mining-jobs/:id       // Update job
DELETE /api/data-mining-jobs/:id       // Delete job

// Example create
{
  "name": "Blog Post Mining",
  "description": "Extract blog posts from tech sites",
  "seed_urls": ["https://techcrunch.com", "https://arstechnica.com"],
  "attributes": ["uuid-1", "uuid-2"],
  "crawl_depth": 3,
  "rate_limit": 1000,
  "status": "active"
}
```

## Database Tables

Each component requires a corresponding database table:

```sql
-- Example: workflow_managements table
CREATE TABLE workflow_managements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_workflow_managements_status ON workflow_managements(status);
CREATE INDEX idx_workflow_managements_created_at ON workflow_managements(created_at);
```

## Advanced Features

### DeepSeek Customization

Control component generation with DeepSeek:

```javascript
const customPrompt = `
Customize the Workflow Management component:
- Add visual workflow builder
- Include drag-and-drop task ordering
- Show real-time execution status
- Add workflow templates gallery
`;

// DeepSeek will enhance the schema and component code
```

### Multi-Entity CRUD

Generate related entities:

```javascript
const features = [
  {
    name: 'Campaign',
    relations: ['services', 'workflows', 'seeds']
  },
  {
    name: 'Service',
    belongsTo: 'campaign'
  }
];

// Generates foreign key relationships automatically
```

### Storybook Variants

Each component gets multiple stories:

- **Default** - Empty state
- **WithData** - Populated with sample data
- **Loading** - Loading skeleton
- **Error** - Error state handling
- **Empty** - No data state

## Best Practices

1. **Run Generation Once** - Components are templates, customize after generation
2. **Version Schemas** - Track schema versions for migrations
3. **Validate Input** - Use JSON schema validation in API
4. **Index Database** - Add indexes on frequently queried fields
5. **Handle Errors** - Show user-friendly error messages
6. **Test Components** - Use Storybook for visual testing
7. **Document APIs** - Auto-generate OpenAPI specs from schemas

## Troubleshooting

### DeepSeek Not Available

If DeepSeek/Ollama is not running, the system uses fallback templates:

```bash
⚠️  Using fallback schema for Workflow Management
```

Schemas still work, but won't have AI customization.

### Missing Dependencies

```bash
npm install axios uuid pg
```

### Database Connection Error

Ensure PostgreSQL is running and tables are created:

```bash
npm run db:health
npm run db:migrate
```

### Component Import Error

Make sure to rebuild TypeScript:

```bash
npm run build
```

## Related Documentation

- [Enhanced Startup System](ENHANCED_STARTUP_SYSTEM_README.md)
- [Blockchain Algorithm Optimization](BLOCKCHAIN_ALGORITHM_OPTIMIZATION_README.md)
- [Storybook Component Generator](services/storybook-component-generator-service.js)
- [DeepSeek Workflow CRUD](src/services/deepseek-workflow-crud-service.ts)

## Support

For issues or questions:
- Run demo: `npm run demo:component-dashboard`
- Check generated files in `./src/components/generated/`
- Review Storybook: `npm run storybook`
- Test APIs: `curl http://localhost:3001/api/workflow-management`
