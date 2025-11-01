# Ollama & n8n Integration Guide

## Overview

This guide covers the complete integration of Ollama AI models with n8n workflow automation in the LightDom project. You can use AI-powered prompt engineering to generate, optimize, and manage n8n workflows automatically.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Ollama Setup](#ollama-setup)
3. [Testing Ollama](#testing-ollama)
4. [Prompt Engineering Templates](#prompt-engineering-templates)
5. [n8n Workflow Builder](#n8n-workflow-builder)
6. [n8n MCP Server](#n8n-mcp-server)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18+ 
- 8GB+ RAM (for running Ollama models)
- Linux, macOS, or Windows with WSL

### Software Installation

1. **Install Ollama**
   ```bash
   # Linux/macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Or download from https://ollama.ai/download
   ```

2. **Install n8n** (optional for deployment)
   ```bash
   npm run n8n:start
   # Or use Docker
   docker-compose up -d n8n
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

## Ollama Setup

### 1. Start Ollama Service

```bash
ollama serve
```

The service will run on `http://localhost:11434`

### 2. Pull Recommended Models

```bash
# General purpose - good for analysis and planning
ollama pull llama2:7b

# Code generation - best for workflows and scripts
ollama pull codellama:7b

# Fast responses - lightweight for quick tasks
ollama pull mistral:7b

# Very small - for testing
ollama pull phi:2.7b
```

### 3. Verify Installation

```bash
ollama list
```

You should see the models you pulled.

## Testing Ollama

### Automated Setup Test

Run the comprehensive setup test:

```bash
npm run ollama:test
# Or
node scripts/automation/test-ollama-setup.js
```

This tests:
- ✅ Ollama installation
- ✅ Service status
- ✅ Model availability
- ✅ Basic chat functionality
- ✅ Prompt engineering capabilities

### Test Report

The test generates a detailed report at `ollama-test-report.json`:

```json
{
  "timestamp": "2025-11-01T...",
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0
  },
  "tests": [...],
  "recommendations": [...]
}
```

### Manual Testing

```bash
# Interactive chat
npm run ollama:cli

# Single query
node ollama-cli.js "Hello, how are you?"

# With specific model
node ollama-cli.js --model codellama:7b "Write a hello world function"
```

## Prompt Engineering Templates

### Template Categories

The system includes pre-built templates for:

1. **DOM Optimization** - Analyze and optimize web pages
2. **Workflow Generation** - Create n8n workflows from descriptions
3. **Code Generation** - Generate scripts and API endpoints
4. **Documentation** - Create comprehensive docs
5. **Analysis & Review** - Code review and performance analysis

### Using Templates

#### List Available Templates

```bash
node scripts/automation/ollama-prompt-engine.js --list
```

#### Interactive Mode

```bash
node scripts/automation/ollama-prompt-engine.js --interactive
```

This will:
1. Show all available templates
2. Prompt you to select one
3. Collect required parameters
4. Execute with Ollama
5. Save results

#### Direct Execution

```bash
node scripts/automation/ollama-prompt-engine.js --execute analyze_dom_structure \
  dom_data='{"elements": 150, "depth": 8, "scripts": 12}'
```

### Template Structure

Templates are defined in `workflows/automation/ollama-prompts/prompt-templates.json`:

```json
{
  "id": "template_id",
  "name": "Human Readable Name",
  "prompt": "The prompt with {{parameters}}",
  "parameters": ["param1", "param2"],
  "output_format": "json|code|markdown",
  "model_recommendation": "llama2:7b"
}
```

### Creating Custom Templates

Add your templates to the JSON file:

```json
{
  "id": "my_custom_template",
  "name": "My Custom Template",
  "prompt": "Do something with {{my_param}}",
  "parameters": ["my_param"],
  "output_format": "json",
  "model_recommendation": "llama2:7b"
}
```

## n8n Workflow Builder

### Overview

The workflow builder uses Ollama AI to generate complete n8n workflows from natural language descriptions.

### Interactive Mode

```bash
node scripts/automation/n8n-workflow-builder.js --interactive
```

You'll be guided through:
1. Describing your workflow
2. Selecting an AI model
3. Optionally enhancing with AI optimizations
4. Saving to file
5. Deploying to n8n server

### Generate Single Workflow

```bash
node scripts/automation/n8n-workflow-builder.js --generate \
  "Create a workflow that monitors GitHub issues and sends Slack notifications"
```

### Batch Generation

Create a file with workflow descriptions (one per line):

```txt
# workflow-descriptions.txt
Create a workflow for processing CSV uploads
Build a workflow that scrapes product prices daily
Generate a workflow for email automation with templates
```

Then run:

```bash
node scripts/automation/n8n-workflow-builder.js --batch workflow-descriptions.txt
```

### Workflow Validation

The builder automatically validates:
- Workflow structure (name, nodes, connections)
- Node properties (id, type, name, position)
- Connection integrity
- n8n compatibility

### Generated Workflows

Workflows are saved to `workflows/automation/generated/`:

```
workflows/automation/generated/
├── workflow-1730471234567.json
├── workflow-1730471345678.json
└── batch-workflow-1-1730471456789.json
```

### Deploying to n8n

Set environment variables:

```bash
export N8N_BASE_URL=http://localhost:5678
export N8N_API_KEY=your_api_key_here  # Optional
```

Then deploy:

```bash
node scripts/automation/n8n-workflow-builder.js --interactive
# Choose "y" when asked to deploy
```

## n8n MCP Server

### What is MCP?

The Model Context Protocol (MCP) provides integration between Cursor IDE and n8n, allowing you to manage workflows directly from the editor.

### Setup

```bash
# Run setup script
node scripts/automation/setup-n8n-mcp.js

# Or use the quick start
bash scripts/automation/quick-start-n8n-mcp.sh
```

### Configuration

Edit `.env`:

```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=
N8N_TIMEOUT=30000
```

### Available MCP Tools

When configured in Cursor:

- `list_workflows` - List all workflows
- `get_workflow` - Get specific workflow
- `create_workflow` - Create new workflow
- `update_workflow` - Update existing workflow
- `delete_workflow` - Delete workflow
- `execute_workflow` - Execute workflow
- `create_webhook` - Create webhook
- `trigger_webhook` - Trigger webhook
- `validate_workflow` - Validate workflow structure

### Using in Cursor

1. Configure MCP in Cursor settings
2. Use natural language to interact:
   - "List my n8n workflows"
   - "Create a workflow that sends daily reports"
   - "Execute workflow abc123"

## Usage Examples

### Example 1: Generate DOM Optimization Workflow

```bash
# 1. Generate using prompt template
node scripts/automation/ollama-prompt-engine.js --execute create_workflow_from_description \
  description="Create a workflow that crawls a URL, analyzes DOM, and stores optimization recommendations in a database"

# 2. Or use the workflow builder
node scripts/automation/n8n-workflow-builder.js --generate \
  "Create a DOM optimization workflow with crawling, analysis, and database storage"
```

### Example 2: Code Review with Ollama

```bash
# Use the code review template
node scripts/automation/ollama-prompt-engine.js --execute code_review \
  code="$(cat src/my-component.tsx)"
```

### Example 3: Batch Workflow Creation

Create `batch-workflows.txt`:
```
Monitor API health and send alerts
Process uploaded images and resize them
Sync data between databases hourly
Generate and email weekly reports
```

Run batch generation:
```bash
node scripts/automation/n8n-workflow-builder.js --batch batch-workflows.txt
```

### Example 4: Interactive Development

```bash
# Start interactive prompt engine
node scripts/automation/ollama-prompt-engine.js -i

# Select template: generate_api_endpoint
# Provide parameters interactively
# Get production-ready code output
```

## Workflow Patterns

### Pattern 1: Webhook → Process → Respond

```javascript
{
  "name": "Webhook Handler",
  "nodes": [
    {
      "id": "webhook",
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook Trigger",
      "parameters": {
        "httpMethod": "POST",
        "path": "my-webhook"
      }
    },
    {
      "id": "process",
      "type": "n8n-nodes-base.function",
      "name": "Process Data",
      "parameters": {
        "functionCode": "// Your processing logic"
      }
    },
    {
      "id": "respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "Send Response"
    }
  ],
  "connections": {
    "webhook": { "main": [["process"]] },
    "process": { "main": [["respond"]] }
  }
}
```

### Pattern 2: Schedule → Fetch → Process → Store

Use the workflow builder to generate this pattern:

```bash
node scripts/automation/n8n-workflow-builder.js -g \
  "Create a scheduled workflow that fetches data from an API every hour, processes it, and stores in PostgreSQL"
```

### Pattern 3: Multi-step Validation Pipeline

Generated with enhanced prompts:

```bash
node scripts/automation/ollama-prompt-engine.js -e create_workflow_from_description \
  description="Build a data validation pipeline with input validation, business rules check, quality scoring, and error notification"
```

## Integration Patterns

### Pattern A: Ollama → n8n Workflow → Deploy

```bash
# 1. Use Ollama to generate workflow
WORKFLOW=$(node scripts/automation/ollama-prompt-engine.js -e create_workflow_from_description \
  description="Your workflow description")

# 2. Save and deploy
echo $WORKFLOW > /tmp/my-workflow.json
# Deploy via MCP or API
```

### Pattern B: Code Generation → Testing → Deployment

```bash
# 1. Generate code with Ollama
node scripts/automation/ollama-prompt-engine.js -e generate_api_endpoint \
  purpose="User authentication" \
  input_schema='{"username": "string", "password": "string"}' \
  output_schema='{"token": "string", "user": "object"}'

# 2. Generate tests
node scripts/automation/ollama-prompt-engine.js -e generate_test_suite \
  code="$(cat generated-endpoint.js)"

# 3. Run tests
npm test
```

## Troubleshooting

### Ollama Issues

**"Ollama is not running"**
```bash
ollama serve
```

**"Model not found"**
```bash
ollama pull llama2:7b
```

**"Slow responses"**
```bash
# Use smaller/faster model
ollama pull mistral:7b
ollama pull phi:2.7b
```

**"Out of memory"**
```bash
# Close other applications
# Use smaller model (phi:2.7b)
# Reduce conversation history
```

### n8n Issues

**"Cannot connect to n8n"**
```bash
# Start n8n
npm run n8n:start

# Or check if already running
curl http://localhost:5678/healthz
```

**"Authentication failed"**
- Check `N8N_API_KEY` in `.env`
- Generate new API key in n8n UI

**"Workflow validation failed"**
- Review generated JSON structure
- Check node types are valid n8n node types
- Verify connections reference existing node IDs

### Template Issues

**"Template not found"**
```bash
# List available templates
node scripts/automation/ollama-prompt-engine.js --list
```

**"Missing parameters"**
- Check template definition for required parameters
- Provide all parameters when executing

**"Invalid JSON output"**
- Model may need better prompting
- Try with codellama:7b for JSON tasks
- Review and manually extract JSON from output

## Performance Tips

### Ollama Performance

1. **Use appropriate models**:
   - Quick tasks: `phi:2.7b`, `mistral:7b`
   - Quality work: `llama2:7b`, `codellama:7b`
   - Complex tasks: `llama2:13b`

2. **Manage memory**:
   - Clear conversation history: `/clear`
   - Close unused models
   - Monitor system resources

3. **Optimize prompts**:
   - Be specific and clear
   - Provide examples when possible
   - Request specific output formats

### Workflow Builder Performance

1. **Batch processing**: Process multiple workflows in one session
2. **Caching**: Reuse similar workflow structures
3. **Parallel generation**: Run multiple builders if you have resources

## Best Practices

### Prompt Engineering

1. **Be Specific**: Detailed descriptions get better results
2. **Use Examples**: Reference existing workflows when relevant
3. **Specify Format**: Request JSON, code, or markdown explicitly
4. **Iterate**: Refine prompts based on outputs

### Workflow Design

1. **Start Simple**: Build basic workflow, then enhance
2. **Validate Early**: Check structure before deployment
3. **Test Locally**: Use n8n test execution before production
4. **Version Control**: Save workflows to git

### Integration

1. **Environment Variables**: Use `.env` for configuration
2. **Error Handling**: Always include error handling nodes
3. **Logging**: Add logging for debugging
4. **Documentation**: Generate docs with Ollama templates

## Advanced Topics

### Custom Node Types

Create custom n8n nodes and reference them in generated workflows.

### Workflow Composition

Combine multiple generated workflows into complex systems.

### AI-Assisted Debugging

Use Ollama to analyze workflow errors and suggest fixes.

### Continuous Integration

Integrate workflow generation into CI/CD pipelines.

## Resources

### Documentation
- Ollama: https://ollama.ai/docs
- n8n: https://docs.n8n.io
- MCP: https://modelcontextprotocol.io

### Example Workflows
- `workflows/automation/n8n-workflow-templates.json`
- `workflows/automation/generated/`

### Templates
- `workflows/automation/ollama-prompts/prompt-templates.json`

### Scripts
- `scripts/automation/test-ollama-setup.js`
- `scripts/automation/ollama-prompt-engine.js`
- `scripts/automation/n8n-workflow-builder.js`
- `scripts/automation/setup-n8n-mcp.js`

## Support

For issues or questions:
1. Check troubleshooting section
2. Review test results: `ollama-test-report.json`
3. Examine generated workflow files
4. Check n8n logs: `npm run n8n:logs`

---

**Happy Automating! 🚀🤖**
