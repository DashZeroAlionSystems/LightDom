# Quick Reference: Auto-Generated CRUD System

## 🚀 Quick Start

### 1. Run Migrations
```bash
npm run db:migrate:all
```

### 2. Check Status
```bash
npm run db:migrate:check
```

### 3. List All Migrations
```bash
npm run db:migrate:list
```

## 📊 Tables Overview

| Category | Table | Base Path | Primary Key |
|----------|-------|-----------|-------------|
| **Neural Networks** | neural_network_instances | /api/auto/neural-networks/instances | instance_id |
| | neural_network_training_sessions | /api/auto/neural-networks/training-sessions | session_id |
| | neural_network_predictions | /api/auto/neural-networks/predictions | prediction_id |
| **Data Mining** | data_mining_jobs | /api/auto/data-mining/jobs | job_id |
| | data_mining_results | /api/auto/data-mining/results | result_id |
| | data_mining_schedules | /api/auto/data-mining/schedules | schedule_id |
| **Training Data** | training_datasets | /api/auto/training/datasets | dataset_id |
| | training_records | /api/auto/training/records | record_id |
| | training_metrics | /api/auto/training/metrics | metric_id |
| **Services** | service_definitions | /api/auto/services/definitions | service_id |
| | service_health_checks | /api/auto/services/health-checks | check_id |
| | service_logs | /api/auto/services/logs | log_id |
| **Seeding** | seeding_strategies | /api/auto/seeding/strategies | strategy_id |
| | seed_quality_metrics | /api/auto/seeding/quality-metrics | metric_id |
| **Attributes** | attribute_templates | /api/auto/attributes/templates | template_id |
| | attribute_extraction_history | /api/auto/attributes/extraction-history | history_id |

## 🔌 API Operations

All tables support these operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auto/{path} | Create new record |
| GET | /api/auto/{path} | List records (paginated) |
| GET | /api/auto/{path}/:id | Get single record |
| PUT | /api/auto/{path}/:id | Update record (full) |
| PATCH | /api/auto/{path}/:id | Update record (partial) |
| DELETE | /api/auto/{path}/:id | Delete record |
| POST | /api/auto/{path}/bulk | Bulk create records |

## 🔍 Query Parameters

### List Endpoint Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| page | integer | 1 | Page number | ?page=2 |
| limit | integer | 50 | Items per page (max 100) | ?limit=25 |
| sort | string | created_at | Sort field | ?sort=updated_at |
| order | string | DESC | Sort order (ASC/DESC) | ?order=ASC |
| search | string | - | Search in searchable fields | ?search=test |
| {filter_field} | string | - | Filter by field value | ?status=active |

## 📝 Example API Calls

### Create Neural Network Instance
```bash
curl -X POST http://localhost:3001/api/auto/neural-networks/instances \
  -H "Content-Type: application/json" \
  -d '{
    "instance_id": "nn-001",
    "client_id": "client-123",
    "name": "My Neural Network",
    "model_type": "classification"
  }'
```

### List Data Mining Jobs (with filters)
```bash
curl "http://localhost:3001/api/auto/data-mining/jobs?page=1&limit=10&status=running&sort=created_at&order=DESC"
```

### Get Single Training Dataset
```bash
curl http://localhost:3001/api/auto/training/datasets/dataset-001
```

### Update Service Definition
```bash
curl -X PATCH http://localhost:3001/api/auto/services/definitions/service-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Delete Seeding Strategy
```bash
curl -X DELETE http://localhost:3001/api/auto/seeding/strategies/strategy-001
```

### Bulk Create Training Records
```bash
curl -X POST http://localhost:3001/api/auto/training/records/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "record_id": "rec-001",
        "dataset_id": "dataset-001",
        "split_type": "train",
        "features": {"x": 1},
        "labels": {"y": 0}
      },
      {
        "record_id": "rec-002",
        "dataset_id": "dataset-001",
        "split_type": "train",
        "features": {"x": 2},
        "labels": {"y": 1}
      }
    ]
  }'
```

## 🎯 Common Use Cases

### Neural Networks

```javascript
// Create instance
const instance = await fetch('/api/auto/neural-networks/instances', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instance_id: 'nn-client-001',
    client_id: 'client-123',
    name: 'Sentiment Classifier',
    model_type: 'classification'
  })
}).then(r => r.json());

// Create training session
const session = await fetch('/api/auto/neural-networks/training-sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'session-001',
    instance_id: 'nn-client-001',
    epochs_planned: 100,
    batch_size: 32,
    learning_rate: 0.001
  })
}).then(r => r.json());

