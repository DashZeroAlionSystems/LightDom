# Reusable Node.js Container

Production-ready containerized Node.js environment for real-time scripting, CRUD operations, mass data enrichment, and LLM integration.

## Features

✅ **CRUD Operations** - Flexible entity management with JSON Schema validation
✅ **Relationship Indexing** - Graph-based relationship traversal
✅ **Real-Time Updates** - WebSocket and Server-Sent Events support
✅ **Background Processing** - Bull queue for mass enrichment
✅ **Secure Scripting** - VM2 sandbox for safe code execution
✅ **UI Generation** - Auto-generate forms from JSON Schema
✅ **LLM Ready** - Prepared for AI integration

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Using Docker (Recommended)

```bash
# Clone and navigate
cd container

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Initialize database
docker-compose exec app npm run db:migrate
```

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start PostgreSQL and Redis (Docker)
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## API Endpoints

### Health Check
```http
GET /health
```

### Entity Management

#### Create Entity
```http
POST /api/entities
Content-Type: application/json

{
  "entityType": "Product",
  "data": {
    "name": "Example Product",
    "price": 99.99
  },
  "metadata": {
    "tags": ["featured"]
  },
  "relationships": [
    {
      "targetEntityId": "category-123",
      "relationshipType": "belongs_to",
      "strength": 0.9
    }
  ]
}
```

#### Get Entity
```http
GET /api/entities/:id?include=relationships
```

#### Update Entity
```http
PUT /api/entities/:id
Content-Type: application/json

{
  "data": {
    "name": "Updated Product",
    "price": 89.99
  }
}
```

#### Query Entities
```http
GET /api/entities?entityType=Product&limit=50&offset=0
```

### Relationships

#### Create Relationship
```http
POST /api/relationships
Content-Type: application/json

{
  "sourceEntityId": "product-123",
  "targetEntityId": "category-456",
  "relationshipType": "belongs_to",
  "properties": {
    "primary": true
  },
  "strength": 0.95
}
```

#### Traverse Relationships
```http
GET /api/relationships/traverse/:entityId?relationshipType=belongs_to&depth=2
```

### Enrichment

#### Batch Enrich
```http
POST /api/enrich/batch
Content-Type: application/json

{
  "entityIds": ["entity-1", "entity-2", "entity-3"],
  "enrichmentType": "ai-enrich",
  "config": {
    "priority": 10
  }
}
```

#### Check Job Status
```http
GET /api/enrich/status/:jobId
```

### Scripting

#### Execute Script
```http
POST /api/script/execute
Content-Type: application/json

{
  "script": "return _.map(entities, e => e.data.name)",
  "context": {
    "entities": [
      { "data": { "name": "Product 1" } },
      { "data": { "name": "Product 2" } }
    ]
  }
}
```

### UI Generation

#### Generate Form
```http
POST /api/ui/generate-form
Content-Type: application/json

{
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "price": { "type": "number" }
    },
    "required": ["name"]
  }
}
```

### Real-Time Streaming

#### Server-Sent Events
```http
GET /api/stream/entities
```

```javascript
// Client-side
const eventSource = new EventSource('/api/stream/entities');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Entity update:', data);
};
```

#### WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  // Subscribe to updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'entities'
  }));

  // Execute script
  ws.send(JSON.stringify({
    type: 'execute',
    script: 'return 1 + 1',
    context: {}
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message:', data);
};
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         Fastify API Server (Port 3000)      │
│  ┌──────────┬──────────┬──────────────────┐ │
│  │  CRUD    │  Enrich  │  Scripting       │ │
│  │  Routes  │  Routes  │  Routes          │ │
│  └──────────┴──────────┴──────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌────▼────┐    ┌───▼────┐
│Entity │    │Relation │    │Enrich  │
│Service│    │Service  │    │Service │
└───┬───┘    └────┬────┘    └───┬────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │   + Prisma ORM  │
         └─────────────────┘

┌─────────────────────────────────────────────┐
│      Socket.IO Server (Port 3001)           │
│  ┌──────────────────────────────────────┐   │
│  │  Real-time Events & Streaming        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         Bull Queue + Redis                  │
│  ┌──────────────────────────────────────┐   │
│  │  Background Jobs & Enrichment        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Database Schema

See `prisma/schema.prisma` for complete schema.

### Key Models

- **Entity** - Flexible JSONB storage for any data type
- **Relationship** - Graph connections between entities
- **FunctionalityMapping** - Schema-driven handlers
- **EnrichmentQueue** - Background job tracking

## Services

### EntityService
- CRUD operations
- JSON Schema validation
- Event emission
- Versioning

### RelationshipService
- Relationship creation
- Graph traversal
- Centrality calculation
- In-memory graph caching

### EnrichmentService
- Background job queuing
- AI enrichment
- API integration
- Batch processing

### ScriptingEngine
- VM2 sandbox
- Secure execution
- Lodash & Ramda utilities
- Execution history

### UIGenerator
- Form generation from JSON Schema
- Auto UI Schema creation
- Table configuration
- Bulk edit support

## Environment Variables

See `.env.example` for all available options.

## Development

### Run Tests
```bash
npm test
```

### Database Commands
```bash
# Create migration
npx prisma migrate dev --name description

# Generate client
npm run db:generate

# Open Prisma Studio
npm run db:studio
```

### Logs
```bash
# Docker logs
docker-compose logs -f app

# Local logs (formatted with Pino Pretty)
npm run dev
```

## Integration Examples

### With LangChain (AI Enrichment)
```javascript
import { OpenAI } from 'langchain/llms/openai';

const enrichmentService = new EnrichmentService();

enrichmentService.queue.process('ai-enrich', async (job) => {
  const llm = new OpenAI();
  const entity = await prisma.entity.findUnique({ where: { id: job.data.entityId } });
  
  const summary = await llm.call(`Summarize: ${JSON.stringify(entity.data)}`);
  
  return { summary };
});
```

### With n8n Workflows
```javascript
import axios from 'axios';

// Trigger n8n workflow when entity created
entityService.on('created', async (entity) => {
  await axios.post(process.env.N8N_WEBHOOK_URL, {
    event: 'entity:created',
    data: entity
  });
});
```

## Production Deployment

### Docker Swarm
```bash
docker stack deploy -c docker-compose.yml lightdom
```

### Kubernetes
See `k8s/` directory for manifests (coming soon).

## Performance

- **Fastify**: 2-3x faster than Express
- **Pino**: Ultra-fast logging
- **Bull**: 1000s of jobs/second
- **Prisma**: Type-safe with query optimization
- **Redis**: In-memory caching

## Security

- ✅ VM2 sandbox for untrusted code
- ✅ JSON Schema validation
- ✅ Parameterized queries (SQL injection prevention)
- ✅ CORS protection
- ✅ Rate limiting ready
- ✅ Environment variable encryption

## Monitoring

- Health check endpoint
- Bull queue metrics
- Pino structured logging
- Ready for Prometheus/Grafana

## License

MIT

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Support

For issues and questions, please open a GitHub issue.
