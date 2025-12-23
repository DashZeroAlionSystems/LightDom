/**
 * Schema-Based Prompt Workflow Templates
 * 
 * Provides structured workflow templates for common tasks using DeepSeek
 * Templates follow JSON Schema specifications for validation
 */

/**
 * Workflow template categories
 */
export const WorkflowCategories = {
  CODE_REVIEW: 'code-review',
  OPTIMIZATION: 'optimization',
  SEO_ANALYSIS: 'seo-analysis',
  DATA_EXTRACTION: 'data-extraction',
  COMPONENT_GENERATION: 'component-generation',
  DOCUMENTATION: 'documentation',
  TESTING: 'testing'
};

/**
 * Common task workflow templates
 */
export const SchemaBasedWorkflowTemplates = {
  /**
   * Code Review Workflow Template
   */
  codeReview: {
    id: 'workflow-prompt-code-review',
    name: 'Code Review Workflow',
    description: 'Comprehensive code review with security and best practices analysis',
    category: WorkflowCategories.CODE_REVIEW,
    template: `You are an expert code reviewer for the LightDom platform.

TASK: Review the following code and provide comprehensive feedback.

CODE TO REVIEW:
\`\`\`{{language}}
{{code}}
\`\`\`

REVIEW CRITERIA:
{{criteria}}

REASONING PROCESS:
Step 1: Analyze code structure and patterns
Step 2: Check for security vulnerabilities
Step 3: Evaluate performance implications
Step 4: Assess code readability and maintainability
Step 5: Verify best practices compliance

OUTPUT FORMAT:
Return your review as JSON matching this structure:
{
  "overallScore": <number 1-10>,
  "summary": "<brief summary>",
  "issues": [
    {
      "severity": "<critical|major|minor|suggestion>",
      "type": "<security|performance|style|logic|accessibility>",
      "line": <line number or null>,
      "description": "<issue description>",
      "suggestion": "<how to fix>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`,
    variables: [
      { name: 'language', type: 'string', required: true, description: 'Programming language' },
      { name: 'code', type: 'string', required: true, description: 'Code to review' },
      { name: 'criteria', type: 'string', required: false, default: 'general best practices' }
    ],
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'summary', 'issues'],
      properties: {
        overallScore: { type: 'number', minimum: 1, maximum: 10 },
        summary: { type: 'string' },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: { type: 'string', enum: ['critical', 'major', 'minor', 'suggestion'] },
              type: { type: 'string' },
              line: { type: ['integer', 'null'] },
              description: { type: 'string' },
              suggestion: { type: 'string' }
            }
          }
        },
        strengths: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    },
    metadata: {
      temperature: 0.3,
      maxTokens: 2000,
      modelRecommendation: 'deepseek-chat'
    }
  },

  /**
   * SEO Analysis Workflow Template
   */
  seoAnalysis: {
    id: 'workflow-prompt-seo-analysis',
    name: 'SEO Analysis Workflow',
    description: 'Comprehensive SEO analysis for web pages',
    category: WorkflowCategories.SEO_ANALYSIS,
    template: `You are an SEO expert specializing in technical SEO and content optimization.

TASK: Analyze the following page data for SEO improvements.

PAGE DATA:
{{pageData}}

TARGET KEYWORDS:
{{keywords}}

ANALYSIS REQUIREMENTS:
1. Technical SEO factors (meta tags, structure, schema markup)
2. Content optimization opportunities
3. Page speed implications
4. Mobile-friendliness assessment
5. Internal linking recommendations

REASONING PROCESS:
Step 1: Evaluate current SEO state
Step 2: Identify critical issues
Step 3: Analyze content relevance to keywords
Step 4: Assess technical implementation
Step 5: Generate prioritized recommendations

OUTPUT FORMAT:
{
  "seoScore": <number 0-100>,
  "technicalIssues": [
    {
      "issue": "<description>",
      "impact": "<high|medium|low>",
      "fix": "<solution>"
    }
  ],
  "contentOptimizations": [
    {
      "element": "<title|description|heading|content>",
      "current": "<current value>",
      "suggested": "<suggested value>",
      "reason": "<why this change>"
    }
  ],
  "schemaRecommendations": [
    {
      "schemaType": "<schema.org type>",
      "purpose": "<why to add>",
      "priority": "<high|medium|low>"
    }
  ],
  "prioritizedActions": [
    {
      "priority": <number 1-10>,
      "action": "<action description>",
      "expectedImpact": "<impact description>"
    }
  ]
}`,
    variables: [
      { name: 'pageData', type: 'object', required: true, description: 'Page HTML and metadata' },
      { name: 'keywords', type: 'array', required: false, default: [] }
    ],
    outputSchema: {
      type: 'object',
      required: ['seoScore', 'technicalIssues', 'prioritizedActions'],
      properties: {
        seoScore: { type: 'number', minimum: 0, maximum: 100 },
        technicalIssues: { type: 'array' },
        contentOptimizations: { type: 'array' },
        schemaRecommendations: { type: 'array' },
        prioritizedActions: { type: 'array' }
      }
    },
    metadata: {
      temperature: 0.4,
      maxTokens: 2500,
      modelRecommendation: 'deepseek-chat'
    }
  },

  /**
   * Data Extraction Workflow Template
   */
  dataExtraction: {
    id: 'workflow-prompt-data-extraction',
    name: 'Data Extraction Workflow',
    description: 'Extract structured data from unstructured sources',
    category: WorkflowCategories.DATA_EXTRACTION,
    template: `You are a data extraction specialist.

TASK: Extract structured data from the following source.

SOURCE DATA:
{{sourceData}}

EXTRACTION SCHEMA:
{{schema}}

EXTRACTION RULES:
{{rules}}

REASONING PROCESS:
Step 1: Parse and understand the source structure
Step 2: Identify relevant data points
Step 3: Map data to schema fields
Step 4: Validate extracted data
Step 5: Handle missing or ambiguous values

OUTPUT FORMAT:
{
  "success": <boolean>,
  "extractedData": {
    // Data matching the provided schema
  },
  "confidence": <number 0-1>,
  "warnings": ["<warning messages>"],
  "unmappedFields": ["<fields that couldn't be extracted>"]
}`,
    variables: [
      { name: 'sourceData', type: 'string', required: true, description: 'Raw data to extract from' },
      { name: 'schema', type: 'object', required: true, description: 'Target data schema' },
      { name: 'rules', type: 'string', required: false, default: 'Extract all matching fields' }
    ],
    outputSchema: {
      type: 'object',
      required: ['success', 'extractedData', 'confidence'],
      properties: {
        success: { type: 'boolean' },
        extractedData: { type: 'object' },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        warnings: { type: 'array', items: { type: 'string' } },
        unmappedFields: { type: 'array', items: { type: 'string' } }
      }
    },
    metadata: {
      temperature: 0.2,
      maxTokens: 2000,
      modelRecommendation: 'deepseek-chat'
    }
  },

  /**
   * Component Generation Workflow Template
   */
  componentGeneration: {
    id: 'workflow-prompt-component-generation',
    name: 'React Component Generation Workflow',
    description: 'Generate React components from specifications',
    category: WorkflowCategories.COMPONENT_GENERATION,
    template: `You are a React component expert for the LightDom platform.

TASK: Generate a React component based on the following specification.

COMPONENT SPECIFICATION:
Name: {{componentName}}
Description: {{description}}
Props: {{props}}
Design System: Ant Design + Tailwind CSS

REQUIREMENTS:
1. TypeScript with proper type definitions
2. Functional component with React hooks
3. Follow design system conventions
4. Include accessibility features
5. Add JSDoc documentation

REASONING PROCESS:
Step 1: Analyze component requirements
Step 2: Design component structure
Step 3: Define props interface
Step 4: Implement component logic
Step 5: Add styling and accessibility

OUTPUT FORMAT:
{
  "componentName": "<ComponentName>",
  "code": "<full TypeScript code>",
  "propsInterface": "<TypeScript interface definition>",
  "imports": ["<required imports>"],
  "usage": "<example usage code>",
  "storybook": "<Storybook story code>"
}`,
    variables: [
      { name: 'componentName', type: 'string', required: true },
      { name: 'description', type: 'string', required: true },
      { name: 'props', type: 'object', required: false, default: {} }
    ],
    outputSchema: {
      type: 'object',
      required: ['componentName', 'code', 'propsInterface'],
      properties: {
        componentName: { type: 'string' },
        code: { type: 'string' },
        propsInterface: { type: 'string' },
        imports: { type: 'array', items: { type: 'string' } },
        usage: { type: 'string' },
        storybook: { type: 'string' }
      }
    },
    metadata: {
      temperature: 0.4,
      maxTokens: 3000,
      modelRecommendation: 'deepseek-chat'
    }
  },

  /**
   * Test Generation Workflow Template
   */
  testGeneration: {
    id: 'workflow-prompt-test-generation',
    name: 'Test Suite Generation Workflow',
    description: 'Generate comprehensive test suites for code',
    category: WorkflowCategories.TESTING,
    template: `You are a testing expert specializing in JavaScript/TypeScript testing.

TASK: Generate a comprehensive test suite for the following code.

CODE TO TEST:
\`\`\`{{language}}
{{code}}
\`\`\`

TESTING FRAMEWORK: {{testFramework}}

TEST REQUIREMENTS:
{{requirements}}

REASONING PROCESS:
Step 1: Identify testable functions/components
Step 2: Determine test cases for each
Step 3: Identify edge cases
Step 4: Plan mock requirements
Step 5: Structure test suite

OUTPUT FORMAT:
{
  "testFile": "<complete test file code>",
  "testCases": [
    {
      "name": "<test name>",
      "type": "<unit|integration|e2e>",
      "description": "<what it tests>",
      "assertions": <number of assertions>
    }
  ],
  "mocks": ["<required mocks>"],
  "coverage": {
    "functions": ["<tested functions>"],
    "branches": ["<covered branches>"],
    "edgeCases": ["<edge cases tested>"]
  }
}`,
    variables: [
      { name: 'language', type: 'string', required: true },
      { name: 'code', type: 'string', required: true },
      { name: 'testFramework', type: 'string', required: false, default: 'vitest' },
      { name: 'requirements', type: 'string', required: false, default: 'comprehensive coverage' }
    ],
    outputSchema: {
      type: 'object',
      required: ['testFile', 'testCases'],
      properties: {
        testFile: { type: 'string' },
        testCases: { type: 'array' },
        mocks: { type: 'array', items: { type: 'string' } },
        coverage: { type: 'object' }
      }
    },
    metadata: {
      temperature: 0.3,
      maxTokens: 3000,
      modelRecommendation: 'deepseek-chat'
    }
  },

  /**
   * Optimization Workflow Template
   */
  performanceOptimization: {
    id: 'workflow-prompt-optimization',
    name: 'Performance Optimization Workflow',
    description: 'Analyze and optimize code/configuration for performance',
    category: WorkflowCategories.OPTIMIZATION,
    template: `You are a performance optimization expert.

TASK: Analyze and optimize the following for performance.

CODE/CONFIGURATION:
{{content}}

CONTEXT:
{{context}}

CURRENT METRICS (if available):
{{metrics}}

OPTIMIZATION GOALS:
{{goals}}

REASONING PROCESS:
Step 1: Profile current performance characteristics
Step 2: Identify bottlenecks and inefficiencies
Step 3: Evaluate optimization strategies
Step 4: Prioritize by impact and effort
Step 5: Generate optimized solution

OUTPUT FORMAT:
{
  "currentState": {
    "issues": ["<identified issues>"],
    "complexityScore": <number 1-10>,
    "estimatedLatency": "<estimated latency>"
  },
  "optimizations": [
    {
      "type": "<caching|algorithm|bundling|lazy-loading|other>",
      "description": "<what to optimize>",
      "expectedImprovement": "<percentage or description>",
      "effort": "<low|medium|high>",
      "priority": <number 1-10>
    }
  ],
  "optimizedCode": "<optimized version if applicable>",
  "recommendations": ["<additional recommendations>"]
}`,
    variables: [
      { name: 'content', type: 'string', required: true },
      { name: 'context', type: 'string', required: false, default: 'web application' },
      { name: 'metrics', type: 'object', required: false, default: {} },
      { name: 'goals', type: 'string', required: false, default: 'general performance improvement' }
    ],
    outputSchema: {
      type: 'object',
      required: ['currentState', 'optimizations'],
      properties: {
        currentState: { type: 'object' },
        optimizations: { type: 'array' },
        optimizedCode: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    },
    metadata: {
      temperature: 0.4,
      maxTokens: 2500,
      modelRecommendation: 'deepseek-chat'
    }
  }
};

/**
 * Template Registry for managing workflow templates
 */
export class WorkflowTemplateRegistry {
  constructor() {
    this.templates = new Map(
      Object.entries(SchemaBasedWorkflowTemplates).map(([key, template]) => [template.id, template])
    );
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Register a custom template
   */
  registerTemplate(template) {
    if (!template.id || !template.name || !template.template) {
      throw new Error('Template must have id, name, and template properties');
    }
    this.templates.set(template.id, template);
  }

  /**
   * List template IDs
   */
  listTemplateIds() {
    return Array.from(this.templates.keys());
  }
}

export default SchemaBasedWorkflowTemplates;
