# Neural Network Web Crawler System

> Advanced TensorFlow-powered web crawling with intelligent SEO optimization and real-time data streaming

## 🌟 Overview

A comprehensive, production-ready system that combines:
- **TensorFlow.js** for neural network training and inference
- **Intelligent Web Crawling** with ML-guided decision making
- **192 SEO Attributes** extracted and streamed in real-time
- **Data Stream Management** for attribute-level data processing
- **Campaign Orchestration** for managing multiple crawling campaigns
- **Real-time Monitoring** with alerts and health tracking

## ✨ Key Features

### 1. Neural Network Integration
- **TensorFlow.js-node** (high-performance server-side)
- **TensorFlow.js** (browser fallback)
- **Brain.js** (lightweight alternative)
- Custom model architectures (192 input → 256-128-64 → 50 output)
- Continuous training from crawled data
- Model versioning and persistence

### 2. Intelligent Crawling
- ML-guided URL prioritization
- Adaptive crawl depth based on page value
- Real-time SEO score calculation
- Automated recommendation generation
- 24/7 continuous crawling support
- Configurable concurrency and rate limiting

### 3. Data Stream Management
- Single attribute streaming
- Multi-attribute bundled streams
- Real-time validation and transformation
- WebSocket protocol support
- Buffer management with auto-flush
- Historical data persistence

### 4. Campaign Orchestration
- Create and manage multiple campaigns
- Neural network per campaign
- Automatic data stream setup
- URL queue with priority
- Progress tracking and metrics
- Campaign-level configuration

### 5. Monitoring & Observability
- Real-time metrics dashboard
- System health monitoring
- Alert generation with thresholds
- Historical data tracking
- Performance analytics
- Error tracking and reporting

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# The following packages are included:
# - @tensorflow/tfjs-node (server-side TensorFlow)
# - @tensorflow/tfjs (browser TensorFlow)
# - brain.js (lightweight alternative)
```

### Database Setup

```bash
# Tables are created automatically on first run
# Or run migrations manually:
npm run db:migrate
```

### Start the Service

```bash
# Option 1: Standalone service
npm run start:neural-crawler

# Option 2: As part of main API server
npm run start:dev
# Neural routes available at: http://localhost:3001/api/neural-seo/*
```

### Run the Example

```bash
npm run neural:example
```

### Check Status

```bash
npm run neural:status      # System status
npm run neural:monitoring  # Metrics
npm run neural:health      # Health check
```

## 📚 Usage Examples

### Create a Campaign

```javascript
// Using the API
const response = await fetch('http://localhost:3001/api/neural-seo/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'my-website-audit',
    type: 'continuous',
    startUrls: [
      'https://example.com',
      'https://example.com/products',
      'https://example.com/about'
    ],
    config: {
      maxDepth: 3,
      maxPages: 1000,
      crawlInterval: 3600000 // 1 hour
    }
  })
});

const campaign = await response.json();
console.log('Campaign ID:', campaign.campaign.id);
```

### Create Data Streams

```javascript
// Create a stream for meta tags
const metaStream = await fetch('http://localhost:3001/api/neural-seo/streams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'meta-tags-stream',
    attributes: ['title', 'metaDescription', 'metaKeywords', 'canonical']
  })
});

// Push data to stream
await fetch(`http://localhost:3001/api/neural-seo/streams/${streamId}/push`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      title: 'Example Page Title',
      metaDescription: 'This is an example description',
      metaKeywords: 'example, keywords',
      canonical: 'https://example.com/page'
    }
  })
});
```

### Train Neural Network

```javascript
// Using the service directly
import IntegratedSEOCampaignService from './services/integrated-seo-campaign-service.js';

const service = new IntegratedSEOCampaignService({ db });
await service.initialize();

// Prepare training data
const trainingData = {
  inputs: [
    Array(192).fill(0).map(() => Math.random()), // Sample 1
    Array(192).fill(0).map(() => Math.random())  // Sample 2
  ],
  outputs: [
    Array(50).fill(0).map((_, i) => i < 5 ? 1 : 0),  // Few optimizations
    Array(50).fill(0).map((_, i) => i < 25 ? 1 : 0)  // Many optimizations
  ]
};

// Train the model
const metrics = await service.neuralOrchestrator.trainNeuralNetwork(
  neuralInstanceId,
  trainingData
);

