/**
 * Chrome Layers 3D Rich Snippet Miner
 * 
 * Combines Chrome Layers 3D DOM visualization with rich snippet extraction
 * Links DOM elements to their semantic schema.org markup
 * Generates structured data for SEO optimization
 */

import { Pool } from 'pg';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface DOMElement3D {
  id: string;
  tagName: string;
  depth: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
  children: string[];
  richSnippet?: RichSnippet;
  schemaLinks: SchemaLink[];
}

export interface RichSnippet {
  type: string; // Article, Product, Event, etc.
  schema: string; // schema.org type
  properties: Record<string, any>;
  jsonLD?: string;
  microdata?: Record<string, any>;
  isValid: boolean;
  validationErrors: string[];
}

export interface SchemaLink {
  elementId: string;
  schemaType: string;
  property: string;
  value: any;
  linkedElements: string[];
}

export interface MiningResult {
  url: string;
  dom3DModel: DOMElement3D[];
  richSnippets: RichSnippet[];
  schemaGraph: SchemaGraph;
  seoScore: number;
  recommendations: string[];
  timestamp: string;
}

export interface SchemaGraph {
  nodes: {
    id: string;
    type: string;
    properties: Record<string, any>;
  }[];
  edges: {
    from: string;
    to: string;
    relationship: string;
  }[];
}

export class ChromeLayers3DRichSnippetMiner {
  private dbPool: Pool;
  private browser: Browser | null = null;

  constructor(dbPool: Pool) {
    this.dbPool = dbPool;
  }

