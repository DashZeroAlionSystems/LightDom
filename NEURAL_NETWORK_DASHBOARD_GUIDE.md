# Neural Network Dashboard - Implementation Guide

## Overview

This implementation provides a comprehensive neural network management dashboard for the LightDom platform with full integration for crawler, seeder, and SEO optimization workflows.

## Features Implemented

### 1. Database Schema

**File**: `database/migrations/220-neural-network-enhanced-system.sql`

The schema includes:

- **neural_network_data_streams**: Manages data flow between services and neural networks
  - Supports input, output, training, evaluation, and prediction streams
  - Configurable source/destination with transformation rules
  - Attribute mapping support

- **neural_network_attributes**: Feature engineering configuration
  - Algorithm configuration for preprocessing and feature extraction
  - Data mining configuration for automated data collection
  - Drilldown configuration for exploring related attributes
  - Training configuration for model learning
  - SEO-specific configuration for optimization

- **neural_network_crawler_config**: Crawler integration
  - URL prioritization and prediction
  - Dynamic content extraction
  - Adaptive performance optimization
  - Training data collection from crawling

- **neural_network_seeder_config**: Seeder integration  
  - Topic translation using semantic similarity
  - Valuable URL prediction
  - Related topics expansion

- **neural_network_seo_attributes**: SEO analysis and ranking
  - Keyword relevance and content quality scores
  - Predicted rankings with confidence scores
  - Trust and authority scoring
  - Optimization recommendations

- **neural_network_training_data**: Training dataset management
  - Multiple data sources (crawler, seeder, manual, import)
  - Quality scoring and validation
  - Support for Crawlee and TensorFlow integration

- **neural_network_models**: Pre-trained model registry
  - Default models for scraping, data mining, and SEO
  - Performance metrics tracking
  - Version management

- **neural_network_project_research**: Project organization research
  - Development best practices
  - Architecture patterns
  - Organizing skills for development work

### 2. Backend Service

**File**: `services/NeuralNetworkInstanceService.js`

Core functionality:

- **createInstance()**: Creates new neural network instances with:
  - Automatic loading of default pre-trained models
  - Default data stream creation
  - Default attribute setup based on model type
  - Crawler and seeder integration setup

- **addDataStream()**: Adds data streams to instances
  - Configurable source and destination
  - Transformation rules
  - Attribute mappings

- **combineAttributes()**: Combines multiple attributes into data streams
  - Aggregates attribute configurations
  - Creates unified input streams for models

- **getAttributeDrilldown()**: Explores related attributes
  - Recursive attribute relationships
  - Configurable visualization types
  - Depth limiting

- **setupProjectOrganizationResearch()**: Initializes development research
  - Workflow organization patterns
  - Crawlee + TensorFlow integration best practices

### 3. API Routes

**File**: `api/neural-network-dashboard-routes.js`

Endpoints:

- `GET /api/neural-network-dashboard/instances` - List all instances
- `GET /api/neural-network-dashboard/instances/:id` - Get instance details
- `POST /api/neural-network-dashboard/instances` - Create new instance
- `DELETE /api/neural-network-dashboard/instances/:id` - Delete instance
- `POST /api/neural-network-dashboard/instances/:id/data-streams` - Add data stream
- `POST /api/neural-network-dashboard/instances/:id/combine-attributes` - Combine attributes
- `GET /api/neural-network-dashboard/attributes/:id/drilldown` - Get attribute drilldown
- `POST /api/neural-network-dashboard/instances/:id/training-data` - Add training data
- `POST /api/neural-network-dashboard/instances/:id/setup-research` - Setup project research
- `GET /api/neural-network-dashboard/models` - List available models
- `GET /api/neural-network-dashboard/stats` - Dashboard statistics
- `GET /api/neural-network-dashboard/templates` - Configuration templates

### 4. Frontend Components

**Files**:
- `frontend/src/pages/NeuralNetworkManagementPage.tsx` - Main dashboard page
- `frontend/src/components/neural/NeuralNetworkInstanceForm.tsx` - Instance creation form
- `frontend/src/components/neural/NeuralNetworkDetailView.tsx` - Instance detail view
- `frontend/src/components/neural/DataStreamManager.tsx` - Data stream management

Features:
- Real-time statistics dashboard
- Instance CRUD operations
- Template-based instance creation
- Data stream visualization
- Attribute configuration
- Crawler/seeder integration status
- SEO metrics display

