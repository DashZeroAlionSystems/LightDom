# Unified RAG System - Complete Redesign

## Overview

This is a clean, unified RAG (Retrieval-Augmented Generation) system designed from scratch following best practices inspired by [Docling](https://docling-project.github.io/docling/) and enterprise RAG architectures.

## Key Features

### 1. **Docling-Style Document Processing**
- Semantic chunking that preserves document structure
- Support for code, markdown, JSON, and plain text
- Intelligent content type detection
- Metadata extraction and preservation

### 2. **Direct PromptInput Integration**
- React hook `useUnifiedRAG` for seamless UI integration
- Streaming support for real-time responses
- Conversation management

### 3. **Database & Codebase Access**
- Automatic database schema context injection
- Codebase structure awareness
- Project-specific context building

### 4. **Multi-Model Support**
- DeepSeek R1 (recommended for 128K context)
- Qwen 2.5 (Apache 2.0 license, fast)
- Llama 3.3 (large community)
- Easy model switching via configuration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌───────────────────┐  ┌─────────────────────────────────┐ │
│  │   PromptInput     │  │      useUnifiedRAG Hook         │ │
│  │   Component       │──│  - sendPrompt()                 │ │
│  │                   │  │  - streamPrompt()               │ │
│  └───────────────────┘  │  - conversation state           │ │
│                         └─────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ /api/unified-rag
┌─────────────────────────▼───────────────────────────────────┐
│               Unified RAG Service                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DocumentProcessor (Docling-style)                    │   │
│  │  - Semantic chunking                                  │   │
│  │  - Structure preservation                             │   │
│  │  - Content type detection                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ContextBuilder                                       │   │
│  │  - Retrieved docs context                             │   │
│  │  - Database schema context                            │   │
│  │  - Codebase structure context                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LLMClient                                            │   │
│  │  - Ollama (local)                                     │   │
│  │  - DeepSeek API (remote)                              │   │
│  │  - Streaming support                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
   ┌──────▼──────┐              ┌────────▼────────┐
   │  PostgreSQL │              │     Ollama      │
   │  + pgvector │              │  DeepSeek R1    │
   └─────────────┘              └─────────────────┘
```

## Quick Start

### 1. Install Ollama and DeepSeek Model

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull DeepSeek R1 (recommended for RAG)
ollama pull deepseek-r1:latest

# Alternative: Qwen (faster, Apache 2.0)
ollama pull qwen2.5:14b

# Start Ollama
ollama serve
```

### 2. Start the API Server

```bash
# Start the LightDom API (includes unified RAG)
npm run start:dev
```

### 3. Use the Unified RAG API

#### Simple Chat
```bash
curl -X POST http://localhost:3001/api/unified-rag/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How does the RAG system work?"}'
```

#### Streaming Chat
```bash
curl -X POST http://localhost:3001/api/unified-rag/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain the architecture"}'
```

#### Index Documents
```bash
# Index text content
curl -X POST http://localhost:3001/api/unified-rag/index \
  -H "Content-Type: application/json" \
  -d '{"content": "Your document content here", "title": "My Document"}'

# Index codebase
curl -X POST http://localhost:3001/api/unified-rag/index/codebase \
  -H "Content-Type: application/json" \
  -d '{"rootDir": "/path/to/project", "maxFiles": 50}'
```

## Frontend Integration

### Using the React Hook

```tsx
import { useUnifiedRAG } from '@/hooks/useUnifiedRAG';
import { PromptInput } from '@/components/ui';

function RAGChat() {
  const {
    messages,
    isLoading,
    error,
    sendPrompt,
    streamPrompt,
    currentConfig,
    updateConfig,
  } = useUnifiedRAG({
    apiBase: '/api/unified-rag',
    config: {
      mode: 'developer',
      includeCodebase: true,
    },
  });

  const handleSend = async (prompt: string) => {
    // For streaming responses
    await streamPrompt(prompt, (chunk) => {
      console.log('Received chunk:', chunk);
    });
    
    // Or for non-streaming
    // await sendPrompt(prompt);
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <PromptInput
        onSend={handleSend}
        loading={isLoading}
        tokens={[
          { id: 'mode', label: currentConfig.mode, tone: 'accent' },
        ]}
      />
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Chat with RAG (streaming optional) |
| POST | `/chat/stream` | Streaming chat (SSE) |
| POST | `/index` | Index text content |
| POST | `/index/file` | Index uploaded file |
| POST | `/index/codebase` | Index project codebase |
| POST | `/search` | Semantic search |
| GET | `/conversation/:id` | Get conversation history |
| DELETE | `/conversation/:id` | Clear conversation |
| GET | `/health` | Health check |
| GET | `/config` | Get current config |
| POST | `/config` | Update config |
| GET | `/models` | List available models |

### Chat Request Body

```typescript
{
  prompt: string;           // User's message
  conversationId?: string;  // For conversation continuity
  mode?: 'assistant' | 'developer' | 'codebase';
  includeDatabase?: boolean;
  includeCodebase?: boolean;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  topK?: number;
}
```

### Stream Response Events

```typescript
// Context event (sent first)
{ type: 'context', retrieved: Document[] }

// Content chunks
{ type: 'chunk', content: string }

// Completion
{ type: 'done', fullResponse: string, conversationId: string }

// Error
{ type: 'error', error: string }
```

## Model Recommendations

| Model | Context | Speed | License | Best For |
|-------|---------|-------|---------|----------|
| DeepSeek R1 | 128K | Medium | MIT | Long document RAG, reasoning |
| Qwen 2.5 14B | 128K | Fast | Apache 2.0 | Commercial use, general |
| Llama 3.3 70B | 128K | Slow | Meta | Research, customization |

### Switching Models

```bash
# Via API
curl -X POST http://localhost:3001/api/unified-rag/config \
  -H "Content-Type: application/json" \
  -d '{"llm": {"model": "qwen2.5:14b"}}'

# Or via environment
OLLAMA_MODEL=qwen2.5:14b npm run start:dev
```

## Configuration

### Environment Variables

```bash
# LLM Configuration
RAG_LLM_PROVIDER=ollama        # ollama | deepseek-api
OLLAMA_ENDPOINT=http://127.0.0.1:11434
OLLAMA_MODEL=deepseek-r1:latest

# For remote DeepSeek API
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Embedding
EMBEDDING_MODEL=nomic-embed-text

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom
```

## Comparison with Previous RAG Implementation

### Problems with Old System
- Fragmented services (rag-service, enhanced-rag-service, rag-router)
- No structured document processing
- Limited context building
- Complex tool execution patterns
- No clear prompt input integration

### New System Improvements
- Single unified service
- Docling-style document processing
- Multi-source context building (docs + DB + codebase)
- Direct PromptInput hook integration
- Clean API design
- Model flexibility

## Migration Guide

### From `/api/rag/*` to `/api/unified-rag/*`

Old:
```javascript
// Old chat endpoint
POST /api/rag/chat/stream
{
  "messages": [{"role": "user", "content": "..."}],
  "query": "...",
  "topK": 5
}
```

New:
```javascript
// New unified endpoint
POST /api/unified-rag/chat/stream
{
  "prompt": "...",
  "mode": "assistant",
  "includeDatabase": true,
  "includeCodebase": true,
  "topK": 5
}
```

### From `useRagChat` to `useUnifiedRAG`

Old:
```tsx
const { streamChat, healthStatus } = useRagChat();
```

New:
```tsx
const { streamPrompt, health, currentConfig } = useUnifiedRAG({
  config: { mode: 'developer' }
});
```

## Troubleshooting

### Ollama Not Responding
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart if needed
pkill ollama && ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull required model
ollama pull deepseek-r1:latest
```

### Database Connection Issues
```bash
# Check PostgreSQL
psql -d lightdom -c "SELECT 1"

# Ensure vector extension
psql -d lightdom -c "CREATE EXTENSION IF NOT EXISTS vector"
```

## Files

```
services/rag/unified-rag-service.js    # Main service
api/unified-rag-routes.js              # API router
frontend/src/hooks/useUnifiedRAG.ts    # React hook
UNIFIED_RAG_README.md                  # This documentation
```

## Future Enhancements

- [ ] Multimodal support (images via DeepSeek OCR)
- [ ] Hybrid search (keyword + semantic)
- [ ] Document versioning
- [ ] Streaming tool execution
- [ ] Agent mode with planning

---

*This is the recommended RAG implementation for LightDom. The old `/api/rag` and `/api/enhanced-rag` endpoints remain for backwards compatibility but new features should use `/api/unified-rag`.*
