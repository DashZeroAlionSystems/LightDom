# LightDom Platform Services - Phase 1 & 2 Implementation

This document describes the newly implemented foundational services for the LightDom platform.

## Overview

The LightDom platform now includes a comprehensive suite of services that provide:

- **Database connectivity and migrations**
- **Schema-driven validation**
- **Research topic management (Wiki)**
- **Component library management**
- **AI-powered planning**
- **Dynamic GraphQL API gateway**
- **Competitive analysis**

## Services Implemented

### Phase 1: Foundation Services

#### 1. DatabaseService

Location: `src/services/DatabaseService.ts`

Manages PostgreSQL database connections and migrations.

**Features:**
- Connection pool management
- Migration runner
- Health checks
- Query helpers
- Transaction support

**Usage:**
```typescript
import { getDatabaseService } from './src/services/DatabaseService';

const db = getDatabaseService();
await db.initialize();
await db.runMigrations();

// Execute queries
const result = await db.query('SELECT * FROM content_entities');

// Run transactions
await db.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

**NPM Scripts:**
- `npm run migrate` - Run database migrations

#### 2. ValidationService

Location: `src/services/ValidationService.ts`

Provides schema-driven validation using Zod library.

**Features:**
- Dynamic Zod schema generation from ld-schema definitions
- Runtime type validation
- API middleware support
- Nested schema validation

**Usage:**
```typescript
import { validationService } from './src/services/ValidationService';

const schema = {
  $id: 'my-schema',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 }
  },
  required: ['name']
};

const result = validationService.validateWithLdSchema(data, schema);
if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

#### 3. WikiService

Location: `src/services/WikiService.ts`

Manages research topics and knowledge graphs.

**Features:**
- Load topic.json files from filesystem
- Persist topics to database
- Build knowledge graphs
- Search by tags
- Find related topics

**Usage:**
```typescript
import { wikiService } from './src/services/WikiService';

// Load all topics
await wikiService.loadTopics();

// Get all topics
const topics = await wikiService.getAllTopics();

// Search by tag
const validationTopics = await wikiService.searchByTag('validation');

// Build knowledge graph
const graph = await wikiService.buildKnowledgeGraph();
```

**Data Format:**
Place `.topic.json` files in `data/wiki/`:

```json
{
  "$id": "ld:ResearchTopic:my-topic",
  "type": "ld:ResearchTopic",
  "title": "My Research Topic",
  "description": "Description here",
  "tags": ["tag1", "tag2"],
  "content": {
    "summary": "Summary here",
    "keyPoints": ["Point 1", "Point 2"],
    "references": [],
    "relatedTopics": ["ld:ResearchTopic:other-topic"]
  },
  "metadata": {
    "author": "Author Name",
    "createdDate": "2025-11-02",
    "status": "active",
    "priority": "high"
  }
}
```

#### 4. ComponentLibraryService

Location: `src/services/ComponentLibraryService.ts`

Manages atomic component schemas.

**Features:**
- Store component schemas in database
- Load default atomic components
- Search by type, category, or tags
- Support for versioning and dependencies

**Usage:**
```typescript
import { componentLibraryService } from './src/services/ComponentLibraryService';

// Load default components
await componentLibraryService.loadDefaultComponents();

// Get all atomic components
const components = await componentLibraryService.getAtomicComponents();

// Get specific component
const button = await componentLibraryService.getSchema('ld:AtomicButton');

// Add custom component
await componentLibraryService.addSchema({
  schemaId: 'ld:MyComponent',
  schemaType: 'component',
  version: '1.0.0',
  title: 'My Component',
  schema: { /* ld-schema definition */ },
  isAtomic: true,
  category: 'ui'
});
```

#### 5. OllamaService (Extended)

Location: `src/services/ai/OllamaService.ts`

Added `logInteraction` method to log all AI interactions to database.

