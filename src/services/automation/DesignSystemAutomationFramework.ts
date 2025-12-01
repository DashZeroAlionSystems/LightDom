import { EventEmitter } from 'events';
import AISkillExecutor from '../ai/AISkillExecutor';
import { AdvancedTaskQueue, TaskPriority } from './AdvancedTaskQueue';
import fs from 'fs/promises';
import path from 'path';

/**
 * Comprehensive Design System Automation Framework
 * 
 * Implements atomic design principles to automatically generate:
 * - Design tokens (colors, typography, spacing, etc.)
 * - Atoms (buttons, inputs, icons, etc.)
 * - Molecules (form groups, cards, etc.)
 * - Organisms (navigation, headers, etc.)
 * - Templates (page layouts)
 * - Pages (complete implementations)
 * 
 * Features:
 * - Automated component generation from styleguides
 * - Component bundling (functional, user-story based)
 * - Storybook integration
 * - Documentation generation
 * - Accessibility validation
 * - Performance optimization
 */

export interface DesignToken {
  name: string;
  value: string | number;
  type: string; // color, spacing, typography, shadow, etc.
  description?: string;
  category?: string;
}

export interface ComponentSpec {
  name: string;
  level: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
  }>;
  dependencies: string[];
  variants?: string[];
  accessibility?: {
    ariaLabels: string[];
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };
  useCases?: string[];
}

export interface StyleguideData {
  id: string;
  name: string;
  version: string;
  tokens: DesignToken[];
  components: ComponentSpec[];
  patterns: Array<{
    name: string;
    description: string;
    components: string[];
  }>;
  brandGuidelines?: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    spacing?: Record<string, any>;
  };
}

export interface ComponentBundle {
  name: string;
  type: 'functional' | 'user-story' | 'feature' | 'page';
  components: string[];
  description: string;
  userStory?: string;
  acceptanceCriteria?: string[];
}

export class DesignSystemAutomationFramework extends EventEmitter {
  private skillExecutor: AISkillExecutor;
  private taskQueue: AdvancedTaskQueue;
  private outputDir: string;
  private componentsDir: string;
  private storiesDir: string;

  constructor(options: {
    outputDir?: string;
    skillsDir?: string;
    queuePersistPath?: string;
  } = {}) {
    super();

    this.outputDir = options.outputDir || path.join(process.cwd(), 'output');
    this.componentsDir = path.join(this.outputDir, 'components');
    this.storiesDir = path.join(this.outputDir, 'stories');

    this.skillExecutor = new AISkillExecutor(options.skillsDir);
    this.taskQueue = new AdvancedTaskQueue({
      concurrency: 3,
      maxRetries: 3,
      retryDelay: 5000,
      persistPath: options.queuePersistPath || path.join(process.cwd(), '.task-queue.json'),
      autoStart: false,
    });

    this.setupTaskHandlers();
  }

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    console.log('🎨 Initializing Design System Automation Framework...\n');

    await this.skillExecutor.initialize();
    await this.taskQueue.initialize();

