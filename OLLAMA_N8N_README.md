# Ollama & n8n Integration - Complete Implementation

## 🎯 Overview

This implementation provides a complete integration between Ollama AI models and n8n workflow automation for the LightDom project. You can now:

- **Test and validate** Ollama installations automatically
- **Use prompt engineering templates** for consistent AI interactions
- **Generate n8n workflows** using natural language descriptions
- **Build workflows programmatically** with reusable patterns
- **Deploy and manage** workflows through the n8n MCP server

## 📋 What's Included

### Core Components

1. **Ollama Testing Framework** (`scripts/automation/test-ollama-setup.js`)
   - Validates installation and configuration
   - Tests model availability
   - Checks chat functionality
   - Validates prompt engineering capabilities
   - Generates detailed JSON reports

2. **Prompt Template Engine** (`scripts/automation/ollama-prompt-engine.js`)
   - 15+ pre-built templates across 5 categories
   - Parameter substitution system
   - Interactive and CLI modes
   - Automatic output parsing
   - Result caching and export

3. **n8n Workflow Builder** (`scripts/automation/n8n-workflow-builder.js`)
   - AI-powered workflow generation
   - Interactive creation wizard
   - Batch processing from files
   - Workflow validation and enhancement
   - Direct deployment to n8n server

4. **Interactive Demo** (`scripts/automation/demo-ollama-n8n-integration.js`)
   - Guided tour of all features
   - Step-by-step tutorials
   - Live testing and execution
   - Documentation viewer

5. **Programmatic Examples** (`scripts/automation/example-programmatic-workflows.js`)
   - Reusable workflow patterns
   - Pattern builder library
   - API client for n8n
   - Ready-to-deploy examples

### Templates & Resources

- **Prompt Templates** (`workflows/automation/ollama-prompts/prompt-templates.json`)
  - DOM Optimization templates
  - Workflow Generation templates
  - Code Generation templates
  - Documentation templates
  - Analysis & Review templates

- **Workflow Templates** (`workflows/automation/n8n-workflow-templates.json`)
  - Pre-built workflow examples
  - Common patterns and structures
  - Integration templates

- **Example Descriptions** (`workflows/automation/example-workflow-descriptions.txt`)
  - 15 example workflow descriptions
  - Ready for batch generation

### Documentation

1. **Complete Integration Guide** (`OLLAMA_N8N_INTEGRATION_GUIDE.md`)
   - Installation and setup
   - Detailed usage instructions
   - Troubleshooting guide
   - Performance optimization
   - Best practices

2. **Quick Reference Card** (`OLLAMA_N8N_QUICK_REFERENCE.md`)
   - Common commands
   - Quick tips
   - Troubleshooting table
   - File locations

3. **Workflow Patterns Guide** (`workflows/automation/README.md`)
   - Pattern documentation
   - Node type reference
   - Best practices
   - Examples

## 🚀 Quick Start

### 1. Install Prerequisites

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2:7b

# Install project dependencies (if not already done)
npm install
```

### 2. Test Your Setup

```bash
# Run comprehensive tests
npm run ollama:test

# Check the report
cat ollama-test-report.json
```

### 3. Try the Interactive Demo

```bash
# Guided tour of all features
npm run demo:ollama-n8n
```

### 4. Generate Your First Workflow

```bash
# Interactive mode
npm run n8n:workflow:build:interactive

# Or with a description
npm run n8n:workflow:build -- --generate "Create a webhook that processes data"
```

## 📖 Common Use Cases

### Use Case 1: Analyze Website DOM

```bash
npm run ollama:prompt:execute -- analyze_dom_structure \
  dom_data='{"elements": 200, "depth": 10, "scripts": 15}'
```

### Use Case 2: Generate API Workflow

```bash
npm run n8n:workflow:build -- --generate \
  "Create a REST API that accepts JSON data, validates it, stores in PostgreSQL, and returns a confirmation"
```

### Use Case 3: Code Review

```bash
node scripts/automation/ollama-prompt-engine.js --execute code_review \
  code="$(cat src/my-component.tsx)"
```

### Use Case 4: Batch Workflow Creation

```bash
# Create a file with workflow descriptions
echo "Monitor GitHub for new issues
Process CSV uploads
Send daily reports" > my-workflows.txt

# Generate all workflows
npm run n8n:workflow:batch -- my-workflows.txt
```

### Use Case 5: Generate Documentation

```bash
npm run ollama:prompt:execute -- generate_api_docs \
  api_code="$(cat api-server.js)"
```

## 🎓 Learning Path

### Beginner (Day 1-2)
1. Run `npm run demo:ollama-n8n`
2. Read `OLLAMA_N8N_QUICK_REFERENCE.md`
3. Test Ollama with `npm run ollama:test`
4. Try a few prompt templates interactively

### Intermediate (Day 3-4)
1. Generate simple workflows
2. Explore workflow patterns
3. Customize prompt templates
4. Deploy to n8n server

### Advanced (Day 5+)
1. Build workflows programmatically
2. Create custom templates
3. Batch workflow generation
4. Integrate with CI/CD

## 🔧 NPM Scripts Reference

```bash
# Ollama
npm run ollama:test                    # Test setup
npm run ollama:prompt:list             # List templates
npm run ollama:prompt:interactive      # Interactive mode
npm run ollama:prompt:execute          # Execute template

