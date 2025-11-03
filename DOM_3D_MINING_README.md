# 3D DOM Data Mining System

## 🎯 Overview

The 3D DOM Data Mining System is an advanced tool that renders 3D models of DOM structures, extracts semantic hierarchies, links schemas together, and generates rich SEO metadata for optimization and training data generation.

## ✨ Features

### 1. 3D DOM Visualization
- **Chrome Layers Integration**: Uses Chrome DevTools Protocol to extract 3D layer information
- **Importance Scoring**: Automatically identifies important elements based on semantic value
- **GPU Acceleration**: Conditional GPU usage for faster rendering (when available)
- **Hierarchical Structure**: Maintains DOM hierarchy with depth-based importance

### 2. Schema Extraction & Linking
- **JSON-LD Detection**: Extracts existing JSON-LD structured data
- **Microdata Support**: Parses schema.org microdata annotations
- **RDFa Support**: Basic RDFa attribute extraction
- **Schema Linking**: Automatically links related schemas based on semantic relationships
- **Missing Schema Detection**: Recommends schemas based on content structure

### 3. SEO Optimization
- **Comprehensive Metadata Extraction**: Title, meta tags, headings, images, links
- **SEO Scoring**: Calculates SEO score (0-100) based on best practices
- **Recommendations Engine**: Generates actionable SEO improvement recommendations
- **Rich Snippet Generation**: Identifies opportunities for rich search results
- **Open Graph & Twitter Cards**: Extracts social media metadata

### 4. ML Training Data
- **Feature Extraction**: Generates 20+ features from DOM structure and SEO data
- **Label Generation**: SEO scores and rich snippet availability as labels
- **Dataset Creation**: Batch processing for ML model training
- **Schema Training**: Uses schema patterns as training data for better SEO predictions

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```javascript
import { DOM3DDataMiningService } from './services/dom-3d-datamining-service.js';

// Initialize service
const miningService = new DOM3DDataMiningService({
  headless: true,
  maxDepth: 8,
  minImportanceScore: 0.4
});

await miningService.initialize();

// Mine a URL
const result = await miningService.mineURL('https://example.com');

console.log('SEO Score:', result.metadata.seoScore);
console.log('Schemas Found:', Object.keys(result.schemas.byType));
console.log('3D Layers:', result.dom3DModel.layers.length);

await miningService.shutdown();
```

### Run Demo

```bash
node demo-dom-3d-mining.js
```

## 📊 Output Structure

### Complete Mining Result

```javascript
{
  url: "https://example.com",
  timestamp: "2025-11-03T...",
  
  // 3D DOM Model
  dom3DModel: {
    layers: [
      {
        id: "layer-0",
        nodeName: "HEADER",
        position3D: { x: 0, y: 0, z: 1000, width: 1920, height: 80 },
        importance: 0.8,
        isComposited: true
      }
    ],
    bounds: { width: 1920, height: 3000 },
    viewport: { width: 1920, height: 1080 }
  },
  
  // DOM Hierarchy
  domHierarchy: {
    root: { tag: "BODY", depth: 0, children: [...] },
    importantElements: [...],
    totalElements: 247
  },
  
  // Schemas
  schemas: {
    byType: {
      "Organization": [...],
      "Article": [...]
    },
    relationships: [
      { parent: "Organization", child: "Person", type: "contains" }
    ],
    recommendations: [
      {
        type: "Article",
        reason: "Found 3 article element(s)",
        priority: "high",
        template: { ... }
      }
    ]
  },
  
  // SEO Data
  seo: {
    metadata: {
      title: "Example Page",
      meta: { description: "...", ... },
      headings: { h1: { count: 1, text: [...] }, ... },
      links: { internal: 45, external: 12, canonical: "..." },
      images: { total: 23, withAlt: 20, withoutAlt: 3 }
    },
    richSnippets: [
      {
        type: "Article",
        status: "present",
        recommendation: "Ensure all required fields are filled",
        preview: "Rich article cards in search results"
      }
    ],
    recommendations: [
      { type: "title", severity: "high", message: "..." }
    ]
  },
  
  // Training Data
  trainingData: {
    features: {
      totalLayers: 47,
      schemaTypes: 3,
      titleLength: 52,
      h1Count: 1,
      imageAltRatio: 0.87,
      ...
    },
    labels: {
      seoScore: 78.5,
      hasRichSnippets: true
    }
  },
  
  // Metadata
  metadata: {
    processingTime: 2453,
    totalElements: 247,
    importantElements: 42,
    layerCount: 47,
    schemaTypes: 3,
    seoScore: 78.5
  }
}
```