    // Create output directories
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.componentsDir, { recursive: true });
    await fs.mkdir(this.storiesDir, { recursive: true });

    console.log('✅ Framework initialized\n');
    this.emit('initialized');
  }

  /**
   * Start the automation framework
   */
  start(): void {
    this.taskQueue.start();
    console.log('▶️ Design System Automation Framework started\n');
    this.emit('started');
  }

  /**
   * Stop the automation framework
   */
  async stop(): Promise<void> {
    await this.taskQueue.stop();
    console.log('⏸️ Design System Automation Framework stopped\n');
    this.emit('stopped');
  }

  /**
   * Generate complete design system from requirements
   */
  async generateDesignSystem(requirements: {
    name: string;
    description: string;
    framework?: string;
    brandGuidelines?: any;
    includeStorybook?: boolean;
    includeDocumentation?: boolean;
  }): Promise<string> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎨 Generating Design System: ${requirements.name}`);
    console.log(`${'='.repeat(80)}\n`);

    // Create main task
    const mainTaskId = await this.taskQueue.addTask({
      name: `Generate Design System: ${requirements.name}`,
      type: 'design-system:create',
      priority: TaskPriority.HIGH,
      payload: requirements,
    });

    return mainTaskId;
  }

  /**
   * Extract and enhance styleguide from URL or existing data
   */
  async extractStyleguide(source: string | StyleguideData): Promise<StyleguideData> {
    console.log('📖 Extracting styleguide...\n');

    if (typeof source === 'string') {
      // Mine from URL (integrate with existing mining services)
      // This would call the existing styleguide mining services
      throw new Error('URL mining not yet implemented - use StyleguideData object');
    }

    return source;
  }

  /**
   * Generate components using atomic design principles
   */
  async generateAtomicComponents(
    styleguide: StyleguideData,
    options: {
      levels?: Array<'atom' | 'molecule' | 'organism' | 'template' | 'page'>;
      parallel?: boolean;
    } = {}
  ): Promise<void> {
    const levels = options.levels || ['atom', 'molecule', 'organism', 'template', 'page'];

    console.log(`\n📦 Generating components for levels: ${levels.join(', ')}\n`);

    // Generate components level by level (dependencies)
    for (const level of levels) {
      const componentsAtLevel = styleguide.components.filter(c => c.level === level);

      console.log(`\n🏗️ Generating ${componentsAtLevel.length} ${level}(s)...\n`);

      for (const component of componentsAtLevel) {
        await this.taskQueue.addTask({
          name: `Generate ${level}: ${component.name}`,
          type: 'component:generate',
          priority: this.getLevelPriority(level),
          payload: {
            component,
            styleguide,
            level,
          },
          dependencies: component.dependencies.map(dep => `component:${dep}`),
        });
      }
    }
  }

  /**
   * Create component bundles
   */
  async createComponentBundles(
    styleguide: StyleguideData,
    bundles: ComponentBundle[]
  ): Promise<void> {
    console.log(`\n📦 Creating ${bundles.length} component bundles...\n`);

    for (const bundle of bundles) {
      await this.taskQueue.addTask({
        name: `Create Bundle: ${bundle.name}`,
        type: 'bundle:create',
        priority: TaskPriority.MEDIUM,
        payload: {
          bundle,
          styleguide,
        },
      });
    }
  }

  /**
   * Generate Storybook stories for all components
   */
  async generateStorybookStories(
    styleguide: StyleguideData,
    componentPaths: Record<string, string>
  ): Promise<void> {
    console.log('\n📚 Generating Storybook stories...\n');

    for (const component of styleguide.components) {
      await this.taskQueue.addTask({
        name: `Generate Story: ${component.name}`,
        type: 'storybook:generate',
        priority: TaskPriority.LOW,
        payload: {
          component,
          componentPath: componentPaths[component.name],
          styleguide,
        },
      });
    }
  }

  /**
   * Generate complete documentation
   */
  async generateDocumentation(
    styleguide: StyleguideData,
    options: {
      includeGettingStarted?: boolean;
      includeComponentDocs?: boolean;
      includeContributingGuide?: boolean;
      includeDesignPrinciples?: boolean;
    } = {}
  ): Promise<void> {
    console.log('\n📖 Generating documentation...\n');

    const docs = [
      options.includeGettingStarted !== false && 'getting-started',
      options.includeComponentDocs !== false && 'component-docs',
      options.includeContributingGuide !== false && 'contributing',
      options.includeDesignPrinciples !== false && 'design-principles',
    ].filter(Boolean);

    for (const docType of docs) {
      await this.taskQueue.addTask({
        name: `Generate Documentation: ${docType}`,
        type: 'documentation:generate',
        priority: TaskPriority.LOW,
        payload: {
          type: docType,
          styleguide,
        },
      });
    }
  }

  /**
   * Validate design system completeness
   */
  async validateDesignSystem(styleguide: StyleguideData): Promise<{
    complete: boolean;
    score: number;
    missing: string[];
    recommendations: string[];
  }> {
    console.log('\n🔍 Validating design system completeness...\n');

    const checks = {
      hasTokens: styleguide.tokens.length > 0,
      hasColorTokens: styleguide.tokens.some(t => t.type === 'color'),
      hasTypographyTokens: styleguide.tokens.some(t => t.type === 'typography'),
      hasSpacingTokens: styleguide.tokens.some(t => t.type === 'spacing'),
      hasAtoms: styleguide.components.some(c => c.level === 'atom'),
      hasMolecules: styleguide.components.some(c => c.level === 'molecule'),
      hasOrganisms: styleguide.components.some(c => c.level === 'organism'),
      hasAccessibility: styleguide.components.every(c => c.accessibility !== undefined),
      hasDocumentation: styleguide.components.every(c => c.description.length > 0),
    };

    const total = Object.keys(checks).length;
    const passed = Object.values(checks).filter(v => v).length;
    const score = (passed / total) * 100;

    const missing: string[] = [];
    const recommendations: string[] = [];

    if (!checks.hasTokens) missing.push('design tokens');
    if (!checks.hasColorTokens) missing.push('color tokens');
    if (!checks.hasTypographyTokens) missing.push('typography tokens');
    if (!checks.hasSpacingTokens) missing.push('spacing tokens');
    if (!checks.hasAtoms) missing.push('atomic components');
    if (!checks.hasMolecules) missing.push('molecule components');
    if (!checks.hasOrganisms) missing.push('organism components');
    if (!checks.hasAccessibility) recommendations.push('Add accessibility specifications to all components');
    if (!checks.hasDocumentation) recommendations.push('Add comprehensive documentation to all components');

    return {
      complete: score === 100,
      score,
      missing,
      recommendations,
    };
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return this.taskQueue.getStats();
  }

  /**
   * Setup task handlers for different types of tasks
   */
  private setupTaskHandlers(): void {
    // Design system creation
    this.taskQueue.registerHandler('design-system:create', async (task) => {
      const result = await this.skillExecutor.executeSkill('design-system-creator', {
        variables: {
          requirements: task.payload.description,
          framework: task.payload.framework || 'react',
          brandGuidelines: JSON.stringify(task.payload.brandGuidelines || {}),
        },
      });

      if (result.success) {
        // Parse the design system
        const designSystem = typeof result.output === 'string' 
          ? JSON.parse(result.output)
          : result.output;

        // Save to file
        const filepath = path.join(this.outputDir, `${task.payload.name}-design-system.json`);
        await fs.writeFile(filepath, JSON.stringify(designSystem, null, 2), 'utf8');

        console.log(`💾 Saved design system to: ${filepath}`);

        return designSystem;
      }

      throw new Error('Failed to generate design system');
    });

    // Component generation
    this.taskQueue.registerHandler('component:generate', async (task) => {
      const { component, styleguide, level } = task.payload;

      // Use AI to generate component code
      const componentCode = await this.generateComponentCode(component, styleguide);

      // Save component
      const filename = `${component.name}.tsx`;
      const filepath = path.join(this.componentsDir, level, filename);
      
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, componentCode, 'utf8');

      console.log(`✅ Generated ${level}: ${component.name}`);

      return { filepath, code: componentCode };
    });

    // Bundle creation
    this.taskQueue.registerHandler('bundle:create', async (task) => {
      const { bundle, styleguide } = task.payload;

      // Create bundle index file that exports all components
      const imports = bundle.components.map(name => {
        const component = styleguide.components.find(c => c.name === name);
        if (component) {
          return `export { ${name} } from './${component.level}/${name}';`;
        }
        return '';
      }).filter(Boolean);

      const bundleCode = `// ${bundle.name} Bundle
