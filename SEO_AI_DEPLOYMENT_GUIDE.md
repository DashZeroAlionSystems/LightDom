# SEO AI Model - Production Deployment Guide

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- PostgreSQL 14+ running
- Git installed

### Step 1: Install Python Dependencies

```bash
cd /home/user/LightDom/src/seo/ml
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

```bash
cd /home/user/LightDom
cp .env.example .env
```

Edit `.env` and configure at minimum:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lightdom_blockchain

# Google APIs (Free Tier - Start Here)
GOOGLE_PAGESPEED_API_KEY=your-api-key-from-google-cloud-console
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=your-oauth-client-id
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=your-oauth-client-secret

# SEO Settings
SEO_DATA_COLLECTION_TIER=mvp  # Start with free tier
```

### Step 3: Initialize Database

```bash
# Run database migrations
psql -U postgres -d lightdom_blockchain -f src/seo/database/seo-features-schema.sql
psql -U postgres -d lightdom_blockchain -f src/seo/database/training-data-migrations.sql
```

### Step 4: Test ML Model Training

```bash
cd src/seo/ml
python train_seo_model.py --test
```

Expected output:
```
✓ Training dataset loaded: 1,000 samples
✓ Features engineered: 194 features
✓ Model trained: NDCG@10 = 0.75+
✓ Model saved: ./models/seo-ranking-model.pkl
```

### Step 5: Start API Server

```bash
cd /home/user/LightDom
npm install
npm run dev
```

Test API:
```bash
curl -X POST http://localhost:3001/api/seo/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "keyword": "test keyword", "depth": "basic"}'
```

---

## 📊 API Configuration Tiers

### MVP Tier (FREE - 20 Features)
**Cost**: $0/month
**APIs Required**:
- ✅ Google PageSpeed Insights (25,000 free queries/day)
- ✅ Google Search Console (50,000 free queries/day)

**Setup Time**: 15 minutes

**How to Get API Keys**:
1. **Google PageSpeed API**:
   - Go to https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com
   - Enable API
   - Create credentials → API Key
   - Copy key to `.env`: `GOOGLE_PAGESPEED_API_KEY=...`

2. **Google Search Console**:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Set redirect URI: `http://localhost:3001/auth/google/callback`
   - Copy Client ID and Secret to `.env`

**Features Collected**: 20 core features
- Title, meta description, URL structure
- H1-H6 headings
- Core Web Vitals (LCP, INP, CLS)
- Basic content metrics
- Search Console data (clicks, impressions, CTR, position)

---

### Phase 1 Tier ($99/month - 50 Features)
**Cost**: $99/month
**APIs Required**:
- ✅ All MVP APIs
- ✅ Moz API ($99/month)

**Additional Features**: 30 features
- Domain Authority (DA)
- Page Authority (PA)
- Spam Score
- Root domains linking
- Total backlinks

**Setup**:
1. Sign up at https://moz.com/products/api
2. Get Access ID and Secret Key
3. Add to `.env`:
   ```
   MOZ_ACCESS_ID=mozscape-xxxxxxxxx
   MOZ_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Phase 2 Tier ($799/month - 100 Features)
**Cost**: $799/month ($99 Moz + $500 SEMrush + $200 Ahrefs)
**APIs Required**:
- ✅ All Phase 1 APIs
- ✅ SEMrush API ($499.95/month Business plan + API units)
- ✅ Ahrefs API ($199/month Lite plan + API access)

**Additional Features**: 50 features
- Complete backlink analysis (77 Ahrefs fields)
- Keyword rankings and difficulty
- Competitor analysis
- Organic traffic estimates
- Anchor text distribution

**Setup**:
1. **Ahrefs**: https://ahrefs.com/api
   ```
   AHREFS_API_KEY=your-api-key
   ```

2. **SEMrush**: https://www.semrush.com/api-documentation/
   ```
   SEMRUSH_API_KEY=your-api-key
   ```

---

### Phase 3 Tier ($2,499/month - 194 Features)
**Cost**: $2,499/month (Phase 2 + $200 Majestic + $1,500 advanced services)
**APIs Required**:
- ✅ All Phase 2 APIs
- ✅ Majestic API
- ✅ Social Signal APIs
- ✅ Advanced semantic analysis

**Additional Features**: 94 features
- Trust Flow / Citation Flow
- Social signals (shares, likes, comments)
- Entity recognition and semantic analysis
- Advanced interaction features
- Complete temporal trending

---

## 🧪 Testing the System

### 1. Test Data Collection

```bash
# Test MVP tier (free)
curl -X POST http://localhost:3001/api/seo/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "keyword": "example keyword",
    "depth": "basic"
  }'
