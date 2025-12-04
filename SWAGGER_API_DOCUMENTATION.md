# Swagger API Documentation System

## Overview

LightDom now includes a comprehensive, enterprise-level Swagger/OpenAPI documentation system with advanced features including:

- **Dynamic API Documentation** - Automatically discovers and documents all API endpoints
- **Per-Client Swagger Instances** - Each client can have their own customized API documentation
- **Service-Specific Documentation** - Filter docs by service (SEO, Crawler, Blockchain, etc.)
- **Security Schemes** - Supports API Key, Bearer Token, OAuth2, and Client ID authentication
- **Example Configurations** - Every endpoint includes detailed request/response examples
- **Real-time Updates** - Documentation automatically refreshes as APIs change

## Quick Start

### Access Main Documentation

The main Swagger UI is available at:

```
http://localhost:3001/api-docs
```

### Access Client-Specific Documentation

Each client can access their customized documentation:

```
http://localhost:3001/api-docs/client/:clientId
```

Replace `:clientId` with your actual client identifier (e.g., `client-abc-456`).

### Access Service-Specific Documentation

View documentation for a specific service:

```
http://localhost:3001/api-docs/service/seo
http://localhost:3001/api-docs/service/crawler
http://localhost:3001/api-docs/service/blockchain
http://localhost:3001/api-docs/service/analytics
http://localhost:3001/api-docs/service/rag
```

### Get OpenAPI JSON Specification

Download the raw OpenAPI specification:

```
http://localhost:3001/api-docs/swagger.json
http://localhost:3001/api/openapi.json
```

## Configuration

### Client Configuration

Client-specific Swagger instances are controlled via the `allowClientSwagger` configuration:

```javascript
// Example client configuration
{
  "clientId": "client-abc-456",
  "allowClientSwagger": true,  // Enable Swagger for this client
  "enabledServices": ["seo", "analytics"],  // Only show these services
  "apiKey": "your-api-key-here",
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  }
}
```

### Service Configuration

Services can be enabled/disabled per client. Available services:

1. **SEO** - SEO header script injection and optimization
2. **Crawler** - Web crawler and DOM harvesting
3. **Blockchain** - Blockchain mining and proof of optimization
4. **Analytics** - Usage analytics and metrics
5. **RAG** - Retrieval Augmented Generation chat system

## SEO Header Script Injection Service

### Overview

The SEO Header Script Injection service allows clients to inject customized SEO optimization scripts into their websites to improve search engine rankings and performance.

### Key Features

- **Dynamic Script Generation** - Scripts are generated per-client with custom strategies
- **Meta Tag Optimization** - Automatically optimizes meta tags, Open Graph, and Twitter Card tags
- **Structured Data Injection** - Adds JSON-LD structured data for enhanced search results
- **Analytics Integration** - Tracks page views, engagement, and performance metrics
- **Performance Monitoring** - Monitors page load times and user interactions

### API Endpoints

#### Inject SEO Script

**POST** `/api/seo/header-script/inject`

Generate and inject a customized SEO script for a client's website.

**Headers:**
- `X-API-Key`: Your API key
- `X-Client-Id`: Your client identifier

**Request Body:**
```json
{
  "domain": "example.com",
  "strategy": {
    "keywords": ["web optimization", "performance", "seo"],
    "metadata": {
      "title": "Example Site - Optimized",
      "description": "High-performance website",
      "ogTitle": "Example Site",
      "ogDescription": "Optimized web experience",
      "ogImage": "https://example.com/og-image.jpg",
      "twitterCard": "summary_large_image",
      "twitterTitle": "Example Site",
      "twitterDescription": "Optimized web experience"
    },
    "structuredData": {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Example Site",
      "url": "https://example.com"
    }
  },
  "options": {
    "async": true,
    "defer": false,
    "position": "head"
  }
}
```

**Response:**
```json
{
  "success": true,
  "scriptUrl": "https://cdn.lightdom.io/seo-scripts/client-abc-456-seo-strategy-789.js",
  "scriptTag": "<script async src=\"https://cdn.lightdom.io/seo-scripts/client-abc-456-seo-strategy-789.js\"></script>",
  "strategyId": "seo-strategy-789",
  "message": "SEO script injected successfully"
}
```

#### Get SEO Strategy

**GET** `/api/seo/header-script/strategy/:clientId`

