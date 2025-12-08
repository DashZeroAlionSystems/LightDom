/**
 * ComponentGeneratorService
 *
 * Generates React components from atomic schemas
 * Uses AI to create complete, production-ready components
 *
 * @module ComponentGeneratorService
 */

import fs from 'fs/promises';
import path from 'path';
import { OllamaService } from './ai/OllamaService.js';
import { componentLibraryService, ComponentSchema } from './ComponentLibraryService.js';
import { LdSchema } from './ValidationService.js';

export interface ComponentGenerationRequest {
  componentName: string;
  componentType: 'atom' | 'molecule' | 'organism';
  baseComponents: string[]; // Schema IDs of base components
  requirements: {
    functionality: string;
    designSystem?: string;
    accessibility?: boolean;
    responsive?: boolean;
  };
  aiGeneration?: {
    useAI?: boolean;
    model?: string;
    includeTests?: boolean;
    includeStories?: boolean;
  };
  output?: {
    directory?: string;
    typescript?: boolean;
    styling?: 'CSS Modules' | 'Styled Components' | 'Tailwind' | 'Emotion';
  };
}

export interface GeneratedComponent {
  name: string;
  code: string;
  styles?: string;
  tests?: string;
  stories?: string;
  documentation?: string;
  schema: ComponentSchema;
}

export class ComponentGeneratorService {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  /**
   * Generate a component from atomic schemas
   */
  async generateComponent(request: ComponentGenerationRequest): Promise<GeneratedComponent> {
    console.log(`🔨 Generating component: ${request.componentName}`);

    // Load base component schemas
    const baseSchemas = await this.loadBaseSchemas(request.baseComponents);

    // Build component schema
    const componentSchema = await this.buildComponentSchema(
      request.componentName,
      request.componentType,
      baseSchemas,
      request.requirements
    );

    // Generate code using AI
    const code = await this.generateCode(
      request.componentName,
      componentSchema,
      baseSchemas,
      request.requirements,
      request.aiGeneration
    );

    // Generate styles
    const styles = await this.generateStyles(
      request.componentName,
      request.output?.styling || 'CSS Modules'
    );

    // Generate tests if requested
    let tests: string | undefined;
    if (request.aiGeneration?.includeTests) {
      tests = await this.generateTests(request.componentName, code);
    }

    // Generate Storybook stories if requested
    let stories: string | undefined;
    if (request.aiGeneration?.includeStories) {
      stories = await this.generateStories(request.componentName, componentSchema);
    }

    // Save to filesystem if directory specified
    if (request.output?.directory) {
      await this.saveComponent(request.output.directory, request.componentName, {
        code,
        styles,
        tests,
        stories,
      });
    }

    console.log(`✅ Component generated successfully: ${request.componentName}`);

    return {
      name: request.componentName,
      code,
      styles,
      tests,
      stories,
      documentation: stories || '',
      schema: componentSchema,
    };
  }

  /**
   * Load base component schemas
   */
  private async loadBaseSchemas(schemaIds: string[]): Promise<ComponentSchema[]> {
    const schemas: ComponentSchema[] = [];

    for (const schemaId of schemaIds) {
      const schema = await componentLibraryService.getSchema(schemaId);
      if (schema) {
        schemas.push(schema);
      } else {
        console.warn(`⚠️ Schema not found: ${schemaId}`);
      }
    }

    return schemas;
  }

  /**
   * Build component schema from base schemas
   */
  private async buildComponentSchema(
    name: string,
    type: string,
    baseSchemas: ComponentSchema[],
    requirements: ComponentGenerationRequest['requirements']
  ): Promise<ComponentSchema> {
    // Merge properties from base schemas
    const properties: Record<string, any> = {};
    const tags = new Set<string>();

    for (const baseSchema of baseSchemas) {
      if (baseSchema.schema.properties) {
        Object.assign(properties, baseSchema.schema.properties);
      }
      if (baseSchema.tags) {
        baseSchema.tags.forEach(tag => tags.add(tag));
      }
    }

    return {
      schemaId: `ld:${name}`,
      schemaType: 'component',
      version: '1.0.0',
      title: name,
      description: requirements.functionality,
      category: type,
      isAtomic: type === 'atom',
      tags: Array.from(tags),
      schema: {
        $id: `ld:${name}`,
        type: 'object',
        title: `${name} Schema`,
        description: requirements.functionality,
        properties,
      } as LdSchema,
      metadata: {
        baseComponents: baseSchemas.map(s => s.schemaId),
        designSystem: requirements.designSystem,
        accessibility: requirements.accessibility,
        responsive: requirements.responsive,
      },
    };
  }

