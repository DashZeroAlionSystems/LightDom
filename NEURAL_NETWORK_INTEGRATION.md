# Neural Network Integration Instructions

## Quick Integration Guide

This document provides step-by-step instructions for integrating the neural network modularization system into the LightDom platform.

## Step 1: Database Setup

### Run Migration

Execute the database migration to create the neural network instances table:

```bash
# Using psql
psql -U your_user -d lightdom_db -f database/140-neural-network-instances.sql

# Or using npm script (if configured)
npm run db:migrate
```

### Verify Tables

Verify the tables and views were created:

```sql
-- Check table exists
\dt neural_network_instances

-- Check indexes
\di idx_nn_*

-- Check views
\dv v_active_neural_network_instances
\dv v_neural_network_performance

-- Test query
SELECT * FROM neural_network_instances LIMIT 1;
```

## Step 2: Install Dependencies

Ensure TensorFlow.js Node is installed:

```bash
# Install TensorFlow.js for Node.js (GPU support)
npm install @tensorflow/tfjs-node

# Or for CPU-only version (smaller package)
npm install @tensorflow/tfjs-node-cpu
```

## Step 3: Wire Up API Routes

### Option A: Modify `api-server-express.js`

Add the neural network routes to your main Express server:

```javascript
// In api-server-express.js

// Add import at top
import { createNeuralNetworkRoutes } from './api/neural-network-routes.js';

// ... existing imports ...

// In your Express app setup (after creating dbPool)
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Add neural network routes
app.use('/api/neural-networks', createNeuralNetworkRoutes(dbPool));

// ... rest of your routes ...
```

### Option B: Create Separate Module

Create a new file `api/routes.js` that aggregates all routes:

```javascript
// api/routes.js
import { Router } from 'express';
import { createNeuralNetworkRoutes } from './neural-network-routes.js';
// ... other route imports ...

export function setupRoutes(app, dbPool) {
  app.use('/api/neural-networks', createNeuralNetworkRoutes(dbPool));
  // ... other routes ...
}
```

Then in `api-server-express.js`:

```javascript
import { setupRoutes } from './api/routes.js';

// After creating Express app and dbPool
setupRoutes(app, dbPool);
```

## Step 4: Add Dashboard to Admin Panel

### Modify Admin Routes

Add the neural network dashboard to your admin panel navigation:

```typescript
// In src/App.tsx or your admin routes file

import NeuralNetworkInstanceDashboard from '@/components/dashboards/NeuralNetworkInstanceDashboard';

// Add to your routes
<Route path="/admin/neural-networks" element={<NeuralNetworkInstanceDashboard />} />
```

### Add to Navigation Menu

Add a menu item in your admin sidebar:

```typescript
// In your admin navigation component
const menuItems = [
  // ... existing items ...
  {
    key: 'neural-networks',
    icon: <RocketOutlined />,
    label: 'Neural Networks',
    path: '/admin/neural-networks',
    description: 'Manage neural network instances'
  }
];
```

## Step 5: Environment Variables

Add necessary environment variables to `.env`:

```bash
# Neural Network Configuration
NN_MODELS_DIR=./models
NN_CONFIG_DIR=./config/neural-networks
NN_GPU_ENABLED=true
NN_MAX_CONCURRENT_TRAINING=3

# TensorFlow Configuration
TF_CPP_MIN_LOG_LEVEL=2
```

## Step 6: Create Models Directory

Create directories for model storage:

```bash
mkdir -p models
mkdir -p config/neural-networks
```

## Step 7: Test the Integration

### Test API Endpoints

```bash
# Test getting model types
curl http://localhost:3001/api/neural-networks/model-types

# Test creating an instance
curl -X POST http://localhost:3001/api/neural-networks/instances \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "test-client",
    "modelType": "seo_optimization",
    "metadata": {
      "name": "Test SEO Optimizer"
    }
  }'

# Test listing instances
curl http://localhost:3001/api/neural-networks/instances
```

### Test Dashboard

1. Navigate to `http://localhost:3000/admin/neural-networks`
2. Click "Create Instance"
3. Fill in the form:
   - Client ID: `test-client`
   - Model Type: `SEO Optimization`
   - Instance Name: `Test SEO Optimizer`
4. Click "Create Instance"
5. Verify the instance appears in the table

## Step 8: Create Test Data

Create test training data for development:

