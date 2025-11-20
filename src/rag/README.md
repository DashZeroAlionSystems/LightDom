# Fixed RAG System

This directory contains the fixed RAG (Retrieval-Augmented Generation) system with proper Ollama/DeepSeek integration.

## Key Fixes

### 1. Proper Ollama Connection
- Checks Ollama availability before starting
- Auto-pulls required models (nomic-embed-text, deepseek-r1)
- Health monitoring with auto-recovery

### 2. Embedding Model Management
- Verifies embedding model is pulled
- Tests embedding generation
- Fallback handling if models missing

### 3. Connection Pooling
- Efficient resource management
- Retry logic with exponential backoff
- Connection error tracking

### 4. Health Monitoring
- Continuous health checks (every 30s)
- Auto-recovery from connection failures
- Status reporting

## Common Issues & Fixes

### Issue: "Ollama is not available"
**Fix:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

### Issue: "Embedding model not found"
**Fix:**
```bash
# Pull embedding model
ollama pull nomic-embed-text

# Verify
ollama list
```

### Issue: "DeepSeek model not found"
**Fix:**
```bash
# Pull DeepSeek R1 (this is large, ~40GB)
ollama pull deepseek-r1:latest

# Or use smaller version
ollama pull deepseek-r1:7b
```

### Issue: "API key required"
**Solution:**
- For local Ollama: No API key needed
- For remote DeepSeek API: Set `DEEPSEEK_API_KEY` environment variable

## Usage

```typescript
import { getRAGSystem } from './FixedRAGSystem';

// Initialize
const rag = getRAGSystem();
await rag.initialize();

// Generate embeddings
const embeddings = await rag.generateEmbeddings(['hello world']);

// Chat
const response = await rag.chat([
  { role: 'user', content: 'Hello!' }
]);

// Check status
const status = rag.getStatus();
console.log(status);
```

## Environment Variables

```bash
# Ollama configuration
OLLAMA_API_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
OLLAMA_MODEL=deepseek-r1:latest

# DeepSeek API (optional, for remote)
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=your-api-key

# Timeout settings
DEEPSEEK_TIMEOUT=60000
```

## Best Practices

1. **Always initialize before use:**
   ```typescript
   await rag.initialize();
   ```

2. **Handle errors gracefully:**
   ```typescript
   try {
     const result = await rag.chat(messages);
   } catch (error) {
     console.error('Chat failed:', error);
   }
   ```

3. **Monitor health:**
   ```typescript
   rag.on('health-check', (status) => {
     console.log('Health:', status.healthy);
   });
   ```

4. **Use auto-recovery:**
   ```typescript
   rag.on('recovered', () => {
     console.log('RAG system recovered!');
   });
   ```

## Troubleshooting

### Check Ollama is running
```bash
curl http://localhost:11434/api/tags
```

### Check models are pulled
```bash
ollama list
```

### Test embedding generation
```bash
curl http://localhost:11434/api/embeddings \
  -d '{"model":"nomic-embed-text","prompt":"test"}'
```

### Test chat
```bash
curl http://localhost:11434/api/chat \
  -d '{"model":"deepseek-r1:latest","messages":[{"role":"user","content":"hi"}]}'
```

## Integration with Existing RAG

The fixed RAG system can be integrated with existing services:

```typescript
// In services/rag/enhanced-rag-service.js
import { getRAGSystem } from '../../src/rag/FixedRAGSystem';

const fixedRAG = getRAGSystem();
await fixedRAG.initialize();

// Use in place of existing clients
const embeddingClient = {
  embed: (texts) => fixedRAG.generateEmbeddings(texts)
};

const deepseekClient = {
  chat: (messages, options) => fixedRAG.chat(messages, options)
};
```

## Future Enhancements

- [ ] Vector database integration
- [ ] Document chunking strategies
- [ ] Semantic search optimization
- [ ] Multi-model support
- [ ] Caching layer
- [ ] Rate limiting
- [ ] Usage analytics