// ${bundle.description}
${bundle.userStory ? `// User Story: ${bundle.userStory}` : ''}

${imports.join('\n')}
`;

      const filepath = path.join(this.componentsDir, 'bundles', `${bundle.name}.ts`);
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, bundleCode, 'utf8');

      console.log(`📦 Created bundle: ${bundle.name}`);

      return { filepath, components: bundle.components };
    });

    // Storybook story generation
    this.taskQueue.registerHandler('storybook:generate', async (task) => {
      const { component, componentPath, styleguide } = task.payload;

      const story = this.generateStoryCode(component, styleguide);

      const filename = `${component.name}.stories.tsx`;
      const filepath = path.join(this.storiesDir, component.level, filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, story, 'utf8');

      console.log(`📚 Generated story: ${component.name}`);

      return { filepath, story };
    });

    // Documentation generation
    this.taskQueue.registerHandler('documentation:generate', async (task) => {
      const { type, styleguide } = task.payload;

      const doc = await this.generateDocumentation(type, styleguide);

      const filename = `${type}.md`;
      const filepath = path.join(this.outputDir, 'docs', filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, doc, 'utf8');

      console.log(`📖 Generated documentation: ${type}`);

      return { filepath, doc };
    });
  }

  /**
   * Generate component code
   */
  private async generateComponentCode(
    component: ComponentSpec,
    styleguide: StyleguideData
  ): Promise<string> {
    // This would use the AI skill executor to generate the actual component code
    // For now, return a template

    const props = component.props.map(p => 
      `  ${p.name}${p.required ? '' : '?'}: ${p.type};`
    ).join('\n');

    return `import React from 'react';

