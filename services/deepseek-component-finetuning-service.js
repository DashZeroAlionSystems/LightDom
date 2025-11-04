/**
 * DeepSeek Component Fine-tuning Service
 * 
 * Service for fine-tuning DeepSeek models on component generation tasks.
 * Creates training datasets from style guides and existing components,
 * then uses them to generate new components based on design specifications.
 * 
 * Features:
 * - Generate training data from style guides
 * - Fine-tune DeepSeek for component generation
 * - Generate components from prompts and style guides
 * - Create component variations and states
 * - Generate complete Storybook documentation
 * - Extract patterns from existing code
 */

import { EventEmitter } from 'events';
import { DeepSeekAPIService } from './deepseek-api-service.js';
import fs from 'fs/promises';
import path from 'path';

export class DeepSeekComponentFinetuningService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      trainingDataDir: config.trainingDataDir || './training-data/components',
      outputDir: config.outputDir || './generated-components',
      modelName: config.modelName || 'deepseek-chat',
      fineTuneModel: config.fineTuneModel || 'deepseek-coder',
      ...config
    };

    this.deepseekService = new DeepSeekAPIService({
      model: this.config.modelName,
      ...config.deepseek
    });

    this.trainingData = [];
    this.fineTunedModel = null;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    // Ensure directories exist
    await fs.mkdir(this.config.trainingDataDir, { recursive: true });
    await fs.mkdir(this.config.outputDir, { recursive: true });
    
    console.log('✅ DeepSeek Component Fine-tuning Service initialized');
  }

  /**
   * Generate training data from style guide
   */
  async generateTrainingDataFromStyleGuide(styleGuide) {
    console.log('📚 Generating training data from style guide...');

    const trainingExamples = [];

    // Generate examples for each component
    if (styleGuide.components) {
      for (const [componentName, component] of Object.entries(styleGuide.components)) {
        // Example 1: Component generation from description
        trainingExamples.push({
          instruction: `Generate a ${componentName} component based on the following style guide`,
          input: JSON.stringify({
            component: componentName,
            styleGuide: {
              tokens: styleGuide.tokens,
              variants: component.variants,
              states: component.states
            }
          }),
          output: styleGuide.code?.react?.[componentName] || this.generatePlaceholderComponent(componentName, component)
        });

        // Example 2: Storybook story generation
        if (styleGuide.code?.storybook?.[componentName]) {
          trainingExamples.push({
            instruction: `Generate a Storybook story for a ${componentName} component`,
            input: JSON.stringify({
              component: componentName,
              variants: component.variants,
              states: component.states
            }),
            output: styleGuide.code.storybook[componentName]
          });
        }

        // Example 3: Variant generation
        if (component.variants) {
          component.variants.forEach(variant => {
            trainingExamples.push({
              instruction: `Generate a ${variant} variant of the ${componentName} component`,
              input: JSON.stringify({
                component: componentName,
                variant,
                styleGuide: styleGuide.tokens
              }),
              output: this.generateVariantCode(componentName, variant, component, styleGuide.tokens)
            });
          });
        }

        // Example 4: State handling
        if (component.states) {
          Object.keys(component.states).forEach(state => {
            trainingExamples.push({
              instruction: `Add ${state} state to ${componentName} component`,
              input: JSON.stringify({
                component: componentName,
                state,
                baseComponent: this.generatePlaceholderComponent(componentName, component)
              }),
              output: this.generateStateCode(componentName, state, component)
            });
          });
        }
      }
    }

    // Add design token examples
    if (styleGuide.tokens) {
      trainingExamples.push({
        instruction: 'Generate CSS custom properties from design tokens',
        input: JSON.stringify({ tokens: styleGuide.tokens }),
        output: styleGuide.code?.css || this.generateCSSFromTokens(styleGuide.tokens)
      });

      trainingExamples.push({
        instruction: 'Generate Tailwind config from design tokens',
        input: JSON.stringify({ tokens: styleGuide.tokens }),
        output: styleGuide.code?.tailwind || this.generateTailwindFromTokens(styleGuide.tokens)
      });
    }

    this.trainingData = this.trainingData.concat(trainingExamples);

    console.log(`✅ Generated ${trainingExamples.length} training examples`);
    
    return trainingExamples;
  }

  /**
   * Generate training data from existing components
   */
  async generateTrainingDataFromComponents(componentsDir) {
    console.log(`📚 Scanning components from: ${componentsDir}`);

    const trainingExamples = [];

    try {
      const files = await fs.readdir(componentsDir);
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const filePath = path.join(componentsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Extract component name
          const componentName = file.replace(/\.(tsx|jsx)$/, '');
          
          // Parse component structure
          const componentInfo = this.parseComponent(content);
          
          if (componentInfo) {
            trainingExamples.push({
              instruction: `Generate a ${componentName} component`,
              input: JSON.stringify({
                name: componentName,
                props: componentInfo.props,
                description: componentInfo.description
              }),
              output: content
            });

            // Find corresponding story file
            const storyFile = file.replace(/\.(tsx|jsx)$/, '.stories.tsx');
            const storyPath = path.join(componentsDir, storyFile);
            
            try {
              const storyContent = await fs.readFile(storyPath, 'utf-8');
              trainingExamples.push({
                instruction: `Generate Storybook story for ${componentName}`,
                input: JSON.stringify({
                  component: componentName,
                  componentCode: content
                }),
                output: storyContent
              });
            } catch (err) {
              // Story file doesn't exist, skip
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning components:', error.message);
    }

    this.trainingData = this.trainingData.concat(trainingExamples);

    console.log(`✅ Generated ${trainingExamples.length} examples from existing components`);
    
    return trainingExamples;
  }

  /**
   * Save training data to file
   */
  async saveTrainingData(filename = 'component-training-data.jsonl') {
    const filepath = path.join(this.config.trainingDataDir, filename);
    
    // Convert to JSONL format (one JSON object per line)
    const jsonl = this.trainingData
      .map(example => JSON.stringify(example))
      .join('\n');
    
    await fs.writeFile(filepath, jsonl, 'utf-8');
    
    console.log(`✅ Saved ${this.trainingData.length} training examples to ${filepath}`);
    
    return filepath;
  }

  /**
   * Load training data from file
   */
  async loadTrainingData(filename = 'component-training-data.jsonl') {
    const filepath = path.join(this.config.trainingDataDir, filename);
    
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      this.trainingData = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      console.log(`✅ Loaded ${this.trainingData.length} training examples from ${filepath}`);
      
      return this.trainingData;
    } catch (error) {
      console.error('Error loading training data:', error.message);
      return [];
    }
  }

  /**
   * Fine-tune model (placeholder - would need actual DeepSeek fine-tuning API)
   */
  async fineTuneModel(trainingDataPath) {
    console.log('🔧 Starting fine-tuning process...');
    console.log('⚠️  Note: This requires DeepSeek fine-tuning API access');

    // In a real implementation, this would:
    // 1. Upload training data to DeepSeek
    // 2. Start fine-tuning job
    // 3. Monitor progress
    // 4. Return fine-tuned model ID

    this.fineTunedModel = {
      id: `ft-component-gen-${Date.now()}`,
      baseModel: this.config.fineTuneModel,
      status: 'completed',
      trainingDataSize: this.trainingData.length,
      createdAt: new Date().toISOString()
    };

    console.log(`✅ Fine-tuning completed (simulated)`);
    console.log(`   Model ID: ${this.fineTunedModel.id}`);
    
    return this.fineTunedModel;
  }

  /**
   * Generate component from prompt using fine-tuned model
   */
  async generateComponent(prompt, styleGuide, options = {}) {
    console.log(`🎨 Generating component from prompt: "${prompt}"`);

    const systemPrompt = `You are an expert React component generator. Generate production-ready components following the provided style guide and best practices.

Style Guide:
${JSON.stringify(styleGuide, null, 2)}

Requirements:
- Use TypeScript
- Follow Material Design 3 principles
- Include proper prop types
- Add JSDoc comments
- Support variants and states
- Use design tokens from style guide
- Make components accessible (ARIA)
- Include responsive design
`;

    const userPrompt = `${prompt}

${options.framework ? `Framework: ${options.framework}` : 'Framework: React'}
${options.variant ? `Variant: ${options.variant}` : ''}
${options.includeStorybook ? 'Also generate Storybook story' : ''}
`;

    try {
      const response = await this.deepseekService.generateWorkflowFromPrompt(userPrompt, {
        systemPrompt,
        model: this.fineTunedModel?.id || this.config.modelName,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000
      });

      // Parse response to extract code
      const component = this.parseGeneratedComponent(response);

      // Save to file if requested
      if (options.save) {
        const filename = options.filename || this.generateFilename(prompt);
        const filepath = path.join(this.config.outputDir, filename);
        await fs.writeFile(filepath, component.code, 'utf-8');
        console.log(`✅ Component saved to ${filepath}`);
      }

      this.emit('componentGenerated', component);

      return component;
    } catch (error) {
      console.error('Error generating component:', error.message);
      throw error;
    }
  }

  /**
   * Generate complete component library from style guide
   */
  async generateComponentLibrary(styleGuide, options = {}) {
    console.log('🏗️  Generating complete component library...');

    const library = {
      name: options.libraryName || 'ComponentLibrary',
      version: '1.0.0',
      components: {},
      stories: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        totalComponents: 0,
        styleGuideId: styleGuide.id
      }
    };

    // Generate each component from style guide
    if (styleGuide.components) {
      for (const [componentName, component] of Object.entries(styleGuide.components)) {
        console.log(`  Generating ${componentName}...`);

        try {
          const generated = await this.generateComponent(
            `Generate a ${componentName} component`,
            styleGuide,
            {
              framework: options.framework || 'react',
              save: true,
              filename: `${componentName}.tsx`,
              includeStorybook: true
            }
          );

          library.components[componentName] = generated;
          library.metadata.totalComponents++;

          // Generate story
          if (generated.story) {
            library.stories[componentName] = generated.story;
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`  ❌ Failed to generate ${componentName}:`, error.message);
        }
      }
    }

    // Generate index file
    library.index = this.generateIndexFile(library.components);

    // Save library manifest
    const manifestPath = path.join(this.config.outputDir, 'library-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(library, null, 2), 'utf-8');

    console.log(`✅ Component library generated`);
    console.log(`   Components: ${library.metadata.totalComponents}`);
    console.log(`   Output: ${this.config.outputDir}`);

    this.emit('libraryGenerated', library);

    return library;
  }

  /**
   * Generate component variations
   */
  async generateComponentVariations(componentName, baseComponent, variants) {
    console.log(`🎨 Generating ${variants.length} variations for ${componentName}...`);

    const variations = {};

    for (const variant of variants) {
      const prompt = `Generate a ${variant} variant of the ${componentName} component`;
      
      const generated = await this.generateComponent(prompt, {
        components: {
          [componentName]: baseComponent
        }
      }, {
        variant,
        save: false
      });

      variations[variant] = generated;
    }

    return variations;
  }

  /**
   * Generate Storybook story for component
   */
  async generateStorybook(componentName, component, styleGuide) {
    const prompt = `Generate a comprehensive Storybook story for a ${componentName} component`;

    const systemPrompt = `You are an expert at writing Storybook stories. Generate complete, documented stories that showcase all component variants and states.

Component Info:
${JSON.stringify(component, null, 2)}

Style Guide:
${JSON.stringify(styleGuide.tokens, null, 2)}
`;

    try {
      const response = await this.deepseekService.generateWorkflowFromPrompt(prompt, {
        systemPrompt,
        maxTokens: 1500
      });

      return this.parseGeneratedStory(response);
    } catch (error) {
      console.error('Error generating Storybook story:', error.message);
      return this.generateDefaultStory(componentName, component);
    }
  }

  // Helper methods

  generatePlaceholderComponent(name, component) {
    return `import React from 'react';

interface ${name}Props {
  variant?: '${component.variants?.join("' | '") || 'default'}';
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({ variant = 'default', children }) => {
  return (
    <div className={\`${name.toLowerCase()} \${variant}\`}>
      {children}
    </div>
  );
};
`;
  }

  generateVariantCode(componentName, variant, component, tokens) {
    // Generate code for specific variant
    return `// ${variant} variant of ${componentName}
const ${variant}Styles = {
  // Add variant-specific styles here
};
`;
  }

  generateStateCode(componentName, state, component) {
    // Generate code for specific state
    return `// ${state} state handler
const handle${state.charAt(0).toUpperCase() + state.slice(1)} = () => {
  // Add state logic here
};
`;
  }

  generateCSSFromTokens(tokens) {
    let css = ':root {\n';
    
    if (tokens.colors) {
      Object.entries(tokens.colors).forEach(([category, colors]) => {
        Object.entries(colors).forEach(([key, value]) => {
          css += `  --color-${category}-${key}: ${value};\n`;
        });
      });
    }

    css += '}\n';
    return css;
  }

  generateTailwindFromTokens(tokens) {
    const config = {
      theme: {
        extend: {
          colors: tokens.colors || {},
          spacing: tokens.spacing?.scale || {},
          borderRadius: tokens.borderRadius?.scale || {}
        }
      }
    };

    return `module.exports = ${JSON.stringify(config, null, 2)}`;
  }

  parseComponent(code) {
    // Simple parsing - in production, use actual AST parsing
    const nameMatch = code.match(/(?:function|const|export\s+(?:function|const))\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : null;

    const propsMatch = code.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
    const props = propsMatch ? propsMatch[1].trim() : null;

    return name ? { name, props, description: `${name} component` } : null;
  }

  parseGeneratedComponent(response) {
    // Extract code from response
    // This would parse the API response to extract the component code
    
    return {
      name: 'GeneratedComponent',
      code: response.code || response.toString(),
      story: response.story || null,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    };
  }

  parseGeneratedStory(response) {
    // Extract story from response
    return response.story || response.toString();
  }

  generateDefaultStory(componentName, component) {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {}
};
`;
  }

  generateIndexFile(components) {
    const exports = Object.keys(components)
      .map(name => `export { ${name} } from './${name}';`)
      .join('\n');

    return `// Auto-generated component library index
${exports}
`;
  }

  generateFilename(prompt) {
    // Generate filename from prompt
    const name = prompt
      .replace(/^Generate\s+(a\s+)?/i, '')
      .replace(/\s+component$/i, '')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return `${name}.tsx`;
  }
}

export default DeepSeekComponentFinetuningService;
