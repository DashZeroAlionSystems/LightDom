# Neural Network Web Crawler Integration Guide

## 🎯 Overview

Comprehensive TensorFlow-based web crawling system with neural network integration for large-scale SEO campaign data mining. This system provides:

- **TensorFlow.js Integration**: Both Node.js (tfjs-node) and browser (tfjs) support
- **Brain.js Fallback**: Lightweight alternative for browser environments
- **192 Attribute Mining**: Complete SEO attribute extraction and streaming
- **Data Stream Management**: Real-time attribute-level data streaming
- **Neural Network Training**: Continuous learning from crawled data
- **Campaign Management**: End-to-end SEO campaign orchestration
- **Monitoring & Metrics**: Comprehensive system observability

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@tensorflow/tfjs` - TensorFlow.js for browser
- `@tensorflow/tfjs-node` - TensorFlow.js for Node.js (better performance)
- `brain.js` - Lightweight neural network library (fallback)

### 2. Database Setup

The system automatically creates required tables on initialization, but you can run migrations manually:

```bash
# Run database migrations
npm run db:migrate

# Or using psql
psql -U postgres -d lightdom -f database/migrations/210-attribute-config-and-models.sql
```

### 3. Configuration

Create or update `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom

# API Configuration
API_PORT=3001
WS_URL=ws://localhost:3002

# Neural Network Configuration
ENABLE_TENSORFLOW=true
ENABLE_BRAINJS=true
MODEL_ARCHITECTURE=sequential

# Crawler Configuration
MAX_CONCURRENT_CRAWLS=10
CRAWL_INTERVAL=3600000
CONTINUOUS_CRAWLING=true

# Data Stream Configuration
ENABLE_DATA_STREAMS=true
STREAM_PROTOCOL=websocket
STREAM_BUFFER_SIZE=1000

# Monitoring
ENABLE_MONITORING=true
MONITORING_INTERVAL=30000
```

## 🚀 Quick Start

### 1. Start the Integrated Service

```bash
# Start API server with neural SEO campaigns
node api-server-express.js
```

### 2. Create a Campaign

```bash
curl -X POST http://localhost:3001/api/neural-seo/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-seo-campaign",
    "type": "continuous",
    "startUrls": [
      "https://example.com",
      "https://example.com/about"
    ]
  }'
```

### 3. Monitor Campaign

```bash
# Get campaign status
curl http://localhost:3001/api/neural-seo/campaigns/<campaign-id>

# Get monitoring metrics
curl http://localhost:3001/api/neural-seo/monitoring

# Get crawl results
curl http://localhost:3001/api/neural-seo/campaigns/<campaign-id>/results
```

## 📊 Data Streams

### Creating Data Streams

Data streams allow you to bundle attributes and stream data in real-time.

#### Single Attribute Stream

```javascript
import AttributeDataStreamService from './services/attribute-data-stream-service.js';

const streamService = new AttributeDataStreamService();
await streamService.initialize();

// Create stream for single attribute
const stream = await streamService.createAttributeStream('title', {
  name: 'title-stream'
});
```

#### Bundled Attribute Stream

```javascript
// Create stream for multiple attributes
const stream = await streamService.createBundledStream(
  'seo-meta-stream',
  ['title', 'metaDescription', 'metaKeywords', 'canonical']
);
```

### Pushing Data to Streams

```javascript
// Push data to stream
await streamService.pushToStream(stream.id, {
  title: 'Example Page Title',
  metaDescription: 'This is an example page description',
  metaKeywords: 'example, page, keywords',
  canonical: 'https://example.com/page'
});
```

### Subscribing to Streams

```javascript
// Subscribe to real-time updates
streamService.subscribe(stream.id, (message) => {
  console.log('New data:', message.data);
  console.log('Timestamp:', message.timestamp);
});
```

## 🧠 Neural Network Training

### Creating Neural Network Instance

```javascript
import NeuralCrawlerOrchestrator from './services/neural-crawler-orchestrator.js';