  /**
   * Generate component code using AI
   */
  private async generateCode(
    componentName: string,
    schema: ComponentSchema,
    baseSchemas: ComponentSchema[],
    requirements: ComponentGenerationRequest['requirements'],
    aiSettings?: ComponentGenerationRequest['aiGeneration']
  ): Promise<string> {
    if (aiSettings?.useAI === false) {
      return this.generateTemplateCode(componentName, schema);
    }

    const prompt = this.buildCodeGenerationPrompt(componentName, schema, baseSchemas, requirements);

    const startTime = Date.now();
    const response = await this.ollamaService.chat(
      prompt,
      'You are an expert React/TypeScript developer. Generate production-ready component code following best practices.'
    );
    const duration = Date.now() - startTime;

    // Log the interaction
    await this.ollamaService.logInteraction(prompt, response, {
      service: 'ComponentGeneratorService',
      metadata: { componentName, baseSchemas: baseSchemas.map(s => s.schemaId) },
      durationMs: duration,
    });

    // Extract code from response
    const codeMatch = response.match(/```(?:typescript|tsx|jsx)?\n([\s\S]+?)\n```/);
    if (codeMatch) {
      return codeMatch[1];
    }

    return response;
  }

  /**
   * Build AI prompt for code generation
   */
  private buildCodeGenerationPrompt(
    componentName: string,
    schema: ComponentSchema,
    baseSchemas: ComponentSchema[],
    requirements: ComponentGenerationRequest['requirements']
  ): string {
    const baseComponentsList = baseSchemas.map(s => `- ${s.title}: ${s.description}`).join('\n');
    const propsSchema = JSON.stringify(schema.schema.properties, null, 2);

    return `Generate a React TypeScript component named "${componentName}".

**Requirements:**
- Functionality: ${requirements.functionality}
- Design System: ${requirements.designSystem || 'Material Design 3'}
- Accessibility: ${requirements.accessibility ? 'WCAG 2.1 AA compliant' : 'Basic accessibility'}
- Responsive: ${requirements.responsive ? 'Yes' : 'No'}

**Base Components:**
${baseComponentsList}

**Component Props Schema:**
${propsSchema}

**Instructions:**
1. Create a functional React component with TypeScript
2. Use the base components listed above where appropriate
3. Follow ${requirements.designSystem || 'Material Design 3'} guidelines
4. Include proper prop types and validation
5. Add accessibility attributes (aria-*, role, etc.)
6. Make it responsive if required
7. Include JSDoc comments
8. Return only the component code in a typescript code block

Generate the complete component code now:`;
  }

  /**
   * Generate template code (fallback when AI is disabled)
   */
  private generateTemplateCode(componentName: string, schema: ComponentSchema): string {
    const props = Object.keys(schema.schema.properties || {}).join(', ');

    return `import React from 'react';

export interface ${componentName}Props {
  ${props}
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="${componentName.toLowerCase()}">
      {/* Component implementation */}
    </div>
  );
};

export default ${componentName};
`;
  }

  /**
   * Generate styles for the component
   */
  private async generateStyles(componentName: string, stylingApproach: string): Promise<string> {
    if (stylingApproach === 'CSS Modules') {
      return `.${componentName.toLowerCase()} {
  /* Component styles */
}
`;
    }

    if (stylingApproach === 'Styled Components') {
      return `import styled from 'styled-components';

export const ${componentName}Container = styled.div\`
  /* Component styles */
\`;
`;
    }

    return ''; // Tailwind or Emotion don't need separate style files
  }

  /**
   * Generate unit tests
   */
  private async generateTests(componentName: string, code: string): Promise<string> {
    const prompt = `Generate unit tests for this React component using React Testing Library and Vitest:

\`\`\`typescript
${code}
\`\`\`

Include tests for:
1. Component renders correctly
2. Props are applied properly
3. Event handlers work
4. Accessibility

Return only the test code in a typescript code block.`;

    const response = await this.ollamaService.chat(
      prompt,
      'You are an expert at writing React component tests using React Testing Library and Vitest.'
    );

    const testMatch = response.match(/```(?:typescript|tsx)?\n([\s\S]+?)\n```/);
    return testMatch ? testMatch[1] : response;
  }

  /**
   * Generate Storybook stories
   */
  private async generateStories(componentName: string, schema: ComponentSchema): Promise<string> {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
`;
  }

  /**
   * Save component files to filesystem
   */
  private async saveComponent(
    directory: string,
    componentName: string,
    files: { code: string; styles?: string; tests?: string; stories?: string }
  ): Promise<void> {
    // Create directory if it doesn't exist
    await fs.mkdir(directory, { recursive: true });

    // Save component file
    await fs.writeFile(path.join(directory, `${componentName}.tsx`), files.code, 'utf-8');

    // Save styles if provided
    if (files.styles) {
      await fs.writeFile(
        path.join(directory, `${componentName}.module.css`),
        files.styles,
        'utf-8'
      );
    }

    // Save tests if provided
    if (files.tests) {
      await fs.writeFile(path.join(directory, `${componentName}.test.tsx`), files.tests, 'utf-8');
    }

    // Save stories if provided
    if (files.stories) {
      await fs.writeFile(
        path.join(directory, `${componentName}.stories.tsx`),
        files.stories,
        'utf-8'
      );
    }

    console.log(`  💾 Saved component files to ${directory}`);
  }
}

// Singleton instance
export const componentGeneratorService = new ComponentGeneratorService();

export default ComponentGeneratorService;
