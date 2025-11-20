# Complete System Seed Data - Quick Reference

## Overview

The `seed-complete-system.js` script populates your database with all 192+ SEO attributes and creates four pre-configured campaigns for different use cases.

## Quick Start

### One Command Setup

```bash
# Complete database seeding
npm run seo:seed
```

or

```bash
node scripts/seed-complete-system.js
```

## What Gets Created

### 1. All SEO Attributes (206)

All attributes from `config/seo-attributes.json` are inserted into `seo_attribute_definitions` table with:
- Scraping configuration (selectors, methods, fallbacks)
- Validation rules (required, lengths, patterns)
- ML training config (weights, importance, normalization)
- SEO optimization rules
- Seeding configuration

### 2. Four Pre-Configured Campaigns

#### Crawler Campaign
**Purpose**: Web crawling operations - extracts core page structure and content

**Attributes**: 
- All meta attributes (title, description, etc.)
- All heading attributes (H1-H6)
- All link attributes
- URL structure attributes
- Core content metrics

**Seed URLs**:
- `https://example.com` (target, daily)
- `https://example.com/sitemap.xml` (reference, daily)
- `https://example.com/blog` (target, daily)

**Configuration**:
- Active Mining: ✅ Yes
- Neural Network: ❌ No (rule-based extraction)

#### Seeding Campaign
**Purpose**: URL seeding and discovery - finds and prioritizes crawlable URLs

**Attributes**:
- All link attributes
- URL structure attributes
- Canonical and alternate links
- Sitemap references

**Seed URLs**:
- `https://example.com` (target, hourly, depth: 5)
- `https://example.com/sitemap.xml` (reference, hourly)
- `https://example.com/robots.txt` (reference, daily)

**Configuration**:
- Active Mining: ✅ Yes
- Neural Network: ❌ No
- Depth Limit: 5 (discovers more URLs)

#### Data Streams Campaign
**Purpose**: Comprehensive data collection - extracts ALL attributes

**Attributes**: All 206 attributes

**Seed URLs**:
- `https://example.com` (target, hourly)
- `https://example.com/api` (target, hourly)
- `https://example.com/feed` (target, hourly)
- `https://example.com/data` (target, daily)

**Configuration**:
- Active Mining: ✅ Yes
- Neural Network: ✅ Yes (learns extraction patterns)
- Frequency: Hourly for most URLs

#### SEO Campaign
**Purpose**: SEO optimization - monitors and improves search ranking factors

**Attributes**:
- All critical and high importance attributes
- All score attributes (SEO, quality, technical)
- Structured data attributes
- Accessibility attributes
- Performance attributes
- Security attributes

**Seed URLs**:
- `https://example.com` (target, daily)
- `https://example.com/products` (target, daily)
- `https://example.com/services` (target, daily)
- `https://example.com/about` (target, weekly)
- `https://competitor1.com` (competitor, weekly)
- `https://competitor2.com` (competitor, weekly)

**Configuration**:
- Active Mining: ✅ Yes
- Neural Network: ✅ Yes
- Includes competitor analysis

## Database Tables Populated

1. **seo_attribute_definitions** - 206 attributes
2. **seo_campaigns** - 4 campaigns
3. **campaign_attributes** - Attribute-campaign links
4. **attribute_seed_urls** - All seed URLs with scheduling

## Customizing Campaigns

### Modify Existing Campaigns

Edit the campaign configurations in `scripts/seed-complete-system.js`:

```javascript
await createCampaign(client, {
  name: 'Your Campaign Name',
  description: 'Campaign description',
  targetKeywords: ['keyword1', 'keyword2'],
  targetUrls: ['https://yoursite.com'],
  industry: 'your-industry',
  attributeKeys: [...], // Attribute keys to include
  seedUrls: [...],      // URLs to crawl
  neuralNetworkEnabled: true,
  activeMining: true
});
```

### Add Your Own Campaign

Add a new campaign block in the seeding script:

```javascript
// Step 6: Create Custom Campaign
const customAttributes = [
  'title', 'metaDescription', 'h1Text',
  'wordCount', 'imageCount', 'linkCount'
];

await createCampaign(client, {
  name: 'Custom Campaign',
  description: 'My custom SEO campaign',
  targetKeywords: ['custom', 'keywords'],
  targetUrls: ['https://mysite.com'],
  industry: 'technology',
  attributeKeys: customAttributes,
  seedUrls: [
    { url: 'https://mysite.com', type: 'target', priority: 10, frequency: 'daily' }
  ],
  neuralNetworkEnabled: false,
  activeMining: true
});
```

## Attribute Filters

The script uses filter functions to select attributes:

```javascript
// Get all meta attributes
getAttributesByFilter(config, { category: 'meta' })

// Get critical attributes only
getAttributesByFilter(config, { importance: 'critical' })

// Get high-weight attributes
getAttributesByFilter(config, { minWeight: 0.10 })

// Combine filters
const attrs = [
  ...getAttributesByFilter(config, { category: 'meta' }),
  ...getAttributesByFilter(config, { importance: 'critical' })
];
```

