/**
 * Enhanced Storybook Generator for Self-Generating Components
 * 
 * Automatically generates Storybook stories from component schemas,
 * supports atomic design hierarchy, and integrates with styleguide system
 */

import fs from 'fs/promises';
import path from 'path';

interface StoryConfig {
  componentName: string;
  componentPath: string;
  atomicLevel: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  props?: Record<string, unknown>;
  variants?: Array<{
    name: string;
    props: Record<string, unknown>;
    description?: string;
  }>;
  description?: string;
  category?: string;
}

interface GeneratedStory {
  filepath: string;
  content: string;
  metadata: {
    componentName: string;
    storiesCount: number;
    hasActions: boolean;
    hasDocs: boolean;
  };
}

export class EnhancedStorybookGenerator {
  private outputDir: string;
  private componentsDir: string;

  constructor(config: { outputDir?: string; componentsDir?: string } = {}) {
    this.outputDir = config.outputDir || './src/stories/generated';
    this.componentsDir = config.componentsDir || './src/components/generated';
  }

  /**
   * Initialize generator and create necessary directories
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.componentsDir, { recursive: true });
    console.log('✅ Storybook generator initialized');
  }

  /**
   * Generate Storybook story from component configuration
   */
  async generateStory(config: StoryConfig): Promise<GeneratedStory> {
    const storyContent = this.buildStoryContent(config);
    const filename = `${config.componentName}.stories.tsx`;
    const filepath = path.join(this.outputDir, filename);

    await fs.writeFile(filepath, storyContent, 'utf-8');

    return {
      filepath,
      content: storyContent,
      metadata: {
        componentName: config.componentName,
        storiesCount: (config.variants?.length || 0) + 1,
        hasActions: true,
        hasDocs: true,
      },
    };
  }

  /**
   * Generate stories from component hierarchy
   */
  async generateStoriesFromHierarchy(
    hierarchyNodes: Array<{
      id: string;
      name: string;
      type: string;
      code?: string;
      props?: Record<string, unknown>;
    }>
  ): Promise<GeneratedStory[]> {
    const stories: GeneratedStory[] = [];

    for (const node of hierarchyNodes) {
      const config: StoryConfig = {
        componentName: node.name,
        componentPath: `../components/generated/${node.name}`,
        atomicLevel: node.type as StoryConfig['atomicLevel'],
        props: node.props,
        description: `${node.name} - ${node.type} level component`,
        category: node.type,
      };

      const story = await this.generateStory(config);
      stories.push(story);
    }

    return stories;
  }

  /**
   * Generate component file with TypeScript/React
   */
  async generateComponent(config: {
    name: string;
    props?: Record<string, string>;
    template?: string;
  }): Promise<string> {
    const componentCode = this.buildComponentCode(config);
    const filename = `${config.name}.tsx`;
    const filepath = path.join(this.componentsDir, filename);

    await fs.writeFile(filepath, componentCode, 'utf-8');

    return filepath;
  }

  /**
   * Generate index file for all generated components
   */
  async generateComponentIndex(componentNames: string[]): Promise<void> {
    let indexContent = '// Auto-generated component exports\n\n';

    componentNames.forEach((name) => {
      indexContent += `export { default as ${name} } from './${name}';\n`;
    });

    const indexPath = path.join(this.componentsDir, 'index.ts');
    await fs.writeFile(indexPath, indexContent, 'utf-8');
  }

  /**
   * Build story file content
   */
  private buildStoryContent(config: StoryConfig): string {
    const importPath = config.componentPath.replace(/\\/g, '/');

    return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${config.componentName} } from '${importPath}';

/**
 * ${config.description || config.componentName}
 * 
 * Atomic Level: ${config.atomicLevel}
 * Category: ${config.category || 'general'}
 */
const meta = {
  title: '${this.getCategoryPath(config.atomicLevel, config.category)}/${config.componentName}',
  component: ${config.componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${config.description || `${config.componentName} component`}',
      },
    },
  },
  tags: ['autodocs', '${config.atomicLevel}'],
  argTypes: ${this.generateArgTypes(config.props)},
} satisfies Meta<typeof ${config.componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story
 */
export const Default: Story = {
  args: ${JSON.stringify(config.props || {}, null, 2)},
};

${this.generateVariantStories(config.variants)}

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: ${JSON.stringify(config.props || {}, null, 2)},
};
`.trim();
  }

  /**
   * Build component code
   */
  private buildComponentCode(config: {
    name: string;
    props?: Record<string, string>;
    template?: string;
  }): string {
    const propsInterface = config.props
      ? this.generatePropsInterface(config.name, config.props)
      : '';

    const propsParam = config.props ? `props: ${config.name}Props` : '';

    return `
import React from 'react';

${propsInterface}

/**
 * ${config.name} Component
 */
export const ${config.name}: React.FC${config.props ? `<${config.name}Props>` : ''} = (${propsParam}) => {
  ${config.template || `
  return (
    <div className="${config.name.toLowerCase()}">
      <h2>{props?.title || '${config.name}'}</h2>
      ${config.props ? '{props.children}' : ''}
    </div>
  );
  `.trim()}
};

export default ${config.name};
`.trim();
  }

  /**
   * Generate TypeScript props interface
   */
  private generatePropsInterface(
    componentName: string,
    props: Record<string, string>
  ): string {
    let code = `export interface ${componentName}Props {\n`;

    Object.entries(props).forEach(([key, type]) => {
      code += `  ${key}?: ${type};\n`;
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate Storybook argTypes
   */
  private generateArgTypes(props?: Record<string, unknown>): string {
    if (!props || Object.keys(props).length === 0) {
      return '{}';
    }

    const argTypes: Record<string, unknown> = {};

    Object.entries(props).forEach(([key, value]) => {
      argTypes[key] = {
        control: this.inferControlType(value),
        description: `${key} prop`,
      };
    });

    return JSON.stringify(argTypes, null, 2);
  }

  /**
   * Generate variant stories
   */
  private generateVariantStories(
    variants?: StoryConfig['variants']
  ): string {
    if (!variants || variants.length === 0) {
      return '';
    }

    return variants
      .map(
        (variant) => `
/**
 * ${variant.description || variant.name}
 */
export const ${variant.name}: Story = {
  args: ${JSON.stringify(variant.props, null, 2)},
};
    `.trim()
      )
      .join('\n\n');
  }

  /**
   * Get Storybook category path based on atomic level
   */
  private getCategoryPath(atomicLevel: string, category?: string): string {
    const baseCategories: Record<string, string> = {
      atom: 'Design System/Atoms',
      molecule: 'Design System/Molecules',
      organism: 'Design System/Organisms',
      template: 'Design System/Templates',
      page: 'Pages',
    };

    const basePath = baseCategories[atomicLevel] || 'Components';

    return category ? `${basePath}/${category}` : basePath;
  }

  /**
   * Infer Storybook control type from value
   */
  private inferControlType(value: unknown): string {
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'string') {
      return 'text';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    return 'object';
  }

  /**
   * Generate Storybook main configuration
   */
  async generateStorybookConfig(): Promise<void> {
    const mainConfig = `
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../generated-components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
};

export default config;
`.trim();

    await fs.writeFile('.storybook/main.ts', mainConfig, 'utf-8');
  }

  /**
   * Generate Storybook preview configuration
   */
  async generateStorybookPreview(): Promise<void> {
    const previewConfig = `
import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Design System',
          ['Atoms', 'Molecules', 'Organisms', 'Templates'],
          'Components',
          'Pages',
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
`.trim();

    await fs.writeFile('.storybook/preview.ts', previewConfig, 'utf-8');
  }
}
