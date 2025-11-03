# DeepSeek-Integrated Crawler Campaign Management System

## Overview

A comprehensive AI-powered crawler orchestration platform that enables automated web data collection campaigns with intelligent workflow management, schema linking, and neural network integration capabilities.

## Features

### 🤖 AI-Powered Campaign Creation
- **Natural Language Prompts**: Create complete crawler campaigns by describing your goals in plain English
- **Automatic URL Seed Generation**: AI discovers and prioritizes relevant URLs based on campaign objectives
- **Schema Auto-Generation**: Intelligent data extraction schemas created from campaign requirements
- **Workflow Optimization**: DeepSeek API optimizes crawler configurations based on analytics

### 🕷️ Advanced Crawler Management
- **Multi-Crawler Orchestration**: Manage multiple parallel crawler instances per campaign
- **Load Balancing Strategies**: 
  - Least Busy: Distribute to crawlers with smallest queue
  - Round Robin: Equal distribution across all crawlers
  - Priority-based: High-priority URLs to dedicated crawlers
- **Auto-Scaling**: Automatically adjust crawler count based on queue size and performance
- **Real-time Monitoring**: Live dashboard with crawler status, queue sizes, and performance metrics

### 📊 Campaign Analytics
- **Performance Metrics**: Track pages/second, response times, success rates
- **Error Tracking**: Detailed error logging and retry mechanisms
- **Historical Analytics**: Time-series data for campaign performance analysis
- **Resource Utilization**: Monitor CPU, memory, and network usage

### ⏰ Scheduling & Automation
- **Flexible Schedules**: Hourly, daily, weekly, or monthly execution
- **Workflow Pipelines**: Chain multiple campaigns and schemas together
- **Function Calling**: Forward/backward linked schemas trigger automated workflows
- **Event-Driven Execution**: Trigger campaigns based on data events or conditions

### 🔗 Schema Linking & Integration
- **Forward Linking**: Data from one schema triggers collection in dependent schemas
- **Backward Linking**: Update parent schemas when child data changes
- **Pipeline Workflows**: Multi-stage data processing with dependency management
- **Function Calling**: Automated function execution based on schema events

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard (React)                   │
│  - Campaign Management UI                                    │
│  - Real-time Monitoring                                      │
│  - Configuration Wizard                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
│  - Campaign Routes                                           │
│  - DeepSeek Integration                                      │
│  - Analytics Endpoints                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│  DeepSeek    │   │   Campaign       │
│  API Service │   │   Service        │
│              │   │                  │
│ - Workflow   │   │ - Orchestration  │
│ - Schemas    │   │ - Load Balance   │
│ - Pipelines  │   │ - Scheduling     │
└──────────────┘   └─────────┬────────┘
                             │
                   ┌─────────┴──────────┐
                   ▼                    ▼
           ┌──────────────┐    ┌──────────────┐
           │   Crawler    │    │  PostgreSQL  │
           │   Instances  │    │  Database    │
           │              │    │              │
           │ - Puppeteer  │    │ - Campaigns  │
           │ - Workers    │    │ - Analytics  │
           │ - Queue Mgmt │    │ - Schemas    │
           └──────────────┘    └──────────────┘
```

## Quick Start

### 1. Environment Setup

Add to your `.env` file:

```bash
# DeepSeek AI Integration
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# Crawler Campaign Configuration
CRAWLER_MAX_CAMPAIGNS=50
CRAWLER_MAX_PER_CAMPAIGN=20
CRAWLER_DEFAULT_PAYLOAD_SIZE=100
CRAWLER_LOAD_BALANCING=least-busy
CRAWLER_AUTO_SCALING=true
```

### 2. Database Migration

Run the database migration to create required tables:

```bash
psql -U postgres -d lightdom_blockchain -f database/migrations/crawler-campaign-tables.sql
```

Or use the npm script:

```bash
npm run migrate
```

### 3. Start the Services

```bash
# Start API server
npm run start:dev

# Or start complete system
npm run start:complete
```

### 4. Access the Dashboard

Navigate to: `http://localhost:3000/dashboard/crawler-campaigns`

## Usage Examples

### Create Campaign from Prompt

**Via Dashboard:**
1. Click "Create Campaign"
2. Enter prompt: "Collect SEO training data for an e-commerce site selling outdoor gear"
3. Specify client site URL
4. Click "Generate Campaign"

**Via API:**

```bash
curl -X POST http://localhost:3001/api/campaigns/create-from-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Collect SEO training data for an e-commerce site selling outdoor gear. Focus on product pages, blog posts, and category pages.",
    "clientSiteUrl": "https://example.com",
    "options": {
      "payloadSize": 100,
      "loadBalancing": "least-busy"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign_1234567890_abc123",
    "name": "SEO Training Data Collection",
    "status": "created",
    "configuration": {
      "parallelCrawlers": 5,
      "payloadSize": 100,
      "maxDepth": 3,
      "rateLimit": 100
    },
    "seeds": [
      {
        "url": "https://example.com",
        "category": "primarySeeds",
        "priority": 10
      }
    ]
  }
}
```

### Start Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/start
```

### Monitor Campaign

```bash
curl http://localhost:3001/api/campaigns/{campaignId}/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign_1234567890_abc123",
    "status": "running",
    "totalCrawlers": 5,
    "activeCrawlers": 5,
    "totalUrls": 250,
    "processedUrls": 47,
    "errorCount": 2,
    "progress": 19
  }
}
```

### Schedule Campaign

```bash
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "time": "02:00",
    "enabled": true
  }'
```

## Advanced Features

### Custom Schema Building

```javascript
import deepSeekService from './services/deepseek-api-service.js';

