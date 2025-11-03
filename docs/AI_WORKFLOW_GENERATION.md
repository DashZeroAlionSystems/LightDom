# AI-Powered Workflow Generation (Phase 3)

## Overview

Phase 3 enables natural language workflow creation using AI (Ollama). Users can describe what they want in plain English, and the system generates a complete, validated workflow schema.

## Features

- **Natural Language Input**: Describe workflows in plain English
- **AI Schema Generation**: Automatic conversion to JSON Schema-compliant workflows
- **Task Suggestions**: AI recommends tasks based on workflow goals
- **Workflow Enhancement**: AI improves descriptions and task details
- **Intelligent Fallback**: Uses templates when AI is unavailable
- **Validation**: All AI-generated schemas are validated before use

## Setup

### Install Ollama

```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh

# Pull recommended model
ollama pull llama2

# Or use other models
ollama pull codellama    # Better for code generation
ollama pull mistral      # Faster, lighter
ollama pull mixtral      # Most capable
```

### Verify Installation

```bash
ollama list
```

## API Endpoints

### 1. Generate Workflow from Prompt

```http
POST /api/workflow-admin/ai/generate
Content-Type: application/json

{
  "prompt": "Create a workflow to analyze website SEO and generate a report",
  "model": "llama2",  // optional
  "options": {
    "temperature": 0.7  // optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-1699...",
    "name": "SEO Analysis and Reporting",
    "description": "Analyzes website SEO metrics and generates comprehensive reports",
    "type": "seo",
    "tasks": [...],
    "attributes": [...]
  },
  "metadata": {
    "model": "llama2",
    "prompt": "Create a workflow...",
    "generatedAt": "2025-11-03T13:00:00.000Z"
  }
}
```

### 2. Generate and Save Workflow

```http
POST /api/workflow-admin/ai/generate-and-save
Content-Type: application/json

{
  "prompt": "Build a data pipeline for product enrichment",
  "options": {
    "enhance": true  // Enhance with better descriptions
  },
  "ownerName": "John Doe",
  "ownerEmail": "john@example.com"
}
```

### 3. Get Task Suggestions

```http
POST /api/workflow-admin/ai/suggest-tasks
Content-Type: application/json

{
  "goal": "Create an automated content generation system"
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "label": "Collect Source Content",
      "description": "Gather content from various sources",
      "handler": { "type": "crawler", "config": {} }
    },
    {
      "label": "Generate AI Content",
      "description": "Use AI to create new content variations",
      "handler": { "type": "custom", "config": {} }
    }
  ]
}
```

### 4. Enhance Existing Workflow

```http
POST /api/workflow-admin/ai/enhance
Content-Type: application/json

{
  "workflow": {
    "id": "workflow-123",
    "name": "Data Processing",
    "type": "custom",
    "tasks": [
      {
        "id": "task-1",
        "label": "Extract Data",
        "handler": { "type": "data-source", "config": {} }
      }
    ]
  }
}
```

### 5. Check AI Service Status

```http
GET /api/workflow-admin/ai/status
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "model": "llama2",
  "availableModels": ["llama2", "codellama", "mistral", "mixtral"],
  "message": "AI service is available"
}
```

## Usage Examples

### Example 1: Simple SEO Workflow

```javascript
const response = await fetch('/api/workflow-admin/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Analyze website SEO and create optimization recommendations'
  })
});

const { workflow } = await response.json();
console.log(`Generated ${workflow.tasks.length} tasks`);
```

### Example 2: Complex Data Pipeline

```javascript
const response = await fetch('/api/workflow-admin/ai/generate-and-save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: `Create a data pipeline that:
    1. Extracts product data from PostgreSQL
    2. Enriches data with AI-generated descriptions
    3. Links data to schema.org vocabularies
    4. Generates React components for each product
    5. Deploys components to production`,
    options: { enhance: true },
    ownerName: 'Product Team'
  })
});
```

### Example 3: Get Suggestions Then Customize

