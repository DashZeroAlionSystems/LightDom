# SEO Neural Network Campaign with 192 Attributes

Complete implementation of a neural network-powered SEO optimization system with all 192 SEO attributes, pretrained model support, configurable batch sizes, and integrated data mining.

## Overview

This system provides:
- **192 SEO Attributes**: Comprehensive coverage of all SEO factors including meta tags, Open Graph, Twitter Cards, structured data, Core Web Vitals, accessibility, security, and more
- **Pretrained Models**: Model library with version control, transfer learning, and fine-tuning capabilities
- **Configurable Batch Sizes**: Auto-tuning and manual configuration of training batch sizes
- **Data Mining Integration**: Automated data collection and seeding for training data
- **Neural Network Training**: TensorFlow-based training with real-time monitoring
- **API Access**: Complete REST API for campaign management

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SEO Neural Campaign Service               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   192 SEO    │  │  Pretrained  │  │   Neural     │    │
│  │  Attributes  │→ │    Models    │→ │   Trainer    │    │
│  │  Extractor   │  │   Library    │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         ↓                  ↓                  ↓            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Data     │  │   Transfer   │  │    Batch     │    │
│  │   Seeding    │  │   Learning   │  │ Size Config  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  ┌─────────────────┐
                  │   REST API      │
                  │  (Express)      │
                  └─────────────────┘
```

## Features

### 1. 192 SEO Attributes

The system analyzes all critical SEO factors:

#### Meta & Head Attributes (50)
- Title, meta description, keywords, author, robots
- Canonical, alternate, prev/next links
- Open Graph (title, description, image, URL, type, site name, locale)
- Twitter Card (card type, site, creator, title, description, image)
- Language, charset, favicon, Apple touch icon

#### Heading Structure (20)
- H1-H6 counts and text content
- Heading hierarchy validation
- Total headings

#### Content Quality (30)
- Word count, paragraph count, sentence count
- Readability score, keyword density
- Lists, tables, forms, multimedia elements
- Content freshness and uniqueness

#### Link Attributes (25)
- Total, internal, external link counts
- Anchor links, nofollow/dofollow ratios
- Broken links, redirects, deep links
- Anchor text diversity

#### Image Attributes (15)
- Total images, alt text coverage
- Lazy loading, responsive images
- WebP format usage

#### Structured Data (20)
- JSON-LD schema count and types
- Article, Product, Organization, Breadcrumb schemas
- Local Business, Event, Recipe, Video, Review schemas
- Microdata attributes

#### Performance Metrics (25)
- Core Web Vitals (LCP, FID, CLS)
- First Contentful Paint, Speed Index, Time to Interactive
- Total Blocking Time, TTFB, Server Response Time
- Resource counts (CSS, JS, images)
- Render-blocking resources, unused bytes

#### Mobile & Accessibility (15)
- Viewport meta, theme color
- ARIA labels, roles, WCAG compliance
- Accessibility score

#### Security (10)
- HTTPS, insecure content detection
- Iframes, external scripts
- Cross-origin links

#### Internationalization (8)
- Hreflang tags, language alternates
- Multi-language support

#### Technical SEO (12)
- robots.txt, sitemap.xml
- HTTP/2, Gzip/Brotli compression
- Image optimization, minification

#### E-commerce (8)
- Product counts, prices
- Add to cart, wishlist buttons

#### Computed Scores (10)
- SEO score, content quality score
- Technical score, mobile score
- Performance, accessibility, security scores
- Link quality, social engagement, UX scores

### 2. Pretrained Model Library

Manage and version pretrained models:

```javascript
import { getPretrainedModelLibrary } from './services/pretrained-model-library.ts';

const library = getPretrainedModelLibrary();

// Create base model
await library.createBaseModel('base-seo-optimizer-v1', {
  inputDimensions: 192,
  hiddenLayers: [256, 128, 64],
  outputDimensions: 50
});

// Load pretrained model
const model = await library.loadModel('base-seo-optimizer-v1');

// Transfer learning
const fineTunedModel = await library.cloneModelForTransferLearning(
  'base-seo-optimizer-v1',
  {
    freezeLayers: [0, 1, 2], // Freeze first 3 layers
    learningRate: 0.0001,
    fineTuneEpochs: 50
  }
);
```

### 3. Configurable Batch Sizes

Automatically tune or manually configure batch sizes:

```javascript
import SEONeuralCampaignService from './services/seo-neural-campaign-service.js';

