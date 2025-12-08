# AI Research Pipeline System

## Overview

The AI Research Pipeline is a comprehensive system for:
- **Continuous monitoring** of AI/ML/LLM content from dev.to and other sources
- **Automated analysis** of articles for actionable product features
- **Code example extraction** for implementation reference
- **Research paper generation** with insights and recommendations
- **Monetization opportunity identification** for service packages
- **SEO pattern analysis** for content optimization

## Features

### 🔍 Intelligent Article Scraping
- Multi-source support (dev.to, Medium, Towards Data Science, etc.)
- Topic-based filtering (AI, ML, LLM, NLP, agents, etc.)
- Rate limiting and respectful crawling
- Full content extraction including code blocks
- Metadata extraction (author, tags, reading time)

### 🧠 AI-Powered Analysis
- Feature extraction from article content
- Impact and effort assessment
- Revenue potential scoring
- Code quality evaluation
- SEO pattern identification

### 📊 Research Intelligence
- Automated research paper generation
- Key findings extraction
- Implementation recommendations
- Trend analysis and topic tracking
- Competitive intelligence gathering

### 🎯 Continuous Monitoring
- Scheduled campaigns (hourly, daily, weekly)
- Real-time monitoring of new content
- Priority-based article processing
- Automated feature recommendations
- Progress tracking and reporting

### 💰 Monetization Focus
- Service package generation
- Revenue opportunity identification
- Market demand analysis
- Pricing strategy recommendations
- ROI projections

## Quick Start

### 1. Database Setup

```bash
# Initialize the research pipeline schema
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql
```

### 2. Run Demo

```bash
# Install dependencies (if needed)
npm install

# Run the complete demo
node demo-ai-research-pipeline.js
```

### 3. Start API Server

The research pipeline integrates with the existing API server. Ensure it's running:

```bash
npm run api
```

## API Endpoints

### Status & Monitoring

#### GET `/api/research/status`
Get pipeline status and statistics
```json
{
  "status": "operational",
  "stats": {
    "total_articles": 150,
    "articles_today": 25,
    "total_features": 45,
    "pending_features": 30,
    "active_campaigns": 2,
    "total_papers": 3,
    "total_code_examples": 120
  }
}
```

#### GET `/api/research/dashboard`
Get comprehensive dashboard data
```json
{
  "stats": {...},
  "topTopics": [...],
  "topFeatures": [...],
  "recentArticles": [...]
}
```

### Article Management

#### POST `/api/research/scrape`
Manually trigger article scraping
```bash
curl -X POST http://localhost:3001/api/research/scrape \
  -H "Content-Type: application/json" \
  -d '{"topics": ["ai", "ml", "llm"], "limit": 50}'
```

#### GET `/api/research/articles`
List scraped articles with filters
```bash
# Get all articles
curl http://localhost:3001/api/research/articles

# Filter by topic
curl http://localhost:3001/api/research/articles?topic=ai&limit=20

# Filter by status
curl http://localhost:3001/api/research/articles?status=analyzed
```

#### GET `/api/research/articles/:id`
Get detailed article information
```bash
curl http://localhost:3001/api/research/articles/[article-id]
```

#### POST `/api/research/articles/:id/analyze`
Analyze article for features
```bash
curl -X POST http://localhost:3001/api/research/articles/[article-id]/analyze
```

### Feature Management

#### GET `/api/research/features`
List feature recommendations
```bash
# Get all features
curl http://localhost:3001/api/research/features

# Filter by revenue potential
curl http://localhost:3001/api/research/features?revenue=high

# Filter by impact level
curl http://localhost:3001/api/research/features?impact=high&status=proposed
```

### Campaign Management

#### POST `/api/research/campaigns`
Create new research campaign
```bash
curl -X POST http://localhost:3001/api/research/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI/ML Continuous Monitoring",
    "description": "Monitor AI and ML trends",
    "type": "continuous",
    "queries": ["ai", "ml", "llm"],
    "topics": ["ai", "ml", "llm"],
    "schedule": "0 */6 * * *",
    "maxArticles": 100
  }'
```

