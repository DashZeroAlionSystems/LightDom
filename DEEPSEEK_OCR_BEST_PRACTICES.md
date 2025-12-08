# DeepSeek-OCR Best Practices and Rules

## Optical Compression Rules

### Rule 1: Choose Compression Ratio Based on Use Case

**Context**: DeepSeek-OCR achieves 10-20× compression with varying precision levels.

**Rule**: Always consider the downstream use case when selecting compression ratios:

```javascript
// ✅ GOOD: High precision for legal/medical documents
const legalResult = await ocrService.processDocument(input, {
  compressionRatio: 0.15, // 6-7× compression
  minOcrPrecision: 0.99,
  outputFormat: 'json'
});

// ✅ GOOD: Balanced for business documents
const businessResult = await ocrService.processDocument(input, {
  compressionRatio: 0.1, // 10× compression
  minOcrPrecision: 0.95
});

// ✅ GOOD: High compression for training data
const trainingResult = await ocrService.processDocument(input, {
  compressionRatio: 0.05, // 20× compression
  minOcrPrecision: 0.90
});

// ❌ BAD: Using same compression for all use cases
const result = await ocrService.processDocument(input, {
  compressionRatio: 0.1 // Generic, not optimized
});
```

**Compression Guidelines Table**:
| Use Case | Compression Ratio | Target Precision | Vision Tokens |
|----------|------------------|------------------|---------------|
| Legal Documents | 0.15-0.20 (5-7×) | 99%+ | 150-200 |
| Medical Records | 0.15-0.20 (5-7×) | 99%+ | 150-200 |
| Business Documents | 0.10-0.15 (7-10×) | 95%+ | 100-150 |
| Archives | 0.08-0.12 (8-13×) | 90%+ | 80-120 |
| Training Data | 0.05-0.08 (13-20×) | 60-90% | 50-80 |
| Quick Scanning | 0.03-0.05 (20-33×) | 50-70% | 30-50 |

### Rule 2: Use Vision Token Targeting for Context Windows

**Context**: Vision tokens are the compressed representation - optimize for context window limits.

**Rule**: Calculate target vision tokens based on your LLM's context window:

```javascript
// ✅ GOOD: Calculate compression based on context window
function calculateOptimalCompression(documentSize, contextWindow) {
  const estimatedTokens = Math.ceil(documentSize / 4); // 4 bytes per token
  const targetTokens = Math.floor(contextWindow * 0.8); // Use 80% of context window
  const compressionRatio = targetTokens / estimatedTokens;
  
  return Math.max(0.05, Math.min(0.2, compressionRatio));
}

const compression = calculateOptimalCompression(documentBytes, 8192);
const result = await ocrService.processDocument(input, {
  compressionRatio: compression
});

// ❌ BAD: Hard-coding without considering context limits
const result = await ocrService.processDocument(input, {
  compressionRatio: 0.1 // May exceed context window
});
```

### Rule 3: Batch Process for High Throughput

**Context**: DeepSeek-OCR can process 200K+ pages/day on single GPU.

**Rule**: Always use batch processing for multiple documents:

```javascript
// ✅ GOOD: Batch processing with proper configuration
const results = await ocrService.processBatch(documents, {
  batchSize: 20, // Optimal for GPU
  outputFormat: 'json',
  compressionRatio: 0.1
});

// Monitor progress
ocrService.on('batch-completed', ({ batchNumber, documentsProcessed, totalDocuments }) => {
  const progress = (documentsProcessed / totalDocuments * 100).toFixed(1);
  console.log(`Batch ${batchNumber} complete: ${progress}%`);
});

// ❌ BAD: Processing documents one by one
for (const doc of documents) {
  const result = await ocrService.processDocument(doc);
  results.push(result);
}
```

**Batch Size Guidelines**:
- GPU (A100): 15-25 documents per batch
- GPU (other): 10-15 documents per batch
- CPU: 5-10 documents per batch

### Rule 4: Select Output Format for Downstream Processing

**Context**: DeepSeek-OCR supports structured output (Markdown, HTML, JSON).

**Rule**: Choose output format based on how you'll process the results:

```javascript
// ✅ GOOD: JSON for programmatic processing
const structuredData = await ocrService.extractStructuredData(input, {
  outputFormat: 'json',
  extractTables: true,
  extractFigures: true
});

// Process tables
structuredData.tables.forEach(table => {
  processTable(table);
});

// ✅ GOOD: Markdown for content management systems
const markdown = await ocrService.processDocument(input, {
  outputFormat: 'markdown',
  preserveLayout: true
});
await cms.createDocument(markdown.text);

// ✅ GOOD: HTML for web display
const html = await ocrService.processDocument(input, {
  outputFormat: 'html',
  preserveLayout: true
});
res.send(html.text);

// ❌ BAD: Always using text format
const result = await ocrService.processDocument(input, {
  outputFormat: 'text' // Loses structure
});
// Now you have to parse it manually
```

### Rule 5: Implement Retry Logic with Exponential Backoff

**Context**: OCR processing can fail due to network, timeout, or resource issues.

