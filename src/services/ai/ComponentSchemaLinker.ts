/**
 * Component Schema Linker Service
 * 
 * Links DOM elements to 3D painted/unpainted status and maps component patterns
 * to Material Design schemas for self-rendering functionality.
 */

import puppeteer from 'puppeteer';

interface DOMElement3DLink {
  element: {
    tagName: string;
    id?: string;
    classes: string[];
    attributes: Record<string, string>;
    bounds: { x: number; y: number; width: number; height: number };
    path: string;
  };
  paintStatus: {
    painted: boolean;
    paintTimestamp?: number;
    layerId?: string;
    compositingReasons?: string[];
  };
  framework: {
    type: 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';
    version?: string;
    componentName?: string;
    props?: Record<string, any>;
    router?: { type: string; version: string };
  };
  materialDesignSchema?: {
    category: string;
    component: string;
    variant?: string;
    props: Record<string, any>;
  };
  templateSchema: {
    schemaId: string;
    styleGuide: string;
    usagePattern: string;
    confidence: number;
  };
}

interface ComponentPattern {
  patternName: string;
  elements: string[];
  framework: string;
  materialMapping: string;
  usage: string;
  frequency: number;
}

interface TemplateSchema {
  id: string;
  name: string;
  styleGuide: string;
  framework: string;
  frameworkVersion: string;
  components: Array<{
    name: string;
    schema: any;
    code: string;
  }>;
  patterns: ComponentPattern[];
  metadata: {
    detectedFrom: string;
    confidence: number;
    usageCount: number;
  };
}

export class ComponentSchemaLinker {
  private db: any;

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Analyze URL and link DOM elements to 3D layers and schemas
   */
  async linkDOMToSchema(url: string): Promise<{
    elements: DOMElement3DLink[];
    patterns: ComponentPattern[];
    templateSchema: TemplateSchema;
  }> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
      // Enable CDP domains
      const client = await page.target().createCDPSession();
      await client.send('LayerTree.enable');
      await client.send('DOM.enable');
      await client.send('CSS.enable');

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Detect framework
      const framework = await this.detectFramework(page);

      // Get layer tree
      const { layers } = await client.send('LayerTree.layerTree') as any;