## 🎯 Use Cases

### 1. SEO Audit & Optimization

```javascript
const result = await miningService.mineURL('https://yoursite.com');

// Check SEO score
console.log('SEO Score:', result.metadata.seoScore);

// Get recommendations
result.seo.recommendations.forEach(rec => {
  console.log(`[${rec.severity}] ${rec.message}`);
});

// Rich snippet opportunities
result.seo.richSnippets.forEach(snippet => {
  console.log(`Add ${snippet.type} for: ${snippet.preview}`);
});
```

### 2. Schema Generation

```javascript
const result = await miningService.mineURL('https://yoursite.com');

// Get schema recommendations
result.schemas.recommendations.forEach(rec => {
  console.log(`Add ${rec.type} schema:`);
  console.log(JSON.stringify(rec.template, null, 2));
});

// Existing schemas
Object.keys(result.schemas.byType).forEach(type => {
  console.log(`Found ${type}:`, result.schemas.byType[type].length);
});
```

### 3. Training Data Collection

```javascript
const urls = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

const trainingDataset = [];

for (const url of urls) {
  const result = await miningService.mineURL(url);
  trainingDataset.push(result.trainingData);
}

// Save for ML training
fs.writeFileSync(
  'seo-training-data.json',
  JSON.stringify({ samples: trainingDataset }, null, 2)
);
```

### 4. 3D Visualization Data

```javascript
const result = await miningService.mineURL('https://yoursite.com');

// Export 3D model for visualization
const visualization = {
  layers: result.dom3DModel.layers.map(layer => ({
    position: [layer.position3D.x, layer.position3D.y, layer.position3D.z],
    size: [layer.position3D.width, layer.position3D.height],
    importance: layer.importance,
    name: layer.nodeName
  }))
};

// Use with Three.js, D3.js, or other 3D libraries
```

### 5. Batch Processing Workflow

```javascript
import { DOM3DDataMiningService } from './services/dom-3d-datamining-service.js';

const miningService = new DOM3DDataMiningService();
await miningService.initialize();

// Process multiple URLs
const urlList = await getURLsFromDatabase();

for (const url of urlList) {
  try {
    const result = await miningService.mineURL(url);
    
    // Store results
    await storeInDatabase({
      url,
      seoScore: result.metadata.seoScore,
      schemas: result.schemas.byType,
      recommendations: result.seo.recommendations
    });
    
  } catch (error) {
    console.error(`Failed to mine ${url}:`, error);
  }
}

await miningService.shutdown();
```

## 🔧 Configuration Options

```javascript
const miningService = new DOM3DDataMiningService({
  // Browser options
  headless: true,              // Run in headless mode
  timeout: 30000,              // Page load timeout (ms)
  
  // Mining options
  maxDepth: 10,                // Maximum DOM depth to traverse
  minImportanceScore: 0.3,     // Minimum importance to include element
  
  // Performance
  enableGPU: true              // Try to use GPU acceleration
});
```

## 📈 SEO Scoring Algorithm

The SEO score (0-100) is calculated based on:

| Factor | Max Points | Criteria |
|--------|-----------|----------|
| Title | 10 | 30-60 characters optimal |
| Meta Description | 10 | 120+ characters |
| H1 Tag | 10 | Exactly one H1 |
| Heading Structure | 10 | H2 and H3 present |
| Image Alt Text | 10 | All images have alt text |
| Structured Data | 20 | Schema.org markup present |
| Open Graph | 10 | 4+ OG tags |
| Canonical Link | 5 | Canonical URL specified |
| Internal Links | 10 | 10+ internal links |
| Mobile Friendly | 5 | Viewport meta tag |

## 🧠 ML Training Features

### Extracted Features (20+)

