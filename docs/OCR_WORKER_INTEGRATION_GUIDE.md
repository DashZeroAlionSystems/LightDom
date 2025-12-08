# OCR Worker Integration Guide

## Overview

The OCR (Optical Character Recognition) Worker is a specialized service for extracting text and patterns from images, PDFs, and visual content. This guide explains how to integrate OCR capabilities into your n8n workflows for advanced data mining and pattern detection.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    N8N Workflow                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Image/PDF Input → OCR Worker → Text Extraction      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    OCR Worker Service                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tesseract OCR Engine                                 │  │
│  │ - Multi-language support                             │  │
│  │ - PDF processing                                     │  │
│  │ - Image preprocessing                                │  │
│  │ - Pattern detection                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Output & Storage                          │
│  - Extracted text                                            │
│  - Confidence scores                                         │
│  - Detected patterns                                         │
│  - Structured data                                           │
└─────────────────────────────────────────────────────────────┘
```

## OCR Worker Capabilities

### 1. Text Extraction
- Extract text from images (JPG, PNG, BMP, TIFF)
- Process PDF documents
- Handle multi-page documents
- Support for 100+ languages

### 2. Pattern Detection
- Regex pattern matching on extracted text
- Visual pattern detection
- Layout analysis
- Table detection and extraction

### 3. Image Preprocessing
- Noise reduction
- Contrast enhancement
- Deskewing
- Border removal
- Binary conversion

### 4. Multi-Site Scraping with OCR
- Parallel processing of multiple sites
- Screenshot capture
- Text extraction from rendered pages
- Pattern detection across sites

## Integration Methods

### Method 1: N8N HTTP Request Node

```javascript
{
  "name": "OCR Processing",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "http://ocr-worker:5000/ocr",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "image",
          "value": "={{$binary.data.toString('base64')}}"
        },
        {
          "name": "languages",
          "value": "['eng', 'spa']"
        },
        {
          "name": "engine",
          "value": "tesseract"
        }
      ]
    }
  }
}
```

### Method 2: Function Node Integration

```javascript
// In N8N Function Node
const axios = require('axios');

// Get image from previous node
const imageBuffer = items[0].binary.data;

// Call OCR Worker
const response = await axios.post('http://ocr-worker:5000/ocr', {
  image: imageBuffer.toString('base64'),
  languages: ['eng'],
  options: {
    preprocessor: 'enhance',
    dpi: 300,
    psm: 3  // Page segmentation mode
  }
});

return [{
  json: {
    text: response.data.text,
    confidence: response.data.confidence,
    metadata: response.data.metadata
  }
}];
```

### Method 3: Chrome Layers Integration

Use the Chrome Layers 3D UI system to capture visual layers and process with OCR:

```javascript
// Capture layers and process with OCR
const layers = await chromeLayers.captureLayers(url);

for (const layer of layers) {
  const screenshot = await layer.screenshot();
  const ocrResult = await ocrWorker.process(screenshot);
  
  layer.textContent = ocrResult.text;
  layer.patterns = detectPatterns(ocrResult.text);
}
```

## Use Cases

### 1. Multi-Site Pattern Detection

Scan thousands of websites simultaneously looking for specific patterns:

```javascript
const urls = [/* thousands of URLs */];
const patterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,  // SSN pattern
  /\b[\w\.-]+@[\w\.-]+\.\w+\b/,  // Email pattern
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/  // IP pattern
];

// Use workflow template
const workflow = createWorkflowFromTemplate('pattern_detection', {
  urls: urls,
  patterns: patterns,
  parallel: true,
  maxConcurrency: 100
});
```

### 2. Document Processing Pipeline

Process invoices, receipts, forms:

```javascript
const workflow = createWorkflowFromTemplate('ocr_document_processing', {
  inputSource: 'webhook',
  ocrEngine: 'tesseract',
  languages: ['eng', 'fra'],
  storeResults: true,
  postProcessing: {
    extractInvoiceNumber: true,
    extractDates: true,
    extractAmounts: true
  }
});
```

### 3. Screenshot Analysis

Capture and analyze screenshots of websites:

```javascript
// Workflow nodes
[
  {
    name: 'Capture Screenshot',
    type: 'puppeteer-screenshot',
    parameters: {
      url: '={{$json.url}}',
      fullPage: true,
      viewport: { width: 1920, height: 1080 }
    }
  },
  {
    name: 'OCR Processing',
    type: 'http-request',
    parameters: {
      url: 'http://ocr-worker:5000/ocr',
      method: 'POST',
      body: {
        image: '={{$binary.data.toString("base64")}}',
        languages: ['eng']
      }
    }
  },
  {
    name: 'Pattern Detection',
    type: 'function',
    parameters: {
      functionCode: `
        const patterns = {
          email: /\\b[\\w\\.-]+@[\\w\\.-]+\\.\\w+\\b/g,
          phone: /\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b/g,
          url: /https?:\\/\\/[^\\s]+/g
        };
        
        const results = {};
        for (const [key, pattern] of Object.entries(patterns)) {
          results[key] = items[0].json.text.match(pattern) || [];
        }
        
        return [{ json: results }];
      `
    }
  }
]
```

## Performance Optimization

### 1. Parallel Processing

Process multiple documents simultaneously:

```javascript
{
  maxConcurrency: 10,
  batchSize: 100,
  timeout: 30000
}
```

### 2. Image Preprocessing

Enhance accuracy with preprocessing:

```javascript
{
  preprocessor: {
    denoise: true,
    enhance: true,
    deskew: true,
    threshold: 'adaptive'
  }
}
```

### 3. Caching

Cache OCR results to reduce processing:

```javascript
{
  cache: {
    enabled: true,
    ttl: 86400,  // 24 hours
    keyGenerator: (image) => crypto.createHash('sha256').update(image).digest('hex')
  }
}
```

## Cost Optimization Strategies

### 1. Selective OCR

Only process areas of interest:

```javascript
{
  regions: [
    { x: 0, y: 0, width: 500, height: 200 },  // Header
    { x: 0, y: 800, width: 500, height: 200 }  // Footer
  ]
}
```

### 2. Resolution Scaling

Use appropriate DPI for accuracy vs speed:

```javascript
{
  dpi: {
    draft: 150,
    normal: 300,
    high: 600
  }
}
```

### 3. Batch Processing

Group similar documents:

```javascript
{
  batching: {
    enabled: true,
    groupBy: 'documentType',
    batchSize: 50
  }
}
```

## RAG Integration

Use OCR results as context for RAG (Retrieval Augmented Generation):

```javascript
// After OCR processing
const ocrText = items[0].json.text;

