/**
 * Self-Organizing Styleguide Generator
 * 
 * Automatically generates and organizes styleguides from component analysis,
 * extracts design tokens, defines rules, and creates documentation
 */

interface StyleguideConfig {
  name: string;
  version: string;
  description: string;
  framework: 'react' | 'vue' | 'angular' | 'html-css';
  designSystem: 'material' | 'fluent' | 'carbon' | 'custom';
}

interface DesignToken {
  name: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'border' | 'breakpoint';
  value: string;
  cssVariable?: string;
  description?: string;
  usage: string[];
}

interface StyleguideRule {
  id: string;
  category: 'spacing' | 'color' | 'typography' | 'layout' | 'interaction';
  name: string;
  description: string;
  examples: string[];
  enforced: boolean;
}

interface ComponentStyleGuide {
  componentName: string;
  tokens: DesignToken[];
  rules: StyleguideRule[];
  patterns: string[];
  accessibility: AccessibilityGuideline[];
}

interface AccessibilityGuideline {
  rule: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  resources: string[];
}

interface GeneratedStyleguide {
  config: StyleguideConfig;
  tokens: DesignToken[];
  rules: StyleguideRule[];
  components: ComponentStyleGuide[];
  patterns: Record<string, string>;
  documentation: string;
  metadata: {
    generatedAt: Date;
    totalTokens: number;
    totalRules: number;
    totalComponents: number;
  };
}

export class SelfOrganizingStyleguideGenerator {
  private tokens: Map<string, DesignToken>;
  private rules: Map<string, StyleguideRule>;
  private componentStyles: Map<string, ComponentStyleGuide>;

  constructor() {
    this.tokens = new Map();
    this.rules = new Map();
    this.componentStyles = new Map();
  }

  /**
   * Generate styleguide from component hierarchy
   */
  async generateFromComponents(
    components: Array<{
      name: string;
      type: string;
      code?: string;
      props?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }>,
    config: StyleguideConfig
  ): Promise<GeneratedStyleguide> {
    console.log(`🎨 Generating styleguide for ${config.name}...`);

    // Extract design tokens from components
    await this.extractTokensFromComponents(components);

    // Identify design rules
    await this.identifyDesignRules(components);

    // Generate component style guides
    const componentGuides = await this.generateComponentStyleguides(components);

    // Identify common patterns
    const patterns = this.identifyDesignPatterns(components);

    // Generate documentation
    const documentation = await this.generateDocumentation(config);

    const styleguide: GeneratedStyleguide = {
      config,
      tokens: Array.from(this.tokens.values()),
      rules: Array.from(this.rules.values()),
      components: componentGuides,
      patterns,
      documentation,
      metadata: {
        generatedAt: new Date(),
        totalTokens: this.tokens.size,
        totalRules: this.rules.size,
        totalComponents: components.length,
      },
    };

    console.log(`✅ Styleguide generated: ${this.tokens.size} tokens, ${this.rules.size} rules`);

    return styleguide;
  }

  /**
   * Extract design tokens from CSS/styles
   */
  async extractTokensFromCSS(cssContent: string): Promise<DesignToken[]> {
    const tokens: DesignToken[] = [];

    // Extract CSS custom properties
    const customPropRegex = /--([a-z-]+):\s*([^;]+);/g;
    let match;

    while ((match = customPropRegex.exec(cssContent)) !== null) {
      const [, name, value] = match;
      const category = this.categorizeToken(name);

      const token: DesignToken = {
        name,
        category,
        value: value.trim(),
        cssVariable: `--${name}`,
        usage: [],
      };

      this.tokens.set(name, token);
      tokens.push(token);
    }

    return tokens;
  }

  /**
   * Generate design rules from patterns
   */
  generateDesignRules(): StyleguideRule[] {
    const rules: StyleguideRule[] = [];

    // Spacing rules
    rules.push({
      id: 'spacing-consistency',
      category: 'spacing',
      name: 'Consistent Spacing Scale',
      description: 'Use multiples of base spacing unit (8px)',
      examples: ['padding: 8px', 'margin: 16px', 'gap: 24px'],
      enforced: true,
    });

    // Color rules
    rules.push({
      id: 'color-contrast',
      category: 'color',
      name: 'Color Contrast',
      description: 'Maintain WCAG AA contrast ratio (4.5:1 for text)',
      examples: ['Text on background must have contrast >= 4.5:1'],
      enforced: true,
    });

    // Typography rules
    rules.push({
      id: 'typography-scale',
      category: 'typography',
      name: 'Type Scale',
      description: 'Use modular scale for typography sizes',
      examples: ['1rem, 1.25rem, 1.5rem, 2rem, 3rem'],
      enforced: true,
    });

    rules.forEach((rule) => {
      this.rules.set(rule.id, rule);
    });

    return rules;
  }