console.log('Accuracy:', metrics.accuracy);
console.log('Loss:', metrics.loss);
```

### Monitor System

```javascript
// Get monitoring metrics
const response = await fetch('http://localhost:3001/api/neural-seo/monitoring');
const metrics = await response.json();

console.log('Active Campaigns:', metrics.campaignsActive);
console.log('Crawls in Progress:', metrics.crawlsInProgress);
console.log('Attributes Mined:', metrics.totalAttributesMined);
console.log('Neural Accuracy:', metrics.neuralNetworkAccuracy);
console.log('Stream Throughput:', metrics.dataStreamsThroughput);
console.log('System Health:', metrics.systemHealth);
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Neural Crawler System                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │      IntegratedSEOCampaignService                   │    │
│  │  - Campaign orchestration                           │    │
│  │  - Continuous crawling                              │    │
│  │  - URL queue management                             │    │
│  └────────────┬───────────────┬───────────────────────┘    │
│               │               │                             │
│  ┌────────────▼─────────┐  ┌─▼────────────────────────┐   │
│  │ NeuralCrawler        │  │ AttributeDataStream       │   │
│  │ Orchestrator         │  │ Service                   │   │
│  │ - TensorFlow.js      │  │ - Single attr streams     │   │
│  │ - Brain.js           │  │ - Bundled streams         │   │
│  │ - Model training     │  │ - Real-time validation    │   │
│  │ - Instance mgmt      │  │ - WebSocket support       │   │
│  └──────────────────────┘  └───────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │      NeuralCrawlerMonitoringDashboard              │    │
│  │  - Real-time metrics                                │    │
│  │  - Alert generation                                 │    │
│  │  - Health monitoring                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL  │
                    │  Database    │
                    └──────────────┘
```

## 📖 API Reference

### Campaign Management

#### Create Campaign
```http
POST /api/neural-seo/campaigns
Content-Type: application/json

{
  "name": "my-campaign",
  "type": "continuous",
  "startUrls": ["https://example.com"],
  "config": {
    "maxDepth": 3,
    "maxPages": 1000
  }
}
```

#### List Campaigns
```http
GET /api/neural-seo/campaigns
```

#### Get Campaign
```http
GET /api/neural-seo/campaigns/:id
```

#### Queue URL
```http
POST /api/neural-seo/campaigns/:id/queue-url
Content-Type: application/json

{
  "url": "https://example.com/page",
  "priority": 5,
  "depth": 1
}
```

#### Get Results
```http
GET /api/neural-seo/campaigns/:id/results?limit=100&offset=0
```

#### Get Metrics
```http
GET /api/neural-seo/campaigns/:id/metrics?timeWindow=24h
```

### Data Streams

#### Create Stream
```http
POST /api/neural-seo/streams
Content-Type: application/json

{
  "name": "my-stream",
  "attributes": ["title", "metaDescription"],
  "type": "bundled"
}
```

#### List Streams
```http
GET /api/neural-seo/streams
```

#### Get Stream
```http
GET /api/neural-seo/streams/:id
```

#### Push Data
```http
POST /api/neural-seo/streams/:id/push
Content-Type: application/json

{
  "data": {
    "title": "Example",
    "metaDescription": "Description"
  }
}
```

### Neural Networks

#### Get Neural Status
```http
GET /api/neural-seo/neural/status
```

#### Train Model
```http
POST /api/neural-seo/neural/train
Content-Type: application/json

{
  "instanceId": "uuid",
  "trainingData": {
    "inputs": [[...]],
    "outputs": [[...]]
  }
}
```

### Monitoring

#### Health Check
```http
GET /api/neural-seo/health
```

#### System Status
```http
GET /api/neural-seo/status
```

#### Monitoring Metrics
```http
GET /api/neural-seo/monitoring
```

### Attributes

#### List Attributes
```http
GET /api/neural-seo/attributes
```

#### Get Attribute
```http
GET /api/neural-seo/attributes/:name
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom

# Neural Crawler
CAMPAIGN_NAME=default-campaign
ENABLE_NEURAL=true
ENABLE_STREAMS=true
ENABLE_MONITORING=true
CONTINUOUS_CRAWLING=true
MAX_CONCURRENT_CRAWLS=10
CRAWL_INTERVAL=3600000