// Store in RAG system
await ragSystem.addDocument({
  content: ocrText,
  metadata: {
    source: 'ocr',
    documentId: items[0].json.documentId,
    confidence: items[0].json.confidence
  }
});

// Use for suggestions
const suggestions = await deepseek.suggest({
  context: ocrText,
  task: 'extract_key_information'
});
```

## Error Handling

```javascript
try {
  const ocrResult = await ocrWorker.process(image);
  
  if (ocrResult.confidence < 0.7) {
    // Low confidence - try preprocessing
    const enhanced = await preprocessor.enhance(image);
    ocrResult = await ocrWorker.process(enhanced);
  }
  
  return [{ json: ocrResult }];
} catch (error) {
  console.error('[workflow][ocr][process] - error -', error.message);
  
  // Fallback to manual review queue
  await addToReviewQueue({
    image,
    error: error.message
  });
  
  throw error;
}
```

## Monitoring & Metrics

Track OCR performance:

```javascript
{
  metrics: {
    processedDocuments: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    errorRate: 0,
    patternsDetected: 0
  }
}
```

## Best Practices

1. **Always preprocess images** for better accuracy
2. **Use appropriate languages** for better recognition
3. **Validate confidence scores** before using results
4. **Cache results** to reduce costs
5. **Batch similar documents** for efficiency
6. **Monitor performance** and adjust settings
7. **Handle errors gracefully** with fallbacks
8. **Store metadata** with extracted text
9. **Use pattern detection** for structured extraction
10. **Integrate with RAG** for AI-powered analysis

## Example Workflow: Multi-Site Pattern Mining

Complete workflow for scanning 1000+ websites:

```javascript
const workflow = {
  name: 'Multi-Site Pattern Mining',
  nodes: [
    // 1. URL List
    {
      name: 'URL Generator',
      type: 'function',
      parameters: {
        functionCode: `
          const urls = /* load from database or file */;
          return urls.map(url => ({ json: { url } }));
        `
      }
    },
    
    // 2. Parallel Screenshot Capture
    {
      name: 'Capture Screenshots',
      type: 'puppeteer-screenshot',
      parameters: {
        url: '={{$json.url}}',
        fullPage: true,
        waitUntil: 'networkidle2'
      }
    },
    
    // 3. OCR Processing
    {
      name: 'Extract Text',
      type: 'http-request',
      parameters: {
        url: 'http://ocr-worker:5000/ocr',
        method: 'POST',
        body: {
          image: '={{$binary.data.toString("base64")}}'
        }
      }
    },
    
    // 4. Pattern Detection
    {
      name: 'Detect Patterns',
      type: 'function',
      parameters: {
        functionCode: `
          const patterns = {
            contact: /contact@[\\w\\.-]+/gi,
            phone: /\\(\\d{3}\\)\\s?\\d{3}-\\d{4}/g,
            address: /\\d+\\s+[\\w\\s]+,\\s*[\\w\\s]+,\\s*[A-Z]{2}/g
          };
          
          const detected = {};
          for (const [key, pattern] of Object.entries(patterns)) {
            detected[key] = items[0].json.text.match(pattern) || [];
          }
          
          return [{
            json: {
              url: items[0].json.url,
              patterns: detected,
              totalMatches: Object.values(detected).flat().length
            }
          }];
        `
      }
    },
    
    // 5. Store Results
    {
      name: 'Save to Database',
      type: 'postgres',
      parameters: {
        operation: 'insert',
        table: 'pattern_mining_results',
        columns: 'url,patterns,total_matches,scanned_at'
      }
    }
  ],
  settings: {
    executionOrder: 'parallel',
    maxConcurrency: 50,
    timeout: 300000  // 5 minutes per workflow
  }
};
```

## Service Status Format

All OCR worker messages follow the standard format:

```
[campaign][service][servicename] - [level] - message

Examples:
[workflow][ocr][worker] - info - Processing document successfully
[workflow][ocr][worker] - warning - Low confidence score: 0.65
[workflow][ocr][worker] - error - Failed to process image: Invalid format
[datamining][ocr][pattern-detector] - info - Found 150 patterns across 1000 sites
```

## Next Steps

1. Set up OCR Worker service
2. Configure n8n workflows with OCR nodes
3. Implement pattern detection algorithms
4. Integrate with RAG system
5. Monitor performance and optimize
6. Scale horizontally for high volume
