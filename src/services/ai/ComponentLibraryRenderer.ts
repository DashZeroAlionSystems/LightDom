/**
 * Component Library Renderer
 * 
 * Renders components from style guides with live preview capabilities.
 * Features:
 * - Visual component list with thumbnails
 * - Code/Preview toggle buttons
 * - Live rendering in iframe sandbox
 * - 3D layer integration for component extraction
 * - SVG generation from layer data
 * - Style guide-driven systematic rendering
 */

import { Pool } from 'pg';
import puppeteer, { Browser, Page } from 'puppeteer';

interface ComponentLibraryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  styleGuide: string;
  framework: 'react' | 'vue' | 'html' | 'svg';
  code: string;
  thumbnail?: string;
  tags: string[];
  metadata: any;
}

interface RenderConfig {
  componentId: string;
  renderMode: 'live' | 'svg' | 'both';
  styleGuideRules: StyleGuideRule[];
  viewport?: { width: number; height: number };
  interactive?: boolean;
}

interface StyleGuideRule {
  property: string;
  value: any;
  source: string; // e.g., "material-design", "bootstrap"
  enforced: boolean;
}

interface Layer3DData {
  elementId: string;
  bounds: { x: number; y: number; width: number; height: number };
  styles: Record<string, any>;
  children: Layer3DData[];
  paintStatus: 'painted' | 'unpainted';
}

export class ComponentLibraryRenderer {
  private pool: Pool;
  private browser: Browser | null = null;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Initialize browser for rendering
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  /**
   * Get all components from library
   */
  async getComponents(filters?: {
    category?: string;
    styleGuide?: string;
    framework?: string;
    search?: string;
  }): Promise<ComponentLibraryItem[]> {
    let query = 'SELECT * FROM component_library_items WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(filters.category);
    }
    if (filters?.styleGuide) {
      query += ` AND style_guide = $${paramIndex++}`;
      params.push(filters.styleGuide);
    }
    if (filters?.framework) {
      query += ` AND framework = $${paramIndex++}`;
      params.push(filters.framework);
    }
    if (filters?.search) {
      query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY category, name';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Render component with live preview
   */
  async renderComponent(config: RenderConfig): Promise<{
    html: string;
    svg?: string;
    screenshot?: Buffer;
  }> {
    await this.initialize();

    const component = await this.getComponentById(config.componentId);
    if (!component) {
      throw new Error(`Component ${config.componentId} not found`);
    }

    // Get render configuration
    const renderConfig = await this.getRenderConfig(config.componentId);
    
    // Apply style guide rules
    const styledCode = await this.applyStyleGuideRules(
      component.code,
      config.styleGuideRules || renderConfig.styleGuideRules
    );

    let html = '';
    let svg = '';
    let screenshot: Buffer | undefined;

    if (config.renderMode === 'live' || config.renderMode === 'both') {
      // Render live component
      const liveResult = await this.renderLive(styledCode, component.framework, config.viewport);
      html = liveResult.html;
      screenshot = liveResult.screenshot;
    }

    if (config.renderMode === 'svg' || config.renderMode === 'both') {
      // Generate SVG representation
      svg = await this.generateSVG(component, config.styleGuideRules);
    }

    return { html, svg, screenshot };
  }

  /**
   * Render live component in browser
   */
  private async renderLive(
    code: string,
    framework: string,
    viewport?: { width: number; height: number }
  ): Promise<{ html: string; screenshot: Buffer }> {
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    
    if (viewport) {
      await page.setViewport(viewport);
    }

    try {
      // Create HTML wrapper based on framework
      let html = '';
      
      if (framework === 'react') {
        html = this.createReactWrapper(code);
      } else if (framework === 'vue') {
        html = this.createVueWrapper(code);
      } else {
        html = code; // Plain HTML
      }

      await page.setContent(html);
      await page.waitForTimeout(1000); // Let component render

      const screenshot = await page.screenshot({ type: 'png' });
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);

      return { html: bodyHTML, screenshot };
    } finally {
      await page.close();
    }
  }

  /**
   * Generate SVG representation from component
   */
  private async generateSVG(
    component: ComponentLibraryItem,
    styleGuideRules?: StyleGuideRule[]
  ): Promise<string> {
    // Check cache first
    const cached = await this.getSVGFromCache(component.id);
    if (cached) return cached;

    // Parse component structure
    const structure = await this.parseComponentStructure(component.code);
    
    // Apply style guide rules to SVG
    const svg = this.buildSVGFromStructure(structure, styleGuideRules);
    
    // Cache SVG
    await this.cacheSVG(component.id, svg);
    
    return svg;
  }

