# Research Pipeline - Deep Research Mining System

## Overview

The Research Pipeline is a comprehensive system for automatically extracting, analyzing, and organizing AI research articles with database persistence and DeepSeek AI integration for content suggestions.

## Features

✅ **Automated Article Extraction** - Mines 352+ AI research articles from multiple sources
✅ **Database Persistence** - All research stored in PostgreSQL with rich querying
✅ **Topic Mining** - Automatically identifies and categorizes research topics
✅ **Seed Crawling** - Easy crawling and indexing of research sources (arXiv, GitHub, Papers with Code)
✅ **DeepSeek Integration** - AI-powered content suggestions and analysis
✅ **Multi-Source Support** - arXiv, GitHub, Papers with Code, dev.to
✅ **Priority System** - High/medium/low prioritization for LightDom relevance
✅ **Session Tracking** - Comprehensive metrics and session management

## Quick Start

### 1. Setup Database

```bash
# Start PostgreSQL (if not running)
sudo service postgresql start

# Or with Docker
docker-compose up -d postgres

# Run pipeline setup (creates schema + loads articles)
npm run research:setup
```

### 2. Configure Environment

Add to your `.env` file:

```env
# Database (required)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dom_space_harvester

# DeepSeek AI (optional, for AI suggestions)
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

### 3. Run the Pipeline

```bash
# Full pipeline (setup + mine + analyze)
npm run research:start

# Mine articles only
npm run research:mine

# Process DeepSeek queue
npm run research:deepseek

# Show statistics
npm run research:stats
```

## Usage

### Basic Commands

```bash
# Run full pipeline
npm run research:start

# Mine high-priority articles (default: 50)
npm run research:mine

# Mine with custom settings
npm run research:mine -- --priority medium --limit 100

# Reprocess all articles
npm run research:mine -- --reprocess

# Skip DeepSeek processing
npm run research:start -- --no-deepseek

# View statistics
npm run research:stats

# Show help
npm run research:help
```

### Advanced Usage

**Mine specific priority level:**
```bash
npm run research:mine -- --priority high --limit 20
npm run research:mine -- --priority medium --limit 50
npm run research:mine -- --priority low --limit 100
```

**Reprocess articles:**
```bash
npm run research:mine -- --reprocess --priority high
```

**Database-only operations:**
```bash
# Setup database schema
npm run research:setup

# View statistics without mining
npm run research:stats
```

## Database Schema

The pipeline creates comprehensive tables for research management:

### Core Tables

- **research_articles** - All research articles (352+ entries)
- **research_topics** - Hierarchical topic taxonomy
- **article_topics** - Many-to-many article-topic relationships
- **research_seeds** - URLs to crawl (arXiv, GitHub, etc.)
- **mining_sessions** - Track extraction sessions with metrics
- **deepseek_suggestions** - AI-generated suggestions
- **content_queue** - Queue for DeepSeek processing
- **crawl_queue** - URL crawling queue

### Views

- **articles_to_extract** - Articles needing extraction
- **high_priority_topics** - Priority topics with stats
- **mining_session_summary** - Session performance metrics
- **pending_suggestions** - New AI suggestions to review

### Functions

- **update_article_status()** - Update article extraction status
- **link_article_to_topic()** - Link articles to topics
- **queue_content_for_deepseek()** - Queue content for AI analysis

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Research Pipeline                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. ARTICLE LOADING                                           │
│     ├─ Load from AI_SERIES_INDEX.md                          │
│     ├─ Parse 352 articles                                    │
│     └─ Insert into database                                  │
│                                                               │
│  2. SOURCE DISCOVERY                                          │
│     ├─ Search arXiv for papers                               │
│     ├─ Search GitHub for implementations                     │
│     ├─ Search Papers with Code                               │
│     └─ Create research seeds                                 │
│                                                               │
│  3. CONTENT EXTRACTION                                        │
│     ├─ Crawl research seeds                                  │
│     ├─ Extract article content                               │
│     ├─ Parse metadata                                        │
│     └─ Update database                                       │
│                                                               │
│  4. TOPIC MINING                                              │
│     ├─ Extract keywords from titles                          │
│     ├─ Identify topics                                       │
│     ├─ Link articles to topics                               │
│     └─ Update topic counts                                   │
│                                                               │
│  5. DEEPSEEK INTEGRATION (Optional)                           │
│     ├─ Queue extracted content                               │
│     ├─ Send to DeepSeek API                                  │
│     ├─ Parse AI suggestions                                  │
│     └─ Store suggestions                                     │
│                                                               │
│  6. STATISTICS & REPORTING                                    │
│     ├─ Track session metrics                                 │
│     ├─ Calculate success rates                               │
│     ├─ Generate summaries                                    │
│     └─ Update dashboard                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Output Example

```bash
$ npm run research:start

╔══════════════════════════════════════════════════════════╗
║     🔬 LightDom Research Pipeline                       ║
║     Deep Research Mining & Content Suggestion System    ║
╚══════════════════════════════════════════════════════════╝

📊 Setting up database...
  📁 Loading schema from: ./database/research-pipeline-schema.sql
  ✅ Database schema loaded

🚀 Initializing Research Pipeline...
✅ Database connected: 2024-11-15T17:01:25.906Z
📚 Found 352 articles in index
✅ Article index loaded into database
✅ Research Pipeline initialized
📊 Session ID: abc123...

