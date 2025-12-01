# Pre-Trained Models Setup - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

Get started with pre-trained TensorFlow models for SEO crawler enhancement in under 5 minutes.

### Prerequisites

```bash
# Node.js 18+ and PostgreSQL 12+
node --version  # Should be 18+
psql --version  # Should be 12+
```

### Step 1: Installation

The dependencies are already in `package.json`:

```bash
npm install
```

### Step 2: Run the Demo

```bash
# Quick demo (no dependencies)
node demo-pretrained-models-simple.js

# Full demo (requires TensorFlow)
node demo-pretrained-models-seo.js
```

### Step 3: Integrate with Your Crawler

```javascript
import { CrawlerNeuralIntegration } from './services/crawler-neural-integration.js';

const integration = new CrawlerNeuralIntegration();
await integration.initialize();

const results = await integration.processCrawledPage(pageData);
console.log('Recommendations:', results.recommendations);
```

Done! You now have 11 pre-trained models enhancing your crawler. 🎉

---

## 📦 What You Get

### 11 Production-Ready Models

| Model | Task | Speed | Accuracy | Best For |
|-------|------|-------|----------|----------|
| **Universal Sentence Encoder** | Text embeddings | Medium | 92% | Content similarity |
| **BERT Base** | Text classification | Medium | 93% | Content quality |
| **DistilBERT** | Sentiment analysis | Fast | 91.5% | User feedback |
| **MiniLM** | Fast embeddings | Very Fast | 88% | Real-time crawling |
| **MobileNet V2** | Image classification | Very Fast | 87% | Image SEO |
| **EfficientNet B0** | Image classification | Medium | 91% | Advanced images |
| **Toxicity Detection** | Content safety | Fast | 89% | Content filtering |
| **BERT QA** | Question answering | Medium | 88% | FAQ generation |
| **BERT NER** | Entity extraction | Medium | 91% | Schema markup |
| **BART Zero-Shot** | Classification | Slow | 90% | Topic categorization |
| **BART Summarization** | Summarization | Slow | 87% | Meta descriptions |

### 4-Stage Processing Pipeline

1. **Realtime** (during crawling): MiniLM, MobileNet, Toxicity Detection
2. **Batch** (post-crawl): DistilBERT, Universal Encoder, BERT NER
3. **Detailed** (offline): BERT Base, EfficientNet, BERT QA
4. **Specialized** (advanced): BART models for complex tasks

---

## 💡 Common Use Cases

### 1. Real-Time Content Analysis During Crawling

```javascript
import { CrawlerNeuralIntegration } from './services/crawler-neural-integration.js';

const integration = new CrawlerNeuralIntegration({
  enableRealtimeInference: true,  // Enable fast models
  enableBatchProcessing: false
});

await integration.initialize();

// Process page during crawl
const results = await integration.processCrawledPage({
  url: 'https://example.com',
  content: 'Page content...',
  images: [...],
  attributes: { /* 192 SEO attributes */ }
});

// Get immediate recommendations
console.log(results.recommendations); // Array of actionable items
```

**Models Used**: MiniLM (embeddings), MobileNet (images), Toxicity (safety)  
**Performance**: ~100-150ms per page

---

### 2. Batch Processing for Detailed Analysis

```javascript
const pages = await crawler.crawlWebsite('https://example.com');

const integration = new CrawlerNeuralIntegration({
  enableRealtimeInference: false,
  enableBatchProcessing: true,
  batchSize: 10
});

const results = await integration.batchProcessPages(pages);

// Analyze all results
const criticalIssues = results
  .flatMap(r => r.recommendations)
  .filter(rec => rec.priority === 'critical');
```

**Models Used**: All models for comprehensive analysis  
**Performance**: ~250-500ms per page

---

### 3. Find Best Model for Specific Task

```javascript
import { SEOPreTrainedModelsRegistry } from './services/seo-pretrained-models-registry.js';

const registry = new SEOPreTrainedModelsRegistry();

// Get models for sentiment analysis
const sentimentModels = registry.getModelsByUseCase('user-sentiment-analysis');

// Get fast models only
const fastModels = registry.getFastModelsForCrawling();

// Get optimal model for task
const bestModel = registry.getRecommendedConfig('text-classification', {
  performance: 'fast',
  accuracy: 0.9
});
```

---

### 4. Transfer Learning for Your Domain

```javascript
const registry = new SEOPreTrainedModelsRegistry();

// Get transfer learning config for BERT
const config = registry.getTransferLearningConfig('bert-base-uncased');

console.log(config);
// {
//   freezeLayers: 8,
//   additionalLayers: [
//     { type: 'dense', units: 512, activation: 'relu' },
//     { type: 'batchNormalization' },
//     { type: 'dropout', rate: 0.4 }
//   ]
// }

// Use config to fine-tune on your SEO data
import { NeuralNetworkSEOTrainer } from './services/neural-network-seo-trainer.js';

const trainer = new NeuralNetworkSEOTrainer({
  inputDimensions: 192,
  hiddenLayers: [512, 256],  // From transfer learning config
  learningRate: 0.0001       // Lower LR for fine-tuning
});

await trainer.train(yourSEOData);
```

---

### 5. Complete Integration Example

