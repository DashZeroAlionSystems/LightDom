/**
 * N8N Workflow Templates Library
 *
 * Based on analysis of 2,057 n8n workflows from Zie619/n8n-workflows
 * Provides pre-built workflow templates for common automation tasks
 */

export interface WorkflowTemplate {
  name: string;
  description: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  nodes: any[];
  connections: any;
  tags: string[];
  requiredCredentials?: string[];
}

export class WorkflowTemplateLibrary {
  /**
   * AI Agent Development Templates
   */
  static aiAgentTemplates = {
    openaiContentGenerator: {
      name: "OpenAI Content Generator",
      description: "Generate content using OpenAI GPT models with webhook trigger",
      category: "AI Agent Development",
      complexity: "medium" as const,
      tags: ["openai", "ai", "content-generation", "webhook"],
      requiredCredentials: ["openAi"],
      nodes: [
        {
          id: "webhook-trigger",
          type: "n8n-nodes-base.webhook",
          name: "Webhook Trigger",
          parameters: {
            httpMethod: "POST",
            path: "ai-content",
            responseMode: "responseNode"
          },
          position: [100, 200]
        },
        {
          id: "openai",
          type: "n8n-nodes-base.openAi",
          name: "OpenAI GPT",
          parameters: {
            resource: "text",
            operation: "complete",
            model: "gpt-4",
            prompt: "={{ $json.prompt }}",
            temperature: 0.7,
            maxTokens: 2000
          },
          position: [300, 200]
        },
        {
          id: "format-response",
          type: "n8n-nodes-base.function",
          name: "Format Response",
          parameters: {
            functionCode: `const response = $input.first().json;
return [{
  json: {
    success: true,
    content: response.choices[0].text,
    model: response.model,
    usage: response.usage,
    timestamp: new Date().toISOString()
  }
}];`
          },
          position: [500, 200]
        },
        {
          id: "response",
          type: "n8n-nodes-base.respondToWebhook",
          name: "Response",
          parameters: {
            respondWith: "json",
            responseBody: "={{ JSON.stringify($json) }}"
          },
          position: [700, 200]
        }
      ],
      connections: {
        "webhook-trigger": { main: [["openai"]] },
        "openai": { main: [["format-response"]] },
        "format-response": { main: [["response"]] }
      }
    },

    anthropicChatbot: {
      name: "Anthropic Claude Chatbot",
      description: "Interactive chatbot using Anthropic Claude API",
      category: "AI Agent Development",
      complexity: "medium" as const,
      tags: ["anthropic", "claude", "chatbot", "ai"],
      requiredCredentials: ["anthropicApi"],
      nodes: [
        {
          id: "webhook",
          type: "n8n-nodes-base.webhook",
          name: "Webhook",
          parameters: {
            httpMethod: "POST",
            path: "claude-chat",
            responseMode: "responseNode"
          },
          position: [100, 200]
        },
        {
          id: "validate-input",
          type: "n8n-nodes-base.function",
          name: "Validate Input",
          parameters: {
            functionCode: `const { message, conversationId } = $input.first().json;
if (!message) throw new Error('Message is required');
return [{
  json: { message, conversationId: conversationId || 'new', timestamp: Date.now() }
}];`
          },
          position: [300, 200]
        },
        {
          id: "http-request",
          type: "n8n-nodes-base.httpRequest",
          name: "Claude API",
          parameters: {
            method: "POST",
            url: "https://api.anthropic.com/v1/messages",
            authentication: "predefinedCredentialType",
            nodeCredentialType: "anthropicApi",
            sendHeaders: true,
            headerParameters: {
              parameters: [
                { name: "anthropic-version", value: "2023-06-01" }
              ]
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: "model", value: "claude-3-5-sonnet-20241022" },
                { name: "max_tokens", value: "4096" },
                {
                  name: "messages",
                  value: `={{ [{ role: 'user', content: $json.message }] }}`
                }
              ]
            }
          },
          position: [500, 200]
        },
        {
          id: "response",
          type: "n8n-nodes-base.respondToWebhook",
          name: "Response",
          parameters: {
            respondWith: "json",
            responseBody: "={{ JSON.stringify($json) }}"
          },
          position: [700, 200]
        }
      ],
      connections: {
        "webhook": { main: [["validate-input"]] },
        "validate-input": { main: [["http-request"]] },
        "http-request": { main: [["response"]] }
      }
    }
  };

  /**
   * Web Scraping & Data Extraction Templates
   */
  static webScrapingTemplates = {
    comprehensiveWebScraper: {
      name: "Comprehensive Web Scraper",
      description: "Advanced web scraping with pagination, data extraction, and storage",
      category: "Web Scraping & Data Extraction",
      complexity: "high" as const,
      tags: ["scraping", "data-extraction", "pagination", "database"],
      nodes: [
        {
          id: "schedule",
          type: "n8n-nodes-base.scheduleTrigger",
          name: "Schedule Trigger",
          parameters: {
            rule: {
              interval: [{ field: "hours", hoursInterval: 6 }]
            }
          },
          position: [100, 200]
        },
        {
          id: "http-request",
          type: "n8n-nodes-base.httpRequest",
          name: "Fetch Page",
          parameters: {
            method: "GET",
            url: "={{ $json.targetUrl }}",
            options: {
              redirect: { redirect: { followRedirects: true } },
              timeout: 30000
            }
          },
          position: [300, 200]
        },
        {
          id: "html-extract",
          type: "n8n-nodes-base.htmlExtract",
          name: "Extract Data",
          parameters: {
            sourceData: "html",
            dataPropertyName: "data",
            extractionValues: {
              values: [
                {
                  key: "title",
                  cssSelector: "h1.title",
                  returnValue: "text"
                },
                {
                  key: "description",
                  cssSelector: "p.description",
                  returnValue: "text"
                },
                {
                  key: "price",
                  cssSelector: "span.price",
                  returnValue: "text"
                },
                {
                  key: "image",
                  cssSelector: "img.product-image",
                  returnValue: "attribute",
                  attribute: "src"
                }
              ]
            }
          },
          position: [500, 200]
        },
        {
          id: "clean-data",
          type: "n8n-nodes-base.function",
          name: "Clean Data",
          parameters: {
            functionCode: `const item = $input.first().json;
return [{
  json: {
    title: item.title?.trim(),
    description: item.description?.trim(),
    price: parseFloat(item.price?.replace(/[^0-9.]/g, '')),
    image: item.image,
    scrapedAt: new Date().toISOString()
  }
}];`
          },
          position: [700, 200]
        },
        {
          id: "postgres",
          type: "n8n-nodes-base.postgres",
          name: "Save to Database",
          parameters: {
            operation: "insert",
            table: "scraped_products",
            columns: "title,description,price,image,scraped_at",
            returnFields: "*"
          },
          position: [900, 200]
        }
      ],
      connections: {
        "schedule": { main: [["http-request"]] },
        "http-request": { main: [["html-extract"]] },
        "html-extract": { main: [["clean-data"]] },
        "clean-data": { main: [["postgres"]] }
      }
    },

    seoDataMiner: {
      name: "SEO Data Mining Workflow",
      description: "Extract SEO metadata, structured data, and performance metrics",
      category: "Web Scraping & Data Extraction",
      complexity: "high" as const,
      tags: ["seo", "data-mining", "schema-org", "structured-data"],
      nodes: [
        {
          id: "webhook",
          type: "n8n-nodes-base.webhook",
          name: "Webhook",
          parameters: {
            httpMethod: "POST",
            path: "seo-analyze",
            responseMode: "responseNode"
          },
          position: [100, 300]
        },
        {
          id: "fetch-page",
          type: "n8n-nodes-base.httpRequest",
          name: "Fetch Page",
          parameters: {
            method: "GET",
            url: "={{ $json.url }}",
            options: {
              timeout: 30000,
              redirect: { followRedirects: true }
            }
          },
          position: [300, 300]
        },
        {
          id: "extract-meta",
          type: "n8n-nodes-base.htmlExtract",
          name: "Extract Meta Tags",
          parameters: {
            sourceData: "html",
            dataPropertyName: "data",
            extractionValues: {
              values: [
                { key: "title", cssSelector: "title", returnValue: "text" },
                { key: "metaDescription", cssSelector: "meta[name='description']", returnValue: "attribute", attribute: "content" },
                { key: "metaKeywords", cssSelector: "meta[name='keywords']", returnValue: "attribute", attribute: "content" },
                { key: "ogTitle", cssSelector: "meta[property='og:title']", returnValue: "attribute", attribute: "content" },
                { key: "ogDescription", cssSelector: "meta[property='og:description']", returnValue: "attribute", attribute: "content" },
                { key: "ogImage", cssSelector: "meta[property='og:image']", returnValue: "attribute", attribute: "content" },
                { key: "canonicalUrl", cssSelector: "link[rel='canonical']", returnValue: "attribute", attribute: "href" }
              ]
            }
          },
          position: [500, 200]
        },
        {
          id: "extract-schema",
          type: "n8n-nodes-base.function",
          name: "Extract Schema.org",
          parameters: {
            functionCode: `const html = $input.first().json.data;
const schemaRegex = /<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi;
const schemas = [];
let match;

while ((match = schemaRegex.exec(html)) !== null) {
  try {
    const schema = JSON.parse(match[1]);
    schemas.push(schema);
  } catch (e) {
    // Invalid JSON, skip
  }
}

return [{
  json: {
    schemas,
    schemaTypes: schemas.map(s => s['@type']).filter(Boolean),
    hasOrganization: schemas.some(s => s['@type'] === 'Organization'),
    hasWebPage: schemas.some(s => s['@type'] === 'WebPage'),
    hasProduct: schemas.some(s => s['@type'] === 'Product'),
    hasArticle: schemas.some(s => s['@type'] === 'Article'),
    count: schemas.length
  }
}];`
          },
          position: [500, 300]
        },
        {
          id: "analyze-headings",
          type: "n8n-nodes-base.htmlExtract",
          name: "Analyze Headings",
          parameters: {
            sourceData: "html",
            dataPropertyName: "data",
            extractionValues: {
              values: [
                { key: "h1", cssSelector: "h1", returnValue: "text", returnArray: true },
                { key: "h2", cssSelector: "h2", returnValue: "text", returnArray: true },
                { key: "h3", cssSelector: "h3", returnValue: "text", returnArray: true }
              ]
            }
          },
          position: [500, 400]
        },
        {
          id: "merge",
          type: "n8n-nodes-base.merge",
          name: "Merge Analysis",
          parameters: {
            mode: "combine",
            combineBy: "combineAll"
          },
          position: [700, 300]
        },
        {
          id: "generate-report",
          type: "n8n-nodes-base.function",
          name: "Generate SEO Report",
          parameters: {
            functionCode: `const items = $input.all();
const meta = items.find(i => i.json.title);
const schema = items.find(i => i.json.schemas);
const headings = items.find(i => i.json.h1);

const report = {
  url: $('webhook').item.json.url,
  timestamp: new Date().toISOString(),

  metadata: {
    title: meta?.json.title || null,
    titleLength: meta?.json.title?.length || 0,
    description: meta?.json.metaDescription || null,
    descriptionLength: meta?.json.metaDescription?.length || 0,
    keywords: meta?.json.metaKeywords || null,
    canonical: meta?.json.canonicalUrl || null
  },

  openGraph: {
    title: meta?.json.ogTitle || null,
    description: meta?.json.ogDescription || null,
    image: meta?.json.ogImage || null
  },

  structuredData: {
    count: schema?.json.count || 0,
    types: schema?.json.schemaTypes || [],
    hasOrganization: schema?.json.hasOrganization || false,
    hasWebPage: schema?.json.hasWebPage || false,
    hasProduct: schema?.json.hasProduct || false,
    hasArticle: schema?.json.hasArticle || false,
    schemas: schema?.json.schemas || []
  },

  headings: {
    h1Count: headings?.json.h1?.length || 0,
    h1: headings?.json.h1 || [],
    h2Count: headings?.json.h2?.length || 0,
    h3Count: headings?.json.h3?.length || 0
  },

  issues: [],
  warnings: [],
  recommendations: []
};

// Analyze issues
if (!report.metadata.title) report.issues.push('Missing page title');
if (report.metadata.titleLength > 60) report.warnings.push('Title too long (>60 chars)');
if (report.metadata.titleLength < 30) report.warnings.push('Title too short (<30 chars)');
if (!report.metadata.description) report.issues.push('Missing meta description');
if (report.metadata.descriptionLength > 160) report.warnings.push('Description too long (>160 chars)');
if (report.headings.h1Count === 0) report.issues.push('No H1 heading found');
if (report.headings.h1Count > 1) report.warnings.push('Multiple H1 headings found');
if (report.structuredData.count === 0) report.recommendations.push('Add Schema.org structured data');
if (!report.openGraph.title) report.recommendations.push('Add Open Graph metadata');

// SEO Score
const issueScore = Math.max(0, 100 - (report.issues.length * 15));
const warningScore = Math.max(0, 100 - (report.warnings.length * 10));
report.seoScore = Math.round((issueScore + warningScore) / 2);

return [{ json: report }];`
          },
          position: [900, 300]
        },
        {
          id: "response",
          type: "n8n-nodes-base.respondToWebhook",
          name: "Response",
          parameters: {
            respondWith: "json",
            responseBody: "={{ JSON.stringify($json) }}"
          },
          position: [1100, 300]
        }
      ],
      connections: {
        "webhook": { main: [["fetch-page"]] },
        "fetch-page": { main: [["extract-meta", "extract-schema", "analyze-headings"]] },
        "extract-meta": { main: [["merge"]] },
        "extract-schema": { main: [["merge"]] },
        "analyze-headings": { main: [["merge"]] },
        "merge": { main: [["generate-report"]] },
        "generate-report": { main: [["response"]] }
      }
    }
  };

  /**
   * Social Media Management Templates
   */
  static socialMediaTemplates = {
    multiPlatformPosting: {
      name: "Multi-Platform Social Media Poster",
      description: "Post content to multiple social media platforms simultaneously",
      category: "Social Media Management",
      complexity: "medium" as const,
      tags: ["social-media", "twitter", "linkedin", "facebook"],
      requiredCredentials: ["twitterOAuth2Api", "linkedInOAuth2Api"],
      nodes: [
        {
          id: "webhook",
          type: "n8n-nodes-base.webhook",
          name: "Content Webhook",
          parameters: {
            httpMethod: "POST",
            path: "social-post",
            responseMode: "responseNode"
          },
          position: [100, 300]
        },
        {
          id: "validate",
          type: "n8n-nodes-base.function",
          name: "Validate Content",
          parameters: {
            functionCode: `const { content, platforms = ['twitter', 'linkedin'] } = $input.first().json;
if (!content) throw new Error('Content is required');
if (content.length > 280 && platforms.includes('twitter')) {
  throw new Error('Content too long for Twitter (max 280 chars)');
}
return [{ json: { content, platforms, timestamp: Date.now() } }];`
          },
          position: [300, 300]
        },
        {
          id: "twitter",
          type: "n8n-nodes-base.twitter",
          name: "Post to Twitter",
          parameters: {
            resource: "tweet",
            operation: "create",
            text: "={{ $json.content }}"
          },
          position: [500, 200]
        },
        {
          id: "linkedin",
          type: "n8n-nodes-base.linkedIn",
          name: "Post to LinkedIn",
          parameters: {
            resource: "post",
            operation: "create",
            text: "={{ $json.content }}"
          },
          position: [500, 400]
        },
        {
          id: "merge-results",
          type: "n8n-nodes-base.merge",
          name: "Merge Results",
          parameters: {
            mode: "combine",
            combineBy: "combineAll"
          },
          position: [700, 300]
        },
        {
          id: "response",
          type: "n8n-nodes-base.respondToWebhook",
          name: "Response",
          parameters: {
            respondWith: "json",
            responseBody: "={{ JSON.stringify({ success: true, posts: $input.all() }) }}"
          },
          position: [900, 300]
        }
      ],
      connections: {
        "webhook": { main: [["validate"]] },
        "validate": { main: [["twitter", "linkedin"]] },
        "twitter": { main: [["merge-results"]] },
        "linkedin": { main: [["merge-results"]] },
        "merge-results": { main: [["response"]] }
      }
    }
  };

  /**
   * E-commerce & Retail Templates
   */
  static ecommerceTemplates = {
    shopifyOrderProcessor: {
      name: "Shopify Order Processing Pipeline",
      description: "Automated order processing with notifications and inventory updates",
      category: "E-commerce & Retail",
      complexity: "high" as const,
      tags: ["shopify", "ecommerce", "orders", "inventory"],
      requiredCredentials: ["shopifyApi"],
      nodes: [
        {
          id: "shopify-trigger",
          type: "n8n-nodes-base.shopifyTrigger",
          name: "New Order",
          parameters: {
            topic: "orders/create"
          },
          position: [100, 300]
        },
        {
          id: "validate-order",
          type: "n8n-nodes-base.function",
          name: "Validate Order",
          parameters: {
            functionCode: `const order = $input.first().json;
const isValid = order.id && order.email && order.line_items?.length > 0;
if (!isValid) throw new Error('Invalid order data');
return [{ json: order }];`
          },
          position: [300, 300]
        },
        {
          id: "update-inventory",
          type: "n8n-nodes-base.shopify",
          name: "Update Inventory",
          parameters: {
            resource: "product",
            operation: "update",
            productId: "={{ $json.line_items[0].product_id }}",
            updateFields: {
              inventory_quantity: "={{ $json.line_items[0].quantity }}"
            }
          },
          position: [500, 200]
        },
        {
          id: "send-confirmation",
          type: "n8n-nodes-base.emailSend",
          name: "Send Order Confirmation",
          parameters: {
            fromEmail: "orders@example.com",
            toEmail: "={{ $json.email }}",
            subject: "Order Confirmation #{{ $json.order_number }}",
            emailFormat: "html",
            text: "Thank you for your order!"
          },
          position: [500, 300]
        },
        {
          id: "notify-slack",
          type: "n8n-nodes-base.slack",
          name: "Notify Team",
          parameters: {
            resource: "message",
            operation: "post",
            channel: "#orders",
            text: "New order #{{ $json.order_number }} from {{ $json.email }}"
          },
          position: [500, 400]
        }
      ],
      connections: {
        "shopify-trigger": { main: [["validate-order"]] },
        "validate-order": { main: [["update-inventory", "send-confirmation", "notify-slack"]] }
      }
    }
  };

  /**
   * Get all available templates
   */
  static getAllTemplates(): Record<string, WorkflowTemplate> {
    return {
      ...this.aiAgentTemplates,
      ...this.webScrapingTemplates,
      ...this.socialMediaTemplates,
      ...this.ecommerceTemplates
    };
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): WorkflowTemplate[] {
    const all = this.getAllTemplates();
    return Object.values(all).filter(t => t.category === category);
  }

  /**
   * Get template by name
   */
  static getTemplate(name: string): WorkflowTemplate | null {
    const all = this.getAllTemplates();
    return all[name] || null;
  }

  /**
   * Get all categories
   */
  static getCategories(): string[] {
    const all = this.getAllTemplates();
    return [...new Set(Object.values(all).map(t => t.category))];
  }
}