Retrieve the current SEO optimization strategy for a client.

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "success": true,
  "strategy": {
    "id": "seo-strategy-789",
    "clientId": "client-abc-456",
    "domain": "example.com",
    "keywords": ["web optimization", "performance"],
    "metadata": { /* ... */ },
    "structuredData": { /* ... */ },
    "createdAt": "2025-12-03T20:00:00Z",
    "updatedAt": "2025-12-03T20:00:00Z"
  }
}
```

#### Update SEO Strategy

**PUT** `/api/seo/header-script/strategy/:strategyId`

Update an existing SEO optimization strategy.

**Headers:**
- `X-API-Key`: Your API key
- `X-Client-Id`: Your client identifier

**Request Body:**
```json
{
  "keywords": ["new", "keywords"],
  "metadata": {
    "title": "Updated Title"
  }
}
```

### Usage Example

1. **Generate Script:**
   ```bash
   curl -X POST http://localhost:3001/api/seo/header-script/inject \
     -H "X-API-Key: your-api-key" \
     -H "X-Client-Id: client-abc-456" \
     -H "Content-Type: application/json" \
     -d '{
       "domain": "example.com",
       "strategy": {
         "keywords": ["web optimization"],
         "metadata": {
           "title": "Example Site"
         }
       },
       "options": {
         "async": true
       }
     }'
   ```

2. **Add to Website:**
   Copy the returned `scriptTag` and add it to your website's `<head>` section:
   ```html
   <head>
     <!-- ... other tags ... -->
     <script async src="https://cdn.lightdom.io/seo-scripts/client-abc-456-seo-strategy-789.js"></script>
   </head>
   ```

3. **Monitor Performance:**
   The script will automatically:
   - Optimize meta tags
   - Inject structured data
   - Track page views and engagement
   - Monitor performance metrics

## Authentication

### API Key Authentication

Include your API key in the header:
```
X-API-Key: your-api-key-here
```

### Client ID Authentication

For client-specific operations, include your client ID:
```
X-Client-Id: client-abc-456
```

### Bearer Token Authentication

For user-specific operations:
```
Authorization: Bearer your-jwt-token
```

### OAuth2 Authentication

Use OAuth2 for advanced authentication workflows. See Swagger UI for interactive OAuth flow.

## Architecture

### Components

1. **Swagger Configuration** (`config/swagger-config.js`)
   - Base OpenAPI specification
   - Security schemes
   - Component schemas
   - Service definitions

2. **Swagger Service** (`services/swagger-service.js`)
   - Dynamic endpoint discovery
   - Client-specific spec generation
   - Service filtering
   - UI rendering

3. **SEO Header Script Service** (`services/seo-header-script-service.js`)
   - Script generation
   - Strategy management
   - Analytics tracking
   - Performance monitoring

4. **API Routes** (`api/seo-header-script-routes.js`)
   - Express route handlers
   - Request validation
   - Response formatting

### Data Flow

```
Client Request
    ↓
API Gateway (Express)
    ↓
Authentication Middleware
    ↓
Route Handler
    ↓
SEO Header Script Service
    ↓
Script Generation
    ↓
File System Storage
    ↓
Response with Script URL
```

## Development

### Adding New Endpoints

To add documentation for new endpoints, use JSDoc annotations:

```javascript
/**
 * @swagger
 * /api/my-endpoint:
 *   get:
 *     tags: [MyService]
 *     summary: My endpoint
 *     description: Detailed description
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/my-endpoint', (req, res) => {
  // handler
});
```

### Refreshing Documentation

The Swagger service automatically refreshes when the server restarts. To manually refresh:

```javascript
await swaggerService.refresh();
```

### Testing

Test the Swagger UI locally:
```bash
npm start
# Navigate to http://localhost:3001/api-docs
```

Test API endpoints:
```bash
# Using the Swagger UI "Try it out" feature
# Or using curl:
curl -X POST http://localhost:3001/api/seo/header-script/inject \
  -H "X-API-Key: test-key" \
  -H "X-Client-Id: test-client" \
  -H "Content-Type: application/json" \
  -d '{"domain":"test.com","strategy":{"keywords":["test"]}}'
```

## Per-Client Access Control

### Enabling Client Swagger

To enable Swagger for a specific client:

1. Set `allowClientSwagger: true` in client configuration
2. Define `enabledServices` array with allowed services
3. Client can access docs at `/api-docs/client/:clientId`

### Disabling Client Swagger

To disable Swagger for a client:

1. Set `allowClientSwagger: false` in client configuration
2. Client will receive 403 Forbidden when accessing client docs

### Example Client Configuration

```javascript
// In database or configuration system
{
  "clientId": "premium-client-123",
  "allowClientSwagger": true,
  "enabledServices": ["seo", "analytics", "crawler"],
  "apiKey": "premium-api-key",
  "rateLimit": {
    "windowMs": 60000,
    "max": 1000
  }
}

{
  "clientId": "basic-client-456",
  "allowClientSwagger": false,
  "enabledServices": ["seo"],
  "apiKey": "basic-api-key",
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  }
}
```

## Security

### Rate Limiting

All API endpoints are rate-limited based on client configuration. Default limits:
- Window: 15 minutes
- Max requests: 100 per window

### API Key Management

- API keys should be stored securely (environment variables, secrets manager)
- Keys should be rotated regularly
- Invalid keys receive 401 Unauthorized
- Rate limit exceeded receives 429 Too Many Requests

### CORS

CORS is configured to allow requests from authorized origins only. Configure via environment:
```
FRONTEND_URL=https://yourdomain.com
```

## Monitoring

### Analytics Tracking

The SEO header script automatically tracks:
- Page views
- User engagement time
- Performance metrics (load time, DOM interactive time)
- Custom events

View analytics:
```
GET /api/analytics/metrics?clientId=client-abc-456
```

### Health Checks

Check service health:
```bash
# Main API health
curl http://localhost:3001/api/health

# SEO service health
curl http://localhost:3001/api/seo/header-script/health
```

## Troubleshooting

### Swagger UI Not Loading

1. Check server logs for errors
2. Ensure port 3001 is accessible
3. Clear browser cache
4. Verify Swagger packages are installed: `npm list swagger-jsdoc swagger-ui-express`

### Client Docs Show 403 Forbidden

1. Verify `allowClientSwagger` is `true` for client
2. Check client ID is correct
3. Ensure client exists in configuration

### SEO Script Not Working

1. Verify script tag is in `<head>` section
2. Check browser console for errors
3. Ensure correct script URL
4. Verify domain matches configuration

### No Analytics Data

1. Check network requests in browser DevTools
2. Verify analytics endpoint is accessible
3. Ensure client ID header is sent
4. Check server logs for errors

## Support

For issues or questions:
- Email: support@lightdom.io
- Documentation: https://docs.lightdom.io
- GitHub: https://github.com/DashZeroAlionSystems/LightDom

## License

Private Use - See LICENSE_PRIVATE_USE.md
