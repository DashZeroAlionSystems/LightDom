# Neural Network Training Integration Guide

## Overview

This document provides a comprehensive guide to the neural network training integration system in LightDom. The system connects TensorFlow pretrained models with the web crawler data mining infrastructure to enable intelligent SEO optimization, content analysis, and automated recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LightDom Neural Network System                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   Web Crawler     │    │  Pretrained       │    │  Neural Network   │
│   Data Mining     │    │  Model Registry   │    │  Instance Manager │
│   (192+ attrs)    │    │  (11 models)      │    │  (Per-client)     │
└───────────────────┘    └───────────────────┘    └───────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     Training Pipeline          │
                    │   - Data Collection            │
                    │   - Preprocessing              │
                    │   - Training                   │
                    │   - Evaluation                 │
                    │   - Deployment                 │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      PostgreSQL Database       │
                    │   ┌─────────────────────────┐ │
                    │   │ pretrained_models       │ │
                    │   │ crawler_training_data   │ │
                    │   │ training_pipelines      │ │
                    │   │ neural_network_training │ │
                    │   │ model_inference_log     │ │
                    │   │ seo_attribute_defs      │ │
                    │   └─────────────────────────┘ │
                    └───────────────────────────────┘
```

## Table Structure & Relationships

### Core Tables

#### 1. pretrained_models
Stores the registry of available TensorFlow/Hugging Face pretrained models.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| model_id | VARCHAR(255) | Unique model identifier |
| name | VARCHAR(255) | Human-readable name |
| source | VARCHAR(50) | tensorflow-hub, huggingface, custom |
| task | VARCHAR(100) | Model task type |
| seo_use_case | VARCHAR(100) | Primary SEO application |
| accuracy | DECIMAL(5,4) | Baseline accuracy |
| performance_tier | VARCHAR(20) | very-fast, fast, medium, slow |
| seo_applications | JSONB | List of SEO use cases |
| transfer_learning_config | JSONB | Transfer learning setup |

#### 2. crawler_training_data
Stores training data collected from web crawler operations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| url | VARCHAR(2048) | Source URL |
| client_id | VARCHAR(255) | Client for data isolation |
| seo_attributes | JSONB | 192 SEO attributes |
| content_text | TEXT | Page content |
| quality_score | DECIMAL(5,2) | Data quality (0-100) |
| labels | JSONB | Training labels |
| status | VARCHAR(50) | pending, ready, used |

#### 3. training_pipelines
Defines training workflows connecting data to models.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Pipeline name |
| client_id | VARCHAR(255) | Client association |
| pretrained_model_id | UUID | FK to pretrained_models |
| neural_network_id | VARCHAR(255) | Target NN instance |
| training_config | JSONB | Training hyperparameters |
| schedule_type | VARCHAR(50) | manual, scheduled, continuous |

#### 4. neural_network_training_runs
Tracks individual training executions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pipeline_id | UUID | FK to training_pipelines |
| total_samples | INTEGER | Training data count |
| epochs_completed | INTEGER | Progress |
| final_accuracy | DECIMAL(5,4) | Final accuracy |
| training_history | JSONB | Loss/accuracy per epoch |
| status | VARCHAR(50) | queued, training, completed |

### Relationship Diagram

```
┌───────────────────┐     ┌───────────────────┐
│ pretrained_models │     │ neural_network_   │
│                   │     │ instances         │
└─────────┬─────────┘     └─────────┬─────────┘
          │                         │
          │ 1:N                     │ 1:N
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────────┐
│           training_pipelines                 │
│  (connects pretrained models to NN          │
│   instances with training config)           │
└─────────────────────┬───────────────────────┘
                      │
                      │ 1:N
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      neural_network_training_runs            │
│  (tracks each training execution)            │
└─────────────────────┬───────────────────────┘
                      │
                      │ N:M
                      │
                      ▼
