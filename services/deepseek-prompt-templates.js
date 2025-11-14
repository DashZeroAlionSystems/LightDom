/**
 * DeepSeek Prompt Template System
 * 
 * Provides structured prompt templates for DeepSeek AI integration
 * Supports workflow generation, data structuring, and automation tasks
 * 
 * Features:
 * - Template library for different workflow types
 * - Variable interpolation
 * - Context-aware prompt generation
 * - Response structuring
 * - Automated workflow triggering
 */

export const deepseekPromptTemplates = {
  /**
   * Workflow Generation Templates
   */
  workflowGeneration: {
    basic: {
      name: 'Basic Workflow Generation',
      template: `You are an expert n8n workflow automation engineer. Create a workflow that {task_description}.

Requirements:
- Use n8n node types and structure
- Include proper error handling
- Add descriptive names for all nodes
- Connect nodes logically
- Follow n8n best practices

Input Parameters: {input_parameters}
Expected Output: {expected_output}

Generate a complete n8n workflow in JSON format with the following structure:
{
  "nodes": [...],
  "connections": {...},
  "name": "workflow_name",
  "description": "workflow_description"
}`,
      variables: ['task_description', 'input_parameters', 'expected_output']
    },

    seoDataMining: {
      name: 'SEO Data Mining Workflow',
      template: `Create a comprehensive n8n workflow for SEO data mining that extracts {attributes_list} from {target_urls}.

The workflow should:
1. Fetch the target URL content
2. Extract all specified SEO attributes
3. Store results in PostgreSQL database
4. Send notification on completion

Include nodes for:
- HTTP Request (page fetching)
- Function nodes (data extraction)
- PostgreSQL (data storage)
- Email/Slack notification

Structure the output as n8n-compatible JSON workflow.`,
      variables: ['attributes_list', 'target_urls']
    },

    apiIntegration: {
      name: 'API Integration Workflow',
      template: `Design an n8n workflow that integrates with {api_name} API to {integration_goal}.

API Details:
- Endpoint: {api_endpoint}
- Authentication: {auth_type}
- Method: {http_method}
- Parameters: {api_parameters}

Workflow Steps:
1. Receive trigger event
2. Call {api_name} API
3. Transform response data
4. Execute action: {action_description}
5. Handle errors and retries

Generate complete n8n workflow JSON with proper error handling and data transformation.`,
      variables: ['api_name', 'integration_goal', 'api_endpoint', 'auth_type', 'http_method', 'api_parameters', 'action_description']
    },

    dataProcessing: {
      name: 'Data Processing Pipeline',
      template: `Create an n8n data processing workflow that:
1. Receives data from {data_source}
2. Processes it using {processing_steps}
3. Outputs to {output_destination}

Data Schema: {data_schema}
Processing Logic: {processing_logic}
Validation Rules: {validation_rules}

Include proper data validation, transformation, and error handling nodes. Generate n8n workflow JSON.`,
      variables: ['data_source', 'processing_steps', 'output_destination', 'data_schema', 'processing_logic', 'validation_rules']
    }
  },

  /**
   * Data Structuring Templates
   */
  dataStructuring: {
    schemaGeneration: {
      name: 'Schema Generation from Response',
      template: `Analyze the following data structure and generate a JSON Schema:

Data: {input_data}

Generate a complete JSON Schema with:
- Type definitions
- Property descriptions
- Required fields
- Validation rules
- Example values

Format as standard JSON Schema (draft-07 or later).`,
      variables: ['input_data']
    },

    dataTransformation: {
      name: 'Data Transformation Rules',
      template: `Create data transformation rules to convert from {source_format} to {target_format}.

Source Data Structure: {source_schema}
Target Data Structure: {target_schema}

Generate transformation rules that:
1. Map source fields to target fields
2. Apply necessary data type conversions
3. Handle missing or null values
4. Validate transformed data

Output as JSON transformation configuration compatible with n8n Function nodes.`,
      variables: ['source_format', 'target_format', 'source_schema', 'target_schema']
    },

    responseStructuring: {
      name: 'API Response Structuring',
      template: `Structure the following API response data for {use_case}:

Raw Response: {raw_response}

Requirements:
- Extract relevant fields: {relevant_fields}
- Apply filters: {filters}
- Format for {output_format}
- Add metadata: {metadata_fields}

Return structured data object ready for storage or further processing.`,
      variables: ['use_case', 'raw_response', 'relevant_fields', 'filters', 'output_format', 'metadata_fields']
    }
  },

  /**
   * Automation and Orchestration Templates
   */
  automation: {
    processAutomation: {
      name: 'Process Automation',
      template: `Automate the following process using n8n:

Process Name: {process_name}
Steps: {process_steps}
Triggers: {trigger_conditions}
Actions: {automated_actions}
Success Criteria: {success_criteria}

Create an n8n workflow that:
1. Monitors for {trigger_conditions}
2. Executes {process_steps} sequentially
3. Performs {automated_actions}
4. Validates against {success_criteria}
5. Reports results

Include error recovery and logging. Generate workflow JSON.`,
      variables: ['process_name', 'process_steps', 'trigger_conditions', 'automated_actions', 'success_criteria']
    },

    sequentialWorkflow: {
      name: 'Sequential Task Execution',
      template: `Create a sequential workflow that executes these tasks in order:

Tasks: {task_list}
Dependencies: {task_dependencies}
Data Flow: {data_flow}

For each task:
- Define inputs from previous task
- Specify processing logic
- Handle errors gracefully
- Pass outputs to next task

Generate n8n workflow with proper task sequencing and data passing.`,
      variables: ['task_list', 'task_dependencies', 'data_flow']
    },

    conditionalWorkflow: {
      name: 'Conditional Workflow Logic',
      template: `Design a workflow with conditional branching:

Conditions: {conditions}
Branch Actions: {branch_actions}
Merge Point: {merge_logic}

Workflow Logic:
- Evaluate conditions: {conditions}
- Branch to appropriate action based on result
- Execute branch-specific tasks
- Merge results at {merge_logic}

Generate n8n workflow JSON with IF/Switch nodes for conditional logic.`,
      variables: ['conditions', 'branch_actions', 'merge_logic']
    }
  },

  /**
   * Component and UI Templates
   */
  componentGeneration: {
    visualEditor: {
      name: 'Visual Workflow Editor Component',
      template: `Generate a React component for visualizing and editing n8n workflows.

Requirements:
- Display workflow nodes as visual cards
- Show connections between nodes
- Allow drag-and-drop node placement
- Support node configuration modal
- Real-time validation
- Export to n8n JSON format

Component should use:
- React with hooks
- Ant Design for UI elements
- React Flow for node graph visualization
- Design system: {design_system}

Generate complete TypeScript React component code.`,
      variables: ['design_system']
    },

    workflowBuilder: {
      name: 'Workflow Builder Interface',
      template: `Create a workflow builder UI component with:

Features:
- Node palette with {node_types}
- Canvas for workflow design
- Property panel for node configuration
- Connection drawing
- Validation feedback
- Save/Load functionality

Design Style: {design_style}
Component Library: {component_library}

Generate React/TypeScript component with full functionality.`,
      variables: ['node_types', 'design_style', 'component_library']
    }
  },

  /**
   * Code Generation Templates
   */
  codeGeneration: {
    functionNode: {
      name: 'N8N Function Node Code',
      template: `Generate JavaScript code for an n8n Function node that {function_description}.

Input Data: {input_schema}
Expected Output: {output_schema}
Processing Logic: {logic_description}

The function should:
- Access input via items[0].json
- Process data according to {logic_description}
- Return array with processed items
- Handle errors gracefully
- Add logging for debugging

Generate complete function code ready for n8n Function node.`,
      variables: ['function_description', 'input_schema', 'output_schema', 'logic_description']
    },

    customNode: {
      name: 'Custom N8N Node',
      template: `Create a custom n8n node for {node_purpose}.

Node Specifications:
- Name: {node_name}
- Description: {node_description}
- Properties: {node_properties}
- Operations: {operations}

Generate complete node implementation including:
- Node TypeScript class
- Node description JSON
- Parameter definitions
- Execute method implementation

Follow n8n custom node development standards.`,
      variables: ['node_purpose', 'node_name', 'node_description', 'node_properties', 'operations']
    }
  }
};

