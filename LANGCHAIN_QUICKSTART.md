# LangChain + Ollama DeepSeek Quick Start

Get started with the LangChain + Ollama DeepSeek integration in under 5 minutes!

## Prerequisites

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [https://ollama.com](https://ollama.com)

### 2. Pull DeepSeek Model

```bash
ollama pull deepseek-r1:latest
```

Verify installation:
```bash
ollama list
```

You should see `deepseek-r1:latest` in the list.

## Quick Start

### 1. Start the API Server

```bash
npm run api
```

The LangChain service will automatically initialize at startup.

### 2. Test the Integration

Run the comprehensive test suite:

```bash
npm run langchain:test
```

### 3. Try Examples

Run practical examples:

```bash
npm run langchain:examples
```

### 4. Check Service Health

```bash
npm run langchain:health
```

Expected output:
```json
{
  "success": true,
  "service": "LangChain Ollama Integration",
  "status": "healthy",
  "config": {
    "baseUrl": "http://localhost:11434",
    "model": "deepseek-r1:latest",
    "temperature": 0.7
  }
}
```

## Basic Usage

### JavaScript/Node.js

```javascript
import { getLangChainOllamaService } from './services/langchain-ollama-service.js';

// Get service instance
const service = getLangChainOllamaService();

// Simple chat
const response = await service.chat('Hello! Explain quantum computing.');
console.log(response.response);

// Conversational chat with history
const conv = await service.conversationalChat(
  'My name is Alice',
  'session-1'
);

// Code generation
const code = await service.generateCode(
  'Create a React component for a todo list',
  'javascript'
);
console.log(code.response);
```

### REST API

**Simple Chat:**
```bash
curl -X POST http://localhost:3001/api/langchain/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**Conversational Chat:**
```bash
curl -X POST http://localhost:3001/api/langchain/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain async/await in JavaScript",
    "sessionId": "my-session"
  }'
```

**Code Generation:**
```bash
curl -X POST http://localhost:3001/api/langchain/generate/code \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a function to sort an array",
    "language": "python"
  }'
```

## Available npm Scripts

```bash
# Test the integration
npm run langchain:test

# Run examples
npm run langchain:examples

# Check health
npm run langchain:health

# View metrics
npm run langchain:metrics

# List sessions
npm run langchain:sessions
```

## React UI Component

Import the dashboard component in your React app:

```jsx
import LangChainOllamaDashboard from './components/LangChainOllamaDashboard';

function App() {
  return (
    <div>
      <LangChainOllamaDashboard />
    </div>
  );
}
```

## Common Use Cases

### 1. Chat Assistant

```javascript
const service = getLangChainOllamaService();

// Create a persistent session
const sessionId = 'user-123-support';

// Chat with context
await service.conversationalChat(
  'I need help with my React app',
  sessionId,
  'You are a helpful React developer'
);

// Follow-up questions maintain context
await service.conversationalChat(
  'It crashes when I click the button',
  sessionId
);
```

### 2. Code Helper

```javascript
// Generate code
const result = await service.generateCode(
  'Create a debounce function',
  'typescript',
  'Use generics for type safety'
);

console.log(result.response);
```

### 3. Workflow Automation

```javascript
const workflow = await service.generateWorkflow(
  'Email verification workflow',
  [
    'Send verification code',
    'User enters code',
    'Validate code',
    'Mark email as verified'
  ]
);

console.log(workflow.response);
```

### 4. DOM Optimization

```javascript
const analysis = await service.analyzeDOMOptimization(
  { totalNodes: 1500, depth: 12, scripts: 25 },
  { loadTime: 3500, renderTime: 1200 }
);

console.log(analysis.response);
```

## Configuration

Update `.env` file:

```env
# Ollama Configuration
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=2048
OLLAMA_TOP_P=0.9

# LangChain Settings
LANGCHAIN_API_ENABLED=true
LANGCHAIN_STREAMING_ENABLED=true
LANGCHAIN_CONVERSATION_HISTORY_ENABLED=true
LANGCHAIN_MAX_HISTORY_LENGTH=50
```

## Troubleshooting

### "Failed to connect to Ollama"

1. Check if Ollama is running:
```bash
ollama list
```

2. Start Ollama if needed:
```bash
ollama serve
```

3. Test Ollama directly:
```bash
curl http://localhost:11434/api/tags
```

### "Model not found"

Pull the DeepSeek model:
```bash
ollama pull deepseek-r1:latest
```

### Slow Responses

Try a smaller model:
```bash
ollama pull deepseek-r1:7b
```

Update config:
```javascript
service.setModel('deepseek-r1:7b');
```

## Next Steps

1. **Read the Full Guide**: See [LANGCHAIN_OLLAMA_INTEGRATION_GUIDE.md](./LANGCHAIN_OLLAMA_INTEGRATION_GUIDE.md)
2. **Explore Examples**: Run `npm run langchain:examples`
3. **Try the UI**: Open the React dashboard component
4. **Build Your App**: Use the service in your application
5. **Monitor Performance**: Check metrics regularly

## Need Help?

- Check the [Integration Guide](./LANGCHAIN_OLLAMA_INTEGRATION_GUIDE.md)
- Run the test suite: `npm run langchain:test`
- View API docs: `http://localhost:3001/api-docs` (if Swagger is enabled)
- Check service health: `npm run langchain:health`

## What's Next?

The integration provides everything you need to build AI-powered features:

- ✅ **Chat & Conversations**: Multi-turn dialogues with context
- ✅ **Code Generation**: AI-powered code creation
- ✅ **Workflow Automation**: Natural language to workflows
- ✅ **Analysis & Optimization**: DOM and performance analysis
- ✅ **Custom Chains**: Flexible prompt engineering

Happy coding! 🚀
