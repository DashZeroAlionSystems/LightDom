# LightDom Framework Usage Examples

This document provides comprehensive usage examples for the LightDom Framework.

## 🚀 Basic Usage

### 1. Quick Start

```javascript
import { quickStart } from './src/framework';

// Start framework with default configuration
const runner = await quickStart();
console.log('Framework started!');
```

### 2. Custom Configuration

```javascript
import { initializeLightDomFramework } from './src/framework';

const config = {
  framework: {
    port: 3000,
    enableSimulation: true,
    simulationInterval: 30000, // 30 seconds
    maxConcurrentOptimizations: 20
  },
  simulation: {
    enabled: true,
    interval: 30000,
    enableNetworkOptimization: true,
    simulationDepth: 'deep'
  },
  api: {
    port: 3000,
    enableCORS: true,
    enableSwagger: true
  }
};

const runner = await initializeLightDomFramework(config);
```

## 📝 URL Management

### Adding URLs to Queue

```javascript
import { frameworkRunner } from './src/framework';

// Add single URL
const queueId = await frameworkRunner.addURL(
  'https://example.com',
  'high', // priority
  'ecommerce' // site type
);

// Add multiple URLs
const urls = [
  { url: 'https://shop.example.com', priority: 'high', siteType: 'ecommerce' },
  { url: 'https://blog.example.com', priority: 'medium', siteType: 'blog' },
  { url: 'https://about.example.com', priority: 'low', siteType: 'corporate' }
];

const queueIds = await frameworkRunner.addURLs(urls);
```

### Queue Management

```javascript
// Get queue status
const status = frameworkRunner.getQueueStatus();
console.log('Queue status:', status);

// Check specific queue item
const item = urlQueueManager.getItem(queueId);
console.log('Queue item:', item);

// Retry failed item
const success = urlQueueManager.retryItem(queueId);
```

## 🔄 Simulation Engine

### Running Simulations

```javascript
import { simulationEngine } from './src/framework';

// Run single simulation
const result = await simulationEngine.runSimulation();
console.log('Network efficiency:', result.networkEfficiency);
console.log('Recommendations:', result.recommendations);

// Get simulation history
const history = simulationEngine.getSimulationHistory();
console.log('Total simulations:', history.length);

// Get simulation statistics
const stats = simulationEngine.getSimulationStatistics();
console.log('Average efficiency:', stats.averageEfficiency);
```

### Simulation Configuration

```javascript
// Update simulation configuration
simulationEngine.updateConfig({
  interval: 30000, // 30 seconds
  enableNetworkOptimization: true,
  enableTokenOptimization: true,
  simulationDepth: 'deep'
});
```

## 🌐 API Usage

### REST API Examples

```bash
# Health check
curl http://localhost:3000/health

# Get framework status
curl http://localhost:3000/api/v1/status

# Add URL to queue
curl -X POST http://localhost:3000/api/v1/queue/urls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "priority": "high",
    "siteType": "ecommerce"
  }'

# Get queue status
curl http://localhost:3000/api/v1/queue/status

# Run simulation
curl -X POST http://localhost:3000/api/v1/simulation/run

# Get optimization perks
curl http://localhost:3000/api/v1/perks/ecommerce
```

### JavaScript API Client

```javascript
// Using fetch API
const addURL = async (url, priority, siteType) => {
  const response = await fetch('http://localhost:3000/api/v1/queue/urls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, priority, siteType })
  });
  
  const result = await response.json();
  return result.data.queueId;
};

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
});

const addURL = async (url, priority, siteType) => {
  const response = await api.post('/queue/urls', {
    url, priority, siteType
  });
  return response.data.data.queueId;
};
```

## 🎯 Optimization Perks

### Getting Perks by Site Type

```javascript
import { lightDomFramework } from './src/framework';

// Get perks for e-commerce sites
const ecommercePerks = lightDomFramework.getOptimizationPerks('ecommerce');
console.log('E-commerce perks:', ecommercePerks);

// Get all available perks
const allPerks = lightDomFramework.getAllOptimizationPerks();
console.log('All perks:', allPerks);
```