```javascript
// Step 1: Get task suggestions
const suggestionsRes = await fetch('/api/workflow-admin/ai/suggest-tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal: 'Automated blog post creation and publishing'
  })
});

const { tasks } = await suggestionsRes.json();

// Step 2: Build custom workflow with suggested tasks
const workflow = {
  id: `workflow-${Date.now()}`,
  name: 'Blog Automation',
  type: 'custom',
  version: '1.0.0',
  tasks: tasks.map((task, i) => ({
    ...task,
    id: `task-${i}`,
    dependencies: i > 0 ? [`task-${i-1}`] : []
  }))
};

// Step 3: Enhance with AI
const enhanceRes = await fetch('/api/workflow-admin/ai/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ workflow })
});
```

## Fallback Mechanism

If Ollama is not available, the system automatically falls back to template-based generation:

1. Analyzes the prompt for keywords
2. Selects the most appropriate template (datamining, SEO, component-generation)
3. Instantiates the template with customization
4. Returns a valid workflow schema

This ensures the system always works, even without AI.

## Prompt Engineering Tips

### Good Prompts

✅ **Specific and actionable**
```
"Create a workflow that scrapes product data from an e-commerce site, 
enriches it with AI descriptions, and stores it in PostgreSQL"
```

✅ **Include desired outputs**
```
"Build an SEO analysis workflow that generates a PDF report with 
recommendations and a score"
```

✅ **Mention technologies**
```
"Generate a workflow using React components and TensorFlow for 
image classification"
```

### Poor Prompts

❌ **Too vague**
```
"Make a workflow"
```

❌ **No clear goal**
```
"Do some stuff with data"
```

❌ **Conflicting requirements**
```
"Create a simple complex workflow that does everything"
```

## Testing

Run the test suite to verify AI workflow generation:

```bash
node scripts/test-ai-workflows.js
```

This will test:
- AI service availability
- Simple workflow generation
- Complex workflow with dependencies
- Task suggestions
- Workflow enhancement
- Fallback mechanism

## Model Selection

Different models have different strengths:

- **llama2** (default): Good general-purpose model, balanced speed/quality
- **codellama**: Best for code generation and technical workflows
- **mistral**: Faster, lighter, good for simple workflows
- **mixtral**: Most capable, best quality, slower

Change model in request:
```javascript
{
  "prompt": "...",
  "model": "codellama"
}
```

Or set globally:
```javascript
import AIWorkflowGenerator from './services/ai-workflow-generator.js';
const aiGen = new AIWorkflowGenerator('codellama');
```

## Architecture

```
User Prompt
    ↓
AI Workflow Generator
    ↓
Ollama (llama2/codellama/mistral/mixtral)
    ↓
JSON Schema Response
    ↓
Schema Validator (Ajv)
    ↓ (if invalid)
Auto-Fix or Fallback to Template
    ↓
Valid Workflow Schema
    ↓
Database (if using generate-and-save)
```

## Limitations

1. **AI Availability**: Requires Ollama to be installed and running
2. **Response Time**: Can take 5-30 seconds depending on model and complexity
3. **Accuracy**: AI may not always generate perfect schemas (auto-fix helps)
4. **Context Length**: Very long prompts may be truncated
5. **Hallucination**: AI might suggest non-existent handler types (validation catches this)

## Best Practices

1. **Start Simple**: Test with simple prompts before complex ones
2. **Use Enhancement**: Enable `enhance: true` for better descriptions
3. **Validate Always**: System auto-validates, but review generated workflows
4. **Provide Feedback**: Use task suggestions for iterative refinement
5. **Template Fallback**: Don't rely solely on AI; templates ensure reliability

## Future Enhancements

- **Fine-tuned Models**: Train models specifically on workflow schemas
- **Multi-turn Conversations**: Iterative refinement through chat
- **Example Learning**: Learn from user-created workflows
- **Domain-Specific Models**: Specialized models for SEO, data mining, etc.
- **Workflow Library**: Share AI-generated workflows with community
