/**
 * DeepSeek-OCR Usage Examples
 * 
 * Demonstrates various use cases and patterns for DeepSeek-OCR integration
 */

import DeepSeekOCRService from './services/deepseek-ocr-service.js';

// Example 1: Basic Document Processing
async function example1_BasicProcessing() {
  console.log('\n=== Example 1: Basic Document Processing ===\n');
  
  const ocrService = new DeepSeekOCRService({
    ocrWorkerEndpoint: 'http://localhost:8000'
  });
  
  // Process a document with default settings
  const result = await ocrService.processDocument({
    url: 'https://example.com/document.pdf'
  });
  
  console.log('Document processed:');
  console.log('- Text length:', result.text.length);
  console.log('- Confidence:', result.metadata.confidence);
  console.log('- Compression ratio:', result.metadata.compressionRatio);
  console.log('- Original tokens:', result.metadata.originalTokens);
  console.log('- Vision tokens:', result.metadata.compressedTokens);
  
  return result;
}

// Example 2: Use Case-Specific Compression
async function example2_UseCaseCompression() {
  console.log('\n=== Example 2: Use Case-Specific Compression ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Legal document - high precision required
  console.log('Processing legal document...');
  const legalDoc = await ocrService.processDocument(
    { url: 'https://example.com/contract.pdf' },
    {
      compressionRatio: 0.15, // 6-7× compression
      minOcrPrecision: 0.99,
      outputFormat: 'json',
      preserveLayout: true
    }
  );
  console.log('Legal doc - Confidence:', legalDoc.metadata.confidence);
  console.log('Legal doc - Compression:', legalDoc.metadata.compressionRatio);
  
  // Training data - high compression acceptable
  console.log('\nProcessing training data...');
  const trainingDoc = await ocrService.processDocument(
    { url: 'https://example.com/article.pdf' },
    {
      compressionRatio: 0.05, // 20× compression
      minOcrPrecision: 0.90,
      outputFormat: 'text'
    }
  );
  console.log('Training data - Confidence:', trainingDoc.metadata.confidence);
  console.log('Training data - Compression:', trainingDoc.metadata.compressionRatio);
  
  return { legalDoc, trainingDoc };
}

// Example 3: Batch Processing
async function example3_BatchProcessing() {
  console.log('\n=== Example 3: Batch Processing ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Prepare multiple documents
  const documents = [
    { url: 'https://example.com/doc1.pdf' },
    { url: 'https://example.com/doc2.pdf' },
    { url: 'https://example.com/doc3.pdf' },
    { url: 'https://example.com/doc4.pdf' },
    { url: 'https://example.com/doc5.pdf' }
  ];
  
  // Monitor batch progress
  ocrService.on('batch-completed', (event) => {
    const progress = (event.documentsProcessed / event.totalDocuments * 100).toFixed(1);
    console.log(`Batch ${event.batchNumber} complete - Progress: ${progress}%`);
  });
  
  // Process batch with optimal settings
  const results = await ocrService.processBatch(documents, {
    batchSize: 10, // Adjust based on GPU availability
    outputFormat: 'json',
    compressionRatio: 0.1
  });
  
  console.log(`\nProcessed ${results.length} documents`);
  console.log('Average confidence:', 
    (results.reduce((sum, r) => sum + r.metadata.confidence, 0) / results.length).toFixed(3)
  );
  
  return results;
}

// Example 4: Structured Data Extraction
async function example4_StructuredExtraction() {
  console.log('\n=== Example 4: Structured Data Extraction ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Extract tables, figures, and layout
  const structured = await ocrService.extractStructuredData(
    { url: 'https://example.com/report.pdf' },
    {
      extractTables: true,
      extractFigures: true,
      preserveLayout: true,
      outputFormat: 'json'
    }
  );
  
  console.log('Structured data extracted:');
  console.log('- Tables:', structured.tables.length);
  console.log('- Figures:', structured.figures.length);
  console.log('- Layout blocks:', structured.layout.blocks);
  console.log('- Average confidence:', structured.layout.averageConfidence);
  
  return structured;
}

// Example 5: DOM Optical Compression
async function example5_DOMCompression() {
  console.log('\n=== Example 5: DOM Optical Compression ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Simulate large DOM content
  const domContent = {
    html: `
      <!DOCTYPE html>
      <html>
        <head><title>Large Page</title></head>
        <body>
          ${'<div>Content block</div>\n'.repeat(1000)}
        </body>
      </html>
    `,
    css: 'body { font-family: Arial; }'
  };
  
  console.log('Original DOM size:', Buffer.from(domContent.html).length, 'bytes');
  
  // Note: This requires Puppeteer integration which is planned
  try {
    const compressed = await ocrService.compressDOMOptically(domContent, {
      targetTokens: 100,
      preserveLayout: true
    });
    
    console.log('Compressed DOM:');
    console.log('- Original size:', compressed.originalSize, 'bytes');
    console.log('- Vision tokens:', compressed.visionTokens);
    console.log('- Compression ratio:', compressed.compressionRatio);
    console.log('- Reconstruction confidence:', compressed.reconstructionConfidence);
    
    return compressed;
  } catch (error) {
    console.log('DOM rendering not yet implemented:', error.message);
    console.log('This feature requires Puppeteer integration');
  }
}

// Example 6: Different Output Formats
async function example6_OutputFormats() {
  console.log('\n=== Example 6: Different Output Formats ===\n');
  
  const ocrService = new DeepSeekOCRService();
  const testDocument = { url: 'https://example.com/document.pdf' };
  
  // Markdown for CMS
  console.log('Processing as Markdown...');
  const markdown = await ocrService.processDocument(testDocument, {
    outputFormat: 'markdown',
    preserveLayout: true
  });
  console.log('Markdown preview:', markdown.text.substring(0, 100) + '...');
  
  // JSON for programmatic processing
  console.log('\nProcessing as JSON...');
  const json = await ocrService.processDocument(testDocument, {
    outputFormat: 'json',
    extractTables: true
  });
  console.log('JSON structure:', Object.keys(JSON.parse(json.text)));
  
  // HTML for web display
  console.log('\nProcessing as HTML...');
  const html = await ocrService.processDocument(testDocument, {
    outputFormat: 'html',
    preserveLayout: true
  });
  console.log('HTML preview:', html.text.substring(0, 100) + '...');
  
  return { markdown, json, html };
}

// Example 7: Error Handling and Retries
async function example7_ErrorHandling() {
  console.log('\n=== Example 7: Error Handling and Retries ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  async function processWithRetry(input, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}...`);
        return await ocrService.processDocument(input);
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
  }
  
  try {
    const result = await processWithRetry({
      url: 'https://example.com/document.pdf'
    });
    console.log('Success after retry:', result.metadata.requestId);
    return result;
  } catch (error) {
    console.error('All retries failed:', error.message);
  }
}

// Example 8: Performance Monitoring
async function example8_PerformanceMonitoring() {
  console.log('\n=== Example 8: Performance Monitoring ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Set up event listeners
  ocrService.on('document-processed', (event) => {
    console.log(`Document ${event.requestId} processed:`);
    console.log(`  - Compression: ${event.compressionRatio.toFixed(2)}×`);
    console.log(`  - Confidence: ${(event.confidence * 100).toFixed(1)}%`);
    console.log(`  - Time: ${event.processingTimeMs}ms`);
    
    // Alert on low confidence
    if (event.confidence < 0.9) {
      console.warn(`⚠️  Low confidence alert: ${event.confidence}`);
    }
    
    // Alert on slow processing
    if (event.processingTimeMs > 5000) {
      console.warn(`⚠️  Slow processing alert: ${event.processingTimeMs}ms`);
    }
  });
  
  ocrService.on('error', (error) => {
    console.error('❌ OCR error:', error.message);
  });
  
  // Process some documents
  await ocrService.processDocument({ url: 'https://example.com/doc1.pdf' });
  await ocrService.processDocument({ url: 'https://example.com/doc2.pdf' });
  
  // Get statistics
  const stats = ocrService.getStats();
  console.log('\nOCR Service Statistics:');
  console.log('- Documents processed:', stats.documentsProcessed);
  console.log('- Average compression:', stats.averageCompressionRatio.toFixed(2) + '×');
  console.log('- Average confidence:', (stats.averageConfidence * 100).toFixed(1) + '%');
  console.log('- Average time:', stats.averageProcessingTimeMs.toFixed(0) + 'ms');
  
  return stats;
}

// Example 9: Language Detection and Hints
async function example9_LanguageHandling() {
  console.log('\n=== Example 9: Language Detection and Hints ===\n');
  
  const ocrService = new DeepSeekOCRService();
  
  // Process with language hint
  console.log('Processing English document with hint...');
  const english = await ocrService.processDocument(
    { url: 'https://example.com/english.pdf' },
    { language: 'en' }
  );
  console.log('Detected language:', english.metadata.language);
  
  // Process with auto-detection
  console.log('\nProcessing multilingual document (auto-detect)...');
  const multilingual = await ocrService.processDocument(
    { url: 'https://example.com/chinese.pdf' },
    { language: undefined } // Auto-detect
  );
  console.log('Detected language:', multilingual.metadata.language);
  
  return { english, multilingual };
}

// Example 10: Caching Strategy
async function example10_Caching() {
  console.log('\n=== Example 10: Caching Strategy ===\n');
  
  const ocrService = new DeepSeekOCRService();
  const cache = new Map(); // Simple in-memory cache
  
  async function processWithCache(input, options = {}) {
    // Generate cache key
    const cacheKey = JSON.stringify({ input, options });
    
    // Check cache
    if (cache.has(cacheKey)) {
      console.log('✓ Cache hit!');
      return cache.get(cacheKey);
    }
    
    console.log('× Cache miss - processing document...');
    const result = await ocrService.processDocument(input, options);
    
    // Store in cache
    cache.set(cacheKey, result);
    
    return result;
  }
  
  const testDoc = { url: 'https://example.com/document.pdf' };
  
  // First call - cache miss
  const result1 = await processWithCache(testDoc);
  console.log('First call time:', result1.metadata.processingTimeMs + 'ms');
  
  // Second call - cache hit
  const result2 = await processWithCache(testDoc);
  console.log('Second call time: <1ms (cached)');
  
  return { result1, result2 };
}

// Run examples
async function runExamples() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       DeepSeek-OCR Usage Examples                        ║');
  console.log('║       Optical Compression & Document Intelligence        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    // Check if OCR worker is available
    const ocrService = new DeepSeekOCRService();
    const health = await ocrService.healthCheck();
    
    if (health.status === 'ok') {
      console.log('\n✓ OCR Worker is available');
      console.log('  Mode:', health.worker.mode);
      console.log('  Mock:', health.worker.mock);
    } else {
      console.log('\n⚠️  OCR Worker is not available');
      console.log('  Starting in mock mode for demonstration...');
    }
    
    // Run examples (comment out ones you don't want to run)
    // await example1_BasicProcessing();
    // await example2_UseCaseCompression();
    // await example3_BatchProcessing();
    // await example4_StructuredExtraction();
    await example5_DOMCompression();
    // await example6_OutputFormats();
    // await example7_ErrorHandling();
    // await example8_PerformanceMonitoring();
    // await example9_LanguageHandling();
    // await example10_Caching();
    
    console.log('\n✓ Examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error.message);
    console.error('\nMake sure OCR worker is running:');
    console.error('  cd services/ocr-worker');
    console.error('  pip install -r requirements.txt');
    console.error('  uvicorn app.main:app --host 0.0.0.0 --port 8000');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export {
  example1_BasicProcessing,
  example2_UseCaseCompression,
  example3_BatchProcessing,
  example4_StructuredExtraction,
  example5_DOMCompression,
  example6_OutputFormats,
  example7_ErrorHandling,
  example8_PerformanceMonitoring,
  example9_LanguageHandling,
  example10_Caching
};
