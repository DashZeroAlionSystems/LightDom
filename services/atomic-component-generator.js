#!/usr/bin/env node

/**
 * Atomic Component Generator Service
 *
 * Generates React components from atomic schemas with full type safety,
 * tests, stories, and documentation. Integrates with DeepSeek for
 * AI-powered component enhancement.
 *
 * Features:
 * - Generate components from JSON schemas
 * - TypeScript types and Zod validation
 * - Storybook stories auto-generation
 * - Test scaffolding
 * - DeepSeek integration for smart generation
 * - Component relationship tracking
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy load DeepSeek service (may not be available if dependencies not installed)
let DeepSeekAPIService;
try {
  const module = await import('./deepseek-api-service.js');
  DeepSeekAPIService = module.DeepSeekAPIService;
} catch (error) {
  console.warn('DeepSeek service not available:', error.message);
  DeepSeekAPIService = null;
}

export class AtomicComponentGenerator extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      schemasDir: config.schemasDir || './schemas/components',
      outputDir: config.outputDir || './src/components/atoms',
      storiesDir: config.storiesDir || './src/stories/atoms',
      testsDir: config.testsDir || './src/components/atoms',
      useAI: config.useAI !== false,
      ...config,
    };

    if (this.config.useAI && DeepSeekAPIService) {
      this.deepseek = new DeepSeekAPIService({
        model: config.model || 'deepseek-reasoner',
        ...config.deepseek,
      });
    } else if (this.config.useAI && !DeepSeekAPIService) {
      console.warn(
        '⚠️ AI features requested but DeepSeek service not available. Using template-based generation.'
      );
      this.config.useAI = false;
    }

    this.schemaCache = new Map();
    this.componentRegistry = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    console.log('🚀 Initializing Atomic Component Generator...');

    // Ensure directories exist
    await Promise.all([
      fs.mkdir(this.config.schemasDir, { recursive: true }),
      fs.mkdir(this.config.outputDir, { recursive: true }),
      fs.mkdir(this.config.storiesDir, { recursive: true }),
    ]);

    // Load existing schemas
    await this.loadSchemas();

    console.log(`✅ Loaded ${this.schemaCache.size} component schemas`);
  }

  /**
   * Load all component schemas
   */
  async loadSchemas() {
    try {
      const files = await fs.readdir(this.config.schemasDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = path.join(this.config.schemasDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const schema = JSON.parse(content);

        const componentName = schema['lightdom:reactComponent'] || schema.name;
        this.schemaCache.set(componentName, schema);
        this.componentRegistry.set(componentName, {
          schema,
          generated: false,
          path: null,
        });
      }
    } catch (error) {
      console.error('Error loading schemas:', error.message);
    }
  }

  /**
   * Generate component from schema
   */
  async generateComponent(componentName, options = {}) {
    console.log(`\n🔨 Generating component: ${componentName}`);

    const schema = this.schemaCache.get(componentName);
    if (!schema) {
      throw new Error(`Schema not found for component: ${componentName}`);
    }

    const results = {
      componentName,
      files: {},
      success: false,
    };

    try {
      // Generate TypeScript types
      console.log('  📝 Generating types...');
      const types = await this.generateTypes(schema);
      results.files.types = types;

      // Generate React component
      console.log('  ⚛️  Generating component...');
      const component = await this.generateReactComponent(schema, options);
      results.files.component = component;

      // Generate Zod schema
      console.log('  🔍 Generating validation schema...');
      const zodSchema = await this.generateZodSchema(schema);
      results.files.zodSchema = zodSchema;

      // Generate Storybook story
      console.log('  📖 Generating Storybook story...');
      const story = await this.generateStory(schema);
      results.files.story = story;

      // Generate tests
      console.log('  🧪 Generating tests...');
      const tests = await this.generateTests(schema);
      results.files.tests = tests;

      // Write files
      await this.writeComponentFiles(componentName, results.files);

      results.success = true;
      console.log(`✅ Successfully generated ${componentName}`);

      // Update registry
      this.componentRegistry.set(componentName, {
        schema,
        generated: true,
        path: path.join(this.config.outputDir, componentName),
        generatedAt: new Date().toISOString(),
      });

      this.emit('component:generated', { componentName, results });

      return results;
    } catch (error) {
      console.error(`❌ Error generating ${componentName}:`, error.message);
      results.error = error.message;
      this.emit('component:error', { componentName, error });
      throw error;
    }
  }

  /**
   * Generate TypeScript types from schema
   */
  async generateTypes(schema) {
    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'] || [];

    let typesDef = `/**\n * ${componentName} Component Types\n * Generated from atomic schema\n */\n\n`;

    // Generate main props interface
    typesDef += `export interface ${componentName}Props {\n`;

    for (const prop of props) {
      const optional = prop.required ? '' : '?';
      const propType = this.mapToTypeScript(prop);
      const description = prop.description ? `  /** ${prop.description} */\n` : '';

      typesDef += description;
      typesDef += `  ${prop.name}${optional}: ${propType};\n`;
    }

    typesDef += '}\n\n';

    // Add variant types if enum
    for (const prop of props) {
      if (prop.enum) {
        const typeName = `${componentName}${this.capitalize(prop.name)}`;
        typesDef += `export type ${typeName} = ${prop.enum.map(v => `'${v}'`).join(' | ')};\n`;
      }
    }

    return typesDef;
  }

  /**
   * Generate React component
   */
  async generateReactComponent(schema, options = {}) {
    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'] || [];

    // Use AI to generate if enabled and requested
    if (this.config.useAI && options.useAI !== false) {
      return await this.generateComponentWithAI(schema, options);
    }

    // Default template-based generation
    const defaultProps = props.filter(p => p.default !== undefined);
    const nonDefaultProps = props.filter(p => p.default === undefined);

    const defaultPropDeclarations = defaultProps.map(p => {
      const value = typeof p.default === 'string' ? `'${p.default}'` : p.default;
      return `  ${p.name} = ${value}`;
    });

    const nonDefaultPropNames = nonDefaultProps.map(p => `  ${p.name}`);

    let componentCode = `import React from 'react';\nimport type { ${componentName}Props } from './${componentName}.types';\n`;

    // Add accessibility import if needed
    if (schema['lightdom:accessibility']) {
      componentCode += `import { useAccessibility } from '@/hooks/useAccessibility';\n`;
    }

    componentCode += `\n/**\n * ${schema.description || componentName}\n`;
    if (schema['lightdom:semanticMeaning']) {
      componentCode += ` * \n * ${schema['lightdom:semanticMeaning']}\n`;
    }
    componentCode += ` */\n`;

    componentCode += `export const ${componentName}: React.FC<${componentName}Props> = ({\n`;

    // Combine default and non-default props in destructuring
    const allPropDeclarations = [...defaultPropDeclarations];
    if (nonDefaultPropNames.length > 0) {
      if (defaultPropDeclarations.length > 0) {
        allPropDeclarations.push(...nonDefaultPropNames);
      } else {
        allPropDeclarations.push(...nonDefaultPropNames);
      }
    }

    if (allPropDeclarations.length > 0) {
      componentCode += `${allPropDeclarations.join(',\n')}\n`;
    }
    componentCode += `}) => {\n`;

    // Add basic implementation
    const role = schema['lightdom:accessibility']?.role || 'div';
    componentCode += `  return (\n`;
    componentCode += `    <div role="${role}" className="${componentName.toLowerCase()}">\n`;
    componentCode += `      {/* Generated ${componentName} Component */}\n`;
    componentCode += `      {/* TODO: Implement component logic */}\n`;
    componentCode += `    </div>\n`;
    componentCode += `  );\n`;
    componentCode += `};\n\n`;

    componentCode += `${componentName}.displayName = '${componentName}';\n`;

    return componentCode;
  }

  /**
   * Generate component using DeepSeek AI
   */
  async generateComponentWithAI(schema, options = {}) {
    const componentName = schema['lightdom:reactComponent'];

    const prompt = `Generate a React TypeScript component based on this schema:

Component Name: ${componentName}
Description: ${schema.description}
Semantic Meaning: ${schema['lightdom:semanticMeaning'] || 'N/A'}

Props:
${JSON.stringify(schema['lightdom:props'], null, 2)}

Accessibility:
${JSON.stringify(schema['lightdom:accessibility'], null, 2)}

Requirements:
- Use TypeScript with strict types
- Follow React best practices (functional component, hooks)
- Include all accessibility features
- Add proper ARIA attributes
- Handle all states (loading, disabled, error, etc.)
- Use Tailwind CSS for styling
- Include JSDoc comments
- Export as named export

Generate only the component code, no explanation.`;

    try {
      const response = await this.deepseek.chat(prompt, {
        temperature: 0.3,
        max_tokens: 2000,
      });

      // Extract code from response
      let code = response.content;
      if (code.includes('```')) {
        const match = code.match(/```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)```/);
        if (match) {
          code = match[1];
        }
      }

      return code;
    } catch (error) {
      console.warn('AI generation failed, falling back to template:', error.message);
      return await this.generateReactComponent(schema, { useAI: false });
    }
  }

  /**
   * Generate Zod validation schema
   */
  async generateZodSchema(schema) {
    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'] || [];

    let zodCode = `import { z } from 'zod';\n\n`;
    zodCode += `/**\n * Zod validation schema for ${componentName}\n */\n`;
    zodCode += `export const ${componentName}Schema = z.object({\n`;

    for (const prop of props) {
      const zodType = this.mapToZod(prop);
      zodCode += `  ${prop.name}: ${zodType}`;

      if (!prop.required) {
        zodCode += `.optional()`;
      }

      if (prop.default !== undefined) {
        const defaultVal = typeof prop.default === 'string' ? `'${prop.default}'` : prop.default;
        zodCode += `.default(${defaultVal})`;
      }

      zodCode += `,\n`;
    }

    zodCode += `});\n\n`;
    zodCode += `export type ${componentName}Data = z.infer<typeof ${componentName}Schema>;\n`;

    return zodCode;
  }

  /**
   * Generate Storybook story
   */
  async generateStory(schema) {
    const componentName = schema['lightdom:reactComponent'];
    const category = schema['lightdom:category'] || 'atoms';
    const examples = schema['lightdom:examples'] || [];

    let storyCode = `import type { Meta, StoryObj } from '@storybook/react';\n`;
    storyCode += `import { ${componentName} } from '@/components/atoms/${componentName}/${componentName}';\n\n`;

    storyCode += `const meta: Meta<typeof ${componentName}> = {\n`;
    storyCode += `  title: '${this.capitalize(category)}/${componentName}',\n`;
    storyCode += `  component: ${componentName},\n`;
    storyCode += `  parameters: {\n`;
    storyCode += `    layout: 'centered',\n`;
    storyCode += `  },\n`;
    storyCode += `  tags: ['autodocs'],\n`;
    storyCode += `};\n\n`;

    storyCode += `export default meta;\n`;
    storyCode += `type Story = StoryObj<typeof ${componentName}>;\n\n`;

    // Add default story
    storyCode += `export const Default: Story = {\n`;
    storyCode += `  args: {},\n`;
    storyCode += `};\n\n`;

    // Add example stories
    for (const example of examples) {
      const storyName = example.name.replace(/\s+/g, '');
      storyCode += `export const ${storyName}: Story = {\n`;
      storyCode += `  args: ${JSON.stringify(example.props, null, 4)},\n`;
      storyCode += `};\n\n`;
    }

    return storyCode;
  }

  /**
   * Generate tests
   */
  async generateTests(schema) {
    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'] || [];

    let testCode = `import { render, screen } from '@testing-library/react';\n`;
    testCode += `import { ${componentName} } from './${componentName}';\n\n`;

    testCode += `describe('${componentName}', () => {\n`;
    testCode += `  it('renders without crashing', () => {\n`;
    testCode += `    render(<${componentName} />);\n`;
    testCode += `  });\n\n`;

    // Add prop tests
    const requiredProps = props.filter(p => p.required);
    if (requiredProps.length > 0) {
      testCode += `  it('renders with required props', () => {\n`;
      testCode += `    render(<${componentName}\n`;
      for (const prop of requiredProps) {
        const value = this.getTestValue(prop);
        testCode += `      ${prop.name}={${value}}\n`;
      }
      testCode += `    />);\n`;
      testCode += `  });\n\n`;
    }

    testCode += `});\n`;

    return testCode;
  }

  /**
   * Write component files to disk
   */
  async writeComponentFiles(componentName, files) {
    const componentDir = path.join(this.config.outputDir, componentName);
    await fs.mkdir(componentDir, { recursive: true });

    // Write types
    if (files.types) {
      await fs.writeFile(path.join(componentDir, `${componentName}.types.ts`), files.types);
    }

    // Write component
    if (files.component) {
      await fs.writeFile(path.join(componentDir, `${componentName}.tsx`), files.component);
    }

    // Write Zod schema
    if (files.zodSchema) {
      await fs.writeFile(path.join(componentDir, `${componentName}.schema.ts`), files.zodSchema);
    }

    // Write tests
    if (files.tests) {
      await fs.writeFile(path.join(componentDir, `${componentName}.test.tsx`), files.tests);
    }

    // Write story (in stories directory)
    if (files.story) {
      const storiesDir = path.join(this.config.storiesDir, componentName);
      await fs.mkdir(storiesDir, { recursive: true });
      await fs.writeFile(path.join(storiesDir, `${componentName}.stories.tsx`), files.story);
    }

    // Write index file
    const indexContent = `export { ${componentName} } from './${componentName}';\nexport type { ${componentName}Props } from './${componentName}.types';\n`;
    await fs.writeFile(path.join(componentDir, 'index.ts'), indexContent);
  }

  /**
   * Generate all components from schemas
   */
  async generateAll(options = {}) {
    console.log(`\n📦 Generating all components...`);

    const results = [];
    const components = Array.from(this.schemaCache.keys());

    for (const componentName of components) {
      try {
        const result = await this.generateComponent(componentName, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to generate ${componentName}:`, error.message);
        results.push({ componentName, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ Generated ${successful}/${results.length} components`);

    return results;
  }

  // Helper methods

  mapToTypeScript(prop) {
    if (prop.enum) {
      return prop.enum.map(v => `'${v}'`).join(' | ');
    }

    const typeMap = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      function: '() => void',
      object: 'Record<string, any>',
      array: 'any[]',
    };

    return typeMap[prop.type] || 'any';
  }

  mapToZod(prop) {
    let zodType = '';

    if (prop.enum) {
      zodType = `z.enum([${prop.enum.map(v => `'${v}'`).join(', ')}])`;
    } else {
      const zodMap = {
        string: 'z.string()',
        number: 'z.number()',
        boolean: 'z.boolean()',
        function: 'z.function()',
        object: 'z.object({})',
        array: 'z.array(z.any())',
      };
      zodType = zodMap[prop.type] || 'z.any()';
    }

    // Add validations
    if (prop.type === 'string' && prop.validation) {
      if (prop.validation.min) zodType += `.min(${prop.validation.min})`;
      if (prop.validation.max) zodType += `.max(${prop.validation.max})`;
      if (prop.validation.pattern) zodType += `.regex(/${prop.validation.pattern}/)`;
    }

    if (prop.type === 'number' && prop.validation) {
      if (prop.validation.min !== undefined) zodType += `.min(${prop.validation.min})`;
      if (prop.validation.max !== undefined) zodType += `.max(${prop.validation.max})`;
    }

    return zodType;
  }

  getTestValue(prop) {
    if (prop.type === 'string') return `"test ${prop.name}"`;
    if (prop.type === 'number') return '42';
    if (prop.type === 'boolean') return 'true';
    if (prop.type === 'function') return '() => {}';
    if (prop.type === 'object') return '{}';
    if (prop.type === 'array') return '[]';
    return 'null';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get component registry
   */
  getRegistry() {
    return Array.from(this.componentRegistry.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }

  /**
   * Cleanup
   */
  async cleanup() {
    this.schemaCache.clear();
    this.componentRegistry.clear();
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AtomicComponentGenerator();
  await generator.initialize();

  const command = process.argv[2];
  const arg = process.argv[3];

  if (command === 'generate' && arg) {
    await generator.generateComponent(arg, { useAI: process.argv.includes('--ai') });
  } else if (command === 'generate-all') {
    await generator.generateAll({ useAI: process.argv.includes('--ai') });
  } else if (command === 'list') {
    const registry = generator.getRegistry();
    console.table(
      registry.map(c => ({
        name: c.name,
        type: c.schema['lightdom:componentType'],
        generated: c.generated ? '✓' : '✗',
      }))
    );
  } else {
    console.log('Usage:');
    console.log('  node atomic-component-generator.js generate <component-name> [--ai]');
    console.log('  node atomic-component-generator.js generate-all [--ai]');
    console.log('  node atomic-component-generator.js list');
  }

  await generator.cleanup();
  process.exit(0);
}
