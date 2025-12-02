# Ollama RAG Configuration Guide

## Overview

This guide covers the setup and configuration of Retrieval-Augmented Generation (RAG) using Ollama with the LightDom platform. RAG combines the power of vector search with LLM generation to provide contextually accurate responses based on your document corpus.

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Configuration](#configuration)
5. [Database Schema](#database-schema)
6. [Embedding Models](#embedding-models)
7. [Document Processing](#document-processing)
8. [Retrieval Settings](#retrieval-settings)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LightDom RAG Architecture                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  Documents   │───▶│   Chunker    │───▶│    Embedding Service        │  │
│  │  (PDF, MD,   │    │  (Semantic)  │    │  (nomic-embed-text)         │  │
│  │  Code, etc.) │    └──────────────┘    └──────────────────────────────┘  │
│  └──────────────┘                                    │                      │
│                                                      ▼                      │
│                                        ┌──────────────────────────────┐    │
│                                        │      PostgreSQL + pgvector   │    │
│                                        │      (Vector Store)          │    │
│                                        └──────────────────────────────┘    │
│                                                      ▲                      │
│  ┌──────────────┐    ┌──────────────┐               │                      │
│  │ User Query   │───▶│  Query       │───────────────┘                      │
│  │              │    │  Embedding   │                                       │
│  └──────────────┘    └──────────────┘                                       │
│                                                      │                      │
│                                                      ▼                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  Response    │◀───│  LLM         │◀───│   Context Augmentation       │  │
│  │              │    │ (DeepSeek)   │    │   (Top-K Retrieved Docs)     │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software

1. **Ollama** (v0.3.0 or later)
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama service
   ollama serve
   ```

2. **PostgreSQL** with pgvector extension
   ```bash
   # Install pgvector on PostgreSQL
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Required Models**
   ```bash
   # Pull the embedding model
   ollama pull nomic-embed-text
   
   # Pull the LLM model
   ollama pull deepseek-r1:14b
   
   # Create LightDom custom model
   npm run ollama:create-model
   ```

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 16GB | 32GB+ |
| GPU VRAM | 8GB | 16GB+ |
| Storage | 50GB | 100GB+ |
| PostgreSQL | 14+ | 16+ |

---

## Setup

### 1. Run Database Migration

```bash
# Run the RAG configuration migration
npm run db:migrate

# Or manually run the migration
psql -d dom_space_harvester -f migrations/20251202_ollama_rag_configuration.sql
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# .env file
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=lightdom-deepseek
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSION=768

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Verify Setup

```bash
# Test Ollama connection
curl http://localhost:11434/api/tags

# Test embedding generation
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Hello World"
}'
```

---

## Configuration

### Configuration Files

| File | Purpose |
|------|---------|
| `config/ollama/rag-config.json` | Main RAG configuration |
| `config/ollama/Modelfile.lightdom-deepseek` | LLM Modelfile |
| `config/ollama/Modelfile.lightdom-deepseek-lite` | Lite Modelfile |

### Configuration Structure

```json
{
  "llm": {
    "provider": "ollama",
    "model": "lightdom-deepseek",
    "temperature": 0.7,
    "maxTokens": 4096
  },
  "embedding": {
    "model": "nomic-embed-text",
    "dimension": 768
  },
  "retrieval": {
    "topK": 5,
    "minScore": 0.6,
    "hybridSearch": {
      "enabled": true,
      "semanticWeight": 0.7,
      "keywordWeight": 0.3
    }
  },
  "chunking": {
    "chunkSize": 1000,
    "chunkOverlap": 200
  }
}
```

### Database-Stored Configuration

Configurations are stored in the database for runtime modification:

```sql
-- View active configurations
SELECT * FROM v_active_ollama_configs;

-- Update model temperature
UPDATE ollama_model_configs 
SET temperature = 0.8 
WHERE name = 'lightdom-deepseek';

-- Add custom RAG configuration
INSERT INTO ollama_rag_configs (name, chunk_size, top_k, hybrid_search_enabled)
VALUES ('custom-rag', 1500, 10, true);
```

---

## Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `ollama_model_configs` | LLM model configurations (Modelfile settings) |
| `ollama_rag_configs` | RAG-specific settings |
| `ollama_embedding_configs` | Embedding model settings |
| `rag_documents` | Document chunks with embeddings |
| `rag_query_history` | Query analytics and history |
| `ollama_model_presets` | Pre-configured presets |

### Entity Relationship

```
ollama_model_configs
        │
        ├──── ollama_rag_configs (model_config_id)
        │           │
        │           └──── ollama_embedding_configs (via embedding_model)
        │
        └──── ollama_model_presets (model_config_id)
                    │
                    └──── (rag_config_id, embedding_config_id)

rag_documents
        │
        └──── rag_query_history (retrieved_doc_ids)
```

### Key Columns

#### ollama_model_configs
- `temperature` (0.0-2.0): Controls randomness
- `top_p` (0.0-1.0): Nucleus sampling
- `num_ctx`: Context window size
- `system_prompt`: AI personality/instructions

#### ollama_rag_configs
- `chunk_size`: Document chunk size (tokens)
- `chunk_overlap`: Overlap between chunks
- `top_k`: Number of documents to retrieve
- `min_score`: Minimum relevance score
- `hybrid_search_enabled`: Enable keyword+semantic search

---

## Embedding Models

### Available Models

| Model | Dimensions | Speed | Quality | Use Case |
|-------|-----------|-------|---------|----------|
| `nomic-embed-text` | 768 | Fast | High | General purpose (recommended) |
| `mxbai-embed-large` | 1024 | Medium | Higher | Technical/specialized content |
| `all-minilm` | 384 | Fastest | Good | High-volume, speed-critical |

### Model Selection

```sql
-- Set default embedding model
UPDATE ollama_embedding_configs 
SET is_default = true 
WHERE model_name = 'nomic-embed-text';
```

### Embedding API Usage

```javascript
// Generate embedding via Ollama API
const response = await fetch('http://localhost:11434/api/embed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'nomic-embed-text',
    input: 'Your text here'
  })
});
const { embeddings } = await response.json();
// embeddings[0] is a 768-dimensional vector
```

---

## Document Processing

### Chunking Strategies

1. **Fixed Size** (Default)
   ```json
   {
     "strategy": "fixed",
     "chunkSize": 1000,
     "chunkOverlap": 200
   }
   ```

2. **Semantic Chunking**
   ```json
   {
     "strategy": "semantic",
     "respectBoundaries": ["paragraph", "sentence"],
     "minChunkSize": 100,
     "maxChunkSize": 2000
   }
   ```

3. **Code-Aware Chunking**
   ```json
   {
     "strategy": "code",
     "respectBoundaries": ["function", "class", "method"],
     "preserveStructure": true
   }
   ```

### Indexing Documents

```javascript
// Index a document
await ragService.indexDocument({
  id: 'doc-123',
  namespace: 'documentation',
  title: 'API Guide',
  content: 'Full document content...',
  metadata: {
    source: 'docs/api.md',
    type: 'markdown'
  }
});
```

### Batch Indexing

```bash
# Index all markdown files in docs/
npm run rag:index -- --path ./docs --namespace documentation
```

---

## Retrieval Settings

### Hybrid Search

Combines semantic (vector) search with keyword (BM25) search:

```json
{
  "hybridSearch": {
    "enabled": true,
    "semanticWeight": 0.7,
    "keywordWeight": 0.3,
    "fusionMethod": "reciprocal_rank"
  }
}
```

### Reranking

Improves relevance by re-scoring retrieved documents:

```json
{
  "reranking": {
    "enabled": true,
    "model": "cross-encoder",
    "topN": 3
  }
}
```

### Query Filters

```javascript
// Filter by namespace and metadata
const results = await ragService.query({
  question: 'How do I configure RAG?',
  filters: {
    namespace: 'documentation',
    metadata: { type: 'markdown' },
    dateRange: { start: '2024-01-01' }
  }
});
```

---

## Best Practices

### 1. Chunk Size Selection

| Content Type | Recommended Chunk Size |
|--------------|----------------------|
| Documentation | 800-1000 tokens |
| Source Code | 1500-2000 tokens |
| API References | 500-700 tokens |
| General Text | 1000 tokens |

### 2. Overlap Settings

- **Standard**: 20% of chunk size (e.g., 200 for 1000)
- **High Context**: 30-40% for interconnected content
- **Low Memory**: 10% for large document sets

### 3. Top-K Selection

| Use Case | Recommended Top-K |
|----------|------------------|
| Quick answers | 3-5 |
| Comprehensive research | 8-10 |
| Code assistance | 5-7 |

### 4. Model Temperature

| Task | Temperature |
|------|-------------|
| Factual Q&A | 0.1-0.3 |
| General chat | 0.5-0.7 |
| Creative writing | 0.8-1.0 |
| Code generation | 0.3-0.5 |

---

## Troubleshooting

### Common Issues

#### 1. Low Relevance Scores

**Symptoms**: Retrieved documents have low scores (<0.5)

**Solutions**:
- Increase `chunkOverlap` for better context
- Use smaller `chunkSize` for granular matching
- Ensure embedding model matches indexed documents

#### 2. Slow Retrieval

**Symptoms**: Queries take >1 second

**Solutions**:
- Add pgvector index: `CREATE INDEX USING ivfflat`
- Reduce `topK` value
- Enable query caching

#### 3. Ollama Connection Failed

**Symptoms**: Cannot connect to Ollama API

**Solutions**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# Check firewall/port
netstat -tlnp | grep 11434
```

#### 4. Out of Memory

**Symptoms**: OOM errors during indexing

**Solutions**:
- Reduce `batchSize` in embedding config
- Use smaller embedding model
- Process documents in smaller batches

### Debug Queries

```sql
-- Check document counts by namespace
SELECT * FROM v_rag_document_stats;

-- View recent queries with low scores
SELECT query_text, retrieval_scores, total_time_ms
FROM rag_query_history
WHERE retrieval_scores[1] < 0.6
ORDER BY created_at DESC
LIMIT 10;

-- Check active configurations
SELECT * FROM v_active_ollama_configs;
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rag/query` | Submit RAG query |
| POST | `/api/rag/index` | Index documents |
| GET | `/api/rag/config` | Get current config |
| PUT | `/api/rag/config` | Update config |
| DELETE | `/api/rag/documents/:id` | Delete document |

### Example Query

```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I configure Ollama for RAG?",
    "namespace": "documentation",
    "topK": 5
  }'
```

---

## Related Documentation

- [Ollama Modelfile Configuration](./OLLAMA_MODELFILE_CONFIGURATION.md)
- [Ollama Integration Guide](./OLLAMA_INTEGRATION_GUIDE.md)
- [Ollama MCP Setup](./OLLAMA_MCP_SETUP.md)
- [RAG Service Implementation](../RAG_SERVICE_IMPLEMENTATION_SUMMARY.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-12-02  
**Author**: LightDom Development Team
