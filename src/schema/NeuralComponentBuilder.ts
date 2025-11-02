/**
 * Neural Component Builder
 * AI-powered component generation using neural networks
 * Integrates with SchemaComponentMapper and ComponentGeneratorService for intelligent component creation
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import SchemaComponentMapper, { ComponentSchema, PropDefinition } from '../schema/SchemaComponentMapper';
import { componentGeneratorService, ComponentGenerationRequest } from '../services/ComponentGeneratorService.js';
import { componentLibraryService } from '../services/ComponentLibraryService.js';

export interface NeuralBuildRequest {
  useCase: string;
  context?: {
    framework?: 'react' | 'vue' | 'angular' | 'svelte';
    style?: 'functional' | 'class';
    typescript?: boolean;
    testingLibrary?: 'jest' | 'vitest' | 'mocha';
  };
  constraints?: {
    maxComplexity?: number;
    maxDependencies?: number;
    accessibility?: boolean;
    responsive?: boolean;
  };
}

export interface GeneratedComponent {
  schema: ComponentSchema;
  code: string;
  tests?: string;
  styles?: string;
  documentation?: string;
  dependencies: string[];
  linkedComponents: GeneratedComponent[];
}

export interface ComponentTemplate {
  framework: string;
  componentType: string;
  template: string;
}

export class NeuralComponentBuilder extends EventEmitter {
  private schemaMapper: SchemaComponentMapper;
  private logger: Logger;
  private templates: Map<string, ComponentTemplate> = new Map();

  constructor(schemaMapper: SchemaComponentMapper) {
    super();
    this.schemaMapper = schemaMapper;
    this.logger = new Logger('NeuralComponentBuilder');
  }

  /**
   * Initialize the neural component builder
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Neural Component Builder...');

    // Load component templates
    this.loadTemplates();

    this.logger.info('Neural Component Builder initialized');
  }

  /**
   * Load component templates
   */
  private loadTemplates(): void {
    // React functional component template
    this.templates.set('react-functional', {
      framework: 'react',
      componentType: 'functional',
      template: `import React from 'react';

{{imports}}

{{interfaces}}

/**
 * {{componentName}}
 * {{description}}
 * 
 * @component
 */
const {{componentName}}: React.FC<{{componentName}}Props> = (props) => {
  {{propDestructuring}}
  {{hooks}}
  {{handlers}}
  
  return (
    <div className="{{className}}">
      {{content}}
    </div>
  );
};

export default {{componentName}};
`,
    });

    // React class component template
    this.templates.set('react-class', {
      framework: 'react',
      componentType: 'class',
      template: `import React, { Component } from 'react';

{{imports}}

{{interfaces}}

/**
 * {{componentName}}
 * {{description}}
 * 
 * @component
 */
class {{componentName}} extends Component<{{componentName}}Props, {{componentName}}State> {
  constructor(props: {{componentName}}Props) {
    super(props);
    this.state = {{initialState}};
  }

  {{methods}}

  render() {
    return (
      <div className="{{className}}">
        {{content}}
      </div>
    );
  }
}

export default {{componentName}};
`,
    });

    this.logger.debug('Loaded component templates', { count: this.templates.size });
  }

  /**
   * Generate component from use case using atomic library
   */
  async generateComponentFromAtoms(request: NeuralBuildRequest): Promise<GeneratedComponent> {
    this.logger.info('Generating component from atomic library', { useCase: request.useCase });

    // Step 1: Search for relevant atomic components
    const atomicComponents = await componentLibraryService.getAtomicComponents();
    const relevantAtoms = atomicComponents.filter(atom => 
      atom.tags?.some(tag => request.useCase.toLowerCase().includes(tag.toLowerCase()))
    );

    if (relevantAtoms.length === 0) {
      // Fall back to traditional generation
      return this.generateComponent(request);
    }

    this.logger.info('Found relevant atomic components', { count: relevantAtoms.length });

    // Step 2: Use ComponentGeneratorService for AI-powered generation
    const genRequest: ComponentGenerationRequest = {
      componentName: this.extractComponentName(request.useCase),
      componentType: this.determineComponentType(request.useCase),
      baseComponents: relevantAtoms.map(atom => atom.schemaId),
      requirements: {
        functionality: request.useCase,
        designSystem: 'Material Design 3',
        accessibility: request.constraints?.accessibility ?? true,
        responsive: request.constraints?.responsive ?? true,
      },
      aiGeneration: {
        useAI: true,
        model: 'ollama:r1',
        includeTests: request.context?.testingLibrary !== undefined,
        includeStories: true,
      },
      output: {
        typescript: request.context?.typescript ?? true,
        styling: 'CSS Modules',
      },
    };

    const generated = await componentGeneratorService.generateComponent(genRequest);

    // Convert to our GeneratedComponent format
    return {
      schema: this.convertToComponentSchema(generated.schema),
      code: generated.code,
      tests: generated.tests,
      styles: generated.styles,
      documentation: generated.stories || '',
      dependencies: [],
      linkedComponents: [],
    };
  }

  /**
   * Extract component name from use case
   */
  private extractComponentName(useCase: string): string {
    // Convert use case to PascalCase component name
    const words = useCase.split(' ').filter(w => w.length > 0);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  }

  /**
   * Determine component type from use case
   */
  private determineComponentType(useCase: string): 'atom' | 'molecule' | 'organism' {
    const lowerUseCase = useCase.toLowerCase();
    
    // Simple heuristics
    if (lowerUseCase.includes('form') || lowerUseCase.includes('dashboard') || lowerUseCase.includes('list')) {
      return 'organism';
    }
    
    if (lowerUseCase.includes('field') || lowerUseCase.includes('card') || lowerUseCase.includes('search')) {
      return 'molecule';
    }
    
    return 'atom';
  }

  /**
   * Convert ComponentGeneratorService schema to NeuralComponentBuilder schema
   */
  private convertToComponentSchema(schema: any): ComponentSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebComponent',
      '@id': schema.schemaId,
      name: schema.title,
      description: schema.description || '',
      'lightdom:componentType': schema.category,
      'lightdom:reactComponent': schema.title.replace(/\s+/g, ''),
      'lightdom:props': [],
      'lightdom:linkedSchemas': schema.dependencies || [],
      'lightdom:useCase': schema.tags || [],
      'lightdom:semanticMeaning': schema.description || '',
      'lightdom:priority': 1,
      'lightdom:category': schema.category,
    };
  }

  /**
   * Generate component from use case
   */
  async generateComponent(request: NeuralBuildRequest): Promise<GeneratedComponent> {
    this.logger.info('Generating component from use case', { useCase: request.useCase });

    // Step 1: Use schema mapper to find best matching schema
    const match = await this.schemaMapper.selectComponent(request.useCase, request.context);

    if (!match) {
      throw new Error(`No matching component found for use case: ${request.useCase}`);
    }

    this.logger.info('Found matching schema', {
      schema: match.schema.name,
      score: match.score,
    });

    // Step 2: Generate component code from schema
    const code = await this.buildComponentCode(match.schema, request.context);

    // Step 3: Generate tests if requested
    const tests = request.context?.testingLibrary 
      ? await this.generateTests(match.schema, request.context.testingLibrary)
      : undefined;

    // Step 4: Generate styles
    const styles = await this.generateStyles(match.schema);

    // Step 5: Generate documentation
    const documentation = this.generateDocumentation(match.schema);

    // Step 6: Collect dependencies
    const dependencies = this.collectDependencies(match.schema, request.context);

    // Step 7: Generate linked components if any
    const linkedComponents = await this.generateLinkedComponents(match.schema, request);

    const generatedComponent: GeneratedComponent = {
      schema: match.schema,
      code,
      tests,
      styles,
      documentation,
      dependencies,
      linkedComponents,
    };

    this.emit('componentGenerated', generatedComponent);

    return generatedComponent;
  }

  /**
   * Build component code from schema
   */
  private async buildComponentCode(
    schema: ComponentSchema,
    context?: NeuralBuildRequest['context']
  ): Promise<string> {
    const framework = context?.framework || 'react';
    const style = context?.style || 'functional';
    const typescript = context?.typescript !== false;

    const templateKey = `${framework}-${style}`;
    const template = this.templates.get(templateKey);

    if (!template) {
      throw new Error(`Template not found for ${framework} ${style}`);
    }

    // Build component pieces
    const componentName = schema['lightdom:reactComponent'];
    const className = componentName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1);
    const description = schema.description;

    // Generate props interface
    const propsInterface = this.generatePropsInterface(schema, typescript);

    // Generate prop destructuring
    const propDestructuring = this.generatePropDestructuring(schema);

    // Generate hooks
    const hooks = this.generateHooks(schema);

    // Generate handlers
    const handlers = this.generateHandlers(schema);

    // Generate content
    const content = this.generateContent(schema);

    // Generate imports
    const imports = this.generateImports(schema, framework);

    // Replace template variables
    let code = template.template
      .replace(/{{componentName}}/g, componentName)
      .replace(/{{className}}/g, className)
      .replace(/{{description}}/g, description)
      .replace(/{{interfaces}}/g, propsInterface)
      .replace(/{{propDestructuring}}/g, propDestructuring)
      .replace(/{{hooks}}/g, hooks)
      .replace(/{{handlers}}/g, handlers)
      .replace(/{{content}}/g, content)
      .replace(/{{imports}}/g, imports);

    return code;
  }

  /**
   * Generate props interface
   */
  private generatePropsInterface(schema: ComponentSchema, typescript: boolean): string {
    if (!typescript) return '';

    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'];

    const propLines = props.map(prop => {
      const optional = prop.required ? '' : '?';
      const description = prop.description ? `  /** ${prop.description} */\n` : '';
      return `${description}  ${prop.name}${optional}: ${this.mapTypeToTS(prop.type)};`;
    });

    return `interface ${componentName}Props {
${propLines.join('\n')}
}`;
  }

  /**
   * Map prop type to TypeScript type
   */
  private mapTypeToTS(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      object: 'Record<string, any>',
      array: 'any[]',
      function: '(...args: any[]) => any',
    };

    return typeMap[type] || 'any';
  }

  /**
   * Generate prop destructuring
   */
  private generatePropDestructuring(schema: ComponentSchema): string {
    const props = schema['lightdom:props'];
    const propNames = props.map(prop => {
      if (prop.default !== undefined) {
        return `${prop.name} = ${JSON.stringify(prop.default)}`;
      }
      return prop.name;
    });

    return `const { ${propNames.join(', ')} } = props;`;
  }

  /**
   * Generate hooks
   */
  private generateHooks(schema: ComponentSchema): string {
    const hooks: string[] = [];

    // Add useState hooks based on schema type
    if (schema['@type'] === 'ItemList' || schema['@type'] === 'Table') {
      hooks.push('const [sortedData, setSortedData] = useState(data);');
      hooks.push('const [filterText, setFilterText] = useState(\'\');');
    }

    if (schema['@type'] === 'Chart') {
      hooks.push('const [chartData, setChartData] = useState(data);');
    }

    return hooks.join('\n  ');
  }

  /**
   * Generate event handlers
   */
  private generateHandlers(schema: ComponentSchema): string {
    const handlers: string[] = [];

    // Add handlers based on schema type
    if (schema['@type'] === 'ItemList' || schema['@type'] === 'Table') {
      handlers.push(`const handleSort = (column: string) => {
    const sorted = [...sortedData].sort((a, b) => {
      return a[column] > b[column] ? 1 : -1;
    });
    setSortedData(sorted);
  };`);

      handlers.push(`const handleFilter = (text: string) => {
    setFilterText(text);
    const filtered = data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(text.toLowerCase())
    );
    setSortedData(filtered);
  };`);
    }

    return handlers.join('\n\n  ');
  }

  /**
   * Generate component content
   */
  private generateContent(schema: ComponentSchema): string {
    const componentType = schema['lightdom:componentType'];

    switch (componentType) {
      case 'atom':
        return this.generateAtomContent(schema);
      case 'molecule':
        return this.generateMoleculeContent(schema);
      case 'organism':
        return this.generateOrganismContent(schema);
      case 'template':
        return this.generateTemplateContent(schema);
      case 'page':
        return this.generatePageContent(schema);
      default:
        return '<div>Component content</div>';
    }
  }

  private generateAtomContent(schema: ComponentSchema): string {
    if (schema['@type'] === 'Button') {
      return `<button 
        onClick={onClick}
        disabled={disabled}
        className={\`btn btn-\${variant}\`}
      >
        {label}
      </button>`;
    }
    return '<div>Atom component</div>';
  }

  private generateMoleculeContent(schema: ComponentSchema): string {
    if (schema['@type'] === 'Product') {
      return `<div className="product-card">
        {image && <img src={image} alt={name} />}
        <h3>{name}</h3>
        <p className="price">\${price}</p>
        {description && <p className="description">{description}</p>}
      </div>`;
    }
    return '<div>Molecule component</div>';
  }

  private generateOrganismContent(schema: ComponentSchema): string {
    if (schema['@type'] === 'ItemList' || schema['@type'] === 'Table') {
      return `<div className="data-table">
        {filterable && (
          <input 
            type="text"
            placeholder="Filter..."
            value={filterText}
            onChange={(e) => handleFilter(e.target.value)}
          />
        )}
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => sortable && handleSort(col.key)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>`;
    }
    return '<div>Organism component</div>';
  }

  private generateTemplateContent(schema: ComponentSchema): string {
    return '<div>Template component</div>';
  }

  private generatePageContent(schema: ComponentSchema): string {
    if (schema['@type'] === 'WebPage') {
      return `<div className="page">
        <h1>{title}</h1>
        <div className="widgets">
          {widgets?.map((widget, idx) => (
            <div key={idx} className="widget">
              {widget}
            </div>
          ))}
        </div>
      </div>`;
    }
    return '<div>Page component</div>';
  }

  /**
   * Generate imports
   */
  private generateImports(schema: ComponentSchema, framework: string): string {
    const imports: string[] = [];

    // Add imports for linked schemas
    if (schema['lightdom:linkedSchemas'].length > 0) {
      for (const linkedId of schema['lightdom:linkedSchemas']) {
        const linkedSchema = this.schemaMapper.getComponentById(linkedId);
        if (linkedSchema) {
          imports.push(`import ${linkedSchema['lightdom:reactComponent']} from './${linkedSchema['lightdom:reactComponent']}';`);
        }
      }
    }

    return imports.join('\n');
  }

  /**
   * Generate tests
   */
  private async generateTests(schema: ComponentSchema, library: string): Promise<string> {
    const componentName = schema['lightdom:reactComponent'];

    const testTemplate = `import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} {...defaultProps} />);
    expect(screen.getByRole('${this.getDefaultRole(schema)}')).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = ${this.generateTestProps(schema)};
    render(<${componentName} {...props} />);
    // Add assertions based on props
  });
});

const defaultProps = ${this.generateTestProps(schema)};
`;

    return testTemplate;
  }

  private getDefaultRole(schema: ComponentSchema): string {
    const roleMap: Record<string, string> = {
      Button: 'button',
      Article: 'article',
      ItemList: 'list',
      WebPage: 'main',
    };

    return roleMap[schema['@type']] || 'region';
  }

  private generateTestProps(schema: ComponentSchema): string {
    const props = schema['lightdom:props'];
    const testProps: Record<string, any> = {};

    props.forEach(prop => {
      if (prop.default !== undefined) {
        testProps[prop.name] = prop.default;
      } else {
        testProps[prop.name] = this.getDefaultValueForType(prop.type);
      }
    });

    return JSON.stringify(testProps, null, 2);
  }

  private getDefaultValueForType(type: string): any {
    const defaults: Record<string, any> = {
      string: 'test',
      number: 0,
      boolean: false,
      object: {},
      array: [],
      function: () => {},
    };

    return defaults[type] || null;
  }

  /**
   * Generate styles
   */
  private async generateStyles(schema: ComponentSchema): string {
    const className = schema['lightdom:reactComponent'].toLowerCase().replace(/([A-Z])/g, '-$1').slice(1);

    return `.${className} {
  /* Add your styles here */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
`;
  }

  /**
   * Generate documentation
   */
  private generateDocumentation(schema: ComponentSchema): string {
    const componentName = schema['lightdom:reactComponent'];
    const props = schema['lightdom:props'];

    const propDocs = props.map(prop => {
      return `- **${prop.name}** (${prop.type}${prop.required ? ', required' : ', optional'}): ${prop.description || 'No description'}`;
    }).join('\n');

    return `# ${componentName}

${schema.description}

## Schema Type
${schema['@type']}

## Component Type
${schema['lightdom:componentType']}

## Props

${propDocs}

## Use Cases
${schema['lightdom:useCase'].join(', ')}

## Linked Schemas
${schema['lightdom:linkedSchemas'].length > 0 ? schema['lightdom:linkedSchemas'].join(', ') : 'None'}

## Example Usage

\`\`\`tsx
import ${componentName} from './${componentName}';

function Example() {
  return (
    <${componentName}
      ${props.filter(p => p.required).map(p => `${p.name}={${this.getExampleValue(p)}}`).join('\n      ')}
    />
  );
}
\`\`\`
`;
  }

  private getExampleValue(prop: PropDefinition): string {
    if (prop.default !== undefined) {
      return JSON.stringify(prop.default);
    }

    const examples: Record<string, string> = {
      string: '"example"',
      number: '42',
      boolean: 'true',
      object: '{}',
      array: '[]',
      function: '() => {}',
    };

    return examples[prop.type] || 'null';
  }

  /**
   * Collect dependencies
   */
  private collectDependencies(schema: ComponentSchema, context?: NeuralBuildRequest['context']): string[] {
    const deps = ['react'];

    if (context?.typescript) {
      deps.push('@types/react');
    }

    if (context?.testingLibrary) {
      deps.push('@testing-library/react');
      deps.push(`@testing-library/${context.testingLibrary}`);
    }

    return deps;
  }

  /**
   * Generate linked components
   */
  private async generateLinkedComponents(
    schema: ComponentSchema,
    request: NeuralBuildRequest
  ): Promise<GeneratedComponent[]> {
    const linkedComponents: GeneratedComponent[] = [];

    for (const linkedId of schema['lightdom:linkedSchemas']) {
      const linkedSchema = this.schemaMapper.getComponentById(linkedId);
      
      if (linkedSchema) {
        try {
          const linkedRequest: NeuralBuildRequest = {
            useCase: linkedSchema['lightdom:semanticMeaning'],
            context: request.context,
            constraints: request.constraints,
          };

          const linkedComponent = await this.generateComponent(linkedRequest);
          linkedComponents.push(linkedComponent);
        } catch (error) {
          this.logger.error('Failed to generate linked component', {
            linkedId,
            error,
          });
        }
      }
    }

    return linkedComponents;
  }

  /**
   * Validate generated component
   */
  async validateComponent(component: GeneratedComponent): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for syntax errors (basic check)
    try {
      // This would use a proper parser in production
      if (!component.code.includes('export default')) {
        errors.push('Component must export default');
      }

      if (!component.code.includes('React.FC') && !component.code.includes('Component')) {
        warnings.push('Component might not be a valid React component');
      }
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default NeuralComponentBuilder;
