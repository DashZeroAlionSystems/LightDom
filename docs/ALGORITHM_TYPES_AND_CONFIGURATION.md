# Algorithm Types and Configuration Schema

## Overview

This document describes all algorithm types used in the LightDom platform, their configurations, and how to integrate them into workflows. All algorithms can be configured via schema and used in n8n workflows.

## Algorithm Categories

1. **Data Mining Algorithms**
2. **Pattern Detection Algorithms**
3. **Optimization Algorithms**
4. **Machine Learning Algorithms**
5. **Text Processing Algorithms**
6. **Image Processing Algorithms**
7. **Graph Algorithms**

---

## 1. Data Mining Algorithms

### 1.1 Web Scraping Algorithm

**Purpose**: Extract structured data from web pages

**Configuration Schema**:
```json
{
  "algorithm": "web_scraping",
  "version": "1.0",
  "config": {
    "url": {
      "type": "string",
      "required": true,
      "description": "Target URL to scrape"
    },
    "selectors": {
      "type": "object",
      "required": true,
      "description": "CSS selectors for data extraction",
      "properties": {
        "title": { "type": "string" },
        "content": { "type": "string" },
        "images": { "type": "string" },
        "links": { "type": "string" }
      }
    },
    "waitFor": {
      "type": "string",
      "default": "networkidle2",
      "enum": ["load", "domcontentloaded", "networkidle0", "networkidle2"]
    },
    "javascript": {
      "type": "boolean",
      "default": true,
      "description": "Execute JavaScript on page"
    },
    "timeout": {
      "type": "number",
      "default": 30000,
      "description": "Timeout in milliseconds"
    }
  },
  "output": {
    "data": {
      "type": "object",
      "description": "Extracted data matching selector keys"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "url": "string",
        "timestamp": "string",
        "loadTime": "number"
      }
    }
  }
}
```

**Cost**: Low to Medium (depending on JavaScript execution)

---

### 1.2 DOM Space Harvesting Algorithm

**Purpose**: Calculate DOM space metrics and optimization opportunities

**Configuration Schema**:
```json
{
  "algorithm": "dom_space_harvesting",
  "version": "2.0",
  "config": {
    "url": {
      "type": "string",
      "required": true
    },
    "metrics": {
      "type": "array",
      "items": {
        "enum": [
          "dom_size",
          "unused_css",
          "unused_js",
          "render_blocking",
          "paint_metrics",
          "layout_shifts"
        ]
      },
      "default": ["dom_size", "unused_css", "unused_js"]
    },
    "depth": {
      "type": "number",
      "default": 10,
      "description": "Maximum DOM tree depth to analyze"
    },
    "includeStyles": {
      "type": "boolean",
      "default": true
    },
    "includeScripts": {
      "type": "boolean",
      "default": true
    }
  },
  "output": {
    "domSpaceBytes": "number",
    "optimizationPotential": "number",
    "recommendations": "array",
    "blockchainProof": "object"
  }
}
```

**Cost**: Medium (requires browser execution)

---

## 2. Pattern Detection Algorithms

### 2.1 Regex Pattern Matcher

**Purpose**: Detect patterns in text using regular expressions

**Configuration Schema**:
```json
{
  "algorithm": "regex_pattern_matcher",
  "version": "1.0",
  "config": {
    "patterns": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "regex": { "type": "string" },
          "flags": { "type": "string", "default": "gi" }
        }
      }
    },
    "text": {
      "type": "string",
      "required": true,
      "description": "Text to search"
    },
    "returnMatches": {
      "type": "boolean",
      "default": true,
      "description": "Return actual matches or just counts"
    },
    "maxMatches": {
      "type": "number",
      "default": 1000,
      "description": "Maximum matches to return per pattern"
    }
  },
  "output": {
    "patterns": {
      "type": "array",
      "items": {
        "name": "string",
        "matches": "array",
        "count": "number"
      }
    }
  }
}
```

**Cost**: Very Low

---

### 2.2 Visual Pattern Detector

**Purpose**: Detect visual patterns in images and screenshots

