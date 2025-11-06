# URL Seeding Service

Comprehensive URL discovery, seeding, and backlink generation service for the LightDom platform. This service integrates with the web crawler to discover related URLs, build backlink networks, and generate rich snippets for SEO optimization.

## Features

### Core Capabilities
- **URL Seed Generation**: Automatically generate URL seeds from search algorithms
- **Related URL Discovery**: Find related URLs from crawled sites
- **Backlink Network Mapping**: Build comprehensive backlink networks
- **Rich Snippet Generation**: Create schema.org structured data
- **SEO Optimization**: Provide SEO recommendations and reports
- **Multi-Instance Support**: Run independent instances per campaign

### Search Algorithms
- **Keyword Search**: Match URLs based on keywords
- **Similarity Search**: Find similar domains and paths
- **Authority Search**: Prioritize high-authority domains
- **Topic Search**: Discover topic-relevant URLs
- **Competitor Search**: Track competitor URLs

## Quick Start

### 1. Create a Configuration

```bash
POST /api/seeding/config
```

```json
{
  "prompt": "Create a URL seeding configuration for my e-commerce site selling outdoor gear at https://example.com",
  "clientId": "client_123",
  "clientSiteUrl": "https://example.com"
}
```

Or use a template:

```json
{
  "templateName": "ecommerce",
  "clientId": "client_123",
  "clientSiteUrl": "https://example.com",
  "keywords": ["outdoor", "camping", "hiking"]
}
```

### 2. Start the Service

```bash
POST /api/seeding/start/:instanceId
```

### 3. Monitor Status

```bash
GET /api/seeding/status/:instanceId
```

### 4. Get Backlink Report

```bash
POST /api/seeding/backlinks/report/:clientId
```

```json
{
  "clientUrls": [
    "https://example.com",
    "https://example.com/products"
  ]
}
```

## API Reference

### Configuration Management

#### Create Configuration
```
POST /api/seeding/config
```
**Body:**
- `prompt` (optional): Natural language description for AI generation
- `templateName` (optional): Use a predefined template
- `clientId`: Client identifier
- `clientSiteUrl`: Client's website URL
- Custom configuration fields

#### Read Configuration
```
GET /api/seeding/config/:instanceId
```

#### Update Configuration
```
PUT /api/seeding/config/:instanceId
```
**Body:** Configuration fields to update

#### Delete Configuration
```
DELETE /api/seeding/config/:instanceId
```

#### List Configurations
```
GET /api/seeding/config?status=active&clientId=client_123
```

### Service Operations

#### Start Instance
```
POST /api/seeding/start/:instanceId
```

#### Stop Instance
```
POST /api/seeding/stop/:instanceId
```

#### Pause Instance
```
POST /api/seeding/pause/:instanceId
```

#### Resume Instance
```
POST /api/seeding/resume/:instanceId
```

#### Get Status
```
GET /api/seeding/status/:instanceId
```

### Seed Management

#### Add Seed
```
POST /api/seeding/seeds/:instanceId
```
**Body:**
```json
{
  "url": "https://example.com",
  "metadata": {
    "source": "manual",
    "priority": 8,
    "attributes": ["homepage", "main"]
  }
}
```

#### Remove Seed
```
DELETE /api/seeding/seeds/:instanceId
```
**Body:**
```json
{
  "url": "https://example.com"
}
```

#### Get Seeds
```
GET /api/seeding/seeds/:instanceId?status=active&minPriority=5&limit=100
```

### Backlink Services

#### Get Client Backlinks
```
GET /api/seeding/backlinks/:clientId
```

#### Generate Backlink Report
```
POST /api/seeding/backlinks/report/:clientId
```
**Body:**
```json
{
  "clientUrls": ["https://example.com", "https://example.com/about"]
}
```

#### Get Rich Snippet
```
GET /api/seeding/rich-snippets/:encodedUrl?schemaType=Article
```

### Templates

#### Create Template
```
POST /api/seeding/template
```
**Body:**
```json
{
  "name": "my-template",
  "config": {
    "searchDepth": 3,
    "maxSeedsPerInstance": 1000,
    "keywords": ["keyword1", "keyword2"]
  }
}
```

## Configuration Guide

### Basic Configuration

```json
{
  "name": "E-commerce SEO Campaign",
  "description": "URL seeding for outdoor gear store",
  "clientId": "client_123",
  "clientSiteUrl": "https://example.com",
  "maxSeedsPerInstance": 1000,
  "searchDepth": 3,
  "minBacklinkQuality": 0.5,
  "seeds": [
    "https://example.com",
    "https://example.com/products"
  ],
  "keywords": ["outdoor", "camping", "hiking"],
  "topics": ["outdoor-recreation", "camping"],
  "competitors": ["competitor1.com", "competitor2.com"],
  "authorityDomains": ["rei.com", "patagonia.com"]
}
```

### Advanced Configuration

```json
{
  "enableSearchAlgorithms": true,
  "enableRelatedURLDiscovery": true,
  "enableBacklinkGeneration": true,
  "crawlerConfig": {
    "maxDepth": 3,
    "parallelCrawlers": 10,
    "requestDelay": 2000,
    "respectRobotsTxt": true
  },
  "richSnippets": {
    "enabled": true,
    "schemaTypes": ["Product", "Organization", "WebPage"]
  },
  "reportingInterval": 86400000,
  "emailReports": true
}
```

## DeepSeek Integration