  /**
   * Organize tokens into categories
   */
  organizeTokens(): Record<string, DesignToken[]> {
    const organized: Record<string, DesignToken[]> = {
      color: [],
      spacing: [],
      typography: [],
      shadow: [],
      border: [],
      breakpoint: [],
    };

    this.tokens.forEach((token) => {
      organized[token.category].push(token);
    });

    return organized;
  }

  /**
   * Generate token documentation
   */
  generateTokenDocumentation(): string {
    let docs = '# Design Tokens\n\n';

    const organized = this.organizeTokens();

    Object.entries(organized).forEach(([category, tokens]) => {
      if (tokens.length === 0) {
        return;
      }

      docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

      tokens.forEach((token) => {
        docs += `### ${token.name}\n`;
        docs += `- **Value:** \`${token.value}\`\n`;
        if (token.cssVariable) {
          docs += `- **CSS Variable:** \`${token.cssVariable}\`\n`;
        }
        if (token.description) {
          docs += `- **Description:** ${token.description}\n`;
        }
        docs += '\n';
      });
    });

    return docs;
  }

  /**
   * Export styleguide as JSON
   */
  exportAsJSON(styleguide: GeneratedStyleguide): string {
    return JSON.stringify(styleguide, null, 2);
  }

  /**
   * Export styleguide as CSS
   */
  exportAsCSS(styleguide: GeneratedStyleguide): string {
    let css = `/* ${styleguide.config.name} Design System */\n`;
    css += `/* Generated: ${styleguide.metadata.generatedAt.toISOString()} */\n\n`;

    css += ':root {\n';

    styleguide.tokens.forEach((token) => {
      if (token.cssVariable) {
        css += `  ${token.cssVariable}: ${token.value};\n`;
      }
    });

    css += '}\n';

    return css;
  }

  /**
   * Generate Figma design tokens format
   */
  exportAsFigmaTokens(styleguide: GeneratedStyleguide): string {
    const figmaTokens: Record<string, unknown> = {};

    styleguide.tokens.forEach((token) => {
      const [category, ...nameParts] = token.name.split('-');
      const name = nameParts.join('-');

      if (!figmaTokens[category]) {
        figmaTokens[category] = {};
      }

      (figmaTokens[category] as Record<string, unknown>)[name] = {
        value: token.value,
        type: token.category,
        description: token.description || '',
      };
    });

    return JSON.stringify(figmaTokens, null, 2);
  }

  /**
   * Generate component usage guidelines
   */
  generateComponentGuidelines(componentName: string): string {
    const guide = this.componentStyles.get(componentName);
    if (!guide) {
      return '';
    }

    let docs = `# ${componentName} Guidelines\n\n`;

    docs += '## Design Tokens\n\n';
    guide.tokens.forEach((token) => {
      docs += `- **${token.name}:** ${token.value}\n`;
    });

    docs += '\n## Rules\n\n';
    guide.rules.forEach((rule) => {
      docs += `### ${rule.name}\n`;
      docs += `${rule.description}\n\n`;
    });

    docs += '\n## Accessibility\n\n';
    guide.accessibility.forEach((guideline) => {
      docs += `- **${guideline.rule}** (WCAG ${guideline.wcagLevel})\n`;
      docs += `  ${guideline.description}\n`;
    });

    return docs;
  }

  // Private methods