```javascript
import { SEOCrawlerWithNeuralModels } from './services/seo-crawler-neural-example.js';

const crawler = new SEOCrawlerWithNeuralModels({
  databaseUrl: process.env.DATABASE_URL
});

await crawler.initialize();

// Crawl and analyze
const result = await crawler.crawlPageWithAnalysis('https://example.com');

// Get recommendations
console.log('Recommendations:');
result.recommendations.forEach(rec => {
  console.log(`[${rec.priority}] ${rec.title}: ${rec.description}`);
});

// Generate report
await crawler.generateReport();
```

**Output Example**:
```
📊 Crawler Statistics:
   Pages Crawled: 10
   Pages Analyzed: 10
   Recommendations: 45
   Avg Inference Time: 120ms/page

🧠 Neural Integration Statistics:
   Success Rate: 100%
   Models Available: 11
```

---

## 🎯 Performance Tips

### 1. Choose Right Models for Your Needs

**For Real-Time Crawling** (need speed):
- ✅ MiniLM (90MB, very fast)
- ✅ MobileNet V2 (14MB, very fast)
- ✅ Toxicity Detection (50MB, fast)
- ❌ BERT Base (440MB, medium)
- ❌ BART models (1600MB, slow)

**For Batch Processing** (need accuracy):
- ✅ All models
- Use parallel processing for efficiency

### 2. Cache Models

Models are automatically cached after first load:

```javascript
// ✅ Good: Initialize once
const integration = new CrawlerNeuralIntegration();
await integration.initialize(); // Loads models

for (const page of pages) {
  await integration.processCrawledPage(page); // Reuses cached models
}

// ❌ Bad: Initialize repeatedly
for (const page of pages) {
  const integration = new CrawlerNeuralIntegration();
  await integration.initialize(); // Reloads models every time!
}
```

### 3. Use Batch Processing

```javascript
// ✅ Better: Batch processing
const results = await integration.batchProcessPages(pages);

// ❌ Slower: Sequential processing
for (const page of pages) {
  await integration.processCrawledPage(page);
}
```

### 4. Monitor Performance

```javascript
const stats = integration.getStatistics();
console.log('Avg inference time:', stats.averageInferenceTime);
console.log('Success rate:', stats.successRate);

// Adjust configuration based on stats
if (parseFloat(stats.averageInferenceTime) > 200) {
  console.log('Consider using faster models');
}
```

---

## 📚 Documentation

- **Complete Guide**: [PRETRAINED_MODELS_SEO_GUIDE.md](./PRETRAINED_MODELS_SEO_GUIDE.md)
  - All 11 models detailed
  - Transfer learning guide
  - Performance considerations

- **API Reference**: See guide for full API documentation

- **Architecture**: [TENSORFLOW_WORKFLOW_README.md](./TENSORFLOW_WORKFLOW_README.md)

---

## 🔧 Configuration Options

### CrawlerNeuralIntegration Options

```javascript
const integration = new CrawlerNeuralIntegration({
  db: postgresPool,                    // PostgreSQL connection
  enableRealtimeInference: true,       // Use fast models during crawl
  enableBatchProcessing: true,         // Enable batch processing
  batchSize: 10,                       // Pages per batch
  inferenceTimeout: 5000,              // Max inference time (ms)
  neuralTrainer: customTrainer         // Custom trainer instance
});
```

### EnhancedModelLibraryService Options

```javascript
const library = new EnhancedModelLibraryService({
  db: postgresPool,
  autoSetupModels: true,               // Auto-register recommended models
  prioritizeFastModels: true,          // Prefer fast models
  enableTransferLearning: true         // Enable transfer learning features
});
```

---

## 🚨 Troubleshooting

### "Model not found" Error

```bash
# Make sure you initialized the integration
await integration.initialize();
```

### Slow Performance

```javascript
// Use fast models for real-time
const fastModels = registry.getFastModelsForCrawling();
console.log('Fast models:', fastModels.map(m => m.name));
```

### High Memory Usage

```javascript
// Clean up when done
await integration.dispose();
```

### TensorFlow Errors

```bash
# Install native bindings for better performance
npm install @tensorflow/tfjs-node

# Or CPU-only version if GPU not available
npm install @tensorflow/tfjs-node-cpu
```

---

## 🎓 Learning Resources

1. **Start Here**: Run `demo-pretrained-models-simple.js`
2. **Read Guide**: [PRETRAINED_MODELS_SEO_GUIDE.md](./PRETRAINED_MODELS_SEO_GUIDE.md)
3. **Example Code**: [services/seo-crawler-neural-example.js](./services/seo-crawler-neural-example.js)
4. **Model Details**: Check `services/seo-pretrained-models-registry.js`

---

## ✅ Next Steps

1. ✅ Run demo: `node demo-pretrained-models-simple.js`
2. ✅ Review models in [PRETRAINED_MODELS_SEO_GUIDE.md](./PRETRAINED_MODELS_SEO_GUIDE.md)
3. ✅ Integrate with your crawler
4. ✅ Fine-tune with your SEO data
5. ✅ Monitor performance and optimize

---

## 💬 Support

- **Documentation Issues**: Check [PRETRAINED_MODELS_SEO_GUIDE.md](./PRETRAINED_MODELS_SEO_GUIDE.md)
- **Integration Help**: See [services/seo-crawler-neural-example.js](./services/seo-crawler-neural-example.js)
- **Model Questions**: Review model registry in `services/seo-pretrained-models-registry.js`

Happy optimizing! 🚀
