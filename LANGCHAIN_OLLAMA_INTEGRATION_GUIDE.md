# LangChain + Ollama DeepSeek Integration Guide

## 🚀 Overview

This guide provides comprehensive documentation for the LangChain + Ollama DeepSeek integration in the LightDom platform. This integration combines the power of LangChain's orchestration capabilities with Ollama's local LLM serving and DeepSeek's advanced coding models.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)
- [Integration Patterns](#integration-patterns)
- [Troubleshooting](#troubleshooting)
- [Performance Tuning](#performance-tuning)

---

## ✨ Features

### Core Capabilities
- **Simple Chat**: Single-turn conversations without history
- **Conversational Chat**: Multi-turn conversations with context management
- **Streaming Responses**: Real-time token streaming via Server-Sent Events
- **Code Generation**: Specialized code generation with language support
- **Workflow Generation**: Automated workflow creation from natural language
- **DOM Optimization**: AI-powered DOM structure analysis
- **Custom Chains**: Flexible prompt templating with LangChain

### Management Features
- **Session Management**: Multiple concurrent conversation sessions
- **History Management**: Persistent conversation context
- **Metrics & Monitoring**: Real-time performance tracking
- **Dynamic Configuration**: Runtime model and parameter updates
- **Health Monitoring**: Continuous service health checks

---

## 📦 Prerequisites

### 1. Ollama Installation

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [https://ollama.com](https://ollama.com)

### 2. Pull DeepSeek Model

```bash
# Latest DeepSeek R1 model (recommended)
ollama pull deepseek-r1:latest

# Alternative: DeepSeek Coder
ollama pull deepseek-coder

# Alternative: Smaller variant
ollama pull deepseek-r1:7b
```

### 3. Verify Ollama is Running

```bash
ollama list
```

---

## 🔧 Installation

### 1. Install Dependencies

The LangChain dependencies are already included when you run:

```bash
npm install
```

If you need to install them separately:

```bash
npm install --legacy-peer-deps @langchain/core @langchain/community @langchain/ollama langchain
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

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
LANGCHAIN_VERBOSE=false
LANGCHAIN_TRACING_ENABLED=false
```

---

## 🚀 Quick Start

### Starting the Service

The LangChain Ollama service is automatically initialized when you start the LightDom API server:

```bash
# Start full development environment
npm run dev:full

# Or start just the API server
npm run api
```

### Basic Usage Example

```javascript
import { getLangChainOllamaService } from './services/langchain-ollama-service.js';

// Get service instance
const service = getLangChainOllamaService();

// Simple chat
const response = await service.chat('Hello! What can you help me with?');
console.log(response.response);

// Conversational chat with history
const conv1 = await service.conversationalChat('My name is Alice', 'session-1');
const conv2 = await service.conversationalChat('What is my name?', 'session-1');
console.log(conv2.response); // Should mention "Alice"
```

### Testing the Integration

Run the comprehensive test suite:

```bash
node test-langchain-ollama-integration.js
```

---

## 📚 API Reference

### Service Methods

#### `chat(message, options)`
Simple single-turn chat without history.

**Parameters:**
- `message` (string): The user message
- `options` (object, optional): Additional options

**Returns:** Promise<ChatResponse>

```javascript
const result = await service.chat('Explain quantum computing');
```

---

#### `conversationalChat(message, sessionId, systemPrompt)`
Multi-turn conversation with context management.

**Parameters:**
- `message` (string): The user message
- `sessionId` (string, optional): Session identifier (default: 'default')
- `systemPrompt` (string, optional): System-level instructions

**Returns:** Promise<ConversationResponse>

```javascript
const result = await service.conversationalChat(
  'Help me debug this code',
  'debug-session-1',
  'You are an expert debugging assistant'
);
```

---

#### `chatStream(message, options)`
Streaming chat with real-time tokens.

**Parameters:**
- `message` (string): The user message
- `options` (object, optional): Additional options

**Returns:** AsyncGenerator<string>

```javascript
for await (const chunk of service.chatStream('Write a story')) {
  process.stdout.write(chunk);
}
```

---

#### `generateCode(description, language, context)`
Specialized code generation.

**Parameters:**
- `description` (string): Code requirements
- `language` (string, optional): Programming language (default: 'javascript')
- `context` (string, optional): Additional context

**Returns:** Promise<CodeResponse>

```javascript
const result = await service.generateCode(
  'Create a binary search algorithm',
  'python',
  'Should handle edge cases'
);
```

---

#### `generateWorkflow(description, requirements)`
Workflow generation from natural language.

**Parameters:**
- `description` (string): Workflow description
- `requirements` (array, optional): List of requirements

**Returns:** Promise<WorkflowResponse>

```javascript
const result = await service.generateWorkflow(
  'ETL pipeline for customer data',
  ['Validate input', 'Transform fields', 'Load to database']
);
```

---

#### `analyzeDOMOptimization(domStructure, metrics)`
DOM optimization analysis.

**Parameters:**
- `domStructure` (object): DOM structure information
- `metrics` (object): Performance metrics

**Returns:** Promise<AnalysisResponse>

```javascript
const result = await service.analyzeDOMOptimization(
  { totalNodes: 1500, depth: 12, scripts: 20 },
  { loadTime: 3500, renderTime: 1200 }
);
```

---

#### `processWithChain(input, templateString, variables)`
Custom chain processing with prompt templates.

**Parameters:**
- `input` (string): Primary input
- `templateString` (string): LangChain template
- `variables` (object, optional): Template variables

**Returns:** Promise<ChainResponse>

```javascript
const result = await service.processWithChain(
  'best practices',
  'You are a {role}. Answer: {question}',
  { role: 'architect', question: 'What are microservices best practices?' }
);
```

---

### Session Management

#### `listSessions()`
Get all active conversation sessions.

**Returns:** Array<SessionInfo>

```javascript
const sessions = service.listSessions();
// [{ sessionId: 'session-1', messageCount: 10, lastActivity: '...' }]
```

---

#### `getConversationHistory(sessionId)`
Retrieve conversation history for a session.

**Returns:** Array<Message>

```javascript
const history = service.getConversationHistory('session-1');
```

---

#### `clearConversationHistory(sessionId)`
Clear history for one or all sessions.

**Parameters:**
- `sessionId` (string, optional): Session to clear (omit to clear all)

```javascript
service.clearConversationHistory('session-1'); // Clear one
service.clearConversationHistory(); // Clear all
```

---

### Configuration Management

#### `setModel(modelName)`
Change the active model.

**Parameters:**
- `modelName` (string): New model name

```javascript
service.setModel('deepseek-coder');
```

---

#### `updateConfig(newConfig)`
Update service configuration.

**Parameters:**
- `newConfig` (object): Configuration updates

```javascript
service.updateConfig({
  temperature: 0.8,
  maxTokens: 4096,
});
```

---

#### `getMetrics()`
Get performance metrics.

**Returns:** MetricsObject

```javascript
const metrics = service.getMetrics();
// {
//   totalRequests: 150,
//   successfulRequests: 145,
//   failedRequests: 5,
//   successRate: '96.67%',
//   averageResponseTime: 1250,
//   activeSessions: 3
// }
```

---

#### `getStatus()`
Check service health.

**Returns:** Promise<StatusObject>

```javascript
const status = await service.getStatus();
```

---

## 🌐 REST API Endpoints

All endpoints are available at `http://localhost:3001/api/langchain/*`

### Health & Status

**GET** `/api/langchain/health`
```bash
curl http://localhost:3001/api/langchain/health
```

**GET** `/api/langchain/metrics`
```bash
curl http://localhost:3001/api/langchain/metrics
```

---

### Chat Endpoints

**POST** `/api/langchain/chat`
```bash
curl -X POST http://localhost:3001/api/langchain/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

**POST** `/api/langchain/conversation`
```bash
curl -X POST http://localhost:3001/api/langchain/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My name is Alice",
    "sessionId": "session-1",
    "systemPrompt": "You are a helpful assistant"
  }'
```

**POST** `/api/langchain/chat/stream`
```bash
curl -X POST http://localhost:3001/api/langchain/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a story"}' \
  --no-buffer
```

---

### Generation Endpoints

**POST** `/api/langchain/generate/code`
```bash
curl -X POST http://localhost:3001/api/langchain/generate/code \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a function to sort an array",
    "language": "javascript",
    "context": "Use modern ES6+ syntax"
  }'
```

**POST** `/api/langchain/generate/workflow`
```bash
curl -X POST http://localhost:3001/api/langchain/generate/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "description": "User onboarding workflow",
    "requirements": ["Email verification", "Profile setup", "Welcome email"]
  }'
```

---

### Analysis Endpoints

**POST** `/api/langchain/analyze/dom`
```bash
curl -X POST http://localhost:3001/api/langchain/analyze/dom \
  -H "Content-Type: application/json" \
  -d '{
    "domStructure": {"totalNodes": 1500, "depth": 12},
    "metrics": {"loadTime": 3500, "renderTime": 1200}
  }'