  /**
   * Build SVG from component structure
   */
  private buildSVGFromStructure(
    structure: any,
    styleGuideRules?: StyleGuideRule[]
  ): string {
    const { width = 300, height = 200, elements = [] } = structure;
    
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add style definitions
    svgContent += '<defs>';
    
    // Add elevation filters if Material Design
    if (styleGuideRules?.some(r => r.source === 'material-design')) {
      svgContent += this.generateMaterialElevationFilters();
    }
    
    svgContent += '</defs>';
    
    // Render elements
    for (const element of elements) {
      svgContent += this.renderSVGElement(element, styleGuideRules);
    }
    
    svgContent += '</svg>';
    
    return svgContent;
  }

  /**
   * Render individual SVG element
   */
  private renderSVGElement(element: any, styleGuideRules?: StyleGuideRule[]): string {
    const { type, x = 0, y = 0, width, height, text, style = {} } = element;
    
    // Apply style guide rules
    const appliedStyle = this.applyStyleGuideToSVG(style, styleGuideRules);
    
    if (type === 'rect') {
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${appliedStyle.fill || '#FFFFFF'}" 
              stroke="${appliedStyle.stroke || 'none'}" 
              rx="${appliedStyle.borderRadius || 0}" 
              filter="${appliedStyle.filter || 'none'}"/>`;
    } else if (type === 'text') {
      return `<text x="${x}" y="${y}" 
              fill="${appliedStyle.fill || '#000000'}" 
              font-size="${appliedStyle.fontSize || '14px'}" 
              font-weight="${appliedStyle.fontWeight || 'normal'}" 
              text-anchor="${appliedStyle.textAnchor || 'start'}">${text}</text>`;
    } else if (type === 'circle') {
      return `<circle cx="${x}" cy="${y}" r="${width / 2}" 
              fill="${appliedStyle.fill || '#FFFFFF'}" 
              stroke="${appliedStyle.stroke || 'none'}"/>`;
    }
    
    return '';
  }

  /**
   * Apply style guide rules to component code
   */
  private async applyStyleGuideRules(
    code: string,
    rules: StyleGuideRule[]
  ): Promise<string> {
    let styledCode = code;
    
    for (const rule of rules) {
      if (rule.enforced) {
        // Apply rule transformation
        styledCode = this.applyRuleTransform(styledCode, rule);
      }
    }
    
    return styledCode;
  }

  /**
   * Apply style guide rule to SVG style
   */
  private applyStyleGuideToSVG(
    style: Record<string, any>,
    rules?: StyleGuideRule[]
  ): Record<string, any> {
    if (!rules) return style;
    
    const appliedStyle = { ...style };
    
    for (const rule of rules) {
      if (rule.enforced && rule.property in style) {
        appliedStyle[rule.property] = rule.value;
      }
    }
    
    return appliedStyle;
  }

  /**
   * Extract component from 3D layer data
   */
  async extractComponentFrom3DLayer(
    layerData: Layer3DData,
    styleGuide: string
  ): Promise<ComponentLibraryItem> {
    // Analyze layer structure
    const structure = this.analyze3DLayerStructure(layerData);
    
    // Map to style guide schema
    const schema = await this.mapToStyleGuideSchema(structure, styleGuide);
    
    // Generate code
    const code = await this.generateCodeFromSchema(schema);
    
    // Create component
    const component: ComponentLibraryItem = {
      id: this.generateId(),
      name: schema.name || 'Extracted Component',
      category: schema.category || 'custom',
      description: `Extracted from 3D layer analysis`,
      styleGuide,
      framework: 'react',
      code,
      tags: schema.tags || [],
      metadata: {
        extractedFrom3D: true,
        layerData: structure,
        schema
      }
    };
    
    // Save to library
    await this.saveComponent(component);
    
    // Generate thumbnail
    await this.generateThumbnail(component.id);
    
    return component;
  }

  /**
   * Analyze 3D layer structure
   */
  private analyze3DLayerStructure(layerData: Layer3DData): any {
    return {
      type: this.inferComponentType(layerData),
      bounds: layerData.bounds,
      styles: layerData.styles,
      children: layerData.children.map(child => this.analyze3DLayerStructure(child)),
      painted: layerData.paintStatus === 'painted'
    };
  }

  /**
   * Map structure to style guide schema
   */
  private async mapToStyleGuideSchema(structure: any, styleGuide: string): Promise<any> {
    // Get style guide rules
    const rules = await this.getStyleGuideRules(styleGuide);
    
    // Map component type to style guide component
    const mappedComponent = this.findStyleGuideComponent(structure.type, rules);
    
    return {
      name: mappedComponent?.name || structure.type,
      category: mappedComponent?.category || 'custom',
      properties: this.extractProperties(structure, mappedComponent),
      children: structure.children.map((child: any) => 
        this.mapToStyleGuideSchema(child, styleGuide)
      ),
      tags: mappedComponent?.tags || []
    };
  }

  /**
   * Generate code from schema
   */
  private async generateCodeFromSchema(schema: any): Promise<string> {
    // For React components
    const componentName = this.toPascalCase(schema.name);
    
    let code = `const ${componentName} = (props) => {\n`;
    code += `  return (\n`;
    code += `    <div className="${schema.name.toLowerCase()}">\n`;
    
    // Add properties
    for (const [key, value] of Object.entries(schema.properties || {})) {
      code += `      {/* ${key}: ${value} */}\n`;
    }
    
    // Add children
    for (const child of schema.children || []) {
      code += `      {/* ${child.name} */}\n`;
    }
    
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n`;
    
    return code;
  }

  /**
   * Create React wrapper HTML
   */
  private createReactWrapper(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${code}
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(<Component />);
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Create Vue wrapper HTML
   */
  private createVueWrapper(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const { createApp } = Vue;
          ${code}
          createApp(Component).mount('#app');
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Generate Material Design elevation filters
   */
  private generateMaterialElevationFilters(): string {
    return `
      <filter id="elevation1">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
        <feOffset dx="0" dy="1" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.2"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="elevation2">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.2"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
  }

  /**
   * Helper methods
   */
  private async getComponentById(id: string): Promise<ComponentLibraryItem | null> {
    const result = await this.pool.query(
      'SELECT * FROM component_library_items WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  private async getRenderConfig(componentId: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM component_render_configs WHERE component_id = $1',
      [componentId]
    );
    return result.rows[0] || { styleGuideRules: [] };
  }

  private async getStyleGuideRules(styleGuide: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM style_guide_rules WHERE style_guide = $1',
      [styleGuide]
    );
    return result.rows;
  }

  private async getSVGFromCache(componentId: string): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT svg_content FROM svg_component_cache WHERE component_id = $1',
      [componentId]
    );
    return result.rows[0]?.svg_content || null;
  }

  private async cacheSVG(componentId: string, svg: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO svg_component_cache (component_id, svg_content) 
       VALUES ($1, $2) 
       ON CONFLICT (component_id) DO UPDATE SET svg_content = $2, updated_at = NOW()`,
      [componentId, svg]
    );
  }

  private async saveComponent(component: ComponentLibraryItem): Promise<void> {
    await this.pool.query(
      `INSERT INTO component_library_items 
       (id, name, category, description, style_guide, framework, code, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        component.id,
        component.name,
        component.category,
        component.description,
        component.styleGuide,
        component.framework,
        component.code,
        component.tags,
        JSON.stringify(component.metadata)
      ]
    );
  }

  private async generateThumbnail(componentId: string): Promise<void> {
    const screenshot = await this.renderComponent({
      componentId,
      renderMode: 'live',
      styleGuideRules: [],
      viewport: { width: 300, height: 200 }
    });
    
    if (screenshot.screenshot) {
      await this.pool.query(
        'UPDATE component_library_items SET thumbnail = $1 WHERE id = $2',
        [screenshot.screenshot, componentId]
      );
    }
  }

  private applyRuleTransform(code: string, rule: StyleGuideRule): string {
    // Simple find/replace for style properties
    // In production, would use AST parsing
    return code;
  }

  private parseComponentStructure(code: string): any {
    // Parse component structure from code
    // Simplified version - would use proper parser
    return {
      width: 300,
      height: 200,
      elements: []
    };
  }

  private inferComponentType(layerData: Layer3DData): string {
    // Infer component type from layer data
    return 'div';
  }

  private findStyleGuideComponent(type: string, rules: any[]): any | null {
    return rules.find(r => r.componentType === type) || null;
  }

  private extractProperties(structure: any, mappedComponent: any): any {
    return structure.styles || {};
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, match => match.replace(/-/, '').toUpperCase());
  }

  private generateId(): string {
    return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