**Configuration Schema**:
```json
{
  "algorithm": "visual_pattern_detector",
  "version": "1.0",
  "config": {
    "image": {
      "type": "string",
      "format": "base64",
      "required": true
    },
    "patterns": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "faces",
          "text_regions",
          "logos",
          "buttons",
          "forms",
          "navigation",
          "custom"
        ]
      }
    },
    "customPatterns": {
      "type": "array",
      "description": "Custom pattern definitions"
    },
    "confidence": {
      "type": "number",
      "default": 0.7,
      "minimum": 0,
      "maximum": 1
    }
  },
  "output": {
    "detections": {
      "type": "array",
      "items": {
        "pattern": "string",
        "confidence": "number",
        "boundingBox": "object",
        "metadata": "object"
      }
    }
  }
}
```

**Cost**: High (requires ML models)

---

## 3. Optimization Algorithms

### 3.1 DOM Optimization Algorithm

**Purpose**: Optimize DOM structure for performance

**Configuration Schema**:
```json
{
  "algorithm": "dom_optimization",
  "version": "2.0",
  "config": {
    "html": {
      "type": "string",
      "required": true
    },
    "optimizations": {
      "type": "array",
      "items": {
        "enum": [
          "remove_unused_elements",
          "inline_critical_css",
          "defer_scripts",
          "lazy_load_images",
          "minify_html",
          "reduce_nesting"
        ]
      },
      "default": ["remove_unused_elements", "defer_scripts", "lazy_load_images"]
    },
    "targetSize": {
      "type": "number",
      "description": "Target size in bytes"
    },
    "preserveLayout": {
      "type": "boolean",
      "default": true
    }
  },
  "output": {
    "optimizedHtml": "string",
    "savings": {
      "bytes": "number",
      "percentage": "number"
    },
    "appliedOptimizations": "array"
  }
}
```

**Cost**: Low to Medium

---

### 3.2 Performance Optimization Algorithm

**Purpose**: Optimize overall page performance

**Configuration Schema**:
```json
{
  "algorithm": "performance_optimization",
  "version": "1.0",
  "config": {
    "url": {
      "type": "string",
      "required": true
    },
    "metrics": {
      "type": "array",
      "items": {
        "enum": [
          "fcp",
          "lcp",
          "cls",
          "fid",
          "ttfb",
          "tti"
        ]
      }
    },
    "targets": {
      "type": "object",
      "properties": {
        "fcp": { "type": "number", "default": 1800 },
        "lcp": { "type": "number", "default": 2500 },
        "cls": { "type": "number", "default": 0.1 }
      }
    },
    "autoFix": {
      "type": "boolean",
      "default": false,
      "description": "Automatically apply fixes"
    }
  },
  "output": {
    "currentMetrics": "object",
    "recommendations": "array",
    "estimatedImprovements": "object"
  }
}
```

**Cost**: High (requires full performance analysis)

---

## 4. Machine Learning Algorithms

### 4.1 SEO Content Classification

**Purpose**: Classify content for SEO optimization

**Configuration Schema**:
```json
{
  "algorithm": "seo_content_classification",
  "version": "1.0",
  "config": {
    "content": {
      "type": "string",
      "required": true
    },
    "model": {
      "type": "string",
      "enum": ["bert", "gpt", "custom"],
      "default": "bert"
    },
    "categories": {
      "type": "array",
      "items": "string",
      "default": [
        "informational",
        "transactional",
        "navigational",
        "commercial"
      ]
    },
    "language": {
      "type": "string",
      "default": "en"
    }
  },
  "output": {
    "category": "string",
    "confidence": "number",
    "keywords": "array",
    "sentiment": "object"
  }
}
```

**Cost**: Medium to High (ML model inference)

---

### 4.2 Backlink Quality Analysis

**Purpose**: Analyze backlink quality using ML

