# Crawler System - Complete Implementation Guide

## Overview

The LightDom Crawler System is a comprehensive, production-ready web crawling platform with:
- **Campaign Management**: Create and manage crawler campaigns using natural language
- **Cluster Support**: Group campaigns for coordinated operations
- **Seeding Services**: Automatic URL collection from sitemaps, search results, and APIs
- **Real-time Monitoring**: Track progress, performance, and errors
- **AI Integration**: DeepSeek-powered workflow generation
- **Full CRUD API**: RESTful endpoints for all operations

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Database Setup](#database-setup)
4. [API Reference](#api-reference)
5. [UI Components](#ui-components)
6. [Seeding Services](#seeding-services)
7. [Cluster Management](#cluster-management)
8. [Configuration](#configuration)
9. [Development](#development)
10. [Testing](#testing)
11. [Deployment](#deployment)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 13+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env

# Configure database
# Edit .env and set DATABASE_URL
```

### Database Setup

```bash
# Run migration
psql -U postgres -d lightdom_blockchain -f database/migrations/crawler-campaign-tables.sql

# Verify tables
psql -U postgres -d lightdom_blockchain -c "\dt crawler*"
```

### Start Services

```bash
# Start API server
npm run start:dev

# In another terminal, start frontend
npm run dev
```

### Access UI

Navigate to:
- **Crawler Dashboard**: http://localhost:3000/crawler
- **Storybook**: http://localhost:6006

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Ant Design)             │
│  - ComprehensiveCrawlerDashboard                            │
│  - CrawlerClusterManagement                                 │
│  - SeedingServiceManagement                                 │
│  - CrawlerCampaignDashboard                                 │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express.js)                    │
│  - /api/campaigns/* (Campaign CRUD)                         │
│  - /api/campaigns/clusters/* (Cluster Management)           │
│  - /api/campaigns/seeding-services/* (Seeding Services)     │
│  - /api/campaigns/deepseek/* (AI Integration)               │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
┌─────────────────┐   ┌──────────────────┐
│  Campaign       │   │   DeepSeek       │
│  Service        │   │   API Service    │
│                 │   │                  │
│ - CRUD Ops      │   │ - Workflow Gen   │
│ - Clustering    │   │ - Schema Build   │
│ - Seeding       │   │ - URL Discovery  │
│ - Scheduling    │   │ - Optimization   │
└────────┬────────┘   └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - crawler_campaigns                                        │
│  - crawler_instances                                        │
│  - crawler_clusters                                         │
│  - seeding_services                                         │
│  - collected_seeds                                          │
│  - crawl_targets                                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Campaign Creation**:
   - User enters natural language prompt in UI
   - Frontend calls `/api/campaigns/create-from-prompt`
   - Service uses DeepSeek AI to generate configuration
   - Campaign saved to database with generated ID

2. **Seeding**:
   - Seeding services collect URLs from configured sources
   - URLs stored in `collected_seeds` table
   - Campaign can access seeds for crawling

3. **Clustering**:
   - Campaigns can be grouped into clusters
   - Clusters coordinate load balancing
   - Shared configuration and monitoring

4. **Execution**:
   - Campaign started via `/api/campaigns/:id/start`
   - Crawler instances created based on configuration
   - URLs distributed using selected strategy
   - Progress tracked in real-time

## Database Setup

### Schema Overview

The system uses 8 main tables:

1. **crawler_campaigns**: Main campaign configurations
2. **crawler_instances**: Individual crawler workers
3. **crawler_schedules**: Automated execution schedules
4. **crawl_targets**: URLs to crawl with status tracking
5. **crawler_clusters**: Cluster definitions
6. **cluster_campaigns**: Campaign-to-cluster relationships
7. **seeding_services**: URL collection service definitions
8. **collected_seeds**: URLs collected by seeding services

### Migration

```bash
# Apply migration
psql -U postgres -d lightdom_blockchain -f database/migrations/crawler-campaign-tables.sql

# Check migration status
SELECT * FROM schema_migrations WHERE version LIKE '%crawler%';
```

### Indexes

All critical columns are indexed:
- Campaign status
- Cluster membership
- URL lookups
- Timestamp queries

See [DATABASE_MIGRATION_RULES.md](./DATABASE_MIGRATION_RULES.md) for complete migration guidelines.

## API Reference

### Base URL

```
http://localhost:3001/api/campaigns
```

### Key Endpoints

#### Campaigns

```bash
# Create from prompt
POST /api/campaigns/create-from-prompt

# List all
GET /api/campaigns

# Get details
GET /api/campaigns/:id

# Update
PUT /api/campaigns/:id

# Delete
DELETE /api/campaigns/:id

# Control
POST /api/campaigns/:id/start
POST /api/campaigns/:id/stop
POST /api/campaigns/:id/pause
POST /api/campaigns/:id/resume
```

#### Clusters

```bash
# Create cluster
POST /api/campaigns/clusters

# List clusters
GET /api/campaigns/clusters

# Get with campaigns
GET /api/campaigns/clusters/:id

# Add campaign to cluster
POST /api/campaigns/clusters/:clusterId/campaigns/:campaignId

# Remove campaign from cluster
DELETE /api/campaigns/clusters/:clusterId/campaigns/:campaignId
```

#### Seeding Services

```bash
# Create service
POST /api/campaigns/seeding-services

# List services
GET /api/campaigns/seeding-services

# Run service
POST /api/campaigns/seeding-services/:id/collect

# Get collected seeds
GET /api/campaigns/:campaignId/seeds
```

See [CRAWLER_API_ENDPOINTS.md](./CRAWLER_API_ENDPOINTS.md) for complete API documentation.

## UI Components

### ComprehensiveCrawlerDashboard

Main dashboard integrating all components.

```tsx
import ComprehensiveCrawlerDashboard from './components/ComprehensiveCrawlerDashboard';

function App() {
  return <ComprehensiveCrawlerDashboard />;
}
```

**Features:**
- Tabbed interface
- Real-time updates
- Integrated analytics
- Badge indicators

### CrawlerClusterManagement

Manage crawler clusters.

```tsx
import CrawlerClusterManagement from './components/CrawlerClusterManagement';

function ClusterPage() {
  return (
    <CrawlerClusterManagement
      onSelectCluster={(cluster) => console.log(cluster)}
    />
  );
}
```

**Features:**
- Create/edit/delete clusters
- Load balancing configuration
- Auto-scaling controls
- Campaign assignment

### SeedingServiceManagement

Manage URL collection services.

```tsx
import SeedingServiceManagement from './components/SeedingServiceManagement';

function SeedingPage() {
  return <SeedingServiceManagement campaignId="campaign_123" />;
}
```

**Features:**
- Multiple service types
- Type-specific configuration
- Manual triggering
- Collection statistics

## Seeding Services

### Service Types

#### 1. Sitemap Parser

Collects URLs from XML sitemaps.

**Configuration:**
```json
{
  "sitemapUrl": "https://example.com/sitemap.xml",
  "followSubSitemaps": true,
  "maxUrls": 1000
}
```

**Features:**
- Recursive sitemap parsing
- Sub-sitemap following
- URL limit enforcement

#### 2. Search Results

Collects URLs from search engines.

**Configuration:**
```json
{
  "searchEngine": "google",
  "query": "site:example.com",
  "maxResults": 100,
  "language": "en"
}
```

**Supported Engines:**
- Google
- Bing
- DuckDuckGo

#### 3. Custom API

Integrates with any URL-providing API.

**Configuration:**
```json
{
  "apiUrl": "https://api.example.com/urls",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "authentication": "bearer"
}
```

**Authentication Types:**
- None
- Bearer Token
- API Key
- Basic Auth

### Using Seeding Services

```bash
# 1. Create service
curl -X POST http://localhost:3001/api/campaigns/seeding-services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Sitemap",
    "type": "sitemap",
    "config": {
      "sitemapUrl": "https://example.com/sitemap.xml"
    }
  }'

# 2. Attach to campaign
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/seeding-services/{serviceId}

# 3. Collect URLs
curl -X POST http://localhost:3001/api/campaigns/seeding-services/{serviceId}/collect \
  -d '{"campaignId": "campaign_123"}'

# 4. View collected seeds
curl http://localhost:3001/api/campaigns/{campaignId}/seeds
```

## Cluster Management

### Creating Clusters

Clusters group related campaigns for coordinated operations.

**Use Cases:**
- Geographic clustering (US vs EU crawlers)
- Industry clustering (e-commerce, news, etc.)
- Priority-based clustering (high vs low priority)
- Resource pooling (shared crawler instances)

**Load Balancing Strategies:**

1. **Load Balanced**: Even distribution across crawlers
2. **Round Robin**: Sequential assignment
3. **Priority Based**: High priority items to fewer crawlers
4. **Least Busy**: Assign to crawler with smallest queue

### Example: E-commerce Cluster

```bash
# 1. Create cluster
curl -X POST http://localhost:3001/api/campaigns/clusters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce Crawlers",
    "reason": "Group all e-commerce campaigns for better resource management",
    "strategy": "load-balanced",
    "maxCrawlers": 15,
    "autoScale": true
  }'

# 2. Add campaigns
curl -X POST http://localhost:3001/api/campaigns/clusters/{clusterId}/campaigns/{campaign1Id} \
  -d '{"priority": 10, "role": "primary"}'

curl -X POST http://localhost:3001/api/campaigns/clusters/{clusterId}/campaigns/{campaign2Id} \
  -d '{"priority": 8, "role": "secondary"}'

# 3. View cluster
curl http://localhost:3001/api/campaigns/clusters/{clusterId}
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom_blockchain
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom_blockchain
DB_USER=postgres
DB_PASSWORD=postgres

# API
PORT=3001
NODE_ENV=development

# DeepSeek AI (optional)
DEEPSEEK_API_KEY=your-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# Crawler Configuration
CRAWLER_MAX_CAMPAIGNS=50
CRAWLER_MAX_PER_CAMPAIGN=20
CRAWLER_DEFAULT_PAYLOAD_SIZE=100
CRAWLER_LOAD_BALANCING=least-busy
CRAWLER_AUTO_SCALING=true
```

### Service Configuration

Edit `services/crawler-campaign-service.js`:

```javascript
const campaignService = new CrawlerCampaignService({
  maxCampaigns: 50,
  maxCrawlersPerCampaign: 20,
  defaultPayloadSize: 100,
  loadBalancingStrategy: 'least-busy',
  enableAutoScaling: true
});
```

## Development

### Running Storybook

```bash
npm run storybook
```

Access at: http://localhost:6006

### Component Development

```bash
# Create new component
mkdir src/components/MyComponent
touch src/components/MyComponent.tsx

# Create story
touch src/stories/MyComponent.stories.tsx
```

### Code Style

Follow existing patterns:
- TypeScript for type safety
- Ant Design for UI components
- Axios for API calls
- React hooks for state management

## Testing

### Run Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

Target: 80% coverage

### Manual Testing

```bash
# 1. Start services
npm run start:dev

# 2. Create test campaign
curl -X POST http://localhost:3001/api/campaigns/create-from-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test campaign",
    "clientSiteUrl": "https://example.com"
  }'

# 3. Verify in UI
open http://localhost:3000/crawler
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Add authentication to API
- [ ] Enable rate limiting
- [ ] Setup SSL/TLS
- [ ] Configure monitoring
- [ ] Setup backups
- [ ] Document disaster recovery

### Docker Deployment

```bash
# Build image
docker build -t lightdom-crawler .

# Run container
docker run -d \
  -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e DEEPSEEK_API_KEY=... \
  lightdom-crawler
```

### Environment-Specific Configs

```javascript
// config/production.js
module.exports = {
  database: {
    pool: {
      max: 50,
      min: 10
    }
  },
  crawler: {
    maxCampaigns: 100,
    maxCrawlersPerCampaign: 50
  }
};
```

## Best Practices

### Campaign Creation

1. **Be Specific**: Use detailed prompts for better AI-generated configs
2. **Start Small**: Begin with fewer crawlers and scale up
3. **Monitor First Run**: Watch initial execution to optimize
4. **Use Schedules**: Automate recurring tasks

### Cluster Usage

1. **Logical Grouping**: Cluster by purpose, not just size
2. **Priority Assignment**: Set appropriate campaign priorities
3. **Resource Limits**: Configure max crawlers appropriately
4. **Regular Review**: Monitor cluster performance

### Seeding Services

1. **Multiple Sources**: Use various seeding methods
2. **Priority Setting**: Mark important URLs with high priority
3. **Regular Updates**: Run seeding services periodically
4. **Validate URLs**: Check collected URLs before crawling

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -U postgres -d lightdom_blockchain -c "SELECT 1"

# Check pool
SELECT * FROM pg_stat_activity WHERE datname = 'lightdom_blockchain';
```

### API Not Responding

```bash
# Check process
ps aux | grep node

# View logs
tail -f logs/api-server.log

# Test endpoint
curl http://localhost:3001/api/health
```

### Crawler Not Starting

```bash
# Check campaign status
curl http://localhost:3001/api/campaigns/{id}

# View logs
curl http://localhost:3001/api/campaigns/{id}/analytics
```

## Contributing

### Development Workflow

1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Update documentation
6. Submit pull request

### Code Review

All changes must:
- Pass all tests
- Meet coverage requirements
- Follow code style
- Include documentation
- Have descriptive commits

## Resources

### Documentation

- [Database Migration Rules](./DATABASE_MIGRATION_RULES.md)
- [API Endpoints](./CRAWLER_API_ENDPOINTS.md)
- [Crawler Quickstart](./CRAWLER_QUICKSTART.md)
- [Crawler Research](./CRAWLER_RESEARCH.md)

### External Resources

- [Puppeteer Docs](https://pptr.dev/)
- [Ant Design](https://ant.design/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@lightdom.example.com

## License

MIT License - see LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-18  
**Status**: Production Ready  
**Authors**: LightDom Development Team