const orchestrator = new NeuralCrawlerOrchestrator({
  enableTensorFlow: true,
  enableBrainJS: true // Fallback
});

await orchestrator.initialize();

// Create neural instance
const instance = await orchestrator.createNeuralInstance({
  name: 'seo-optimizer',
  modelType: 'sequential',
  inputDimensions: 192,
  hiddenLayers: [256, 128, 64],
  outputDimensions: 50,
  learningRate: 0.001
});
```

### Training the Model

```javascript
// Prepare training data
const trainingData = {
  inputs: [
    [/* 192 attribute values */],
    [/* 192 attribute values */]
  ],
  outputs: [
    [/* 50 optimization targets */],
    [/* 50 optimization targets */]
  ]
};

// Train model
const metrics = await orchestrator.trainNeuralNetwork(
  instance.id,
  trainingData
);

console.log('Training complete:', metrics);
```

## 🕷️ Crawler Configuration

### Starting a Crawler Session

```javascript
import IntegratedSEOCampaignService from './services/integrated-seo-campaign-service.js';

const service = new IntegratedSEOCampaignService({
  campaignName: 'my-campaign',
  enableNeuralNetwork: true,
  enableDataStreams: true,
  maxConcurrentCrawls: 10,
  continuousCrawling: true,
  crawlInterval: 3600000 // 1 hour
});

await service.initialize();

// Create campaign
const campaign = await service.createCampaign({
  name: 'example-campaign',
  type: 'continuous',
  startUrls: [
    'https://example.com',
    'https://example.com/blog'
  ]
});
```

### Neural-Guided Crawling

The crawler uses the neural network to:
- Prioritize URLs based on predicted value
- Determine optimal crawl depth
- Identify high-quality pages
- Predict SEO improvement opportunities

## 📈 Monitoring & Metrics

### System Status

```bash
curl http://localhost:3001/api/neural-seo/status
```

Response:
```json
{
  "isRunning": true,
  "backend": "tensorflow",
  "capabilities": {
    "neuralNetworks": true,
    "dataStreams": true,
    "continuousCrawling": true,
    "monitoring": true
  },
  "monitoring": {
    "campaignsActive": 5,
    "crawlsInProgress": 23,
    "totalAttributesMined": 15420,
    "neuralNetworkAccuracy": 0.87,
    "dataStreamsThroughput": 1250,
    "systemHealth": "healthy"
  }
}
```

### Campaign Metrics

```bash
curl http://localhost:3001/api/neural-seo/campaigns/<id>/metrics?timeWindow=24h
```

### Real-time Monitoring

```javascript
// Subscribe to monitoring updates
service.on('monitoringUpdate', (metrics) => {
  console.log('System metrics:', metrics);
});

// Subscribe to crawl events
service.on('urlCrawled', (event) => {
  console.log('URL crawled:', event.url);
  console.log('SEO score:', event.seoScore);
});