/**
 * Prompt Template Engine
 */
export class DeepSeekPromptEngine {
  constructor() {
    this.templates = deepseekPromptTemplates;
  }

  /**
   * Render a template with variables
   */
  render(category, templateName, variables = {}) {
    const template = this.templates[category]?.[templateName];
    
    if (!template) {
      throw new Error(`Template not found: ${category}.${templateName}`);
    }

    let rendered = template.template;

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });

    // Check for missing variables
    const missingVars = rendered.match(/{([^}]+)}/g);
    if (missingVars) {
      console.warn('Missing template variables:', missingVars);
    }

    return rendered;
  }

  /**
   * Get template by path
   */
  getTemplate(category, templateName) {
    return this.templates[category]?.[templateName];
  }

  /**
   * List all templates
   */
  listTemplates() {
    const templates = [];
    
    Object.entries(this.templates).forEach(([category, categoryTemplates]) => {
      Object.entries(categoryTemplates).forEach(([name, template]) => {
        templates.push({
          category,
          name,
          displayName: template.name,
          variables: template.variables
        });
      });
    });

    return templates;
  }

  /**
   * Create a prompt for workflow generation
   */
  createWorkflowPrompt(type, parameters) {
    return this.render('workflowGeneration', type, parameters);
  }

  /**
   * Create a prompt for data structuring
   */
  createDataStructuringPrompt(type, parameters) {
    return this.render('dataStructuring', type, parameters);
  }

  /**
   * Create a prompt for automation
   */
  createAutomationPrompt(type, parameters) {
    return this.render('automation', type, parameters);
  }

  /**
   * Create a prompt for component generation
   */
  createComponentPrompt(type, parameters) {
    return this.render('componentGeneration', type, parameters);
  }

  /**
   * Create a prompt for code generation
   */
  createCodePrompt(type, parameters) {
    return this.render('codeGeneration', type, parameters);
  }

  /**
   * Generate structured response format
   */
  generateResponseStructure(responseType) {
    const structures = {
      workflow: {
        type: 'object',
        properties: {
          nodes: { type: 'array', description: 'Workflow nodes' },
          connections: { type: 'object', description: 'Node connections' },
          name: { type: 'string', description: 'Workflow name' },
          description: { type: 'string', description: 'Workflow description' }
        },
        required: ['nodes', 'connections', 'name']
      },
      schema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          properties: { type: 'object' },
          required: { type: 'array' }
        },
        required: ['type', 'properties']
      },
      component: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Component source code' },
          imports: { type: 'array', description: 'Required imports' },
          props: { type: 'object', description: 'Component props definition' }
        },
        required: ['code']
      }
    };

    return structures[responseType] || {};
  }
}

// Export singleton instance
export const promptEngine = new DeepSeekPromptEngine();

export default DeepSeekPromptEngine;
