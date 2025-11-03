/**
 * Layer to Code Translator
 * 
 * Translates 3D layer data to reusable component code.
 * Features:
 * - Multi-framework code generation (React, Vue, HTML/CSS)
 * - SVG rendering for vector components
 * - Component isolation from full page 3D maps
 * - Worker task generation for component refinement
 * - Reusable code library creation
 */

import { Pool } from 'pg';

interface Layer3DData {
  elementId: string;
  tagName: string;
  bounds: { x: number; y: number; width: number; height: number };
  styles: Record<string, any>;
  attributes: Record<string, string>;
  children: Layer3DData[];
  paintStatus: 'painted' | 'unpainted';
  paintTimestamp?: number;
}

interface CodeGenerationConfig {
  framework: 'react' | 'vue' | 'html' | 'svg';
  componentName: string;
  styleGuide?: string;
  includeStyles?: boolean;
  includeAccessibility?: boolean;
  responsive?: boolean;
}

interface WorkerTask {
  id: string;
  type: string;
  componentId: string;
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  metadata: any;
}

export class LayerToCodeTranslator {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Isolate specific component from full page 3D map
   */
  async isolateComponent(
    fullPageLayers: Layer3DData,
    targetSelector: string
  ): Promise<Layer3DData | null> {
    // Find target element in layer tree
    const targetLayer = this.findLayerBySelector(fullPageLayers, targetSelector);
    
    if (!targetLayer) {
      return null;
    }

    // Extract component and its descendants
    const isolatedComponent = this.extractComponentTree(targetLayer);
    
    // Normalize coordinates (make component root at 0,0)
    const normalized = this.normalizeCoordinates(isolatedComponent);
    
    return normalized;
  }

  /**
   * Translate 3D layer to code
   */
  async translateToCode(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): Promise<{
    code: string;
    styles?: string;
    tests?: string;
    documentation?: string;
  }> {
    let code = '';
    let styles = '';
    
    switch (config.framework) {
      case 'react':
        code = await this.generateReactComponent(layerData, config);
        if (config.includeStyles) {
          styles = await this.generateReactStyles(layerData);
        }
        break;
        
      case 'vue':
        code = await this.generateVueComponent(layerData, config);
        break;
        
      case 'html':
        code = await this.generateHTMLComponent(layerData, config);
        if (config.includeStyles) {
          styles = await this.generateCSS(layerData);
        }
        break;
        
      case 'svg':
        code = await this.generateSVGComponent(layerData, config);
        break;
    }

    // Generate tests if needed
    const tests = await this.generateTests(layerData, config);
    
    // Generate documentation
    const documentation = await this.generateDocumentation(layerData, config);
    
    // Save to code mappings
    await this.saveCodeMapping(layerData.elementId, config.framework, code);
    
    return { code, styles, tests, documentation };
  }

  /**
   * Generate React component
   */
  private async generateReactComponent(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): Promise<string> {
    const componentName = config.componentName || 'Component';
    
    let code = `import React from 'react';\n\n`;
    
    if (config.includeStyles) {
      code += `import './${componentName}.css';\n\n`;
    }
    
    // Extract props from layer data
    const props = this.extractPropsFromLayer(layerData);
    const propsInterface = this.generatePropsInterface(props, componentName);
    
    code += propsInterface + '\n\n';
    
    // Component definition
    code += `const ${componentName}: React.FC<${componentName}Props> = ({\n`;
    code += props.map(p => `  ${p.name}`).join(',\n');
    code += '\n}) => {\n';
    code += '  return (\n';
    code += this.generateReactJSX(layerData, 2);
    code += '  );\n';
    code += '};\n\n';
    code += `export default ${componentName};\n`;
    
    return code;
  }