```

---

### Session Management Endpoints

**GET** `/api/langchain/sessions`
```bash
curl http://localhost:3001/api/langchain/sessions
```

**GET** `/api/langchain/session/:sessionId/history`
```bash
curl http://localhost:3001/api/langchain/session/session-1/history
```

**DELETE** `/api/langchain/session/:sessionId`
```bash
curl -X DELETE http://localhost:3001/api/langchain/session/session-1
```

**DELETE** `/api/langchain/sessions`
```bash
curl -X DELETE http://localhost:3001/api/langchain/sessions
```

---

### Configuration Endpoints

**PUT** `/api/langchain/config`
```bash
curl -X PUT http://localhost:3001/api/langchain/config \
  -H "Content-Type: application/json" \
  -d '{"temperature": 0.8, "maxTokens": 4096}'
```

**PUT** `/api/langchain/model`
```bash
curl -X PUT http://localhost:3001/api/langchain/model \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-coder"}'
```

---

## 💡 Usage Examples

### Example 1: Building a Code Assistant

```javascript
const service = getLangChainOllamaService();

async function codeAssistant(userRequest) {
  // Generate code
  const codeResult = await service.generateCode(
    userRequest,
    'javascript',
    'Modern ES6+, TypeScript compatible'
  );
  
  console.log('Generated Code:', codeResult.response);
  
  // Start a conversation for refinement
  const sessionId = `code-session-${Date.now()}`;
  
  const refinement = await service.conversationalChat(
    'Can you explain this code and suggest improvements?',
    sessionId,
    'You are an expert code reviewer'
  );
  
  console.log('Code Review:', refinement.response);
}