**Rule**: Always implement retry logic for production systems:

```javascript
// ✅ GOOD: Robust retry with exponential backoff
async function processDocumentWithRetry(input, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ocrService.processDocument(input);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// ❌ BAD: No retry logic
try {
  const result = await ocrService.processDocument(input);
} catch (error) {
  console.error('Failed:', error);
  // Document lost
}
```

### Rule 6: Monitor Performance Metrics

**Context**: Understanding compression ratios and confidence levels helps optimize processing.

**Rule**: Always track and analyze performance metrics:

```javascript
// ✅ GOOD: Comprehensive monitoring
ocrService.on('document-processed', (event) => {
  // Log metrics
  metrics.record('ocr.compression_ratio', event.compressionRatio);
  metrics.record('ocr.confidence', event.confidence);
  metrics.record('ocr.processing_time_ms', event.processingTimeMs);
  
  // Alert on low confidence
  if (event.confidence < 0.9) {
    alerts.warn(`Low OCR confidence: ${event.confidence} for ${event.requestId}`);
  }
  
  // Alert on slow processing
  if (event.processingTimeMs > 5000) {
    alerts.warn(`Slow OCR processing: ${event.processingTimeMs}ms for ${event.requestId}`);
  }
});

// Periodic statistics review
setInterval(() => {
  const stats = ocrService.getStats();
  console.log('OCR Statistics:', {
    documentsProcessed: stats.documentsProcessed,
    avgCompression: stats.averageCompressionRatio.toFixed(2),
    avgConfidence: stats.averageConfidence.toFixed(3),
    avgProcessingTime: stats.averageProcessingTimeMs.toFixed(0)
  });
}, 60000); // Every minute

// ❌ BAD: No monitoring
const result = await ocrService.processDocument(input);
// No visibility into performance
```

### Rule 7: Provide Language Hints When Known

**Context**: DeepSeek-OCR supports 100+ languages - hints improve accuracy.

**Rule**: Always provide language hints when you know the document language:

```javascript
// ✅ GOOD: Providing language hints
const languages = {
  'en': 'English',
  'zh-CN': 'Chinese Simplified',
  'zh-TW': 'Chinese Traditional',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ja': 'Japanese',
  'ko': 'Korean'
};

const result = await ocrService.processDocument(input, {
  language: documentMetadata.language || 'en',
  outputFormat: 'markdown'
});

// ✅ GOOD: Auto-detect for unknown languages
const result = await ocrService.processDocument(input, {
  language: undefined, // Auto-detect
  outputFormat: 'json'
});
console.log('Detected language:', result.metadata.language);

// ❌ BAD: Never providing language hints
const result = await ocrService.processDocument(input);
// OCR has to guess, may be less accurate
```

### Rule 8: Handle Large Documents with Streaming

**Context**: Very large documents may exceed memory or timeout limits.

**Rule**: For large documents, consider chunking or streaming:

```javascript
// ✅ GOOD: Chunking large documents
async function processLargeDocument(documentUrl, chunkSizeMB = 10) {
  const chunks = await splitDocumentIntoChunks(documentUrl, chunkSizeMB);
  const results = [];
  
  for (const chunk of chunks) {
    const result = await ocrService.processDocument(
      { buffer: chunk },
      { compressionRatio: 0.1 }
    );
    results.push(result);
  }
  
  // Combine results
  return combineChunkedResults(results);
}

// ✅ GOOD: Using batch processing for multiple chunks
const results = await ocrService.processBatch(chunks, {
  batchSize: 10,
  compressionRatio: 0.1
});

// ❌ BAD: Processing huge document in one go
const result = await ocrService.processDocument({
  url: 'huge-100mb-document.pdf'
}); // May timeout or OOM
```

### Rule 9: Cache OCR Results for Repeated Processing

**Context**: OCR processing is computationally expensive.

**Rule**: Always cache OCR results for documents that may be processed multiple times:

```javascript
// ✅ GOOD: Caching OCR results
import crypto from 'crypto';

async function processDocumentWithCache(input, options = {}) {
  // Generate cache key from input
  const cacheKey = generateCacheKey(input, options);
  
  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log('OCR result from cache:', cacheKey);
    return cached;
  }
  
  // Process document
  const result = await ocrService.processDocument(input, options);
  
  // Store in cache (with TTL)
  await cache.set(cacheKey, result, { ttl: 86400 }); // 24 hours
  
  return result;
}

function generateCacheKey(input, options) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({ input, options }));
  return `ocr:${hash.digest('hex')}`;
}

// ❌ BAD: Always reprocessing same documents
const result = await ocrService.processDocument(input);
// Wastes compute resources
```

### Rule 10: Validate and Handle Low Confidence Results

**Context**: OCR confidence indicates result reliability.

**Rule**: Always check confidence and handle low-confidence results appropriately:

