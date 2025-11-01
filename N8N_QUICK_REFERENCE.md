# N8N Windsurf MCP - Quick Reference Card

## 🚀 Installation (30 seconds)

```bash
npm install @modelcontextprotocol/sdk
npm run mcp:build
npm run mcp:n8n
```

## 📋 Most Used Commands

### List Templates

```javascript
// All templates (2,057+)
mcp('list_workflow_templates', {});

// By category
mcp('list_workflow_templates', { category: 'AI Agent Development' });

// By complexity
mcp('list_workflow_templates', { complexity: 'medium' });
```

### Create Workflows

```javascript
// From template
mcp('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  workflowName: 'My Workflow',
  activate: true
});

// SEO workflow
mcp('generate_seo_workflow', {
  workflowName: 'SEO Analyzer',
  includeSchemaGeneration: true,
  activate: true
});

// Scraping workflow
mcp('generate_scraping_workflow', {
  workflowName: 'Price Monitor',
  targetUrl: 'https://example.com',
  selectors: { price: '.price', title: '.title' },
  schedule: '0 0 * * *'
});
```

### Schema.org Generation

```javascript
// Organization
mcp('generate_schema_organization', {
  name: 'Company Name',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png'
});

// Product
mcp('generate_schema_product', {
  name: 'Product Name',
  description: 'Description',
  offers: { price: 99.99, priceCurrency: 'USD' }
});

// Article
mcp('generate_schema_article', {
  headline: 'Article Title',
  url: 'https://example.com/article',
  datePublished: '2025-11-01T10:00:00Z',
  author: 'Author Name',
  publisher: { name: 'Publisher' }
});
```

### SEO Analysis

```javascript
// Analyze page
mcp('analyze_page_schema', {
  url: 'https://example.com'
});

// Generate strategy
mcp('generate_seo_strategy', {
  businessType: 'E-commerce',
  industry: 'Technology',
  targetKeywords: ['keyword1', 'keyword2'],
  hasEcommerce: true,
  hasBlog: true
});

// Data mining strategy
mcp('generate_data_mining_strategy', {
  industry: 'SaaS'
});
```

## 📊 Template Categories (2,057 Total)

| Category | Count | Examples |
|----------|-------|----------|
| AI Agent Development | 285 | OpenAI, Claude, Hugging Face |
| Web Scraping | 523 | Advanced scraping, pagination |
| Social Media | 312 | Multi-platform posting |
| E-commerce | 189 | Shopify, order processing |
| Business Automation | 247 | Workflows, scheduling |
| CRM & Sales | 156 | Salesforce, HubSpot |
| Communication | 203 | Slack, Discord, Email |
| Marketing | 178 | Campaigns, analytics |
| Project Management | 145 | Jira, Trello |
| Data Processing | 234 | ETL, analytics |

## 🎯 Common Use Cases

### 1. AI Content Generation

```javascript
const workflow = await mcp('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  activate: true
});

await mcp('execute_workflow', {
  workflowId: workflow.id,
  inputData: { prompt: 'Write about...' }
});
```

### 2. SEO Optimization

```javascript
// Generate schemas
const org = await mcp('generate_schema_organization', {...});
const product = await mcp('generate_schema_product', {...});

// Analyze competitors
const analysis = await mcp('analyze_page_schema', {
  url: 'https://competitor.com'
});
```

### 3. Data Mining

```javascript
const scraper = await mcp('generate_scraping_workflow', {
  workflowName: 'Competitor Monitor',
  targetUrl: 'https://competitor.com/pricing',
  selectors: { price: '.price', features: '.features' },
  schedule: '0 0 * * *'
});
```

### 4. Social Media

```javascript
const social = await mcp('create_workflow_from_template', {
  templateName: 'multiPlatformPosting',
  activate: true
});

await mcp('execute_workflow', {
  workflowId: social.id,
  inputData: {
    content: 'Post content',
    platforms: ['twitter', 'linkedin']
  }
});
```

## 🔍 Schema.org Types

| Schema | Use Case | Priority |
|--------|----------|----------|
| Organization | All sites | High |
| WebPage | All pages | High |
| BreadcrumbList | Navigation | High |
| Product | E-commerce | High |
| Article | Blog posts | Medium |
| LocalBusiness | Physical locations | High |
| FAQ | Q&A pages | Medium |
| VideoObject | Videos | Medium |
| Event | Events | Low |

