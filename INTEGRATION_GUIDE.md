# Complete Integration Guide - DeepSeek Campaign Management System

## 🎯 Quick Start (5 Minutes)

### Prerequisites Check
```bash
# 1. Check Node.js (v18+)
node --version

# 2. Check Docker & Docker Compose
docker --version
docker-compose --version

# 3. Check PostgreSQL
psql --version

# 4. Check Git
git --version
```

### Automated Setup

```bash
# Clone and setup
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Configure your settings

# Setup database
npm run db:migrate

# Start all services
docker-compose up -d

# Access the application
open http://localhost:3000
```

## 📋 Manual Setup Guide

### Step 1: Database Setup

```bash
# Create database
createdb lightdom

# Run migrations
psql -U postgres -d lightdom -f database/campaign-management-schema.sql

# Verify setup
psql -U postgres -d lightdom -c "\dt"
```

### Step 2: Ollama & DeepSeek Setup

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull DeepSeek-R1 model
ollama pull deepseek-r1

# Start Ollama service
ollama serve

# Verify installation
curl http://localhost:11434/api/tags
```

### Step 3: Application Configuration

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=your_password

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1

# API
API_PORT=3001
FRONTEND_PORT=3000

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_PASSWORD=your_rabbitmq_password

# n8n
N8N_PASSWORD=your_n8n_password

# JWT
JWT_SECRET=your_jwt_secret_here

# DeepSeek API (Optional - for cloud API)
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

### Step 4: Start Services

#### Option A: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

#### Option B: Manual Start

```bash
# Terminal 1: PostgreSQL (if not using Docker)
# Already running

# Terminal 2: Redis
redis-server

# Terminal 3: Ollama
ollama serve

# Terminal 4: API Server
npm run start:dev

# Terminal 5: Frontend
cd frontend && npm run dev

# Terminal 6: Workflow Engine
node workflow-engine/server.js
```

## 🔌 Service URLs

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application UI |
| API | http://localhost:3001 | REST API |
| API Docs | http://localhost:3001/api-docs | Swagger documentation |
| Ollama | http://localhost:11434 | DeepSeek/LLM service |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| RabbitMQ | http://localhost:15672 | Message queue admin |
| n8n | http://localhost:5678 | Workflow automation |
| Workflow Engine | http://localhost:3002 | Campaign executor |

## 🧪 Testing the Integration

### 1. Health Checks

```bash
# Check API health
curl http://localhost:3001/health

# Check Ollama
curl http://localhost:11434/api/tags

# Check database connection
npm run db:health

# Check all services
npm run admin:status
```

### 2. Create Your First Campaign

```bash
# Via API
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Campaign",
    "description": "Test SEO campaign"
  }'

# Via Frontend
# Navigate to http://localhost:3000/campaigns
# Click "Create Campaign" button
```

### 3. Test DeepSeek Chat

```typescript
// In browser console at http://localhost:3000
const testChat = async () => {
  const response = await fetch('http://localhost:3001/api/deepseek/generate-workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Create a workflow for daily SEO monitoring'
    })
  });
  const result = await response.json();
  console.log('Generated workflow:', result);
};

testChat();
```

### 4. Test Visual Workflow Builder

1. Navigate to http://localhost:3000/workflows
2. Click "AI Generate" button
3. Enter: "Monitor competitor websites and analyze their SEO"
4. Review generated workflow
5. Click "Execute" to run

## 📊 Usage Examples

### Example 1: SEO Campaign with Data Mining

```typescript
// Step 1: Create campaign
const campaign = await fetch('http://localhost:3001/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Competitor Analysis Campaign',
    description: 'Monitor top 10 competitors'
  })
}).then(r => r.json());

// Step 2: Generate workflow
const workflow = await fetch('http://localhost:3001/api/deepseek/generate-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Daily crawl of competitor websites, extract keywords, analyze SEO'
  })
}).then(r => r.json());

// Step 3: Save workflow
await fetch('http://localhost:3001/api/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...workflow,
    campaignId: campaign.id
  })
});

// Step 4: Execute workflow
await fetch('http://localhost:3001/api/workflows/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workflow)
});
```

### Example 2: Blockchain Anomaly Detection

```typescript
// Create blockchain monitoring workflow
const blockchainWorkflow = {
  name: 'Blockchain Anomaly Monitor',
  nodes: [
    {
      id: 'trigger',
      type: 'trigger',
      label: 'Every 10 minutes',
      data: { schedule: '*/10 * * * *' }
    },
    {
      id: 'monitor',
      type: 'blockchain',
      label: 'Monitor Chain',
      data: { blockchain: 'ethereum', contracts: ['0x...'] }
    },
    {
      id: 'analyze',
      type: 'decision',
      label: 'Detect Anomaly',
      data: { algorithm: 'deepseek-analysis' }
    },
    {
      id: 'alert',
      type: 'notification',
      label: 'Send Alert',
      data: { channel: 'email', recipients: ['admin@example.com'] }
    }
  ],
  edges: [
    { source: 'trigger', target: 'monitor' },
    { source: 'monitor', target: 'analyze' },
    { source: 'analyze', target: 'alert' }
  ]
};

