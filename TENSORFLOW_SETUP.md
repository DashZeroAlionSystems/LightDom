# TensorFlow SEO Setup Guide

## Quick Setup

### Prerequisites

- Node.js 18+ (current: check with `node --version`)
- npm or yarn package manager
- At least 4GB RAM recommended
- ~500MB disk space for TensorFlow.js

### Installation

The TensorFlow dependencies are already in `package.json`. Simply run:

```bash
# Install all dependencies (includes TensorFlow.js)
npm install
```

This will install:
- `@tensorflow/tfjs@4.21.0` - TensorFlow.js core
- `@tensorflow/tfjs-node@4.21.0` - Node.js backend (optional, for better performance)

### Verification

```bash
# Verify TensorFlow is installed
node -e "import('@tensorflow/tfjs').then(() => console.log('✅ TensorFlow.js is ready'))"

# Quick demo
npm run tensorflow:demo
```

## Running the System

### 1. Quick Demo (No Setup Required)

```bash
npm run tensorflow:demo
```

This runs a standalone demo showing:
- Available models
- ML-enhanced crawling
- Sample page analysis
- Recommendation generation

### 2. Run Examples

```bash
npm run tensorflow:examples
```

Demonstrates:
- Basic crawling
- Batch processing
- Smart seeding
- Complete system integration
- Real-world usage

### 3. Integration Tests

```bash
npm run tensorflow:test
```

Runs comprehensive test suite validating:
- Model registry
- Pre-trained network
- Crawler integration
- Seeder functionality

## Configuration

### Model Storage Path

```javascript
const crawler = new TensorFlowEnhancedCrawler({
  modelPath: './models/seo'  // Where to store trained models
});
```

Default: `./models/seo`

### Enable/Disable ML

```javascript
const crawler = new TensorFlowEnhancedCrawler({
  enableML: true,      // Enable ML features
  autoLearn: true      // Enable continuous learning
});
```

### Performance Tuning

```javascript
const network = new PretrainedSEONetwork({
  batchSize: 32,           // Training batch size
  learningRate: 0.0005,    // Learning rate
  saveInterval: 100        // Save every N samples
});
```

## Backend Selection

### Default (CPU Backend)

Works out of the box with `@tensorflow/tfjs`:
- ✅ No additional setup
- ✅ Cross-platform
- ⚠️ Slower inference (~15ms per prediction)

### Node.js Backend (Recommended)

Uses `@tensorflow/tfjs-node` for better performance:
- ✅ 5-10x faster inference
- ✅ Better memory management
- ⚠️ Requires native compilation

Already included in dependencies. Will auto-detect if available.

### GPU Backend (Optional)

For maximum performance with CUDA GPU:

```bash
# Instead of tfjs-node, install GPU version
npm uninstall @tensorflow/tfjs-node
npm install @tensorflow/tfjs-node-gpu@4.21.0
```

Requirements:
- NVIDIA GPU with CUDA support
- CUDA 11.2+
- cuDNN 8.1+

## Troubleshooting

### Issue: "Cannot find package @tensorflow/tfjs"

**Solution**: Install dependencies
```bash
npm install
```

### Issue: "Native addon failed to load"

**Solution**: TensorFlow Node backend failed, falling back to CPU
```bash
# Reinstall with native compilation
npm rebuild @tensorflow/tfjs-node
```

This is non-critical - system will use CPU backend.

### Issue: Out of Memory

**Solution**: Reduce batch size
```javascript
const network = new PretrainedSEONetwork({
  batchSize: 16  // Reduce from 32
});
```

### Issue: Slow Performance

**Solutions**:
1. Ensure `@tensorflow/tfjs-node` is installed (check above)
2. Use GPU backend if available
3. Reduce model complexity for specific tasks

### Issue: Model Not Saving

**Solution**: Check permissions and disk space
```bash
# Create models directory with proper permissions
mkdir -p ./models/seo
chmod 755 ./models/seo
```

## Directory Structure

After setup, your structure should be:

```
LightDom/
├── models/              # Created automatically
│   └── seo/
│       └── MASTER_SEO_PREDICTOR/
│           ├── model.json
│           ├── weights.bin
│           └── metadata.json
├── src/ml/              # Source code (already exists)
├── examples/            # Examples (already exists)
├── test/               # Tests (already exists)
└── node_modules/       # After npm install
    ├── @tensorflow/
    │   ├── tfjs/
    │   └── tfjs-node/
    └── ...
```

## Platform-Specific Notes

### Linux
```bash
# Install build tools if needed
sudo apt-get install build-essential python3
npm install
```

### macOS
```bash
# Install Xcode Command Line Tools if needed
xcode-select --install
npm install
```

### Windows
```bash
# Install Visual Studio Build Tools if needed
# Then:
npm install
```

## Development Setup

For contributing or extending:

```bash
# Install dev dependencies
npm install --include=dev

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint code
npm run lint
```

## Minimal Setup (No Database)

The TensorFlow system works standalone without database:

```javascript
import { TensorFlowEnhancedCrawler } from './src/ml/tensorflow-crawler-integration.js';

// Works without DB connection
const crawler = new TensorFlowEnhancedCrawler({
  enableML: true,
  autoLearn: false  // Disable if no DB
});

await crawler.initialize();
// Use for analysis without storing results
```

## Full Setup (With Database)

For production with data persistence:

```bash
# 1. Setup PostgreSQL database
# 2. Run migrations (if not already done)
npm run db:migrate

# 3. Start with full features
npm run tensorflow:examples
```

See main `README.md` for database setup.

## Next Steps

1. ✅ Run `npm install`
2. ✅ Test with `npm run tensorflow:demo`
3. ✅ Review `TENSORFLOW_SEO_INTEGRATION_GUIDE.md`
4. ✅ Integrate with your crawler
5. ✅ Enable continuous learning

## Support

- **Documentation**: See `TENSORFLOW_SEO_INTEGRATION_GUIDE.md`
- **Examples**: Check `examples/tensorflow-seo-examples.js`
- **Tests**: Review `test/tensorflow-seo-integration.test.js`
- **Issues**: Report on GitHub

---

**Quick Start**: `npm install && npm run tensorflow:demo`