### Custom Perks Implementation

```javascript
// Add custom site type with perks
const customPerks = {
  siteType: 'gaming',
  perks: [
    {
      name: 'Game Asset Optimization',
      description: 'Optimize game assets and resources',
      value: '40% faster loading',
      category: 'performance',
      tier: 'premium'
    },
    {
      name: 'Real-time Optimization',
      description: 'Optimize real-time game performance',
      value: '60% better FPS',
      category: 'performance',
      tier: 'enterprise'
    }
  ]
};

// Register custom perks
lightDomFramework.optimizationPerks.set('gaming', customPerks);
```

## 📊 Monitoring & Metrics

### Getting Framework Metrics

```javascript
// Get comprehensive metrics
const metrics = frameworkRunner.getMetrics();
console.log('Framework metrics:', metrics);

// Get specific metrics
const status = frameworkRunner.getStatus();
console.log('Active nodes:', status.metrics.activeNodes);
console.log('Queue size:', status.metrics.queueSize);
console.log('Simulation efficiency:', status.metrics.simulationEfficiency);
```

### Real-time Monitoring

```javascript
// Listen to framework events
frameworkRunner.on('urlAdded', (item) => {
  console.log('URL added:', item.url);
});

frameworkRunner.on('optimizationCompleted', (data) => {
  console.log('Optimization completed:', data.item.url);
  console.log('Space saved:', data.result.spaceSavedKB, 'KB');
});

frameworkRunner.on('simulationCompleted', (result) => {
  console.log('Simulation completed:', result.networkEfficiency);
});
```

## 🚀 Deployment Examples

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t lightdom-framework .
docker run -p 3000:3000 lightdom-framework
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  lightdom:
    build: .
    ports:
      - "3000:3000"
    environment:
      - LIGHTDOM_PORT=3000
      - LIGHTDOM_SIMULATION_ENABLED=true
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lightdom-framework
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lightdom-framework
  template:
    metadata:
      labels:
        app: lightdom-framework
    spec:
      containers:
      - name: lightdom
        image: lightdom-framework:latest
        ports:
        - containerPort: 3000
        env:
        - name: LIGHTDOM_PORT
          value: "3000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## 🔧 CLI Usage

### Basic Commands

```bash
# Start framework
npx lightdom start --port 3000 --simulation --api

# Check status
npx lightdom status

# Add URL
npx lightdom add-url https://example.com --priority high --type ecommerce

# View queue
npx lightdom queue --status

# Run simulation
npx lightdom simulation --run

# View metrics
npx lightdom metrics

# Deploy to Kubernetes
npx lightdom deploy --name my-lightdom --replicas 3
```

### Advanced CLI Usage

```bash
# Start with custom configuration
npx lightdom start \
  --port 8080 \
  --simulation \
  --api \
  --metrics

# Add multiple URLs
echo "https://site1.com
https://site2.com
https://site3.com" | xargs -I {} npx lightdom add-url {} --priority medium --type blog

# Monitor queue in real-time
watch -n 5 'npx lightdom queue --status'

# Run simulation and view results
npx lightdom simulation --run && npx lightdom simulation --status
```

## 🎨 React Integration

### Using the Monitoring Dashboard

```jsx
import React from 'react';
import { MonitoringDashboard } from './src/framework/MonitoringDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <MonitoringDashboard />
    </div>
  );
}

export default App;
```

### Custom Dashboard Component

```jsx
import React, { useState, useEffect } from 'react';
import { frameworkRunner } from './src/framework';

function CustomDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = frameworkRunner.getStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!status) return <div>Error loading status</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">LightDom Framework</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Status</h3>
          <p className={status.running ? 'text-green-600' : 'text-red-600'}>
            {status.running ? 'Running' : 'Stopped'}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Active Nodes</h3>
          <p>{status.metrics.activeNodes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Queue Size</h3>
          <p>{status.metrics.queueSize}</p>
        </div>
      </div>
    </div>
  );
}

export default CustomDashboard;
```

## 🔄 Event Handling

### Framework Events

