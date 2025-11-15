# AI Research Pipeline - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Initialize Database

```bash
# Connect to your LightDom database
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql
```

This creates:
- 11 tables for research data
- Indexes for optimal performance
- Seed data for topics and sources

### Step 2: Start the Service

```bash
# Default configuration (runs every 6 hours)
npm run research:start

# Or customize settings
node start-research-pipeline.js --interval 180 --topics ai,ml,llm
```

The service will:
- ✅ Initialize the research pipeline
- ✅ Create a default monitoring campaign
- ✅ Execute initial article scraping
- ✅ Schedule automatic runs
- ✅ Display real-time statistics

### Step 3: Explore the Data

```bash
# View pipeline status
npm run research:status

# See all scraped articles
npm run research:articles

# Check feature recommendations
npm run research:features

# View research papers
npm run research:papers
```

## 📊 Access the Dashboard

### Option 1: React Dashboard Component

Add to your React app:

```jsx
import AIResearchDashboard from './components/dashboards/AIResearchDashboard';

function App() {
  return (
    <div>
      <AIResearchDashboard />
    </div>
  );
}
```

### Option 2: API Endpoints

Visit in your browser:
- http://localhost:3001/api/research/dashboard
- http://localhost:3001/api/research/status

## 🎯 Run the Demo

See the complete system in action:

```bash
npm run research:demo
```

The demo will:
1. Scrape 25 articles from dev.to
2. Analyze articles for features
3. Extract code examples
4. Create a monitoring campaign
5. Generate a research paper
6. Show statistics and insights

## 📖 Common Operations

### Manually Trigger Scraping

```bash
curl -X POST http://localhost:3001/api/research/scrape \
  -H "Content-Type: application/json" \
  -d '{"topics": ["ai", "ml", "llm"], "limit": 50}'
```

### Create a Custom Campaign

```bash
curl -X POST http://localhost:3001/api/research/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Agent Monitoring",
    "topics": ["ai", "agents", "automation"],
    "schedule": "0 */6 * * *",
    "maxArticles": 100
  }'
```

### Generate a Research Paper

```bash
curl -X POST http://localhost:3001/api/research/papers/generate \
  -H "Content-Type: application/json" \
  -d '{"focusArea": "ai-ml-integration", "limit": 50}'
```

### Query Articles

```bash
# All articles
curl http://localhost:3001/api/research/articles

# Filter by topic
curl http://localhost:3001/api/research/articles?topic=ai&limit=20

# Filter by status
curl http://localhost:3001/api/research/articles?status=analyzed
```

### View Feature Recommendations

```bash
# All features
curl http://localhost:3001/api/research/features

# High revenue features
curl http://localhost:3001/api/research/features?revenue=high

# High impact features
curl http://localhost:3001/api/research/features?impact=high&status=proposed
```

## ⚙️ Configuration Options

### Command Line Options

```bash
node start-research-pipeline.js --help
```

Available options:
- `--interval <minutes>` - Campaign execution interval (default: 360)
- `--topics <topics>` - Comma-separated topics (default: ai,ml,llm,nlp,agents,seo,automation)
- `--articles <number>` - Articles per run (default: 100)
- `--no-headless` - Run browser in visible mode (for debugging)

### Environment Variables

```bash
# Database connection
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lightdom
export DB_USER=postgres
export DB_PASSWORD=postgres
```

## 🔍 Troubleshooting

### Database Schema Not Found

```bash
# Check if tables exist
psql -U postgres -d lightdom -c "\dt research_*"

# Re-run schema file if needed
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql
```

### Service Won't Start

```bash
# Check database connection
psql -U postgres -d lightdom -c "SELECT NOW();"

# Verify all dependencies are installed
npm install

# Check for syntax errors
node -c start-research-pipeline.js
```

### Rate Limiting Issues

The pipeline respects rate limits (default: 50 requests/hour). If you hit limits:

1. Wait for the rate limit window to reset
2. Adjust the rate limit in configuration
3. Spread scraping across longer intervals

### Browser Launch Issues

If Puppeteer fails to launch:

```bash
# Install required dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use system Chrome
export PUPPETEER_SKIP_DOWNLOAD=true
npm install puppeteer
```

## 📈 What Gets Collected

### Articles
- Title, URL, author
- Full content and excerpts
- Tags and topics
- Code examples
- Reading time and word count
- Relevance and priority scores

### Features
- Feature name and description
- Category (enhancement, new-feature, integration, optimization)
- Impact level (low, medium, high, critical)
- Effort estimate (small, medium, large, x-large)
- Revenue potential (none, low, medium, high)
- Implementation complexity (1-10 scale)

### SEO Insights
- Keyword patterns
- Content structure
- Meta tag strategies
- Link building approaches
- Effectiveness scores

### Research Papers
- Executive summaries
- Key findings
- Implementation recommendations
- Related articles and features
- Confidence scores

## 🎓 Next Steps

### 1. Review Generated Content

Check the database for collected articles:
```sql
SELECT title, url, tags, relevance_score 
FROM research_articles 
ORDER BY scraped_at DESC 
LIMIT 10;
```

### 2. Analyze Top Features

Find high-value opportunities:
```sql
SELECT feature_name, category, impact_level, revenue_potential
FROM feature_recommendations
WHERE revenue_potential = 'high' AND status = 'proposed'
ORDER BY implementation_complexity ASC
LIMIT 10;
```

### 3. Generate Reports

Create a research paper:
```bash
npm run research:papers
```

### 4. Implement Features

Use the collected insights to:
- Prioritize product roadmap
- Identify market opportunities
- Build competitive features
- Create service packages

## 💡 Tips for Success

1. **Start Small**: Begin with a 180-minute interval and 50 articles per run
2. **Monitor Trends**: Check the dashboard daily for trending topics
3. **Iterate Often**: Generate research papers weekly to track progress
4. **Focus on Revenue**: Prioritize features with high revenue potential
5. **Learn from Code**: Use extracted code examples as implementation guides

## 🔗 Resources

- **Full Documentation**: [AI_RESEARCH_PIPELINE_README.md](AI_RESEARCH_PIPELINE_README.md)
- **API Reference**: See all 20+ endpoints in the README
- **Demo Script**: `demo-ai-research-pipeline.js`
- **Service Code**: `services/ai-research-pipeline.js`
- **Database Schema**: `database/ai-research-pipeline-schema.sql`

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full documentation
3. Examine the demo script for examples
4. Check the database schema for data structure

## 🎉 Success Metrics

Track your progress:
- ✅ Articles scraped per day
- ✅ Features identified per week
- ✅ Research papers generated per month
- ✅ Revenue opportunities discovered
- ✅ Implementation roadmap clarity

**Happy Researching! 🚀**
