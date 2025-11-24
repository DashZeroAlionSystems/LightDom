# Neural Network Integration Guide

## Overview

This guide provides comprehensive instructions for using the Neural Network Management System integrated with LightDom's crawler, SEO campaigns, and data mining infrastructure.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Dashboard Features](#dashboard-features)
3. [API Endpoints](#api-endpoints)
4. [Database Setup](#database-setup)
5. [Integration Patterns](#integration-patterns)
6. [Training Data](#training-data)
7. [Crawlee + TensorFlow Integration](#crawlee--tensorflow-integration)
8. [SEO Campaign Configuration](#seo-campaign-configuration)
9. [Best Practices](#best-practices)

## Quick Start

### 1. Access the Dashboard

Navigate to `/neural-networks` in the application to access the Neural Network Management Dashboard.

### 2. Create Your First Instance

```javascript
// Via API
POST /api/neural-networks/instances
{
  "clientId": "my-client",
  "name": "SEO Optimizer",
  "modelType": "seo_optimization",
  "description": "Optimize content for search engines",
  "epochs": 50,
  "batchSize": 32,
  "learningRate": 0.001
}
```

### 3. Upload Training Data

```bash
curl -X POST http://localhost:3001/api/neural-networks/datasets/upload \
  -F "instanceId=nn-my-client-seo-optimization-123" \
  -F "datasetName=SEO Training Set" \
  -F "datasetType=training" \
  -F "file=@training-data.csv"
```

### 4. Train the Model

```bash
curl -X POST http://localhost:3001/api/neural-networks/instances/nn-my-client-seo-optimization-123/train
```

## Dashboard Features

### Instance Management

The dashboard provides comprehensive instance management:

- **Create Instances**: Configure new neural network instances with specific model types
- **View Instances**: List all instances with status, performance metrics, and relationships
- **Train Models**: Start training sessions with uploaded datasets
- **Upload Datasets**: Upload CSV, JSON, or TXT files for training
- **Delete Instances**: Archive or remove instances

### Data Streams

Data streams enable data flow between services:

- **Create Streams**: Define source and destination configurations
- **Transform Data**: Apply transformation rules to streaming data
- **Combine Attributes**: Bundle multiple attributes for processing
- **Monitor Metrics**: Track throughput and processing statistics

### Attributes

Attributes define metadata with special capabilities:

- **Algorithm Configuration**: Specify algorithms for processing
- **Data Mining**: Enable data mining capabilities
- **Training Mode**: Configure for neural network training
- **Drill-Down**: Enable hierarchical exploration of related items

### SEO Integration

Special tab for configuring neural networks with SEO campaigns:

- Link neural networks to SEO campaigns
- Configure SEO attributes (meta tags, keywords, backlinks, trust scores)
- Enable crawler optimization
- Setup automated content optimization

## API Endpoints

### Neural Network Instances

```
GET    /api/neural-networks/instances              # List all instances
POST   /api/neural-networks/instances              # Create instance
GET    /api/neural-networks/instances/:id          # Get instance details
PUT    /api/neural-networks/instances/:id          # Update instance
DELETE /api/neural-networks/instances/:id          # Delete instance
POST   /api/neural-networks/instances/:id/train    # Train instance
POST   /api/neural-networks/instances/:id/predict  # Make prediction
GET    /api/neural-networks/model-types            # Get available model types
```

### Data Streams

```
GET    /api/data-streams                    # List all data streams
POST   /api/data-streams                    # Create data stream
GET    /api/data-streams/:id                # Get stream details
PUT    /api/data-streams/:id                # Update stream
DELETE /api/data-streams/:id                # Delete stream
POST   /api/data-streams/:id/start          # Start stream
POST   /api/data-streams/:id/stop           # Stop stream
GET    /api/data-streams/:id/metrics        # Get stream metrics
```

### Attributes

```
GET    /api/attributes                      # List all attributes
POST   /api/attributes                      # Create attribute
GET    /api/attributes/:id                  # Get attribute details
PUT    /api/attributes/:id                  # Update attribute
DELETE /api/attributes/:id                  # Delete attribute
GET    /api/attributes/:id/related          # Get related items
POST   /api/attributes/:id/drill-down       # Perform drill-down
```

### Dataset Upload

```
POST   /api/neural-networks/datasets/upload # Upload training dataset
```

## Database Setup

### Run Migrations

```bash
# Apply neural network category configuration
psql -U your_user -d lightdom_db -f migrations/20251123_neural_network_category_config.sql

# Verify categories
psql -U your_user -d lightdom_db -c "SELECT * FROM categories WHERE category_type IN ('neural_network', 'data_stream')"
```

### Database Functions

#### Link Neural Network to Crawler

```sql
SELECT link_neural_network_to_crawler(
    'nn-instance-id'::UUID,
    'crawler-id'::UUID
);
```

#### Link Neural Network to Seeder

```sql
SELECT link_neural_network_to_seeder(
    'nn-instance-id'::UUID,
    'seeder-id'::UUID
);
```

#### Link Neural Network to Attributes

```sql
SELECT link_neural_network_to_attributes(
    'nn-instance-id'::UUID,
    ARRAY['attr-1'::UUID, 'attr-2'::UUID]
);
```

## Integration Patterns

### Pattern 1: ML-Enhanced Crawler

```javascript
import { TensorFlowEnhancedCrawler } from './src/ml/tensorflow-crawler-integration.js';

const crawler = new TensorFlowEnhancedCrawler({
  enableML: true,
  autoLearn: true,
  minConfidence: 0.7,
  modelPath: './models/seo'
});

await crawler.initialize();

// Crawl with ML enhancement
const results = await crawler.crawlPage(url, html, metadata);
```

### Pattern 2: SEO Attribute Mining

```javascript
// Create SEO attributes
const attributes = [
  {
    name: 'meta_description',
    type: 'seo',
    config: {
      algorithm: 'ranking',
      dataMining: true,
      training: true,
      drillDown: true
    }
  },
  {
    name: 'trust_score',
    type: 'seo',
    config: {
      algorithm: 'classification',
      dataMining: true,
      training: true
    }
  }
];

// Create neural network with attributes
const instance = await createInstance({
  modelType: 'seo_optimization',
  attributeIds: attributes.map(a => a.id)
});
```

### Pattern 3: Data Stream with Combined Attributes

```javascript
// Create data stream combining multiple attributes
const stream = await createDataStream({
  name: 'SEO Data Pipeline',
  source_type: 'crawler',
  destination_type: 'neural_network',
  attribute_ids: ['meta-tags', 'keywords', 'trust-score'],
  transformation_rules: [
    { type: 'filter', condition: 'trust_score > 0.5' },
    { type: 'enrich', source: 'backlinks' },
    { type: 'aggregate', field: 'ranking' }
  ]
});
```

## Training Data

### CSV Format

```csv
url,meta_tags,heading_structure,page_load_time,mobile_friendliness,seo_score
https://example.com,8,4,2.5,0.9,0.85
https://example.org,6,3,3.2,0.8,0.72
```

### JSON Format

```json
[
  {
    "features": {
      "meta_tags": 8,
      "heading_structure": 4,
      "page_load_time": 2.5,
      "mobile_friendliness": 0.9
    },
    "labels": {
      "seo_score": 0.85
    }
  }
]
```

### Upload via API

```bash
curl -X POST http://localhost:3001/api/neural-networks/datasets/upload \
  -H "Content-Type: multipart/form-data" \
  -F "instanceId=nn-123" \
  -F "datasetName=Training Set" \
  -F "datasetType=training" \
  -F "file=@data.csv"
```

## Crawlee + TensorFlow Integration

### Setup Training Data for Crawlee

```javascript
import { TensorFlowEnhancedCrawler } from './src/ml/tensorflow-crawler-integration.js';
import { PlaywrightCrawler } from 'crawlee';

// Create enhanced crawler
const crawler = new TensorFlowEnhancedCrawler({
  enableML: true,
  autoLearn: true,
  minConfidence: 0.7
});

await crawler.initialize();

// Use with Crawlee
const playwrightCrawler = new PlaywrightCrawler({
  async requestHandler({ request, page }) {
    const html = await page.content();
    
    // ML-enhanced analysis
    const analysis = await crawler.crawlPage(
      request.url,
      html,
      { timestamp: Date.now() }
    );
    
    console.log('SEO Score:', analysis.seoScore);
    console.log('ML Confidence:', analysis.mlConfidence);
    console.log('Recommendations:', analysis.recommendations);
  }
});

await playwrightCrawler.run(['https://example.com']);
```

### Continuous Learning

```javascript
// Enable continuous learning
crawler.on('learningProgress', (data) => {
  console.log(`Trained on ${data.batchSize} samples`);
  console.log(`Current accuracy: ${data.accuracy}`);
});

// Monitor metrics
crawler.on('metricsUpdated', (metrics) => {
  console.log('Model metrics:', metrics);
});
```

## SEO Campaign Configuration

### Create SEO-Optimized Neural Network

```javascript
// 1. Create neural network instance
const nn = await createInstance({
  clientId: 'seo-client',
  name: 'SEO Campaign Optimizer',
  modelType: 'seo_optimization',
  metadata: {
    campaign: 'Q4 SEO Push',
    target_keywords: ['web scraping', 'data mining', 'seo tools']
  }
});

// 2. Create SEO attributes
const seoAttributes = [
  { name: 'meta_tags', algorithm: 'ranking', dataMining: true },
  { name: 'keywords', algorithm: 'classification', training: true },
  { name: 'backlinks', algorithm: 'clustering', drillDown: true },
  { name: 'trust_score', algorithm: 'regression', training: true },
  { name: 'ranking', algorithm: 'ranking', dataMining: true }
];

// 3. Link attributes to neural network
await linkAttributes(nn.id, seoAttributes.map(a => a.id));

// 4. Configure crawler integration
await linkToCrawler(nn.id, 'main-crawler-id');

// 5. Configure seeding service
await linkToSeeder(nn.id, 'topic-seeder-id');
```

### SEO Workflow

```
┌─────────────────┐
│  Neural Network │
│   (SEO Model)   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
   ┌─────────┐    ┌──────────┐
   │ Crawler │    │  Seeder  │
   │         │    │          │
   │ Scrapes │◄───┤ Provides │
   │ Content │    │  Topics  │
   └────┬────┘    └──────────┘
        │
        ▼
   ┌─────────────┐
   │ Attributes  │
   │ • Meta Tags │
   │ • Keywords  │
   │ • Trust     │
   │ • Ranking   │
   └─────┬───────┘
         │
         ▼
   ┌──────────────┐
   │ Data Streams │
   │              │
   │ Transforms & │
   │ Aggregates   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Training   │
   │   & Predict  │
   └──────────────┘
```

## Best Practices

### 1. Model Selection

- Use **seo_optimization** for content and ranking optimization
- Use **crawler_optimization** for improving crawl efficiency
- Use **data_mining** for extracting insights from scraped data
- Use **pattern_recognition** for identifying patterns in large datasets

### 2. Training Configuration

```javascript
// Recommended settings for different use cases

// Fast iteration (development)
{
  epochs: 20,
  batchSize: 64,
  learningRate: 0.01
}

// Balanced (production)
{
  epochs: 50,
  batchSize: 32,
  learningRate: 0.001
}

// High accuracy (critical applications)
{
  epochs: 100,
  batchSize: 16,
  learningRate: 0.0001
}
```

### 3. Data Quality

- Ensure minimum 1000 training samples per model type
- Validate data consistency before upload
- Use balanced datasets (avoid class imbalance)
- Include validation split (recommended: 20%)

### 4. Monitoring

```javascript
// Monitor instance performance
const metrics = await fetch(`/api/neural-networks/instances/${id}`);
const { performance } = await metrics.json();

console.log('Accuracy:', performance.accuracy);
console.log('Loss:', performance.loss);
console.log('Predictions:', performance.predictionCount);

// Monitor data streams
const streamMetrics = await fetch(`/api/data-streams/${streamId}/metrics`);
const stream = await streamMetrics.json();

console.log('Records processed:', stream.total_records_processed);
console.log('Last processed:', stream.last_processed_at);
```

### 5. Relationships

- Link crawlers to neural networks for ML-enhanced scraping
- Link seeders to neural networks for intelligent topic generation
- Link attributes to neural networks for feature engineering
- Use data streams to combine and transform attribute data

## Troubleshooting

### Issue: Training fails with "Insufficient training data"

**Solution**: Upload more training samples (minimum 1000 rows recommended)

### Issue: Low accuracy after training

**Solution**: 
- Check data quality and balance
- Increase epochs and adjust learning rate
- Add more diverse training samples

### Issue: Prediction errors

**Solution**:
- Verify model status is 'ready'
- Ensure input format matches training data
- Check model type matches use case

### Issue: Data stream not processing

**Solution**:
- Verify stream status is 'active'
- Check source and destination configurations
- Review transformation rules for errors

## Support

For additional help:
- Review `NEURAL_NETWORK_MODULARIZATION_GUIDE.md` for architecture details
- Check `NEURAL_NETWORK_INTEGRATION.md` for integration patterns
- See example configurations in `config/neural-networks/`
- Review API implementation in `api/neural-network-routes.js`

## Next Steps

1. Create your first neural network instance
2. Upload training data
3. Train the model
4. Integrate with crawler and SEO campaigns
5. Monitor performance and iterate
