# Crawler System API Endpoints

## Overview

Complete API reference for the crawler management system, including campaigns, clusters, and seeding services.

## Base URL

```
http://localhost:3001/api/campaigns
```

## Authentication

Currently, endpoints are public. Add authentication in production.

## API Endpoints

### Campaign Management

#### Create Campaign from Prompt

```
POST /api/campaigns/create-from-prompt
```

Create a new crawler campaign using natural language.

**Request Body:**
```json
{
  "prompt": "Collect SEO training data for an e-commerce site selling outdoor gear",
  "clientSiteUrl": "https://example.com",
  "options": {
    "payloadSize": 100,
    "loadBalancing": "least-busy"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign_1234567890_abc123",
    "name": "SEO Training Data Collection",
    "status": "created",
    "configuration": {...},
    "seeds": [...],
    "createdAt": "2025-11-18T12:00:00.000Z"
  },
  "message": "Campaign created successfully"
}
```

#### List All Campaigns

```
GET /api/campaigns
```

**Query Parameters:**
- `status` (optional): Filter by status (created, running, paused, stopped)
- `clientSiteUrl` (optional): Filter by client site URL

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

#### Get Campaign Details

```
GET /api/campaigns/:campaignId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign_123",
    "name": "Campaign Name",
    "status": "running",
    ...
  }
}
```

#### Update Campaign

```
PUT /api/campaigns/:campaignId
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "configuration": {
    "parallelCrawlers": 10,
    "payloadSize": 150
  }
}
```

#### Delete Campaign

```
DELETE /api/campaigns/:campaignId
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

### Campaign Control

#### Start Campaign

```
POST /api/campaigns/:campaignId/start
```

#### Stop Campaign

```
POST /api/campaigns/:campaignId/stop
```

#### Pause Campaign

```
POST /api/campaigns/:campaignId/pause
```

#### Resume Campaign

```
POST /api/campaigns/:campaignId/resume
```

### Campaign Analytics

#### Get Campaign Analytics

```
GET /api/campaigns/:campaignId/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "campaign_123",
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

#### Schedule Campaign

```
POST /api/campaigns/:campaignId/schedule
```

**Request Body:**
```json
{
  "frequency": "daily",
  "time": "02:00",
  "enabled": true
}
```

#### Get Service Statistics

```
GET /api/campaigns/stats/service
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCampaigns": 15,
    "activeCampaigns": 8,
    "pausedCampaigns": 2,
    "totalCrawlers": 45,
    "activeCrawlers": 32,
    "totalUrlsQueued": 1250,
    "totalUrlsProcessed": 5840,
    "totalErrors": 23
  }
}
```

### Cluster Management

#### Create Cluster

```
POST /api/campaigns/clusters
```

**Request Body:**
```json
{
  "name": "E-commerce Crawlers",
  "description": "Cluster for e-commerce websites",
  "reason": "Group related e-commerce campaigns",
  "strategy": "load-balanced",
  "maxCrawlers": 10,
  "autoScale": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cluster_123",
    "name": "E-commerce Crawlers",
    ...
  },
  "message": "Cluster created successfully"
}
```

#### List Clusters

```
GET /api/campaigns/clusters
```

**Query Parameters:**
- `status` (optional): Filter by status

#### Get Cluster with Campaigns

```
GET /api/campaigns/clusters/:clusterId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cluster_123",
    "name": "E-commerce Crawlers",
    "campaigns": [
      {
        "id": "campaign_1",
        "name": "Campaign 1",
        "priority": 10,
        "role": "primary",
        "joined_at": "2025-11-18T12:00:00.000Z"
      }
    ]
  }
}
```

#### Update Cluster

```
PUT /api/campaigns/clusters/:clusterId
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "maxCrawlers": 15,
  "autoScale": false
}
```

#### Delete Cluster

```
DELETE /api/campaigns/clusters/:clusterId
```

#### Add Campaign to Cluster

```
POST /api/campaigns/clusters/:clusterId/campaigns/:campaignId
```

**Request Body:**
```json
{
  "priority": 10,
  "role": "primary"
}
```

#### Remove Campaign from Cluster

```
DELETE /api/campaigns/clusters/:clusterId/campaigns/:campaignId
```

### Seeding Services

#### Create Seeding Service

```
POST /api/campaigns/seeding-services
```

**Request Body (Sitemap):**
```json
{
  "name": "Main Sitemap Collector",
  "type": "sitemap",
  "description": "Collects URLs from sitemap",
  "config": {
    "sitemapUrl": "https://example.com/sitemap.xml",
    "followSubSitemaps": true,
    "maxUrls": 1000
  }
}
```

**Request Body (Search Results):**
```json
{
  "name": "Google Search Collector",
  "type": "search-results",
  "description": "Collects from search",
  "config": {
    "searchEngine": "google",
    "query": "site:example.com",
    "maxResults": 100,
    "language": "en"
  }
}
```

**Request Body (API):**
```json
{
  "name": "Custom API Collector",
  "type": "api",
  "description": "Fetches from API",
  "config": {
    "apiUrl": "https://api.example.com/urls",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer token"
    },
    "authentication": "bearer"
  }
}
```

