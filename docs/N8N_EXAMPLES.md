# N8N Workflow Examples with Windsurf MCP

This document provides practical, real-world examples of using the n8n MCP server with Windsurf for workflow automation, SEO optimization, and data mining.

## Table of Contents

- [Getting Started](#getting-started)
- [AI Content Generation](#ai-content-generation)
- [SEO Optimization Workflows](#seo-optimization-workflows)
- [Data Mining and Scraping](#data-mining-and-scraping)
- [Social Media Automation](#social-media-automation)
- [E-commerce Automation](#e-commerce-automation)
- [Advanced Use Cases](#advanced-use-cases)

## Getting Started

### Initial Setup

First, ensure your MCP server is running and configured in Windsurf:

```typescript
// In Windsurf/Cursor, the MCP tools are automatically available
// No explicit import needed - just use the tool calls
```

### List Available Templates

```typescript
// See what's available
const templates = await mcp('list_workflow_templates', {});

// Filter by category
const aiTemplates = await mcp('list_workflow_templates', {
  category: 'AI Agent Development'
});

// Filter by complexity
const easyTemplates = await mcp('list_workflow_templates', {
  complexity: 'low'
});
```

## AI Content Generation

### Example 1: Blog Post Generator with OpenAI

```typescript
// Create an AI content generator workflow
const workflow = await mcp('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  workflowName: 'SEO Blog Post Generator',
  activate: true
});

// Execute the workflow to generate content
const execution = await mcp('execute_workflow', {
  workflowId: workflow.id,
  inputData: {
    prompt: `Write a 1500-word SEO-optimized blog post about "Schema.org implementation for e-commerce sites".

    Include:
    - Introduction to Schema.org
    - Benefits for e-commerce
    - Implementation steps
    - Best practices
    - Code examples

    Target keywords: schema.org, e-commerce SEO, structured data, product markup`,
    temperature: 0.7,
    maxTokens: 3000
  }
});

console.log('Content generation started:', execution.id);
```

### Example 2: Claude-Powered Chatbot

```typescript
// Create an Anthropic Claude chatbot
const chatbot = await mcp('create_workflow_from_template', {
  templateName: 'anthropicChatbot',
  workflowName: 'Customer Support Bot',
  activate: true
});

// Send a message to the chatbot
const response = await mcp('execute_workflow', {
  workflowId: chatbot.id,
  inputData: {
    message: 'How do I implement Schema.org on my website?',
    conversationId: 'user-123'
  }
});

console.log('Bot response:', response);
```

## SEO Optimization Workflows

### Example 3: Complete SEO Audit System

```typescript
// Step 1: Generate SEO strategy for your business
const strategy = await mcp('generate_seo_strategy', {
  businessType: 'SaaS Platform',
  industry: 'Web Development Tools',
  targetKeywords: ['web scraping', 'automation tools', 'api integration'],
  hasEcommerce: true,
  hasBlog: true,
  hasLocalPresence: false
});

console.log('SEO Strategy:', strategy);

// Step 2: Create automated SEO workflow
const seoWorkflow = await mcp('generate_seo_workflow', {
  workflowName: 'Weekly SEO Health Check',
  includeSchemaGeneration: true,
  activate: true
});

// Step 3: Run SEO analysis on your site
const analysis = await mcp('execute_workflow', {
  workflowId: seoWorkflow.id,
  inputData: {
    url: 'https://example.com'
  }
});

console.log('SEO Analysis:', analysis);
```

### Example 4: Generate All Required Schemas

```typescript
// Generate Organization schema
const orgSchema = await mcp('generate_schema_organization', {
  name: 'TechCorp Solutions',
  url: 'https://techcorp.com',
  logo: 'https://techcorp.com/images/logo.png',
  description: 'Leading provider of web automation and scraping solutions',
  contactPoint: {
    telephone: '+1-800-TECH-CORP',
    contactType: 'customer service',
    email: 'support@techcorp.com'
  },
  sameAs: [
    'https://twitter.com/techcorp',
    'https://linkedin.com/company/techcorp',
    'https://github.com/techcorp'
  ],
  address: {
    streetAddress: '123 Tech Street',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94105',
    addressCountry: 'US'
  }
});

// Generate Product schema for your main product
const productSchema = await mcp('generate_schema_product', {
  name: 'Web Scraper Pro',
  description: 'Professional web scraping tool with AI-powered data extraction',
  image: [
    'https://techcorp.com/products/scraper-pro-1.jpg',
    'https://techcorp.com/products/scraper-pro-2.jpg'
  ],
  sku: 'WSP-2025-PREMIUM',
  brand: 'TechCorp',
  offers: {
    price: 299.99,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://techcorp.com/buy/scraper-pro'
  },
  aggregateRating: {
    ratingValue: 4.9,
    reviewCount: 342
  },
  review: [
    {
      author: 'John Developer',
      datePublished: '2025-10-15',
      reviewBody: 'Best scraping tool I\'ve ever used. The AI features are incredible!',
      reviewRating: 5
    }
  ]
});

// Generate Article schema for blog posts
const articleSchema = await mcp('generate_schema_article', {
  headline: 'The Ultimate Guide to Web Scraping in 2025',
  url: 'https://techcorp.com/blog/web-scraping-guide-2025',
  image: 'https://techcorp.com/blog/images/scraping-guide.jpg',
  datePublished: '2025-11-01T09:00:00Z',
  dateModified: '2025-11-01T14:30:00Z',
  author: 'Sarah Johnson',
  publisher: {
    name: 'TechCorp Blog',
    logo: 'https://techcorp.com/images/logo.png'
  },
  description: 'Complete guide to modern web scraping techniques, tools, and best practices',
  keywords: ['web scraping', 'data extraction', 'automation', 'python', 'javascript']
});

// Save schemas to files for implementation
console.log('Organization Schema:', JSON.stringify(orgSchema, null, 2));
console.log('Product Schema:', JSON.stringify(productSchema, null, 2));
console.log('Article Schema:', JSON.stringify(articleSchema, null, 2));
```

### Example 5: Competitive SEO Analysis

```typescript
// Analyze your competitors' Schema.org implementation
const competitors = [
  'https://competitor1.com',
  'https://competitor2.com',
  'https://competitor3.com'
];

const analyses = await Promise.all(
  competitors.map(url =>
    mcp('analyze_page_schema', { url })
  )
);

// Compare implementations
analyses.forEach((analysis, index) => {
  console.log(`\n=== Competitor ${index + 1}: ${competitors[index]} ===`);
  console.log(`Schemas found: ${analysis.schemasFound}`);
  console.log(`SEO Score: ${analysis.score.score}/100`);
  console.log(`Schema types:`, analysis.schemas.map(s => s.type));
  console.log(`Recommendations:`, analysis.recommendations);
});

// Identify gaps
const allSchemaTypes = analyses.flatMap(a =>
  a.schemas.map(s => s.type)
);
const uniqueTypes = [...new Set(allSchemaTypes)];
console.log('\nSchema types used by competitors:', uniqueTypes);
```

## Data Mining and Scraping

### Example 6: Product Price Monitor

```typescript
// Create a workflow to monitor competitor prices
const priceMonitor = await mcp('generate_scraping_workflow', {
  workflowName: 'Daily Price Monitor',
  targetUrl: 'https://competitor.com/products',
  selectors: {
    productName: 'h2.product-title',
    currentPrice: 'span.price-current',
    originalPrice: 'span.price-original',
    inStock: 'div.availability',
    rating: 'div.rating span',
    reviewCount: 'span.review-count'
  },
  schedule: '0 0 * * *', // Daily at midnight
  activate: true
});

console.log('Price monitor created:', priceMonitor.id);

// The workflow will:
// 1. Scrape competitor prices daily
// 2. Store in database
// 3. Send alerts if prices change significantly
// 4. Generate trend reports
```

### Example 7: Industry Data Mining

```typescript
// Generate data mining strategy for your industry
const miningStrategy = await mcp('generate_data_mining_strategy', {
  industry: 'E-commerce SaaS'
});

console.log('Data Mining Strategy:', miningStrategy);

// Create workflows based on the strategy
const workflows = [];

// Workflow 1: Extract product catalogs
workflows.push(await mcp('generate_scraping_workflow', {
  workflowName: 'Product Catalog Scraper',
  targetUrl: 'https://directory.example.com/products',
  selectors: {
    title: '[itemprop="name"]',
    description: '[itemprop="description"]',
    price: '[itemprop="price"]',
    availability: '[itemprop="availability"]'
  },
  schedule: '0 */6 * * *', // Every 6 hours
  activate: true
}));

// Workflow 2: Extract business information
workflows.push(await mcp('generate_scraping_workflow', {
  workflowName: 'Business Info Aggregator',
  targetUrl: 'https://directory.example.com/businesses',
  selectors: {
    name: '[itemprop="name"]',
    address: '[itemprop="address"]',
    telephone: '[itemprop="telephone"]',
    website: '[itemprop="url"]',
    rating: '[itemprop="aggregateRating"]'
  },
  schedule: '0 0 * * 0', // Weekly on Sunday
  activate: true
}));

console.log(`Created ${workflows.length} data mining workflows`);
```

### Example 8: Schema.org Data Extraction

```typescript
// Extract structured data from multiple websites
const websites = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
];

const extractedData = await Promise.all(
  websites.map(async url => {
    const analysis = await mcp('analyze_page_schema', { url });

    return {
      url,
      schemas: analysis.schemas,
      score: analysis.score.score,
      // Extract specific data from schemas
      products: analysis.schemas
        .filter(s => s.type === 'Product')
        .map(s => ({
          name: s.name,
          price: s.offers?.price,
          rating: s.aggregateRating?.ratingValue
        })),
      businesses: analysis.schemas
        .filter(s => s.type === 'LocalBusiness')
        .map(s => ({
          name: s.name,
          address: s.address,
          phone: s.telephone
        }))
    };
  })
);

console.log('Extracted structured data:', JSON.stringify(extractedData, null, 2));

// Build a knowledge graph from the data
const knowledgeGraph = {
  products: extractedData.flatMap(d => d.products),
  businesses: extractedData.flatMap(d => d.businesses),
  totalSchemas: extractedData.reduce((sum, d) => sum + d.schemas.length, 0),
  averageScore: extractedData.reduce((sum, d) => sum + d.score, 0) / extractedData.length
};

console.log('Knowledge Graph:', knowledgeGraph);
```

## Social Media Automation

### Example 9: Multi-Platform Content Distribution

```typescript
// Create a social media posting workflow
const socialWorkflow = await mcp('create_workflow_from_template', {
  templateName: 'multiPlatformPosting',
  workflowName: 'Product Launch Campaign',
  activate: true
});

// Post product launch announcement
const post = await mcp('execute_workflow', {
  workflowId: socialWorkflow.id,
  inputData: {
    content: `🚀 Exciting news! We just launched Web Scraper Pro 2.0 with AI-powered data extraction!

✨ New features:
• AI-driven selector generation
• 10x faster scraping
• Built-in proxy rotation
• Advanced Schema.org extraction

Learn more: https://techcorp.com/scraper-pro-2

#WebScraping #DataExtraction #AI #Automation`,
    platforms: ['twitter', 'linkedin', 'facebook']
  }
});

console.log('Posted to social media:', post);
```

### Example 10: Automated Content Scheduling

```typescript
// Create content calendar workflow
const contentCalendar = [
  {
    date: '2025-11-05',
    content: 'Tuesday Tip: How to extract Schema.org data from any website',
    platforms: ['twitter', 'linkedin']
  },
  {
    date: '2025-11-07',
    content: 'Case Study: How Company X increased organic traffic by 300% with Schema.org',
    platforms: ['linkedin', 'facebook']
  },
  {
    date: '2025-11-10',
    content: 'Weekend Reading: The Ultimate Guide to Web Scraping in 2025',
    platforms: ['twitter']
  }
];

// Schedule posts
for (const post of contentCalendar) {
  await mcp('execute_workflow', {
    workflowId: socialWorkflow.id,
    inputData: post
  });
  console.log(`Scheduled post for ${post.date}`);
}
```

## E-commerce Automation

### Example 11: Product Feed Optimization

```typescript
// Generate optimized product schemas for entire catalog
const products = [
  {
    id: 1,
    name: 'Web Scraper Basic',
    price: 99.99,
    description: 'Entry-level web scraping tool',
    rating: 4.5,
    reviews: 89
  },
  {
    id: 2,
    name: 'Web Scraper Pro',
    price: 299.99,
    description: 'Professional web scraping with AI',
    rating: 4.9,
    reviews: 342
  }
];

const productSchemas = await Promise.all(
  products.map(product =>
    mcp('generate_schema_product', {
      name: product.name,
      description: product.description,
      sku: `WSP-${product.id}`,
      brand: 'TechCorp',
      offers: {
        price: product.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `https://techcorp.com/products/${product.id}`
      },
      aggregateRating: {
        ratingValue: product.rating,
        reviewCount: product.reviews
      }
    })
  )
);

console.log('Generated schemas for', productSchemas.length, 'products');
```

### Example 12: Order Processing Automation

```typescript
// Create Shopify order processor
const orderProcessor = await mcp('create_workflow_from_template', {
  templateName: 'shopifyOrderProcessor',
  workflowName: 'Automated Fulfillment Pipeline',
  activate: true
});

// The workflow automatically:
// - Receives new order webhook
// - Validates order data
// - Updates inventory
// - Sends customer confirmation email
// - Notifies fulfillment team via Slack
// - Updates order tracking
// - Sends shipping notification

console.log('Order processor activated:', orderProcessor.id);
```

## Advanced Use Cases

### Example 13: Complete SEO Automation Pipeline

```typescript
// Create a comprehensive SEO automation system

// Step 1: Content generation
const contentGen = await mcp('create_workflow_from_template', {
  templateName: 'openaiContentGenerator',
  workflowName: 'AI Blog Writer',
  activate: true
});

// Step 2: Schema generation
const schemaGen = await mcp('generate_seo_workflow', {
  workflowName: 'Auto Schema Generator',
  includeSchemaGeneration: true,
  activate: true
});

// Step 3: Competitor monitoring
const competitorMonitor = await mcp('generate_scraping_workflow', {
  workflowName: 'Competitor SEO Monitor',
  targetUrl: 'https://competitor.com',
  selectors: {
    schemas: 'script[type="application/ld+json"]',
    title: 'title',
    meta: 'meta[name="description"]',
    headings: 'h1, h2, h3'
  },
  schedule: '0 0 * * 0', // Weekly
  activate: true
});

// Step 4: Performance tracking
console.log('SEO automation pipeline created');
console.log('- Content Generator:', contentGen.id);
console.log('- Schema Generator:', schemaGen.id);
console.log('- Competitor Monitor:', competitorMonitor.id);
```

### Example 14: Real-time Data Enrichment

```typescript
// Create a workflow that enriches incoming data with Schema.org
const enrichmentWorkflow = {
  name: 'Real-time Data Enrichment',
  nodes: [
    // Webhook trigger
    {
      id: 'webhook',
      type: 'n8n-nodes-base.webhook',
      name: 'Data Input',
      parameters: {
        path: 'enrich-data',
        httpMethod: 'POST'
      }
    },
    // Extract company info
    {
      id: 'extract',
      type: 'n8n-nodes-base.function',
      name: 'Extract Info',
      parameters: {
        functionCode: `
          const data = $input.first().json;
          return [{
            json: {
              company: data.companyName,
              website: data.website,
              industry: data.industry
            }
          }];
        `
      }
    },
    // Fetch and analyze schema
    {
      id: 'analyze',
      type: 'n8n-nodes-base.httpRequest',
      name: 'Analyze Schema',
      parameters: {
        method: 'GET',
        url: '={{ $json.website }}'
      }
    },
    // Generate enriched response
    {
      id: 'enrich',
      type: 'n8n-nodes-base.function',
      name: 'Enrich Data',
      parameters: {
        functionCode: `
          // Extract Schema.org data from HTML
          const html = $input.first().json.data;
          const schemaMatches = html.match(/<script[^>]*type="application\\/ld\\+json"[^>]*>([\\s\\S]*?)<\\/script>/g) || [];

          const enrichedData = {
            original: $('extract').item.json,
            schemas: schemaMatches.map(m => {
              const json = m.match(/>([\\s\\S]*?)</)[1];
              try {
                return JSON.parse(json);
              } catch {
                return null;
              }
            }).filter(Boolean),
            timestamp: new Date().toISOString()
          };

          return [{ json: enrichedData }];
        `
      }
    }
  ],
  connections: {
    webhook: { main: [['extract']] },
    extract: { main: [['analyze']] },
    analyze: { main: [['enrich']] }
  }
};

const workflow = await mcp('create_workflow', {
  name: enrichmentWorkflow.name,
  nodes: enrichmentWorkflow.nodes,
  connections: enrichmentWorkflow.connections,
  active: true
});

console.log('Data enrichment workflow created:', workflow.id);
```

### Example 15: AI-Powered SEO Content Workflow

```typescript
// Complete AI-driven SEO content creation pipeline

// Step 1: Generate SEO strategy
const strategy = await mcp('generate_seo_strategy', {
  businessType: 'Technology Blog',
  industry: 'Web Development',
  targetKeywords: ['n8n automation', 'workflow automation', 'no-code tools'],
  hasBlog: true
});

// Step 2: Generate content using AI
const content = await mcp('execute_workflow', {
  workflowId: contentGenWorkflowId, // From previous example
  inputData: {
    prompt: `Write an SEO-optimized article about "${strategy.contentStrategy[0]}"

    Target keywords: ${strategy.contentStrategy.join(', ')}
    Word count: 2000-2500 words
    Include: Introduction, main sections with H2/H3 headings, conclusion
    Tone: Professional but approachable
    `,
    temperature: 0.7
  }
});

// Step 3: Generate appropriate schemas
const articleSchema = await mcp('generate_schema_article', {
  headline: 'The extracted title from AI content',
  url: 'https://yourblog.com/articles/new-article',
  datePublished: new Date().toISOString(),
  author: 'AI Content Team',
  publisher: {
    name: 'Your Blog',
    logo: 'https://yourblog.com/logo.png'
  },
  keywords: strategy.contentStrategy
});

// Step 4: Publish and monitor
console.log('Complete SEO content package created:');
console.log('- Strategy:', strategy);
console.log('- Content:', content);
console.log('- Schema:', articleSchema);
```

## Tips and Tricks

### Performance Optimization

```typescript
// Batch operations for better performance
const urls = [/* array of 100 URLs */];
const batchSize = 10;

for (let i = 0; i < urls.length; i += batchSize) {
  const batch = urls.slice(i, i + batchSize);
  const analyses = await Promise.all(
    batch.map(url => mcp('analyze_page_schema', { url }))
  );
  console.log(`Processed batch ${i / batchSize + 1}`);
  // Small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Error Handling

```typescript
// Robust error handling
try {
  const workflow = await mcp('create_workflow_from_template', {
    templateName: 'openaiContentGenerator',
    workflowName: 'Content Gen',
    activate: true
  });

  const execution = await mcp('execute_workflow', {
    workflowId: workflow.id,
    inputData: { prompt: 'Generate content...' }
  });

  console.log('Success:', execution);
} catch (error) {
  console.error('Workflow error:', error.message);

  // Fallback strategy
  console.log('Trying alternative template...');
  // Implement fallback logic
}
```

### Monitoring and Logging

```typescript
// Set up monitoring for workflows
const workflows = await mcp('list_workflows', {});

for (const workflow of workflows.data) {
  const executions = await mcp('list_executions', {
    workflowId: workflow.id,
    limit: 10
  });

  const stats = {
    name: workflow.name,
    totalExecutions: executions.data.length,
    successRate: executions.data.filter(e => e.finished && !e.stoppedAt).length / executions.data.length * 100,
    lastExecution: executions.data[0]?.startedAt
  };

  console.log('Workflow Stats:', stats);
}
```

## Next Steps

1. Explore the complete [N8N Windsurf MCP Guide](./N8N_WINDSURF_MCP_GUIDE.md)
2. Review the [API Reference](./N8N_WINDSURF_MCP_GUIDE.md#api-reference)
3. Check out workflow templates in `/src/mcp/workflow-templates.ts`
4. Learn about Schema.org tools in `/src/mcp/schema-org-tools.ts`

Happy automating! 🚀
