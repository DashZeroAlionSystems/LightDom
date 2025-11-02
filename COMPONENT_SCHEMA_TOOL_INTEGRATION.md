# Component Schema Tool - Integration Guide

## Quick Integration Steps

### 1. Database Setup

Run the database migration to create all required tables:

```bash
psql -U postgres -d lightdom -f database/140-component-analysis-schema.sql
```

This creates:
- 11 tables for component tracking
- 5 views for common queries
- 2 utility functions
- Pre-loaded SEO research data (8 categories)
- Component-to-SEO mappings (10 mappings)

### 2. Verify API Routes

The component analyzer routes are automatically registered when the API server starts. Verify by checking the server logs for:

```
Component analyzer routes registered
```

### 3. Access the Dashboard

Navigate to:
```
http://localhost:3000/dashboard/component-schema
```

Or use the admin menu navigation.

### 4. Test the Service

Run the demo script:

```bash
npm run component:analyze https://example.com
```

Expected output:
- Screenshot captured
- Components extracted
- Atom components generated
- Analysis saved to database
- Summary statistics

### 5. API Health Check

```bash
curl http://localhost:3001/api/component-analyzer/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-02T09:33:00.000Z"
}
```

## Integration with Existing Features

### Schema Linking Service

The component analyzer extends the existing schema linking service:

```javascript
// Existing schema linking
import SchemaLinkingService from './services/schema-linking-service.js';

// New component analyzer
import ComponentAnalyzerService from './services/component-analyzer-service.js';

// Use together
const schemaService = new SchemaLinkingService();
const componentService = new ComponentAnalyzerService();

await schemaService.analyzeDatabaseSchema();
await componentService.analyzeUrl('https://myapp.com');

// Both services complement each other
// Schema linking: Database tables → Features → Dashboards
// Component analyzer: URL → DOM components → Atom components
```

### SEO Service

Integrates with the SEO service for optimization:

```javascript
// Component analyzer finds SEO components
const result = await componentService.analyzeUrl('https://mysite.com');

// Extract SEO data
const seoComponents = result.components.filter(c => 
  c.seoProperties.isHeading || 
  c.seoProperties.isLink || 
  c.seoProperties.isImage
);

// Get SEO recommendations
const response = await fetch('/api/component-analyzer/seo/research?category=technical-seo');
const recommendations = await response.json();
```

## Workflow Examples

### Example 1: Build Component Library

```bash
# 1. Analyze your app pages
npm run component:analyze https://myapp.com/dashboard
npm run component:analyze https://myapp.com/settings
npm run component:analyze https://myapp.com/profile

# 2. Query high-reuse components
curl "http://localhost:3001/api/component-analyzer/components?minReuseScore=80"

# 3. Export to library
curl -X POST http://localhost:3001/api/component-analyzer/library \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Button Primary",
    "componentType": "button",
    "framework": "react",
    "template": {...}
  }'
```

### Example 2: SEO Audit

```bash
# 1. Analyze competitor
npm run component:analyze https://competitor.com

# 2. Get SEO analysis
curl "http://localhost:3001/api/component-analyzer/seo/components?category=technical-seo"

# 3. Get recommendations
curl "http://localhost:3001/api/component-analyzer/seo/research?impact=critical"

# 4. Apply to your site
# Use SEO Settings Dashboard: http://localhost:3000/dashboard/component-schema
```

### Example 3: Automated Dashboard Generation

```javascript
// 1. Analyze source page
const analysis = await fetch('/api/component-analyzer/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://source.com' })
}).then(r => r.json());

// 2. Extract high-quality components
const components = await fetch(
  `/api/component-analyzer/components?` +
  `analysis_id=${analysis.data.analysisId}&` +
  `minReuseScore=70&maxComplexityScore=50`
).then(r => r.json());

// 3. Generate dashboard
const dashboard = await fetch('/api/component-analyzer/dashboards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Auto-Generated Dashboard',
    analysisId: analysis.data.analysisId,
    dashboardType: 'admin',
    layoutType: 'grid',
    components: components.data
  })
}).then(r => r.json());

// 4. Use dashboard schema
console.log('Dashboard created:', dashboard.data.schema_id);
```

