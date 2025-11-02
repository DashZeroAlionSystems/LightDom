# Enhanced Training Data Mining System

## Overview

This system extends the Chrome Layers 3D visualization with deep background data mining capabilities using Puppeteer and Chrome DevTools Protocol. It enables comprehensive data collection from web pages to create training datasets for various ML model functionalities.

## Key Features

### 🤖 **8 Mining Profiles for Different Model Types**

1. **Workflow Predictor** - Mines DOM structure, interaction patterns, data flow paths
2. **Component Generator** - Extracts component patterns, styles, accessibility features
3. **SEO Optimizer** - Collects meta tags, structured data, performance metrics
4. **Performance Optimizer** - Captures resource sizes, render metrics, coverage data
5. **Design System Analyzer** - Mines color palettes, typography, spacing systems
6. **Accessibility Analyzer** - Collects ARIA attributes, contrast data, keyboard nav
7. **Schema Linker** - Extracts data attributes, API endpoints, form fields
8. **UX Pattern Analyzer** - Mines navigation flows, UI states, micro-interactions

### 📦 **Training Bundle Creation**

Create comprehensive training datasets for specific functionalities:
- SEO Optimization
- Component Generation
- Workflow Prediction
- Accessibility Improvement
- UX Pattern Recognition
- Schema Relationship Learning
- Performance Optimization
- Design System Extraction

### 🔗 **Schema Linking Integration**

Automatically links UI components to database schemas:
- Data attribute pattern matching (`data-user-id` → `users` table)
- Role/semantic inference
- Confidence scoring (0-1)
- Relationship graph generation

### 📊 **Attribute Discovery**

Lists valuable attributes for training specific functionalities with:
- Attribute type and description
- Example values
- Usage statistics
- Coverage analysis

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Training Data Mining System                  │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Enhanced    │  │  Training    │  │   Chrome     │
│  Data Mining │  │    Data      │  │   Layers     │
│   Worker     │  │   Bundler    │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  PostgreSQL Database    │
            │  - ml_training_bundles  │
            │  - mined_training_data  │
            │  - attribute_catalog    │
            │  - schema_link_patterns │
            └────────────────────────┘
```

## API Endpoints

### Model Types

#### GET /api/training-data/model-types
List all supported model types and their attributes.

```bash
curl http://localhost:3001/api/training-data/model-types
```

Response:
```json
{
  "success": true,
  "data": {
    "modelTypes": [
      {
        "type": "workflow_predictor",
        "name": "Workflow Pattern Mining",
        "attributes": ["dom_depth", "node_count", "interaction_points", ...]
      },
      ...
    ],
    "total": 8
  }
}
```

### Data Mining

#### POST /api/training-data/mine
Mine data for a specific model type from a single URL.

```bash
curl -X POST http://localhost:3001/api/training-data/mine \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "modelType": "component_generator"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "modelType": "component_generator",
    "timestamp": "2025-11-02T10:30:00Z",
    "attributes": {
      "component_structure": {...},
      "style_patterns": {...},
      ...
    },
    "rawData": {
      "styles": {...},
      "accessibility": {...}
    },
    "qualityScore": 85
  }
}
```

#### POST /api/training-data/mine-batch
Mine data from multiple URLs (max 20).

```bash
curl -X POST http://localhost:3001/api/training-data/mine-batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example1.com", "https://example2.com"],
    "modelType": "seo_optimizer"
  }'
```

### Functionalities

#### GET /api/training-data/functionalities
List all supported functionalities for training bundles.

```bash
curl http://localhost:3001/api/training-data/functionalities
```

Response:
```json
{
  "success": true,
  "data": {
    "functionalities": [
      { "id": "seo_optimization", "name": "SEO Optimization" },
      { "id": "component_generation", "name": "Component Generation" },
      ...
    ],
    "total": 8
  }
}
```

### Training Bundles

#### POST /api/training-data/create-bundle
Create a comprehensive training data bundle.

```bash
curl -X POST http://localhost:3001/api/training-data/create-bundle \
  -H "Content-Type: application/json" \
  -d '{
    "functionality": "seo_optimization",
    "urls": [
      "https://site1.com",
      "https://site2.com",
      ...
    ]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "functionality": "seo_optimization",
    "timestamp": "2025-11-02T10:30:00Z",
    "configuration": {
      "modelTypes": ["seo_optimizer", "performance_optimizer"],
      "requiredAttributes": ["meta_tags", "heading_structure", ...],
      "minQualityScore": 70
    },
    "datasets": [...],
    "metadata": {
      "totalUrls": 50,
      "successfulUrls": 48,
      "totalDataPoints": 432,
      "avgQualityScore": 78.5,
      "attributeCoverage": {
        "meta_tags": { "present": 48, "total": 48, "percentage": "100.00" },
        ...
      }
    },
    "aggregatedAttributes": {...},
    "linkedSchemas": [...],
    "trainingRecommendations": [...]
  }
}
```

### Attribute Discovery

#### POST /api/training-data/discover-attributes
Discover what attributes are valuable for training a specific functionality.

```bash
curl -X POST http://localhost:3001/api/training-data/discover-attributes \
  -H "Content-Type: application/json" \
  -d '{
    "functionality": "component_generation",
    "sampleUrls": ["https://example.com"]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "functionality": "component_generation",
    "description": "Training data for component generation models",
    "requiredAttributes": [
      "component_structure",
      "prop_types",
      "style_patterns",
      ...
    ],
    "modelTypes": ["component_generator", "design_system_analyzer"],
    "minQualityScore": 75,
    "includeLayersData": true,
    "linkSchemas": true,
    "sampleData": {
      "count": 2,
      "examples": [
        {
          "url": "https://example.com",
          "attributesFound": ["component_structure", "style_patterns", ...],
          "qualityScore": 82
        }
      ]
    },
    "attributeDetails": [
      {
        "name": "component_structure",
        "type": "object",
        "description": "Component hierarchy and composition"
      },
      ...
    ]
  }
}
```

### Schema Linking

#### POST /api/training-data/link-schemas
Find schema links in training data.

```bash
curl -X POST http://localhost:3001/api/training-data/link-schemas \
  -H "Content-Type: application/json" \
  -d '{
    "datasets": [...],
    "schemaContext": {}
  }'
