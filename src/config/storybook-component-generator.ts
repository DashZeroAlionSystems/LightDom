/**
 * Storybook Component Generator Configuration
 * 
 * Transforms user stories into Material Design 3 components
 * Integrates with styleguide rules and pattern library
 * 
 * Features:
 * - Story-to-component translation
 * - Material Design pattern application
 * - Automatic story generation
 * - Design token integration
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MaterialDesignPatternMiner } from '../services/material-design-pattern-miner';
import { defaultMD3StyleguideConfig } from './material-design-3-styleguide-config';

// ============================================================================
// TYPES
// ============================================================================

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  componentType?: ComponentType;
  interactions?: Interaction[];
  designTokens?: string[];
}

export type ComponentType = 
  | 'button' 
  | 'card' 
  | 'form' 
  | 'navigation' 
  | 'dialog' 
  | 'list'
  | 'input'
  | 'feedback'
  | 'layout'
  | 'data-display';

export interface Interaction {
  type: 'click' | 'hover' | 'focus' | 'submit' | 'select';
  target: string;
  expected: string;
}

export interface ComponentTemplate {
  name: string;
  description: string;
  props: ComponentProp[];
  stories: StoryTemplate[];
  materialPatterns: string[];
  designTokens: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
}

export interface StoryTemplate {
  name: string;
  args: Record<string, any>;
  description: string;
}

// ============================================================================
// COMPONENT GENERATOR
// ============================================================================

export class StorybookComponentGenerator {
  private patternMiner: MaterialDesignPatternMiner;
  private styleguideConfig: typeof defaultMD3StyleguideConfig;

  constructor() {
    this.patternMiner = new MaterialDesignPatternMiner();
    this.styleguideConfig = defaultMD3StyleguideConfig;
  }

  /**
   * Generate component from user story
   */
  generateFromUserStory(story: UserStory): ComponentTemplate {
    const componentType = this.inferComponentType(story);
    const patterns = this.selectRelevantPatterns(story, componentType);
    const props = this.extractProps(story);
    const stories = this.generateStories(story, props);
    const designTokens = this.selectDesignTokens(story);

    return {
      name: this.generateComponentName(story.title),
      description: story.description,
      props,
      stories,
      materialPatterns: patterns,
      designTokens,
    };
  }

  /**
   * Infer component type from story
   */
  private inferComponentType(story: UserStory): ComponentType {
    if (story.componentType) return story.componentType;

    const keywords = story.description.toLowerCase();
    
    if (keywords.includes('button') || keywords.includes('click')) return 'button';
    if (keywords.includes('card') || keywords.includes('preview')) return 'card';
    if (keywords.includes('form') || keywords.includes('input')) return 'form';
    if (keywords.includes('nav') || keywords.includes('menu')) return 'navigation';
    if (keywords.includes('dialog') || keywords.includes('modal')) return 'dialog';
    if (keywords.includes('list') || keywords.includes('items')) return 'list';
    if (keywords.includes('snackbar') || keywords.includes('toast')) return 'feedback';
    
    return 'layout';
  }

  /**
   * Select relevant Material Design patterns
   */
  private selectRelevantPatterns(story: UserStory, type: ComponentType): string[] {
    const allPatterns = this.patternMiner.getAllPatterns();
    const relevant: string[] = [];

    // Map component types to pattern categories
    const categoryMap: Record<ComponentType, string[]> = {
      button: ['feedback'],
      card: ['display', 'layout'],
      form: ['input'],
      navigation: ['navigation'],
      dialog: ['feedback'],
      list: ['display'],
      input: ['input'],
      feedback: ['feedback'],
      layout: ['layout'],
      'data-display': ['display'],
    };

    const categories = categoryMap[type] || [];
    
    allPatterns.forEach(pattern => {
      if (categories.includes(pattern.category)) {
        relevant.push(pattern.id);
      }
    });

    return relevant;
  }

  /**
   * Extract props from user story
   */
  private extractProps(story: UserStory): ComponentProp[] {
    const props: ComponentProp[] = [];
    
    // Standard props for common component types
    const commonProps: ComponentProp[] = [
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes',
      },
      {
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Child elements',
      },
    ];

    // Extract from acceptance criteria
    story.acceptanceCriteria.forEach(criterion => {
      const propMatch = criterion.match(/(?:should|must|can)\s+(\w+)/i);
      if (propMatch) {
        const propName = propMatch[1].toLowerCase();
        props.push({
          name: propName,
          type: 'any',
          required: false,
          description: criterion,
        });
      }
    });

    return [...commonProps, ...props];
  }

  /**
   * Generate stories for component
   */
  private generateStories(story: UserStory, props: ComponentProp[]): StoryTemplate[] {
    const stories: StoryTemplate[] = [];

    // Default story
    stories.push({
      name: 'Default',
      args: this.generateDefaultArgs(props),
      description: 'Default state of the component',
    });

    // Generate stories from interactions
    story.interactions?.forEach(interaction => {
      stories.push({
        name: this.capitalizeFirst(interaction.type),
        args: this.generateArgsForInteraction(interaction, props),
        description: `Component in ${interaction.type} state`,
      });
    });

    // Generate stories from acceptance criteria
    story.acceptanceCriteria.forEach((criterion, index) => {
      stories.push({
        name: `Scenario${index + 1}`,
        args: this.generateDefaultArgs(props),
        description: criterion,
      });
    });

    return stories;
  }

  /**
   * Select design tokens
   */
  private selectDesignTokens(story: UserStory): string[] {
    const tokens: string[] = [];

    // Always include base tokens
    tokens.push('colors.primary', 'spacing.scale', 'motion.duration');

    // Add specific tokens based on story
    if (story.designTokens) {
      tokens.push(...story.designTokens);
    }

    return tokens;
  }

  /**
   * Generate component name from title
   */
  private generateComponentName(title: string): string {
    return title
      .split(' ')
      .map(word => this.capitalizeFirst(word))
      .join('');
  }

  /**
   * Generate default args
   */
  private generateDefaultArgs(props: ComponentProp[]): Record<string, any> {
    const args: Record<string, any> = {};
    
    props.forEach(prop => {
      if (prop.default !== undefined) {
        args[prop.name] = prop.default;
      } else if (prop.type === 'string') {
        args[prop.name] = prop.name === 'children' ? 'Default Content' : '';
      } else if (prop.type === 'boolean') {
        args[prop.name] = false;
      }
    });

    return args;
  }

  /**
   * Generate args for interaction
   */
  private generateArgsForInteraction(
    interaction: Interaction,
    props: ComponentProp[]
  ): Record<string, any> {
    const args = this.generateDefaultArgs(props);
    
    // Customize based on interaction type
    if (interaction.type === 'hover') {
      args.hover = true;
    } else if (interaction.type === 'focus') {
      args.focused = true;
    } else if (interaction.type === 'click') {
      args.disabled = false;
    }

    return args;
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate complete component code
   */
  generateComponentCode(template: ComponentTemplate): string {
    const patterns = template.materialPatterns
      .map(id => this.patternMiner.getPatternById(id))
      .filter(Boolean);

    return `
/**
 * ${template.name}
 * 
 * ${template.description}
 * 
 * Material Design Patterns Used:
${patterns.map(p => ` * - ${p!.name}: ${p!.description}`).join('\n')}
 */

import React from 'react';
import { motion } from 'framer-motion';
import anime from 'animejs';

interface ${template.name}Props {
${template.props.map(p => 
  `  ${p.name}${p.required ? '' : '?'}: ${p.type};${p.description ? ` // ${p.description}` : ''}`
).join('\n')}
}

export const ${template.name}: React.FC<${template.name}Props> = ({
${template.props.map(p => `  ${p.name}${p.default !== undefined ? ` = ${JSON.stringify(p.default)}` : ''}`).join(',\n')}
}) => {
  // Component implementation based on Material Design patterns
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="material-component"
    >
      {children}
    </motion.div>
  );
};

export default ${template.name};
    `.trim();
  }

  /**
   * Generate Storybook story file
   */
  generateStoryFile(template: ComponentTemplate): string {
    return `
import type { Meta, StoryObj } from '@storybook/react';
import { ${template.name} } from './${template.name}';

const meta = {
  title: 'Generated/${template.name}',
  component: ${template.name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${template.description}',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
${template.props.map(p => 
  `    ${p.name}: {\n      control: '${this.getControlType(p.type)}',\n      description: '${p.description}',\n    }`
).join(',\n')}
  },
} satisfies Meta<typeof ${template.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

${template.stories.map(story => `
export const ${story.name}: Story = {
  args: ${JSON.stringify(story.args, null, 2)},
};
`).join('\n')}
    `.trim();
  }

  /**
   * Get Storybook control type from prop type
   */
  private getControlType(type: string): string {
    if (type === 'string') return 'text';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (type.includes('[]')) return 'array';
    if (type.includes('object')) return 'object';
    return 'text';
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

export const exampleUserStories: UserStory[] = [
  {
    id: 'us-001',
    title: 'SEO Metric Card',
    description: 'Display SEO metrics in an animated card with trend indicators',
    acceptanceCriteria: [
      'Should display metric value prominently',
      'Must show trend indicator (up/down)',
      'Should animate on entrance',
      'Can compare with previous value',
    ],
    componentType: 'card',
    interactions: [
      {
        type: 'hover',
        target: 'card',
        expected: 'Elevates and shows more details',
      },
    ],
    designTokens: ['colors.primary', 'elevation.levels.2', 'motion.duration.medium'],
  },
  {
    id: 'us-002',
    title: 'Filter Chip Group',
    description: 'Multiple selection filter chips for report filtering',
    acceptanceCriteria: [
      'Should allow multiple selections',
      'Must show selected state clearly',
      'Should animate selection changes',
    ],
    componentType: 'input',
    interactions: [
      {
        type: 'click',
        target: 'chip',
        expected: 'Toggles selection state',
      },
    ],
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const componentGenerator = new StorybookComponentGenerator();

export default {
  StorybookComponentGenerator,
  componentGenerator,
  exampleUserStories,
};
