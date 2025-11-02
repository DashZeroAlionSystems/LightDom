# Chrome Layers Panel 3D Visualization System

![Chrome Layers](https://img.shields.io/badge/Chrome-Layers-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

The Chrome Layers Panel 3D Visualization System provides a comprehensive solution for analyzing and visualizing DOM layers in 3D, similar to the Chrome DevTools Layers panel. This system extracts compositing layers, maps components to schemas, generates training data, and provides interactive visualization capabilities.

## Features

### 🎨 3D Layer Visualization
- **Compositing Layer Analysis**: Identifies GPU-accelerated layers using Chrome DevTools Protocol (CDP)
- **Z-Index Mapping**: Extracts and visualizes stacking contexts and z-index hierarchies
- **Paint Order Tracking**: Analyzes the browser's paint order for accurate 3D representation
- **Interactive Rotation**: Pan, zoom, and rotate the 3D visualization in real-time

### 🗺️ Component Position Mapping
- **Automatic Discovery**: Detects all UI components with semantic analysis
- **Position Ordering**: Sorts components by visual position (top-to-bottom, left-to-right)
- **Bounds Calculation**: Precise bounding box calculations for each component
- **Layer Association**: Links components to their corresponding layers

### 🔗 Schema Linking
- **Intelligent Mapping**: Connects DOM components to database schemas
- **Data Attribute Analysis**: Extracts schema hints from data attributes
- **Semantic Matching**: Uses AI to infer schema relationships
- **Confidence Scoring**: Provides confidence levels for each schema link

### 🧠 Training Data Mining
- **Pattern Extraction**: Discovers common layer patterns across websites
- **Structure Analysis**: Analyzes component hierarchies and relationships
- **Design Rule Validation**: Validates against best practices and design rules
- **ML Dataset Generation**: Creates training datasets for machine learning models

### 📊 Interactive Dashboard
- **Multiple Views**: 3D view, 2D diagram, component list, and schema links
- **Click-to-Highlight**: Select components to highlight their layers
- **Real-time Analysis**: Analyze any URL on-demand
- **Export Capabilities**: Export analysis data and visualizations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Chrome Layers System                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Service    │    │   API Routes │    │  Dashboard   │
│   Layer      │◄───┤              │◄───┤  Component   │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  Chrome DevTools Protocol (CDP)      │
│  - LayerTree API                     │
│  - DOMSnapshot API                   │
│  - CSS Coverage                      │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  Headless Chrome (Puppeteer)         │
└──────────────────────────────────────┘
```

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis (optional, for caching)
- Chrome/Chromium browser

### Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Database**
```bash
# Run the schema migration
psql -U postgres -d dom_space_harvester -f database/138-chrome-layers-schema.sql
```

3. **Environment Variables**
```bash
# .env
HEADLESS=true                    # Run browser in headless mode
CACHE_ENABLED=true              # Enable Redis caching
REDIS_URL=redis://localhost:6379
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password
```

## Usage

### API Endpoints

#### Analyze URL
```bash
POST /api/layers/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "includeTrainingData": true,
    "designRules": {
      "maxZIndex": 10000,
      "compositingBestPractices": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "url": "https://example.com",
      "timestamp": "2025-11-02T10:00:00Z",
      "layers": [...],
      "componentMap": [...],
      "map3D": [...],
      "metadata": {
        "totalLayers": 125,
        "compositingLayers": 12,
        "maxZIndex": 999,
        "viewport": { ... }
      }
    },
    "trainingData": { ... }
  }
}
```

#### Get 3D Map
```bash
POST /api/layers/3d-map
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "threejs"  // or "d3" or "raw"
}
```

#### Get Component Map
```bash
POST /api/layers/component-map
Content-Type: application/json

{
  "url": "https://example.com",
  "includeSchemas": true
}
```

#### Extract Training Data
```bash
POST /api/layers/training-data
Content-Type: application/json