## ⚡ Quick Wins

### Improve SEO Score

```javascript
// 1. Analyze current state
const current = await mcp('analyze_page_schema', {
  url: 'https://yoursite.com'
});

// 2. Get recommendations
const strategy = await mcp('generate_seo_strategy', {
  businessType: 'Your Type',
  industry: 'Your Industry',
  targetKeywords: ['keyword1', 'keyword2']
});

// 3. Implement schemas
const schemas = await Promise.all([
  mcp('generate_schema_organization', {...}),
  mcp('generate_schema_webpage', {...}),
  mcp('generate_schema_breadcrumblist', {...})
]);
```

### Automate Competitor Monitoring

```javascript
const monitor = await mcp('generate_scraping_workflow', {
  workflowName: 'Daily Competitor Check',
  targetUrl: 'https://competitor.com',
  selectors: {
    prices: '[itemprop="price"]',
    products: '[itemprop="name"]',
    ratings: '[itemprop="ratingValue"]'
  },
  schedule: '0 9 * * *', // 9 AM daily
  activate: true
});
```

### Generate Content at Scale

```javascript
const generator = await mcp('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  activate: true
});

const topics = ['Topic 1', 'Topic 2', 'Topic 3'];
const articles = await Promise.all(
  topics.map(topic =>
    mcp('execute_workflow', {
      workflowId: generator.id,
      inputData: { prompt: `Write about ${topic}` }
    })
  )
);
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP not loading | `npm run mcp:build && npm run mcp:n8n` |
| n8n connection error | Check `N8N_BASE_URL` in `.env` |
| Template not found | Run `mcp('list_workflow_templates', {})` |
| Schema validation | Use Google Rich Results Test |
| Rate limiting | Add delays between requests |

## 📚 Resources

- **Full Guide**: [N8N_WINDSURF_MCP_GUIDE.md](docs/N8N_WINDSURF_MCP_GUIDE.md)
- **Examples**: [N8N_EXAMPLES.md](docs/N8N_EXAMPLES.md)
- **README**: [WINDSURF_N8N_README.md](WINDSURF_N8N_README.md)
- **Setup**: [N8N_MCP_SETUP.md](N8N_MCP_SETUP.md)

## 🎨 Template Quick Reference

### AI Templates
- `openaiContentGenerator` - GPT content generation
- `anthropicChatbot` - Claude chatbot
- `aiAgentWorkflow` - Multi-AI agent system

### SEO Templates
- `seoDataMiner` - Complete SEO analysis
- `schemaGenerator` - Auto Schema.org
- `competitorAnalyzer` - Competitor SEO tracking

### Scraping Templates
- `comprehensiveWebScraper` - Advanced scraping
- `paginationScraper` - Multi-page scraping
- `dynamicContentScraper` - JavaScript-rendered pages

### E-commerce Templates
- `shopifyOrderProcessor` - Order automation
- `inventorySync` - Inventory management
- `productFeedOptimizer` - Product catalog

### Social Templates
- `multiPlatformPosting` - Cross-platform posting
- `contentScheduler` - Scheduled posting
- `analyticsAggregator` - Metrics tracking

## 💡 Pro Tips

1. **Start with templates** - Don't build from scratch
2. **Test before activating** - Use `activate: false` first
3. **Monitor executions** - Check `list_executions` regularly
4. **Validate schemas** - Use Google's Rich Results Test
5. **Batch operations** - Process multiple items in parallel
6. **Use error handling** - Wrap in try/catch blocks
7. **Schedule wisely** - Avoid peak hours for scraping
8. **Keep schemas updated** - Sync with business info changes

## 🔐 Security Checklist

- [ ] API keys in `.env` file
- [ ] `.env` in `.gitignore`
- [ ] HTTPS for production webhooks
- [ ] Input validation on all data
- [ ] Rate limiting configured
- [ ] Credentials rotated regularly
- [ ] Sensitive data encrypted
- [ ] Webhook signatures verified

---

**Quick Start**: `npm install @modelcontextprotocol/sdk && npm run mcp:build && npm run mcp:n8n`

**Need help?** Check [N8N_WINDSURF_MCP_GUIDE.md](docs/N8N_WINDSURF_MCP_GUIDE.md)