#### List Seeding Services

```
GET /api/campaigns/seeding-services
```

**Query Parameters:**
- `type` (optional): Filter by type (sitemap, search-results, api)
- `status` (optional): Filter by status

#### Get Seeding Service

```
GET /api/campaigns/seeding-services/:serviceId
```

#### Update Seeding Service

```
PUT /api/campaigns/seeding-services/:serviceId
```

#### Delete Seeding Service

```
DELETE /api/campaigns/seeding-services/:serviceId
```

#### Attach Service to Campaign

```
POST /api/campaigns/:campaignId/seeding-services/:serviceId
```

**Request Body:**
```json
{
  "configOverrides": {
    "maxUrls": 500
  },
  "enabled": true
}
```

#### Trigger URL Collection

```
POST /api/campaigns/seeding-services/:serviceId/collect
```

**Request Body:**
```json
{
  "campaignId": "campaign_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serviceId": "seeding_123",
    "campaignId": "campaign_123",
    "urlsCollected": 147,
    "timestamp": "2025-11-18T12:00:00.000Z"
  }
}
```

#### Get Collected Seeds

```
GET /api/campaigns/:campaignId/seeds
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, used)
- `limit` (optional): Maximum number of results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://example.com/page1",
      "source": "Main Sitemap",
      "method": "sitemap",
      "priority": 5,
      "status": "pending",
      "collected_at": "2025-11-18T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### DeepSeek AI Integration

#### Generate Workflow from Prompt

```
POST /api/campaigns/deepseek/generate-workflow
```

**Request Body:**
```json
{
  "prompt": "Create a workflow for SEO data collection",
  "options": {}
}
```

#### Generate URL Seeds

```
POST /api/campaigns/deepseek/generate-seeds
```

**Request Body:**
```json
{
  "campaignDescription": "SEO training data collection",
  "clientSiteUrl": "https://example.com",
  "options": {}
}
```

#### Build Data Schema

```
POST /api/campaigns/deepseek/build-schema
```

**Request Body:**
```json
{
  "purpose": "E-commerce product data collection",
  "existingSchemas": ["seo_metrics"],
  "options": {}
}
```

#### Generate Workflow Pipeline

```
POST /api/campaigns/deepseek/generate-pipeline
```

**Request Body:**
```json
{
  "schemas": ["crawler_data", "seo_metrics"],
  "goal": "Create SEO ranking dataset",
  "options": {}
}
```

#### Research Neural Network Setup

```
POST /api/campaigns/deepseek/research-neural-network
```

**Request Body:**
```json
{
  "requirements": {
    "purpose": "SEO ranking prediction",
    "trainingDataSize": "large"
  },
  "options": {}
}
```

#### Check DeepSeek API Health

```
GET /api/campaigns/deepseek/health
```

### List All Endpoints

```
GET /api/campaigns/endpoints/list
```

Returns a complete list of all available endpoints with descriptions.

## Response Codes

- `200` - Success
- `400` - Bad Request (missing required parameters)
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Rate Limiting

Default rate limit: 100 requests per minute per IP address.

## Notes

- All timestamps are in ISO 8601 format
- IDs are generated as `{type}_{timestamp}_{random}`
- Status values are lowercase strings
- JSONB fields support nested objects

## Examples

### Complete Campaign Lifecycle

```bash
# 1. Create campaign
curl -X POST http://localhost:3001/api/campaigns/create-from-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crawl e-commerce site for products",
    "clientSiteUrl": "https://example.com"
  }'

# 2. Create seeding service
curl -X POST http://localhost:3001/api/campaigns/seeding-services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sitemap Collector",
    "type": "sitemap",
    "config": {
      "sitemapUrl": "https://example.com/sitemap.xml"
    }
  }'

# 3. Attach service to campaign
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/seeding-services/{serviceId} \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# 4. Start campaign
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/start

# 5. Monitor progress
curl http://localhost:3001/api/campaigns/{campaignId}/analytics

# 6. Stop campaign
curl -X POST http://localhost:3001/api/campaigns/{campaignId}/stop
```

### Cluster Management Example

```bash
# 1. Create cluster
curl -X POST http://localhost:3001/api/campaigns/clusters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SEO Campaigns",
    "reason": "Group SEO-related campaigns",
    "strategy": "load-balanced"
  }'

# 2. Add campaigns to cluster
curl -X POST http://localhost:3001/api/campaigns/clusters/{clusterId}/campaigns/{campaignId} \
  -H "Content-Type: application/json" \
  -d '{"priority": 10}'

# 3. View cluster with campaigns
curl http://localhost:3001/api/campaigns/clusters/{clusterId}
```

## Integration with Services

These endpoints are designed to be consumed by:

- Frontend dashboards
- CLI tools
- External automation services
- Monitoring systems
- Webhooks and integrations

## Future Endpoints

Planned additions:
- WebSocket endpoints for real-time updates
- Batch operations API
- Export/import functionality
- Advanced filtering and search
- Custom reporting endpoints

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-18  
**API Status**: Production Ready
