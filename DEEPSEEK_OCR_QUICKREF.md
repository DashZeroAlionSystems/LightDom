# DeepSeek-OCR Quick Reference

## Quick Start

```bash
# Start OCR worker
cd services/ocr-worker
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In your application
import DeepSeekOCRService from './services/deepseek-ocr-service.js';
const ocr = new DeepSeekOCRService();
```

## Compression Ratio Cheat Sheet

| Use Case | Ratio | Compression | Precision |
|----------|-------|-------------|-----------|
| Legal/Medical | 0.15-0.20 | 5-7× | 99%+ |
| Business Docs | 0.10-0.15 | 7-10× | 95%+ |
| Archives | 0.08-0.12 | 8-13× | 90%+ |
| Training Data | 0.05-0.08 | 13-20× | 60-90% |

## Common Usage Patterns

### 1. Basic Processing
```javascript
const result = await ocr.processDocument({
  url: 'https://example.com/doc.pdf'
});
```

### 2. High Precision (Legal)
```javascript
const result = await ocr.processDocument(input, {
  compressionRatio: 0.15,
  minOcrPrecision: 0.99,
  outputFormat: 'json'
});
```

### 3. High Compression (Training)
```javascript
const result = await ocr.processDocument(input, {
  compressionRatio: 0.05,
  outputFormat: 'text'
});
```

### 4. Batch Processing
```javascript
const results = await ocr.processBatch(documents, {
  batchSize: 20,
  outputFormat: 'json'
});
```

### 5. Structured Extraction
```javascript
const data = await ocr.extractStructuredData(input, {
  extractTables: true,
  extractFigures: true,
  preserveLayout: true
});
```

### 6. With Retry
```javascript
async function processWithRetry(input, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ocr.processDocument(input);
    } catch (error) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      } else throw error;
    }
  }
}
```

### 7. With Monitoring
```javascript
ocr.on('document-processed', ({ requestId, compressionRatio, confidence }) => {
  console.log(`${requestId}: ${compressionRatio}× compression, ${confidence}% confidence`);
});

const stats = ocr.getStats();
console.log('Average compression:', stats.averageCompressionRatio);
```

## Output Formats

| Format | Use For | Features |
|--------|---------|----------|
| `'markdown'` | CMS, documentation | Layout preserved, readable |
| `'html'` | Web display | Semantic structure, styling |
| `'json'` | Programmatic | Tables, figures, metadata |
| `'text'` | Simple text | Plain text only |
| `'structured'` | Analysis | Full structure with blocks |

## Environment Variables

```bash
OCR_WORKER_ENDPOINT=http://localhost:8000
DEEPSEEK_OCR_ENDPOINT=https://api.deepseek.com/ocr
DEEPSEEK_API_KEY=your_api_key
OCR_DEFAULT_COMPRESSION_RATIO=0.1
OCR_MAX_IMAGE_SIZE_MB=25
```

## Performance Targets

- **A100 GPU**: 200K+ pages/day @ 10× compression
- **Other GPU**: 50K+ pages/day @ 10× compression  
- **CPU only**: 10-20K pages/day @ 10× compression

## Batch Size Guidelines

- **A100 GPU**: 15-25 documents
- **Other GPU**: 10-15 documents
- **CPU**: 5-10 documents

## Health Check

```javascript
const health = await ocr.healthCheck();
if (health.status === 'ok') {
  console.log('OCR worker ready:', health.worker.mode);
}
```

## Common Errors

| Error | Solution |
|-------|----------|
| Worker unavailable | Start OCR worker service |
| Timeout | Increase timeout or reduce batch size |
| Low confidence | Reduce compression ratio |
| 413 Too large | Compress image or chunk document |

## Key Resources

- **Integration**: `DEEPSEEK_OCR_INTEGRATION.md`
- **Best Practices**: `DEEPSEEK_OCR_BEST_PRACTICES.md`
- **Examples**: `examples/deepseek-ocr-examples.js`
- **Tests**: `test/deepseek-ocr-service.test.js`
- **Service**: `services/deepseek-ocr-service.js`
- **Worker**: `services/ocr-worker/app/main.py`

## CLI Commands

```bash
# Run examples
node examples/deepseek-ocr-examples.js

# Run tests
npm test -- test/deepseek-ocr-service.test.js

# Start OCR worker
cd services/ocr-worker && uvicorn app.main:app

# Check worker health
curl http://localhost:8000/health
```

## TypeScript Types

```typescript
interface ProcessOptions {
  compressionRatio?: number;
  outputFormat?: 'markdown' | 'html' | 'json' | 'text' | 'structured';
  language?: string;
  preserveLayout?: boolean;
  extractTables?: boolean;
  extractFigures?: boolean;
  targetTokens?: number;
  timeout?: number;
}

interface OCRResult {
  text: string;
  metadata: {
    requestId: string;
    confidence: number;
    compressionRatio: number;
    originalTokens: number;
    compressedTokens: number;
    processingTimeMs: number;
  };
}
```

## Decision Tree

```
Need OCR?
├─ Legal/Medical? → compressionRatio: 0.15, minPrecision: 0.99
├─ Business docs? → compressionRatio: 0.10, minPrecision: 0.95
├─ Training data? → compressionRatio: 0.05, minPrecision: 0.90
└─ Archive? → compressionRatio: 0.10, minPrecision: 0.90

Multiple docs?
└─ YES → Use processBatch() with batchSize 15-25

Need structure?
├─ Tables → extractTables: true
├─ Figures → extractFigures: true
└─ Layout → preserveLayout: true

Output destination?
├─ CMS/Docs → outputFormat: 'markdown'
├─ Web page → outputFormat: 'html'
├─ Processing → outputFormat: 'json'
└─ Simple text → outputFormat: 'text'
```

## Pro Tips

1. **Always provide language hints** when you know the document language
2. **Cache results** for documents that may be processed multiple times
3. **Monitor confidence** and retry with lower compression if < 0.9
4. **Use batch processing** for high throughput scenarios
5. **Calculate compression** based on your LLM's context window
6. **Track statistics** to optimize compression ratios over time
7. **Implement retries** with exponential backoff for production
8. **Chunk large documents** to avoid timeouts
9. **Choose output format** based on downstream processing needs
10. **Validate results** before using in critical applications