# n8n Workflows
npm run n8n:start                      # Start n8n
npm run n8n:stop                       # Stop n8n
npm run n8n:logs                       # View logs
npm run n8n:workflow:build             # Build workflow
npm run n8n:workflow:build:interactive # Interactive builder
npm run n8n:workflow:batch             # Batch generation

# Demo & Examples
npm run demo:ollama-n8n                # Interactive demo
```

## 📁 Project Structure

```
LightDom/
├── scripts/automation/
│   ├── test-ollama-setup.js                   # Testing framework
│   ├── ollama-prompt-engine.js                # Template engine
│   ├── n8n-workflow-builder.js                # Workflow generator
│   ├── demo-ollama-n8n-integration.js         # Interactive demo
│   ├── example-programmatic-workflows.js      # Code examples
│   ├── setup-n8n-mcp.js                       # MCP setup
│   └── quick-start-n8n-mcp.sh                 # Quick start
│
├── workflows/automation/
│   ├── ollama-prompts/
│   │   └── prompt-templates.json              # Templates
│   ├── n8n-workflow-templates.json            # Workflow examples
│   ├── example-workflow-descriptions.txt      # Batch examples
│   ├── generated/                             # Generated workflows
│   └── README.md                              # Patterns guide
│
├── outputs/
│   └── ollama-results/                        # Execution results
│
├── OLLAMA_N8N_INTEGRATION_GUIDE.md           # Complete guide
├── OLLAMA_N8N_QUICK_REFERENCE.md             # Quick reference
└── N8N_MCP_SETUP.md                          # MCP server docs
```

## 🎯 Key Features

### ✅ Ollama Integration
- Automated installation testing
- Model availability checking
- Prompt engineering templates
- Multiple output formats (JSON, code, markdown)
- Result caching and export

### ✅ n8n Workflow Generation
- Natural language to workflow conversion
- Interactive creation wizard
- Batch processing
- Workflow validation
- AI-powered optimization
- Direct deployment

### ✅ Template System
- 15+ pre-built templates
- Parameterized prompts
- Category organization
- Model recommendations
- Custom template support

### ✅ Developer Experience
- Interactive demos
- Comprehensive documentation
- Quick reference cards
- Code examples
- Best practices

## 🔍 Prompt Template Categories

1. **DOM Optimization** - Analyze and optimize web pages
2. **Workflow Generation** - Create n8n workflows from descriptions
3. **Code Generation** - Generate scripts and API endpoints
4. **Documentation** - Create comprehensive docs
5. **Analysis & Review** - Code review and performance analysis

## 🏗️ Workflow Patterns

1. **Webhook Triggered** - API endpoints and integrations
2. **Scheduled Tasks** - Recurring data processing
3. **Event-Driven** - Reactive automation
4. **Multi-Step Pipelines** - Complex data transformations
5. **Error Handling** - Resilient workflows

## 📊 Performance & Optimization

### Recommended Models

- **Quick tasks**: `phi:2.7b`, `mistral:7b`
- **Quality work**: `llama2:7b`, `codellama:7b`
- **Complex tasks**: `llama2:13b`

### Tips

- Use appropriate models for each task
- Clear conversation history regularly
- Batch similar operations
- Cache results when possible
- Monitor resource usage

## 🐛 Troubleshooting

### Quick Fixes

```bash
# Ollama not working?
ollama serve
ollama pull llama2:7b

# n8n not accessible?
npm run n8n:start

# Check test results
cat ollama-test-report.json | jq

# View logs
npm run n8n:logs
```

### Common Issues

See `OLLAMA_N8N_INTEGRATION_GUIDE.md` for detailed troubleshooting.

## 🔗 Resources

- [Complete Integration Guide](OLLAMA_N8N_INTEGRATION_GUIDE.md)
- [Quick Reference](OLLAMA_N8N_QUICK_REFERENCE.md)
- [Workflow Patterns](workflows/automation/README.md)
- [Ollama Docs](https://ollama.ai/docs)
- [n8n Docs](https://docs.n8n.io)

## 🎉 What's Next?

1. **Run the demo**: `npm run demo:ollama-n8n`
2. **Read the guide**: `OLLAMA_N8N_INTEGRATION_GUIDE.md`
3. **Try templates**: `npm run ollama:prompt:interactive`
4. **Build workflows**: `npm run n8n:workflow:build:interactive`
5. **Explore examples**: `scripts/automation/example-programmatic-workflows.js`

## 💡 Pro Tips

- Start with the interactive demo
- Use the quick reference for common tasks
- Customize templates for your needs
- Validate workflows before deployment
- Monitor execution and optimize

## 🤝 Contributing

When adding new features:
- Follow existing patterns
- Add comprehensive documentation
- Include usage examples
- Test thoroughly
- Update relevant guides

## 📝 License

MIT - See LICENSE file for details

---

**Get started now:** `npm run demo:ollama-n8n` 🚀

For questions or issues, refer to the complete integration guide or troubleshooting sections.