{
  "url": "https://example.com",
  "designRules": {
    "maxZIndex": 10000,
    "maxCompositingLayers": 50
  },
  "saveToDB": true
}
```

#### Batch Analysis
```bash
POST /api/layers/batch-analyze
Content-Type: application/json

{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ],
  "options": { ... }
}
```

#### Get Design Rules
```bash
GET /api/layers/design-rules
```

### Dashboard Access

Navigate to the Chrome Layers dashboard:
```
http://localhost:3000/dashboard/chrome-layers
```

Or in admin mode:
```
http://localhost:3000/admin/chrome-layers
```

### Programmatic Usage

```javascript
import { ChromeLayersService } from './services/chrome-layers-service.js';

const service = new ChromeLayersService({
  headless: true,
  cacheEnabled: true
});

await service.initialize();

// Analyze a URL
const analysis = await service.analyzeLayersForUrl('https://example.com');

console.log('Total layers:', analysis.metadata.totalLayers);
console.log('Compositing layers:', analysis.metadata.compositingLayers);

// Extract training data
const trainingData = await service.extractTrainingData(
  'https://example.com',
  analysis,
  {
    designRules: {
      maxZIndex: 10000,
      compositingBestPractices: true
    }
  }
);

console.log('Patterns:', trainingData.patterns);
console.log('Relationships:', trainingData.relationships.length);