┌─────────────────────────────────────────────┐
│        crawler_training_data                 │
│  (training data from crawler, linked via    │
│   training_data_model_mapping)              │
└─────────────────────────────────────────────┘
```

## Available Pretrained Models

The system includes 11 production-ready pretrained models:

### Text Analysis Models

| Model | Accuracy | Speed | Primary Use |
|-------|----------|-------|-------------|
| Universal Sentence Encoder | 92% | Medium | Content similarity |
| BERT Base Uncased | 93% | Medium | Content quality |
| DistilBERT SST-2 | 91.5% | Fast | Sentiment analysis |
| All MiniLM L6 v2 | 88% | Very Fast | Real-time embeddings |
| BERT QA (SQuAD2) | 88% | Medium | FAQ generation |
| BERT NER | 91% | Medium | Entity extraction |
| BART Zero-Shot | 90% | Slow | Topic classification |

### Image Analysis Models

| Model | Accuracy | Speed | Primary Use |
|-------|----------|-------|-------------|
| MobileNet V2 | 87% | Very Fast | Alt text generation |
| EfficientNet B0 | 91% | Medium | Advanced image SEO |
| Toxicity Detection | 89% | Fast | Content safety |

### Summarization

| Model | Accuracy | Speed | Primary Use |
|-------|----------|-------|-------------|
| BART Summarization | 87% | Slow | Meta descriptions |

## Data Flow: Crawler to Neural Network

### Step 1: Data Collection

The crawler collects 192+ SEO attributes from each page:

```javascript
// Example crawler data output
{
  url: "https://example.com/page",
  seoAttributes: {
    title_length: 55,
    meta_description_length: 155,
    word_count: 1500,
    h1_count: 1,
    internal_links_count: 25,
    images_with_alt: 10,
    page_load_time: 2300,
    largest_contentful_paint: 1800,
    // ... 180+ more attributes
  },
  content: "Page text content...",
  metaData: {
    title: "Page Title",
    description: "Meta description..."
  }
}
```

### Step 2: Data Storage

Training data is stored with quality scoring:

```sql
SELECT add_crawler_training_data(
  'https://example.com/page',
  'client-123',
  '{"title_length": 55, "word_count": 1500, ...}'::jsonb,
  'Page content text...',
  '{"title": "Page Title"}'::jsonb,
  '{"domDepth": 8, "elements": 150}'::jsonb,
  85.5  -- quality score
);
```

### Step 3: Pipeline Configuration

Create a training pipeline:

```javascript
POST /api/training-pipelines
{
  "name": "SEO Optimization Training",
  "clientId": "client-123",
  "pretrainedModelId": "bert-base-uncased",
  "trainingConfig": {
    "epochs": 50,
    "batchSize": 32,
    "learningRate": 0.001,
    "validationSplit": 0.2,
    "earlyStopping": true
  },
  "scheduleType": "on_data"
}
```

### Step 4: Training Execution

Start training when sufficient data is collected:

```javascript
POST /api/training-pipelines/{pipeline_id}/start
```

The system:
1. Loads training data for the client
2. Preprocesses features using the 192 SEO attributes
3. Applies transfer learning from pretrained model
4. Trains with configured hyperparameters
5. Evaluates and stores metrics

### Step 5: Inference

Make predictions using the trained model:

```javascript
POST /api/inference
{
  "neuralNetworkId": "nn-client123-seo-1234567890",
  "input": {
    "title_length": 60,
    "word_count": 1200,
    "h1_count": 1,
    // ... other attributes
  }
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "meta-description",
      "title": "Optimize Meta Description",
      "priority": "high",
      "confidence": 0.92
    },
    {
      "id": "improve-lcp",
      "title": "Improve Largest Contentful Paint",
      "priority": "high",
      "confidence": 0.88
    }
  ]
}
```

## API Reference

### Pretrained Models

```
GET  /api/pretrained-models              - List all available models
GET  /api/pretrained-models/:modelId     - Get model details
GET  /api/pretrained-models/pipeline/crawler - Get crawler pipeline config
```

### Training Pipelines

```
POST /api/training-pipelines             - Create training pipeline
GET  /api/training-pipelines             - List pipelines
GET  /api/training-pipelines/:id         - Get pipeline details
POST /api/training-pipelines/:id/start   - Start training run
```

### Training Runs

```
GET  /api/training-runs                  - List training runs
GET  /api/training-runs/:id              - Get run status/details
```

### Training Data

```
POST /api/training-data                  - Submit single training data
POST /api/training-data/batch            - Submit batch training data
GET  /api/training-data/quality          - Get data quality stats
GET  /api/training-data/summary          - Get summary across clients
```

### Inference

```
POST /api/inference                      - Make predictions
```

### Statistics

```
GET  /api/training-service/stats         - Get service statistics
GET  /api/model-performance              - Get model performance comparison
GET  /api/seo-attributes                 - Get SEO attribute definitions
```

## Quick Start

### 1. Run Database Migration

```bash
psql -U your_user -d lightdom_db -f database/143-neural-network-training-integration.sql
```

### 2. Install Dependencies

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
```

