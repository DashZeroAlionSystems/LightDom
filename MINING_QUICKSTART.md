# Quick Start Guide: Background Data Mining System

This guide will get you mining data in under 5 minutes!

## Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** running (with existing LightDom database)
3. **Optional**: Ollama for AI config generation

## Installation

```bash
# Already installed! No additional dependencies needed.
# The mining system uses existing project dependencies.
```

## Step 1: Start the Mining Daemon

Open a terminal and run:

```bash
npm run mining:daemon
```

You should see:
```
🚀 Starting Background Data Mining Service...
✅ Background Data Mining Service started
   - Workers: 3
   - Max concurrent crawls: 5
   - Crawl delay: 1000ms
```

**Keep this running** in the background.

## Step 2: Create Your First Mining Job

### Option A: Use Example Config (Easiest)

In a new terminal:

```bash
npm run mining:add examples/mining-configs/seo-articles.json
```

### Option B: Quick Command Line

```bash
npm run mining:job my-first-job -- \
  --urls "https://example.com" \
  --attributes "title,content,links" \
  --max-depth 2 \
  --max-urls 10
```

### Option C: AI-Generated Config (Most Powerful)

First, install Ollama (if not already):
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull deepseek-r1:latest
ollama serve  # In separate terminal
```

Then generate and start mining:
```bash
npm run mining:generate \
  "mine technical blog posts about Python, focusing on tutorials and code examples" \
  --urls "https://realpython.com" \
  --start
```

## Step 3: Monitor Progress

Watch your mining job in action:

```bash
# List all jobs
npm run mining:status

# Get the job ID from the output, then:
npm run mining:job <job-id> --follow
```

You'll see real-time progress updates:
```
📋 Mining Job Details

   ID: 12ab34cd...
   Name: my-first-job
   Status: running

Progress:
   Overall: 45%
   URLs: 5/10 (4 success, 1 failed)
   Tasks: 12/30
```

## Step 4: View Mined Data

Check the database:

```sql
-- Most recent crawls
SELECT url, crawled_at, full_content 
FROM crawl_results 
ORDER BY crawled_at DESC 
LIMIT 10;

-- Count by subject
SELECT 
  wpd.name as process_name,
  COUNT(*) as crawl_count
FROM crawl_results cr
JOIN workflow_process_instances wpi ON wpi.id = cr.process_instance_id
JOIN workflow_process_definitions wpd ON wpd.id = wpi.process_definition_id
GROUP BY wpd.name;
```

## Step 5: Control Your Jobs

```bash
# Pause a running job
npm run mining:pause <job-id>

# Resume a paused job
npm run mining:resume <job-id>

# Stop a job completely
npm run mining:stop <job-id>
```

## What's Next?

### Create Custom Mining Configs

Copy an example config:
```bash
cp examples/mining-configs/seo-articles.json my-custom-config.json
```

Edit it to match your needs:
```json
{
  "name": "My Custom Mining Job",
  "subject": "my-data",
  "seedUrls": ["https://your-target-site.com"],
  "attributes": [
    {
      "name": "main_heading",
      "selector": "h1.main-title",
      "priority": 10,
      "dataType": "text"
    },
    {
      "name": "price",
      "selector": ".product-price",
      "priority": 9,
      "dataType": "number"
    }
  ],
  "config": {
    "maxDepth": 3,
    "maxUrls": 100
  }
}
```

Then run:
```bash
npm run mining:add my-custom-config.json
```

### Schedule Recurring Mining

Edit your config to enable scheduling:
```json
{
  "scheduling": {
    "enabled": true,
    "frequency": "daily",  // or "weekly", "monthly", or cron
    "maxRuns": null  // null = run forever
  }
}
```

### Advanced: Use AI for Everything

Let AI create complex configs for you:

```bash
# Example 1: E-commerce
npm run mining:generate \
  "extract product data including name, price, description, reviews, and stock status from e-commerce sites" \
  --urls "https://shop.example.com/products" \
  --output ecommerce-config.json

# Example 2: News Articles
npm run mining:generate \
  "mine news articles focusing on headline, author, publish date, article body, and related articles" \
  --urls "https://news.example.com" \
  --start

# Example 3: Research Papers
npm run mining:generate \
  "collect academic papers with title, abstract, authors, publication date, and citations" \
  --urls "https://arxiv.org" \
  --output research-config.json
```

## Tips & Tricks

1. **Start Small**: Test with `maxUrls: 10` before scaling up
2. **Monitor First**: Use `--follow` to watch progress on new jobs
3. **Respect Sites**: Use `rateLimitMs: 2000` or higher for busy sites
4. **Check Selectors**: Use browser DevTools to verify CSS selectors work
5. **Use Priorities**: Higher priority (1-10) attributes get mined first
6. **Version Schemas**: Increment `schemaVersion` when changing selectors to trigger re-mining

## Troubleshooting

### Job not starting?
- Check daemon is running: `npm run mining:status`
- Verify database connection: `npm run db:health`
- Check seed URLs are valid

### No data extracted?
- Verify CSS selectors in browser
- Try broader selectors
- Check site doesn't require JavaScript (Puppeteer handles this)

### High memory usage?
Edit daemon startup to reduce workers:
```javascript
// In your own startup script
new BackgroundDataMiningService({
  workerCount: 1,  // Reduce from 3
  crawlDelayMs: 2000  // Increase delay
})
```

### Ollama not working?
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# Pull a model if needed
ollama pull deepseek-r1:latest
```

## Need Help?

- 📖 Full documentation: `MINING_SYSTEM_README.md`
- 💡 Example configs: `examples/mining-configs/`
- 🐛 Issues: Create GitHub issue
- 💬 Questions: Check documentation first

## Complete Example Workflow

Here's a complete workflow from start to finish:

```bash
# 1. Start daemon (terminal 1)
npm run mining:daemon

# 2. Generate config with AI (terminal 2)
npm run mining:generate \
  "mine SEO blog posts with titles, meta descriptions, content, and headings" \
  --urls "https://moz.com/blog,https://searchengineland.com" \
  --output seo-mining.json

# 3. Review the generated config
cat seo-mining.json

# 4. Start mining
npm run mining:add seo-mining.json

# 5. Monitor progress
npm run mining:status

# 6. Get job ID and watch it
npm run mining:job abc123def --follow

# 7. After it completes, query the data
psql -d dom_space_harvester -c "
  SELECT 
    url, 
    full_content->>'attribute' as attribute,
    length(full_content::text) as data_size
  FROM crawl_results 
  ORDER BY crawled_at DESC 
  LIMIT 20;
"

# 8. Create next mining job based on learned patterns
npm run mining:generate \
  "mine similar content but focus on code examples and technical depth" \
  --urls "https://realpython.com" \
  --start
```

Happy Mining! 🎉
