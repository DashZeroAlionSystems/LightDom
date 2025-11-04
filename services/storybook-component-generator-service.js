/**
 * Storybook Component Generator Service
 * 
 * Converts style guides into complete Storybook documentation with isolated components.
 * Generates stories for all component variants and states.
 * 
 * Features:
 * - Generate Storybook stories from style guide
 * - Create interactive controls for all props
 * - Document all variants and states
 * - Generate accessibility documentation
 * - Create design token documentation
 * - Auto-generate MDX documentation files
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export class StorybookComponentGeneratorService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      storiesDir: config.storiesDir || './src/stories/generated',
      docsDir: config.docsDir || './src/stories/docs',
      includeA11y: config.includeA11y !== false,
      includeDesignTokens: config.includeDesignTokens !== false,
      includeInteractions: config.includeInteractions !== false,
      ...config
    };
  }

  /**
   * Initialize the service
   */
  async initialize() {
    await fs.mkdir(this.config.storiesDir, { recursive: true });
    await fs.mkdir(this.config.docsDir, { recursive: true });
    
    console.log('✅ Storybook Component Generator Service initialized');
  }

  /**
   * Generate complete Storybook from style guide
   */
  async generateStorybookFromStyleGuide(styleGuide, componentLibrary) {
    console.log('📖 Generating Storybook from style guide...');

    const storybook = {
      stories: {},
      docs: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        styleGuideId: styleGuide.id,
        totalStories: 0
      }
    };

    // Generate introduction page
    storybook.docs.introduction = await this.generateIntroductionMDX(styleGuide);
    await this.saveFile(
      path.join(this.config.docsDir, 'Introduction.mdx'),
      storybook.docs.introduction
    );

    // Generate design tokens documentation
    if (this.config.includeDesignTokens && styleGuide.tokens) {
      storybook.docs.designTokens = await this.generateDesignTokensMDX(styleGuide.tokens);
      await this.saveFile(
        path.join(this.config.docsDir, 'DesignTokens.mdx'),
        storybook.docs.designTokens
      );
    }

    // Generate stories for each component
    if (componentLibrary?.components) {
      for (const [componentName, component] of Object.entries(componentLibrary.components)) {
        console.log(`  Generating story for ${componentName}...`);

        try {
          const story = await this.generateComponentStory(
            componentName,
            component,
            styleGuide
          );

          storybook.stories[componentName] = story;
          storybook.metadata.totalStories++;

          // Save story file
          const storyPath = path.join(
            this.config.storiesDir,
            `${componentName}.stories.tsx`
          );
          await this.saveFile(storyPath, story);

          // Generate component documentation
          const docs = await this.generateComponentDocsMDX(
            componentName,
            component,
            styleGuide
          );
          storybook.docs[componentName] = docs;

          await this.saveFile(
            path.join(this.config.docsDir, `${componentName}.mdx`),
            docs
          );
        } catch (error) {
          console.error(`  ❌ Failed to generate story for ${componentName}:`, error.message);
        }
      }
    }

    console.log(`✅ Storybook generated`);
    console.log(`   Stories: ${storybook.metadata.totalStories}`);
    console.log(`   Output: ${this.config.storiesDir}`);

    this.emit('storybookGenerated', storybook);

    return storybook;
  }

  /**
   * Generate introduction MDX
   */
  async generateIntroductionMDX(styleGuide) {
    return `import { Meta } from '@storybook/blocks';

<Meta title="Introduction" />

# ${styleGuide.metadata?.name || 'Design System'}

${styleGuide.metadata?.description || 'Auto-generated design system based on Material Design 3.0'}

## Overview

This design system was ${styleGuide.url ? `extracted from ${styleGuide.url}` : 'generated'} on ${new Date(styleGuide.generated).toLocaleDateString()}.

### Key Features

- **${Object.keys(styleGuide.components || {}).length} Components** - Complete component library
- **Design Tokens** - Comprehensive token system for colors, typography, spacing, and more
- **Accessibility** - WCAG 2.1 AA compliant components
- **Variants & States** - Multiple variants and interactive states for each component
- **Responsive** - Mobile-first, responsive design

### Quick Start

Browse the component library in the sidebar to explore individual components, their variants, and documentation.

### Design System

Based on **${styleGuide.baseDesignSystem || 'Material Design 3.0'}**

${styleGuide.framework ? `### Framework\n\nOptimized for **${styleGuide.framework.name}** ${styleGuide.framework.version || ''}` : ''}

---

Generated with ❤️ by LightDom Style Guide Generator
`;
  }

  /**
   * Generate design tokens MDX
   */
  async generateDesignTokensMDX(tokens) {
    let mdx = `import { Meta, ColorPalette, ColorItem, Typeset } from '@storybook/blocks';

<Meta title="Design Tokens" />

# Design Tokens

Complete design token system for the design system.

`;

    // Colors
    if (tokens.colors) {
      mdx += `## Colors\n\n`;
      
      Object.entries(tokens.colors).forEach(([category, colors]) => {
        if (typeof colors === 'object' && Object.keys(colors).length > 0) {
          mdx += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
          mdx += `<ColorPalette>\n`;
          
          Object.entries(colors).forEach(([key, value]) => {
            if (typeof value === 'string' && value.startsWith('#')) {
              mdx += `  <ColorItem\n`;
              mdx += `    title="${category}-${key}"\n`;
              mdx += `    subtitle="${key}"\n`;
              mdx += `    colors={['${value}']}\n`;
              mdx += `  />\n`;
            }
          });
          
          mdx += `</ColorPalette>\n\n`;
        }
      });
    }

    // Typography
    if (tokens.typography?.typeScale) {
      mdx += `## Typography\n\n`;
      mdx += `### Type Scale\n\n`;
      
      Object.entries(tokens.typography.typeScale).forEach(([name, specs]) => {
        mdx += `#### ${name}\n\n`;
        mdx += `- **Font Size**: ${specs.fontSize || 'N/A'}\n`;
        mdx += `- **Line Height**: ${specs.lineHeight || 'N/A'}\n`;
        mdx += `- **Font Weight**: ${specs.fontWeight || 'N/A'}\n`;
        mdx += `- **Letter Spacing**: ${specs.letterSpacing || 'N/A'}\n\n`;
      });
    }

    // Spacing
    if (tokens.spacing?.scale) {
      mdx += `## Spacing\n\n`;
      mdx += `**Base Unit**: ${tokens.spacing.baseUnit || 8}px (8px grid system)\n\n`;
      mdx += `| Token | Value |\n`;
      mdx += `|-------|-------|\n`;
      
      Object.entries(tokens.spacing.scale).forEach(([key, value]) => {
        mdx += `| spacing-${key} | ${value} |\n`;
      });
      mdx += `\n`;
    }

    // Elevation
    if (tokens.elevation) {
      mdx += `## Elevation\n\n`;
      mdx += `Material Design elevation system for shadows and depth.\n\n`;
      
      Object.entries(tokens.elevation).forEach(([level, shadow]) => {
        mdx += `### ${level}\n\n`;
        mdx += `\`\`\`css\n${shadow}\n\`\`\`\n\n`;
      });
    }

    // Shape
    if (tokens.shape) {
      mdx += `## Shape (Border Radius)\n\n`;
      mdx += `| Token | Value |\n`;
      mdx += `|-------|-------|\n`;
      
      Object.entries(tokens.shape).forEach(([key, value]) => {
        mdx += `| shape-${key} | ${value} |\n`;
      });
      mdx += `\n`;
    }

    // Motion
    if (tokens.motion) {
      mdx += `## Motion\n\n`;
      
      if (tokens.motion.durations) {
        mdx += `### Durations\n\n`;
        mdx += `| Token | Value |\n`;
        mdx += `|-------|-------|\n`;
        
        Object.entries(tokens.motion.durations).forEach(([key, value]) => {
          mdx += `| duration-${key} | ${value} |\n`;
        });
        mdx += `\n`;
      }

      if (tokens.motion.easings) {
        mdx += `### Easing Functions\n\n`;
        mdx += `| Token | Value |\n`;
        mdx += `|-------|-------|\n`;
        
        Object.entries(tokens.motion.easings).forEach(([key, value]) => {
          mdx += `| easing-${key} | ${value} |\n`;
        });
        mdx += `\n`;
      }
    }

    return mdx;
  }

  /**
   * Generate component story
   */
  async generateComponentStory(componentName, component, styleGuide) {
    const variantsEnum = component.variants || ['default'];
    const hasStates = component.states && Object.keys(component.states).length > 0;

    let story = `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from '../../components/generated/${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${component.description || `${componentName} component from the design system`}'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ${JSON.stringify(variantsEnum)},
      description: 'Component variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '${variantsEnum[0]}' }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' }
      }
    },`;

    // Add state controls
    if (hasStates) {
      Object.keys(component.states).forEach(state => {
        story += `
    ${state}: {
      control: { type: 'boolean' },
      description: '${state} state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },`;
      });
    }

    story += `
    children: {
      control: { type: 'text' },
      description: 'Component content'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

// Default story
export const Default: Story = {
  args: {
    variant: '${variantsEnum[0]}',
    size: 'md',
    children: '${componentName}'
  }
};

`;

    // Generate variant stories
    variantsEnum.forEach(variant => {
      const storyName = variant.charAt(0).toUpperCase() + variant.slice(1);
      story += `export const ${storyName}: Story = {
  args: {
    variant: '${variant}',
    size: 'md',
    children: '${storyName} ${componentName}'
  }
};

`;
    });

    // Generate size stories
    ['sm', 'md', 'lg'].forEach(size => {
      const storyName = size.charAt(0).toUpperCase() + size.slice(1);
      story += `export const Size${storyName}: Story = {
  args: {
    variant: '${variantsEnum[0]}',
    size: '${size}',
    children: '${storyName} Size'
  }
};

`;
    });

    // Generate state stories
    if (hasStates) {
      Object.keys(component.states).forEach(state => {
        const storyName = state.charAt(0).toUpperCase() + state.slice(1);
        story += `export const ${storyName}: Story = {
  args: {
    variant: '${variantsEnum[0]}',
    size: 'md',
    ${state}: true,
    children: '${storyName} State'
  }
};

`;
      });
    }

    // Add interaction tests if enabled
    if (this.config.includeInteractions && hasStates) {
      story += `// Interaction tests
import { expect } from '@storybook/jest';
import { within, userEvent } from '@storybook/testing-library';

export const InteractiveTest: Story = {
  args: {
    variant: '${variantsEnum[0]}',
    size: 'md',
    children: 'Click me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const component = canvas.getByText('Click me');
    
    // Test hover state
    await userEvent.hover(component);
    
    // Test click
    await userEvent.click(component);
  }
};
`;
    }

    return story;
  }

  /**
   * Generate component documentation MDX
   */
  async generateComponentDocsMDX(componentName, component, styleGuide) {
    let mdx = `import { Meta, Canvas, Controls, Stories } from '@storybook/blocks';
import * as ${componentName}Stories from '../generated/${componentName}.stories';

<Meta of={${componentName}Stories} />

# ${componentName}

${component.description || `${componentName} component from the design system`}

## Overview

${component.category ? `**Category**: ${component.category}\n\n` : ''}

`;

    // Variants section
    if (component.variants && component.variants.length > 0) {
      mdx += `## Variants\n\n`;
      mdx += `This component supports the following variants:\n\n`;
      component.variants.forEach(variant => {
        mdx += `- **${variant}**: ${variant} variant\n`;
      });
      mdx += `\n`;
    }

    // States section
    if (component.states && Object.keys(component.states).length > 0) {
      mdx += `## States\n\n`;
      mdx += `This component supports the following interactive states:\n\n`;
      Object.keys(component.states).forEach(state => {
        mdx += `- **${state}**: ${state} state\n`;
      });
      mdx += `\n`;
    }

    // Accessibility section
    if (this.config.includeA11y && component.accessibility) {
      mdx += `## Accessibility\n\n`;
      if (component.accessibility.role) {
        mdx += `**ARIA Role**: \`${component.accessibility.role}\`\n\n`;
      }
      if (component.accessibility.keyboardSupport && component.accessibility.keyboardSupport.length > 0) {
        mdx += `### Keyboard Support\n\n`;
        component.accessibility.keyboardSupport.forEach(key => {
          mdx += `- ${key}\n`;
        });
        mdx += `\n`;
      }
    }

    // Specifications section
    if (component.specifications) {
      mdx += `## Specifications\n\n`;
      mdx += `\`\`\`json\n${JSON.stringify(component.specifications, null, 2)}\n\`\`\`\n\n`;
    }

    // Props documentation
    mdx += `## Props\n\n`;
    mdx += `<Controls />\n\n`;

    // Stories
    mdx += `## Examples\n\n`;
    mdx += `<Canvas>\n`;
    mdx += `  <${componentName}Stories.Default />\n`;
    mdx += `</Canvas>\n\n`;

    mdx += `### All Stories\n\n`;
    mdx += `<Stories />\n\n`;

    return mdx;
  }

  /**
   * Save file
   */
  async saveFile(filepath, content) {
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, content, 'utf-8');
  }

  /**
   * Generate Storybook configuration
   */
  async generateStorybookConfig(styleGuide) {
    const config = {
      stories: [
        '../src/**/*.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)'
      ],
      addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y'
      ],
      framework: {
        name: '@storybook/react-vite',
        options: {}
      },
      docs: {
        autodocs: true
      },
      staticDirs: ['../public']
    };

    return config;
  }
}

export default StorybookComponentGeneratorService;
