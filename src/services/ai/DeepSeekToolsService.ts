/**
 * DeepSeek Tools Service
 * 
 * Provides Puppeteer-based tools for DeepSeek to use
 * Enables automated web interaction, data extraction, and schema analysis
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { OllamaService } from '../ollama-service';

export interface DeepSeekTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (args: Record<string, any>) => Promise<any>;
}

export interface SchemaExtractionResult {
  schemas: SchemaDefinition[];
  relationships: SchemaRelationship[];
  metadata: {
    url: string;
    timestamp: string;
    pageType: string;
  };
}

export interface SchemaDefinition {
  id: string;
  type: string;
  properties: Record<string, any>;
  required: string[];
  examples?: any[];
}

export interface SchemaRelationship {
  from: string;
  to: string;
  type: 'references' | 'contains' | 'extends' | 'implements';
  config?: Record<string, any>;
}

export class DeepSeekToolsService {
  private browser: Browser | null = null;
  private tools: Map<string, DeepSeekTool> = new Map();
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
    this.registerTools();
  }

  /**
   * Initialize Puppeteer browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Register all available tools
   */
  private registerTools(): void {
    // Tool 1: Extract Page Schema
    this.tools.set('extract_page_schema', {
      name: 'extract_page_schema',
      description: 'Extract structured schema from a web page including forms, components, and data structures',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL of the page to analyze',
          },
          selectors: {
            type: 'array',
            description: 'Optional CSS selectors to focus analysis',
          },
        },
        required: ['url'],
      },
      execute: async (args) => this.extractPageSchema(args.url, args.selectors),
    });

    // Tool 2: Crawl and Collect Training Data
    this.tools.set('collect_training_data', {
      name: 'collect_training_data',
      description: 'Crawl websites and collect training data for neural networks',
      parameters: {
        type: 'object',
        properties: {
          startUrl: {
            type: 'string',
            description: 'Starting URL for crawl',
          },
          maxPages: {
            type: 'number',
            description: 'Maximum pages to crawl',
            default: 10,
          },
          dataType: {
            type: 'string',
            description: 'Type of data to collect (seo, ui-patterns, content, etc)',
          },
        },
        required: ['startUrl', 'dataType'],
      },
      execute: async (args) => this.collectTrainingData(args.startUrl, args.dataType, args.maxPages),
    });

    // Tool 3: Analyze Component Structure
    this.tools.set('analyze_component_structure', {
      name: 'analyze_component_structure',
      description: 'Analyze UI component structure and extract reusable patterns',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL to analyze',
          },
          componentType: {
            type: 'string',
            description: 'Type of component to find (form, navigation, card, etc)',
          },
        },
        required: ['url'],
      },
      execute: async (args) => this.analyzeComponentStructure(args.url, args.componentType),
    });

    // Tool 4: Extract Workflow Configuration
    this.tools.set('extract_workflow_config', {
      name: 'extract_workflow_config',
      description: 'Extract workflow configuration from existing applications',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL of application to analyze',
          },
          workflowType: {
            type: 'string',
            description: 'Type of workflow (user-registration, checkout, etc)',
          },
        },
        required: ['url', 'workflowType'],
      },
      execute: async (args) => this.extractWorkflowConfig(args.url, args.workflowType),
    });

    // Tool 5: SEO Campaign Setup
    this.tools.set('setup_seo_campaign', {
      name: 'setup_seo_campaign',
      description: 'Setup and configure SEO campaign for a client',
      parameters: {
        type: 'object',
        properties: {
          targetUrl: {
            type: 'string',
            description: 'Client website URL',
          },
          keywords: {
            type: 'array',
            description: 'Target keywords for SEO',
          },
          competitors: {
            type: 'array',
            description: 'Competitor URLs to analyze',
          },
        },
        required: ['targetUrl', 'keywords'],
      },
      execute: async (args) => this.setupSEOCampaign(args.targetUrl, args.keywords, args.competitors),
    });

    // Tool 6: Generate Dashboard Config
    this.tools.set('generate_dashboard_config', {
      name: 'generate_dashboard_config',
      description: 'Generate meaningful dashboard configuration with rich insight components',
      parameters: {
        type: 'object',
        properties: {
          dataSource: {
            type: 'string',
            description: 'Data source API endpoint',
          },
          metrics: {
            type: 'array',
            description: 'Metrics to display',
          },
          visualizationType: {
            type: 'string',
            description: 'Preferred visualization (chart, table, card, etc)',
          },
        },
        required: ['dataSource', 'metrics'],
      },
      execute: async (args) => this.generateDashboardConfig(args.dataSource, args.metrics, args.visualizationType),
    });
  }

  /**
   * Get all available tools
   */
  getTools(): DeepSeekTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   */
  getTool(name: string): DeepSeekTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool
   */
  async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    await this.initialize();
    return tool.execute(args);
  }

  /**
   * Extract page schema
   */
  private async extractPageSchema(url: string, selectors?: string[]): Promise<SchemaExtractionResult> {
    if (!this.browser) await this.initialize();
    
    const page = await this.browser!.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extract form schemas
      const forms = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('form')).map((form, idx) => {
          const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
            name: input.getAttribute('name') || input.getAttribute('id') || `field_${idx}`,
            type: input.getAttribute('type') || input.tagName.toLowerCase(),
            required: input.hasAttribute('required'),
            placeholder: input.getAttribute('placeholder'),
          }));

          return {
            id: form.getAttribute('id') || `form_${idx}`,
            action: form.getAttribute('action'),
            method: form.getAttribute('method') || 'get',
            inputs,
          };
        });
      });

      // Extract component schemas
      const components = await page.evaluate((sels) => {
        const selectors = sels || ['[data-component]', '[class*="component"]', 'article', 'section'];
        const components: any[] = [];

        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach((el, idx) => {
            components.push({
              id: el.getAttribute('id') || el.getAttribute('data-component') || `component_${idx}`,
              type: el.tagName.toLowerCase(),
              classes: el.className,
              attributes: Array.from(el.attributes).map(attr => ({
                name: attr.name,
                value: attr.value,
              })),
            });
          });
        });

        return components;
      }, selectors);

      // Use DeepSeek to analyze and create relationships
      const analysisPrompt = `Analyze these web components and create a schema relationship map:

Forms: ${JSON.stringify(forms, null, 2)}
Components: ${JSON.stringify(components, null, 2)}

Identify:
1. Schema definitions for each component
2. Relationships between components
3. Data flow patterns
4. Reusable patterns

Return JSON with schemas and relationships.`;

      const analysis = await this.ollamaService.generate({
        prompt: analysisPrompt,
        temperature: 0.2,
      });

      const schemas: SchemaDefinition[] = forms.map((form, idx) => ({
        id: form.id,
        type: 'form',
        properties: form.inputs.reduce((acc: any, input: any) => {
          acc[input.name] = {
            type: input.type,
            required: input.required,
          };
          return acc;
        }, {}),
        required: form.inputs.filter((i: any) => i.required).map((i: any) => i.name),
      }));

      return {
        schemas,
        relationships: [], // Would be extracted from DeepSeek analysis
        metadata: {
          url,
          timestamp: new Date().toISOString(),
          pageType: 'web-page',
        },
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Collect training data
   */
  private async collectTrainingData(
    startUrl: string,
    dataType: string,
    maxPages: number = 10
  ): Promise<any> {
    if (!this.browser) await this.initialize();

    const visitedUrls = new Set<string>();
    const trainingData: any[] = [];
    const urlsToVisit = [startUrl];

    while (urlsToVisit.length > 0 && visitedUrls.size < maxPages) {
      const url = urlsToVisit.shift()!;
      if (visitedUrls.has(url)) continue;

      const page = await this.browser!.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        visitedUrls.add(url);

        // Collect data based on type
        let data: any = {};
        switch (dataType) {
          case 'seo':
            data = await this.collectSEOData(page, url);
            break;
          case 'ui-patterns':
            data = await this.collectUIPatterns(page, url);
            break;
          case 'content':
            data = await this.collectContent(page, url);
            break;
        }

        trainingData.push(data);

        // Find more URLs to crawl
        const links = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href => href.startsWith('http'));
        });

        links.forEach(link => {
          if (!visitedUrls.has(link) && urlsToVisit.length < maxPages) {
            urlsToVisit.push(link);
          }
        });
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      } finally {
        await page.close();
      }
    }

    return {
      dataType,
      totalPages: visitedUrls.size,
      data: trainingData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Collect SEO data from page
   */
  private async collectSEOData(page: Page, url: string): Promise<any> {
    return page.evaluate((pageUrl) => {
      const title = document.querySelector('title')?.textContent || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1 = Array.from(document.querySelectorAll('h1')).map(h => h.textContent);
      const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
      }));

      return {
        url: pageUrl,
        title,
        metaDescription,
        headings: { h1, h2 },
        images,
        wordCount: document.body.textContent?.split(/\s+/).length || 0,
      };
    }, url);
  }

  /**
   * Collect UI patterns from page
   */
  private async collectUIPatterns(page: Page, url: string): Promise<any> {
    return page.evaluate((pageUrl) => {
      const patterns: any[] = [];

      // Navigation patterns
      document.querySelectorAll('nav').forEach((nav, idx) => {
        patterns.push({
          type: 'navigation',
          id: `nav_${idx}`,
          items: Array.from(nav.querySelectorAll('a')).length,
          structure: nav.className,
        });
      });

      // Card patterns
      document.querySelectorAll('[class*="card"]').forEach((card, idx) => {
        patterns.push({
          type: 'card',
          id: `card_${idx}`,
          classes: card.className,
          hasImage: !!card.querySelector('img'),
          hasButton: !!card.querySelector('button, a'),
        });
      });

      return {
        url: pageUrl,
        patterns,
      };
    }, url);
  }

  /**
   * Collect content from page
   */
  private async collectContent(page: Page, url: string): Promise<any> {
    return page.evaluate((pageUrl) => {
      return {
        url: pageUrl,
        title: document.querySelector('title')?.textContent || '',
        content: document.body.textContent || '',
        links: Array.from(document.querySelectorAll('a')).length,
        images: Array.from(document.querySelectorAll('img')).length,
      };
    }, url);
  }

  /**
   * Analyze component structure
   */
  private async analyzeComponentStructure(url: string, componentType?: string): Promise<any> {
    if (!this.browser) await this.initialize();

    const page = await this.browser!.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      const structure = await page.evaluate((type) => {
        const components: any[] = [];
        let selector = '*';

        if (type === 'form') selector = 'form';
        else if (type === 'navigation') selector = 'nav';
        else if (type === 'card') selector = '[class*="card"]';

        document.querySelectorAll(selector).forEach((el, idx) => {
          components.push({
            id: `${type || 'component'}_${idx}`,
            tagName: el.tagName,
            className: el.className,
            children: el.children.length,
            textContent: el.textContent?.substring(0, 100),
          });
        });

        return components;
      }, componentType);

      return {
        url,
        componentType: componentType || 'all',
        components: structure,
        timestamp: new Date().toISOString(),
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Extract workflow configuration
   */
  private async extractWorkflowConfig(url: string, workflowType: string): Promise<any> {
    // This would analyze a page and extract workflow steps
    return {
      workflowType,
      url,
      steps: [
        { id: 'step-1', name: 'Initialize', type: 'start' },
        { id: 'step-2', name: 'Process', type: 'action' },
        { id: 'step-3', name: 'Complete', type: 'end' },
      ],
      extracted: new Date().toISOString(),
    };
  }

  /**
   * Setup SEO campaign
   */
  private async setupSEOCampaign(targetUrl: string, keywords: string[], competitors?: string[]): Promise<any> {
    if (!this.browser) await this.initialize();

    const campaign = {
      targetUrl,
      keywords,
      competitors: competitors || [],
      analysis: {} as any,
      recommendations: [] as string[],
      timestamp: new Date().toISOString(),
    };

    // Analyze target site
    const page = await this.browser!.newPage();
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2' });
      campaign.analysis = await this.collectSEOData(page, targetUrl);

      // Use DeepSeek to generate recommendations
      const prompt = `Analyze this SEO data and provide recommendations:

Target URL: ${targetUrl}
Keywords: ${keywords.join(', ')}
Current SEO Data: ${JSON.stringify(campaign.analysis, null, 2)}

Provide specific, actionable SEO recommendations.`;

      const recommendations = await this.ollamaService.generate({
        prompt,
        temperature: 0.3,
      });

      campaign.recommendations = recommendations.split('\n').filter(r => r.trim());
    } finally {
      await page.close();
    }

    return campaign;
  }

  /**
   * Generate dashboard configuration
   */
  private async generateDashboardConfig(
    dataSource: string,
    metrics: string[],
    visualizationType?: string
  ): Promise<any> {
    const prompt = `Create a rich, insight-driven dashboard configuration for:

Data Source: ${dataSource}
Metrics: ${metrics.join(', ')}
Visualization: ${visualizationType || 'auto'}

Generate a JSON configuration with:
1. Meaningful component layouts
2. Data visualization configurations
3. Interactive elements
4. Real-time update settings
5. Rich insights and analytics

Return only valid JSON.`;

    const configResponse = await this.ollamaService.generate({
      prompt,
      temperature: 0.4,
    });

    try {
      const jsonMatch = configResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse dashboard config:', error);
    }

    // Fallback configuration
    return {
      dataSource,
      metrics,
      components: metrics.map(metric => ({
        type: visualizationType || 'card',
        metric,
        title: metric.replace(/_/g, ' ').toUpperCase(),
        refreshInterval: 5000,
      })),
      layout: 'grid',
      theme: 'modern',
    };
  }
}

export default DeepSeekToolsService;
