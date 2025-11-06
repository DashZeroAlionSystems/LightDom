# LightDOM SEO AI System - Deployment Guide

Complete guide for deploying the LightDOM SEO AI Training and Injection System.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v18+ and npm v9+
- **PostgreSQL** v14+
- **Python** 3.9+ with pip
- **Redis** v6+ (optional, for caching)
- **Git**

### Required Accounts

1. **Stripe Account** (for payments)
   - Sign up at https://stripe.com
   - Get API keys from Dashboard → Developers → API keys

2. **Google Cloud Console** (for SEO data)
   - Create project at https://console.cloud.google.com
   - Enable APIs: Search Console API, PageSpeed Insights API
   - Create OAuth2 credentials

3. **Blockchain Provider** (for mining rewards)
   - Infura account: https://infura.io
   - Or Alchemy: https://alchemy.com

### Optional Services

- **Ahrefs API** (for advanced backlink data)
- **Semrush API** (for competitive analysis)
- **Sentry** (for error tracking)

---

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom

# Install Node.js dependencies
npm install

# Install Python dependencies for ML
cd src/seo/ml
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../../..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Required variables to set:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `GOOGLE_PAGESPEED_API_KEY` - Your PageSpeed API key
- `BLOCKCHAIN_PROVIDER_URL` - Your Infura/Alchemy URL

### 3. Initialize Database

```bash
# Make script executable
chmod +x scripts/init-database.sh

# Run initialization
./scripts/init-database.sh
```

This will:
- Create the database
- Create all schemas and tables
- Set up indexes and triggers
- Create application user
- Seed initial data

### 4. Start Development Server

```bash
# Start the API server
npm run dev

# In another terminal, start the frontend (if applicable)
cd frontend
npm run dev
```

### 5. Verify Installation

```bash
# Run system tests
./scripts/test-system.sh

# Check health endpoint
curl http://localhost:3001/health
```

---

## Detailed Setup

### Database Setup

#### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

#### Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE lightdom_blockchain;
CREATE USER lightdom_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lightdom_blockchain TO lightdom_app;
\q
```

#### Run Migrations

```bash
# Run the initialization script
./scripts/init-database.sh

# Or manually run SQL files
psql -U lightdom_app -d lightdom_blockchain -f src/seo/database/seo-features-schema.sql
psql -U lightdom_app -d lightdom_blockchain -f src/seo/database/training-data-migrations.sql
```

### Stripe Configuration

#### 1. Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your Secret key (starts with `sk_test_`)
3. Copy your Publishable key (starts with `pk_test_`)

#### 2. Create Products and Prices

```bash
# Using Stripe CLI
stripe products create \
  --name "LightDOM Starter" \
  --description "1,000 optimizations per month"

stripe prices create \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --product prod_XXXXX
```

Or create via Dashboard → Products

#### 3. Set Up Webhooks

```bash
# For development, use Stripe CLI
stripe listen --forward-to localhost:3001/api/billing/webhooks

# For production, configure at:
# Dashboard → Developers → Webhooks → Add endpoint
# URL: https://your-domain.com/api/billing/webhooks
# Events: customer.subscription.created, customer.subscription.updated,
#         customer.subscription.deleted, invoice.paid, invoice.payment_failed
```

### Google APIs Setup

#### 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create new project: "LightDOM SEO"
3. Enable APIs:
   - Google Search Console API
   - PageSpeed Insights API

#### 2. Create OAuth2 Credentials

1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
5. Download credentials JSON

#### 3. Get PageSpeed API Key

1. Go to APIs & Services → Credentials
2. Create API key
3. Restrict key to PageSpeed Insights API

#### 4. Authorize Search Console

```bash
# Run authorization flow (first time only)
npm run auth:google

# This will open browser for Google OAuth
# Grant access to Search Console
# Refresh token will be saved to .env
```

### Python ML Environment

#### 1. Create Virtual Environment

```bash
cd src/seo/ml
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**requirements.txt includes:**
- scikit-learn
- xgboost
- lightgbm
- pandas
- numpy
- joblib

#### 3. Test ML Setup

```bash
python validate_setup.py
```

### Blockchain Configuration

#### 1. Get Provider URL

**Infura:**
1. Sign up at https://infura.io
2. Create new project
3. Copy Polygon Mainnet URL

**Alchemy:**
1. Sign up at https://alchemy.com
2. Create app (Polygon network)
3. Copy HTTPS URL

#### 2. Deploy Smart Contracts

```bash
# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile contracts
npx hardhat compile

# Deploy to testnet (Mumbai)
npx hardhat run scripts/deploy.js --network mumbai

# Deploy to mainnet (use with caution!)
npx hardhat run scripts/deploy.js --network polygon
```

#### 3. Update Contract Addresses

After deployment, update `.env`:
```
SEO_MINING_CONTRACT_ADDRESS=0x...
LIGHTDOM_TOKEN_ADDRESS=0x...
```

---

## Configuration

### Environment Variables Reference

See `.env.example` for complete list. Key variables:

#### Database
```env
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
```