### 5. Navigation Integration

- Added "Neural Networks" link to sidebar under Advanced section
- Route registered at `/neural-network-management`
- Integrated with existing authentication and layout system

## Setup Instructions

### 1. Database Migration

Run the migration to create all required tables:

```bash
# Using psql directly
psql -U postgres -d lightdom_db -f database/migrations/220-neural-network-enhanced-system.sql

# Or using the project's migration system
npm run db:migrate
```

### 2. Verify Neural Network Category

The neural network category should already exist in the categories table. If not, bootstrap it:

```bash
npm run db:bootstrap:categories
```

### 3. Start the Services

```bash
# Start the full development stack
npm run dev:full

# Or start services individually
npm run api  # API server on port 3001
npm run dev  # Frontend on port 3000
```

### 4. Access the Dashboard

Navigate to: `http://localhost:3000/neural-network-management`

## Usage Guide

### Creating a Neural Network Instance

1. Click "Create Neural Network" button
2. Choose a template (Scraping, SEO, or Data Mining) or configure manually
3. Enter instance details:
   - **Name**: Descriptive name for the instance
   - **Description**: Purpose and use case
   - **Model Type**: Type of neural network
   - **Architecture**: Network layer configuration (JSON)
   - **Training Config**: Training hyperparameters (JSON)
   - **Data Config**: Data source configuration (JSON)
   - **Load Default Models**: Enable to load pre-trained models

4. Click "Create Instance"

The system will automatically:
- Load default pre-trained models for the selected type
- Create default data streams (training input, prediction input, results output)
- Setup default attributes based on model type
- Configure crawler integration (for scraping/SEO types)
- Configure seeder integration

### Managing Data Streams

1. Select a neural network instance
2. Click on the "Data Streams" tab
3. Click "Add Data Stream"
4. Configure the stream:
   - **Stream Type**: input, output, training, evaluation, prediction
   - **Source Type**: database, api, file, stream, model, attributes
   - **Destination Type**: model, database, api, file, stream
   - **Configurations**: JSON configurations for source and destination

### Combining Attributes

To create a combined data stream from multiple attributes:

```bash
POST /api/neural-network-dashboard/instances/:id/combine-attributes
{
  "attribute_ids": ["uuid1", "uuid2", "uuid3"],
  "stream_name": "Combined SEO Features"
}
```

### Attribute Drilldown

View related attributes and their configurations:

1. Navigate to instance attributes
2. Click on an attribute to expand
3. View algorithm, mining, drilldown, and SEO configurations
4. Explore related attributes through the drilldown feature

## Integration Points

### Crawler Integration

Neural networks can enhance crawling through:
- **Priority Scoring**: ML-based URL prioritization
- **Content Filtering**: Intelligent content selection
- **Duplicate Detection**: Advanced similarity detection
- **Dynamic Selectors**: Learning optimal CSS selectors
- **Retry Prediction**: Smart retry strategies

Access crawler config via: `instance.crawler_config`

### Seeder Integration

Neural networks improve seeding with:
- **Topic Translation**: Semantic similarity for related topics
- **URL Generation**: Predicting valuable URLs
- **Related Topics**: Expanding topic suggestions
- **Relevance Scoring**: Prioritizing by relevance

Access seeder config via: `instance.seeder_config`

### SEO Integration

Neural networks optimize SEO through:
- **Keyword Analysis**: Relevance and density optimization
- **Content Quality**: Automated quality scoring
- **Rank Prediction**: Predicting search rankings
- **Trust Scoring**: Authority and trust metrics
- **Recommendations**: Automated optimization suggestions

Access SEO attributes via: `neural_network_seo_attributes` table

## Database Functions

### add_data_stream_to_neural_network

Creates a new data stream for a neural network instance.

```sql
SELECT add_data_stream_to_neural_network(
  'instance-uuid',
  'Training Data Stream',
  'training',
  'database',
  'model',
  '{"table": "training_data"}'::jsonb,
  '{}'::jsonb,
  '[]'::jsonb
);
```

### combine_attributes_for_neural_network

Combines multiple attributes into a single data stream.

```sql
SELECT combine_attributes_for_neural_network(
  'instance-uuid',
  ARRAY['attr-uuid-1', 'attr-uuid-2']::uuid[],
  'Combined Features Stream'
);
```

## Pre-trained Models

The system includes these default models:

1. **crawler_url_prioritization** - URL crawling priority prediction
2. **content_extraction_selector** - CSS selector learning
3. **seo_keyword_optimizer** - Keyword optimization
4. **seo_content_quality** - Content quality evaluation
5. **data_mining_pattern_detector** - Pattern detection
6. **duplicate_content_detector** - Duplicate detection
7. **project_organization_advisor** - Project organization recommendations
8. **crawlee_tensorflow_integration** - Crawlee + TensorFlow integration

## Configuration Templates

### Scraping Template
```json
{
  "model_type": "scraping",
  "architecture": {
    "layers": [
      {"type": "dense", "units": 128, "activation": "relu"},
      {"type": "dropout", "rate": 0.3},
      {"type": "dense", "units": 64, "activation": "relu"},
      {"type": "dense", "units": 1, "activation": "sigmoid"}
    ]
  },
  "training_config": {
    "epochs": 50,
    "batch_size": 32,
    "learning_rate": 0.001,
    "validation_split": 0.2
  }
}
```

### SEO Template
```json
{
  "model_type": "seo",
  "architecture": {
    "layers": [
      {"type": "dense", "units": 256, "activation": "relu"},
      {"type": "dropout", "rate": 0.4},
      {"type": "dense", "units": 128, "activation": "relu"},
      {"type": "dropout", "rate": 0.3},
      {"type": "dense", "units": 64, "activation": "relu"},
      {"type": "dense", "units": 1, "activation": "linear"}
    ]
  },
  "training_config": {
    "epochs": 100,
    "batch_size": 64,
    "learning_rate": 0.0001,
    "validation_split": 0.2
  }
}
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

```bash
# Check database is running
psql -U postgres -d lightdom_db -c "SELECT 1"

# Check environment variables
echo $DATABASE_URL
```

### API Route Not Found

Ensure the API server has loaded the routes:

```bash
# Check server logs for:
"Neural network dashboard routes registered"
```

### Frontend Build Errors

If TypeScript errors occur:

```bash
# Run type check
npm run type-check

# Check for missing dependencies
npm install
```

## Performance Considerations

1. **Database Indexes**: All key foreign keys and frequently queried columns have indexes
2. **Connection Pooling**: PostgreSQL connection pool configured with max 20 connections
3. **Lazy Loading**: Models are loaded on demand, not at startup
4. **Caching**: Consider implementing Redis caching for frequently accessed instances
5. **Batch Operations**: Use batch inserts for training data

## Security

- All API endpoints are protected by authentication middleware
- Input validation on all endpoints
- SQL injection protection through parameterized queries
- Rate limiting on API endpoints
- CORS configuration for frontend access

## Future Enhancements

1. **Real-time Training**: WebSocket support for training progress
2. **Model Versioning**: Track model versions and rollback capability
3. **A/B Testing**: Compare different model configurations
4. **Auto-tuning**: Automatic hyperparameter optimization
5. **Export/Import**: Model and configuration export/import
6. **Monitoring Dashboard**: Real-time performance monitoring
7. **Batch Predictions**: Bulk prediction API
8. **Model Marketplace**: Share and download community models

## API Examples

### Create Scraping Instance

```javascript
const response = await fetch('/api/neural-network-dashboard/instances', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'SEO Crawler Neural Network',
    description: 'Optimizes web crawling for SEO analysis',
    model_type: 'scraping',
    load_default_models: true,
    architecture: {
      layers: [
        { type: 'dense', units: 128, activation: 'relu' },
        { type: 'dropout', rate: 0.3 },
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'sigmoid' }
      ]
    },
    training_config: {
      epochs: 50,
      batch_size: 32,
      learning_rate: 0.001
    }
  })
});

const result = await response.json();
console.log('Created instance:', result.data);
```

### Add Training Data

```javascript
const response = await fetch(`/api/neural-network-dashboard/instances/${instanceId}/training-data`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data_source: 'crawler',
    data_type: 'crawlee',
    input_features: {
      url_depth: 2,
      page_load_time: 1200,
      content_length: 5000,
      keyword_density: 0.02
    },
    target_values: {
      success: true,
      quality_score: 0.85
    }
  })
});
```

## Support

For issues or questions:
- Check the implementation files for inline documentation
- Review the database schema comments
- Check API endpoint documentation in route files
- Refer to existing neural network implementations in `src/ml/`

## License

This implementation is part of the LightDom platform.