#### GET `/api/research/campaigns`
List all campaigns
```bash
curl http://localhost:3001/api/research/campaigns?active=true
```

#### POST `/api/research/campaigns/:id/execute`
Execute a campaign manually
```bash
curl -X POST http://localhost:3001/api/research/campaigns/[campaign-id]/execute
```

### Research Papers

#### POST `/api/research/papers/generate`
Generate research paper
```bash
curl -X POST http://localhost:3001/api/research/papers/generate \
  -H "Content-Type: application/json" \
  -d '{"focusArea": "ai-ml-integration", "limit": 50}'
```

#### GET `/api/research/papers`
List research papers
```bash
curl http://localhost:3001/api/research/papers?status=published
```

#### GET `/api/research/papers/:id`
Get paper details
```bash
curl http://localhost:3001/api/research/papers/[paper-id]
```

### Insights & Analytics

#### GET `/api/research/topics`
List trending topics
```bash
curl http://localhost:3001/api/research/topics
```

#### GET `/api/research/seo-insights`
Get SEO insights
```bash
curl http://localhost:3001/api/research/seo-insights?patternType=keyword
```

#### GET `/api/research/code-examples`
Get code examples
```bash
# All examples
curl http://localhost:3001/api/research/code-examples

# Filter by language
curl http://localhost:3001/api/research/code-examples?language=javascript
```

#### GET `/api/research/service-packages`
List service packages
```bash
curl http://localhost:3001/api/research/service-packages?status=concept
```

## Integration with Existing System

### Add to API Server

In `api-server-express.js`, add:

```javascript
import createResearchPipelineRoutes from './api/research-pipeline-routes.js';

// ... existing code ...

// Add research pipeline routes
app.use('/api/research', createResearchPipelineRoutes(db));
```

### Dashboard Integration

The research pipeline provides a dashboard endpoint that can be integrated into the existing admin dashboard:

```javascript
// In your React dashboard component
import { useEffect, useState } from 'react';

function ResearchDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/research/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="research-dashboard">
      <h2>AI Research Pipeline</h2>
      
      <div className="stats">
        <StatCard title="Total Articles" value={data.stats.total_articles} />
        <StatCard title="Features Identified" value={data.stats.total_features} />
        <StatCard title="Active Campaigns" value={data.stats.active_campaigns} />
        <StatCard title="Research Papers" value={data.stats.total_papers} />
      </div>

      <TopicsList topics={data.topTopics} />
      <FeaturesList features={data.topFeatures} />
      <ArticlesList articles={data.recentArticles} />
    </div>
  );
}
```

## Database Schema

The pipeline uses the following main tables:

- `research_sources` - Article sources and monitoring configuration
- `research_articles` - Collected articles
- `research_topics` - AI/ML/LLM topics
- `article_topics` - Article-topic relationships
- `research_code_examples` - Extracted code snippets
- `feature_recommendations` - Product feature suggestions
- `research_campaigns` - Automated monitoring campaigns
- `seo_insights` - SEO patterns and insights
- `service_packages` - Monetization opportunities
- `research_papers` - Generated research reports
- `research_analysis_jobs` - Background processing jobs

## Workflow Examples

### Example 1: Setup Continuous Monitoring

```javascript
import { AIResearchPipeline } from './services/ai-research-pipeline.js';

const pipeline = new AIResearchPipeline({ db, headless: true });
await pipeline.initialize();

// Create campaign for AI agent content
const campaign = await pipeline.createResearchCampaign({
  name: 'AI Agent Research',
  description: 'Monitor agentic AI developments',
  queries: ['agentic ai', 'ai agents', 'autonomous agents'],
  topics: ['ai', 'agents', 'automation'],
  schedule: '0 */6 * * *', // Every 6 hours
  maxArticles: 100
});

// Execute immediately
await pipeline.executeCampaign(campaign.id);
```

### Example 2: Generate Research Paper

