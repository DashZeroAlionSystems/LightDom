# LightDom SEO Service - Deployment Guide

## Overview

This guide covers deploying the LightDom Automated SEO Service, including:
- Database setup
- Backend API deployment
- SDK build and CDN deployment
- ML model training initialization
- Monitoring and maintenance

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Docker (optional, for containerized deployment)
- AWS/GCP account (for CDN and model storage)
- SSL certificate for your domain

---

## Quick Start

### 1. Database Setup

Run the SEO service schema migrations:

```bash
# Connect to PostgreSQL
psql -U postgres -d lightdom

# Run schema
\i database/seo_service_schema.sql

# Verify tables created
\dt seo_*
```

Expected output:
```
 seo_clients
 seo_analytics
 seo_optimization_configs
 seo_training_data
 seo_models
 seo_alerts
 seo_keyword_rankings
 seo_ab_tests
 seo_recommendations
 seo_competitors
 seo_subscription_plans
```

### 2. Environment Configuration

Create or update `.env` file:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=production

# SEO Service
SEO_SERVICE_ENABLED=true
SEO_CDN_URL=https://cdn.lightdom.io
SEO_API_URL=https://api.lightdom.io

# ML Models
ML_MODEL_STORAGE=s3://your-bucket/seo-models
ML_TRAINING_ENABLED=true
ML_TRAINING_SCHEDULE=0 2 * * * # Daily at 2 AM

# Blockchain (optional)
BLOCKCHAIN_ENABLED=true
RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key
SEO_CONTRACT_ADDRESS=0x...

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_ENABLED=true
```

### 3. Install Dependencies

```bash
# Install main dependencies
npm install

# Install SDK dependencies
cd src/sdk
npm install
cd ../..

# Install ML dependencies
npm install @tensorflow/tfjs-node
```

### 4. Build SDK

```bash
# Development build
cd src/sdk
npm run build

# Production build (minified)
npm run build:prod

# Output files will be in dist/sdk/
# - lightdom-seo.js (development)
# - lightdom-seo.min.js (production)
# - lightdom-seo.esm.js (ES module)
```

### 5. Start the API Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Verify SEO service is running
curl http://localhost:3001/api/v1/seo/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "SEO Injection API",
#   "timestamp": "2024-..."
# }
```

### 6. Deploy SDK to CDN

#### Option A: AWS CloudFront + S3

```bash
# Build production SDK
cd src/sdk && npm run build:prod && cd ../..

# Upload to S3
aws s3 cp dist/sdk/lightdom-seo.min.js \
  s3://your-cdn-bucket/seo/v1/lightdom-seo.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=3600" \
  --acl public-read

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/seo/v1/*"
```

#### Option B: CloudFlare Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy SDK
wrangler publish dist/sdk/lightdom-seo.min.js \
  --name lightdom-seo \
  --compatibility-date 2024-01-01
```

### 7. Initialize First Client

```bash
# Create a test client
curl -X POST http://localhost:3001/api/v1/seo/clients \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "domain": "example.com",
    "subscriptionTier": "starter",
    "config": {
      "organizationName": "Example Corp",
      "siteName": "Example Site",
      "logo": "https://example.com/logo.png"
    }
  }'

# Response will include API key:
# {
#   "success": true,
#   "client": {
#     "id": "...",
#     "domain": "example.com",
#     "apiKey": "ld_live_abc123...",
#     "subscriptionTier": "starter"
#   }
# }
```

---

## Advanced Deployment

### Docker Deployment

Create `docker-compose.seo.yml`:

```yaml
version: '3.8'

services:
  seo-api:
    build:
      context: .
      dockerfile: Dockerfile.seo
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=lightdom
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  ml-trainer:
    build:
      context: .
      dockerfile: Dockerfile.ml
    environment:
      - DB_HOST=postgres
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    command: node src/services/api/ml-training-scheduler.js

volumes:
  postgres_data:
  redis_data:
