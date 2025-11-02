# Background Data Mining System

## Overview

The Background Data Mining System is a comprehensive, AI-powered web crawling solution designed to continuously collect training data for neural networks. It features intelligent URL deduplication, schema-linked workflows, attribute-based task breakdown, and AI-powered configuration generation.

## Key Features

### 🔄 **Continuous Background Mining**
- Multi-threaded worker system for concurrent crawling
- Priority-based task queue
- Smart URL caching with TTL (Time To Live)
- Automatic retry mechanism with exponential backoff

### 🧠 **AI-Powered Configuration**
- Generate crawler configs from natural language prompts
- Powered by Ollama (DeepSeek-R1, Llama3, Mixtral)
- Automatic selector generation
- Intelligent data type detection

### 📊 **Schema-Linked Architecture**
- Mining jobs linked to workflow processes
- Workflows connected to specific tasks
- Task status tracking per attribute
- Real-time progress monitoring

### 🎯 **Attribute-Based Mining**
- Break down subjects into individual attributes
- Mine each attribute independently
- Selective re-mining for missing/updated data
- Priority-based attribute extraction

### 🚫 **Smart Deduplication**
- URL-level caching to prevent duplicate crawls
- Schema version tracking for attribute updates
- Configurable cache TTL
- Selective re-mining based on data freshness

## Installation

No additional dependencies needed beyond the main project. The system uses:
- Puppeteer (already installed)
- PostgreSQL (existing database)
- Ollama (optional, for AI config generation)

### Optional: Install Ollama

For AI-powered configuration generation:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended model
ollama pull deepseek-r1:latest

# Start Ollama service (runs on port 11434 by default)
ollama serve
```

## Quick Start

### 1. Start the Mining Daemon

```bash
npm run mining:daemon
```

This starts the background service with 3 worker threads.

### 2. Create a Mining Job (Manual)

```bash
npm run mining:job seo-data -- \
  --urls "https://moz.com/blog,https://searchengineland.com" \
  --attributes "title,content,meta_description,keywords" \
  --max-depth 3 \
  --max-urls 100
```

### 3. Create a Mining Job (From Config File)

```bash
npm run mining:add examples/mining-configs/seo-articles.json
```

### 4. Generate Config with AI

```bash
# Generate and save config
npm run mining:generate "mine technical blog posts about React, focusing on tutorials and best practices" \
  --urls "https://reactjs.org/blog" \
  --output my-config.json

# Generate and immediately start mining
npm run mining:generate "extract product information from e-commerce sites" \
  --urls "https://example-store.com" \
  --start
```

### 5. Monitor Progress

```bash
# List all jobs
npm run mining:status

# Monitor specific job in real-time
npm run mining:job <job-id> --follow
```

### 6. Control Jobs

```bash
# Pause a job
npm run mining:pause <job-id>

# Resume a job
npm run mining:resume <job-id>

# Stop a job
npm run mining:stop <job-id>
```

## Configuration File Structure

Mining jobs are configured using JSON files. Here's the complete structure:

```json
{
  "name": "Human-readable job name",
  "subject": "single-word-identifier",
  "description": "Detailed description of what to mine",
  
  "seedUrls": [
    "https://example.com/start-here"
  ],
  
  "attributes": [
    {
      "name": "attribute_name",
      "selector": "CSS selector or null for auto-detection",
      "extractor": "Optional: JavaScript function for custom extraction",
      "priority": 10,
      "schemaVersion": "1.0.0",
      "dataType": "text|number|date|url|image|json",
      "validation": {
        "required": true,
        "minLength": 10,
        "maxLength": 500,
        "pattern": "optional regex"
      }
    }
  ],
  
  "config": {
    "maxDepth": 3,
    "maxUrls": 1000,
    "respectRobotsTxt": true,
    "followExternalLinks": false,
    "urlPatterns": {
      "include": ["regex patterns to include"],
      "exclude": ["regex patterns to exclude"]
    },
    "rateLimitMs": 1000,
    "timeout": 30000
  },
  
  "scheduling": {
    "enabled": true,
    "frequency": "daily|weekly|monthly|cron-expression",
    "maxRuns": null
  }
}
```

## Architecture

### Components

1. **BackgroundDataMiningService**
   - Orchestrates all mining operations
   - Manages worker threads
   - Handles URL caching and deduplication
   - Coordinates task distribution

2. **AIConfigGenerator**
   - Generates configurations from prompts
   - Integrates with Ollama
   - Validates generated configs
   - Provides fallback generation

3. **Mining CLI**
   - Command-line interface for all operations
   - Real-time progress monitoring
   - Job control (start, pause, resume, stop)

### Database Integration

The system integrates with existing database schemas:

- `workflow_process_definitions` - Process templates for mining jobs
- `workflow_process_instances` - Active mining job instances
- `task_instances` - Individual attribute mining tasks
- `url_seeds` - Seed URLs for crawling
- `crawl_results` - Extracted data storage
- `workflow_execution_features` - Performance metrics for ML training

### Mining Flow

```
1. Create Mining Job
   ↓
