/**
 * Workflow Schema Definitions
 * 
 * JSON Schema-based workflow template system
 * Enables dynamic workflow creation, validation, and type safety
 */

/**
 * Base Workflow Schema
 * Defines the structure for all workflows
 */
export const WorkflowSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'Workflow Schema',
  description: 'Schema for defining workflow templates',
  required: ['id', 'name', 'type', 'tasks'],
  properties: {
    id: {
      type: 'string',
      description: 'Unique workflow identifier',
      pattern: '^workflow-[a-zA-Z0-9-]+$'
    },
    name: {
      type: 'string',
      description: 'Human-readable workflow name',
      minLength: 3,
      maxLength: 255
    },
    description: {
      type: 'string',
      description: 'Workflow description',
      maxLength: 1000
    },
    type: {
      type: 'string',
      description: 'Workflow type category',
      enum: ['datamining', 'seo', 'component-generation', 'ml-training', 'custom']
    },
    version: {
      type: 'string',
      description: 'Schema version',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      default: '1.0.0'
    },
    tasks: {
      type: 'array',
      description: 'Ordered list of workflow tasks',
      minItems: 1,
      items: {
        $ref: '#/definitions/task'
      }
    },
    attributes: {
      type: 'array',
      description: 'Workflow attributes for enrichment',
      items: {
        $ref: '#/definitions/attribute'
      }
    },
    triggers: {
      type: 'array',
      description: 'Workflow execution triggers',
      items: {
        $ref: '#/definitions/trigger'
      }
    },
    config: {
      type: 'object',
      description: 'Workflow-level configuration',
      properties: {
        parallel: {
          type: 'boolean',
          description: 'Allow parallel task execution',
          default: false
        },
        retryOnFailure: {
          type: 'boolean',
          description: 'Retry failed tasks',
          default: true
        },
        maxRetries: {
          type: 'integer',
          description: 'Maximum retry attempts',
          minimum: 0,
          maximum: 10,
          default: 3
        },
        timeout: {
          type: 'integer',
          description: 'Workflow timeout in seconds',
          minimum: 60,
          maximum: 86400,
          default: 3600
        }
      }
    },
    metadata: {
      type: 'object',
      description: 'Additional metadata',
      properties: {
        author: {
          type: 'string',
          description: 'Workflow author'
        },
        tags: {
          type: 'array',
          description: 'Searchable tags',
          items: {
            type: 'string'
          }
        },
        category: {
          type: 'string',
          description: 'Workflow category'
        }
      }
    }
  },
  definitions: {
    task: {
      type: 'object',
      required: ['id', 'label', 'handler'],
      properties: {
        id: {
          type: 'string',
          description: 'Unique task identifier'
        },
        label: {
          type: 'string',
          description: 'Human-readable task name'
        },
        description: {
          type: 'string',
          description: 'Task description'
        },
        handler: {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              type: 'string',
              description: 'Task handler type',
              enum: [
                'data-source',
                'crawler',
                'schema-linking',
                'component-generation',
                'seo-optimization',
                'ml-training',
                'api-call',
                'custom'
              ]
            },
            config: {
              type: 'object',
              description: 'Handler-specific configuration'
            }
          }
        },
        dependencies: {
          type: 'array',
          description: 'Task dependencies (must complete before this task)',
          items: {
            type: 'string'
          }
        },
        optional: {
          type: 'boolean',
          description: 'Task is optional',
          default: false
        },
        condition: {
          type: 'object',
          description: 'Conditional execution',
          properties: {
            expression: {
              type: 'string',
              description: 'Condition expression'
            },
            variables: {
              type: 'object',
              description: 'Variables for condition evaluation'
            }
          }
        },
        output: {
          type: 'object',
          description: 'Task output mapping',
          properties: {
            variables: {
              type: 'object',
              description: 'Output variable mappings'
            }
          }
        }
      }
    },
    attribute: {
      type: 'object',
      required: ['id', 'label', 'type'],
      properties: {
        id: {
          type: 'string',
          description: 'Unique attribute identifier'
        },
        label: {
          type: 'string',
          description: 'Human-readable attribute name'
        },
        type: {
          type: 'string',
          description: 'Attribute type',
          enum: ['meta', 'content', 'media', 'technical', 'custom']
        },
        enrichmentPrompt: {
          type: 'string',
          description: 'AI enrichment prompt'
        },
        drilldownPrompts: {
          type: 'array',
          description: 'Detailed analysis prompts',
          items: {
            type: 'string'
          }
        },
        validation: {
          type: 'object',
          description: 'Attribute validation rules'
        }
      }
    },
    trigger: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          description: 'Trigger type',
          enum: ['manual', 'schedule', 'webhook', 'event', 'api']
        },
        config: {
          type: 'object',
          description: 'Trigger-specific configuration'
        }
      }
    }
  }
};

/**
 * Predefined Workflow Templates
 */
