# AI Research Pipeline - Complete Usage Guide

## 🎯 Overview

The AI Research Pipeline is a production-ready system that automates the discovery, analysis, and monetization of AI/ML/LLM content. This guide will walk you through using all features of the system.

## ✅ System Validation

Before starting, validate that everything is properly installed:

```bash
npm run research:validate
```

This will check:
- ✅ All files are present
- ✅ Syntax is valid
- ✅ Database schema is complete
- ✅ API integration is working
- ✅ Documentation is comprehensive

## 🚀 Quick Start (3 Steps)

### Step 1: Initialize Database

```bash
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql
```

This creates 11 tables with indexes and seed data.

### Step 2: Start the Service

```bash
npm run research:start
```

The service will:
- Initialize the research pipeline
- Create a default monitoring campaign
- Execute initial article scraping
- Schedule automatic runs every 6 hours
- Display real-time statistics

### Step 3: Verify It's Working

```bash
npm run research:status
```

You should see JSON output with pipeline statistics.

## 📖 Available Commands

### Service Management

```bash
# Start automated service (runs every 6 hours)
npm run research:start

# With custom interval (every 3 hours)
node start-research-pipeline.js --interval 180

# With custom topics
node start-research-pipeline.js --topics ai,ml,llm,agents

# With custom article limit
node start-research-pipeline.js --articles 50

# Non-headless mode (for debugging)
node start-research-pipeline.js --no-headless
```

### Demonstrations

```bash
# Run full interactive demo
npm run research:demo

# Analyze specific target articles (from problem statement)
npm run research:analyze

# Validate system integrity
npm run research:validate
```

### API Queries

```bash
# Get pipeline status
npm run research:status

# View dashboard data
npm run research:dashboard

# List articles
npm run research:articles

# View features
npm run research:features

# List campaigns
npm run research:campaigns

# View research papers
npm run research:papers
```

## 🔧 Advanced Usage

### Manual Article Scraping

```bash
curl -X POST http://localhost:3001/api/research/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["ai", "ml", "llm", "nlp"],
    "limit": 50
  }'
```

### Create Custom Campaign

```bash
curl -X POST http://localhost:3001/api/research/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Agent Monitoring",
    "description": "Track AI agent developments",
    "topics": ["ai", "agents", "automation"],
    "schedule": "0 */6 * * *",
    "maxArticles": 100,
    "fullScrape": true,
    "extractFeatures": true
  }'
```

### Generate Research Paper

```bash
curl -X POST http://localhost:3001/api/research/papers/generate \
  -H "Content-Type: application/json" \
  -d '{
    "focusArea": "ai-ml-integration",
    "limit": 50
  }'
```

### Query Articles with Filters

```bash
# All articles
curl http://localhost:3001/api/research/articles

# Filter by topic
curl http://localhost:3001/api/research/articles?topic=ai&limit=20

# Filter by status
curl http://localhost:3001/api/research/articles?status=analyzed

# Sort by relevance
curl http://localhost:3001/api/research/articles?sortBy=relevance_score&order=DESC
```

### Query Features

```bash
# High revenue features
curl http://localhost:3001/api/research/features?revenue=high

# High impact features
curl http://localhost:3001/api/research/features?impact=high

# By category
curl http://localhost:3001/api/research/features?category=integration
```

## 📊 Monitoring & Analytics

### View Dashboard

The React dashboard provides real-time visualization:

```javascript
import AIResearchDashboard from './src/components/dashboards/AIResearchDashboard';

function App() {
  return <AIResearchDashboard />;
}
```

Or access via API:

```bash
curl http://localhost:3001/api/research/dashboard | jq .
```

### Check Pipeline Health

```bash
# Basic status
curl http://localhost:3001/api/research/status

# Detailed statistics
curl http://localhost:3001/api/research/dashboard

# Campaign status
curl http://localhost:3001/api/research/campaigns?active=true
```

### View Trending Topics

```bash
curl http://localhost:3001/api/research/topics | jq '.topics[] | select(.trending_score > 5)'
```

### Get SEO Insights