⛏️  MINING PHASE

Settings:
  • Priority: high
  • Limit: 50 articles
  • Skip extracted: true

📦 Processing 50 articles (priority: high)

📊 Batch 1/5 (10 articles)
  📄 Processing: 1. Agent Learning via Early Experience...
    ✅ Extracted (2 topics identified)
  📄 Processing: 7. From What to Why: A Multi-Agent System...
    ✅ Extracted (3 topics identified)
  ...

📊 Mining Results:
  • Processed: 50
  • Extracted: 45
  • Failed: 5
  • Topics: 92
  • Seeds: 87

🤖 DEEPSEEK PROCESSING PHASE

📦 Found 45 items in queue
  📄 Processing: Agent Learning via Early Experience...
    ✅ Processed
  ...

✅ DeepSeek processing completed

📈 PIPELINE STATISTICS

Database Status:
  • Total Articles: 352
  • Extracted: 45
  • Pending: 307
  • Topics: 16
  • Research Seeds: 87
  • Content Queue: 0
  • AI Suggestions: 12

  Extraction Rate: 12.8%

════════════════════════════════════════════════════════════
Summary
════════════════════════════════════════════════════════════
Duration: 145.3s
Total Articles: 352
Extracted: 45
AI Suggestions: 12
════════════════════════════════════════════════════════════

✅ Research Pipeline completed successfully
```

## API Reference

### ResearchPipelineService

```javascript
import ResearchPipelineService from './services/research-pipeline-service.js';

const pipeline = new ResearchPipelineService();

// Initialize
await pipeline.initialize();

// Start mining
const stats = await pipeline.startMining({
  priority: 'high',
  limit: 50,
  skipExtracted: true
});

// Process DeepSeek queue
await pipeline.processDeepSeekQueue();

// Get statistics
const stats = await pipeline.getStatistics();

// Cleanup
await pipeline.cleanup();
```

### Database Queries

```javascript
// Get articles to extract
const articles = await db.query(`
  SELECT * FROM articles_to_extract
  LIMIT 10
`);

// Get high-priority topics
const topics = await db.query(`
  SELECT * FROM high_priority_topics
`);

// Get mining session summary
const sessions = await db.query(`
  SELECT * FROM mining_session_summary
  WHERE start_time >= NOW() - INTERVAL '7 days'
`);

// Get pending DeepSeek suggestions
const suggestions = await db.query(`
  SELECT * FROM pending_suggestions
  ORDER BY confidence_score DESC
  LIMIT 20
`);
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/dom_space_harvester` | Yes |
| `DEEPSEEK_API_KEY` | DeepSeek API key | - | No |
| `DEEPSEEK_API_URL` | DeepSeek API endpoint | `https://api.deepseek.com/v1` | No |
| `DEEPSEEK_MODEL` | Model to use | `deepseek-chat` | No |

### Mining Configuration

Adjust in `services/research-pipeline-service.js`:

```javascript
const CONFIG = {
  mining: {
    batchSize: 10,           // Articles per batch
    maxConcurrent: 5,        // Concurrent extractions
    retryAttempts: 3,        // Retry failed extractions
    retryDelay: 2000,        // Delay between retries (ms)
  },
  crawling: {
    maxDepth: 2,             // Max crawl depth
    rateLimit: 1000,         // Min time between requests (ms)
    timeout: 30000,          // Request timeout (ms)
  }
};
```

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start

# Test connection
psql "postgresql://postgres:postgres@localhost:5432/dom_space_harvester" -c "SELECT 1"
```

### Schema Errors

```bash
# Manually load schema
psql "postgresql://postgres:postgres@localhost:5432/dom_space_harvester" -f database/research-pipeline-schema.sql

# Or drop and recreate
dropdb dom_space_harvester
createdb dom_space_harvester
npm run research:setup
```

### No Articles Found

```bash
# Check article index exists
ls docs/research/deepseek-ocr-contexts-optical-compression/AI_SERIES_INDEX.md

# Run setup to reload
npm run research:setup
```

### DeepSeek API Errors

```bash
# Check API key is set
echo $DEEPSEEK_API_KEY

# Test API directly
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'

# Skip DeepSeek if not needed
npm run research:start -- --no-deepseek
```

## Performance

- **Mining Speed**: ~3-5 articles/second
- **Batch Processing**: 10 articles per batch
- **Database Writes**: Optimized bulk inserts
- **API Rate Limiting**: 1 request/second (configurable)
- **Concurrent Extractions**: 5 simultaneous (configurable)

## Roadmap

- [ ] Web interface for browsing research
- [ ] Advanced topic clustering with ML
- [ ] Automatic paper PDF extraction
- [ ] Integration with Zotero/Mendeley
- [ ] Real-time crawling with webhooks
- [ ] Graph visualization of research connections
- [ ] Export to various formats (BibTeX, EndNote, etc.)

## Contributing

1. Add new article sources in `services/research-pipeline-service.js`
2. Extend database schema in `database/research-pipeline-schema.sql`
3. Add new topics to the topic taxonomy
4. Improve extraction algorithms
5. Add tests for new features

## License

MIT

## Support

For issues or questions:
- Check the [main documentation](../ai-series-352/README.md)
- Review [troubleshooting](#troubleshooting) section
- Open an issue on GitHub

---

*Research Pipeline v1.0*
*Part of LightDom Research Suite*
*Last Updated: November 2024*
