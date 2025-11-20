# SEO Attributes System - Quick Start Guide

## Installation & Setup

### Prerequisites
- PostgreSQL 12+ running
- Node.js 20+
- Database credentials configured in environment

### Quick Setup (One Command)

```bash
# Complete setup: migration, population, and demo
node scripts/setup-seo-attributes-system.js
```

This script will:
1. ✅ Check database connection
2. ✅ Run database migration (create tables)
3. ✅ Populate 206 SEO attributes
4. ✅ Create demo campaign
5. ✅ Add critical attributes to demo
6. ✅ Add seed URLs
7. ✅ Show system statistics

### Manual Setup (Step by Step)

```bash
# 1. Run migration
psql -U postgres -d lightdom -f migrations/20251116_seo_attribute_system.sql

# 2. Populate attributes
node scripts/populate-seo-attributes.js

# 3. (Optional) Create demo campaign
node scripts/setup-seo-attributes-system.js
```

## Quick API Examples

### Start the API Server

```bash
npm run api
# Server runs on http://localhost:3001
```

### List All Attributes

```bash
curl http://localhost:3001/api/seo/attributes | jq .
```

### Get Critical Attributes Only

```bash
curl "http://localhost:3001/api/seo/attributes?importance=critical" | jq .
```

### Get Attributes by Category

```bash
curl "http://localhost:3001/api/seo/attributes?category=meta" | jq .
```

### Create a Campaign

```bash
curl -X POST http://localhost:3001/api/seo/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SEO Campaign",
    "description": "Website optimization",
    "target_keywords": ["keyword1", "keyword2"],
    "target_urls": ["https://example.com"],
    "industry": "technology",
    "active_mining": true,
    "status": "active"
  }' | jq .
```

### Add Attributes to Campaign

```bash
curl -X POST http://localhost:3001/api/seo/campaigns/CAMPAIGN_ID/attributes \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": [
      {
        "attribute_key": "title",
        "enabled": true,
        "mine_actively": true,
        "mining_priority": 10
      },
      {
        "attribute_key": "metaDescription",
        "enabled": true,
        "mine_actively": true,
        "mining_priority": 10
      }
    ]
  }' | jq .
```

### Add Seed URLs

```bash
curl -X POST http://localhost:3001/api/seo/campaigns/CAMPAIGN_ID/seed-urls \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      {
        "url": "https://example.com",
        "url_type": "target",
        "priority": 10,
        "crawl_frequency": "daily"
      }
    ]
  }' | jq .
```

### Get Campaign Statistics

```bash
curl http://localhost:3001/api/seo/campaigns/CAMPAIGN_ID/stats | jq .
```

## Configuration Files

### Attribute Configuration
**Location**: `config/seo-attributes.json`

Structure:
```json
{
  "attributes": {
    "title": {
      "id": 1,
      "category": "meta",
      "selector": "title",
      "type": "string",
      "mlWeight": 0.15,
      "validation": { ... },
      "scraping": { ... },
      "training": { ... },
      "seeding": { ... }
    }
  }
}
```

## Key Concepts

### Attributes
206 predefined SEO data points organized into 12 categories:
- meta, headings, content, links, images
- structured_data, performance, accessibility
- url_structure, social, security, scores

### Campaigns
Organize attributes for specific clients or projects:
- Select which attributes to track
- Set priorities and mining algorithms
- Define target URLs and keywords
- Enable neural network optimization

### Seed URLs
URLs to crawl for attribute data:
- Priority-based scheduling
- Configurable crawl frequency
- Target specific attributes per URL

### Active Mining
Automated attribute extraction:
- Scheduled background jobs
- Neural network optimization
- Quality scoring
- Comprehensive logging

## Database Tables

### Core Tables
- `seo_attribute_definitions` - All 206 attributes
- `seo_campaigns` - Campaign definitions
- `campaign_attributes` - Campaign-attribute links
- `attribute_seed_urls` - URLs to crawl

### Tracking Tables
- `attribute_extraction_logs` - Extraction history
- `nn_training_data` - Training data
- `seo_workflow_runs` - Workflow executions