  /**
   * Generate React JSX from layer
   */
  private generateReactJSX(layerData: Layer3DData, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const { tagName, attributes, children } = layerData;
    
    let jsx = `${spaces}<${tagName}`;
    
    // Add className
    if (attributes.class) {
      jsx += ` className="${attributes.class}"`;
    }
    
    // Add ARIA attributes if accessibility enabled
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('aria-') || key === 'role') {
        jsx += ` ${key}="${value}"`;
      }
    }
    
    // Add inline styles if no CSS file
    const styles = this.convertStylesToReact(layerData.styles);
    if (Object.keys(styles).length > 0) {
      jsx += ` style={${JSON.stringify(styles)}}`;
    }
    
    if (children.length === 0) {
      jsx += ' />\n';
    } else {
      jsx += '>\n';
      
      for (const child of children) {
        jsx += this.generateReactJSX(child, indent + 1);
      }
      
      jsx += `${spaces}</${tagName}>\n`;
    }
    
    return jsx;
  }

  /**
   * Generate Vue component
   */
  private async generateVueComponent(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): Promise<string> {
    const componentName = config.componentName || 'Component';
    
    let code = '<template>\n';
    code += this.generateVueTemplate(layerData, 1);
    code += '</template>\n\n';
    
    code += '<script>\n';
    code += 'export default {\n';
    code += `  name: '${componentName}',\n`;
    
    const props = this.extractPropsFromLayer(layerData);
    if (props.length > 0) {
      code += '  props: {\n';
      for (const prop of props) {
        code += `    ${prop.name}: { type: ${prop.type}, required: ${prop.required} },\n`;
      }
      code += '  },\n';
    }
    
    code += '};\n';
    code += '</script>\n\n';
    
    if (config.includeStyles) {
      code += '<style scoped>\n';
      code += await this.generateCSS(layerData);
      code += '</style>\n';
    }
    
    return code;
  }

  /**
   * Generate Vue template
   */
  private generateVueTemplate(layerData: Layer3DData, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const { tagName, attributes, children } = layerData;
    
    let template = `${spaces}<${tagName}`;
    
    // Add class binding
    if (attributes.class) {
      template += ` class="${attributes.class}"`;
    }
    
    // Add attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (key !== 'class') {
        template += ` ${key}="${value}"`;
      }
    }
    
    if (children.length === 0) {
      template += ' />\n';
    } else {
      template += '>\n';
      
      for (const child of children) {
        template += this.generateVueTemplate(child, indent + 1);
      }
      
      template += `${spaces}</${tagName}>\n`;
    }
    
    return template;
  }

  /**
   * Generate HTML component
   */
  private async generateHTMLComponent(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): Promise<string> {
    let html = this.generateHTML(layerData, 0);
    return html;
  }

  /**
   * Generate HTML
   */
  private generateHTML(layerData: Layer3DData, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const { tagName, attributes, children } = layerData;
    
    let html = `${spaces}<${tagName}`;
    
    // Add all attributes
    for (const [key, value] of Object.entries(attributes)) {
      html += ` ${key}="${value}"`;
    }
    
    // Add inline styles
    const styleString = this.convertStylesToCSS(layerData.styles);
    if (styleString) {
      html += ` style="${styleString}"`;
    }
    
    if (children.length === 0) {
      html += ' />\n';
    } else {
      html += '>\n';
      
      for (const child of children) {
        html += this.generateHTML(child, indent + 1);
      }
      
      html += `${spaces}</${tagName}>\n`;
    }
    
    return html;
  }

  /**
   * Generate SVG component
   */
  private async generateSVGComponent(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): Promise<string> {
    const { bounds } = layerData;
    
    let svg = `<svg width="${bounds.width}" height="${bounds.height}" xmlns="http://www.w3.org/2000/svg">\n`;
    
    // Add defs for filters/gradients
    svg += '  <defs>\n';
    svg += this.generateSVGDefs(layerData);
    svg += '  </defs>\n';
    
    // Generate SVG elements
    svg += this.generateSVGElements(layerData, 1);
    
    svg += '</svg>';
    
    return svg;
  }

  /**
   * Generate SVG elements from layer
   */
  private generateSVGElements(layerData: Layer3DData, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    const { tagName, bounds, styles, children } = layerData;
    
    let svg = '';
    
    // Convert DOM element to SVG primitive
    if (tagName === 'div' || tagName === 'section') {
      // Render as rect
      svg += `${spaces}<rect x="${bounds.x}" y="${bounds.y}" `;
      svg += `width="${bounds.width}" height="${bounds.height}" `;
      svg += `fill="${styles.backgroundColor || '#FFFFFF'}" `;
      svg += `stroke="${styles.borderColor || 'none'}" `;
      svg += `rx="${this.parseBorderRadius(styles.borderRadius)}" />\n`;
    } else if (tagName === 'button') {
      // Render button as rect + text
      svg += `${spaces}<rect x="${bounds.x}" y="${bounds.y}" `;
      svg += `width="${bounds.width}" height="${bounds.height}" `;
      svg += `fill="${styles.backgroundColor || '#6750A4'}" `;
      svg += `rx="${this.parseBorderRadius(styles.borderRadius) || 4}" />\n`;
    } else if (tagName === 'img') {
      // Render as image
      svg += `${spaces}<image x="${bounds.x}" y="${bounds.y}" `;
      svg += `width="${bounds.width}" height="${bounds.height}" `;
      svg += `href="${layerData.attributes.src || ''}" />\n`;
    }
    
    // Render children
    for (const child of children) {
      svg += this.generateSVGElements(child, indent);
    }
    
    return svg;
  }

  /**
   * Create worker tasks for component refinement
   */
  async createWorkerTasks(
    componentId: string,
    layerData: Layer3DData,
    framework: string
  ): Promise<WorkerTask[]> {
    const tasks: WorkerTask[] = [];
    
    // Task 1: Extract and validate structure
    tasks.push({
      id: this.generateTaskId(),
      type: 'extract_structure',
      componentId,
      description: 'Extract component structure from 3D layer data',
      priority: 1,
      status: 'pending',
      metadata: { layerId: layerData.elementId }
    });
    
    // Task 2: Apply style guide rules
    tasks.push({
      id: this.generateTaskId(),
      type: 'apply_style_guide',
      componentId,
      description: 'Apply style guide rules systematically',
      priority: 2,
      status: 'pending',
      metadata: { framework }
    });
    
    // Task 3: Generate code for all frameworks
    tasks.push({
      id: this.generateTaskId(),
      type: 'generate_code',
      componentId,
      description: `Generate ${framework} code`,
      priority: 3,
      status: 'pending',
      metadata: { framework }
    });
    
    // Task 4: Create SVG alternative
    tasks.push({
      id: this.generateTaskId(),
      type: 'generate_svg',
      componentId,
      description: 'Create SVG representation',
      priority: 4,
      status: 'pending',
      metadata: {}
    });
    
    // Task 5: Accessibility validation
    tasks.push({
      id: this.generateTaskId(),
      type: 'validate_accessibility',
      componentId,
      description: 'Validate WCAG 2.1 compliance',
      priority: 5,
      status: 'pending',
      metadata: {}
    });
    
    // Task 6: Responsive testing
    tasks.push({
      id: this.generateTaskId(),
      type: 'test_responsive',
      componentId,
      description: 'Test responsive behavior',
      priority: 6,
      status: 'pending',
      metadata: {}
    });
    
    // Task 7: Documentation
    tasks.push({
      id: this.generateTaskId(),
      type: 'generate_docs',
      componentId,
      description: 'Generate component documentation',
      priority: 7,
      status: 'pending',
      metadata: {}
    });
    
    // Save tasks to database
    for (const task of tasks) {
      await this.saveWorkerTask(task);
    }
    
    return tasks;
  }

  /**
   * Helper methods
   */
  private findLayerBySelector(layerData: Layer3DData, selector: string): Layer3DData | null {
    // Simple selector matching - would use proper CSS selector parsing
    if (layerData.elementId === selector || layerData.attributes.id === selector) {
      return layerData;
    }
    
    for (const child of layerData.children) {
      const found = this.findLayerBySelector(child, selector);
      if (found) return found;
    }
    
    return null;
  }

  private extractComponentTree(layer: Layer3DData): Layer3DData {
    return { ...layer };
  }

  private normalizeCoordinates(layer: Layer3DData): Layer3DData {
    const minX = layer.bounds.x;
    const minY = layer.bounds.y;
    
    const normalized = { ...layer };
    normalized.bounds = {
      ...layer.bounds,
      x: 0,
      y: 0
    };
    
    // Normalize children recursively
    normalized.children = layer.children.map(child => {
      const normalizedChild = { ...child };
      normalizedChild.bounds = {
        ...child.bounds,
        x: child.bounds.x - minX,
        y: child.bounds.y - minY
      };
      return this.normalizeCoordinates(normalizedChild);
    });
    
    return normalized;
  }

  private extractPropsFromLayer(layerData: Layer3DData): Array<{
    name: string;
    type: string;
    required: boolean;
  }> {
    // Extract potential props from dynamic content
    return [
      { name: 'className', type: 'String', required: false },
      { name: 'children', type: 'ReactNode', required: false }
    ];
  }

  private generatePropsInterface(
    props: Array<{ name: string; type: string; required: boolean }>,
    componentName: string
  ): string {
    let code = `interface ${componentName}Props {\n`;
    for (const prop of props) {
      code += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};\n`;
    }
    code += '}';
    return code;
  }

  private convertStylesToReact(styles: Record<string, any>): Record<string, any> {
    const reactStyles: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(styles)) {
      // Convert kebab-case to camelCase
      const reactKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      reactStyles[reactKey] = value;
    }
    
    return reactStyles;
  }

  private convertStylesToCSS(styles: Record<string, any>): string {
    const cssProps = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    return cssProps;
  }

  private async generateReactStyles(layerData: Layer3DData): Promise<string> {
    let css = `.${layerData.attributes.class || 'component'} {\n`;
    
    for (const [key, value] of Object.entries(layerData.styles)) {
      css += `  ${key}: ${value};\n`;
    }
    
    css += '}\n';
    return css;
  }

  private async generateCSS(layerData: Layer3DData): Promise<string> {
    return this.generateReactStyles(layerData);
  }

  private async generateTests(layerData: Layer3DData, config: CodeGenerationConfig): Promise<string> {
    return `// Tests for ${config.componentName}\n// TODO: Add tests\n`;
  }

  private async generateDocumentation(
    layerData: Layer3DData,
    config: CodeGenerationConfig
  ): string {
    return `# ${config.componentName}\n\nComponent extracted from 3D layer data.\n`;
  }

  private generateSVGDefs(layerData: Layer3DData): string {
    return ''; // Add filters, gradients, etc.
  }

  private parseBorderRadius(borderRadius?: string): number {
    if (!borderRadius) return 0;
    return parseInt(borderRadius) || 0;
  }

  private async saveCodeMapping(elementId: string, framework: string, code: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO component_code_mappings (element_id, framework, code)
       VALUES ($1, $2, $3)
       ON CONFLICT (element_id, framework) DO UPDATE SET code = $3`,
      [elementId, framework, code]
    );
  }

  private async saveWorkerTask(task: WorkerTask): Promise<void> {
    await this.pool.query(
      `INSERT INTO worker_tasks 
       (id, type, component_id, description, priority, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [task.id, task.type, task.componentId, task.description, task.priority, task.status, JSON.stringify(task.metadata)]
    );
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