```bash
# All insights
curl http://localhost:3001/api/research/seo-insights

# By type
curl http://localhost:3001/api/research/seo-insights?patternType=keyword

# Top effectiveness
curl http://localhost:3001/api/research/seo-insights | jq '.insights | sort_by(.effectiveness_score) | reverse | .[0:10]'
```

### Browse Code Examples

```bash
# All examples
curl http://localhost:3001/api/research/code-examples

# By language
curl http://localhost:3001/api/research/code-examples?language=javascript

# High quality only
curl http://localhost:3001/api/research/code-examples | jq '.examples[] | select(.quality_score > 0.7)'
```

## 🎓 Workflow Examples

### Workflow 1: Daily Research Routine

```bash
# Morning: Check what was collected overnight
npm run research:status

# Review new articles
npm run research:articles | jq '.articles[] | select(.scraped_at > "2024-01-01")'

# Identify high-value features
npm run research:features | jq '.features[] | select(.revenue_potential == "high")'

# Generate weekly report
curl -X POST http://localhost:3001/api/research/papers/generate \
  -d '{"focusArea": "weekly-review", "limit": 100}'
```

### Workflow 2: Feature Development

```bash
# 1. Find features in your category
curl http://localhost:3001/api/research/features?category=integration&impact=high

# 2. Get related articles
curl http://localhost:3001/api/research/articles/[article-id]

# 3. View code examples
curl http://localhost:3001/api/research/code-examples?language=javascript

# 4. Check similar implementations
curl http://localhost:3001/api/research/articles?topic=integration
```

### Workflow 3: Market Research

```bash
# 1. Analyze trending topics
curl http://localhost:3001/api/research/topics | jq '.topics | sort_by(.trending_score) | reverse'

# 2. Get service package ideas
curl http://localhost:3001/api/research/service-packages?status=concept

# 3. Review SEO strategies
curl http://localhost:3001/api/research/seo-insights?patternType=keyword

# 4. Generate market analysis paper
curl -X POST http://localhost:3001/api/research/papers/generate \
  -d '{"focusArea": "market-analysis", "limit": 100}'
```

### Workflow 4: Continuous Monitoring

```bash
# Set up campaign for specific topic
curl -X POST http://localhost:3001/api/research/campaigns \
  -d '{
    "name": "LLM Performance Monitoring",
    "topics": ["llm", "optimization", "performance"],
    "schedule": "0 */4 * * *",
    "maxArticles": 50
  }'

# Execute immediately
CAMPAIGN_ID=$(curl -s http://localhost:3001/api/research/campaigns | jq -r '.campaigns[0].id')
curl -X POST http://localhost:3001/api/research/campaigns/$CAMPAIGN_ID/execute

# Check results
npm run research:features | jq '.features[] | select(.category == "optimization")'
```

## 🔍 Data Analysis

### SQL Queries (Direct Database)

```sql
-- Top 10 most relevant articles
SELECT title, url, relevance_score, tags
FROM research_articles
ORDER BY relevance_score DESC
LIMIT 10;

-- Features by revenue potential
SELECT category, COUNT(*) as count
FROM feature_recommendations
WHERE revenue_potential = 'high'
GROUP BY category
ORDER BY count DESC;

-- Trending topics last 30 days
SELECT rt.name, COUNT(at.article_id) as article_count
FROM research_topics rt
JOIN article_topics at ON rt.id = at.topic_id
JOIN research_articles ra ON at.article_id = ra.id
WHERE ra.scraped_at > NOW() - INTERVAL '30 days'
GROUP BY rt.name
ORDER BY article_count DESC
LIMIT 20;

-- Code examples by language
SELECT language, COUNT(*) as count, AVG(quality_score) as avg_quality
FROM research_code_examples
GROUP BY language
ORDER BY count DESC;
```

### Data Export

