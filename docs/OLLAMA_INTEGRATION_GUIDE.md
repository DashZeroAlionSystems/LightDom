# Ollama Integration Guide

## Overview

This guide explains how to integrate Ollama DeepSeek-R1 for AI-powered workflow and component generation in the LightDom platform.

## Setup

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Start Ollama Service

```bash
ollama serve
```

The service will start on `http://localhost:11434`

### 3. Pull DeepSeek-R1 Model

```bash
ollama pull deepseek-r1
```

## Usage in LightDom

### Service Integration

The `OllamaService` class provides a typed interface for Ollama API:

```typescript
import { ollamaService, checkOllamaService } from '@/services/ollama-service';

// Check if service is available
const { available, message } = await checkOllamaService();

if (available) {
  // Service is running
}
```

### Workflow Generation

Generate workflow configurations from natural language:

```typescript
const config = await ollamaService.generateWorkflowConfig(
  "Create a data mining workflow for competitor analysis",
  ['dataMining', 'seoAnalysis']
);

// Returns:
{
  name: "competitor-analysis-workflow",
  description: "Data mining and SEO analysis for competitors",
  steps: [...],
  schemas: {...}
}
```

### Component Bundle Generation

Generate component bundles with AI:

```typescript
const bundle = await ollamaService.generateComponentBundleConfig(
  "Analytics dashboard with real-time metrics",
  ['stat-card', 'line-chart', 'data-table'],
  true // mock data enabled
);

// Returns:
{
  name: "analytics-dashboard",
  description: "Real-time analytics dashboard",
  components: [...],
  dataSources: [...],
  mockData: true
}
```

### Custom Generation

For custom prompts:

```typescript
const response = await ollamaService.generate({
  prompt: "Your custom prompt here",
  model: "deepseek-r1",
  temperature: 0.7,
  top_p: 0.9,
});
```

## API Endpoints

### Check Service Health

```bash
curl http://localhost:11434/api/tags
```

### Generate Text

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1",
  "prompt": "Generate a workflow configuration",
  "stream": false
}'
```

### List Models

```bash
curl http://localhost:11434/api/tags
```

## Configuration

Default configuration in `OllamaService`:

```typescript
{
  baseUrl: 'http://localhost:11434',
  defaultModel: 'deepseek-r1',
  temperature: 0.7,
  top_p: 0.9
}
```

Override in constructor:

```typescript
const service = new OllamaService('http://custom-host:11434', 'custom-model');
```

## Error Handling

The service includes built-in error handling:

```typescript
try {
  const config = await ollamaService.generateWorkflowConfig(prompt, parts);
} catch (error) {
  if (error.message.includes('not running')) {
    // Show user: "Please start Ollama service"
  } else {
    // Handle other errors
  }
}
```

## UI Integration

### Workflow Dashboard

1. User enters prompt in PromptInput
2. Click "Send" triggers generation
3. Loading state shows during API call
4. Generated config displayed in diagram view

```typescript
const handlePromptSend = async (prompt: string) => {
  setGenerating(true);
  try {
    const config = await ollamaService.generateWorkflowConfig(
      prompt,
      selectedParts
    );
    setGeneratedConfig(config);
  } catch (error) {
    alert('Failed to generate workflow');
  } finally {
    setGenerating(false);
  }
};
```

### Component Bundler

Same pattern for component bundles:

```typescript
const config = await ollamaService.generateComponentBundleConfig(
  prompt,
  selectedComponents,
  mockDataEnabled
);
```

## Troubleshooting

### Service Not Available

**Error**: "Ollama service is not running"

**Solution**: Start Ollama service:
```bash
ollama serve
```

### Model Not Found

**Error**: "model 'deepseek-r1' not found"

**Solution**: Pull the model:
```bash
ollama pull deepseek-r1
```

### JSON Parsing Error

**Error**: "Failed to parse workflow configuration"

**Solution**: The AI response may not be valid JSON. The service automatically extracts JSON from responses, but you may need to adjust the prompt for clearer output.

### Timeout

**Error**: Request timeout

**Solution**: Increase timeout or use smaller prompts:
```typescript
const response = await fetch(url, {
  ...options,
  signal: AbortSignal.timeout(60000) // 60 seconds
});
```

## Best Practices

### 1. Always Check Service Health

```typescript
const { available } = await checkOllamaService();
if (!available) {
  // Show error message to user
  return;
}
```

### 2. Provide Clear Prompts

Good:
```
"Create a workflow for mining tech blog data and analyzing SEO strategies with competitor comparison"
```

Bad:
```
"make workflow"
```

### 3. Handle Errors Gracefully

```typescript
try {
  const config = await ollamaService.generate(...);
} catch (error) {
  // Show user-friendly error message
  toast.error('Failed to generate configuration. Please try again.');
}
```

### 4. Use Loading States

```typescript
const [generating, setGenerating] = useState(false);

// In UI
<PromptInput loading={generating} ... />
```

### 5. Validate Generated Config

```typescript
const config = await ollamaService.generateWorkflowConfig(...);

// Validate required fields
if (!config.name || !config.steps || config.steps.length === 0) {
  throw new Error('Invalid configuration generated');
}
```

## Advanced Usage

### Custom Models

```typescript
// Use different model
const response = await ollamaService.generate({
  prompt: "...",
  model: "llama2" // or other installed model
});
```

### Streaming Responses

For real-time streaming (future enhancement):

```typescript
// Not yet implemented
const stream = await ollamaService.generateStream({
  prompt: "...",
  onChunk: (chunk) => {
    // Update UI with each chunk
  }
});
```

### Fine-tuning Parameters

```typescript
const response = await ollamaService.generate({
  prompt: "...",
  temperature: 0.9,  // More creative (0.0-1.0)
  top_p: 0.95,       // Nucleus sampling
  max_tokens: 2000,  // Limit response length
});
```

## Performance Optimization

### 1. Prompt Caching

Cache common prompts to reduce API calls:

```typescript
const promptCache = new Map();

async function generateWithCache(prompt: string) {
  if (promptCache.has(prompt)) {
    return promptCache.get(prompt);
  }
  
  const result = await ollamaService.generate({ prompt });
  promptCache.set(prompt, result);
  return result;
}
```

### 2. Debounce Requests

Prevent excessive API calls:

```typescript
import { debounce } from 'lodash';

const debouncedGenerate = debounce(async (prompt) => {
  const result = await ollamaService.generate({ prompt });
  // Update UI
}, 500);
```

### 3. Parallel Generation

Generate multiple configs simultaneously:

```typescript
const [workflow, components] = await Promise.all([
  ollamaService.generateWorkflowConfig(prompt1, parts1),
  ollamaService.generateComponentBundleConfig(prompt2, parts2, true)
]);
```

## Security Considerations

### 1. Validate Input

```typescript
function validatePrompt(prompt: string): boolean {
  // Check length
  if (prompt.length > 2000) return false;
  
  // Check for malicious content
  const dangerous = ['<script>', 'eval(', 'Function('];
  return !dangerous.some(d => prompt.includes(d));
}
```

### 2. Sanitize Output

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(generatedConfig.description);
```

### 3. Rate Limiting

Implement rate limiting on API routes:

```typescript
// In API route
const rateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Future Enhancements

- [ ] Streaming responses for real-time feedback
- [ ] Multi-model support with automatic fallback
- [ ] Conversation history for context-aware generation
- [ ] Fine-tuned models for specific use cases
- [ ] Prompt templates library
- [ ] A/B testing for prompt optimization

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-02  
**Status**: Production Ready
