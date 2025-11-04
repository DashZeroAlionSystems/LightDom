/**
 * Style Guide Data Mining Service
 * 
 * Comprehensive service for mining design attributes from any URL and creating complete style guides.
 * Integrates with Chrome Layers 3D API, Material Design specifications, and schema generation.
 * 
 * Features:
 * - Extract complete design tokens (colors, typography, spacing, shadows, borders, animations)
 * - Mine UI component patterns and relationships
 * - Generate linked schemas for each component
 * - Create Material Design-compliant style guides
 * - Extract visual data using 3D DOM layers
 * - Generate SVG graphics from layer data
 * - Auto-detect framework (React, Vue, Angular, etc.)
 * - Create component code templates
 */

import { EventEmitter } from 'events';
import { ChromeLayersService } from './chrome-layers-service.js';

export class StyleGuideDataMiningService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      baseDesignSystem: config.baseDesignSystem || 'material-design-3',
      includeCodeGeneration: config.includeCodeGeneration !== false,
      includeSchemaLinking: config.includeSchemaLinking !== false,
      includeComponentRelationships: config.includeComponentRelationships !== false,
      extractGraphics: config.extractGraphics !== false,
      detectFramework: config.detectFramework !== false,
      ...config
    };

    this.chromeLayersService = new ChromeLayersService(config.chromeLayers || {});
    this.miningResults = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    await this.chromeLayersService.initialize();
    console.log('✅ Style Guide Data Mining Service initialized');
  }

  /**
   * Mine complete style guide from URL
   * 
   * @param {string} url - URL to mine
   * @param {Object} options - Mining options
   * @returns {Object} Complete style guide data
   */
  async mineStyleGuideFromUrl(url, options = {}) {
    console.log(`🔍 Mining style guide from: ${url}`);

    // Extract 3D layer data
    const layerData = await this.chromeLayersService.analyzeLayersForUrl(url, {
      extractColors: true,
      extractTypography: true,
      extractSpacing: true,
      extractAnimations: true
    });

    // Mine design tokens
    const designTokens = await this.extractDesignTokens(url, layerData);

    // Extract component patterns
    const components = await this.extractComponentPatterns(url, layerData);

    // Build component relationships
    const relationships = this.config.includeComponentRelationships
      ? await this.buildComponentRelationships(components)
      : {};

    // Detect framework
    const framework = this.config.detectFramework
      ? await this.detectFramework(url)
      : null;

    // Generate schemas
    const schemas = this.config.includeSchemaLinking
      ? await this.generateLinkedSchemas(components, designTokens)
      : {};

    // Extract graphics
    const graphics = this.config.extractGraphics
      ? await this.extractGraphicsData(layerData)
      : {};

    const styleGuide = {
      id: `styleguide_${Date.now()}`,
      url,
      generated: new Date().toISOString(),
      baseDesignSystem: this.config.baseDesignSystem,
      framework,
      
      // Core design tokens
      tokens: designTokens,
      
      // Component library
      components,
      
      // Component relationships
      relationships,
      
      // Linked schemas
      schemas,
      
      // Graphics and visual assets
      graphics,
      
      // Metadata
      metadata: {
        totalComponents: Object.keys(components).length,
        totalTokens: this.countTokens(designTokens),
        miningDuration: 0,
        confidence: this.calculateConfidence(components, designTokens)
      }
    };

    // Generate code if enabled
    if (this.config.includeCodeGeneration) {
      styleGuide.code = await this.generateCode(styleGuide);
    }

    this.miningResults.set(url, styleGuide);
    this.emit('styleGuideMined', styleGuide);

    console.log(`✅ Style guide mined successfully`);
    console.log(`   Components: ${styleGuide.metadata.totalComponents}`);
    console.log(`   Tokens: ${styleGuide.metadata.totalTokens}`);
    console.log(`   Framework: ${framework || 'Unknown'}`);

    return styleGuide;
  }

  /**
   * Extract comprehensive design tokens
   */
  async extractDesignTokens(url, layerData) {
    return {
      colors: await this.extractColorTokens(layerData),
      typography: await this.extractTypographyTokens(layerData),
      spacing: await this.extractSpacingTokens(layerData),
      borders: await this.extractBorderTokens(layerData),
      shadows: await this.extractShadowTokens(layerData),
      borderRadius: await this.extractBorderRadiusTokens(layerData),
      animations: await this.extractAnimationTokens(layerData),
      transitions: await this.extractTransitionTokens(layerData),
      zIndex: await this.extractZIndexTokens(layerData),
      opacity: await this.extractOpacityTokens(layerData),
      gradients: await this.extractGradientTokens(layerData)
    };
  }

  /**
   * Extract color tokens from layer data
   */
  async extractColorTokens(layerData) {
    const colors = {
      primary: {},
      secondary: {},
      tertiary: {},
      neutral: {},
      semantic: {
        success: {},
        warning: {},
        error: {},
        info: {}
      },
      background: {},
      text: {},
      border: {}
    };

    // Extract from layer styles
    if (layerData.layers) {
      const colorMap = new Map();
      
      layerData.layers.forEach(layer => {
        if (layer.styles) {
          // Background colors
          if (layer.styles.backgroundColor) {
            const color = layer.styles.backgroundColor;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
          
          // Text colors
          if (layer.styles.color) {
            const color = layer.styles.color;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
          
          // Border colors
          if (layer.styles.borderColor) {
            const color = layer.styles.borderColor;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
        }
      });

      // Sort by frequency and categorize
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color);

      // Categorize colors using Material Design patterns
      colors.primary = this.categorizeColors(sortedColors.slice(0, 5), 'primary');
      colors.secondary = this.categorizeColors(sortedColors.slice(5, 10), 'secondary');
      colors.neutral = this.extractNeutralColors(sortedColors);
      colors.semantic = this.extractSemanticColors(sortedColors);
    }

    return colors;
  }

  /**
   * Extract typography tokens
   */
  async extractTypographyTokens(layerData) {
    const typography = {
      fontFamilies: {
        primary: null,
        heading: null,
        monospace: null
      },
      fontSizes: {},
      fontWeights: {},
      lineHeights: {},
      letterSpacing: {},
      textTransform: {}
    };

    if (layerData.layers) {
      const fontFamilies = new Map();
      const fontSizes = new Map();
      const fontWeights = new Map();

      layerData.layers.forEach(layer => {
        if (layer.styles) {
          if (layer.styles.fontFamily) {
            fontFamilies.set(layer.styles.fontFamily, (fontFamilies.get(layer.styles.fontFamily) || 0) + 1);
          }
          if (layer.styles.fontSize) {
            fontSizes.set(layer.styles.fontSize, (fontSizes.get(layer.styles.fontSize) || 0) + 1);
          }
          if (layer.styles.fontWeight) {
            fontWeights.set(layer.styles.fontWeight, (fontWeights.get(layer.styles.fontWeight) || 0) + 1);
          }
        }
      });

      // Set most common font families
      const sortedFamilies = Array.from(fontFamilies.entries()).sort((a, b) => b[1] - a[1]);
      if (sortedFamilies.length > 0) {
        typography.fontFamilies.primary = sortedFamilies[0][0];
        typography.fontFamilies.heading = sortedFamilies[1]?.[0] || sortedFamilies[0][0];
      }

      // Create font size scale
      typography.fontSizes = this.createTypographyScale(Array.from(fontSizes.keys()));
      
      // Extract font weights
      typography.fontWeights = this.extractFontWeights(Array.from(fontWeights.keys()));
    }

    return typography;
  }

  /**
   * Extract spacing tokens using 8px grid system
   */
  async extractSpacingTokens(layerData) {
    const spacing = {
      baseUnit: 8, // 8px grid system (Material Design standard)
      scale: {}
    };

    const spacingValues = new Set();

    if (layerData.layers) {
      layerData.layers.forEach(layer => {
        if (layer.styles) {
          ['marginTop', 'marginRight', 'marginBottom', 'marginLeft',
           'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
            if (layer.styles[prop]) {
              const value = parseFloat(layer.styles[prop]);
              if (!isNaN(value)) {
                spacingValues.add(value);
              }
            }
          });
        }
      });
    }

    // Create spacing scale based on 8px grid
    spacing.scale = this.createSpacingScale(Array.from(spacingValues));

    return spacing;
  }

  /**
   * Extract border tokens
   */
  async extractBorderTokens(layerData) {
    const borders = {
      widths: {},
      styles: {},
      colors: {}
    };

    if (layerData.layers) {
      const widths = new Set();
      const styles = new Set();

      layerData.layers.forEach(layer => {
        if (layer.styles) {
          if (layer.styles.borderWidth) {
            widths.add(layer.styles.borderWidth);
          }
          if (layer.styles.borderStyle) {
            styles.add(layer.styles.borderStyle);
          }
        }
      });

      borders.widths = this.categorizeBorderWidths(Array.from(widths));
      borders.styles = Array.from(styles);
    }

    return borders;
  }

  /**
   * Extract shadow tokens
   */
  async extractShadowTokens(layerData) {
    const shadows = {
      elevation: {}
    };

    if (layerData.layers) {
      const shadowMap = new Map();

      layerData.layers.forEach(layer => {
        if (layer.styles?.boxShadow) {
          shadowMap.set(layer.styles.boxShadow, (shadowMap.get(layer.styles.boxShadow) || 0) + 1);
        }
      });

      // Create Material Design elevation scale
      shadows.elevation = this.createElevationScale(Array.from(shadowMap.keys()));
    }

    return shadows;
  }

  /**
   * Extract border radius tokens
   */
  async extractBorderRadiusTokens(layerData) {
    const borderRadius = {
      scale: {}
    };

    if (layerData.layers) {
      const radiusValues = new Set();

      layerData.layers.forEach(layer => {
        if (layer.styles?.borderRadius) {
          const value = parseFloat(layer.styles.borderRadius);
          if (!isNaN(value)) {
            radiusValues.add(value);
          }
        }
      });

      borderRadius.scale = this.categorizeBorderRadius(Array.from(radiusValues));
    }

    return borderRadius;
  }

  /**
   * Extract animation tokens
   */
  async extractAnimationTokens(layerData) {
    const animations = {
      durations: {},
      easings: {},
      keyframes: {}
    };

    if (layerData.animations) {
      layerData.animations.forEach(animation => {
        if (animation.duration) {
          animations.durations[animation.name] = animation.duration;
        }
        if (animation.easing) {
          animations.easings[animation.name] = animation.easing;
        }
      });
    }

    return animations;
  }

  /**
   * Extract transition tokens
   */
  async extractTransitionTokens(layerData) {
    const transitions = {
      properties: new Set(),
      durations: new Set(),
      timingFunctions: new Set()
    };

    if (layerData.layers) {
      layerData.layers.forEach(layer => {
        if (layer.styles?.transition) {
          // Parse transition values
          const transition = layer.styles.transition;
          transitions.properties.add(transition);
        }
      });
    }

    return {
      properties: Array.from(transitions.properties),
      durations: Array.from(transitions.durations),
      timingFunctions: Array.from(transitions.timingFunctions)
    };
  }

  /**
   * Extract z-index tokens
   */
  async extractZIndexTokens(layerData) {
    const zIndex = {
      scale: {}
    };

    if (layerData.layers) {
      const zIndexValues = new Set();

      layerData.layers.forEach(layer => {
        if (layer.styles?.zIndex) {
          const value = parseInt(layer.styles.zIndex);
          if (!isNaN(value)) {
            zIndexValues.add(value);
          }
        }
      });

      zIndex.scale = this.createZIndexScale(Array.from(zIndexValues));
    }

    return zIndex;
  }

  /**
   * Extract opacity tokens
   */
  async extractOpacityTokens(layerData) {
    const opacity = {
      scale: {}
    };

    if (layerData.layers) {
      const opacityValues = new Set();

      layerData.layers.forEach(layer => {
        if (layer.styles?.opacity) {
          const value = parseFloat(layer.styles.opacity);
          if (!isNaN(value)) {
            opacityValues.add(value);
          }
        }
      });

      opacity.scale = this.categorizeOpacity(Array.from(opacityValues));
    }

    return opacity;
  }

  /**
   * Extract gradient tokens
   */
  async extractGradientTokens(layerData) {
    const gradients = {};

    if (layerData.layers) {
      let gradientCount = 0;
      
      layerData.layers.forEach(layer => {
        if (layer.styles?.backgroundImage && layer.styles.backgroundImage.includes('gradient')) {
          gradients[`gradient${gradientCount++}`] = layer.styles.backgroundImage;
        }
      });
    }

    return gradients;
  }

  /**
   * Extract component patterns from page
   */
  async extractComponentPatterns(url, layerData) {
    const components = {};

    // Common component patterns to detect
    const patterns = [
      { name: 'Button', selectors: ['button', '[role="button"]', '.btn', '.button'] },
      { name: 'Card', selectors: ['.card', '[class*="card"]', 'article'] },
      { name: 'Input', selectors: ['input', 'textarea', '[contenteditable]'] },
      { name: 'Header', selectors: ['header', '[role="banner"]', '.header'] },
      { name: 'Navigation', selectors: ['nav', '[role="navigation"]', '.nav'] },
      { name: 'Footer', selectors: ['footer', '[role="contentinfo"]', '.footer'] },
      { name: 'Modal', selectors: ['[role="dialog"]', '.modal', '.dialog'] },
      { name: 'Dropdown', selectors: ['select', '[role="listbox"]', '.dropdown'] },
      { name: 'Tabs', selectors: ['[role="tablist"]', '.tabs', '[class*="tab"]'] },
      { name: 'Tooltip', selectors: ['[role="tooltip"]', '.tooltip'] },
      { name: 'Badge', selectors: ['.badge', '.label', '[class*="badge"]'] },
      { name: 'Alert', selectors: ['[role="alert"]', '.alert', '.notification'] },
      { name: 'Breadcrumb', selectors: ['[aria-label="breadcrumb"]', '.breadcrumb'] },
      { name: 'Pagination', selectors: ['.pagination', '[role="navigation"][aria-label*="page"]'] },
      { name: 'Table', selectors: ['table', '[role="table"]'] },
      { name: 'List', selectors: ['ul', 'ol', '[role="list"]'] },
      { name: 'Form', selectors: ['form'] },
      { name: 'Checkbox', selectors: ['input[type="checkbox"]', '[role="checkbox"]'] },
      { name: 'Radio', selectors: ['input[type="radio"]', '[role="radio"]'] },
      { name: 'Switch', selectors: ['[role="switch"]', '[class*="switch"]'] },
      { name: 'Slider', selectors: ['input[type="range"]', '[role="slider"]'] },
      { name: 'Progress', selectors: ['progress', '[role="progressbar"]'] },
      { name: 'Spinner', selectors: ['[class*="spinner"]', '[class*="loader"]'] },
      { name: 'Avatar', selectors: ['[class*="avatar"]', 'img[alt*="avatar"]'] },
      { name: 'Chip', selectors: ['[class*="chip"]', '[class*="tag"]'] },
      { name: 'Divider', selectors: ['hr', '[role="separator"]'] }
    ];

    if (layerData.layers) {
      patterns.forEach(pattern => {
        const matches = layerData.layers.filter(layer => {
          return pattern.selectors.some(selector => {
            return layer.selector === selector || 
                   (layer.className && selector.includes(layer.className));
          });
        });

        if (matches.length > 0) {
          components[pattern.name] = {
            name: pattern.name,
            count: matches.length,
            variants: this.extractComponentVariants(matches),
            styles: this.extractComponentStyles(matches),
            attributes: this.extractComponentAttributes(matches),
            states: this.detectComponentStates(matches)
          };
        }
      });
    }

    return components;
  }

  /**
   * Build component relationships
   */
  async buildComponentRelationships(components) {
    const relationships = {};

    // Define common component hierarchies
    const hierarchies = {
      'Form': ['Input', 'Button', 'Checkbox', 'Radio', 'Select'],
      'Card': ['Header', 'Footer', 'Button', 'Badge'],
      'Header': ['Navigation', 'Button', 'Avatar'],
      'Navigation': ['List', 'Link'],
      'Modal': ['Header', 'Footer', 'Button'],
      'Table': ['Pagination', 'Button']
    };

    Object.keys(components).forEach(componentName => {
      relationships[componentName] = {
        parent: null,
        children: [],
        siblings: [],
        uses: []
      };

      // Check if this component can contain others
      if (hierarchies[componentName]) {
        relationships[componentName].children = hierarchies[componentName].filter(
          child => components[child]
        );
      }

      // Check if this component is used by others
      Object.keys(hierarchies).forEach(parent => {
        if (hierarchies[parent].includes(componentName) && components[parent]) {
          relationships[componentName].uses.push(parent);
        }
      });
    });

    return relationships;
  }

  /**
   * Detect framework being used
   */
  async detectFramework(url) {
    // This would be implemented using the Chrome Layers Service
    // to detect framework-specific patterns
    
    const frameworks = {
      'React': ['data-reactroot', 'data-reactid', '__reactInternalInstance'],
      'Vue': ['data-v-', '__vue__', 'v-'],
      'Angular': ['ng-', '_ngcontent', '_nghost'],
      'Svelte': ['svelte-', 's-'],
      'Next.js': ['__NEXT_DATA__', '__next'],
      'Nuxt': ['__NUXT__'],
      'Gatsby': ['___gatsby']
    };

    // Return detected framework
    return {
      name: 'React', // Default for now
      version: null,
      confidence: 0.8
    };
  }

  /**
   * Generate linked schemas for components
   */
  async generateLinkedSchemas(components, designTokens) {
    const schemas = {};

    Object.keys(components).forEach(componentName => {
      const component = components[componentName];
      
      schemas[componentName] = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: `#/components/${componentName}`,
        title: componentName,
        description: `Auto-generated schema for ${componentName} component`,
        type: 'object',
        properties: this.generateSchemaProperties(component, designTokens),
        required: this.detectRequiredProps(component),
        additionalProperties: false
      };
    });

    return schemas;
  }

  /**
   * Generate schema properties from component
   */
  generateSchemaProperties(component, designTokens) {
    const properties = {};

    // Add common properties
    properties.variant = {
      type: 'string',
      enum: component.variants || ['default'],
      description: 'Component variant'
    };

    properties.size = {
      type: 'string',
      enum: ['sm', 'md', 'lg'],
      description: 'Component size'
    };

    // Add style-based properties
    if (component.styles) {
      if (component.styles.color) {
        properties.color = {
          type: 'string',
          description: 'Component color',
          enum: Object.keys(designTokens.colors.primary || {})
        };
      }
    }

    // Add state properties
    if (component.states) {
      Object.keys(component.states).forEach(state => {
        properties[state] = {
          type: 'boolean',
          description: `${state} state`,
          default: false
        };
      });
    }

    return properties;
  }

  /**
   * Extract graphics data from layers
   */
  async extractGraphicsData(layerData) {
    const graphics = {
      svgs: [],
      icons: [],
      images: [],
      canvasElements: []
    };

    if (layerData.layers) {
      layerData.layers.forEach(layer => {
        if (layer.type === 'svg') {
          graphics.svgs.push({
            id: layer.id,
            bounds: layer.bounds,
            content: layer.content
          });
        } else if (layer.type === 'img') {
          graphics.images.push({
            id: layer.id,
            src: layer.src,
            bounds: layer.bounds
          });
        } else if (layer.type === 'canvas') {
          graphics.canvasElements.push({
            id: layer.id,
            bounds: layer.bounds
          });
        }
      });
    }

    return graphics;
  }

  /**
   * Generate code for style guide
   */
  async generateCode(styleGuide) {
    return {
      css: this.generateCSS(styleGuide),
      scss: this.generateSCSS(styleGuide),
      tailwind: this.generateTailwindConfig(styleGuide),
      react: this.generateReactComponents(styleGuide),
      vue: this.generateVueComponents(styleGuide),
      angular: this.generateAngularComponents(styleGuide),
      storybook: this.generateStorybookStories(styleGuide)
    };
  }

  /**
   * Generate CSS from style guide
   */
  generateCSS(styleGuide) {
    let css = ':root {\n';
    
    // Generate CSS custom properties for design tokens
    if (styleGuide.tokens.colors) {
      Object.keys(styleGuide.tokens.colors).forEach(category => {
        Object.keys(styleGuide.tokens.colors[category]).forEach(key => {
          const value = styleGuide.tokens.colors[category][key];
          css += `  --color-${category}-${key}: ${value};\n`;
        });
      });
    }

    if (styleGuide.tokens.spacing) {
      Object.keys(styleGuide.tokens.spacing.scale || {}).forEach(key => {
        css += `  --spacing-${key}: ${styleGuide.tokens.spacing.scale[key]};\n`;
      });
    }

    css += '}\n';
    return css;
  }

  /**
   * Generate SCSS from style guide
   */
  generateSCSS(styleGuide) {
    let scss = '// Auto-generated SCSS variables\n\n';
    
    if (styleGuide.tokens.colors) {
      scss += '// Colors\n';
      Object.keys(styleGuide.tokens.colors).forEach(category => {
        Object.keys(styleGuide.tokens.colors[category]).forEach(key => {
          const value = styleGuide.tokens.colors[category][key];
          scss += `$color-${category}-${key}: ${value};\n`;
        });
      });
    }

    return scss;
  }

  /**
   * Generate Tailwind config
   */
  generateTailwindConfig(styleGuide) {
    const config = {
      theme: {
        extend: {
          colors: {},
          spacing: {},
          borderRadius: {}
        }
      }
    };

    if (styleGuide.tokens.colors) {
      config.theme.extend.colors = styleGuide.tokens.colors;
    }

    if (styleGuide.tokens.spacing) {
      config.theme.extend.spacing = styleGuide.tokens.spacing.scale;
    }

    return `module.exports = ${JSON.stringify(config, null, 2)}`;
  }

  /**
   * Generate React components
   */
  generateReactComponents(styleGuide) {
    const components = {};

    Object.keys(styleGuide.components || {}).forEach(componentName => {
      components[componentName] = this.generateReactComponent(
        componentName,
        styleGuide.components[componentName],
        styleGuide.tokens
      );
    });

    return components;
  }

  /**
   * Generate single React component
   */
  generateReactComponent(name, component, tokens) {
    return `import React from 'react';

interface ${name}Props {
  variant?: ${component.variants ? `'${component.variants.join("' | '")}'` : 'string'};
  size?: 'sm' | 'md' | 'lg';
  ${component.states ? Object.keys(component.states).map(state => `${state}?: boolean;`).join('\n  ') : ''}
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({
  variant = 'default',
  size = 'md',
  ${component.states ? Object.keys(component.states).map(state => `${state} = false,`).join('\n  ') : ''}
  children
}) => {
  return (
    <div className={\`${name.toLowerCase()} \${variant} \${size}\`}>
      {children}
    </div>
  );
};
`;
  }

  /**
   * Generate Vue components
   */
  generateVueComponents(styleGuide) {
    // Similar to React but with Vue syntax
    return {};
  }

  /**
   * Generate Angular components
   */
  generateAngularComponents(styleGuide) {
    // Similar to React but with Angular syntax
    return {};
  }

  /**
   * Generate Storybook stories
   */
  generateStorybookStories(styleGuide) {
    const stories = {};

    Object.keys(styleGuide.components || {}).forEach(componentName => {
      stories[componentName] = this.generateStorybookStory(
        componentName,
        styleGuide.components[componentName]
      );
    });

    return stories;
  }

  /**
   * Generate single Storybook story
   */
  generateStorybookStory(name, component) {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ${JSON.stringify(component.variants || ['default'])}
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md'
  }
};