**DOM Structure:**
- `totalLayers`: Number of rendering layers
- `compositedLayers`: GPU-accelerated layers
- `avgLayerImportance`: Average importance score
- `maxZDepth`: Maximum z-index depth

**Schema Features:**
- `schemaTypes`: Number of schema types
- `hasOrganization`: Organization schema present
- `hasArticle`: Article schema present
- `hasProduct`: Product schema present

**SEO Features:**
- `titleLength`: Character count
- `hasMetaDescription`: Boolean
- `h1Count`, `h2Count`: Heading counts
- `imageAltRatio`: % of images with alt text
- `internalLinks`, `externalLinks`: Link counts
- `hasOpenGraph`: Social media tags present
- `hasCanonical`: Canonical link present

### Labels

- `seoScore`: Overall SEO score (0-100)
- `hasRichSnippets`: Rich snippet eligibility

## 🔗 Integration with Existing Systems

### Data Mining Workflow

```javascript
// Add to existing data mining workflow
import { DOM3DDataMiningService } from './services/dom-3d-datamining-service.js';

// In your workflow
const dom3DMiner = new DOM3DDataMiningService();
await dom3DMiner.initialize();

// Add as a mining step
workflowSteps.push({
  name: '3D DOM Analysis',
  handler: async (url) => {
    const result = await dom3DMiner.mineURL(url);
    return {
      seoScore: result.metadata.seoScore,
      schemas: result.schemas,
      recommendations: result.seo.recommendations
    };
  }
});
```

### Chrome Layers Service

The 3D mining service extends the existing Chrome Layers functionality with:
- SEO metadata extraction
- Schema linking
- Training data generation
- Rich snippet recommendations

### Schema Linking Service

Integrates with the schema linking service for:
- Database schema relationships
- Feature interaction mapping
- Workflow generation

## 📚 API Reference

### DOM3DDataMiningService

#### `initialize()`
Initialize the service and launch browser.

#### `mineURL(url, options)`
Mine a URL and return complete analysis.
- **Parameters:**
  - `url` (string): URL to mine
  - `options` (object): Optional mining options
- **Returns:** Complete mining result object

#### `getPerformanceReport()`
Get performance metrics for the service.

#### `shutdown()`
Close browser and cleanup resources.

## 🎨 3D Visualization Example

The 3D model data can be visualized using Three.js:

```javascript
// Example: Create 3D visualization with Three.js
import * as THREE from 'three';

function visualize3DModel(dom3DModel) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
  const renderer = new THREE.WebGLRenderer();

  // Add layers as 3D boxes
  dom3DModel.layers.forEach(layer => {
    const geometry = new THREE.BoxGeometry(
      layer.position3D.width / 100,
      layer.position3D.height / 100,
      10
    );
    
    // Color by importance
    const color = new THREE.Color(
      layer.importance,
      1 - layer.importance,
      0.5
    );
    
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    
    cube.position.set(
      layer.position3D.x / 100,
      -layer.position3D.y / 100,
      layer.position3D.z / 100
    );
    
    scene.add(cube);
  });

  camera.position.z = 50;
  
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  
  animate();
}
```

## 🔍 Troubleshooting

### High Memory Usage

Reduce `maxDepth` or increase `minImportanceScore` to process fewer elements.

```javascript
const miningService = new DOM3DDataMiningService({
  maxDepth: 5,
  minImportanceScore: 0.5
});
```

### Slow Processing

Enable GPU acceleration (if available) and reduce timeout:

```javascript
const miningService = new DOM3DDataMiningService({
  enableGPU: true,
  timeout: 15000
});
```

### Missing Schemas

Check that the site actually has schema markup. Use the recommendations to add missing schemas.

## 📖 Related Documentation

- [GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md](./GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md) - GPU and performance research
- [INTEGRATION_EXAMPLES.js](./INTEGRATION_EXAMPLES.js) - Integration patterns
- [GPU_IMPLEMENTATION_GUIDE.md](./GPU_IMPLEMENTATION_GUIDE.md) - Implementation guide

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional schema types
- More SEO metrics
- Enhanced 3D visualization
- ML model integration
- Performance optimizations

---

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**License:** MIT
