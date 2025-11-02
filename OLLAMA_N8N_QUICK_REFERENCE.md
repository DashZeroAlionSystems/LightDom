# Ollama & n8n Quick Reference Card

## 🚀 Quick Start

```bash
# Test Ollama setup
npm run ollama:test

# Interactive workflow builder
npm run n8n:workflow:build:interactive

# Run the complete demo
npm run demo:ollama-n8n
```

## 📋 Common Commands

### Ollama Operations

```bash
# Start Ollama service
ollama serve

# Pull a model
ollama pull llama2:7b
ollama pull codellama:7b

# List installed models
ollama list

# Test basic chat
ollama run llama2:7b "Hello!"

# Use the CLI
npm run ollama:cli
```

### Prompt Templates

```bash
# List all templates
npm run ollama:prompt:list

# Interactive mode
npm run ollama:prompt:interactive

# Execute specific template
npm run ollama:prompt:execute -- analyze_dom_structure dom_data='{"elements":150}'
```

### n8n Workflows

```bash
# Start n8n
npm run n8n:start

# Build workflow from description
npm run n8n:workflow:build -- --generate "Create a webhook API"

# Batch generation
npm run n8n:workflow:batch -- workflow-descriptions.txt

# Interactive builder
npm run n8n:workflow:build:interactive
```

## 🎯 Use Cases

### 1. Analyze DOM Structure

```bash
node scripts/automation/ollama-prompt-engine.js -e analyze_dom_structure \
  dom_data='{"elements": 200, "depth": 10, "scripts": 15}'
```

### 2. Generate Workflow from Description

```bash
node scripts/automation/n8n-workflow-builder.js -g \
  "Create a workflow that monitors GitHub for new issues"
```

### 3. Code Review

```bash
node scripts/automation/ollama-prompt-engine.js -e code_review \
  code="$(cat my-file.js)"
```

### 4. Generate API Documentation

```bash
node scripts/automation/ollama-prompt-engine.js -e generate_api_docs \
  api_code="$(cat api-server.js)"
```

### 5. Batch Workflow Creation

Create `workflows.txt`:
```
Monitor API health endpoints
Process CSV uploads and validate data
Send daily email reports
```

Run:
```bash
npm run n8n:workflow:batch -- workflows.txt
```

## 📁 File Locations

```
LightDom/
├── scripts/automation/
│   ├── test-ollama-setup.js              # Ollama testing
│   ├── ollama-prompt-engine.js           # Template processor
│   ├── n8n-workflow-builder.js           # Workflow generator
│   ├── demo-ollama-n8n-integration.js    # Interactive demo
│   └── example-programmatic-workflows.js # Programmatic examples
│
├── workflows/automation/
│   ├── ollama-prompts/
│   │   └── prompt-templates.json         # Prompt templates
│   ├── n8n-workflow-templates.json       # Workflow templates
│   ├── generated/                         # Generated workflows
│   └── README.md                          # Workflow patterns
│
├── OLLAMA_N8N_INTEGRATION_GUIDE.md       # Complete guide
└── outputs/
    └── ollama-results/                    # Prompt execution results
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
OLLAMA_HOST=http://localhost:11434
```

### Ollama Config

Location: `ollama-cli-config.json`

```json
{
  "currentModel": "llama2:7b",
  "maxHistoryLength": 50
}
```

## 🤖 Recommended Models

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| `phi:2.7b` | 1.6GB | Quick tasks, testing | ⚡⚡⚡ |
| `mistral:7b` | 4.1GB | General purpose | ⚡⚡ |
| `llama2:7b` | 3.8GB | Balanced quality | ⚡⚡ |
| `codellama:7b` | 3.8GB | Code generation | ⚡⚡ |
| `llama2:13b` | 7.4GB | High quality | ⚡ |

## 📝 Prompt Template Categories

1. **DOM Optimization** (3 templates)
   - analyze_dom_structure
   - generate_optimization_plan
   - suggest_caching_strategy