### Example 4: Continuous Monitoring

```javascript
// Set up automated analysis workflow
const workflow = await fetch('/api/component-analyzer/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Daily Component Audit',
    workflowType: 'scheduled',
    scheduleCron: '0 0 * * *', // Daily at midnight
    targetUrls: [
      'https://myapp.com/dashboard',
      'https://myapp.com/settings'
    ],
    processingSteps: [
      { type: 'analyze', config: { fullPage: true } },
      { type: 'extract', config: { minReuseScore: 60 } },
      { type: 'notify', config: { email: 'team@myapp.com' } }
    ]
  })
});
```

## Troubleshooting

### Puppeteer Issues

If screenshot capture fails:

```bash
# Check Chrome/Chromium is installed
which google-chrome

# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or use custom executable
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Database Connection

If API returns 500 errors:

```bash
# Check database is running
pg_isready -h localhost -p 5434

# Verify tables exist
psql -U postgres -d lightdom -c "\dt"

# Look for component_analyses, atom_components, etc.
```

### Port Conflicts

If API won't start:

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

## Advanced Configuration

### Custom Screenshot Settings

```javascript
const service = new ComponentAnalyzerService();
await service.initialize();

// High-res screenshots
await service.analyzeUrl('https://mysite.com', {
  viewport: { width: 2560, height: 1440 },
  waitFor: 5000, // Wait 5s for animations
  fullPage: true
});

// Mobile screenshots
await service.analyzeUrl('https://mysite.com', {
  viewport: { width: 375, height: 667 }, // iPhone SE
  waitFor: 2000
});
```

### Custom Component Classification

Extend the component classifier:

```javascript
// In component-analyzer-service.js
classifyComponent(component) {
  const type = component.type;
  
  // Add custom classifications
  if (component.classList.some(c => c.startsWith('my-custom-'))) {
    return 'Custom Component';
  }
  
  // Call default classifier
  return super.classifyComponent(component);
}
```

### Custom SEO Rules

Add to database:

```sql
INSERT INTO seo_research_data (research_id, topic, category, best_practices, impact_level)
VALUES (
  'my_custom_seo',
  'Custom SEO Rule',
  'technical-seo',
  '[{"practice": "My custom practice", "priority": "high"}]'::jsonb,
  'high'
);
```

## Performance Optimization

### Concurrent Analysis

```javascript
// Analyze multiple URLs in parallel
const urls = [
  'https://myapp.com/page1',
  'https://myapp.com/page2',
  'https://myapp.com/page3'
];

const results = await Promise.all(
  urls.map(url => service.analyzeUrl(url))
);
```

### Caching

```javascript
// Check if URL was recently analyzed
const existing = await fetch(
  `/api/component-analyzer/analyses?url=${encodeURIComponent(url)}`
).then(r => r.json());

if (existing.data.length > 0) {
  const lastAnalysis = existing.data[0];
  const hoursSince = (Date.now() - new Date(lastAnalysis.captured_at)) / 3600000;
  
  if (hoursSince < 24) {
    // Use cached analysis
    console.log('Using cached analysis');
  }
}
```

## Best Practices

1. **Run migrations first** - Always run database migrations before using the service
2. **Use environment variables** - Never hardcode database credentials
3. **Rate limit API** - Add rate limiting in production
4. **Clean up screenshots** - Implement retention policy for screenshot files
5. **Monitor disk space** - Screenshots can consume significant space
6. **Index database** - Ensure indexes are created for performance
7. **Validate inputs** - Always validate URLs before analysis
8. **Handle errors** - Implement proper error handling and retries
9. **Log operations** - Use the audit log table for tracking
10. **Security scan** - Run CodeQL before deploying to production

## Support

For issues or questions:
- Check logs in `data/component-analysis/`
- Review database logs
- Check API server logs
- Consult `COMPONENT_SCHEMA_TOOL_README.md`

---

**Ready to use!** Start analyzing components and building better dashboards. 🚀