const campaign = new SEONeuralCampaignService({
  clientId: 'client-123',
  batchSize: 32,
  autoTuneBatchSize: true // Auto-tune based on dataset size
});

await campaign.initialize();

// Manual update
campaign.setBatchSize(64);

// Get recommendation
const datasetSize = 10000;
const recommended = campaign.neuralTrainer.getRecommendedBatchSize(datasetSize);
// Returns: 64
```

### 4. Complete API

Access all functionality via REST API:

#### Create Campaign
```bash
POST /api/seo-neural-campaign/create
{
  "clientId": "client-123",
  "config": {
    "usePretrainedModel": true,
    "pretrainedModelId": "base-seo-optimizer-v1",
    "enableTransferLearning": true,
    "batchSize": 32,
    "epochs": 100
  }
}
```

#### Extract All 192 Attributes
```bash
POST /api/seo-neural-campaign/:clientId/extract-attributes
{
  "html": "<html>...</html>",
  "url": "https://example.com"
}
```

#### Get Optimization Recommendations
```bash
POST /api/seo-neural-campaign/:clientId/analyze
{
  "html": "<html>...</html>",
  "url": "https://example.com"
}
```

#### Train Model
```bash
POST /api/seo-neural-campaign/:clientId/train
{
  "trainingData": [
    {
      "attributes": { /* 192 attributes */ },
      "optimizations": [ /* applied optimizations */ ],
      "results": { /* success metrics */ }
    }
  ],
  "options": {
    "epochs": 50,
    "batchSize": 64
  }
}
```

#### Update Batch Size
```bash
PUT /api/seo-neural-campaign/:clientId/batch-size
{
  "batchSize": 64
}
```

#### List Pretrained Models
```bash
GET /api/seo-neural-campaign/models/pretrained?tags=seo,base
```

#### Get All Attributes Configuration
```bash
GET /api/seo-neural-campaign/attributes
```

## Usage Examples

### Complete SEO Campaign Setup

```javascript
import SEONeuralCampaignService from './services/seo-neural-campaign-service.js';

// Initialize campaign
const campaign = new SEONeuralCampaignService({
  clientId: 'acme-corp',
  campaignName: 'Acme SEO Optimization',
  usePretrainedModel: true,
  pretrainedModelId: 'base-seo-optimizer-v1',
  enableTransferLearning: true,
  batchSize: 32,
  autoTuneBatchSize: true
});

await campaign.initialize();

// Analyze a page
const html = await fetchPageHTML('https://acme.com/product');
const recommendations = await campaign.getOptimizationRecommendations(
  html,
  'https://acme.com/product'
);

console.log(`Analyzed ${recommendations.attributesAnalyzed} attributes`);
console.log(`Generated ${recommendations.recommendations.length} recommendations`);

// Train with collected data
const trainingData = [/* ... collected from data miners ... */];
await campaign.trainWithData(trainingData);

// Get statistics
const stats = campaign.getStats();
console.log('Campaign Statistics:', stats);
```

### Using Pretrained Models

```javascript
import { getPretrainedModelLibrary } from './services/pretrained-model-library.ts';

const library = getPretrainedModelLibrary();

// List available models
const models = library.listModels({ tags: ['seo'] });
console.log(`Found ${models.length} SEO models`);

// Get recommended model for use case
const recommendedId = library.getRecommendedModel('ecommerce');

// Load and use
const model = await library.loadModel(recommendedId);
```

### Data Mining Integration

The system automatically integrates with data mining services:

```javascript
// Data miners collect all 192 attributes
// Seeders provide URLs for crawling
// Training data is automatically prepared and fed to the neural network

const campaign = new SEONeuralCampaignService({
  collectTrainingData: true,
  continuousImprovement: true
});

