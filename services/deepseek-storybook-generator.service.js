/**
 * DeepSeek Storybook Generator Service
 * AI-powered component generation from Storybook with continuous styleguide mining
 */

class DeepSeekStorybookGeneratorService {
  constructor() {
    this.storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:6006';
    this.deepseekApiUrl = process.env.DEEPSEEK_API_URL || 'http://localhost:11434';
    this.styleguideSchema = null;
    this.miningInterval = null;
  }

  /**
   * Scan Storybook via headless API and extract all components and stories
   */
  async scanStorybook() {
    try {
      const response = await fetch(`${this.storybookUrl}/index.json`);
      const storybookIndex = await response.json();
      
      const components = {};
      for (const [key, story] of Object.entries(storybookIndex.entries || {})) {
        const componentName = story.title.split('/').pop();
        if (!components[componentName]) {
          components[componentName] = {
            name: componentName,
            category: story.title.split('/')[0],
            stories: [],
            variants: []
          };
        }
        components[componentName].stories.push(story);
        if (story.name !== 'default') {
          components[componentName].variants.push(story.name);
        }
      }
      
      return Object.values(components);
    } catch (error) {
      console.error('Failed to scan Storybook:', error);
      return [];
    }
  }

  /**
   * Mine design tokens from Storybook components
   */
  async mineDesignTokens() {
    try {
      const components = await this.scanStorybook();
      const tokens = {
        colors: new Set(),
        typography: { fontFamilies: new Set(), fontSizes: new Set() },
        spacing: new Set(),
        borders: { radii: new Set() },
        shadows: new Set()
      };

      for (const component of components) {
        for (const story of component.stories) {
          // Extract design tokens from story parameters
          if (story.parameters) {
            this.extractTokensFromParameters(story.parameters, tokens);
          }
        }
      }

      // Convert Sets to arrays for JSON serialization
      return {
        colors: Array.from(tokens.colors),
        typography: {
          fontFamilies: Array.from(tokens.typography.fontFamilies),
          fontSizes: Array.from(tokens.typography.fontSizes)
        },
        spacing: Array.from(tokens.spacing),
        borders: { radii: Array.from(tokens.borders.radii) },
        shadows: Array.from(tokens.shadows)
      };
    } catch (error) {
      console.error('Failed to mine design tokens:', error);
      return null;
    }
  }

  extractTokensFromParameters(params, tokens) {
    // Extract color tokens
    if (params.backgrounds) {
      params.backgrounds.values?.forEach(bg => tokens.colors.add(bg.value));
    }
    // Extract typography
    if (params.design?.typography) {
      if (params.design.typography.fontFamily) {
        tokens.typography.fontFamilies.add(params.design.typography.fontFamily);
      }
      if (params.design.typography.fontSize) {
        tokens.typography.fontSizes.add(params.design.typography.fontSize);
      }
    }
  }

  /**
   * Discover common patterns across components
   */
  async discoverPatterns() {
    try {
      const components = await this.scanStorybook();
      const patterns = [];

      // Find form patterns
      const formComponents = components.filter(c => 
        ['Input', 'Button', 'Select', 'Checkbox', 'Label'].includes(c.name)
      );
      if (formComponents.length > 0) {
        patterns.push({
          name: 'Form Layout',
          usage: formComponents.length,
          components: formComponents.map(c => c.name),
          bestPractices: ['Use labels with inputs', 'Validate on submit', 'Show error states']
        });
      }

      // Find card patterns
      const cardComponents = components.filter(c => c.name.toLowerCase().includes('card'));
      if (cardComponents.length > 0) {
        patterns.push({
          name: 'Card Pattern',
          usage: cardComponents.length,
          components: cardComponents.map(c => c.name),
          bestPractices: ['Use consistent padding', 'Add hover effects', 'Include actions']
        });
      }

      return patterns;
    } catch (error) {
      console.error('Failed to discover patterns:', error);
      return [];
    }
  }

