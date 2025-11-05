/**
 * Task Documentation and Template System
 * 
 * Breaks down long tasks into template parts, documents workflows,
 * and saves reusable templates to database for retrieval and composition
 */

import fs from 'fs/promises';
import path from 'path';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'component' | 'service' | 'api' | 'database' | 'workflow' | 'config';
  parts: TemplatePartDefinition[];
  variables: Record<string, TemplateVariable>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedTime?: string;
  };
}

interface TemplatePartDefinition {
  id: string;
  name: string;
  type: 'code' | 'config' | 'documentation' | 'sql' | 'markdown';
  order: number;
  content: string;
  variables?: string[];
  dependencies?: string[];
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: unknown[];
  };
}

interface ComposedTemplate {
  templateId: string;
  parts: Array<{
    partId: string;
    content: string;
    filepath?: string;
  }>;
  variables: Record<string, unknown>;
  metadata: {
    generatedAt: Date;
    templateName: string;
  };
}

interface TaskDocumentation {
  id: string;
  taskName: string;
  description: string;
  steps: TaskStep[];
  templateIds: string[];
  dependencies: string[];
  estimatedDuration: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  createdAt: Date;
}

interface TaskStep {
  order: number;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'verification';
  templatePartId?: string;
  commands?: string[];
  verificationCriteria?: string[];
}

export class TaskTemplateDocumentationSystem {
  private templates: Map<string, TaskTemplate>;
  private documentation: Map<string, TaskDocumentation>;
  private db: unknown;
  private templatesDir: string;

  constructor(database?: unknown, templatesDir = './templates') {
    this.templates = new Map();
    this.documentation = new Map();
    this.db = database;
    this.templatesDir = templatesDir;
  }

  /**
   * Initialize system and load templates
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.templatesDir, { recursive: true });
    await fs.mkdir(path.join(this.templatesDir, 'parts'), { recursive: true });
    await fs.mkdir(path.join(this.templatesDir, 'docs'), { recursive: true });
    console.log('✅ Task Template Documentation System initialized');
  }

  /**
   * Create a new task template
   */
  async createTemplate(template: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> {
    const fullTemplate: TaskTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.templates.set(fullTemplate.id, fullTemplate);

    // Save to database
    await this.saveTemplateToDatabase(fullTemplate);

    // Save template file
    await this.saveTemplateToFile(fullTemplate);

    return fullTemplate;
  }

  /**
   * Add a template part to an existing template
   */
  async addTemplatePart(
    templateId: string,
    part: Omit<TemplatePartDefinition, 'id'>
  ): Promise<TemplatePartDefinition> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const fullPart: TemplatePartDefinition = {
      ...part,
      id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    template.parts.push(fullPart);
    template.metadata.updatedAt = new Date();

    // Save part to file
    await this.savePartToFile(templateId, fullPart);

    // Update template
    await this.saveTemplateToDatabase(template);

    return fullPart;
  }

  /**
   * Compose template with variables
   */
  async composeTemplate(
    templateId: string,
    variables: Record<string, unknown>
  ): Promise<ComposedTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Validate variables
    this.validateVariables(template, variables);

    // Compose parts with variables
    const composedParts = template.parts
      .sort((a, b) => a.order - b.order)
      .map((part) => ({
        partId: part.id,
        content: this.interpolateVariables(part.content, variables),
      }));

    return {
      templateId,
      parts: composedParts,
      variables,
      metadata: {
        generatedAt: new Date(),
        templateName: template.name,
      },
    };
  }

  /**
   * Generate files from composed template
   */
  async generateFilesFromTemplate(
    composition: ComposedTemplate,
    outputDir: string
  ): Promise<string[]> {
    const template = this.templates.get(composition.templateId);
    if (!template) {
      throw new Error(`Template ${composition.templateId} not found`);
    }

    const generatedFiles: string[] = [];

    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < composition.parts.length; i++) {
      const part = composition.parts[i];
      const partDef = template.parts.find((p) => p.id === part.partId);

      if (partDef) {
        const filename = this.generateFilename(partDef, composition.variables);
        const filepath = path.join(outputDir, filename);

        await fs.writeFile(filepath, part.content, 'utf-8');
        generatedFiles.push(filepath);
      }
    }

