# SEO Attributes System Documentation

## Overview

The SEO Attributes System is a comprehensive platform for managing, extracting, and optimizing 206 SEO attributes across client websites. It provides:

- **206 SEO Attributes** with comprehensive rules and validation
- **Campaign Management** for organizing SEO optimization efforts
- **Active Data Mining** with neural network optimization
- **Workflow Automation** for scheduled extraction and analysis
- **Data Streams** for continuous attribute monitoring
- **DOM Manipulation** for injecting SEO-friendly content

## Architecture

### Core Components

1. **Attribute Definitions** (`seo_attribute_definitions`)
   - Master configuration of all 206 SEO attributes
   - Categories: meta, headings, content, links, images, structured_data, performance, accessibility, url_structure, social, security, scores
   - Each attribute includes:
     - Scraping configuration (selector, method, fallback)
     - Validation rules (required, min/max lengths, patterns)
     - ML training configuration (weight, importance, normalization)
     - SEO rules for optimization

2. **Campaigns** (`seo_campaigns`)
   - Organize attributes into campaigns
   - Target specific clients, keywords, and URLs
   - Enable neural network optimization
   - Configure active mining rules

3. **Campaign Attributes** (`campaign_attributes`)
   - Link attributes to campaigns
   - Override default configurations per campaign
   - Enable/disable attributes
   - Configure data streams
   - Set mining priorities

4. **Workflows** (`seo_workflows`)
   - Automate extraction and optimization processes
   - Schedule runs via cron or event triggers
   - Track execution history and results

5. **Seed URLs** (`attribute_seed_urls`)
   - URLs to crawl for attribute data
   - Prioritization and scheduling
   - Target specific attributes per URL

6. **Data Mining Service**
   - Orchestrates extraction across campaigns
   - Integrates with crawler for DOM parsing
   - Validates extracted data
   - Logs all extraction attempts
   - Feeds neural network training data

## Database Schema

### Main Tables

- `seo_attribute_definitions` - Attribute configurations
- `seo_campaigns` - Campaign definitions
- `campaign_attributes` - Campaign-attribute links
- `attribute_data_streams` - Data stream definitions
- `seo_workflows` - Workflow configurations
- `seo_workflow_runs` - Workflow execution history
- `attribute_seed_urls` - URLs to crawl
- `nn_training_data` - Neural network training data
- `dom_manipulation_rules` - DOM injection rules
- `attribute_extraction_logs` - Extraction logs

### Views

- `v_campaign_attributes_full` - Attributes with full definitions
- `v_active_campaigns` - Active campaigns with counts
- `v_attribute_performance` - Performance metrics

## API Endpoints

### Attributes CRUD

```
GET    /api/seo/attributes              - List all attributes
GET    /api/seo/attributes/:key         - Get specific attribute
POST   /api/seo/attributes              - Create new attribute
PUT    /api/seo/attributes/:key         - Update attribute
DELETE /api/seo/attributes/:key         - Delete attribute
GET    /api/seo/attributes-stats        - Get statistics
PATCH  /api/seo/attributes/:key/toggle  - Toggle active status
POST   /api/seo/attributes/bulk-update  - Bulk update
```

### Campaign Management

```
GET    /api/seo/campaigns                              - List campaigns
GET    /api/seo/campaigns/:id                          - Get campaign
POST   /api/seo/campaigns                              - Create campaign
PUT    /api/seo/campaigns/:id                          - Update campaign
DELETE /api/seo/campaigns/:id                          - Delete campaign
GET    /api/seo/campaigns/:id/attributes               - Get campaign attributes
POST   /api/seo/campaigns/:id/attributes               - Add attributes
DELETE /api/seo/campaigns/:id/attributes/:key          - Remove attribute
GET    /api/seo/campaigns/:id/seed-urls                - Get seed URLs
POST   /api/seo/campaigns/:id/seed-urls                - Add seed URLs
GET    /api/seo/campaigns/:id/stats                    - Get campaign stats
```

### Configuration API (Existing)

```
GET    /api/seo/attribute-config                       - Get all configs
GET    /api/seo/attribute-config/:name                 - Get config by name
GET    /api/seo/attribute-config/category/:category    - Get by category
GET    /api/seo/attribute-config/importance/:level     - Get by importance
GET    /api/seo/attribute-config/critical              - Get critical attrs
GET    /api/seo/attribute-config/stats                 - Get config stats
POST   /api/seo/attribute-config/validate              - Validate value
POST   /api/seo/attribute-config/reload                - Reload config
```

## Usage Examples

### 1. Create a Campaign

```javascript
POST /api/seo/campaigns

{
  "name": "Acme Corp SEO Campaign",
  "description": "E-commerce site optimization",
  "client_id": 123,
  "target_keywords": ["widgets", "premium widgets", "buy widgets"],
  "target_urls": ["https://acme.com"],
  "industry": "e-commerce",
  "active_mining": true,
  "neural_network_enabled": true,
  "status": "active"
}
```

### 2. Add Attributes to Campaign

```javascript
POST /api/seo/campaigns/campaign_xxx/attributes

{
  "attributes": [
    {
      "attribute_key": "title",
      "enabled": true,
      "mine_actively": true,
      "mining_priority": 10,
      "mining_algorithm": "neural"
    },
    {
      "attribute_key": "metaDescription",
      "enabled": true,
      "mine_actively": true,
      "mining_priority": 10
    },
    {
      "attribute_key": "h1Text",
      "enabled": true,
      "mine_actively": true,
      "mining_priority": 9
    }
  ]
}
```

### 3. Add Seed URLs