```javascript
// Generate paper on AI/ML integration opportunities
const paper = await pipeline.generateResearchPaper('ai-ml-integration', 50);

console.log(paper.title);
console.log(paper.executive_summary);
console.log('Key Findings:', paper.key_findings);
console.log('Recommendations:', paper.recommendations);
```

### Example 3: Extract Features from Articles

```javascript
// Scrape latest articles
const articles = await pipeline.scrapeDevToArticles(['ai', 'llm'], 20);

// Analyze each for features
for (const article of articles) {
  const details = await pipeline.scrapeArticleDetails(article.url);
  Object.assign(article, details);
  
  const features = await pipeline.analyzeArticleForFeatures(article);
  console.log(`Found ${features.length} features in "${article.title}"`);
}
```

## Automation & Scheduling

### Cron Schedule Examples

The pipeline supports cron expressions for scheduling:

- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on 1st

### Background Processing

The pipeline includes a job queue system for async processing:

```javascript
// Jobs are automatically created and processed
// Check job status:
const jobs = await db.query(`
  SELECT * FROM research_analysis_jobs 
  WHERE status = 'pending'
  ORDER BY priority DESC
`);
```

## Best Practices

### Rate Limiting
- Default: 100 requests per hour
- Configurable per source
- Automatic backoff on rate limit errors

### Content Quality
- Focus on articles with code examples
- Prioritize recent content (< 6 months)
- Filter by relevance score (> 0.6)

### Feature Extraction
- Look for implementation details
- Identify revenue opportunities
- Assess technical complexity
- Consider market demand

### SEO Optimization
- Study successful article patterns
- Extract keyword strategies
- Analyze content structure
- Learn from top performers

## Monitoring & Maintenance

### Health Checks

```bash
# Check pipeline status
curl http://localhost:3001/api/research/status

# View recent activity
curl http://localhost:3001/api/research/articles?limit=10

# Check campaign execution
curl http://localhost:3001/api/research/campaigns
```

### Database Maintenance

```sql
-- Archive old articles
UPDATE research_articles 
SET status = 'archived' 
WHERE scraped_at < NOW() - INTERVAL '6 months';

-- Update trending scores
UPDATE research_topics 
SET trending_score = (
  SELECT COUNT(*) 
  FROM article_topics at 
  JOIN research_articles ra ON at.article_id = ra.id
  WHERE at.topic_id = research_topics.id 
    AND ra.scraped_at > NOW() - INTERVAL '30 days'
);
```

### Performance Optimization

```sql
-- Add indexes if needed
CREATE INDEX IF NOT EXISTS idx_articles_url_hash 
  ON research_articles(md5(url));

-- Vacuum and analyze
VACUUM ANALYZE research_articles;
VACUUM ANALYZE feature_recommendations;
```

## Troubleshooting

### Common Issues

1. **Scraping Failures**
   - Check rate limits
   - Verify network connectivity
   - Ensure headless browser is available

2. **Database Errors**
   - Verify schema is up to date
   - Check connection pool settings
   - Review error logs

3. **Missing Features**
   - Ensure articles have full content
   - Check relevance thresholds
   - Review analysis algorithms

### Debug Mode

```javascript
const pipeline = new AIResearchPipeline({ 
  db,
  headless: false, // Show browser
  debug: true // Enable debug logging
});
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Integration with more sources (Medium, Reddit, Hacker News)
- [ ] ML-based relevance scoring
- [ ] Automated A/B testing of SEO patterns
- [ ] Real-time notifications for high-value articles
- [ ] Export to various formats (PDF, Markdown, JSON)
- [ ] Integration with project management tools
- [ ] Automated PR creation for features
- [ ] Market research and competitive analysis
- [ ] Revenue forecasting models

## Support

For issues or questions:
- Check the API documentation
- Review example code in `demo-ai-research-pipeline.js`
- Examine database schema in `database/ai-research-pipeline-schema.sql`
- Consult service implementation in `services/ai-research-pipeline.js`

## License

Part of the LightDom platform - see main LICENSE file.