```

Expected response:
```json
{
  "url": "https://example.com",
  "features": {
    "title_tag": "Example Domain",
    "lcp_score": 1.2,
    "inp_score": 150,
    "cls_score": 0.05,
    "clicks_7d": 125,
    "impressions_7d": 3500,
    "ctr": 3.57,
    "avg_position": 8.2
  },
  "quality_score": 75,
  "timestamp": "2025-10-22T10:30:00Z"
}
```

### 2. Test Model Training

```python
# src/seo/ml/test_training.py
from RankingPredictor import SEORankingPredictor
from FeatureEngineering import SEOFeatureEngineer
import pandas as pd

# Load sample data
df = pd.read_json('sample_training_data.json')

# Engineer features
engineer = SEOFeatureEngineer()
features = engineer.engineer_features(df)

# Train model
predictor = SEORankingPredictor(model_type='xgboost')
metrics = predictor.train(
    X=features.drop('position', axis=1),
    y=features['position'],
    query_ids=features['keyword_id']
)

print(f"NDCG@10: {metrics['ndcg@10']:.4f}")
print(f"MAP: {metrics['map']:.4f}")
```

### 3. Test Predictions

```bash
curl -X POST http://localhost:3001/api/seo/predict-ranking \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page",
    "keyword": "target keyword",
    "current_position": 12
  }'
```

Expected response:
```json
{
  "current_position": 12,
  "predicted_position": 6.8,
  "confidence_score": 0.87,
  "ranking_score": 0.65,
  "improvement_opportunities": [
    {
      "feature": "content_length",
      "current": 850,
      "recommended": 2500,
      "impact": "high"
    },
    {
      "feature": "backlinks_total",
      "current": 15,
      "recommended": 50,
      "impact": "high"
    }
  ]
}
```

---

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured in `.env`
- [ ] Database migrations applied successfully
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Node.js dependencies installed (`npm install`)
- [ ] API keys validated (test each tier)
- [ ] Initial model trained with >1,000 samples
- [ ] Model achieves NDCG@10 > 0.7

### Security
- [ ] Change all default passwords and keys
- [ ] Enable HTTPS/SSL in production
- [ ] Configure CORS_ORIGIN to production domain
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting (configured in .env)
- [ ] Secure database with firewall rules
- [ ] Use environment-specific API keys (not dev keys)

### Performance
- [ ] Redis cache configured and running
- [ ] Database indices created (auto-created by migrations)
- [ ] Model predictions cached (5-minute TTL)
- [ ] API response times < 200ms (95th percentile)
- [ ] Batch processing for large datasets

### Monitoring
- [ ] MLflow tracking server running (`mlflow server --host 0.0.0.0 --port 5000`)
- [ ] Database monitoring enabled
- [ ] API error logging configured
- [ ] Performance metrics tracked (Prometheus/Grafana)
- [ ] Alert rules configured for failures

### Deployment Options

#### Option 1: Docker (Recommended)
```bash
# Build Docker image
docker build -t lightdom-seo-ai .

# Run container
docker run -d \
  --name lightdom-seo \
  -p 3001:3001 \
  --env-file .env \
  lightdom-seo-ai
```

#### Option 2: PM2 (Node.js Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start API server
pm2 start npm --name "lightdom-api" -- run start

# Start Python ML service (if separate)
pm2 start "python src/seo/ml/serve_model.py" --name "seo-ml-service"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option 3: Kubernetes
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lightdom-seo-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lightdom-seo
  template:
    metadata:
      labels:
        app: lightdom-seo
    spec:
      containers:
      - name: api
        image: lightdom-seo-ai:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: seo-config
        - secretRef:
            name: seo-secrets
```

---

## 🔧 Troubleshooting