codeAssistant('Create a debounce function');
```

---

### Example 2: DOM Optimization Pipeline

```javascript
async function optimizeDOMPipeline(domData, performanceMetrics) {
  const service = getLangChainOllamaService();
  
  // Analyze current DOM
  const analysis = await service.analyzeDOMOptimization(
    domData,
    performanceMetrics
  );
  
  console.log('Optimization Analysis:', analysis.response);
  
  // Generate optimization workflow
  const workflow = await service.generateWorkflow(
    'DOM optimization workflow',
    ['Identify bottlenecks', 'Apply lazy loading', 'Minimize reflows']
  );
  
  console.log('Optimization Workflow:', workflow.response);
  
  return { analysis, workflow };
}
```

---

### Example 3: Interactive Support Bot

```javascript
class SupportBot {
  constructor() {
    this.service = getLangChainOllamaService();
    this.sessionId = `support-${Date.now()}`;
  }
  
  async start() {
    await this.service.conversationalChat(
      'Initialize support session',
      this.sessionId,
      'You are a helpful technical support agent for LightDom platform'
    );
  }
  
  async askQuestion(question) {
    const response = await this.service.conversationalChat(
      question,
      this.sessionId
    );
    return response.response;
  }
  
  async getHistory() {
    return this.service.getConversationHistory(this.sessionId);
  }
  
  async endSession() {
    this.service.clearConversationHistory(this.sessionId);
  }
}

// Usage
const bot = new SupportBot();
await bot.start();
const answer = await bot.askQuestion('How do I optimize my website?');
console.log(answer);
```

---

## 🔗 Integration Patterns

### Pattern 1: Integrating with Existing DeepSeek Services

```javascript
import { getLangChainOllamaService } from './services/langchain-ollama-service.js';
import { DeepSeekService } from './services/deepseek-api-service.js';