```

## Usage Examples

### Basic Data Mining

```javascript
import { EnhancedDataMiningWorker } from './services/enhanced-data-mining-worker.js';

const worker = new EnhancedDataMiningWorker({ workerId: 'example' });
await worker.initialize();

// Mine data for SEO optimization
const seoData = await worker.mineDataForModel(
  'https://example.com',
  'seo_optimizer'
);

console.log('Meta tags:', seoData.rawData.seo.metaTags);
console.log('Quality score:', seoData.qualityScore);

await worker.cleanup();
```

### Create Training Bundle

```javascript
import { TrainingDataBundler } from './services/training-data-bundler.js';

const bundler = new TrainingDataBundler(db);
await bundler.initialize();

// Create bundle for component generation
const bundle = await bundler.createTrainingBundle(
  'component_generation',
  [
    'https://site1.com',
    'https://site2.com',
    'https://site3.com',
    // ... more URLs
  ]
);

console.log('Bundle created with', bundle.datasets.length, 'datasets');
console.log('Quality score:', bundle.metadata.avgQualityScore);
console.log('Recommendations:', bundle.trainingRecommendations);

await bundler.cleanup();
```

### Discover Attributes for a Functionality

```javascript
// Via API
const response = await fetch('/api/training-data/discover-attributes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    functionality: 'workflow_prediction',
    sampleUrls: ['https://example.com']
  })
});

const data = await response.json();
console.log('Required attributes:', data.data.requiredAttributes);
console.log('Attribute details:', data.data.attributeDetails);
```

## Mining Profiles

### Component Generator Profile
Collects:
- Component structure and hierarchy
- Props and state patterns
- Style patterns and CSS usage
- Layout methods (flexbox, grid, etc.)
- Responsive breakpoints
- Accessibility features
- Animation usage
- Reusability scores

### SEO Optimizer Profile
Collects:
- Meta tags (title, description, OG tags)
- Heading structure (H1-H6)
- Schema markup (JSON-LD)
- Internal/external links
- Image alt texts
- Page load time
- Mobile friendliness
- Structured data

### Schema Linker Profile
Collects:
- Data attributes (`data-*`)
- API endpoints from network requests
- Form fields and validation
- Data bindings (React, Vue, Angular)
- CRUD patterns
- Relationship types

## Database Schema

### Tables

1. **ml_training_bundles** - Training data bundles
2. **mined_training_data** - Individual data points
3. **training_attribute_catalog** - Attribute metadata
4. **schema_link_patterns** - Schema linking patterns
5. **model_training_jobs** - Training job tracking

### Views

1. **latest_training_bundles** - Latest bundle per functionality
2. **attribute_usage_stats** - Attribute usage statistics
3. **schema_link_confidence_dist** - Schema link confidence distribution
4. **training_job_stats** - Training job success rates

## Quality Scoring

Quality scores (0-100) are calculated based on:
- Data completeness
- Attribute coverage
- Valid format
- Rich metadata
- Schema linkability

Recommendations are generated when:
- Quality score < minimum threshold
- Attribute coverage < 50%
- Dataset size too small
- Schema links missing

## Performance

- **Analysis Time**: 3-10 seconds per URL (depending on profile)
- **Worker Pool**: 3 concurrent workers
- **Batch Limit**: 20 URLs per batch
- **Memory**: ~600MB for 3 workers
- **CDP Domains**: Up to 7 domains per profile

## Integration with Chrome Layers

The enhanced training data system integrates with Chrome Layers:
- Shares Puppeteer browser instances
- Combines layer data with mined data
- Links components to schemas
- Aggregates 3D map data with attributes

## Future Enhancements

- [ ] Real-time streaming of mined data
- [ ] ML model training integration
- [ ] Automated attribute discovery
- [ ] Cross-site pattern matching
- [ ] Distributed worker pools
- [ ] GPU-accelerated analysis
- [ ] Incremental bundle updates

## Examples Directory

See `/examples/training-data-mining/` for:
- Complete mining examples
- Bundle creation workflows
- Schema linking demos
- Attribute discovery examples
- Integration patterns

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Documentation**: Complete