**Configuration Schema**:
```json
{
  "algorithm": "backlink_quality_analysis",
  "version": "1.0",
  "config": {
    "backlinks": {
      "type": "array",
      "required": true,
      "items": {
        "type": "object",
        "properties": {
          "url": "string",
          "anchorText": "string",
          "domain": "string"
        }
      }
    },
    "features": {
      "type": "array",
      "items": {
        "enum": [
          "domain_authority",
          "page_authority",
          "spam_score",
          "relevance",
          "anchor_text_quality"
        ]
      },
      "default": ["domain_authority", "spam_score", "relevance"]
    }
  },
  "output": {
    "qualityScore": "number",
    "riskAssessment": "object",
    "recommendations": "array"
  }
}
```

**Cost**: Medium (requires external API calls)

---

## 5. Text Processing Algorithms

### 5.1 OCR Text Extraction

**Purpose**: Extract text from images

**Configuration Schema**:
```json
{
  "algorithm": "ocr_text_extraction",
  "version": "1.0",
  "config": {
    "image": {
      "type": "string",
      "format": "base64",
      "required": true
    },
    "languages": {
      "type": "array",
      "items": "string",
      "default": ["eng"]
    },
    "engine": {
      "type": "string",
      "enum": ["tesseract", "google-vision", "aws-textract"],
      "default": "tesseract"
    },
    "preprocessing": {
      "type": "object",
      "properties": {
        "denoise": { "type": "boolean", "default": true },
        "enhance": { "type": "boolean", "default": true },
        "deskew": { "type": "boolean", "default": true }
      }
    }
  },
  "output": {
    "text": "string",
    "confidence": "number",
    "blocks": "array",
    "metadata": "object"
  }
}
```

**Cost**: Low to High (depending on engine)

---

### 5.2 Keyword Extraction

**Purpose**: Extract important keywords from text

**Configuration Schema**:
```json
{
  "algorithm": "keyword_extraction",
  "version": "1.0",
  "config": {
    "text": {
      "type": "string",
      "required": true
    },
    "method": {
      "type": "string",
      "enum": ["tfidf", "rake", "yake", "textrank"],
      "default": "rake"
    },
    "maxKeywords": {
      "type": "number",
      "default": 10
    },
    "language": {
      "type": "string",
      "default": "en"
    }
  },
  "output": {
    "keywords": {
      "type": "array",
      "items": {
        "keyword": "string",
        "score": "number"
      }
    }
  }
}
```

**Cost**: Low

---

## 6. Image Processing Algorithms

### 6.1 Image Compression

**Purpose**: Compress images while maintaining quality

**Configuration Schema**:
```json
{
  "algorithm": "image_compression",
  "version": "1.0",
  "config": {
    "image": {
      "type": "string",
      "format": "base64",
      "required": true
    },
    "quality": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "default": 85
    },
    "format": {
      "type": "string",
      "enum": ["jpeg", "png", "webp", "avif"],
      "default": "webp"
    },
    "maxWidth": {
      "type": "number",
      "description": "Maximum width (auto-scale)"
    },
    "maxHeight": {
      "type": "number",
      "description": "Maximum height (auto-scale)"
    }
  },
  "output": {
    "image": "string",
    "originalSize": "number",
    "compressedSize": "number",
    "savings": "number"
  }
}
```

**Cost**: Low

---

## 7. Graph Algorithms

### 7.1 Link Analysis (PageRank)

**Purpose**: Analyze link structure and importance

**Configuration Schema**:
```json
{
  "algorithm": "pagerank",
  "version": "1.0",
  "config": {
    "graph": {
      "type": "object",
      "required": true,
      "properties": {
        "nodes": {
          "type": "array",
          "items": { "id": "string" }
        },
        "edges": {
          "type": "array",
          "items": {
            "from": "string",
            "to": "string"
          }
        }
      }
    },
    "dampingFactor": {
      "type": "number",
      "default": 0.85,
      "minimum": 0,
      "maximum": 1
    },
    "iterations": {
      "type": "number",
      "default": 100
    }
  },
  "output": {
    "ranks": {
      "type": "object",
      "description": "Node ID to rank mapping"
    }
  }
}
```

**Cost**: Low to Medium

---

## Algorithm Configuration Best Practices

### 1. Schema Validation

Always validate algorithm configurations:

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = {
  // Algorithm schema definition
};

const validate = ajv.compile(schema);
const valid = validate(config);

