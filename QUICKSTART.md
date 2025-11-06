# LightDOM SEO AI - Quick Start Guide

Get your LightDOM SEO AI system up and running in 5 minutes!

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and npm
- **PostgreSQL** v14+
- **Python** 3.9+
- **Git**

## 📦 Installation

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom

# Install Node.js dependencies
npm install

# Install Python ML dependencies
cd src/seo/ml
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../../..
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

**Minimum required configuration:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom_blockchain
DB_USER=postgres
DB_PASSWORD=your_password

# Stripe (for testing, use test keys)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Google APIs (optional for full features)
GOOGLE_PAGESPEED_API_KEY=your_key
```

### Step 3: Initialize Database

```bash
# Run database initialization
./scripts/init-database.sh
```

This script will:
- ✓ Create the database
- ✓ Create all tables and schemas
- ✓ Set up indexes and triggers
- ✓ Create application user
- ✓ Seed initial data

### Step 4: Start the Server

```bash
# Start development server
npm run dev
```

The API will be available at http://localhost:3001

## ✅ Verify Installation

Run the comprehensive test suite:

```bash
./scripts/test-system.sh
```

This will test:
- ✓ Data collection system
- ✓ AI training pipeline
- ✓ SEO injection system
- ✓ Database connectivity
- ✓ API endpoints

## 📊 Monitor System Status

Check the health of your system:

```bash
./scripts/system-status.sh
```

This shows:
- Service health (API, Database, Redis)
- Database statistics
- ML models
- System resources
- Recent errors

## 🧪 Test Individual Components

### Test Data Collection

```bash
./scripts/test-data-collection.sh
```

### Test AI Training

```bash
./scripts/test-ai-training.sh
```

### Test SEO Injection

```bash
./scripts/test-seo-injection.sh
```

## 🎯 Quick Usage Examples

### 1. Contribute Training Data

```bash
curl -X POST http://localhost:3001/api/seo/training/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "keyword": "test keyword",
    "contributorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### 2. Get Training Statistics

```bash
curl http://localhost:3001/api/seo/training/stats
```

### 3. Train a Model

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

### 4. Use SEO Injector Plugin

Add to your HTML `<head>`:

```html
<script
  src="http://localhost:3001/seo-injector.js"
  data-api-key="your_api_key"
  data-auto="true"
  data-debug="true">
</script>
```

## 📝 Common Tasks

### View Logs

```bash
# Tail all logs
tail -f logs/*.log

# View specific log
tail -f logs/app.log
```

### Backup Database

```bash
pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U $DB_USER $DB_NAME < backup_20250125.sql
```

### Reset Database

```bash
# WARNING: This will delete all data!
psql -U postgres -c "DROP DATABASE $DB_NAME"
./scripts/init-database.sh
```

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### API Server Not Starting

```bash
# Check for port conflicts
lsof -i :3001

# Check Node.js version
node --version  # Should be v18+
```

### Python ML Issues

```bash
# Reinstall Python dependencies
cd src/seo/ml
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### Missing Environment Variables

```bash
# Check required variables
grep -E "^(DATABASE_URL|STRIPE_SECRET_KEY)" .env

# Compare with example
diff .env .env.example
```

## 📚 Next Steps

1. **Configure External APIs**
   - Set up Google Search Console OAuth
   - Get PageSpeed Insights API key
   - Configure Stripe webhooks

2. **Collect Training Data**
   - Start crawling websites
   - Contribute SEO data
   - Monitor data quality

3. **Train Models**
   - Wait for sufficient data (min 100 records)
   - Train initial model
   - Evaluate performance

4. **Deploy SEO Injector**
   - Add plugin to client websites
   - Monitor optimizations
   - Track usage and billing

5. **Production Deployment**
   - Review [DEPLOYMENT.md](DEPLOYMENT.md)
   - Configure production environment
   - Set up monitoring and alerts
   - Deploy to production server

## 🆘 Getting Help

- **Documentation:** Full guide in [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Issues:** https://github.com/DashZeroAlionSystems/LightDom/issues
- **Discord:** https://discord.gg/lightdom
- **Email:** support@lightdom.ai

## 🎉 You're All Set!

Your LightDOM SEO AI system is now ready to use!

Run the status dashboard to see your system health:

```bash
./scripts/system-status.sh
```

Happy optimizing! 🚀