// Use LangChain for local processing
const langchainService = getLangChainOllamaService();
const localResult = await langchainService.chat('Quick local task');

// Use DeepSeek API for advanced features
const deepseekService = new DeepSeekService();
const advancedResult = await deepseekService.chat('Complex reasoning task');
```

---

### Pattern 2: RAG (Retrieval Augmented Generation)

```javascript
// Future enhancement: Vector store integration
async function ragQuery(question, context) {
  const service = getLangChainOllamaService();
  
  const template = `Based on the following context, answer the question.
  
Context: {context}

Question: {question}

Provide a detailed answer based only on the context provided.`;

  return service.processWithChain(question, template, { context });
}
```

---

### Pattern 3: Multi-Agent Workflow

```javascript
async function multiAgentWorkflow(task) {
  const service = getLangChainOllamaService();
  
  // Agent 1: Planner
  const plan = await service.conversationalChat(
    `Create a plan for: ${task}`,
    'planner-session',
    'You are a strategic planner'
  );
  
  // Agent 2: Executor
  const execution = await service.conversationalChat(
    `Execute this plan: ${plan.response}`,
    'executor-session',
    'You are a detail-oriented executor'
  );
  
  // Agent 3: Reviewer
  const review = await service.conversationalChat(
    `Review this execution: ${execution.response}`,
    'reviewer-session',
    'You are a quality assurance expert'
  );
  
  return { plan, execution, review };
}
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue: "Failed to connect to Ollama"**
```bash
# Check if Ollama is running
ollama list

# Start Ollama if not running
ollama serve
```

**Issue: "Model not found"**
```bash
# Pull the required model
ollama pull deepseek-r1:latest

# List available models
ollama list
```

**Issue: "Slow response times"**
- Check system resources (RAM, CPU)
- Consider using a smaller model variant
- Adjust `maxTokens` parameter
- Use GPU acceleration if available

**Issue: "Service initialization failed"**
```bash
# Check environment variables
cat .env | grep OLLAMA

# Test Ollama directly
curl http://localhost:11434/api/tags
```

---

## ⚡ Performance Tuning

### Optimal Configuration

```env
# For speed (faster but less accurate)
OLLAMA_TEMPERATURE=0.3
OLLAMA_MAX_TOKENS=1024
OLLAMA_TOP_P=0.8

# For quality (slower but more accurate)
OLLAMA_TEMPERATURE=0.8
OLLAMA_MAX_TOKENS=4096
OLLAMA_TOP_P=0.95

# Balanced (recommended)
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=2048
OLLAMA_TOP_P=0.9
```

### Model Selection

```bash
# Fastest (7B parameters)
ollama pull deepseek-r1:7b

# Balanced (14B parameters)
ollama pull deepseek-r1:14b

# Best quality (32B parameters)
ollama pull deepseek-r1:latest
```

### Conversation History Limits

```javascript
// Limit history to prevent context overflow
service.updateConfig({
  maxHistoryLength: 20  // Keep last 20 messages
});
```

---

## 📊 Monitoring & Metrics

### Real-time Metrics Dashboard

Access metrics programmatically:

```javascript
const metrics = service.getMetrics();
console.log('Performance:', {
  'Total Requests': metrics.totalRequests,
  'Success Rate': metrics.successRate,
  'Avg Response Time': metrics.averageResponseTime + 'ms',
  'Active Sessions': metrics.activeSessions
});
```

### Health Monitoring

```javascript
setInterval(async () => {
  const status = await service.getStatus();
  if (status.status !== 'healthy') {
    console.error('Service unhealthy:', status.error);
    // Trigger alerts or recovery
  }
}, 30000); // Check every 30 seconds
```

---

## 🎯 Next Steps

1. **Explore Examples**: Run the test suite and examples
2. **Integrate with Your App**: Start with simple chat, then add complexity
3. **Monitor Performance**: Track metrics and optimize configuration
4. **Customize**: Create domain-specific prompts and workflows
5. **Scale**: Consider load balancing for production deployments

---

## 📝 Additional Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [DeepSeek Model Info](https://github.com/deepseek-ai)
- [LightDom Platform Docs](./README.md)

---

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on GitHub or submit a pull request.

## 📄 License

This integration is part of the LightDom platform. See LICENSE for details.