export const WorkflowTemplates = {
  datamining: {
    id: 'template-datamining',
    name: 'Data Mining Workflow',
    description: 'Automated data mining and SEO optimization',
    type: 'datamining',
    version: '1.0.0',
    tasks: [
      {
        id: 'task-data-source',
        label: 'Initialize Data Sources',
        description: 'Connect to database and identify target tables',
        handler: {
          type: 'data-source',
          config: {
            autoDiscover: true,
            maxTables: 10
          }
        }
      },
      {
        id: 'task-crawler',
        label: 'Mine DOM Data',
        description: 'Extract and analyze DOM structures',
        handler: {
          type: 'crawler',
          config: {
            maxPages: 50,
            extractMetadata: true
          }
        },
        dependencies: ['task-data-source']
      },
      {
        id: 'task-schema-linking',
        label: 'Schema Linking',
        description: 'Link extracted data to schema.org vocabularies',
        handler: {
          type: 'schema-linking',
          config: {
            vocabularies: ['schema.org', 'OpenGraph']
          }
        },
        dependencies: ['task-crawler']
      },
      {
        id: 'task-component-gen',
        label: 'Generate Components',
        description: 'Create reusable components from mined data',
        handler: {
          type: 'component-generation',
          config: {
            maxComponents: 20,
            framework: 'react'
          }
        },
        dependencies: ['task-schema-linking']
      },
      {
        id: 'task-seo',
        label: 'SEO Optimization',
        description: 'Apply SEO best practices',
        handler: {
          type: 'seo-optimization',
          config: {
            scoreThreshold: 70
          }
        },
        dependencies: ['task-component-gen']
      },
      {
        id: 'task-ml',
        label: 'TensorFlow Training',
        description: 'Train ML model on extracted features',
        handler: {
          type: 'ml-training',
          config: {
            epochs: 10,
            batchSize: 32
          }
        },
        dependencies: ['task-seo'],
        optional: true
      }
    ],
    attributes: [
      {
        id: 'attr-title',
        label: 'Page Title',
        type: 'meta',
        enrichmentPrompt: 'Optimize title for search engines',
        drilldownPrompts: ['Keyword density', 'Character length', 'Brand inclusion']
      },
      {
        id: 'attr-description',
        label: 'Meta Description',
        type: 'meta',
        enrichmentPrompt: 'Create compelling meta description',
        drilldownPrompts: ['Call to action', 'Keyword relevance', 'Length optimization']
      },
      {
        id: 'attr-headings',
        label: 'Heading Structure',
        type: 'content',
        enrichmentPrompt: 'Analyze heading hierarchy',
        drilldownPrompts: ['H1 uniqueness', 'H2-H6 structure', 'Keyword distribution']
      },
      {
        id: 'attr-images',
        label: 'Image Optimization',
        type: 'media',
        enrichmentPrompt: 'Optimize images for performance and SEO',
        drilldownPrompts: ['Alt text quality', 'File size', 'Format recommendations']
      }
    ],
    config: {
      parallel: false,
      retryOnFailure: true,
      maxRetries: 3,
      timeout: 3600
    },
    metadata: {
      author: 'LightDom System',
      tags: ['datamining', 'seo', 'automation'],
      category: 'Data Processing'
    }
  },
  
  seoOptimization: {
    id: 'template-seo',
    name: 'SEO Optimization Workflow',
    description: 'Comprehensive SEO analysis and optimization',
    type: 'seo',
    version: '1.0.0',
    tasks: [
      {
        id: 'task-crawl',
        label: 'Crawl Website',
        description: 'Analyze website structure',
        handler: {
          type: 'crawler',
          config: {
            depth: 3,
            followLinks: true
          }
        }
      },
      {
        id: 'task-analyze',
        label: 'SEO Analysis',
        description: 'Analyze SEO factors',
        handler: {
          type: 'seo-optimization',
          config: {
            checkMobile: true,
            checkSpeed: true
          }
        },
        dependencies: ['task-crawl']
      }
    ],
    config: {
      parallel: false,
      timeout: 1800
    }
  },
  
  componentGeneration: {
    id: 'template-components',
    name: 'Component Generation Workflow',
    description: 'Generate React components from database schema',
    type: 'component-generation',
    version: '1.0.0',
    tasks: [
      {
        id: 'task-schema',
        label: 'Analyze Database Schema',
        description: 'Extract database structure',
        handler: {
          type: 'data-source',
          config: {
            includeRelations: true
          }
        }
      },
      {
        id: 'task-generate',
        label: 'Generate Components',
        description: 'Create React components',
        handler: {
          type: 'component-generation',
          config: {
            typescript: true,
            includeTests: true
          }
        },
        dependencies: ['task-schema']
      }
    ],
    config: {
      parallel: false,
      timeout: 1200
    }
  }
};

export default {
  WorkflowSchema,
  WorkflowTemplates
};