```bash
# Export articles to JSON
curl http://localhost:3001/api/research/articles?limit=1000 > articles.json

# Export features to CSV
curl http://localhost:3001/api/research/features | \
  jq -r '.features[] | [.feature_name, .category, .impact_level, .revenue_potential] | @csv' > features.csv

# Export papers
curl http://localhost:3001/api/research/papers > research_papers.json
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check database connection
psql -U postgres -d lightdom -c "SELECT NOW();"

# Verify schema exists
psql -U postgres -d lightdom -c "\dt research_*"

# Check for errors
node start-research-pipeline.js 2>&1 | tee startup.log
```

### No Articles Found

```bash
# Test scraping manually
curl -X POST http://localhost:3001/api/research/scrape \
  -d '{"topics": ["ai"], "limit": 10}'

# Check rate limiting
# Wait a few minutes if you see rate limit errors

# Verify network connectivity
curl -I https://dev.to
```

### Database Errors

```bash
# Re-initialize schema
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql

# Check for conflicts
psql -U postgres -d lightdom -c "SELECT COUNT(*) FROM research_articles;"

# Verify permissions
psql -U postgres -d lightdom -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;"
```

## 📈 Performance Tuning

### Optimize Scraping

```javascript
// Adjust rate limits
const pipeline = new AIResearchPipeline({
  rateLimit: 100,  // Increase from 50
  maxConcurrent: 10  // Increase from 5
});
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_articles_relevance_desc ON research_articles(relevance_score DESC);
CREATE INDEX idx_features_revenue ON feature_recommendations(revenue_potential);

-- Vacuum and analyze
VACUUM ANALYZE research_articles;
VACUUM ANALYZE feature_recommendations;
```

### Campaign Tuning

```bash
# Reduce frequency for less active topics
node start-research-pipeline.js --interval 720  # 12 hours

# Increase for hot topics
node start-research-pipeline.js --interval 60   # 1 hour
```

## 🎯 Best Practices

1. **Start Small**: Begin with 180-minute intervals and 50 articles per run
2. **Monitor Trends**: Check dashboard daily for emerging patterns
3. **Iterate Papers**: Generate research papers weekly
4. **Prioritize Features**: Focus on high-revenue, high-impact features
5. **Use Code Examples**: Leverage extracted code as implementation guides
6. **Track Campaigns**: Review campaign results to optimize settings
7. **Backup Data**: Regularly export important findings
8. **Rate Limits**: Respect source rate limits to maintain access

## 🔗 Integration Examples

### With Existing Systems

```javascript
// In your app
import { AIResearchPipeline } from './services/ai-research-pipeline.js';

const pipeline = new AIResearchPipeline({ db, headless: true });
await pipeline.initialize();

// Subscribe to events
pipeline.on('articles-scraped', (data) => {
  console.log(`Found ${data.count} new articles`);
  // Trigger your workflow
});

pipeline.on('paper-generated', (paper) => {
  // Send notification
  sendEmail({
    subject: `New Research: ${paper.title}`,
    body: paper.executive_summary
  });
});
```

### With CI/CD

```yaml
# .github/workflows/research.yml
name: Daily Research
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run research analysis
        run: npm run research:analyze
```

## 📞 Support

For issues or questions:

1. Run validation: `npm run research:validate`
2. Check logs in the output
3. Review documentation:
   - `RESEARCH_PIPELINE_QUICKSTART.md`
   - `AI_RESEARCH_PIPELINE_README.md`
   - `RESEARCH_PIPELINE_IMPLEMENTATION_SUMMARY.md`
4. Examine demo script: `demo-ai-research-pipeline.js`

## 🎉 Success Metrics

Track your progress with these KPIs:

- **Articles/Day**: Target 100-500 (configurable)
- **Features/Week**: Target 50-200
- **Papers/Month**: Target 4-12
- **Revenue Opportunities**: Target 10-30 identified
- **Code Examples**: Target 500+ collected
- **Implementation Rate**: Target 10% of features implemented

## 📝 Conclusion

The AI Research Pipeline is a powerful tool for staying ahead of AI/ML/LLM trends. Use this guide to maximize its value for your product development and business strategy.

**Ready to start? Run:**

```bash
npm run research:validate  # Verify system
npm run research:start     # Start service
npm run research:demo      # See it in action
```

Happy researching! 🚀