await fetch('http://localhost:3001/api/workflows/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(blockchainWorkflow)
});
```

### Example 3: Chat with DeepSeek

```typescript
// Interactive chat session
const socket = io('http://localhost:3001');

// Send message
socket.emit('chat:message', {
  content: 'Create a new campaign for e-commerce SEO',
  campaignContext: { industry: 'retail' }
});

// Receive response
socket.on('chat:response', (response) => {
  console.log('DeepSeek:', response.content);
  
  // Execute any actions
  if (response.actions) {
    response.actions.forEach(action => executeAction(action));
  }
});
```

## 🔧 Advanced Configuration

### Custom Node Types

Create custom workflow nodes:

```typescript
// src/workflow-nodes/custom-node.ts
import { WorkflowNode } from '../types';

export const customNode: WorkflowNode = {
  type: 'customAnalysis',
  label: 'Custom Analysis',
  icon: '🔍',
  color: '#9c27b0',
  
  execute: async (data, context) => {
    // Your custom logic
    const result = await performAnalysis(data);
    return result;
  },
  
  validate: (config) => {
    // Validation logic
    return config.requiredField !== undefined;
  },
  
  schema: {
    requiredField: { type: 'string', required: true },
    optionalField: { type: 'number', default: 0 }
  }
};
```

### Custom AI Prompts

```typescript
// src/prompts/campaign-prompts.ts
export const campaignPrompts = {
  createCampaign: (industry: string) => `
    You are an SEO campaign expert specializing in ${industry}.
    
    Create a comprehensive SEO campaign that includes:
    1. Target keywords and search intent
    2. Content strategy
    3. Link building approach
    4. Technical SEO checklist
    5. Success metrics
    
    Return as structured JSON.
  `,
  
  optimizeCampaign: (campaignData: any) => `
    Analyze this campaign data: ${JSON.stringify(campaignData)}
    
    Provide optimization recommendations for:
    - Keyword targeting
    - Content gaps
    - Technical issues
    - Link opportunities
    
    Prioritize by ROI potential.
  `
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Ollama Connection Error

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama
ollama serve

# Check logs
journalctl -u ollama -f
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d lightdom -c "SELECT 1"

# Check connection string
echo $DATABASE_URL
```

#### 3. Workflow Execution Stuck

```sql
-- Check stuck executions
SELECT * FROM workflow_executions 
WHERE status = 'running' 
AND started_at < NOW() - INTERVAL '1 hour';

-- Cancel stuck execution
UPDATE workflow_executions 
SET status = 'failed', error = 'Timeout' 
WHERE id = 'execution-id';
```

#### 4. Out of Memory

```bash
# Check Docker memory
docker stats

# Increase Docker memory limit
# Edit docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 2G  # Increase this
```

## 📈 Performance Optimization

### 1. Database Indexing

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_campaigns_status_active ON campaigns(status) WHERE status = 'active';
CREATE INDEX idx_workflow_executions_running ON workflow_executions(status, started_at) WHERE status = 'running';
```

### 2. Redis Caching

```typescript
// Cache expensive operations
const getCampaignStats = async (campaignId: string) => {
  const cacheKey = `campaign:${campaignId}:stats`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const stats = await calculateStats(campaignId);
  await redis.setex(cacheKey, 300, JSON.stringify(stats));  // 5 min TTL
  
  return stats;
};
```

### 3. Connection Pooling

```typescript
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,  // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Load testing completed
- [ ] Security audit passed

### Deploy to Production

```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Push to registry
docker-compose -f docker-compose.production.yml push

# Deploy to production
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
docker-compose -f docker-compose.production.yml ps
```

## 📚 Additional Resources

- [API Documentation](http://localhost:3001/api-docs)
- [DeepSeek Campaign System Guide](./DEEPSEEK_CAMPAIGN_SYSTEM.md)
- [Visual Workflow Research](./VISUAL_WORKFLOW_RESEARCH.md)
- [Container Architecture](./CONTAINER_ARCHITECTURE.md)
- [Ollama Documentation](https://ollama.ai/docs)
- [React Flow Docs](https://reactflow.dev/docs/introduction)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review documentation files
3. Check Docker logs: `docker-compose logs -f`
4. Open an issue on GitHub

---

**System Status**: ✅ Production Ready  
**Last Updated**: 2025-01-05  
**Version**: 1.0.0
