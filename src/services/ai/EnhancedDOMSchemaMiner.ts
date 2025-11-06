/**
 * Enhanced DOM Schema Miner
 * 
 * Mines DOM elements for attributes using optimized algorithms.
 * Extracts data streams for neural network-driven workflow automation.
 */

import { Page } from 'puppeteer';

interface DOMSchema {
  element: string;
  attributes: Record<string, any>;
  children: DOMSchema[];
  depth: number;
  schemaType: string;
}

interface AttributeExtraction {
  attributeName: string;
  value: any;
  dataType: string;
  relevanceScore: number;
}

interface DataStream {
  name: string;
  target: string;
  format: string;
  data: any[];
}

export class EnhancedDOMSchemaMiner {
  /**
   * Mine DOM with schema extraction
   */
  async mineDOMWithSchemas(page: Page, config: {
    maxDepth?: number;
    targetSchemas?: string[];
    campaignId: string;
    optimizationLevel?: 'fast' | 'balanced' | 'thorough';
  }): Promise<{
    schemas: DOMSchema[];
    attributes: AttributeExtraction[];
    dataStreams: DataStream[];
    metadata: any;
  }> {
    const maxDepth = config.maxDepth || 10;
    const optimizationLevel = config.optimizationLevel || 'balanced';

    // Extract DOM tree with optimized traversal
    const domTree = await page.evaluate((depth, level) => {
      const traverse = (element: Element, currentDepth: number): any => {
        if (currentDepth > depth) return null;

        // Optimization: Skip non-visible elements for 'fast' mode
        if (level === 'fast') {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return null;
        }

        const schema: any = {
          tagName: element.tagName.toLowerCase(),
          attributes: {},
          children: [],
          depth: currentDepth,
          schemaType: 'element'
        };

        // Extract all attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          schema.attributes[attr.name] = attr.value;
        }

        // Check for schema.org markup
        if (element.hasAttribute('itemscope')) {
          schema.schemaType = 'schema.org';
          schema.attributes.itemtype = element.getAttribute('itemtype');
        }

        // Extract text content for leaf nodes
        if (element.children.length === 0) {
          schema.textContent = element.textContent?.trim();
        }

        // Recurse through children
        for (let i = 0; i < element.children.length; i++) {
          const childSchema = traverse(element.children[i], currentDepth + 1);
          if (childSchema) schema.children.push(childSchema);
        }

        return schema;
      };

      return traverse(document.body, 0);
    }, maxDepth, optimizationLevel);

    // Extract attributes with relevance scoring
    const attributes = await this.extractAttributesWithScoring(domTree, config.targetSchemas);

    // Generate data streams
    const dataStreams = await this.generateDataStreams(domTree, attributes, config.campaignId);

