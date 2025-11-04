# DeepSeek n8n Workflow System - Quick Start

This is a comprehensive AI-powered workflow system combining DeepSeek AI, n8n automation, and PostgreSQL for intelligent workflow orchestration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install pg uuid axios express dotenv
npm install --save-dev @types/pg @types/uuid @types/express
```

### 2. Set Up Database

```bash
# Create database
createdb lightdom

# Run schema migration
psql -U postgres -d lightdom -f database/deepseek-n8n-workflow-schema.sql
```

### 3. Configure Environment

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=your_password

# DeepSeek AI
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# n8n
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Application
API_URL=http://localhost:3001
NODE_ENV=development
```

### 4. Run Examples

```bash
node examples/deepseek-workflow-integration.js
```

## 📚 Key Features

✅ **AI-Powered Workflow Generation** - DeepSeek generates workflows from natural language
✅ **Prompt Template System** - Reusable prompts with variable interpolation
✅ **Schema Generation** - Auto-generate and link data schemas
✅ **Workflow Orchestration** - Sequential, parallel, and DAG execution
✅ **Long-Running Tasks** - Automatic polling for async operations
✅ **n8n Integration** - Seamless integration with n8n workflows
✅ **MCP Server** - Model Context Protocol for AI agent control
✅ **Workflow Templates** - 5 pre-built templates ready to use

## 📖 Documentation

- **Complete Guide**: [DEEPSEEK_N8N_COMPLETE_GUIDE.md](./DEEPSEEK_N8N_COMPLETE_GUIDE.md)
- **Database Schema**: [database/deepseek-n8n-workflow-schema.sql](./database/deepseek-n8n-workflow-schema.sql)
- **API Routes**: [src/api/routes/deepseek-workflow-api.routes.ts](./src/api/routes/deepseek-workflow-api.routes.ts)

## 🎯 Quick Examples

### Create a Workflow from Template

```bash
curl -X POST http://localhost:3001/api/templates/seo-crawler-analysis/instantiate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SEO Analysis",
    "tags": ["demo"]
  }'
```

### Execute a Workflow

```bash
curl -X POST http://localhost:3001/api/workflows/{workflow_id}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "executionMode": "manual",
    "triggerData": {
      "website": "https://example.com",
      "crawlDepth": 2
    }
  }'
```

### Check Status

```bash
curl http://localhost:3001/api/workflows/runs/{run_id}
```

## 🛠️ Available Templates

1. **SEO Crawler & Analysis** - Complete SEO pipeline with AI analysis
2. **Competitive Intelligence** - Parallel competitor monitoring
3. **Schema Generation** - Auto-generate database schemas
4. **ML Training** - Long-running data mining and model training
5. **Content Monitoring** - Event-driven change detection

## 🔌 API Endpoints

### Workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `POST /api/workflows/:id/execute` - Execute workflow
- `GET /api/workflows/runs/:runId` - Get execution status

### Templates
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template
- `POST /api/templates/:id/instantiate` - Create from template
- `GET /api/templates/search?q=seo` - Search templates

### Prompts
- `POST /api/prompts/templates` - Create prompt template
- `GET /api/prompts/templates` - List templates
- `GET /api/prompts/templates/:id` - Get template

### Schemas
- `POST /api/schemas` - Create schema
- `GET /api/schemas` - List schemas
- `POST /api/schemas/link` - Link schemas

See [DEEPSEEK_N8N_COMPLETE_GUIDE.md](./DEEPSEEK_N8N_COMPLETE_GUIDE.md) for complete API reference.

## 🧪 Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

## 📊 Monitoring

System health metrics are automatically tracked:

```bash
curl http://localhost:3001/api/system/health
```

Workflow metrics:

```bash
curl http://localhost:3001/api/workflows/{workflow_id}/metrics
```

## 🔧 Development

### Start API Server

```bash
npm run start:api
```

### Start n8n MCP Server

```bash
node src/mcp/n8n-mcp-integration-server.ts
```

### Enable Polling Service

The polling service automatically starts with the orchestrator and checks long-running tasks every 5 seconds.

## 🌟 Architecture

```
┌─────────────────────┐
│   API Layer         │
│  (Express Routes)   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Service Layer      │
│  • Orchestrator     │
│  • CRUD Service     │
│  • Template Service │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Data Layer         │
│  (PostgreSQL)       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  External Systems   │
│  • DeepSeek AI      │
│  • n8n Workflows    │
│  • MCP Server       │
└─────────────────────┘
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📝 License

MIT License - see [LICENSE](./LICENSE)

## 🆘 Support

- **Documentation**: [DEEPSEEK_N8N_COMPLETE_GUIDE.md](./DEEPSEEK_N8N_COMPLETE_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DashZeroAlionSystems/LightDom/discussions)

---

**Built with ❤️ for intelligent automation**