```

Deploy:

```bash
docker-compose -f docker-compose.seo.yml up -d
```

### Kubernetes Deployment

Create `k8s/seo-service.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seo-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seo-api
  template:
    metadata:
      labels:
        app: seo-api
    spec:
      containers:
      - name: seo-api
        image: lightdom/seo-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: seo-api-service
spec:
  selector:
    app: seo-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s/seo-service.yaml
```

---

## ML Model Training

### Initial Training

```bash
# Run initial training
node scripts/train-initial-models.js

# This will:
# 1. Collect training data from seo_training_data table
# 2. Train ranking prediction model
# 3. Train schema optimization model
# 4. Train meta tag optimizer
# 5. Save models to ML_MODEL_STORAGE
# 6. Deploy models to production
```

### Scheduled Training

Set up cron job or use scheduler:

```bash
# Add to crontab
crontab -e

# Add this line for daily training at 2 AM:
0 2 * * * cd /path/to/LightDom && node scripts/train-models.js >> logs/training.log 2>&1
```

Or use Node.js scheduler:

```javascript
// scripts/ml-training-scheduler.js
import cron from 'node-cron';
import { SEOTrainingPipelineService } from '../src/services/api/SEOTrainingPipelineService.js';

const trainingService = new SEOTrainingPipelineService(pgPool);

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled model training...');
  try {
    const modelId = await trainingService.trainRankingPredictionModel();
    console.log(`Training completed. Model ID: ${modelId}`);

    // Deploy if accuracy improved
    // Add your deployment logic here
  } catch (error) {
    console.error('Training failed:', error);
  }
});
```

---

## Monitoring

### Prometheus Metrics

Expose metrics endpoint:

```javascript
// In api-server-express.js
app.get('/metrics', async (req, res) => {
  const metrics = {
    seo_api_calls_total: await getAPICallsCount(),
    seo_active_clients: await getActiveClientsCount(),
    seo_avg_score: await getAverageSEOScore(),
    seo_model_accuracy: await getModelAccuracy()
  };

  res.set('Content-Type', 'text/plain');
  res.send(formatPrometheusMetrics(metrics));
});
```

### Grafana Dashboard

Import dashboard JSON from `monitoring/grafana-seo-dashboard.json`:

- SEO Score trends
- Core Web Vitals distribution
- API usage by tier
- Model training metrics
- Revenue metrics (MRR, churn)

### Alerts

Configure alerts for:

```yaml
# Alertmanager config
groups:
- name: seo_service
  interval: 5m
  rules:
  - alert: HighErrorRate
    expr: rate(seo_api_errors[5m]) > 0.05
    annotations:
      summary: "High error rate in SEO API"

  - alert: ModelAccuracyDrop
    expr: seo_model_accuracy < 0.7
    annotations:
      summary: "ML model accuracy below threshold"

  - alert: HighLatency
    expr: seo_api_latency_p95 > 500
    annotations:
      summary: "API latency above 500ms"
```

---

## Database Maintenance

### Daily Tasks

```bash
# Reset API call counters (run daily)
psql -U postgres -d lightdom -c "SELECT reset_daily_api_calls();"

# Vacuum analytics table
psql -U postgres -d lightdom -c "VACUUM ANALYZE seo_analytics;"
```

### Weekly Tasks

```bash
# Archive old analytics data (>90 days)
psql -U postgres -d lightdom -c "
  DELETE FROM seo_analytics
  WHERE timestamp < NOW() - INTERVAL '90 days';
"

# Update materialized views if using them
psql -U postgres -d lightdom -c "
  REFRESH MATERIALIZED VIEW seo_daily_metrics;
"
```

### Monthly Tasks

```bash
# Generate monthly reports for all clients
node scripts/generate-monthly-reports.js

# Clean up old training data
psql -U postgres -d lightdom -c "
  DELETE FROM seo_training_data
  WHERE created_at < NOW() - INTERVAL '180 days'
  AND verified = false;
"
```

---

## Security

### API Key Management

```bash
# Rotate API keys periodically
node scripts/rotate-api-keys.js --client-id=<client_id>

