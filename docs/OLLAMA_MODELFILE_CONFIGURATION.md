# Ollama Modelfile Configuration Guide

## Overview

This comprehensive guide documents all Ollama Modelfile configuration options, parameters, and best practices for creating custom AI models. A Modelfile is a blueprint for creating and customizing LLMs (Large Language Models) in the Ollama ecosystem—similar to a Dockerfile for containers.

## Table of Contents

1. [Modelfile Structure](#modelfile-structure)
2. [Core Directives](#core-directives)
3. [Parameter Reference](#parameter-reference)
4. [Template Configuration](#template-configuration)
5. [System Prompts](#system-prompts)
6. [Tool Calling Configuration](#tool-calling-configuration)
7. [LightDom Integration](#lightdom-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Modelfile Structure

A Modelfile consists of several directives that define model behavior:

```modelfile
# Base model selection
FROM <base_model>

# Model parameters
PARAMETER <name> <value>

# System prompt
SYSTEM """<system_instructions>"""

# Prompt template
TEMPLATE """<template>"""

# License information
LICENSE """<license_text>"""

# Additional model files
ADAPTER <path>
MESSAGE <role> <content>
```

---

## Core Directives

### FROM (Required)

Specifies the base model to use. This is the only required directive.

```modelfile
# Use a base model from Ollama library
FROM llama3.2

# Use a specific version
FROM deepseek-r1:14b

# Use a local model file
FROM ./models/my-model.gguf

# Use safetensors format
FROM ./models/my-model/
```

**Supported Formats:**
- GGUF files (`.gguf`)
- Safetensors directories
- Ollama model names

---

### SYSTEM

Defines the system-level prompt that sets the model's personality, role, and behavior constraints.

```modelfile
SYSTEM """You are a helpful assistant specialized in web development and DOM optimization.
Always provide clear, actionable advice and include code examples when relevant.
You have access to LightDom platform tools and services."""
```

**Key Uses:**
- Define the AI's persona and expertise
- Set behavioral constraints
- Provide context about available tools
- Establish response formatting guidelines

---

### TEMPLATE

Controls the exact format of prompts passed to the model, including ordering and formatting of system messages, user input, and model responses.

```modelfile
TEMPLATE """{{ if .System }}<|im_start|>system
{{ .System }}<|im_end|>
{{ end }}{{ if .Prompt }}<|im_start|>user
{{ .Prompt }}<|im_end|>
{{ end }}<|im_start|>assistant
{{ .Response }}<|im_end|>
"""
```

**Template Variables:**

| Variable | Description |
|----------|-------------|
| `.System` | The SYSTEM message text |
| `.Prompt` | The user's input message |
| `.Response` | The model's output (for generation) |
| `.First` | Boolean, true if first message in conversation |
| `.Tools` | Available tools definition (for function calling) |
| `.Messages` | Full conversation history |

**Common Template Formats:**

**ChatML Format:**
```modelfile
TEMPLATE """<|im_start|>system
{{ .System }}<|im_end|>
<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
"""
```

**Llama Format:**
```modelfile
TEMPLATE """[INST] <<SYS>>
{{ .System }}
<</SYS>>

{{ .Prompt }} [/INST]
"""
```

---

### PARAMETER

Allows granular control over model behavior and sampling strategies.

```modelfile
PARAMETER temperature 0.7
PARAMETER num_ctx 8192
PARAMETER top_p 0.9
```

See [Parameter Reference](#parameter-reference) for complete list.

---

### LICENSE

Specifies the license under which the model is distributed.

```modelfile
LICENSE """
Apache License 2.0
Copyright 2024 LightDom
"""
```

---

### ADAPTER

Specifies a LoRA adapter to apply to the base model.

```modelfile
ADAPTER ./lora-adapter.gguf
```

---

### MESSAGE

Adds a message to the conversation history for context priming.

```modelfile
MESSAGE user "How can I optimize my website?"
MESSAGE assistant "I can help you with DOM optimization. Let me analyze your site structure..."
```

---

## Parameter Reference

### Generation Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `temperature` | float | 0.8 | 0.0 - 2.0 | Controls randomness. Higher = more creative, lower = more deterministic |
| `top_p` | float | 0.9 | 0.0 - 1.0 | Nucleus sampling - cumulative probability threshold |
| `top_k` | int | 40 | 0 - 100 | Limits vocabulary to top K tokens |
| `repeat_penalty` | float | 1.1 | 0.0 - 2.0 | Penalty for repeating tokens |
| `repeat_last_n` | int | 64 | 0 - 2048 | How far back to look for repetition |
| `presence_penalty` | float | 0.0 | -2.0 - 2.0 | Penalty for tokens already present |
| `frequency_penalty` | float | 0.0 | -2.0 - 2.0 | Penalty based on token frequency |
| `stop` | string[] | - | - | Stop sequences that halt generation |

### Context Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `num_ctx` | int | 2048 | 512 - 131072 | Context window size in tokens |
| `num_predict` | int | -1 | -2 - ∞ | Max tokens to generate (-1 = infinite, -2 = fill context) |
| `num_keep` | int | 0 | 0 - num_ctx | Number of tokens to keep from initial prompt |
| `num_batch` | int | 512 | 1 - num_ctx | Batch size for prompt processing |

### Mirostat Parameters (Perplexity Control)

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `mirostat` | int | 0 | 0, 1, 2 | Mirostat sampling mode (0 = disabled, 1 = v1, 2 = v2) |
| `mirostat_eta` | float | 0.1 | 0.0 - 1.0 | Learning rate for Mirostat |
| `mirostat_tau` | float | 5.0 | 0.0 - 10.0 | Target entropy for Mirostat |

### Hardware Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `num_gpu` | int | auto | Number of GPU layers to use (-1 = all) |
| `num_thread` | int | auto | Number of CPU threads |
| `main_gpu` | int | 0 | Primary GPU for computation |
| `low_vram` | bool | false | Reduce VRAM usage at cost of speed |
| `f16_kv` | bool | true | Use FP16 for key-value cache |
| `use_mmap` | bool | true | Memory-map model file |
| `use_mlock` | bool | false | Lock model in RAM |

### Advanced Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `seed` | int | -1 | Random seed (-1 = random) |
| `tfs_z` | float | 1.0 | Tail-free sampling parameter |
| `typical_p` | float | 1.0 | Locally typical sampling |
| `penalize_newline` | bool | true | Penalize newline tokens |

---

## Template Configuration

### Template Best Practices

1. **Match Training Format**: Use templates consistent with how the model was trained
2. **Include All Components**: Ensure system, user, and assistant sections are properly formatted
3. **Handle Edge Cases**: Use conditionals for optional fields

### DeepSeek R1 Template

```modelfile
TEMPLATE """{{- if .System }}
<|system|>{{ .System }}</s>
{{- end }}
{{- range .Messages }}
<|{{ .Role }}|>{{ .Content }}</s>
{{- end }}
<|assistant|>
"""
```

### Tool Calling Template

For models with function calling support:

```modelfile
TEMPLATE """{{ if .System }}<|im_start|>system
{{ .System }}
{{ if .Tools }}
Available tools:
{{ range .Tools }}
- {{ .Function.Name }}: {{ .Function.Description }}
{{ end }}
{{ end }}
<|im_end|>
{{ end }}{{ if .Prompt }}<|im_start|>user
{{ .Prompt }}<|im_end|>
{{ end }}<|im_start|>assistant
"""
```

---

## System Prompts

### Effective System Prompt Structure

```modelfile
SYSTEM """You are [ROLE/PERSONA].

## Capabilities
- [Capability 1]
- [Capability 2]

## Available Tools
You have access to the following tools:
- [Tool 1]: [Description]
- [Tool 2]: [Description]

## Response Guidelines
- [Guideline 1]
- [Guideline 2]

## Constraints
- [Constraint 1]
- [Constraint 2]
"""
```

### Example: LightDom Platform Assistant

```modelfile
SYSTEM """You are LightDom AI, an expert assistant for the LightDom DOM optimization and blockchain mining platform.

## Your Expertise
- DOM analysis and optimization
- Blockchain proof-of-optimization mining
- Web crawling and SEO automation
- Workflow orchestration and n8n integration
- Metaverse bridge management

## Available API Services
You can help users interact with these LightDom services:
- Crawler: Start/stop web crawling sessions
- Mining: Manage mining sessions and rewards
- Analytics: Access dashboard statistics and metrics
- Workflows: Create and manage automation workflows
- Metaverse: Configure bridges and chatrooms

## Response Style
- Be concise but comprehensive
- Provide code examples when helpful
- Reference API endpoints when appropriate
- Suggest automation workflows for repetitive tasks

## Constraints
- Only recommend actions within the user's permission level
- Always validate data before suggesting database operations
- Prioritize security in all recommendations
"""
```

---

## Tool Calling Configuration

### Enabling Tool Support

For models that support function calling (e.g., DeepSeek R1 0528+):

```modelfile
FROM deepseek-r1:14b

PARAMETER temperature 0.7
PARAMETER num_ctx 8192

SYSTEM """You are a helpful assistant with access to external tools.
When you need to perform an action, use the available tools by responding with a JSON tool call.
Always explain what you're doing before making a tool call.
"""

# Use a template that supports tool calling
TEMPLATE """{{ if .System }}<|im_start|>system
{{ .System }}
{{ if .Tools }}

# Available Tools
{{ range .Tools }}
## {{ .Function.Name }}
{{ .Function.Description }}
Parameters: {{ .Function.Parameters | tojson }}
{{ end }}
{{ end }}
<|im_end|>
{{ end }}{{ range .Messages }}
<|im_start|>{{ .Role }}
{{ .Content }}<|im_end|>
{{ end }}<|im_start|>assistant
"""
```

### Tool Definition Format

Tools are defined in JSON schema format when making API calls:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "start_crawler",
        "description": "Start a web crawling session for a target URL",
        "parameters": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "The target URL to crawl"
            },
            "depth": {
              "type": "integer",
              "description": "Maximum crawl depth"
            }
          },
          "required": ["url"]
        }
      }
    }
  ]
}
```

---

## LightDom Integration

### Creating a LightDom-Specific Model

See `config/ollama/Modelfile.lightdom-deepseek` for a complete example that integrates with LightDom's API services.

### Environment Configuration

```bash
# Set Ollama endpoint
export OLLAMA_ENDPOINT=http://localhost:11434

# Set default model
export OLLAMA_MODEL=lightdom-deepseek

# Create the custom model
ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek
```

### API Integration

```javascript
// Use the custom model with LightDom API
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'lightdom-deepseek',
    messages: [
      { role: 'user', content: 'Start crawling example.com' }
    ],
    tools: lightdomTools
  })
});
```

---

## Best Practices

### 1. Model Selection

- **For coding tasks**: Use `deepseek-coder` or `codellama`
- **For general chat**: Use `llama3.2` or `mistral`
- **For tool calling**: Use `deepseek-r1:14b` (0528+) or tool-enabled variants

### 2. Parameter Tuning

- **Creative tasks**: Higher temperature (0.8-1.0), higher top_p (0.95)
- **Factual tasks**: Lower temperature (0.1-0.3), lower top_p (0.7)
- **Code generation**: Moderate temperature (0.4-0.6)

### 3. Context Management

```modelfile
# For long conversations
PARAMETER num_ctx 16384

