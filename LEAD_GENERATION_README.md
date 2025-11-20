# Lead Generation System

## Overview

The Lead Generation System automatically captures, enriches, scores, and manages leads from crawler campaigns, SEO campaigns, and other data sources. It integrates seamlessly with the existing crawler infrastructure.

## Features

- ✅ **Automatic Lead Capture**: Captures leads from crawler campaign results
- ✅ **Lead Scoring**: Calculates 0-100 score based on available information
- ✅ **Quality Classification**: Categorizes leads as high, medium, or low quality
- ✅ **Email Extraction**: Automatically extracts emails from crawled pages
- ✅ **Contact Enrichment**: Extracts names, companies, and other details
- ✅ **Duplicate Detection**: Prevents duplicate leads, updates existing ones
- ✅ **Activity Tracking**: Logs all interactions with leads
- ✅ **Tags & Categories**: Organize leads with tags
- ✅ **Assignment**: Assign leads to sales reps or team members
- ✅ **Source Tracking**: Tracks which campaigns generate leads
- ✅ **Real-time Updates**: WebSocket integration for live updates
- ✅ **REST API**: Full CRUD operations via `/api/leads`

## Database Schema

### Tables

1. **leads** - Main leads table with contact info, scoring, and tracking
2. **lead_sources** - Tracks lead sources and performance metrics
3. **lead_activities** - Records all interactions with leads
4. **lead_tags** - Tags for categorizing leads

### Views

1. **lead_statistics** - Overall lead statistics
2. **lead_source_performance** - Source performance metrics
3. **assigned_leads_summary** - Summary by assigned user

## API Endpoints

### Get Leads

```http
GET /api/leads?status=new&quality=high&page=1&limit=50
```

Query parameters:
- `status` - Filter by status (new, contacted, qualified, converted, lost)
- `quality` - Filter by quality (high, medium, low)
- `sourceType` - Filter by source type (crawler_campaign, seo_campaign, etc.)
- `sourceId` - Filter by specific campaign ID
- `assignedTo` - Filter by assigned user
- `minScore` - Minimum lead score
- `search` - Search email, name, or company
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - Sort order (ASC/DESC, default: DESC)

Response:
```json
{
  "leads": [
    {
      "id": 1,
      "email": "contact@example.com",
      "name": "John Doe",
      "company": "Example Corp",
      "score": 85,
      "quality": "high",
      "status": "new",
      "source_type": "crawler_campaign",
      "source_id": "campaign_123",
      "created_at": "2025-11-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### Get Lead by ID

```http
GET /api/leads/:id
```

Response includes activities and tags:
```json
{
  "id": 1,
  "email": "contact@example.com",
  "name": "John Doe",
  "activities": [
    {
      "activity_type": "lead_captured",
      "activity_description": "New lead captured",
      "created_at": "2025-11-20T10:00:00Z"
    }
  ],
  "tags": ["enterprise", "high-priority"]
}
```

### Create Lead

```http
POST /api/leads
Content-Type: application/json

{
  "email": "jane@company.com",
  "name": "Jane Smith",
  "company": "Company Inc",
  "phone": "555-1234",
  "website": "https://company.com",
  "jobTitle": "CEO",
  "sourceType": "manual",
  "sourceId": "admin_entry"
}
```

### Update Lead

```http
PATCH /api/leads/:id
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "phone": "555-5678"
}
```

### Update Lead Status

```http
PATCH /api/leads/:id/status
Content-Type: application/json

{
  "status": "qualified"
}
```

### Assign Lead

```http
POST /api/leads/:id/assign
Content-Type: application/json

{
  "userId": "sales@company.com"
}
```

### Add Tags

```http
POST /api/leads/:id/tags
Content-Type: application/json

{
  "tags": ["enterprise", "hot-lead", "tech-industry"]
}
```

### Log Activity

```http
POST /api/leads/:id/activity
Content-Type: application/json

{
  "activityType": "email_sent",
  "description": "Sent introduction email",
  "data": {
    "subject": "Introduction to our services",
    "template": "intro_v1"
  }
}
```

### Get Statistics

```http
GET /api/leads/statistics
```

Response:
```json
{
  "total_leads": 500,
  "new_leads": 250,
  "qualified_leads": 150,
  "converted_leads": 75,
  "high_quality_leads": 200,
  "average_score": 65.5,
  "unique_sources": 10,
  "leads_last_7_days": 50,
  "leads_last_30_days": 200
}
```

### Get Source Performance

```http
GET /api/leads/source-performance
```

Response:
```json
[
  {
    "source_type": "crawler_campaign",
    "source_id": "campaign_123",
    "total_leads": 150,
    "converted": 45,
    "conversion_rate": 30.00,
    "avg_lead_score": 72.5,
    "high_quality_count": 80,
    "last_lead_captured": "2025-11-20T15:30:00Z"
  }
]
```

### Bulk Import

```http
POST /api/leads/bulk-import
Content-Type: application/json

{
  "leads": [
    {
      "email": "lead1@example.com",
      "name": "Lead One",
      "company": "Company A"
    },
    {
      "email": "lead2@example.com",
      "name": "Lead Two",
      "company": "Company B"
    }
  ],
  "sourceType": "csv_import",
  "sourceId": "import_2025_11_20"
}
```

Response:
```json
{
  "total": 2,
  "success": 2,
  "failed": 0,
  "errors": []
}
```

### Capture from Crawler

```http
POST /api/leads/capture-from-crawler
Content-Type: application/json