2. **Workflow Generation** (3 templates)
   - create_workflow_from_description
   - optimize_existing_workflow
   - generate_webhook_handler

3. **Code Generation** (3 templates)
   - generate_crawler_script
   - generate_api_endpoint
   - generate_test_suite

4. **Documentation** (2 templates)
   - generate_api_docs
   - generate_workflow_docs

5. **Analysis** (2 templates)
   - code_review
   - performance_analysis

## 🔗 Workflow Patterns

### Pattern 1: Webhook → Process → Respond
```javascript
Webhook Trigger → Validate Input → Process Data → Send Response
```

### Pattern 2: Schedule → Fetch → Store
```javascript
Schedule Trigger → Fetch Data → Transform → Store in DB
```

### Pattern 3: Event → Condition → Action
```javascript
Event Trigger → Check Condition → Execute Action → Log Result
```

## 🐛 Troubleshooting

### Ollama Issues

| Problem | Solution |
|---------|----------|
| "Ollama not installed" | `curl -fsSL https://ollama.ai/install.sh \| sh` |
| "Service not running" | `ollama serve` |
| "Model not found" | `ollama pull llama2:7b` |
| "Out of memory" | Use smaller model: `phi:2.7b` |
| "Slow responses" | Try `mistral:7b` or reduce history |

### n8n Issues

| Problem | Solution |
|---------|----------|
| "Cannot connect" | `npm run n8n:start` |
| "Auth failed" | Check `N8N_API_KEY` in `.env` |
| "Invalid workflow" | Validate JSON structure |
| "Node type unknown" | Use valid n8n node types |

### Template Issues

| Problem | Solution |
|---------|----------|
| "Template not found" | `npm run ollama:prompt:list` |
| "Missing parameters" | Check template definition |
| "Invalid JSON" | Try with `codellama:7b` |

## 💡 Tips & Best Practices

### Prompt Engineering

✅ **Do:**
- Be specific and detailed
- Provide examples when possible
- Request specific output format (JSON, code, etc.)
- Use recommended model for each template

❌ **Don't:**
- Use vague descriptions
- Mix multiple tasks in one prompt
- Expect perfect results on first try
- Forget to validate output

### Workflow Design

✅ **Do:**
- Include error handling
- Validate inputs early
- Add logging for debugging
- Use environment variables
- Test before deployment

❌ **Don't:**
- Skip input validation
- Hardcode credentials
- Ignore error cases
- Deploy without testing

## 📊 Performance Optimization

### Ollama

```bash
# For speed - use lightweight models
ollama pull phi:2.7b
ollama pull mistral:7b

# For quality - use larger models
ollama pull llama2:13b

# Clear conversation history
# In CLI: /clear
```

### Workflows

- Use batch operations when possible
- Implement caching for expensive operations
- Add rate limiting for API calls
- Monitor execution times
- Optimize database queries

## 🎓 Learning Path

1. **Day 1: Setup & Testing**
   - Install Ollama
   - Run setup tests
   - Try basic prompts

2. **Day 2: Templates**
   - Explore prompt templates
   - Execute examples
   - Customize templates

3. **Day 3: Workflows**
   - Generate simple workflows
   - Deploy to n8n
   - Test execution

4. **Day 4: Integration**
   - Build complex workflows
   - Integrate with existing systems
   - Automate processes

5. **Day 5: Advanced**
   - Create custom templates
   - Batch workflow generation
   - CI/CD integration

## 🔗 Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Full Integration Guide](OLLAMA_N8N_INTEGRATION_GUIDE.md)
- [Workflow Patterns](workflows/automation/README.md)
- [Prompt Templates](workflows/automation/ollama-prompts/prompt-templates.json)

## 🆘 Support

Run the interactive demo for guided setup:
```bash
npm run demo:ollama-n8n
```

Check test results:
```bash
cat ollama-test-report.json | jq
```

View logs:
```bash
npm run n8n:logs
```

---

**Quick tip:** Start with `npm run demo:ollama-n8n` for a guided introduction! 🚀