      // Get DOM snapshot
      const domSnapshot = await page.evaluate(() => {
        const elements: any[] = [];
        
        function traverseDOM(node: Element, path: string = '') {
          if (node.nodeType !== 1) return;
          
          const rect = node.getBoundingClientRect();
          const currentPath = path + '/' + node.tagName.toLowerCase();
          
          elements.push({
            tagName: node.tagName,
            id: node.id,
            classes: Array.from(node.classList),
            attributes: Array.from(node.attributes).reduce((acc: any, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {}),
            bounds: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            path: currentPath
          });

          Array.from(node.children).forEach(child => 
            traverseDOM(child as Element, currentPath)
          );
        }

        traverseDOM(document.body);
        return elements;
      });

      // Link elements to paint status
      const linkedElements = await this.linkElementsToPaintStatus(
        domSnapshot,
        layers,
        framework
      );

      // Detect component patterns
      const patterns = await this.detectComponentPatterns(linkedElements, framework);

      // Generate template schema
      const templateSchema = await this.generateTemplateSchema(
        url,
        linkedElements,
        patterns,
        framework
      );

      // Save to database
      await this.saveSchemaLinks(url, linkedElements, patterns, templateSchema);

      await browser.close();

      return {
        elements: linkedElements,
        patterns,
        templateSchema
      };

    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Detect framework and version
   */
  private async detectFramework(page: any): Promise<{
    type: string;
    version?: string;
    router?: any;
  }> {
    return await page.evaluate(() => {
      const win = window as any;
      
      // React detection
      if (win.React) {
        return {
          type: 'react',
          version: win.React.version,
          router: win.ReactRouter ? { type: 'react-router', version: win.ReactRouter.version } : undefined
        };
      }

      // Vue detection
      if (win.Vue || win.__VUE__) {
        return {
          type: 'vue',
          version: win.Vue?.version || win.__VUE__?.version,
          router: win.VueRouter ? { type: 'vue-router', version: win.VueRouter.version } : undefined
        };
      }

      // Angular detection
      if (win.ng || document.querySelector('[ng-version]')) {
        const ngVersion = document.querySelector('[ng-version]')?.getAttribute('ng-version');
        return {
          type: 'angular',
          version: ngVersion || undefined,
          router: win.ng?.router ? { type: 'angular-router', version: ngVersion } : undefined
        };
      }

      // Svelte detection
      if (document.querySelector('[class*="svelte-"]')) {
        return { type: 'svelte' };
      }

      return { type: 'unknown' };
    });
  }

  /**
   * Link DOM elements to paint status from layer tree
   */
  private async linkElementsToPaintStatus(
    elements: any[],
    layers: any[],
    framework: any
  ): Promise<DOMElement3DLink[]> {
    const paintedElementIds = new Set<string>();
    
    // Extract painted elements from layers
    layers.forEach((layer: any) => {
      if (layer.paintCount > 0 || layer.drawsContent) {
        paintedElementIds.add(layer.backendNodeId);
      }
    });

    return elements.map(element => {
      const isPainted = paintedElementIds.has(element.backendNodeId) || 
                       element.bounds.width > 0 && element.bounds.height > 0;

      // Detect Material Design component
      const mdSchema = this.detectMaterialDesignComponent(element);

      return {
        element,
        paintStatus: {
          painted: isPainted,
          paintTimestamp: isPainted ? Date.now() : undefined,
          layerId: element.layerId,
          compositingReasons: []
        },
        framework: {
          ...framework,
          componentName: this.extractComponentName(element, framework.type),
          props: this.extractProps(element)
        },
        materialDesignSchema: mdSchema,
        templateSchema: {
          schemaId: `schema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          styleGuide: mdSchema ? 'material-design' : 'custom',
          usagePattern: this.detectUsagePattern(element),
          confidence: mdSchema ? 0.9 : 0.6
        }
      };
    });
  }

  /**
   * Detect Material Design component from element
   */
  private detectMaterialDesignComponent(element: any): any {
    const classes = element.classes.join(' ');
    
    // Material UI detection
    if (classes.includes('MuiButton')) {
      return {
        category: 'buttons',
        component: 'Button',
        variant: classes.includes('MuiButton-contained') ? 'filled' : 
                 classes.includes('MuiButton-outlined') ? 'outlined' : 'text',
        props: { elevation: classes.includes('MuiButton-contained') ? 2 : 0 }
      };
    }

    if (classes.includes('MuiCard')) {
      return {
        category: 'cards',
        component: 'Card',
        variant: 'elevated',
        props: { elevation: 1 }
      };
    }

    // Generic Material Design patterns
    if (element.tagName === 'BUTTON') {
      return {
        category: 'buttons',
        component: 'Button',
        variant: 'filled',
        props: {}
      };
    }

    return undefined;
  }

  /**
   * Extract component name from element
   */
  private extractComponentName(element: any, frameworkType: string): string | undefined {
    if (frameworkType === 'react') {
      // Check for React component markers
      const dataReactId = element.attributes['data-reactid'] || element.attributes['data-reactroot'];
      if (dataReactId) {
        return element.classes[0] || element.tagName;
      }
    }

    if (frameworkType === 'vue') {
      const vueMarker = Object.keys(element.attributes).find(key => key.startsWith('data-v-'));
      if (vueMarker) {
        return element.classes[0] || element.tagName;
      }
    }

    return undefined;
  }

  /**
   * Extract props from element attributes
   */
  private extractProps(element: any): Record<string, any> {
    const props: Record<string, any> = {};
    
    Object.entries(element.attributes).forEach(([key, value]) => {
      if (key.startsWith('data-')) {
        const propName = key.replace('data-', '').replace(/-([a-z])/g, 
          (g) => g[1].toUpperCase()
        );
        props[propName] = value;
      }
    });

    return props;
  }

  /**
   * Detect usage pattern
   */
  private detectUsagePattern(element: any): string {
    const classes = element.classes.join(' ').toLowerCase();
    const tagName = element.tagName.toLowerCase();

    if (classes.includes('nav') || tagName === 'nav') return 'navigation';
    if (classes.includes('card')) return 'card';
    if (classes.includes('form') || tagName === 'form') return 'form';
    if (classes.includes('hero')) return 'hero';
    if (classes.includes('footer') || tagName === 'footer') return 'footer';
    if (classes.includes('header') || tagName === 'header') return 'header';
    if (tagName === 'button') return 'button';
    if (tagName === 'input' || tagName === 'textarea') return 'input';

    return 'generic';
  }

  /**
   * Detect component patterns
   */
  private async detectComponentPatterns(
    elements: DOMElement3DLink[],
    framework: any
  ): Promise<ComponentPattern[]> {
    const patternCounts = new Map<string, ComponentPattern>();

    elements.forEach(el => {
      const pattern = el.templateSchema.usagePattern;
      
      if (!patternCounts.has(pattern)) {
        patternCounts.set(pattern, {
          patternName: pattern,
          elements: [el.element.path],
          framework: framework.type,
          materialMapping: el.materialDesignSchema?.component || 'custom',
          usage: this.getPatternUsageDescription(pattern),
          frequency: 1
        });
      } else {
        const existing = patternCounts.get(pattern)!;
        existing.elements.push(el.element.path);
        existing.frequency++;
      }
    });

    return Array.from(patternCounts.values())
      .filter(p => p.frequency > 1) // Only patterns used more than once
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get pattern usage description
   */
  private getPatternUsageDescription(pattern: string): string {
    const descriptions: Record<string, string> = {
      navigation: 'Site navigation menu',
      card: 'Content card display',
      form: 'User input form',
      hero: 'Hero section',
      footer: 'Page footer',
      header: 'Page header',
      button: 'Action button',
      input: 'Input field'
    };

    return descriptions[pattern] || 'Generic UI element';
  }

  /**
   * Generate template schema from detected patterns
   */
  private async generateTemplateSchema(
    url: string,
    elements: DOMElement3DLink[],
    patterns: ComponentPattern[],
    framework: any
  ): Promise<TemplateSchema> {
    const styleGuide = this.determineStyleGuide(elements);
    
    const components = patterns.map(pattern => ({
      name: this.capitalize(pattern.patternName),
      schema: {
        type: pattern.materialMapping,
        pattern: pattern.patternName,
        elements: pattern.elements.length,
        usage: pattern.usage
      },
      code: this.generateComponentCode(pattern, framework.type)
    }));

    return {
      id: `template-${Date.now()}`,
      name: `${styleGuide} Template from ${new URL(url).hostname}`,
      styleGuide,
      framework: framework.type,
      frameworkVersion: framework.version || 'unknown',
      components,
      patterns,
      metadata: {
        detectedFrom: url,
        confidence: 0.85,
        usageCount: 0
      }
    };
  }

  /**
   * Determine style guide from elements
   */
  private determineStyleGuide(elements: DOMElement3DLink[]): string {
    const mdCount = elements.filter(el => el.materialDesignSchema).length;
    const totalCount = elements.length;

    if (mdCount / totalCount > 0.5) return 'Material Design';
    
    // Check for other style guides
    const hasBootstrap = elements.some(el => 
      el.element.classes.some(c => c.startsWith('btn-') || c.startsWith('col-'))
    );
    if (hasBootstrap) return 'Bootstrap';

    const hasTailwind = elements.some(el =>
      el.element.classes.some(c => c.startsWith('bg-') || c.startsWith('text-'))
    );
    if (hasTailwind) return 'Tailwind CSS';

    return 'Custom';
  }

  /**
   * Generate component code
   */
  private generateComponentCode(pattern: ComponentPattern, frameworkType: string): string {
    if (frameworkType === 'react') {
      return `import React from 'react';

export const ${this.capitalize(pattern.patternName)}Component = () => {
  return (
    <div className="${pattern.patternName}">
      {/* ${pattern.usage} */}
    </div>
  );
};`;
    }

    if (frameworkType === 'vue') {
      return `<template>
  <div class="${pattern.patternName}">
    <!-- ${pattern.usage} -->
  </div>
</template>

<script>
export default {
  name: '${this.capitalize(pattern.patternName)}Component'
};
</script>`;
    }

    return `<!-- ${pattern.usage} -->
<div class="${pattern.patternName}">
</div>`;
  }

  /**
   * Save schema links to database
   */
  private async saveSchemaLinks(
    url: string,
    elements: DOMElement3DLink[],
    patterns: ComponentPattern[],
    templateSchema: TemplateSchema
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO component_schema_links (
        url, elements, patterns, template_schema_id, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [url, JSON.stringify(elements), JSON.stringify(patterns), templateSchema.id]);

    await this.db.query(`
      INSERT INTO style_guide_templates (
        id, name, style_guide, framework, framework_version, 
        components, patterns, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      templateSchema.id,
      templateSchema.name,
      templateSchema.styleGuide,
      templateSchema.framework,
      templateSchema.frameworkVersion,
      JSON.stringify(templateSchema.components),
      JSON.stringify(templateSchema.patterns),
      JSON.stringify(templateSchema.metadata)
    ]);
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get Material Design schema
   */
  async getMaterialDesignSchema(): Promise<any> {
    const result = await this.db.query(`
      SELECT * FROM material_design_schema LIMIT 1
    `);
    
    return result.rows[0]?.schema || null;
  }

  /**
   * Get style guide templates
   */
  async getStyleGuideTemplates(): Promise<TemplateSchema[]> {
    const result = await this.db.query(`
      SELECT * FROM style_guide_templates
      ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      styleGuide: row.style_guide,
      framework: row.framework,
      frameworkVersion: row.framework_version,
      components: row.components,
      patterns: row.patterns,
      metadata: row.metadata
    }));
  }

  /**
   * Get schema links for URL
   */
  async getSchemaLinksForURL(url: string): Promise<any> {
    const result = await this.db.query(`
      SELECT * FROM component_schema_links
      WHERE url = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [url]);
    
    return result.rows[0] || null;
  }
}