**New Feature:**
```typescript
import { ollamaService } from './src/services/ai/OllamaService';

const response = await ollamaService.chat('Hello, AI!');

// Interactions are automatically logged to ai_interactions table
await ollamaService.logInteraction(
  'Your prompt',
  response,
  {
    service: 'MyService',
    metadata: { /* custom data */ },
    durationMs: 1234
  }
);
```

### Phase 2: Advanced Workflow Services

#### 6. PlanningService

Location: `src/services/PlanningService.ts`

Generates AI-powered execution plans.

**Features:**
- Use OllamaService to generate detailed execution plans
- Validate plans against execution-plan-schema.json
- Store plans in database
- Track plan status

**Usage:**
```typescript
import { planningService } from './src/services/PlanningService';

// Generate a plan
const plan = await planningService.generatePlan('my-template', {
  projectName: 'My Project',
  targetDate: '2025-12-31'
});

// Get plan by ID
const retrieved = await planningService.getPlan(plan.planId);

// Update plan status
await planningService.updatePlanStatus(plan.planId, 'executing');
```

**Plan Structure:**
```typescript
interface ExecutionPlan {
  planId: string;
  templateId: string;
  title: string;
  description: string;
  steps: ExecutionPlanStep[];
  variables: Record<string, any>;
  status: 'draft' | 'ready' | 'executing' | 'completed' | 'failed';
}
```

#### 7. ApiGatewayService

Location: `src/services/ApiGatewayService.ts`

Dynamic GraphQL API gateway.

**Features:**
- Generate GraphQL schema from service definitions
- Register multiple services
- Execute GraphQL queries
- Auto-generate resolvers

**Usage:**
```typescript
import { apiGateway } from './src/services/ApiGatewayService';

// Execute GraphQL query
const result = await apiGateway.executeQuery(`
  query {
    wiki_getAllTopics {
      title
      description
      tags
    }
  }
`);

// With variables
const result2 = await apiGateway.executeQuery(`
  query GetTopic($id: String!) {
    wiki_getTopicById(id: $id) {
      title
      content
    }
  }
`, { id: 'topic-123' });
```

**Registered Services:**
- `wiki` - Research topics service
- `components` - Component library service

**Available Queries:**
```graphql
# Wiki Service
query {
  wiki_getAllTopics { title, description, tags }
  wiki_getTopicById(id: "topic-id") { title, content }
  wiki_searchByTag(tag: "validation") { title }
}

# Components Service
query {
  components_getAtomicComponents { schemaId, title, category }
  components_getSchemaById(schemaId: "ld:AtomicButton") { title, version }
}
```

#### 8. AnalysisService

Location: `src/services/AnalysisService.ts`

Competitive analysis and schema comparison.

**Features:**
- Compare schema coverage between datasets
- Generate competitor analysis reports
- Calculate coverage scores
- Provide recommendations

**Usage:**
```typescript
import { analysisService } from './src/services/AnalysisService';

// Parse crawled data
const ourNodes = analysisService.parseCrawledData(ourData, 'our');
const competitorNodes = analysisService.parseCrawledData(competitorData, 'competitor');

// Run analysis
const report = await analysisService.compareSchemaGoverage(
  ourNodes,
  competitorNodes,
  'Competitor Name'
);

console.log('Coverage Score:', report.results.coverageScore);
console.log('Missing in ours:', report.results.missingInOurs.length);
console.log('Recommendations:', report.recommendations);

// Retrieve reports
const allReports = await analysisService.getAllReports();
```

## Database Schema

### Tables Created

#### 1. content_entities
Stores all content types (research topics, execution plans, analysis reports).

```sql
- id (UUID)
- type (VARCHAR) - e.g., 'ld:ResearchTopic', 'ld:ExecutionPlan'
- title (VARCHAR)
- description (TEXT)
- content (JSONB)
- metadata (JSONB)
- tags (TEXT[])
- created_at, updated_at (TIMESTAMP)
```

#### 2. ai_interactions
Logs all AI model interactions.