# Monitoring
MONITORING_INTERVAL=30000
ENABLE_ALERTS=true
```

### Service Configuration

```javascript
const config = {
  // Campaign
  campaignName: 'my-campaign',
  maxConcurrentCrawls: 10,
  continuousCrawling: true,
  crawlInterval: 3600000,
  
  // Neural Network
  enableNeuralNetwork: true,
  modelArchitecture: 'sequential',
  inputDimensions: 192,
  hiddenLayers: [256, 128, 64],
  outputDimensions: 50,
  learningRate: 0.001,
  
  // Data Streams
  enableDataStreams: true,
  streamProtocol: 'websocket',
  bufferSize: 1000,
  flushInterval: 5000,
  
  // Monitoring
  enableMonitoring: true,
  monitoringInterval: 30000,
  enableAlerts: true
};
```

## 🗄️ Database Schema

The system automatically creates the following tables:

- `neural_crawler_instances` - Neural network instances
- `neural_crawler_sessions` - Crawling sessions
- `neural_crawler_data_streams` - Data stream registry
- `neural_crawler_mined_data` - Crawled data with attributes
- `neural_crawler_training_data` - Training datasets
- `neural_crawler_metrics` - System metrics
- `seo_campaigns` - Campaign management
- `seo_campaign_urls` - URL queue
- `seo_campaign_crawl_results` - Crawl results
- `seo_campaign_metrics` - Campaign metrics
- `monitoring_metrics` - Monitoring data
- `monitoring_alerts` - Alert history
- `attribute_configurations` - 192 attribute configs

## 🧪 Testing

```bash
# Run the example workflow
npm run neural:example

# Check service health
npm run neural:health

# Monitor system status
npm run neural:monitoring
```

## 📊 Monitoring

The system provides comprehensive monitoring:

### Real-time Metrics
- Active campaigns count
- Crawls in progress
- Total attributes mined
- Neural network accuracy
- Data stream throughput
- System health status

### Alerts
- High error rate (>10%)
- Low crawl speed (<10 URLs/min)
- Low model accuracy (<70%)
- System unhealthy
- Memory usage warnings

### Historical Data
- 24-hour metric retention
- Performance trends
- Training history
- Error patterns

## 🛠️ Troubleshooting

### TensorFlow.js Not Loading

If tfjs-node fails, the system automatically falls back to:
1. Browser TensorFlow.js
2. Brain.js

Check logs for fallback messages.

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check tables
npm run db:migrate
```

### Memory Issues

```javascript
// Use batch processing for large datasets
const batchSize = 32;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  await service.trainNeuralNetwork(instanceId, batch);
}
```

## 📁 File Structure

```
/
├── services/
│   ├── neural-crawler-orchestrator.js       # Neural network orchestration
│   ├── attribute-data-stream-service.js     # Data stream management
│   ├── integrated-seo-campaign-service.js   # Campaign orchestration
│   └── neural-crawler-monitoring-dashboard.js # Monitoring
├── api/
│   └── neural-seo-campaign-routes.js        # REST API routes
├── config/
│   └── seo-attributes.json                  # 192 attribute configs
├── database/
│   └── migrations/                          # Database migrations
├── start-neural-crawler.js                  # Service startup script
├── example-neural-crawler.js                # Example usage
└── NEURAL_CRAWLER_INTEGRATION_GUIDE.md     # Detailed guide
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional neural network architectures
- More attribute extractors
- Custom data transformers
- Integration with external services
- Performance optimizations
- UI dashboards

## 📄 License

MIT License - See LICENSE file for details

## 📚 Additional Resources

- [Complete Integration Guide](./NEURAL_CRAWLER_INTEGRATION_GUIDE.md)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Brain.js Documentation](https://github.com/BrainJS/brain.js)
- [SEO Attributes Configuration](./config/seo-attributes.json)

## 🎯 Use Cases

### 1. Continuous Website Monitoring
Monitor your website 24/7 for SEO issues and opportunities.

### 2. Competitor Analysis
Track competitor strategies and benchmark performance.

### 3. Content Optimization
Get AI-powered recommendations for content improvement.

### 4. Large-scale SEO Audits
Audit thousands of pages efficiently with intelligent crawling.

### 5. Real-time SEO Metrics
Stream SEO metrics in real-time to dashboards and analytics tools.

---

**Built with ❤️ using TensorFlow.js, Node.js, and PostgreSQL**
