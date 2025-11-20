# Ollama Deepseek Integration - Quick Start Guide

## Overview

The LightDom platform now includes full Ollama DeepSeek integration, enabling AI-powered workflows, chat capabilities, and bidirectional streaming. This integration starts automatically with all services and provides a complete API for interacting with DeepSeek via Ollama.

## Prerequisites

### 1. Install Ollama

**macOS/Linux**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows**:
Download from [https://ollama.com](https://ollama.com)

### 2. Pull DeepSeek Model

```bash
ollama pull deepseek-r1:latest
```

> **Note**: The startup scripts will attempt to pull this model automatically if Ollama is installed.

## Starting Services

### Automatic Startup (All Services)

The Ollama service starts automatically with all LightDom services:

**Linux/Mac**:
```bash
./start-all-services.sh
```

**Windows (Command Prompt)**:
```batch
start-all-services.bat
```

**Windows (PowerShell)**:
```powershell
.\start-all-services.ps1
```

### Manual Startup (Ollama Only)

If you want to start Ollama separately:

```bash
ollama serve
```

The Ollama service will run on `http://localhost:11434`

## API Endpoints

All Ollama endpoints are available through the LightDom API server at `http://localhost:3001/api/ollama`

### Health & Status

#### Check Service Health
```bash
curl http://localhost:3001/api/ollama/health
```

**Response**:
```json
{
  "success": true,
  "status": "ok",
  "service": "Ollama DeepSeek",
  "details": {
    "initialized": true,
    "endpoint": "http://localhost:11434",
    "model": "deepseek-r1:latest",
    "toolsRegistered": 4,
    "activeStreams": 0,
    "conversations": 0
  }
}
```

#### Get Detailed Status
```bash
curl http://localhost:3001/api/ollama/status
```

### Chat & Generation

#### Simple Chat
Send a message and get a response with conversation history:

```bash
curl -X POST http://localhost:3001/api/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you help me create a workflow?",
    "conversationId": "my-conversation"
  }'
```

**Response**:
```json
{
  "success": true,
  "response": "Hello! I'd be happy to help you create a workflow...",
  "conversationId": "my-conversation"
}
```

#### Generate Text
Generate text from a prompt without conversation history:

```bash
curl -X POST http://localhost:3001/api/ollama/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain what a data mining workflow is in simple terms",
    "options": {
      "temperature": 0.7,
      "max_tokens": 500
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "response": "A data mining workflow is a structured process..."
}
```

### Streaming

#### Start Stream
Start a bidirectional conversation stream:

```bash
curl -X POST http://localhost:3001/api/ollama/stream/start \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream-123",
    "message": "Start analyzing this data",
    "systemPrompt": "You are a data analysis expert"
  }'
```

#### Send to Stream
Send additional messages to an active stream:

```bash
curl -X POST http://localhost:3001/api/ollama/stream/send \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream-123",
    "message": "Continue with the next step"
  }'
```

#### Stop Stream
```bash
curl -X POST http://localhost:3001/api/ollama/stream/stop \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream-123"
  }'
```

### Conversation Management

#### Get Conversation History
```bash
curl http://localhost:3001/api/ollama/conversation/my-conversation
```

**Response**:
```json
{
  "success": true,
  "conversationId": "my-conversation",
  "history": [
    {
      "role": "user",
      "content": "Hello!"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you?"
    }
  ]
}
```

#### Clear Conversation
```bash
curl -X DELETE http://localhost:3001/api/ollama/conversation/my-conversation
```

## WebSocket Streaming

For real-time streaming responses, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Start a stream
  ws.send(JSON.stringify({
    type: 'start',
    message: 'Tell me about data mining',
    systemPrompt: 'You are a helpful assistant'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'chunk') {
    // Stream chunk received
    console.log('Chunk:', data.content);
  } else if (data.type === 'complete') {
    // Stream completed
    console.log('Complete:', data.content);
  } else if (data.type === 'error') {
    // Error occurred
    console.error('Error:', data.error);
  }
};

// Send additional messages
ws.send(JSON.stringify({
  type: 'send',
  message: 'Tell me more'
}));

// Stop the stream
ws.send(JSON.stringify({
  type: 'stop'
}));
```

## Tool Calling

The Ollama DeepSeek integration includes built-in tools for:

1. **Workflow Creation** - Create workflows with steps and rules
2. **Database Queries** - Query workflow data and analytics
3. **Data Mining Campaigns** - Set up data mining operations
4. **Visual Components** - Add UI components to workflows

Example chat with tool usage:

```bash
curl -X POST http://localhost:3001/api/ollama/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a workflow named \"SEO Analysis\" with steps for crawling, analyzing, and reporting"
  }'
```

The AI will automatically call the `create_workflow` tool and return the created workflow.

## Frontend Integration

Use the provided React hook in your components:

```typescript
import { useOllamaChat } from '@/hooks/useOllamaChat';

function MyComponent() {
  const {
    messages,
    isStreaming,
    isConnected,
    sendMessage,
    clearConversation
  } = useOllamaChat({
    streamingEnabled: true,
    toolsEnabled: true,
    onWorkflowCreated: (workflow) => {
      console.log('Workflow created:', workflow);
    }
  });

  const handleSubmit = async () => {
    await sendMessage('Create a data mining workflow');
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={isStreaming}>
        Send Message
      </button>
    </div>
  );
}
```

## Troubleshooting

### Ollama Not Found

If you see warnings about Ollama not being installed:

1. Install Ollama from [https://ollama.com](https://ollama.com)
2. Restart the services
3. Verify installation: `ollama --version`

### Service Not Responding

Check if Ollama is running:

```bash
curl http://localhost:11434/api/tags
```

If not running, start manually:

```bash
ollama serve
```

### Model Not Found

Pull the DeepSeek model:

```bash
ollama pull deepseek-r1:latest
```

Verify models:

```bash
ollama list
```

### API Errors

Check the API server logs for detailed error messages. The Ollama routes will gracefully handle missing service and return helpful error messages.

## Environment Variables

Configure Ollama integration via environment variables:

```bash
# Ollama endpoint (default: http://localhost:11434)
OLLAMA_ENDPOINT=http://localhost:11434

# Model to use (default: deepseek-r1:latest)
OLLAMA_MODEL=deepseek-r1:latest

# Enable/disable features
OLLAMA_STREAMING_ENABLED=true
OLLAMA_TOOLS_ENABLED=true
```

## Advanced Usage

### Custom Tool Registration

Register custom tools for DeepSeek to use:

```javascript
import { OllamaDeepSeekIntegration } from './src/ai/OllamaDeepSeekIntegration';

const ollama = new OllamaDeepSeekIntegration();
await ollama.initialize();

ollama.registerTool({
  type: 'function',
  function: {
    name: 'custom_analysis',
    description: 'Perform custom data analysis',
    parameters: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'Data to analyze' }
      },
      required: ['data']
    }
  }
}, async (args) => {
  // Your custom tool logic
  return { result: 'Analysis complete' };
});
```

### Batch Processing

Process multiple prompts efficiently:

```javascript
const prompts = [
  'Analyze workflow performance',
  'Generate SEO report',
  'Create data mining config'
];

const results = await Promise.all(
  prompts.map(prompt => 
    fetch('http://localhost:3001/api/ollama/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    }).then(r => r.json())
  )
);
```

## Next Steps

- Explore the [Ollama documentation](https://ollama.com/docs)
- Review the [DeepSeek model capabilities](https://ollama.com/library/deepseek-r1)
- Check out the example workflows in `/examples/deepseek-workflow-integration.js`
- Read the full API documentation in `OLLAMA_DEEPSEEK_GUIDE.md`

## Support

For issues or questions:
- Check the logs: `/tmp/ollama.log` (Linux/Mac) or the Ollama window (Windows)
- Review API server logs for integration errors
- Open an issue on GitHub with "Ollama" in the title