```sql
-- Create test training data table (if not exists)
CREATE TABLE IF NOT EXISTS training_data (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  model_type VARCHAR(100) NOT NULL,
  features JSONB NOT NULL,
  labels JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert test data for SEO optimization
INSERT INTO training_data (client_id, model_type, features, labels)
SELECT 
  'test-client',
  'seo_optimization',
  jsonb_build_object(
    'meta_tags', random() * 10,
    'heading_structure', random() * 5,
    'page_load_time', random() * 5,
    'mobile_friendliness', random()
  ),
  jsonb_build_object(
    'seo_score', random()
  )
FROM generate_series(1, 1000);
```

## Step 9: Train a Test Model

### Via API

```bash
# Get instance ID from list
INSTANCE_ID="nn-test-client-seo-optimization-123456"

# Start training
curl -X POST http://localhost:3001/api/neural-networks/instances/$INSTANCE_ID/train
```

### Via Dashboard

1. Navigate to the Neural Networks dashboard
2. Find your test instance
3. Click the "Play" icon to start training
4. Watch the status change to "TRAINING"
5. Wait for completion (status changes to "READY")
6. View performance metrics in the instance details

## Step 10: Make Test Predictions

```bash
# Make prediction via API
curl -X POST http://localhost:3001/api/neural-networks/instances/$INSTANCE_ID/predict \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "meta_tags": 8,
      "heading_structure": 4,
      "page_load_time": 2.5,
      "mobile_friendliness": 0.9
    }
  }'
```

## Step 11: Set Up Monitoring (Optional)

Add monitoring for neural network instances:

```javascript
// In your monitoring setup
import { NeuralNetworkInstanceManager } from './src/services/NeuralNetworkInstanceManager';

const manager = new NeuralNetworkInstanceManager(dbPool);

// Listen to events
manager.on('instance:created', (instance) => {
  console.log('New instance created:', instance.id);
  // Send to monitoring service
});

manager.on('instance:training:complete', ({ instance, performance }) => {
  console.log('Training complete:', instance.id, performance);
  // Alert if accuracy is below threshold
  if (performance.accuracy < 0.7) {
    // Send alert
  }
});

manager.on('instance:training:error', ({ instance, error }) => {
  console.error('Training failed:', instance.id, error);
  // Send error alert
});
```

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@tensorflow/tfjs-node'`
**Solution**: Run `npm install @tensorflow/tfjs-node`

**Issue**: Database connection errors
**Solution**: Verify DATABASE_URL environment variable is set correctly

**Issue**: Models directory not found
**Solution**: Run `mkdir -p models` to create the directory

**Issue**: Training fails with "Insufficient training data"
**Solution**: Insert more test data (minimum 1000 rows per model type)

**Issue**: GPU errors
**Solution**: Set `NN_GPU_ENABLED=false` to use CPU-only mode

### Logs and Debugging

Enable detailed logging:

```javascript
// In your service initialization
const manager = new NeuralNetworkInstanceManager(dbPool, './models', './config/neural-networks');

// Add event listeners for debugging
manager.on('instance:training:progress', ({ instanceId, epoch, logs }) => {
  console.log(`Training progress [${instanceId}] Epoch ${epoch}:`, logs);
});
```

## Next Steps

1. **Add Authentication**: Protect API endpoints with authentication middleware
2. **Add Authorization**: Implement client-based access control
3. **Add Rate Limiting**: Limit training and prediction requests
4. **Set Up Webhooks**: Notify clients when training completes
5. **Add Monitoring**: Set up alerts for training failures
6. **Create Documentation**: Add API documentation with Swagger/OpenAPI
7. **Performance Tuning**: Optimize TensorFlow.js configuration
8. **Scale Horizontally**: Deploy multiple instances for load balancing

## Production Checklist

Before deploying to production:

- [ ] Database migration tested on staging
- [ ] API endpoints secured with authentication
- [ ] Client authorization implemented
- [ ] Rate limiting configured
- [ ] Error handling and logging in place
- [ ] Monitoring and alerts configured
- [ ] Backup strategy for models directory
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on new features

## Support

For issues or questions:
- Review `NEURAL_NETWORK_MODULARIZATION_GUIDE.md` for architecture details
- Check schema files in `schemas/neural-networks/`
- See example configurations in `config/neural-networks/`
- Review API implementation in `api/neural-network-routes.js`