### Views
- `v_campaign_attributes_full` - Full attribute details
- `v_active_campaigns` - Active campaign summaries
- `v_attribute_performance` - Performance metrics

## Common Tasks

### View Statistics

```sql
-- Attributes by category
SELECT category, COUNT(*) 
FROM seo_attribute_definitions 
WHERE active = TRUE 
GROUP BY category;

-- Campaign summary
SELECT * FROM v_active_campaigns;

-- Recent extractions
SELECT * 
FROM attribute_extraction_logs 
ORDER BY extracted_at DESC 
LIMIT 10;
```

### Enable/Disable Attributes

```bash
# Toggle attribute active status
curl -X PATCH http://localhost:3001/api/seo/attributes/title/toggle | jq .
```

### Bulk Update Attributes

```bash
curl -X POST http://localhost:3001/api/seo/attributes/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"attribute_key": "title", "importance": "critical"},
      {"attribute_key": "metaDescription", "importance": "critical"}
    ]
  }' | jq .
```

## Monitoring

### Check System Health

```bash
# Attribute statistics
curl http://localhost:3001/api/seo/attributes-stats | jq .

# Campaign statistics  
curl http://localhost:3001/api/seo/campaigns/CAMPAIGN_ID/stats | jq .
```

### View Extraction Logs

```sql
-- Recent successful extractions
SELECT url, attribute_key, quality_score, extracted_at
FROM attribute_extraction_logs
WHERE success = TRUE
ORDER BY extracted_at DESC
LIMIT 20;

-- Failed extractions
SELECT url, attribute_key, error_message
FROM attribute_extraction_logs
WHERE success = FALSE
ORDER BY extracted_at DESC
LIMIT 20;
```

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql -U postgres -d lightdom -c "SELECT 1"

# Check tables exist
psql -U postgres -d lightdom -c "\dt seo_*"
```

### No Attributes Found

```bash
# Repopulate attributes
node scripts/populate-seo-attributes.js
```

### Migration Issues

```bash
# Drop and recreate (WARNING: loses data)
psql -U postgres -d lightdom -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run setup
node scripts/setup-seo-attributes-system.js
```

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=postgres

# API Server
API_PORT=3001
NODE_ENV=development
```

## File Structure

```
config/
  seo-attributes.json          # 206 attribute definitions

migrations/
  20251116_seo_attribute_system.sql  # Database schema

scripts/
  generate-seo-attributes-config.py  # Generate config
  populate-seo-attributes.js         # Populate database
  setup-seo-attributes-system.js     # Complete setup

api/
  seo-attribute-crud-routes.js       # Attribute CRUD
  seo-campaign-management-routes.js  # Campaign management
  attribute-config-routes.ts         # Config API (existing)

services/
  active-data-mining-service.js      # Mining orchestration
  attribute-config-loader.ts         # Config loader (existing)

SEO_ATTRIBUTES_SYSTEM.md       # Full documentation
SEO_ATTRIBUTES_QUICKSTART.md   # This file
```

## Next Steps

1. **Integrate with Crawler**
   - Update `extractAttribute()` in mining service
   - Use Puppeteer/Playwright for DOM access
   - Implement selectors from config

2. **Enable Neural Network**
   - Implement training loop
   - Use `nn_training_data` table
   - Optimize extraction algorithms

3. **Build Dashboard**
   - Create React UI for management
   - Visualize statistics
   - Configure campaigns visually

4. **Add Reporting**
   - Generate SEO audit reports
   - Track improvement over time
   - Export results

## Resources

- Full Documentation: `SEO_ATTRIBUTES_SYSTEM.md`
- API Reference: See documentation
- Database Schema: `migrations/20251116_seo_attribute_system.sql`
- GitHub Issues: Report bugs and feature requests

## Support

For questions or issues:
1. Check `SEO_ATTRIBUTES_SYSTEM.md` for detailed docs
2. Review extraction logs in database
3. Enable debug logging in services
4. Check API endpoint responses

## License

MIT License - See project LICENSE file
