# DeepSeek Response Patterns and Capabilities

This document describes DeepSeek's response patterns, capabilities, and best practices for structured prompt workflows in the LightDom platform.

## Table of Contents

1. [Response Formats](#response-formats)
2. [Structured Output Capabilities](#structured-output-capabilities)
3. [Response Patterns](#response-patterns)
4. [Chain-of-Thought Reasoning](#chain-of-thought-reasoning)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Best Practices](#best-practices)

## Response Formats

DeepSeek supports multiple response formats for different use cases:

### JSON Responses

For structured data, use the `response_format` parameter:

```javascript
const response = await client.post('/chat/completions', {
  model: 'deepseek-chat',
  messages: [...],
  response_format: { type: 'json_object' }
});
```

**Supported JSON Schema Features:**
- Type definitions: `string`, `number`, `boolean`, `object`, `array`
- Required fields specification
- Nested object structures
- Array item schemas

### Text Responses

For natural language output:

```javascript
const response = await client.post('/chat/completions', {
  model: 'deepseek-chat',
  messages: [...],
  // No response_format specified - returns plain text
});
```

### Streaming Responses

For real-time output:

```javascript
const response = await client.post('/chat/completions', {
  model: 'deepseek-chat',
  messages: [...],
  stream: true
});
```

## Structured Output Capabilities

### Schema Conformance

DeepSeek can generate responses that conform to specific JSON schemas:

```javascript
// Example: Workflow generation with schema conformance
const systemPrompt = `Generate a workflow configuration that matches this schema:
{
  "type": "object",
  "required": ["id", "name", "tasks"],
  "properties": {
    "id": { "type": "string", "pattern": "^workflow-[a-z0-9-]+$" },
    "name": { "type": "string", "maxLength": 100 },
    "tasks": { "type": "array", "items": { "$ref": "#/definitions/task" } }
  }
}`;
```

### Supported Schema Patterns

1. **Workflow Schemas**: Complete n8n-compatible workflow definitions
2. **Component Schemas**: React component configurations
3. **Data Schemas**: Database schema definitions with relationships
4. **API Schemas**: OpenAPI-compatible endpoint definitions

## Response Patterns

### Pattern 1: Direct JSON Output

**Use Case**: API responses, data extraction, configuration generation

```javascript
const prompt = `Extract SEO metadata from this HTML and return JSON:
{
  "title": "<page title>",
  "description": "<meta description>",
  "keywords": ["keyword1", "keyword2"],
  "headings": {
    "h1": ["<h1 texts>"],
    "h2": ["<h2 texts>"]
  }
}`;
```

### Pattern 2: Step-by-Step Analysis

**Use Case**: Complex problem solving, optimization recommendations

```javascript
const prompt = `Analyze this DOM structure:
${domData}

Provide analysis in steps:
1. Identify structure issues
2. Calculate complexity metrics
3. Generate optimization recommendations

Return JSON:
{
  "analysis": { "step": 1, "findings": [...] },
  "metrics": {...},
  "recommendations": [...]
}`;
```

### Pattern 3: Code Generation

**Use Case**: Generating React components, API endpoints, test cases

```javascript
const prompt = `Generate a TypeScript React component for:
- Name: ${componentName}
- Props: ${JSON.stringify(props)}
- Functionality: ${description}

Return the component code with proper TypeScript types.`;
```

### Pattern 4: Multi-Stage Workflow

**Use Case**: Complex automation tasks requiring multiple processing stages

```javascript
const stages = [
  { role: 'system', content: 'You are a workflow architect.' },
  { role: 'user', content: 'Design a data pipeline for...' },
  { role: 'assistant', content: '// Stage 1 response' },
  { role: 'user', content: 'Now optimize the pipeline for performance.' }
];
```

## Chain-of-Thought Reasoning

DeepSeek excels at chain-of-thought reasoning when prompted correctly:

### Enabling CoT Reasoning

```javascript
const prompt = `REASONING PROCESS (Chain-of-Thought):
Step 1: Analyze the user request to identify required services
Step 2: Define the task execution order and dependencies
Step 3: Configure service parameters based on best practices
Step 4: Add error handling and monitoring
Step 5: Validate the schema structure

Now, based on this reasoning process, generate the output.`;
```

### Self-Reflection Pattern

```javascript
const prompt = `Before providing your answer:
1. Consider potential issues with this approach
2. Validate assumptions against requirements
3. Identify edge cases
4. Propose alternatives if applicable

Then provide your final recommendation.`;
```

## Error Handling Patterns

### Graceful Fallbacks

```javascript
const response = await deepseekClient.chatCompletion(messages);

// Parse with fallback
let result;
try {
  result = JSON.parse(response);
} catch (parseError) {
  result = {
    rawResponse: response,
    error: 'Failed to parse as JSON',
    suggestion: 'Retry with explicit JSON format instruction'
  };
}
```

### Validation with Retry

```javascript
async function generateWithValidation(prompt, schema, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await deepseekClient.chatCompletion([
      { role: 'system', content: 'Generate valid JSON matching the provided schema.' },
      { role: 'user', content: prompt }
    ]);
    
    try {
      const parsed = JSON.parse(response);
      if (validateSchema(parsed, schema)) {
        return parsed;
      }
    } catch (e) {
      // Retry with more explicit instructions
    }
  }
  throw new Error('Failed to generate valid response after retries');
}
```

## Best Practices

### 1. Use Explicit Schema Instructions

Always include the expected output schema in the prompt:

```javascript
const prompt = `Generate output matching this EXACT JSON structure:
{
  "field1": "string value",
  "field2": 123,
  "nested": { "key": "value" }
}`;
```

### 2. Temperature Settings

| Use Case | Temperature | Rationale |
|----------|-------------|-----------|
| JSON generation | 0.1 - 0.3 | Higher consistency |
| Code generation | 0.2 - 0.4 | Balance creativity/accuracy |
| Creative tasks | 0.6 - 0.8 | More diverse outputs |
| Workflow optimization | 0.3 - 0.5 | Balanced analysis |

### 3. Token Limits

- Workflow generation: 2000-4000 tokens
- Code generation: 2000-3000 tokens
- Analysis tasks: 1500-2500 tokens
- Simple extractions: 500-1000 tokens

### 4. Context Window Management

```javascript
const config = {
  contextWindowSize: 8000,
  memoryRetentionDays: 30,
  enableSemanticSearch: true
};
```

### 5. Prompt Template Variables

Use consistent variable naming:

```javascript
const template = `
User Request: {{userRequest}}
Domain Context: {{domainContext}}
Safety Mode: {{safetyMode}}
Naming Convention: {{namingConvention}}
`;
```

## Integration with LightDom

### Prompt Engine Usage

```typescript
import { DeepSeekPromptEngine } from '@/services/deepseek-prompt-engine';
import { DEFAULT_DEEPSEEK_CONFIG } from '@/config/deepseek-config';

const engine = new DeepSeekPromptEngine(DEFAULT_DEEPSEEK_CONFIG);

// Generate a prompt from template
const prompt = engine.generatePrompt('workflowGeneration', {
  userRequest: 'Create SEO crawler workflow',
  domainContext: 'E-commerce website optimization'
});
```

### Workflow Templates

```javascript
import { WorkflowTemplates } from '@/schemas/workflow-schemas';

// Use predefined templates
const dataminingWorkflow = WorkflowTemplates.datamining;
const seoWorkflow = WorkflowTemplates.seoOptimization;
```

## See Also

- [DeepSeek API Service](../services/deepseek-api-service.js)
- [DeepSeek Prompt Templates](../services/deepseek-prompt-templates.js)
- [Workflow Schemas](../schemas/workflow-schemas.js)
- [DeepSeek Configuration](../src/config/deepseek-config.ts)