const schema = await deepSeekService.buildCrawlerSchema(
  'E-commerce product data for ML training',
  ['seo_metrics', 'page_performance']
);
```

### Workflow Pipeline Generation

```javascript
const pipeline = await deepSeekService.generateWorkflowPipeline(
  ['crawler_data', 'seo_metrics', 'training_data'],
  'Create SEO ranking prediction dataset'
);
```

### Load Balancing Configuration

Configure per campaign:

```javascript
await campaignService.updateCampaignConfig(campaignId, {
  configuration: {
    loadBalancing: 'priority-based',
    payloadSize: 150,
    parallelCrawlers: 10
  }
});
```

## Database Schema

### Core Tables

- **`crawler_campaigns`**: Campaign configurations and state
- **`crawler_instances`**: Individual crawler workers
- **`crawler_schedules`**: Automated execution schedules
- **`crawl_targets`**: URLs to crawl with status tracking
- **`crawler_schemas`**: Data extraction schemas
- **`workflow_pipelines`**: Multi-stage processing pipelines
- **`campaign_analytics`**: Historical performance data

See `database/migrations/crawler-campaign-tables.sql` for complete schema.

## API Endpoints

### Campaign Management

- `POST /api/campaigns/create-from-prompt` - Create campaign from AI prompt
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `POST /api/campaigns/:id/resume` - Resume campaign
- `POST /api/campaigns/:id/stop` - Stop campaign
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/:id/analytics` - Get analytics
- `POST /api/campaigns/:id/schedule` - Schedule campaign

### DeepSeek AI Integration

- `POST /api/campaigns/deepseek/generate-workflow` - Generate workflow
- `POST /api/campaigns/deepseek/generate-seeds` - Generate URL seeds
- `POST /api/campaigns/deepseek/build-schema` - Build data schema
- `POST /api/campaigns/deepseek/generate-pipeline` - Generate pipeline
- `POST /api/campaigns/deepseek/research-neural-network` - Research setup
- `GET /api/campaigns/deepseek/health` - Check API health

### Service Stats

- `GET /api/campaigns/stats/service` - Get service statistics

## Configuration Options

### Campaign Configuration

```typescript
{
  maxDepth: number;              // Maximum crawl depth (default: 3)
  parallelCrawlers: number;      // Number of parallel crawlers (1-20)
  payloadSize: number;           // URLs per crawler (default: 100)
  loadBalancing: string;         // 'least-busy' | 'round-robin' | 'priority-based'
  rateLimit: number;             // Requests per minute (default: 100)
  respectRobotsTxt: boolean;     // Honor robots.txt (default: true)
  timeout: number;               // Request timeout in ms (default: 30000)
}
```

### Schedule Configuration

```typescript
{
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;      // Format: "HH:MM"
  enabled: boolean;  // Enable/disable schedule
}
```

## Best Practices

### Campaign Creation

1. **Be Specific**: Provide detailed prompts for better AI-generated configs
2. **Start Small**: Begin with fewer crawlers and scale up based on performance
3. **Monitor First Run**: Watch the first execution to optimize configuration
4. **Use Schedules**: Automate recurring data collection tasks

### Load Balancing

- **Least Busy**: Best for varied URL complexity
- **Round Robin**: Best for uniform URL types
- **Priority-based**: Best when seed URLs have different importance

### Schema Design

1. Keep schemas focused on specific data types
2. Use forward/backward linking for related data
3. Define clear triggers for function calling
4. Index frequently queried fields

### Performance Optimization

1. Adjust `parallelCrawlers` based on:
   - Total URL count
   - Server capacity
   - Rate limits
2. Set appropriate `payloadSize`:
   - Smaller for complex pages
   - Larger for simple pages
3. Monitor `pages_per_second` and adjust accordingly

## Troubleshooting

### DeepSeek API Issues

If DeepSeek API is unavailable, the system operates in **mock mode**:
- Generates sample configurations
- Uses predefined URL patterns
- Creates basic schemas

To enable live mode:
1. Get API key from DeepSeek
2. Set `DEEPSEEK_API_KEY` in `.env`
3. Restart services

### Campaign Won't Start

Check:
1. Database connection is active
2. Crawler instances can initialize
3. URLs in seeds are accessible
4. Rate limits aren't exceeded

### Poor Performance

Optimize:
1. Reduce `parallelCrawlers`
2. Increase `payloadSize`
3. Enable `autoScaling`
4. Check network bandwidth
5. Review error logs

## Neural Network Integration

The system includes research capabilities for neural network server setup:

```javascript
const research = await deepSeekService.researchNeuralNetworkSetup({
  purpose: 'SEO ranking prediction',
  trainingDataSize: 'large',
  modelType: 'transformer'
});
```

This provides:
- Hardware recommendations
- Software stack suggestions
- Configuration guidance
- Cost estimates
- Scaling strategies

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

MIT License - see `LICENSE` file for details.

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discord: Community Server

## Roadmap

### Phase 1 (Current)
- [x] DeepSeek API integration
- [x] Campaign management system
- [x] Load balancing strategies
- [x] Real-time monitoring dashboard

### Phase 2 (Next)
- [ ] Advanced ML integration
- [ ] Distributed crawler architecture
- [ ] Custom plugin system
- [ ] Advanced analytics dashboards

### Phase 3 (Future)
- [ ] Multi-cloud deployment
- [ ] Edge computing support
- [ ] Advanced AI models
- [ ] Enterprise features

## Acknowledgments

- DeepSeek for AI capabilities
- Puppeteer for headless browsing
- Ant Design for UI components
- PostgreSQL for data persistence