# For quick responses
PARAMETER num_ctx 4096
PARAMETER num_predict 512
```

### 4. Performance Optimization

```modelfile
# For GPU-constrained systems
PARAMETER num_gpu 24
PARAMETER low_vram true

# For multi-threaded CPU
PARAMETER num_thread 8
```

### 5. Reproducibility

```modelfile
# Set a fixed seed for reproducible outputs
PARAMETER seed 42
PARAMETER temperature 0
```

---

## Troubleshooting

### Common Issues

#### "Model does not support tools" Error
- Ensure you're using a tool-enabled model version (e.g., deepseek-r1 0528+)
- Check the template includes tool handling logic
- Verify Ollama is updated to the latest version

#### Poor Response Quality
- Check if the template matches the model's training format
- Adjust temperature and top_p parameters
- Review and refine the system prompt

#### Out of Memory Errors
- Reduce `num_ctx` parameter
- Enable `low_vram` mode
- Use a smaller model variant

#### Slow Generation
- Increase `num_gpu` layers
- Reduce `num_ctx` if not needed
- Enable Flash Attention if supported

### Debugging Commands

```bash
# Show current Modelfile
ollama show --modelfile modelname

# List installed models
ollama list

# Pull latest model version
ollama pull modelname:latest

# Remove and recreate model
ollama rm modelname
ollama create modelname -f Modelfile
```

---

## References

- [Ollama Official Documentation](https://docs.ollama.com/modelfile)
- [DeepSeek API Documentation](https://api-docs.deepseek.com)
- [Ollama Tool Support Blog](https://ollama.com/blog/tool-support)
- [LightDom API Documentation](./API_ENDPOINTS_INVENTORY.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-29  
**Author**: LightDom Development Team