```sql
- id (UUID)
- model (VARCHAR)
- prompt (TEXT)
- response (TEXT)
- context (JSONB)
- metadata (JSONB)
- service (VARCHAR)
- user_id, session_id (VARCHAR)
- duration_ms (INTEGER)
- success (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 3. schema_library
Stores component schemas.

```sql
- id (UUID)
- schema_id (VARCHAR) - unique
- schema_type (VARCHAR)
- version (VARCHAR)
- title (VARCHAR)
- schema (JSONB)
- examples (JSONB)
- dependencies (TEXT[])
- tags (TEXT[])
- category (VARCHAR)
- is_atomic (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

## Initialization

### Quick Start

1. **Set up environment variables** in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password
```

2. **Run migrations**:
```bash
npm run migrate
```

3. **Initialize services**:
```bash
npm run init:services
```

This will:
- Run database migrations
- Load research topics
- Load default component schemas
- Run sample analysis
- Verify all services

### Manual Initialization

```typescript
import { getDatabaseService } from './src/services/DatabaseService';
import { wikiService } from './src/services/WikiService';
import { componentLibraryService } from './src/services/ComponentLibraryService';

const db = getDatabaseService();
await db.initialize();
await db.runMigrations();

await wikiService.loadTopics();
await componentLibraryService.loadDefaultComponents();
```

## Testing

Run the test suite:

```bash
npm run test:unit
```

Test file: `tests/phase1-phase2-services.test.ts`

Tests cover:
- DatabaseService connectivity and migrations
- ValidationService schema generation and validation
- WikiService topic management
- ComponentLibraryService component storage
- PlanningService plan generation (requires Ollama)
- ApiGatewayService GraphQL queries
- AnalysisService competitor analysis

## Integration Points

### API Server Integration

Add to your Express server:

```typescript
import { apiGateway } from './src/services/ApiGatewayService';
import { graphqlHTTP } from 'express-graphql';

app.use('/graphql', graphqlHTTP({
  schema: apiGateway.buildSchema(),
  graphiql: true
}));
```

### Workflow Integration

```typescript
import { planningService } from './src/services/PlanningService';
import { validationService } from './src/services/ValidationService';

// In your workflow service
const plan = await planningService.generatePlan(templateId, variables);

// Validate workflow data
const result = validationService.validateWithLdSchema(data, schema);
if (!result.success) {
  throw new Error('Invalid workflow data');
}
```

## Next Steps

1. **Update UI** - Integrate PlanningService into data-mining-visualization dashboard
2. **Add more services** - Extend ApiGatewayService with more registered services
3. **Enhance analysis** - Add graphology or Neo4j for advanced graph analysis
4. **Unified dashboard** - Merge UI prototypes into single navigation

## Architecture Diagrams

```
┌─────────────────────────────────────────────────────────────┐
│                    LightDom Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ DatabaseSvc  │  │ValidationSvc │  │  WikiService │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌──────────────────────────────────────────────────┐    │
│  │           PostgreSQL Database                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐     │    │
│  │  │ content_ │ │   ai_    │ │   schema_    │     │    │
│  │  │ entities │ │interactions│ │   library   │     │    │
│  │  └──────────┘ └──────────┘ └──────────────┘     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ComponentLib  │  │ PlanningService│ │ AnalysisSvc  │    │
│  │   Service    │  │                │ │              │    │
│  └──────────────┘  └───────┬────────┘ └──────────────┘    │
│                             │                               │
│                             ▼                               │
│                    ┌──────────────┐                        │
│                    │OllamaService │                        │
│                    │   (AI/ML)    │                        │
│                    └──────────────┘                        │
│                                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │          ApiGatewayService (GraphQL)              │    │
│  │  Dynamically generates schema from services      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Support

For issues or questions:
- Check existing research topics in `data/wiki/`
- Review test examples in `tests/phase1-phase2-services.test.ts`
- See service source code in `src/services/`

## License

Part of the LightDom platform.