    return generatedFiles;
  }

  /**
   * Document a long-running task
   */
  async documentTask(
    task: Omit<TaskDocumentation, 'id' | 'createdAt'>
  ): Promise<TaskDocumentation> {
    const fullTask: TaskDocumentation = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.documentation.set(fullTask.id, fullTask);

    // Save documentation
    await this.saveTaskDocumentation(fullTask);

    return fullTask;
  }

  /**
   * Get task documentation with step-by-step guide
   */
  getTaskGuide(taskId: string): TaskDocumentation | undefined {
    return this.documentation.get(taskId);
  }

  /**
   * Search templates by category or tags
   */
  searchTemplates(query: {
    category?: TaskTemplate['category'];
    tags?: string[];
    complexity?: TaskTemplate['metadata']['complexity'];
  }): TaskTemplate[] {
    const results: TaskTemplate[] = [];

    this.templates.forEach((template) => {
      let matches = true;

      if (query.category && template.category !== query.category) {
        matches = false;
      }

      if (query.complexity && template.metadata.complexity !== query.complexity) {
        matches = false;
      }

      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every((tag) =>
          template.metadata.tags.includes(tag)
        );
        if (!hasAllTags) {
          matches = false;
        }
      }

      if (matches) {
        results.push(template);
      }
    });

    return results;
  }

  /**
   * Export template as markdown documentation
   */
  async exportTemplateAsMarkdown(templateId: string): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let markdown = `# ${template.name}\n\n`;
    markdown += `${template.description}\n\n`;
    markdown += `**Category:** ${template.category}\n`;
    markdown += `**Complexity:** ${template.metadata.complexity}\n`;
    markdown += `**Tags:** ${template.metadata.tags.join(', ')}\n\n`;

    if (template.metadata.estimatedTime) {
      markdown += `**Estimated Time:** ${template.metadata.estimatedTime}\n\n`;
    }

    markdown += `## Variables\n\n`;
    Object.entries(template.variables).forEach(([name, variable]) => {
      markdown += `- **${name}** (${variable.type})`;
      markdown += variable.required ? ' *required*' : ' *optional*';
      markdown += `\n  ${variable.description}\n`;
    });

    markdown += `\n## Template Parts\n\n`;
    template.parts
      .sort((a, b) => a.order - b.order)
      .forEach((part, index) => {
        markdown += `### ${index + 1}. ${part.name}\n\n`;
        markdown += `**Type:** ${part.type}\n\n`;
        markdown += '```' + this.getLanguageForType(part.type) + '\n';
        markdown += part.content + '\n';
        markdown += '```\n\n';
      });

    const filepath = path.join(
      this.templatesDir,
      'docs',
      `${template.id}.md`
    );
    await fs.writeFile(filepath, markdown, 'utf-8');

    return filepath;
  }

  // Private helper methods

  private validateVariables(
    template: TaskTemplate,
    variables: Record<string, unknown>
  ): void {
    Object.entries(template.variables).forEach(([name, varDef]) => {
      if (varDef.required && !(name in variables)) {
        throw new Error(`Required variable ${name} is missing`);
      }

      const value = variables[name];
      if (value !== undefined) {
        // Type validation
        if (typeof value !== varDef.type && varDef.type !== 'object' && varDef.type !== 'array') {
          throw new Error(
            `Variable ${name} should be of type ${varDef.type}, got ${typeof value}`
          );
        }

        // Additional validation
        if (varDef.validation) {
          if (varDef.validation.pattern && typeof value === 'string') {
            const regex = new RegExp(varDef.validation.pattern);
            if (!regex.test(value)) {
              throw new Error(`Variable ${name} does not match pattern ${varDef.validation.pattern}`);
            }
          }
        }
      }
    });
  }

  private interpolateVariables(
    content: string,
    variables: Record<string, unknown>
  ): string {
    let result = content;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
  }

  private generateFilename(
    part: TemplatePartDefinition,
    variables: Record<string, unknown>
  ): string {
    const extension = this.getExtensionForType(part.type);
    const baseName = this.interpolateVariables(part.name, variables)
      .toLowerCase()
      .replace(/\s+/g, '-');
    return `${baseName}.${extension}`;
  }

  private getExtensionForType(type: string): string {
    const extensions: Record<string, string> = {
      code: 'ts',
      config: 'json',
      documentation: 'md',
      sql: 'sql',
      markdown: 'md',
    };
    return extensions[type] || 'txt';
  }

  private getLanguageForType(type: string): string {
    const languages: Record<string, string> = {
      code: 'typescript',
      config: 'json',
      documentation: 'markdown',
      sql: 'sql',
      markdown: 'markdown',
    };
    return languages[type] || '';
  }

  private async saveTemplateToFile(template: TaskTemplate): Promise<void> {
    const filepath = path.join(this.templatesDir, `${template.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(template, null, 2), 'utf-8');
  }

  private async savePartToFile(
    templateId: string,
    part: TemplatePartDefinition
  ): Promise<void> {
    const filepath = path.join(
      this.templatesDir,
      'parts',
      `${templateId}_${part.id}.${this.getExtensionForType(part.type)}`
    );
    await fs.writeFile(filepath, part.content, 'utf-8');
  }

  private async saveTaskDocumentation(task: TaskDocumentation): Promise<void> {
    const filepath = path.join(this.templatesDir, 'docs', `${task.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(task, null, 2), 'utf-8');
  }

  private async saveTemplateToDatabase(template: TaskTemplate): Promise<void> {
    if (!this.db) {
      return;
    }
    // TODO: Implement database save
    console.log(`Saving template ${template.id} to database`);
  }
}