if (!valid) {
  console.error('[workflow][algorithm][validation] - error -', validate.errors);
  throw new Error('Invalid configuration');
}
```

### 2. Cost Optimization

Choose appropriate algorithms based on scale:

```javascript
const algorithmCosts = {
  web_scraping: {
    low: ['static_pages'],
    medium: ['spa_pages'],
    high: ['dynamic_content']
  },
  pattern_detection: {
    low: ['regex'],
    high: ['ml_based']
  }
};

function selectAlgorithm(task, budget) {
  const options = algorithmCosts[task];
  if (budget === 'low') return options.low[0];
  if (budget === 'high') return options.high[0];
  return options.medium[0];
}
```

### 3. Caching Strategy

Cache expensive algorithm results:

```javascript
const cache = new Map();

async function runAlgorithm(algorithm, config) {
  const cacheKey = `${algorithm}:${JSON.stringify(config)}`;
  
  if (cache.has(cacheKey)) {
    console.log('[workflow][algorithm][cache] - info - Using cached result');
    return cache.get(cacheKey);
  }
  
  const result = await executeAlgorithm(algorithm, config);
  cache.set(cacheKey, result);
  
  return result;
}
```

### 4. Parallel Execution

Run independent algorithms in parallel:

```javascript
const results = await Promise.all([
  runAlgorithm('web_scraping', config1),
  runAlgorithm('pattern_detection', config2),
  runAlgorithm('seo_analysis', config3)
]);
```

### 5. Error Handling

Implement robust error handling:

```javascript
try {
  const result = await runAlgorithm(algorithm, config);
  console.log('[workflow][algorithm][success] - info - Algorithm completed successfully');
  return result;
} catch (error) {
  console.error('[workflow][algorithm][error] - error -', error.message);
  
  // Try fallback algorithm
  if (fallbackAlgorithm) {
    console.log('[workflow][algorithm][fallback] - warning - Using fallback algorithm');
    return await runAlgorithm(fallbackAlgorithm, fallbackConfig);
  }
  
  throw error;
}
```

## Integration with N8N Workflows

### Example: Multi-Algorithm Pipeline

```json
{
  "name": "Multi-Algorithm SEO Analysis",
  "nodes": [
    {
      "name": "Scrape Page",
      "type": "algorithm",
      "algorithm": "web_scraping",
      "config": {
        "url": "={{$json.url}}",
        "selectors": {
          "title": "h1",
          "content": "article",
          "images": "img"
        }
      }
    },
    {
      "name": "Extract Keywords",
      "type": "algorithm",
      "algorithm": "keyword_extraction",
      "config": {
        "text": "={{$node['Scrape Page'].json.content}}",
        "method": "rake",
        "maxKeywords": 20
      }
    },
    {
      "name": "Analyze Patterns",
      "type": "algorithm",
      "algorithm": "regex_pattern_matcher",
      "config": {
        "text": "={{$node['Scrape Page'].json.content}}",
        "patterns": [
          { "name": "email", "regex": "\\b[\\w\\.-]+@[\\w\\.-]+\\.\\w+\\b" },
          { "name": "phone", "regex": "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b" }
        ]
      }
    },
    {
      "name": "Store Results",
      "type": "postgres",
      "operation": "insert",
      "table": "algorithm_results"
    }
  ]
}
```

## Cost Comparison Table

| Algorithm | Cost | Time | Accuracy | Use Case |
|-----------|------|------|----------|----------|
| Web Scraping | Low | Fast | High | Static content |
| DOM Harvesting | Medium | Medium | High | Performance analysis |
| Regex Patterns | Very Low | Very Fast | Medium | Simple patterns |
| Visual Patterns | High | Slow | High | Image analysis |
| ML Classification | High | Slow | Very High | Complex classification |
| OCR | Medium | Medium | High | Text extraction |
| PageRank | Low | Fast | High | Link analysis |

## Next Steps

1. Choose appropriate algorithms for your use case
2. Configure algorithms using provided schemas
3. Integrate into n8n workflows
4. Monitor performance and costs
5. Optimize based on metrics
6. Scale horizontally for high volume