// Campaign will automatically:
// 1. Collect pages via seeders
// 2. Extract all 192 attributes
// 3. Apply optimizations
// 4. Measure results
// 5. Retrain model with new data
```

## Configuration

### Attribute Configuration

All 192 attributes are configured in `config/seo-attributes.json`:

```json
{
  "attributes": {
    "title": {
      "id": 1,
      "category": "meta",
      "selector": "title",
      "type": "string",
      "mlWeight": 0.15,
      "validation": { "required": true, "minLength": 30, "maxLength": 60 },
      "scraping": { "method": "text", "fallback": "", "transform": "trim" },
      "training": {
        "featureType": "text",
        "encoding": "bert",
        "importance": "critical",
        "normalization": "none"
      },
      "seeding": {
        "source": "crawler",
        "refreshFrequency": "daily",
        "qualityThreshold": 0.95
      }
    }
    // ... 191 more attributes
  },
  "trainingConfiguration": {
    "inputDimensions": 192,
    "hiddenLayers": [256, 128, 64],
    "outputDimensions": 50,
    "batchSize": 32,
    "epochs": 100
  }
}
```

### Training Configuration

```javascript
{
  inputDimensions: 192,        // All SEO attributes
  hiddenLayers: [256, 128, 64], // Neural network architecture
  outputDimensions: 50,         // Number of recommendation types
  learningRate: 0.001,
  batchSize: 32,                // Configurable batch size
  epochs: 100,
  validationSplit: 0.2,
  usePretrainedModel: true,
  pretrainedModelId: 'base-seo-optimizer-v1',
  enableTransferLearning: true,
  freezeLayers: [0, 1, 2],
  autoTuneBatchSize: true
}
```

## Database Schema

Model training and attributes are stored in PostgreSQL:

```sql
-- Attribute configurations
CREATE TABLE attribute_configurations (
  id UUID PRIMARY KEY,
  attribute_name VARCHAR(255) NOT NULL UNIQUE,
  config JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true
);

-- Client TensorFlow models
CREATE TABLE client_tensorflow_models (
  id UUID PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  model_name VARCHAR(255) NOT NULL DEFAULT 'seo-optimizer',
  model_config JSONB NOT NULL,
  model_path TEXT NOT NULL,
  training_data_count INTEGER DEFAULT 0,
  accuracy FLOAT,
  loss FLOAT,
  last_trained_at TIMESTAMP
);

-- Model training history
CREATE TABLE model_training_history (
  id UUID PRIMARY KEY,
  model_id UUID REFERENCES client_tensorflow_models(id),
  training_data_count INTEGER NOT NULL,
  epochs INTEGER NOT NULL,
  batch_size INTEGER NOT NULL,
  learning_rate FLOAT NOT NULL,
  final_loss FLOAT NOT NULL,
  final_accuracy FLOAT,
  training_time_ms INTEGER NOT NULL,
  trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

Test the complete system:

```bash
# Test attribute extraction
npm run test:attributes

# Test model training
npm run test:neural-training

# Test pretrained models
npm run test:pretrained-models

# Test complete campaign
npm run test:seo-campaign
```

## Performance

- **Attribute Extraction**: ~100ms per page for all 192 attributes
- **Model Training**: Varies by dataset size and batch size
  - 1,000 samples: ~2 minutes
  - 10,000 samples: ~15 minutes
  - 100,000 samples: ~2 hours
- **Inference**: ~50ms per prediction
- **Batch Size Impact**: Larger batch sizes (64-128) are faster but use more memory

## Best Practices

1. **Start with Pretrained Models**: Use `base-seo-optimizer-v1` for initial deployment
2. **Enable Transfer Learning**: Fine-tune on client-specific data
3. **Auto-Tune Batch Size**: Enable `autoTuneBatchSize` for optimal performance
4. **Monitor Training**: Track accuracy, loss, and convergence
5. **Continuous Improvement**: Regularly retrain with new data
6. **Use All 192 Attributes**: Don't skip attributes - the model learns their importance

## Troubleshooting

### Model Not Training
- Check batch size isn't too large for dataset
- Verify all 192 attributes are being extracted
- Enable auto-tune batch size

### Low Accuracy
- Increase training epochs
- Use transfer learning with pretrained model
- Collect more diverse training data

### Slow Training
- Increase batch size
- Use GPU acceleration (install `@tensorflow/tfjs-node-gpu`)
- Reduce model complexity

## API Reference

See [API Documentation](./API.md) for complete endpoint reference.

## Contributing

To add new attributes:
1. Update `config/seo-attributes.json`
2. Update `services/seo-attribute-extractor.js` extraction logic
3. Update `trainingConfiguration.inputDimensions` to match total count
4. Retrain base pretrained model

## License

MIT
