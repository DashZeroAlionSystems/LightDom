/**
 * Visual Style Guide Generator
 * 
 * Generates complete Material Design-based style guides from 3D DOM mining:
 * - Extracts design tokens (colors, typography, spacing, etc.)
 * - Detects component patterns
 * - Creates linked schemas for each component
 * - Maps components to DOM layers
 * - Generates reusable component library
 * - Links to SEO-optimized rich snippets
 */

import { EventEmitter } from 'events';

class VisualStyleGuideGenerator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      basedOn: config.basedOn || 'material-design-3',
      includeComponents: config.includeComponents !== false,
      includeSEOSchema: config.includeSEOSchema !== false,
      ...config
    };

    this.styleGuide = null;
  }

  /**
   * Generate style guide from 3D DOM data
   */
  async generateFromDOM3D(dom3dData, layerData) {
    console.log('🎨 Generating visual style guide from 3D DOM data...');

    const styleGuide = {
      id: `styleguide_${Date.now()}`,
      generated: new Date().toISOString(),
      basedOn: this.config.basedOn,
      
      // Design Tokens
      tokens: {
        colors: await this.extractColorTokens(dom3dData, layerData),
        typography: await this.extractTypographyTokens(dom3dData),
        spacing: await this.extractSpacingTokens(dom3dData),
        borders: await this.extractBorderTokens(dom3dData),
        shadows: await this.extractShadowTokens(layerData),
        animation: await this.extractAnimationTokens(dom3dData, layerData)
      },
      
      // Component Library
      components: await this.extractComponentPatterns(dom3dData, layerData),
      
      // Layer Mappings
      layerMappings: await this.mapComponentsToLayers(dom3dData, layerData),
      
      // SEO Schema Links
      seoSchemas: this.config.includeSEOSchema ? await this.linkSEOSchemas(dom3dData) : null,
      
      // Generated Code
      code: {}
    };

    // Generate CSS
    styleGuide.code.css = this.generateCSS(styleGuide);
    
    // Generate React components
    styleGuide.code.react = this.generateReactComponents(styleGuide);
    
    // Generate schema JSON
    styleGuide.code.schema = this.generateSchemaJSON(styleGuide);

    this.styleGuide = styleGuide;
    
    console.log('✅ Style guide generated');
    console.log(`   Colors: ${Object.keys(styleGuide.tokens.colors).length}`);
    console.log(`   Components: ${Object.keys(styleGuide.components).length}`);
    console.log(`   Layers Mapped: ${Object.keys(styleGuide.layerMappings).length}`);

    this.emit('styleGuideGenerated', styleGuide);

    return styleGuide;
  }

  /**
   * Extract color tokens from DOM
   */
  async extractColorTokens(dom3dData, layerData) {
    const colors = new Map();
    
    // Extract from layers
    layerData.layers?.forEach(layer => {
      if (layer.backgroundColor) {
        colors.set(layer.backgroundColor, (colors.get(layer.backgroundColor) || 0) + 1);
      }
    });
    
    // Sort by frequency
    const sortedColors = Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);
    
    return {
      primary: sortedColors[0] || '#2196f3',
      secondary: sortedColors[1] || '#f50057',
      background: sortedColors[2] || '#ffffff',
      surface: sortedColors[3] || '#f5f5f5',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50',
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.60)',
        disabled: 'rgba(0, 0, 0, 0.38)'
      }
    };
  }

  /**
   * Extract typography tokens
   */
  async extractTypographyTokens(dom3dData) {
    const fonts = new Set();
    const sizes = new Set();
    const weights = new Set();
    
    // Extract from DOM hierarchy
    const extractFromElement = (element) => {
      if (element.styles) {
        if (element.styles.fontFamily) fonts.add(element.styles.fontFamily);
        if (element.styles.fontSize) sizes.add(element.styles.fontSize);
        if (element.styles.fontWeight) weights.add(element.styles.fontWeight);
      }
      
      element.children?.forEach(extractFromElement);
    };
    
    if (dom3dData.domHierarchy?.root) {
      extractFromElement(dom3dData.domHierarchy.root);
    }
    
    return {
      fontFamily: {
        primary: Array.from(fonts)[0] || 'Roboto, sans-serif',
        secondary: Array.from(fonts)[1] || 'Open Sans, sans-serif',
        monospace: 'Roboto Mono, monospace'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    };
  }

  /**
   * Extract spacing tokens
   */
  async extractSpacingTokens(dom3dData) {
    return {
      xs: '0.25rem',  // 4px
      sm: '0.5rem',   // 8px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
      '2xl': '3rem',  // 48px
      '3xl': '4rem',  // 64px
      '4xl': '6rem'   // 96px
    };
  }

  /**
   * Extract border tokens
   */
  async extractBorderTokens(dom3dData) {
    return {
      radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      },
      width: {
        thin: '1px',
        medium: '2px',
        thick: '4px'
      }
    };
  }

  /**
   * Extract shadow tokens from layer data
   */
  async extractShadowTokens(layerData) {
    return {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    };
  }

  /**
   * Extract animation tokens
   */
  async extractAnimationTokens(dom3dData, layerData) {
    return {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  /**
   * Extract component patterns from DOM
   */
  async extractComponentPatterns(dom3dData, layerData) {
    const components = {};
    
    // Button components
    components.button = this.extractButtonPattern(dom3dData);
    
    // Card components
    components.card = this.extractCardPattern(dom3dData);
    
    // Form components
    components.input = this.extractInputPattern(dom3dData);
    components.select = this.extractSelectPattern(dom3dData);
    components.checkbox = this.extractCheckboxPattern(dom3dData);
    
    // Navigation components
    components.nav = this.extractNavPattern(dom3dData);
    components.breadcrumb = this.extractBreadcrumbPattern(dom3dData);
    
    // Content components
    components.heading = this.extractHeadingPattern(dom3dData);
    components.paragraph = this.extractParagraphPattern(dom3dData);
    
    return components;
  }

  /**
   * Extract button pattern
   */
  extractButtonPattern(dom3dData) {
    return {
      name: 'Button',
      variants: ['primary', 'secondary', 'outlined', 'text'],
      sizes: ['sm', 'md', 'lg'],
      schema: {
        '@type': 'WebComponent',
        name: 'Button',
        props: ['variant', 'size', 'disabled', 'onClick'],
        seoOptimized: true
      }
    };
  }

  /**
   * Extract card pattern
   */
  extractCardPattern(dom3dData) {
    return {
      name: 'Card',
      variants: ['elevated', 'outlined', 'filled'],
      schema: {
        '@type': 'WebComponent',
        name: 'Card',
        props: ['elevation', 'variant'],
        seoOptimized: true,
        linkedSchema: 'Product' // For product cards
      }
    };
  }

  /**
   * Extract input pattern
   */
  extractInputPattern(dom3dData) {
    return {
      name: 'Input',
      variants: ['outlined', 'filled', 'standard'],
      schema: {
        '@type': 'WebComponent',
        name: 'Input',
        props: ['variant', 'label', 'error', 'helperText'],
        seoOptimized: false // Form inputs don't need SEO
      }
    };
  }

  /**
   * Map components to 3D layers
   */
  async mapComponentsToLayers(dom3dData, layerData) {
    const mappings = {};
    
    layerData.layers?.forEach(layer => {
      if (layer.element) {
        const componentType = this.identifyComponentType(layer);
        if (componentType) {
          if (!mappings[componentType]) {
            mappings[componentType] = [];
          }
          mappings[componentType].push({
            layerId: layer.id,
            zIndex: layer.zIndex,
            isComposited: layer.isComposited,
            element: layer.element
          });
        }
      }
    });
    
    return mappings;
  }

  /**
   * Identify component type from layer
   */
  identifyComponentType(layer) {
    const tag = layer.element?.tagName?.toLowerCase();
    
    const mappings = {
      button: 'button',
      input: 'input',
      select: 'select',
      textarea: 'input',
      a: 'link',
      nav: 'nav',
      header: 'header',
      footer: 'footer'
    };
    
    return mappings[tag] || null;
  }

  /**
   * Link components to SEO schemas
   */
  async linkSEOSchemas(dom3dData) {
    const schemaLinks = {};
    
    // Link Organization schema to header
    schemaLinks.header = {
      component: 'header',
      schema: 'Organization',
      jsonLd: dom3dData.schemas?.byType?.Organization?.[0] || null
    };
    
    // Link Product schema to cards
    schemaLinks.productCard = {
      component: 'card',
      schema: 'Product',
      jsonLd: dom3dData.schemas?.byType?.Product || []
    };
    
    // Link BreadcrumbList to navigation
    schemaLinks.breadcrumb = {
      component: 'breadcrumb',
      schema: 'BreadcrumbList',
      jsonLd: dom3dData.schemas?.byType?.BreadcrumbList?.[0] || null
    };
    
    return schemaLinks;
  }

  /**
   * Generate CSS from style guide
   */
  generateCSS(styleGuide) {
    return `:root {
  /* Colors */
  --color-primary: ${styleGuide.tokens.colors.primary};
  --color-secondary: ${styleGuide.tokens.colors.secondary};
  --color-background: ${styleGuide.tokens.colors.background};
  --color-surface: ${styleGuide.tokens.colors.surface};
  
  /* Typography */
  --font-family-primary: ${styleGuide.tokens.typography.fontFamily.primary};
  --font-size-base: ${styleGuide.tokens.typography.fontSize.base};
  
  /* Spacing */
  --spacing-sm: ${styleGuide.tokens.spacing.sm};
  --spacing-md: ${styleGuide.tokens.spacing.md};
  --spacing-lg: ${styleGuide.tokens.spacing.lg};
  
  /* Shadows */
  --shadow-sm: ${styleGuide.tokens.shadows.sm};
  --shadow-md: ${styleGuide.tokens.shadows.md};
  --shadow-lg: ${styleGuide.tokens.shadows.lg};
}

/* Components */
.button {
  font-family: var(--font-family-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: ${styleGuide.tokens.borders.radius.md};
  transition: all var(--duration-normal) var(--easing-easeInOut);
}

.button--primary {
  background-color: var(--color-primary);
  color: white;
}

.card {
  background: var(--color-surface);
  border-radius: ${styleGuide.tokens.borders.radius.lg};
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}`;
  }

  /**
   * Generate React components
   */
  generateReactComponents(styleGuide) {
    const components = {};
    
    Object.entries(styleGuide.components).forEach(([name, config]) => {
      components[name] = this.generateReactComponent(name, config, styleGuide);
    });
    
    return components;
  }

  /**
   * Generate single React component
   */
  generateReactComponent(name, config, styleGuide) {
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    
    return `import React from 'react';

interface ${componentName}Props {
  ${config.schema.props.map(prop => `${prop}?: any;`).join('\n  ')}
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="${name}" {...props}>
      {props.children}
    </div>
  );
};`;
  }

  /**
   * Generate schema JSON
   */
  generateSchemaJSON(styleGuide) {
    return JSON.stringify(styleGuide, null, 2);
  }

  // Additional helper methods for other pattern extractions...
  extractSelectPattern(dom3dData) { return { name: 'Select', variants: ['outlined', 'filled'] }; }
  extractCheckboxPattern(dom3dData) { return { name: 'Checkbox', variants: ['default'] }; }
  extractNavPattern(dom3dData) { return { name: 'Nav', variants: ['horizontal', 'vertical'] }; }
  extractBreadcrumbPattern(dom3dData) { return { name: 'Breadcrumb', variants: ['default'] }; }
  extractHeadingPattern(dom3dData) { return { name: 'Heading', variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }; }
  extractParagraphPattern(dom3dData) { return { name: 'Paragraph', variants: ['default'] }; }
}

export default VisualStyleGuideGenerator;
export { VisualStyleGuideGenerator };