### 3. Configure Environment

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
NN_MODELS_DIR=./models
NN_CONFIG_DIR=./config/neural-networks
```

### 4. Start the Server

```bash
npm run dev
```

### 5. Create a Training Pipeline

```bash
curl -X POST http://localhost:3001/api/training-pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SEO Model",
    "clientId": "my-client-id",
    "pretrainedModelId": "bert-base-uncased",
    "trainingConfig": {
      "epochs": 50,
      "batchSize": 32
    }
  }'
```

### 6. Collect Training Data

```bash
curl -X POST http://localhost:3001/api/training-data \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "clientId": "my-client-id",
    "seoAttributes": {
      "title_length": 55,
      "word_count": 1500
    }
  }'
```

### 7. Start Training

```bash
curl -X POST http://localhost:3001/api/training-pipelines/{pipeline_id}/start
```

## Integration with Existing Systems

### Crawler Integration

The system integrates with the existing crawler through:

1. **CrawlerNeuralIntegration** service (`services/crawler-neural-integration.js`)
2. **Training Data Bundler** (`services/training-data-bundler.js`)
3. **Enhanced Data Mining Worker** (`services/enhanced-data-mining-worker.js`)

### Neural Network Dashboard

Access the neural network dashboard at `/neural-networks` to:
- View all neural network instances
- Monitor training progress
- Configure data streams and attributes
- Make predictions

### API Server Integration

The routes are mounted in `api-server-express.js`:

```javascript
import { createPretrainedModelRoutes } from './api/pretrained-model-training-routes.js';

// Mount routes
app.use('/api', createPretrainedModelRoutes(dbPool));
```

## Best Practices

### Training Data Quality

- Aim for quality score > 70 for training data
- Collect at least 1000 samples before training
- Ensure diverse URLs from different domains
- Include both positive and negative examples

### Model Selection

- Use **fast models** (MiniLM, MobileNet) for real-time crawler analysis
- Use **medium models** (BERT, USE) for batch processing
- Use **slow models** (BART) for offline detailed analysis

### Transfer Learning

- Freeze early layers for domain adaptation
- Use lower learning rate (0.0001) for fine-tuning
- Start with pretrained model closest to your use case

### Continuous Learning

- Enable inference logging for feedback collection
- Retrain models periodically with new data
- Monitor accuracy drift over time

## Troubleshooting

### Insufficient Training Data

```
Error: Insufficient training data: 50 < 1000
```

Solution: Collect more training data using the crawler or reduce `minDataPoints` threshold.

### Model Not Found

```
Error: Pretrained model not found: custom-model
```

Solution: Ensure the model ID matches one from the pretrained models registry.

### Training Timeout

If training takes too long:
- Reduce `epochs` configuration
- Reduce `maxDataPoints` to limit training set size
- Use a faster model (MiniLM instead of BERT)

## Version History

- **1.0.0** - Initial release with 11 pretrained models
- Database migration: `143-neural-network-training-integration.sql`

## Files Reference

### Database
- `database/143-neural-network-training-integration.sql` - Complete schema

### Services
- `services/pretrained-model-training-service.js` - Main training service
- `services/seo-pretrained-models-registry.js` - Model registry
- `services/neural-network-seo-trainer.js` - Neural network trainer
- `services/crawler-neural-integration.js` - Crawler integration

### API Routes
- `api/pretrained-model-training-routes.js` - REST API endpoints
- `api/neural-network-routes.js` - Neural network instance management

### Documentation
- `NEURAL_NETWORK_TRAINING_INTEGRATION_GUIDE.md` - This guide
- `TENSORFLOW_PRETRAINED_MODELS_IMPLEMENTATION.md` - Pretrained models details
- `NEURAL_NETWORK_IMPLEMENTATION_SUMMARY.md` - System overview

---

**Last Updated**: 2025-11-25  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