    return {
      schemas: [domTree],
      attributes,
      dataStreams,
      metadata: {
        campaignId: config.campaignId,
        totalElements: this.countElements(domTree),
        maxDepthReached: this.getMaxDepth(domTree),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Extract specific attributes from DOM
   */
  async extractAttributes(page: Page, attributeNames: string[]): Promise<AttributeExtraction[]> {
    return await page.evaluate((names) => {
      const extractions: any[] = [];
      const allElements = document.querySelectorAll('*');

      allElements.forEach((element) => {
        names.forEach((attrName) => {
          if (element.hasAttribute(attrName)) {
            extractions.push({
              attributeName: attrName,
              value: element.getAttribute(attrName),
              dataType: typeof element.getAttribute(attrName),
              relevanceScore: 1.0,
              element: element.tagName.toLowerCase(),
              xpath: this.getXPath(element)
            });
          }
        });
      });

      return extractions;
    }, attributeNames);
  }

  /**
   * Configure data streams for workflow
   */
  async configureDataStreams(config: {
    schemas: DOMSchema[];
    streams: {
      name: string;
      target: 'neural-network' | 'database' | 'api' | 'file';
      filter?: (data: any) => boolean;
      transform?: (data: any) => any;
    }[];
  }): Promise<DataStream[]> {
    const dataStreams: DataStream[] = [];

    for (const streamConfig of config.streams) {
      const streamData: any[] = [];

      // Extract data matching stream config
      for (const schema of config.schemas) {
        const extracted = this.extractDataForStream(schema, streamConfig);
        streamData.push(...extracted);
      }

      // Apply filter if provided
      let filteredData = streamData;
      if (streamConfig.filter) {
        filteredData = streamData.filter(streamConfig.filter);
      }

      // Apply transform if provided
      let transformedData = filteredData;
      if (streamConfig.transform) {
        transformedData = filteredData.map(streamConfig.transform);
      }

      dataStreams.push({
        name: streamConfig.name,
        target: streamConfig.target,
        format: 'json',
        data: transformedData
      });
    }

    return dataStreams;
  }

  /**
   * Extract attributes with relevance scoring
   */
  private async extractAttributesWithScoring(
    domTree: DOMSchema,
    targetSchemas?: string[]
  ): Promise<AttributeExtraction[]> {
    const extractions: AttributeExtraction[] = [];

    const traverse = (node: DOMSchema) => {
      // Score based on schema type
      let baseScore = 0.5;
      if (node.schemaType === 'schema.org') baseScore = 1.0;
      if (targetSchemas?.includes(node.schemaType)) baseScore = 0.9;

      // Extract attributes
      for (const [key, value] of Object.entries(node.attributes)) {
        extractions.push({
          attributeName: key,
          value,
          dataType: typeof value,
          relevanceScore: this.calculateRelevanceScore(key, value, baseScore)
        });
      }

      // Recurse
      node.children.forEach(traverse);
    };

    traverse(domTree);
    return extractions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate relevance score for attribute
   */
  private calculateRelevanceScore(key: string, value: any, baseScore: number): number {
    let score = baseScore;

    // Boost for SEO-relevant attributes
    const seoAttributes = ['title', 'description', 'keywords', 'og:title', 'og:description'];
    if (seoAttributes.includes(key)) score += 0.3;

    // Boost for schema.org attributes
    if (key.startsWith('item')) score += 0.2;

    // Boost for data attributes
    if (key.startsWith('data-')) score += 0.1;

    // Penalize for generic IDs/classes
    if (key === 'id' || key === 'class') score -= 0.2;

    return Math.min(1.0, Math.max(0, score));
  }

  /**
   * Generate data streams from extracted data
   */
  private async generateDataStreams(
    domTree: DOMSchema,
    attributes: AttributeExtraction[],
    campaignId: string
  ): Promise<DataStream[]> {
    return [
      {
        name: 'seo-metrics',
        target: 'neural-network',
        format: 'json',
        data: attributes.filter(a => a.relevanceScore > 0.7)
      },
      {
        name: 'schema-org-data',
        target: 'database',
        format: 'structured',
        data: this.extractSchemaOrgData(domTree)
      },
      {
        name: 'dom-structure',
        target: 'file',
        format: 'json',
        data: [{ campaignId, domTree, timestamp: new Date().toISOString() }]
      }
    ];
  }

  /**
   * Extract schema.org data
   */
  private extractSchemaOrgData(domTree: DOMSchema): any[] {
    const schemaData: any[] = [];

    const traverse = (node: DOMSchema) => {
      if (node.schemaType === 'schema.org') {
        schemaData.push({
          type: node.attributes.itemtype,
          properties: node.attributes,
          depth: node.depth
        });
      }
      node.children.forEach(traverse);
    };

    traverse(domTree);
    return schemaData;
  }

  /**
   * Extract data for specific stream
   */
  private extractDataForStream(schema: DOMSchema, streamConfig: any): any[] {
    const data: any[] = [];

    const traverse = (node: DOMSchema) => {
      // Extract based on stream name
      if (streamConfig.name.includes('seo')) {
        if (node.tagName === 'meta' || node.tagName === 'title') {
          data.push(node);
        }
      }

      if (streamConfig.name.includes('schema')) {
        if (node.schemaType === 'schema.org') {
          data.push(node);
        }
      }

      node.children.forEach(traverse);
    };

    traverse(schema);
    return data;
  }

  /**
   * Count total elements in tree
   */
  private countElements(schema: DOMSchema): number {
    let count = 1;
    schema.children.forEach(child => {
      count += this.countElements(child);
    });
    return count;
  }

  /**
   * Get maximum depth reached
   */
  private getMaxDepth(schema: DOMSchema): number {
    if (schema.children.length === 0) return schema.depth;
    return Math.max(...schema.children.map(child => this.getMaxDepth(child)));
  }
}
