# Quick Start: SEO Neural Network with 192 Attributes

## ✅ What's Included

- **192 SEO attributes** fully configured
- **Pretrained models** ready to use
- **Configurable batch sizes** (8-128, auto-tuning)
- **REST API** for all operations
- **Data collection** via miners & seeders

## 🚀 5-Minute Setup

```javascript
import SEONeuralCampaignService from './services/seo-neural-campaign-service.js';

// 1. Initialize
const campaign = new SEONeuralCampaignService({
  clientId: 'my-client',
  usePretrainedModel: true,  // Use base model
  batchSize: 32,              // Configurable
  autoTuneBatchSize: true     // Auto-optimize
});
await campaign.initialize();

// 2. Analyze (extracts all 192 attributes)
const recommendations = await campaign.getOptimizationRecommendations(html, url);

// 3. Train
await campaign.trainWithData(trainingData);

// 4. Update batch size
campaign.setBatchSize(64);
```

## 🔍 Verify Installation

```bash
node scripts/validate-config.js
```

Should show:
```
✅ 192 SEO attributes configured
✅ 27 attribute categories
✅ Batch size: 32 (configurable)
```

## 📚 Documentation

See `docs/SEO_NEURAL_CAMPAIGN.md` for complete guide.