```javascript
import { frameworkRunner } from './src/framework';

// Listen to all framework events
frameworkRunner.on('urlAdded', (item) => {
  console.log('New URL added:', item.url);
});

frameworkRunner.on('optimizationCompleted', (data) => {
  console.log('Optimization completed:', {
    url: data.item.url,
    spaceSaved: data.result.spaceSavedKB,
    tokensEarned: data.result.tokenReward
  });
});

frameworkRunner.on('optimizationFailed', (data) => {
  console.error('Optimization failed:', {
    url: data.item.url,
    error: data.error
  });
});

frameworkRunner.on('simulationCompleted', (result) => {
  console.log('Simulation completed:', {
    efficiency: result.networkEfficiency,
    health: result.networkHealth,
    recommendations: result.recommendations.length
  });
});
```

### Custom Event Handlers

```javascript
// Create custom event handler
const handleOptimizationComplete = (data) => {
  // Send notification
  sendNotification(`Optimization completed for ${data.item.url}`);
  
  // Update database
  updateOptimizationRecord(data.item.id, data.result);
  
  // Trigger webhook
  sendWebhook('optimization.completed', data);
};

// Register event handler
frameworkRunner.on('optimizationCompleted', handleOptimizationComplete);
```

## 🧪 Testing

### Unit Testing

```javascript
import { frameworkRunner } from './src/framework';

describe('LightDom Framework', () => {
  beforeEach(async () => {
    await frameworkRunner.start();
  });

  afterEach(async () => {
    await frameworkRunner.stop();
  });

  test('should add URL to queue', async () => {
    const queueId = await frameworkRunner.addURL(
      'https://example.com',
      'high',
      'ecommerce'
    );
    
    expect(queueId).toBeDefined();
    expect(typeof queueId).toBe('string');
  });

  test('should get framework status', () => {
    const status = frameworkRunner.getStatus();
    
    expect(status).toBeDefined();
    expect(status.running).toBe(true);
    expect(status.metrics).toBeDefined();
  });
});
```

### Integration Testing

```javascript
import request from 'supertest';
import { apiGateway } from './src/framework';

describe('API Integration', () => {
  test('should add URL via API', async () => {
    const response = await request(apiGateway.app)
      .post('/api/v1/queue/urls')
      .send({
        url: 'https://example.com',
        priority: 'high',
        siteType: 'ecommerce'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.queueId).toBeDefined();
  });

  test('should get queue status', async () => {
    const response = await request(apiGateway.app)
      .get('/api/v1/queue/status')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBeDefined();
  });
});
```

## 🔐 Security

### API Security

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// CORS configuration
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Input validation
const Joi = require('joi');

const urlSchema = Joi.object({
  url: Joi.string().uri().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  siteType: Joi.string().valid('ecommerce', 'blog', 'corporate', 'portfolio', 'news', 'social', 'other').required()
});
```

### Environment Security

```bash
# Secure environment variables
export LIGHTDOM_API_SECRET="your-secret-key"
export LIGHTDOM_WEBHOOK_SECRET="your-webhook-secret"
export LIGHTDOM_DB_PASSWORD="secure-password"
export LIGHTDOM_REDIS_PASSWORD="secure-redis-password"

# Use secrets management
export LIGHTDOM_SECRETS_PROVIDER="aws-secrets-manager"
export LIGHTDOM_SECRETS_REGION="us-west-2"
```

## 📈 Performance Optimization

### Memory Management

```javascript
// Monitor memory usage
const monitorMemory = () => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
    external: Math.round(usage.external / 1024 / 1024) + ' MB'
  });
};

setInterval(monitorMemory, 30000); // Every 30 seconds
```

### Caching Strategy

```javascript
// Implement caching for frequently accessed data
const cache = new Map();

const getCachedData = async (key, fetchFunction) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFunction();
  cache.set(key, data);
  
  // Set TTL
  setTimeout(() => cache.delete(key), 300000); // 5 minutes
  
  return data;
};
```

This comprehensive usage guide covers all aspects of the LightDom Framework, from basic setup to advanced deployment and monitoring scenarios.