// Store prediction
const prediction = await fetch('/api/auto/neural-networks/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prediction_id: 'pred-001',
    instance_id: 'nn-client-001',
    input_features: { text: 'Great product!' },
    prediction_result: { sentiment: 'positive' },
    confidence: 0.95
  })
}).then(r => r.json());
```

### Data Mining

```javascript
// Create job
const job = await fetch('/api/auto/data-mining/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    job_id: 'job-001',
    name: 'Scrape Product Data',
    job_type: 'web_scraping',
    source_config: {
      url: 'https://example.com',
      selectors: { title: 'h1.title', price: '.price' }
    }
  })
}).then(r => r.json());

// Get job with progress
const status = await fetch('/api/auto/data-mining/jobs/job-001')
  .then(r => r.json());

console.log(`Progress: ${status.data.processed_items}/${status.data.total_items}`);
```

### Training Data

```javascript
// Create dataset
const dataset = await fetch('/api/auto/training/datasets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataset_id: 'dataset-001',
    name: 'SEO Classification Dataset',
    dataset_type: 'classification',
    domain: 'seo',
    task: 'page_quality_prediction'
  })
}).then(r => r.json());

// Add training records
const records = await fetch('/api/auto/training/records/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [/* array of records */]
  })
}).then(r => r.json());
```

## 🛠️ Integration Code

### Add to api-server-express.js

```javascript
// In setupRoutes() method, add:
try {
  const { createAutoGeneratedCrudRoutes, getApiDocumentation } = 
    await import('./services/auto-crud-integration.js');
  
  const autoCrudRouter = createAutoGeneratedCrudRoutes(this.db);
  this.app.use('/api/auto', autoCrudRouter);
  
  this.app.get('/api/auto-crud/docs', (req, res) => {
    res.json(getApiDocumentation(this.db));
  });
  
  console.log('✅ Auto-CRUD routes mounted at /api/auto');
} catch (error) {
  console.warn('⚠️  Auto-CRUD unavailable:', error.message);
}
```

## 📊 Useful Views

Access pre-built views for common queries:

### Active Neural Networks
```sql
SELECT * FROM v_active_neural_networks;
```

### Mining Job Summary
```sql
SELECT * FROM v_mining_job_summary WHERE status = 'running';
```

### Training Dataset Overview
```sql
SELECT * FROM v_training_dataset_overview;
```

### Service Health Dashboard
```sql
SELECT * FROM v_service_health_dashboard;
```

## 🔧 Troubleshooting

### Check if tables exist
```bash
psql -U postgres -d dom_space_harvester -c "\dt neural_network*"
```

### Verify migration status
```bash
npm run db:migrate:check
```

### View migration history
```sql
SELECT * FROM schema_migrations ORDER BY executed_at DESC;
```

### Test API endpoint
```bash
curl http://localhost:3001/api/auto-crud/routes
```

## 📚 Documentation Links

- **Full Guide**: `COMPREHENSIVE_SYSTEM_TABLES_MIGRATION_GUIDE.md`
- **Integration Examples**: `examples/auto-crud-integration-examples.js`
- **Migration Script**: `migrations/20251116_comprehensive_system_tables.sql`
- **Migration Runner**: `scripts/run-all-migrations.js`
- **Auto-CRUD Generator**: `services/enhanced-auto-crud-generator.js`
- **Integration Module**: `services/auto-crud-integration.js`

## 🎯 Response Format

All endpoints return consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": { /* single object or array */ },
  "pagination": { /* for list endpoints */
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🚀 Performance Tips

1. **Use pagination** - Don't fetch all records at once
2. **Filter early** - Apply filters to reduce result set
3. **Index usage** - All common filters have indexes
4. **Bulk operations** - Use bulk create for multiple records
5. **Specific fields** - Request only needed fields when possible
6. **Cache results** - Cache frequently accessed data
7. **Connection pooling** - Already configured in the system
8. **Batch requests** - Combine multiple operations when possible

## 💡 Pro Tips

- Use `search` parameter for fuzzy matching across multiple fields
- Combine `filter` + `sort` + `pagination` for optimal queries
- Check `v_*` views for pre-aggregated data
- Use `PATCH` instead of `PUT` for partial updates
- Monitor `service_health_checks` for system status
- Track `training_metrics` during model training
- Use `seed_quality_metrics` to optimize crawling
- Store `attribute_templates` for reusable patterns

## 🎉 That's it!

You now have 16 tables with 100+ auto-generated CRUD endpoints ready to use!