The service integrates with DeepSeek AI for intelligent configuration generation.

### Prompt Engineering

Use natural language prompts to generate configurations:

```javascript
const response = await fetch('/api/seeding/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: `Create a comprehensive URL seeding campaign for:
      - Client: Acme Corp
      - Website: https://acmecorp.com
      - Industry: B2B Software
      - Goal: Increase organic traffic and build high-quality backlinks
      - Focus: Enterprise software, productivity tools
      - Competitors: competitor1.com, competitor2.com`,
    clientId: 'acme_corp',
    clientSiteUrl: 'https://acmecorp.com'
  })
});
```

### Workflow Steps

The DeepSeek workflow follows these steps:

1. **Initialize Configuration**: Basic setup and parameters
2. **Generate Initial Seeds**: Discover URLs across categories
3. **Define Search Algorithms**: Configure keyword, topic, and competitor matching
4. **Configure Crawler**: Set crawling parameters
5. **Configure Backlinks**: Set quality thresholds and rich snippets
6. **Configure Reporting**: Set up automated reports
7. **Review and Finalize**: Quality check and optimization

See `workflows/seeding-config-prompts.json` for detailed prompt templates.

## Templates

### Available Templates

#### E-commerce
```json
{
  "templateName": "ecommerce",
  "searchDepth": 3,
  "keywords": ["product", "shop", "buy"],
  "schemaTypes": ["Product", "Organization"]
}
```

#### Blog/Content
```json
{
  "templateName": "blog",
  "searchDepth": 4,
  "keywords": ["blog", "article", "content"],
  "schemaTypes": ["Article", "BlogPosting"]
}
```

#### Local Business
```json
{
  "templateName": "local-business",
  "searchDepth": 2,
  "keywords": ["local", "near-me"],
  "schemaTypes": ["LocalBusiness", "Place"]
}
```

#### SaaS
```json
{
  "templateName": "saas",
  "searchDepth": 3,
  "keywords": ["saas", "software", "platform"],
  "schemaTypes": ["SoftwareApplication", "Product"]
}
```

## Database Schema

The service uses the following tables:

- **url_seeds**: Stores URL seeds for each instance
- **backlinks**: Tracks discovered backlink relationships
- **seeding_configs**: Stores instance configurations
- **backlink_reports**: Generated reports for clients
- **domain_authority**: Cached domain metrics
- **rich_snippets**: Generated schema.org markup

Run the migration:
```bash
psql -U postgres -d lightdom -f migrations/url-seeding-service-schema.sql
```

## Integration with Crawler

The seeding service integrates with the web crawler:

```javascript
// Crawler emits crawled sites
crawler.on('sitesCrawled', (data) => {
  seedingService.discoverRelatedUrls(site.url, site.data);
});

// Seeding service discovers related URLs
seedingService.on('seedAdded', (seed) => {
  crawler.addUrl(seed.url);
});
```

## Startup Integration

The service automatically starts with the main application:

```javascript
// In api-server-express.js
await this.setupURLSeedingServiceRoutes();

// In start-dev.js or start-complete-system.js
// The service is available at /api/seeding/*
```

## Monitoring

### Get Instance Status
```javascript
const status = await fetch('/api/seeding/status/seed_123_abc');
console.log(status);
// {
//   instanceId: 'seed_123_abc',
//   isRunning: true,
//   stats: {
//     totalSeeds: 150,
//     activeSeeds: 142,
//     discoveredUrls: 1250,
//     backlinksMapped: 387,
//     crawledSites: 89
//   }
// }
```

### Real-time Events

The service emits events:
- `started`: Service instance started
- `stopped`: Service instance stopped
- `seedAdded`: New seed added
- `backlinkAdded`: New backlink discovered
- `seedsRefreshed`: Seeds updated

## Best Practices

1. **Start Small**: Begin with a small search depth (2-3) and increase gradually
2. **Quality Over Quantity**: Set appropriate `minBacklinkQuality` (0.5-0.7)
3. **Use Templates**: Start with predefined templates for common use cases
4. **Monitor Performance**: Check instance status regularly
5. **Optimize Keywords**: Use specific, relevant keywords for better results
6. **Respect Robots.txt**: Always keep `respectRobotsTxt: true`
7. **Rate Limiting**: Use appropriate `requestDelay` to avoid overwhelming servers

## Troubleshooting

### Instance Won't Start
- Check configuration is valid
- Ensure database is accessible
- Verify no other instance with same ID is running

### No Seeds Discovered
- Check keyword relevance
- Increase search depth
- Verify crawler is running
- Check URL accessibility

### Low Quality Backlinks
- Increase `minBacklinkQuality` threshold
- Add more authority domains
- Refine keyword list
- Check competitor URLs

## Examples

See `workflows/seeding-config-prompts.json` for complete examples.

### Basic Setup
```javascript
// 1. Create config
const config = await createConfig({
  templateName: 'ecommerce',
  clientId: 'store_123',
  clientSiteUrl: 'https://mystore.com'
});

// 2. Start service
await startInstance(config.instanceId);

// 3. Monitor
const status = await getStatus(config.instanceId);

// 4. Generate report
const report = await generateBacklinkReport('store_123', [
  'https://mystore.com'
]);
```

## Support

For issues and questions:
- Check the API documentation
- Review workflow prompts
- Check service logs
- Contact support team

## License

Copyright © 2024 LightDom. All rights reserved.