#### Stripe
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Google APIs
```env
GOOGLE_PAGESPEED_API_KEY=AIza...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

#### Blockchain
```env
BLOCKCHAIN_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/...
SEO_MINING_CONTRACT_ADDRESS=0x...
```

#### ML Configuration
```env
SEO_MODEL_TYPE=xgboost
SEO_MODEL_LEARNING_RATE=0.05
SEO_MODEL_N_ESTIMATORS=400
```

### Subscription Plans

Configure in Stripe Dashboard or via API:

| Plan | Price | Optimizations | API Calls | Domains |
|------|-------|---------------|-----------|---------|
| Starter | $29/mo | 1,000 | 10,000 | 3 |
| Pro | $99/mo | 10,000 | 100,000 | 10 |
| Enterprise | $499/mo | Unlimited | Unlimited | Unlimited |

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- src/seo/services/SEODataCollector.test.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test data collection
./scripts/test-data-collection.sh

# Test AI training
./scripts/test-ai-training.sh

# Test SEO injection
./scripts/test-seo-injection.sh

# Test full system
./scripts/test-system.sh
```

### Manual Testing

#### 1. Test Data Contribution

```bash
curl -X POST http://localhost:3001/api/seo/training/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "keyword": "test keyword",
    "contributorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

#### 2. Test Model Training

```bash
curl -X POST http://localhost:3001/api/seo/models/train \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "test-model",
    "modelVersion": "v1.0",
    "algorithm": "gradient_boosting",
    "hyperparameters": {
      "learningRate": 0.1,
      "nEstimators": 100
    }
  }'
```

#### 3. Test SEO Injection

```html
<!-- Add to your test HTML page -->
<script
  src="http://localhost:3001/seo-injector.js"
  data-api-key="test_api_key"
  data-auto="true"
  data-debug="true">
</script>
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Stripe webhook configured
- [ ] Monitoring set up
- [ ] Backups configured

### Deployment Options

#### Option 1: Traditional Server (VPS)

```bash
# On your server
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Option 2: Docker

```bash
# Build image
docker build -t lightdom-api .

# Run container
docker run -d \
  --name lightdom-api \
  -p 3001:3001 \
  --env-file .env \
  lightdom-api

# Or use docker-compose
docker-compose up -d
```

#### Option 3: Cloud Platforms

**Heroku:**
```bash
heroku create lightdom-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set STRIPE_SECRET_KEY=...
git push heroku main
```

**AWS/GCP/Azure:**
- Use platform-specific deployment guides
- Configure load balancer
- Set up auto-scaling
- Enable monitoring

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.lightdom.ai;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.lightdom.ai

# Auto-renewal is configured automatically
```

---

## Monitoring

### Health Checks

```bash
# API health
curl https://api.lightdom.ai/health

# Database health
curl https://api.lightdom.ai/health/db

# Crawler status
curl https://api.lightdom.ai/health/crawler
```

### Logging

Logs are written to:
- `./logs/app.log` - Application logs
- `./logs/error.log` - Error logs
- `./logs/crawler.log` - Crawler logs

View logs:
```bash
# Tail all logs
tail -f logs/*.log

# View PM2 logs
pm2 logs lightdom-api

# View Docker logs
docker logs -f lightdom-api
```

### Metrics

Monitor key metrics:
- API response times
- Database query performance
- Crawler throughput
- ML training success rate
- Subscription conversion rate

Use tools:
- Prometheus + Grafana
- Datadog
- New Relic
- CloudWatch (AWS)

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Check firewall rules

#### Stripe Webhook Signature Mismatch
```
Error: Webhook signature verification failed
```
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Use Stripe CLI for local testing
- Check webhook endpoint URL

#### ML Training Fails
```
Error: No module named 'xgboost'
```
**Solution:**
```bash
source src/seo/ml/venv/bin/activate
pip install -r src/seo/ml/requirements.txt
```

#### Crawler Timeout
```
Error: Navigation timeout of 30000 ms exceeded
```
**Solution:**
- Increase `CRAWLER_TIMEOUT` in `.env`
- Check target site availability
- Reduce `CRAWLER_MAX_CONCURRENCY`

### Getting Help

- **Documentation:** https://docs.lightdom.ai
- **GitHub Issues:** https://github.com/DashZeroAlionSystems/LightDom/issues
- **Discord:** https://discord.gg/lightdom
- **Email:** support@lightdom.ai

---

## Next Steps

After successful deployment:

1. **Monitor Performance** - Set up alerts for critical metrics
2. **Collect Training Data** - Start crawling and collecting SEO data
3. **Train Initial Model** - Train first ML model with collected data
4. **Deploy to Users** - Distribute SEO injector plugin
5. **Scale Infrastructure** - Add more crawler workers as needed
6. **Optimize Costs** - Monitor API usage and optimize

---

## Appendix

### Useful Commands

```bash
# Database backup
pg_dump -U lightdom_app lightdom_blockchain > backup.sql

# Database restore
psql -U lightdom_app lightdom_blockchain < backup.sql

# Clear Redis cache
redis-cli FLUSHALL

# Restart services
pm2 restart all

# View system status
./scripts/system-status.sh
```

### Security Best Practices

- [ ] Use strong passwords (minimum 32 characters)
- [ ] Enable SSL/TLS for all connections
- [ ] Rotate API keys regularly
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Enable rate limiting
- [ ] Use WAF (Web Application Firewall)
- [ ] Regular security audits

### Performance Optimization

- Enable Redis caching
- Use CDN for static assets
- Optimize database queries with indexes
- Scale horizontally with load balancer
- Use connection pooling
- Implement request queuing

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0
**Maintainer:** LightDOM Team
