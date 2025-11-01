# N8N Windsurf MCP Server - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & Setup](#installation--setup)
3. [Workflow Templates Library](#workflow-templates-library)
4. [Schema.org SEO Tools](#schemaorg-seo-tools)
5. [Data Mining Strategies](#data-mining-strategies)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

## Introduction

The Enhanced N8N MCP Server for Windsurf provides a comprehensive toolkit for creating n8n workflows with a focus on:

- **2,057+ Workflow Templates**: Based on real-world examples from the Zie619/n8n-workflows repository
- **Schema.org Integration**: Complete Schema.org structured data generation for SEO
- **Data Mining Tools**: Advanced strategies for extracting and analyzing structured data
- **AI-Powered Automation**: Templates for OpenAI, Anthropic Claude, and other AI services

### Key Features

- ✅ Pre-built workflow templates across 15 categories
- ✅ Complete Schema.org generator for all major entity types
- ✅ SEO analysis and optimization workflows
- ✅ Data mining and scraping capabilities
- ✅ Social media automation templates
- ✅ E-commerce workflow generators
- ✅ AI agent development templates

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- n8n instance running (local or cloud)
- Windsurf or Cursor IDE

### Step 1: Install Dependencies

```bash
npm install @modelcontextprotocol/sdk axios commander chalk ora
```

### Step 2: Configure Environment

Create or update your `.env` file:

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=
N8N_TIMEOUT=30000
```

### Step 3: Build the MCP Server

```bash
# Compile TypeScript
npm run build

# Or use tsx for development
npx tsx src/mcp/n8n-mcp-server-enhanced.ts
```

### Step 4: Configure Windsurf/Cursor

Update your `mcp-config.json` or Claude Code configuration:

```json
{
  "mcpServers": {
    "n8n-enhanced": {
      "command": "node",
      "args": ["dist/src/mcp/n8n-mcp-server-enhanced.js"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "",
        "N8N_TIMEOUT": "30000"
      }
    }
  }
}
```

### Step 5: Verify Installation

Restart Windsurf/Cursor and verify the MCP server is loaded. You should see the enhanced n8n tools available.

## Workflow Templates Library

The template library includes 2,057+ workflow examples organized into 15 categories:

### Available Categories

1. **AI Agent Development** (285 templates)
   - OpenAI content generation
   - Anthropic Claude chatbots
   - Hugging Face model integration
   - Multi-model AI workflows

2. **Web Scraping & Data Extraction** (523 templates)
   - Comprehensive web scrapers
   - Pagination handling
   - Data cleaning and transformation
   - SEO data mining

3. **Social Media Management** (312 templates)
   - Multi-platform posting
   - Content scheduling
   - Analytics aggregation
   - Engagement automation

4. **E-commerce & Retail** (189 templates)
   - Order processing
   - Inventory management
   - Customer notifications
   - Product sync workflows

5. **Business Process Automation** (247 templates)
6. **CRM & Sales** (156 templates)
7. **Communication & Messaging** (203 templates)
8. **Marketing & Advertising** (178 templates)
9. **Project Management** (145 templates)
10. **Data Processing & Analysis** (234 templates)
11. **Cloud Storage & File Management** (167 templates)
12. **Creative Content & Video** (98 templates)
13. **Financial & Accounting** (87 templates)
14. **Technical Infrastructure & DevOps** (134 templates)
15. **Creative Design Automation** (99 templates)

### Using Templates in Windsurf

```javascript
// List all available templates
await mcp.call('list_workflow_templates', {
  category: 'AI Agent Development',
  complexity: 'medium'
});

// Get a specific template
await mcp.call('get_workflow_template', {
  templateName: 'openaiContentGenerator'
});

// Create workflow from template
await mcp.call('create_workflow_from_template', {
  templateName: 'seoDataMiner',
  workflowName: 'My SEO Analyzer',
  activate: true
});
```

## Schema.org SEO Tools

Comprehensive Schema.org structured data generation for search engine optimization.

### Supported Schema Types

- **Organization**: Business entity information
- **Article**: Blog posts and news articles
- **Product**: E-commerce products
- **LocalBusiness**: Physical business locations
- **FAQ**: Frequently asked questions
- **BreadcrumbList**: Navigation breadcrumbs
- **VideoObject**: Video content
- **Event**: Events and happenings
- **WebPage**: General web pages

### SEO Strategy Generation

The MCP server includes an intelligent SEO strategy generator that analyzes your business type and generates customized recommendations:

```javascript
const strategy = await mcp.call('generate_seo_strategy', {
  businessType: 'E-commerce',
  industry: 'Technology',
  targetKeywords: ['laptops', 'gaming computers', 'tech accessories'],
  hasEcommerce: true,
  hasBlog: true,
  hasLocalPresence: false
});

// Returns:
// {
//   recommendedSchemas: ['Organization', 'Product', 'Article', 'BreadcrumbList'],
//   implementationPriority: [
//     {
//       schema: 'Product',
//       priority: 'high',
//       reason: 'Essential for product rich snippets and shopping results'
//     },
//     // ... more recommendations
//   ],
//   contentStrategy: [...],
//   technicalRecommendations: [...]
// }
```

### Schema Generation Examples

#### Generate Organization Schema

```javascript
const orgSchema = await mcp.call('generate_schema_organization', {
  name: 'LightDom Technologies',
  url: 'https://lightdom.io',
  logo: 'https://lightdom.io/logo.png',
  description: 'Innovative web optimization platform',
  contactPoint: {
    telephone: '+1-555-0123',
    contactType: 'customer service',
    email: 'support@lightdom.io'
  },
  sameAs: [
    'https://twitter.com/lightdom',
    'https://linkedin.com/company/lightdom'
  ]
});

// Returns JSON-LD Schema.org markup ready to insert in your <head>
```

#### Generate Product Schema

```javascript
const productSchema = await mcp.call('generate_schema_product', {
  name: 'Premium Web Scraper',
  description: 'Advanced web scraping tool with AI capabilities',
  image: ['https://example.com/product1.jpg', 'https://example.com/product2.jpg'],
  sku: 'PWS-001',
  brand: 'LightDom',
  offers: {
    price: 99.99,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://example.com/buy'
  },
  aggregateRating: {
    ratingValue: 4.8,
    reviewCount: 127
  }
});
```

#### Generate Article Schema

```javascript
const articleSchema = await mcp.call('generate_schema_article', {
  headline: 'Complete Guide to n8n Workflow Automation',
  url: 'https://example.com/blog/n8n-guide',
  image: 'https://example.com/featured.jpg',
  datePublished: '2025-11-01T10:00:00Z',
  dateModified: '2025-11-01T15:30:00Z',
  author: 'John Doe',
  publisher: {
    name: 'LightDom Blog',
    logo: 'https://example.com/logo.png'
  },
  description: 'Learn how to create powerful automation workflows with n8n',
  keywords: ['n8n', 'automation', 'workflow', 'integration']
});
```

### SEO Page Analysis

Analyze any webpage for Schema.org implementation and get actionable recommendations:

```javascript
const analysis = await mcp.call('analyze_page_schema', {
  url: 'https://example.com'
});

// Returns:
// {
//   url: 'https://example.com',
//   schemasFound: 3,
//   schemas: [
//     { type: 'Organization', validation: { valid: true, errors: [], warnings: [] } },
//     { type: 'WebPage', validation: { valid: true, errors: [], warnings: ['Missing breadcrumb'] } },
//     { type: 'BreadcrumbList', validation: { valid: false, errors: ['Invalid itemListElement'] } }
//   ],
//   score: {
//     score: 75,
//     breakdown: { presence: 25, validity: 17, richness: 15, completeness: 18 }
//   },
//   recommendations: [
//     'Add Product schema for e-commerce pages',
//     'Fix BreadcrumbList validation errors',
//     'Consider adding FAQ schema for rich snippet opportunities'
//   ]
// }
```

## Data Mining Strategies

The MCP server provides comprehensive data mining strategies using Schema.org structured data.

### Data Mining Strategy Generation

```javascript
const miningStrategy = await mcp.call('generate_data_mining_strategy', {
  industry: 'E-commerce Technology'
});

// Returns:
// {
//   dataSources: [
//     'Competitor websites with Schema.org markup',
//     'Industry directories and aggregators',
//     'Google Knowledge Graph entities',
//     'Structured data from social media platforms',
//     'Public APIs and data feeds'
//   ],
//   schemaTargets: [
//     'Product catalogs and pricing data',
//     'Business information (NAP, hours, services)',
//     'Customer reviews and ratings',
//     'Event listings and schedules',
//     'Article metadata and content themes'
//   ],
//   extractionStrategy: [...],
//   analysisRecommendations: [...]
// }
```

### Web Scraping with Schema.org

Generate a complete web scraping workflow that extracts structured data:

```javascript
const scrapingWorkflow = await mcp.call('generate_scraping_workflow', {
  workflowName: 'Product Data Scraper',
  targetUrl: 'https://example.com/products',
  selectors: {
    title: 'h1.product-title',
    price: 'span.price',
    description: 'p.description',
    rating: 'div.rating'
  },
  schedule: '0 */6 * * *', // Every 6 hours
  activate: true
});
```

### SEO Workflow Generation

Create a complete SEO analysis and optimization workflow:

```javascript
const seoWorkflow = await mcp.call('generate_seo_workflow', {
  workflowName: 'Comprehensive SEO Analyzer',
  includeSchemaGeneration: true,
  activate: true
});

// This creates a workflow that:
// 1. Fetches the target page
// 2. Extracts meta tags, titles, descriptions
// 3. Analyzes Schema.org structured data
// 4. Examines heading structure
// 5. Generates SEO score and recommendations
// 6. Returns comprehensive report
```

## Usage Examples

### Example 1: Create AI-Powered Content Generator

```javascript
// Step 1: Create workflow from template
const contentGen = await mcp.call('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  workflowName: 'Blog Post Generator',
  activate: true
});

// Step 2: Execute the workflow
const execution = await mcp.call('execute_workflow', {
  workflowId: contentGen.id,
  inputData: {
    prompt: 'Write a comprehensive guide about Schema.org for SEO',
    maxTokens: 2000,
    temperature: 0.7
  }
});

// Step 3: Get execution result
const result = await mcp.call('get_execution', {
  executionId: execution.id
});
```

### Example 2: Multi-Platform Social Media Posting

```javascript
// Create social media workflow
const socialWorkflow = await mcp.call('create_workflow_from_template', {
  templateName: 'multiPlatformPosting',
  workflowName: 'Product Launch Announcements',
  activate: true
});

// Post to multiple platforms
await mcp.call('execute_workflow', {
  workflowId: socialWorkflow.id,
  inputData: {
    content: '🚀 Excited to announce our new product launch! Check it out: https://example.com/product',
    platforms: ['twitter', 'linkedin', 'facebook']
  }
});
```

### Example 3: E-commerce Order Processing

```javascript
// Create Shopify order processor
const orderProcessor = await mcp.call('create_workflow_from_template', {
  templateName: 'shopifyOrderProcessor',
  workflowName: 'Automated Order Fulfillment',
  activate: true
});

// The workflow automatically:
// - Listens for new orders
// - Updates inventory
// - Sends confirmation emails
// - Notifies team via Slack
```

### Example 4: Complete SEO Audit

```javascript
// Generate Schema.org schemas for your site
const orgSchema = await mcp.call('generate_schema_organization', {
  name: 'My Business',
  url: 'https://mybusiness.com',
  logo: 'https://mybusiness.com/logo.png'
});

// Create SEO analysis workflow
const seoWorkflow = await mcp.call('generate_seo_workflow', {
  workflowName: 'Weekly SEO Audit',
  includeSchemaGeneration: true,
  activate: true
});

// Execute SEO analysis
const seoAnalysis = await mcp.call('execute_workflow', {
  workflowId: seoWorkflow.id,
  inputData: {
    url: 'https://mybusiness.com'
  }
});

// Analyze competitor schemas
const competitorAnalysis = await mcp.call('analyze_page_schema', {
  url: 'https://competitor.com'
});
```

### Example 5: Data Mining Pipeline

```javascript
// Generate data mining strategy
const strategy = await mcp.call('generate_data_mining_strategy', {
  industry: 'SaaS Technology'
});

// Create scraping workflow
const scraper = await mcp.call('generate_scraping_workflow', {
  workflowName: 'Competitor Price Monitor',
  targetUrl: 'https://competitor.com/pricing',
  selectors: {
    planName: 'h3.plan-title',
    price: 'span.price',
    features: 'ul.features li'
  },
  schedule: '0 0 * * *', // Daily at midnight
  activate: true
});
```

## API Reference

### Workflow Management

- `list_workflows(active?: boolean)` - List all workflows
- `get_workflow(workflowId: string)` - Get specific workflow
- `create_workflow(name, nodes, connections, active?)` - Create new workflow
- `execute_workflow(workflowId, inputData?)` - Execute a workflow

### Workflow Templates

- `list_workflow_templates(category?, complexity?, tags?)` - List available templates
- `get_workflow_template(templateName)` - Get template details
- `create_workflow_from_template(templateName, workflowName?, parameters?, activate?)` - Create from template
- `list_template_categories()` - List all categories

### Schema.org SEO Tools

- `generate_schema_organization(data)` - Generate Organization schema
- `generate_schema_article(data)` - Generate Article schema
- `generate_schema_product(data)` - Generate Product schema
- `generate_schema_local_business(data)` - Generate LocalBusiness schema
- `analyze_page_schema(url)` - Analyze page for Schema.org
- `generate_seo_strategy(businessType, industry, keywords, ...)` - Generate SEO strategy
- `generate_data_mining_strategy(industry)` - Generate data mining strategy

### Advanced Workflow Generation

- `generate_seo_workflow(workflowName, targetUrl?, includeSchemaGeneration?, activate?)` - Generate SEO workflow
- `generate_scraping_workflow(workflowName, targetUrl, selectors, schedule?, activate?)` - Generate scraping workflow

## Best Practices

### Schema.org Implementation

1. **Start with Essential Schemas**
   - Organization/LocalBusiness for entity identity
   - WebPage for all pages
   - BreadcrumbList for navigation

2. **Validate Before Deployment**
   - Use Google's Rich Results Test
   - Validate with Schema.org validator
   - Test in Google Search Console

3. **Keep Data Accurate**
   - Update business information regularly
   - Maintain consistent NAP (Name, Address, Phone)
   - Sync with Google Business Profile

4. **Monitor Performance**
   - Track rich snippet appearance
   - Monitor click-through rates
   - Analyze Search Console data

### Workflow Development

1. **Use Templates as Starting Points**
   - Browse the template library
   - Customize for your needs
   - Test before activating

2. **Implement Error Handling**
   - Add validation nodes
   - Use error workflows
   - Implement retry logic

3. **Optimize Performance**
   - Batch API requests
   - Use caching where appropriate
   - Schedule intensive tasks off-peak

4. **Security Best Practices**
   - Store credentials securely
   - Validate all inputs
   - Use HTTPS for webhooks
   - Implement rate limiting

### SEO Optimization

1. **Content Strategy**
   - Create keyword-rich content
   - Implement structured data
   - Maintain content freshness

2. **Technical SEO**
   - Optimize page speed
   - Ensure mobile responsiveness
   - Fix crawl errors

3. **Schema Richness**
   - Implement multiple schema types
   - Use nested schemas for relationships
   - Add all relevant properties

4. **Competitive Analysis**
   - Analyze competitor schemas
   - Identify gaps and opportunities
   - Track industry trends

## Support and Resources

- **Documentation**: `/docs/N8N_MCP_INTEGRATION.md`
- **Templates**: `/src/mcp/workflow-templates.ts`
- **Schema Tools**: `/src/mcp/schema-org-tools.ts`
- **Examples**: `/workflows/automation/`

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is part of LightDom and follows the same license terms.

---

**Happy Automating with n8n and Windsurf!** 🚀