```javascript
POST /api/seo/campaigns/campaign_xxx/seed-urls

{
  "urls": [
    {
      "url": "https://acme.com",
      "url_type": "target",
      "priority": 10,
      "depth_limit": 3,
      "crawl_frequency": "daily"
    },
    {
      "url": "https://competitor.com",
      "url_type": "competitor",
      "priority": 5,
      "crawl_frequency": "weekly"
    }
  ]
}
```

### 4. Query Attributes

```javascript
// Get all critical attributes
GET /api/seo/attributes?importance=critical&active=true

// Get meta category attributes
GET /api/seo/attributes?category=meta

// Search attributes
GET /api/seo/attributes?search=title&page=1&limit=20
```

## Attribute Categories

### 1. Meta (40 attributes)
- Title, description, keywords
- Open Graph tags
- Twitter Card tags
- Language and charset
- Icons and manifests

### 2. Headings (20 attributes)
- H1-H6 counts and text
- Heading hierarchy validation
- Keyword usage in headings

### 3. Content (30 attributes)
- Word count and readability
- Paragraph and list counts
- Keyword density
- Content quality scores

### 4. Links (25 attributes)
- Internal/external link counts
- Link quality and anchor text
- Broken links detection
- Link ratios

### 5. Images (20 attributes)
- Alt text coverage
- Image optimization
- Responsive images
- Lazy loading

### 6. Structured Data (15 attributes)
- Schema.org types
- JSON-LD validation
- Rich snippet eligibility

### 7. Performance (15 attributes)
- Resource counts
- Loading optimization
- Critical rendering path

### 8. Accessibility (10 attributes)
- ARIA attributes
- Color contrast
- Mobile-friendliness

### 9. URL Structure (10 attributes)
- URL depth and length
- SEO-friendly URLs
- HTTPS usage

### 10. Social (8 attributes)
- Social media links
- Share buttons
- Social presence

### 11. Security (8 attributes)
- HTTPS enforcement
- Mixed content
- Security headers

### 12. Scores (5 attributes)
- SEO score
- Content quality score
- Technical score
- Overall score
- Mobile score

## Active Mining Workflow

1. **Scheduler** runs at configured intervals
2. **Campaign Selection** - finds active campaigns with mining enabled
3. **URL Selection** - gets pending seed URLs based on priority
4. **Attribute Loading** - loads attributes marked for active mining
5. **Extraction** - uses crawler to extract attribute values
6. **Validation** - validates extracted values against rules
7. **Quality Scoring** - calculates quality score for extraction
8. **Logging** - logs all extraction attempts
9. **Training Data** - stores successful extractions for neural network
10. **Scheduling** - calculates next crawl time based on frequency

## Neural Network Integration

When enabled, the system:
- Collects training data from successful extractions
- Learns optimal extraction patterns
- Adapts scraping strategies based on success rates
- Predicts best selectors for new pages
- Optimizes extraction algorithms

## DOM Manipulation

The system can inject SEO-friendly attributes:

```javascript
{
  "rule_type": "inject",
  "target_selector": "head",
  "transformation_script": "addMetaTag('description', 'Optimized description')",
  "conditions": [
    {
      "attribute": "metaDescription",
      "operator": "missing"
    }
  ]
}
```

## Configuration

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=postgres
```

### Config File

All attributes are defined in `config/seo-attributes.json` with:
- Selectors for extraction
- Validation rules
- ML weights and importance
- Training configuration
- Seeding parameters

## Setup Instructions

### 1. Generate Configuration

```bash
cd scripts
python3 generate-seo-attributes-config.py
```

### 2. Run Database Migration

```bash
psql -U postgres -d lightdom -f migrations/20251116_seo_attribute_system.sql
```

### 3. Populate Attributes

```bash
node scripts/populate-seo-attributes.js
```

### 4. Start Services

```bash
# Start API server (includes attribute endpoints)
npm run api

# Start mining service
node services/active-data-mining-service.js
```

## Performance Monitoring

The system tracks:
- Extraction success/failure rates
- Average extraction times
- Quality scores per attribute
- Campaign performance metrics
- Workflow execution statistics

Access metrics via:
```
GET /api/seo/campaigns/:id/stats
GET /api/seo/attributes-stats
```

## Extending the System

### Add New Attributes

1. Update `config/seo-attributes.json`
2. Run `populate-seo-attributes.js`
3. Configure in campaigns

### Add Custom Extraction Logic

Implement in the crawler service with custom selectors and transformations.

### Add New Mining Algorithms

Extend `active-data-mining-service.js` with new algorithm implementations.

## Best Practices

1. **Prioritize Critical Attributes** - Focus mining on high-importance attributes
2. **Balance Load** - Limit concurrent mining jobs to avoid overwhelming servers
3. **Validate Everything** - Use strict validation rules to ensure data quality
4. **Monitor Performance** - Track extraction times and success rates
5. **Use Neural Networks** - Enable for continuous optimization
6. **Schedule Wisely** - Adjust crawl frequencies based on content update patterns
7. **Test DOM Rules** - Always test manipulation rules before deployment

## Troubleshooting

### Low Extraction Success Rate
- Check selector accuracy in attribute definitions
- Verify target URLs are accessible
- Review validation rules for strictness
- Check crawler configuration

### Slow Extraction
- Reduce concurrent jobs
- Optimize selectors
- Enable caching
- Use more efficient scraping methods

### Quality Score Issues
- Review validation rules
- Check for missing required fields
- Verify data types match expectations
- Adjust quality scoring algorithm

## Support

For issues or questions:
- Check extraction logs: `attribute_extraction_logs`
- Review campaign stats: `/api/seo/campaigns/:id/stats`
- Monitor workflow runs: `seo_workflow_runs`
- Enable debug logging in services