2. Generate Tasks (one per URL × attribute combination)
   ↓
3. Queue Tasks (priority-based)
   ↓
4. Workers Process Tasks
   ↓
5. Extract Attribute Data
   ↓
6. Save to Database
   ↓
7. Update Progress
   ↓
8. Check for More Tasks
```

### Smart Re-Mining Logic

The system decides whether to re-mine a URL based on:

1. **Cache Miss**: URL not in cache → mine
2. **Attribute Missing**: Attribute never extracted → mine
3. **Data Stale**: Last crawl > TTL → mine
4. **Schema Version Changed**: Attribute definition updated → mine
5. **Otherwise**: Skip (data is fresh)

## AI Configuration Generation

### How It Works

1. You provide a natural language prompt
2. System constructs expert prompt for the AI model
3. AI generates a complete mining configuration
4. System validates and enhances the config
5. Config is saved and/or immediately executed

### Prompt Engineering Tips

**Good Prompts:**
- ✅ "Mine technical blog posts about Python, focusing on tutorials and code examples"
- ✅ "Extract product data from e-commerce sites, including prices, descriptions, and reviews"
- ✅ "Collect news articles about AI, including headlines, authors, and publish dates"

**Bad Prompts:**
- ❌ "Mine stuff"
- ❌ "Get data"
- ❌ "Crawl website"

**Include:**
- Subject matter (what to mine)
- Data types (what attributes to extract)
- Optional: Target URLs
- Optional: Specific requirements

### Supported Models

1. **DeepSeek-R1** (Recommended)
   - Excellent reasoning capabilities
   - Best for complex extraction logic
   - `ollama pull deepseek-r1:latest`

2. **Llama3**
   - Fast and accurate
   - Good for standard use cases
   - `ollama pull llama3:latest`

3. **Mixtral**
   - High quality output
   - Slower but very accurate
   - `ollama pull mixtral:latest`

## Examples

### Example 1: SEO Article Mining

```bash
npm run mining:add examples/mining-configs/seo-articles.json
```

This mines SEO articles with 12 attributes including:
- Article title
- Meta description
- Author
- Publish date
- Content
- Headings
- Keywords
- Images
- Links
- Social shares

### Example 2: E-Commerce Product Mining

```bash
npm run mining:add examples/mining-configs/e-commerce-products.json
```

Extracts product data:
- Product name
- Price
- Description
- Category
- Rating
- Reviews

### Example 3: AI-Generated Config

```bash
npm run mining:generate \
  "mine research papers about machine learning, extracting titles, abstracts, authors, citations, and publication dates" \
  --urls "https://arxiv.org/list/cs.LG/recent" \
  --output research-papers.json \
  --start
```

## Advanced Features

### Custom Extractors

For complex data extraction, you can provide custom JavaScript functions:

```json
{
  "attributes": [
    {
      "name": "custom_data",
      "extractor": "() => { return document.querySelector('.complex').getAttribute('data-custom'); }",
      "priority": 8
    }
  ]
}
```

### URL Filtering

Control which URLs to crawl with patterns:

```json
{
  "config": {
    "urlPatterns": {
      "include": [
        "/blog/\\d{4}/.*",
        "/articles/[a-z-]+$"
      ],
      "exclude": [
        "/tag/",
        "/category/",
        "\\.pdf$"
      ]
    }
  }
}
```

### Scheduling

Set up recurring mining jobs:

```json
{
  "scheduling": {
    "enabled": true,
    "frequency": "0 2 * * *",  // 2 AM daily (cron)
    "maxRuns": 30  // Run 30 times then stop
  }
}
```

## Monitoring & Debugging

### View All Jobs

```bash
npm run mining:status
```

Output:
```
📊 Mining Jobs Status