```javascript
// ✅ GOOD: Validating confidence and handling low results
async function processDocumentReliably(input, options = {}) {
  const result = await ocrService.processDocument(input, options);
  
  if (result.metadata.confidence < 0.9) {
    console.warn('Low confidence OCR result:', result.metadata.confidence);
    
    // Option 1: Retry with different settings
    if (options.compressionRatio > 0.1) {
      console.log('Retrying with lower compression...');
      return processDocumentReliably(input, {
        ...options,
        compressionRatio: Math.min(options.compressionRatio * 1.5, 0.2)
      });
    }
    
    // Option 2: Flag for manual review
    await flagForManualReview(result);
    
    // Option 3: Use alternative OCR service
    return processWithBackupOCR(input);
  }
  
  return result;
}

// ❌ BAD: Ignoring confidence levels
const result = await ocrService.processDocument(input);
processText(result.text); // May be inaccurate
```

## Integration Patterns

### Pattern 1: DOM Content Compression

Use optical compression for large DOM structures:

```javascript
// ✅ GOOD: Compressing large DOM structures
async function optimizeLargeDOM(domContent) {
  const sizeKB = Buffer.from(domContent.html).length / 1024;
  
  if (sizeKB > 100) { // Compress large DOMs (>100KB)
    const compressed = await ocrService.compressDOMOptically(domContent, {
      targetTokens: 200,
      preserveLayout: true
    });
    
    console.log(`DOM compressed: ${sizeKB}KB → ${compressed.visionTokens} tokens`);
    return compressed.compressedRepresentation;
  }
  
  return domContent.html;
}
```

### Pattern 2: Training Data Generation

Generate compressed training data from web pages:

```javascript
// ✅ GOOD: Generating training data with optimal compression
async function generateTrainingData(urls) {
  const trainingData = [];
  
  for (const url of urls) {
    const page = await crawler.crawl(url);
    
    // Extract and compress content
    const compressed = await ocrService.processDocument(
      { buffer: page.screenshot },
      {
        compressionRatio: 0.05, // High compression for training
        outputFormat: 'json',
        extractTables: true,
        extractFigures: true
      }
    );
    
    trainingData.push({
      url,
      content: compressed.text,
      tables: compressed.tables,
      metadata: compressed.metadata
    });
  }
  
  return trainingData;
}
```

### Pattern 3: Document Archive with Search

Create searchable document archives:

```javascript
// ✅ GOOD: Archiving documents with full-text search
async function archiveDocument(document) {
  // Process with OCR
  const ocr = await ocrService.processDocument(
    { url: document.url },
    {
      compressionRatio: 0.1,
      outputFormat: 'markdown',
      preserveLayout: true
    }
  );
  
  // Store in database with full-text search
  await db.documents.create({
    id: document.id,
    title: document.title,
    content: ocr.text,
    metadata: {
      ...document.metadata,
      ...ocr.metadata
    },
    // Full-text search column
    searchVector: createSearchVector(ocr.text)
  });
  
  return ocr;
}
```

## Error Handling Best Practices

### Handle Specific Error Types

```javascript
// ✅ GOOD: Handling specific error types
async function processDocumentSafely(input) {
  try {
    return await ocrService.processDocument(input);
  } catch (error) {
    if (error.message.includes('timeout')) {
      // Retry with higher timeout
      return ocrService.processDocument(input, {
        timeout: 60000
      });
    } else if (error.message.includes('413')) {
      // Document too large - compress image first
      const compressed = await compressImage(input);
      return ocrService.processDocument(compressed);
    } else if (error.message.includes('503')) {
      // Service unavailable - use backup
      return processWithBackupOCR(input);
    }
    
    throw error;
  }
}
```

## Testing Best Practices

### Test Different Compression Ratios

```javascript
// ✅ GOOD: Testing compression vs accuracy tradeoff
describe('DeepSeek-OCR Compression', () => {
  it('should maintain 97%+ precision at 10× compression', async () => {
    const result = await ocrService.processDocument(testDocument, {
      compressionRatio: 0.1
    });
    
    expect(result.metadata.confidence).toBeGreaterThan(0.97);
    expect(result.metadata.compressionRatio).toBeGreaterThan(9);
  });
  
  it('should achieve 20× compression for training data', async () => {
    const result = await ocrService.processDocument(testDocument, {
      compressionRatio: 0.05
    });
    
    expect(result.metadata.compressionRatio).toBeGreaterThan(15);
  });
});
```

## Summary of Key Rules

1. ✅ **Choose compression ratio based on use case** (0.15 for legal, 0.1 for business, 0.05 for training)
2. ✅ **Calculate target vision tokens** based on LLM context window limits
3. ✅ **Use batch processing** for high throughput (15-25 docs per batch on GPU)
4. ✅ **Select appropriate output format** (JSON, Markdown, HTML) for downstream processing
5. ✅ **Implement retry logic** with exponential backoff
6. ✅ **Monitor performance metrics** (compression ratio, confidence, processing time)
7. ✅ **Provide language hints** when known for better accuracy
8. ✅ **Chunk large documents** to avoid timeouts and memory issues
9. ✅ **Cache OCR results** to avoid reprocessing
10. ✅ **Validate confidence levels** and handle low-confidence results

These rules ensure optimal use of DeepSeek-OCR's optical compression technology while maintaining high accuracy and throughput.
