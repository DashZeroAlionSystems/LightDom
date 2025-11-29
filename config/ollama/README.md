# LightDom Ollama Modelfile Configuration

This directory contains custom Ollama Modelfiles for the LightDom platform, enabling AI-powered interactions with platform services.

## Quick Start

### Prerequisites

1. **Install Ollama**:
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Or download from https://ollama.com
   ```

2. **Start Ollama Service**:
   ```bash
   ollama serve
   ```

3. **Pull Base Model**:
   ```bash
   # For full version (requires ~16GB RAM)
   ollama pull deepseek-r1:14b
   
   # For lite version (requires ~8GB RAM)
   ollama pull deepseek-coder:6.7b
   ```

### Create Custom Models

```bash
# Full-featured LightDom model
ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek

# Lite version for limited resources
ollama create lightdom-deepseek-lite -f config/ollama/Modelfile.lightdom-deepseek-lite
```

### Verify Installation

```bash
# List models
ollama list

# Test the model
ollama run lightdom-deepseek "What LightDom services can you help me with?"
```

## Available Modelfiles

### 1. Modelfile.lightdom-deepseek (Full)

**Base Model**: `deepseek-r1:14b`  
**Context Size**: 16,384 tokens  
**RAM Required**: ~16GB  
**GPU VRAM**: 12GB+ recommended

**Features**:
- Full LightDom API endpoint documentation
- Complete tool-calling support
- Comprehensive system prompt
- Optimized for complex workflows

**Best For**:
- Production use
- Complex multi-step tasks
- Detailed API interactions
- Tool-calling applications

### 2. Modelfile.lightdom-deepseek-lite (Lite)

**Base Model**: `deepseek-coder:6.7b`  
**Context Size**: 4,096 tokens  
**RAM Required**: ~8GB  
**GPU VRAM**: 6GB+ recommended

**Features**:
- Condensed API documentation
- Basic tool-calling support
- Streamlined system prompt
- Faster response times

**Best For**:
- Development and testing
- Limited hardware resources
- Quick queries
- Basic API assistance

## Modelfile Parameters Reference

### Generation Parameters

| Parameter | Full | Lite | Description |
|-----------|------|------|-------------|
| `temperature` | 0.7 | 0.6 | Controls randomness |
| `top_p` | 0.9 | 0.85 | Nucleus sampling |
| `top_k` | 40 | 30 | Top-k sampling |
| `repeat_penalty` | 1.1 | 1.1 | Repetition penalty |

### Context Parameters

| Parameter | Full | Lite | Description |
|-----------|------|------|-------------|
| `num_ctx` | 16384 | 4096 | Context window size |
| `num_predict` | -1 | 1024 | Max tokens to generate |
| `num_batch` | 512 | 256 | Batch size |

See [OLLAMA_MODELFILE_CONFIGURATION.md](../../docs/OLLAMA_MODELFILE_CONFIGURATION.md) for complete parameter documentation.

## Tool-Calling Support

The LightDom Modelfiles include support for tool/function calling. The model can generate structured JSON tool calls to interact with LightDom APIs.

### Example Tool Call

When you ask the model to perform an action:

```
User: Start crawling https://example.com with depth 3
```

The model may respond with:

```json
{
  "tool_call": {
    "name": "start_crawler",
    "arguments": {
      "url": "https://example.com",
      "depth": 3
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `start_crawler` | Start a web crawling session |
| `get_crawler_status` | Get crawler status |
| `create_mining_session` | Create mining session |
| `get_mining_stats` | Get mining statistics |
| `query_analytics` | Query analytics data |
| `manage_bridge` | Manage metaverse bridges |

### Testing Tool Calling

```bash
# Run the test suite
node test-ollama-tool-calling.js

# Test with specific model
node test-ollama-tool-calling.js --model lightdom-deepseek

# Test with custom endpoint
node test-ollama-tool-calling.js --endpoint http://localhost:11434
```

## API Integration

### Using with LightDom API Server

```javascript
// Chat with the model
const response = await fetch('http://localhost:3001/api/ollama/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Start crawling example.com',
    model: 'lightdom-deepseek'
  })
});
```

### Direct Ollama API Usage

```javascript
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'lightdom-deepseek',
    messages: [{ role: 'user', content: 'Help me with mining' }],
    stream: false
  })
});
```

## Customization

### Creating Your Own Modelfile

1. Copy an existing Modelfile as a template:
   ```bash
   cp config/ollama/Modelfile.lightdom-deepseek config/ollama/Modelfile.my-custom
   ```

2. Edit the file to customize:
   - Change the `FROM` directive for a different base model
   - Adjust `PARAMETER` values for different behavior
   - Modify the `SYSTEM` prompt for specialized use cases
   - Update the `TEMPLATE` for different formatting

3. Create your custom model:
   ```bash
   ollama create my-custom-model -f config/ollama/Modelfile.my-custom
   ```

### Key Customization Points

**For Faster Responses**:
```modelfile
PARAMETER temperature 0.3
PARAMETER num_ctx 2048
PARAMETER num_predict 512
```

**For More Creative Outputs**:
```modelfile
PARAMETER temperature 0.9
PARAMETER top_p 0.95
PARAMETER mirostat 0
```

**For Reproducible Outputs**:
```modelfile
PARAMETER temperature 0
PARAMETER seed 42
```

## Troubleshooting

### Model Not Found

```bash
# Check if model exists
ollama list

# Recreate the model
ollama rm lightdom-deepseek
ollama create lightdom-deepseek -f config/ollama/Modelfile.lightdom-deepseek
```

### Out of Memory

- Use the lite version: `lightdom-deepseek-lite`
- Reduce context: Edit Modelfile and set `PARAMETER num_ctx 2048`
- Enable low VRAM mode: Add `PARAMETER low_vram true`

### Tool Calling Not Working

1. Ensure you're using a compatible base model (DeepSeek R1 0528+)
2. Check the template includes tool handling logic
3. Update Ollama to the latest version: `ollama --version`

### Slow Response Times

- Reduce `num_ctx` parameter
- Use the lite model variant
- Ensure GPU is being utilized: check `ollama ps`

## Related Documentation

- [Full Modelfile Configuration Guide](../../docs/OLLAMA_MODELFILE_CONFIGURATION.md)
- [Ollama Integration Guide](../../docs/OLLAMA_INTEGRATION_GUIDE.md)
- [Ollama MCP Setup](../../docs/OLLAMA_MCP_SETUP.md)
- [DeepSeek MCP Tools Guide](../../DEEPSEEK_MCP_TOOLS_GUIDE.md)

## Environment Variables

```bash
# Ollama endpoint
export OLLAMA_ENDPOINT=http://localhost:11434

# Default model
export OLLAMA_MODEL=lightdom-deepseek

# Enable debug logging
export OLLAMA_DEBUG=1
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-29  
**Maintainer**: LightDom Development Team