┌─────────┬──────────────┬────────┬──────────┬─────┬──────┬──────────┐
│ ID      │ Subject      │ Status │ Progress │ URLs│ Tasks│ Created  │
├─────────┼──────────────┼────────┼──────────┼─────┼──────┼──────────┤
│ 12ab34cd│ seo-articles │running │ 45%      │ 50/1│ 120/2│ 11/2/2025│
│         │              │        │          │ 00  │ 60   │          │
└─────────┴──────────────┴────────┴──────────┴─────┴──────┴──────────┘
```

### Monitor Specific Job

```bash
npm run mining:job 12ab34cd --follow
```

Output (updates every second):
```
📋 Mining Job Details

   ID: 12ab34cd-ef56-gh78-ij90-kl12mn34op56
   Name: Example SEO Article Mining
   Subject: seo-articles
   Status: running

Progress:
   Overall: 45%
   URLs: 50/100 (48 success, 2 failed)
   Tasks: 120/260

   Created: 11/2/2025, 10:30:00 AM
   Started: 11/2/2025, 10:30:15 AM

Press Ctrl+C to exit
```

### Database Queries

Check mining data directly:

```sql
-- View all active mining jobs
SELECT * FROM workflow_process_instances 
WHERE status = 'running';

-- View crawled URLs
SELECT url, crawled_at 
FROM crawl_results 
ORDER BY crawled_at DESC 
LIMIT 10;

-- View mining statistics
SELECT 
  COUNT(*) as total_crawls,
  COUNT(DISTINCT url) as unique_urls,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM workflow_process_instances
WHERE process_type = 'data_mining';
```

## Performance Tuning

### Worker Configuration

Adjust number of concurrent workers:

```javascript
// In mining daemon
const service = new BackgroundDataMiningService({
  workerCount: 5,  // More workers = faster, but more resource intensive
  maxConcurrentCrawls: 10,
  crawlDelayMs: 500  // Lower = faster, but may hit rate limits
});
```

### Rate Limiting

Respect target sites and avoid getting blocked:

```json
{
  "config": {
    "rateLimitMs": 2000,  // 2 seconds between requests
    "timeout": 30000      // 30 second timeout
  }
}
```

### Cache TTL

Control how long to cache URL data:

```javascript
const service = new BackgroundDataMiningService({
  urlCacheTTL: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

## Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Check available models
ollama list
```

### Database Connection Issues

```bash
# Check database connection
npm run db:health

# Run migrations
npm run db:migrate
```

### Crawler Not Finding Data

1. Check CSS selectors in browser DevTools
2. Try broader selectors
3. Use custom extractors for complex cases
4. Check if site uses JavaScript rendering (Puppeteer handles this)

### High Memory Usage

- Reduce `workerCount`
- Increase `crawlDelayMs`
- Lower `maxConcurrentCrawls`
- Set lower `maxUrls` per job

## Best Practices

1. **Start Small**: Test with `maxUrls: 10` first
2. **Respect Robots.txt**: Keep `respectRobotsTxt: true`
3. **Rate Limit**: Use reasonable `rateLimitMs` (1000-2000ms)
4. **Monitor Progress**: Use `--follow` flag during development
5. **Version Attributes**: Increment `schemaVersion` when changing selectors
6. **Validate Data**: Add proper validation rules
7. **Use AI Generation**: Let AI help with complex configurations
8. **Schedule Wisely**: Run during off-peak hours
9. **Clean Up**: Stop jobs you don't need anymore
10. **Test Configs**: Validate with small URL counts first

## API Integration

The mining system can also be controlled programmatically:

```javascript
import BackgroundDataMiningService from './services/background-mining-service.js';

const service = new BackgroundDataMiningService();
await service.start();

// Create job
const jobId = await service.createMiningJob({
  name: 'My Mining Job',
  subject: 'my-data',
  seedUrls: ['https://example.com'],
  attributes: [
    { name: 'title', selector: 'h1', priority: 10 }
  ]
});

// Monitor events
service.on('task:completed', (task, data) => {
  console.log(`Completed: ${task.url}`);
});

// Get status
const status = service.getJobStatus(jobId);
console.log(`Progress: ${status.progress.percentage}%`);

// Control job
await service.pauseJob(jobId);
await service.resumeJob(jobId);
await service.stopJob(jobId);
```

## Future Enhancements

- [ ] Distributed crawling across multiple machines
- [ ] Browser automation for JavaScript-heavy sites
- [ ] Image recognition for visual data extraction
- [ ] Natural language extraction using LLMs
- [ ] Real-time streaming of extracted data
- [ ] Advanced scheduling with conditional triggers
- [ ] Automatic schema evolution and migration
- [ ] Integration with other AI models beyond Ollama

## Support

For issues or questions:
1. Check this documentation
2. Review example configs in `examples/mining-configs/`
3. Check the code comments in `services/background-mining-service.js`
4. Create an issue in the repository

## License

MIT - See main project LICENSE file
