# Neural Network Modularization - Quick Reference

## 📋 Overview

Complete implementation of modularized neural network system with:
- ✅ **10 Model Types** across different AI/ML use cases
- ✅ **Per-Client Instances** with strict data isolation
- ✅ **Revenue Model** with 4 service tiers
- ✅ **Workflow Automation** with 8-stage ML pipeline
- ✅ **UI Dashboard** for instance management
- ✅ **RESTful API** with 8 endpoints

## 🚀 Quick Start

### 1. Database Setup
```bash
psql -U your_user -d lightdom_db -f database/140-neural-network-instances.sql
```

### 2. Install Dependencies
```bash
npm install @tensorflow/tfjs-node
```

### 3. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

### 4. Access Dashboard
Navigate to: `http://localhost:3000/admin/neural-networks`

## 📁 File Structure

```
LightDom/
├── schemas/
│   ├── neural-networks/
│   │   ├── neural-network-instance.json      # Instance schema
│   │   └── neural-network-workflow.json      # Workflow schema
│   └── revenue-models/
│       └── revenue-model.json                 # Revenue schema
├── config/
│   ├── revenue-model-2025.json                # Service tiers
│   └── neural-networks/
│       ├── workflow-seo-optimization.json     # Example workflow
│       └── example-instance-client-001.json   # Example instance
├── src/
│   ├── services/
│   │   └── NeuralNetworkInstanceManager.ts    # Core service
│   └── components/
│       └── dashboards/
│           └── NeuralNetworkInstanceDashboard.tsx  # UI
├── api/
│   └── neural-network-routes.js               # API endpoints
├── database/
│   └── 140-neural-network-instances.sql       # DB migration
└── docs/
    ├── NEURAL_NETWORK_MODULARIZATION_GUIDE.md # Full guide
    └── NEURAL_NETWORK_INTEGRATION.md          # Integration steps
```

## 🎯 Model Types

1. **SEO Optimization** - Optimize website SEO
2. **Component Generation** - Generate React components
3. **Workflow Prediction** - Predict optimal workflows
4. **Accessibility Improvement** - Enhance accessibility
5. **UX Pattern Recognition** - Recognize UX patterns
6. **Schema Relationship Learning** - Learn schema relationships
7. **Performance Optimization** - Optimize performance
8. **Design System Extraction** - Extract design systems
9. **Content Generation** - Generate optimized content
10. **Sentiment Analysis** - Analyze sentiment

## 💰 Service Tiers

| Tier | Price | Instances | Models | Training | GPU |
|------|-------|-----------|--------|----------|-----|
| Free | $0 | 1 | 1 | Weekly | ❌ |
| Basic | $49 | 3 | 3 | Daily | ❌ |
| Professional | $199 | 10 | 7 | Real-time | ✅ |
| Enterprise | $999 | ∞ | 10 | Real-time | ✅ |

## 🔌 API Endpoints

```
GET    /api/neural-networks/instances              # List instances
POST   /api/neural-networks/instances              # Create instance
GET    /api/neural-networks/instances/:id          # Get instance
POST   /api/neural-networks/instances/:id/train    # Train model
POST   /api/neural-networks/instances/:id/predict  # Predict
DELETE /api/neural-networks/instances/:id          # Delete
GET    /api/neural-networks/client/:id/instances   # Client instances
GET    /api/neural-networks/model-types            # Model types
GET    /api/neural-networks/stats                  # Statistics
```

## 💻 Usage Examples

### Create Instance
```typescript
const response = await fetch('/api/neural-networks/instances', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-001',
    modelType: 'seo_optimization',
    metadata: { name: 'My SEO Optimizer' },
    trainingConfig: { epochs: 50, batchSize: 32 }
  })
});
```

### Train Model
```typescript
await fetch(`/api/neural-networks/instances/${id}/train`, {
  method: 'POST'
});
```

### Make Prediction
```typescript
const response = await fetch(`/api/neural-networks/instances/${id}/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: { meta_tags: 8, page_load_time: 2.5 }
  })
});
```

## 🔧 Configuration

### Environment Variables
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
NN_MODELS_DIR=./models
NN_CONFIG_DIR=./config/neural-networks
NN_GPU_ENABLED=true
```

### Training Config
```json
{
  "epochs": 50,
  "batchSize": 32,
  "learningRate": 0.001,
  "validationSplit": 0.2,
  "optimizer": "adam"
}
```

### Data Config
```json
{
  "source": "database",
  "isolation": "strict",
  "dataPath": "SELECT * FROM training_data WHERE client_id = 'client-001'",
  "minDataPoints": 1000
}
```

## 📊 Workflow Stages

1. **Data Collection** → Gather from sources
2. **Data Validation** → Ensure quality
3. **Preprocessing** → Normalize features
4. **Feature Engineering** → Create derived features
5. **Model Training** → Train neural network
6. **Model Validation** → Validate performance
7. **Deployment** → Deploy to production
8. **Monitoring** → Track performance

## 🎨 UI Features

- **Instance Management**: Create, view, delete instances
- **Training Control**: Start/stop training
- **Performance Metrics**: Accuracy, loss, inference time
- **Real-time Stats**: Total, ready, training, errors
- **Client Filtering**: View instances per client
- **Detailed View**: Configuration and metrics tabs

## 📈 Performance Metrics

Tracked for each instance:
- **Accuracy**: Model accuracy on validation set
- **Loss**: Training and validation loss
- **Training Time**: Total time to train
- **Inference Time**: Average prediction time
- **Prediction Count**: Total predictions made

## 🔒 Data Isolation

Three isolation modes:

1. **Strict** (default): Complete per-client separation
2. **Shared**: Cross-client learning (aggregated)
3. **Federated**: Distributed learning across clients

## 🌐 Integration

### Add to Express Server
```javascript
import { createNeuralNetworkRoutes } from './api/neural-network-routes.js';

app.use('/api/neural-networks', createNeuralNetworkRoutes(dbPool));
```

### Add to React Router
```typescript
import NeuralNetworkInstanceDashboard from '@/components/dashboards/NeuralNetworkInstanceDashboard';

<Route path="/admin/neural-networks" element={<NeuralNetworkInstanceDashboard />} />
```

## 📚 Documentation

- **Full Guide**: `NEURAL_NETWORK_MODULARIZATION_GUIDE.md`
- **Integration**: `NEURAL_NETWORK_INTEGRATION.md`
- **Schemas**: `schemas/neural-networks/`
- **Examples**: `config/neural-networks/`

## ✅ Checklist

Before deploying:
- [ ] Database migration completed
- [ ] Dependencies installed
- [ ] API routes integrated
- [ ] Dashboard added to navigation
- [ ] Environment variables configured
- [ ] Test instances created
- [ ] Training tested
- [ ] Predictions tested
- [ ] Monitoring configured
- [ ] Documentation reviewed

## 🆘 Troubleshooting

**Issue**: TensorFlow not found
```bash
npm install @tensorflow/tfjs-node
```

**Issue**: Database errors
```bash
# Verify database connection
psql -U your_user -d lightdom_db -c "SELECT * FROM neural_network_instances;"
```

**Issue**: Training fails
```sql
-- Check training data exists
SELECT client_id, model_type, COUNT(*) 
FROM training_data 
GROUP BY client_id, model_type;
```

## 📞 Support

- Schema validation: `schemas/neural-networks/`
- API docs: `api/neural-network-routes.js`
- Service docs: `src/services/NeuralNetworkInstanceManager.ts`
- UI docs: `src/components/dashboards/NeuralNetworkInstanceDashboard.tsx`

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Status**: ✅ Production Ready