// Subscribe to stream events
dataStreamService.on('messagePushed', (event) => {
  console.log('Data streamed:', event.streamId);
});
```

## 🔧 Advanced Configuration

### Custom Attribute Configuration

Edit `config/seo-attributes.json` or add to database:

```javascript
await db.query(
  `INSERT INTO attribute_configurations (attribute_name, config, active)
   VALUES ($1, $2, true)`,
  ['customAttribute', JSON.stringify({
    category: 'custom',
    selector: '.custom-element',
    type: 'string',
    validation: {
      required: true,
      minLength: 10
    },
    scraping: {
      method: 'text',
      transform: 'trim'
    },
    training: {
      featureType: 'text',
      encoding: 'bert',
      importance: 'high'
    }
  })]
);
```

### Custom Neural Network Architecture

```javascript
const customInstance = await orchestrator.createNeuralInstance({
  name: 'custom-nn',
  modelType: 'sequential',
  inputDimensions: 192,
  hiddenLayers: [512, 256, 128, 64, 32],
  outputDimensions: 100,
  learningRate: 0.0005,
  dropout: 0.4,
  activation: 'relu'
});
```

### Custom Data Transformers

```javascript
// Add custom transformer to stream
stream.transformers.push((data) => {
  return {
    ...data,
    titleUppercase: data.title?.toUpperCase(),
    wordCountCategory: data.wordCount > 1000 ? 'long' : 'short'
  };
});
```

## 📚 API Reference

### Campaign Management

- `POST /api/neural-seo/campaigns` - Create campaign
- `GET /api/neural-seo/campaigns` - List campaigns
- `GET /api/neural-seo/campaigns/:id` - Get campaign
- `POST /api/neural-seo/campaigns/:id/queue-url` - Queue URL
- `GET /api/neural-seo/campaigns/:id/results` - Get results
- `GET /api/neural-seo/campaigns/:id/metrics` - Get metrics

### Data Streams

- `POST /api/neural-seo/streams` - Create stream
- `GET /api/neural-seo/streams` - List streams
- `GET /api/neural-seo/streams/:id` - Get stream
- `POST /api/neural-seo/streams/:id/push` - Push data

### Neural Networks

- `GET /api/neural-seo/neural/status` - Neural status
- `POST /api/neural-seo/neural/train` - Train model

### Attributes

- `GET /api/neural-seo/attributes` - List attributes
- `GET /api/neural-seo/attributes/:name` - Get attribute

### Monitoring

- `GET /api/neural-seo/health` - Health check
- `GET /api/neural-seo/status` - System status
- `GET /api/neural-seo/monitoring` - Metrics

## 🔍 Troubleshooting

### TensorFlow.js Not Loading

If tfjs-node fails to load, the system automatically falls back to:
1. Browser TensorFlow.js (@tensorflow/tfjs)
2. Brain.js (lightweight alternative)

Check logs for:
```
⚠️ tfjs-node not available, falling back to browser version
✅ TensorFlow.js (browser) loaded successfully
```

### Database Connection Issues

Ensure PostgreSQL is running and DATABASE_URL is correct:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Memory Issues with Large Datasets

For large training datasets, use batch processing:
```javascript
const batchSize = 32;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  await orchestrator.trainNeuralNetwork(instanceId, batch);
}
```

## 🎯 Use Cases

### 1. Continuous SEO Monitoring

Monitor your website 24/7 for SEO issues:
```javascript
const campaign = await service.createCampaign({
  name: 'continuous-monitoring',
  type: 'continuous',
  startUrls: ['https://mysite.com'],
  config: {
    crawlInterval: 3600000, // 1 hour
    maxDepth: 3,
    alertOnIssues: true
  }
});
```

### 2. Competitor Analysis

Track competitor SEO strategies:
```javascript
const competitorCampaign = await service.createCampaign({
  name: 'competitor-analysis',
  startUrls: [
    'https://competitor1.com',
    'https://competitor2.com'
  ],
  config: {
    trackCompetitors: true,
    compareMetrics: true
  }
});
```

### 3. Content Optimization

Get AI-powered recommendations:
```javascript
// Crawl results include neural predictions
const results = await fetch(
  `http://localhost:3001/api/neural-seo/campaigns/${id}/results`
);

results.forEach(result => {
  console.log('URL:', result.url);
  console.log('SEO Score:', result.seo_score);
  console.log('Recommendations:', result.recommendations);
});
```

## 📖 Additional Resources

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Brain.js Documentation](https://github.com/BrainJS/brain.js)
- [SEO Attributes Configuration](./config/seo-attributes.json)
- [Database Schema](./database/migrations/210-attribute-config-and-models.sql)

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional neural network architectures
- More attribute extractors
- Custom data transformers
- Integration with external services
- Performance optimizations

## 📝 License

MIT License - See LICENSE file for details