  /**
   * Generate complete styleguide schema from Storybook
   */
  async generateStyleguideSchema() {
    try {
      const [components, designTokens, patterns] = await Promise.all([
        this.scanStorybook(),
        this.mineDesignTokens(),
        this.discoverPatterns()
      ]);

      this.styleguideSchema = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        designSystem: designTokens,
        components: components,
        patterns: patterns,
        metadata: {
          totalComponents: components.length,
          totalPatterns: patterns.length,
          storybookUrl: this.storybookUrl
        }
      };

      return this.styleguideSchema;
    } catch (error) {
      console.error('Failed to generate styleguide schema:', error);
      return null;
    }
  }

  /**
   * Generate component from natural language prompt using DeepSeek
   */
  async generateComponentFromPrompt(prompt, styleGuideId) {
    try {
      // Load styleguide schema if not already loaded
      if (!this.styleguideSchema) {
        await this.generateStyleguideSchema();
      }

      // Find relevant patterns and components
      const relevantContext = this.findRelevantContext(prompt);

      // Call DeepSeek API to generate component
      const deepseekPrompt = this.buildDeepSeekPrompt(prompt, relevantContext);
      const response = await fetch(`${this.deepseekApiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-coder',
          prompt: deepseekPrompt,
          stream: false
        })
      });

      const data = await response.json();
      const componentCode = this.extractComponentCode(data.response);

      // Generate Storybook story
      const storyCode = this.generateStorybookStory(componentCode);

      return {
        componentCode,
        storyCode,
        componentName: this.extractComponentName(componentCode),
        filePaths: {
          component: `src/components/generated/${this.extractComponentName(componentCode)}.tsx`,
          story: `src/stories/generated/${this.extractComponentName(componentCode)}.stories.tsx`
        }
      };
    } catch (error) {
      console.error('Failed to generate component:', error);
      return null;
    }
  }

  findRelevantContext(prompt) {
    if (!this.styleguideSchema) return {};

    const lowerPrompt = prompt.toLowerCase();
    const relevantComponents = this.styleguideSchema.components.filter(c =>
      lowerPrompt.includes(c.name.toLowerCase()) || lowerPrompt.includes(c.category.toLowerCase())
    );

    const relevantPatterns = this.styleguideSchema.patterns.filter(p =>
      lowerPrompt.includes(p.name.toLowerCase())
    );

    return {
      components: relevantComponents.slice(0, 3),
      patterns: relevantPatterns.slice(0, 2),
      designTokens: this.styleguideSchema.designSystem
    };
  }

  buildDeepSeekPrompt(userPrompt, context) {
    return `Generate a React TypeScript component following this styleguide:

Design Tokens:
${JSON.stringify(context.designTokens, null, 2)}

Similar Components:
${context.components.map(c => `- ${c.name}: ${c.variants.join(', ')}`).join('\n')}

Patterns to Follow:
${context.patterns.map(p => `- ${p.name}: ${p.bestPractices.join(', ')}`).join('\n')}

User Request: ${userPrompt}

Generate a complete React component with:
1. TypeScript interfaces
2. Material-UI components
3. Following the design tokens above
4. Proper prop types
5. Accessibility attributes

Component code:`;
  }

  extractComponentCode(response) {
    // Extract code from DeepSeek response
    const codeMatch = response.match(/```(?:typescript|tsx)?\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : response;
  }

  extractComponentName(code) {
    const match = code.match(/export (?:const|function) (\w+)/);
    return match ? match[1] : 'GeneratedComponent';
  }

  generateStorybookStory(componentCode) {
    const componentName = this.extractComponentName(componentCode);
    return `import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Generated/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithData: Story = {
  args: {},
};`;
  }

  /**
   * Start continuous styleguide mining
   */
  startContinuousMining(intervalMs = 300000) {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
    }

    console.log(`Starting continuous styleguide mining every ${intervalMs}ms`);
    this.miningInterval = setInterval(async () => {
      console.log('Mining styleguide...');
      await this.generateStyleguideSchema();
      console.log('Styleguide schema updated');
    }, intervalMs);

    // Initial mine
    this.generateStyleguideSchema();
  }

  /**
   * Stop continuous mining
   */
  stopContinuousMining() {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
      console.log('Stopped continuous styleguide mining');
    }
  }
}

module.exports = DeepSeekStorybookGeneratorService;