### Issue: "Module 'xgboost' not found"
**Solution**: Install Python dependencies
```bash
cd src/seo/ml
pip install -r requirements.txt
```

### Issue: "Database connection failed"
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d lightdom_blockchain -c "SELECT 1;"
```

### Issue: "Google API quota exceeded"
**Solution**:
- PageSpeed Insights: 25,000 queries/day limit
- Use caching to reduce API calls
- Implement request throttling

### Issue: "Model NDCG score < 0.7"
**Solution**:
1. Collect more training data (target: 10,000+ samples)
2. Verify data quality (quality_score >= 70)
3. Check feature engineering (should have 150+ features)
4. Tune hyperparameters (learning_rate, max_depth)

### Issue: "Commercial API authentication failed"
**Solution**:
1. Verify API keys are correct in `.env`
2. Check API subscription is active
3. Verify rate limits not exceeded
4. Test API with curl:
   ```bash
   # Test Ahrefs API
   curl "https://apiv2.ahrefs.com/v3/site-explorer/metrics?target=example.com" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

---

## 📈 Performance Benchmarks

### Expected Performance (Production)

| Metric | Target | Actual |
|--------|--------|--------|
| API Response Time (p95) | < 200ms | TBD |
| Model NDCG@10 | > 0.75 | TBD |
| Predictions/second | > 100 | TBD |
| Database Queries (p95) | < 50ms | TBD |
| Cache Hit Rate | > 80% | TBD |
| Model Training Time | < 10 min | TBD |

### Scaling Guidelines

| Dataset Size | Infrastructure | Estimated Cost |
|--------------|----------------|----------------|
| < 10K pages | Single server (4 CPU, 16GB RAM) | $50-100/month |
| 10K-100K pages | 2 servers + Redis cache | $200-400/month |
| 100K-1M pages | Kubernetes cluster (3 nodes) | $800-1,500/month |
| > 1M pages | Enterprise cluster + load balancer | $2,000+/month |

---

## 🎓 Next Steps

### Week 1-2: MVP Launch
1. Configure Google APIs (free tier)
2. Collect initial 1,000 training samples
3. Train baseline model (XGBoost)
4. Deploy to staging environment

### Week 3-4: Phase 1 Enhancement
1. Add Moz API integration
2. Expand to 50 features
3. Retrain model with enhanced features
4. A/B test against baseline

### Week 5-8: Phase 2 Rollout
1. Integrate Ahrefs + SEMrush APIs
2. Implement full 100-feature pipeline
3. Optimize model hyperparameters
4. Deploy to production with monitoring

### Month 3+: Advanced Features
1. Add BERT-based semantic analysis
2. Implement real-time retraining pipeline
3. Build competitive intelligence dashboard
4. Integrate blockchain model marketplace

---

## 📚 Additional Resources

### Documentation
- [LambdaMART Paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/LambdaMART_Final.pdf)
- [XGBoost Ranking Tutorial](https://xgboost.readthedocs.io/en/stable/tutorials/learning_to_rank.html)
- [Google Search Console API Docs](https://developers.google.com/webmaster-tools/search-console-api-original)
- [Core Web Vitals Guide](https://web.dev/vitals/)

### Code References
- ML Models: `/home/user/LightDom/src/seo/ml/RankingPredictor.py`
- Feature Engineering: `/home/user/LightDom/src/seo/ml/FeatureEngineering.py`
- API Endpoints: `/home/user/LightDom/src/api/seo-*.ts`
- Database Schema: `/home/user/LightDom/src/seo/database/`

### Community Support
- GitHub Issues: https://github.com/DashZeroAlionSystems/LightDom/issues
- SEO AI Discussions: Create discussion in repo

---

## ✅ Deployment Complete!

Once you've completed this guide, your SEO AI system will be:
- ✅ Collecting data from multiple sources
- ✅ Engineering 194 features automatically
- ✅ Training models with LambdaMART
- ✅ Serving predictions via REST API
- ✅ Tracking experiments with MLflow
- ✅ Scaling to production workloads

**Estimated Total Setup Time**: 6-8 hours for full deployment
**Estimated Monthly Cost**: $55-120 (MVP tier) to $2,500+ (Phase 3 tier)
