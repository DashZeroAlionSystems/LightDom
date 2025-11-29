#!/usr/bin/env node

/**
 * Automated Storybook Story Generator
 * 
 * Generates Storybook stories for all components that don't have them
 * Analyzes component props and generates appropriate stories
 */

const fs = require('fs');
const path = require('path');

class StoryGenerator {
  constructor() {
    this.generated = [];
    this.errors = [];
  }

  // Analyze component to extract props
  analyzeComponent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Extract props interface/type
    const propsMatch = content.match(/interface\s+(\w+Props)\s*\{([^}]+)\}/s) ||
                      content.match(/type\s+(\w+Props)\s*=\s*\{([^}]+)\}/s);
    
    const props = [];
    if (propsMatch) {
      const propsContent = propsMatch[2];
      const propLines = propsContent.split('\n').map(line => line.trim()).filter(Boolean);
      
      propLines.forEach(line => {
        const propMatch = line.match(/(\w+)\??\s*:\s*([^;,]+)/);
        if (propMatch) {
          const [, name, type] = propMatch;
          props.push({
            name: name.trim(),
            type: type.trim(),
            optional: line.includes('?')
          });
        }
      });
    }

    // Check if component is a default or named export
    const hasDefaultExport = content.includes('export default');
    const namedExports = content.match(/export\s+(?:const|function)\s+(\w+)/g) || [];
    
    return {
      componentName,
      props,
      hasDefaultExport,
      namedExports: namedExports.map(e => e.split(/\s+/).pop())
    };
  }

  // Generate mock data based on prop type
  generateMockValue(propType) {
    if (propType.includes('string')) return "'Sample text'";
    if (propType.includes('number')) return '42';
    if (propType.includes('boolean')) return 'true';
    if (propType.includes('Date')) return 'new Date()';
    if (propType.includes('[]')) return '[]';
    if (propType.includes('Array')) return '[]';
    if (propType.includes('Function') || propType.includes('=>')) return '() => {}';
    if (propType.includes('React.')) return 'undefined';
    return '{}';
  }

  // Generate story content
  generateStory(component, analysis) {
    const { componentName, props, hasDefaultExport } = analysis;
    const relativePath = path.relative(
      path.dirname(component) + '/../..',
      component
    ).replace(/\.(tsx|jsx)$/, '');

    // Generate args based on props
    const args = props
      .filter(p => !p.optional)
      .map(p => `  ${p.name}: ${this.generateMockValue(p.type)}`)
      .join(',\n');

    // Generate argTypes for controls
    const argTypes = props
      .map(p => {
        let control = 'text';
        if (p.type.includes('boolean')) control = 'boolean';
        else if (p.type.includes('number')) control = 'number';
        else if (p.type.includes('select') || p.type.includes('|')) control = 'select';
        
        return `    ${p.name}: { control: '${control}' }`;
      })
      .join(',\n');

    const storyContent = `import type { Meta, StoryObj } from '@storybook/react';
import ${componentName} from './${componentName}';

/**
 * ${componentName} component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${componentName} component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
${argTypes}
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with standard props
 */
export const Default: Story = {
  args: {
${args}
  }
};

/**
 * Interactive story for testing
 */
export const Interactive: Story = {
  args: {
${args}
  }
};
`;

    return storyContent;
  }

  // Generate stories for component
  generateForComponent(componentPath) {
    try {
      const storyPath = componentPath.replace(/\.(tsx|jsx)$/, '.stories.tsx');
      
      // Skip if story already exists
      if (fs.existsSync(storyPath)) {
        return { skipped: true, reason: 'Story already exists' };
      }

      const analysis = this.analyzeComponent(componentPath);
      const storyContent = this.generateStory(componentPath, analysis);
      
      fs.writeFileSync(storyPath, storyContent);
      
      this.generated.push({
        component: componentPath,
        story: storyPath,
        props: analysis.props.length
      });

      return { success: true, story: storyPath };
    } catch (error) {
      this.errors.push({
        component: componentPath,
        error: error.message
      });
      return { error: error.message };
    }
  }

  // Find all components recursively
  findComponents(dir, components = []) {
    if (!fs.existsSync(dir)) return components;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory() && !file.name.includes('node_modules')) {
        this.findComponents(fullPath, components);
      } else if (file.name.match(/\.(tsx|jsx)$/) && 
                 !file.name.includes('.stories.') && 
                 !file.name.includes('.test.')) {
        components.push(fullPath);
      }
    }
    return components;
  }

  // Generate stories for all components
  generateAll(targetDir = 'src/components', limit = null) {
    console.log('🎨 Generating Storybook Stories...\n');
    
    const components = this.findComponents(targetDir);
    console.log(`Found ${components.length} components\n`);

    const componentsToProcess = limit ? components.slice(0, limit) : components;
    
    componentsToProcess.forEach((component, idx) => {
      const result = this.generateForComponent(component);
      const componentName = path.basename(component);
      
      if (result.success) {
        console.log(`✓ [${idx + 1}/${componentsToProcess.length}] Generated story for ${componentName}`);
      } else if (result.skipped) {
        console.log(`⊘ [${idx + 1}/${componentsToProcess.length}] Skipped ${componentName} (${result.reason})`);
      } else if (result.error) {
        console.log(`✗ [${idx + 1}/${componentsToProcess.length}] Error for ${componentName}: ${result.error}`);
      }
    });

    this.printSummary();
  }

  // Print summary
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Generation Summary\n');
    console.log(`✓ Successfully Generated: ${this.generated.length}`);
    console.log(`✗ Errors: ${this.errors.length}`);
    
    if (this.generated.length > 0) {
      console.log('\nSample Generated Stories:');
      this.generated.slice(0, 5).forEach(item => {
        console.log(`  - ${path.relative(process.cwd(), item.story)} (${item.props} props)`);
      });
      if (this.generated.length > 5) {
        console.log(`  ... and ${this.generated.length - 5} more`);
      }
    }

    if (this.errors.length > 0) {
      console.log('\nErrors:');
      this.errors.slice(0, 5).forEach(item => {
        console.log(`  - ${path.basename(item.component)}: ${item.error}`);
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('1. Run: npm run storybook');
    console.log('2. Review generated stories');
    console.log('3. Customize stories with real use cases');
    console.log('4. Add additional variants and interactions\n');
  }
}

// CLI handling
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? 
  parseInt(args[args.indexOf('--limit') + 1]) : null;
const targetDir = args.includes('--dir') ?
  args[args.indexOf('--dir') + 1] : 'src/components';

const generator = new StoryGenerator();
generator.generateAll(targetDir, limit);