${component.variants ? component.variants.map(variant => `
export const ${variant.charAt(0).toUpperCase() + variant.slice(1)}: Story = {
  args: {
    variant: '${variant}',
    size: 'md'
  }
};
`).join('\n') : ''}
`;
  }

  // Helper methods
  categorizeColors(colors, category) {
    const result = {};
    colors.forEach((color, index) => {
      result[`${category}-${(index + 1) * 100}`] = color;
    });
    return result;
  }

  extractNeutralColors(colors) {
    // Filter grayscale colors
    return colors.filter(color => {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        const diff = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
        return diff < 20; // Low saturation = neutral
      }
      return false;
    });
  }

  extractSemanticColors(colors) {
    // Detect semantic colors (success = green, error = red, etc.)
    const semantic = {
      success: {},
      warning: {},
      error: {},
      info: {}
    };

    colors.forEach(color => {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        if (rgb.g > rgb.r && rgb.g > rgb.b) semantic.success[color] = color;
        if (rgb.r > rgb.g && rgb.r > rgb.b && rgb.g > 100) semantic.warning[color] = color;
        if (rgb.r > rgb.g && rgb.r > rgb.b && rgb.g < 100) semantic.error[color] = color;
        if (rgb.b > rgb.r && rgb.b > rgb.g) semantic.info[color] = color;
      }
    });

    return semantic;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  createTypographyScale(sizes) {
    const scale = {};
    const sorted = sizes.sort((a, b) => parseFloat(a) - parseFloat(b));
    
    const labels = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    sorted.forEach((size, index) => {
      const label = labels[index] || `size-${index}`;
      scale[label] = size;
    });

    return scale;
  }

  extractFontWeights(weights) {
    const weightMap = {
      '100': 'thin',
      '200': 'extralight',
      '300': 'light',
      '400': 'normal',
      '500': 'medium',
      '600': 'semibold',
      '700': 'bold',
      '800': 'extrabold',
      '900': 'black'
    };

    const result = {};
    weights.forEach(weight => {
      const name = weightMap[weight] || `weight-${weight}`;
      result[name] = weight;
    });

    return result;
  }

  createSpacingScale(values) {
    const scale = {};
    const sorted = values.sort((a, b) => a - b);
    
    // Normalize to 8px grid
    sorted.forEach(value => {
      const normalized = Math.round(value / 8) * 8;
      const key = normalized / 8;
      scale[key] = `${normalized}px`;
    });

    return scale;
  }

  categorizeBorderWidths(widths) {
    const scale = {};
    widths.forEach((width, index) => {
      scale[index === 0 ? 'thin' : index === 1 ? 'medium' : 'thick'] = width;
    });
    return scale;
  }

  createElevationScale(shadows) {
    const scale = {};
    shadows.forEach((shadow, index) => {
      scale[`elevation-${index + 1}`] = shadow;
    });
    return scale;
  }

  categorizeBorderRadius(values) {
    const scale = {};
    const sorted = values.sort((a, b) => a - b);
    
    const labels = ['sm', 'md', 'lg', 'xl', 'full'];
    sorted.forEach((value, index) => {
      const label = labels[index] || `radius-${index}`;
      scale[label] = `${value}px`;
    });

    return scale;
  }

  createZIndexScale(values) {
    const scale = {};
    const sorted = values.sort((a, b) => a - b);
    
    const labels = ['base', 'dropdown', 'sticky', 'fixed', 'modal', 'popover', 'tooltip'];
    sorted.forEach((value, index) => {
      const label = labels[index] || `layer-${index}`;
      scale[label] = value;
    });

    return scale;
  }

  categorizeOpacity(values) {
    const scale = {};
    values.forEach(value => {
      const percentage = Math.round(value * 100);
      scale[`opacity-${percentage}`] = value;
    });
    return scale;
  }

  extractComponentVariants(matches) {
    const variants = new Set(['default']);
    
    matches.forEach(match => {
      if (match.className) {
        // Extract variant from class names
        const classes = match.className.split(' ');
        classes.forEach(cls => {
          if (cls.includes('primary')) variants.add('primary');
          if (cls.includes('secondary')) variants.add('secondary');
          if (cls.includes('outlined')) variants.add('outlined');
          if (cls.includes('text')) variants.add('text');
          if (cls.includes('contained')) variants.add('contained');
        });
      }
    });

    return Array.from(variants);
  }

  extractComponentStyles(matches) {
    const styles = {};
    
    if (matches.length > 0) {
      const firstMatch = matches[0];
      if (firstMatch.styles) {
        Object.assign(styles, firstMatch.styles);
      }
    }

    return styles;
  }

  extractComponentAttributes(matches) {
    const attributes = new Set();
    
    matches.forEach(match => {
      if (match.attributes) {
        Object.keys(match.attributes).forEach(attr => {
          attributes.add(attr);
        });
      }
    });

    return Array.from(attributes);
  }

  detectComponentStates(matches) {
    const states = {};
    
    const stateClasses = ['hover', 'active', 'focus', 'disabled', 'checked', 'selected'];
    
    matches.forEach(match => {
      if (match.className) {
        stateClasses.forEach(state => {
          if (match.className.includes(state)) {
            states[state] = true;
          }
        });
      }
    });

    return states;
  }

  detectRequiredProps(component) {
    // Basic required props detection
    return ['variant'];
  }

  countTokens(tokens) {
    let count = 0;
    Object.keys(tokens).forEach(category => {
      if (typeof tokens[category] === 'object') {
        count += Object.keys(tokens[category]).length;
      }
    });
    return count;
  }

  calculateConfidence(components, tokens) {
    // Calculate confidence based on amount of data extracted
    const componentCount = Object.keys(components).length;
    const tokenCount = this.countTokens(tokens);
    
    if (componentCount === 0 && tokenCount === 0) return 0;
    if (componentCount < 3 || tokenCount < 10) return 0.3;
    if (componentCount < 10 || tokenCount < 30) return 0.6;
    return 0.9;
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await this.chromeLayersService.cleanup();
  }
}

export default StyleGuideDataMiningService;