# Revoke compromised keys immediately
psql -U postgres -d lightdom -c "
  UPDATE seo_clients
  SET status = 'suspended', api_key = NULL
  WHERE api_key = '<compromised_key>';
"
```

### Rate Limiting

Configure rate limits per tier in `api-server-express.js`:

```javascript
const rateLimiters = {
  starter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 min
  }),
  professional: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
  }),
  business: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000
  })
};
```

### Data Privacy

Ensure GDPR compliance:

```sql
-- Anonymize user data on request
UPDATE seo_analytics
SET user_agent = 'anonymized',
    referrer = 'anonymized'
WHERE client_id = '<client_id>';

-- Delete all data for a client
DELETE FROM seo_clients WHERE id = '<client_id>';
-- This will cascade delete all related data
```

---

## Troubleshooting

### SDK Not Loading

**Check**:
1. CDN URL is correct and accessible
2. CORS headers are set correctly
3. SSL certificate is valid
4. API endpoint is reachable

```bash
# Test CDN
curl -I https://cdn.lightdom.io/seo/v1/lightdom-seo.js

# Test API
curl https://api.lightdom.io/api/v1/seo/health
```

### Database Connection Issues

```bash
# Test connection
psql -U postgres -d lightdom -c "SELECT 1;"

# Check pool status
node scripts/check-db-pool.js

# Increase pool size if needed
# In .env: DB_POOL_MAX=50
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli ping

# Check Redis memory
redis-cli INFO memory

# Clear cache if needed
redis-cli FLUSHDB
```

### ML Training Failures

```bash
# Check training logs
tail -f logs/training.log

# Test with small dataset
node scripts/train-models.js --samples=100 --dry-run

# Check GPU/CPU resources
nvidia-smi  # If using GPU
htop        # Check CPU/memory
```

---

## Performance Optimization

### Database Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_seo_analytics_client_timestamp
ON seo_analytics(client_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_seo_analytics_url_hash
ON seo_analytics(MD5(url));
```

### Redis Caching

```javascript
// Cache configuration responses for 5 minutes
const cacheKey = `seo:config:${apiKey}:${pathname}`;
await redis.setEx(cacheKey, 300, JSON.stringify(config));
```

### CDN Optimization

- Enable gzip/brotli compression
- Set long cache times (max-age=3600)
- Use versioned URLs for cache busting
- Enable HTTP/2 or HTTP/3

---

## Backup and Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -U postgres lightdom | gzip > backups/lightdom_${DATE}.sql.gz

# Keep last 30 days
find backups/ -name "lightdom_*.sql.gz" -mtime +30 -delete
```

### Model Backups

```bash
# Backup models to S3
aws s3 sync /tmp/seo_models/ s3://your-bucket/seo-models-backup/
```

### Recovery

```bash
# Restore database
gunzip -c backups/lightdom_20240101.sql.gz | psql -U postgres lightdom

# Restore models
aws s3 sync s3://your-bucket/seo-models-backup/ /tmp/seo_models/
```

---

## Scaling

### Horizontal Scaling

- Deploy multiple API instances behind load balancer
- Use session-less authentication (JWT tokens)
- Share Redis cache across instances
- Use read replicas for database queries

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database with more indexes
- Use connection pooling
- Enable query caching

### Auto-scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: seo-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: seo-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Support

For issues or questions:

- **Documentation**: https://docs.lightdom.io/seo
- **GitHub Issues**: https://github.com/DashZeroAlionSystems/LightDom/issues
- **Email**: support@lightdom.io
- **Slack**: https://lightdom.slack.com

---

## Next Steps

1. Complete database setup
2. Deploy API server
3. Build and deploy SDK to CDN
4. Create first test client
5. Install SDK on test website
6. Monitor analytics dashboard
7. Run initial ML training
8. Set up monitoring and alerts
9. Configure automated backups
10. Launch to production!

Good luck with your SEO service deployment! 🚀
