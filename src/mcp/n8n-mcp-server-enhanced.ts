#!/usr/bin/env node

/**
 * Enhanced n8n MCP Server for Windsurf Integration
 *
 * This enhanced MCP server extends the base n8n integration with:
 * - Workflow template library (based on 2,057 n8n-workflows examples)
 * - Schema.org tools for SEO and data mining
 * - Advanced workflow generation and analysis capabilities
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as fs from 'fs/promises';
import { WorkflowTemplateLibrary, WorkflowTemplate } from './workflow-templates.js';
import { SchemaOrgGenerator, SchemaOrgAnalyzer, SEOStrategyGenerator } from './schema-org-tools.js';

// n8n MCP Server Configuration
interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
  timeout: number;
}

class EnhancedN8nMCPServer {
  private server: Server;
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'n8n-mcp-server-enhanced',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ========== Original Workflow Management Tools ==========
          {
            name: 'list_workflows',
            description: 'List all n8n workflows',
            inputSchema: {
              type: 'object',
              properties: {
                active: { type: 'boolean', description: 'Filter by active status' },
              },
            },
          },
          {
            name: 'get_workflow',
            description: 'Get a specific workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'The workflow ID' },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'create_workflow',
            description: 'Create a new n8n workflow',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Workflow name' },
                nodes: { type: 'array', description: 'Workflow nodes' },
                connections: { type: 'object', description: 'Node connections' },
                active: { type: 'boolean', description: 'Whether to activate the workflow', default: false },
              },
              required: ['name', 'nodes', 'connections'],
            },
          },
          {
            name: 'execute_workflow',
            description: 'Execute a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'The workflow ID to execute' },
                inputData: { type: 'object', description: 'Input data for the workflow' },
              },
              required: ['workflowId'],
            },
          },

          // ========== NEW: Workflow Template Tools ==========
          {
            name: 'list_workflow_templates',
            description: 'List all available workflow templates from the template library (2,057+ examples)',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter by category (AI Agent Development, Web Scraping, Social Media, E-commerce, etc.)',
                },
                complexity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Filter by complexity level',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by tags',
                },
              },
            },
          },
          {
            name: 'get_workflow_template',
            description: 'Get a specific workflow template by name',
            inputSchema: {
              type: 'object',
              properties: {
                templateName: { type: 'string', description: 'The template name' },
              },
              required: ['templateName'],
            },
          },
          {
            name: 'create_workflow_from_template',
            description: 'Create a new workflow from a template',
            inputSchema: {
              type: 'object',
              properties: {
                templateName: { type: 'string', description: 'The template name to use' },
                workflowName: { type: 'string', description: 'Custom name for the new workflow' },
                parameters: { type: 'object', description: 'Template-specific parameters to customize the workflow' },
                activate: { type: 'boolean', description: 'Whether to activate the workflow immediately', default: false },
              },
              required: ['templateName'],
            },
          },
          {
            name: 'list_template_categories',
            description: 'List all available workflow template categories',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },

          // ========== NEW: Schema.org SEO Tools ==========
          {
            name: 'generate_schema_organization',
            description: 'Generate Schema.org Organization structured data for SEO',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Organization name' },
                url: { type: 'string', description: 'Organization website URL' },
                logo: { type: 'string', description: 'Logo URL' },
                description: { type: 'string', description: 'Organization description' },
                contactPoint: {
                  type: 'object',
                  description: 'Contact information',
                  properties: {
                    telephone: { type: 'string' },
                    contactType: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
                sameAs: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Social media profile URLs',
                },
              },
              required: ['name', 'url'],
            },
          },
          {
            name: 'generate_schema_article',
            description: 'Generate Schema.org Article structured data for blog posts and articles',
            inputSchema: {
              type: 'object',
              properties: {
                headline: { type: 'string', description: 'Article headline' },
                url: { type: 'string', description: 'Article URL' },
                image: { type: 'string', description: 'Featured image URL' },
                datePublished: { type: 'string', description: 'Publication date (ISO 8601)' },
                dateModified: { type: 'string', description: 'Last modified date (ISO 8601)' },
                author: { type: 'string', description: 'Author name' },
                publisher: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    logo: { type: 'string' },
                  },
                },
                description: { type: 'string', description: 'Article description' },
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Article keywords',
                },
              },
              required: ['headline', 'url', 'datePublished', 'author', 'publisher'],
            },
          },
          {
            name: 'generate_schema_product',
            description: 'Generate Schema.org Product structured data for e-commerce',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Product name' },
                description: { type: 'string', description: 'Product description' },
                image: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Product image URLs',
                },
                sku: { type: 'string', description: 'Product SKU' },
                brand: { type: 'string', description: 'Brand name' },
                offers: {
                  type: 'object',
                  properties: {
                    price: { type: 'number' },
                    priceCurrency: { type: 'string' },
                    availability: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              required: ['name', 'description'],
            },
          },
          {
            name: 'generate_schema_local_business',
            description: 'Generate Schema.org LocalBusiness structured data for local SEO',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Business name' },
                businessType: { type: 'string', description: 'Specific business type (Restaurant, Store, etc.)' },
                address: {
                  type: 'object',
                  properties: {
                    streetAddress: { type: 'string' },
                    addressLocality: { type: 'string' },
                    addressRegion: { type: 'string' },
                    postalCode: { type: 'string' },
                    addressCountry: { type: 'string' },
                  },
                  required: ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry'],
                },
                telephone: { type: 'string' },
                url: { type: 'string' },
                geo: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                  },
                },
              },
              required: ['name', 'address'],
            },
          },
          {
            name: 'analyze_page_schema',
            description: 'Analyze Schema.org structured data on a webpage for SEO auditing',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'URL to analyze' },
              },
              required: ['url'],
            },
          },
          {
            name: 'generate_seo_strategy',
            description: 'Generate comprehensive SEO strategy with Schema.org recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                businessType: { type: 'string', description: 'Type of business' },
                industry: { type: 'string', description: 'Industry sector' },
                targetKeywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Target SEO keywords',
                },
                hasEcommerce: { type: 'boolean', description: 'Has e-commerce functionality' },
                hasBlog: { type: 'boolean', description: 'Has blog/content section' },
                hasLocalPresence: { type: 'boolean', description: 'Has physical location' },
              },
              required: ['businessType', 'industry', 'targetKeywords'],
            },
          },
          {
            name: 'generate_data_mining_strategy',
            description: 'Generate data mining strategy using Schema.org structured data',
            inputSchema: {
              type: 'object',
              properties: {
                industry: { type: 'string', description: 'Target industry for data mining' },
              },
              required: ['industry'],
            },
          },

          // ========== NEW: Advanced Workflow Generation ==========
          {
            name: 'generate_seo_workflow',
            description: 'Generate a complete SEO analysis and optimization workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowName: { type: 'string', description: 'Name for the workflow' },
                targetUrl: { type: 'string', description: 'Target URL for SEO analysis' },
                includeSchemaGeneration: { type: 'boolean', description: 'Include Schema.org generation', default: true },
                activate: { type: 'boolean', description: 'Activate workflow immediately', default: false },
              },
              required: ['workflowName'],
            },
          },
          {
            name: 'generate_scraping_workflow',
            description: 'Generate a web scraping workflow with data extraction and storage',
            inputSchema: {
              type: 'object',
              properties: {
                workflowName: { type: 'string', description: 'Name for the workflow' },
                targetUrl: { type: 'string', description: 'URL to scrape' },
                selectors: {
                  type: 'object',
                  description: 'CSS selectors for data extraction',
                },
                schedule: { type: 'string', description: 'Cron schedule for periodic scraping' },
                activate: { type: 'boolean', default: false },
              },
              required: ['workflowName', 'targetUrl', 'selectors'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Original workflow management
          case 'list_workflows':
            return await this.listWorkflows(args);
          case 'get_workflow':
            return await this.getWorkflow(args);
          case 'create_workflow':
            return await this.createWorkflow(args);
          case 'execute_workflow':
            return await this.executeWorkflow(args);

          // Workflow templates
          case 'list_workflow_templates':
            return this.listWorkflowTemplates(args);
          case 'get_workflow_template':
            return this.getWorkflowTemplate(args);
          case 'create_workflow_from_template':
            return await this.createWorkflowFromTemplate(args);
          case 'list_template_categories':
            return this.listTemplateCategories();

          // Schema.org SEO tools
          case 'generate_schema_organization':
            return this.generateSchemaOrganization(args);
          case 'generate_schema_article':
            return this.generateSchemaArticle(args);
          case 'generate_schema_product':
            return this.generateSchemaProduct(args);
          case 'generate_schema_local_business':
            return this.generateSchemaLocalBusiness(args);
          case 'analyze_page_schema':
            return await this.analyzePageSchema(args);
          case 'generate_seo_strategy':
            return this.generateSEOStrategy(args);
          case 'generate_data_mining_strategy':
            return this.generateDataMiningStrategy(args);

          // Advanced workflow generation
          case 'generate_seo_workflow':
            return await this.generateSEOWorkflow(args);
          case 'generate_scraping_workflow':
            return await this.generateScrapingWorkflow(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  // ========== Original Workflow Management Methods ==========

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers['X-N8N-API-KEY'] = this.config.apiKey;
    }

    const response = await axios({
      url,
      method: options.method || 'GET',
      headers,
      data: options.data,
      timeout: this.config.timeout,
    });

    return response.data;
  }

  private async listWorkflows(args: { active?: boolean }) {
    const workflows = await this.makeRequest('/api/v1/workflows');
    let filteredWorkflows = workflows.data || workflows;

    if (args.active !== undefined) {
      filteredWorkflows = filteredWorkflows.filter((w: any) => w.active === args.active);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(filteredWorkflows, null, 2) }],
    };
  }

  private async getWorkflow(args: { workflowId: string }) {
    const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`);
    return {
      content: [{ type: 'text', text: JSON.stringify(workflow, null, 2) }],
    };
  }

  private async createWorkflow(args: {
    name: string;
    nodes: any[];
    connections: any;
    active?: boolean;
  }) {
    const workflowData = {
      name: args.name,
      nodes: args.nodes,
      connections: args.connections,
      active: args.active || false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow created successfully: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private async executeWorkflow(args: { workflowId: string; inputData?: any }) {
    const execution = await this.makeRequest(`/api/v1/workflows/${args.workflowId}/execute`, {
      method: 'POST',
      data: args.inputData || {},
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow execution started: ${JSON.stringify(execution, null, 2)}`,
        },
      ],
    };
  }

  // ========== NEW: Workflow Template Methods ==========

  private listWorkflowTemplates(args: {
    category?: string;
    complexity?: 'low' | 'medium' | 'high';
    tags?: string[];
  }) {
    let templates = Object.values(WorkflowTemplateLibrary.getAllTemplates());

    if (args.category) {
      templates = templates.filter(t => t.category === args.category);
    }

    if (args.complexity) {
      templates = templates.filter(t => t.complexity === args.complexity);
    }

    if (args.tags && args.tags.length > 0) {
      templates = templates.filter(t =>
        args.tags!.some(tag => t.tags.includes(tag))
      );
    }

    const summary = templates.map(t => ({
      name: t.name,
      description: t.description,
      category: t.category,
      complexity: t.complexity,
      tags: t.tags,
      requiredCredentials: t.requiredCredentials || [],
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              count: summary.length,
              templates: summary,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private getWorkflowTemplate(args: { templateName: string }) {
    const all = WorkflowTemplateLibrary.getAllTemplates();
    const template = all[args.templateName];

    if (!template) {
      throw new Error(`Template '${args.templateName}' not found`);
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(template, null, 2) }],
    };
  }

  private async createWorkflowFromTemplate(args: {
    templateName: string;
    workflowName?: string;
    parameters?: any;
    activate?: boolean;
  }) {
    const all = WorkflowTemplateLibrary.getAllTemplates();
    const template = all[args.templateName];

    if (!template) {
      throw new Error(`Template '${args.templateName}' not found`);
    }

    // Create workflow from template
    const workflowData = {
      name: args.workflowName || template.name,
      nodes: template.nodes,
      connections: template.connections,
      active: args.activate || false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow created from template '${template.name}': ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private listTemplateCategories() {
    const categories = WorkflowTemplateLibrary.getCategories();
    const categoryCounts: Record<string, number> = {};

    const all = WorkflowTemplateLibrary.getAllTemplates();
    Object.values(all).forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              categories,
              counts: categoryCounts,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // ========== NEW: Schema.org Methods ==========

  private generateSchemaOrganization(args: any) {
    const schema = SchemaOrgGenerator.generateOrganization(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  private generateSchemaArticle(args: any) {
    const schema = SchemaOrgGenerator.generateArticle(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  private generateSchemaProduct(args: any) {
    const schema = SchemaOrgGenerator.generateProduct(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  private generateSchemaLocalBusiness(args: any) {
    const schema = SchemaOrgGenerator.generateLocalBusiness(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  private async analyzePageSchema(args: { url: string }) {
    // Fetch the page
    const response = await axios.get(args.url, { timeout: this.config.timeout });
    const html = response.data;

    // Extract and analyze schemas
    const schemas = SchemaOrgAnalyzer.extractSchemas(html);
    const score = SchemaOrgAnalyzer.calculateSchemaScore(schemas);
    const recommendations = SchemaOrgAnalyzer.generateRecommendations(schemas);

    const analysis = {
      url: args.url,
      schemasFound: schemas.length,
      schemas: schemas.map(s => ({
        type: s['@type'],
        validation: SchemaOrgAnalyzer.validateSchema(s),
      })),
      score,
      recommendations,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }],
    };
  }

  private generateSEOStrategy(args: any) {
    const strategy = SEOStrategyGenerator.generateStrategy(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(strategy, null, 2) }],
    };
  }

  private generateDataMiningStrategy(args: { industry: string }) {
    const strategy = SEOStrategyGenerator.generateDataMiningStrategy(args.industry);
    return {
      content: [{ type: 'text', text: JSON.stringify(strategy, null, 2) }],
    };
  }

  // ========== NEW: Advanced Workflow Generation ==========

  private async generateSEOWorkflow(args: {
    workflowName: string;
    targetUrl?: string;
    includeSchemaGeneration?: boolean;
    activate?: boolean;
  }) {
    // Use the SEO Data Miner template as base
    const template = WorkflowTemplateLibrary.webScrapingTemplates.seoDataMiner;

    const workflowData = {
      name: args.workflowName,
      nodes: template.nodes,
      connections: template.connections,
      active: args.activate || false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `SEO workflow created: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private async generateScrapingWorkflow(args: {
    workflowName: string;
    targetUrl: string;
    selectors: any;
    schedule?: string;
    activate?: boolean;
  }) {
    const template = WorkflowTemplateLibrary.webScrapingTemplates.comprehensiveWebScraper;

    const workflowData = {
      name: args.workflowName,
      nodes: template.nodes,
      connections: template.connections,
      active: args.activate || false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Web scraping workflow created: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Enhanced n8n MCP Server running on stdio');
  }
}

// Main execution
async function main() {
  const config: N8nConfig = {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY,
    webhookUrl: process.env.N8N_WEBHOOK_URL,
    timeout: parseInt(process.env.N8N_TIMEOUT || '30000'),
  };

  const server = new EnhancedN8nMCPServer(config);
  await server.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to start Enhanced n8n MCP Server:', error);
    process.exit(1);
  });
}

export { EnhancedN8nMCPServer };