  private async extractTokensFromComponents(
    components: Array<{
      name: string;
      code?: string;
      metadata?: Record<string, unknown>;
    }>
  ): Promise<void> {
    // Extract color tokens
    const colors = new Set<string>();
    const spacings = new Set<string>();

    components.forEach((component) => {
      if (component.code) {
        // Extract colors (simplified)
        const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
        const colorMatches = component.code.match(colorRegex);
        if (colorMatches) {
          colorMatches.forEach((color) => colors.add(color));
        }

        // Extract spacing values
        const spacingRegex = /(?:padding|margin|gap):\s*(\d+px)/g;
        let match;
        while ((match = spacingRegex.exec(component.code)) !== null) {
          spacings.add(match[1]);
        }
      }
    });

    // Convert to tokens
    let colorIndex = 0;
    colors.forEach((color) => {
      this.tokens.set(`color-${colorIndex}`, {
        name: `color-${colorIndex}`,
        category: 'color',
        value: color,
        cssVariable: `--color-${colorIndex}`,
        usage: [],
      });
      colorIndex++;
    });

    let spacingIndex = 0;
    spacings.forEach((spacing) => {
      this.tokens.set(`spacing-${spacingIndex}`, {
        name: `spacing-${spacingIndex}`,
        category: 'spacing',
        value: spacing,
        cssVariable: `--spacing-${spacingIndex}`,
        usage: [],
      });
      spacingIndex++;
    });
  }

  private async identifyDesignRules(
    components: Array<{ name: string; type: string }>
  ): Promise<void> {
    // Generate standard design rules
    this.generateDesignRules();

    // Add component-specific rules based on patterns
    const hasButtons = components.some((c) => c.name.toLowerCase().includes('button'));
    if (hasButtons) {
      this.rules.set('button-consistency', {
        id: 'button-consistency',
        category: 'interaction',
        name: 'Button Consistency',
        description: 'All buttons should have consistent padding and border-radius',
        examples: ['padding: 8px 16px', 'border-radius: 4px'],
        enforced: true,
      });
    }
  }

  private async generateComponentStyleguides(
    components: Array<{ name: string; type: string }>
  ): Promise<ComponentStyleGuide[]> {
    const guides: ComponentStyleGuide[] = [];

    components.forEach((component) => {
      const guide: ComponentStyleGuide = {
        componentName: component.name,
        tokens: Array.from(this.tokens.values()).slice(0, 3), // Sample tokens
        rules: Array.from(this.rules.values()).slice(0, 2), // Sample rules
        patterns: ['Use consistent spacing', 'Follow color hierarchy'],
        accessibility: [
          {
            rule: 'Keyboard Navigation',
            description: 'Ensure component is keyboard accessible',
            wcagLevel: 'A',
            resources: ['https://www.w3.org/WAI/WCAG21/quickref/'],
          },
        ],
      };

      this.componentStyles.set(component.name, guide);
      guides.push(guide);
    });

    return guides;
  }

  private identifyDesignPatterns(
    components: Array<{ name: string; type: string }>
  ): Record<string, string> {
    return {
      'atomic-design': 'Components follow atomic design methodology',
      'composition': 'Components are composable and reusable',
      'accessibility-first': 'Accessibility is built into all components',
      'responsive': 'All components are responsive by default',
    };
  }

  private async generateDocumentation(config: StyleguideConfig): Promise<string> {
    let docs = `# ${config.name} Styleguide\n\n`;
    docs += `Version: ${config.version}\n\n`;
    docs += `${config.description}\n\n`;

    docs += '## Design Tokens\n\n';
    docs += this.generateTokenDocumentation();

    docs += '\n## Design Rules\n\n';
    this.rules.forEach((rule) => {
      docs += `### ${rule.name}\n`;
      docs += `${rule.description}\n\n`;
      docs += '**Examples:**\n';
      rule.examples.forEach((example) => {
        docs += `- \`${example}\`\n`;
      });
      docs += '\n';
    });

    return docs;
  }

  private categorizeToken(name: string): DesignToken['category'] {
    if (name.includes('color') || name.includes('bg') || name.includes('text')) {
      return 'color';
    }
    if (name.includes('spacing') || name.includes('padding') || name.includes('margin')) {
      return 'spacing';
    }
    if (name.includes('font') || name.includes('text') || name.includes('line')) {
      return 'typography';
    }
    if (name.includes('shadow')) {
      return 'shadow';
    }
    if (name.includes('border') || name.includes('radius')) {
      return 'border';
    }
    if (name.includes('breakpoint') || name.includes('screen')) {
      return 'breakpoint';
    }
    return 'color';
  }
}