// Cleanup
await service.cleanup();
```

### Demo Script

Run the interactive demo:
```bash
node chrome-layers-demo.js
```

This will:
1. Analyze multiple demo URLs
2. Extract layer data and 3D maps
3. Generate training data
4. Create visualization HTML files
5. Save results to `./output/chrome-layers/`

## Data Model

### Layer Object
```typescript
interface Layer {
  id: string;
  nodeId: number;
  nodeName: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zIndex: number;
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  transform: string;
  opacity: number;
  willChange: string;
  paintOrder: number;
  isComposited: boolean;
  styles: Record<string, string>;
}
```

### 3D Map Object
```typescript
interface Map3D {
  layerId: string;
  position: {
    x: number;  // Center X
    y: number;  // Center Y
    z: number;  // Depth (paint order + z-index)
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  color: string;
  metadata: {
    nodeName: string;
    isComposited: boolean;
    opacity: number;
    hasTransform: boolean;
  };
}
```

### Component Object
```typescript
interface Component {
  componentId: string;
  selector: string;
  tagName: string;
  id: string | null;
  className: string | null;
  bounds: Bounds;
  zIndex: string;
  position: string;
  role: string | null;
  ariaLabel: string | null;
  dataAttributes: Record<string, string>;
  layerId: string | null;
}
```

### Training Data Object
```typescript
interface TrainingData {
  url: string;
  timestamp: string;
  structure: {
    layerCount: number;
    compositingLayerCount: number;
    maxDepth: number;
    componentCount: number;
  };
  patterns: {
    zIndexDistribution: Statistics;
    compositingTriggers: Record<string, number>;
    layoutPatterns: Record<string, number>;
    componentHierarchy: Hierarchy;
  };
  components: ComponentPattern[];
  relationships: Relationship[];
  designRules: {
    rules: DesignRules;
    violations: Violation[];
    recommendations: Recommendation[];
  };
}
```

## Design Rules

### Default Rules
```javascript
{
  maxZIndex: 10000,
  minComponentSize: { width: 10, height: 10 },
  maxCompositingLayers: 50,
  compositingBestPractices: true,
  performanceThresholds: {
    maxLayerCount: 500,
    maxPaintComplexity: 1000
  }
}
```

### Custom Rules by Site Type
- **E-commerce**: Stricter z-index limits, optimized for product displays
- **Dashboard**: More compositing layers allowed, focus on smooth animations
- **Blog**: Minimal compositing, emphasis on content readability

## Database Schema

The system stores data in PostgreSQL with the following tables:

- `layer_training_data` - Main training data storage
- `layer_analysis_cache` - Cached analysis results
- `component_3d_maps` - 3D position data for components
- `component_schema_links` - Component-to-schema mappings
- `design_rule_violations` - Rule violation tracking
- `layer_patterns` - Discovered patterns for ML

See `database/138-chrome-layers-schema.sql` for full schema.

## Performance Optimization

### Caching
- Redis caching for analysis results (1 hour TTL)
- Database query optimization with indexes
- Lazy loading of heavy visualizations

### Browser Optimization
- Headless mode by default
- GPU acceleration disabled for consistency
- Image loading disabled for speed
- JavaScript execution controlled

### Analysis Optimization
- Parallel processing for batch analysis
- Incremental rendering for large DOMs
- Selective layer analysis (composited only)

## Integration with Existing Systems

### Schema Linking Integration
```javascript
// Link components to existing schema linking service
const linkedSchemas = await linkComponentsToSchemas(
  componentMap,
  schemaLinkingService
);
```

### Training Data Pipeline
```javascript
// Add to training data pipeline
await trainingPipeline.addLayerData(trainingData);
```

### Workflow Integration
```javascript
// Create workflow from layer analysis
const workflow = await workflowGenerator.generateFromLayers(analysis);
```

## Troubleshooting

### Common Issues

**Browser doesn't launch:**
```bash
# Install Chrome dependencies
sudo apt-get install -y chromium-browser
```

**Analysis fails with timeout:**
```bash
# Increase timeout in service options
const service = new ChromeLayersService({
  timeout: 60000  // 60 seconds
});
```

**Redis connection error:**
```bash
# Disable caching if Redis is not available
const service = new ChromeLayersService({
  cacheEnabled: false
});
```

**Database connection error:**
```bash
# Ensure PostgreSQL is running and migrations are applied
psql -U postgres -d dom_space_harvester -f database/138-chrome-layers-schema.sql
```

## Examples

### Example 1: Analyze and Visualize
```javascript
const analysis = await service.analyzeLayersForUrl('https://github.com');

// Get top composited layers
const composited = analysis.layers
  .filter(l => l.isComposited)
  .sort((a, b) => b.zIndex - a.zIndex);

console.log('Top composited layers:', composited.slice(0, 5));
```

### Example 2: Find Performance Issues
```javascript
const trainingData = await service.extractTrainingData(url, analysis);

// Check for violations
if (trainingData.designRules.violations.length > 0) {
  console.log('Performance issues found:');
  trainingData.designRules.violations.forEach(v => {
    console.log(`- ${v.type}: ${v.message}`);
  });
}
```

### Example 3: Export for ML Training
```javascript
const batch = await batchAnalyze([
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
]);

// Export training dataset
const dataset = batch.results
  .filter(r => r.success)
  .map(r => r.data.trainingData);

fs.writeFileSync('training-dataset.json', JSON.stringify(dataset, null, 2));
```

## Roadmap

- [ ] Three.js integration for true 3D rendering
- [ ] WebGL shader-based layer visualization
- [ ] Real-time layer updates via WebSocket
- [ ] Chrome Extension integration
- [ ] Automated performance testing
- [ ] AI-powered layer optimization suggestions
- [ ] Multi-page analysis and comparison
- [ ] Export to Figma/Sketch formats

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Support

- Documentation: [docs/chrome-layers/](../docs/chrome-layers/)
- Issues: [GitHub Issues](https://github.com/DashZeroAlionSystems/LightDom/issues)
- Discord: [LightDom Community](https://discord.gg/lightdom)

## Credits

Inspired by Chrome DevTools Layers panel and built on:
- Puppeteer for headless Chrome automation
- Chrome DevTools Protocol for layer analysis
- D3.js for 2D visualizations
- Ant Design for UI components

---

**Built with ❤️ by the LightDom Team**