interface ${component.name}Props {
${props}
}

/**
 * ${component.description}
 * 
 * @level ${component.level}
 * ${component.useCases ? `@useCases ${component.useCases.join(', ')}` : ''}
 */
export const ${component.name}: React.FC<${component.name}Props> = ({
  ${component.props.map(p => p.name).join(',\n  ')}
}) => {
  return (
    <div className="${component.name}">
      {/* TODO: Implement component */}
    </div>
  );
};

export default ${component.name};
`;
  }

  /**
   * Generate Storybook story code
   */
  private generateStoryCode(component: ComponentSpec, styleguide: StyleguideData): string {
    const defaultArgs = component.props
      .filter(p => p.default !== undefined)
      .map(p => `    ${p.name}: ${JSON.stringify(p.default)}`)
      .join(',\n');

    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${component.name} } from '../../components/${component.level}/${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: '${component.level}/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
${defaultArgs || '    // Add default args'}
  },
};

${component.variants ? component.variants.map(variant => `
export const ${variant}: Story = {
  args: {
    // Add ${variant} variant args
  },
};
`).join('\n') : ''}
`;
  }

  /**
   * Generate documentation content
   */
  private async generateDocumentationContent(type: string, styleguide: StyleguideData): Promise<string> {
    switch (type) {
      case 'getting-started':
        return `# Getting Started with ${styleguide.name}

${styleguide.name} is a comprehensive design system built with ${styleguide.version}.

## Installation

\`\`\`bash
npm install @your-org/${styleguide.id}
\`\`\`

## Quick Start

\`\`\`typescript
import { Button, Input } from '@your-org/${styleguide.id}';

function App() {
  return (
    <div>
      <Input placeholder="Enter text" />
      <Button>Click me</Button>
    </div>
  );
}
\`\`\`

## Design Tokens

This design system includes ${styleguide.tokens.length} design tokens for colors, typography, spacing, and more.
`;

      case 'component-docs':
        return `# Component Documentation

## Available Components

${styleguide.components.map(c => `
### ${c.name} (${c.level})

${c.description}

**Props:**
${c.props.map(p => `- \`${p.name}\`${p.required ? ' (required)' : ''}: ${p.description}`).join('\n')}
`).join('\n')}
`;

      case 'contributing':
        return `# Contributing to ${styleguide.name}

Thank you for your interest in contributing!

## Development Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Adding New Components

1. Create component in appropriate atomic level directory
2. Add Storybook stories
3. Add tests
4. Update documentation
5. Submit pull request
`;

      case 'design-principles':
        return `# Design Principles

${styleguide.name} follows these core design principles:

## Atomic Design

Components are organized using atomic design methodology:
- **Atoms**: Basic building blocks
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex UI components
- **Templates**: Page-level layouts
- **Pages**: Specific instances

## Accessibility

All components follow WCAG 2.1 AA standards.

## Consistency

Design tokens ensure visual consistency across the system.
`;

      default:
        return `# ${type}\n\nDocumentation coming soon...`;
    }
  }

  /**
   * Get priority for atomic level
   */
  private getLevelPriority(level: string): TaskPriority {
    switch (level) {
      case 'atom':
        return TaskPriority.CRITICAL;
      case 'molecule':
        return TaskPriority.HIGH;
      case 'organism':
        return TaskPriority.MEDIUM;
      case 'template':
      case 'page':
        return TaskPriority.LOW;
      default:
        return TaskPriority.MEDIUM;
    }
  }
}

export default DesignSystemAutomationFramework;