  /**
   * Initialize the miner
   */
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-gpu',
        '--enable-webgl',
      ],
    });
  }

  /**
   * Mine URL for 3D DOM structure and rich snippets
   */
  async mineURL(url: string): Promise<MiningResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    const client = await page.target().createCDPSession();

    try {
      // Enable Chrome DevTools Protocol domains
      await Promise.all([
        client.send('LayerTree.enable'),
        client.send('DOM.enable'),
        client.send('CSS.enable'),
      ]);

      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extract 3D DOM structure
      const dom3DModel = await this.extract3DModel(page, client);

      // Extract rich snippets
      const richSnippets = await this.extractRichSnippets(page);

      // Link DOM elements to rich snippets
      this.linkDOMToSnippets(dom3DModel, richSnippets);

      // Build schema graph
      const schemaGraph = this.buildSchemaGraph(dom3DModel, richSnippets);

      // Calculate SEO score
      const seoScore = this.calculateSEOScore(richSnippets, dom3DModel);

      // Generate recommendations
      const recommendations = this.generateRecommendations(richSnippets, dom3DModel);

      const result: MiningResult = {
        url,
        dom3DModel,
        richSnippets,
        schemaGraph,
        seoScore,
        recommendations,
        timestamp: new Date().toISOString(),
      };

      // Store in database
      await this.storeMiningResult(result);

      return result;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract 3D DOM model using Chrome Layers
   */
  private async extract3DModel(page: Page, client: any): Promise<DOMElement3D[]> {
    // Get DOM tree
    const { root } = await client.send('DOM.getDocument', { depth: -1 });

    // Get layer tree for 3D positions
    const layerTree = await client.send('LayerTree.compositingReasons');

    // Build 3D model
    const elements: DOMElement3D[] = [];
    await this.traverse3DNode(root, 0, page, elements, 0);

    return elements;
  }

  /**
   * Traverse DOM node and build 3D representation
   */
  private async traverse3DNode(
    node: any,
    depth: number,
    page: Page,
    elements: DOMElement3D[],
    index: number
  ): Promise<number> {
    if (node.nodeType !== 1) { // Element node
      return index;
    }

    // Get element position and dimensions
    const position = await page.evaluate((nodeId) => {
      const element = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }, node.nodeId);

    if (position) {
      const element: DOMElement3D = {
        id: `node-${node.nodeId}`,
        tagName: node.nodeName,
        depth,
        position: {
          x: position.x,
          y: position.y,
          z: depth * 10, // Z-index based on depth
        },
        dimensions: {
          width: position.width,
          height: position.height,
        },
        attributes: this.extractAttributes(node),
        children: [],
        schemaLinks: [],
      };

      elements.push(element);
      index++;
    }

    // Traverse children
    if (node.children) {
      for (const child of node.children) {
        index = await this.traverse3DNode(child, depth + 1, page, elements, index);
      }
    }

    return index;
  }

  /**
   * Extract attributes from node
   */
  private extractAttributes(node: any): Record<string, string> {
    const attributes: Record<string, string> = {};
    
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i += 2) {
        const name = node.attributes[i];
        const value = node.attributes[i + 1];
        attributes[name] = value;
      }
    }

    return attributes;
  }

  /**
   * Extract rich snippets from page
   */
  private async extractRichSnippets(page: Page): Promise<RichSnippet[]> {
    return page.evaluate(() => {
      const snippets: any[] = [];

      // Extract JSON-LD
      const jsonLDScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLDScripts.forEach((script, index) => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          snippets.push({
            type: data['@type'] || 'Unknown',
            schema: data['@context'] || 'https://schema.org',
            properties: data,
            jsonLD: script.textContent,
            isValid: true,
            validationErrors: [],
          });
        } catch (error) {
          snippets.push({
            type: 'Invalid',
            schema: 'Unknown',
            properties: {},
            jsonLD: script.textContent,
            isValid: false,
            validationErrors: ['Invalid JSON-LD syntax'],
          });
        }
      });

      // Extract Microdata
      const itemScopes = document.querySelectorAll('[itemscope]');
      itemScopes.forEach((element, index) => {
        const microdata: any = {};
        const type = element.getAttribute('itemtype') || 'Unknown';

        // Extract item properties
        const props = element.querySelectorAll('[itemprop]');
        props.forEach(prop => {
          const propName = prop.getAttribute('itemprop');
          const propValue = prop.getAttribute('content') || prop.textContent;
          if (propName) {
            microdata[propName] = propValue;
          }
        });

        snippets.push({
          type: type.split('/').pop() || 'Unknown',
          schema: type,
          properties: microdata,
          microdata,
          isValid: true,
          validationErrors: [],
        });
      });

      return snippets;
    });
  }

  /**
   * Link DOM elements to their rich snippets
   */
  private linkDOMToSnippets(dom3DModel: DOMElement3D[], richSnippets: RichSnippet[]): void {
    for (const element of dom3DModel) {
      // Check if element has itemscope or schema.org attributes
      if (element.attributes.itemscope !== undefined) {
        const itemType = element.attributes.itemtype;
        const snippet = richSnippets.find(s => s.schema.includes(itemType || ''));
        
        if (snippet) {
          element.richSnippet = snippet;

          // Create schema links
          for (const [prop, value] of Object.entries(snippet.properties)) {
            if (prop !== '@context' && prop !== '@type') {
              element.schemaLinks.push({
                elementId: element.id,
                schemaType: snippet.type,
                property: prop,
                value,
                linkedElements: [],
              });
            }
          }
        }
      }
    }
  }

  /**
   * Build schema graph from DOM and snippets
   */
  private buildSchemaGraph(dom3DModel: DOMElement3D[], richSnippets: RichSnippet[]): SchemaGraph {
    const nodes: SchemaGraph['nodes'] = [];
    const edges: SchemaGraph['edges'] = [];

    // Create nodes from rich snippets
    richSnippets.forEach((snippet, index) => {
      nodes.push({
        id: `snippet-${index}`,
        type: snippet.type,
        properties: snippet.properties,
      });
    });

    // Create edges based on schema relationships
    for (let i = 0; i < richSnippets.length; i++) {
      const snippet = richSnippets[i];
      
      // Check for nested schemas
      for (const [key, value] of Object.entries(snippet.properties)) {
        if (typeof value === 'object' && value['@type']) {
          // Find matching snippet
          const targetIndex = richSnippets.findIndex(s => s.type === value['@type']);
          if (targetIndex >= 0) {
            edges.push({
              from: `snippet-${i}`,
              to: `snippet-${targetIndex}`,
              relationship: key,
            });
          }
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Calculate SEO score based on rich snippets
   */
  private calculateSEOScore(richSnippets: RichSnippet[], dom3DModel: DOMElement3D[]): number {
    let score = 0;
    const maxScore = 100;

    // Points for having rich snippets
    if (richSnippets.length > 0) score += 30;

    // Points for valid snippets
    const validSnippets = richSnippets.filter(s => s.isValid).length;
    score += (validSnippets / Math.max(richSnippets.length, 1)) * 20;

    // Points for diverse snippet types
    const uniqueTypes = new Set(richSnippets.map(s => s.type)).size;
    score += Math.min(uniqueTypes * 10, 30);

    // Points for proper DOM structure
    const elementsWithSnippets = dom3DModel.filter(e => e.richSnippet).length;
    score += (elementsWithSnippets / Math.max(dom3DModel.length, 1)) * 20;

    return Math.min(score, maxScore);
  }

  /**
   * Generate SEO recommendations
   */
  private generateRecommendations(richSnippets: RichSnippet[], dom3DModel: DOMElement3D[]): string[] {
    const recommendations: string[] = [];

    // Check for missing snippets
    if (richSnippets.length === 0) {
      recommendations.push('Add structured data markup (JSON-LD or Microdata) to improve search visibility');
    }

    // Check for invalid snippets
    const invalidSnippets = richSnippets.filter(s => !s.isValid);
    if (invalidSnippets.length > 0) {
      recommendations.push(`Fix ${invalidSnippets.length} invalid structured data markup(s)`);
    }

    // Check for common schema types
    const hasArticle = richSnippets.some(s => s.type === 'Article');
    const hasProduct = richSnippets.some(s => s.type === 'Product');
    const hasBreadcrumb = richSnippets.some(s => s.type === 'BreadcrumbList');

    if (!hasBreadcrumb) {
      recommendations.push('Add BreadcrumbList schema for better navigation in search results');
    }

    // Check DOM structure
    const h1Count = dom3DModel.filter(e => e.tagName === 'H1').length;
    if (h1Count === 0) {
      recommendations.push('Add an H1 heading to improve content structure');
    } else if (h1Count > 1) {
      recommendations.push('Use only one H1 heading per page');
    }

    return recommendations;
  }

  /**
   * Store mining result in database
   */
  private async storeMiningResult(result: MiningResult): Promise<void> {
    await this.dbPool.query(`
      INSERT INTO dom_3d_mining_results 
      (url, dom_model, rich_snippets, schema_graph, seo_score, recommendations, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      result.url,
      JSON.stringify(result.dom3DModel),
      JSON.stringify(result.richSnippets),
      JSON.stringify(result.schemaGraph),
      result.seoScore,
      JSON.stringify(result.recommendations),
    ]);
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
}

export default ChromeLayers3DRichSnippetMiner;