## Post-Seeding Steps

### 1. Verify the Data

```bash
# Check attributes
psql -U postgres -d lightdom -c "SELECT COUNT(*) FROM seo_attribute_definitions;"

# Check campaigns
psql -U postgres -d lightdom -c "SELECT name, campaign_id FROM seo_campaigns;"

# Check campaign attributes
psql -U postgres -d lightdom -c "SELECT campaign_id, COUNT(*) as attrs FROM campaign_attributes GROUP BY campaign_id;"
```

### 2. Start Services

```bash
# Start API server
npm run api

# Start mining service
node services/active-data-mining-service.js
```

### 3. Test the API

```bash
# List all campaigns
curl http://localhost:3001/api/seo/campaigns | jq .

# Get campaign details
curl http://localhost:3001/api/seo/campaigns/{CAMPAIGN_ID} | jq .

# Get campaign attributes
curl http://localhost:3001/api/seo/campaigns/{CAMPAIGN_ID}/attributes | jq .

# Get campaign statistics
curl http://localhost:3001/api/seo/campaigns/{CAMPAIGN_ID}/stats | jq .
```

## Updating Seed URLs

To change the seed URLs for your actual use case, edit the URLs in each campaign:

```javascript
seedUrls: [
  { 
    url: 'https://your-actual-site.com',
    type: 'target',           // 'target', 'competitor', 'reference'
    priority: 10,             // 1-10, higher = more important
    frequency: 'daily',       // 'hourly', 'daily', 'weekly', 'monthly'
    depthLimit: 3            // How many levels deep to crawl
  }
]
```

## Re-running the Script

The script is **idempotent** - safe to run multiple times:
- Attributes are updated if they exist, inserted if new
- Campaigns are skipped if they already exist
- Campaign attributes use `ON CONFLICT DO NOTHING`
- Seed URLs use `ON CONFLICT DO NOTHING`

To completely reset:

```bash
# Drop and recreate (WARNING: deletes all data)
psql -U postgres -d lightdom -c "TRUNCATE seo_campaigns CASCADE;"
psql -U postgres -d lightdom -c "TRUNCATE seo_attribute_definitions CASCADE;"

# Then re-run seeding
npm run seo:seed
```

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -U postgres

# Verify credentials
psql -U postgres -d lightdom -c "SELECT 1"
```

### Missing Tables

```bash
# Run migration first
psql -U postgres -d lightdom -f migrations/20251116_seo_attribute_system.sql
```

### Import Errors

```bash
# Make sure pg package is installed
npm install pg
```

## Environment Variables

```bash
# Database configuration
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lightdom
export DB_USER=postgres
export DB_PASSWORD=postgres
```

## Statistics After Seeding

The script displays comprehensive statistics:

```
📊 Final System Statistics
=====================================================================

📋 Attributes:
   Total:      206
   Active:     206
   Critical:   XX
   High:       XX

📁 Attributes by Category:
   meta                  40
   headings              20
   content               30
   links                 25
   images                20
   structured_data       15
   performance           15
   accessibility         10
   url_structure         10
   social                 8
   security               8
   scores                 5

🎯 Campaigns Created:

   Crawler Campaign
     Campaign ID:     campaign_crawler_campaign_xxxxx
     Attributes:      XX
     Seed URLs:       3
     Neural Network:  No
     Active Mining:   Yes

   Seeding Campaign
     Campaign ID:     campaign_seeding_campaign_xxxxx
     Attributes:      XX
     Seed URLs:       3
     Neural Network:  No
     Active Mining:   Yes

   Data Streams Campaign
     Campaign ID:     campaign_data_streams_campaign_xxxxx
     Attributes:      206
     Seed URLs:       4
     Neural Network:  Yes
     Active Mining:   Yes

   SEO Campaign
     Campaign ID:     campaign_seo_campaign_xxxxx
     Attributes:      XX
     Seed URLs:       6
     Neural Network:  Yes
     Active Mining:   Yes

🌱 Total Seed URLs:
   Total:         16
   Targets:       XX
   Competitors:   XX
   References:    XX
```

## Integration with Existing Code

The script uses:
- `config/seo-attributes.json` - Attribute definitions
- `generateSEORules()` from `populate-seo-attributes.js` - SEO rule generation
- Database schema from `migrations/20251116_seo_attribute_system.sql`

## Next Steps

1. **Customize URLs**: Replace example.com with your actual domains
2. **Adjust Frequencies**: Change crawl frequencies based on content update patterns
3. **Add/Remove Attributes**: Modify attribute lists per campaign
4. **Start Mining**: Launch the active data mining service
5. **Monitor Results**: Check extraction logs and statistics
6. **Train Models**: Use collected data for neural network training

## Support

- Full Documentation: `SEO_ATTRIBUTES_SYSTEM.md`
- Quick Start: `SEO_ATTRIBUTES_QUICKSTART.md`
- Database Schema: `migrations/20251116_seo_attribute_system.sql`