{
  "campaignId": "campaign_123",
  "results": [
    {
      "url": "https://example.com/about",
      "content": "Contact us at info@example.com",
      "title": "About Us",
      "timestamp": "2025-11-20T10:00:00Z"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "captured": 1,
  "leads": [
    {
      "id": 101,
      "email": "info@example.com",
      "company": "Example",
      "score": 55,
      "quality": "medium"
    }
  ]
}
```

## Automatic Integration with Campaigns

The system automatically integrates with crawler campaigns through event listeners:

### When a Campaign Starts
- Lead source is registered in the database
- System is ready to capture leads from this campaign

### When a Campaign Stops
- All final results are processed for leads
- Lead source statistics are updated

### When Crawler Results Arrive
- Emails are automatically extracted from page content
- Names and company information are extracted when available
- Leads are scored and classified
- Duplicate detection prevents redundant entries

## Lead Scoring Algorithm

Leads are scored 0-100 based on:

- Email present: 10 points (required)
- Name present: 15 points
- Company present: 20 points
- Phone present: 15 points
- Website present: 15 points
- Job title present: 15 points
- Professional email domain (not Gmail/Yahoo/etc.): 10 bonus points

**Quality Classification:**
- **High**: Score >= 75
- **Medium**: Score >= 50
- **Low**: Score < 50

## Email Extraction

The system uses regex patterns to extract emails from crawled page content:

```javascript
/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
```

Additional extraction logic:
- Name extraction from common patterns (Contact, Author, etc.)
- Company extraction from URL domain or page content

## Real-time Updates

When leads are captured, the system emits WebSocket events:

```javascript
// Lead captured
socket.on('lead:captured', (lead) => {
  console.log('New lead:', lead);
});

// Lead updated
socket.on('lead:updated', (lead) => {
  console.log('Lead updated:', lead);
});

// Lead status changed
socket.on('lead:status_changed', (lead) => {
  console.log('Status changed:', lead);
});

// Campaign leads captured
socket.on('campaign:leads_captured', (data) => {
  console.log(`Campaign ${data.campaignId} captured ${data.leadsCount} leads`);
});
```

## Usage Examples

### Example 1: Create a Crawler Campaign with Lead Capture

```javascript
// Create campaign
const response = await fetch('/api/campaigns/create-from-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Find contact information from tech companies',
    clientSiteUrl: 'https://example.com'
  })
});

const campaign = await response.json();

// Start campaign
await fetch(`/api/campaigns/${campaign.data.id}/start`, {
  method: 'POST'
});

// Leads are automatically captured as the campaign runs

// Later, get leads from this campaign
const leadsResponse = await fetch(
  `/api/leads?sourceType=crawler_campaign&sourceId=${campaign.data.id}`
);
const leads = await leadsResponse.json();
console.log(`Captured ${leads.pagination.total} leads`);
```

### Example 2: Manually Process Crawler Results

```javascript
const crawlerResults = [
  {
    url: 'https://company.com/about',
    content: 'Contact: info@company.com, CEO: John Doe',
    title: 'About Company',
    timestamp: new Date()
  }
];

const response = await fetch('/api/leads/capture-from-crawler', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'manual_capture_001',
    results: crawlerResults
  })
});

const result = await response.json();
console.log(`Captured ${result.captured} leads`);
```

### Example 3: Manage Leads Lifecycle

```javascript
// Get high-quality new leads
const newLeads = await fetch('/api/leads?status=new&quality=high&limit=10');

// Assign lead to sales rep
await fetch('/api/leads/1/assign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'sales@company.com' })
});

// Log contact activity
await fetch('/api/leads/1/activity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    activityType: 'email_sent',
    description: 'Sent initial outreach email'
  })
});

// Update status after qualification
await fetch('/api/leads/1/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'qualified' })
});

// Add tags
await fetch('/api/leads/1/tags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tags: ['enterprise', 'decision-maker'] })
});
```

## Database Migration

To set up the lead generation system, run the migration:

```sql
-- Run the migration file
psql -U postgres -d dom_space_harvester -f migrations/20251120_create_leads_system.sql
```

Or use the application's migration system if available.

## Configuration

The system is automatically initialized when the API server starts with a database connection:

```javascript
// In api-server-express.js
import { initializeCampaignLeadIntegration } from './services/campaign-lead-integration.js';

// During startup (if database is available)
const integration = initializeCampaignLeadIntegration(db, io);
```

## Performance Considerations

1. **Indexing**: The migration creates indexes on commonly queried fields
2. **GIN Indexes**: JSON fields are indexed for fast queries
3. **Triggers**: Automatic timestamp updates via database triggers
4. **Views**: Pre-computed statistics via database views
5. **Pagination**: All list endpoints support pagination

## Future Enhancements

Potential improvements:
- [ ] ML-based lead scoring
- [ ] Email validation and verification
- [ ] LinkedIn/social media enrichment integration
- [ ] CRM integration (Salesforce, HubSpot, etc.)
- [ ] Email campaign integration
- [ ] Advanced deduplication with fuzzy matching
- [ ] Lead lifecycle automation workflows
- [ ] Predictive conversion scoring

## Support

For issues or questions:
1. Check the API endpoints documentation above
2. Review the service code in `services/lead-generation-service.js`
3. Examine the database schema in `migrations/20251120_create_leads_system.sql`
4. Test with `test-lead-generation.js`
